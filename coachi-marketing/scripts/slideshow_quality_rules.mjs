const BANNED_MARKETING_PHRASES = [
  "transform your fitness journey",
  "optimize your performance",
  "optimise your performance",
  "unlock your potential",
  "game-changing",
  "game changing",
  "revolutionary",
  "data-driven",
  "data driven",
  "discover",
  "unlock",
  "cue"
];

export const BANNED_HOOK_WORDS = /\b(data|metrics?|feedback|cue|unlock|discover|game[- ]?changing|data[- ]?driven|optimi[sz]e|optimization|revolutionary)\b/i;
export const MAX_HOOK_WORDS = 10;
export const MIN_HOOK_QUALITY_SCORE = 52;
export const HOOK_QUALITY_MAX_SCORE = 70;
export const MAX_SLIDE_WORDS = 14;

const PROBLEM_KEYWORDS_BY_TYPE = {
  "zone-2 confusion": ["zone", "slow", "easy", "run", "walking"],
  "heart-rate panic": ["heart", "rate", "easy", "run", "panic"],
  "watch-checking anxiety": ["watch", "checking", "run", "easy"],
  "pace disbelief": ["pace", "easy", "run", "lying"],
  "easy-run pace drift": ["easy", "run", "slow", "drift", "races", "hard"],
  "data-without-coaching": ["coach", "coaching", "running", "watch", "plan"],
  "workout-racing": ["workout", "workouts", "racing", "hard", "reps"],
  "metric setup confusion": ["zone", "training", "rules"],
  "exercise-ring frustration": ["workout", "counts", "ring"],
  "comparison spiral": ["running", "bad", "progress"],
  "beginner uncertainty": ["beginner", "running", "scary", "start"]
};

const RUNNER_WORDS = /\b(run|runner|running|easy|pace|zone|watch|workouts?|heart|beginner|slow|walk|effort|reps?|interval|long run)\b/i;
const EMOTION_WORDS = /\b(too hard|impossible|bad|lazy|overpacing|test|racing|panic|scary|feel|feels|slow|not|hard|confusing|wrong|stuck|tired)\b/i;
const CURIOSITY_WORDS = /\b(why|how|what|nobody|most|probably|this is why|wish i knew|mistake|stop|wrong|lying|rules?|things?)\b/i;
const TIKTOK_NATIVE_SHAPES = /^(top\s*\d+|\d+\s+(things|rules|mistakes|tips|weeks)|my top\s*\d+|stop\b|why\b|how\b|what nobody|most runners|this is why|you are not)/i;
const COACHI_FIT_WORDS = /\b(zone|easy|pace|watch|heart|workout|coach|run|running|effort|voice|control)\b/i;

