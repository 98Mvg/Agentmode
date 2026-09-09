# Coachi App Store drafts

Local review package, not uploaded or submitted. Default App Store metadata, ad campaigns and original media are unchanged. No new voices or paid generation.

Release update, 9 September 2026: the owner confirms **4.0.2 is live**. Apple's Norway public lookup still returned 4.0.1 at 05:56 UTC; the exact public build and propagation are not independently verified here. The new artwork remains a separate unpublished draft. `brief.json` and `conversion-review.json` retain both the owner report and the dated lookup rather than replacing one with the other.

Commit verification: **26 tests passed** after adding the release-status boundary check. The selected sources, generated exports and editable handset scenes are included in this package. Full rebuilds still require the original collection/native recordings and canonical Blender/font inputs at the documented local paths; the commit does not duplicate unrelated ad masters.

**Watch source is found; capture is incomplete:** the approved HTML is on disk, last modified 26 August. No new attachment is needed to locate it. Current 4.0.2 (127) native build passed, but simulator system processes fail before Coachi starts. Opening the HTML was blocked by browser security, and no workaround was used. See `qa/watch-design-source.md` and `qa/watch-capture-status.md`; no old artwork is substituted.

## Open first

- `conversion-en-US.html` / `conversion-no.html` — latest coaching-first visual storyboard, with explicit missing-capture placeholders and source references, not new screenshot exports.
- `CONVERSION-HANDOFF.md` — ordered capture checklist, English/Norwegian copy, native-preview outline and proposed test/distribution plan.
- `conversion-review.json` — brief checksum, per-locale source readiness and unstarted experiment; no upload clearance.
- `index.html` — both page concepts.
- `phone-mockups-en.html` / `phone-mockups-no.html` — new premium 3D device treatment, separate from flat Store exports.
- `guided-runs-en-US.html` / `guided-runs-no.html` — right-intensity/everyday-running page.
- `watch-coaching-en-US.html` / `watch-coaching-no.html` — watch-connected coaching page.
- `assets.html` — genuine source library and video reuse notes.
- `inventory.json` — disposition for all124 existing CTA collection entries, not just the initial15-image contact sheet.
- `exports.json` — ordered screenshot sets, source mapping, crop coordinates and SHA256 checksums.

English and Norwegian promotional copy are included. Most supplied iPhone UI is English; these are not yet fully Norwegian native screenshot sets. The 18 flat screenshot layouts preserve source UI, without invented controls, telemetry or simulated device bezels. The separately requested 3D mockup review adds unbranded hardware around exact full-screen source textures; it is not upload-cleared Apple artwork.

## Premium 3D follow-up

`marius-website-taste` informed upright devices, subtle position-aware yaw, readable authentic screens and fitting to the visible handset rather than its transparent canvas. Existing editable Blender hardware was reused; no generative-image or voice API was needed.

- `phone-mockups-v4/` — four selected 1320 × 2400, 16-bit RGBA Cycles renders and editable packed `.blend` scenes; 256 samples, rounder graphite hardware, softer neutral reflections and unchanged UI mesh/UV/mask. Every screen vertex remains enclosed by the refined hardware. V3 is preserved. The interval source remains `intervals-sets-en` / C052; native recording indicators are untouched.
- `phone-mockups-v5/` — current typography presentation: six new opaque 1320 × 2868 portrait designs, EN/NO 3840 × 2560 boards and `thumbnail-check-en.png` / `thumbnail-check-no.png` at 330px per card. V5 reuses the exact V4 handset renders. Norwegian Target Run uses a real Norwegian screen; the side-screen UI remains English. V3 and V4 boards are retained.
- `phone-mockups.json` — full source hashes, scene provenance, visible bounds and measured screen sampling density. Left/right use −8°/+8° yaw, centre is straight-on, no camera pitch/roll. Maximum output/source sampling stays below 1; no synthetic sharpening or UI redraw.
- `render-phone-mockups.py` — versioned driver of the existing handset scene, not a second handset builder. Refuses to overwrite prior outputs. The isolated first proof is retained in `phone-mockups-v2/`.
- `phone-mockup-review.mjs` — invoked by the existing package builder to create the localized review and 4K boards. Transparent padding is excluded from CSS fitting; full physical handset bounds retain safety padding.

