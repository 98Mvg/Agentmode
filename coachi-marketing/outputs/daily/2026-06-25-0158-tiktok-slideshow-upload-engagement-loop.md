# 2026-06-25 01:58 CEST TikTok Slideshow Upload + Engagement Loop

## Slideshow / Upload Result

- Status: blocked before pack creation.
- Preferred command: `/opt/homebrew/bin/npm run slideshow:full-loop -- --mode production --count 1 --generate-openai-hook --publish-mode manual-review`
- Preferred report: `outputs/full-loop/2026-06-24-235130/full-loop-report.json`
- Preferred result: `beginner_runner` returned `candidate_count: 0`; `easy_run_zone2`, `workout_control`, and `apple_watch_confusion` returned `no_new_matching_sourced_problems`.
- Recovery bank: `outputs/full-loop/2026-06-25-direct-let-alert-stay-quiet/single-problem-bank.json`
- Recovery source id: `rp_2026_06_25_let_alert_stay_quiet_reddit`
- Recovery source: `inputs/research/reddit-winning-language-bank.md`
- Recovery angle after one targeted adjustment: `Stop making easy runs a dashboard`
- Recovery reports:
  - `outputs/full-loop/2026-06-25-direct-let-alert-stay-quiet/full-loop-report.json`
  - `outputs/full-loop/2026-06-25-direct-let-alert-stay-quiet-rerun/full-loop-report.json`
- Recovery result: zero valid topic candidates; no pack was created.

## Required Slideshow Fields

- Pack path: none.
- Hook: none.
- Images 2.0 slide-1 provenance: none; run never reached image generation.
- Selected text-bank slide set: none.
- Selected CTA asset: none.
- CTA path: none.
- Caption text: none.
- Caption-to-paste file path: none.
- Video path: none.
- TikTok publish id: none.
- Final upload status: no upload attempted because no QA-passing pack or caption export existed.

## Engagement Loop

- Candidate queue: `outputs/daily/2026-06-25-engagement-candidates.json`
- Candidate count: `32`; blocked duplicates: `2`.
- Viral hook research policy: disabled with `COACHI_ENGAGEMENT_VIRAL_HOOK_RESEARCH=0` and `COACHI_DISABLE_VIRAL_HOOK_RESEARCH=1`.
- Canonical executor: `/opt/homebrew/bin/npm run growth:daily -- --date 2026-06-25 --mode stretch --skip-slideshow --execute`
- Executor result: failed before live actions because `/Users/mariusgaarder/Documents/treningscoach/scripts/social/run-todays-pack.sh --date 2026-06-25 --json` returned non-zero inside the app-side social coordinator.
- Browser stack: started `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh start`; live Chrome opened Reddit, X, Instagram, and TikTok tabs.
- Public engagement actions completed: `0`.
- Engagement ledger update: none.
- Viral storagebag update: none.
- Hook/text-bank mutation: none.

## Surface Checks

- Reddit: signed-in controls visible; read-only search for `running too fast on easy days` returned mostly irrelevant fresh results and community suggestions. Approval required before any Reddit comment/post/like/follow.
- TikTok: signed in as `@everydayrunnerlab0`; read-only search for `easy run mistakes` loaded top/search tabs but the snapshot did not expose usable result cards. No likes/comments/follows attempted.
- Instagram: signed in as `everydayrunnerlab`; home feed visible. Search for `easy run mistakes` opened but remained in a loading state. No likes/comments/follows attempted.
- X: blocked by Cloudflare security verification at `https://x.com/account/access`; no X actions attempted.

## Approval Queue Prepared

No public action below was submitted. Use these as approval-gated candidates after live surface review:

| # | Platform | Action | Target / search | Draft |
|---|---|---|---|---|
| 1 | Reddit | reply | `https://www.reddit.com/search/?q=running%20too%20fast%20on%20easy%20days&type=posts&sort=new` | `The useful fix is usually earlier feedback, not more discipline. If you wait until the run already feels hard, the easy day is mostly gone.` |
| 2 | Reddit | reply | `https://www.reddit.com/search/?q=C25K%20pace%20too%20fast%20heart%20rate&type=posts&sort=new` | `For C25K, slower is usually the unlock. The goal is finishing the intervals controlled enough that you still want to train again.` |
| 3 | Reddit | reply | `https://www.reddit.com/search/?q=marathon%20training%20easy%20runs%20too%20fast&type=posts&sort=new` | `For marathon training, the easy day has to protect the next session. If it keeps drifting hard, I would slow it before changing the whole plan.` |
| 4 | Reddit | discussion draft | `r/beginnerrunning` or `r/AppleWatchFitness` after rules check | `Does anyone else find staying easy harder than running hard? I am curious whether people use breathing, heart rate, pace, watch alerts, or feel to stop easy runs from drifting too hard.` |
| 5 | TikTok | comment | `https://www.tiktok.com/search?q=easy%20run%20mistakes` | `Most runners do not need more effort. They need a calmer start.` |
| 6 | TikTok | comment on larger relevant video | `https://www.tiktok.com/search?q=marathon%20training%20tips` | `Easy days only work if they stay easy.` |
| 7 | Instagram | comment | `https://www.instagram.com/explore/search/keyword/?q=easy%20run%20mistakes` | `Starting slower solves more easy runs than people expect.` |
| 8 | X | reply | `https://x.com/search?q=%22real-time%20AI%22%20app%20latency&src=typed_query&f=live` | `Real-time AI is judged by timing before intelligence. A decent answer at the right moment beats a brilliant one that arrives late.` |

## Blockers

- Slideshow topic generation is dry even with one run-local sourced recovery bank; the run did not reach Images 2.0, render, caption export, CTA selection, or upload.
- App-side engagement executor still depends on a missing/failing daily content pack resolver.
- X requires security verification.
- Instagram search/composer reliability is not sufficient for public action from this automation run.
- TikTok search snapshot did not expose enough result detail to safely select exact public actions.
