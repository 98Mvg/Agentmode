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
Why waiting until minute 45 can ruin your long run

## Mandatory Picture 1 Composition
This is a hard requirement and must be followed before identity styling, wardrobe, or reference-image pose.
- Composition family: reflection_or_shadow_detail
- Direction: use reflection, shadow, or partial body detail to break the repeated full-runner look
- Camera distance: detail-led frame with runner partly indirect
- Camera height: low phone angle near ground, water, or wet path
- Subject scale: runner body can be partial or reflected; environment fills the frame
- Face visibility: no direct face required
- Face-framing safety: if any face is visible, keep the entire face and full head inside the frame, including hairline, forehead, ears, and chin. Never crop through the head, face, forehead, chin, or neck. If the composition cannot show a complete face and head, turn the runner fully away so no face is visible.
- Movement state: subtle movement, shadow, reflection, or passing stride
- Text-safe negative space: natural open area in reflection, path, sky, or tree gap
- If face visibility says the face is hidden, no direct face, small, partial, or not readable, do not create a close face portrait.
- A partial body is allowed only when it is clearly intentional and contains no face. Never create an accidental neck-down crop.
- Do not place the face or torso in the center text-safe zone. Leave the overlay area naturally open.
- Do not default to centered waist-up, hands-on-knees, front-facing, or three-quarter hero framing unless that is the selected composition.

## TikTok-Proven Text Source
- Text bank: not available
- Hook source family: main_long_run_fuel_45_v1
- Hook source signal: n/a
- Hook source URL: local://2026-07-27-three-account-personal-6x
- Slide text set: fallback
- Hook quality score: 56/70
- Rule: use this as proven structure and simplicity only. Do not copy creator-specific wording.

## Prompt Compiler Quality Gate
- Source of truth: strategy/automation/tiktok-instagram-slideshow-content-engine/SOURCE_OF_TRUTH_X_ARTICLE.md
- Coherence status: passed
- Selected by: problem_type_mapping
- Composition family: reflection_or_shadow_detail
- Checks: single workout phase selected before prompt generation; avatar lighting normalized to deck lighting family; weather normalized to selected lighting family; reference image background locked out of generated avatar world; hook image remains slide-1-only; hook composition selected independently from wardrobe and workout phase; Road to Marathon Fit workout posts use a training-day outfit key when account_profile is marathon; composition controls camera distance, face visibility, subject scale, and negative-space zone; do not repeat centered medium-close hero framing unless the selected composition asks for it; base image remains text-free for local Sharp/Canvas overlay

## Reddit Source Context
- Problem type: food
- Exact runner language: I wait until I feel hungry on longer runs, then the final part gets much harder.
- Source: local://2026-07-27-three-account-personal-6x

## Theme And Vibe
- Theme: food
- Route tag: lake
- Selected visual world: lake
- Lighting family: calm lake daylight
- Viewer emotion: fine early, empty and distracted later
- Background: calm lakeside running path with visible water and route context
- Vibe: realistic, calm, premium, useful, not overproduced
- Reddit-derived background: I wait until I feel hungry on longer runs, then the final part gets much harder.
- Visual keywords: lake path, water edge, calm daylight, open path, clean overlay space

## Background World Lock
- Reference image background is non-transferable.
- Use the reference image for runner face, body type, sweat, expression, and visual energy only.
- Required generated background: calm lakeside running path with visible water and route context
- Selected avatar world: lake
- Rule: Generate a new lake background that matches the deck visual world and lighting family.
- Allowed background context: mountain backdrop, large hill backdrop
- Forbidden background elements for this pack: dense forest route, track lane, stadium, gym, treadmill, city street
- If the reference image background conflicts with the selected avatar world, ignore the reference background completely.

## First Image Prompt Adapted To Theme
pre-run preparation moment: the runner is warming up naturally near the selected route, calm and ready, not posing

## Required Slideshow Spine
- Emotion: fine early, empty and distracted later
- Images 2.0: slide 1 only
- Avatar world: generated Coachi runner avatar in lake
- CTA: final slide only, one simple action
- Visual consistency: slides 2-7 must stay in lake with calm lake daylight
- Background rule: slide 1 must use a newly generated lake background, not the reference image background.

