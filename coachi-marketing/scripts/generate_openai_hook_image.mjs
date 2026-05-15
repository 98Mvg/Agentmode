#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

await import("dotenv").then(({ config }) => config()).catch(() => {});

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const APP_REPO_ROOT = process.env.COACHI_APP_REPO_ROOT || "/Users/mariusgaarder/Documents/treningscoach";
const DEFAULT_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
const DEFAULT_SIZE = process.env.OPENAI_IMAGE_SIZE || "1024x1536";
const DEFAULT_QUALITY = process.env.OPENAI_IMAGE_QUALITY || "high";
const DEFAULT_ENDPOINT = process.env.OPENAI_IMAGES_ENDPOINT || "https://api.openai.com/v1/images/generations";
const DEFAULT_EDIT_ENDPOINT = process.env.OPENAI_IMAGES_EDIT_ENDPOINT || "https://api.openai.com/v1/images/edits";
const WATCH_STOLE_THE_RUN_HOOK_IMAGE = "content/slideshows/2026-04-26-watch-stole-the-run-8-slide/slides/source/01-hook.png";
const DEFAULT_HOOK_REFERENCE_IMAGE = WATCH_STOLE_THE_RUN_HOOK_IMAGE;
const DEFAULT_HOOK_STYLE_REFERENCE_IMAGE = WATCH_STOLE_THE_RUN_HOOK_IMAGE;

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
  node scripts/generate_openai_hook_image.mjs --pack content/slideshows/YYYY-MM-DD-slug
  node scripts/generate_openai_hook_image.mjs --prompt path/to/prompt.md --out path/to/01-hook.png
  node scripts/generate_openai_hook_image.mjs --pack content/slideshows/YYYY-MM-DD-slug --reference-image content/slideshows/2026-04-26-watch-stole-the-run-8-slide/slides/source/01-hook.png

Generates the slideshow hook image with OpenAI's Images API.
The API key is resolved without printing it:
1. OPENCLAW_OPENAI_API_KEY from the environment
2. OPENCLAW_OPENAI_API_KEY_FILE, when explicitly set
3. .env in the marketing workspace
4. .env in the Coachi app repo
5. ~/.openclaw/secrets/openai-api-key
6. OPENAI_API_KEY from the environment
7. OPENCLAW_FOR_CODEX.md in the Coachi app repo, if present

Default model: ${DEFAULT_MODEL}
Default size: ${DEFAULT_SIZE}
Default pack references:
- ${DEFAULT_HOOK_REFERENCE_IMAGE}
- ${DEFAULT_HOOK_STYLE_REFERENCE_IMAGE}

