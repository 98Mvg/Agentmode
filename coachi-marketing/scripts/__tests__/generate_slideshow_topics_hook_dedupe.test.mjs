import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import { spawn } from "node:child_process";

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
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`node ${args.join(" ")} exited ${code}\n${stderr || stdout}`));
    });
  });
}

test("generate_slideshow_topics skips already-used hooks", async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-topics-"));
  const packsRoot = path.join(tmpDir, "packs");
  const postedPath = path.join(tmpDir, "posted-slideshows.json");
  const problemsPath = path.join(tmpDir, "problems.json");
  const outPath = path.join(tmpDir, "out.json");

  await fs.mkdir(path.join(packsRoot, "2026-05-13-most-runners-train-wrong"), { recursive: true });
  await fs.writeFile(
    path.join(packsRoot, "2026-05-13-most-runners-train-wrong", "render-manifest.json"),
    JSON.stringify({ hook: "Most runners train wrong" }, null, 2)
  );

  await fs.writeFile(
    postedPath,
    JSON.stringify({
      schema_version: 1,
      updated: "2026-05-13T00:00:00.000Z",
      posts: [{ hook: "Most runners train wrong" }]
    }, null, 2)
  );

  await fs.writeFile(
    problemsPath,
    JSON.stringify({
      schema_version: 1,
      problems: [
        {
          id: "rp_test_workout_racing",
          source_url: "https://example.com",
          platform: "tiktok",
          date_captured: "2026-05-13",
          source_type: "test",
          persona: "runner",
          exact_words: "I keep racing workouts.",
          problem_type: "workout-racing",
          watch_or_app_context: "watch pace alerts",
          emotion: "frustrated",
          failed_workaround: "trying harder",
          repeated_language: "racing workouts",
          sourced_mistakes: [
            { text: "Going out too hard." },
            { text: "Treating reps like a test." },
            { text: "Skipping warmup." },
            { text: "No recovery plan." },
            { text: "Chasing pace on bad days." }
          ],
          product_angle: "Set a ceiling.",
          content_angle: "Workouts are practice, not proof.",
          risk_level: "normal",
          score_frequency_1_5: 5,
          score_emotion_1_5: 4,
          score_product_fit_1_5: 5,
          score_content_clarity_1_5: 5,
          total_score: 19
        }
      ]
    }, null, 2)
  );

  await runNode([
    "scripts/generate_slideshow_topics.mjs",
    "--date",
    "2026-05-13",
    "--limit",
    "1",
    "--min-score",
    "12",
    "--problems",
    problemsPath,
    "--out",
    outPath,
    "--disable-hook-variation-bank",
    "--existing-packs-root",
    packsRoot,
    "--posted-registry",
    postedPath
  ]);

  const output = JSON.parse(await fs.readFile(outPath, "utf8"));
  assert.equal(output.candidate_count, 1);
  const hook = output.candidates[0].hook;
  assert.notEqual(hook, "Most runners train wrong");
  assert.equal(output.candidates[0].selected_hook_quality.passes_quality_gate, true);
  assert.ok(output.candidates[0].hook_candidates.every((candidate) => candidate.hook !== "Most runners train wrong"));
});

