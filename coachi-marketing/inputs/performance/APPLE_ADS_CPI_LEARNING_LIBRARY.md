# Apple Ads CPI Learning Library

Living acquisition knowledge for Coachi. This file must compound over time: every experiment should leave behind a reusable winner, loser, constraint, or unanswered question.

Last initialized: 2026-08-31 21:15 Europe/Oslo

## North star: 1,000 activated users

Until the owner chooses a different definition, the primary growth target is **1,000 activated users**: distinct people who complete onboarding and complete their first workout within seven days of first open.

Always show these counts separately:

1. Apple-reported installs.
2. First-observed iOS people in PostHog.
3. Registered backend users.
4. Activated users: onboarding plus first workout within seven days.
5. Verified production trials.
6. Verified production paid subscribers.
7. Retained users: another completed workout during days 8–30.

Never call installs, SDK events, trial flags, renewals, or premium access “users” or “customers” without naming the exact layer.

## Current baseline

Completed Apple week 2026-08-23 through 2026-08-29:

- Spend: $94.38.
- Impressions: 9,612.
- Taps: 143.
- Apple-reported installs: 23.
- Average CPT: $0.66.
- Average CPI: $4.10.
- Tap-to-install conversion: 16.08%.
- Production Apple Ads attribution rows: 15.
- Attribution rows bound to accounts: 2.
- Verified Apple Ads subscription conversions: 0.

Interpretation:

- Install acquisition is working and the watch-intent segment is currently strongest.
- Account binding is too sparse for trustworthy campaign-to-paid learning.
- CPI optimization can continue, but budget scaling is not economically proven.

Detailed source and rollback ledger: [2026-08-31 Apple Ads CPI optimization ledger](/Volumes/Riot%20APFS/Agentmode/coachi-marketing/outputs/daily/2026-08-31-apple-ads-cpi-optimization-ledger.md).

## Source hierarchy

Never blend these sources into a synthetic conversion rate:

| Layer | Source | What it proves | What it does not prove |
|---|---|---|---|
| Ad delivery | Apple Ads reporting API | Spend, taps, installs, CPI, keyword/search-term performance | Paid customer identity |
| Market demand | Apple Ads Platform API | Suggestions, rank, relative popularity | Conversion or profitability |
| Install attribution | Coachi production database | Captured Apple attribution and campaign/keyword IDs | Full population coverage |
| Product behavior | PostHog | First opens, onboarding, workouts, paywall behavior | Apple Ads causality without identity stitching |
| Monetization | Verified StoreKit/backend records | Production trial and paid transaction evidence | Ad source unless joined to attribution |
| Proceeds | App Store financial reports | Actual developer proceeds | Keyword-level attribution |

## Knowledge quality levels

- **Level 0 — idea:** product-fit hypothesis only.
- **Level 1 — demand:** Apple popularity or impressions, no conversion evidence.
- **Level 2 — signal:** at least five taps or one install.
- **Level 3 — install evidence:** at least two installs in complete-day data.
- **Level 4 — activated evidence:** attributed cohort reaches first workout at a measurable rate.
- **Level 5 — paid evidence:** verified production paid conversions and proceeds can be joined to the acquisition cohort.

Only Level 3 or higher can become an install winner. Only Level 5 can become a scaling winner.

## Scale gates

### Gate A — measurement

- Campaign and keyword IDs captured on attributed installs.
- Attribution-to-account binding coverage reported every week.
- Verified trial/paid events joined to attribution where possible.
- Current-day partial data never used as a completed cohort.

### Gate B — efficient installs

- At least 20 installs in a comparable complete-period cohort.
- CPI is stable or falling across two comparable periods.
- No single low-quality broad keyword dominates spend.
- Search-term waste is controlled with exact negatives.

### Gate C — activation

- First open to onboarding and first-workout rates are measurable for source cohorts.
- Cost per activated user is stable or falling.
- A CPI improvement that harms activation is rejected.

### Gate D — monetization

- At least 10 verified production paid conversions in a comparable cohort.
- Projected contribution LTV/CAC is at least 3.0.
- Projected payback is no longer than six months.
- Contribution calculation uses actual proceeds minus refunds, ad spend, and variable service costs.

### Gate E — controlled scale

- Raise spend in 10–20% steps only after Gates A–D remain healthy.
- Recheck after every increase; do not stack budget increases faster than cohort maturity.
- Preserve a discovery allocation, but direct most incremental spend to validated exact intent.

Current state: **Gate B learning; Gate A incomplete; not budget scale-ready.**

