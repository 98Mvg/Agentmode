const fs = require("node:fs/promises");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");
const { AuthService } = require("/app/apps/backend/dist/libraries/helpers/src/auth/auth.service.js");
const { getFreshTikTokAccessToken } = require("/app/coachi_tiktok_postiz_token.cjs");

const integrationId = process.argv[2];
const payloadPath = process.argv[3];

if (!integrationId || !payloadPath) {
  console.error(JSON.stringify({
    ok: false,
    message: "Usage: node tiktok_photo_inbox_upload.cjs <integration_id> <payload_json_path>",
  }, null, 2));
  process.exit(1);
}

const prisma = new PrismaClient();

function truncateUtf16(value, maxLength) {
  const text = String(value || "").trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim();
}

async function tiktokJson(url, accessToken, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(body),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok || (json.error?.code && json.error.code !== "ok")) {
    const error = json.error || {};
    const hint = error.code === "url_ownership_unverified"
      ? " Verify the media URL domain or URL prefix in the TikTok developer app, or serve the JPEG carousel from a verified Coachi-owned media URL."
      : "";
    throw new Error(`${url} failed: status=${response.status} code=${error.code || "unknown"} message=${error.message || ""}${hint}`);
  }
  return json;
}

async function initPhotoInboxUpload(accessToken, payload) {
  return tiktokJson("https://open.tiktokapis.com/v2/post/publish/content/init/", accessToken, {
    post_info: {
      title: truncateUtf16(payload.title, 90),
      description: truncateUtf16(payload.description, 4000),
    },
    source_info: {
      source: "PULL_FROM_URL",
      photo_cover_index: Number.isInteger(payload.photo_cover_index) ? payload.photo_cover_index : 0,
      photo_images: payload.photo_images,
    },
    post_mode: "MEDIA_UPLOAD",
    media_type: "PHOTO",
  });
}

async function fetchStatus(accessToken, publishId) {
  return tiktokJson("https://open.tiktokapis.com/v2/post/publish/status/fetch/", accessToken, {
    publish_id: publishId,
  });
}

async function main() {
  const absolutePayloadPath = path.resolve(payloadPath);
  const payload = JSON.parse(await fs.readFile(absolutePayloadPath, "utf8"));
  if (!Array.isArray(payload.photo_images) || payload.photo_images.length < 2) {
    throw new Error("Payload must include at least 2 photo_images.");
  }
  if (payload.photo_images.length > 35) {
    throw new Error("Payload photo_images must not exceed 35 images.");
  }

  const { accessToken, integration, tokenRefreshed } = await getFreshTikTokAccessToken({
    prisma,
    integrationId,
    AuthService,
  });
  const init = await initPhotoInboxUpload(accessToken, payload);
  const publishId = init.data?.publish_id;

  if (!publishId) {
    throw new Error("TikTok photo init response did not include publish_id.");
  }

  const statuses = [];
  for (let index = 0; index < 12; index += 1) {
    await new Promise((resolve) => setTimeout(resolve, index === 0 ? 1000 : 5000));
    const body = await fetchStatus(accessToken, publishId);
    const status = body.data?.status || null;
    statuses.push({
      status,
      fail_reason: body.data?.fail_reason || null,
    });
    if (["SEND_TO_USER_INBOX", "PUBLISH_COMPLETE", "FAILED"].includes(status)) break;
  }

  console.log(JSON.stringify({
    ok: true,
    mode: "tiktok_photo_media_upload_inbox",
    note: "No access token printed. TikTok requires the user to open the inbox notification and finish posting.",
    token_refreshed: tokenRefreshed,
    integration,
    slideshow_id: payload.slideshow_id || null,
    photo_count: payload.photo_images.length,
    publish_id: publishId,
    statuses,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(JSON.stringify({ ok: false, message: error.message }, null, 2));
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
