import assert from "node:assert/strict";
import test from "node:test";

import {
  preflightApprovalQueue,
  queueSection,
  redditThreadKey,
  trackingToken,
} from "../preflight_approval_queue.mjs";

test("normalizes Reddit thread URLs to a stable dedupe key", () => {
  assert.equal(
    redditThreadKey("https://www.reddit.com/r/beginnerrunning/comments/1q6ux3g/how_do_you_stop_running_too_fast_looking_for_a/oraljb8/"),
    "reddit:beginnerrunning:1q6ux3g"
  );
  assert.equal(
    redditThreadKey("https://old.reddit.com/r/AppleWatch/comments/17tsp0h/can_apple_watch_give_heart_rate_alerts_for/"),
    "reddit:applewatch:17tsp0h"
  );
});

test("matches production tracking-token truncation", () => {
  assert.equal(trackingToken("reddit_generic_app_ask_20260622"), "reddit_generic_app_ask_2026062");
  assert.equal(trackingToken("reddit_generic_app_20260622"), "reddit_generic_app_20260622");
});

test("fails when a Reddit queue target already has a posted ledger action", () => {
  const markdown = `
### 1. Reddit - Already Posted

Target: \`https://www.reddit.com/r/beginnerrunning/comments/1q6ux3g/how_do_you_stop_running_too_fast_looking_for_a/\`
`;
  const ledger = {
    actions: [
      {
        date: "2026-06-12",
        platform: "reddit",
        status: "posted",
        url: "https://www.reddit.com/r/beginnerrunning/comments/1q6ux3g/how_do_you_stop_running_too_fast_looking_for_a/oraljb8/",
      },
    ],
  };
  const result = preflightApprovalQueue(markdown, ledger, { expectActions: 1 });
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /already has posted ledger action/);
});

test("ignores historical duplicate URLs outside the active Queue section", () => {
  const markdown = `
## Why v2 Exists

- https://www.reddit.com/r/beginnerrunning/comments/1q6ux3g/how_do_you_stop_running_too_fast_looking_for_a/

## Queue

### 1. Reddit - Fresh Target

Target: \`https://www.reddit.com/r/beginnerrunning/comments/1eg458h/a_running_app_with_heart_rate_zones_audio_cues/\`

## Outcome

- Public posts/comments/likes/follows made: 0.
`;
  assert.match(queueSection(markdown), /Fresh Target/);
  assert.doesNotMatch(queueSection(markdown), /1q6ux3g/);

  const ledger = {
    actions: [
      {
        date: "2026-06-12",
        platform: "reddit",
        status: "posted",
        url: "https://www.reddit.com/r/beginnerrunning/comments/1q6ux3g/how_do_you_stop_running_too_fast_looking_for_a/oraljb8/",
      },
    ],
  };
  const result = preflightApprovalQueue(markdown, ledger, { expectActions: 1 });
  assert.equal(result.ok, true);
});

test("fails when a Coachi campaign token would be truncated by production", () => {
  const markdown = `
### 1. Reddit - Link

https://coachi.no/app-store?source=reddit&campaign=reddit_generic_app_ask_20260622
`;
  const result = preflightApprovalQueue(markdown, { actions: [] }, { expectActions: 1 });
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /would be rewritten by production/);
});

test("passes a clean high-intent queue fragment", () => {
  const markdown = `
### 1. X Owned Post

https://coachi.no/app-store?source=x&campaign=x_product_proof_20260622

### 2. Reddit - App Request

Target: \`https://www.reddit.com/r/beginnerrunning/comments/1eg458h/a_running_app_with_heart_rate_zones_audio_cues/\`
https://coachi.no/app-store?source=reddit&campaign=reddit_hr_audio_cues_20260622
`;
  const result = preflightApprovalQueue(markdown, { actions: [] }, { expectActions: 2 });
  assert.equal(result.ok, true);
  assert.equal(result.action_count, 2);
  assert.equal(result.campaign_link_count, 2);
});
