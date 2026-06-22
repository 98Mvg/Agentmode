# Coachi App Store Builder Growth Queue - 2026-06-22

Status: approval-gated, not posted.
Goal: move toward 10,000 App Store downloads with builder-led X content plus earned social mentions.
Browser rule for execution: use the Codex in-app browser; do not use Clawbot/OpenClaw.

## Deployment Gate

The public route is deployed. Re-run this probe before any posting burst:

```bash
curl -I "https://coachi.no/app-store?source=release_check&campaign=release_check"
```

Current check on 2026-06-22 returned `HTTP/2 302` to:

```text
https://apps.apple.com/app/coachi-voice-fitness-coach/id6760587172?ct=release_check&mt=8
```

The redirect is live and usable for install traffic. `pt=<PROVIDER_TOKEN>` is not visible yet, so set `APP_STORE_CAMPAIGN_PROVIDER_TOKEN` before treating App Store Connect campaign attribution as complete. Coachi server-side click tracking still works through the redirect.

## Link Rules

- Owned X product-proof post: direct campaign link is allowed after approval.
- X replies: default no link; use the profile/pinned post for conversion.
- Reddit: direct link only on explicit app/tool/link requests.
- TikTok/Instagram comments: no direct links; earn profile clicks.
- TikTok/Instagram bio updates: direct campaign link allowed after approval.

## X Daily Pack

Source file: `content/x-posts/2026-06-22-appstore-builder-daily-pack.md`

Preflight result:

```text
OK content/x-posts/2026-06-22-appstore-builder-daily-pack.md
- Post 1: AI lesson (73 words)
- Post 2: shipping lesson (62 words)
- Post 3: product proof (73 words)
```

### 1. X Post - AI Lesson

Action: publish as standalone X post.
Link: none.
Status: ready after approval.

```text
AI readers changed my workflow.

I ran Fable 5 Ultra High across my running app repo today.

It found a few edge cases in the watch/backend flow that Codex 5.5 at high effort had not surfaced.

That changed my tool split: use the strongest reader to scan the whole system, then use Codex for the code path.

For a runner, the benefit is less invisible drift between app, watch, and backend.
```

### 2. X Post - Shipping Lesson

Action: publish as standalone X post.
Link: none.
Status: ready after approval.

```text
Shipping taught me where bugs hide.

Most bugs I fix now are not in one screen.

They live between iOS, the watch app, backend, and the release checklist.

That is the shipping lesson: a product feels simple only when the boring contracts stay tight.

For runners, that matters because a late or wrong cue during a workout is worse than no cue.
```

### 3. X Post - Product Proof

Action: publish as standalone X post.
Link: direct campaign link.
Status: ready after approval; provider token still needed for complete App Store Connect campaign attribution.

```text
The App Store push needs measurement.

Today I added a cleaner install path for Coachi.

The campaign link records the click on our side, then redirects to the App Store with campaign tokens when the provider token is set.

That means the next growth test can separate distribution from conversion instead of guessing.

For runners, the promise stays simple: one tap from proof to install.

https://coachi.no/app-store?source=x&campaign=x_product_proof_20260622
```

## Earned Mention Actions

Use targets from `outputs/daily/2026-06-22-coachi-10-mention-approval-queue.md`.
Re-open each URL before posting and skip if the context shifted or Coachi already has a visible recent comment.

### 4. X Reply - Builder Prompt

Target: `https://x.com/TechJobsDailyIN/status/2065387279036924106`
Action: reply.
Link: none.
Status: ready after approval.

```text
Building Coachi, an AI running coach for Apple Watch/iPhone.

The hard part has not been the model call. It is timing: a useful cue has to arrive during the run, when HR, pace, and context drift, not after the dashboard.
```

### 5. X Reply - Product Builder Prompt

Target: `https://x.com/rlaope/status/2066357732190613844`
Action: reply.
Link: none.
Status: ready after approval.

```text
Building Coachi.

It turns messy wearable signals into live coaching cues for runners. Current lesson: AI coding speeds up implementation; the product work is deciding which cue is useful enough to interrupt someone mid-run.
```

### 6. Reddit Comment - Explicit App Request

Target: `https://www.reddit.com/r/beginnerrunning/comments/1q6ux3g/how_do_you_stop_running_too_fast_looking_for_a/`
Action: comment.
Link: direct campaign link because the thread asks for an app with live HR monitoring/audio alerts.
Status: ready after approval and final thread recheck; provider token still needed for complete App Store Connect campaign attribution.

```text
You are describing the exact gap that made me start building Coachi: not another post-run chart, but a simple cue during the run when effort is drifting.

For your case I would still keep the first pass boring: set a conservative HR ceiling, slow down before you hit it, and treat walk breaks as part of the run. If you want an app answer, I would look specifically for live HR alerts/audio cues, not just training plans.

I am building that direction here:
https://coachi.no/app-store?source=reddit&campaign=reddit_app_ask_20260622
```

### 7. Reddit Comment - HR Cue Discussion

Target: `https://www.reddit.com/r/beginnerrunning/comments/1n5duqr/app_that_actually_cues_intervals_based_on_heart/`
Action: comment.
Link: none on first pass.
Status: ready after approval.

```text
I am building Coachi around this exact problem: HR-based cues need to happen while you are running, not after.

The way I would frame the feature is that the app should cue the behavior, not just show the number: slow down, recover, or stay steady. Since you already have a chest strap, the key thing to look for is reliable live alerts from that strap.
```

### 8. Instagram Comment - Easy-Run Drift

Target: `https://www.instagram.com/p/DZzOyn5xXME/`
Action: comment.
Link: none.
Status: ready after approval.

```text
This is exactly the sort of run Coachi is built for: not judging the HR after, but catching the drift early enough that easy can stay easy.
```

### 9. TikTok Comment - Zone 2 Video

Target: `https://www.tiktok.com/@jsoro53/video/7644539053467045133`
Action: comment.
Link: none.
Status: ready after approval.

```text
This is the missing piece I am building Coachi around: easy runs need a live cue before they stop being easy.
```

### 10. Profile Link Updates

Action: update profile/bio link where allowed.
Status: ready after approval; provider token still needed for complete App Store Connect campaign attribution.

TikTok:

```text
https://coachi.no/app-store?source=tiktok&campaign=tiktok_bio_20260622
```

Instagram:

```text
https://coachi.no/app-store?source=instagram&campaign=instagram_bio_20260622
```

Bio line:

```text
AI run coach for easier easy runs. Free on App Store.
```

## Execution Order

1. Set `APP_STORE_CAMPAIGN_PROVIDER_TOKEN` when the App Store Connect provider token is available.
2. Re-run the production deployment probe above.
3. Publish X posts 1 and 2 first.
4. Publish X post 3 after approval.
5. Post no-link replies/comments 4, 5, 7, 8, and 9 after target recheck.
6. Post linked Reddit comment 6 only after target recheck.
7. Update profile links after approval.
8. Log posted URLs to `inputs/performance/engagement-ledger.json`.
9. Record next-day App Store Connect downloads, page views, and campaign data after Apple's reporting delay.

## Outcome

- Prepared 10 approval-gated growth actions.
- Production `coachi.no/app-store` redirect is live; direct-link actions are approval-gated, not deployment-blocked.
- App Store Connect provider token is not visible in the redirect yet, so Apple campaign attribution is not complete until `APP_STORE_CAMPAIGN_PROVIDER_TOKEN` is set.
- Public posts/comments/likes/follows made: 0.
- Ledger rows added: 0.
