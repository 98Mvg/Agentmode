# Pipeline Ready Checklist

This is the operational checklist before posting slideshow content.

## 0. Required Slideshow Spine

Every slideshow must ship with:

- one explicit viewer emotion, selected from the sourced runner problem
- exactly one ChatGPT Images 2.0 hook image on slide 1
- one high-quality hook and simple slide `1-6` text selected from `inputs/research/tiktok-proven-slideshow-text-bank.json`
- one generated Coachi runner avatar in one selected visual world
- one final CTA slide with a single simple action

The visual world must stay coherent across the full deck. Do not mix hills, lakes, and mountains in the same slideshow. Keep lighting similar across the hook image, Supabase/library slides, and CTA slide.

If the text bank does not have a fit, scrape or scan more proven TikTok/Instagram examples and update the bank before publishing. Do not let slides `1-6` be generic AI coaching copy.

## 1. Viral Format Collection

- Before picking a format, collect raw runner problems with `inputs/research/real-problem-mining-system.md`.
- Raw problems must come from Reddit, Apple Support Community, App Store reviews, social comments, search terms, or support docs.
- AI may cluster and rewrite, but it must not invent the original pain point.
- Use `npm run slideshow:topics -- --date YYYY-MM-DD --limit 5` to rank sourced topic candidates.
- Run `npm run slideshow:readiness` before production work to see the current blockers and next actions.
- Capture 20-50 strong examples per niche or format cluster.
- Store notes with `templates/viral-format-capture-template.md`.
- Index captures in `inputs/research/slideshow-format-captures/format-capture-manifest.json`.
- Extract structure only: hook mechanism, payoff sequence, CTA type, layout, and pacing.
- Do not copy exact wording, faces, creator style, or watermarked visuals.

## 2. Reverse Engineering

- Use `templates/reverse-engineering-prompt.md`.
- Output a schema under `schemas/`.
- The schema must include slide roles, objective, text template, visual notes, image prompt template, and text position.
- The schema must preserve the required slideshow spine: emotion, one Images 2.0 avatar/world hook, and final CTA.
- The schema must keep slide text short enough to match proven TikTok slideshow patterns.
- Run `npm run slideshow:validate`.

## 3. Visual Sourcing

Default cost model:

- Slide 1: Images 2.0 hook image with the generated Coachi runner avatar inside the selected visual world.
- Middle slides: tagged Supabase visual-library images from the same visual world and lighting family.
- Final slide: Supabase `cta_ending` visual-library CTA template by default, rotated for variety and chosen to avoid visual-world clashes.

Refresh the Supabase render-time library:

```bash
npm run slideshow:supabase-library -- \
  --supabase-url https://PROJECT.supabase.co
```

Dry-run the library upload before any remote materialization:

```bash
npm run slideshow:upload-library
```

Create the picklist:

```bash
npm run slideshow:assets -- \
  --manifest content/slideshows/YYYY-MM-DD-slug/render-manifest.json \
  --out content/slideshows/YYYY-MM-DD-slug/asset-picklist.json
```

Supabase/library assets must pass: no recognizable public figure, no watermark, source rights reviewed, local crop/color grade, and no overuse. Pinterest/local files are intake and offline fallback, not the preferred render-time source.

Owned first-party Coachi assets, such as the watch UI CTA screenshot, are explicit exceptions only. Use them selectively; do not turn every slideshow ending into an app ad.

Asset rotation must use `content/slideshows/visual-library/usage-log.json`. Treat selected, rendered, and posted usage as real usage. Prefer zero-use assets, avoid using the same image more than twice in 30 days, and do not reuse the same Supabase visual set on consecutive slideshows. Keep one visual world per slideshow; do not mix hills, lakes, and mountains in the same post. The selected world and lighting family must be written into the pack source before rendering.

## 4. Images 2.0 Hook-Only Mode

Use `templates/images-2-0-hook-only-prompt.md` for slide 1 only.

Production guardrail: do not generate all slideshow images with Images 2.0. Default Coachi mode is 1 Images 2.0 hook, 6 to 7 library assets, local text overlay.

## 5. Local Rendering

Install dependencies once:

```bash
npm install
```

Render:

```bash
npm run slideshow:render -- \
  --manifest content/slideshows/YYYY-MM-DD-slug/render-manifest.json
```

## 6. Queue And Postiz

The queue is ready for dry-runs:

```bash
npm run slideshow:queue -- \
  --schedule strategy/automation/tiktok-instagram-slideshow-content-engine/templates/postiz-schedule-manifest-template.json
```

Live scheduling requires self-hosted Postiz, official TikTok integration, `POSTIZ_URL`, `POSTIZ_API_KEY`, `POSTIZ_ENABLE_LIVE_POSTING=1`, and explicit user approval before scheduling public posts.

Use `POSTIZ_SETUP.md` before any live scheduling.

Safety rules:

- use official integrations only
- do not duplicate the same post across accounts
- do not hashtag stuff
- minimum 3 hours between posts per account
- maximum 3 posts per account per day
- never jump from one account to 50+ accounts in a week