The latest `design-audit` pass adds shorter two-line Sora Bold700 headlines above the phones, Manrope Medium500 supporting text, common alignment, a mineral-green studio palette and a swipeable mobile review strip. The actual static font weights are verified rather than trusting requested CSS/canvas weights; official Google Fonts files are cached locally with SHA256 pins and retained licenses. `qa/typography-research.md` separates Apple-backed recommendations from competitor images that could not be inspected. These are setup-benefit cards, not final proof of realtime coaching.

All 25 package tests pass, including byte-identical preservation of the 18 original flat exports, V3/V4 handset scenes, source UI, font weights, text/phone safe bounds, palette contrast and local links. The earlier typography pass included independent static review; this continuation rechecked EN/NO 330px/card images and confirmed all six V5 portrait hashes unchanged. This is static QA, not responsive-browser proof. Browser QA remains pending: preferred control could not initialize, and the supported fallback reported the Mac locked. Previous flat-page checks do not cover the new page. Nothing uploaded, deployed or committed.

## Coaching-first continuation

The proposed main-page first three benefits are live coaching, realtime AI coaching and the choice of three existing voices. Watch guidance, workout feedback, Target Run and intervals follow. The two audience-specific sequences still match guided-run and Watch messages. `brief.json` owns all fourteen localized benefits and the current copy-evidence reference, checked against immutable TestFlight 4.0.2 (130) source. This does not establish the installed version of historical captures or physical-device behavior.

The new visual story strip uses the existing Sora/Manrope and mineral-green direction. No fake app screens fill its gaps. English has four missing captures, one result recapture and two sources to verify; Norwegian has five missing captures, one result recapture and one source to verify. The Norwegian interval slot correctly remains missing, not “source exists.” Both Coachi+ benefit cards show subscription terms; realtime also states usage limits. Default-voice access is not presented as wholly paid.

The finishing handoff includes a 24-second native-video outline (not a rendered video), exact evidence to record for each capture, and message-matched destinations for the existing ads. The proposed experiment uses one treatment and a matched setup-first control with identical screenshot bytes, changing only their order. Its control is not today's live listing. No campaign URL is fabricated, no spend is authorized, and no test has started. `qa/conversion-continuation.md` contains the bounded audit and source links.

## Reuse decisions

| Requested source | Reuse | Exclude from App Store preview |
| --- | --- | --- |
| Ad1 / Summer DreamV12 | Genuine current warmup UI, C097 | Cinematic scenes, held-phone composites, reconstructed Apple Watch UI, source location map/music/Control Center |
| Ad2 / StadiumV7 | Genuine Hard intensity, sets and work-duration screens | Generated hands/track scenes, illustrative watch telemetry, stale Rest total-time footer |
| Ad3 / RecoveryV13 | Genuine Free Walking and Recovery intensity screens | Generated walking scenes as native footage; claims of a captured active walk |
| TikTok CTA15 / collection | Original genuine UI behind the mockups | Historical/generated UI, 3D handset artwork and duplicate lower-resolution versions |
| Website Target Run | Native886×1920 original, clean0.2–2.8s excerpt; 5km still | Surrounding generated webpage handset and later80km test |
| User result | Genuine score100 /144BPM /1h10m screenshot | Treating this as a typical result, or as identical to the Garmin146BPM reading |

The user explicitly rejected the old `fastlane/screenshots` cards and their copies. They are not used or copied here. Selected recent source files retain their original hashes. Full raw videos are linked in the brief rather than duplicated or served locally with potentially private frames/audio.

## Why the full ads are not preview uploads

