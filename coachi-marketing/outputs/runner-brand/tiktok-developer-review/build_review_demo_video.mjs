import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const reviewRoot = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.join(reviewRoot, "site");
const outputDir = path.join(reviewRoot, "demo-video-2026-05-25");
const videoName = "everyday-runner-lab-tiktok-sandbox-review-demo-2026-05-25.mp4";
const framesDir = path.join(outputDir, "frames");
const port = 4187;
const baseUrl = `http://127.0.0.1:${port}`;
let frameIndex = 1;

const mime = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
]);

function resolvePath(requestUrl) {
  const parsed = new URL(requestUrl, baseUrl);
  const normalized = decodeURIComponent(parsed.pathname);
  const candidate = path.normalize(path.join(siteDir, normalized));
  if (!candidate.startsWith(siteDir)) return null;
  if (fsSync.existsSync(candidate) && fsSync.statSync(candidate).isDirectory()) {
    return path.join(candidate, "index.html");
  }
  if (fsSync.existsSync(candidate)) return candidate;
  return path.join(candidate, "index.html");
}

function startServer() {
  const server = http.createServer(async (req, res) => {
    try {
      const filePath = resolvePath(req.url || "/");
      if (!filePath || !fsSync.existsSync(filePath)) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.setHeader("Content-Type", mime.get(path.extname(filePath)) || "application/octet-stream");
      res.end(await fs.readFile(filePath));
    } catch (error) {
      res.writeHead(500);
      res.end(String(error));
    }
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve(server));
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

  await show(page, "/", "1/12 Public website: app icon is visible in the page header and the same icon is linked as the favicon.");
  await show(page, "/terms/", "2/12 Terms of Service: the same Everyday Runner Lab app icon appears at the top of the page.");
  await show(page, "/privacy/", "3/12 Privacy Policy: the same app icon appears at the top of the page and favicon links are present.");
  await show(page, "/sandbox-demo/", "4/12 Sandbox/mock review page: all selected TikTok products and scopes are named before the flow begins.");
  await show(page, "/login/", "5/12 Login Kit entry: the creator starts from the Everyday Runner Lab login page.");
  await show(page, "/connect-tiktok/", "6/12 TikTok authorization: OAuth requests user.info.basic, video.upload, and video.publish.");
  await show(page, "/integrations/social/tiktok/?code=sandbox_code_for_review_demo&state=everyday-runner-lab-review", "7/12 Sandbox redirect: TikTok returns code and state, then the creator continues to the posting workspace.");
  await show(page, "/post-to-tiktok/", "8/12 Posting workspace: user.info.basic displays the connected creator, privacy options, and max duration.");

  await page.selectOption("#privacy", "PUBLIC_TO_EVERYONE");
  await page.check("#allow-comments");
  await page.check("#allow-duet");
  await page.check("#commercial-toggle");
  await caption(page, "9/12 Creator settings: privacy and interaction controls are manual; commercial content requires a disclosure choice.");
  await page.waitForTimeout(600);
  await capture(page);

  await page.check("#your-brand");
  await page.check("#consent");
  await caption(page, "10/12 Consent: publish actions stay disabled until privacy, disclosure, and TikTok music usage confirmation are complete.");
  await page.waitForTimeout(600);
  await capture(page);

  await page.click("#draft-upload");
  await caption(page, "11/12 video.upload: the creator can upload original media as a TikTok draft for final editing.");
  await page.waitForTimeout(2400);
  await capture(page);

  await page.goto(`${baseUrl}/post-to-tiktok/`, { waitUntil: "networkidle" });
  await page.selectOption("#privacy", "PUBLIC_TO_EVERYONE");
  await page.check("#consent");
  await page.click("#publish");
  await caption(page, "12/12 video.publish: Direct Post starts only after the creator reviews settings and presses Publish to TikTok.");
  await page.waitForTimeout(2400);
  await capture(page);

  await context.close();
  const mp4Path = path.join(outputDir, videoName);
  await runFfmpeg(path.join(framesDir, "frame-%03d.png"), mp4Path);
  console.log(mp4Path);
} finally {
  if (browser) await browser.close().catch(() => {});
  await new Promise((resolve) => server.close(resolve));
}
