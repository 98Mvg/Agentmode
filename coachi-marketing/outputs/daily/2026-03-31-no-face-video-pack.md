# 2026-03-31 No-Face Video Pack

## Objective

Create one Coachi no-face video concept that can be rendered into both TikTok and Instagram from the same source spec.

## Concept

### Topic
Easy pace confusion

### Why this one
- fits the strongest stored Coachi pain pattern
- works without a face
- supports both discovery and conversion
- matches `AI coach, not tracking app`

## Shared Structure

1. Hook
2. Visual
3. Insight
4. Fix
5. CTA

## Shared Core Message

Hook:
- `You think this is easy pace?`

Insight:
- if heart rate keeps drifting up, the run is harder than the runner thinks

Fix:
- slow down until the effort matches the session

CTA:
- `Coachi tells you this in real time.`

## Saved Files

- shared render spec:
  - [2026-03-31-easy-pace-social-video.json](/Users/mariusgaarder/Documents/treningscoach/tmp/agentmode-cloud/coachi-marketing/inputs/notes/2026-03-31-easy-pace-social-video.json)
- TikTok draft:
  - [2026-03-31-easy-pace-no-face-video.md](/Users/mariusgaarder/Documents/treningscoach/tmp/agentmode-cloud/coachi-marketing/content/Tiktok/2026-03-31-easy-pace-no-face-video.md)
- Instagram draft:
  - [2026-03-31-easy-pace-no-face-reel.md](/Users/mariusgaarder/Documents/treningscoach/tmp/agentmode-cloud/coachi-marketing/content/Instagram/2026-03-31-easy-pace-no-face-reel.md)
- voiced renders:
  - [easy-pace-no-face-tiktok.mp4](/Users/mariusgaarder/Documents/treningscoach/tmp/agentmode-cloud/coachi-marketing/content/video/generated/2026-03-31-easy-pace-voice/easy-pace-no-face-tiktok.mp4)
  - [easy-pace-no-face-instagram.mp4](/Users/mariusgaarder/Documents/treningscoach/tmp/agentmode-cloud/coachi-marketing/content/video/generated/2026-03-31-easy-pace-voice/easy-pace-no-face-instagram.mp4)

## Voice

- narration is generated inside the shared render workflow
- default spoken voice: English `personal_trainer`
- provider: ElevenLabs

## Render Path

Use:

```bash
python3 scripts/generate_social_videos.py generate \
  --spec inputs/notes/2026-03-31-easy-pace-social-video.json \
  --out-dir content/video/generated/2026-03-31-easy-pace
```
