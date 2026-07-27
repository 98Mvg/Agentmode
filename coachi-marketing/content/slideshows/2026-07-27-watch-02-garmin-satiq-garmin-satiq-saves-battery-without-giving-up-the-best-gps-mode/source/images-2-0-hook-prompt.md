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

## TikTok Creator Realism Direction
- Make this feel like a real runner/creator post, not a polished fitness ad, stock campaign, or AI thumbnail.
- Prefer an imperfect but believable phone/tripod capture feeling: natural crop, real sweat, slight motion realism, lived-in route detail, and human expression.
- Avoid symmetrical poster framing, glossy model lighting, overly perfect skin, heroic influencer posing, and generic scenic wallpaper energy.
- Negative space is still needed for local overlay text, but it should feel naturally available in the scene, not staged like an ad layout.

## Hook Text Added Later By Compositor
Wait before saving if you want Garmin recovery heart rate

## Mandatory Picture 1 Composition
This is a hard requirement and must be followed before identity styling, wardrobe, or reference-image pose.
- Composition family: over_shoulder_route_decision
- Direction: place the viewer behind the runner, as if deciding whether to keep the run easy
- Camera distance: medium-wide from behind the shoulder
- Camera height: natural eye-height phone angle
- Subject scale: runner shoulder/back fills 25-35% of frame
- Face visibility: face not visible or barely side-visible
- Face-framing safety: if any face is visible, keep the entire face and full head inside the frame, including hairline, forehead, ears, and chin. Never crop through the head, face, forehead, chin, or neck. If the composition cannot show a complete face and head, turn the runner fully away so no face is visible.
- Movement state: looking down the route, about to start or settling into effort
- Text-safe negative space: open route ahead or sky/tree gap
- If face visibility says the face is hidden, no direct face, small, partial, or not readable, do not create a close face portrait.
- A partial body is allowed only when it is clearly intentional and contains no face. Never create an accidental neck-down crop.
- Do not place the face or torso in the center text-safe zone. Leave the overlay area naturally open.
- Do not default to centered waist-up, hands-on-knees, front-facing, or three-quarter hero framing unless that is the selected composition.

## TikTok-Proven Text Source
- Text bank: not available
- Hook source family: watch_garmin_satiq_v1
- Hook source signal: n/a
- Hook source URL: https://support.garmin.com/en-NZ/?faq=3HTTUrSoRF51m8vGUtMhY9
- Slide text set: fallback
- Hook quality score: 59/70
- Rule: use this as proven structure and simplicity only. Do not copy creator-specific wording.

## Prompt Compiler Quality Gate
- Source of truth: strategy/automation/tiktok-instagram-slideshow-content-engine/SOURCE_OF_TRUTH_X_ARTICLE.md
- Coherence status: passed
- Selected by: problem_type_mapping
- Composition family: over_shoulder_route_decision
- Checks: single workout phase selected before prompt generation; avatar lighting normalized to deck lighting family; weather normalized to selected lighting family; reference image background locked out of generated avatar world; hook image remains slide-1-only; hook composition selected independently from wardrobe and workout phase; Road to Marathon Fit workout posts use a training-day outfit key when account_profile is marathon; composition controls camera distance, face visibility, subject scale, and negative-space zone; do not repeat centered medium-close hero framing unless the selected composition asks for it; base image remains text-free for local Sharp/Canvas overlay

## Reddit Source Context
- Problem type: metric setup confusion
- Exact runner language: My Garmin recovery heart rate disappears when I save the activity immediately.
- Source: https://support.garmin.com/en-NZ/?faq=3HTTUrSoRF51m8vGUtMhY9

## Theme And Vibe
- Theme: metric setup confusion
- Route tag: mountain
- Selected visual world: mountain
- Lighting family: clear mountain morning light
- Viewer emotion: finished, curious about recovery
- Background: mountain running route with visible climb or ridge context
- Vibe: realistic, calm, premium, useful, not overproduced
- Reddit-derived background: My Garmin recovery heart rate disappears when I save the activity immediately.
- Visual keywords: mountain route, gradient, open sky, clear morning light, clean overlay space

