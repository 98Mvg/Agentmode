# 2026-06-26 Scorecard

## TikTok Slideshow Inbox Handoff

- Pack: `content/slideshows/2026-06-26-reframe-why-watch-checks-make-easy-runs-harder`
- Hook: `Why watch checks make easy runs harder`
- Source problem: `rp_2026_06_26_catch_drift_early_tiktok`
- Slide text source: `watch_drift_before_loud_v1`
- CTA: Supabase `cta_ending_006`, generic save CTA
- QA: passed after core-copy freshening
- Inbox status: `SEND_TO_USER_INBOX`
- Publish id: `p_inbox_url~v2.7655487305456650262`

## Engagement Loop

- Candidate queue: `outputs/daily/2026-06-26-0202-post-slideshow-engagement-candidates.json`
- Approval queue: `outputs/daily/2026-06-26-0202-post-slideshow-approval-queue.json`
- Public actions completed: `0`
- Ledger updates: `0`
- Blocker: live browser profile was not signed in for TikTok/Instagram/X, Reddit hit JS challenge, and app-side social coordinator failed on `run-todays-pack.sh`.

## Learning

- Strong reusable angle: watch checks make an easy run feel urgent before the effort is actually out of control.
- Best caption shape: one practical ceiling, one drift correction, simple save CTA.

## 08:02 Android Coachi Mention Continuation

- Source run note: `outputs/daily/2026-06-25-2110-android-coachi-20-mention-run.md`
- Public actions verified posted in this continuation: `8`
- Batch total verified posted after continuation: `10/20`
- Android early-test invitations verified posted after continuation: `10`
- Direct links posted: `0`
- Ledger rows added: `9` (`8` posted, `1` removed_after_post)
- TikTok: `5` verified comments posted, then stopped at stretch comment cap.
- Instagram: `3` verified comments posted; `1` additional comment was initially visible, then Instagram reported it removed, so Instagram posting stopped.
- X: still blocked at `x.com/account/access`.
- Reddit: still exact-prepared-batch approval-gated for public Coachi mentions.

### Copy Learning

- User correction: public Coachi mentions should use the App Store/product-description language, not improvised positioning.
- Reusable description language: `live coaching while you're still training`, `choose the heart-rate zone`, `clear voice guidance`, `slow down, speed up, or keep going`, `training too hard / not hard enough / exactly on target`.
- Instagram risk: repeating product-forward description blocks too tightly can trigger moderation. Next loop should keep the description wording, but use fewer Instagram comments and make each one more post-specific before the Android CTA.

## 12:56 Android Coachi Mention Completion

- Source run note: `outputs/daily/2026-06-25-2110-android-coachi-20-mention-run.md`
- Public actions verified posted in this continuation: `10`
- Final batch total: `20/20` verified posted.
- Android early-test invitations verified posted: `20`
- Direct links posted: `0`
- Ledger rows added: `10`, all status `posted`.
- TikTok: `5` comments and `2` comment replies verified, then stopped at cap.
- Reddit: `2` no-link transparent replies in `r/androidapps`; second reply posted after waiting out cooldown.
- Instagram: `1` carefully scoped comment verified with no per-post moderation notice.
- X: still blocked at account-access/security verification.

### Completion Learning

- Strongest fit: posts/comments where runners explicitly ask how to stay in Zone 2 or whether a watch/app can guide the session.
- Safer public wording: answer the thread first, then use one Coachi sentence tied to live voice guidance and heart-rate zone/workout goal selection.
- Reddit works best when Coachi is framed as the workout-coaching layer after HR measurement, not as a claim to solve sensor accuracy or all-day Health Connect analysis.

## 14:21 TikTok Slideshow Text-Rotation Repair

- Source run note: `outputs/daily/2026-06-26-1421-tiktok-slideshow-text-rotation-repair.md`
- Repaired `5` too-similar main-account slideshow packs as `-text-rotation-v2` variants with the same visual sources and new overlay text/captions.
- Hook rotation:
  - `Why your first running mile lies`
  - `Why your recovery run turns hard`
  - `Why Zone 2 feels boring`
  - `Why heart rate climbs late`
  - `Why watch checks feel urgent`
- Runtime guard added: `scripts/generate_slideshow_topics.mjs` now prefers fresh hook families inside a batch before reusing a family.
- Text bank policy added: `inputs/research/tiktok-proven-slideshow-text-bank.json` now includes `hook_rotation_policy`.
- TikTok inbox upload succeeded for `2026-06-26-main-01-firstmile-your-first-mile-should-feel-too-easy-text-rotation-v2`.
- Publish id: `p_inbox_url~v2.7655677565578774550`
- TikTok blocked the next repaired upload with `403 spam_risk_too_many_pending_share`, so remaining upload attempts were stopped.
- Verification: all `5` repaired packs passed render, production QA, and inbox preflight; `npm test -- scripts/__tests__/generate_slideshow_topics_hook_dedupe.test.mjs` and `npm run slideshow:validate` passed.

### 19:21 Retry

- Sent second repaired pack to TikTok inbox: `Why your recovery run turns hard`.
- Publish id: `p_inbox_url~v2.7655755026858002435`
- Already-sent first repaired pack remained in inbox: `Why your first running mile lies`, publish id `p_inbox_url~v2.7655677565578774550`.
- Attempted third repaired pack `Why Zone 2 feels boring`; preflight, public media prep, and payload build passed, then TikTok rejected the content init call with `403 spam_risk_too_many_pending_share`.
- Remaining unsent but QA-ready: `Why Zone 2 feels boring`, `Why heart rate climbs late`, and `Why watch checks feel urgent`.

### 21:59 Retry

- Retried third repaired pack: `Why Zone 2 feels boring`.
- Readiness, duplicate check, JPEG export, public media prep, and payload generation passed again.
- TikTok rejected the content init call again with `403 spam_risk_too_many_pending_share`.
- No new inbox upload was created in this retry.
- Current TikTok inbox uploads remain `Why your first running mile lies` and `Why your recovery run turns hard`.
- Remaining unsent but QA-ready: `Why Zone 2 feels boring`, `Why heart rate climbs late`, and `Why watch checks feel urgent`.

### Copy Learning

- The previous set over-indexed on adjacent easy-run phrasing. Future main-account batches should rotate between first-mile, recovery, Zone 2, heart-rate, watch-checking, comparison, and workout-control families before repeating easy-run language.
- Product-description wording worked cleanly in captions: live voice guidance while training, choose the workout goal or heart-rate zone, and hear when to slow down, speed up, or keep going.
