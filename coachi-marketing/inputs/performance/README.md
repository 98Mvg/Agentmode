# Performance

Track traffic, CTR, waitlist conversion, post performance, and landing-page experiment results here.

This folder is required operating infrastructure, not optional cleanup.

## Required Files
- one dated scorecard for every posting day:
  - `YYYY-MM-DD-scorecard.md`
- one living winner file:
  - [WINNER_LIBRARY.md](/Volumes/Riot%20APFS/Agentmode/coachi-marketing/inputs/performance/WINNER_LIBRARY.md)
- one structured slideshow result log:
  - `slideshow-results.json`
- one cross-platform engagement dedupe ledger:
  - `engagement-ledger.json`

Use [DAILY_SCORECARD_TEMPLATE.md](/Volumes/Riot%20APFS/Agentmode/coachi-marketing/inputs/performance/DAILY_SCORECARD_TEMPLATE.md) as the default shape.

## Scorecard Rule
Every posting day should capture:
- what was posted
- where it was posted
- what hook was used
- what the objective was
- what actually happened
- whether the asset should be:
  - `repeat`
  - `iterate`
  - `stop`

If hard metrics are unavailable, log proxy metrics instead:
- published yes/no
- comment count
- like count
- follow count
- profile count change
- link used yes/no
- under review / live / failed
- outbound actions prepared / approved / posted
- replies received from outbound comments
- new follows after engagement sessions

## Winner Library Rule
Do not make every day start from zero.
When something works, promote it into the winner library:
- hooks
- captions
- comment prompts
- visual patterns
- Veo themes
- Reddit reply shapes

When something fails repeatedly, note it as a loser and stop reusing it.

## Engagement Ledger Rule

Use `engagement-ledger.json` to stop duplicate public engagement.

Log every approved or staged action that should affect future targeting:

```bash
npm run growth:log-engagement -- \
  --platform reddit \
  --action reply \
  --url https://www.reddit.com/... \
  --topic "zone 2 too slow" \
  --status posted
```

The candidate queue should suppress repeated URLs, handles, and topic/action pairs inside the cooldown window.

## Slideshow Result Logger

Use this after TikTok, Instagram, or Pinterest slideshow posts:

```bash
npm run slideshow:log-result -- \
  --slideshow-id YYYY-MM-DD-slug \
  --platform tiktok \
  --hook "HOOK TEXT" \
  --views-24h 1000 \
  --decision repeat
```