## Character Continuity Anchor
- Identity ID: watch_stole_the_run_runner_v1
- Reference image: content/slideshows/2026-04-26-watch-stole-the-run-8-slide/slides/source/01-hook.png
- Viral face/style reference: content/slideshows/2026-04-26-watch-stole-the-run-8-slide/slides/source/01-hook.png
- Stable traits: use the 2026-04-26 watch-stole-the-run runner as the primary appearance anchor; male runner, age 25-35; lean muscular endurance-athlete build; tan complexion; short dark slightly textured hair; same face family when the face is visible, with rotating believable running expressions; the face does not need to be centered, close, or fully visible in every hook image; identity can also carry through build, hair, kit, posture, silhouette, and serious runner energy; realistic sweat on face and shirt; sharp cheek and brow detail from the 2026-04-26 watch-stole-the-run look; technical running tops and shirtless warm-weather looks rotate with a 50/50 target; shirtless images are allowed when they read like real training, not model posing; no glasses, sunglasses, or sport eyewear for now; visible Apple Watch-style or Garmin-style running watch on one wrist, small and natural, no readable UI or logos; natural outdoor running context
- Variation policy: Use the 2026-04-26 watch-stole-the-run runner as the primary appearance reference, not the cleaner park-portrait avatar. Keep the sharper face, sweat, and serious human expression family when the face is visible, but do not require a centered face portrait. Some hook images should be back-view, far-away, side-profile, partial-body, or detail-led creator shots while still preserving the same runner identity through build, hair, kit, posture, silhouette, and serious runner energy. Use a 50/50 target split between shirtless warm-weather running looks and clothed technical running tops. Keep shirtless images athletic and non-sexual, never a model pose. Rotate workout phase, route, weather, light, camera angle, crop distance, face visibility, subject scale, face expression, and visible Apple Watch/Garmin-style watch type per pack. Default to no headwear. Eyewear is disabled for now: no glasses, sunglasses, sport eyewear, or clear lenses.

## Workout Phase For This Image
- Phase: pre-workout
- Moment: runner preparing before the session starts on a real outdoor route
- Body language: calm anticipation, relaxed shoulders, light warmup movement, ready but not posing
- Prompt cue: show the runner moments before starting: walking to the route, light dynamic warmup, or standing naturally with the route visible

## Avatar Variation For This Image
- Watch: visible Apple Watch-style smartwatch on one wrist
- Top: shirtless warm-weather running look
- Clothing category: shirtless
- Clothing rotation policy: 50/50 stable hash split between shirtless and clothed hook images
- Outfit key: shirtless_black_shorts_real_run_warm_weather
- Outfit note: none
- Headwear: no headwear
- Eyewear: no glasses
- Shorts: black 5-inch running shorts
- Watch brand family: Apple Watch
- Watch detail rule: rectangular Apple Watch-style running watch silhouette, small in-frame, no readable screen UI, no Apple logo, no watch-checking pose, never a wrist close-up
- Watch rotation policy: visible watch on every hook image, stable 50/50 rotation between Apple Watch-style and Garmin-style running watches
- Running equipment rule: Visible kit must read as real running equipment, not casual streetwear. Use technical running clothing when a top is selected, or a believable shirtless warm-weather running look when shirtless is selected. Always use proper running shorts, a natural visible running watch, and realistic sweat. Eyewear is disabled for now: no glasses, sunglasses, sport eyewear, or clear lenses. Do not add headwear unless explicitly selected. No brand logos.
- Camera angle: medium-close real running or cooldown angle, not a posed fitness shoot
- Face expression: focused strain with controlled breathing, not a beauty pose
- Weather: warm dry training conditions
- Lighting: calm lake daylight
- Watch rule: Use the selected visible watch type naturally on one wrist. The watch may read as Apple Watch-style or Garmin-style by silhouette only. Keep it small and believable in-frame. No readable screen UI, no logo, no wrist close-up, and no watch-checking pose.

## Hook Composition For Picture 1
- Composition family: reflection_or_shadow_detail
- Label: reflection or shadow detail
- Selection rule: stable_hash_candidate_phase_world
- Rotation policy: Hook composition rotates independently from clothing, workout phase, and visual world so Picture 1 does not default to repeated centered medium-close hero shots.
- Priority rule: Hook composition overrides the avatar variation angle when they conflict.
- Direction: use reflection, shadow, or partial body detail to break the repeated full-runner look
- Camera distance: detail-led frame with runner partly indirect
- Camera height: low phone angle near ground, water, or wet path
- Lens feel: specific creator detail shot
- Subject scale: runner body can be partial or reflected; environment fills the frame
- Face visibility: no direct face required
- Movement state: subtle movement, shadow, reflection, or passing stride
- Negative-space zone: natural open area in reflection, path, sky, or tree gap
- Background depth: selected visual world must still be identifiable
- Do not default to the common centered waist-up runner hero crop unless this selected composition explicitly requires it.

## Schema Prompt Adapted To Theme
photorealistic runner after a normal run, thoughtful but satisfied, clean text space

## Final Prompt To Use
Hard composition requirement before anything else: reflection or shadow detail. use reflection, shadow, or partial body detail to break the repeated full-runner look. Camera distance: detail-led frame with runner partly indirect. Camera height: low phone angle near ground, water, or wet path. Subject scale: runner body can be partial or reflected; environment fills the frame. Face visibility: no direct face required. Text-safe negative space: natural open area in reflection, path, sky, or tree gap. If this composition conflicts with the 2026-04-26 reference image pose or the avatar variation angle, ignore the reference pose and avatar angle. Do not place the face or torso in the center text-safe zone.

Create a photorealistic vertical 9:16 image of the selected Coachi runner identity: photorealistic athletic male runner, age 25-35, lean endurance-athlete build, tan complexion, short dark slightly textured hair, same face family across posts, realistic sweat, and believable outdoor running presence. The image should feel like a real TikTok runner/creator capture rather than a polished ad, brand thumbnail, or stock fitness campaign.