Use --dry-run to validate inputs and key presence without calling the API.
Use --no-default-references only for non-Coachi experiments.`);
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

async function readText(filePath) {
  return fs.readFile(filePath, "utf8");
}

async function readJsonIfExists(filePath) {
  if (!(await exists(filePath))) return null;
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function parseEnvText(text) {
  const output = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    output[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
  return output;
}

async function readKeyFromEnvFile(filePath) {
  if (!(await exists(filePath))) return null;
  const values = parseEnvText(await readText(filePath));
  return values.OPENAI_API_KEY || null;
}

async function readKeyFromOpenClawContext() {
  const filePath = path.join(APP_REPO_ROOT, "OPENCLAW_FOR_CODEX.md");
  if (!(await exists(filePath))) return null;
  const text = await readText(filePath);
  const match = text.match(/OPENAI_API_KEY\s*=\s*([^\s]+)/);
  return match?.[1] || null;
}

async function resolveOpenAiApiKey() {
  if (process.env.OPENCLAW_OPENAI_API_KEY) {
    return { key: process.env.OPENCLAW_OPENAI_API_KEY, source: "process.env.OPENCLAW_OPENAI_API_KEY" };
  }

  if (process.env.OPENCLAW_OPENAI_API_KEY_FILE && (await exists(process.env.OPENCLAW_OPENAI_API_KEY_FILE))) {
    const explicitOpenClawKeyFile = process.env.OPENCLAW_OPENAI_API_KEY_FILE;
    const key = (await readText(explicitOpenClawKeyFile)).trim();
    if (key) return { key, source: explicitOpenClawKeyFile };
  }

  const candidateFiles = [
    path.join(ROOT, ".env"),
    path.join(APP_REPO_ROOT, ".env")
  ];
  for (const filePath of candidateFiles) {
    const key = await readKeyFromEnvFile(filePath);
    if (key) return { key, source: filePath };
  }

  const openClawKeyFile = path.join(process.env.HOME || "", ".openclaw/secrets/openai-api-key");
  if (openClawKeyFile && (await exists(openClawKeyFile))) {
    const key = (await readText(openClawKeyFile)).trim();
    if (key) return { key, source: openClawKeyFile };
  }

  if (process.env.OPENAI_API_KEY) {
    return { key: process.env.OPENAI_API_KEY, source: "process.env.OPENAI_API_KEY" };
  }

  const openClawKey = await readKeyFromOpenClawContext();
  if (openClawKey) {
    return { key: openClawKey, source: path.join(APP_REPO_ROOT, "OPENCLAW_FOR_CODEX.md") };
  }

  throw new Error("Missing OPENAI_API_KEY. Set it in env, marketing .env, app .env, or the OpenClaw context file.");
}

function extractPrompt(text) {
  const marker = "## Final Prompt To Use";
  const markerIndex = text.indexOf(marker);
  if (markerIndex === -1) return text.trim();
  return text.slice(markerIndex + marker.length).trim();
}

function redactSecrets(value) {
  return String(value)
    .replace(/sk-[A-Za-z0-9_\-*]+/g, "[REDACTED_OPENAI_KEY]")
    .replace(/Bearer\s+[A-Za-z0-9_\-.]+/gi, "Bearer [REDACTED]");
}

async function resolvePrompt({ args }) {
  const pack = args.get("--pack");
  const promptPath = args.get("--prompt")
    || (pack ? path.join(pack, "source/images-2-0-hook-prompt.md") : null);
  if (!promptPath) throw new Error("--pack or --prompt is required.");

  const absolutePromptPath = path.resolve(promptPath);
  const fullPrompt = await readText(absolutePromptPath);
  const prompt = extractPrompt(fullPrompt);
  if (!prompt) throw new Error(`Prompt file is empty: ${absolutePromptPath}`);
  return { prompt, promptPath: absolutePromptPath, pack: pack ? path.resolve(pack) : null };
}

function resolveOutput({ args, pack }) {
  const out = args.get("--out") || (pack ? path.join(pack, "slides/source/01-hook.png") : null);
  if (!out) throw new Error("--out is required when --pack is not provided.");
  return path.resolve(out);
}

async function callOpenAiImages({ apiKey, prompt, model, size, quality, endpoint }) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      prompt,
      size,
      quality,
      n: 1
    })
  });

  const bodyText = await response.text();
  let body;
  try {
    body = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    body = { raw: bodyText };
  }

  if (!response.ok) {
    const message = body?.error?.message || bodyText || `HTTP ${response.status}`;
    throw new Error(`OpenAI image generation failed: ${redactSecrets(message)}`);
  }

  const image = body?.data?.[0];
  const b64 = image?.b64_json;
  if (!b64) {
    throw new Error("OpenAI image generation response did not include data[0].b64_json.");
  }
  return { buffer: Buffer.from(b64, "base64"), response: body };
}

function mimeTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "image/png";
}

async function imageReferencePayload(filePath) {
  const absoluteReference = path.resolve(filePath);
  const referenceBuffer = await fs.readFile(absoluteReference);
  const imageUrl = `data:${mimeTypeFor(absoluteReference)};base64,${referenceBuffer.toString("base64")}`;
  return { absoluteReference, payload: { image_url: imageUrl } };
}

async function callOpenAiImageEdit({ apiKey, prompt, model, size, quality, endpoint, referenceImages, inputFidelity }) {
  const references = [];
  for (const filePath of referenceImages) {
    references.push(await imageReferencePayload(filePath));
  }
  const requestBody = {
    model,
    prompt,
    images: references.map((reference) => reference.payload),
    size,
    quality,
    n: 1
  };
  if (inputFidelity && model !== "gpt-image-2") {
    requestBody.input_fidelity = inputFidelity;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  const bodyText = await response.text();
  let body;
  try {
    body = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    body = { raw: bodyText };
  }

  if (!response.ok) {
    const message = body?.error?.message || bodyText || `HTTP ${response.status}`;
    throw new Error(`OpenAI image edit failed: ${redactSecrets(message)}`);
  }

  const image = body?.data?.[0];
  const b64 = image?.b64_json;
  if (!b64) {
    throw new Error("OpenAI image edit response did not include data[0].b64_json.");
  }
  return {
    buffer: Buffer.from(b64, "base64"),
    response: body,
    referenceImages: references.map((reference) => reference.absoluteReference)
  };
}

async function main() {
  const { args, flags } = parseArgs(process.argv.slice(2));
  if (flags.has("--help") || flags.has("-h")) {
    printHelp();
    return;
  }

  const model = args.get("--model") || DEFAULT_MODEL;
  const size = args.get("--size") || DEFAULT_SIZE;
  const quality = args.get("--quality") || DEFAULT_QUALITY;
  const inputFidelity = args.get("--input-fidelity") || "high";
  const dryRun = flags.has("--dry-run");
  const { prompt, promptPath, pack } = await resolvePrompt({ args });
  const useDefaultReferences = Boolean(pack) && !flags.has("--no-default-references");
  const referenceImage = args.get("--reference-image") || (useDefaultReferences ? DEFAULT_HOOK_REFERENCE_IMAGE : null);
  const styleReferenceImage = args.get("--style-reference-image") || (useDefaultReferences ? DEFAULT_HOOK_STYLE_REFERENCE_IMAGE : null);
  const referenceImages = [...new Set([referenceImage, styleReferenceImage].filter(Boolean))];
  const endpoint = args.get("--endpoint") || (referenceImages.length > 0 ? DEFAULT_EDIT_ENDPOINT : DEFAULT_ENDPOINT);
  const outPath = resolveOutput({ args, pack });
  const provenancePath = args.get("--provenance-out")
    ? path.resolve(args.get("--provenance-out"))
    : pack
      ? path.join(pack, "source/hook-provenance.json")
      : `${outPath}.provenance.json`;
  const hookBrief = pack ? await readJsonIfExists(path.join(pack, "source/hook-brief.json")) : null;
  const { key, source } = await resolveOpenAiApiKey();

  if (dryRun) {
    console.log(JSON.stringify({
      ok: true,
      dry_run: true,
      model,
      size,
      quality,
      mode: referenceImages.length > 0 ? "edit_with_reference_image" : "generation",
      prompt_path: promptPath,
      output_path: outPath,
      provenance_path: provenancePath,
      reference_image: referenceImage ? path.resolve(referenceImage) : null,
      style_reference_image: styleReferenceImage ? path.resolve(styleReferenceImage) : null,
      reference_image_count: referenceImages.length,
      input_fidelity: referenceImage ? inputFidelity : null,
      key_source: source,
      key_present: Boolean(key),
      prompt_chars: prompt.length
    }, null, 2));
    return;
  }

  const startedAt = new Date().toISOString();
  const result = referenceImages.length > 0
    ? await callOpenAiImageEdit({ apiKey: key, prompt, model, size, quality, endpoint, referenceImages, inputFidelity })
    : await callOpenAiImages({ apiKey: key, prompt, model, size, quality, endpoint });
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, result.buffer);
  const createdAt = new Date().toISOString();
  await writeJson(provenancePath, {
    schema_version: 1,
    generator: "chatgpt_images_2_0",
    api_model: model,
    endpoint,
    size,
    quality,
    mode: referenceImages.length > 0 ? "edit_with_reference_image" : "generation",
    reference_images: referenceImages.length > 0
      ? result.referenceImages.map((filePath) => path.relative(ROOT, filePath))
      : [],
    reference_image: referenceImage ? path.relative(ROOT, path.resolve(referenceImage)) : null,
    style_reference_image: styleReferenceImage ? path.relative(ROOT, path.resolve(styleReferenceImage)) : null,
    input_fidelity: referenceImages.length > 0 ? inputFidelity : null,
    prompt_path: promptPath,
    output_path: outPath,
    created_at: createdAt,
    requested_at: startedAt,
    key_source: source,
    revised_prompt: result.response?.data?.[0]?.revised_prompt || null,
    source_problem_id: hookBrief?.problem_id || null,
    hook: hookBrief?.hook || null,
    note: referenceImages.length > 0
      ? "Generated exactly one contextual hook image for slide 1 using the 2026-04-26 watch-stole-the-run runner as the primary Coachi appearance reference. Slides 2+ must use the approved library/Supabase path."
      : "Generated exactly one hook image for slide 1. Slides 2+ must use the approved library/Supabase path."
  });

  console.log(JSON.stringify({
    ok: true,
    model,
    size,
    quality,
    mode: referenceImages.length > 0 ? "edit_with_reference_image" : "generation",
    output_path: outPath,
    provenance_path: provenancePath,
    reference_image: referenceImage ? path.resolve(referenceImage) : null,
    style_reference_image: styleReferenceImage ? path.resolve(styleReferenceImage) : null,
    key_source: source
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
