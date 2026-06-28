# App Store Download Sprint Report

Generated: `2026-06-25T05:56:27.498Z`

## Current Verdict

- 10,000-download goal achieved: `no`
- Verified App Store total downloads: `missing`
- Known incremental first-time downloads: `0`
- Readiness for approval execution: `yes`
- Provider-token attribution complete: `no`
- Next action: `collect_due_app_store_measurements`

## Evidence Gaps

- `missing_appstore_campaign_results`
- `missing_app_store_total_downloads`
- `goal_not_reached_by_verified_total_downloads`
- `provider_token_incomplete`
- `due_appstore_measurement_windows`

## Ready Approval Gate

- Queue: `outputs/daily/2026-06-24-post-execution-continuation-approval-queue.md`
- Queue preflight: `yes`
- App Store link check: `yes`
- Campaign links passed: `1/1`

No approval-gated direct-install campaigns remain in the measurement queue.

## Conversion Readiness

- App Store conversion score: `51/100`
- Conversion grade: `conversion_risk`
- Conversion audit public actions: `0`
- US visible ratings: `0`
- NO visible ratings: `4`
- Metadata pack public actions: `0`
- Prepared App Store name: `Coachi: AI Run Coach` (20/30)
- Prepared subtitle: `Voice cues by heart rate` (24/30)
- Promotional text length: `144/170`
- Keywords length: `91/100 bytes`
- Screenshot sequence: `6`

Top conversion risks:
- HIGH - Title/subtitle do not claim running
- MEDIUM - Description spreads the promise across run/walk/cycle/intervals
- HIGH - Primary traffic country has 0 ratings

## Provider Token Deployment Handoff

- Handoff: `outputs/daily/2026-06-25-provider-token-deployment-handoff.md`
- Current attribution blocker: production App Store redirects still need Apple `pt` provider-token attribution.
- Existing app runtime already supports `APP_STORE_CAMPAIGN_PROVIDER_TOKEN`, `APP_STORE_PROVIDER_TOKEN`, and `pt=` query fallback.
- Next no-secret step: extract Render env values from an App Store Connect campaign link with `/Users/mariusgaarder/Documents/treningscoach/scripts/app_store_campaign_env_from_link.py`.
- Link verification now redacts `pt` values before printing or writing artifacts.
- Acceptance gate: rerun App Store link verification with `--require-provider-token`, then rerun readiness and goal status.
- Do not commit the provider-token value to repo artifacts.

## Measurement Queue

- Queue: `outputs/daily/2026-06-25-appstore-measurement-queue.json`
- Measurement intake template: `outputs/daily/2026-06-25-appstore-measurement-intake-template.csv`
- Filled-template dry-run: `npm run growth:log-appstore-result -- --batch-csv outputs/daily/2026-06-25-appstore-measurement-intake-template.csv --dry-run`
- Export-enriched dry-run: `npm run growth:log-appstore-result -- --batch-csv outputs/daily/2026-06-25-appstore-measurement-intake-template.csv --posthog-export <POSTHOG_APP_STORE_CLICKS_EXPORT> --app-store-csv <APP_STORE_CONNECT_CAMPAIGNS_CSV> --dry-run`
- Posted direct-install campaigns: `4`
- Pending approval campaigns: `0`
- Measurement windows already logged: `0`
- Measurement windows due now: `3`
- Next measurement due: `2026-06-25T07:51:00.996Z`
- Ledger actions since: `2026-06-22T00:00:00.000Z`

Metric export requirements:
- PostHog export filter: event equals `app_store_click`.
- PostHog export columns: `event` plus one campaign-token field: `properties.apple_campaign_token`, `properties.campaign`, or `properties.ct`.
- App Store Connect export columns: `Campaign`, `Product Page Views`, `First-Time Downloads`, and `Total Downloads`.
- App Store Connect export filter: one measured row per campaign token before writing results; use dry-run first if the export contains date or territory breakdowns.
- Campaign tokens to include: `x_profile_20260624`, `instagram_bio_20260622`, `reddit_iosapps_20260624`, `reddit_applewatchapps_20260624`

Posted campaigns to measure:
- x_profile_20260624 (x) next `2h` at `2026-06-24T23:24:05.774Z`
- instagram_bio_20260622 (instagram) next `2h` at `2026-06-24T23:24:10.331Z`
- reddit_iosapps_20260624 (reddit) next `2h` at `2026-06-24T23:33:33.628Z`
- reddit_applewatchapps_20260624 (reddit) next `2h` at `2026-06-25T07:51:00.996Z`

## Candidate Queue Snapshot

- Candidate count: `34`
- Suppressed duplicates: `2`

### reddit

- Rank 1: easy day too fast (reply)
  Target: `https://www.reddit.com/search/?q=running%20too%20fast%20on%20easy%20days&type=posts&sort=new`
  Promo: `no promo`
- Rank 2: c25k pace too fast (reply)
  Target: `https://www.reddit.com/search/?q=C25K%20pace%20too%20fast%20heart%20rate&type=posts&sort=new`
  Promo: `no promo`

### tiktok

- Rank 6: easy run mistakes (comment)
  Target: `https://www.tiktok.com/search?q=easy%20run%20mistakes`
- Rank 8: running creator follow candidates (like_follow)
  Target: `https://www.tiktok.com/search?q=beginner%20runner%20journey`

### instagram

- Rank 7: easy run reels (comment)
  Target: `https://www.instagram.com/explore/search/keyword/?q=easy%20run%20mistakes`
- Rank 28: beginner runner reels (comment)
  Target: `https://www.instagram.com/explore/search/keyword/?q=beginner%20runner%20tips`

### x

- Rank 10: AI builder founder journey (reply)
  Target: `https://x.com/search?q=%22building%20with%20AI%22%20founder&src=typed_query&f=live`
- Rank 11: real-time AI product latency (reply)
  Target: `https://x.com/search?q=%22real-time%20AI%22%20app%20latency&src=typed_query&f=live`

## Operating Notes

- Do not submit posts, comments, likes, follows, profile edits, or DMs without exact approval.
- Do not log an engagement ledger row until the public action is verified live.
- Do not create or update `inputs/performance/appstore-campaign-results.json` from dry-run zeros.
- `growth:log-appstore-result` rejects clicks-only rows; at least one App Store metric must be present before writing a result row.
- When App Store Connect campaign exports exist, prefer `growth:log-appstore-result -- --app-store-csv <csv>` so measured campaign rows populate product-page views, first-time downloads, and explicit total-download evidence.
- Do not mark the thread goal complete until real `app_store_total_downloads` is at least `10000`.
