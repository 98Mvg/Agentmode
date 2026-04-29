import fs from "node:fs/promises";
import path from "node:path";

export const DEFAULT_COOLDOWN_DAYS = 21;

const PLATFORM_ORDER = ["x", "reddit", "tiktok", "instagram"];

const TARGETS = {
  minimum: {
    x: { likes: 5, follows: 3, replies: 1, reposts: 0 },
    reddit: { threadsReviewed: 3, replies: 2, newPosts: 0 },
    tiktok: { likes: 5, follows: 3, comments: 3, largerVideoComment: 1 },
    instagram: { likes: 5, follows: 3, comments: 3, stories: "1-3" }
  },
  stretch: {
    x: { likes: 15, follows: 10, replies: 1, reposts: 1 },
    reddit: { threadsReviewed: 6, replies: 4, newPosts: 1 },
    tiktok: { likes: 15, follows: 10, comments: 10, commentReplies: 5 },
    instagram: { likes: 15, follows: 10, comments: 10, commentReplies: 5, stories: "3-6" }
  }
};

const THEME_KEYWORDS = {
  device_vs_body: ["watch", "device", "body", "signal", "effort", "heart rate"],
  easy_run: ["easy", "pace", "too fast", "slow", "patience"],
  zone2: ["zone 2", "heart rate", "easy", "watch"],
  beginner: ["beginner", "5k", "c25k", "start", "running"],
  consistency: ["consistency", "routine", "weekly", "training days"],
  route_context: ["hill", "wind", "terrain", "route"],
  ai_builder: ["AI", "builder", "founder", "Codex", "shipping"]
};

const PLATFORM_QUERIES = {
  x: [
    {
      topic: "AI builder founder journey",
      query: '"building with AI" founder',
      actionType: "reply",
      audience: "AI builders, founders, early adopters",
      draft: "This is the part people underestimate. AI makes shipping faster, but judgment becomes the bottleneck.",
      tags: ["ai_builder"]
    },
    {
      topic: "Codex shipping lesson",
      query: '"Codex" "app" founder',
      actionType: "like_follow",
      audience: "AI-native product builders",
      draft: "Codex is strongest when the product decision is already clear. It punishes vague direction fast.",
      tags: ["ai_builder"]
    },
    {
      topic: "runner pace frustration",
      query: '"marathon training" "too fast"',
      actionType: "reply",
      audience: "runners struggling with pacing",
      draft: "Most easy runs are lost early. The hard skill is not effort. It is restraint.",
      tags: ["easy_run"]
    },
    {
      topic: "Apple Watch running confusion",
      query: '"Apple Watch" running "heart rate"',
      actionType: "like_follow",
      audience: "Apple Watch runners",
      draft: "The watch is useful, but it should not be the only voice in the run.",
      tags: ["device_vs_body", "zone2"]
    },
    {
      topic: "zone 2 confusion",
      query: '"zone 2" running "too slow"',
      actionType: "reply",
      audience: "runners confused by easy effort",
      draft: "Zone 2 usually feels boring before it feels useful. That is why most runners skip the actual work.",
      tags: ["zone2", "easy_run"]
    }
  ],
  reddit: [
    {
      topic: "watch says high heart rate",
      query: "watch says high heart rate but feel fine",
      actionType: "reply",
      audience: "runners asking for interpretation",
      draft: "I would treat that as signal conflict, not instant proof that the run went wrong. If breathing and effort still felt controlled, I would sanity-check the watch reading before changing the whole plan.",
      tags: ["device_vs_body", "zone2"]
    },
    {
      topic: "easy run feels too hard",
      query: "easy run feels too hard beginner running",
      actionType: "reply",
      audience: "beginner runners",
      draft: "That sounds common. The first fix I would try is starting almost too easy for ten minutes, then judging the run after your breathing settles. Most people decide too early.",
      tags: ["beginner", "easy_run"]
    },
    {
      topic: "zone 2 too slow",
      query: "zone 2 too slow apple watch running",
      actionType: "reply",
      audience: "Apple Watch and beginner runners",
      draft: "If Zone 2 feels absurdly slow, I would first check whether the zones are realistic. A bad zone setup can make normal easy running feel like failure.",
      tags: ["zone2", "device_vs_body"]
    },
    {
      topic: "training days question",
      query: "how many days should I run beginner",
      actionType: "reply",
      audience: "runners asking for weekly structure",
      draft: "I would make the week repeatable before making it ambitious. One long run, one slightly harder day, and the rest easy is usually better than filling every gap.",
      tags: ["beginner", "consistency"]
    }
  ],
  tiktok: [
    {
      topic: "beginner runner tips",
      query: "beginner runner tips",
      actionType: "comment",
      audience: "new runners and early customers",
      draft: "The first 10 minutes decide most easy runs.",
      tags: ["beginner", "easy_run"]
    },
    {
      topic: "easy run mistakes",
      query: "easy run mistakes",
      actionType: "comment",
      audience: "runners who self-recognize mistakes",
      draft: "Most runners do not need more effort. They need a calmer start.",
      tags: ["easy_run"]
    },
    {
      topic: "zone 2 running",
      query: "zone 2 running",
      actionType: "comment",
      audience: "runners confused by heart-rate zones",
      draft: "Zone 2 is harder mentally than physically.",
      tags: ["zone2"]
    },
    {
      topic: "5k running tips",
      query: "5k running tips",
      actionType: "like_follow",
      audience: "beginner to intermediate runners",
      draft: "The boring weeks are usually the ones that work.",
      tags: ["beginner", "consistency"]
    },
    {
      topic: "marathon training tips",
      query: "marathon training tips",
      actionType: "larger_video_comment",
      audience: "higher-intent runners",
      draft: "Easy days only work if they stay easy.",
      tags: ["easy_run", "consistency"]
    }
  ],
  instagram: [
    {
      topic: "beginner runner reels",
      query: "beginner runner tips",
      actionType: "comment",
      audience: "serious beginners",
      draft: "The best beginner plan is the one you can repeat next week.",
      tags: ["beginner", "consistency"]
    },
    {
      topic: "easy run reels",
      query: "easy run mistakes",
      actionType: "comment",
      audience: "intermediate runners",
      draft: "Starting slower solves more easy runs than people expect.",
      tags: ["easy_run"]
    },
    {
      topic: "zone 2 reels",
      query: "zone 2 running",
      actionType: "comment",
      audience: "runners learning effort control",
      draft: "The hard part is trusting easy long enough for it to work.",
      tags: ["zone2"]
    },
    {
      topic: "running consistency reels",
      query: "running consistency",
      actionType: "like_follow",
      audience: "runners seeking repeatable training",
      draft: "Consistency is mostly removing decisions.",
      tags: ["consistency"]
    }
  ]
};

