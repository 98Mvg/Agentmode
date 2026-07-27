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
  "myth",
  "truth",
  "cue",
  "shuffle",
  "shuffling",
  "hilly pace can lie",
  "your watch fit changes heart rate"
];

export const BANNED_HOOK_WORDS = /\b(data|metrics?|feedback|cue|myths?|truths?|unlock|discover|game[- ]?changing|data[- ]?driven|optimi[sz]e|optimization|revolutionary|shuffling?|shuffle)\b/i;
export const DISALLOWED_PUBLIC_COPY_TERMS = /\breps?\b/i;
export const MAX_HOOK_WORDS = 25;
export const MIN_HOOK_QUALITY_SCORE = 56;
export const HOOK_QUALITY_MAX_SCORE = 70;
export const MAX_SLIDE_WORDS = 14;

const PROBLEM_KEYWORDS_BY_TYPE = {
  "zone-2 confusion": ["zone", "slow", "easy", "run", "walking"],
  "heart-rate panic": ["heart", "rate", "hr", "bpm", "spike", "easy", "run", "panic", "sensor", "optical", "strap", "band", "accuracy"],
  "watch-checking anxiety": ["watch", "checking", "run", "easy", "alerts", "settings", "hr"],
  "pace disbelief": ["pace", "easy", "run", "lying", "gps", "instant", "lap", "route"],
  "easy-run pace drift": ["easy", "run", "slow", "drift", "races", "hard"],
  "data-without-coaching": ["coach", "coaching", "running", "watch", "plan"],
  "workout-racing": ["workout", "workouts", "racing", "hard", "interval", "intervals", "warmup", "warm-up", "run", "minutes"],
  "metric setup confusion": ["zone", "training", "rules", "watch", "alerts", "settings", "hr", "screen", "fields", "interval", "auto pause", "pace"],
  "exercise-ring frustration": ["workout", "counts", "ring"],
  "comparison spiral": ["running", "bad", "progress"],
  "watch-buying confusion": ["watch", "garmin", "apple", "fitbit", "coros", "forerunner", "series", "ultra", "se", "buy", "choose", "compare", "battery", "gps", "comfort", "fit", "lightweight"],
  "beginner uncertainty": ["beginner", "running", "scary", "start", "walk", "plan", "week", "first"],
  "easy-run form breakdown": ["easy", "slow", "run", "form", "awkward", "rhythm", "stride"],
  "recovery day guilt": ["rest", "recovery", "run", "running", "legs", "progress"],
  "easy-run expectation mismatch": ["easy", "run", "feel", "hard", "slow", "breathing"],
  // Road to Marathon Fit is a personal training journal. These categories
  // keep the shared gate specific without forcing generic "Why runners..." copy.
  easy_run: ["easy", "pace", "run", "slow", "breathing"],
  food: ["food", "ate", "breakfast", "run", "stomach"],
  strength: ["strength", "workout", "run", "legs", "sore"],
  recovery: ["sore", "recovery", "run", "legs", "rest"],
  shoes: ["shoes", "run", "legs", "easy", "comfort"],
  hills: ["hill", "pace", "easy", "run", "climb"]
};

const RUNNER_WORDS = /\b(runs?|runner|running|easy|pace|zone|watch|workouts?|heart|beginner|slow|walk|effort|intervals?|long runs?|garmin|apple watch|coros|polar|forerunner|satiq|gps|battery|auto lap|race route)\b/i;
const EMOTION_WORDS = /\b(too hard|too easy|impossible|bad|lazy|overpacing|test|racing|panic|scary|feel|feels|felt|slow|not|hard|confusing|wrong|lying|lie|lies|stuck|tired|sore|shaking|wiped|messed)\b/i;
const CURIOSITY_WORDS = /\b(why|how|what|which|can|should|before|after|nobody|most|best|probably|this is why|wish i knew|mistake|stop|wrong|lying|rules?|things?|without|not)\b/i;
const TIKTOK_NATIVE_SHAPES = /^(top\s*\d+|\d+\s+(things|rules|mistakes|tips|weeks)|week\s+\d+\b|my top\s*\d+|i\b|my\b|these\b|stop\b|why\b|how\b|what\b|which\b|can\b|should\b|before\b|after\b|use\b|set\b|turn on\b|best\b|battery\b|most runners|this is why|you are not|your watch\b|numbers? are not)/i;
const COACHI_FIT_WORDS = /\b(zone|easy|pace|watch|heart|hr|bpm|alerts?|settings?|gps|battery|wrist|fit|workout|coach|run|running|effort|voice|control|shoes?|forerunner|series|ultra|intervals?|screen|fields?|accuracy)\b/i;
const WATCH_DEVICE_WORDS = /\b(watch|garmin|forerunner|apple watch|apple|fitbit|coros|polar|wrist|strap|band|sensor|gps|battery|display|screen|buttons?|series|ultra|se)\b/i;
const WATCH_DECISION_WORDS = /\b(settings?|alerts?|zones?|hr|heart rate|max hr|thresholds?|battery|gps|fit|wrist|comfort|lightweight|model|buy|choose|best|compare|long runs?|music|always-on|buttons?|strap|band|accuracy|optical|sensor|screen|fields?|intervals?|auto pause|pace|forerunner|series|ultra|se)\b/i;

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

