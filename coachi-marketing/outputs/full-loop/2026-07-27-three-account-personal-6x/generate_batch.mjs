import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { scoreCoachiHook } from "../../../scripts/slideshow_quality_rules.mjs";

const DATE = "2026-07-27";
const RUN_DIR = "outputs/full-loop/2026-07-27-three-account-personal-6x";
const TOPIC_DIR = path.join(RUN_DIR, "frozen-topics");
const LOCAL_SOURCE = "local://2026-07-27-three-account-personal-6x";
const BATCH_USAGE_LOG = path.join(RUN_DIR, "visual-usage-log.json");
const FORCE_RERENDER = process.argv.includes("--force-rerender");
const RESET_ROTATION_LOG = process.argv.includes("--reset-rotation-log");
const MARATHON_PROBLEM_IDS = {
  "rain-minute-6": "rtmf_week08_rain_nearly_home",
  "missed-run-progress": "rtmf_week08_missed_run_progress",
  "legs-minute-12": "rtmf_week08_legs_bad_twelve_minutes",
  "food-minute-35": "rtmf_week08_long_run_food_miss",
  "last-hill-sprint": "rtmf_week08_last_hill_sprint",
  "app-stack-week8": "rtmf_week08_personal_app_stack"
};
const STABLE_REPLACEMENT_SLUGS = {
  "main:tempo-minute-20": "2026-07-27-main-01-tempo-minute-20-why-your-tempo-run-falls-apart-after-20-minutes",
  "main:planned-walk-breaks": "2026-07-27-main-03-planned-walk-breaks-why-planned-walk-breaks-make-a-hard-run-easier-to-finish",
  "main:weekly-mileage-jump": "2026-07-27-main-04-weekly-mileage-jump-your-weekly-mileage-should-not-jump-because-one-run-felt-good",
  "main:loud-stride-fatigue": "2026-07-27-main-05-loud-stride-fatigue-your-stride-gets-louder-before-your-easy-run-form-falls-apart",
  "watch:apple-hr-alerts": "2026-07-27-watch-01-apple-hr-alerts-set-apple-watch-heart-rate-alerts-before-running",
  "watch:garmin-satiq": "2026-07-27-watch-02-garmin-satiq-garmin-satiq-saves-battery-without-giving-up-the-best-gps-mode",
  "watch:coros-effort-pace": "2026-07-27-watch-03-coros-effort-pace-coros-effort-pace-is-built-for-hills-not-flat-pacing",
  "watch:garmin-auto-lap-workout": "2026-07-27-watch-04-garmin-auto-lap-workout-garmin-auto-lap-can-add-extra-splits-inside-one-workout-interval",
  "watch:wrist-hr-fast-intervals": "2026-07-27-watch-05-wrist-hr-fast-intervals-why-wrist-heart-rate-lags-behind-fast-intervals",
  "watch:apple-pacer-race-route": "2026-07-27-watch-06-apple-pacer-race-route-apple-watch-pacer-or-race-route-which-one-fits-your-run",
  "marathon:rain-minute-6": "2026-07-27-marathon-01-rain-minute-6-my-easy-run-met-heavy-rain-at-minute-6-i-nearly-went-home"
};

