const TIKTOK_ACCOUNT_PROFILES = [
  {
    profile: "main",
    label: "Everyday Runner Lab",
    lane: "beginner/easy-run/Zone 2 Coachi funnel",
    aliases: ["main", "default", "runner", "everyday-runner-lab", "everydayrunnerlab"],
    env_keys: ["POSTIZ_TIKTOK_ACCOUNT_ID_MAIN", "POSTIZ_TIKTOK_ACCOUNT_ID"]
  },
  {
    profile: "watch",
    label: "Runner Watch Lab",
    lane: "watch problems, setup tips, comparisons, and Coachi as live coaching layer",
    aliases: ["watch", "watches", "watch-lab", "runner-watch-lab", "secondary", "second"],
    env_keys: ["POSTIZ_TIKTOK_ACCOUNT_ID_WATCH", "POSTIZ_TIKTOK_ACCOUNT_ID_SECONDARY"]
  },
  {
    profile: "marathon",
    label: "Road to Marathon Fit",
    lane: "fictional AI marathon-training journey; one Images 2.0 hook image plus approved Pinterest/library support slides",
    aliases: ["marathon", "road-to-marathon-fit", "roadtomarathonfit", "marathon-fit", "third", "third-account"],
    env_keys: ["POSTIZ_TIKTOK_ACCOUNT_ID_MARATHON", "POSTIZ_TIKTOK_ACCOUNT_ID_THIRD"]
  }
];

export function tiktokAccountProfiles() {
  return TIKTOK_ACCOUNT_PROFILES.map((profile) => ({ ...profile }));
}

export function normalizeTiktokAccountProfile(value = null) {
  const requested = String(value || process.env.POSTIZ_TIKTOK_DEFAULT_ACCOUNT || "main")
    .trim()
    .toLowerCase()
    .replaceAll("_", "-");
  const match = TIKTOK_ACCOUNT_PROFILES.find((profile) => (
    profile.profile === requested || profile.aliases.includes(requested)
  ));
  if (!match) {
    throw new Error(`Unknown TikTok account profile: ${value}. Expected one of: ${TIKTOK_ACCOUNT_PROFILES.map((profile) => profile.profile).join(", ")}.`);
  }
  return match.profile;
}

export function tiktokAccountProfile(value = null) {
  const normalized = normalizeTiktokAccountProfile(value);
  const profile = TIKTOK_ACCOUNT_PROFILES.find((item) => item.profile === normalized);
  const env_key = profile.env_keys.find((key) => Boolean(process.env[key])) || profile.env_keys[0];
  return {
    ...profile,
    account_id: process.env[env_key] || null,
    env_key
  };
}

export function resolveTiktokPostizAccountId(value = null) {
  return tiktokAccountProfile(value).account_id;
}

export function configuredTiktokAccountIds() {
  const rows = [];
  for (const profile of TIKTOK_ACCOUNT_PROFILES) {
    for (const env_key of profile.env_keys) {
      const account_id = process.env[env_key];
      if (!account_id) continue;
      rows.push({
        profile: profile.profile,
        label: profile.label,
        lane: profile.lane,
        account_id,
        env_key
      });
      break;
    }
  }
  return rows;
}

export function isConfiguredTiktokAccountId(accountId) {
  const id = String(accountId || "");
  return configuredTiktokAccountIds().some((row) => row.account_id === id);
}

export function isWatchTiktokAccountReference({ accountId = null, account = null, post = null } = {}) {
  const id = String(accountId || post?.account_id || account?.account_id || "");
  const configuredWatchIds = TIKTOK_ACCOUNT_PROFILES
    .find((profile) => profile.profile === "watch")
    .env_keys
    .map((key) => process.env[key])
    .filter(Boolean);
  if (id && configuredWatchIds.includes(id)) return true;

  const text = [
    account?.profile,
    account?.account_profile,
    account?.label,
    account?.account_name,
    account?.lane,
    post?.account_profile,
    post?.account_name,
    post?.lane
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return /\bwatch\b/.test(text) || text.includes("runner watch lab") || text.includes("runwatchlab");
}

export function tiktokAccountEnvHint(value = null) {
  const profile = tiktokAccountProfile(value);
  return profile.env_key;
}
