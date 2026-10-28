// Service worker de CYC: cachea la app (mismo origen) para que abra como app instalada.
const CACHE = "cyc-v1053";
const ARCHIVOS = [".", "index.html", "manifest.webmanifest", "icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((claves) =>
      Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Solo interceptamos archivos propios (mismo origen). Todo lo externo —Firebase (googleapis),
// el SDK de jsdelivr, Chart.js, Google Fonts— va directo a la red para no romper la sync.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // externo → red directa
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        const copia = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copia));
        return resp;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("index.html")))
  );
});

// EL AVISO DE CADA VENTA, QUE VIBRA Y SUENA (15/10/2026, pedido suyo). Lo manda el robot por "push";
// acá sólo se muestra. Al tocarlo abre la app (o la trae al frente) en Ventas x Producto.
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "🔔 CYC", {
    body: d.body || "",
    tag: d.tag || "cyc",
    icon: "icon.svg",
    badge: "icon.svg",
    // 28/10/2026 (él: "el volumen de los avisos se escucha muy bajo"): la web NO puede elegir el volumen ni el sonido (usa el de las
    // notificaciones del teléfono); lo que sí: vibrar más largo y que vuelva a sonar aunque haya otro aviso igual sin leer.
    vibrate: [400, 150, 400, 150, 400],
    renotify: true,
    data: { url: d.url || "./" },
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "./";
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((ls) => {
    for (const c of ls) { if ("focus" in c) { c.postMessage({ cycIr: "ventaprod" }); return c.focus(); } }
    return clients.openWindow(url);
  }));
});
