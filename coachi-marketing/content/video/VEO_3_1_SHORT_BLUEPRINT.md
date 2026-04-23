# Veo 3.1 Short Blueprint

Use this blueprint for Coachi-style organic short videos where Veo 3.1 generates the source footage and the shared render pipeline adds text, pacing, and platform variants.

## Purpose
Create high-quality vertical runner videos that feel premium, believable, and emotionally clear, while keeping the runner's face out of frame or unreadable by default.

Default use case:
- runner pain
- uncertainty during training
- watch confusion
- effort vs data tension
- no app UI
- no obvious brand pitch

## Non-Negotiables
- source engine: `Veo 3.1`
- aspect ratio: `9:16`
- target output: `1080p`
- source duration: `7 to 9s`
- prompt language: English
- one shared source clip for TikTok and Instagram
- render both platforms from the existing shared pipeline
- no separate Instagram render logic
- no separate TikTok render logic
- default source structure: `1` continuous scene, not multiple scene beats inside one 7-9 second clip

## Creative Standard
The video should feel like:
- a real runner moment, not an ad
- premium but grounded
- cinematic, but still believable
- emotionally clear in the first `2s`

The viewer should understand the tension before they finish reading the first line.

## Simplification Rule
If a Veo clip starts looking synthetic, simplify the source prompt before adding more direction.

Default fix order:
- remove acting beats
- remove watch checks and gestures
- keep one steady jog
- keep a no-face angle
- keep the camera smooth
- let text and voiceover carry the story

Working default prompt shape:
`Male runner, age 25-35, lean endurance build, short dark slightly textured hair, medium tan complexion, jogging steadily along <route>. Side/back no-face angle. Smooth tracking camera.`

## Character Anchor
Default organic runner anchor:
- male
- age `25-35`
- lean endurance-athlete build
- short dark slightly textured hair
- calm, focused body language
- minimal performance styling
- no-face default: back view, over-shoulder, side profile turned away from camera, chest-down, or face-obscured framing

Keep these stable across related assets:
- gender
- body type
- hair color and style when visible
- stride and movement feel

Only vary:
- angle
- background / route
- clothes
- weather
- lighting
- scenario
- exact no-face framing choice

Per-video rule:
- every new clip must change the visual recipe from the previous clip
- do not approve two consecutive clips with the same angle + background + clothes + weather + lighting combination
- continuity should come from the runner anchor, not from reusing the same scene

## Shot Blueprint
Best default shot for this format:
- vertical handheld or lightly stabilized running shot
- medium or medium-wide framing, not extreme close-up
- no-face default: back-of-head, over-shoulder, side profile turned away from camera, chest-down, or watch-and-torso framing
- runner occupies the center vertical band without making the face the focal point
- the watch-check motion must happen in the first half of the clip
- keep the clip as one continuous scene with one stable locomotion pattern
- communicate tension through posture, arm movement, and one quick watch glance instead of facial close-up or gait changes
- if the runner checks the watch, make it a one-arm wrist glance close to the torso while the opposite arm keeps a normal counter-swing
- imply cool weather through lighting, route mood, and wardrobe before using visible breath vapor
- keep the route and environment readable with natural depth of field; avoid heavy background blur or creamy bokeh
- keep the runner's head and torso direction natural; if the camera angle changes, make the camera move instead of making the runner twist or look off to the side
- when varying angle inside a single clip, prefer a slow floating orbit or glide around the runner with smooth stabilized motion that can feel lightly drone-like, but keep it grounded and believable

Recommended scene setup:
- blue hour or early morning
- quiet road, path, or residential run route
- no crowd
- no gym
- no big brand logos
- no extra characters unless the concept explicitly needs them

## Variation Matrix
Before writing a new prompt, compare it to the last approved clip and change all of these:
- angle:
  - trailing center
  - rear three-quarter from behind-right
  - rear three-quarter from behind-left
  - side-rear tracking
  - chest-down watch-side tracking
- background / route:
  - quiet road
  - path
  - residential street
  - waterside route
  - light hill / slight incline
- clothes:
  - different top color
  - different shorts/tights
  - different cap/no-cap state if the anchor still feels consistent
- weather:
  - dry
  - overcast
  - light mist
  - soft sun
- lighting:
  - blue hour
  - early morning
  - late afternoon
  - flat overcast

Minimum rule:
- change at least `4` of those `5` categories on every consecutive clip
- angle must always change

## Framing Rules
These matter more than stylistic flourishes.

Always leave room for overlays:
- top third should stay visually clean enough for hook text if needed
- default framing should avoid showing the face clearly at all
- lower third is the primary text zone
- body text should sit on torso, road, or negative space instead of facial features

Avoid:
- frontal face close-ups
- readable facial close-ups that make the clip feel like influencer content
- shallow depth of field that smears the route into an unreal blur
- busy backgrounds that reduce text readability
- dramatic camera motion that makes overlays feel unstable
- fast orbiting or aggressive circling that feels synthetic
- multiple scene transitions inside one short source clip
- cadence changes that force the model to re-solve the stride mid-shot

## Text Style Blueprint
Match the approved Coachi organic style:
- big white text
- strong dark outline or shadow
- lower-half placement
- face stays out of frame, blurred, or visually secondary
- clear line spacing when text wraps
- no heavy opaque text box unless readability absolutely fails

