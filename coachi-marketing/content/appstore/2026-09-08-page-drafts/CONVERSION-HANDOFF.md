# Coachi conversion finishing plan

Local review only. No new screen capture, voice generation, upload, submission, experiment or paid traffic change. The V5 phones/background/type and all original exports remain unchanged.

## Release context — 2026-09-09

Owner reports 4.0.2 is live. The public Norway lookup still returned 4.0.1 at the recorded check; release propagation and the exact public build are not independently confirmed here. This release update does not publish or clear the new creative package. [Recorded Apple lookup](https://itunes.apple.com/lookup?id=6760587172&country=no), checked 2026-09-09T05:56:37.178Z. The immutable build130 source remains the copy-verification reference; it is not proof of which binary is publicly distributed.

## Capture these first

1. **Your run. A coach with you.** — Record 8–10 seconds of the main workout phase with a stable connected heart-rate signal and a genuine coach cue. Keep the actual workout values and cue together. Avoid the map and personal location; do not substitute stationary warmup or add invented subtitles.

   Accept when: Readable current iPhone UI, main workout phase, stable signal, actual cue, known build and no private location. A live run must be recorded by the runner; fixture data must be clearly labelled and cannot prove connectivity.

2. **Talk to your coach. Find your energy.** — Capture an active Talk to Coach conversation, with permission/startup dialogs finished. Use only an existing approved recording or a user-run session; this marketing task does not start a paid AI session. Keep a visible Coachi+ qualification outside the app UI.

   Accept when: Actual active conversation, not a loading or preview-exhausted screen. Verify the demonstrated access and current limits; do not imply unlimited or permanently free conversation.

3. **3 unique voices. Find your coach.** — Open Your Coach and capture all three existing voice choices on the current build. Capture labels and selected state unchanged. No voice generation, new voice names or fabricated waveform transcript.

   Accept when: All three existing choices visible and matched to current app labels. One default voice is free; the copy must describe unlocking the full choice, not claim every voice requires payment.

4. **Your heart rate. Useful guidance.** — Capture the current Apple Watch main-workout screen and matching iPhone state. The located approved Watch HTML is a design reference only; it is not a captured run. Do not rehost it to bypass the browser block.

   Accept when: Current native Watch screen, identified build/device and accurate companion-phone wording. Simulator metrics labelled demo; paired connectivity requires a real-device check.

5. **Finish proud. Learn for next time.** — Capture the current post-workout summary and opened written feedback at native resolution. The existing score-100 image is a low-resolution reference, not proof of a typical outcome or of the latest results layout. Avoid precise route endpoints.

   Accept when: Current readable summary plus actual written feedback; no invented learning claim, hidden personal data or guaranteed score. Fully Norwegian UI is needed for the Norwegian set.

6. **Set a goal. Go for it.** — Reuse the selected native 5 km picker after verifying it against the release. Both English and Norwegian source candidates already exist. Keep the source pixels and selected distance unchanged.

   Accept when: Known current build, correct locale, complete readable controls and original source hash. A target picker is setup evidence, not proof of completing that distance.

7. **Run. Recover. Repeat.** — Use the clean C052 four-set screen after release verification. Capture the equivalent Norwegian screen. Do not reuse C062's truncated label or C072's incorrect total-time footer.

   Accept when: Clean sets screen, complete labels and known current build. No English native UI in the final Norwegian set.

Record for every selected capture: app_version, build_number, device, os_version, app_language, captured_at, source_sha256, real_session_or_labelled_demo, usage_rights_checked, privacy_checked. Keep source originals unchanged; do not treat this source-code verification as evidence of the installed capture build.

The first three proposed main-page images are the live coach, realtime AI coaching and the three voice choices. The Watch-specific page still leads with the Watch benefit. Missing imagery stays visibly marked, not substituted with generated UI.

## English and Norwegian screenshot copy

### live-guidance

EN: Your run. A coach with you. Live voice guidance to help you judge your effort.

NO: Løpeturen din. Med coach underveis. Stemmeveiledning som hjelper deg å styre innsatsen.

### watch-guidance

EN: Your heart rate. Useful guidance. Use a compatible watch with Coachi on your iPhone.

NO: Pulsen din. Veiledning underveis. Bruk en kompatibel klokke sammen med Coachi på iPhone.

### realtime

EN: Talk to your coach. Find your energy. Realtime AI coaching before, during and after your run. Coachi+ subscription required. Usage limits apply.

NO: Snakk med coachen. Få ny energi. AI-coaching i sanntid før, under og etter løpeturen. Krever Coachi+-abonnement. Bruksgrenser gjelder.

### voices

EN: 3 unique voices. Find your coach. Calm, driven or encouraging. Choose your coaching style. All three available with Coachi+. Subscription required.

NO: 3 unike stemmer. Finn din coach. Rolig, energisk eller oppmuntrende. Velg stilen din. Alle tre er tilgjengelige med Coachi+. Abonnement kreves.

### learn

EN: Finish proud. Learn for next time. Review your workout and read your coach's feedback.

NO: Fullført. Mer å ta med videre. Se tilbake på økten og les coachens tilbakemelding.

### target

EN: Set a goal. Go for it. Choose your distance with Target Run.

NO: Sett et mål. Gå for det. Velg distansen din med Target Run.

### intervals

EN: Run. Recover. Repeat. Choose the sets that make up your interval session.

NO: Løp. Hent deg inn. Gjenta. Velg antall drag i intervalløkten din.

## Native preview proposal — 24 seconds, not rendered

- 0–5s: live-guidance. Lead with a genuine coaching moment. Any caption must match the actual cue.
- 5–8s: target. Native distance selection. Existing 2.6-second excerpt is an ingredient; do not stretch it into the whole preview.
- 8–15s: realtime. Actual conversation with visible Coachi+ disclosure. Existing approved audio only.
- 15–18s: voices. Show the real three-voice selector; no new audio generation.
- 18–24s: learn. End on actual workout feedback. Avoid maps containing private locations.

Editorial timing proposal, not a rendered video. Use native iPhone footage, keep it understandable muted and leave cinematic ad scenes outside the App Store preview.

## Test only after capture and approval

Proposed experiment: 1 treatment, 50% of traffic to the treatment; original control receives the rest. Not configured or started.

Proposed matched control: target → intervals → live-guidance → realtime → voices → watch-guidance → learn.

Proposed treatment: live-guidance → realtime → voices → watch-guidance → learn → target → intervals.

After media clearance, compare one coaching-first treatment with a setup-first control using the SAME seven approved screenshots. Only their order changes: keep font, palette, copy, icon, metadata, subscription offer and all image bytes fixed. The proposed control is not today's live listing; the order-only experiment requires this matched control to be approved and established first. If instead testing the entire new design against today's listing, report a package-level result, not an isolated ordering or font effect.

Use Apple's product-page-optimization conversion rate, impressions and confidence for the randomized comparison. Keep App Store downloads, PostHog workout activation, trials and verified paid subscriptions as separate measures; do not equate installs or sandbox Premium with revenue.

Record the control and traffic allocation before launch. Use Apple's duration estimate and confidence readout; if volume cannot support a meaningful result within the allowed test duration, report inconclusive. No calendar-only winner and no promised uplift.

Apple recommends focused first images and one main benefit per later screenshot. [Product-page guidance](https://developer.apple.com/app-store/product-page/).

Apple's test tool randomizes treatment exposure and reports conversion and confidence. It supports a duration estimate and a maximum 90-day test; do not declare a winner from a few installs. [Product-page optimization](https://developer.apple.com/app-store/product-page-optimization/).

Custom pages have their own reviewed media/promotional text and returned URLs. Their source-specific results are not a randomized default-page test. [Custom pages](https://developer.apple.com/app-store/custom-product-pages/).

## Distribution mapping — no campaign changes

- Summer Dream / general running demos → main-listing: Keep the promise about useful coaching during the run. Reuse native ingredients, not cinematic composites as screenshots.
- Recovery / easy-run content → guided-runs: Match the page to effort guidance; do not imply captured live-walking proof from a setup-only clip.
- Watch-specific runner content → watch-coaching: Hold until authentic current Watch proof exists. Use only the unique URL returned by an approved custom page.
- Stadium / interval content → main-listing: Use the interval benefit in follow-up media. The current Watch page is not an interval-ad destination without Watch-specific messaging.

Use existing campaign-link tooling after a real approved page URL exists. No guessed page IDs, new campaigns, increased budgets or outreach. Reuse genuine ads and creator content only with appropriate rights and disclosure.

## Final gates

- [ ] Verify all source screens against the release being promoted; export dates alone do not establish the installed build.
- [ ] Replace missing and low-resolution media. Verify native language, source rights and privacy for every selected card.
- [ ] Check full size and App Store search-thumbnail size; verify browser layout after Mac unlock.
- [ ] Approve the final creative and Apple hardware treatment before any upload. Keep Shared Workouts out while gated.
- [ ] Obtain separate authorization for upload, submission and experiment activation, then read back each external state.

Copy evidence: Coachi 4.0.2 (130), immutable tag testflight-4.0.2-130 / 7ca4c8ddb17a27e724078dd2ee33e345ca1689f4. CoachPersonality.swift: CoachVoiceMode has three existing styles, with Personal Trainer free and the other two Premium-only. LiveCoachConversationView.swift: LiveCoachPreviewCopy states realtime AI, three voices and usage limits. Models.swift: LiveVoiceSessionMode supports coach_preview, workout and post_workout. Source verification only; no live session or device capture initiated.

Current browser boundary: browser initialization failed; the fallback reported the Mac locked. Responsive review and the blocked Watch design capture remain unresolved. No workaround attempted.
