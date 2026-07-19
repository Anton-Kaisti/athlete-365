import { SKILLS, generateProgram, skillsForExercise, xpForExercise, levelFromXp, todayIso } from "./program.js";

const KEY = "athlete365-state-v1";

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
      limitations: ""
    },
    xp: Object.fromEntries(SKILLS.map((skill) => [skill, 0])),
    microTasks: [],
    microTaskHistory: [],
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
  tierTask(1, "10 Push-Ups", "Complete 10 clean push-ups. Use an incline if needed.", 18, ["push", "strength"]),
  tierTask(1, "10 Sit-Ups", "Complete 10 controlled sit-ups or crunches.", 14, ["core"]),
  tierTask(1, "15 Squats", "Complete 15 bodyweight squats with full-foot pressure.", 16, ["legs"]),
  tierTask(1, "20-Second Plank", "Hold a strong plank for 20 seconds.", 14, ["core"]),
  tierTask(1, "10 Reverse Lunges", "Complete 5 reverse lunges per side.", 16, ["legs"]),
  tierTask(1, "20 Calf Raises", "Complete 20 controlled calf raises.", 14, ["legs"]),
  tierTask(1, "30-Second Mobility Reset", "Open hips, ankles, and shoulders for 30 seconds.", 10, ["mobility", "recovery"]),
  tierTask(1, "10 Glute Bridges", "Complete 10 glute bridges with a pause at the top.", 12, ["legs", "core"]),
  tierTask(1, "20 Mountain Climbers", "Complete 10 reps per side at a steady pace.", 15, ["core", "athleticism"]),
  tierTask(1, "10 Scapular Push-Ups", "Move only your shoulder blades.", 12, ["push", "mobility"]),
  tierTask(2, "3 Rounds: 8 Push-Ups + 12 Squats", "Move steadily and stop before form breaks.", 45, ["push", "legs", "strength"]),
  tierTask(2, "2 Rounds: 20s Plank + 10 Sit-Ups", "Brace hard and keep reps controlled.", 36, ["core"]),
  tierTask(2, "20 Split Squats", "Complete 10 reps per side.", 34, ["legs", "strength"]),
  tierTask(2, "60-Second Mobility Flow", "Move through hips, t-spine, ankles, and shoulders.", 25, ["mobility", "recovery"]),
  tierTask(2, "30 Low Pogo Jumps", "Bounce lightly and quietly through the ankles.", 35, ["athleticism", "legs"]),
  tierTask(2, "3 Rounds: 10 Calf Raises + 10 Tibialis Raises", "Build lower-leg capacity.", 38, ["legs", "recovery"]),
  tierTask(2, "Chair Step-Ups", "Complete 10 controlled step-ups per side.", 42, ["legs", "strength"], ["chair"]),
  tierTask(3, "5-Minute Bodyweight Circuit", "Cycle push-ups, squats, sit-ups, and plank until time ends.", 80, ["strength", "core", "legs", "push"]),
  tierTask(3, "4 Rounds: 6 Push-Ups + 8 Lunges", "Keep every rep clean.", 70, ["push", "legs", "strength"]),
  tierTask(3, "90-Second Core Block", "Alternate hollow hold, side plank, and dead bug.", 62, ["core"]),
  tierTask(3, "Skater Hop Practice", "Complete 3 x 6 controlled side-to-side hops.", 65, ["athleticism", "legs"]),
  tierTask(3, "Pull-Up Bar Hang", "Accumulate 60 seconds of hanging.", 58, ["pull", "recovery"], ["pull-up bar"]),
  tierTask(4, "10-Minute Density Block", "Rotate push-ups, squats, and core with perfect form.", 140, ["strength", "push", "legs", "core"]),
  tierTask(4, "Advanced Leg Control", "3 rounds of split squats, calf raises, and skater holds.", 120, ["legs", "athleticism"]),
  tierTask(4, "Ring Row Mini-Workout", "4 x 8 ring rows with 60 seconds rest.", 110, ["pull", "strength"], ["rings"]),
  tierTask(4, "Explosive Push-Up Practice", "5 x 3 fast push-ups with soft landings.", 105, ["push", "athleticism"])
];

