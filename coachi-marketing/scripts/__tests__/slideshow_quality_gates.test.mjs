import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import {
  MIN_HOOK_QUALITY_SCORE,
  scoreCoachiHook,
  textSoundsLikeAd
} from "../slideshow_quality_rules.mjs";

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

test("generate_slideshow_topics writes scored hook candidates", async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-hook-quality-"));
  const problemsPath = path.join(tmpDir, "problems.json");
  const outPath = path.join(tmpDir, "topics.json");

  await writeJson(problemsPath, {
    schema_version: 1,
    problems: [
      {
        id: "rp_quality_easy_run",
        source_url: "https://example.com/easy-run",
        exact_words: "My easy runs keep turning into hard runs.",
        problem_type: "easy-run pace drift",
        emotion: "frustrated",
        content_angle: "Easy runs drift when the runner starts slightly too fast.",
        product_angle: "Catch effort drift early.",
        total_score: 18
      }
    ]
  });

  await runNode([
    "scripts/generate_slideshow_topics.mjs",
    "--date",
    "2026-05-14",
    "--limit",
    "1",
    "--problems",
    problemsPath,
    "--out",
    outPath,
    "--disable-hook-dedupe"
  ]);

  const output = JSON.parse(await fs.readFile(outPath, "utf8"));
  const candidate = output.candidates[0];
  assert.equal(output.candidate_count, 1);
  assert.ok(candidate.hook_candidates.length >= 8);
  assert.equal(candidate.selected_hook_quality.passes_quality_gate, true);
  assert.ok(candidate.selected_hook_quality.score >= MIN_HOOK_QUALITY_SCORE);
  assert.equal(candidate.selected_hook_quality.max_score, 70);
  assert.equal(typeof candidate.selected_hook_quality.breakdown.runner_pain_specificity, "number");
  assert.equal(typeof candidate.selected_hook_quality.breakdown.non_marketing_tone, "number");
  assert.ok(["forest", "mountain", "lake"].includes(candidate.visual_world));
  assert.equal(/\b(cue|unlock|discover|data-driven)\b/i.test(candidate.hook), false);
});

test("generate_slideshow_topics rotates visual worlds from latest pack", async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-world-rotation-"));
  const problemsPath = path.join(tmpDir, "problems.json");
  const packsRoot = path.join(tmpDir, "packs");
  const latestPackDir = path.join(packsRoot, "latest", "source");
  await fs.mkdir(latestPackDir, { recursive: true });

  await writeJson(problemsPath, {
    schema_version: 1,
    problems: [
      {
        id: "rp_rotation_easy_run_1",
        source_url: "https://example.com/easy-run-1",
        exact_words: "The run gets hard early.",
        problem_type: "easy-run pace drift",
        emotion: "frustrated",
        content_angle: "Stop making easy runs hard",
        product_angle: "Catch effort drift early.",
        total_score: 18,
        sourced_mistakes: [
          { text: "Starting too fast.", source_url: "https://example.com/1" },
          { text: "Waiting too long to slow down.", source_url: "https://example.com/2" },
          { text: "Letting ego pick pace.", source_url: "https://example.com/3" },
          { text: "Calling medium-hard easy.", source_url: "https://example.com/4" },
          { text: "Trying to rescue the run late.", source_url: "https://example.com/5" }
        ]
      }
    ]
  });

  for (const [previousWorld, expectedWorld] of [["forest", "lake"], ["lake", "mountain"], ["mountain", "forest"]]) {
    const outPath = path.join(tmpDir, `topics-${previousWorld}.json`);
    await writeJson(path.join(latestPackDir, "hook-brief.json"), {
      visual_world: previousWorld
    });

    await runNode([
      "scripts/generate_slideshow_topics.mjs",
      "--date",
      "2026-05-16",
      "--limit",
      "1",
      "--problems",
      problemsPath,
      "--out",
      outPath,
      "--existing-packs-root",
      packsRoot,
      "--disable-hook-dedupe"
    ]);

    const output = JSON.parse(await fs.readFile(outPath, "utf8"));
    assert.equal(output.visual_world_rotation.enabled, true);
    assert.equal(output.visual_world_rotation.previous_world, previousWorld);
    assert.equal(output.visual_world_rotation.start_world, expectedWorld);
    assert.equal(output.candidates[0].visual_world, expectedWorld);
    assert.equal(output.candidates[0].visual_world_rotation.selected_world, expectedWorld);
  }
});

