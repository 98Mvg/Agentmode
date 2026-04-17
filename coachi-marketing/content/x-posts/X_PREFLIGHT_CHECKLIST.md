# X Preflight Checklist

Run this before publishing any 3-post daily pack.

Hard gate:

```bash
python3 /Volumes/Riot\ APFS/Agentmode/coachi-marketing/scripts/validate_x_pack.py /Volumes/Riot\ APFS/Agentmode/coachi-marketing/content/x-posts/YYYY-MM-DD-daily-pack.md
```

If the validator fails, do not publish the pack.

## Mix Check
- exactly `1` post is a true `AI lesson`
- exactly `1` post is a true `shipping lesson`
- exactly `1` post is a true `runner truth`

## Quality Check
For each post, answer:
- is the first line strong enough to act as the hook?
- does it follow:
  - hook
  - insight
  - observation
  - conclusion
- is it within the target range:
  - `40 to 120` words for the daily-pack hard gate
  - preferably `60 to 120` if the idea needs development?
- what changed?
- what did it teach?
- why does it matter for runners or product quality?

If one of those answers is weak, rewrite the post.

## Anti-Drift Check
- no post reads like landing-page copy first
- no post is pure tech for its own sake
- no more than `1` post in the set has a direct CTA or direct link
- if the set feels marketing-first and learning-second, rewrite before posting
