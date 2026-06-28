# 2026-06-25 Public Posts And TikTok Inbox Send

Generated: `2026-06-25 07:54 CEST`

## Quick Repo Recon

- Stack: Node.js ESM marketing automation scripts with zsh/Python helpers, Postiz/Docker for social handoff, Chrome extension automation for logged-in public actions.
- Runtime entry points: `package.json` npm scripts, especially `slideshow:upload-both`, `slideshow:inbox-schedule`, `growth:log-engagement`, `growth:appstore-measurement-queue`, `growth:appstore-goal-status`, and `growth:download-sprint-report`.
- Request path: user approval -> prepared queue/manifest -> upload or Chrome execution -> live verification -> ledger/result artifacts.
- Event path: public action/result files -> `inputs/performance/engagement-ledger.json` -> App Store measurement queue -> goal status/report.

## Relevant Files

1. `outputs/full-loop/2026-06-24-watch-specific-5x/final-10-inbox-send-manifest.json` - send-state manifest for the final 10-pack TikTok inbox handoff.
2. `outputs/full-loop/2026-06-24-watch-specific-5x/logs/scheduled-upload-slot-2-main.log` - blocked slot 2 QA error.
3. `scripts/run_tiktok_inbox_schedule.mjs` - sequential inbox scheduler.
4. `scripts/slideshow_upload_both.mjs` - per-pack TikTok inbox/Instagram upload entry point.
5. `scripts/tiktok_inbox_file_upload.sh` - official TikTok `MEDIA_UPLOAD` inbox handoff wrapper.
6. `scripts/slideshow_prod_preflight.mjs` - production upload gate.
7. `outputs/daily/2026-06-24-post-execution-continuation-approval-queue.md` - approved public action queue.
8. `scripts/verify_reddit_post_submission.mjs` - Reddit post verifier.
9. `scripts/log_engagement_action.mjs` - public action ledger writer.
10. `scripts/build_appstore_measurement_queue.mjs` - App Store campaign measurement queue generator.

## Actions Completed

- TikTok inbox handoff: `9/10` already-made final June 24 slideshow packs reached `SEND_TO_USER_INBOX`.
- Public Reddit post submitted:
  `https://old.reddit.com/r/AppleWatchApps/comments/1uf1gmg/ios_coachi_ai_run_coach_with_live_cues_for_apple/`
- Public TikTok reply posted on owned post:
  `https://www.tiktok.com/@everydayrunnerlab0/photo/7654987467996630294`
- Engagement ledger updated with verified Reddit post and TikTok reply rows.
- App Store measurement queue regenerated explicitly to track `4` posted direct-install campaigns and `0` pending approval campaigns.
- Sprint report generator patched so stale approval-packet handoff text is suppressed once the measurement queue has no pending approval campaigns.

## Blocked / Missing

- Slot 2 was not sent to TikTok inbox:
  `content/slideshows/2026-06-24-main-02-beforeaf-your-easy-run-should-not-become-a-workout`
- Reason: production QA copy freshness rejected repeated final CTA text:
  `Coachi nudges before effort runs away.`
- I did not bypass this gate because the upload path has no supported skip-preflight flag.
- The 10,000-download goal is still not complete: verified App Store total downloads are missing, provider-token attribution remains incomplete, and three older 2h measurement windows are due.

## Verification

- Reddit Chrome evidence: URL, title, author `AlarmingTradition961`, `Health & Fitness` flair, campaign link, and `reddit_applewatchapps_20260624` token visible.
- Reddit fetch verifier confirmed URL/title/author but failed `campaign_token_missing` because fetched old-Reddit HTML did not expose the selftext campaign link.
- TikTok Chrome evidence: reply visible as `Everyday Runner Lab · Creator`; comment count changed to `2`.
- Focused tests passed: `19/19`.
- Commands run:
  - `npm run growth:appstore-measurement-queue -- --out outputs/daily/2026-06-25-appstore-measurement-queue.md --json-out outputs/daily/2026-06-25-appstore-measurement-queue.json --csv-out outputs/daily/2026-06-25-appstore-measurement-intake-template.csv`
  - `npm run growth:appstore-goal-status`
  - `npm run growth:download-sprint-report`
  - `node --test scripts/__tests__/run_tiktok_inbox_schedule.test.mjs scripts/__tests__/postiz_account_profiles.test.mjs scripts/__tests__/verify_reddit_post_submission.test.mjs scripts/__tests__/appstore_measurement_queue.test.mjs scripts/__tests__/appstore_download_goal_status.test.mjs scripts/__tests__/appstore_download_sprint_report.test.mjs`
