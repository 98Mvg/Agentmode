#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  buildCandidates,
  defaultLedger,
  readOptionalJson as readOptionalEngagementJson,
  writeJson as writeEngagementJson
} from "./engagement_candidate_engine.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const APP_SOCIAL_DIR = process.env.SOCIAL_SCRIPT_DIR
  || "/Users/mariusgaarder/Documents/treningscoach/scripts/social";

const REQUIRED_SOURCE_FILES = [
  "AGENTS.md",
  "scripts/daily_generation.md",
  "strategy/channels/14-day-social-engine.md",
  "strategy/automation/tiktok-instagram-slideshow-content-engine/README.md",
  "strategy/automation/tiktok-instagram-slideshow-content-engine/PIPELINE_READY_CHECKLIST.md",
  "inputs/performance/WINNER_LIBRARY.md",
  "inputs/performance/engagement-ledger.json",
  "inputs/research/reddit-winning-language-bank.md"
];

const PUBLIC_ACTION_GATE = [
  "TikTok/Instagram final Share/Post",
  "X final Post/Reply/Repost",
  "Reddit final Comment/Post",
  "public likes",
  "public follows"
];
const POSTED_SLIDESHOW_REGISTRY_PATH = path.join(ROOT, "inputs", "performance", "posted-slideshows.json");
const SCHEDULED_SLIDESHOW_REGISTRY_PATH = path.join(ROOT, "inputs", "performance", "scheduled-slideshows.json");
const ENGAGEMENT_LEDGER_PATH = path.join(ROOT, "inputs", "performance", "engagement-ledger.json");
const LOOP_STATE_PATH = path.join(ROOT, "outputs", "social-loop", "growth-loop-state.json");
const LOOP_DAILY_CAPS = {
  minimum: {
    contentHandoffs: 1,
    x: { posts: 3, likes: 5, follows: 3, replies: 1, reposts: 0 },
    tiktok: { posts: 1, likes: 5, follows: 3, comments: 3, largerVideoComment: 1 },
    instagram: { posts: 1, stories: "1-3", likes: 5, follows: 3, comments: 3 },
    reddit: { threadsReviewed: "2-3", replies: 2, newPosts: 0 }
  },
  stretch: {
    contentHandoffs: 2,
    x: { posts: 3, likes: 15, follows: 10, replies: 1, reposts: 1 },
    tiktok: { posts: 2, likes: 15, follows: 10, comments: 10, commentReplies: 5 },
    instagram: { posts: 1, stories: "3-6", likes: 15, follows: 10, comments: 10, commentReplies: 5 },
    reddit: { threadsReviewed: "4-6", replies: "2-4", newPosts: "0-1 only if subreddit fit is clean" }
  }
};
const LOOP_PER_RUN_BUDGET = {
  minimum: {
    x: { posts: "prepare only", likes: 1, follows: "0-1", replies: "0-1 if clearly relevant", reposts: 0 },
    tiktok: { posts: "prepare only", likes: "0-1", follows: "0-1", comments: "0-1 high-fit only" },
    instagram: { posts: "prepare only", stories: "prepare only", likes: "0-1", follows: "0-1", comments: "0-1 high-fit only" },
    reddit: { threadsReviewed: "1-2", replies: "0-1 useful only", newPosts: 0 }
  },
  stretch: {
    x: { posts: "prepare only", likes: "1-3", follows: "1-2", replies: "0-1", reposts: "0-1 only if strong" },
    tiktok: { posts: "prepare only", likes: "1-3", follows: "1-2", comments: "1-2 high-fit only" },
    instagram: { posts: "prepare only", stories: "prepare only", likes: "1-3", follows: "1-2", comments: "1-2 high-fit only" },
    reddit: { threadsReviewed: "1-2", replies: "0-1 useful only", newPosts: 0 }
  }
};

