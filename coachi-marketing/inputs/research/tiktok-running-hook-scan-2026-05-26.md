# TikTok Running Hook Scan - 2026-05-26

Research-only pass using the Codex in-app browser on TikTok search result surfaces. No likes, follows, comments, or uploads were performed.

## Surfaces Scanned

- `beginner runner tips`
- `easy run tips`
- `zone 2 running`
- `heart rate running`
- `apple watch running tips`
- `garmin running tips`
- `running mistakes beginner`
- `run longer without stopping`
- `easy run too fast`
- `why are easy runs so hard`
- `zone 2 running beginner`
- `running heart rate too high`
- `apple watch heart rate zones running`
- `garmin heart rate zones running`
- `stop running too fast`
- `beginner runner cant run longer`

## Strong Source Patterns

| Pattern | Visible Signal | Source Surface | Coachi-safe adaptation |
| --- | ---: | --- | --- |
| Easy run as effort, not pace | 450 | `easy run too fast` | `Easy is effort, not pace` |
| Easy run proof trap | 208 | `easy run too fast` | `Not every run needs proof` |
| Ego pacing | 1.4K | `stop running too fast` | `Start slower than your ego` |
| Start-of-run deception | 445 | `why are easy runs so hard` | `The start of your run lies` |
| Easy run suddenly impossible | 104 | `why are easy runs so hard` | `Why easy runs turn impossible` |
| Zone 2 feels too slow | 30.8K | `zone 2 running beginner` | `Zone 2 feels wrong at first` |
| High HR at slow pace question | 964 | `running heart rate too high` | `Why heart rate spikes slow` |
| High HR normalization | 895 | `heart rate running` | `Slow pace can still spike` |
| Apple Watch zone setup utility | 24.8K | `apple watch heart rate zones running` | `Your watch needs context` |
| Garmin zone setup utility | 54.5K | `garmin heart rate zones running` | `Use alerts, not staring` |
| Cannot run without stopping | 24.1K | `run longer without stopping` | `It is not your fitness` |
| Beginner too-fast quitting risk | 3.5K | `beginner runner cant run longer` | `Running fast makes beginners quit` |

## Production Guidance

- Prefer 6-12 words when needed to preserve the source hook's question, contradiction, number, or felt runner problem.
- Favor real runner wording: `easy`, `slow`, `pace`, `watch`, `heart rate`, `walk`, `breath`, `effort`.
- Avoid copying exact creator wording. Use only the structure: direct pain, simple correction, then a practical running cue.
- Best new Coachi content lanes:
  - easy run effort ceiling
  - first 8-10 minutes lying to beginners
  - slow pace with high heart rate
  - watch-zone setup without watch staring
  - run-walk as pacing, not failure

## Promoted To Bank

- New hook families:
  - `easy_is_effort_not_pace`
  - `start_of_run_lies`
  - `slow_heart_rate_context`
  - `run_walk_approach_fix`
  - `watch_zone_context`
- New or expanded slide sets:
  - `easy_effort_not_pace_v1`
  - `not_every_run_needs_proof_v1`
  - `start_of_run_lies_v1`
  - `high_hr_slow_context_v1`
  - `not_fitness_approach_v1`
  - `watch_zone_context_v1`
