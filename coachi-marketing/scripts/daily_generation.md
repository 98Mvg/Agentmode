# Daily Generation Script

## Objective
Generate Coachi traffic content from the latest research and positioning files.

Canonical command:

```bash
npm run growth:daily -- --date YYYY-MM-DD --mode minimum --execute --open
```

Use [coachi-growth-command.md](/Volumes/Riot%20APFS/Agentmode/coachi-marketing/strategy/automation/coachi-growth-command.md) as the single command wrapper for the daily social loop. It integrates X, Reddit, TikTok, Instagram, and the slideshow handoff. Do not create a separate daily engagement command unless it wraps or intentionally replaces that command.

Four-hour loop:

```bash
npm run growth:loop -- install --mode minimum --interval-seconds 14400
```

Use this for recurring engagement preparation. It calls the canonical `growth:daily` command every `4` hours.

Every `growth:daily` run must also write `outputs/daily/YYYY-MM-DD-engagement-candidates.json`.
Use that ranked queue before broad browsing. It scores X, Reddit, TikTok, and Instagram opportunities and suppresses recent duplicates from `inputs/performance/engagement-ledger.json`.

Planning layer:
- for the next two weeks, use [14-day-social-engine.md](/Volumes/Riot%20APFS/Agentmode/coachi-marketing/strategy/channels/14-day-social-engine.md) as the operating calendar for TikTok, Instagram, X, Reddit, and story packaging
- treat that file as a theme bank, but only lock the next `3` days of execution at a time
- use the source hierarchy in [AGENTS.md](/Volumes/Riot%20APFS/Agentmode/coachi-marketing/AGENTS.md) when docs disagree: role rules first, then performance learnings, then this execution playbook, then channel-specific docs

## Inputs
- `strategy/audience/ideal-customer.md`
- `strategy/positioning/core-positioning.md`
- `strategy/patterns.md`
- latest notes under `inputs/research/`
- latest performance notes under `inputs/performance/`

## Required Output
- 3 X posts
- 1 TikTok idea
- 1 Instagram idea
- 1 Reddit action plan, reply matrix, or post idea
- 1 dated daily run note that includes:
  - X post type tracker
  - Reddit thread pattern tracker
- 1 dated performance scorecard under `inputs/performance/`
- updates to:
  - `inputs/performance/WINNER_LIBRARY.md`
  - `inputs/research/reddit-winning-language-bank.md` when Reddit produces useful wording

## TikTok Operating Loop
- TikTok is the primary free-reach engine.
- Daily TikTok loop:
  - `1 to 2` videos posted
  - `15` likes
  - `10` meaningful comments
  - `10` follows
  - `5` replies to comments
  - `1` comment on a trending or larger video
- Minimum TikTok loop:
  - `1` video posted
  - `5` likes
  - `3` meaningful comments
  - `3` follows
  - `1` relevant larger-video comment
- Stretch TikTok loop:
  - full default loop above
- Keep TikTok inside the same shared content engine as Instagram.
- Reuse the same source idea across TikTok and Instagram wherever possible.
- Use the shared vertical-video workflow for rendered outputs.

## Instagram Default Delivery Rule
- The default Instagram output should be a `reel`.
- Switch to a `carousel` when the every-`2 to 3`-day depth slot is due or when the topic needs step-by-step explanation.
- Use `story` output for low-production engagement, reposts, or conversion support.
- Use [strategy/channels/instagram-content-system.md](/Volumes/Riot%20APFS/Agentmode/coachi-marketing/strategy/channels/instagram-content-system.md) as the canonical Instagram rule set.
- Save Instagram drafts with [content/Instagram/OUTPUT_TEMPLATE.md](/Volumes/Riot%20APFS/Agentmode/coachi-marketing/content/Instagram/OUTPUT_TEMPLATE.md).

## Instagram Content Rules
- Audience:
  - serious beginners
  - intermediate runners
- Content split:
  - `70%` runner mistakes
  - `20%` Coachi app
  - `10%` build story
- Format split:
  - Reels are the main driver and should be about `80%` of Instagram posts
  - Carousels are for depth and saves
  - Stories are for quick engagement and conversion support
- Daily Instagram operating loop:
  - `1` Reel
  - `3 to 6` Stories
  - `15` likes
  - `10` meaningful comments
  - `10` follows
  - `5` replies to comments or DMs