test("generate_slideshow_topics can fall back to problem exact_words when all bank hooks are deduped", async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-topics-"));
  const packsRoot = path.join(tmpDir, "packs");
  const postedPath = path.join(tmpDir, "posted-slideshows.json");
  const problemsPath = path.join(tmpDir, "problems.json");
  const outPath = path.join(tmpDir, "out.json");

  const dedupedHooks = [
    "Most runners train wrong",
    "Stop racing every workout",
    "Stop racing workouts",
    "Stop racing easy runs",
    "Stop racing practice reps",
    "5 things runners get wrong",
    "Simple running tips that work"
  ];

  for (const [index, hook] of dedupedHooks.entries()) {
    const dir = path.join(packsRoot, `2026-05-13-pack-${index}`);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, "render-manifest.json"), JSON.stringify({ hook }, null, 2));
  }

  await fs.writeFile(
    postedPath,
    JSON.stringify({
      schema_version: 1,
      updated: "2026-05-13T00:00:00.000Z",
      posts: dedupedHooks.map((hook) => ({ hook }))
    }, null, 2)
  );

  await fs.writeFile(
    problemsPath,
    JSON.stringify({
      schema_version: 1,
      problems: [
        {
          id: "rp_test_workout_racing_unique_hook",
          source_url: "https://example.com",
          platform: "tiktok",
          date_captured: "2026-05-13",
          source_type: "test",
          persona: "runner",
          exact_words: "Stop racing reps",
          problem_type: "workout-racing",
          watch_or_app_context: "watch pace alerts",
          emotion: "frustrated",
          failed_workaround: "trying harder",
          repeated_language: "reps",
          sourced_mistakes: [
            { text: "Going out too hard." },
            { text: "Treating reps like a test." },
            { text: "Skipping warmup." },
            { text: "No recovery plan." },
            { text: "Chasing pace on bad days." }
          ],
          product_angle: "Set a ceiling.",
          content_angle: "Stop racing reps",
          risk_level: "normal",
          score_frequency_1_5: 5,
          score_emotion_1_5: 4,
          score_product_fit_1_5: 5,
          score_content_clarity_1_5: 5,
          total_score: 19
        }
      ]
    }, null, 2)
  );

  await runNode([
    "scripts/generate_slideshow_topics.mjs",
    "--date",
    "2026-05-13",
    "--limit",
    "1",
    "--min-score",
    "12",
    "--problems",
    problemsPath,
    "--out",
    outPath,
    "--disable-hook-variation-bank",
    "--existing-packs-root",
    packsRoot,
    "--posted-registry",
    postedPath
  ]);

  const output = JSON.parse(await fs.readFile(outPath, "utf8"));
  assert.equal(output.candidate_count, 1);
  assert.equal(output.candidates[0].hook, "Stop racing reps");
  assert.equal(output.candidates[0].selected_hook_quality.passes_quality_gate, true);
});

test("generate_slideshow_topics rotates hook source families within a batch", async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-topics-hook-family-"));
  const packsRoot = path.join(tmpDir, "packs");
  const postedPath = path.join(tmpDir, "posted-slideshows.json");
  const problemsPath = path.join(tmpDir, "problems.json");
  const textBankPath = path.join(tmpDir, "text-bank.json");
  const outPath = path.join(tmpDir, "out.json");

  await fs.writeFile(postedPath, JSON.stringify({ schema_version: 1, posts: [] }, null, 2));
  await fs.writeFile(
    textBankPath,
    JSON.stringify({
      schema_version: 1,
      hook_families: [
        {
          id: "shared_control_family",
          source_excerpt: "Easy effort and HR control hooks",
          source_signal: "test bank",
          source_url: "https://example.com/shared",
          mechanism: "shared easy-control hook family",
          problem_types: ["easy-run pace drift", "heart-rate panic"],
          safe_hook_shapes: ["Easy is effort, not pace", "High heart rate needs context"]
        },
        {
          id: "workout_control_family",
          source_excerpt: "Workout restraint hooks",
          source_signal: "test bank",
          source_url: "https://example.com/workout",
          mechanism: "workout control hook family",
          problem_types: ["workout-racing"],
          safe_hook_shapes: ["Stop racing workouts"]
        }
      ],
      problem_type_packs: {
        "easy-run pace drift": {
          preferred_hooks: [{ text: "Easy is effort, not pace", source_family_id: "shared_control_family" }],
          slide_sets: [{
            id: "easy_shared_control",
            source_family_ids: ["shared_control_family"],
            slides_1_to_6: [
              "Easy is effort, not pace",
              "Pick one ceiling.",
              "Let pace move.",
              "Protect tomorrow.",
              "Control the drift.",
              "Finish repeatable."
            ]
          }]
        },
        "heart-rate panic": {
          preferred_hooks: [{ text: "High heart rate needs context", source_family_id: "shared_control_family" }],
          slide_sets: [{
            id: "hr_shared_control",
            source_family_ids: ["shared_control_family"],
            slides_1_to_6: [
              "High heart rate needs context",
              "Heat can raise it.",
              "Sleep can raise it.",
              "Wrist lag happens.",
              "Do not panic.",
              "Use a ceiling."
            ]
          }]
        },
        "workout-racing": {
          preferred_hooks: [{ text: "Stop racing workouts", source_family_id: "workout_control_family" }],
          slide_sets: [{
            id: "workout_control",
            source_family_ids: ["workout_control_family"],
            slides_1_to_6: [
              "Stop racing workouts",
              "Rep one sets the trap.",
              "Keep recoveries honest.",
              "Save the last rep.",
              "Finish with control.",
              "Training is not proof."
            ]
          }]
        },
        default: {
          preferred_hooks: [{ text: "Simple running tips that work", source_family_id: "workout_control_family" }],
          slide_sets: [{
            id: "default",
            source_family_ids: ["workout_control_family"],
            slides_1_to_6: [
              "Simple running tips that work",
              "Start slower.",
              "Keep control.",
              "Use one cue.",
              "Adjust early.",
              "Save the run."
            ]
          }]
        }
      }
    }, null, 2)
  );
  await fs.writeFile(
    problemsPath,
    JSON.stringify({
      schema_version: 1,
      problems: [
        {
          id: "rp_easy_shared_family",
          source_url: "https://example.com/easy",
          platform: "tiktok",
          exact_words: "Easy is effort, not pace",
          problem_type: "easy-run pace drift",
          emotion: "frustrated",
          product_angle: "Catch effort drift early.",
          content_angle: "Easy is effort, not pace",
          total_score: 20
        },
        {
          id: "rp_hr_shared_family",
          source_url: "https://example.com/hr",
          platform: "tiktok",
          exact_words: "High heart rate needs context",
          problem_type: "heart-rate panic",
          emotion: "worried",
          product_angle: "Keep one number from taking over.",
          content_angle: "High heart rate needs context",
          total_score: 19
        },
        {
          id: "rp_workout_other_family",
          source_url: "https://example.com/workout",
          platform: "tiktok",
          exact_words: "Stop racing workouts",
          problem_type: "workout-racing",
          emotion: "frustrated",
          product_angle: "Keep the workout inside the plan.",
          content_angle: "Stop racing workouts",
          total_score: 12
        }
      ]
    }, null, 2)
  );

  await runNode([
    "scripts/generate_slideshow_topics.mjs",
    "--date",
    "2026-05-13",
    "--limit",
    "2",
    "--min-score",
    "12",
    "--problems",
    problemsPath,
    "--out",
    outPath,
    "--disable-hook-variation-bank",
    "--existing-packs-root",
    packsRoot,
    "--posted-registry",
    postedPath,
    "--tiktok-text-bank",
    textBankPath
  ]);

  const output = JSON.parse(await fs.readFile(outPath, "utf8"));
  assert.equal(output.candidate_count, 2);
  assert.equal(output.hook_family_rotation.enabled, true);
  assert.equal(output.hook_family_rotation.selected_family_count, 2);
  assert.equal(output.hook_family_rotation.repeated_family_count, 0);
  assert.equal(output.hook_family_rotation.fallback_count, 0);
  assert.equal(output.content_rotation.enabled, true);
  assert.equal(output.content_rotation.mode, "maximum_rotation");
  assert.equal(output.content_rotation.selected_problem_type_count, 2);
  assert.equal(output.content_rotation.repeated_problem_type_count, 0);
  assert.equal(output.content_rotation.fallback_count, 0);
  const selectedFamilies = output.candidates.map((candidate) => candidate.hook_family_rotation.source_family_id);
  assert.equal(new Set(selectedFamilies).size, 2);
  assert.ok(output.candidates.every((candidate) => candidate.hook_family_rotation.enabled === true));
  assert.ok(output.candidates.every((candidate) => candidate.problem_type_rotation.enabled === true));
  assert.ok(output.candidates.every((candidate) => candidate.content_rotation.mode === "maximum_rotation"));
});

