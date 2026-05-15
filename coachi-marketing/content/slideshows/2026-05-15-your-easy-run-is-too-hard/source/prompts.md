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
Your easy run is too hard

## TikTok-Proven Text Source
- Text bank: inputs/research/tiktok-proven-slideshow-text-bank.json
- Hook source family: proper_easy_run
- Hook source signal: relevant easy-run format
- Hook source URL: https://www.tiktok.com/@trainwithabbey/video/7572964194274823479
- Slide text set: heart_rate_easy_run_simple
- Hook quality score: 58/70
- Rule: use this as proven structure and simplicity only. Do not copy creator-specific wording.

## Prompt Compiler Quality Gate
- Source of truth: strategy/automation/tiktok-instagram-slideshow-content-engine/SOURCE_OF_TRUTH_X_ARTICLE.md
- Coherence status: passed
- Selected by: problem_type_mapping
- Checks: single workout phase selected before prompt generation; avatar lighting normalized to deck lighting family; weather normalized to selected lighting family; reference image background locked out of generated avatar world; hook image remains slide-1-only; base image remains text-free for local Sharp/Canvas overlay

## Reddit Source Context
- Problem type: heart-rate panic
- Exact runner language: My heart rate looks too high for how slow I run.
- Source: inputs/research/reddit-winning-language-bank.md

## Theme And Vibe
- Theme: heart-rate panic
- Route tag: open_city_park_path
- Selected visual world: open city park path
- Lighting family: bright natural daylight
- Viewer emotion: embarrassed
- Background: open city park path with light environmental stress such as sun or wind
- Vibe: tense but grounded, useful correction, not alarmist
- Reddit-derived background: My heart rate looks too high for how slow I run.
- Visual keywords: sun, wind, controlled breathing, real effort, environment context

## Background World Lock
- Reference image background is non-transferable.
- Use the reference image for runner face, body type, sweat, expression, and visual energy only.
- Required generated background: open city park path with light environmental stress such as sun or wind
- Selected avatar world: open city park path
- Rule: Generate a new open city park path background that matches the deck visual world and lighting family.
- Forbidden background elements for this pack: lake, lakeside, large water background, mountain, large hill backdrop, dense forest route, track lane or stadium, gym or treadmill background
- If the reference image background conflicts with the selected avatar world, ignore the reference background completely.

## First Image Prompt Adapted To Theme
runner in controlled motion with visible sweat and focused breathing, scene should explain why effort can rise

## Required Slideshow Spine
- Emotion: embarrassed
- Images 2.0: slide 1 only
- Avatar world: generated Coachi runner avatar in open city park path
- CTA: final slide only, one simple action
- Visual consistency: slides 2-7 must stay in open city park path with bright natural daylight
- Background rule: slide 1 must use a newly generated open city park path background, not the reference image background.

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
- Top: navy fitted long-sleeve performance shirt
- Headwear: no headwear
- Eyewear: no glasses
- Shorts: charcoal running shorts
- Running equipment rule: visible kit must read as real running equipment, not casual streetwear. Use technical running clothing when a top is selected, or a believable shirtless warm-weather running look when shirtless is selected. Always use proper running shorts, realistic sweat, and black running glasses if eyewear appears. Do not add headwear unless explicitly selected. No brand logos.
- Camera angle: side-tracking action angle with natural arm swing
- Weather: clear dry training conditions
- Lighting: bright natural daylight
- Watch rule: Default: no visible watch. If the hook is explicitly about watch anxiety, a small unbranded sports watch may appear, but never use readable UI, close-ups, or watch-checking poses.

## Schema Prompt Adapted To Theme
photorealistic athletic runner in runner in controlled motion with visible sweat and focused breathing, scene should explain why effort can rise, natural route, premium but believable, clean center space for headline

## Final Prompt To Use
Create a photorealistic vertical 9:16 image of the same organic Coachi runner identity: male runner, age 25-35, lean endurance-athlete build, tan complexion, short dark slightly textured hair, calm focused expression, realistic sweat, and believable outdoor running presence.

Use the 2026-04-26 watch-stole-the-run hook image as the primary Coachi runner appearance reference: fitted dark performance kit, visible sweat on face and shirt, sharper cheek and brow detail, cinematic contrast, shallow depth of field, and serious human expression. Preserve that runner's appearance energy while adapting the route, pose, workout phase, and lighting to this pack. Do not fall back to the cleaner park-portrait avatar. The reference image background is not part of the identity. Replace it with a new open city park path background matching this deck. Do not copy the 2026-04-26 lake/mountain background, hands-on-hips pose, or visible watch unless the hook is specifically about watch anxiety.

Workout phase: during-workout. Capture this moment: runner in the middle of the session with steady controlled effort. Body language should show natural stride, consistent cadence, focused breathing, no stutter step or unnatural turn. show the runner moving naturally during the run with visible route context and believable motion.

Wardrobe and running equipment for this image: navy fitted long-sleeve performance shirt, charcoal running shorts, no headwear, and no glasses. The visible kit must clearly read as real running equipment: technical running fabric when a top is selected, or a believable shirtless warm-weather running look when shirtless is selected, plus proper running shorts, natural sweat, and black running glasses if eyewear appears. Avoid casual streetwear and model-like posing. If headwear is "no headwear", do not add a cap, hat, beanie, headband, or other headwear. Default to no visible watch. Do not include Apple Watch, Garmin watch, smartwatch, GPS watch, watch UI, watch close-up, or watch-checking pose.

Scene: open city park path with light environmental stress such as sun or wind. Keep the image inside the selected visual world: open city park path. The background must visibly fit open city park path; do not import a lake, mountain, hill, forest, gym, track, or street world unless it is explicitly the selected avatar world. The image should feel like tense but grounded, useful correction, not alarmist. Weather: clear dry training conditions. Lighting: bright natural daylight. Match the deck lighting family: bright natural daylight. The runner should look like a real person in a real run moment, not a model shoot. Keep body mechanics natural. Use realistic daylight, visible background detail, and a premium fitness brand aesthetic.

Composition: side-tracking action angle with natural arm swing, no face distortion, no watch-checking pose, no hands-on-hips hero pose, no exaggerated emotion. Show the viewer emotion as embarrassed through body language and scene tension, not facial acting. Leave clean center/lower-middle negative space for the hook overlay.

## Character / Brand Anchor
photorealistic athletic male runner, lean muscular endurance-athlete build, masculine, tan complexion, short dark slightly textured hair, same face family across posts, natural run/post-run moment, realistic sweat on face and shirt, serious calm focused expression, stronger 2026-04-26 watch-stole-the-run viral face style, fitted dark performance kit, selected visual world environment, premium fitness-editorial aesthetic, default no visible watch

## Negative Constraints
Avoid: medical emergency, fear expression, watch close-up, fake exhaustion.
Do not mix hills, lakes, and mountains. Do not change the route/world from open city park path.
No text, no watermark, no brand logos, no Apple Watch, no Garmin watch, no smartwatch, no GPS watch, no readable watch UI, no app UI, no extra limbs, no distorted hands, no fake steam, no blurred-out background.
