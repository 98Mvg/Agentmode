# Coachi App Store High-Intent Approval Queue v2 - 2026-06-22

Status: approval-gated, not posted.
Goal: move toward 10,000 App Store downloads with high-intent mentions and fewer duplicate/low-fit actions.
Browser rule for execution: use the Codex in-app browser; do not use Clawbot/OpenClaw.

## Why v2 Exists

The previous App Store builder queue is superseded because a ledger check found three Reddit targets already had Coachi replies from 2026-06-12:

- `https://www.reddit.com/r/beginnerrunning/comments/1q6ux3g/how_do_you_stop_running_too_fast_looking_for_a/`
- `https://www.reddit.com/r/beginnerrunning/comments/1n5duqr/app_that_actually_cues_intervals_based_on_heart/`
- `https://www.reddit.com/r/beginnerrunning/comments/1tnd7jf/what_apps_do_you_all_use_to_track_your_runs_and/`

Do not post to those again in this run.

## Current Measurement Gate

Production redirect check on 2026-06-22:

```text
https://coachi.no/app-store?source=release_check&campaign=release_check
-> https://apps.apple.com/app/coachi-voice-fitness-coach/id6760587172?ct=release_check&mt=8
```

`pt` is still absent until `APP_STORE_CAMPAIGN_PROVIDER_TOKEN` is set in Render. Coachi-side `app_store_click` tracking still works.

## Link Rules

- Owned X post: one direct App Store campaign link is allowed after approval.
- X replies: no direct link unless the prompt explicitly asks for App Store URLs.
- Reddit: direct link only when the original post explicitly asks for an app/tool/recommendation.
- TikTok/Instagram comments: no direct links; earn profile clicks.
- Profile/bio links: direct campaign link allowed after approval.

## Queue

### 1. X Owned Post - AI Reader Lesson

Action: publish as standalone X post.
Link: none.
Status: ready after approval.

```text
AI readers changed my workflow.

I ran Fable 5 Ultra High across my running app repo today.

It found a few edge cases in the watch/backend flow that Codex 5.5 at high effort had not surfaced.

That changed my tool split: use the strongest reader to scan the whole system, then use Codex for the code path.

For runners, the benefit is less invisible drift between app, watch, and backend.
```

### 2. X Owned Post - Real-Time Shipping Lesson

Action: publish as standalone X post.
Link: none.
Status: ready after approval.

```text
Shipping a real-time app changes what "bug" means.

In Coachi, a technically correct cue can still be wrong if it arrives too late.

The hard part is not only AI output. It is keeping iPhone, Apple Watch, backend state, workout timing, and audio behavior aligned while someone is moving.

That is where the product either earns trust or loses it.
```

### 3. X Owned Post - Product Proof With App Store Link

Action: publish as standalone X post.
Link: direct campaign link.
Status: ready after approval; Apple `pt` attribution still needs provider token.

```text
The App Store push needs measurement.

Today I tightened the install path for Coachi.

The campaign link records the click on our side, then redirects to the App Store with campaign tokens once the provider token is set.

That means the next growth test can separate distribution from conversion instead of guessing.

For runners, the promise stays simple: one tap from proof to install.

https://coachi.no/app-store?source=x&campaign=x_product_proof_20260622
```

### 4. Reddit - HR Zone Audio Cue App Request

Target: `https://www.reddit.com/r/beginnerrunning/comments/1eg458h/a_running_app_with_heart_rate_zones_audio_cues/`
Fit: explicit request for a running app with heart-rate zone audio cues.
Action: comment if the thread is still open and no recent Coachi reply exists.
Link: direct campaign link allowed because the post asks for app functionality.
Status: ready after approval and final thread recheck.

```text
I am building Coachi for this exact gap: live guidance during the run instead of another chart after it is over.

The useful version is not just "your HR is 165." It is a short cue while you can still fix the run: slow down, recover, or stay steady.

If you want to try that style of app, it is here:
https://coachi.no/app-store?source=reddit&campaign=reddit_hr_audio_cues_20260622
```

### 5. Reddit - Apple Watch HR Alert Question

Target: `https://www.reddit.com/r/AppleWatch/comments/17tsp0h/can_apple_watch_give_heart_rate_alerts_for/`
Fit: Apple Watch user asks whether HR alerts can support zone 2 training.
Action: comment if the thread is still open and no recent Coachi reply exists.
Link: no direct link on first pass because the post asks about Apple Watch setup, not a product drop.
Status: ready after approval and final thread recheck.

