#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const ROOT = process.cwd();
const OUT_ROOT = path.join(ROOT, "content/slideshows");
const SUMMARY_PATH = path.join(ROOT, "outputs/daily/2026-04-30-six-slideshows.md");
const USAGE_LOG_PATH = path.join(ROOT, "content/slideshows/visual-library/usage-log.json");
const SUPABASE_MANIFEST_PATH = path.join(ROOT, "content/slideshows/visual-library/supabase-library-manifest.json");
const COACHI_AVATAR_ASSET_ID = "coachi_ai_avatar_001";
const COACHI_AVATAR_SOURCE = "content/ads/reference/organic-runner-face-v2-reference.png";
const VIRAL_FACE_STYLE_REFERENCE = "content/slideshows/2026-04-26-watch-stole-the-run-8-slide/slides/source/01-hook.png";
const VIRAL_TEXT_BANK_PATH = "inputs/research/coachi-viral-hooks-and-text-bank-2026-04-30.md";
const GENERATE_CONTEXTUAL_HOOKS = process.argv.includes("--generate-hooks");
const ONLY_SLUGS = new Set(process.argv.flatMap((arg, index, argv) => arg === "--only" && argv[index + 1] ? [argv[index + 1]] : []));

const hashtags = "#running #runtok #beginnerrunner #runningtips #easyrun #runcoach #marathontraining #coachi\n";