test("shared hook scorer rejects corporate fitness wording", () => {
  const quality = scoreCoachiHook("Unlock your potential with data-driven performance", {
    problem_type: "easy-run pace drift"
  });
  assert.equal(quality.passes_quality_gate, false);
  assert.equal(textSoundsLikeAd("Transform your fitness journey today"), true);
});

test("shared hook scorer keeps generic list hooks below production bar", () => {
  const quality = scoreCoachiHook("Top 5 running rules", {
    problem_type: "data-without-coaching"
  }, {
    source: "tiktok_text_bank"
  });
  assert.equal(quality.passes_quality_gate, false);
  assert.ok(quality.score < MIN_HOOK_QUALITY_SCORE);
});

test("qa_slideshow_pack rejects workout-phase prompt conflicts", async () => {
  const { default: sharp } = await import("sharp");
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-qa-conflict-"));
  const packDir = path.join(tmpDir, "2026-05-14-conflict-pack");
  const sourceDir = path.join(packDir, "slides/source");
  const renderedDir = path.join(packDir, "slides/rendered");
  await fs.mkdir(sourceDir, { recursive: true });
  await fs.mkdir(renderedDir, { recursive: true });

  const slideFiles = [
    "01-hook.png",
    "02-setup.png",
    "03-value.png",
    "04-rule.png",
    "05-cta.png"
  ];
  for (const fileName of slideFiles) {
    const buffer = await sharp({
      create: {
        width: 1080,
        height: 1920,
        channels: 3,
        background: "#202020"
      }
    }).png().toBuffer();
    await fs.writeFile(path.join(sourceDir, fileName), buffer);
    await fs.writeFile(path.join(renderedDir, fileName), buffer);
  }

  await writeJson(path.join(packDir, "render-manifest.json"), {
    base_dir: ".",
    output_dir: "slides/rendered",
    width: 1080,
    height: 1920,
    hybrid_cost_model: "one_ai_hook_six_library_assets",
    source_problem_id: "rp_quality_conflict",
    schema: "how_to_fix_v1",
    emotion: "confused",
    visual_world: "mountain",
    lighting_family: "clear mountain morning light",
    avatar_world_required: true,
    cta_required: true,
    hook_quality: {
      hook: "Stop racing workouts",
      score: 24,
      min_score: 20,
      passes_quality_gate: true
    },
    slides: [
      { slide_number: 1, role: "hook", input_image: "slides/source/01-hook.png", output_file: "01-hook.png", text: "Stop racing workouts", asset_source: "images_2_0", text_position: "center" },
      { slide_number: 2, role: "setup", input_image: "slides/source/02-setup.png", output_file: "02-setup.png", text: "Hard is not always better.", asset_source: "supabase_library", visual_collection: "hills_effort", text_position: "lower_middle" },
      { slide_number: 3, role: "value", input_image: "slides/source/03-value.png", output_file: "03-value.png", text: "Do not race practice.", asset_source: "supabase_library", visual_collection: "hills_effort", text_position: "lower_middle" },
      { slide_number: 4, role: "rule", input_image: "slides/source/04-rule.png", output_file: "04-rule.png", text: "Finish with control.", asset_source: "supabase_library", visual_collection: "hills_effort", text_position: "center" },
      { slide_number: 5, role: "cta", input_image: "slides/source/05-cta.png", output_file: "05-cta.png", text: "Comment if you race reps.", asset_source: "supabase_template", text_position: "center" }
    ]
  });

  await writeJson(path.join(packDir, "source/hook-candidates.json"), {
    schema_version: 1,
    selected_hook: "Stop racing workouts",
    selected_hook_quality: {
      hook: "Stop racing workouts",
      score: 24,
      min_score: 20,
      passes_quality_gate: true
    },
    candidates: Array.from({ length: 8 }, (_, index) => ({
      hook: index === 0 ? "Stop racing workouts" : `Workout mistake ${index}`,
      score: 21,
      min_score: 20,
      passes_quality_gate: true
    }))
  });
  await fs.writeFile(path.join(packDir, "source/hook.txt"), "Stop racing workouts\n");
  await writeJson(path.join(packDir, "source/hook-brief.json"), {
    hook: "Stop racing workouts",
    theme: "workout control",
    source_problem: "The runner turns workouts into races and fades late.",
    cta: "Save this before your next workout.",
    emotion: "confused",
    visual_world: "mountain",
    lighting_family: "clear mountain morning light",
    avatar_world_required: true,
    cta_required: true,
    first_image_prompt_adaptation: "runner cooling down after intervals",
    reddit_background_and_vibe: {
      background: "mountain route after intervals",
      vibe: "cooling down",
      reddit_background: "runner races workouts",
      visual_keywords: ["mountain"],
      avoid: ["watch close-up"]
    },
    background_world_lock: {
      selected_visual_world: "mountain",
      required_background: "mountain route after intervals",
      reference_background_policy: "Reference image controls runner appearance only; its original background is non-transferable.",
      generated_background_rule: "Generate a new mountain background that matches the deck visual world and lighting family.",
      forbidden_background_elements: ["lake", "dense forest route"]
    },
    character_anchor: {
      identity_id: "organic_runner_male_v2",
      reference_image: "content/ads/reference/organic-runner-face-v2-reference.png"
    },
    workout_phase: {
      id: "pre_workout",
      prompt_cue: "show the runner moments before starting",
      moment: "runner preparing before the session starts"
    },
    avatar_variation: {
      watch: "no visible watch",
      top: "black running shirt",
      shorts: "black split shorts",
      angle: "side angle",
      weather: "fresh mountain morning",
      lighting: "clear mountain morning light"
    },
    prompt_compiler: {
      coherence_status: "passed"
    }
  });
  await fs.writeFile(path.join(packDir, "source/images-2-0-hook-prompt.md"), `# Images 2.0 Hook Prompt
Production rule: generate exactly ONE image for slide 1.
Do not create an 8-slide deck.
Reddit Source Context
Workout Phase For This Image
Avatar Variation For This Image
Required Slideshow Spine
Selected visual world: mountain
Background World Lock
Reference image background is non-transferable.
Stop racing workouts
No visible watch. Do not include Apple Watch, Garmin watch, smartwatch, GPS watch.
`);
  await fs.mkdir(path.join(packDir, "copy"), { recursive: true });
  await fs.writeFile(path.join(packDir, "copy/tiktok-caption.txt"), "Stop racing workouts.\n");
  await fs.writeFile(path.join(packDir, "copy/instagram-caption.txt"), "Stop racing workouts.\n");
  await fs.writeFile(path.join(packDir, "copy/hashtags.txt"), "#running #runtok #runningtips #runcoach\n");

  const result = await runNode([
    "scripts/qa_slideshow_pack.mjs",
    "--pack",
    packDir
  ], { expectFailure: true });

  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /workout-phase conflicts/i);
  const qaReport = JSON.parse(await fs.readFile(path.join(packDir, "source/qa-report.json"), "utf8"));
  assert.equal(qaReport.pass, false);
  assert.match(qaReport.reasons[0], /workout-phase conflicts/i);
  assert.ok(qaReport.suggested_fixes.length > 0);
});

