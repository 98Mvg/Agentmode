#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import {
  fitShortHookTypography,
  wrapTextByCharacters
} from "./slideshow_text_layout.mjs";

function printHelp() {
  console.log(`Usage:
  node scripts/render_slideshow_deck.mjs --manifest content/slideshows/YYYY-MM-DD-slug/render-manifest.json

Manifest paths are resolved from manifest.base_dir, relative to the manifest file.
Run with --dry-run to validate paths without rendering.
Use --allow-missing-inputs with --dry-run when the Images 2.0 hook image has not been saved yet.`);
}

const DEFAULT_USAGE_LOG_PATH = process.env.SLIDESHOW_USAGE_LOG_PATH || "content/slideshows/visual-library/usage-log.json";

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

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrapText(text, maxCharsPerLine) {
  return wrapTextByCharacters(text, maxCharsPerLine);
}

function wrapMeasuredText(ctx, text, maxWidth) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !current) {
      current = next;
      continue;
    }
    lines.push(current);
    current = word;
  }

  if (current) lines.push(current);
  return lines.length ? lines : [String(text)];
}

const ALLOWED_TEXT_POSITIONS = new Set(["top", "center", "lower_middle", "bottom"]);
const MAX_HOOK_WORDS = 25;
const SHORT_HOOK_WORDS = 8;
const SHORT_HOOK_MAX_LINES = 2;
const LONG_HOOK_MAX_LINES = 5;

function normalizeTextPosition(position) {
  if (position === "bottom") return "lower_middle";
  return ALLOWED_TEXT_POSITIONS.has(position) ? position : "lower_middle";
}

function textStartY({ position, height, safeMargin, fontSize, lineHeight, lineCount }) {
  const totalHeight = lineHeight * lineCount;
  const normalized = normalizeTextPosition(position);
  if (normalized === "top") return safeMargin + fontSize;
  if (normalized === "lower_middle") return height * 0.6 - totalHeight / 2 + fontSize;
  return height / 2 - totalHeight / 2 + fontSize;
}

function wordCount(value) {
  return String(value || "").trim().split(/\s+/).filter(Boolean).length;
}

function validateHookSlideText({ slide, options }) {
  if (Number(slide.slide_number) !== 1) return;
  const words = wordCount(slide.text);
  if (words > MAX_HOOK_WORDS) {
    throw new Error(`Slide 1 hook is too long (${words} words). Hooks must be ${MAX_HOOK_WORDS} words or fewer.`);
  }

  const lines = wrapText(slide.text, options.maxCharsPerLine);
  const maxLines = words <= SHORT_HOOK_WORDS ? SHORT_HOOK_MAX_LINES : LONG_HOOK_MAX_LINES;
  if (lines.length > maxLines) {
    throw new Error(`Slide 1 hook wraps to ${lines.length} lines. Hooks must render in ${maxLines} lines or fewer.`);
  }

  const startY = textStartY({
    position: options.position,
    height: options.height,
    safeMargin: options.safeMargin,
    fontSize: options.fontSize,
    lineHeight: options.lineHeight,
    lineCount: lines.length
  });
  const bottomY = startY + options.lineHeight * Math.max(0, lines.length - 1);
  if (bottomY > options.height * 0.75) {
    throw new Error("Slide 1 hook is inside the bottom 25% TikTok UI zone.");
  }
  if (options.strokeWidth < 8 || options.gradientOpacity < 0.58) {
    throw new Error("Slide 1 hook contrast is too weak. Use stroke_width >= 8 and gradient_opacity >= 0.58.");
  }
}

