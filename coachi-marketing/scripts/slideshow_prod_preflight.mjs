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

await import("dotenv").then(({ config }) => {
  config();
  config({ path: ".env.local" });
}).catch(() => {});

const POSTED_REGISTRY_PATH = "inputs/performance/posted-slideshows.json";
const SCHEDULED_REGISTRY_PATH = "inputs/performance/scheduled-slideshows.json";

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

Blocks live TikTok production unless the pack, schedule, Postiz env, direct-public payload, and duplicate registries are safe.`);
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
  const result = await run("npm", ["run", "slideshow:qa", "--", "--production", "--pack", packDir]);
  const jsonStart = result.stdout.indexOf("{");
  assert(jsonStart >= 0, "Production QA did not return JSON.");
  return JSON.parse(result.stdout.slice(jsonStart));
}

function envReport() {
  const apiBase = process.env.POSTIZ_URL || process.env.POSTIZ_PUBLIC_API_BASE
    ? postizApiBase()
    : null;
  return {
    POSTIZ_ENABLE_LIVE_POSTING: process.env.POSTIZ_ENABLE_LIVE_POSTING === "1",
    POSTIZ_API_KEY: Boolean(process.env.POSTIZ_API_KEY),
    POSTIZ_TIKTOK_ACCOUNT_ID: Boolean(process.env.POSTIZ_TIKTOK_ACCOUNT_ID),
    POSTIZ_URL_OR_PUBLIC_API_BASE: Boolean(process.env.POSTIZ_URL || process.env.POSTIZ_PUBLIC_API_BASE),
    POSTIZ_API_BASE_HTTPS: Boolean(apiBase && isPublicHttpsUrl(apiBase)),
    postiz_api_base: apiBase
  };
}

function assertDirectPublicEnv(report) {
  assert(report.POSTIZ_ENABLE_LIVE_POSTING, "POSTIZ_ENABLE_LIVE_POSTING must be 1 for direct-public preflight.");
  assert(report.POSTIZ_API_KEY, "POSTIZ_API_KEY is required for direct-public preflight.");
  assert(report.POSTIZ_TIKTOK_ACCOUNT_ID, "POSTIZ_TIKTOK_ACCOUNT_ID is required for direct-public preflight.");
  assert(report.POSTIZ_URL_OR_PUBLIC_API_BASE, "POSTIZ_URL or POSTIZ_PUBLIC_API_BASE is required for direct-public preflight.");
}

async function findTikTokPost({ schedule, publishMode }) {
  assert(schedule.dry_run === false, "Production preflight requires postiz-schedule.json dry_run=false.");
  assert(schedule.publish_mode === publishMode, `Schedule publish_mode must be ${publishMode}.`);
  const post = (schedule.posts || []).find((item) => item.platform === "tiktok");
  assert(post, "Schedule missing TikTok post.");
  assert(post.account_id === process.env.POSTIZ_TIKTOK_ACCOUNT_ID, "TikTok post account_id must match POSTIZ_TIKTOK_ACCOUNT_ID.");
  assert(publishModeForPost(post) === publishMode, `TikTok post publish_mode must be ${publishMode}.`);
  const settings = settingsForPost(post, { platform: "tiktok" }, "");
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

async function duplicateReadiness({ slideshowId, platform, allowScheduled }) {
  const posted = await readOptionalJson(POSTED_REGISTRY_PATH, { posts: [] });
  const scheduled = await readOptionalJson(SCHEDULED_REGISTRY_PATH, { posts: [] });
  const postedMatch = (posted.posts || []).find((entry) => entry.slideshow_id === slideshowId && entry.platform === platform);
  assert(!postedMatch, `Slideshow ${slideshowId} is already posted on ${platform}.`);
  const scheduledMatch = (scheduled.posts || []).find((entry) => entry.slideshow_id === slideshowId && entry.platform === platform);
  assert(allowScheduled || !scheduledMatch, `Slideshow ${slideshowId} is already scheduled on ${platform}.`);
  return {
    posted_registry: POSTED_REGISTRY_PATH,
    scheduled_registry: SCHEDULED_REGISTRY_PATH,
    posted_before: false,
    scheduled_before: Boolean(scheduledMatch)
  };
}

async function remoteIntegrationReadiness(accountId) {
  const response = await fetch(`${postizApiBase()}/integrations`, {
    headers: {
      Authorization: process.env.POSTIZ_API_KEY
    }
  });
  assert(response.ok, `Postiz integrations check failed ${response.status}: ${await response.text()}`);
  const body = await response.json();
  const integrations = Array.isArray(body) ? body : body.integrations || body.data || [];
  const match = integrations.find((item) => item.id === accountId || item.identifier === accountId);
  assert(match, `POSTIZ_TIKTOK_ACCOUNT_ID was not found in Postiz integrations: ${accountId}`);
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
  assert(publishMode === "direct-public", "Production preflight currently supports --publish-mode direct-public only.");
  const packDir = path.resolve(packArg);
  const manifest = await readJson(path.join(packDir, "render-manifest.json"));
  assert(manifest.schema, "render-manifest.json must declare schema for live production.");
  assert(manifest.source_problem_id, "render-manifest.json must declare source_problem_id for live production.");

  const qa = await runProductionQa(packDir);
  const schedule = await readJson(path.join(packDir, "postiz-schedule.json"));
  const env = envReport();
  assertDirectPublicEnv(env);
  const { post, settings } = await findTikTokPost({ schedule, publishMode });
  const media = await mediaReadiness(post);
  const duplicate = await duplicateReadiness({
    slideshowId: post.slideshow_id,
    platform: "tiktok",
    allowScheduled: flags.has("--allow-already-scheduled")
  });
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
      schema: manifest.schema,
      source_problem_id: manifest.source_problem_id
    },
    qa: {
      production: qa.production,
      slides: qa.slides,
      hook_provenance: qa.production_checks?.hook_provenance || null,
      asset_count: qa.production_checks?.assets?.length || 0
    },
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