test("qa_slideshow_pack rejects full-deck AI image generation", async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-qa-full-ai-"));
  const packDir = path.join(tmpDir, "2026-05-14-full-ai-pack");
  await fs.mkdir(path.join(packDir, "source"), { recursive: true });
  await writeJson(path.join(packDir, "render-manifest.json"), {
    base_dir: ".",
    output_dir: "slides/rendered",
    width: 1080,
    height: 1920,
    hybrid_cost_model: "one_ai_hook_six_library_assets",
    emotion: "confused",
    visual_world: "lake",
    lighting_family: "calm lake daylight",
    avatar_world_required: true,
    cta_required: true,
    slides: [
      { slide_number: 1, role: "hook", input_image: "slides/source/01-hook.png", output_file: "01-hook.png", text: "Easy runs are too hard", asset_source: "images_2_0", text_position: "center" },
      { slide_number: 2, role: "problem", input_image: "slides/source/02-problem.png", output_file: "02-problem.png", text: "You start a little fast.", asset_source: "images_2_0", text_position: "lower_middle" },
      { slide_number: 3, role: "insight_1", input_image: "slides/source/03-insight.png", output_file: "03-insight.png", text: "The effort creeps up.", asset_source: "supabase_library", text_position: "lower_middle" },
      { slide_number: 4, role: "coachi_connection", input_image: "slides/source/04-coachi.png", output_file: "04-coachi.png", text: "Coachi helps catch the drift.", asset_source: "supabase_library", text_position: "lower_middle" },
      { slide_number: 5, role: "cta", input_image: "slides/source/05-cta.png", output_file: "05-cta.png", text: "Save this for your next run.", asset_source: "supabase_template", text_position: "center" }
    ]
  });

  const result = await runNode([
    "scripts/qa_slideshow_pack.mjs",
    "--pack",
    packDir
  ], { expectFailure: true });

  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /exactly one Images 2\.0 hook slide/i);
  const qaReport = JSON.parse(await fs.readFile(path.join(packDir, "source/qa-report.json"), "utf8"));
  assert.equal(qaReport.pass, false);
});