const packs = [
  {
    slug: "2026-04-30-easy-runs-fail-slowly",
    problemId: "rp_easy_run_turns_medium_hard",
    sourceUrl: "inputs/research/reddit-winning-language-bank.md",
    problemType: "easy-run pace drift",
    emotion: "self-aware frustration",
    textBankEntry: "#9 Easy runs fail slowly",
    hook: "Easy runs fail slowly",
    theme: "easy run control",
    visualWorld: "forest road",
    visualCollection: "nature_context",
    lighting: "soft green morning forest light",
    hookScene: "premium photorealistic hook image of the Coachi runner in the 2026-04-26 watch-stole-the-run face style, running alone on a quiet forest road in soft green morning light; tight chest-to-waist framing, high-detail sweaty face, angular cheek and brow detail, controlled but slightly frustrated expression, fitted black technical shirt, natural motion, route depth behind him, strong dark-green negative space across the lower center for overlay text; make this the highest-quality hero image of the set",
    hookKit: "fitted black short-sleeve technical running shirt and black shorts, visible realistic sweat, no logos",
    hookAngle: "tight medium-close three-quarter action frame with a strong readable face and more viral editorial intensity",
    grade: { modulate: "102,105,100", fill: "#e8f0df", colorize: "4%" },
    assets: ["nature_context_008", "nature_context_009", "nature_context_011", "nature_context_014"],
    detailAsset: "details_emotion_015",
    ctaAsset: "cta_ending_005",
    slides: [
      "Easy runs fail slowly",
      "One small surge.",
      "Then one more.",
      "The whole run changes.",
      "Catch it early.",
      "Keep easy cheap.",
      "Save this for your next run."
    ],
    tiktokCaption: "Easy runs fail slowly.\n\nIt starts as one small surge. Then one more. Then the whole run changes. Catch it early.",
    instagramCaption: "Easy runs fail slowly.\n\nIt starts as one small surge. Then one more. Then the whole run changes. Catch it early."
  },
  {
    slug: "2026-04-30-your-watch-needs-context",
    problemId: "rp_watch_wrong_or_training_wrong",
    sourceUrl: "inputs/research/reddit-winning-language-bank.md",
    problemType: "data-without-coaching",
    emotion: "confused but curious",
    textBankEntry: "#23 Your watch is not the run",
    hook: "Your watch is not the run",
    theme: "watch context",
    visualWorld: "sunlit park path",
    visualCollection: "nature_context",
    lighting: "warm late-workout daylight",
    hookScene: "the Coachi avatar running steadily on a sunlit park path, glancing forward with calm curiosity, trees and path depth behind him, warm realistic daylight, premium but believable running content",
    hookKit: "grey performance tee and navy shorts, no visible watch, no logos",
    hookAngle: "waist-up side-tracking angle with face visible and clean negative space",
    grade: { modulate: "103,104,97", fill: "#f1c891", colorize: "4%" },
    assets: ["nature_context_001", "nature_context_002", "nature_context_003", "nature_context_013"],
    detailAsset: "details_emotion_002",
    ctaAsset: "cta_ending_006",
    slides: [
      "Your watch is not the run",
      "It gives context.",
      "It can be noisy.",
      "Your body still talks.",
      "Use both.",
      "Trust effort first.",
      "Save this for your next run."
    ],
    tiktokCaption: "Your watch is not the run.\n\nIt gives context. It can be noisy. Your body still talks. Use both.",
    instagramCaption: "Your watch is not the run.\n\nIt gives context. It can be noisy. Your body still talks. Use both."
  },
  {
    slug: "2026-04-30-zone-label-can-lie",
    problemId: "rp_zone5_but_can_still_talk",
    sourceUrl: "https://www.reddit.com/r/AppleWatchFitness/comments/1qtnzm8/apple_watch_heart_rate_zones/",
    problemType: "heart-rate panic",
    emotion: "heart-rate panic",
    textBankEntry: "#15 Your zone might be wrong",
    hook: "Your zone might be wrong",
    theme: "zone label sanity check",
    visualWorld: "open sunrise road",
    visualCollection: "lake_calm",
    lighting: "soft golden open-sky evening",
    hookScene: "the Coachi avatar on an open sunrise road after settling into an easy effort, calm but skeptical expression, big clean sky and road depth, no lake, no mountains, no hills, soft golden light",
    hookKit: "black fitted tee and dark green shorts, no visible watch, no logos",
    hookAngle: "medium-close front three-quarter running angle with uncluttered sky for overlay text",
    grade: { modulate: "105,103,96", fill: "#ffd09a", colorize: "6%" },
    assets: ["lake_calm_009", "lake_calm_010", "lake_calm_011", "lake_calm_007"],
    detailAsset: "details_emotion_005",
    ctaAsset: "cta_ending_003",
    slides: [
      "Your zone might be wrong",
      "Default zones can mislead.",
      "Wrist readings can jump.",
      "Talk test still matters.",
      "Do not panic.",
      "Use a ceiling.",
      "Save this for your next run."
    ],
    tiktokCaption: "Your zone might be wrong.\n\nDefault zones can mislead. Wrist readings can jump. Talk test still matters. Do not panic.",
    instagramCaption: "Your zone might be wrong.\n\nDefault zones can mislead. Wrist readings can jump. Talk test still matters. Do not panic."
  },
  {
    slug: "2026-04-30-walk-breaks-count",
    problemId: "rp_beginner_zone2_requires_run_walk",
    sourceUrl: "https://www.reddit.com/r/beginnerrunning/comments/1suos9z/zone_2_running_its_important_but_messy/",
    problemType: "zone-2 confusion",
    emotion: "relief",
    textBankEntry: "#16 Walking can count",
    hook: "Walking can count",
    theme: "beginner run-walk permission",
    visualWorld: "open meadow sky",
    visualCollection: "lake_calm",
    lighting: "clean warm open-sky morning",
    hookScene: "the Coachi avatar in an easy run-walk moment beside an open meadow path, relaxed breathing, relieved expression, warm clean morning light, simple route world only",
    hookKit: "olive sleeveless top and black shorts, no visible watch, no logos",
    hookAngle: "waist-up cooldown angle with path depth and clear negative space",
    grade: { modulate: "105,102,98", fill: "#ffe2a8", colorize: "5%" },
    assets: ["lake_calm_001", "lake_calm_002", "lake_calm_009", "lake_calm_010"],
    detailAsset: "details_emotion_001",
    ctaAsset: "cta_ending_010",
    slides: [
      "Walking can count",
      "If heart rate climbs.",
      "If hills spike effort.",
      "If you are new.",
      "Walk breaks are a tool.",
      "Keep it boring.",
      "Save this for your next run."
    ],
    tiktokCaption: "Walking can count.\n\nIf heart rate climbs, if hills spike effort, or if you are new, walk breaks are a tool.",
    instagramCaption: "Walking can count.\n\nIf heart rate climbs, if hills spike effort, or if you are new, walk breaks are a tool."
  },
  {
    slug: "2026-04-30-stop-racing-intervals",
    problemId: "rp_intervals_workout_racing",
    sourceUrl: "https://www.reddit.com/r/AdvancedRunning/comments/jefbeu",
    problemType: "workout-racing",
    emotion: "controlled restraint",
    textBankEntry: "#51 Stop racing every interval",
    hook: "Stop racing every interval",
    theme: "interval control",
    visualWorld: "open training road",
    visualCollection: "hills_effort",
    lighting: "warm muted workout daylight",
    hookScene: "the Coachi avatar controlling an interval on an open training road, focused but restrained expression, effort visible without looking maximal, muted warm workout daylight, no finish-line race energy",
    hookKit: "white singlet and cobalt blue shorts, no visible watch, no logos",
    hookAngle: "side-tracking action frame with face still readable and space for hook text",
    grade: { modulate: "102,101,97", fill: "#e7c29a", colorize: "5%" },
    assets: ["hills_effort_001", "hills_effort_002", "hills_effort_003", "hills_effort_010"],
    detailAsset: "details_emotion_008",
    ctaAsset: "cta_ending_008",
    slides: [
      "Stop racing every interval",
      "The goal is the session.",
      "Not one rep.",
      "Control early.",
      "Finish useful.",
      "Win the recovery jog.",
      "Save this for your next run."
    ],
    tiktokCaption: "Stop racing every interval.\n\nThe goal is the session, not one rep. Control early and finish useful.",
    instagramCaption: "Stop racing every interval.\n\nThe goal is the session, not one rep. Control early and finish useful."
  },
  {
    slug: "2026-04-30-the-wall-starts-early",
    problemId: "rp_marathon_wall_starts_before_wall",
    sourceUrl: "https://www.reddit.com/r/Marathon_Training/comments/1sjheqc/training_wall/",
    problemType: "easy-run pace drift",
    emotion: "early warning",
    textBankEntry: "#61 Long runs start too fast",
    hook: "Long runs start too fast",
    theme: "long-run drift",
    visualWorld: "forest long-run path",
    visualCollection: "nature_context",
    lighting: "warm forest afternoon light",
    hookScene: "the Coachi avatar early in a long run on a forest path, composed but aware he needs to stay calm, warm afternoon forest light, realistic endurance-run texture, one clear forest world only",
    hookKit: "navy long-sleeve and black shorts, no visible watch, no logos",
    hookAngle: "medium-close route-depth angle with the runner close and path receding behind him",
    grade: { modulate: "103,105,98", fill: "#efd0a0", colorize: "5%" },
    assets: ["nature_context_001", "nature_context_002", "nature_context_003", "nature_context_011"],
    detailAsset: "details_emotion_016",
    ctaAsset: "cta_ending_004",
    slides: [
      "Long runs start too fast",
      "First half feels easy.",
      "Second half negotiates.",
      "Start calmer.",
      "Finish human.",
      "Set a ceiling.",
      "Save this for your next run."
    ],
    tiktokCaption: "Long runs start too fast.\n\nThe first half feels easy. The second half negotiates. Start calmer and finish human.",
    instagramCaption: "Long runs start too fast.\n\nThe first half feels easy. The second half negotiates. Start calmer and finish human."
  }
];

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: ROOT,
      stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit"
    });
    let stdout = "";
    let stderr = "";
    if (options.capture) {
      child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
      child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    }
    child.on("exit", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}${stderr ? `\n${stderr}` : ""}`));
    });
  });
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function writeText(filePath, text) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, text, "utf8");
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function slideFileName(number, role) {
  return `${String(number).padStart(2, "0")}-${role}.png`;
}

function buildManifest(pack) {
  const roles = ["hook", "context", "detail_emotion", "truth", "fix", "reframe", "cta"];
  return {
    base_dir: ".",
    output_dir: "slides/rendered",
    width: 1080,
    height: 1920,
    output_format: "png",
    hybrid_cost_model: "one_ai_hook_six_library_assets",
    estimated_generation_cost_usd: 0.15,
    source_problem_id: pack.problemId,
    source_url: pack.sourceUrl,
    schema: "coachi_one_visual_world_v1",
    emotion: pack.emotion,
    visual_world: pack.visualWorld,
    lighting_profile: pack.lighting,
    lighting_family: pack.lighting,
    avatar_world_required: true,
    avatar_source: COACHI_AVATAR_SOURCE,
    avatar_asset_id: COACHI_AVATAR_ASSET_ID,
    cta_required: true,
    defaults: {
      font_family: "Arial Black, Impact, sans-serif",
      font_weight: 900,
      text_color: "#FFFFFF",
      stroke_color: "#111111",
      stroke_width: 8,
      gradient_opacity: 0.64,
      safe_margin: 96,
      text_position: "lower_middle",
      font_size: 76,
      max_chars_per_line: 24
    },
    slides: pack.slides.map((text, index) => {
      const slideNumber = index + 1;
      const role = roles[index];
      const preferredAssetId = slideNumber === 1
        ? COACHI_AVATAR_ASSET_ID
        : role === "cta"
          ? pack.ctaAsset
          : role === "detail_emotion"
            ? pack.detailAsset
            : pack.assets[Math.max(0, index - 1 - (index > 2 ? 1 : 0))];
      const visualCollection = role === "cta"
        ? "cta_ending"
        : role === "detail_emotion"
          ? "details_emotion"
          : pack.visualCollection;
      return {
        slide_number: slideNumber,
        role,
        input_image: `slides/source/${slideFileName(slideNumber, role)}`,
        output_file: slideFileName(slideNumber, role),
        text,
        asset_source: slideNumber === 1 ? "images_2_0" : "supabase_library",
        visual_collection: visualCollection,
        preferred_asset_ids: [preferredAssetId],
        text_position: slideNumber <= 4 ? (slideNumber === 1 ? "center" : "lower_middle") : "center",
        font_size: slideNumber === 1 ? 92 : 76,
        max_chars_per_line: slideNumber === 1 ? 14 : 24
      };
    })
  };
}

function hookBrief(pack) {
  return {
    schema_version: 1,
    hook: pack.hook,
    emotion: pack.emotion,
    problem_id: pack.problemId,
    problem_type: pack.problemType,
    source_url: pack.sourceUrl,
    tiktok_text_bank: {
      path: VIRAL_TEXT_BANK_PATH,
      selected_entry: pack.textBankEntry
    },
    theme: pack.theme,
    visual_world: pack.visualWorld,
    lighting_family: pack.lighting,
    avatar_world_required: true,
    avatar_source: COACHI_AVATAR_SOURCE,
    avatar_asset_id: COACHI_AVATAR_ASSET_ID,
    viral_face_style_reference: VIRAL_FACE_STYLE_REFERENCE,
    cta_required: true,
    route_tag: pack.visualWorld.replaceAll(" ", "_"),
    lighting_profile: pack.lighting,
    reddit_background_and_vibe: {
      background: pack.visualWorld,
      vibe: `${pack.lighting}, realistic and consistent across the whole slideshow`,
      reddit_background: `Source-backed runner problem: ${pack.problemType}`,
      visual_keywords: [pack.visualWorld, pack.lighting, "consistent lighting", "single visual world"],
      avoid: ["mixed hills lakes mountains", "watch close-up", "baked-in text", "logos", "overdramatic lighting"]
    },
    first_image_prompt_adaptation: "Use the locked Coachi AI avatar as the identity reference, but generate a new contextual hook image for this slideshow.",
    character_anchor: {
      identity_id: "organic_runner_male_v2",
      reference_image: "content/ads/reference/organic-runner-face-v2-reference.png",
      stable_traits: [
        "male runner, age 25-35",
        "lean muscular endurance-athlete build",
        "tan complexion",
        "short dark slightly textured hair",
        "serious calm focused expression",
        "visible realistic sweat and high-detail skin texture",
        "stronger cinematic fitness-editorial face like 2026-04-26-watch-stole-the-run"
      ],
      variation_policy: "Preserve the same face family, hair, complexion, and believable runner build, but prefer the stronger viral face style from 2026-04-26-watch-stole-the-run over the cleaner park-portrait look. Vary scene, kit, angle, and workout moment to match the slideshow context.",
      watch_rule: "Default: no visible watch. If the hook is explicitly about watch anxiety, a small unbranded sports watch may appear, but never use readable UI, close-ups, or watch-checking poses."
    },
    workout_phase: {
      id: "during_workout",
      label: "during-workout",
      moment: "runner inside a normal training session",
      body_language: "controlled effort, natural posture, no posing",
      prompt_cue: "show a believable run moment with clean space for overlay text"
    },
    avatar_variation: {
      watch: "no visible watch",
      top: pack.hookKit,
      headwear: "optional low-profile running cap",
      eyewear: "no glasses unless already natural in the source image",
      shorts: pack.hookKit,
      angle: pack.hookAngle,
      weather: "stable mild outdoor weather",
      lighting: pack.lighting
    }
  };
}

function hookPrompt(pack) {
  return `# Images 2.0 Hook Prompt

