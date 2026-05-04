# 2026-05-04 Slideshow Automation Test

## Scope
- Existing workflow only; source of truth: `strategy/automation/tiktok-instagram-slideshow-content-engine/SOURCE_OF_TRUTH_X_ARTICLE.md`
- Goal: test the current TikTok/Instagram slideshow engine with TikTok direct-public readiness, without publishing or scheduling a public post.

## Commands Run
- `npm run slideshow:validate` - passed.
- `npm run slideshow:readiness` - passed as a report, but production readiness is blocked.
- `npm run slideshow:queue-smoke` - now fails fast when Redis is unavailable: `Redis is not reachable at redis://127.0.0.1:6379: Connection is closed.`
- `npm run slideshow:full-loop -- --mode dry-run --count 1` - passed.
- `npm run slideshow:openai-hook -- --pack outputs/full-loop/2026-05-04-172924/packs/2026-05-04-top-5-easy-run-mistakes --dry-run` - passed and confirmed OpenAI key presence.
- `npm run slideshow:full-loop -- --mode production --count 1 --generate-openai-hook --live-schedule --schedule-platform tiktok --publish-mode direct-public --no-schedule --allow-duplicate-topic --run-id 2026-05-04-live-schedule-smoke` - passed local production workflow and skipped queue/scheduling by flag.
- `npm run slideshow:prod-preflight -- --pack content/slideshows/2026-05-04-top-5-easy-run-mistakes --publish-mode direct-public --skip-remote` - blocked on HTTPS Postiz base, as expected.
- `env POSTIZ_ENABLE_LIVE_POSTING=0 npm run slideshow:queue -- --schedule content/slideshows/2026-05-04-top-5-easy-run-mistakes/postiz-schedule.json` - passed as a dry-run payload preview with live posting disabled in-process.

## Artifacts
- Dry-run pack: `outputs/full-loop/2026-05-04-172924/packs/2026-05-04-top-5-easy-run-mistakes`
- Production smoke pack: `content/slideshows/2026-05-04-top-5-easy-run-mistakes`
- Production smoke report: `outputs/full-loop/2026-05-04-live-schedule-smoke/full-loop-report.json`
- Production schedule manifest: `content/slideshows/2026-05-04-top-5-easy-run-mistakes/postiz-schedule.json`

## Result
- The current slideshow production workflow works through topic generation, one Images 2.0 hook image, approved Supabase/library payoff slides, local Sharp/Canvas rendering, production QA, and TikTok direct-public schedule manifest creation.
- Production QA passed for 7 rendered 1080x1920 slides.
- Hook provenance passed with generator `chatgpt_images_2_0`.
- Slides 2-7 used approved remote library assets.
- Top 5 source backing passed against `rp_easy_run_turns_medium_hard`.
- TikTok schedule manifest has `dry_run: false`, `publish_mode: direct-public`, `output_mode: photo_carousel`, `media_type: PHOTO`, and 7 media paths.
- TikTok payload preview passed with `privacy_level: PUBLIC_TO_EVERYONE`, `content_posting_method: DIRECT_POST`, `autoAddMusic: yes`, `media_type: PHOTO`, `output_mode: photo_carousel`, and `video_made_with_ai: true`.

## Blockers
- Public TikTok direct-posting is still blocked because Postiz is configured at `http://localhost:4007/api/public/v1`; TikTok direct-public media requires a public HTTPS Postiz API/upload base.
- Redis is not running at `redis://127.0.0.1:6379`, so BullMQ queue smoke cannot pass locally.
- Growth quality is not production-complete: only 2 format captures exist, only 3 problem topics have 5 sourced mistakes, and no posted slideshow registry entries exist.

## Safety
- No public post was published.
- No Postiz queue action was sent for the production smoke; `--no-schedule` was used.
- No files were staged or committed.

## Review 2026-05-04 - Supabase Public Media Bridge

### Low-Cost Decision
- Use local Postiz for the API/calendar path.
- Use the isolated `coachi-marketing-assets` Supabase project for public HTTPS rendered media URLs.
- Avoid a paid public Postiz deployment for now; only the media needs public HTTPS reachability.

### Commands Run
- `npm run slideshow:upload-assets -- --root content/slideshows/2026-05-04-top-5-easy-run-mistakes --campaign-date 2026-05-04 --slug top-5-easy-run-mistakes --execute --manifest-out content/slideshows/2026-05-04-top-5-easy-run-mistakes/upload-manifest.json --skip-metadata` - uploaded the existing rendered pack to Supabase.
- `npm run slideshow:apply-public-media -- --pack content/slideshows/2026-05-04-top-5-easy-run-mistakes --manifest content/slideshows/2026-05-04-top-5-easy-run-mistakes/upload-manifest.json` - rewrote `postiz-schedule.json` to use public HTTPS media.
- `curl -I <first_public_media_url>` - returned HTTP 200 with `content-type: image/png`.
- `npm run slideshow:prod-preflight -- --pack content/slideshows/2026-05-04-top-5-easy-run-mistakes --publish-mode direct-public --skip-remote --allow-already-scheduled` - passed.
- `POSTIZ_ENABLE_LIVE_POSTING=0 npm run slideshow:queue -- --schedule content/slideshows/2026-05-04-top-5-easy-run-mistakes/postiz-schedule.json` - passed dry-run payload generation and sent no Postiz schedule request.

### Result
- `postiz-schedule.json` now has `media_transport: supabase_public_https`.
- The TikTok post has 7 public Supabase image URLs.
- Preflight now allows local Postiz when all media paths are already public HTTPS.
- No TikTok/Instagram post was published or scheduled.
