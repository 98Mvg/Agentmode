# TikTok + Instagram Slideshow Content Engine

This folder defines the Coachi workflow for producing slideshow/photo content with Codex GPT-5.5 and ChatGPT Images 2.0.

## Goal
Create repeatable TikTok and Instagram slideshow content that can be produced daily with low friction:

- Codex writes the idea, hook, slide structure, prompts, captions, and QA checklist.
- ChatGPT Images 2.0 generates only the custom hook image by default.
- Supabase marketing storage supplies the approved payoff and CTA pictures.
- The shared marketing workspace stores prompts, final slides, captions, and run notes.
- Publishing stays as a browser handoff: Codex prepares everything, the user presses the final publish button.

## Non-Negotiable Slideshow Spine
Every production slideshow must include these four parts:

- `Emotion`: define the viewer emotion in the source idea and make the slide copy pay it off.
- `Images 2.0`: generate exactly one custom slide-1 hook image, using a high-quality hook selected from the source-backed TikTok text bank.
- `Avatar world`: the hook image must use the generated Coachi runner avatar inside one selected visual world, then the remaining slides must stay in that same world and lighting family.
- `CTA`: the final slide must ask for one simple next action, usually a comment, save, profile click, or watch/app try-on when the context earns it.

Slides `1-6` must use `inputs/research/tiktok-proven-slideshow-text-bank.json` before generic generated copy. Treat the bank as proof of structure and simplicity, not as permission to copy creator wording. If the bank has no fit, update the bank from a real TikTok/Instagram scan before publishing a new format.

Do not mix hills, lakes, and mountains in one deck. Pick one world, keep the avatar/route/lighting coherent, and rotate the Supabase/library images inside that world.

CTA visual rule: use Supabase `cta_ending` images as the standard Coachi marketing CTA source and rotate them for variety. When the CTA is an earned Coachi app-proof ending, rotate between the owned phone and watch variants in `coachi-app-cta-rotation`; do not repeat the same device family every time. Current app-proof variants use a 55:00 workout duration, not the old 00:30/00:23 timer.

Top-level daily command:

```bash
npm run growth:daily -- --date YYYY-MM-DD --mode minimum --execute --open
```

Use the top-level growth command for daily social operations. Use this slideshow engine directly only when generating, testing, or repairing a TikTok/Instagram slideshow deck.

## Why Slideshows
Slideshows are faster than full video generation, cheaper to iterate, and better for testing hooks.

Use slideshows when:

- the idea is educational, contrarian, or list-based
- the visual can be carried by still images plus strong text
- Veo/Runway video generation is blocked, slow, or inconsistent
- the main goal is testing message-market fit before producing a full video

## Folder Contents
- `SOURCE_OF_TRUTH_X_ARTICLE.md` - adapted source-of-truth from the opened X article.
- `PIPELINE_READY_CHECKLIST.md` - required steps before posting slideshow content.
- `STEP_BY_STEP_GUIDE.md` - the operating strategy and daily workflow.
- `POSTIZ_SETUP.md` - dry-run-first Postiz setup and live scheduling guardrails.
- `SUPABASE_STORAGE_PLAN.md` - isolated marketing asset storage setup.
- `formats/coachi-formats.json` - canonical Coachi-specific viral format catalog.
- `schemas/` - reusable slideshow format schemas.
- `supabase-marketing-assets.sql` - SQL bootstrap for the separate marketing Supabase project.
- `templates/slideshow-day-pack-template.md` - daily pack format.
- `templates/viral-hook-structure-generator.md` - hook and slide-structure generator for sourced runner problems.
- `templates/image-prompt-template.md` - reusable ChatGPT Images 2.0 prompt format.
- `templates/images-2-0-hook-only-prompt.md` - required hook-only Images 2.0 prompt.
- `templates/reverse-engineering-prompt.md` - Codex GPT-5.5 prompt for extracting structure.
- `templates/viral-format-capture-template.md` - safe format collection template.
- `templates/pinterest-library-import-template.json` - metadata shape for user-curated Pinterest/library imports.
- `templates/postiz-schedule-manifest-template.json` - dry-run-first Postiz scheduling manifest.
- `templates/render-manifest-template.json` - local compositor input format.
- `templates/supabase-upload-manifest-template.json` - expected storage manifest shape.

## Default Daily Output
- 1 TikTok slideshow
- 1 Instagram carousel or Reel-style slideshow
- 1 explicit emotion, 1 selected visual world, and 1 generated-avatar hook brief
- 1 source-backed TikTok text-bank hook, 1 Images 2.0 hook prompt, plus 6 Supabase visual-library asset picks from the same visual world
- `source/slideshow.json`, `source/hook-candidates.json`, `source/hook-brief.json`, and `source/qa-report.json`
- 1 caption per platform
- 1 hook test note
- 1 short QA note before upload
- local Supabase upload manifest after local QA
- optional Pinterest image/title/description when the idea fits search intent

