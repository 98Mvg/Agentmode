# 2026-06-27 02:05 CEST TikTok Slideshow Upload Loop + Engagement

## Slideshow / Upload

- Automation: `coachi-tiktok-slideshow-upload-loop`
- Preferred command: `npm run slideshow:full-loop -- --mode production --count 1 --generate-openai-hook --publish-mode manual-review`
- Preferred report: `outputs/full-loop/2026-06-27-000046/full-loop-report.json`
- Preferred result: blocked before pack creation. `beginner_runner` generated `0` topic candidates; `easy_run_zone2`, `workout_control`, and `apple_watch_confusion` returned `no_new_matching_sourced_problems`.
- Recovery bank: `outputs/full-loop/2026-06-27-direct-protect-minute-two/single-problem-bank.json`
- Recovery source id: `rp_2026_06_27_protect_minute_two_easy_runs_tiktok_reddit`
- Recovery report: `outputs/full-loop/2026-06-27-direct-protect-minute-two/full-loop-report.json`
- Recovery result: blocked before pack creation. The single sourced problem still produced `0` safe non-duplicate topic candidates.

## Required Upload Fields

- Pack path: none
- Hook: none
- Slide 1 Images 2.0 hook provenance: none, blocked before image generation
- Selected text-bank slide set: none, generator produced no candidate
- Selected CTA asset: none
- CTA path: none
- Caption text: none
- Caption-to-paste file path: none
- Video path: none
- TikTok publish id: none
- Final upload status: not attempted because no pack was generated
- Direct-public / Postiz public post: not used
- Placeholder / repeated hook: not used

## Engagement Loop

- Viral hook research: disabled with `COACHI_ENGAGEMENT_VIRAL_HOOK_RESEARCH=0` and `COACHI_DISABLE_VIRAL_HOOK_RESEARCH=1`.
- Ranked candidates: `outputs/daily/2026-06-27-0003-post-slideshow-engagement-candidates.json`
- Candidate count: `32` total; Reddit `19`, TikTok `5`, Instagram `4`, X `4`; duplicate suppressions `2`.
- Standard executor: `npm run growth:daily -- --date 2026-06-27 --mode stretch --skip-slideshow --execute`
- Standard executor result: blocked on app-side `run-todays-pack.sh --date 2026-06-27 --json` resolver.
- Safe fallback: `outputs/daily/2026-06-27-clawbot-engagement-fallback.md` and `outputs/daily/2026-06-27-clawbot-engagement-fallback.json`
- Browser state: Clawbot live Chrome CDP `127.0.0.1:9333` was not running; OpenClaw lower-level endpoint was ready, but Playwright CDP attach to `127.0.0.1:18800` failed with `Browser.setDownloadBehavior`.
- Public Reddit JSON search: blocked by Reddit `403`.
- Engagement surfaces searched/prepared: Reddit, TikTok, Instagram, X ranked queues plus fallback search surfaces.
- Public engagement actions completed: `0`
- Approval queues prepared: no exact public-action queue could be prepared because current posts/accounts could not be inspected; safe fallback wrote a queued plan with public-action gates and search surfaces.
- Engagement ledger update: none
- Viral storagebag / hook-bank mutations: none

## Blockers

1. Slideshow production has exhausted safe non-duplicate topic candidates under the current text-bank/dedupe rules.
2. The dated daily social pack for `2026-06-27` is missing, so `growth:daily --execute` fails before public engagement.
3. Live signed-in browser execution is unavailable from this context: Clawbot CDP is down and OpenClaw CDP attach is incompatible with this Playwright path.
