export const SKILLS = ["strength", "push", "pull", "legs", "core", "mobility", "athleticism", "recovery"];

export const exerciseLibrary = {
  "Active Hang": item("Active Hang", "pull", ["pull-up bar"], "Hold an active shoulder position without shrugging.", "Dead hang", "Scapular pull-up", ["Band lat pulldown", "Towel isometric pull"]),
  "Assisted Pull-Up": item("Assisted Pull-Up", "pull", ["pull-up bar", "resistance bands"], "Pull smoothly and stop one or two reps before failure.", "Ring row", "Strict pull-up", ["Ring row", "Table row"]),
  "Band Face Pull": item("Band Face Pull", "shoulder", ["resistance bands"], "Pull toward the face with elbows high and ribs down.", "Prone Y raise", "Slower tempo face pull", ["Prone Y raise"]),
  "Broad Jump": item("Broad Jump", "athleticism", [], "Land quietly with knees tracking over toes.", "Low squat jump", "Repeated broad jumps", ["Low pogo jump"]),
  "Bulgarian Split Squat": item("Bulgarian Split Squat", "legs", ["chair"], "Control the descent and keep the front foot rooted.", "Split squat", "Rear-foot-elevated split squat with pause", ["Split squat", "Step-up"]),
  "Calf Raise": item("Calf Raise", "legs", ["stairs"], "Pause at the top and lower under control.", "Floor calf raise", "Single-leg calf raise", ["Floor calf raise"]),
  "Copenhagen Plank": item("Copenhagen Plank", "core", ["chair"], "Keep hips tall and adductors engaged.", "Bent-knee Copenhagen", "Long-lever Copenhagen", ["Side plank adductor squeeze"]),
  "Dead Bug": item("Dead Bug", "core", [], "Exhale fully and keep the low back quiet.", "Heel taps", "Hollow body hold", ["Heel taps"]),
  "Dead Hang": item("Dead Hang", "pull", ["pull-up bar"], "Relax the body while keeping pain-free shoulders.", "Feet-assisted hang", "Active hang", ["Towel shoulder traction"]),
  "Hollow Hold": item("Hollow Hold", "core", [], "Press low back down and breathe behind the brace.", "Dead bug", "Long hollow hold", ["Dead bug"]),
  "Jump Rope": item("Jump Rope", "athleticism", ["jump rope"], "Stay tall and bounce lightly through the ankles.", "Marching", "Double-under practice", ["Low pogo jump", "Jumping jack"]),
  "L-Sit Tuck": item("L-Sit Tuck", "core", ["rings"], "Push the support away and keep the knees high.", "Seated knee lift", "One-leg L-sit", ["Chair support hold"]),
  "Lateral Bound": item("Lateral Bound", "athleticism", [], "Stick each landing before the next rep.", "Side step and hold", "Continuous skater bounds", ["Lateral step-down"]),
  "Mobility Flow": item("Mobility Flow", "mobility", [], "Move slowly through hips, ankles, t-spine, and shoulders.", "Shorter flow", "Longer flow", ["Breathing reset"]),
  "Nordic Regression": item("Nordic Regression", "legs", [], "Keep hips open and use hands before form breaks.", "Hamstring walkout", "Longer eccentric Nordic", ["Hamstring bridge"]),
  "Pistol Squat Box": item("Pistol Squat Box", "legs", ["chair"], "Sit back to the box with a controlled knee line.", "Step-down", "Lower box pistol", ["Split squat"]),
  "Plank": item("Plank", "core", [], "Squeeze glutes and breathe without sagging.", "Knee plank", "Long-lever plank", ["Dead bug"]),
  "Plyo Push-Up": item("Plyo Push-Up", "push", [], "Push explosively and land with soft elbows.", "Fast push-up", "Clap push-up", ["Incline fast push-up"]),
  "Push-Up": item("Push-Up", "push", [], "Keep a straight body line and full control.", "Incline push-up", "Ring push-up", ["Incline push-up"]),
  "Ring Dip Progression": item("Ring Dip Progression", "push", ["rings"], "Use stable shoulders and stop before deep discomfort.", "Bench dip", "Strict ring dip", ["Push-up", "Support hold"]),
  "Ring Row": item("Ring Row", "pull", ["rings"], "Pull the rings to the ribs and keep the body rigid.", "Table row", "Feet-elevated ring row", ["Table row", "Band row"]),
  "Ring Support Hold": item("Ring Support Hold", "push", ["rings"], "Turn rings slightly out and press tall.", "Chair support hold", "Ring dip negative", ["Push-up plank hold"]),
  "Scapular Pull-Up": item("Scapular Pull-Up", "pull", ["pull-up bar"], "Move only the shoulder blades.", "Active hang", "Pull-up", ["Band scapular pulldown"]),
  "Scapular Push-Up": item("Scapular Push-Up", "shoulder", [], "Reach the floor away without bending elbows.", "Wall scap push-up", "Feet-elevated scap push-up", ["Wall scap push-up"]),
  "Shuttle Start": item("Shuttle Start", "athleticism", [], "Accelerate for a few steps, then decelerate cleanly.", "Fast march", "Longer shuttle", ["Low pogo jump"]),
  "Side Plank": item("Side Plank", "core", [], "Stack ribs and pelvis while pushing the floor away.", "Bent-knee side plank", "Star side plank", ["Suitcase hold placeholder"]),
  "Single-Leg RDL": item("Single-Leg RDL", "legs", [], "Hinge from the hip and keep the pelvis square.", "Kickstand RDL", "Reach-loaded single-leg RDL", ["Hip airplane hold"]),
  "Skater Hop": item("Skater Hop", "athleticism", [], "Move laterally and own the landing.", "Lateral step", "Long skater hop", ["Lateral bound stick"]),
  "Split Squat": item("Split Squat", "legs", [], "Keep pressure through the full front foot.", "Assisted split squat", "Bulgarian split squat", ["Step-up"]),
  "Strict Pull-Up": item("Strict Pull-Up", "pull", ["pull-up bar"], "Start from active shoulders and pull chest toward the bar.", "Band-assisted pull-up", "Chest-to-bar pull-up", ["Ring row", "Table row"]),
  "Wall Handstand Hold": item("Wall Handstand Hold", "push", ["wall"], "Push tall and keep ribs tucked.", "Pike hold", "Longer wall hold", ["Pike plank"]),
  "Walking": item("Walking", "recovery", [], "Keep it easy enough to nasal breathe.", "Short walk", "Longer walk", ["Easy marching"])
};

