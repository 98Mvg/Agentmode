#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import {
  publicMediaPathsForRenderedSlides,
  renderedMediaPathsForManifest,
  storageSlugForPack
} from "./slideshow_public_media_manifest.mjs";

await import("dotenv").then(({ config }) => {
  config();
  config({ path: ".env.local" });
}).catch(() => {});

const ENGINE_DIR = "strategy/automation/tiktok-instagram-slideshow-content-engine";
const SCHEMA_DIR = `${ENGINE_DIR}/schemas`;
const DEFAULT_OUTPUT_ROOT = "content/slideshows";
const DEFAULT_TOPIC_OUT = "outputs/daily";
const DEFAULT_HOOK_REFERENCE_IMAGE = "content/ads/reference/organic-runner-face-v2-reference.png";
const DEFAULT_HOOK_STYLE_REFERENCE_IMAGE = "content/slideshows/2026-04-26-watch-stole-the-run-8-slide/slides/source/01-hook.png";
const DEFAULT_HASHTAGS = [
  "#running",
  "#runtok",
  "#beginnerrunner",
  "#runningtips",
  "#easyrun",
  "#runcoach",
  "#marathontraining",
  "#coachi"
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
  node scripts/run_slideshow_pipeline.mjs --date 2026-04-27 --mock-hook
  node scripts/run_slideshow_pipeline.mjs --date 2026-04-27 --candidate-index 1 --hook-image /abs/hook.png
  node scripts/run_slideshow_pipeline.mjs --date 2026-04-27 --production --hook-image /abs/hook.png --hook-provenance /abs/hook-provenance.json
  node scripts/run_slideshow_pipeline.mjs --date 2026-04-27 --generate-openai-hook --production
  node scripts/run_slideshow_pipeline.mjs --date 2026-04-27 --production --local-library --hook-image /abs/hook.png --hook-provenance /abs/hook-provenance.json
  node scripts/run_slideshow_pipeline.mjs --date 2026-04-27 --problems outputs/full-loop/run/niche-problems.json
  node scripts/run_slideshow_pipeline.mjs --date 2026-04-27 --production --generate-openai-hook --live-schedule --schedule-platform tiktok
  node scripts/run_slideshow_pipeline.mjs --date 2026-04-27 --production --generate-openai-hook --live-schedule --schedule-platform tiktok --publish-mode direct-public
  node scripts/run_slideshow_pipeline.mjs --date 2026-04-27 --production --generate-openai-hook --live-schedule --schedule-platform tiktok --publish-mode direct-public --upload-public-media
  node scripts/run_slideshow_pipeline.mjs --date 2026-04-27 --production --generate-openai-hook --hook-style-reference-image content/slideshows/2026-04-26-watch-stole-the-run-8-slide/slides/source/01-hook.png

Runs the Coachi slideshow pipeline end to end:
1. validate engine
2. generate sourced topic candidates
3. create a render manifest and Images 2.0 hook prompt
4. select and materialize Supabase/library assets
5. render slides with Sharp + Canvas
6. optionally upload rendered media to Coachi marketing Supabase public storage
7. build and dry-run a Postiz schedule

Production rule: Images 2.0 is slide 1 only. Use --mock-hook only for local pipeline tests.
Production packs require --production plus hook provenance proving the hook image came from Images 2.0.
Live scheduling requires --live-schedule, --production, POSTIZ_ENABLE_LIVE_POSTING=1, POSTIZ_API_KEY, and a real Postiz account id.
TikTok direct public publishing requires --publish-mode direct-public.
Use --upload-public-media to upload rendered slides to the marketing Supabase public bucket before building the Postiz schedule.`);
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function writeText(filePath, text) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, text, "utf8");
}

function captionWithHashtags(caption, hashtags) {
  const cleanCaption = String(caption || "").trim();
  const cleanHashtags = String(hashtags || "").trim();
  if (!cleanHashtags) return `${cleanCaption}\n`;
  return `${cleanCaption}\n\n${cleanHashtags}\n`;
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

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "slideshow";
}

function sentenceCase(value) {
  const text = String(value).trim();
  if (!text) return text;
  return `${text[0].toUpperCase()}${text.slice(1)}`;
}

function normalizeTextPosition(position) {
  return position === "bottom" ? "lower_middle" : (position || "lower_middle");
}

const AVATAR_VARIATIONS = [
  {
    id: "white_singlet_blue_shorts_three_quarter",
    watch: "no visible watch",
    top: "white lightweight running singlet",
    headwear: "no hat",
    eyewear: "no glasses",
    shorts: "cobalt blue 5-inch split shorts",
    angle: "medium-close three-quarter post-run action angle",
    weather: "clear mild morning",
    lighting: "soft golden-hour side light"
  },
  {
    id: "navy_long_sleeve_charcoal_side",
    watch: "no visible watch",
    top: "navy fitted long-sleeve performance shirt",
    headwear: "black lightweight running cap",
    eyewear: "no glasses",
    shorts: "charcoal running shorts",
    angle: "side-tracking action angle with natural arm swing",
    weather: "cool overcast morning",
    lighting: "soft diffused daylight"
  },
  {
    id: "grey_tee_green_shorts_side_back",
    watch: "no visible watch",
    top: "heather grey fitted performance t-shirt",
    headwear: "white running cap",
    eyewear: "dark sport sunglasses",
    shorts: "forest green running shorts",
    angle: "side/back angle with the face partially visible and consistent",
    weather: "dry windy afternoon",
    lighting: "clean natural daylight"
  },
  {
    id: "shirtless_black_shorts_warm_evening",
    watch: "no visible watch",
    top: "shirtless warm-weather running look",
    headwear: "no hat",
    eyewear: "sport sunglasses",
    shorts: "black 5-inch running shorts",
    angle: "waist-up cooldown angle on the selected route",
    weather: "warm dry evening",
    lighting: "warm golden-hour light"
  },
  {
    id: "black_tee_orange_shorts_trail",
    watch: "no visible watch",
    top: "black fitted short-sleeve running shirt",
    headwear: "thin black running headband",
    eyewear: "no glasses",
    shorts: "burnt orange split shorts",
    angle: "low three-quarter trail angle with stable natural stride",
    weather: "crisp morning after light rain",
    lighting: "soft early sunlight"
  },
  {
    id: "olive_singlet_navy_shorts_side",
    watch: "no visible watch",
    top: "olive sleeveless running top",
    headwear: "black cap worn forward",
    eyewear: "brown sport sunglasses",
    shorts: "navy running shorts",
    angle: "slightly wider side angle with visible route depth",
    weather: "sunny but mild",
    lighting: "bright natural morning light"
  },
  {
    id: "cream_long_sleeve_black_shorts_close",
    watch: "no visible watch",
    top: "cream lightweight long-sleeve running shirt",
    headwear: "no hat",
    eyewear: "clear running glasses",
    shorts: "black split shorts",
    angle: "tight medium-close cooldown frame, chest to waist",
    weather: "cool clear day",
    lighting: "clean low-angle sunlight"
  },
  {
    id: "rust_tee_green_shorts_controlled_effort",
    watch: "no visible watch",
    top: "rust red breathable running t-shirt",
    headwear: "grey trail running cap",
    eyewear: "no glasses",
    shorts: "dark green trail shorts",
    angle: "side angle on the selected route with controlled effort",
    weather: "dry mild morning",
    lighting: "soft cinematic daylight"
  }
];

const WORKOUT_PHASES = [
  {
    id: "pre_workout",
    label: "pre-workout",
    moment: "runner preparing before the session starts on a real outdoor route",
    body_language: "calm anticipation, relaxed shoulders, light warmup movement, ready but not posing",
    prompt_cue: "show the runner moments before starting: walking to the route, light dynamic warmup, or standing naturally with the route visible"
  },
  {
    id: "during_workout",
    label: "during-workout",
    moment: "runner in the middle of the session with steady controlled effort",
    body_language: "natural stride, consistent cadence, focused breathing, no stutter step or unnatural turn",
    prompt_cue: "show the runner moving naturally during the run with visible route context and believable motion"
  },
  {
    id: "post_workout",
    label: "post-workout",
    moment: "runner just finished or is cooling down after the session",
    body_language: "sweaty, satisfied, grounded, breathing settling, no exaggerated celebration",
    prompt_cue: "show a realistic cooldown or post-run moment with sweat, calm satisfaction, and a premium but believable feel"
  }
];

function stableHash(value) {
  let hash = 0;
  for (const char of String(value)) {
    hash = ((hash << 5) - hash) + char.charCodeAt(0);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickAvatarVariation(candidate) {
  const seed = [
    candidate.problem_id,
    candidate.problem_type,
    candidate.hook,
    candidate.schema
  ].filter(Boolean).join("|");
  return AVATAR_VARIATIONS[stableHash(seed) % AVATAR_VARIATIONS.length];
}

function pickWorkoutPhase(candidate) {
  const seed = [
    candidate.problem_id,
    candidate.problem_type,
    candidate.hook,
    candidate.schema,
    "workout_phase"
  ].filter(Boolean).join("|");
  return WORKOUT_PHASES[stableHash(seed) % WORKOUT_PHASES.length];
}

function buildCharacterAnchor(avatarVariation) {
  return {
    identity_id: "organic_runner_male_v2",
    reference_image: DEFAULT_HOOK_REFERENCE_IMAGE,
    style_reference_image: DEFAULT_HOOK_STYLE_REFERENCE_IMAGE,
    stable_traits: [
      "same face family across all Coachi organic running visuals",
      "male runner, age 25-35",
      "lean muscular endurance-athlete build",
      "tan complexion",
      "short dark slightly textured hair",
      "serious calm focused expression",
      "realistic sweat on face and shirt",
      "sharper cheek and brow detail in the stronger 2026-04-26 watch-stole-the-run style",
      "natural outdoor running context"
    ],
    variation_policy: "Keep the Coachi face family stable, but prefer the stronger 2026-04-26 watch-stole-the-run viral face/style direction over the too-clean park-portrait look. Rotate workout phase, top, headwear, eyewear, shorts, weather, light, and camera angle per pack.",
    watch_rule: "Default: no visible watch. If the hook is explicitly about watch anxiety, a small unbranded sports watch may appear, but never use readable UI, close-ups, or watch-checking poses.",
    selected_variation_id: avatarVariation.id
  };
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd || process.cwd(),
      env: {
        ...process.env,
        ...(options.env || {})
      },
      stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit"
    });
    let stdout = "";
    let stderr = "";
    if (options.capture) {
      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });
    }
    child.on("exit", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}${stderr ? `\n${stderr}` : ""}`));
      }
    });
  });
}