Use the 2026-04-26 watch-stole-the-run hook image as the primary Coachi runner appearance reference: fitted dark performance kit, visible sweat on face and shirt, sharper cheek and brow detail, cinematic contrast, shallow depth of field, and serious human expression family. Preserve the selected runner's appearance energy while adapting the route, pose, workout phase, camera angle, crop distance, face visibility, subject scale, and expression to this pack. Face expression for this image when the face is visible: focused strain with controlled breathing, not a beauty pose. The face can be hidden, partial, side-profile, small in frame, or not readable when the selected hook composition says so; identity should still carry through build, hair, running kit, posture, silhouette, sweat, and serious runner energy. Do not fall back to the cleaner park-portrait avatar. The reference image background is not part of the identity. Replace it with a new lake background matching this deck. Do not copy the reference image background, hands-on-hips pose, centered portrait crop, or visible watch unless the hook is specifically about watch anxiety.

Workout phase: pre-workout. Capture this moment: runner preparing before the session starts on a real outdoor route. Body language should show calm anticipation, relaxed shoulders, light warmup movement, ready but not posing. show the runner moments before starting: walking to the route, light dynamic warmup, or standing naturally with the route visible.

Wardrobe and running equipment for this image: shirtless warm-weather running look, black 5-inch running shorts, no headwear, no glasses, and visible Apple Watch-style smartwatch on one wrist. Visible kit must read as real running equipment, not casual streetwear. Use technical running clothing when a top is selected, or a believable shirtless warm-weather running look when shirtless is selected. Always use proper running shorts, a natural visible running watch, and realistic sweat. Eyewear is disabled for now: no glasses, sunglasses, sport eyewear, or clear lenses. Do not add headwear unless explicitly selected. No brand logos.. If headwear is "no headwear", do not add a cap, hat, beanie, headband, or other headwear. Eyewear is disabled for now: do not add glasses, sunglasses, sport eyewear, or clear lenses. Watch instruction: rectangular Apple Watch-style running watch silhouette, small in-frame, no readable screen UI, no Apple logo, no watch-checking pose, never a wrist close-up. The watch should support the Coachi wearable context but must not become the subject of the image.

Scene: calm lakeside running path with visible water and route context. Keep the image inside the selected visual world: lake. The background must visibly fit lake; do not import a different primary route world such as forest, mountain, gym, track, or street. If the selected world is lake, mountains or hills may appear only as distant background context while the lake remains primary. The image should feel like realistic, calm, premium, useful, not overproduced. Weather: warm dry training conditions. Lighting: calm lake daylight. Match the deck lighting family: calm lake daylight. The runner should look like a real person in a real run moment, not a model shoot. Keep body mechanics natural. Use realistic daylight, visible background detail, and a creator-native running post aesthetic: specific, human, slightly imperfect, and not overproduced.

Composition: follow this selected hook composition first: reflection or shadow detail. use reflection, shadow, or partial body detail to break the repeated full-runner look. If this conflicts with the avatar variation camera angle, the hook composition wins; the avatar variation supplies wardrobe, weather, lighting, and expression only. Camera distance: detail-led frame with runner partly indirect. Camera height: low phone angle near ground, water, or wet path. Lens feel: specific creator detail shot. Subject scale: runner body can be partial or reflected; environment fills the frame. Face visibility: no direct face required. Movement state: subtle movement, shadow, reflection, or passing stride. Negative space for local overlay text: natural open area in reflection, path, sky, or tree gap. Background depth: selected visual world must still be identifiable. Do not default to the common centered waist-up, front-facing, three-quarter, scenic hero crop unless that is explicitly the selected composition. No face distortion, no watch-checking pose, no hands-on-hips hero pose, no repeated static hero framing, no exaggerated emotion. Show the viewer emotion as fine early, empty and distracted later through believable body language, face tension when visible, and scene tension, not theatrical acting. Use a natural creator-style crop with enough clean negative space for the hook overlay, but avoid a staged poster layout.

## Character / Brand Anchor
photorealistic athletic male runner, lean muscular endurance-athlete build, masculine, tan complexion, short dark slightly textured hair, same face family across posts, natural run/post-run moment, realistic sweat, rotating believable runner expression, stronger 2026-04-26 watch-stole-the-run viral face style, selected wardrobe category from the 50/50 clothing rotation, visible Apple Watch-style or Garmin-style running watch on one wrist, selected visual world environment, premium fitness-editorial aesthetic

## Negative Constraints
Avoid: watch close-up, baked-in text, logos, fake steam, blurred background, unnatural stride, dense forest route, track lane, stadium, gym, treadmill, city street.
Do not change the primary route/world from lake. Lake decks may include mountains or hills in the background only when the lake path remains the clear primary world.
No text, no watermark, no brand logos, no readable watch UI, no app UI, no wrist close-up, no watch-checking pose, no extra limbs, no distorted hands, no fake steam, no blurred-out background.
