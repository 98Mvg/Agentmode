# X Posts

Use this folder for finalized X post drafts, threads, and post variants.

Default X posture:
- learning in public
- founder credibility
- AI-building lessons that connect back to real runner problems
- a person-led journey around building, investing, and running

Account rule:
- people should want to follow the builder, not only the app
- Coachi is the proving ground, not the only subject
- default to `0` direct Coachi mentions in a 3-post daily set
- allow `1` direct Coachi mention only when the product name adds proof or clarity
- across any rolling `10`-day block (`30` posts), keep direct Coachi mentions to `3 to 6` posts total

Avoid using this folder for generic ad copy or landing-page-style hooks.

Use [X_PERSONAL_JOURNEY_CONTENT_PACK.md](/Volumes/Riot%20APFS/Agentmode/coachi-marketing/content/x-posts/X_PERSONAL_JOURNEY_CONTENT_PACK.md) as the canonical profile, bio, pinned-tweet, tone, hook, and idea bank for the person-led X strategy.

For each saved daily pack, label every post with one type:
- `AI lesson`
- `shipping lesson`
- `runner truth`

Keep the labels above, but interpret them like this:
- `AI lesson`: what building with AI taught you
- `shipping lesson`: founder / operator / investor judgment, tradeoff, or allocation lesson
- `runner truth`: the human problem or lived training observation

That same type label must be copied into the dated daily run note under `outputs/daily/`.

Before publishing any daily X pack, run [X_PREFLIGHT_CHECKLIST.md](/Volumes/Riot%20APFS/Agentmode/coachi-marketing/content/x-posts/X_PREFLIGHT_CHECKLIST.md).

Hard gate command:

```bash
python3 /Volumes/Riot\ APFS/Agentmode/coachi-marketing/scripts/validate_x_pack.py /Volumes/Riot\ APFS/Agentmode/coachi-marketing/content/x-posts/YYYY-MM-DD-daily-pack.md
```

If that command fails, rewrite the pack before posting.

Default writing shape for each post:
- strong hook
- insight
- real-world observation
- short conclusion

Brand mention rule:
- if the lesson still works without the word `Coachi`, prefer the version without it
- the account should feel followable as a person even when the app name disappears from the post

Default length target:
- draft target: `20 to 120` words
- hard-gate safe range for daily packs: `40 to 120` words
- prefer `60 to 120` words when the idea needs development
- shorter than `40` only if you deliberately choose the exception and do not treat it as the default daily-pack shape
