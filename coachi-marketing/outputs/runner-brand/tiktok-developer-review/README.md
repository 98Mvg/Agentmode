# Everyday Runner Lab TikTok Developer Review Package

Purpose: configure TikTok Developer for a runner creator workflow.

This package is intentionally separate from Coachi app/runtime. Use it for the TikTok developer app that lets runners and fitness creators connect TikTok, prepare original running education content, choose Direct Post settings, and publish creator-approved posts from a creator workspace.

## Required Public URLs

TikTok requires public, verified URLs before review:

- Landing page: `https://<runner-brand-domain>/`
- Terms: `https://<runner-brand-domain>/terms`
- Privacy: `https://<runner-brand-domain>/privacy`

Do not submit review with `localhost` URLs or Postiz/admin-only screens. If no runner-brand domain exists yet, publish the included static pages to a small Render static site or another owned domain first.

## Files

- `landing.html`: simple public landing page.
- `terms.html`: lightweight terms page for the runner content brand.
- `privacy.html`: lightweight privacy page.
- `site/`: deploy-ready static site with clean `/`, `/terms`, and `/privacy` paths.
- `site/login/`: visible creator login entry point for TikTok review.
- `site/connect-tiktok/`: visible TikTok authorization entry point.
- `site/post-to-tiktok/`: reviewer-visible creator posting flow with Direct Post controls.
- `site/integrations/social/tiktok/`: redirect URI path to register in TikTok Developer.
- `render-dashboard-settings.md`: exact Render setup values.
- `tiktok-developer-field-values.md`: exact TikTok Developer form values.

## Review Positioning

The TikTok app should not say it is connected to Coachi or the Coachi iOS app.

Correct framing:

> Everyday Runner Lab is a web app that helps runners and fitness creators create, preview, configure, and publish their own original TikTok training content.

Reviewer consistency rule:

- App name: `Everyday Runner Lab`
- Website title: `Everyday Runner Lab | TikTok Creator Workspace`
- Website URL: `https://everyday-runner-lab.onrender.com/`
- Login entry: `https://everyday-runner-lab.onrender.com/login/`
- Post flow: `https://everyday-runner-lab.onrender.com/post-to-tiktok/`
- Terms: `https://everyday-runner-lab.onrender.com/terms/`
- Privacy: `https://everyday-runner-lab.onrender.com/privacy/`
- Redirect URI: `https://everyday-runner-lab.onrender.com/integrations/social/tiktok`

## Remaining Before Review

- Publish these pages to a public domain.
- Verify the URL property in TikTok Developer.
- Upload app icon.
- Add `Login Kit` and `Content Posting API`.
- Add only the scopes required by the creator Direct Post flow: `user.info.basic` and `video.publish`.
- Upload a demo video showing the exact Everyday Runner Lab -> TikTok connection and creator Direct Post flow.
- Save only after the fields match the published domain.

## Rejection Avoidance

- Do not frame the app as an internal publishing tool.
- Do not say the app posts to owned/team-managed accounts.
- Do not show `localhost`, Postiz admin, `.env`, client secrets, tokens, or internal account IDs in the review video.
- Show a creator manually selecting privacy before posting.
- Show comments, Duet, and Stitch starting off and being manually enabled only if the creator chooses.
- Show commercial disclosure controls and the resulting TikTok label state.
- Show explicit consent before publishing.
- Show post-processing status after the publish action.
