# 2026-06-25 10:08 CEST TikTok Slideshow Upload + Engagement Loop

## Slideshow / Upload

- Pack path: `content/slideshows/2026-06-25-wish-your-running-pace-is-not-the-test`
- Hook: `Your running pace is not the test`
- Hook provenance from Images 2.0: yes, `source/hook-provenance.json`
- Images 2.0 fallback used: no
- Source problem: `rp_2026_06_25_ditch_pace_pressure_comparison`
- Selected text-bank slide set: `comparison_ditch_pace_pressure_2026_06_25`
- CTA path: Coachi app-proof
- Selected CTA asset: `coachi_cta_013_phone_mountain_morning_51min`
- CTA asset materialize report ownership: owned, `owned_coachi_phone_ui_cta_image2`
- Supabase CTA path used: no
- Video path: n/a; official TikTok inbox path used photo carousel `MEDIA_UPLOAD`
- Photo export path: `content/slideshows/2026-06-25-wish-your-running-pace-is-not-the-test/exports/tiktok-photo-slides`
- Caption-to-paste path: `content/slideshows/2026-06-25-wish-your-running-pace-is-not-the-test/exports/2026-06-25-wish-your-running-pace-is-not-the-test-caption-to-paste.txt`
- Caption-to-paste verification: exact match with `copy/tiktok-postiz-caption.txt`
- TikTok publish id: `p_inbox_url~v2.7655240395797858326`
- Final upload status: `SEND_TO_USER_INBOX`

Caption:

```text
Your running pace is not the test

Someone else's easy pace is not yours.

Coachi speaks before the run drifts.

#running #cardio #breathwork #runninghacks #coachi
```

Notes:

- Normal production queue was dry at `outputs/full-loop/2026-06-25-075209/full-loop-report.json`.
- Created run-local recovery bank and text-bank copy under `outputs/full-loop/2026-06-25-catch-drift-before-panic/`; shared hook/text banks were not mutated.
- Production QA passed; slide 1 has no headwear or eyewear and uses the Coachi runner-avatar family.
- Upload used `npm run slideshow:tiktok-inbox-upload -- --pack content/slideshows/2026-06-25-wish-your-running-pace-is-not-the-test --integration cmorm85va0003nt6ro6b502fk`.

## Engagement Loop

- Viral hook research disabled: `COACHI_ENGAGEMENT_VIRAL_HOOK_RESEARCH=0`, `COACHI_DISABLE_VIRAL_HOOK_RESEARCH=1`
- Candidate queue rebuilt: `outputs/daily/2026-06-25-engagement-candidates.json`
- Queue count: `32` candidates, `2` duplicate suppressions from the builder output
- Candidate mix: Reddit `19`, TikTok `5`, Instagram `4`, X `4`
- Live browser surfaces checked: TikTok, Instagram, Reddit, X
- Surface scan: `outputs/daily/2026-06-25-live-engagement-surface-scan.json`
- Public engagement actions completed: none
- Engagement ledger updates: none
- Viral storagebag appends: none
- Hook/text-bank mutations during engagement: none

Signed-in / blocker state:

- TikTok signed in as `Everyday Runner Lab`; search page exposed post URLs.
- Instagram signed in as `everydayrunnerlab`; search page exposed post URLs.
- Reddit signed in as `AlarmingTradition961`; old Reddit was reachable, but search DOM was noisy and public Reddit JSON search returned `403 Blocked`, so no exact Reddit reply target was prepared.
- X remains blocked at `https://x.com/account/access` by Cloudflare security verification.
- `npm run growth:daily -- --date 2026-06-25 --mode stretch --skip-slideshow --execute` failed on the known app-side dependency: `run-todays-pack.sh --date 2026-06-25 --json`.

## Approval Queues

No public actions were posted because action-time approval was not provided for this batch.

TikTok candidates for manual approval:

1. `comment` on `https://www.tiktok.com/@mat.wrightt/video/7580798195941297421`
   - Draft: `This is the easy-run trap. Pace starts feeling like a grade, then the run stops being easy.`
2. `comment` on `https://www.tiktok.com/@ultimate.running/video/6917232853428227330`
   - Draft: `The useful part is learning what easy feels like before the watch number becomes the whole story.`
3. `comment` on `https://www.tiktok.com/@abbiedennisonfit/video/7613166852092562710`
   - Draft: `That switch from speed to repeatability is the part most runners learn too late.`

Instagram candidates for manual approval:

1. `comment` on `https://www.instagram.com/p/DYMIDfbgsg3/`
   - Draft: `Easy runs get cleaner when pace stops being the scoreboard.`
2. `comment` on `https://www.instagram.com/p/DYgjrvwiKt8/`
   - Draft: `The best easy-run cue is usually restraint early, not more effort late.`
3. `comment` on `https://www.instagram.com/p/DXjI6FWDXCa/`
   - Draft: `This is where effort beats ego. The run should be repeatable before it looks impressive.`

Reddit:

- No exact Reddit action queued from this run because reliable thread URLs were not exposed by old Reddit search and Reddit JSON search returned `403 Blocked`.
- Keep Reddit reply-first and approval-gated on the next run.

X:

- No X action queued because the signed-in Chrome surface is blocked by Cloudflare account-access verification.

## Verification Commands

```bash
npm run slideshow:full-loop -- --mode production --count 1 --generate-openai-hook --publish-mode manual-review
node scripts/generate_slideshow_topics.mjs --date 2026-06-25 --limit 5 --problems outputs/full-loop/2026-06-25-catch-drift-before-panic/single-problem-bank.json --min-score 12 --out outputs/full-loop/2026-06-25-catch-drift-before-panic/topics-run-local.json --tiktok-text-bank outputs/full-loop/2026-06-25-catch-drift-before-panic/run-local-tiktok-text-bank.json --tiktok-account main --disable-hook-variation-bank
npm run slideshow:pipeline -- --date 2026-06-25 --limit 5 --candidate-index 0 --topics-out outputs/full-loop/2026-06-25-catch-drift-before-panic/topics-run-local.json --use-existing-topics --out-root content/slideshows --scheduled-at 2026-06-25T11:57:30.000Z --schedule-platform all --publish-mode manual-review --generate-openai-hook --production --prefer-remote
npm run slideshow:tiktok-inbox-upload -- --pack content/slideshows/2026-06-25-wish-your-running-pace-is-not-the-test --integration cmorm85va0003nt6ro6b502fk
npm run growth:engagement-candidates -- --date 2026-06-25 --out outputs/daily/2026-06-25-engagement-candidates.json
npm run growth:daily -- --date 2026-06-25 --mode stretch --skip-slideshow --execute
```

Outcomes:

- Preferred full-loop command: dry/no-new.
- Run-local topic generation: produced `1` fresh candidate.
- Production pipeline: passed QA with real Images 2.0 hook.
- TikTok inbox upload: `SEND_TO_USER_INBOX`.
- Engagement candidates: wrote `32` candidates.
- Growth daily execute: failed on `run-todays-pack.sh --json`; engagement continued via live CDP surface scan and approval queues.
