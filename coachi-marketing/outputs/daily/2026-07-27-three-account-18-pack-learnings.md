# Three-account 18-pack learnings

Date: 2026-07-27

## Outcome

- Generated, production-QA checked, and sent `18` seven-slide packs through TikTok inbox handoff.
- Account split: `6` Main, `6` Runner Watch Lab, and `6` Road to Marathon Fit.
- Handoff result: `18` publish IDs, `0` failed, `0` pending.
- Focused regression suite: `44/44` passed.

## Learnings

1. Literal clarity beats extra specificity in Marathon hooks.
   Use `Top 5 running apps I use when running`. Do not add qualifiers such as
   `after 8 hard weeks` when they do not improve the viewer's understanding.

2. A transparent app ranking can mention Coachi without turning the account into
   an advertisement.
   Give every app one real job, keep Coachi at number `2` for in-run effort-drift
   guidance, show the full ranking on the final slide, and keep the profile bio
   as the conversion path.

3. Account lanes must stay visibly different.
   Main delivers broadly useful running behavior, Watch solves specific watch
   settings and product decisions, and Marathon tells personal challenge stories.

4. Semantic scoring taxonomy and duplicate taxonomy are different concerns.
   Keep a broad problem type for scoring, but persist a precise semantic problem
   type so unrelated decks that share common running words do not block each other.

5. Image orientation must be normalized before portrait cropping.
   Applying EXIF rotation first prevents sideways library images from reaching
   rendered decks and TikTok exports.

6. Batch-local selection logs are not enough after partial rerenders.
   A retained picklist can reintroduce an asset chosen by another pack. Run a
   final account-level selected-asset audit after rendering and before inbox
   handoff.

7. TikTok inbox capacity is a hard operational boundary.
   Six successful handoffs filled each account to `6/6`; the user must post or
   discard inbox items before another batch is sent.

## Evidence

- Batch manifest:
  `outputs/full-loop/2026-07-27-three-account-personal-6x/batch-manifest.json`
- Production preflight:
  `outputs/full-loop/2026-07-27-three-account-personal-6x/preflight-results.json`
- Upload results:
  `outputs/full-loop/2026-07-27-three-account-personal-6x/upload-main-results.json`
  `outputs/full-loop/2026-07-27-three-account-personal-6x/upload-watch-results.json`
  `outputs/full-loop/2026-07-27-three-account-personal-6x/upload-marathon-results.json`
