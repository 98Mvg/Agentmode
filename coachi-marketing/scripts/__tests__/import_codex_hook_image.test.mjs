import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import test from "node:test";

function runNode(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd: process.cwd() });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(stderr || stdout));
    });
  });
}

test("imports a Codex-generated hook with the pack identity provenance", async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-codex-hook-"));
  const packDir = path.join(tmpDir, "pack");
  const generatedImage = path.join(tmpDir, "generated.png");
  const referenceImage = "content/reference/main-runner.png";

  await fs.mkdir(path.join(packDir, "source"), { recursive: true });
  await fs.writeFile(generatedImage, Buffer.from("generated-image"));
  await fs.writeFile(
    path.join(packDir, "source", "hook-brief.json"),
    JSON.stringify({
      hook: "The last interval should stay controlled",
      source_problem_id: "test_problem",
      character_anchor: { reference_image: referenceImage }
    })
  );

  await runNode([
    "scripts/import_codex_hook_image.mjs",
    "--pack", packDir,
    "--image", generatedImage
  ]);

  const provenance = JSON.parse(
    await fs.readFile(path.join(packDir, "source", "hook-provenance.json"), "utf8")
  );
  assert.equal(provenance.generator, "codex_imagegen_tool");
  assert.equal(provenance.fallback_used, false);
  assert.equal(provenance.reference_image, referenceImage);
  assert.deepEqual(provenance.reference_images, [referenceImage]);
  assert.deepEqual(
    await fs.readFile(path.join(packDir, "slides", "source", "01-hook.png")),
    await fs.readFile(generatedImage)
  );
});
