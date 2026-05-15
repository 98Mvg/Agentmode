#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import {
  BANNED_HOOK_WORDS as HOOK_BANNED_WORDS,
  MAX_HOOK_WORDS,
  MAX_SLIDE_WORDS,
  MIN_HOOK_QUALITY_SCORE,
  aggressiveCta,
  coachiMentionCount,
  countWords,
  firstCoachiMentionSlide,
  hasRunnerLanguage,
  suggestHookFix,
  textSoundsLikeAd
} from "./slideshow_quality_rules.mjs";

await import("dotenv").then(({ config }) => {
  config();
  config({ path: ".env.local" });
}).catch(() => {});

const ALLOWED_TEXT_POSITIONS = new Set(["top", "center", "lower_middle"]);
const DEFAULT_POSTED_REGISTRY_PATH = "inputs/performance/posted-slideshows.json";
const RAW_PROBLEM_BANK_PATH = "inputs/research/raw-runner-problems.json";
const PRODUCTION_RIGHTS = new Set(["approved", "owned", "licensed"]);
const REJECTED_ABSTRACT_COPY = [
  /\bjudging one spike\b/i,
  /\bignoring heat\b/i,
  /\bignoring sleep and stress\b/i,
  /\bchasing pace anyway\b/i,
  /\bforgetting effort context\b/i
];

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
  node scripts/qa_slideshow_pack.mjs --pack content/slideshows/YYYY-MM-DD-slug

