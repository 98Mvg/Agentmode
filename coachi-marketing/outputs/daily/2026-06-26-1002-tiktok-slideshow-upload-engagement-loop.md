# 2026-06-26 10:02 CEST TikTok slideshow upload + engagement loop

## Repo Recon

- Stack: Node.js ESM automation scripts, Sharp/Canvas slideshow rendering, Playwright/OpenClaw browser helpers, Python support utilities.
- Runtime entry points: `scripts/slideshow_full_loop.mjs`, `scripts/run_slideshow_pipeline.mjs`, `scripts/tiktok_inbox_file_upload.sh`, `scripts/coachi_growth_daily.mjs`, `scripts/build_engagement_candidates.mjs`, `scripts/log_engagement_action.mjs`.
- Request path: automation prompt -> npm slideshow command -> sourced problem bank -> topic generation -> materialize/render/QA -> TikTok inbox upload helper -> daily note.
- Event path: ranked engagement candidates -> signed-in browser/social coordinator when available -> exact public action -> `inputs/performance/engagement-ledger.json` only after verified success.
- Relevant files: `AGENTS.md`, `CURRENT_STATE.md`, `Codebase_guide.MD`, `package.json`, `scripts/slideshow_full_loop.mjs`, `scripts/run_slideshow_pipeline.mjs`, `scripts/generate_openai_hook_image.mjs`, `scripts/materialize_slideshow_sources.mjs`, `scripts/slideshow_prod_preflight.mjs`, `scripts/tiktok_inbox_file_upload.sh`, `scripts/coachi_growth_daily.mjs`, `scripts/engagement_candidate_engine.mjs`.

## Product / Architecture

- Business goal: grow Coachi, an AI running coach for guided running workouts and post-workout coaching, through runner-native content and reply-first engagement.
- Users: beginner to intermediate runners, busy adults, and Apple Watch/iPhone users who want structured cardio coaching without hiring a human coach.
- Core flows: TikTok/Instagram slideshow generation, TikTok inbox handoff for manual final posting, Reddit/TikTok/Instagram/X engagement queues, and performance-led learning via ledgers/scorecards.
- Frontend/content: markdown channel drafts and rendered slideshow packs under `content/`.
- Backend/automation: Node scripts under `scripts/`; local browser helpers are in `/Users/mariusgaarder/Documents/treningscoach/scripts/social`.
- Data: JSON/Markdown source banks under `inputs/`, generated packs under `content/slideshows/`, run records under `outputs/daily/`, dedupe ledgers under `inputs/performance/`.
- Integrations: OpenAI Images 2.0 for slide 1, Supabase public visual library for middle/CTA slides, TikTok Content Posting API inbox `MEDIA_UPLOAD`, OpenClaw/Chrome for live engagement where available.

## Risk List

1. `scripts/generate_slideshow_topics.mjs`: topic generation is saturated and can return zero candidates even with a fresh sourced recovery problem.
2. `scripts/tiktok_photo_inbox_upload.cjs`: TikTok can block inbox handoffs with `spam_risk_too_many_pending_share` when too many account drafts are pending.
3. `/Users/mariusgaarder/Documents/treningscoach/scripts/social/run-todays-pack.sh`: failing `--json` path blocks canonical `growth:daily --execute`.
4. Browser path: Chrome CDP `127.0.0.1:9333` was unavailable; OpenClaw was ready but no browser profile was running.
5. Engagement safety: Reddit and social public actions must remain approval-gated or skipped when signed-in state/composer controls are not verified.

## Slideshow / Upload

- Preferred command: `npm run slideshow:full-loop -- --mode production --count 1 --generate-openai-hook --publish-mode manual-review`
- Preferred result: dry at `outputs/full-loop/2026-06-26-075550/full-loop-report.json`; `beginner_runner` produced `candidate_count: 0`, other niches returned `no_new_matching_sourced_problems`.
- Recovery bank created: `outputs/full-loop/2026-06-26-direct-not-every-slow-run-is-easy/single-problem-bank.json`
- Recovery source id: `rp_2026_06_26_not_every_slow_run_easy_tiktok`
- Recovery command: `npm run slideshow:full-loop -- --mode production --count 1 --generate-openai-hook --publish-mode manual-review --problems-bank outputs/full-loop/2026-06-26-direct-not-every-slow-run-is-easy/single-problem-bank.json --run-id 2026-06-26-direct-not-every-slow-run-is-easy`
- Recovery result: dry at `outputs/full-loop/2026-06-26-direct-not-every-slow-run-is-easy/full-loop-report.json`; `easy_run_zone2` generated `candidate_count: 0`, other niches skipped.
- Fresh inspected pack used for handoff attempt: `content/slideshows/2026-06-26-main-05-slowhard-slow-pace-can-still-get-too-hard`
- Hook: `Slow pace can still get too hard`
- Slide 1 Images 2.0 provenance: yes, `source/hook-provenance.json`; `fallback_used: false`.
- Selected text-bank slide set: not exposed as a separate id in this app-demo pack; source problem id is `rp_2026_06_26_main_slow_pace_still_hard`.
- CTA path: Supabase `cta_ending`
- Selected CTA asset: `cta_ending_004`
- CTA materialize report asset rights: `approved`; asset source kind `supabase_visual_library`; original source kind `local_curated_library`.
- Caption-to-paste file: `content/slideshows/2026-06-26-main-05-slowhard-slow-pace-can-still-get-too-hard/exports/2026-06-26-main-05-slowhard-slow-pace-can-still-get-too-hard-caption-to-paste.txt`
- Caption export verification: exact match with `copy/tiktok-postiz-caption.txt`.
- Video path: none; official TikTok inbox path uses photo `MEDIA_UPLOAD` carousel.
- TikTok publish id: none.
- Final upload status: blocked once by TikTok API: `spam_risk_too_many_pending_share`.
- Direct public posting: not used. No `--live-schedule`.

