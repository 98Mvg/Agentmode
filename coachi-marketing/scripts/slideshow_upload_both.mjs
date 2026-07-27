#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { resolveTiktokPostizAccountId, tiktokAccountEnvHint, tiktokAccountProfile } from "./postiz_account_profiles.mjs";
import { marketingSupabaseUploadEnvForTiktokProfile } from "./marketing_supabase_profile.mjs";
import { loadPublicationWorkflowSnapshot } from "./slideshow_publication_workflow.mjs";

await import("dotenv").then(({ config }) => {
  config();
  config({ path: ".env.local" });
}).catch(() => {});

const DEFAULT_SCHEDULE_DELAY_MINUTES = 10;
const COMPACT_PUBLIC_MEDIA_DIR = "exports/tiktok-photo-slides";

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
  node scripts/slideshow_upload_both.mjs --pack content/slideshows/YYYY-MM-DD-slug
  node scripts/slideshow_upload_both.mjs --pack content/slideshows/YYYY-MM-DD-slug --tiktok-account watch
  node scripts/slideshow_upload_both.mjs --pack content/slideshows/YYYY-MM-DD-slug --skip-tiktok
  node scripts/slideshow_upload_both.mjs --pack content/slideshows/YYYY-MM-DD-slug --allow-already-scheduled
  node scripts/slideshow_upload_both.mjs --pack content/slideshows/YYYY-MM-DD-slug --dry-run

Uploads one slideshow through both approved paths:
- TikTok: official PHOTO MEDIA_UPLOAD inbox handoff. User still presses final Post in TikTok.
- Instagram: Postiz live schedule using the connected Instagram integration.

Required env:
- TikTok path: POSTIZ_TIKTOK_ACCOUNT_ID or POSTIZ_TIKTOK_ACCOUNT_ID_WATCH
- Instagram path: POSTIZ_INSTAGRAM_ACCOUNT_ID, POSTIZ_API_KEY, POSTIZ_URL or POSTIZ_PUBLIC_API_BASE, POSTIZ_ENABLE_LIVE_POSTING=1

Instagram uses public Supabase media URLs so local Postiz can schedule safely.`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
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

function run(command, args, { env = {}, capture = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: { ...process.env, ...env },
      stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit"
    });

    let stdout = "";
    let stderr = "";
    if (capture) {
      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });
    }

    child.on("exit", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}${stderr ? `\n${stderr}` : ""}`));
    });
  });
}

function slugDate(slug) {
  const match = String(slug || "").match(/^\d{4}-\d{2}-\d{2}/);
  return match?.[0] || new Date().toISOString().slice(0, 10);
}

