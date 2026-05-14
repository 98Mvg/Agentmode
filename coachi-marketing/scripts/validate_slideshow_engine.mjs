#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const ENGINE_DIR = path.join(ROOT, "strategy/automation/tiktok-instagram-slideshow-content-engine");
const SCHEMA_DIR = path.join(ENGINE_DIR, "schemas");
const FORMAT_CATALOG_PATH = path.join(ENGINE_DIR, "formats/coachi-formats.json");
const TEMPLATE_DIR = path.join(ENGINE_DIR, "templates");
const ACTIVE_NICHES_PATH = path.join(ENGINE_DIR, "active-niches.json");
const VISUAL_LIBRARY_PATH = path.join(ROOT, "content/slideshows/visual-library/visual-library.json");
const PINTEREST_SOURCE_MANIFEST_PATH = path.join(ROOT, "content/slideshows/visual-library/pinterest-source-manifest.json");
const OWNED_SOURCE_MANIFEST_PATH = path.join(ROOT, "content/slideshows/visual-library/owned-source-manifest.json");
const SUPABASE_LIBRARY_MANIFEST_PATH = path.join(ROOT, "content/slideshows/visual-library/supabase-library-manifest.json");
const USAGE_LOG_PATH = path.join(ROOT, "content/slideshows/visual-library/usage-log.json");
const RAW_PROBLEM_BANK_PATH = path.join(ROOT, "inputs/research/raw-runner-problems.json");
const TIKTOK_TEXT_BANK_PATH = path.join(ROOT, "inputs/research/tiktok-proven-slideshow-text-bank.json");
const FORMAT_CAPTURE_MANIFEST_PATH = path.join(ROOT, "inputs/research/slideshow-format-captures/format-capture-manifest.json");
const TIKTOK_HOOK_PATTERN_BANK_PATH = path.join(ROOT, "inputs/research/tiktok-running-hook-pattern-bank.md");
const PACKAGE_JSON_PATH = path.join(ROOT, "package.json");
const RENDER_TEMPLATE_PATH = path.join(ENGINE_DIR, "templates/render-manifest-template.json");
const POSTIZ_TEMPLATE_PATH = path.join(ENGINE_DIR, "templates/postiz-schedule-manifest-template.json");
const SLIDESHOW_CONTENT_DIR = path.join(ROOT, "content/slideshows");
const ALLOWED_ASSET_SOURCES = new Set([
  "images_2_0",
  "supabase_library",
  "supabase_template",
  "pinterest_library",
  "pinterest_template",
  "coachi_generated",
  "licensed_stock",
  "owned_photo"
]);
const ALLOWED_TEXT_POSITIONS = new Set(["top", "center", "lower_middle", "bottom"]);

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function validateSchemas() {
  const entries = await fs.readdir(SCHEMA_DIR);
  const schemaFiles = entries.filter((entry) => entry.endsWith(".json")).sort();
  assert(schemaFiles.length >= 3, "Expected at least 3 slideshow schema JSON files.");

  for (const fileName of schemaFiles) {
    const filePath = path.join(SCHEMA_DIR, fileName);
    const schema = await readJson(filePath);
    assert(schema.format_name, `${fileName}: missing format_name.`);
    assert(Number.isInteger(schema.version), `${fileName}: missing integer version.`);
    assert(Number.isInteger(schema.total_slides), `${fileName}: missing integer total_slides.`);
    assert(Array.isArray(schema.slides), `${fileName}: missing slides array.`);
    assert(schema.slides.length === schema.total_slides, `${fileName}: slide count does not match total_slides.`);
    assert(schema.required_spine?.emotion === true, `${fileName}: required_spine must require emotion.`);
    assert(schema.required_spine?.images_2_0_hook_slide === 1, `${fileName}: required_spine must require Images 2.0 on slide 1.`);
    assert(schema.required_spine?.generated_avatar_world === true, `${fileName}: required_spine must require generated avatar world.`);
    assert(schema.required_spine?.single_visual_world === true, `${fileName}: required_spine must require one visual world.`);
    assert(schema.required_spine?.lighting_consistency === true, `${fileName}: required_spine must require lighting consistency.`);
    assert(schema.required_spine?.final_cta === true, `${fileName}: required_spine must require final CTA.`);
    assert(schema.slides[0]?.asset_source === "images_2_0", `${fileName}: slide 1 must use Images 2.0.`);
    assert(schema.slides[schema.slides.length - 1]?.role === "cta", `${fileName}: final slide must be CTA.`);

    schema.slides.forEach((slide, index) => {
      const expectedNumber = index + 1;
      assert(slide.slide_number === expectedNumber, `${fileName}: slide ${expectedNumber} has wrong slide_number.`);
      assert(slide.role, `${fileName}: slide ${expectedNumber} missing role.`);
      assert(slide.objective, `${fileName}: slide ${expectedNumber} missing objective.`);
      assert(slide.text_template, `${fileName}: slide ${expectedNumber} missing text_template.`);
      assert(slide.visual_style_notes, `${fileName}: slide ${expectedNumber} missing visual_style_notes.`);
      assert(slide.image_prompt_template, `${fileName}: slide ${expectedNumber} missing image_prompt_template.`);
      assert(ALLOWED_TEXT_POSITIONS.has(slide.text_position), `${fileName}: slide ${expectedNumber} has invalid text_position.`);
    });
  }

  return schemaFiles.length;
}