function slideFileName(slideNumber, role) {
  return `${String(slideNumber).padStart(2, "0")}-${slugify(role || "slide")}.png`;
}

function templateForSlide({ schemaSlide, draftSlide, index, finalSlideNumber }) {
  const slideNumber = index + 1;
  const assetSource = schemaSlide.asset_source
    || (slideNumber === 1 ? "images_2_0" : slideNumber === finalSlideNumber ? "supabase_template" : "supabase_library");
  const role = draftSlide?.role || schemaSlide.role || `slide-${slideNumber}`;

  return {
    slide_number: slideNumber,
    role,
    input_image: `slides/source/${slideFileName(slideNumber, role)}`,
    output_file: slideFileName(slideNumber, role),
    text: draftSlide?.text || schemaSlide.example_text || schemaSlide.text_template,
    asset_source: assetSource,
    visual_collection: schemaSlide.visual_collection || null,
    text_position: normalizeTextPosition(schemaSlide.text_position || "lower_middle"),
    font_size: slideNumber === 1 ? 92 : 76,
    max_chars_per_line: slideNumber === 1 ? 14 : 24
  };
}

function buildRenderManifest({ candidate, schema, hookBrief }) {
  const finalSlideNumber = schema.slides.length;
  return {
    base_dir: ".",
    output_dir: "slides/rendered",
    width: 1080,
    height: 1920,
    output_format: "png",
    hybrid_cost_model: schema.hybrid_image_strategy
      ? "one_ai_hook_six_library_assets"
      : "one_ai_hook_six_library_assets",
    estimated_generation_cost_usd: 0.15,
    source_problem_id: candidate.problem_id,
    source_url: candidate.source_url,
    schema: candidate.schema,
    emotion: candidate.emotion || hookBrief?.emotion || null,
    visual_world: hookBrief?.visual_world || candidate.visual_world || null,
    lighting_family: hookBrief?.lighting_family || candidate.lighting_family || null,
    avatar_world_required: true,
    cta_required: true,
    defaults: {
      font_family: "Arial Black, Impact, sans-serif",
      font_weight: 900,
      text_color: "#FFFFFF",
      stroke_color: "#111111",
      stroke_width: 8,
      gradient_opacity: 0.64,
      safe_margin: 96,
      text_position: "lower_middle",
      font_size: 76,
      max_chars_per_line: 24
    },
    slides: schema.slides.map((schemaSlide, index) => templateForSlide({
      schemaSlide,
      draftSlide: candidate.slide_draft?.[index],
      index,
      finalSlideNumber
    }))
  };
}

