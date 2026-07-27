#!/usr/bin/env node

import { loadPublicationWorkflowSnapshot } from "./slideshow_publication_workflow.mjs";

function parseArgs(argv) {
  const args = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const next = argv[index + 1];
    if (next && !next.startsWith("--")) {
      args.set(arg, next);
      index += 1;
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const accounts = (args.get("--account") || "main,watch,marathon")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const snapshots = [];
for (const accountProfile of accounts) {
  snapshots.push(await loadPublicationWorkflowSnapshot({
    accountProfile,
    now: args.get("--now") || new Date(),
    lookbackDays: Number(args.get("--lookback-days") || 14),
    inboxExpiryHours: Number(args.get("--inbox-expiry-hours") || 72),
    maxWip: Number(args.get("--max-wip") || 6),
  }));
}

console.log(JSON.stringify({
  ok: true,
  generated_at: new Date().toISOString(),
  accounts: snapshots,
}, null, 2));
