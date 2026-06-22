import assert from "node:assert/strict";
import test from "node:test";

import {
  byteLength,
  normalizeWords,
  summarizeMetadata,
  validateMetadataPack,
} from "../validate_appstore_metadata_pack.mjs";

function validPack(overrides = {}) {
  const base = {
    public_actions_taken: 0,
    source_audit: "outputs/daily/audit.md",
    apple_constraints: {
      name_max_characters: 30,
      subtitle_max_characters: 30,
      promotional_text_max_characters: 170,
      description_max_characters: 4000,
      keywords_max_bytes: 100,
    },
    recommended_update: {
      name: "Coachi: AI Run Coach",
      subtitle: "Voice cues by heart rate",
      promotional_text:
        "New: clearer zones and smoother Apple Watch heart-rate connection. Get live voice cues during runs so you know when to slow down or hold steady.",
      keywords:
        "zone,watch,workout,training,intervals,pace,runner,cardio,feedback,bpm,effort,tempo,beginner",
      description:
        "Coachi is an AI run coach that gives runners live voice guidance during a run. Apple Watch and iPhone context help runners slow down, hold steady, or recover.",
      screenshot_sequence: [
        {
          position: 1,
          headline: "Live AI run coaching",
          support: "Hear when to slow down, hold steady, or recover.",
          visual_direction: "Active run cue.",
        },
        {
          position: 2,
          headline: "Heart-rate cues mid-run",
          support: "Stay in the right zone without staring at your watch.",
          visual_direction: "Apple Watch plus iPhone.",
        },
        {
          position: 3,
          headline: "Easy should stay easy",
          support: "Catch effort drift before the run turns hard.",
          visual_direction: "Effort drift.",
        },
        {
          position: 4,
          headline: "Build the run in seconds",
          support: "Timed runs, free runs, intervals, and zone targets.",
          visual_direction: "Workout setup.",
        },
        {
          position: 5,
          headline: "Post-run Coachi Score",
          support: "See what worked and what to improve next.",
          visual_direction: "Summary.",
        },
        {
          position: 6,
          headline: "Share the result",
          support: "Keep the workout story clear after the run.",
          visual_direction: "Share card.",
        },
      ],
    },
    secondary_variants: {
      name: ["Coachi: Voice Run Coach"],
      subtitle: ["Live cues for easier runs"],
      promotional_text: ["Run with live voice cues from Coachi. Stay closer to the right zone."],
    },
    sources: ["https://developer.apple.com/app-store/product-page/"],
  };

  return {
    ...base,
    ...overrides,
    recommended_update: {
      ...base.recommended_update,
      ...(overrides.recommended_update || {}),
    },
  };
}

test("validates the current App Store metadata update pack", () => {
  const pack = validPack();
  const result = validateMetadataPack(pack);

  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
  assert.equal(result.summary.name_characters, 20);
  assert.equal(result.summary.subtitle_characters, 24);
  assert.equal(result.summary.promotional_text_characters, 144);
  assert.equal(result.summary.keywords_bytes, 91);
  assert.equal(result.summary.screenshot_count, 6);
});

test("catches App Store length violations and public action contamination", () => {
  const result = validateMetadataPack(
    validPack({
      public_actions_taken: 1,
      recommended_update: {
        name: "Coachi: AI Running Coach With Extra Words",
        subtitle: "This subtitle is definitely too long for App Store Connect",
        promotional_text: "x".repeat(171),
        description: "x".repeat(4001),
        keywords: "x".repeat(101),
      },
    })
  );

  assert.equal(result.ok, false);
  assert.equal(result.errors.some((error) => error.code === "public_actions_not_zero"), true);
  assert.equal(result.errors.some((error) => error.code === "recommended_update.name_too_long"), true);
  assert.equal(result.errors.some((error) => error.code === "recommended_update.subtitle_too_long"), true);
  assert.equal(result.errors.some((error) => error.code === "recommended_update.promotional_text_too_long"), true);
  assert.equal(result.errors.some((error) => error.code === "recommended_update.description_too_long"), true);
  assert.equal(result.errors.some((error) => error.code === "recommended_update.keywords_too_long"), true);
});

test("catches keyword waste and competitor/company terms", () => {
  const result = validateMetadataPack(
    validPack({
      recommended_update: {
        keywords: "run, apple,garmin,zone,zone,ai",
      },
    })
  );

  assert.equal(result.ok, false);
  assert.equal(result.errors.some((error) => error.code === "keyword_too_short"), true);
  assert.equal(result.errors.some((error) => error.code === "keyword_has_outer_space"), true);
  assert.equal(result.errors.some((error) => error.code === "keyword_duplicates_visible_metadata"), true);
  assert.equal(result.errors.some((error) => error.code === "keyword_banned_company_or_competitor"), true);
  assert.equal(result.errors.some((error) => error.code === "keyword_duplicate"), true);
});

test("catches weak screenshot sequencing", () => {
  const pack = validPack({
    recommended_update: {
      screenshot_sequence: [
        {
          position: 2,
          headline: "Choose workout style",
          support: "Pick a setup before you start.",
          visual_direction: "Setup screen.",
        },
      ],
    },
  });
  const result = validateMetadataPack(pack);

  assert.equal(result.ok, false);
  assert.equal(result.errors.some((error) => error.code === "screenshots_too_few"), true);
});

test("normalizes words and counts bytes", () => {
  assert.deepEqual(normalizeWords("Coachi: AI Run Coach"), ["coachi", "ai", "run", "coach"]);
  assert.equal(byteLength("bpm"), 3);
  assert.equal(summarizeMetadata(validPack()).keywords_bytes, 91);
});
