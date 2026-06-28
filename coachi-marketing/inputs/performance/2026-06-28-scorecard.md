# 2026-06-28 Scorecard

## TikTok slideshow inbox

- Main account sends: `5/5` to `everydayrunnerlab0`.
- Secondary/watch account sends: `5/5` to `runwatchlab`.
- Corrective watch-account replacement sends: `1/1` to `runwatchlab`.
- Total inbox handoffs: `11` (`10` initial + `1` corrected replacement).
- Final TikTok state: `SEND_TO_USER_INBOX`.
- Public posts: `0` automated; owner still presses Post in the TikTok app.
- Run note: `outputs/daily/2026-06-28-1748-dual-channel-tiktok-inbox-send.md`.
- Hook repair note: `outputs/daily/2026-06-28-1915-watch-hook-storage-bank-repair.md`.
- Retry manifest: `outputs/full-loop/2026-06-28-dual-channel-5x/dual-channel-inbox-retry-manifest.json`.
- Corrected watch hook: `Trying to keep Zone 2 easy?` (`p_inbox_url~v2.7656494509328631831`).

## Learnings

- Docker/Colima must be running before TikTok inbox upload because the Postiz container helper performs the TikTok Content Posting API call.
- The strict retry path should stop on Docker/auth/rate-limit blockers, but after Colima restart the same generated packs uploaded cleanly.
- The 2026-06-28 pack set successfully avoided the earlier too-similar slideshow problem by rotating hook shape, visual world, source problem, and CTA emphasis across main and watch accounts.
- For rejected RunWatchLab/watch-account hooks, use `inputs/research/tiktok-viral-storagebag.jsonl` and `inputs/research/tiktok-proven-slideshow-text-bank.json` as the source of truth, then make safe variations. Avoid abstract AI-generated hooks in the rejected family: `watch is not a coach`, `watch shows`, `tells you too late`, `chasing watch numbers`, and `catches drift`.
