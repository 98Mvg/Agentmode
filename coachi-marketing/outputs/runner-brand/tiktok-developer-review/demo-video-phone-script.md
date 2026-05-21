# TikTok Review Demo Video Script

Goal: record a short review demo that shows Everyday Runner Lab as a creator-facing Direct Post app, not an internal publishing tool.

Target length: `90-120 seconds`.

## Current Setup

- Public website: `https://everyday-runner-lab.onrender.com`
- Login entry: `https://everyday-runner-lab.onrender.com/login/`
- TikTok authorization entry: `https://everyday-runner-lab.onrender.com/connect-tiktok/`
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
5. Show that only `user.info.basic` and `video.publish` are requested.
6. Open `Post to TikTok`.
7. Show the connected creator identity, returned privacy options, and max duration.
8. Show the original running slideshow preview.
9. Edit the title field.
10. Manually select a privacy value. Do not leave it preselected.
11. Manually enable comments, Duet, or Stitch only if desired.
12. Toggle commercial content disclosure, show that a disclosure category is required, then choose the correct setting or turn it off.
13. Select the explicit TikTok Music Usage Confirmation consent checkbox.
14. Press `Publish to TikTok`.
15. Show the post status changing from initialization to upload/processing.

## Short Spoken Script

```text
This is Everyday Runner Lab, a web app for runners and fitness creators who publish their own original running education content to their connected TikTok account.

The creator starts from the public website, signs in with TikTok, and grants only the permissions needed for this Direct Post flow.

On the posting page, the creator can see which TikTok account is connected, preview the original slideshow, edit the title, manually choose privacy, choose interaction settings, complete commercial disclosure, and consent to TikTok's music usage terms.

The post is sent to TikTok only after the creator presses Publish, and the app shows processing status after the request is submitted.
```

## Review Notes

- Do not mention Coachi.
- Do not mention Postiz.
- Do not show localhost.
- Do not say the app posts to owned, managed, or team accounts.
- Keep the app purpose as creator-controlled Direct Post for runners and fitness creators.
- If asked about testing mode, explain that the review demo uses safe sample content and shows the exact controls used before a production Direct Post request.
