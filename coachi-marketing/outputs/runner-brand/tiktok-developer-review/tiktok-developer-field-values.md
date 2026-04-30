# TikTok Developer Field Values

Use these values for the non-Coachi runner creator TikTok app.

## Basic Information

App name:

```text
Everyday Runner Lab
```

Category:

```text
Productivity
```

Description:

```text
A web app that helps runners and fitness creators create, preview, and schedule original TikTok training content.
```

Platform:

```text
Web
```

Web/Desktop URL:

```text
https://everyday-runner-lab.onrender.com/
```

Terms of Service URL:

```text
https://everyday-runner-lab.onrender.com/terms/
```

Privacy Policy URL:

```text
https://everyday-runner-lab.onrender.com/privacy/
```

Login page / creator entry point:

```text
https://everyday-runner-lab.onrender.com/login/
```

TikTok redirect URI:

```text
https://everyday-runner-lab.onrender.com/integrations/social/tiktok
```

## Products

Add:

```text
Login Kit
Content Posting API
```

Do not add products that are not used in the demo video.

## Scopes

Request only what Postiz needs:

```text
user.info.basic
user.info.profile
user.info.stats
video.list
video.upload
video.publish
```

## App Review Explanation

```text
Everyday Runner Lab is a web app for runners and fitness creators who create original TikTok training content. Creators open https://everyday-runner-lab.onrender.com, use the visible Creator Login entry point, connect TikTok with OAuth, grant the requested profile and content-posting scopes, upload or prepare original running slideshow/video content, and publish or schedule it to the connected TikTok account. We request user.info.basic/profile/stats to identify the connected creator account, video.list to show/manage TikTok content status, and video.upload/video.publish to upload and publish scheduled content.
```

## Resubmission Reason

```text
Updated app name, website URL, login entry, Terms, Privacy, and redirect URI so all surfaces use Everyday Runner Lab consistently.
```

## Demo Video Checklist

Show the full flow:

1. Open the published runner-brand website.
2. Click the visible `Creator Login` or `Connect TikTok` entry point.
3. Open the creator workspace / TikTok integration.
4. OAuth into TikTok.
5. Grant only the requested scopes.
6. Upload or select a slideshow/video.
7. Schedule or publish through Postiz.
8. Show the connected TikTok account/content result.

The demo should match the domain used in the TikTok Developer form.
