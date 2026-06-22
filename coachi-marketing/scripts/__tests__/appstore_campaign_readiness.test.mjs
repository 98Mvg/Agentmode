import assert from "node:assert/strict";
import test from "node:test";

import { buildReadinessReport } from "../appstore_campaign_readiness.mjs";

test("reports ready for approval execution while provider token is still incomplete", () => {
  const report = buildReadinessReport({
    queue: "outputs/daily/queue.md",
    xPack: "content/x-posts/pack.md",
    requireProviderToken: false,
    preflight: {
      ok: true,
      action_count: 10,
      url_count: 10,
      campaign_link_count: 6,
      errors: [],
      warnings: [],
    },
    linkVerification: {
      total: 6,
      passed: 6,
      failed: 0,
      provider_token_present: 0,
    },
    commands: [
      { name: "preflight_approval_queue", ok: true, command: "node", args: [], status: 0 },
      { name: "verify_appstore_campaign_links", ok: true, command: "node", args: [], status: 0 },
      { name: "validate_x_pack", ok: true, command: "python3", args: [], status: 0 },
    ],
  });

  assert.equal(report.ready_for_approval_execution, true);
  assert.equal(report.provider_token_complete, false);
  assert.match(report.next_gate, /APP_STORE_CAMPAIGN_PROVIDER_TOKEN/);
});

test("requires complete provider token coverage when requested", () => {
  const report = buildReadinessReport({
    queue: "outputs/daily/queue.md",
    xPack: "content/x-posts/pack.md",
    requireProviderToken: true,
    preflight: {
      ok: true,
      action_count: 10,
      url_count: 10,
      campaign_link_count: 6,
      errors: [],
      warnings: [],
    },
    linkVerification: {
      total: 6,
      passed: 6,
      failed: 0,
      provider_token_present: 0,
    },
    commands: [
      { name: "preflight_approval_queue", ok: true, command: "node", args: [], status: 0 },
      { name: "verify_appstore_campaign_links", ok: true, command: "node", args: [], status: 0 },
      { name: "validate_x_pack", ok: true, command: "python3", args: [], status: 0 },
    ],
  });

  assert.equal(report.ready_for_approval_execution, false);
  assert.equal(report.provider_token_complete, false);
});
