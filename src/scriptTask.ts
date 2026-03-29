import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { Page } from "playwright";
import { projectRoot } from "./paths.js";

export type BrowserTarget = {
  selector?: string;
  role?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  text?: string;
  testId?: string;
};

type GotoStep = {
  type: "goto";
  url: string;
  waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit";
  timeoutMs?: number;
};

type WaitForTextStep = {
  type: "waitForText";
  text: string;
  timeoutMs?: number;
};

type WaitForUrlStep = {
  type: "waitForUrlContains";
  value: string;
  timeoutMs?: number;
};

type WaitForTargetStep = {
  type: "waitForTarget";
  target: BrowserTarget;
  timeoutMs?: number;
};

type ClickStep = {
  type: "click";
  target: BrowserTarget;
  timeoutMs?: number;
};

type FillStep = {
  type: "fill";
  target: BrowserTarget;
  value?: string;
  valueFile?: string;
  clearFirst?: boolean;
  timeoutMs?: number;
};

type PressStep = {
  type: "press";
  key: string;
};

type SleepStep = {
  type: "sleep";
  ms: number;
};

type ScreenshotStep = {
  type: "screenshot";
  path: string;
  fullPage?: boolean;
};

type ExtractStep = {
  type: "extract";
  path: string;
};

type AttachFileStep = {
  type: "attachFile";
  target: BrowserTarget;
  paths: string[];
  timeoutMs?: number;
};

type PublishStep = {
  type: "publish";
  target: BrowserTarget;
  timeoutMs?: number;
};

export type BrowserScriptStep =
  | GotoStep
  | WaitForTextStep
  | WaitForUrlStep
  | WaitForTargetStep
  | ClickStep
  | FillStep
  | PressStep
  | SleepStep
  | ScreenshotStep
  | ExtractStep
  | AttachFileStep
  | PublishStep;

export type BrowserScript = {
  name?: string;
  steps: BrowserScriptStep[];
};

export type BrowserScriptStepResult = {
  index: number;
  type: BrowserScriptStep["type"];
  status: "ok" | "skipped";
  detail: string;
  outputPath?: string;
  url: string;
};

type RunScriptOptions = {
  page: Page;
  runDir: string;
  scriptFile: string;
  timeoutMs: number;
  allowLivePublish?: boolean;
};

type RunScriptResult = {
  scriptName?: string;
  stepResults: BrowserScriptStepResult[];
  screenshotPath?: string;
  extractPath?: string;
  extractedText?: string;
  published: boolean;
};

function resolveScriptFile(scriptFile: string) {
  return isAbsolute(scriptFile) ? scriptFile : resolve(projectRoot, scriptFile);
}

function resolveStringTemplate(value: string) {
  return value.replace(/\{\{env:([A-Z0-9_]+)\}\}/gi, (_, name: string) => {
    const resolved = process.env[name];
    if (typeof resolved !== "string" || resolved.length === 0) {
      throw new Error(`Missing required environment variable ${name}`);
    }
    return resolved;
  });
}

function resolveScriptPath(baseDir: string, value: string) {
  const templated = resolveStringTemplate(value);
  return isAbsolute(templated) ? templated : resolve(baseDir, templated);
}

function resolveOutputPath(runDir: string, value: string) {
  const templated = resolveStringTemplate(value);
  return isAbsolute(templated) ? templated : join(runDir, templated);
}

async function loadScript(scriptFile: string): Promise<{ script: BrowserScript; scriptPath: string; baseDir: string }> {
  const scriptPath = resolveScriptFile(scriptFile);
  const raw = await readFile(scriptPath, "utf8");
  const script = JSON.parse(raw) as BrowserScript;

  if (!Array.isArray(script.steps) || script.steps.length === 0) {
    throw new Error(`Script ${scriptPath} must include a non-empty steps array`);
  }

  return {
    script,
    scriptPath,
    baseDir: dirname(scriptPath)
  };
}