function numberedPointsFromCandidate(candidate) {
  const draft = Array.isArray(candidate.slide_draft) ? candidate.slide_draft : [];
  return draft
    .filter((slide) => slide.slide_number >= 2 && slide.slide_number <= 6)
    .map((slide, index) => String(slide.text || "")
      .replace(/^\s*\d+[\).\s-]+/, "")
      .trim()
      .replace(/[.!?]+(["”'])$/, "$1")
      .replace(/[.!?]+$/, ""))
    .filter(Boolean)
    .slice(0, 5)
    .map((text, index) => `${index + 1}. ${text}`);
}

function buildCaptions(candidate) {
  const hook = sentenceCase(candidate.hook);
  const topFivePoints = numberedPointsFromCandidate(candidate);
  if (/^top 5/i.test(candidate.hook) && topFivePoints.length === 5) {
    return {
      tiktok: `${hook}:\n\n${topFivePoints.join("\n")}\n\nComment "easy" if this happens to you.`,
      instagram: `${hook}:\n\n${topFivePoints.join("\n")}\n\nThese come from real runner problems, not theory.\n\nComment "easy" if this happens to you.`,
      hashtags: "#running #runtok #easyrun #runningtips #marathontraining #beginnerrunner #runcoach #runmotivation\n"
    };
  }

  if (candidate.problem_type === "easy-run pace drift") {
    return {
      tiktok: `Easy runs usually do not fail all at once.\n\nThey fail when every small surge turns into a slightly harder mile.\n\nIf your long run always drifts from easy to medium-hard, this is the cue:\nstop racing easy.\n\nComment "easy" if this happens to you.`,
      instagram: `Easy runs usually fail slowly.\n\nA few small surges.\nA pace you do not want to let go.\nA heart rate that creeps up late.\n\nThen the run that was supposed to build you starts taking more from you.\n\nThe win is finishing easy.\n\nComment "easy" if your easy runs drift too hard.`,
      hashtags: "#running #runtok #easyrun #runningtips #marathontraining #beginnerrunner #runcoach #runmotivation\n"
    };
  }
  const insight = candidate.problem || candidate.why_this_can_work || candidate.exact_words;
  const tiktok = `${hook}\n\n${insight}\n\nSave this before your next run.`;
  const instagram = `${hook}\n\nMost runners do not need more noise. They need one useful cue they can apply on the next run.\n\nSave this before your next easy run.`;
  return { tiktok, instagram, hashtags: `${DEFAULT_HASHTAGS.join(" ")}\n` };
}

function themeBriefForCandidate(candidate) {
  const defaults = {
    theme: candidate.problem_type || "running progress",
    route_tag: "city_park_path",
    visual_world: "city park path",
    lighting_family: "soft natural daylight",
    reddit_background: candidate.exact_words || candidate.problem || "A runner is trying to understand a run.",
    background: "quiet city park path with visible route context",
    vibe: "realistic, calm, premium, useful, not overproduced",
    first_image_prompt_adaptation: "show a runner in a believable post-run or easy-run moment with clean negative space for overlay text",
    visual_keywords: ["realistic running route", "natural light", "visible background", "clean overlay space"],
    avoid: ["watch close-up", "baked-in text", "logos", "fake steam", "blurred background", "unnatural stride"]
  };

  const byType = {
    "easy-run pace drift": {
      theme: "easy-run drift",
      route_tag: "forest_road",
      visual_world: "forest road",
      lighting_family: "soft green morning forest light",
      reddit_background: candidate.exact_words || "The runner starts easy, then the run gradually turns medium-hard.",
      background: "long forest road, enough depth to feel like the runner has been moving for a while",
      vibe: "honest endurance, slight late-run fatigue, controlled effort, not a sprint",
      first_image_prompt_adaptation: "post-run or late-run action moment: the runner is sweaty, breathing steadily, satisfied but aware he had to control the effort",
      visual_keywords: ["long path", "subtle fatigue", "controlled easy effort", "natural route depth", "premium running editorial"],
      avoid: ["race finish line", "sprinting", "watch checking", "hands on hips pose", "dramatic collapse"]
    },
    "zone-2 confusion": {
      theme: "zone 2 confusion",
      route_tag: "quiet_neighborhood_road",
      visual_world: "quiet neighborhood road",
      lighting_family: "soft overcast morning light",
      reddit_background: candidate.exact_words || "The runner feels like zone 2 is too slow and starts doubting the session.",
      background: "simple quiet neighborhood road, morning light, low-pressure easy-run environment",
      vibe: "calm confusion turning into control",
      first_image_prompt_adaptation: "runner moving easily, relaxed shoulders, no watch checking, enough negative space for a clear hook",
      visual_keywords: ["easy effort", "quiet path", "relaxed body language", "clean background"],
      avoid: ["lab testing", "heart-rate charts", "watch close-up", "frustrated face"]
    },
    "heart-rate panic": {
      theme: "heart-rate panic",
      route_tag: "open_city_park_path",
      visual_world: "open city park path",
      lighting_family: "bright natural daylight",
      reddit_background: candidate.exact_words || "The runner sees a high effort signal and panics even though the run may be fine.",
      background: "open city park path with light environmental stress such as sun or wind",
      vibe: "tense but grounded, useful correction, not alarmist",
      first_image_prompt_adaptation: "runner in controlled motion with visible sweat and focused breathing, scene should explain why effort can rise",
      visual_keywords: ["sun", "wind", "controlled breathing", "real effort", "environment context"],
      avoid: ["medical emergency", "fear expression", "watch close-up", "fake exhaustion"]
    },
    "pace disbelief": {
      theme: "pace context",
      route_tag: "track_edge",
      visual_world: "track edge",
      lighting_family: "clear afternoon training light",
      reddit_background: candidate.exact_words || "The runner thinks pace is wrong because the route changes.",
      background: "track edge or flat training path where pace and effort can be compared clearly",
      vibe: "context changes the run, practical and grounded",
      first_image_prompt_adaptation: "runner on a clear training path, natural stride, background shows route context without changing worlds",
      visual_keywords: ["track edge", "visible route", "natural stride", "effort over split"],
      avoid: ["route-world switching", "watch checking", "extreme terrain"]
    },
    "workout-racing": {
      theme: "workout control",
      route_tag: "track_edge",
      visual_world: "track edge",
      lighting_family: "late afternoon track light",
      reddit_background: candidate.exact_words || "The runner turns workouts into races and fades late.",
      background: "track perimeter or quiet road after intervals, runner cooling down",
      vibe: "discipline, restraint, useful athletic lesson",
      first_image_prompt_adaptation: "sweaty runner after a controlled workout, satisfied but not posing, premium fitness look",
      visual_keywords: ["post-workout", "controlled effort", "cooldown", "discipline"],
      avoid: ["race celebration", "sprint pose", "aggressive gym energy"]
    }
  };

  const merged = {
    ...defaults,
    ...(byType[candidate.problem_type] || {})
  };
  return {
    ...merged,
    visual_world: candidate.visual_world || merged.visual_world,
    route_tag: candidate.route_tag || merged.route_tag,
    lighting_family: candidate.lighting_family || merged.lighting_family
  };
}

function buildHookBriefJson({ candidate, schema }) {
  const theme = themeBriefForCandidate(candidate);
  const hookSlide = schema.slides[0] || {};
  const avatarVariation = pickAvatarVariation(candidate);
  const workoutPhase = pickWorkoutPhase(candidate);

  return {
    schema_version: 1,
    hook: candidate.hook,
    problem_id: candidate.problem_id,
    problem_type: candidate.problem_type,
    source_url: candidate.source_url,
    exact_reddit_language: candidate.exact_words || null,
    emotion: candidate.emotion || "confused",
    pattern: candidate.pattern || null,
    tiktok_text_bank: candidate.tiktok_text_bank || null,
    hook_source: candidate.hook_source || null,
    slide_text_source: candidate.slide_text_source || null,
    theme: theme.theme,
    route_tag: theme.route_tag,
    visual_world: theme.visual_world,
    lighting_family: theme.lighting_family,
    avatar_world_required: true,
    avatar_source: DEFAULT_HOOK_REFERENCE_IMAGE,
    viral_face_style_reference: DEFAULT_HOOK_STYLE_REFERENCE_IMAGE,
    cta_required: true,
    reddit_background_and_vibe: {
      background: theme.background,
      vibe: theme.vibe,
      reddit_background: theme.reddit_background,
      visual_keywords: theme.visual_keywords,
      avoid: theme.avoid
    },
    first_image_prompt_adaptation: theme.first_image_prompt_adaptation,
    character_anchor: buildCharacterAnchor(avatarVariation),
    workout_phase: workoutPhase,
    avatar_variation: avatarVariation,
    schema_prompt_template: hookSlide.image_prompt_template || null,
    production_rules: [
      "Every slideshow has an explicit emotion, one Images 2.0 hook, one generated avatar world, and one final CTA.",
      "Slide hook and slides 1-6 should use the source-backed TikTok slideshow text bank before any generic AI wording.",
      "Images 2.0 generates slide 1 only.",
      "Do not generate all slideshow images in one Images 2.0 request.",
      "Do not bake overlay text into the image.",
      "Keep the full deck in one visual world and one lighting family.",
      "Do not mix hills, lakes, and mountains in the same slideshow.",
      "Use Supabase/curated library assets for slides 2 through the CTA slide.",
      "Composite all text locally with Sharp/Canvas."
    ]
  };
}

function fillPromptTemplate(template, candidate, hookBrief = null) {
  const vibe = hookBrief?.reddit_background_and_vibe;
  return template
    .replaceAll("{route}", vibe?.background || "quiet nature running route")
    .replaceAll("{scene}", hookBrief?.first_image_prompt_adaptation || "runner finishing an easy run")
    .replaceAll("{emotion}", candidate.emotion || "focused")
    .replaceAll("{topic}", hookBrief?.theme || candidate.problem_type || "running progress");
}

function buildImages20Prompt({ schema, candidate, hookBrief }) {
  const hookSlide = schema.slides[0];
  const imagePrompt = fillPromptTemplate(hookSlide.image_prompt_template || "", candidate, hookBrief);
  const vibe = hookBrief.reddit_background_and_vibe;
  const characterAnchor = hookBrief.character_anchor;
  const workoutPhase = hookBrief.workout_phase;
  const avatarVariation = hookBrief.avatar_variation;
  return `# Images 2.0 Hook Prompt

Production rule: generate exactly ONE image for slide 1.
Do not generate slides 2-7 with Images 2.0.
Do not create an 8-slide deck.
Do not add text to the image.

## Output
- One vertical 9:16 photorealistic image
- No baked-in text
- No logos
- No app UI
- Leave clean negative space for local overlay text
- Save final file as: slides/source/01-hook.png

## Hook Text Added Later By Compositor
${candidate.hook}

## TikTok-Proven Text Source
- Text bank: ${hookBrief.tiktok_text_bank || "not available"}
- Hook source family: ${hookBrief.hook_source?.source_family_id || "fallback"}
- Hook source signal: ${hookBrief.hook_source?.source_signal || "n/a"}
- Hook source URL: ${hookBrief.hook_source?.source_url || "n/a"}
- Slide text set: ${hookBrief.slide_text_source?.slide_set_id || "fallback"}
- Rule: use this as proven structure and simplicity only. Do not copy creator-specific wording.

## Reddit Source Context
- Problem type: ${candidate.problem_type}
- Exact runner language: ${candidate.exact_words || candidate.problem || "n/a"}
- Source: ${candidate.source_url || "local research bank"}

## Theme And Vibe
- Theme: ${hookBrief.theme}
- Route tag: ${hookBrief.route_tag}
- Selected visual world: ${hookBrief.visual_world}
- Lighting family: ${hookBrief.lighting_family}
- Viewer emotion: ${hookBrief.emotion}
- Background: ${vibe.background}
- Vibe: ${vibe.vibe}
- Reddit-derived background: ${vibe.reddit_background}
- Visual keywords: ${vibe.visual_keywords.join(", ")}

## First Image Prompt Adapted To Theme
${hookBrief.first_image_prompt_adaptation}

## Required Slideshow Spine
- Emotion: ${hookBrief.emotion}
- Images 2.0: slide 1 only
- Avatar world: generated Coachi runner avatar in ${hookBrief.visual_world}
- CTA: final slide only, one simple action
- Visual consistency: slides 2-7 must stay in ${hookBrief.visual_world} with ${hookBrief.lighting_family}

## Character Continuity Anchor
- Identity ID: ${characterAnchor.identity_id}
- Reference image: ${characterAnchor.reference_image}
- Viral face/style reference: ${characterAnchor.style_reference_image || DEFAULT_HOOK_STYLE_REFERENCE_IMAGE}
- Stable traits: ${characterAnchor.stable_traits.join("; ")}
- Variation policy: ${characterAnchor.variation_policy}

## Workout Phase For This Image
- Phase: ${workoutPhase.label}
- Moment: ${workoutPhase.moment}
- Body language: ${workoutPhase.body_language}
- Prompt cue: ${workoutPhase.prompt_cue}

## Avatar Variation For This Image
- Watch: ${avatarVariation.watch}
- Top: ${avatarVariation.top}
- Headwear: ${avatarVariation.headwear}
- Eyewear: ${avatarVariation.eyewear}
- Shorts: ${avatarVariation.shorts}
- Camera angle: ${avatarVariation.angle}
- Weather: ${avatarVariation.weather}
- Lighting: ${avatarVariation.lighting}
- Watch rule: ${characterAnchor.watch_rule}

## Schema Prompt Adapted To Theme
${imagePrompt}

## Final Prompt To Use
Create a photorealistic vertical 9:16 image of the same organic Coachi runner identity: male runner, age 25-35, lean endurance-athlete build, tan complexion, short dark slightly textured hair, calm focused expression, realistic sweat, and believable outdoor running presence.

Use the clean Coachi avatar reference for identity continuity, then use the 2026-04-26 watch-stole-the-run hook image as the standard TikTok viral face/style reference: fitted dark performance kit, visible sweat on face and shirt, sharper cheek and brow detail, cinematic contrast, shallow depth of field, and serious human expression. Borrow the face/style energy only. Do not copy its lake/mountain background, hands-on-hips pose, or visible watch unless the hook is specifically about watch anxiety.

Workout phase: ${workoutPhase.label}. Capture this moment: ${workoutPhase.moment}. Body language should show ${workoutPhase.body_language}. ${workoutPhase.prompt_cue}.

Wardrobe and gear for this image: ${avatarVariation.top}, ${avatarVariation.shorts}, ${avatarVariation.headwear}, and ${avatarVariation.eyewear}. Default to no visible watch. Do not include Apple Watch, Garmin watch, smartwatch, GPS watch, watch UI, watch close-up, or watch-checking pose.

Scene: ${vibe.background}. Keep the image inside the selected visual world: ${hookBrief.visual_world}. The image should feel like ${vibe.vibe}. Weather: ${avatarVariation.weather}. Lighting: ${avatarVariation.lighting}. Match the deck lighting family: ${hookBrief.lighting_family}. The runner should look like a real person in a real run moment, not a model shoot. Keep body mechanics natural. Use realistic daylight, visible background detail, and a premium fitness brand aesthetic.

Composition: ${avatarVariation.angle}, no face distortion, no watch-checking pose, no hands-on-hips hero pose, no exaggerated emotion. Show the viewer emotion as ${hookBrief.emotion} through body language and scene tension, not facial acting. Leave clean center/lower-middle negative space for the hook overlay.

## Character / Brand Anchor
photorealistic athletic male runner, lean muscular endurance-athlete build, masculine, tan complexion, short dark slightly textured hair, same face family across posts, natural run/post-run moment, realistic sweat on face and shirt, serious calm focused expression, stronger 2026-04-26 watch-stole-the-run viral face style, fitted dark performance kit, selected visual world environment, premium fitness-editorial aesthetic, default no visible watch

## Negative Constraints
Avoid: ${vibe.avoid.join(", ")}.
Do not mix hills, lakes, and mountains. Do not change the route/world from ${hookBrief.visual_world}.
No text, no watermark, no brand logos, no Apple Watch, no Garmin watch, no smartwatch, no GPS watch, no readable watch UI, no app UI, no extra limbs, no distorted hands, no fake steam, no blurred-out background.
`;
}

async function copyFile(inputPath, outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.copyFile(inputPath, outputPath);
}

function validateHookProvenanceData(provenance) {
  const generator = String(provenance.generator || provenance.source || "").toLowerCase();
  const allowedGenerators = new Set([
    "images_2_0",
    "chatgpt_images_2_0",
    "chatgpt images 2.0",
    "gpt_image_2_0"
  ]);
  assert(allowedGenerators.has(generator), "Hook provenance must declare generator as Images 2.0.");
  assert(provenance.created_at || provenance.generated_at, "Hook provenance must include created_at or generated_at.");
}

async function copyHookProvenance({ hookProvenance, packDir }) {
  const destination = path.join(packDir, "source/hook-provenance.json");
  if (!hookProvenance) {
    if (await exists(destination)) {
      const existing = await readJson(destination);
      validateHookProvenanceData(existing);
      return { mode: "existing_hook_provenance", path: destination };
    }
    return null;
  }

  const data = await readJson(path.resolve(hookProvenance));
  validateHookProvenanceData(data);
  await writeJson(destination, data);
  return { mode: "provided_hook_provenance", path: destination };
}

async function download(url, outputPath) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed ${response.status}: ${url}`);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
}

function pickMockHookCandidate(picklist) {
  const nonHookSlides = (picklist.slides || []).filter((slide) => slide.asset_source !== "images_2_0");
  for (const slide of nonHookSlides) {
    const candidate = slide.instruction?.candidate_assets?.find((asset) => asset.local_fallback_path || asset.local_path || asset.supabase_public_url);
    if (candidate) return candidate;
  }
  return null;
}

async function materializeHook({ packDir, manifest, picklist, hookImage, mockHook }) {
  const hookSlide = manifest.slides[0];
  const hookPath = path.resolve(packDir, hookSlide.input_image);
  if (hookImage) {
    await copyFile(path.resolve(hookImage), hookPath);
    return { mode: "provided_hook_image", path: hookPath };
  }
  if (await exists(hookPath)) {
    return { mode: "existing_hook_image", path: hookPath };
  }
  if (!mockHook) {
    return {
      mode: "images_2_0_required",
      path: hookPath,
      render_ready: false
    };
  }

  const candidate = pickMockHookCandidate(picklist);
  assert(candidate, "Could not find a local library asset for --mock-hook.");
  if (candidate.local_fallback_path || candidate.local_path) {
    await copyFile(path.resolve(candidate.local_fallback_path || candidate.local_path), hookPath);
  } else {
    await download(candidate.supabase_public_url, hookPath);
  }
  return {
    mode: "mock_hook_from_library_for_local_test",
    path: hookPath,
    selected_asset_id: candidate.id,
    production_note: "Replace with one Images 2.0 hook image before publishing."
  };
}

async function writePipelineStatusReport({ packDir, report }) {
  await writeJson(path.join(packDir, "pipeline-run-report.json"), report);
}

function parseSchedulePlatforms(value) {
  const platforms = String(value || "all")
    .split(",")
    .map((platform) => platform.trim().toLowerCase())
    .filter(Boolean);
  if (platforms.includes("all")) return new Set(["tiktok", "instagram"]);
  const allowed = new Set(["tiktok", "instagram"]);
  for (const platform of platforms) {
    assert(allowed.has(platform), `Unsupported --schedule-platform value: ${platform}`);
  }
  return new Set(platforms);
}

function realPostizAccountId(platform) {
  if (platform === "tiktok") return process.env.POSTIZ_TIKTOK_ACCOUNT_ID || null;
  if (platform === "instagram") return process.env.POSTIZ_INSTAGRAM_ACCOUNT_ID || null;
  return null;
}

function postizAccount(platform) {
  const accountId = realPostizAccountId(platform);
  return {
    account_id: accountId || `manual_${platform}_account`,
    platform,
    status: accountId ? "env_configured" : "manual_placeholder"
  };
}

function postizPost({ packDir, platform, renderedPaths, scheduledAt, publishMode }) {
  const account = postizAccount(platform);
  if (platform === "tiktok") {
    return {
      slideshow_id: path.basename(packDir),
      pack_dir: packDir,
      account_id: account.account_id,
      platform: "tiktok",
      type: "tiktok-slideshow",
      publish_mode: publishMode,
      output_mode: "photo_carousel",
      media_type: "PHOTO",
      media_paths: renderedPaths,
      caption_path: path.join(packDir, "copy/tiktok-postiz-caption.txt"),
      scheduled_at: scheduledAt
    };
  }

  return {
    slideshow_id: path.basename(packDir),
    pack_dir: packDir,
    account_id: account.account_id,
    platform: "instagram",
    type: "instagram-carousel",
    publish_mode: "manual-review",
    output_mode: "photo_carousel",
    media_type: "CAROUSEL_ALBUM",
    media_paths: renderedPaths,
    caption_path: path.join(packDir, "copy/instagram-postiz-caption.txt"),
    scheduled_at: scheduledAt
  };
}

function assertLiveScheduleEnv({ liveSchedule, schedulePlatform, publishMode }) {
  const platforms = parseSchedulePlatforms(schedulePlatform);
  const accounts = [...platforms].map((platform) => postizAccount(platform));
  if (liveSchedule) {
    assert(process.env.POSTIZ_ENABLE_LIVE_POSTING === "1", "--live-schedule requires POSTIZ_ENABLE_LIVE_POSTING=1.");
    assert(process.env.POSTIZ_API_KEY, "--live-schedule requires POSTIZ_API_KEY.");
    assert(process.env.POSTIZ_URL || process.env.POSTIZ_PUBLIC_API_BASE, "--live-schedule requires POSTIZ_URL or POSTIZ_PUBLIC_API_BASE.");
    assert(publishMode === "direct-public", "--live-schedule requires --publish-mode direct-public for TikTok direct public production.");
    for (const platform of platforms) {
      assert(realPostizAccountId(platform), `--live-schedule requires POSTIZ_${platform.toUpperCase()}_ACCOUNT_ID.`);
    }
  }
  return { platforms, accounts };
}

async function uploadSlideshowPublicMedia({ packDir, campaignDate, storageSlug, manifestOut, includeMetadata }) {
  await run("python3", [
    "scripts/upload_slideshow_assets.py",
    "--root",
    packDir,
    "--campaign-date",
    campaignDate,
    "--slug",
    storageSlug,
    "--execute",
    "--manifest-out",
    manifestOut,
    ...(includeMetadata ? [] : ["--skip-metadata"])
  ]);
  return readJson(manifestOut);
}

async function scheduleMediaPaths({ packDir, manifest, uploadPublicMedia, publicMediaManifestPath, campaignDate, storageSlug, includeMetadata }) {
  if (!uploadPublicMedia && !publicMediaManifestPath) {
    return {
      mediaPaths: renderedMediaPathsForManifest({ packDir, manifest }),
      uploadManifest: null,
      uploadManifestPath: null,
      mediaTransport: "local_media_paths"
    };
  }

  const uploadManifestPath = path.resolve(publicMediaManifestPath || path.join(packDir, "upload-manifest.json"));
  const uploadManifest = uploadPublicMedia
    ? await uploadSlideshowPublicMedia({
        packDir,
        campaignDate,
        storageSlug,
        manifestOut: uploadManifestPath,
        includeMetadata
      })
    : await readJson(uploadManifestPath);

  return {
    mediaPaths: publicMediaPathsForRenderedSlides({ packDir, manifest, uploadManifest }),
    uploadManifest,
    uploadManifestPath,
    mediaTransport: "supabase_public_https"
  };
}

function buildPostizSchedule({ packDir, manifest, mediaPaths, scheduledAt, liveSchedule, schedulePlatform, publishMode, publicMediaManifestPath, mediaTransport }) {
  const renderedPaths = mediaPaths || renderedMediaPathsForManifest({ packDir, manifest });
  const { platforms, accounts } = assertLiveScheduleEnv({ liveSchedule, schedulePlatform, publishMode });
  return {
    schema_version: 1,
    dry_run: !liveSchedule,
    publish_mode: publishMode,
    media_transport: mediaTransport || "local_media_paths",
    ...(publicMediaManifestPath ? { public_media_manifest: path.relative(process.cwd(), publicMediaManifestPath) } : {}),
    generated_at: new Date().toISOString(),
    safety: {
      use_official_integrations_only: true,
      requires_live_env_flag: "POSTIZ_ENABLE_LIVE_POSTING=1",
      no_duplicate_payloads: true,
      ...(mediaTransport === "supabase_public_https"
        ? {
            public_media_host: "coachi-marketing-assets Supabase storage",
            local_postiz_ok_when_media_paths_are_public_https: true
          }
        : {})
    },
    rate_limits: {
      max_posts_per_account_per_day: 2,
      min_hours_between_posts_per_account: 4,
      max_posts_per_hour_global: 4
    },
    platform_rate_limits: {
      tiktok: {
        max_posts_per_account_per_day: 2,
        min_hours_between_posts_per_account: 4
      },
      instagram: {
        max_posts_per_account_per_day: 1,
        min_hours_between_posts_per_account: 8
      }
    },
    accounts,
    posts: [...platforms].map((platform) => postizPost({ packDir, platform, renderedPaths, scheduledAt, publishMode }))
  };
}

function defaultScheduledAt() {
  return new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
}

async function main() {
  const { args, flags } = parseArgs(process.argv.slice(2));
  if (flags.has("--help") || flags.has("-h")) {
    printHelp();
    return;
  }

  const date = args.get("--date") || new Date().toISOString().slice(0, 10);
  const limit = Number(args.get("--limit") || 8);
  const candidateIndex = Number(args.get("--candidate-index") || 0);
  const topicOut = args.get("--topics-out") || path.join(DEFAULT_TOPIC_OUT, `${date}-slideshow-pipeline-candidates.json`);
  const problemsPath = args.get("--problems");
  const minScore = args.get("--min-score");
  const outRoot = args.get("--out-root") || DEFAULT_OUTPUT_ROOT;
  const hookImage = args.get("--hook-image");
  const hookProvenance = args.get("--hook-provenance");
  const mockHook = flags.has("--mock-hook");
  const generateOpenAiHook = flags.has("--generate-openai-hook");
  const production = flags.has("--production");
  const allowNeedsReview = flags.has("--allow-needs-review");
  const force = flags.has("--force");
  const preferRemote = flags.has("--prefer-remote");
  const localLibrary = flags.has("--local-library");
  const noSchedule = flags.has("--no-schedule");
  const liveSchedule = flags.has("--live-schedule");
  const schedulePlatform = args.get("--schedule-platform") || (liveSchedule ? "tiktok" : "all");
  const publishMode = args.get("--publish-mode") || (liveSchedule ? "direct-public" : "manual-review");
  const uploadPublicMedia = flags.has("--upload-public-media");
  const publicMediaManifestPath = args.get("--public-media-manifest");
  const includeSupabaseMetadata = flags.has("--with-supabase-metadata");
  const usageLog = args.get("--usage-log");
  const scheduledAt = args.get("--scheduled-at") || defaultScheduledAt();
  const hookReferenceImage = args.get("--hook-reference-image") || DEFAULT_HOOK_REFERENCE_IMAGE;
  const hookStyleReferenceImage = args.get("--hook-style-reference-image") || DEFAULT_HOOK_STYLE_REFERENCE_IMAGE;

  assert(!(production && mockHook), "--production cannot be combined with --mock-hook.");
  assert(!(generateOpenAiHook && hookImage), "--generate-openai-hook cannot be combined with --hook-image.");
  assert(!(uploadPublicMedia && publicMediaManifestPath), "--upload-public-media creates a fresh manifest; use --public-media-manifest only for an existing upload manifest.");
  assert(!liveSchedule || production, "--live-schedule requires --production.");
  assert(["manual-review", "direct-public"].includes(publishMode), "--publish-mode must be manual-review or direct-public.");
  assertLiveScheduleEnv({ liveSchedule, schedulePlatform, publishMode });

  await run("npm", ["run", "slideshow:validate"]);
  await run("npm", [
    "run",
    "slideshow:topics",
    "--",
    "--date",
    date,
    "--limit",
    String(limit),
    "--out",
    topicOut,
    ...(problemsPath ? ["--problems", problemsPath] : []),
    ...(minScore ? ["--min-score", minScore] : [])
  ]);

  const topics = await readJson(topicOut);
  assert(Array.isArray(topics.candidates) && topics.candidates.length > 0, "No slideshow topic candidates generated.");
  assert(candidateIndex >= 0 && candidateIndex < topics.candidates.length, `candidate-index ${candidateIndex} is out of range.`);

  const candidate = topics.candidates[candidateIndex];
  const schema = await readJson(path.join(SCHEMA_DIR, `${candidate.schema}.json`));
  const slug = args.get("--slug") || `${date}-${slugify(candidate.hook)}`;
  const packDir = path.resolve(outRoot, slug);
  if (await exists(packDir)) {
    assert(force, `Pack already exists: ${packDir}. Use --force to overwrite generated files.`);
  }

  const captions = buildCaptions(candidate);
  const hookBrief = buildHookBriefJson({ candidate, schema });
  const manifest = buildRenderManifest({ candidate, schema, hookBrief });
  const images20Prompt = buildImages20Prompt({ schema, candidate, hookBrief });
  await writeJson(path.join(packDir, "render-manifest.json"), manifest);
  await writeJson(path.join(packDir, "source/hook-brief.json"), hookBrief);
  await writeText(path.join(packDir, "source/hook.txt"), `${candidate.hook}\n`);
  await writeText(path.join(packDir, "source/images-2-0-hook-prompt.md"), images20Prompt);
  await writeText(path.join(packDir, "copy/tiktok-caption.txt"), `${captions.tiktok}\n`);
  await writeText(path.join(packDir, "copy/instagram-caption.txt"), `${captions.instagram}\n`);
  await writeText(path.join(packDir, "copy/hashtags.txt"), captions.hashtags);
  await writeText(path.join(packDir, "copy/tiktok-postiz-caption.txt"), captionWithHashtags(captions.tiktok, captions.hashtags));
  await writeText(path.join(packDir, "copy/instagram-postiz-caption.txt"), captionWithHashtags(captions.instagram, captions.hashtags));
  await writeText(path.join(packDir, "source/prompts.md"), images20Prompt);

  if (generateOpenAiHook) {
    await run("npm", [
      "run",
      "slideshow:openai-hook",
      "--",
      "--pack",
      packDir,
      "--model",
      args.get("--openai-image-model") || "gpt-image-2",
      "--size",
      args.get("--openai-image-size") || "1024x1536",
      "--quality",
      args.get("--openai-image-quality") || "high",
      "--reference-image",
      hookReferenceImage,
      "--style-reference-image",
      hookStyleReferenceImage
    ]);
  }

  const picklistPath = path.join(packDir, "asset-picklist.json");
  const materializeReportPath = path.join(packDir, "materialize-report.json");
  await run("npm", [
    "run",
    "slideshow:assets",
    "--",
    "--manifest",
    path.join(packDir, "render-manifest.json"),
    "--out",
    picklistPath,
    ...(production ? ["--production"] : []),
    ...(allowNeedsReview ? ["--allow-needs-review"] : []),
    ...(localLibrary ? ["--local-library"] : []),
    ...(usageLog ? ["--usage-log", usageLog] : [])
  ]);
  await run("npm", [
    "run",
    "slideshow:materialize",
    "--",
    "--picklist",
    picklistPath,
    "--slideshow-id",
    slug,
    "--out",
    materializeReportPath,
    ...(usageLog ? ["--usage-log", usageLog] : []),
    ...((production || preferRemote) && !localLibrary ? ["--prefer-remote"] : [])
  ]);

  const picklist = await readJson(picklistPath);
  const provenance = await copyHookProvenance({ hookProvenance, packDir });
  const hook = await materializeHook({ packDir, manifest, picklist, hookImage, mockHook });
  if (hook.render_ready === false) {
    await writePipelineStatusReport({
      packDir,
      report: {
        ok: false,
        status: "needs_hook_image",
        generated_at: new Date().toISOString(),
        source_article: "https://x.com/alexcooldev/status/2047715075457507452",
        mode: production ? "production_pack" : "draft_pack",
        pack_dir: path.relative(process.cwd(), packDir),
        images_2_0_prompt: path.relative(process.cwd(), path.join(packDir, "source/images-2-0-hook-prompt.md")),
        expected_hook_image: hook.path,
        message: "Generate exactly one Images 2.0 hook image and save it to slides/source/01-hook.png."
      }
    });
    throw new Error(`Images 2.0 hook image required. Prompt written to ${path.join(packDir, "source/prompts.md")}`);
  }
  if (production) {
    assert(provenance, "Production packs require --hook-provenance or an existing source/hook-provenance.json.");
  }

  await run(
    "npm",
    ["run", "slideshow:render", "--", "--manifest", path.join(packDir, "render-manifest.json")],
    usageLog ? { env: { SLIDESHOW_USAGE_LOG_PATH: usageLog } } : {}
  );

  const publicMedia = await scheduleMediaPaths({
    packDir,
    manifest,
    uploadPublicMedia,
    publicMediaManifestPath,
    campaignDate: date,
    storageSlug: storageSlugForPack(date, slug),
    includeMetadata: includeSupabaseMetadata
  });
  const schedulePath = path.join(packDir, "postiz-schedule.json");
  const schedule = buildPostizSchedule({
    packDir,
    manifest,
    mediaPaths: publicMedia.mediaPaths,
    scheduledAt,
    liveSchedule,
    schedulePlatform,
    publishMode,
    publicMediaManifestPath: publicMedia.uploadManifestPath,
    mediaTransport: publicMedia.mediaTransport
  });
  await writeJson(schedulePath, schedule);
  await run("npm", [
    "run",
    "slideshow:qa",
    "--",
    "--pack",
    packDir,
    ...(production ? ["--production"] : []),
    ...(allowNeedsReview ? ["--allow-needs-review"] : [])
  ]);
  if (!noSchedule) {
    await run("npm", ["run", "slideshow:queue", "--", "--schedule", schedulePath]);
  }

  const report = {
    ok: true,
    status: production ? "production_ready" : "draft_ready",
    generated_at: new Date().toISOString(),
    source_article: "https://x.com/alexcooldev/status/2047715075457507452",
    mode: production ? "production_pack" : mockHook ? "local_test_with_mock_hook" : "draft_pack",
    publish_mode: publishMode,
    steps: [
      "validated engine",
      "generated sourced topic candidates",
      "created schema-based render manifest",
      "created Images 2.0 hook-only prompt",
      "selected and materialized Supabase/library assets",
      "rendered slides through Sharp + Canvas compositor",
      publicMedia.mediaTransport === "supabase_public_https"
        ? "attached Coachi marketing Supabase public media URLs"
        : "kept local media paths for manual/Postiz upload",
      "built Postiz dry-run schedule",
      noSchedule ? "skipped queue dry-run by flag" : "ran Postiz queue dry-run"
    ],
    candidate: {
      problem_id: candidate.problem_id,
      schema: candidate.schema,
      hook: candidate.hook,
      source_url: candidate.source_url,
      exact_words: candidate.exact_words || null,
      problem_type: candidate.problem_type,
      hook_source: candidate.hook_source || null,
      slide_text_source: candidate.slide_text_source || null,
      tiktok_text_bank: candidate.tiktok_text_bank || null
    },
    hook_brief: path.relative(process.cwd(), path.join(packDir, "source/hook-brief.json")),
    hook_text: path.relative(process.cwd(), path.join(packDir, "source/hook.txt")),
    theme: hookBrief.theme,
    reddit_background_and_vibe: hookBrief.reddit_background_and_vibe,
    pack_dir: path.relative(process.cwd(), packDir),
    render_manifest: path.relative(process.cwd(), path.join(packDir, "render-manifest.json")),
    images_2_0_prompt: path.relative(process.cwd(), path.join(packDir, "source/images-2-0-hook-prompt.md")),
    hook_provenance: provenance ? path.relative(process.cwd(), provenance.path) : null,
    hook,
    schedule: path.relative(process.cwd(), schedulePath),
    media_transport: publicMedia.mediaTransport,
    public_media_manifest: publicMedia.uploadManifestPath
      ? path.relative(process.cwd(), publicMedia.uploadManifestPath)
      : null,
    live_schedule: liveSchedule,
    schedule_platform: [...parseSchedulePlatforms(schedulePlatform)],
    rendered_dir: path.relative(process.cwd(), path.join(packDir, "slides/rendered"))
  };
  await writeJson(path.join(packDir, "pipeline-run-report.json"), report);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
