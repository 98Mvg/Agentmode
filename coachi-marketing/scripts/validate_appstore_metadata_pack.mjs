#!/usr/bin/env node

import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const DEFAULT_INPUT = "outputs/daily/2026-06-22-appstore-connect-update-pack.json";

const DEFAULT_LIMITS = {
  name_max_characters: 30,
  subtitle_max_characters: 30,
  promotional_text_max_characters: 170,
  description_max_characters: 4000,
  keywords_max_bytes: 100,
};

const BANNED_KEYWORD_TERMS = new Set([
  "adidas",
  "apple",
  "garmin",
  "humango",
  "nike",
  "runna",
  "strava",
]);

function parseArgs(argv) {
  const args = new Map();
  const flags = new Set();
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) throw new Error(`Unknown argument: ${arg}`);
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

function usage() {
  console.log(`Usage:
  node scripts/validate_appstore_metadata_pack.mjs --input outputs/daily/2026-06-22-appstore-connect-update-pack.json

Validates App Store Connect metadata fields against Apple field limits and Coachi
conversion rules. Public actions taken: 0.`);
}

export function byteLength(value) {
  return Buffer.byteLength(String(value || ""), "utf8");
}

function charLength(value) {
  return String(value || "").length;
}

export function normalizeWords(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function keywordTerms(keywords) {
  return String(keywords || "")
    .split(",")
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);
}

function push(errors, code, message, detail = {}) {
  errors.push({ code, message, detail });
}

function validateLength(errors, field, value, max, unit = "characters") {
  const count = unit === "bytes" ? byteLength(value) : charLength(value);
  if (count > max) {
    push(errors, `${field}_too_long`, `${field} is ${count}/${max} ${unit}`, { field, count, max, unit });
  }
}

function validateMetadataFields(errors, metadata, limits, prefix) {
  if (!metadata) {
    push(errors, `${prefix}_missing`, `${prefix} is missing`);
    return;
  }
  validateLength(errors, `${prefix}.name`, metadata.name, limits.name_max_characters);
  validateLength(errors, `${prefix}.subtitle`, metadata.subtitle, limits.subtitle_max_characters);
  validateLength(
    errors,
    `${prefix}.promotional_text`,
    metadata.promotional_text,
    limits.promotional_text_max_characters
  );
  validateLength(errors, `${prefix}.description`, metadata.description, limits.description_max_characters);
  validateLength(errors, `${prefix}.keywords`, metadata.keywords, limits.keywords_max_bytes, "bytes");

  if (charLength(metadata.name) < 2) {
    push(errors, `${prefix}.name_too_short`, `${prefix}.name must be at least 2 characters`);
  }
  if (!/\brun|runner|running\b/i.test(`${metadata.name} ${metadata.subtitle} ${metadata.description}`)) {
    push(errors, `${prefix}.runner_positioning_missing`, "metadata does not clearly claim running");
  }
  if (!/\bvoice\b/i.test(`${metadata.subtitle} ${metadata.promotional_text} ${metadata.description}`)) {
    push(errors, `${prefix}.voice_positioning_missing`, "metadata does not preserve the voice-coaching value prop");
  }
}

function validateKeywords(errors, pack, limits) {
  const metadata = pack.recommended_update || {};
  const keywords = metadata.keywords || "";
  const terms = keywordTerms(keywords);
  const rawTerms = String(keywords || "").split(",");
  const duplicateTerms = terms.filter((term, index) => terms.indexOf(term) !== index);
  const appWords = new Set([
    ...normalizeWords(metadata.name),
    ...normalizeWords(metadata.subtitle),
    ...normalizeWords((pack.current_listing_findings?.genres || []).join(" ")),
    "health",
    "fitness",
    "sports",
  ]);

  if (String(keywords).includes(", ")) {
    push(errors, "keywords_have_spaces_after_commas", "keywords should be comma-separated without spaces");
  }
  if (byteLength(keywords) > limits.keywords_max_bytes) {
    push(errors, "keywords_too_long", `keywords are ${byteLength(keywords)}/${limits.keywords_max_bytes} bytes`);
  }
  for (const term of rawTerms) {
    if (term !== term.trim()) {
      push(errors, "keyword_has_outer_space", `keyword has leading/trailing space: ${JSON.stringify(term)}`);
    }
  }
  for (const term of terms) {
    if (byteLength(term) <= 2) {
      push(errors, "keyword_too_short", `keyword must be greater than 2 bytes: ${term}`);
    }
    if (appWords.has(term)) {
      push(errors, "keyword_duplicates_visible_metadata", `keyword duplicates app name/subtitle/category term: ${term}`);
    }
    if (BANNED_KEYWORD_TERMS.has(term)) {
      push(errors, "keyword_banned_company_or_competitor", `keyword uses a competitor/company name: ${term}`);
    }
  }
  for (const term of duplicateTerms) {
    push(errors, "keyword_duplicate", `duplicate keyword term: ${term}`);
  }
}

