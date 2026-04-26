# Supabase Storage Plan For Slideshow Assets

## Goal
Use Supabase as a marketing asset store for TikTok and Instagram slideshow files without touching the Coachi app runtime, app database, app Supabase project, or production credentials.

This is for marketing assets only:

- generated slideshow images
- final slideshow MP4 exports
- source prompts
- reference images
- captions
- QA notes
- upload manifests

It must not store Coachi user data, workouts, payment data, auth data, or production app secrets.

## Isolation Rule
Create a separate Supabase project:

`coachi-marketing-assets`

Do not use the Coachi app Supabase project.

Use separate environment variables:

```text
MARKETING_SUPABASE_URL=
MARKETING_SUPABASE_SECRET_KEY=
MARKETING_SUPABASE_PUBLIC_BUCKET=slideshow-public
MARKETING_SUPABASE_PRIVATE_BUCKET=slideshow-private
```

Do not use these names in the app repo:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY
```

That naming separation prevents the marketing pipeline from accidentally binding to Coachi production infrastructure.

The upload script also accepts `MARKETING_SUPABASE_SERVICE_ROLE_KEY` as a legacy fallback, but new Supabase projects should use the current `Secret keys` value in `MARKETING_SUPABASE_SECRET_KEY`.

## Bucket Design

### `slideshow-public`
Use for final assets that can safely be public:

- final TikTok slideshow MP4
- final Instagram Reel/Carousel MP4
- final rendered slide images
- public cover images

Purpose:

- easy handoff to browser upload tools
- optional future handoff to Postiz or scheduler
- stable public URLs for approved marketing assets

### `slideshow-private`
Use for source and working assets:

- prompts
- reference faces
- raw ChatGPT Images 2.0 outputs
- copy drafts
- QA notes
- manifests
- screenshots

Purpose:

- keep reusable source material controlled
- avoid exposing reference assets unnecessarily
- preserve campaign provenance

## Object Path Standard
Use deterministic paths so assets are easy to find later:

```text
slideshows/YYYY-MM-DD/slug/public/slides/01-hook.png
slideshows/YYYY-MM-DD/slug/public/slides/02-problem.png
slideshows/YYYY-MM-DD/slug/public/final-tiktok.mp4
slideshows/YYYY-MM-DD/slug/public/final-instagram.mp4
slideshows/YYYY-MM-DD/slug/private/source/prompts.md
slideshows/YYYY-MM-DD/slug/private/source/reference-face.png
slideshows/YYYY-MM-DD/slug/private/copy/tiktok-caption.txt
slideshows/YYYY-MM-DD/slug/private/copy/instagram-caption.txt
slideshows/YYYY-MM-DD/slug/private/qa.md
slideshows/YYYY-MM-DD/slug/private/upload-manifest.json
```

Local folder structure can stay the same:

```text
content/slideshows/YYYY-MM-DD-slug/
  source/
  slides/
  copy/
  qa.md
```

The upload helper maps local folders into the Supabase path standard.

## Database Metadata
The database table is optional but recommended.

Use it to track what was uploaded, when, and from which campaign:

- `campaign_date`
- `slug`
- `platform`
- `asset_role`
- `bucket_id`
- `object_path`
- `content_type`
- `byte_size`
- `sha256`
- `source_tool`

Keep row-level security enabled. The default setup blocks anonymous and authenticated table reads. The marketing upload script should use the separate marketing secret key locally.

If public dashboards are needed later, add narrow read policies. Do not loosen RLS globally.

## Setup Steps
1. Create a new Supabase project named `coachi-marketing-assets`.
2. Run `supabase-marketing-assets.sql` in that project.
3. Add the `MARKETING_SUPABASE_*` variables to the marketing workspace local environment only.
4. Generate a slideshow pack under `content/slideshows/YYYY-MM-DD-slug/`.
5. Dry-run the upload helper.
6. Execute upload only after the local pack passes QA.
7. Save the generated manifest next to the campaign files.

## Upload Commands
Dry-run:

```bash
python3 scripts/upload_slideshow_assets.py \
  --root content/slideshows/2026-04-26-easy-pace \
  --campaign-date 2026-04-26 \
  --slug easy-pace
```

Execute:

```bash
python3 scripts/upload_slideshow_assets.py \
  --root content/slideshows/2026-04-26-easy-pace \
  --campaign-date 2026-04-26 \
  --slug easy-pace \
  --execute \
  --manifest-out content/slideshows/2026-04-26-easy-pace/upload-manifest.json
```

The script does not publish anything to TikTok or Instagram. It only uploads files into the isolated marketing Supabase project.

## Safety Checklist
Before using this with real credentials:

- Confirm the Supabase project URL is not the Coachi app project.
- Confirm credentials are stored only in the marketing workspace environment.
- Confirm the service role key is never committed.
- Confirm private source assets go to `slideshow-private`.
- Confirm only final approved assets go to `slideshow-public`.
- Confirm app/runtime code does not import or read `MARKETING_SUPABASE_*`.
- Confirm generated public URLs are used only for approved marketing assets.

## Future Integration
The correct sequence is:

1. Local slideshow generation
2. Supabase marketing asset upload
3. Manual browser upload handoff
4. Performance logging
5. Later: approved scheduler integration

Do not connect this directly to Coachi app backend jobs. It should remain a marketing pipeline.
