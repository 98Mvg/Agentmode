# 2026-06-26 12:00 CEST - TikTok slideshow upload + engagement loop

## Slideshow / upload

- Preferred command run: `/opt/homebrew/bin/npm run slideshow:full-loop -- --mode production --count 1 --generate-openai-hook --publish-mode manual-review`
- Preferred full-loop report: `/Volumes/Riot APFS/Agentmode/coachi-marketing/outputs/full-loop/2026-06-26-115708/full-loop-report.json`
- Preferred result: blocked; `beginner_runner` produced `candidate_count: 0`, and `easy_run_zone2`, `workout_control`, and `apple_watch_confusion` had no new matching sourced problems.
- Recovery problem bank: `/Volumes/Riot APFS/Agentmode/coachi-marketing/outputs/full-loop/2026-06-26-direct-easy-runs-won-early/single-problem-bank.json`
- Recovery full-loop report: `/Volumes/Riot APFS/Agentmode/coachi-marketing/outputs/full-loop/2026-06-26-direct-easy-runs-won-early/run/full-loop-report.json`
- Recovery direct pipeline topics: `/Volumes/Riot APFS/Agentmode/coachi-marketing/outputs/full-loop/2026-06-26-direct-easy-runs-won-early/recovery-topics.json`
- Diagnostic topics only: `/Volumes/Riot APFS/Agentmode/coachi-marketing/outputs/full-loop/2026-06-26-direct-easy-runs-won-early/diagnostic-topics.json`
- Blocker: all safe production routes returned zero non-duplicate topic candidates. The diagnostic could form only a dedupe-bypassed candidate with reused hook `Your easy run should feel boring`, so it was not used for upload.
- Fresh pack path: none
- Hook: none
- Slide 1 Images 2.0 provenance: none
- Slide 1 hook provenance from Images 2.0: no
- Selected text-bank slide set: none
- Selected CTA asset: none
- CTA path: none
- Caption text: none
- Caption-to-paste file path: none
- Video path: none
- TikTok publish id: none
- Final upload status: `blocked_no_non_duplicate_slideshow_candidate`
- Upload attempt: not run

## Engagement

- Candidate queue: `/Volumes/Riot APFS/Agentmode/coachi-marketing/outputs/daily/2026-06-26-1200-post-slideshow-engagement-candidates.json`
- Candidate summary: `32` candidates, `2` duplicates suppressed.
- Viral-hook research state: disabled with `COACHI_ENGAGEMENT_VIRAL_HOOK_RESEARCH=0` and `COACHI_DISABLE_VIRAL_HOOK_RESEARCH=1`.
- Hook/text-bank mutation during engagement: none.
- Canonical command attempted: `/opt/homebrew/bin/npm run growth:daily -- --date 2026-06-26 --mode stretch --skip-slideshow --execute`
- Canonical blocker: app-side `social-coordinator.sh` failed because `run-todays-pack.sh --date 2026-06-26 --json` returned non-zero.
- Fallback command run: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-engagement-fallback.sh --date 2026-06-26 --platform all --mode stretch --no-start-browser --inhouse-blocker "growth:daily failed on run-todays-pack.sh --date 2026-06-26 --json; public actions remain approval-gated" --json`
- Fallback note: `/Volumes/Riot APFS/Agentmode/coachi-marketing/outputs/daily/2026-06-26-clawbot-engagement-fallback.md`
- Fallback JSON: `/Volumes/Riot APFS/Agentmode/coachi-marketing/outputs/daily/2026-06-26-clawbot-engagement-fallback.json`
- Browser state: OpenClaw is ready, but Clawbot live Chrome is not ready; `127.0.0.1:9333` refused connection and no safe signed-in composer path was available.

## Engagement surfaces searched / queued

- Reddit:
  - `https://www.reddit.com/search/?q=running%20too%20fast%20on%20easy%20days&type=posts&sort=new`
  - `https://www.reddit.com/search/?q=C25K%20pace%20too%20fast%20heart%20rate&type=posts&sort=new`
  - `https://www.reddit.com/search/?q=marathon%20training%20easy%20runs%20too%20fast&type=posts&sort=new`
  - `https://www.reddit.com/search/?q=site%3Areddit.com%2Fr%2Fbeginnerrunning%20%22staying%20easy%22%20%22Zone%202%22&type=posts&sort=new`
  - `https://www.reddit.com/search/?q=zone%202%20easy%20run%20discussion%20beginner%20runners&type=posts&sort=new`
