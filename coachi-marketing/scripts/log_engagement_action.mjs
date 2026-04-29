#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  defaultLedger,
  duplicateStatus,
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
    ledger: DEFAULT_LEDGER_PATH,
    date: localDate(),
    platform: "",
    actionType: "",
    url: "",
    handle: "",
    topic: "",
    status: "prepared",
    notes: "",
    allowDuplicate: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === "--ledger") {
      options.ledger = requireValue(arg, next);
      index += 1;
    } else if (arg === "--date") {
      options.date = requireValue(arg, next);
      index += 1;
    } else if (arg === "--platform") {
      options.platform = requireValue(arg, next);
      index += 1;
    } else if (arg === "--action" || arg === "--action-type") {
      options.actionType = requireValue(arg, next);
      index += 1;
    } else if (arg === "--url") {
      options.url = requireValue(arg, next);
      index += 1;
    } else if (arg === "--handle") {
      options.handle = requireValue(arg, next);
      index += 1;
    } else if (arg === "--topic") {
      options.topic = requireValue(arg, next);
      index += 1;
    } else if (arg === "--status") {
      options.status = requireValue(arg, next);
      index += 1;
    } else if (arg === "--notes") {
      options.notes = requireValue(arg, next);
      index += 1;
    } else if (arg === "--allow-duplicate") {
      options.allowDuplicate = true;
    } else if (arg === "-h" || arg === "--help") {
      usage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.platform) throw new Error("--platform is required");
  if (!options.actionType) throw new Error("--action is required");
  if (!options.url && !options.handle && !options.topic) {
    throw new Error("At least one of --url, --handle, or --topic is required");
  }
  return options;
}

function requireValue(arg, value) {
  if (!value || value.startsWith("--")) throw new Error(`${arg} requires a value`);
  return value;
}

function usage() {
  console.log(`Usage:
  npm run growth:log-engagement -- --platform x --action reply --url https://x.com/... --status posted
  npm run growth:log-engagement -- --platform reddit --action reply --url https://www.reddit.com/... --topic "zone 2 too slow"

Appends an engagement action to the dedupe ledger. It refuses duplicates unless --allow-duplicate is passed.`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const ledger = await readOptionalJson(options.ledger, defaultLedger());
  const action = {
    date: options.date,
    at: new Date().toISOString(),
    platform: options.platform,
    action_type: options.actionType,
    url: options.url || null,
    handle: options.handle || null,
    topic: options.topic || null,
    status: options.status,
    notes: options.notes || null
  };

  const duplicate = duplicateStatus({
    platform: action.platform,
    actionType: action.action_type,
    targetUrl: action.url || "",
    handle: action.handle || "",
    topic: action.topic || ""
  }, ledger);
  if (duplicate.blocked && !options.allowDuplicate) {
    throw new Error(`Duplicate engagement blocked: ${duplicate.reason}. Pass --allow-duplicate only if this is intentional.`);
  }

  const nextLedger = {
    ...defaultLedger(),
    ...ledger,
    actions: [
      ...(Array.isArray(ledger.actions) ? ledger.actions : []),
      action
    ]
  };
  await writeJson(options.ledger, nextLedger);
  console.log(`Engagement action logged: ${options.platform} ${options.actionType}`);
}

main().catch((error) => {
  console.error(`log_engagement_action.mjs: ${error.message}`);
  process.exit(1);
});
