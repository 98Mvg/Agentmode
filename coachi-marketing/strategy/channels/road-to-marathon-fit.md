# Road to Marathon Fit

## Account Role

Road to Marathon Fit is the third TikTok lane: a fictional AI marathon-training journal with a female beginner-runner avatar.

The account should feel like a follow-along training story: the viewer follows her
bad runs, small decisions, changing confidence, and six-month attempt to reach the
start line. It is not a teaching account and it is not a Coachi ad account.

Language is English only.

## Visual Production Rule

- Use exactly `1` Images 2.0 image per slideshow: slide 1 hook only.
- Slides 2 through 7 must use approved Pinterest-derived visual-library assets from Supabase/local fallback.
- Slide 7 should use the same route-world Pinterest library as the deck, not a generated image or local CTA template.
- Do not generate full-deck AI image sets for this account.
- Do not use unlicensed Reddit, Pinterest, TikTok, Instagram, or creator images as production assets.
- Reddit and Pinterest are allowed as:
  - mood/reference research
  - language research
  - style notes
  - source URLs for future rights review
- Production images after slide 1 must come from the approved local/Supabase library path.

## Avatar Identity

Slide 1 uses the Road to Marathon Fit female runner identity:

- fictional adult woman, late 20s to early 30s
- realistic non-elite beginner-runner build
- natural brown hair tied back
- simple technical running kit
- generic smartwatch only, no readable UI or logos
- believable sweat, fatigue, and effort
- no sexualized styling, glamour pose, fake transformation, or extreme before/after framing

Reference:

`content/slideshows/visual-library/owned-source/road-to-marathon-fit-avatar/road-to-marathon-fit-female-runner-v1-reference.png`

## Approved Worlds

Use the same world model as the main slideshow system:

- `forest` -> `nature_context`
- `mountain` -> `hills_effort`
- `lake` -> `lake_calm`
- emotional close/detail support -> `details_emotion`
- final save/follow slide -> `cta_ending`

Keep each deck in one primary world. If slide 1 is forest, support slides stay forest-compatible. If mountain, support slides use hill/mountain effort. If lake, support slides use lake/calm route visuals.

## Mood Rotation

The girl should not always look fresh or polished.

Rotate:

- pre-workout nervous/ready
- during-workout focused/working
- post-workout tired but happy
- post-workout satisfied/proud
- bad-day honest but still consistent

The best emotional target is: tired, sweaty, relieved, and satisfied after doing the work.

## Wardrobe And Daily Continuity

Every workout post should look like a new training day.

- Change the visible workout outfit for every workout day.
- Do not reuse the exact same top, shorts/tights, and headwear on adjacent workout posts.
- Keep clothing modest, practical, and technical: running shirts, singlets, long sleeves, shorts, tights, caps/headbands.
- Do not use shirtless looks for Road to Marathon Fit.
- The outfit should be visible enough on slide 1 to signal a new day, but the image should still feel like a real training moment.
- Keep the same runner identity, hair, build, and face family; the clothes change, not the person.

## Weekly Training And Posting Rule

Weeks 2 through 5 are still in the premade planning stage. Do not treat the
existing dated Week 2-4 folders as completed future content; they are reference
records that must be rewritten into the personal-experience queue before reuse.

The runner trains five times per week:

- easy run
- strength or short conditioning session
- easy or recovery run
- controlled workout, hills, or intervals
- long run

Post twice every day:

- on training days: one workout or post-workout journal post plus one support post
- on rest days: two support posts, never a fabricated workout recap

This produces `14` posts per week while keeping the workout limit at one workout
post per calendar day.

Support posts include:

- food and fueling
- health and recovery
- body changes without fake transformation claims
- one tool or app used during a specific training moment
- shoes I use
- watches I use
- gear and routine
- weekly plan or progress reflection

Support-topic posts can still use the same avatar on slide 1, but they should not look like a second workout from the same day.

## Personal Experience Rule

Every post must be anchored in something that happened to this runner. Use a
specific moment, decision, sensation, number, route, or consequence instead of
general advice.

Use first-person language:

- `I started too fast and spent the last ten minutes negotiating with myself.`
- `I wanted to add miles after a good week, but kept the plan boring.`
- `My legs felt awful for eight minutes, then the run finally settled.`

### Spoken TikTok Voice

Write like she is telling a running friend what happened after the run. The copy
should sound natural when read aloud, not like a coach, a brand, or a scripted
voiceover.

- Use short sentences, contractions, and ordinary words.
- Include one real detail: a minute, hill, stomach problem, watch habit, tired
  legs, or the decision she made in the moment.
- Let a post be a little messy or unsure when that is the honest feeling.
- Say `I slowed down because I was breathing hard`, not `I adjusted my effort
  to preserve the integrity of the session`.
- Avoid polished copy formulas such as `the real win`, `nothing dramatic`,
  `the plan was not broken`, `it turned out`, `this is the point`, or `not X,
  but Y` reframes.
- Do not use generic creator lines such as `this is your sign`, `POV`,
  `here is what nobody tells you`, or forced comment bait.

Do not open with generic teaching frames such as `Why runners...`, `Runners
should...`, `5 rules`, or `the best running apps`. The one exception is the
rare, explicitly personal app-stack format defined below. Do not recycle a
premade deck unchanged when its slides sound like a coach explaining a lesson.

Target mix for the marathon lane:

- `80%` lived training diary: workouts, doubts, mistakes, recovery, and small wins
- `15%` runner-life support: food, sleep, shoes, watch setup, route, strength, and gear
- `5%` an earned Coachi moment inside a real training story

### Earned Coachi Mentions

Coachi may appear only when the story contains a concrete problem it helped with:
drifting intensity, staring at pace, or not knowing whether to slow down. The
mention should describe the moment and the effect, not list features or make a
download pitch. Use at most one Coachi mention in a fourteen-post week.

Approved shape:

`I kept chasing pace, so I let Coachi call out when I drifted. The useful part was
hearing it while I was still running, not seeing another score afterwards.`

The mention must be clearly personal and honest. No hidden sponsorship language,
fake performance claims, or App Store link in the deck. The profile bio remains
the conversion path.

### Personal App Stack

At most once per fourteen posts, the support slot may use a transparent personal
app ranking. This is the only approved list-shaped app format.

- Use the exact concise hook: `Top 5 running apps I use when running`.
- Give every app one concrete job instead of pretending Coachi is the only tool.
- Put Coachi at number `2` and explain its real role: it tells her when effort
  drifts during the run.
- Put the complete ordered list on the final slide:
  `1 Strava`, `2 Coachi`, `3 Nike Run Club`, `4 Apple Fitness`, `5 AllTrails`.
- Do not add an App Store link, download command, fake comparison, or unsupported
  superiority claim. The profile bio remains the conversion path.

## Week 2-5 Content Shape

Use the 56-post queue in
`inputs/research/road-to-marathon-fit-weeks-02-05-posting-bank.json`.

Each week contains five training-day posts, five training-day support posts, and
four rest-day support posts. Support posts should feel like the same runner's
life around the build: what she ate, how she recovered, what equipment she
bought, which watch setting she changed, or what she noticed after the session.

## Story Arc

Each pack should use:

- slide 1: a first-person confession or lived moment
- slide 2: what I expected
- slide 3: what actually happened, with a concrete sensation, time, or number
- slide 4: the decision or adjustment I made
- slide 5: the immediate result
- slide 6: what I will do differently next time
- slide 7: a follow-up question or follow/save CTA

On the explicitly marked Coachi slot, slide 6 or 7 may use the earned Coachi
sentence above. All other packs use the normal follow-along CTA and no Coachi
mention.
