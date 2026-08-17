import assert from "node:assert/strict";
import { exerciseLibrary, exercisesAlphabetically, generateProgram, validateProgram, levelFromXp, xpForExercise } from "../src/program.js";
import { DAILY_TASK_MILESTONES, QUICK_SET_BONUS_XP, completeMicroTask, completeRepeatableTask, completeTask, completeWorkout, completeMinimumWorkout, dailyTasksFor, ensureMicroTasks, initialState, isSignedIn, microTaskPool, nextIncompleteWorkoutDay, personalBestSeconds, refreshMicroTasks, repeatableTasksFor, repeatableXp, signIn, signOut, stats, taskKey, taskProgress, timerSecondsForTask, unlockedQuickTier, undoLastAction } from "../src/state.js";

const program = generateProgram(new Date().toISOString().slice(0, 10));
const today = new Date().toISOString().slice(0, 10);
const errors = validateProgram(program);

assert.equal(program.length, 365);
assert.deepEqual(errors, []);
assert.equal(program[0].block, 1);
assert.equal(program[27].weekInBlock, 4);
assert.equal(program[84].phase, "Strength");
assert.equal(program[168].phase, "Athletic performance");
assert.equal(program[252].phase, "Mastery and longevity");
assert.equal(program[364].dayNumber, 365);
const firstRopeSession = program.find((day) => day.exercises.some((exercise) => exercise.name === "Jump Rope"));
const jumpRope = firstRopeSession.exercises.find((exercise) => exercise.name === "Jump Rope");
assert.match(jumpRope.reps, /^\d+ sec$/);
assert.equal(jumpRope.sets, 3);
assert.equal(jumpRope.restSeconds, 60);
assert.ok(levelFromXp(0) === 1);
assert.ok(levelFromXp(2500) > 1);
assert.ok(xpForExercise(program[0].exercises[0], { difficulty: 2, pain: 0, formGood: true }) > 0);
assert.ok(xpForExercise(program[0].exercises[0], { difficulty: 3, pain: 6, formGood: true }) < xpForExercise(program[0].exercises[0], { difficulty: 3, pain: 0, formGood: true }));
const alphabeticalExercises = exercisesAlphabetically().map((exercise) => exercise.name);
assert.deepEqual(alphabeticalExercises, [...alphabeticalExercises].sort((a, b) => a.localeCompare(b)));
assert.ok(microTaskPool.every((task) => task.movements.length > 0));
assert.ok(microTaskPool.every((task) => task.maxDurationSeconds <= 120));
assert.ok(microTaskPool.every((task) => task.equipment.every((item) => ["pull-up bar", "rings", "resistance bands"].includes(item))));
assert.ok(microTaskPool.every((task) => task.movements.every((name) => exerciseLibrary[name])));
assert.ok(microTaskPool.every((task) => task.movements.every((name) => exerciseLibrary[name].setup && exerciseLibrary[name].steps.length >= 2)));

const tasks = dailyTasksFor(program[0]);
assert.equal(timerSecondsForTask({ title: "20-Second Plank", detail: "Hold it." }), 20);
assert.equal(timerSecondsForTask({ title: "Mobility", detail: "Move for 5-10 minutes." }), 300);
assert.equal(timerSecondsForTask({ title: "10 Push-Ups", detail: "Complete clean reps." }), null);
assert.equal(timerSecondsForTask(tasks.find((task) => task.id === "full-workout")), program[0].duration * 60);
assert.equal(tasks.length, 10);
assert.ok(tasks.some((task) => task.id === "full-workout"));
assert.ok(tasks.find((task) => task.id === "daily-wall-sit").stopwatch);
assert.ok(tasks.find((task) => task.id === "full-workout").xp > tasks.find((task) => task.id === "warmup").xp);

let state = initialState();
assert.equal(isSignedIn(state), false);
state = signIn(state, "Anton");
assert.equal(isSignedIn(state), true);
assert.equal(state.profile.name, "Anton");
state = signOut(state);
assert.equal(isSignedIn(state), false);
state = signIn(state, "Anton");
state = ensureMicroTasks(state);
assert.equal(unlockedQuickTier(state), 1);
assert.ok(repeatableTasksFor(state).some((task) => task.tier > unlockedQuickTier(state)));
assert.equal(state.microTasks.length, 5);
assert.equal(new Set(state.microTasks.map((task) => task.id)).size, 5);
assert.ok(state.microTasks.every((task) => task.tier === 1));
assert.ok(state.microTasks.every((task) => task.equipment.every((item) => state.profile.equipment.includes(item))));
assert.ok(microTaskPool.some((task) => task.tier === 1 && task.skills.includes("pull")));
const firstQuickTask = state.microTasks[0].id;
state = completeMicroTask(state, 0);
assert.equal(state.microTaskHistory.length, 1);
assert.equal(state.microTasks[0].id, firstQuickTask);
assert.equal(state.microTasks[0].completed, true);
assert.ok(stats(state, program).microTasksDone >= 1);
state = undoLastAction(state);
assert.equal(state.microTaskHistory.length, 0);
assert.equal(state.microTasks[0].id, firstQuickTask);
assert.equal(state.microTasks[0].completed, false);

