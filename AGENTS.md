# AGENTS.md

## Product
This repo packages Playwright browser automation so Codex cloud can run real browser tasks directly inside its sandbox.

## Goal
- Keep one runtime path for browser automation.
- Use Playwright directly from repo scripts for Codex cloud tasks.
- Keep artifacts in `data/`.
- Extend the existing `browser:task` runner rather than adding parallel task runners.

## Stack
- Node.js
- TypeScript
- Playwright
- Optional local MCP server for interactive local use

## Entry points
- Local MCP server: `src/server.ts`
- Cloud/browser task runner: `src/tasks/cloudTask.ts`
- Smoke test task: `src/tasks/smoke.ts`

## Setup
```bash
npm install
npm run install:browsers
npm run build
```

## Cloud task defaults
- Browser binaries live under `data/pw-browsers`
- Artifacts live under `data/runs`
- Internet access must be enabled in the Codex cloud environment for public websites
- Prefer `npm run browser:task -- --url <url> ...` over writing ad hoc browser code unless the task genuinely needs a new flow

## Useful commands
```bash
npm run browser:smoke
npm run browser:task -- --url https://example.com --wait-for-text "Example Domain" --screenshot smoke.png --extract smoke.txt
npm run browser:task -- --script-file examples/x-post.json --run-label x-dry-run
npm test
```
