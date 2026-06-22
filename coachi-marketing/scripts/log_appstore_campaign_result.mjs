#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DEFAULT_RESULTS_PATH = path.join(ROOT, "inputs", "performance", "appstore-campaign-results.json");
const DEFAULT_READINESS_PATH = "outputs/daily/2026-06-22-appstore-campaign-readiness.json";
const WINDOWS = new Set(["baseline", "2h", "24h", "48h", "7d"]);

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
  node scripts/log_appstore_campaign_result.mjs --campaign x_product_proof_20260622 --window baseline --clicks 0 --product-page-views 0 --first-time-downloads 0
  node scripts/log_appstore_campaign_result.mjs --campaign x_product_proof_20260622 --window 24h --clicks 42 --product-page-views 30 --first-time-downloads 4 --post-url https://x.com/...

Appends measured App Store campaign/download results to inputs/performance/appstore-campaign-results.json.
Use --dry-run to validate an entry without writing fake metrics.`);
}

function numberArg(args, name) {
  const value = args.get(name);
  if (value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`${name} must be a number.`);
  return parsed;
}

function boolArg(args, name) {
  const value = args.get(name);
  if (value === undefined || value === "") return null;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes"].includes(normalized)) return true;
  if (["0", "false", "no"].includes(normalized)) return false;
  throw new Error(`${name} must be true or false.`);
}

function listArg(args, name) {
  const value = args.get(name);
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function readOptionalJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function rate(numerator, denominator) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return null;
  return Number((numerator / denominator).toFixed(4));
}

export function decideResult(entry) {
  const clicks = entry.posthog_app_store_clicks ?? 0;
  const views = entry.app_store_product_page_views ?? 0;
  const downloads = entry.app_store_first_time_downloads ?? 0;

  if (clicks < 10 && downloads === 0) return "increase_distribution";
  if (clicks >= 10 && views < Math.max(3, clicks * 0.25)) return "inspect_redirect_or_apple_attribution";
  if (views >= 10 && downloads === 0) return "improve_app_store_conversion";
  if (downloads > 0) return "continue_and_compare_campaigns";
  return "collect_more_data";
}

export function buildResultEntry({
  args,
  readiness,
  now = new Date(),
}) {
  const campaign = args.get("--campaign");
  const window = args.get("--window") || "baseline";
  if (!campaign) throw new Error("--campaign is required.");
  if (!WINDOWS.has(window)) throw new Error(`--window must be one of: ${[...WINDOWS].join(", ")}`);

  const firstTimeDownloads = numberArg(args, "--first-time-downloads");
  const productPageViews = numberArg(args, "--product-page-views");
  const clicks = numberArg(args, "--clicks") ?? numberArg(args, "--posthog-app-store-clicks");
  const totalDownloads = numberArg(args, "--total-downloads");
  const conversionRateInput = numberArg(args, "--conversion-rate");
  const conversionRate =
    conversionRateInput ?? rate(firstTimeDownloads ?? null, productPageViews ?? null);

  const entry = {
    logged_at: now.toISOString(),
    measured_at: args.get("--measured-at") || now.toISOString(),
    campaign,
    source: args.get("--source") || null,
    window,
    readiness_report: args.get("--readiness") || DEFAULT_READINESS_PATH,
    ready_for_approval_execution: readiness?.ready_for_approval_execution ?? null,
    provider_token_complete: readiness?.provider_token_complete ?? null,
    provider_token_present: boolArg(args, "--provider-token-present"),
    public_actions_posted: numberArg(args, "--public-actions-posted"),
    post_urls: listArg(args, "--post-url").length ? listArg(args, "--post-url") : listArg(args, "--post-urls"),
    posthog_app_store_clicks: clicks,
    clicks_by_source: args.get("--clicks-by-source") || null,
    clicks_by_campaign: args.get("--clicks-by-campaign") || null,
    app_store_product_page_views: productPageViews,
    app_store_first_time_downloads: firstTimeDownloads,
    app_store_total_downloads: totalDownloads,
    app_store_conversion_rate: conversionRate,
    app_store_campaign_rows_visible: boolArg(args, "--campaign-rows-visible"),
    best_campaign: args.get("--best-campaign") || null,
    notes: args.get("--notes") || null,
  };
  entry.decision = decideResult(entry);
  return entry;
}

async function main() {
  const { args, flags } = parseArgs(process.argv.slice(2));
  if (flags.has("--help") || flags.has("-h")) {
    usage();
    return 0;
  }

  const outputPath = args.get("--results") || DEFAULT_RESULTS_PATH;
  const readinessPath = args.get("--readiness") || DEFAULT_READINESS_PATH;
  const dryRun = flags.has("--dry-run");
  const previewOut = args.get("--preview-out");
  const readiness = await readOptionalJson(readinessPath, null);
  const entry = buildResultEntry({ args, readiness });

  if (previewOut) await writeJson(previewOut, { dry_run: dryRun, entry });

  if (dryRun) {
    console.log(JSON.stringify({ ok: true, dry_run: true, entry }, null, 2));
    return 0;
  }

  const results = await readOptionalJson(outputPath, {
    version: 1,
    purpose: "Measured App Store campaign results for Coachi download growth.",
    entries: [],
  });
  results.entries = Array.isArray(results.entries) ? results.entries : [];
  results.entries.push(entry);
  results.updated_at = entry.logged_at;
  await writeJson(outputPath, results);
  console.log(`Logged App Store campaign result: ${entry.campaign} ${entry.window}`);
  console.log(`Decision: ${entry.decision}`);
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(`log_appstore_campaign_result.mjs: ${error.message}`);
      process.exitCode = 1;
    });
}
