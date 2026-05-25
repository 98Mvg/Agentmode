# TikTok Review Demo Video Script

Goal: record a short review demo that shows Everyday Runner Lab as a creator-facing TikTok app with sandbox/mock Login Kit, Upload to TikTok, and Direct Post coverage.

Target length: `90-120 seconds`.

## Current Setup

- Public website: `https://everyday-runner-lab.onrender.com`
- Login entry: `https://everyday-runner-lab.onrender.com/login/`
- TikTok authorization entry: `https://everyday-runner-lab.onrender.com/connect-tiktok/`
- Sandbox/mock review flow: `https://everyday-runner-lab.onrender.com/sandbox-demo/`
- Direct Post flow: `https://everyday-runner-lab.onrender.com/post-to-tiktok/`
- Redirect URI: `https://everyday-runner-lab.onrender.com/integrations/social/tiktok`

Do not show `.env`, API keys, client secrets, OAuth tokens, Postiz admin, localhost URLs, internal integration IDs, or owned-account operations in the recording.

## Prepared Content

Use the original running slideshow preview already included in the public review site:

```text
site/uploads/easy-run-mistakes/
```

Use this editable title text in the demo:

```text
Top 5 easy run mistakes:

1. Starting too fast
2. Letting small surges add up
3. Forcing yesterday's pace
4. Racing the easy day
5. Calling medium-hard "easy"

#running #runtok #easyrun #runningtips
```

## One-Take Recording Steps

1. Start at `https://everyday-runner-lab.onrender.com`.
2. Show the public site name, Terms link, Privacy link, and Creator Login.
3. Open `Creator Login`.
4. Open `Connect TikTok`.
5. Show that `user.info.basic`, `video.upload`, and `video.publish` are requested and demonstrated.
6. Open the `Sandbox demo` page and show the mock OAuth/API responses.
7. Open `Post to TikTok`.
8. Show the connected creator identity, returned privacy options, and max duration.
9. Show the original running slideshow preview.
10. Edit the title field.
11. Manually select a privacy value. Do not leave it preselected.
12. Manually enable comments, Duet, or Stitch only if desired.
13. Toggle commercial content disclosure, show that a disclosure category is required, then choose the correct setting or turn it off.
14. Select the explicit TikTok Music Usage Confirmation consent checkbox.
15. Press `Upload as TikTok draft` and show `video.upload` status.
16. Reset the demo, press `Publish to TikTok`, and show `video.publish` processing status.

## Short Spoken Script

```text
This is Everyday Runner Lab, a web app for runners and fitness creators who publish their own original running education content to their connected TikTok account.

The creator starts from the public website, signs in with TikTok, and grants only the permissions needed for the demonstrated TikTok flow: user.info.basic, video.upload, and video.publish.

On the posting page, the creator can see which TikTok account is connected, preview the original slideshow, edit the title, manually choose privacy, choose interaction settings, complete commercial disclosure, and consent to TikTok's music usage terms.

The creator can either upload original media as a TikTok draft or use Direct Post. In both paths, content is sent to TikTok only after the creator reviews settings and confirms the action, and the app shows processing status after the request is submitted.
```

## Review Notes

- Do not mention Coachi.
- Do not mention Postiz.
- Do not show localhost.
- Do not say the app posts to owned, managed, or team accounts.
- Keep the app purpose as creator-controlled Direct Post for runners and fitness creators.
- If asked about testing mode, explain that the review demo uses safe sample content and shows the exact controls used before a production Direct Post request.
