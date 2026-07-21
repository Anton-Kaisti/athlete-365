import { exerciseLibrary, levelFromXp, xpForLevel, validateProgram } from "./program.js";
import {
  DAILY_TASK_MILESTONES,
  QUICK_SET_BONUS_XP,
  completeMicroTask,
  completeTask,
  completeWorkout,
  dailyTasksFor,
  exportCsv,
  exportJson,
  isSignedIn,
  loadState,
  programForState,
  readinessAdvice,
  refreshMicroTasks,
  resetState,
  saveState,
  signIn,
  signOut,
  stats,
  substituteExercise,
  taskKey,
  taskProgress,
  timerSecondsForTask,
  toggleSet,
  undoLastAction
} from "./state.js";

let state = loadState();
let program = programForState(state);
let route = "tasks";
let selectedDay = currentProgramDay();
const taskTimers = new Map();
let timerTicker = null;
let audioContext = null;

const app = document.querySelector("#app");
const celebrationLayer = document.createElement("div");
celebrationLayer.className = "celebration-layer";
document.body.append(celebrationLayer);
let serviceWorkerRegistration = null;

if ("serviceWorker" in navigator) {
  let refreshingForUpdate = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshingForUpdate) return;
    refreshingForUpdate = true;
    window.location.reload();
  });
  navigator.serviceWorker
    .register("./sw.js?v=20260721-12", { updateViaCache: "none" })
    .then((registration) => {
      serviceWorkerRegistration = registration;
      return registration.update();
    })
    .catch(() => {});
}

render();

function render() {
  document.documentElement.dataset.theme = state.profile.theme;
  program = programForState(state);
  const errors = validateProgram(program);
  app.innerHTML = `
    <header class="shell-header">
      <section>
        <p class="eyebrow">Athlete 365</p>
        <h1>Daily fitness task RPG</h1>
      </section>
      <nav aria-label="Primary navigation">
        ${navButton("tasks", "Tasks")}
        ${navButton("dashboard", "Workout")}
        ${navButton("calendar", "Calendar")}
        ${navButton("program", "Program")}
        ${navButton("progress", "Progress")}
        ${navButton("library", "Library")}
        ${navButton("settings", "Settings")}
      </nav>
    </header>
    <main class="app-shell">
      ${errors.length ? `<aside class="warning">${errors.join(" ")}</aside>` : ""}
      ${view()}
    </main>
  `;
  bindEvents();
}

function view() {
  if (!isSignedIn(state)) return loginView();
  if (route === "tasks") return tasksView();
  if (route === "calendar") return calendarView();
  if (route === "program") return programView();
  if (route === "progress") return progressView();
  if (route === "library") return libraryView();
  if (route === "settings") return settingsView();
  return dashboardView();
}

function loginView() {
  return `
    <section class="login-shell">
      <form class="login-card" id="login-form">
        <p class="eyebrow">Athlete 365</p>
        <h2>Enter your athlete name</h2>
        <p>This app uses a simple local profile. No ChatGPT sign-in is needed for the app itself.</p>
        <label class="field">
          Username
          <input name="username" value="Anton" autocomplete="name" required minlength="2" />
        </label>
        <button class="primary" type="submit">Start training</button>
      </form>
    </section>
  `;
}

function tasksView() {
  const day = withSubstitutions(program[selectedDay - 1]);
  const tasks = dailyTasksFor(day);
  const progress = taskProgress(state, day);
  const s = stats(state, program);
  const quickCompleted = state.microTasks.filter((task) => task.completed).length;
  const todayRewards = state.dailyTaskRewards?.[new Date().toISOString().slice(0, 10)] || {};
  const remainingXp = tasks
    .filter((task) => !state.taskCompletions[taskKey(day.dayNumber, task.id)])
    .reduce((sum, task) => sum + task.xp, 0);
  return `
    <section class="hero-grid">
      <article class="today-panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Quick task queue</p>
            <h2>${state.profile.name}'s quick tasks</h2>
            <p>Complete all five for ${QUICK_SET_BONUS_XP} bonus XP. Finished tasks stay here until you refresh the set.</p>
          </div>
          <strong class="level-badge">${quickCompleted}/5</strong>
        </div>
        <div class="quick-set-toolbar">
          <div>
            <span>Current set</span>
            <div class="bar"><span style="width:${quickCompleted * 20}%"></span></div>
            <small>${state.quickSetBonus?.quickSetId === state.quickSetId ? `${QUICK_SET_BONUS_XP} bonus XP earned` : `${5 - quickCompleted} left for the bonus`}</small>
          </div>
          <button type="button" data-refresh-micro>${quickCompleted === 5 ? "New set" : "Refresh tasks"}</button>
        </div>
        <div class="micro-task-list">
          ${state.microTasks.map((task, index) => microTaskCard(task, index)).join("")}
        </div>
        ${undoPanel()}
        <div class="planned-head">
          <div>
            <p class="eyebrow">Day ${day.dayNumber} planned workout</p>
            <h2>Workout tasks and big XP reward</h2>
            <p>${day.title} - ${day.phase} - ${day.duration} minutes</p>
          </div>
          <strong class="level-badge">${progress.completed}/${progress.total}</strong>
        </div>
        <div class="task-summary">
          <div>
            <span>Planned workout task progress</span>
            <div class="bar"><span style="width:${progress.percent}%"></span></div>
          </div>
          <strong>${remainingXp} XP left today</strong>
        </div>
        <div class="task-list">
          ${tasks.map((task) => taskCard(task, day)).join("")}
        </div>
      </article>
      <aside class="side-panel">
        ${metricCards(s)}
        ${skillsPanel()}
        <article class="card">
          <h3>Today's task prizes</h3>
          <p>${s.dailyTasksDone} tasks completed today. Quick and planned tasks both count.</p>
          <div class="bonus-grid">
            ${Object.entries(DAILY_TASK_MILESTONES).map(([count, xp]) => bonusPill(`${count} tasks`, `${xp} XP`, todayRewards[count])).join("")}
          </div>
        </article>
        <article class="card">
          <h3>Task tiers</h3>
          <p>Tier 1 now includes a broader mix of strength, balance, core, and mobility. Later tiers add circuits, bands, rings, jump rope, and density work as your total level rises.</p>
        </article>
        <article class="card">
          <h3>Streak bonuses</h3>
          <p>Clear all planned workout tasks to extend the task streak. Bonuses are paid once when you hit each milestone.</p>
          <div class="bonus-grid">
            ${bonusPill("3 days", "75 XP", state.streakBonuses["tasks-3"])}
            ${bonusPill("1 week", "200 XP", state.streakBonuses["tasks-7"])}
            ${bonusPill("14 days", "450 XP", state.streakBonuses["tasks-14"])}
            ${bonusPill("30 days", "1200 XP", state.streakBonuses["tasks-30"])}
          </div>
        </article>
        <article class="card">
          <h3>Big reward task</h3>
          <p>The full workout remains the largest planned task. The quick queue is for small wins throughout the day.</p>
          <button data-route="dashboard">Open workout detail</button>
        </article>
        <article class="card app-version-card">
          <div>
            <h3>App version</h3>
            <p>Build 20260721-12</p>
          </div>
          <button type="button" data-update-app>Get latest version</button>
        </article>
      </aside>
    </section>
  `;
}