function storageSlugForPack(slug) {
  return String(slug || "")
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
    .replace(/[^a-z0-9-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function defaultScheduledAt() {
  return new Date(Date.now() + DEFAULT_SCHEDULE_DELAY_MINUTES * 60 * 1000).toISOString();
}

function publicMediaReady(schedule) {
  return schedule.media_transport === "supabase_public_https"
    && (schedule.posts || []).every((post) => (post.media_paths || []).every((mediaPath) => /^https:\/\//i.test(mediaPath)));
}

async function ensurePublicMedia({ pack, force }) {
  const schedulePath = path.join(pack, "postiz-schedule.json");
  const currentSchedule = await readJson(schedulePath);
  if (!force && publicMediaReady(currentSchedule)) {
    return {
      schedule: currentSchedule,
      uploaded: false,
      upload_manifest: currentSchedule.public_media_manifest || null
    };
  }

  const slug = path.basename(pack);
  const uploadManifest = path.join(pack, "upload-manifest.json");
  await run("node", [
    "scripts/prepare_tiktok_photo_carousel_media.mjs",
    "--pack",
    pack,
    "--out-dir",
    COMPACT_PUBLIC_MEDIA_DIR
  ]);
  await run("python3", [
    "scripts/upload_slideshow_assets.py",
    "--root",
    pack,
    "--campaign-date",
    slugDate(slug),
    "--slug",
    storageSlugForPack(slug),
    "--execute",
    "--manifest-out",
    uploadManifest,
    "--public-media-dir",
    COMPACT_PUBLIC_MEDIA_DIR,
    "--skip-private",
    "--skip-rendered-png",
    "--skip-metadata"
  ]);
  await run("node", [
    "scripts/apply_supabase_media_to_postiz_schedule.mjs",
    "--pack",
    pack,
    "--manifest",
    uploadManifest,
    "--media-dir",
    COMPACT_PUBLIC_MEDIA_DIR
  ]);

  return {
    schedule: await readJson(schedulePath),
    uploaded: true,
    upload_manifest: uploadManifest
  };
}

function instagramOnlySchedule({ baseSchedule, pack, scheduledAt, dryRun }) {
  const instagramAccountId = process.env.POSTIZ_INSTAGRAM_ACCOUNT_ID;
  assert(instagramAccountId, "POSTIZ_INSTAGRAM_ACCOUNT_ID is required to upload/schedule Instagram through Postiz.");
  assert(process.env.POSTIZ_API_KEY, "POSTIZ_API_KEY is required to upload/schedule Instagram through Postiz.");
  assert(process.env.POSTIZ_URL || process.env.POSTIZ_PUBLIC_API_BASE, "POSTIZ_URL or POSTIZ_PUBLIC_API_BASE is required for Postiz.");
  assert(dryRun || process.env.POSTIZ_ENABLE_LIVE_POSTING === "1", "POSTIZ_ENABLE_LIVE_POSTING=1 is required for live Instagram scheduling.");

  const post = (baseSchedule.posts || []).find((item) => item.platform === "instagram");
  assert(post, "postiz-schedule.json does not contain an Instagram post.");
  assert((post.media_paths || []).every((mediaPath) => /^https:\/\//i.test(mediaPath)), "Instagram Postiz scheduling requires public HTTPS media paths.");

  const effectivePost = {
    ...post,
    account_id: instagramAccountId,
    publish_mode: "direct-public",
    scheduled_at: scheduledAt || post.scheduled_at || defaultScheduledAt()
  };

  return {
    ...baseSchedule,
    dry_run: Boolean(dryRun),
    publish_mode: "direct-public",
    media_transport: "supabase_public_https",
    accounts: [
      {
        account_id: instagramAccountId,
        platform: "instagram",
        status: "env_configured"
      }
    ],
    posts: [effectivePost],
    dual_upload_source_pack: pack
  };
}

async function runTikTokInbox({ pack, dryRun, skip, tiktokAccount, allowAlreadyScheduled }) {
  if (skip) return { skipped: true, reason: "--skip-tiktok" };
  const integration = resolveTiktokPostizAccountId(tiktokAccount);
  const profile = tiktokAccountProfile(tiktokAccount);
  assert(integration, `${tiktokAccountEnvHint(tiktokAccount)} is required for TikTok inbox upload.`);
  if (dryRun) {
    const preflightArgs = ["scripts/slideshow_prod_preflight.mjs", "--pack", pack, "--publish-mode", "inbox-file"];
    if (allowAlreadyScheduled) preflightArgs.push("--allow-already-scheduled");
    await run("node", preflightArgs, {
      env: { POSTIZ_TIKTOK_ACCOUNT_ID: integration }
    });
    return { dry_run: true, upload: "skipped", tiktok_account_profile: profile.profile };
  }

  const uploadArgs = [
    "scripts/tiktok_inbox_file_upload.sh",
    "--pack",
    pack,
    "--integration",
    integration
  ];
  if (allowAlreadyScheduled) uploadArgs.push("--allow-already-scheduled");
  await run("zsh", uploadArgs, {
    env: marketingSupabaseUploadEnvForTiktokProfile(profile.profile)
  });
  return { uploaded: true, mode: "tiktok_photo_media_upload_inbox", tiktok_account_profile: profile.profile };
}

async function runInstagramPostiz({ pack, dryRun, skip, scheduledAt, forcePublicMedia }) {
  if (skip) return { skipped: true, reason: "--skip-instagram" };
  assert(process.env.POSTIZ_INSTAGRAM_ACCOUNT_ID, "POSTIZ_INSTAGRAM_ACCOUNT_ID is required to upload/schedule Instagram through Postiz.");
  assert(process.env.POSTIZ_API_KEY, "POSTIZ_API_KEY is required to upload/schedule Instagram through Postiz.");
  assert(process.env.POSTIZ_URL || process.env.POSTIZ_PUBLIC_API_BASE, "POSTIZ_URL or POSTIZ_PUBLIC_API_BASE is required for Postiz.");
  assert(dryRun || process.env.POSTIZ_ENABLE_LIVE_POSTING === "1", "POSTIZ_ENABLE_LIVE_POSTING=1 is required for live Instagram scheduling.");
  const publicMedia = await ensurePublicMedia({ pack, force: forcePublicMedia });
  const schedule = instagramOnlySchedule({
    baseSchedule: publicMedia.schedule,
    pack,
    scheduledAt,
    dryRun
  });
  const outputSchedule = path.join(pack, "postiz-instagram-schedule.json");
  await writeJson(outputSchedule, schedule);
  await run("node", ["scripts/slideshow_queue_worker.mjs", "--schedule", outputSchedule]);
  return {
    scheduled: !dryRun,
    dry_run: Boolean(dryRun),
    schedule: outputSchedule,
    uploaded_public_media: publicMedia.uploaded,
    upload_manifest: publicMedia.upload_manifest
  };
}

async function main() {
  const { args, flags } = parseArgs(process.argv.slice(2));
  if (flags.has("--help") || flags.has("-h")) {
    printHelp();
    return;
  }

  const packArg = args.get("--pack");
  assert(packArg, "--pack is required.");
  const pack = path.resolve(packArg);
  assert(await exists(pack), `Pack not found: ${pack}`);
  assert(await exists(path.join(pack, "source/qa-report.json")), "Pack must have source/qa-report.json before upload.");
  const qa = await readJson(path.join(pack, "source/qa-report.json"));
  assert(qa.ok === true && qa.pass === true && qa.production === true, "Pack must pass production QA before upload.");

  const dryRun = flags.has("--dry-run");
  const tiktokAccount = args.get("--tiktok-account") || args.get("--tiktok-profile") || null;
  const profile = tiktokAccountProfile(tiktokAccount);
  const publicationWip = flags.has("--skip-tiktok") || dryRun || flags.has("--ignore-publication-wip")
    ? null
    : await loadPublicationWorkflowSnapshot({ accountProfile: profile.profile });
  assert(
    !publicationWip?.blocked,
    `${profile.label} has ${publicationWip?.active_wip}/${publicationWip?.max_wip} active publication items. Publish and sync metrics before another inbox upload, or use --ignore-publication-wip only for an intentional exception.`,
  );
  const result = {
    ok: true,
    pack: path.relative(process.cwd(), pack),
    dry_run: dryRun,
    publication_wip: publicationWip,
    tiktok: await runTikTokInbox({
      pack,
      dryRun,
      skip: flags.has("--skip-tiktok"),
      tiktokAccount,
      allowAlreadyScheduled: flags.has("--allow-already-scheduled")
    }),
    instagram: await runInstagramPostiz({
      pack,
      dryRun,
      skip: flags.has("--skip-instagram"),
      scheduledAt: args.get("--instagram-scheduled-at") || args.get("--scheduled-at"),
      forcePublicMedia: flags.has("--force-public-media")
    })
  };

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
