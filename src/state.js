import { SKILLS, generateProgram, skillsForExercise, xpForExercise, levelFromXp, todayIso } from "./program.js";

const KEY = "athlete365-state-v1";
export const QUICK_TASK_COUNT = 5;
export const QUICK_SET_BONUS_XP = 100;
export const DAILY_TASK_MILESTONES = { 10: 100, 20: 250, 30: 450, 50: 900 };

export function initialState() {
  const startDate = todayIso();
  return {
    profile: {
      name: "",
      level: "Intermediate",
      startDate,
      equipment: ["pull-up bar", "rings", "resistance bands", "jump rope", "chair", "stairs"],
      sessionDuration: 30,
      units: "metric",
      theme: "dark",
      limitations: "",
      quickDuration: 120,
      quietQuickTasks: false,
      goal: "Balanced"
    },
    xp: Object.fromEntries(SKILLS.map((skill) => [skill, 0])),
    microTasks: [],
    microTaskHistory: [],
    quickSetId: 1,
    quickTaskDate: startDate,
    quickSetBonus: null,
    activeProgramDay: 1,
    dailyTaskRewards: {},
    lastUndo: null,
    taskCompletions: {},
    streakBonuses: {},
    completedSets: {},
    workouts: {},
    exerciseLogs: {},
    records: [],
    achievements: []
  };
}

export function isSignedIn(state) {
  return Boolean(state.profile.name?.trim());
}

export function signIn(state, username) {
  const next = structuredClone(state);
  next.profile.name = username.trim();
  return ensureMicroTasks(next);
}

export function signOut(state) {
  const next = structuredClone(state);
  next.profile.name = "";
  return next;
}

