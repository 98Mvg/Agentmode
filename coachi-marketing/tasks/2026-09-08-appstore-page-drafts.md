# App Store page drafts — 8 September 2026

## Commit and release-status handoff — 9 September

User authorized commit/push of this App Store work and reports 4.0.2 is live. Scope: this package, its original growth research, this task record and only the App Store sections of the shared codebase guide. The app repo is clean and remains untouched. The marketing remote is `98Mvg/Agentmode`, branch `main`; unrelated dirty work is excluded.

`brief.json` records the owner-confirmed release separately from Apple's Norway lookup, which returned 4.0.1 at 05:56:37 UTC. No public build number is inferred. The generated handoff/readiness report carries this release context without changing screenshot approval, upload or experiment state. The added release-boundary test verifies that distinction. Commit and remote-delivery results are reported separately after verification; this note does not claim a push has already succeeded.

Pre-commit verification: package rebuild passed; **26/26 tests passed**, exit 0. No credential patterns were found in the selected text files. Selected source EXIF checks found no GPS metadata; the existing obscured map and Watch diagnostic images were inspected before staging for the public repo. All files are below the GitHub individual-file size limit. Large unrelated guide changes are preserved locally through section-only staging.

## Conversion continuation — after TestFlight 130

Scope: resume the existing local creative package. Preserve the V5 typography, V4 hardware and original flat exports. Do not upload, publish, change ads or generate voices. Shared Workouts access is a separate app task and is excluded from public marketing claims.

Recon: the current entry point is `build.mjs`; `brief.json` owns copy/source selection, `phone-mockup-review.mjs` owns the existing device presentation and `verify.test.mjs` owns package checks. Flow remains source manifest → static review/export → user approval → separately authorized App Store Connect work. No product runtime change.

The three highest-impact remaining issues are (1) setup screens lead instead of proving coaching, (2) a polished draft can be mistaken for captured/release-cleared media, and (3) missing footage and measurement decisions are not an actionable finishing sequence. Current source confirms three voice modes and the Coachi+ realtime benefit; this is source evidence, not a new live-session test.

- [x] Recover the actual latest drafts and distinguish completed typography work from open capture/QA work.
- [x] Refresh Apple product-page, custom-page and test guidance; inspect the existing small-size artwork.
- [x] Extend the existing brief/builder with a coaching-first EN/NO storyboard, explicit evidence requirements and an ordered capture checklist.
- [x] Add a no-spend, not-started experiment/distribution handoff, keeping screenshots, paid traffic and in-app outcomes separate.
- [x] Verify localization/copy limits, source references, publication boundaries and preserved artwork; sync guide and report results.
- [ ] Responsive browser review after Mac unlock. Primary browser initialization failed; the fallback confirmed the Mac is locked. No security bypass or Watch-HTML rehosting attempted.

Maintainability wins: retain one brief as copy authority, generate both language review pages through the current builder, and test publication/source boundaries alongside existing image contracts. No second renderer or upload tool.

### Continuation review

The main proposal now leads with live coaching → realtime AI coaching → three existing voice choices; the Watch variant retains Watch-first messaging. Both languages have seven concise benefits and explicit Coachi+ subscription/usage qualifications. `conversion-en-US.html` and `conversion-no.html` display a keyboard-focusable, manually scrollable story strip with real source references or unmistakable capture placeholders. They are not seven new app screenshots.

Three fixes: make the coaching value visible before setup; calculate capture readiness per locale (the missing Norwegian interval screen no longer says a source exists); and define one treatment against a matched control, avoiding the previous ambiguous “two treatments” wording. Only order changes in that future test. The matched control is not today's live listing and needs approval first. Neither the test nor a paid campaign was configured.

`CONVERSION-HANDOFF.md` specifies the capture order, acceptance checks, source metadata, 24-second native preview proposal and ad-to-page mapping. `conversion-review.json` pins the brief hash, per-locale readiness, copy evidence and unstarted experiment. Product wording was checked read-only against immutable 4.0.2 (130) source, not inferred from export dates or a paid AI session. No new Watch/live-coach capture was obtained.

