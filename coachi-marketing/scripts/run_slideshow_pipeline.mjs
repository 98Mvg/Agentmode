#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import {
  publicMediaPathsForMediaDir,
  publicMediaPathsForRenderedSlides,
  renderedMediaPathsForManifest,
  storageSlugForPack
} from "./slideshow_public_media_manifest.mjs";
import {
  resolveTiktokPostizAccountId,
  tiktokAccountEnvHint,
  tiktokAccountProfile
} from "./postiz_account_profiles.mjs";
import {
  CAPTION_BANK_PATH,
  CTA_BANK_PATH,
  HASHTAG_SETS_PATH,
  normalizeText,
  recordBankUsage,
  renderTemplate,
  selectCaptionTemplate,
  selectCta,
  selectHashtagSet,
  textSimilarity
} from "./marketing_banks.mjs";

await import("dotenv").then(({ config }) => {
  config();
  config({ path: ".env.local" });
}).catch(() => {});

const ENGINE_DIR = "strategy/automation/tiktok-instagram-slideshow-content-engine";
const SCHEMA_DIR = `${ENGINE_DIR}/schemas`;
const DEFAULT_OUTPUT_ROOT = "content/slideshows";
const DEFAULT_TOPIC_OUT = "outputs/daily";
const WATCH_STOLE_THE_RUN_HOOK_IMAGE = "content/slideshows/2026-04-26-watch-stole-the-run-8-slide/slides/source/01-hook.png";
const WATCH_ACCOUNT_LIFELONG_RUNNER_REFERENCE_IMAGE = "content/slideshows/visual-library/owned-source/watch-account-avatar/runner-watch-lab-lifelong-runner-v1-reference.png";
const ROAD_TO_MARATHON_FIT_REFERENCE_IMAGE = "content/slideshows/visual-library/owned-source/road-to-marathon-fit-avatar/road-to-marathon-fit-female-runner-v1-reference.png";
const ROAD_TO_MARATHON_FIT_SUPABASE_LIBRARY_MANIFEST = "content/slideshows/visual-library/supabase-marathon-library-manifest.json";
const DEFAULT_HOOK_REFERENCE_IMAGE = WATCH_STOLE_THE_RUN_HOOK_IMAGE;
const DEFAULT_HOOK_STYLE_REFERENCE_IMAGE = WATCH_STOLE_THE_RUN_HOOK_IMAGE;
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
const COMPACT_PUBLIC_MEDIA_DIR = "exports/tiktok-photo-slides";
const TARGET_AUDIENCE_BY_PROBLEM_TYPE = {
  "easy-run pace drift": "beginner runners / overpacers / easy-run runners",
  "zone-2 confusion": "zone 2 runners / beginner runners / overpacers",
  "heart-rate panic": "heart-rate runners / Apple Watch runners / Garmin runners",
  "watch-checking anxiety": "watch-checking runners / pace-anxious runners",
  "pace disbelief": "pace-focused runners / easy-run runners",
  "workout-racing": "intermediate runners / interval runners / overpacers",
  "metric setup confusion": "heart-rate zone runners / watch users",
  "beginner uncertainty": "beginner runners / returning runners",
  "data-without-coaching": "watch users / runners who want coaching",
  "comparison spiral": "beginner runners / confidence-building runners",
  "watch-buying confusion": "running watch buyers / Garmin and Apple Watch runners"
};
const COACHI_APP_CTA_TEXT = "I use Coachi to stay in my zone.";
const COACHI_APP_CTA_ASSET_IDS = [
  "coachi_cta_003_phone_image2_48min",
  "coachi_cta_004_watch_image2_52min",
  "coachi_cta_009_phone_forest_morning_44min",
  "coachi_cta_010_watch_forest_morning_39min",
  "coachi_cta_011_phone_lake_calm_47min",
  "coachi_cta_012_watch_lake_calm_35min",
  "coachi_cta_013_phone_mountain_morning_51min"
];
const SOFT_NON_COACHI_CTA_BY_PROBLEM_TYPE = {
  "easy-run pace drift": "Save this for your next easy run.",
  "zone-2 confusion": "Save this for your next easy run.",
  "heart-rate panic": "Save this before your next run.",
  "watch-checking anxiety": "Save this before your next run.",
  "pace disbelief": "Save this before judging one run.",
  "workout-racing": "Save this before your next workout.",
  "metric setup confusion": "Save this if zones feel random.",
  "beginner uncertainty": "Save this before your next run.",
  "data-without-coaching": "Save this before your next run.",
  "comparison spiral": "Save this before your next run.",
  "watch-buying confusion": "Save this before buying a running watch."
};
const MARATHON_FOLLOW_ALONG_CTAS = [
  {
    id: "marathon_cta_follow_week",
    class: "follow",
    text: "Follow week one of the build."
  },
  {
    id: "marathon_cta_save_plan",
    class: "save-bait",
    text: "Save this for your next training week."
  },
  {
    id: "marathon_cta_comment_day",
    class: "comment-bait",
    text: "What day would scare you most?"
  },
  {
    id: "marathon_cta_follow_progress",
    class: "follow",
    text: "Follow the six-month marathon build."
  },
  {
    id: "marathon_cta_comment_start",
    class: "comment-bait",
    text: "Would you start this week?"
  }
];
const MARATHON_HASHTAG_SETS = [
  {
    id: "marathon_hs_week1_01",
    tags: ["#running", "#marathontraining", "#beginnerrunner", "#runtok", "#runningjourney"]
  },
  {
    id: "marathon_hs_fit_01",
    tags: ["#runtok", "#runningprogress", "#marathonjourney", "#beginnerrunner", "#runmotivation"]
  },
  {
    id: "marathon_hs_week_01",
    tags: ["#running", "#weeklytraining", "#marathontraining", "#newrunner", "#trainingdiary"]
  },
  {
    id: "marathon_hs_real_01",
    tags: ["#runtok", "#realrunning", "#marathonprep", "#runningcommunity", "#beginnerfitness"]
  }
];
const MARATHON_CAPTION_TEMPLATES = [
  {
    id: "marathon_cap_journal_01",
    template: "{hook}\n\n{insight}\n\n{cta}"
  },
  {
    id: "marathon_cap_journal_02",
    template: "{hook}\n\nTrying to make this feel repeatable, not perfect.\n\n{cta}"
  },
  {
    id: "marathon_cap_journal_03",
    template: "{hook}\n\nThe win this week is showing up without turning every run into a test.\n\n{cta}"
  },
  {
    id: "marathon_cap_journal_04",
    template: "{hook}\n\nSix months is long enough to build this properly, if the early weeks stay honest.\n\n{cta}"
  }
];
const APPROVED_VISUAL_WORLDS = {
  forest: {
    visual_world: "forest",
    route_tag: "forest",
    lighting_family: "soft green morning forest light",
    background: "shaded forest running route with visible path depth",
    keywords: ["forest route", "green morning light", "trees", "path depth"],
    forbidden: ["lake", "lakeside", "large water background", "mountain backdrop", "track lane", "stadium", "gym", "treadmill", "city street"]
  },
  mountain: {
    visual_world: "mountain",
    route_tag: "mountain",
    lighting_family: "clear mountain morning light",
    background: "mountain running route with visible climb or ridge context",
    keywords: ["mountain route", "gradient", "open sky", "clear morning light"],
    forbidden: ["lake", "lakeside", "dense forest route", "track lane", "stadium", "gym", "treadmill", "city street"]
  },
  lake: {
    visual_world: "lake",
    route_tag: "lake",
    lighting_family: "calm lake daylight",
    background: "calm lakeside running path with visible water and route context",
    keywords: ["lake path", "water edge", "calm daylight", "open path"],
    allowed_background_context: ["mountain backdrop", "large hill backdrop"],
    forbidden: ["dense forest route", "track lane", "stadium", "gym", "treadmill", "city street"]
  }
};
const APPROVED_VISUAL_WORLD_IDS = new Set(Object.keys(APPROVED_VISUAL_WORLDS));

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
  node scripts/run_slideshow_pipeline.mjs --date 2026-04-27 --production --generate-openai-hook --tiktok-account watch --hook-variation-bank inputs/research/tiktok-watch-hook-variation-bank.json --no-schedule
  node scripts/run_slideshow_pipeline.mjs --date 2026-04-27 --production --generate-openai-hook --hook-reference-image content/slideshows/2026-04-26-watch-stole-the-run-8-slide/slides/source/01-hook.png
  node scripts/run_slideshow_pipeline.mjs --date 2026-04-27 --production --existing-packs-root outputs/full-loop/baseline-packs
  node scripts/run_slideshow_pipeline.mjs --date 2026-04-27 --production --topics-out outputs/full-loop/run/frozen-topic.json --use-existing-topics

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
Use --tiktok-account main for direct-public scheduling. Use --tiktok-account watch to generate Runner Watch Lab packs, then send them through slideshow:upload-both inbox handoff.
Use --upload-public-media to upload rendered slides to the marketing Supabase public bucket before building the Postiz schedule.`);
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

const SCHEMA_FOLDER_TOKENS = {
  top_5_mistakes_v1: "t5m",
  top_5_rules_v1: "t5r",
  myth_breaker_v1: "myth",
  myth_vs_truth_v1: "mvt",
  things_i_wish_i_knew_v1: "wish",
  how_to_fix_v1: "fix",
  q_and_a_comment_prompt_v1: "qa",
  runner_mistake_reframe_v1: "reframe",
  beginner_confidence_reset_v1: "beginner",
  easy_run_simple_tips_v1: "tips",
  data_is_not_coaching_v1: "data",
  founder_built_this_v1: "founder",
  before_after_coaching_v1: "before-after",
  app_demo_proof_v1: "app-demo",
  reddit_question_v1: "redditq"
};

function packSlugForCandidate(date, candidate) {
  const token = SCHEMA_FOLDER_TOKENS[candidate.schema] || slugify(candidate.format_id || candidate.schema || "fmt").slice(0, 14);
  return `${date}-${token}-${slugify(candidate.hook)}`;
}

function sentenceCase(value) {
  const text = String(value).trim();
  if (!text) return text;
  return `${text[0].toUpperCase()}${text.slice(1)}`;
}

function normalizeTextPosition(position) {
  return position === "bottom" ? "lower_middle" : (position || "lower_middle");
}

function canonicalWorldId(value, fallback = "forest") {
  const text = String(value || "").toLowerCase();
  if (/\bmountain\b|\bhill\b|\buphill\b|\bclimb\b|\bridge\b/.test(text)) return "mountain";
  if (/\blake\b|\briverside\b|\bwater\b|\bcoastal\b/.test(text)) return "lake";
  if (/\bforest\b|\btrail\b|\bwood\b|\btrees?\b/.test(text)) return "forest";
  return APPROVED_VISUAL_WORLD_IDS.has(fallback) ? fallback : "forest";
}

function detectedWorldId(value) {
  const text = String(value || "").toLowerCase();
  if (/\bmountain\b|\bhill\b|\buphill\b|\bclimb\b|\bridge\b/.test(text)) return "mountain";
  if (/\blake\b|\briverside\b|\bwater\b|\bcoastal\b/.test(text)) return "lake";
  if (/\bforest\b|\btrail\b|\bwood\b|\btrees?\b/.test(text)) return "forest";
  return null;
}

function approvedWorldDetails(value, fallback = "forest") {
  return APPROVED_VISUAL_WORLDS[canonicalWorldId(value, fallback)];
}

function themeTextMatchesWorld(theme, visualWorld) {
  const detectedWorld = detectedWorldId([
    theme.background,
    ...(theme.visual_keywords || [])
  ].filter(Boolean).join(" "));
  return !detectedWorld || detectedWorld === visualWorld;
}

function worldAlignedThemeFields(theme, world) {
  if (themeTextMatchesWorld(theme, world.visual_world)) {
    return {
      background: theme.background,
      first_image_prompt_adaptation: theme.first_image_prompt_adaptation,
      visual_keywords: theme.visual_keywords
    };
  }

  return {
    background: world.background,
    first_image_prompt_adaptation: `runner in a believable ${world.visual_world} running moment with clean negative space for overlay text`,
    visual_keywords: [...world.keywords, "clean overlay space"]
  };
}

function supportVisualCollectionForWorld(visualWorld) {
  const world = canonicalWorldId(visualWorld);
  if (world === "mountain") return "hills_effort";
  if (world === "lake") return "lake_calm";
  return "nature_context";
}

function visualCollectionForWorld(visualWorld, schemaSlide, slideNumber, finalSlideNumber, accountProfile = null) {
  if ((accountProfile === "marathon" || schemaSlide.account_profile === "marathon") && slideNumber === finalSlideNumber) {
    return supportVisualCollectionForWorld(visualWorld);
  }
  if (slideNumber === 1 || slideNumber === finalSlideNumber || schemaSlide.role === "cta") {
    return schemaSlide.visual_collection || null;
  }
  return supportVisualCollectionForWorld(visualWorld);
}

const AVATAR_VARIATIONS = [
  {
    id: "black_singlet_black_shorts_three_quarter",
    watch: "selected visible Apple Watch-style or Garmin-style running watch",
    top: "black lightweight running singlet",
    headwear: "no hat",
    eyewear: "no glasses",
    shorts: "black 5-inch split shorts",
    angle: "medium-close three-quarter post-run action angle",
    expression: "controlled post-run relief, mouth slightly open from breathing, eyes still focused",
    weather: "clear mild morning",
    lighting: "soft golden-hour side light"
  },
  {
    id: "navy_long_sleeve_charcoal_side_no_headwear",
    watch: "selected visible Apple Watch-style or Garmin-style running watch",
    top: "navy fitted long-sleeve performance shirt",
    headwear: "no headwear",
    eyewear: "no glasses",
    shorts: "charcoal running shorts",
    angle: "side-tracking action angle with natural arm swing",
    expression: "steady concentration with relaxed jaw, not smiling at the camera",
    weather: "cool overcast morning",
    lighting: "soft diffused daylight"
  },
  {
    id: "charcoal_tee_black_shorts_side_back_no_headwear",
    watch: "selected visible Apple Watch-style or Garmin-style running watch",
    top: "charcoal fitted performance t-shirt",
    headwear: "no headwear",
    eyewear: "no glasses",
    shorts: "black running shorts",
    angle: "side/back angle with the face partially visible and consistent",
    expression: "quiet effort with a slight squint and natural breathing",
    weather: "dry windy afternoon",
    lighting: "clean natural daylight"
  },
  {
    id: "black_short_sleeve_black_shorts_warm_evening",
    watch: "selected visible Apple Watch-style or Garmin-style running watch",
    top: "black fitted short-sleeve running shirt",
    headwear: "no hat",
    eyewear: "no glasses",
    shorts: "black 5-inch running shorts",
    angle: "waist-up cooldown angle on the selected route",
    expression: "calm tired relief after the run, subtle half-smile allowed",
    weather: "warm dry evening",
    lighting: "warm golden-hour light"
  },
  {
    id: "shirtless_black_shorts_real_run_warm_weather",
    watch: "selected visible Apple Watch-style or Garmin-style running watch",
    top: "shirtless warm-weather running look",
    headwear: "no headwear",
    eyewear: "no glasses",
    shorts: "black 5-inch running shorts",
    angle: "medium-close real running or cooldown angle, not a posed fitness shoot",
    expression: "focused strain with controlled breathing, not a beauty pose",
    weather: "warm dry training conditions",
    lighting: "warm natural daylight"
  },
  {
    id: "shirtless_black_shorts_mountain_effort_close",
    watch: "selected visible Apple Watch-style or Garmin-style running watch",
    top: "shirtless mountain-effort running look with believable sweat",
    headwear: "no headwear",
    eyewear: "no glasses",
    shorts: "black split shorts",
    angle: "tight three-quarter uphill running angle with natural arm drive, not a model pose",
    expression: "determined uphill effort, slightly tense brow, no exaggerated grimace",
    weather: "warm clear mountain morning",
    lighting: "clear natural morning light"
  },
  {
    id: "shirtless_charcoal_shorts_lake_cooldown",
    watch: "selected visible Apple Watch-style or Garmin-style running watch",
    top: "shirtless post-run cooldown look with realistic sweat",
    headwear: "no headwear",
    eyewear: "no glasses",
    shorts: "charcoal 5-inch running shorts",
    angle: "waist-up walking cooldown angle with relaxed shoulders and route visible",
    expression: "post-run relief with breathing settling, grounded and human",
    weather: "warm calm lake daylight",
    lighting: "soft warm daylight"
  },
  {
    id: "shirtless_dark_green_shorts_forest_stride",
    watch: "selected visible Apple Watch-style or Garmin-style running watch",
    top: "shirtless forest-run look with natural sweat and real running posture",
    headwear: "no headwear",
    eyewear: "no glasses",
    shorts: "dark green trail shorts",
    angle: "side-tracking trail stride with face partly visible and stable identity",
    expression: "alert trail focus with subtle fatigue, eyes on the route",
    weather: "warm humid forest morning",
    lighting: "filtered forest sunlight"
  },
  {
    id: "black_tee_charcoal_shorts_trail_headband",
    watch: "selected visible Apple Watch-style or Garmin-style running watch",
    top: "black fitted short-sleeve running shirt",
    headwear: "thin black running headband",
    eyewear: "no glasses",
    shorts: "charcoal split shorts",
    angle: "low three-quarter trail angle with stable natural stride",
    expression: "grounded concentration after rain, lips parted slightly from effort",
    weather: "crisp morning after light rain",
    lighting: "soft early sunlight"
  },
  {
    id: "olive_singlet_navy_shorts_side_no_headwear",
    watch: "selected visible Apple Watch-style or Garmin-style running watch",
    top: "olive sleeveless running top",
    headwear: "no headwear",
    eyewear: "no glasses",
    shorts: "navy running shorts",
    angle: "slightly wider side angle with visible route depth",
    expression: "calm steady effort, neutral determined face, no camera smile",
    weather: "sunny but mild",
    lighting: "bright natural morning light"
  },
  {
    id: "black_long_sleeve_black_shorts_close",
    watch: "selected visible Apple Watch-style or Garmin-style running watch",
    top: "black lightweight long-sleeve running shirt",
    headwear: "no hat",
    eyewear: "no glasses",
    shorts: "black split shorts",
    angle: "tight medium-close cooldown frame, chest to waist",
    expression: "tired-but-composed cooldown look, exhale visible in posture",
    weather: "cool clear day",
    lighting: "clean low-angle sunlight"
  },
  {
    id: "dark_burgundy_tee_black_shorts_controlled_effort_no_headwear",
    watch: "selected visible Apple Watch-style or Garmin-style running watch",
    top: "dark burgundy breathable running t-shirt",
    headwear: "no headwear",
    eyewear: "no glasses",
    shorts: "black trail shorts",
    angle: "side angle on the selected route with controlled effort",
    expression: "focused eyes and controlled effort, serious without looking angry",
    weather: "dry mild morning",
    lighting: "soft cinematic daylight"
  }
];

const SHIRTLESS_HOOK_IMAGE_RATE = 50;
const CLOTHING_ROTATION_POLICY = "50/50 stable hash split between shirtless and clothed hook images";
const EYEWEAR_DISABLED = true;
const WATCH_ROTATION_POLICY = "visible watch on every hook image, stable 50/50 rotation between Apple Watch-style and Garmin-style running watches";
const MARATHON_WORKOUT_CATEGORIES = new Set([
  "workout",
  "workout_recap",
  "easy_run",
  "long_run",
  "strength",
  "intervals",
  "recovery_run"
]);
const MARATHON_SUPPORT_CATEGORIES = new Set([
  "food",
  "health",
  "body",
  "apps",
  "shoes",
  "watches",
  "gear",
  "weekly_plan",
  "progress",
  "journey",
  "recovery",
  "routine"
]);
const MARATHON_WORKOUT_WARDROBES = [
  {
    id: "day_01_teal_tee_black_shorts",
    top: "teal breathable short-sleeve running shirt",
    shorts: "black mid-rise running shorts",
    headwear: "no headwear",
    outfit_note: "day 1 workout outfit, teal top and black shorts"
  },
  {
    id: "day_02_coral_singlet_navy_shorts",
    top: "coral lightweight running singlet",
    shorts: "navy running shorts",
    headwear: "thin navy running headband",
    outfit_note: "day 2 workout outfit, coral singlet and navy shorts"
  },
  {
    id: "day_03_lavender_long_sleeve_charcoal_shorts",
    top: "lavender lightweight long-sleeve running top",
    shorts: "charcoal running shorts",
    headwear: "no headwear",
    outfit_note: "day 3 workout outfit, lavender long sleeve and charcoal shorts"
  },
  {
    id: "day_04_white_tee_forest_green_shorts",
    top: "white technical running t-shirt",
    shorts: "forest green trail shorts",
    headwear: "small black running cap",
    outfit_note: "day 4 workout outfit, white tee and green trail shorts"
  },
  {
    id: "day_05_maroon_tee_black_tights",
    top: "maroon breathable running t-shirt",
    shorts: "black cropped running tights",
    headwear: "no headwear",
    outfit_note: "day 5 workout outfit, maroon tee and black cropped tights"
  },
  {
    id: "day_06_sky_blue_singlet_gray_shorts",
    top: "sky blue running singlet",
    shorts: "light gray running shorts",
    headwear: "thin white running headband",
    outfit_note: "day 6 workout outfit, blue singlet and gray shorts"
  },
  {
    id: "day_07_black_tee_plum_shorts",
    top: "black fitted technical running shirt",
    shorts: "plum running shorts",
    headwear: "no headwear",
    outfit_note: "day 7 workout outfit, black tee and plum shorts"
  }
];
const MARATHON_SUPPORT_WARDROBES = [
  {
    id: "food_cream_tee_olive_shorts",
    categories: ["food", "health", "routine"],
    top: "cream technical running t-shirt",
    shorts: "olive running shorts",
    headwear: "no headwear",
    outfit_note: "food or health support outfit, cream tee and olive shorts"
  },
  {
    id: "body_mint_long_sleeve_black_shorts",
    categories: ["body", "health", "recovery"],
    top: "mint lightweight long-sleeve running top",
    shorts: "black running shorts",
    headwear: "no headwear",
    outfit_note: "body or recovery support outfit, mint long sleeve and black shorts"
  },
  {
    id: "apps_gray_tee_blue_shorts",
    categories: ["apps", "watches"],
    top: "soft gray technical running t-shirt",
    shorts: "blue running shorts",
    headwear: "thin black running headband",
    outfit_note: "apps or watch support outfit, gray tee and blue shorts"
  },
  {
    id: "shoes_yellow_singlet_black_shorts",
    categories: ["shoes", "gear"],
    top: "muted yellow running singlet",
    shorts: "black running shorts",
    headwear: "no headwear",
    outfit_note: "shoe or gear support outfit, yellow singlet and black shorts"
  },
  {
    id: "progress_navy_tee_gray_tights",
    categories: ["progress", "weekly_plan", "journey"],
    top: "navy breathable running t-shirt",
    shorts: "gray cropped running tights",
    headwear: "no headwear",
    outfit_note: "planning or progress support outfit, navy tee and gray cropped tights"
  }
];
const WATCH_VARIATIONS = [
  {
    id: "apple_watch_style",
    label: "visible Apple Watch-style smartwatch on one wrist",
    brand_family: "Apple Watch",
    detail_rule: "rectangular Apple Watch-style running watch silhouette, small in-frame, no readable screen UI, no Apple logo, no watch-checking pose, never a wrist close-up"
  },
  {
    id: "garmin_style",
    label: "visible Garmin-style GPS running watch on one wrist",
    brand_family: "Garmin",
    detail_rule: "round Garmin-style GPS running watch silhouette, small in-frame, no readable screen UI, no Garmin logo, no watch-checking pose, never a wrist close-up"
  }
];

const HOOK_COMPOSITIONS = [
  {
    id: "watch_comparison_selfie_starter",
    label: "watch comparison selfie starter",
    allowed_phases: ["pre_workout", "post_workout"],
    requires_watch_comparison: true,
    camera_distance: "arm-length runner selfie frame",
    camera_height: "handheld phone selfie height, slightly above eye line",
    lens_feel: "front-camera TikTok creator selfie with natural wide phone perspective",
    subject_scale: "runner face, upper torso, and watch-side forearm fill 45-60% of frame without blocking text",
    face_visibility: "face visible like a real runner selfie, natural and slightly imperfect",
    movement_state: "runner holding the phone before or after a run with the watch-side wrist naturally visible in frame",
    negative_space_zone: "upper side sky, trail, forest, lake, or mountain background away from face and watch",
    background_depth: "selected route world stays visible behind the selfie so it is not a plain portrait",
    watch_comparison_rule: "For watch-comparison hooks only, the selected watch can be clearly visible in the lower foreground of the selfie, but the image must remain a runner selfie, not a wrist-only macro close-up. No readable screen UI, no brand logo, no fake watch ad pose, and no watch-checking pose.",
    direction: "start watch-comparison decks with a realistic runner selfie where the running watch is clearly visible near the lower foreground, but never as a wrist-only close-up; keep the selected route world visible behind him"
  },
  {
    id: "wide_back_view_route_first",
    label: "wide back-view route-first frame",
    allowed_phases: ["during_workout", "pre_workout"],
    camera_distance: "wide full-body frame",
    camera_height: "standing phone or small tripod at chest height",
    lens_feel: "natural 24-28mm phone wide lens",
    subject_scale: "runner fills only 20-30% of the frame",
    face_visibility: "face mostly hidden or only a small profile; identity carried by build, hair, kit, and movement",
    movement_state: "easy controlled running away from camera",
    negative_space_zone: "upper third and path foreground, not across the runner's face",
    background_depth: "strong route depth inside the selected visual world",
    direction: "show the runner from behind or back three-quarter, with the route and environment doing more of the storytelling than the face"
  },
  {
    id: "low_ground_stride",
    label: "low ground stride frame",
    allowed_phases: ["during_workout"],
    camera_distance: "low full-body or knees-to-head frame",
    camera_height: "phone placed low near the path",
    lens_feel: "slightly wide phone lens with realistic motion",
    subject_scale: "runner crosses 35-45% of the frame",
    face_visibility: "face can be partial, side-facing, or motion-softened; do not make it a beauty portrait",
    movement_state: "mid-stride passing the camera",
    negative_space_zone: "top half or side of frame, away from legs",
    background_depth: "path texture and selected-world detail visible behind the stride",
    direction: "make it feel like a phone propped on the ground during a real run, not a planned ad shoot"
  },
  {
    id: "cropped_legs_and_path",
    label: "cropped legs and route texture",
    allowed_phases: ["during_workout"],
    camera_distance: "tight lower-body crop",
    camera_height: "low phone angle near shoe height",
    lens_feel: "creator-style phone capture, slight motion realism",
    subject_scale: "legs and shoes dominate 45-55% of frame",
    face_visibility: "no face visible",
    movement_state: "steady easy-run stride",
    negative_space_zone: "upper half over route/world detail",
    background_depth: "surface, path, and selected-world cues must be clear",
    direction: "show only the runner's lower body and the route; use this when the slideshow should feel less like the same avatar portrait"
  },
  {
    id: "over_shoulder_route_decision",
    label: "over-shoulder route decision",
    allowed_phases: ["pre_workout", "during_workout"],
    camera_distance: "medium-wide from behind the shoulder",
    camera_height: "natural eye-height phone angle",
    lens_feel: "handheld phone realism",
    subject_scale: "runner shoulder/back fills 25-35% of frame",
    face_visibility: "face not visible or barely side-visible",
    movement_state: "looking down the route, about to start or settling into effort",
    negative_space_zone: "open route ahead or sky/tree gap",
    background_depth: "clear route line inside the selected visual world",
    direction: "place the viewer behind the runner, as if deciding whether to keep the run easy"
  },
  {
    id: "far_environment_runner",
    label: "far environment runner frame",
    allowed_phases: ["during_workout"],
    camera_distance: "very wide environmental frame",
    camera_height: "distant phone/tripod or friend-filmed angle",
    lens_feel: "documentary phone wide shot",
    subject_scale: "runner is small, around 10-18% of frame",
    face_visibility: "face not readable",
    movement_state: "small figure moving through the selected world",
    negative_space_zone: "large natural negative space in sky, trail, trees, or lake edge",
    background_depth: "environment dominates without becoming generic wallpaper",
    direction: "make the selected world feel big and specific while the runner remains a real human scale point"
  },
  {
    id: "side_tracking_messy_creator",
    label: "side-tracking messy creator frame",
    allowed_phases: ["during_workout"],
    camera_distance: "medium full-body side frame",
    camera_height: "handheld or chest-height phone",
    lens_feel: "slightly imperfect creator capture",
    subject_scale: "runner fills 35-45% of frame",
    face_visibility: "side profile partly visible with natural effort",
    movement_state: "steady stride across frame",
    negative_space_zone: "opposite side of the frame from runner movement",
    background_depth: "route continues behind the runner in the selected world",
    direction: "use a side motion frame with imperfect timing, not a frozen heroic pose"
  },
  {
    id: "post_run_sitting_route_edge",
    label: "post-run sitting route-edge frame",
    allowed_phases: ["post_workout"],
    camera_distance: "medium-wide seated frame",
    camera_height: "phone on ground or low rock/bench height",
    lens_feel: "real post-run phone capture",
    subject_scale: "runner fills 25-40% of frame",
    face_visibility: "face can be three-quarter, tired, sweaty, and human",
    movement_state: "seated or crouched recovery, breathing settling",
    negative_space_zone: "open route/world area above or beside runner",
    background_depth: "selected world visible as the place the run happened",
    direction: "show the runner recovering at the route edge, not posing like a fitness ad"
  },
  {
    id: "hands_on_knees_recovery",
    label: "hands-on-knees recovery frame",
    allowed_phases: ["post_workout"],
    camera_distance: "medium frame from front-side or side",
    camera_height: "slightly low phone angle",
    lens_feel: "raw creator capture with realistic sweat",
    subject_scale: "runner fills 35-50% of frame",
    face_visibility: "face partly visible, looking down or sideways, not smiling at camera",
    movement_state: "bent forward after effort, breathing calming",
    negative_space_zone: "top third or side background",
    background_depth: "route and world still legible",
    direction: "show the honest after-run moment: controlled fatigue, not a victory pose"
  },
  {
    id: "forest_between_trees",
    label: "forest between-trees frame",
    allowed_phases: ["during_workout", "pre_workout"],
    worlds: ["forest"],
    camera_distance: "wide to medium-wide frame",
    camera_height: "hidden phone/tripod between trees",
    lens_feel: "observational phone capture",
    subject_scale: "runner fills 20-35% of frame",
    face_visibility: "face small, side/back view preferred",
    movement_state: "moving through the forest path naturally",
    negative_space_zone: "tree gap or path gap, not a blank poster block",
    background_depth: "layered forest path depth",
    direction: "shoot through trees or foliage so the image feels found and specific to the forest world"
  },
  {
    id: "lake_edge_back_view",
    label: "lake edge back-view frame",
    allowed_phases: ["pre_workout", "during_workout", "post_workout"],
    worlds: ["lake"],
    camera_distance: "wide or medium-wide back-view frame",
    camera_height: "eye-height or low shoreline phone angle",
    lens_feel: "clean but not glossy phone capture",
    subject_scale: "runner fills 18-32% of frame",
    face_visibility: "face hidden or tiny profile",
    movement_state: "running beside the lake, standing before the run, or cooling down",
    phase_movement_state: {
      pre_workout: "standing naturally before the run starts, facing the lake route from behind",
      during_workout: "running beside the lake at controlled easy effort",
      post_workout: "cooling down beside the lake after the run"
    },
    negative_space_zone: "water/sky/shoreline area with natural contrast",
    background_depth: "lake is primary; mountains or hills may sit far in the background",
    direction: "make the lake world obvious, with the runner from behind so it does not feel like another avatar portrait"
  },
  {
    id: "mountain_uphill_back_three_quarter",
    label: "mountain uphill back three-quarter",
    allowed_phases: ["during_workout"],
    worlds: ["mountain"],
    camera_distance: "medium-wide uphill frame",
    camera_height: "low-to-mid trail angle",
    lens_feel: "documentary trail-run phone capture",
    subject_scale: "runner fills 25-40% of frame",
    face_visibility: "mostly back or side profile; no front-facing pose",
    movement_state: "controlled uphill effort",
    negative_space_zone: "sky, ridge, or trail side away from runner",
    background_depth: "mountain gradient clearly explains effort",
    direction: "show gradient and restraint: the hill matters more than the runner posing"
  },
  {
    id: "reflection_or_shadow_detail",
    label: "reflection or shadow detail",
    allowed_phases: ["pre_workout", "during_workout", "post_workout"],
    camera_distance: "detail-led frame with runner partly indirect",
    camera_height: "low phone angle near ground, water, or wet path",
    lens_feel: "specific creator detail shot",
    subject_scale: "runner body can be partial or reflected; environment fills the frame",
    face_visibility: "no direct face required",
    movement_state: "subtle movement, shadow, reflection, or passing stride",
    negative_space_zone: "natural open area in reflection, path, sky, or tree gap",
    background_depth: "selected visual world must still be identifiable",
    direction: "use reflection, shadow, or partial body detail to break the repeated full-runner look"
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

const WORKOUT_PHASE_BY_PROBLEM_TYPE = {
  "zone-2 confusion": "during_workout",
  "heart-rate panic": "during_workout",
  "watch-checking anxiety": "during_workout",
  "pace disbelief": "during_workout",
  "easy-run pace drift": "during_workout",
  "data-without-coaching": "post_workout",
  "workout-racing": "post_workout",
  "metric setup confusion": "pre_workout",
  "exercise-ring frustration": "post_workout",
  "comparison spiral": "post_workout",
  "beginner uncertainty": "pre_workout",
  "watch-buying confusion": "pre_workout",
  // Personal Marathon journal categories retain their real training moment
  // instead of falling back to a hash-selected phase.
  easy_run: "during_workout",
  food: "pre_workout",
  strength: "post_workout",
  recovery: "post_workout",
  shoes: "post_workout",
  hills: "during_workout"
};

function workoutPhaseById(phaseId) {
  return WORKOUT_PHASES.find((phase) => phase.id === phaseId) || WORKOUT_PHASES[0];
}

function coherentWeatherForLighting(lightingFamily, fallback) {
  const lower = String(lightingFamily || "").toLowerCase();
  if (/overcast|diffused/.test(lower)) return "cool overcast conditions";
  if (/late afternoon|golden|low-angle|evening/.test(lower)) return "dry mild late-afternoon conditions";
  if (/morning|green|soft/.test(lower)) return "fresh mild morning conditions";
  if (/indoor|gym/.test(lower)) return "controlled indoor training conditions";
  if (/bright|clear/.test(lower)) return "clear dry training conditions";
  return fallback || "mild realistic running conditions";
}

function compileAvatarVariationForTheme(avatarVariation, theme) {
  return {
    ...avatarVariation,
    weather: coherentWeatherForLighting(theme.lighting_family, avatarVariation.weather),
    lighting: theme.lighting_family || avatarVariation.lighting
  };
}

function promptConflictPatternsForPhase(phaseId) {
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

function buildPromptCompilerReport({ candidate, theme, workoutPhase, avatarVariation, hookComposition }) {
  const textToCheck = [
    theme.background,
    theme.vibe,
    theme.first_image_prompt_adaptation,
    workoutPhase.moment,
    workoutPhase.prompt_cue,
    avatarVariation.weather,
    avatarVariation.lighting,
    hookComposition?.direction,
    hookComposition?.movement_state
  ].filter(Boolean).join("\n");
  const conflicts = promptConflictPatternsForPhase(workoutPhase.id)
    .filter((pattern) => pattern.test(textToCheck))
    .map((pattern) => pattern.source);
  return {
    version: 1,
    source_of_truth: "strategy/automation/tiktok-instagram-slideshow-content-engine/SOURCE_OF_TRUTH_X_ARTICLE.md",
    selected_by: WORKOUT_PHASE_BY_PROBLEM_TYPE[candidate.problem_type] ? "problem_type_mapping" : "stable_hash_fallback",
    coherence_status: conflicts.length === 0 ? "passed" : "failed",
    conflict_patterns: conflicts,
    checks: [
      "single workout phase selected before prompt generation",
      "avatar lighting normalized to deck lighting family",
      "weather normalized to selected lighting family",
      "reference image background locked out of generated avatar world",
      "hook image remains slide-1-only",
      "hook composition selected independently from wardrobe and workout phase",
      "Road to Marathon Fit workout posts use a training-day outfit key when account_profile is marathon",
      "composition controls camera distance, face visibility, subject scale, and negative-space zone",
      "do not repeat centered medium-close hero framing unless the selected composition asks for it",
      "base image remains text-free for local Sharp/Canvas overlay"
    ]
  };
}

function backgroundWorldLockForTheme(theme) {
  const world = approvedWorldDetails(theme.visual_world || theme.background);
  const visualWorld = world.visual_world;
  const background = String(theme.background || world.background).trim();
  return {
    selected_visual_world: visualWorld,
    required_background: background,
    reference_background_policy: "Reference image controls runner appearance only; its original background is non-transferable.",
    generated_background_rule: `Generate a new ${visualWorld} background that matches the deck visual world and lighting family.`,
    allowed_background_context: world.allowed_background_context || [],
    forbidden_background_elements: world.forbidden
  };
}

function adaptThemeForWorkoutPhase(theme, workoutPhase) {
  if (workoutPhase.id === "pre_workout") {
    return {
      ...theme,
      background: String(theme.background || "quiet outdoor running route").replace(/after (a )?(workout|run|intervals)/gi, "before an easy run"),
      vibe: String(theme.vibe || "calm realistic training").replace(/post[- ]?workout|post[- ]?run|cooldown/gi, "pre-run"),
      first_image_prompt_adaptation: "pre-run preparation moment: the runner is warming up naturally near the selected route, calm and ready, not posing"
    };
  }
  if (workoutPhase.id === "during_workout") {
    return {
      ...theme,
      first_image_prompt_adaptation: String(theme.first_image_prompt_adaptation || "runner moving naturally during the session")
        .replace(/post[- ]?run|post[- ]?workout|cool(?:ing)? down|just finished/gi, "during-run")
        .replace(/pre[- ]?workout|before starting/gi, "during-run")
    };
  }
  if (workoutPhase.id === "post_workout") {
    return {
      ...theme,
      first_image_prompt_adaptation: String(theme.first_image_prompt_adaptation || "sweaty runner cooling down after a controlled session")
        .replace(/preparing before|before starting|warmup movement/gi, "cooling down after")
    };
  }
  return theme;
}

function stableHash(value) {
  let hash = 0;
  for (const char of String(value)) {
    hash = ((hash << 5) - hash) + char.charCodeAt(0);
    hash |= 0;
  }
  return Math.abs(hash);
}

function isMarathonAccountPack(candidate = {}, tiktokAccount = null) {
  const accountProfile = tiktokAccountProfile(tiktokAccount).profile;
  return accountProfile === "marathon" || candidate.account_profile === "marathon";
}

function pickStaticEntry(entries, seed, predicate = null) {
  const list = entries || [];
  if (list.length === 0) return null;
  const start = stableHash(seed) % list.length;
  for (let offset = 0; offset < list.length; offset += 1) {
    const entry = list[(start + offset) % list.length];
    if (!predicate || predicate(entry)) return entry;
  }
  return list[start];
}

function shouldUseCoachiAppCta({ slug, candidate, tiktokAccount = null }) {
  if (candidate.coachi_app_cta_allowed === false) return false;
  if (isMarathonAccountPack(candidate, tiktokAccount)) {
    // Marathon promotion is opt-in per story so the account stays a journal,
    // while an earned mid-run Coachi moment can still be rendered honestly.
    return candidate.coachi_app_cta_allowed === true;
  }
  const seed = [
    slug,
    candidate.problem_id,
    candidate.problem_type,
    candidate.hook,
    "coachi_app_cta_v1"
  ].filter(Boolean).join("|");
  return stableHash(seed) % 10 < 7;
}

function softNonCoachiCtaText(candidate, text) {
  if (!/\bcoachi\b/i.test(String(text || ""))) return text;
  return SOFT_NON_COACHI_CTA_BY_PROBLEM_TYPE[candidate?.problem_type] || "Save this before your next run.";
}

function isWatchComparisonCandidate(candidate = {}) {
  const text = [
    candidate.problem_type,
    candidate.hook,
    candidate.schema,
    candidate.exact_words,
    candidate.watch_or_app_context,
    candidate.source_url,
    candidate.problem,
    candidate.content_angle,
    candidate.product_angle
  ].filter(Boolean).join(" ").toLowerCase();

  if (candidate.problem_type === "watch-buying confusion") return true;
  const hasWatchContext = /\b(garmin|apple watch|fitbit|polar|coros|suunto|whoop|watch|running watch)\b/.test(text);
  const hasComparisonIntent = /\b(vs|versus|compare|comparison|which|buy|buying|choose|choice|switch|upgrade|best|worth it|right for you|expensive|cheap)\b/.test(text);
  return hasWatchContext && hasComparisonIntent;
}

function pickWatchVariation(candidate) {
  const text = [
    candidate.problem_id,
    candidate.problem_type,
    candidate.hook,
    candidate.schema,
    candidate.exact_words,
    candidate.watch_or_app_context,
    candidate.source_url
  ].filter(Boolean).join("|").toLowerCase();

  if (/\bgarmin\b|\bconnect iq\b/.test(text)) {
    return WATCH_VARIATIONS.find((watch) => watch.id === "garmin_style") || WATCH_VARIATIONS[0];
  }
  if (/\bapple\s*watch\b|\bios\b/.test(text)) {
    return WATCH_VARIATIONS.find((watch) => watch.id === "apple_watch_style") || WATCH_VARIATIONS[0];
  }

  const seed = [
    candidate.problem_id,
    candidate.problem_type,
    candidate.hook,
    candidate.schema,
    "watch_rotation_v1"
  ].filter(Boolean).join("|");
  return WATCH_VARIATIONS[stableHash(seed) % WATCH_VARIATIONS.length];
}

function watchDetailRuleForCandidate(candidate, watchVariation) {
  if (!isWatchComparisonCandidate(candidate)) return watchVariation.detail_rule;
  return `${watchVariation.detail_rule}. For watch-comparison hooks, use a natural runner selfie where the selected watch is clearly visible on the watch-side wrist or forearm in the lower foreground, but never as a wrist-only macro close-up. No readable screen UI, no visible brand logo, no fake watch ad pose, and no watch-checking pose.`;
}

function avatarIdentityProfileForAccount(tiktokAccount = null) {
  let profile = "main";
  try {
    profile = tiktokAccountProfile(tiktokAccount).profile;
  } catch {
    profile = "main";
  }

  if (profile === "watch") {
    return {
      profile,
      identity_id: "runner_watch_lab_lifelong_runner_v1",
      reference_image: WATCH_ACCOUNT_LIFELONG_RUNNER_REFERENCE_IMAGE,
      style_reference_image: null,
      identity_prompt: "photorealistic male lifelong runner, early-to-mid 40s, age 42-48, lean durable endurance-athlete build, weathered but healthy face, subtle smile lines and sun texture, short dark hair with slight grey at the temples, calm experienced runner presence, natural sweat, technical running kit or realistic shirtless warm-weather running look, visible Apple Watch-style or Garmin-style running watch on one wrist, real outdoor running moment",
      brand_anchor_prompt: "photorealistic experienced male runner in his 40s, lifelong runner, lean durable endurance build, masculine, sun-weathered tan complexion, short dark hair with subtle grey at the temples, steady confident runner expression, natural sweat, selected wardrobe category from the 50/50 clothing rotation, visible Apple Watch-style or Garmin-style running watch on one wrist, selected visual world environment, believable TikTok-native running creator aesthetic",
      stable_traits: [
        "use an older lifelong runner identity for the watch-focused account",
        "male runner, early-to-mid 40s, age 42-48",
        "lean durable endurance-athlete build, not bulky and not model-polished",
        "sun-weathered tan complexion with subtle smile lines and realistic skin texture",
        "short dark slightly textured hair with a small amount of grey at the temples",
        "calm experienced runner presence, like someone who has run for decades",
        "the face must be visible enough to read the mature Runner Watch Lab identity on hook images",
        "identity must carry through face, build, posture, efficient stride, kit, watch, and veteran runner energy",
        "realistic sweat and outdoor running texture",
        "technical running tops and shirtless warm-weather looks rotate with a 50/50 target",
        "shirtless images are allowed only when they read like real training, not model posing",
        "no glasses, sunglasses, or sport eyewear for now",
        "visible Apple Watch-style or Garmin-style running watch on one wrist, small and natural, no readable UI or logos",
        "natural outdoor running context"
      ],
      variation_policy: "Use this as the Runner Watch Lab avatar: an experienced male runner in his 40s who looks like he has been running his whole life. He should feel credible, durable, calm, and slightly weathered, not like a young fitness model or generic ad thumbnail. Do not use the 2026-04-26 watch-stole-the-run runner as a style, face, body, pose, or age reference for the watch account. Rotate route, weather, light, camera angle, crop distance, subject scale, expression, shirtless/clothed kit, and Apple Watch/Garmin-style watch type per pack. Keep the mature face visible enough to verify identity. Keep shirtless images athletic, runner-realistic, and non-sexual. Default to no headwear. Eyewear is disabled for now: no glasses, sunglasses, sport eyewear, or clear lenses.",
      reference_instruction: "Use only the Runner Watch Lab lifelong-runner reference as the identity reference. Do not use or imitate the 2026-04-26 watch-stole-the-run runner, younger face, hands-on-hips pose, centered hero crop, or original background."
    };
  }

  if (profile === "marathon") {
    return {
      profile,
      identity_id: "road_to_marathon_fit_female_runner_v1",
      reference_image: ROAD_TO_MARATHON_FIT_REFERENCE_IMAGE,
      style_reference_image: null,
      identity_prompt: "photorealistic fictional adult female beginner runner, late 20s to early 30s, realistic non-elite beginner build, natural warm face, brown hair tied back, relatable marathon-training journey energy, realistic sweat, modest simple technical running kit, visible Apple Watch-style or Garmin-style running watch on one wrist, real outdoor running moment",
      brand_anchor_prompt: "photorealistic fictional female beginner runner training for a marathon, realistic beginner build, natural face, brown hair tied back, modest simple technical running kit, visible Apple Watch-style or Garmin-style running watch on one wrist, honest running effort, tired-but-happy post-workout satisfaction when appropriate, selected forest/mountain/lake route world, believable TikTok-native marathon journal aesthetic",
      stable_traits: [
        "use the Road to Marathon Fit female runner identity for the marathon account",
        "fictional adult woman, late 20s to early 30s",
        "realistic non-elite beginner-runner build, not model-polished",
        "natural warm face and brown hair tied back",
        "relatable marathon-training journey energy",
        "realistic sweat, flushed face, and honest effort when during or after workouts",
        "emotion can rotate between nervous, focused, tired, happy, satisfied, and proud",
        "face may be visible on slide 1 hook images, but supporting slides must use Pinterest/Supabase library assets",
        "modest athletic styling, no glamour pose, extreme transformation, or fake before-after framing",
        "visible Apple Watch-style or Garmin-style running watch on one wrist, small and natural, no readable UI or logos",
        "natural outdoor running context in forest, mountain, or lake only"
      ],
      variation_policy: "Use this as the Road to Marathon Fit avatar: a fictional female beginner runner starting a six-month marathon build. She should sometimes look tired, sweaty, and post-workout happy or satisfied, not always polished. Keep body changes subtle over time; do not create dramatic transformation claims. Rotate forest, mountain, and lake worlds; rotate pre-workout, during-workout, and post-workout moments; keep the runner relatable, modest, and training-focused. Do not use the main Coachi male runner or Runner Watch Lab male runner as style, face, body, pose, or age reference.",
      reference_instruction: "Use only the Road to Marathon Fit female-runner reference as the identity reference. Do not use or imitate the main Coachi male runner, the Runner Watch Lab male runner, their faces, body types, poses, or original backgrounds."
    };
  }

  return {
    profile,
    identity_id: "watch_stole_the_run_runner_v1",
    reference_image: DEFAULT_HOOK_REFERENCE_IMAGE,
    style_reference_image: DEFAULT_HOOK_STYLE_REFERENCE_IMAGE,
    identity_prompt: "photorealistic athletic male runner, age 25-35, lean endurance-athlete build, tan complexion, short dark slightly textured hair, same face family across posts, realistic sweat, and believable outdoor running presence",
    brand_anchor_prompt: "photorealistic athletic male runner, lean muscular endurance-athlete build, masculine, tan complexion, short dark slightly textured hair, same face family across posts, natural run/post-run moment, realistic sweat, rotating believable runner expression, stronger 2026-04-26 watch-stole-the-run viral face style, selected wardrobe category from the 50/50 clothing rotation, visible Apple Watch-style or Garmin-style running watch on one wrist, selected visual world environment, premium fitness-editorial aesthetic",
    stable_traits: [
      "use the 2026-04-26 watch-stole-the-run runner as the primary appearance anchor",
      "male runner, age 25-35",
      "lean muscular endurance-athlete build",
      "tan complexion",
      "short dark slightly textured hair",
      "same face family when the face is visible, with rotating believable running expressions",
      "the face does not need to be centered, close, or fully visible in every hook image",
      "identity can also carry through build, hair, kit, posture, silhouette, and serious runner energy",
      "realistic sweat on face and shirt",
      "sharp cheek and brow detail from the 2026-04-26 watch-stole-the-run look",
      "technical running tops and shirtless warm-weather looks rotate with a 50/50 target",
      "shirtless images are allowed when they read like real training, not model posing",
      "no glasses, sunglasses, or sport eyewear for now",
      "visible Apple Watch-style or Garmin-style running watch on one wrist, small and natural, no readable UI or logos",
      "natural outdoor running context"
    ],
    variation_policy: "Use the 2026-04-26 watch-stole-the-run runner as the primary appearance reference, not the cleaner park-portrait avatar. Keep the sharper face, sweat, and serious human expression family when the face is visible, but do not require a centered face portrait. Some hook images should be back-view, far-away, side-profile, partial-body, or detail-led creator shots while still preserving the same runner identity through build, hair, kit, posture, silhouette, and serious runner energy. Use a 50/50 target split between shirtless warm-weather running looks and clothed technical running tops. Keep shirtless images athletic and non-sexual, never a model pose. Rotate workout phase, route, weather, light, camera angle, crop distance, face visibility, subject scale, face expression, and visible Apple Watch/Garmin-style watch type per pack. Default to no headwear. Eyewear is disabled for now: no glasses, sunglasses, sport eyewear, or clear lenses.",
    reference_instruction: "Use the 2026-04-26 watch-stole-the-run hook image as the primary Coachi runner appearance reference: fitted dark performance kit, visible sweat on face and shirt, sharper cheek and brow detail, cinematic contrast, shallow depth of field, and serious human expression family."
  };
}

function normalizedMarathonCategory(candidate = {}) {
  return String(
    candidate.marathon_content_category
    || candidate.content_category
    || candidate.post_role
    || ""
  ).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function isMarathonWorkoutPost(candidate = {}) {
  if (candidate.is_workout_post === true || candidate.workout_post === true) return true;
  if (candidate.is_workout_post === false || candidate.workout_post === false) return false;
  const category = normalizedMarathonCategory(candidate);
  if (MARATHON_WORKOUT_CATEGORIES.has(category)) return true;
  const text = [
    category,
    candidate.problem_id,
    candidate.problem_type,
    candidate.hook,
    candidate.problem,
    candidate.exact_words
  ].filter(Boolean).join(" ").toLowerCase();
  return /\b(easy run recap|long run|strength day|workout recap|interval workout|run recap|training session)\b/.test(text);
}

function marathonTrainingDay(candidate = {}) {
  const value = Number(candidate.training_day ?? candidate.marathon_training_day ?? candidate.calendar_day);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : null;
}

function marathonSupportWardrobeForCategory(candidate = {}, seed = "") {
  const category = normalizedMarathonCategory(candidate);
  const exact = MARATHON_SUPPORT_WARDROBES.find((wardrobe) => (wardrobe.categories || []).includes(category));
  if (exact) return exact;
  return MARATHON_SUPPORT_WARDROBES[stableHash(`${seed}|marathon-support-wardrobe`) % MARATHON_SUPPORT_WARDROBES.length];
}

function marathonWorkoutWardrobeForCandidate(candidate = {}, seed = "") {
  const requested = String(candidate.workout_outfit_key || candidate.marathon_outfit_key || "");
  const explicit = requested
    ? MARATHON_WORKOUT_WARDROBES.find((wardrobe) => wardrobe.id === requested)
    : null;
  if (explicit) return explicit;
  const day = marathonTrainingDay(candidate);
  if (day != null) return MARATHON_WORKOUT_WARDROBES[(day - 1) % MARATHON_WORKOUT_WARDROBES.length];
  return MARATHON_WORKOUT_WARDROBES[stableHash(`${seed}|marathon-workout-wardrobe`) % MARATHON_WORKOUT_WARDROBES.length];
}

function marathonAvatarVariation(candidate, seed) {
  const workoutPost = isMarathonWorkoutPost(candidate);
  const wardrobe = workoutPost
    ? marathonWorkoutWardrobeForCandidate(candidate, seed)
    : marathonSupportWardrobeForCategory(candidate, seed);
  const day = marathonTrainingDay(candidate);
  const category = normalizedMarathonCategory(candidate) || (workoutPost ? "workout" : "support");
  const watch = "visible Apple Watch-style or Garmin-style running watch on one wrist";
  const watchDetailRule = "Apple Watch-style or Garmin-style running watch silhouette, small in-frame, no readable screen UI, no brand logo, no wrist close-up, no watch-checking pose unless the post is specifically about watches";

  return {
    id: `marathon_${wardrobe.id}`,
    watch,
    top: wardrobe.top,
    headwear: wardrobe.headwear,
    eyewear: "no glasses",
    shorts: wardrobe.shorts,
    angle: workoutPost
      ? "natural creator-style training-day frame with the full outfit readable enough to signal a new day"
      : "natural creator-style support-topic frame with the outfit readable but not posed",
    expression: workoutPost
      ? "honest training effort, sometimes tired or post-workout satisfied, not polished"
      : "calm practical creator expression, not a fitness ad pose",
    weather: "realistic mild training-day conditions",
    lighting: "natural daylight",
    identity_profile: avatarIdentityProfileForAccount("marathon"),
    watch_brand_family: "Apple Watch/Garmin-style rotation",
    watch_detail_rule: watchDetailRule,
    watch_context_rule: category === "watches"
      ? "For watch-support posts, the Apple Watch-style or Garmin-style running watch may be a clear small detail, but it must not show readable UI, logos, or a wrist-only macro."
      : null,
    watch_rotation_policy: "Road to Marathon Fit uses Apple Watch-style or Garmin-style running watch silhouettes only, with no readable UI or logos.",
    clothing_category: workoutPost ? "marathon_workout_day" : `marathon_support_${category}`,
    clothing_rotation_policy: workoutPost
      ? "Every Road to Marathon Fit workout day must use a distinct outfit key so the same runner looks like a new day. Do not reuse the exact same top, shorts, and headwear on adjacent workout posts."
      : "Extra same-day Road to Marathon Fit posts should use support-topic outfits for food, health, body, apps, shoes, watches, gear, progress, or routine topics instead of looking like another workout.",
    marathon_content_category: category,
    marathon_training_day: day,
    workout_post: workoutPost,
    workout_outfit_key: workoutPost ? wardrobe.id : null,
    outfit_note: wardrobe.outfit_note
  };
}

function pickAvatarVariation(candidate, tiktokAccount = null) {
  const seed = [
    candidate.problem_id,
    candidate.problem_type,
    candidate.hook,
    candidate.schema
  ].filter(Boolean).join("|");
  if (isMarathonAccountPack(candidate, tiktokAccount)) {
    return marathonAvatarVariation(candidate, seed);
  }
  const shirtlessVariations = AVATAR_VARIATIONS.filter((variation) => /shirtless/i.test(variation.top));
  const clothedVariations = AVATAR_VARIATIONS.filter((variation) => !/shirtless/i.test(variation.top));
  const categoryHash = stableHash(`${seed}|avatar_clothing_category|${SHIRTLESS_HOOK_IMAGE_RATE}`);
  const useShirtless = shirtlessVariations.length > 0 && clothedVariations.length > 0
    ? categoryHash % 2 === 0
    : shirtlessVariations.length > 0 && (categoryHash % 100) < SHIRTLESS_HOOK_IMAGE_RATE;
  const pool = useShirtless
    ? shirtlessVariations
    : clothedVariations.length > 0
      ? clothedVariations
      : AVATAR_VARIATIONS;
  const clothingCategory = pool === shirtlessVariations ? "shirtless" : "clothed";
  const variationHash = stableHash(`${seed}|avatar_variation|${clothingCategory}`);
  const variation = pool[variationHash % pool.length];
  const watchVariation = pickWatchVariation(candidate);
  return {
    ...variation,
    identity_profile: avatarIdentityProfileForAccount(tiktokAccount),
    watch: watchVariation.label,
    watch_brand_family: watchVariation.brand_family,
    watch_detail_rule: watchDetailRuleForCandidate(candidate, watchVariation),
    watch_context_rule: isWatchComparisonCandidate(candidate)
      ? "Use the selected visible watch type as a natural selfie detail for watch-comparison hooks: it can sit in the lower foreground on the runner's wrist or forearm, but the frame must remain a runner selfie, not a wrist-only macro close-up. No readable screen UI, no logo, and no watch-checking pose."
      : null,
    watch_rotation_policy: WATCH_ROTATION_POLICY,
    clothing_category: clothingCategory,
    shirtless_hook_image_rate_target: SHIRTLESS_HOOK_IMAGE_RATE,
    clothing_rotation_policy: CLOTHING_ROTATION_POLICY,
    eyewear: EYEWEAR_DISABLED ? "no glasses" : variation.eyewear
  };
}

function pickWorkoutPhase(candidate) {
  const mappedPhaseId = WORKOUT_PHASE_BY_PROBLEM_TYPE[candidate.problem_type];
  if (mappedPhaseId) return workoutPhaseById(mappedPhaseId);

  const seed = [
    candidate.problem_id,
    candidate.problem_type,
    candidate.hook,
    candidate.schema,
    "workout_phase"
  ].filter(Boolean).join("|");
  return WORKOUT_PHASES[stableHash(seed) % WORKOUT_PHASES.length];
}

function pickHookComposition(candidate, workoutPhase, visualWorld) {
  const watchComparison = isWatchComparisonCandidate(candidate);
  const comparisonComposition = HOOK_COMPOSITIONS.find((composition) => composition.id === "watch_comparison_selfie_starter");
  if (
    watchComparison
    && comparisonComposition
    && (!comparisonComposition.allowed_phases || comparisonComposition.allowed_phases.includes(workoutPhase.id))
  ) {
    return {
      ...comparisonComposition,
      selected_by: "watch_comparison_rule",
      rotation_policy: "Watch-comparison decks start with a watch-and-selfie hook frame before rotating the supporting visual world.",
      composition_priority: "Watch-comparison selfie starter overrides the avatar variation angle when they conflict."
    };
  }

  const phasePool = HOOK_COMPOSITIONS.filter((composition) => {
    if (composition.requires_watch_comparison && !watchComparison) return false;
    return !composition.allowed_phases || composition.allowed_phases.includes(workoutPhase.id);
  });
  const worldPool = phasePool.filter((composition) => {
    return !composition.worlds || composition.worlds.includes(visualWorld);
  });
  const pool = worldPool.length > 0 ? worldPool : phasePool.length > 0 ? phasePool : HOOK_COMPOSITIONS;
  const seed = [
    candidate.problem_id,
    candidate.problem_type,
    candidate.hook,
    candidate.schema,
    visualWorld,
    workoutPhase.id,
    "hook_composition_v2"
  ].filter(Boolean).join("|");
  const selected = pool[stableHash(seed) % pool.length];
  const phaseMovementState = selected.phase_movement_state?.[workoutPhase.id] || selected.movement_state;
  return {
    ...selected,
    movement_state: phaseMovementState,
    phase_specific_movement_state: Boolean(selected.phase_movement_state?.[workoutPhase.id]),
    selected_by: "stable_hash_candidate_phase_world",
    rotation_policy: "Hook composition rotates independently from clothing, workout phase, and visual world so Picture 1 does not default to repeated centered medium-close hero shots.",
    composition_priority: "Hook composition overrides the avatar variation angle when they conflict."
  };
}

function buildCharacterAnchor(avatarVariation) {
  const identityProfile = avatarVariation.identity_profile || avatarIdentityProfileForAccount();
  const styleReferenceImage = Object.prototype.hasOwnProperty.call(identityProfile, "style_reference_image")
    ? identityProfile.style_reference_image
    : DEFAULT_HOOK_STYLE_REFERENCE_IMAGE;
  return {
    identity_id: identityProfile.identity_id,
    account_profile: identityProfile.profile,
    reference_image: identityProfile.reference_image || DEFAULT_HOOK_REFERENCE_IMAGE,
    style_reference_image: styleReferenceImage,
    identity_prompt: identityProfile.identity_prompt,
    brand_anchor_prompt: identityProfile.brand_anchor_prompt,
    reference_instruction: identityProfile.reference_instruction,
    stable_traits: identityProfile.stable_traits,
    variation_policy: identityProfile.variation_policy,
    watch_rule: avatarVariation.watch_context_rule || "Use the selected visible watch type naturally on one wrist. The watch may read as Apple Watch-style or Garmin-style by silhouette only. Keep it small and believable in-frame. No readable screen UI, no logo, no wrist close-up, and no watch-checking pose.",
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
    child.on("error", (error) => {
      reject(error);
    });
    child.on("exit", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}${stderr ? `\n${stderr}` : ""}`));
      }
    });
  });
}

