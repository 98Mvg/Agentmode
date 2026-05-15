# Images 2.0 Hook Prompt

Production rule: generate exactly ONE image for slide 1.
Do not generate slides 2-7 with Images 2.0.
Do not create an 8-slide deck.
Do not add text to the image.

## Output
- One vertical 9:16 photorealistic image
- No baked-in text
- No logos
- No app UI
- Leave clean negative space for local overlay text
- Save final file as: slides/source/01-hook.png

## Hook Text Added Later By Compositor
Stop checking the watch

## TikTok-Proven Text Source
- Text bank: inputs/research/tiktok-proven-slideshow-text-bank.json
- Hook source family: fallback
- Hook source signal: n/a
- Hook source URL: n/a
- Slide text set: watch_checking_simple
- Hook quality score: 58/70
- Rule: use this as proven structure and simplicity only. Do not copy creator-specific wording.

## Prompt Compiler Quality Gate
- Source of truth: strategy/automation/tiktok-instagram-slideshow-content-engine/SOURCE_OF_TRUTH_X_ARTICLE.md
- Coherence status: passed
- Selected by: problem_type_mapping
- Checks: single workout phase selected before prompt generation; avatar lighting normalized to deck lighting family; weather normalized to selected lighting family; reference image background locked out of generated avatar world; hook image remains slide-1-only; base image remains text-free for local Sharp/Canvas overlay

## Reddit Source Context
- Problem type: watch-checking anxiety
- Exact runner language: I keep checking my Apple Watch every 30 seconds on easy runs.
- Source: inputs/research/reddit-winning-language-bank.md

## Theme And Vibe
- Theme: watch-checking anxiety
- Route tag: forest
- Selected visual world: forest
- Lighting family: soft green morning forest light
- Viewer emotion: anxious
- Background: forest running route with visible trees and path depth
- Vibe: focused, slightly tense, then grounded
- Reddit-derived background: I keep checking my Apple Watch every 30 seconds on easy runs.
- Visual keywords: forest, path depth, focused breathing, no watch checking

## Background World Lock
- Reference image background is non-transferable.
- Use the reference image for runner face, body type, sweat, expression, and visual energy only.
- Required generated background: forest running route with visible trees and path depth
- Selected avatar world: forest
- Rule: Generate a new forest background that matches the deck visual world and lighting family.
- Allowed background context: none
- Forbidden background elements for this pack: lake, lakeside, large water background, mountain backdrop, track lane, stadium, gym, treadmill, city street
- If the reference image background conflicts with the selected avatar world, ignore the reference background completely.

## First Image Prompt Adapted To Theme
runner moving through a forest route with eyes forward, not checking a watch

## Required Slideshow Spine
- Emotion: anxious
- Images 2.0: slide 1 only
- Avatar world: generated Coachi runner avatar in forest
- CTA: final slide only, one simple action
- Visual consistency: slides 2-7 must stay in forest with soft green morning forest light
- Background rule: slide 1 must use a newly generated forest background, not the reference image background.

## Character Continuity Anchor
- Identity ID: watch_stole_the_run_runner_v1
- Reference image: content/slideshows/2026-04-26-watch-stole-the-run-8-slide/slides/source/01-hook.png
- Viral face/style reference: content/slideshows/2026-04-26-watch-stole-the-run-8-slide/slides/source/01-hook.png
- Stable traits: use the 2026-04-26 watch-stole-the-run runner as the primary appearance anchor; male runner, age 25-35; lean muscular endurance-athlete build; tan complexion; short dark slightly textured hair; serious calm focused expression; realistic sweat on face and shirt; sharp cheek and brow detail from the 2026-04-26 watch-stole-the-run look; fitted black or dark performance kit as the default visual language; shirtless warm-weather running is allowed as an occasional real-run variation; natural outdoor running context
- Variation policy: Use the 2026-04-26 watch-stole-the-run runner as the primary appearance reference, not the cleaner park-portrait avatar. Keep the sharper face, sweat, and serious human expression. Dark technical running kit is the default, but shirtless warm-weather running is allowed as an occasional real-run variation with black shorts and believable sweat. Rotate workout phase, route, weather, light, and camera angle per pack. Avoid model-like posing. Default to no headwear; use caps/headbands only occasionally so every video does not look the same. If eyewear is selected, it must be black running glasses.

## Workout Phase For This Image
- Phase: during-workout
- Moment: runner in the middle of the session with steady controlled effort
- Body language: natural stride, consistent cadence, focused breathing, no stutter step or unnatural turn
- Prompt cue: show the runner moving naturally during the run with visible route context and believable motion

