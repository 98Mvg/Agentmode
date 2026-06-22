#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_APP_ID = "6760587172";
const DEFAULT_COUNTRIES = ["us", "no"];
const DEFAULT_READINESS = "outputs/daily/2026-06-22-appstore-campaign-readiness.json";

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

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
  node scripts/audit_appstore_listing.mjs
  node scripts/audit_appstore_listing.mjs --app-id 6760587172 --countries us,no --out-md outputs/daily/appstore-conversion-audit.md

Fetches live App Store listing metadata, parses public screenshot assets, and writes
a conversion audit for the App Store download push. Public actions taken: 0.`);
}

function compactWhitespace(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function stripHtmlToText(html) {
  return compactWhitespace(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
  );
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function assetTemplateFromUrl(url) {
  return url
    .replace(/&amp;/g, "&")
    .replace(/\/\d+x\d+[^/\s"')]*\.(webp|jpg|jpeg|png).*$/i, "/{w}x{h}.{f}");
}

export function extractScreenshotAssetsFromHtml(html) {
  const start = html.indexOf('id="product_media_phone_"');
  const section = start >= 0 ? html.slice(start, start + 120000) : html;
  const matches = [...section.matchAll(/https:\/\/[^"'\s,)]+mzstatic[^"'\s,)]+/g)].map((match) => match[0]);
  const seen = new Set();
  const assets = [];

  for (const rawUrl of matches) {
    if (!rawUrl.includes("PurpleSource")) continue;
    if (/Placeholder|AppIcon/i.test(rawUrl)) continue;
    if (!/\.(png|jpg|jpeg|webp)/i.test(rawUrl)) continue;

    const templateUrl = assetTemplateFromUrl(rawUrl);
    if (seen.has(templateUrl)) continue;
    seen.add(templateUrl);

    const filename = decodeURIComponent(templateUrl.split("/").at(-2) || "");
    assets.push({ filename, template_url: templateUrl });
  }

  return assets;
}

export function extractPublicPageSummary(html, title) {
  const text = stripHtmlToText(html);
  let subtitle = "";
  let shortDescription = "";
  const titlePattern = new RegExp(`${escapeRegExp(title)}\\s+(.{3,140}?)\\s+Free\\b`, "g");
  for (const match of text.matchAll(titlePattern)) {
    const candidate = compactWhitespace(match[1]);
    if (/App Store|Search Today|Games Apps|Platform/i.test(candidate)) continue;
    subtitle = candidate;
    break;
  }

  const devicesMarker = "iPhone, iPad, Apple Watch";
  const descriptionIndex = text.indexOf(devicesMarker);
  if (descriptionIndex >= 0) {
    const afterDevices = text.slice(descriptionIndex + devicesMarker.length);
    const nextLongDescription = afterDevices.indexOf("Coachi ");
    const candidate = nextLongDescription >= 0 ? afterDevices.slice(0, nextLongDescription) : afterDevices.slice(0, 240);
    shortDescription = compactWhitespace(candidate);
  }

  return {
    subtitle,
    short_description: shortDescription,
    text_preview: text.slice(0, 1200),
  };
}

function lookupSummary(country, app) {
  return {
    country,
    track_name: app.trackName || "",
    subtitle: "",
    primary_genre: app.primaryGenreName || "",
    genres: app.genres || [],
    formatted_price: app.formattedPrice || "",
    average_rating: Number(app.averageUserRating || 0),
    rating_count: Number(app.userRatingCount || 0),
    version: app.version || "",
    release_date: app.releaseDate || "",
    current_version_release_date: app.currentVersionReleaseDate || "",
    minimum_os_version: app.minimumOsVersion || "",
    language_codes: app.languageCodesISO2A || [],
    api_screenshot_count: Number((app.screenshotUrls || []).length),
    api_ipad_screenshot_count: Number((app.ipadScreenshotUrls || []).length),
    description_first_line: compactWhitespace(String(app.description || "").split(/\n+/)[0] || ""),
    description: app.description || "",
    release_notes: app.releaseNotes || "",
    track_view_url: app.trackViewUrl || "",
  };
}

function hasOddTitleCase(title) {
  return /\b[a-z]+ Coach\b/.test(title) || /\bfitness Coach\b/.test(title);
}

function descriptionIsBroad(description) {
  return /Whether you run, walk, cycle, or do intervals/i.test(description);
}

function primaryTrafficCountry(countries) {
  return countries.find((country) => country.country === "us") || countries[0] || {};
}

function pushIssue(issues, severity, code, title, detail, recommendation) {
  issues.push({ severity, code, title, detail, recommendation });
}

export function analyzeListing({ countries, publicPage, readiness }) {
  const primary = primaryTrafficCountry(countries);
  const allText = compactWhitespace([
    primary.track_name,
    publicPage.subtitle,
    publicPage.short_description,
    primary.description_first_line,
    primary.description,
  ].join(" "));
  const issues = [];
  let score = 100;

  if (hasOddTitleCase(primary.track_name)) {
    score -= 8;
    pushIssue(
      issues,
      "high",
      "title_case",
      "App title casing reads unfinished",
      `Live title is "${primary.track_name}".`,
      "Change the title casing in the next App Store metadata update. Keep it plain and runner-aligned."
    );
  }

  if (!/\brun\b|\brunning\b/i.test(primary.track_name) && !/\brun\b|\brunning\b/i.test(publicPage.subtitle || "")) {
    score -= 10;
    pushIssue(
      issues,
      "high",
      "runner_keyword_absent",
      "Title/subtitle do not claim running",
      `Title/subtitle currently read "${primary.track_name}" / "${publicPage.subtitle || "unknown"}".`,
      "Test a runner-specific title/subtitle such as Coachi: AI Run Coach or Coachi: Voice Run Coach."
    );
  }

  if (descriptionIsBroad(primary.description)) {
    score -= 10;
    pushIssue(
      issues,
      "medium",
      "broad_positioning",
      "Description spreads the promise across run/walk/cycle/intervals",
      "The current paid and organic push is runner-led, while the App Store copy frames Coachi as a general workout coach.",
      "Make the first 2 lines runner-first: live cues during runs, heart-rate zones, Apple Watch/iPhone."
    );
  }

  if (Number(primary.rating_count || 0) === 0) {
    score -= 12;
    pushIssue(
      issues,
      "high",
      "zero_primary_country_ratings",
      `Primary traffic country has ${primary.rating_count || 0} ratings`,
      `${primary.country?.toUpperCase?.() || "Primary"} lookup reports rating ${primary.average_rating || 0} from ${primary.rating_count || 0} users.`,
      "After the next real user win, ask for ratings from active iOS users before scaling cold traffic."
    );
  }

  if (Number(publicPage.screenshot_count || 0) < 5) {
    score -= 15;
    pushIssue(
      issues,
      "critical",
      "too_few_screenshots",
      "Public page exposes fewer than 5 screenshots",
      `Parsed ${publicPage.screenshot_count || 0} public screenshot assets.`,
      "Upload at least 5 strong iPhone screenshots before scaling paid or high-volume organic traffic."
    );
  }

  if (Number(primary.api_screenshot_count || 0) === 0 && Number(publicPage.screenshot_count || 0) > 0) {
    score -= 4;
    pushIssue(
      issues,
      "low",
      "lookup_screenshot_mismatch",
      "Apple lookup API returns zero screenshots while public HTML has screenshots",
      `Lookup API: ${primary.api_screenshot_count}; public page: ${publicPage.screenshot_count}.`,
      "Use public page parsing for listing audits and verify App Store Connect media by device size."
    );
  }

  if (Number(publicPage.screenshot_count || 0) >= 5 && publicPage.screenshot_files?.[0]) {
    const first = publicPage.screenshot_files[0];
    if (!/coach|run|voice|ai|watch/i.test(first)) {
      score -= 8;
      pushIssue(
        issues,
        "medium",
        "first_screenshot_message",
        "First screenshot likely leads with setup, not the live coaching promise",
        `First screenshot asset is ${first}. The visual audit shows the first frame says "Select your optimal heart rate".`,
        "Make screenshot 1 say what the user gets: Live AI run coaching in your ear."
      );
    }
  }

  if (readiness && readiness.provider_token_complete === false) {
    score -= 5;
    pushIssue(
      issues,
      "medium",
      "provider_token_missing",
      "App Store Connect campaign attribution is incomplete",
      "Coachi-side click tracking works, but redirected App Store URLs still lack pt.",
      "Set APP_STORE_CAMPAIGN_PROVIDER_TOKEN in production before judging App Store Connect campaign performance."
    );
  }

  const strengths = [];
  if (/heart rate|zone/i.test(allText)) strengths.push("Heart-rate/zone value prop is present.");
  if (/Apple Watch/i.test(allText)) strengths.push("Apple Watch compatibility is visible.");
  if (Number(publicPage.screenshot_count || 0) >= 5) strengths.push("Public App Store page has a full iPhone screenshot shelf.");
  const countryWithRatings = countries.find((country) => Number(country.rating_count || 0) > 0);
  if (countryWithRatings) {
    strengths.push(`${countryWithRatings.country.toUpperCase()} listing has ${countryWithRatings.rating_count} rating(s) at ${countryWithRatings.average_rating}.`);
  }

  return {
    score: Math.max(0, score),
    grade: score >= 85 ? "strong" : score >= 70 ? "needs_tuning" : "conversion_risk",
    primary_country: primary.country,
    strengths,
    issues,
  };
}

function markdownList(items) {
  if (!items.length) return "- None";
  return items.map((item) => `- ${item}`).join("\n");
}

export function buildMarkdownReport(report) {
  const primary = report.countries.find((country) => country.country === report.analysis.primary_country) || report.countries[0];
  const issues = report.analysis.issues
    .map(
      (issue) =>
        `- ${issue.severity.toUpperCase()} - ${issue.title}: ${issue.detail} Recommendation: ${issue.recommendation}`
    )
    .join("\n");
  const countries = report.countries
    .map(
      (country) =>
        `- ${country.country.toUpperCase()}: ${country.track_name}; rating ${country.average_rating}/${country.rating_count}; API screenshots ${country.api_screenshot_count}; version ${country.version}`
    )
    .join("\n");
  const screenshots = report.public_page.screenshot_files
    .map((file, index) => `- ${index + 1}. ${file}`)
    .join("\n");

  return `# Coachi App Store Conversion Audit - ${report.checked_at.slice(0, 10)}