test("generate_slideshow_topics excludes Reddit hook sources by default and can opt in", async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-topics-winners-"));
  const packsRoot = path.join(tmpDir, "packs");
  const postedPath = path.join(tmpDir, "posted-slideshows.json");
  const problemsPath = path.join(tmpDir, "problems.json");
  const outPath = path.join(tmpDir, "out.json");
  const optInOutPath = path.join(tmpDir, "out-opt-in.json");

  await fs.mkdir(path.join(tmpDir, "inputs", "performance"), { recursive: true });
  await fs.writeFile(
    path.join(tmpDir, "inputs", "performance", "WINNER_LIBRARY.md"),
    "A note line.\nWalking before you are cooked is pacing, not failure.\n",
    "utf8"
  );

  await fs.writeFile(
    postedPath,
    JSON.stringify({ schema_version: 1, updated: "2026-05-13T00:00:00.000Z", posts: [] }, null, 2)
  );

  await fs.writeFile(
    problemsPath,
    JSON.stringify({
      schema_version: 1,
      problems: [
        {
          id: "rp_test_beginner_uncertainty",
          source_url: "inputs/research/reddit-winning-language-bank.md",
          platform: "reddit",
          date_captured: "2026-05-13",
          source_type: "test",
          persona: "beginner runner",
          exact_words: "Walking before you are cooked is pacing, not failure.",
          problem_type: "beginner uncertainty",
          watch_or_app_context: "n/a",
          emotion: "embarrassed",
          failed_workaround: "forcing nonstop running",
          repeated_language: "walk breaks feel like failure",
          product_angle: "Keep the run controlled.",
          content_angle: "Walking before you are cooked is pacing, not failure.",
          risk_level: "low",
          score_frequency_1_5: 4,
          score_emotion_1_5: 4,
          score_product_fit_1_5: 5,
          score_content_clarity_1_5: 5,
          total_score: 18
        }
      ]
    }, null, 2)
  );

  await runNode(
    [
      path.resolve("scripts/generate_slideshow_topics.mjs"),
      "--date",
      "2026-05-13",
      "--limit",
      "1",
      "--min-score",
      "12",
      "--problems",
      problemsPath,
      "--out",
      outPath,
      "--disable-hook-variation-bank",
      "--existing-packs-root",
      packsRoot,
      "--posted-registry",
      postedPath,
      "--schemas-dir",
      path.resolve("strategy/automation/tiktok-instagram-slideshow-content-engine/schemas"),
      "--tiktok-text-bank",
      path.resolve("inputs/research/tiktok-proven-slideshow-text-bank.json")
    ],
    { cwd: tmpDir }
  );

  const output = JSON.parse(await fs.readFile(outPath, "utf8"));
  assert.equal(output.reddit_hook_sources.enabled, false);
  assert.equal(output.reddit_hook_sources.filtered_count, 1);
  assert.equal(output.candidate_count, 0);

  await runNode(
    [
      path.resolve("scripts/generate_slideshow_topics.mjs"),
      "--date",
      "2026-05-13",
      "--limit",
      "1",
      "--min-score",
      "12",
      "--problems",
      problemsPath,
      "--out",
      optInOutPath,
      "--disable-hook-variation-bank",
      "--existing-packs-root",
      packsRoot,
      "--posted-registry",
      postedPath,
      "--schemas-dir",
      path.resolve("strategy/automation/tiktok-instagram-slideshow-content-engine/schemas"),
      "--tiktok-text-bank",
      path.resolve("inputs/research/tiktok-proven-slideshow-text-bank.json"),
      "--include-reddit-hook-sources"
    ],
    { cwd: tmpDir }
  );

  const optInOutput = JSON.parse(await fs.readFile(optInOutPath, "utf8"));
  assert.equal(optInOutput.reddit_hook_sources.enabled, true);
  assert.equal(optInOutput.reddit_hook_sources.filtered_count, 0);
  assert.equal(optInOutput.candidate_count, 1);
  assert.equal(optInOutput.candidates[0].selected_hook_quality.passes_quality_gate, true);
});

