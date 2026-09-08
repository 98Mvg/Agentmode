# Coachi Ad Director skill — scope and plan

Request, clarified during authoring: collaborate with Marius on the strategy and all meaningful ad details first, then produce/refine the agreed ad autonomously to a high-quality finish. One-shot is the execution stage, not a licence to invent an unapproved strategy. This turn changes skill/documentation only; no media generation, credential action, paid request, campaign mutation or commit.

- [x] Read skill-creator and existing cinematic-production instructions, project AGENTS, relevant lessons and current accepted production entrypoints.
- [x] Recon the existing local workflow and separate lasting preferences from single-campaign choices and superseded feedback.
- [x] Upgrade the single existing `coachi-cinematic-production` skill, with discoverable Ad Director metadata, concise operating instructions and targeted references.
- [x] Provide a reusable brief/shot/approval/QA template and six-file portable skill-only ZIP for the other account.
- [x] Validate structure, local reference paths, bundle parity and independent forward-test behavior on realistic short briefs; fix demonstrated gaps.
- [x] Sync Codebase_guide.MD/tasks/todo.md and record review/results; deliver invocation example and artifact paths.

## Business and behavior

Coachi sells audible, adaptive workout guidance, not another tracking dashboard. The viewer should understand one real job: stay at the right effort, recover without overdoing it, or follow intervals without mental counting. The skill develops a concrete cinematic strategy with Marius, locks the shot/product/audio/ending/budget details, then executes with internal iteration and verified handoff. One-shot is not skipping collaborative strategy, one model call, guaranteed performance, unbounded spending or implied publishing authority.

## Recon and architecture

Canonical repo: `/Volumes/Riot APFS/Agentmode` with active marketing checkout `coachi-marketing/`; legacy top-level archive is not a new output target. High-level tree inspected to content/video/generated, content/ads/{reference,prelaunch}, scripts, tasks, inputs and strategy. Stack: Node ES modules for orchestration/data, Python for editing/compositing, FFmpeg/Pillow/NumPy, Blender for device geometry, external Image2 and BytePlus video providers.

Production request path: current brief/approved assets and cost ledger -> reference/shot design -> bounded provider motion -> genuine local iOS screen preparation -> physical-phone compositor/Blender where useful -> existing `scripts/generate_social_videos.py` -> audio mastering -> versioned encoded review. Event path: job acceptance/ID -> same-job polling -> paid reservation/receipt -> source/visual/audio checks -> final local handoff -> separately authorized official TikTok upload/create/enable/review/reporting. No parallel renderer or campaign controller is needed.

Ten relevant files/areas:

1. `~/.codex/skills/coachi-cinematic-production/SKILL.md`: single installed instruction entrypoint being upgraded.
2. `~/.codex/skills/.system/skill-creator/SKILL.md`: authoring and forward-test method.
3. `tasks/lessons.md`: exact user correction patterns and known failure modes.
4. `scripts/generate_social_videos.py`: canonical rendering/editor entrypoint, default settings are not the paid-ad brief.
5. `content/video/generated/2026-09-07-native-captures/prepare_phones.py`: native captures and bounded source provenance.
6. `.../phones-hybrid-v1/compose_pilot.py`: shared photographic hand/device/UI perspective, rhythmic camera and tap indicators.
7. `.../phones-hybrid-v1/assemble_ads.py`: replaces phone windows while preserving locked film/audio.
8. `content/video/generated/2026-09-04-coachi-cinematic-v2/pilot/blender/build_phone.py`: physical device and source-validation gates.
9. `content/video/generated/2026-09-07-native-captures/phones-taps-v4/README.md`: exact approved V7/V13 exports, correction semantics and QA pointers.
10. `content/ads/prelaunch/2026-09-08-three-creative-rotation/README.md`: exact uploaded versions and separate launch-state authority.

## Risks and planned mitigations

- Existing skill has strong safety mechanics but lacks a complete taste/default/finish specification. Add a concise director workflow plus creative-quality reference and usable brief template.
- Long conversation contains contradictory ad numbers, older platforms/providers, outdated capture cutoffs and campaign-specific timings. Anchor by descriptive concept and current artifact; label benchmarks as examples, not evergreen instructions.
- One-shot phrasing could cause repeated approval stalls or uncontrolled spending. Separate in-budget autonomous creative decisions from missing material authority; no standing $20 allowance for future films and no automatic campaign launch.
- Generated device/skin/gesture and audio defects drove many feedback rounds. Add observable pre-batch and final playback gates, exact app state/actions and continuity/causality checks.
- Project AGENTS has generic Gemini/organic defaults that conflict with this paid-ad user's explicit Image2/BytePlus/Performance preferences. The new skill records scoped explicit paid-ad choices without rewriting unrelated organic policy.

## Verification plan

Run the bundled skill validator; parse UI metadata; resolve every packaged relative link; inspect all referenced code/artifact paths; evaluate at least two realistic requests with an independent agent (no paid/network/media/campaign actions). Test the prompt's actual decisions and deliverable plan, not only matching rule wording. Package only skill instructions/references/template, no media or secrets, and verify bundle contents against the installed skill.

## Review

Implemented in the existing installed skill, not a second director skill.64-line entrypoint routes to creative direction, production/finish gates and verified workspace anchors; template adds strategy version/approval and locked/delegated/unresolved decisions. User's clarification corrected the initial one-short-brief interpretation: collaborative strategy first, autonomous execution second. The same lesson is recorded in tasks/lessons.md, not in private memory.

Initial validation: bundled quick_validate PASS, UI YAML parses/description length/default invocation/implicit selection pass, four packaged Markdown links resolve,29workspace/code/media anchors exist, scoped diff check passes. Independent offline forward-test runs three realistic requests in a task-owned temporary directory. No provider calls, media generation, launch or payment are part of validation. Final outcome and portable bundle follow in the linked validation artifact.

Final review: all three independent behavioral cases passed; main inspected the full proposed responses/actions. A new strategy stays proposed until agreed, approved production proceeds without repetitive approval while preserving reservations/scope, and a nose-only revision resolves Stadium by name without changing accepted audio/cuts. Applied two narrow clarifications about the two work stages and re-encoded picture versus exact AAC evidence. Revalidated final skill. ZIP has six exact installed files,23,061bytes,CRC and SHA256verified; no media, keys or runtime code. Results and full evaluation: `outputs/skills/2026-09-08-coachi-ad-director/VALIDATION.md`. This proves instructions/dry-run behavior and package consistency, not a newly rendered ad or measured performance.

## Git handoff — separately requested after skill completion

User explicitly requested commit and push. The active `main` branch was refreshed from `origin/main` and already matched the remote; the apparent13-commit lead was a stale tracking ref. The shared checkout has thousands of unrelated pending files, so this handoff includes only the Ad Director skill's six readable files, its portable ZIP/validation/evaluation/manifest, this task record, and the matching guide/todo/lesson additions. Shared documentation is staged by owned section, not whole-file staging. No ad media, campaign/account snapshots, credentials, organic backlog or other pending code is included. Commit/push outcome is verified from Git after this scoped package is staged and checked.