## Background World Lock
- Reference image background is non-transferable.
- Use the reference image for runner face, body type, sweat, expression, and visual energy only.
- Required generated background: mountain running route with visible climb or ridge context
- Selected avatar world: mountain
- Rule: Generate a new mountain background that matches the deck visual world and lighting family.
- Allowed background context: none
- Forbidden background elements for this pack: lake, lakeside, dense forest route, track lane, stadium, gym, treadmill, city street
- If the reference image background conflicts with the selected avatar world, ignore the reference background completely.

## First Image Prompt Adapted To Theme
pre-run preparation moment: the runner is warming up naturally near the selected route, calm and ready, not posing

## Required Slideshow Spine
- Emotion: finished, curious about recovery
- Images 2.0: slide 1 only
- Avatar world: generated Coachi runner avatar in mountain
- CTA: final slide only, one simple action
- Visual consistency: slides 2-7 must stay in mountain with clear mountain morning light
- Background rule: slide 1 must use a newly generated mountain background, not the reference image background.

## Character Continuity Anchor
- Identity ID: runner_watch_lab_lifelong_runner_v1
- Reference image: content/slideshows/visual-library/owned-source/watch-account-avatar/runner-watch-lab-lifelong-runner-v1-reference.png
- Viral face/style reference: none; use identity reference only
- Stable traits: use an older lifelong runner identity for the watch-focused account; male runner, early-to-mid 40s, age 42-48; lean durable endurance-athlete build, not bulky and not model-polished; sun-weathered tan complexion with subtle smile lines and realistic skin texture; short dark slightly textured hair with a small amount of grey at the temples; calm experienced runner presence, like someone who has run for decades; the face must be visible enough to read the mature Runner Watch Lab identity on hook images; identity must carry through face, build, posture, efficient stride, kit, watch, and veteran runner energy; realistic sweat and outdoor running texture; technical running tops and shirtless warm-weather looks rotate with a 50/50 target; shirtless images are allowed only when they read like real training, not model posing; no glasses, sunglasses, or sport eyewear for now; visible Apple Watch-style or Garmin-style running watch on one wrist, small and natural, no readable UI or logos; natural outdoor running context
- Variation policy: Use this as the Runner Watch Lab avatar: an experienced male runner in his 40s who looks like he has been running his whole life. He should feel credible, durable, calm, and slightly weathered, not like a young fitness model or generic ad thumbnail. Do not use the 2026-04-26 watch-stole-the-run runner as a style, face, body, pose, or age reference for the watch account. Rotate route, weather, light, camera angle, crop distance, subject scale, expression, shirtless/clothed kit, and Apple Watch/Garmin-style watch type per pack. Keep the mature face visible enough to verify identity. Keep shirtless images athletic, runner-realistic, and non-sexual. Default to no headwear. Eyewear is disabled for now: no glasses, sunglasses, sport eyewear, or clear lenses.

## Workout Phase For This Image
- Phase: pre-workout
- Moment: runner preparing before the session starts on a real outdoor route
- Body language: calm anticipation, relaxed shoulders, light warmup movement, ready but not posing
- Prompt cue: show the runner moments before starting: walking to the route, light dynamic warmup, or standing naturally with the route visible

