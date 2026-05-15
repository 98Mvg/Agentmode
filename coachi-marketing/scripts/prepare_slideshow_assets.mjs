#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const VISUAL_LIBRARY_PATH = "content/slideshows/visual-library/visual-library.json";
const PINTEREST_SOURCE_MANIFEST_PATH = "content/slideshows/visual-library/pinterest-source-manifest.json";
const OWNED_SOURCE_MANIFEST_PATH = "content/slideshows/visual-library/owned-source-manifest.json";
const SUPABASE_LIBRARY_MANIFEST_PATH = "content/slideshows/visual-library/supabase-library-manifest.json";
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
  node scripts/prepare_slideshow_assets.mjs --manifest content/slideshows/YYYY-MM-DD-slug/render-manifest.json --out content/slideshows/YYYY-MM-DD-slug/asset-picklist.json

Creates a source picklist from the render manifest and visual-library metadata.
Supabase visual-library assets are preferred when content/slideshows/visual-library/supabase-library-manifest.json exists.
No images are downloaded or uploaded.

Use --production to require approved/owned/licensed non-hook assets.
Use --allow-needs-review only for local tests or draft packs.`);
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function readOptionalJson(filePath) {
  try {
    return await readJson(filePath);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function buildCollectionIndex(library) {
  return new Map(
    (library.pinterest_research_collections || []).map((collection) => [collection.id, collection])
  );
}

function buildCandidateIndex(sourceManifest) {
  const index = new Map();
  for (const collection of sourceManifest?.collections || []) {
    const current = index.get(collection.collection_id) || [];
    index.set(collection.collection_id, [...current, ...(collection.items || [])]);
  }
  return index;
}

function mergeCandidateIndexes(...indexes) {
  const merged = new Map();
  for (const index of indexes) {
    for (const [collectionId, items] of index.entries()) {
      const current = merged.get(collectionId) || [];
      merged.set(collectionId, [...current, ...items]);
    }
  }
  return merged;
}

function hasSupabaseUrl(candidate) {
  return Boolean(candidate?.public_url || candidate?.supabase_public_url);
}

function buildUsageIndex(usageLog) {
  const index = new Map();
  const seen = new Set();
  const sortedUses = [...(usageLog?.uses || [])].sort((left, right) => String(right.used_at || "").localeCompare(String(left.used_at || "")));
  const recentSlideshows = [];
  for (const use of sortedUses) {
    if (use.slideshow_id && !recentSlideshows.includes(use.slideshow_id)) {
      recentSlideshows.push(use.slideshow_id);
    }
  }

  for (const use of usageLog?.uses || []) {
    if (!use.asset_id) continue;
    const key = [
      use.slideshow_id || use.used_at || "unknown",
      use.slide_number || "",
      use.asset_id
    ].join("|");
    if (seen.has(key)) continue;
    seen.add(key);

    const current = index.get(use.asset_id) || {
      total_uses: 0,
      last_used_at: null,
      slideshow_ids: []
    };
    current.total_uses += 1;
    current.last_used_at = !current.last_used_at || new Date(use.used_at) > new Date(current.last_used_at)
      ? use.used_at
      : current.last_used_at;
    if (use.slideshow_id) current.slideshow_ids.push(use.slideshow_id);
    const recentRank = use.slideshow_id ? recentSlideshows.indexOf(use.slideshow_id) : -1;
    if (recentRank >= 0) {
      current.recent_use_rank = current.recent_use_rank == null
        ? recentRank
        : Math.min(current.recent_use_rank, recentRank);
    }
    index.set(use.asset_id, current);
  }
  return index;
}

function candidateQualityScore(candidate) {
  const explicitScore = Number(
    candidate?.quality_score
    ?? candidate?.visual_quality_score
    ?? candidate?.selection_quality_score
  );
  if (Number.isFinite(explicitScore)) return explicitScore;

  let score = 70;
  if (candidate?.source_rights === "owned") score += 12;
  if (candidate?.source_rights === "licensed") score += 9;
  if (candidate?.source_rights === "approved") score += 7;
  if (candidate?.supabase_public_url || candidate?.public_url) score += 4;
  if ((candidate?.mood_tags || []).length > 0) score += 2;
  if ((candidate?.subject_tags || []).length > 0) score += 2;
  if ((candidate?.aesthetic_tags || []).length > 0) score += 2;
  if (/watermark|brand|creator/i.test((candidate?.review_flags || []).join(" "))) score -= 20;
  return Math.max(0, Math.min(100, score));
}

function candidateFreshnessPenalty(candidate, usageIndex) {
  const usage = usageIndex.get(candidate.id);
  if (!usage) return 0;
  const totalPenalty = (usage.total_uses || 0) * 10;
  const recentPenalty = usage.recent_use_rank == null
    ? 0
    : Math.max(0, 30 - (usage.recent_use_rank * 3));
  return totalPenalty + recentPenalty;
}

function listify(value) {
  return Array.isArray(value) ? value : [];
}

function normalized(value) {
  return String(value || "").toLowerCase().replace(/[_-]+/g, " ").trim();
}

function tagsContain(tags, wanted) {
  const needle = normalized(wanted);
  if (!needle) return false;
  return listify(tags).some((tag) => {
    const haystack = normalized(tag);
    return haystack === needle || haystack.includes(needle) || needle.includes(haystack);
  });
}

function candidateVisualMatchScore(candidate, requestedContext = {}) {
  let score = 0;
  const visualWorldTags = [
    ...(candidate.visual_world_tags || []),
    ...(candidate.route_tags || []),
    ...(candidate.subject_tags || []),
    ...(candidate.aesthetic_tags || [])
  ];
  const lightingTags = [
    ...(candidate.lighting_tags || []),
    ...(candidate.color_tags || [])
  ];
  const workoutPhaseTags = [
    ...(candidate.workout_phase_tags || []),
    ...(candidate.phase_tags || [])
  ];
  const roleTags = [
    ...(candidate.best_for_slide_roles || []),
    ...(candidate.subject_tags || [])
  ];

  if (tagsContain(visualWorldTags, requestedContext.visual_world) || tagsContain(visualWorldTags, requestedContext.route_tag)) score += 25;
  if (tagsContain(lightingTags, requestedContext.lighting_family)) score += 15;
  if (tagsContain(workoutPhaseTags, requestedContext.workout_phase)) score += 10;
  if (tagsContain(roleTags, requestedContext.role)) score += 8;
  if (candidate.negative_space_zone || candidate.safe_text_zone) score += 7;
  if ((candidate.mood_tags || []).length > 0) score += 5;

  return Math.min(70, score);
}

function selectionQuality(candidate, usageIndex, requestedContext = {}) {
  const qualityScore = candidateQualityScore(candidate);
  const visualMatchScore = candidateVisualMatchScore(candidate, requestedContext);
  const freshnessPenalty = candidateFreshnessPenalty(candidate, usageIndex);
  return {
    quality_score: qualityScore,
    visual_match_score: visualMatchScore,
    freshness_penalty: freshnessPenalty,
    selection_score: qualityScore + visualMatchScore - freshnessPenalty,
    recent_use_rank: usageIndex.get(candidate.id)?.recent_use_rank ?? null
  };
}

function sourceRightsAllowed(candidate, { production, allowNeedsReview }) {
  const sourceRights = candidate?.source_rights || "needs_review";
  if (sourceRights === "approved" || sourceRights === "owned" || sourceRights === "licensed") {
    return true;
  }
  if (!production || allowNeedsReview) {
    return sourceRights === "needs_review";
  }
  return false;
}

function filterCandidatesByRights(candidates, options) {
  return (candidates || []).filter((candidate) => sourceRightsAllowed(candidate, options));
}

function isOwnedLocalCandidate(candidate) {
  const sourceKind = candidate?.source_kind || "";
  return candidate?.source_rights === "owned" || /owned|coachi/i.test(sourceKind);
}

function sortCandidatesForRotation(candidates, usageIndex, requestedContext = {}) {
  const rightsPriority = {
    owned: 0,
    licensed: 1,
    approved: 2,
    needs_review: 3
  };

  return [...candidates].sort((left, right) => {
    const leftRights = rightsPriority[left.source_rights || "needs_review"] ?? 9;
    const rightRights = rightsPriority[right.source_rights || "needs_review"] ?? 9;
    if (leftRights !== rightRights) return leftRights - rightRights;
    const leftSelection = selectionQuality(left, usageIndex, requestedContext);
    const rightSelection = selectionQuality(right, usageIndex, requestedContext);
    if (rightSelection.selection_score !== leftSelection.selection_score) {
      return rightSelection.selection_score - leftSelection.selection_score;
    }
    const leftUsage = usageIndex.get(left.id)?.total_uses || 0;
    const rightUsage = usageIndex.get(right.id)?.total_uses || 0;
    if (leftUsage !== rightUsage) return leftUsage - rightUsage;
    if (hasSupabaseUrl(left) !== hasSupabaseUrl(right)) return hasSupabaseUrl(left) ? -1 : 1;
    return left.id.localeCompare(right.id);
  });
}

function sortCandidatesByPreferredIds(candidates, preferredAssetIds, usageIndex) {
  if (!Array.isArray(preferredAssetIds) || preferredAssetIds.length === 0) return null;
  const byId = new Map((candidates || []).map((candidate) => [candidate.id, candidate]));
  return preferredAssetIds
    .map((assetId, index) => ({ candidate: byId.get(assetId), index }))
    .filter((entry) => entry.candidate)
    .sort((left, right) => {
      const leftUsage = usageIndex.get(left.candidate.id)?.total_uses || 0;
      const rightUsage = usageIndex.get(right.candidate.id)?.total_uses || 0;
      if (leftUsage !== rightUsage) return leftUsage - rightUsage;
      return left.index - right.index;
    })
    .map((entry) => entry.candidate);
}

function preferredOwnedCandidates(candidates, preferredAssetIds) {
  if (!Array.isArray(preferredAssetIds) || preferredAssetIds.length === 0) return [];
  const preferred = new Set(preferredAssetIds);
  return (candidates || []).filter((candidate) => preferred.has(candidate.id) && isOwnedLocalCandidate(candidate));
}

function isCoachiAppCtaCandidate(candidate) {
  const id = String(candidate?.id || "");
  const sourceKind = String(candidate?.source_kind || "");
  const subjectTags = candidate?.subject_tags || [];
  const bestRoles = candidate?.best_for_slide_roles || [];
  return id.startsWith("coachi_cta_")
    || /coachi.*cta|coachi.*app_ui|app_proof/i.test(sourceKind)
    || subjectTags.includes("app_proof")
    || bestRoles.includes("app_proof");
}

function hasPreferredCoachiAppCta(slide) {
  return (slide?.preferred_asset_ids || []).some((assetId) => String(assetId).startsWith("coachi_cta_"));
}

function isCtaVisualCandidate(candidate) {
  const id = String(candidate?.id || "");
  const sourceKind = String(candidate?.source_kind || "");
  const subjectTags = candidate?.subject_tags || [];
  const bestRoles = candidate?.best_for_slide_roles || [];
  return isCoachiAppCtaCandidate(candidate)
    || /^cta_ending_/i.test(id)
    || /cta|app_proof/i.test(sourceKind)
    || subjectTags.includes("cta")
    || subjectTags.includes("app_proof")
    || bestRoles.includes("cta")
    || bestRoles.includes("app_proof");
}

function slideAllowsCoachiAppCta(slide, finalSlideNumber) {
  return slide.slide_number === finalSlideNumber
    && slide.role === "cta"
    && slide.coachi_app_cta === true
    && hasPreferredCoachiAppCta(slide)
    && /\bcoachi\b/i.test(String(slide.text || ""));
}

function filterCtaCandidatesForSlide(slide, candidates, finalSlideNumber) {
  const isFinalCtaSlide = slide.slide_number === finalSlideNumber && slide.role === "cta";
  const allowCoachiAppCta = slideAllowsCoachiAppCta(slide, finalSlideNumber);

  return (candidates || []).filter((candidate) => {
    if (isCoachiAppCtaCandidate(candidate)) return allowCoachiAppCta;
    if (isCtaVisualCandidate(candidate)) return isFinalCtaSlide;
    return true;
  });
}

function avoidAlreadySelectedWhenPossible(candidates, selectedAssetIds) {
  const filtered = (candidates || []).filter((candidate) => !selectedAssetIds.has(candidate.id));
  return filtered.length > 0 ? filtered : candidates;
}

function requestedContextForSlide(slide, manifest) {
  return {
    slide_number: slide.slide_number,
    role: slide.role,
    visual_collection: slide.visual_collection || null,
    visual_world: manifest.visual_world || null,
    route_tag: manifest.route_tag || null,
    lighting_family: manifest.lighting_family || null,
    workout_phase: manifest.workout_phase?.id || manifest.workout_phase || null
  };
}

function candidatePayload(candidate, usageIndex, requestedContext = {}) {
  const quality = selectionQuality(candidate, usageIndex, requestedContext);
  return {
    id: candidate.id,
    source_kind: candidate.source_kind || "local_curated_library",
    supabase_public_url: candidate.public_url || candidate.supabase_public_url || null,
    bucket_id: candidate.bucket_id || null,
    object_path: candidate.object_path || null,
    local_path: candidate.local_path || null,
    local_fallback_path: candidate.local_fallback_path || candidate.local_path || null,
    original_name: candidate.original_name || null,
    status: candidate.status,
    source_rights: candidate.source_rights,
    mood_tags: candidate.mood_tags || [],
    subject_tags: candidate.subject_tags || [],
    color_tags: candidate.color_tags || [],
    aesthetic_tags: candidate.aesthetic_tags || [],
    best_for_slide_roles: candidate.best_for_slide_roles || [],
    best_for_platforms: candidate.best_for_platforms || [],
    cta_device_family: candidate.cta_device_family || null,
    workout_duration_display: candidate.workout_duration_display || null,
    usage: usageIndex.get(candidate.id) || {
      total_uses: 0,
      last_used_at: null,
      slideshow_ids: []
    },
    selection_quality: quality,
    visual_fit_metadata: {
      visual_world_tags: candidate.visual_world_tags || candidate.route_tags || [],
      lighting_tags: candidate.lighting_tags || [],
      workout_phase_tags: candidate.workout_phase_tags || candidate.phase_tags || [],
      negative_space_zone: candidate.negative_space_zone || candidate.safe_text_zone || null,
      requested_context: requestedContext
    }
  };
}

function libraryInstruction({ slide, collection, library, candidates, usageIndex, sourceKind, production, allowNeedsReview, requestedContext }) {
  const preferredCandidates = sortCandidatesByPreferredIds(candidates, slide.preferred_asset_ids, usageIndex);
  const sortedCandidates = preferredCandidates?.length
    ? preferredCandidates
    : sortCandidatesForRotation(candidates, usageIndex, requestedContext);
  const isSupabase = sourceKind === "supabase";
  const isMixed = sourceKind === "mixed";

  return {
    action: isMixed
      ? "select_from_owned_or_supabase_library"
      : isSupabase
        ? "select_from_supabase_library"
        : "select_from_curated_library",
    board: collection?.label || slide.visual_collection,
    rotation_policy: library.rotation_policy || null,
    preferred_asset_ids: Array.isArray(slide.preferred_asset_ids) ? slide.preferred_asset_ids : [],
    collection_tags: {
      mood_tags: collection?.mood_tags || [],
      subject_tags: collection?.subject_tags || [],
      color_tags: collection?.color_tags || []
    },
    candidate_assets: sortedCandidates.slice(0, 8).map((candidate) => candidatePayload(candidate, usageIndex, requestedContext)),
    selection_notes: collection?.selection_notes || [],
    prompt_translation: collection?.prompt_translation || null,
    production_asset_policy: production
      ? "approved, owned, or licensed assets only"
      : "draft mode can include needs_review assets",
    allow_needs_review: allowNeedsReview,
    legal_check: [
      "no recognizable public figure",
      "no watermark",
      "owned, licensed, or approved for reuse",
      "crop/color-grade before final use"
    ],
    render_rule: isMixed
      ? "prefer owned Coachi local assets when they fit the slide; otherwise use Supabase public_url when available"
      : isSupabase
      ? "use Supabase public_url when available; local_fallback_path is only for dry-run or offline render"
      : "local library fallback only; prefer Supabase once uploaded"
  };
}

function sourceInstruction({ slide, collection, library, candidates, localFallbackCandidates, usageIndex, sourceKind, production, allowNeedsReview, requestedContext }) {
  if (slide.asset_source === "images_2_0") {
    const identity = (library.identities || []).find((item) => item.id === library.default_identity);
    return {
      action: "generate_with_images_2_0",
      candidate_assets: [],
      prompt_hint: [
        identity?.prompt_anchor,
        collection?.prompt_translation,
        "photorealistic vertical 9:16, no text, no logos, no app UI, clean negative space for overlay text"
      ].filter(Boolean).join(". ")
    };
  }

  if (["supabase_library", "supabase_template", "pinterest_library", "pinterest_template"].includes(slide.asset_source)) {
    if (candidates.length > 0) {
      return libraryInstruction({ slide, collection, library, candidates, usageIndex, sourceKind, production, allowNeedsReview, requestedContext });
    }
    return libraryInstruction({
      slide,
      collection,
      library,
      candidates: localFallbackCandidates,
      usageIndex,
      sourceKind: "local",
      production,
      allowNeedsReview,
      requestedContext
    });
  }

  return {
    action: "manual_source_review",
    notes: ["Confirm source rights and visual fit before rendering."]
  };
}

async function main() {
  const { args, flags } = parseArgs(process.argv.slice(2));
  if (flags.has("--help") || flags.has("-h")) {
    printHelp();
    return;
  }

  const manifestPath = args.get("--manifest");
  if (!manifestPath) {
    printHelp();
    process.exit(1);
  }

  const outPath = args.get("--out");
  const manifestAbsolute = path.resolve(manifestPath);
  const manifest = await readJson(manifestAbsolute);
  const library = await readJson(path.resolve(VISUAL_LIBRARY_PATH));
  const sourceManifest = await readOptionalJson(path.resolve(PINTEREST_SOURCE_MANIFEST_PATH));
  const ownedSourceManifest = await readOptionalJson(path.resolve(OWNED_SOURCE_MANIFEST_PATH));
  const supabaseManifest = await readOptionalJson(path.resolve(args.get("--supabase-library") || SUPABASE_LIBRARY_MANIFEST_PATH));
  const usageLog = await readOptionalJson(path.resolve(args.get("--usage-log") || DEFAULT_USAGE_LOG_PATH));
  const production = flags.has("--production");
  const allowNeedsReview = flags.has("--allow-needs-review");
  const collections = buildCollectionIndex(library);
  const localCandidatesByCollection = mergeCandidateIndexes(
    buildCandidateIndex(sourceManifest),
    buildCandidateIndex(ownedSourceManifest)
  );
  const supabaseCandidatesByCollection = buildCandidateIndex(supabaseManifest);
  const usageIndex = buildUsageIndex(usageLog);
  const preferSupabase = !flags.has("--local-library") && Boolean(supabaseManifest);

  assert(Array.isArray(manifest.slides) && manifest.slides.length > 0, "Manifest must include slides.");

  const selectedAssetIds = new Set();
  const finalSlideNumber = Math.max(...manifest.slides.map((slide) => slide.slide_number));
  const slides = manifest.slides.map((slide) => {
    const collection = slide.visual_collection ? collections.get(slide.visual_collection) : undefined;
    const requestedContext = requestedContextForSlide(slide, manifest);
    if (slide.visual_collection) {
      assert(collection, `Unknown visual_collection: ${slide.visual_collection}`);
    }
    const localFallbackCandidates = filterCandidatesByRights(
      localCandidatesByCollection.get(slide.visual_collection) || [],
      { production, allowNeedsReview }
    );
    const supabaseCandidates = filterCandidatesByRights(
      supabaseCandidatesByCollection.get(slide.visual_collection) || [],
      { production, allowNeedsReview }
    );
    const shouldUseSupabase = preferSupabase && slide.asset_source !== "images_2_0";
    const explicitOwnedCandidates = preferredOwnedCandidates(localFallbackCandidates, slide.preferred_asset_ids);
    const rawCandidates = shouldUseSupabase
      ? [...explicitOwnedCandidates, ...supabaseCandidates]
      : localFallbackCandidates;
    const candidates = avoidAlreadySelectedWhenPossible(
      filterCtaCandidatesForSlide(slide, rawCandidates, finalSlideNumber),
      selectedAssetIds
    );
    const fallbackCandidates = avoidAlreadySelectedWhenPossible(
      filterCtaCandidatesForSlide(slide, localFallbackCandidates, finalSlideNumber),
      selectedAssetIds
    );
    if (production && slide.asset_source !== "images_2_0") {
      assert(
        candidates.length > 0 || fallbackCandidates.length > 0,
        `No production-approved assets for slide ${slide.slide_number} (${slide.visual_collection}). Review or approve assets first.`
      );
    }

    const instruction = sourceInstruction({
      slide: {
        ...slide,
        asset_source: shouldUseSupabase && ["pinterest_library", "pinterest_template"].includes(slide.asset_source)
          ? slide.asset_source.replace("pinterest", "supabase")
          : slide.asset_source
      },
      collection,
      library,
      candidates,
      localFallbackCandidates: fallbackCandidates,
      usageIndex,
      sourceKind: shouldUseSupabase && explicitOwnedCandidates.length > 0
        ? "mixed"
        : shouldUseSupabase
          ? "supabase"
          : "local",
      production,
      allowNeedsReview,
      requestedContext
    });
    const selectedAssetId = instruction.candidate_assets?.[0]?.id;
    if (selectedAssetId) selectedAssetIds.add(selectedAssetId);

    return {
      slide_number: slide.slide_number,
      role: slide.role,
      text: slide.text,
      asset_source: shouldUseSupabase && ["pinterest_library", "pinterest_template"].includes(slide.asset_source)
        ? slide.asset_source.replace("pinterest", "supabase")
        : slide.asset_source || "manual",
      visual_collection: slide.visual_collection || null,
      coachi_app_cta: slide.coachi_app_cta === true,
      preferred_asset_ids: Array.isArray(slide.preferred_asset_ids) ? slide.preferred_asset_ids : [],
      expected_input_image: slide.input_image,
      output_file: slide.output_file,
      instruction
    };
  });

  const picklist = {
    generated_at: new Date().toISOString(),
    manifest: path.relative(process.cwd(), manifestAbsolute),
    hybrid_cost_model: manifest.hybrid_cost_model || null,
    estimated_generation_cost_usd: manifest.estimated_generation_cost_usd ?? null,
    default_library_source: preferSupabase ? "supabase_visual_library" : "local_curated_library",
    supabase_library_manifest: supabaseManifest ? (args.get("--supabase-library") || SUPABASE_LIBRARY_MANIFEST_PATH) : null,
    pinterest_source_manifest: sourceManifest ? PINTEREST_SOURCE_MANIFEST_PATH : null,
    owned_source_manifest: ownedSourceManifest ? OWNED_SOURCE_MANIFEST_PATH : null,
    usage_log: usageLog ? (args.get("--usage-log") || DEFAULT_USAGE_LOG_PATH) : null,
    source_policy: library.source_rules,
    production_asset_policy: production
      ? "approved, owned, or licensed assets only"
      : "draft mode can include needs_review assets",
    allow_needs_review: allowNeedsReview,
    slides
  };

  if (outPath) {
    await writeJson(path.resolve(outPath), picklist);
  } else {
    console.log(JSON.stringify(picklist, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