function parseArgs(argv) {
  const options = {
    date: localDate(),
    mode: "minimum",
    platform: "all",
    deck: "",
    execute: false,
    open: false,
    generateSlideshow: false,
    skipSlideshow: false,
    freshSlideshow: false,
    postedRegistry: POSTED_SLIDESHOW_REGISTRY_PATH,
    scheduledRegistry: SCHEDULED_SLIDESHOW_REGISTRY_PATH,
    engagementLedger: ENGAGEMENT_LEDGER_PATH,
    cadenceGuard: false,
    loopState: LOOP_STATE_PATH,
    dryRun: false,
    help: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    switch (arg) {
      case "--date":
        options.date = requireValue(arg, next);
        index += 1;
        break;
      case "--mode":
        options.mode = requireValue(arg, next);
        index += 1;
        break;
      case "--platform":
        options.platform = requireValue(arg, next);
        index += 1;
        break;
      case "--deck":
        options.deck = requireValue(arg, next);
        index += 1;
        break;
      case "--execute":
        options.execute = true;
        break;
      case "--open":
        options.open = true;
        break;
      case "--generate-slideshow":
        options.generateSlideshow = true;
        break;
      case "--skip-slideshow":
        options.skipSlideshow = true;
        break;
      case "--fresh-slideshow":
        options.freshSlideshow = true;
        break;
      case "--posted-registry":
        options.postedRegistry = requireValue(arg, next);
        index += 1;
        break;
      case "--scheduled-registry":
        options.scheduledRegistry = requireValue(arg, next);
        index += 1;
        break;
      case "--engagement-ledger":
        options.engagementLedger = requireValue(arg, next);
        index += 1;
        break;
      case "--cadence-guard":
        options.cadenceGuard = true;
        break;
      case "--loop-state":
        options.loopState = requireValue(arg, next);
        index += 1;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "-h":
      case "--help":
        options.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!["minimum", "stretch"].includes(options.mode)) {
    throw new Error("--mode must be minimum or stretch");
  }
  if (!["all", "x", "instagram", "tiktok", "reddit"].includes(options.platform)) {
    throw new Error("--platform must be one of all|x|instagram|tiktok|reddit");
  }
  if (options.generateSlideshow && options.skipSlideshow) {
    throw new Error("--generate-slideshow and --skip-slideshow cannot be combined");
  }

  return options;
}

function requireValue(arg, value) {
  if (!value || value.startsWith("--")) {
    throw new Error(`${arg} requires a value`);
  }
  return value;
}

function localDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function usage() {
  console.log(`Usage:
  npm run growth:daily -- --date YYYY-MM-DD --mode minimum --dry-run
  npm run growth:daily -- --date YYYY-MM-DD --mode minimum --execute
  npm run growth:daily -- --date YYYY-MM-DD --mode stretch --execute --open
  npm run growth:daily -- --date YYYY-MM-DD --mode minimum --execute --cadence-guard
  npm run growth:daily -- --date YYYY-MM-DD --fresh-slideshow --dry-run
  npm run growth:daily -- --date YYYY-MM-DD --posted-registry /tmp/posted-slideshows.json --dry-run
  npm run growth:daily -- --date YYYY-MM-DD --engagement-ledger /tmp/engagement-ledger.json --dry-run

One source-of-truth command for Coachi daily growth.

What it does:
1. validates the marketing source hierarchy
2. selects the latest ready TikTok/Instagram slideshow deck unless --deck is provided
   (posted decks are excluded; --fresh-slideshow requires an unposted deck)
3. writes the daily growth plan and machine-readable manifest
4. builds the daily social state via the app social coordinator
5. with --execute, runs safe local prep and the slideshow/social handoff

Public account actions still require final visible review and action-time approval.`);
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function readOptionalJson(filePath, fallback) {
  try {
    return await readJson(filePath);
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function writeText(filePath, text) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, text, "utf8");
}

async function writeEngagementCandidatesArtifact({ options, deckSummary }) {
  const ledger = await readOptionalEngagementJson(options.engagementLedger, defaultLedger());
  const candidatePath = path.join(ROOT, "outputs", "daily", `${options.date}-engagement-candidates.json`);
  const candidateQueue = buildCandidates({
    date: options.date,
    mode: options.mode,
    platform: options.platform,
    selectedDeck: deckSummary,
    ledger
  });
  await writeEngagementJson(candidatePath, candidateQueue);
  return {
    path: candidatePath,
    count: candidateQueue.candidates.length,
    duplicateSuppressedCount: candidateQueue.suppressedDuplicates.length,
    nextByPlatform: Object.fromEntries(
      Object.entries(candidateQueue.nextByPlatform).map(([platform, candidates]) => [
        platform,
        candidates.map((candidate) => ({
          id: candidate.id,
          actionType: candidate.actionType,
          targetUrl: candidate.targetUrl,
          score: candidate.score
        }))
      ])
    )
  };
}

async function validateSources() {
  const checks = [];
  for (const relativePath of REQUIRED_SOURCE_FILES) {
    const absolutePath = path.join(ROOT, relativePath);
    checks.push({
      path: absolutePath,
      exists: await exists(absolutePath)
    });
  }
  return checks;
}

async function postedSlideshowIds(registryPath) {
  const registry = await readOptionalJson(registryPath, { posts: [] });
  return new Set((registry.posts || []).map((post) => post.slideshow_id).filter(Boolean));
}

async function scheduledSlideshowIds(registryPath) {
  const registry = await readOptionalJson(registryPath, { posts: [] });
  return new Set((registry.posts || []).map((post) => post.slideshow_id).filter(Boolean));
}

function preparedSlideshowIds(loopState) {
  const ids = new Set();
  for (const day of Object.values(loopState?.days || {})) {
    for (const handoff of day.contentHandoffs || []) {
      if (handoff.slideshow_id) ids.add(handoff.slideshow_id);
    }
  }
  return ids;
}

async function readLoopState(loopStatePath) {
  return readOptionalJson(loopStatePath, { version: 1, days: {} });
}

function buildCadenceDecision(options, loopState) {
  if (!options.cadenceGuard) {
    return {
      enabled: false,
      shouldPrepareContent: true,
      reason: "Cadence guard is disabled."
    };
  }

  const dayState = loopState.days?.[options.date] || {};
  const contentHandoffsToday = dayState.contentHandoffs || [];
  const dailyCaps = LOOP_DAILY_CAPS[options.mode];
  const contentHandoffLimit = dailyCaps.contentHandoffs;
  const shouldPrepareContent = contentHandoffsToday.length < contentHandoffLimit;

  return {
    enabled: true,
    loopStatePath: options.loopState,
    dailyCaps,
    perRunBudget: LOOP_PER_RUN_BUDGET[options.mode],
    contentHandoffLimit,
    contentHandoffsToday: contentHandoffsToday.length,
    shouldPrepareContent,
    reason: shouldPrepareContent
      ? "Content handoff is still inside the daily cap."
      : `Content handoff cap reached for ${options.date}; this 4-hour run becomes engagement/research prep only.`
  };
}

async function recordLoopRun({ options, loopState, deckSummary, cadenceDecision, executed, artifacts }) {
  if (!options.cadenceGuard || !options.execute || options.dryRun) return;

  const nextState = {
    version: loopState.version || 1,
    days: {
      ...(loopState.days || {})
    }
  };
  const dayState = {
    runs: [],
    contentHandoffs: [],
    ...(nextState.days[options.date] || {})
  };

  const ranSlideshowHandoff = executed.some((item) => item.id === "slideshow_social_handoff" && item.status === "completed");
  const runRecord = {
    at: new Date().toISOString(),
    mode: options.mode,
    platform: options.platform,
    selected_deck: deckSummary?.slug || null,
    slideshow_handoff: ranSlideshowHandoff,
    artifacts
  };
  dayState.runs = [...(dayState.runs || []), runRecord];

  if (ranSlideshowHandoff && deckSummary) {
    dayState.contentHandoffs = [
      ...(dayState.contentHandoffs || []),
      {
        at: runRecord.at,
        slideshow_id: deckSummary.slug,
        deck_dir: deckSummary.deckDir,
        reason: cadenceDecision.reason
      }
    ];
  }

  nextState.days[options.date] = dayState;
  await writeJson(options.loopState, nextState);
}

async function findLatestReadyDeck({ excludePosted = true, postedRegistryPath = POSTED_SLIDESHOW_REGISTRY_PATH, scheduledRegistryPath = SCHEDULED_SLIDESHOW_REGISTRY_PATH, excludeDeckIds = new Set() } = {}) {
  const slideshowsDir = path.join(ROOT, "content", "slideshows");
  if (!(await exists(slideshowsDir))) return null;
  const postedIds = excludePosted ? await postedSlideshowIds(postedRegistryPath) : new Set();
  const scheduledIds = excludePosted ? await scheduledSlideshowIds(scheduledRegistryPath) : new Set();

  const entries = await fs.readdir(slideshowsDir, { withFileTypes: true });
  const candidates = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (postedIds.has(entry.name)) continue;
    if (scheduledIds.has(entry.name)) continue;
    if (excludeDeckIds.has(entry.name)) continue;
    const deckDir = path.join(slideshowsDir, entry.name);
    const manifestPath = path.join(deckDir, "render-manifest.json");
    const tiktokCaptionPath = path.join(deckDir, "copy", "tiktok-caption.txt");
    const instagramCaptionPath = path.join(deckDir, "copy", "instagram-caption.txt");
    const hashtagsPath = path.join(deckDir, "copy", "hashtags.txt");
    const renderedDir = path.join(deckDir, "slides", "rendered");
    if (!(await exists(manifestPath))) continue;
    if (!(await exists(tiktokCaptionPath))) continue;
    if (!(await exists(instagramCaptionPath))) continue;
    if (!(await exists(hashtagsPath))) continue;
    if (!(await exists(renderedDir))) continue;

    const renderedSlides = (await fs.readdir(renderedDir))
      .filter((file) => file.endsWith(".png"))
      .sort();
    if (renderedSlides.length < 5 || renderedSlides.length > 10) continue;

    const stat = await fs.stat(manifestPath);
    candidates.push({
      slug: entry.name,
      deckDir,
      manifestPath,
      renderedSlides: renderedSlides.length,
      updatedAt: stat.mtime.toISOString(),
      updatedAtMs: stat.mtimeMs
    });
  }

  candidates.sort((a, b) => b.updatedAtMs - a.updatedAtMs || b.slug.localeCompare(a.slug));
  return candidates[0] || null;
}

async function summarizeDeck(deckDir) {
  if (!deckDir) return null;
  const absoluteDeck = path.resolve(deckDir);
  const manifestPath = path.join(absoluteDeck, "render-manifest.json");
  const manifest = await readJson(manifestPath);
  const tiktokCaptionPath = path.join(absoluteDeck, "copy", "tiktok-caption.txt");
  const instagramCaptionPath = path.join(absoluteDeck, "copy", "instagram-caption.txt");
  const hashtagsPath = path.join(absoluteDeck, "copy", "hashtags.txt");
  const renderedDir = path.join(absoluteDeck, "slides", "rendered");
  const renderedSlides = (await fs.readdir(renderedDir)).filter((file) => file.endsWith(".png")).sort();

  return {
    slug: path.basename(absoluteDeck),
    deckDir: absoluteDeck,
    manifestPath,
    slideCount: renderedSlides.length,
    firstSlide: renderedSlides[0] ? path.join(renderedDir, renderedSlides[0]) : null,
    tiktokCaptionPath,
    instagramCaptionPath,
    hashtagsPath,
    carouselPackPath: path.join(absoluteDeck, "post-ready"),
    videoFallbackPath: path.join(absoluteDeck, "exports", `${path.basename(absoluteDeck)}-tiktok-instagram.mp4`),
    sourceProblemId: manifest.source_problem_id || null,
    sourceUrl: manifest.source_url || null,
    hybridCostModel: manifest.hybrid_cost_model || null
  };
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd || ROOT,
      env: {
        ...process.env,
        MARKETING_HOME: ROOT,
        SOCIAL_SCRIPT_DIR: APP_SOCIAL_DIR
      },
      stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit"
    });
    let stdout = "";
    let stderr = "";
    if (options.capture) {
      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });
    }
    child.on("exit", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}${stderr ? `\n${stderr}` : ""}`));
      }
    });
  });
}

function buildCommands(options, deckSummary, cadenceDecision) {
  const commands = [];
  commands.push({
    id: "validate_slideshow_engine",
    command: "npm",
    args: ["run", "slideshow:validate"],
    safeToExecute: true
  });

  if (options.generateSlideshow) {
    commands.push({
      id: "generate_slideshow_pipeline",
      command: "npm",
      args: ["run", "slideshow:pipeline", "--", "--date", options.date, "--candidate-index", "0"],
      safeToExecute: true,
      note: "Requires a real Images 2.0 hook image unless the operator intentionally adds --mock-hook for local testing."
    });
  }

  if (!options.skipSlideshow && deckSummary && cadenceDecision.shouldPrepareContent !== false) {
    commands.push({
      id: "slideshow_social_handoff",
      command: "scripts/slideshow_social_loop_4h.sh",
      args: [
        "run-now",
        "--deck",
        deckSummary.deckDir,
        "--mode",
        options.mode,
        "--platform",
        options.platform,
        ...(options.open ? [] : ["--no-open"])
      ],
      safeToExecute: true,
      note: "Prepares TikTok/Instagram slideshow assets and writes an engagement plan. It does not click public final actions."
    });
  }

  commands.push({
    id: "daily_social_state",
    command: path.join(APP_SOCIAL_DIR, "social-coordinator.sh"),
    args: [
      "--date",
      options.date,
      "--mode",
      options.mode,
      "--platform",
      options.platform
    ],
    safeToExecute: true
  });

  return commands;
}

function buildTargets(mode, cadenceDecision = { enabled: false }) {
  if (cadenceDecision.enabled) {
    return {
      cadence: "4h_guarded",
      dailyCaps: cadenceDecision.dailyCaps,
      thisRunBudget: cadenceDecision.perRunBudget,
      note: "This is a per-run prep budget. Public actions remain gated and daily caps should be checked before any live action."
    };
  }

  if (mode === "stretch") {
    return {
      x: { posts: 3, likes: 15, follows: 10, replies: 1, reposts: 1 },
      tiktok: { posts: 1, likes: 15, follows: 10, comments: 10, commentReplies: 5 },
      instagram: { posts: 1, stories: "3-6", likes: 15, follows: 10, comments: 10, commentReplies: 5 },
      reddit: { threadsReviewed: "4-6", replies: "2-4", newPosts: "0-1 only if subreddit fit is clean" }
    };
  }

  return {
    x: { posts: 3, likes: 5, follows: 3, replies: 1, reposts: 0 },
    tiktok: { posts: 1, likes: 5, follows: 3, comments: 3, largerVideoComment: 1 },
    instagram: { posts: 1, stories: "1-3", likes: 5, follows: 3, comments: 3 },
    reddit: { threadsReviewed: "2-3", replies: 2, newPosts: "0 unless subreddit fit is clean" }
  };
}

function formatCommand(command) {
  return [command.command, ...command.args.map((arg) => arg.includes(" ") ? `"${arg}"` : arg)].join(" ");
}

async function writeRunArtifacts({ options, sourceChecks, deckSummary, commands, executed, cadenceDecision, engagementCandidates }) {
  const generatedAt = new Date().toISOString();
  const runId = `${options.date}-growth-command`;
  const manifestPath = path.join(ROOT, "outputs", "daily", `${runId}.json`);
  const notePath = path.join(ROOT, "outputs", "daily", `${runId}.md`);
  const missingSources = sourceChecks.filter((check) => !check.exists);

  const manifest = {
    date: options.date,
    generatedAt,
    mode: options.mode,
    platform: options.platform,
    marketingHome: ROOT,
    sourceOfTruth: {
      primary: path.join(ROOT, "AGENTS.md"),
      executionPlaybook: path.join(ROOT, "scripts", "daily_generation.md"),
      slideshowEngine: path.join(ROOT, "strategy", "automation", "tiktok-instagram-slideshow-content-engine", "README.md"),
      sourceChecks,
      missingSources
    },
    selectedDeck: deckSummary,
    targets: buildTargets(options.mode, cadenceDecision),
    engagementCandidates,
    cadenceGuard: cadenceDecision,
    publicActionGate: {
      enabled: true,
      gatedActions: PUBLIC_ACTION_GATE,
      reason: "These are public third-party account actions and need visible target review/action-time approval."
    },
    stages: [
      {
        id: "source_check",
        status: missingSources.length ? "blocked" : "ready"
      },
      {
        id: "slideshow",
        status: options.skipSlideshow
          ? "skipped"
          : (cadenceDecision.shouldPrepareContent === false
            ? "skipped_by_4h_cadence_cap"
            : (deckSummary ? "ready" : (options.freshSlideshow ? "needs_fresh_deck" : "blocked"))),
        deck: deckSummary?.deckDir || null
      },
      {
        id: "engagement_plan",
        status: "ready",
        socialCoordinator: path.join(APP_SOCIAL_DIR, "social-coordinator.sh"),
        candidateQueue: engagementCandidates?.path || null
      },
      {
        id: "browser_handoff",
        status: options.open ? "ready_to_open" : "prepared_no_open"
      }
    ],
    commands: commands.map((command) => ({
      ...command,
      printable: formatCommand(command)
    })),
    postedSlideshowRegistry: options.postedRegistry,
    scheduledSlideshowRegistry: options.scheduledRegistry,
    executed
  };

  const markdown = `# Coachi Daily Growth Command - ${options.date}

