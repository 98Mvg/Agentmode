# 2026-06-26 22:01 CEST TikTok Slideshow Upload + Engagement Loop

## Required Recon

- High-level tree: Node/Playwright marketing automation workspace with `scripts/`, `strategy/`, `inputs/`, `content/`, `outputs/`, `tasks/`, browser/OpenClaw state, and slideshow visual-library assets.
- Stack: Node.js ES modules, Playwright, Sharp/Canvas, shell upload wrappers, and Python helper scripts.
- Runtime entry points:
  - Slideshow loop: `scripts/slideshow_full_loop.mjs`
  - Slideshow pipeline: `scripts/run_slideshow_pipeline.mjs`
  - TikTok inbox upload wrapper: `scripts/tiktok_inbox_file_upload.sh`
  - Engagement candidate builder: `scripts/build_engagement_candidates.mjs`
  - Daily growth coordinator: `scripts/coachi_growth_daily.mjs`
- Request path: automation prompt -> `slideshow:full-loop` -> topic/problem selection -> materialize/render/QA/export -> TikTok inbox upload if a valid pack exists.
- Event path: candidate queue -> live browser/social surface verification -> approval-gated public actions -> `inputs/performance/engagement-ledger.json` only for successful public actions.

## Business Goals And User Flows

Coachi is a mobile-first AI running coach for beginner and intermediate runners who need live training guidance, especially around easy-run control, heart-rate zones, and watch-checking anxiety. The relevant flow for this automation is traffic generation: create a fresh TikTok slideshow, send it to the TikTok inbox for manual final posting, then run social engagement to borrow attention without cold promotion.

## Architecture Map

- Frontend/content: markdown channel packs under `content/`, rendered slideshow packs under `content/slideshows/`.
- Backend/automation: Node CLI scripts in `scripts/`; shell wrappers for TikTok upload; Python only for selected upload/media helpers.
- Data: JSON/JSONL research and performance banks under `inputs/`; run artifacts under `outputs/`; visual assets under `content/slideshows/visual-library/`.
- Integrations: OpenAI Images 2.0 for slide-1 hooks, Supabase public media library for approved assets, TikTok/Postiz inbox upload for manual posting, OpenClaw/Chrome CDP for social surface inspection.
- Environments: local automation uses `.env`/`.env.local` without printing secrets; Direct Post public scheduling remains disallowed until TikTok audit approval is proven.

## Top Relevant Files

1. `AGENTS.md` - Coachi marketing operating rules.
2. `CURRENT_STATE.md` - current workflow state and known blockers.
3. `Codebase_guide.MD` - synced operational history.
4. `package.json` - npm entry points.
5. `scripts/slideshow_full_loop.mjs` - main slideshow run loop.
6. `scripts/run_slideshow_pipeline.mjs` - topic generation and pack creation path.
7. `scripts/tiktok_inbox_file_upload.sh` - official TikTok FILE_UPLOAD inbox wrapper.
8. `scripts/build_engagement_candidates.mjs` - ranked engagement queue generation.
9. `scripts/coachi_growth_daily.mjs` - canonical daily growth executor.
10. `inputs/performance/posted-slideshows.json` - posted slideshow duplicate guard.

## Risk List

- `scripts/slideshow_full_loop.mjs`: safe candidate exhaustion blocks every-4-hour fresh pack creation when duplicate guards have consumed active niches.
- `scripts/coachi_growth_daily.mjs` plus `/Users/mariusgaarder/Documents/treningscoach/scripts/social/write-marketing-day-state.py`: engagement execution depends on an app-side daily-pack resolver that still returns non-zero.
- `scripts/tiktok_inbox_file_upload.sh`: TikTok may reject uploads with `spam_risk_too_many_pending_share`; automation should not retry repeatedly.
- Browser/OpenClaw state: social surfaces can be readable but unauthenticated; posting in that state would create false completion or wrong-account risk.
- `inputs/performance/engagement-ledger.json`: must only update after verified public actions.

## Slideshow Result

