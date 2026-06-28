# 2026-06-25 Download Engagement Refresh

Status: no public actions taken. No posts, comments, likes, follows, profile edits, or ledger rows were added during this refresh.

Goal: continue the Chrome-led engagement loop toward `10,000` App Store downloads while preserving the single-tab constraint and the approval gate for every public action.

Timestamp: `2026-06-25 00:06 CEST`

## Quick Repo Recon

High-level tree, trimmed to active marketing paths:

```text
.
├── AGENTS.md
├── Codebase_guide.MD
├── package.json
├── content/
│   ├── ads/
│   ├── email/
│   ├── Instagram/
│   ├── Reddit/
│   ├── Tiktok/
│   ├── video/
│   └── x-posts/
├── inputs/
│   ├── notes/
│   ├── performance/
│   ├── prompts/
│   └── research/
├── outputs/
│   ├── daily/
│   ├── full-loop/
│   ├── live-tests/
│   └── social-loop/
├── scripts/
│   └── __tests__/
├── strategy/
└── tasks/
```

Stack:
- Node.js ESM scripts for growth, verification, slideshow generation, and logging.
- Python utilities for media/upload workflows.
- Markdown and JSON artifacts for strategy, queues, run notes, scorecards, and ledgers.
- Live execution uses Chrome/browser sessions only after exact approval for external side effects.

Runtime entry points:
- `npm run growth:engagement-candidates` -> `scripts/build_engagement_candidates.mjs`
- `npm run growth:preflight-approval-queue` -> `scripts/preflight_approval_queue.mjs`
- `npm run growth:verify-appstore-links` -> `scripts/verify_appstore_campaign_links.mjs`
- `npm run growth:appstore-readiness` -> `scripts/appstore_campaign_readiness.mjs`
- `npm run growth:log-engagement` -> `scripts/log_engagement_action.mjs`
- `npm run growth:log-appstore-result` -> `scripts/log_appstore_campaign_result.mjs`
- `npm run growth:loop` -> `scripts/coachi_growth_loop_4h.sh`

Request path:
1. User requests download-growth engagement.
2. `AGENTS.md` and channel skills define public-action safety, channel rules, and canonical workspace.
3. Candidate engine ranks safe targets from current strategy and ledger cooldowns.
4. Approval queue stores exact text, target, reason, and execution gate.
5. Chrome executes only approved public actions in a single tab.
6. Verified public actions are logged into `inputs/performance/engagement-ledger.json`.

Event path:
1. Public action creates traffic to a Coachi-owned App Store campaign URL when earned.
2. Link verifier confirms redirect tokens before execution.
3. Real click/install metrics must come from PostHog and App Store Connect.
4. `growth:log-appstore-result` appends measured rows only after real baseline/interval data exists.
5. Scorecards and winner/language banks feed the next loop.

Top relevant files for this loop:
- `AGENTS.md`: operating rules, channel policy, and canonical workspace.
- `Codebase_guide.MD`: session memory and operational lessons.
- `package.json`: growth script entry points.
- `scripts/build_engagement_candidates.mjs`: ranked candidate queue and duplicate suppression.
- `scripts/preflight_approval_queue.mjs`: approval-queue safety gate.
- `scripts/verify_appstore_campaign_links.mjs`: App Store campaign redirect verification.
- `scripts/appstore_campaign_readiness.mjs`: combined pre-posting readiness gate.
- `scripts/log_engagement_action.mjs`: public action ledger append with cooldown dedupe.
- `scripts/log_appstore_campaign_result.mjs`: measured App Store/PostHog result logging.
- `inputs/performance/engagement-ledger.json`: current public-action history and cooldown source.

## Business Goal And Flows

Coachi is a mobile-first AI running coach for beginner and intermediate runners who use iPhone and Apple Watch and want live guidance, not just post-run charts. The current business goal is to push toward `10,000` App Store downloads by converting owned-profile traffic, app-discovery surfaces, and earned runner conversations into measurable App Store campaign clicks and installs.

Core user flow for this loop:
1. Runner sees a useful reply, profile, or app-discovery post.
2. The message frames Coachi as an AI coach that helps control effort during the run.
3. If context earns it, the runner clicks a Coachi-owned App Store campaign URL.
4. The redirect sends them to the App Store with `ct` and `mt=8`.
5. PostHog/App Store Connect metrics are measured before any result row is logged.

## Architecture Map

Frontend/content:
- Drafts and public copy live under `content/`, `outputs/daily/`, and channel strategy docs.
- No marketing frontend runtime is changed in this loop.

Backend/scripts:
- Growth scripts are local Node ESM CLIs.
- Candidate generation reads strategy seeds plus `inputs/performance/engagement-ledger.json`.
- Queue preflight prevents duplicate target reuse and malformed campaign tokens.

Data:
- `inputs/performance/engagement-ledger.json`: posted social actions.
- `inputs/performance/2026-06-24-scorecard.md`: latest scorecard.
- `outputs/daily/*readiness.json`: readiness artifacts.
- `outputs/daily/*link-verification.json`: campaign redirect checks.
- `inputs/performance/appstore-campaign-results.json`: intentionally absent until real metrics exist.

Integrations:
- Chrome: live signed-in execution path, one tab only for this goal.
- Reddit/TikTok/Instagram/X: public engagement surfaces, all approval-gated.
- Coachi `/app-store`: owned redirect into the App Store.
- PostHog/App Store Connect: required measurement sources for install proof.

Environments:
- Local repo generates queues and verification artifacts.
- Live browser sessions execute only after exact approval.
- Production app redirect must include valid campaign tokens; Apple provider token remains incomplete until `APP_STORE_CAMPAIGN_PROVIDER_TOKEN` is set in production.

## Current State

Existing approval-ready queue:
- `outputs/daily/2026-06-24-post-execution-continuation-approval-queue.md`

