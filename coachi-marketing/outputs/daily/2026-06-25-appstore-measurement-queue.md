# App Store Measurement Queue

Generated: `2026-06-25T05:54:06.343Z`

Status: measurement prep only. No public action, ledger row, or App Store result row was created.

## Summary

- Posted direct-install campaigns: `4`
- Pending approval campaigns: `0`
- Measurement windows already logged: `0`
- Measurement windows due now: `3`
- Next measurement due: `2026-06-25T07:51:00.996Z`
- Readiness report: `outputs/daily/2026-06-24-post-execution-continuation-readiness.json`
- Ledger actions since: `2026-06-22T00:00:00.000Z`

## Posted Campaigns

### x_profile_20260624

- Source: `x`
- First posted at: `2026-06-24T21:24:05.774Z`
- Public actions posted: `1`
- URLs: `https://x.com/DailyRun49173`

Windows:
- `2h`: `due`, due `2026-06-24T23:24:05.774Z`
- `24h`: `pending`, due `2026-06-25T21:24:05.774Z`
- `48h`: `pending`, due `2026-06-26T21:24:05.774Z`
- `7d`: `pending`, due `2026-07-01T21:24:05.774Z`

Next measurement command:

```bash
npm run growth:log-appstore-result -- \
  --readiness outputs/daily/2026-06-24-post-execution-continuation-readiness.json \
  --campaign x_profile_20260624 \
  --source x \
  --window 2h \
  --public-actions-posted 1 \
  --post-url "https://x.com/DailyRun49173" \
  --clicks "<POSTHOG_APP_STORE_CLICKS>" \
  --app-store-csv "<APP_STORE_CONNECT_CAMPAIGNS_CSV>" \
  --provider-token-present "<true_or_false>" \
  --notes "2h measurement for x_profile_20260624."
```

### instagram_bio_20260622

- Source: `instagram`
- First posted at: `2026-06-24T21:24:10.331Z`
- Public actions posted: `1`
- URLs: `https://www.instagram.com/everydayrunnerlab/`

Windows:
- `2h`: `due`, due `2026-06-24T23:24:10.331Z`
- `24h`: `pending`, due `2026-06-25T21:24:10.331Z`
- `48h`: `pending`, due `2026-06-26T21:24:10.331Z`
- `7d`: `pending`, due `2026-07-01T21:24:10.331Z`

Next measurement command:

```bash
npm run growth:log-appstore-result -- \
  --readiness outputs/daily/2026-06-24-post-execution-continuation-readiness.json \
  --campaign instagram_bio_20260622 \
  --source instagram \
  --window 2h \
  --public-actions-posted 1 \
  --post-url "https://www.instagram.com/everydayrunnerlab/" \
  --clicks "<POSTHOG_APP_STORE_CLICKS>" \
  --app-store-csv "<APP_STORE_CONNECT_CAMPAIGNS_CSV>" \
  --provider-token-present "<true_or_false>" \
  --notes "2h measurement for instagram_bio_20260622."
```

### reddit_iosapps_20260624

- Source: `reddit`
- First posted at: `2026-06-24T21:33:33.628Z`
- Public actions posted: `1`
- URLs: `https://old.reddit.com/r/iosapps/comments/1tvro09/megathread_the_app_shelf_june_2026/otlvcj1/`

Windows:
- `2h`: `due`, due `2026-06-24T23:33:33.628Z`
- `24h`: `pending`, due `2026-06-25T21:33:33.628Z`
- `48h`: `pending`, due `2026-06-26T21:33:33.628Z`
- `7d`: `pending`, due `2026-07-01T21:33:33.628Z`

Next measurement command:

```bash
npm run growth:log-appstore-result -- \
  --readiness outputs/daily/2026-06-24-post-execution-continuation-readiness.json \
  --campaign reddit_iosapps_20260624 \
  --source reddit \
  --window 2h \
  --public-actions-posted 1 \
  --post-url "https://old.reddit.com/r/iosapps/comments/1tvro09/megathread_the_app_shelf_june_2026/otlvcj1/" \
  --clicks "<POSTHOG_APP_STORE_CLICKS>" \
  --app-store-csv "<APP_STORE_CONNECT_CAMPAIGNS_CSV>" \
  --provider-token-present "<true_or_false>" \
  --notes "2h measurement for reddit_iosapps_20260624."
```

### reddit_applewatchapps_20260624

- Source: `reddit`
- First posted at: `2026-06-25T05:51:00.996Z`
- Public actions posted: `1`
- URLs: `https://old.reddit.com/r/AppleWatchApps/comments/1uf1gmg/ios_coachi_ai_run_coach_with_live_cues_for_apple/`

Windows:
- `2h`: `pending`, due `2026-06-25T07:51:00.996Z`
- `24h`: `pending`, due `2026-06-26T05:51:00.996Z`
- `48h`: `pending`, due `2026-06-27T05:51:00.996Z`
- `7d`: `pending`, due `2026-07-02T05:51:00.996Z`

Next measurement command:

```bash
npm run growth:log-appstore-result -- \
  --readiness outputs/daily/2026-06-24-post-execution-continuation-readiness.json \
  --campaign reddit_applewatchapps_20260624 \
  --source reddit \
  --window 2h \
  --public-actions-posted 1 \
  --post-url "https://old.reddit.com/r/AppleWatchApps/comments/1uf1gmg/ios_coachi_ai_run_coach_with_live_cues_for_apple/" \
  --clicks "<POSTHOG_APP_STORE_CLICKS>" \
  --app-store-csv "<APP_STORE_CONNECT_CAMPAIGNS_CSV>" \
  --provider-token-present "<true_or_false>" \
  --notes "2h measurement for reddit_applewatchapps_20260624."
```

## Pending Approval Campaigns

- None.

## Operating Notes

- Do not write App Store result rows until PostHog and App Store Connect measured values exist.
- Use App Store Connect CSV export when possible so real product-page views and downloads populate the result row.
- No public action is performed by this queue.
- Logged campaign/window result rows are treated as measured and are not queued again.
- The thread goal is not complete until real `app_store_total_downloads >= 10000` is verified.
