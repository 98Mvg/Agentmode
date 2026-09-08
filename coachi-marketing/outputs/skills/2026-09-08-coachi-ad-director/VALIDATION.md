# Coachi Ad Director — skill validation

Installed single source: `/Users/mariusgaarder/.codex/skills/coachi-cinematic-production/`.

Requested behavior: collaboratively agree strategy and meaningful details, then autonomously produce/refine the approved ad to the stated quality gates. Do not skip strategy or require repeated clip approvals. The latest clarification is reflected in the entrypoint, UI prompt, creative guide, production gates and brief template.

## Static checks

- Skill-creator `quick_validate.py`: PASS.
- UI metadata YAML parse,25–64character short description, explicit `$coachi-cinematic-production` in default prompt and retained implicit invocation: PASS.
- Six skill files; all four routed relative Markdown links resolve: PASS.
-29existing referenced code/media/QA discovery anchors checked: all exist. Externally referenced X URL and recording are locators, not new playback/rights proof.
- Existing provider/editor architecture reused; no executable skill helper or alternate renderer added. No credentials, bearer links, private media or app code included in the skill.
- Scoped `git diff --check`: PASS before final packaging.

## Behavioral test

Independent agent received only the skill and synthetic requests in `/tmp/coachi-ad-skill-eval-uoRtG18m/requests.md`, no authoring conclusions. Main inspected the full [forward-test outputs](forward-test-results.md). No network, media audit, generation, payment, campaign or credential actions occurred.

All three behavioral cases pass:

1. Unapproved strategy: proposes a complete timecoded father/recovery concept without copying tunnel/mountains; keeps actor/story/cue/track/cost choices proposed, audits real sources before one production approval, and does not invent a budget or claim reference playback.
2. Approved strategy: accepts v3 without repeating approval; keeps uncertainUS$14reserved underUS$20cap and calculatesUS$6headroom; reuses approved assets, preserves correct controls/cue causality/disclosed watch examples, chooses no unsolicited music variants and makes no launch plan. Pauses only for a real incompatible approved timing or missing dependency, while other work can continue.
3. Narrow revision: targets Stadium V7 by name, excludes Recovery, proposes only tracked local nose grading and preserved timing/phone/cues/audio; does not inherit the other case's budget or generation authority. Explicitly distinguishes exact AAC from re-encoded picture differences.

No material contradiction. Two demonstrated clarity improvements were applied: describe the two work stages plus approval/handoff precisely, and make picture-content versus encoded-byte preservation explicit. The final structural check and bundle parity were repeated after these narrow changes. These are offline proposed responses/actions, not a newly produced ad or verified media playback.

## Portable package

Portable archive: [coachi-cinematic-production.zip](coachi-cinematic-production.zip),23,061bytes, SHA256`665c45049c34aa8737fcc806c9e7ab54a56922bb606d97b16638dbe332905082`. ZIP CRC check passes, exact six-file allowlist passes, every file is byte-identical to the installed skill. No hidden files, keys, private media or extra code are included. Per-file hashes are in [BUNDLE_MANIFEST.json](BUNDLE_MANIFEST.json).

Copy the enclosed `coachi-cinematic-production/` folder into the other account's normal skills directory; project files/media and authorized tools/credentials remain separate prerequisites. Do not treat old approvals or workspace paths as active provider access. The working entrypoint is `SKILL.md`, with all three references, the brief template and UI metadata carried together.

This validates skill structure and dry-run decisions, not a newly rendered ad, guaranteed one-pass satisfaction or measured conversion uplift.