Ready but not posted:
- Reddit `r/AppleWatchApps` self-promotion post.
- Title: `[iOS] Coachi - AI run coach with live cues for Apple Watch runners`
- Campaign link: `https://coachi.no/app-store?source=reddit&campaign=reddit_applewatchapps_20260624`
- Last Chrome state: same single tab, account `AlarmingTradition961`, `Health & Fitness` flair attached, submit enabled.
- Gate: needs exact action-time approval and immediate post URL verification before ledger logging.

Also queued:
- TikTok inbound reply to `Chris.bfd`, no link, only if the Coachi/Everyday Runner Lab signed-in state is visible.

Posted and verified from the prior approved batch:
- X profile App Store campaign URL.
- Instagram bio App Store copy.
- Reddit no-link Zone 2 reply.
- Reddit `r/iOSApps` App Shelf comment with App Store campaign link.

No download movement is proven yet.

## June 25 Candidate Refresh

Generated:
- `outputs/daily/2026-06-25-engagement-candidates.json`
- Command: `npm run growth:engagement-candidates -- --date 2026-06-25 --mode stretch --platform all --out outputs/daily/2026-06-25-engagement-candidates.json`
- Result: `34` queued candidates, `2` duplicate suppressions.

Top ranked queued candidates:
1. Reddit `easy day too fast`: no-promo reply, easy-run pace drift.
2. Reddit `c25k pace too fast`: no-promo reply, beginner uncertainty.
3. Reddit `marathon easy run drift`: no-promo reply, easy-run pace drift.
4. Reddit own-thread follow-up: no-promo follow-up, only if live comments exist.
5. Reddit Zone 2 discussion post: no link, discussion only.
6. TikTok `easy run mistakes`: comment candidate, requires live post inspection.
7. Instagram `easy run reels`: comment candidate, requires live post inspection.
8. TikTok `beginner runner journey`: like/follow candidate, requires signed-in state.
9. TikTok `marathon training tips`: larger-video comment candidate.
10. X `AI builder founder journey`: reply candidate, blocked by prior `x.com/account/access` until cleared.

Suppressed duplicates:
- Reddit `easy run feels too hard`, blocked by a posted June 12 Reddit reply within cooldown.
- TikTok `beginner runner tips`, blocked by a posted June 12 TikTok comment within cooldown.

## Risk List

1. Download proof gap: no real PostHog/App Store Connect metrics have been logged, and `inputs/performance/appstore-campaign-results.json` does not exist yet.
2. Apple provider token gap: campaign redirects preserve `ct` and `mt=8`, but Apple `pt` remains absent until production has `APP_STORE_CAMPAIGN_PROVIDER_TOKEN`.
3. Public-action safety: `r/AppleWatchApps` is technically ready but still must not be submitted without exact approval.
4. Reddit moderation/filter risk: prior Reddit filters/rate limits make a second direct Reddit App Store link in the same window higher risk.
5. Browser-state risk: the prepared Chrome tab is valuable; avoid navigation away from the draft.
6. TikTok auth risk: TikTok previously showed logged-out shell, so any reply must begin with a visible signed-in check.
7. X access risk: public X posting previously redirected to `x.com/account/access`; avoid queued X actions until the challenge is cleared.
8. Duplicate fatigue: repeated beginner/easy-run comments are suppressed by ledger cooldown; keep relying on `scripts/build_engagement_candidates.mjs`.
9. Measurement contamination: dry-run zero baselines must not be written as real campaign results.
10. Over-promotion risk: keep Reddit to at most one direct link unless the user explicitly accepts the tradeoff.

## Phase Decisions

Phase 1, no-code analysis:
- Re-read operating rules and current artifacts.
- Confirmed the product goal, user flow, architecture map, request path, event path, and top risks above.

Phase 2, highest-impact fixes/mitigations:
- Rebuilt the June 25 candidate queue from the live ledger to avoid stale duplicate actions.
- Kept the AppleWatchApps post in an approval-gated queue instead of treating the prior broad approval as reusable.
- Preserved the measurement gate: no real campaign result row is allowed without PostHog/App Store Connect values.

Phase 3, optimization:
- Best ROI now is not more queued comments; it is converting the already-prepared high-intent AppleWatchApps action after exact approval.
- Second-best ROI is resolving the Apple provider token so App Store Connect campaign attribution is complete.
- Third-best ROI is clearing X account access, then replacing raw/profile traffic with measurable App Store campaign traffic.

## Next Approval Gate

Exact public action that can move the download goal:

Submit the prepared Reddit `r/AppleWatchApps` post from the existing single Chrome tab as account `AlarmingTradition961`, only if `Health & Fitness` remains attached and the submit button is enabled. After submission, capture the resulting post URL, verify it is live, and then add exactly one ledger row for `reddit_applewatchapps_20260624`.

No action was taken during this refresh.

## Chrome Recheck (2026-06-25 00:10 CEST)

Chrome was used read-only and kept to the existing single tab. No new tabs were opened, no navigation happened, and no public submit action was taken.

Observed tab:
- Title: `AppleWatchApps: submit`
- URL: `https://old.reddit.com/r/AppleWatchApps/submit?selftext=true`
- Account signal: `AlarmingTradition961`
- Subreddit field: `AppleWatchApps`
- Title field: `[iOS] Coachi - AI run coach with live cues for Apple Watch runners`
- Body field: still contains the full Coachi draft and `https://coachi.no/app-store?source=reddit&campaign=reddit_applewatchapps_20260624`
- Hidden `flair_id`: `234b9c4e-6a13-11f0-918e-22cfc006f4d6`
- Hidden `flair_template_id`: `234b9c4e-6a13-11f0-918e-22cfc006f4d6`
- Visible public submit button: enabled
- Stale validation text still present: `Your post must contain post flair.`

Interpretation:
- The high-intent AppleWatchApps action remains technically executable.
- The stale validation text means post-submit verification is mandatory if the user approves.
- The next browser action would transmit a public Reddit post, so it requires exact action-time confirmation before clicking `submit`.

## Chrome Recheck (2026-06-25 00:29 CEST)

