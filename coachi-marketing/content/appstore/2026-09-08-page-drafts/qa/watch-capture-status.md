# Watch capture status — 8 September 2026

## Current source build passed

- Source worktree: `/Users/mariusgaarder/.codex/worktrees/21c2/treningscoach`.
- HEAD: `ef086f8d41de0297f958657d0f25c2fa8483ce9b`.
- Watch source directory and project file were clean before/after the build.
- `WatchStartWorkoutView.swift` SHA256: `7296ae1d5dea1e9fd71308e4ff5597e9ea824ed4fe454c2dc57d62fbf0f0e5df`.
- Built app reports version **4.0.2 (127)** and `WATCH_TALK_TO_COACH_ENABLED=YES`.
- Native build command completed with exit0:

```sh
xcodebuild -quiet -project TreningsCoach/TreningsCoach.xcodeproj -scheme TreningsCoachWatchApp -configuration Debug -destination 'platform=watchOS Simulator,id=04C28449-927C-450E-9F47-A80E19E3EDA4' -derivedDataPath /private/tmp/coachi-appstore-watch-20260908-build CODE_SIGNING_ALLOWED=NO build
```

Built product: `/private/tmp/coachi-appstore-watch-20260908-build/Build/Products/Debug-watchsimulator/TreningsCoachWatch.app`. This is an unsigned local Debug build, not a TestFlight upload or installed-device release.

## Capture blocked

The existing Ultra3 simulator remained at the Apple boot screen, waiting on the system app. A fresh isolated Series11 simulator also remained at its startup progress screen. The pending first install/launch ended with invalid-device-state / Mach-server-died errors. No Coachi screen was captured; boot diagnostics are QA evidence only and are not in the asset gallery or screenshot exports.

Existing simulator ID `04C28449-927C-450E-9F47-A80E19E3EDA4` was restored to shutdown. New test-only simulator `E602E80D-0405-474D-93A9-D4F9FB64C2B3` / `Coachi Store Capture 2026-09-08` was also shut down. No existing simulator was erased or reset. The new simulator and build output are retained for diagnosis/reuse, not silently removed.

The user also allowed the latest HTML design. The approved reference is:

`/Users/mariusgaarder/.codex/visualizations/2026/08/09/019fe5aa-14e1-7251-9dd2-0eb435f72aae/watch-workout-studio.html`

It is pinned by `docs/plans/2026-08-26-approved-apple-watch-workout-ui.md`. The browser refused its local file URL under its security policy. No HTTP proxy, alternate browser, headless execution or other workaround was used to open that blocked design. There is no existing rendered Watch screenshot beside the HTML; only its decorative background.

## Follow-up search and simulator diagnosis

The user correctly reiterated that the HTML exists. It was directly located and checked against the approval document, including its August 26 modification time and current hash. See `watch-design-source.md`; a new attachment is not needed to locate the source. Finding the file and rendering it remain separate outcomes.

Read-only diagnostics found Apple `localspeechrecognition` failing with `DYLD_ROOT_PATH not set for simulator program`, and repeated `dasd` unrecognized-selector aborts inside `_DASScheduler activityCanceledWithReason:expirationReason:`. These failures happen before Coachi launches; a complete root cause or safe one-device recovery has not been established. No further boot, reset, erase or global service change was made. All simulators remain shut down.

## Remaining capture dependency

A screenshot/export supplied by Marius of the latest Watch design (Timed → Main, English/Norwegian), or a functioning Watch simulator, will unblock the hero replacement. Do not use the old July generator, rejected fastlane cards, or the cinematic ad's reconstructed Apple Watch face.

If Simulator becomes available, launch the existing current native demo harness with `-demo-watch-screenshots -watch_screenshot_demo_state active -AppleLanguages '(en)' -AppleLocale en_US`, and use `'(nb)'` / `nb_NO` for Norwegian. Fixture142BPM/27:14/4.52km/5:42 values must be disclosed as demo data. No physical connectivity or real workout is established by these screenshots.