## Asset Storage
Use Supabase only as an isolated marketing asset store.

The required project separation is:

- App/runtime Supabase: untouched
- Marketing Supabase: `coachi-marketing-assets`

Use `SUPABASE_STORAGE_PLAN.md` before wiring credentials or upload automation. The upload helper is dry-run by default:

```bash
python3 scripts/upload_slideshow_assets.py \
  --root content/slideshows/YYYY-MM-DD-slug \
  --campaign-date YYYY-MM-DD \
  --slug slug
```

When `--execute` is used, the helper uploads files and upserts object rows into `marketing_asset_objects`. The generated `upload-manifest.json` stays local and is not uploaded back into storage.

## Local Rendering
Validate the slideshow engine:

```bash
npm run slideshow:validate
```

Generate topic candidates from sourced runner problems:

```bash
npm run slideshow:topics -- \
  --date YYYY-MM-DD \
  --limit 5
```

Each candidate includes:
- core problem, emotion, and pattern
- 30 viral-format hooks
- top 5 hook recommendations
- a 7-slide structure
- visual mapping for one selected world, emotional detail slides, and the CTA image category

Use `templates/viral-hook-structure-generator.md` when you want a manual or Codex-written version from one specific Reddit/comment problem.

Hook source rule:
- prioritize `inputs/research/tiktok-proven-slideshow-text-bank.json`
- prioritize `inputs/research/tiktok-running-hook-pattern-bank.md`
- do not mention `data` in hooks
- adapt TikTok-observed structures, never exact creator wording

Install renderer dependencies once:

```bash
npm install
```

Run the full local loop when you want Codex to create a pack end to end:

```bash
npm run slideshow:pipeline -- \
  --date YYYY-MM-DD \
  --candidate-index 0 \
  --mock-hook
```

`--mock-hook` is only for local pipeline testing. For publishable output, generate one Images 2.0 hook image from `source/prompts.md`, save it as `slides/source/01-hook.png`, and rerun without `--mock-hook` or with `--hook-image /path/to/hook.png`.

Generate the hook image through the OpenAI Images API:

```bash
npm run slideshow:openai-hook -- \
  --pack content/slideshows/YYYY-MM-DD-slug
```

Default TikTok slideshow hook standard:
- identity reference: `content/ads/reference/organic-runner-face-v2-reference.png`
- viral face/style reference: `content/slideshows/2026-04-26-watch-stole-the-run-8-slide/slides/source/01-hook.png`

Production automation and direct `slideshow:openai-hook -- --pack ...` calls pass both references automatically. This keeps the Coachi face family consistent while using the stronger `watch-stole-the-run` look: darker kit, visible sweat, sharper face detail, cinematic contrast, and a more human scroll-stopping expression.

The generator uses the OpenClaw key source first (`OPENCLAW_OPENAI_API_KEY_FILE` or `~/.openclaw/secrets/openai-api-key`), then falls back to `OPENAI_API_KEY`, the marketing `.env`, the app repo `.env`, or the local OpenClaw context file. It writes:

- `slides/source/01-hook.png`
- `source/hook-provenance.json`

It does not print the API key.

Production mode is stricter:

```bash
npm run slideshow:pipeline -- \
  --date YYYY-MM-DD \
  --candidate-index 0 \
  --production \
  --generate-openai-hook
```

Production QA requires:
- exactly one Images 2.0 hook image
- `source/hook-provenance.json`
- `source/slideshow.json` with format id, selected hook, target audience, slide visual directions, image source preferences, caption, and hashtags
- `source/qa-report.json` written for both pass and fail states
- an explicit `emotion`, `visual_world`, and generated avatar/world brief in the pack source
- 8-10 scored hook candidates using the 1-10 Coachi rubric for runner pain, curiosity, simplicity, emotional relatability, Coachi fit, TikTok-native wording, and non-marketing tone
- hook and slide text provenance from `inputs/research/tiktok-proven-slideshow-text-bank.json`, unless the pack is an explicitly marked local test
- no hard-sell CTA, no corporate fitness wording, and no Coachi mention before slide 6
- approved, owned, or licensed non-hook assets
- no already-posted slideshow id
- list hooks such as `Top 5` must deliver five numbered point slides

Use `--allow-needs-review` only for local testing or drafts. Do not use it for public posting.

Run the article-style full loop from one command:

```bash
npm run slideshow:full-loop -- \
  --mode dry-run \
  --count 1
```

