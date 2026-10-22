// Общие части чата для index.html и admin-chat.html: вложения (файлы и скриншоты) и push-уведомления.
// Файлы лежат в публичном хранилище Supabase «chat-files» (до 20 МБ), большие фото перед загрузкой ужимаются.
// Уведомления: подписка браузера (Web Push) сохраняется в базе, рассылает их функция chat-push.
window.ChatKit = (function () {
  const API = window.QUIZ_API;
  const BUCKET = "chat-files";
  const MAX = 20 * 1024 * 1024;
  const VAPID = "BIkNkGMHVLpOy3XYhR03Lo3nSgP70fPe4wos5xW9nzaHUpcKeD9HxK3_MSrgG02K538SX-bgZ5pcWUQBLHwL7lc";
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- вложения
  const fileUrl = path => API.url + "/storage/v1/object/public/" + BUCKET + "/" + path.split("/").map(encodeURIComponent).join("/");
  const isImage = type => /^image\/(png|jpeg|gif|webp)$/.test(type || "");
  const size = n => n >= 1048576 ? (n / 1048576).toFixed(1).replace(".", ",") + " МБ" : Math.max(1, Math.round(n / 1024)) + " КБ";

  // типы файлов, которые принимает хранилище; у .fig/.ai браузер часто не знает тип — уходит как octet-stream
  const TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/heic", "image/heif", "application/pdf", "application/zip",
    "application/x-zip-compressed", "application/octet-stream", "application/postscript", "application/illustrator",
    "application/vnd.adobe.illustrator", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.ms-powerpoint",
    "text/plain", "video/mp4", "video/quicktime"];

  // фото больше 1,5 МБ ужимаем до 2000 px по длинной стороне (gif не трогаем — сломается анимация)
  function shrink(file) {
    if (!/^image\/(png|jpeg|webp|heic|heif)$/.test(file.type) || file.size < 1.5 * 1024 * 1024) return Promise.resolve(file);
    return new Promise(resolve => {
      const img = new Image(), src = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, 2000 / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(src);
        c.toBlob(b => resolve(b && b.size < file.size
          ? new File([b], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : file), "image/jpeg", 0.86);
      };
      img.onerror = () => { URL.revokeObjectURL(src); resolve(file); };
      img.src = src;
    });
  }

  function safeName(name) {
    const m = /(\.[A-Za-z0-9]{1,8})$/.exec(name), ext = m ? m[1].toLowerCase() : "";
    const base = name.slice(0, name.length - ext.length).normalize("NFKD").replace(/[^\w.-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 60);
    return (base || "file") + ext;
  }
  const uuid = () => crypto.randomUUID ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));

  // загружает файл, возвращает { path, name } для chat_send / chat_admin_send; ошибки — понятным текстом
  async function upload(original) {
    const file = await shrink(original);
    const type = file.type || "application/octet-stream";
    if (!TYPES.includes(type)) throw new Error("Такой тип файла нельзя загрузить. Подойдут картинки, PDF, ZIP, документы, видео, .fig и .ai.");
    if (file.size > MAX) throw new Error("Файл больше 20 МБ. Загрузите его в облако и пришлите ссылку.");
    const path = "u/" + uuid() + "/" + safeName(file.name || "screenshot.png");
    const res = await fetch(API.url + "/storage/v1/object/" + BUCKET + "/" + path, {
      method: "POST", headers: { apikey: API.key, "Content-Type": type, "x-upsert": "false" }, body: file
    });
    if (!res.ok) throw new Error(res.status === 413 ? "Файл больше 20 МБ." : "Не получилось загрузить файл. Проверьте интернет и попробуйте ещё раз.");
    return { path, name: (original.name || "Скриншот").slice(0, 140) };
  }

  // вложение внутри сообщения: картинка превью или карточка файла
  function attachment(m) {
    if (!m.file_path) return "";
    const url = fileUrl(m.file_path);
    if (isImage(m.file_type)) return `<a class="att-img" href="${url}" target="_blank" rel="noopener"><img src="${url}" alt="${esc(m.file_name || "Изображение")}" loading="lazy"></a>`;
    const ext = ((/\.(\w{1,5})$/.exec(m.file_name || "") || [])[1] || "файл").toUpperCase();
    return `<a class="att-file" href="${url}" target="_blank" rel="noopener" download="${esc(m.file_name || "")}">
      <span class="att-ext">${esc(ext)}</span><span class="grow"><b>${esc(m.file_name || "Файл")}</b><small>${m.file_size ? size(m.file_size) + " · " : ""}скачать</small></span></a>`;
  }

  // ---------- push-уведомления
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const pushSupported = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

  function key() {
    const s = (VAPID + "=".repeat((4 - VAPID.length % 4) % 4)).replace(/-/g, "+").replace(/_/g, "/");
    return Uint8Array.from(atob(s), c => c.charCodeAt(0));
  }
  async function registration() {
    if (!navigator.serviceWorker.controller) await navigator.serviceWorker.register("sw.js");
    return navigator.serviceWorker.ready;
  }

  // "on" | "off" | "denied" | "ios-install" (на iPhone — только из приложения на экране «Домой») | "unsupported"
  async function pushState() {
    if (!pushSupported()) return isIOS && !standalone() ? "ios-install" : "unsupported";
    if (Notification.permission === "denied") return "denied";
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = reg && await reg.pushManager.getSubscription();
      return sub && Notification.permission === "granted" ? "on" : "off";
    } catch (e) { return "off"; }
  }

  // save(sub) — сохранить подписку в базе (у студента и у преподавателя разные RPC)
  async function enablePush(save) {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return perm === "denied" ? "denied" : "off";
    const reg = await registration();
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key() });
    await save(sub.toJSON());
    return "on";
  }
  async function disablePush() {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = reg && await reg.pushManager.getSubscription();
    if (sub) {
      await window.quizRpc("push_unsubscribe", { p_endpoint: sub.endpoint }).catch(() => {});
      await sub.unsubscribe().catch(() => {});
    }
    return "off";
  }
  // если сменили имя — обновить подпись в подписке, чтобы не приходили уведомления о своих сообщениях
  async function refreshPush(save) {
    try {
      const reg = pushSupported() && Notification.permission === "granted" && await navigator.serviceWorker.getRegistration();
      const sub = reg && await reg.pushManager.getSubscription();
      if (sub) await save(sub.toJSON());
    } catch (e) {}
  }

  const PUSH_TEXT = {
    on: ["🔔", "Уведомления включены", "нажмите, чтобы выключить"],
    off: ["🔕", "Включить уведомления", "о новых сообщениях и объявлениях"],
    denied: ["🔕", "Уведомления запрещены", "разрешите их в настройках браузера для этого сайта"],
    "ios-install": ["🔕", "Уведомления на iPhone", "работают, только если открыть приложение с экрана «Домой»"],
    unsupported: ["🔕", "Уведомления недоступны", "этот браузер их не поддерживает"]
  };
  // кнопка-строка: рисует состояние и переключает его по нажатию
  async function pushButton(el, save) {
    const draw = st => {
      const [ic, t, s] = PUSH_TEXT[st];
      el.dataset.state = st;
      el.innerHTML = `<span class="sw" style="background:var(--${st === "on" ? "mint" : "white"})">${ic}</span><span class="grow">${t}<small>${s}</small></span>`;
      el.disabled = !(st === "on" || st === "off");
    };
    draw(await pushState());
    el.onclick = async () => {
      const st = el.dataset.state;
      el.disabled = true;
      try { draw(st === "on" ? await disablePush() : await enablePush(save)); }
      catch (e) { draw(await pushState()); }
    };
  }

  return { upload, attachment, fileUrl, pushState, enablePush, disablePush, refreshPush, pushButton };
})();