Verification: the builder exited 0; `node --no-maglev --test content/appstore/2026-09-08-page-drafts/verify.test.mjs` passed **25/25**, exit 0. The seven added tests cover source/readiness, short localized copy, subscription qualifications, story order, placeholder integrity, experiment isolation and preview timing. All 18 flat exports remain byte-identical; a pre/post SHA256 comparison also confirmed all six V5 portraits unchanged. EN/NO 330px/card images were visually inspected. Scoped diff whitespace checks passed. `qa/conversion-continuation.md` records the unchanged 3.7/5 visual baseline and remaining capture gates; a better plan is not proof of higher conversion.

Browser layout remains unverified: preferred initialization failed; supported fallback reported the Mac locked. No plugin/signature changes, lock bypass, rehosting of the blocked Watch HTML, app runtime edit, new voice, deployment, upload, submission or commit.

## Scope and plan

Collect reusable content from ads 1–3, the TikTok CTA15/118 collection and website Target Run video. Generate two local, unpublished custom-product-page packages: right-intensity running and Apple Watch coaching. Preserve all masters. No new voices, provider calls, app changes, metadata upload or campaign action.

- [x] Read workspace instructions, inspect the existing asset/rendering paths and prior growth research.
- [x] Classify sources by provenance, freshness, privacy and Apple screenshot/preview suitability.
- [x] Build benefit-led page copy and screenshot layouts from unchanged genuine app captures.
- [x] Export English and Norwegian draft assets and a local review gallery.
- [x] Verify dimensions, layout, links, content provenance and upload blockers.
- [x] Sync the guide and record the handoff and tests.
- [ ] Replace the provisional Watch-page hero with a current Watch capture. Native build passed; both simulator startups stalled. Approved HTML local URL was browser-policy blocked; no workaround used. User screenshot/export requested.

## Recon / architecture

This is a marketing asset task. Audience: runners who want useful spoken guidance from their workout data. Flow: an ad or useful TikTok → a message-matched App Store page → install → workout. The pages must demonstrate coaching, not just setup controls, and identify paid conversational coaching without promising free unlimited access.

Local source files/manifests → curated source inventory → code-native typographic layouts with genuine UI → PNG screenshot exports and static review gallery → user review → later, separately authorized App Store Connect creation/submission. No new runtime or product architecture.

Stack: existing Node ESM, canvas/Sharp for deterministic asset layout; Python/ffmpeg media tooling; existing website Flask/Jinja and native SwiftUI are read-only product evidence. The live website request path remains main.py → web_routes.py → templates/index_launch.html. There are no new runtime events or background jobs in this task.

## Ten relevant files / entry points

1. `outputs/research/2026-09-08-appstore-growth-opportunities.md` — page strategy and current listing gaps.
2. `inputs/research/2026-09-08-appstore-growth-evidence.md` — source boundaries and observed App Store state.
3. `content/ads/prelaunch/2026-09-08-three-creative-rotation/README.md` — current ad versions.
4. `content/ads/prelaunch/2026-09-08-three-creative-rotation/ASSETS.json` — exact film paths/hashes.
5. `content/ads/reference/2026-09-08-coachi-cta-phone-collection/manifest.json` — source classifications and duplicates.
6. `content/ads/reference/2026-09-08-coachi-cta-phone-collection/START-HERE-01.jpg` — the 15-image shortlist.
7. `content/video/generated/2026-09-07-native-captures/README.md` — original native recordings and known limitations.
8. `scripts/render_slideshow_deck.mjs` — existing code-native image layout precedent; social-specific rules are not appropriate for Store exports.
9. `package.json` — installed canvas/Sharp dependencies; no new package required.
10. App reference `templates/index_launch.html` / `static/site-v2` — website Target Run video lineage.

## Highest risks and safeguards

