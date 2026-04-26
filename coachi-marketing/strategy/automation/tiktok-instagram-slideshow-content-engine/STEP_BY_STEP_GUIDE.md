# Automating TikTok/Instagram Slideshow Content With Codex GPT-5.5 + ChatGPT Images 2.0

## 1. Strategy

The slideshow engine is for fast, repeatable content production.

This guide is now anchored to the opened X article source note:

`SOURCE_OF_TRUTH_X_ARTICLE.md`

The core loop:

1. Pick one runner problem.
2. Turn it into a sharp hook.
3. Build a 5 to 7 slide story.
4. Generate one consistent image set.
5. Add native platform copy.
6. Upload manually through TikTok/Instagram.
7. Log performance and reuse winners.

This should not feel like generic motivation. It should feel like a real coaching insight from someone building Coachi.

The most important update from the X article: build the reusable format library before building the automation. The format schema is the asset.

Execution order:

1. Format library
2. Coachi visual library
3. Local text compositor
4. Supabase asset storage
5. Queue/scheduler only after the manual workflow repeatedly works

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

- 5 to 7 slides
- 1 idea per slideshow
- 3 to 7 words on the first slide
- 6 to 14 words on the other slides
- no generic fitness advice
- no fake guru tone
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

Pick one problem from the current content bank:

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

### Step 2 - Write The Slideshow Skeleton

Use this shape:

1. Hook
2. Problem
3. Why it happens
4. Reframe
5. Practical rule
6. Optional Coachi tie-in
7. Comment prompt

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

Codex writes one prompt per slide using `templates/image-prompt-template.md`.

Image rules:

- vertical 9:16
- consistent runner identity
- realistic running world
- no baked-in text unless intentionally testing text-in-image
- leave space for overlay text
- vary route, angle, light, and weather across different days
- keep one visual system inside the same slideshow

Use ChatGPT Images 2.0 for:

- fixed character references
- clean slideshow stills
- carousel covers
- visual metaphors for runner data
- no-face or visible-face runner sets

Use Pinterest-style research for:

- aesthetics
- composition ideas
- keyword intent
- mood/color tagging

Do not reuse recognizable, watermarked, or creator-owned images as Coachi assets unless they are clearly licensed or created for us.

Use the API path later only when we need scripted batch generation. OpenAI's image docs support image generation and editing through the Image API and image generation tool in the Responses API, including reference images and output controls.

### Step 4 - Save Assets

Recommended folder for each day:

```text
content/slideshows/YYYY-MM-DD-slug/
  source/
    prompts.md
    reference-face.png
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

## 5. Codex Prompt For Daily Run

Use this prompt:

```text
You are Coachi market strategist.

Create today's TikTok and Instagram slideshow pack.

Use:
- one runner problem
- 5 to 7 slides
- sharp first slide hook
- realistic ChatGPT Images 2.0 prompts
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

Use this for every slide:

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
- ChatGPT Images 2.0 generates slides
- user uploads manually

Phase 2: Local render automation

- Codex creates prompts and metadata
- local script builds text overlays
- output is ready-to-upload images or MP4 slideshow

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

## 9. Source Notes

OpenAI image-generation docs describe Image API and Responses API support for generating/editing images, including reference images, output size, quality, format, and transparent background controls:

- https://platform.openai.com/docs/guides/images/image-generation
- https://platform.openai.com/docs/guides/tools-image-generation

OpenAI describes Codex as a coding agent that can read, modify, run code, and support local/cloud workflows:

- https://openai.com/codex
- https://platform.openai.com/docs/codex

For this operating guide, `ChatGPT Images 2.0` means the current ChatGPT image generation workflow available in the product, while saved production assets should still be stored and named in this workspace.
