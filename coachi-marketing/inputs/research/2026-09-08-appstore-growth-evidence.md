# App Store growth research: evidence boundary

8 September 2026. All external access in this research was read-only. Existing App Store credentials were used locally for authenticated GETs and never printed. No new report request, custom page, review response, campaign, credential or product state was created.

## Live checks

- Apple public lookup, app ID `6760587172`, Norway and US: version `4.0.1`, current-version release `2026-09-05T20:37:43Z`; Norway rating `5.0`/`5`, US `2.0`/`1`.
- Authenticated App Store Connect GET at `2026-09-08T07:58:46.912380+00:00`: `appCustomProductPages` zero, `analyticsReportRequests` zero, `customerReviews` zero. Each response had no next page.
- Live public US listing inspected in a separate background browser tab at desktop size and 390×844. It showed 4.0.1, the current subtitle, live-coaching hero, setup-oriented following images and the visible `Costumize everything` typo. This was browser rendering, not native iPhone App Store verification. Temporary viewport override reset. Render's unsaved setup tab was not edited or navigated.
- Default metadata/media snapshot: `/private/tmp/coachi-402-metadata.xDtouW/after.json`, captured `2026-09-08T06:22:18.581520+00:00`; source is live 4.0.1, target is draft 4.0.2. English `APP_IPHONE_67` has six screenshots; `APP_IPHONE_65` has eight; no app previews. Norwegian iPhone assets have no separate screenshot set in that snapshot, while its subtitle is English. Avoid treating language metadata, screenshot fallback and installed app language as identical.
- Search-engine copies were stale (3.7/3.9). They were not used for current version/rating/media inventory claims; fresh Apple lookup, authenticated snapshot and browser state take precedence.

## Workspace recon and source map

The marketing workspace is Node/JavaScript/Python orchestration plus content and evidence, not a separate app runtime. Core folders: `scripts/`, `inputs/{research,performance,notes}/`, `content/{ads,video,slideshows,Tiktok,Instagram}/`, `outputs/`, `strategy/`, `tasks/`. Product reference remains SwiftUI iOS/watchOS plus Flask root backend in the canonical app repo.

Acquisition path: creator/search/ad → direct App Store page or Coachi.no → existing `/app-store` redirect → App Store listing → download → app onboarding → workout → optional subscription. Measurement path: channel click evidence / Apple acquisition reports / product events / confirmed subscription transactions; these are distinct sources, not an automatically stitched person-level funnel.

Ten relevant sources and roles:

1. `AGENTS.md`: marketing scope and channel guardrails.
2. `SOURCE_OF_TRUTH.md`: canonical marketing ownership.
3. `Codebase_guide.MD`: existing production/creative paths and dated operational records.
4. `inputs/performance/WINNER_LIBRARY.md`: existing runner-language hypotheses, not a current performance leaderboard.
5. `outputs/daily/2026-06-25-appstore-conversion-audit.md`: historical listing baseline; not current proof.
6. `outputs/daily/2026-09-02-apple-ads-pause-ledger.md`: last inspected Apple Ads pause record; not a live refresh.
7. `outputs/daily/2026-09-02-apple-ads-cpi-control-ledger.md`: historical reporting freshness/attribution limitations.
8. `content/ads/prelaunch/2026-09-08-three-creative-rotation/README.md`: today's already-authorized TikTok test, independent of this research.
9. App repo `scripts/ios/release/app_store_build_inventory.py`: existing read-only ASC authentication helper used for GETs.
10. App repo `scripts/build_app_store_campaign_links.py` and `scripts/summarize_app_store_acquisition.py`: existing campaign-link/report path to inspect before any future implementation; not executed or modified here.

## Top risks and high-ROI opportunities

- Message mismatch: the first screenshot promises coaching but the following assets emphasize configuration. Fix/test within the existing listing, not a new product architecture.
- Trust and localization: sparse US ratings, awkward English subtitle, English Norwegian subtitle, and inconsistent size sets. Verify actual market/size delivery before publication.
- False winners: unavailable attribution, small samples, source mixing, and campaign-review delays can make cheap clicks look like growth. No paid CAC or profitability computed.

Best-ROI maintenance ideas: reuse native capture assets for a compliant preview; reuse the existing link builder and one approved page template; replace repeated generic creative production with a small number of measured audience propositions. These are recommendations only, with no runtime implementation.

## Research checks

- Case-study claims verified against Apple Ads, the Ladder founder transcript, and RevenueCat's Runna customer story; denominators and disclosure limits retained in the report.
- Official Apple docs checked for custom pages, search metadata, app previews, ratings, campaign attribution, general metric definitions, product page optimization and featuring.
- Runna's own ambassador, calculator and partnership pages verified as operating distribution mechanisms; no attributed install totals inferred.
- Independent research-agent review found no substantive case-metric or causal-framing errors. Main verified the local listing/portal evidence. Scoped documentation diff checks and the report's relative evidence link passed.
- Final media query confirmed `en-US` is the only one of 36 metadata locales with dedicated `APP_IPHONE` screenshot sets; this is media-configuration evidence, not a physical-device language test.
- No app build/tests were required for a read-only marketing review. Documentation checks do not prove a conversion lift.

Main report: `outputs/research/2026-09-08-appstore-growth-opportunities.md`.
