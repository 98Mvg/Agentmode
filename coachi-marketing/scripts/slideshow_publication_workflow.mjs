import fs from "node:fs/promises";

const DEFAULT_LOOKBACK_DAYS = 14;
const DEFAULT_INBOX_EXPIRY_HOURS = 72;
export const DEFAULT_MAX_PUBLICATION_WIP = 6;
const DEFAULT_SCHEDULED_PATH = "inputs/performance/scheduled-slideshows.json";
const DEFAULT_POSTED_PATH = "inputs/performance/posted-slideshows.json";
const DEFAULT_RESULTS_PATH = "inputs/performance/slideshow-results.json";

function timestamp(value) {
  const parsed = new Date(value || "").getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeAccountProfile(value) {
  const text = String(value || "").trim().toLowerCase().replaceAll("_", "-");
  if (!text) return null;
  if (text === "main" || text.includes("everydayrunnerlab") || text.includes("everyday runner lab")) return "main";
  if (text === "watch" || text.includes("runwatchlab") || text.includes("runner watch lab")) return "watch";
  if (text === "marathon" || text.includes("roadtomarathon") || text.includes("road to marathon")) return "marathon";
  return text;
}

export function accountProfileForRegistryPost(post = {}) {
  return normalizeAccountProfile(
    post.account_profile
      || post.profile
      || post.account_name
      || post.account
      || post.channel,
  );
}

export function canonicalPublicPostUrl(value, platform = "tiktok") {
  const raw = String(value || "").trim();
  if (!raw) return null;
  let url;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (platform === "tiktok") {
    if (!/(^|\.)tiktok\.com$/i.test(url.hostname)) return null;
    const match = url.pathname.match(/^\/@[^/]+\/(?:video|photo)\/(\d+)/i);
    if (!match) return null;
    return `${url.protocol}//${url.hostname}${url.pathname}`;
  }
  return /^https?:$/i.test(url.protocol) ? `${url.protocol}//${url.hostname}${url.pathname}` : null;
}

export function hasUsableMetrics(result = {}) {
  return [result.views_24h, result.views_7d, result.views_latest]
    .some((value) => Number.isFinite(Number(value)));
}

export function publicationWorkflowSnapshot({
  scheduledPosts = [],
  postedPosts = [],
  results = [],
  accountProfile = null,
  now = new Date(),
  lookbackDays = DEFAULT_LOOKBACK_DAYS,
  inboxExpiryHours = DEFAULT_INBOX_EXPIRY_HOURS,
  maxWip = DEFAULT_MAX_PUBLICATION_WIP,
} = {}) {
  const nowMs = timestamp(now) ?? Date.now();
  const cutoffMs = nowMs - Number(lookbackDays) * 24 * 60 * 60 * 1000;
  const selectedAccount = normalizeAccountProfile(accountProfile);
  const publicById = new Map();
  for (const post of postedPosts) {
    const publicUrl = canonicalPublicPostUrl(post.url || post.public_url, post.platform || "tiktok");
    if (!publicUrl || !post.slideshow_id) continue;
    publicById.set(post.slideshow_id, { ...post, public_url: publicUrl });
  }
  const measuredIds = new Set(
    results
      .filter((result) => result.slideshow_id && hasUsableMetrics(result))
      .map((result) => result.slideshow_id),
  );
  const seen = new Set();
  const items = [];
  const sorted = [...scheduledPosts].sort((left, right) => (
    (timestamp(right.sent_to_inbox_at || right.scheduled_at) || 0)
      - (timestamp(left.sent_to_inbox_at || left.scheduled_at) || 0)
  ));
  for (const post of sorted) {
    const sentAt = timestamp(post.sent_to_inbox_at || post.scheduled_at);
    if (!sentAt || sentAt < cutoffMs || !post.slideshow_id) continue;
    if (!new Set(["sent_to_inbox", "public_verified"]).has(post.status)) continue;
    const profile = accountProfileForRegistryPost(post);
    if (selectedAccount && profile !== selectedAccount) continue;
    const key = `${profile || "unknown"}|${post.slideshow_id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const publicPost = publicById.get(post.slideshow_id);
    const publicUrl = publicPost?.public_url
      || canonicalPublicPostUrl(post.public_url || post.url, post.platform || "tiktok");
    const measured = measuredIds.has(post.slideshow_id);
    const ageHours = (nowMs - sentAt) / 3_600_000;
    const state = !publicUrl
      ? ageHours > Number(inboxExpiryHours) ? "expired_unpublished" : "inbox_sent"
      : measured ? "measured" : "public_unmeasured";
    items.push({
      slideshow_id: post.slideshow_id,
      account_profile: profile,
      sent_to_inbox_at: post.sent_to_inbox_at || post.scheduled_at,
      age_hours: Number(ageHours.toFixed(2)),
      public_url: publicUrl,
      state,
    });
  }
  const counts = {
    inbox_sent: items.filter((item) => item.state === "inbox_sent").length,
    public_unmeasured: items.filter((item) => item.state === "public_unmeasured").length,
    measured: items.filter((item) => item.state === "measured").length,
    expired_unpublished: items.filter((item) => item.state === "expired_unpublished").length,
  };
  const activeWip = counts.inbox_sent + counts.public_unmeasured;
  return {
    account_profile: selectedAccount,
    generated_at: new Date(nowMs).toISOString(),
    lookback_days: Number(lookbackDays),
    inbox_expiry_hours: Number(inboxExpiryHours),
    max_wip: Number(maxWip),
    active_wip: activeWip,
    remaining_capacity: Math.max(0, Number(maxWip) - activeWip),
    blocked: activeWip >= Number(maxWip),
    counts,
    items,
  };
}

async function readRegistry(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

export async function loadPublicationWorkflowSnapshot({
  scheduledPath = DEFAULT_SCHEDULED_PATH,
  postedPath = DEFAULT_POSTED_PATH,
  resultsPath = DEFAULT_RESULTS_PATH,
  accountProfile = null,
  now = new Date(),
  lookbackDays = DEFAULT_LOOKBACK_DAYS,
  inboxExpiryHours = DEFAULT_INBOX_EXPIRY_HOURS,
  maxWip = DEFAULT_MAX_PUBLICATION_WIP,
} = {}) {
  const [scheduled, posted, results] = await Promise.all([
    readRegistry(scheduledPath, { posts: [] }),
    readRegistry(postedPath, { posts: [] }),
    readRegistry(resultsPath, { results: [] }),
  ]);
  return publicationWorkflowSnapshot({
    scheduledPosts: scheduled.posts || [],
    postedPosts: posted.posts || [],
    results: results.results || [],
    accountProfile,
    now,
    lookbackDays,
    inboxExpiryHours,
    maxWip,
  });
}