const TOPICS = [
  {
    profile: "main",
    key: "tempo-minute-20",
    schema: "how_to_fix_v1",
    problem_type: "workout-racing",
    semantic_problem_type: "interval recovery choice",
    content_pillar: "workout_execution",
    hook: "Should you jog, walk, or stand between hard intervals?",
    exact_words: "I do not know which recovery style makes the next hard interval useful.",
    visual_world: "forest",
    lighting_family: "clear forest morning light",
    emotion: "uncertain between intervals, consistent afterwards",
    slides: [
      ["hook", "Should you jog, walk, or stand between hard intervals?"],
      ["felt_moment", "Standing helps when the interval is short and very hard."],
      ["hidden_cost", "Jogging can quietly steal recovery from the next interval."],
      ["fix", "Walk when you want movement without adding much extra work."],
      ["fix", "Stand when the workout needs almost complete recovery."],
      ["proof", "Choose what lets the next interval match the first."],
      ["cta", "Save this before your next interval workout."]
    ]
  },
  {
    profile: "main",
    key: "long-run-fuel-45",
    schema: "things_i_wish_i_knew_v1",
    problem_type: "food",
    content_pillar: "endurance_building",
    hook: "Why waiting until minute 45 can ruin your long run",
    exact_words: "I wait until I feel hungry on longer runs, then the final part gets much harder.",
    visual_world: "lake",
    lighting_family: "bright lake morning light",
    emotion: "fine early, empty and distracted later",
    slides: [
      ["hook", "Why waiting until minute 45 can ruin your long run"],
      ["felt_moment", "You feel fine early, so eating seems completely unnecessary."],
      ["hidden_cost", "When hunger arrives, concentration and pace may already be slipping."],
      ["fix", "On longer runs, carry fuel you have already tested."],
      ["fix", "Practice eating before you feel empty, not once the run unravels."],
      ["proof", "Good fueling keeps the final section about running, not finding food."],
      ["cta", "Save this before your next longer run."]
    ]
  },
  {
    profile: "main",
    key: "planned-walk-breaks",
    schema: "how_to_fix_v1",
    problem_type: "downhill soreness",
    semantic_problem_type: "downhill braking soreness",
    content_pillar: "running_form",
    hook: "Why downhill running can make tomorrow morning hurt",
    exact_words: "My lungs felt fine downhill, but my thighs were sore the next morning.",
    visual_world: "mountain",
    lighting_family: "soft mountain daylight",
    emotion: "fast and relaxed downhill, sore the next morning",
    slides: [
      ["hook", "Why downhill running can make tomorrow morning hurt"],
      ["felt_moment", "Downhill feels easy on your lungs, so speed arrives quietly."],
      ["hidden_cost", "Your thighs absorb braking force on every landing."],
      ["fix", "Shorten your stride slightly instead of reaching farther downhill."],
      ["fix", "Keep effort controlled when the slope offers free speed."],
      ["proof", "Tomorrow's soreness can come from braking, not poor fitness."],
      ["cta", "Save this before your next downhill run."]
    ]
  },
  {
    profile: "main",
    key: "weekly-mileage-jump",
    schema: "runner_mistake_reframe_v1",
    problem_type: "easy-run expectation mismatch",
    semantic_problem_type: "side stitch relief",
    content_pillar: "running_comfort",
    source_url: "https://health.clevelandclinic.org/why-do-i-sometimes-get-a-side-stitch-when-i-run",
    hook: "Why slowing your easy run can calm a side stitch",
    exact_words: "A sharp side stitch makes an otherwise easy run feel impossible.",
    visual_world: "forest",
    lighting_family: "warm forest afternoon light",
    emotion: "sharp discomfort, then controlled relief",
    slides: [
      ["hook", "Why slowing your easy run can calm a side stitch"],
      ["felt_moment", "The sharp pull starts under your ribs while everything else feels fine."],
      ["hidden_cost", "Holding the same pace can make every breath feel tighter."],
      ["fix", "Slow down and take several deeper, controlled breaths."],
      ["fix", "Press gently near the stitch while breathing out."],
      ["proof", "If it does not ease, stop and let the pain settle."],
      ["cta", "Save this for the next surprise side stitch."]
    ]
  },
  {
    profile: "main",
    key: "loud-stride-fatigue",
    schema: "q_and_a_comment_prompt_v1",
    problem_type: "easy-run form breakdown",
    semantic_problem_type: "cadence target fixation",
    content_pillar: "running_form",
    hook: "Why forcing 180 cadence can make an easy run worse",
    exact_words: "I keep trying to force 180 steps per minute at every running pace.",
    visual_world: "lake",
    lighting_family: "soft lake evening light",
    emotion: "focused on a number, then relaxed into natural rhythm",
    slides: [
      ["hook", "Why forcing 180 cadence can make an easy run worse"],
      ["felt_moment", "The watch shows 172, so you force quicker steps."],
      ["hidden_cost", "Your stride gets tense while the easy run stops feeling natural."],
      ["fix", "Let cadence change with speed, hills, height, and fatigue."],
      ["fix", "Use your normal range before chasing one famous number."],
      ["proof", "A smooth repeatable stride matters more than exactly 180."],
      ["cta", "Save this before changing your cadence."]
    ]
  },
  {
    profile: "main",
    key: "last-interval-sprint",
    schema: "easy_run_simple_tips_v1",
    problem_type: "workout-racing",
    content_pillar: "workout_execution",
    hook: "The last interval should not become an all-out sprint",
    exact_words: "I save energy, then sprint the final interval because I want the workout to look strong.",
    visual_world: "mountain",
    lighting_family: "clear mountain afternoon light",
    emotion: "tempted to prove fitness at the end",
    slides: [
      ["hook", "The last interval should not become an all-out sprint"],
      ["felt_moment", "Extra energy at the end makes a sprint feel earned."],
      ["hidden_cost", "That finish hides whether the planned pace was actually repeatable."],
      ["fix", "Run the final interval at the same target as the others."],
      ["fix", "Judge the workout by consistency, not the fastest closing seconds."],
      ["proof", "Progress the next session only when every interval stayed controlled."],
      ["cta", "Save this before your next interval session."]
    ]
  },
  {
    profile: "watch",
    key: "apple-hr-alerts",
    schema: "how_to_fix_v1",
    problem_type: "metric setup confusion",
    semantic_problem_type: "apple watch ultra action button",
    content_pillar: "watch_setup",
    source_url: "https://support.apple.com/en-ie/guide/watch/apdd16e8761a/watchos",
    hook: "Apple Watch Ultra can start a run with one button",
    exact_words: "I want the Action button to start my usual running workout immediately.",
    visual_world: "forest",
    lighting_family: "cool forest morning light",
    emotion: "ready to start without opening menus",
    slides: [
      ["hook", "Apple Watch Ultra can start a run with one button"],
      ["felt_moment", "Opening Workout and finding Outdoor Run adds taps before every start."],
      ["hidden_cost", "The Action button does nothing useful until you assign it."],
      ["fix", "Open Settings, Action Button, then choose Workout."],
      ["fix", "Set First Press to start your preferred workout."],
      ["proof", "One press can now open the run without searching menus."],
      ["cta", "Save this before setting up Apple Watch Ultra."]
    ]
  },
  {
    profile: "watch",
    key: "garmin-satiq",
    schema: "data_is_not_coaching_v1",
    problem_type: "metric setup confusion",
    semantic_problem_type: "garmin recovery heart rate",
    content_pillar: "watch_recovery",
    source_url: "https://support.garmin.com/en-NZ/?faq=3HTTUrSoRF51m8vGUtMhY9",
    hook: "Wait before saving if you want Garmin recovery heart rate",
    exact_words: "My Garmin recovery heart rate disappears when I save the activity immediately.",
    visual_world: "mountain",
    lighting_family: "bright mountain daylight",
    emotion: "finished, curious about recovery",
    slides: [
      ["hook", "Wait before saving if you want Garmin recovery heart rate"],
      ["felt_moment", "You stop the timer and immediately press Save."],
      ["hidden_cost", "Some Garmin watches need two minutes before showing recovery heart rate."],
      ["fix", "Stop the activity, then open Recovery Heart Rate."],
      ["fix", "Wait for the reading before saving the run."],
      ["proof", "Saving immediately or using Resume Later can hide that reading."],
      ["cta", "Save this before finishing your next Garmin run."]
    ]
  },
  {
    profile: "watch",
    key: "coros-effort-pace",
    schema: "runner_mistake_reframe_v1",
    problem_type: "metric setup confusion",
    semantic_problem_type: "garmin device lock",
    content_pillar: "watch_controls",
    source_url: "https://support.garmin.com/en-AU/?faq=EZ9NRkq23J4KcI8L3SKdt7",
    hook: "Lock your Garmin before rain or sleeves press the screen",
    exact_words: "Rain and sleeves can touch my Garmin screen and change it during a run.",
    visual_world: "mountain",
    lighting_family: "clear mountain morning light",
    emotion: "annoyed by accidental screen touches",
    slides: [
      ["hook", "Lock your Garmin before rain or sleeves press the screen"],
      ["felt_moment", "Wet sleeves can brush a touchscreen while you keep running."],
      ["hidden_cost", "One accidental touch can change pages or trigger controls."],
      ["fix", "Add Lock Device to the Garmin Controls menu."],
      ["fix", "Some models can also assign Lock Device as a Hot Key."],
      ["proof", "Hold a button when you need the controls again."],
      ["cta", "Save this before your next wet Garmin run."]
    ]
  },
  {
    profile: "watch",
    key: "garmin-auto-lap-workout",
    schema: "q_and_a_comment_prompt_v1",
    problem_type: "watch controls",
    semantic_problem_type: "coros dial press behavior",
    content_pillar: "watch_workouts",
    source_url: "https://support.coros.com/hc/en-us/articles/47169858848020-Customizing-Your-Dial-Press-Setting-for-Activities",
    hook: "Choose what one COROS dial press does during a run",
    exact_words: "I want one COROS dial press to pause, or open options without pausing.",
    visual_world: "forest",
    lighting_family: "soft forest afternoon light",
    emotion: "choosing between fast pause and more control",
    slides: [
      ["hook", "Choose what one COROS dial press does during a run"],
      ["felt_moment", "One press can pause instantly or open a larger menu."],
      ["hidden_cost", "Instant Pause is quick, but accidental presses stop the timer."],
      ["fix", "Open System, Activity Interface, then Dial Press."],
      ["fix", "Choose Pause Options if you want the run to keep recording."],
      ["proof", "That menu can review laps or jump workout stages."],
      ["cta", "Save this before changing your COROS dial."]
    ]
  },
  {
    profile: "watch",
    key: "wrist-hr-fast-intervals",
    schema: "how_to_fix_v1",
    problem_type: "metric setup confusion",
    semantic_problem_type: "coros activity auto lock",
    content_pillar: "watch_controls",
    source_url: "https://support.coros.com/hc/en-us/articles/360039836552-Auto-Lock-Settings-on-Your-COROS-Watch",
    hook: "Why COROS Auto Lock matters when watch buttons get pressed",
    exact_words: "My COROS watch buttons can pause a run accidentally.",
    visual_world: "lake",
    lighting_family: "bright lake daylight",
    emotion: "frustrated by accidental pauses",
    slides: [
      ["hook", "Why COROS Auto Lock matters when watch buttons get pressed"],
      ["felt_moment", "A sleeve or bent wrist can touch the dial mid-run."],
      ["hidden_cost", "An accidental press can pause or finish the activity."],
      ["fix", "Open System, More Settings, then Auto Lock."],
      ["fix", "Choose the hold or scroll option for Activity Mode."],
      ["proof", "The Back/Lap button still records a lap while locked."],
      ["cta", "Save this before your next COROS run."]
    ]
  },
  {
    profile: "watch",
    key: "apple-pacer-race-route",
    schema: "things_i_wish_i_knew_v1",
    problem_type: "metric setup confusion",
    semantic_problem_type: "polar fuelwise carb reminder",
    content_pillar: "watch_fueling",
    source_url: "https://support.polar.com/en/fuelwise",
    hook: "Why my Polar watch moved the carb alert mid-run",
    exact_words: "I want my Polar watch fueling alert to react when the run gets harder.",
    visual_world: "forest",
    lighting_family: "clear forest morning light",
    emotion: "surprised by a changing fuel reminder",
    slides: [
      ["hook", "Why my Polar watch moved the carb alert mid-run"],
      ["felt_moment", "The next reminder arrived sooner after the run became harder."],
      ["hidden_cost", "A fixed timer cannot react when your energy use changes."],
      ["fix", "Set Smart Carbs Reminder before starting the session."],
      ["fix", "Enter planned duration, intensity, and carbs per serving."],
      ["proof", "FuelWise adjusts reminder timing from your actual intensity."],
      ["cta", "Save this before your next long Polar run."]
    ]
  },
  {
    profile: "marathon",
    key: "rain-minute-6",
    schema: "things_i_wish_i_knew_v1",
    problem_type: "shoes",
    semantic_problem_type: "wet shoe blister",
    content_pillar: "marathon_journal",
    marathon_content_category: "easy_run",
    is_workout_post: true,
    training_day: 50,
    workout_outfit_key: "day_50_teal_rain_shell_black_tights",
    hook: "Why I stopped my run after 7 minutes in wet shoes",
    exact_words: "Rain soaked my shoes and one heel started rubbing after seven minutes.",
    visual_world: "forest",
    lighting_family: "wet overcast forest daylight",
    emotion: "annoyed by stopping, relieved the next day",
    coachi_app_cta_allowed: false,
    slides: [
      ["hook", "Why I stopped my run after 7 minutes in wet shoes"],
      ["felt_moment", "I expected light rain, but my socks soaked through immediately."],
      ["hidden_cost", "One heel started feeling hot before it actually hurt."],
      ["fix", "I stopped instead of pretending the rubbing would disappear."],
      ["fix", "Dry socks and blister tape are joining my long-run bag."],
      ["proof", "Cutting one run short protected the next training day."],
      ["cta", "Follow the next honest marathon-training mistake."]
    ]
  },
  {
    profile: "marathon",
    key: "missed-run-progress",
    schema: "runner_mistake_reframe_v1",
    problem_type: "recovery day guilt",
    content_pillar: "marathon_journal",
    marathon_content_category: "recovery",
    is_workout_post: false,
    hook: "Why I thought one missed run had erased my progress",
    exact_words: "Life got in the way and I missed one run. I left the week alone instead of squeezing it in.",
    visual_world: "lake",
    lighting_family: "quiet lake evening light",
    emotion: "guilty, then relieved",
    coachi_app_cta_allowed: false,
    slides: [
      ["hook", "Why I thought one missed run had erased my progress"],
      ["felt_moment", "I missed the session and immediately wanted to move everything."],
      ["hidden_cost", "Squeezing it in would have stacked two hard days together."],
      ["fix", "I left the missed run where it was."],
      ["fix", "The next planned session felt completely normal."],
      ["proof", "One empty box did not erase the work already done."],
      ["cta", "Follow the messy weeks, not only the perfect ones."]
    ]
  },
  {
    profile: "marathon",
    key: "legs-minute-12",
    schema: "q_and_a_comment_prompt_v1",
    problem_type: "easy_run",
    content_pillar: "marathon_journal",
    marathon_content_category: "easy_run",
    is_workout_post: true,
    training_day: 51,
    workout_outfit_key: "day_51_rust_long_sleeve_navy_tights",
    hook: "My legs felt awful for 12 minutes. Was the run already bad?",
    exact_words: "My legs felt stiff for twelve minutes, then the run finally settled without me forcing the pace.",
    visual_world: "mountain",
    lighting_family: "cool mountain morning light",
    emotion: "worried early, calmer later",
    coachi_app_cta_allowed: false,
    slides: [
      ["hook", "My legs felt awful for 12 minutes. Was the run already bad?"],
      ["felt_moment", "Minute three felt stiff enough to judge the whole day."],
      ["hidden_cost", "I nearly sped up just to make the run feel normal."],
      ["fix", "I kept the pace boring and gave my legs more time."],
      ["fix", "At minute 12, my breathing and stride finally settled."],
      ["proof", "The bad start stayed at the start."],
      ["cta", "Do your legs need time before a run feels normal?"]
    ]
  },
  {
    profile: "marathon",
    key: "food-minute-35",
    schema: "things_i_wish_i_knew_v1",
    problem_type: "food",
    content_pillar: "marathon_journal",
    marathon_content_category: "food",
    is_workout_post: true,
    training_day: 52,
    workout_outfit_key: "day_52_blue_singlet_black_shorts",
    hook: "Why I ran out of food 35 minutes into my longest run",
    exact_words: "I packed less than planned and spent the second half thinking about the snack I left at home.",
    visual_world: "lake",
    lighting_family: "bright lake morning light",
    emotion: "fine early, distracted and hungry later",
    coachi_app_cta_allowed: false,
    slides: [
      ["hook", "Why I ran out of food 35 minutes into my longest run"],
      ["felt_moment", "I left one snack at home because the run felt manageable."],
      ["hidden_cost", "At minute 35, food became the only thing I could think about."],
      ["fix", "I slowed down and stopped pretending the plan had not changed."],
      ["fix", "Next time, the extra snack is coming even if I feel confident."],
      ["proof", "I finished, but the second half felt much longer than planned."],
      ["cta", "Follow the next long-run attempt."]
    ]
  },
  {
    profile: "marathon",
    key: "last-hill-sprint",
    schema: "runner_mistake_reframe_v1",
    problem_type: "hills",
    content_pillar: "marathon_journal",
    marathon_content_category: "hills",
    is_workout_post: true,
    training_day: 53,
    workout_outfit_key: "day_53_maroon_tee_gray_shorts",
    hook: "I sprinted the last hill. Why did my next run feel worse?",
    exact_words: "I pushed the last climb much harder than planned and carried it into the next day.",
    visual_world: "forest",
    lighting_family: "warm forest afternoon light",
    emotion: "proud for one minute, regretful the next day",
    coachi_app_cta_allowed: false,
    slides: [
      ["hook", "I sprinted the last hill. Why did my next run feel worse?"],
      ["felt_moment", "I wanted one strong finish after a controlled workout."],
      ["hidden_cost", "The hill lasted seconds. My legs remembered it the next morning."],
      ["fix", "I should have finished the climb at the effort I planned."],
      ["fix", "The next run started heavy before I reached the first corner."],
      ["proof", "That tiny victory took more than it gave."],
      ["cta", "Follow the next workout, including the bad decisions."]
    ]
  },
  {
    profile: "marathon",
    key: "app-stack-week8",
    schema: "top_5_rules_v1",
    problem_type: "data-without-coaching",
    content_pillar: "marathon_journal",
    marathon_content_category: "apps",
    is_workout_post: false,
    hook: "Top 5 running apps I use when running",
    exact_words: "I use five running apps for five different jobs, and Coachi is second because it helps while I am running.",
    visual_world: "forest",
    lighting_family: "soft forest morning light",
    emotion: "honest about which apps stayed useful",
    coachi_app_cta_allowed: true,
    coachi_app_cta_text: "1 Strava\n2 Coachi\n3 Nike Run Club\n4 Apple Fitness\n5 AllTrails",
    slides: [
      ["hook", "Top 5 running apps I use when running"],
      ["felt_moment", "5. AllTrails helps when I need a route that feels new."],
      ["hidden_cost", "4. Apple Fitness gives me the quick Apple Watch recap."],
      ["fix", "3. Nike Run Club helps when I want a guided run."],
      ["fix", "2. Coachi tells me when my effort drifts during the run."],
      ["proof", "1. Strava keeps my route history and running friends together."],
      ["cta", "1 Strava\n2 Coachi\n3 Nike Run Club\n4 Apple Fitness\n5 AllTrails"]
    ]
  }
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      stdio: "inherit",
      env: process.env
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}`));
    });
  });
}

function candidateFor(topic, index) {
  const problem_id = topic.profile === "marathon"
    ? MARATHON_PROBLEM_IDS[topic.key]
    : `rp_2026_07_27_${topic.profile}_${topic.key.replaceAll("-", "_")}`;
  assert(problem_id, `Missing source problem id for ${topic.profile}/${topic.key}`);
  const format_id = `${topic.profile}_${topic.key.replaceAll("-", "_")}_v1`;
  const source_url = topic.source_url || (
    topic.profile === "marathon"
      ? `local://inputs/research/road-to-marathon-fit-personal-experience-bank.json#${problem_id}`
      : LOCAL_SOURCE
  );
  const quality = scoreCoachiHook(
    topic.hook,
    { problem_type: topic.problem_type, exact_words: topic.exact_words },
    { source_family_id: format_id }
  );
  assert(quality.passes_quality_gate, `Hook failed quality gate: ${topic.hook} (${quality.score}/70)`);
  const slide_draft = topic.slides.map(([role, text], slideIndex) => ({
    slide_number: slideIndex + 1,
    role,
    text
  }));
  const hookCandidates = [
    topic.hook,
    `What changed in this ${topic.profile === "watch" ? "watch setup" : "run"}`,
    "The mistake that showed up later than expected",
    "Why the first few minutes changed the whole session",
    "What I would change before doing this again",
    "The small decision that made the second half different",
    "What looked normal until the run got harder",
    "A clearer way to handle the same problem"
  ].map((hook) => ({
    hook,
    ...scoreCoachiHook(
      hook,
      { problem_type: topic.problem_type, exact_words: topic.exact_words },
      { source_family_id: format_id }
    ),
    source: "frozen_topic_variant"
  }));

  return {
    problem_id,
    source_url,
    source_type: topic.profile === "marathon"
      ? "road_to_marathon_fit_personal_experience_bank"
      : topic.profile === "watch"
        ? "official_watch_documentation"
        : "dated_account_specific_recovery_topic",
    schema: topic.schema,
    format_id,
    account_profile: topic.profile,
    hook: topic.hook,
    problem_type: topic.problem_type,
    semantic_problem_type: topic.semantic_problem_type || null,
    content_pillar: topic.content_pillar,
    marathon_content_category: topic.marathon_content_category || null,
    is_workout_post: topic.is_workout_post ?? null,
    training_day: topic.training_day || null,
    workout_outfit_key: topic.workout_outfit_key || null,
    coachi_app_cta_allowed: topic.coachi_app_cta_allowed ?? null,
    coachi_app_cta_text: topic.coachi_app_cta_text || null,
    exact_words: topic.exact_words,
    problem: topic.exact_words,
    emotion: topic.emotion,
    pattern: topic.profile === "marathon"
      ? "first-person marathon training diary"
      : topic.profile === "watch"
        ? "technical watch guide"
        : "specific runner decision guide",
    visual_world: topic.visual_world,
    route_tag: topic.visual_world,
    lighting_family: topic.lighting_family,
    avatar_world_required: true,
    images_2_0_rule: "slide_1_only",
    cta_required: true,
    hook_source: {
      source: topic.profile === "watch" ? "official_watch_documentation" : "curated_topic_bank",
      source_family_id: format_id,
      source_url,
      why_it_works: "A concrete problem, recognizable moment, and clear payoff."
    },
    selected_hook_quality: { ...quality, source: "frozen_topic" },
    hook_candidates: hookCandidates,
    slide_draft,
    slideshow: slide_draft,
    batch_index: index
  };
}

