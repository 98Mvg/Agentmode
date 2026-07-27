import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import { spawn } from "node:child_process";

const PREFLIGHT_SCRIPT = path.resolve("scripts/slideshow_prod_preflight.mjs");
const SCRIPTS_DIR = path.resolve("scripts");

function runNode(args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: options.cwd || process.cwd(),
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("exit", (code) => {
      const result = { code, stdout, stderr };
      if (options.expectFailure) resolve(result);
      else if (code === 0) resolve(result);
      else reject(new Error(`node ${args.join(" ")} exited ${code}\n${stderr || stdout}`));
    });
  });
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function selectedAsset(assetId, world, { cta = false } = {}) {
  return {
    id: assetId,
    source_kind: cta ? "owned_cta_template" : "local",
    source_rights: cta ? "owned" : "approved",
    subject_tags: cta ? ["cta"] : ["runner", world],
    best_for_slide_roles: cta ? ["cta"] : ["setup", "value", "coachi_connection"],
    visual_world_tags: [world],
    route_tags: [world],
    selection_quality: {
      quality_score: cta ? 90 : 84,
      visual_match_score: 30,
      freshness_penalty: 0,
      selection_score: cta ? 115 : 109,
      recent_use_rank: null
    },
    usage: {
      total_uses: 0,
      last_used_at: null,
      slideshow_ids: []
    },
    visual_fit_metadata: {
      requested_context: {
        visual_world: "lake"
      },
      visual_world_tags: [world]
    }
  };
}