- User correction: exclude the outdated `fastlane/screenshots` marketing cards and their copied versions, specifically the mountain live-coaching and profile/sensors cards. Existing capture files are not automatically current just because their names or export dates are recent. Check underlying UI before proposing reuse; missing current shots remain capture requirements, not substitutions.
- User approved using Simulator or the latest approved Watch HTML design. Current native `WatchStartWorkoutView.swift` and the August26 `watch-workout-studio.html` are the references. Prefer a fresh current-source native simulator capture; label fixture metrics as demonstration data, not a recorded athlete session. Do not use the July14 generator.
- Cinematic ads and generated phone/watch UI are not native App Store preview proof: separate social-only material, use original screens.
- Historical screens, low-resolution score images and unknown installed builds can misrepresent the release: retain source labels and block upload where recapture is required.
- Personal route maps, account details and permission/setup interruptions can leak into captures: inspect selected frames and hold unsafe media.
- Do not imply phone-free Apple Watch, universal target heart rates or an achieved coaching outcome. Describe only supported behavior.
- CPPs do not independently change app name/subtitle/description. Deliver per-page promotional text and ordered media, leaving default metadata untouched.

## Review

Delivered local draft package at `content/appstore/2026-09-08-page-drafts/`: 18 screenshot exports, 4 ordered sets, EN/NO promotional copy, 16 genuine still sources and the silent website excerpt. All 124 collection entries have a reuse disposition. No old fastlane cards or master-ad edits.

Independent static review passed all dimensions/opacity/checksums and eight package tests. Its findings led to warmup-specific hero wording, larger evidence labels, corrected server command and explicit Watch incompleteness. Native Watch 4.0.2 (127) compiled from clean source at HEAD `ef086f8d`; this does not establish a captured screen, installed physical device or release. Both attempted Watch simulators were shut down; no user simulator erased. The new isolated test simulator and build are retained for reuse/diagnosis.

Desktop review and true 390 × 844 same-origin mobile-frame review inspected page layout. A requested browser viewport override did not actually change the 1280px outer viewport, so mobile proof uses explicit 390px content frames; no claim that the override worked. Full source privacy, current release alignment, Norwegian native UI, active conversational-coach/three-voice shots and higher-resolution result remain publication gates. No upload, submission, deployment, campaign action or new voices.

## Follow-up — premium 3D phone treatment and Watch source search

User requested high-quality 3D phone presentation and reiterated that the latest Watch HTML exists. Apply `marius-website-taste`: upright hardware, subtle horizontal perspective, genuine readable UI, separate copy/media space. Preserve all flat Store exports and approved ad masters. This remains a local design review, not Apple-approved hardware artwork or an upload authorization.

- [x] Verify the existing static review generator and reusable native Blender model before edits.
- [x] Locate the Watch HTML directly and verify it against the approved August 26 design document. Its folder date is August 9, but the file was updated August 26; do not mistake folder date for design freshness.
- [x] Check simulator state and logs without repeated blind boots. Apple system processes fail before Coachi starts; no destructive repair or source change authorized.
- [x] Create versioned premium handset renders from the existing editable model and exact selected screenshot textures.
- [x] Add the 3D treatment to the local review package without replacing flat upload masters.
- [x] Verify source hashes, screen geometry/density, rendered dimensions and 4K image layouts; 12 tests passed.
- [ ] Browser responsive review of the new 3D pages; the Mac is locked. Do not substitute previous flat-page QA.
- [x] Sync the guide and record final evidence and remaining Watch capture boundary.

Recon: `content/appstore/.../brief.json` and `inventory.json` own the selected sources; `build.mjs` owns flat exports/review pages; the existing `pilot/blender/build_phone.py` owns hardware geometry. A scoped render driver can reuse the verified `.blend` and separate unlit UI mesh, with no second handset builder or app runtime. There is no server request/event change: local static HTTP serves generated files, and user links open review assets.

Top risks: (1) flat low-detail presentation — use the existing beveled physical handset with studio lighting; (2) invented or blurred UI — verify original bytes and projected source density, no redraw/reflections over the screen; (3) media clipping or overclaim — fit complete hardware and explicitly separate design renders from native capture/upload clearance. High-ROI improvements are reusing one handset scene, one source manifest and explicit geometry tests instead of editing source UI or approved ad outputs.

Follow-up result: four selected 256-sample Cycles RGBA16 renders and editable scenes in `phone-mockups-v3/`; EN/NO 4K boards and localized review pages linked from the existing index. Exact screenshots C012/C052/C087/target-en remain unchanged. Independent review spotted a pre-existing truncated label in C062, so the final interval selection uses the cleaner four-set source C052; the prior work-duration render is retained, not overwritten. All 18 flat exports pass byte-preservation checks. The source Watch HTML exists and is documented; no Watch capture/render was obtained. No Mac unlock, global simulator repair, provider call, app mutation, campaign change, upload or commit.