Chrome was used read-only again and kept to the existing single tab. No new tabs were opened, no navigation happened, and no public submit action was taken. The tab was finalized as a handoff.

Observed tab:
- Title: `AppleWatchApps: submit`
- URL: `https://old.reddit.com/r/AppleWatchApps/submit?selftext=true`
- Account signal: `AlarmingTradition961`
- Subreddit field: `AppleWatchApps`
- Title field: `[iOS] Coachi - AI run coach with live cues for Apple Watch runners`
- Body field: still contains the full Coachi draft and `https://coachi.no/app-store?source=reddit&campaign=reddit_applewatchapps_20260624`
- Hidden `flair_id`: `234b9c4e-6a13-11f0-918e-22cfc006f4d6`
- Hidden `flair_template_id`: `234b9c4e-6a13-11f0-918e-22cfc006f4d6`
- Visible public submit button: enabled
- Stale validation text still present: `Your post must contain post flair.`

Interpretation:
- The AppleWatchApps action is still technically executable from the prepared tab.
- The next browser action would publish a public Reddit post with an App Store campaign link, so it still needs exact action-time approval before clicking `submit`.
- If approved, the resulting Reddit post URL must pass `npm run growth:verify-reddit-post` before adding a ledger row.

Verification after this recheck:
- `npm run growth:appstore-readiness -- --queue outputs/daily/2026-06-24-post-execution-continuation-approval-queue.md --expect-actions 2 --preflight-out outputs/daily/2026-06-24-post-execution-continuation-preflight.json --link-out outputs/daily/2026-06-24-post-execution-continuation-link-verification.json --out outputs/daily/2026-06-24-post-execution-continuation-readiness.json` passed; readiness is `yes`, provider token complete is `no`.
- `npm run growth:verify-appstore-links -- --input outputs/daily/2026-06-25-action-time-approval-packet.md --out outputs/daily/2026-06-25-action-time-approval-packet-link-verification.json` passed `1/1`; redirect preserves `ct=reddit_applewatchapps_20260624&mt=8`, with no `pt`.
- `npm run growth:appstore-goal-status -- --goal 10000 --readiness outputs/daily/2026-06-24-post-execution-continuation-readiness.json --out outputs/daily/2026-06-25-appstore-goal-status.json` reports `achieved: false` because verified App Store total downloads are missing.
- Focused tests passed `23/23`: `node --test scripts/__tests__/appstore_download_sprint_report.test.mjs scripts/__tests__/appstore_download_goal_status.test.mjs scripts/__tests__/verify_reddit_post_submission.test.mjs scripts/__tests__/preflight_approval_queue.test.mjs scripts/__tests__/engagement_candidate_engine.test.mjs scripts/__tests__/appstore_campaign_readiness.test.mjs scripts/__tests__/log_appstore_campaign_result.test.mjs`.

## Chrome Recheck (2026-06-25 00:34 CEST)

Chrome was used read-only again and kept to the existing single tab. No new tabs were opened, no navigation happened, and no public submit action was taken. The tab was finalized as a handoff.

Observed tab:
- Title: `AppleWatchApps: submit`
- URL: `https://old.reddit.com/r/AppleWatchApps/submit?selftext=true`
- Account signal: `AlarmingTradition961`
- Subreddit field: `AppleWatchApps`
- Title field: `[iOS] Coachi - AI run coach with live cues for Apple Watch runners`
- Body length: `852`
- Body field still contains `https://coachi.no/app-store?source=reddit&campaign=reddit_applewatchapps_20260624`
- Hidden `flair_id`: `234b9c4e-6a13-11f0-918e-22cfc006f4d6`
- Hidden `flair_template_id`: `234b9c4e-6a13-11f0-918e-22cfc006f4d6`
- Visible public submit button: enabled
- Stale validation text still present: `Your post must contain post flair.`

Interpretation:
- The AppleWatchApps action is still technically executable from the prepared tab.
- It remains a public Reddit post with a direct App Store campaign link, so it still needs exact action-time approval before clicking `submit`.
- If approved, the resulting Reddit post URL must pass `npm run growth:verify-reddit-post` before adding a ledger row.

## Conversion-Side Progress (2026-06-25 00:34 CEST)

Public actions taken: `0`.

Generated a live App Store conversion audit:
- `outputs/daily/2026-06-25-appstore-conversion-audit.md`
- JSON source: `outputs/daily/2026-06-24-appstore-listing-audit.json`
- Score: `51/100`
- Grade: `conversion_risk`
- Issues: `6`

Key findings:
- The US App Store listing has `0` visible ratings.
- The current title/subtitle are still broader than the runner-led traffic promise: `Coachi: Heart Rate Training` / `Live Voice Fitness Coach`.
- Screenshot 1 likely leads with setup instead of the live coaching promise.
- Campaign redirects still miss Apple `pt` provider-token attribution.

Created a validated App Store Connect metadata/screenshot update pack:
- `outputs/daily/2026-06-25-appstore-connect-update-pack.json`
- `outputs/daily/2026-06-25-appstore-connect-update-pack.md`

Validation:
- `npm run growth:validate-appstore-metadata -- --input outputs/daily/2026-06-25-appstore-connect-update-pack.json` passed.
- App name: `20/30`
- Subtitle: `24/30`
- Promotional text: `144/170`
- Description: `911/4000`
- Keywords: `91/100` bytes
- Screenshot sequence: `6`

This is non-public prep only. Updating App Store Connect metadata or screenshots is still an external public/business action and needs explicit execution approval outside this run.

