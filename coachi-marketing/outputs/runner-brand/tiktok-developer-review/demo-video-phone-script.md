# TikTok Review Demo Video - Phone Filming Script

Goal: record a short sandbox demo that shows Everyday Runner Lab using Postiz to connect TikTok and prepare original running slideshow content.

Target length: `90-120 seconds`.

## Current Setup

- Public website: `https://everyday-runner-lab.onrender.com`
- Postiz local admin: `http://localhost:4007/launches?startDate=2026-04-29&endDate=2026-04-29&display=day`
- TikTok app mode for demo: Sandbox
- Sandbox client key loaded in Postiz: `sbawircemd3st9h6dc`
- Connected channel: `Everyday Runner Lab`
- TikTok integration id: `cmoikbpne0001q96s054598iz`
- Privacy to show in posting settings: `SELF_ONLY`

Do not show `.env`, API keys, or client secrets in the recording.

## Prepared Content

Use the rendered slideshow assets in:

```text
/Volumes/Riot APFS/Agentmode/coachi-marketing/outputs/live-tests/production-credential-test-packs/2026-04-28-top-5-easy-run-mistakes/slides/rendered
```

Use this caption if you need to paste text:

```text
Top 5 easy run mistakes:

1. Starting too fast
2. Letting small surges add up
3. Forcing yesterday's pace
4. Racing the easy day
5. Calling medium-hard "easy"

Comment "easy" if this happens to you.

#running #runtok #easyrun #runningtips #marathontraining #beginnerrunner #runcoach #runmotivation
```

## One-Take Recording Steps

1. Start at `https://everyday-runner-lab.onrender.com`.
2. Show the site name and the line explaining that Everyday Runner Lab uses Postiz to schedule original TikTok content.
3. Go to `http://localhost:4007/launches?startDate=2026-04-29&endDate=2026-04-29&display=day`.
4. Show Postiz Calendar and the `Everyday Runner Lab` TikTok channel in the left sidebar.
5. Click `Add Channel`.
6. Click `Tiktok`.
7. If TikTok OAuth appears, show the sandbox authorization screen and scopes, then approve.
8. If TikTok auto-redirects, show the URL contains `client_key=sbawircemd3st9h6dc` and returns to `Channel Updated`.
9. Back in Postiz, click `Create Post`.
10. Show the selected TikTok channel, add the prepared caption, and attach/select the prepared slideshow images.
11. Show settings: TikTok, `SELF_ONLY`, comments allowed, AI-generated content flag enabled if visible.
12. Stop before final public posting if unsure. For review, it is enough to show the sandbox integration flow and the prepared scheduling screen.

## Short Spoken Script

```text
This is Everyday Runner Lab, a web app for runners and fitness creators.

Creators use the Everyday Runner Lab creator workspace to connect TikTok and prepare original running education content.

I am connecting TikTok through the sandbox app, using TikTok Login and the Content Posting API scopes.

After OAuth, Postiz shows the connected Everyday Runner Lab TikTok channel.

Then I prepare an original running slideshow, add the caption and hashtags, keep privacy set to SELF_ONLY for sandbox testing, and schedule it through Postiz.
```

## Review Notes

- Keep products/scopes limited to what the video shows: Login Kit + Content Posting API.
- If the reviewer needs public posting, explain that sandbox/unaudited testing uses `SELF_ONLY`.
- If you show `localhost`, also show the public Everyday Runner Lab domain at the start of the video.
- Do not mention Coachi; this TikTok app is for Everyday Runner Lab runner content.
