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
A web app for runners and fitness creators to preview, configure, and publish original TikTok training content.
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

App icon upload:

```text
outputs/runner-brand/tiktok-developer-review/site/assets/everyday-runner-lab-app-icon-1024.png
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
Content Posting API
```

Do not add products that are not used in the demo video.

## Scopes

Request only what the creator posting flow needs:

```text
video.publish
```

## App Review Explanation

```text
Everyday Runner Lab is a creator-facing web app for runners and fitness creators who publish their own original running education content to their connected TikTok account. This revision fixes the scope mismatch by requesting only Content Posting API Direct Post with the video.publish scope. The public review site and demo video now demonstrate the complete Direct Post sandbox flow end to end: creator opens https://everyday-runner-lab.onrender.com, chooses Creator Login, authorizes TikTok with only video.publish, returns to the app through the registered redirect URI, reviews the connected TikTok creator account through creator_info/query, previews original media, edits the post title, manually chooses privacy, manually enables comments/Duet/Stitch if desired, completes commercial disclosure when applicable, confirms TikTok music usage terms, and presses Publish to TikTok. The backend sandbox evidence panel shows API-shaped creator_info/query, video/init Direct Post, and status/fetch responses without exposing live tokens or posting real content.
```

## Resubmission Reason

```text
Fixed the scopes mismatch by reducing the review flow to one selected product and one demonstrated scope: Content Posting API Direct Post with video.publish. The updated website and demo video show the complete sandbox flow from TikTok authorization through creator_info/query, creator-selected settings, explicit consent, Direct Post video/init, and status/fetch polling.
```

## Demo Video Checklist

Show the full flow:

1. Open the published runner-brand website.
2. Click the visible `Creator Login` or `Connect TikTok` entry point.
3. Open the creator workspace / Post to TikTok page.
4. OAuth into TikTok or show the backend sandbox OAuth response.
5. Grant only the requested scope: `video.publish`.
6. Show the connected creator identity and returned posting options from `creator_info/query`.
7. Preview original slideshow/video media.
8. Edit the title, manually choose privacy, set comments/Duet/Stitch, complete disclosure, and consent.
9. Demonstrate `video.publish` with Direct Post status flow.
10. Show the backend API evidence panel after creator_info, video.publish, and status polling.

The demo should match the domain used in the TikTok Developer form.
