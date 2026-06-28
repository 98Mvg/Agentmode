# 2026-06-26 18:04 CEST TikTok slideshow upload loop + engagement

## Slideshow / Upload

- Status: blocked before pack creation.
- Normal production command: `/opt/homebrew/bin/npm run slideshow:full-loop -- --mode production --count 1 --generate-openai-hook --publish-mode manual-review`
- Normal report: `outputs/full-loop/2026-06-26-155752/full-loop-report.json`
- Normal result: `beginner_runner` produced `candidate_count: 0`; `easy_run_zone2`, `workout_control`, and `apple_watch_confusion` returned `no_new_matching_sourced_problems`.
- Recovery bank: `outputs/full-loop/2026-06-26-direct-breath-before-pace/single-problem-bank.json`
- Recovery source: `inputs/research/reddit-winning-language-bank.md`
- Recovery source problem id: `rp_2026_06_26_breath_before_pace_reddit`
- Recovery command: `/opt/homebrew/bin/npm run slideshow:full-loop -- --mode production --count 1 --generate-openai-hook --publish-mode manual-review --problems-bank outputs/full-loop/2026-06-26-direct-breath-before-pace/single-problem-bank.json --run-dir outputs/full-loop/2026-06-26-direct-breath-before-pace`
- Recovery report: `outputs/full-loop/2026-06-26-direct-breath-before-pace/full-loop-report.json`
- Recovery result: `candidate_count: 0`.
- Pack path: none.
- Hook: none.
- Slide 1 Images 2.0 provenance: none; Images 2.0 was not reached.
- Selected text-bank slide set: none.
- Selected CTA asset: none.
- CTA path: none.
- Caption text: none.
- Caption-to-paste file path: none.
- Video path: none.
- TikTok publish_id: none.
- Final upload status: not attempted.
- Blocker: strict duplicate and slide-copy guards could not form a fresh non-duplicate candidate from the normal queue or one run-local sourced recovery bank. No placeholder, reused hook, low-quality upload, direct-public post, or Postiz public schedule was attempted.

## Engagement

- Candidate queue: `outputs/daily/2026-06-26-1600-post-slideshow-engagement-candidates.json`
- Queue result: `32` candidates; `2` recent duplicates suppressed by the builder output.
- Platform mix: Reddit `19`, TikTok `5`, Instagram `4`, X `4`.
- Canonical command: `/opt/homebrew/bin/npm run growth:daily -- --date 2026-06-26 --mode stretch --skip-slideshow --execute`
- Canonical result: blocked by `/Users/mariusgaarder/Documents/treningscoach/scripts/social/run-todays-pack.sh --date 2026-06-26 --json` returning non-zero through the app-side social coordinator.
- Browser path checked: OpenClaw browser on CDP `127.0.0.1:18800`.
- TikTok surface: opened `https://www.tiktok.com/@everydayrunnerlab0`; public page loaded, but the browser still exposed a `Log in` button, so signed-in public actions were not safe.
- Instagram surface: opened `https://www.instagram.com/everydayrunnerlab/`; browser landed on a saved-profile `Continue everydayrunnerlab` screen, not a verified usable logged-in composer surface. Instagram skipped.
- Reddit surface: opened `https://www.reddit.com/user/AlarmingTradition961/submitted/`; tab reported Reddit JS/recaptcha verification URL. Reddit actions remain exact-approval-gated and were not submitted.
- X surface: opened `https://x.com/home`; browser showed the logged-out X landing/login form. X actions skipped.
- Engagement surfaces searched: ranked candidate queue plus TikTok profile, Instagram saved-profile screen, Reddit own-submitted URL, X home.
- Public engagement actions completed: `0`.
- Approval queues prepared: use the top queue items in `outputs/daily/2026-06-26-1600-post-slideshow-engagement-candidates.json`; Reddit remains exact-batch approval-gated, TikTok/Instagram/X need signed-in browser state before posting.
- Coachi mentions used: `0`.
- Direct Coachi links used: `0`.
- Ledger update: none; no public actions succeeded.
- Viral hook research: disabled with `COACHI_ENGAGEMENT_VIRAL_HOOK_RESEARCH=0` and `COACHI_DISABLE_VIRAL_HOOK_RESEARCH=1`; no append to `inputs/research/tiktok-viral-storagebag.jsonl` and no shared hook/text bank mutation during engagement.

## Top Approval Queue

1. Reddit reply search: `running too fast on easy days`
   - Draft: `The useful fix is usually earlier feedback, not more discipline. If you wait until the run already feels hard, the easy day is mostly gone.`
   - Promo: no promo.
2. Reddit reply search: `C25K pace too fast heart rate`
   - Draft: `For C25K, slower is usually the unlock. The goal is finishing the intervals controlled enough that you still want to train again.`
   - Promo: no promo.
3. Reddit discussion post candidate:
   - Draft: `Does anyone else find staying easy harder than running hard? I am curious whether people use breathing, heart rate, pace, watch alerts, or feel to stop easy runs from drifting too hard.`
   - Promo: no link.
4. TikTok comment search: `easy run mistakes`
   - Draft: `Most runners do not need more effort. They need a calmer start.`
   - Status: queued until TikTok is signed in.
5. Instagram comment search: `easy run mistakes`
   - Draft: `Starting slower solves more easy runs than people expect.`
   - Status: skipped until Instagram is fully logged in.
6. X reply search: `"building with AI" founder`
   - Draft: `This is the part people underestimate. AI makes shipping faster, but product judgment becomes the bottleneck.`
   - Status: skipped until X is logged in.