async function validateFormatCatalog() {
  const catalog = await readJson(FORMAT_CATALOG_PATH);
  assert(catalog.schema_version === 1, "coachi-formats.json: expected schema_version 1.");
  assert(Array.isArray(catalog.formats), "coachi-formats.json: missing formats array.");
  const required = new Set([
    "top_running_mistakes",
    "easy_run_too_fast",
    "nobody_talks_about_zone2",
    "beginner_runner_rules",
    "why_you_plateau",
    "stop_racing_easy_runs",
    "heart_rate_training_myths",
    "things_i_wish_i_knew_running"
  ]);
  for (const format of catalog.formats) {
    assert(format.format_id, "coachi-formats.json: format missing format_id.");
    assert(format.format_name, `${format.format_id}: missing format_name.`);
    assert(format.hook_pattern, `${format.format_id}: missing hook_pattern.`);
    assert(Number.isInteger(format.slide_count) && format.slide_count >= 6 && format.slide_count <= 7, `${format.format_id}: slide_count must be 6 or 7.`);
    assert(Array.isArray(format.slide_roles) && format.slide_roles.length === format.slide_count, `${format.format_id}: slide_roles must match slide_count.`);
    assert(format.pacing_notes, `${format.format_id}: missing pacing_notes.`);
    assert(format.visual_style_notes, `${format.format_id}: missing visual_style_notes.`);
    assert(format.cta_style, `${format.format_id}: missing cta_style.`);
    assert(Array.isArray(format.coachi_use_cases) && format.coachi_use_cases.length > 0, `${format.format_id}: missing Coachi use cases.`);
    required.delete(format.format_id);
  }
  assert(required.size === 0, `coachi-formats.json: missing required formats ${[...required].join(", ")}.`);
  return {
    path: path.relative(ROOT, FORMAT_CATALOG_PATH),
    formats: catalog.formats.length
  };
}

