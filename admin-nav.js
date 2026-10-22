// Меню преподавателя: на компьютере слева, на телефоне внизу (те же стили .tabbar, что у учеников).
// Подключается на всех страницах admin*.html; активный пункт — по имени страницы и #вкладке журнала.
(function () {
  const ICON = {
    perf: '<path d="M5 19V11M12 19V5M19 19v-6"/>',
    journal: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16M9 4v16M8.5 13.5l1 1 2-2"/>',
    schedule: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    tests: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
    otr: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM8.5 12l2 2 4-4M8.5 17h7"/>',
    chat: '<path d="M5 5h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-8l-4 3v-3H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/>',
    report: '<path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    app: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>'
  };
  const ITEMS = [
    ["perf", "Успеваемость", "admin-journal.html#perf"],
    ["journal", "Журнал", "admin-journal.html#journal"],
    ["tests", "Тесты", "admin.html"],
    ["otr", "Отработки", "admin-otr.html"],
    ["chat", "Чат", "admin-chat.html"],
    ["report", "Отчёты", "admin-report.html"]
  ];
  const page = location.pathname.split("/").pop() || "admin.html";
  function active() {
    if (page === "admin-journal.html") return location.hash === "#journal" ? "journal" : "perf";
    return { "admin.html": "tests", "admin-otr.html": "otr", "admin-chat.html": "chat", "admin-report.html": "report" }[page] || "";
  }
  const svg = id => `<span class="ti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[id]}</svg></span>`;
  const nav = document.createElement("nav");
  nav.className = "tabbar admin-nav";
  nav.setAttribute("aria-label", "Разделы преподавателя");
  function render() {
    const cur = active();
    nav.innerHTML = `<a class="tab-brand" href="admin-journal.html#perf"><img src="icons/icon-192.png" alt="">Граф.<em>дизайн</em></a>
      <p class="nav-role">Преподаватель</p>` +
      ITEMS.map(([id, label, href]) => `<a class="tab ${id === cur ? "on" : ""}" href="${href}" ${id === cur ? 'aria-current="page"' : ""}>${svg(id)}${label}</a>`).join("") +
      `<span class="nav-sp"></span><a class="tab wide-only" href="./">${svg("app")}Приложение учеников</a>`;
  }
  render();
  document.body.appendChild(nav);
  document.body.classList.add("has-tabs");
  window.addEventListener("hashchange", render);
})();
