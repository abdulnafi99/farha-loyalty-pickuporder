/* Service worker — cache app shell supaya boleh dibuka luar talian.
   Naikkan VERSION setiap kali anda kemas kini index.html. */
const VERSION = "farha-v1.7.4";
const SHELL = ["./", "./index.html", "./admin.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
/* Notifikasi: klik → buka / fokus app di skrin yang betul */
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const d = e.notification.data || {}, url = new URL(d.url || "./", self.registration.scope).href, page = url.split("#")[0];
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    const c = list.find(w => w.url.split("#")[0] === page);
    if (c) { c.postMessage({ type: "open", order: d.order || null, url }); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
/* Push dari server (Firebase Cloud Messaging / Web Push). Payload: { title, body, url, order, tag } */
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : "" }; }
  const n = d.notification || d, data = d.data || d;
  e.waitUntil(self.registration.showNotification(n.title || "Farha", {
    body: n.body || "", icon: "icons/icon-192.png", badge: "icons/icon-192.png", tag: n.tag || data.tag,
    data: { url: data.url || "./", order: data.order || null },
  }));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  // Halaman: network dahulu, fallback cache. Aset lain: cache dahulu.
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match("./index.html"))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok && (req.url.startsWith(self.location.origin) || req.url.includes("fonts.g"))) {
      const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy));
    }
    return r;
  }).catch(() => hit)));
});
