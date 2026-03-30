# Agentmode Activated Cloud Codex

Playwright browser automation packaged as normal repo code so Codex cloud can run it inside its own sandbox.

## Business goal
Give Codex cloud a ready-to-run browser automation repo: install dependencies, launch Playwright, visit websites, wait for page state, save screenshots, extract text, and execute guarded browser publish flows without depending on a local MCP server.

## What is in this repo
- `src/tasks/cloudTask.ts`: generic cloud task runner
- `src/scriptTask.ts`: scripted browser action engine used by the cloud runner
- `src/tasks/smoke.ts`: network-free Playwright smoke check
- `src/server.ts`: optional local MCP server for local Codex/App use
- `examples/`: ready-to-run publish scripts
- `content/`: example post bodies used by publish scripts
- `data/`: all browser binaries and artifacts

## Setup
```bash
npm install
npm run install:browsers
npm run build
```

The browser install step uses Playwright's `--with-deps` mode so Linux cloud environments pull the required browser system libraries automatically.

## Verify locally
```bash
npm test
npm run browser:smoke
npm run browser:task -- --url https://example.com --wait-for-text "Example Domain" --screenshot example.png --extract example.txt --run-label example
npm run browser:task -- --script-file examples/x-post.json --run-label x-dry-run
```

## Artifact locations
- Browser binaries: `data/pw-browsers`
- Run outputs: `data/runs/<run-label>`
- Screenshots and text outputs are written into the run folder

## Scripted browser runs
The same `browser:task` entrypoint now supports JSON action scripts.

Example dry run:
```bash
npm run browser:task -- --script-file examples/x-post.json --run-label x-dry-run
```

Example live publish:
```bash
npm run browser:task -- --script-file examples/x-post.json --run-label x-live --allow-live-publish
```

Supported step types:
- `goto`
- `waitForText`
- `waitForUrlContains`
- `waitForTarget`
- `click`
- `fill`
- `attachFile`
- `press`
- `sleep`
- `screenshot`
- `extract`
- `publish`

`publish` is guarded: it is skipped unless `--allow-live-publish` is present.

String values can reference secrets from the environment:
```json
{ "value": "{{env:X_TEST_USERNAME}}" }
```

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
5. For test-account social posting, add credentials as environment secrets and use the publish scripts:
   ```text
   Run `npm run browser:task -- --script-file examples/x-post.json --run-label x-test-dry-run` and return the preview screenshot path.
   ```

If a cloud run still complains that `--url` is required when using `--script-file`, the environment is on an older commit. Refresh the environment to the latest `main` before testing publish scripts.

## Recommended Codex cloud settings
- Enable internet access only for required domains.
- For browser login and publish flows, allow `POST` at minimum. Start with a dedicated test-only environment, then tighten domains and methods after the flow is stable.
- Review outputs and artifacts after every run.

## Why this works with Codex cloud
Codex cloud provisions an isolated sandbox per task with repo code and environment setup. This repo gives that sandbox everything it needs to run Playwright directly.
