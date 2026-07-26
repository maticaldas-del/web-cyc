// ROBOT DE VENTAS (Fase 1): trae las ventas nuevas de las 4 cuentas de ML y
// las escribe en el panel (ventaprod/…), en el mismo formato que la carga manual.
// Las métricas de la app se calculan solas a partir de eso.
//
// Corre en GitHub Actions. Sin IA, sin tokens.
// Requiere secrets: ML_CLIENT_ID, ML_CLIENT_SECRET,
//   FIREBASE_API_KEY, FIREBASE_DB_URL, FIREBASE_BOT_EMAIL, FIREBASE_BOT_PASSWORD

import { fbSignIn, makeDB, mlRefresh, mlGet, ML_API } from './lib.mjs';

const {
  ML_CLIENT_ID, ML_CLIENT_SECRET,
  FIREBASE_API_KEY, FIREBASE_DB_URL, FIREBASE_BOT_EMAIL, FIREBASE_BOT_PASSWORD,
} = process.env;

// DRY_RUN=1 → NO escribe ventas: solo muestra total/neto/comisión de cada una
// para verificar contra ML antes de cargar nada. (Los tokens sí se guardan igual,
// porque ML rota el refresh_token en cada renovación.)
const DRY = !!process.env.DRY_RUN;

// ── helpers de texto y fecha ──────────────────────────────────────────────
const norm = (s) => (s || '')
  .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9 ]/g, ' ')
  .replace(/(\d+)\s*(gb|tb|mb|ml|cm|mm|w|v)\b/g, '$1$2') // "8 gb" -> "8gb"
  .replace(/\s+/g, ' ').trim();
// mismas claves de inventario que la app: prodId__Cuenta y prodId__Cuenta__v__Variante
const sid = (s) => String(s).replace(/[^a-z0-9]/gi, '_');

// Fecha local Argentina (UTC-3) → clave YYYY_MM_DD que usa la app.
function dayKeyFromISO(iso) {
  const d = new Date(iso);
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(d).reduce((o, x) => (o[x.type] = x.value, o), {});
  return `${p.year}_${p.month}_${p.day}`;
}

// ── matching publicación → producto interno POR PALABRAS EN COMÚN ──────────
// Palabras genéricas que no ayudan a distinguir (no cuentan para el match).
const STOP = new Set(['de','con','y','la','el','los','las','para','en','del','al',
  'un','una','x','color','negro','blanco','gris','rojo','azul','verde','celeste',
  'pc','set','the','memoria','luz','led','2','0','1','o','a','tipo','marca',
  'usb','hub','bluetooth','wireless','inalambrico','inalambrica','inalambricos',
  'inalambricas','recargable','flexible','micro','mini','original','premium']);
function toks(s) {
  return [...new Set(norm(s).split(' ').filter((t) => t.length >= 2 && !STOP.has(t)))];
}
function buildProductIndex(products) {
  return (products || [])
    .map((p) => ({ p, toks: toks(p.name) }))
    .filter((x) => x.toks.length);
}
// Devuelve el producto si hay un ganador CLARO (gana al segundo por margen);
// si empatan (ambiguo) o nadie llega a 2 palabras, devuelve null → va a revisión.
function matchProduct(title, index) {
  const tt = new Set(toks(title));
  let best = null, bestScore = 0, second = 0;
  for (const x of index) {
    let s = 0;
    for (const tk of x.toks) if (tt.has(tk)) s++;
    if (s > bestScore) { second = bestScore; bestScore = s; best = x; }
    else if (s > second) { second = s; }
  }
  if (best && bestScore >= 2 && bestScore > second) return best.p;
  // producto de una sola palabra distintiva (ej "Chispero", "B39", "P47")
  if (best && bestScore >= 1 && best.toks.length === 1 && bestScore > second) return best.p;
  return null;
}
// candidatos ordenados (para la lista de revisión de las ambiguas)
function candidatesFor(title, index) {
  const tt = new Set(toks(title));
  return index.map((x) => {
    let s = 0; for (const tk of x.toks) if (tt.has(tk)) s++;
    return { id: x.p.id, name: x.p.name, s };
  }).filter((o) => o.s > 0).sort((a, b) => b.s - a.s).slice(0, 4).map(({ id, name }) => ({ id, name }));
}

// variante de la venta de ML (color/medida) mapeada a una variante del producto
function mlVariant(it, p) {
  const vs = (p && p.variantes) || [];
  if (!vs.length) return '';
  const attrs = it.item?.variation_attributes || [];
  const vals = attrs.map((a) => norm(a.value_name || ''));
  for (const v of vs) if (vals.includes(norm(v))) return v;
  return '';
}
// costo en pesos = "costo real full" de la app × dólar × cantidad.
// La app ya guarda costFullUSD (incluye envío/embalaje y el % devolución en vivo);
// lo usamos tal cual para que el margen coincida con lo que ves. Si no está,
// lo reconstruimos: costUSD × (1 + %dev) + envío.
function costoPesos(p, qty, tc) {
  if (!p) return { costo: 0, costBaseUSD: 0, shipUSD: 0 };
  const costUSD = parseFloat(p.costUSD) || 0;
  const shipUSD = parseFloat(p.shipUSD) || 0;
  let fullUSD;
  if (p.costFullUSD != null && p.costFullUSD !== '') {
    fullUSD = parseFloat(p.costFullUSD) || 0;
  } else {
    const devPct = parseFloat(p.devPct) || 0;
    fullUSD = costUSD * (1 + devPct / 100) + shipUSD;
  }
  return { costo: Math.round(fullUSD * tc * qty), costBaseUSD: costUSD, shipUSD };
}

// ── Subir el precio en ML para llegar al margen objetivo ───────────────────
// Sube (nunca baja) el precio de la publicación/variante. Multiplicador =
// costo_full × (1+meta) / neto_real. Devuelve {ok, from, to} o {ok:false, err}.
async function raisePrice(itemId, variationId, multiplier, token) {
  let item;
  try { item = await mlGet('/items/' + itemId + '?attributes=id,price,status,variations', token); }
  catch { return { ok: false, err: 'sin-item' }; }
  if (item.status === 'closed') return { ok: false, err: 'cerrada' };
  let base, body, to;
  const round10 = (x) => Math.ceil(x / 10) * 10;
  if (variationId && (item.variations || []).length) {
    const v = item.variations.find((x) => String(x.id) === String(variationId));
    if (!v || !v.price) return { ok: false, err: 'sin-variante' };
    base = v.price; to = round10(base * multiplier);
    body = { variations: [{ id: v.id, price: to }] };
  } else {
    if (!item.price) return { ok: false, err: 'sin-precio' };
    base = item.price; to = round10(base * multiplier);
    body = { price: to };
  }
  if (to <= base) return { ok: false, err: 'no-sube' };
  try {
    const r = await fetch(ML_API + '/items/' + itemId, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) return { ok: false, err: 'ML-' + r.status };
    return { ok: true, from: Math.round(base), to };
  } catch { return { ok: false, err: 'red' }; }
}

