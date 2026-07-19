import { exerciseLibrary, levelFromXp, xpForLevel, validateProgram } from "./program.js";
import {
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
  resetState,
  saveState,
  signIn,
  signOut,
  stats,
  substituteExercise,
  taskKey,
  taskProgress,
  toggleSet
} from "./state.js";

let state = loadState();
let program = programForState(state);
let route = "tasks";
let selectedDay = currentProgramDay();

const app = document.querySelector("#app");

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
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
            <p>Most tasks need no equipment. Higher tiers unlock as your total level rises.</p>
          </div>
          <strong class="level-badge">${s.microTasksDone} done</strong>
        </div>
        <div class="micro-task-list">
          ${state.microTasks.map((task, index) => microTaskCard(task, index)).join("")}
        </div>
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
          <h3>Task tiers</h3>
          <p>Tier 1 is simple bodyweight work like 10 push-ups, 10 sit-ups, squats, planks, lunges, and mobility. Later tiers add rounds, density blocks, and optional home equipment.</p>
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
      </aside>
    </section>
  `;
}

function microTaskCard(task, index) {
  return `
    <article class="task-card micro tier-${task.tier}">
      <button type="button" class="task-check" data-micro-task="${index}" aria-label="Complete ${task.title}">+</button>
      <div>
        <p class="eyebrow">Tier ${task.tier} - ${task.skills.join(" + ")}</p>
        <h3>${task.title}</h3>
        <p>${task.detail}</p>
        <small>${task.equipment.length ? `Needs ${task.equipment.join(", ")}` : "No equipment"}</small>
      </div>
      <strong>${task.xp} XP</strong>
    </article>
  `;
}

function taskCard(task, day) {
  const done = state.taskCompletions[taskKey(day.dayNumber, task.id)];
  return `
    <article class="task-card ${task.featured ? "featured" : ""} ${done ? "done" : ""}">
      <button type="button" class="task-check" data-task="${task.id}" ${done ? "disabled" : ""} aria-label="Complete ${task.title}">
        ${done ? "✓" : "+"}
      </button>
      <div>
        <p class="eyebrow">${task.featured ? "Big reward task" : task.skills.join(" + ")}</p>
        <h3>${task.title}</h3>
        <p>${task.detail}</p>
      </div>
      <strong>${task.xp} XP</strong>
    </article>
  `;
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
  app.querySelectorAll("[data-set]").forEach((button) => button.addEventListener("click", () => {
    const [dayNumber, exerciseIndex, setIndex] = button.dataset.set.split(":").map(Number);
    state = toggleSet(state, dayNumber, exerciseIndex, setIndex);
    saveState(state);
    render();
  }));
  app.querySelectorAll("[data-micro-task]").forEach((button) => button.addEventListener("click", () => {
    state = completeMicroTask(state, Number(button.dataset.microTask));
    saveState(state);
    render();
  }));
  app.querySelectorAll("[data-task]").forEach((button) => button.addEventListener("click", () => {
    state = completeTask(state, withSubstitutions(program[selectedDay - 1]), button.dataset.task);
    saveState(state);
    render();
  }));
  app.querySelector("#workout-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    state = completeWorkout(state, withSubstitutions(program[selectedDay - 1]), new FormData(event.currentTarget));
    saveState(state);
    render();
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