async function createInboxPreflightPack({ ctaAssetId = "cta_ending_lake_001", ctaWorld = "lake" } = {}) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-preflight-"));
  const packDir = path.join(tmpDir, "2026-05-17-preflight-stable-pack");
  const sourceDir = path.join(packDir, "slides/source");
  const renderedDir = path.join(packDir, "slides/rendered");
  await fs.mkdir(sourceDir, { recursive: true });
  await fs.mkdir(renderedDir, { recursive: true });
  await fs.mkdir(path.join(packDir, "source"), { recursive: true });
  await fs.mkdir(path.join(packDir, "copy"), { recursive: true });

  const slideFiles = [
    "01-hook.png",
    "02-problem.png",
    "03-insight.png",
    "04-insight.png",
    "05-insight.png",
    "06-coachi.png",
    "07-cta.png"
  ];
  const { default: sharp } = await import("sharp");
  const dummyPng = await sharp({
    create: {
      width: 1080,
      height: 1920,
      channels: 3,
      background: "#000000"
    }
  }).png().toBuffer();
  for (const fileName of slideFiles) {
    await fs.writeFile(path.join(sourceDir, fileName), dummyPng);
    await fs.writeFile(path.join(renderedDir, fileName), dummyPng);
  }

  const usesCoachiAppCta = ctaAssetId.startsWith("coachi_cta_");
  const finalCtaText = usesCoachiAppCta
    ? "Try Coachi if easy runs drift."
    : "Save this for your next easy run.";
  const finalCtaType = usesCoachiAppCta ? "coachi_app_proof" : "save";
  const slides = [
    { slide_number: 1, role: "hook", input_image: "slides/source/01-hook.png", output_file: "01-hook.png", text: "Easy runs drift slowly", asset_source: "images_2_0", visual_collection: "details_emotion", text_position: "center", font_size: 92 },
    { slide_number: 2, role: "problem", input_image: "slides/source/02-problem.png", output_file: "02-problem.png", text: "Your easy run starts fine.", asset_source: "supabase_library", visual_collection: "lake_calm", text_position: "lower_middle", font_size: 76 },
    { slide_number: 3, role: "insight_1", input_image: "slides/source/03-insight.png", output_file: "03-insight.png", text: "Then the pace creeps.", asset_source: "supabase_library", visual_collection: "lake_calm", text_position: "lower_middle", font_size: 76 },
    { slide_number: 4, role: "insight_2", input_image: "slides/source/04-insight.png", output_file: "04-insight.png", text: "The effort follows it.", asset_source: "supabase_library", visual_collection: "lake_calm", text_position: "lower_middle", font_size: 76 },
    { slide_number: 5, role: "insight_3", input_image: "slides/source/05-insight.png", output_file: "05-insight.png", text: "Use a ceiling early.", asset_source: "supabase_library", visual_collection: "lake_calm", text_position: "center", font_size: 76 },
    { slide_number: 6, role: "coachi_connection", input_image: "slides/source/06-coachi.png", output_file: "06-coachi.png", text: "Coachi helps you catch the drift.", asset_source: "supabase_library", visual_collection: "lake_calm", text_position: "center", font_size: 76 },
    {
      slide_number: 7,
      role: "cta",
      input_image: "slides/source/07-cta.png",
      output_file: "07-cta.png",
      text: finalCtaText,
      asset_source: "supabase_template",
      visual_collection: "cta_ending",
      text_position: "center",
      font_size: 76,
      ...(usesCoachiAppCta ? { coachi_app_cta: true, preferred_asset_ids: [ctaAssetId] } : {})
    }
  ];

  await writeJson(path.join(packDir, "render-manifest.json"), {
    base_dir: ".",
    output_dir: "slides/rendered",
    width: 1080,
    height: 1920,
    output_format: "png",
    hybrid_cost_model: "one_ai_hook_six_library_assets",
    source_problem_id: "rp_test_easy_run_drift",
    source_url: "https://www.tiktok.com/@runner/example",
    schema: "easy_run_too_fast_v1",
    format_id: "easy_run_too_fast",
    emotion: "pressured",
    visual_world: "lake",
    lighting_family: "calm lake daylight",
    avatar_world_required: true,
    cta_required: true,
    hook_quality: {
      hook: "Easy runs drift slowly",
      score: 56,
      min_score: 52,
      passes_quality_gate: true
    },
    slides
  });

  const hooks = [
    "Easy runs drift slowly",
    "Your easy run keeps drifting",
    "Slow runs should stay slow",
    "Most easy runs creep up",
    "Easy pace is not fixed",
    "Your watch can pull you fast",
    "Do not chase easy pace",
    "Stop testing easy days"
  ];
  await writeJson(path.join(packDir, "source/hook-candidates.json"), {
    schema_version: 1,
    selected_hook: "Easy runs drift slowly",
    selected_hook_quality: {
      hook: "Easy runs drift slowly",
      score: 56,
      min_score: 52,
      passes_quality_gate: true
    },
    candidates: hooks.map((hook) => ({
      hook,
      score: 56,
      min_score: 52,
      passes_quality_gate: true
    }))
  });
  await fs.writeFile(path.join(packDir, "source/hook.txt"), "Easy runs drift slowly\n");
  await writeJson(path.join(packDir, "source/hook-provenance.json"), {
    generator: "chatgpt_images_2_0",
    mode: "edit_with_reference_image",
    reference_image: "content/ads/reference/organic-runner-face-v2-reference.png",
    reference_images: ["content/ads/reference/organic-runner-face-v2-reference.png"],
    fallback_used: false,
    created_at: "2026-05-17T12:00:00.000Z"
  });
  await writeJson(path.join(packDir, "source/hook-brief.json"), {
    hook: "Easy runs drift slowly",
    theme: "easy run drift",
    source_problem: "The runner keeps drifting from easy to hard.",
    cta: finalCtaText,
    emotion: "pressured",
    visual_world: "lake",
    lighting_family: "calm lake daylight",
    avatar_world_required: true,
    cta_required: true,
    first_image_prompt_adaptation: "runner holding a controlled easy pace on a lake path",
    reddit_background_and_vibe: {
      background: "calm lake path during an easy run",
      vibe: "controlled and honest",
      reddit_background: "runner overpaces easy days",
      visual_keywords: ["easy run", "lake path"],
      avoid: ["watch close-up"]
    },
    background_world_lock: {
      selected_visual_world: "lake",
      required_background: "calm lake path during an easy run",
      reference_background_policy: "Reference image controls runner appearance only; its original background is non-transferable.",
      generated_background_rule: "Generate a new lake background that matches the deck visual world and lighting family.",
      allowed_background_context: ["distant mountain backdrop"],
      forbidden_background_elements: ["primary mountain route", "dense forest route"]
    },
    character_anchor: {
      identity_id: "organic_runner_male_v2",
      reference_image: "content/ads/reference/organic-runner-face-v2-reference.png"
    },
    workout_phase: {
      id: "during_workout",
      prompt_cue: "show the runner during a controlled easy run",
      moment: "mid-run on a quiet path"
    },
    avatar_variation: {
      watch: "visible Apple Watch-style smartwatch on one wrist",
      watch_brand_family: "Apple Watch",
      watch_detail_rule: "rectangular Apple Watch-style running watch silhouette, small in-frame, no readable screen UI, no Apple logo, no watch-checking pose, never a wrist close-up",
      top: "black running shirt",
      shorts: "black split shorts",
      angle: "three-quarter angle",
      weather: "calm lake daylight",
      lighting: "calm lake daylight"
    },
    prompt_compiler: {
      coherence_status: "passed",
      selected_by: "test_fixture"
    }
  });
  await fs.writeFile(path.join(packDir, "source/images-2-0-hook-prompt.md"), `# Images 2.0 Hook Prompt
Production rule: generate exactly ONE image for slide 1.
Do not create an 8-slide deck.
Reddit Source Context
Workout Phase For This Image
Avatar Variation For This Image
Visible Apple Watch-style or Garmin-style running watch. No readable screen UI, no visible logos, no wrist close-up, no watch-checking pose.
Required Slideshow Spine
Selected visual world: lake
Background World Lock
Reference image background is non-transferable.
Easy runs drift slowly
`);
  await writeJson(path.join(packDir, "source/slideshow.json"), {
    schema_version: 1,
    slideshow_id: path.basename(packDir),
    format_id: "easy_run_too_fast",
    schema: "easy_run_too_fast_v1",
    topic: "Easy run drift",
    selected_hook: "Easy runs drift slowly",
    hook_score: 56,
    target_audience: "beginner runners / overpacers",
    source_problem: {
      id: "rp_test_easy_run_drift",
      problem_type: "easy-run pace drift",
      source_url: "https://www.tiktok.com/@runner/example"
    },
    visual_system: {
      emotion: "pressured",
      visual_world: "lake",
      lighting: "calm lake daylight",
      workout_phase: "during_workout",
      hybrid_strategy: "slide_1_ai_slides_2_6_library_final_branded_template"
    },
    slides: slides.map((slide) => ({
      slide_number: slide.slide_number,
      role: slide.role,
      text: slide.text,
      visual_direction: `${slide.role} lake calm lake daylight clean negative space`,
      image_query: `${slide.role} lake calm lake daylight runner`,
      image_source_preference: slide.slide_number === 1 ? "ai" : (slide.slide_number === 7 ? "branded_template" : "library"),
      text_position: slide.text_position,
      font_size: slide.font_size,
      cta_type: slide.slide_number === 7 ? finalCtaType : null
    })),
    caption: "Easy runs usually drift slowly. Catch it early and keep the day repeatable.",
    hashtags: ["#running", "#runtok", "#easyrun", "#runningtips"],
    qa_status: "pending"
  });

  await fs.writeFile(path.join(packDir, "copy/tiktok-caption.txt"), "Easy runs usually drift slowly. Catch it early.\n");
  await fs.writeFile(path.join(packDir, "copy/instagram-caption.txt"), "Easy runs usually drift slowly. Catch it early.\n");
  await fs.writeFile(path.join(packDir, "copy/hashtags.txt"), "#running #runtok #easyrun #runningtips\n");
  await fs.writeFile(path.join(packDir, "copy/tiktok-postiz-caption.txt"), "Easy runs usually drift slowly. Catch it early.\n\n#running #runtok #easyrun #runningtips\n");

  const assetIds = [
    "lake_calm_001",
    "lake_calm_002",
    "lake_calm_003",
    "lake_calm_004",
    "lake_calm_005",
    ctaAssetId
  ];
  await writeJson(path.join(packDir, "asset-picklist.json"), {
    slides: [
      { slide_number: 1, role: "hook", text: slides[0].text, asset_source: "images_2_0", instruction: { candidate_assets: [] } },
      ...slides.slice(1).map((slide, index) => ({
        slide_number: slide.slide_number,
        role: slide.role,
        text: slide.text,
        asset_source: slide.asset_source,
        ...(slide.coachi_app_cta ? { coachi_app_cta: true, preferred_asset_ids: [ctaAssetId] } : {}),
        instruction: {
          candidate_assets: [
            selectedAsset(assetIds[index], index === 5 ? ctaWorld : "lake", { cta: index === 5 })
          ]
        }
      }))
    ]
  });
  await writeJson(path.join(packDir, "materialize-report.json"), {
    generated_at: "2026-05-17T12:00:00.000Z",
    dry_run: false,
    results: slides.slice(1).map((slide, index) => ({
      slide_number: slide.slide_number,
      role: slide.role,
      status: "materialized",
      selected_asset_id: assetIds[index],
      selected_source_rights: index === 5 ? "owned" : "approved",
      selected_source_kind: "local",
      expected_input_image: path.join(sourceDir, slide.input_image.split("/").pop())
    }))
  });

  return packDir;
}

