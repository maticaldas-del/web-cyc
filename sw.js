// Service worker de CYC: cachea la app (mismo origen) para que abra como app instalada.
const CACHE = "cyc-v1223";
const ARCHIVOS = [".", "index.html", "manifest.webmanifest", "icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((claves) =>
      // Sólo las del panel ("cyc-…"): la Tienda vive en el mismo sitio y tiene las suyas ("tienda-…", 30/10/2026).
      Promise.all(claves.filter((k) => k.startsWith("cyc-") && k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Solo interceptamos archivos propios (mismo origen). Todo lo externo —Firebase (googleapis),
// el SDK de jsdelivr, Chart.js, Google Fonts— va directo a la red para no romper la sync.
// ⏱️ RED CON PLAZO (03/11/2026, él con la foto del teléfono de Tito: la app instalada se quedaba en la pantalla del ícono "CYC"). Antes
// se esperaba a la red SIN límite: con señal floja (4G con una rayita) el panel (2,8 MB) no terminaba de bajar y no se mostraba nada.
// Ahora: si hay copia guardada y la red no contesta en 2,5 s, se abre lo guardado; la red sigue atrás y guarda lo nuevo para la próxima
// (y la vigía de versión recarga sola si cambió). Sin copia, se espera a la red como antes.
function redConPlazo(e, ms, guardar) {
  const red = fetch(e.request).then((resp) => {
    if (guardar && resp && (resp.ok || resp.type === "opaque")) { const copia = resp.clone(); caches.open(CACHE).then((c) => c.put(e.request, copia)); }
    return resp;
  });
  const guardado = caches.match(e.request, { ignoreSearch: e.request.mode === "navigate" })
    .then((r) => r || (e.request.mode === "navigate" ? caches.match("index.html") : null));
  e.waitUntil(red.catch(() => {}));
  return new Promise((ok) => {
    let listo = false;
    const dar = (r) => { if (!listo && r) { listo = true; ok(r); } };
    red.then(dar).catch(() => guardado.then((g) => { if (g) dar(g); else if (!listo) { listo = true; ok(Response.error()); } }));
    setTimeout(() => guardado.then(dar), ms);
  });
}

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  // 📴 (03/11/2026, él: "que se pueda entrar sin internet"): los programas de Firebase y Chart.js (jsdelivr, con versión fija) se guardan
  // también. Las LECTURAS de la base (googleapis/firebaseio) siguen yendo siempre a la red.
  if (url.hostname === "cdn.jsdelivr.net" && /\/npm\/(firebase@|chart\.js@)/.test(url.pathname)) { e.respondWith(redConPlazo(e, 2500, true)); return; }
  if (url.origin !== location.origin) return; // externo → red directa
  // La tienda pública (/tienda/, 30/10/2026) es otra página: este service worker no la cachea ni le contesta con el panel.
  if (/\/tienda(\/|$)/.test(url.pathname)) return;
  e.respondWith(redConPlazo(e, 2500, true));
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
