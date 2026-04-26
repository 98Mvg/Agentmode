# TikTok + Instagram Slideshow Content Engine

This folder defines the Coachi workflow for producing slideshow/photo content with Codex GPT-5.5 and ChatGPT Images 2.0.

## Goal
Create repeatable TikTok and Instagram slideshow content that can be produced daily with low friction:

- Codex writes the idea, hook, slide structure, prompts, captions, and QA checklist.
- ChatGPT Images 2.0 generates consistent vertical image assets.
- The shared marketing workspace stores prompts, final slides, captions, and run notes.
- Publishing stays as a browser handoff: Codex prepares everything, the user presses the final publish button.

## Why Slideshows
Slideshows are faster than full video generation, cheaper to iterate, and better for testing hooks.

Use slideshows when:

- the idea is educational, contrarian, or list-based
- the visual can be carried by still images plus strong text
- Veo/Runway video generation is blocked, slow, or inconsistent
- the main goal is testing message-market fit before producing a full video

## Folder Contents
- `SOURCE_OF_TRUTH_X_ARTICLE.md` - adapted source-of-truth from the opened X article.
- `STEP_BY_STEP_GUIDE.md` - the operating strategy and daily workflow.
- `SUPABASE_STORAGE_PLAN.md` - isolated marketing asset storage setup.
- `supabase-marketing-assets.sql` - SQL bootstrap for the separate marketing Supabase project.
- `templates/slideshow-day-pack-template.md` - daily pack format.
- `templates/image-prompt-template.md` - reusable ChatGPT Images 2.0 prompt format.
- `templates/supabase-upload-manifest-template.json` - expected storage manifest shape.

## Default Daily Output
- 1 TikTok slideshow
- 1 Instagram carousel or Reel-style slideshow
- 5 to 7 image prompts
- 1 caption per platform
- 1 hook test note
- 1 short QA note before upload
- local Supabase upload manifest after local QA
- optional Pinterest image/title/description when the idea fits search intent

## Asset Storage
Use Supabase only as an isolated marketing asset store.

The required project separation is:

- App/runtime Supabase: untouched
- Marketing Supabase: `coachi-marketing-assets`

Use `SUPABASE_STORAGE_PLAN.md` before wiring credentials or upload automation. The upload helper is dry-run by default:

```bash
python3 scripts/upload_slideshow_assets.py \
  --root content/slideshows/YYYY-MM-DD-slug \
  --campaign-date YYYY-MM-DD \
  --slug slug
```

When `--execute` is used, the helper uploads files and upserts object rows into `marketing_asset_objects`. The generated `upload-manifest.json` stays local and is not uploaded back into storage.

## Canonical Workspace
All outputs from this strategy should stay inside:

`/Volumes/Riot APFS/Agentmode/coachi-marketing`

Do not store slideshow campaign outputs in the Coachi app/runtime repo.
