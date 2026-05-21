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
A web app that helps runners and fitness creators create, preview, configure, and publish their own original TikTok training content.
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

Request only what the creator posting flow needs:

```text
user.info.basic
video.publish
```

## App Review Explanation

```text
Everyday Runner Lab is a creator-facing web app for runners and fitness creators who publish their own original running education content to their connected TikTok account. Creators open https://everyday-runner-lab.onrender.com, use Creator Login, authorize TikTok, review the connected TikTok creator account, preview original media, edit the post title, manually choose privacy, manually enable comments/Duet/Stitch if desired, complete commercial disclosure when applicable, consent to TikTok music usage terms, and then publish through Direct Post. We request user.info.basic to display the connected creator identity and video.publish to create the creator-approved TikTok post.
```

## Resubmission Reason

```text
Reworked the website, demo flow, and submission copy to show a creator-controlled Direct Post UX with account identity, preview, editable title, manual privacy, interaction controls, commercial disclosure, consent, and post status.
```

## Demo Video Checklist

Show the full flow:

1. Open the published runner-brand website.
2. Click the visible `Creator Login` or `Connect TikTok` entry point.
3. Open the creator workspace / Post to TikTok page.
4. OAuth into TikTok.
5. Grant only the requested scopes: `user.info.basic` and `video.publish`.
6. Show the connected creator identity and returned posting options.
7. Preview original slideshow/video media.
8. Edit the title, manually choose privacy, set comments/Duet/Stitch, complete disclosure, and consent.
9. Publish or simulate the Direct Post status flow and show processing status.

The demo should match the domain used in the TikTok Developer form.
