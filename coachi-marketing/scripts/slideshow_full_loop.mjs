#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

await import("dotenv").then(({ config }) => {
  config();
  config({ path: ".env.local" });
}).catch(() => {});

const ENGINE_DIR = "strategy/automation/tiktok-instagram-slideshow-content-engine";
const DEFAULT_ACTIVE_NICHES_PATH = `${ENGINE_DIR}/active-niches.json`;
const DEFAULT_PROBLEMS_PATH = "inputs/research/raw-runner-problems.json";
const DEFAULT_OUTPUT_ROOT = "outputs/full-loop";
const VALID_MODES = new Set(["dry-run", "production"]);
const VALID_QUEUES = new Set(["direct", "bullmq"]);
const TOP_FIVE_PROBLEM_TYPES = new Set([
  "easy-run pace drift",
  "zone-2 confusion",
  "heart-rate panic",
  "watch-checking anxiety",
  "pace disbelief",
  "workout-racing"
]);

function parseArgs(argv) {
  const args = new Map();
  const flags = new Set();

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      flags.add(arg);
    } else {
      args.set(arg, next);
      index += 1;
    }
  }

  return { args, flags };
}

function printHelp() {
  console.log(`Usage:
  node scripts/slideshow_full_loop.mjs --mode dry-run --count 1
  node scripts/slideshow_full_loop.mjs --mode production --count 1 --generate-openai-hook
  node scripts/slideshow_full_loop.mjs --mode production --count 1 --generate-openai-hook --live-schedule --schedule-platform tiktok
  node scripts/slideshow_full_loop.mjs --mode production --count 1 --generate-openai-hook --live-schedule --schedule-platform tiktok --publish-mode direct-public
  node scripts/slideshow_full_loop.mjs --mode production --count 1 --generate-openai-hook --live-schedule --schedule-platform tiktok --publish-mode direct-public --upload-public-media
  node scripts/slideshow_full_loop.mjs --mode dry-run --niche easy_run_zone2 --queue bullmq --account postiz_integration_id

Runs the Coachi slideshow loop end to end:
1. load active niches
2. filter sourced runner problems per niche and exclude already-rendered concepts
3. run the slideshow pipeline for fresh candidates
4. create one Images 2.0 hook prompt or generate the hook image when explicitly requested
5. materialize approved/Supabase library assets
6. render through Sharp + Canvas
7. optionally upload rendered media to Coachi marketing Supabase public storage
8. dry-run Postiz scheduling, or enqueue BullMQ jobs when --queue bullmq is used

Live scheduling requires --live-schedule plus POSTIZ_ENABLE_LIVE_POSTING=1, --publish-mode direct-public, and Postiz credentials.

Duplicate protection is on by default. Pass --allow-duplicate-topic only for intentional reruns.`);
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "slideshow";
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd || process.cwd(),
      env: {
        ...process.env,
        ...(options.env || {})
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

function runIdFor(date) {
  const time = new Date().toISOString().slice(11, 19).replaceAll(":", "");
  return `${date}-${time}`;
}

function activeNiches(config, nicheId) {
  const niches = Array.isArray(config.niches) ? config.niches : [];
  const filtered = niches.filter((niche) => niche.active !== false);
  if (!nicheId) return filtered;
  const selected = niches.find((niche) => niche.id === nicheId);
  assert(selected, `Unknown niche id: ${nicheId}`);
  assert(selected.active !== false, `Niche is disabled: ${nicheId}`);
  return [selected];
}

function scoreProblem(problem) {
  return Number.isFinite(problem.total_score)
    ? problem.total_score
    : [
        problem.score_frequency_1_5,
        problem.score_emotion_1_5,
        problem.score_product_fit_1_5,
        problem.score_content_clarity_1_5
      ].reduce((total, value) => total + (Number(value) || 0), 0);
}

function problemMatchesNiche(problem, niche) {
  const problemTypes = new Set(niche.problem_types || []);
  if (problemTypes.size > 0 && !problemTypes.has(problem.problem_type)) return false;
  if (scoreProblem(problem) < (niche.min_score || 12)) return false;
  const requiresSourcedMistakes = niche.require_sourced_mistakes_for_top5 !== false;
  if (requiresSourcedMistakes && TOP_FIVE_PROBLEM_TYPES.has(problem.problem_type)) {
    return Array.isArray(problem.sourced_mistakes) && problem.sourced_mistakes.length >= 5;
  }
  return true;
}

function scheduledAtFor(index, startIso, spacingHours) {
  const base = startIso ? new Date(startIso) : new Date(Date.now() + 4 * 60 * 60 * 1000);
  base.setHours(base.getHours() + index * spacingHours);
  return base.toISOString();
}

async function existingSlideshowIndex(packOutRoot) {
  const index = {
    problemIds: new Set(),
    hooks: new Set(),
    packs: []
  };

  if (!(await pathExists(packOutRoot))) return index;
  const entries = await fs.readdir(packOutRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const packDir = path.join(packOutRoot, entry.name);
    const manifestPath = path.join(packDir, "render-manifest.json");
    if (!(await pathExists(manifestPath))) continue;
    try {
      const manifest = await readJson(manifestPath);
      const sourceProblemId = manifest.source_problem_id || manifest.sourceProblemId || null;
      const hook = manifest.hook
        || manifest.hook_text
        || manifest.slideshow?.hook
        || manifest.slides?.find((slide) => slide.role === "hook")?.text
        || manifest.slides?.[0]?.text
        || null;
      if (sourceProblemId) index.problemIds.add(sourceProblemId);
      if (hook) index.hooks.add(slugify(hook));
      index.packs.push({
        pack_dir: path.relative(process.cwd(), packDir),
        source_problem_id: sourceProblemId,
        hook
      });
    } catch {
      // Ignore broken draft packs; QA/preflight handles invalid current packs.
    }
  }
  return index;
}

async function writeNicheProblemFile({ problemBank, niche, outPath, usedProblemIds, existingProblemIds, problemsPath }) {
  const problems = (problemBank.problems || [])
    .filter((problem) => !usedProblemIds.has(problem.id))
    .filter((problem) => !existingProblemIds.has(problem.id))
    .filter((problem) => problemMatchesNiche(problem, niche))
    .sort((left, right) => scoreProblem(right) - scoreProblem(left));

  await writeJson(outPath, {
    schema_version: problemBank.schema_version || 1,
    generated_at: new Date().toISOString(),
    source_problem_file: problemsPath,
    niche: {
      id: niche.id,
      label: niche.label,
      problem_types: niche.problem_types || [],
      min_score: niche.min_score || 12
    },
    problems
  });

  return problems.length;
}

async function runPipelineForNiche({ args, flags, mode, queueMode, runDir, packOutRoot, date, niche, index, scheduledAt, problemBank, usedProblemIds, existingIndex }) {
  const topicsOut = path.join(runDir, `${niche.id}-topics.json`);
  const problemsOut = path.join(runDir, `${niche.id}-problems.json`);
  const problemCount = await writeNicheProblemFile({
    problemBank,
    niche,
    outPath: problemsOut,
    usedProblemIds,
    existingProblemIds: flags.has("--allow-duplicate-topic") ? new Set() : existingIndex.problemIds,
    problemsPath: args.get("--problems-bank") || DEFAULT_PROBLEMS_PATH
  });

  if (problemCount === 0) {
    return {
      niche_id: niche.id,
      status: "skipped",
      reason: "no_new_matching_sourced_problems",
      existing_pack_count: existingIndex.packs.length
    };
  }

  const dryRunMode = mode === "dry-run";
  const generateOpenAiHook = flags.has("--generate-openai-hook");
  const liveSchedule = flags.has("--live-schedule");
  const schedulePlatform = args.get("--schedule-platform") || (liveSchedule ? "tiktok" : "all");
  const publishMode = args.get("--publish-mode") || (liveSchedule ? "direct-public" : "manual-review");
  assert(dryRunMode || generateOpenAiHook, "--mode production requires --generate-openai-hook.");
  assert(!liveSchedule || mode === "production", "--live-schedule requires --mode production.");
  assert(!liveSchedule || generateOpenAiHook, "--live-schedule requires --generate-openai-hook.");
  assert(["manual-review", "direct-public"].includes(publishMode), "--publish-mode must be manual-review or direct-public.");
  assert(!liveSchedule || publishMode === "direct-public", "--live-schedule requires --publish-mode direct-public.");

  const pipelineArgs = [
    "run",
    "slideshow:pipeline",
    "--",
    "--date",
    date,
    "--limit",
    String(Number(args.get("--limit") || 5)),
    "--candidate-index",
    String(Number(args.get("--candidate-index") || 0)),
    "--problems",
    problemsOut,
    "--min-score",
    String(niche.min_score || args.get("--min-score") || 12),
    "--topics-out",
    topicsOut,
    "--out-root",
    packOutRoot,
    "--scheduled-at",
    scheduledAt,
    "--schedule-platform",
    schedulePlatform,
    "--publish-mode",
    publishMode,
    ...(queueMode === "bullmq" || flags.has("--no-schedule") ? ["--no-schedule"] : []),
    ...(flags.has("--force") ? ["--force"] : []),
    ...(dryRunMode && !generateOpenAiHook ? ["--mock-hook", "--allow-needs-review", "--local-library"] : []),
    ...(generateOpenAiHook ? ["--generate-openai-hook"] : []),
    ...(liveSchedule ? ["--live-schedule"] : []),
    ...(flags.has("--upload-public-media") ? ["--upload-public-media"] : []),
    ...(flags.has("--with-supabase-metadata") ? ["--with-supabase-metadata"] : []),
    ...(mode === "production" ? ["--production", "--prefer-remote"] : [])
  ];

  await run("npm", pipelineArgs);

  const topics = await readJson(topicsOut);
  const candidateIndex = Number(args.get("--candidate-index") || 0);
  const candidate = topics.candidates[candidateIndex];
  assert(candidate, `${topicsOut}: candidate ${candidateIndex} was not generated.`);
  const duplicateHook = existingIndex.hooks.has(slugify(candidate.hook));
  assert(flags.has("--allow-duplicate-topic") || !duplicateHook, `Duplicate slideshow hook blocked: ${candidate.hook}. Pass --allow-duplicate-topic only if intentional.`);
  usedProblemIds.add(candidate.problem_id);
  const packDir = path.resolve(packOutRoot, `${date}-${slugify(candidate.hook)}`);
  const renderManifest = path.join(packDir, "render-manifest.json");

  if (queueMode === "bullmq") {
    const accountId = args.get("--account") || process.env.POSTIZ_TIKTOK_ACCOUNT_ID || "manual_tiktok_account";
    await run("npm", [
      "run",
      "slideshow:queue",
      "--",
      "--enqueue",
      renderManifest,
      "--account",
      accountId,
      "--scheduled-at",
      scheduledAt,
      "--publish-mode",
      args.get("--publish-mode") || (flags.has("--live-schedule") ? "direct-public" : "manual-review"),
      ...(generateOpenAiHook ? ["--generate-openai-hook"] : [])
    ]);
  }

  return {
    niche_id: niche.id,
    status: "created",
    scheduled_at: scheduledAt,
    queue_mode: queueMode,
    problem_count: problemCount,
    candidate: {
      problem_id: candidate.problem_id,
      problem_type: candidate.problem_type,
      schema: candidate.schema,
      hook: candidate.hook,
      source_url: candidate.source_url
    },
    topics: path.relative(process.cwd(), topicsOut),
    problems: path.relative(process.cwd(), problemsOut),
    pack_dir: path.relative(process.cwd(), packDir),
    render_manifest: path.relative(process.cwd(), renderManifest),
    schedule: path.relative(process.cwd(), path.join(packDir, "postiz-schedule.json"))
  };
}

async function main() {
  const { args, flags } = parseArgs(process.argv.slice(2));
  if (flags.has("--help") || flags.has("-h")) {
    printHelp();
    return;
  }

  const mode = args.get("--mode") || "dry-run";
  assert(VALID_MODES.has(mode), `--mode must be one of: ${[...VALID_MODES].join(", ")}.`);
  const queueMode = args.get("--queue") || "direct";
  assert(VALID_QUEUES.has(queueMode), `--queue must be one of: ${[...VALID_QUEUES].join(", ")}.`);

  const date = args.get("--date") || new Date().toISOString().slice(0, 10);
  const runId = args.get("--run-id") || runIdFor(date);
  const runDir = path.resolve(args.get("--run-dir") || path.join(DEFAULT_OUTPUT_ROOT, runId));
  const activeNichesPath = args.get("--active-niches") || DEFAULT_ACTIVE_NICHES_PATH;
  const problemsPath = args.get("--problems-bank") || DEFAULT_PROBLEMS_PATH;
  const config = await readJson(activeNichesPath);
  const problemBank = await readJson(problemsPath);
  const niches = activeNiches(config, args.get("--niche"));
  const count = Number(args.get("--count") || config.default_daily_deck_limit || 1);
  const spacingHours = Number(args.get("--spacing-hours") || config.default_spacing_hours || 4);
  const packOutRoot = path.resolve(args.get("--out-root") || (mode === "production"
    ? "content/slideshows"
    : path.join(runDir, "packs")));
  const scheduledStart = args.get("--scheduled-start") || args.get("--scheduled-at") || null;
  const usedProblemIds = new Set();
  const existingIndex = await existingSlideshowIndex(packOutRoot);
  const results = [];

  assert(niches.length > 0, `${activeNichesPath}: no active niches.`);
  await fs.mkdir(runDir, { recursive: true });

  for (const niche of niches) {
    if (results.filter((result) => result.status === "created").length >= count) break;
    const deckIndex = results.filter((result) => result.status === "created").length;
    const scheduledAt = scheduledAtFor(deckIndex, scheduledStart, spacingHours);
    results.push(await runPipelineForNiche({
      args,
      flags,
      mode,
      queueMode,
      runDir,
      packOutRoot,
      date,
      niche,
      index: deckIndex,
      scheduledAt,
      problemBank,
      usedProblemIds,
      existingIndex
    }));
  }

  const report = {
    ok: results.some((result) => result.status === "created"),
    generated_at: new Date().toISOString(),
    source_article: "https://x.com/alexcooldev/status/2047715075457507452",
    mode,
    queue_mode: queueMode,
    publish_mode: args.get("--publish-mode") || (flags.has("--live-schedule") ? "direct-public" : "manual-review"),
    live_posting_enabled: process.env.POSTIZ_ENABLE_LIVE_POSTING === "1",
    live_schedule_requested: flags.has("--live-schedule"),
    schedule_platform: args.get("--schedule-platform") || (flags.has("--live-schedule") ? "tiktok" : "all"),
    live_posting_note: "Postiz queue remains dry-run unless --live-schedule and POSTIZ_ENABLE_LIVE_POSTING=1 are present.",
    active_niches: path.relative(process.cwd(), activeNichesPath),
    problem_bank: path.relative(process.cwd(), problemsPath),
    run_dir: path.relative(process.cwd(), runDir),
    pack_out_root: path.relative(process.cwd(), packOutRoot),
    duplicate_guard: {
      enabled: !flags.has("--allow-duplicate-topic"),
      existing_pack_count: existingIndex.packs.length,
      existing_problem_count: existingIndex.problemIds.size,
      existing_hook_count: existingIndex.hooks.size
    },
    requested_count: count,
    created_count: results.filter((result) => result.status === "created").length,
    results
  };

  const reportPath = path.join(runDir, "full-loop-report.json");
  await writeJson(reportPath, report);
  console.log(JSON.stringify({
    ...report,
    report: path.relative(process.cwd(), reportPath)
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