async function validateVisualLibrary() {
  const library = await readJson(VISUAL_LIBRARY_PATH);
  assert(library.schema_version === 1, "visual-library.json: expected schema_version 1.");
  assert(library.default_identity, "visual-library.json: missing default_identity.");
  assert(Array.isArray(library.identities) && library.identities.length > 0, "visual-library.json: missing identities.");
  assert(Array.isArray(library.route_tags) && library.route_tags.length > 0, "visual-library.json: missing route_tags.");
  assert(Array.isArray(library.style_tags) && library.style_tags.length > 0, "visual-library.json: missing style_tags.");
  assert(Array.isArray(library.pinterest_research_collections) && library.pinterest_research_collections.length > 0, "visual-library.json: missing pinterest_research_collections.");
  assert(library.hybrid_cost_model?.name, "visual-library.json: missing hybrid_cost_model.");
  assert(library.hybrid_cost_model.hybrid_model?.ai_images_per_slideshow === 1, "visual-library.json: hybrid model should use exactly 1 AI image.");
  assert(library.hybrid_cost_model.hybrid_model?.library_images_per_slideshow >= 6, "visual-library.json: hybrid model should use at least 6 library images.");
  assert(library.hybrid_cost_model.images_2_0_guardrail?.max_images_per_slideshow === 1, "visual-library.json: Images 2.0 guardrail must allow max 1 image per slideshow.");
  assert(library.hybrid_cost_model.images_2_0_guardrail?.allowed_slide_roles?.includes("hook"), "visual-library.json: Images 2.0 guardrail must allow hook only.");
  assert(library.library_scale_target?.target_images_per_aesthetic?.min >= 500, "visual-library.json: expected Pinterest scale target.");
  assert(library.rotation_policy?.max_uses_per_asset_per_30_days > 0, "visual-library.json: missing rotation policy.");
  assert(library.text_overlay_defaults?.width === 1080, "visual-library.json: expected 1080 width default.");
  assert(library.text_overlay_defaults?.height === 1920, "visual-library.json: expected 1920 height default.");
  assert(Array.isArray(library.pinterest_expansion_backlog), "visual-library.json: missing pinterest_expansion_backlog.");
  assert(library.pinterest_expansion_backlog.length >= 5, "visual-library.json: expected at least 5 Pinterest expansion backlog categories.");

  const identityIds = new Set(library.identities.map((identity) => identity.id));
  assert(identityIds.has(library.default_identity), "visual-library.json: default_identity is not present in identities.");
  const defaultIdentity = library.identities.find((identity) => identity.id === library.default_identity);
  assert(defaultIdentity?.workout_phase_rotation_policy?.phase_variants?.some((variant) => /pre-workout/i.test(variant)), "visual-library.json: default identity must include pre-workout phase rotation.");
  assert(defaultIdentity?.workout_phase_rotation_policy?.phase_variants?.some((variant) => /during-workout/i.test(variant)), "visual-library.json: default identity must include during-workout phase rotation.");
  assert(defaultIdentity?.workout_phase_rotation_policy?.phase_variants?.some((variant) => /post-workout/i.test(variant)), "visual-library.json: default identity must include post-workout phase rotation.");
  assert(defaultIdentity?.gear_rotation_policy?.watch_mode === "disabled", "visual-library.json: default identity watch_mode must be disabled.");
  assert(defaultIdentity?.gear_rotation_policy?.watch_variants?.some((variant) => /no visible watch/i.test(variant)), "visual-library.json: default identity must disable visible watches.");
  assert(defaultIdentity?.gear_rotation_policy?.watch_constraints?.some((rule) => /no Apple Watch/i.test(rule)), "visual-library.json: default identity must block Apple Watch while watch mode is disabled.");
  assert(defaultIdentity?.gear_rotation_policy?.top_variants?.length >= 6, "visual-library.json: default identity needs top/clothing rotation.");
  assert(defaultIdentity?.gear_rotation_policy?.shorts_variants?.length >= 6, "visual-library.json: default identity needs shorts color rotation.");

  for (const collection of library.pinterest_research_collections) {
    assert(collection.id, "visual-library.json: Pinterest collection missing id.");
    assert(collection.label, `${collection.id}: missing label.`);
    assert(Number.isInteger(collection.pin_count) && collection.pin_count > 0, `${collection.id}: invalid pin_count.`);
    assert(Array.isArray(collection.best_for_slide_roles) && collection.best_for_slide_roles.length > 0, `${collection.id}: missing best_for_slide_roles.`);
    assert(Array.isArray(collection.mood_tags) && collection.mood_tags.length > 0, `${collection.id}: missing mood_tags.`);
    assert(Array.isArray(collection.subject_tags) && collection.subject_tags.length > 0, `${collection.id}: missing subject_tags.`);
    assert(Array.isArray(collection.color_tags) && collection.color_tags.length > 0, `${collection.id}: missing color_tags.`);
    assert(Array.isArray(collection.aesthetic_tags) && collection.aesthetic_tags.length > 0, `${collection.id}: missing aesthetic_tags.`);
    assert(collection.prompt_translation, `${collection.id}: missing prompt_translation.`);
  }

  for (const backlogItem of library.pinterest_expansion_backlog) {
    assert(backlogItem.id, "visual-library.json: expansion backlog item missing id.");
    assert(backlogItem.status === "backlog", `${backlogItem.id}: expansion backlog status must be backlog.`);
    assert(Array.isArray(backlogItem.pinterest_search_queries) && backlogItem.pinterest_search_queries.length > 0, `${backlogItem.id}: missing Pinterest search queries.`);
    assert(Array.isArray(backlogItem.accept_if) && backlogItem.accept_if.length > 0, `${backlogItem.id}: missing accept_if review criteria.`);
    assert(Array.isArray(backlogItem.block_if) && backlogItem.block_if.length > 0, `${backlogItem.id}: missing block_if review criteria.`);
  }

  return {
    identities: library.identities.length,
    route_tags: library.route_tags.length,
    style_tags: library.style_tags.length,
    pinterest_collections: library.pinterest_research_collections.length,
    pinterest_pin_count: library.pinterest_research_collections.reduce((total, collection) => total + collection.pin_count, 0),
    hybrid_cost_model: library.hybrid_cost_model.name
  };
}

async function validatePackageJson() {
  const packageJson = await readJson(PACKAGE_JSON_PATH);
  const scripts = packageJson.scripts || {};
  const dependencies = packageJson.dependencies || {};

  for (const scriptName of ["slideshow:validate", "slideshow:render", "slideshow:assets", "slideshow:materialize", "slideshow:supabase-library", "slideshow:upload-library", "slideshow:topics", "slideshow:queue", "slideshow:queue-smoke", "slideshow:prod-preflight", "slideshow:qa", "slideshow:pipeline", "slideshow:full-loop", "slideshow:log-result", "slideshow:readiness", "slideshow:carousel-pack"]) {
    assert(scripts[scriptName], `package.json: missing script ${scriptName}.`);
  }
  assert(scripts["slideshow:owned-assets"], "package.json: missing script slideshow:owned-assets.");
  assert(scripts["slideshow:approve-library"], "package.json: missing script slideshow:approve-library.");

  for (const dependency of ["sharp", "@napi-rs/canvas", "bullmq", "ioredis", "dotenv"]) {
    assert(dependencies[dependency], `package.json: missing dependency ${dependency}.`);
  }
}

async function validateRawProblemBank() {
  const problemBank = await readJson(RAW_PROBLEM_BANK_PATH);
  assert(problemBank.schema_version === 1, "raw-runner-problems.json: expected schema_version 1.");
  assert(Array.isArray(problemBank.problems) && problemBank.problems.length >= 5, "raw-runner-problems.json: expected at least 5 sourced problems.");

  for (const problem of problemBank.problems) {
    assert(problem.id, "raw-runner-problems.json: problem missing id.");
    assert(problem.source_url, `${problem.id}: missing source_url.`);
    assert(problem.exact_words, `${problem.id}: missing exact_words.`);
    assert(problem.problem_type, `${problem.id}: missing problem_type.`);
    assert(problem.content_angle, `${problem.id}: missing content_angle.`);
    assert(Number.isInteger(problem.total_score) && problem.total_score > 0, `${problem.id}: invalid total_score.`);
    if (problem.sourced_mistakes) {
      assert(Array.isArray(problem.sourced_mistakes), `${problem.id}: sourced_mistakes must be an array.`);
      for (const mistake of problem.sourced_mistakes) {
        assert(mistake.text, `${problem.id}: sourced_mistakes item missing text.`);
        assert(mistake.source_url, `${problem.id}: sourced_mistakes item missing source_url.`);
      }
    }
  }

  return {
    problems: problemBank.problems.length,
    source_backed_top_five_topics: problemBank.problems.filter((problem) => Array.isArray(problem.sourced_mistakes) && problem.sourced_mistakes.length >= 5).length
  };
}

