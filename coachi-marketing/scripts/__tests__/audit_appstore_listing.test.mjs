import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeListing,
  buildMarkdownReport,
  extractPublicPageSummary,
  extractScreenshotAssetsFromHtml,
} from "../audit_appstore_listing.mjs";

const fixtureHtml = `
  <html>
    <body>
      <main>
        Coachi: Voice fitness Coach App - App Store for iPhone iPhone iPad Mac Vision Watch TV Search Today Games Apps Arcade Platform iPhone iPad Mac Vision Watch TV
        Coachi: Voice fitness Coach Voice Coaching by Heart Rate Free
        iPhone, iPad, Apple Watch Run smarter with Coachi, your fitness coach. Get voice guided workouts.
        <section id="product_media_phone_">
          <img srcset="https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/a/b/c/Appstore_imave_v2.png/300x650bb.webp 300w">
          <img srcset="https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/a/b/c/Appstore_imave_v2.png/600x1300bb-60.jpg 600w">
          <img srcset="https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/d/e/f/Choose_your_zone.png/300x650bb.webp 300w">
          <img srcset="https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/g/h/i/Placeholder.mill/300x650bb.webp 300w">
          <img srcset="https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/j/k/l/AppIcon.png/300x650bb.webp 300w">
        </section>
      </main>
    </body>
  </html>
`;

function listing(overrides = {}) {
  return {
    country: "us",
    track_name: "Coachi: Voice fitness Coach",
    primary_genre: "Health & Fitness",
    genres: ["Health & Fitness", "Sports"],
    formatted_price: "Free",
    average_rating: 0,
    rating_count: 0,
    version: "2.2",
    release_date: "2026-04-05T07:00:00Z",
    current_version_release_date: "2026-06-17T17:40:40Z",
    minimum_os_version: "17.0",
    language_codes: ["EN"],
    api_screenshot_count: 0,
    api_ipad_screenshot_count: 0,
    description_first_line: "Coachi - heart rate voice coaching for your workouts",
    description:
      "Coachi helps you train smarter. Whether you run, walk, cycle, or do intervals, Coachi helps you stay focused.",
    release_notes: "Bug fixes.",
    track_view_url: "https://apps.apple.com/us/app/coachi-voice-fitness-coach/id6760587172?uo=4",
    ...overrides,
  };
}

test("extracts unique public screenshot assets and skips placeholders/icons", () => {
  const assets = extractScreenshotAssetsFromHtml(fixtureHtml);

  assert.deepEqual(assets.map((asset) => asset.filename), ["Appstore_imave_v2.png", "Choose_your_zone.png"]);
  assert.equal(assets[0].template_url.endsWith("/{w}x{h}.{f}"), true);
});

test("extracts public subtitle and short description from page text", () => {
  const summary = extractPublicPageSummary(fixtureHtml, "Coachi: Voice fitness Coach");

  assert.equal(summary.subtitle, "Voice Coaching by Heart Rate");
  assert.match(summary.short_description, /Run smarter with Coachi/);
});

test("flags current conversion risks without blocking small organic execution", () => {
  const report = analyzeListing({
    countries: [
      listing(),
      listing({
        country: "no",
        average_rating: 5,
        rating_count: 4,
      }),
    ],
    publicPage: {
      subtitle: "Voice Coaching by Heart Rate",
      short_description: "Run smarter with Coachi.",
      screenshot_count: 6,
      screenshot_files: [
        "Appstore_imave_v2.png",
        "Choose_your_zone.png",
        "choose_workout_style_1320x2868_portrait.png",
        "rounds_costumize_catchy_1320x2868_portrait.png",
        "rest_1320x2868_portrait.png",
        "share_your_workouts_no_number_1320x2868_portrait.png",
      ],
    },
    readiness: {
      provider_token_complete: false,
    },
  });

  assert.equal(report.grade, "conversion_risk");
  assert.equal(report.score, 43);
  assert.deepEqual(report.issues.map((issue) => issue.code), [
    "title_case",
    "runner_keyword_absent",
    "broad_positioning",
    "zero_primary_country_ratings",
    "lookup_screenshot_mismatch",
    "first_screenshot_message",
    "provider_token_missing",
  ]);
  assert.match(report.strengths.join(" "), /NO listing has 4 rating/);
});

test("markdown report preserves no-public-action status and next gates", () => {
  const analysis = analyzeListing({
    countries: [listing()],
    publicPage: {
      url: "https://apps.apple.com/us/app/coachi-voice-fitness-coach/id6760587172",
      subtitle: "Voice Coaching by Heart Rate",
      short_description: "Run smarter with Coachi.",
      screenshot_count: 1,
      screenshot_files: ["Appstore_imave_v2.png"],
    },
    readiness: {
      provider_token_complete: false,
    },
  });
  const markdown = buildMarkdownReport({
    checked_at: "2026-06-22T20:00:00.000Z",
    app_id: "6760587172",
    lookup_urls: ["https://itunes.apple.com/lookup?id=6760587172&country=us"],
    countries: [listing()],
    public_page: {
      url: "https://apps.apple.com/us/app/coachi-voice-fitness-coach/id6760587172",
      subtitle: "Voice Coaching by Heart Rate",
      short_description: "Run smarter with Coachi.",
      screenshot_count: 1,
      screenshot_files: ["Appstore_imave_v2.png"],
    },
    analysis,
  });

  assert.match(markdown, /Public actions taken: 0/);
  assert.match(markdown, /APP_STORE_CAMPAIGN_PROVIDER_TOKEN/);
  assert.match(markdown, /Do not change the website landing page/);
});
