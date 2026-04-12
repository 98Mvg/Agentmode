# Coachi Gemini 2.5 Flash Image CLI Workflow

## Purpose

Use the existing Gemini CLI path for Coachi marketing image generation when you want a repeatable local script workflow instead of the built-in Codex image tool.

This is the right path when:
- you want a terminal command you can rerun
- you want batch generation from a file
- the built-in Codex image tool is unavailable in-session

This workflow is based on the existing repo pattern in:
- [/Users/mariusgaarder/Documents/treningscoach/scripts/generate_session_end.py](/Users/mariusgaarder/Documents/treningscoach/scripts/generate_session_end.py)

## 🧩 1. CLI (Command Line Interface)

This is the default Coachi marketing workflow for saved image generation.
- use it when the image should be reusable in `content/ads/generated/`
- use it when the prompt should live in `inputs/notes/`
- use it when you want repeatable commands and batch generation
- do not start with a large batch; make one strong image first

## Tooling

- model: `gemini-2.5-flash-image`
- SDK: `google-genai`
- auth: `GEMINI_API_KEY`
- workspace CLI:
  - [/Volumes/Riot APFS/Agentmode/coachi-marketing/scripts/gemini-cli](/Volumes/Riot%20APFS/Agentmode/coachi-marketing/scripts/gemini-cli)
- backend image script:
  - [/Volumes/Riot APFS/Agentmode/coachi-marketing/scripts/generate_gemini_images.py](/Volumes/Riot%20APFS/Agentmode/coachi-marketing/scripts/generate_gemini_images.py)

## Setup

Install the SDK once:

```bash
pip3 install google-genai
```

Provide the API key:

```bash
export GEMINI_API_KEY="YOUR_KEY_HERE"
```

The script also checks `.env` files in the repo/workspace path if the env var is not set.

## One Image First

Use one image first before running a batch.

Create a prompt file like:
- `inputs/notes/watch-check-prompt.txt`

Then run:

```bash
cd "/Volumes/Riot APFS/Agentmode/coachi-marketing"

scripts/gemini-cli image generate \
  --prompt-file inputs/notes/watch-check-prompt.txt \
  --output content/ads/generated/watch-check-v1.png
```

## Best First Prompt

```text
Generate a premium realistic vertical social image for Coachi, an AI running coach app.

Concept: Stop checking your watch every 20 seconds.

Scene: a runner outdoors mid-run, repeatedly glancing at their watch with visible frustration and uncertainty.

Brand position: Coachi is an AI coach, not a tracking app.

Style: premium realistic fitness photography, cinematic but believable, emotionally sharp, not generic stock-photo energy.

Constraints:
- no app UI
- no text on image
- no logos from other brands
- do not make it look like a smartwatch advertisement
- focus on one clear runner problem: too much checking, too much guessing, not enough coaching
```

## Batch Generation

The existing Coachi batch file already works for this CLI:
- [2026-03-30-gpt-image-1-carousel-batch.jsonl](/Volumes/Riot%20APFS/Agentmode/coachi-marketing/inputs/notes/2026-03-30-gpt-image-1-carousel-batch.jsonl)

Run it with:

```bash
cd "/Volumes/Riot APFS/Agentmode/coachi-marketing"

scripts/gemini-cli image generate-batch \
  --input inputs/notes/2026-03-30-gpt-image-1-carousel-batch.jsonl \
  --out-dir content/ads/generated/carousel-openers \
  --sleep-seconds 1
```

## Text Helpers

Use the same CLI for short-form copy work without touching the render pipeline:

```bash
scripts/gemini-cli text optimize \
  --spec inputs/notes/social-video-template.json \
  --output outputs/daily/social-video-template.optimized.json
```

```bash
scripts/gemini-cli text hook \
  --spec inputs/notes/social-video-template.json
```

```bash
scripts/gemini-cli text caption \
  --spec inputs/notes/social-video-template.json
```

## Output Rules

Save selected final images under:
- `content/ads/generated/`

Suggested filenames:
- `watch-check-v1.png`
- `easy-run-v1.png`
- `busy-adult-v1.png`

For batch output:
- `content/ads/generated/carousel-openers/`

Do not overwrite an existing winner unless the new image is intentionally replacing it.

## Continuity Rules

- Reuse existing strong running images for content before generating new duplicates.
- For organic Instagram and TikTok video or cover assets, keep the same face across the related image set so the campaign feels like one person/story.
- Default organic character anchor:
  - male runner
  - age `25-35`
  - lean endurance-athlete build, not bulky
  - short dark slightly textured hair
  - calm, focused expression
  - clean, minimal, performance-focused styling
- Keep these traits fixed across related organic assets:
  - gender
  - body type
  - hair style and color
  - general facial look
- Only vary:
  - clothes
  - environment
  - lighting
  - scenario
- For paid ads, different faces are acceptable if the angle is stronger or the audience is broader.
- If you generate a continuation asset for Instagram and TikTok from the same concept, treat the first approved runner face as the visual anchor and keep subsequent prompts aligned to that person.

## Review Rules

Reject the image if:
- it looks like a smartwatch ad
- it looks like a generic fitness stock photo
- it feels like any random app could use it
- it sells tech more than coaching
- it includes AI artifacts, logos, or baked-in text

Approve it if:
- one clear runner problem is obvious instantly
- the emotional moment feels real
- it supports a strong text overlay later
- it clearly fits Coachi’s position: `AI coach, not tracking app`

## Workflow Integration

Use this CLI path inside the Coachi marketing workflow like this:
1. research and define one runner problem
2. generate one image with Gemini CLI
3. review against the Coachi positioning filter
4. pair it with X / Instagram / TikTok copy
5. only then expand to a batch

## When To Use This Instead Of The Built-In Path

Use Gemini CLI when:
- you want reproducible terminal commands
- you want to generate from a saved prompt file
- you want JSONL batch generation
- the built-in Codex image tool is unavailable

Use the built-in path when:
- the tool is exposed in-session
- you only need a fast one-off image
- you want inline preview inside Codex
