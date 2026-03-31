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

## Content Standard
- Lead with uncertainty, relief, or coach-in-your-ear differentiation
- Sound like a calm, sharp running coach
- Optimize for curiosity and clicks to `Coachi.no`
- Avoid feature dumping

## Packaging
- Save final drafts into the relevant folder under `content/`
- Save a dated daily rollup under `outputs/daily/`

## Image Workflow
- Primary path: `🧩 1. CLI (Command Line Interface)`
  - Use `content/ads/gemini-flash-2.5-cli-workflow.md`
  - Run `scripts/generate_gemini_images.py` with a saved prompt file
  - Save winners under `content/ads/generated/`
- Secondary path: `content/ads/codex-built-in-image-workflow.md` only for quick previews or when the user explicitly wants Codex's built-in tool
- Reuse existing strong running images for content when they already fit the message
- If the asset set is for organic Instagram + TikTok video content, keep the same face across those related visuals
- If the asset is for ads, different faces are acceptable
- Generate one image first, approve it against Coachi positioning, then expand into a batch only if it is clearly on-brand for Coachi.
