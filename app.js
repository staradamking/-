// StarAdam Dev HQ – логика приложения

// ----- ДАННЫЕ -----

const MODULES = [
  {
    id: "html-css",
    title: "HTML & CSS",
    items: [
      { id: "html-basics", text: "Базовые теги HTML и структура страницы" },
      { id: "html-layout", text: "Блоки, секции, шапка, футер" },
      { id: "html-semantic", text: "Классы и id, семантика" },
      { id: "css-flex-grid", text: "Flex и Grid для раскладки" },
      { id: "css-colors", text: "Цвета, градиенты, тени, шрифты" },
      { id: "css-adaptive", text: "Адаптив под телефон" }
    ]
  },
  {
    id: "js-core",
    title: "JavaScript База",
    items: [
      { id: "js-types", text: "Переменные, типы, массивы, объекты" },
      { id: "js-functions", text: "Функции и стрелочные функции" },
      { id: "js-loops", text: "Циклы, forEach, map" },
      { id: "js-date", text: "Работа с датами (Date)" },
      { id: "js-events", text: "События: click, input, change" },
      { id: "js-dom", text: "Работа с DOM (createElement, innerHTML)" }
    ]
  },
  {
    id: "js-apps",
    title: "JavaScript Приложения",
    items: [
      { id: "state-structure", text: "Структура приложения: state, события" },
      { id: "local-storage", text: "localStorage: сохраняем состояние" },
      { id: "split-code", text: "Разделение кода на функции" },
      { id: "data-render", text: "Отрисовка списков на основе данных" },
      { id: "error-console", text: "Обработка ошибок и консоль" },
      { id: "clean-code", text: "Редакторский и чистый код" }
    ]
  },
  {
    id: "git",
    title: "Git & GitHub",
    items: [
      { id: "repo", text: "Что такое репозиторий" },
      { id: "git-history", text: "Коммиты и история изменений" },
      { id: "branches", text: "Ветки и слияния (branch, merge)" },
      { id: "github-flow", text: "GitHub: pull, fork, origin" },
      { id: "github-pages", text: "GitHub Pages: деплой фронта" },
      { id: "issues-pr", text: "Issues, Pull Requests и ревью" }
    ]
  }
];

const STORAGE_KEY = "staradam_devhq_progress_v1";
const VIEW_KEY = "staradam_devhq_view_v1";

// ----- СОСТОЯНИЕ -----

let state = {
  view: "today",          // today | tracks | stats | focus
  completed: new Set()    // id чекбокса -> true
};

// загрузка из localStorage
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.completed)) {
        state.completed = new Set(parsed.completed);
      }
    }
  } catch (_) {}

  try {
    const v = localStorage.getItem(VIEW_KEY);
    if (v === "today" || v === "tracks" || v === "stats" || v === "focus") {
      state.view = v;
    }
  } catch (_) {}
}

function saveState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ completed: Array.from(state.completed) })
    );
    localStorage.setItem(VIEW_KEY, state.view);
  } catch (_) {}
}

// ----- УТИЛИТЫ -----

