# Coachi Growth Command

## Purpose
Use one command to prepare the daily Coachi social growth loop across X, Reddit, TikTok, and Instagram.

The command is:

```bash
npm run growth:daily -- --date YYYY-MM-DD --mode minimum --execute --open
```

Use `--mode stretch` when there is enough time for the full engagement quota.

## Source Of Truth
Use this hierarchy when files disagree:

1. `AGENTS.md` owns role, channel rules, safety boundaries, and source hierarchy.
2. `inputs/performance/WINNER_LIBRARY.md` and `inputs/research/reddit-winning-language-bank.md` own what is currently working.
3. `scripts/daily_generation.md` owns daily execution requirements.
4. `strategy/channels/14-day-social-engine.md` owns the theme backlog and 3-day execution window.
5. `strategy/automation/tiktok-instagram-slideshow-content-engine/README.md` owns the TikTok/Instagram slideshow production path.
6. Dated output files under `outputs/daily/` and `outputs/social-loop/` are run records, not strategy truth.

## What The Command Does
`npm run growth:daily` runs the daily growth operating system:

1. Validates the required source-of-truth files.
2. Selects the latest ready 8-slide TikTok/Instagram slideshow deck, unless `--deck` is provided.
3. Builds a daily target plan for X, Reddit, TikTok, and Instagram.
4. Builds a ranked engagement candidate queue with platform-specific scoring and dedupe.
5. Integrates the slideshow handoff through `scripts/slideshow_social_loop_4h.sh`.
6. Integrates the engagement plan through the app repo `social-coordinator.sh`.
7. Writes a machine-readable manifest and a human run note to `outputs/daily/`.
8. With `--execute`, performs safe local prep and browser handoff.

## Safety Boundary
The command can automate local preparation:

- validate slideshow engine
- select deck
- export/copy post-ready assets
- prepare captions and hashtags
- write ranked engagement candidates
- dedupe against the engagement ledger
- stage context-aware comment/reply drafts
- open browser surfaces
- log what needs to happen next

The command must not click final public actions:

- TikTok or Instagram final Share/Post
- X final Post, Reply, Repost
- Reddit final Comment/Post
- public likes
- public follows
- public shares

Those actions require visible target review and action-time approval.

## Engagement Candidate Queue
Every `growth:daily` run writes:

```text
outputs/daily/YYYY-MM-DD-engagement-candidates.json
```

The queue is the source for X, Reddit, TikTok, and Instagram engagement handoff.

Each candidate includes platform, action type, target/search URL, topic, audience fit, draft text, score, risk flags, duplicate status, and public-action gate.

The current ledger is:

```text
inputs/performance/engagement-ledger.json
```

Use it to prevent repeating the same URL, handle, topic/action pair, or Reddit thread during the cooldown window.

Build only the candidate queue with:

```bash
npm run growth:engagement-candidates -- --date YYYY-MM-DD --mode minimum --platform all
```

Log completed or prepared actions with:

```bash
npm run growth:log-engagement -- --platform x --action reply --url https://x.com/... --status posted
```

Public actions remain manual even when the queue is prepared.

## Recommended Daily Commands
Dry-run the plan:

```bash
npm run growth:daily -- --date YYYY-MM-DD --mode minimum --dry-run
```

Prepare the minimum daily loop:

```bash
npm run growth:daily -- --date YYYY-MM-DD --mode minimum --execute --open
```

Prepare the stretch loop:

```bash
npm run growth:daily -- --date YYYY-MM-DD --mode stretch --execute --open
```

Use a specific slideshow deck:

```bash
npm run growth:daily -- --date YYYY-MM-DD --mode minimum --deck /Volumes/Riot\ APFS/Agentmode/coachi-marketing/content/slideshows/SLUG --execute --open
```

Skip slideshow work and only prepare cross-social state:

```bash
npm run growth:daily -- --date YYYY-MM-DD --mode minimum --skip-slideshow --execute
```

## Four-Hour Engagement Loop
Install the canonical 4-hour growth loop:

```bash
npm run growth:loop -- install --mode minimum --interval-seconds 14400
```

Install it with browser surfaces opened on each run:

```bash
npm run growth:loop -- install --mode minimum --interval-seconds 14400 --open
```

Run the 4-hour loop once immediately:

```bash
npm run growth:loop -- run-now --mode minimum
```

Check status:

```bash
npm run growth:loop -- status
```

Stop the loop:

```bash
npm run growth:loop -- uninstall
```

This loop calls `growth:daily` every 4 hours. It replaces using the slideshow-only loop as the main scheduler.
The installed loop always passes `--cadence-guard`, so it does not repeat the full daily quota every 4 hours.

Cadence guard defaults:

- Minimum mode: max `1` TikTok/Instagram content handoff per day.
- Stretch mode: max `2` TikTok handoffs per day and max `1` Instagram handoff per day at the scheduling layer.
- Every 4-hour run can still prepare research, replies, and engagement plans.
- Every 4-hour run writes a fresh candidate queue and should pull from unblocked candidates before broad browsing.
- Public posts, comments, likes, follows, replies, reposts, and Reddit submissions remain gated.

Codex in-app automation prompt:

- Use `strategy/automation/codex-growth-loop-automation.md` if creating this as a Codex automation.
- If the Codex automation tool is unavailable, keep the `growth:loop` LaunchAgent installed as the active scheduler.

## Minimum Daily Targets
- X: `3` posts, `5` likes, `3` follows, `1` thoughtful reply.
- TikTok: `1` post, `5` likes, `3` follows, `3` comments, `1` larger-video comment.
- Instagram: `1` post, `1-3` stories, `5` likes, `3` follows, `3` comments.
- Reddit: review `2-3` threads, leave `2` useful replies, create `0` posts unless subreddit fit is clean.

## Stretch Daily Targets
- X: `3` posts, `15` likes, `10` follows, `1` thoughtful reply, `1` repost.
- TikTok: `1` post, `15` likes, `10` follows, `10` comments, `5` comment replies.
- Instagram: `1` post, `3-6` stories, `15` likes, `10` follows, `10` comments, `5` replies.
- Reddit: review `4-6` threads, leave `2-4` useful replies, create `0-1` posts only when subreddit fit is clean.

## Integration Notes
- `growth:daily` is the canonical top-level command.
- `growth:engagement-candidates` is the queue builder used by the canonical command.
- `growth:log-engagement` is the ledger writer used after approved public actions or staged drafts.
- `slideshow:social-loop` remains a component command for TikTok/Instagram slideshow prep and browser handoff.
- `slideshow:pipeline` remains the generation command for building a new deck.
- `social-coordinator.sh` remains the cross-social state generator.

Do not create another daily engagement command unless it wraps this command or replaces it intentionally.