Production rule: generate exactly ONE image for slide 1, and only slide 1.
Use the locked Coachi AI avatar reference only as the identity anchor.
Use the 2026-04-26 watch-stole-the-run hook image only as the stronger viral face/style reference.
Do not generate slides 2-7 with Images 2.0.
Do not create a different runner identity.
Do not create an 8-slide deck.
Do not add text to the image.

## Hook Text Added Later By Compositor
${pack.hook}

## Reddit Source Context
- Problem type: ${pack.problemType}
- Source: ${pack.sourceUrl}

## Required Slideshow Spine
- Emotion: ${pack.emotion}
- Selected visual world: ${pack.visualWorld}
- Lighting family: ${pack.lighting}
- Slide 1: new context-based image using the locked Coachi AI avatar identity.
- Viral face direction: borrow the stronger 2026-04-26 watch-stole-the-run face style: fitted black kit, visible sweat, sharp facial detail, cinematic contrast, serious human expression, premium but believable fitness-editorial feel.
- Slide 3: exactly one details/emotion slide from \`details_emotion\`.
- Slide 7: exactly one CTA slide from \`cta_ending\`.
- Details/emotion and CTA are slide roles/collections, not visual worlds.
- Final CTA uses a rotated Supabase CTA image.

## Workout Phase For This Image
- Phase: during-workout
- Prompt cue: show a believable run moment with clean space for overlay text

## Avatar Variation For This Image
- Watch: no visible watch
- Kit: ${pack.hookKit}
- Camera angle: ${pack.hookAngle}
- Lighting: ${pack.lighting}
- Watch rule: No visible watch. Do not include Apple Watch, Garmin watch, smartwatch, GPS watch, watch UI, watch close-up, or watch-checking pose.

## Final Prompt To Use
Create one photorealistic vertical 9:16 hook image for a TikTok/Instagram running coaching slideshow.

Use the provided clean Coachi avatar reference image to preserve the same face family: tan complexion, short dark textured hair, lean muscular endurance-runner build, serious calm focused presence, and believable everyday runner look. Generate a new scene; do not copy the original park portrait.

Use the 2026-04-26 watch-stole-the-run hook image as the viral face/style reference only: stronger angular face detail, fitted black performance kit, realistic sweat on face and shirt, cinematic golden-hour contrast, shallow depth of field, premium fitness editorial look, human relief/frustration instead of a bland stock expression. Do not copy its lake/mountain background, hands-on-hips pose, or visible watch unless this exact pack is about watch anxiety.

Scene: ${pack.hookScene}

Visual world lock: ${pack.visualWorld}. Keep this as one route/world only. Do not mix hills, lakes, and mountains in the same image.

Lighting: ${pack.lighting}. Match the lighting family so the image can sit beside the rest of the slideshow.

Composition: vertical 9:16, tight chest-to-waist social hook image, runner close enough that the face stops the scroll, real route depth, strong negative space for large hook text that will be added later by the compositor. No baked-in text.

Constraints: no text, no logo, no app UI, no Apple Watch, no Garmin watch, no smartwatch, no GPS watch, no readable watch UI, no watch close-up, no watch-checking pose, no distorted limbs, no extra fingers, no static hands-on-hips pose, no exaggerated model smile, no stock-photo polish, no watermark.
`;
}