Verification after this continuation:
- `npm run growth:engagement-candidates -- --date 2026-06-25 --mode stretch --platform all --out outputs/daily/2026-06-25-engagement-candidates.json` passed with `34` queued candidates and `2` duplicate suppressions.
- `npm run growth:appstore-readiness -- --queue outputs/daily/2026-06-24-post-execution-continuation-approval-queue.md --expect-actions 2 --preflight-out outputs/daily/2026-06-24-post-execution-continuation-preflight.json --link-out outputs/daily/2026-06-24-post-execution-continuation-link-verification.json --out outputs/daily/2026-06-24-post-execution-continuation-readiness.json` passed; readiness is `yes`, provider token complete is `no`.
- `npm run growth:appstore-goal-status -- --goal 10000 --readiness outputs/daily/2026-06-24-post-execution-continuation-readiness.json --out outputs/daily/2026-06-25-appstore-goal-status.json` reports `achieved: false` because verified App Store total downloads are missing.
- `npm run growth:verify-appstore-links -- --input outputs/daily/2026-06-25-action-time-approval-packet.md --out outputs/daily/2026-06-25-action-time-approval-packet-link-verification.json` passed `1/1`; redirect preserves `ct=reddit_applewatchapps_20260624&mt=8`, with no `pt`.
- `npm run growth:validate-appstore-metadata -- --input outputs/daily/2026-06-25-appstore-connect-update-pack.json` passed.
- Focused tests passed `32/32`: `node --test scripts/__tests__/appstore_download_sprint_report.test.mjs scripts/__tests__/appstore_download_goal_status.test.mjs scripts/__tests__/verify_reddit_post_submission.test.mjs scripts/__tests__/preflight_approval_queue.test.mjs scripts/__tests__/engagement_candidate_engine.test.mjs scripts/__tests__/appstore_campaign_readiness.test.mjs scripts/__tests__/log_appstore_campaign_result.test.mjs scripts/__tests__/validate_appstore_metadata_pack.test.mjs scripts/__tests__/audit_appstore_listing.test.mjs`.

## Chrome Recheck (2026-06-25 00:42 CEST)

Chrome was used read-only again and kept to the existing single tab. No new tabs were opened, no navigation happened, and no public submit action was taken. The tab was finalized as a handoff.

Observed tab:
- Title: `AppleWatchApps: submit`
- URL: `https://old.reddit.com/r/AppleWatchApps/submit?selftext=true`
- Account signal: `AlarmingTradition961`
- Subreddit field: `AppleWatchApps`
- Title field: `[iOS] Coachi - AI run coach with live cues for Apple Watch runners`
- Body length: `852`
- Body field still contains campaign `reddit_applewatchapps_20260624`
- Hidden `flair_id`: `234b9c4e-6a13-11f0-918e-22cfc006f4d6`
- Hidden `flair_template_id`: `234b9c4e-6a13-11f0-918e-22cfc006f4d6`
- Visible public submit button: enabled
- Stale validation text still present: `Your post must contain post flair.`

Sprint-report tooling improvement:
- Updated `scripts/appstore_download_sprint_report.mjs` so `npm run growth:download-sprint-report` preserves Browser Handoff and Conversion Readiness sections from structured artifacts.
- Updated `scripts/__tests__/appstore_download_sprint_report.test.mjs` to cover conversion score, ratings, prepared metadata lengths, top risks, browser handoff timestamp, and the strict no-completion gate.
- Regenerated `outputs/daily/2026-06-25-download-sprint-report.md`; it now includes readiness, approval sentence, browser handoff, conversion audit score, metadata pack summary, and candidate queue.

Verification after this tooling update:
- `npm run growth:appstore-readiness -- --queue outputs/daily/2026-06-24-post-execution-continuation-approval-queue.md --expect-actions 2 --preflight-out outputs/daily/2026-06-24-post-execution-continuation-preflight.json --link-out outputs/daily/2026-06-24-post-execution-continuation-link-verification.json --out outputs/daily/2026-06-24-post-execution-continuation-readiness.json` passed; readiness is `yes`, provider token complete is `no`.
- `npm run growth:appstore-goal-status -- --goal 10000 --readiness outputs/daily/2026-06-24-post-execution-continuation-readiness.json --out outputs/daily/2026-06-25-appstore-goal-status.json` reports `achieved: false`, `verified_total_downloads: null`, and last ledger action still `reddit_iosapps_app_shelf_20260624`.
- `npm run growth:verify-appstore-links -- --input outputs/daily/2026-06-25-action-time-approval-packet.md --out outputs/daily/2026-06-25-action-time-approval-packet-link-verification.json` passed `1/1`; redirect preserves `ct=reddit_applewatchapps_20260624&mt=8`, with no `pt`.
- `npm run growth:validate-appstore-metadata -- --input outputs/daily/2026-06-25-appstore-connect-update-pack.json` passed.
- Focused tests passed `32/32`: `node --test scripts/__tests__/appstore_download_sprint_report.test.mjs scripts/__tests__/appstore_download_goal_status.test.mjs scripts/__tests__/verify_reddit_post_submission.test.mjs scripts/__tests__/preflight_approval_queue.test.mjs scripts/__tests__/engagement_candidate_engine.test.mjs scripts/__tests__/appstore_campaign_readiness.test.mjs scripts/__tests__/log_appstore_campaign_result.test.mjs scripts/__tests__/validate_appstore_metadata_pack.test.mjs scripts/__tests__/audit_appstore_listing.test.mjs`.

## Chrome Handoff Finalization (2026-06-25 00:47 CEST)

The single existing Chrome tab was finalized as a handoff after the read-only draft check. No new tabs were opened, no navigation happened, and no public submit action was taken.

Latest known tab state:
- Title: `AppleWatchApps: submit`
- URL: `https://old.reddit.com/r/AppleWatchApps/submit?selftext=true`
- Account signal: `AlarmingTradition961`
- Subreddit field: `AppleWatchApps`
- Title field: `[iOS] Coachi - AI run coach with live cues for Apple Watch runners`
- Body length: `852`
- Body field still contains campaign `reddit_applewatchapps_20260624`
- Hidden `flair_id`: `234b9c4e-6a13-11f0-918e-22cfc006f4d6`
- Hidden `flair_template_id`: `234b9c4e-6a13-11f0-918e-22cfc006f4d6`
- Visible public submit button: enabled
- Stale validation text still present: `Your post must contain post flair.`

