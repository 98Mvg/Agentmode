# Automating TikTok/Instagram Slideshow Content With Codex GPT-5.5 + ChatGPT Images 2.0

## 1. Strategy

The slideshow engine is for fast, repeatable content production.

This guide is now anchored to the opened X article source note:

`SOURCE_OF_TRUTH_X_ARTICLE.md`

The core loop:

1. Pick one sourced runner problem.
2. Turn it into a sharp hook.
3. Build a 5 to 8 slide story.
4. Generate one hook image and select Supabase library images for the remaining slides.
5. Add native platform copy.
6. Upload manually through TikTok/Instagram.
7. Log performance and reuse winners.

This should not feel like generic motivation. It should feel like a real coaching insight from someone building Coachi.

The most important update from the X article: build the reusable format library before building the automation. The format schema is the asset.

The `2026-05-05` MaverickEcom article adds the creative quality bar:

- do not invent the format first
- extract a proven hook structure
- write hooks under `10` words
- use real runner/comment language
- make Coachi the natural next step only after the post gives value
- use one CTA, not several

Execution order:

1. Format library
2. Coachi visual library
3. Local text compositor
4. Supabase asset storage
5. Queue/scheduler only after the manual workflow repeatedly works

Default hybrid image rule:

1. Slide 1 hook: Images 2.0 custom generation.
2. Middle payoff/content slides: tagged Supabase visual-library image.
3. Final CTA slide: Supabase visual-library image or reusable CTA template.

This is the default cost-control path and the production guardrail: Images 2.0 is slide-1-only for slideshow work.

## 2. Channel Role

TikTok:

- reach and discovery
- punchier hooks
- simple visual story
- faster testing

Instagram:

- trust and saves
- slightly cleaner structure
- stronger caption
- better carousel depth

Pinterest:

- search and evergreen discovery
- one strong vertical image
- clear beginner-running keyword angle
- traffic support for proven hooks
- style and search-intent research for future slideshow visuals

The same source idea can feed TikTok, Instagram, and Pinterest, but the caption and first slide should be platform-tuned.

## 3. Content Rules

Use these constraints by default:

- 5 to 8 slides
- 1 idea per slideshow
- 6 to 12 words on the first slide when needed to preserve the source question, contradiction, number, or runner pain
- 6 to 14 words on the other slides
- hook stays Coachi-original and specific; do not compress a proven TikTok mechanic into a generic short label
- no generic fitness advice
- no fake guru tone
- no `Did you know`, `discover`, `unlock`, `game-changing`, or jargon openers
- no app mention unless it naturally fits
- Coachi appears in 10 to 20 percent of posts, not every post
- make the first slide strong enough to stop scrolling
- use local text overlay instead of baking text into every generated base image
- do not copy creator-specific visuals, captions, or content from source examples

Best slideshow formats:

- `Mistake -> correction`
- `Number people trust -> why it lies`
- `Beginner belief -> better mental model`
- `Before Coachi -> after Coachi`
- `Run data -> real-world context`
- `One hard truth -> practical fix`

## 4. Daily Workflow

### Step 1 - Choose The Angle

Pick one problem from the real problem bank:

`inputs/research/raw-runner-problems.json`

Generate ranked candidates:

```bash
npm run slideshow:topics -- --date YYYY-MM-DD --limit 5
```

Use only problems with a source URL, exact runner language, and a score of `12+`.

Default problem types:

- pace anxiety
- easy-run drift
- watch-checking anxiety
- beginner uncertainty
- zone confusion
- running too hard on easy days
- recovery day guilt
- inconsistent motivation
- comparing data to other runners

Decision rule:

If the idea needs motion, make a video. If the idea needs clarity, make a slideshow.

Do not ask AI for generic viral ideas before the raw problem has been collected.

### Step 2 - Write The Slideshow Skeleton

Start from one of the format schemas in:

`strategy/automation/tiktok-instagram-slideshow-content-engine/schemas/`

Before writing, check the hook against the bank:

`inputs/research/coachi-viral-hooks-and-text-bank-2026-04-30.md`

Use this shape:

1. Hook
2. Problem
3. Why it happens
4. Reframe
5. Practical rule
6. Optional Coachi tie-in
7. Comment prompt

For 6-slide app-proof posts, use:

1. Hook
2. Problem in plain words
3. Escalation
4. Consequence
5. Practical cue
6. One natural CTA

Example:

```text
Slide 1: YOUR PACE IS LYING
Slide 2: Hills change the number.
Slide 3: Wind changes the number.
Slide 4: Fatigue changes the number.
Slide 5: Effort is the signal.
Slide 6: Coach the run, not the split.
Slide 7: What throws you off most?
```

### Step 3 - Generate Image Prompts

Codex writes one Images 2.0 prompt for slide 1 using `templates/images-2-0-hook-only-prompt.md`.
Slides 2-7 use Supabase visual-library asset picks and local text overlays, not Images 2.0 generation.