## One Source Of Truth
- Primary rules: \`${path.join(ROOT, "AGENTS.md")}\`
- Daily playbook: \`${path.join(ROOT, "scripts", "daily_generation.md")}\`
- TikTok/Instagram slideshow engine: \`${path.join(ROOT, "strategy", "automation", "tiktok-instagram-slideshow-content-engine", "README.md")}\`
- Channel calendar: \`${path.join(ROOT, "strategy", "channels", "14-day-social-engine.md")}\`

## Selected Slideshow Deck
${deckSummary ? `- Deck: \`${deckSummary.deckDir}\`
- Slides: \`${deckSummary.slideCount}\`
- TikTok caption: \`${deckSummary.tiktokCaptionPath}\`
- Instagram caption: \`${deckSummary.instagramCaptionPath}\`
- Hashtags: \`${deckSummary.hashtagsPath}\`
- Carousel source slides: \`${path.join(deckSummary.deckDir, "slides", "rendered")}\`
- Manual carousel handoff root: \`${deckSummary.carouselPackPath}\`
- MP4 fallback target: \`${deckSummary.videoFallbackPath}\`` : "- No ready slideshow deck selected."}
- Posted registry: \`${options.postedRegistry}\`
- Scheduled registry: \`${options.scheduledRegistry}\`
- Fresh slideshow mode: \`${options.freshSlideshow ? "on" : "off"}\`

## Engagement Candidate Queue
- Queue: \`${engagementCandidates?.path || "not written"}\`
- Ranked candidates: \`${engagementCandidates?.count ?? 0}\`
- Duplicate candidates suppressed: \`${engagementCandidates?.duplicateSuppressedCount ?? 0}\`
- Ledger: \`${options.engagementLedger}\`
- Final public actions: \`manual/action-time approval required\`

## Daily Targets (${options.mode})
\`\`\`json
${JSON.stringify(buildTargets(options.mode, cadenceDecision), null, 2)}
\`\`\`

## 4-Hour Cadence Guard
- Enabled: \`${cadenceDecision.enabled ? "yes" : "no"}\`
- State file: \`${cadenceDecision.loopStatePath || "not used"}\`
- Content handoff this run: \`${cadenceDecision.shouldPrepareContent === false ? "no" : "yes"}\`
- Reason: ${cadenceDecision.reason}

## Command Stages
${commands.map((command) => `- \`${command.id}\`: \`${formatCommand(command)}\``).join("\n")}

