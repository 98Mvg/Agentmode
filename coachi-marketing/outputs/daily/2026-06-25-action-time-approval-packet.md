# 2026-06-25 Action-Time Approval Packet

Status: prepared only. No browser action, public post, ledger row, or App Store result row was created by this packet.

Purpose: remove ambiguity from the next Chrome action that can move the App Store download goal.

## Approval Sentence Needed

Before clicking the public Reddit submit button, get this exact user approval or an unambiguous equivalent:

```text
Approve submitting the prepared r/AppleWatchApps Reddit post as AlarmingTradition961 from the existing single Chrome tab.
```

This approval is needed because the next browser action publishes a public Reddit post with a Coachi App Store campaign link.

## Public Action To Execute After Approval

Platform: Reddit

Account: `AlarmingTradition961`

Target tab: existing Chrome tab only, currently `AppleWatchApps: submit`

Target URL:

```text
https://old.reddit.com/r/AppleWatchApps/submit?selftext=true
```

Subreddit: `r/AppleWatchApps`

Title:

```text
[iOS] Coachi - AI run coach with live cues for Apple Watch runners
```

Body:

```text
I am building Coachi for runners who want coaching during the run, not just another chart after it.

The app is focused on one practical problem: easy runs and zone work drift because you keep negotiating with pace, heart rate, and the watch. Coachi lets you pick the run/zone and gives short voice cues when you are pushing too hard or too little, so you can adjust while the run is still happening.

It is built for beginner/intermediate runners using iPhone and Apple Watch. The goal is not more data; it is a calmer decision at the moment effort starts drifting.

Free on the App Store:
https://coachi.no/app-store?source=reddit&campaign=reddit_applewatchapps_20260624

I would especially like feedback from Apple Watch runners: would you rather get the cue before the run starts, during the run when effort drifts, or only in the post-run summary?
```

Required pre-click checks:
- Exactly one Chrome tab is used.
- The tab is still the existing `AppleWatchApps: submit` draft.
- Account signal still includes `AlarmingTradition961`.
- Subreddit field is still `AppleWatchApps`.
- Title field exactly matches the title above.
- Body field contains the exact campaign URL above.
- Hidden `flair_id` is `234b9c4e-6a13-11f0-918e-22cfc006f4d6`.
- Hidden `flair_template_id` is `234b9c4e-6a13-11f0-918e-22cfc006f4d6`.
- Visible `submit` button is enabled.

Known risk:
- Old Reddit still shows stale validation text: `Your post must contain post flair.`
- If clicking `submit` returns a validation error or keeps the draft on the form, stop, do not retry blindly, and do not log a ledger row.

## Immediate Post-Submit Verification

After approved submit:
1. Capture the resulting URL.
2. Confirm the page is a live Reddit post, not the submit form.
3. Confirm the title is visible on the resulting post.
4. Confirm the body contains the Coachi campaign link.
5. Confirm the subreddit is `r/AppleWatchApps`.
6. Confirm the post is visible as account `AlarmingTradition961`.
7. Only then append the engagement ledger row.

## Post-Submit Verifier Command

Replace `<POST_URL>` with the resulting Reddit post URL:

```bash
npm run growth:verify-reddit-post -- \
  --url "<POST_URL>" \
  --expected-title "[iOS] Coachi - AI run coach with live cues for Apple Watch runners" \
  --expected-subreddit AppleWatchApps \
  --expected-author AlarmingTradition961 \
  --expected-campaign reddit_applewatchapps_20260624 \
  --out outputs/daily/2026-06-25-reddit-applewatchapps-post-verification.json
```

The verifier must return `ok: true` before any engagement ledger row is added.

## Ledger Command After Verified Live Post

Replace `<POST_URL>` with the verified resulting post URL:

```bash
npm run growth:log-engagement -- \
  --date 2026-06-25 \
  --platform reddit \
  --action post \
  --url "<POST_URL>" \
  --topic "reddit_applewatchapps_20260624" \
  --status posted \
  --notes "Verified r/AppleWatchApps Coachi self-promotion post with App Store campaign link reddit_applewatchapps_20260624."
```

Do not use `--allow-duplicate` unless the preflight failure is understood and explicitly accepted.

## Measurement Command After Real Metrics Exist

Do not write fake zeros as real results. When PostHog and App Store Connect have real values, replace placeholders and run:

```bash
npm run growth:log-appstore-result -- \
  --readiness outputs/daily/2026-06-24-post-execution-continuation-readiness.json \
  --campaign reddit_applewatchapps_20260624 \
  --source reddit \
  --window 2h \
  --public-actions-posted 1 \
  --post-url "<POST_URL>" \
  --clicks "<POSTHOG_APP_STORE_CLICKS>" \
  --product-page-views "<APP_STORE_PRODUCT_PAGE_VIEWS>" \
  --first-time-downloads "<APP_STORE_FIRST_TIME_DOWNLOADS>" \
  --total-downloads "<APP_STORE_TOTAL_DOWNLOADS>" \
  --campaign-rows-visible "<true_or_false>" \
  --provider-token-present false \
  --notes "2h measurement for r/AppleWatchApps campaign."
```

Repeat at `24h`, `48h`, and `7d` with the same campaign after real metrics are available.

The logger rejects result rows that contain clicks only. At least one real App Store metric is required: product-page views, first-time downloads, total downloads, or values imported from an App Store Connect CSV.

If App Store Connect campaign data has been exported as CSV, use the import path to avoid retyping measured campaign metrics:

```bash
npm run growth:log-appstore-result -- \
  --readiness outputs/daily/2026-06-24-post-execution-continuation-readiness.json \
  --campaign reddit_applewatchapps_20260624 \
  --source reddit \
  --window 24h \
  --public-actions-posted 1 \
  --post-url "<POST_URL>" \
  --clicks "<POSTHOG_APP_STORE_CLICKS>" \
  --app-store-csv "<APP_STORE_CONNECT_CAMPAIGNS_CSV>" \
  --provider-token-present "<true_or_false>" \
  --notes "24h App Store Connect CSV import for r/AppleWatchApps campaign."
```

The CSV import only writes real exported values. It matches a single campaign row by `reddit_applewatchapps_20260624`, imports product-page views and first-time downloads when present, imports total downloads only from explicit total-download columns, and sets `campaign-rows-visible` to `true`.

## Goal Status Command

Use this after any real App Store result logging, and before claiming progress toward `10,000` downloads:

```bash
npm run growth:appstore-goal-status -- \
  --goal 10000 \
  --readiness outputs/daily/2026-06-24-post-execution-continuation-readiness.json \
  --out outputs/daily/2026-06-25-appstore-goal-status.json
```

For a hard completion gate, add `--require-achieved`. The command only treats the goal as achieved when real `app_store_total_downloads` evidence is at least `10000`; campaign clicks, readiness, and dry-run previews do not count.

## Current Readiness Evidence

Queue:
- `outputs/daily/2026-06-24-post-execution-continuation-approval-queue.md`

Fresh handoff:
- `outputs/daily/2026-06-25-download-engagement-refresh.md`
- `outputs/daily/2026-06-25-provider-token-deployment-handoff.md`
- `outputs/daily/2026-06-25-appstore-measurement-queue.md`
- `outputs/daily/2026-06-25-appstore-measurement-queue.json`

Readiness:
- `outputs/daily/2026-06-24-post-execution-continuation-readiness.json`
- `ready_for_approval_execution: true`
- `provider_token_complete: false`

Latest known Chrome state from `2026-06-25 01:22 CEST`:
- One tab only.
- Draft intact.
- Campaign URL present.
- Submit enabled.
- Hidden flair IDs attached.
- Public submit not clicked.
- Title field verified from `textarea[name="title"]`.
- Tab finalized as handoff after the read-only check.
- Account signal still includes `AlarmingTradition961`.
- Subreddit field still reads `AppleWatchApps`.
- Body length still `852`.
- Visible selected flair is still `Health & Fitness`.
- Stale validation text still says `Your post must contain post flair.`

Latest measurement queue state from `2026-06-25 01:33 CEST`:
- Posted direct-install campaigns: `3`.
- Pending approval campaigns: `1`.
- Measurement windows due now: `3`.
- Due campaigns: `x_profile_20260624`, `instagram_bio_20260622`, and `reddit_iosapps_20260624` at the `2h` window.
- Next measurement due: `x_profile_20260624` at the `24h` window, `2026-06-25 23:24:05 CEST`.
- No App Store result row has been written because real PostHog and App Store Connect values are still required.

## If Approval Is Not Given

Do not submit the post.

Next safe work:
1. Keep candidate discovery draft-only.
2. Do not add a ledger row.
3. Do not create `inputs/performance/appstore-campaign-results.json`.
4. Continue with no-link reply candidates only after live thread inspection and exact approval.