## Avatar Variation For This Image
- Watch: no visible watch
- Top: shirtless warm-weather running look
- Headwear: no headwear
- Eyewear: black running glasses
- Shorts: black 5-inch running shorts
- Running equipment rule: visible kit must read as real running equipment, not casual streetwear. Use technical running clothing when a top is selected, or a believable shirtless warm-weather running look when shirtless is selected. Always use proper running shorts, realistic sweat, and black running glasses if eyewear appears. Do not add headwear unless explicitly selected. No brand logos.
- Camera angle: medium-close real running or cooldown angle, not a posed fitness shoot
- Weather: fresh mild morning conditions
- Lighting: soft green morning forest light
- Watch rule: Default: no visible watch. If the hook is explicitly about watch anxiety, a small unbranded sports watch may appear, but never use readable UI, close-ups, or watch-checking poses.

## Schema Prompt Adapted To Theme
photorealistic athletic runner in runner moving through a forest route with eyes forward, not checking a watch, natural route, premium but believable, clean center space for headline

## Final Prompt To Use
Create a photorealistic vertical 9:16 image of the same organic Coachi runner identity: male runner, age 25-35, lean endurance-athlete build, tan complexion, short dark slightly textured hair, calm focused expression, realistic sweat, and believable outdoor running presence.

Use the 2026-04-26 watch-stole-the-run hook image as the primary Coachi runner appearance reference: fitted dark performance kit, visible sweat on face and shirt, sharper cheek and brow detail, cinematic contrast, shallow depth of field, and serious human expression. Preserve that runner's appearance energy while adapting the route, pose, workout phase, and lighting to this pack. Do not fall back to the cleaner park-portrait avatar. The reference image background is not part of the identity. Replace it with a new forest background matching this deck. Do not copy the 2026-04-26 lake/mountain background, hands-on-hips pose, or visible watch unless the hook is specifically about watch anxiety.

Workout phase: during-workout. Capture this moment: runner in the middle of the session with steady controlled effort. Body language should show natural stride, consistent cadence, focused breathing, no stutter step or unnatural turn. show the runner moving naturally during the run with visible route context and believable motion.

Wardrobe and running equipment for this image: shirtless warm-weather running look, black 5-inch running shorts, no headwear, and black running glasses. The visible kit must clearly read as real running equipment: technical running fabric when a top is selected, or a believable shirtless warm-weather running look when shirtless is selected, plus proper running shorts, natural sweat, and black running glasses if eyewear appears. Avoid casual streetwear and model-like posing. If headwear is "no headwear", do not add a cap, hat, beanie, headband, or other headwear. Default to no visible watch. Do not include Apple Watch, Garmin watch, smartwatch, GPS watch, watch UI, watch close-up, or watch-checking pose.

Scene: forest running route with visible trees and path depth. Keep the image inside the selected visual world: forest. The background must visibly fit forest; do not import a different primary route world such as forest, lake, mountain, gym, track, or street unless it is explicitly the selected avatar world. If the selected world is lake, mountains or hills may appear only as distant background context while the lake remains primary. The image should feel like focused, slightly tense, then grounded. Weather: fresh mild morning conditions. Lighting: soft green morning forest light. Match the deck lighting family: soft green morning forest light. The runner should look like a real person in a real run moment, not a model shoot. Keep body mechanics natural. Use realistic daylight, visible background detail, and a premium fitness brand aesthetic.

Composition: medium-close real running or cooldown angle, not a posed fitness shoot, no face distortion, no watch-checking pose, no hands-on-hips hero pose, no exaggerated emotion. Show the viewer emotion as anxious through body language and scene tension, not facial acting. Leave clean center/lower-middle negative space for the hook overlay.

## Character / Brand Anchor
photorealistic athletic male runner, lean muscular endurance-athlete build, masculine, tan complexion, short dark slightly textured hair, same face family across posts, natural run/post-run moment, realistic sweat on face and shirt, serious calm focused expression, stronger 2026-04-26 watch-stole-the-run viral face style, fitted dark performance kit, selected visual world environment, premium fitness-editorial aesthetic, default no visible watch

## Negative Constraints
Avoid: watch close-up, phone screen, city street, track lane.
Do not change the primary route/world from forest. Lake decks may include mountains or hills in the background only when the lake path remains the clear primary world.
No text, no watermark, no brand logos, no Apple Watch, no Garmin watch, no smartwatch, no GPS watch, no readable watch UI, no app UI, no extra limbs, no distorted hands, no fake steam, no blurred-out background.
