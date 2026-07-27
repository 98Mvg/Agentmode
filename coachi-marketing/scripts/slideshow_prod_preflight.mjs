#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import {
  assertDirectPublicTikTokPost,
  buildPostizPublicPayload,
  isPublicHttpsUrl,
  mediaType,
  postizApiBase,
  publishModeForPost,
  settingsForPost
} from "./slideshow_postiz_payload.mjs";
import {
  configuredTiktokAccountIds,
  isConfiguredTiktokAccountId,
  isWatchTiktokAccountReference
} from "./postiz_account_profiles.mjs";

await import("dotenv").then(({ config }) => {
  config();
  config({ path: ".env.local" });
}).catch(() => {});

const POSTED_REGISTRY_PATH = "inputs/performance/posted-slideshows.json";
const SCHEDULED_REGISTRY_PATH = "inputs/performance/scheduled-slideshows.json";
const SEMANTIC_STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "being", "but", "by",
  "can", "could", "did", "do", "does", "every", "for", "from", "had", "has",
  "have", "how", "i", "if", "in", "is", "it", "its", "just", "more", "most",
  "my", "not", "of", "on", "or", "our", "should", "so", "still", "than",
  "that", "the", "their", "then", "these", "this", "those", "to", "too",
  "very", "was", "we", "were", "what", "when", "which", "who", "why", "will",
  "with", "would", "you", "your",
  "app", "coachi", "pace", "run", "runner", "running", "session", "training",
  "workout"
]);

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
  node scripts/slideshow_prod_preflight.mjs --pack content/slideshows/YYYY-MM-DD-slug --publish-mode direct-public
  node scripts/slideshow_prod_preflight.mjs --pack content/slideshows/YYYY-MM-DD-slug --publish-mode direct-public --skip-remote
  node scripts/slideshow_prod_preflight.mjs --pack content/slideshows/YYYY-MM-DD-slug --publish-mode inbox-file

Blocks live TikTok production unless the pack, QA, captions, schedule/upload mode, and duplicate registries are safe.`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
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

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("exit", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}${stderr ? `\n${stderr}` : ""}`));
    });
  });
}

async function runProductionQa(packDir) {
  const result = await run(process.execPath, ["scripts/qa_slideshow_pack.mjs", "--production", "--pack", packDir]);
  const jsonStart = result.stdout.indexOf("{");
  assert(jsonStart >= 0, "Production QA did not return JSON.");
  const qa = JSON.parse(result.stdout.slice(jsonStart));
  assert(qa.ok === true && qa.pass === true && qa.production === true, "Production QA did not return a passing production report.");
  return qa;
}

function normalizedWorld(value) {
  const text = String(value || "").toLowerCase().replace(/[_-]+/g, " ").trim();
  if (/\blake\b|\bwater\b|\briverside\b|\bcoastal\b/.test(text)) return "lake";
  if (/\bmountain\b|\bhill\b|\bhills\b|\buphill\b|\bclimb\b|\bridge\b/.test(text)) return "mountain";
  if (/\bforest\b|\btrail\b|\bwoods?\b|\btrees?\b/.test(text)) return "forest";
  return text;
}

