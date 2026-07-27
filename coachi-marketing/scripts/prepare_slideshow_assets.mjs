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
Use --allow-needs-review only for local tests or draft packs.
Use --include-selected-usage for batch runs where already-selected draft assets must rotate too.`);
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

function usageContributesToRotation(use, { includeSelected = false } = {}) {
  const stage = use?.stage || use?.event_type || "legacy";
  if (includeSelected && ["selected", "rendered", "materialized", "dry_run_selected"].includes(stage)) {
    return true;
  }
  return stage === "posted" || stage === "published" || stage === "legacy";
}

function buildUsageIndex(usageLog, options = {}) {
  const index = new Map();
  const seen = new Set();
  const rotationUses = (usageLog?.uses || []).filter((use) => usageContributesToRotation(use, options));
  const sortedUses = [...rotationUses].sort((left, right) => String(right.used_at || "").localeCompare(String(left.used_at || "")));
  const recentSlideshows = [];
  for (const use of sortedUses) {
    if (use.slideshow_id && !recentSlideshows.includes(use.slideshow_id)) {
      recentSlideshows.push(use.slideshow_id);
    }
  }

  for (const use of rotationUses) {
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

function rotationLimit(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function assetWithinRotationPolicy(candidate, usageIndex, rotationPolicy = {}) {
  const usage = usageIndex.get(candidate.id);
  if (!usage) return true;
  const maxUses = rotationLimit(rotationPolicy.max_uses_per_asset_per_30_days, 2);
  const maxRecentWindow = rotationLimit(rotationPolicy.max_reuse_in_last_posts, 10);
  const totalUses = usage.total_uses || 0;
  const recentUseRank = usage.recent_use_rank;

  if (totalUses > maxUses) return false;
  if (recentUseRank != null && recentUseRank < maxRecentWindow) return false;
  return true;
}

function filterFreshProductionCandidates(candidates, usageIndex, rotationPolicy, { production, enforceFreshness }) {
  if (!production || !enforceFreshness) return candidates || [];
  return (candidates || []).filter((candidate) => assetWithinRotationPolicy(candidate, usageIndex, rotationPolicy));
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

function textHasAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function isMiddleLibrarySlideContext(requestedContext = {}) {
  const slideNumber = Number(requestedContext.slide_number);
  return Number.isFinite(slideNumber)
    && slideNumber >= 2
    && slideNumber <= 6;
}

function candidateFaceVisibilityPreferenceScore(candidate, requestedContext = {}) {
  if (!isMiddleLibrarySlideContext(requestedContext)) return 0;

  const text = [
    candidate?.id,
    candidate?.original_name,
    candidate?.prompt_translation,
    ...(candidate?.mood_tags || []),
    ...(candidate?.subject_tags || []),
    ...(candidate?.aesthetic_tags || []),
    ...(candidate?.selection_notes || []),
    ...(candidate?.source_review_tags || [])
  ].filter(Boolean).join(" ").toLowerCase();

  let score = 0;
  if (textHasAny(text, [
    /\bno[-_\s]?face\b/,
    /\bface[-_\s]?obscured\b/,
    /\bback[-_\s]?view\b/,
    /\bfrom[-_\s]?behind\b/,
    /\bdistant\b/,
    /\bwide\b/,
    /\benvironment(?:al)?\b/,
    /\blandscape\b/,
    /\broute[-_\s]?context\b/,
    /\bopen[-_\s]?path\b/,
    /\bnegative[-_\s]?space\b/,
    /\btrail\b/,
    /\bterrain\b/,
    /\bforest\b/,
    /\blake\b/,
    /\bshore(?:line)?\b/,
    /\bmountain\b/,
    /\bhill\b/,
    /\bgradient\b/,
    /\bwater[-_\s]?route\b/,
    /\boutdoor[-_\s]?route\b/,
    /\bpath\b/
  ])) {
    score += 18;
  }

  if (textHasAny(text, [
    /\brunner[-_\s]?detail\b/,
    /\bportrait\b/,
    /\bselfie\b/,
    /\bface[-_\s]?only\b/,
    /\bclose[-_\s]?up\b/,
    /\bcloseup\b/,
    /\bvisible[-_\s]?face\b/,
    /\bfacial\b/,
    /\bsprint[-_\s]?face\b/,
    /\binfluencer\b/,
    /\bmodel\b/
  ])) {
    score -= 18;
  }

  if (requestedContext.visual_collection === "details_emotion") {
    score += textHasAny(text, [
      /\bbody[-_\s]?language\b/,
      /\bhands?\b/,
      /\bshoes?\b/,
      /\blegs?\b/,
      /\bcropped\b/,
      /\bsilhouette\b/
    ]) ? 10 : -8;
  }

  return Math.max(-28, Math.min(24, score));
}

function canonicalWorld(value) {
  const text = normalized(value);
  if (!text) return null;
  if (/\blake\b|\bwater\b|\briverside\b|\bcoastal\b/.test(text)) return "lake";
  if (/\bmountain\b|\bhill\b|\bhills\b|\buphill\b|\bclimb\b|\bridge\b/.test(text)) return "mountain";
  if (/\bforest\b|\btrail\b|\bwoods?\b|\btrees?\b/.test(text)) return "forest";
  return null;
}

function candidateWorldHints(candidate) {
  const hints = new Set();
  const values = [
    candidate?.id,
    candidate?.source_kind,
    candidate?.visual_world,
    ...(candidate?.visual_world_tags || []),
    ...(candidate?.route_tags || []),
    ...(candidate?.subject_tags || []),
    ...(candidate?.aesthetic_tags || []),
    ...(candidate?.lighting_tags || [])
  ];
  for (const value of values) {
    const world = canonicalWorld(value);
    if (world) hints.add(world);
  }
  return hints;
}

function filterCandidatesForRequestedWorld(candidates, requestedWorld, { preferSpecific = false } = {}) {
  const world = canonicalWorld(requestedWorld);
  if (!world) return candidates || [];

  const compatible = (candidates || []).filter((candidate) => {
    const hints = candidateWorldHints(candidate);
    return hints.size === 0 || hints.has(world);
  });
  if (preferSpecific) {
    const specific = compatible.filter((candidate) => candidateWorldHints(candidate).has(world));
    if (specific.length > 0) return specific;
  }
  return compatible;
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
  if (
    requestedContext.visual_collection === "details_emotion"
    && ["setup", "value", "insight", "insight_1", "insight_2", "insight_3", "coachi_connection"].includes(requestedContext.role)
    && (tagsContain(roleTags, "runner_detail") || tagsContain(roleTags, "body_language") || tagsContain(roleTags, "breathing"))
  ) {
    score += 8;
  }
  if (candidate.negative_space_zone || candidate.safe_text_zone) score += 7;
  if ((candidate.mood_tags || []).length > 0) score += 5;
  score += candidateFaceVisibilityPreferenceScore(candidate, requestedContext);

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

function sourceKindValues(candidate) {
  return [
    candidate?.source_kind,
    candidate?.original_source_kind,
    candidate?.selected_asset_source_kind,
    candidate?.selected_asset_original_source_kind
  ].filter(Boolean).map((value) => String(value));
}

function isOwnedGeneratedVisualCandidate(candidate) {
  return sourceKindValues(candidate).some((value) => value === "owned_generated_visual_library");
}

function isProductionMiddleSlide(slide, finalSlideNumber) {
  return slide.asset_source !== "images_2_0"
    && slide.slide_number >= 2
    && slide.slide_number <= 6
    && !(slide.slide_number === finalSlideNumber && slide.role === "cta");
}

function filterOwnedGeneratedMiddleSlideCandidates(candidates, {
  allowOwnedGeneratedMiddleSlides,
  slide,
  finalSlideNumber
}) {
  if (allowOwnedGeneratedMiddleSlides) return candidates || [];
  if (!isProductionMiddleSlide(slide, finalSlideNumber)) return candidates || [];
  return (candidates || []).filter((candidate) => !isOwnedGeneratedVisualCandidate(candidate));
}

function isPinterestDerivedCandidate(candidate) {
  const sourceText = [
    candidate?.original_source_kind,
    candidate?.source_kind,
    candidate?.source_pull_id,
    candidate?.source_candidate_id,
    candidate?.local_fallback_path,
    ...(candidate?.workflow_tags || [])
  ].filter(Boolean).join(" ");
  return /pinterest/i.test(sourceText);
}

function filterMarathonPinterestOnlyCandidates(candidates, { requestedContext, slide }) {
  if (requestedContext?.account_profile !== "marathon") return candidates || [];
  if (slide.asset_source === "images_2_0") return candidates || [];
  return (candidates || []).filter((candidate) => (
    (slide.coachi_app_cta === true && isCoachiAppCtaCandidate(candidate))
    ||
    candidate.source_rights === "approved"
    && isPinterestDerivedCandidate(candidate)
  ));
}

function marathonSupportCandidateText(candidate) {
  return [
    candidate?.source_query,
    candidate?.source_alt_text,
    candidate?.id,
    candidate?.original_name,
    ...(candidate?.workflow_tags || []),
    ...(candidate?.subject_tags || [])
  ].filter(Boolean).join(" ").toLowerCase();
}

function isExplicitlyEmptyMarathonSupportCandidate(candidate) {
  const text = marathonSupportCandidateText(candidate);
  const explicitlyEmpty = /\b(?:empty|no[\s_-]*(?:people|persons?|humans?|runners?))\b/.test(text);
  const withoutNoPeopleMarkers = text.replace(/\bno[\s_-]*(?:people|persons?|humans?|runners?)\b/g, "");
  const personBearing = /\b(?:runner|runners|man|men|male|boy|boys|guy|guys|woman|women|female|girl|girls|person|people|human|humans)\b/.test(withoutNoPeopleMarkers);
  return explicitlyEmpty && !personBearing;
}

function filterMarathonNoPeopleSupportCandidates(candidates, { requestedContext, slide }) {
  if (requestedContext?.account_profile !== "marathon") return candidates || [];
  if (slide.asset_source === "images_2_0") return candidates || [];
  return (candidates || []).filter((candidate) => (
    (slide.coachi_app_cta === true && isCoachiAppCtaCandidate(candidate))
    || isExplicitlyEmptyMarathonSupportCandidate(candidate)
  ));
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

function avoidAlreadySelectedWhenPossible(candidates, selectedAssetIds, fallbackCandidates = [], {
  allowFallback = true
} = {}) {
  const filtered = (candidates || []).filter((candidate) => !selectedAssetIds.has(candidate.id));
  if (filtered.length > 0) return filtered;
  if (!allowFallback) return [];
  const fallbackFiltered = (fallbackCandidates || []).filter((candidate) => !selectedAssetIds.has(candidate.id));
  if (fallbackFiltered.length > 0) return fallbackFiltered;
  return candidates;
}

function requestedContextForSlide(slide, manifest) {
  return {
    slide_number: slide.slide_number,
    role: slide.role,
    visual_collection: slide.visual_collection || null,
    visual_world: manifest.visual_world || null,
    route_tag: manifest.route_tag || null,
    lighting_family: manifest.lighting_family || null,
    workout_phase: manifest.workout_phase?.id || manifest.workout_phase || null,
    account_profile: manifest.account_profile || manifest.tiktok_account_profile?.key || null,
    hook_identity: manifest.hook_identity || null
  };
}

function candidatePayload(candidate, usageIndex, requestedContext = {}) {
  const quality = selectionQuality(candidate, usageIndex, requestedContext);
  return {
    id: candidate.id,
    source_kind: candidate.source_kind || "local_curated_library",
    original_source_kind: candidate.original_source_kind || candidate.source_kind || "local_curated_library",
    supabase_public_url: candidate.public_url || candidate.supabase_public_url || null,
    bucket_id: candidate.bucket_id || null,
    object_path: candidate.object_path || null,
    workflow_label: candidate.workflow_label || null,
    pull_label: candidate.pull_label || null,
    source_query: candidate.source_query || null,
    source_alt_text: candidate.source_alt_text || null,
    world_rotation_key: candidate.world_rotation_key || candidate.visual_world || null,
    asset_use_case: candidate.asset_use_case || null,
    workflow_tags: candidate.workflow_tags || [],
    source_pull_id: candidate.source_pull_id || null,
    source_candidate_id: candidate.source_candidate_id || null,
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
      face_visibility_preference: isMiddleLibrarySlideContext(requestedContext)
        ? "prefer environment, distant runner, back/side angle, cropped body, or no clear face"
        : "hook/cta rules apply",
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
    face_visibility_rule: isMiddleLibrarySlideContext(requestedContext)
      ? "For slides 2-6, prefer environments, route context, distant runners, back/side angles, silhouettes, or cropped body-language details. Avoid clear face/portrait/selfie assets so the viewer does not read the image as a different Coachi character."
      : null,
    prompt_translation: collection?.prompt_translation || null,
    production_asset_policy: production
      ? "approved, owned, or licensed assets only, and middle-slide visuals must pass usage freshness rotation"
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
    const hookIdentity = requestedContext.hook_identity || {};
    const identityPrompt = hookIdentity.brand_anchor_prompt || hookIdentity.identity_prompt || identity?.prompt_anchor;
    return {
      action: "generate_with_images_2_0",
      candidate_assets: [],
      prompt_hint: [
        identityPrompt,
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
  const allowOwnedGeneratedMiddleSlides = flags.has("--allow-owned-generated-middle-slides");
  const includeSelectedUsage = flags.has("--include-selected-usage") || flags.has("--count-selected-usage");
  const collections = buildCollectionIndex(library);
  const localCandidatesByCollection = mergeCandidateIndexes(
    buildCandidateIndex(sourceManifest),
    buildCandidateIndex(ownedSourceManifest)
  );
  const allLocalCandidates = [...localCandidatesByCollection.values()].flat();
  const supabaseCandidatesByCollection = buildCandidateIndex(supabaseManifest);
  const usageIndex = buildUsageIndex(usageLog, { includeSelected: includeSelectedUsage });
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
    const crossCollectionPreferredCandidates = slide.coachi_app_cta === true
      ? preferredOwnedCandidates(allLocalCandidates, slide.preferred_asset_ids)
      : [];
    const localCollectionCandidates = [
      ...crossCollectionPreferredCandidates,
      ...(localCandidatesByCollection.get(slide.visual_collection) || [])
    ];
    const localFallbackCandidates = filterMarathonNoPeopleSupportCandidates(
      filterMarathonPinterestOnlyCandidates(
        filterOwnedGeneratedMiddleSlideCandidates(
          filterCandidatesByRights(
            localCollectionCandidates,
            { production, allowNeedsReview }
          ),
          { production, allowOwnedGeneratedMiddleSlides, slide, finalSlideNumber }
        ),
        { requestedContext, slide }
      ),
      { requestedContext, slide }
    );
    const supabaseCandidates = filterMarathonNoPeopleSupportCandidates(
      filterMarathonPinterestOnlyCandidates(
        filterOwnedGeneratedMiddleSlideCandidates(
          filterCandidatesByRights(
            supabaseCandidatesByCollection.get(slide.visual_collection) || [],
            { production, allowNeedsReview }
          ),
          { production, allowOwnedGeneratedMiddleSlides, slide, finalSlideNumber }
        ),
        { requestedContext, slide }
      ),
      { requestedContext, slide }
    );
    const shouldUseSupabase = preferSupabase && slide.asset_source !== "images_2_0";
    const preferWorldSpecificCta = slideAllowsCoachiAppCta(slide, finalSlideNumber);
    const worldCompatibleLocalCandidates = filterCandidatesForRequestedWorld(
      localFallbackCandidates,
      requestedContext.visual_world
    );
    const worldCompatibleSupabaseCandidates = filterCandidatesForRequestedWorld(
      supabaseCandidates,
      requestedContext.visual_world
    );
    const explicitOwnedCandidates = preferredOwnedCandidates(
      filterCandidatesForRequestedWorld(localFallbackCandidates, requestedContext.visual_world, {
        preferSpecific: preferWorldSpecificCta
      }),
      slide.preferred_asset_ids
    );
    const rawCandidates = shouldUseSupabase
      ? [...explicitOwnedCandidates, ...worldCompatibleSupabaseCandidates]
      : worldCompatibleLocalCandidates;
    const worldCompatibleRawCandidates = filterCandidatesForRequestedWorld(rawCandidates, requestedContext.visual_world, {
      preferSpecific: preferWorldSpecificCta
    });
    const isFinalCtaSlide = slide.slide_number === finalSlideNumber && slide.role === "cta";
    const rotationPolicy = collection?.rotation_policy || library.rotation_policy || {};
    const enforceFreshness = production
      && slide.asset_source !== "images_2_0"
      && !isFinalCtaSlide;
    const freshRawCandidates = filterFreshProductionCandidates(
      worldCompatibleRawCandidates,
      usageIndex,
      rotationPolicy,
      { production, enforceFreshness }
    );
    const freshLocalFallbackCandidates = filterFreshProductionCandidates(
      worldCompatibleLocalCandidates,
      usageIndex,
      rotationPolicy,
      { production, enforceFreshness }
    );
    const ctaFilteredRawCandidates = filterCtaCandidatesForSlide(slide, worldCompatibleRawCandidates, finalSlideNumber);
    const ctaFilteredLocalCandidates = filterCtaCandidatesForSlide(slide, worldCompatibleLocalCandidates, finalSlideNumber);
    const freshCandidates = filterCtaCandidatesForSlide(slide, freshRawCandidates, finalSlideNumber);
    const freshFallbackCandidates = filterCtaCandidatesForSlide(slide, freshLocalFallbackCandidates, finalSlideNumber);
    const candidates = avoidAlreadySelectedWhenPossible(
      freshCandidates,
      selectedAssetIds,
      ctaFilteredRawCandidates,
      { allowFallback: !enforceFreshness }
    );
    const fallbackCandidates = avoidAlreadySelectedWhenPossible(
      freshFallbackCandidates,
      selectedAssetIds,
      ctaFilteredLocalCandidates,
      { allowFallback: !enforceFreshness }
    );
    if (production && slide.asset_source !== "images_2_0") {
      assert(
        candidates.length > 0 || fallbackCandidates.length > 0,
        enforceFreshness
          ? `No production-fresh assets for slide ${slide.slide_number} (${slide.visual_collection}). Add or approve fresh ${requestedContext.visual_world} visuals before rendering.`
          : `No production-approved assets for slide ${slide.slide_number} (${slide.visual_collection}). Review or approve assets first.`
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
    usage_rotation_scope: includeSelectedUsage
      ? "posted, published, legacy, selected, rendered, materialized, and dry-run-selected usage entries exhaust assets for this batch"
      : "posted, published, and legacy usage entries only; selected/rendered draft events do not exhaust assets",
    source_policy: library.source_rules,
    production_asset_policy: production
      ? "approved, owned, or licensed assets only, with middle-slide usage freshness enforced"
      : "draft mode can include needs_review assets",
    allow_needs_review: allowNeedsReview,
    allow_owned_generated_middle_slides: allowOwnedGeneratedMiddleSlides,
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
