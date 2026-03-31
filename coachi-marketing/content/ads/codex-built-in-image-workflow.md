# Coachi One-Image-First Workflow

## Purpose

Use Codex's built-in image generation path to create one strong Coachi-native social image at a time, review it, iterate once if needed, and save only the selected final.

If the built-in image tool is unavailable in-session, use the Gemini CLI fallback:
- [gemini-flash-2.5-cli-workflow.md](/Users/mariusgaarder/Documents/treningscoach/tmp/agentmode-cloud/coachi-marketing/content/ads/gemini-flash-2.5-cli-workflow.md)

For the Coachi marketing workspace, this is the secondary image path. The default saved-image workflow is `🧩 1. CLI (Command Line Interface)` with Gemini 2.5 Flash Image.

This workflow is for:
- X image posts
- Instagram single-image posts
- Instagram carousel opener slides
- TikTok / Reels cover frames

This workflow is not for:
- UI mockups
- screenshots of the app
- text-heavy graphics that should be built in Canva/Figma

## Why One Image First

Do not generate five assets at once unless the first one is already working.

Best Coachi process:
1. pick one runner problem
2. generate one image
3. review it against Coachi positioning
4. adjust once
5. only then expand into a batch or campaign family

This keeps the work specific and avoids generic "fitness app" images.

## Coachi Positioning Filter

Every image should reinforce:
- Coachi is an AI coach, not a tracking app
- the image should feel like a real running moment
- the strongest emotional trigger is relief from uncertainty during the run

If the image could belong to any generic fitness brand, reject it.

## Best First Concepts

Start with one of these:

### 1. Stop checking your watch
- strongest category separation
- best for X and Instagram
- best for traffic to `Coachi.no`

### 2. Your easy run wasn't easy
- strongest self-recognition
- best for runner pain
- best for educational posts

### 3. Busy adults need simplicity
- best for broader lifestyle positioning
- best for trust + conversion

## Built-In Codex Prompt Pattern

Use a prompt like this:

```text
Generate a premium realistic vertical social image for Coachi, an AI running coach app.

Concept: Stop checking your watch every 20 seconds.

Scene: a runner outdoors mid-run, repeatedly glancing at their watch with visible frustration and uncertainty.

Brand position: Coachi is an AI coach, not a tracking app.

Style: premium realistic fitness photography, cinematic but believable, emotionally sharp, not generic stock-photo energy.

Constraints:
- no app UI
- no text on image
- no logos from other brands
- do not make it look like a smartwatch advertisement
- focus on one clear runner problem: too much checking, too much guessing, not enough coaching
```

## Review Checklist

Reject the image if any of these are true:
- it looks like a sportswear ad instead of a running-coaching moment
- the subject looks like a generic gym influencer
- the scene feels staged, luxury, or aspirational in the wrong way
- the image sells hardware more than coaching
- the emotion is too broad instead of one specific runner problem

Approve the image if:
- one clear runner moment is obvious immediately
- the subject feels believable
- the image supports a strong text overlay later
- it feels premium without looking fake
- it clearly supports traffic-driving copy for `Coachi.no`

## Save Rule

If the generated image is only a preview, it can stay in Codex's default generated-images area.

If it is a selected Coachi asset, move or copy it into:

`/Users/mariusgaarder/Documents/treningscoach/tmp/agentmode-cloud/coachi-marketing/content/ads/generated`

Use filenames like:
- `watch-check-v1.png`
- `easy-run-v1.png`
- `busy-adult-v1.png`

Do not overwrite an existing winner unless the new version is intentionally replacing it.

## Continuity Rule

- Reuse strong running images for content before creating new ones.
- If you are creating a related Instagram + TikTok organic set, keep the same face across the visuals.
- If you are creating ads, different faces are acceptable.

## Post-Generation Workflow

After selecting an image:
1. store the final image in `content/ads/generated`
2. pair it with one Coachi-specific caption
3. add overlay text outside Codex if needed
4. keep one pain, one promise, one CTA

## Best First Test

Use this first:

```text
Generate a premium realistic vertical social image for Coachi, an AI running coach app. A runner is mid-run and keeps glancing at their watch with visible frustration and uncertainty. Show movement, tension, and the feeling of too much checking and not enough coaching. Modern outdoor setting, premium fitness brand, realistic not generic. No text. No app UI.
```

If the first image is strong, extend the same concept into:
- X post image
- Instagram carousel opener
- TikTok cover image

## Expansion Rule

Only scale to a 5-image batch after one single image is clearly on-brand.

When expanding:
- reuse the same core emotional moment
- vary only framing or context
- do not change category message mid-batch

## Coachi-Specific Reminder

Do not generate "AI app" visuals.
Do not generate dashboard visuals.
Do not generate fake app-store screenshots.

Generate the runner moment.
The copy will do the rest.
