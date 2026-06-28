# Coachi App Store Connect Update Pack - 2026-06-25

Objective: improve App Store conversion before scaling toward `10,000` downloads.

Public actions taken: `0`.

Do not change the website landing page for this update. This pack is for App Store Connect metadata and screenshot preparation.

## Why This Exists

The live App Store audit scored the current listing `51/100` (`conversion_risk`). The biggest conversion gaps are:

- Current title/subtitle are still broad: `Coachi: Heart Rate Training` / `Live Voice Fitness Coach`.
- The traffic strategy is runner-led, while the listing still reads like a general workout coach.
- The US listing has `0` visible ratings.
- Screenshot 1 leads with setup instead of live AI run coaching.
- App Store Connect campaign attribution still needs `APP_STORE_CAMPAIGN_PROVIDER_TOKEN`.

## Primary Metadata

Use this as the next App Store Connect version metadata direction.

```text
App name:
Coachi: AI Run Coach

Subtitle:
Voice cues by heart rate

Promotional text:
New: clearer zones and smoother Apple Watch heart-rate connection. Get live voice cues during runs so you know when to slow down or hold steady.

Keywords:
zone,watch,workout,training,intervals,pace,runner,cardio,feedback,bpm,effort,tempo,beginner
```

Character checks are validated by `npm run growth:validate-appstore-metadata -- --input outputs/daily/2026-06-25-appstore-connect-update-pack.json`.

## Description

```text
Coachi is an AI run coach that gives you live voice guidance during your run, using heart rate and workout context to tell you when to slow down, hold steady, or recover.

It is built for runners who want Apple Watch and iPhone guidance while the run is still happening, not another chart after it is over.

Why runners use Coachi:
- Hear real-time cues instead of staring at your watch
- Stay closer to the right heart-rate zone on easy runs and workouts
- Build timed runs, free runs, and intervals in seconds
- Connect Apple Watch or a supported heart-rate monitor
- Choose coach voices that fit how you like to train
- Review Coachi Score after each workout to see what went well and what to improve

Coachi is for runners who want simple guidance before a run turns too hard. It helps you keep easy runs easy, control intervals, and understand your training without needing to interpret every number alone.
```

## Screenshot Sequence

1. `Live AI run coaching`
   `Hear when to slow down, hold steady, or recover.`
   Visual: runner in motion with iPhone and Apple Watch visible; show an active workout voice cue, not setup.

2. `Heart-rate cues mid-run`
   `Stay in the right zone without staring at your watch.`
   Visual: Apple Watch heart-rate context plus iPhone run screen; cue appears while workout is active.

3. `Easy should stay easy`
   `Catch effort drift before the run turns hard.`
   Visual: zone drift or pace/heart-rate contrast, framed as a calm correction.

4. `Build the run in seconds`
   `Timed runs, free runs, intervals, and zone targets.`
   Visual: workout setup screen, but after live coaching and heart-rate value have been established.

5. `Post-run Coachi Score`
   `See what worked and what to improve next.`
   Visual: post-run summary with Coachi Score and one clear coaching takeaway.

6. `Share the result`
   `Keep the workout story clear after the run.`
   Visual: share card or workout result with the coaching takeaway visible.

## Secondary Variants

Name variants:

- `Coachi: Voice Run Coach`
- `Coachi: Heart Rate Coach`
- `Coachi: AI Running Coach`

Subtitle variants:

- `Live cues for easier runs`
- `Run in the right zone`
- `Heart-rate coaching`

Promotional text variants:

```text
Run with live voice cues from Coachi. Stay closer to the right heart-rate zone without staring at your watch.
```

```text
Your run can drift before you notice. Coachi gives live voice cues so you know when to slow down, hold steady, or recover.
```

## Execution Order

1. Update promotional text first. Apple says promotional text can be changed without submitting a new version.
2. Prepare name, subtitle, description, keywords, and screenshots for the next version metadata update.
3. Ask recent happy iOS users for App Store ratings before scaling cold traffic; the US listing currently has `0`.
4. Set `APP_STORE_CAMPAIGN_PROVIDER_TOKEN` before judging App Store Connect campaign performance.
5. Rerun `npm run growth:audit-appstore-listing` after the metadata/screenshot update.

## Sources

- Apple App Information: https://developer.apple.com/help/app-store-connect/reference/app-information/app-information/
- Apple Platform Version Information: https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information/
- Apple App Store Search: https://developer.apple.com/app-store/search/
- Apple Product Page: https://developer.apple.com/app-store/product-page/
- Live US lookup: https://itunes.apple.com/lookup?id=6760587172&country=us
- Live NO lookup: https://itunes.apple.com/lookup?id=6760587172&country=no
- Live public page: https://apps.apple.com/us/app/coachi-heart-rate-training/id6760587172