export function disallowedPublicCopyMatches(value) {
  return String(value || "").match(DISALLOWED_PUBLIC_COPY_TERMS)?.[0] || null;
}

function clampScore(value) {
  return Math.max(1, Math.min(10, Math.round(value)));
}

function keywordHitsForProblem(hook, problem = {}) {
  const lower = String(hook || "").toLowerCase();
  const keywords = PROBLEM_KEYWORDS_BY_TYPE[problem.problem_type] || ["run", "running"];
  return keywords.filter((keyword) => lower.includes(keyword)).length;
}

function isWatchProblem(problem = {}) {
  const type = String(problem.problem_type || "");
  const words = String(problem.exact_words || "");
  return /\bwatch\b/i.test(type) || WATCH_DEVICE_WORDS.test(words);
}

function hasWatchSpecificIntent(text, problem = {}) {
  if (!isWatchProblem(problem) && !WATCH_DEVICE_WORDS.test(text)) return false;
  if (isWatchProblem(problem) && WATCH_DECISION_WORDS.test(text)) return true;
  return WATCH_DEVICE_WORDS.test(text) && WATCH_DECISION_WORDS.test(text);
}

export function scoreHookBreakdown(hook, problem = {}, sourceMeta = {}) {
  const text = String(hook || "").trim();
  const lower = text.toLowerCase();
  const words = countWords(text);
  const keywordHits = keywordHitsForProblem(text, problem);
  const listHook = isListHook(text);
  const sourceBoost = sourceMeta.source_family_id || sourceMeta.source === "tiktok_text_bank" ? 1 : 0;
  const bannedMatches = bannedHookMatches(text);
  const watchSpecificIntent = hasWatchSpecificIntent(text, problem);
  const curiositySignals = {
    concrete_number: /\b(minute\s+\d+|first\s+\d+|week\s+\d+|zone\s+\d+|\d+\s*(?:bpm|days?|minutes?|mins?|weeks?))\b/i.test(text),
    first_person_confession: /\b(i (?:still|keep|kept|use(?:d)?|want(?:ed)?|was(?:n't| not)?|nearly|almost|stop(?:ped)?|did(?:n't| not)|don't|do not|had|have|thought|felt|feel|start(?:ed)?|tried|try|look(?:ed)?|need(?:ed)?)|my (?:watch|easy|run|legs|first|strength|stomach|shoes)|these are)\b/i.test(text),
    direct_address_contradiction: /\b(you are not|you're not|your\b[^.!?]{0,36}\b(is not|isn't|does not|doesn't|not)\b)\b/i.test(text),
    question_or_choice: /\?/.test(text) || /\b(which|can|should|versus| or )\b/i.test(text),
    plain_contradiction: /\b(not|without|never|wrong|lies?|versus)\b/i.test(text),
    personal_app_stack: /^top\s*\d+\s+running apps?\s+i\s+(?:use|still use)\b/i.test(text),
    watch_specific_decision: watchSpecificIntent
  };
  const curiositySignalBoost = Object.values(curiositySignals).filter(Boolean).length;
  const preservedSourceMechanic = words <= 25
    && (listHook || CURIOSITY_WORDS.test(text) || curiositySignalBoost > 0 || /\?/.test(text));

  const watchIntentBoost = watchSpecificIntent ? 2 : 0;
  const runner_pain_specificity = clampScore(2 + keywordHits * 3 + sourceBoost + (/\btoo hard|too fast|overpacing|zone 2|easy runs?\b/i.test(text) ? 2 : 0) + watchIntentBoost + (curiositySignals.personal_app_stack ? 1 : 0));
  const curiosity = clampScore((CURIOSITY_WORDS.test(text) ? 7 : 3) + (listHook ? 2 : 0) + (/\bprobably|nobody|why\b/i.test(text) ? 1 : 0) + curiositySignalBoost * 2);
  const simplicity = clampScore(words <= 7 ? 10 : words <= 12 ? 8 : words <= MAX_HOOK_WORDS && preservedSourceMechanic ? 6 : 2);
  const emotional_relatability = clampScore(
    (EMOTION_WORDS.test(text) ? 7 : 3)
      + (/\byou|your|runners?\b/i.test(text) ? 2 : 0)
      + (watchSpecificIntent ? 2 : 0)
      + (curiositySignals.personal_app_stack ? 2 : 0)
  );
  const coachi_fit = clampScore((COACHI_FIT_WORDS.test(text) ? 6 : 2) + keywordHits + (/\bzone|pace|watch|heart|easy\b/i.test(text) ? 2 : 0) + watchIntentBoost);
  const tiktok_native_wording = clampScore((TIKTOK_NATIVE_SHAPES.test(text) || curiositySignals.question_or_choice || watchSpecificIntent ? 8 : 4) + (words <= MAX_HOOK_WORDS || preservedSourceMechanic ? 2 : 0));
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
    curiosity_signals: curiositySignals,
    watch_specific_intent: watchSpecificIntent,
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
  if (type === "easy-run form breakdown") return "Why easy runs feel awkward";
  if (type === "watch-buying confusion") return "Stop overbuying running watches";
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