async function validateFormatCaptureManifest() {
  const manifest = await readJson(FORMAT_CAPTURE_MANIFEST_PATH);
  assert(manifest.schema_version === 1, "format-capture-manifest.json: expected schema_version 1.");
  assert(manifest.target_window_days === 30, "format-capture-manifest.json: expected 30 day capture window.");
  assert(manifest.target_capture_count_per_schema_family?.min >= 20, "format-capture-manifest.json: expected min 20 captures per schema family.");
  assert(Array.isArray(manifest.captures), "format-capture-manifest.json: missing captures array.");

  for (const capture of manifest.captures) {
    assert(capture.id, "format-capture-manifest.json: capture missing id.");
    assert(capture.source_url, `${capture.id}: missing source_url.`);
    assert(capture.schema_family, `${capture.id}: missing schema_family.`);
    assert(Array.isArray(capture.structure_notes) && capture.structure_notes.length > 0, `${capture.id}: missing structure_notes.`);
  }

  return {
    captures: manifest.captures.length,
    target_min_per_schema_family: manifest.target_capture_count_per_schema_family.min
  };
}

async function validateTikTokHookPatternBank() {
  const text = await fs.readFile(TIKTOK_HOOK_PATTERN_BANK_PATH, "utf8");
  assert(text.includes("do not mention `data` in hooks"), "tiktok-running-hook-pattern-bank.md: missing no-data hook rule.");
  assert(text.includes("TikTok Running Hook Pattern Bank"), "tiktok-running-hook-pattern-bank.md: missing title.");
  return true;
}

async function validateTikTokProvenTextBank() {
  const bank = await readJson(TIKTOK_TEXT_BANK_PATH);
  assert(bank.schema_version === 1, "tiktok-proven-slideshow-text-bank.json: expected schema_version 1.");
  assert(Array.isArray(bank.source_files) && bank.source_files.length >= 2, "tiktok-proven-slideshow-text-bank.json: missing source_files.");
  assert(Array.isArray(bank.hook_families) && bank.hook_families.length >= 8, "tiktok-proven-slideshow-text-bank.json: expected at least 8 hook families.");
  assert(bank.problem_type_packs && typeof bank.problem_type_packs === "object", "tiktok-proven-slideshow-text-bank.json: missing problem_type_packs.");

  const familyIds = new Set();
  for (const family of bank.hook_families) {
    assert(family.id, "tiktok-proven-slideshow-text-bank.json: hook family missing id.");
    assert(!familyIds.has(family.id), `tiktok-proven-slideshow-text-bank.json: duplicate hook family ${family.id}.`);
    familyIds.add(family.id);
    assert(family.source_excerpt, `${family.id}: missing source_excerpt.`);
    assert(family.source_signal, `${family.id}: missing source_signal.`);
    assert(family.source_url, `${family.id}: missing source_url.`);
    assert(Array.isArray(family.safe_hook_shapes) && family.safe_hook_shapes.length > 0, `${family.id}: missing safe_hook_shapes.`);
  }

  for (const [packId, pack] of Object.entries(bank.problem_type_packs)) {
    assert(Array.isArray(pack.preferred_hooks) && pack.preferred_hooks.length > 0, `${packId}: missing preferred_hooks.`);
    assert(Array.isArray(pack.slide_sets) && pack.slide_sets.length > 0, `${packId}: missing slide_sets.`);
    for (const hook of pack.preferred_hooks) {
      assert(hook.text, `${packId}: preferred hook missing text.`);
      assert(hook.source_family_id && familyIds.has(hook.source_family_id), `${packId}: unknown source_family_id ${hook.source_family_id}.`);
    }
    for (const slideSet of pack.slide_sets) {
      assert(slideSet.id, `${packId}: slide_set missing id.`);
      assert(Array.isArray(slideSet.source_family_ids) && slideSet.source_family_ids.length > 0, `${packId}: ${slideSet.id} missing source_family_ids.`);
      assert(Array.isArray(slideSet.slides_1_to_6) && slideSet.slides_1_to_6.length === 6, `${packId}: ${slideSet.id} must include exactly slides_1_to_6.`);
      for (const text of slideSet.slides_1_to_6) {
        assert(String(text || "").trim().length > 0, `${packId}: ${slideSet.id} contains an empty slide line.`);
        assert(String(text).length <= 48, `${packId}: ${slideSet.id} slide line is too long: ${text}`);
      }
    }
  }

  return {
    hook_families: bank.hook_families.length,
    problem_type_packs: Object.keys(bank.problem_type_packs).length
  };
}

