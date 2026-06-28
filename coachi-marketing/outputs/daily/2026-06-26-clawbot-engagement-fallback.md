# Clawbot Engagement Fallback - 2026-06-26

## Safety Status
This fallback did not click likes, follows, comments, replies, posts, shares, DMs, or links.
Use it as a discovery and approval-queue handoff before any public account action.
Clawbot fallback was requested only after this in-house browser blocker was recorded: growth:daily failed on run-todays-pack.sh --date 2026-06-26 --json; public actions remain approval-gated

## Browser Health
- Start browser requested: no
- OpenClaw recovery requested: no
- Daily pack complete: no
- Missing pack files: x, tiktok, instagram, reddit
- Pack resolver exit: 1
- Doctor before exit: 1
- Doctor after exit: 1
- Ready for Clawbot: no
- Ready for OpenClaw: yes
- In-house browser blocker: growth:daily failed on run-todays-pack.sh --date 2026-06-26 --json; public actions remain approval-gated
- Queue JSON: `/Volumes/Riot APFS/Agentmode/coachi-marketing/outputs/daily/2026-06-26-clawbot-engagement-fallback.json`

## In-House Browser First
- Use the Codex in-app browser for all reachable navigation, reading, drafting, and verification before this fallback.
- Only move work into Clawbot when the in-app browser cannot proceed because of login, captcha, composer, selector, or rendering blockers.
- Keep Reddit in the in-app browser by default; Clawbot is only a recorded fallback for it.

## Operating Rule
- First pass is discovery only.
- Build an approval queue with target URL, action, exact text, Coachi mention, and link risk.
- Reuse the current or same-site Clawbot tab for navigation; do not add `--new` for every discovery URL.
- Do not run the live engagement executor until the batch is approved.
- Reddit replies remain draft-only until explicit approval for each prepared batch.
- TikTok/Instagram/X comments should be staged first; final submit is separate approval.

## Target Caps
- X: 8 likes, 4 follows, 2 comments/replies
- Instagram: 8 likes, 4 follows, 2 comments/replies
- Tiktok: 8 likes, 4 follows, 2 comments/replies
- Reddit: 3 useful drafted replies

## Comment Starters
- X: This is good. Most runners improve faster when the feedback is calmer and more specific.
- Instagram: This is useful. Small cues usually beat more noise.
- Tiktok: This is true. Better interpretation changes the whole run.

## Discovery Surfaces
### X
- https://x.com/search?q=%22zone%202%22%20running&src=typed_query&f=live
  - Open/reuse: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh open 'https://x.com/search?q=%22zone%202%22%20running&src=typed_query&f=live'`
  - Snapshot: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh snapshot 'x.com'`
- https://x.com/search?q=%22easy%20run%22%20running&src=typed_query&f=live
  - Open/reuse: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh open 'https://x.com/search?q=%22easy%20run%22%20running&src=typed_query&f=live'`
  - Snapshot: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh snapshot 'x.com'`
- https://x.com/search?q=%22Garmin%22%20running&src=typed_query&f=live
  - Open/reuse: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh open 'https://x.com/search?q=%22Garmin%22%20running&src=typed_query&f=live'`
  - Snapshot: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh snapshot 'x.com'`
### Instagram
- https://www.instagram.com/explore/tags/zone2running/
  - Open/reuse: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh open 'https://www.instagram.com/explore/tags/zone2running/'`
  - Snapshot: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh snapshot 'www.instagram.com'`
- https://www.instagram.com/explore/tags/easyrun/
  - Open/reuse: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh open 'https://www.instagram.com/explore/tags/easyrun/'`
  - Snapshot: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh snapshot 'www.instagram.com'`
- https://www.instagram.com/explore/tags/beginnerrunner/
  - Open/reuse: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh open 'https://www.instagram.com/explore/tags/beginnerrunner/'`
  - Snapshot: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh snapshot 'www.instagram.com'`
- https://www.instagram.com/explore/tags/garminrunning/
  - Open/reuse: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh open 'https://www.instagram.com/explore/tags/garminrunning/'`
  - Snapshot: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh snapshot 'www.instagram.com'`
### Tiktok
- https://www.tiktok.com/search?q=zone%202%20running
  - Open/reuse: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh open 'https://www.tiktok.com/search?q=zone%202%20running'`
  - Snapshot: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh snapshot 'www.tiktok.com'`
