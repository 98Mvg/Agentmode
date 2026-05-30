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

async function writeMinimalProductionQaPack({ packDir, slides, hook = "Easy runs feel too hard" }) {
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
      hook,
      score: 56,
      min_score: 52,
      passes_quality_gate: true
    },
    slides
  });
  await writeJson(path.join(packDir, "source/slideshow.json"), {
    slideshow_id: path.basename(packDir),
    format_id: "easy_run_too_fast",
    selected_hook: hook,
    target_audience: "beginner runners",
    visual_system: {
      emotion: "frustrated",
      visual_world: "lake",
      lighting: "calm lake daylight"
    },
    slides: slides.map((slide) => ({
      slide_number: slide.slide_number,
      role: slide.role,
      text: slide.text,
      visual_direction: "calm lake running visual",
      image_query: "runner on calm lake path",
      image_source_preference: slide.slide_number === 1
        ? "ai"
        : slide.role === "cta"
          ? "branded_template"
          : "library"
    }))
  });
  await writeJson(path.join(packDir, "source/hook-candidates.json"), {
    schema_version: 1,
    selected_hook: hook,
    selected_hook_quality: {
      hook,
      score: 56,
      min_score: 52,
      passes_quality_gate: true
    },
    candidates: Array.from({ length: 8 }, (_, index) => ({
      hook: index === 0 ? hook : `Easy run control ${index}`,
      score: 56,
      min_score: 52,
      passes_quality_gate: true
    }))
  });
  await fs.writeFile(path.join(packDir, "source/hook.txt"), `${hook}\n`);
  await writeJson(path.join(packDir, "source/hook-brief.json"), {
    hook,
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
No visible watch. Do not include Apple Watch, Garmin watch, smartwatch, GPS watch, wrist wearable, or visible screen-on-wrist.
Required Slideshow Spine
Selected visual world: lake
Background World Lock
Reference image background is non-transferable.
${hook}
No visible watch. Do not include Apple Watch, Garmin watch, smartwatch, GPS watch.
`);
  await fs.writeFile(path.join(packDir, "copy/tiktok-caption.txt"), "Easy runs should feel controlled.\n");
  await fs.writeFile(path.join(packDir, "copy/instagram-caption.txt"), "Easy runs should feel controlled.\n");
  await fs.writeFile(path.join(packDir, "copy/hashtags.txt"), "#running #runtok #easyrun #runningtips\n");
}

test("generate_slideshow_topics writes scored hook candidates", async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-hook-quality-"));
  const problemsPath = path.join(tmpDir, "problems.json");
  const outPath = path.join(tmpDir, "topics.json");
  const packsRoot = path.join(tmpDir, "packs");
  const postedPath = path.join(tmpDir, "posted-slideshows.json");
  await fs.mkdir(packsRoot, { recursive: true });
  await writeJson(postedPath, { schema_version: 1, posts: [] });

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
    "--existing-packs-root",
    packsRoot,
    "--posted-registry",
    postedPath,
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
    await writeJson(path.join(packsRoot, "latest", "source/qa-report.json"), {
      ok: true,
      pass: true,
      production: true
    });
    await writeJson(path.join(packsRoot, "newer-failed-draft", "source/hook-brief.json"), {
      visual_world: expectedWorld
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
    assert.equal(output.visual_world_rotation.previous_world_status, "production_qa_passed");
    assert.match(output.visual_world_rotation.previous_world_qa_report, /source\/qa-report\.json$/);
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
  assert.equal(scoreCoachiHook("Why you shuffle on easy runs", {
    problem_type: "easy-run form breakdown"
  }).passes_quality_gate, false);
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
  const dummyPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+XkN8AAAAASUVORK5CYII=",
    "base64"
  );
  for (const fileName of slideFiles) {
    await fs.writeFile(path.join(sourceDir, fileName), dummyPng);
    await fs.writeFile(path.join(renderedDir, fileName), dummyPng);
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

test("qa_slideshow_pack rejects reused production library visuals", async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-qa-reused-asset-"));
  const packDir = path.join(tmpDir, "2026-05-26-reused-asset-pack");
  await fs.mkdir(path.join(packDir, "source"), { recursive: true });
  await fs.mkdir(path.join(packDir, "copy"), { recursive: true });

  const slides = [
    { slide_number: 1, role: "hook", input_image: "slides/source/01-hook.png", output_file: "01-hook.png", text: "Easy runs keep drifting", asset_source: "images_2_0", text_position: "center" },
    { slide_number: 2, role: "problem", input_image: "slides/source/02-problem.png", output_file: "02-problem.png", text: "Your easy run starts too hard.", asset_source: "supabase_library", visual_collection: "lake_calm", text_position: "lower_middle" },
    { slide_number: 3, role: "insight_1", input_image: "slides/source/03-insight.png", output_file: "03-insight.png", text: "The effort keeps climbing.", asset_source: "supabase_library", visual_collection: "lake_calm", text_position: "lower_middle" },
    { slide_number: 4, role: "insight_2", input_image: "slides/source/04-insight.png", output_file: "04-insight.png", text: "A ceiling protects tomorrow.", asset_source: "supabase_library", visual_collection: "lake_calm", text_position: "lower_middle" },
    { slide_number: 5, role: "insight_3", input_image: "slides/source/05-insight.png", output_file: "05-insight.png", text: "Save speed for hard days.", asset_source: "supabase_library", visual_collection: "lake_calm", text_position: "lower_middle" },
    { slide_number: 6, role: "coachi_connection", input_image: "slides/source/06-coachi.png", output_file: "06-coachi.png", text: "Coachi can warn when easy turns hard.", asset_source: "supabase_library", visual_collection: "lake_calm", text_position: "lower_middle" },
    { slide_number: 7, role: "cta", input_image: "slides/source/07-cta.png", output_file: "07-cta.png", text: "Save this for your next easy run.", asset_source: "supabase_template", visual_collection: "cta_ending", text_position: "center" }
  ];

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
      hook: "Easy runs keep drifting",
      score: 56,
      min_score: 52,
      passes_quality_gate: true
    },
    slides
  });
  await writeJson(path.join(packDir, "source/slideshow.json"), {
    slideshow_id: "2026-05-26-reused-asset-pack",
    format_id: "easy_run_too_fast",
    selected_hook: "Easy runs keep drifting",
    target_audience: "beginner runners",
    visual_system: {
      emotion: "frustrated",
      visual_world: "lake",
      lighting: "calm lake daylight"
    },
    slides: slides.map((slide) => ({
      slide_number: slide.slide_number,
      role: slide.role,
      text: slide.text,
      visual_direction: "calm lake running visual",
      image_query: "runner on calm lake path",
      image_source_preference: slide.slide_number === 1
        ? "ai"
        : slide.slide_number === 7
          ? "branded_template"
          : "library"
    }))
  });
  await writeJson(path.join(packDir, "source/hook-candidates.json"), {
    schema_version: 1,
    selected_hook: "Easy runs keep drifting",
    selected_hook_quality: {
      hook: "Easy runs keep drifting",
      score: 56,
      min_score: 52,
      passes_quality_gate: true
    },
    candidates: Array.from({ length: 8 }, (_, index) => ({
      hook: index === 0 ? "Easy runs keep drifting" : `Easy run drift ${index}`,
      score: 56,
      min_score: 52,
      passes_quality_gate: true
    }))
  });
  await fs.writeFile(path.join(packDir, "source/hook.txt"), "Easy runs keep drifting\n");
  await writeJson(path.join(packDir, "source/hook-brief.json"), {
    hook: "Easy runs keep drifting",
    theme: "easy run drift",
    source_problem: "The runner keeps turning easy runs into harder efforts.",
    cta: "Save this for your next easy run.",
    emotion: "frustrated",
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
No visible watch. Do not include Apple Watch, Garmin watch, smartwatch, GPS watch, wrist wearable, or visible screen-on-wrist.
Required Slideshow Spine
Selected visual world: lake
Background World Lock
Reference image background is non-transferable.
Easy runs keep drifting
No visible watch. Do not include Apple Watch, Garmin watch, smartwatch, GPS watch.
`);
  await fs.writeFile(path.join(packDir, "copy/tiktok-caption.txt"), "Easy runs usually drift slowly.\n");
  await fs.writeFile(path.join(packDir, "copy/instagram-caption.txt"), "Easy runs usually drift slowly.\n");
  await fs.writeFile(path.join(packDir, "copy/hashtags.txt"), "#running #runtok #easyrun #runningtips\n");
  await writeJson(path.join(packDir, "asset-picklist.json"), {
    slides: [
      { slide_number: 1, role: "hook", text: "Easy runs keep drifting", asset_source: "images_2_0", instruction: { candidate_assets: [] } },
      {
        slide_number: 2,
        role: "problem",
        text: "Your easy run starts too hard.",
        asset_source: "supabase_library",
        instruction: {
          rotation_policy: {
            max_uses_per_asset_per_30_days: 2,
            max_reuse_in_last_posts: 10,
            prefer_zero_use_assets: true
          },
          candidate_assets: [
            {
              id: "lake_calm_009",
              source_kind: "supabase_visual_library",
              source_rights: "approved",
              subject_tags: ["lake", "easy_run"],
              selection_quality: {
                quality_score: 92,
                visual_match_score: 30,
                freshness_penalty: 30,
                selection_score: 92,
                recent_use_rank: 11
              },
              usage: {
                total_uses: 3,
                last_used_at: "2026-05-20T10:26:30.950Z",
                slideshow_ids: ["pack-a", "pack-b", "pack-c"]
              },
              visual_fit_metadata: {
                visual_world_tags: ["lake"],
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
    "--production",
    "--pack",
    packDir
  ], { expectFailure: true });

  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /exceeds reuse policy/i);
  const qaReport = JSON.parse(await fs.readFile(path.join(packDir, "source/qa-report.json"), "utf8"));
  assert.equal(qaReport.pass, false);
  assert.match(qaReport.suggested_fixes.join(" "), /fresh visual-library assets/i);
});

test("qa_slideshow_pack rejects owned generated assets on production middle slides", async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-qa-owned-generated-"));
  const packDir = path.join(tmpDir, "2026-05-27-owned-generated-middle-pack");
  const slides = [
    { slide_number: 1, role: "hook", input_image: "slides/source/01-hook.png", output_file: "01-hook.png", text: "Easy runs feel too hard", asset_source: "images_2_0", text_position: "center" },
    { slide_number: 2, role: "problem", input_image: "slides/source/02-problem.png", output_file: "02-problem.png", text: "Easy days become workouts.", asset_source: "supabase_library", visual_collection: "lake_calm", text_position: "lower_middle" },
    { slide_number: 3, role: "insight_1", input_image: "slides/source/03-insight.png", output_file: "03-insight.png", text: "Your pace creeps up early.", asset_source: "supabase_library", visual_collection: "lake_calm", text_position: "lower_middle" },
    { slide_number: 4, role: "insight_2", input_image: "slides/source/04-insight.png", output_file: "04-insight.png", text: "Slow should feel controlled.", asset_source: "supabase_library", visual_collection: "lake_calm", text_position: "center" },
    { slide_number: 5, role: "insight_3", input_image: "slides/source/05-insight.png", output_file: "05-insight.png", text: "Save speed for hard days.", asset_source: "supabase_library", visual_collection: "lake_calm", text_position: "lower_middle" },
    { slide_number: 6, role: "coachi_connection", input_image: "slides/source/06-coachi.png", output_file: "06-coachi.png", text: "Coachi helps catch effort drift.", asset_source: "supabase_library", visual_collection: "lake_calm", text_position: "lower_middle" },
    { slide_number: 7, role: "cta", input_image: "slides/source/07-cta.png", output_file: "07-cta.png", text: "Save this for your next easy run.", asset_source: "supabase_template", visual_collection: "cta_ending", text_position: "center" }
  ];
  await writeMinimalProductionQaPack({ packDir, slides });
  await writeJson(path.join(packDir, "asset-picklist.json"), {
    slides: [
      { slide_number: 1, role: "hook", text: "Easy runs feel too hard", asset_source: "images_2_0", instruction: { candidate_assets: [] } },
      {
        slide_number: 2,
        role: "problem",
        text: "Easy days become workouts.",
        asset_source: "supabase_library",
        instruction: {
          candidate_assets: [
            {
              id: "lake_calm_owned_generated_001",
              source_kind: "supabase_visual_library",
              original_source_kind: "owned_generated_visual_library",
              source_rights: "owned",
              subject_tags: ["lake", "easy_run"],
              selection_quality: {
                quality_score: 96,
                visual_match_score: 35,
                freshness_penalty: 0,
                selection_score: 131,
                recent_use_rank: null
              },
              usage: {
                total_uses: 0,
                slideshow_ids: []
              },
              visual_fit_metadata: {
                visual_world_tags: ["lake"],
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
    "--production",
    "--pack",
    packDir
  ], { expectFailure: true });

  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /owned_generated_visual_library/i);
  const qaReport = JSON.parse(await fs.readFile(path.join(packDir, "source/qa-report.json"), "utf8"));
  assert.equal(qaReport.pass, false);
  assert.match(qaReport.reasons.join(" "), /Refresh\/upload Pinterest\/Supabase library public URLs/i);
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
No visible watch. Do not include Apple Watch, Garmin watch, smartwatch, GPS watch, wrist wearable, or visible screen-on-wrist.
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

test("qa_slideshow_pack rejects cross-world CTA assets", async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-qa-cross-world-"));
  const packDir = path.join(tmpDir, "2026-05-17-cross-world-pack");
  await fs.mkdir(path.join(packDir, "source"), { recursive: true });
  await fs.mkdir(path.join(packDir, "copy"), { recursive: true });
  const sourceDir = path.join(packDir, "slides/source");
  const renderedDir = path.join(packDir, "slides/rendered");
  await fs.mkdir(sourceDir, { recursive: true });
  await fs.mkdir(renderedDir, { recursive: true });
  const slideFiles = [
    "01-hook.png",
    "02-problem.png",
    "03-insight.png",
    "04-insight.png",
    "05-insight.png",
    "06-coachi.png",
    "07-cta.png"
  ];
  const dummyPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+XkN8AAAAASUVORK5CYII=",
    "base64"
  );
  for (const fileName of slideFiles) {
    await fs.writeFile(path.join(sourceDir, fileName), dummyPng);
    await fs.writeFile(path.join(renderedDir, fileName), dummyPng);
  }

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
      hook: "Easy runs drift slowly",
      score: 56,
      min_score: 52,
      passes_quality_gate: true
    },
    slides: [
      { slide_number: 1, role: "hook", input_image: "slides/source/01-hook.png", output_file: "01-hook.png", text: "Easy runs drift slowly", asset_source: "images_2_0", text_position: "center" },
      { slide_number: 2, role: "problem", input_image: "slides/source/02-problem.png", output_file: "02-problem.png", text: "You start a little fast.", asset_source: "supabase_library", visual_collection: "lake_calm", text_position: "lower_middle" },
      { slide_number: 3, role: "insight_1", input_image: "slides/source/03-insight.png", output_file: "03-insight.png", text: "The drift adds up.", asset_source: "supabase_library", visual_collection: "lake_calm", text_position: "lower_middle" },
      { slide_number: 4, role: "insight_2", input_image: "slides/source/04-insight.png", output_file: "04-insight.png", text: "A ceiling keeps it honest.", asset_source: "supabase_library", visual_collection: "lake_calm", text_position: "lower_middle" },
      { slide_number: 5, role: "insight_3", input_image: "slides/source/05-insight.png", output_file: "05-insight.png", text: "Save the work for hard days.", asset_source: "supabase_library", visual_collection: "lake_calm", text_position: "lower_middle" },
      { slide_number: 6, role: "coachi_connection", input_image: "slides/source/06-coachi.png", output_file: "06-coachi.png", text: "Coachi helps catch the drift.", asset_source: "supabase_library", visual_collection: "lake_calm", text_position: "lower_middle" },
      {
        slide_number: 7,
        role: "cta",
        input_image: "slides/source/07-cta.png",
        output_file: "07-cta.png",
        text: "Try Coachi if you always run too fast.",
        asset_source: "supabase_template",
        visual_collection: "cta_ending",
        preferred_asset_ids: ["coachi_cta_013_phone_mountain_morning_51min"],
        coachi_app_cta: true,
        text_position: "center"
      }
    ]
  });

  await writeJson(path.join(packDir, "source/hook-candidates.json"), {
    schema_version: 1,
    selected_hook: "Easy runs drift slowly",
    selected_hook_quality: {
      hook: "Easy runs drift slowly",
      score: 56,
      min_score: 52,
      passes_quality_gate: true
    },
    candidates: Array.from({ length: 8 }, (_, index) => ({
      hook: index === 0 ? "Easy runs drift slowly" : `Easy run drift ${index}`,
      score: 56,
      min_score: 52,
      passes_quality_gate: true
    }))
  });
  await fs.writeFile(path.join(packDir, "source/hook.txt"), "Easy runs drift slowly\n");
  await writeJson(path.join(packDir, "source/hook-brief.json"), {
    hook: "Easy runs drift slowly",
    theme: "easy run drift",
    source_problem: "The runner keeps drifting from easy to hard.",
    cta: "Try Coachi if you always run too fast.",
    emotion: "frustrated",
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
      avoid: ["mountain route"]
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
No visible watch. Do not include Apple Watch, Garmin watch, smartwatch, GPS watch, wrist wearable, or visible screen-on-wrist.
Required Slideshow Spine
Selected visual world: lake
Background World Lock
Reference image background is non-transferable.
Easy runs drift slowly
`);
  await fs.writeFile(path.join(packDir, "copy/tiktok-caption.txt"), "Easy runs usually drift slowly.\n");
  await fs.writeFile(path.join(packDir, "copy/instagram-caption.txt"), "Easy runs usually drift slowly.\n");
  await fs.writeFile(path.join(packDir, "copy/hashtags.txt"), "#running #runtok #easyrun #runningtips\n");
  await writeJson(path.join(packDir, "asset-picklist.json"), {
    slides: [
      { slide_number: 1, role: "hook", text: "Easy runs drift slowly", asset_source: "images_2_0", instruction: { candidate_assets: [] } },
      {
        slide_number: 7,
        role: "cta",
        text: "Try Coachi if you always run too fast.",
        asset_source: "supabase_template",
        coachi_app_cta: true,
        preferred_asset_ids: ["coachi_cta_013_phone_mountain_morning_51min"],
        instruction: {
          candidate_assets: [
            {
              id: "coachi_cta_013_phone_mountain_morning_51min",
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
  assert.match(result.stderr, /conflicts with lake world/i);
  const qaReport = JSON.parse(await fs.readFile(path.join(packDir, "source/qa-report.json"), "utf8"));
  assert.equal(qaReport.pass, false);
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

test("prepare_slideshow_assets excludes owned generated fallback assets from production middle slides", async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-asset-owned-generated-filter-"));
  const manifestPath = path.join(tmpDir, "render-manifest.json");
  const supabaseManifestPath = path.join(tmpDir, "supabase-library-manifest.json");
  const outPath = path.join(tmpDir, "asset-picklist.json");

  await writeJson(manifestPath, {
    base_dir: ".",
    output_dir: "slides/rendered",
    hybrid_cost_model: "one_ai_hook_six_library_assets",
    visual_world: "mountain",
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
        visual_collection: "nature_context",
        input_image: "slides/source/02-problem.png",
        output_file: "02-problem.png",
        text: "Easy runs spike early."
      }
    ]
  });
  await writeJson(supabaseManifestPath, {
    schema_version: 1,
    collections: [
      {
        collection_id: "nature_context",
        items: [
          {
            id: "owned_generated_should_not_win",
            source_kind: "supabase_visual_library",
            original_source_kind: "owned_generated_visual_library",
            source_rights: "owned",
            quality_score: 100,
            public_url: "https://example.com/owned-generated.png",
            visual_world_tags: ["mountain"],
            subject_tags: ["mountain", "running"],
            status: "uploaded"
          },
          {
            id: "pinterest_supabase_should_win",
            source_kind: "supabase_visual_library",
            original_source_kind: "local_curated_library",
            source_rights: "approved",
            quality_score: 82,
            public_url: "https://example.com/pinterest-photo.png",
            visual_world_tags: ["mountain"],
            subject_tags: ["mountain", "running"],
            status: "uploaded"
          }
        ]
      }
    ]
  });

  await runNode([
    "scripts/prepare_slideshow_assets.mjs",
    "--manifest",
    manifestPath,
    "--out",
    outPath,
    "--supabase-library",
    supabaseManifestPath,
    "--production"
  ]);

  const picklist = JSON.parse(await fs.readFile(outPath, "utf8"));
  const slide = picklist.slides.find((item) => item.slide_number === 2);
  const candidateIds = slide.instruction.candidate_assets.map((asset) => asset.id);
  assert.equal(slide.instruction.candidate_assets[0].id, "pinterest_supabase_should_win");
  assert.equal(candidateIds.includes("owned_generated_should_not_win"), false);
  assert.equal(picklist.allow_owned_generated_middle_slides, false);
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

test("prepare_slideshow_assets keeps Coachi CTA variants inside selected world", async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-asset-world-cta-"));
  const manifestPath = path.join(tmpDir, "render-manifest.json");
  const outPath = path.join(tmpDir, "asset-picklist.json");

  await writeJson(manifestPath, {
    base_dir: ".",
    output_dir: "slides/rendered",
    hybrid_cost_model: "one_ai_hook_six_library_assets",
    visual_world: "lake",
    route_tag: "lake",
    lighting_family: "calm lake daylight",
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
        role: "cta",
        asset_source: "supabase_template",
        visual_collection: "cta_ending",
        preferred_asset_ids: [
          "coachi_cta_013_phone_mountain_morning_51min",
          "coachi_cta_009_phone_forest_morning_44min",
          "coachi_cta_011_phone_lake_calm_47min"
        ],
        coachi_app_cta: true,
        input_image: "slides/source/02-cta.png",
        output_file: "02-cta.png",
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
  const final = picklist.slides.find((item) => item.slide_number === 2);
  assert.equal(final.instruction.candidate_assets[0].id, "coachi_cta_011_phone_lake_calm_47min");
});