async function validateUsageLog() {
  const usageLog = await readJson(USAGE_LOG_PATH);
  assert(usageLog.schema_version === 1, "usage-log.json: expected schema_version 1.");
  assert(Array.isArray(usageLog.uses), "usage-log.json: missing uses array.");
  assert(usageLog.rotation_policy?.max_uses_per_asset_per_30_days > 0, "usage-log.json: missing rotation policy.");
  return usageLog.uses.length;
}

async function validateRenderTemplate() {
  const template = await readJson(RENDER_TEMPLATE_PATH);
  validateRenderManifestShape(template, "render-manifest-template.json");
  return template.slides.length;
}

async function validateRequiredTemplates() {
  const requiredTemplates = [
    "viral-format-capture-template.md",
    "reverse-engineering-prompt.md",
    "images-2-0-hook-only-prompt.md",
    "pinterest-library-import-template.json",
    "postiz-schedule-manifest-template.json",
    "render-manifest-template.json",
    "slideshow-day-pack-template.md",
    "viral-hook-structure-generator.md"
  ];

  for (const template of requiredTemplates) {
    await fs.access(path.join(TEMPLATE_DIR, template));
  }

  const postizTemplate = await readJson(POSTIZ_TEMPLATE_PATH);
  assert(postizTemplate.dry_run === true, "postiz-schedule-manifest-template.json must default to dry_run true.");
  assert(postizTemplate.safety?.use_official_integrations_only === true, "Postiz template must require official integrations.");
  assert(postizTemplate.safety?.requires_live_env_flag === "POSTIZ_ENABLE_LIVE_POSTING=1", "Postiz template must require live env flag.");
  assert(postizTemplate.rate_limits?.min_hours_between_posts_per_account >= 3, "Postiz template must space account posts by at least 3 hours.");
  assert(postizTemplate.posts?.[0]?.output_mode === "photo_carousel", "Postiz template must default TikTok slideshow posts to photo_carousel.");
  assert(postizTemplate.posts?.[0]?.media_type === "PHOTO", "Postiz template must default TikTok slideshow posts to PHOTO.");
  assert(postizTemplate.posts?.[0]?.publish_mode === "direct-public", "Postiz template must show TikTok direct-public publish_mode.");
  assert(postizTemplate.posts?.[0]?.media_paths?.length >= 2, "Postiz template must model a multi-image TikTok photo carousel.");

  const imagesHookTemplate = await fs.readFile(path.join(TEMPLATE_DIR, "images-2-0-hook-only-prompt.md"), "utf8");
  assert(imagesHookTemplate.includes("Avatar Variation"), "images-2-0-hook-only-prompt.md must include avatar variation rules.");
  assert(imagesHookTemplate.includes("Workout Phase"), "images-2-0-hook-only-prompt.md must include workout phase rules.");
  assert(/pre-workout/i.test(imagesHookTemplate) && /during-workout/i.test(imagesHookTemplate) && /post-workout/i.test(imagesHookTemplate), "images-2-0-hook-only-prompt.md must include pre/during/post workout rotation.");
  assert(/no visible watch/i.test(imagesHookTemplate), "images-2-0-hook-only-prompt.md must disable visible watches.");
  assert(/Do not include Apple Watch,\s*Garmin watch/i.test(imagesHookTemplate), "images-2-0-hook-only-prompt.md must block Apple Watch/Garmin while disabled.");

  return requiredTemplates.length;
}

async function validateActiveNiches() {
  const config = await readJson(ACTIVE_NICHES_PATH);
  assert(config.schema_version === 1, "active-niches.json: expected schema_version 1.");
  assert(Number.isInteger(config.default_daily_deck_limit) && config.default_daily_deck_limit > 0, "active-niches.json: missing default_daily_deck_limit.");
  assert(Number(config.default_spacing_hours) >= 4, "active-niches.json: default_spacing_hours must be at least 4.");
  assert(config.default_require_sourced_mistakes_for_top5 === true, "active-niches.json: Top 5 full-loop topics must default to source-backed mistakes.");
  assert(Array.isArray(config.niches) && config.niches.length > 0, "active-niches.json: missing niches array.");
  assert(config.niches.some((niche) => niche.active !== false), "active-niches.json: expected at least one active niche.");

  const seen = new Set();
  for (const niche of config.niches) {
    assert(niche.id, "active-niches.json: niche missing id.");
    assert(!seen.has(niche.id), `active-niches.json: duplicate niche id ${niche.id}.`);
    seen.add(niche.id);
    assert(niche.label, `${niche.id}: missing label.`);
    assert(Array.isArray(niche.problem_types) && niche.problem_types.length > 0, `${niche.id}: missing problem_types.`);
    assert(Number(niche.min_score) >= 0, `${niche.id}: invalid min_score.`);
    assert(niche.require_sourced_mistakes_for_top5 === true, `${niche.id}: require_sourced_mistakes_for_top5 must be true.`);
  }

  return {
    niches: config.niches.length,
    active_niches: config.niches.filter((niche) => niche.active !== false).length
  };
}

