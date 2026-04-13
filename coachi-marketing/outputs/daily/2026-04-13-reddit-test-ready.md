# Reddit Daily Flow Test Ready — 2026-04-13

## Objective
Make the existing Reddit daily flow testable on the real live browser path without adding a new workflow.

## Current Path
- browser helper: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh`
- live browser: `Google Chrome 2`
- live profile: `/Volumes/Riot APFS/coachi-marketing/browser/live-chrome-profile`
- docs workspace: `/Volumes/Riot APFS/Agentmode/coachi-marketing`

## Live Preflight Result
Ran:
- `scripts/social/clawbot-browser.sh doctor`
- `scripts/social/clawbot-browser.sh tabs`
- `scripts/social/clawbot-browser.sh snapshot reddit.com`
- `scripts/social/clawbot-browser.sh screenshot reddit.com /Volumes/Riot APFS/coachi-marketing/proofs/browser/2026-04-13-reddit-test-ready.png`

Result:
- `readyForClawbot: true`
- `readyForOpenClaw: false`
- practical meaning: the default visible Reddit path is healthy enough for testing; the lower-level OpenClaw browser endpoint is still degraded and should not be the primary Reddit test path today

## Current Live Reddit Tab
- thread URL: `https://www.reddit.com/r/AppleWatchFitness/comments/1shsra6/beginner_5_months_daily_5km_runner/`
- subreddit: `r/AppleWatchFitness`
- visible status: signed in
- live snapshot confirmed: page content and existing comment thread are readable

## Current Reply Asset
- reply matrix: `/Volumes/Riot APFS/Agentmode/coachi-marketing/outputs/daily/2026-04-13-reddit-reply-matrix.md`
- best matching thread pattern for the open thread: `Apple Watch interpretation`

## Test Success Criteria
- post `1` useful reply on a relevant thread
- capture the comment URL
- log the thread pattern
- log the short reply angle
- log whether the reply created any curiosity, follow-up question, or visible traction
- keep the reply runner-first and linkless unless the thread clearly asks for a tool

## Recommended Test Sequence
1. keep the existing Reddit tab open
2. choose the target reply from the current matrix
3. run one more snapshot before typing if the thread changed
4. post the reply through the visible Clawbot path
5. capture proof screenshot
6. append the result to the dated social run note

## Proof
- `/Volumes/Riot APFS/coachi-marketing/proofs/browser/2026-04-13-reddit-test-ready.png`

## Next Step
The setup is ready for a real Reddit daily-flow test on the existing visible browser path. The next action is execution, not more tooling.

## Execution Result
The real test is now completed on the same visible Clawbot path.

- subreddit: `r/AppleWatch`
- thread pattern: `Apple Watch interpretation`
- thread URL: `https://www.reddit.com/r/AppleWatch/comments/1sjosdr/apple_watch_series_11_hr_wildly_inaccurate_180/`
- comment URL: `https://www.reddit.com/r/AppleWatch/comments/1sjosdr/comment/ofx28rw/`
- reply angle: same-run comparison with an Ultra plus dropped HR chunks points to a faulty sensor path, so this should be treated as a hardware/service issue after one final reset sanity check
- link used: `no`
- proof: `/Volumes/Riot APFS/coachi-marketing/proofs/browser/2026-04-13-reddit-test-reply-proof.png`

## Read
What worked:
- a fresh thread with a very clear Apple Watch heart-rate failure scenario
- a reply that added diagnostic nuance instead of repeating `just take it to Apple`

What to repeat:
- target current Apple Watch or running threads where the number itself is the source of confusion
- add one practical next-step recommendation without turning the reply into a product pitch
