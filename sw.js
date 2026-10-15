// Service worker: делает сайт устанавливаемым приложением.
// Сначала всегда идём в сеть, чтобы студенты видели свежие тесты;
// кэш нужен только чтобы оболочка открывалась при плохом интернете.
// Запросы к базе (другой домен) не трогаем.
const CACHE = "grafdiz-v6";
const SHELL = ["./", "index.html", "test.html", "theory.html", "otrabotka.html", "style.css", "tests.js", "config.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];

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