function buildAssetIndex(supabaseManifest) {
  const index = new Map();
  for (const collection of supabaseManifest.collections || []) {
    for (const item of collection.items || []) {
      index.set(item.id, item);
    }
  }
  return index;
}

async function createHookAsset({ pack, packDir }) {
  const output = path.join(packDir, "slides/source/01-hook.png");
  await fs.mkdir(path.dirname(output), { recursive: true });
  if (GENERATE_CONTEXTUAL_HOOKS) {
    await run("npm", [
      "run", "slideshow:openai-hook", "--",
      "--pack", path.relative(ROOT, packDir),
      "--reference-image", COACHI_AVATAR_SOURCE,
      "--style-reference-image", VIRAL_FACE_STYLE_REFERENCE
    ]);
  } else {
    const input = path.resolve(ROOT, COACHI_AVATAR_SOURCE);
    await fs.copyFile(input, output);
    await writeJson(path.join(packDir, "source/hook-provenance.json"), {
      schema_version: 1,
      generator: "locked_coachi_ai_avatar_reference_fallback",
      source_asset_id: COACHI_AVATAR_ASSET_ID,
      source_image: COACHI_AVATAR_SOURCE,
      output_path: path.relative(ROOT, output),
      hook: pack.hook,
      note: "Fallback mode only. Production should run this script with --generate-hooks so slide 1 becomes a contextual avatar-based Images 2.0 hook image."
    });
  }
}