## Public Action Gate
Automation can prepare assets, captions, plans, browser surfaces, and logs.
It does not click final public account actions:
${PUBLIC_ACTION_GATE.map((action) => `- ${action}`).join("\n")}

## Execution Status
${executed.length ? executed.map((item) => `- \`${item.id}\`: ${item.status}`).join("\n") : "- Dry run only. No commands executed."}

## Recommended Run Command
\`\`\`bash
npm run growth:daily -- --date ${options.date} --mode ${options.mode} --execute --open
\`\`\`
`;

  await writeJson(manifestPath, manifest);
  await writeText(notePath, markdown);
  return { manifestPath, notePath, manifest };
}

async function executeCommands(commands, options) {
  if (!options.execute || options.dryRun) return [];
  const executed = [];
  for (const command of commands) {
    const shouldRun = command.id !== "generate_slideshow_pipeline" || options.generateSlideshow;
    if (!shouldRun) continue;
    await run(command.command, command.args, {
      cwd: ROOT,
      capture: command.id === "daily_social_state"
    });
    executed.push({
      id: command.id,
      status: "completed",
      command: formatCommand(command)
    });
  }
  return executed;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    usage();
    return 0;
  }

  const sourceChecks = await validateSources();
  const missingSources = sourceChecks.filter((check) => !check.exists);
  if (missingSources.length) {
    throw new Error(`Missing required source files:\n${missingSources.map((check) => `- ${check.path}`).join("\n")}`);
  }

  const loopState = await readLoopState(options.loopState);
  const cadenceDecision = buildCadenceDecision(options, loopState);
  const excludeDeckIds = options.cadenceGuard ? preparedSlideshowIds(loopState) : new Set();
  const effectiveSkipSlideshow = options.skipSlideshow || cadenceDecision.shouldPrepareContent === false;
  const deckCandidate = effectiveSkipSlideshow ? null : (options.deck ? { deckDir: options.deck } : await findLatestReadyDeck({
    excludePosted: true,
    postedRegistryPath: options.postedRegistry,
    scheduledRegistryPath: options.scheduledRegistry,
    excludeDeckIds
  }));
  const deckSummary = effectiveSkipSlideshow ? null : await summarizeDeck(deckCandidate?.deckDir || "");
  if (!effectiveSkipSlideshow && !deckSummary) {
    const hint = options.freshSlideshow
      ? "No unposted ready slideshow deck found. Generate a fresh deck and add the Images 2.0 hook before running the handoff."
      : "No ready unposted slideshow deck found. Use --skip-slideshow or generate a deck first.";
    throw new Error(hint);
  }

  const commands = buildCommands(options, deckSummary, cadenceDecision);
  const engagementCandidates = await writeEngagementCandidatesArtifact({ options, deckSummary });
  const executed = await executeCommands(commands, options);
  const { manifestPath, notePath } = await writeRunArtifacts({
    options,
    sourceChecks,
    deckSummary,
    commands,
    executed,
    cadenceDecision,
    engagementCandidates
  });
  await recordLoopRun({
    options,
    loopState,
    deckSummary,
    cadenceDecision,
    executed,
    artifacts: { manifestPath, notePath, engagementCandidatesPath: engagementCandidates.path }
  });

  console.log(`Growth command plan written: ${notePath}`);
  console.log(`Growth command manifest written: ${manifestPath}`);
  console.log(`Engagement candidates written: ${engagementCandidates.path}`);
  if (deckSummary) {
    console.log(`Selected deck: ${deckSummary.deckDir}`);
  }
  if (!options.execute || options.dryRun) {
    console.log("Dry run complete. Add --execute to run safe local prep.");
  }
  return 0;
}

main().catch((error) => {
  console.error(`coachi_growth_daily.mjs: ${error.message}`);
  process.exit(1);
});
