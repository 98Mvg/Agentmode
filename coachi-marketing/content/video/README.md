# Shared Video Workflow

Use this folder for rendered TikTok and Instagram Reel exports that come from one shared source spec.

Rules:
- do not create separate TikTok and Instagram render pipelines
- generate both platform variants from the same core input
- use [generate_social_videos.py](/Volumes/Riot%20APFS/Agentmode/coachi-marketing/scripts/generate_social_videos.py)
- use [social-video-template.json](/Volumes/Riot%20APFS/Agentmode/coachi-marketing/inputs/notes/social-video-template.json) as the starting spec shape
- use the shared short-form text UI:
  - `hook_text` for the large all-caps top hook
  - `body_text` for the centered correction insight
  - `cta_text` for the smaller bottom CTA
  - `accent_type` as `none`, `wrong`, or `correct`
- when `voiceover_text` is present, generate ElevenLabs voiceover inside the same render workflow
- default spoken voice should use ElevenLabs voice ID `9MPvdQh2pLsLhn7SuiIS`
- default marketing voice settings mode should be `eleven_defaults` so the voice keeps its standard ElevenLabs sound profile unless the spec overrides it
- for organic Instagram + TikTok sets, keep one `character_anchor` across the paired assets:
  - male runner
  - age `25-35`
  - lean endurance-athlete build
  - short dark slightly textured hair
  - calm, focused expression
- only vary clothes, environment, lighting, and scenario across the related pair

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

Example:
```bash
python3 scripts/generate_social_videos.py generate \
  --spec inputs/notes/social-video-template.json \
  --out-dir content/video/generated/demo
```

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
