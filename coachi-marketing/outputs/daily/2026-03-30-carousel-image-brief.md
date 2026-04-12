# Coachi Carousel Image Brief

## Purpose
Generate 5 Coachi-native social image concepts for carousel/opening-slide use, then pair them with channel-specific copy that drives traffic to `Coachi.no`.

## Generation Status
- Image generation was not executed in this session because the built-in image tool was unavailable and `OPENAI_API_KEY` was not set for the approved fallback CLI path.
- The ready-to-run batch file is:
  - `/Volumes/Riot APFS/Agentmode/coachi-marketing/inputs/notes/2026-03-30-gpt-image-1-carousel-batch.jsonl`

## Run Command
```bash
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export IMAGE_GEN="$CODEX_HOME/skills/.system/imagegen/scripts/image_gen.py"
export OPENAI_API_KEY="YOUR_KEY_HERE"

cd "/Volumes/Riot APFS/Agentmode/coachi-marketing"
python "$IMAGE_GEN" generate-batch \
  --input inputs/notes/2026-03-30-gpt-image-1-carousel-batch.jsonl \
  --out-dir content/ads/generated/carousel-openers
```

## Carousel Concepts

### 1. Your easy run wasn't easy
- Slide 1: `Your easy run wasn't easy.`
- Slide 2: `Most runners drift too fast.`
- Slide 3: `Tracking shows the mistake after.`
- Slide 4: `Coaching catches it during the run.`
- Slide 5: `AI coach, not tracking app.`

X:
```text
A lot of runners think they need more discipline.

What they actually need is better pacing.

Your easy runs should build you up.
Not cook you.

Coachi helps you stay in the right zone while you run.

[coachi.no](https://coachi.no)
```

Instagram:
```text
"Why does every run feel hard?"

Because a lot of runners never actually run easy.

Coachi helps you stay in the right zone in real time, so your training finally starts working the way it should.

AI coach, not tracking app.

[coachi.no](https://coachi.no)
```

TikTok:
- Overlay: `You called it an easy run. Your pulse disagreed.`
- Voiceover: `One of the biggest running mistakes is turning every run into a medium-hard grind. It feels productive, but it ruins consistency. Coachi helps you stay where the run is supposed to be.`

### 2. Stop checking your watch
- Slide 1: `Stop checking your watch every 20 seconds.`
- Slide 2: `That’s not flow. That’s friction.`
- Slide 3: `Most runners don’t need more stats.`
- Slide 4: `They need one clear instruction at the right time.`
- Slide 5: `AI coach, not tracking app.`

X:
```text
Most runners don’t need more stats.

They need one clear voice telling them:
slow down,
push now,
hold this pace.

Coachi is built for that.

AI coach, not tracking app.

[coachi.no](https://coachi.no)
```

Instagram:
```text
If you’re checking your watch every 20 seconds, your run is already too complicated.

Coachi gives you live coaching during the run, so you stop guessing and start training smarter.

AI coach, not tracking app.

[coachi.no](https://coachi.no)
```

TikTok:
- Overlay: `Tracking tells you what happened. Coaching tells you what to do.`
- Voiceover: `Most runners don’t need more data. They need someone telling them when to slow down, when to push, and whether they’re actually in the right zone. That’s the difference between tracking and coaching.`

### 3. Busy adults need simplicity
- Slide 1: `Busy adults don’t need more data.`
- Slide 2: `They need a run that feels easy to start.`
- Slide 3: `The real enemy isn’t laziness.`
- Slide 4: `It’s friction, planning, and too much thinking.`
- Slide 5: `Train smarter at Coachi.no`

X:
```text
Busy runners don’t want another dashboard.

They want:
one session,
one clear goal,
one voice guiding them through it.

That’s what Coachi is for.

[coachi.no](https://coachi.no)
```

Instagram:
```text
The real competition isn’t laziness.

It’s friction.

Too much thinking.
Too much planning.
Too much guessing.

Coachi makes the run simpler:
start the session, listen, run.

[coachi.no](https://coachi.no)
```

TikTok:
- Overlay: `30 minutes. No guessing.`
- Voiceover: `Most busy adults are not avoiding exercise. They’re avoiding complexity. Coachi lowers the friction by coaching you through the run instead of making you figure everything out yourself.`

### 4. Starting too hard
- Slide 1: `This is why your runs fall apart halfway in.`
- Slide 2: `You’re making the mistake in the first 10 minutes.`
- Slide 3: `Too much pace. Too early.`
- Slide 4: `Most runners don’t need more motivation.`
- Slide 5: `They need better pacing.`

X:
```text
A lot of runners don’t have a motivation problem.

They have a pacing problem.

They start too hard.
They fade.
They repeat.

Coachi helps you catch that earlier.

[coachi.no](https://coachi.no)
```

Instagram:
```text
Starting strong feels good.

Until 12 minutes later when the run falls apart.

Coachi helps you control effort in real time, so the whole session works, not just the first few minutes.

AI coach, not tracking app.

[coachi.no](https://coachi.no)
```

TikTok:
- Overlay: `This is why your runs fall apart halfway in.`
- Voiceover: `The mistake usually happens at the start. Too much pace, too much ego, too little control. Coachi helps you stay in the right zone before the run unravels.`

### 5. After-run clarity
- Slide 1: `Most apps tell you that you ran.`
- Slide 2: `That’s not enough.`
- Slide 3: `Did I train well?`
- Slide 4: `Was this the right effort?`
- Slide 5: `Understand your run, not just record it.`

X:
```text
Most apps tell you that you ran.

That’s not enough.

Runners want to know:
Was this the right effort?
Did this session actually help?
How well did I train?

That’s the gap Coachi is built for.

[coachi.no](https://coachi.no)
```

Instagram:
```text
Finishing a run is one thing.

Understanding the run is another.

Coachi is built for runners who want more than distance and time. It helps you train with more clarity, not just collect more numbers.

[coachi.no](https://coachi.no)
```

TikTok:
- Overlay: `Not every completed run is a good run.`
- Voiceover: `A lot of runners finish the workout and still don’t know if they actually trained well. Coachi is built to close that gap.`

## Best First Tests
- `watch-check-slide-1.png`
- `easy-run-slide-1.png`

These are the strongest for category separation and immediate self-recognition.