test("slideshow_prod_preflight passes inbox-file packs after rerunning production QA", async () => {
  const packDir = await createInboxPreflightPack();

  const result = await runNode([
    "scripts/slideshow_prod_preflight.mjs",
    "--pack",
    packDir,
    "--publish-mode",
    "inbox-file"
  ]);

  const output = JSON.parse(result.stdout);
  assert.equal(output.ok, true);
  assert.equal(output.publish_mode, "inbox-file");
  assert.equal(output.pack_readiness.visual_world, "lake");
  assert.equal(output.qa.production, true);
  const qaReport = JSON.parse(await fs.readFile(path.join(packDir, "source/qa-report.json"), "utf8"));
  assert.equal(qaReport.pass, true);
});

test("slideshow_prod_preflight ignores cancelled scheduled rows for inbox-file packs", async () => {
  const packDir = await createInboxPreflightPack();
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-preflight-cwd-"));
  await fs.symlink(SCRIPTS_DIR, path.join(cwd, "scripts"), "dir");
  await writeJson(path.join(cwd, "inputs/performance/scheduled-slideshows.json"), {
    schema_version: 1,
    updated: "2026-06-08T18:46:24.680Z",
    posts: [
      {
        slideshow_id: path.basename(packDir),
        platform: "tiktok",
        account_id: "watch_integration",
        publish_mode: "direct-public",
        status: "cancelled_direct_public_wrong_mode"
      }
    ]
  });

  const result = await runNode([
    PREFLIGHT_SCRIPT,
    "--pack",
    packDir,
    "--publish-mode",
    "inbox-file"
  ], { cwd });

  const output = JSON.parse(result.stdout);
  assert.equal(output.ok, true);
  assert.equal(output.duplicate.scheduled_before, false);
});

