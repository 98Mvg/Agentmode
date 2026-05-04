# Postiz Setup For Coachi Slideshows

Postiz is not required for the manual publishing workflow. Use it only after the slideshow pack generation and render flow works repeatedly.

## Default State

- `POSTIZ_ENABLE_LIVE_POSTING=0`
- `postiz-schedule-manifest-template.json` uses `dry_run: true`
- `npm run slideshow:queue -- --schedule ...` prints payloads instead of posting

## Required Before Live Scheduling

- Self-hosted Postiz instance on local Docker Compose, VPS/Coolify, Render, or equivalent.
- Official TikTok Content Posting API integration approved in Postiz.
- TikTok business account connected through official integration.
- `POSTIZ_URL` set in `.env.local`.
- `POSTIZ_PUBLIC_API_BASE` set in `.env.local` if the self-hosted public API route differs from `POSTIZ_URL/api/public/v1`.
- `POSTIZ_API_KEY` set in `.env.local`.
- `POSTIZ_ENABLE_LIVE_POSTING=1` set only for an approved live run.
- User approval at action time before sending public posts.

## Safety Defaults

- Maximum `3` posts per account per day.
- Minimum `3` hours between posts on the same account.
- No duplicate payloads across accounts.
- No hashtag stuffing.
- No mass jump to many accounts before one account proves the funnel.

## Workflow

1. Render slideshow locally.
2. QA rendered slides.
3. Upload approved media to marketing Supabase or keep local media for manual upload.
4. Build a Postiz schedule manifest from `templates/postiz-schedule-manifest-template.json`.
5. Dry-run schedule:

```bash
npm run slideshow:queue -- \
  --schedule strategy/automation/tiktok-instagram-slideshow-content-engine/templates/postiz-schedule-manifest-template.json
```

6. Only after approval, enable live posting with `POSTIZ_ENABLE_LIVE_POSTING=1`.

Full-loop live TikTok scheduling:

```bash
npm run slideshow:full-loop -- \
  --mode production \
  --count 1 \
  --generate-openai-hook \
  --live-schedule \
  --schedule-platform tiktok \
  --publish-mode direct-public \
  --upload-public-media
```

This command generates exactly one Images 2.0 hook image, renders the deck, combines the TikTok caption with hashtags into `copy/tiktok-postiz-caption.txt`, uploads the rendered slides to the `coachi-marketing-assets` Supabase public bucket, writes those public HTTPS URLs into `postiz-schedule.json`, and schedules the TikTok photo carousel through the official connected integration.

## Low-Cost Local Postiz Path

Use this path before paying for a public Postiz host:

- Keep Postiz running locally at `http://localhost:4007`.
- Store approved rendered slides in the separate `coachi-marketing-assets` Supabase project.
- Use the Supabase public HTTPS image URLs in `postiz-schedule.json`.
- Local Postiz can call its own API locally, while TikTok/Postiz receives public media URLs that it can fetch.

For an existing rendered pack:

```bash
npm run slideshow:upload-assets -- \
  --root content/slideshows/YYYY-MM-DD-slug \
  --campaign-date YYYY-MM-DD \
  --slug slug \
  --execute \
  --manifest-out content/slideshows/YYYY-MM-DD-slug/upload-manifest.json \
  --skip-metadata

npm run slideshow:apply-public-media -- \
  --pack content/slideshows/YYYY-MM-DD-slug \
  --manifest content/slideshows/YYYY-MM-DD-slug/upload-manifest.json
```

Run a safe queue dry-run against a live-intent schedule by forcing live posting off for that command:

```bash
POSTIZ_ENABLE_LIVE_POSTING=0 npm run slideshow:queue -- \
  --schedule content/slideshows/YYYY-MM-DD-slug/postiz-schedule.json
```

Do not run the queue with `POSTIZ_ENABLE_LIVE_POSTING=1` until there is explicit action-time approval to schedule/send the post.

Production preflight:

```bash
npm run slideshow:prod-preflight -- \
  --pack content/slideshows/YYYY-MM-DD-slug \
  --publish-mode direct-public
```

Direct public TikTok settings are fixed by the shared payload builder:

- `privacy_level=PUBLIC_TO_EVERYONE`
- `content_posting_method=DIRECT_POST`
- `autoAddMusic=yes`
- `video_made_with_ai=true`
- `output_mode=photo_carousel`
- `media_type=PHOTO`

## TikTok Photo Carousel Music

For manual slideshow/photo-carousel uploads, keep the exported assets as separate images and add music inside TikTok after selecting the slides.

Default playlist:

`Light Music` - `https://www.tiktok.com/tiktokstudio/sound-library/playlist/7413314027545168656`

Do not bake music into the carousel files; that converts the workflow back toward MP4/video behavior. Direct-public API posting cannot force this exact playlist, so it uses TikTok auto-add music.

## Render Notes

Render helps if we want always-on hosting, but it is not a one-service Docker Compose replacement for Postiz.

Postiz currently needs Postgres, Redis-compatible storage, Temporal, and media storage. On Render this means splitting the stack across Render services or using an external managed Temporal service. Keep the local Docker Compose smoke test first, then move to Render only after the API flow works.

Detailed setup note:

`strategy/automation/postiz-render-self-hosting.md`

## What We Do Not Copy From The Article

- No 50-account setup now.
- No unofficial posting.
- No iPhone-farm route.
- No autonomous public posting without action-time approval.
