const STORAGE_KEY = "staradam_dev_hq_v1";

const tracks = [
  {
    id: "htmlcss",
    title: "HTML & CSS",
    modules: [
      "Базовые теги HTML и структура страницы",
      "Блоки, секции, шапка, футер",
      "Классы и id, семантика",
      "Flex и Grid для раскладки",
      "Цвета, градиенты, шрифты",
      "Адаптив под телефон"
    ]
  },
  {
    id: "jsbasic",
    title: "JavaScript База",
    modules: [
      "Переменные, типы, массивы, объекты",
      "Функции и стрелочные функции",
      "Циклы, forEach, map",
      "Работа с датами (Date)",
      "События: click, input, change",
      "Работа с DOM (createElement, innerHTML)"
    ]
  },
  {
    id: "jsapp",
    title: "JavaScript Приложения",
    modules: [
      "Структура приложения: state, события",
      "localStorage: сохраняем состояние",
      "Разделение кода на функции",
      "Отрисовка списков на основе данных",
      "Обработка ошибок в консоли",
      "Рефакторинг и чистый код"
    ]
  },
  {
    id: "git",
    title: "Git & GitHub",
    modules: [
      "Что такое репозиторий",
      "Коммиты и история изменений",
      "Ветки и слияния (branch, merge)",
      "GitHub: пуш, пулл, форки",
      "GitHub Pages: деплой фронтенда",
      "Рабочий процесс: правка → commit → deploy"
    ]
  },
  {
    id: "advanced",
    title: "Advanced / Будущее",
    modules: [
      "Обзор React и компонентов",
      "Основы TypeScript",
      "Простая архитектура SPA",
      "PWA: офлайн и иконка приложения",
      "UI/UX основы: как делать удобный интерфейс",
      "Собственный большой проект (StarAdam Suite)"
    ]
  }
];

let progress = loadProgress();

document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const infoPanel = document.getElementById("infoPanel");
  const todayStatus = document.getElementById("todayStatus");
  const statsPanel = document.getElementById("statsPanel");
  const container = document.getElementById("tracksContainer");

  const btnToday = document.getElementById("btnToday");
  const btnTracks = document.getElementById("btnTracks");
  const btnStats = document.getElementById("btnStats");
  const btnFocus = document.getElementById("btnFocus");
  const focusMusic = document.getElementById("focusMusic");

  renderTracks(container);
  updateStats(statsPanel);
  updateToday(todayStatus);

  // Кнопка-меню (звезда) — сворачивает/разворачивает инфопанель
  menuBtn.addEventListener("click", () => {
    const collapsed = infoPanel.classList.toggle("collapsed");
    menuBtn.classList.toggle("open", !collapsed);
  });

  // Нижняя панель
  btnToday.addEventListener("click", () => {
    scrollToTop();
    setActiveBottom(btnToday);
  });

  btnTracks.addEventListener("click", () => {
    scrollToTop();
    setActiveBottom(btnTracks);
  });

  btnStats.addEventListener("click", () => {
    scrollToTop();
    pulseElement(statsPanel);
    setActiveBottom(btnStats);
  });

  let focusOn = false;
  btnFocus.addEventListener("click", () => {
    if (!focusOn) {
      focusMusic.volume = 0.25;
      focusMusic.play().catch(() => {});
      focusOn = true;
      btnFocus.textContent = "Фокус: ON";
    } else {
      focusMusic.pause();
      focusOn = false;
      btnFocus.textContent = "Фокус";
    }
    setActiveBottom(btnFocus);
  });
});

// Рендер направлений и модулей
function renderTracks(container) {
  container.innerHTML = "";
  tracks.forEach(track => {
    const card = document.createElement("section");
    card.className = "track-card";

    const header = document.createElement("div");
    header.className = "track-header";

    const titleEl = document.createElement("div");
    titleEl.className = "track-title";
    titleEl.textContent = track.title;

    const progressEl = document.createElement("div");
    progressEl.className = "track-progress";

    const total = track.modules.length;
    const done = countDoneInTrack(track.id, total);
    progressEl.textContent = `${done}/${total}`;

    header.appendChild(titleEl);
    header.appendChild(progressEl);

    const list = document.createElement("ul");
    list.className = "module-list";

    track.modules.forEach((m, idx) => {
      const item = document.createElement("li");
      item.className = "module-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = !!progress[modKey(track.id, idx)];

      checkbox.addEventListener("change", () => {
        progress[modKey(track.id, idx)] = checkbox.checked;
        saveProgress();
        // обновить прогресс по этому треку
        const newDone = countDoneInTrack(track.id, total);
        progressEl.textContent = `${newDone}/${total}`;
        // обновить общую статистику
        const statsPanel = document.getElementById("statsPanel");
        updateStats(statsPanel);
      });

      const label = document.createElement("div");
      label.className = "module-label";
      label.textContent = m;

      item.appendChild(checkbox);
      item.appendChild(label);
      list.appendChild(item);
    });

    card.appendChild(header);
    card.appendChild(list);
    container.appendChild(card);
  });
}

// Ключ модуля в хранилище
function modKey(trackId, moduleIndex) {
  return `${trackId}_${moduleIndex}`;
}

// Загрузка прогресса
function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (_) {
    return {};
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (_) {}
}

// Подсчёт выполненных модулей по треку
function countDoneInTrack(trackId, totalModules) {
  let count = 0;
  for (let i = 0; i < totalModules; i++) {
    if (progress[modKey(trackId, i)]) count++;
  }
  return count;
}

// Общая статистика
function updateStats(el) {
  let totalModules = 0;
  let completed = 0;
  tracks.forEach(track => {
    totalModules += track.modules.length;
    for (let i = 0; i < track.modules.length; i++) {
      if (progress[modKey(track.id, i)]) completed++;
    }
  });

  const percent = totalModules === 0 ? 0 : Math.round((completed * 100) / totalModules);

  el.innerHTML = `
    Всего модулей: <b>${completed}</b> из <b>${totalModules}</b> (${percent}%)<br>
    Цель: закрыть хотя бы 1 модуль в день, без пропусков.
  `;
}

// Инфо на сегодня
function updateToday(el) {
  const today = new Date();
  const options = { day: "numeric", month: "long", year: "numeric" };
  const dateStr = today.toLocaleDateString("ru-RU", options);

  el.innerHTML = `
    Сегодня: <b>${dateStr}</b><br>
    Задача дня: выбери 1–2 модуля и доведи их до конца.
  `;
}

// Вспомогательные эффекты

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setActiveBottom(btn) {
  document.querySelectorAll(".bottom-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

function pulseElement(el) {
  if (!el) return;
  el.style.transition = "background .25s ease";
  const oldBg = el.style.background;
  el.style.background = "rgba(0,255,102,0.15)";
  setTimeout(() => {
    el.style.background = oldBg;
  }, 300);
}