This is compliance/risk control, not ban evasion.

## 6.5 Full Local Automation

Use the single full-loop command when testing the X-article architecture end to end:

```bash
npm run slideshow:full-loop -- \
  --mode dry-run \
  --count 1
```

What it does:

- loads `active-niches.json`
- filters sourced runner problems by active niche
- generates/selects a fresh candidate
- runs the slideshow pipeline
- creates the Images 2.0 hook-only prompt
- materializes library assets
- renders with the Sharp + Canvas compositor
- dry-runs Postiz scheduling
- writes `outputs/full-loop/.../full-loop-report.json`

Production full loop:

```bash
npm run slideshow:full-loop -- \
  --mode production \
  --count 1 \
  --generate-openai-hook
```

Queue mode:

```bash
npm run slideshow:full-loop -- \
  --mode production \
  --count 1 \
  --generate-openai-hook \
  --queue bullmq \
  --account postiz_integration_id
```

Use the direct end-to-end pipeline command when creating or repairing one specific slideshow pack:

```bash
npm run slideshow:pipeline -- \
  --date YYYY-MM-DD \
  --candidate-index 0 \
  --mock-hook
```

What it does:

- validates the engine
- generates sourced topic candidates
- creates a schema-based render manifest
- writes the Images 2.0 hook-only prompt
- selects and materializes Supabase/library assets
- renders slides with the Sharp + Canvas compositor
- creates captions and hashtags
- builds a Postiz dry-run schedule
- runs pack-level QA
- runs the Postiz schedule dry-run

Use `--mock-hook` only to test the loop locally. For a production pack, generate exactly one Images 2.0 hook image from `source/prompts.md`, save it to `slides/source/01-hook.png`, then rerun with `--hook-image /path/to/hook.png` or with the image already in place.

Production pack command:

```bash
npm run slideshow:pipeline -- \
  --date YYYY-MM-DD \
  --candidate-index 0 \
  --production \
  --generate-openai-hook
```

To generate only the hook for an existing pack:

```bash
npm run slideshow:openai-hook -- \
  --pack content/slideshows/YYYY-MM-DD-slug
```

Default TikTok hook generation uses the stronger `watch-stole-the-run` runner as the primary appearance reference:

```bash
npm run slideshow:openai-hook -- \
  --pack content/slideshows/YYYY-MM-DD-slug \
  --reference-image content/slideshows/2026-04-26-watch-stole-the-run-8-slide/slides/source/01-hook.png
```

The production pipeline, queue worker, and direct `slideshow:openai-hook -- --pack ...` command add that reference automatically when generating hooks. The clean park-portrait avatar is legacy fallback only.

The OpenAI hook generator uses the OpenClaw key source first (`OPENCLAW_OPENAI_API_KEY_FILE` or `~/.openclaw/secrets/openai-api-key`), then falls back to `OPENAI_API_KEY`, marketing `.env`, app repo `.env`, or the local OpenClaw context file. It writes `slides/source/01-hook.png` and `source/hook-provenance.json` without printing the key.

Production QA blocks:

- missing Images 2.0 hook provenance
- missing explicit emotion, generated avatar/world brief, or final CTA slide
- non-hook assets still marked `needs_review`
- already-posted slideshow ids
- `Top 5` hooks that do not deliver five numbered point slides
- production `Top 5` decks whose five points do not match `sourced_mistakes` in the raw runner problem bank
- known rejected abstract copy such as `Judging one spike`, `Ignoring heat`, `Ignoring sleep and stress`, `Chasing pace anyway`, or `Forgetting effort context`

Use `--allow-needs-review` only for test decks. Public posting should use approved, owned, or licensed assets.

## 7. Final Handoff

Before posting: rendered slides exist, captions exist, hashtags are short and relevant, QA passes, upload manifest is generated, and the user reviews the final public post.

After posting, log results with `npm run slideshow:log-result` and update the winner library when the decision is `repeat`.

Use the richer performance fields when available:

```bash
npm run slideshow:log-result -- \
  --slideshow-id YYYY-MM-DD-slug \
  --platform tiktok \
  --hook "Top 5 easy run mistakes" \
  --views-1h 500 \
  --views-24h 3000 \
  --likes 120 \
  --saves 18 \
  --shares 7 \
  --comments 9 \
  --follows 4 \
  --profile-visits 20 \
  --viewer-language "people asked if walk breaks count" \
  --decision repeat
```

The logger computes an `engagement_score` so the winner loop can compare hooks, saves, shares, comments, follows, and profile visits instead of only views.

Also mark the deck as posted:

```bash
npm run slideshow:log-result -- \
  --mark-posted \
  --slideshow-id YYYY-MM-DD-slug \
  --platform tiktok \
  --url https://www.tiktok.com/... \
  --pack content/slideshows/YYYY-MM-DD-slug
```

This updates `inputs/performance/posted-slideshows.json` and appends `posted` asset usage so future runs rotate away from public repeats.
