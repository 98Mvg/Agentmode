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

## Browser publish task
Use a dedicated test-account environment first. Add credentials as environment secrets and run a dry-run publish before enabling live clicks.

Example X dry run:
```text
Run `npm run browser:task -- --script-file examples/x-post.json --run-label x-dry-run` and return the preview screenshot path plus any missing-selector errors.
```

Example X live publish:
```text
Run `npm run browser:task -- --script-file examples/x-post.json --run-label x-live --allow-live-publish` and return the resulting URL, screenshots, and extracted page text.
```

Good first secrets:
- `X_TEST_USERNAME`
- `X_TEST_PASSWORD`
- `LINKEDIN_TEST_EMAIL`
- `LINKEDIN_TEST_PASSWORD`

For browser login and publish flows, allow `POST` requests at minimum in the Codex cloud environment.