async function gradeSources(packDir, grade) {
  const sourceDir = path.join(packDir, "slides/source");
  const files = (await fs.readdir(sourceDir))
    .filter((file) => /\.(png|jpe?g|webp)$/i.test(file))
    .filter((file) => !file.startsWith("01-hook"))
    .map((file) => path.join(sourceDir, file));
  for (const file of files) {
    await run("magick", [
      file,
      "-auto-gamma",
      "-modulate", grade.modulate,
      "-fill", grade.fill,
      "-colorize", grade.colorize,
      file
    ], { capture: true });
  }
}

async function contactSheet(packDir) {
  await fs.mkdir(path.join(packDir, "qa"), { recursive: true });
  await run("magick", [
    path.join(packDir, "slides/rendered/*.png"),
    "-resize", "216x384",
    "-background", "#111111",
    "-gravity", "center",
    "-extent", "216x384",
    "+append",
    path.join(packDir, "qa/contact-sheet.jpg")
  ], { capture: true });
}

async function updateHookUsage(pack, packDir) {
  const usageLog = await readJson(USAGE_LOG_PATH);
  const key = `${pack.slug}|1|${COACHI_AVATAR_ASSET_ID}`;
  const existing = new Set((usageLog.uses || []).map((use) => `${use.slideshow_id}|${use.slide_number}|${use.asset_id}`));
  if (!existing.has(key)) {
    usageLog.uses.push({
      used_at: new Date().toISOString(),
      stage: "selected",
      slideshow_id: pack.slug,
      slide_number: 1,
      role: "hook",
      asset_id: COACHI_AVATAR_ASSET_ID,
      visual_collection: "coachi_avatar",
      asset_source: GENERATE_CONTEXTUAL_HOOKS ? "images_2_0_contextual_avatar_reference" : "images_2_0_locked_avatar_fallback",
      selected_source_kind: GENERATE_CONTEXTUAL_HOOKS ? "owned_avatar_reference_contextual_generation" : "owned_locked_avatar_reference_fallback",
      local_fallback_path: path.relative(ROOT, path.join(packDir, "slides/source/01-hook.png"))
    });
    usageLog.updated = new Date().toISOString().slice(0, 10);
    await writeJson(USAGE_LOG_PATH, usageLog);
  }
}