## Provider-Token Attribution Handoff (2026-06-25 00:47 CEST)

Created `outputs/daily/2026-06-25-provider-token-deployment-handoff.md` to close the remaining App Store Connect attribution gap without storing provider-token values in the marketing repo.

Current state:
- Production campaign links preserve `ct` and `mt=8`.
- Production campaign links still omit Apple `pt`, so readiness continues to report `provider_token_complete: false`.
- The app runtime at `/Users/mariusgaarder/Documents/treningscoach` already supports provider tokens through `APP_STORE_CAMPAIGN_PROVIDER_TOKEN`, `APP_STORE_PROVIDER_TOKEN`, or a `pt=` query fallback.

Next no-secret deployment step:
- Use `/Users/mariusgaarder/Documents/treningscoach/scripts/app_store_campaign_env_from_link.py` with an App Store Connect campaign link that contains `pt=...&ct=...&mt=8`.
- Set the printed Render env values, deploy/restart Coachi web, run the app smoke with `--require-provider-token`, then rerun marketing verification with `growth:verify-appstore-links -- --require-provider-token`.
- Do not commit the provider-token value to any repo artifact.

Verification after this handoff:
- `npm run growth:appstore-readiness -- --queue outputs/daily/2026-06-24-post-execution-continuation-approval-queue.md --expect-actions 2 --preflight-out outputs/daily/2026-06-24-post-execution-continuation-preflight.json --link-out outputs/daily/2026-06-24-post-execution-continuation-link-verification.json --out outputs/daily/2026-06-24-post-execution-continuation-readiness.json` passed; readiness is `yes`, provider token complete is `no`.
- `npm run growth:appstore-goal-status -- --goal 10000 --readiness outputs/daily/2026-06-24-post-execution-continuation-readiness.json --out outputs/daily/2026-06-25-appstore-goal-status.json` reports `achieved: false`, `verified_total_downloads: null`, and no real App Store result entries.
- `npm run growth:verify-appstore-links -- --input outputs/daily/2026-06-25-action-time-approval-packet.md --out outputs/daily/2026-06-25-action-time-approval-packet-link-verification.json` passed `1/1`; redirect still has no `pt`.
- `npm run growth:validate-appstore-metadata -- --input outputs/daily/2026-06-25-appstore-connect-update-pack.json` passed.
- `npm run growth:download-sprint-report -- --out outputs/daily/2026-06-25-download-sprint-report.md` regenerated the report with the provider-token handoff.
- Focused tests passed `32/32`: `node --test scripts/__tests__/appstore_download_sprint_report.test.mjs scripts/__tests__/appstore_download_goal_status.test.mjs scripts/__tests__/verify_reddit_post_submission.test.mjs scripts/__tests__/preflight_approval_queue.test.mjs scripts/__tests__/engagement_candidate_engine.test.mjs scripts/__tests__/appstore_campaign_readiness.test.mjs scripts/__tests__/log_appstore_campaign_result.test.mjs scripts/__tests__/validate_appstore_metadata_pack.test.mjs scripts/__tests__/audit_appstore_listing.test.mjs`.

## Provider-Token Artifact Redaction (2026-06-25 00:56 CEST)

Hardened `scripts/verify_appstore_campaign_links.mjs` so the provider-token deployment can be verified without leaking Apple `pt` values into marketing artifacts.

Behavior:
- The verifier still reads the raw redirect URL and sets `provider_token_present` from the real `pt` parameter.
- Before returning results, printing console output, or writing JSON, the verifier replaces `pt=<value>` with `pt=REDACTED`.
- It also redacts `pt` when a source URL uses the `pt=` query fallback.

Added regression coverage:
- `scripts/__tests__/verify_appstore_campaign_links.test.mjs`
- Direct `redactSensitiveUrl` test.
- Local redirect test proving `verifyUrl` reports `provider_token_present: true` while omitting raw provider-token values from serialized output.

Verification after this redaction update:
- `node --test scripts/__tests__/verify_appstore_campaign_links.test.mjs` passed `2/2`.
- Full focused suite passed `34/34`: `node --test scripts/__tests__/verify_appstore_campaign_links.test.mjs scripts/__tests__/appstore_download_sprint_report.test.mjs scripts/__tests__/appstore_download_goal_status.test.mjs scripts/__tests__/verify_reddit_post_submission.test.mjs scripts/__tests__/preflight_approval_queue.test.mjs scripts/__tests__/engagement_candidate_engine.test.mjs scripts/__tests__/appstore_campaign_readiness.test.mjs scripts/__tests__/log_appstore_campaign_result.test.mjs scripts/__tests__/validate_appstore_metadata_pack.test.mjs scripts/__tests__/audit_appstore_listing.test.mjs`.
- `npm run growth:verify-appstore-links -- --input outputs/daily/2026-06-25-action-time-approval-packet.md --out outputs/daily/2026-06-25-action-time-approval-packet-link-verification.json` passed `1/1`; production still has no `pt`.
- `npm run growth:appstore-readiness -- --queue outputs/daily/2026-06-24-post-execution-continuation-approval-queue.md --expect-actions 2 --preflight-out outputs/daily/2026-06-24-post-execution-continuation-preflight.json --link-out outputs/daily/2026-06-24-post-execution-continuation-link-verification.json --out outputs/daily/2026-06-24-post-execution-continuation-readiness.json` passed; readiness remains `yes`, provider token complete remains `no`.
- `npm run growth:appstore-goal-status -- --goal 10000 --readiness outputs/daily/2026-06-24-post-execution-continuation-readiness.json --out outputs/daily/2026-06-25-appstore-goal-status.json` reports `achieved: false`.
- `npm run growth:download-sprint-report -- --out outputs/daily/2026-06-25-download-sprint-report.md` regenerated the report with the redaction note.

No public action, Chrome navigation, ledger row, App Store result row, profile edit, viral storagebag append, or hook-bank mutation was made.

