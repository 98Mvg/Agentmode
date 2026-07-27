#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import {
  assertDirectPublicTikTokPost,
  buildPostizPublicPayload,
  mediaType,
  postizApiBase,
  publishModeForPost,
  settingsForPost
} from "./slideshow_postiz_payload.mjs";
import { isWatchTiktokAccountReference } from "./postiz_account_profiles.mjs";

await import("dotenv").then(({ config }) => {
  config();
  config({ path: ".env.local" });
}).catch(() => {});

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
  node scripts/slideshow_queue_worker.mjs --schedule strategy/automation/tiktok-instagram-slideshow-content-engine/templates/postiz-schedule-manifest-template.json
  node scripts/slideshow_queue_worker.mjs --enqueue content/slideshows/YYYY-MM-DD-slug/render-manifest.json --account postiz_integration_id --scheduled-at 2026-04-27T07:30:00+02:00
  node scripts/slideshow_queue_worker.mjs --enqueue content/slideshows/YYYY-MM-DD-slug/render-manifest.json --account postiz_integration_id --scheduled-at 2026-04-27T07:30:00+02:00 --generate-openai-hook
  node scripts/slideshow_queue_worker.mjs --enqueue content/slideshows/YYYY-MM-DD-slug/render-manifest.json --account postiz_integration_id --scheduled-at 2026-04-27T07:30:00+02:00 --publish-mode direct-public
  node scripts/slideshow_queue_worker.mjs --worker