test("qa_slideshow_pack rejects CTA app-proof visuals before the final slide", async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-qa-cta-asset-"));
  const packDir = path.join(tmpDir, "2026-05-14-cta-asset-pack");
  await fs.mkdir(path.join(packDir, "source"), { recursive: true });
  await fs.mkdir(path.join(packDir, "copy"), { recursive: true });

  await writeJson(path.join(packDir, "render-manifest.json"), {
    base_dir: ".",
    output_dir: "slides/rendered",
    width: 1080,
    height: 1920,
    hybrid_cost_model: "one_ai_hook_six_library_assets",
    emotion: "frustrated",
    visual_world: "lake",
    lighting_family: "calm lake daylight",
    avatar_world_required: true,
    cta_required: true,
    hook_quality: {
      hook: "Easy runs feel too hard",
      score: 55,
      min_score: 52,
      passes_quality_gate: true
    },
    slides: [
      { slide_number: 1, role: "hook", input_image: "slides/source/01-hook.png", output_file: "01-hook.png", text: "Easy runs feel too hard", asset_source: "images_2_0", text_position: "center" },
      { slide_number: 2, role: "problem", input_image: "slides/source/02-problem.png", output_file: "02-problem.png", text: "Easy days become workouts.", asset_source: "supabase_library", visual_collection: "lake_calm", text_position: "lower_middle" },
      { slide_number: 3, role: "insight_1", input_image: "slides/source/03-insight.png", output_file: "03-insight.png", text: "Your pace creeps up early.", asset_source: "supabase_library", visual_collection: "lake_calm", text_position: "lower_middle" },
      { slide_number: 4, role: "insight_2", input_image: "slides/source/04-insight.png", output_file: "04-insight.png", text: "Slow should feel controlled.", asset_source: "supabase_library", visual_collection: "lake_calm", text_position: "center" },
      { slide_number: 5, role: "cta", input_image: "slides/source/05-cta.png", output_file: "05-cta.png", text: "Save this for your next easy run.", asset_source: "supabase_template", text_position: "center" }
    ]
  });

  await writeJson(path.join(packDir, "source/hook-candidates.json"), {
    schema_version: 1,
    selected_hook: "Easy runs feel too hard",
    selected_hook_quality: {
      hook: "Easy runs feel too hard",
      score: 55,
      min_score: 52,
      passes_quality_gate: true
    },
    candidates: Array.from({ length: 8 }, (_, index) => ({
      hook: index === 0 ? "Easy runs feel too hard" : `Easy run mistake ${index}`,
      score: 55,
      min_score: 52,
      passes_quality_gate: true
    }))
  });
  await fs.writeFile(path.join(packDir, "source/hook.txt"), "Easy runs feel too hard\n");
  await writeJson(path.join(packDir, "source/hook-brief.json"), {
    hook: "Easy runs feel too hard",
    theme: "easy run control",
    source_problem: "The runner keeps turning easy days into workouts.",
    cta: "Save this for your next easy run.",
    emotion: "frustrated",
    visual_world: "lake",
    lighting_family: "calm lake daylight",
    avatar_world_required: true,
    cta_required: true,
    first_image_prompt_adaptation: "runner holding a relaxed pace during an easy run",
    reddit_background_and_vibe: {
      background: "calm lake path during an easy run",
      vibe: "controlled, honest, slightly frustrated",
      reddit_background: "runner overpaces easy days",
      visual_keywords: ["easy run", "lake path"],
      avoid: ["watch close-up"]
    },
    background_world_lock: {
      selected_visual_world: "lake",
      required_background: "calm lake path during an easy run",
      reference_background_policy: "Reference image controls runner appearance only; its original background is non-transferable.",
      generated_background_rule: "Generate a new lake background that matches the deck visual world and lighting family.",
      allowed_background_context: ["mountain backdrop", "large hill backdrop"],
      forbidden_background_elements: ["dense forest route"]
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
      watch: "no visible watch",
      top: "black running shirt",
      shorts: "black split shorts",
      angle: "three-quarter angle",
      weather: "calm lake daylight",
      lighting: "calm lake daylight"
    },
    prompt_compiler: {
      coherence_status: "passed"
    }
  });
  await fs.writeFile(path.join(packDir, "source/images-2-0-hook-prompt.md"), `# Images 2.0 Hook Prompt
Production rule: generate exactly ONE image for slide 1.
Do not create an 8-slide deck.
Reddit Source Context
Workout Phase For This Image
Avatar Variation For This Image
Required Slideshow Spine
Selected visual world: lake
Background World Lock
Reference image background is non-transferable.
Easy runs feel too hard
No visible watch. Do not include Apple Watch, Garmin watch, smartwatch, GPS watch.
`);
  await fs.writeFile(path.join(packDir, "copy/tiktok-caption.txt"), "Easy runs should feel controlled.\n");
  await fs.writeFile(path.join(packDir, "copy/instagram-caption.txt"), "Easy runs should feel controlled.\n");
  await fs.writeFile(path.join(packDir, "copy/hashtags.txt"), "#running #runtok #easyrun #runningtips\n");
  await writeJson(path.join(packDir, "asset-picklist.json"), {
    slides: [
      { slide_number: 1, role: "hook", text: "Easy runs feel too hard", asset_source: "images_2_0", instruction: { candidate_assets: [] } },
      {
        slide_number: 2,
        role: "problem",
        text: "Easy days become workouts.",
        asset_source: "supabase_library",
        coachi_app_cta: false,
        preferred_asset_ids: [],
        instruction: {
          candidate_assets: [
            {
              id: "coachi_cta_003_phone_image2_48min",
              source_kind: "owned_coachi_phone_ui_cta_image2",
              source_rights: "owned",
              subject_tags: ["app_proof"],
              best_for_slide_roles: ["cta", "app_proof"],
              selection_quality: {
                quality_score: 96,
                visual_match_score: 30,
                freshness_penalty: 0,
                selection_score: 126,
                recent_use_rank: null
              },
              visual_fit_metadata: {
                requested_context: {
                  visual_world: "lake"
                }
              }
            }
          ]
        }
      }
    ]
  });

  const result = await runNode([
    "scripts/qa_slideshow_pack.mjs",
    "--pack",
    packDir
  ], { expectFailure: true });

  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /CTA\/app-proof visual/i);
  const qaReport = JSON.parse(await fs.readFile(path.join(packDir, "source/qa-report.json"), "utf8"));
  assert.equal(qaReport.pass, false);
  assert.match(qaReport.suggested_fixes.join(" "), /final slide only/i);
});

