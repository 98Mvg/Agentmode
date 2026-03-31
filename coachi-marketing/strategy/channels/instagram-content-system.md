# Coachi Instagram Content System

## Objective

Use Instagram to turn runner pain into trust and App Store intent.

Instagram is not the primary reach engine.
It is the visual trust and conversion layer that sits behind TikTok reach.

The job of Instagram is:
- stop the right runner with a clear pain hook
- make Coachi feel real, useful, and credible
- move the runner to `link in bio` and App Store intent

## Target Audience

Lock Instagram content to:
- serious beginners
- intermediate runners

These runners:
- feel stuck
- train inconsistently
- do not understand zones
- want to improve

Pain is the entry point.

## Content Pillars

Instagram content should follow this split:

- `70%` runner mistakes
  - purpose: growth
  - examples:
    - `you're doing this wrong`
    - `this is why your runs feel hard`
    - `Zone 2 mistake`

- `20%` Coachi app
  - purpose: conversion
  - examples:
    - how Coachi works
    - real-time coaching
    - Apple Watch + iPhone use

- `10%` build story
  - purpose: trust
  - examples:
    - what is being built
    - founder struggle
    - shipping lesson

Do not let app or founder content crowd out runner pain.

## Format Mix

### Reels

Reels are the main driver.

Target:
- `80%` of Instagram posts
- `1` Reel per day as the default operating target

Default structure:
1. hook in `0 to 2` seconds
2. problem
3. fix
4. CTA

Rules:
- `6 to 15` seconds
- one idea per video
- large hook text
- subtitle the key point
- default purpose: reach and discovery
- default source: strongest TikTok-native correction idea

If rendering is needed, use the existing video pipeline and FFmpeg path.
Do not create a second render pipeline just for Instagram.

### Carousels

Carousels are for depth, saves, and step-by-step explanation.

Target:
- `1` carousel every `2 to 3` days
- `5 to 7` slides max

Rules:
- slide 1 must be a strong hook
- each slide should move one step deeper into the same idea
- last slide should point back to Coachi
- use Gemini image CLI or existing visual assets for clean slide visuals

Default purpose:
- education
- engagement

### Stories

Stories are for low-friction engagement.

Target:
- `3 to 6` slides per day

Rules:
- `3 to 6` quick slides
- informal tone
- low production
- polls, reposts, quick updates, behind-the-scenes, recap
- reuse existing assets before creating new ones

Default purpose:
- engagement
- conversion support

## Daily Instagram Loop

Every day on Instagram:
- publish `1` Reel
- publish `3 to 6` Story slides
- like `15` relevant posts
- leave `10` meaningful comments
- follow `10` relevant accounts
- send `5` replies to comments or DMs

Carousel cadence:
- create `1` carousel every `2 to 3` days
- track whether the carousel slot is due inside the existing workflow
- do not require a carousel every single day

## Hook Strategy

Instagram hooks should lead with pain and correction.

Use patterns like:
- `You're doing this wrong`
- `Stop running like this`
- `Most runners don't know this`
- `This is why you're always tired`

Do not lead with generic motivation.
Do not lead with tech stack details.

## Visual Style

Keep Instagram:
- clean
- minimal
- performance-focused

Use:
- running clips
- app UI when it helps conversion
- simple text overlays
- dark/premium Coachi look

Avoid:
- flashy influencer edits
- gym-bro energy
- noisy visual clutter

## Shared Content Engine

Instagram must stay inside the single existing Coachi content engine.

Rules:
- do not invent a separate Instagram ideation engine
- reuse the same source idea across TikTok, Instagram Reels, carousels, and Stories
- extend the existing workflow with flags and templates only
- reuse existing assets first
- reuse the same face across related Instagram and TikTok organic assets

Default source order:
1. winning TikTok idea
2. existing running asset or app clip
3. Gemini-generated support asset

## Output Flags

Every Instagram draft should declare:
- `format`: `reel` | `carousel` | `story`
- `carousel_due`: `yes` | `no`
- `purpose`: `growth` | `conversion` | `trust`
- `pillar`: `runner-mistake` | `coachi-app` | `build-story`
- `asset_source`: `reused-running-clip` | `app-ui` | `existing-image` | `gemini-image`
- `cta`: `link-in-bio` | `coachi.no` | `app-store`
- `reuse_source`: `tiktok` | `instagram-native` | `existing-asset`
- `same_face_set`: `yes` | `no`

Use [OUTPUT_TEMPLATE.md](/Users/mariusgaarder/Documents/treningscoach/tmp/agentmode-cloud/coachi-marketing/content/Instagram/OUTPUT_TEMPLATE.md) for all saved Instagram drafts.
