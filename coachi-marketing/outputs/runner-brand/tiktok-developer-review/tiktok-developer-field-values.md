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
Login Kit
Content Posting API
```

Do not add products that are not used in the demo video.

## Scopes

Request only what the creator posting flow needs:

```text
user.info.basic
video.upload
video.publish
```

## App Review Explanation

```text
Everyday Runner Lab is a creator-facing web app for runners and fitness creators who publish their own original running education content to their connected TikTok account. This revision fixes icon consistency by using the same app icon in TikTok Basic Info, the website favicon, and the visible header/top of the public website, Terms page, and Privacy page. Creators open https://everyday-runner-lab.onrender.com, use Creator Login, authorize TikTok in the sandbox/mock review flow, review the connected TikTok creator account, preview original media, edit the post title, manually choose privacy, manually enable comments/Duet/Stitch if desired, complete commercial disclosure when applicable, consent to TikTok music usage terms, and choose either Upload as TikTok draft or Direct Post. We use user.info.basic to display the connected creator identity, video.upload for creator-approved draft upload, and video.publish for creator-approved Direct Post.
```

## Resubmission Reason

```text
Fixed the app icon mismatch by using one 1024px Everyday Runner Lab icon for the TikTok Basic Info upload, favicon, and visible website/Terms/Privacy headers. Added a sandbox/mock review page and replacement 72-second demo video that clearly demonstrates Login Kit, Content Posting API, user.info.basic, video.upload, video.publish, creator settings, disclosure, consent, and post status.
```

## Demo Video Checklist

Show the full flow:

1. Open the published runner-brand website.
2. Click the visible `Creator Login` or `Connect TikTok` entry point.
3. Open the creator workspace / Post to TikTok page.
4. OAuth into TikTok or show the sandbox/mock OAuth response.
5. Grant only the requested scopes: `user.info.basic`, `video.upload`, and `video.publish`.
6. Show the connected creator identity and returned posting options.
7. Preview original slideshow/video media.
8. Edit the title, manually choose privacy, set comments/Duet/Stitch, complete disclosure, and consent.
9. Demonstrate `video.upload` with Upload as TikTok draft.
10. Demonstrate `video.publish` with Direct Post status flow.

The demo should match the domain used in the TikTok Developer form.