## Chrome Recheck And CSV Measurement Import (2026-06-25 01:02 CEST)

Chrome was used read-only and kept to the existing single tab. No new tabs were opened, no navigation happened, and no public submit action was taken. The tab was finalized as a handoff.

Observed tab:
- Title: `AppleWatchApps: submit`
- URL: `https://old.reddit.com/r/AppleWatchApps/submit?selftext=true`
- Account signal includes `AlarmingTradition961`
- Subreddit field: `AppleWatchApps`
- Title field: `[iOS] Coachi - AI run coach with live cues for Apple Watch runners`
- Body length: `852`
- Body contains `https://coachi.no/app-store?source=reddit&campaign=reddit_applewatchapps_20260624`
- Hidden `flair_id`: `234b9c4e-6a13-11f0-918e-22cfc006f4d6`
- Hidden `flair_template_id`: `234b9c4e-6a13-11f0-918e-22cfc006f4d6`
- Visible selected flair: `Health & Fitness`
- Public submit button: enabled
- Stale validation text still present: `Your post must contain post flair.`

Measurement-path improvement:
- Added App Store Connect CSV import support to `scripts/log_appstore_campaign_result.mjs` via `--app-store-csv` / `--app-store-connect-csv`.
- The importer matches exactly one row by campaign token, imports product-page views and first-time downloads when present, imports total downloads only from explicit total-download columns, and sets `campaign-rows-visible` to `true`.
- Explicit CLI values still override imported CSV values, so manual corrections remain possible.
- Updated the action-time approval packet with the CSV import command for the `24h`, `48h`, and `7d` measurement windows.

Verification after this update:
- Full focused suite passed `37/37`: `node --test scripts/__tests__/verify_appstore_campaign_links.test.mjs scripts/__tests__/appstore_download_sprint_report.test.mjs scripts/__tests__/appstore_download_goal_status.test.mjs scripts/__tests__/verify_reddit_post_submission.test.mjs scripts/__tests__/preflight_approval_queue.test.mjs scripts/__tests__/engagement_candidate_engine.test.mjs scripts/__tests__/appstore_campaign_readiness.test.mjs scripts/__tests__/log_appstore_campaign_result.test.mjs scripts/__tests__/validate_appstore_metadata_pack.test.mjs scripts/__tests__/audit_appstore_listing.test.mjs`.
- `npm run growth:verify-appstore-links -- --input outputs/daily/2026-06-25-action-time-approval-packet.md --out outputs/daily/2026-06-25-action-time-approval-packet-link-verification.json` passed `1/1`; production still has no `pt`.
- `npm run growth:appstore-readiness -- --queue outputs/daily/2026-06-24-post-execution-continuation-approval-queue.md --expect-actions 2 --preflight-out outputs/daily/2026-06-24-post-execution-continuation-preflight.json --link-out outputs/daily/2026-06-24-post-execution-continuation-link-verification.json --out outputs/daily/2026-06-24-post-execution-continuation-readiness.json` passed; readiness remains `yes`, provider token complete remains `no`.
- `npm run growth:appstore-goal-status -- --goal 10000 --readiness outputs/daily/2026-06-24-post-execution-continuation-readiness.json --out outputs/daily/2026-06-25-appstore-goal-status.json` reports `achieved: false`, `verified_total_downloads: null`.
- `npm run growth:validate-appstore-metadata -- --input outputs/daily/2026-06-25-appstore-connect-update-pack.json` passed.
- `npm run growth:download-sprint-report -- --out outputs/daily/2026-06-25-download-sprint-report.md` regenerated the report with latest Chrome timestamp and CSV import note.

No public action, engagement ledger row, App Store result row, profile edit, viral storagebag append, or hook-bank mutation was made.

## All 2h Measurement Windows Due (2026-06-25 01:33 CEST)

Public actions taken in this continuation: `0`.

Regenerated measurement artifacts after the `reddit_iosapps_20260624` 2h threshold crossed:
- `outputs/daily/2026-06-25-appstore-measurement-queue.md`
- `outputs/daily/2026-06-25-appstore-measurement-queue.json`
- `outputs/daily/2026-06-25-download-sprint-report.md`

Current queue state:
- Posted direct-install campaigns: `3`
- Pending approval campaigns: `1`
- Measurement windows due now: `3`
- Due 2h windows:
  - `x_profile_20260624`
  - `instagram_bio_20260622`
  - `reddit_iosapps_20260624`
- Next scheduled measurement:
  - `x_profile_20260624` `24h` at `2026-06-25 23:24:05 CEST`

Required next measurement work:
- Pull real `app_store_click` counts from PostHog for each campaign.
- Export App Store Connect campaign rows and use `growth:log-appstore-result -- --app-store-csv <csv>`.
- Do not write result rows from placeholders or clicks-only values.

Verification after this update:
- `npm run growth:appstore-measurement-queue -- --json-out outputs/daily/2026-06-25-appstore-measurement-queue.json --out outputs/daily/2026-06-25-appstore-measurement-queue.md` passed; due windows now `3`.
- `npm run growth:download-sprint-report -- --out outputs/daily/2026-06-25-download-sprint-report.md` regenerated the sprint report with due windows.
- `npm run growth:appstore-goal-status -- --goal 10000 --readiness outputs/daily/2026-06-24-post-execution-continuation-readiness.json --out outputs/daily/2026-06-25-appstore-goal-status.json` reports `achieved: false`, `verified_total_downloads: null`, and no App Store result entries.
- `npm run growth:verify-appstore-links -- --input outputs/daily/2026-06-25-action-time-approval-packet.md --out outputs/daily/2026-06-25-action-time-approval-packet-link-verification.json` passed `1/1`; production still has no `pt`.
- `npm run growth:appstore-readiness -- --queue outputs/daily/2026-06-24-post-execution-continuation-approval-queue.md --expect-actions 2 --preflight-out outputs/daily/2026-06-24-post-execution-continuation-preflight.json --link-out outputs/daily/2026-06-24-post-execution-continuation-link-verification.json --out outputs/daily/2026-06-24-post-execution-continuation-readiness.json` passed; readiness remains `yes`, provider token complete remains `no`.
- Focused tests passed `29/29`: `node --test scripts/__tests__/verify_appstore_campaign_links.test.mjs scripts/__tests__/appstore_download_sprint_report.test.mjs scripts/__tests__/appstore_measurement_queue.test.mjs scripts/__tests__/log_appstore_campaign_result.test.mjs scripts/__tests__/appstore_download_goal_status.test.mjs scripts/__tests__/appstore_campaign_readiness.test.mjs scripts/__tests__/verify_reddit_post_submission.test.mjs scripts/__tests__/preflight_approval_queue.test.mjs`.

