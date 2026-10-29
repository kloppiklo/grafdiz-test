// Список тестов курса. Чтобы добавить тест: файл questions/<id>.js,
// строка здесь со status: "open" и ключ ответов в базе для этого id.
// theory — необязательная ссылка на презентацию с теорией (папка materials/).
// extras — дополнительные материалы для вкладки «Теория»: kind = workbook (рабочая тетрадь), task (задание для группы), practice (практика пары),
//   deck (ещё одна презентация: id + src, открывается через theory.html?t=<тема>&d=<id>).
//   block — подзаголовок блока внутри темы (например, пара); theoryBlock — блок основной презентации. Отработка и тест попадают в «Вся тема».
// otr — id отработки этой темы (см. OTRABOTKI). Модуль берётся из подписи module: «Модуль N · …».
window.TESTS = [
  {
    id: "module1", status: "open", color: "yellow",
    title: "Визуальное мышление", module: "Модуль 1 · пары 01–04", count: 10,
    topics: ["Введение", "Композиция", "Контраст", "Иерархия"], otr: "m1"
  },
  {
    id: "grid", status: "open", color: "lavender",
    title: "Модульная сетка", module: "Модуль 2 · сетка", count: 12,
    topics: ["Модуль", "История", "Принципы"],
    theory: "materials/grid.html", otr: "grid"
  },
  {
    id: "color", status: "open", color: "pink",
    title: "Цвет", module: "Модуль 2 · цвет", count: 12,
    topics: ["Свет и глаз", "Цветовой круг", "Схемы", "Модели", "Психология"],
    theory: "materials/color.html", theoryBlock: "Пары 06–07 · Основы цвета",
    extras: [
      { kind: "deck", id: "comm", title: "Цвет как коммуникация", note: "пара 08: разминка, теория, приёмы Figma", href: "theory.html?t=color&d=comm", src: "materials/color-communication.html", short: "Пара 08", block: "Пара 08 · Цвет как коммуникация" },
      { kind: "practice", title: "Один объект — три сообщения", note: "пара 08: карточка товара вместе, затем серия из 3 плакатов", href: "task-color-message.html", short: "Практика 08", block: "Пара 08 · Цвет как коммуникация" },
      { kind: "workbook", title: "Рабочая тетрадь «Цвет»", note: "PDF для печати, 12 страниц", href: "materials/color-workbook.pdf", block: "Пары 06–07 · Основы цвета" },
      { kind: "task", title: "Цветовое агентство", note: "работа в группах в Figma", href: "group-color.html", short: "Задание", block: "Пары 06–07 · Основы цвета" }
    ], otr: "color"
  },
  { id: "module2", status: "soon", color: "pink", title: "Типографика", module: "Модуль 2 · пары 09–11" },
  { id: "module3", status: "soon", color: "lavender", title: "Изображение и графическая система", module: "Модуль 3 · пары 12–17" },
  { id: "module4", status: "soon", color: "mint", title: "Illustrator и векторное мышление", module: "Модуль 4 · пары 18–25" },
  { id: "module5", status: "soon", color: "peach", title: "Плакат", module: "Модуль 5 · пары 26–29" },
  { id: "module6", status: "soon", color: "blue", title: "Айдентика", module: "Модуль 6 · пары 30–33" }
];

// Отработки пропущенных занятий: содержимое в otrabotki/<id>.js, страница otrabotka.html?m=<id>.
// Сданные работы лежат в базе (quiz.submissions), проверка — в admin-otr.html.
window.OTRABOTKI = [
  { id: "m1", status: "open", color: "yellow", title: "Визуальное мышление", module: "Модуль 1 · пары 01–04", pairs: 4 },
  { id: "color", status: "open", color: "pink", title: "Колористика", module: "Модуль 2 · цвет", pairs: 4 },
  { id: "grid", status: "open", color: "lavender", title: "Модульная сетка", module: "Модуль 2 · сетка", pairs: 2 }
];

// Модули курса — для вкладки «Теория» (материалы сгруппированы по модулям, внутри — по темам)
window.MODULES = [
  { n: 1, title: "Визуальное мышление", pairs: "пары 01–04", color: "yellow" },
  { n: 2, title: "Сетка, цвет, типографика", pairs: "пары 05–11", color: "pink" },
  { n: 3, title: "Изображение, система, проект №1", pairs: "пары 12–17", color: "lavender" },
  { n: 4, title: "Illustrator и векторное мышление", pairs: "пары 18–25", color: "mint" },
  { n: 5, title: "Плакат", pairs: "пары 26–29", color: "peach" },
  { n: 6, title: "Айдентика и итоговый кейс", pairs: "пары 30–33", color: "blue" }
];
window.moduleOf = item => Number((String(item.module || "").match(/Модуль\s*(\d)/) || [])[1]) || 0;

// Имя студента запоминается на устройстве для всех тестов
window.Student = {
  KEY: "quiz_student",
  get() { try { return JSON.parse(localStorage.getItem(this.KEY)) || { first: "", last: "" }; } catch (e) { return { first: "", last: "" }; } },
  set(first, last) { try { localStorage.setItem(this.KEY, JSON.stringify({ first, last })); } catch (e) {} }
};
window.quizStoreKey = id => "quiz_" + id + "_v2";

// Фото профиля: хранится только на этом устройстве (квадрат 320 px, JPEG в localStorage), на сервер не уходит
window.Avatar = {
  KEY: "quiz_avatar",
  get() { try { return localStorage.getItem(this.KEY) || ""; } catch (e) { return ""; } },
  set(dataUrl) { try { localStorage.setItem(this.KEY, dataUrl); return true; } catch (e) { return false; } },
  clear() { try { localStorage.removeItem(this.KEY); } catch (e) {} },
  // обрезает фото по центру до квадрата и уменьшает
  fromFile(file, size = 320) {
    return new Promise((resolve, reject) => {
      if (!file || !/^image\//.test(file.type)) return reject(new Error("not an image"));
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const s = Math.min(img.naturalWidth, img.naturalHeight);
        const c = document.createElement("canvas");
        c.width = c.height = size;
        c.getContext("2d").drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, size, size);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("bad image")); };
      img.src = url;
    });
  }
};

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
