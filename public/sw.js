// Service worker HUD.SERVICE. Единственная задача — чтобы без интернета
// приложение открывало фирменную страницу «Нет сети», а не ошибку браузера.
// Страницы, видео и фото не кэшируются: сайт всегда живой и свежий.
const V = "hdkv-pwa-v1";
const SHELL = ["/offline.html", "/pwa/hud-192.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== V).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.mode !== "navigate") return;
  e.respondWith(fetch(e.request).catch(() => caches.match("/offline.html")));
});