function gradientSvg({ width, height, position, opacity }) {
  const safeOpacity = Number.isFinite(opacity) ? opacity : 0.64;
  const normalized = normalizeTextPosition(position);
  const stops = normalized === "top"
    ? `<stop offset="0%" stop-color="#000000" stop-opacity="${safeOpacity}"/><stop offset="58%" stop-color="#000000" stop-opacity="0"/>`
    : normalized === "center"
      ? `<stop offset="0%" stop-color="#000000" stop-opacity="${safeOpacity * 0.16}"/><stop offset="34%" stop-color="#000000" stop-opacity="0"/><stop offset="48%" stop-color="#000000" stop-opacity="${safeOpacity * 0.58}"/><stop offset="62%" stop-color="#000000" stop-opacity="${safeOpacity * 0.58}"/><stop offset="100%" stop-color="#000000" stop-opacity="${safeOpacity * 0.16}"/>`
      : `<stop offset="0%" stop-color="#000000" stop-opacity="0"/><stop offset="42%" stop-color="#000000" stop-opacity="0"/><stop offset="56%" stop-color="#000000" stop-opacity="${safeOpacity * 0.58}"/><stop offset="75%" stop-color="#000000" stop-opacity="${safeOpacity * 0.58}"/><stop offset="100%" stop-color="#000000" stop-opacity="${safeOpacity * 0.16}"/>`;

  return Buffer.from(`
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="textGradient" x1="0" y1="0" x2="0" y2="1">${stops}</linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#textGradient)"/>
</svg>`);
}

function textSvg(options) {
  const {
    width,
    height,
    text,
    position,
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    maxCharsPerLine,
    textColor,
    strokeColor,
    strokeWidth,
    safeMargin
  } = options;

  const lines = wrapText(text, maxCharsPerLine);
  const startY = textStartY({
    position,
    height,
    safeMargin,
    fontSize,
    lineHeight,
    lineCount: lines.length
  });

  const tspans = lines
    .map((line, index) => {
      const y = Math.round(startY + index * lineHeight);
      return `<tspan x="${Math.round(width / 2)}" y="${y}">${escapeXml(line)}</tspan>`;
    })
    .join("");

  return Buffer.from(`
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .headline {
      font-family: ${escapeXml(fontFamily)};
      font-size: ${fontSize}px;
      font-weight: ${fontWeight};
      fill: ${escapeXml(textColor)};
      stroke: ${escapeXml(strokeColor)};
      stroke-width: ${strokeWidth}px;
      stroke-linejoin: round;
      paint-order: stroke fill;
    }
  </style>
  <text class="headline" text-anchor="middle">${tspans}</text>
</svg>`);
}

async function loadCanvasRenderer() {
  try {
    return await import("@napi-rs/canvas");
  } catch {
    return null;
  }
}

function registerFont({ GlobalFonts, fontPath, fontFamily }) {
  if (!fontPath || !GlobalFonts?.registerFromPath) return;
  try {
    GlobalFonts.registerFromPath(fontPath, fontFamily);
  } catch {
    // Rendering should not fail just because an optional local font is unavailable.
  }
}

