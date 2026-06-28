# Coachi App Store Conversion Audit - 2026-06-24

Objective: move toward 10,000 App Store downloads.

Public actions taken: 0.

## Verdict

Download-readiness score: 51/100 (conversion_risk).

The App Store page is shippable for a small organic push, but it should not be treated as conversion-optimized yet. The biggest blockers are title/subtitle alignment, zero visible US ratings, broad first-copy positioning, and a first screenshot that undersells the live-coaching promise.

## Live Listing Snapshot

- App ID: 6760587172
- Primary listing checked: https://apps.apple.com/us/app/coachi-heart-rate-training/id6760587172?uo=4
- Title: Coachi: Heart Rate Training
- Public subtitle: Live Voice Fitness Coach
- Short public description: Focus on training, not checking your phone or watch.
- First description line: Coachi — heart rate voice coaching for your workouts
- Price: Free
- Current version: 2.3, released 2026-06-24T01:02:39Z
- Minimum OS: 17.0
- Public screenshot assets parsed: 6
- Lookup API screenshot count: 0

## Country Signals

- US: Coachi: Heart Rate Training; rating 0/0; API screenshots 0; version 2.3
- NO: Coachi: Heart Rate Training; rating 5/4; API screenshots 0; version 2.3

## Strengths

- Heart-rate/zone value prop is present.
- Apple Watch compatibility is visible.
- Public App Store page has a full iPhone screenshot shelf.
- NO listing has 4 rating(s) at 5.

## Risks And Fixes

- HIGH - Title/subtitle do not claim running: Title/subtitle currently read "Coachi: Heart Rate Training" / "Live Voice Fitness Coach". Recommendation: Test a runner-specific title/subtitle such as Coachi: AI Run Coach or Coachi: Voice Run Coach.
- MEDIUM - Description spreads the promise across run/walk/cycle/intervals: The current paid and organic push is runner-led, while the App Store copy frames Coachi as a general workout coach. Recommendation: Make the first 2 lines runner-first: live cues during runs, heart-rate zones, Apple Watch/iPhone.
- HIGH - Primary traffic country has 0 ratings: US lookup reports rating 0 from 0 users. Recommendation: After the next real user win, ask for ratings from active iOS users before scaling cold traffic.
- LOW - Apple lookup API returns zero screenshots while public HTML has screenshots: Lookup API: 0; public page: 6. Recommendation: Use public page parsing for listing audits and verify App Store Connect media by device size.
- MEDIUM - First screenshot likely leads with setup, not the live coaching promise: First screenshot asset is Appstore_imave_v2.png. The visual audit shows the first frame says "Select your optimal heart rate". Recommendation: Make screenshot 1 say what the user gets: Live AI run coaching in your ear.
- MEDIUM - App Store Connect campaign attribution is incomplete: Coachi-side click tracking works, but redirected App Store URLs still lack pt. Recommendation: Set APP_STORE_CAMPAIGN_PROVIDER_TOKEN in production before judging App Store Connect campaign performance.

## Screenshot Audit

Public screenshot assets parsed from the App Store page:

- 1. Appstore_imave_v2.png
- 2. Choose_your_zone.png
- 3. choose_workout_style_1320x2868_portrait.png
- 4. rounds_costumize_catchy_1320x2868_portrait.png
- 5. rest_1320x2868_portrait.png
- 6. share_your_workouts_no_number_1320x2868_portrait.png

Manual visual read from the current screenshot order:
- Screenshot 1 looks polished but leads with setup: "Select your optimal heart rate" and "let Coachi do the rest."
- The current social promise is stronger than that: live AI run coaching while the run is still fixable.
- The Apple Watch value appears in the screenshot, but the first frame does not make "during the run" obvious enough.

Recommended screenshot order for the next App Store Connect update:
- 1. Live AI run coach in your ear.
- 2. Apple Watch heart-rate cues during the run.
- 3. Stay in the right zone without staring at your watch.
- 4. Build intervals / easy runs in seconds.
- 5. Post-run Coachi Score and what to improve.
- 6. Share or save the workout result.

## Metadata Rewrite Direction

Do not change the website landing page for this. Use App Store Connect metadata in the next app update.

Title candidates:
- Coachi: AI Run Coach
- Coachi: Voice Run Coach
- Coachi: Heart Rate Coach

Subtitle candidates:
- Live cues for easier runs
- Heart-rate coaching by voice
- Run in the right zone

First two description lines:

```text
Coachi gives you live voice coaching during your run, using heart rate and workout context to tell you when to slow down, hold steady, or recover.

It is built for runners who want Apple Watch and iPhone guidance while the run is still happening, not another chart after it is over.
```

## Next Gates

- Set `APP_STORE_CAMPAIGN_PROVIDER_TOKEN` before relying on App Store Connect campaign attribution.
- Ask current iOS users for ratings after a real positive workout moment; the US listing currently has no visible rating proof.
- Rerun this audit after App Store Connect metadata/screenshots are updated.

Sources:
- https://itunes.apple.com/lookup?id=6760587172&country=us
- https://itunes.apple.com/lookup?id=6760587172&country=no
- https://apps.apple.com/us/app/coachi-heart-rate-training/id6760587172
