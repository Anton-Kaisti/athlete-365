export const SKILLS = ["strength", "push", "pull", "legs", "core", "mobility", "athleticism", "recovery"];

const movementInstructions = {
  "Arm Circle": instruction("Stand tall with arms extended comfortably to the sides.", ["Make small forward circles from the shoulders, gradually increasing the size.", "Reverse direction while keeping the ribs down and neck relaxed."]),
  "Band Pull-Apart": instruction("Hold a light resistance band at chest height with straight arms and hands wider than shoulders.", ["Pull the band apart by moving the hands outward and squeezing the shoulder blades.", "Stop before the shoulders shrug, then return slowly without letting the band snap back."]),
  "Band Row": instruction("Anchor a resistance band securely around chest height and step back until it is lightly tensioned.", ["Start with long arms, tall posture, and ribs stacked over the pelvis.", "Drive elbows back and pull the hands toward the ribs.", "Pause briefly, then straighten the arms under control."]),
  "Bear Crawl": instruction("Begin on hands and knees, then lift the knees a few centimetres from the floor.", ["Brace the trunk and keep the back flat.", "Move the opposite hand and foot together using short, quiet steps.", "Crawl forward and backward without letting the hips sway."]),
  "Bird Dog": instruction("Start on hands and knees with hands below shoulders and knees below hips.", ["Brace gently, then reach one arm forward and the opposite leg backward.", "Keep hips and ribs facing the floor; do not arch the lower back.", "Pause, return slowly, and repeat on the other side."]),
  "Calf Raise": instruction("Stand tall with feet parallel and use a wall for balance if needed.", ["Rise onto the balls of the feet as high as comfortable.", "Pause at the top, then lower the heels slowly through the full range."]),
  "Dead Bug": instruction("Lie on your back with hips and knees bent to 90 degrees and arms pointing upward.", ["Exhale and gently press the lower back toward the floor.", "Lower one arm and the opposite leg without losing the back position.", "Return slowly and alternate sides."]),
  "Dead Hang": instruction("Grip a secure pull-up bar with the feet clear or lightly supported.", ["Let the arms lengthen while keeping the shoulders in a comfortable position.", "Keep breathing and stop before the grip fails or the shoulders become painful."]),
  "Glute Bridge": instruction("Lie on your back with knees bent and feet planted near the hips.", ["Brace lightly and press through the heels.", "Lift the hips by squeezing the glutes without arching the lower back.", "Pause at the top, then lower under control."]),
  "Good Morning": instruction("Stand with feet around hip width and place the hands across the chest or behind the head.", ["Soften the knees and push the hips backward.", "Keep a long spine as the torso tips forward.", "Stop when the hamstrings tighten, then squeeze the glutes to stand."]),
  "Hollow Hold": instruction("Lie on your back with knees bent and arms reaching forward.", ["Exhale and press the lower back firmly into the floor.", "Lift the head and shoulders, then extend the legs only as far as the back stays down.", "Breathe in short controlled breaths while holding."]),
  "Incline Push-Up": instruction("Place both hands on a stable wall, counter, or chair and walk the feet back.", ["Form a straight line from head to heels and brace the trunk.", "Lower the chest toward the support with elbows angled slightly back.", "Press away until the arms are straight without letting the hips sag."]),
  "Jump Rope": instruction("Hold the handles lightly with the rope behind the heels and stand tall.", ["Turn the rope mainly from the wrists rather than the shoulders.", "Make small, quiet two-foot bounces and let the rope pass under once per jump.", "Reset to single jumps whenever the rhythm breaks."]),
  "Mobility Flow": instruction("Choose a clear space and move only through comfortable, pain-free ranges.", ["Use slow ankle rocks, hip rotations, upper-back turns, and shoulder reaches.", "Move continuously without bouncing or forcing a stretch.", "Keep breathing slowly throughout the flow."]),
  "Mountain Climber": instruction("Begin in a high plank with hands under shoulders and feet extended behind you.", ["Push the floor away and keep the hips level.", "Bring one knee toward the chest without rounding or bouncing.", "Return the foot and alternate sides at a controlled pace."]),
  "Plyo Push-Up": instruction("Begin in a strong push-up position on a firm, non-slip surface.", ["Lower under control, then drive into the floor as quickly as possible.", "Let the hands become light or leave the floor only if control is maintained.", "Land with soft elbows and reset before the next repetition."]),
  "Pogo Jump": instruction("Stand tall with feet about hip width and knees softly unlocked.", ["Make small jumps by springing mainly from the ankles.", "Land quietly on the balls of the feet and rebound with minimal knee bend.", "Keep the torso tall and stop if the Achilles tendon or knees hurt."]),
  "Plank": instruction("Place elbows below shoulders and extend the legs behind you.", ["Squeeze the glutes and brace as if preparing for a light punch.", "Keep the ribs down, hips level, and head in line with the spine.", "Breathe slowly without losing tension."]),
  "Push-Up": instruction("Place hands just outside shoulder width and form a straight line from head to heels.", ["Brace the stomach and squeeze the glutes.", "Lower the chest between the hands with elbows about 30-45 degrees from the body.", "Press the floor away without letting the hips sag."]),
  "Reverse Lunge": instruction("Stand tall with feet under the hips and keep a wall nearby if balance is uncertain.", ["Step one foot backward and land on the ball of that foot.", "Lower the back knee while keeping the front foot fully planted.", "Push through the front leg to return to standing, then change sides."]),
  "Ring Row": instruction("Set secure rings around waist-to-chest height and hold them with straight arms.", ["Walk the feet forward to choose a manageable body angle.", "Keep the body rigid and pull the rings toward the ribs.", "Squeeze the shoulder blades, then lower under control."]),
  "Scapular Push-Up": instruction("Start in a high plank with straight elbows.", ["Let the chest sink slightly as the shoulder blades move together.", "Push the floor away and spread the shoulder blades without bending the elbows."]),
  "Side Plank": instruction("Lie on one side with the elbow below the shoulder and knees bent or legs straight.", ["Push the forearm into the floor and lift the hips.", "Stack the ribs over the pelvis and keep the body facing sideways.", "Breathe steadily, then lower under control."]),
  "Single-Leg Balance": instruction("Stand beside a wall or chair so support is within reach.", ["Shift weight onto one foot and lift the other foot just off the floor.", "Keep the standing knee softly bent and fix the eyes on one point.", "Use fingertip support as needed, then switch sides."]),
  "Sit-Up": instruction("Lie on your back with knees bent and feet planted.", ["Brace gently and curl the ribs toward the pelvis.", "Rise only as far as you can without pulling on the neck or jerking.", "Lower slowly until the upper back returns to the floor."]),
  "Skater Hop": instruction("Stand on one leg with the knee softly bent and the chest tall.", ["Push sideways and land on the opposite leg.", "Absorb the landing quietly by bending the hip, knee, and ankle.", "Hold balance before the next hop."]),
  "Split Squat": instruction("Stand in a staggered stance with both feet pointing forward.", ["Lower the back knee toward the floor while keeping the front foot planted.", "Keep the front knee tracking in the same direction as the toes.", "Drive through the front foot to stand."]),
  "Squat": instruction("Stand around shoulder width with toes turned slightly outward.", ["Brace gently and sit the hips down between the knees.", "Keep the whole foot planted and knees tracking with the toes.", "Stand by pushing the floor away."]),
  "Step-Up": instruction("Use a stable, non-rolling step or low chair placed against a wall.", ["Place the whole working foot on the surface.", "Drive through that leg to stand tall without jumping from the floor leg.", "Lower slowly and keep the knee tracking over the toes."]),
  "Tibialis Raise": instruction("Lean the back against a wall with feet slightly forward and heels planted.", ["Lift the toes and forefeet toward the shins.", "Pause at the top, then lower under control without moving the heels."]),
  "Wall Sit": instruction("Stand with the back against a clear wall and feet about one to two foot-lengths forward.", ["Slide down until the knees are comfortably bent.", "Keep the whole foot planted and knees aligned with the toes.", "Press the back into the wall and breathe steadily while holding."]),
  "Wall Slide": instruction("Stand with the back against a wall, feet slightly forward, and ribs gently tucked.", ["Place forearms against the wall with elbows bent.", "Slide the arms upward only as far as the ribs stay down and shoulders stay comfortable.", "Lower slowly while keeping gentle contact with the wall."])
};

