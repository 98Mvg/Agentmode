# 2026-06-25 22:06 CEST TikTok slideshow upload + engagement loop

## Repo Recon

- Stack: Node.js ESM marketing automation scripts, Playwright/OpenClaw browser helpers, Sharp/Canvas slideshow rendering, Python support scripts.
- Runtime entry points: `scripts/slideshow_full_loop.mjs`, `scripts/run_slideshow_pipeline.mjs`, `scripts/tiktok_inbox_file_upload.sh`, `scripts/coachi_growth_daily.mjs`, `scripts/build_engagement_candidates.mjs`.
- Request path: automation prompt -> `slideshow:full-loop` / recovery bank -> topic generation -> pipeline/materialize/render/QA -> TikTok inbox upload -> daily note.
- Event path: engagement candidate queue -> browser/social coordinator if available -> verified public action -> `inputs/performance/engagement-ledger.json`. No verified public action means no ledger write.
- Relevant files: `AGENTS.md` rules, `CURRENT_STATE.md` state, `Codebase_guide.MD` sync log, `package.json` commands, `scripts/slideshow_full_loop.mjs`, `scripts/generate_slideshow_topics.mjs`, `scripts/run_slideshow_pipeline.mjs`, `scripts/qa_slideshow_pack.mjs`, `scripts/tiktok_inbox_file_upload.sh`, `scripts/build_engagement_candidates.mjs`.

## Product / Architecture

- Business goal: grow Coachi, an AI running coach for guided running workouts and post-workout coaching, through runner-native content and reply-first engagement.
- Core flows: TikTok/Instagram slideshow generation, TikTok inbox handoff for manual final post, Reddit/TikTok/Instagram/X engagement queues, performance ledger/scorecard learning loop.
- Frontend/content: markdown channel drafts and rendered slideshow assets under `content/`.
- Backend/automation: Node scripts under `scripts/`; local browser helpers live in the app repo social scripts.
- Data: JSON/Markdown banks under `inputs/`, generated packs under `content/slideshows/`, run records under `outputs/daily/`, dedupe ledgers under `inputs/performance/`.
- Integrations: OpenAI Images 2.0 for slide 1, Supabase public visual library, TikTok Content Posting API inbox `MEDIA_UPLOAD`, OpenClaw/Chrome for live engagement where available.

## Risk List

1. `scripts/generate_slideshow_topics.mjs`: sourced queue saturation can return no candidates even when usable sourced language exists.
2. `scripts/run_slideshow_pipeline.mjs`: schema defaults can repeat old core slide copy, caught by QA only after render.
3. `/Users/mariusgaarder/Documents/treningscoach/scripts/social/run-todays-pack.sh`: current app-side failure blocks canonical `growth:daily --execute`.
4. Browser path: Chrome CDP `127.0.0.1:9333` unavailable in this run; OpenClaw health was live but no safe direct execution path was exposed here.
5. TikTok public Direct Post: still avoided; inbox upload only until a successful audited direct-public test proves approval.

## Slideshow / Upload Result

- Preferred command: `/opt/homebrew/bin/npm run slideshow:full-loop -- --mode production --count 1 --generate-openai-hook --publish-mode manual-review`
- Preferred command result: dry/blocked at `outputs/full-loop/2026-06-25-195433/full-loop-report.json`; `beginner_runner` generated `0` candidates, other niches returned `no_new_matching_sourced_problems`.
- Recovery files:
  - `outputs/full-loop/2026-06-25-direct-run-by-feel-not-panic/single-problem-bank.json`
  - `outputs/full-loop/2026-06-25-direct-run-by-feel-not-panic/run-local-text-bank.json`
  - Shared hook/text banks were not mutated.
- Pack path: `content/slideshows/2026-06-25-wish-why-running-feels-too-hard-early`
- Hook: `Why running feels too hard early`
- Images 2.0 hook provenance: yes; `source/hook-provenance.json` generator `chatgpt_images_2_0`, `fallback_used: false`.
- Selected text-bank slide set: `first_minutes_settle_20260625_v1`
- Source problem: `rp_2026_06_25_first_minutes_feel_too_hard_reddit`
- CTA path: Coachi app-proof.
- Selected CTA asset: `coachi_cta_009_phone_forest_morning_44min`
- Materialize report ownership: slide 7 has `selected_source_rights: owned` and `selected_asset_original_source_kind: owned_coachi_phone_ui_cta_image2`.
- Caption text:

