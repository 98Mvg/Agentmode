# 2026-05-30 Slideshow Run — Why heart rate spikes slow

## Result
- Generated production slideshow pack: `content/slideshows/2026-05-30-why-heart-rate-spikes-slow`
- Hook: `Why heart rate spikes slow`
- Topic: heart-rate drift on easy runs
- Visual world: mountain
- Public upload: not attempted

## Quality Fixes Applied
- Blocked `owned_generated_visual_library` from production slides 2-6 unless explicitly allowed.
- Rotation scoring now ignores unposted `selected` / `rendered` usage events, so failed drafts do not exhaust the Pinterest/Supabase library.
- Reduced the visual reuse window from 10 to 8 recent posted/legacy packs so the small current Pinterest/Supabase library can produce unique decks without falling back to generated visuals.
- Replaced the mismatched slide text `Heat can raise it.` with `Hills can raise it.` after visual review.

## Asset Selection
- Slide 1: ChatGPT Images 2.0 hook image.
- Slides 2-6: approved Supabase/Pinterest visual-library assets.
- Slide 7: approved CTA visual-library asset.
- Top selected assets were unique; no owned generated middle-slide assets used.

## Outputs
- MP4: `content/slideshows/2026-05-30-why-heart-rate-spikes-slow/exports/2026-05-30-why-heart-rate-spikes-slow-tiktok-instagram-music.mp4`
- Carousel: `outputs/manual-upload/2026-05-30-why-heart-rate-spikes-slow-carousel`
- QA report: `content/slideshows/2026-05-30-why-heart-rate-spikes-slow/source/qa-report.json`

## Verification
- `node --test scripts/__tests__/slideshow_quality_gates.test.mjs` passed: 14/14.
- `npm run slideshow:qa -- --pack content/slideshows/2026-05-30-why-heart-rate-spikes-slow --production` passed.
- `npm run slideshow:validate` passed.
