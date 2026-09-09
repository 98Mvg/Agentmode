# Located Apple Watch HTML design

The source exists. No new attachment is needed to locate it.

`/Users/mariusgaarder/.codex/visualizations/2026/08/09/019fe5aa-14e1-7251-9dd2-0eb435f72aae/watch-workout-studio.html`

- Verified size: 74,322 bytes.
- SHA256: `e2d33b8cd809ae05e0fdebc03fc1af59de38405ff64d02573d38c1c12f11ae3f`.
- Last modified: 26 August 2026, 23:17:52 local time. The August 9 parent directory is not its final design date.
- Explicit visual-source reference in `docs/plans/2026-08-26-approved-apple-watch-workout-ui.md` in the Coachi app worktree.
- Includes Apple Watch 40/45mm, English/Norwegian, Easy/Timed/Intervals/Target and warmup/main/recovery/paused states.
- Approved main-workout visual hierarchy: BPM-first for Easy/Timed; workout-specific countdown/distance for Intervals/Target; supporting metrics and persistent controls.
- This is an approved visual reference, not evidence that every August interaction rule still matches 4.0.2. Current native source remains authoritative for behavior.

## Capture boundary

The local HTML URL was previously blocked by browser security. It has not been rehosted, converted through another browser, or reconstructed to circumvent that block.

The current native Watch app compiles as `com.coachi.app.watchapp` version 4.0.2 (127). Read-only follow-up found Apple simulator processes failing before Coachi opens:

- `localspeechrecognition`: `DYLD_ROOT_PATH not set for simulator program`.
- `dasd`: unrecognized selector in `_DASScheduler activityCanceledWithReason:expirationReason:`.

These logs implicate the simulator environment but do not establish a complete root cause. No reset, erase, global service change or repeated blind boot was performed. All simulators remain shut down. The source design is found; a rendered/native Watch screenshot is still not obtained.