Objective: move toward 10,000 App Store downloads.

Public actions taken: 0.

## Verdict

Download-readiness score: ${report.analysis.score}/100 (${report.analysis.grade}).

The App Store page is shippable for a small organic push, but it should not be treated as conversion-optimized yet. The biggest blockers are title/subtitle alignment, zero visible US ratings, broad first-copy positioning, and a first screenshot that undersells the live-coaching promise.

## Live Listing Snapshot

- App ID: ${report.app_id}
- Primary listing checked: ${primary.track_view_url}
- Title: ${primary.track_name}
- Public subtitle: ${report.public_page.subtitle || "not parsed"}
- Short public description: ${report.public_page.short_description || "not parsed"}
- First description line: ${primary.description_first_line}
- Price: ${primary.formatted_price}
- Current version: ${primary.version}, released ${primary.current_version_release_date}
- Minimum OS: ${primary.minimum_os_version}
- Public screenshot assets parsed: ${report.public_page.screenshot_count}
- Lookup API screenshot count: ${primary.api_screenshot_count}

## Country Signals

${countries}

## Strengths

${markdownList(report.analysis.strengths)}

## Risks And Fixes

${issues || "- None"}

## Screenshot Audit

Public screenshot assets parsed from the App Store page:

${screenshots || "- None"}