export function exercisesAlphabetically() {
  return Object.values(exerciseLibrary).sort((a, b) => a.name.localeCompare(b.name));
}

export function generateProgram(startDate = todayIso()) {
  const days = [];
  for (let dayNumber = 1; dayNumber <= 365; dayNumber += 1) {
    const block = Math.min(13, Math.floor((dayNumber - 1) / 28) + 1);
    const dayInBlock = block === 13 ? dayNumber - 336 : ((dayNumber - 1) % 28) + 1;
    const weekInBlock = Math.min(4, Math.floor((dayInBlock - 1) / 7) + 1);
    const weekday = (dayNumber - 1) % 7;
    const phase = phaseForDay(dayNumber);
    const template = templates[weekday];
    const intensity = weekInBlock === 1 ? 0 : weekInBlock === 2 ? 1 : weekInBlock === 3 ? 2 : -1;
    const blockBonus = Math.floor((block - 1) / 2);
    const isBenchmark = dayNumber % 84 === 0 || dayNumber === 365;
    const date = addDays(startDate, dayNumber - 1);
    days.push({
      dayNumber,
      date,
      block,
      weekInBlock,
      phase,
      title: isBenchmark ? "Benchmark and reset" : template.title,
      focus: isBenchmark ? "Measure key qualities without forcing max fatigue" : template.focus,
      duration: weekday >= 5 || weekInBlock === 4 ? 22 : 28,
      difficulty: weekInBlock === 4 ? 2 : Math.min(5, 2 + intensity + Math.floor(block / 5)),
      type: isBenchmark ? "benchmark" : weekInBlock === 4 || weekday === 3 || weekday === 6 ? "recovery" : "training",
      equipment: unique(template.exercises.flatMap((name) => exerciseLibrary[name].equipment)),
      warmup: warmupFor(weekday),
      exercises: template.exercises.map((name, index) => prescribe(name, weekday, intensity, blockBonus, index, isBenchmark)),
      finisher: template.finisher && weekInBlock !== 4 ? prescribe(template.finisher, weekday, intensity, blockBonus, 9, false) : null,
      cooldown: ["90 seconds easy breathing", "Hip flexor stretch 45 sec per side", "Shoulder or ankle mobility as needed"],
      notes: isBenchmark
        ? "Test clean reps only. Stop any test when form changes or pain appears."
        : weekInBlock === 4
          ? "Deload week: leave extra reps in reserve and finish fresher than you started."
          : "Most strength work should finish with 1-3 repetitions in reserve.",
      recovery: weekday === 6 ? "Keep this very easy. Recovery work earns progress too." : "Adjust volume down if readiness is low."
    });
  }
  return days;
}

