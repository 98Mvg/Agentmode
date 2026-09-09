# Coachi: App Store traffic and conversion opportunities

Research date: 8 September 2026. Scope: research and recommendations only. No listing, campaign, budget, product, release, or production changes.

## Recommendation

Prioritize **real runner demonstrations → an audience-matched App Store page → a first coached workout**. Coachi has a demonstrable product; the immediate opportunity is making that experience understandable and putting it in front of runners with the right problem.

Start with two propositions: **keep easy runs easy** and **get spoken guidance using your watch's heart-rate data**. Treat these as test hypotheses, not proven keyword demand or guaranteed growth.

## What I verified for Coachi

| Finding | Evidence and implication |
|---|---|
| No custom product pages | Authenticated App Store Connect GET at 07:58 UTC returned zero pages, with no next page. Every audience currently lacks a separately configured custom-page destination. |
| Little storefront-specific rating proof | Fresh Apple lookup: Norway 5.0 from 5 ratings; US 2.0 from 1 rating. These are separate markets and tiny samples, not a reliable estimate of overall product quality. The US display is nevertheless a plausible trust obstacle. |
| The hero improved, but the sequence returns to setup | Live browser inspection showed a live-coach opening image, followed by workout selection, rounds customization, rest and zone selection. One image visibly says “Costumize everything.” |
| Device-size assets are inconsistent | Today's App Store Connect snapshot has six images in the English 6.7-inch iPhone set, but eight in the 6.5-inch set. The latter includes dedicated AI-coach and score images near the end. Do not assume every iPhone receives the same story. |
| No app-preview video | No preview sets in the verified default-version media inventory. This leaves a voice-first product without an App Store video demonstration. |
| Copy and localization can be clearer | English subtitle: “AI & A Voice Coach That Adapts.” Norwegian subtitle remains English. Of the 36 metadata locales, only English (US) has dedicated iPhone screenshot sets. Promotional text and description repeat the founder story before the strongest coaching explanation. |
| Current acquisition baseline remains unmeasured in this review | The Analytics Reports API returned no report requests; this does **not** mean App Store Connect has no analytics. I did not retrieve current source-level page views, downloads, trials or proceeds, so no current conversion rate, CAC or profitability claim is justified. |