export function countWords(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

export function isListHook(hook) {
  return /^(top\s*\d+|\d+\s+(things|rules|mistakes|tips|weeks)|my top\s*\d+)/i.test(String(hook || "").trim());
}

export function bannedHookMatches(value) {
  const text = String(value || "");
  const phrase = BANNED_MARKETING_PHRASES.find((item) => text.toLowerCase().includes(item));
  const regexMatch = text.match(BANNED_HOOK_WORDS)?.[0] || null;
  return [phrase, regexMatch].filter(Boolean);
}

export function isAllowedHook(value) {
  return bannedHookMatches(value).length === 0;
}

function clampScore(value) {
  return Math.max(1, Math.min(10, Math.round(value)));
}

function keywordHitsForProblem(hook, problem = {}) {
  const lower = String(hook || "").toLowerCase();
  const keywords = PROBLEM_KEYWORDS_BY_TYPE[problem.problem_type] || ["run", "running"];
  return keywords.filter((keyword) => lower.includes(keyword)).length;
}

export function scoreHookBreakdown(hook, problem = {}, sourceMeta = {}) {
  const text = String(hook || "").trim();
  const lower = text.toLowerCase();
  const words = countWords(text);
  const keywordHits = keywordHitsForProblem(text, problem);
  const listHook = isListHook(text);
  const sourceBoost = sourceMeta.source_family_id || sourceMeta.source === "tiktok_text_bank" ? 1 : 0;
  const bannedMatches = bannedHookMatches(text);

  const runner_pain_specificity = clampScore(2 + keywordHits * 3 + sourceBoost + (/\btoo hard|too fast|overpacing|zone 2|easy runs?\b/i.test(text) ? 2 : 0));
  const curiosity = clampScore((CURIOSITY_WORDS.test(text) ? 7 : 3) + (listHook ? 2 : 0) + (/\bprobably|nobody|why\b/i.test(text) ? 1 : 0));
  const simplicity = clampScore(words <= 7 ? 10 : words <= MAX_HOOK_WORDS ? 8 : words <= 12 && listHook ? 6 : 2);
  const emotional_relatability = clampScore((EMOTION_WORDS.test(text) ? 7 : 3) + (/\byou|your|runners?\b/i.test(text) ? 2 : 0));
  const coachi_fit = clampScore((COACHI_FIT_WORDS.test(text) ? 6 : 2) + keywordHits + (/\bzone|pace|watch|heart|easy\b/i.test(text) ? 2 : 0));
  const tiktok_native_wording = clampScore((TIKTOK_NATIVE_SHAPES.test(text) ? 8 : 4) + (words <= MAX_HOOK_WORDS ? 2 : 0));
  const non_marketing_tone = bannedMatches.length > 0
    ? 1
    : clampScore(10 - (/\bperformance|journey|potential|solution|platform|powered\b/i.test(lower) ? 3 : 0));

  const score = [
    runner_pain_specificity,
    curiosity,
    simplicity,
    emotional_relatability,
    coachi_fit,
    tiktok_native_wording,
    non_marketing_tone
  ].reduce((total, value) => total + value, 0);

  return {
    runner_pain_specificity,
    curiosity,
    simplicity,
    emotional_relatability,
    coachi_fit,
    tiktok_native_wording,
    non_marketing_tone,
    score,
    max_score: HOOK_QUALITY_MAX_SCORE,
    word_count: words,
    banned_matches: bannedMatches
  };
}

export function scoreCoachiHook(hook, problem = {}, sourceMeta = {}) {
  const breakdown = scoreHookBreakdown(hook, problem, sourceMeta);
  return {
    score: breakdown.score,
    max_score: HOOK_QUALITY_MAX_SCORE,
    min_score: MIN_HOOK_QUALITY_SCORE,
    passes_quality_gate: breakdown.score >= MIN_HOOK_QUALITY_SCORE && breakdown.banned_matches.length === 0,
    word_count: breakdown.word_count,
    breakdown,
    rationale: hookQualityRationale(hook, breakdown, sourceMeta)
  };
}

export function hookQualityRationale(hook, breakdown, sourceMeta = {}) {
  const source = sourceMeta.source_family_id
    ? `bank family ${sourceMeta.source_family_id}`
    : sourceMeta.source || "pattern fallback";
  const parts = [
    `${breakdown.score}/${breakdown.max_score || HOOK_QUALITY_MAX_SCORE}`,
    `${countWords(hook)} words`,
    source,
    `pain ${breakdown.runner_pain_specificity}/10`,
    `curiosity ${breakdown.curiosity}/10`,
    `simplicity ${breakdown.simplicity}/10`
  ];
  if (breakdown.score >= MIN_HOOK_QUALITY_SCORE && breakdown.banned_matches?.length === 0) {
    parts.push("passes quality gate");
  }
  if (breakdown.banned_matches?.length) {
    parts.push(`blocked wording: ${breakdown.banned_matches.join(", ")}`);
  }
  return parts.join("; ");
}

export function suggestHookFix(hook, problem = {}) {
  const type = problem.problem_type;
  if (type === "easy-run pace drift") return "Your easy runs are probably too hard";
  if (type === "zone-2 confusion") return "Zone 2 should feel slow";
  if (type === "heart-rate panic") return "Your heart rate needs context";
  if (type === "watch-checking anxiety") return "Stop checking every split";
  if (type === "workout-racing") return "Stop racing every workout";
  if (type === "beginner uncertainty") return "Running slow is not laziness";
  return "You are not bad at running";
}

export function coachiMentionCount(slides = []) {
  return slides.filter((slide) => /\bcoachi\b/i.test(String(slide.text || ""))).length;
}

export function firstCoachiMentionSlide(slides = []) {
  const slide = slides.find((item) => /\bcoachi\b/i.test(String(item.text || "")));
  return slide?.slide_number || null;
}

export function textSoundsLikeAd(value) {
  const text = String(value || "");
  return bannedHookMatches(text).length > 0 || /\b(best app|download now|limited time|revolutionary|transform your|unlock your)\b/i.test(text);
}

export function aggressiveCta(value) {
  return /\b(download now|install now|buy|sign up now|limited time|click the link)\b/i.test(String(value || ""));
}

export function hasRunnerLanguage(value) {
  return RUNNER_WORDS.test(String(value || ""));
}