- Minimum Instagram loop:
  - `1` Reel
  - `1 to 3` Stories
  - `5` likes
  - `3` meaningful comments
  - `3` follows
- Stretch Instagram loop:
  - full default loop above
- Carousel cadence:
  - `1` carousel every `2 to 3` days
  - track the carousel slot in the workflow
  - do not force a carousel every day
- Reels structure:
  1. hook
  2. problem
  3. fix
  4. CTA
- Keep hook language pain-first:
  - `You're doing this wrong`
  - `Stop running like this`
  - `Most runners don't know this`
  - `This is why you're always tired`
- Keep visuals clean, minimal, and performance-focused.
- Use running clips, app UI, and simple overlays.
- Do not drift into flashy influencer edits or generic gym content.

## Daily X Operating Loop
- publish 3 X posts
- follow 10 relevant accounts
- like 15 relevant posts
- repost 1 strong relevant post
- leave 1 thoughtful reply on a larger account
- Minimum X loop:
  - publish 3 X posts
  - follow 3 relevant accounts
  - like 5 relevant posts
  - leave 1 thoughtful reply
- Stretch X loop:
  - full default loop above

## X Post Mix
- 1 post about what building with AI taught you
- 1 post about founder / operator / investor judgment
- 1 post about a runner problem, product truth, or honest progress

Direct Coachi mention budget:
- default to `0` direct Coachi mentions in the 3-post daily set
- allow `1` direct Coachi mention only when the product name adds proof or needed specificity
- across the active rolling `10`-day block (`30` posts), keep direct Coachi mentions to `3 to 6` posts total

Required X tracker labels:
- `AI lesson`
- `shipping lesson`
- `runner truth`

## X Preflight Gate
Do not publish the X pack until all are true:
- the pack passes:
  - `python3 /Volumes/Riot APFS/Agentmode/coachi-marketing/scripts/validate_x_pack.py /Volumes/Riot APFS/Agentmode/coachi-marketing/content/x-posts/YYYY-MM-DD-daily-pack.md`
- exactly `1` post is a true `AI lesson`
- exactly `1` post is a true `shipping lesson`
- exactly `1` post is a true `runner truth`
- the set contains at most `1` direct CTA or direct link
- the set contains at most `1` direct Coachi mention
- no post reads like landing-page copy first and lived learning second
- every post is within the hard-gate safe range:
  - `40 to 120` words

## X Quality Rule
- Do not post pure tech for its own sake
- Every tech/build post must connect to:
  - a runner problem
  - a user benefit
  - or a shipping lesson
- Optimize for:
  - curiosity
  - trust
  - recognition from builders, testers, and early adopters
- Default to no link
- Use `coachi.no` only when the post naturally earns an explanation
- Use direct App Store language only on launch, update, and proof posts
- If the post sounds like a landing page line instead of a real founder learning, rewrite it

## Content Standard
- Lead with a real lesson, changed assumption, or concrete observation
- Sound like a founder-operator learning in public, not a brand account trying to force a CTA
- Keep Coachi in the story, but do not make every post a pitch
- if the idea still works without naming Coachi, prefer the version without it
- Avoid feature dumping

## Reddit Operating Loop
- Default to reply-first
- Daily Reddit loop:
  - find `4 to 6` relevant threads
  - leave `2 to 4` useful replies
  - create `0 or 1` new post only if there is a clean subreddit fit
- Minimum Reddit loop:
  - find the best `2 to 3` threads
  - leave `2` useful replies
- Stretch Reddit loop:
  - leave `3` useful replies across at least `2` threads
  - revisit one live reply when there is visible follow-up
- Prefer:
  - watch-checking anxiety
  - heart-rate zone confusion
  - Apple Watch and Garmin training interpretation
  - beginner runner uncertainty
- Link only when the person clearly asks for a practical tool or next step

Required Reddit thread pattern labels:
- `watch-checking anxiety`
- `heart-rate confusion`
- `Apple Watch interpretation`
- `Garmin interpretation`
- `beginner uncertainty`
- `easy-run pace drift`

## Packaging
- Save final drafts into the relevant folder under `content/`
- Save a dated daily rollup under `outputs/daily/`
- Reuse the same source idea across TikTok and Instagram wherever possible.
- Add platform-specific logic through format flags and templates, not through a separate pipeline.
- In the daily rollup, always include:
  - one table or bullet list tagging each X post by type
  - one table or bullet list tagging each Reddit thread/reply by thread pattern
  - a short note on which X type looked strongest
  - a short note on which Reddit pattern created the best response or curiosity