test("prepare_slideshow_assets ranks fresh assets and emits selection quality", async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-asset-quality-"));
  const manifestPath = path.join(tmpDir, "render-manifest.json");
  const usagePath = path.join(tmpDir, "usage-log.json");
  const outPath = path.join(tmpDir, "asset-picklist.json");

  await writeJson(manifestPath, {
    base_dir: ".",
    output_dir: "slides/rendered",
    hybrid_cost_model: "one_ai_hook_six_library_assets",
    slides: [
      {
        slide_number: 1,
        role: "hook",
        asset_source: "images_2_0",
        visual_collection: "details_emotion",
        input_image: "slides/source/01-hook.png",
        output_file: "01-hook.png",
        text: "Hook"
      },
      {
        slide_number: 2,
        role: "setup",
        asset_source: "supabase_library",
        visual_collection: "nature_context",
        input_image: "slides/source/02-setup.png",
        output_file: "02-setup.png",
        text: "Setup"
      }
    ]
  });
  await writeJson(usagePath, {
    schema_version: 1,
    uses: [
      {
        used_at: "2026-05-14T10:00:00.000Z",
        slideshow_id: "previous-pack",
        slide_number: 2,
        asset_id: "nature_context_001"
      }
    ]
  });

  await runNode([
    "scripts/prepare_slideshow_assets.mjs",
    "--manifest",
    manifestPath,
    "--out",
    outPath,
    "--local-library",
    "--usage-log",
    usagePath
  ]);

  const picklist = JSON.parse(await fs.readFile(outPath, "utf8"));
  const slide = picklist.slides.find((item) => item.slide_number === 2);
  const topAsset = slide.instruction.candidate_assets[0];
  assert.notEqual(topAsset.id, "nature_context_001");
  assert.ok(topAsset.selection_quality);
  assert.equal(typeof topAsset.selection_quality.selection_score, "number");
  assert.equal(typeof topAsset.selection_quality.visual_match_score, "number");
  assert.ok(topAsset.visual_fit_metadata.requested_context);
});

