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
Why I thought one missed run had erased my progress

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
- Hook source family: marathon_missed_run_progress_v1
- Hook source signal: n/a
- Hook source URL: local://inputs/research/road-to-marathon-fit-personal-experience-bank.json#rtmf_week08_missed_run_progress
- Slide text set: fallback
- Hook quality score: 58/70
- Rule: use this as proven structure and simplicity only. Do not copy creator-specific wording.

## Prompt Compiler Quality Gate
- Source of truth: strategy/automation/tiktok-instagram-slideshow-content-engine/SOURCE_OF_TRUTH_X_ARTICLE.md
- Coherence status: passed
- Selected by: stable_hash_fallback
- Composition family: reflection_or_shadow_detail
- Checks: single workout phase selected before prompt generation; avatar lighting normalized to deck lighting family; weather normalized to selected lighting family; reference image background locked out of generated avatar world; hook image remains slide-1-only; hook composition selected independently from wardrobe and workout phase; Road to Marathon Fit workout posts use a training-day outfit key when account_profile is marathon; composition controls camera distance, face visibility, subject scale, and negative-space zone; do not repeat centered medium-close hero framing unless the selected composition asks for it; base image remains text-free for local Sharp/Canvas overlay

## Reddit Source Context
- Problem type: recovery day guilt
- Exact runner language: Life got in the way and I missed one run. I left the week alone instead of squeezing it in.
- Source: local://inputs/research/road-to-marathon-fit-personal-experience-bank.json#rtmf_week08_missed_run_progress

## Theme And Vibe
- Theme: recovery day guilt
- Route tag: lake
- Selected visual world: lake
- Lighting family: calm lake daylight
- Viewer emotion: guilty, then relieved
- Background: calm lakeside running path with visible water and route context
- Vibe: realistic, calm, premium, useful, not overproduced
- Reddit-derived background: Life got in the way and I missed one run. I left the week alone instead of squeezing it in.
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
show a runner in a believable during-run or easy-run moment with clean negative space for overlay text

## Required Slideshow Spine
- Emotion: guilty, then relieved
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
- Phase: during-workout
- Moment: runner in the middle of the session with steady controlled effort
- Body language: natural stride, consistent cadence, focused breathing, no stutter step or unnatural turn
- Prompt cue: show the runner moving naturally during the run with visible route context and believable motion

## Avatar Variation For This Image
- Watch: visible Apple Watch-style or Garmin-style running watch on one wrist
- Top: mint lightweight long-sleeve running top
- Clothing category: marathon_support_recovery
- Clothing rotation policy: Extra same-day Road to Marathon Fit posts should use support-topic outfits for food, health, body, apps, shoes, watches, gear, progress, or routine topics instead of looking like another workout.
- Outfit key: marathon_body_mint_long_sleeve_black_shorts
- Outfit note: body or recovery support outfit, mint long sleeve and black shorts
- Headwear: no headwear
- Eyewear: no glasses
- Shorts: black running shorts
- Watch brand family: Apple Watch/Garmin-style rotation
- Watch detail rule: Apple Watch-style or Garmin-style running watch silhouette, small in-frame, no readable screen UI, no brand logo, no wrist close-up, no watch-checking pose unless the post is specifically about watches
- Watch rotation policy: Road to Marathon Fit uses Apple Watch-style or Garmin-style running watch silhouettes only, with no readable UI or logos.
- Running equipment rule: Road to Marathon Fit wardrobe rule: use the exact selected modest technical outfit for this pack so workout days look like separate real days. Do not use shirtless looks, glamour styling, casual streetwear, brand logos, or a reused default outfit. The selected top, shorts/tights, headwear, and small Apple Watch-style or Garmin-style running watch silhouette must be visible enough to signal the outfit change, while still feeling like a real training moment.
- Camera angle: natural creator-style support-topic frame with the outfit readable but not posed
- Face expression: calm practical creator expression, not a fitness ad pose
- Weather: realistic mild training-day conditions
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
same runner on calm lakeside running path with visible water and route context, realistic steady jog, clean negative space for headline, natural light

## Final Prompt To Use
Hard composition requirement before anything else: reflection or shadow detail. use reflection, shadow, or partial body detail to break the repeated full-runner look. Camera distance: detail-led frame with runner partly indirect. Camera height: low phone angle near ground, water, or wet path. Subject scale: runner body can be partial or reflected; environment fills the frame. Face visibility: no direct face required. Text-safe negative space: natural open area in reflection, path, sky, or tree gap. If this composition conflicts with the 2026-04-26 reference image pose or the avatar variation angle, ignore the reference pose and avatar angle. Do not place the face or torso in the center text-safe zone.

Create a photorealistic vertical 9:16 image of the selected Road to Marathon Fit runner identity: photorealistic fictional adult female beginner runner, late 20s to early 30s, realistic non-elite beginner build, natural warm face, brown hair tied back, relatable marathon-training journey energy, realistic sweat, modest simple technical running kit, visible Apple Watch-style or Garmin-style running watch on one wrist, real outdoor running moment. The image should feel like a real TikTok runner/creator capture rather than a polished ad, brand thumbnail, or stock fitness campaign.

