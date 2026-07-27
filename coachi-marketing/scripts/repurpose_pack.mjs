#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

function parseArgs(argv) {
  const args = new Map();
  const flags = new Set();
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      flags.add(arg);
    } else {
      args.set(arg, next);
      index += 1;
    }
  }
  return { args, flags };
}

function printHelp() {
  console.log(`Usage:
  node scripts/repurpose_pack.mjs --pack content/slideshows/YYYY-MM-DD-slug
  node scripts/repurpose_pack.mjs --pack content/slideshows/YYYY-MM-DD-slug --date 2026-06-12

Derives English-only Instagram, X, Reddit, and Pinterest copy from one slideshow pack.`);
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function readOptionalText(filePath, fallback = "") {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeText(filePath, text) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, text, "utf8");
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "pack";
}

function dateFromSlug(slug) {
  const match = String(slug || "").match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : new Date().toISOString().slice(0, 10);
}

function cleanLine(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function sentence(value) {
  const text = cleanLine(value).replace(/[.!?]+$/, "");
  return text ? `${text}.` : "";
}

function slideTexts(manifest) {
  return (manifest.slides || [])
    .map((slide) => ({
      number: slide.slide_number,
      role: slide.role || "slide",
      text: cleanLine(slide.text || slide.example_text || "")
    }))
    .filter((slide) => slide.text);
}

function captionWithoutHashtags(value) {
  return cleanLine(String(value || "")
    .split(/\n+/)
    .filter((line) => !line.trim().startsWith("#"))
    .join("\n"));
}

function buildInstagramCarousel({ slug, hook, slides, caption, hashtags }) {
  const bodySlides = slides.slice(1, 6);
  const carouselSlides = [
    { title: hook, support: "Make the first slide the same hook image as TikTok." },
    ...bodySlides.map((slide) => ({
      title: slide.text,
      support: "Add one calm support sentence in the caption or alt text, not extra overlay clutter."
    })),
    {
      title: slides[6]?.text || "Save this before your next run.",
      support: "Use the CTA slide and keep the action simple."
    }
  ];

  return `# Instagram Carousel - ${slug}

## Slides
${carouselSlides.map((slide, index) => `### Slide ${index + 1}
${slide.title}

${slide.support}`).join("\n\n")}

## Caption
${captionWithoutHashtags(caption) || sentence(hook)}

Save this before your next easy run.

What part of the run makes you second-guess yourself?

${hashtags.trim()}
`;
}

function buildStories({ hook, slides }) {
  const topic = slides[1]?.text || hook;
  return `# Instagram Stories

## Story 1 - Poll
${topic}

Poll:
- Happens to me
- Not usually

## Story 2 - Slider
How much does this mess with your easy runs?

Slider label: "too real"

## Story 3 - Question
What number or feeling makes you change the run too early?
`;
}

function buildXPost({ hook, slides, formatId }) {
  const runnerMoment = slides[1]?.text || hook;
  const hiddenCost = slides[2]?.text || "The run changes before the dashboard explains it.";
  const productRule = slides[4]?.text || "The useful product decision is what to say in the moment.";
  return `# X Post

I used today's slideshow as product research.

The runner problem was: ${sentence(hook)}

The build lesson was sharper: ${sentence(runnerMoment)}

That is why Coachi cannot be another dashboard. The hard part is timing, priority, and deciding what the runner should hear while the run is still fixable.

Product rule tested: ${sentence(hiddenCost)} ${sentence(productRule)}

Format tested: ${formatId || "slideshow"}.
`;
}

function buildRedditAngle({ hook, slides }) {
  return `# Reddit-Safe Discussion Angle

## Title
${hook.toLowerCase().startsWith("why") ? hook : `The problem might be effort drift, not fitness`}

## Body
I keep seeing runners treat one number as the whole story, especially on easy days.

${sentence(slides[1]?.text || "The first few minutes can feel misleading")}

Three checks that usually help:

1. Did the first 10 minutes settle?
2. Did hills, heat, sleep, or stress change the signal?
3. Could you repeat the run tomorrow?

What signal makes you change the run too early?

## Safety
No app link. No Coachi mention unless the thread explicitly asks for tools or apps.
`;
}

function buildPinterestPin({ hook, slides }) {
  const description = [
    sentence(slides[1]?.text || hook),
    sentence(slides[3]?.text || "Use this before your next easy run"),
    "A calm running tip for beginners, easy runs, and zone 2 training."
  ].filter(Boolean).join(" ");
  return `# Pinterest Pin

Title: ${hook}

Description: ${description}

Link: https://coachi.no/download?utm_source=pinterest&utm_medium=organic_pin&utm_campaign=slideshow
`;
}

async function main() {
  const { args, flags } = parseArgs(process.argv.slice(2));
  if (flags.has("--help") || flags.has("-h")) {
    printHelp();
    return;
  }

  const packArg = args.get("--pack");
  assert(packArg, "--pack is required.");
  const packDir = path.resolve(packArg);
  const slug = path.basename(packDir);
  const date = args.get("--date") || dateFromSlug(slug);
  const manifest = await readJson(path.join(packDir, "render-manifest.json"));
  const slides = slideTexts(manifest);
  assert(slides.length >= 6, `${packDir}: expected at least 6 slides in render-manifest.json.`);

  const hook = slides[0]?.text || manifest.hook || slug;
  const caption = await readOptionalText(path.join(packDir, "copy", "instagram-caption.txt"), "");
  const hashtags = await readOptionalText(path.join(packDir, "copy", "hashtags.txt"), "");
  const outDir = path.join(packDir, "repurposed");
  const cleanSlug = slugify(slug);
  const channelSlug = cleanSlug.startsWith(`${date}-`) ? cleanSlug : `${date}-${cleanSlug}`;
  const channelFiles = {
    instagram: path.join("content", "Instagram", `${channelSlug}-derived-carousel.md`),
    tiktok: path.join("content", "Tiktok", `${channelSlug}-derived-reel.md`),
    x: path.join("content", "x-posts", `${channelSlug}-derived-x.md`),
    reddit: path.join("content", "Reddit", `${channelSlug}-discussion-angle.md`)
  };
  const artifacts = {
    instagram_carousel: path.join(outDir, "instagram-carousel.md"),
    instagram_stories: path.join(outDir, "instagram-stories.md"),
    x_post: path.join(outDir, "x-post.md"),
    reddit_angle: path.join(outDir, "reddit-discussion-angle.md"),
    pinterest_pin: path.join(outDir, "pinterest-pin.md"),
    daily_pack: path.join(outDir, "daily-pack.md")
  };

  const instagramCarousel = buildInstagramCarousel({ slug, hook, slides, caption, hashtags });
  const stories = buildStories({ hook, slides });
  const xPost = buildXPost({ hook, slides, formatId: manifest.format_id });
  const redditAngle = buildRedditAngle({ hook, slides });
  const pinterestPin = buildPinterestPin({ hook, slides });
  const tiktokReel = `# TikTok Reel Variant - ${slug}

HOOK: ${hook}
PROBLEM: ${slides[1]?.text || ""}
FIX: ${slides[3]?.text || slides[4]?.text || ""}
CTA: ${slides[6]?.text || "Save this before your next run."}

Voiceover text:
${[hook, slides[1]?.text, slides[3]?.text, slides[6]?.text].filter(Boolean).join(" ")}
`;
  const dailyPack = `# Derived Daily Pack - ${date}

- Source pack: \`${packDir}\`
- Hook: ${hook}
- Schema: \`${manifest.schema || "unknown"}\`
- Format: \`${manifest.format_id || "unknown"}\`

## Files
- Instagram carousel: \`${artifacts.instagram_carousel}\`
- Instagram stories: \`${artifacts.instagram_stories}\`
- TikTok reel variant: \`${channelFiles.tiktok}\`
- X post: \`${artifacts.x_post}\`
- Reddit-safe angle: \`${artifacts.reddit_angle}\`
- Pinterest pin: \`${artifacts.pinterest_pin}\`
`;

  await writeText(artifacts.instagram_carousel, instagramCarousel);
  await writeText(artifacts.instagram_stories, stories);
  await writeText(artifacts.x_post, xPost);
  await writeText(artifacts.reddit_angle, redditAngle);
  await writeText(artifacts.pinterest_pin, pinterestPin);
  await writeText(artifacts.daily_pack, dailyPack);

  await writeText(channelFiles.instagram, `${instagramCarousel}\n\n${stories}`);
  await writeText(channelFiles.tiktok, tiktokReel);
  await writeText(channelFiles.x, xPost);
  await writeText(channelFiles.reddit, redditAngle);

  const report = {
    ok: true,
    generated_at: new Date().toISOString(),
    pack_dir: packDir,
    date,
    hook,
    schema: manifest.schema || null,
    format_id: manifest.format_id || null,
    artifacts,
    channel_files: channelFiles
  };
  await writeJson(path.join(outDir, "repurpose-report.json"), report);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(`repurpose_pack.mjs: ${error.message}`);
  process.exit(1);
});
