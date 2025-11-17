// STARADAM DEV HQ – логика приложения
(() => {
  const STORAGE_KEY = "staradam_devhq_tasks_v1";
  const FOCUS_KEY = "staradam_devhq_focus_v1";

  // Все чекбоксы задач на странице
  const checkboxes = Array.from(
    document.querySelectorAll('input[type="checkbox"]')
  );

  // Нижние кнопки (в порядке: Сегодня, Направления, Статистика, Фокус)
  const bottomButtons = Array.from(
    document.querySelectorAll(".bottom-btn")
  );

  const btnToday   = bottomButtons[0] || null;
  const btnTracks  = bottomButtons[1] || null;
  const btnStats   = bottomButtons[2] || null;
  const btnFocus   = bottomButtons[3] || null;

  // Элемент для общей статистики (если есть)
  const overallProgressEl =
    document.querySelector("[data-overall-progress]") ||
    document.getElementById("overall-progress");

  // ---------- Работа с задачами ----------

  // Присваиваем каждому чекбоксу стабильный id
  checkboxes.forEach((cb, index) => {
    if (!cb.dataset.taskId) {
      cb.dataset.taskId = `task_${index}`;
    }
  });

  function loadTasksState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const saved = JSON.parse(raw);
      checkboxes.forEach((cb) => {
        const id = cb.dataset.taskId;
        if (id in saved) {
          cb.checked = !!saved[id];
        }
      });
    } catch (e) {
      console.warn("Не удалось загрузить состояние задач", e);
    }
  }

  function saveTasksState() {
    try {
      const state = {};
      checkboxes.forEach((cb) => {
        const id = cb.dataset.taskId;
        state[id] = cb.checked;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Не удалось сохранить состояние задач", e);
    }
  }

  function calcModules() {
    // Группируем задачи по «блокам» (по ближайшему секшену/карточке)
    const modules = [];

    checkboxes.forEach((cb) => {
      const container =
        cb.closest("section") ||
        cb.closest(".module-card") ||
        cb.closest(".dev-block") ||
        cb.closest(".block") ||
        document.body;

      let module = modules.find((m) => m.el === container);
      if (!module) {
        const titleEl =
          container.querySelector("h2, .block-title, .title") || null;
        const title = titleEl
          ? titleEl.textContent.trim()
          : "Без названия";

        module = {
          el: container,
          title,
          total: 0,
          done: 0,
        };
        modules.push(module);
      }

      module.total += 1;
      if (cb.checked) module.done += 1;
    });

    return modules;
  }

  function updateOverallProgress() {
    const modules = calcModules();
    let total = 0;
    let done = 0;

    modules.forEach((m) => {
      total += m.total;
      done += m.done;
    });

    if (overallProgressEl && total > 0) {
      const percent = Math.round((done / total) * 100);
      overallProgressEl.textContent = `${done} из ${total} (${percent}%)`;
    }
  }

  // ---------- Режим фокуса ----------

  function applyFocusFromStorage() {
    const val = localStorage.getItem(FOCUS_KEY);
    const on = val === "1";
    document.body.classList.toggle("focus-mode", on);
    if (btnFocus) {
      btnFocus.textContent = on ? "Фокус: ON" : "Фокус: OFF";
    }
  }

  function toggleFocus() {
    const on = !document.body.classList.contains("focus-mode");
    document.body.classList.toggle("focus-mode", on);
    localStorage.setItem(FOCUS_KEY, on ? "1" : "0");
    if (btnFocus) {
      btnFocus.textContent = on ? "Фокус: ON" : "Фокус: OFF";
    }
  }

  // ---------- Нижние кнопки ----------

  function scrollToToday() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function showTracks() {
    const modules = calcModules();
    if (!modules.length) {
      alert("Пока не нашёл ни одного блока с заданиями.");
      return;
    }

    const lines = modules.map((m) => {
      if (!m.total) return `${m.title}: 0 задач`;
      const percent = Math.round((m.done / m.total) * 100);
      return `${m.title}: ${m.done} из ${m.total} (${percent}%)`;
    });

    alert("Направления:\n\n" + lines.join("\n"));
  }

  function showStats() {
    const modules = calcModules();
    let total = 0;
    let done = 0;

    modules.forEach((m) => {
      total += m.total;
      done += m.done;
    });

    if (!total) {
      alert("Ещё нет ни одной задачи.");
      return;
    }

    const percent = Math.round((done / total) * 100);

    alert(
      `Общая статистика:\n\nВыполнено: ${done} из ${total} задач (${percent}%)`
    );
  }

  // ---------- Инициализация ----------

  function init() {
    if (!checkboxes.length) return;

    loadTasksState();
    updateOverallProgress();
    applyFocusFromStorage();

    // Сохранение задач
    checkboxes.forEach((cb) => {
      cb.addEventListener("change", () => {
        saveTasksState();
        updateOverallProgress();
      });
    });

    // Кнопки
    if (btnToday) {
      btnToday.addEventListener("click", scrollToToday);
    }
    if (btnTracks) {
      btnTracks.addEventListener("click", showTracks);
    }
    if (btnStats) {
      btnStats.addEventListener("click", showStats);
    }
    if (btnFocus) {
      btnFocus.addEventListener("click", toggleFocus);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
