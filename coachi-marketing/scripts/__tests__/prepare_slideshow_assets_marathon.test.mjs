import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));

test("marathon asset prep uses one female hook hint and Pinterest-derived support assets", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-marathon-assets-"));
  const manifestPath = path.join(tempDir, "render-manifest.json");
  const outPath = path.join(tempDir, "asset-picklist.json");

  const manifest = {
    base_dir: ".",
    output_dir: "slides/rendered",
    width: 1080,
    height: 1920,
    output_format: "png",
    account_profile: "marathon",
    tiktok_account: "marathon",
    visual_world: "forest",
    lighting_family: "soft green morning forest light",
    hook_identity: {
      identity_id: "road_to_marathon_fit_female_runner_v1",
      brand_anchor_prompt: "photorealistic fictional female beginner runner training for a marathon"
    },
    slides: [
      {
        slide_number: 1,
        role: "hook",
        input_image: "slides/source/01-hook.png",
        output_file: "01-hook.png",
        text: "I am not marathon fit yet",
        asset_source: "images_2_0",
        visual_collection: "details_emotion"
      },
      {
        slide_number: 2,
        role: "lesson",
        input_image: "slides/source/02-lesson.png",
        output_file: "02-lesson.png",
        text: "Week one is not a test.",
        asset_source: "supabase_library",
        visual_collection: "nature_context"
      },
      {
        slide_number: 3,
        role: "cta",
        input_image: "slides/source/03-cta.png",
        output_file: "03-cta.png",
        text: "Follow the six-month marathon build.",
        asset_source: "supabase_library",
        visual_collection: "nature_context"
      }
    ]
  };

  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  const result = spawnSync("node", [
    "scripts/prepare_slideshow_assets.mjs",
    "--manifest",
    manifestPath,
    "--out",
    outPath,
    "--supabase-library",
    "content/slideshows/visual-library/supabase-marathon-library-manifest.json",
    "--production"
  ], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);

  const picklist = JSON.parse(await fs.readFile(outPath, "utf8"));
  assert.equal(
    picklist.supabase_library_manifest,
    "content/slideshows/visual-library/supabase-marathon-library-manifest.json"
  );
  const hook = picklist.slides.find((slide) => slide.slide_number === 1);
  assert.match(hook.instruction.prompt_hint, /female beginner runner/i);
  assert.doesNotMatch(hook.instruction.prompt_hint, /athletic male runner/i);

  const nonHookSlides = picklist.slides.filter((slide) => slide.slide_number !== 1);
  const topIds = nonHookSlides.map((slide) => slide.instruction.candidate_assets[0]?.id);
  assert.equal(new Set(topIds).size, topIds.length);

  for (const slide of nonHookSlides) {
    assert.ok(slide.instruction.candidate_assets.length > 0);
    for (const candidate of slide.instruction.candidate_assets) {
      assert.equal(candidate.source_rights, "approved");
      assert.match(candidate.original_source_kind, /pinterest/i);
      assert.match(candidate.local_fallback_path, /road-to-marathon-fit\/pinterest-source/);
      assert.match(candidate.source_query, /\b(?:empty|no[\s_-]*(?:people|persons?|humans?|runners?))\b/i);
      assert.doesNotMatch(
        candidate.source_query.replace(/\bno[\s_-]*(?:people|persons?|humans?|runners?)\b/gi, ""),
        /\b(?:runner|runners|man|men|male|boy|boys|guy|guys|woman|women|female|girl|girls|person|people|human|humans)\b/i
      );
    }
  }
});

test("marathon pipeline routes asset prep through the marathon Supabase manifest", async () => {
  const pipeline = await fs.readFile("scripts/run_slideshow_pipeline.mjs", "utf8");
  assert.ok(pipeline.includes("ROAD_TO_MARATHON_FIT_SUPABASE_LIBRARY_MANIFEST"));
  assert.ok(pipeline.includes('assetPrepAccountProfile === "marathon"'));
  assert.ok(pipeline.includes('"--supabase-library", ROAD_TO_MARATHON_FIT_SUPABASE_LIBRARY_MANIFEST'));
});