const accountCounters = new Map();
const generatedPacks = [];

if (RESET_ROTATION_LOG) {
  await writeJson(BATCH_USAGE_LOG, {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    uses: []
  });
}

for (const [index, topic] of TOPICS.entries()) {
  const accountIndex = (accountCounters.get(topic.profile) || 0) + 1;
  accountCounters.set(topic.profile, accountIndex);
  const slug = STABLE_REPLACEMENT_SLUGS[`${topic.profile}:${topic.key}`]
    || `${DATE}-${topic.profile}-${String(accountIndex).padStart(2, "0")}-${topic.key}-${slugify(topic.hook)}`;
  const packDir = path.join("content", "slideshows", slug);
  const candidate = candidateFor(topic, index);
  const topicPath = path.join(TOPIC_DIR, `${slug}.json`);

  await writeJson(topicPath, {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    date: DATE,
    account_profile: topic.profile,
    candidate_count: 1,
    candidates: [candidate]
  });

  let existingQa = null;
  try {
    existingQa = JSON.parse(await fs.readFile(path.join(packDir, "source", "qa-report.json"), "utf8"));
  } catch {
    existingQa = null;
  }

  if (existingQa?.ok !== true || FORCE_RERENDER) {
    let reuseExistingHook = false;
    let packExists = false;
    try {
      await fs.access(path.join(packDir, "slides", "source", "01-hook.png"));
      const hookProvenance = JSON.parse(
        await fs.readFile(path.join(packDir, "source", "hook-provenance.json"), "utf8")
      );
      packExists = true;
      reuseExistingHook = hookProvenance.fallback_used !== true;
    } catch {
      reuseExistingHook = false;
    }
    await run("node", [
      "scripts/run_slideshow_pipeline.mjs",
      "--date", DATE,
      "--topics-out", topicPath,
      "--use-existing-topics",
      "--candidate-index", "0",
      "--slug", slug,
      "--production",
      "--usage-log", BATCH_USAGE_LOG,
      "--include-selected-usage",
      ...(reuseExistingHook ? [] : ["--generate-openai-hook"]),
      ...(reuseExistingHook || packExists ? ["--force"] : []),
      "--tiktok-account", topic.profile,
      "--no-schedule"
    ]);
  }

  generatedPacks.push({
    slug,
    profile: topic.profile,
    hook: topic.hook,
    format_id: candidate.format_id,
    problem_id: candidate.problem_id,
    coachi_app_cta: candidate.coachi_app_cta_allowed === true
  });
}

assert(TOPICS.length === 18, `Expected 18 topics, found ${TOPICS.length}`);
for (const profile of ["main", "watch", "marathon"]) {
  assert(accountCounters.get(profile) === 6, `Expected 6 ${profile} topics`);
}

await writeJson(path.join(RUN_DIR, "batch-manifest.json"), {
  generated_at: new Date().toISOString(),
  date: DATE,
  count: generatedPacks.length,
  account_counts: Object.fromEntries(accountCounters),
  coachi_marathon_cta_count: generatedPacks.filter((pack) => pack.profile === "marathon" && pack.coachi_app_cta).length,
  sent_to_tiktok: false,
  packs: generatedPacks
});
