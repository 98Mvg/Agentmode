#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DEFAULT_LEDGER_PATH = path.join(ROOT, "inputs", "performance", "engagement-ledger.json");
const APP_STORE_TOKEN_MAX_LENGTH = 30;
const POSTED_STATUSES = new Set(["posted", "completed", "success", "already_visible"]);

function parseArgs(argv) {
  const args = new Map();
  const flags = new Set();
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) throw new Error(`Unknown argument: ${arg}`);
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

function usage() {
  console.log(`Usage:
  node scripts/preflight_approval_queue.mjs --input outputs/daily/queue.md
  node scripts/preflight_approval_queue.mjs --input outputs/daily/queue.md --expect-actions 10 --out outputs/daily/queue-preflight.json

Checks approval queues before public posting:
- action count, when --expect-actions is provided
- duplicate Reddit thread targets against inputs/performance/engagement-ledger.json
- duplicate target URLs within the queue
- Coachi /app-store and /ios campaign/source tokens that production would sanitize or truncate`);
}

export function trackingToken(raw, { fallback = "website", maxLength = APP_STORE_TOKEN_MAX_LENGTH } = {}) {
  let value = String(raw || "").trim();
  if (!value) value = fallback;
  value = value.replace(/\s+/g, "_").replace(/[^A-Za-z0-9_.-]/g, "");
  return (value || fallback).slice(0, maxLength);
}

function unique(items) {
  return [...new Set(items)];
}

export function actionHeadings(markdown) {
  return markdown.match(/^###\s+\d+\./gm) ?? [];
}

export function queueSection(markdown) {
  const start = markdown.search(/^## Queue\s*$/m);
  if (start === -1) return markdown;
  const rest = markdown.slice(start);
  const next = rest.slice(rest.indexOf("\n") + 1).search(/^##\s+/m);
  if (next === -1) return rest;
  return rest.slice(0, rest.indexOf("\n") + 1 + next);
}

export function targetUrls(markdown) {
  const matches = markdown.match(/(?:Target:\s*)?`?https?:\/\/[^`\s<>)]+`?/g) ?? [];
  return unique(
    matches
      .map((raw) => raw.replace(/^Target:\s*/i, "").replace(/^`|`$/g, "").replace(/[.,;:]+$/g, ""))
      .map((raw) => raw.replace(/^["'`]+|["'`]+$/g, ""))
      .filter((url) => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      })
  );
}

export function coachiCampaignLinks(markdown) {
  return targetUrls(markdown).filter((url) => {
    const parsed = new URL(url);
    return parsed.hostname === "coachi.no" && ["/app-store", "/ios"].includes(parsed.pathname);
  });
}

export function redditThreadKey(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^old\./, "").replace(/^www\./, "");
  if (host !== "reddit.com") return null;
  const match = parsed.pathname.match(/\/r\/([^/]+)\/comments\/([^/]+)/i);
  if (!match) return null;
  return `reddit:${match[1].toLowerCase()}:${match[2].toLowerCase()}`;
}

function isPostedStatus(status) {
  const normalized = String(status || "").trim().toLowerCase();
  return POSTED_STATUSES.has(normalized);
}

export function ledgerRedditThreadMap(ledger) {
  const map = new Map();
  const actions = Array.isArray(ledger?.actions) ? ledger.actions : [];
  for (const action of actions) {
    if (String(action.platform || "").toLowerCase() !== "reddit") continue;
    if (!isPostedStatus(action.status)) continue;
    const key = redditThreadKey(action.target_url || action.url || "");
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(action);
  }
  return map;
}

export function preflightApprovalQueue(markdown, ledger, { input = "", expectActions = null } = {}) {
  const warnings = [];
  const errors = [];
  const headings = actionHeadings(markdown);
  const queueMarkdown = queueSection(markdown);
  const urls = targetUrls(queueMarkdown);
  const campaignLinks = coachiCampaignLinks(markdown);

  if (expectActions !== null && headings.length !== expectActions) {
    errors.push(`expected ${expectActions} queue actions, found ${headings.length}`);
  }

  const seenUrls = new Map();
  for (const url of urls) {
    const normalized = url.replace(/\/+$/, "");
    if (seenUrls.has(normalized)) {
      warnings.push(`duplicate URL inside queue: ${url}`);
    }
    seenUrls.set(normalized, true);
  }

  const ledgerThreads = ledgerRedditThreadMap(ledger);
  for (const url of urls) {
    const key = redditThreadKey(url);
    if (!key || !ledgerThreads.has(key)) continue;
    const matches = ledgerThreads.get(key);
    const examples = matches
      .slice(0, 3)
      .map((action) => `${action.date || "unknown-date"} ${action.url || action.target_url || ""}`)
      .join("; ");
    errors.push(`Reddit target already has posted ledger action: ${url} (${examples})`);
  }

  for (const url of campaignLinks) {
    const parsed = new URL(url);
    for (const key of ["source", "campaign", "ct"]) {
      const raw = parsed.searchParams.get(key);
      if (!raw) continue;
      const normalized = trackingToken(raw, {
        fallback: key === "source" ? "direct" : "website",
        maxLength: APP_STORE_TOKEN_MAX_LENGTH,
      });
      if (normalized !== raw) {
        errors.push(`${key} token would be rewritten by production: ${raw} -> ${normalized} in ${url}`);
      }
    }
  }

  return {
    input,
    ok: errors.length === 0,
    action_count: headings.length,
    url_count: urls.length,
    campaign_link_count: campaignLinks.length,
    errors,
    warnings,
  };
}

async function readJson(pathname) {
  return JSON.parse(await fs.readFile(pathname, "utf8"));
}

async function main() {
  const { args, flags } = parseArgs(process.argv.slice(2));
  if (flags.has("--help") || !args.has("--input")) {
    usage();
    return flags.has("--help") ? 0 : 1;
  }

  const input = args.get("--input");
  const ledgerPath = args.get("--ledger") || DEFAULT_LEDGER_PATH;
  const outPath = args.get("--out");
  const expectActions = args.has("--expect-actions") ? Number(args.get("--expect-actions")) : null;
  if (expectActions !== null && !Number.isInteger(expectActions)) {
    throw new Error("--expect-actions must be an integer");
  }

  const [markdown, ledger] = await Promise.all([
    fs.readFile(input, "utf8"),
    readJson(ledgerPath),
  ]);
  const result = preflightApprovalQueue(markdown, ledger, { input, expectActions });
  const summary = {
    ...result,
    checked_at: new Date().toISOString(),
    ledger: ledgerPath,
  };

  if (outPath) {
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  }

  console.log(`Preflight ${summary.ok ? "passed" : "failed"} for ${input}`);
  console.log(`Actions: ${summary.action_count}; URLs: ${summary.url_count}; Coachi campaign links: ${summary.campaign_link_count}`);
  for (const warning of summary.warnings) console.log(`WARN ${warning}`);
  for (const error of summary.errors) console.log(`FAIL ${error}`);
  return summary.ok ? 0 : 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(`preflight_approval_queue.mjs: ${error.message}`);
      process.exitCode = 1;
    });
}