function microTaskCard(task, index) {
  const timerKey = `micro:${task.id}`;
  return `
    <article class="task-card micro tier-${task.tier} task-card-informative ${task.completed ? "done" : ""}" data-task-info="micro:${index}" tabindex="0" role="button" aria-label="View instructions for ${task.title}">
      <button type="button" class="task-check" data-micro-task="${index}" aria-label="${task.completed ? "Completed" : "Complete"} ${task.title}" ${task.completed ? "disabled" : ""}>${task.completed ? "✓" : "+"}</button>
      <div>
        <p class="eyebrow">Tier ${task.tier} - ${task.skills.join(" + ")}</p>
        <h3>${task.title}</h3>
        <p>${task.detail}</p>
        <small>${task.completed ? "Completed - stays in this set" : `${task.equipment.length ? `Needs ${task.equipment.join(", ")}` : "No equipment"} - Tap for instructions`}</small>
      </div>
      ${taskCardAside(task, timerKey)}
    </article>
  `;
}

function undoPanel() {
  if (!state.lastUndo) return "";
  return `
    <article class="undo-panel">
      <span>Completed ${state.lastUndo.label} for ${state.lastUndo.xp} XP</span>
      <button type="button" data-undo-last>Undo</button>
    </article>
  `;
}

function taskCard(task, day) {
  const done = state.taskCompletions[taskKey(day.dayNumber, task.id)];
  const timerKey = `planned:${day.dayNumber}:${task.id}`;
  return `
    <article class="task-card task-card-informative ${task.featured ? "featured" : ""} ${done ? "done" : ""}" data-task-info="planned:${task.id}" tabindex="0" role="button" aria-label="View instructions for ${task.title}">
      <button type="button" class="task-check ${done ? "undo-check" : ""}" data-task="${task.id}" aria-label="${done ? "Undo" : "Complete"} ${task.title}">
        ${done ? "Undo" : "+"}
      </button>
      <div>
        <p class="eyebrow">${task.featured ? "Big reward task" : task.skills.join(" + ")}</p>
        <h3>${task.title}</h3>
        <p>${task.detail}</p>
        <small>Tap for instructions</small>
      </div>
      ${taskCardAside(task, timerKey)}
    </article>
  `;
}

function taskCardAside(task, timerKey) {
  const duration = timerSecondsForTask(task);
  if (!duration) return `<strong>${task.xp} XP</strong>`;
  const timer = timerSnapshot(timerKey, duration);
  return `
    <div class="task-card-aside">
      <strong>${task.xp} XP</strong>
      <div class="task-timer" aria-label="Timer for ${task.title}">
        <output data-timer-display="${timerKey}">${formatTimer(timer.remaining)}</output>
        <div>
          <button type="button" class="timer-toggle" data-timer-toggle="${timerKey}" data-timer-duration="${duration}">${timer.running ? "Pause" : timer.remaining < duration ? "Resume" : "Start"}</button>
          <button type="button" class="timer-reset" data-timer-reset="${timerKey}" data-timer-duration="${duration}" aria-label="Reset timer">Reset</button>
        </div>
      </div>
    </div>
  `;
}

function timerSnapshot(key, duration) {
  const timer = taskTimers.get(key) || { duration, remaining: duration, running: false, endAt: null, notified: false };
  timer.duration = duration;
  if (timer.running) timer.remaining = Math.max(0, Math.ceil((timer.endAt - Date.now()) / 1000));
  if (timer.remaining === 0) timer.running = false;
  taskTimers.set(key, timer);
  return timer;
}

