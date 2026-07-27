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
Why I ran out of food 35 minutes into my longest run

## Mandatory Picture 1 Composition
This is a hard requirement and must be followed before identity styling, wardrobe, or reference-image pose.
- Composition family: lake_edge_back_view
- Direction: make the lake world obvious, with the runner from behind so it does not feel like another avatar portrait
- Camera distance: wide or medium-wide back-view frame
- Camera height: eye-height or low shoreline phone angle
- Subject scale: runner fills 18-32% of frame
- Face visibility: face hidden or tiny profile
- Face-framing safety: if any face is visible, keep the entire face and full head inside the frame, including hairline, forehead, ears, and chin. Never crop through the head, face, forehead, chin, or neck. If the composition cannot show a complete face and head, turn the runner fully away so no face is visible.
- Movement state: standing naturally before the run starts, facing the lake route from behind
- Text-safe negative space: water/sky/shoreline area with natural contrast
- If face visibility says the face is hidden, no direct face, small, partial, or not readable, do not create a close face portrait.
- A partial body is allowed only when it is clearly intentional and contains no face. Never create an accidental neck-down crop.
- Do not place the face or torso in the center text-safe zone. Leave the overlay area naturally open.
- Do not default to centered waist-up, hands-on-knees, front-facing, or three-quarter hero framing unless that is the selected composition.

## TikTok-Proven Text Source
- Text bank: not available
- Hook source family: marathon_food_minute_35_v1
- Hook source signal: n/a
- Hook source URL: local://inputs/research/road-to-marathon-fit-personal-experience-bank.json#rtmf_week08_long_run_food_miss
- Slide text set: fallback
- Hook quality score: 58/70
- Rule: use this as proven structure and simplicity only. Do not copy creator-specific wording.

## Prompt Compiler Quality Gate
- Source of truth: strategy/automation/tiktok-instagram-slideshow-content-engine/SOURCE_OF_TRUTH_X_ARTICLE.md
- Coherence status: passed
- Selected by: problem_type_mapping
- Composition family: lake_edge_back_view
- Checks: single workout phase selected before prompt generation; avatar lighting normalized to deck lighting family; weather normalized to selected lighting family; reference image background locked out of generated avatar world; hook image remains slide-1-only; hook composition selected independently from wardrobe and workout phase; Road to Marathon Fit workout posts use a training-day outfit key when account_profile is marathon; composition controls camera distance, face visibility, subject scale, and negative-space zone; do not repeat centered medium-close hero framing unless the selected composition asks for it; base image remains text-free for local Sharp/Canvas overlay

## Reddit Source Context
- Problem type: food
- Exact runner language: I packed less than planned and spent the second half thinking about the snack I left at home.
- Source: local://inputs/research/road-to-marathon-fit-personal-experience-bank.json#rtmf_week08_long_run_food_miss

## Theme And Vibe
- Theme: food
- Route tag: lake
- Selected visual world: lake
- Lighting family: calm lake daylight
- Viewer emotion: fine early, distracted and hungry later
- Background: calm lakeside running path with visible water and route context
- Vibe: realistic, calm, premium, useful, not overproduced
- Reddit-derived background: I packed less than planned and spent the second half thinking about the snack I left at home.
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
- Emotion: fine early, distracted and hungry later
- Images 2.0: slide 1 only
- Avatar world: generated Road to Marathon Fit runner avatar in lake
- CTA: final slide only, one simple action
- Visual consistency: slides 2-7 must stay in lake with calm lake daylight
- Background rule: slide 1 must use a newly generated lake background, not the reference image background.

## Character Continuity Anchor
- Identity ID: road_to_marathon_fit_female_runner_v1
- Reference image: content/slideshows/visual-library/owned-source/road-to-marathon-fit-avatar/road-to-marathon-fit-female-runner-v1-reference.png
- Viral face/style reference: none; use identity reference only
- Stable traits: use the Road to Marathon Fit female runner identity for the marathon account; fictional adult woman, late 20s to early 30s; realistic non-elite beginner-runner build, not model-polished; natural warm face and brown hair tied back; relatable marathon-training journey energy; realistic sweat, flushed face, and honest effort when during or after workouts; emotion can rotate between nervous, focused, tired, happy, satisfied, and proud; face may be visible on slide 1 hook images, but supporting slides must use Pinterest/Supabase library assets; modest athletic styling, no glamour pose, extreme transformation, or fake before-after framing; visible Apple Watch-style or Garmin-style running watch on one wrist, small and natural, no readable UI or logos; natural outdoor running context in forest, mountain, or lake only
- Variation policy: Use this as the Road to Marathon Fit avatar: a fictional female beginner runner starting a six-month marathon build. She should sometimes look tired, sweaty, and post-workout happy or satisfied, not always polished. Keep body changes subtle over time; do not create dramatic transformation claims. Rotate forest, mountain, and lake worlds; rotate pre-workout, during-workout, and post-workout moments; keep the runner relatable, modest, and training-focused. Do not use the main Coachi male runner or Runner Watch Lab male runner as style, face, body, pose, or age reference.