Use only the Road to Marathon Fit female-runner reference as the identity reference. Do not use or imitate the main Coachi male runner, the Runner Watch Lab male runner, their faces, body types, poses, or original backgrounds. Preserve the selected runner's appearance energy while adapting the route, pose, workout phase, camera angle, crop distance, face visibility, subject scale, and expression to this pack. Face expression for this image when the face is visible: calm practical creator expression, not a fitness ad pose. The face can be hidden, partial, side-profile, small in frame, or not readable when the selected hook composition says so; identity should still carry through build, hair, running kit, posture, silhouette, sweat, and serious runner energy. Do not fall back to the main Coachi male runner, Runner Watch Lab male runner, or any generic slim fitness influencer. The reference image background is not part of the identity. Replace it with a new lake background matching this deck. Do not copy the reference image background, hands-on-hips pose, centered portrait crop, or visible watch unless the hook is specifically about watch anxiety.

Workout phase: during-workout. Capture this moment: runner in the middle of the session with steady controlled effort. Body language should show natural stride, consistent cadence, focused breathing, no stutter step or unnatural turn. show the runner moving naturally during the run with visible route context and believable motion.

Wardrobe and running equipment for this image: mint lightweight long-sleeve running top, black running shorts, no headwear, no glasses, and visible Apple Watch-style or Garmin-style running watch on one wrist. Road to Marathon Fit wardrobe rule: use the exact selected modest technical outfit for this pack so workout days look like separate real days. Do not use shirtless looks, glamour styling, casual streetwear, brand logos, or a reused default outfit. The selected top, shorts/tights, headwear, and small Apple Watch-style or Garmin-style running watch silhouette must be visible enough to signal the outfit change, while still feeling like a real training moment.. If headwear is "no headwear", do not add a cap, hat, beanie, headband, or other headwear. Eyewear is disabled for now: do not add glasses, sunglasses, sport eyewear, or clear lenses. Watch instruction: Apple Watch-style or Garmin-style running watch silhouette, small in-frame, no readable screen UI, no brand logo, no wrist close-up, no watch-checking pose unless the post is specifically about watches. The watch should support the marathon-training context but must not become the subject of the image.

Scene: calm lakeside running path with visible water and route context. Keep the image inside the selected visual world: lake. The background must visibly fit lake; do not import a different primary route world such as forest, mountain, gym, track, or street. If the selected world is lake, mountains or hills may appear only as distant background context while the lake remains primary. The image should feel like realistic, calm, premium, useful, not overproduced. Weather: realistic mild training-day conditions. Lighting: calm lake daylight. Match the deck lighting family: calm lake daylight. The runner should look like a real person in a real run moment, not a model shoot. Keep body mechanics natural. Use realistic daylight, visible background detail, and a creator-native running post aesthetic: specific, human, slightly imperfect, and not overproduced.

Composition: follow this selected hook composition first: reflection or shadow detail. use reflection, shadow, or partial body detail to break the repeated full-runner look. If this conflicts with the avatar variation camera angle, the hook composition wins; the avatar variation supplies wardrobe, weather, lighting, and expression only. Camera distance: detail-led frame with runner partly indirect. Camera height: low phone angle near ground, water, or wet path. Lens feel: specific creator detail shot. Subject scale: runner body can be partial or reflected; environment fills the frame. Face visibility: no direct face required. Movement state: subtle movement, shadow, reflection, or passing stride. Negative space for local overlay text: natural open area in reflection, path, sky, or tree gap. Background depth: selected visual world must still be identifiable. Do not default to the common centered waist-up, front-facing, three-quarter, scenic hero crop unless that is explicitly the selected composition. No face distortion, no watch-checking pose, no hands-on-hips hero pose, no repeated static hero framing, no exaggerated emotion. Show the viewer emotion as guilty, then relieved through believable body language, face tension when visible, and scene tension, not theatrical acting. Use a natural creator-style crop with enough clean negative space for the hook overlay, but avoid a staged poster layout.

## Character / Brand Anchor
photorealistic fictional female beginner runner training for a marathon, realistic beginner build, natural face, brown hair tied back, modest simple technical running kit, visible Apple Watch-style or Garmin-style running watch on one wrist, honest running effort, tired-but-happy post-workout satisfaction when appropriate, selected forest/mountain/lake route world, believable TikTok-native marathon journal aesthetic

## Negative Constraints
Avoid: watch close-up, baked-in text, logos, fake steam, blurred background, unnatural stride, dense forest route, track lane, stadium, gym, treadmill, city street.
Do not change the primary route/world from lake. Lake decks may include mountains or hills in the background only when the lake path remains the clear primary world.
No text, no watermark, no brand logos, no readable watch UI, no app UI, no wrist close-up, no watch-checking pose, no extra limbs, no distorted hands, no fake steam, no blurred-out background.