Apple previews must show the app using screen captures, not filmed people/device interaction. Original app footage can be reused with captions; incidental source music is excluded because its rights have not been cleared. The website excerpt is only2.6seconds and cannot be submitted alone. Do not pad it to15seconds and call that a complete coaching demo. [Apple preview guidance](https://developer.apple.com/app-store/app-previews/).

For a strong final15–30-second preview, capture a real sequence: choose workout → current mid-run spoken cue/response → workout result. Show paid access accurately if conversational coaching is demonstrated. Existing in-app coaching audio can be reused only after checking its exact cue, timing and rights; no new voice generation is needed.

## Apple export and metadata constraints

- iPhone6.9-inch screenshot exports:1320×2868 opaquePNG. Apple accepts1–10 screenshots and forbids alpha channels. [Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/).
- Modern iPhone preview:886×1920 portrait,15–30s,≤30fps,≤500MB. Use H264 progressiveMP4 and compliant audio;1080×1920 is not the modern6.9-inch preset. [Preview specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/app-preview-specifications/).
- Each custom page has its own localized screenshots, previews and promotional text. No page-specific invented app name, subtitle or description. Promotional text is capped at170characters. Current CPPs also support keyword assignment; the brief contains only research candidates, not assigned keywords or verified demand. [Custom pages](https://developer.apple.com/app-store/custom-product-pages/), [product-page metadata](https://developer.apple.com/app-store/product-page/).
- CPP review can happen independently of a new binary, but must complete before public visibility. A local HTML file is not an App Store Connect page and has no liveCPP URL. [CPP setup](https://developer.apple.com/help/app-store-connect/create-custom-product-pages/configure-multiple-product-page-versions/).
- Graphic layouts use real app UI rectangles, not newly simulated Apple hardware. App screenshots must primarily show the product in use. [Accurate metadata](https://developer.apple.com/app-store/review/guidelines/#accurate-metadata), [marketing identity guidance](https://developer.apple.com/app-store/marketing/guidelines/).

## Capture and approval gates

1. Verify iPhone source screens against the exact public/release-candidate build. Export dates alone do not establish installed versions.
2. Replace the warmup-only iPhone hero with genuine mid-run coaching and a clean stable heart-rate reading; avoid private location detail.
3. Capture active Talk to Coach and the three-voice choice, showing Coachi+ access accurately. The promotional copy already makes the subscription explicit.
4. Obtain a higher-resolution result capture; current590×1280 source is genuine but soft when enlarged.
5. Capture Norwegian native UI for fully localizedNO screenshots.
6. Review the Watch simulator evidence and keep all fixture values labelled demo data; simulator layout proof does not establish physical watch connectivity or a real workout.
7. User visual approval, then separately authorized App Store Connect upload/submission and readback. Do not submit these drafts automatically.

Shared Workouts are not advertised. No standalone/phone-free Watch claim, universal heart-rate target, guaranteed result, fabricated review or conversion-uplift claim is included.

## Rebuild and verify

From the canonical marketing workspace:

```sh
node --no-maglev content/appstore/2026-09-08-page-drafts/build.mjs
node --no-maglev --test content/appstore/2026-09-08-page-drafts/verify.test.mjs
python3 -m http.server 8768 --bind 127.0.0.1 --directory content/appstore/2026-09-08-page-drafts
```

The package-local builder uses the existing Node/canvas/Sharp stack to lay out unchanged UI and typography. It is not a new campaign or app runtime. No Watch capture has been added yet; the successful current-source Watch build is a separate proof layer. No production tests or deployments are implied by asset checks.

The scoped `--no-maglev` flag avoids an observed Node23.4.0/V8 shutdown deadlock. Independent reruns exited normally with all assertions active; an intentional failure still returned exit1. No app/runtime setting or global Node installation was changed. Font downloads occur only if the pinned local static files are missing; a normal rebuild uses the local copies.

The 3D renders are already saved. To produce a new revision, run `render-phone-mockups.py` in the installed Blender with the desired names (`workouts-en target-en intervals-sets-en target-no`), an explicit new `--output` directory, and `--samples 256`; then select that version in `phone-mockup-review.mjs`. Use `--inventory` to reuse the exact frozen source inventory. Do not overwrite the existing version or mutate the canonical ad scene. Preserve the input inventory and pre-revision flat-export manifest for verification.

## Review status

18 opaque 1320 × 2868 screenshot drafts across two page concepts and two copy languages. All 124 collection entries are classified; 16 genuine source images and the silent website excerpt are collected. Main visual inspection and independent static review informed larger qualifications and warmup-specific hero copy. Current Watch and conversational-coach visual proof, Norwegian native iPhone screens and higher-resolution result remain upload gates.