## Avatar Variation For This Image
- Watch: visible Garmin-style GPS running watch on one wrist
- Top: olive sleeveless running top
- Clothing category: clothed
- Clothing rotation policy: 50/50 stable hash split between shirtless and clothed hook images
- Outfit key: olive_singlet_navy_shorts_side_no_headwear
- Outfit note: none
- Headwear: no headwear
- Eyewear: no glasses
- Shorts: navy running shorts
- Watch brand family: Garmin
- Watch detail rule: round Garmin-style GPS running watch silhouette, small in-frame, no readable screen UI, no Garmin logo, no watch-checking pose, never a wrist close-up
- Watch rotation policy: visible watch on every hook image, stable 50/50 rotation between Apple Watch-style and Garmin-style running watches
- Running equipment rule: Visible kit must read as real running equipment, not casual streetwear. Use technical running clothing when a top is selected, or a believable shirtless warm-weather running look when shirtless is selected. Always use proper running shorts, a natural visible running watch, and realistic sweat. Eyewear is disabled for now: no glasses, sunglasses, sport eyewear, or clear lenses. Do not add headwear unless explicitly selected. No brand logos.
- Camera angle: slightly wider side angle with visible route depth
- Face expression: calm steady effort, neutral determined face, no camera smile
- Weather: fresh mild morning conditions
- Lighting: clear mountain morning light
- Watch rule: Use the selected visible watch type naturally on one wrist. The watch may read as Apple Watch-style or Garmin-style by silhouette only. Keep it small and believable in-frame. No readable screen UI, no logo, no wrist close-up, and no watch-checking pose.

## Hook Composition For Picture 1
- Composition family: over_shoulder_route_decision
- Label: over-shoulder route decision
- Selection rule: stable_hash_candidate_phase_world
- Rotation policy: Hook composition rotates independently from clothing, workout phase, and visual world so Picture 1 does not default to repeated centered medium-close hero shots.
- Priority rule: Hook composition overrides the avatar variation angle when they conflict.
- Direction: place the viewer behind the runner, as if deciding whether to keep the run easy
- Camera distance: medium-wide from behind the shoulder
- Camera height: natural eye-height phone angle
- Lens feel: handheld phone realism
- Subject scale: runner shoulder/back fills 25-35% of frame
- Face visibility: face not visible or barely side-visible
- Movement state: looking down the route, about to start or settling into effort
- Negative-space zone: open route ahead or sky/tree gap
- Background depth: clear route line inside the selected visual world
- Do not default to the common centered waist-up runner hero crop unless this selected composition explicitly requires it.

## Schema Prompt Adapted To Theme
runner after a workout looking thoughtful, realistic running route, clean negative space

## Final Prompt To Use
Hard composition requirement before anything else: over-shoulder route decision. place the viewer behind the runner, as if deciding whether to keep the run easy. Camera distance: medium-wide from behind the shoulder. Camera height: natural eye-height phone angle. Subject scale: runner shoulder/back fills 25-35% of frame. Face visibility: face not visible or barely side-visible. Text-safe negative space: open route ahead or sky/tree gap. If this composition conflicts with the 2026-04-26 reference image pose or the avatar variation angle, ignore the reference pose and avatar angle. Do not place the face or torso in the center text-safe zone.

Create a photorealistic vertical 9:16 image of the selected Coachi runner identity: photorealistic male lifelong runner, early-to-mid 40s, age 42-48, lean durable endurance-athlete build, weathered but healthy face, subtle smile lines and sun texture, short dark hair with slight grey at the temples, calm experienced runner presence, natural sweat, technical running kit or realistic shirtless warm-weather running look, visible Apple Watch-style or Garmin-style running watch on one wrist, real outdoor running moment. The image should feel like a real TikTok runner/creator capture rather than a polished ad, brand thumbnail, or stock fitness campaign.

Use only the Runner Watch Lab lifelong-runner reference as the identity reference. Do not use or imitate the 2026-04-26 watch-stole-the-run runner, younger face, hands-on-hips pose, centered hero crop, or original background. Preserve the selected runner's appearance energy while adapting the route, pose, workout phase, camera angle, crop distance, face visibility, subject scale, and expression to this pack. Face expression for this image when the face is visible: calm steady effort, neutral determined face, no camera smile. For Runner Watch Lab, the mature male runner's face must be visible enough to verify the older lifelong-runner identity; use a side-profile or three-quarter face if the composition needs motion, but do not use a rear-only or unreadable-face shot. Do not fall back to the cleaner park-portrait avatar. The reference image background is not part of the identity. Replace it with a new mountain background matching this deck. Do not copy the reference image background, hands-on-hips pose, centered portrait crop, or visible watch unless the hook is specifically about watch anxiety.

