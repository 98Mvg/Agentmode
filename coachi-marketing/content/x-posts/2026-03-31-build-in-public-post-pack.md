# Coachi X Build-In-Public Post Pack

Date: 2026-03-31

## Use Case

Use these when the goal is:
- curiosity
- profile clicks
- early adopter trust
- builder + runner crossover

## Rules

- Do not post pure tech for its own sake.
- Every technical detail must connect to a runner problem, user benefit, or shipping lesson.
- Keep the tone honest, sharp, and specific.
- End close to the product truth: `AI coach, not tracking app.`

## Posts

### 1

Spent 3 months building Coachi with Codex, Claude, and ChatGPT.

What worked:
shipping fast
rewriting ugly flows
staying in motion

What did not:
thinking code was the hard part

Apple review was harder than SwiftUI.

### 2

I vibe coded an iPhone + Apple Watch running coach.

Got rejected 3 times.

Not because the product was bad.

Because:
- subscriptions were not submitted right
- Terms link was missing
- Restore Purchases was not obvious enough

Shipping = product + compliance.

### 3

Went from 1.0.1 -> 1.0.3 mostly because of boring edge cases.

The AI coach worked.

The friction was:
- App Store metadata
- paywall visibility
- restore flow

Builders always underestimate the last 10%.

### 4

Real thing that happened:

I had to burn the original subscription IDs and ship:
app.coachi.premium.monthly.v2
app.coachi.premium.yearly.v2

AI can write your paywall.

It cannot save you from App Store Connect getting weird.

### 5

Since March 16: 207 commits.

The lesson is not "AI writes code."

It is:
AI lets you stay in motion while the target keeps moving.

New rejection?
New build.
New copy.
New surface.
Ship again.

### 6

I changed OnboardingContainerView.swift 25 times in 2 weeks.

That one file became the whole startup story:
trial copy
paywall layout
restore button
CTA visibility
App Review fixes

Shipping is mostly polishing the point of hesitation.

### 7

Built most of Coachi without touching Xcode manually.

SwiftUI iPhone app
watchOS companion
Flask backend

The hard part was not generating code.

It was deciding what mattered enough to survive real shipping.

### 8

One of the best decisions was automating App Store screenshots.

Once AI speeds up product work, the bottleneck moves:
upload
review
metadata
assets
compliance

The boring layers become the real product work.

### 9

I thought I was debugging code.

I was really debugging product clarity.

The app worked.

The reviewer just could not see the restore flow, trial CTA, and legal links fast enough.

Sometimes the bug is comprehension.

### 10

Biggest lesson from building with Codex + Claude + ChatGPT:

AI makes shipping cheaper.
It does not make clarity optional.

Every time I added more, the product got worse.
Every time I made the coaching moment simpler, it got better.

## Best First 3

- Post 2
- Post 4
- Post 9
