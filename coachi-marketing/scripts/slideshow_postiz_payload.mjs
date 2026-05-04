import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export const DEFAULT_PUBLISH_MODE = "manual-review";
export const VALID_PUBLISH_MODES = new Set(["manual-review", "direct-public"]);

export function assertValidPublishMode(publishMode) {
  if (!VALID_PUBLISH_MODES.has(publishMode)) {
    throw new Error(`Unsupported publish_mode: ${publishMode}. Expected one of: ${[...VALID_PUBLISH_MODES].join(", ")}.`);
  }
}

export function trimTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

export function postizApiBase() {
  if (process.env.POSTIZ_PUBLIC_API_BASE) {
    return trimTrailingSlash(process.env.POSTIZ_PUBLIC_API_BASE);
  }

  if (!process.env.POSTIZ_URL) {
    throw new Error("POSTIZ_URL or POSTIZ_PUBLIC_API_BASE is required for live scheduling.");
  }
  const postizUrl = trimTrailingSlash(process.env.POSTIZ_URL);
  if (/api\.postiz\.com$/i.test(postizUrl)) {
    return `${postizUrl}/public/v1`;
  }
  if (/\/api$/i.test(postizUrl)) {
    return `${postizUrl}/public/v1`;
  }
  return `${postizUrl}/api/public/v1`;
}

export function mediaType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".mp4") return "video/mp4";
  if (extension === ".mov") return "video/quicktime";
  return "application/octet-stream";
}

export function isPublicHttpsUrl(value) {
  return /^https:\/\//i.test(String(value || ""));
}

export function titleFromContent(content) {
  const firstLine = String(content || "").split("\n").find((line) => line.trim()) || "Coachi running tip";
  return firstLine.trim().slice(0, 90);
}

export function publishModeForPost(post) {
  const publishMode = post.publish_mode || post.publishMode || DEFAULT_PUBLISH_MODE;
  assertValidPublishMode(publishMode);
  return publishMode;
}

export function settingsForPost(post, account, content) {
  const platform = post.platform || account?.platform || "";
  if (post.settings) return post.settings;

  if (platform === "tiktok") {
    const publishMode = publishModeForPost(post);
    const directPublic = publishMode === "direct-public";
    return {
      __type: "tiktok",
      title: post.title || titleFromContent(content),
      privacy_level: directPublic
        ? "PUBLIC_TO_EVERYONE"
        : (process.env.POSTIZ_TIKTOK_PRIVACY_LEVEL || "SELF_ONLY"),
      duet: false,
      stitch: false,
      comment: true,
      autoAddMusic: directPublic
        ? "yes"
        : (process.env.POSTIZ_TIKTOK_AUTO_ADD_MUSIC || "yes"),
      media_type: post.media_type || "PHOTO",
      output_mode: post.output_mode || "photo_carousel",
      brand_content_toggle: false,
      brand_organic_toggle: false,
      video_made_with_ai: post.video_made_with_ai ?? true,
      content_posting_method: directPublic
        ? "DIRECT_POST"
        : (process.env.POSTIZ_TIKTOK_CONTENT_POSTING_METHOD || "UPLOAD")
    };
  }

  if (platform === "instagram") {
    return {
      __type: process.env.POSTIZ_INSTAGRAM_TYPE || "instagram",
      post_type: post.post_type || "post",
      media_type: post.media_type || "CAROUSEL_ALBUM",
      output_mode: post.output_mode || "photo_carousel",
      is_trial_reel: false,
      collaborators: []
    };
  }

  return {
    __type: platform || "bluesky"
  };
}

export function assertDirectPublicTikTokPost(post, settings = settingsForPost(post, { platform: "tiktok" }, "")) {
  if ((post.platform || "tiktok") !== "tiktok") return;
  if (publishModeForPost(post) !== "direct-public") return;

  if (post.output_mode !== "photo_carousel") {
    throw new Error(`TikTok direct-public post ${post.slideshow_id || ""} must use output_mode=photo_carousel.`);
  }
  if (post.media_type !== "PHOTO") {
    throw new Error(`TikTok direct-public post ${post.slideshow_id || ""} must use media_type=PHOTO.`);
  }
  if (!Array.isArray(post.media_paths) || post.media_paths.length < 2 || post.media_paths.length > 10) {
    throw new Error(`TikTok direct-public photo carousel requires 2-10 images for ${post.slideshow_id || "post"}.`);
  }
  const required = {
    privacy_level: "PUBLIC_TO_EVERYONE",
    content_posting_method: "DIRECT_POST",
    autoAddMusic: "yes",
    video_made_with_ai: true
  };
  for (const [key, value] of Object.entries(required)) {
    if (settings[key] !== value) {
      throw new Error(`TikTok direct-public setting ${key} must be ${value}; got ${settings[key]}.`);
    }
  }
}

async function readTextIfExists(filePath) {
  if (!filePath) return "";
  return fs.readFile(path.resolve(filePath), "utf8");
}

function dryRunMedia(mediaPath) {
  return {
    id: `dry-run-${path.basename(mediaPath)}`,
    path: mediaPath
  };
}

function publicHttpsMedia(mediaPath) {
  const hash = crypto.createHash("sha256").update(String(mediaPath)).digest("hex").slice(0, 12);
  return {
    id: `public-${hash}`,
    path: mediaPath
  };
}

async function mediaForPostiz(mediaPath, { dryRun, uploadMedia }) {
  if (dryRun) return dryRunMedia(mediaPath);
  if (isPublicHttpsUrl(mediaPath)) return publicHttpsMedia(mediaPath);
  if (!uploadMedia) {
    throw new Error(`uploadMedia is required for local media path: ${mediaPath}`);
  }
  return uploadMedia(mediaPath);
}

export async function buildPostizPublicPayload(post, accounts, { dryRun, uploadMedia } = {}) {
  const account = accounts.get(post.account_id);
  const content = post.content || (await readTextIfExists(post.caption_path)).trim();
  const mediaPaths = post.media_paths || [];
  const uploadedMedia = await Promise.all(
    mediaPaths.map((mediaPath) => mediaForPostiz(mediaPath, { dryRun, uploadMedia }))
  );
  const settings = settingsForPost(post, account, content);
  assertDirectPublicTikTokPost(post, settings);

  return {
    type: post.postiz_type || post.publish_type || "schedule",
    date: new Date(post.scheduled_at).toISOString(),
    shortLink: false,
    tags: post.tags || [],
    posts: [
      {
        integration: {
          id: post.account_id
        },
        value: [
          {
            content,
            image: uploadedMedia
          }
        ],
        settings
      }
    ]
  };
}
