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
https://<runner-brand-domain>/
```

Terms of Service URL:

```text
https://<runner-brand-domain>/terms
```

Privacy Policy URL:

```text
https://<runner-brand-domain>/privacy
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
Everyday Runner Lab is a web app for runners and fitness creators who create original TikTok training content. The flow lets a creator open the web app, connect TikTok with OAuth, grant the requested profile and content-posting scopes, upload or prepare original running slideshow/video content, and schedule or publish it to the connected TikTok account. We request user.info.basic/profile/stats to identify the connected creator account, video.list to show/manage TikTok content status, and video.upload/video.publish to upload and publish scheduled content.
```

## Demo Video Checklist

Show the full flow:

1. Open the published runner-brand website.
2. Open the creator workspace.
3. Click TikTok integration.
4. OAuth into TikTok.
5. Grant only the requested scopes.
6. Upload or select a slideshow/video.
7. Schedule or publish through Postiz.
8. Show the connected TikTok account/content result.

The demo should match the domain used in the TikTok Developer form.
