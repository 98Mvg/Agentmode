# X Source Note - Slideshow Automation Pipeline

## Source
- platform: X
- author: Alex Nguyen / `@alexcooldev`
- url: `https://x.com/alexcooldev/status/2047715075457507452`
- captured: `2026-04-26`
- article title: `Automating TikTok Slideshow Content with Codex GPT-5.5 and ChatGPT images 2.0 (Step by step guide)`
- visible engagement at re-read: `26 replies`, `103 reposts`, `1006 likes`, `3225 bookmarks`, `357138 views`

## Core Thesis
TikTok slideshows are currently a high-leverage format because they need fewer production inputs than video while still behaving like video in the feed. The article positions the production bottleneck as:

- finding proven slideshow structures
- generating consistent visual assets
- reducing image generation cost
- scheduling/publishing reliably

## Source Pipeline
The article's pipeline:

1. Collect top-performing slideshow examples from the niche.
2. Use Codex GPT-5.5 vision/computer-use to reverse-engineer format structure.
3. Save extracted formats as reusable JSON schemas.
4. Use ChatGPT Images 2.0 for the most important custom slide assets.
5. Build a Pinterest-style visual library tagged by mood, color, subject, and aesthetic.
6. Use a curated image library for the remaining slides to reduce cost.
7. Store approved source and finished assets in Supabase Storage.
8. Composite text locally with Node.js, Sharp, and `@napi-rs/canvas`.
9. Queue production jobs with BullMQ and Redis when volume justifies it.
10. Schedule/publish through Postiz using official platform integrations.
11. Track limitations around originality, bans, and funnel quality.

## Source Claims To Use
- Slideshows can be produced with 5 to 10 images, a hook, and a CTA.
- The highest-leverage asset is the format schema, not one individual post.
- The first slide deserves the most custom generation because it carries the hook.
- Middle slides can reuse a curated visual library if the overlay and brand treatment are consistent.
- Pinterest works as an inspiration and curation layer because humans have already filtered for aesthetics.
- Supabase Storage fits the asset-library role when separated from the app project.
- A local compositor gives control over fonts, contrast, gradients, and export quality.
- A queue is useful once production becomes repeatable.
- Scheduling should use official integrations rather than brittle browser automation.
- Volume without originality or funnel quality can create vanity metrics and platform risk.
- The workflow is optimized for scale, not necessarily deep personal-brand trust.

## Coachi Adaptation
For Coachi, use this source as the operating truth for slideshow workflow, but adapt it:

- Use format inspiration, not content copying.
- Prefer Coachi-owned/generated visuals over unlicensed Pinterest scraping.
- Treat Pinterest as a style and search-intent research source first, not a default asset source.
- Use ChatGPT Images 2.0 for the first hook image and any slide needing a consistent runner identity.
- Build a reusable Coachi visual library from generated assets, approved screenshots, and original running visuals.
- Store the approved library in the separate `coachi-marketing-assets` Supabase project.
- Use local text composition for reliable brand consistency.
- Use the queue/render architecture for preparation, not unapproved autonomous publishing.
- Keep final publish as user handoff unless action-time approval is given.
- Optimize for trust and follower quality, not 30 to 50 low-quality posts per day.

## Coachi-Safe Defaults
- 1 to 2 slideshow packs per day
- 5 to 7 slides per pack by default, with 8 only when the idea truly needs pacing
- one runner problem per pack
- first slide custom-generated
- middle slides from approved Coachi visual library
- final slide comment prompt
- local text overlay, not generated text baked into the base image
- no mass multi-account posting
- no unlicensed recognizable people
- no reposting identical content across accounts

## Reject Or Modify
- Do not frame the workflow as stealing content.
- Do not scrape copyrighted/Pinterest images blindly.
- Do not run 50 accounts.
- Do not automate final posting without explicit approval.
- Do not prioritize volume over brand trust.
- Do not use hashtag stuffing.

## Implication For Current Social Engine
The existing slideshow automation strategy should be upgraded around:

- format schema library
- visual asset library
- Supabase-backed asset metadata
- local compositor
- queueable daily pack generation
- manual upload handoff
- performance loop into `WINNER_LIBRARY.md`