function targetSummary(target: BrowserTarget) {
  return (
    target.selector ||
    target.testId ||
    target.label ||
    target.placeholder ||
    target.name ||
    target.text ||
    target.role ||
    "target"
  );
}

function getTargetLocator(page: Page, target: BrowserTarget) {
  if (target.selector) {
    return page.locator(resolveStringTemplate(target.selector)).first();
  }

  if (target.testId) {
    return page.getByTestId(resolveStringTemplate(target.testId)).first();
  }

  if (target.role) {
    const options = target.name ? { name: resolveStringTemplate(target.name), exact: false } : undefined;
    return page.getByRole(target.role as Parameters<Page["getByRole"]>[0], options).first();
  }

  if (target.label) {
    return page.getByLabel(resolveStringTemplate(target.label), { exact: false }).first();
  }

  if (target.placeholder) {
    return page.getByPlaceholder(resolveStringTemplate(target.placeholder), { exact: false }).first();
  }

  if (target.text) {
    return page.getByText(resolveStringTemplate(target.text), { exact: false }).first();
  }

  throw new Error(`Unsupported target ${JSON.stringify(target)}`);
}

async function readStepValue(baseDir: string, step: FillStep) {
  if (typeof step.value === "string") {
    return resolveStringTemplate(step.value);
  }

  if (step.valueFile) {
    const path = resolveScriptPath(baseDir, step.valueFile);
    return readFile(path, "utf8");
  }

  throw new Error(`Fill step for ${targetSummary(step.target)} is missing value or valueFile`);
}