export function ensureMicroTasks(state) {
  const next = { ...state };
  next.microTasks = Array.isArray(next.microTasks) ? [...next.microTasks] : [];
  next.microTaskHistory = Array.isArray(next.microTaskHistory) ? [...next.microTaskHistory] : [];
  while (next.microTasks.length < 8) {
    next.microTasks.push(drawMicroTask(next, next.microTasks.length));
  }
  return next;
}

export function completeMicroTask(state, slotIndex) {
  const next = structuredClone(ensureMicroTasks(state));
  const task = next.microTasks[slotIndex];
  if (!task) return next;
  next.microTaskHistory.unshift({
    ...task,
    completedAt: new Date().toISOString()
  });
  next.microTaskHistory = next.microTaskHistory.slice(0, 250);
  awardXp(next, task.skills, task.xp);
  next.microTasks[slotIndex] = drawMicroTask(next, slotIndex + next.microTaskHistory.length);
  next.achievements = achievementsFor(next, programForState(next));
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
  next.achievements = achievementsFor(next, programForState(next));
  return next;
}

export function dailyTasksFor(day) {
  const tasks = [
    {
      id: "readiness",
      title: "Log readiness",
      detail: "Energy, sleep, soreness, joint discomfort",
      xp: 15,
      skills: ["recovery"]
    },
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
  return tasks.slice(0, 10);
}

export function completeTask(state, day, taskId) {
  const next = structuredClone(state);
  const key = taskKey(day.dayNumber, taskId);
  if (next.taskCompletions[key]) return next;
  const tasks = dailyTasksFor(day);
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return next;
  next.taskCompletions[key] = {
    completed: true,
    date: new Date().toISOString(),
    xp: task.xp
  };
  awardXp(next, task.skills, task.xp);
  if (taskId === "full-workout" && !next.workouts[String(day.dayNumber)]?.completed) {
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
    completionRate: Math.round((completed.length / program.length) * 100),
    totalXp,
    totalLevel: Object.values(state.xp).reduce((sum, value) => sum + levelFromXp(value), 0),
    streak: streak(state, program),
    taskStreak: taskStreak(state, program),
    minutes: completed.length * 25
  };
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
  let count = 0;
  for (const day of program) {
    const progress = taskProgress(state, day);
    if (progress.completed === progress.total) count += 1;
    else if (new Date(day.date) < new Date(todayIso())) count = 0;
  }
  return count;
}

function awardXp(state, skills, xp) {
  const share = Math.round(xp / skills.length);
  skills.forEach((skill) => {
    state.xp[skill] = (state.xp[skill] || 0) + share;
  });
}

function tierTask(tier, title, detail, xp, skills, equipment = []) {
  return { id: slug(title), tier, title, detail, xp, skills, equipment };
}

function drawMicroTask(state, salt) {
  const available = microTaskPool.filter((task) => task.tier <= unlockedTier(state) && task.equipment.every((item) => state.profile.equipment.includes(item)));
  const recentIds = new Set((state.microTaskHistory || []).slice(0, 6).map((task) => task.id));
  const currentIds = new Set((state.microTasks || []).map((task) => task.id));
  const filtered = available.filter((task) => !recentIds.has(task.id) && !currentIds.has(task.id));
  const pool = filtered.length ? filtered : available;
  const seed = Object.values(state.xp || {}).reduce((sum, value) => sum + value, 0) + salt * 17 + (state.microTaskHistory || []).length * 31;
  return { ...pool[Math.abs(seed) % pool.length] };
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
  if (!day) return;
  const progress = taskProgress(state, day);
  if (progress.completed !== progress.total) return;
  const streakNow = taskStreak(state, program);
  const bonuses = { 3: 75, 7: 200, 14: 450, 30: 1200, 60: 2600, 100: 5000 };
  const bonus = bonuses[streakNow];
  if (!bonus || state.streakBonuses[`tasks-${streakNow}`]) return;
  state.streakBonuses[`tasks-${streakNow}`] = {
    date: new Date().toISOString(),
    xp: bonus
  };
  awardXp(state, ["recovery", "strength"], bonus);
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
  if (s.completedCount >= 7) current.add("Seven sessions complete");
  if (s.completedCount >= 28) current.add("Block finisher");
  if (s.streak >= 7) current.add("Seven-day streak");
  if (s.taskStreak >= 3) current.add("Three-day task streak");
  if (s.taskStreak >= 7) current.add("One-week task streak");
  if (s.totalXp >= 2500) current.add("XP contender");
  return [...current];
}
