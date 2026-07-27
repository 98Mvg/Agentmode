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
Choose what one COROS dial press does during a run

## Mandatory Picture 1 Composition
This is a hard requirement and must be followed before identity styling, wardrobe, or reference-image pose.
- Composition family: watch_comparison_selfie_starter
- Direction: start watch-comparison decks with a realistic runner selfie where the running watch is clearly visible near the lower foreground, but never as a wrist-only close-up; keep the selected route world visible behind him
- Camera distance: arm-length runner selfie frame
- Camera height: handheld phone selfie height, slightly above eye line
- Subject scale: runner face, upper torso, and watch-side forearm fill 45-60% of frame without blocking text
- Face visibility: face visible like a real runner selfie, natural and slightly imperfect
- Face-framing safety: if any face is visible, keep the entire face and full head inside the frame, including hairline, forehead, ears, and chin. Never crop through the head, face, forehead, chin, or neck. If the composition cannot show a complete face and head, turn the runner fully away so no face is visible.
- Movement state: runner holding the phone before or after a run with the watch-side wrist naturally visible in frame
- Text-safe negative space: upper side sky, trail, forest, lake, or mountain background away from face and watch
- If face visibility says the face is hidden, no direct face, small, partial, or not readable, do not create a close face portrait.
- A partial body is allowed only when it is clearly intentional and contains no face. Never create an accidental neck-down crop.
- Do not place the face or torso in the center text-safe zone. Leave the overlay area naturally open.
- Do not default to centered waist-up, hands-on-knees, front-facing, or three-quarter hero framing unless that is the selected composition.

## TikTok-Proven Text Source
- Text bank: not available
- Hook source family: watch_garmin_auto_lap_workout_v1
- Hook source signal: n/a
- Hook source URL: https://support.coros.com/hc/en-us/articles/47169858848020-Customizing-Your-Dial-Press-Setting-for-Activities
- Slide text set: fallback
- Hook quality score: 59/70
- Rule: use this as proven structure and simplicity only. Do not copy creator-specific wording.

## Prompt Compiler Quality Gate
- Source of truth: strategy/automation/tiktok-instagram-slideshow-content-engine/SOURCE_OF_TRUTH_X_ARTICLE.md
- Coherence status: passed
- Selected by: stable_hash_fallback
- Composition family: watch_comparison_selfie_starter
- Checks: single workout phase selected before prompt generation; avatar lighting normalized to deck lighting family; weather normalized to selected lighting family; reference image background locked out of generated avatar world; hook image remains slide-1-only; hook composition selected independently from wardrobe and workout phase; Road to Marathon Fit workout posts use a training-day outfit key when account_profile is marathon; composition controls camera distance, face visibility, subject scale, and negative-space zone; do not repeat centered medium-close hero framing unless the selected composition asks for it; base image remains text-free for local Sharp/Canvas overlay

## Reddit Source Context
- Problem type: watch controls
- Exact runner language: I want one COROS dial press to pause, or open options without pausing.
- Source: https://support.coros.com/hc/en-us/articles/47169858848020-Customizing-Your-Dial-Press-Setting-for-Activities

## Theme And Vibe
- Theme: watch controls
- Route tag: forest
- Selected visual world: forest
- Lighting family: soft green morning forest light
- Viewer emotion: choosing between fast pause and more control
- Background: shaded forest running route with visible path depth
- Vibe: realistic, calm, premium, useful, not overproduced
- Reddit-derived background: I want one COROS dial press to pause, or open options without pausing.
- Visual keywords: forest route, green morning light, trees, path depth, clean overlay space

## Background World Lock
- Reference image background is non-transferable.
- Use the reference image for runner face, body type, sweat, expression, and visual energy only.
- Required generated background: shaded forest running route with visible path depth
- Selected avatar world: forest
- Rule: Generate a new forest background that matches the deck visual world and lighting family.
- Allowed background context: none
- Forbidden background elements for this pack: lake, lakeside, large water background, mountain backdrop, track lane, stadium, gym, treadmill, city street
- If the reference image background conflicts with the selected avatar world, ignore the reference background completely.

