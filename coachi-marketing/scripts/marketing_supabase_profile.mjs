const STORAGE_PROFILE_SUFFIX = {
  main: "MAIN_WATCH",
  watch: "MAIN_WATCH",
  marathon: "MARATHON"
};

function requiredCredentialMessage(profile) {
  const suffix = STORAGE_PROFILE_SUFFIX[profile];
  return `TikTok ${profile} uploads require MARKETING_SUPABASE_URL_${suffix} and MARKETING_SUPABASE_SECRET_KEY_${suffix} (or MARKETING_SUPABASE_SERVICE_ROLE_KEY_${suffix}).`;
}

export function marketingSupabaseUploadEnvForTiktokProfile(profile, env = process.env) {
  const suffix = STORAGE_PROFILE_SUFFIX[profile];
  if (!suffix) throw new Error(`Unknown TikTok storage profile: ${profile}.`);

  const dedicatedUrl = env[`MARKETING_SUPABASE_URL_${suffix}`];
  const dedicatedKey = env[`MARKETING_SUPABASE_SECRET_KEY_${suffix}`]
    || env[`MARKETING_SUPABASE_SERVICE_ROLE_KEY_${suffix}`];
  const allowSharedFallback = profile !== "marathon";
  const url = dedicatedUrl || (allowSharedFallback ? env.MARKETING_SUPABASE_URL : null);
  const apiKey = dedicatedKey || (allowSharedFallback
    ? (env.MARKETING_SUPABASE_SECRET_KEY || env.MARKETING_SUPABASE_SERVICE_ROLE_KEY)
    : null);

  if (!url || !apiKey) {
    const suffixMessage = profile === "marathon"
      ? " Generic MARKETING_SUPABASE_* credentials are intentionally blocked for Marathon uploads."
      : "";
    throw new Error(`${requiredCredentialMessage(profile)}${suffixMessage}`);
  }

  return {
    MARKETING_SUPABASE_URL: url,
    MARKETING_SUPABASE_SECRET_KEY: apiKey,
    MARKETING_SUPABASE_PUBLIC_BUCKET: env[`MARKETING_SUPABASE_PUBLIC_BUCKET_${suffix}`]
      || env.MARKETING_SUPABASE_PUBLIC_BUCKET
      || "slideshow-public",
    MARKETING_SUPABASE_PRIVATE_BUCKET: env[`MARKETING_SUPABASE_PRIVATE_BUCKET_${suffix}`]
      || env.MARKETING_SUPABASE_PRIVATE_BUCKET
      || "slideshow-private"
  };
}
