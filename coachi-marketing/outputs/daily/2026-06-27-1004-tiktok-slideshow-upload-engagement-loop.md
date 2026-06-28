# 2026-06-27 10:04 CEST — TikTok slideshow upload + engagement loop

Automation: `coachi-tiktok-slideshow-upload-loop`
Run type: every-4-hours TikTok inbox handoff plus post-slideshow engagement loop

## Recon

- Stack: Node.js ESM scripts, shell wrappers, Python helpers, Sharp/Canvas slideshow rendering, Playwright/OpenClaw browser helpers.
- Runtime entry points: `package.json` scripts, especially `slideshow:full-loop`, `slideshow:tiktok-inbox-upload`, `growth:engagement-candidates`, and `growth:daily`.
- Request path: automation prompt -> `slideshow_full_loop.mjs` -> `run_slideshow_pipeline.mjs` -> hook/materialize/render/preflight/upload scripts when a pack exists.
- Event path: candidate queue -> browser/CDP/OpenClaw surface -> exact approval/public action gate -> `inputs/performance/engagement-ledger.json` only after verified public action.
- Relevant files: `AGENTS.md`, `CURRENT_STATE.md`, `Codebase_guide.MD`, `package.json`, `scripts/slideshow_full_loop.mjs`, `scripts/run_slideshow_pipeline.mjs`, `scripts/tiktok_inbox_file_upload.sh`, `scripts/coachi_growth_daily.mjs`, `scripts/build_engagement_candidates.mjs`, `inputs/performance/engagement-ledger.json`.

## Architecture Map

- Frontend/content surface: Markdown daily packs and slideshow pack folders under `content/`.
- Backend/automation: Node scripts under `scripts/` coordinate topic selection, visual sourcing, rendering, QA, upload preparation, and engagement queues.
- Data: JSON/JSONL/Markdown banks under `inputs/`, registries under `inputs/performance/`, run outputs under `outputs/`.
- Integrations: OpenAI Images 2.0 for slide 1 hooks, Supabase public media library, TikTok Content Posting API FILE_UPLOAD inbox path, OpenClaw/Chrome CDP for engagement.

## Slideshow / Upload

- Preferred command: `/opt/homebrew/bin/npm run slideshow:full-loop -- --mode production --count 1 --generate-openai-hook --publish-mode manual-review`
- Preferred report: `outputs/full-loop/2026-06-27-080203/full-loop-report.json`
- Preferred result: blocked before pack creation. `beginner_runner` returned `candidate_count: 0`; `easy_run_zone2`, `workout_control`, and `apple_watch_confusion` returned `no_new_matching_sourced_problems`.
- Recovery bank: `outputs/full-loop/2026-06-27-direct-body-gets-tense/single-problem-bank.json`
- Recovery source id: `rp_2026_06_27_body_gets_tense_before_hard_reddit_tiktok`
- Recovery source files: `inputs/research/reddit-winning-language-bank.md`, `inputs/research/tiktok-viral-storagebag.jsonl`
- Recovery command: `/opt/homebrew/bin/npm run slideshow:full-loop -- --mode production --count 1 --generate-openai-hook --publish-mode manual-review --problems-bank outputs/full-loop/2026-06-27-direct-body-gets-tense/single-problem-bank.json --run-id 2026-06-27-direct-body-gets-tense`
- Recovery report: `outputs/full-loop/2026-06-27-direct-body-gets-tense/full-loop-report.json`
- Recovery result: blocked before pack creation with `candidate_count: 0` for `beginner_runner`; the other active niches were skipped as `no_new_matching_sourced_problems`.
- Pack path: none
- Hook: none
- Images 2.0 hook provenance: none, because no pack reached hook generation
- Selected text-bank slide set: none
- Selected CTA asset: none
- CTA path: none
- Caption text: none
- Caption-to-paste file path: none
- Video path: none
- TikTok publish_id: none
- Final upload status: no upload attempted; no placeholder, no direct-public post, no Postiz public schedule

## Engagement

- Candidate queue: `outputs/daily/2026-06-27-1003-post-slideshow-engagement-candidates.json`
- Queue result: `32` candidates; Reddit `19`, TikTok `5`, Instagram `4`, X `4`; build command reported `2` duplicates suppressed.
- Canonical command: `/opt/homebrew/bin/npm run growth:daily -- --date 2026-06-27 --mode stretch --skip-slideshow --execute`
- Canonical result: failed before public actions because `/Users/mariusgaarder/Documents/treningscoach/scripts/social/run-todays-pack.sh --date 2026-06-27 --json` returned non-zero through `social-coordinator.sh`.
- Browser checks:
  - OpenClaw health `127.0.0.1:18789/health`: live
  - Chrome CDP `127.0.0.1:18800/json/version`: live
  - Chrome CDP `127.0.0.1:18800/json/list`: zero tabs
  - Clawbot CDP `127.0.0.1:9333`: down
- Fallback artifacts: `outputs/daily/2026-06-27-clawbot-engagement-fallback.md`, `outputs/daily/2026-06-27-clawbot-engagement-fallback.json`
- Engagement surfaces searched/planned: Reddit user/search surfaces, TikTok search surfaces, Instagram tag surfaces, X live search surfaces from the fallback queue.
- Public engagement actions completed: `0`
- Approval queues prepared: none; no signed-in composer surface could be safely verified.
- Engagement ledger updated: no
- Viral storagebag or shared hook/text bank mutation: none; `COACHI_ENGAGEMENT_VIRAL_HOOK_RESEARCH=0`, `COACHI_DISABLE_VIRAL_HOOK_RESEARCH=1`

## Risks

- Slideshow topic generation is still exhausted by duplicate/source guards despite one run-local sourced recovery bank.
- Engagement execution remains blocked by the app-side daily-pack resolver before live browser actions.
- OpenClaw is live but has no controllable tab in CDP `18800`, while the normal signed-in Clawbot CDP `9333` is down.

## Verification

- Ran `slideshow:validate` indirectly through both slideshow and growth commands; validation passed.
- Did not stage or commit.
- No secrets printed.
