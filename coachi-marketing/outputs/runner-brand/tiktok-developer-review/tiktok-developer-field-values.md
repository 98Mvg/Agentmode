# TikTok Developer Field Values

Use these values for the non-Coachi runner-content TikTok app.

## Basic Information

App name:

```text
Everyday Runner Lab
```

Category:

```text
Health & Fitness
```

Description:

```text
Runner education account using Postiz to schedule original TikTok training tips and running content.
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
We use TikTok Login and Content Posting through Postiz to connect our owned Everyday Runner Lab TikTok account and schedule original running education content. Flow: admin opens Postiz, chooses TikTok integration, signs in with TikTok OAuth, grants video upload/publish and profile scopes, uploads or schedules original slideshow/video content, and Postiz publishes to the connected TikTok account. We request user.info.basic/profile/stats to identify the connected account in Postiz, video.list to view/manage published TikTok videos, and video.upload/video.publish to upload and publish scheduled content.
```

## Demo Video Checklist

Show the full flow:

1. Open the published runner-brand website.
2. Open Postiz.
3. Click TikTok integration.
4. OAuth into TikTok.
5. Grant only the requested scopes.
6. Upload or select a slideshow/video.
7. Schedule or publish through Postiz.
8. Show the connected TikTok account/content result.

The demo should match the domain used in the TikTok Developer form.