function formatTimer(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function updateTimerDisplays() {
  taskTimers.forEach((timer, key) => {
    if (timer.running) {
      timer.remaining = Math.max(0, Math.ceil((timer.endAt - Date.now()) / 1000));
      if (timer.remaining === 0) {
        timer.running = false;
        if (!timer.notified) {
          timer.notified = true;
          playTimerFinishedSound();
          navigator.vibrate?.([150, 80, 150]);
        }
      }
    }
    const output = app.querySelector(`[data-timer-display="${CSS.escape(key)}"]`);
    if (output) {
      output.textContent = timer.remaining === 0 ? "Done" : formatTimer(timer.remaining);
      output.classList.toggle("complete", timer.remaining === 0);
      const button = output.parentElement.querySelector("[data-timer-toggle]");
      if (button) button.textContent = timer.running ? "Pause" : timer.remaining === 0 ? "Restart" : timer.remaining < timer.duration ? "Resume" : "Start";
    }
  });
  if (![...taskTimers.values()].some((timer) => timer.running) && timerTicker) {
    clearInterval(timerTicker);
    timerTicker = null;
  }
}

function ensureTimerTicker() {
  if (!timerTicker) timerTicker = setInterval(updateTimerDisplays, 250);
}

function unlockAudio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  audioContext ||= new AudioContext();
  if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
  return audioContext;
}

function playTimerFinishedSound() {
  const context = unlockAudio();
  if (!context) return;
  const start = context.currentTime;
  [659.25, 783.99, 987.77].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const noteStart = start + index * 0.16;
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(0.2, noteStart + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.28);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(noteStart);
    oscillator.stop(noteStart + 0.3);
  });
}

function dashboardView() {
  const day = program[selectedDay - 1];
  const workout = withSubstitutions(day);
  const s = stats(state, program);
  return `
    <section class="hero-grid">
      <article class="today-panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Day ${day.dayNumber} / Block ${day.block} / Week ${day.weekInBlock}</p>
            <h2>${day.title}</h2>
            <p>${day.phase} - ${day.focus}</p>
          </div>
          <strong class="level-badge">${state.workouts[String(day.dayNumber)]?.completed ? "Complete" : `${day.duration} min`}</strong>
        </div>
        ${readinessCard()}
        <form id="workout-form">
          ${sectionList("Warm-up", day.warmup)}
          <div class="exercise-stack">
            ${workout.exercises.map((exercise, index) => exerciseCard(exercise, day, index)).join("")}
            ${workout.finisher ? exerciseCard(workout.finisher, day, workout.exercises.length, true) : ""}
          </div>
          ${sectionList("Cooldown", day.cooldown)}
          <label class="field wide">
            Workout notes
            <textarea name="notes" rows="3" placeholder="Energy, form, substitutions, personal records...">${state.workouts[String(day.dayNumber)]?.notes || ""}</textarea>
          </label>
          <div class="actions">
            <button class="primary" type="submit">${state.workouts[String(day.dayNumber)]?.completed ? "Workout logged" : "Finish workout and earn XP"}</button>
            <button type="button" data-route="tasks">Back to tasks</button>
            <button type="button" data-route="calendar">Pick another day</button>
          </div>
        </form>
      </article>
      <aside class="side-panel">
        ${metricCards(s)}
        ${skillsPanel()}
        <article class="card">
          <h3>Coaching notes</h3>
          <p>${day.notes}</p>
          <p>${day.recovery}</p>
        </article>
        <article class="card">
          <h3>Achievements</h3>
          <div class="chips">${(state.achievements.length ? state.achievements : ["Start today to unlock achievements"]).map((a) => `<span>${a}</span>`).join("")}</div>
        </article>
      </aside>
    </section>
  `;
}

function readinessCard() {
  const saved = state.workouts[String(selectedDay)] || {};
  const readiness = {
    energy: saved.energy || 3,
    sleep: saved.sleep || 3,
    soreness: saved.soreness || 2,
    jointPain: saved.jointPain || 0
  };
  return `
    <article class="readiness">
      <div>
        <h3>Readiness</h3>
        <p id="readiness-advice">${readinessAdvice(program[selectedDay - 1], readiness)}</p>
      </div>
      ${rangeField("energy", "Energy", readiness.energy, 1, 5)}
      ${rangeField("sleep", "Sleep", readiness.sleep, 1, 5)}
      ${rangeField("soreness", "Soreness", readiness.soreness, 1, 5)}
      ${rangeField("jointPain", "Joint pain", readiness.jointPain, 0, 10)}
      <label class="field mini">Bodyweight<input name="bodyweight" value="${saved.bodyweight || ""}" placeholder="optional" /></label>
    </article>
  `;
}

