# Apple Ads CPI optimization ledger — 2026-08-31

## Objective and guardrails

- Primary objective: reduce Apple Ads cost per install without sacrificing high-intent install volume.
- Secondary objective: build trustworthy install-to-trial-to-paid attribution before scaling spend.
- Total campaign budget was not increased or reallocated in this pass.
- All live changes were made through Apple Ads Campaign Management API v5 and verified by API readback.
- Automatic campaign changes remain outside this pass; every mutation below has an explicit rollback.

## Evidence boundaries

Keep these sources separate in every review:

1. Apple Ads delivery API: spend, impressions, taps, installs, keyword/search-term CPI.
2. Apple aggregate market signals: suggestions, popularity, and category rank; these are demand signals, not conversions.
3. Coachi production attribution database: install attribution bound to campaign/keyword and verified subscription conversions.
4. PostHog: app/product behavior; current identity does not prove that an Apple Ads install caused a downstream event.

## Completed-week baseline: 2026-08-23 through 2026-08-29

| Metric | Value |
|---|---:|
| Spend | $94.38 |
| Impressions | 9,612 |
| Taps | 143 |
| Apple-reported installs | 23 |
| Tap-to-install conversion | 16.08% |
| Average CPT | $0.66 |
| Average CPI | $4.10 |

Campaign baseline:

| Campaign | Spend | Taps | Installs | CPI |
|---|---:|---:|---:|---:|
| Competitors EU+AU+NZ | $61.88 | 86 | 12 | $5.16 |
| Nordic Garmin & Apple Watch | $25.23 | 43 | 9 | $2.80 |
| Garmin & Apple Watch UK+Australia | $5.66 | 11 | 2 | $2.83 |

Production attribution for the same completed week:

- 15 production Apple Ads attribution records.
- 15/15 carried campaign and keyword identifiers.
- 2/15 were bound to a signed-in user account.
- 0 verified Apple Ads subscription conversions.
- 0 pending Apple Ads subscription conversions.

## Current partial signal: 2026-08-30 through 2026-08-31

Do not compare this partial two-day window as if it were a completed week.

| Campaign | Spend | Taps | Installs | CPI |
|---|---:|---:|---:|---:|
| Competitors EU+AU+NZ | $19.55 | 28 | 7 | $2.79 |
| Nordic Garmin & Apple Watch | $15.77 | 24 | 6 | $2.63 |
| Garmin & Apple Watch UK+Australia | $2.89 | 4 | 0 | — |

The competitor campaign improved materially in the partial window, so it was not paused or budget-cut as a whole.

## Live change set applied at 2026-08-31 19:03 UTC

### Existing keyword changes

| Keyword | ID | Before | After | Reason |
|---|---:|---|---|---|
| the fitbit inspire, broad | 2299467173 | Active, $0.90 max CPT | Active, $0.60 max CPT | Rolling CPI remained materially above baseline; retain lower-cost coverage. |
| nike run, broad | 2299467174 | Active, $0.90 max CPT | Paused, $0.90 retained | Five rolling taps and zero installs; stronger Nike Run Club variants remain available. |

### New exact-match keywords

| Keyword | Keyword ID | Ad group ID | Max CPT | Evidence |
|---|---:|---:|---:|---|
| fitbit | 2306320333 | 2150237775 | $0.70 | Highest-volume converting competitor term; exact isolates intent. |
| adidas running | 2306320334 | 2150237775 | $0.65 | Two installs from three rolling taps at low CPI. |
| apple watch running | 2306320024 | 2149583664 | $0.60 | Eight installs from 24 rolling taps at approximately $1.66 CPI. |
| amazfit watch | 2306323946 | 2149582966 | $0.65 | Two installs from seven rolling taps as an observed search term. |
| garmin running | 2306323947 | 2149582966 | $0.65 | Three installs from 12 rolling taps, including two in the partial week. |
| garmin watch | 2306323948 | 2149582966 | $0.60 | Direct high-intent watch query separated from broad discovery traffic. |

### New exact negative keywords

| Search term | Negative keyword ID | Ad group ID | Reason |
|---|---:|---:|---|
| basecamp | 2334463909 | 2150237775 | Unrelated project-management query with recorded spend. |
| lamentometro | 2334463910 | 2150237775 | Irrelevant query with recorded spend and no install. |

## Rollback packet

- Restore `the fitbit inspire` ID `2299467173` to Active at $0.90.
- Restore `nike run` ID `2299467174` to Active at $0.90.
- Pause created targeting keyword IDs: `2306320333`, `2306320334`, `2306320024`, `2306323946`, `2306323947`, `2306323948`.
- Delete created negative keyword IDs: `2334463909`, `2334463910`.

## Detailed tracking cadence

### Daily health check

Record for every active campaign and changed keyword:

- impressions, taps, installs, spend
- TTR, tap-to-install conversion, CPT, CPI
- search-term leakage and new irrelevant terms
- Apple Ads reporting sync status and data freshness
- production attribution count, user-bound count, verified trial count, verified paid count
- PostHog iOS first opens, onboarding completers, paywall viewers, and workout completers as a separate product-health layer

Do not make a decision from current-day partial data unless there is an obvious delivery or spend-control failure.

### Three-day early review

- Confirm the new exact terms are receiving impressions.
- Check that the broad counterparts have not absorbed all delivery.
- Lower, but do not immediately pause, exact terms whose CPT is above their bid thesis without install evidence.
- Confirm the two negatives are no longer appearing as paid search terms.

### Seven-day decision review

- Minimum evidence for a keyword judgment: at least 5 taps or 2 installs.
- Pause candidate: at least 10 taps and zero installs.
- Bid-reduction candidate: CPI over 1.5 times the account CPI with at least 2 installs.
- Scale candidate: at least 3 installs and CPI at or below 80% of account CPI; raise max CPT only 10% at a time.
- Do not increase the total daily budget without verified production trial/paid attribution.
- A market-popularity score alone never qualifies a term for scaling.

## Opportunity queue for the next evidence window

These are not live changes yet:

- `apple watch fitness` exact if the broad term continues to convert.
- `apple watch coach` exact after more than the current one-install sample.
- `nike run club` exact if its current partial conversion repeats.
- `strava run ride sync` exact if delivery resumes with CPI below the account baseline.
- Review the UK/Australia campaign after at least 10 additional taps; its current partial zero-install result is too small for a structural change.
- Add further irrelevant exact negatives only when query relevance is unambiguous or the query reaches the no-install threshold.

## Next scheduled decision point

- Early read: 2026-09-03.
- Complete-week review: 2026-09-07, covering 2026-08-30 through 2026-09-05 after ingestion settles.
