#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_RESULTS_PATH = "inputs/performance/slideshow-results.json";
const DEFAULT_WINNER_LIBRARY_PATH = "inputs/performance/WINNER_LIBRARY.md";
const DEFAULT_POSTED_REGISTRY_PATH = "inputs/performance/posted-slideshows.json";
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
  node scripts/log_slideshow_result.mjs --slideshow-id 2026-04-26-pace-is-lying --platform tiktok --hook "Top 5 easy run mistakes" --views-24h 1000 --saves 20 --shares 5 --decision repeat
  node scripts/log_slideshow_result.mjs --slideshow-id 2026-05-14-zone-2 --platform tiktok --hook "Zone 2 should feel slow" --format-id nobody_talks_about_zone2 --views-24h 2000 --saves 80 --comments 12 --profile-visits 30 --app-store-clicks 6 --installs 1 --cta "Save this for your next easy run" --visual-style "quiet neighborhood road"
  node scripts/log_slideshow_result.mjs --mark-posted --slideshow-id 2026-04-26-pace-is-lying --platform tiktok --url https://www.tiktok.com/... --pack content/slideshows/2026-04-26-pace-is-lying

Logs slideshow performance and optionally appends repeat winners to WINNER_LIBRARY.md.`);
}

async function readOptionalJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function appendText(filePath, text) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.appendFile(filePath, text, "utf8");
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function numberArg(args, name) {
  const value = args.get(name);
  if (value === undefined) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`${name} must be a number.`);
  return parsed;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function metric(value) {
  return Number.isFinite(value) ? value : 0;
}

function rate(numerator, denominator) {
  const top = metric(numerator);
  const bottom = metric(denominator);
  if (bottom <= 0) return null;
  return Number((top / bottom).toFixed(4));
}

function engagementScore(result) {
  const views = metric(result.views_24h) || metric(result.views_1h);
  const score =
    metric(result.likes) +
    metric(result.saves) * 8 +
    metric(result.comments) * 6 +
    metric(result.shares) * 10 +
    metric(result.follows) * 20 +
    metric(result.profile_visits) * 4 +
    metric(result.app_store_clicks) * 12 +
    metric(result.installs) * 30 +
    Math.min(views / 100, 50) +
    metric(result.avg_watch_time_seconds) * 2;

  return Number(score.toFixed(2));
}

function installIntentScore(result) {
  const views = metric(result.views_24h) || metric(result.views_1h);
  const score =
    metric(result.saves) * 2 +
    metric(result.comments) * 3 +
    metric(result.profile_visits) * 5 +
    metric(result.app_store_clicks) * 8 +
    metric(result.installs) * 20 +
    Math.min(views / 500, 20);
  return Number(score.toFixed(2));
}

async function markPosted({ slideshowId, platform, url, hook, schema, sourceProblemId, packPath, registryPath, usageLogPath, postedAt }) {
  const registry = await readOptionalJson(registryPath, {
    schema_version: 1,
    updated: null,
    purpose: "Registry of public slideshow posts so daily growth does not reuse already-posted decks.",
    posts: []
  });
  const effectivePostedAt = postedAt || new Date().toISOString();
  const existingKey = `${slideshowId}|${platform}|${url || ""}`;
  const existing = new Set((registry.posts || []).map((post) => `${post.slideshow_id}|${post.platform}|${post.url || ""}`));
  if (!existing.has(existingKey)) {
    registry.posts.push({
      posted_at: effectivePostedAt,
      slideshow_id: slideshowId,
      platform,
      url: url || null,
      hook: hook || null,
      schema: schema || null,
      source_problem_id: sourceProblemId || null
    });
  }
  registry.updated = effectivePostedAt;
  await writeJson(registryPath, registry);

  const usageUpdate = await markPostedAssets({
    slideshowId,
    platform,
    postedAt: effectivePostedAt,
    packPath,
    usageLogPath
  });

  return {
    registry: registryPath,
    posted: !existing.has(existingKey),
    usage_update: usageUpdate
  };
}

async function markPostedAssets({ slideshowId, platform, postedAt, packPath, usageLogPath }) {
  const resolvedPackPath = packPath || `content/slideshows/${slideshowId}`;
  const reportPath = path.join(resolvedPackPath, "materialize-report.json");
  try {
    await fs.access(reportPath);
  } catch (error) {
    if (error.code === "ENOENT") return { skipped: true, reason: "missing materialize-report.json" };
    throw error;
  }

  const report = await readJson(reportPath);
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
  const existing = new Set((usageLog.uses || []).map((use) => [
    use.stage || use.event_type || "legacy",
    use.slideshow_id,
    use.platform || "",
    use.slide_number,
    use.asset_id
  ].join("|")));
  let appended = 0;

  for (const result of report.results || []) {
    if (!result.selected_asset_id) continue;
    const entry = {
      used_at: postedAt,
      stage: "posted",
      slideshow_id: slideshowId,
      platform,
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
      entry.platform,
      entry.slide_number,
      entry.asset_id
    ].join("|");
    if (existing.has(key)) continue;
    usageLog.uses.push(entry);
    existing.add(key);
    appended += 1;
  }

  usageLog.updated = postedAt.slice(0, 10);
  await writeJson(usageLogPath, usageLog);
  return { skipped: false, appended_uses: appended, usage_log: usageLogPath };
}

async function main() {
  const { args, flags } = parseArgs(process.argv.slice(2));
  if (flags.has("--help") || flags.has("-h")) {
    printHelp();
    return;
  }

  const slideshowId = args.get("--slideshow-id");
  const platform = args.get("--platform");
  const hook = args.get("--hook");
  const decision = args.get("--decision") || "undecided";
  const markPostedFlag = flags.has("--mark-posted");
  const resultsPath = args.get("--results") || DEFAULT_RESULTS_PATH;
  const winnerLibraryPath = args.get("--winner-library") || DEFAULT_WINNER_LIBRARY_PATH;
  const postedRegistryPath = args.get("--posted-registry") || DEFAULT_POSTED_REGISTRY_PATH;
  const usageLogPath = args.get("--usage-log") || DEFAULT_USAGE_LOG_PATH;
  const packPath = args.get("--pack") || args.get("--slideshow-dir") || (slideshowId ? `content/slideshows/${slideshowId}` : null);

  assert(slideshowId, "--slideshow-id is required.");
  assert(platform, "--platform is required.");
  assert(hook || markPostedFlag, "--hook is required unless --mark-posted is used.");
  assert(["repeat", "iterate", "stop", "undecided"].includes(decision), "--decision must be repeat, iterate, stop, or undecided.");

  const result = {
    logged_at: new Date().toISOString(),
    posted_at: args.get("--posted-at") || null,
    slideshow_id: slideshowId,
    platform,
    url: args.get("--url") || null,
    hook,
    schema: args.get("--schema") || null,
    source_problem_id: args.get("--source-problem-id") || null,
    slide_count: numberArg(args, "--slide-count"),
    views_1h: numberArg(args, "--views-1h"),
    views_24h: numberArg(args, "--views-24h"),
    likes: numberArg(args, "--likes"),
    saves: numberArg(args, "--saves"),
    shares: numberArg(args, "--shares"),
    comments: numberArg(args, "--comments"),
    follows: numberArg(args, "--follows"),
    profile_visits: numberArg(args, "--profile-visits"),
    app_store_clicks: numberArg(args, "--app-store-clicks") ?? numberArg(args, "--app-clicks"),
    installs: numberArg(args, "--installs"),
    format_id: args.get("--format-id") || null,
    cta: args.get("--cta") || null,
    visual_style: args.get("--visual-style") || null,
    topic: args.get("--topic") || null,
    avg_watch_time_seconds: numberArg(args, "--avg-watch-time"),
    strongest_viewer_language: args.get("--viewer-language") || null,
    decision
  };
  const denominator = metric(result.views_24h) || metric(result.views_1h);
  result.save_rate = rate(result.saves, denominator);
  result.comment_rate = rate(result.comments, denominator);
  result.profile_visit_rate = rate(result.profile_visits, denominator);
  result.app_store_click_rate = rate(result.app_store_clicks, denominator);
  result.install_rate = rate(result.installs, denominator);
  result.engagement_score = engagementScore(result);
  result.install_intent_score = installIntentScore(result);

  const log = await readOptionalJson(resultsPath, {
    schema_version: 1,
    updated: null,
    results: []
  });
  log.updated = result.logged_at;
  log.results.push(result);
  await writeJson(resultsPath, log);

  if (decision === "repeat") {
    assert(hook, "--hook is required when --decision repeat is used.");
    const viewerLanguage = result.strongest_viewer_language
      ? ` Viewer language: ${result.strongest_viewer_language}.`
      : "";
    await appendText(
      winnerLibraryPath,
      `\n- \`${hook}\` - slideshow winner from \`${slideshowId}\` on ${platform}; format ${result.format_id || result.schema || "n/a"}; score ${result.engagement_score}; install intent ${result.install_intent_score}; views24h ${result.views_24h ?? "n/a"}; saves ${result.saves ?? "n/a"}; save_rate ${result.save_rate ?? "n/a"}; shares ${result.shares ?? "n/a"}.${viewerLanguage} Repeat the format with a new source problem and new visuals.\n`
    );
  }

  const posted = markPostedFlag
    ? await markPosted({
        slideshowId,
        platform,
        url: args.get("--url") || null,
        hook,
        schema: args.get("--schema") || null,
        sourceProblemId: args.get("--source-problem-id") || null,
        packPath,
        registryPath: postedRegistryPath,
        usageLogPath,
        postedAt: result.posted_at
      })
    : null;

  console.log(JSON.stringify({
    ok: true,
    results: resultsPath,
    engagement_score: result.engagement_score,
    winner_library_updated: decision === "repeat",
    posted_registry_updated: Boolean(posted),
    posted
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