test("generate_slideshow_topics avoids already-used slide text sets when alternatives exist", async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-topics-slide-set-"));
  const packsRoot = path.join(tmpDir, "packs");
  const postedPath = path.join(tmpDir, "posted-slideshows.json");
  const problemsPath = path.join(tmpDir, "problems.json");
  const outPath = path.join(tmpDir, "out.json");

  await fs.mkdir(path.join(packsRoot, "2026-05-16-zone-2-keeps-drifting", "source"), { recursive: true });
  await fs.writeFile(
    path.join(packsRoot, "2026-05-16-zone-2-keeps-drifting", "source", "hook-brief.json"),
    JSON.stringify({
      slide_text_source: {
        bank_path: "inputs/research/tiktok-proven-slideshow-text-bank.json",
        slide_set_id: "zone2_drift_simple"
      }
    }, null, 2)
  );

  await fs.writeFile(postedPath, JSON.stringify({ schema_version: 1, posts: [] }, null, 2));
  await fs.writeFile(
    problemsPath,
    JSON.stringify({
      schema_version: 1,
      problems: [
        {
          id: "rp_test_easy_pace_drift",
          source_url: "https://example.com",
          platform: "tiktok",
          date_captured: "2026-05-16",
          source_type: "test",
          persona: "runner",
          exact_words: "My easy pace always drifts up even when I try to keep it controlled.",
          problem_type: "easy-run pace drift",
          watch_or_app_context: "Apple Watch heart-rate zones",
          emotion: "annoyed",
          failed_workaround: "checking pace every minute",
          repeated_language: "easy pace drifts",
          product_angle: "Catch effort drift before the run turns hard.",
          content_angle: "Easy should be a ceiling, not one fixed pace.",
          risk_level: "normal",
          score_frequency_1_5: 5,
          score_emotion_1_5: 4,
          score_product_fit_1_5: 5,
          score_content_clarity_1_5: 5,
          total_score: 19
        }
      ]
    }, null, 2)
  );

  await runNode([
    "scripts/generate_slideshow_topics.mjs",
    "--date",
    "2026-05-16",
    "--limit",
    "1",
    "--min-score",
    "12",
    "--problems",
    problemsPath,
    "--out",
    outPath,
    "--existing-packs-root",
    packsRoot,
    "--posted-registry",
    postedPath
  ]);

  const output = JSON.parse(await fs.readFile(outPath, "utf8"));
  assert.equal(output.candidate_count, 1);
  const candidate = output.candidates[0];
  assert.notEqual(candidate.slide_text_source.slide_set_id, "zone2_drift_simple");
  assert.ok(candidate.slide_draft.every((slide) => slide.text !== "You speed up once."));
});