The production hook-image generator retries transient OpenAI failures before stopping: default timeout is `180000ms`, default retry count is `3`, and retry/fallback behavior is stored in `source/hook-provenance.json`. If all retryable attempts fail, it can reuse the latest approved Images 2.0 hook image for review continuity; use `--disable-fallback` when a fresh hook image is mandatory.

Use visual metadata from:

`content/slideshows/visual-library/visual-library.json`

Image rules:

- vertical 9:16
- consistent runner identity
- realistic running world
- no baked-in text unless intentionally testing text-in-image
- leave space for overlay text
- vary route, angle, light, and weather across different days
- keep one visual system inside the same slideshow

Use ChatGPT Images 2.0 for:

- slide 1 hook image only by default
- fixed character references
- carousel covers
- visual metaphors for runner data

Do not use ChatGPT Images 2.0 to generate all images in a slideshow.

Use Pinterest-style research for:

- aesthetics
- composition ideas
- keyword intent
- mood/color tagging

Do not reuse recognizable, watermarked, or creator-owned images as Coachi assets unless they are clearly licensed or created for us.

For middle slides, choose from the Supabase-backed visual-library collections first:

- `hills_effort` for hill, effort, and pace-context slides
- `nature_context` for terrain, route, weather, and environment slides
- `details_emotion` for tension, fatigue, uncertainty, and human detail slides
- `lake_calm` for reframe, recovery, and controlled-effort slides
- `cta_ending` for comment, save, and final CTA slides

Use the API path later only when we need scripted batch generation. OpenAI's image docs support image generation and editing through the Image API and image generation tool in the Responses API, including reference images and output controls.

Before building the picklist, refresh the Supabase render manifest from the curated local library:

```bash
npm run slideshow:supabase-library -- \
  --supabase-url https://PROJECT.supabase.co
```

Then create the asset picklist:

```bash
npm run slideshow:assets -- \
  --manifest content/slideshows/YYYY-MM-DD-slug/render-manifest.json \
  --out content/slideshows/YYYY-MM-DD-slug/asset-picklist.json
```

If the public Supabase URLs are live, materialize from remote storage:

```bash
npm run slideshow:materialize -- \
  --picklist content/slideshows/YYYY-MM-DD-slug/asset-picklist.json \
  --prefer-remote
```

Without `--prefer-remote`, the materializer uses local fallback files for dry-run rendering.

To make the Supabase URLs live, dry-run and then execute the library upload:

```bash
npm run slideshow:upload-library
npm run slideshow:upload-library -- --execute
```

Only execute after confirming `MARKETING_SUPABASE_URL` points to the marketing asset project and `MARKETING_SUPABASE_SECRET_KEY` is available locally.

### Step 4 - Save Assets

Recommended folder for each day:

```text
content/slideshows/YYYY-MM-DD-slug/
  source/
    prompts.md
    reference-face.png
  render-manifest.json
  slides/
    source/
      01-hook.png
      02-problem.png
      03-context.png
      04-reframe.png
      05-rule.png
      06-coachi.png
      07-comment.png
    rendered/
      01-hook.png
      02-problem.png
      03-context.png
      04-reframe.png
      05-rule.png
      06-coachi.png
      07-comment.png
  copy/
    tiktok-caption.txt
    instagram-caption.txt
    pinterest-title.txt
    pinterest-description.txt
    hashtags.txt
  pinterest/
    final-pinterest.png
  qa.md
```

Legacy simple structure is still acceptable while producing manually:

```text
content/slideshows/YYYY-MM-DD-slug/
  slides/
    01-hook.png
    02-problem.png
    03-context.png
    04-reframe.png
    05-rule.png
    06-coachi.png
    07-comment.png
  copy/
    tiktok-caption.txt
    instagram-caption.txt
    pinterest-title.txt
    pinterest-description.txt
    hashtags.txt
  pinterest/
    final-pinterest.png
  qa.md
```

Naming rule:

Use stable numbers so upload order is obvious.

Optional storage handoff:

- keep local files as the source of truth during production
- upload only after the pack passes QA
- use the separate `coachi-marketing-assets` Supabase project
- never use the Coachi app Supabase project or app runtime credentials
- follow `SUPABASE_STORAGE_PLAN.md`
- `--execute` uploads assets and upserts metadata rows into `marketing_asset_objects`

Dry-run the upload manifest before using real credentials:

```bash
python3 scripts/upload_slideshow_assets.py \
  --root content/slideshows/YYYY-MM-DD-slug \
  --campaign-date YYYY-MM-DD \
  --slug slug
```

### Step 5 - Add Text Overlay

Two options:

- Native app text: upload images, add text inside TikTok/Instagram.
- Rendered text: generate clean slides with final text already baked in.

Default:

Use rendered text for repeatability, but keep the source images text-free so they can be reused.

Create the render manifest from:

`strategy/automation/tiktok-instagram-slideshow-content-engine/templates/render-manifest-template.json`

Then validate and render:

```bash
npm run slideshow:validate
npm run slideshow:render -- --manifest content/slideshows/YYYY-MM-DD-slug/render-manifest.json
```

Overlay rules:

- first slide: large hook
- middle slides: one sentence max
- final slide: comment prompt
- high contrast
- no tiny text
- no paragraphs

