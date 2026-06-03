import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const reviewRoot = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.join(reviewRoot, "site");
const port = Number(process.env.PORT || 4187);
const fallbackPublicBaseUrl = process.env.PUBLIC_BASE_URL || "https://everyday-runner-lab.onrender.com";
const apiMode = process.env.TIKTOK_API_MODE || "sandbox";

const sessions = new Map();
const posts = new Map();
const auditLog = [];

const mime = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".mp4", "video/mp4"],
]);

function jsonResponse(res, statusCode, body) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-cache, max-age=0",
  });
  res.end(JSON.stringify(body, null, 2));
}

function htmlResponse(res, statusCode, body) {
  res.writeHead(statusCode, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-cache, max-age=0",
  });
  res.end(body);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function requestPublicBaseUrl(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  if (!host) return fallbackPublicBaseUrl;
  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto = forwardedProto || (String(host).startsWith("127.0.0.1") || String(host).startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function resolveStaticPath(requestUrl) {
  const parsed = new URL(requestUrl, `http://127.0.0.1:${port}`);
  const normalized = decodeURIComponent(parsed.pathname);
  const candidate = path.normalize(path.join(siteDir, normalized));
  if (!candidate.startsWith(siteDir)) return null;
  if (fsSync.existsSync(candidate) && fsSync.statSync(candidate).isDirectory()) {
    return path.join(candidate, "index.html");
  }
  if (fsSync.existsSync(candidate)) return candidate;
  return path.join(candidate, "index.html");
}

function defaultSession() {
  const id = "sandbox_review_session";
  if (!sessions.has(id)) {
    sessions.set(id, {
      id,
      code: "sandbox_code_for_review_demo",
      state: "everyday-runner-lab-review",
      tokenKind: "sandbox",
      createdAt: new Date().toISOString(),
    });
  }
  return sessions.get(id);
}

function sessionFromRequest(req) {
  const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);
  const sessionId = url.searchParams.get("session_id") || "sandbox_review_session";
  return sessions.get(sessionId) || defaultSession();
}

async function readJson(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

function addAudit(action, endpoint, requestPreview, responsePreview) {
  const entry = {
    at: new Date().toISOString(),
    action,
    mode: apiMode,
    endpoint,
    request: requestPreview,
    response: responsePreview,
  };
  auditLog.unshift(entry);
  auditLog.splice(30);
  return entry;
}

function creatorInfoResponse(session, baseUrl) {
  const response = {
    request_id: `erl_creator_${randomUUID()}`,
    session_id: session.id,
    scope: "video.publish",
    endpoint: "POST https://open.tiktokapis.com/v2/post/publish/creator_info/query/",
    mode: apiMode,
    sandbox: apiMode !== "live",
    creator_info: {
      open_id: "sandbox_creator_open_id",
      creator_username: "everydayrunnerlab0",
      creator_nickname: "Everyday Runner Lab Demo",
      creator_avatar_url: `${baseUrl}/assets/app-icon-192.png`,
      privacy_level_options: [
        "PUBLIC_TO_EVERYONE",
        "MUTUAL_FOLLOW_FRIENDS",
        "SELF_ONLY",
      ],
      comment_disabled: false,
      duet_disabled: false,
      stitch_disabled: false,
      max_video_post_duration_sec: 300,
    },
  };
  addAudit("creator_info", response.endpoint, { access_token: "sandbox_access_token_masked" }, response);
  return response;
}

function validatePostPayload(body) {
  const errors = [];
  if (!body.title || String(body.title).trim().length < 3) errors.push("Title is required.");
  if (!body.privacy_level) errors.push("Privacy must be selected by the creator.");
  if (body.consent !== true) errors.push("TikTok music usage consent is required.");
  if (body.commercial_content && !body.brand_organic_toggle && !body.brand_content_toggle) {
    errors.push("Commercial content requires Your brand, Branded content, or both.");
  }
  if (body.privacy_level === "SELF_ONLY" && body.brand_content_toggle) {
    errors.push("Branded content cannot be set to private visibility.");
  }
  return errors;
}

function postInfoFromPayload(body) {
  return {
    title: String(body.title || "").slice(0, 2200),
    privacy_level: body.privacy_level,
    disable_comment: !body.allow_comments,
    disable_duet: !body.allow_duet,
    disable_stitch: !body.allow_stitch,
    brand_organic_toggle: Boolean(body.brand_organic_toggle),
    brand_content_toggle: Boolean(body.brand_content_toggle),
  };
}

function sourceInfo() {
  return {
    source: "FILE_UPLOAD",
    video_size: 4400000,
    chunk_size: 4400000,
    total_chunk_count: 1,
    media_note: "Review sample media from /uploads/easy-run-mistakes is used for sandbox demonstration.",
  };
}

function createSandboxDirectPost(session, body, baseUrl) {
  const errors = validatePostPayload(body);
  if (errors.length) {
    return { error: true, statusCode: 400, body: { errors } };
  }

  const publishId = `sandbox_publish_${randomUUID()}`;
  const endpoint = "POST https://open.tiktokapis.com/v2/post/publish/video/init/";
  const requestPreview = {
    media_type: "VIDEO",
    post_mode: "DIRECT_POST",
    post_info: postInfoFromPayload(body),
    source_info: sourceInfo(),
  };
  const responsePreview = {
    request_id: `erl_direct_${randomUUID()}`,
    session_id: session.id,
    scope: "video.publish",
    endpoint,
    mode: apiMode,
    sandbox: apiMode !== "live",
    publish_id: publishId,
    status: "PROCESSING",
    upload_url: `${baseUrl}/api/tiktok/sandbox/upload/${publishId}`,
    next_status_endpoint: "POST https://open.tiktokapis.com/v2/post/publish/status/fetch/",
  };

  posts.set(publishId, {
    kind: "direct",
    createdAt: Date.now(),
    statusChecks: 0,
    requestPreview,
  });
  addAudit("video.publish", endpoint, requestPreview, responsePreview);
  return { error: false, statusCode: 200, body: responsePreview };
}

function fetchStatus(body) {
  const publishId = body.publish_id;
  const post = posts.get(publishId);
  if (!post) {
    return { statusCode: 404, body: { error: "Unknown sandbox publish_id." } };
  }

  post.statusChecks += 1;
  const status = post.kind === "direct"
    ? (post.statusChecks >= 2 ? "PUBLISH_COMPLETE" : "PROCESSING")
    : "DRAFT_UPLOADED";
  const endpoint = "POST https://open.tiktokapis.com/v2/post/publish/status/fetch/";
  const responsePreview = {
    request_id: `erl_status_${randomUUID()}`,
    endpoint,
    publish_id: publishId,
    status,
    mode: apiMode,
    sandbox: apiMode !== "live",
  };
  addAudit("status.fetch", endpoint, { publish_id: publishId }, responsePreview);
  return { statusCode: 200, body: responsePreview };
}

function connectTikTokHtml(baseUrl) {
  const redirectUri = `${baseUrl}/integrations/social/tiktok`;
  const authUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
  authUrl.searchParams.set("client_key", "awwtjmvlgq4iv8ke");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "video.publish");
  authUrl.searchParams.set("state", "everyday-runner-lab-review");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Connect TikTok | Everyday Runner Lab</title>
    <meta name="description" content="TikTok authorization entry for Everyday Runner Lab.">
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/app-icon-32.png">
    <link rel="icon" type="image/png" sizes="192x192" href="/assets/app-icon-192.png">
    <link rel="apple-touch-icon" href="/assets/app-icon-192.png">
    <style>
      body { max-width: 760px; margin: 48px auto; padding: 0 22px; font: 18px/1.6 Georgia, "Times New Roman", serif; color: #161616; background: #f7f1e7; }
      .brand-mark { display: flex; align-items: center; gap: 14px; margin-bottom: 32px; font: 700 16px/1.2 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .brand-mark img { width: 56px; height: 56px; border-radius: 14px; }
      h1 { font-size: clamp(36px, 7vw, 44px); line-height: 1; letter-spacing: 0; }
      a { color: #2f6b4f; }
      .button { display: inline-block; margin-top: 18px; padding: 12px 16px; border: 1px solid #2f6b4f; border-radius: 999px; text-decoration: none; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 14px; }
      code { background: #efe4d4; padding: 2px 5px; border-radius: 4px; }
    </style>
  </head>
  <body>
    <div class="brand-mark">
      <img src="/assets/everyday-runner-lab-app-icon-1024.png" alt="Everyday Runner Lab app icon">
      <span>Everyday Runner Lab</span>
    </div>
    <h1>Connect TikTok to Everyday Runner Lab</h1>
    <p>This page starts the Everyday Runner Lab TikTok authorization flow for the creator workspace.</p>
    <p>The requested TikTok scope is limited to <code>video.publish</code> for the creator-approved Direct Post flow. Creator info is loaded through TikTok's Direct Post <code>creator_info/query</code> endpoint, which also uses <code>video.publish</code>.</p>
    <p>
      <a class="button" href="${escapeHtml(authUrl.toString())}">
        Authorize TikTok
      </a>
    </p>
    <p><a class="button" href="/sandbox-demo">Review sandbox/mock flow</a></p>
    <p><a class="button" href="/post-to-tiktok">Review Post to TikTok flow</a></p>
    <p>Redirect URI: <code>${escapeHtml(redirectUri)}</code></p>
    <p><a href="/">Back to Everyday Runner Lab</a></p>
  </body>
</html>`;
}

function oauthCallback(req, res) {
  const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error") || url.searchParams.get("error_description");

  if (error) {
    htmlResponse(res, 400, callbackHtml({
      heading: "TikTok authorization returned an error",
      status: error,
      sessionId: "",
      showContinue: false,
    }));
    return;
  }

  if (!code || !state) {
    htmlResponse(res, 200, callbackHtml({
      heading: "Everyday Runner Lab TikTok Connection",
      status: "This is the registered TikTok redirect URI. Start from Creator Login or Connect TikTok.",
      sessionId: defaultSession().id,
      showContinue: true,
    }));
    return;
  }

  const sessionId = `sandbox_${randomUUID()}`;
  sessions.set(sessionId, {
    id: sessionId,
    code,
    state,
    tokenKind: apiMode === "live" ? "pending_exchange" : "sandbox",
    createdAt: new Date().toISOString(),
  });
  addAudit("oauth.redirect", "GET /integrations/social/tiktok", { code: "masked", state }, { session_id: sessionId });
  htmlResponse(res, 200, callbackHtml({
    heading: "TikTok authorized the request",
    status: "A review session was created. Continue to the creator-controlled posting workspace.",
    sessionId,
    showContinue: true,
  }));
}

function callbackHtml({ heading, status, sessionId, showContinue }) {
  const link = showContinue
    ? `<p><a id="continue-link" class="button" href="/post-to-tiktok/?session_id=${encodeURIComponent(sessionId)}">Continue to Post to TikTok</a></p>`
    : "";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>TikTok Connection | Everyday Runner Lab</title>
    <meta name="description" content="TikTok OAuth redirect page for Everyday Runner Lab.">
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/app-icon-32.png">
    <link rel="icon" type="image/png" sizes="192x192" href="/assets/app-icon-192.png">
    <link rel="apple-touch-icon" href="/assets/app-icon-192.png">
    <style>
      body { max-width: 760px; margin: 48px auto; padding: 0 22px; font: 18px/1.6 Georgia, "Times New Roman", serif; color: #161616; background: #f7f1e7; }
      .brand-mark { display: flex; align-items: center; gap: 14px; margin-bottom: 32px; font: 700 16px/1.2 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .brand-mark img { width: 56px; height: 56px; border-radius: 14px; }
      h1 { font-size: clamp(36px, 7vw, 44px); line-height: 1; letter-spacing: 0; }
      a { color: #2f6b4f; }
      .button { display: inline-block; margin-top: 18px; padding: 12px 16px; border: 1px solid #2f6b4f; border-radius: 999px; text-decoration: none; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 14px; }
      .muted { color: #5c554c; font-size: 15px; }
    </style>
  </head>
  <body>
    <div class="brand-mark">
      <img src="/assets/everyday-runner-lab-app-icon-1024.png" alt="Everyday Runner Lab app icon">
      <span>Everyday Runner Lab</span>
    </div>
    <h1>${escapeHtml(heading)}</h1>
    <p id="status">${escapeHtml(status)}</p>
    <p class="muted">After authorization, the creator workspace uses backend sandbox endpoints for creator_info, video.publish Direct Post, and status polling.</p>
    ${link}
    <p><a href="/">Back to Everyday Runner Lab</a></p>
  </body>
</html>`;
}

async function routeApi(req, res) {
  const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);
  const session = sessionFromRequest(req);
  const baseUrl = requestPublicBaseUrl(req);

  if (req.method === "GET" && url.pathname === "/api/tiktok/sandbox/creator-info") {
    jsonResponse(res, 200, creatorInfoResponse(session, baseUrl));
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/tiktok/sandbox/audit-log") {
    jsonResponse(res, 200, { mode: apiMode, events: auditLog });
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/tiktok/sandbox/direct-post") {
    const result = createSandboxDirectPost(session, await readJson(req), baseUrl);
    jsonResponse(res, result.statusCode, result.body);
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/tiktok/sandbox/status") {
    const result = fetchStatus(await readJson(req));
    jsonResponse(res, result.statusCode, result.body);
    return true;
  }

  return false;
}

async function serveStatic(req, res) {
  const filePath = resolveStaticPath(req.url || "/");
  if (!filePath || !fsSync.existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }
  res.setHeader("Content-Type", mime.get(path.extname(filePath)) || "application/octet-stream");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300");
  res.end(await fs.readFile(filePath));
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);
    if (req.method === "GET" && url.pathname === "/health") {
      jsonResponse(res, 200, { ok: true, mode: apiMode, service: "everyday-runner-lab-tiktok-review" });
      return;
    }
    if (req.method === "GET" && (url.pathname === "/connect-tiktok" || url.pathname === "/connect-tiktok/")) {
      htmlResponse(res, 200, connectTikTokHtml(requestPublicBaseUrl(req)));
      return;
    }
    if (url.pathname === "/integrations/social/tiktok") {
      oauthCallback(req, res);
      return;
    }
    if (url.pathname.startsWith("/api/tiktok/sandbox/") && await routeApi(req, res)) {
      return;
    }
    await serveStatic(req, res);
  } catch (error) {
    jsonResponse(res, 500, { error: String(error?.message || error) });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Everyday Runner Lab TikTok review server listening on ${port}`);
});