export function loadState() {
  try {
    const loaded = { ...initialState(), ...JSON.parse(localStorage.getItem(KEY) || "{}") };
    return ensureMicroTasks(loaded);
  } catch {
    return ensureMicroTasks(initialState());
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(KEY);
}

export function programForState(state) {
  return generateProgram(state.profile.startDate);
}

export const microTaskPool = [
  tierTask(1, "10 Push-Ups", "Complete 10 clean push-ups. Use an incline if needed.", 18, ["push", "strength"], [], ["Push-Up"]),
  tierTask(1, "10 Sit-Ups", "Complete 10 controlled sit-ups or crunches.", 14, ["core"], [], ["Sit-Up"]),
  tierTask(1, "15 Squats", "Complete 15 bodyweight squats with full-foot pressure.", 16, ["legs"], [], ["Squat"]),
  tierTask(1, "20-Second Plank", "Hold a strong plank for 20 seconds.", 14, ["core"], [], ["Plank"]),
  tierTask(1, "10 Reverse Lunges", "Complete 5 reverse lunges per side.", 16, ["legs"], [], ["Reverse Lunge"]),
  tierTask(1, "20 Calf Raises", "Complete 20 controlled calf raises.", 14, ["legs"], [], ["Calf Raise"]),
  tierTask(1, "30-Second Mobility Reset", "Open hips, ankles, and shoulders for 30 seconds.", 10, ["mobility", "recovery"], [], ["Mobility Flow"]),
  tierTask(1, "10 Glute Bridges", "Complete 10 glute bridges with a pause at the top.", 12, ["legs", "core"], [], ["Glute Bridge"]),
  tierTask(1, "20 Mountain Climbers", "Complete 10 reps per side at a steady pace.", 15, ["core", "athleticism"], [], ["Mountain Climber"]),
  tierTask(1, "10 Scapular Push-Ups", "Move only your shoulder blades.", 12, ["push", "mobility"], [], ["Scapular Push-Up"]),
  tierTask(1, "8 Bird Dogs", "Complete 4 slow, balanced reps per side.", 12, ["core", "recovery"], [], ["Bird Dog"]),
  tierTask(1, "12 Dead Bugs", "Complete 6 controlled reps per side.", 14, ["core"], [], ["Dead Bug"]),
  tierTask(1, "20-Second Side Plank", "Hold 10 seconds per side with hips tall.", 14, ["core"], [], ["Side Plank"]),
  tierTask(1, "12 Wall Slides", "Keep ribs down and slide the arms smoothly.", 12, ["mobility", "recovery"], [], ["Wall Slide"]),
  tierTask(1, "30-Second Single-Leg Balance", "Balance for 15 seconds per side near a support.", 10, ["athleticism", "recovery"], [], ["Single-Leg Balance"]),
  tierTask(1, "10 Good Mornings", "Hinge slowly with a long spine and soft knees.", 12, ["legs", "mobility"], [], ["Good Morning"]),
  tierTask(1, "20 Arm Circles", "Use 10 controlled circles in each direction.", 10, ["mobility", "recovery"], [], ["Arm Circle"]),
  tierTask(1, "30-Second Posture Reset", "Stand tall, gently brace, and open the chest for 30 seconds.", 10, ["mobility", "recovery"], [], ["Wall Slide"]),
  tierTask(1, "10 Incline Push-Ups", "Use a stable chair or counter and keep a straight body line.", 14, ["push", "strength"], [], ["Incline Push-Up"]),
  tierTask(2, "12 Push-Ups + 12 Squats", "Complete one clean, steady round in about a minute.", 45, ["push", "legs", "strength"], [], ["Push-Up", "Squat"]),
  tierTask(2, "30s Plank + 10 Sit-Ups", "Brace hard and keep reps controlled; finish within a minute.", 36, ["core"], [], ["Plank", "Sit-Up"]),
  tierTask(2, "20 Split Squats", "Complete 10 reps per side.", 34, ["legs", "strength"], [], ["Split Squat"]),
  tierTask(2, "60-Second Mobility Flow", "Move through hips, t-spine, ankles, and shoulders.", 25, ["mobility", "recovery"], [], ["Mobility Flow"]),
  tierTask(2, "30 Low Pogo Jumps", "Bounce lightly and quietly through the ankles.", 35, ["athleticism", "legs"], [], ["Pogo Jump"]),
  tierTask(2, "20 Calf Raises + 10 Tibialis Raises", "Build lower-leg capacity in one quick round.", 38, ["legs", "recovery"], [], ["Calf Raise", "Tibialis Raise"]),
  tierTask(2, "60-Second Bear Crawl", "Crawl forward and backward with quiet, controlled steps.", 32, ["core", "athleticism"], [], ["Bear Crawl"]),
  tierTask(2, "60-Second Wall Sit", "Hold with steady breathing and full-foot pressure.", 34, ["legs", "strength"], [], ["Wall Sit"]),
  tierTask(3, "90-Second Bodyweight Burst", "Cycle clean push-ups, squats, and sit-ups for 90 seconds.", 80, ["strength", "core", "legs", "push"], [], ["Push-Up", "Squat", "Sit-Up"]),
  tierTask(3, "12 Push-Ups + 16 Lunges", "Complete one fast but controlled round.", 70, ["push", "legs", "strength"], [], ["Push-Up", "Reverse Lunge"]),
  tierTask(3, "90-Second Core Block", "Alternate hollow hold, side plank, and dead bug.", 62, ["core"], [], ["Hollow Hold", "Side Plank", "Dead Bug"]),
  tierTask(3, "20 Skater Hops", "Make 10 controlled side-to-side hops per side.", 65, ["athleticism", "legs"], [], ["Skater Hop"]),
  tierTask(3, "60-Second Pull-Up Bar Hang", "Accumulate a minute of relaxed, active hanging.", 58, ["pull", "recovery"], ["pull-up bar"], ["Dead Hang"]),
  tierTask(3, "20 Split Squats", "Complete 10 controlled reps per side.", 74, ["legs", "strength"], [], ["Split Squat"]),
  tierTask(4, "90-Second Density Block", "Rotate push-ups, squats, and a plank with perfect form.", 140, ["strength", "push", "legs", "core"], [], ["Push-Up", "Squat", "Plank"]),
  tierTask(4, "Advanced Leg Control", "Complete 10 split squats per side, then 20 calf raises.", 120, ["legs", "athleticism"], [], ["Split Squat", "Calf Raise"]),
  tierTask(4, "15 Explosive Push-Ups", "Perform fast push-ups with soft landings; use regular push-ups if needed.", 105, ["push", "athleticism"], [], ["Plyo Push-Up"]),
  tierTask(4, "60-Second Pull and Core", "Alternate short hangs and a hollow hold for one minute.", 125, ["pull", "core", "strength"], ["pull-up bar"], ["Dead Hang", "Hollow Hold"]),
  tierTask(4, "60-Second Athletic Burst", "Alternate fast mountain climbers and controlled skater hops.", 135, ["athleticism", "recovery"], [], ["Mountain Climber", "Skater Hop"])
];

export function ensureMicroTasks(state) {
  const next = { ...state };
  next.profile = { ...initialState().profile, ...(next.profile || {}) };
  const today = todayIso();
  next.quickSetId = Number(next.quickSetId) || 1;
  // A quick-task set belongs to one calendar day. Existing saves without this
  // field are treated as today's set so updating the app does not erase it.
  next.quickTaskDate = next.quickTaskDate || today;
  if (next.quickTaskDate !== today) {
    next.quickSetId += 1;
    next.quickTaskDate = today;
    next.quickSetBonus = null;
    next.microTasks = [];
    next.lastUndo = null;
  }
  next.quickSetBonus = next.quickSetBonus || null;
  next.dailyTaskRewards = next.dailyTaskRewards && typeof next.dailyTaskRewards === "object" ? { ...next.dailyTaskRewards } : {};
  next.microTaskHistory = Array.isArray(next.microTaskHistory) ? [...next.microTaskHistory] : [];
  if (next.lastUndo?.type === "micro" && !next.lastUndo.quickSetId) next.lastUndo = null;
  const seen = new Set();
  next.microTasks = (Array.isArray(next.microTasks) ? next.microTasks : [])
    .filter((task) => {
      const definition = microTaskPool.find((candidate) => candidate.id === task?.id);
      return definition && taskIsAvailable(definition, next) && !seen.has(task.id) && seen.add(task.id);
    })
    .slice(0, QUICK_TASK_COUNT)
    .map((task) => {
      const currentDefinition = microTaskPool.find((candidate) => candidate.id === task.id);
      return { ...task, ...currentDefinition, completed: Boolean(task.completed), completedAt: task.completedAt || null };
    });
  while (next.microTasks.length < QUICK_TASK_COUNT) {
    next.microTasks.push(drawMicroTask(next, next.microTasks.length));
  }
  return next;
}

export function completeMicroTask(state, slotIndex) {
  const next = structuredClone(ensureMicroTasks(state));
  const task = next.microTasks[slotIndex];
  if (!task || task.completed) return next;
  const completedAt = new Date().toISOString();
  const historyEntry = {
    ...task,
    completed: true,
    completedAt,
    quickSetId: next.quickSetId
  };
  next.microTaskHistory.unshift(historyEntry);
  next.microTaskHistory = next.microTaskHistory.slice(0, 250);
  awardXp(next, task.skills, task.xp);
  next.microTasks[slotIndex] = { ...task, completed: true, completedAt };
  next.lastUndo = {
    type: "micro",
    slotIndex,
    task,
    historyEntry,
    quickSetId: next.quickSetId,
    xp: task.xp,
    skills: task.skills,
    label: task.title
  };
  if (next.microTasks.every((item) => item.completed) && next.quickSetBonus?.quickSetId !== next.quickSetId) {
    next.quickSetBonus = { quickSetId: next.quickSetId, date: completedAt, xp: QUICK_SET_BONUS_XP };
    awardXp(next, ["strength", "recovery"], QUICK_SET_BONUS_XP);
  }
  awardDailyTaskMilestones(next);
  next.achievements = achievementsFor(next, programForState(next));
  return next;
}

export function refreshMicroTasks(state) {
  const next = structuredClone(ensureMicroTasks(state));
  next.quickSetId += 1;
  next.quickTaskDate = todayIso();
  next.quickSetBonus = null;
  next.microTasks = [];
  while (next.microTasks.length < QUICK_TASK_COUNT) {
    next.microTasks.push(drawMicroTask(next, next.quickSetId * 11 + next.microTasks.length));
  }
  next.lastUndo = null;
  return next;
}

export function replaceMicroTask(state, slotIndex) {
  const next = structuredClone(ensureMicroTasks(state));
  if (!next.microTasks[slotIndex] || next.microTasks[slotIndex].completed) return next;
  next.microTasks.splice(slotIndex, 1);
  next.microTasks.splice(slotIndex, 0, drawMicroTask(next, next.quickSetId * 29 + slotIndex));
  return next;
}

export function undoLastAction(state) {
  const next = structuredClone(ensureMicroTasks(state));
  const undo = next.lastUndo;
  if (!undo) return next;
  if (undo.type === "micro") {
    const current = next.microTasks[undo.slotIndex];
    if (next.quickSetId !== undo.quickSetId || current?.id !== undo.task.id || !current.completed) return next;
    next.microTasks[undo.slotIndex] = { ...undo.task, completed: false, completedAt: null };
    const index = next.microTaskHistory.findIndex((entry) => entry.completedAt === undo.historyEntry.completedAt && entry.id === undo.historyEntry.id);
    if (index >= 0) next.microTaskHistory.splice(index, 1);
    awardXp(next, undo.skills, -undo.xp);
    if (next.quickSetBonus?.quickSetId === next.quickSetId) {
      awardXp(next, ["strength", "recovery"], -next.quickSetBonus.xp);
      next.quickSetBonus = null;
    }
    next.lastUndo = null;
    next.achievements = achievementsFor(next, programForState(next));
  }
  return next;
}

export function completeWorkout(state, day, form) {
  const next = structuredClone(state);
  const workoutKey = String(day.dayNumber);
  if (next.workouts[workoutKey]?.completed) return next;
  let gained = 0;
  day.exercises.concat(day.finisher ? [day.finisher] : []).forEach((exercise, index) => {
    const log = {
      difficulty: Number(form.get(`difficulty-${index}`) || 3),
      pain: Number(form.get(`pain-${index}`) || 0),
      formGood: form.get(`form-${index}`) !== "off"
    };
    const xp = xpForExercise(exercise, log);
    gained += xp;
    skillsForExercise(exercise.name).forEach((skill) => {
      next.xp[skill] = (next.xp[skill] || 0) + Math.round(xp / skillsForExercise(exercise.name).length);
    });
  });
  if (day.type === "recovery") next.xp.recovery += 25;
  if (day.type === "benchmark") next.xp.athleticism += 75;
  const workoutBonus = day.type === "benchmark" ? 220 : day.type === "recovery" ? 90 : 160;
  gained += workoutBonus;
  awardXp(next, ["strength", "recovery"], workoutBonus);
  next.taskCompletions[`day-${day.dayNumber}:full-workout`] = true;
  next.workouts[workoutKey] = {
    completed: true,
    date: new Date().toISOString(),
    energy: Number(form.get("energy") || 3),
    sleep: Number(form.get("sleep") || 3),
    soreness: Number(form.get("soreness") || 2),
    jointPain: Number(form.get("jointPain") || 0),
    bodyweight: form.get("bodyweight") || "",
    notes: form.get("notes") || "",
    gained
  };
  updatePersonalBest(next, `${day.phase} workout XP`, gained);
  awardTaskStreakBonus(next, programForState(next), day.dayNumber);
  next.achievements = achievementsFor(next, programForState(next));
  return next;
}

export function completeMinimumWorkout(state, day) {
  const next = structuredClone(state);
  const workoutKey = String(day.dayNumber);
  if (next.workouts[workoutKey]?.completed) return next;
  const gained = 70;
  awardXp(next, ["mobility", "recovery"], gained);
  next.taskCompletions[`day-${day.dayNumber}:full-workout`] = {
    completed: true,
    date: new Date().toISOString(),
    xp: gained,
    skills: ["mobility", "recovery"],
    createdWorkout: true,
    minimum: true
  };
  next.workouts[workoutKey] = {
    completed: true,
    minimum: true,
    date: new Date().toISOString(),
    energy: 3,
    sleep: 3,
    soreness: 2,
    jointPain: 0,
    bodyweight: "",
    notes: "Minimum viable workout completed.",
    gained
  };
  awardTaskStreakBonus(next, programForState(next), day.dayNumber);
  next.achievements = achievementsFor(next, programForState(next));
  return next;
}

export function dailyTasksFor(day) {
  const tasks = [
    {
      id: "warmup",
      title: "Complete warm-up",
      detail: day.warmup.slice(0, 2).join(" + "),
      xp: 25,
      skills: ["mobility", "recovery"]
    }
  ];
  day.exercises.slice(0, 5).forEach((exercise, index) => {
    tasks.push({
      id: `exercise-${index}`,
      title: exercise.name,
      detail: `${exercise.sets} x ${exercise.reps}`,
      xp: xpForExercise(exercise),
      skills: skillsForExercise(exercise.name),
      exercise
    });
  });
  if (day.finisher) {
    tasks.push({
      id: "finisher",
      title: `Optional finisher: ${day.finisher.name}`,
      detail: `${day.finisher.sets} x ${day.finisher.reps}`,
      xp: Math.max(20, Math.round(xpForExercise(day.finisher) * 0.8)),
      skills: skillsForExercise(day.finisher.name),
      exercise: day.finisher
    });
  } else {
    tasks.push({
      id: "easy-extra",
      title: "Easy extra movement",
      detail: "5-10 minutes walking, mobility, or breathing",
      xp: 25,
      skills: ["recovery", "mobility"]
    });
  }
  tasks.push({
    id: "cooldown",
    title: "Cooldown and breathing",
    detail: day.cooldown.slice(0, 2).join(" + "),
    xp: 25,
    skills: ["mobility", "recovery"]
  });
  tasks.push({
    id: "full-workout",
    title: "Complete the full workout",
    detail: `${day.title} · ${day.duration} minutes`,
    xp: day.type === "benchmark" ? 220 : day.type === "recovery" ? 90 : 160,
    skills: day.type === "recovery" ? ["recovery", "mobility"] : ["strength", "athleticism"],
    featured: true
  });
  return tasks.slice(0, 9);
}

export function timerSecondsForTask(task) {
  const text = `${task?.title || ""} ${task?.detail || ""}`;
  const seconds = text.match(/(\d+)(?:\s*-\s*\d+)?\s*-?\s*(?:seconds?|secs?|s)\b/i);
  if (seconds) return Number(seconds[1]);
  const minutes = text.match(/(\d+)(?:\s*-\s*\d+)?\s*-?\s*(?:minutes?|mins?|min)\b/i);
  return minutes ? Number(minutes[1]) * 60 : null;
}

export function completeTask(state, day, taskId) {
  const next = structuredClone(state);
  const key = taskKey(day.dayNumber, taskId);
  const tasks = dailyTasksFor(day);
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return next;
  if (next.taskCompletions[key]) {
    const completion = next.taskCompletions[key];
    delete next.taskCompletions[key];
    awardXp(next, completion.skills || task.skills, -(completion.xp || task.xp));
    if (completion.createdWorkout) delete next.workouts[String(day.dayNumber)];
    removeTaskStreakBonusForDay(next, day.dayNumber);
    next.achievements = achievementsFor(next, programForState(next));
    return next;
  }
  next.taskCompletions[key] = {
    completed: true,
    date: new Date().toISOString(),
    xp: task.xp,
    skills: task.skills,
    createdWorkout: false
  };
  awardXp(next, task.skills, task.xp);
  if (taskId === "full-workout" && !next.workouts[String(day.dayNumber)]?.completed) {
    next.taskCompletions[key].createdWorkout = true;
    next.workouts[String(day.dayNumber)] = {
      completed: true,
      date: new Date().toISOString(),
      energy: 3,
      sleep: 3,
      soreness: 2,
      jointPain: 0,
      bodyweight: "",
      notes: "Completed from task list.",
      gained: task.xp
    };
  }
  awardTaskStreakBonus(next, programForState(next), day.dayNumber);
  awardDailyTaskMilestones(next);
  next.achievements = achievementsFor(next, programForState(next));
  return next;
}

export function taskProgress(state, day) {
  const tasks = dailyTasksFor(day);
  const completed = tasks.filter((task) => state.taskCompletions[taskKey(day.dayNumber, task.id)]).length;
  return {
    total: tasks.length,
    completed,
    percent: Math.round((completed / tasks.length) * 100)
  };
}

export function toggleSet(state, dayNumber, exerciseIndex, setIndex) {
  const next = structuredClone(state);
  const key = `${dayNumber}:${exerciseIndex}:${setIndex}`;
  next.completedSets[key] = !next.completedSets[key];
  return next;
}

export function stats(state, program) {
  const completed = Object.values(state.workouts).filter((w) => w.completed);
  const completedTasks = Object.values(state.taskCompletions || {}).filter(Boolean);
  const microTasksDone = (state.microTaskHistory || []).length;
  const totalXp = Object.values(state.xp).reduce((sum, value) => sum + value, 0);
  return {
    completedCount: completed.length,
    completedTaskCount: completedTasks.length,
    microTasksDone,
    dailyTasksDone: dailyTaskCount(state),
    completionRate: Math.round((completed.length / program.length) * 100),
    totalXp,
    totalLevel: Object.values(state.xp).reduce((sum, value) => sum + levelFromXp(value), 0),
    streak: streak(state, program),
    taskStreak: taskStreak(state, program),
    minutes: completed.length * 25
  };
}

export function nextIncompleteWorkoutDay(state, program, afterDayNumber = 0) {
  const after = Number(afterDayNumber) || 0;
  const orderedDays = after
    ? [...program.filter((day) => day.dayNumber > after), ...program.filter((day) => day.dayNumber <= after)]
    : program;
  return orderedDays.find((day) => !state.workouts?.[String(day.dayNumber)]?.completed)?.dayNumber || program.at(-1)?.dayNumber || 1;
}

export function readinessAdvice(workout, readiness) {
  const score = Number(readiness.energy) + Number(readiness.sleep) - Number(readiness.soreness);
  if (Number(readiness.jointPain) >= 5) return "Significant discomfort: choose pain-free alternatives and stop painful movements.";
  if (score >= 6) return "High readiness: use the normal workout.";
  if (score >= 3) return "Medium readiness: remove the finisher or one accessory set.";
  return workout.type === "training"
    ? "Low readiness: reduce volume by 30-50% and replace explosive work with mobility."
    : "Low readiness: keep the recovery session very easy.";
}

export function substituteExercise(exercise, equipment) {
  const missing = exercise.equipment.filter((item) => !equipment.includes(item));
  if (!missing.length) return exercise;
  return { ...exercise, substituted: true, originalName: exercise.name, name: exercise.alternatives[0] || exercise.regression, missing };
}

export function exportJson(state) {
  return JSON.stringify({ exportedAt: new Date().toISOString(), state }, null, 2);
}

export function exportCsv(state) {
  const rows = [["day", "completed_at", "energy", "sleep", "soreness", "joint_pain", "bodyweight", "xp", "notes"]];
  Object.entries(state.workouts).forEach(([day, workout]) => {
    rows.push([day, workout.date, workout.energy, workout.sleep, workout.soreness, workout.jointPain, workout.bodyweight, workout.gained, JSON.stringify(workout.notes || "")]);
  });
  return rows.map((row) => row.join(",")).join("\n");
}

export function taskKey(dayNumber, taskId) {
  return `day-${dayNumber}:${taskId}`;
}

export function taskStreak(state, program) {
  // A streak tracks consecutive workout completions, not program-day numbers.
  // Multiple workouts on one day all count; it breaks only after a calendar day
  // with no completed workout.
  const dates = Object.values(state.workouts || {})
    .filter((workout) => workout?.completed && workout.date)
    .map((workout) => workout.date.slice(0, 10))
    .sort();
  if (!dates.length) return 0;
  if (calendarDayDifference(dates.at(-1), todayIso()) > 1) return 0;
  let count = 1;
  for (let index = dates.length - 1; index > 0; index -= 1) {
    if (calendarDayDifference(dates[index - 1], dates[index]) > 1) break;
    count += 1;
  }
  return count;
}

function calendarDayDifference(first, second) {
  const [firstYear, firstMonth, firstDay] = first.split("-").map(Number);
  const [secondYear, secondMonth, secondDay] = second.split("-").map(Number);
  return Math.round((Date.UTC(secondYear, secondMonth - 1, secondDay) - Date.UTC(firstYear, firstMonth - 1, firstDay)) / 86400000);
}

function awardXp(state, skills, xp) {
  const share = Math.round(xp / skills.length);
  skills.forEach((skill) => {
    state.xp[skill] = Math.max(0, (state.xp[skill] || 0) + share);
  });
}

function updatePersonalBest(state, label, value) {
  state.records = Array.isArray(state.records) ? state.records : [];
  const existing = state.records.find((record) => record.label === label);
  if (!existing || value > existing.value) {
    if (existing) Object.assign(existing, { value, date: new Date().toISOString() });
    else state.records.push({ label, value, date: new Date().toISOString() });
  }
}

function tierTask(tier, title, detail, xp, skills, equipment = [], movements = []) {
  return { id: slug(title), tier, title, detail, xp, skills, equipment, movements, maxDurationSeconds: estimatedDurationSeconds(title, detail) };
}

function estimatedDurationSeconds(title, detail) {
  const text = `${title} ${detail}`;
  const seconds = text.match(/(\d+)\s*(?:seconds?|secs?|s)\b/i);
  if (seconds) return Number(seconds[1]);
  const minutes = text.match(/(\d+)\s*(?:minutes?|mins?|min)\b/i);
  return minutes ? Number(minutes[1]) * 60 : 90;
}

function drawMicroTask(state, salt) {
  const available = microTaskPool
    .filter((task) => task.tier <= unlockedTier(state) && taskIsAvailable(task, state))
    .sort((a, b) => quickTaskPriority(b, state) - quickTaskPriority(a, state));
  const fallback = microTaskPool.filter((task) => task.tier <= unlockedTier(state) && task.equipment.length === 0);
  const candidates = available.length ? available : fallback;
  const recentIds = new Set((state.microTaskHistory || []).slice(0, 6).map((task) => task.id));
  const currentIds = new Set((state.microTasks || []).map((task) => task.id));
  const filtered = candidates.filter((task) => !recentIds.has(task.id) && !currentIds.has(task.id));
  const pool = filtered.length ? filtered : candidates.filter((task) => !currentIds.has(task.id));
  const seed = Object.values(state.xp || {}).reduce((sum, value) => sum + value, 0) + salt * 17 + (state.microTaskHistory || []).length * 31;
  return { ...pool[Math.abs(seed) % pool.length], completed: false, completedAt: null };
}

function taskIsAvailable(task, state) {
  const profile = state.profile || {};
  if (task.maxDurationSeconds > Number(profile.quickDuration || 120)) return false;
  if (!task.equipment.every((item) => item === "pull-up bar" && profile.equipment?.includes(item))) return false;
  const text = `${task.title} ${task.detail} ${task.movements.join(" ")}`.toLowerCase();
  if (profile.quietQuickTasks && /(jump|hop|plyo|mountain climber)/.test(text)) return false;
  const limitations = String(profile.limitations || "").toLowerCase();
  if (/(knee|ankle)/.test(limitations) && /(jump|hop|squat|lunge|split squat)/.test(text)) return false;
  if (/(wrist|shoulder)/.test(limitations) && /(push-up|plank|bear crawl|mountain climber)/.test(text)) return false;
  if (/(no floor|standing)/.test(limitations) && /(plank|sit-up|dead bug|glute bridge|bear crawl)/.test(text)) return false;
  return true;
}

function quickTaskPriority(task, state) {
  const goalSkills = {
    Strength: ["strength", "push", "pull", "legs"],
    Skills: ["athleticism", "push", "pull", "core"],
    Mobility: ["mobility", "recovery"],
    Balanced: []
  }[state.profile?.goal || "Balanced"] || [];
  return task.skills.filter((skill) => goalSkills.includes(skill)).length;
}

export function dailyTaskCount(state, date = todayIso()) {
  const quickCount = (state.microTaskHistory || []).filter((task) => task.completedAt?.slice(0, 10) === date).length;
  const plannedCount = Object.values(state.taskCompletions || {}).filter((completion) => completion?.date?.slice(0, 10) === date).length;
  const directlyLoggedWorkouts = Object.entries(state.workouts || {}).filter(([dayNumber, workout]) => {
    const completion = state.taskCompletions?.[`day-${dayNumber}:full-workout`];
    return workout?.date?.slice(0, 10) === date && !completion?.date;
  }).length;
  return quickCount + plannedCount + directlyLoggedWorkouts;
}

function awardDailyTaskMilestones(state) {
  const date = todayIso();
  const count = dailyTaskCount(state, date);
  state.dailyTaskRewards ||= {};
  state.dailyTaskRewards[date] ||= {};
  Object.entries(DAILY_TASK_MILESTONES).forEach(([milestone, xp]) => {
    if (count < Number(milestone) || state.dailyTaskRewards[date][milestone]) return;
    state.dailyTaskRewards[date][milestone] = { date: new Date().toISOString(), xp };
    awardXp(state, ["athleticism", "recovery"], xp);
  });
}

function unlockedTier(state) {
  const totalLevel = Object.values(state.xp || {}).reduce((sum, value) => sum + levelFromXp(value), 0);
  if (totalLevel >= 80) return 4;
  if (totalLevel >= 45) return 3;
  if (totalLevel >= 20) return 2;
  return 1;
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function awardTaskStreakBonus(state, program, dayNumber) {
  const day = program[dayNumber - 1];
  if (!day || !state.workouts?.[String(dayNumber)]?.completed) return;
  const streakNow = taskStreak(state, program);
  const bonuses = { 3: 75, 7: 200, 14: 450, 30: 1200, 60: 2600, 100: 5000 };
  const bonus = bonuses[streakNow];
  if (!bonus || state.streakBonuses[`tasks-${streakNow}`]) return;
  state.streakBonuses[`tasks-${streakNow}`] = {
    date: new Date().toISOString(),
    dayNumber,
    xp: bonus
  };
  awardXp(state, ["recovery", "strength"], bonus);
}

function removeTaskStreakBonusForDay(state, dayNumber) {
  Object.entries(state.streakBonuses || {}).forEach(([key, bonus]) => {
    if (bonus.dayNumber === dayNumber) {
      awardXp(state, ["recovery", "strength"], -bonus.xp);
      delete state.streakBonuses[key];
    }
  });
}

function streak(state, program) {
  let count = 0;
  for (const day of program) {
    if (state.workouts[String(day.dayNumber)]?.completed) count += 1;
    else if (new Date(day.date) < new Date(todayIso())) count = 0;
  }
  return count;
}

function achievementsFor(state, program) {
  const current = new Set(state.achievements);
  const s = stats(state, program);
  if (s.completedCount >= 1) current.add("First workout logged");
  if (s.completedTaskCount >= 10) current.add("First task board cleared");
  if (s.microTasksDone >= 10) current.add("10 quick tasks complete");
  if (s.microTasksDone >= 50) current.add("50 quick tasks complete");
  Object.values(state.dailyTaskRewards || {}).forEach((rewards) => {
    Object.keys(rewards || {}).forEach((milestone) => current.add(`${milestone}-task day`));
  });
  if (state.quickSetBonus) current.add("Quick five finisher");
  if (s.completedCount >= 7) current.add("Seven sessions complete");
  if (s.completedCount >= 28) current.add("Block finisher");
  if (s.streak >= 7) current.add("Seven-day streak");
  if (s.taskStreak >= 3) current.add("Three-day task streak");
  if (s.taskStreak >= 7) current.add("One-week task streak");
  if (s.totalXp >= 2500) current.add("XP contender");
  return [...current];
}
