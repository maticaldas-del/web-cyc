// CYC · Ventas de hoy — widget para la pantalla de inicio del iPhone (app Scriptable, gratis)
// Lo lee de mlapi/widget/hoy, que deja el robot de CYC en cada vuelta (la misma cuenta que la tarjeta de Inicio).
// Primera vez: abrí este script DENTRO de Scriptable (tocá ▶) y poné tu mail y contraseña de CYC.
// La contraseña no se guarda: sólo queda en el llavero del iPhone la llave de sesión que da Firebase.

const API_KEY = "AIzaSyDtJyqfDbdxkyj0tyHw8F6x8jQLD_NC2FE";
const DB = "https://cyc-inventario-default-rtdb.firebaseio.com";
const WEB = "https://maticaldas-del.github.io/web-cyc/#ventaprod";
const KC = "cyc_widget_refresh";

const BG = new Color("#1d1a1e"), TXT = new Color("#f4f4f5"), MUTED = new Color("#9a98a3"), BORDE = new Color("#3a3438");

function fmt(n) { n = Math.round(Number(n) || 0); return (n < 0 ? "-" : "") + "$" + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
function pl(d) { d = String(d || ""); return /s$/.test(d) ? d : d + "s"; }
function hhmm(ts) { const d = new Date(ts); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }

async function login() {
  const a = new Alert();
  a.title = "CYC · iniciar sesión";
  a.message = "El mismo mail y contraseña de la web de CYC. La contraseña no se guarda.";
  a.addTextField("mail");
  a.addSecureTextField("contraseña");
  a.addAction("Entrar"); a.addCancelAction("Cancelar");
  if (await a.present() === -1) return false;
  const r = new Request("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + API_KEY);
  r.method = "POST"; r.headers = { "Content-Type": "application/json" };
  r.body = JSON.stringify({ email: a.textFieldValue(0).trim(), password: a.textFieldValue(1), returnSecureToken: true });
  const j = await r.loadJSON();
  if (!j.refreshToken) { const e = new Alert(); e.title = "No pude entrar"; e.message = (j.error && j.error.message) || "revisá el mail y la contraseña"; e.addAction("OK"); await e.present(); return false; }
  Keychain.set(KC, j.refreshToken);
  return true;
}

async function idToken() {
  if (!Keychain.contains(KC)) return null;
  const r = new Request("https://securetoken.googleapis.com/v1/token?key=" + API_KEY);
  r.method = "POST"; r.headers = { "Content-Type": "application/x-www-form-urlencoded" };
  r.body = "grant_type=refresh_token&refresh_token=" + encodeURIComponent(Keychain.get(KC));
  const j = await r.loadJSON();
  if (j.refresh_token) Keychain.set(KC, j.refresh_token);
  return j.id_token || null;
}

async function datos() {
  const t = await idToken();
  if (!t) return { error: "sesion" };
  const r = new Request(DB + "/mlapi/widget/hoy.json?auth=" + encodeURIComponent(t));
  const d = await r.loadJSON();
  if (!d || d.error) return { error: d && d.error ? String(d.error) : "sin datos" };
  return d;
}

// La línea de ganancia acumulada: hoy (color) contra el promedio de los últimos 5 días iguales (punteada).
function grafico(d, W, H, color) {
  const dc = new DrawContext(); dc.size = new Size(W, H); dc.opaque = false; dc.respectScreenScale = true;
  const now = new Date(), nm = now.getHours() * 60 + now.getMinutes();
  const hoy = d.hoy || [], prom = d.prom || [];
  const iFin = Math.min(96, nm / 15);
  const gA = Number(d.gan) || 0;
  const vals = [gA, ...hoy.slice(0, Math.floor(iFin) + 1), ...prom, 0];
  const ymax = Math.max(1, ...vals), ymin = Math.min(0, ...vals);
  const X = (i) => i / 96 * (W - 8) + 2, Y = (g) => H - 3 - (g - ymin) / (ymax - ymin) * (H - 10);
  if (prom.length) {   // punteada
    dc.setStrokeColor(new Color("#8a8a99", 0.85)); dc.setLineWidth(2);
    for (let i = 0; i < 96; i++) { if (i % 2) continue; const p = new Path(); p.move(new Point(X(i), Y(prom[i]))); p.addLine(new Point(X(i + 1), Y(prom[i + 1]))); dc.addPath(p); dc.strokePath(); }
  }
  const p = new Path(); p.move(new Point(X(0), Y(hoy[0] || 0)));
  for (let i = 1; i <= Math.floor(iFin); i++) p.addLine(new Point(X(i), Y(hoy[i] || 0)));
  p.addLine(new Point(X(iFin), Y(gA)));
  dc.addPath(p); dc.setStrokeColor(color); dc.setLineWidth(3); dc.strokePath();
  dc.setFillColor(color); dc.fillEllipse(new Rect(X(iFin) - 4, Y(gA) - 4, 8, 8));
  return dc.getImage();
}

function comparacion(d) {
  if (!d.prom || !d.nP) return null;
  const now = new Date(), nm = now.getHours() * 60 + now.getMinutes();
  const f = nm / 15, i = Math.floor(f), a = d.prom[Math.min(96, i)] || 0, b = d.prom[Math.min(96, i + 1)] || 0;
  const gB = a + (b - a) * (f - i);
  const dif = gB > 0 ? Math.round(((Number(d.gan) || 0) - gB) / gB * 100) : null;
  return { gB, dif, txt: `A esta hora, ${d.nP === 1 ? "el " + d.diaSem + " anterior" : "el promedio de los últimos " + d.nP + " " + pl(d.diaSem)} iba ${fmt(gB)}` };
}

function caja(w, d, grande) {
  const sc = new Color(d.scoreColor || "#8a8a99");
  const s = w.addStack(); s.layoutVertically(); s.centerAlignContent();
  s.backgroundColor = new Color(d.scoreColor || "#8a8a99", 0.14); s.borderColor = new Color(d.scoreColor || "#8a8a99", 0.45); s.borderWidth = 1.5; s.cornerRadius = 12;
  s.setPadding(6, 10, 6, 10);
  const t = s.addText(d.score == null ? "—" : String(d.score.toFixed(1)).replace(".", ",") + " /10");
  t.font = Font.heavyRoundedSystemFont(grande ? 24 : 18); t.textColor = sc;
  const n = s.addText(String(d.nivel || "")); n.font = Font.boldSystemFont(grande ? 12 : 10); n.textColor = sc; n.lineLimit = 1; n.minimumScaleFactor = 0.6;
}

function armar(d, fam) {
  const w = new ListWidget(); w.url = WEB; w.refreshAfterDate = new Date(Date.now() + 10 * 60 * 1000);
  const col = new Color(d.color || "#ef4444");
  const g = new LinearGradient(); g.colors = [new Color(d.color || "#ef4444", 0.22), BG, BG]; g.locations = [0, 0.45, 1]; g.startPoint = new Point(0, 0); g.endPoint = new Point(1, 1);
  w.backgroundGradient = g;
  const grande = fam === "large";
  if (fam === "small") {
    w.setPadding(12, 12, 12, 12);
    const h = w.addText("🏷️ HOY"); h.font = Font.heavySystemFont(11); h.textColor = col;
    w.addSpacer(4);
    const b = w.addText(fmt(d.bruto)); b.font = Font.heavyRoundedSystemFont(24); b.textColor = TXT; b.minimumScaleFactor = 0.5; b.lineLimit = 1;
    const s = w.addText(`${d.ventas} ventas · ${d.u} u.`); s.font = Font.regularMonospacedSystemFont(10); s.textColor = MUTED;
    w.addSpacer(6);
    const ga = w.addText(fmt(d.gan)); ga.font = Font.heavyRoundedSystemFont(20); ga.textColor = col; ga.minimumScaleFactor = 0.5;
    const p = w.addText(`ganancia · ${d.pct == null ? "—" : (d.pct >= 0 ? "+" : "") + Math.round(d.pct) + "%"}`); p.font = Font.regularMonospacedSystemFont(10); p.textColor = MUTED;
    w.addSpacer();
    const sc = w.addText(d.score == null ? "—" : String(d.score.toFixed(1)).replace(".", ",") + "/10 · " + String(d.nivel || "").replace(/^\S+\s/, ""));
    sc.font = Font.boldSystemFont(10); sc.textColor = new Color(d.scoreColor || "#8a8a99"); sc.lineLimit = 1; sc.minimumScaleFactor = 0.6;
    return w;
  }
  w.setPadding(grande ? 18 : 14, 16, grande ? 16 : 12, 16);
  const top = w.addStack(); top.centerAlignContent();
  const ti = top.addText("🏷️  VENTAS DE HOY"); ti.font = Font.heavySystemFont(grande ? 14 : 12); ti.textColor = col;
  top.addSpacer();
  const act = top.addText((Date.now() - (d.ts || 0) > 60 * 60 * 1000 ? "⚠️ " : "") + "al " + hhmm(d.ts || Date.now()));
  act.font = Font.regularMonospacedSystemFont(10); act.textColor = Date.now() - (d.ts || 0) > 60 * 60 * 1000 ? new Color("#f59e0b") : MUTED;
  w.addSpacer(grande ? 10 : 6);
  const fila = w.addStack(); fila.bottomAlignContent();
  const iz = fila.addStack(); iz.layoutVertically();
  const b = iz.addText(fmt(d.bruto)); b.font = Font.heavyRoundedSystemFont(grande ? 40 : 30); b.textColor = TXT; b.minimumScaleFactor = 0.5; b.lineLimit = 1;
  const s = iz.addText(`facturado · ${d.ventas} venta${d.ventas === 1 ? "" : "s"} · ${d.u} u.`); s.font = Font.regularMonospacedSystemFont(grande ? 12 : 10); s.textColor = MUTED;
  fila.addSpacer();
  if (!grande) caja(fila, d, false);
  w.addSpacer(grande ? 12 : 6);
  const f2 = w.addStack(); f2.centerAlignContent();
  const g2 = f2.addStack(); g2.layoutVertically();
  const ga = g2.addText(fmt(d.gan)); ga.font = Font.heavyRoundedSystemFont(grande ? 32 : 22); ga.textColor = col; ga.minimumScaleFactor = 0.5; ga.lineLimit = 1;
  const pc = g2.addText(`ganancia · ${d.pct == null ? "—" : (d.pct >= 0 ? "+" : "") + Math.round(d.pct) + "%"}${d.sinCosto ? " · " + d.sinCosto + " sin costo" : ""}`);
  pc.font = Font.regularMonospacedSystemFont(grande ? 12 : 10); pc.textColor = MUTED;
  f2.addSpacer();
  if (grande) caja(f2, d, true);
  else { const im = f2.addImage(grafico(d, 150, 40, col)); im.imageSize = new Size(150, 40); }
  if (grande) {
    w.addSpacer(14);
    const im = w.addImage(grafico(d, 310, 90, col)); im.imageSize = new Size(310, 90);
    const c = comparacion(d);
    if (c) {
      w.addSpacer(8);
      const st = w.addStack(); st.layoutVertically();
      const t1 = st.addText(c.txt + " de ganancia"); t1.font = Font.regularMonospacedSystemFont(11); t1.textColor = MUTED; t1.lineLimit = 2;
      if (c.dif != null) { const t2 = st.addText(`hoy ${c.dif >= 0 ? "+" : ""}${c.dif}%`); t2.font = Font.boldMonospacedSystemFont(13); t2.textColor = c.dif >= 0 ? new Color("#22c55e") : new Color("#ef4444"); }
    }
    w.addSpacer();
  } else {
    const c = comparacion(d);
    if (c && c.dif != null) { w.addSpacer(2); const t = w.addText(`vs ${d.nP} ${pl(d.diaSem)} a esta hora: ${c.dif >= 0 ? "+" : ""}${c.dif}%`); t.font = Font.regularMonospacedSystemFont(9); t.textColor = c.dif >= 0 ? new Color("#22c55e") : new Color("#ef4444"); }
  }
  return w;
}

// LA PANTALLA BLOQUEADA (20/10/2026, pedido suyo: "en la pantalla bloqueada me gustaria hacerlo mejor").
// Ahí el iPhone sólo deja tres tamaños chicos y los pinta en un solo tono: no hay fondo ni colores, así que se
// juega con el tamaño de la letra. Rectangular = facturado, ganancia y puntaje con cómo va contra el día igual;
// redondo = el puntaje con su anillo; de una línea = arriba de la hora.
function nro(n) { return String(n).replace(".", ","); }
function anillo(score) {
  const S = 120, dc = new DrawContext(); dc.size = new Size(S, S); dc.opaque = false; dc.respectScreenScale = true;
  const arco = (frac, alfa, ancho) => {
    const p = new Path(), r = S / 2 - ancho / 2 - 2, n = Math.max(2, Math.round(frac * 80)), pts = [];
    for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + 2 * Math.PI * frac * i / n; pts.push(new Point(S / 2 + r * Math.cos(a), S / 2 + r * Math.sin(a))); }
    p.addLines(pts); dc.addPath(p); dc.setStrokeColor(new Color("#ffffff", alfa)); dc.setLineWidth(ancho); dc.strokePath();
  };
  arco(1, 0.25, 10);
  if (score > 0) arco(Math.min(1, score / 10), 1, 10);
  return dc.getImage();
}
function bloqueada(d, fam) {
  const w = new ListWidget(); w.url = WEB; w.refreshAfterDate = new Date(Date.now() + 10 * 60 * 1000);
  const viejo = Date.now() - (d.ts || 0) > 60 * 60 * 1000;
  const sc = d.score == null ? "—" : nro(d.score.toFixed(1));
  const c = comparacion(d);
  if (fam === "accessoryInline") {
    w.addText(`${viejo ? "⚠️ " : ""}🏷️ ${fmt(d.bruto)} · gan ${fmt(d.gan)} · ${sc}/10`);
    return w;
  }
  if (fam === "accessoryCircular") {
    w.backgroundImage = anillo(d.score || 0);
    w.addSpacer();
    const t = w.addText(sc); t.font = Font.heavyRoundedSystemFont(20); t.centerAlignText(); t.minimumScaleFactor = 0.6;
    const n = w.addText(viejo ? "⚠️" : "/10"); n.font = Font.boldSystemFont(9); n.centerAlignText();
    w.addSpacer();
    return w;
  }
  // rectangular: lo que más mira, de mayor a menor
  const f1 = w.addStack(); f1.centerAlignContent();
  const b = f1.addText(fmt(d.bruto)); b.font = Font.heavyRoundedSystemFont(17); b.lineLimit = 1; b.minimumScaleFactor = 0.6;
  f1.addSpacer();
  const v = f1.addText(`${viejo ? "⚠️ " : ""}${d.ventas} v`); v.font = Font.boldSystemFont(11);
  const g = w.addText(`gan ${fmt(d.gan)} · ${d.pct == null ? "—" : (d.pct >= 0 ? "+" : "") + Math.round(d.pct) + "%"}`);
  g.font = Font.boldSystemFont(13); g.lineLimit = 1; g.minimumScaleFactor = 0.6;
  const vs = c && c.dif != null ? ` · ${c.dif >= 0 ? "+" : ""}${c.dif}% vs ${d.diaSem ? d.diaSem.slice(0, 3) : "antes"}` : "";
  const p = w.addText(`${sc}/10 ${String(d.nivel || "").replace(/^\S+\s/, "")}${vs}`);
  p.font = Font.systemFont(11); p.lineLimit = 1; p.minimumScaleFactor = 0.6;
  return w;
}

function aviso(txt) {
  if (/^accessory/.test(config.widgetFamily || "")) { const a = new ListWidget(); a.addText("CYC · " + (/sesi/.test(txt) ? "abrí Scriptable" : "sin datos")).font = Font.boldSystemFont(12); return a; }
  const w = new ListWidget(); w.backgroundColor = BG; w.setPadding(14, 14, 14, 14);
  const t = w.addText("CYC"); t.font = Font.heavySystemFont(16); t.textColor = new Color("#22c55e");
  w.addSpacer(6);
  const m = w.addText(txt); m.font = Font.systemFont(12); m.textColor = MUTED;
  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
  return w;
}

let w;
if (config.runsInApp && !Keychain.contains(KC)) await login();
let d = null;
try { d = await datos(); } catch (e) { d = { error: String(e) }; }
if (config.runsInApp && d && d.error === "sesion" && await login()) { try { d = await datos(); } catch (e) { d = { error: String(e) }; } }
if (d && d.error === "sesion") w = aviso("Abrí Scriptable y tocá este script para iniciar sesión.");
else if (!d || d.error) w = aviso("No pude leer las ventas (" + (d && d.error) + "). Reintento solo.");
else if (/^accessory/.test(config.widgetFamily || "")) w = bloqueada(d, config.widgetFamily);
else w = armar(d, config.widgetFamily || "large");
if (config.runsInWidget) Script.setWidget(w);
else await w.presentLarge();
Script.complete();