async function validatePinterestSourceManifest() {
  try {
    await fs.access(PINTEREST_SOURCE_MANIFEST_PATH);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }

  const manifest = await readJson(PINTEREST_SOURCE_MANIFEST_PATH);
  assert(Array.isArray(manifest.collections), "pinterest-source-manifest.json: missing collections.");
  assert(Number.isInteger(manifest.total_items), "pinterest-source-manifest.json: missing total_items.");
  assert(manifest.tagging_policy?.source === "x_article_adaptation", "pinterest-source-manifest.json: missing X-article tagging policy.");

  let countedItems = 0;
  for (const collection of manifest.collections) {
    assert(collection.collection_id, "pinterest-source-manifest.json: collection missing id.");
    assert(Array.isArray(collection.items), `${collection.collection_id}: missing items.`);
    assert(Array.isArray(collection.mood_tags) && collection.mood_tags.length > 0, `${collection.collection_id}: missing collection mood_tags.`);
    assert(Array.isArray(collection.subject_tags) && collection.subject_tags.length > 0, `${collection.collection_id}: missing collection subject_tags.`);
    assert(Array.isArray(collection.color_tags) && collection.color_tags.length > 0, `${collection.collection_id}: missing collection color_tags.`);
    assert(Array.isArray(collection.aesthetic_tags) && collection.aesthetic_tags.length > 0, `${collection.collection_id}: missing collection aesthetic_tags.`);
    countedItems += collection.items.length;
    for (const item of collection.items) {
      assert(item.local_path, `${collection.collection_id}: item missing local_path.`);
      assert(item.sha256, `${collection.collection_id}: item missing sha256.`);
      assert(["needs_review", "approved"].includes(item.source_rights), `${collection.collection_id}: Pinterest assets must be needs_review or owner-approved.`);
      if (item.source_rights === "needs_review") {
        assert(item.rights_review_status === "needs_review_not_for_production", `${item.id}: imported Pinterest assets must be marked not for production until reviewed.`);
      }
      if (item.source_rights === "approved") {
        assert(item.rights_review_status === "owner_approved_for_production", `${item.id}: approved Pinterest assets must include owner approval status.`);
        assert(item.approval?.approved_at && item.approval?.approved_by, `${item.id}: approved Pinterest asset missing approval metadata.`);
      }
      assert(Array.isArray(item.mood_tags) && item.mood_tags.length > 0, `${item.id}: missing mood_tags.`);
      assert(Array.isArray(item.subject_tags) && item.subject_tags.length > 0, `${item.id}: missing subject_tags.`);
      assert(Array.isArray(item.color_tags) && item.color_tags.length > 0, `${item.id}: missing color_tags.`);
      assert(Array.isArray(item.aesthetic_tags) && item.aesthetic_tags.length > 0, `${item.id}: missing aesthetic_tags.`);
      assert(Array.isArray(item.best_for_slide_roles) && item.best_for_slide_roles.length > 0, `${item.id}: missing best_for_slide_roles.`);
      assert(Array.isArray(item.best_for_platforms) && item.best_for_platforms.length > 0, `${item.id}: missing best_for_platforms.`);
      if (item.source_rights === "needs_review") {
        assert(Array.isArray(item.source_review_tags) && item.source_review_tags.includes("needs_rights_review"), `${item.id}: missing source_review_tags rights marker.`);
      }
      if (item.source_rights === "approved") {
        assert(Array.isArray(item.source_review_tags) && item.source_review_tags.includes("owner_approved_asset"), `${item.id}: missing owner approval marker.`);
      }
    }
  }

  assert(countedItems === manifest.total_items, "pinterest-source-manifest.json: total_items mismatch.");

  return {
    collections: manifest.collections.length,
    total_items: manifest.total_items
  };
}

