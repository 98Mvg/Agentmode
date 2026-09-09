# Conversion continuation — 8 September 2026

Scope: existing local App Store package, after TestFlight 4.0.2 (130). No app changes, new screenshots from a device, generated voices, paid AI session, App Store upload, campaign activation or spending. `design-audit` informed benefit order and evidence requirements; `apple-design` informed readable controls, explicit state feedback and preservation of genuine UI. Prior V4/V5 art is preserved.

## Assessment

The remaining bottleneck is product proof, not more decorative phone work. The present six phone cards explain setup well but do not show the defining live-coach experience. New EN/NO storyboards put that benefit first and visibly distinguish missing captures from existing reference material. They are planning pages, not completed Store screenshot sets.

Same landing-page preset, adapted to screenshot marketing, as the prior typography audit. The existing visual score remains **3.7/5** (22/30); no artwork or measured conversion improvement is claimed from changing a plan.

| Dimension | Before | Now | Evidence / next action |
| --- | ---: | ---: | --- |
| Benefit clarity | 4 | 4 | Setup artwork unchanged; stronger coaching-first copy awaits real media. |
| Visual hierarchy | 4 | 4 | Retain short Sora headlines above the handset. |
| Layout and separation | 4 | 4 | Existing measured text-to-phone clearance preserved. |
| Typography and readability | 4 | 4 | EN/NO 330px/card images inspected; original font/bounds tests pass. |
| Trust and source integrity | 4 | 4 | Hash-preserved genuine UI; new per-locale capture states prevent misleading readiness. |
| Conversion readiness | 2 | 2 | Live coaching, conversation, voice choice, Watch and result recaptures still needed. |

## Three addressed issues

1. **High — coaching value arrives too late.** `brief.json` now leads the main proposal with live guidance → realtime AI → three existing voice choices. Both paid-benefit cards state Coachi+ subscription terms, and realtime states usage limits. No unlimited-use implication. Watch-specific traffic retains a Watch-first sequence.
2. **High — a reference is not release proof.** `build.mjs` now generates per-locale readiness. In particular, Norwegian intervals is missing, while English has C052 to verify. Missing slots show explicit non-app placeholders; the low-resolution result remains marked for recapture. Source-code verification against tag130 does not clear historical captures.
3. **Medium — ambiguous experiment design.** The plan now specifies one treatment and a matched control containing the same seven image files, with only order changing. That proposed control is not today's listing. Testing a whole new package instead must be reported as a package-level result.

Maintainability: keep copy, capture requirements, sequence and test assumptions in the existing brief; generate both locales and the handoff through the existing builder. Add source/publication contracts to the existing tests, not a second rendering or uploading tool.

## Current primary-source check

Apple recommends making the initial images communicate the app's essence and later images focus on individual benefits. The coaching-first sequence is our application of that guidance, not a demonstrated uplift. [Product-page guidance](https://developer.apple.com/app-store/product-page/).

Apple's published Simply Piano example is a useful counterexample: its original screenshot-only page beat the proposed video treatment. Peak Brain Training tested icons, then considered in-app engagement and purchases. These are reasons to test a focused hypothesis and separate installs from paid outcomes, not predictions for Coachi. [Apple's experiments and developer cases](https://developer.apple.com/app-store/product-page-optimization/).

Apple's CBS Sports and State of Survival examples emphasize matching the landing page to the visitor's interest or creative. The handoff maps existing general, Recovery, Watch and interval content accordingly; no traffic or page has been activated. [Custom-page guidance and cases](https://developer.apple.com/app-store/custom-product-pages/).

## Verification and open gates

- Builder and syntax check: exit 0.
- `node --no-maglev --test content/appstore/2026-09-08-page-drafts/verify.test.mjs`: **25 passed, 0 failed**, exit 0.
- Tests preserve all 18 original flat PNGs and prior handset scenes; a separate pre/post check verified all six V5 portrait SHA256 values unchanged.
- Contract checks cover 14 localized benefits, source checksums, paid qualifications, card ordering, placeholder integrity, per-locale states, continuous 24-second preview timing and an unstarted experiment.
- EN/NO existing 330px/card artwork was viewed locally. No claim of fresh browser rendering: preferred browser initialization failed, and the supported fallback reported the Mac locked. No security or lock bypass was attempted.
- Native capture, privacy/rights/build/locale verification, final thumbnail and responsive QA, creative approval and separately authorized Store actions remain open. A storyboard and passing asset tests do not prove higher conversion, live connectivity or Apple approval.