function validateScreenshots(errors, screenshots) {
  if (!Array.isArray(screenshots) || screenshots.length < 6) {
    push(errors, "screenshots_too_few", "screenshot_sequence must contain at least 6 screenshots");
    return;
  }
  screenshots.forEach((screenshot, index) => {
    const prefix = `screenshot_sequence[${index}]`;
    if (Number(screenshot.position) !== index + 1) {
      push(errors, "screenshot_position_mismatch", `${prefix}.position should be ${index + 1}`);
    }
    validateLength(errors, `${prefix}.headline`, screenshot.headline, 30);
    validateLength(errors, `${prefix}.support`, screenshot.support, 90);
    if (!screenshot.visual_direction) {
      push(errors, "screenshot_visual_direction_missing", `${prefix}.visual_direction is required`);
    }
  });

  const first = screenshots[0] || {};
  if (!/\blive\b/i.test(`${first.headline} ${first.support}`) || !/\brun|coach/i.test(`${first.headline} ${first.support}`)) {
    push(
      errors,
      "first_screenshot_weak",
      "first screenshot should lead with live run coaching instead of setup"
    );
  }
}

function validateVariants(errors, variants, limits) {
  for (const [field, values] of Object.entries(variants || {})) {
    const max =
      field === "name"
        ? limits.name_max_characters
        : field === "subtitle"
          ? limits.subtitle_max_characters
          : field === "promotional_text"
            ? limits.promotional_text_max_characters
            : null;
    if (!max || !Array.isArray(values)) continue;
    values.forEach((value, index) => validateLength(errors, `secondary_variants.${field}[${index}]`, value, max));
  }
}

export function summarizeMetadata(pack) {
  const metadata = pack.recommended_update || {};
  return {
    name_characters: charLength(metadata.name),
    subtitle_characters: charLength(metadata.subtitle),
    promotional_text_characters: charLength(metadata.promotional_text),
    description_characters: charLength(metadata.description),
    keywords_bytes: byteLength(metadata.keywords),
    screenshot_count: Array.isArray(metadata.screenshot_sequence) ? metadata.screenshot_sequence.length : 0,
  };
}

export function validateMetadataPack(pack) {
  const errors = [];
  const warnings = [];
  const limits = { ...DEFAULT_LIMITS, ...(pack.apple_constraints || {}) };

  if (Number(pack.public_actions_taken || 0) !== 0) {
    push(errors, "public_actions_not_zero", "metadata pack should not record public actions");
  }

  validateMetadataFields(errors, pack.recommended_update, limits, "recommended_update");
  validateKeywords(errors, pack, limits);
  validateScreenshots(errors, pack.recommended_update?.screenshot_sequence);
  validateVariants(errors, pack.secondary_variants, limits);

  if (!pack.source_audit) {
    warnings.push({ code: "source_audit_missing", message: "source_audit is missing" });
  }
  if (!Array.isArray(pack.sources) || pack.sources.length === 0) {
    warnings.push({ code: "sources_missing", message: "source links are missing" });
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    summary: summarizeMetadata(pack),
  };
}

async function main() {
  const { args, flags } = parseArgs(process.argv.slice(2));
  if (flags.has("--help")) {
    usage();
    return 0;
  }

  const input = args.get("--input") || DEFAULT_INPUT;
  const pack = JSON.parse(await fs.readFile(input, "utf8"));
  const result = validateMetadataPack(pack);

  console.log(`Validated App Store metadata pack: ${input}`);
  console.log(JSON.stringify(result.summary, null, 2));
  if (result.warnings.length) {
    console.log(`Warnings: ${result.warnings.length}`);
    for (const warning of result.warnings) console.log(`WARN ${warning.code}: ${warning.message}`);
  }
  if (result.errors.length) {
    console.log(`Errors: ${result.errors.length}`);
    for (const error of result.errors) console.log(`FAIL ${error.code}: ${error.message}`);
  } else {
    console.log("App Store metadata pack passed.");
  }

  return result.ok ? 0 : 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(`validate_appstore_metadata_pack.mjs: ${error.message}`);
      process.exitCode = 1;
    });
}