test("marathon production QA requires explicitly empty support visuals", async () => {
  const qa = await fs.readFile("scripts/qa_slideshow_pack.mjs", "utf8");
  assert.ok(qa.includes("isExplicitlyEmptyMarathonSupportAsset"));
  assert.ok(qa.includes("must use an explicitly empty/no-person visual"));
});

test("marathon production asset prep fails instead of falling back to a recently used support visual", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-marathon-fresh-assets-"));
  const manifestPath = path.join(tempDir, "render-manifest.json");
  const usageLogPath = path.join(tempDir, "usage-log.json");
  const outPath = path.join(tempDir, "asset-picklist.json");
  const supabaseLibraryPath = path.join(repoRoot, "content/slideshows/visual-library/supabase-marathon-library-manifest.json");
  const supabaseLibrary = JSON.parse(await fs.readFile(supabaseLibraryPath, "utf8"));
  const forestCollection = supabaseLibrary.collections.find((collection) => collection.collection_id === "nature_context");
  const staleUses = forestCollection.items.map((asset, index) => ({
    used_at: `2026-07-14T12:${String(index).padStart(2, "0")}:00.000Z`,
    stage: "selected",
    slideshow_id: "recent-marathon-draft",
    slide_number: index + 2,
    asset_id: asset.id
  }));

  await fs.writeFile(manifestPath, `${JSON.stringify({
    account_profile: "marathon",
    tiktok_account: "marathon",
    visual_world: "forest",
    slides: [
      {
        slide_number: 1,
        role: "hook",
        input_image: "slides/source/01-hook.png",
        output_file: "01-hook.png",
        text: "Week 2 started slower than I wanted",
        asset_source: "images_2_0",
        visual_collection: "details_emotion"
      },
      {
        slide_number: 2,
        role: "lesson",
        input_image: "slides/source/02-lesson.png",
        output_file: "02-lesson.png",
        text: "I kept looking at the pace.",
        asset_source: "supabase_library",
        visual_collection: "nature_context"
      }
    ]
  }, null, 2)}\n`, "utf8");
  await fs.writeFile(usageLogPath, `${JSON.stringify({ uses: staleUses }, null, 2)}\n`, "utf8");

  const result = spawnSync("node", [
    "scripts/prepare_slideshow_assets.mjs",
    "--manifest",
    manifestPath,
    "--out",
    outPath,
    "--supabase-library",
    supabaseLibraryPath,
    "--usage-log",
    usageLogPath,
    "--include-selected-usage",
    "--production"
  ], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.notEqual(result.status, 0, result.stdout);
  assert.match(result.stderr, /No production-fresh assets for slide 2/i);
});

test("marathon app-proof CTA can use an approved Coachi asset on the final slide", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "coachi-marathon-cta-"));
  const manifestPath = path.join(tempDir, "render-manifest.json");
  const outPath = path.join(tempDir, "asset-picklist.json");

  await fs.writeFile(manifestPath, `${JSON.stringify({
    account_profile: "marathon",
    tiktok_account: "marathon",
    visual_world: "forest",
    slides: [
      {
        slide_number: 1,
        role: "hook",
        input_image: "slides/source/01-hook.png",
        output_file: "01-hook.png",
        text: "I kept speeding up without meaning to",
        asset_source: "images_2_0",
        visual_collection: "details_emotion"
      },
      {
        slide_number: 2,
        role: "cta",
        input_image: "slides/source/02-cta.png",
        output_file: "02-cta.png",
        text: "Coachi told me to ease off while I was still running.",
        asset_source: "supabase_library",
        visual_collection: "cta_ending",
        coachi_app_cta: true,
        preferred_asset_ids: ["coachi_cta_009_phone_forest_morning_44min"]
      }
    ]
  }, null, 2)}\n`, "utf8");

  const result = spawnSync("node", [
    "scripts/prepare_slideshow_assets.mjs",
    "--manifest",
    manifestPath,
    "--out",
    outPath,
    "--supabase-library",
    "content/slideshows/visual-library/supabase-marathon-library-manifest.json",
    "--production"
  ], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);

  const picklist = JSON.parse(await fs.readFile(outPath, "utf8"));
  const cta = picklist.slides.find((slide) => slide.slide_number === 2);
  assert.match(cta.instruction.candidate_assets[0].id, /^coachi_cta_/);
  assert.equal(cta.instruction.candidate_assets[0].source_rights, "owned");
});