## Workout Phase For This Image
- Phase: pre-workout
- Moment: runner preparing before the session starts on a real outdoor route
- Body language: calm anticipation, relaxed shoulders, light warmup movement, ready but not posing
- Prompt cue: show the runner moments before starting: walking to the route, light dynamic warmup, or standing naturally with the route visible

## Avatar Variation For This Image
- Watch: visible Apple Watch-style or Garmin-style running watch on one wrist
- Top: lavender lightweight long-sleeve running top
- Clothing category: marathon_workout_day
- Clothing rotation policy: Every Road to Marathon Fit workout day must use a distinct outfit key so the same runner looks like a new day. Do not reuse the exact same top, shorts, and headwear on adjacent workout posts.
- Outfit key: day_03_lavender_long_sleeve_charcoal_shorts
- Outfit note: day 3 workout outfit, lavender long sleeve and charcoal shorts
- Headwear: no headwear
- Eyewear: no glasses
- Shorts: charcoal running shorts
- Watch brand family: Apple Watch/Garmin-style rotation
- Watch detail rule: Apple Watch-style or Garmin-style running watch silhouette, small in-frame, no readable screen UI, no brand logo, no wrist close-up, no watch-checking pose unless the post is specifically about watches
- Watch rotation policy: Road to Marathon Fit uses Apple Watch-style or Garmin-style running watch silhouettes only, with no readable UI or logos.
- Running equipment rule: Road to Marathon Fit wardrobe rule: use the exact selected modest technical outfit for this pack so workout days look like separate real days. Do not use shirtless looks, glamour styling, casual streetwear, brand logos, or a reused default outfit. The selected top, shorts/tights, headwear, and small Apple Watch-style or Garmin-style running watch silhouette must be visible enough to signal the outfit change, while still feeling like a real training moment.
- Camera angle: natural creator-style training-day frame with the full outfit readable enough to signal a new day
- Face expression: honest training effort, sometimes tired or post-workout satisfied, not polished
- Weather: realistic mild training-day conditions
- Lighting: calm lake daylight
- Watch rule: Use the selected visible watch type naturally on one wrist. The watch may read as Apple Watch-style or Garmin-style by silhouette only. Keep it small and believable in-frame. No readable screen UI, no logo, no wrist close-up, and no watch-checking pose.

## Hook Composition For Picture 1
- Composition family: lake_edge_back_view
- Label: lake edge back-view frame
- Selection rule: stable_hash_candidate_phase_world
- Rotation policy: Hook composition rotates independently from clothing, workout phase, and visual world so Picture 1 does not default to repeated centered medium-close hero shots.
- Priority rule: Hook composition overrides the avatar variation angle when they conflict.
- Direction: make the lake world obvious, with the runner from behind so it does not feel like another avatar portrait
- Camera distance: wide or medium-wide back-view frame
- Camera height: eye-height or low shoreline phone angle
- Lens feel: clean but not glossy phone capture
- Subject scale: runner fills 18-32% of frame
- Face visibility: face hidden or tiny profile
- Movement state: standing naturally before the run starts, facing the lake route from behind
- Negative-space zone: water/sky/shoreline area with natural contrast
- Background depth: lake is primary; mountains or hills may sit far in the background
- Do not default to the common centered waist-up runner hero crop unless this selected composition explicitly requires it.

## Schema Prompt Adapted To Theme
photorealistic runner after a normal run, thoughtful but satisfied, clean text space

## Final Prompt To Use
Hard composition requirement before anything else: lake edge back-view frame. make the lake world obvious, with the runner from behind so it does not feel like another avatar portrait. Camera distance: wide or medium-wide back-view frame. Camera height: eye-height or low shoreline phone angle. Subject scale: runner fills 18-32% of frame. Face visibility: face hidden or tiny profile. Text-safe negative space: water/sky/shoreline area with natural contrast. If this composition conflicts with the 2026-04-26 reference image pose or the avatar variation angle, ignore the reference pose and avatar angle. Do not place the face or torso in the center text-safe zone.

Create a photorealistic vertical 9:16 image of the selected Road to Marathon Fit runner identity: photorealistic fictional adult female beginner runner, late 20s to early 30s, realistic non-elite beginner build, natural warm face, brown hair tied back, relatable marathon-training journey energy, realistic sweat, modest simple technical running kit, visible Apple Watch-style or Garmin-style running watch on one wrist, real outdoor running moment. The image should feel like a real TikTok runner/creator capture rather than a polished ad, brand thumbnail, or stock fitness campaign.