Manual visual read from the current screenshot order:
- Screenshot 1 looks polished but leads with setup: "Select your optimal heart rate" and "let Coachi do the rest."
- The current social promise is stronger than that: live AI run coaching while the run is still fixable.
- The Apple Watch value appears in the screenshot, but the first frame does not make "during the run" obvious enough.

Recommended screenshot order for the next App Store Connect update:
- 1. Live AI run coach in your ear.
- 2. Apple Watch heart-rate cues during the run.
- 3. Stay in the right zone without staring at your watch.
- 4. Build intervals / easy runs in seconds.
- 5. Post-run Coachi Score and what to improve.
- 6. Share or save the workout result.

## Metadata Rewrite Direction

Do not change the website landing page for this. Use App Store Connect metadata in the next app update.

Title candidates:
- Coachi: AI Run Coach
- Coachi: Voice Run Coach
- Coachi: Heart Rate Coach

Subtitle candidates:
- Live cues for easier runs
- Heart-rate coaching by voice
- Run in the right zone

First two description lines:

\`\`\`text
Coachi gives you live voice coaching during your run, using heart rate and workout context to tell you when to slow down, hold steady, or recover.

It is built for runners who want Apple Watch and iPhone guidance while the run is still happening, not another chart after it is over.
\`\`\`

## Next Gates

- Set \`APP_STORE_CAMPAIGN_PROVIDER_TOKEN\` before relying on App Store Connect campaign attribution.
- Ask current iOS users for ratings after a real positive workout moment; the US listing currently has no visible rating proof.
- Rerun this audit after App Store Connect metadata/screenshots are updated.

Sources:
- ${report.lookup_urls.join("\n- ")}
- ${report.public_page.url}
`;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.text();
}