function exerciseCard(exercise, day, index, finisher = false) {
  return `
    <article class="exercise-card ${exercise.substituted ? "subbed" : ""}">
      <div class="exercise-head">
        <div>
          <p class="eyebrow">${finisher ? "Optional finisher" : exercise.category}</p>
          <h3>${exercise.name}</h3>
          ${exercise.substituted ? `<p class="sub-note">Substituted for ${exercise.originalName}; missing ${exercise.missing.join(", ")}.</p>` : ""}
        </div>
        <strong>${exercise.sets} x ${exercise.reps}</strong>
      </div>
      <dl>
        <div><dt>Rest</dt><dd>${exercise.restSeconds}s</dd></div>
        <div><dt>Tempo</dt><dd>${exercise.tempo}</dd></div>
        <div><dt>RIR</dt><dd>${exercise.targetRIR ?? "easy"}</dd></div>
      </dl>
      <p>${exercise.cue}</p>
      <div class="set-row">
        ${Array.from({ length: exercise.sets }, (_, setIndex) => {
          const key = `${day.dayNumber}:${index}:${setIndex}`;
          return `<button type="button" class="set ${state.completedSets[key] ? "done" : ""}" data-set="${key}" aria-label="Toggle set ${setIndex + 1}">${setIndex + 1}</button>`;
        }).join("")}
      </div>
      <div class="adjust-grid">
        ${rangeField(`difficulty-${index}`, "Difficulty", 3, 1, 5)}
        ${rangeField(`pain-${index}`, "Pain", 0, 0, 10)}
        <label class="field mini">Form<select name="form-${index}"><option value="good">Good</option><option value="off">Broke down</option></select></label>
      </div>
      <details>
        <summary>Regression, progression, alternatives</summary>
        <p><b>Easier:</b> ${exercise.regression}</p>
        <p><b>Harder:</b> ${exercise.progression}</p>
        <p><b>Alternatives:</b> ${exercise.alternatives.join(", ")}</p>
      </details>
    </article>
  `;
}

function calendarView() {
  return `
    <section class="page-grid">
      <article class="card span">
        <div class="panel-head">
          <div>
            <p class="eyebrow">365-day calendar</p>
            <h2>Pick any training day</h2>
          </div>
          <input id="calendar-filter" placeholder="Filter by phase, workout, block..." />
        </div>
        <div class="calendar-list">
          ${program.map((day) => `
            <button class="calendar-day ${state.workouts[String(day.dayNumber)]?.completed ? "complete" : ""} ${day.dayNumber === selectedDay ? "current" : ""}" data-day="${day.dayNumber}">
              <span>Day ${day.dayNumber}</span>
              <strong>${day.title}</strong>
              <small>${day.date} - Block ${day.block} - ${day.type}</small>
            </button>
          `).join("")}
        </div>
      </article>
    </section>
  `;
}

function programView() {
  const blocks = Array.from({ length: 13 }, (_, i) => i + 1);
  return `
    <section class="page-grid">
      ${blocks.map((block) => {
        const days = program.filter((day) => day.block === block);
        const complete = days.filter((day) => state.workouts[String(day.dayNumber)]?.completed).length;
        return `
          <article class="card">
            <p class="eyebrow">Block ${block}</p>
            <h3>${days[0].phase}</h3>
            <p>${block === 13 ? "Final 29-day integration block with benchmarks and personalized choices." : "Three build weeks followed by a lower-volume deload week."}</p>
            <div class="bar"><span style="width:${Math.round((complete / days.length) * 100)}%"></span></div>
            <small>${complete}/${days.length} workouts complete</small>
          </article>
        `;
      }).join("")}
    </section>
  `;
}

function progressView() {
  const s = stats(state, program);
  const recent = Object.entries(state.workouts).slice(-8).reverse();
  const quick = (state.microTaskHistory || []).slice(0, 8);
  return `
    <section class="page-grid">
      <article class="card span">${metricCards(s)}</article>
      <article class="card span">${skillsPanel()}</article>
      <article class="card">
        <h3>Recent quick tasks</h3>
        <div class="timeline">
          ${quick.length ? quick.map((task) => `<p><b>${task.title}</b> - Tier ${task.tier} - ${task.xp} XP</p>`).join("") : "<p>No quick tasks completed yet.</p>"}
        </div>
      </article>
      <article class="card">
        <h3>Recent workouts</h3>
        <div class="timeline">
          ${recent.length ? recent.map(([day, workout]) => `<p><b>Day ${day}</b> - ${workout.gained} XP - energy ${workout.energy}/5</p>`).join("") : "<p>No workouts logged yet.</p>"}
        </div>
      </article>
      <article class="card">
        <h3>Export</h3>
        <p>Export all local training data as JSON or workout history as CSV.</p>
        <div class="actions"><button data-export="json">JSON</button><button data-export="csv">CSV</button></div>
      </article>
    </section>
  `;
}

function libraryView() {
  return `
    <section class="page-grid">
      ${Object.values(exerciseLibrary).map((exercise) => `
        <article class="card">
          <p class="eyebrow">${exercise.category}</p>
          <h3>${exercise.name}</h3>
          <p>${exercise.description}</p>
          <p><b>Cue:</b> ${exercise.cue}</p>
          <p><b>Common mistake:</b> ${exercise.mistakes}</p>
          <p><b>Regression:</b> ${exercise.regression}</p>
          <p><b>Progression:</b> ${exercise.progression}</p>
          <div class="chips">${(exercise.equipment.length ? exercise.equipment : ["bodyweight"]).map((e) => `<span>${e}</span>`).join("")}</div>
        </article>
      `).join("")}
    </section>
  `;
}

