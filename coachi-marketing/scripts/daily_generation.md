# Daily Generation Script

## Objective
Generate Coachi traffic content from the latest research and positioning files.

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
- 1 Reddit post idea

## TikTok Operating Loop
- TikTok is the primary free-reach engine.
- Daily TikTok loop:
  - `1 to 2` videos posted
  - `15` likes
  - `10` meaningful comments
  - `10` follows
  - `5` replies to comments
  - `1` comment on a trending or larger video
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

## X Post Mix
- 1 runner insight post
- 1 build-in-public or shipping lesson post
- 1 product-truth or honest progress post

## X Quality Rule
- Do not post pure tech for its own sake
- Every tech/build post must connect to:
  - a runner problem
  - a user benefit
  - or a shipping lesson
- Optimize for:
  - curiosity
  - profile click
  - trust
  - website/App Store intent

## Content Standard
- Lead with uncertainty, relief, or coach-in-your-ear differentiation
- Sound like a calm, sharp running coach
- Optimize for curiosity and clicks to `Coachi.no`
- Avoid feature dumping

## Packaging
- Save final drafts into the relevant folder under `content/`
- Save a dated daily rollup under `outputs/daily/`
- Reuse the same source idea across TikTok and Instagram wherever possible.
- Add platform-specific logic through format flags and templates, not through a separate pipeline.

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
- Save rendered outputs under `content/video/generated/` unless the task needs a different folder.
- If the on-screen copy feels weak, keep text generation separate:
  - `scripts/gemini-cli text optimize --spec ...` to refine `hook_text`, `body_text`, `cta_text`, and `accent_type`
  - `scripts/gemini-cli text hook --spec ...` when only the top hook is weak
  - `scripts/gemini-cli text caption --spec ...` for platform caption copy
- If `voiceover_text` is present, generate ElevenLabs narration inside the same render workflow.
- Default video voice should use ElevenLabs voice ID `9MPvdQh2pLsLhn7SuiIS`.
- Default marketing voice settings mode should be `eleven_defaults`, so the voice keeps the standard ElevenLabs sound unless the spec explicitly overrides it.
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