test("slideshow_prod_preflight blocks semantic duplicates of public packs", async () => {
  const packDir = await createInboxPreflightPack();
  const oldSlideshowId = "2026-05-01-main-01-old-easy-run-drift";
  await writeJson(path.join(path.dirname(packDir), oldSlideshowId, "source/slideshow.json"), {
    slideshow_id: oldSlideshowId,
    topic: "Why an easy run keeps drifting harder",
    selected_hook: "Your easy run drifts harder",
    source_problem: {
      id: "rp_old_easy_run_drift",
      problem_type: "easy-run pace drift",
      exact_words: "My easy run keeps drifting harder even when I start slowly."
    }
  });

  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-preflight-semantic-cwd-"));
  await fs.symlink(SCRIPTS_DIR, path.join(cwd, "scripts"), "dir");
  await writeJson(path.join(cwd, "inputs/performance/posted-slideshows.json"), {
    schema_version: 1,
    posts: [
      {
        slideshow_id: oldSlideshowId,
        platform: "tiktok",
        account_profile: "main",
        hook: "Your easy run drifts harder",
        source_problem_id: "rp_old_easy_run_drift",
        url: "https://www.tiktok.com/@example/video/123"
      }
    ]
  });

  const result = await runNode([
    PREFLIGHT_SCRIPT,
    "--pack",
    packDir,
    "--publish-mode",
    "inbox-file"
  ], { cwd, expectFailure: true });

  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /semantic duplicate/i);
  assert.match(result.stderr, new RegExp(oldSlideshowId));
});

