// ===== ДАННЫЕ ОБУЧЕНИЯ =====

const MODULES = [
  {
    id: "htmlcss",
    title: "HTML & CSS",
    tasks: [
      "Базовые теги HTML и структура страницы",
      "Блоки, секции, шапка, футер",
      "Классы и id, семантика",
      "Flex и Grid для раскладок",
      "Цвета, градиенты, шрифты",
      "Адаптив под телефон"
    ]
  },
  {
    id: "js-base",
    title: "JavaScript База",
    tasks: [
      "Переменные: let, const, типы данных",
      "Массивы и объекты",
      "Функции и стрелочные функции",
      "Циклы: for, while, forEach",
      "Работа с датами (Date)",
      "События: click, input, change"
    ]
  },
  {
    id: "js-apps",
    title: "JavaScript Приложения",
    tasks: [
      "Структура приложения: состояние (state)",
      "Работа с localStorage",
      "Разделение кода на функции",
      "Отрисовка списков на основе данных",
      "Обработка ошибок в консоли",
      "Мини-проекты: todo, таймер, калькулятор"
    ]
  },
  {
    id: "git",
    title: "Git & GitHub",
    tasks: [
      "Что такое репозиторий",
      "Коммиты и история изменений",
      "Ветки и слияния (branch, merge)",
      "GitHub: push, pull, fork",
      "GitHub Pages: деплой фронтенда",
      "Рабочий процесс: feature-ветки"
    ]
  }
];

const STORAGE_KEY = "staradam_dev_hq_v1";

// ===== СОСТОЯНИЕ =====

let state = {
  activeView: "today", // today | paths | stats
  completed: {}, // { taskId: true }
  focusOn: false,
  focusModuleId: "htmlcss"
};

// ===== УТИЛИТЫ =====

function taskId(moduleId, index) {
  return `${moduleId}-${index}`;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;

    state = {
      ...state,
      ...parsed,
      completed: parsed.completed || {}
    };
  } catch (e) {
    console.warn("Не удалось загрузить состояние:", e);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Не удалось сохранить состояние:", e);
  }
}

