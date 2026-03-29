import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";
import { dataRoot, defaultHeadless } from "./paths.js";

export type BrowserTaskOptions = {
  url: string;
  waitForText?: string;
  screenshot?: string;
  extract?: string;
  headless?: boolean;
  runLabel?: string;
  timeoutMs?: number;
};

export type BrowserTaskResult = {
  runDir: string;
  url: string;
  title: string;
  screenshotPath?: string;
  extractPath?: string;
  extractedText?: string;
};

function sanitizeLabel(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "run";
}

export async function runBrowserTask(options: BrowserTaskOptions): Promise<BrowserTaskResult> {
  const runsRoot = join(dataRoot, "runs");
  const label = sanitizeLabel(options.runLabel || new Date().toISOString().replace(/[:.]/g, "-"));
  const runDir = join(runsRoot, label);
  console.error(`[browserTask] creating run dir: ${runDir}`);
  await mkdir(runDir, { recursive: true });

  const tempBase = join(dataRoot, "tmp");
  console.error(`[browserTask] ensuring temp base: ${tempBase}`);
  await mkdir(tempBase, { recursive: true });
  const tempProfileDir = await mkdtemp(join(tempBase, "task-profile-"));
  console.error(`[browserTask] temp profile: ${tempProfileDir}`);

  console.error(`[browserTask] launching chromium headless=${options.headless ?? defaultHeadless}`);
  const browser = await chromium.launch({ headless: options.headless ?? defaultHeadless });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  try {
    console.error(`[browserTask] goto: ${options.url}`);
    await page.goto(options.url, { waitUntil: "domcontentloaded", timeout: options.timeoutMs ?? 30000 });
    if (options.waitForText) {
      console.error(`[browserTask] waiting for text: ${options.waitForText}`);
      await page.getByText(options.waitForText, { exact: false }).waitFor({ timeout: options.timeoutMs ?? 30000 });
    }

    const title = await page.title();
    let screenshotPath: string | undefined;
    let extractPath: string | undefined;
    let extractedText: string | undefined;

    if (options.screenshot) {
      screenshotPath = join(runDir, options.screenshot);
      console.error(`[browserTask] screenshot: ${screenshotPath}`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
    }

    if (options.extract) {
      extractedText = await page.locator("body").innerText();
      extractPath = join(runDir, options.extract);
      console.error(`[browserTask] extract: ${extractPath}`);
      await writeFile(extractPath, extractedText, "utf8");
    }

    return {
      runDir,
      url: page.url(),
      title,
      screenshotPath,
      extractPath,
      extractedText
    };
  } finally {
    console.error(`[browserTask] closing browser`);
    await context.close();
    await browser.close();
    await rm(tempProfileDir, { recursive: true, force: true });
  }
}