test("generate_slideshow_topics does not reuse slide text sets when all are already used", async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-topics-slide-set-exhausted-"));
  const packsRoot = path.join(tmpDir, "packs");
  const postedPath = path.join(tmpDir, "posted-slideshows.json");
  const problemsPath = path.join(tmpDir, "problems.json");
  const outPath = path.join(tmpDir, "out.json");

  const textBank = JSON.parse(await fs.readFile("inputs/research/tiktok-proven-slideshow-text-bank.json", "utf8"));
  const usedSlideSetIds = [
    ...new Set((textBank.problem_type_packs?.["easy-run pace drift"]?.slide_sets || [])
      .map((slideSet) => slideSet.id)
      .filter(Boolean))
  ];
  assert.ok(usedSlideSetIds.length > 0);

  for (const [index, slideSetId] of usedSlideSetIds.entries()) {
    const packDir = path.join(packsRoot, `2026-05-16-pack-${index}`, "source");
    await fs.mkdir(packDir, { recursive: true });
    await fs.writeFile(
      path.join(packDir, "hook-brief.json"),
      JSON.stringify({
        slide_text_source: {
          bank_path: "inputs/research/tiktok-proven-slideshow-text-bank.json",
          slide_set_id: slideSetId
        }
      }, null, 2)
    );
  }

  await fs.writeFile(postedPath, JSON.stringify({ schema_version: 1, posts: [] }, null, 2));
  await fs.writeFile(
    problemsPath,
    JSON.stringify({
      schema_version: 1,
      problems: [
        {
          id: "rp_test_easy_pace_drift_exhausted",
          source_url: "https://example.com",
          platform: "tiktok",
          date_captured: "2026-05-16",
          source_type: "test",
          persona: "runner",
          exact_words: "My easy pace always drifts up even when I try to keep it controlled.",
          problem_type: "easy-run pace drift",
          watch_or_app_context: "Apple Watch heart-rate zones",
          emotion: "annoyed",
          failed_workaround: "checking pace every minute",
          repeated_language: "easy pace drifts",
          product_angle: "Catch effort drift before the run turns hard.",
          content_angle: "Easy runs are not proof",
          risk_level: "normal",
          score_frequency_1_5: 5,
          score_emotion_1_5: 4,
          score_product_fit_1_5: 5,
          score_content_clarity_1_5: 5,
          total_score: 19
        }
      ]
    }, null, 2)
  );

  await runNode([
    "scripts/generate_slideshow_topics.mjs",
    "--date",
    "2026-05-16",
    "--limit",
    "1",
    "--min-score",
    "12",
    "--problems",
    problemsPath,
    "--out",
    outPath,
    "--existing-packs-root",
    packsRoot,
    "--posted-registry",
    postedPath
  ]);

  const output = JSON.parse(await fs.readFile(outPath, "utf8"));
  assert.equal(output.candidate_count, 1);
  const candidate = output.candidates[0];
  assert.equal(candidate.slide_text_source, null);
  assert.ok(candidate.slide_draft.every((slide) => slide.text !== "You speed up once."));
});

test("run_slideshow_pipeline rotates Coachi app-proof CTA assets with 70 percent policy", async () => {
  const source = await fs.readFile("scripts/run_slideshow_pipeline.mjs", "utf8");
  const assetList = source.match(/const COACHI_APP_CTA_ASSET_IDS = \[([\s\S]*?)\];/);

  assert.ok(assetList, "Missing Coachi app CTA asset list.");
  assert.match(assetList[1], /phone/i);
  assert.match(assetList[1], /watch/i);
  assert.match(source, /return stableHash\(seed\) % 10 < 7;/);
  assert.doesNotMatch(source, /if \(\s*\/\\bcoachi\\b\/i\.test\(finalCta\)\) return true;/);
  assert.match(source, /SOFT_NON_COACHI_CTA_BY_PROBLEM_TYPE/);
});