The full loop loads `active-niches.json`, filters the real runner problem bank per active niche, creates a fresh slideshow candidate, writes the Images 2.0 hook prompt, materializes library images, renders the slides, and dry-runs the Postiz schedule. Dry-run mode uses a mock hook image and local library fallback so it can verify the full path without spending image-generation credits.

Production full loop:

```bash
npm run slideshow:full-loop -- \
  --mode production \
  --count 1 \
  --generate-openai-hook
```

Production mode generates exactly one OpenAI/Images 2.0 hook image, uses stricter QA, prefers Supabase assets, and still keeps Postiz scheduling dry-run unless the live Postiz env gates are explicitly enabled.

Live TikTok scheduling through Postiz:

```bash
npm run slideshow:full-loop -- \
  --mode production \
  --count 1 \
  --generate-openai-hook \
  --live-schedule \
  --schedule-platform tiktok \
  --publish-mode direct-public
```

Required environment:
- `POSTIZ_ENABLE_LIVE_POSTING=1`
- `POSTIZ_URL` or `POSTIZ_PUBLIC_API_BASE`
- `POSTIZ_API_KEY`
- `POSTIZ_TIKTOK_ACCOUNT_ID`

The schedule caption uses `copy/tiktok-postiz-caption.txt`, which combines the platform caption and hashtags before uploading to Postiz.
Run production preflight before any live schedule:

```bash
npm run slideshow:prod-preflight -- \
  --pack content/slideshows/YYYY-MM-DD-slug \
  --publish-mode direct-public
```

Direct public mode uses TikTok `autoAddMusic=yes`; exact playlist selection remains manual-only.

BullMQ handoff mode:

```bash
npm run slideshow:full-loop -- \
  --mode production \
  --count 1 \
  --generate-openai-hook \
  --queue bullmq \
  --account postiz_integration_id
```

Start workers separately with `npm run slideshow:queue -- --worker`. Use `npm run slideshow:queue-smoke` to verify Redis/BullMQ connectivity before relying on queue mode.

Render a pack after base images exist:

```bash
npm run slideshow:render -- \
  --manifest content/slideshows/YYYY-MM-DD-slug/render-manifest.json
```

The renderer uses `sharp` plus `@napi-rs/canvas` when installed for measured text wrapping and font registration. It falls back to SVG overlays if canvas is unavailable. Base images stay text-free and final 1080x1920 overlay text is applied locally.

## Queue And Scheduling
Create an asset picklist before sourcing images:

```bash
npm run slideshow:supabase-library -- \
  --supabase-url https://PROJECT.supabase.co
```

This creates `content/slideshows/visual-library/supabase-library-manifest.json`, the render-time picture source. Pinterest/local files remain the intake and offline fallback.

Dry-run the first Supabase library upload:

```bash
npm run slideshow:upload-library
```

Execute only after the bucket and credentials are confirmed:

```bash
npm run slideshow:upload-library -- --execute
```

```bash
npm run slideshow:assets -- \
  --manifest content/slideshows/YYYY-MM-DD-slug/render-manifest.json \
  --out content/slideshows/YYYY-MM-DD-slug/asset-picklist.json
```

Supabase visual-library assets are preferred when the Supabase manifest exists. Owned Coachi assets only outrank Supabase when the render manifest explicitly names the owned asset in `preferred_asset_ids`.

Dry-run a Postiz schedule:

```bash
npm run slideshow:queue -- \
  --schedule strategy/automation/tiktok-instagram-slideshow-content-engine/templates/postiz-schedule-manifest-template.json
```

Live scheduling is disabled unless `POSTIZ_ENABLE_LIVE_POSTING=1` is set and the user gives explicit action-time approval. Use official integrations only.

Log performance after posting:

```bash
npm run slideshow:log-result -- \
  --slideshow-id YYYY-MM-DD-slug \
  --platform tiktok \
  --hook "HOOK TEXT" \
  --format-id easy_run_too_fast \
  --views-24h 1000 \
  --saves 60 \
  --comments 8 \
  --profile-visits 20 \
  --app-store-clicks 4 \
  --installs 1 \
  --decision repeat
```

Mark a deck as publicly posted so the growth command does not reuse it:

```bash
npm run slideshow:log-result -- \
  --mark-posted \
  --slideshow-id YYYY-MM-DD-slug \
  --platform tiktok \
  --url https://www.tiktok.com/... \
  --pack content/slideshows/YYYY-MM-DD-slug
```

The posted registry lives at `inputs/performance/posted-slideshows.json`. Asset usage is tracked in three stages: `selected`, `rendered`, and `posted`. Rotation decisions prioritize actual `posted` usage.

## Canonical Workspace
All outputs from this strategy should stay inside:

`/Volumes/Riot APFS/Agentmode/coachi-marketing`

Do not store slideshow campaign outputs in the Coachi app/runtime repo.