## Opportunity score

Rank new keyword or campaign opportunities with:

- Product fit: 0–3.
- Search intent: 0–3.
- Conversion evidence: 0–4.
- Apple demand signal: 0–2.
- Cost risk: 0 to −3.
- Data uncertainty: 0 to −2.

Do not allow popularity to outweigh missing conversion evidence. Prefer a high-intent term with two installs over a popular term with no taps or installs.

## Decision rules

- Minimum normal keyword judgment: five taps or two installs.
- Pause candidate: ten complete-day taps and zero installs.
- Bid reduction: at least two installs and CPI above 1.5× rolling account CPI.
- Bid increase: at least three installs, CPI at or below 0.8× account CPI, and evidence that delivery is auction-constrained.
- Exact harvest: observed relevant search term with at least two installs, or at least five taps and 25% tap-to-install conversion.
- Exact negative: unambiguously irrelevant term with at least two paid taps and zero installs.
- Cooldown: at least 72 hours between changes to the same keyword.
- Daily mutation cap: three targeting changes.
- Budget changes: never automatic; require paid-economics proof and explicit owner approval.

## Active experiment registry

### AA-2026-08-31-01 — Reduce expensive broad Fitbit discovery

- Change: `the fitbit inspire` broad max CPT $0.90 → $0.60.
- Hypothesis: lower auction exposure will reduce CPI while preserving some converting traffic.
- Primary metric: keyword CPI.
- Guardrail: installs do not collapse to zero after sufficient impressions.
- Status: running.
- Earliest read: 2026-09-03.
- Decision read: 2026-09-07.

### AA-2026-08-31-02 — Remove zero-install Nike ambiguity

- Change: paused `nike run` broad; retained stronger Nike Run Club variants.
- Hypothesis: broad Nike ambiguity consumes taps without installs.
- Primary metric: competitor-campaign CPI excluding the paused term.
- Status: running.
- Earliest read: 2026-09-03.
- Decision read: 2026-09-07.

### AA-2026-08-31-03 — Harvest exact watch and competitor intent

- Change: added exact `fitbit`, `adidas running`, `apple watch running`, `amazfit watch`, `garmin running`, and `garmin watch`.
- Hypothesis: exact intent preserves conversion while reducing broad-match spillover.
- Primary metrics: exact keyword CPI and share of installs.
- Guardrail: broad discovery still surfaces genuinely new relevant terms.
- Status: running.
- Earliest read: 2026-09-03.
- Decision read: 2026-09-07.

### AA-2026-08-31-04 — Block obvious irrelevant leakage

- Change: exact negatives `basecamp` and `lamentometro`.
- Hypothesis: the terms disappear from paid search-term delivery without suppressing relevant variants.
- Primary metric: zero future spend on those exact queries.
- Status: running.
- Earliest read: 2026-09-03.

## Provisional knowledge

### Provisional winners

- `apple watch running`: strongest repeatable install evidence, about $1.66 rolling CPI before exact harvesting.
- `amazfit watch`: two installs from seven rolling taps as an observed search term.
- `garmin running`: three installs from 12 rolling taps and improving recent CPI.
- `adidas running`: two installs from three rolling taps, but sample remains small.

### Provisional losers

- `nike run` broad: five rolling taps and zero installs before pause.
- `basecamp`: clearly irrelevant paid query.
- `lamentometro`: irrelevant paid query.

### Inconclusive

- `fitbit` exact: strong volume hypothesis, no exact-match maturation yet.
- `garmin watch` exact: high product fit; broad term mixed relevant installs with other watch-brand searches.
- `coros`, `whoop`, `apple watch`, and `garmin` exact terms were newly live and need maturity.
- UK/Australia watch campaign: too little recent evidence for a structural decision.

## Weekly synthesis template

Append one dated section each week:

1. Complete Apple week and comparison week.
2. Spend, taps, installs, CPI, CPT, TTR, and conversion by campaign.
3. Changed-keyword before/after result, with maturity and confidence.
4. Newly observed search terms: harvest, negative, watch, or ignore.
5. Attribution coverage and account-binding rate.
6. Activated-user evidence.
7. Verified trials, paid conversions, actual proceeds, and paid CAC if available.
8. Winners promoted, losers stopped, inconclusive experiments extended.
9. Progress toward 1,000 installs, registered users, activated users, and paid users—shown separately.
10. Maximum three experiments for the next week.

## Append-only weekly learnings

Future weekly automation entries begin below this line. Never rewrite prior weekly outcomes; append corrections with a new date.
