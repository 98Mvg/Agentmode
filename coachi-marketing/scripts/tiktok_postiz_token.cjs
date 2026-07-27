const REFRESH_BUFFER_MS = 10 * 60 * 1000;

function decryptMaybe(AuthService, value) {
  if (!value) return value;
  try {
    return AuthService.fixedDecryption(value);
  } catch {
    return value;
  }
}

function isExpiredOrClose(tokenExpiration) {
  if (!tokenExpiration) return true;
  const expiresAt = new Date(tokenExpiration).getTime();
  if (!Number.isFinite(expiresAt)) return true;
  return expiresAt <= Date.now() + REFRESH_BUFFER_MS;
}

async function refreshTikTokToken({ prisma, integration, AuthService }) {
  const clientKey = process.env.TIKTOK_CLIENT_ID;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const refreshToken = decryptMaybe(AuthService, integration.refreshToken);

  if (!clientKey || !clientSecret) {
    throw new Error("TIKTOK_CLIENT_ID and TIKTOK_CLIENT_SECRET are required to refresh TikTok upload tokens.");
  }
  if (!refreshToken) {
    throw new Error("TikTok integration has no refresh token; reconnect it in Postiz.");
  }

  const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
  });
  const json = await response.json().catch(() => ({}));

  const errorCode = json.error || json.error_code || json.error?.code;
  if (!response.ok || !json.access_token) {
    if (["invalid_grant", "access_token_invalid", "invalid_refresh_token"].includes(String(errorCode))) {
      await prisma.integration.update({
        where: { id: integration.id },
        data: { refreshNeeded: true },
      });
    }
    const message = json.message || json.error_description || json.description || "";
    throw new Error(`TikTok token refresh failed: status=${response.status} code=${errorCode || "unknown"} message=${message}`);
  }

  const expiresIn = Number(json.expires_in || 0);
  const tokenExpiration = new Date(Date.now() + (expiresIn || 23 * 60 * 60) * 1000);
  const updated = await prisma.integration.update({
    where: { id: integration.id },
    data: {
      token: json.access_token,
      refreshToken: json.refresh_token || integration.refreshToken,
      tokenExpiration,
      refreshNeeded: false,
    },
    select: {
      id: true,
      name: true,
      profile: true,
      tokenExpiration: true,
      refreshNeeded: true,
      disabled: true,
    },
  });

  return {
    accessToken: json.access_token,
    integration: updated,
    tokenRefreshed: true,
  };
}

async function getFreshTikTokAccessToken({ prisma, integrationId, AuthService }) {
  const integration = await prisma.integration.findUnique({
    where: { id: integrationId },
    select: {
      id: true,
      name: true,
      profile: true,
      providerIdentifier: true,
      token: true,
      refreshToken: true,
      refreshNeeded: true,
      disabled: true,
      tokenExpiration: true,
    },
  });

  if (!integration) throw new Error(`Integration not found: ${integrationId}`);
  if (integration.providerIdentifier !== "tiktok") {
    throw new Error(`Integration is not TikTok: ${integration.providerIdentifier}`);
  }
  if (integration.disabled) throw new Error("TikTok integration is disabled.");

  if (integration.refreshNeeded || isExpiredOrClose(integration.tokenExpiration)) {
    return refreshTikTokToken({ prisma, integration, AuthService });
  }

  const accessToken = decryptMaybe(AuthService, integration.token);
  if (!accessToken) throw new Error("TikTok integration has no access token; reconnect it in Postiz.");

  return {
    accessToken,
    tokenRefreshed: false,
    integration: {
      id: integration.id,
      name: integration.name,
      profile: integration.profile,
      tokenExpiration: integration.tokenExpiration,
      refreshNeeded: integration.refreshNeeded,
      disabled: integration.disabled,
    },
  };
}

module.exports = {
  getFreshTikTokAccessToken,
};