function settingsView() {
  const equipment = ["pull-up bar", "rings", "resistance bands", "jump rope", "chair", "stairs"];
  return `
    <section class="page-grid">
      <form class="card span" id="settings-form">
        <p class="eyebrow">Local settings</p>
        <h2>Program setup</h2>
        <div class="settings-grid">
          <label class="field">Name<input name="name" value="${state.profile.name}" /></label>
          <label class="field">Program start date<input type="date" name="startDate" value="${state.profile.startDate}" /></label>
          <label class="field">Training level<select name="level"><option ${state.profile.level === "Foundation" ? "selected" : ""}>Foundation</option><option ${state.profile.level === "Intermediate" ? "selected" : ""}>Intermediate</option><option ${state.profile.level === "Advanced" ? "selected" : ""}>Advanced</option></select></label>
          <label class="field">Session duration<input type="number" name="sessionDuration" value="${state.profile.sessionDuration}" /></label>
          <label class="field">Theme<select name="theme"><option ${state.profile.theme === "dark" ? "selected" : ""}>dark</option><option ${state.profile.theme === "light" ? "selected" : ""}>light</option></select></label>
        </div>
        <h3>Home equipment</h3>
        <div class="check-grid">
          ${equipment.map((item) => `<label><input type="checkbox" name="equipment" value="${item}" ${state.profile.equipment.includes(item) ? "checked" : ""} /> ${item}</label>`).join("")}
        </div>
        <label class="field wide">Limitations<textarea name="limitations" rows="3">${state.profile.limitations || ""}</textarea></label>
        <div class="actions"><button class="primary" type="submit">Save settings</button><button type="button" data-reset>Reset local data</button></div>
        <div class="actions secondary-actions"><button type="button" data-sign-out>Sign out username</button></div>
      </form>
      <article class="card span">
        <h3>Safety</h3>
        <p>This application provides general fitness programming, not medical advice. Stop exercises that cause sharp or worsening pain. Persistent pain or injury concerns should be assessed by a qualified healthcare professional. Adjust difficulty to current capacity.</p>
      </article>
    </section>
  `;
}

function skillsPanel() {
  return `
    <article class="card">
      <h3>Skill levels</h3>
      <div class="skill-list">
        ${Object.entries(state.xp).map(([skill, xp]) => {
          const level = levelFromXp(xp);
          const current = xpForLevel(level);
          const next = xpForLevel(level + 1);
          const pct = Math.round(((xp - current) / Math.max(1, next - current)) * 100);
          return `<div><span><b>${cap(skill)}</b><small>Level ${level} - ${xp} XP</small></span><div class="bar"><span style="width:${Math.max(0, Math.min(100, pct))}%"></span></div></div>`;
        }).join("")}
      </div>
    </article>
  `;
}

function metricCards(s) {
  return `
    <div class="metrics">
      ${metric("Total level", s.totalLevel)}
      ${metric("Quick tasks", s.microTasksDone)}
      ${metric("Task streak", `${s.taskStreak} days`)}
      ${metric("Workouts", s.completedCount)}
    </div>
  `;
}

