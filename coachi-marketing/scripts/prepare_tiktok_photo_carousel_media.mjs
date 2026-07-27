#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

function parseArgs(argv) {
  const args = new Map();
  const flags = new Set();
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      flags.add(arg);
    } else {
      args.set(arg, next);
      index += 1;
    }
  }
  return { args, flags };
}

function printHelp() {
  console.log(`Usage:
  node scripts/prepare_tiktok_photo_carousel_media.mjs --pack content/slideshows/YYYY-MM-DD-slug

Creates a TikTok photo-carousel safe JPEG export from the rendered slideshow.
TikTok photo posts require public JPEG/WebP URLs; the main render output can remain PNG.`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function main() {
  const { args, flags } = parseArgs(process.argv.slice(2));
  if (flags.has("--help") || flags.has("-h")) {
    printHelp();
    return;
  }

  const packArg = args.get("--pack");
  assert(packArg, "--pack is required.");
  const packDir = path.resolve(packArg);
  const manifest = await readJson(path.join(packDir, "render-manifest.json"));
  const outputDir = path.resolve(packDir, args.get("--out-dir") || "exports/tiktok-photo-slides");
  const renderedDir = path.resolve(packDir, manifest.output_dir || "slides/rendered");
  const slides = manifest.slides || [];
  assert(slides.length >= 2 && slides.length <= 35, "TikTok photo slideshow requires 2 to 35 slides.");

  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  const outputs = [];
  for (const slide of slides) {
    const source = path.join(renderedDir, slide.output_file);
    assert(await exists(source), `Rendered slide missing: ${source}`);
    const baseName = path.basename(slide.output_file, path.extname(slide.output_file));
    const out = path.join(outputDir, `${baseName}.jpg`);
    await sharp(source)
      .resize(1080, 1920, { fit: "cover", position: "center" })
      .jpeg({ quality: 92, mozjpeg: true })
      .toFile(out);
    outputs.push(out);
  }

  console.log(JSON.stringify({
    ok: true,
    pack: path.relative(process.cwd(), packDir),
    output_dir: path.relative(process.cwd(), outputDir),
    image_count: outputs.length,
    media_type: "image/jpeg",
    files: outputs.map((filePath) => path.relative(process.cwd(), filePath))
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
