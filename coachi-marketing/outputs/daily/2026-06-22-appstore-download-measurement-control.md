# Coachi App Store Download Measurement Control - 2026-06-22

Status: production route verified, no public posts made by this artifact.
Goal: make the next App Store download push measurable enough to separate distribution, App Store conversion, and product activation.

## Production Link State

Verified command:

```bash
node scripts/verify_appstore_campaign_links.mjs \
  --input outputs/daily/2026-06-22-appstore-campaign-link-bank.md \
  --out outputs/daily/2026-06-22-appstore-link-bank-verification.json
```

Result:

```text
Checked 11 App Store campaign links: 11 passed, 0 failed.
Provider token pt was not present in any redirect.
```

Active queue check:

```bash
node scripts/verify_appstore_campaign_links.mjs \
  --input outputs/daily/2026-06-22-appstore-builder-growth-approval-queue.md \
  --out outputs/daily/2026-06-22-appstore-builder-growth-link-verification.json
```

Result:

```text
Checked 5 App Store campaign links: 5 passed, 0 failed.
Provider token pt was not present in any redirect.
```

Interpretation:

- Coachi-owned links are safe to use for public install traffic.
- Server-side `app_store_click` events should fire through the redirect.
- `app_store_click` events now include `media_type`, `provider_token_present`, and `target_host`, so PostHog can show whether the Apple provider-token path is configured even before App Store Connect campaign rows appear.
- Apple App Store Connect campaign attribution is incomplete until `APP_STORE_CAMPAIGN_PROVIDER_TOKEN` is set in production.

After setting `APP_STORE_CAMPAIGN_PROVIDER_TOKEN` in Render, rerun:

```bash
npm run growth:verify-appstore-links -- \
  --input outputs/daily/2026-06-22-appstore-campaign-link-bank.md \
  --require-provider-token
```

That command should report `Provider token pt present in 11/11 redirects.` before Apple campaign attribution is treated as complete.

## Required Baseline Before Posting

Record these before publishing the first direct-link post:

```text
Date/time:
App Store Connect total downloads:
App Store Connect first-time downloads:
App Store Connect product page views:
App Store Connect conversion rate:
Current rating/review count:
PostHog app_store_clicks last 24h:
PostHog provider_token_present true/false:
Best current source/campaign:
Notes:
```

## Metrics To Record After Posting

Record at 2h, 24h, and 48h after the first direct-link post:

```text
Window:
Public actions posted:
Post URLs:
PostHog app_store_clicks:
Clicks by source:
Clicks by campaign:
App Store Connect product page views:
App Store Connect first-time downloads:
App Store Connect campaign rows visible:
Best campaign:
Decision:
Notes:
```

## Decision Rules

- Low impressions and low clicks: distribution problem. Increase targeted replies, founder X reach, and profile-link surfaces.
- Clicks healthy but App Store views low: redirect or Apple attribution setup problem. Recheck campaign links and provider token.
- App Store views healthy but downloads low: App Store page conversion problem. Review first screenshot, subtitle, rating/reviews, and preview text.
- Downloads healthy but weak activation: onboarding/product problem, not a traffic problem.

## Next Execution Gate

The 10-action queue is ready at:

```text
outputs/daily/2026-06-22-appstore-builder-growth-approval-queue.md
```

Public posting still requires exact approval of the batch/action copy. Use the Codex in-app browser; do not use Clawbot/OpenClaw.