export function xpForExercise(exercise, log = {}) {
  const category = exerciseLibrary[exercise.name]?.category || exercise.category;
  const setCount = Number(exercise.sets || 1);
  const difficulty = Number(log.difficulty || 3);
  const pain = Number(log.pain || 0);
  const formGood = log.formGood !== false;
  const base = category === "athleticism" ? 12 : category === "recovery" || category === "mobility" ? 8 : 10;
  let xp = base + setCount * 5 + Math.max(0, exercise.levelWeight || 0) * 4;
  xp *= difficulty <= 2 ? 1.08 : difficulty >= 5 ? 0.85 : 1;
  xp *= formGood ? 1 : 0.75;
  xp *= pain >= 5 ? 0.35 : pain >= 3 ? 0.7 : 1;
  return Math.max(3, Math.round(xp));
}

export function skillsForExercise(name) {
  const category = exerciseLibrary[name]?.category || "strength";
  const map = {
    pull: ["pull", "strength"],
    push: ["push", "strength"],
    legs: ["legs", "strength"],
    core: ["core"],
    mobility: ["mobility", "recovery"],
    recovery: ["recovery"],
    shoulder: ["mobility", "push"],
    athleticism: ["athleticism", "legs"]
  };
  return map[category] || ["strength"];
}

export function levelFromXp(xp) {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level += 1;
  return level;
}

export function xpForLevel(level) {
  return Math.floor(80 * Math.pow(level - 1, 1.72));
}

export function validateProgram(days) {
  const errors = [];
  if (days.length !== 365) errors.push("Program must contain exactly 365 days.");
  if (new Set(days.map((d) => d.dayNumber)).size !== days.length) errors.push("Day numbers must be unique.");
  days.forEach((day) => {
    if (!day.duration) errors.push(`Day ${day.dayNumber} is missing duration.`);
    if (!day.warmup?.length || !day.cooldown?.length) errors.push(`Day ${day.dayNumber} is missing warmup or cooldown.`);
    day.exercises.forEach((exercise) => {
      if (!exerciseLibrary[exercise.name]) errors.push(`Day ${day.dayNumber} references missing exercise ${exercise.name}.`);
    });
  });
  for (let i = 1; i < days.length; i += 1) {
    if (days[i].type === "training" && days[i - 1].focus.includes("jumps") && days[i].focus.includes("jumps")) {
      errors.push(`Back-to-back high intensity plyometrics near day ${days[i].dayNumber}.`);
    }
  }
  return errors;
}

function item(name, category, equipment, cue, regression, progression, alternatives) {
  return {
    name,
    category,
    equipment,
    cue,
    regression,
    progression,
    alternatives,
    description: cue,
    mistakes: "Rushing reps, ignoring pain, and letting positions collapse.",
    qualities: [category, category === "athleticism" ? "explosiveness" : "control"]
  };
}

