# Source Of Truth - X Article Adaptation

This document adapts the X article opened on `2026-04-26` into Coachi's slideshow content engine.

Source:

`https://x.com/alexcooldev/status/2047715075457507452`

Detailed research note:

`inputs/research/2026-04-26-x-alexcooldev-slideshow-automation-source.md`

## What We Adopt

### 0. Source Hierarchy

Use the X article as the source of truth for the slideshow production architecture:

1. Format library
2. Visual library
3. Local compositor
4. Asset storage
5. Queue/scheduler only after manual workflow is repeatable

For Coachi, this source does not override brand strategy, platform safety, or publish-approval rules. It gives the production model, not permission to copy content or mass-post.

### 1. Format Library First

The repeatable asset is not one slideshow. It is the extracted format.

Every winning slideshow should become a JSON-like schema:

```json
{
  "format_name": "runner_mistake_reframe_v1",
  "total_slides": 7,
  "slides": [
    {
      "slide_number": 1,
      "role": "hook",
      "text_template": "{data_point} IS LYING TO YOU",
      "visual_style_notes": "large contrast text over realistic running image",
      "image_prompt_template": "runner on {route} showing {emotion}, vertical 9:16"
    }
  ]
}
```

### 2. Reverse-Engineer Structure, Not Content

Use Codex GPT-5.5 to inspect screenshots of viral slideshows and extract:

- hook pattern
- payoff pattern
- final CTA pattern
- layout system
- text placement
- image-to-text ratio
- pacing

Do not copy the niche content or creator-specific visual identity.

### 3. Hybrid Image System

For Coachi:

- Slide 1: use ChatGPT Images 2.0 for a custom hook image.
- Slides 2 to 6: use approved Coachi visual library or generated reusable images.
- Slide 7: use a reusable comment-prompt background or brand-safe image.

This keeps quality high while reducing generation cost.

Treat Pinterest as:

- a style research source
- a search-intent source
- a way to understand what aesthetics humans already curate

Do not blindly scrape or reuse recognizable, watermarked, or creator-owned images as Coachi assets.

### 4. Local Text Composition

Text should be composited locally rather than baked into every generated image.

Benefits:

- consistent typography
- easier edits
- fewer image regeneration loops
- better legibility
- reusable source images

Preferred stack:

- Node.js
- `sharp`
- `@napi-rs/canvas`
- local font files
- export to `1080x1920`

Default overlay rule:

- base image has no text
- local compositor adds all post text
- first slide gets the largest hook
- middle slides get one sentence max
- final slide asks for a comment or save

### 5. Supabase As The Asset Library

The article uses storage as part of the asset system. Coachi's version is the separate `coachi-marketing-assets` Supabase project.

Use Supabase for:

- approved source images
- finished slides
- final static/Pinterest exports
- captions and QA metadata
- upload manifests and object metadata

Do not use the Coachi app Supabase project. Do not store user data or app secrets.

### 6. Queue Later, Manual Handoff Now

The source article recommends BullMQ, Redis, and Postiz for scale.

Coachi should use this in phases:

- now: Codex prepares pack, user publishes manually
- next: local render queue for daily pack creation
- later: Postiz scheduler for approved posts only

Do not automate final public posting without explicit action-time approval.

## What We Reject

- mass posting to many accounts
- scraping unlicensed recognizable people
- copying full content
- reposting identical slideshows
- hashtag stuffing
- using volume as the main strategy

## Coachi Operating Version

Daily slideshow production:

1. Pick one runner problem.
2. Select a proven format schema.
3. Fill the schema with Coachi-native copy.
4. Generate or select images.
5. Compose slides locally with consistent text overlay.
6. Upload approved assets into marketing Supabase.
7. Prepare TikTok, Instagram, and Pinterest copy when relevant.
8. Open upload pages and Finder folder.
9. User reviews and publishes.
10. Log results in the daily scorecard and winner library.

## First Coachi Format Schemas To Build

### Runner Mistake Reframe

```json
{
  "format_name": "runner_mistake_reframe_v1",
  "total_slides": 7,
  "slides": [
    { "slide_number": 1, "role": "hook", "text_template": "{RUNNER BELIEF} IS LYING TO YOU" },
    { "slide_number": 2, "role": "problem", "text_template": "You think {number} means {bad_outcome}." },
    { "slide_number": 3, "role": "context", "text_template": "{factor_1} changes it." },
    { "slide_number": 4, "role": "context", "text_template": "{factor_2} changes it too." },
    { "slide_number": 5, "role": "reframe", "text_template": "The better signal is {better_signal}." },
    { "slide_number": 6, "role": "rule", "text_template": "{simple_rule}" },
    { "slide_number": 7, "role": "comment", "text_template": "What throws you off more: {choice_a} or {choice_b}?" }
  ]
}
```

### Beginner Confidence Reset

```json
{
  "format_name": "beginner_confidence_reset_v1",
  "total_slides": 6,
  "slides": [
    { "slide_number": 1, "role": "hook", "text_template": "BEGINNERS GET THIS WRONG" },
    { "slide_number": 2, "role": "belief", "text_template": "You think progress means {false_signal}." },
    { "slide_number": 3, "role": "truth", "text_template": "Early progress is usually {true_signal}." },
    { "slide_number": 4, "role": "observation", "text_template": "That is why {common_problem} happens." },
    { "slide_number": 5, "role": "rule", "text_template": "Your next run only needs {simple_action}." },
    { "slide_number": 6, "role": "comment", "text_template": "Save this before your next easy run." }
  ]
}
```

### Data Is Not Coaching

```json
{
  "format_name": "data_is_not_coaching_v1",
  "total_slides": 7,
  "slides": [
    { "slide_number": 1, "role": "hook", "text_template": "DATA IS NOT COACHING" },
    { "slide_number": 2, "role": "problem", "text_template": "Your watch gives you {data_type}." },
    { "slide_number": 3, "role": "gap", "text_template": "It does not always tell you {missing_context}." },
    { "slide_number": 4, "role": "context", "text_template": "A coach asks what changed today." },
    { "slide_number": 5, "role": "reframe", "text_template": "The number needs context." },
    { "slide_number": 6, "role": "coachi", "text_template": "That is the gap Coachi is built around." },
    { "slide_number": 7, "role": "comment", "text_template": "What number messes with your run most?" }
  ]
}
```

## Implementation Backlog

1. Build `content/slideshows/` folder structure.
2. Add format schema JSON files.
3. Add local Node compositor.
4. Add a daily slideshow pack generator.
5. Add approved visual library metadata.
6. Add QA command.
7. Add posting handoff checklist.
8. Feed results into `WINNER_LIBRARY.md`.
