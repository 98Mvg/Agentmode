#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

function parseArgs(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    values.set(token, argv[index + 1]);
    index += 1;
  }
  return values;
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

const args = parseArgs(process.argv.slice(2));
const packDir = path.resolve(args.get("--pack") || "");
const imagePath = path.resolve(args.get("--image") || "");

if (!args.get("--pack") || !args.get("--image")) {
  throw new Error("Usage: node scripts/import_codex_hook_image.mjs --pack <pack-dir> --image <generated-image>");
}

const hookBriefPath = path.join(packDir, "source", "hook-brief.json");
const hookBrief = await readJson(hookBriefPath);
const referenceImage = hookBrief.character_anchor?.reference_image
  || hookBrief.avatar_variation?.identity_profile?.reference_image;

if (!referenceImage) {
  throw new Error(`${hookBriefPath} does not define an identity reference image.`);
}

await fs.access(imagePath);
const destination = path.join(packDir, "slides", "source", "01-hook.png");
await fs.mkdir(path.dirname(destination), { recursive: true });
await fs.copyFile(imagePath, destination);

const provenancePath = path.join(packDir, "source", "hook-provenance.json");
await writeJson(provenancePath, {
  schema_version: 1,
  generator: "codex_imagegen_tool",
  mode: "edit_with_reference_image",
  reference_images: [referenceImage],
  reference_image: referenceImage,
  style_reference_image: referenceImage,
  prompt_path: path.join(packDir, "source", "images-2-0-hook-prompt.md"),
  imported_image_path: imagePath,
  output_path: destination,
  created_at: new Date().toISOString(),
  fallback_used: false,
  source_problem_id: hookBrief.source_problem_id || null,
  hook: hookBrief.hook,
  note: "Generated as one unique hook image with the Codex image generation tool using the pack identity reference."
});

console.log(JSON.stringify({
  ok: true,
  pack: packDir,
  image: destination,
  provenance: provenancePath,
  generator: "codex_imagegen_tool",
  reference_image: referenceImage
}, null, 2));
