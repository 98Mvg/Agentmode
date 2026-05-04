# TikTok

Use this folder for TikTok hooks, filming briefs, and spoken-script drafts.

TikTok is the primary free-reach engine and the source idea pool for Instagram Reels.

Daily loop target:
- `1 to 2` videos posted
- `15` likes
- `10` meaningful comments
- `10` follows
- `5` replies to comments
- `1` comment on a trending or larger video

Minimum loop:
- `1` video posted
- `5` likes
- `3` meaningful comments
- `3` follows
- `1` relevant larger-video comment

Stretch loop:
- full default loop above

Use TikTok drafts to generate:
- short correction Reels on Instagram
- supporting carousel topics
- low-production Story follow-ups

Keep TikTok and Instagram in one shared content engine rather than separate ideation systems.

Rendered TikTok videos should come from the shared video workflow in [generate_social_videos.py](/Volumes/Riot%20APFS/Agentmode/coachi-marketing/scripts/generate_social_videos.py), not a TikTok-only render script.

Overlay placement rule:
- keep the main hook in the center or lower-middle safe zone
- never rely on true bottom placement for important text
- use short white text with stroke/shadow so the line survives moving backgrounds
- if a draft uses `bottom`, treat it as a legacy alias for lower-middle unless manually checked

Q&A format rule:
- ask one runner question that can be answered in comments
- answer with one simple rule, not a full training plan
- use comments as the source for the next reply video
- strong default: `How many days do you train? Comment your days and I will map the week.`

Default organic runner anchor:
- male, `25-35`
- lean endurance-athlete build
- short dark slightly textured hair
- calm, focused expression
- keep those traits stable across related TikTok + Instagram assets
- every new TikTok hero clip must change:
  - angle
  - background / route
  - clothes
  - weather
  - lighting
- do not reuse the same visual recipe on consecutive clips
- ElevenLabs voiceover is allowed when it improves clarity, but keep it short and natural

Supabase slideshow image rule:
- Always rotate Supabase/library images.
- Do not use the same Supabase visual set on back-to-back slideshows.
- Keep one visual world per slideshow: do not mix hills, lakes, and mountains in the same post.
- Treat selected, rendered, and posted usage as real usage for rotation decisions.
- Prefer unused assets first; only reuse an image when the collection has no suitable unused option.

Slideshow source-of-truth rule:
- Use `strategy/automation/tiktok-instagram-slideshow-content-engine/README.md` as the canonical slideshow workflow.
- Every slideshow needs an explicit emotion, exactly one Images 2.0 hook image, the generated Coachi runner avatar inside one selected visual world, and one final CTA slide.
- Default slide-1 hook images use the clean Coachi avatar as identity reference plus `2026-04-26-watch-stole-the-run-8-slide/slides/source/01-hook.png` as the viral face/style reference.
- Slide hooks and slides `1-6` should use `inputs/research/tiktok-proven-slideshow-text-bank.json` first so the wording stays simple and TikTok-native.
- The CTA should be simple and earned, not a forced app pitch.
- Standard CTA images should come from the Supabase `cta_ending` library with real rotation and visual variety.
- The owned watch UI CTA `coachi_watch_ui_cta_001` is selective app proof only. Use it only when a pack explicitly asks for that asset; do not make it the default Coachi marketing CTA.