test("slideshow_prod_preflight allows shared words across distinct concept types", async () => {
  const packDir = await createInboxPreflightPack();
  const currentPath = path.join(packDir, "source/slideshow.json");
  const current = JSON.parse(await fs.readFile(currentPath, "utf8"));
  current.source_problem.problem_type = "apple watch ultra action button";
  await writeJson(currentPath, current);

  const oldSlideshowId = "2026-05-01-watch-01-old-heart-rate-alerts";
  await writeJson(path.join(path.dirname(packDir), oldSlideshowId, "source/slideshow.json"), {
    slideshow_id: oldSlideshowId,
    topic: "Apple Watch heart rate alerts before a run",
    selected_hook: "Set Apple Watch alerts before running",
    account_profile: "watch",
    source_problem: {
      id: "rp_old_heart_rate_alerts",
      problem_type: "apple watch heart rate alerts",
      exact_words: "I want Apple Watch alerts during a run."
    }
  });

  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-preflight-concept-cwd-"));
  await fs.symlink(SCRIPTS_DIR, path.join(cwd, "scripts"), "dir");
  await writeJson(path.join(cwd, "inputs/performance/posted-slideshows.json"), {
    schema_version: 1,
    posts: [{
      slideshow_id: oldSlideshowId,
      platform: "tiktok",
      account_profile: "watch",
      hook: "Set Apple Watch alerts before running",
      source_problem_id: "rp_old_heart_rate_alerts"
    }]
  });

  const result = await runNode([
    PREFLIGHT_SCRIPT,
    "--pack",
    packDir,
    "--publish-mode",
    "inbox-file"
  ], { cwd });

  const output = JSON.parse(result.stdout);
  assert.equal(output.ok, true);
  assert.deepEqual(output.duplicate.semantic_posted_matches, []);
});

test("slideshow_prod_preflight only allows scheduled repair with explicit flag", async () => {
  const packDir = await createInboxPreflightPack();
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-preflight-repair-cwd-"));
  await fs.symlink(SCRIPTS_DIR, path.join(cwd, "scripts"), "dir");
  await writeJson(path.join(cwd, "inputs/performance/scheduled-slideshows.json"), {
    schema_version: 1,
    updated: "2026-06-14T18:00:00.000Z",
    posts: [
      {
        slideshow_id: path.basename(packDir),
        platform: "tiktok",
        account_id: "main_integration",
        publish_mode: "inbox-file",
        status: "SEND_TO_USER_INBOX"
      }
    ]
  });

  const blocked = await runNode([
    PREFLIGHT_SCRIPT,
    "--pack",
    packDir,
    "--publish-mode",
    "inbox-file"
  ], { cwd, expectFailure: true });
  assert.notEqual(blocked.code, 0);
  assert.match(blocked.stderr, /already scheduled on tiktok/i);

  const allowed = await runNode([
    PREFLIGHT_SCRIPT,
    "--pack",
    packDir,
    "--publish-mode",
    "inbox-file",
    "--allow-already-scheduled"
  ], { cwd });
  const output = JSON.parse(allowed.stdout);
  assert.equal(output.ok, true);
  assert.equal(output.duplicate.scheduled_before, true);
});

test("slideshow_prod_preflight reruns QA and rejects stale cross-world inbox packs", async () => {
  const packDir = await createInboxPreflightPack({
    ctaAssetId: "coachi_cta_013_phone_mountain_morning_51min",
    ctaWorld: "mountain"
  });
  await writeJson(path.join(packDir, "source/qa-report.json"), {
    ok: true,
    pass: true,
    production: true,
    generated_at: "2026-05-17T00:00:00.000Z"
  });

  const result = await runNode([
    "scripts/slideshow_prod_preflight.mjs",
    "--pack",
    packDir,
    "--publish-mode",
    "inbox-file"
  ], { expectFailure: true });

  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /conflicts with lake world/i);
  const qaReport = JSON.parse(await fs.readFile(path.join(packDir, "source/qa-report.json"), "utf8"));
  assert.equal(qaReport.pass, false);
});