function runLocalScript(scriptPath, cliArgs, options = {}) {
  return run(process.execPath, [scriptPath, ...cliArgs], options);
}

function slideFileName(slideNumber, role) {
  return `${String(slideNumber).padStart(2, "0")}-${slugify(role || "slide")}.png`;
}

async function recentPackDirs({ root = DEFAULT_OUTPUT_ROOT, excludeSlug = null, limit = 30 } = {}) {
  let entries = [];
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }

  return entries
    .filter((entry) => entry.isDirectory())
    .filter((entry) => entry.name !== excludeSlug)
    .map((entry) => ({ name: entry.name, dir: path.join(root, entry.name) }))
    .sort((left, right) => right.name.localeCompare(left.name))
    .slice(0, limit);
}

async function recentTextFiles({ relativeFile, root = DEFAULT_OUTPUT_ROOT, excludeSlug = null, limit = 14 }) {
  const dirs = await recentPackDirs({ root, excludeSlug, limit: limit * 2 });
  const texts = [];
  for (const entry of dirs) {
    if (texts.length >= limit) break;
    const filePath = path.join(entry.dir, relativeFile);
    try {
      texts.push({
        slideshow_id: entry.name,
        path: filePath,
        text: await fs.readFile(filePath, "utf8")
      });
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  return texts;
}

async function recentFinalCtaTexts({ root = DEFAULT_OUTPUT_ROOT, excludeSlug = null, limit = 5 } = {}) {
  const dirs = await recentPackDirs({ root, excludeSlug, limit: limit * 3 });
  const texts = [];
  for (const entry of dirs) {
    if (texts.length >= limit) break;
    const manifest = await readOptionalJson(path.join(entry.dir, "render-manifest.json"), null);
    const slides = manifest?.slides || [];
    const finalSlide = slides.reduce((latest, slide) => {
      if (!latest || Number(slide.slide_number || 0) > Number(latest.slide_number || 0)) return slide;
      return latest;
    }, null);
    if (finalSlide?.text) texts.push(finalSlide.text);
  }
  return texts;
}

function fallbackHashtagSet() {
  return { id: "default_legacy", tags: DEFAULT_HASHTAGS };
}

function ctaClassForText(text) {
  if (/\bcomment\b|\?/i.test(String(text || ""))) return "comment-bait";
  if (/\bfollow\b/i.test(String(text || ""))) return "follow";
  return "save-bait";
}

async function buildMarketingSelections({ candidate, slug, useCoachiAppCta, tiktokAccount = null }) {
  const recentCaptions = await recentTextFiles({
    relativeFile: "copy/tiktok-caption.txt",
    excludeSlug: slug,
    limit: 14
  });
  const recentCtas = await recentFinalCtaTexts({ excludeSlug: slug, limit: 5 });
  if (isMarathonAccountPack(candidate, tiktokAccount)) {
    const recentCtaTexts = new Set(recentCtas.map(normalizeText));
    const coachiCta = useCoachiAppCta
      ? {
          id: `marathon_coachi_${candidate.problem_id || stableHash(`${slug}|coachi`)}`,
          class: "soft app-proof",
          text: candidate.coachi_app_cta_text || COACHI_APP_CTA_TEXT
        }
      : null;
    const draftCtaText = candidate.slide_draft?.find((slide) => slide.role === "cta")?.text || null;
    const draftCta = draftCtaText && !recentCtaTexts.has(normalizeText(draftCtaText))
      ? {
          id: `marathon_draft_${candidate.problem_id || stableHash(`${slug}|draft-cta`)}`,
          class: ctaClassForText(draftCtaText),
          text: draftCtaText
        }
      : null;
    const cta = coachiCta || draftCta || pickStaticEntry(
      MARATHON_FOLLOW_ALONG_CTAS,
      `${slug}|${candidate.problem_id}|marathon-cta`,
      (entry) => !recentCtaTexts.has(normalizeText(entry.text))
    );
    const hashtagSet = pickStaticEntry(
      MARATHON_HASHTAG_SETS,
      `${slug}|${candidate.problem_id}|marathon-hashtags`
    );
    const captionTemplate = pickStaticEntry(
      MARATHON_CAPTION_TEMPLATES,
      `${slug}|${candidate.problem_id}|marathon-caption`
    );
    return {
      cta,
      hashtag_set: hashtagSet,
      caption_template: captionTemplate,
      recent_caption_texts: recentCaptions.map((entry) => entry.text)
    };
  }
  const ctaClasses = useCoachiAppCta
    ? ["soft app-proof"]
    : candidate.problem_type === "workout-racing"
      ? ["save-bait", "comment-bait"]
      : ["comment-bait", "save-bait", "follow"];
  const recentCtaTexts = new Set(recentCtas.map(normalizeText));
  const draftCtaText = candidate.slide_draft?.find((slide) => slide.role === "cta")?.text || null;
  const draftCta = draftCtaText && !recentCtaTexts.has(normalizeText(draftCtaText))
    ? {
        id: `curated_${candidate.problem_id || stableHash(`${slug}|draft-cta`)}`,
        class: ctaClassForText(draftCtaText),
        text: draftCtaText
      }
    : null;
  const cta = draftCta || await selectCta({
    bankPath: CTA_BANK_PATH,
    classes: ctaClasses,
    excludeTexts: recentCtas
  }) || {
    id: "legacy_cta",
    class: useCoachiAppCta ? "soft app-proof" : "save-bait",
    text: useCoachiAppCta ? COACHI_APP_CTA_TEXT : softNonCoachiCtaText(candidate, null)
  };
  const hashtagSet = await selectHashtagSet({ bankPath: HASHTAG_SETS_PATH }) || fallbackHashtagSet();
  const captionTemplate = await selectCaptionTemplate({
    bankPath: CAPTION_BANK_PATH,
    problemType: candidate.problem_type
  });

  return {
    cta,
    hashtag_set: hashtagSet,
    caption_template: captionTemplate,
    recent_caption_texts: recentCaptions.map((entry) => entry.text)
  };
}

function templateForSlide({ schemaSlide, draftSlide, index, finalSlideNumber, useCoachiAppCta, visualWorld, candidate, marketingSelections }) {
  const slideNumber = index + 1;
  const isMarathonPack = candidate?.account_profile === "marathon";
  const assetSource = schemaSlide.asset_source
    || (slideNumber === 1
      ? "images_2_0"
      : slideNumber === finalSlideNumber && !isMarathonPack
        ? "supabase_template"
        : "supabase_library");
  const role = draftSlide?.role || schemaSlide.role || `slide-${slideNumber}`;
  const isFinalCta = slideNumber === finalSlideNumber && role === "cta";
  const selectedCta = marketingSelections?.cta || null;
  const appCtaFields = isFinalCta && useCoachiAppCta
    ? {
        text: selectedCta?.text || COACHI_APP_CTA_TEXT,
        cta_id: selectedCta?.id || "legacy_coachi_app_cta",
        cta_class: selectedCta?.class || "soft app-proof",
        preferred_asset_ids: COACHI_APP_CTA_ASSET_IDS,
        coachi_app_cta: true
      }
    : {};

  return {
    slide_number: slideNumber,
    role,
    // Images 2.0 always writes the one generated hook image to this stable path,
    // even when a schema calls its first slide something other than "hook".
    input_image: slideNumber === 1
      ? "slides/source/01-hook.png"
      : `slides/source/${slideFileName(slideNumber, role)}`,
    output_file: slideFileName(slideNumber, role),
    text: appCtaFields.text || (
      isFinalCta
        ? selectedCta?.text || softNonCoachiCtaText(candidate, draftSlide?.text || schemaSlide.example_text || schemaSlide.text_template)
        : draftSlide?.text || schemaSlide.example_text || schemaSlide.text_template
    ),
    asset_source: assetSource,
    visual_collection: visualCollectionForWorld(visualWorld, schemaSlide, slideNumber, finalSlideNumber, candidate?.account_profile || null),
    text_position: normalizeTextPosition(isFinalCta && useCoachiAppCta ? "top" : schemaSlide.text_position || "lower_middle"),
    font_size: isFinalCta && useCoachiAppCta ? 58 : slideNumber === 1 ? 92 : 76,
    max_chars_per_line: isFinalCta && useCoachiAppCta ? 20 : slideNumber === 1 ? 25 : 24,
    ...(isFinalCta && !useCoachiAppCta && selectedCta ? { cta_id: selectedCta.id, cta_class: selectedCta.class } : {}),
    ...appCtaFields
  };
}

function buildRenderManifest({ candidate, schema, hookBrief, slug, marketingSelections, tiktokAccount = null }) {
  const finalSlideNumber = schema.slides.length;
  const useCoachiAppCta = shouldUseCoachiAppCta({ slug, candidate, tiktokAccount });
  const selectedCta = marketingSelections?.cta || null;
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
    format_id: candidate.format_id || candidate.schema,
    content_pillar: candidate.content_pillar || null,
    research_status: candidate.research_status || null,
    account_profile: candidate.account_profile || tiktokAccount || null,
    tiktok_account: tiktokAccount || null,
    tiktok_account_profile: tiktokAccountProfile(tiktokAccount),
    format_catalog: candidate.format_catalog || `${ENGINE_DIR}/formats/coachi-formats.json`,
    source_of_truth: "strategy/automation/tiktok-instagram-slideshow-content-engine/SOURCE_OF_TRUTH_X_ARTICLE.md",
    format_library_required: true,
    hook_quality: candidate.selected_hook_quality || null,
    emotion: candidate.emotion || hookBrief?.emotion || null,
    visual_world: hookBrief?.visual_world || candidate.visual_world || null,
    lighting_family: hookBrief?.lighting_family || candidate.lighting_family || null,
    hook_identity: hookBrief?.character_anchor || null,
    avatar_world_required: true,
    cta_required: true,
    coachi_app_cta_policy: {
      target_share: 0.7,
      selected_for_this_pack: useCoachiAppCta,
      text: selectedCta?.text || COACHI_APP_CTA_TEXT,
      cta_id: selectedCta?.id || null,
      cta_class: selectedCta?.class || null,
      app_cta_asset_ids: useCoachiAppCta ? COACHI_APP_CTA_ASSET_IDS : []
    },
    marketing_banks: {
      cta_id: selectedCta?.id || null,
      cta_class: selectedCta?.class || null,
      caption_template_id: marketingSelections?.caption_template?.id || null,
      hashtag_set_id: marketingSelections?.hashtag_set?.id || null
    },
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
      finalSlideNumber,
	      useCoachiAppCta,
	      visualWorld: hookBrief?.visual_world || candidate.visual_world,
	      candidate,
	      marketingSelections
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

async function captionTemplatesForCandidate(candidate) {
  const bank = await readOptionalJson(CAPTION_BANK_PATH, { default_templates: [], problem_type_templates: {} });
  return [
    ...(bank.problem_type_templates?.[candidate.problem_type] || []),
    ...(bank.default_templates || [])
  ];
}

function captionValues(candidate, hook, ctaText) {
  return {
    hook,
    insight: captionInsightForCandidate(candidate, hook),
    cta: ctaText,
    problem_phrase: candidate.exact_words || candidate.problem || candidate.problem_type || "the run"
  };
}

function captionTooSimilar(caption, recentCaptionTexts) {
  return (recentCaptionTexts || []).some((recent) => textSimilarity(caption, recent) > 0.8);
}

async function buildCaptions(candidate, marketingSelections = {}) {
  const hook = sentenceCase(candidate.hook);
  const topFivePoints = numberedPointsFromCandidate(candidate);
  const hashtagSet = marketingSelections.hashtag_set || fallbackHashtagSet();
  const hashtags = `${(hashtagSet.tags || DEFAULT_HASHTAGS).join(" ")}\n`;
  const ctaText = marketingSelections.cta?.text || (candidate.problem_type === "workout-racing"
    ? "Save this before your next workout."
    : "Save this before your next easy run.");
  const templates = await captionTemplatesForCandidate(candidate);
  const templateCandidates = [
    marketingSelections.caption_template,
    ...templates
  ].filter(Boolean);
  const seenTemplateIds = new Set();
  for (const template of templateCandidates) {
    if (seenTemplateIds.has(template.id)) continue;
    seenTemplateIds.add(template.id);
    const rendered = renderTemplate(template.template, captionValues(candidate, hook, ctaText)).trim();
    if (!rendered || captionTooSimilar(rendered, marketingSelections.recent_caption_texts)) continue;
    return {
      tiktok: rendered,
      instagram: `${rendered}\n\nWhat usually makes easy runs turn hard for you?`,
      hashtags,
      caption_template_id: template.id,
      hashtag_set_id: hashtagSet.id || null,
      cta_id: marketingSelections.cta?.id || null
    };
  }

  if (/^top 5/i.test(candidate.hook) && topFivePoints.length === 5) {
    return {
      tiktok: `${hook}:\n\n${topFivePoints.join("\n")}\n\n${ctaText}`,
      instagram: `${hook}:\n\n${topFivePoints.join("\n")}\n\nThese come from real runner problems, not theory.\n\n${ctaText}`,
      hashtags,
      caption_template_id: null,
      hashtag_set_id: hashtagSet.id || null,
      cta_id: marketingSelections.cta?.id || null
    };
  }

  if (candidate.problem_type === "easy-run pace drift") {
    return {
      tiktok: `Easy runs usually do not fail all at once.\n\nYou speed up once.\nThen again.\nThen zone 2 becomes zone 3.\n\nIf your easy run keeps drifting into zone 3 and 4, catch it early.\n\n${ctaText}`,
      instagram: `Easy runs usually fail slowly.\n\nYou speed up once.\nThen again.\nYour heart rate creeps up.\nZone 2 becomes zone 3 or 4.\n\nThe win is finishing easy.\n\n${ctaText}`,
      hashtags,
      caption_template_id: null,
      hashtag_set_id: hashtagSet.id || null,
      cta_id: marketingSelections.cta?.id || null
    };
  }
  const insight = captionInsightForCandidate(candidate, hook);
  const tiktok = `${hook}\n\n${insight}\n\n${ctaText}`;
  const instagram = `${hook}\n\n${insight}\n\n${ctaText}`;
  return {
    tiktok,
    instagram,
    hashtags,
    caption_template_id: null,
    hashtag_set_id: hashtagSet.id || null,
    cta_id: marketingSelections.cta?.id || null
  };
}

function captionInsightForCandidate(candidate, hook) {
  if (candidate.problem_type === "easy-run form breakdown") {
    return "Easy pace still needs rhythm.";
  }

  const normalizedHook = normalizeCaptionText(hook);
  const options = [
    candidate.slide_draft?.find((slide) => slide.slide_number === 2)?.text,
    candidate.problem,
    candidate.why_this_can_work,
    candidate.exact_words
  ];
  const insight = options
    .map((item) => String(item || "").trim())
    .find((item) => item && normalizeCaptionText(item) !== normalizedHook && !/^try these tips\b/i.test(item));
  return insight || "One useful cue for a calmer run.";
}

function normalizeCaptionText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[“”"']/g, "")
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hashtagsArray(hashtags) {
  return String(hashtags || "")
    .split(/\s+/)
    .map((tag) => tag.trim())
    .filter((tag) => tag.startsWith("#"));
}

function imageSourcePreference(slide, finalSlideNumber, candidate = {}) {
  if (slide.asset_source === "images_2_0") return "ai";
  if (slide.slide_number === finalSlideNumber || slide.asset_source === "supabase_template") {
    return candidate.account_profile === "marathon" ? "library" : "branded_template";
  }
  return "library";
}

function visualMoodForRole(role, candidate) {
  if (role === "hook") return candidate.emotion || "focused";
  if (role === "coachi_connection") return "controlled and useful";
  if (role === "cta") return "calm confidence";
  return "real runner effort";
}

function movementForSlide(slide) {
  if (slide.role === "cta") return "static";
  if (slide.role === "coachi_connection") return "controlled movement";
  return slide.slide_number === 1 ? "natural running moment" : "movement";
}

function visualDirectionForSlide({ slide, hookBrief, candidate }) {
  const mood = visualMoodForRole(slide.role, candidate);
  const movement = movementForSlide(slide);
  return [
    mood,
    movement,
    hookBrief.visual_world,
    hookBrief.lighting_family,
    "clean negative space for local overlay text"
  ].filter(Boolean).join("; ");
}

function imageQueryForSlide({ slide, hookBrief, candidate }) {
  const isMarathonPack = candidate.account_profile === "marathon";
  const subject = slide.role === "cta"
    ? isMarathonPack
      ? "minimal marathon training follow-along background"
      : "minimal branded running app proof background"
    : slide.role === "coachi_connection"
      ? "runner controlled effort voice coaching moment"
      : `${candidate.problem_type || "runner"} ${slide.role || "training"}`;
  return [
    subject,
    hookBrief.visual_world,
    hookBrief.lighting_family,
    visualMoodForRole(slide.role, candidate)
  ].filter(Boolean).join(" ");
}

function ctaTypeForSlide(slide) {
  if (slide.role !== "cta") return null;
  if (slide.coachi_app_cta) return "coachi_app_proof";
  if (/\btry coachi\b/i.test(slide.text || "")) return "soft_product";
  if (/\bsave\b/i.test(slide.text || "")) return "save";
  if (/\bfollow\b/i.test(slide.text || "")) return "follow";
  return "soft_engagement";
}

function buildCanonicalSlideshowJson({ slug, candidate, manifest, hookBrief, captions }) {
  const finalSlideNumber = Math.max(...(manifest.slides || []).map((slide) => slide.slide_number));
  const isMarathonPack = candidate.account_profile === "marathon";
  return {
    schema_version: 1,
    slideshow_id: slug,
    format_id: candidate.format_id || manifest.format_id || candidate.schema,
    schema: candidate.schema,
    content_pillar: candidate.content_pillar || null,
    research_status: candidate.research_status || null,
    topic: candidate.problem || candidate.why_this_can_work || candidate.problem_type,
    selected_hook: candidate.hook,
    hook_score: candidate.selected_hook_quality?.score ?? 0,
    hook_quality: candidate.selected_hook_quality || null,
    target_audience: TARGET_AUDIENCE_BY_PROBLEM_TYPE[candidate.problem_type] || "beginner runners / zone 2 runners / overpacers",
    source_problem: {
      id: candidate.problem_id,
      problem_type: candidate.semantic_problem_type || candidate.problem_type,
      exact_words: candidate.exact_words || null,
      source_url: candidate.source_url || null
    },
    visual_system: {
      emotion: hookBrief.emotion,
      visual_world: hookBrief.visual_world,
      lighting: hookBrief.lighting_family,
      workout_phase: hookBrief.workout_phase?.id || null,
      hybrid_strategy: isMarathonPack
        ? "slide_1_ai_slides_2_6_library_final_follow_along_template"
        : "slide_1_ai_slides_2_6_library_final_branded_template"
    },
    slides: (manifest.slides || []).map((slide) => ({
      slide_number: slide.slide_number,
      role: slide.role,
      text: slide.text,
      visual_direction: visualDirectionForSlide({ slide, hookBrief, candidate }),
      image_query: imageQueryForSlide({ slide, hookBrief, candidate }),
      image_source_preference: imageSourcePreference(slide, finalSlideNumber, candidate),
      text_position: slide.text_position,
      font_size: slide.font_size,
      cta_type: ctaTypeForSlide(slide)
    })),
    caption: captions.tiktok,
    hashtags: hashtagsArray(captions.hashtags),
    qa_status: "pending"
  };
}

function themeBriefForCandidate(candidate) {
  const fallbackWorld = approvedWorldDetails(candidate.visual_world || candidate.route_tag || candidate.problem_type);
  const defaults = {
    theme: candidate.problem_type || "running progress",
    route_tag: fallbackWorld.route_tag,
    visual_world: fallbackWorld.visual_world,
    lighting_family: fallbackWorld.lighting_family,
    reddit_background: candidate.exact_words || candidate.problem || "A runner is trying to understand a run.",
    background: fallbackWorld.background,
    vibe: "realistic, calm, premium, useful, not overproduced",
    first_image_prompt_adaptation: "show a runner in a believable post-run or easy-run moment with clean negative space for overlay text",
    visual_keywords: [...fallbackWorld.keywords, "clean overlay space"],
    avoid: ["watch close-up", "baked-in text", "logos", "fake steam", "blurred background", "unnatural stride"]
  };

  const byType = {
    "easy-run pace drift": {
      theme: "easy-run drift",
      route_tag: "forest",
      visual_world: "forest",
      lighting_family: APPROVED_VISUAL_WORLDS.forest.lighting_family,
      reddit_background: candidate.exact_words || "The runner starts easy, then the run gradually turns medium-hard.",
      background: "long forest running route, enough depth to feel like the runner has been moving for a while",
      vibe: "honest endurance, slight late-run fatigue, controlled effort, not a sprint",
      first_image_prompt_adaptation: "post-run or late-run action moment: the runner is sweaty, breathing steadily, satisfied but aware he had to control the effort",
      visual_keywords: ["long path", "subtle fatigue", "controlled easy effort", "natural route depth", "premium running editorial"],
      avoid: ["race finish line", "sprinting", "watch checking", "hands on hips pose", "dramatic collapse"]
    },
    "zone-2 confusion": {
      theme: "zone 2 confusion",
      route_tag: "lake",
      visual_world: "lake",
      lighting_family: APPROVED_VISUAL_WORLDS.lake.lighting_family,
      reddit_background: candidate.exact_words || "The runner feels like zone 2 is too slow and starts doubting the session.",
      background: "calm lakeside running path, daylight, low-pressure easy-run environment",
      vibe: "calm confusion turning into control",
      first_image_prompt_adaptation: "runner moving easily, relaxed shoulders, no watch checking, enough negative space for a clear hook",
      visual_keywords: ["easy effort", "lake path", "relaxed body language", "clean background"],
      avoid: ["lab testing", "heart-rate charts", "watch close-up", "frustrated face"]
    },
    "heart-rate panic": {
      theme: "heart-rate panic",
      route_tag: "lake",
      visual_world: "lake",
      lighting_family: APPROVED_VISUAL_WORLDS.lake.lighting_family,
      reddit_background: candidate.exact_words || "The runner sees a high effort signal and panics even though the run may be fine.",
      background: "open lakeside running path with light environmental stress such as sun or wind",
      vibe: "tense but grounded, useful correction, not alarmist",
      first_image_prompt_adaptation: "runner in controlled motion with visible sweat and focused breathing, scene should explain why effort can rise",
      visual_keywords: ["lake path", "sun", "wind", "controlled breathing", "real effort", "environment context"],
      avoid: ["medical emergency", "fear expression", "watch close-up", "fake exhaustion"]
    },
    "watch-checking anxiety": {
      theme: "watch-checking anxiety",
      route_tag: "forest",
      visual_world: "forest",
      lighting_family: APPROVED_VISUAL_WORLDS.forest.lighting_family,
      reddit_background: candidate.exact_words || "The runner keeps checking the watch and loses the feel of the run.",
      background: "forest running route with visible trees and path depth",
      vibe: "focused, slightly tense, then grounded",
      first_image_prompt_adaptation: "runner moving through a forest route with eyes forward, not checking a watch",
      visual_keywords: ["forest", "path depth", "focused breathing", "no watch checking"],
      avoid: ["watch close-up", "phone screen", "city street", "track lane"]
    },
    "pace disbelief": {
      theme: "pace context",
      route_tag: "mountain",
      visual_world: "mountain",
      lighting_family: APPROVED_VISUAL_WORLDS.mountain.lighting_family,
      reddit_background: candidate.exact_words || "The runner thinks pace is wrong because the route changes.",
      background: "mountain running route where gradient makes pace and effort feel different",
      vibe: "context changes the run, practical and grounded",
      first_image_prompt_adaptation: "runner on a clear training path, natural stride, background shows route context without changing worlds",
      visual_keywords: ["mountain route", "visible gradient", "natural stride", "effort over split"],
      avoid: ["route-world switching", "watch checking", "extreme terrain"]
    },
    "workout-racing": {
      theme: "workout control",
      route_tag: "mountain",
      visual_world: "mountain",
      lighting_family: APPROVED_VISUAL_WORLDS.mountain.lighting_family,
      reddit_background: candidate.exact_words || "The runner turns workouts into races and fades late.",
      background: "mountain route after a controlled harder effort, runner cooling down",
      vibe: "discipline, restraint, useful athletic lesson",
      first_image_prompt_adaptation: "sweaty runner after a controlled workout, satisfied but not posing, premium fitness look",
      visual_keywords: ["mountain route", "post-workout", "controlled effort", "cooldown", "discipline"],
      avoid: ["race celebration", "sprint pose", "aggressive gym energy"]
    }
  };

  const typeWorldId = canonicalWorldId(byType[candidate.problem_type]?.visual_world || defaults.visual_world);
  const world = approvedWorldDetails(candidate.visual_world, typeWorldId);
  const rawMerged = {
    ...defaults,
    ...(byType[candidate.problem_type] || {}),
    route_tag: world.route_tag,
    visual_world: world.visual_world,
    lighting_family: world.lighting_family
  };
  const merged = {
    ...rawMerged,
    ...worldAlignedThemeFields(rawMerged, world),
    avoid: [...new Set([...(rawMerged.avoid || []), ...(world.forbidden || [])])]
  };
  return {
    ...merged,
    visual_world: world.visual_world,
    route_tag: world.route_tag,
    lighting_family: world.lighting_family
  };
}

function buildHookBriefJson({ candidate, schema, tiktokAccount = null }) {
  const hookSlide = schema.slides[0] || {};
  const workoutPhase = pickWorkoutPhase(candidate);
  const theme = adaptThemeForWorkoutPhase(themeBriefForCandidate(candidate), workoutPhase);
  const avatarVariation = compileAvatarVariationForTheme(pickAvatarVariation(candidate, tiktokAccount), theme);
  const hookComposition = pickHookComposition(candidate, workoutPhase, theme.visual_world);
  const promptCompiler = buildPromptCompilerReport({
    candidate,
    theme,
    workoutPhase,
    avatarVariation,
    hookComposition
  });
  const characterAnchor = buildCharacterAnchor(avatarVariation);

  return {
    schema_version: 1,
    hook: candidate.hook,
    problem_id: candidate.problem_id,
    problem_type: candidate.problem_type,
    source_url: candidate.source_url,
    source_problem: candidate.problem || candidate.why_this_can_work || candidate.exact_words || null,
    exact_reddit_language: candidate.exact_words || null,
    emotion: candidate.emotion || "confused",
    pattern: candidate.pattern || null,
    format_id: candidate.format_id || null,
    content_pillar: candidate.content_pillar || null,
    research_status: candidate.research_status || null,
    marathon_content_category: candidate.marathon_content_category || candidate.content_category || null,
    marathon_training_day: candidate.training_day ?? candidate.marathon_training_day ?? candidate.calendar_day ?? null,
    workout_post: isMarathonAccountPack(candidate, tiktokAccount) ? isMarathonWorkoutPost(candidate) : null,
    workout_outfit_key: candidate.workout_outfit_key || candidate.marathon_outfit_key || null,
    tiktok_text_bank: candidate.tiktok_text_bank || null,
    hook_source: candidate.hook_source || null,
    slide_text_source: candidate.slide_text_source || null,
    hook_quality: candidate.selected_hook_quality || null,
    theme: theme.theme,
    route_tag: theme.route_tag,
    visual_world: theme.visual_world,
    lighting_family: theme.lighting_family,
    cta: candidate.slide_draft?.find((slide) => slide.role === "cta")?.text || null,
    avatar_world_required: true,
    avatar_source: characterAnchor.reference_image || DEFAULT_HOOK_REFERENCE_IMAGE,
    viral_face_style_reference: characterAnchor.style_reference_image || null,
    cta_required: true,
    reddit_background_and_vibe: {
      background: theme.background,
      vibe: theme.vibe,
      reddit_background: theme.reddit_background,
      visual_keywords: theme.visual_keywords,
      avoid: theme.avoid
    },
    background_world_lock: backgroundWorldLockForTheme(theme),
    first_image_prompt_adaptation: theme.first_image_prompt_adaptation,
    character_anchor: characterAnchor,
    workout_phase: workoutPhase,
    avatar_variation: avatarVariation,
    hook_composition: hookComposition,
    prompt_compiler: promptCompiler,
    schema_prompt_template: hookSlide.image_prompt_template || null,
    production_rules: [
      "Every slideshow has an explicit emotion, one Images 2.0 hook, one generated avatar world, and one final CTA.",
      "Slide hook and slides 1-6 should use the source-backed TikTok slideshow text bank before any generic AI wording.",
      "Images 2.0 generates slide 1 only.",
      "Do not generate all slideshow images in one Images 2.0 request.",
      "Do not bake overlay text into the image.",
      "Keep the full deck in one visual world and one lighting family.",
      "For the hook image, reference-image background is non-transferable; the generated background must match visual_world.",
      "Keep one primary visual world per slideshow; lake worlds may include mountains or hills as background context.",
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
  const hookComposition = hookBrief.hook_composition || {};
  const backgroundLock = hookBrief.background_world_lock || backgroundWorldLockForTheme({
    visual_world: hookBrief.visual_world,
    background: vibe.background
  });
  const otherPrimaryWorlds = ["forest", "lake", "mountain"]
    .filter((world) => world !== hookBrief.visual_world)
    .join(", ");
  const isMarathonPack = characterAnchor.account_profile === "marathon";
  const identityLabel = isMarathonPack ? "Road to Marathon Fit runner identity" : "Coachi runner identity";
  const avatarWorldLabel = isMarathonPack ? "generated Road to Marathon Fit runner avatar" : "generated Coachi runner avatar";
  const watchContextLabel = isMarathonPack ? "marathon-training context" : "Coachi wearable context";
  const identityFallbackRule = isMarathonPack
    ? "Do not fall back to the main Coachi male runner, Runner Watch Lab male runner, or any generic slim fitness influencer."
    : "Do not fall back to the cleaner park-portrait avatar.";
  const equipmentRule = isMarathonPack
    ? "Road to Marathon Fit wardrobe rule: use the exact selected modest technical outfit for this pack so workout days look like separate real days. Do not use shirtless looks, glamour styling, casual streetwear, brand logos, or a reused default outfit. The selected top, shorts/tights, headwear, and small Apple Watch-style or Garmin-style running watch silhouette must be visible enough to signal the outfit change, while still feeling like a real training moment."
    : "Visible kit must read as real running equipment, not casual streetwear. Use technical running clothing when a top is selected, or a believable shirtless warm-weather running look when shirtless is selected. Always use proper running shorts, a natural visible running watch, and realistic sweat. Eyewear is disabled for now: no glasses, sunglasses, sport eyewear, or clear lenses. Do not add headwear unless explicitly selected. No brand logos.";
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

## TikTok Creator Realism Direction
- Make this feel like a real runner/creator post, not a polished fitness ad, stock campaign, or AI thumbnail.
- Prefer an imperfect but believable phone/tripod capture feeling: natural crop, real sweat, slight motion realism, lived-in route detail, and human expression.
- Avoid symmetrical poster framing, glossy model lighting, overly perfect skin, heroic influencer posing, and generic scenic wallpaper energy.
- Negative space is still needed for local overlay text, but it should feel naturally available in the scene, not staged like an ad layout.

## Hook Text Added Later By Compositor
${candidate.hook}

## Mandatory Picture 1 Composition
This is a hard requirement and must be followed before identity styling, wardrobe, or reference-image pose.
- Composition family: ${hookComposition.id || "legacy_avatar_angle"}
- Direction: ${hookComposition.direction || avatarVariation.angle}
- Camera distance: ${hookComposition.camera_distance || "natural creator-style frame"}
- Camera height: ${hookComposition.camera_height || "natural phone height"}
- Subject scale: ${hookComposition.subject_scale || "runner scale should vary naturally"}
- Face visibility: ${hookComposition.face_visibility || "face can rotate naturally with the selected angle"}
- Face-framing safety: if any face is visible, keep the entire face and full head inside the frame, including hairline, forehead, ears, and chin. Never crop through the head, face, forehead, chin, or neck. If the composition cannot show a complete face and head, turn the runner fully away so no face is visible.
- Movement state: ${hookComposition.movement_state || workoutPhase.body_language}
- Text-safe negative space: ${hookComposition.negative_space_zone || "clean natural space for overlay text"}
- If face visibility says the face is hidden, no direct face, small, partial, or not readable, do not create a close face portrait.
- A partial body is allowed only when it is clearly intentional and contains no face. Never create an accidental neck-down crop.
- Do not place the face or torso in the center text-safe zone. Leave the overlay area naturally open.
- Do not default to centered waist-up, hands-on-knees, front-facing, or three-quarter hero framing unless that is the selected composition.

## TikTok-Proven Text Source
- Text bank: ${hookBrief.tiktok_text_bank || "not available"}
- Hook source family: ${hookBrief.hook_source?.source_family_id || "fallback"}
- Hook source signal: ${hookBrief.hook_source?.source_signal || "n/a"}
- Hook source URL: ${hookBrief.hook_source?.source_url || "n/a"}
- Slide text set: ${hookBrief.slide_text_source?.slide_set_id || "fallback"}
- Hook quality score: ${hookBrief.hook_quality?.score || "n/a"}/${hookBrief.hook_quality?.max_score || 70}
- Rule: use this as proven structure and simplicity only. Do not copy creator-specific wording.

## Prompt Compiler Quality Gate
- Source of truth: ${hookBrief.prompt_compiler?.source_of_truth || "X article slideshow workflow"}
- Coherence status: ${hookBrief.prompt_compiler?.coherence_status || "unknown"}
- Selected by: ${hookBrief.prompt_compiler?.selected_by || "unknown"}
- Composition family: ${hookComposition.id || "legacy_avatar_angle"}
- Checks: ${(hookBrief.prompt_compiler?.checks || []).join("; ")}

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

## Background World Lock
- Reference image background is non-transferable.
- Use the reference image for runner face, body type, sweat, expression, and visual energy only.
- Required generated background: ${backgroundLock.required_background}
- Selected avatar world: ${backgroundLock.selected_visual_world}
- Rule: ${backgroundLock.generated_background_rule}
- Allowed background context: ${(backgroundLock.allowed_background_context || []).join(", ") || "none"}
- Forbidden background elements for this pack: ${(backgroundLock.forbidden_background_elements || []).join(", ") || "none beyond normal brand constraints"}
- If the reference image background conflicts with the selected avatar world, ignore the reference background completely.

## First Image Prompt Adapted To Theme
${hookBrief.first_image_prompt_adaptation}

## Required Slideshow Spine
- Emotion: ${hookBrief.emotion}
- Images 2.0: slide 1 only
- Avatar world: ${avatarWorldLabel} in ${hookBrief.visual_world}
- CTA: final slide only, one simple action
- Visual consistency: slides 2-7 must stay in ${hookBrief.visual_world} with ${hookBrief.lighting_family}
- Background rule: slide 1 must use a newly generated ${hookBrief.visual_world} background, not the reference image background.

## Character Continuity Anchor
- Identity ID: ${characterAnchor.identity_id}
- Reference image: ${characterAnchor.reference_image}
- Viral face/style reference: ${characterAnchor.style_reference_image || "none; use identity reference only"}
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
- Clothing category: ${avatarVariation.clothing_category || "unknown"}
- Clothing rotation policy: ${avatarVariation.clothing_rotation_policy || CLOTHING_ROTATION_POLICY}
- Outfit key: ${avatarVariation.workout_outfit_key || avatarVariation.id || "none"}
- Outfit note: ${avatarVariation.outfit_note || "none"}
- Headwear: ${avatarVariation.headwear}
- Eyewear: ${avatarVariation.eyewear}
- Shorts: ${avatarVariation.shorts}
- Watch brand family: ${avatarVariation.watch_brand_family || "Apple Watch/Garmin rotation"}
- Watch detail rule: ${avatarVariation.watch_detail_rule || "visible running watch on one wrist, no readable UI, no logo, no watch-checking pose"}
- Watch rotation policy: ${avatarVariation.watch_rotation_policy || WATCH_ROTATION_POLICY}
- Running equipment rule: ${equipmentRule}
- Camera angle: ${avatarVariation.angle}
- Face expression: ${avatarVariation.expression}
- Weather: ${avatarVariation.weather}
- Lighting: ${avatarVariation.lighting}
- Watch rule: ${characterAnchor.watch_rule}

## Hook Composition For Picture 1
- Composition family: ${hookComposition.id || "legacy_avatar_angle"}
- Label: ${hookComposition.label || avatarVariation.angle}
- Selection rule: ${hookComposition.selected_by || "legacy avatar variation"}
- Rotation policy: ${hookComposition.rotation_policy || "legacy avatar angle rotation"}
- Priority rule: ${hookComposition.composition_priority || "use avatar variation angle"}
- Direction: ${hookComposition.direction || avatarVariation.angle}
- Camera distance: ${hookComposition.camera_distance || "natural creator-style frame"}
- Camera height: ${hookComposition.camera_height || "natural phone height"}
- Lens feel: ${hookComposition.lens_feel || "realistic phone/tripod capture"}
- Subject scale: ${hookComposition.subject_scale || "runner scale should vary naturally"}
- Face visibility: ${hookComposition.face_visibility || "face can rotate naturally with the selected angle"}
- Movement state: ${hookComposition.movement_state || workoutPhase.body_language}
- Negative-space zone: ${hookComposition.negative_space_zone || "clean natural space for overlay text"}
- Background depth: ${hookComposition.background_depth || "selected visual world should remain specific and legible"}
- Do not default to the common centered waist-up runner hero crop unless this selected composition explicitly requires it.

## Schema Prompt Adapted To Theme
${imagePrompt}

## Final Prompt To Use
Hard composition requirement before anything else: ${hookComposition.label || avatarVariation.angle}. ${hookComposition.direction || avatarVariation.angle}. Camera distance: ${hookComposition.camera_distance || "natural creator-style frame"}. Camera height: ${hookComposition.camera_height || "natural phone height"}. Subject scale: ${hookComposition.subject_scale || "runner scale should vary naturally"}. Face visibility: ${hookComposition.face_visibility || "face can rotate naturally with the selected angle"}. Text-safe negative space: ${hookComposition.negative_space_zone || "clean natural space for overlay text"}. If this composition conflicts with the 2026-04-26 reference image pose or the avatar variation angle, ignore the reference pose and avatar angle. Do not place the face or torso in the center text-safe zone.

Create a photorealistic vertical 9:16 image of the selected ${identityLabel}: ${characterAnchor.identity_prompt}. The image should feel like a real TikTok runner/creator capture rather than a polished ad, brand thumbnail, or stock fitness campaign.

${characterAnchor.reference_instruction} Preserve the selected runner's appearance energy while adapting the route, pose, workout phase, camera angle, crop distance, face visibility, subject scale, and expression to this pack. Face expression for this image when the face is visible: ${avatarVariation.expression}. ${characterAnchor.account_profile === "watch" ? "For Runner Watch Lab, the mature male runner's face must be visible enough to verify the older lifelong-runner identity; use a side-profile or three-quarter face if the composition needs motion, but do not use a rear-only or unreadable-face shot." : "The face can be hidden, partial, side-profile, small in frame, or not readable when the selected hook composition says so; identity should still carry through build, hair, running kit, posture, silhouette, sweat, and serious runner energy."} ${identityFallbackRule} The reference image background is not part of the identity. Replace it with a new ${backgroundLock.selected_visual_world} background matching this deck. Do not copy the reference image background, hands-on-hips pose, centered portrait crop, or visible watch unless the hook is specifically about watch anxiety.

Workout phase: ${workoutPhase.label}. Capture this moment: ${workoutPhase.moment}. Body language should show ${workoutPhase.body_language}. ${workoutPhase.prompt_cue}.

Wardrobe and running equipment for this image: ${avatarVariation.top}, ${avatarVariation.shorts}, ${avatarVariation.headwear}, ${avatarVariation.eyewear}, and ${avatarVariation.watch}. ${equipmentRule}. If headwear is "no headwear", do not add a cap, hat, beanie, headband, or other headwear. Eyewear is disabled for now: do not add glasses, sunglasses, sport eyewear, or clear lenses. Watch instruction: ${avatarVariation.watch_detail_rule || "visible Apple Watch-style or Garmin-style running watch on one wrist, small in-frame, no readable UI, no logo, no wrist close-up, no watch-checking pose"}. The watch should support the ${watchContextLabel} but must not become the subject of the image.

Scene: ${vibe.background}. Keep the image inside the selected visual world: ${hookBrief.visual_world}. The background must visibly fit ${hookBrief.visual_world}; do not import a different primary route world such as ${otherPrimaryWorlds}, gym, track, or street. If the selected world is lake, mountains or hills may appear only as distant background context while the lake remains primary. The image should feel like ${vibe.vibe}. Weather: ${avatarVariation.weather}. Lighting: ${avatarVariation.lighting}. Match the deck lighting family: ${hookBrief.lighting_family}. The runner should look like a real person in a real run moment, not a model shoot. Keep body mechanics natural. Use realistic daylight, visible background detail, and a creator-native running post aesthetic: specific, human, slightly imperfect, and not overproduced.

Composition: follow this selected hook composition first: ${hookComposition.label || avatarVariation.angle}. ${hookComposition.direction || avatarVariation.angle}. If this conflicts with the avatar variation camera angle, the hook composition wins; the avatar variation supplies wardrobe, weather, lighting, and expression only. Camera distance: ${hookComposition.camera_distance || "natural creator-style frame"}. Camera height: ${hookComposition.camera_height || "natural phone height"}. Lens feel: ${hookComposition.lens_feel || "realistic phone/tripod capture"}. Subject scale: ${hookComposition.subject_scale || "runner scale should vary naturally"}. Face visibility: ${hookComposition.face_visibility || "face can rotate naturally with the selected angle"}. Movement state: ${hookComposition.movement_state || workoutPhase.body_language}. Negative space for local overlay text: ${hookComposition.negative_space_zone || "clean natural space for overlay text"}. Background depth: ${hookComposition.background_depth || "selected visual world should remain specific and legible"}. Do not default to the common centered waist-up, front-facing, three-quarter, scenic hero crop unless that is explicitly the selected composition. No face distortion, no watch-checking pose, no hands-on-hips hero pose, no repeated static hero framing, no exaggerated emotion. Show the viewer emotion as ${hookBrief.emotion} through believable body language, face tension when visible, and scene tension, not theatrical acting. Use a natural creator-style crop with enough clean negative space for the hook overlay, but avoid a staged poster layout.

## Character / Brand Anchor
${characterAnchor.brand_anchor_prompt}

## Negative Constraints
Avoid: ${vibe.avoid.join(", ")}.
Do not change the primary route/world from ${hookBrief.visual_world}. Lake decks may include mountains or hills in the background only when the lake path remains the clear primary world.
No text, no watermark, no brand logos, no readable watch UI, no app UI, no wrist close-up, no watch-checking pose, no extra limbs, no distorted hands, no fake steam, no blurred-out background.
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
    "gpt_image_2_0",
    "codex_imagegen_tool"
  ]);
  assert(allowedGenerators.has(generator), "Hook provenance must declare an approved image generator.");
  assert(provenance.created_at || provenance.generated_at, "Hook provenance must include created_at or generated_at.");
}

function hookProvenanceUsesFallback(provenance) {
  return provenance?.fallback_used === true
    || /fallback_reused_approved_hook_image|explicit_fallback_hook_image/i.test(String(provenance?.mode || ""));
}

async function copyHookProvenance({ hookProvenance, packDir }) {
  const destination = path.join(packDir, "source/hook-provenance.json");
  if (!hookProvenance) {
    if (await exists(destination)) {
      const existing = await readJson(destination);
      validateHookProvenanceData(existing);
      return { mode: "existing_hook_provenance", path: destination, data: existing };
    }
    return null;
  }

  const data = await readJson(path.resolve(hookProvenance));
  validateHookProvenanceData(data);
  await writeJson(destination, data);
  return { mode: "provided_hook_provenance", path: destination, data };
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

function realPostizAccountId(platform, tiktokAccount = null) {
  if (platform === "tiktok") return resolveTiktokPostizAccountId(tiktokAccount) || null;
  if (platform === "instagram") return process.env.POSTIZ_INSTAGRAM_ACCOUNT_ID || null;
  return null;
}

function postizAccount(platform, tiktokAccount = null) {
  const accountId = realPostizAccountId(platform, tiktokAccount);
  const profile = platform === "tiktok" ? tiktokAccountProfile(tiktokAccount) : null;
  return {
    account_id: accountId || `manual_${platform}_account`,
    platform,
    status: accountId ? "env_configured" : "manual_placeholder",
    ...(profile ? {
      profile: profile.profile,
      label: profile.label,
      content_lane: profile.lane,
      env_key: profile.env_key
    } : {})
  };
}

function postizPost({ packDir, platform, renderedPaths, scheduledAt, publishMode, tiktokAccount }) {
  const account = postizAccount(platform, tiktokAccount);
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
      scheduled_at: scheduledAt,
      account_profile: account.profile || "main"
    };
  }

  return {
    slideshow_id: path.basename(packDir),
    pack_dir: packDir,
    account_id: account.account_id,
    platform: "instagram",
    type: "instagram-carousel",
    publish_mode: publishMode,
    output_mode: "photo_carousel",
    media_type: "CAROUSEL_ALBUM",
    media_paths: renderedPaths,
    caption_path: path.join(packDir, "copy/instagram-postiz-caption.txt"),
    scheduled_at: scheduledAt
  };
}

function assertLiveScheduleEnv({ liveSchedule, schedulePlatform, publishMode, tiktokAccount = null }) {
  const platforms = parseSchedulePlatforms(schedulePlatform);
  const accounts = [...platforms].map((platform) => postizAccount(platform, tiktokAccount));
  if (liveSchedule) {
    assert(process.env.POSTIZ_ENABLE_LIVE_POSTING === "1", "--live-schedule requires POSTIZ_ENABLE_LIVE_POSTING=1.");
    assert(process.env.POSTIZ_API_KEY, "--live-schedule requires POSTIZ_API_KEY.");
    assert(process.env.POSTIZ_URL || process.env.POSTIZ_PUBLIC_API_BASE, "--live-schedule requires POSTIZ_URL or POSTIZ_PUBLIC_API_BASE.");
    assert(publishMode === "direct-public", "--live-schedule requires --publish-mode direct-public for TikTok direct public production.");
    assert(!(platforms.has("tiktok") && tiktokAccountProfile(tiktokAccount).profile === "watch"), "Runner Watch Lab uses TikTok MEDIA_UPLOAD inbox handoff like Everyday Runner Lab. Generate with --no-schedule, then run npm run slideshow:upload-both -- --pack <pack> --skip-instagram --tiktok-account watch.");
    for (const platform of platforms) {
      const accountId = realPostizAccountId(platform, tiktokAccount);
      const envHint = platform === "tiktok"
        ? tiktokAccountEnvHint(tiktokAccount)
        : `POSTIZ_${platform.toUpperCase()}_ACCOUNT_ID`;
      assert(accountId, `--live-schedule requires ${envHint}.`);
    }
  }
  return { platforms, accounts };
}

async function prepareCompactPublicMedia({ packDir, mediaDir = COMPACT_PUBLIC_MEDIA_DIR }) {
  await run("node", [
    "scripts/prepare_tiktok_photo_carousel_media.mjs",
    "--pack",
    packDir,
    "--out-dir",
    mediaDir
  ]);
}

async function uploadSlideshowPublicMedia({ packDir, campaignDate, storageSlug, manifestOut, includeMetadata, publicMediaDir = COMPACT_PUBLIC_MEDIA_DIR }) {
  await prepareCompactPublicMedia({ packDir, mediaDir: publicMediaDir });
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
    "--public-media-dir",
    publicMediaDir,
    "--skip-private",
    "--skip-rendered-png",
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
  const publicMediaDir = uploadManifest.upload_policy?.public_media_dirs?.[0] || null;

  return {
    mediaPaths: publicMediaDir
      ? publicMediaPathsForMediaDir({ packDir, mediaDir: publicMediaDir, uploadManifest })
      : publicMediaPathsForRenderedSlides({ packDir, manifest, uploadManifest }),
    uploadManifest,
    uploadManifestPath,
    mediaTransport: "supabase_public_https"
  };
}

function buildPostizSchedule({ packDir, manifest, mediaPaths, scheduledAt, liveSchedule, schedulePlatform, publishMode, publicMediaManifestPath, mediaTransport, tiktokAccount }) {
  const renderedPaths = mediaPaths || renderedMediaPathsForManifest({ packDir, manifest });
  const { platforms, accounts } = assertLiveScheduleEnv({ liveSchedule, schedulePlatform, publishMode, tiktokAccount });
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
    posts: [...platforms].map((platform) => postizPost({ packDir, platform, renderedPaths, scheduledAt, publishMode, tiktokAccount }))
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
  let noSchedule = flags.has("--no-schedule");
  let liveSchedule = flags.has("--live-schedule");
  const schedulePlatform = args.get("--schedule-platform") || (liveSchedule ? "tiktok" : "all");
  let publishMode = args.get("--publish-mode") || (liveSchedule ? "direct-public" : "manual-review");
  const tiktokAccount = args.get("--tiktok-account") || args.get("--tiktok-profile") || null;
  const uploadPublicMedia = flags.has("--upload-public-media");
  const publicMediaManifestPath = args.get("--public-media-manifest");
  const includeSupabaseMetadata = flags.has("--with-supabase-metadata");
  const usageLog = args.get("--usage-log");
  const includeSelectedUsage = flags.has("--include-selected-usage") || flags.has("--count-selected-usage");
  const scheduledAt = args.get("--scheduled-at") || defaultScheduledAt();
  const hookReferenceImageOverride = args.get("--hook-reference-image");
  const hookStyleReferenceImageOverride = args.get("--hook-style-reference-image");
  const hookVariationBankPath = args.get("--hook-variation-bank");
  const existingPacksRoot = args.get("--existing-packs-root");

  assert(!(production && mockHook), "--production cannot be combined with --mock-hook.");
  assert(!(generateOpenAiHook && hookImage), "--generate-openai-hook cannot be combined with --hook-image.");
  assert(!(uploadPublicMedia && publicMediaManifestPath), "--upload-public-media creates a fresh manifest; use --public-media-manifest only for an existing upload manifest.");
  assert(!liveSchedule || production, "--live-schedule requires --production.");
  assert(["manual-review", "direct-public"].includes(publishMode), "--publish-mode must be manual-review or direct-public.");
  assertLiveScheduleEnv({ liveSchedule, schedulePlatform, publishMode, tiktokAccount });

  await runLocalScript("scripts/validate_slideshow_engine.mjs", []);
  if (!flags.has("--use-existing-topics")) {
    await runLocalScript("scripts/generate_slideshow_topics.mjs", [
      "--date",
      date,
      "--limit",
      String(limit),
      "--out",
      topicOut,
      ...(problemsPath ? ["--problems", problemsPath] : []),
      ...(minScore ? ["--min-score", minScore] : []),
      ...(flags.has("--disable-hook-dedupe") ? ["--disable-hook-dedupe"] : []),
      ...(flags.has("--disable-slide-text-dedupe") ? ["--disable-slide-text-dedupe"] : []),
      ...(flags.has("--disable-world-rotation") ? ["--disable-world-rotation"] : []),
      ...(flags.has("--include-reddit-hook-sources") ? ["--include-reddit-hook-sources"] : []),
      ...(hookVariationBankPath ? ["--hook-variation-bank", hookVariationBankPath] : []),
      ...(tiktokAccount ? ["--tiktok-account", tiktokAccount] : []),
      ...(existingPacksRoot ? ["--existing-packs-root", existingPacksRoot] : []),
      ...(flags.has("--disable-hook-variation-bank") ? ["--disable-hook-variation-bank"] : [])
    ]);
  } else {
    assert(await exists(topicOut), `--use-existing-topics requires an existing topics file: ${topicOut}`);
  }

  const topics = await readJson(topicOut);
  assert(Array.isArray(topics.candidates) && topics.candidates.length > 0, "No slideshow topic candidates generated.");
  assert(candidateIndex >= 0 && candidateIndex < topics.candidates.length, `candidate-index ${candidateIndex} is out of range.`);

  const candidate = topics.candidates[candidateIndex];
  const schema = await readJson(path.join(SCHEMA_DIR, `${candidate.schema}.json`));
  const slug = args.get("--slug") || packSlugForCandidate(date, candidate);
  const packDir = path.resolve(outRoot, slug);
  if (await exists(packDir)) {
    assert(force, `Pack already exists: ${packDir}. Use --force to overwrite generated files.`);
  }

  const hookBrief = buildHookBriefJson({ candidate, schema, tiktokAccount });
  assert(hookBrief.prompt_compiler?.coherence_status === "passed", `Hook prompt compiler found phase conflicts: ${(hookBrief.prompt_compiler?.conflict_patterns || []).join(", ")}`);
  const useCoachiAppCta = shouldUseCoachiAppCta({ slug, candidate, tiktokAccount });
  const marketingSelections = await buildMarketingSelections({ candidate, slug, useCoachiAppCta, tiktokAccount });
  const captions = await buildCaptions(candidate, marketingSelections);
  const manifest = buildRenderManifest({ candidate, schema, hookBrief, slug, marketingSelections, tiktokAccount });
  const canonicalSlideshow = buildCanonicalSlideshowJson({ slug, candidate, manifest, hookBrief, captions });
  const images20Prompt = buildImages20Prompt({ schema, candidate, hookBrief });
  await writeJson(path.join(packDir, "render-manifest.json"), manifest);
  await writeJson(path.join(packDir, "source/slideshow.json"), canonicalSlideshow);
  await writeJson(path.join(packDir, "source/hook-brief.json"), hookBrief);
  await writeJson(path.join(packDir, "source/hook-candidates.json"), {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    source_of_truth: "strategy/automation/tiktok-instagram-slideshow-content-engine/SOURCE_OF_TRUTH_X_ARTICLE.md",
    text_bank: candidate.tiktok_text_bank || null,
    selected_hook: candidate.hook,
    selected_hook_quality: candidate.selected_hook_quality || null,
    minimum_score: candidate.selected_hook_quality?.min_score || 56,
    rule: "Generate 8-10 source-backed or viral-format hook candidates, score each 1-10 across the Coachi quality rubric, and render only if the selected hook passes.",
    candidates: candidate.hook_candidates || []
  });
  await writeText(path.join(packDir, "source/hook.txt"), `${candidate.hook}\n`);
  await writeText(path.join(packDir, "source/images-2-0-hook-prompt.md"), images20Prompt);
  await writeText(path.join(packDir, "copy/tiktok-caption.txt"), `${captions.tiktok}\n`);
  await writeText(path.join(packDir, "copy/instagram-caption.txt"), `${captions.instagram}\n`);
  await writeText(path.join(packDir, "copy/hashtags.txt"), captions.hashtags);
  await writeText(path.join(packDir, "copy/tiktok-postiz-caption.txt"), captionWithHashtags(captions.tiktok, captions.hashtags));
  await writeText(path.join(packDir, "copy/instagram-postiz-caption.txt"), captionWithHashtags(captions.instagram, captions.hashtags));
  await writeText(path.join(packDir, "source/prompts.md"), images20Prompt);

  if (generateOpenAiHook) {
    const effectiveHookReferenceImage = hookReferenceImageOverride || hookBrief.character_anchor?.reference_image || DEFAULT_HOOK_REFERENCE_IMAGE;
    const isSingleReferenceIdentity = ["watch", "marathon"].includes(hookBrief.character_anchor?.account_profile)
      || ["watch", "marathon"].includes(hookBrief.avatar_variation?.identity_profile?.profile);
    const hookBriefHasStyleReference = Object.prototype.hasOwnProperty.call(hookBrief.character_anchor || {}, "style_reference_image");
    const effectiveHookStyleReferenceImage = hookStyleReferenceImageOverride
      || (isSingleReferenceIdentity
        ? null
        : hookBriefHasStyleReference
          ? hookBrief.character_anchor.style_reference_image
          : DEFAULT_HOOK_STYLE_REFERENCE_IMAGE);
    const hookImageArgs = [
      "--pack",
      packDir,
      "--model",
      args.get("--openai-image-model") || "gpt-image-2",
      "--size",
      args.get("--openai-image-size") || "1024x1536",
      "--quality",
      args.get("--openai-image-quality") || "high",
      "--reference-image",
      effectiveHookReferenceImage
    ];
    if (effectiveHookStyleReferenceImage) {
      hookImageArgs.push("--style-reference-image", effectiveHookStyleReferenceImage);
    }
    if (flags.has("--disable-hook-fallback") || flags.has("--disable-fallback")) {
      hookImageArgs.push("--disable-fallback");
    }
    await runLocalScript("scripts/generate_openai_hook_image.mjs", hookImageArgs);
  }

  const picklistPath = path.join(packDir, "asset-picklist.json");
  const materializeReportPath = path.join(packDir, "materialize-report.json");
  const assetPrepAccountProfile = hookBrief.character_anchor?.account_profile
    || tiktokAccountProfile(tiktokAccount).profile;
  const assetPrepArgs = [
    "--manifest",
    path.join(packDir, "render-manifest.json"),
    "--out",
    picklistPath,
    ...(assetPrepAccountProfile === "marathon"
      ? ["--supabase-library", ROAD_TO_MARATHON_FIT_SUPABASE_LIBRARY_MANIFEST]
      : []),
    ...(production ? ["--production"] : []),
    ...(allowNeedsReview ? ["--allow-needs-review"] : []),
    ...(localLibrary ? ["--local-library"] : []),
    ...(usageLog ? ["--usage-log", usageLog] : []),
    ...(includeSelectedUsage ? ["--include-selected-usage"] : [])
  ];
  await runLocalScript("scripts/prepare_slideshow_assets.mjs", [
    ...assetPrepArgs
  ]);
  await runLocalScript("scripts/materialize_slideshow_sources.mjs", [
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
	  const fallbackHookUsed = hookProvenanceUsesFallback(provenance?.data);
	  const fallbackPublishDowngrade = fallbackHookUsed && (publishMode === "direct-public" || liveSchedule);
	  if (fallbackPublishDowngrade) {
	    publishMode = "manual-review";
	    liveSchedule = false;
	  }

	  await runLocalScript(
	    "scripts/render_slideshow_deck.mjs",
    ["--manifest", path.join(packDir, "render-manifest.json")],
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
	    mediaTransport: publicMedia.mediaTransport,
	    tiktokAccount
	  });
	  if (fallbackHookUsed) {
	    schedule.hook_image_fallback = {
	      fallback_used: true,
	      policy: "manual_review_required",
	      note: "OpenAI hook image generation fell back to an approved prior hook image. Review slide 1 before publishing."
	    };
	  }
	  await writeJson(schedulePath, schedule);
  await runLocalScript("scripts/qa_slideshow_pack.mjs", [
    "--pack",
    packDir,
    ...(production ? ["--production"] : []),
    ...(allowNeedsReview ? ["--allow-needs-review"] : [])
  ]);
  await recordBankUsage(CTA_BANK_PATH, marketingSelections.cta?.id, "entries");
  await recordBankUsage(CAPTION_BANK_PATH, captions.caption_template_id, "templates");
  await recordBankUsage(HASHTAG_SETS_PATH, marketingSelections.hashtag_set?.id, "sets");
  let repurposeReport = null;
  try {
    const repurpose = await runLocalScript("scripts/repurpose_pack.mjs", [
      "--pack",
      packDir,
      "--date",
      date
    ], { capture: true });
    repurposeReport = JSON.parse(repurpose.stdout);
  } catch (error) {
    repurposeReport = {
      ok: false,
      error: error.message,
      policy: "non_fatal_channel_derivation"
    };
  }
  if (!noSchedule) {
    await runLocalScript("scripts/slideshow_queue_worker.mjs", ["--schedule", schedulePath]);
  }

  const report = {
    ok: true,
    status: production ? "production_ready" : "draft_ready",
    generated_at: new Date().toISOString(),
    source_article: "https://x.com/alexcooldev/status/2047715075457507452",
    mode: production ? "production_pack" : mockHook ? "local_test_with_mock_hook" : "draft_pack",
	    publish_mode: publishMode,
	    hook_image_fallback: fallbackHookUsed
	      ? {
	          fallback_used: true,
	          publish_downgraded_to_manual_review: fallbackPublishDowngrade,
	          policy: "fallback is allowed for manual-review packs only"
	        }
	      : { fallback_used: false },
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
      repurposeReport?.ok ? "derived Instagram/X/Reddit/Pinterest channel copy" : "channel copy derivation skipped or failed non-fatally",
      "built Postiz dry-run schedule",
      noSchedule ? "skipped queue dry-run by flag" : "ran Postiz queue dry-run"
    ],
    candidate: {
      problem_id: candidate.problem_id,
      schema: candidate.schema,
      format_id: candidate.format_id || null,
      content_pillar: candidate.content_pillar || null,
      research_status: candidate.research_status || null,
      hook: candidate.hook,
      source_url: candidate.source_url,
      exact_words: candidate.exact_words || null,
      problem_type: candidate.problem_type,
      selected_hook_quality: candidate.selected_hook_quality || null,
      hook_source: candidate.hook_source || null,
      slide_text_source: candidate.slide_text_source || null,
      tiktok_text_bank: candidate.tiktok_text_bank || null
    },
    hook_brief: path.relative(process.cwd(), path.join(packDir, "source/hook-brief.json")),
    slideshow_json: path.relative(process.cwd(), path.join(packDir, "source/slideshow.json")),
    hook_candidates: path.relative(process.cwd(), path.join(packDir, "source/hook-candidates.json")),
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
    repurposed_outputs: repurposeReport,
    live_schedule: liveSchedule,
    tiktok_account_profile: tiktokAccountProfile(tiktokAccount),
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
