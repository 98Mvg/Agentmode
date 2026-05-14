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
  assert.equal(/\b(cue|unlock|discover|data-driven)\b/i.test(candidate.hook), false);
});

test("shared hook scorer rejects corporate fitness wording", () => {
  const quality = scoreCoachiHook("Unlock your potential with data-driven performance", {
    problem_type: "easy-run pace drift"
  });
  assert.equal(quality.passes_quality_gate, false);
  assert.equal(textSoundsLikeAd("Transform your fitness journey today"), true);
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
    visual_world: "track edge",
    lighting_family: "soft morning light",
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
      { slide_number: 2, role: "setup", input_image: "slides/source/02-setup.png", output_file: "02-setup.png", text: "Hard is not always better.", asset_source: "supabase_library", text_position: "lower_middle" },
      { slide_number: 3, role: "value", input_image: "slides/source/03-value.png", output_file: "03-value.png", text: "Do not race practice.", asset_source: "supabase_library", text_position: "lower_middle" },
      { slide_number: 4, role: "rule", input_image: "slides/source/04-rule.png", output_file: "04-rule.png", text: "Finish with control.", asset_source: "supabase_library", text_position: "center" },
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
    visual_world: "track edge",
    lighting_family: "soft morning light",
    avatar_world_required: true,
    cta_required: true,
    first_image_prompt_adaptation: "runner cooling down after intervals",
    reddit_background_and_vibe: {
      background: "track edge after intervals",
      vibe: "cooling down",
      reddit_background: "runner races workouts",
      visual_keywords: ["track"],
      avoid: ["watch close-up"]
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
      weather: "fresh morning",
      lighting: "soft morning light"
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
Selected visual world: track edge
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
    visual_world: "city park path",
    lighting_family: "soft morning light",
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