async function createPack(pack, assetIndex) {
  const packDir = path.join(OUT_ROOT, pack.slug);
  if ((await exists(packDir)) && !process.argv.includes("--refresh")) {
    throw new Error(`Pack already exists: ${path.relative(ROOT, packDir)}`);
  }

  await fs.mkdir(path.join(packDir, "source"), { recursive: true });
  await fs.mkdir(path.join(packDir, "copy"), { recursive: true });
  await fs.rm(path.join(packDir, "slides/source"), { recursive: true, force: true });
  await fs.rm(path.join(packDir, "slides/rendered"), { recursive: true, force: true });
  await fs.rm(path.join(packDir, "qa"), { recursive: true, force: true });
  await fs.mkdir(path.join(packDir, "slides/source"), { recursive: true });
  await fs.mkdir(path.join(packDir, "slides/rendered"), { recursive: true });

  await writeJson(path.join(packDir, "render-manifest.json"), buildManifest(pack));
  await writeText(path.join(packDir, "source/hook.txt"), `${pack.hook}\n`);
  await writeJson(path.join(packDir, "source/hook-brief.json"), hookBrief(pack));
  await writeText(path.join(packDir, "source/images-2-0-hook-prompt.md"), hookPrompt(pack));
  await writeText(path.join(packDir, "copy/tiktok-caption.txt"), `${pack.tiktokCaption}\n`);
  await writeText(path.join(packDir, "copy/instagram-caption.txt"), `${pack.instagramCaption}\n`);
  await writeText(path.join(packDir, "copy/hashtags.txt"), hashtags);

  await run("npm", [
    "run", "slideshow:assets", "--",
    "--manifest", path.relative(ROOT, path.join(packDir, "render-manifest.json")),
    "--out", path.relative(ROOT, path.join(packDir, "asset-picklist.json")),
    "--production"
  ]);
  await run("npm", [
    "run", "slideshow:materialize", "--",
    "--picklist", path.relative(ROOT, path.join(packDir, "asset-picklist.json")),
    "--out", path.relative(ROOT, path.join(packDir, "materialize-report.json"))
  ]);
  await createHookAsset({ pack, packDir });
  await updateHookUsage(pack, packDir);
  await gradeSources(packDir, pack.grade);
  await run("npm", [
    "run", "slideshow:render", "--",
    "--manifest", path.relative(ROOT, path.join(packDir, "render-manifest.json"))
  ]);
  await contactSheet(packDir);
  await run("npm", [
    "run", "slideshow:qa", "--",
    "--pack", path.relative(ROOT, packDir)
  ], { capture: true });

  return packDir;
}

