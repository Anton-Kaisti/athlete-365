import assert from "node:assert/strict";
import { generateProgram, validateProgram, levelFromXp, xpForExercise } from "../src/program.js";
import { DAILY_TASK_MILESTONES, QUICK_SET_BONUS_XP, completeMicroTask, completeTask, dailyTasksFor, ensureMicroTasks, initialState, isSignedIn, refreshMicroTasks, signIn, signOut, stats, taskKey, taskProgress, timerSecondsForTask, undoLastAction } from "../src/state.js";

const program = generateProgram("2026-07-19");
const errors = validateProgram(program);

assert.equal(program.length, 365);
assert.deepEqual(errors, []);
assert.equal(program[0].block, 1);
assert.equal(program[27].weekInBlock, 4);
assert.equal(program[84].phase, "Strength");
assert.equal(program[168].phase, "Athletic performance");
assert.equal(program[252].phase, "Mastery and longevity");
assert.equal(program[364].dayNumber, 365);
assert.ok(levelFromXp(0) === 1);
assert.ok(levelFromXp(2500) > 1);
assert.ok(xpForExercise(program[0].exercises[0], { difficulty: 2, pain: 0, formGood: true }) > 0);
assert.ok(xpForExercise(program[0].exercises[0], { difficulty: 3, pain: 6, formGood: true }) < xpForExercise(program[0].exercises[0], { difficulty: 3, pain: 0, formGood: true }));

const tasks = dailyTasksFor(program[0]);
assert.equal(timerSecondsForTask({ title: "20-Second Plank", detail: "Hold it." }), 20);
assert.equal(timerSecondsForTask({ title: "Mobility", detail: "Move for 5-10 minutes." }), 300);
assert.equal(timerSecondsForTask({ title: "10 Push-Ups", detail: "Complete clean reps." }), null);
assert.equal(timerSecondsForTask(tasks.find((task) => task.id === "full-workout")), program[0].duration * 60);
assert.equal(tasks.length, 10);
assert.ok(tasks.some((task) => task.id === "full-workout"));
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
assert.equal(state.microTasks.length, 5);
assert.equal(new Set(state.microTasks.map((task) => task.id)).size, 5);
assert.ok(state.microTasks.every((task) => task.tier === 1));
assert.ok(state.microTasks.every((task) => task.equipment.length === 0));
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
assert.equal(state.quickSetBonus, null);
assert.ok(state.microTasks.some((task) => !completedSetIds.includes(task.id)));
for (let index = 0; index < 5; index += 1) state = completeMicroTask(state, index);
const today = new Date().toISOString().slice(0, 10);
assert.equal(state.dailyTaskRewards[today][10].xp, DAILY_TASK_MILESTONES[10]);
assert.ok(state.achievements.includes("10-task day"));

state = completeTask(state, program[0], "warmup");
assert.ok(state.taskCompletions[taskKey(1, "warmup")]);
assert.ok(stats(state, program).completedTaskCount >= 1);
state = completeTask(state, program[0], "warmup");
assert.equal(state.taskCompletions[taskKey(1, "warmup")], undefined);
assert.equal(stats(state, program).completedTaskCount, 0);

for (const day of program.slice(0, 3)) {
  for (const task of dailyTasksFor(day)) {
    state = completeTask(state, day, task.id);
  }
}
assert.equal(taskProgress(state, program[2]).completed, 10);
assert.equal(stats(state, program).taskStreak, 3);
assert.ok(state.streakBonuses["tasks-3"]);

console.log("Athlete 365 program tests passed.");