- TikTok:
  - `https://www.tiktok.com/search?q=easy%20run%20mistakes`
  - `https://www.tiktok.com/search?q=beginner%20runner%20journey`
  - `https://www.tiktok.com/search?q=marathon%20training%20tips`
- Instagram:
  - `https://www.instagram.com/explore/search/keyword/?q=easy%20run%20mistakes`
  - `https://www.instagram.com/explore/search/keyword/?q=beginner%20runner%20tips`
  - `https://www.instagram.com/explore/search/keyword/?q=zone%202%20running`
- X:
  - `https://x.com/search?q=%22building%20with%20AI%22%20founder&src=typed_query&f=live`
  - `https://x.com/search?q=%22real-time%20AI%22%20app%20latency&src=typed_query&f=live`
  - `https://x.com/search?q=%22Codex%22%20%22app%22%20founder&src=typed_query&f=live`

## Public actions completed

- Reddit: `0`
- TikTok: `0`
- Instagram: `0`
- X: `0`
- Engagement ledger updated: no
- Direct Coachi links used: `0`
- Coachi mentions used: `0`

## Approval queues prepared

### Reddit

- Status: needs exact user confirmation before any public reply/post.
- Reply candidate: `The useful fix is usually earlier feedback, not more discipline. If you wait until the run already feels hard, the easy day is mostly gone.`
- Reply candidate: `For C25K, slower is usually the unlock. The goal is finishing the intervals controlled enough that you still want to train again.`
- Reply candidate: `For marathon training, the easy day has to protect the next session. If it keeps drifting hard, I would slow it before changing the whole plan.`
- Own-thread follow-up candidate: `That makes sense. The hard part is catching the drift early enough. I’m most interested in whether people want that feedback during the run or only after.`
- Discussion candidate: `Does anyone else find staying easy harder than running hard? I am curious whether people use breathing, heart rate, pace, watch alerts, or feel to stop easy runs from drifting too hard.`

### TikTok

- Status: queued only; login/composer state not safely verified.
- Comment candidate: `Most runners do not need more effort. They need a calmer start.`
- Like/follow review surface: `beginner runner journey`; only high-fit real runner accounts.
- Larger-video comment candidate: `Easy days only work if they stay easy.`

### Instagram

- Status: skipped for public action because signed-in/composer state was not safely verified.
- Comment candidate: `Starting slower solves more easy runs than people expect.`
- Comment candidate: `The best beginner plan is the one you can repeat next week.`
- Comment candidate: `The hard part is trusting easy long enough for it to work.`

### X

- Status: queued only; no public action.
- Reply candidate: `This is the part people underestimate. AI makes shipping faster, but product judgment becomes the bottleneck.`
- Reply candidate: `Real-time AI is judged by timing before intelligence. A decent answer at the right moment beats a brilliant one that arrives late.`
- Like/follow review text: `Codex is strongest when the product decision is already clear. It punishes vague direction fast.`

## Blockers / notes

- No direct-public TikTok post was attempted.
- No TikTok FILE_UPLOAD inbox upload was attempted because no fresh valid pack/video was produced.
- No placeholder, reused hook, reused pack, or dedupe-bypassed diagnostic candidate was uploaded.
- No viral storagebag append, shared hook/text-bank mutation, engagement ledger update, staging, or commit was made.