async function validateOwnedSourceManifest() {
  try {
    await fs.access(OWNED_SOURCE_MANIFEST_PATH);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }

  const manifest = await readJson(OWNED_SOURCE_MANIFEST_PATH);
  assert(manifest.schema_version === 1, "owned-source-manifest.json: expected schema_version 1.");
  assert(
    ["owned_generated_visual_library", "owned_coachi_visual_library"].includes(manifest.source),
    "owned-source-manifest.json: invalid source."
  );
  assert(manifest.source_policy?.rights === "owned", "owned-source-manifest.json: source_policy must declare owned rights.");
  assert(manifest.source_policy?.no_third_party_photo_sources === true, "owned-source-manifest.json: must block third-party photo sources.");
  assert(Array.isArray(manifest.collections), "owned-source-manifest.json: missing collections.");
  assert(Number.isInteger(manifest.total_items) && manifest.total_items > 0, "owned-source-manifest.json: missing total_items.");

  let countedItems = 0;
  for (const collection of manifest.collections) {
    assert(collection.collection_id, "owned-source-manifest.json: collection missing id.");
    assert(Array.isArray(collection.items), `${collection.collection_id}: missing items.`);
    assert(Array.isArray(collection.mood_tags) && collection.mood_tags.length > 0, `${collection.collection_id}: missing collection mood_tags.`);
    assert(Array.isArray(collection.subject_tags) && collection.subject_tags.length > 0, `${collection.collection_id}: missing collection subject_tags.`);
    assert(Array.isArray(collection.color_tags) && collection.color_tags.length > 0, `${collection.collection_id}: missing collection color_tags.`);
    assert(Array.isArray(collection.aesthetic_tags) && collection.aesthetic_tags.length > 0, `${collection.collection_id}: missing collection aesthetic_tags.`);
    countedItems += collection.items.length;
    for (const item of collection.items) {
      assert(item.local_path, `${collection.collection_id}: item missing local_path.`);
      assert(item.sha256, `${collection.collection_id}: item missing sha256.`);
      assert(item.detected_mime_type === "image/png", `${item.id}: owned assets must be PNG files.`);
      assert(item.source_rights === "owned", `${item.id}: owned assets must be marked owned.`);
      assert(
        ["owned_generated_production_ready", "owned_app_ui_production_ready"].includes(item.rights_review_status),
        `${item.id}: owned assets must be production ready.`
      );
      assert(Array.isArray(item.mood_tags) && item.mood_tags.length > 0, `${item.id}: missing mood_tags.`);
      assert(Array.isArray(item.subject_tags) && item.subject_tags.length > 0, `${item.id}: missing subject_tags.`);
      assert(Array.isArray(item.color_tags) && item.color_tags.length > 0, `${item.id}: missing color_tags.`);
      assert(
        Array.isArray(item.aesthetic_tags)
          && (item.aesthetic_tags.includes("owned_generated_background") || item.aesthetic_tags.includes("owned_coachi_app_ui")),
        `${item.id}: missing owned source aesthetic tag.`
      );
      assert(Array.isArray(item.best_for_slide_roles) && item.best_for_slide_roles.length > 0, `${item.id}: missing best_for_slide_roles.`);
      assert(Array.isArray(item.best_for_platforms) && item.best_for_platforms.length > 0, `${item.id}: missing best_for_platforms.`);
      assert(
        Array.isArray(item.source_review_tags)
          && (item.source_review_tags.includes("owned_generated_asset") || item.source_review_tags.includes("owned_app_ui_asset")),
        `${item.id}: missing owned source marker.`
      );
    }
  }

  assert(countedItems === manifest.total_items, "owned-source-manifest.json: total_items mismatch.");

  return {
    collections: manifest.collections.length,
    total_items: manifest.total_items
  };
}

async function validateSupabaseLibraryManifest() {
  try {
    await fs.access(SUPABASE_LIBRARY_MANIFEST_PATH);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }

  const manifest = await readJson(SUPABASE_LIBRARY_MANIFEST_PATH);
  assert(manifest.schema_version === 1, "supabase-library-manifest.json: expected schema_version 1.");
  assert(manifest.source_policy?.default_source === "supabase_public_storage", "supabase-library-manifest.json: expected Supabase to be the default source.");
  assert(manifest.source_policy?.images_2_0_usage === "slide_1_hook_only", "supabase-library-manifest.json: Images 2.0 must stay hook-only.");
  assert(manifest.source_policy?.item_level_tags_required === true, "supabase-library-manifest.json: expected item-level tags.");
  assert(Array.isArray(manifest.collections), "supabase-library-manifest.json: missing collections.");
  assert(Number.isInteger(manifest.total_items), "supabase-library-manifest.json: missing total_items.");

  let countedItems = 0;
  for (const collection of manifest.collections) {
    assert(collection.collection_id, "supabase-library-manifest.json: collection missing id.");
    assert(Array.isArray(collection.items), `${collection.collection_id}: missing items.`);
    countedItems += collection.items.length;
    for (const item of collection.items) {
      assert(item.id, `${collection.collection_id}: item missing id.`);
      assert(item.bucket_id, `${item.id}: missing bucket_id.`);
      assert(item.object_path, `${item.id}: missing object_path.`);
      assert(item.local_fallback_path, `${item.id}: missing local_fallback_path.`);
      assert(item.source_kind === "supabase_visual_library", `${item.id}: invalid source_kind.`);
      assert(item.source_rights === "needs_review" || item.source_rights === "approved" || item.source_rights === "owned" || item.source_rights === "licensed", `${item.id}: invalid source_rights.`);
      assert(Array.isArray(item.mood_tags) && item.mood_tags.length > 0, `${item.id}: missing mood_tags.`);
      assert(Array.isArray(item.subject_tags) && item.subject_tags.length > 0, `${item.id}: missing subject_tags.`);
      assert(Array.isArray(item.color_tags) && item.color_tags.length > 0, `${item.id}: missing color_tags.`);
      assert(Array.isArray(item.aesthetic_tags) && item.aesthetic_tags.length > 0, `${item.id}: missing aesthetic_tags.`);
      assert(Array.isArray(item.best_for_slide_roles) && item.best_for_slide_roles.length > 0, `${item.id}: missing best_for_slide_roles.`);
      assert(Array.isArray(item.best_for_platforms) && item.best_for_platforms.length > 0, `${item.id}: missing best_for_platforms.`);
      if (item.source_rights === "needs_review") {
        assert(Array.isArray(item.source_review_tags) && item.source_review_tags.includes("needs_rights_review"), `${item.id}: missing source_review_tags rights marker.`);
      }
      if (item.source_rights === "owned") {
        assert(Array.isArray(item.source_review_tags) && item.source_review_tags.includes("owned_generated_asset"), `${item.id}: missing owned generated source marker.`);
      }
    }
  }

  assert(countedItems === manifest.total_items, "supabase-library-manifest.json: total_items mismatch.");

  return {
    collections: manifest.collections.length,
    total_items: manifest.total_items,
    public_urls_ready: Boolean(manifest.supabase?.url_set)
  };
}