- In the scorecard, always include a decision on each asset:
  - `repeat`
  - `iterate`
  - `stop`

## Image Workflow
- Primary path: `🧩 1. CLI (Command Line Interface)`
  - Use `content/ads/gemini-flash-2.5-cli-workflow.md`
  - Run `scripts/gemini-cli image ...` with a saved prompt file
  - Save winners under `content/ads/generated/`
- Secondary path: `content/ads/codex-built-in-image-workflow.md` only for quick previews or when the user explicitly wants Codex's built-in tool
- Reuse existing strong running images for content when they already fit the message
- If the asset set is for organic Instagram + TikTok video content, keep the same face across those related visuals
- Lock the default organic runner character to:
  - male
  - age `25-35`
  - lean endurance-athlete build
  - short dark slightly textured hair
  - calm focused expression
  - clean, minimal, performance-first styling
- Keep those traits stable across related organic assets and only vary:
  - clothes
  - environment
  - lighting
  - scenario
- If the asset is for ads, different faces are acceptable
- Generate one image first, approve it against Coachi positioning, then expand into a batch only if it is clearly on-brand for Coachi.

## Shared Video / Asset Rule
- Use one shared vertical-video workflow for TikTok and Instagram Reels.
- Use `scripts/generate_social_videos.py` with one source spec and platform flags instead of separate render scripts.
- Use `scripts/gemini-cli` for separate Gemini image/text generation:
  - `scripts/gemini-cli image generate ...`
  - `scripts/gemini-cli image generate-batch ...`
  - `scripts/gemini-cli text optimize ...`
  - `scripts/gemini-cli text hook ...`
  - `scripts/gemini-cli text caption ...`
- Use `inputs/notes/social-video-template.json` as the default input shape.
- If a spec declares `source_video_asset`, that file must already exist before rendering. For layout-only previews, omit `source_video_asset` and use `background`.
- Before rendering, run `python3 scripts/generate_social_videos.py validate --spec <spec>` to catch bad booleans, typoed layout overrides, and missing declared media.
- If the source footage is AI-generated, keep it inside the same spec with:
  - `source_video_mode`
  - `source_video_prompt`
  - `source_video_negative_prompt`
  - `source_video_asset`
  - `variant_goal`
  - `platform_hook_text`
  - `comment_bait_text`
- Save rendered outputs under `content/video/generated/` unless the task needs a different folder.
- If the on-screen copy feels weak, keep text generation separate:
  - `scripts/gemini-cli text optimize --spec ...` to refine `hook_text`, `body_text`, `cta_text`, and `accent_type`
  - `scripts/gemini-cli text hook --spec ...` when only the top hook is weak
  - `scripts/gemini-cli text caption --spec ...` for platform caption copy
- Generate ElevenLabs narration by default inside the same render workflow.
- Default video voice should use ElevenLabs voice ID `9MPvdQh2pLsLhn7SuiIS`.
- Default marketing voice settings mode should be `eleven_defaults`, so the voice keeps the standard ElevenLabs sound unless the spec explicitly overrides it.
- If `voiceover_text` is blank, derive spoken copy from the hook/body/cta overlay text.
- Set `voiceover_enabled: false` only when the clip should stay silent.
- If an organic TikTok + Instagram pair needs visual continuity, include a `character_anchor` block in the source spec and keep the same male runner across the pair.
- For Instagram Reels, use the same core input as TikTok and apply only parameter-level differences:
  - stricter safe margins
  - cleaner spacing
  - slightly slower pacing
- For TikTok, use the same core input and apply only parameter-level differences:
  - slightly shorter duration
  - tighter spacing
  - more aggressive hook treatment
- Do not create a second render flow just for Instagram.
- Reuse TikTok source clips, app UI captures, and existing running assets before generating new material.

## Rolling 3-Day Rule
- Keep only the next `3` days locked as execution work.
- Days `4 to 14` are theme backlog and should be rewritten after each 3-day review.
- At the end of every 3 days, create a short optimization note using [ROLLING_3_DAY_OPTIMIZATION_TEMPLATE.md](/Volumes/Riot%20APFS/Agentmode/coachi-marketing/outputs/daily/ROLLING_3_DAY_OPTIMIZATION_TEMPLATE.md).
