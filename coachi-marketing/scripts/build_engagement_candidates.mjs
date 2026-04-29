#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildCandidates,
  defaultLedger,
  readOptionalJson,
  writeJson
} from "./engagement_candidate_engine.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DEFAULT_LEDGER_PATH = path.join(ROOT, "inputs", "performance", "engagement-ledger.json");

function localDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseArgs(argv) {
  const options = {
    date: localDate(),
    mode: "minimum",
    platform: "all",
    ledger: DEFAULT_LEDGER_PATH,
    out: "",
    selectedDeck: ""
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === "--date") {
      options.date = requireValue(arg, next);
      index += 1;
    } else if (arg === "--mode") {
      options.mode = requireValue(arg, next);
      index += 1;
    } else if (arg === "--platform") {
      options.platform = requireValue(arg, next);
      index += 1;
    } else if (arg === "--ledger") {
      options.ledger = requireValue(arg, next);
      index += 1;
    } else if (arg === "--out") {
      options.out = requireValue(arg, next);
      index += 1;
    } else if (arg === "--selected-deck") {
      options.selectedDeck = requireValue(arg, next);
      index += 1;
    } else if (arg === "-h" || arg === "--help") {
      usage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!["minimum", "stretch"].includes(options.mode)) {
    throw new Error("--mode must be minimum or stretch");
  }
  if (!["all", "x", "reddit", "instagram", "tiktok"].includes(options.platform)) {
    throw new Error("--platform must be one of all|x|reddit|instagram|tiktok");
  }
  if (!options.out) {
    options.out = path.join(ROOT, "outputs", "daily", `${options.date}-engagement-candidates.json`);
  }
  return options;
}

function requireValue(arg, value) {
  if (!value || value.startsWith("--")) throw new Error(`${arg} requires a value`);
  return value;
}

function usage() {
  console.log(`Usage:
  npm run growth:engagement-candidates -- --date YYYY-MM-DD --mode minimum --platform all
  npm run growth:engagement-candidates -- --date YYYY-MM-DD --ledger /tmp/ledger.json --out /tmp/candidates.json

Builds a ranked, deduped engagement target queue for X, Reddit, TikTok, and Instagram.
It does not execute public social actions.`);
}

async function selectedDeckSummary(deckDir) {
  if (!deckDir) return null;
  const manifest = await readOptionalJson(path.join(deckDir, "render-manifest.json"), {});
  return {
    slug: path.basename(deckDir),
    sourceProblemId: manifest.source_problem_id || null,
    sourceUrl: manifest.source_url || null
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const ledger = await readOptionalJson(options.ledger, defaultLedger());
  const selectedDeck = await selectedDeckSummary(options.selectedDeck);
  const candidates = buildCandidates({
    date: options.date,
    mode: options.mode,
    platform: options.platform,
    selectedDeck,
    ledger
  });

  await writeJson(options.out, candidates);
  console.log(`Engagement candidate queue written: ${options.out}`);
  console.log(`Candidates: ${candidates.candidates.length}; blocked duplicates: ${candidates.suppressedDuplicates.length}`);
}

main().catch((error) => {
  console.error(`build_engagement_candidates.mjs: ${error.message}`);
  process.exit(1);
});