export async function readOptionalJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

export async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function defaultLedger() {
  return {
    version: 1,
    purpose: "Cross-platform engagement ledger for dedupe, cooldowns, and quality feedback.",
    cooldown_days: DEFAULT_COOLDOWN_DAYS,
    actions: []
  };
}

export function canonicalUrl(value = "") {
  return String(value)
    .trim()
    .replace(/[?#].*$/, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

export function searchUrl(platform, query) {
  const encoded = encodeURIComponent(query);
  if (platform === "x") return `https://x.com/search?q=${encoded}&src=typed_query&f=live`;
  if (platform === "reddit") return `https://www.reddit.com/search/?q=${encoded}&type=posts&sort=new`;
  if (platform === "tiktok") return `https://www.tiktok.com/search?q=${encoded}`;
  if (platform === "instagram") return `https://www.instagram.com/explore/search/keyword/?q=${encoded}`;
  throw new Error(`Unsupported platform: ${platform}`);
}

export function inferTheme({ selectedDeck = null, text = "" } = {}) {
  const haystack = [
    selectedDeck?.slug,
    selectedDeck?.sourceProblemId,
    selectedDeck?.sourceUrl,
    text
  ].filter(Boolean).join(" ").toLowerCase();

  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    if (keywords.some((keyword) => haystack.includes(keyword.toLowerCase()))) return theme;
  }
  return "easy_run";
}

function daysBetween(dateA, dateB) {
  return Math.abs(dateA.getTime() - dateB.getTime()) / 86_400_000;
}

export function duplicateStatus(candidate, ledger, now = new Date()) {
  const cooldownDays = Number(ledger.cooldown_days || DEFAULT_COOLDOWN_DAYS);
  const candidateUrl = canonicalUrl(candidate.targetUrl);
  const candidateHandle = String(candidate.handle || "").toLowerCase();
  const actions = Array.isArray(ledger.actions) ? ledger.actions : [];

  for (const action of actions) {
    if (action.status === "skipped") continue;
    if (action.platform && action.platform !== candidate.platform) continue;
    const actionDate = new Date(action.date || action.at || 0);
    if (Number.isNaN(actionDate.getTime())) continue;
    if (daysBetween(now, actionDate) > cooldownDays) continue;

    const sameUrl = candidateUrl && canonicalUrl(action.url || action.targetUrl || "") === candidateUrl;
    const sameHandle = candidateHandle && String(action.handle || "").toLowerCase() === candidateHandle;
    const sameTopic = action.topic && action.topic === candidate.topic && action.action_type === candidate.actionType;
    if (sameUrl || sameHandle || sameTopic) {
      return {
        blocked: true,
        reason: sameUrl ? "url_cooldown" : (sameHandle ? "handle_cooldown" : "topic_action_cooldown"),
        matchedAction: action
      };
    }
  }

  return { blocked: false, reason: null };
}

function scoreCandidate(seed, platform, theme) {
  const themeMatch = seed.tags?.includes(theme) ? 25 : 8;
  const audienceFit = platform === "x" && seed.tags?.includes("ai_builder") ? 24 : 20;
  const intent = seed.actionType === "reply" || seed.actionType === "comment" ? 18 : 14;
  const recency = platform === "reddit" ? 16 : 12;
  const traffic = platform === "tiktok" ? 18 : (platform === "instagram" ? 15 : 14);
  const riskPenalty = riskFlags(seed, platform).length * 8;
  return {
    total: Math.max(0, themeMatch + audienceFit + intent + recency + traffic - riskPenalty),
    breakdown: {
      theme_match: themeMatch,
      audience_fit: audienceFit,
      intent,
      recency,
      traffic_relevance: traffic,
      risk_penalty: riskPenalty
    }
  };
}

function riskFlags(seed, platform) {
  const flags = [];
  const text = `${seed.query} ${seed.draft}`.toLowerCase();
  if (platform === "x" && /\belon\b|\bmusk\b/.test(text)) flags.push("celebrity_bait");
  if (platform === "reddit" && /coachi|coachi\.no|app store/.test(text)) flags.push("reddit_promo_link_or_pitch");
  if (seed.draft.length > 220 && platform !== "reddit") flags.push("draft_too_long_for_social_comment");
  if (!seed.draft || seed.draft.split(/\s+/).length < 4) flags.push("draft_too_thin");
  return flags;
}

function platformSeeds(platform, mode) {
  const seeds = PLATFORM_QUERIES[platform] || [];
  if (mode === "stretch") return seeds;
  return seeds.slice(0, platform === "reddit" ? 3 : 4);
}

export function buildCandidates({ date, mode = "minimum", platform = "all", selectedDeck = null, ledger = defaultLedger(), now = new Date() }) {
  const platforms = platform === "all" ? PLATFORM_ORDER : [platform];
  const theme = inferTheme({ selectedDeck });
  const candidates = [];
  const suppressed = [];

  for (const currentPlatform of platforms) {
    for (const seed of platformSeeds(currentPlatform, mode)) {
      const targetUrl = searchUrl(currentPlatform, seed.query);
      const score = scoreCandidate(seed, currentPlatform, theme);
      const candidate = {
        id: `${date}-${currentPlatform}-${seed.actionType}-${slug(seed.topic)}`,
        date,
        platform: currentPlatform,
        actionType: seed.actionType,
        topic: seed.topic,
        audience: seed.audience,
        targetUrl,
        searchQuery: seed.query,
        suggestedAction: suggestedAction(currentPlatform, seed.actionType),
        draftText: seed.draft,
        score: score.total,
        scoreBreakdown: score.breakdown,
        riskFlags: riskFlags(seed, currentPlatform),
        publicActionGate: true,
        status: "queued"
      };
      const duplicate = duplicateStatus(candidate, ledger, now);
      if (duplicate.blocked) {
        suppressed.push({ ...candidate, duplicate, status: "blocked_duplicate" });
      } else {
        candidates.push({ ...candidate, duplicate });
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score || PLATFORM_ORDER.indexOf(a.platform) - PLATFORM_ORDER.indexOf(b.platform));
  candidates.forEach((candidate, index) => {
    candidate.rank = index + 1;
  });

  return {
    version: 1,
    date,
    generatedAt: now.toISOString(),
    mode,
    platform,
    theme,
    selectedDeck: selectedDeck ? {
      slug: selectedDeck.slug,
      sourceProblemId: selectedDeck.sourceProblemId || null,
      sourceUrl: selectedDeck.sourceUrl || null
    } : null,
    publicActionGate: {
      enabled: true,
      reason: "The queue opens targets and drafts text. Final public likes, follows, replies, comments, reposts, and posts remain visible/manual actions."
    },
    dailyTargets: TARGETS[mode] || TARGETS.minimum,
    candidates,
    suppressedDuplicates: suppressed,
    nextByPlatform: nextByPlatform(candidates),
    ledgerSummary: {
      cooldownDays: Number(ledger.cooldown_days || DEFAULT_COOLDOWN_DAYS),
      actionCount: Array.isArray(ledger.actions) ? ledger.actions.length : 0,
      duplicateSuppressedCount: suppressed.length
    }
  };
}

function nextByPlatform(candidates) {
  const next = {};
  for (const platform of PLATFORM_ORDER) {
    next[platform] = candidates.filter((candidate) => candidate.platform === platform).slice(0, 3);
  }
  return next;
}

function suggestedAction(platform, actionType) {
  if (platform === "reddit") return "Open the search result, inspect the thread, answer only if the question is still open, and do not include a link unless directly asked.";
  if (platform === "x" && actionType === "reply") return "Open live search, inspect the post, draft a short reply, and avoid celebrity bait or duplicate replies.";
  if (platform === "x") return "Open live search, like/follow relevant builders or runner-problem accounts after profile inspection.";
  if (platform === "tiktok") return "Open search, inspect recent/high-view runner videos, comment only when the draft fits the exact post.";
  if (platform === "instagram") return "Open search, inspect runner Reels/comments, prefer specific creator/comment opportunities over generic likes.";
  return "Inspect before any public action.";
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}
