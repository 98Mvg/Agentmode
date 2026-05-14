#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { isPublicHttpsUrl, postizApiBase } from "./slideshow_postiz_payload.mjs";

await import("dotenv").then(({ config }) => {
  config();
  config({ path: ".env.local" });
}).catch(() => {});

const ROOT = process.cwd();
const ENGINE_DIR = path.join(ROOT, "strategy/automation/tiktok-instagram-slideshow-content-engine");
const SCHEMA_DIR = path.join(ENGINE_DIR, "schemas");
const FORMAT_CAPTURE_MANIFEST_PATH = path.join(ROOT, "inputs/research/slideshow-format-captures/format-capture-manifest.json");
const RAW_PROBLEM_BANK_PATH = path.join(ROOT, "inputs/research/raw-runner-problems.json");
const SUPABASE_LIBRARY_MANIFEST_PATH = path.join(ROOT, "content/slideshows/visual-library/supabase-library-manifest.json");
const USAGE_LOG_PATH = path.join(ROOT, "content/slideshows/visual-library/usage-log.json");
const RESULTS_PATH = path.join(ROOT, "inputs/performance/slideshow-results.json");
const POSTED_REGISTRY_PATH = path.join(ROOT, "inputs/performance/posted-slideshows.json");
const PRODUCTION_RIGHTS = new Set(["approved", "owned", "licensed"]);

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

