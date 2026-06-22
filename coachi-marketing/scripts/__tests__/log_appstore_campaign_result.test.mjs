import assert from "node:assert/strict";
import test from "node:test";

import {
  buildResultEntry,
  decideResult,
} from "../log_appstore_campaign_result.mjs";

function argsFrom(object) {
  return new Map(Object.entries(object));
}

test("builds a baseline entry without writing fake public actions", () => {
  const entry = buildResultEntry({
    args: argsFrom({
      "--campaign": "x_product_proof_20260622",
      "--source": "x",
      "--window": "baseline",
      "--clicks": "0",
      "--product-page-views": "0",
      "--first-time-downloads": "0",
      "--public-actions-posted": "0",
      "--provider-token-present": "false",
    }),
    readiness: {
      ready_for_approval_execution: true,
      provider_token_complete: false,
    },
    now: new Date("2026-06-22T20:00:00.000Z"),
  });

  assert.equal(entry.campaign, "x_product_proof_20260622");
  assert.equal(entry.window, "baseline");
  assert.equal(entry.ready_for_approval_execution, true);
  assert.equal(entry.provider_token_complete, false);
  assert.equal(entry.provider_token_present, false);
  assert.equal(entry.public_actions_posted, 0);
  assert.equal(entry.app_store_conversion_rate, null);
  assert.equal(entry.decision, "increase_distribution");
});

test("computes conversion rate and continue decision once downloads happen", () => {
  const entry = buildResultEntry({
    args: argsFrom({
      "--campaign": "reddit_hr_audio_cues_20260622",
      "--window": "24h",
      "--clicks": "44",
      "--product-page-views": "30",
      "--first-time-downloads": "6",
      "--post-url": "https://reddit.com/a,https://reddit.com/b",
    }),
    readiness: {},
    now: new Date("2026-06-23T20:00:00.000Z"),
  });

  assert.deepEqual(entry.post_urls, ["https://reddit.com/a", "https://reddit.com/b"]);
  assert.equal(entry.app_store_conversion_rate, 0.2);
  assert.equal(entry.decision, "continue_and_compare_campaigns");
});

test("decision rules separate distribution, attribution, and conversion problems", () => {
  assert.equal(decideResult({
    posthog_app_store_clicks: 0,
    app_store_product_page_views: 0,
    app_store_first_time_downloads: 0,
  }), "increase_distribution");
  assert.equal(decideResult({
    posthog_app_store_clicks: 40,
    app_store_product_page_views: 1,
    app_store_first_time_downloads: 0,
  }), "inspect_redirect_or_apple_attribution");
  assert.equal(decideResult({
    posthog_app_store_clicks: 40,
    app_store_product_page_views: 25,
    app_store_first_time_downloads: 0,
  }), "improve_app_store_conversion");
});