function textPngCanvas(options, canvasRenderer) {
  const {
    width,
    height,
    text,
    position,
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    maxCharsPerLine,
    textColor,
    strokeColor,
    strokeWidth,
    safeMargin,
    fontPath
  } = options;

  const { createCanvas, GlobalFonts } = canvasRenderer;
  registerFont({ GlobalFonts, fontPath, fontFamily });

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = textColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.lineJoin = "round";

  const measuredLines = wrapMeasuredText(ctx, text, width - safeMargin * 2);
  const fallbackLines = wrapText(text, maxCharsPerLine);
  const lines = measuredLines.length > 5 ? fallbackLines : measuredLines;
  const startY = textStartY({
    position,
    height,
    safeMargin,
    fontSize,
    lineHeight,
    lineCount: lines.length
  }) - fontSize / 2;

  lines.forEach((line, index) => {
    const y = Math.round(startY + index * lineHeight);
    ctx.strokeText(line, width / 2, y);
    ctx.fillText(line, width / 2, y);
  });

  return canvas.toBuffer("image/png");
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function readOptionalJson(filePath, fallback) {
  try {
    return await readJson(filePath);
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function resolveFrom(baseDir, value) {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  return path.isAbsolute(value) ? value : path.resolve(baseDir, value);
}

function isRemoteUrl(value) {
  return /^https?:\/\//i.test(value || "");
}

async function sharpInput(inputPath) {
  if (!isRemoteUrl(inputPath)) return inputPath;
  const response = await fetch(inputPath);
  if (!response.ok) {
    throw new Error(`Remote image fetch failed ${response.status}: ${inputPath}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

function slideOptions(manifest, slide) {
  const defaults = manifest.defaults || {};
  const width = slide.width || manifest.width || defaults.width || 1080;
  const height = slide.height || manifest.height || defaults.height || 1920;
  const hookWords = Number(slide.slide_number) === 1 ? wordCount(slide.text) : 0;
  const dynamicHookFontSize = hookWords <= SHORT_HOOK_WORDS
    ? 92
    : hookWords <= 12
      ? 84
      : hookWords <= 18
        ? 74
        : 64;
  const dynamicHookMaxChars = hookWords <= SHORT_HOOK_WORDS
    ? 16
    : hookWords <= 12
      ? 20
      : 24;
  const requestedFontSize = slide.font_size || defaults.font_size || (slide.slide_number === 1 ? dynamicHookFontSize : 76);
  const requestedMaxChars = slide.max_chars_per_line
    || defaults.max_chars_per_line
    || (slide.slide_number === 1 ? dynamicHookMaxChars : 24);
  const fittedHook = Number(slide.slide_number) === 1 && hookWords <= SHORT_HOOK_WORDS
    ? fitShortHookTypography({
        text: slide.text,
        fontSize: requestedFontSize,
        maxCharsPerLine: requestedMaxChars
      })
    : {
        fontSize: requestedFontSize,
        maxCharsPerLine: requestedMaxChars
      };
  const fontSize = fittedHook.fontSize;

  return {
    width,
    height,
    text: slide.text,
    position: normalizeTextPosition(slide.text_position || defaults.text_position || "lower_middle"),
    fontFamily: slide.font_family || defaults.font_family || "Arial Black, Impact, sans-serif",
    fontSize,
    fontWeight: slide.font_weight || defaults.font_weight || 900,
    lineHeight: slide.line_height || defaults.line_height || Math.round(fontSize * (slide.slide_number === 1 && hookWords > SHORT_HOOK_WORDS ? 1.12 : 1.16)),
    maxCharsPerLine: fittedHook.maxCharsPerLine,
    textColor: slide.text_color || defaults.text_color || "#FFFFFF",
    strokeColor: slide.stroke_color || defaults.stroke_color || "#111111",
    strokeWidth: slide.stroke_width || defaults.stroke_width || 8,
    safeMargin: slide.safe_margin || defaults.safe_margin || 96,
    fontPath: slide.font_path || defaults.font_path || undefined,
    gradientOpacity: slide.gradient_opacity || defaults.gradient_opacity || 0.64,
    imagePosition: slide.image_position || defaults.image_position || "center",
    outputFormat: slide.output_format || manifest.output_format || defaults.output_format || "png",
    quality: slide.quality || manifest.quality || defaults.quality || 92
  };
}

async function inputExists(inputPath) {
  if (isRemoteUrl(inputPath)) return true;
  try {
    await fs.access(inputPath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function renderDeck({ manifestPath, dryRun, allowMissingInputs }) {
  const absoluteManifestPath = path.resolve(manifestPath);
  const manifest = await readJson(absoluteManifestPath);
  const manifestDir = path.dirname(absoluteManifestPath);
  const baseDir = resolveFrom(manifestDir, manifest.base_dir || ".");
  const outputDir = resolveFrom(baseDir, manifest.output_dir || "slides/rendered");

  if (!Array.isArray(manifest.slides) || manifest.slides.length === 0) {
    throw new Error("Manifest must include a non-empty slides array.");
  }

  const jobs = manifest.slides.map((slide) => {
    if (!slide.input_image) throw new Error(`Slide ${slide.slide_number || "unknown"} is missing input_image.`);
    if (!slide.text) throw new Error(`Slide ${slide.slide_number || "unknown"} is missing text.`);
	    const options = slideOptions(manifest, slide);
	    validateHookSlideText({ slide, options });
	    const extension = options.outputFormat === "jpg" || options.outputFormat === "jpeg" ? "jpg" : "png";
    const outputFile = slide.output_file || `${String(slide.slide_number).padStart(2, "0")}-${slide.role || "slide"}.${extension}`;
    return {
      slide,
      options,
      inputPath: resolveFrom(baseDir, slide.input_image),
      outputPath: resolveFrom(outputDir, outputFile)
    };
  });

  const missingInputs = [];
  for (const job of jobs) {
    if (!(await inputExists(job.inputPath))) {
      missingInputs.push({
        slide_number: job.slide.slide_number,
        input: job.inputPath
      });
    }
  }

  if (missingInputs.length > 0 && !(dryRun && allowMissingInputs)) {
    throw new Error(`Missing input image(s): ${missingInputs.map((item) => item.input).join(", ")}`);
  }

  if (dryRun) {
    console.log(JSON.stringify({
      ok: true,
      manifest: absoluteManifestPath,
      output_dir: outputDir,
      missing_inputs: missingInputs,
      slides: jobs.map((job) => ({
        slide_number: job.slide.slide_number,
        input: job.inputPath,
        output: job.outputPath,
        text: job.slide.text
      }))
    }, null, 2));
    return;
  }

  const { default: sharp } = await import("sharp").catch((error) => {
    throw new Error(`Missing dependency: sharp. Run npm install in the marketing workspace first. ${error.message}`);
  });
  const canvasRenderer = await loadCanvasRenderer();

  await fs.mkdir(outputDir, { recursive: true });

  for (const job of jobs) {
    const { options } = job;
    const gradient = gradientSvg({
      width: options.width,
      height: options.height,
      position: options.position,
      opacity: options.gradientOpacity
    });
    const overlay = textSvg(options);
    const textLayer = canvasRenderer ? textPngCanvas(options, canvasRenderer) : overlay;
    const input = await sharpInput(job.inputPath);
    const pipeline = sharp(input)
      .rotate()
      .resize(options.width, options.height, {
        fit: "cover",
        position: options.imagePosition
      })
      .composite([
        { input: gradient, top: 0, left: 0 },
        { input: textLayer, top: 0, left: 0 }
      ]);

    if (options.outputFormat === "jpg" || options.outputFormat === "jpeg") {
      await pipeline.jpeg({ quality: options.quality }).toFile(job.outputPath);
    } else {
      await pipeline.png({ compressionLevel: 8 }).toFile(job.outputPath);
    }
    console.log(`rendered ${path.relative(process.cwd(), job.outputPath)}`);
  }

  await updateRenderedUsage({ packDir: manifestDir });
}

async function updateRenderedUsage({ packDir }) {
  const reportPath = path.join(packDir, "materialize-report.json");
  const report = await readOptionalJson(reportPath, null);
  if (!report) return;

  const usageLogPath = path.resolve(DEFAULT_USAGE_LOG_PATH);
  const usageLog = await readOptionalJson(usageLogPath, {
    schema_version: 1,
    updated: null,
    purpose: "Track slideshow visual asset reuse so the visual library rotates correctly.",
    rotation_policy: {
      max_uses_per_asset_per_30_days: 2,
      max_reuse_in_last_posts: 10,
      prefer_zero_use_assets: true
    },
    uses: []
  });
  const renderedAt = new Date().toISOString();
  const slideshowId = path.basename(packDir);
  const existing = new Set((usageLog.uses || []).map((use) => [
    use.stage || use.event_type || "legacy",
    use.slideshow_id,
    use.platform || "",
    use.slide_number,
    use.asset_id
  ].join("|")));

  for (const result of report.results || []) {
    if (!result.selected_asset_id) continue;
    const entry = {
      used_at: renderedAt,
      stage: "rendered",
      slideshow_id: slideshowId,
      slide_number: result.slide_number,
      role: result.role,
      asset_id: result.selected_asset_id,
      source_rights: result.selected_source_rights || "needs_review",
      selected_source_kind: result.selected_source_kind,
      supabase_public_url: result.supabase_public_url || null,
      local_fallback_path: result.local_fallback_path || null
    };
    const key = [
      entry.stage,
      entry.slideshow_id,
      "",
      entry.slide_number,
      entry.asset_id
    ].join("|");
    if (existing.has(key)) continue;
    usageLog.uses.push(entry);
    existing.add(key);
  }

  usageLog.updated = renderedAt.slice(0, 10);
  await writeJson(usageLogPath, usageLog);
}

const { args, flags } = parseArgs(process.argv.slice(2));
if (flags.has("--help") || flags.has("-h")) {
  printHelp();
  process.exit(0);
}

const manifestPath = args.get("--manifest");
if (!manifestPath) {
  printHelp();
  process.exit(1);
}

renderDeck({
  manifestPath,
  dryRun: flags.has("--dry-run"),
  allowMissingInputs: flags.has("--allow-missing-inputs")
}).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
