# Typography and App Store image hierarchy — 8 September 2026

## Outcome

The V5 local review uses Sora Bold 700 headlines and Manrope Medium 500 supporting text, shorter benefit-led copy above the phone, consistent left alignment and a clear three-image sequence. Six new opaque 1320 × 2868 portrait designs sit beside the untouched original 18 flat exports. Refined V4 graphite phones and mineral-green backgrounds are retained. No UI was redrawn and nothing was uploaded.

## Verified research and its limits

- Apple says the first one to three screenshots may appear in search results when no preview is present. They should communicate the app's essence; later images should each focus on a main benefit. This supports self-contained, quickly readable images, not a large slogan spread across several cards. [Apple product-page guidance](https://developer.apple.com/app-store/product-page/).
- A real counterexample to visual gimmicks: Apple reports that Simply Piano's original page without a preview video outperformed its video treatment, with a 3% conversion increase in that test. This is not evidence that removing Coachi's video, using this font or adopting green will increase conversion. [Apple product-page optimization case study](https://developer.apple.com/app-store/product-page-optimization/).
- Sora's authors describe a large x-height and generous counters for screen legibility. It is an open-source typeface with explicit Bold 700. This is a practical reason to use Coachi's existing family, not a claim that another running app uses it. [Sora primary repository](https://github.com/sora-xor/sora-font).
- Current Apple lookup returned Coachi 4.0.1 and six screenshot URLs. Remote screenshot inspection was safety-blocked, so no current-listing font or visual measurements are claimed. Existing rejected fastlane cards remain excluded.
- Official [Runna](https://apps.apple.com/us/app/runna-running-plans-coach/id1594204443) and [Nike Run Club](https://apps.apple.com/us/app/nike-run-club-running-coach/id387771637) listings were found, but their iPhone galleries were safety-blocked. [Strava's main listing](https://apps.apple.com/us/app/strava-run-bike-walk/id426826309) opened, but exposed placeholder images; browser initialization/fallback was unavailable. No competitor font identities, sizing measurements, visual sequences or causal conversion claims are inferred from listing text. No blocked-image workaround or remote-media download occurred.

## Concrete design rules applied

| Element | 1320 px export | At 330 px display |
| --- | ---: | ---: |
| Headline | 124 px, Bold 700, two lines | 31 px |
| Supporting text | 48 px, Medium 500, two lines | 12 px |
| Left text inset | 96–100 px | 24–25 px |
| Headline baseline interval | 138 px | 34.5 px |

The headline leads with one understandable idea: workout choice, a distance goal or interval structure. Deep green establishes the idea; burnt orange emphasizes the second line. This uses contrast and rhythm rather than fake awards, invented ratings, artificial urgency or download buttons baked into a screenshot. Each image works independently; the mobile review exposes a sliver of the next card through a manually swipeable strip without autoplay. That responsive interaction is implemented but not browser-verified.

Text stays above the full handset with at least 64 px measured clearance. Source UI is not covered by marketing badges. Complete screenshots, original UVs and hardware bounds are preserved. `thumbnail-check-en.png` and `thumbnail-check-no.png` show the actual exported artwork at 330 px per card; these are static size checks, not browser screenshots.

The initial font export revealed an actual weight mismatch: the local variable WOFF2 files registered as Sora 400 and Manrope 200 in the canvas renderer. V5 now pins official Google Fonts static Sora 700 and Manrope 500 files by SHA-256; renderer registration verifies the weights. Font licenses remain in `fonts/LICENSES.txt`. No synthetic extra-light body text is accepted as Medium.

## Static design audit

Preset: `landing-page`, adapted to screenshot marketing. Overall: **3.7/5 — stronger creative, not a launch-ready acquisition package.** Scores are a qualitative static assessment, not conversion data. No previous numerical audit was available for a defensible score delta.

| Area | Score | Priority |
| --- | ---: | --- |
| Benefit clarity | 4/5 | Medium |
| Visual hierarchy | 4/5 | Low |
| Layout and separation | 4/5 | Low |
| Typography/readability | 4/5 | Low |
| Trust and source integrity | 4/5 | Medium |
| Conversion readiness | 2/5 | High |

The remaining conversion risk is the image story, not the font: these three images demonstrate setup, not realtime AI coaching. A main-listing lead should show genuine during-run coaching; subsequent proof should demonstrate the current Watch experience and Coachi+ conversation/three-voice choice. Those captures remain missing and must not be simulated. Norwegian side-screen UI is still English, explicitly disclosed in the review.

After authentic feature proof and visual approval, compare one new creative treatment against the existing listing using Apple's product-page optimization. Measure conversion under a consistent traffic mix; do not change font, copy, screenshot sequence and paid traffic simultaneously and attribute the outcome to one element. No test or upload has been started.

## Verification boundary

Package checks cover source/render hashes, actual static font weights, geometry enclosure, safe text bounds, background contrast, no source upscaling, local links, output dimensions and preservation of the 18 original exports. Static image review is separate from responsive browser QA, which remains pending because available browser control could not initialize. The scoped Node 23.4.0 test command uses `--no-maglev` after an independently sampled V8 shutdown deadlock; assertions remain active and deliberate failures still exit nonzero.
