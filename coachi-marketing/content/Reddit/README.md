# Reddit

Use this folder for Coachi Reddit drafts, post concepts, and subreddit-specific variations.

Reddit should be reply-first, not promo-first.

## Objective
- mine real runner language
- build authority by being useful
- learn what confuses runners in real time
- earn selective traffic only when the thread clearly supports it

## Daily Flow
- find `3 to 5` relevant threads
- leave `1 to 3` useful replies
- create `0 or 1` original post only if there is a clean angle and clear subreddit fit
- save:
  - thread URL
  - comment URL
  - the exact runner language that felt useful
  - thread pattern
  - whether the thread created any follow-up question, upvote traction, or profile curiosity

## Required Thread Pattern Labels
Use one of these labels for each thread you touch:
- `watch-checking anxiety`
- `heart-rate confusion`
- `Apple Watch interpretation`
- `Garmin interpretation`
- `beginner uncertainty`
- `easy-run pace drift`

## Best Target Threads
Prioritize threads about:
- checking the watch too often
- heart-rate spikes and zone confusion
- Apple Watch or Garmin workout interpretation
- beginner runner uncertainty
- pace drift on easy runs
- what to do when the number changes mid-run

Skip threads that are:
- pure hardware troubleshooting
- hostile or obvious anti-promo traps
- heavily moderated against any tool mention
- already solved with a strong answer

## Reply Structure
Best shape:
1. answer the question directly
2. add one practical nuance from runner experience
3. mention Coachi only if the thread clearly asks for a tool, workflow, or next step

Good:
- calm
- specific
- useful without a click
- written like a runner first

Bad:
- founder-spam framing
- dropping `coachi.no` in every reply
- treating Reddit like X or Instagram comments

## Link Rule
- default to no link
- use a link only when the person is clearly asking what tool could help
- never lead with the link
- keep it to `0 or 1` links per Reddit session

## Subreddit Priorities
When relevant, tailor drafts separately for:
- `r/running`
- `r/AppleWatch`
- `r/AppleWatchFitness`
- `r/advancedrunning`
- `r/BeginnerRunner`
- `r/C25K`
- `r/Garmin`
- `r/fitness`

## Original Post Rule
Only make a new discussion post when:
- the angle is strong without Coachi
- the question is broad enough to invite real discussion
- the subreddit does not treat it like soft self-promo

Best original post shapes:
- watch-checking anxiety
- heart-rate confusion
- uncertainty about what the number means during the run
- whether data makes runners calmer or more stressed

## Execution Notes
- use the signed-in live browser path when doing live Reddit work
- prefer opening the thread directly instead of browsing cold from the home feed
- if the composer is flaky, do not fake completion; log it honestly

## Test Preflight
Before a live Reddit test session:
1. run `scripts/social/clawbot-browser.sh doctor`
2. confirm `readyForClawbot: true`
3. keep one signed-in Reddit tab open in the live Chrome profile
4. open the target thread directly, not the Reddit home feed
5. run one snapshot before acting
6. keep the reply matrix open before typing
7. capture one proof screenshot during the session

Minimum success criteria for a real Reddit daily-flow test:
- `1` useful reply posted
- comment URL captured
- thread pattern captured
- reply angle captured
- curiosity/result note written honestly
- no unnecessary link dropped

## Daily Tracking Rule
In the daily run note, log for every Reddit thread/reply:
- subreddit
- thread pattern
- thread URL
- comment URL if posted
- short reply angle
- curiosity/result note

At the end of the run, add:
- which thread pattern produced the best response
- which pattern is worth repeating tomorrow
