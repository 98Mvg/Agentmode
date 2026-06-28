# 2026-06-28 RunWatchLab Hook Repair

## Outcome

- Repaired the rejected secondary/watch TikTok slideshow hook using the TikTok storage bank as source of truth.
- Final pack: `content/slideshows/2026-06-28-watch-05-hookfix-trying-to-keep-zone-2-easy`.
- Final hook: `Trying to keep Zone 2 easy?`
- TikTok account: `runwatchlab`.
- TikTok final state: `SEND_TO_USER_INBOX`.
- Publish id: `p_inbox_url~v2.7656494509328631831`.
- Public post status: not automated. The owner still needs to open TikTok inbox and press Post.

## Rejected Direction

The user rejected the abstract/AI-generated watch-hook family:

- `Your watch shows, it does not coach`
- `Stop chasing watch numbers`
- `Your watch tells you too late`
- `catches drift`

Do not use this family as a primary RunWatchLab hook unless the user explicitly asks for that style again.

## Storage-Bank Source

- Source file: `inputs/research/tiktok-viral-storagebag.jsonl`.
- Supporting source: `inputs/research/tiktok-proven-slideshow-text-bank.json`.
- Adapted pattern: Zone 2/watch-number frustration, especially the `Trying to stay in Zone 2` / `Heart rate said: 176` structure.
- Safe variation used: `Trying to keep Zone 2 easy?`

## Final Slide Text

1. Trying to keep Zone 2 easy?
2. Your watch says too high.
3. That does not mean panic.
4. Start easier for 10 minutes.
5. Keep the ceiling simple.
6. Back off before it turns hard.
7. Coachi tells you when to slow down.

## Caption

Trying to keep Zone 2 easy?

Most runners lose the easy run before it settles. Start calmer, cap the effort, and let the run stay easy.

Coachi gives live voice guidance to slow down, speed up, or keep going.

## Verification

- Render passed with `npm run slideshow:render -- --manifest content/slideshows/2026-06-28-watch-05-hookfix-trying-to-keep-zone-2-easy/render-manifest.json`.
- Production QA passed with `npm run slideshow:qa -- --production --pack content/slideshows/2026-06-28-watch-05-hookfix-trying-to-keep-zone-2-easy`.
- Upload command sent the corrected pack through the TikTok PHOTO inbox flow with `--skip-instagram --tiktok-account watch`.

## Lesson

For future RunWatchLab repair hooks, start from proven TikTok storage-bank language and make safe variations. Avoid over-AI abstract hooks, especially the rejected watch-hook family around `watch is not a coach`, `watch shows`, `tells you too late`, `chasing watch numbers`, and `catches drift`.
