import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import sharp from "sharp";

function runRenderer(manifestPath) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [
      "scripts/render_slideshow_deck.mjs",
      "--manifest",
      manifestPath
    ], {
      cwd: process.cwd(),
      env: { ...process.env },
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("exit", (code) => resolve({ code, stderr }));
  });
}

test("renderer applies EXIF orientation before portrait cropping", async () => {
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-render-orientation-"));
  const inputPath = path.join(tmpRoot, "oriented.jpg");
  const manifestPath = path.join(tmpRoot, "render-manifest.json");
  const pixels = Buffer.from([
    255, 0, 0, 255, 0, 0, 0, 0, 255, 0, 0, 255,
    255, 0, 0, 255, 0, 0, 0, 0, 255, 0, 0, 255
  ]);

  await sharp(pixels, { raw: { width: 4, height: 2, channels: 3 } })
    .jpeg({ quality: 100 })
    .withMetadata({ orientation: 6 })
    .toFile(inputPath);
  await fs.writeFile(manifestPath, JSON.stringify({
    base_dir: ".",
    width: 20,
    height: 40,
    output_dir: "slides/rendered",
    defaults: {
      font_size: 1,
      stroke_width: 0,
      gradient_opacity: 0
    },
    slides: [{
      slide_number: 2,
      role: "value",
      text: "x",
      input_image: "oriented.jpg",
      output_file: "02-value.png"
    }]
  }, null, 2));

  const result = await runRenderer(manifestPath);
  assert.equal(result.code, 0, result.stderr);

  const { data, info } = await sharp(path.join(tmpRoot, "slides/rendered/02-value.png"))
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixel = (x, y) => {
    const offset = (y * info.width + x) * info.channels;
    return [...data.subarray(offset, offset + 3)];
  };
  const top = pixel(10, 6);
  const bottom = pixel(10, 33);
  assert.ok(
    Math.abs(top[0] - bottom[0]) > 100 || Math.abs(top[2] - bottom[2]) > 100,
    `expected orientation-aware horizontal color bands, got ${top} and ${bottom}`
  );
});
