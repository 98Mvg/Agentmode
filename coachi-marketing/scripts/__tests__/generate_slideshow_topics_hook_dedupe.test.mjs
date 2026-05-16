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

test("run_slideshow_pipeline keeps Coachi app-proof CTA assets phone-only", async () => {
  const source = await fs.readFile("scripts/run_slideshow_pipeline.mjs", "utf8");
  const assetList = source.match(/const COACHI_APP_CTA_ASSET_IDS = \[([\s\S]*?)\];/);

  assert.ok(assetList, "Missing Coachi app CTA asset list.");
  assert.match(assetList[1], /phone/i);
  assert.doesNotMatch(assetList[1], /watch/i);
  assert.match(source, /if \(\s*\/\\bcoachi\\b\/i\.test\(finalCta\)\) return true;/);
});
