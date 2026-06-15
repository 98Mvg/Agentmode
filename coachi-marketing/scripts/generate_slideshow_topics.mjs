#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import {
  MIN_HOOK_QUALITY_SCORE,
  countWords,
  isAllowedHook,
  scoreCoachiHook
} from "./slideshow_quality_rules.mjs";

const DEFAULT_PROBLEMS_PATH = "inputs/research/raw-runner-problems.json";
const DEFAULT_SCHEMAS_DIR = "strategy/automation/tiktok-instagram-slideshow-content-engine/schemas";
const DEFAULT_OUTPUT_DIR = "outputs/daily";
const DEFAULT_TIKTOK_TEXT_BANK_PATH = "inputs/research/tiktok-proven-slideshow-text-bank.json";
const DEFAULT_TIKTOK_HOOK_VARIATION_BANK_PATH = "inputs/research/tiktok-viral-hook-variation-bank.json";
const DEFAULT_FORMAT_CATALOG_PATH = "strategy/automation/tiktok-instagram-slideshow-content-engine/formats/coachi-formats.json";
const DEFAULT_LIMIT = 5;
const DEFAULT_POSTED_SLIDESHOWS_PATH = "inputs/performance/posted-slideshows.json";
const DEFAULT_EXISTING_PACKS_ROOT = "content/slideshows";
const VIRAL_TIKTOK_HOOK_SOURCES = [
  DEFAULT_TIKTOK_TEXT_BANK_PATH,
  DEFAULT_TIKTOK_HOOK_VARIATION_BANK_PATH,
  "inputs/research/tiktok-running-hook-pattern-bank.md",
  "outputs/daily/2026-04-26-tiktok-viral-hook-format-analysis.md"
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
  node scripts/generate_slideshow_topics.mjs
  node scripts/generate_slideshow_topics.mjs --date 2026-04-27 --limit 5 --out outputs/daily/2026-04-27-slideshow-topic-candidates.json

Generates slideshow topic candidates from real runner problems. This does not call AI and does not create public posts.

Hook options:
  --hook-variation-bank inputs/research/tiktok-viral-hook-variation-bank.json
  --disable-hook-variation-bank
  --include-reddit-hook-sources`);
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function readOptionalText(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return "";
    throw error;
  }
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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function hookKey(hook) {
  return String(hook || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function includesRedditSource(value) {
  const text = String(value || "").toLowerCase();
  return text.includes("reddit.com")
    || text.includes("reddit-winning-language-bank")
    || /outputs\/daily\/.*reddit/.test(text);
}

function isRedditHookSourceProblem(problem) {
  if (!problem || typeof problem !== "object") return false;
  if (String(problem.platform || "").toLowerCase() === "reddit") return true;
  if (String(problem.source_type || "").toLowerCase().includes("reddit")) return true;
  if (includesRedditSource(problem.source_url)) return true;

  if (problem.platform || problem.source_type || problem.source_url) return false;
  return (problem.sourced_mistakes || []).some((mistake) => includesRedditSource(mistake?.source_url));
}

function hashString(value) {
  let hash = 0;
  for (const char of String(value || "")) {
    hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  }
  return Math.abs(hash);
}

function scoreProblem(problem) {
  return Number.isFinite(problem.total_score)
    ? problem.total_score
    : [
        problem.score_frequency_1_5,
        problem.score_emotion_1_5,
        problem.score_product_fit_1_5,
        problem.score_content_clarity_1_5
      ].reduce((total, value) => total + (Number(value) || 0), 0);
}

const SCHEMA_OPTIONS_BY_PROBLEM_TYPE = {
  "easy-run pace drift": ["before_after_coaching_v1", "app_demo_proof_v1", "easy_run_simple_tips_v1", "runner_mistake_reframe_v1", "top_5_mistakes_v1", "how_to_fix_v1"],
  "zone-2 confusion": ["myth_vs_truth_v1", "runner_mistake_reframe_v1", "myth_breaker_v1", "top_5_mistakes_v1", "top_5_rules_v1"],
  "heart-rate panic": ["reddit_question_v1", "before_after_coaching_v1", "app_demo_proof_v1", "runner_mistake_reframe_v1", "top_5_mistakes_v1", "top_5_rules_v1"],
  "watch-checking anxiety": ["app_demo_proof_v1", "before_after_coaching_v1", "runner_mistake_reframe_v1", "myth_breaker_v1", "top_5_mistakes_v1"],
  "pace disbelief": ["myth_vs_truth_v1", "runner_mistake_reframe_v1", "myth_breaker_v1", "top_5_mistakes_v1"],
  "workout-racing": ["how_to_fix_v1", "runner_mistake_reframe_v1", "top_5_mistakes_v1"],
  "metric setup confusion": ["top_5_rules_v1", "runner_mistake_reframe_v1"],
  "beginner uncertainty": ["reddit_question_v1", "things_i_wish_i_knew_v1", "easy_run_simple_tips_v1", "how_to_fix_v1"],
  "data-without-coaching": ["founder_built_this_v1", "app_demo_proof_v1", "data_is_not_coaching_v1", "myth_breaker_v1"],
  "exercise-ring frustration": ["myth_breaker_v1", "top_5_rules_v1"],
  "comparison spiral": ["myth_breaker_v1", "runner_mistake_reframe_v1", "things_i_wish_i_knew_v1"],
  "watch-buying confusion": ["top_5_rules_v1", "myth_breaker_v1"],
  "easy-run form breakdown": ["how_to_fix_v1", "easy_run_simple_tips_v1"],
  "easy-run expectation mismatch": ["how_to_fix_v1", "easy_run_simple_tips_v1", "runner_mistake_reframe_v1"]
};

function schemaForProblem(problemOrType, recentSchemaCounts = new Map()) {
  const problem = typeof problemOrType === "object" && problemOrType ? problemOrType : null;
  const problemType = problem?.problem_type || problemOrType;
  const options = SCHEMA_OPTIONS_BY_PROBLEM_TYPE[problemType] || ["how_to_fix_v1"];
  if (options.length === 1) return options[0];
  const seed = problem
    ? [problem.id, problem.source_url, problem.exact_words, problem.content_angle, problem.problem_type].filter(Boolean).join("|")
    : String(problemType || "");
  const offset = hashString(seed) % options.length;
  const ordered = options.map((_, index) => options[(index + offset) % options.length]);
  return ordered.sort((left, right) => (recentSchemaCounts.get(left) || 0) - (recentSchemaCounts.get(right) || 0))[0];
}

const FORMAT_ID_BY_PROBLEM_TYPE = {
  "easy-run pace drift": "easy_run_too_fast",
  "zone-2 confusion": "nobody_talks_about_zone2",
  "heart-rate panic": "heart_rate_training_myths",
  "watch-checking anxiety": "stop_racing_easy_runs",
  "pace disbelief": "heart_rate_training_myths",
  "workout-racing": "stop_racing_easy_runs",
  "metric setup confusion": "heart_rate_training_myths",
  "beginner uncertainty": "beginner_runner_rules",
  "data-without-coaching": "why_you_plateau",
  "exercise-ring frustration": "beginner_runner_rules",
  "comparison spiral": "things_i_wish_i_knew_running",
  "watch-buying confusion": "beginner_runner_rules",
  "easy-run form breakdown": "easy_run_too_fast",
  "easy-run expectation mismatch": "easy_run_too_fast"
};

function formatIdForProblem(problem, schemaName) {
  if (FORMAT_ID_BY_PROBLEM_TYPE[problem.problem_type]) return FORMAT_ID_BY_PROBLEM_TYPE[problem.problem_type];
  if (schemaName === "things_i_wish_i_knew_v1") return "things_i_wish_i_knew_running";
  if (schemaName === "top_5_mistakes_v1") return "top_running_mistakes";
  return "top_running_mistakes";
}

function hookForProblem(problem) {
  const overrideHook = (problem.content_angle || problem.exact_words || "").trim();
  if (overrideHook) return overrideHook;
  const type = problem.problem_type;
  if (type === "zone-2 confusion") return "ZONE 2 IS CONFUSING";
  if (type === "heart-rate panic") return "DON'T PANIC MID RUN";
  if (type === "watch-checking anxiety") return "STOP JUDGING EVERY RUN";
  if (type === "pace disbelief") return "YOUR PACE IS LYING TO YOU";
  if (type === "exercise-ring frustration") return "THE WORKOUT STILL COUNTS";
  if (type === "easy-run pace drift") return "EASY RUNS FAIL SLOWLY";
  if (type === "data-without-coaching") return "MORE FEEDBACK ISN'T COACHING";
  return problem.content_angle || problem.exact_words;
}

function coreIdeaForProblem(problem) {
  const type = problem.problem_type;
  const base = {
    problem_summary: problem.content_angle || problem.exact_words,
    emotion: problem.emotion || "confused",
    pattern: "overthinking",
    topic: "running progress",
    issue: "running feels confusing",
    behavior: "overthinking the run",
    not_problem: "your pace",
    setup: "Most runners think the number tells the whole story.",
    value_points: [
      "The route changes the effort.",
      "Fatigue changes the signal.",
      "Control matters more than proving fitness."
    ],
    reframe: "Progress is not just faster splits.",
    coachi_connection: "That is why I built Coachi: simple guidance while you run.",
    cta: "Save this before your next run."
  };

  const byType = {
    "zone-2 confusion": {
      pattern: "zone confusion",
      topic: "zone 2 running",
      issue: "zone 2 feels too slow",
      behavior: "forcing the zone",
      not_problem: "slow pace",
      setup: "Zone 2 can feel embarrassingly slow.",
      value_points: [
        "The goal is easy effort, not ego.",
        "Heat and hills can push heart rate up.",
        "Walk breaks can be part of the session."
      ],
      reframe: "Zone 2 is a tool, not a verdict.",
      coachi_connection: "Coachi helps you stay in the zone without staring at the watch.",
      cta: "Save this for your next easy run."
    },
    "heart-rate panic": {
      pattern: "number anxiety",
      topic: "running heart rate",
      issue: "heart rate looks too high",
      behavior: "panicking over one number",
      not_problem: "high heart rate",
      setup: "A high number can make a good run feel wrong.",
      value_points: [
        "Heat can raise heart rate.",
        "Sleep and stress can raise it too.",
        "Effort tells you if the run is controlled."
      ],
      reframe: "The spike needs context before judgment.",
      coachi_connection: "Coachi keeps the run focused before one number ruins it.",
      cta: "Save this before judging one run."
    },
    "watch-checking anxiety": {
      pattern: "watch anxiety",
      topic: "watch checking",
      issue: "you keep checking the watch",
      behavior: "checking every split",
      not_problem: "the watch",
      setup: "The run starts feeling like an exam.",
      value_points: [
        "Every glance creates another judgment.",
        "Instant pace jumps more than effort.",
        "The body often knows before the screen."
      ],
      reframe: "Use the watch as a coach, not a courtroom.",
      coachi_connection: "Coachi is built for fewer watch checks and clearer run guidance.",
      cta: "Your next run should feel controlled."
    },
    "pace disbelief": {
      pattern: "effort vs pace",
      topic: "running pace",
      issue: "pace feels wrong",
      behavior: "trusting instant pace too much",
      not_problem: "one slower split",
      setup: "Pace feels objective until the route changes.",
      value_points: [
        "Hills change pace.",
        "Wind changes pace.",
        "Fatigue changes pace too."
      ],
      reframe: "Effort is the signal behind the split.",
      coachi_connection: "Coachi helps judge the session by context, not one split.",
      cta: "Save this for your next run."
    },
    "easy-run pace drift": {
      pattern: "inconsistency",
      topic: "easy runs",
      issue: "easy runs turn hard",
      behavior: "racing the easy day",
      not_problem: "running slow",
      setup: "Easy runs usually fail slowly.",
      value_points: [
        "Speeding up a little adds up.",
        "Ego makes the pace creep.",
        "Control is the workout."
      ],
      reframe: "The win is finishing easy.",
      coachi_connection: "That is why Coachi speaks up when easy turns too hard.",
      cta: "Try Coachi if you always run too fast."
    },
    "data-without-coaching": {
      problem_summary: "The problem is not more numbers. It is knowing what the watch means.",
      pattern: "number anxiety",
      topic: "running numbers",
      issue: "the watch gives no next step",
      behavior: "collecting more numbers",
      not_problem: "more numbers",
      setup: "A watch can measure the run without explaining it.",
      value_points: [
        "Pace needs route context.",
        "Heart rate needs body context.",
        "Training needs a next decision."
      ],
      reframe: "Numbers need coaching before they become action.",
      coachi_connection: "Coachi turns the run into one useful next step.",
      cta: "Follow for smarter running."
    },
    "workout-racing": {
      pattern: "overtraining",
      topic: "running workouts",
      issue: "workouts turn into races",
      behavior: "proving fitness in training",
      not_problem: "hard workouts",
      setup: "A workout can be hard without becoming a race.",
      value_points: [
        "The first rep should not win the session.",
        "Control keeps the last rep useful.",
        "Training is practice, not proof."
      ],
      reframe: "The best workout is the one you can recover from.",
      coachi_connection: "Coachi helps keep the workout inside the effort you picked.",
      cta: "Save this before your next workout."
    },
    "metric setup confusion": {
      pattern: "number anxiety",
      topic: "heart-rate zones",
      issue: "zone charts do not match",
      behavior: "comparing formulas",
      not_problem: "the formula",
      setup: "Two zone charts can make one run feel impossible.",
      value_points: [
        "Different formulas use different assumptions.",
        "Your body does not care about the chart.",
        "A repeatable rule beats constant recalculation."
      ],
      reframe: "Pick the system that helps you train consistently.",
      coachi_connection: "Coachi keeps the zone simple while you are actually running.",
      cta: "Save this if zones feel random."
    },
    "exercise-ring frustration": {
      pattern: "watch anxiety",
      topic: "Apple Watch rings",
      issue: "the ring misses the workout",
      behavior: "letting credit define the run",
      not_problem: "the ring",
      setup: "A missing ring can make a real workout feel fake.",
      value_points: [
        "The body still did the work.",
        "Device credit is not coaching.",
        "Training value is bigger than a badge."
      ],
      reframe: "The workout counts before the ring does.",
      coachi_connection: "Coachi focuses on what the session did, not just the badge.",
      cta: "Your next run should feel controlled."
    },
    "comparison spiral": {
      pattern: "overthinking",
      topic: "running comparison",
      issue: "other runners look faster",
      behavior: "judging your run by someone else's pace",
      not_problem: "being slower",
      setup: "Comparison makes normal progress feel invisible.",
      value_points: [
        "Your route is different.",
        "Your history is different.",
        "Your repeatable week matters more."
      ],
      reframe: "Borrow lessons, not pressure.",
      coachi_connection: "Coachi keeps the run focused on your effort.",
      cta: "Follow for smarter running."
    },
    "watch-buying confusion": {
      pattern: "watch choice",
      topic: "running watch choice",
      issue: "watch specs all sound important",
      behavior: "buying the flashiest feature list",
      not_problem: "needing the perfect watch",
      setup: "A running watch should fit the runs you actually do.",
      value_points: [
        "Buttons matter when hands are sweaty.",
        "Battery matters more than extra charts.",
        "Comfort beats a giant spec sheet."
      ],
      reframe: "Choose the watch that makes training simpler.",
      coachi_connection: "Coachi says what to do mid-run.",
      cta: "Save before buying a watch."
    },
    "easy-run form breakdown": {
      pattern: "form control",
      topic: "easy-run form",
      issue: "easy runs feel awkward",
      behavior: "slowing down until the stride falls apart",
      not_problem: "running slowly",
      setup: "Easy pace is not a crawl.",
      value_points: [
        "Keep the steps short.",
        "Keep the rhythm calm.",
        "If form falls apart, reset first."
      ],
      reframe: "The goal is relaxed, not collapsed.",
      coachi_connection: "Coachi helps keep the run easy without making you crawl.",
      cta: "Save this for your next easy run."
    },
    "easy-run expectation mismatch": {
      pattern: "expectation mismatch",
      topic: "easy runs",
      issue: "easy runs never feel easy",
      behavior: "starting too close to the ceiling",
      not_problem: "being bad at running",
      setup: "Easy is not a pace promise.",
      value_points: [
        "The first minutes feel fine.",
        "Then breathing creeps up.",
        "Set the ceiling early."
      ],
      reframe: "Easy means repeatable, not impressive.",
      coachi_connection: "Coachi speaks up before easy turns into hard.",
      cta: "Save this before your next easy run."
    }
  };

  return {
    ...base,
    ...(byType[type] || {}),
    problem_summary: byType[type]?.problem_summary || problem.content_angle || base.problem_summary,
    emotion: problem.emotion || byType[type]?.emotion || base.emotion
  };
}

const TIKTOK_NATIVE_HOOK_PATTERNS = [
  { format: "top_5_mistakes", template: "Top 5 {topic} mistakes", reason: "simple list hook; easy to understand before swiping" },
  { format: "top_5_rules", template: "Top 5 {topic} rules", reason: "direct TikTok slideshow format with clear payoff" },
  { format: "five_things", template: "5 things runners get wrong", reason: "broad, simple, and native to TikTok/Instagram slideshows" },
  { format: "six_rules", template: "6 rules for better running", reason: "rule-based list format creates saves" },
  { format: "things_i_wish_i_knew", template: "{count} things I wish I knew", reason: "observed repeatedly in beginner runner slideshow/photo posts" },
  { format: "top_tips", template: "My top {count} running tips", reason: "native creator language from runner-tip search surfaces" },
  { format: "starter_routine", template: "The running routine that works", reason: "routine hooks show up strongly in beginner running results" },
  { format: "how_to_start", template: "How to start running", reason: "simple how-to phrasing appears in high-fit beginner search results" },
  { format: "how_to_run_longer", template: "How to run longer", reason: "direct beginner pain point from running-tip results" },
  { format: "make_it_easier", template: "Make running feel easier", reason: "comfort/ease promise showed up across running tips and easy run results" },
  { format: "simple_but_works", template: "Simple running tips that work", reason: "simple/consistent framing showed up in easy-run and general running searches" },
  { format: "running_hacks", template: "Running hacks I wish I knew", reason: "hacks/wish-I-knew format appeared in visible running slideshow examples" },
  { format: "beginner_rules", template: "{count} rules for beginner runners", reason: "rules/list structure is easy to save and swipe" },
  { format: "mistakes", template: "{count} mistakes new runners make", reason: "mistake list is a proven TikTok/Instagram learning format" },
  { format: "stop_doing", template: "Stop doing this on runs", reason: "contrarian correction works for watch-checking, easy runs, and workouts" },
  { format: "nobody_tells_you", template: "What nobody tells beginner runners", reason: "curiosity format observed in running-tip examples" },
  { format: "proper_easy_run", template: "How to do an easy run", reason: "easy-run search results use direct educational hooks" },
  { format: "slow_down", template: "Slow down to run better", reason: "zone 2 results cluster around slow-down advice" },
  { format: "consistency_progress", template: "{count} weeks of consistent running", reason: "progress-documentation hooks appear in zone 2/running results" }
];

const SIMPLE_TOPIC_BY_TYPE = {
  "zone-2 confusion": "Zone 2",
  "heart-rate panic": "easy run",
  "watch-checking anxiety": "easy run",
  "pace disbelief": "pace",
  "easy-run pace drift": "easy run",
  "data-without-coaching": "running",
  "workout-racing": "workout",
  "metric setup confusion": "training zone",
  "exercise-ring frustration": "workout",
  "comparison spiral": "running",
  "watch-buying confusion": "running watch",
  "beginner uncertainty": "beginner running",
  "easy-run form breakdown": "easy-run form",
  "easy-run expectation mismatch": "easy run"
};

const PROBLEM_KEYWORDS_BY_TYPE = {
  "zone-2 confusion": ["zone", "slow", "easy", "run", "walking"],
  "heart-rate panic": ["heart", "rate", "easy", "run", "panic"],
  "watch-checking anxiety": ["watch", "checking", "run", "easy"],
  "pace disbelief": ["pace", "easy", "run", "lying"],
  "easy-run pace drift": ["easy", "run", "slow", "drift", "races"],
  "data-without-coaching": ["coach", "coaching", "running", "watch", "plan"],
  "workout-racing": ["workout", "workouts", "racing", "hard", "reps"],
  "metric setup confusion": ["zone", "training", "rules"],
  "exercise-ring frustration": ["workout", "counts", "ring"],
  "comparison spiral": ["running", "bad", "progress"],
  "watch-buying confusion": ["watch", "garmin", "apple", "fitbit", "buy", "choose", "compare"],
  "beginner uncertainty": ["beginner", "running", "scary", "start"],
  "easy-run form breakdown": ["easy", "slow", "run", "form", "awkward", "rhythm"],
  "easy-run expectation mismatch": ["easy", "run", "feel", "hard", "slow", "breathing"]
};

const TENSION_WORDS = [
  "wrong",
  "mistake",
  "mistakes",
  "stop",
  "not",
  "lying",
  "fail",
  "fails",
  "scary",
  "slow",
  "hard",
  "better",
  "perfect",
  "racing"
];

function wordCount(value) {
  return countWords(value);
}

function hookQualityBreakdown(hook, problem, sourceMeta = {}) {
  return scoreCoachiHook(hook, problem, sourceMeta).breakdown;
}

function hookQualityRationale(hook, breakdown, sourceMeta = {}) {
  const parts = [
    `${breakdown.score}/${breakdown.max_score || 70}`,
    `${wordCount(hook)} words`,
    sourceMeta.source_family_id ? `bank family ${sourceMeta.source_family_id}` : sourceMeta.source || "pattern fallback",
    `pain ${breakdown.runner_pain_specificity}/10`,
    `curiosity ${breakdown.curiosity}/10`,
    `simplicity ${breakdown.simplicity}/10`
  ];
  if (breakdown.score >= MIN_HOOK_QUALITY_SCORE && !breakdown.banned_matches?.length) parts.push("passes quality gate");
  if (breakdown.banned_matches?.length) parts.push(`blocked wording: ${breakdown.banned_matches.join(", ")}`);
  return parts.join("; ");
}

function hookSourceEntry(hook, sourceMeta = {}) {
  return {
    hook,
    source: sourceMeta.source || "pattern_fallback",
    source_family_id: sourceMeta.source_family_id || null,
    source_signal: sourceMeta.source_signal || null,
    source_url: sourceMeta.source_url || null,
    why_it_works: sourceMeta.why_it_works || "simple TikTok-observed hook shape with a clear payoff before swiping"
  };
}

const APPROVED_VISUAL_WORLDS = {
  forest: {
    visual_world: "forest",
    route_tag: "forest",
    lighting_family: "soft green morning forest light"
  },
  mountain: {
    visual_world: "mountain",
    route_tag: "mountain",
    lighting_family: "clear mountain morning light"
  },
  lake: {
    visual_world: "lake",
    route_tag: "lake",
    lighting_family: "calm lake daylight"
  }
};
const VISUAL_WORLD_ROTATION = ["lake", "mountain", "forest"];

const VISUAL_WORLD_BY_TYPE = {
  "easy-run pace drift": APPROVED_VISUAL_WORLDS.forest,
  "zone-2 confusion": APPROVED_VISUAL_WORLDS.lake,
  "heart-rate panic": APPROVED_VISUAL_WORLDS.lake,
  "watch-checking anxiety": APPROVED_VISUAL_WORLDS.forest,
  "pace disbelief": APPROVED_VISUAL_WORLDS.mountain,
  "workout-racing": APPROVED_VISUAL_WORLDS.mountain,
  "metric setup confusion": APPROVED_VISUAL_WORLDS.lake,
  "exercise-ring frustration": APPROVED_VISUAL_WORLDS.forest,
  "comparison spiral": APPROVED_VISUAL_WORLDS.lake,
  "watch-buying confusion": APPROVED_VISUAL_WORLDS.lake,
  "beginner uncertainty": APPROVED_VISUAL_WORLDS.lake,
  "data-without-coaching": APPROVED_VISUAL_WORLDS.forest,
  "easy-run form breakdown": APPROVED_VISUAL_WORLDS.forest,
  "easy-run expectation mismatch": APPROVED_VISUAL_WORLDS.forest
};

function visualWorldForProblem(problem) {
  return VISUAL_WORLD_BY_TYPE[problem.problem_type] || APPROVED_VISUAL_WORLDS.forest;
}

function canonicalVisualWorldId(value, fallback = "forest") {
  const text = String(value || "").toLowerCase();
  if (/\bmountain\b|\bhill\b|\buphill\b|\bclimb\b|\bridge\b/.test(text)) return "mountain";
  if (/\blake\b|\briverside\b|\bwater\b|\bcoastal\b/.test(text)) return "lake";
  if (/\bforest\b|\btrail\b|\bwood\b|\btrees?\b/.test(text)) return "forest";
  return APPROVED_VISUAL_WORLDS[fallback] ? fallback : "forest";
}

function nextVisualWorldId(previousWorld) {
  const previous = canonicalVisualWorldId(previousWorld, VISUAL_WORLD_ROTATION[VISUAL_WORLD_ROTATION.length - 1]);
  const index = VISUAL_WORLD_ROTATION.indexOf(previous);
  if (index === -1) return VISUAL_WORLD_ROTATION[0];
  return VISUAL_WORLD_ROTATION[(index + 1) % VISUAL_WORLD_ROTATION.length];
}

function visualWorldAtOffset(startWorld, offset) {
  const start = canonicalVisualWorldId(startWorld, VISUAL_WORLD_ROTATION[0]);
  const index = VISUAL_WORLD_ROTATION.indexOf(start);
  return VISUAL_WORLD_ROTATION[(index + offset) % VISUAL_WORLD_ROTATION.length];
}

async function latestVisualWorldFromPacks(packRoot) {
  const latestReady = [];
  const latestFallback = [];
  try {
    const entries = await fs.readdir(packRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const packDir = path.join(packRoot, entry.name);
      const qaPath = path.join(packDir, "source/qa-report.json");
      const qaReport = await readOptionalJson(qaPath, null);
      const qaPasses = qaReport?.ok === true && qaReport?.pass === true && qaReport?.production === true;
      for (const relativePath of ["source/hook-brief.json", "render-manifest.json", "source/slideshow.json"]) {
        const filePath = path.join(packDir, relativePath);
        const data = await readOptionalJson(filePath, null);
        const visualWorld = data?.visual_world || data?.visual_system?.visual_world || null;
        if (!visualWorld) continue;
        const stat = await fs.stat(qaPasses ? qaPath : filePath);
        const entry = {
          visual_world: canonicalVisualWorldId(visualWorld),
          file_path: filePath,
          qa_report_path: qaPasses ? qaPath : null,
          mtime_ms: stat.mtimeMs,
          source_status: qaPasses ? "production_qa_passed" : "metadata_fallback"
        };
        if (qaPasses) latestReady.push(entry);
        else latestFallback.push(entry);
        break;
      }
    }
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }

  latestReady.sort((left, right) => right.mtime_ms - left.mtime_ms);
  if (latestReady[0]) return latestReady[0];
  latestFallback.sort((left, right) => right.mtime_ms - left.mtime_ms);
  return latestFallback[0] || null;
}

function applyVisualWorldRotation(candidate, worldId, rotationMeta = {}) {
  const world = APPROVED_VISUAL_WORLDS[worldId] || APPROVED_VISUAL_WORLDS.forest;
  const worldCollection = world.visual_world === "mountain"
    ? "hills_effort"
    : world.visual_world === "lake"
      ? "lake_calm"
      : "nature_context";
  return {
    ...candidate,
    visual_world: world.visual_world,
    route_tag: world.route_tag,
    lighting_family: world.lighting_family,
    visual_world_rotation: {
      enabled: true,
      order: VISUAL_WORLD_ROTATION,
      selected_world: world.visual_world,
      previous_world: rotationMeta.previous_world || null,
      selected_by: rotationMeta.selected_by || "latest-pack-round-robin"
    },
    visual_mapping: (candidate.visual_mapping || []).map((slide) => {
      const isHook = slide.slide_number === 1 || slide.asset_source === "images_2_0";
      const isCta = slide.slide_number === 7 || slide.visual_collection === "cta_ending";
      return {
        ...slide,
        visual_world: world.visual_world,
        ...(isHook || isCta ? {} : { visual_collection: worldCollection })
      };
    })
  };
}

const BEST_VIRAL_HOOK_BY_TYPE = {
  "zone-2 confusion": "Zone 2 should feel slow",
  "heart-rate panic": "Top 5 easy run mistakes",
  "watch-checking anxiety": "Stop checking the watch",
  "pace disbelief": "The easy run mistake",
  "easy-run pace drift": "Top 5 easy run mistakes",
  "data-without-coaching": "You do not need a perfect plan",
  "workout-racing": "Top 5 workout mistakes",
  "metric setup confusion": "Top 5 training zone rules",
  "exercise-ring frustration": "You do not need a perfect plan",
  "comparison spiral": "You are not bad at running",
  "beginner uncertainty": "5 things I wish I knew",
  "easy-run form breakdown": "Why easy runs feel awkward",
  "easy-run expectation mismatch": "Why easy runs never feel easy",
  "watch-buying confusion": "Garmin vs Apple Watch"
};

function problemTypeTextPack(problem, textBank) {
  if (!textBank?.problem_type_packs) return null;
  if (textBank.problem_type_packs[problem.problem_type]) return textBank.problem_type_packs[problem.problem_type];
  if (problem.problem_type === "easy-run form breakdown") return null;
  if (problem.problem_type === "easy-run expectation mismatch") return null;
  return textBank.problem_type_packs.default || null;
}

function bankHookFamiliesById(textBank) {
  return new Map((textBank?.hook_families || []).map((family) => [family.id, family]));
}

function mergeHookVariationBank(textBank, variationBank, variationBankPath = DEFAULT_TIKTOK_HOOK_VARIATION_BANK_PATH) {
  if (!textBank || !Array.isArray(variationBank?.patterns)) return textBank;

  const merged = JSON.parse(JSON.stringify(textBank));
  merged.hook_families ||= [];
  merged.problem_type_packs ||= {};
  merged._hook_variation_bank_path = variationBankPath;
  merged._hook_variation_bank_summary = {
    selected_patterns: variationBank.collection_summary?.selected_patterns || variationBank.patterns.length,
    total_variations: variationBank.collection_summary?.total_variations
      || variationBank.patterns.reduce((total, pattern) => total + (pattern.variations?.length || 0), 0)
  };

  const familyIds = new Set(merged.hook_families.map((family) => family.id));
  const hooksByProblemType = new Map();

  for (const pattern of variationBank.patterns) {
    if (!pattern?.pattern_id || !Array.isArray(pattern.variations)) continue;
    const familyId = `variation_${pattern.pattern_id}`;
    const safeHooks = pattern.variations
      .map((variation) => String(variation?.hook || "").trim())
      .filter(Boolean)
      .filter(isAllowedHook);

    if (safeHooks.length === 0) continue;
    if (!familyIds.has(familyId)) {
      merged.hook_families.push({
        id: familyId,
        source_excerpt: pattern.source?.source_excerpt || pattern.pattern_id,
        source_signal: pattern.source?.visible_signal || "variation bank",
        source_url: pattern.source?.source_url || variationBankPath,
        mechanism: pattern.mechanism || "source-backed variation",
        problem_types: pattern.problem_types || [],
        safe_hook_shapes: safeHooks.slice(0, 5)
      });
      familyIds.add(familyId);
    }

    for (const problemType of pattern.problem_types || []) {
      if (!merged.problem_type_packs[problemType]) {
        merged.problem_type_packs[problemType] = {
          preferred_hooks: [],
          preferred_hook_family_ids: []
        };
      }
      if (!hooksByProblemType.has(problemType)) hooksByProblemType.set(problemType, []);
      for (const hook of safeHooks) {
        hooksByProblemType.get(problemType).push({ text: hook, source_family_id: familyId });
      }
    }
  }

  for (const [problemType, hooks] of hooksByProblemType.entries()) {
    const pack = merged.problem_type_packs[problemType];
    pack.preferred_hooks ||= [];
    pack.preferred_hook_family_ids ||= [];
    const existingHooks = new Set(pack.preferred_hooks.map((entry) => hookKey(entry.text)));
    const existingFamilies = new Set(pack.preferred_hook_family_ids);

    for (const hook of hooks) {
      if (existingHooks.has(hookKey(hook.text))) continue;
      pack.preferred_hooks.push(hook);
      existingHooks.add(hookKey(hook.text));
      if (!existingFamilies.has(hook.source_family_id)) {
        pack.preferred_hook_family_ids.push(hook.source_family_id);
        existingFamilies.add(hook.source_family_id);
      }
    }
  }

  return merged;
}

function bankHooksForProblem(problem, textBank, avoidHookKeys = null) {
  const pack = problemTypeTextPack(problem, textBank);
  if (!pack?.preferred_hooks?.length) return [];
  const families = bankHookFamiliesById(textBank);
  return pack.preferred_hooks
    .filter((entry) => entry?.text && assertNoBannedHookWords(entry.text))
    .filter((entry) => {
      if (!avoidHookKeys?.size) return true;
      return !avoidHookKeys.has(hookKey(entry.text));
    })
    .map((entry) => {
      const family = families.get(entry.source_family_id);
      return {
        hook: entry.text,
        source_family_id: entry.source_family_id,
        source_signal: family?.source_signal || null,
        source_url: family?.source_url || null,
        why_it_works: family
          ? `${family.mechanism} shape from source-backed TikTok hook (${family.source_signal}).`
          : "source-backed TikTok hook shape"
      };
    });
}

function bestTikTokBankHook(problem, textBank, avoidHookKeys = null) {
  return bankHooksForProblem(problem, textBank, avoidHookKeys)[0]?.hook || null;
}

const EXTRA_VIRAL_TIKTOK_HOOKS = [
  "5 things I wish I knew",
  "5 things runners get wrong",
  "6 rules for better running",
  "My top 5 running tips",
  "The running routine that works",
  "The best beginner running routine",
  "How to start running",
  "How to actually make progress running",
  "How to run longer",
  "Make running feel easier",
  "Simple running tips that work",
  "Running hacks I wish I knew",
  "Small fixes for easier runs",
  "Try this on your next run",
  "This made running easier",
  "Slow down to run better",
  "Zone 2 should feel slow",
  "Stop racing easy runs",
  "How to do an easy run",
  "Easy runs are not races",
  "Most runners miss easy runs",
  "The easy run mistake",
  "You do not need a perfect plan",
  "Getting into running can be scary",
  "You are not bad at running"
];

function fillTikTokPattern(pattern, core, index) {
  const counts = [5, 6, 3, 4, 7];
  const topic = core.simple_topic || core.topic;
  return pattern.template
    .replace("{count}", String(counts[index % counts.length]))
    .replace("{topic}", topic)
    .replace(/\s+/g, " ")
    .trim();
}

function assertNoBannedHookWords(hook) {
  return isAllowedHook(hook);
}

function formatNumberedPoint(text, index) {
  const clean = String(text)
    .replace(/^\s*\d+[\).\s-]+/, "")
    .trim()
    .replace(/[.!?]+(["”'])$/, "$1")
    .replace(/[.!?]+$/, "");
  return `${index + 1}. ${clean}.`;
}

function sourcedTopFivePoints(problem) {
  const mistakes = problem.sourced_mistakes || problem.real_mistakes || [];
  if (!Array.isArray(mistakes) || mistakes.length < 5) return null;
  return mistakes
    .slice(0, 5)
    .map((mistake, index) => formatNumberedPoint(typeof mistake === "string" ? mistake : mistake.text, index));
}

function bestTikTokHookForProblem(problem, core, textBank = null, avoidHookKeys = null) {
  const bankHook = bestTikTokBankHook(problem, textBank, avoidHookKeys);
  if (bankHook) return bankHook;

  const fallback = BEST_VIRAL_HOOK_BY_TYPE[problem.problem_type] || "5 things runners get wrong";
  if (!avoidHookKeys?.size) return fallback;
  if (!avoidHookKeys.has(hookKey(fallback))) return fallback;

  const candidates = uniqueHooks([
    ...TIKTOK_NATIVE_HOOK_PATTERNS.map((pattern, index) => fillTikTokPattern(pattern, core, index)),
    ...EXTRA_VIRAL_TIKTOK_HOOKS
  ])
    .filter(assertNoBannedHookWords)
    .filter((hook) => !avoidHookKeys.has(hookKey(hook)));

  return candidates[0] || fallback;
}

function problemSpecificHookVariants(problem, core) {
  const type = problem.problem_type;
  const topic = core.simple_topic || core.topic || "running";
  const byType = {
    "easy-run pace drift": [
      "Why minute 3 changes easy runs",
      "Your easy pace is not embarrassing",
      "I still start easy runs too fast",
      "The 10-minute easy run trap"
    ],
    "zone-2 confusion": [
      "5 zone 2 lies runners believe",
      "Zone 2 should feel boring",
      "Your easy pace is not embarrassing",
      "I still run zone 2 too fast"
    ],
    "heart-rate panic": [
      "Why 176 bpm can lie",
      "Your heart rate is not failure",
      "I still panic at high heart rate",
      "The first 10 minutes can lie"
    ],
    "beginner uncertainty": [
      "Why minute 1 feels like failure",
      "The 10-minute rule beginners need",
      "Your first run is not a test",
      "I still take walk breaks"
    ],
    "watch-checking anxiety": [
      "Your watch is not the coach",
      "Stop judging minute 1",
      "I still check my watch too much",
      "One split does not know the run"
    ],
    "pace disbelief": [
      "Your pace is not embarrassing",
      "I still run slower than planned",
      "Why slow pace can be right",
      "The first split can lie"
    ]
  };

  return (byType[type] || [
    `One number is not ${topic}`,
    `Your ${topic} is not a test`
  ])
    .map((hook) => hook.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 4);
}

function hookSourceRankingBoost(source) {
  if (source === "problem_content_angle" || source === "problem_exact_words") return 5;
  if (source === "problem_specific_hook_variant") return 4;
  if (source === "tiktok_text_bank") return 3;
  if (source === "problem_type_default") return 2;
  if (source === "viral_format_pattern") return 1;
  return 0;
}

function scoredHookCandidatesForProblem(problem, core, textBank = null, avoidHookKeys = null) {
  const bankHooks = bankHooksForProblem(problem, textBank, avoidHookKeys).map((entry) => hookSourceEntry(entry.hook, {
    source: "tiktok_text_bank",
    source_family_id: entry.source_family_id,
    source_signal: entry.source_signal,
    source_url: entry.source_url,
    why_it_works: entry.why_it_works
  }));
  const fallback = BEST_VIRAL_HOOK_BY_TYPE[problem.problem_type] || "5 things runners get wrong";
  const rawEntries = [
    ...bankHooks,
    hookSourceEntry(problem.content_angle, { source: "problem_content_angle" }),
    hookSourceEntry(problem.exact_words, { source: "problem_exact_words" }),
    ...problemSpecificHookVariants(problem, core).map((hook) => hookSourceEntry(hook, {
      source: "problem_specific_hook_variant",
      why_it_works: "adds a concrete number, first-person confession, or direct-address contradiction for stronger curiosity without leaving the runner problem"
    })),
    hookSourceEntry(fallback, { source: "problem_type_default" }),
    ...TIKTOK_NATIVE_HOOK_PATTERNS.map((pattern, index) => hookSourceEntry(fillTikTokPattern(pattern, core, index), {
      source: "viral_format_pattern",
      why_it_works: pattern.reason
    })),
    ...EXTRA_VIRAL_TIKTOK_HOOKS.map((hook) => hookSourceEntry(hook, { source: "viral_hook_bank_fallback" }))
  ];

  const seen = new Set();
  return rawEntries
    .map((entry) => ({
      ...entry,
      hook: String(entry.hook || "").trim()
    }))
    .filter((entry) => entry.hook)
    .filter((entry) => {
      const key = hookKey(entry.hook);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .filter((entry) => assertNoBannedHookWords(entry.hook))
    .filter((entry) => !avoidHookKeys?.size || !avoidHookKeys.has(hookKey(entry.hook)))
    .map((entry) => {
      const quality = scoreCoachiHook(entry.hook, problem, entry);
      return {
        ...entry,
        score: quality.score,
        max_score: quality.max_score,
        min_score: MIN_HOOK_QUALITY_SCORE,
        passes_quality_gate: quality.passes_quality_gate,
        word_count: quality.word_count,
        breakdown: quality.breakdown,
        rationale: quality.rationale
      };
    })
    .sort((left, right) => {
      const leftRank = left.score + hookSourceRankingBoost(left.source);
      const rightRank = right.score + hookSourceRankingBoost(right.source);
      if (rightRank !== leftRank) return rightRank - leftRank;
      const leftBank = left.source === "tiktok_text_bank" ? 1 : 0;
      const rightBank = right.source === "tiktok_text_bank" ? 1 : 0;
      if (rightBank !== leftBank) return rightBank - leftBank;
      return left.word_count - right.word_count;
    });
}

function selectBestScoredHook(problem, core, textBank = null, avoidHookKeys = null) {
  const scored = scoredHookCandidatesForProblem(problem, core, textBank, avoidHookKeys);
  if (scored.length > 0) {
    const selected = scored.find((entry) => entry.passes_quality_gate) || scored[0];
    const candidateMap = new Map(scored.map((entry) => [hookKey(entry.hook), entry]));
    if (candidateMap.size < 8 && avoidHookKeys?.size) {
      for (const entry of scoredHookCandidatesForProblem(problem, core, textBank, null)) {
        if (candidateMap.size >= 10) break;
        const key = hookKey(entry.hook);
        if (!candidateMap.has(key)) candidateMap.set(key, entry);
      }
    }
    return {
      selected,
      candidates: [...candidateMap.values()].slice(0, 10)
    };
  }

  const fallback = bestTikTokHookForProblem(problem, core, textBank, null);
  const quality = scoreCoachiHook(fallback, problem, { source: "last_resort_fallback" });
  const selected = {
    ...hookSourceEntry(fallback, { source: "last_resort_fallback" }),
    score: quality.score,
    max_score: quality.max_score,
    min_score: MIN_HOOK_QUALITY_SCORE,
    passes_quality_gate: quality.passes_quality_gate,
    word_count: quality.word_count,
    breakdown: quality.breakdown,
    rationale: quality.rationale
  };
  return {
    selected,
    candidates: [selected]
  };
}

function uniqueHooks(hooks) {
  const seen = new Set();
  return hooks
    .map((hook) => hook.trim())
    .filter(Boolean)
    .filter((hook) => {
      const key = hook.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

async function existingHookKeysFromPacks(packRoot) {
  const keys = new Set();
  try {
    const entries = await fs.readdir(packRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const manifestPath = path.join(packRoot, entry.name, "render-manifest.json");
      const manifest = await readOptionalJson(manifestPath, null);
      if (!manifest) continue;
	      const hook = manifest.hook
	        || manifest.hook_text
	        || manifest.slideshow?.hook
	        || manifest.slides?.find((slide) => slide.role === "hook")?.text
	        || manifest.slides?.[0]?.text
	        || null;
	      const hookAliases = []
	        .concat(manifest.hook_aliases || [])
	        .concat(manifest.dedupe_hooks || [])
	        .filter(Boolean);
	      const key = hookKey(hook);
	      if (key) keys.add(key);
	      for (const alias of hookAliases) {
	        const aliasKey = hookKey(alias);
	        if (aliasKey) keys.add(aliasKey);
	      }
	    }
	  } catch (error) {
	    if (error.code === "ENOENT") return keys;
	    throw error;
  }
  return keys;
}

async function existingSlideSetIdsFromPacks(packRoot) {
  const ids = new Set();
  try {
    const entries = await fs.readdir(packRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const sourcePath = path.join(packRoot, entry.name, "source", "hook-brief.json");
      const reportPath = path.join(packRoot, entry.name, "pipeline-run-report.json");
      for (const filePath of [sourcePath, reportPath]) {
        const data = await readOptionalJson(filePath, null);
        const slideSetId = data?.slide_text_source?.slide_set_id
          || data?.candidate?.slide_text_source?.slide_set_id
          || null;
        if (slideSetId) ids.add(slideSetId);
      }
    }
  } catch (error) {
    if (error.code === "ENOENT") return ids;
    throw error;
  }
  return ids;
}

function normalizeCoreSlideCopy(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[“”"']/g, "")
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function coreSlideCopyFromSlides(slides) {
  return (slides || [])
    .filter((slide) => slide.slide_number >= 2 && slide.slide_number <= 6)
    .map((slide) => normalizeCoreSlideCopy(slide.text))
    .filter(Boolean);
}

async function existingCoreSlideCopySetsFromPacks(packRoot) {
  const sets = [];
  try {
    const entries = await fs.readdir(packRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const packDir = path.join(packRoot, entry.name);
      const manifest = await readOptionalJson(path.join(packDir, "render-manifest.json"), null)
        || await readOptionalJson(path.join(packDir, "source", "slideshow.json"), null);
      if (!manifest?.slides?.length) continue;
      const lines = coreSlideCopyFromSlides(manifest.slides);
      if (lines.length < 4) continue;
      sets.push({
        slideshow_id: entry.name,
        lines,
        line_set: new Set(lines),
        signature: lines.join(" | ")
      });
    }
  } catch (error) {
    if (error.code === "ENOENT") return sets;
    throw error;
  }
  return sets;
}

function dateFromPackName(name) {
  const match = String(name || "").match(/^(\d{4}-\d{2}-\d{2})/);
  if (!match) return null;
  const date = new Date(`${match[1]}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeAccountProfile(value) {
  const text = String(value || "").toLowerCase().trim();
  if (!text) return "main";
  if (text.includes("watch") || text.includes("runwatch")) return "watch";
  if (text.includes("main") || text.includes("everyday")) return "main";
  return text;
}

function accountProfilesFromMetadata(manifest, schedule) {
  const profiles = new Set();
  const pushProfile = (value) => {
    if (value === null || value === undefined) return;
    profiles.add(normalizeAccountProfile(value));
  };

  pushProfile(manifest?.tiktok_account_profile?.profile);
  pushProfile(manifest?.tiktok_account_profile);
  pushProfile(manifest?.account_profile);
  pushProfile(manifest?.account);
  for (const account of schedule?.schedule_policy?.accounts || []) {
    pushProfile(account?.account_profile);
    pushProfile(account?.profile);
  }
  for (const account of schedule?.accounts || []) {
    pushProfile(account?.account_profile);
    pushProfile(account?.profile);
  }

  return profiles;
}

async function recentFormatUsageFromPacks(packRoot, { date, accountProfile = "main", windowDays = 5 } = {}) {
  const usage = {
    account_profile: normalizeAccountProfile(accountProfile),
    window_days: windowDays,
    schemaCounts: new Map(),
    formatCounts: new Map(),
    entries: []
  };
  const referenceDate = dateFromPackName(date) || new Date();
  const windowMs = windowDays * 24 * 60 * 60 * 1000;

  try {
    const entries = await fs.readdir(packRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const packDate = dateFromPackName(entry.name);
      if (packDate) {
        const ageMs = referenceDate.getTime() - packDate.getTime();
        if (ageMs < 0 || ageMs >= windowMs) continue;
      }

      const packDir = path.join(packRoot, entry.name);
      const manifest = await readOptionalJson(path.join(packDir, "render-manifest.json"), null);
      if (!manifest) continue;
      if (!packDate) {
        const stat = await fs.stat(path.join(packDir, "render-manifest.json"));
        const ageMs = referenceDate.getTime() - stat.mtimeMs;
        if (ageMs < 0 || ageMs >= windowMs) continue;
      }

      const schedule = await readOptionalJson(path.join(packDir, "postiz-schedule.json"), null);
      const profiles = accountProfilesFromMetadata(manifest, schedule);
      if (profiles.size > 0 && !profiles.has(usage.account_profile)) continue;

      const schema = manifest.schema || manifest.schema_id || null;
      const formatId = manifest.format_id || manifest.formatId || schema || null;
      if (!schema && !formatId) continue;
      if (schema) usage.schemaCounts.set(schema, (usage.schemaCounts.get(schema) || 0) + 1);
      if (formatId) usage.formatCounts.set(formatId, (usage.formatCounts.get(formatId) || 0) + 1);
      usage.entries.push({
        pack: entry.name,
        schema,
        format_id: formatId,
        account_profiles: [...profiles]
      });
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  return usage;
}

function candidateSelectionKey(candidate) {
  return [candidate.problem_id, candidate.hook, candidate.schema, candidate.format_id].filter(Boolean).join("|");
}

function selectWithFormatCooldown(candidates, { limit, disabled = false } = {}) {
  if (disabled) return candidates.slice(0, limit);
  const selected = [];
  const selectedKeys = new Set();
  const selectedFormats = new Set();
  const pushCandidate = (candidate, fallbackMeta = null) => {
    const key = candidateSelectionKey(candidate);
    if (selectedKeys.has(key)) return false;
    selectedKeys.add(key);
    const formatId = candidate.format_id || candidate.schema || "unknown";
    selectedFormats.add(formatId);
    selected.push(fallbackMeta
      ? {
          ...candidate,
          format_cooldown: {
            ...(candidate.format_cooldown || {}),
            fallback_used: true,
            fallback_reason: fallbackMeta
          }
        }
      : candidate);
    return selected.length >= limit;
  };

  for (const candidate of candidates) {
    const formatId = candidate.format_id || candidate.schema || "unknown";
    if ((candidate.format_cooldown?.recent_count || 0) > 0) continue;
    if (selectedFormats.has(formatId)) continue;
    if (pushCandidate(candidate)) return selected;
  }

  for (const candidate of candidates) {
    if (pushCandidate(candidate, "insufficient fresh format families after cooldown")) return selected;
  }

  return selected;
}

function duplicateSlideCopyMatch(slides, existingCoreSlideCopySets) {
  const lines = coreSlideCopyFromSlides(slides);
  if (lines.length < 4) return null;
  const signature = lines.join(" | ");
  for (const existing of existingCoreSlideCopySets || []) {
    const shared = lines.filter((line) => existing.line_set.has(line));
    if (signature === existing.signature || shared.length >= 4) {
      return {
        slideshow_id: existing.slideshow_id,
        shared_lines: shared
      };
    }
  }
  return null;
}

function freshCopyVariantsForProblem(problem, core) {
  const fallback = [
    [
      "Start with the purpose of the run.",
      "Let the first ten minutes settle.",
      "Adjust for hills, heat, and fatigue.",
      "Controlled beats impressive.",
      core.coachi_connection
    ],
    [
      "One run does not need to prove fitness.",
      "Your body changes day to day.",
      "Use the number as context.",
      "Keep the session repeatable.",
      core.coachi_connection
    ]
  ];

  const byType = {
    "comparison spiral": [
      [
        "Someone else's easy pace is not yours.",
        "Different body. Different route. Different week.",
        "Copy the patience, not the split.",
        "The win is finishing controlled.",
        "Coachi keeps the run focused on your effort."
      ],
      [
        "Fast runners make slow look fake.",
        "That does not mean your pace is wrong.",
        "Your easy day should fit your body.",
        "Progress starts with repeatable runs.",
        "Coachi helps you run your session, not theirs."
      ]
    ],
    "easy-run form breakdown": [
      [
        "Form falls apart when easy gets rushed.",
        "Shorter steps usually fix more than force.",
        "Relax the shoulders before chasing cadence.",
        "Smooth beats fast on easy days.",
        "Coachi nudges the run back before it turns messy."
      ],
      [
        "Your stride changes when you panic.",
        "Back off before fixing everything.",
        "Let breathing and rhythm settle first.",
        "Easy form should feel boring.",
        "Coachi helps keep the effort calm while you run."
      ]
    ],
    "easy-run expectation mismatch": [
      [
        "Easy often fails before it feels hard.",
        "The first few minutes can feel fine.",
        "Then breathing slowly creeps up.",
        "Set the ceiling before the run drifts.",
        "Coachi speaks up while there is still time to adjust."
      ],
      [
        "Easy is not one fixed pace.",
        "Heat, hills, sleep, and fatigue move the line.",
        "The goal is a repeatable effort.",
        "Back off before it becomes work.",
        "Coachi helps keep easy days honest in real time."
      ],
      [
        "A controlled run can still feel too slow.",
        "That does not make it wasted.",
        "The point is finishing with room left.",
        "Save the proof for hard days.",
        "Coachi helps protect the purpose of the session."
      ]
    ],
    "heart-rate panic": [
      [
        "A high number is not always a bad run.",
        "Heat, hills, sleep, and stress all push it up.",
        "Look for the trend, not one spike.",
        "Slow down before you judge the session.",
        "Coachi keeps the run focused before the number takes over."
      ],
      [
        "Heart rate can lag behind how you feel.",
        "The first minutes are noisy.",
        "Do not let one spike rewrite the whole run.",
        "Control the effort first.",
        "Coachi helps turn the signal into a next step."
      ]
    ],
    "watch-checking anxiety": [
      [
        "Checking more does not make the run easier.",
        "It usually makes every number feel urgent.",
        "Pick a ceiling before you start.",
        "Then let the run breathe.",
        "Coachi speaks up so you can stop staring down."
      ],
      [
        "Your watch should not become the coach.",
        "Numbers help when they are timed well.",
        "Too many checks turn easy into stress.",
        "Use reminders, not constant panic.",
        "Coachi keeps the watch from taking over."
      ]
    ],
    "data-without-coaching": [
      [
        "More screens can make the run less clear.",
        "The hard part is knowing what to change.",
        "Pick one signal for today's run.",
        "The next decision matters most.",
        "Coachi turns live numbers into simple voice guidance."
      ],
      [
        "A watch can show the problem late.",
        "Coaching should catch it while you run.",
        "Pace and heart rate need context.",
        "The screen should not make every choice.",
        "Coachi gives the next step without another watch check."
      ],
      [
        "Numbers are useful when they lead somewhere.",
        "They are stressful when they just pile up.",
        "Pick the signal for today's run.",
        "Ignore the rest until the session is done.",
        "Coachi keeps the focus on the cue that matters now."
      ]
    ],
    "metric setup confusion": [
      [
        "Zone charts are not magic.",
        "Different watches use different assumptions.",
        "Your effort still matters.",
        "Use zones as guardrails, not judgment.",
        "Coachi keeps the zone simple while you move."
      ],
      [
        "The setting matters before the workout starts.",
        "Bad setup creates noisy decisions.",
        "Check the sensor, zone, or alert first.",
        "Then let the run stay simple.",
        "Coachi works best when live heart rate is clean."
      ],
      [
        "A beep is not the same as coaching.",
        "It tells you something changed.",
        "It does not always tell you what to do.",
        "Make the action clear before you run.",
        "Coachi adds the missing next step."
      ]
    ],
    "watch-buying confusion": [
      [
        "The best watch is not always the biggest spec sheet.",
        "Buttons matter when hands are sweaty.",
        "Comfort matters after the first mile.",
        "Battery only matters for the runs you do.",
        "Coachi can guide the run on top of the watch you actually use."
      ],
      [
        "Start with your real training week.",
        "Short easy runs need different features than ultras.",
        "A watch should reduce friction.",
        "If it adds stress, it is not helping.",
        "Coachi keeps the coaching layer simple across live heart-rate devices."
      ],
      [
        "Garmin, Apple Watch, and Fitbit all have tradeoffs.",
        "No watch removes the need for judgment.",
        "Pick the one you will wear consistently.",
        "Then make the training decisions simpler.",
        "Coachi turns the live signal into a cue while you run."
      ]
    ],
    "zone-2 confusion": [
      [
        "Zone 2 often feels too slow at first.",
        "That does not mean you are doing it wrong.",
        "The goal is repeatable effort.",
        "Save the fight for hard days.",
        "Coachi helps you stay honest without staring at zones."
      ],
      [
        "The awkward pace is usually the point.",
        "You are teaching control, not proving speed.",
        "If it feels too easy, hold it there.",
        "That is where consistency gets built.",
        "Coachi keeps the easy day from drifting."
      ]
    ],
    "easy-run pace drift": [
      [
        "Easy runs usually break one small push at a time.",
        "The first surge feels harmless.",
        "Then the whole run gets louder.",
        "Keep the ceiling early.",
        "Coachi speaks up before easy becomes work."
      ],
      [
        "You do not notice the drift until it is too late.",
        "A little faster becomes a different session.",
        "Hold back while it still feels easy.",
        "That is how the next run stays possible.",
        "Coachi helps catch the drift in real time."
      ],
      [
        "Recovery runs can still tempt you.",
        "Fresh legs are not the goal.",
        "The ceiling matters before the pace does.",
        "Finish like tomorrow still exists.",
        "Coachi helps protect the easy effort."
      ],
      [
        "The drift starts before it feels hard.",
        "A small push changes the whole session.",
        "Hold the line while breathing is calm.",
        "That is the easy-day skill.",
        "That is why I built Coachi for live easy-run nudges."
      ]
    ],
    "pace disbelief": [
      [
        "Pace is not the same signal every day.",
        "Wind, hills, surface, and fatigue change it.",
        "A slower split can still be the right run.",
        "Judge the session by control.",
        "Coachi adds context before one pace number wins."
      ],
      [
        "The watch shows pace. It misses context.",
        "A climb can make easy look slow.",
        "A tired day can do the same.",
        "Stay with the effort you planned.",
        "Coachi helps you trust the right signal."
      ],
      [
        "Minute one is messy data.",
        "Your body is not fully online yet.",
        "Let breathing settle before judging pace.",
        "The first split should not run the day.",
        "Coachi keeps the start from becoming a test."
      ],
      [
        "Hills make pace look worse than effort.",
        "That does not mean the run failed.",
        "Use the climb as context.",
        "Keep the session controlled.",
        "Coachi helps you avoid chasing distorted splits."
      ]
    ],
    "workout-racing": [
      [
        "A workout is not a race in disguise.",
        "The target exists for a reason.",
        "Too hard early steals the last reps.",
        "Finish with control.",
        "Coachi keeps the session inside the plan."
      ],
      [
        "Hard days still need restraint.",
        "The first rep should not decide the workout.",
        "Keep enough room to finish well.",
        "That is better training than surviving.",
        "Coachi helps pace the work while it is happening."
      ]
    ],
    "beginner uncertainty": [
      [
        "Beginner progress is not always faster pace.",
        "Sometimes it is less panic.",
        "Sometimes it is finishing calmer.",
        "That still counts.",
        "Coachi makes the next run easier to understand."
      ],
      [
        "You are not behind because running feels hard.",
        "Most people start too fast.",
        "Slow enough to repeat it.",
        "That is the beginner win.",
        "Coachi helps keep the run simple while you build."
      ]
    ]
  };

  return byType[problem.problem_type] || fallback;
}

function deckFromFreshLines(bestHook, lines, core) {
  const safeLines = [...lines];
  while (safeLines.length < 5) safeLines.push(core.coachi_connection);
  return [
    { slide_number: 1, role: "hook", text: bestHook },
    { slide_number: 2, role: "setup", text: safeLines[0] },
    { slide_number: 3, role: "value", text: safeLines[1] },
    { slide_number: 4, role: "value", text: safeLines[2] },
    { slide_number: 5, role: "value", text: safeLines[3] },
    { slide_number: 6, role: "coachi_connection", text: safeLines[4] },
    { slide_number: 7, role: "cta", text: core.cta }
  ];
}

function freshenDuplicateSlideCopy({ problem, bestHook, existingCoreSlideCopySets }) {
  if (!existingCoreSlideCopySets?.length) return null;
  const core = coreIdeaForProblem(problem);
  core.simple_topic = SIMPLE_TOPIC_BY_TYPE[problem.problem_type] || core.topic;
  const variants = freshCopyVariantsForProblem(problem, core);
  const seed = hashString([problem.id, bestHook, problem.exact_words].filter(Boolean).join("|"));
  const ordered = variants
    .map((variant, index) => ({ variant, index }))
    .sort((left, right) => ((left.index + seed) % variants.length) - ((right.index + seed) % variants.length));

  for (const entry of ordered) {
    const deck = deckFromFreshLines(bestHook, entry.variant, core);
    const duplicateMatch = duplicateSlideCopyMatch(deck, existingCoreSlideCopySets);
    if (!duplicateMatch) {
      return {
        slideshow: deck,
        copy_freshness: {
          repaired_duplicate_core_copy: true,
          rewrite_source: "coachi_deterministic_runner_copy_v1",
          variant_index: entry.index
        }
      };
    }
  }

  return null;
}

async function postedHookKeysFromRegistry(filePath) {
  const keys = new Set();
  const registry = await readOptionalJson(filePath, null);
  const posts = registry?.posts;
  if (!Array.isArray(posts)) return keys;
  for (const post of posts) {
    const key = hookKey(post?.hook);
    if (key) keys.add(key);
  }
  return keys;
}

function topFivePointsForProblem(problem, core) {
  const byType = {
    "heart-rate panic": [
      "1. Trusting the first spike.",
      "2. Calling 176 bpm failure.",
      "3. Ignoring heat and sleep.",
      "4. Chasing pace to calm down.",
      "5. Forgetting effort is the signal."
    ],
    "easy-run pace drift": [
      "1. Trusting minute one. It always lies.",
      "2. Racing the first split. The run pays later.",
      "3. Calling 150 bpm easy because pace looked slow.",
      "4. Speeding up when breathing still feels fine.",
      "5. Finishing empty. Easy means repeatable tomorrow."
    ],
    "zone-2 confusion": [
      "1. Treating zone 2 as a verdict.",
      "2. Refusing the pace that feels embarrassing.",
      "3. Fighting walk breaks too early.",
      "4. Ignoring hills, heat, and fatigue.",
      "5. Forgetting boring is the goal."
    ],
    "workout-racing": [
      "1. Winning the first rep.",
      "2. Turning practice into proof.",
      "3. Ignoring recovery.",
      "4. Letting pace decide effort.",
      "5. Finishing empty too often."
    ],
    "pace disbelief": [
      "1. Trusting instant pace too much.",
      "2. Ignoring hills.",
      "3. Ignoring wind.",
      "4. Comparing every split.",
      "5. Forgetting effort is the signal."
    ],
    "comparison spiral": [
      "1. Copying someone else's pace.",
      "2. Comparing different routes.",
      "3. Ignoring training history.",
      "4. Judging every easy run.",
      "5. Missing your own progress."
    ]
  };

  if (byType[problem.problem_type]) return byType[problem.problem_type];

  const sourcedPoints = sourcedTopFivePoints(problem);
  if (sourcedPoints) return sourcedPoints;

  return [
    `1. Overthinking ${core.topic}.`,
    "2. Chasing the wrong signal.",
    "3. Ignoring context.",
    "4. Changing too much at once.",
    "5. Forgetting consistency."
  ];
}

function provenSlideSetForProblem(problem, textBank, copyDedupe = {}) {
  const pack = problemTypeTextPack(problem, textBank);
  const slideSets = Array.isArray(pack?.slide_sets)
    ? pack.slide_sets.filter((slideSet) => slideSet?.slides_1_to_6?.length)
    : [];
  if (slideSets.length === 0) return null;

  const avoidSlideSetIds = copyDedupe.avoidSlideSetIds || new Set();
  const freshSlideSets = slideSets.filter((slideSet) => !avoidSlideSetIds.has(slideSet.id));
  if (freshSlideSets.length === 0 && avoidSlideSetIds.size > 0) return null;
  const candidates = freshSlideSets.length > 0 ? freshSlideSets : slideSets;
  const seed = [
    problem.id,
    problem.problem_type,
    problem.content_angle,
    problem.exact_words
  ].filter(Boolean).join("|");
  return candidates[hashString(seed) % candidates.length] || null;
}

function slideshowFromProvenBank(problem, core, bestHook, textBank, selectedSlideSet = null) {
  const slideSet = selectedSlideSet || provenSlideSetForProblem(problem, textBank);
  if (!slideSet?.slides_1_to_6?.length) return null;

  const slidesOneToSix = [...slideSet.slides_1_to_6];
  slidesOneToSix[0] = bestHook;
  const isTopFive = /^(top 5|5 mistakes|5 things)/i.test(bestHook);
  const hasSourcedTopFive = Array.isArray(problem.sourced_mistakes) && problem.sourced_mistakes.length >= 5;
  const pointSlides = isTopFive && hasSourcedTopFive
    ? topFivePointsForProblem(problem, core)
    : slidesOneToSix.slice(1, 6);

  if (isTopFive) {
    return [
      { slide_number: 1, role: "hook", text: bestHook },
      { slide_number: 2, role: "point_1", text: pointSlides[0] },
      { slide_number: 3, role: "point_2", text: pointSlides[1] },
      { slide_number: 4, role: "point_3", text: pointSlides[2] },
      { slide_number: 5, role: "point_4", text: pointSlides[3] },
      { slide_number: 6, role: "point_5", text: pointSlides[4] },
      { slide_number: 7, role: "cta", text: core.cta }
    ];
  }

  return [
    { slide_number: 1, role: "hook", text: bestHook },
    { slide_number: 2, role: "setup", text: slidesOneToSix[1] },
    { slide_number: 3, role: "value", text: slidesOneToSix[2] },
    { slide_number: 4, role: "value", text: slidesOneToSix[3] },
    { slide_number: 5, role: "value", text: slidesOneToSix[4] },
    { slide_number: 6, role: "coachi_connection", text: core.coachi_connection },
    { slide_number: 7, role: "cta", text: core.cta }
  ];
}

function slideshowForBestHook(problem, core, bestHook, textBank = null, selectedSlideSet = null) {
  const bankSlideshow = slideshowFromProvenBank(problem, core, bestHook, textBank, selectedSlideSet);
  if (bankSlideshow) return bankSlideshow;

  if (/^(top 5|5 mistakes|5 things)/i.test(bestHook)) {
    const points = topFivePointsForProblem(problem, core);
    return [
      { slide_number: 1, role: "hook", text: bestHook },
      { slide_number: 2, role: "point_1", text: points[0] },
      { slide_number: 3, role: "point_2", text: points[1] },
      { slide_number: 4, role: "point_3", text: points[2] },
      { slide_number: 5, role: "point_4", text: points[3] },
      { slide_number: 6, role: "point_5", text: points[4] },
      { slide_number: 7, role: "cta", text: core.cta }
    ];
  }

  return [
    { slide_number: 1, role: "hook", text: bestHook },
    { slide_number: 2, role: "setup", text: core.setup },
    { slide_number: 3, role: "value", text: core.value_points[0] },
    { slide_number: 4, role: "value", text: core.value_points[1] },
    { slide_number: 5, role: "value", text: core.value_points[2] },
    { slide_number: 6, role: "coachi_connection", text: core.coachi_connection },
    { slide_number: 7, role: "cta", text: core.cta }
  ];
}

function viralHookPackForProblem(problem, textBank = null, avoidHookKeys = null, copyDedupe = {}) {
  const core = coreIdeaForProblem(problem);
  core.simple_topic = SIMPLE_TOPIC_BY_TYPE[problem.problem_type] || core.topic;
  const world = visualWorldForProblem(problem);
  const bankHooks = bankHooksForProblem(problem, textBank, avoidHookKeys);
  const hookSelection = selectBestScoredHook(problem, core, textBank, avoidHookKeys);
  const bestHook = hookSelection.selected.hook;
  const hooks = uniqueHooks([
    bestHook,
    ...bankHooks.map((entry) => entry.hook),
    ...TIKTOK_NATIVE_HOOK_PATTERNS.map((pattern, index) => fillTikTokPattern(pattern, core, index)),
    ...EXTRA_VIRAL_TIKTOK_HOOKS
  ])
    .filter(assertNoBannedHookWords)
    .filter((hook) => !avoidHookKeys?.size || !avoidHookKeys.has(hookKey(hook)))
    .slice(0, 30);

  const topHooks = [
    ...hookSelection.candidates.map((entry) => ({
      hook: entry.hook,
      score: entry.score,
      min_score: entry.min_score,
      passes_quality_gate: entry.passes_quality_gate,
      why_it_works: entry.why_it_works,
      rationale: entry.rationale,
      source_family_id: entry.source_family_id,
      source_signal: entry.source_signal,
      source_url: entry.source_url
    })),
    {
      hook: bestHook,
      score: hookSelection.selected.score,
      min_score: MIN_HOOK_QUALITY_SCORE,
      passes_quality_gate: hookSelection.selected.passes_quality_gate,
      why_it_works: "selected by the Coachi hook quality scorer"
    },
    {
      hook: `5 mistakes that ruin ${core.simple_topic}`,
      why_it_works: "mistake framing creates tension and high save potential"
    },
    {
      hook: `Top 5 ${core.simple_topic} rules`,
      why_it_works: "rule-based list hooks feel native to TikTok slideshow content"
    },
    {
      hook: "5 things runners get wrong",
      why_it_works: "broad, simple, and beginner-friendly without sounding technical"
    },
    {
      hook: "Simple running tips that work",
      why_it_works: "TikTok-native simplicity promise with broad beginner appeal"
    },
    {
      hook: "Running hacks I wish I knew",
      why_it_works: "uses a proven wish-I-knew structure without copying exact creator wording"
    },
    {
      hook: `How to fix ${core.topic}`,
      why_it_works: "direct how-to hook that maps cleanly to a 7-slide payoff"
    }
  ]
    .filter((entry) => assertNoBannedHookWords(entry.hook))
    .filter((entry) => !avoidHookKeys?.size || !avoidHookKeys.has(hookKey(entry.hook)));

  const selectedSlideSet = provenSlideSetForProblem(problem, textBank, copyDedupe);
  const slideshow = slideshowForBestHook(problem, core, bestHook, textBank, selectedSlideSet);
  const selectedHook = bankHooks.find((entry) => entry.hook === bestHook) || null;

  return {
    hook_source_rule: "Use the source-backed TikTok slideshow text bank first; fall back to observed hook pattern docs only when no bank fit exists.",
    hook_sources: VIRAL_TIKTOK_HOOK_SOURCES,
    tiktok_text_bank: textBank ? DEFAULT_TIKTOK_TEXT_BANK_PATH : null,
    hook_variation_bank: textBank?._hook_variation_bank_path || null,
    hook_variation_bank_summary: textBank?._hook_variation_bank_summary || null,
    hook_source: selectedHook,
    slide_text_source: selectedSlideSet
      ? {
          bank_path: DEFAULT_TIKTOK_TEXT_BANK_PATH,
          slide_set_id: selectedSlideSet.id,
          source_family_ids: selectedSlideSet.source_family_ids || []
        }
      : null,
    problem: core.problem_summary,
    emotion: core.emotion,
    pattern: core.pattern,
    visual_world: world.visual_world,
    route_tag: world.route_tag,
    lighting_family: world.lighting_family,
    avatar_world_required: true,
    images_2_0_rule: "slide_1_only",
    cta_required: true,
    hooks,
    top_hooks: topHooks,
    best_hook: bestHook,
    hook_candidates: hookSelection.candidates,
    selected_hook_quality: {
      hook: bestHook,
      score: hookSelection.selected.score,
      max_score: hookSelection.selected.max_score,
      min_score: MIN_HOOK_QUALITY_SCORE,
      passes_quality_gate: hookSelection.selected.passes_quality_gate,
      word_count: hookSelection.selected.word_count,
      breakdown: hookSelection.selected.breakdown,
      rationale: hookSelection.selected.rationale
    },
    slideshow,
    visual_mapping: [
      { slide_number: 1, asset_source: "images_2_0", label: "Generated Avatar Hook", visual_world: world.visual_world },
      { slide_number: 2, visual_collection: "nature_context", label: "Same-world context", visual_world: world.visual_world },
      { slide_number: 3, visual_collection: "details_emotion", label: "Same-world effort/problem", visual_world: world.visual_world },
      { slide_number: 4, visual_collection: "details_emotion", label: "Same-world emotion detail", visual_world: world.visual_world },
      { slide_number: 5, visual_collection: "nature_context", label: "Same-world calm/rule", visual_world: world.visual_world },
      { slide_number: 6, visual_collection: "nature_context", label: "Same-world reframe", visual_world: world.visual_world },
      { slide_number: 7, visual_collection: "cta_ending", label: "Same-world CTA", visual_world: world.visual_world }
    ]
  };
}

function hookForDraft(problem, viralPack) {
  return viralPack?.best_hook
    || viralPack?.slideshow?.find((slide) => slide.role === "hook")?.text
    || viralPack?.slideshow?.[0]?.text
    || hookForProblem(problem);
}

function feltArcLinesForProblem(problem, core) {
  const byType = {
    "easy-run pace drift": [
      "Minute one always feels easier than it is.",
      "The run pays for that split later.",
      "Start slower than pride wants.",
      "Hold back before breathing changes.",
      "Coachi nudges me before easy stops being easy."
    ],
    "heart-rate panic": [
      "The first spike can feel like proof you failed.",
      "Panic turns an easy run into a test.",
      "Give the first 10 minutes context.",
      "Slow down before the watch scares you.",
      "Coachi keeps one number from running the run."
    ],
    "zone-2 confusion": [
      "Zone 2 can feel embarrassingly slow.",
      "Forcing pace quietly turns it into zone 3.",
      "Let boring effort be the target.",
      "Use walk breaks before you need them.",
      "Coachi tells me when easy stops being easy."
    ],
    "beginner uncertainty": [
      "Minute one can feel like a verdict.",
      "Forcing nonstop turns practice into dread.",
      "Start with time, not ego.",
      "Walk before the run falls apart.",
      "Coachi keeps the next run feeling possible."
    ],
    "watch-checking anxiety": [
      "One glance can change the whole run.",
      "Checking too often makes effort feel wrong.",
      "Pick a ceiling before you start.",
      "Let the run settle before judging it.",
      "Coachi gives me a guardrail without the spiral."
    ],
    "pace disbelief": [
      "Slow pace can feel embarrassing.",
      "Chasing the old split makes easy hard.",
      "Let route and fatigue explain the number.",
      "Run the effort you can repeat tomorrow.",
      "Coachi coaches the run, not one split."
    ],
    "data-without-coaching": [
      "The number arrives without an explanation.",
      "More data can create more second-guessing.",
      "Ask what changed before judging the run.",
      "Use the metric as context, not a verdict.",
      "Coachi turns the signal into a next step."
    ]
  };

  return byType[problem.problem_type] || [
    core.setup,
    "The hidden cost is overcorrecting mid-run.",
    "Change one behavior on the next run.",
    "Keep the session repeatable.",
    core.coachi_connection
  ];
}

function mythTruthSlideDraft(problem, core, hook) {
  const topic = core.topic || "running";
  const byType = {
    "zone-2 confusion": [
      "Myth: Zone 2 means one perfect pace.\nTruth: Effort moves day to day.",
      "Myth: Walking ruins the run.\nTruth: Control is the point.",
      "Myth: Slow means unfit.\nTruth: Slow can be correct.",
      "Myth: The watch always knows.\nTruth: Context still matters.",
      "Coachi treats the zone like a guardrail."
    ],
    "heart-rate panic": [
      "Myth: 176 bpm means failure.\nTruth: First spikes need context.",
      "Myth: High HR ruins easy.\nTruth: Effort decides the day.",
      "Myth: Pace fixes panic.\nTruth: Slowing early fixes more.",
      "Myth: One number is truth.\nTruth: Heat and sleep matter.",
      "Coachi keeps one spike from owning the run."
    ]
  };
  const lines = byType[problem.problem_type] || [
    `Myth: ${topic} is one number.\nTruth: The run needs context.`,
    "Myth: Faster always means better.\nTruth: Repeatable beats impressive.",
    "Myth: One bad split proves failure.\nTruth: The trend matters.",
    "Myth: Easy should look fast.\nTruth: Easy should feel controlled.",
    "Coachi turns the signal into guidance."
  ];
  return [
    hook,
    ...lines,
    "Comment the myth you believed."
  ];
}

function founderBuiltThisSlideDraft(problem, core, hook) {
  return [
    hook || "I built this because of one run",
    "My easy run turned hard before I noticed.",
    "The app gave numbers, not coaching.",
    "So I built guidance during the run.",
    "It is early. The feedback loop is real.",
    "Tell me what your watch never explains.",
    "Comment what your app misses."
  ];
}

function beforeAfterSlideDraft(problem, core, hook) {
  const lines = feltArcLinesForProblem(problem, core);
  return [
    hook || "Same runner. Two easy runs.",
    `Without: ${lines[0].replace(/[.!?]+$/, "")}.`,
    `Without: ${lines[1].replace(/[.!?]+$/, "")}.`,
    `With: ${lines[2].replace(/[.!?]+$/, "")}.`,
    `With: ${lines[3].replace(/[.!?]+$/, "")}.`,
    "The difference is hearing it during the run.",
    "Save this before your next easy run."
  ];
}

function redditQuestionSlideDraft(problem, core, hook) {
  const lines = feltArcLinesForProblem(problem, core);
  return [
    hook,
    "You are not broken.",
    lines[0],
    lines[1],
    lines[2],
    "What number makes you second-guess the run?",
    "Comment your confusing run signal."
  ];
}

function appDemoProofSlideDraft(problem, core, hook) {
  const lines = feltArcLinesForProblem(problem, core);
  return [
    hook || "What my AI coach said at minute 12",
    "Your effort is drifting. Ease off now.",
    lines[2] || "I slowed before the run got hard.",
    "Keep this boring for five more minutes.",
    lines[3] || "I finished like I could repeat it.",
    "The useful part was hearing it during the run.",
    "Comment the nudge you need mid-run."
  ];
}

function feltArcSlideDraft(problem, core, hook) {
  const lines = feltArcLinesForProblem(problem, core);
  return [
    hook,
    lines[0],
    lines[1],
    lines[2],
    lines[3],
    lines[4],
    core.cta || "Save this before your next run."
  ];
}

function slideDraftForProblem(problem, schemaName, viralPack = null) {
  const core = coreIdeaForProblem(problem);
  core.simple_topic = SIMPLE_TOPIC_BY_TYPE[problem.problem_type] || core.topic;
  const hook = hookForDraft(problem, viralPack);

  if (schemaName === "top_5_mistakes_v1" || schemaName === "top_5_rules_v1") {
    return [
      hook,
      ...topFivePointsForProblem(problem, core),
      core.cta
    ];
  }
  if (schemaName === "myth_vs_truth_v1") return mythTruthSlideDraft(problem, core, hook);
  if (schemaName === "founder_built_this_v1") return founderBuiltThisSlideDraft(problem, core, hook);
  if (schemaName === "before_after_coaching_v1") return beforeAfterSlideDraft(problem, core, hook);
  if (schemaName === "reddit_question_v1") return redditQuestionSlideDraft(problem, core, hook);
  if (schemaName === "app_demo_proof_v1") return appDemoProofSlideDraft(problem, core, hook);
  if (schemaName === "data_is_not_coaching_v1") {
    return [
      hook,
      "Your watch gives you numbers.",
      "It does not always tell you why.",
      "A coach asks what changed today.",
      "The number needs context.",
      "That is the gap Coachi is built around.",
      "What number messes with your run most?"
    ];
  }

  if (schemaName === "beginner_confidence_reset_v1") {
    return [
      hook,
      "You think progress means faster every run.",
      "Early progress is usually control.",
      "That is why easy days turn hard.",
      "Your next run only needs patience.",
      "Coachi keeps the next run feeling possible.",
      "Save this before your next easy run."
    ];
  }

  return feltArcSlideDraft(problem, core, hook);
}

function buildRecentTextIndex(text) {
  return new Set(
    text
      .split(/\n+/)
      .map((line) => line.trim().toLowerCase())
      .filter((line) => line.length >= 12)
  );
}

async function loadSchemas(schemasDir) {
  const entries = await fs.readdir(schemasDir);
  const schemas = new Map();

  for (const entry of entries) {
    if (!entry.endsWith(".json")) continue;
    const schema = await readJson(path.join(schemasDir, entry));
    schemas.set(schema.format_name, schema);
  }

  return schemas;
}

async function main() {
  const { args, flags } = parseArgs(process.argv.slice(2));
  if (flags.has("--help") || flags.has("-h")) {
    printHelp();
    return;
  }

  const date = args.get("--date") || new Date().toISOString().slice(0, 10);
  const limit = Number(args.get("--limit") || DEFAULT_LIMIT);
  const minScore = Number(args.get("--min-score") || 12);
  const problemsPath = args.get("--problems") || DEFAULT_PROBLEMS_PATH;
  const schemasDir = args.get("--schemas-dir") || DEFAULT_SCHEMAS_DIR;
  const outPath = args.get("--out") || path.join(DEFAULT_OUTPUT_DIR, `${date}-slideshow-topic-candidates.json`);
  const problemsFile = await readJson(problemsPath);
  const schemas = await loadSchemas(schemasDir);
  const recentText = await readOptionalText("inputs/performance/WINNER_LIBRARY.md");
  const recentIndex = buildRecentTextIndex(recentText);
  const baseTikTokTextBank = await readOptionalJson(args.get("--tiktok-text-bank") || DEFAULT_TIKTOK_TEXT_BANK_PATH, null);
  const hookVariationBankPath = args.get("--hook-variation-bank") || DEFAULT_TIKTOK_HOOK_VARIATION_BANK_PATH;
  const hookVariationBank = flags.has("--disable-hook-variation-bank")
    ? null
    : await readOptionalJson(hookVariationBankPath, null);
  const tiktokTextBank = mergeHookVariationBank(baseTikTokTextBank, hookVariationBank, hookVariationBankPath);
  const packsRoot = args.get("--existing-packs-root") || DEFAULT_EXISTING_PACKS_ROOT;
  const postedRegistryPath = args.get("--posted-registry") || DEFAULT_POSTED_SLIDESHOWS_PATH;
  const accountProfile = normalizeAccountProfile(args.get("--tiktok-account") || args.get("--account") || "main");
  const formatCooldownDays = Number(args.get("--format-cooldown-days") || 5);
  const recentFormatUsage = await recentFormatUsageFromPacks(packsRoot, {
    date,
    accountProfile,
    windowDays: formatCooldownDays
  });
  const latestWorld = flags.has("--disable-world-rotation")
    ? null
    : await latestVisualWorldFromPacks(packsRoot);
  const rotationStartWorld = flags.has("--disable-world-rotation")
    ? null
    : nextVisualWorldId(latestWorld?.visual_world);
  const avoidSlideSetIds = flags.has("--disable-slide-text-dedupe")
    ? new Set()
    : await existingSlideSetIdsFromPacks(packsRoot);
  const existingCoreSlideCopySets = flags.has("--disable-slide-text-dedupe")
    ? []
    : await existingCoreSlideCopySetsFromPacks(packsRoot);
  const avoidHookKeys = flags.has("--disable-hook-dedupe")
    ? new Set()
    : new Set([
        ...(await existingHookKeysFromPacks(packsRoot)),
        ...(await postedHookKeysFromRegistry(postedRegistryPath))
      ]);

  assert(Array.isArray(problemsFile.problems), `${problemsPath}: missing problems array.`);

  const redditHookSourcesEnabled = flags.has("--include-reddit-hook-sources")
    || process.env.COACHI_INCLUDE_REDDIT_HOOK_SOURCES === "1";
  const sourceProblems = redditHookSourcesEnabled
    ? problemsFile.problems
    : problemsFile.problems.filter((problem) => !isRedditHookSourceProblem(problem));
  const redditHookSourcesFilteredCount = problemsFile.problems.length - sourceProblems.length;
  const usedHooks = new Set();
  const copyDedupe = { avoidSlideSetIds };
  const workingSchemaCounts = new Map(recentFormatUsage.schemaCounts);
  const allCandidates = sourceProblems
    .map((problem) => {
      const schemaName = schemaForProblem(problem, workingSchemaCounts);
      workingSchemaCounts.set(schemaName, (workingSchemaCounts.get(schemaName) || 0) + 1);
      const schema = schemas.get(schemaName);
      assert(schema, `Missing schema ${schemaName}.`);
      const formatId = formatIdForProblem(problem, schemaName);
      const recentFormatCount = recentFormatUsage.formatCounts.get(formatId) || 0;
      const viralPack = viralHookPackForProblem(problem, tiktokTextBank, avoidHookKeys, copyDedupe);
      const originalSlides = slideDraftForProblem(problem, schemaName, viralPack);
      const originalDraft = originalSlides.map((text, index) => ({
        slide_number: index + 1,
        role: viralPack.slideshow?.[index]?.role || schema.slides[index]?.role || "slide",
        text
      }));
      const originalDuplicateMatch = duplicateSlideCopyMatch(originalDraft, existingCoreSlideCopySets);
      const copyRepair = originalDuplicateMatch
        ? freshenDuplicateSlideCopy({
            problem,
            bestHook: originalSlides[0],
            existingCoreSlideCopySets
          })
        : null;
      const finalDraft = copyRepair?.slideshow || originalDraft;
      const finalSlideshow = finalDraft;
      const finalDuplicateMatch = duplicateSlideCopyMatch(finalDraft, existingCoreSlideCopySets);
      const slides = finalDraft.map((slide) => slide.text);
      const hook = slides[0];
      return {
        problem_id: problem.id,
        source_url: problem.source_url,
        problem_type: problem.problem_type,
        exact_words: problem.exact_words,
        sourced_mistakes: problem.sourced_mistakes || [],
        problem: viralPack.problem,
        emotion: viralPack.emotion,
        pattern: viralPack.pattern,
        visual_world: viralPack.visual_world,
        route_tag: viralPack.route_tag,
        lighting_family: viralPack.lighting_family,
        avatar_world_required: viralPack.avatar_world_required,
        images_2_0_rule: viralPack.images_2_0_rule,
        cta_required: viralPack.cta_required,
        score: scoreProblem(problem),
        schema: schemaName,
        format_id: formatId,
        format_cooldown: {
          window_days: formatCooldownDays,
          account_profile: accountProfile,
          recent_count: recentFormatCount,
          allowed: recentFormatCount === 0,
          fallback_used: false
        },
        format_catalog: DEFAULT_FORMAT_CATALOG_PATH,
        hook,
        hooks: viralPack.hooks,
        top_hooks: viralPack.top_hooks,
        hook_candidates: viralPack.hook_candidates,
        selected_hook_quality: viralPack.selected_hook_quality,
        hook_source: viralPack.hook_source,
        hook_variation_bank: viralPack.hook_variation_bank,
        hook_variation_bank_summary: viralPack.hook_variation_bank_summary,
        slide_text_source: viralPack.slide_text_source,
        tiktok_text_bank: viralPack.tiktok_text_bank,
        recent_duplicate_risk: recentIndex.has(hook.toLowerCase()),
        why_this_can_work: viralPack.problem,
        product_angle: problem.product_angle,
        slide_draft: finalDraft,
        duplicate_slide_copy_match: finalDuplicateMatch,
        original_duplicate_slide_copy_match: originalDuplicateMatch,
        copy_freshness: copyRepair?.copy_freshness || {
          repaired_duplicate_core_copy: false,
          rewrite_source: null
        },
        slideshow: finalSlideshow,
        visual_mapping: viralPack.visual_mapping
      };
    })
    .filter((candidate) => candidate.score >= minScore)
    .filter((candidate) => !candidate.duplicate_slide_copy_match)
    .filter((candidate) => candidate.selected_hook_quality?.passes_quality_gate === true)
    .sort((left, right) => {
      if (left.format_cooldown?.allowed !== right.format_cooldown?.allowed) {
        return left.format_cooldown?.allowed ? -1 : 1;
      }
      if (right.score !== left.score) return right.score - left.score;
      return (left.format_cooldown?.recent_count || 0) - (right.format_cooldown?.recent_count || 0);
    })
    .filter((candidate) => {
      const key = candidate.hook.toLowerCase();
      if (usedHooks.has(key)) return false;
      usedHooks.add(key);
      return true;
    });
  const selectedCandidates = selectWithFormatCooldown(allCandidates, {
    limit,
    disabled: flags.has("--disable-format-cooldown")
  });
  const candidates = selectedCandidates
    .map((candidate, index) => {
      if (flags.has("--disable-world-rotation")) return candidate;
      return applyVisualWorldRotation(candidate, visualWorldAtOffset(rotationStartWorld, index), {
        previous_world: latestWorld?.visual_world || null
      });
    });

  const output = {
    generated_at: new Date().toISOString(),
    date,
    source_problem_file: problemsPath,
    source_problem_count: problemsFile.problems.length,
    reddit_hook_sources: {
      enabled: redditHookSourcesEnabled,
      filtered_count: redditHookSourcesFilteredCount,
      opt_in_flag: "--include-reddit-hook-sources",
      opt_in_env: "COACHI_INCLUDE_REDDIT_HOOK_SOURCES=1"
    },
    format_catalog: DEFAULT_FORMAT_CATALOG_PATH,
    format_diversity: {
      cooldown_enabled: !flags.has("--disable-format-cooldown"),
      window_days: formatCooldownDays,
      account_profile: accountProfile,
      recent_schema_counts: Object.fromEntries(recentFormatUsage.schemaCounts),
      recent_format_counts: Object.fromEntries(recentFormatUsage.formatCounts),
      recent_pack_count: recentFormatUsage.entries.length,
      eligible_before_cooldown: allCandidates.length
    },
    visual_world_rotation: flags.has("--disable-world-rotation")
      ? { enabled: false }
      : {
          enabled: true,
          order: VISUAL_WORLD_ROTATION,
          previous_world: latestWorld?.visual_world || null,
          previous_world_source: latestWorld?.file_path ? path.relative(process.cwd(), latestWorld.file_path) : null,
          previous_world_status: latestWorld?.source_status || null,
          previous_world_qa_report: latestWorld?.qa_report_path ? path.relative(process.cwd(), latestWorld.qa_report_path) : null,
          start_world: rotationStartWorld
        },
    rule: "Raw problem first. AI may rewrite only after the candidate comes from a sourced problem.",
    candidate_count: candidates.length,
    candidates
  };

  await writeJson(outPath, output);
  console.log(JSON.stringify({
    ok: true,
    out: outPath,
    candidate_count: candidates.length,
    hooks: candidates.map((candidate) => candidate.hook)
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