// ── Sacar los descuentos ACTIVOS que ML le puso a una publicación ──────────
// Solo toca los que están 'started' (aplicados de verdad). Los 'candidate'
// (ofertas que ML propone pero no puso) no se tocan: no cuestan nada.
// Devuelve { removed:[tipos], failed:[tipo:motivo] }.
async function removeStartedPromos(itemId, token) {
  let arr;
  try {
    const r = await mlGet('/seller-promotions/items/' + itemId + '?app_version=v2', token);
    arr = Array.isArray(r) ? r : (r.results || []);
  } catch { return { removed: [], failed: [] }; }
  const removed = [], failed = [];
  for (const pr of arr) {
    if (pr.status !== 'started') continue; // solo los que están aplicados
    const qs = new URLSearchParams({ app_version: 'v2' });
    if (pr.id) qs.set('promotion_id', pr.id);
    if (pr.type) qs.set('promotion_type', pr.type);
    try {
      const r = await fetch(ML_API + '/seller-promotions/items/' + itemId + '?' + qs.toString(), {
        method: 'DELETE', headers: { Authorization: 'Bearer ' + token },
      });
      if (r.ok) removed.push(pr.type || 'descuento');
      else failed.push((pr.type || 'descuento') + ':' + r.status);
    } catch { failed.push((pr.type || 'descuento') + ':red'); }
  }
  return { removed, failed };
}

// ── NETO REAL: lo que efectivamente te entra según Mercado Pago ──
// transaction_details.net_received_amount ya tiene descontado TODO:
// comisión de ML + costo fijo + retenciones de impuestos (IIBB/SIRTAC).
// Suma los pagos de la orden. Devuelve null si no se pudo (→ usa el fallback).
async function orderNet(order, token) {
  let net = 0, ok = false;
  for (const p of (order.payments || [])) {
    if (!p.id) continue;
    try {
      const r = await fetch('https://api.mercadopago.com/v1/payments/' + p.id, {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!r.ok) continue;
      const b = await r.json();
      const nr = b.transaction_details?.net_received_amount;
      if (typeof nr === 'number') { net += nr; ok = true; }
    } catch { /* ignore */ }
  }
  return ok ? net : null;
}
// fallback si no se pudo leer el pago: total − comisión (sin impuestos).
function netoFallback(itemGross, saleFeeUnit, qty) {
  return Math.max(0, Math.round(itemGross - (saleFeeUnit || 0) * (qty || 0)));
}

// ── Aviso al celular por Telegram ──────────────────────────────────────────
// Alcanza con cargar el secret TELEGRAM_BOT_TOKEN. El chat id se descubre solo
// (del "hola" que le mandaste al bot) y se guarda en Firebase mlapi/telegram.
// Si querés fijarlo a mano, podés cargar también TELEGRAM_CHAT_ID.
let TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
let TG_CHAT = process.env.TELEGRAM_CHAT_ID || '';
async function tgApi(method, body) {
  if (!TG_TOKEN) return null;
  try {
    const r = await fetch('https://api.telegram.org/bot' + TG_TOKEN + '/' + method, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    });
    return await r.json();
  } catch { return null; }
}
async function sendTelegram(text) {
  if (!TG_TOKEN || !TG_CHAT) return false;
  const r = await tgApi('sendMessage', {
    chat_id: TG_CHAT, text, parse_mode: 'HTML', disable_web_page_preview: true,
  });
  return !!(r && r.ok);
}
// Descubre el chat id la primera vez y lo cachea en Firebase.
async function resolveTgChat(db) {
  if (!TG_TOKEN || TG_CHAT) return;
  try { const c = await db.get('mlapi/telegram/chatId'); if (c) { TG_CHAT = String(c); return; } } catch { /* */ }
  const r = await tgApi('getUpdates', {});
  if (r && r.ok) {
    for (const u of (r.result || [])) {
      const m = u.message || u.edited_message || u.channel_post || {};
      const id = m.chat && m.chat.id;
      if (id) {
        TG_CHAT = String(id);
        try { await db.set('mlapi/telegram/chatId', TG_CHAT); } catch { /* */ }
        console.log('✓ Telegram: chat id detectado y guardado:', TG_CHAT);
        break;
      }
    }
  }
}
const money = (n) => '$' + Math.round(n).toLocaleString('es-AR');

// ── traer todas las ventas pagadas de una cuenta desde una fecha ───────────
async function fetchOrders(sellerId, token, fromISO) {
  const out = [];
  let offset = 0;
  const limit = 50;
  for (;;) {
    const q = new URLSearchParams({
      seller: String(sellerId),
      'order.status': 'paid',
      sort: 'date_desc',
      offset: String(offset), limit: String(limit),
    });
    if (fromISO) q.set('order.date_created.from', fromISO);
    const d = await mlGet('/orders/search?' + q.toString(), token);
    const res = d.results || [];
    out.push(...res);
    if (res.length < limit || out.length >= (d.paging?.total || 0)) break;
    offset += limit;
    if (offset > 2000) break; // tope de seguridad
  }
  return out;
}

// ── traer las ventas CANCELADAS (para sacarlas del panel si ya estaban) ─────
// ML no permite filtrar por fecha de cancelación, así que miramos una ventana
// amplia (por fecha de creación) para atrapar cancelaciones de ventas viejas.
async function fetchCancelled(sellerId, token, fromISO) {
  const out = [];
  let offset = 0;
  const limit = 50;
  for (;;) {
    const q = new URLSearchParams({
      seller: String(sellerId),
      'order.status': 'cancelled',
      sort: 'date_desc',
      offset: String(offset), limit: String(limit),
    });
    if (fromISO) q.set('order.date_created.from', fromISO);
    let d;
    try { d = await mlGet('/orders/search?' + q.toString(), token); } catch { break; }
    const res = d.results || [];
    out.push(...res);
    if (res.length < limit || out.length >= (d.paging?.total || 0)) break;
    offset += limit;
    if (offset > 2000) break;
  }
  return out;
}

