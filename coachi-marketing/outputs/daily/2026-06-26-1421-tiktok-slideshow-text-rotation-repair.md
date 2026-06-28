# 2026-06-26 TikTok Slideshow Text Rotation Repair

## User Request
- Last TikTok slideshow uploads looked too familiar.
- Improve hooks/captions and upload the same slideshow visuals with different text.
- Rotate the hook bank harder, especially away from too much easy-run talk.

## Repair Set
- `content/slideshows/2026-06-26-main-01-firstmile-your-first-mile-should-feel-too-easy-text-rotation-v2`
  - Hook: `Why your first running mile lies`
  - Status: uploaded to TikTok inbox.
  - Publish id: `p_inbox_url~v2.7655677565578774550`
- `content/slideshows/2026-06-26-main-02-notworkout-stop-turning-easy-runs-into-workouts-text-rotation-v2`
  - Hook: `Why your recovery run turns hard`
  - Status: production QA and preflight passed; TikTok upload blocked by `spam_risk_too_many_pending_share`.
- `content/slideshows/2026-06-26-main-03-zoneboring-zone-2-should-feel-almost-boring-text-rotation-v2`
  - Hook: `Why Zone 2 feels boring`
  - Status: production QA and inbox preflight passed; upload not attempted after TikTok spam-risk block.
- `content/slideshows/2026-06-26-main-04-minute10-why-easy-runs-get-hard-after-minute-10-text-rotation-v2`
  - Hook: `Why heart rate climbs late`
  - Status: production QA and inbox preflight passed; upload not attempted after TikTok spam-risk block.
- `content/slideshows/2026-06-26-reframe-why-watch-checks-make-easy-runs-harder-text-rotation-v2`
  - Hook: `Why watch checks feel urgent`
  - Status: production QA and inbox preflight passed; upload not attempted after TikTok spam-risk block.

## Copy Changes
- Kept the same slideshow visual sources and rerendered the local text overlays.
- Replaced repeated easy-run hooks with a broader rotation:
  - first running mile
  - recovery-run drift
  - Zone 2 repeatability
  - delayed heart-rate drift
  - watch-check urgency
- Captions now use the product-description language:
  - live voice guidance while training
  - choose workout goal or heart-rate zone
  - slow down, speed up, or keep going
  - too hard, not hard enough, exactly on target

## Runtime Change
- Added `hook_family_rotation` selection to `scripts/generate_slideshow_topics.mjs`.
- Added `hook_rotation_policy` to `inputs/research/tiktok-proven-slideshow-text-bank.json`.
- Added regression coverage in `scripts/__tests__/generate_slideshow_topics_hook_dedupe.test.mjs`.

## Verification
- `npm run slideshow:render` passed for all 5 repaired packs.
- `npm run slideshow:qa -- --production --pack <pack>` passed for all 5 repaired packs.
- `npm test -- scripts/__tests__/generate_slideshow_topics_hook_dedupe.test.mjs` passed.
- `npm run slideshow:validate` passed.
- Inbox preflight passed for all 5 repaired packs.

## Blocker
- TikTok accepted the first repaired pack and returned `SEND_TO_USER_INBOX`.
- TikTok rejected the second repaired pack at `/v2/post/publish/content/init/` with `403 spam_risk_too_many_pending_share`.
- Stopped additional upload attempts to avoid repeated API hits while the account has too many pending TikTok inbox shares.

## 19:21 CEST Retry
- User asked to send the updated slideshows to TikTok inbox.
- Sent `2026-06-26-main-02-notworkout-stop-turning-easy-runs-into-workouts-text-rotation-v2`.
  - Hook: `Why your recovery run turns hard`
  - Status: `SEND_TO_USER_INBOX`
  - Publish id: `p_inbox_url~v2.7655755026858002435`
- Attempted `2026-06-26-main-03-zoneboring-zone-2-should-feel-almost-boring-text-rotation-v2`.
  - Hook: `Why Zone 2 feels boring`
  - Preflight/media/payload succeeded.
  - TikTok blocked `/v2/post/publish/content/init/` with `403 spam_risk_too_many_pending_share`.
- Stopped after the block. Remaining unsent but QA-ready:
  - `2026-06-26-main-03-zoneboring-zone-2-should-feel-almost-boring-text-rotation-v2`
  - `2026-06-26-main-04-minute10-why-easy-runs-get-hard-after-minute-10-text-rotation-v2`
  - `2026-06-26-reframe-why-watch-checks-make-easy-runs-harder-text-rotation-v2`

## 21:59 CEST Retry
- User asked to try sending again.
- Retried `2026-06-26-main-03-zoneboring-zone-2-should-feel-almost-boring-text-rotation-v2`.
  - Hook: `Why Zone 2 feels boring`
  - Preflight/media/payload succeeded again.
  - TikTok blocked `/v2/post/publish/content/init/` with `403 spam_risk_too_many_pending_share`.
- Stopped after the block. No new TikTok inbox upload was created in this retry.
- Still in TikTok inbox from previous attempts:
  - `Why your first running mile lies` / `p_inbox_url~v2.7655677565578774550`
  - `Why your recovery run turns hard` / `p_inbox_url~v2.7655755026858002435`
- Remaining unsent but QA-ready:
  - `2026-06-26-main-03-zoneboring-zone-2-should-feel-almost-boring-text-rotation-v2`
  - `2026-06-26-main-04-minute10-why-easy-runs-get-hard-after-minute-10-text-rotation-v2`
  - `2026-06-26-reframe-why-watch-checks-make-easy-runs-harder-text-rotation-v2`