const templates = [
  { title: "Pull strength and core", focus: "Upper-body pull strength and trunk control", exercises: ["Active Hang", "Scapular Pull-Up", "Ring Row", "Assisted Pull-Up", "Dead Bug", "Side Plank"], finisher: "Dead Hang" },
  { title: "Single-leg resilience", focus: "Single-leg strength, knees, ankles, calves, and groin", exercises: ["Split Squat", "Single-Leg RDL", "Calf Raise", "Copenhagen Plank", "Pistol Squat Box"], finisher: "Walking" },
  { title: "Push strength and shoulders", focus: "Upper-body push strength and shoulder stability", exercises: ["Scapular Push-Up", "Push-Up", "Ring Support Hold", "Band Face Pull", "Plank"], finisher: "Ring Dip Progression" },
  { title: "Mobility and recovery", focus: "Mobility, recovery, and low-intensity core", exercises: ["Mobility Flow", "Dead Bug", "Side Plank", "Walking"], finisher: null },
  { title: "Full-body calisthenics", focus: "Full-body strength and skill practice", exercises: ["Strict Pull-Up", "Bulgarian Split Squat", "Ring Dip Progression", "Hollow Hold", "L-Sit Tuck"], finisher: "Wall Handstand Hold" },
  { title: "Athletic conditioning", focus: "Athletic conditioning, jumps, lateral movement, agility", exercises: ["Jump Rope", "Broad Jump", "Lateral Bound", "Skater Hop", "Shuttle Start"], finisher: "Mobility Flow" },
  { title: "Active recovery", focus: "Walking, mobility, breathing, and light movement", exercises: ["Walking", "Mobility Flow", "Dead Hang"], finisher: null }
];

function prescribe(name, weekday, intensity, blockBonus, index, isBenchmark) {
  const lib = exerciseLibrary[name];
  const hard = Math.max(0, intensity + blockBonus);
  const isHold = ["Active Hang", "Dead Hang", "Plank", "Side Plank", "Hollow Hold", "L-Sit Tuck", "Wall Handstand Hold", "Copenhagen Plank"].includes(name);
  const isMobility = lib.category === "mobility" || lib.category === "recovery";
  const isJump = lib.category === "athleticism";
  const sets = isBenchmark ? 2 : isMobility ? 1 : isJump ? 3 : Math.min(5, 2 + Math.max(0, intensity) + (index < 3 ? 1 : 0));
  const reps = isHold ? `${20 + hard * 5}-${35 + hard * 6} sec` : isMobility ? `${8 + hard * 2}-${12 + hard * 2} min` : isJump ? `${3 + Math.min(2, hard)} quality reps` : `${6 + hard}-${10 + hard * 2}`;
  return {
    name,
    category: lib.category,
    sets,
    reps,
    restSeconds: isMobility ? 30 : isJump ? 75 : 60 + Math.min(60, hard * 10),
    tempo: isJump || isMobility ? "controlled" : intensity >= 2 ? "31X1" : "2111",
    targetRIR: isMobility ? null : isJump ? 4 : Math.max(1, 3 - Math.min(2, intensity)),
    cue: lib.cue,
    regression: lib.regression,
    progression: lib.progression,
    alternatives: lib.alternatives,
    equipment: lib.equipment,
    levelWeight: hard
  };
}

function warmupFor(weekday) {
  const common = ["2 min easy pulse raiser", "Joint circles from ankles to shoulders", "2 rounds of 5 slow squats and 5 scapular reps"];
  if (weekday === 5) return ["3 min easy rope or marching", "Ankle pogo prep", "Lateral shuffle rehearsal"];
  if (weekday === 3 || weekday === 6) return ["Easy nasal breathing", "Gentle hip and t-spine mobility", "Shoulder CARs"];
  return common;
}

function phaseForDay(day) {
  if (day <= 84) return "Foundation";
  if (day <= 168) return "Strength";
  if (day <= 252) return "Athletic performance";
  return "Mastery and longevity";
}

function addDays(startIso, offset) {
  const date = new Date(`${startIso}T00:00:00`);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function unique(values) {
  return [...new Set(values)];
}