function bindEvents() {
  app.querySelector("#login-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    state = signIn(state, form.get("username"));
    saveState(state);
    render();
  });
  app.querySelectorAll("[data-route]").forEach((button) => button.addEventListener("click", () => {
    route = button.dataset.route;
    render();
  }));
  app.querySelectorAll("[data-timer-toggle]").forEach((button) => button.addEventListener("click", () => {
    unlockAudio();
    const key = button.dataset.timerToggle;
    const timer = timerSnapshot(key, Number(button.dataset.timerDuration));
    if (timer.running) {
      timer.remaining = Math.max(0, Math.ceil((timer.endAt - Date.now()) / 1000));
      timer.running = false;
    } else {
      if (timer.remaining === 0) timer.remaining = timer.duration;
      timer.notified = false;
      timer.endAt = Date.now() + timer.remaining * 1000;
      timer.running = true;
      ensureTimerTicker();
    }
    updateTimerDisplays();
  }));
  app.querySelectorAll("[data-timer-reset]").forEach((button) => button.addEventListener("click", () => {
    const key = button.dataset.timerReset;
    taskTimers.set(key, { duration: Number(button.dataset.timerDuration), remaining: Number(button.dataset.timerDuration), running: false, endAt: null, notified: false });
    updateTimerDisplays();
  }));
  app.querySelectorAll("[data-task-info]").forEach((card) => {
    const openGuide = (event) => {
      if (event.target.closest("button")) return;
      if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      const [source, identifier] = card.dataset.taskInfo.split(":");
      const task = source === "micro"
        ? state.microTasks[Number(identifier)]
        : dailyTasksFor(withSubstitutions(program[selectedDay - 1])).find((item) => item.id === identifier);
      if (task) showTaskInfo(task);
    };
    card.addEventListener("click", openGuide);
    card.addEventListener("keydown", openGuide);
  });
  app.querySelectorAll("[data-set]").forEach((button) => button.addEventListener("click", () => {
    const [dayNumber, exerciseIndex, setIndex] = button.dataset.set.split(":").map(Number);
    state = toggleSet(state, dayNumber, exerciseIndex, setIndex);
    saveState(state);
    render();
  }));
  app.querySelectorAll("[data-micro-task]").forEach((button) => button.addEventListener("click", () => {
    const task = state.microTasks[Number(button.dataset.microTask)];
    const beforeSkillLevels = skillLevelsFor(state);
    celebrateTask(button, task?.xp || 0);
    state = completeMicroTask(state, Number(button.dataset.microTask));
    const skillChanges = skillLevelChanges(beforeSkillLevels, skillLevelsFor(state));
    saveState(state);
    render();
    if (skillChanges.length) celebrateLevelUp(stats(state, program).totalLevel, skillChanges);
  }));
  app.querySelector("[data-refresh-micro]")?.addEventListener("click", () => {
    const completed = state.microTasks.filter((task) => task.completed).length;
    if (completed > 0 && completed < state.microTasks.length && !confirm(`Refresh now? Your ${completed}/5 progress will be cleared and the ${QUICK_SET_BONUS_XP} XP set bonus will be forfeited.`)) return;
    state = refreshMicroTasks(state);
    saveState(state);
    render();
  });
  app.querySelector("[data-undo-last]")?.addEventListener("click", () => {
    state = undoLastAction(state);
    saveState(state);
    render();
  });
  app.querySelectorAll("[data-task]").forEach((button) => button.addEventListener("click", () => {
    const day = withSubstitutions(program[selectedDay - 1]);
    const task = dailyTasksFor(day).find((item) => item.id === button.dataset.task);
    const wasDone = state.taskCompletions[taskKey(day.dayNumber, button.dataset.task)];
    const beforeSkillLevels = skillLevelsFor(state);
    if (!wasDone) celebrateTask(button, task?.xp || 0);
    state = completeTask(state, day, button.dataset.task);
    const skillChanges = skillLevelChanges(beforeSkillLevels, skillLevelsFor(state));
    saveState(state);
    render();
    if (!wasDone && skillChanges.length) celebrateLevelUp(stats(state, program).totalLevel, skillChanges);
  }));
  app.querySelector("#workout-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const beforeSkillLevels = skillLevelsFor(state);
    state = completeWorkout(state, withSubstitutions(program[selectedDay - 1]), new FormData(event.currentTarget));
    const skillChanges = skillLevelChanges(beforeSkillLevels, skillLevelsFor(state));
    saveState(state);
    render();
    if (skillChanges.length) celebrateLevelUp(stats(state, program).totalLevel, skillChanges);
  });
  app.querySelectorAll(".calendar-day").forEach((button) => button.addEventListener("click", () => {
    selectedDay = Number(button.dataset.day);
    route = "tasks";
    render();
  }));
  app.querySelector("#calendar-filter")?.addEventListener("input", (event) => {
    const query = event.target.value.toLowerCase();
    app.querySelectorAll(".calendar-day").forEach((button) => {
      button.hidden = !button.textContent.toLowerCase().includes(query);
    });
  });
  app.querySelector("#settings-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    state.profile = {
      ...state.profile,
      name: form.get("name"),
      startDate: form.get("startDate"),
      level: form.get("level"),
      sessionDuration: Number(form.get("sessionDuration")),
      theme: form.get("theme"),
      limitations: form.get("limitations"),
      equipment: form.getAll("equipment")
    };
    selectedDay = currentProgramDay();
    saveState(state);
    render();
  });
  app.querySelector("[data-reset]")?.addEventListener("click", () => {
    if (confirm("Reset all local Athlete 365 data?")) {
      resetState();
      state = loadState();
      selectedDay = currentProgramDay();
      route = "tasks";
      render();
    }
  });
  app.querySelector("[data-sign-out]")?.addEventListener("click", () => {
    state = signOut(state);
    saveState(state);
    route = "tasks";
    render();
  });
  app.querySelector("[data-update-app]")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = "Updating...";
    const resetUrl = new URL("./reset-update.html", window.location.href);
    resetUrl.searchParams.set("update", Date.now().toString());
    window.location.replace(resetUrl.toString());
  });
  app.querySelectorAll("[data-export]").forEach((button) => button.addEventListener("click", () => {
    const type = button.dataset.export;
    download(type === "json" ? exportJson(state) : exportCsv(state), `athlete-365.${type}`, type === "json" ? "application/json" : "text/csv");
  }));
  app.querySelectorAll(".readiness input").forEach((input) => input.addEventListener("input", () => {
    const form = input.closest("form");
    const values = Object.fromEntries(new FormData(form));
    app.querySelector("#readiness-advice").textContent = readinessAdvice(program[selectedDay - 1], values);
  }));
}

function withSubstitutions(day) {
  return {
    ...day,
    exercises: day.exercises.map((exercise) => substituteExercise(exercise, state.profile.equipment)),
    finisher: day.finisher ? substituteExercise(day.finisher, state.profile.equipment) : null
  };
}

function currentProgramDay() {
  const start = new Date(`${state.profile.startDate}T00:00:00`);
  const today = new Date();
  const diff = Math.floor((today - start) / 86400000) + 1;
  return Math.max(1, Math.min(365, diff));
}

function navButton(id, label) {
  return `<button data-route="${id}" class="${route === id ? "active" : ""}">${label}</button>`;
}

function sectionList(title, items) {
  return `<article class="compact"><h3>${title}</h3><ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul></article>`;
}

function rangeField(name, label, value, min, max) {
  return `<label class="field mini">${label}<input type="range" name="${name}" min="${min}" max="${max}" value="${value}" /><span>${value}</span></label>`;
}

function metric(label, value) {
  return `<article><span>${label}</span><strong>${value}</strong></article>`;
}

function bonusPill(label, xp, earned) {
  return `<span class="${earned ? "earned" : ""}"><b>${label}</b><small>${earned ? "earned" : xp}</small></span>`;
}