- https://www.tiktok.com/search?q=easy%20run
  - Open/reuse: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh open 'https://www.tiktok.com/search?q=easy%20run'`
  - Snapshot: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh snapshot 'www.tiktok.com'`
- https://www.tiktok.com/search?q=beginner%20runner
  - Open/reuse: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh open 'https://www.tiktok.com/search?q=beginner%20runner'`
  - Snapshot: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh snapshot 'www.tiktok.com'`
- https://www.tiktok.com/search/user?q=garmin%20running
  - Open/reuse: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh open 'https://www.tiktok.com/search/user?q=garmin%20running'`
  - Snapshot: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh snapshot 'www.tiktok.com'`
### Reddit
- https://www.reddit.com/user/AlarmingTradition961/submitted/
  - Open/reuse: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh open 'https://www.reddit.com/user/AlarmingTradition961/submitted/'`
  - Snapshot: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh snapshot 'www.reddit.com'`
- https://www.reddit.com/r/running/search/?q=zone%202&restrict_sr=1&sort=new
  - Open/reuse: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh open 'https://www.reddit.com/r/running/search/?q=zone%202&restrict_sr=1&sort=new'`
  - Snapshot: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh snapshot 'www.reddit.com'`
- https://www.reddit.com/r/Garmin/search/?q=heart%20rate%20running&restrict_sr=1&sort=new
  - Open/reuse: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh open 'https://www.reddit.com/r/Garmin/search/?q=heart%20rate%20running&restrict_sr=1&sort=new'`
  - Snapshot: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh snapshot 'www.reddit.com'`
- https://www.reddit.com/r/AppleWatch/search/?q=running%20heart%20rate&restrict_sr=1&sort=new
  - Open/reuse: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh open 'https://www.reddit.com/r/AppleWatch/search/?q=running%20heart%20rate&restrict_sr=1&sort=new'`
  - Snapshot: `/Users/mariusgaarder/Documents/treningscoach/scripts/social/clawbot-browser.sh snapshot 'www.reddit.com'`

## Approval Queue Template
| Priority | Platform | URL / Handle | Fit Reason | Proposed Action | Draft Text | Coachi Mention | Link | Status |
|---|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  | no | no | queued |
|  |  |  |  |  |  | no | no | queued |
|  |  |  |  |  |  | no | no | queued |
|  |  |  |  |  |  | no | no | queued |
|  |  |  |  |  |  | no | no | queued |
|  |  |  |  |  |  | no | no | queued |
|  |  |  |  |  |  | no | no | queued |
|  |  |  |  |  |  | no | no | queued |
|  |  |  |  |  |  | no | no | queued |
|  |  |  |  |  |  | no | no | queued |

## After Approval
Run the live executor only for an approved batch. Remember: it performs likes/follows immediately and stages comments by default.

```bash
/Users/mariusgaarder/Documents/treningscoach/scripts/social/execute-marketing-engagement.sh --date 2026-06-26 --platform all --mode stretch --inhouse-blocker 'growth:daily failed on run-todays-pack.sh --date 2026-06-26 --json; public actions remain approval-gated'
```

For final public comment/reply submission, only add this flag after explicit approval:

```bash
/Users/mariusgaarder/Documents/treningscoach/scripts/social/execute-marketing-engagement.sh --date 2026-06-26 --platform all --mode stretch --inhouse-blocker 'growth:daily failed on run-todays-pack.sh --date 2026-06-26 --json; public actions remain approval-gated' --publish-comments
```

## Manual Backup
If selectors are unstable, use the queue as a manual checklist in Chrome. Mark outcomes as `manually_posted`, `skipped`, `blocked_ui`, or `needs_retry`.

## Source Context
- Theme family: `generic_running`
- X pack: `/Volumes/Riot APFS/Agentmode/coachi-marketing/content/x-posts/2026-06-26-daily-pack.md`
- Instagram pack: `/Volumes/Riot APFS/Agentmode/coachi-marketing/content/Instagram/2026-06-26-daily-pack.md`
- TikTok pack: `/Volumes/Riot APFS/Agentmode/coachi-marketing/content/Tiktok/2026-06-26-daily-script.md`
- Reddit matrix: `/Volumes/Riot APFS/Agentmode/coachi-marketing/outputs/daily/2026-06-26-reddit-reply-matrix.md`