### Step 6 - Captions

TikTok caption:

```text
Your pace can move without the run failing.

Effort is the part most runners forget to read.

#running #easyrun #runningtips #beginnerrunner #runtok
```

Instagram caption:

```text
A slower easy pace does not always mean worse fitness.

Sometimes the route, stress, sleep, heat, and fatigue changed the number before your fitness changed.

The better question is:
did the effort stay controlled?

What throws you off more: pace or heart rate?
```

Hashtag rule:

- TikTok: 4 to 7 tags
- Instagram: 8 to 15 tags
- mix broad, niche, and intent tags
- never make hashtags longer than the post

### Step 7 - Upload Handoff

Codex can prepare:

- files
- folder
- captions
- hashtag list
- upload page
- checklist

User should do:

- final file selection if drag/drop is unreliable
- final publish click

This avoids accidental public posts and keeps platform risk low.

### Step 8 - Log Results

After posting, log:

- URL
- hook
- slide count
- views after 1 hour
- views after 24 hours
- saves
- comments
- follows
- strongest viewer language
- whether to repeat, iterate, or stop

Add winners to:

`inputs/performance/WINNER_LIBRARY.md`

Use:

```bash
npm run slideshow:log-result -- \
  --slideshow-id YYYY-MM-DD-slug \
  --platform tiktok \
  --hook "HOOK TEXT" \
  --views-24h 1000 \
  --decision repeat
```

## 5. Codex Prompt For Daily Run

Use this prompt:

```text
You are Coachi market strategist.

Create today's TikTok and Instagram slideshow pack.

Use:
- one runner problem
- 5 to 8 slides
- sharp first slide hook
- one realistic ChatGPT Images 2.0 hook prompt
- Pinterest/library picks for slides 2-7
- TikTok caption
- Instagram caption
- hashtag set
- QA checklist

Keep Coachi subtle.
Do not mention Coachi unless it naturally improves the idea.
Make it useful for beginner/intermediate runners.
Save outputs under content/slideshows/YYYY-MM-DD-slug/.
```

## 6. ChatGPT Images 2.0 Prompt Pattern

Use this for slide 1 only:

```text
Create a photorealistic vertical 9:16 social image for a running coaching slideshow.

Subject:
<same runner identity or relevant running scene>

Scene:
<route, weather, light, background>

Composition:
<where runner/object sits, where text space should be>

Mood:
<calm, focused, slightly tense, relieved>

Constraints:
No text, no logo, no app UI, no watermark, no distorted limbs, no fake watch close-up, no exaggerated AI look.
Leave clean negative space for overlay text.
```

## 7. Quality Checklist

Before upload:

- first slide is readable in under 1 second
- every slide has one job
- text is large enough on phone
- image order tells a story
- no repeated slide meaning
- no obvious AI artifacts in hands, face, or legs
- caption does not oversell
- hashtags are relevant
- final slide invites a comment

Reject the pack if:

- the hook could fit any fitness account
- the image looks fake at thumbnail size
- Coachi is forced into the post
- the slideshow teaches too many things at once

## 8. Automation Roadmap

Phase 1: Codex-assisted manual production

- Codex writes pack
- ChatGPT Images 2.0 generates the hook image only
- library/Pinterest assets fill slides 2-7
- user uploads manually
- format schemas and visual metadata guide the pack

Phase 2: Local render automation

- Codex creates prompts and metadata
- local script builds text overlays with `sharp` and `@napi-rs/canvas` when available
- output is ordered photo-carousel images by default
- MP4 export is an explicit fallback only

Phase 3: Scheduled daily prep

- Codex automation creates the pack at 07:30
- Finder opens the folder
- TikTok/Instagram upload pages open
- user reviews and publishes

Do not automate final publish without explicit action-time approval.

Phase 4: Isolated asset storage

- upload approved local assets to the separate marketing Supabase project
- store final public files in `slideshow-public`
- store prompts, references, captions, and QA notes in `slideshow-private`
- save `upload-manifest.json` with the daily pack
- keep this disconnected from the Coachi app backend

Phase 5: Queue and Postiz live/direct-public readiness

- generate asset picklist
- render slides locally
- enqueue composite jobs with BullMQ
- dry-run Postiz payloads
- run production preflight
- validate rate limits, duplicate checks, official integration use, and TikTok direct-public settings

Live scheduling requires `--publish-mode direct-public`, valid Postiz/TikTok credentials, HTTPS media readiness, and `POSTIZ_ENABLE_LIVE_POSTING=1`.

## 9. Source Notes

OpenAI image-generation docs describe Image API and Responses API support for generating/editing images, including reference images, output size, quality, format, and transparent background controls:

- https://platform.openai.com/docs/guides/images/image-generation
- https://platform.openai.com/docs/guides/tools-image-generation

OpenAI describes Codex as a coding agent that can read, modify, run code, and support local/cloud workflows:

- https://openai.com/codex
- https://platform.openai.com/docs/codex

For this operating guide, `ChatGPT Images 2.0` means the current ChatGPT image generation workflow available in the product, while saved production assets should still be stored and named in this workspace.