function cap(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function download(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const movementGuides = [
  guide("Scapular push-up", /scapular push-ups?/i, "Start in a high plank with straight elbows.", ["Let the chest sink slightly as the shoulder blades move together.", "Push the floor away and spread the shoulder blades without bending the elbows."], "Use a wall or elevate your hands."),
  guide("Explosive push-up", /explosive push-ups?/i, "Use a firm floor and begin in a strong push-up position.", ["Lower under control, then drive up as quickly as possible.", "Land with soft elbows and reset before the next rep."], "Use an incline or perform fast push-ups without leaving the floor."),
  guide("Push-up", /push-ups?/i, "Place hands just outside shoulder width and form a straight line from head to heels.", ["Brace the stomach and squeeze the glutes.", "Lower the chest between the hands while keeping elbows about 30-45 degrees from the body.", "Press the floor away without letting the hips sag."], "Place your hands on a stable chair, counter, or wall."),
  guide("Sit-up or crunch", /sit-ups?|crunches?/i, "Lie on your back with knees bent and feet planted.", ["Gently brace the stomach before moving.", "Curl the ribs toward the pelvis without pulling on the neck.", "Lower slowly instead of dropping back."], "Use a smaller crunch range."),
  guide("Split squat", /split squats?/i, "Stand in a staggered stance with both feet pointing forward.", ["Drop the back knee toward the floor while keeping the front foot planted.", "Keep the front knee tracking over the toes.", "Drive through the front foot to stand."], "Hold a wall or chair and use a shorter range."),
  guide("Squat", /squats?/i, "Stand around shoulder width with the whole foot on the floor.", ["Sit the hips down between the knees.", "Keep knees tracking in the same direction as the toes.", "Stand by pushing the floor away."], "Squat to a chair and stand back up."),
  guide("Reverse lunge", /reverse lunges?|lunges?/i, "Stand tall with feet under the hips.", ["Step one foot back and lower the back knee toward the floor.", "Keep most of the pressure through the front foot.", "Push through the front leg to return to standing."], "Hold a wall and reduce the depth."),
  guide("Plank", /plank/i, "Place elbows under shoulders and extend the legs behind you.", ["Squeeze glutes and brace as if preparing for a light punch.", "Keep ribs down and hips level.", "Breathe slowly without losing tension."], "Plank from the knees or with elbows on a chair."),
  guide("Calf raise", /calf raises?/i, "Stand tall with feet parallel and use a wall for balance if needed.", ["Rise onto the balls of the feet as high as comfortable.", "Pause briefly at the top.", "Lower the heels slowly through the full range."], "Use both legs and a smaller range."),
  guide("Tibialis raise", /tibialis raises?/i, "Lean your back against a wall with feet slightly forward.", ["Keep heels planted and lift the toes toward the shins.", "Pause at the top, then lower under control."], "Move the feet closer to the wall."),
  guide("Glute bridge", /glute bridges?/i, "Lie on your back with knees bent and feet near the hips.", ["Brace lightly and press through the heels.", "Lift the hips by squeezing the glutes.", "Pause at the top without arching the lower back."], "Use a smaller range."),
  guide("Mountain climber", /mountain climbers?/i, "Begin in a high plank with hands under shoulders.", ["Bring one knee toward the chest while keeping the hips steady.", "Switch sides smoothly and keep pressing the floor away."], "Move slowly or elevate the hands."),
  guide("Step-up", /step-ups?/i, "Use a stable, non-rolling step or low chair against a wall.", ["Place the whole working foot on the surface.", "Drive through that leg to stand tall.", "Lower slowly without dropping onto the trailing foot."], "Use a lower step and hold a wall."),
  guide("Pogo jump", /pogo jumps?/i, "Stand tall with knees softly unlocked.", ["Make small, quick jumps mainly from the ankles.", "Land quietly on the balls of the feet and keep the body tall."], "Perform quick calf raises without leaving the floor."),
  guide("Skater hop", /skater hops?|skater holds?/i, "Balance on one leg with the knee softly bent.", ["Hop sideways and land on the opposite leg.", "Absorb the landing quietly and hold balance before the next rep."], "Step sideways instead of jumping."),
  guide("Bar hang", /bar hang|hanging/i, "Use a secure bar and a grip you can maintain safely.", ["Hang with long arms while keeping the shoulders gently active.", "Keep breathing and split the total time into short sets if grip fades."], "Keep the feet lightly supported on the floor or a chair."),
  guide("Ring row", /ring rows?/i, "Set the rings securely and hold them with straight arms.", ["Keep the body in one straight line.", "Pull the rings toward the ribs and squeeze the shoulder blades.", "Lower under control until the arms are straight."], "Stand more upright."),
  guide("Mobility flow", /mobility|warm-up|cooldown/i, "Move only through comfortable, pain-free ranges.", ["Use slow circles and controlled reaches for the areas named in the task.", "Keep breathing and avoid forcing a stretch."], "Reduce the range or perform the movements seated."),
  guide("Easy movement", /walking|breathing|easy extra movement/i, "Choose a relaxed pace that lets you breathe comfortably.", ["Keep the effort easy and continuous.", "For breathing, inhale gently through the nose and use a longer relaxed exhale."], "Shorten the duration and move at any comfortable pace.")
];

function guide(name, pattern, setup, steps, easier) {
  return { name, pattern, setup, steps, easier };
}

function showTaskInfo(task) {
  document.querySelector(".task-info-layer")?.remove();
  const guides = task.exercise
    ? [{
        name: task.exercise.name,
        setup: task.exercise.description || `Prepare for ${task.exercise.name}.`,
        steps: [task.exercise.cue, `Complete ${task.detail} with controlled, pain-free reps.`],
        easier: task.exercise.regression,
        avoid: task.exercise.mistakes
      }]
    : movementGuides.filter((item) => item.pattern.test(`${task.title} ${task.detail}`));
  const sections = guides.length ? guides : [{
    name: task.title,
    setup: task.detail,
    steps: ["Move at a controlled pace and keep every repetition comfortable.", "Stop the set before technique breaks down."],
    easier: "Reduce the repetitions, range of motion, or duration."
  }];
  const layer = document.createElement("div");
  layer.className = "task-info-layer";
  layer.setAttribute("role", "dialog");
  layer.setAttribute("aria-modal", "true");
  layer.setAttribute("aria-label", `${task.title} instructions`);
  layer.innerHTML = `
    <article class="task-info-panel">
      <div class="task-info-head">
        <div>
          <p class="eyebrow">Movement guide</p>
          <h2>${task.title}</h2>
          <p>${task.detail}</p>
        </div>
        <button type="button" class="task-info-close" aria-label="Close instructions">Close</button>
      </div>
      <div class="task-guide-list">
        ${sections.map((section) => `
          <section>
            <h3>${section.name}</h3>
            <p><b>Setup:</b> ${section.setup}</p>
            <ol>${section.steps.map((step) => `<li>${step}</li>`).join("")}</ol>
            ${section.avoid ? `<p><b>Avoid:</b> ${section.avoid}</p>` : ""}
            <p><b>Easier option:</b> ${section.easier}</p>
          </section>
        `).join("")}
      </div>
      <p class="task-safety-note">Stop if the movement causes sharp or worsening pain.</p>
    </article>
  `;
  document.body.append(layer);
  const close = () => {
    layer.remove();
    document.removeEventListener("keydown", closeWithEscape);
  };
  const closeWithEscape = (event) => {
    if (event.key === "Escape") close();
  };
  layer.querySelector(".task-info-close").addEventListener("click", close);
  layer.addEventListener("click", (event) => {
    if (event.target === layer) close();
  });
  document.addEventListener("keydown", closeWithEscape);
  layer.querySelector(".task-info-close").focus();
}

function celebrateTask(source, xp) {
  const rect = source.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;
  const flash = document.createElement("div");
  flash.className = "celebration-flash";
  celebrationLayer.append(flash);

  const toast = document.createElement("div");
  toast.className = "xp-toast";
  toast.textContent = xp ? `+${xp} XP` : "Task complete";
  celebrationLayer.append(toast);

  for (let index = 0; index < 16; index += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * index) / 16;
    const distance = 42 + (index % 4) * 12;
    particle.className = "burst-particle";
    particle.style.left = `${originX}px`;
    particle.style.top = `${originY}px`;
    particle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--delay", `${index * 8}ms`);
    celebrationLayer.append(particle);
  }

  window.setTimeout(() => {
    flash.remove();
    toast.remove();
    celebrationLayer.querySelectorAll(".burst-particle").forEach((particle) => particle.remove());
  }, 3300);
}

function skillLevelsFor(currentState) {
  return Object.fromEntries(
    Object.entries(currentState.xp).map(([skill, xp]) => [skill, levelFromXp(xp)])
  );
}

function skillLevelChanges(before, after) {
  return Object.entries(after)
    .filter(([skill, level]) => level > (before[skill] || 1))
    .map(([skill, level]) => ({ skill, level, previousLevel: before[skill] || 1 }));
}

function celebrateLevelUp(totalLevel, skillChanges) {
  celebrationLayer.querySelector(".level-up-overlay")?.remove();
  const overlay = document.createElement("button");
  overlay.type = "button";
  overlay.className = "level-up-overlay";
  const skillSummary = skillChanges.map(({ skill, level }) => `${cap(skill)} level ${level}`).join(", ");
  overlay.setAttribute("aria-label", `${skillSummary}. Total level ${totalLevel}. Tap to continue.`);
  overlay.innerHTML = `
    <div class="level-up-card">
      <span>Total level ${totalLevel}</span>
      <strong>LEVEL UP</strong>
      <div class="level-skill-list">
        ${skillChanges.map(({ skill, level, previousLevel }) => `
          <div>
            <b>${cap(skill)}</b>
            <span>Level ${previousLevel} to ${level}</span>
          </div>
        `).join("")}
      </div>
      <em>Tap to continue</em>
    </div>
  `;
  celebrationLayer.append(overlay);

  const dismiss = () => {
    overlay.remove();
    document.removeEventListener("keydown", dismissWithKeyboard);
  };
  const dismissWithKeyboard = (event) => {
    if (event.key === "Escape" || event.key === "Enter" || event.key === " ") dismiss();
  };
  overlay.addEventListener("click", dismiss, { once: true });
  document.addEventListener("keydown", dismissWithKeyboard);
  overlay.focus();

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  for (let index = 0; index < 34; index += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * index) / 34;
    const distance = 95 + (index % 6) * 18;
    particle.className = "level-particle";
    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;
    particle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--delay", `${index * 10}ms`);
    celebrationLayer.append(particle);
  }

  window.setTimeout(() => {
    celebrationLayer.querySelectorAll(".level-particle").forEach((particle) => particle.remove());
  }, 2200);
}
