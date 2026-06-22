#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_QUEUE = "outputs/daily/2026-06-22-appstore-high-intent-approval-queue-v2.md";
const DEFAULT_X_PACK = "content/x-posts/2026-06-22-appstore-builder-daily-pack.md";
const DEFAULT_PREFLIGHT_OUT = "outputs/daily/2026-06-22-appstore-high-intent-v2-preflight.json";
const DEFAULT_LINK_OUT = "outputs/daily/2026-06-22-appstore-high-intent-v2-link-verification.json";
const DEFAULT_REPORT_OUT = "outputs/daily/2026-06-22-appstore-campaign-readiness.json";

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
  node scripts/appstore_campaign_readiness.mjs
  node scripts/appstore_campaign_readiness.mjs --queue outputs/daily/queue.md --expect-actions 10

Runs the approval queue preflight, Coachi App Store link verifier, and X pack validator.
Writes one readiness JSON artifact for the next approval-gated App Store download push.`);
}

function runCommand(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      process.stdout.write(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
      process.stderr.write(chunk);
    });
    child.on("close", (status) => {
      resolve({ command, args, status, stdout, stderr, ok: status === 0 });
    });
  });
}

async function readJson(pathname) {
  return JSON.parse(await fs.readFile(pathname, "utf8"));
}

export function buildReadinessReport({ queue, xPack, preflight, linkVerification, commands, requireProviderToken }) {
  const providerTokenComplete =
    Number(linkVerification.provider_token_present || 0) === Number(linkVerification.total || 0) &&
    Number(linkVerification.total || 0) > 0;
  const ready =
    commands.every((command) => command.ok) &&
    Boolean(preflight.ok) &&
    Number(linkVerification.failed || 0) === 0 &&
    (!requireProviderToken || providerTokenComplete);

  return {
    checked_at: new Date().toISOString(),
    queue,
    x_pack: xPack,
    ready_for_approval_execution: ready,
    provider_token_required: requireProviderToken,
    provider_token_complete: providerTokenComplete,
    public_actions_taken: 0,
    checks: {
      queue_preflight: {
        ok: Boolean(preflight.ok),
        action_count: preflight.action_count,
        url_count: preflight.url_count,
        campaign_link_count: preflight.campaign_link_count,
        errors: preflight.errors || [],
        warnings: preflight.warnings || [],
      },
      appstore_links: {
        ok: Number(linkVerification.failed || 0) === 0,
        total: linkVerification.total,
        passed: linkVerification.passed,
        failed: linkVerification.failed,
        provider_token_present: linkVerification.provider_token_present,
      },
      x_pack: {
        ok: commands.find((command) => command.name === "validate_x_pack")?.ok ?? false,
      },
    },
    next_gate: providerTokenComplete
      ? "Request exact approval before public posting."
      : "Set APP_STORE_CAMPAIGN_PROVIDER_TOKEN in Render before treating App Store Connect campaign attribution as complete; Coachi-side click tracking is still usable.",
    commands: commands.map((command) => ({
      name: command.name,
      command: command.command,
      args: command.args,
      status: command.status,
      ok: command.ok,
    })),
  };
}

async function main() {
  const { args, flags } = parseArgs(process.argv.slice(2));
  if (flags.has("--help")) {
    usage();
    return 0;
  }

  const queue = args.get("--queue") || DEFAULT_QUEUE;
  const xPack = args.get("--x-pack") || DEFAULT_X_PACK;
  const expectActions = args.get("--expect-actions") || "10";
  const preflightOut = args.get("--preflight-out") || DEFAULT_PREFLIGHT_OUT;
  const linkOut = args.get("--link-out") || DEFAULT_LINK_OUT;
  const reportOut = args.get("--out") || DEFAULT_REPORT_OUT;
  const requireProviderToken = flags.has("--require-provider-token");

  const commands = [];
  const preflight = await runCommand("node", [
    "scripts/preflight_approval_queue.mjs",
    "--input",
    queue,
    "--expect-actions",
    expectActions,
    "--out",
    preflightOut,
  ]);
  commands.push({ name: "preflight_approval_queue", ...preflight });

  const verifyArgs = [
    "scripts/verify_appstore_campaign_links.mjs",
    "--input",
    queue,
    "--out",
    linkOut,
  ];
  if (requireProviderToken) verifyArgs.push("--require-provider-token");
  const verifyLinks = await runCommand("node", verifyArgs);
  commands.push({ name: "verify_appstore_campaign_links", ...verifyLinks });

  const validateXPack = await runCommand("python3", ["scripts/validate_x_pack.py", xPack]);
  commands.push({ name: "validate_x_pack", ...validateXPack });

  const report = buildReadinessReport({
    queue,
    xPack,
    preflight: await readJson(preflightOut),
    linkVerification: await readJson(linkOut),
    commands,
    requireProviderToken,
  });

  await fs.mkdir(path.dirname(reportOut), { recursive: true });
  await fs.writeFile(reportOut, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Readiness report: ${reportOut}`);
  console.log(`Ready for approval execution: ${report.ready_for_approval_execution ? "yes" : "no"}`);
  console.log(`Provider token complete: ${report.provider_token_complete ? "yes" : "no"}`);
  return report.ready_for_approval_execution ? 0 : requireProviderToken ? 1 : 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(`appstore_campaign_readiness.mjs: ${error.message}`);
      process.exitCode = 1;
    });
}