Validates one rendered slideshow pack:
- hybrid split: slide 1 Images 2.0 only, middle slides library, final slide CTA/library
- required spine: explicit emotion, generated avatar world, one visual world, final CTA
- text position not too low
- Images 2.0 hook prompt and theme brief exist
- production mode blocks missing hook provenance, needs_review assets, posted decks, and weak Top 5 delivery
- source and rendered images exist
- rendered dimensions are 1080x1920 when sharp is available
- captions and hashtags exist
- Postiz schedule remains dry-run unless explicitly configured elsewhere`);
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function readOptionalJson(filePath, fallback = null) {
  try {
    return await readJson(filePath);
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function readText(filePath) {
  return fs.readFile(filePath, "utf8");
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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function resolveFrom(baseDir, value) {
  if (!value) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return path.isAbsolute(value) ? value : path.resolve(baseDir, value);
}

async function imageMetadata(filePath) {
  try {
    const { default: sharp } = await import("sharp");
    return sharp(filePath).metadata();
  } catch {
    return null;
  }
}

function validateHybridSplit(manifest, label) {
  const slides = manifest.slides || [];
  const images2Slides = slides.filter((slide) => slide.asset_source === "images_2_0");
  assert(images2Slides.length === 1, `${label}: expected exactly one Images 2.0 hook slide.`);
  assert(images2Slides[0].slide_number === 1, `${label}: Images 2.0 must be slide 1 only.`);

  const finalSlideNumber = Math.max(...slides.map((slide) => slide.slide_number));
  const finalSlide = slides.find((slide) => slide.slide_number === finalSlideNumber);
  assert(finalSlide?.role === "cta", `${label}: final slide must be the CTA slide.`);
  assert(manifest.emotion, `${label}: missing explicit emotion.`);
  assert(manifest.visual_world, `${label}: missing visual_world.`);
  assert(manifest.lighting_family, `${label}: missing lighting_family.`);
  assert(manifest.avatar_world_required === true, `${label}: avatar_world_required must be true.`);
  assert(manifest.cta_required === true, `${label}: cta_required must be true.`);
  for (const slide of slides) {
    if (slide.slide_number === 1) continue;
    const allowed = slide.slide_number === finalSlideNumber
      ? ["supabase_library", "supabase_template", "pinterest_library", "pinterest_template"]
      : ["supabase_library", "pinterest_library"];
    assert(
      allowed.includes(slide.asset_source),
      `${label}: slide ${slide.slide_number} has invalid asset_source ${slide.asset_source}.`
    );
  }
}

function wordCount(value) {
  return countWords(value);
}

function isListHook(hook) {
  return /^(top\s*\d+|\d+\s+(things|rules|mistakes|tips|weeks)|my top\s*\d+)/i.test(String(hook || "").trim());
}

async function validateHookQuality({ manifest, packDir, production }) {
  const hook = manifest.slides?.[0]?.text || "";
  const hookCandidatesPath = path.join(packDir, "source/hook-candidates.json");
  assert(!HOOK_BANNED_WORDS.test(hook), `Hook contains banned weak/generic wording: ${hook}`);
  assert(
    wordCount(hook) <= MAX_HOOK_WORDS || isListHook(hook),
    `Hook is too long for the source-of-truth quality gate: ${hook}`
  );

  if (!(await exists(hookCandidatesPath))) {
    assert(!production, "Production QA requires source/hook-candidates.json.");
    return {
      hook,
      candidate_file: null,
      status: "not_present_for_legacy_draft"
    };
  }

  const hookCandidates = await readJson(hookCandidatesPath);
  assert(hookCandidates.selected_hook === hook, "source/hook-candidates.json selected_hook must match slide 1.");
  assert(Array.isArray(hookCandidates.candidates), "source/hook-candidates.json missing candidates array.");
  assert(
    hookCandidates.candidates.length >= 8,
    `source/hook-candidates.json should preserve 8-10 hook candidates; found ${hookCandidates.candidates.length}.`
  );

  const selectedQuality = hookCandidates.selected_hook_quality || manifest.hook_quality;
  assert(selectedQuality?.score != null, "Selected hook quality score is missing.");
  assert(
    selectedQuality.score >= (selectedQuality.min_score || MIN_HOOK_QUALITY_SCORE),
    `Hook quality score ${selectedQuality.score} is below ${selectedQuality.min_score || MIN_HOOK_QUALITY_SCORE}.`
  );
  assert(selectedQuality.passes_quality_gate === true, "Selected hook did not pass the hook quality gate.");

  for (const candidate of hookCandidates.candidates) {
    assert(candidate.hook, "Hook candidate missing hook text.");
    assert(!HOOK_BANNED_WORDS.test(candidate.hook), `Hook candidate uses banned wording: ${candidate.hook}`);
    assert(candidate.score != null, `Hook candidate missing score: ${candidate.hook}`);
  }

  return {
    hook,
    candidate_file: path.relative(process.cwd(), hookCandidatesPath),
    selected_score: selectedQuality.score,
    candidates: hookCandidates.candidates.length
  };
}

async function validateCopy({ manifest, packDir, production }) {
  const hook = manifest.slides?.[0]?.text || "";
  assert(!HOOK_BANNED_WORDS.test(hook), `Hook contains banned data-like wording: ${hook}`);
  validateListHookDelivery(manifest);

  for (const slide of manifest.slides || []) {
    assert(slide.text && slide.text.trim().length > 0, `Slide ${slide.slide_number} missing text.`);
    assert(ALLOWED_TEXT_POSITIONS.has(slide.text_position), `Slide ${slide.slide_number} text_position is too low or invalid: ${slide.text_position}`);
    validateNoRejectedAbstractCopy(slide.text, `Slide ${slide.slide_number}`);
  }

  const sourceBacking = production
    ? await validateTopFiveSourceBacking(manifest)
    : null;

  const [tiktokCaption, instagramCaption, hashtags] = await Promise.all([
    readText(path.join(packDir, "copy/tiktok-caption.txt")),
    readText(path.join(packDir, "copy/instagram-caption.txt")),
    readText(path.join(packDir, "copy/hashtags.txt"))
  ]);

  validateNoRejectedAbstractCopy(tiktokCaption, "TikTok caption");
  validateNoRejectedAbstractCopy(instagramCaption, "Instagram caption");

  assert(tiktokCaption.trim().length >= 12, "TikTok caption is too short.");
  assert(instagramCaption.trim().length >= 12, "Instagram caption is too short.");
  const hashtagCount = hashtags.match(/#[\p{L}\p{N}_]+/gu)?.length || 0;
  assert(hashtagCount >= 4, "Expected at least 4 focused hashtags.");
  assert(hashtagCount <= 12, `Too many hashtags: ${hashtagCount}. Keep it focused.`);
  return {
    hashtag_count: hashtagCount,
    source_backing: sourceBacking
  };
}

async function validateCreativeRules({ manifest, packDir, production }) {
  const slides = manifest.slides || [];
  const hook = slides[0]?.text || "";
  const firstTwoSlides = slides.slice(0, 2).map((slide) => slide.text).join(" ");
  const mentionCount = coachiMentionCount(slides);
  const firstMention = firstCoachiMentionSlide(slides);
  const finalSlide = slides[slides.length - 1] || {};

  assert(
    hasRunnerLanguage(firstTwoSlides),
    "Creative QA failed: hook/problem does not contain clear runner language or pain."
  );
  assert(
    mentionCount <= 2,
    `Creative QA failed: Coachi is mentioned too often (${mentionCount} slides).`
  );
  assert(
    firstMention == null || firstMention >= 6,
    `Creative QA failed: Coachi is mentioned too early on slide ${firstMention}.`
  );
  assert(
    !aggressiveCta(finalSlide.text),
    `Creative QA failed: CTA is too aggressive: ${finalSlide.text}`
  );

  for (const slide of slides) {
    const maxWords = slide.slide_number === 1
      ? MAX_HOOK_WORDS
      : MAX_SLIDE_WORDS;
    assert(
      wordCount(slide.text) <= maxWords || (slide.slide_number === 1 && isListHook(slide.text)),
      `Creative QA failed: slide ${slide.slide_number} has too much text (${wordCount(slide.text)} words).`
    );
    assert(
      !textSoundsLikeAd(slide.text),
      `Creative QA failed: slide ${slide.slide_number} sounds like an ad: ${slide.text}`
    );
  }

  const usefulSlides = slides
    .filter((slide) => slide.slide_number >= 2 && slide.slide_number <= 5)
    .filter((slide) => wordCount(slide.text) >= 3);
  assert(usefulSlides.length >= 3, "Creative QA failed: slideshow does not provide enough useful runner insight before the CTA.");

  const canonicalPath = path.join(packDir, "source/slideshow.json");
  const canonical = await readOptionalJson(canonicalPath, null);
  if (!canonical) {
    assert(!production, "Production QA requires source/slideshow.json.");
    return {
      coachi_mentions: mentionCount,
      first_coachi_mention_slide: firstMention,
      canonical_slideshow: "not_present_for_legacy_draft"
    };
  }

  assert(canonical.selected_hook === hook, "source/slideshow.json selected_hook must match slide 1.");
  assert(canonical.format_id, "source/slideshow.json missing format_id.");
  assert(canonical.target_audience, "source/slideshow.json missing target_audience.");
  assert(canonical.visual_system?.emotion, "source/slideshow.json missing visual_system.emotion.");
  assert(canonical.visual_system?.visual_world, "source/slideshow.json missing visual_system.visual_world.");
  assert(canonical.visual_system?.lighting, "source/slideshow.json missing visual_system.lighting.");
  assert(Array.isArray(canonical.slides) && canonical.slides.length === slides.length, "source/slideshow.json slide count does not match render-manifest.json.");
  for (const slide of canonical.slides) {
    assert(slide.visual_direction, `source/slideshow.json slide ${slide.slide_number} missing visual_direction.`);
    assert(slide.image_query, `source/slideshow.json slide ${slide.slide_number} missing image_query.`);
    assert(["ai", "library", "branded_template"].includes(slide.image_source_preference), `source/slideshow.json slide ${slide.slide_number} has invalid image_source_preference.`);
  }

  return {
    coachi_mentions: mentionCount,
    first_coachi_mention_slide: firstMention,
    canonical_slideshow: path.relative(process.cwd(), canonicalPath),
    image_source_preferences: canonical.slides.map((slide) => `${slide.slide_number}:${slide.image_source_preference}`)
  };
}

function validateListHookDelivery(manifest) {
  const hook = manifest.slides?.[0]?.text || "";
  const isTopFive = /^(top\s*5|5\s+(mistakes|things))/i.test(hook.trim());
  if (!isTopFive) return;

  const slides = (manifest.slides || []).filter((slide) => slide.slide_number >= 2 && slide.slide_number <= 6);
  assert(slides.length >= 5, "Top 5 hook must deliver five point slides.");
  slides.slice(0, 5).forEach((slide, index) => {
    const expected = index + 1;
    assert(
      new RegExp(`^${expected}[\\.)]\\s+`).test(String(slide.text || "").trim()),
      `Top 5 hook slide ${slide.slide_number} must start with "${expected}." or "${expected})".`
    );
  });
}

function isTopFiveHook(manifest) {
  const hook = manifest.slides?.[0]?.text || "";
  return /^(top\s*5|5\s+(mistakes|things))/i.test(hook.trim());
}

function topFivePointTexts(manifest) {
  return (manifest.slides || [])
    .filter((slide) => slide.slide_number >= 2 && slide.slide_number <= 6)
    .slice(0, 5)
    .map((slide) => String(slide.text || ""));
}

function normalizePointText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/^[0-9]+[.)]\s*/, "")
    .replace(/[“”"']/g, "")
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function validateNoRejectedAbstractCopy(text, label) {
  for (const pattern of REJECTED_ABSTRACT_COPY) {
    assert(!pattern.test(String(text || "")), `${label} uses rejected abstract copy: ${pattern}`);
  }
}

function phaseConflictPatterns(phaseId) {
  if (phaseId === "pre_workout") {
    return [/post[- ]?workout/i, /post[- ]?run/i, /cool(?:ing)? down/i, /after intervals/i, /just finished/i, /finished the session/i];
  }
  if (phaseId === "during_workout") {
    return [/preparing before/i, /before starting/i, /post[- ]?workout/i, /cool(?:ing)? down/i, /just finished/i];
  }
  if (phaseId === "post_workout") {
    return [/preparing before/i, /before starting/i, /warmup movement/i, /moments before starting/i];
  }
  return [];
}

function validatePromptCoherence(hookBrief) {
  assert(hookBrief.prompt_compiler, "source/hook-brief.json missing prompt_compiler report.");
  assert(hookBrief.prompt_compiler.coherence_status === "passed", "Hook prompt compiler did not pass.");

  const phaseId = hookBrief.workout_phase?.id;
  const checkText = [
    hookBrief.first_image_prompt_adaptation,
    hookBrief.reddit_background_and_vibe?.background,
    hookBrief.reddit_background_and_vibe?.vibe,
    hookBrief.workout_phase?.moment,
    hookBrief.workout_phase?.prompt_cue,
    hookBrief.avatar_variation?.weather,
    hookBrief.avatar_variation?.lighting
  ].filter(Boolean).join("\n");
  const conflicts = phaseConflictPatterns(phaseId).filter((pattern) => pattern.test(checkText));
  assert(conflicts.length === 0, `Hook prompt has workout-phase conflicts for ${phaseId}: ${conflicts.map((pattern) => pattern.source).join(", ")}`);

  const lightingFamily = String(hookBrief.lighting_family || "").toLowerCase();
  const avatarLighting = String(hookBrief.avatar_variation?.lighting || "").toLowerCase();
  assert(
    !lightingFamily || avatarLighting.includes(lightingFamily) || lightingFamily.includes(avatarLighting),
    "Hook prompt lighting must match the selected deck lighting family."
  );

  return {
    phase: phaseId,
    coherence_status: hookBrief.prompt_compiler.coherence_status,
    selected_by: hookBrief.prompt_compiler.selected_by || null
  };
}

async function validateTopFiveSourceBacking(manifest) {
  if (!isTopFiveHook(manifest)) return null;

  const sourceProblemId = manifest.source_problem_id;
  assert(sourceProblemId, "Production Top 5 QA requires render-manifest.json source_problem_id.");

  const problemBank = await readJson(path.resolve(RAW_PROBLEM_BANK_PATH));
  const problem = (problemBank.problems || []).find((item) => item.id === sourceProblemId);
  assert(problem, `Production Top 5 QA could not find source problem ${sourceProblemId}.`);
  assert(
    Array.isArray(problem.sourced_mistakes) && problem.sourced_mistakes.length >= 5,
    `Production Top 5 QA requires at least 5 sourced_mistakes for ${sourceProblemId}.`
  );

  const allowedPoints = new Map(problem.sourced_mistakes.map((mistake) => [
    normalizePointText(mistake.text),
    mistake.source_url
  ]));
  const deckPoints = topFivePointTexts(manifest).map((point) => normalizePointText(point));
  const missing = deckPoints.filter((point) => !allowedPoints.has(point));
  assert(
    missing.length === 0,
    `Production Top 5 QA requires real sourced runner mistakes. Missing from source bank: ${missing.join(", ")}`
  );

  return {
    source_problem_id: sourceProblemId,
    sourced_points: deckPoints.length,
    source_urls: [...new Set(deckPoints.map((point) => allowedPoints.get(point)).filter(Boolean))]
  };
}

async function validateImages({ manifest, packDir, allowMissingHook }) {
  const baseDir = path.resolve(packDir, manifest.base_dir || ".");
  const outputDir = path.resolve(baseDir, manifest.output_dir || "slides/rendered");
  const checked = [];

  for (const slide of manifest.slides || []) {
    const inputPath = resolveFrom(baseDir, slide.input_image);
    const outputPath = resolveFrom(outputDir, slide.output_file);
    const isHook = slide.asset_source === "images_2_0";

    if (!(await exists(inputPath)) && !(allowMissingHook && isHook)) {
      throw new Error(`Slide ${slide.slide_number} missing source image: ${inputPath}`);
    }

    assert(await exists(outputPath), `Slide ${slide.slide_number} missing rendered image: ${outputPath}`);
    const metadata = await imageMetadata(outputPath);
    if (metadata) {
      assert(metadata.width === (manifest.width || 1080), `Slide ${slide.slide_number} width ${metadata.width} is not ${manifest.width || 1080}.`);
      assert(metadata.height === (manifest.height || 1920), `Slide ${slide.slide_number} height ${metadata.height} is not ${manifest.height || 1920}.`);
    }

    checked.push({
      slide_number: slide.slide_number,
      source_exists: await exists(inputPath),
      rendered: path.relative(process.cwd(), outputPath),
      width: metadata?.width || null,
      height: metadata?.height || null
    });
  }

  return checked;
}

async function validateSchedule(packDir) {
  const schedulePath = path.join(packDir, "postiz-schedule.json");
  if (!(await exists(schedulePath))) return null;
  const schedule = await readJson(schedulePath);
  if (schedule.dry_run !== true) {
    assert(schedule.safety?.requires_live_env_flag === "POSTIZ_ENABLE_LIVE_POSTING=1", "Live Postiz schedule missing live env safety gate.");
    assert(process.env.POSTIZ_ENABLE_LIVE_POSTING === "1", "Live Postiz schedule requires POSTIZ_ENABLE_LIVE_POSTING=1.");
  }
  assert(Array.isArray(schedule.posts) && schedule.posts.length > 0, "Postiz schedule missing posts.");
  return {
    posts: schedule.posts.length,
    dry_run: schedule.dry_run
  };
}

function suggestedFixesForFailure(message) {
  const fixes = [];
  if (/banned|generic|sounds like an ad/i.test(message)) {
    fixes.push("Rewrite the hook and slide text in real runner language; avoid corporate fitness wording.");
  }
  if (/too much text|too long/i.test(message)) {
    fixes.push("Shorten each slide to one idea and keep phone-readable text density.");
  }
  if (/Coachi is mentioned too early/i.test(message)) {
    fixes.push("Move the first Coachi mention to slide 6 and keep slides 1-5 educational.");
  }
  if (/Coachi is mentioned too often/i.test(message)) {
    fixes.push("Keep Coachi to one slide 6 product connection plus, at most, one soft CTA.");
  }
  if (/CTA is too aggressive/i.test(message)) {
    fixes.push("Replace hard CTA wording with save, follow, comment, or a soft Coachi trial line.");
  }
  if (/runner language|pain/i.test(message)) {
    fixes.push("Make the hook name a concrete runner pain like easy runs too hard, zone 2 too slow, or watch checking.");
  }
  if (/Images 2\.0|full-deck/i.test(message)) {
    fixes.push("Use Images 2.0 only for slide 1 and library/branded assets for the rest.");
  }
  if (/CTA\/app-proof|Coachi app CTA visual/i.test(message)) {
    fixes.push("Keep CTA/app-proof imagery on the final slide only, and use Coachi app CTA assets only when the final CTA explicitly mentions Coachi.");
  }
  if (/visual|world|lighting/i.test(message)) {
    fixes.push("Keep one visual world and one lighting family across all slides.");
  }
  if (fixes.length === 0) {
    fixes.push("Open the failed artifact, fix the named field, then rerun slideshow:qa.");
  }
  return [...new Set(fixes)];
}

function improvedVersionForFailure(message, manifest) {
  const hook = manifest?.slides?.[0]?.text || "";
  const problem = {
    problem_type: manifest?.problem_type || manifest?.source_problem_type || ""
  };
  const improvedHook = /hook|banned|generic|runner language|pain/i.test(message)
    ? suggestHookFix(hook, problem)
    : hook;
  return {
    selected_hook: improvedHook || hook,
    slides: (manifest?.slides || []).map((slide) => {
      if (slide.slide_number === 1 && improvedHook) {
        return { slide_number: slide.slide_number, role: slide.role, text: improvedHook };
      }
      if (slide.role === "cta" && aggressiveCta(slide.text)) {
        return { slide_number: slide.slide_number, role: slide.role, text: "Save this for your next easy run." };
      }
      return {
        slide_number: slide.slide_number,
        role: slide.role,
        text: slide.text
      };
    })
  };
}

async function updateCanonicalQaStatus(packDir, status, qaReportPath) {
  const slideshowPath = path.join(packDir, "source/slideshow.json");
  const slideshow = await readOptionalJson(slideshowPath, null);
  if (!slideshow) return null;
  slideshow.qa_status = status;
  slideshow.qa_report = path.relative(process.cwd(), qaReportPath);
  slideshow.qa_checked_at = new Date().toISOString();
  await writeJson(slideshowPath, slideshow);
  return path.relative(process.cwd(), slideshowPath);
}

async function validatePromptArtifacts({ manifest, packDir }) {
  const hook = manifest.slides?.[0]?.text || "";
  const hookTextPath = path.join(packDir, "source/hook.txt");
  const hookBriefPath = path.join(packDir, "source/hook-brief.json");
  const imagesPromptPath = path.join(packDir, "source/images-2-0-hook-prompt.md");

  assert(await exists(hookTextPath), "Missing source/hook.txt.");
  assert(await exists(hookBriefPath), "Missing source/hook-brief.json.");
  assert(await exists(imagesPromptPath), "Missing source/images-2-0-hook-prompt.md.");

  const hookText = (await readText(hookTextPath)).trim();
  const hookBrief = await readJson(hookBriefPath);
  const imagesPrompt = await readText(imagesPromptPath);

  assert(hookText === hook, `source/hook.txt does not match slide 1 hook: ${hookText}`);
  assert(hookBrief.hook === hook, "source/hook-brief.json hook does not match slide 1.");
  assert(hookBrief.source_problem, "source/hook-brief.json missing source_problem.");
  assert(hookBrief.theme, "source/hook-brief.json missing theme.");
  assert(hookBrief.emotion, "source/hook-brief.json missing emotion.");
  assert(hookBrief.visual_world, "source/hook-brief.json missing visual_world.");
  assert(hookBrief.lighting_family, "source/hook-brief.json missing lighting_family.");
  assert(hookBrief.cta, "source/hook-brief.json missing CTA.");
  assert(hookBrief.avatar_world_required === true, "source/hook-brief.json avatar_world_required must be true.");
  assert(hookBrief.cta_required === true, "source/hook-brief.json cta_required must be true.");
  assert(hookBrief.first_image_prompt_adaptation, "source/hook-brief.json missing first_image_prompt_adaptation.");
  assert(hookBrief.reddit_background_and_vibe?.background, "source/hook-brief.json missing reddit background/vibe.");
  assert(hookBrief.background_world_lock?.selected_visual_world === hookBrief.visual_world, "source/hook-brief.json background_world_lock must match visual_world.");
  assert(hookBrief.background_world_lock?.reference_background_policy, "source/hook-brief.json missing reference background policy.");
  assert(hookBrief.character_anchor?.identity_id, "source/hook-brief.json missing character_anchor.identity_id.");
  assert(hookBrief.character_anchor?.reference_image, "source/hook-brief.json missing character_anchor.reference_image.");
  assert(["pre_workout", "during_workout", "post_workout"].includes(hookBrief.workout_phase?.id), "source/hook-brief.json missing valid workout_phase.");
  assert(hookBrief.workout_phase?.prompt_cue, "source/hook-brief.json missing workout_phase.prompt_cue.");
  assert(hookBrief.avatar_variation?.watch, "source/hook-brief.json missing avatar_variation.watch.");
  assert(hookBrief.avatar_variation?.top, "source/hook-brief.json missing avatar_variation.top.");
  assert(hookBrief.avatar_variation?.shorts, "source/hook-brief.json missing avatar_variation.shorts.");
  assert(hookBrief.avatar_variation?.angle, "source/hook-brief.json missing avatar_variation.angle.");
  const promptCoherence = validatePromptCoherence(hookBrief);
  assert(imagesPrompt.includes("generate exactly ONE image"), "Images 2.0 prompt must explicitly require one image.");
  assert(imagesPrompt.includes(hook), "Images 2.0 prompt must include the hook.");
  assert(imagesPrompt.includes("Do not create an 8-slide deck"), "Images 2.0 prompt must block full-deck generation.");
  assert(imagesPrompt.includes("Reddit Source Context"), "Images 2.0 prompt must include Reddit/source context.");
  assert(imagesPrompt.includes("Workout Phase For This Image"), "Images 2.0 prompt must include workout phase instructions.");
  assert(imagesPrompt.includes("Avatar Variation For This Image"), "Images 2.0 prompt must include avatar variation instructions.");
  assert(imagesPrompt.includes("Required Slideshow Spine"), "Images 2.0 prompt must include the required slideshow spine.");
  assert(imagesPrompt.includes("Selected visual world"), "Images 2.0 prompt must include the selected visual world.");
  assert(imagesPrompt.includes("Background World Lock"), "Images 2.0 prompt must include the background world lock.");
  assert(/Reference image background is non-transferable/i.test(imagesPrompt), "Images 2.0 prompt must block reference-background leakage.");
  assert(/no visible watch/i.test(hookBrief.avatar_variation.watch), "source/hook-brief.json avatar variation must disable visible watches.");
  assert(/No visible watch|No watch should be visible/i.test(imagesPrompt), "Images 2.0 prompt must disable visible watches.");
  assert(/Do not include Apple Watch,\s*Garmin watch/i.test(imagesPrompt), "Images 2.0 prompt must block Apple Watch and Garmin watch while watches are disabled.");

  return {
    hook,
    theme: hookBrief.theme,
    prompt_coherence: promptCoherence,
    prompt: path.relative(process.cwd(), imagesPromptPath),
    hook_brief: path.relative(process.cwd(), hookBriefPath)
  };
}

function validateHookProvenanceData(provenance) {
  const generator = String(provenance.generator || provenance.source || "").toLowerCase();
  const allowedGenerators = new Set([
    "images_2_0",
    "chatgpt_images_2_0",
    "chatgpt images 2.0",
    "gpt_image_2_0"
  ]);
  assert(allowedGenerators.has(generator), "source/hook-provenance.json must prove the hook came from Images 2.0.");
  assert(provenance.created_at || provenance.generated_at, "source/hook-provenance.json missing created_at or generated_at.");
}

async function validateProductionHookProvenance(packDir) {
  const provenancePath = path.join(packDir, "source/hook-provenance.json");
  assert(await exists(provenancePath), "Production QA requires source/hook-provenance.json.");
  const provenance = await readJson(provenancePath);
  validateHookProvenanceData(provenance);
  return {
    path: path.relative(process.cwd(), provenancePath),
    generator: provenance.generator || provenance.source
  };
}

async function validateProductionAssets({ packDir, allowNeedsReview }) {
  const reportPath = path.join(packDir, "materialize-report.json");
  assert(await exists(reportPath), "Production QA requires materialize-report.json.");
  const report = await readJson(reportPath);
  const checked = [];

  for (const result of report.results || []) {
    if (!result.selected_asset_id) continue;
    const rights = result.selected_source_rights || "needs_review";
    if (!allowNeedsReview) {
      assert(
        PRODUCTION_RIGHTS.has(rights),
        `Production asset ${result.selected_asset_id} has source_rights=${rights}. Approve, own, or license it before publishing.`
      );
    }
    checked.push({
      slide_number: result.slide_number,
      asset_id: result.selected_asset_id,
      source_rights: rights,
      source_kind: result.selected_source_kind
    });
  }

  assert(checked.length > 0, "Production QA found no non-hook materialized assets.");
  return checked;
}

function isCoachiAppCtaAsset(asset) {
  const id = String(asset?.id || "");
  const sourceKind = String(asset?.source_kind || "");
  const subjectTags = asset?.subject_tags || [];
  const bestRoles = asset?.best_for_slide_roles || [];
  return id.startsWith("coachi_cta_")
    || /coachi.*cta|coachi.*app_ui|app_proof/i.test(sourceKind)
    || subjectTags.includes("app_proof")
    || bestRoles.includes("app_proof");
}

function isCtaVisualAsset(asset) {
  const id = String(asset?.id || "");
  const sourceKind = String(asset?.source_kind || "");
  const subjectTags = asset?.subject_tags || [];
  const bestRoles = asset?.best_for_slide_roles || [];
  return isCoachiAppCtaAsset(asset)
    || /^cta_ending_/i.test(id)
    || /cta|app_proof/i.test(sourceKind)
    || subjectTags.includes("cta")
    || subjectTags.includes("app_proof")
    || bestRoles.includes("cta")
    || bestRoles.includes("app_proof");
}

function slideAllowsCoachiAppCtaAsset(slide, finalSlideNumber) {
  return slide.slide_number === finalSlideNumber
    && slide.role === "cta"
    && slide.coachi_app_cta === true
    && (slide.preferred_asset_ids || []).some((assetId) => String(assetId).startsWith("coachi_cta_"))
    && /\bcoachi\b/i.test(String(slide.text || ""));
}

async function validateAssetPicklistQuality({ packDir, production }) {
  const picklistPath = path.join(packDir, "asset-picklist.json");
  if (!(await exists(picklistPath))) {
    assert(!production, "Production QA requires asset-picklist.json.");
    return null;
  }

  const picklist = await readJson(picklistPath);
  const checked = [];
  const topAssetSlides = new Map();
  const nonHookSlides = (picklist.slides || []).filter((slide) => slide.asset_source !== "images_2_0");
  const finalSlideNumber = Math.max(...(picklist.slides || []).map((slide) => slide.slide_number));
  for (const slide of picklist.slides || []) {
    if (slide.asset_source === "images_2_0") continue;
    const candidates = slide.instruction?.candidate_assets || [];
    const isFinalCtaSlide = slide.slide_number === finalSlideNumber && slide.role === "cta";
    const allowCoachiAppCta = slideAllowsCoachiAppCtaAsset(slide, finalSlideNumber);
    for (const candidate of candidates) {
      assert(
        isFinalCtaSlide || !isCtaVisualAsset(candidate),
        `Slide ${slide.slide_number} includes CTA/app-proof visual ${candidate.id}. CTA visuals must be final-slide-only.`
      );
      assert(
        !isCoachiAppCtaAsset(candidate) || allowCoachiAppCta,
        `Slide ${slide.slide_number} includes Coachi app CTA visual ${candidate.id} without a final Coachi CTA policy.`
      );
    }
    assert(candidates.length > 0, `Slide ${slide.slide_number} has no library candidates.`);
    const first = candidates[0];
    if (!first.selection_quality && !production) {
      checked.push({
        slide_number: slide.slide_number,
        asset_id: first.id,
        status: "legacy_candidate_without_selection_quality"
      });
      continue;
    }
    assert(first.selection_quality, `Slide ${slide.slide_number} top asset missing selection_quality metadata.`);
    assert(
      !topAssetSlides.has(first.id),
      `Slide ${slide.slide_number} repeats top visual asset ${first.id} already selected for slide ${topAssetSlides.get(first.id)}.`
    );
    topAssetSlides.set(first.id, slide.slide_number);
    assert(first.selection_quality.quality_score >= 70, `Slide ${slide.slide_number} top asset quality is too low: ${first.selection_quality.quality_score}.`);
    assert(first.selection_quality.visual_match_score != null, `Slide ${slide.slide_number} top asset missing visual_match_score.`);
    assert(first.visual_fit_metadata?.requested_context, `Slide ${slide.slide_number} top asset missing requested visual context.`);
    if (production) {
      assert(
        first.selection_quality.recent_use_rank !== 0,
        `Slide ${slide.slide_number} top asset was used in the immediately previous slideshow: ${first.id}.`
      );
      assert(
        first.visual_fit_metadata.requested_context.visual_world,
        `Slide ${slide.slide_number} production asset missing requested visual_world context.`
      );
    }
    checked.push({
      slide_number: slide.slide_number,
      asset_id: first.id,
      selection_score: first.selection_quality.selection_score,
      quality_score: first.selection_quality.quality_score,
      visual_match_score: first.selection_quality.visual_match_score,
      freshness_penalty: first.selection_quality.freshness_penalty
    });
  }

  return {
    path: path.relative(process.cwd(), picklistPath),
    non_hook_slides_checked: nonHookSlides.length,
    checked_assets: checked
  };
}

async function validateNotPosted({ packDir, registryPath }) {
  const registry = await readOptionalJson(path.resolve(registryPath), { posts: [] });
  const slideshowId = path.basename(packDir);
  const duplicate = (registry.posts || []).find((post) => post.slideshow_id === slideshowId);
  if (duplicate) {
    throw new Error(`Slideshow ${slideshowId} is already posted on ${duplicate.platform || "unknown platform"}.`);
  }
  return {
    registry: registryPath,
    slideshow_id: slideshowId,
    posted_before: false
  };
}

async function main() {
  const { args, flags } = parseArgs(process.argv.slice(2));
  if (flags.has("--help") || flags.has("-h")) {
    printHelp();
    return;
  }

  const pack = args.get("--pack");
  if (!pack) {
    printHelp();
    process.exit(1);
  }

  const packDir = path.resolve(pack);
  const production = flags.has("--production");
  const allowNeedsReview = flags.has("--allow-needs-review");
  const postedRegistryPath = args.get("--posted-registry") || DEFAULT_POSTED_REGISTRY_PATH;
  const manifestPath = path.join(packDir, "render-manifest.json");
  const manifest = await readJson(manifestPath);
  const qaReportPath = path.join(packDir, "source/qa-report.json");

  try {
    assert(Array.isArray(manifest.slides), "render-manifest.json missing slides.");
    assert(manifest.slides.length >= 5 && manifest.slides.length <= 8, `Unexpected slide count: ${manifest.slides.length}.`);

    validateHybridSplit(manifest, "render-manifest.json");
    const hook_quality = await validateHookQuality({ manifest, packDir, production });
    const copy = await validateCopy({ manifest, packDir, production });
    const creative_rules = await validateCreativeRules({ manifest, packDir, production });
    const prompt_artifacts = await validatePromptArtifacts({ manifest, packDir });
    const asset_quality = await validateAssetPicklistQuality({ packDir, production });
    const production_checks = production
      ? {
          hook_provenance: await validateProductionHookProvenance(packDir),
          assets: await validateProductionAssets({ packDir, allowNeedsReview }),
          posted_registry: await validateNotPosted({ packDir, registryPath: postedRegistryPath })
        }
      : null;
    const images = await validateImages({
      manifest,
      packDir,
      allowMissingHook: flags.has("--allow-missing-hook")
    });
    const schedule = await validateSchedule(packDir);

    const canonicalStatusPath = await updateCanonicalQaStatus(packDir, "passed", qaReportPath);
    const report = {
      ok: true,
      pass: true,
      generated_at: new Date().toISOString(),
      pack: path.relative(process.cwd(), packDir),
      slides: manifest.slides.length,
      hybrid_cost_model: manifest.hybrid_cost_model,
      production,
      allow_needs_review: allowNeedsReview,
      reasons: [],
      suggested_fixes: [],
      improved_version: null,
      canonical_slideshow: canonicalStatusPath,
      hook_quality,
      prompt_artifacts,
      asset_quality,
      production_checks,
      copy,
      creative_rules,
      images,
      schedule
    };
    await writeJson(qaReportPath, report);
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    const canonicalStatusPath = await updateCanonicalQaStatus(packDir, "failed", qaReportPath);
    const report = {
      ok: false,
      pass: false,
      generated_at: new Date().toISOString(),
      pack: path.relative(process.cwd(), packDir),
      production,
      reasons: [error.message],
      suggested_fixes: suggestedFixesForFailure(error.message),
      canonical_slideshow: canonicalStatusPath,
      improved_version: improvedVersionForFailure(error.message, manifest)
    };
    await writeJson(qaReportPath, report);
    throw error;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
