// Список тестов курса. Чтобы добавить тест: файл questions/<id>.js,
// строка здесь со status: "open" и ключ ответов в базе для этого id.
// theory — необязательная ссылка на презентацию с теорией (папка materials/).
window.TESTS = [
  {
    id: "module1", status: "open", color: "yellow",
    title: "Визуальное мышление", module: "Модуль 1 · пары 01–04", count: 10,
    topics: ["Введение", "Композиция", "Контраст", "Иерархия"]
  },
  {
    id: "color", status: "open", color: "pink",
    title: "Цвет", module: "Модуль 2 · цвет", count: 12,
    topics: ["Свет и глаз", "Цветовой круг", "Схемы", "Модели", "Психология"],
    theory: "materials/color.html"
  },
  { id: "module2", status: "soon", color: "pink", title: "Сетка и типографика", module: "Модуль 2 · пары 05–10" },
  { id: "module3", status: "soon", color: "lavender", title: "Изображение и графическая система", module: "Модуль 3 · пары 11–16" },
  { id: "module4", status: "soon", color: "mint", title: "Illustrator и векторное мышление", module: "Модуль 4 · пары 17–24" },
  { id: "module5", status: "soon", color: "peach", title: "Плакат", module: "Модуль 5 · пары 25–28" },
  { id: "module6", status: "soon", color: "blue", title: "Айдентика", module: "Модуль 6 · пары 29–32" }
];

// Отработки пропущенных занятий: содержимое в otrabotki/<id>.js, страница otrabotka.html?m=<id>.
// Сданные работы лежат в базе (quiz.submissions), проверка — в admin-otr.html.
window.OTRABOTKI = [
  { id: "m1", status: "open", color: "yellow", title: "Визуальное мышление", module: "Модуль 1 · пары 01–04", pairs: 4 }
];

// Имя студента запоминается на устройстве для всех тестов
window.Student = {
  KEY: "quiz_student",
  get() { try { return JSON.parse(localStorage.getItem(this.KEY)) || { first: "", last: "" }; } catch (e) { return { first: "", last: "" }; } },
  set(first, last) { try { localStorage.setItem(this.KEY, JSON.stringify({ first, last })); } catch (e) {} }
};
window.quizStoreKey = id => "quiz_" + id + "_v2";

// Сдачи отработок на этом устройстве: [{ id, token, task, link, at }] — по ним студент видит статус проверки
window.OtrStore = {
  key: m => "otr_" + m + "_subs",
  get(m) { try { return JSON.parse(localStorage.getItem(this.key(m))) || []; } catch (e) { return []; } },
  add(m, item) { const list = this.get(m); list.push(item); try { localStorage.setItem(this.key(m), JSON.stringify(list)); } catch (e) {} return list; }
};

// Приложение на телефоне: регистрируем service worker (см. sw.js)
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
