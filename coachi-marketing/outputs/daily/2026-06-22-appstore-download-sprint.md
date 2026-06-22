# Coachi App Store Download Sprint - 2026-06-22

Objective: move toward 10,000 App Store downloads.

Status: ready-to-use plan and copy. No public posts were made by this artifact.

## Current Link Contract

- Canonical App Store URL: `https://apps.apple.com/app/coachi-voice-fitness-coach/id6760587172`
- Coachi campaign redirect URL: `https://coachi.no/app-store?source=<SOURCE>&campaign=<CAMPAIGN>`
- Trust-building URL: `https://coachi.no`
- Android beta URL: `https://groups.google.com/g/coachi-android-beta`

Verification:
- `curl -I -L https://apps.apple.com/app/coachi-voice-fitness-coach/id6760587172` returned `HTTP/2 200` after redirecting to the US App Store URL.

## Measurement Setup

Use Coachi campaign redirect links for approved public posts. The production route is live and records server-side `app_store_click` intent, then forwards to the App Store with App Store Connect campaign parameters when the provider token is configured.

Do not guess the provider token. Get it from App Store Connect Analytics, set `APP_STORE_CAMPAIGN_PROVIDER_TOKEN` in production, then use Coachi short links shaped like:

```text
https://coachi.no/app-store?source=x&campaign=x_product_proof_20260622
```

Recommended campaign tokens:

```text
x_product_proof_20260622
x_builder_reply_20260622
reddit_app_ask_20260622
instagram_bio_20260622
tiktok_bio_20260622
pinterest_slideshow_20260622
```

Full campaign link bank: `outputs/daily/2026-06-22-appstore-campaign-link-bank.md`.

Daily metrics to record from App Store Connect:

```text
Date:
Total downloads / App Units:
Product page views:
Conversion rate:
Top source type:
Top campaign:
Best social post/comment URL:
Notes:
```

Decision rule:
- If product-page views are low, distribution is the bottleneck.
- If product-page views are healthy but conversion is low, App Store page/screenshot/subtitle is the bottleneck.
- If downloads happen but retention is weak, product onboarding is the bottleneck, not marketing.

## 24-Hour Execution Order

1. Publish one X product-proof post with the direct App Store link.
2. Post the approved 10-mention batch, but use direct links only where the thread explicitly invites an app/product/link.
3. Update TikTok and Instagram profile/bio link to the App Store campaign link or `coachi.no` if direct App Store linking is awkward on-platform.
4. Pin the best product-proof post on X for 48 hours.
5. Log App Store Connect metrics the next day before changing copy.

## X Product-Proof Post

Use this as the one direct-link X post in the next 3-post set.

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

Shorter variant:

```text
Building Coachi taught me that a running app does not need more charts.

It needs to help at the moment the run starts drifting.

Coachi gives live run guidance, heart-rate zone support, and post-run AI feedback.

Free on the App Store:
https://coachi.no/app-store?source=x&campaign=x_product_proof_20260622
```

## X Builder Replies

Use on explicit `drop your app`, `what are you building`, or product-share prompts.

```text
Building Coachi, a real-time AI running coach for iPhone and Apple Watch.

The app gives live cues during the workout so runners do not have to keep interpreting heart-rate zones alone.

App Store:
https://coachi.no/app-store?source=x&campaign=x_builder_reply_20260622
```

```text
Building Coachi.

Most running apps recap the run after it is over. I am trying to make the useful cue happen while the run is still fixable.

App Store:
https://coachi.no/app-store?source=x&campaign=x_builder_reply_20260622
```

Use the no-link version when the host asks for conversation, not product links:

```text
Building Coachi, an AI running coach for Apple Watch/iPhone.

The hard part is timing: a useful cue has to arrive during the run, when HR, pace, and context drift, not after the dashboard.
```

## Reddit Reply Rules

Direct App Store links on Reddit are high-risk. Use a direct link only when the original post explicitly asks for app recommendations or links.

Use this no-link version first:

```text
I am building Coachi around this exact problem: HR-based cues need to happen while you are running, not after.

The useful feature is not just showing the number. It is cueing the behavior: slow down, recover, or stay steady while the run is still happening.
```

Use this direct-link version only on explicit app-recommendation threads after final subreddit/context check:

```text
I am building Coachi for this exact gap: live run guidance instead of another post-run chart.

It supports heart-rate zone context and gives cues while the run is happening, which is the part most tracking apps miss.

App Store:
https://coachi.no/app-store?source=reddit&campaign=reddit_app_ask_20260622
```

## TikTok / Instagram Comment Rule

Comments should earn the profile click. Do not paste the App Store link in TikTok/Instagram comments.

Use:

```text
This is exactly what Coachi is built for: catching the drift early enough that easy can stay easy.
```

```text
Same pace does not mean same stress. Coachi is trying to make that cue happen during the run, not after.
```

Bio/profile CTA:

```text
AI run coach for easier easy runs. Free on App Store.
```

TikTok bio link:

```text
https://coachi.no/app-store?source=tiktok&campaign=tiktok_bio_20260622
```

Instagram bio link:

```text
https://coachi.no/app-store?source=instagram&campaign=instagram_bio_20260622
```

## Pinterest / Long-Tail

The slideshow repurposer previously used:

```text
https://coachi.no/download?utm_source=pinterest&utm_medium=organic_pin&utm_campaign=slideshow
```

For the App Store push, route Pinterest through the campaign redirect:

```text
https://coachi.no/app-store?source=pinterest&campaign=pinterest_slideshow_20260622
```

Pin description template:

```text
Easy runs should not turn into workouts by accident. Coachi gives live run guidance so you catch effort drift while the run is still happening.
```

## App Store Page Check

Before scaling traffic, inspect these in App Store Connect:

- Screenshot 1 says the outcome in 3 seconds.
- Subtitle clearly says `AI running coach` or `voice fitness coach`.
- First three screenshots explain live guidance, heart-rate zones, and post-run feedback.
- Preview text does not sound like a generic tracker.
- Ratings/reviews are not hiding a trust problem.

## Today Next Actions

- Approval needed: post `outputs/daily/2026-06-22-coachi-10-mention-approval-queue.md`.
- Approval needed: publish one X product-proof App Store post from this file.
- Setup needed: set `APP_STORE_CAMPAIGN_PROVIDER_TOKEN` once the provider token is available.
- Measurement needed: record current App Store Connect baseline before the next posting burst.

## Outcome

- Created install-focused copy and campaign structure.
- Production `/app-store` redirect is live as of the follow-up deploy check.
- Verified canonical App Store URL resolves.
- No public actions were taken.
- No engagement ledger rows were added.
