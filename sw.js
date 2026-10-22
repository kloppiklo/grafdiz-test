// Service worker: делает сайт устанавливаемым приложением.
// Сначала всегда идём в сеть, чтобы студенты видели свежие тесты;
// кэш нужен только чтобы оболочка открывалась при плохом интернете.
// Запросы к базе (другой домен) не трогаем.
const CACHE = "grafdiz-v28";
const SHELL = ["./", "index.html", "test.html", "theory.html", "otrabotka.html", "style.css", "tests.js", "config.js", "chat-kit.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png",
  "icons/app-192.png", "icons/app-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }))
  );
});

// Push-уведомления чата (присылает функция chat-push в Supabase). Нажатие открывает вкладку «Чат».
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || "Чат группы", {
    body: d.body || "Новое сообщение",
    tag: d.tag, icon: "icons/icon-192.png", badge: "icons/icon-192.png",
    data: { url: new URL(d.url || "./#chat", self.registration.scope).href }
  }));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    const page = url.split("#")[0];
    const win = list.find(c => c.url.split("#")[0] === page) ||
      (page.endsWith("admin-chat.html") ? null : list.find(c => c.url.startsWith(self.registration.scope) && !/admin/.test(c.url)));
    if (!win) return self.clients.openWindow(url);
    return win.navigate(url).then(w => (w || win).focus()).catch(() => win.focus());
  }));
});
