# Codex Cloud Setup

## Environment setup script
```bash
npm install
npm run install:browsers
npm run build
```

## Internet access
For public web automation, enable internet access in the Codex cloud environment and allow only the domains you need.

Good default allowlist for this repo:
- common dependency domains preset
- the target site domains you want the browser to visit

## First cloud task
```text
Run `npm run browser:smoke` and confirm that Playwright starts successfully and writes artifacts under data/runs/smoke.
```

## First external-site task
```text
Run `npm run browser:task -- --url https://example.com --wait-for-text "Example Domain" --screenshot example.png --extract example.txt --run-label example` and summarize the page.
```
