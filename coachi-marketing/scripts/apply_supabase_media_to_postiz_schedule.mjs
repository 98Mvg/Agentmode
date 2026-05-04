#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import {
  publicMediaPathsForRenderedSlides
} from "./slideshow_public_media_manifest.mjs";

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
  node scripts/apply_supabase_media_to_postiz_schedule.mjs --pack content/slideshows/YYYY-MM-DD-slug --manifest content/slideshows/YYYY-MM-DD-slug/upload-manifest.json

Rewrites the pack's postiz-schedule.json media_paths to the public HTTPS Supabase URLs from upload-manifest.json.`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function main() {
  const { args, flags } = parseArgs(process.argv.slice(2));
  if (flags.has("--help") || flags.has("-h")) {
    printHelp();
    return;
  }

  const packArg = args.get("--pack");
  const manifestArg = args.get("--manifest");
  if (!packArg || !manifestArg) {
    printHelp();
    process.exit(1);
  }

  const packDir = path.resolve(packArg);
  const uploadManifestPath = path.resolve(manifestArg);
  const renderManifest = await readJson(path.join(packDir, "render-manifest.json"));
  const uploadManifest = await readJson(uploadManifestPath);
  const publicMediaPaths = publicMediaPathsForRenderedSlides({
    packDir,
    manifest: renderManifest,
    uploadManifest
  });

  const schedulePath = path.join(packDir, "postiz-schedule.json");
  const schedule = await readJson(schedulePath);
  assert(Array.isArray(schedule.posts), "postiz-schedule.json missing posts array.");

  const updated = {
    ...schedule,
    media_transport: "supabase_public_https",
    public_media_manifest: path.relative(process.cwd(), uploadManifestPath),
    safety: {
      ...(schedule.safety || {}),
      public_media_host: "coachi-marketing-assets Supabase storage",
      local_postiz_ok_when_media_paths_are_public_https: true
    },
    posts: schedule.posts.map((post) => ({
      ...post,
      media_paths: publicMediaPaths
    }))
  };

  await writeJson(schedulePath, updated);
  console.log(JSON.stringify({
    ok: true,
    schedule: path.relative(process.cwd(), schedulePath),
    public_media_count: publicMediaPaths.length,
    first_public_media_url: publicMediaPaths[0] || null
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
