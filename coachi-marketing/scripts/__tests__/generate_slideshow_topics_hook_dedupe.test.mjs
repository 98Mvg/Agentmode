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
