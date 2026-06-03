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
- `site/`: public pages served by the review web service with clean `/`, `/terms`, and `/privacy` paths.
- `site/login/`: visible creator login entry point for TikTok review.
- `site/connect-tiktok/`: visible TikTok authorization entry point.
- `site/sandbox-demo/`: explicit backend sandbox review flow that names the selected TikTok product and scope.
- `site/post-to-tiktok/`: reviewer-visible creator posting flow with Direct Post controls and backend API evidence.
- `server.mjs`: Node web service serving public pages plus `/api/tiktok/sandbox/*` review endpoints.
- `site/integrations/social/tiktok/`: redirect URI path to register in TikTok Developer, handled dynamically by `server.mjs`.
- `site/assets/everyday-runner-lab-app-icon-1024.png`: canonical app icon to upload in TikTok Basic Info and reuse on the website.
- `tests/sandbox-flow.test.mjs`: local backend verification for creator_info, video.publish Direct Post, and status polling.
- `demo-video-2026-05-25/everyday-runner-lab-tiktok-sandbox-review-demo-2026-05-25.mp4`: old review video; rebuild after deploying the backend sandbox flow.
- `build_review_demo_video.mjs`: reproducible local builder for the review video.
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
- Sandbox demo: `https://everyday-runner-lab.onrender.com/sandbox-demo/`
- Post flow: `https://everyday-runner-lab.onrender.com/post-to-tiktok/`
- Terms: `https://everyday-runner-lab.onrender.com/terms/`
- Privacy: `https://everyday-runner-lab.onrender.com/privacy/`
- Redirect URI: `https://everyday-runner-lab.onrender.com/integrations/social/tiktok`
- App icon: `site/assets/everyday-runner-lab-app-icon-1024.png`

## Remaining Before Review

- Publish these pages to a public domain.
- Verify the URL property in TikTok Developer.
- Upload the exact app icon at `site/assets/everyday-runner-lab-app-icon-1024.png`.
- Add only `Content Posting API` with `Direct Post`.
- Add only the scope demonstrated by the creator flow: `video.publish`.
- Deploy the package as a Render Web Service, not a Static Site.
- Upload a replacement demo video that shows the backend API evidence panel after creator_info, video.publish, and status polling.
- Save only after the fields match the published domain.

## Rejection Avoidance

- Do not frame the app as an internal publishing tool.
- Do not say the app posts to owned/team-managed accounts.
- Do not show `localhost`, Postiz admin, `.env`, client secrets, tokens, or internal account IDs in the review video.
- Show a creator manually selecting privacy before posting.
- Show comments, Duet, and Stitch starting off and being manually enabled only if the creator chooses.
- Show commercial disclosure controls and the resulting TikTok label state.
- Show explicit consent before publishing.
- Show `video.publish` as the creator-approved Direct Post path, including the backend request/response evidence.
- Show post-processing status after the publish action through `/api/tiktok/sandbox/status`.
- Keep the same app icon visible in TikTok Basic Info, website favicon links, and the top/header of the public site, Terms page, and Privacy page.
