# Shared Video Workflow

Use this folder for rendered TikTok and Instagram Reel exports that come from one shared source spec.

Blueprint:
- use [VEO_3_1_SHORT_BLUEPRINT.md](/Volumes/Riot%20APFS/Agentmode/coachi-marketing/content/video/VEO_3_1_SHORT_BLUEPRINT.md) when the source footage should come from Veo 3.1 and the final exports should follow the approved lower-third organic text style

Rules:
- do not create separate TikTok and Instagram render pipelines
- generate both platform variants from the same core input
- use [generate_social_videos.py](/Volumes/Riot%20APFS/Agentmode/coachi-marketing/scripts/generate_social_videos.py)
- use [social-video-template.json](/Volumes/Riot%20APFS/Agentmode/coachi-marketing/inputs/notes/social-video-template.json) as the starting spec shape
- Veo is allowed only as the upstream source-footage engine, not as a second render path
- use the shared short-form text UI:
  - `hook_text` for the large all-caps top hook
  - `body_text` for the centered correction insight
  - `cta_text` for the smaller bottom CTA
  - `accent_type` as `none`, `wrong`, or `correct`
- optional upstream-source fields:
  - `source_video_mode` for the footage source engine, for example `veo`
  - `source_video_prompt` for the generation brief
  - `source_video_asset` for the intended rendered source clip path
  - `variant_goal` for the test intent of the current hook variant
  - `platform_hook_text` for per-platform top-hook overrides while keeping one shared spec
  - `comment_bait_text` for caption/comment strategy that sits next to the render spec
- if `source_video_asset` exists, the renderer should use it as the live background
- if the Veo clip is not generated yet, keep `background` as a fallback preview asset so the spec still validates and the layout can still be tested
- generate ElevenLabs voiceover by default inside the same render workflow
- default spoken voice should use ElevenLabs voice ID `9MPvdQh2pLsLhn7SuiIS`
- default marketing voice settings mode should be `eleven_defaults` so the voice keeps its standard ElevenLabs sound profile unless the spec overrides it
- for organic Instagram + TikTok sets, keep one `character_anchor` across the paired assets:
  - male runner
  - age `25-35`
  - lean endurance-athlete build
  - short dark slightly textured hair
  - calm, focused expression
- vary the scene design on every new clip:
  - angle
  - background / route
  - clothes
  - weather
  - lighting
- do not repeat the same scene recipe on consecutive clips
- keep continuity through the runner anchor, not through identical visuals
- optional spoken-audio fields:
  - `voiceover_enabled`
  - `voiceover_text`
  - `voice_language`
  - `voice_persona`
  - `voice_id_override`
  - `voice_settings_mode`
- when `voiceover_enabled` is omitted, the renderer treats it as `true`
- when `voiceover_text` is empty and `voiceover_enabled` is `true`, the renderer derives default spoken copy from the hook/body/cta overlay text
- set `voiceover_enabled: false` when a clip should stay silent
- default rule:
  - voiceover on by default
  - keep the spoken line short, calm, and natural
  - disable it explicitly only when silence is the better creative choice

Default output:
- `*-tiktok.mp4`
- `*-instagram.mp4`

Text UI rules:
- hook is all caps, bold, and top-weighted
- body stays short and readable in the center
- CTA stays smaller and lower in the frame
- use white as the base text color
- use at most one accent color:
  - `wrong` -> red
  - `correct` -> green
- when a concept needs a richer five-beat overlay sequence, keep the shared render spec as the reusable source of truth and store the exact beat map in the dated brief that accompanies the spec

Example:
```bash
python3 scripts/generate_social_videos.py generate \
  --spec inputs/notes/social-video-template.json \
  --out-dir content/video/generated/demo
```

If the source footage should come from Veo first, generate that source clip before rendering the platform variants:

```bash
scripts/gemini-cli video generate \
  --spec inputs/notes/2026-04-13-veo-watch-confusion-variant-a.json
```

That writes the clip to the `source_video_asset` path stored in the spec. Once the source clip exists, the same shared render command will pick it up automatically and use it as the background instead of the fallback preview asset.

If the current hook/body/cta copy needs polish, keep it in the same shared Gemini toolchain but as a separate text step:

```bash
scripts/gemini-cli text optimize \
  --spec inputs/notes/social-video-template.json \
  --output outputs/daily/social-video-template.optimized.json
```

Then render from the optimized spec:

```bash
python3 scripts/generate_social_videos.py generate \
  --spec outputs/daily/social-video-template.optimized.json \
  --out-dir content/video/generated/demo
```