export async function runBrowserScript(options: RunScriptOptions): Promise<RunScriptResult> {
  const { script, baseDir, scriptPath } = await loadScript(options.scriptFile);
  const stepResults: BrowserScriptStepResult[] = [];
  let latestScreenshotPath: string | undefined;
  let latestExtractPath: string | undefined;
  let latestExtractedText: string | undefined;
  let published = false;

  for (let index = 0; index < script.steps.length; index += 1) {
    const step = script.steps[index];

    switch (step.type) {
      case "goto": {
        await options.page.goto(resolveStringTemplate(step.url), {
          waitUntil: step.waitUntil || "domcontentloaded",
          timeout: step.timeoutMs ?? options.timeoutMs
        });
        stepResults.push({
          index,
          type: step.type,
          status: "ok",
          detail: `Opened ${step.url}`,
          url: options.page.url()
        });
        break;
      }
      case "waitForText": {
        const text = resolveStringTemplate(step.text);
        await options.page.getByText(text, { exact: false }).waitFor({ timeout: step.timeoutMs ?? options.timeoutMs });
        stepResults.push({
          index,
          type: step.type,
          status: "ok",
          detail: `Found text ${text}`,
          url: options.page.url()
        });
        break;
      }
      case "waitForUrlContains": {
        const value = resolveStringTemplate(step.value);
        await options.page.waitForURL((url) => url.toString().includes(value), {
          timeout: step.timeoutMs ?? options.timeoutMs
        });
        stepResults.push({
          index,
          type: step.type,
          status: "ok",
          detail: `URL contains ${value}`,
          url: options.page.url()
        });
        break;
      }
      case "waitForTarget": {
        const locator = getTargetLocator(options.page, step.target);
        await locator.waitFor({ state: "visible", timeout: step.timeoutMs ?? options.timeoutMs });
        stepResults.push({
          index,
          type: step.type,
          status: "ok",
          detail: `Target visible: ${targetSummary(step.target)}`,
          url: options.page.url()
        });
        break;
      }
      case "click": {
        const locator = getTargetLocator(options.page, step.target);
        await locator.waitFor({ state: "visible", timeout: step.timeoutMs ?? options.timeoutMs });
        await locator.click({ timeout: step.timeoutMs ?? options.timeoutMs });
        stepResults.push({
          index,
          type: step.type,
          status: "ok",
          detail: `Clicked ${targetSummary(step.target)}`,
          url: options.page.url()
        });
        break;
      }
      case "fill": {
        const locator = getTargetLocator(options.page, step.target);
        await locator.waitFor({ state: "visible", timeout: step.timeoutMs ?? options.timeoutMs });
        const value = await readStepValue(baseDir, step);
        if (step.clearFirst) {
          await locator.clear();
        }
        await locator.fill(value, { timeout: step.timeoutMs ?? options.timeoutMs });
        stepResults.push({
          index,
          type: step.type,
          status: "ok",
          detail: `Filled ${targetSummary(step.target)}`,
          url: options.page.url()
        });
        break;
      }
      case "press": {
        await options.page.keyboard.press(step.key);
        stepResults.push({
          index,
          type: step.type,
          status: "ok",
          detail: `Pressed ${step.key}`,
          url: options.page.url()
        });
        break;
      }
      case "sleep": {
        await options.page.waitForTimeout(step.ms);
        stepResults.push({
          index,
          type: step.type,
          status: "ok",
          detail: `Slept ${step.ms}ms`,
          url: options.page.url()
        });
        break;
      }
      case "screenshot": {
        const outputPath = resolveOutputPath(options.runDir, step.path);
        await mkdir(dirname(outputPath), { recursive: true });
        await options.page.screenshot({ path: outputPath, fullPage: step.fullPage ?? true });
        latestScreenshotPath = outputPath;
        stepResults.push({
          index,
          type: step.type,
          status: "ok",
          detail: `Saved screenshot ${step.path}`,
          outputPath,
          url: options.page.url()
        });
        break;
      }
      case "extract": {
        const outputPath = resolveOutputPath(options.runDir, step.path);
        await mkdir(dirname(outputPath), { recursive: true });
        const extractedText = await options.page.locator("body").innerText();
        await writeFile(outputPath, extractedText, "utf8");
        latestExtractPath = outputPath;
        latestExtractedText = extractedText;
        stepResults.push({
          index,
          type: step.type,
          status: "ok",
          detail: `Saved extract ${step.path}`,
          outputPath,
          url: options.page.url()
        });
        break;
      }
      case "attachFile": {
        const locator = getTargetLocator(options.page, step.target);
        await locator.waitFor({ state: "attached", timeout: step.timeoutMs ?? options.timeoutMs });
        const paths = step.paths.map((value) => resolveScriptPath(baseDir, value));
        await locator.setInputFiles(paths, { timeout: step.timeoutMs ?? options.timeoutMs });
        stepResults.push({
          index,
          type: step.type,
          status: "ok",
          detail: `Attached ${paths.length} file(s)`,
          url: options.page.url()
        });
        break;
      }
      case "publish": {
        if (!options.allowLivePublish) {
          stepResults.push({
            index,
            type: step.type,
            status: "skipped",
            detail: `Skipped publish in dry-run mode for ${targetSummary(step.target)}`,
            url: options.page.url()
          });
          break;
        }

        const locator = getTargetLocator(options.page, step.target);
        await locator.waitFor({ state: "visible", timeout: step.timeoutMs ?? options.timeoutMs });
        await locator.click({ timeout: step.timeoutMs ?? options.timeoutMs });
        published = true;
        stepResults.push({
          index,
          type: step.type,
          status: "ok",
          detail: `Clicked publish target ${targetSummary(step.target)}`,
          url: options.page.url()
        });
        break;
      }
      default: {
        const exhaustive: never = step;
        throw new Error(`Unsupported step in ${scriptPath}: ${JSON.stringify(exhaustive)}`);
      }
    }
  }

  return {
    scriptName: script.name,
    stepResults,
    screenshotPath: latestScreenshotPath,
    extractPath: latestExtractPath,
    extractedText: latestExtractedText,
    published
  };
}