// ¿el comprador llegó a RECIBIR el producto? (para distinguir reclamo de cancelada)
// delivered = lo recibió → si además se le devolvió el dinero, es una pérdida (reclamo).
async function wasDelivered(order, token) {
  const tags = order.tags || [];
  if (tags.includes('delivered')) return true;
  if (tags.includes('not_delivered')) return false;
  const shipId = order.shipping?.id;
  if (!shipId) return false;
  try {
    const s = await mlGet('/shipments/' + shipId, token);
    const st = (s.status || '').toLowerCase();
    const sub = (s.substatus || '').toLowerCase();
    return st === 'delivered' || sub === 'delivered';
  } catch { return false; }
}

async function main() {
  const idToken = await fbSignIn(FIREBASE_API_KEY, FIREBASE_BOT_EMAIL, FIREBASE_BOT_PASSWORD);
  const db = makeDB(FIREBASE_DB_URL, idToken);

  // Telegram: descubrir/cachear el chat id (solo hace falta el token).
  await resolveTgChat(db);

  // TELEGRAM_TEST=1 → solo manda un mensaje de prueba y sale (para verificar
  // que el token está bien y que llega a tu celular). No toca nada más.
  if (process.env.TELEGRAM_TEST) {
    if (!TG_TOKEN) { console.log('✗ Falta el secret TELEGRAM_BOT_TOKEN.'); return; }
    if (!TG_CHAT) { console.log('✗ No encontré tu chat. Mandale un "hola" al bot y reintento.'); return; }
    const ok = await sendTelegram('✅ <b>CYC</b>: prueba de avisos. Si ves esto, ¡los avisos ya funcionan! 🎉');
    console.log(ok ? '✓ Mensaje de prueba enviado a Telegram (chat ' + TG_CHAT + ').'
      : '✗ No se pudo enviar. ¿Apretaste Start en el bot?');
    return;
  }

  // DAILY_SUMMARY=1 → manda el resumen de ventas del día por Telegram y sale.
  if (process.env.DAILY_SUMMARY) {
    const vp = (await db.get('cyc/ventaprod')) || {};
    const today = dayKeyFromISO(new Date().toISOString());
    const day = vp[today] || {};
    let n = 0, fact = 0, gan = 0;
    const byProd = {};
    for (const v of Object.values(day)) {
      if (!v || v.cancelada) continue; // canceladas/reclamos no cuentan
      n += v.qty || 0;
      fact += v.total || 0;
      gan += (v.neto || 0) - (v.costo || 0);
      const k = v.prod || '?';
      byProd[k] = (byProd[k] || 0) + (v.qty || 0);
    }
    const top = Object.entries(byProd).sort((a, b) => b[1] - a[1])[0];
    const fecha = new Intl.DateTimeFormat('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit',
    }).format(new Date());
    const msg = `📊 <b>Resumen del día ${fecha}</b>\n`
      + `Ventas: <b>${n}</b>\n`
      + `Facturado: ${money(fact)}\n`
      + `Ganancia: <b>${money(gan)}</b>\n`
      + (top ? `🥇 Más vendido: ${top[0]} (${top[1]})` : 'Sin ventas hoy');
    const ok = await sendTelegram(msg);
    console.log(ok ? '✓ Resumen diario enviado.' : '✗ No se pudo enviar el resumen (revisá Telegram).');
    return;
  }

  const accounts = (await db.get('mlapi/tokens')) || {};
  const labels = Object.keys(accounts);
  if (!labels.length) { console.log('No hay cuentas conectadas todavía.'); return; }

  const products = Object.values((await db.get('cyc/products')) || {});
  const index = buildProductIndex(products);
  if (process.env.DUMP_VENTAS) {
    const vp = (await db.get('cyc/ventaprod')) || {};
    const all = [];
    for (const ents of Object.values(vp)) for (const v of Object.values(ents || {})) all.push(v);
    const by = {};
    for (const v of all) { const o = v.origen || '(sin origen)'; (by[o] = by[o] || []).push(v); }
    console.log('TOTAL ventaprod:', all.length);
    for (const [o, arr] of Object.entries(by)) {
      const withNum = arr.filter((v) => v.numVenta).length;
      const maxTs = Math.max(0, ...arr.map((v) => v.ts || 0));
      console.log(`origen=${o}: ${arr.length} · con numVenta: ${withNum} · última: ${maxTs ? new Date(maxTs).toISOString() : '?'}`);
      arr.sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 3).forEach((v) =>
        console.log('   últ:', JSON.stringify({ numVenta: v.numVenta, prod: v.prod, cuenta: v.cuenta, ts: v.ts })));
    }
    // duplicado REAL = mismo número de venta + mismo producto (los paquetes con
    // varios productos comparten número pero son productos distintos, no cuentan).
    const groups = {};
    for (const v of all) {
      if (!v.numVenta) continue;
      const key = String(v.numVenta) + '|' + (v.prodId || v.prod || '');
      (groups[key] = groups[key] || []).push(v);
    }
    const dups = Object.entries(groups).filter(([, arr]) => arr.length > 1);
    let mlApiInvolved = 0;
    dups.forEach(([, arr]) => { if (arr.some((v) => v.origen === 'ml-api')) mlApiInvolved++; });
    console.log('\n🔎 Duplicados REALES (mismo nº venta + mismo producto):', dups.length);
    console.log('   de esos, que tocan al robot (ml-api):', mlApiInvolved);
    dups.slice(0, 20).forEach(([k, arr]) =>
      console.log('   x' + arr.length + ' [' + arr.map((v) => v.origen || 'viejo').join(',') + '] ' + arr[0].prod + ' #' + k.split('|')[0]));
    return;
  }
  if (process.env.CATALOG_ONLY) {
    console.log('CATÁLOGO total:', products.length);
    console.log('CAMPOS:', JSON.stringify(Object.keys(products[0] || {})));
    console.log('NOMBRES:', JSON.stringify(products.map((p) => p.name)));
    console.log('EJEMPLO:', JSON.stringify(products[0] || {}));
    return;
  }
  if (process.env.DUMP_VARS) {
    const kw = (process.env.DUMP_VARS || '').toLowerCase();
    for (const p of products) {
      if (kw && kw !== '1' && !(p.name || '').toLowerCase().includes(kw)) continue;
      const vs = p.variantes || [];
      if (!vs.length && kw === '1') continue;
      console.log(`${p.name}  → ${vs.length} variantes: ${JSON.stringify(vs)}`);
    }
    return;
  }
  if (process.env.DUMP_MAP) {
    const m = (await db.get('cyc/mlmap')) || {};
    console.log('MLMAP total:', Object.keys(m).length);
    for (const [k, v] of Object.entries(m)) {
      console.log(k, '=>', JSON.stringify(v));
    }
    return;
  }
  const finanzas = (await db.get('cyc/finanzas')) || {};
  const tc = parseFloat(finanzas.tipo_cambio) || 1500;

  // mapa publicación(MLA) → { prodId, variant, title, cuenta, status, manual } — nodo propio
  const map = (await db.get('cyc/mllinks')) || {};
  const mapUpd = {}; // solo lo que toca el auto-match (no pisa lo que vos fijaste)

  // AUTOLINK: vincular familias que son 1 producto con variantes (Paulvic,
  // Victoria's Secret). Elige la variante buscando sus palabras en el título.
  // DRY_RUN=1 solo muestra. Deja las que no encuentran variante para revisar.
  if (process.env.AUTOLINK) {
    const fams = [{ kw: 'paulvic', prod: 'Paulvic TODOS' }, { kw: 'victoria', prod: "Victoria's Secret" }];
    const matchVar = (title, variantes) => {
      const tw = new Set(norm(title).split(' ').filter(Boolean));
      let best = '', bestScore = 0;
      for (const v of (variantes || [])) {
        const vw = norm(v).split(' ').filter(Boolean);
        if (!vw.length) continue;
        let sc = 0; for (const w of vw) if (tw.has(w)) sc++;
        if (sc > 0 && (sc > bestScore || (sc === bestScore && norm(v).length > norm(best).length))) { bestScore = sc; best = v; }
      }
      return best;
    };
    const upd = {};
    for (const f of fams) {
      const p = products.find((pp) => norm(pp.name) === norm(f.prod));
      if (!p) { console.log('✗ No encontré el producto', f.prod); continue; }
      let n = 0, nv = 0;
      console.log(`\n═══ ${f.prod} (${(p.variantes || []).length} variantes) ═══`);
      for (const [mla, e] of Object.entries(map)) {
        if (!e || e.ignored || e.prodId) continue;
        if (!norm(e.title).includes(norm(f.kw))) continue;
        const variant = matchVar(e.title, p.variantes);
        const entry = { prodId: p.id, variant, title: e.title || '', cuenta: e.cuenta || '', status: e.status || '', sold: e.sold || 0, manual: true };
        upd[mla] = entry; map[mla] = entry;
        n++; if (!variant) nv++;
        console.log(`  ${variant ? '→ ' + variant : '⚠️ SIN VARIANTE'}  ·  ${e.title}`);
      }
      console.log(`  Total: ${n} vinculadas · ${nv} sin variante (revisar)`);
    }
    if (!process.env.DRY_RUN && Object.keys(upd).length) {
      await db.patch('cyc/mllinks', upd);
      console.log(`\n✓ Guardado en el panel: ${Object.keys(upd).length} publicaciones.`);
    } else {
      console.log('\n(DRY_RUN: no guardé nada)');
    }
    return;
  }

  // ventas ya cargadas a mano / por cowork (para no duplicarlas). Las nuestras
  // (origen ml-api) usan id determinístico, así que reescribirlas es inofensivo.
  const ventaprod = (await db.get('cyc/ventaprod')) || {};
  const seenManual = new Set();
  // índice: nº de venta → dónde quedó cargada (para poder quitarla si se cancela)
  const loadedByNum = new Map();
  for (const [dayKey, day] of Object.entries(ventaprod)) {
    for (const [id, v] of Object.entries(day || {})) {
      if (!v) continue;
      if (v.numVenta && v.origen !== 'ml-api') seenManual.add(String(v.numVenta));
      if (v.numVenta && v.origen === 'ml-api') {
        const k = String(v.numVenta);
        if (!loadedByNum.has(k)) loadedByNum.set(k, []);
        loadedByNum.get(k).push({ dayKey, id, cancelada: !!v.cancelada });
      }
    }
  }

  // avisos ya mandados al cel (para no repetir el mismo por cada corrida)
  const alerted = (await db.get('mlapi/alerted')) || {};
  const alertUpd = {};

  // config de precios (la editás desde Ajustes en la app): meta, umbral y on/off.
  const cfg = (await db.get('cyc/mlconfig')) || {};
  const autoPrice = cfg.autoPrice !== false; // por defecto ON (lo pediste)
  const autoPromo = cfg.autoPromo !== false; // sacar descuentos de ML — ON por defecto
  const autoStock = cfg.autoStock !== false; // cargar stock de ML al panel — ON por defecto
  const targetPct = parseFloat(cfg.targetPct) || 42; // margen objetivo
  const minPct = parseFloat(cfg.minPct) || 40;        // umbral para actuar
  const MAX_UP = 1.25; // tope de seguridad: nunca subir más de +25% de una
  let promoAlerts = 0; // tope de avisos de "no pude sacar" por corrida
  // items a los que ya les tocamos el precio hace poco (para no pelear con los
  // descuentos automáticos de ML ni subir en loop)
  const priced = (await db.get('mlapi/priced')) || {};
  const pricedUpd = {};
  let pubAlerts = 0; // tope de avisos de publicaciones por corrida (anti-spam)
  // stock a escribir en el inventario del panel (producto×cuenta y por variante)
  const stockTot = {}; // prodId__Cuenta -> unidades (suma de sus publicaciones)
  const stockVar = {}; // prodId__Cuenta__v__Variante -> unidades

  const state = (await db.get('mlapi/state')) || {};
  let cargadas = 0;

  if (process.env.DUMP_SKU) {
    const label = labels[0];
    const acc = accounts[label];
    const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
    await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
    const from = new Date(Date.now() - 3 * 864e5).toISOString().replace(/\.\d+Z$/, '.000-00:00');
    const orders = await fetchOrders(acc.seller_id, t.access_token, from);
    for (const o of orders.slice(0, 8)) {
      const full = await mlGet('/orders/' + o.id, t.access_token).catch(() => o);
      console.log('ORDER #' + o.id, JSON.stringify({
        total: full.total_amount, paid: full.paid_amount,
        taxes: full.taxes,
        items: (full.order_items || []).map((it) => ({
          title: (it.item?.title || '').slice(0, 30),
          unit: it.unit_price, qty: it.quantity, sale_fee: it.sale_fee,
        })),
        payments: (full.payments || []).map((p) => ({
          taxes_amount: p.taxes_amount, marketplace_fee: p.marketplace_fee,
          fee_details: p.fee_details, transaction: p.transaction_amount,
        })),
      }));
    }
    return;
  }

  if (process.env.DUMP_PAY) {
    const label = labels[0];
    const acc = accounts[label];
    const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
    await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
    const from = new Date(Date.now() - 3 * 864e5).toISOString().replace(/\.\d+Z$/, '.000-00:00');
    const orders = await fetchOrders(acc.seller_id, t.access_token, from);
    for (const o of orders.slice(0, 6)) {
      const pid = o.payments?.[0]?.id;
      if (!pid) { console.log('#' + o.id, 'sin payment id'); continue; }
      let r, txt;
      try {
        r = await fetch('https://api.mercadopago.com/v1/payments/' + pid, { headers: { Authorization: 'Bearer ' + t.access_token } });
        txt = await r.text();
      } catch (e) { console.log('#' + o.id, 'ERR', e.message); continue; }
      let b = null; try { b = JSON.parse(txt); } catch { /* */ }
      if (b && r.ok) {
        console.log('#' + o.id, 'total', o.total_amount, JSON.stringify({
          net_received: b.transaction_details?.net_received_amount,
          taxes_amount: b.taxes_amount,
          charges: (b.charges_details || []).map((c) => ({ n: c.name, t: c.type, a: c.amounts?.original })),
        }));
      } else {
        console.log('#' + o.id, 'pay', pid, 'status', r.status, txt.slice(0, 160));
      }
    }
    return;
  }

  // DUMP_PROMOS: solo lectura. Lista las promociones/descuentos que ML tiene
  // sobre cada cuenta y sobre algunas publicaciones vinculadas, para ver los
  // tipos/estados reales antes de programar el borrado automático.
  if (process.env.DUMP_PROMOS) {
    for (const label of labels) {
      const acc = accounts[label];
      if (!acc?.refresh_token) continue;
      const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
      await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
      console.log(`\n═══ ${label} (${acc.nickname || acc.seller_id}) ═══`);
      // 1) promociones a nivel cuenta
      try {
        const u = await mlGet('/seller-promotions/users/' + acc.seller_id + '?app_version=v2', t.access_token);
        const arr = Array.isArray(u) ? u : (u.results || []);
        console.log('PROMOS de la cuenta:', arr.length);
        for (const pr of arr) console.log('  ·', JSON.stringify({
          id: pr.id, type: pr.type, status: pr.status, name: pr.name,
          start: pr.start_date, finish: pr.finish_date, benefits: pr.benefits,
        }));
      } catch (e) { console.log('  (users promos error:', e.message, ')'); }
      // 2) promociones por publicación (muestra de vinculadas activas)
      const ids = Object.entries(map)
        .filter(([mla, e]) => e && e.cuenta === label && !e.ignored && e.prodId && /^MLA/i.test(mla))
        .map(([mla]) => mla).slice(0, 6);
      for (const mla of ids) {
        try {
          const r = await mlGet('/seller-promotions/items/' + mla + '?app_version=v2', t.access_token);
          const arr = Array.isArray(r) ? r : (r.results || []);
          if (!arr.length) { console.log('  ' + mla + ': sin promos'); continue; }
          console.log('  ' + mla + ' (' + (map[mla].title || '').slice(0, 30) + '):');
          for (const pr of arr) console.log('      →', JSON.stringify({
            id: pr.id, type: pr.type, status: pr.status, offer_id: pr.offer_id,
            price: pr.price, orig: pr.original_price, deal_price: pr.deal_price,
          }));
        } catch (e) { console.log('  ' + mla + ': error ' + e.message); }
      }
    }
    return;
  }

  // DUMP_UNMAPPED: lista las publicaciones SIN vincular ordenadas por cuánto
  // vendieron (para saber cuáles conviene mapear primero). Solo lectura.
  if (process.env.DUMP_UNMAPPED) {
    const byLabel = {};
    for (const [mla, e] of Object.entries(map)) {
      if (!e || e.ignored || e.prodId || !/^MLA/i.test(mla)) continue;
      (byLabel[e.cuenta] = byLabel[e.cuenta] || []).push(mla);
    }
    for (const label of labels) {
      const list = byLabel[label] || [];
      if (!list.length) continue;
      const acc = accounts[label];
      if (!acc?.refresh_token) continue;
      const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
      await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
      const rows = [];
      for (let i = 0; i < list.length; i += 20) {
        const chunk = list.slice(i, i + 20);
        let arr;
        try { arr = await mlGet('/items?ids=' + chunk.join(',') + '&attributes=id,title,status,sold_quantity', t.access_token); }
        catch { continue; }
        for (const row of (arr || [])) {
          const b = row.body || {};
          if (!b.id) continue;
          rows.push({ title: (b.title || '').slice(0, 55), sold: b.sold_quantity || 0, active: b.status === 'active' });
        }
      }
      rows.sort((a, b) => b.sold - a.sold);
      const conVenta = rows.filter((r) => r.sold > 0);
      console.log(`\n═══ ${label}: ${list.length} sin vincular · ${conVenta.length} vendieron alguna vez ═══`);
      conVenta.slice(0, 30).forEach((r) =>
        console.log(`  ${String(r.sold).padStart(4)}  [${r.active ? 'ACTIVA  ' : 'inactiva'}]  ${r.title}`));
    }
    return;
  }

  // DUMP_ORDER: investigar UNA venta puntual — qué guardó el panel vs qué
  // devuelve el pago de ML (para diagnosticar netos raros, ej. ventas Full).
  if (process.env.DUMP_ORDER) {
    const oid = String(process.env.DUMP_ORDER).trim();
    // 1) qué quedó guardado en el panel
    const vp = (await db.get('cyc/ventaprod')) || {};
    for (const day of Object.values(vp)) {
      for (const v of Object.values(day || {})) {
        if (v && String(v.numVenta) === oid) {
          console.log('PANEL:', JSON.stringify({
            prod: v.prod, total: v.total, neto: v.neto, costo: v.costo,
            origen: v.origen, cancelada: v.cancelada || false,
          }));
        }
      }
    }
    // 2) qué dice ML/MP para esa orden
    for (const label of labels) {
      const acc = accounts[label];
      if (!acc?.refresh_token) continue;
      const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
      await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
      let full;
      try { full = await mlGet('/orders/' + oid, t.access_token); } catch { continue; }
      if (!full || !full.id) continue;
      console.log(`\nORDEN ${oid} · cuenta ${label} · status ${full.status}`);
      console.log('  total_amount:', full.total_amount, 'paid_amount:', full.paid_amount);
      console.log('  items:', JSON.stringify((full.order_items || []).map((it) => ({
        t: (it.item?.title || '').slice(0, 30), unit: it.unit_price, qty: it.quantity, fee: it.sale_fee,
      }))));
      let net = 0;
      for (const p of (full.payments || [])) {
        let b = null;
        try {
          const r = await fetch('https://api.mercadopago.com/v1/payments/' + p.id, { headers: { Authorization: 'Bearer ' + t.access_token } });
          b = await r.json();
        } catch { /* */ }
        console.log('  PAGO', p.id, JSON.stringify({
          status: b?.status,
          transaction: b?.transaction_amount,
          net_received: b?.transaction_details?.net_received_amount,
          shipping_cost: p.shipping_cost,
          charges: (b?.charges_details || []).map((c) => `${c.name}:${c.amounts?.original}`),
        }));
        const nr = b?.transaction_details?.net_received_amount;
        if (typeof nr === 'number') net += nr;
      }
      console.log('  → neto que usa el robot (suma net_received):', net);
      break;
    }
    return;
  }

  // DUMP_BALANCE: probar de dónde sacar el saldo disponible y a liquidar de MP.
  if (process.env.DUMP_BALANCE) {
    for (const label of labels) {
      const acc = accounts[label];
      if (!acc?.refresh_token) continue;
      const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
      await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
      console.log(`\n═══ ${label} (${acc.seller_id}) ═══`);
      const tries = [
        'https://api.mercadopago.com/v1/account/balance',
        'https://api.mercadopago.com/users/' + acc.seller_id + '/mercadopago_account/balance',
        'https://api.mercadopago.com/v1/account/settlement_report/config',
      ];
      for (const url of tries) {
        try {
          const r = await fetch(url, { headers: { Authorization: 'Bearer ' + t.access_token } });
          const txt = await r.text();
          console.log('  ' + url.replace('https://api.mercadopago.com', '') + ' → ' + r.status + ' ' + txt.slice(0, 300));
        } catch (e) { console.log('  ' + url + ' ERR ' + e.message); }
      }
    }
    return;
  }

  // DUMP_MARGINS: productos ordenados por margen REAL (peor a mejor), con el neto
  // real ya cargado (que descuenta Full). Sirve para ver dónde perdés. Solo lectura.
  if (process.env.DUMP_MARGINS) {
    const vp = (await db.get('cyc/ventaprod')) || {};
    const agg = {};
    for (const day of Object.values(vp)) {
      for (const v of Object.values(day || {})) {
        if (!v || v.cancelada || v.origen !== 'ml-api') continue;
        const k = v.prodId || v.prod || '?';
        const a = agg[k] || (agg[k] = { name: v.prod || k, qty: 0, neto: 0, costo: 0 });
        a.qty += v.qty || 0; a.neto += v.neto || 0; a.costo += v.costo || 0;
      }
    }
    const rows = Object.values(agg).filter((a) => a.costo > 0 && a.qty >= 1)
      .map((a) => ({ ...a, margen: (a.neto - a.costo) / a.costo * 100, gan: a.neto - a.costo }))
      .sort((x, y) => x.margen - y.margen);
    console.log('PRODUCTOS por margen REAL (peor a mejor):');
    rows.slice(0, 40).forEach((r) =>
      console.log(`  ${String(Math.round(r.margen)).padStart(4)}%  x${String(r.qty).padStart(3)}  gan ${String(Math.round(r.gan)).padStart(8)}  ${r.name}`));
    return;
  }

  for (const label of labels) {
    const acc = accounts[label];
    if (!acc?.refresh_token) continue;

    // 1) renovar token y guardar el nuevo refresh_token (ML lo rota)
    const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
    await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });

    // 2) traer ventas desde la última corrida (o últimos 7 días la 1ª vez).
    //    BACKFILL_DAYS fuerza una ventana amplia (para reprocesar el historial).
    const bfd = parseInt(process.env.BACKFILL_DAYS || '0', 10);
    const fromISO = bfd > 0
      ? new Date(Date.now() - bfd * 864e5).toISOString().replace(/\.\d+Z$/, '.000-00:00')
      : (state[label]?.lastFrom ||
        new Date(Date.now() - 7 * 864e5).toISOString().replace(/\.\d+Z$/, '.000-00:00'));
    const orders = await fetchOrders(acc.seller_id, t.access_token, fromISO);

    // 3) transformar cada venta → entradas ventaprod (solo las que enganchan)
    for (const o of orders) {
      const num = String(o.id);
      if (seenManual.has(num)) continue; // ya cargada a mano/cowork
      const dayKey = dayKeyFromISO(o.date_closed || o.date_created);
      const saleId = 's' + o.id;
      const items = o.order_items || [];
      const orderGross = items.reduce((s, it) => s + (it.unit_price || 0) * (it.quantity || 0), 0);
      let orderNetAmt = null, netFetched = false; // neto real del pago (una vez por orden)
      let i = 0;
      for (const it of items) {
        const mla = it.item?.id;
        const title = it.item?.title || '';
        const qty = it.quantity || 0;
        const itemGross = (it.unit_price || 0) * qty;
        const idx = i; i++;
        let e = mla ? map[mla] : null;
        if (typeof e === 'string') e = { prodId: e, manual: true }; // formato viejo
        let p = null, variant = '';
        if (e && e.manual) {               // vinculación fijada por vos en la app
          p = e.prodId ? (products.find((pp) => pp.id === e.prodId) || null) : null;
          variant = e.variant || '';
        } else {                           // auto-match por palabras (y lo dejamos visible/editable)
          p = matchProduct(title, index);
          if (mla) {
            const entry = {
              prodId: p ? p.id : null, variant: (e && e.variant) || '',
              title, cuenta: label, auto: true,
              candidatos: p ? null : candidatesFor(title, index),
            };
            map[mla] = entry; mapUpd[mla] = entry;
          }
          variant = (e && e.variant) || '';
        }
        if (!p) continue;                  // sin vincular → NO se carga (para no quedar sin costo)
        if (!variant) variant = mlVariant(it, p); // variante desde la venta de ML si corresponde
        // neto real del pago (una sola vez por orden, recién cuando hay un ítem que cargar)
        if (!netFetched) { orderNetAmt = await orderNet(o, t.access_token); netFetched = true; }
        const neto = (orderNetAmt != null && orderGross > 0)
          ? Math.round(orderNetAmt * (itemGross / orderGross))
          : netoFallback(itemGross, it.sale_fee, qty);
        const { costo, costBaseUSD, shipUSD } = costoPesos(p, qty, tc);
        const id = 'v' + o.id + '_' + idx;
        const obj = {
          id, saleId, prod: p.name, prodId: p.id, cuenta: label, qty,
          total: Math.round(itemGross),
          neto,
          costo, costBaseUSD, tcSale: tc, shipUSD,
          numVenta: num,
          ts: new Date(o.date_closed || o.date_created).getTime(),
          origen: 'ml-api',
        };
        if (variant) obj.variante = variant;
        if (DRY) console.log(`  [${label}] #${num} ${p.name} x${qty} · total ${obj.total} · neto ${obj.neto}`);
        else await db.set(`cyc/ventaprod/${dayKey}/${id}`, obj);
        cargadas++;
        // dejar registrada la carga por si esta misma venta se cancela después
        if (!loadedByNum.has(num)) loadedByNum.set(num, []);
        loadedByNum.get(num).push({ dayKey, id, cancelada: false });

        // ── MARGEN BAJO: subir el precio solo (o avisar) ──
        // Margen = (neto − costo) ÷ costo, igual que la app. Si queda por debajo
        // del umbral (40%), llevamos el precio a la meta (42%, 2% de colchón).
        // El neto real ya trae comisión + impuestos, así que el multiplicador
        // que sube el neto a costo×1,42 también sube el precio en esa proporción.
        // Solo ventas recientes (12 h), en corridas normales (no backfill) y una
        // sola vez por venta.
        const recient = (Date.now() - obj.ts) < 12 * 3600e3;
        if (!DRY && bfd === 0 && recient && costo > 0 && neto > 0 && !alerted[id]) {
          const margen = (neto - costo) / costo;
          if (margen < minPct / 100) {
            const mult = (costo * (1 + targetPct / 100)) / neto; // >1 siempre acá
            const unit = itemGross / qty;
            const sugUnit = Math.ceil(((costo * (1 + targetPct / 100) / neto) * unit) / 10) * 10;
            const head = `Margen bajo: ${(margen * 100).toFixed(0)}%\n`
              + `${p.name}${variant ? ' · ' + variant : ''}\nCuenta: ${label}\n`;
            const varId = it.item?.variation_id || null;
            const yaTocado = priced[mla] && (Date.now() - (priced[mla].ts || 0)) < 12 * 3600e3;
            let done = false;
            // subir solo: activo, dentro del tope de seguridad y sin haberlo tocado hace poco
            if (autoPrice && mult <= MAX_UP && !yaTocado) {
              const rp = await raisePrice(mla, varId, mult, t.access_token);
              if (rp.ok) {
                pricedUpd[mla] = { ts: Date.now(), to: rp.to };
                priced[mla] = pricedUpd[mla];
                await sendTelegram(`🔼 <b>Precio subido automático</b>\n${head}`
                  + `Estaba en margen ${(margen * 100).toFixed(0)}% → lo subí de `
                  + `${money(rp.from)} a <b>${money(rp.to)}</b> para llegar al ${targetPct}%`);
                done = true;
              }
            }
            // si no se pudo subir solo (apagado, tope, catálogo, error…): avisar
            if (!done) {
              const motivo = !autoPrice ? '' : (mult > MAX_UP
                ? '\n⚠️ Subida grande, revisalo vos'
                : (yaTocado ? '\n(ya lo toqué hace poco)' : '\n(no pude subirlo solo)'));
              await sendTelegram(`⚠️ <b>${head}</b>Precio actual: <b>${money(unit)}</b>\n`
                + `Neto: ${money(neto)} · Costo: ${money(costo)}\n`
                + `👉 Subilo a <b>${money(sugUnit)}</b> para llegar al ${targetPct}%${motivo}`);
            }
            alerted[id] = true; alertUpd[id] = obj.ts;
          }
        }
      }
    }

    // 3b) CANCELACIONES y DEVOLUCIONES: si una venta que ya cargamos se canceló
    //     o tuvo devolución, la MARCAMOS (no la borramos) para que el panel la
    //     trate como corresponde:
    //       · cancelada → volvió al stock, no cuenta como venta, no perdés plata.
    //       · reclamo   → el comprador la recibió y se le devolvió el dinero:
    //                     producto perdido → sube solo el % devolución del producto
    //                     (así el precio se ajusta para cubrir ese gasto).
    //     Miramos una ventana amplia (45 días) porque la cancelación/devolución
    //     puede llegar bastante después de la venta. NO pisamos lo que vos ya
    //     clasificaste a mano en la app.
    const cancelFrom = new Date(Date.now() - 45 * 864e5).toISOString().replace(/\.\d+Z$/, '.000-00:00');
    const cancelled = await fetchCancelled(acc.seller_id, t.access_token, cancelFrom);
    let nCanc = 0, nRecl = 0;
    for (const o of cancelled) {
      const hits = loadedByNum.get(String(o.id));
      if (!hits) continue;
      const pend = hits.filter((h) => !h.cancelada); // ya marcadas/clasificadas → no tocar
      if (!pend.length) continue;
      const tipo = (await wasDelivered(o, t.access_token)) ? 'reclamo' : 'cancelada';
      for (const h of pend) {
        if (!DRY) await db.patch(`cyc/ventaprod/${h.dayKey}/${h.id}`, {
          cancelada: true, tipoCancelacion: tipo,
          total: 0, neto: 0, costo: 0, costBaseUSD: 0,
        });
        h.cancelada = true;
        if (tipo === 'reclamo') nRecl++; else nCanc++;
      }
    }
    if (nCanc || nRecl) console.log(`  ↩ ${label}: ${nCanc} cancelada(s) · ${nRecl} reclamo(s) con pérdida`);

    // 3c) SALUD DE PUBLICACIONES: avisar por Telegram si a una publicación
    //     vinculada la bajaron/pausaron por un problema o la moderó ML.
    //     Comparamos el estado actual contra el guardado y avisamos solo en la
    //     transición (así no repite). Ignoramos pausas normales por falta de stock.
    try {
      // todas las publicaciones de la cuenta que no ocultaste (aunque no estén
      // vinculadas): así los descuentos se sacan también en cuentas recién
      // agregadas antes de mapearlas. El aviso de "problema" sí se limita a las
      // vinculadas (para no llenarte de avisos de pubs que no te importan).
      const ids = Object.entries(map)
        .filter(([mla, e]) => e && e.cuenta === label && !e.ignored && /^MLA/i.test(mla))
        .map(([mla]) => mla);
      for (let k = 0; k < ids.length; k += 20) {
        const chunk = ids.slice(k, k + 20);
        let arr;
        try {
          arr = await mlGet('/items?ids=' + chunk.join(',') + '&attributes=id,status,sub_status,permalink,price,original_price,deal_ids,available_quantity,variations', t.access_token);
        } catch { continue; }
        for (const row of (arr || [])) {
          const b = row.body || {};
          const mla = b.id; if (!mla || !map[mla]) continue;
          const st = b.status || '';
          const sub = (b.sub_status || []).join(',');
          const prev = map[mla].status || '';
          if (st && st !== prev) {
            if (!DRY) await db.patch('cyc/mllinks/' + mla, { status: st, subStatus: sub });
            map[mla].status = st;
            const bad = st === 'closed' || st === 'under_review'
              || /deactiv|moderation|warning|suspend|ban|freeze|infract|hold/i.test(sub);
            const wasBad = prev === 'closed' || prev === 'under_review';
            if (bad && !wasBad && !DRY && map[mla].prodId && pubAlerts < 8) {
              const title = map[mla].title || mla;
              const estados = { closed: 'dada de baja', under_review: 'en revisión', paused: 'pausada' };
              await sendTelegram(`⚠️ <b>Problema en una publicación</b>\n`
                + `${title}\nCuenta: ${label}\n`
                + `Estado: ${estados[st] || st}${sub ? ' · ' + sub : ''}\n`
                + (b.permalink || ''));
              pubAlerts++;
            }
          }

          // ── CARGAR STOCK al panel (si la pub está vinculada a un producto) ──
          if (autoStock && map[mla].prodId) {
            const p = products.find((pp) => pp.id === map[mla].prodId);
            if (p) {
              const kTot = map[mla].prodId + '__' + sid(label);
              let total = 0;
              if (Array.isArray(b.variations) && b.variations.length) {
                for (const v of b.variations) {
                  const q = v.available_quantity || 0;
                  total += q;
                  const vals = (v.attribute_combinations || []).map((a) => norm(a.value_name || ''));
                  const pv = (p.variantes || []).find((x) => vals.includes(norm(x)));
                  if (pv) {
                    const vk = map[mla].prodId + '__' + sid(label) + '__v__' + sid(pv);
                    stockVar[vk] = (stockVar[vk] || 0) + q;
                  }
                }
              } else {
                total += b.available_quantity || 0;
              }
              stockTot[kTot] = (stockTot[kTot] || 0) + total;
            }
          }

          // ── SACAR DESCUENTOS de ML que estén aplicados ──
          // Señal barata de "tiene descuento puesto": precio con rebaja o en un deal.
          if (autoPromo && !DRY) {
            const discounted = (b.original_price != null && b.original_price > b.price)
              || (Array.isArray(b.deal_ids) && b.deal_ids.length > 0);
            if (discounted) {
              const { removed, failed } = await removeStartedPromos(mla, t.access_token);
              if (removed.length) {
                await sendTelegram(`🏷️ <b>Descuento sacado</b>\n`
                  + `${map[mla].title || mla}\nCuenta: ${label}\n`
                  + `ML le había aplicado: ${removed.join(', ')}\n`
                  + `Volvió a tu precio normal ✅`);
              }
              if (failed.length && promoAlerts < 6) {
                await sendTelegram(`⚠️ <b>Descuento que no pude sacar</b>\n`
                  + `${map[mla].title || mla}\nCuenta: ${label}\n`
                  + `Tipo: ${failed.join(', ')}\n`
                  + `Sacalo vos desde ML → Promociones.`);
                promoAlerts++;
              }
            }
          }
        }
      }
    } catch { /* no cortar la corrida por esto */ }

    // 4) marcar hasta dónde llegamos (para la próxima corrida) — no en dry-run
    if (!DRY) await db.patch('mlapi/state/' + label, {
      lastFrom: new Date(Date.now() - 2 * 864e5).toISOString().replace(/\.\d+Z$/, '.000-00:00'),
      lastRun: Date.now(),
    });
    console.log(`✓ ${label}: ${orders.length} ventas revisadas`);
  }

  // guardar en el mapa lo que tocó el auto-match (sin pisar lo que fijaste vos)
  if (!DRY && Object.keys(mapUpd).length) await db.patch('cyc/mllinks', mapUpd);
  // guardar los avisos que ya mandamos (para no repetirlos)
  if (!DRY && Object.keys(alertUpd).length) await db.patch('mlapi/alerted', alertUpd);
  // guardar los precios que subimos solos (para no pisarlos en loop)
  if (!DRY && Object.keys(pricedUpd).length) await db.patch('mlapi/priced', pricedUpd);
  // escribir el stock de ML en el inventario del panel (producto×cuenta + variantes)
  if (!DRY) {
    const invUpd = { ...stockVar, ...stockTot };
    if (Object.keys(invUpd).length) {
      await db.patch('cyc/inventory', invUpd);
      console.log(`✓ Stock actualizado: ${Object.keys(stockTot).length} producto×cuenta.`);
    }
  }

  const pend = Object.values(map).filter((x) => x && !x.prodId).length;
  console.log(`\n✓ Listo. Renglones cargados: ${cargadas}. Publicaciones sin vincular: ${pend}.`);
  Object.values(map).filter((x) => x && !x.prodId).slice(0, 40).forEach((r) =>
    console.log('  · ' + r.title + '  → ' + (r.candidatos || []).map((c) => c.name).join(' | ')));
}

main().catch((e) => { console.error('✗ Error:', e.message); process.exit(1); });
