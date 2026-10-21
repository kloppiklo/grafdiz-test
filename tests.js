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
  {
    id: "grid", status: "open", color: "lavender",
    title: "Модульная сетка", module: "Модуль 2 · сетка", count: 12,
    topics: ["Модуль", "История", "Принципы"],
    theory: "materials/grid.html"
  },
  { id: "module2", status: "soon", color: "pink", title: "Типографика", module: "Модуль 2 · пары 08–10" },
  { id: "module3", status: "soon", color: "lavender", title: "Изображение и графическая система", module: "Модуль 3 · пары 11–16" },
  { id: "module4", status: "soon", color: "mint", title: "Illustrator и векторное мышление", module: "Модуль 4 · пары 17–24" },
  { id: "module5", status: "soon", color: "peach", title: "Плакат", module: "Модуль 5 · пары 25–28" },
  { id: "module6", status: "soon", color: "blue", title: "Айдентика", module: "Модуль 6 · пары 29–32" }
];

// Отработки пропущенных занятий: содержимое в otrabotki/<id>.js, страница otrabotka.html?m=<id>.
// Сданные работы лежат в базе (quiz.submissions), проверка — в admin-otr.html.
window.OTRABOTKI = [
  { id: "m1", status: "open", color: "yellow", title: "Визуальное мышление", module: "Модуль 1 · пары 01–04", pairs: 4 },
  { id: "color", status: "open", color: "pink", title: "Колористика", module: "Модуль 2 · цвет", pairs: 4 },
  { id: "grid", status: "open", color: "lavender", title: "Модульная сетка", module: "Модуль 2 · сетка", pairs: 2 }
];

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