- Preferred command: `COACHI_ENGAGEMENT_VIRAL_HOOK_RESEARCH=0 COACHI_DISABLE_VIRAL_HOOK_RESEARCH=1 npm run slideshow:full-loop -- --mode production --count 1 --generate-openai-hook --publish-mode manual-review`
- Preferred result: blocked before pack creation.
- Preferred report: `outputs/full-loop/2026-06-26-195907/full-loop-report.json`
- Preferred details: `beginner_runner` produced `candidate_count: 0`; `easy_run_zone2`, `workout_control`, and `apple_watch_confusion` returned `no_new_matching_sourced_problems`.
- Recovery bank: `outputs/full-loop/2026-06-26-direct-stop-judging-minute-one/single-problem-bank.json`
- Recovery source id: `rp_2026_06_26_stop_judging_minute_one_tiktok_reddit`
- Recovery command: `COACHI_ENGAGEMENT_VIRAL_HOOK_RESEARCH=0 COACHI_DISABLE_VIRAL_HOOK_RESEARCH=1 npm run slideshow:full-loop -- --mode production --count 1 --generate-openai-hook --publish-mode manual-review --problems-bank outputs/full-loop/2026-06-26-direct-stop-judging-minute-one/single-problem-bank.json --run-dir outputs/full-loop/2026-06-26-direct-stop-judging-minute-one`
- Recovery result: blocked before pack creation.
- Recovery report: `outputs/full-loop/2026-06-26-direct-stop-judging-minute-one/full-loop-report.json`
- Hook: none.
- Pack path: none.
- Images 2.0 hook provenance: none, because no pack was created.
- Selected text-bank slide set: none.
- Selected CTA asset: none.
- CTA path: none.
- Caption text: none.
- Caption-to-paste file path: none.
- Video path: none.
- TikTok publish_id: none.
- Final upload status: no upload attempted.
- Direct-public/Postiz public schedule: not used.
- Placeholder/reused hook upload: not used.

## Engagement Result

- Candidate command: `COACHI_ENGAGEMENT_VIRAL_HOOK_RESEARCH=0 COACHI_DISABLE_VIRAL_HOOK_RESEARCH=1 npm run growth:engagement-candidates -- --date 2026-06-26 --out outputs/daily/2026-06-26-2000-post-slideshow-engagement-candidates.json`
- Candidate queue: `outputs/daily/2026-06-26-2000-post-slideshow-engagement-candidates.json`
- Queue result: `32` candidates, `2` duplicates suppressed.
- Surfaces searched/prepared: Reddit `19`, TikTok `5`, Instagram `4`, X `4`.
- Canonical executor: `COACHI_ENGAGEMENT_VIRAL_HOOK_RESEARCH=0 COACHI_DISABLE_VIRAL_HOOK_RESEARCH=1 npm run growth:daily -- --date 2026-06-26 --mode stretch --skip-slideshow --execute`
- Canonical executor result: blocked by app-side `/Users/mariusgaarder/Documents/treningscoach/scripts/social/run-todays-pack.sh --date 2026-06-26 --json` returning non-zero.
- Browser proof: OpenClaw health live at `127.0.0.1:18789`; Chrome CDP `127.0.0.1:18800` reachable; `127.0.0.1:9333` unavailable.
- TikTok: readable profile tab but page exposed `Log in`; no reliable signed-in composer/action state.
- Instagram: saved-profile `everydayrunnerlab Continue` screen, not authenticated feed; skipped.
- Reddit: logged-out/challenge surface and user page text showed `This account has been banned`; no Reddit public action submitted.
- X: logged-out landing/cookie screen; no X action submitted.
- Public engagement actions completed: `0`.
- Approval queues prepared: ranked candidates in `outputs/daily/2026-06-26-2000-post-slideshow-engagement-candidates.json`; Reddit remains exact-confirmation gated.
- Ledger updates: none.
- Viral hook research: disabled; no append to `inputs/research/tiktok-viral-storagebag.jsonl`; no shared hook/text bank mutation.

## Verification

- `npm run slideshow:full-loop -- --mode production --count 1 --generate-openai-hook --publish-mode manual-review` completed with no pack.
- Recovery `npm run slideshow:full-loop` completed with no pack.
- `npm run growth:engagement-candidates` completed and wrote the queue.
- `npm run growth:daily -- --date 2026-06-26 --mode stretch --skip-slideshow --execute` failed at the known app-side daily-pack resolver after `slideshow:validate` passed.
- No code changes, no staging, no commits.
