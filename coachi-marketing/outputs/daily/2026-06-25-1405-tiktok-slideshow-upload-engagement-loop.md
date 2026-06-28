# 2026-06-25 14:05 CEST TikTok slideshow upload + engagement loop

## Slideshow / Upload

- Preferred command run: `npm run slideshow:full-loop -- --mode production --count 1 --generate-openai-hook --publish-mode manual-review`.
- Preferred result: blocked. Normal sourced queue returned no usable new production candidate:
  - `beginner_runner`: `candidate_count: 0`
  - `easy_run_zone2`, `workout_control`, `apple_watch_confusion`: `no_new_matching_sourced_problems`
  - report: `outputs/full-loop/2026-06-25-115255/full-loop-report.json`
- Recovery banks created, run-local only:
  - `outputs/full-loop/2026-06-25-direct-stop-negotiating-mid-run/single-problem-bank.json`
  - `outputs/full-loop/2026-06-25-direct-easy-effort-not-pace/single-problem-bank.json`
  - `outputs/full-loop/2026-06-25-direct-easy-effort-not-pace/run-local-text-bank.json`
- Recovery production attempts:
  - Reddit-language recovery was filtered by the topic generator's default Reddit hook-source gate.
  - TikTok-source recovery still produced no candidate with normal dedupe/cooldown gates.
  - Diagnostic and direct-pipeline attempts showed the only generated stub reused shared text-bank slide set `easy_runs_feel_pointless_v1`, so it was rejected for this automation's freshness rule.
- Non-uploadable stub created then stopped before hook completion:
  - pack path: `content/slideshows/2026-06-25-tips-your-easy-pace-is-not-embarrassing`
  - hook: `Your easy pace is not embarrassing`
  - source problem id: `rp_2026_06_25_easy_effort_not_pace_tiktok`
  - hook provenance from Images 2.0: `no`
  - selected text-bank slide set: `easy_runs_feel_pointless_v1` (reused; therefore blocked)
  - selected CTA asset/path: `supabase_template` / `cta_ending`, no owned app-proof CTA selected
  - caption text:

```text
Your easy pace is not embarrassing

Easy runs usually fail slowly: one small surge, then another, then the whole run pays later.

Send this to your fast-start friend.

#running #10k #halfmarathon #racetraining #coachi
```

- caption-to-paste file path: none created
- video path: none created
- TikTok publish_id: none
- final upload status: skipped; no TikTok inbox upload attempted
- blocker: no fresh non-duplicate slideshow reached Images 2.0 hook provenance/QA, and the only generated stub reused a shared text-bank slide set. No placeholder, repeat hook, or direct-public post was uploaded.

## Engagement Loop

- Engagement research flags: `COACHI_ENGAGEMENT_VIRAL_HOOK_RESEARCH=0`, `COACHI_DISABLE_VIRAL_HOOK_RESEARCH=1`.
- Ranked queue rebuilt: `outputs/daily/2026-06-25-engagement-candidates.json`
  - candidates: `32`
  - blocked duplicates: `2`
- Canonical growth command attempted:
  - `npm run growth:daily -- --date 2026-06-25 --mode stretch --skip-slideshow --execute`
  - result: failed in app-side social coordinator because `run-todays-pack.sh --date 2026-06-25 --json` returned non-zero.
- Browser/live surfaces:
  - OpenClaw health: live at `127.0.0.1:18789`
  - Chrome CDP: live at `127.0.0.1:9333`
  - TikTok: signed-in/search surface visible at `https://www.tiktok.com/search?q=easy%20run%20mistakes`; individual post pages opened blank, so no public action attempted.
  - Instagram: search links visible and post pages readable; skipped public action because one inspected target already had a same-day `everydayrunnerlab` comment and no exact approval batch was confirmed.
  - Reddit: signed in, but ranked Reddit search surfaced noisy/off-topic results; no Reddit comments/posts/likes/follows without exact user confirmation.
  - X: blocked at `https://x.com/account/access` by Cloudflare/security verification.
- Public engagement actions completed: none.
- Engagement ledger updates: none.
- Viral storagebag or hook/text-bank mutation: none.

## Approval Queues Prepared

TikTok candidates to review manually, no action taken:

1. `https://www.tiktok.com/@abbiedennisonfit/video/7613166852092562710`
   - fit: easy run not meant to be impressive
   - possible no-link comment: `This is the easy-run trap. If it starts slightly too eager, the whole run pays for it later.`
2. `https://www.tiktok.com/@_dwruns/video/7638325456705637635`
   - fit: running fast makes beginners quit
   - possible no-link comment: `The first win is often just starting slower than pride wants. That keeps tomorrow possible.`

Instagram candidates to review manually, no action taken:

1. `https://www.instagram.com/p/DYMIDfbgsg3/`
   - fit: slow/Z2 running discussion with runner questions in comments
   - possible no-link comment: `Slow running gets easier when the success condition is control, not a pace that looks good on the watch.`
2. `https://www.instagram.com/p/DYPV_FNDTnz/`
   - status: skipped; existing same-day `everydayrunnerlab` comment already visible.

Reddit:

- No exact approval queue prepared from current results because the live ranked search was off-topic/noisy.
- Continue using Reddit reply-first rules and require exact user confirmation before any Reddit public action.

X:

- No queue prepared; browser is blocked by Cloudflare/security verification.