## First Image Prompt Adapted To Theme
show a runner in a believable post-run or easy-run moment with clean negative space for overlay text

## Required Slideshow Spine
- Emotion: choosing between fast pause and more control
- Images 2.0: slide 1 only
- Avatar world: generated Coachi runner avatar in forest
- CTA: final slide only, one simple action
- Visual consistency: slides 2-7 must stay in forest with soft green morning forest light
- Background rule: slide 1 must use a newly generated forest background, not the reference image background.

## Character Continuity Anchor
- Identity ID: runner_watch_lab_lifelong_runner_v1
- Reference image: content/slideshows/visual-library/owned-source/watch-account-avatar/runner-watch-lab-lifelong-runner-v1-reference.png
- Viral face/style reference: none; use identity reference only
- Stable traits: use an older lifelong runner identity for the watch-focused account; male runner, early-to-mid 40s, age 42-48; lean durable endurance-athlete build, not bulky and not model-polished; sun-weathered tan complexion with subtle smile lines and realistic skin texture; short dark slightly textured hair with a small amount of grey at the temples; calm experienced runner presence, like someone who has run for decades; the face must be visible enough to read the mature Runner Watch Lab identity on hook images; identity must carry through face, build, posture, efficient stride, kit, watch, and veteran runner energy; realistic sweat and outdoor running texture; technical running tops and shirtless warm-weather looks rotate with a 50/50 target; shirtless images are allowed only when they read like real training, not model posing; no glasses, sunglasses, or sport eyewear for now; visible Apple Watch-style or Garmin-style running watch on one wrist, small and natural, no readable UI or logos; natural outdoor running context
- Variation policy: Use this as the Runner Watch Lab avatar: an experienced male runner in his 40s who looks like he has been running his whole life. He should feel credible, durable, calm, and slightly weathered, not like a young fitness model or generic ad thumbnail. Do not use the 2026-04-26 watch-stole-the-run runner as a style, face, body, pose, or age reference for the watch account. Rotate route, weather, light, camera angle, crop distance, subject scale, expression, shirtless/clothed kit, and Apple Watch/Garmin-style watch type per pack. Keep the mature face visible enough to verify identity. Keep shirtless images athletic, runner-realistic, and non-sexual. Default to no headwear. Eyewear is disabled for now: no glasses, sunglasses, sport eyewear, or clear lenses.

## Workout Phase For This Image
- Phase: post-workout
- Moment: runner just finished or is cooling down after the session
- Body language: sweaty, satisfied, grounded, breathing settling, no exaggerated celebration
- Prompt cue: show a realistic cooldown or post-run moment with sweat, calm satisfaction, and a premium but believable feel

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
- Watch detail rule: round Garmin-style GPS running watch silhouette, small in-frame, no readable screen UI, no Garmin logo, no watch-checking pose, never a wrist close-up. For watch-comparison hooks, use a natural runner selfie where the selected watch is clearly visible on the watch-side wrist or forearm in the lower foreground, but never as a wrist-only macro close-up. No readable screen UI, no visible brand logo, no fake watch ad pose, and no watch-checking pose.
- Watch rotation policy: visible watch on every hook image, stable 50/50 rotation between Apple Watch-style and Garmin-style running watches
- Running equipment rule: Visible kit must read as real running equipment, not casual streetwear. Use technical running clothing when a top is selected, or a believable shirtless warm-weather running look when shirtless is selected. Always use proper running shorts, a natural visible running watch, and realistic sweat. Eyewear is disabled for now: no glasses, sunglasses, sport eyewear, or clear lenses. Do not add headwear unless explicitly selected. No brand logos.
- Camera angle: slightly wider side angle with visible route depth
- Face expression: calm steady effort, neutral determined face, no camera smile
- Weather: fresh mild morning conditions
- Lighting: soft green morning forest light
- Watch rule: Use the selected visible watch type as a natural selfie detail for watch-comparison hooks: it can sit in the lower foreground on the runner's wrist or forearm, but the frame must remain a runner selfie, not a wrist-only macro close-up. No readable screen UI, no logo, and no watch-checking pose.