for (let index = 0; index < 5; index += 1) state = completeMicroTask(state, index);
assert.ok(state.microTasks.every((task) => task.completed));
assert.equal(state.quickSetBonus.xp, QUICK_SET_BONUS_XP);
const completedSetIds = state.microTasks.map((task) => task.id);
state = refreshMicroTasks(state);
assert.equal(state.microTasks.length, 5);
assert.equal(new Set(state.microTasks.map((task) => task.id)).size, 5);
assert.ok(state.microTasks.every((task) => !task.completed));
assert.ok(state.microTasks.every((task) => task.equipment.every((item) => state.profile.equipment.includes(item))));
assert.equal(state.quickSetBonus, null);
assert.ok(state.microTasks.some((task) => !completedSetIds.includes(task.id)));
state.xp.strength = 100000;
state.microTasks = [microTaskPool.find((task) => task.equipment.includes("pull-up bar"))];
state = ensureMicroTasks(state);
assert.ok(state.microTasks.every((task) => task.equipment.every((item) => state.profile.equipment.includes(item))));
state.profile.quickDuration = 30;
state = refreshMicroTasks(state);
assert.ok(state.microTasks.every((task) => task.maxDurationSeconds <= 30));
state.quickTaskDate = "2000-01-01";
state.microTasks[0].completed = true;
state = ensureMicroTasks(state);
assert.equal(state.quickTaskDate, today);
assert.ok(state.microTasks.every((task) => !task.completed));
for (let index = 0; index < 5; index += 1) state = completeMicroTask(state, index);
assert.equal(state.dailyTaskRewards[today][10].xp, DAILY_TASK_MILESTONES[10]);
assert.ok(state.achievements.includes("10-task day"));

state = completeTask(state, program[0], "warmup");
assert.ok(state.taskCompletions[taskKey(1, "warmup")]);
assert.ok(stats(state, program).completedTaskCount >= 1);
state = completeTask(state, program[0], "warmup");
assert.equal(state.taskCompletions[taskKey(1, "warmup")], undefined);
assert.equal(stats(state, program).completedTaskCount, 0);

const wallSit = tasks.find((task) => task.id === "daily-wall-sit");
assert.equal(repeatableXp(microTaskPool.find((task) => task.title === "60-Second Wall Sit"), 120), 23);
state.profile.quickDuration = 120;
state.microTasks[0] = { ...microTaskPool.find((task) => task.stopwatch), completed: false, completedAt: null };
state = completeMicroTask(state, 0, 180);
assert.equal(personalBestSeconds(state, "Wall Sit"), 180);
state = completeTask(state, program[0], "daily-wall-sit", 120);
assert.equal(state.taskCompletions[taskKey(1, "daily-wall-sit")].xp, wallSit.xp * 2);
assert.equal(personalBestSeconds(state, "Wall Sit"), 180);
state.profile.quickDuration = 120;
state = completeRepeatableTask(state, "60-second-wall-sit", 180);
assert.equal(personalBestSeconds(state, "Wall Sit"), 180);

for (const day of program.slice(0, 3)) {
  for (const task of dailyTasksFor(day)) {
    state = completeTask(state, day, task.id);
  }
}
assert.equal(taskProgress(state, program[2]).completed, 9);
assert.equal(stats(state, program).taskStreak, 3);
assert.ok(state.streakBonuses["tasks-3"]);

let directWorkoutState = initialState();
const workoutForm = { get: () => null };
directWorkoutState = completeWorkout(directWorkoutState, program[0], workoutForm);
directWorkoutState = completeWorkout(directWorkoutState, program[1], workoutForm);
assert.equal(stats(directWorkoutState, program).taskStreak, 2);
let quickStreakState = signIn(initialState(), "Anton");
for (let set = 0; set < 3; set += 1) {
  for (let index = 0; index < 5; index += 1) quickStreakState = completeMicroTask(quickStreakState, index);
  if (set < 2) quickStreakState = refreshMicroTasks(quickStreakState);
}
assert.equal(stats(quickStreakState, program).taskStreak, 1);
const todayDate = new Date().toISOString().slice(0, 10);
let sameDayStreakState = initialState();
sameDayStreakState.workouts = {
  1: { completed: true, date: `${todayDate}T08:00:00.000Z` },
  2: { completed: true, date: `${todayDate}T10:00:00.000Z` },
  3: { completed: true, date: `${todayDate}T12:00:00.000Z` }
};
assert.equal(stats(sameDayStreakState, program).taskStreak, 3);
let brokenStreakState = initialState();
const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
brokenStreakState.workouts = { 1: { completed: true, date: `${twoDaysAgo}T12:00:00.000Z` } };
assert.equal(stats(brokenStreakState, program).taskStreak, 0);
let minimumState = completeMinimumWorkout(initialState(), program[0]);
assert.equal(minimumState.workouts["1"].minimum, true);
assert.equal(minimumState.workouts["1"].gained, 70);

let queueState = initialState();
queueState.workouts = { 3: { completed: true }, 5: { completed: true }, 7: { completed: true } };
assert.equal(nextIncompleteWorkoutDay(queueState, program), 1);
queueState.workouts[1] = { completed: true };
assert.equal(nextIncompleteWorkoutDay(queueState, program), 2);
queueState.workouts[2] = { completed: true };
assert.equal(nextIncompleteWorkoutDay(queueState, program), 4);
queueState.workouts[8] = { completed: true };
assert.equal(nextIncompleteWorkoutDay(queueState, program, 8), 9);

console.log("Athlete 365 program tests passed.");
