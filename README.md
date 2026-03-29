# Agentmode Activated Cloud Codex

Playwright browser automation packaged as normal repo code so Codex cloud can run it inside its own sandbox.

## Business goal
Give Codex cloud a ready-to-run browser automation repo: install dependencies, launch Playwright, visit websites, wait for page state, save screenshots, and extract text without depending on a local MCP server.

## What is in this repo
- `src/tasks/cloudTask.ts`: generic cloud task runner
- `src/tasks/smoke.ts`: network-free Playwright smoke check
- `src/server.ts`: optional local MCP server for local Codex/App use
- `data/`: all browser binaries and artifacts

## Setup
```bash
npm install
npm run install:browsers
npm run build
```

## Verify locally
```bash
npm test
npm run browser:smoke
npm run browser:task -- --url https://example.com --wait-for-text "Example Domain" --screenshot example.png --extract example.txt --run-label example
```

## Artifact locations
- Browser binaries: `data/pw-browsers`
- Run outputs: `data/runs/<run-label>`
- Screenshots and text outputs are written into the run folder

## Run in Codex cloud
1. Connect the GitHub repo in Codex cloud.
2. Create an environment with setup:
   ```bash
   npm install
   npm run install:browsers
   npm run build
   ```
3. Enable internet access for the environment if the task needs external sites.
4. Ask Codex cloud to run browser tasks through the repo, for example:
   ```text
   Run `npm run browser:task -- --url https://example.com --wait-for-text "Example Domain" --screenshot example.png --extract example.txt --run-label example` and summarize the extracted text.
   ```

## Recommended Codex cloud settings
- Enable internet access only for required domains.
- Keep HTTP methods restricted to `GET`, `HEAD`, and `OPTIONS` unless the task truly needs more.
- Review outputs and artifacts after every run.

## Why this works with Codex cloud
Codex cloud provisions an isolated sandbox per task with repo code and environment setup. This repo gives that sandbox everything it needs to run Playwright directly.
