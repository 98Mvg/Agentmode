import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const reviewRoot = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(reviewRoot, "demo-video-2026-06-03");
const videoName = "everyday-runner-lab-direct-post-scope-fix-demo-2026-06-03.mp4";
const framesDir = path.join(outputDir, "frames");
const port = 4187;
const baseUrl = `http://127.0.0.1:${port}`;
let frameIndex = 1;

function startServer() {
  const child = spawn(process.execPath, [path.join(reviewRoot, "server.mjs")], {
    cwd: reviewRoot,
    env: {
      ...process.env,
      PORT: String(port),
      PUBLIC_BASE_URL: baseUrl,
      TIKTOK_API_MODE: "sandbox",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));

  return new Promise((resolve, reject) => {
    child.once("error", reject);
    const deadline = Date.now() + 8000;
    async function poll() {
      try {
        const response = await fetch(`${baseUrl}/health`);
        if (response.ok) {
          resolve(child);
          return;
        }
      } catch {
        // keep polling until the server is ready
      }
      if (Date.now() > deadline) {
        reject(new Error("Timed out waiting for review sandbox server."));
        return;
      }
      setTimeout(poll, 120);
    }
    poll();
  });
}

async function caption(page, text) {
  await page.evaluate((captionText) => {
    var el = document.getElementById("review-caption");
    if (!el) {
      el = document.createElement("div");
      el.id = "review-caption";
      el.style.position = "fixed";
      el.style.left = "28px";
      el.style.right = "28px";
      el.style.bottom = "24px";
      el.style.zIndex = "99999";
      el.style.padding = "14px 18px";
      el.style.borderRadius = "8px";
      el.style.background = "rgba(19, 37, 27, 0.94)";
      el.style.color = "#ffffff";
      el.style.font = "700 18px/1.35 Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
      el.style.boxShadow = "0 14px 36px rgba(0, 0, 0, 0.24)";
      document.body.appendChild(el);
      document.body.style.paddingBottom = "120px";
    }
    el.textContent = captionText;
  }, text);
}

async function capture(page) {
  const filePath = path.join(framesDir, `frame-${String(frameIndex).padStart(3, "0")}.png`);
  frameIndex += 1;
  await page.screenshot({ path: filePath, fullPage: false });
}

async function show(page, urlPath, text) {
  await page.goto(`${baseUrl}${urlPath}`, { waitUntil: "networkidle" });
  await caption(page, text);
  await page.waitForTimeout(600);
  await capture(page);
}

function runFfmpeg(inputPattern, output) {
  const ffmpeg = fsSync.existsSync("/opt/homebrew/bin/ffmpeg") ? "/opt/homebrew/bin/ffmpeg" : "ffmpeg";
  const args = [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-framerate",
    "1/6",
    "-i",
    inputPattern,
    "-f",
    "lavfi",
    "-i",
    "anullsrc=channel_layout=stereo:sample_rate=44100",
    "-shortest",
    "-vf",
    "fps=30,format=yuv420p",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "21",
    "-c:a",
    "aac",
    "-movflags",
    "+faststart",
    output,
  ];

  return new Promise((resolve, reject) => {
    const child = spawn(ffmpeg, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr || `ffmpeg exited with ${code}`));
    });
  });
}

await fs.rm(framesDir, { recursive: true, force: true });
await fs.mkdir(framesDir, { recursive: true });
const server = await startServer();
let browser;

try {
  browser = await chromium.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome 2.app/Contents/MacOS/Google Chrome",
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  await show(page, "/", "1/11 Public website: app icon is visible in the page header and the same icon is linked as the favicon.");
  await show(page, "/terms/", "2/11 Terms of Service: the same Everyday Runner Lab app icon appears at the top of the page.");
  await show(page, "/privacy/", "3/11 Privacy Policy: the same app icon appears at the top of the page and favicon links are present.");
  await show(page, "/sandbox-demo/", "4/11 Backend sandbox review page: the selected TikTok product is Content Posting API Direct Post and the only requested scope is video.publish.");
  await show(page, "/login/", "5/11 Creator entry: the creator starts from the Everyday Runner Lab login page.");
  await show(page, "/connect-tiktok/", "6/11 TikTok authorization: OAuth requests only video.publish for Direct Post.");
  await show(page, "/integrations/social/tiktok/?code=sandbox_code_for_review_demo&state=everyday-runner-lab-review", "7/11 Sandbox redirect: TikTok returns code and state, then the creator continues to the posting workspace.");
  await show(page, "/post-to-tiktok/", "8/11 Posting workspace: the backend creator_info call uses video.publish and displays the connected creator, privacy options, and max duration.");

  await page.selectOption("#privacy", "PUBLIC_TO_EVERYONE");
  await page.check("#allow-comments");
  await page.check("#allow-duet");
  await page.check("#commercial-toggle");
  await caption(page, "9/11 Creator settings: privacy and interaction controls are manual; commercial content requires a disclosure choice.");
  await page.waitForTimeout(600);
  await capture(page);

  await page.check("#your-brand");
  await page.check("#consent");
  await caption(page, "10/11 Consent: publish stays disabled until privacy, disclosure, and TikTok music usage confirmation are complete.");
  await page.waitForTimeout(600);
  await capture(page);

  await page.click("#publish");
  await page.locator("#api-log").scrollIntoViewIfNeeded();
  await caption(page, "11/11 video.publish: Direct Post starts only after review and shows backend video/init plus status polling evidence.");
  await page.waitForTimeout(2400);
  await capture(page);

  await context.close();
  const mp4Path = path.join(outputDir, videoName);
  await runFfmpeg(path.join(framesDir, "frame-%03d.png"), mp4Path);
  console.log(mp4Path);
} finally {
  if (browser) await browser.close().catch(() => {});
  if (server) server.kill("SIGTERM");
}