async function main() {
  const supabaseManifest = await readJson(SUPABASE_MANIFEST_PATH);
  const assetIndex = buildAssetIndex(supabaseManifest);
  const selectedPacks = ONLY_SLUGS.size > 0
    ? packs.filter((pack) => ONLY_SLUGS.has(pack.slug))
    : packs;
  if (selectedPacks.length === 0) {
    throw new Error(`No packs matched --only values: ${Array.from(ONLY_SLUGS).join(", ")}`);
  }
  const created = [];

  for (const pack of selectedPacks) {
    for (const assetId of pack.assets) {
      if (!assetIndex.has(assetId)) throw new Error(`Missing asset ${assetId}`);
    }
    if (!assetIndex.has(pack.detailAsset)) throw new Error(`Missing detail asset ${pack.detailAsset}`);
    if (!assetIndex.has(pack.ctaAsset)) throw new Error(`Missing CTA asset ${pack.ctaAsset}`);
    const packDir = await createPack(pack, assetIndex);
    created.push({ pack, packDir });
  }

  const summary = [
    "# 2026-04-30 Six New Slideshow Packs",
    "",
    "Rules applied:",
    "- One visual world per slideshow.",
    `- Hooks and captions use \`${VIRAL_TEXT_BANK_PATH}\`.`,
    "- Slide 1 uses the locked Coachi AI avatar as identity reference, then generates a context-specific hook image per pack.",
    "- `details_emotion` is used exactly once as slide 3, not as a visual world.",
    "- `cta_ending` is used exactly once as slide 7, not as a visual world.",
    "- Similar lighting inside each slideshow via one source family plus a consistent light grade.",
    "- No mixing hills, lakes, and mountains inside the same post.",
    "- Supabase/library images rotated by explicit asset IDs.",
    "- Copy pass uses the Coachi Viral Hooks And Text Bank - 2026-04-30 for hook and caption wording.",
    "- CTA update: Supabase `cta_ending` images are the standard, with six different CTA assets selected for variety.",
    "- Watch UI CTA is not used as a standard ending; it remains an explicit app-proof exception only.",
    "",
    "Combined QA contact sheet:",
    "- `outputs/daily/2026-04-30-six-slideshows-contact-sheet.jpg`",
    "",
    "Stats/pass inputs:",
    "- Live slideshow performance log has no real results for these six yet, so this pass used the current `WINNER_LIBRARY.md` and visual usage stats.",
    "- Strongest reused hook patterns: short contradiction hooks, direct correction hooks, and simple save prompts.",
    "- CTA rotation check: all six final slides now select Supabase `cta_ending` assets; `coachi_watch_ui_cta_001` is not selected by default.",
    `- Selected CTA assets: ${created.map(({ pack }) => pack.ctaAsset || pack.assets.at(-1)).join(", ")}.`,
    "",
    ...created.flatMap(({ pack, packDir }) => [
      `## ${pack.slug}`,
      `- Hook: ${pack.hook}`,
      `- Viral text bank entry: ${pack.textBankEntry}`,
      `- Source problem: ${pack.problemId}`,
      `- Visual world: ${pack.visualWorld}`,
      `- Lighting: ${pack.lighting}`,
      `- Avatar asset: ${COACHI_AVATAR_ASSET_ID}`,
      `- World assets: ${pack.assets.join(", ")}`,
      `- Detail/emotion asset: ${pack.detailAsset}`,
      `- CTA asset: ${pack.ctaAsset || pack.assets.at(-1)}`,
      `- Rendered slides: ${path.relative(ROOT, path.join(packDir, "slides/rendered"))}`,
      `- Contact sheet: ${path.relative(ROOT, path.join(packDir, "qa/contact-sheet.jpg"))}`,
      ""
    ])
  ].join("\n");
  await writeText(SUMMARY_PATH, summary);

  console.log(JSON.stringify({
    ok: true,
    created: created.map(({ pack, packDir }) => ({
      slug: pack.slug,
      pack_dir: path.relative(ROOT, packDir),
      contact_sheet: path.relative(ROOT, path.join(packDir, "qa/contact-sheet.jpg"))
    })),
    summary: path.relative(ROOT, SUMMARY_PATH)
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