export const exerciseLibrary = {
  "Active Hang": item("Active Hang", "pull", ["pull-up bar"], "Hold an active shoulder position without shrugging.", "Dead hang", "Scapular pull-up", ["Band lat pulldown", "Towel isometric pull"]),
  "Arm Circle": item("Arm Circle", "mobility", [], "Move the shoulders smoothly without shrugging.", "Smaller circles", "Larger controlled circles", ["Wall slide"]),
  "Assisted Pull-Up": item("Assisted Pull-Up", "pull", ["pull-up bar", "resistance bands"], "Pull smoothly and stop one or two reps before failure.", "Ring row", "Strict pull-up", ["Ring row", "Table row"]),
  "Band Face Pull": item("Band Face Pull", "shoulder", ["resistance bands"], "Pull toward the face with elbows high and ribs down.", "Prone Y raise", "Slower tempo face pull", ["Prone Y raise"]),
  "Band Pull-Apart": item("Band Pull-Apart", "pull", ["resistance bands"], "Open the band with the shoulder blades rather than shrugging.", "Lighter band", "Paused pull-apart", ["Wall slide"]),
  "Band Row": item("Band Row", "pull", ["resistance bands"], "Pull toward the ribs while keeping the torso still.", "Lighter band row", "Slower or heavier band row", ["Ring row"]),
  "Bear Crawl": item("Bear Crawl", "athleticism", [], "Keep the knees low and take quiet opposite-hand-and-foot steps.", "Static bear hold", "Longer or backward crawl", ["Bird dog"]),
  "Bird Dog": item("Bird Dog", "core", [], "Reach long without rotating the hips or arching the back.", "Move only one limb", "Paused bird dog", ["Dead bug"]),
  "Broad Jump": item("Broad Jump", "athleticism", [], "Land quietly with knees tracking over toes.", "Low squat jump", "Repeated broad jumps", ["Low pogo jump"]),
  "Bulgarian Split Squat": item("Bulgarian Split Squat", "legs", ["chair"], "Control the descent and keep the front foot rooted.", "Split squat", "Rear-foot-elevated split squat with pause", ["Split squat", "Step-up"]),
  "Calf Raise": item("Calf Raise", "legs", ["stairs"], "Pause at the top and lower under control.", "Floor calf raise", "Single-leg calf raise", ["Floor calf raise"]),
  "Copenhagen Plank": item("Copenhagen Plank", "core", ["chair"], "Keep hips tall and adductors engaged.", "Bent-knee Copenhagen", "Long-lever Copenhagen", ["Side plank adductor squeeze"]),
  "Dead Bug": item("Dead Bug", "core", [], "Exhale fully and keep the low back quiet.", "Heel taps", "Hollow body hold", ["Heel taps"]),
  "Dead Hang": item("Dead Hang", "pull", ["pull-up bar"], "Relax the body while keeping pain-free shoulders.", "Feet-assisted hang", "Active hang", ["Towel shoulder traction"]),
  "Glute Bridge": item("Glute Bridge", "legs", [], "Lift with the glutes while keeping the ribs down.", "Short-range bridge", "Single-leg bridge", ["Hip thrust"]),
  "Good Morning": item("Good Morning", "legs", [], "Hinge at the hips with a long spine.", "Wall hip hinge", "Band-resisted good morning", ["Single-leg RDL"]),
  "Hollow Hold": item("Hollow Hold", "core", [], "Press low back down and breathe behind the brace.", "Dead bug", "Long hollow hold", ["Dead bug"]),
  "Incline Push-Up": item("Incline Push-Up", "push", [], "Keep a straight body line while lowering toward a stable support.", "Wall push-up", "Lower incline push-up", ["Push-up"]),
  "Jump Rope": item("Jump Rope", "athleticism", ["jump rope"], "Build a relaxed, unbroken rhythm; stop the interval if your landings become heavy or form breaks down.", "Marching", "Double-under practice", ["Low pogo jump", "Jumping jack"]),
  "L-Sit Tuck": item("L-Sit Tuck", "core", ["rings"], "Push the support away and keep the knees high.", "Seated knee lift", "One-leg L-sit", ["Chair support hold"]),
  "Lateral Bound": item("Lateral Bound", "athleticism", [], "Stick each landing before the next rep.", "Side step and hold", "Continuous skater bounds", ["Lateral step-down"]),
  "Mobility Flow": item("Mobility Flow", "mobility", [], "Move slowly through hips, ankles, t-spine, and shoulders.", "Shorter flow", "Longer flow", ["Breathing reset"]),
  "Mountain Climber": item("Mountain Climber", "core", [], "Keep the hips quiet while alternating knees toward the chest.", "Elevated slow mountain climber", "Faster controlled mountain climber", ["High plank"]),
  "Nordic Regression": item("Nordic Regression", "legs", [], "Keep hips open and use hands before form breaks.", "Hamstring walkout", "Longer eccentric Nordic", ["Hamstring bridge"]),
  "Pistol Squat Box": item("Pistol Squat Box", "legs", ["chair"], "Sit back to the box with a controlled knee line.", "Step-down", "Lower box pistol", ["Split squat"]),
  "Plank": item("Plank", "core", [], "Squeeze glutes and breathe without sagging.", "Knee plank", "Long-lever plank", ["Dead bug"]),
  "Plyo Push-Up": item("Plyo Push-Up", "push", [], "Push explosively and land with soft elbows.", "Fast push-up", "Clap push-up", ["Incline fast push-up"]),
  "Pogo Jump": item("Pogo Jump", "athleticism", [], "Bounce lightly and quietly through the ankles.", "Fast calf raise", "Higher or single-leg pogo", ["Jump rope"]),
  "Push-Up": item("Push-Up", "push", [], "Keep a straight body line and full control.", "Incline push-up", "Ring push-up", ["Incline push-up"]),
  "Reverse Lunge": item("Reverse Lunge", "legs", [], "Step backward and load the planted front leg.", "Assisted reverse lunge", "Deficit reverse lunge", ["Split squat"]),
  "Ring Dip Progression": item("Ring Dip Progression", "push", ["rings"], "Use stable shoulders and stop before deep discomfort.", "Bench dip", "Strict ring dip", ["Push-up", "Support hold"]),
  "Ring Row": item("Ring Row", "pull", ["rings"], "Pull the rings to the ribs and keep the body rigid.", "Table row", "Feet-elevated ring row", ["Table row", "Band row"]),
  "Ring Support Hold": item("Ring Support Hold", "push", ["rings"], "Turn rings slightly out and press tall.", "Chair support hold", "Ring dip negative", ["Push-up plank hold"]),
  "Scapular Pull-Up": item("Scapular Pull-Up", "pull", ["pull-up bar"], "Move only the shoulder blades.", "Active hang", "Pull-up", ["Band scapular pulldown"]),
  "Scapular Push-Up": item("Scapular Push-Up", "shoulder", [], "Reach the floor away without bending elbows.", "Wall scap push-up", "Feet-elevated scap push-up", ["Wall scap push-up"]),
  "Shuttle Start": item("Shuttle Start", "athleticism", [], "Accelerate for a few steps, then decelerate cleanly.", "Fast march", "Longer shuttle", ["Low pogo jump"]),
  "Side Plank": item("Side Plank", "core", [], "Stack ribs and pelvis while pushing the floor away.", "Bent-knee side plank", "Star side plank", ["Suitcase hold placeholder"]),
  "Single-Leg Balance": item("Single-Leg Balance", "recovery", [], "Stay tall and use nearby support whenever needed.", "Toe-supported balance", "Eyes-closed balance", ["Kickstand hold"]),
  "Single-Leg RDL": item("Single-Leg RDL", "legs", [], "Hinge from the hip and keep the pelvis square.", "Kickstand RDL", "Reach-loaded single-leg RDL", ["Hip airplane hold"]),
  "Sit-Up": item("Sit-Up", "core", [], "Curl upward under control without pulling on the neck.", "Crunch", "Paused sit-up", ["Dead bug"]),
  "Skater Hop": item("Skater Hop", "athleticism", [], "Move laterally and own the landing.", "Lateral step", "Long skater hop", ["Lateral bound stick"]),
  "Split Squat": item("Split Squat", "legs", [], "Keep pressure through the full front foot.", "Assisted split squat", "Bulgarian split squat", ["Step-up"]),
  "Squat": item("Squat", "legs", [], "Keep the whole foot planted while sitting between the knees.", "Chair squat", "Paused squat", ["Split squat"]),
  "Step-Up": item("Step-Up", "legs", ["chair"], "Drive through the working foot and lower under control.", "Lower step-up", "Higher or loaded step-up", ["Split squat"]),
  "Strict Pull-Up": item("Strict Pull-Up", "pull", ["pull-up bar"], "Start from active shoulders and pull chest toward the bar.", "Band-assisted pull-up", "Chest-to-bar pull-up", ["Ring row", "Table row"]),
  "Tibialis Raise": item("Tibialis Raise", "legs", [], "Keep heels down while lifting the forefoot toward the shin.", "Smaller range", "Feet farther from wall", ["Calf raise"]),
  "Wall Handstand Hold": item("Wall Handstand Hold", "push", ["wall"], "Push tall and keep ribs tucked.", "Pike hold", "Longer wall hold", ["Pike plank"]),
  "Wall Sit": item("Wall Sit", "legs", ["wall"], "Keep the feet planted and breathe while holding against the wall.", "Higher wall sit", "Longer or single-leg-biased wall sit", ["Squat"]),
  "Wall Slide": item("Wall Slide", "mobility", ["wall"], "Slide the arms without flaring the ribs or forcing shoulder range.", "Standing arm raise", "Band-resisted wall slide", ["Arm circle"]),
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
  const guidance = movementInstructions[name] || instruction(`Prepare a clear space for ${name}.`, [cue, "Move through a comfortable range and stop before technique changes."]);
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
    qualities: [category, category === "athleticism" ? "explosiveness" : "control"],
    setup: guidance.setup,
    steps: guidance.steps
  };
}

function instruction(setup, steps) {
  return { setup, steps };
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
  const isJumpRope = name === "Jump Rope";
  const sets = isBenchmark ? 2 : isMobility ? 1 : isJump ? 3 : Math.min(5, 2 + Math.max(0, intensity) + (index < 3 ? 1 : 0));
  const reps = isHold ? `${20 + hard * 5}-${35 + hard * 6} sec` : isMobility ? `${8 + hard * 2}-${12 + hard * 2} min` : isJumpRope ? `${30 + Math.min(30, hard * 10)} sec` : isJump ? `${3 + Math.min(2, hard)} quality reps` : `${6 + hard}-${10 + hard * 2}`;
  return {
    name,
    category: lib.category,
    sets,
    reps,
    restSeconds: isMobility ? 30 : isJumpRope ? 60 : isJump ? 75 : 60 + Math.min(60, hard * 10),
    tempo: isJump || isMobility ? "controlled" : intensity >= 2 ? "31X1" : "2111",
    targetRIR: isMobility || isJumpRope ? null : isJump ? 4 : Math.max(1, 3 - Math.min(2, intensity)),
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