## Hook Composition For Picture 1
- Composition family: watch_comparison_selfie_starter
- Label: watch comparison selfie starter
- Selection rule: watch_comparison_rule
- Rotation policy: Watch-comparison decks start with a watch-and-selfie hook frame before rotating the supporting visual world.
- Priority rule: Watch-comparison selfie starter overrides the avatar variation angle when they conflict.
- Direction: start watch-comparison decks with a realistic runner selfie where the running watch is clearly visible near the lower foreground, but never as a wrist-only close-up; keep the selected route world visible behind him
- Camera distance: arm-length runner selfie frame
- Camera height: handheld phone selfie height, slightly above eye line
- Lens feel: front-camera TikTok creator selfie with natural wide phone perspective
- Subject scale: runner face, upper torso, and watch-side forearm fill 45-60% of frame without blocking text
- Face visibility: face visible like a real runner selfie, natural and slightly imperfect
- Movement state: runner holding the phone before or after a run with the watch-side wrist naturally visible in frame
- Negative-space zone: upper side sky, trail, forest, lake, or mountain background away from face and watch
- Background depth: selected route world stays visible behind the selfie so it is not a plain portrait
- Do not default to the common centered waist-up runner hero crop unless this selected composition explicitly requires it.

## Schema Prompt Adapted To Theme
photorealistic runner post-run in show a runner in a believable post-run or easy-run moment with clean negative space for overlay text, thoughtful expression, clean text space, no text

## Final Prompt To Use
Hard composition requirement before anything else: watch comparison selfie starter. start watch-comparison decks with a realistic runner selfie where the running watch is clearly visible near the lower foreground, but never as a wrist-only close-up; keep the selected route world visible behind him. Camera distance: arm-length runner selfie frame. Camera height: handheld phone selfie height, slightly above eye line. Subject scale: runner face, upper torso, and watch-side forearm fill 45-60% of frame without blocking text. Face visibility: face visible like a real runner selfie, natural and slightly imperfect. Text-safe negative space: upper side sky, trail, forest, lake, or mountain background away from face and watch. If this composition conflicts with the 2026-04-26 reference image pose or the avatar variation angle, ignore the reference pose and avatar angle. Do not place the face or torso in the center text-safe zone.

Create a photorealistic vertical 9:16 image of the selected Coachi runner identity: photorealistic male lifelong runner, early-to-mid 40s, age 42-48, lean durable endurance-athlete build, weathered but healthy face, subtle smile lines and sun texture, short dark hair with slight grey at the temples, calm experienced runner presence, natural sweat, technical running kit or realistic shirtless warm-weather running look, visible Apple Watch-style or Garmin-style running watch on one wrist, real outdoor running moment. The image should feel like a real TikTok runner/creator capture rather than a polished ad, brand thumbnail, or stock fitness campaign.

Use only the Runner Watch Lab lifelong-runner reference as the identity reference. Do not use or imitate the 2026-04-26 watch-stole-the-run runner, younger face, hands-on-hips pose, centered hero crop, or original background. Preserve the selected runner's appearance energy while adapting the route, pose, workout phase, camera angle, crop distance, face visibility, subject scale, and expression to this pack. Face expression for this image when the face is visible: calm steady effort, neutral determined face, no camera smile. For Runner Watch Lab, the mature male runner's face must be visible enough to verify the older lifelong-runner identity; use a side-profile or three-quarter face if the composition needs motion, but do not use a rear-only or unreadable-face shot. Do not fall back to the cleaner park-portrait avatar. The reference image background is not part of the identity. Replace it with a new forest background matching this deck. Do not copy the reference image background, hands-on-hips pose, centered portrait crop, or visible watch unless the hook is specifically about watch anxiety.

Workout phase: post-workout. Capture this moment: runner just finished or is cooling down after the session. Body language should show sweaty, satisfied, grounded, breathing settling, no exaggerated celebration. show a realistic cooldown or post-run moment with sweat, calm satisfaction, and a premium but believable feel.