Use only the Road to Marathon Fit female-runner reference as the identity reference. Do not use or imitate the main Coachi male runner, the Runner Watch Lab male runner, their faces, body types, poses, or original backgrounds. Preserve the selected runner's appearance energy while adapting the route, pose, workout phase, camera angle, crop distance, face visibility, subject scale, and expression to this pack. Face expression for this image when the face is visible: honest training effort, sometimes tired or post-workout satisfied, not polished. The face can be hidden, partial, side-profile, small in frame, or not readable when the selected hook composition says so; identity should still carry through build, hair, running kit, posture, silhouette, sweat, and serious runner energy. Do not fall back to the main Coachi male runner, Runner Watch Lab male runner, or any generic slim fitness influencer. The reference image background is not part of the identity. Replace it with a new lake background matching this deck. Do not copy the reference image background, hands-on-hips pose, centered portrait crop, or visible watch unless the hook is specifically about watch anxiety.

Workout phase: pre-workout. Capture this moment: runner preparing before the session starts on a real outdoor route. Body language should show calm anticipation, relaxed shoulders, light warmup movement, ready but not posing. show the runner moments before starting: walking to the route, light dynamic warmup, or standing naturally with the route visible.

Wardrobe and running equipment for this image: lavender lightweight long-sleeve running top, charcoal running shorts, no headwear, no glasses, and visible Apple Watch-style or Garmin-style running watch on one wrist. Road to Marathon Fit wardrobe rule: use the exact selected modest technical outfit for this pack so workout days look like separate real days. Do not use shirtless looks, glamour styling, casual streetwear, brand logos, or a reused default outfit. The selected top, shorts/tights, headwear, and small Apple Watch-style or Garmin-style running watch silhouette must be visible enough to signal the outfit change, while still feeling like a real training moment.. If headwear is "no headwear", do not add a cap, hat, beanie, headband, or other headwear. Eyewear is disabled for now: do not add glasses, sunglasses, sport eyewear, or clear lenses. Watch instruction: Apple Watch-style or Garmin-style running watch silhouette, small in-frame, no readable screen UI, no brand logo, no wrist close-up, no watch-checking pose unless the post is specifically about watches. The watch should support the marathon-training context but must not become the subject of the image.

Scene: calm lakeside running path with visible water and route context. Keep the image inside the selected visual world: lake. The background must visibly fit lake; do not import a different primary route world such as forest, mountain, gym, track, or street. If the selected world is lake, mountains or hills may appear only as distant background context while the lake remains primary. The image should feel like realistic, calm, premium, useful, not overproduced. Weather: realistic mild training-day conditions. Lighting: calm lake daylight. Match the deck lighting family: calm lake daylight. The runner should look like a real person in a real run moment, not a model shoot. Keep body mechanics natural. Use realistic daylight, visible background detail, and a creator-native running post aesthetic: specific, human, slightly imperfect, and not overproduced.

Composition: follow this selected hook composition first: lake edge back-view frame. make the lake world obvious, with the runner from behind so it does not feel like another avatar portrait. If this conflicts with the avatar variation camera angle, the hook composition wins; the avatar variation supplies wardrobe, weather, lighting, and expression only. Camera distance: wide or medium-wide back-view frame. Camera height: eye-height or low shoreline phone angle. Lens feel: clean but not glossy phone capture. Subject scale: runner fills 18-32% of frame. Face visibility: face hidden or tiny profile. Movement state: standing naturally before the run starts, facing the lake route from behind. Negative space for local overlay text: water/sky/shoreline area with natural contrast. Background depth: lake is primary; mountains or hills may sit far in the background. Do not default to the common centered waist-up, front-facing, three-quarter, scenic hero crop unless that is explicitly the selected composition. No face distortion, no watch-checking pose, no hands-on-hips hero pose, no repeated static hero framing, no exaggerated emotion. Show the viewer emotion as fine early, distracted and hungry later through believable body language, face tension when visible, and scene tension, not theatrical acting. Use a natural creator-style crop with enough clean negative space for the hook overlay, but avoid a staged poster layout.

## Character / Brand Anchor
photorealistic fictional female beginner runner training for a marathon, realistic beginner build, natural face, brown hair tied back, modest simple technical running kit, visible Apple Watch-style or Garmin-style running watch on one wrist, honest running effort, tired-but-happy post-workout satisfaction when appropriate, selected forest/mountain/lake route world, believable TikTok-native marathon journal aesthetic

## Negative Constraints
Avoid: watch close-up, baked-in text, logos, fake steam, blurred background, unnatural stride, dense forest route, track lane, stadium, gym, treadmill, city street.
Do not change the primary route/world from lake. Lake decks may include mountains or hills in the background only when the lake path remains the clear primary world.
No text, no watermark, no brand logos, no readable watch UI, no app UI, no wrist close-up, no watch-checking pose, no extra limbs, no distorted hands, no fake steam, no blurred-out background.
