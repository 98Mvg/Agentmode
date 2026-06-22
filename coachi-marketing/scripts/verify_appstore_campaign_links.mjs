#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

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
  node scripts/verify_appstore_campaign_links.mjs --input outputs/daily/2026-06-22-appstore-campaign-link-bank.md --out outputs/daily/appstore-link-verification.json
  node scripts/verify_appstore_campaign_links.mjs --input outputs/daily/queue.md --require-provider-token

Checks Coachi-owned /app-store and /ios links, verifies they redirect to apps.apple.com,
and confirms the redirected App Store URL includes the expected ct campaign token and mt media type.`);
}

function appStoreCampaignUrls(text) {
  const matches = text.match(/https:\/\/coachi\.no\/(?:app-store|ios)\?[^)\]\s`"<>]+/g) ?? [];
  return [
    ...new Set(
      matches
        .map((url) => url.replace(/[.,;:]+$/g, ""))
        .filter((url) => {
          const parsed = new URL(url);
          return Boolean(parsed.searchParams.get("source") || parsed.searchParams.get("utm_source"));
        })
    ),
  ];
}

function expectedCampaignToken(url) {
  const parsed = new URL(url);
  return parsed.searchParams.get("ct") || parsed.searchParams.get("campaign") || parsed.searchParams.get("source") || "";
}

async function verifyUrl(url, { requireProviderToken }) {
  const response = await fetch(url, { method: "GET", redirect: "manual" });
  const location = response.headers.get("location") || "";
  const result = {
    source_url: url,
    status: response.status,
    location,
    ok: false,
    expected_ct: expectedCampaignToken(url),
    actual_ct: null,
    actual_mt: null,
    provider_token_present: false,
    errors: [],
  };

  if (response.status < 300 || response.status > 399) {
    result.errors.push(`expected redirect status, got ${response.status}`);
  }
  if (!location) {
    result.errors.push("missing Location header");
    return result;
  }

  let target;
  try {
    target = new URL(location);
  } catch {
    result.errors.push(`invalid redirect URL: ${location}`);
    return result;
  }

  if (target.hostname !== "apps.apple.com") {
    result.errors.push(`expected apps.apple.com redirect, got ${target.hostname}`);
  }

  result.actual_ct = target.searchParams.get("ct");
  result.actual_mt = target.searchParams.get("mt");
  result.provider_token_present = Boolean(target.searchParams.get("pt"));

  if (result.expected_ct && result.actual_ct !== result.expected_ct) {
    result.errors.push(`ct mismatch: expected ${result.expected_ct}, got ${result.actual_ct || "missing"}`);
  }
  if (result.actual_mt !== "8") {
    result.errors.push(`mt mismatch: expected 8, got ${result.actual_mt || "missing"}`);
  }
  if (requireProviderToken && !result.provider_token_present) {
    result.errors.push("provider token pt is missing");
  }

  result.ok = result.errors.length === 0;
  return result;
}

async function main() {
  const { args, flags } = parseArgs(process.argv.slice(2));
  if (flags.has("--help") || !args.has("--input")) {
    printHelp();
    return flags.has("--help") ? 0 : 1;
  }

  const inputPath = args.get("--input");
  const outPath = args.get("--out");
  const requireProviderToken = flags.has("--require-provider-token");
  const text = await fs.readFile(inputPath, "utf8");
  const urls = appStoreCampaignUrls(text);

  if (urls.length === 0) {
    throw new Error(`No Coachi App Store campaign links found in ${inputPath}`);
  }

  const results = [];
  for (const url of urls) {
    results.push(await verifyUrl(url, { requireProviderToken }));
  }

  const summary = {
    input: inputPath,
    checked_at: new Date().toISOString(),
    require_provider_token: requireProviderToken,
    total: results.length,
    passed: results.filter((result) => result.ok).length,
    failed: results.filter((result) => !result.ok).length,
    provider_token_present: results.filter((result) => result.provider_token_present).length,
    results,
  };

  if (outPath) {
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  }

  console.log(`Checked ${summary.total} App Store campaign links: ${summary.passed} passed, ${summary.failed} failed.`);
  if (summary.provider_token_present === 0) {
    console.log("Provider token pt was not present in any redirect.");
  } else {
    console.log(`Provider token pt present in ${summary.provider_token_present}/${summary.total} redirects.`);
  }
  for (const result of results) {
    const marker = result.ok ? "OK" : "FAIL";
    console.log(`${marker} ${result.source_url} -> ${result.status} ${result.location}`);
    for (const error of result.errors) console.log(`  - ${error}`);
  }

  return summary.failed === 0 ? 0 : 1;
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
