# 2026-06-25 Provider Token Deployment Handoff

Status: prepared only. No Render environment variables were changed, no deploy was triggered, and no public action was taken.

## Why This Matters

- Current Coachi `/app-store` redirects preserve Apple `ct` campaign tokens and `mt=8`, but omit Apple `pt` provider tokens.
- Coachi-side clicks are still measurable, but App Store Connect campaign attribution remains incomplete without `pt`.
- This is the measurement blocker for proving which App Store pushes contribute to the 10,000-download goal.

## Existing Runtime Support

- `/Users/mariusgaarder/Documents/treningscoach/web_routes.py` already passes a provider token through `/app-store` when `APP_STORE_CAMPAIGN_PROVIDER_TOKEN`, `APP_STORE_PROVIDER_TOKEN`, or a trusted `pt=` query value is present.
- `/Users/mariusgaarder/Documents/treningscoach/config.py` already defines `APP_STORE_CAMPAIGN_PROVIDER_TOKEN` with `APP_STORE_PROVIDER_TOKEN` as an alias.
- `/Users/mariusgaarder/Documents/treningscoach/tests_phaseb/test_web_blueprint_contract.py` already verifies that configured provider tokens are emitted in App Store redirects.
- `/Users/mariusgaarder/Documents/treningscoach/scripts/app_store_campaign_env_from_link.py` extracts the deploy env values from an App Store Connect campaign link and prints a no-write smoke command.
- `/Users/mariusgaarder/Documents/treningscoach/docs/checklists/app-store-campaign-link-kit.md` already documents the release and smoke gates.

## No-Secret Deployment Workflow

1. In App Store Connect Campaigns, create or copy a Coachi App Store campaign link that contains `pt=...&ct=...&mt=8`.
2. Run the local extractor with the full App Store Connect campaign link:

```bash
python3 /Users/mariusgaarder/Documents/treningscoach/scripts/app_store_campaign_env_from_link.py '<APP_STORE_CONNECT_CAMPAIGN_LINK_WITH_PT>'
```

3. Set the printed values in Render, especially `APP_STORE_CAMPAIGN_PROVIDER_TOKEN`.
4. Deploy or restart the Coachi web service.
5. Run the no-write production smoke from the app repo:

```bash
cd "/Users/mariusgaarder/Documents/treningscoach"
python3 scripts/smoke_app_store_acquisition.py \
  --base-url https://coachi.no \
  --require-provider-token \
  --expected-provider-token <provider-token> \
  --expected-aasa-app-id 74WYNBLYTQ.com.coachi.app
```

6. Rerun the marketing link verifier with the provider-token hard gate:

```bash
cd "/Volumes/Riot APFS/Agentmode/coachi-marketing"
npm run growth:verify-appstore-links -- \
  --input outputs/daily/2026-06-25-action-time-approval-packet.md \
  --require-provider-token \
  --out outputs/daily/2026-06-25-action-time-approval-packet-link-verification.json
```

7. Rerun readiness and goal status:

```bash
npm run growth:appstore-readiness -- \
  --queue outputs/daily/2026-06-24-post-execution-continuation-approval-queue.md \
  --expect-actions 2 \
  --preflight-out outputs/daily/2026-06-24-post-execution-continuation-preflight.json \
  --link-out outputs/daily/2026-06-24-post-execution-continuation-link-verification.json \
  --out outputs/daily/2026-06-24-post-execution-continuation-readiness.json

npm run growth:appstore-goal-status -- \
  --goal 10000 \
  --readiness outputs/daily/2026-06-24-post-execution-continuation-readiness.json \
  --out outputs/daily/2026-06-25-appstore-goal-status.json
```

## Artifact Hygiene

- `scripts/verify_appstore_campaign_links.mjs` validates provider-token presence from the raw redirect URL, then redacts `pt` values before returning results, printing console output, or writing JSON artifacts.
- A source URL fallback such as `?pt=<token>` is also redacted before it is stored in verifier output.
- Keep checking `provider_token_present`, not the literal token value, in marketing artifacts.

## Acceptance Criteria

- The production `/app-store` redirect includes `pt=<provider-token>`, `ct=<campaign>`, and `mt=8`.
- `growth:verify-appstore-links -- --require-provider-token` passes for the action-time approval packet.
- `growth:appstore-readiness` reports `provider_token_complete: true`.
- Link-verification output shows `pt=REDACTED` rather than the real provider-token value wherever a provider token exists.
- No provider-token value is committed to this repo, output artifacts, screenshots, or task notes.
- The 10,000-download goal remains incomplete until real `app_store_total_downloads >= 10000` is verified.