Wardrobe and running equipment for this image: olive sleeveless running top, navy running shorts, no headwear, no glasses, and visible Garmin-style GPS running watch on one wrist. Visible kit must read as real running equipment, not casual streetwear. Use technical running clothing when a top is selected, or a believable shirtless warm-weather running look when shirtless is selected. Always use proper running shorts, a natural visible running watch, and realistic sweat. Eyewear is disabled for now: no glasses, sunglasses, sport eyewear, or clear lenses. Do not add headwear unless explicitly selected. No brand logos.. If headwear is "no headwear", do not add a cap, hat, beanie, headband, or other headwear. Eyewear is disabled for now: do not add glasses, sunglasses, sport eyewear, or clear lenses. Watch instruction: round Garmin-style GPS running watch silhouette, small in-frame, no readable screen UI, no Garmin logo, no watch-checking pose, never a wrist close-up. For watch-comparison hooks, use a natural runner selfie where the selected watch is clearly visible on the watch-side wrist or forearm in the lower foreground, but never as a wrist-only macro close-up. No readable screen UI, no visible brand logo, no fake watch ad pose, and no watch-checking pose.. The watch should support the Coachi wearable context but must not become the subject of the image.

Scene: shaded forest running route with visible path depth. Keep the image inside the selected visual world: forest. The background must visibly fit forest; do not import a different primary route world such as lake, mountain, gym, track, or street. If the selected world is lake, mountains or hills may appear only as distant background context while the lake remains primary. The image should feel like realistic, calm, premium, useful, not overproduced. Weather: fresh mild morning conditions. Lighting: soft green morning forest light. Match the deck lighting family: soft green morning forest light. The runner should look like a real person in a real run moment, not a model shoot. Keep body mechanics natural. Use realistic daylight, visible background detail, and a creator-native running post aesthetic: specific, human, slightly imperfect, and not overproduced.

Composition: follow this selected hook composition first: watch comparison selfie starter. start watch-comparison decks with a realistic runner selfie where the running watch is clearly visible near the lower foreground, but never as a wrist-only close-up; keep the selected route world visible behind him. If this conflicts with the avatar variation camera angle, the hook composition wins; the avatar variation supplies wardrobe, weather, lighting, and expression only. Camera distance: arm-length runner selfie frame. Camera height: handheld phone selfie height, slightly above eye line. Lens feel: front-camera TikTok creator selfie with natural wide phone perspective. Subject scale: runner face, upper torso, and watch-side forearm fill 45-60% of frame without blocking text. Face visibility: face visible like a real runner selfie, natural and slightly imperfect. Movement state: runner holding the phone before or after a run with the watch-side wrist naturally visible in frame. Negative space for local overlay text: upper side sky, trail, forest, lake, or mountain background away from face and watch. Background depth: selected route world stays visible behind the selfie so it is not a plain portrait. Do not default to the common centered waist-up, front-facing, three-quarter, scenic hero crop unless that is explicitly the selected composition. No face distortion, no watch-checking pose, no hands-on-hips hero pose, no repeated static hero framing, no exaggerated emotion. Show the viewer emotion as choosing between fast pause and more control through believable body language, face tension when visible, and scene tension, not theatrical acting. Use a natural creator-style crop with enough clean negative space for the hook overlay, but avoid a staged poster layout.

## Character / Brand Anchor
photorealistic experienced male runner in his 40s, lifelong runner, lean durable endurance build, masculine, sun-weathered tan complexion, short dark hair with subtle grey at the temples, steady confident runner expression, natural sweat, selected wardrobe category from the 50/50 clothing rotation, visible Apple Watch-style or Garmin-style running watch on one wrist, selected visual world environment, believable TikTok-native running creator aesthetic

## Negative Constraints
Avoid: watch close-up, baked-in text, logos, fake steam, blurred background, unnatural stride, lake, lakeside, large water background, mountain backdrop, track lane, stadium, gym, treadmill, city street.
Do not change the primary route/world from forest. Lake decks may include mountains or hills in the background only when the lake path remains the clear primary world.
No text, no watermark, no brand logos, no readable watch UI, no app UI, no wrist close-up, no watch-checking pose, no extra limbs, no distorted hands, no fake steam, no blurred-out background.