Workout phase: pre-workout. Capture this moment: runner preparing before the session starts on a real outdoor route. Body language should show calm anticipation, relaxed shoulders, light warmup movement, ready but not posing. show the runner moments before starting: walking to the route, light dynamic warmup, or standing naturally with the route visible.

Wardrobe and running equipment for this image: olive sleeveless running top, navy running shorts, no headwear, no glasses, and visible Garmin-style GPS running watch on one wrist. Visible kit must read as real running equipment, not casual streetwear. Use technical running clothing when a top is selected, or a believable shirtless warm-weather running look when shirtless is selected. Always use proper running shorts, a natural visible running watch, and realistic sweat. Eyewear is disabled for now: no glasses, sunglasses, sport eyewear, or clear lenses. Do not add headwear unless explicitly selected. No brand logos.. If headwear is "no headwear", do not add a cap, hat, beanie, headband, or other headwear. Eyewear is disabled for now: do not add glasses, sunglasses, sport eyewear, or clear lenses. Watch instruction: round Garmin-style GPS running watch silhouette, small in-frame, no readable screen UI, no Garmin logo, no watch-checking pose, never a wrist close-up. The watch should support the Coachi wearable context but must not become the subject of the image.

Scene: mountain running route with visible climb or ridge context. Keep the image inside the selected visual world: mountain. The background must visibly fit mountain; do not import a different primary route world such as forest, lake, gym, track, or street. If the selected world is lake, mountains or hills may appear only as distant background context while the lake remains primary. The image should feel like realistic, calm, premium, useful, not overproduced. Weather: fresh mild morning conditions. Lighting: clear mountain morning light. Match the deck lighting family: clear mountain morning light. The runner should look like a real person in a real run moment, not a model shoot. Keep body mechanics natural. Use realistic daylight, visible background detail, and a creator-native running post aesthetic: specific, human, slightly imperfect, and not overproduced.

Composition: follow this selected hook composition first: over-shoulder route decision. place the viewer behind the runner, as if deciding whether to keep the run easy. If this conflicts with the avatar variation camera angle, the hook composition wins; the avatar variation supplies wardrobe, weather, lighting, and expression only. Camera distance: medium-wide from behind the shoulder. Camera height: natural eye-height phone angle. Lens feel: handheld phone realism. Subject scale: runner shoulder/back fills 25-35% of frame. Face visibility: face not visible or barely side-visible. Movement state: looking down the route, about to start or settling into effort. Negative space for local overlay text: open route ahead or sky/tree gap. Background depth: clear route line inside the selected visual world. Do not default to the common centered waist-up, front-facing, three-quarter, scenic hero crop unless that is explicitly the selected composition. No face distortion, no watch-checking pose, no hands-on-hips hero pose, no repeated static hero framing, no exaggerated emotion. Show the viewer emotion as finished, curious about recovery through believable body language, face tension when visible, and scene tension, not theatrical acting. Use a natural creator-style crop with enough clean negative space for the hook overlay, but avoid a staged poster layout.

## Character / Brand Anchor
photorealistic experienced male runner in his 40s, lifelong runner, lean durable endurance build, masculine, sun-weathered tan complexion, short dark hair with subtle grey at the temples, steady confident runner expression, natural sweat, selected wardrobe category from the 50/50 clothing rotation, visible Apple Watch-style or Garmin-style running watch on one wrist, selected visual world environment, believable TikTok-native running creator aesthetic

## Negative Constraints
Avoid: watch close-up, baked-in text, logos, fake steam, blurred background, unnatural stride, lake, lakeside, dense forest route, track lane, stadium, gym, treadmill, city street.
Do not change the primary route/world from mountain. Lake decks may include mountains or hills in the background only when the lake path remains the clear primary world.
No text, no watermark, no brand logos, no readable watch UI, no app UI, no wrist close-up, no watch-checking pose, no extra limbs, no distorted hands, no fake steam, no blurred-out background.