async function readReadiness(pathname) {
  try {
    return JSON.parse(await fs.readFile(pathname, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

async function main() {
  const { args, flags } = parseArgs(process.argv.slice(2));
  if (flags.has("--help")) {
    usage();
    return 0;
  }

  const appId = args.get("--app-id") || DEFAULT_APP_ID;
  const countriesArg = args.get("--countries") || DEFAULT_COUNTRIES.join(",");
  const countries = countriesArg.split(",").map((country) => country.trim().toLowerCase()).filter(Boolean);
  const readinessPath = args.get("--readiness") || DEFAULT_READINESS;
  const outJson = args.get("--out-json") || `outputs/daily/${todayStamp()}-appstore-listing-audit.json`;
  const outMd = args.get("--out-md") || `outputs/daily/${todayStamp()}-appstore-conversion-audit.md`;

  const lookupUrls = countries.map((country) => `https://itunes.apple.com/lookup?id=${appId}&country=${country}`);
  const lookupResults = [];
  for (let index = 0; index < countries.length; index += 1) {
    const data = await fetchJson(lookupUrls[index]);
    const app = data.results?.[0];
    if (!app) throw new Error(`No App Store lookup result for country ${countries[index]}`);
    lookupResults.push(lookupSummary(countries[index], app));
  }

  const pageUrl = args.get("--page-url") || lookupResults[0].track_view_url?.replace(/\?uo=4$/, "");
  if (!pageUrl) throw new Error("No public page URL available");
  const publicHtml = await fetchText(pageUrl);
  const publicSummary = extractPublicPageSummary(publicHtml, lookupResults[0].track_name);
  const screenshotAssets = extractScreenshotAssetsFromHtml(publicHtml);
  const readiness = await readReadiness(readinessPath);
  const publicPage = {
    url: pageUrl,
    subtitle: publicSummary.subtitle,
    short_description: publicSummary.short_description,
    screenshot_count: screenshotAssets.length,
    screenshot_files: screenshotAssets.map((asset) => asset.filename),
    screenshot_assets: screenshotAssets,
  };
  const analysis = analyzeListing({
    countries: lookupResults,
    publicPage,
    readiness,
  });

  const report = {
    checked_at: new Date().toISOString(),
    app_id: appId,
    public_actions_taken: 0,
    lookup_urls: lookupUrls,
    countries: lookupResults,
    public_page: publicPage,
    readiness: readiness
      ? {
          path: readinessPath,
          ready_for_approval_execution: readiness.ready_for_approval_execution,
          provider_token_complete: readiness.provider_token_complete,
          public_actions_taken: readiness.public_actions_taken,
        }
      : null,
    analysis,
  };

  await fs.mkdir(path.dirname(outJson), { recursive: true });
  await fs.writeFile(outJson, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  await fs.mkdir(path.dirname(outMd), { recursive: true });
  await fs.writeFile(outMd, buildMarkdownReport(report), "utf8");

  console.log(`App Store listing audit JSON: ${outJson}`);
  console.log(`App Store conversion audit: ${outMd}`);
  console.log(`Score: ${analysis.score}/100 (${analysis.grade})`);
  console.log(`Issues: ${analysis.issues.length}`);
  return analysis.score >= 70 ? 0 : 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(`audit_appstore_listing.mjs: ${error.message}`);
      process.exitCode = 1;
    });
}