function countBy(items, keyFn) {
  return items.reduce((counts, item) => {
    const key = keyFn(item) || "unknown";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function metric(value) {
  return Number.isFinite(value) ? value : 0;
}

function rate(numerator, denominator) {
  const bottom = metric(denominator);
  if (bottom <= 0) return null;
  return Number((metric(numerator) / bottom).toFixed(4));
}

function topValues(results, key, scoreKey) {
  const totals = new Map();
  for (const result of results) {
    const id = result[key];
    if (!id) continue;
    const current = totals.get(id) || { id, count: 0, score: 0 };
    current.count += 1;
    current.score += metric(result[scoreKey]);
    totals.set(id, current);
  }
  return [...totals.values()]
    .sort((left, right) => right.score - left.score || right.count - left.count)
    .slice(0, 5);
}

function flattenSupabaseItems(manifest) {
  return (manifest.collections || []).flatMap((collection) => collection.items || []);
}

async function schemaReport() {
  const files = (await fs.readdir(SCHEMA_DIR)).filter((file) => file.endsWith(".json")).sort();
  return {
    count: files.length,
    files
  };
}

async function formatCaptureReport() {
  const manifest = await readJson(FORMAT_CAPTURE_MANIFEST_PATH);
  const captures = manifest.captures || [];
  const targetMin = manifest.target_capture_count_per_schema_family?.min || 20;
  const byFamily = countBy(captures, (capture) => capture.schema_family);
  const underTargetFamilies = Object.entries(byFamily)
    .filter(([, count]) => count < targetMin)
    .map(([family, count]) => ({
      family,
      count,
      needed_for_minimum: targetMin - count
    }));

  return {
    captures: captures.length,
    target_min_per_schema_family: targetMin,
    by_family: byFamily,
    under_target_families: underTargetFamilies
  };
}

async function rawProblemReport() {
  const bank = await readJson(RAW_PROBLEM_BANK_PATH);
  const problems = bank.problems || [];
  const sourceBackedTopFive = problems
    .filter((problem) => Array.isArray(problem.sourced_mistakes) && problem.sourced_mistakes.length >= 5)
    .map((problem) => ({
      id: problem.id,
      sourced_mistakes: problem.sourced_mistakes.length
    }));

  return {
    problems: problems.length,
    source_backed_top_five_topics: sourceBackedTopFive.length,
    source_backed_problem_ids: sourceBackedTopFive.map((problem) => problem.id)
  };
}

async function visualLibraryReport() {
  const manifest = await readJson(SUPABASE_LIBRARY_MANIFEST_PATH);
  const items = flattenSupabaseItems(manifest);
  const byRights = countBy(items, (item) => item.source_rights);
  const productionReadyItems = items.filter((item) => PRODUCTION_RIGHTS.has(item.source_rights));
  const productionReadyByCollection = countBy(productionReadyItems, (item) => item.collection_id);

  return {
    collections: manifest.collections?.length || 0,
    items: items.length,
    public_urls_ready: Boolean(manifest.supabase?.url_set),
    by_source_rights: byRights,
    production_ready_items: productionReadyItems.length,
    production_ready_by_collection: productionReadyByCollection,
    needs_review_items: byRights.needs_review || 0
  };
}

async function performanceReport() {
  const results = await readOptionalJson(RESULTS_PATH, { results: [] });
  const posted = await readOptionalJson(POSTED_REGISTRY_PATH, { posts: [] });
  const usage = await readOptionalJson(USAGE_LOG_PATH, { uses: [] });
  const publicUses = (usage.uses || []).filter((use) => use.stage === "posted");
  const enrichedResults = (results.results || []).map((result) => {
    const views = metric(result.views_24h) || metric(result.views_1h);
    return {
      ...result,
      save_rate: result.save_rate ?? rate(result.saves, views),
      comment_rate: result.comment_rate ?? rate(result.comments, views),
      profile_visit_rate: result.profile_visit_rate ?? rate(result.profile_visits, views),
      install_intent_score: result.install_intent_score ?? (
        metric(result.saves) * 2 +
        metric(result.comments) * 3 +
        metric(result.profile_visits) * 5 +
        metric(result.app_store_clicks) * 8 +
        metric(result.installs) * 20
      )
    };
  });

  return {
    logged_results: enrichedResults.length,
    repeat_winners: enrichedResults.filter((result) => result.decision === "repeat").length,
    posted_slideshows: posted.posts?.length || 0,
    posted_asset_uses: publicUses.length,
    recommendations: {
      hooks_to_reuse: topValues(enrichedResults, "hook", "install_intent_score"),
      formats_to_scale: topValues(enrichedResults, "format_id", "install_intent_score"),
      topics_to_avoid: enrichedResults
        .filter((result) => metric(result.views_24h) > 0 && metric(result.install_intent_score) === 0)
        .map((result) => result.topic || result.source_problem_id || result.slideshow_id)
        .filter(Boolean)
        .slice(0, 5),
      visual_styles_that_perform: topValues(enrichedResults, "visual_style", "install_intent_score")
    }
  };
}

function liveEngineeringReport({ visuals }) {
  let apiBase = null;
  try {
    apiBase = process.env.POSTIZ_URL || process.env.POSTIZ_PUBLIC_API_BASE ? postizApiBase() : null;
  } catch {
    apiBase = null;
  }
  const postiz = {
    POSTIZ_ENABLE_LIVE_POSTING: process.env.POSTIZ_ENABLE_LIVE_POSTING === "1",
    POSTIZ_API_KEY: Boolean(process.env.POSTIZ_API_KEY),
    POSTIZ_TIKTOK_ACCOUNT_ID: Boolean(process.env.POSTIZ_TIKTOK_ACCOUNT_ID),
    POSTIZ_URL_OR_PUBLIC_API_BASE: Boolean(process.env.POSTIZ_URL || process.env.POSTIZ_PUBLIC_API_BASE),
    POSTIZ_API_BASE_HTTPS: Boolean(apiBase && isPublicHttpsUrl(apiBase)),
    postiz_api_base: apiBase
  };
  const blockers = [];
  if (visuals.production_ready_items < 30) {
    blockers.push(`Only ${visuals.production_ready_items} visual assets are approved/owned/licensed; production rotation needs a reviewed pool.`);
  }
  if (!visuals.public_urls_ready) {
    blockers.push("Supabase public visual URLs are not ready.");
  }
  if (!postiz.POSTIZ_ENABLE_LIVE_POSTING) {
    blockers.push("POSTIZ_ENABLE_LIVE_POSTING is not 1.");
  }
  if (!postiz.POSTIZ_API_KEY) {
    blockers.push("POSTIZ_API_KEY is missing.");
  }
  if (!postiz.POSTIZ_TIKTOK_ACCOUNT_ID) {
    blockers.push("POSTIZ_TIKTOK_ACCOUNT_ID is missing.");
  }
  if (!postiz.POSTIZ_URL_OR_PUBLIC_API_BASE) {
    blockers.push("POSTIZ_URL or POSTIZ_PUBLIC_API_BASE is missing.");
  }
  if (!postiz.POSTIZ_API_BASE_HTTPS) {
    blockers.push("Postiz public API/upload base must be HTTPS for TikTok direct public media.");
  }
  return {
    ready: blockers.length === 0,
    postiz,
    blockers
  };
}

function growthQualityReport({ formats, rawProblems, performance }) {
  const gaps = [];
  const nextActions = [];

  if (formats.captures < formats.target_min_per_schema_family) {
    gaps.push(`Only ${formats.captures} format captures exist; the article target is at least ${formats.target_min_per_schema_family} per schema family.`);
    nextActions.push("Capture 20 TikTok/Instagram examples for the next active schema family, storing structure notes only.");
  }

  if (formats.under_target_families.length > 0) {
    nextActions.push(`Fill format capture gaps: ${formats.under_target_families.map((item) => `${item.family} +${item.needed_for_minimum}`).join(", ")}.`);
  }

  if (rawProblems.source_backed_top_five_topics < 5) {
    gaps.push(`Only ${rawProblems.source_backed_top_five_topics} problem topics have 5 sourced mistakes; Top 5 production should have more source-backed topics.`);
    nextActions.push("Mine Reddit/TikTok comments for exact mistake wording before generating new Top 5 decks.");
  }

  if (performance.posted_slideshows === 0) {
    gaps.push("No posted slideshow registry entries exist, so reuse protection has no live signal yet.");
    nextActions.push("After each public post, run slideshow:log-result with --mark-posted and the public URL.");
  }

  if (performance.logged_results < 5) {
    nextActions.push("Log TikTok/Instagram results at 1h and 24h so the winner loop can repeat formats with proof.");
  }

  return {
    ready: gaps.length === 0,
    gaps,
    next_actions: [...new Set(nextActions)]
  };
}

const [schemas, formats, rawProblems, visuals, performance] = await Promise.all([
  schemaReport(),
  formatCaptureReport(),
  rawProblemReport(),
  visualLibraryReport(),
  performanceReport()
]);

const liveEngineering = liveEngineeringReport({ visuals });
const growthQuality = growthQualityReport({ formats, rawProblems, performance });

console.log(JSON.stringify({
  ok: true,
  generated_at: new Date().toISOString(),
  production_ready: liveEngineering.ready,
  live_engineering_ready: liveEngineering.ready,
  growth_quality_ready: growthQuality.ready,
  source_of_truth: "X article pipeline: format library first, one Images 2.0 hook, Supabase/library payoff slides, local compositor, dry-run scheduling, performance feedback.",
  schemas,
  format_captures: formats,
  raw_problem_bank: rawProblems,
  visual_library: visuals,
  performance,
  live_engineering: liveEngineering,
  growth_quality: growthQuality,
  quality_gates: [
    "Top 5 production decks must match five sourced runner mistakes.",
    "Images 2.0 is hook-only.",
    "Production library assets must be approved, owned, or licensed.",
    "Posted decks must be marked so daily growth avoids repeats.",
    "Postiz direct-public live mode requires explicit publish_mode=direct-public."
  ],
  blockers: liveEngineering.blockers,
  growth_quality_gaps: growthQuality.gaps,
  next_actions: [...new Set([
    ...(liveEngineering.ready ? [] : [
      "Run npm run slideshow:prod-preflight -- --pack content/slideshows/YYYY-MM-DD-slug --publish-mode direct-public before live scheduling."
    ]),
    ...growthQuality.next_actions
  ])]
}, null, 2));
