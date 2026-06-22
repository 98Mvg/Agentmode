# Coachi App Store Campaign Link Bank - 2026-06-22

Status: production route live and ready for approved use. No public posts made by this artifact.

## Runtime Contract

Use Coachi-owned short links for social distribution:

```text
https://coachi.no/app-store?source=<SOURCE>&campaign=<CAMPAIGN>
https://coachi.no/ios?source=<SOURCE>&campaign=<CAMPAIGN>
```

The app runtime redirects those links to the App Store and records a server-side `app_store_click` event. When `APP_STORE_CAMPAIGN_PROVIDER_TOKEN` is set in production, the redirect also appends App Store Connect campaign parameters:

```text
pt=<PROVIDER_TOKEN>&ct=<CAMPAIGN>&mt=8
```

Current production check: campaign links redirect with `ct` and `mt=8`; `pt` is not visible yet.

Important: set `APP_STORE_CAMPAIGN_PROVIDER_TOKEN` from App Store Connect before treating App Store Connect campaign reporting as authoritative. Without `pt`, Coachi still records web click intent, but Apple campaign download attribution may not show the campaign.

## Link Bank

| Use | Link |
| --- | --- |
| X product-proof post | `https://coachi.no/app-store?source=x&campaign=x_product_proof_20260622` |
| X builder reply | `https://coachi.no/app-store?source=x&campaign=x_builder_reply_20260622` |
| X pinned/profile follow-up | `https://coachi.no/app-store?source=x&campaign=x_pinned_profile_20260622` |
| Dedicated download page CTA | `https://coachi.no/app-store?source=download&campaign=download_page` |
| Reddit explicit app ask | `https://coachi.no/app-store?source=reddit&campaign=reddit_app_ask_20260622` |
| Instagram bio | `https://coachi.no/app-store?source=instagram&campaign=instagram_bio_20260622` |
| TikTok bio | `https://coachi.no/app-store?source=tiktok&campaign=tiktok_bio_20260622` |
| Pinterest slideshow pins | `https://coachi.no/app-store?source=pinterest&campaign=pinterest_slideshow_20260622` |
| Email beta/update | `https://coachi.no/app-store?source=email&campaign=email_update_20260622` |
| Founder DMs when requested | `https://coachi.no/app-store?source=dm&campaign=founder_requested_20260622` |
| QR/offline/test | `https://coachi.no/app-store?source=offline&campaign=qr_test_20260622` |

## Copy Using Campaign Links

### X Product-Proof Post

```text
I built Coachi because most running apps still make the runner interpret the run alone.

The app now gives live guidance during the workout:
- heart-rate zone support
- Apple Watch/iPhone flow
- post-run AI feedback
- cues before easy turns hard

Free on the App Store:
https://coachi.no/app-store?source=x&campaign=x_product_proof_20260622
```

### X Builder Reply

```text
Building Coachi, a real-time AI running coach for iPhone and Apple Watch.

The hard part is timing: the useful cue has to arrive while the run is still fixable, not after the dashboard.

App Store:
https://coachi.no/app-store?source=x&campaign=x_builder_reply_20260622
```

### Reddit Direct-Link Version

Use only when the original thread explicitly asks for an app, tool, or link.

```text
I am building Coachi for this exact gap: live run guidance instead of another post-run chart.

It supports heart-rate zone context and gives cues while the run is happening, which is the part most tracking apps miss.

App Store:
https://coachi.no/app-store?source=reddit&campaign=reddit_app_ask_20260622
```

### Bio Links

TikTok bio:

```text
AI run coach for easier easy runs. Free on App Store:
https://coachi.no/app-store?source=tiktok&campaign=tiktok_bio_20260622
```

Instagram bio:

```text
AI run coach for easier easy runs. Free on App Store:
https://coachi.no/app-store?source=instagram&campaign=instagram_bio_20260622
```

## Measurement Checklist

Record this daily after using these links:

```text
Date:
Campaign link clicks in PostHog / server analytics:
App Store Connect first-time downloads:
App Store Connect product page views:
Top source:
Top campaign:
Best post/comment URL:
Notes:
```

Decision rule:

- Clicks low + downloads low: distribution problem.
- Clicks healthy + App Store views low: redirect/campaign setup problem.
- Views healthy + downloads low: App Store page conversion problem.
- Downloads healthy + retention low: product onboarding/activation problem.

## Next Action

1. Set `APP_STORE_CAMPAIGN_PROVIDER_TOKEN` in production.
2. Use one direct campaign link in the next approved X product-proof post.
3. Keep Reddit/TikTok/Instagram comments mostly no-link unless a link is explicitly invited.
4. Record clicks/downloads using `outputs/daily/2026-06-22-appstore-download-measurement-control.md`.