## Follow-up — stronger phones and background colour

The user asked for better-looking phones and a background with stronger separation. Existing path: source inventory → verified editable handset → package render driver → existing review builder → local HTML and 4K boards. Stack, audience and conversion flow are unchanged. No app/backend/event change.

- [x] Recheck the current model, source-selection and review entry points, prior outputs and workspace boundaries before editing.
- [x] Identify the highest-impact issues: harsh mixed-colour rim reflections; hardware edges disappearing on near-black; tight, boxy hardware corners and absent grounding shadows.
- [x] Refine surrounding hardware/neutral lighting without altering the original UI mesh, UVs, source pixels or selected screens.
- [x] Render a new V4 and apply a pale mineral-green studio backdrop with soft contact shadows to the localized review and 4K boards.
- [x] Verify source/previous-version preservation, hardware enclosure, screen geometry, file output and visible composition. Independent static review found no blocking visual flaw; responsive browser QA remains pending.
- [x] Sync the guide and record the result and remaining review boundary.

Relevant files: `render-phone-mockups.py` (native scene refinement), `phone-mockup-review.mjs` (composition and HTML), `build.mjs` (existing entry point), `verify.test.mjs` (contracts), `inventory.json` (source authority), `phone-mockups-v3/review-manifest.json` (preserved version), `sources/C012.png` (workout choice), `sources/target-en.png` (distance), `sources/C052.png` (clean interval sets), `sources/C087.png` (Norwegian distance). The canonical ad-scene geometry helper is reused, not duplicated.

Correction lesson: render resolution and passing provenance tests alone do not establish a premium-looking product mockup. Judge silhouette, material reflections, screen/background separation and grounding in the actual final composition. Preserve accepted UI; improve the hardware and presentation around it.

## Follow-up — typography, placement and engagement research

- [x] Use the `design-audit` landing-page preset with the existing `marius-website-taste` direction; keep app screens, source privacy, original flat exports and prior boards unchanged.
- [x] Read Apple product-page/optimization guidance and try official Coachi/Runna/Nike/Strava image research. Record safety/availability limits; do not infer visual/font observations from indexed listing text.
- [x] Apply Sora Bold700 / Manrope Medium500, short two-line benefits, consistent alignment and text above the phones; export a new six-card V5 alongside existing versions.
- [x] Correct the renderer's actual variable-font default-weight mismatch using hash-pinned static faces with retained licensing; no synthetic body weight accepted as Medium.
- [x] Add measured text/phone spacing, genuine font-weight and V4 preservation tests, plus 330px/card static review images. Independently diagnose the scoped Node shutdown issue without weakening assertions or changing app runtime.
- [x] Sync guide and README; preserve the missing live-coaching/Watch hero and Norwegian UI publication gates.
- [ ] Responsive browser verification of the new manual swipe strip; browser initialization/fallback is unavailable. Static previews are not a substitute for this proof.

The architecture still uses one source inventory and one package builder. V5 is a typography/composition version, not a second handset model. `qa/typography-research.md` contains sources, concrete 124px/48px type rules and a bounded static scorecard. No competitor typeface identification, conversion-uplift claim, new voice, paid generation, App Store upload, app edit, deployment or commit. Static font files were obtained from official Google Fonts, pinned and cached locally.

Correction lesson: requesting a font weight is not proof that the renderer used it. Inspect registered face metadata and small-size output; exact source provenance does not prevent a variable-font default-weight mismatch.

Final verification: `node --no-maglev --test content/appstore/2026-09-08-page-drafts/verify.test.mjs` completed with **18 passed, 0 failed, exit0**. Build completed successfully; scoped `git diff --check` passed. Main and independent reviews inspected EN/NO boards and 330px-per-card artwork; no new clipping or typography flaw was found. The shortest measured support-to-phone gap is 89px. The local review URL returned HTTP200, which is not browser layout or publication proof. The original hung test processes were specifically identified and terminated; no other task session or app process was changed.
