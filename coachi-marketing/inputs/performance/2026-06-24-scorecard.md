# 2026-06-24 Scorecard

## Chrome App Store Download Engagement Run

- Run note: `outputs/daily/2026-06-24-chrome-download-engagement-loop.md`
- Continuation queue: `outputs/daily/2026-06-24-post-execution-continuation-approval-queue.md`
- Measurement handoff: `outputs/daily/2026-06-24-reddit-applewatchapps-measurement-handoff.md`
- Public actions posted: `4`
- Channels:
  - X: `1` profile website update
  - Instagram: `1` bio update
  - Reddit: `1` no-link runner reply and `1` app-discovery comment
- Direct App Store campaign surfaces created: `3`
  - X profile website campaign link
  - Instagram bio App Store copy
  - Reddit iOSApps App Shelf campaign link
- Single-tab Chrome constraint: followed.
- Metrics status: pending. No verified download-count movement yet.

## Posted Actions

- X profile website updated to `https://coachi.no/app-store?source=x&campaign=x_profile_20260624`.
- Instagram bio updated to: `AI run coach for easier easy runs. Free on App Store. coachi.no/app-store`.
- Reddit no-link Zone 2 reply posted at `https://old.reddit.com/r/beginnerrunning/comments/1u7r1lr/the_zone_2_debate_in_a_nutshell/otlstda/`.
- Reddit iOSApps App Shelf comment posted at `https://old.reddit.com/r/iosapps/comments/1tvro09/megathread_the_app_shelf_june_2026/otlvcj1/`.

## Blockers

- TikTok showed login controls after a profile-save attempt, so no reply/profile action was verified there.
- X public posting redirected to `x.com/account/access`; profile edit succeeded, but owned post/reply actions should wait until the account challenge is cleared.
- Old Reddit rate-limited after one comment attempt; prioritize the highest install-intent Reddit slot during cooldown windows.
- `r/AppleWatchApps` required post flair during execution. A later one-tab Chrome check attached `Health & Fitness` to the filled draft, but the public submit action still requires explicit confirmation.

## Initial Quality Notes

- Strongest install-intent surface: `r/iOSApps` App Shelf, because the thread explicitly requests app submissions and requires pricing/App Store details.
- Strongest runner-specific surface still queued: `r/AppleWatchApps`, but only if flair can be applied and the direct-link volume cap is respected.
- `r/AppleWatchApps` is now technically closer to execution because `Health & Fitness` attached locally; the remaining gate is approval and post-submit verification.
- Best reusable message shape: live guidance is not "more data"; it is a small cue when effort starts drifting.
- Avoid repeating: a second Reddit direct App Store link in the same low-volume run, X public posts while the account-access challenge is active, and TikTok actions when the signed-in state is not visible.

## Verification

- Post-execution continuation preflight passed: 2 actions, 3 URLs, 1 Coachi campaign link.
- App Store link verification passed: 1/1 redirect preserved `ct=reddit_applewatchapps_20260624` and `mt=8`; Apple `pt` remains absent.
- Focused tests passed: `node --test scripts/__tests__/preflight_approval_queue.test.mjs scripts/__tests__/engagement_candidate_engine.test.mjs` reported 9/9 passing.
- Readiness artifact created: `outputs/daily/2026-06-24-post-execution-continuation-readiness.json` reports `ready_for_approval_execution: true` and `provider_token_complete: false`.
- Baseline dry-run preview created: `outputs/daily/2026-06-24-reddit-applewatchapps-baseline-dry-run.json`; do not write real campaign results until PostHog and App Store Connect metrics replace the dry-run zeros.