Caption:

```text
Slow pace can still get too hard

The run usually gives you the clue before the watch makes it obvious.

Send this to your fast-start friend.

#runtok #zone2training #heartratetraining #runnersoftiktok
```

## Engagement Loop

- Research flags: `COACHI_ENGAGEMENT_VIRAL_HOOK_RESEARCH=0`, `COACHI_DISABLE_VIRAL_HOOK_RESEARCH=1`.
- Candidate queue: `outputs/daily/2026-06-26-0958-post-slideshow-engagement-candidates.json`
- Queue result: `34` candidates, `2` duplicate suppressions.
- Candidate mix: Reddit `19`, TikTok `5`, Instagram `4`, X `6`.
- Canonical command attempted: `npm run growth:daily -- --date 2026-06-26 --mode stretch --platform all --skip-slideshow --execute`
- Canonical command result: blocked by app-side social coordinator because `run-todays-pack.sh --date 2026-06-26 --json` returned non-zero.
- Browser checks: Chrome CDP `127.0.0.1:9333` refused connection; OpenClaw health returned live; OpenClaw browser tabs returned `running:false`; audit reported Clawbot down and OpenClaw ready.
- Surfaces searched/prepared: Reddit, TikTok, Instagram, and X via ranked engagement candidates.
- Public engagement actions completed: `0`.
- Engagement ledger updates: none.
- Viral storagebag appends: none.
- Shared hook/text bank mutations during engagement: none.

## Approval Queue

Reddit remains exact-confirmation only:

1. `easy day too fast` search: `https://www.reddit.com/search/?q=running%20too%20fast%20on%20easy%20days&type=posts&sort=new`
   - Draft: `The useful fix is usually earlier feedback, not more discipline. If you wait until the run already feels hard, the easy day is mostly gone.`
2. `C25K pace too fast` search: `https://www.reddit.com/search/?q=C25K%20pace%20too%20fast%20heart%20rate&type=posts&sort=new`
   - Draft: `For C25K, slower is usually the unlock. The goal is finishing the intervals controlled enough that you still want to train again.`
3. `zone 2 discussion` search: `https://www.reddit.com/search/?q=zone%202%20easy%20run%20discussion%20beginner%20runners&type=posts&sort=new`
   - Draft: `Does anyone else find staying easy harder than running hard? I am curious whether people use breathing, heart rate, pace, watch alerts, or feel to stop easy runs from drifting too hard.`

TikTok queued only:

1. `easy run mistakes`: `Most runners do not need more effort. They need a calmer start.`
2. `zone 2 running`: `Zone 2 is harder mentally than physically.`
3. `marathon training tips`: `Easy days only work if they stay easy.`

Instagram skipped for public action until signed-in/composer state is verified:

1. `easy run reels`: `Starting slower solves more easy runs than people expect.`
2. `beginner runner reels`: `The best beginner plan is the one you can repeat next week.`
3. `zone 2 reels`: `The hard part is trusting easy long enough for it to work.`

X queued only:

1. `AI builder founder journey`: `This is the part people underestimate. AI makes shipping faster, but product judgment becomes the bottleneck.`
2. `real-time AI product latency`: `Real-time AI is judged by timing before intelligence. A decent answer at the right moment beats a brilliant one that arrives late.`
3. `consumer app beta shipping`: `Beta testing is a product flow, not a link drop. The onboarding, feedback loop, and reason to return matter as much as the build.`

## Verification Commands

```bash
npm run slideshow:full-loop -- --mode production --count 1 --generate-openai-hook --publish-mode manual-review
npm run slideshow:full-loop -- --mode production --count 1 --generate-openai-hook --publish-mode manual-review --problems-bank outputs/full-loop/2026-06-26-direct-not-every-slow-run-is-easy/single-problem-bank.json --run-id 2026-06-26-direct-not-every-slow-run-is-easy
npm run slideshow:tiktok-inbox-upload -- --pack content/slideshows/2026-06-26-main-05-slowhard-slow-pace-can-still-get-too-hard --integration cmorm85va0003nt6ro6b502fk
npm run growth:engagement-candidates -- --date 2026-06-26 --mode stretch --platform all --out outputs/daily/2026-06-26-0958-post-slideshow-engagement-candidates.json
npm run growth:daily -- --date 2026-06-26 --mode stretch --platform all --skip-slideshow --execute
```

Outcomes:

- Preferred slideshow command: dry/no-new.
- Recovery slideshow command: dry/no topic candidates.
- Existing fresh pack QA/preflight: passed with real Images 2.0 hook provenance.
- TikTok inbox upload: blocked once by `spam_risk_too_many_pending_share`; no retry.
- Caption-to-paste export: exists and matches.
- Engagement candidates: wrote `34` candidates.
- Growth daily execute: failed on app-side `run-todays-pack.sh --json`.
- Public engagement actions: none.