function validateRenderManifestShape(manifest, label) {
  assert(Array.isArray(manifest.slides) && manifest.slides.length > 0, `${label}: missing slides.`);
  const assetSources = new Map();
  const images20SlideNumbers = [];

  for (const slide of manifest.slides) {
    assert(slide.input_image, `${label}: slide missing input_image.`);
    assert(slide.text, `${label}: slide missing text.`);
    assert(ALLOWED_TEXT_POSITIONS.has(slide.text_position), `${label}: invalid text_position.`);
    if (slide.asset_source) {
      assert(ALLOWED_ASSET_SOURCES.has(slide.asset_source), `${label}: invalid asset_source ${slide.asset_source}.`);
      assetSources.set(slide.slide_number, slide.asset_source);
      if (slide.asset_source === "images_2_0") {
        images20SlideNumbers.push(slide.slide_number);
      }
    }
    if (slide.visual_collection) {
      assert(typeof slide.visual_collection === "string", `${label}: visual_collection must be a string.`);
    }
  }

  assert(
    images20SlideNumbers.length <= 1,
    `${label}: Images 2.0 is limited to one hook image per slideshow; found slides ${images20SlideNumbers.join(", ")}.`
  );
  if (images20SlideNumbers.length === 1) {
    assert(
      images20SlideNumbers[0] === 1,
      `${label}: Images 2.0 may only be used on slide 1 hook; found slide ${images20SlideNumbers[0]}.`
    );
  }

  const usesHybridHookModel = typeof manifest.hybrid_cost_model === "string"
    && manifest.hybrid_cost_model.startsWith("one_ai_hook_")
    && manifest.slides.length >= 5;

  if (usesHybridHookModel) {
    const finalSlideNumber = Math.max(...manifest.slides.map((slide) => slide.slide_number));
    assert(assetSources.get(1) === "images_2_0", `${label}: hybrid model requires slide 1 asset_source images_2_0.`);
    for (let slideNumber = 2; slideNumber < finalSlideNumber; slideNumber += 1) {
      assert(
        ["supabase_library", "pinterest_library"].includes(assetSources.get(slideNumber)),
        `${label}: hybrid model requires slide ${slideNumber} asset_source supabase_library or pinterest_library.`
      );
    }
    assert(
      ["supabase_library", "supabase_template", "pinterest_library", "pinterest_template"].includes(assetSources.get(finalSlideNumber)),
      `${label}: hybrid model requires final slide ${finalSlideNumber} asset_source supabase_library, supabase_template, pinterest_library, or pinterest_template.`
    );
  }
}

async function validatePackRenderManifests() {
  const entries = await fs.readdir(SLIDESHOW_CONTENT_DIR, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === "visual-library") continue;
    const manifestPath = path.join(SLIDESHOW_CONTENT_DIR, entry.name, "render-manifest.json");
    try {
      const manifest = await readJson(manifestPath);
      validateRenderManifestShape(manifest, `${entry.name}/render-manifest.json`);
      count += 1;
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
  }

  return count;
}

const schemaCount = await validateSchemas();
const formatCatalog = await validateFormatCatalog();
await validatePackageJson();
const visualCounts = await validateVisualLibrary();
const renderTemplateSlides = await validateRenderTemplate();
const requiredTemplateCount = await validateRequiredTemplates();
const activeNiches = await validateActiveNiches();
const pinterestSourceManifest = await validatePinterestSourceManifest();
const ownedSourceManifest = await validateOwnedSourceManifest();
const supabaseLibraryManifest = await validateSupabaseLibraryManifest();
const usageLogCount = await validateUsageLog();
const rawProblemBank = await validateRawProblemBank();
const formatCaptureManifest = await validateFormatCaptureManifest();
const tiktokHookPatternBankReady = await validateTikTokHookPatternBank();
const tiktokProvenTextBank = await validateTikTokProvenTextBank();
const packRenderManifestCount = await validatePackRenderManifests();

console.log(JSON.stringify({
  ok: true,
  schema_count: schemaCount,
  format_catalog: formatCatalog,
  visual_library: visualCounts,
  render_template_slides: renderTemplateSlides,
  required_template_count: requiredTemplateCount,
  active_niches: activeNiches,
  pinterest_source_manifest: pinterestSourceManifest,
  owned_source_manifest: ownedSourceManifest,
  supabase_library_manifest: supabaseLibraryManifest,
  usage_log_count: usageLogCount,
  raw_problem_bank: rawProblemBank,
  format_capture_manifest: formatCaptureManifest,
  tiktok_hook_pattern_bank_ready: tiktokHookPatternBankReady,
  tiktok_proven_text_bank: tiktokProvenTextBank,
  pack_render_manifest_count: packRenderManifestCount
}, null, 2));