function formatDateRu(date) {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

// ===== РЕНДЕР =====

function render() {
  renderInfoPanel();
  renderView();
  updateNavButtons();
  updateFocusButton();
}

function renderInfoPanel() {
  const infoEl = document.getElementById("infoContent");
  if (!infoEl) return;

  const now = new Date();
  const todayStr = formatDateRu(now);

  const total = countAllTasks();
  const done = countCompletedTasks();
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const focusModule = MODULES.find(m => m.id === state.focusModuleId);

  infoEl.innerHTML = `
    <div><strong>Сегодня: ${todayStr}</strong></div>
    <div>Активный экран: <strong>${
      state.activeView === "today"
        ? "Сегодня"
        : state.activeView === "paths"
        ? "Направления"
        : "Статистика"
    }</strong></div>
    <div>Прогресс: <strong>${done}</strong> из <strong>${total}</strong> задач (${percent}%).</div>
    <div>Фокус: ${
      state.focusOn ? `<strong>ON</strong> → ${focusModule ? focusModule.title : ""}` : "OFF"
    }</div>
    <div style="margin-top:4px; opacity:0.9;">
      План: закрывать хотя бы 1–2 пункта в день, без пропусков.
    </div>
  `;
}

function renderView() {
  const container = document.getElementById("viewContainer");
  if (!container) return;

  if (state.activeView === "today") {
    container.innerHTML = renderTodayView();
  } else if (state.activeView === "paths") {
    container.innerHTML = renderPathsView();
  } else {
    container.innerHTML = renderStatsView();
  }
}

function renderTodayView() {
  const tasks = getTodayTasks();

  if (tasks.length === 0) {
    return `
      <section class="section-card">
        <h2 class="section-title">Задачи на сегодня</h2>
        <p class="section-subtitle">Все задачи выполнены. Можно повторить материал или открыть новое направление в разделе «Направления».</p>
      </section>
    `;
  }

  const items = tasks
    .map(t => {
      const id = taskId(t.module.id, t.index);
      const checked = !!state.completed[id];

      return `
        <li class="task-item">
          <input type="checkbox" id="${id}" class="task-checkbox" data-task-id="${id}" ${
        checked ? "checked" : ""
      } />
          <label for="${id}" class="task-label">
            <strong>${t.module.title}</strong>: ${t.text}
          </label>
        </li>
      `;
    })
    .join("");

  return `
    <section class="section-card">
      <h2 class="section-title">Задачи на сегодня</h2>
      <p class="section-subtitle">
        ${
          state.focusOn
            ? "Показаны задачи только из фокусного направления."
            : "Выбраны ближайшие невыполненные задачи из всех направлений."
        }
      </p>
      <ul class="task-list">
        ${items}
      </ul>
    </section>
  `;
}

function renderPathsView() {
  const sections = MODULES.map(module => {
    const total = module.tasks.length;
    const done = module.tasks.filter((_, i) =>
      state.completed[taskId(module.id, i)]
    ).length;

    const tasksHtml = module.tasks
      .map((text, index) => {
        const id = taskId(module.id, index);
        const checked = !!state.completed[id];

        return `
          <li class="task-item">
            <input type="checkbox" id="${id}" class="task-checkbox" data-task-id="${id}" ${
          checked ? "checked" : ""
        } />
            <label for="${id}" class="task-label">${text}</label>
          </li>
        `;
      })
      .join("");

    return `
      <section class="section-card">
        <div class="module-header">
          <h2 class="module-title">${module.title}</h2>
          <div class="module-progress">${done} / ${total}</div>
        </div>
        <ul class="task-list">
          ${tasksHtml}
        </ul>
      </section>
    `;
  }).join("");

  return sections;
}

function renderStatsView() {
  const totalAll = countAllTasks();
  const doneAll = countCompletedTasks();
  const percentAll = totalAll ? Math.round((doneAll / totalAll) * 100) : 0;

  const perModuleHtml = MODULES.map(module => {
    const total = module.tasks.length;
    const done = module.tasks.filter((_, i) =>
      state.completed[taskId(module.id, i)]
    ).length;
    const percent = total ? Math.round((done / total) * 100) : 0;

    return `
      <div class="stats-row">
        <span>${module.title}</span>
        <div class="stats-bar">
          <div class="stats-bar-fill" style="width:${percent}%;"></div>
        </div>
        <span style="margin-left:8px;">${percent}%</span>
      </div>
    `;
  }).join("");

  return `
    <section class="section-card">
      <h2 class="section-title">Общая статистика</h2>
      <p class="section-subtitle">
        Выполнено <strong>${doneAll}</strong> из <strong>${totalAll}</strong> задач (${percentAll}%).
      </p>
      ${perModuleHtml}
    </section>
  `;
}

// ===== ЛОГИКА ЗАДАЧ =====

function countAllTasks() {
  return MODULES.reduce((sum, m) => sum + m.tasks.length, 0);
}

function countCompletedTasks() {
  let count = 0;
  MODULES.forEach(module => {
    module.tasks.forEach((_, i) => {
      if (state.completed[taskId(module.id, i)]) count++;
    });
  });
  return count;
}

function getTodayTasks() {
  const tasks = [];

  if (state.focusOn) {
    const module = MODULES.find(m => m.id === state.focusModuleId) || MODULES[0];
    module.tasks.forEach((text, index) => {
      const id = taskId(module.id, index);
      if (!state.completed[id]) {
        tasks.push({ module, index, text });
      }
    });
  } else {
    MODULES.forEach(module => {
      module.tasks.forEach((text, index) => {
        const id = taskId(module.id, index);
        if (!state.completed[id]) {
          tasks.push({ module, index, text });
        }
      });
    });
  }

  // Берём первые 6 задач, чтобы не перегружать день
  return tasks.slice(0, 6);
}

// ===== НАВИГАЦИЯ И ФОКУС =====

function updateNavButtons() {
  const btns = document.querySelectorAll(".nav-btn[data-view]");
  btns.forEach(btn => {
    const view = btn.getAttribute("data-view");
    if (view === state.activeView) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function updateFocusButton() {
  const focusBtn = document.getElementById("focusBtn");
  if (!focusBtn) return;

  focusBtn.textContent = state.focusOn ? "Фокус: ON" : "Фокус: OFF";
  if (state.focusOn) {
    focusBtn.classList.add("on");
  } else {
    focusBtn.classList.remove("on");
  }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====

function setupEvents() {
  // Нижние кнопки (вкладки)
  document.querySelectorAll(".nav-btn[data-view]").forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view");
      state.activeView = view;
      saveState();
      render();
    });
  });

  // Фокус
  const focusBtn = document.getElementById("focusBtn");
  if (focusBtn) {
    focusBtn.addEventListener("click", () => {
      state.focusOn = !state.focusOn;
      // по кругу меняем фокусный модуль
      if (state.focusOn) {
        const currentIndex = MODULES.findIndex(
          m => m.id === state.focusModuleId
        );
        const nextIndex = currentIndex === -1 ? 0 : currentIndex;
        state.focusModuleId = MODULES[nextIndex].id;
      }
      saveState();
      updateFocusButton();
      renderInfoPanel();
      if (state.activeView === "today") {
        renderView();
      }
    });
  }

  // Тоггл инфопанели (звезда)
  const menuToggle = document.getElementById("menuToggle");
  const infoPanel = document.getElementById("infoPanel");
  if (menuToggle && infoPanel) {
    menuToggle.addEventListener("click", () => {
      const collapsed = infoPanel.classList.toggle("collapsed");
      if (collapsed) {
        menuToggle.classList.remove("open");
      } else {
        menuToggle.classList.add("open");
      }
    });
  }

  // Обработка чекбоксов (делегирование)
  const main = document.querySelector(".main-scroll");
  if (main) {
    main.addEventListener("change", event => {
      const target = event.target;
      if (target && target.classList.contains("task-checkbox")) {
        const id = target.getAttribute("data-task-id");
        if (!id) return;
        state.completed[id] = target.checked;
        saveState();
        // после изменения – обновим инфо + статистику
        renderInfoPanel();
        if (state.activeView === "stats") {
          renderView();
        }
      }
    });
  }
}

// Старт
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  setupEvents();
  render();
});