Defaults to dry-run. Live Postiz scheduling requires POSTIZ_ENABLE_LIVE_POSTING=1, POSTIZ_PUBLIC_API_BASE or POSTIZ_URL, and POSTIZ_API_KEY.`);
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
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

async function readTextIfExists(filePath) {
  if (!filePath) return "";
  return fs.readFile(path.resolve(filePath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function hoursBetween(a, b) {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 36e5;
}

function platformLimit(manifest, platform, key, fallback) {
  return manifest.platform_rate_limits?.[platform]?.[key] ?? fallback;
}

function assertWatchAccountUsesInboxHandoff(post, account) {
  if ((post.platform || account?.platform || "tiktok") !== "tiktok") return;
  if (publishModeForPost(post) !== "direct-public") return;
  if (!isWatchTiktokAccountReference({ post, account })) return;
  throw new Error("Runner Watch Lab uses TikTok MEDIA_UPLOAD inbox handoff like Everyday Runner Lab. Do not create Postiz DIRECT_POST jobs for the watch account; use npm run slideshow:upload-both -- --pack <pack> --skip-instagram --tiktok-account watch.");
}

async function uploadToPostiz(filePath) {
  const absolutePath = path.resolve(filePath);
  const buffer = await fs.readFile(absolutePath);
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: mediaType(absolutePath) }), path.basename(absolutePath));

  const response = await fetch(`${postizApiBase()}/upload`, {
    method: "POST",
    headers: {
      Authorization: process.env.POSTIZ_API_KEY
    },
    body: form
  });

  if (!response.ok) {
    throw new Error(`Postiz upload error ${response.status}: ${await response.text()}`);
  }

  const uploaded = await response.json();
  return {
    id: uploaded.id,
    path: uploaded.path
  };
}

function validateScheduleManifest(manifest) {
  assert(Array.isArray(manifest.accounts), "Schedule manifest missing accounts array.");
  assert(Array.isArray(manifest.posts), "Schedule manifest missing posts array.");

  const accounts = new Map(manifest.accounts.map((account) => [account.account_id, account]));
  const seenPayloads = new Set();
  const postsByAccount = new Map();
  const defaultMinHours = manifest.rate_limits?.min_hours_between_posts_per_account ?? 4;
  const defaultMaxDaily = manifest.rate_limits?.max_posts_per_account_per_day ?? 2;
  const maxHourlyGlobal = manifest.rate_limits?.max_posts_per_hour_global ?? 4;
  const postsByHour = new Map();

  for (const post of manifest.posts) {
    const account = accounts.get(post.account_id);
    assert(account, `Unknown account_id in post: ${post.account_id}`);
    assert(post.scheduled_at, `Post ${post.slideshow_id} missing scheduled_at.`);
    assert(Array.isArray(post.media_paths) && post.media_paths.length > 0, `Post ${post.slideshow_id} missing media_paths.`);
    const platform = post.platform || account.platform || "unknown";
    const maxDaily = platformLimit(manifest, platform, "max_posts_per_account_per_day", defaultMaxDaily);
    if (manifest.dry_run === false && platform === "tiktok") {
      assert(post.output_mode === "photo_carousel", `Live TikTok post ${post.slideshow_id} missing output_mode=photo_carousel.`);
      assert(post.media_type === "PHOTO", `Live TikTok post ${post.slideshow_id} missing media_type=PHOTO.`);
      assert(post.publish_mode, `Live TikTok post ${post.slideshow_id} missing publish_mode.`);
      assertWatchAccountUsesInboxHandoff(post, account);
      const content = post.content || "";
      assertDirectPublicTikTokPost(post, settingsForPost(post, account, content));
    }

    const fingerprint = `${post.caption_path || post.content || ""}:${post.media_paths.join("|")}`;
    assert(!seenPayloads.has(fingerprint), `Duplicate post payload detected for ${post.slideshow_id}.`);
    seenPayloads.add(fingerprint);

    const key = `${post.account_id}:${post.scheduled_at.slice(0, 10)}`;
    const dayPosts = postsByAccount.get(key) || [];
    dayPosts.push(post);
    postsByAccount.set(key, dayPosts);
    assert(dayPosts.length <= maxDaily, `${post.account_id} exceeds ${maxDaily} posts/day.`);

    const hourKey = post.scheduled_at.slice(0, 13);
    const hourPosts = postsByHour.get(hourKey) || [];
    hourPosts.push(post);
    postsByHour.set(hourKey, hourPosts);
    assert(hourPosts.length <= maxHourlyGlobal, `Global schedule exceeds ${maxHourlyGlobal} posts/hour at ${hourKey}.`);
  }

  for (const [key, posts] of postsByAccount.entries()) {
    const sorted = [...posts].sort((left, right) => new Date(left.scheduled_at) - new Date(right.scheduled_at));
    for (let index = 1; index < sorted.length; index += 1) {
      const gap = hoursBetween(sorted[index - 1].scheduled_at, sorted[index].scheduled_at);
      const account = accounts.get(sorted[index].account_id);
      const platform = sorted[index].platform || account?.platform || "unknown";
      const minHours = platformLimit(manifest, platform, "min_hours_between_posts_per_account", defaultMinHours);
      assert(gap >= minHours, `${key} has posts only ${gap.toFixed(2)}h apart; minimum for ${platform} is ${minHours}h.`);
    }
  }
}

async function postToPostiz(post, { dryRun, accounts }) {
  const effectiveDryRun = dryRun || process.env.POSTIZ_ENABLE_LIVE_POSTING !== "1";
  const payload = await buildPostizPublicPayload(post, accounts, {
    dryRun: effectiveDryRun,
    uploadMedia: uploadToPostiz
  });

  if (effectiveDryRun) {
    return {
      dry_run: true,
      reason: dryRun ? "schedule dry_run is true" : "POSTIZ_ENABLE_LIVE_POSTING is not 1",
      payload
    };
  }

  assert(process.env.POSTIZ_API_KEY, "POSTIZ_API_KEY is required for live scheduling.");

  const response = await fetch(`${postizApiBase()}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: process.env.POSTIZ_API_KEY
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Postiz API error ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function packDirForPost(post) {
  if (post.pack_dir) return path.resolve(post.pack_dir);
  if (post.caption_path) return path.dirname(path.dirname(path.resolve(post.caption_path)));
  return null;
}

async function writeLiveResult({ post, result }) {
  const packDir = packDirForPost(post);
  if (!packDir) return null;
  const outputPath = path.join(packDir, "postiz-live-result.json");
  await writeJson(outputPath, {
    ok: true,
    scheduled_at: new Date().toISOString(),
    slideshow_id: post.slideshow_id,
    platform: post.platform,
    publish_mode: publishModeForPost(post),
    output_mode: post.output_mode,
    media_type: post.media_type,
    result
  });
  return outputPath;
}