No public action, Chrome navigation, engagement ledger row, App Store result row, profile edit, viral storagebag append, or hook-bank mutation was made.

## Posted Campaign Measurement Queue (2026-06-25 01:20 CEST)

Public actions taken in this continuation: `0`.

Added a no-write App Store measurement queue generator:
- `scripts/build_appstore_measurement_queue.mjs`
- npm alias: `growth:appstore-measurement-queue`
- tests: `scripts/__tests__/appstore_measurement_queue.test.mjs`

Generated artifacts:
- `outputs/daily/2026-06-25-appstore-measurement-queue.md`
- `outputs/daily/2026-06-25-appstore-measurement-queue.json`

Current measurement queue:
- Posted direct-install campaigns found since `2026-06-22T00:00:00.000Z`: `3`
- Pending approval campaigns: `1`
- Posted campaigns to measure:
  - `x_profile_20260624`
  - `instagram_bio_20260622`
  - `reddit_iosapps_20260624`
- Pending approval campaign:
  - `reddit_applewatchapps_20260624`
- Next 2h measurement due: `2026-06-24T23:24:05.774Z`

Implementation guard:
- The queue intentionally ignores stale ledger actions before `2026-06-22T00:00:00.000Z`, which prevents old same-subreddit AppleWatchApps comments from being mistaken for the current pending `reddit_applewatchapps_20260624` campaign.
- The queue only produces PostHog/App Store Connect collection commands. It does not write `inputs/performance/appstore-campaign-results.json`.

Sprint report update:
- `scripts/appstore_download_sprint_report.mjs` now includes the measurement queue summary.
- `outputs/daily/2026-06-25-download-sprint-report.md` now shows posted campaigns to measure and the pending AppleWatchApps approval campaign.

Verification after this update:
- Focused tests passed `41/41`: `node --test scripts/__tests__/verify_appstore_campaign_links.test.mjs scripts/__tests__/appstore_download_sprint_report.test.mjs scripts/__tests__/appstore_download_goal_status.test.mjs scripts/__tests__/verify_reddit_post_submission.test.mjs scripts/__tests__/preflight_approval_queue.test.mjs scripts/__tests__/engagement_candidate_engine.test.mjs scripts/__tests__/appstore_campaign_readiness.test.mjs scripts/__tests__/log_appstore_campaign_result.test.mjs scripts/__tests__/validate_appstore_metadata_pack.test.mjs scripts/__tests__/audit_appstore_listing.test.mjs scripts/__tests__/appstore_measurement_queue.test.mjs`.
- `npm run growth:verify-appstore-links -- --input outputs/daily/2026-06-25-action-time-approval-packet.md --out outputs/daily/2026-06-25-action-time-approval-packet-link-verification.json` passed `1/1`; production still has no `pt`.
- `npm run growth:appstore-readiness -- --queue outputs/daily/2026-06-24-post-execution-continuation-approval-queue.md --expect-actions 2 --preflight-out outputs/daily/2026-06-24-post-execution-continuation-preflight.json --link-out outputs/daily/2026-06-24-post-execution-continuation-link-verification.json --out outputs/daily/2026-06-24-post-execution-continuation-readiness.json` passed; readiness remains `yes`, provider token complete remains `no`.
- `npm run growth:appstore-goal-status -- --goal 10000 --readiness outputs/daily/2026-06-24-post-execution-continuation-readiness.json --out outputs/daily/2026-06-25-appstore-goal-status.json` reports `achieved: false`, `verified_total_downloads: null`, and no App Store result entries.
- `npm run growth:validate-appstore-metadata -- --input outputs/daily/2026-06-25-appstore-connect-update-pack.json` passed.
- `npm run growth:appstore-measurement-queue -- --json-out outputs/daily/2026-06-25-appstore-measurement-queue.json --out outputs/daily/2026-06-25-appstore-measurement-queue.md` regenerated the measurement queue.
- `npm run growth:download-sprint-report -- --out outputs/daily/2026-06-25-download-sprint-report.md` regenerated the sprint report with the queue.

No public action, Chrome navigation, engagement ledger row, App Store result row, profile edit, viral storagebag append, or hook-bank mutation was made.

## Chrome Recheck And Due Measurement Windows (2026-06-25 01:24 CEST)

Chrome was used read-only and kept to the existing single tab. No new tabs were opened, no navigation happened, and no public submit action was taken. The tab was finalized as a handoff.

Observed tab:
- Title: `AppleWatchApps: submit`
- URL: `https://old.reddit.com/r/AppleWatchApps/submit?selftext=true`
- Account signal includes `AlarmingTradition961`
- Subreddit field: `AppleWatchApps`
- Title field: `[iOS] Coachi - AI run coach with live cues for Apple Watch runners`
- Body length: `852`
- Body contains `https://coachi.no/app-store?source=reddit&campaign=reddit_applewatchapps_20260624`
- Hidden `flair_id`: `234b9c4e-6a13-11f0-918e-22cfc006f4d6`
- Hidden `flair_template_id`: `234b9c4e-6a13-11f0-918e-22cfc006f4d6`
- Visible selected flair: `Health & Fitness`
- Public submit button: enabled
- Stale validation text still present: `Your post must contain post flair.`

