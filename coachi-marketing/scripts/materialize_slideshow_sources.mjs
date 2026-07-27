#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_USAGE_LOG_PATH = "content/slideshows/visual-library/usage-log.json";

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
  node scripts/materialize_slideshow_sources.mjs \\
    --picklist content/slideshows/YYYY-MM-DD-slug/asset-picklist.json

Copies or downloads selected non-hook library assets into the render manifest's expected input paths.
Slide 1 remains manual: generate it with ChatGPT Images 2.0 and save it to the expected hook path.`);
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function readOptionalJson(filePath) {
  try {
    return await readJson(filePath);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function isRemoteUrl(value) {
  return /^https?:\/\//i.test(value || "");
}

function resolveFrom(baseDir, value) {
  if (!value || isRemoteUrl(value)) return value;
  return path.isAbsolute(value) ? value : path.resolve(baseDir, value);
}

function isEligibleCandidate(candidate) {
  const rightsOk = ["approved", "owned", "licensed", "needs_review"].includes(candidate.source_rights);
  return rightsOk && (candidate.supabase_public_url || candidate.public_url || candidate.local_fallback_path || candidate.local_path);
}

function selectCandidate(candidates, usedAssetIds) {
  const eligible = (candidates || []).filter(isEligibleCandidate);
  return eligible.find((candidate) => !usedAssetIds.has(candidate.id)) || eligible[0];
}

async function download(url, outputPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed ${response.status}: ${url}`);
  }
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
}

async function copyFile(inputPath, outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.copyFile(inputPath, outputPath);
}

async function materializeSlide({ slide, baseDir, preferRemote, dryRun, usedAssetIds }) {
  const expectedInput = resolveFrom(baseDir, slide.expected_input_image);
  if (slide.asset_source === "images_2_0") {
    return {
      slide_number: slide.slide_number,
      role: slide.role,
      status: "manual_images_2_0_required",
      expected_input_image: expectedInput,
      prompt_hint: slide.instruction?.prompt_hint || null
    };
  }

  const candidate = selectCandidate(slide.instruction?.candidate_assets, usedAssetIds);
  if (!candidate) {
    return {
      slide_number: slide.slide_number,
      role: slide.role,
      status: "missing_candidate",
      expected_input_image: expectedInput
    };
  }

  const remoteUrl = candidate.supabase_public_url || candidate.public_url;
  const localFallback = candidate.local_fallback_path || candidate.local_path;
  const source = preferRemote && remoteUrl
    ? { kind: "remote", value: remoteUrl }
    : { kind: "local", value: resolveFrom(process.cwd(), localFallback) };

  let fallbackReason = null;
  if (!dryRun) {
    if (source.kind === "remote") {
      try {
        await download(source.value, expectedInput);
      } catch (error) {
        if (!localFallback) throw error;
        fallbackReason = error.message;
        source.kind = "local_fallback_after_remote_error";
        source.value = resolveFrom(process.cwd(), localFallback);
        await copyFile(source.value, expectedInput);
      }
    } else {
      await copyFile(source.value, expectedInput);
    }
  }
  usedAssetIds.add(candidate.id);

  return {
    slide_number: slide.slide_number,
    role: slide.role,
    status: dryRun ? "dry_run_selected" : "materialized",
    selected_asset_id: candidate.id,
    selected_source_rights: candidate.source_rights || "needs_review",
    selected_asset_source_kind: candidate.source_kind || null,
    selected_asset_original_source_kind: candidate.original_source_kind || candidate.source_kind || null,
    selected_source_kind: source.kind,
    selected_source: source.value,
    fallback_reason: fallbackReason,
    selected_supabase_asset: Boolean(remoteUrl),
    expected_input_image: expectedInput,
    supabase_public_url: remoteUrl || null,
    local_fallback_path: localFallback || null
  };
}

async function updateUsageLog({ usageLogPath, picklist, report, slideshowId }) {
  const usageLog = await readOptionalJson(usageLogPath) || {
    schema_version: 1,
    updated: new Date().toISOString().slice(0, 10),
    purpose: "Track slideshow visual asset reuse so the visual library rotates correctly.",
    rotation_policy: {
      max_uses_per_asset_per_30_days: 2,
      max_reuse_in_last_posts: 10,
      prefer_zero_use_assets: true
    },
    uses: []
  };

  const slideByNumber = new Map((picklist.slides || []).map((slide) => [slide.slide_number, slide]));
  const existingKeys = new Set(
    (usageLog.uses || []).map((use) => `${use.slideshow_id}|${use.slide_number}|${use.asset_id}`)
  );
  const appended = [];

  for (const result of report.results || []) {
    if (!result.selected_asset_id) continue;
    const slide = slideByNumber.get(result.slide_number) || {};
    const entry = {
      used_at: report.generated_at,
      stage: "selected",
      slideshow_id: slideshowId,
      slide_number: result.slide_number,
      role: result.role,
      asset_id: result.selected_asset_id,
      visual_collection: slide.visual_collection || null,
      asset_source: slide.asset_source || null,
      asset_source_kind: result.selected_asset_source_kind || null,
      asset_original_source_kind: result.selected_asset_original_source_kind || null,
      selected_source_kind: result.selected_source_kind,
      supabase_public_url: result.supabase_public_url || null,
      local_fallback_path: result.local_fallback_path || null
    };
    const key = `${entry.slideshow_id}|${entry.slide_number}|${entry.asset_id}`;
    if (existingKeys.has(key)) continue;
    usageLog.uses.push(entry);
    existingKeys.add(key);
    appended.push(entry);
  }

  usageLog.updated = report.generated_at.slice(0, 10);
  await writeJson(usageLogPath, usageLog);

  return {
    path: path.relative(process.cwd(), usageLogPath),
    appended_uses: appended.length,
    slideshow_id: slideshowId
  };
}

async function main() {
  const { args, flags } = parseArgs(process.argv.slice(2));
  if (flags.has("--help") || flags.has("-h")) {
    printHelp();
    return;
  }

  const picklistPath = args.get("--picklist");
  if (!picklistPath) {
    printHelp();
    process.exit(1);
  }

  const absolutePicklistPath = path.resolve(picklistPath);
  const picklist = await readJson(absolutePicklistPath);
  const manifestPath = path.resolve(picklist.manifest);
  const manifestDir = path.dirname(manifestPath);
  const renderManifest = await readJson(manifestPath);
  const baseDir = path.resolve(manifestDir, renderManifest.base_dir || ".");
  const preferRemote = flags.has("--prefer-remote");
  const dryRun = flags.has("--dry-run");
  const slideshowId = args.get("--slideshow-id") || path.basename(manifestDir);

  const results = [];
  const usedAssetIds = new Set();
  for (const slide of picklist.slides || []) {
    results.push(await materializeSlide({ slide, baseDir, preferRemote, dryRun, usedAssetIds }));
  }

  const generatedAt = new Date().toISOString();
  const report = {
    generated_at: generatedAt,
    picklist: path.relative(process.cwd(), absolutePicklistPath),
    prefer_remote: preferRemote,
    dry_run: dryRun,
    results
  };
  if (!dryRun) {
    const usageLogPath = path.resolve(args.get("--usage-log") || picklist.usage_log || DEFAULT_USAGE_LOG_PATH);
    report.usage_log_update = await updateUsageLog({
      usageLogPath,
      picklist,
      report,
      slideshowId
    });
  }

  const outPath = args.get("--out");
  if (outPath) {
    await writeJson(path.resolve(outPath), report);
  } else {
    console.log(JSON.stringify(report, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