Default overlay behavior:
- hook text: large, high-impact, all caps
- body text: slightly smaller, lower than the hook
- CTA text: optional, and usually omit for quality-first organic posts

Text placement rules:
- hook should sit high enough to hit fast, but not over the eyes
- body should sit lower than the hook with clear spacing
- always preserve visible vertical gap between wrapped lines
- if the face is too large in frame, push the body block further down or reduce body size before changing the shot

## Copy Rules
The copy should:
- describe the tension simply
- sound like a real runner thought
- avoid corporate phrasing
- avoid app language
- avoid explaining too much

Good themes:
- easy run feels easy, watch says otherwise
- pace feels fine, HR looks bad
- effort feels calm, numbers create panic
- the watch is useful, but not the whole picture

Avoid:
- long sentences
- generic motivation
- direct selling
- product claims in the video itself

## Veo Prompt Structure
Use this shape when writing prompts:

1. format and camera
2. subject anchor
3. running context
4. one readable emotional shift
5. realism constraints
6. exclusions

Starter structure:

```text
Vertical 9:16 cinematic handheld running shot at blue hour on a quiet road. Male runner age 25-35 with lean endurance build, short dark slightly textured hair, running alone outdoors. Keep the framing no-face by default: behind, over-shoulder, side profile turned away from camera, chest-down, or watch-and-torso composition. Natural easy-run effort, calm breathing, subtle sweat, premium but grounded realism. Keep the route and environment readable with natural depth of field, not heavy background blur. Make this one continuous single-scene jogging shot with stable cadence from start to finish. He glances briefly at his sports watch once, but keeps the same running rhythm. Keep motion believable and natural. No logos, no text in the footage, no product shots, no extra characters, no gym, no influencer posing, no exaggerated drama, no clean front-facing face close-up, no walking transition, no stutter step, no stride reset.
```

Variation add-on:

```text
Make this clip visually distinct from the previous one by changing the camera angle, route background, clothing color, weather feel, and lighting setup while keeping the same runner identity.
```

## Negative Constraints
Add these when the output is drifting:
- no warped hands
- no two-hand gesture during the watch check
- no both-hands-raised pose
- no broken watch geometry
- no extra fingers
- no fake visible breath vapor or mouth steam cloud unless the scene is explicitly extreme cold
- no readable front-facing face unless the concept explicitly needs it
- no melted facial features
- no fake running stride
- no heavy background blur or unreal shallow focus
- no sideways head turn used just to create visual variation
- no oversharpened cinematic glow
- no branded clothing
- no text embedded in source footage

## Source-To-Render Workflow
1. Generate the source clip with Veo 3.1.
2. Save it to `content/video/generated/sources/...`
3. Point the shared render spec at that source via `source_video_asset`.
4. Keep platform differences in the render spec only.
5. Render TikTok and Instagram from the same source clip.

Required spec fields for this pattern:
- `source_video_mode: "veo"`
- `source_video_prompt`
- `source_video_asset`
- `variant_goal`
- `platform_hook_text`
- `comment_bait_text`

Optional spoken-audio fields:
- `voiceover_enabled`
- `voiceover_text`
- `voice_language`
- `voice_persona`
- `voice_id_override`
- `voice_settings_mode`

## Voiceover Rule
Use ElevenLabs voiceover as the default for Coachi short videos.

Default behavior:
- if `voiceover_enabled` is omitted, treat it as `true`
- if `voiceover_text` is blank, derive the spoken line from the hook/body/cta copy
- if a clip should stay silent, set `voiceover_enabled: false`

Use the default voiceover especially for:
- founder proof
- simple reframing
- one-line correction that feels stronger spoken than written

Default voiceover standard:
- short
- calm
- natural
- one thought, not a script
- no hype delivery

## Platform Defaults
### TikTok
- slightly faster pacing
- stronger first-frame interruption
- caption optimized for comments
- choose the harshest hook if the clip can support it

### Instagram Reels
- always keep source framing at `9:16`
- prefer cleaner spacing than TikTok
- avoid overfilling the frame with text
- optimize for saves and shares, not just interruption

## Quality Checklist
Before approving a clip, verify:
- source reads as believable, not AI-sloppy
- watch-check moment is readable
- the face stays out of frame, blurred, or visually secondary
- text fits the lower part of the frame cleanly
- line spacing stays readable on mobile
- first frame is understandable without audio
- no Coachi name in the video unless explicitly requested
- no app UI unless explicitly requested
- TikTok and Instagram exports both remain `9:16`

## Decision Rules
If the result feels wrong:
- first fix framing
- then fix text placement
- then fix copy
- only regenerate the source clip if the footage itself is the problem

Do not use Veo as an excuse to create more edits. Keep one source clip, three hook variants, and a clear test intent for each.

## Default Test Variant Set
- Variant A: emotional recognition
- Variant B: hardest interruption
- Variant C: strongest confession/comment bait

## Output Rule
Every Veo concept should produce:
- one source clip
- one shared spec family
- TikTok and Instagram exports for each chosen hook variant
- one dated brief if the concept is campaign-specific