```text
The missing piece is usually not the HR number itself, but getting the cue at the right time.

I am building Coachi around that idea: use the watch/phone signal, then give a short live cue when easy starts drifting instead of making the runner inspect the chart later.

If you stay with the native Workout app, I would still set conservative zones and treat the alert as a guardrail, not a verdict.
```

### 6. Reddit - Generic Running App Request

Target: `https://www.reddit.com/r/beginnerrunning/comments/1q48fwp/what_app_do_i_use/`
Fit: user asks what app to use to stay in running shape.
Action: comment if the thread is still open and no recent Coachi reply exists.
Link: direct campaign link allowed only if the live thread context still asks for app recommendations.
Status: ready after approval and final thread recheck.

```text
Depends what job you want the app to do.

If you mainly want a log, Strava/Garmin/Nike-style apps are fine. If you want help during the run, look for something that gives live cues instead of only showing a post-run chart.

I am building Coachi for that second case: live run guidance on iPhone/Apple Watch.

https://coachi.no/app-store?source=reddit&campaign=reddit_generic_app_20260622
```

### 7. Reddit - Recent Zone 2 Debate

Target: `https://www.reddit.com/r/beginnerrunning/comments/1u7r1lr/the_zone_2_debate_in_a_nutshell/`
Fit: recent active zone 2 discussion; good for a non-link Coachi mention.
Action: comment if context is still active and no recent Coachi reply exists.
Link: none.
Status: ready after approval and final thread recheck.

```text
This is why I think zone 2 needs to be treated like a guardrail, not a verdict.

I am building Coachi around that middle ground: use HR as context, but cue the runner in plain language during the run. Sometimes the right cue is "slow down." Sometimes it is "this is fine, keep it boring."
```

### 8. Reddit - App Alerts / Distance Prompt

Target: `https://www.reddit.com/r/beginnerrunning/comments/1tq8itu/app_that_alerts_you_after_you_run_a_preset/`
Fit: recent app-alert request; adjacent to live cue behavior.
Action: comment if the thread is still open and no recent Coachi reply exists.
Link: no direct link unless the live thread asks for app links.
Status: ready after approval and final thread recheck.

```text
For this kind of use case, I would separate "tracking" from "cueing."

A lot of apps can record the run. Fewer are good at interrupting only when the cue is actually useful. I am building Coachi around that second problem: short live cues during the run, not another screen to interpret afterward.
```

### 9. TikTok Bio Link Update

Action: update TikTok profile/bio link if the account settings allow it.
Link: direct campaign link.
Status: ready after approval.

```text
https://coachi.no/app-store?source=tiktok&campaign=tiktok_bio_20260622
```

Bio line:

```text
AI run coach for easier easy runs. Free on App Store.
```

### 10. Instagram Bio Link Update

Action: update Instagram profile/bio link if the account settings allow it.
Link: direct campaign link.
Status: ready after approval.

```text
https://coachi.no/app-store?source=instagram&campaign=instagram_bio_20260622
```

Bio line:

```text
AI run coach for easier easy runs. Free on App Store.
```

## Execution Order

1. Re-run the campaign-link verifier.
2. Publish X posts 1 and 2 first.
3. Publish X post 3 after approval.
4. Re-open every Reddit target in the Codex in-app browser.
5. Skip any Reddit target that is locked, archived, context-shifted, or already has a recent Coachi reply.
6. Post direct-link Reddit comments only for targets 4 and 6, and only if the live context still asks for app recommendations.
7. Post no-link Reddit comments 5, 7, and 8 only if they are still relevant.
8. Update TikTok and Instagram bio links after approval.
9. Log every completed action to `inputs/performance/engagement-ledger.json`.
10. Record next-day App Store Connect downloads/page views after Apple's reporting delay.

## Sources Used

- App Store campaign link bank: `outputs/daily/2026-06-22-appstore-campaign-link-bank.md`
- Engagement ledger duplicate check: `inputs/performance/engagement-ledger.json`
- Public search targets: Reddit app-request and zone-2 threads; X/app-store prompt search.

## Outcome

- Prepared 10 approval-gated actions.
- Excluded 3 already-posted Reddit targets from the previous queue.
- Public posts/comments/likes/follows made: 0.
- Engagement ledger rows added: 0.
