import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import test from "node:test";

const port = 4317;
const baseUrl = `http://127.0.0.1:${port}`;

function startServer() {
  const child = spawn(process.execPath, ["server.mjs"], {
    cwd: new URL("..", import.meta.url),
    env: { ...process.env, PORT: String(port), TIKTOK_API_MODE: "sandbox", TIKTOK_CLIENT_KEY: "sandbox_client_key_for_test" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  return child;
}

async function waitForHealth() {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {
      // keep polling
    }
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  throw new Error("Timed out waiting for sandbox server health.");
}

async function postJson(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { response, json: await response.json() };
}

test("sandbox Direct Post flow exposes creator info, direct post, and status with video.publish only", async () => {
  const server = startServer();
  server.stderr.on("data", (chunk) => process.stderr.write(chunk));
  try {
    await waitForHealth();

    const callback = await fetch(`${baseUrl}/integrations/social/tiktok?code=sandbox_code_for_review_demo&state=everyday-runner-lab-review`);
    const callbackHtml = await callback.text();
    assert.equal(callback.status, 200);
    assert.match(callbackHtml, /Continue to Post to TikTok/);

    const connect = await fetch(`${baseUrl}/connect-tiktok/`, {
      headers: {
        "x-forwarded-host": "agentmode.onrender.com",
        "x-forwarded-proto": "https",
      },
    });
    const connectHtml = await connect.text();
    assert.equal(connect.status, 200);
    assert.match(connectHtml, /client_key=sandbox_client_key_for_test/);
    assert.match(connectHtml, /scope=video\.publish/);
    assert.match(connectHtml, /redirect_uri=https%3A%2F%2Fagentmode\.onrender\.com%2Fintegrations%2Fsocial%2Ftiktok/);
    assert.doesNotMatch(connectHtml, /video\.upload|user\.info\.basic|everyday-runner-lab\.onrender\.com/);

    const creator = await fetch(`${baseUrl}/api/tiktok/sandbox/creator-info`, {
      headers: {
        "x-forwarded-host": "agentmode.onrender.com",
        "x-forwarded-proto": "https",
      },
    });
    const creatorJson = await creator.json();
    assert.equal(creator.status, 200);
    assert.equal(creatorJson.scope, "video.publish");
    assert.equal(creatorJson.creator_info.creator_avatar_url, "https://agentmode.onrender.com/assets/app-icon-192.png");
    assert.deepEqual(creatorJson.creator_info.privacy_level_options, [
      "PUBLIC_TO_EVERYONE",
      "MUTUAL_FOLLOW_FRIENDS",
      "SELF_ONLY",
    ]);

    const validPayload = {
      title: "Top 5 easy run mistakes #running",
      privacy_level: "PUBLIC_TO_EVERYONE",
      allow_comments: true,
      allow_duet: false,
      allow_stitch: false,
      commercial_content: true,
      brand_organic_toggle: true,
      brand_content_toggle: false,
      consent: true,
    };

    const direct = await postJson("/api/tiktok/sandbox/direct-post", validPayload);
    assert.equal(direct.response.status, 200);
    assert.equal(direct.json.scope, "video.publish");
    assert.match(direct.json.publish_id, /^sandbox_publish_/);

    const status = await postJson("/api/tiktok/sandbox/status", { publish_id: direct.json.publish_id });
    assert.equal(status.response.status, 200);
    assert.equal(status.json.endpoint, "POST https://open.tiktokapis.com/v2/post/publish/status/fetch/");
    assert.equal(status.json.status, "PROCESSING");

    const invalid = await postJson("/api/tiktok/sandbox/direct-post", {
      ...validPayload,
      privacy_level: "",
    });
    assert.equal(invalid.response.status, 400);
    assert.match(invalid.json.errors.join(" "), /Privacy must be selected/);
  } finally {
    server.kill("SIGTERM");
    await once(server, "close");
  }
});