Measurement queue refresh:
- Regenerated `outputs/daily/2026-06-25-appstore-measurement-queue.md`
- Regenerated `outputs/daily/2026-06-25-appstore-measurement-queue.json`
- Posted direct-install campaigns: `3`
- Pending approval campaigns: `1`
- Measurement windows due now: `2`
- Due now:
  - `x_profile_20260624` `2h`
  - `instagram_bio_20260622` `2h`
- Next measurement due:
  - `reddit_iosapps_20260624` `2h` at `2026-06-25 01:33:33 CEST`

Interpretation:
- The public-action gate remains unchanged: the next Reddit submit still needs exact approval.
- The measurement gate has moved forward: two already-posted install surfaces now need real PostHog clicks and App Store Connect export metrics before any result rows can be written.
- No `inputs/performance/appstore-campaign-results.json` row was created.

Verification after this continuation:
- `npm run growth:appstore-measurement-queue -- --json-out outputs/daily/2026-06-25-appstore-measurement-queue.json --out outputs/daily/2026-06-25-appstore-measurement-queue.md` passed; due windows now `2`.
- `npm run growth:download-sprint-report -- --out outputs/daily/2026-06-25-download-sprint-report.md` regenerated the sprint report with due windows.
- `npm run growth:appstore-goal-status -- --goal 10000 --readiness outputs/daily/2026-06-24-post-execution-continuation-readiness.json --out outputs/daily/2026-06-25-appstore-goal-status.json` reports `achieved: false`, `verified_total_downloads: null`, and no App Store result entries.
- `npm run growth:verify-appstore-links -- --input outputs/daily/2026-06-25-action-time-approval-packet.md --out outputs/daily/2026-06-25-action-time-approval-packet-link-verification.json` passed `1/1`; production still has no `pt`.
- `npm run growth:appstore-readiness -- --queue outputs/daily/2026-06-24-post-execution-continuation-approval-queue.md --expect-actions 2 --preflight-out outputs/daily/2026-06-24-post-execution-continuation-preflight.json --link-out outputs/daily/2026-06-24-post-execution-continuation-link-verification.json --out outputs/daily/2026-06-24-post-execution-continuation-readiness.json` passed; readiness remains `yes`, provider token complete remains `no`.

No public action, engagement ledger row, App Store result row, profile edit, viral storagebag append, or hook-bank mutation was made.

## Chrome Recheck And Result-Row Guard (2026-06-25 01:11 CEST)

Chrome was used read-only and kept to the existing single tab. No new tabs were opened, no navigation happened, and no public submit action was taken. The tab was finalized as a handoff.

Observed tab:
- Title: `AppleWatchApps: submit`
- URL: `https://old.reddit.com/r/AppleWatchApps/submit?selftext=true`
- Account signal includes `AlarmingTradition961`
- Subreddit field: `AppleWatchApps`
- Title field: `[iOS] Coachi - AI run coach with live cues for Apple Watch runners`
- Body length: `852`
- Body contains `https://coachi.no/app-store?source=reddit&campaign=reddit_applewatchapps_20260624`
- Hidden `flair_id`: `234b9c4e-6a13-11f0-918e-22cfc006f4d6`
- Hidden `flair_template_id`: `234b9c4e-6a13-11f0-918e-22cfc006f4d6`
- Visible selected flair: `Health & Fitness`
- Public submit button: enabled
- Stale validation text still present: `Your post must contain post flair.`

Measurement-path hardening:
- `scripts/log_appstore_campaign_result.mjs` now rejects clicks-only rows before writing or previewing an App Store campaign result.
- At least one App Store measurement field is required: `--product-page-views`, `--first-time-downloads`, `--total-downloads`, or values imported via `--app-store-csv`.
- Real zero values remain valid when they come from an actual measurement/export.
- `outputs/daily/2026-06-25-action-time-approval-packet.md` and `outputs/daily/2026-06-25-download-sprint-report.md` now document that invariant.

Verification after this update:
- Focused tests passed `38/38`: `node --test scripts/__tests__/verify_appstore_campaign_links.test.mjs scripts/__tests__/appstore_download_sprint_report.test.mjs scripts/__tests__/appstore_download_goal_status.test.mjs scripts/__tests__/verify_reddit_post_submission.test.mjs scripts/__tests__/preflight_approval_queue.test.mjs scripts/__tests__/engagement_candidate_engine.test.mjs scripts/__tests__/appstore_campaign_readiness.test.mjs scripts/__tests__/log_appstore_campaign_result.test.mjs scripts/__tests__/validate_appstore_metadata_pack.test.mjs scripts/__tests__/audit_appstore_listing.test.mjs`.
- `npm run growth:verify-appstore-links -- --input outputs/daily/2026-06-25-action-time-approval-packet.md --out outputs/daily/2026-06-25-action-time-approval-packet-link-verification.json` passed `1/1`; production still has no `pt`.
- `npm run growth:appstore-readiness -- --queue outputs/daily/2026-06-24-post-execution-continuation-approval-queue.md --expect-actions 2 --preflight-out outputs/daily/2026-06-24-post-execution-continuation-preflight.json --link-out outputs/daily/2026-06-24-post-execution-continuation-link-verification.json --out outputs/daily/2026-06-24-post-execution-continuation-readiness.json` passed; readiness remains `yes`, provider token complete remains `no`.
- `npm run growth:appstore-goal-status -- --goal 10000 --readiness outputs/daily/2026-06-24-post-execution-continuation-readiness.json --out outputs/daily/2026-06-25-appstore-goal-status.json` reports `achieved: false`, `verified_total_downloads: null`.
- `npm run growth:validate-appstore-metadata -- --input outputs/daily/2026-06-25-appstore-connect-update-pack.json` passed.
- `npm run growth:download-sprint-report -- --out outputs/daily/2026-06-25-download-sprint-report.md` regenerated the report with the clicks-only result-row guard.

No public action, engagement ledger row, App Store result row, profile edit, viral storagebag append, or hook-bank mutation was made.
