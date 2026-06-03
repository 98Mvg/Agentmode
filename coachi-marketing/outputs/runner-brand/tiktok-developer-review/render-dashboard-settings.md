# Render Web Service Settings

Use a Render Web Service, not a Static Site.

The TikTok review flow now includes backend sandbox endpoints for creator_info, video.publish Direct Post, and status polling. A Static Site cannot serve these API routes.

## Dashboard Values

Name:

```text
everyday-runner-lab
```

Root Directory:

```text
coachi-marketing/outputs/runner-brand/tiktok-developer-review
```

Build Command:

```text
npm install --omit=dev
```

Start Command:

```text
npm start
```

Environment:

```text
NODE_VERSION=20
TIKTOK_API_MODE=sandbox
PUBLIC_BASE_URL=https://agentmode.onrender.com
TIKTOK_CLIENT_KEY=<sandbox client key from TikTok Developer>
```

Auto Deploy:

```text
No
```

## URLs After Deploy

Replace `<render-url>` with the URL Render gives you:

```text
https://<render-url>/
https://<render-url>/terms
https://<render-url>/privacy
https://<render-url>/login
https://<render-url>/connect-tiktok
https://<render-url>/post-to-tiktok
https://<render-url>/integrations/social/tiktok
```

Use these in TikTok Developer until you have a custom runner-brand domain.

For the current review package, use:

```text
https://agentmode.onrender.com/
https://agentmode.onrender.com/terms/
https://agentmode.onrender.com/privacy/
https://agentmode.onrender.com/login/
https://agentmode.onrender.com/connect-tiktok/
https://agentmode.onrender.com/sandbox-demo/
https://agentmode.onrender.com/post-to-tiktok/
https://agentmode.onrender.com/integrations/social/tiktok
```

## Why Not Use Coachi.no

The TikTok app is for the Everyday Runner Lab creator workflow, not for the Coachi app runtime. The app name, website title, Terms, Privacy, login entry point, redirect URI, demo video, and review explanation should all use `Everyday Runner Lab`.
