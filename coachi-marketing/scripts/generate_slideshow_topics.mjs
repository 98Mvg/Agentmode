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
const DEFAULT_FORMAT_CATALOG_PATH = "strategy/automation/tiktok-instagram-slideshow-content-engine/formats/coachi-formats.json";
const DEFAULT_LIMIT = 5;
const DEFAULT_POSTED_SLIDESHOWS_PATH = "inputs/performance/posted-slideshows.json";
const DEFAULT_EXISTING_PACKS_ROOT = "content/slideshows";
const VIRAL_TIKTOK_HOOK_SOURCES = [
  DEFAULT_TIKTOK_TEXT_BANK_PATH,
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

Generates slideshow topic candidates from real runner problems. This does not call AI and does not create public posts.`);
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

function schemaForProblem(problemType) {
  if (problemType === "easy-run pace drift") return "top_5_mistakes_v1";
  if (problemType === "zone-2 confusion") return "top_5_mistakes_v1";
  if (problemType === "heart-rate panic") return "top_5_mistakes_v1";
  if (problemType === "watch-checking anxiety") return "top_5_mistakes_v1";
  if (problemType === "pace disbelief") return "top_5_mistakes_v1";
  if (problemType === "workout-racing") return "top_5_mistakes_v1";
  if (problemType === "metric setup confusion") return "top_5_rules_v1";
  if (problemType === "beginner uncertainty") return "things_i_wish_i_knew_v1";
  if (problemType === "data-without-coaching") return "myth_breaker_v1";
  if (problemType === "exercise-ring frustration") return "myth_breaker_v1";
  if (problemType === "comparison spiral") return "myth_breaker_v1";
  return "how_to_fix_v1";
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
  "comparison spiral": "things_i_wish_i_knew_running"
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
      coachi_connection: "Coachi gives simple guidance before one number ruins the run.",
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
      coachi_connection: "Coachi keeps the feedback about your run, not someone else's.",
      cta: "Follow for smarter running."
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
  "beginner uncertainty": "beginner running"
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
  "beginner uncertainty": ["beginner", "running", "scary", "start"]
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
  "beginner uncertainty": APPROVED_VISUAL_WORLDS.lake,
  "data-without-coaching": APPROVED_VISUAL_WORLDS.forest
};

function visualWorldForProblem(problem) {
  return VISUAL_WORLD_BY_TYPE[problem.problem_type] || APPROVED_VISUAL_WORLDS.forest;
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
  "beginner uncertainty": "5 things I wish I knew"
};

function problemTypeTextPack(problem, textBank) {
  if (!textBank?.problem_type_packs) return null;
  return textBank.problem_type_packs[problem.problem_type] || textBank.problem_type_packs.default || null;
}

function bankHookFamiliesById(textBank) {
  return new Map((textBank?.hook_families || []).map((family) => [family.id, family]));
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
      if (right.score !== left.score) return right.score - left.score;
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
      const key = hookKey(hook);
      if (key) keys.add(key);
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
  const sourcedPoints = sourcedTopFivePoints(problem);
  if (sourcedPoints) return sourcedPoints;

  const byType = {
    "heart-rate panic": [
      "1. Running easy days too fast.",
      "2. Trusting default zones.",
      "3. Refusing walk breaks.",
      "4. Chasing a pace that feels better.",
      "5. Calling medium-hard easy."
    ],
    "easy-run pace drift": [
      "1. Starting slightly too fast.",
      "2. Surging on small hills.",
      "3. Chasing yesterday's pace.",
      "4. Letting ego choose effort.",
      "5. Calling medium-hard easy."
    ],
    "zone-2 confusion": [
      "1. Treating the zone as a verdict.",
      "2. Refusing to slow down.",
      "3. Fighting walk breaks.",
      "4. Ignoring heat and hills.",
      "5. Forgetting the goal is easy."
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

  return byType[problem.problem_type] || [
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

function slideDraftForProblem(problem, schemaName, viralPack = null) {
  if (viralPack?.slideshow?.length) {
    return viralPack.slideshow.map((slide) => slide.text);
  }

  if (schemaName === "data_is_not_coaching_v1") {
    return [
      hookForProblem(problem),
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
      hookForProblem(problem),
      "You think progress means faster every run.",
      "Early progress is usually control.",
      "That is why easy days turn hard.",
      "Your next run only needs patience.",
      "Save this before your next easy run."
    ];
  }

  if (problem.problem_type === "heart-rate panic") {
    return [
      hookForProblem(problem),
      "You think high means failure.",
      "Heat changes the number.",
      "Stress changes it too.",
      "The better signal is effort.",
      "Coach the run, not the spike.",
      "What throws you off more: pace or heart rate?"
    ];
  }

  if (problem.problem_type === "easy-run pace drift") {
    return [
      hookForProblem(problem),
      "You think easy stays easy.",
      "Speeding up adds up.",
      "Ego changes it too.",
      "The better signal is control.",
      "Win the run early.",
      "What ruins easy days most: pace or patience?"
    ];
  }

  return [
    hookForProblem(problem),
    "You think the number means truth.",
    "Terrain changes the number.",
    "Fatigue changes it too.",
    "The better signal is effort.",
    "Coach the run, not the split.",
    "What throws you off most?"
  ];
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
  const tiktokTextBank = await readOptionalJson(args.get("--tiktok-text-bank") || DEFAULT_TIKTOK_TEXT_BANK_PATH, null);
  const packsRoot = args.get("--existing-packs-root") || DEFAULT_EXISTING_PACKS_ROOT;
  const postedRegistryPath = args.get("--posted-registry") || DEFAULT_POSTED_SLIDESHOWS_PATH;
  const avoidSlideSetIds = flags.has("--disable-slide-text-dedupe")
    ? new Set()
    : await existingSlideSetIdsFromPacks(packsRoot);
  const avoidHookKeys = flags.has("--disable-hook-dedupe")
    ? new Set()
    : new Set([
        ...(await existingHookKeysFromPacks(packsRoot)),
        ...(await postedHookKeysFromRegistry(postedRegistryPath))
      ]);

  assert(Array.isArray(problemsFile.problems), `${problemsPath}: missing problems array.`);

  const usedHooks = new Set();
  const copyDedupe = { avoidSlideSetIds };
  const candidates = problemsFile.problems
    .map((problem) => {
      const schemaName = schemaForProblem(problem.problem_type);
      const schema = schemas.get(schemaName);
      assert(schema, `Missing schema ${schemaName}.`);
      const formatId = formatIdForProblem(problem, schemaName);
      const viralPack = viralHookPackForProblem(problem, tiktokTextBank, avoidHookKeys, copyDedupe);
      const slides = slideDraftForProblem(problem, schemaName, viralPack);
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
        format_catalog: DEFAULT_FORMAT_CATALOG_PATH,
        hook,
        hooks: viralPack.hooks,
        top_hooks: viralPack.top_hooks,
        hook_candidates: viralPack.hook_candidates,
        selected_hook_quality: viralPack.selected_hook_quality,
        hook_source: viralPack.hook_source,
        slide_text_source: viralPack.slide_text_source,
        tiktok_text_bank: viralPack.tiktok_text_bank,
        recent_duplicate_risk: recentIndex.has(hook.toLowerCase()),
        why_this_can_work: viralPack.problem,
        product_angle: problem.product_angle,
        slide_draft: slides.map((text, index) => ({
          slide_number: index + 1,
          role: viralPack.slideshow?.[index]?.role || schema.slides[index]?.role || "slide",
          text
        })),
        slideshow: viralPack.slideshow,
        visual_mapping: viralPack.visual_mapping
      };
    })
    .filter((candidate) => candidate.score >= minScore && !candidate.recent_duplicate_risk)
    .filter((candidate) => candidate.selected_hook_quality?.passes_quality_gate === true)
    .sort((left, right) => right.score - left.score)
    .filter((candidate) => {
      const key = candidate.hook.toLowerCase();
      if (usedHooks.has(key)) return false;
      usedHooks.add(key);
      return true;
    })
    .slice(0, limit);

  const output = {
    generated_at: new Date().toISOString(),
    date,
    source_problem_file: problemsPath,
    format_catalog: DEFAULT_FORMAT_CATALOG_PATH,
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
