import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

function runRenderer(manifestPath) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [
      "scripts/render_slideshow_deck.mjs",
      "--manifest",
      manifestPath,
      "--dry-run",
      "--allow-missing-inputs"
    ], {
      cwd: process.cwd(),
      env: { ...process.env },
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
      resolve({ code, stdout, stderr });
    });
  });
}

async function writeManifest(hook) {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-render-hook-"));
  const manifestPath = path.join(tmpRoot, "render-manifest.json");
  await fs.writeFile(manifestPath, JSON.stringify({
    base_dir: ".",
    width: 1080,
    height: 1920,
    output_dir: "slides/rendered",
    slides: [
      {
        slide_number: 1,
        role: "hook",
        text: hook,
        input_image: "missing-hook.png",
        output_file: "01-hook.png",
        text_position: "lower_middle",
        stroke_width: 8,
        gradient_opacity: 0.64
      }
    ]
  }, null, 2));
  return manifestPath;
}

test("renderer allows clear hooks longer than eight words", async () => {
  const manifestPath = await writeManifest("Set Apple Watch heart rate alerts before you run");
  const result = await runRenderer(manifestPath);

  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /Set Apple Watch heart rate alerts before you run/);
});

test("renderer still blocks hooks over the shared 25 word quality limit", async () => {
  const manifestPath = await writeManifest("Apple Watch heart rate alerts before your first easy run can help you stop guessing when the pace feels slow but effort keeps climbing again today");
  const result = await runRenderer(manifestPath);

  assert.equal(result.code, 1);
  assert.match(result.stderr, /25 words or fewer/);
});