Sources: [US listing](https://apps.apple.com/us/app/coachi-running-heart-rate/id6760587172), [Norway listing](https://apps.apple.com/no/app/coachi-running-heart-rate/id6760587172), and the [local evidence note](../../inputs/research/2026-09-08-appstore-growth-evidence.md).

### Focused listing audit

Preset: `landing-page`, limited to developer-controlled listing content. Overall **2.8/5 — clear product potential, incomplete conversion presentation**. This is a qualitative audit score, not measured conversion performance.

| Area | Score | Level | Priority |
|---|---:|---|---|
| Purpose and positioning | 3/5 | Needs work | High |
| Screenshot story and hierarchy | 3/5 | Needs work | High |
| Demonstration of realtime coaching | 2/5 | Weak | High |
| Trust signals | 2/5 | Weak | High |
| Copy and locale consistency | 3/5 | Needs work | Medium |
| Brand distinctiveness | 4/5 | Good | Low |

The first image now communicates live coaching, which is stronger than the June audit's setup-first opening. The next images explain controls before demonstrating why coaching is useful. The orange/black identity is recognizable; a decorative rebrand is not the priority.

Inspection covered desktop web and a 390×844 web viewport, not the native App Store on a physical iPhone. I did not score Apple's interface, app runtime performance or accessibility. No numerical before/after score is claimed because the older audit used a different rubric.

## Real examples worth learning from

| App | Mechanism | Reported outcome | Transferable lesson |
|---|---|---|---|
| Pillow | Apple Watch-specific ad variants and matching custom product pages, separate from iPhone messaging | **63% higher tap-through rate; 83% more installs** than the default ad | Show watch runners their exact use case, with consistent ad and store imagery. [Apple case study](https://ads.apple.com/app-store/success-stories/pillow) |
| Petit BamBou | Separate meditation, breathing and sleep intent; each linked to relevant ad creative and a custom page | **20% higher conversion rate; 25% lower acquisition cost** for variants versus the default ad | Segment by the problem people want solved, not a list of every feature. [Apple case study](https://ads.apple.com/app-store/success-stories/petit-bambou) |
| Ladder | Early partnerships with fitness coaches and relevant Instagram audiences; later organic TikTok learning informed paid creative | Founder confirms the early coach-partnership strategy helped reach **$1 million annual recurring revenue** | Trusted people using the product can be a distribution channel. This is company revenue evidence, not a measured App Store-page uplift. [Founder interview](https://subclub.com/episode/how-ladder-cracked-tiktok-and-grew-500-greg-stewart-ladder) |
| Runna | Used subscription-event attribution to optimize US Apple Search Ads keywords and stop spending in weaker markets | **56% improvement in trial conversion rate** for US Apple Search Ads; **8% lower acquisition cost** from the market-spend changes | Judge traffic by downstream quality, not only inexpensive downloads. The report does not specify an absolute trial-conversion baseline. [RevenueCat customer case](https://www.revenuecat.com/customers/runna) |

These are vendor-published cases or a founder interview, not independently audited randomized experiments. Pillow's install-volume increase is not a page-conversion-rate increase. The studies do not establish the uplift Coachi should expect; comparable budgets, sample sizes and test periods are generally absent.

Runna also visibly operates [an ambassador program](https://www.runna.com/ambassadors), [race/community partnerships](https://www.runna.com/en-gb/partnerships), and [a useful pace calculator](https://www.runna.com/pace-calculator) leading into its web trial funnel. These prove the channels exist, not how many App Store installs they generated.

## The three highest-impact moves

### 1. Make the existing listing demonstrate the payoff

Keep the recognizable visual identity. Fix the typo, align the iPhone-size sets, and test a benefit-first screenshot sequence:

1. Realtime AI running coaching: what the runner gets.
2. A real mid-run cue alongside the relevant workout/heart-rate state.
3. A real Talk to Coach exchange, clearly labelled where Coachi+ is required.
4. Understand the run afterwards: useful feedback, not just a score.
5. Watch compatibility and practical setup.
6. Workout choices and customization.

Candidate metadata, **not uploaded**:

- English name: `Coachi: AI Running Coach` — 24 characters.
- English subtitle: `Live voice. Right intensity.` — 28 characters.
- Norwegian name: `Coachi: Løpecoach med AI` — 24 characters.
- Norwegian subtitle: `Stemmeveiledning mens du løper` — 30 characters.

Validate keyword coverage and language quality before choosing these. The English keyword field currently repeats `heart rate` from the title and includes Norwegian `puls`; that is a reason to review relevance, not proof any term has zero demand. Apple recommends relevant, nonduplicative keywords and excludes competing app names. Promotional text does not improve search ranking. [Apple search guidance](https://developer.apple.com/app-store/search/)

Add a **15–30 second on-device app preview**, with readable captions and existing real coaching audio. Do not upload the cinematic running ads unchanged as App Store previews: Apple requires in-app footage, previews autoplay muted, and subscription-only features need disclosure. No new voices are needed. [Apple preview guidance](https://developer.apple.com/app-store/app-previews/)

### 2. Build two matched destinations, then bring the right people

| Audience | Content angle | Matching store-page proof |
|---|---|---|
| Runners who push easy runs too hard | “I keep turning easy runs into hard runs.” | A real intensity cue, heart-rate context and a clear explanation of what the runner does next |
| Apple Watch runners who keep checking numbers | “My watch gives me numbers. Here is the guidance I hear.” | Actual watch connection, live workout data and spoken coaching; do not imply phone-free operation unless verified |

Custom product pages can have their own screenshots, preview and promotional text, unique shareable URLs, and relevant search-keyword assignments. They can be reviewed independently of a new app binary. Creating a page alone does not create demand; it needs a distribution source. [Apple custom product pages](https://developer.apple.com/app-store/custom-product-pages/)

For an initial organic pilot, invite **five genuine runner-creators** to test Coachi and, if they find it useful, make two short demonstrations each. Choose relevance and credible use over follower count. Each video should establish the problem, show the real cue/exchange, and offer one clear next step. Obtain content usage rights and disclose any compensation; do not require positive reviews or a scripted testimonial.

Use a distinct campaign link for each creator/theme. For an iPhone viewer who already understands the demo, test a direct store-page destination against the existing Coachi.no path rather than assuming another landing-page step helps. For educational content or mixed-device audiences, the website can still do useful qualification. This is a proposed test, not a direction to replace existing links now.

### 3. Grow evidence and distribution before expanding spend

- Start a small Norway-first pilot. Localize the first screenshots for the markets actually being targeted, including the existing Norway/Sweden/Italy paid test, before assuming translated descriptions are enough. A later English pilot should be separately scoped. Norway's rating proof and local access are useful advantages; neither proves the market will convert better.
- Explore one organizer-approved running-club demonstration. It can put Coachi in front of relevant runners without a large sponsorship commitment. Shared Workouts must not be advertised as public while still access-gated.
- Encourage honest App Store feedback after an appropriate completed task using the standard review mechanism, without sentiment screening, rewards, or asking only likely five-star raters. This is a proposed follow-up, not an implemented app change. There were no written reviews returned by the current API, so I cannot diagnose or respond to the US rating. [Apple ratings guidance](https://developer.apple.com/app-store/ratings-and-reviews/)
- Consider a few useful, tightly related search pages as a longer-term channel, such as practical watch-based coaching guides using actual Coachi examples. Runna's useful-tool funnel supports the mechanism, but this review found no quantified organic lift to use as a forecast. Avoid mass-produced generic fitness articles.
- Prepare an Apple Featuring nomination when there is a substantial, polished story to tell. This is upside, not a dependable traffic plan; Apple asks for at least two weeks' notice and offers no placement guarantee. [Apple featuring guidance](https://developer.apple.com/app-store/getting-featured/)

## How to measure the next test

First retrieve the last 28 completed days of App Store acquisition by country and source: unique impressions, unique product-page views, first-time downloads and redownloads. Use campaign/custom-page reports for matched comparisons. Keep creator reach, outbound clicks, store visits, downloads, completed workouts, trials, and verified paid subscribers separate.

Apple's general conversion metric is downloads/pre-orders divided by unique impressions, not simply installs divided by product-page visitors. People can download from search without opening the full page. Do not divide unrelated all-source totals into a supposed page-conversion cohort. [Apple metric definitions](https://developer.apple.com/help/app-store-connect-analytics/reference/metrics-definitions/)

Campaign reporting has privacy thresholds; first-time-download attribution uses a 24-hour link window. A missing small campaign row is not evidence of zero downloads. [Apple campaign links](https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links/)

Use one default-page screenshot treatment at a time, with the same source/market mix where possible. Check Apple's estimated duration first: low volume may make a conclusive result impossible within a two-week pilot. Do not declare a winner from five installs or a blended before/after comparison. Apple's product-page testing guidance recommends waiting for at least 90% confidence. [Apple product page optimization](https://developer.apple.com/app-store/product-page-optimization/)

### Existing paid work is not a blank slate

The September 2 ledger records all ten Apple Ads campaigns paused; this research did not refresh their live status or restart them. Today's TikTok launch record says Summer Dream was delivering and the new Stadium/Recovery ads were enabled but pending review at 07:04 UTC, sharing the existing budget. Do not duplicate campaigns or disturb that test based on this report. Compare a common post-approval period and allow for attribution delay before considering more paid expansion.

## Practical sequence, subject to approval

- **First:** agree the two messages; fix listing text/asset defects in a reviewed draft; export the acquisition baseline.
- **Next:** prepare the two custom pages and the native app-preview test; select the five-runner pilot and agree terms before outreach/spend.
- **Then:** distribute the approved demos with measured destinations, and inspect the existing paid test without changing its controls.
- **After enough evidence:** amplify the audience/message that brings genuine coached workouts and verified trials/paid users. Continue or stop tests based on data quality and cost, not an arbitrary calendar deadline.

No uplift percentage or spending increase is promised or authorized by this research.