test("prepare_slideshow_assets keeps CTA visuals on the final slide", async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-asset-cta-policy-"));
  const manifestPath = path.join(tmpDir, "render-manifest.json");
  const outPath = path.join(tmpDir, "asset-picklist.json");

  await writeJson(manifestPath, {
    base_dir: ".",
    output_dir: "slides/rendered",
    hybrid_cost_model: "one_ai_hook_six_library_assets",
    slides: [
      {
        slide_number: 1,
        role: "hook",
        asset_source: "images_2_0",
        visual_collection: "details_emotion",
        input_image: "slides/source/01-hook.png",
        output_file: "01-hook.png",
        text: "Hook"
      },
      {
        slide_number: 2,
        role: "problem",
        asset_source: "supabase_library",
        visual_collection: "cta_ending",
        preferred_asset_ids: ["coachi_cta_003_phone_image2_48min"],
        input_image: "slides/source/02-problem.png",
        output_file: "02-problem.png",
        text: "This slide should not use app proof."
      },
      {
        slide_number: 3,
        role: "cta",
        asset_source: "supabase_template",
        visual_collection: "cta_ending",
        preferred_asset_ids: ["coachi_cta_003_phone_image2_48min"],
        coachi_app_cta: true,
        input_image: "slides/source/03-cta.png",
        output_file: "03-cta.png",
        text: "Try Coachi if you always run too fast."
      }
    ]
  });

  await runNode([
    "scripts/prepare_slideshow_assets.mjs",
    "--manifest",
    manifestPath,
    "--out",
    outPath,
    "--local-library"
  ]);

  const picklist = JSON.parse(await fs.readFile(outPath, "utf8"));
  const nonFinal = picklist.slides.find((item) => item.slide_number === 2);
  const final = picklist.slides.find((item) => item.slide_number === 3);
  assert.equal(nonFinal.instruction.candidate_assets.length, 0);
  assert.equal(final.instruction.candidate_assets[0].id, "coachi_cta_003_phone_image2_48min");
  assert.equal(final.coachi_app_cta, true);
});
