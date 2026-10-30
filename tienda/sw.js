// Tienda de CYC instalable (30/10/2026). Primero la red; sin señal, lo último que se vio.
const CACHE = "tienda-v3";
self.addEventListener("install", (e) => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["./", "./icono-192.png"])).catch(() => {})); });
// Borra sólo las cachés viejas de la Tienda ("tienda-…"): el Panel vive en el mismo sitio y tiene las suyas ("cyc-…", 30/10/2026).
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("tienda-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then((r) => { if (r && r.ok) { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)).catch(() => {}); } return r; })
    .catch(() => caches.match(e.request).then((m) => m || caches.match("./"))));
});