```text
Why running feels too hard early

The first minutes can feel louder than fitness. Slow down before panic takes over.

Save this for your next first mile.

#running #10k #halfmarathon #racetraining #coachi
```

- Caption-to-paste file: `content/slideshows/2026-06-25-wish-why-running-feels-too-hard-early/exports/2026-06-25-wish-why-running-feels-too-hard-early-caption-to-paste.txt`
- Caption export verification: exists and exactly matches `copy/tiktok-postiz-caption.txt`.
- Video path: none; this run used TikTok photo `MEDIA_UPLOAD` inbox handoff with exported JPEG carousel.
- TikTok payload: `content/slideshows/2026-06-25-wish-why-running-feels-too-hard-early/exports/2026-06-25-wish-why-running-feels-too-hard-early-tiktok-photo-inbox-payload.json`
- TikTok publish id: `p_inbox_url~v2.7655426304623413270`
- Final upload status: `SEND_TO_USER_INBOX`
- Manual next step: open TikTok inbox notification, paste the caption from the caption-to-paste file, and press Post.

## Verification

- `npm run slideshow:render -- --manifest content/slideshows/2026-06-25-wish-why-running-feels-too-hard-early/render-manifest.json`: passed.
- `npm run slideshow:qa -- --pack content/slideshows/2026-06-25-wish-why-running-feels-too-hard-early --production`: passed.
- `npm run slideshow:tiktok-inbox-upload -- --pack content/slideshows/2026-06-25-wish-why-running-feels-too-hard-early --integration cmorm85va0003nt6ro6b502fk`: passed with `SEND_TO_USER_INBOX`.

## Engagement Loop

- Candidate queue: `outputs/daily/2026-06-25-2204-post-slideshow-engagement-candidates.json`
- Queue result: `34` candidates, `2` duplicate suppressions.
- Surfaces searched/prepared: Reddit `19`, TikTok `5`, Instagram `4`, X `6`.
- Public engagement actions completed: `0`.
- Engagement ledger updates: none, because no public action was verified.
- Viral storagebag/hook/text-bank mutation during engagement: none; `COACHI_ENGAGEMENT_VIRAL_HOOK_RESEARCH=0`, `COACHI_DISABLE_VIRAL_HOOK_RESEARCH=1`.
- Canonical command attempted: `/opt/homebrew/bin/npm run growth:daily -- --date 2026-06-25 --mode stretch --skip-slideshow --execute`
- Engagement blocker: app-side social coordinator failed because `/Users/mariusgaarder/Documents/treningscoach/scripts/social/run-todays-pack.sh --date 2026-06-25 --json` returned non-zero.
- Browser blocker: Chrome CDP `127.0.0.1:9333` was unavailable; OpenClaw health `127.0.0.1:18789/health` returned live, but no safe public-action browser execution tool was exposed in this thread.
- Instagram status: skipped for public action execution in this run because browser/composer controls were unreliable after the prior Android engagement run.
- X status: queued only; prior state still had X blocked by account-access/security verification.

## Approval Queue

Top Reddit approval-gated drafts:

1. `easy day too fast` - `The useful fix is usually earlier feedback, not more discipline. If you wait until the run already feels hard, the easy day is mostly gone.`
2. `c25k pace too fast` - `For C25K, slower is usually the unlock. The goal is finishing the intervals controlled enough that you still want to train again.`
3. `marathon easy run drift` - `For marathon training, the easy day has to protect the next session. If it keeps drifting hard, I would slow it before changing the whole plan.`
4. `own thread follow up` - `That makes sense. The hard part is catching the drift early enough. I’m most interested in whether people want that feedback during the run or only after.`
5. `zone 2 discussion` - `Does anyone else find staying easy harder than running hard? I am curious whether people use breathing, heart rate, pace, watch alerts, or feel to stop easy runs from drifting too hard.`

Top TikTok/Instagram/X queued drafts:

1. TikTok `easy run mistakes` - `Most runners do not need more effort. They need a calmer start.`
2. TikTok `marathon training tips` - `Easy days only work if they stay easy.`
3. Instagram `easy run reels` - `Starting slower solves more easy runs than people expect.`
4. Instagram `beginner runner reels` - `The best beginner plan is the one you can repeat next week.`
5. X `AI builder founder journey` - `This is the part people underestimate. AI makes shipping faster, but product judgment becomes the bottleneck.`

No Reddit comments/posts/likes/follows/DMs were submitted. No TikTok, Instagram, or X public actions were submitted.