async function markScheduled({ post, result, registryPath = "inputs/performance/scheduled-slideshows.json" }) {
  const registry = await readJsonOrDefault(registryPath, {
    schema_version: 1,
    updated: null,
    purpose: "Registry of slideshow posts already scheduled through Postiz so daily growth avoids duplicate live scheduling.",
    posts: []
  });
  const scheduledAt = new Date().toISOString();
  const key = `${post.slideshow_id}|${post.platform}|${post.account_id}`;
  const existing = new Set((registry.posts || []).map((entry) => `${entry.slideshow_id}|${entry.platform}|${entry.account_id}`));
  if (!existing.has(key)) {
    registry.posts.push({
      scheduled_at: scheduledAt,
      slideshow_id: post.slideshow_id,
      platform: post.platform,
      account_id: post.account_id,
      publish_mode: publishModeForPost(post),
      output_mode: post.output_mode,
      media_type: post.media_type,
      postiz_result: result
    });
  }
  registry.updated = scheduledAt;
  await writeJson(registryPath, registry);
  return registryPath;
}

async function readJsonOrDefault(filePath, fallback) {
  try {
    return await readJson(filePath);
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}`));
    });
  });
}

function resolveHookImagePath({ renderManifestPath, manifest }) {
  const packDir = path.dirname(path.resolve(renderManifestPath));
  const hookSlide = (manifest.slides || []).find((slide) => slide.asset_source === "images_2_0") || manifest.slides?.[0];
  assert(hookSlide?.input_image, `${renderManifestPath}: missing hook slide input_image.`);
  return path.resolve(packDir, manifest.base_dir || ".", hookSlide.input_image);
}

async function ensureHookImage({ renderManifest, generateOpenAiHook }) {
  const absoluteRenderManifest = path.resolve(renderManifest);
  const packDir = path.dirname(absoluteRenderManifest);
  const manifest = await readJson(absoluteRenderManifest);
  const hookPath = resolveHookImagePath({ renderManifestPath: absoluteRenderManifest, manifest });
  const hookBrief = await readJson(path.join(packDir, "source/hook-brief.json"));

  if (await exists(hookPath)) {
    return { status: "existing_hook_image", hook_path: hookPath };
  }

  if (!generateOpenAiHook && process.env.SLIDESHOW_QUEUE_GENERATE_OPENAI_HOOK !== "1") {
    throw new Error(`Missing hook image: ${hookPath}. Enqueue with --generate-openai-hook or set SLIDESHOW_QUEUE_GENERATE_OPENAI_HOOK=1.`);
  }

  const isWatchPack = hookBrief.character_anchor?.account_profile === "watch"
    || hookBrief.avatar_variation?.identity_profile?.profile === "watch";
  const referenceImage = process.env.SLIDESHOW_HOOK_REFERENCE_IMAGE
    || hookBrief.character_anchor?.reference_image
    || hookBrief.avatar_variation?.identity_profile?.reference_image
    || DEFAULT_HOOK_REFERENCE_IMAGE;
  const styleReferenceImage = process.env.SLIDESHOW_HOOK_STYLE_REFERENCE_IMAGE
    || (isWatchPack
      ? null
      : hookBrief.character_anchor?.style_reference_image
        || hookBrief.avatar_variation?.identity_profile?.style_reference_image
        || DEFAULT_HOOK_STYLE_REFERENCE_IMAGE);
  const hookArgs = [
    "run",
    "slideshow:openai-hook",
    "--",
    "--pack",
    packDir,
    "--reference-image",
    referenceImage
  ];
  if (styleReferenceImage) {
    hookArgs.push("--style-reference-image", styleReferenceImage);
  }
  await runCommand("npm", hookArgs);
  assert(await exists(hookPath), `OpenAI hook generation finished but hook image is still missing: ${hookPath}`);
  return { status: "generated_openai_hook_image", hook_path: hookPath };
}

async function runSchedule(schedulePath) {
  const manifest = await readJson(path.resolve(schedulePath));
  validateScheduleManifest(manifest);
  const dryRun = manifest.dry_run !== false;
  const accounts = new Map(manifest.accounts.map((account) => [account.account_id, account]));
  const results = [];

  for (const post of manifest.posts) {
    const result = await postToPostiz(post, { dryRun, accounts });
    if (!dryRun && process.env.POSTIZ_ENABLE_LIVE_POSTING === "1") {
      await writeLiveResult({ post, result });
      await markScheduled({ post, result });
    }
    results.push(result);
  }

  console.log(JSON.stringify({
    ok: true,
    dry_run: dryRun || process.env.POSTIZ_ENABLE_LIVE_POSTING !== "1",
    scheduled_posts: results.length,
    results
  }, null, 2));
}

async function getBullMq() {
  try {
    return await import("bullmq");
  } catch (error) {
    throw new Error(`Missing dependency: bullmq. Run npm install before using queue mode. ${error.message}`);
  }
}

async function getRedisConnection() {
  try {
    const { default: IORedis } = await import("ioredis");
    return new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
      maxRetriesPerRequest: null
    });
  } catch (error) {
    throw new Error(`Missing dependency: ioredis. Run npm install before using queue mode. ${error.message}`);
  }
}

async function enqueueJob({ renderManifest, accountId, scheduledAt, generateOpenAiHook, publishMode }) {
  assert(renderManifest, "--enqueue requires a render manifest path.");
  assert(accountId, "--account is required.");
  assert(scheduledAt, "--scheduled-at is required.");

  const { Queue } = await getBullMq();
  const connection = await getRedisConnection();
  const queue = new Queue("slideshow-composite", { connection });
  const job = await queue.add("composite", {
    render_manifest: renderManifest,
    account_id: accountId,
    scheduled_at: scheduledAt,
    publish_mode: publishMode,
    generate_openai_hook: Boolean(generateOpenAiHook)
  }, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 }
  });

  await queue.close();
  await connection.quit();
  console.log(JSON.stringify({ ok: true, job_id: job.id }, null, 2));
}

async function runWorker() {
  const { Queue, Worker } = await getBullMq();
  const connection = await getRedisConnection();
  const postQueue = new Queue("slideshow-post", { connection });

  new Worker("slideshow-composite", async (job) => {
    const { render_manifest: renderManifest, account_id: accountId, scheduled_at: scheduledAt } = job.data;
    await ensureHookImage({
      renderManifest,
      generateOpenAiHook: Boolean(job.data.generate_openai_hook)
    });
    await runCommand("node", ["scripts/render_slideshow_deck.mjs", "--manifest", renderManifest]);
    const packDir = path.dirname(renderManifest);
    const manifest = await readJson(path.resolve(renderManifest));
    const mediaPaths = manifest.slides.map((slide) => path.join(packDir, manifest.output_dir || "slides/rendered", slide.output_file));
    const captionPath = path.join(packDir, "copy/tiktok-caption.txt");

    await postQueue.add("post", {
      slideshow_id: path.basename(packDir),
      account_id: accountId,
      platform: "tiktok",
      scheduled_at: scheduledAt,
      type: "tiktok-slideshow",
      publish_mode: job.data.publish_mode || "manual-review",
      output_mode: "photo_carousel",
      media_type: "PHOTO",
      media_paths: mediaPaths,
      caption_path: captionPath
    }, {
      attempts: 5,
      backoff: { type: "exponential", delay: 30000 }
    });
  }, {
    connection,
    concurrency: 2
  });

  new Worker("slideshow-post", async (job) => {
    const accounts = new Map([[job.data.account_id, {
      account_id: job.data.account_id,
      platform: job.data.platform || "tiktok"
    }]]);
    assertWatchAccountUsesInboxHandoff(job.data, accounts.get(job.data.account_id));
    return postToPostiz(job.data, {
      dryRun: process.env.POSTIZ_ENABLE_LIVE_POSTING !== "1",
      accounts
    });
  }, {
    connection,
    concurrency: 3,
    limiter: { max: 10, duration: 60_000 }
  });

  console.log("slideshow queue workers running");
}

const { args, flags } = parseArgs(process.argv.slice(2));
if (flags.has("--help") || flags.has("-h")) {
  printHelp();
  process.exit(0);
}

if (args.has("--schedule")) {
  await runSchedule(args.get("--schedule")).catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
} else if (args.has("--enqueue")) {
  await enqueueJob({
    renderManifest: args.get("--enqueue"),
    accountId: args.get("--account"),
    scheduledAt: args.get("--scheduled-at"),
    publishMode: args.get("--publish-mode") || "manual-review",
    generateOpenAiHook: flags.has("--generate-openai-hook")
  }).catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
} else if (flags.has("--worker")) {
  await runWorker().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
} else {
  printHelp();
  process.exit(1);
}