function formatDateRu(date = new Date()) {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function countProgress() {
  const total = MODULES.reduce((sum, m) => sum + m.items.length, 0);
  const done = MODULES.reduce(
    (sum, m) => sum + m.items.filter(it => state.completed.has(it.id)).length,
    0
  );
  return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
}

// ближайшие невыполненные
function getNextTasks(limit = 5) {
  const tasks = [];
  for (const mod of MODULES) {
    for (const item of mod.items) {
      if (!state.completed.has(item.id)) {
        tasks.push({ module: mod.title, ...item });
        if (tasks.length >= limit) return tasks;
      }
    }
  }
  return tasks;
}

// ----- РЕНДЕР ВЕРХНЕЙ ПАНЕЛИ -----

function renderHeaderSummary() {
  const summaryEl = document.querySelector("[data-role='summary']");
  if (!summaryEl) return;

  const { total, done, percent } = countProgress();
  const todayStr = formatDateRu();

  summaryEl.innerHTML = `
    <div class="summary-row">
      <span>Сегодня: <strong>${todayStr}</strong></span>
      <span class="summary-progress">
        Прогресс: <strong>${done}</strong> из ${total} (${percent}%)
      </span>
    </div>
    <div class="summary-row secondary">
      Цель дня: закрыть хотя бы <strong>1 модуль</strong> или <strong>3 пункта</strong>.
    </div>
  `;
}

// ----- РЕНДЕР ЭКРАНОВ -----

const screenContainer = () => document.querySelector("[data-role='screen']");

function renderTodayView() {
  const el = screenContainer();
  if (!el) return;

  const { total, done, percent } = countProgress();
  const nextTasks = getNextTasks(4);

  el.innerHTML = `
    <section class="card">
      <h2>Сегодня</h2>
      <p>Фокус: пройти 1–2 пункта из списка и закрепить материал.</p>
      <p class="today-progress">
        Сейчас выполнено: <strong>${done}</strong> из ${total} (${percent}%)
      </p>
      ${
        nextTasks.length
          ? `<h3>Следующие шаги:</h3>
             <ul class="next-list">
               ${nextTasks
                 .map(
                   t =>
                     `<li><span class="next-module">${t.module}:</span> ${t.text}</li>`
                 )
                 .join("")}
             </ul>`
          : "<p>Все пункты закрыты. Можно пересматривать конспекты или двигаться к следующему уровню.</p>"
      }
    </section>
    ${renderModulesHtml({ compact: true })}
  `;
}

function renderTracksView() {
  const el = screenContainer();
  if (!el) return;
  el.innerHTML = renderModulesHtml({ compact: false });
}

function renderStatsView() {
  const el = screenContainer();
  if (!el) return;

  const { total, done, percent } = countProgress();

  const perModule = MODULES.map(m => {
    const mDone = m.items.filter(it => state.completed.has(it.id)).length;
    const mTotal = m.items.length;
    const p = mTotal ? Math.round((mDone / mTotal) * 100) : 0;
    return { title: m.title, done: mDone, total: mTotal, percent: p };
  });

  el.innerHTML = `
    <section class="card">
      <h2>Статистика</h2>
      <p>Общий прогресс: <strong>${done}</strong> из ${total} пунктов (${percent}%).</p>
      <div class="stats-modules">
        ${perModule
          .map(
            m => `
          <div class="stats-row">
            <div class="stats-title">${m.title}</div>
            <div class="stats-bar">
              <div class="stats-bar-fill" style="width:${m.percent}%"></div>
            </div>
            <div class="stats-label">${m.done} / ${m.total} (${m.percent}%)</div>
          </div>`
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderFocusView() {
  const el = screenContainer();
  if (!el) return;

  const nextTasks = getNextTasks(6);

  el.innerHTML = `
    <section class="card focus-card">
      <h2>Фокус</h2>
      <p>Выключи всё лишнее и сделай только эти пункты. Никаких отвлечений.</p>
      ${
        nextTasks.length
          ? `<ol class="focus-list">
               ${nextTasks
                 .map(
                   t =>
                     `<li>
                        <div class="focus-module">${t.module}</div>
                        <div class="focus-text">${t.text}</div>
                      </li>`
                 )
                 .join("")}
             </ol>`
          : "<p>Нет невыполненных задач. Можно повторить пройденное или расширять план.</p>"
      }
    </section>
  `;
}

// генерим HTML для модулей (список с чекбоксами)
function renderModulesHtml({ compact }) {
  return MODULES.map(module => {
    const inner = module.items
      .map(item => {
        const checked = state.completed.has(item.id) ? "checked" : "";
        return `
          <label class="task-item">
            <input 
              type="checkbox" 
              data-task-id="${item.id}"
              ${checked}
            />
            <span>${item.text}</span>
          </label>
        `;
      })
      .join("");

    return `
      <section class="card module-card ${compact ? "compact" : ""}">
        <div class="card-header">
          <h2>${module.title}</h2>
        </div>
        <div class="task-list">
          ${inner}
        </div>
      </section>
    `;
  }).join("");
}

// ----- НАВИГАЦИЯ -----

function setView(view) {
  state.view = view;
  saveState();
  renderAll();
}

function updateBottomNav() {
  const buttons = document.querySelectorAll("[data-nav]");
  buttons.forEach(btn => {
    const v = btn.getAttribute("data-nav");
    btn.classList.toggle("active", v === state.view);
  });
}

// ----- ОБРАБОТЧИКИ -----

function onScreenClick(e) {
  const target = e.target;

  // чекбоксы
  if (target.matches("input[type='checkbox'][data-task-id]")) {
    const id = target.getAttribute("data-task-id");
    if (target.checked) {
      state.completed.add(id);
    } else {
      state.completed.delete(id);
    }
    saveState();
    renderHeaderSummary(); // обновить прогресс сверху
  }
}

// ----- ИНИЦИАЛИЗАЦИЯ -----

function renderAll() {
  renderHeaderSummary();

  if (state.view === "today") renderTodayView();
  else if (state.view === "tracks") renderTracksView();
  else if (state.view === "stats") renderStatsView();
  else if (state.view === "focus") renderFocusView();

  updateBottomNav();
}

document.addEventListener("DOMContentLoaded", () => {
  loadState();

  // обработчик для чекбоксов
  const screenEl = screenContainer();
  if (screenEl) {
    screenEl.addEventListener("click", onScreenClick);
  }

  // нижняя навигация
  document.querySelectorAll("[data-nav]").forEach(btn => {
    btn.addEventListener("click", () => {
      const v = btn.getAttribute("data-nav");
      setView(v);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // при первом запуске
  renderAll();
});