function countHashtags(value) {
  return String(value || "").match(/#[\p{L}\p{N}_]+/gu)?.length || 0;
}

async function readText(filePath) {
  return fs.readFile(filePath, "utf8");
}

async function packReadiness({ packDir, manifest, qa }) {
  const slideshowId = path.basename(packDir);
  const qaReportPath = path.join(packDir, "source/qa-report.json");
  const slideshowPath = path.join(packDir, "source/slideshow.json");
  const hookBriefPath = path.join(packDir, "source/hook-brief.json");
  const assetPicklistPath = path.join(packDir, "asset-picklist.json");
  const tiktokCaptionPath = path.join(packDir, "copy/tiktok-postiz-caption.txt");
  const hashtagsPath = path.join(packDir, "copy/hashtags.txt");

  assert(manifest.schema, "render-manifest.json must declare schema for live production.");
  assert(manifest.source_problem_id, "render-manifest.json must declare source_problem_id for live production.");
  assert(manifest.hybrid_cost_model === "one_ai_hook_six_library_assets", "Production pack must use one AI hook plus library assets.");
  assert(Array.isArray(manifest.slides) && manifest.slides.length >= 6, "Production pack must include at least 6 slides.");

  const [qaReport, slideshow, hookBrief, assetPicklist, tiktokCaption, hashtags] = await Promise.all([
    readJson(qaReportPath),
    readJson(slideshowPath),
    readJson(hookBriefPath),
    readJson(assetPicklistPath),
    readText(tiktokCaptionPath),
    readText(hashtagsPath)
  ]);

  assert(qaReport.ok === true && qaReport.pass === true && qaReport.production === true, "source/qa-report.json must be a passing production QA report.");
  assert(qa.generated_at === qaReport.generated_at, "source/qa-report.json must match the QA report generated during this preflight run.");
  assert(slideshow.slideshow_id === slideshowId, `source/slideshow.json slideshow_id must match pack slug ${slideshowId}.`);
  assert(slideshow.qa_status === "passed", "source/slideshow.json qa_status must be passed after production QA.");

  const hook = manifest.slides[0]?.text || "";
  assert(hook, "render-manifest.json slide 1 hook is missing.");
  assert(slideshow.selected_hook === hook, "source/slideshow.json selected_hook must match render-manifest slide 1.");
  assert(hookBrief.hook === hook, "source/hook-brief.json hook must match render-manifest slide 1.");
  assert(qa.hook_quality?.hook === hook, "Production QA hook must match render-manifest slide 1.");

  const manifestWorld = normalizedWorld(manifest.visual_world);
  assert(manifestWorld && manifestWorld === normalizedWorld(hookBrief.visual_world), "render-manifest visual_world must match source/hook-brief.json.");
  assert(manifestWorld === normalizedWorld(slideshow.visual_system?.visual_world), "render-manifest visual_world must match source/slideshow.json visual_system.");
  assert(manifest.lighting_family === hookBrief.lighting_family, "render-manifest lighting_family must match source/hook-brief.json.");
  assert(manifest.lighting_family === slideshow.visual_system?.lighting, "render-manifest lighting_family must match source/slideshow.json visual_system.");

  const expectedNonHookAssets = manifest.slides.filter((slide) => slide.asset_source !== "images_2_0").length;
  assert(qa.asset_quality?.non_hook_slides_checked === expectedNonHookAssets, "Production QA asset count must match non-hook slides.");
  assert((qa.production_checks?.assets || []).length === expectedNonHookAssets, "Production QA production asset count must match non-hook slides.");
  assert((assetPicklist.slides || []).length === manifest.slides.length, "asset-picklist slide count must match render-manifest.");

  const caption = tiktokCaption.trim();
  assert(caption.length >= 40, "TikTok caption is too short for upload handoff.");
  assert(caption.length <= 2200, "TikTok caption exceeds TikTok title/caption limit.");
  const hashtagCount = countHashtags(hashtags);
  assert(hashtagCount >= 4 && hashtagCount <= 12, `Hashtag count must stay between 4 and 12, got ${hashtagCount}.`);

  return {
    slideshow_id: slideshowId,
    schema: manifest.schema,
    source_problem_id: manifest.source_problem_id,
    hook,
    visual_world: manifestWorld,
    lighting_family: manifest.lighting_family,
    slides: manifest.slides.length,
    non_hook_assets: expectedNonHookAssets,
    caption: {
      path: path.relative(process.cwd(), tiktokCaptionPath),
      chars: caption.length,
      hashtag_count: hashtagCount
    },
    qa_report: path.relative(process.cwd(), qaReportPath)
  };
}

function envReport() {
  const apiBase = process.env.POSTIZ_URL || process.env.POSTIZ_PUBLIC_API_BASE
    ? postizApiBase()
    : null;
  return {
    POSTIZ_ENABLE_LIVE_POSTING: process.env.POSTIZ_ENABLE_LIVE_POSTING === "1",
    POSTIZ_API_KEY: Boolean(process.env.POSTIZ_API_KEY),
    POSTIZ_TIKTOK_ACCOUNT_ID: Boolean(process.env.POSTIZ_TIKTOK_ACCOUNT_ID),
    POSTIZ_TIKTOK_CONFIGURED_ACCOUNT_COUNT: configuredTiktokAccountIds().length,
    POSTIZ_URL_OR_PUBLIC_API_BASE: Boolean(process.env.POSTIZ_URL || process.env.POSTIZ_PUBLIC_API_BASE),
    POSTIZ_API_BASE_HTTPS: Boolean(apiBase && isPublicHttpsUrl(apiBase)),
    postiz_api_base: apiBase
  };
}

function assertDirectPublicEnv(report) {
  assert(report.POSTIZ_ENABLE_LIVE_POSTING, "POSTIZ_ENABLE_LIVE_POSTING must be 1 for direct-public preflight.");
  assert(report.POSTIZ_API_KEY, "POSTIZ_API_KEY is required for direct-public preflight.");
  assert(report.POSTIZ_TIKTOK_CONFIGURED_ACCOUNT_COUNT > 0, "At least one TikTok Postiz account env var is required for direct-public preflight.");
  assert(report.POSTIZ_URL_OR_PUBLIC_API_BASE, "POSTIZ_URL or POSTIZ_PUBLIC_API_BASE is required for direct-public preflight.");
}

function assertWatchAccountUsesInboxHandoff(post, account) {
  if ((post.platform || account?.platform || "tiktok") !== "tiktok") return;
  if (publishModeForPost(post) !== "direct-public") return;
  if (!isWatchTiktokAccountReference({ post, account })) return;
  throw new Error("Runner Watch Lab uses TikTok MEDIA_UPLOAD inbox handoff like Everyday Runner Lab. Do not create Postiz DIRECT_POST jobs for the watch account; use npm run slideshow:upload-both -- --pack <pack> --skip-instagram --tiktok-account watch.");
}

async function findTikTokPost({ schedule, publishMode }) {
  assert(schedule.dry_run === false, "Production preflight requires postiz-schedule.json dry_run=false.");
  assert(schedule.publish_mode === publishMode, `Schedule publish_mode must be ${publishMode}.`);
  const post = (schedule.posts || []).find((item) => item.platform === "tiktok");
  assert(post, "Schedule missing TikTok post.");
  assert(isConfiguredTiktokAccountId(post.account_id), "TikTok post account_id must match a configured TikTok Postiz account env var.");
  assert(publishModeForPost(post) === publishMode, `TikTok post publish_mode must be ${publishMode}.`);
  const accounts = new Map((schedule.accounts || []).map((account) => [account.account_id, account]));
  const account = accounts.get(post.account_id) || { platform: "tiktok" };
  assertWatchAccountUsesInboxHandoff(post, account);
  const settings = settingsForPost(post, account, "");
  assertDirectPublicTikTokPost(post, settings);
  return { post, settings };
}

async function mediaReadiness(post) {
  const apiBase = postizApiBase();
  const checks = [];
  for (const mediaPath of post.media_paths || []) {
    if (isPublicHttpsUrl(mediaPath)) {
      checks.push({ path: mediaPath, mode: "public_https", ok: true });
      continue;
    }
    const absolutePath = path.resolve(mediaPath);
    assert(await exists(absolutePath), `Missing local media file: ${absolutePath}`);
    const type = mediaType(absolutePath);
    assert(["image/png", "image/jpeg"].includes(type), `TikTok photo carousel media must be PNG/JPEG: ${absolutePath}`);
    assert(isPublicHttpsUrl(apiBase), "Local media upload requires HTTPS Postiz API base so uploaded media can be public.");
    checks.push({ path: absolutePath, mode: "postiz_upload", media_type: type, ok: true });
  }
  return checks;
}

function normalizeAccountProfile(value) {
  const text = String(value || "").trim().toLowerCase().replaceAll("_", "-");
  if (!text) return null;
  if (text === "main" || text.includes("everydayrunnerlab") || text.includes("everyday runner lab")) return "main";
  if (text === "watch" || text.includes("runwatchlab") || text.includes("runner watch lab")) return "watch";
  if (text === "marathon" || text.includes("roadtomarathon") || text.includes("road to marathon")) return "marathon";
  return text;
}

function canonicalSemanticToken(value) {
  const token = String(value || "").toLowerCase();
  if (/^(rep|reps|repeat|repeats|round|rounds|split|splits|intervals)$/.test(token)) return "interval";
  if (/^(drifted|drifting|drifts)$/.test(token)) return "drift";
  if (/^(harder|hardest|difficult|worse|worst)$/.test(token)) return "hard";
  if (/^(feels|felt|feeling)$/.test(token)) return "feel";
  if (/^(controlled|controlling)$/.test(token)) return "control";
  if (/^(started|starting|starts)$/.test(token)) return "start";
  if (/^(faster|fastest)$/.test(token)) return "fast";
  if (/^(sessions|workouts)$/.test(token)) return token.slice(0, -1);
  if (/^(paces|runs|runners)$/.test(token)) return token.slice(0, -1);
  return token;
}

function semanticTokens(value) {
  const rawTokens = String(value || "").toLowerCase().match(/[a-z0-9]+/g) || [];
  return new Set(
    rawTokens
      .map(canonicalSemanticToken)
      .filter((token) => token.length >= 3 && !SEMANTIC_STOP_WORDS.has(token))
  );
}

function inferredAccountProfile(packDir) {
  const slug = path.basename(packDir).toLowerCase();
  if (/-main-\d{2}-/.test(slug)) return "main";
  if (/-watch-\d{2}-/.test(slug)) return "watch";
  if (/-marathon-\d{2}-/.test(slug)) return "marathon";
  return null;
}

async function semanticDescriptor(packDir, fallback = {}) {
  const source = await readOptionalJson(path.join(packDir, "source/slideshow.json"), {});
  const manifest = await readOptionalJson(path.join(packDir, "render-manifest.json"), {});
  const problem = source.source_problem || {};
  const text = [
    source.topic,
    source.selected_hook,
    problem.exact_words,
    fallback.hook
  ].filter(Boolean).join(" ");

  return {
    slideshow_id: source.slideshow_id || fallback.slideshow_id || path.basename(packDir),
    account_profile: normalizeAccountProfile(
      source.account_profile
        || manifest.account_profile
        || fallback.account_profile
        || fallback.account_name
        || inferredAccountProfile(packDir)
    ),
    source_problem_id: problem.id || manifest.source_problem_id || fallback.source_problem_id || null,
    problem_type: String(problem.problem_type || "").trim().toLowerCase(),
    tokens: semanticTokens(text)
  };
}

async function semanticPostedDuplicates({ packDir, platform, postedPosts }) {
  const current = await semanticDescriptor(packDir);
  const packRoot = path.dirname(packDir);
  const matches = [];

  for (const post of postedPosts) {
    if ((post.platform || "tiktok") !== platform || post.slideshow_id === current.slideshow_id) continue;
    const postProfile = normalizeAccountProfile(post.account_profile || post.account_name);
    if (current.account_profile && postProfile && current.account_profile !== postProfile) continue;

    const priorPackDir = path.join(packRoot, post.slideshow_id || "");
    if (!(await exists(path.join(priorPackDir, "source/slideshow.json")))) continue;
    const prior = await semanticDescriptor(priorPackDir, post);
    const sameProblemId = Boolean(
      current.source_problem_id
        && prior.source_problem_id
        && current.source_problem_id === prior.source_problem_id
    );
    const sameProblemType = Boolean(
      current.problem_type
        && prior.problem_type
        && current.problem_type === prior.problem_type
    );
    const sharedConcepts = [...current.tokens].filter((token) => prior.tokens.has(token));

    if (sameProblemId || (sameProblemType && sharedConcepts.length >= 2)) {
      matches.push({
        slideshow_id: post.slideshow_id,
        public_url: post.url || post.public_url || null,
        shared_concepts: sharedConcepts.sort()
      });
    }
  }

  return matches;
}

async function duplicateReadiness({ slideshowId, platform, allowScheduled, packDir }) {
  const posted = await readOptionalJson(POSTED_REGISTRY_PATH, { posts: [] });
  const scheduled = await readOptionalJson(SCHEDULED_REGISTRY_PATH, { posts: [] });
  const postedMatch = (posted.posts || []).find((entry) => entry.slideshow_id === slideshowId && entry.platform === platform);
  assert(!postedMatch, `Slideshow ${slideshowId} is already posted on ${platform}.`);
  const semanticMatches = await semanticPostedDuplicates({
    packDir,
    platform,
    postedPosts: posted.posts || []
  });
  assert(
    semanticMatches.length === 0,
    `Slideshow ${slideshowId} is a semantic duplicate of public ${platform} deck(s): ${semanticMatches.map((entry) => entry.slideshow_id).join(", ")}.`
  );
  const scheduledMatch = (scheduled.posts || []).find((entry) => {
    const status = String(entry.status || "").toLowerCase();
    return entry.slideshow_id === slideshowId
      && entry.platform === platform
      && !status.startsWith("cancelled");
  });
  assert(allowScheduled || !scheduledMatch, `Slideshow ${slideshowId} is already scheduled on ${platform}.`);
  return {
    posted_registry: POSTED_REGISTRY_PATH,
    scheduled_registry: SCHEDULED_REGISTRY_PATH,
    posted_before: false,
    semantic_posted_matches: [],
    scheduled_before: Boolean(scheduledMatch)
  };
}

async function remoteIntegrationReadiness(accountId) {
  const response = await fetch(`${postizApiBase()}/integrations`, {
    headers: {
      Authorization: process.env.POSTIZ_API_KEY
    }
  });
  if (!response.ok) {
    throw new Error(`Postiz integrations check failed ${response.status}: ${await response.text()}`);
  }
  const body = await response.json();
  const integrations = Array.isArray(body) ? body : body.integrations || body.data || [];
  const match = integrations.find((item) => item.id === accountId || item.identifier === accountId);
  assert(match, `TikTok Postiz integration was not found in Postiz integrations: ${accountId}`);
  const type = String(match.type || match.provider || match.platform || "").toLowerCase();
  assert(!type || type.includes("tiktok"), `Postiz integration ${accountId} does not look like TikTok: ${type}`);
  return {
    checked: true,
    account_id: accountId,
    integration_type: type || "unknown"
  };
}

async function main() {
  const { args, flags } = parseArgs(process.argv.slice(2));
  if (flags.has("--help") || flags.has("-h")) {
    printHelp();
    return;
  }

  const packArg = args.get("--pack");
  if (!packArg) {
    printHelp();
    process.exit(1);
  }

  const publishMode = args.get("--publish-mode") || "direct-public";
  assert(["direct-public", "inbox-file"].includes(publishMode), "Production preflight supports --publish-mode direct-public or inbox-file.");
  const packDir = path.resolve(packArg);
  const manifest = await readJson(path.join(packDir, "render-manifest.json"));

  const qa = await runProductionQa(packDir);
  const pack = await packReadiness({ packDir, manifest, qa });
  const duplicate = await duplicateReadiness({
    slideshowId: pack.slideshow_id,
    platform: "tiktok",
    allowScheduled: flags.has("--allow-already-scheduled"),
    packDir
  });

  if (publishMode === "inbox-file") {
    console.log(JSON.stringify({
      ok: true,
      pack: path.relative(process.cwd(), packDir),
      publish_mode: publishMode,
      upload_mode: "tiktok_photo_media_upload_send_to_user_inbox",
      note: "Pack is safe for TikTok inbox handoff. User still presses the final post button in TikTok.",
      source: {
        schema: pack.schema,
        source_problem_id: pack.source_problem_id
      },
      qa: {
        production: qa.production,
        slides: qa.slides,
        hook_provenance: qa.production_checks?.hook_provenance || null,
        asset_count: qa.production_checks?.assets?.length || 0,
        qa_report: pack.qa_report
      },
      pack_readiness: pack,
      duplicate
    }, null, 2));
    return;
  }

  const schedule = await readJson(path.join(packDir, "postiz-schedule.json"));
  const env = envReport();
  assertDirectPublicEnv(env);
  const { post, settings } = await findTikTokPost({ schedule, publishMode });
  const media = await mediaReadiness(post);
  assert(post.slideshow_id === pack.slideshow_id, "Postiz TikTok post slideshow_id must match pack slug.");
  const accounts = new Map(schedule.accounts.map((account) => [account.account_id, account]));
  const payload = await buildPostizPublicPayload(post, accounts, { dryRun: true });
  const remote = flags.has("--skip-remote")
    ? { checked: false, reason: "--skip-remote" }
    : await remoteIntegrationReadiness(post.account_id);

  console.log(JSON.stringify({
    ok: true,
    pack: path.relative(process.cwd(), packDir),
    publish_mode: publishMode,
    source: {
      schema: pack.schema,
      source_problem_id: pack.source_problem_id
    },
    qa: {
      production: qa.production,
      slides: qa.slides,
      hook_provenance: qa.production_checks?.hook_provenance || null,
      asset_count: qa.production_checks?.assets?.length || 0
    },
    pack_readiness: pack,
    postiz: {
      env,
      remote,
      settings,
      payload_preview: payload
    },
    media,
    duplicate
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
