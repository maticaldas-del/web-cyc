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
let TG_CHATS = []; // TODOS los chats a los que mandamos (vos, tu papá, etc.)
let TG_NAMES = {}; // id -> nombre (para mostrar quién está suscripto)
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
// Manda el mensaje a TODOS los suscriptos (los que le escribieron "hola" al bot).
async function sendTelegram(text) {
  if (!TG_TOKEN) return false;
  const dest = TG_CHATS.length ? TG_CHATS : (TG_CHAT ? [String(TG_CHAT)] : []);
  if (!dest.length) return false;
  let anyOk = false;
  for (const chat_id of dest) {
    const r = await tgApi('sendMessage', { chat_id, text, parse_mode: 'HTML', disable_web_page_preview: true });
    if (r && r.ok) anyOk = true;
  }
  return anyOk;
}
// Descubre y ACUMULA todos los chats: cada persona que le manda "hola" al bot queda
// suscripta y recibe los resúmenes/avisos. Se guarda en Firebase mlapi/telegram/chats.
async function resolveTgChat(db) {
  if (!TG_TOKEN) return;
  const chats = {}; // id -> {name, ts}
  try { const saved = await db.get('mlapi/telegram/chats'); if (saved && typeof saved === 'object') Object.assign(chats, saved); } catch { /* */ }
  try { const legacy = await db.get('mlapi/telegram/chatId'); if (legacy && !chats[String(legacy)]) chats[String(legacy)] = { name: '', ts: Date.now() }; } catch { /* */ }
  if (TG_CHAT && !chats[String(TG_CHAT)]) chats[String(TG_CHAT)] = { name: 'fijo', ts: Date.now() };
  const r = await tgApi('getUpdates', {});
  if (r && r.ok) {
    for (const u of (r.result || [])) {
      const m = u.message || u.edited_message || u.channel_post || {};
      const c = m.chat; const id = c && c.id;
      if (id && !chats[String(id)]) {
        const nm = ((c.first_name || c.title || '') + (c.last_name ? ' ' + c.last_name : '')).trim();
        chats[String(id)] = { name: nm, ts: Date.now() };
        console.log('✓ Telegram: nuevo suscriptor', id, nm);
      }
    }
  }
  if (Object.keys(chats).length) { try { await db.set('mlapi/telegram/chats', chats); } catch { /* */ } }
  TG_CHATS = Object.keys(chats);
  TG_NAMES = {}; for (const [id, v] of Object.entries(chats)) TG_NAMES[id] = (v && v.name) || '';
  if (!TG_CHAT && TG_CHATS.length) TG_CHAT = TG_CHATS[0];
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

// ── traer TODAS las ventas de un rango largo, por ventanas de fecha ──────────
// ML no deja paginar muy atrás de una sola (tope ~1000). Partimos el rango en
// ventanas cortas (para que cada una entre bajo ese tope) y las unimos.
async function fetchOrdersRange(sellerId, token, fromMs, toMs, winDays = 12) {
  const out = [];
  const WIN = winDays * 864e5;
  const isoT = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, '.000-00:00');
  for (let start = fromMs; start < toMs; start += WIN) {
    const end = Math.min(start + WIN, toMs);
    let offset = 0;
    for (;;) {
      const q = new URLSearchParams({
        seller: String(sellerId), 'order.status': 'paid', sort: 'date_asc',
        'order.date_created.from': isoT(start), 'order.date_created.to': isoT(end),
        offset: String(offset), limit: '50',
      });
      let d;
      try { d = await mlGet('/orders/search?' + q.toString(), token); } catch { break; }
      const res = d.results || [];
      out.push(...res);
      if (res.length < 50) break;
      offset += 50;
      if (offset > 950) break; // si una ventana trae >1000, la achicaríamos (raro con 12 días)
    }
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

// ¿la cancelación fue una DEVOLUCIÓN (el comprador devolvió el producto y volvió
// al stock)? ML crea un reclamo/claim type "returns" en ese caso. En Full la
// devolución vuelve al depósito y se re-publica ("Pusimos los productos de nuevo
// a la venta") → NO es pérdida, es devolución. Distinto de una pérdida real,
// donde el comprador recibió, se le devolvió la plata y NO volvió el producto.
async function wasReturned(order, token) {
  const oid = order.id;
  if (!oid) return false;
  try {
    const cl = await mlGet('/post-purchase/v1/claims/search?resource=order&resource_id=' + oid, token);
    const arr = cl.data || cl.results || [];
    return arr.some((c) => String(c.type || '').toLowerCase() === 'returns');
  } catch { return false; }
}

async function main() {
  const idToken = await fbSignIn(FIREBASE_API_KEY, FIREBASE_BOT_EMAIL, FIREBASE_BOT_PASSWORD);
  // reauth: en corridas largas el idToken caduca a la 1h → lo renovamos solo.
  const db = makeDB(FIREBASE_DB_URL, idToken, () => fbSignIn(FIREBASE_API_KEY, FIREBASE_BOT_EMAIL, FIREBASE_BOT_PASSWORD));

  // Telegram: descubrir/cachear el chat id (solo hace falta el token).
  await resolveTgChat(db);

  // TELEGRAM_TEST=1 → solo manda un mensaje de prueba y sale (para verificar
  // que el token está bien y que llega a tu celular). No toca nada más.
  if (process.env.TELEGRAM_TEST) {
    if (!TG_TOKEN) { console.log('✗ Falta el secret TELEGRAM_BOT_TOKEN.'); return; }
    if (!TG_CHATS.length) { console.log('✗ Nadie suscripto todavía. Mandale un "hola" al bot y reintento.'); return; }
    console.log(`Suscriptos (${TG_CHATS.length}):`);
    TG_CHATS.forEach((id) => console.log(`  · ${id}${TG_NAMES[id] ? ' — ' + TG_NAMES[id] : ''}`));
    const ok = await sendTelegram('✅ <b>CYC</b>: prueba de avisos. Si ves esto, ¡los avisos ya funcionan! 🎉');
    console.log(ok ? `✓ Prueba enviada a ${TG_CHATS.length} chat(s).`
      : '✗ No se pudo enviar. ¿Apretaron Start en el bot?');
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
  // DUMP_FULLSTOCK: diagnóstico del stock de Full de un producto (palabra clave): muestra,
  // por cada publicación e inventory_id, lo DISPONIBLE y lo que está NO-disponible con su
  // motivo (transfer/inbound = en camino al depósito). Sirve para validar antes de sumar
  // "disponible + en camino" al inventario del panel.
  if (process.env.DUMP_FULLSTOCK) {
    const kw = String(process.env.DUMP_FULLSTOCK).toLowerCase();
    const map = (await db.get('cyc/mllinks')) || {};
    const prodIds = new Set(products.filter((p) => (p.name || '').toLowerCase().includes(kw)).map((p) => p.id));
    const pubs = Object.entries(map).filter(([, e]) => e && prodIds.has(e.prodId));
    console.log(`Producto "${kw}": ${prodIds.size} en catálogo · ${pubs.length} publicaciones vinculadas`);
    for (const label of labels) {
      const acc = accounts[label]; if (!acc?.refresh_token) continue;
      const mine = pubs.filter(([, e]) => (e.cuenta || '') === label);
      if (!mine.length) continue;
      const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
      await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
      const sid2 = acc.seller_id;
      for (const [mla, e] of mine) {
        let item; try { item = await mlGet('/items/' + mla + '?attributes=id,title,available_quantity,shipping,inventory_id,variations', t.access_token); } catch { continue; }
        const invIds = [];
        if (item.inventory_id) invIds.push({ id: item.inventory_id, v: '' });
        for (const v of (item.variations || [])) if (v.inventory_id) invIds.push({ id: v.inventory_id, v: (v.attribute_combinations || []).map((a) => a.value_name).join('/') });
        console.log(`\n[${label}] ${mla} · ${(item.title || '').slice(0, 42)} · logística ${item.shipping?.logistic_type || '?'} · disp(item) ${item.available_quantity}`);
        if (!invIds.length) { console.log('   (sin inventory_id → no es Full)'); continue; }
        for (const { id, v } of invIds) {
          try {
            const s = await mlGet('/inventories/' + id + '/stock/fulfillment', t.access_token);
            console.log(`   inv ${id}${v ? ' [' + v + ']' : ''} STOCK RAW: ${JSON.stringify(s).slice(0, 500)}`);
          } catch (err) { console.log(`   inv ${id}: stock error ${String(err.message || '').slice(0, 60)}`); }
          // OPERACIONES oficiales (incluye inbound_reception y estados de entrada)
          try {
            const o = await mlGet('/stock/fulfillment/operations/search?seller_id=' + sid2 + '&inventory_id=' + id + '&limit=10', t.access_token);
            console.log(`      OPS: ${JSON.stringify(o).slice(0, 600)}`);
          } catch (err) { console.log(`      OPS error: ${String(err.message || '').slice(0, 70)}`); }
        }
      }
    }
    return;
  }
  // DUMP_PRODNETO: lista el neto real (guardado) de las ventas de un producto (palabra clave),
  // para corroborar cuánto se recibe de verdad vs lo que dice el simulador. Solo lee ventaprod.
  if (process.env.DUMP_PRODNETO) {
    const kw = String(process.env.DUMP_PRODNETO || '').toLowerCase();
    const vp = (await db.get('cyc/ventaprod')) || {};
    const rows = [];
    const reclamos = [];
    const mlas = {}; // mla → cantidad de ventas (para saber qué publicaciones son)
    for (const [dk, day] of Object.entries(vp)) {
      for (const v of Object.values(day || {})) {
        if (!v) continue;
        if (!(v.prod || '').toLowerCase().includes(kw)) continue;
        if (v.mla) { mlas[v.mla] = (mlas[v.mla] || 0) + 1; }
        if (v.cancelada) {
          const tc = v.tipoCancelacion || '';
          reclamos.push({ dk, num: v.numVenta, prod: v.prod, cuenta: v.cuenta, qty: v.qty || 1, tipo: tc });
          continue;
        }
        rows.push({ dk, num: v.numVenta, prod: v.prod, total: v.total || 0, neto: v.neto || 0, cuenta: v.cuenta, qty: v.qty || 1 });
      }
    }
    rows.sort((a, b) => (a.dk < b.dk ? 1 : -1));
    reclamos.sort((a, b) => (a.dk < b.dk ? 1 : -1));
    const esRec = (t) => t === 'reclamo' || t === 'perdida';
    const recL = reclamos.filter((r) => esRec(r.tipo));   // reclamo/perdida = suman al % devolución
    const recC = reclamos.filter((r) => !esRec(r.tipo));  // cancelada/devolución = vuelven al stock
    console.log(`\n=== RECLAMOS/CANCELADAS de "${kw}" ===`);
    console.log(`Reclamos (producto perdido, cuentan al % devolución): ${recL.length}`);
    recL.forEach((r) => console.log(`  ⚠️  ${r.dk.replace(/_/g, '-')} · N° ${r.num || '(sin nº)'} · [${r.cuenta}] x${r.qty} · tipo=${r.tipo}`));
    console.log(`Canceladas/devueltas (volvieron al stock, NO cuentan reclamo): ${recC.length}`);
    recC.forEach((r) => console.log(`  ↩︎  ${r.dk.replace(/_/g, '-')} · N° ${r.num || '(sin nº)'} · [${r.cuenta}] x${r.qty} · tipo=${r.tipo || '(sin tipo)'}`));
    console.log('');
    // Publicaciones (MLA) de este producto: título real en ML + a qué está vinculada + si está oculta.
    // Sirve para encontrarla en Vinculaciones (se busca por el TÍTULO, no por el nombre del producto).
    const mlmap = (await db.get('cyc/mllinks')) || {};
    const prodById2 = {}; for (const p of products) prodById2[p.id] = p.name;
    console.log(`Publicaciones (MLA) con ventas de "${kw}": ${Object.keys(mlas).length}`);
    Object.entries(mlas).sort((a, b) => b[1] - a[1]).forEach(([mla, n]) => {
      const e = mlmap[mla] || {};
      const estado = e.ignored ? 'OCULTA' : (e.prodId ? 'vinculada→' + (prodById2[e.prodId] || e.prodId) : 'SIN vincular');
      console.log(`  · ${mla} · ${n} ventas · ${estado}`);
      console.log(`      título ML: "${e.title || '(sin título en mllinks)'}"`);
    });
    console.log('');
    const withT = rows.filter((r) => r.total > 0);
    console.log(`Ventas de "${kw}": ${rows.length} (con total ${withT.length})\n`);
    rows.slice(0, 25).forEach((r) => {
      const pct = r.total > 0 ? Math.round((r.neto / r.total) * 100) : 0;
      console.log(`  ${r.dk} #${r.num} [${r.cuenta}] x${r.qty} · total ${money(r.total)} · neto ${money(r.neto)} (${pct}%)`);
    });
    const avgPct = withT.length ? Math.round(withT.reduce((s, r) => s + (r.neto / r.total) * 100, 0) / withT.length) : 0;
    const sumT = withT.reduce((s, r) => s + r.total, 0), sumN = withT.reduce((s, r) => s + r.neto, 0);
    console.log(`\nPromedio neto/total: ${avgPct}%  ·  total $${Math.round(sumT).toLocaleString('es-AR')} → neto $${Math.round(sumN).toLocaleString('es-AR')} (${sumT > 0 ? Math.round(sumN / sumT * 100) : 0}% ponderado)`);
    return;
  }
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
    // Reparto por mes (según fecha de la venta): cuántas ventas y cuánto facturado hay guardado.
    const perMonth = {};
    for (const v of all) {
      const ts = v.ts || 0;
      const ym = ts ? new Date(ts).toISOString().slice(0, 7) : '(sin fecha)';
      const m = (perMonth[ym] = perMonth[ym] || { n: 0, fact: 0, canc: 0 });
      m.n++;
      if (v.cancelada) m.canc++; else m.fact += (v.total || 0);
    }
    console.log('\n📅 Ventas GUARDADAS por mes (fecha de venta):');
    Object.keys(perMonth).sort().forEach((ym) => {
      const m = perMonth[ym];
      console.log(`   ${ym}: ${String(m.n).padStart(5)} ventas · facturado $${Math.round(m.fact).toLocaleString('es-AR')} · canceladas ${m.canc}`);
    });
    const dups = Object.entries(groups).filter(([, arr]) => arr.length > 1);
    let mlApiInvolved = 0;
    dups.forEach(([, arr]) => { if (arr.some((v) => v.origen === 'ml-api')) mlApiInvolved++; });
    console.log('\n🔎 Duplicados REALES (mismo nº venta + mismo producto):', dups.length);
    console.log('   de esos, que tocan al robot (ml-api):', mlApiInvolved);
    dups.slice(0, 20).forEach(([k, arr]) =>
      console.log('   x' + arr.length + ' [' + arr.map((v) => v.origen || 'viejo').join(',') + '] ' + arr[0].prod + ' #' + k.split('|')[0]));
    return;
  }
  // DUMP_FACT: muestra la facturación AFIP congelada (cyc/fact_mes) y las canceladas (fact_cancel)
  // por cuenta/mes, y SIMULA la ventana rodante de 365 días igual que el monotributo de la app,
  // para ver si los meses viejos (2025) siguen sumando al total de cada cuenta.
  if (process.env.DUMP_FACT) {
    const factMes = (await db.get('cyc/fact_mes')) || {};
    const factCancel = (await db.get('cyc/fact_cancel')) || {};
    const vp = (await db.get('cyc/ventaprod')) || {};
    // ventas reales por cuenta/mes (sin canceladas)
    const realMes = {};
    for (const [dk, day] of Object.entries(vp)) {
      const ym = String(dk).slice(0, 7);
      for (const v of Object.values(day || {})) {
        if (!v || v.cancelada) continue;
        const a = (v.cuenta || '').toLowerCase();
        realMes[a] = realMes[a] || {}; realMes[a][ym] = (realMes[a][ym] || 0) + (v.total || 0);
      }
    }
    console.log('=== fact_mes CONGELADO (cyc/fact_mes) ===');
    for (const [a, bym] of Object.entries(factMes)) {
      const meses = Object.keys(bym || {}).sort();
      console.log(`  ${a}: ${meses.length} meses → ${meses.join(', ')}`);
      for (const ym of meses) console.log(`      ${ym}: $${Math.round(parseFloat(bym[ym]) || 0).toLocaleString('es-AR')}`);
    }
    console.log('\n=== fact_cancel (cyc/fact_cancel) ===');
    for (const [a, bym] of Object.entries(factCancel)) {
      const meses = Object.keys(bym || {}).sort();
      console.log(`  ${a}: ${meses.length} meses → ${meses.join(', ')}`);
    }
    // Simular la ventana de 365 días (hoy incluido). Meses tocados y de dónde sale cada uno.
    const now = new Date();
    const winEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const winStart = new Date(winEnd); winStart.setDate(winStart.getDate() - 364);
    const ymOf = (d) => d.getFullYear() + '_' + String(d.getMonth() + 1).padStart(2, '0');
    const months = []; { let y = winStart.getFullYear(), m = winStart.getMonth(); const ey = winEnd.getFullYear(), em = winEnd.getMonth(); while (y < ey || (y === ey && m <= em)) { months.push(y + '_' + String(m + 1).padStart(2, '0')); m++; if (m > 11) { m = 0; y++; } } }
    const accts = new Set([...Object.keys(factMes), ...Object.keys(realMes)]);
    console.log(`\n=== SIMULACIÓN ventana 365 días (${ymOf(winStart)}..${ymOf(winEnd)}) ===`);
    const totalPorCuenta = {};
    for (const a of accts) {
      let tot = 0; const detalle = [];
      for (const ym of months) {
        const [yy, mm] = ym.split('_').map(Number);
        const mStart = new Date(yy, mm - 1, 1), mEnd = new Date(yy, mm, 0), dim = mEnd.getDate();
        const oS = winStart > mStart ? winStart : mStart, oE = winEnd < mEnd ? winEnd : mEnd;
        const overlap = oE < oS ? 0 : Math.round((oE - oS) / 86400000) + 1;
        const frac = dim > 0 ? overlap / dim : 0;
        if (overlap <= 0) continue;
        const congelado = ym < '2026_05'; // igual que FAC_CONGELADO_HASTA en la app
        const real = (realMes[a] || {})[ym] || 0;
        const canc = (parseFloat((factCancel[a] || {})[ym]) || 0) * frac;
        const man = (factMes[a] || {})[ym];
        let val, src;
        if (congelado) { val = (parseFloat(man) || 0) * frac; src = man != null ? 'CONGELADO' : 'vacío'; }
        else if (real > 0 || canc > 0) { val = real + canc; src = 'REAL'; }
        else { val = (parseFloat(man) || 0) * frac; src = man != null ? 'congelado' : 'vacío'; }
        tot += val;
        detalle.push(`${ym}[${src} x${frac.toFixed(2)}]=$${Math.round(val).toLocaleString('es-AR')}`);
      }
      totalPorCuenta[a] = tot;
      console.log(`\n  ${a.toUpperCase()} → TOTAL 365d $${Math.round(tot).toLocaleString('es-AR')}`);
      console.log('     ' + detalle.join('  '));
    }
    console.log('\n=== TOTAL AFIP por cuenta (lo que muestra el monotributo) ===');
    for (const [a, t] of Object.entries(totalPorCuenta)) console.log(`  ${a}: $${Math.round(t).toLocaleString('es-AR')}`);
    return;
  }
  // BILLING_PROBE: busca en la FACTURACIÓN de ML los cargos que NO van por venta (almacenamiento
  // Full, publicidad, cargos de gestión). Prueba varios endpoints de billing y vuelca lo que
  // devuelva, para ubicar de dónde sale el "millón que falta" del arqueo. ACCOUNT=Matias para una sola.
  if (process.env.BILLING_PROBE) {
    const onlyAcc = (process.env.ACCOUNT || '').trim().toLowerCase();
    // Ventanas canónicas de los períodos de facturación de ML (15 del mes anterior al 14).
    const PERIOD_WIN = {
      '2026-05-01': [Date.UTC(2026, 3, 15), Date.UTC(2026, 4, 14, 23, 59, 59)],
      '2026-06-01': [Date.UTC(2026, 4, 15), Date.UTC(2026, 5, 14, 23, 59, 59)],
      '2026-07-01': [Date.UTC(2026, 5, 15), Date.UTC(2026, 6, 14, 23, 59, 59)],
      '2026-08-01': [Date.UTC(2026, 6, 15), Date.UTC(2026, 7, 14, 23, 59, 59)],
    };
    // BILLING_PROBE=calc:<periodo> → calcula el ALMACENAMIENTO real de ese período (total ML facturado
    // − comisión/fijo/envío por venta) por cuenta, y lo GUARDA en cyc/mlapi/storage/periods/<key>.
    if (String(process.env.BILLING_PROBE).startsWith('calc:')) {
      const key = String(process.env.BILLING_PROBE).slice(5).trim();
      const win = PERIOD_WIN[key];
      if (!win) { console.log('Período desconocido:', key); return; }
      const sleepC = (ms) => new Promise((r) => setTimeout(r, ms));
      const perAcct = {}; let total = 0;
      for (const label of labels) {
        const acc = accounts[label];
        if (!acc?.refresh_token) continue;
        const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
        await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
        let bill = null;
        try {
          const pr = await mlGet('/billing/integration/monthly/periods?group=ML&document_type=BILL&limit=13', t.access_token);
          const per = (pr.results || []).find((x) => x.key === key);
          if (per) bill = per.amount;
        } catch (e) { console.log(`   (facturación ${label}: ${String(e.message || '').slice(0, 40)})`); }
        await sleepC(13000);
        const paid = await fetchOrdersRange(acc.seller_id, t.access_token, win[0], win[1]);
        const byId = new Map(paid.map((o) => [o.id, o]));
        let fees = 0, done = 0;
        for (const o of byId.values()) {
          for (const p of (o.payments || [])) {
            if (!p.id) continue;
            let b = null;
            try { const r = await fetch('https://api.mercadopago.com/v1/payments/' + p.id, { headers: { Authorization: 'Bearer ' + t.access_token } }); b = await r.json(); } catch { continue; }
            for (const c of (b?.charges_details || [])) {
              const n = (c.name || '').toLowerCase();
              if (!n.startsWith('tax_withholding')) fees += c.amounts?.original || 0; // todo lo que NO es impuesto = cargo ML por venta
            }
          }
          done++; if (done % 150 === 0) console.log(`   ...${label}: ${done}/${byId.size}`);
        }
        const storage = bill != null ? Math.round(bill - fees) : null;
        perAcct[label.toLowerCase()] = { bill: bill != null ? Math.round(bill) : null, fees: Math.round(fees), storage };
        if (storage != null && storage > 0) total += storage;
        console.log(`▶ ${label} ${key}: facturado ${money(Math.round(bill || 0))} − cargos venta ${money(Math.round(fees))} = almacenamiento ${money(storage || 0)}`);
      }
      const rec = { key, from: new Date(win[0]).toISOString(), to: new Date(win[1]).toISOString(), days: Math.round((win[1] - win[0]) / 86400000) + 1, total: Math.round(total), perAcct, ts: Date.now() };
      await db.set('cyc/mlapi/storage/periods/' + key, rec);
      console.log(`\n✓ Guardado almacenamiento período ${key}: TOTAL ${money(Math.round(total))} · ${rec.days} días · ${money(Math.round(total / rec.days))}/día`);
      return;
    }
    // BILLING_PROBE=post → reparte el almacenamiento guardado en un GASTO DIARIO (backfill desde 1/may + hoy).
    // Idempotente: un gasto por día con id fijo. Barato (no pega a ML). Corre en el robot diario.
    if (process.env.BILLING_PROBE === 'post') {
      const periods = (await db.get('cyc/mlapi/storage/periods')) || {};
      const wins = Object.values(periods).filter((p) => p && p.total > 0).map((p) => ({ from: Date.parse(p.from), to: Date.parse(p.to), rate: p.total / (p.days || 30) }));
      if (!wins.length) { console.log('No hay almacenamiento calculado todavía (corré calc: primero).'); return; }
      const latest = wins.slice().sort((a, b) => b.to - a.to)[0].rate; // para días del período abierto (aún sin cerrar)
      const rateFor = (ms) => { const w = wins.find((x) => ms >= x.from && ms <= x.to); return w ? w.rate : latest; };
      const startMs = Date.UTC(2026, 4, 1); // 1 de mayo 2026
      const now = new Date(); const todayMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
      const updates = {}; let n = 0, sum = 0;
      for (let d = startMs; d <= todayMs; d += 86400000) {
        const dk = dayKeyFromISO(d);
        const monto = Math.round(rateFor(d));
        if (monto <= 0) continue;
        const id = 'almfull_' + dk;
        updates[id] = { id, monto, cat: 'Almacenamiento Full', tipo: 'gasto', desc: 'Almacenamiento Full ML (estimado diario)', dayKey: dk, ts: Date.now(), auto: true };
        n++; sum += monto;
      }
      if (!DRY && Object.keys(updates).length) await db.patch('cyc/compras', updates);
      console.log(`${DRY ? '(DRY) ' : ''}Gasto diario de almacenamiento: ${n} días · total ${money(sum)} (1/may → hoy).`);
      return;
    }
    // BILLING_PROBE=totals → solo el TOTAL facturado por ML (grupo ML) de cada cuenta, por período.
    if (process.env.BILLING_PROBE === 'totals') {
      const sleepT = (ms) => new Promise((r) => setTimeout(r, ms));
      for (const label of labels) {
        const acc = accounts[label];
        if (!acc?.refresh_token) continue;
        const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
        await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
        try {
          const pr = await mlGet('/billing/integration/monthly/periods?group=ML&document_type=BILL&limit=6', t.access_token);
          console.log(`\n▶ ${label}`);
          for (const p of (pr.results || [])) console.log(`   ${p.key} (${p.period?.date_from}→${p.period?.date_to}) [${p.period_status}] = ${money(Math.round(p.amount || 0))}`);
        } catch (e) { console.log(`\n▶ ${label} · ERROR ${String(e.message || '').slice(0, 90)}`); }
        await sleepT(14000); // límite 5/min del billing
      }
      return;
    }
    // BILLING_PROBE=fees → calcula los cargos por venta (comisión+fijo+envío) de un período ML,
    // para restarlos del total facturado y aislar almacenamiento+publicidad (lo que la app no ve).
    if (process.env.BILLING_PROBE === 'fees') {
      const startMs = Date.UTC(2026, 5, 15);            // 15 jun 2026
      const endMs = Date.UTC(2026, 6, 14, 23, 59, 59);  // 14 jul 2026 (= período ML "2026-07-01")
      const PERKEY = '2026-07-01';
      const sleepF = (ms) => new Promise((r) => setTimeout(r, ms));
      const chargeNames = new Set(); // TODOS los conceptos que ML descuenta por venta (prueba de que storage no está)
      let totOculto = 0, totBill = 0, totFees = 0;
      for (const label of labels) {
        if (onlyAcc && label.toLowerCase() !== onlyAcc) continue;
        const acc = accounts[label];
        if (!acc?.refresh_token) continue;
        const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
        await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
        // total que ML te facturó ese período (grupo ML) — oficial
        let bill = null;
        try {
          const pr = await mlGet('/billing/integration/monthly/periods?group=ML&document_type=BILL&limit=13', t.access_token);
          const per = (pr.results || []).find((x) => x.key === PERKEY);
          if (per) bill = per.amount;
        } catch (e) { console.log(`   (no pude leer facturación de ${label}: ${String(e.message || '').slice(0, 50)})`); }
        await sleepF(13000); // límite 5/min del billing
        const paid = await fetchOrdersRange(acc.seller_id, t.access_token, startMs, endMs);
        const byId = new Map(paid.map((o) => [o.id, o]));
        let comision = 0, fijo = 0, envio = 0, otrosML = 0, tax = 0, done = 0;
        for (const o of byId.values()) {
          for (const p of (o.payments || [])) {
            if (!p.id) continue;
            let b = null;
            try { const r = await fetch('https://api.mercadopago.com/v1/payments/' + p.id, { headers: { Authorization: 'Bearer ' + t.access_token } }); b = await r.json(); } catch { continue; }
            for (const c of (b?.charges_details || [])) {
              const amt = c.amounts?.original || 0; const n = (c.name || '').toLowerCase();
              chargeNames.add(c.name || '?');
              if (n.startsWith('tax_withholding')) tax += amt;
              else if (n.includes('percentage_fee')) comision += amt;
              else if (n.includes('flat_fee')) fijo += amt;
              else if (n.includes('shp') || n.includes('shipping') || n.includes('fulfillment')) envio += amt;
              else otrosML += amt;
            }
          }
          done++; if (done % 150 === 0) console.log(`   ...${label}: ${done}/${byId.size}`);
        }
        const feesML = comision + fijo + envio + otrosML;
        console.log(`\n▶ ${label} · período 15/jun–14/jul · ${byId.size} órdenes`);
        console.log(`   Cargos ML por venta (YA en el neto): comisión ${money(comision)} + fijo ${money(fijo)} + envío ${money(envio)}${otrosML ? ' + otros ' + money(otrosML) : ''} = ${money(feesML)}`);
        if (bill != null) {
          const oculto = Math.round(bill - feesML);
          totOculto += oculto; totBill += bill; totFees += feesML;
          console.log(`   TOTAL facturado por ML: ${money(Math.round(bill))}  ➜  cargo NO contado (almacenamiento/gestión) ≈ ${money(oculto)}`);
        }
      }
      console.log(`\n═══ TOTAL 4 CUENTAS (período 15/jun–14/jul) ═══`);
      console.log(`   ML facturó: ${money(Math.round(totBill))} · ya en el neto: ${money(Math.round(totFees))} · NO contado: ${money(Math.round(totOculto))}`);
      console.log(`\nConceptos que ML descuenta POR VENTA (deberían NO incluir almacenamiento/publicidad):`);
      console.log('   ' + [...chargeNames].sort().join(' · '));
      // ¿Ya había algún gasto de almacenamiento/full cargado en CYC?
      const compras = (await db.get('cyc/compras')) || {};
      let totGasto = 0; const sosp = [];
      for (const x of Object.values(compras)) {
        if (!x || x.tipo === 'mercaderia') continue;
        totGasto += x.monto || 0;
        const txt = ((x.cat || '') + ' ' + (x.desc || '')).toLowerCase();
        if (/almacen|full|storage|publicid|dep[oó]sito|comisi|mercadolibre|\bml\b/.test(txt)) sosp.push(`${x.dayKey || '?'} · ${money(x.monto || 0)} · ${x.cat || ''} ${x.desc || ''}`.trim());
      }
      console.log(`\nGastos cargados en CYC (tipo gasto): total ${money(Math.round(totGasto))}`);
      console.log(sosp.length ? '   Posibles de ML/almacenamiento ya cargados:\n   ' + sosp.join('\n   ') : '   ✓ NINGÚN gasto de almacenamiento/Full/ML cargado — nunca se tuvo en cuenta.');
      return;
    }
    for (const label of labels) {
      if (onlyAcc && label.toLowerCase() !== onlyAcc) continue;
      const acc = accounts[label];
      if (!acc?.refresh_token) continue;
      const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
      await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
      const sid = acc.seller_id;
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const key = (process.env.BILLING_PERIOD || '2026-08-01').trim(); // período ABIERTO por defecto
      const tries = [
        `/billing/integration/periods/${key}/group/ML/details?document_type=BILL&offset=0&limit=100`,
        `/billing/integration/periods/${key}/group/ML/documents?document_type=BILL`,
        `/billing/integration/periods/${key}/group/ML/summary?document_type=BILL`,
        '/billing/integration/monthly/periods?group=ML&document_type=BILL&limit=2',
        `/billing/integration/periods/${key}/group/ML/details?document_type=DEBIT_NOTE&offset=0&limit=100`,
      ];
      console.log(`\n═══ BILLING DETAILS · ${label} (seller ${sid}) · período ${key} ═══`);
      for (const path of tries) {
        try {
          const r = await fetch('https://api.mercadolibre.com' + path, { headers: { Authorization: 'Bearer ' + t.access_token } });
          const txt = await r.text();
          console.log(`\n[${r.status}] ${path}`);
          console.log('   ' + txt.slice(0, 1800).replace(/\n/g, ' '));
        } catch (e) { console.log(`\n[ERR] ${path} · ${String(e.message || '').slice(0, 80)}`); }
        await sleep(13000); // límite 5 pedidos/min en billing
      }
      if (onlyAcc) break;
    }
    return;
  }
  // DUMP_MATCH: audita las publicaciones MAL ENGANCHADAS. Para cada publicación con ventas,
  // compara el TÍTULO REAL en ML contra el PRODUCTO que le puso la app. Si casi no comparten
  // palabras, es un enganche equivocado (ej: auriculares Galaxy Buds enganchados al celular A06).
  if (process.env.DUMP_MATCH) {
    const vp = (await db.get('cyc/ventaprod')) || {};
    const links = (await db.get('cyc/mllinks')) || {};
    const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
    const STOP = new Set(['con', 'para', 'the', 'and', 'set', 'kit', 'pack', 'black', 'blanco', 'negro', 'white', 'azul', 'rojo', 'gris', 'unidad', 'unidades']);
    const toks = (s) => norm(s).split(' ').filter((w) => w.length >= 3 && !STOP.has(w));
    const byMla = {};
    for (const day of Object.values(vp)) for (const v of Object.values(day || {})) {
      if (!v || v.cancelada || !v.mla) continue;
      const m = byMla[v.mla] || (byMla[v.mla] = { panelProd: v.prod || '', prodId: v.prodId || null, count: 0, cuenta: v.cuenta || '', total: 0 });
      m.count++; m.total += v.total || 0; if (!m.panelProd && v.prod) m.panelProd = v.prod;
    }
    // agrupar publicaciones por cuenta y traer el título real de ML (multiget de a 20)
    const byLabel = {};
    for (const [mla, info] of Object.entries(byMla)) {
      const lab = labels.find((l) => l.toLowerCase() === String(info.cuenta).toLowerCase()) || null;
      (byLabel[lab] = byLabel[lab] || []).push(mla);
    }
    const titleOf = {};
    for (const label of labels) {
      const list = byLabel[label] || []; if (!list.length) continue;
      const acc = accounts[label]; if (!acc?.refresh_token) continue;
      const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
      await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
      for (let i = 0; i < list.length; i += 20) {
        const chunk = list.slice(i, i + 20);
        let arr; try { arr = await mlGet('/items?ids=' + chunk.join(',') + '&attributes=id,title', t.access_token); } catch { continue; }
        for (const row of (arr || [])) { const b = row.body || {}; if (b.id) titleOf[b.id] = b.title || ''; }
      }
    }
    const rows = [];
    for (const [mla, info] of Object.entries(byMla)) {
      const mlTitle = titleOf[mla] || '';
      const pt = toks(info.panelProd), mt = new Set(toks(mlTitle));
      const shared = pt.filter((w) => mt.has(w)).length;
      const ratio = pt.length ? shared / pt.length : 1;
      rows.push({ mla, ...info, mlTitle, ratio, noTitle: !mlTitle });
    }
    const bad = rows.filter((r) => !r.noTitle && r.ratio < 0.5).sort((a, b) => b.count - a.count);
    console.log('\n=== PUBLICACIONES MAL ENGANCHADAS (título ML ≠ producto de la app) ===');
    console.log(`Publicaciones con ventas: ${rows.length} · con título de ML: ${rows.filter((r) => !r.noTitle).length} · MAL ENGANCHADAS: ${bad.length}\n`);
    for (const r of bad) {
      let e = links[r.mla]; if (typeof e === 'string') e = { prodId: e };
      console.log(`  ${r.mla} · ${r.count} ventas · $${Math.round(r.total).toLocaleString('es-AR')} · cuenta ${r.cuenta}${e && e.ignored ? ' [IGNORADA]' : ''}`);
      console.log(`     ML dice:  "${(r.mlTitle || '').slice(0, 55)}"`);
      console.log(`     App pone: "${(r.panelProd || '').slice(0, 55)}"`);
    }
    const noT = rows.filter((r) => r.noTitle);
    if (noT.length) console.log(`\n(no pude traer título de ML de ${noT.length} publicaciones — token de otra cuenta o dadas de baja)`);
    return;
  }
  // DUMP_SINVIN: diagnostica por qué hay ventas "sin producto" — agrupa por publicación (mla)
  // y dice si esa publicación está en mllinks, si tiene producto asignado y si el producto existe.
  if (process.env.DUMP_SINVIN) {
    const vp = (await db.get('cyc/ventaprod')) || {};
    const map = (await db.get('cyc/mllinks')) || {};
    const byMla = {};
    for (const day of Object.values(vp)) for (const v of Object.values(day || {})) {
      if (!v || !v.sinVincular) continue;
      const mla = v.mla || '(sin mla)';
      if (!byMla[mla]) byMla[mla] = { n: 0, title: v.prod || '' };
      byMla[mla].n += (v.qty || 0);
    }
    const R = { noMla: 0, noLink: 0, ignored: 0, noProdId: 0, prodMissing: 0, shouldFix: 0 };
    const rows = Object.entries(byMla).sort((a, b) => b[1].n - a[1].n);
    console.log(`Publicaciones con ventas SIN PRODUCTO: ${rows.length}\n`);
    for (const [mla, info] of rows.slice(0, 60)) {
      let reason;
      if (mla === '(sin mla)') { reason = 'sin mla'; R.noMla += info.n; }
      else {
        let e = map[mla]; if (typeof e === 'string') e = { prodId: e };
        if (!e) { reason = 'NO está en mllinks'; R.noLink += info.n; }
        else if (e.ignored) { reason = 'marcada IGNORAR'; R.ignored += info.n; }
        else if (!e.prodId) { reason = 'vinculada SIN producto (prodId vacío)'; R.noProdId += info.n; }
        else if (!products.find((p) => p.id === e.prodId)) { reason = 'producto NO existe en catálogo'; R.prodMissing += info.n; }
        else { reason = 'debería arreglarse solo'; R.shouldFix += info.n; }
      }
      console.log(`  ${String(info.n).padStart(4)}u · ${mla} · ${reason} · ${(info.title || '').slice(0, 42)}`);
    }
    console.log(`\nResumen (unidades): sin-mla ${R.noMla} · no-en-mllinks ${R.noLink} · ignorada ${R.ignored} · vinculada-SIN-producto ${R.noProdId} · producto-faltante ${R.prodMissing} · deberían-arreglarse ${R.shouldFix}`);
    return;
  }
  // DUMP_COSTS: mide, sobre las ventas reales, cuánto te queda (neto) según la banda de
  // precio — para saber el rango real de lo que "te sale" vender en Full. Solo lee ventaprod.
  if (process.env.DUMP_COSTS) {
    const days = parseInt(process.env.DUMP_COSTS, 10) || 90;
    const fromKey = dayKeyFromISO(Date.now() - (days - 1) * 864e5);
    const vp = (await db.get('cyc/ventaprod')) || {};
    const bands = [
      { lbl: '< $15.000  ', lo: 0, hi: 15000 },
      { lbl: '$15k – $30k', lo: 15000, hi: 30000 },
      { lbl: '$30k – $45k', lo: 30000, hi: 45000 },
      { lbl: '$45k – $70k', lo: 45000, hi: 70000 },
      { lbl: '> $70.000  ', lo: 70000, hi: Infinity },
    ].map((b) => ({ ...b, arr: [] }));
    for (const [k, ents] of Object.entries(vp)) {
      if (k < fromKey) continue;
      for (const v of Object.values(ents || {})) {
        if (!v || v.cancelada || v.origen !== 'ml-api') continue;
        const total = v.total || 0, neto = v.neto || 0;
        if (total <= 0 || neto <= 0) continue;
        const bk = bands.find((b) => total >= b.lo && total < b.hi);
        if (bk) bk.arr.push({ total, neto, pct: (neto / total) * 100, cost: total - neto });
      }
    }
    const pctl = (a, p) => (a.length ? a[Math.min(a.length - 1, Math.floor((p / 100) * a.length))] : 0);
    const avg = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
    console.log(`CUÁNTO TE QUEDA POR VENTA (últimos ${days} días · ventas reales ml-api, sin canceladas)\n`);
    for (const b of bands) {
      if (!b.arr.length) { console.log(`${b.lbl}: sin ventas`); continue; }
      const pcts = b.arr.map((x) => x.pct).sort((a, c) => a - c);
      const costs = b.arr.map((x) => x.cost).sort((a, c) => a - c);
      const avgPrice = avg(b.arr.map((x) => x.total));
      const avgNeto = avg(b.arr.map((x) => x.neto));
      console.log(`${b.lbl} · ${b.arr.length} ventas · precio prom ${money(avgPrice)}`);
      console.log(`   TE QUEDA: ${pctl(pcts, 10).toFixed(0)}%–${pctl(pcts, 90).toFixed(0)}% del precio (prom ${avg(pcts).toFixed(0)}%) → neto prom ${money(avgNeto)}`);
      console.log(`   TE SALE VENDER: ${money(pctl(costs, 10))} a ${money(pctl(costs, 90))} (prom ${money(avgPrice - avgNeto)})\n`);
    }
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
  if (process.env.DUMP_HISTORY) {
    for (const label of labels) {
      const acc = accounts[label];
      if (!acc?.refresh_token) continue;
      const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
      await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
      const iso = (d) => new Date(d).toISOString().replace(/\.\d+Z$/, '.000-00:00');
      const from365 = iso(Date.now() - 365 * 864e5);
      let total365 = '?', oldest = '?', totalAll = '?', oldestAll = '?';
      try {
        const d1 = await mlGet('/orders/search?' + new URLSearchParams({ seller: String(acc.seller_id), 'order.status': 'paid', 'order.date_created.from': from365, sort: 'date_asc', limit: '1' }), t.access_token);
        total365 = d1.paging?.total; oldest = d1.results?.[0]?.date_created || '—';
      } catch (e) { total365 = 'err ' + e.message.slice(0, 40); }
      try {
        const d2 = await mlGet('/orders/search?' + new URLSearchParams({ seller: String(acc.seller_id), 'order.status': 'paid', sort: 'date_asc', limit: '1' }), t.access_token);
        totalAll = d2.paging?.total; oldestAll = d2.results?.[0]?.date_created || '—';
      } catch (e) { totalAll = 'err ' + e.message.slice(0, 40); }
      console.log(`${label}: ventas últimos 365d = ${total365} (más vieja: ${oldest})  ·  histórico total = ${totalAll} (más vieja: ${oldestAll})`);
    }
    return;
  }
  if (process.env.DUMP_COUNT) {
    const days = parseInt(process.env.DUMP_COUNT, 10) || 365;
    for (const label of labels) {
      const acc = accounts[label];
      if (!acc?.refresh_token) continue;
      const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
      await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
      const orders = await fetchOrdersRange(acc.seller_id, t.access_token, Date.now() - days * 864e5, Date.now());
      const ids = new Set(orders.map((o) => o.id));
      console.log(`${label}: el método por fechas trajo ${orders.length} órdenes (${ids.size} únicas) de ${days} días`);
    }
    return;
  }
  // DUMP_RECON: reconciliación ML ↔ app, por cuenta, últimos N días (default 365).
  // Compara la facturación bruta que ML tiene contra lo que quedó cargado en la app,
  // para ubicar de dónde salen las diferencias (canceladas, ventas faltantes, etc).
  if (process.env.DUMP_RECON) {
    const days = parseInt(process.env.DUMP_RECON, 10) || 365;
    const fromMs = Date.now() - (days - 1) * 864e5;
    const fromKey = dayKeyFromISO(fromMs), toKey = dayKeyFromISO(Date.now());
    const fromISO = new Date(fromMs).toISOString().replace(/\.\d+Z$/, '.000-00:00');
    const grossOf = (o) => (o.order_items || []).reduce((s, it) => s + (it.unit_price || 0) * (it.quantity || 0), 0);
    const vp = (await db.get('cyc/ventaprod')) || {};
    console.log(`RECONCILIACIÓN últimos ${days} días · ventana app ${fromKey} → ${toKey}\n`);
    const acumML = {}, acumApp = {};
    for (const label of labels) {
      const acc = accounts[label];
      if (!acc?.refresh_token) continue;
      const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
      await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
      // ── ML: pagadas (lo que cargamos) + canceladas (informativo) ──
      const paid = await fetchOrdersRange(acc.seller_id, t.access_token, fromMs, Date.now());
      const paidById = new Map(paid.map((o) => [o.id, o]));
      let mlPaidGross = 0; for (const o of paidById.values()) mlPaidGross += grossOf(o);
      const canc = await fetchCancelled(acc.seller_id, t.access_token, fromISO);
      const cancById = new Map(canc.map((o) => [o.id, o]));
      let mlCancGross = 0; for (const o of cancById.values()) mlCancGross += grossOf(o);
      // ── App: lo que quedó cargado en ventaprod para esta cuenta en la ventana ──
      let okN = 0, okSum = 0, cN = 0, cSum = 0;
      for (const [k, ents] of Object.entries(vp)) {
        if (k < fromKey || k > toKey) continue;
        for (const v of Object.values(ents || {})) {
          if ((v.cuenta || '').toLowerCase() !== label.toLowerCase()) continue;
          if (v.cancelada) { cN++; cSum += v.total || 0; }
          else { okN++; okSum += v.total || 0; }
        }
      }
      acumML[label] = { pn: paidById.size, pg: mlPaidGross, cn: cancById.size, cg: mlCancGross };
      acumApp[label] = { okN, okSum, cN, cSum };
      console.log(`▶ ${label}`);
      console.log(`   ML   · pagadas ${paidById.size} = ${money(mlPaidGross)}  ·  canceladas ${cancById.size} = ${money(mlCancGross)}  ·  bruto(pag+canc) = ${money(mlPaidGross + mlCancGross)}`);
      console.log(`   APP  · válidas ${okN} = ${money(okSum)}  ·  canceladas ${cN} = ${money(cSum)}`);
      console.log(`   Δ    · válidas: ML pagadas ${money(mlPaidGross)} − app ${money(okSum)} = ${money(mlPaidGross - okSum)}\n`);
    }
    return;
  }
  // MONTH_NETO: corrobora el NETO de un mes (YYYY_MM) — lo que muestra la web (suma de v.neto)
  // contra el net_received REAL que devuelve Mercado Pago para las órdenes pagadas de ese mes.
  // El neto de la app YA es el net_received de MP (repartido por ítem), así que deberían coincidir;
  // una diferencia marca ventas que faltan o pagos que cambiaron (devoluciones) después de cargarse.
  if (process.env.MONTH_NETO) {
    const ym = String(process.env.MONTH_NETO).trim().replace('-', '_'); // 2026_06
    const [yy, mm] = ym.split('_').map(Number);
    const startMs = new Date(yy, mm - 1, 1).getTime();
    const endMs = new Date(yy, mm, 1).getTime() - 1; // último ms del mes
    const vp = (await db.get('cyc/ventaprod')) || {};
    const app = {};
    for (const [dk, ents] of Object.entries(vp)) {
      if (String(dk).slice(0, 7) !== ym) continue;
      for (const v of Object.values(ents || {})) {
        const a = (v.cuenta || '').toLowerCase();
        app[a] = app[a] || { neto: 0, n: 0, canc: 0 };
        if (v.cancelada) { app[a].canc++; continue; }
        app[a].neto += v.neto || 0; app[a].n++;
      }
    }
    console.log(`=== NETO DEL MES ${ym.replace('_', '-')} · WEB (app) vs MP real (net_received) ===\n`);
    let totApp = 0, totMl = 0;
    for (const label of labels) {
      const acc = accounts[label];
      if (!acc?.refresh_token) continue;
      const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
      await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
      const paid = await fetchOrdersRange(acc.seller_id, t.access_token, startMs, endMs);
      const byId = new Map(paid.map((o) => [o.id, o]));
      let mlNeto = 0, cnt = 0, missing = 0, done = 0;
      for (const o of byId.values()) {
        const net = await orderNet(o, t.access_token);
        done++;
        if (done % 200 === 0) console.log(`   ...${label}: ${done}/${byId.size} órdenes leídas`);
        if (net == null) { missing++; continue; }
        mlNeto += net; cnt++;
      }
      const a = label.toLowerCase();
      const appNeto = Math.round((app[a] && app[a].neto) || 0);
      mlNeto = Math.round(mlNeto);
      totApp += appNeto; totMl += mlNeto;
      const delta = appNeto - mlNeto;
      const pct = mlNeto > 0 ? (delta / mlNeto) * 100 : 0;
      console.log(`▶ ${label}`);
      console.log(`   WEB (app):  ${money(appNeto)}  ·  ${(app[a] && app[a].n) || 0} ventas`);
      console.log(`   MP real:    ${money(mlNeto)}  ·  ${byId.size} órdenes pagadas${missing ? ` (${missing} sin pago leído)` : ''}`);
      console.log(`   Δ = ${money(delta)}  (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)\n`);
    }
    console.log(`=== TOTAL ${ym.replace('_', '-')} ===`);
    console.log(`   WEB (app):  ${money(totApp)}`);
    console.log(`   MP real:    ${money(totMl)}`);
    console.log(`   Δ = ${money(totApp - totMl)}  (${totMl > 0 ? ((totApp - totMl) / totMl * 100).toFixed(2) : '0'}%)`);
    return;
  }
  // CANCEL_AGG: recalcula la facturación de CANCELADAS/DEVUELTAS por cuenta y mes y la guarda
  // en cyc/fact_cancel/{cuenta}. La app la SUMA a la facturación del monotributo para que el
  // número quede idéntico a las "Ventas brutas" de ML (AFIP toma lo facturado, canceladas
  // incluidas). Corre en el workflow diario (barato) y también a mano con este flag.
  if (process.env.CANCEL_AGG) {
    const days = parseInt(process.env.CANCEL_AGG, 10) || 400;
    const fromISO = new Date(Date.now() - days * 864e5).toISOString().replace(/\.\d+Z$/, '.000-00:00');
    for (const label of labels) {
      const acc = accounts[label];
      if (!acc?.refresh_token) continue;
      const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
      await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
      const canc = await fetchCancelled(acc.seller_id, t.access_token, fromISO);
      const seen = new Set(), byMonth = {};
      for (const o of canc) {
        if (seen.has(o.id)) continue; seen.add(o.id); // por si una orden viene repetida
        const gross = (o.order_items || []).reduce((s, it) => s + (it.unit_price || 0) * (it.quantity || 0), 0);
        const ym = dayKeyFromISO(o.date_closed || o.date_created).substring(0, 7); // YYYY_MM
        byMonth[ym] = (byMonth[ym] || 0) + gross;
      }
      for (const k of Object.keys(byMonth)) byMonth[k] = Math.round(byMonth[k]);
      const totCanc = Object.values(byMonth).reduce((s, v) => s + v, 0);
      await db.set('cyc/fact_cancel/' + label.toLowerCase(), byMonth);
      console.log(`${label}: canceladas ${seen.size} · ${Object.keys(byMonth).length} meses · facturado ${money(totCanc)}`);
    }
    return;
  }
  // BACKFILL_RECLAMOS: carga los RECLAMOS históricos (ventas que el comprador recibió y se le
  // devolvió el dinero = producto perdido) como entradas ventaprod marcadas, para que el
  // % de devolución de cada producto sea real (y con eso el "costo real full"). Al reconstruir
  // el año solo cargamos las pagadas, así que estos reclamos faltaban. Misma regla que el robot
  // usa siempre: entregada + cancelada = reclamo (pérdida); no entregada = cancelación (no cuenta).
  if (process.env.BACKFILL_RECLAMOS) {
    const days = parseInt(process.env.BACKFILL_RECLAMOS, 10) || 365;
    const fromISO = new Date(Date.now() - days * 864e5).toISOString().replace(/\.\d+Z$/, '.000-00:00');
    const map = (await db.get('cyc/mllinks')) || {}; // mismo mapa que usa el cargador principal
    const onlyAcc = (process.env.ACCOUNT || '').trim().toLowerCase();
    for (const label of labels) {
      if (onlyAcc && label.toLowerCase() !== onlyAcc) continue;
      const acc = accounts[label];
      if (!acc?.refresh_token) continue;
      const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
      await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
      const cancelled = await fetchCancelled(acc.seller_id, t.access_token, fromISO);
      let nRecl = 0, nDev = 0, nSkip = 0;
      for (const o of cancelled) {
        // la recibió el comprador y se le devolvió el dinero.
        if (!(await wasDelivered(o, t.access_token))) { nSkip++; continue; }
        // ¿volvió el producto al stock (devolución) o se perdió (reclamo real)?
        const tipo = (await wasReturned(o, t.access_token)) ? 'devolucion' : 'reclamo';
        const num = String(o.pack_id || o.id);   // número que muestra ML (pack_id)
        const dayKey = dayKeyFromISO(o.date_closed || o.date_created);
        const saleId = 's' + o.id;
        let i = 0;
        for (const it of (o.order_items || [])) {
          const mla = it.item?.id;
          const title = it.item?.title || '';
          const qty = it.quantity || 0;
          const idx = i; i++;
          let e = mla ? map[mla] : null;
          if (typeof e === 'string') e = { prodId: e };
          const p = (e && e.prodId) ? (products.find((pp) => pp.id === e.prodId) || null) : matchProduct(title, index);
          const id = 'v' + o.id + '_' + idx;
          const obj = {
            id, saleId, prod: p ? p.name : title, prodId: p ? p.id : null,
            cuenta: label, qty, total: 0, neto: 0, costo: 0,
            numVenta: num, mla: mla || '',
            ts: new Date(o.date_closed || o.date_created).getTime(),
            origen: 'ml-api', cancelada: true, tipoCancelacion: tipo,
          };
          if (!p) obj.sinVincular = true;
          if (DRY) console.log(`  [${label}] ${tipo.toUpperCase()} #${num} ${obj.prod} x${qty}`);
          else await db.set(`cyc/ventaprod/${dayKey}/${id}`, obj);
          if (tipo === 'reclamo') nRecl++; else nDev++;
        }
      }
      console.log(`${label}: reclamos con pérdida ${nRecl} · devoluciones (volvió al stock) ${nDev} · sin entregar omitidas ${nSkip}`);
    }
    return;
  }
  // FILL_GESTFULL: estima la GESTIÓN/LOGÍSTICA de Full por unidad de cada producto a partir del
  // cargo real 'shp_fulfillment' que Mercado Pago descuenta en cada venta, y la guarda en
  // cyc/products/{id}/gestFull (para la caja "Costo vender en Full"). Solo mira ventas por
  // encima del umbral de envío gratis (las de abajo no pagan Full al vendedor). Promedio por unidad.
  if (process.env.FILL_GESTFULL) {
    const days = parseInt(process.env.FILL_GESTFULL, 10) || 90;
    const MIN_GROSS = 25000; // debajo del umbral de envío gratis no hay cargo Full al vendedor
    const map = (await db.get('cyc/mllinks')) || {};
    const onlyAcc = (process.env.ACCOUNT || '').trim().toLowerCase();
    const agg = {}; // prodId -> { sum, n, name }
    for (const label of labels) {
      if (onlyAcc && label.toLowerCase() !== onlyAcc) continue;
      const acc = accounts[label];
      if (!acc?.refresh_token) continue;
      const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
      await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
      const orders = await fetchOrdersRange(acc.seller_id, t.access_token, Date.now() - days * 864e5, Date.now());
      let nFetch = 0;
      for (const o of orders) {
        const items = o.order_items || [];
        const orderGross = items.reduce((s, it) => s + (it.unit_price || 0) * (it.quantity || 0), 0);
        if (orderGross < MIN_GROSS) continue; // barato → el comprador paga el envío, no hay cargo Full
        let shp = 0, got = false;
        for (const p of (o.payments || [])) {
          try {
            const r = await fetch('https://api.mercadopago.com/v1/payments/' + p.id, { headers: { Authorization: 'Bearer ' + t.access_token } });
            const b = await r.json();
            for (const c of (b?.charges_details || [])) if (String(c.name).includes('shp_fulfillment')) { shp += (c.amounts?.original || 0); got = true; }
          } catch { /* */ }
        }
        nFetch++;
        if (!got || shp <= 0) continue;
        const units = items.reduce((s, it) => s + (it.quantity || 0), 0) || 1;
        const perUnit = shp / units;
        for (const it of items) {
          const mla = it.item?.id;
          let e = mla ? map[mla] : null;
          if (typeof e === 'string') e = { prodId: e };
          const p = (e && e.prodId) ? (products.find((pp) => pp.id === e.prodId) || null) : matchProduct(it.item?.title || '', index);
          if (!p) continue;
          if (!agg[p.id]) agg[p.id] = { sum: 0, n: 0, name: p.name };
          agg[p.id].sum += perUnit; agg[p.id].n += 1;
        }
      }
      console.log(`  ${label}: ${nFetch} ventas ≥ $${MIN_GROSS} revisadas`);
    }
    let nProd = 0;
    for (const [pid, a] of Object.entries(agg)) {
      const gest = Math.round(a.sum / a.n);
      if (gest <= 0) continue;
      if (DRY) console.log(`  ${a.name}: gestión Full ≈ $${gest.toLocaleString('es-AR')} (de ${a.n} venta/s)`);
      else await db.set('cyc/products/' + pid + '/gestFull', gest);
      nProd++;
    }
    console.log(`Gestión Full ${DRY ? 'estimada (DRY)' : 'guardada'} para ${nProd} productos (ventas ≥ $${MIN_GROSS}, ${days} días).`);
    return;
  }
  // BACKFILL_NUMVENTA: pasa el número de venta guardado (order.id) al que muestra ML en la web
  // (pack_id). El pack_id viene en la búsqueda de órdenes, así que no hace falta pedir orden por
  // orden. Actualiza las ventas ya cargadas para que el número coincida con ML.
  if (process.env.BACKFILL_NUMVENTA) {
    const days = parseInt(process.env.BACKFILL_NUMVENTA, 10) || 365;
    const onlyAcc = (process.env.ACCOUNT || '').trim().toLowerCase();
    const fromISO = new Date(Date.now() - days * 864e5).toISOString().replace(/\.\d+Z$/, '.000-00:00');
    const packMap = {}; // order.id -> pack_id (solo donde difieren)
    for (const label of labels) {
      if (onlyAcc && label.toLowerCase() !== onlyAcc) continue;
      const acc = accounts[label];
      if (!acc?.refresh_token) continue;
      const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
      await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
      const paid = await fetchOrdersRange(acc.seller_id, t.access_token, Date.now() - days * 864e5, Date.now());
      for (const o of paid) if (o.pack_id && String(o.pack_id) !== String(o.id)) packMap[String(o.id)] = String(o.pack_id);
      const canc = await fetchCancelled(acc.seller_id, t.access_token, fromISO);
      for (const o of canc) if (o.pack_id && String(o.pack_id) !== String(o.id)) packMap[String(o.id)] = String(o.pack_id);
      console.log(`  ${label}: ${paid.length} pagadas + ${canc.length} canceladas revisadas`);
    }
    const vp = (await db.get('cyc/ventaprod')) || {};
    const updates = {}; let n = 0;
    for (const [dk, day] of Object.entries(vp)) {
      for (const [id, v] of Object.entries(day || {})) {
        if (!v) continue;
        const oid = String(v.saleId || '').replace(/^s/, '') || String(id).replace(/^v/, '').replace(/_\d+$/, '');
        const pack = packMap[oid];
        if (pack && String(v.numVenta) !== pack) { updates[`${dk}/${id}/numVenta`] = pack; n++; }
      }
    }
    const keys = Object.keys(updates);
    if (!DRY) await db.set('ventaprod', null); // limpiar basura de una corrida vieja (bug de prefijo)
    for (let i = 0; i < keys.length; i += 2000) {
      const chunk = {}; keys.slice(i, i + 2000).forEach((k) => chunk[k] = updates[k]);
      if (!DRY) await db.patch('cyc/ventaprod', chunk);
    }
    console.log(`Número de venta → pack_id: ${n} ventas actualizadas${DRY ? ' (DRY)' : ''} · ${Object.keys(packMap).length} órdenes con pack distinto`);
    return;
  }
  // BACKUP_VP: copia de seguridad de todas las ventas actuales (por si hay que volver atrás)
  if (process.env.BACKUP_VP) {
    const vp = (await db.get('cyc/ventaprod')) || {};
    let n = 0; for (const day of Object.values(vp)) n += Object.keys(day || {}).length;
    await db.set('cyc/ventaprod_bak', vp);
    console.log(`✓ Backup hecho: ${n} ventas copiadas a cyc/ventaprod_bak`);
    return;
  }
  // PURGE_VP: borra todas las ventas (SOLO si ya existe el backup). Para el rebuild.
  if (process.env.PURGE_VP) {
    const bak = await db.get('cyc/ventaprod_bak');
    if (!bak) { console.log('✗ No hay backup (cyc/ventaprod_bak). No borro nada.'); return; }
    let nb = 0; for (const day of Object.values(bak)) nb += Object.keys(day || {}).length;
    await db.set('cyc/ventaprod', null);
    console.log(`✓ Ventas borradas. (Backup a salvo con ${nb} ventas en cyc/ventaprod_bak.)`);
    return;
  }
  // RESTORE_VP: vuelve atrás desde el backup (por si algo salió mal).
  if (process.env.RESTORE_VP) {
    const bak = await db.get('cyc/ventaprod_bak');
    if (!bak) { console.log('✗ No hay backup para restaurar.'); return; }
    await db.set('cyc/ventaprod', bak);
    console.log('✓ Ventas restauradas desde el backup.');
    return;
  }
  // CLEAN_VP: limpieza SELECTIVA de ventas. Deja solo las ventas CONFIABLES de los
  // últimos N meses (por defecto 12): las que trajo el robot (origen ml-api) y tienen
  // número de venta. Borra el resto: viejas, sin nº de venta o cargadas a mano (no
  // confiables). Con DRY_RUN=1 solo muestra qué borraría (no toca nada). En firme
  // hace backup a cyc/ventaprod_bak ANTES de borrar (se puede restaurar con RESTORE_VP).
  if (process.env.CLEAN_VP) {
    const months = parseInt(process.env.CLEAN_VP, 10) || 12;
    const cutoff = Date.now() - Math.round(months * 30.44 * 864e5);
    const vp = (await db.get('cyc/ventaprod')) || {};
    let total = 0, keep = 0, delOld = 0, delNoNum = 0, delNotApi = 0;
    const delPaths = []; const sample = [];
    for (const [dk, day] of Object.entries(vp)) {
      for (const [id, v] of Object.entries(day || {})) {
        if (!v) continue;
        total++;
        const ts = v.ts || Date.parse(String(dk).replace(/_/g, '-')) || 0;
        const old = !!ts && ts < cutoff;
        const noNum = !v.numVenta;
        const notApi = v.origen !== 'ml-api';
        if (old || noNum || notApi) {
          if (old) delOld++; if (noNum) delNoNum++; if (notApi) delNotApi++;
          delPaths.push(`${dk}/${id}`);
          if (sample.length < 25) sample.push(`${dk} #${v.numVenta || 'SIN Nº'} [${v.origen || '?'}] ${(v.prod || '').slice(0, 28)}`);
        } else keep++;
      }
    }
    console.log(`\n=== LIMPIEZA de ventas (dejar solo confiables de ${months} meses) ===`);
    console.log(`Total actual: ${total}`);
    console.log(`QUEDAN (ml-api + con nº venta + últimos ${months} meses): ${keep}`);
    console.log(`A BORRAR: ${delPaths.length}`);
    console.log(`  · más de ${months} meses: ${delOld}`);
    console.log(`  · sin número de venta: ${delNoNum}`);
    console.log(`  · cargadas a mano (no ml-api): ${delNotApi}`);
    console.log('  (un misma venta puede contar en varios motivos)');
    console.log('Ejemplos de las que se borrarían:');
    sample.forEach((s) => console.log('   ✕ ' + s));
    if (DRY) { console.log('\n(DRY: no se borró nada. Sacá el modo prueba para ejecutar.)'); return; }
    await db.set('cyc/ventaprod_bak', vp);
    console.log(`\n✓ Backup de las ${total} ventas en cyc/ventaprod_bak (se puede restaurar con RESTORE_VP).`);
    for (let i = 0; i < delPaths.length; i += 2000) {
      const chunk = {}; delPaths.slice(i, i + 2000).forEach((p) => chunk[p] = null);
      await db.patch('cyc/ventaprod', chunk);
    }
    console.log(`✓ Borradas ${delPaths.length} ventas. Quedaron ${keep} confiables de los últimos ${months} meses.`);
    return;
  }
  // FILL_GASTOS: crea un gasto mensual estimado ($800.000) en cada mes que TENGA
  // ventas y NO tenga ningún gasto cargado. Así la "Ganancia CYC" descuenta gastos
  // reales en todos los meses viejos. Id determinístico (cest_AAAA_MM) → no duplica
  // si se vuelve a correr. Con DRY_RUN=1 solo muestra qué meses rellenaría.
  if (process.env.FILL_GASTOS) {
    const amount = 800000;
    const vp = (await db.get('cyc/ventaprod')) || {};
    const compras = (await db.get('cyc/compras')) || {};
    const salesMonths = new Set();
    for (const [dk, day] of Object.entries(vp)) {
      const ym = String(dk).slice(0, 7); // AAAA_MM
      for (const v of Object.values(day || {})) { if (v && !v.cancelada) { salesMonths.add(ym); break; } }
    }
    const gastoMonths = new Set();
    for (const x of Object.values(compras)) {
      if (x && x.tipo !== 'mercaderia' && x.dayKey) gastoMonths.add(String(x.dayKey).slice(0, 7));
    }
    const toAdd = [...salesMonths].filter((ym) => !gastoMonths.has(ym)).sort();
    console.log(`\n=== GASTO ESTIMADO $${amount.toLocaleString('es-AR')} por mes ===`);
    console.log(`Meses con ventas: ${salesMonths.size} · ya con gastos: ${gastoMonths.size} · a rellenar: ${toAdd.length}`);
    toAdd.forEach((ym) => console.log(`  + ${ym.replace('_', '-')}`));
    if (DRY) { console.log('\n(DRY: no se escribió nada.)'); return; }
    const updates = {};
    for (const ym of toAdd) {
      const id = 'cest_' + ym;
      updates[id] = {
        id, monto: amount, cat: 'Gastos estimados', tipo: 'gasto',
        desc: 'Gasto mensual estimado (automático)', ts: Date.now(), dayKey: ym + '_01',
      };
    }
    if (Object.keys(updates).length) await db.patch('cyc/compras', updates);
    console.log(`\n✓ Creados ${toAdd.length} gastos de $${amount.toLocaleString('es-AR')} (uno por mes sin gastos).`);
    return;
  }
  // PURGE_BEFORE: borra las ventas ANTERIORES a una fecha (ej 2026_01_01) para arrancar
  // de cero ese año y aliviar la app. ANTES de borrar, CONGELA la facturación bruta
  // (pagadas + canceladas) de cada mes viejo en el dato AFIP mensual (cyc/fact_mes),
  // así el monotributo sigue restando esos meses igual que ahora. Backup de ventaprod,
  // fact_mes y fact_cancel en *_bak. Con DRY_RUN=1 solo muestra qué haría.
  if (process.env.PURGE_BEFORE) {
    const cutoff = String(process.env.PURGE_BEFORE).trim(); // ej 2026_01_01
    const vp = (await db.get('cyc/ventaprod')) || {};
    const factMes = (await db.get('cyc/fact_mes')) || {};
    const factCancel = (await db.get('cyc/fact_cancel')) || {};
    const frozen = {}; // acct → ym → facturación bruta del mes
    const delPaths = []; const delMonths = new Set();
    let total = 0;
    for (const [dk, day] of Object.entries(vp)) {
      for (const [id, v] of Object.entries(day || {})) {
        if (!v) continue; total++;
        if (String(dk) < cutoff) {
          delPaths.push(`${dk}/${id}`);
          const ym = String(dk).slice(0, 7); delMonths.add(ym);
          if (!v.cancelada) {
            const a = (v.cuenta || '').toLowerCase();
            frozen[a] = frozen[a] || {}; frozen[a][ym] = (frozen[a][ym] || 0) + (v.total || 0);
          }
        }
      }
    }
    // sumar las canceladas/devueltas (fact_cancel) de esos meses a la bruta congelada
    for (const [a, bym] of Object.entries(factCancel)) {
      for (const [ym, val] of Object.entries(bym || {})) {
        if (delMonths.has(ym)) { const la = a.toLowerCase(); frozen[la] = frozen[la] || {}; frozen[la][ym] = (frozen[la][ym] || 0) + (parseFloat(val) || 0); }
      }
    }
    console.log(`\n=== ARRANCAR DE CERO antes de ${cutoff} ===`);
    console.log(`Total ventas: ${total} · a borrar: ${delPaths.length} · quedan: ${total - delPaths.length}`);
    console.log('Facturación AFIP que queda CONGELADA por mes (cyc/fact_mes):');
    for (const [a, bym] of Object.entries(frozen)) for (const [ym, val] of Object.entries(bym)) console.log(`  ${a} ${ym.replace('_', '-')}: $${Math.round(val).toLocaleString('es-AR')}`);
    if (DRY) { console.log('\n(DRY: no se tocó nada.)'); return; }
    await db.set('cyc/ventaprod_bak', vp);
    await db.set('cyc/fact_mes_bak', factMes);
    await db.set('cyc/fact_cancel_bak', factCancel);
    console.log('✓ Backups en cyc/ventaprod_bak, cyc/fact_mes_bak, cyc/fact_cancel_bak.');
    const fmUpd = {}; const fcDel = {};
    for (const [a, bym] of Object.entries(frozen)) for (const [ym, val] of Object.entries(bym)) fmUpd[`${a}/${ym}`] = Math.round(val);
    for (const [a, bym] of Object.entries(factCancel)) for (const ym of Object.keys(bym || {})) if (delMonths.has(ym)) fcDel[`${a}/${ym}`] = null;
    if (Object.keys(fmUpd).length) await db.patch('cyc/fact_mes', fmUpd);
    if (Object.keys(fcDel).length) await db.patch('cyc/fact_cancel', fcDel);
    for (let i = 0; i < delPaths.length; i += 2000) { const chunk = {}; delPaths.slice(i, i + 2000).forEach((p) => chunk[p] = null); await db.patch('cyc/ventaprod', chunk); }
    console.log(`✓ Borradas ${delPaths.length} ventas · fact_mes congelado en ${Object.keys(fmUpd).length} meses/cuenta.`);
    return;
  }
  // PURGE_GASTOS: borra los GASTOS (no la mercadería) anteriores a una fecha (ej 2026_01_01),
  // para arrancar limpio también los gastos. Backup de compras en cyc/compras_bak. DRY_RUN=1 = prueba.
  if (process.env.PURGE_GASTOS) {
    const cutoff = String(process.env.PURGE_GASTOS).trim();
    const compras = (await db.get('cyc/compras')) || {};
    const delIds = [];
    for (const [id, x] of Object.entries(compras)) {
      if (!x) continue;
      const dk = String(x.dayKey || '');
      if (dk && dk < cutoff && x.tipo !== 'mercaderia') delIds.push(id);
    }
    console.log(`\n=== BORRAR GASTOS antes de ${cutoff} ===`);
    console.log(`Gastos a borrar: ${delIds.length} (de ${Object.keys(compras).length} compras/gastos en total)`);
    delIds.slice(0, 60).forEach((id) => { const x = compras[id]; console.log(`  ✕ ${x.dayKey} · $${(x.monto || 0).toLocaleString('es-AR')} · ${x.cat || ''} ${x.desc || ''}`.trim()); });
    if (DRY) { console.log('\n(DRY: no se borró nada.)'); return; }
    await db.set('cyc/compras_bak', compras);
    const upd = {}; delIds.forEach((id) => upd[id] = null);
    if (Object.keys(upd).length) await db.patch('cyc/compras', upd);
    console.log(`\n✓ Borrados ${delIds.length} gastos (backup en cyc/compras_bak).`);
    return;
  }
  // RESYNC_VP: re-sincroniza TODAS las ventas al producto que HOY tiene su publicación
  // (según cyc/mllinks). Arregla las ventas que quedaron con el nombre viejo cuando se
  // cambió un match y no se reflejó. Actualiza nombre, prodId, variante y costo. Backup
  // en cyc/ventaprod_bak. DRY_RUN=1 solo muestra cuántas cambiarían, por producto.
  if (process.env.RESYNC_VP) {
    const vp = (await db.get('cyc/ventaprod')) || {};
    const map = (await db.get('cyc/mllinks')) || {};
    const tc = parseFloat(((await db.get('cyc/finanzas')) || {}).tipo_cambio) || 1500;
    const updates = {}; let n = 0; const byProd = {};
    for (const [dk, day] of Object.entries(vp)) {
      for (const [id, v] of Object.entries(day || {})) {
        if (!v || !v.mla) continue;
        const e = map[v.mla];
        if (!e || !e.prodId || e.ignored) continue; // solo publicaciones vinculadas
        const p = products.find((pp) => pp.id === e.prodId);
        if (!p) continue;
        const wantVar = e.variant || '';
        // Solo corregir cuando el PRODUCTO es realmente distinto (o quedó sin vincular).
        // NO tocamos la variante salvo que la publicación fije una: así no borramos los
        // colores/aromas por-venta de sábanas, Paulvic, Victoria's, etc.
        const prodDiff = (v.prodId || null) !== p.id;
        if (!prodDiff && !v.sinVincular) continue;
        const { costo, costBaseUSD, shipUSD } = costoPesos(p, v.qty || 1, v.tcSale || tc);
        const b = `${dk}/${id}/`;
        updates[b + 'prod'] = p.name; updates[b + 'prodId'] = p.id; updates[b + 'sinVincular'] = null;
        if (wantVar) updates[b + 'variante'] = wantVar; // solo si la publicación fija variante
        if (!v.cancelada) { updates[b + 'costo'] = costo; updates[b + 'costBaseUSD'] = costBaseUSD; updates[b + 'shipUSD'] = shipUSD; }
        byProd[`${v.prod || '(sin nombre)'} → ${p.name}`] = (byProd[`${v.prod || '(sin nombre)'} → ${p.name}`] || 0) + 1;
        n++;
      }
    }
    console.log(`\n=== RE-SINCRONIZAR ventas al producto de su publicación ===`);
    console.log(`Ventas a corregir: ${n}`);
    Object.entries(byProd).sort((a, b) => b[1] - a[1]).forEach(([k, c]) => console.log(`  ${c} ×  ${k}`));
    if (DRY) { console.log('\n(DRY: no se tocó nada.)'); return; }
    if (n) {
      await db.set('cyc/ventaprod_bak', vp);
      const keys = Object.keys(updates);
      for (let i = 0; i < keys.length; i += 3000) { const chunk = {}; keys.slice(i, i + 3000).forEach((k) => chunk[k] = updates[k]); await db.patch('cyc/ventaprod', chunk); }
    }
    console.log(`\n✓ Re-sincronizadas ${n} ventas (backup en cyc/ventaprod_bak).`);
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
    // palabras que NO distinguen el aroma (marca + genéricos de perfumería)
    const GEN_M = new Set(['hombre', 'men', 'masculino', 'man']);
    const GEN_F = new Set(['mujer', 'lady', 'women', 'woman', 'femenino']);
    const NOISE = new Set(['paulvic', 'victoria', 'victorias', 'secret', 'perfume', 'eau', 'de', 'del', 'la',
      'parfum', 'ml', 'x', 'body', 'mist', 'splash', 'spray', 'fragancia', 'floral', 'frutal', 'intenso',
      'citrico', 'acuatico', 'aromatico', 'herbal', 'notas', 'formato', 'unidad', 'volumen', 'para',
      'vaporizador', 'elegante', 'fresco', 'florales', 'orientales', 'du', 'l', 'for', 'dulce', 'vainilla']);
    const genderOf = (toks) => { let g = ''; for (const w of toks) { if (GEN_M.has(w)) g = 'm'; else if (GEN_F.has(w)) g = 'f'; } return g; };
    const aromaToks = (toks) => toks.filter((w) => !NOISE.has(w) && !GEN_M.has(w) && !GEN_F.has(w) && !/^\d+$/.test(w));
    const matchVar = (title, variantes) => {
      const tt = norm(title).split(' ').filter(Boolean);
      const tset = new Set(tt);
      const tg = genderOf(tt);
      let best = '', bestScore = -1;
      for (const v of (variantes || [])) {
        const vt = norm(v).split(' ').filter(Boolean);
        const va = aromaToks(vt);
        if (!va.length) continue;
        if (!va.every((w) => tset.has(w))) continue;          // el aroma tiene que estar en el título
        const vg = genderOf(vt);
        if (vg && tg && vg !== tg) continue;                   // género opuesto → descartar
        let score = va.length * 10;                            // más palabras de aroma = más específico
        if (vg && tg && vg === tg) score += 5;                 // coincide el género
        if (score > bestScore) { bestScore = score; best = v; }
      }
      return best;
    };
    const upd = {};
    for (const f of fams) {
      const p = products.find((pp) => norm(pp.name) === norm(f.prod));
      if (!p) { console.log('✗ No encontré el producto', f.prod); continue; }
      let nNew = 0, nVar = 0, nRev = 0;
      console.log(`\n═══ ${f.prod} (${(p.variantes || []).length} variantes) ═══`);
      for (const [mla, e] of Object.entries(map)) {
        if (!e || e.ignored) continue;
        const linkedHere = e.prodId === p.id;              // ya vinculada a este producto
        const isFam = norm(e.title).includes(norm(f.kw));  // el título es de esta familia
        if (linkedHere) {
          if (e.variant) continue;                         // ya tiene variante → respetar
        } else if (e.prodId || !isFam) {
          continue;                                        // mapeada a otra cosa, o no es de la familia
        }
        const variant = matchVar(e.title, p.variantes);
        if (linkedHere && !variant) {                      // ya vinculada pero no encontré la variante
          console.log(`  ⚠️ sin variante (revisá) · ${e.title}`); nRev++; continue;
        }
        const entry = { prodId: p.id, variant, title: e.title || '', cuenta: e.cuenta || '', status: e.status || '', sold: e.sold || 0, manual: true };
        upd[mla] = entry; map[mla] = entry;
        if (linkedHere) { nVar++; console.log(`  ✓ variante puesta → ${variant} · ${e.title}`); }
        else { nNew++; console.log(`  ${variant ? '→ ' + variant : '⚠️ SIN VARIANTE'} · ${e.title}`); if (!variant) nRev++; }
      }
      console.log(`  Nuevas vinculadas: ${nNew} · Variantes completadas: ${nVar} · Para revisar: ${nRev}`);
    }
    if (!process.env.DRY_RUN && Object.keys(upd).length) {
      await db.patch('cyc/mllinks', upd);
      console.log(`\n✓ Guardado en el panel: ${Object.keys(upd).length} publicaciones.`);
    } else {
      console.log('\n(DRY_RUN: no guardé nada)');
    }
    return;
  }

  // AUTOLINK_IGNORED: publicaciones marcadas IGNORAR que igual tienen ventas "sin producto".
  // Las des-ignora y las auto-vincula (Paulvic/Victoria a su producto con variante; el resto
  // por palabras contra el catálogo) y completa sus ventas. Las que no matchean quedan listadas.
  if (process.env.AUTOLINK_IGNORED) {
    const fams = [{ kw: 'paulvic', prod: 'Paulvic TODOS' }, { kw: 'victoria', prod: "Victoria's Secret" }];
    const GEN_M = new Set(['hombre', 'men', 'masculino', 'man']);
    const GEN_F = new Set(['mujer', 'lady', 'women', 'woman', 'femenino']);
    const NOISE = new Set(['paulvic', 'victoria', 'victorias', 'secret', 'perfume', 'eau', 'de', 'del', 'la',
      'parfum', 'ml', 'x', 'body', 'mist', 'splash', 'spray', 'fragancia', 'floral', 'frutal', 'intenso',
      'citrico', 'acuatico', 'aromatico', 'herbal', 'notas', 'formato', 'unidad', 'volumen', 'para',
      'vaporizador', 'elegante', 'fresco', 'florales', 'orientales', 'du', 'l', 'for', 'dulce', 'vainilla']);
    const genderOf = (tk) => { let g = ''; for (const w of tk) { if (GEN_M.has(w)) g = 'm'; else if (GEN_F.has(w)) g = 'f'; } return g; };
    const aromaToks = (tk) => tk.filter((w) => !NOISE.has(w) && !GEN_M.has(w) && !GEN_F.has(w) && !/^\d+$/.test(w));
    const matchVar = (title, variantes) => {
      const tt = norm(title).split(' ').filter(Boolean); const tset = new Set(tt); const tg = genderOf(tt);
      let best = '', bestScore = -1;
      for (const v of (variantes || [])) {
        const vt = norm(v).split(' ').filter(Boolean); const va = aromaToks(vt);
        if (!va.length || !va.every((w) => tset.has(w))) continue;
        const vg = genderOf(vt); if (vg && tg && vg !== tg) continue;
        let score = va.length * 10; if (vg && tg && vg === tg) score += 5;
        if (score > bestScore) { bestScore = score; best = v; }
      }
      return best;
    };
    const famProd = {}; for (const f of fams) famProd[f.kw] = products.find((pp) => norm(pp.name) === norm(f.prod));
    const vp = (await db.get('cyc/ventaprod')) || {};
    // 1) publicaciones (mla) con ventas sin producto
    const salesByMla = {};
    for (const day of Object.values(vp)) for (const v of Object.values(day || {})) {
      if (!v || !v.sinVincular || !v.mla) continue;
      if (!(v.mla in salesByMla)) salesByMla[v.mla] = v.prod || '';
    }
    const mapUpd = {}; const linked = []; const unmatched = [];
    for (const [mla, title] of Object.entries(salesByMla)) {
      const e = map[mla] || {};
      if (e.prodId) continue; // ya vinculada
      let prodId = null, variant = '';
      let fam = null; for (const f of fams) if (norm(title).includes(norm(f.kw)) && famProd[f.kw]) { fam = f; break; }
      if (fam) { const p = famProd[fam.kw]; prodId = p.id; variant = matchVar(title, p.variantes) || ''; }
      else { const p = matchProduct(title, index); if (p) prodId = p.id; }
      if (prodId) {
        const entry = { prodId, variant, title: e.title || title, cuenta: e.cuenta || '', status: e.status || '', sold: e.sold || 0, manual: true };
        mapUpd[mla] = entry; map[mla] = entry; // des-ignora (queda vinculada normal)
        linked.push({ mla, variant, title });
      } else {
        // no hay producto en el catálogo: des-ignorar igual para que aparezca
        // como PENDIENTE en Vinculaciones y se pueda machear/crear a mano.
        const entry = { prodId: null, variant: '', title: e.title || title, cuenta: e.cuenta || '', status: e.status || '', sold: e.sold || 0 };
        mapUpd[mla] = entry; map[mla] = entry;
        unmatched.push({ mla, title });
      }
    }
    if (!DRY && Object.keys(mapUpd).length) await db.patch('cyc/mllinks', mapUpd);
    // 2) completar las ventas de esas publicaciones (retro-relleno)
    const vpUpd = {}; let rf = 0;
    for (const [dk, day] of Object.entries(vp)) {
      for (const [id, v] of Object.entries(day || {})) {
        if (!v || !v.sinVincular || !v.mla) continue;
        const e = map[v.mla]; if (!e || !e.prodId) continue;
        const p = products.find((pp) => pp.id === e.prodId); if (!p) continue;
        const { costo, costBaseUSD, shipUSD } = costoPesos(p, v.qty || 1, v.tcSale || tc);
        const b = `${dk}/${id}/`;
        vpUpd[b + 'prod'] = p.name; vpUpd[b + 'prodId'] = p.id; vpUpd[b + 'sinVincular'] = null;
        vpUpd[b + 'costo'] = costo; vpUpd[b + 'costBaseUSD'] = costBaseUSD; vpUpd[b + 'shipUSD'] = shipUSD;
        if (e.variant) vpUpd[b + 'variante'] = e.variant;
        rf++;
      }
    }
    const keys = Object.keys(vpUpd);
    if (!DRY) await db.set('ventaprod', null); // limpiar basura de una corrida vieja (bug de prefijo)
    for (let i = 0; i < keys.length; i += 3000) { const chunk = {}; keys.slice(i, i + 3000).forEach((k) => chunk[k] = vpUpd[k]); if (!DRY) await db.patch('cyc/ventaprod', chunk); }
    console.log(`Vinculadas ${linked.length} publicaciones · ventas completadas ${rf}${DRY ? ' (DRY)' : ''}`);
    console.log(`Sin match (para crear/asignar a mano): ${unmatched.length}`);
    unmatched.slice(0, 60).forEach((u) => console.log(`  · ${u.mla} · ${u.title.slice(0, 50)}`));
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
    // acepta uno o varios números separados por coma (para comparar ventas).
    const oids = String(process.env.DUMP_ORDER).split(',').map((s) => s.trim()).filter(Boolean);
    const vp = (await db.get('cyc/ventaprod')) || {};
    for (const oidIn of oids) {
      // 1) qué quedó guardado en el panel. Además, sacamos el order.id interno
      // (guardado como id='v'+order.id+'_'+idx / saleId='s'+order.id) para poder
      // pedir la orden a ML aunque nos hayan pasado el nº de venta (pack_id).
      let orderId = oidIn;
      for (const day of Object.values(vp)) {
        for (const [k, v] of Object.entries(day || {})) {
          if (v && String(v.numVenta) === oidIn) {
            console.log('PANEL:', JSON.stringify({
              prod: v.prod, mla: v.mla || '(sin mla)', prodId: v.prodId || null,
              total: v.total, neto: v.neto, costo: v.costo,
              origen: v.origen, cancelada: v.cancelada || false, tipo: v.tipoCancelacion || '',
            }));
            const m = String(v.saleId || v.id || k).match(/(\d{6,})/);
            if (m) orderId = m[1];
          }
        }
      }
      const oid = orderId;
      if (oid !== oidIn) console.log(`  (nº venta ${oidIn} → order.id ${oid})`);
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
        console.log('  order.id:', full.id, '· pack_id:', full.pack_id, '· shipping.id:', full.shipping?.id);
        console.log('  tags:', JSON.stringify(full.tags || []));
        console.log('  status_detail:', JSON.stringify(full.status_detail), '· cancel_detail:', JSON.stringify(full.cancel_detail));
        console.log('  mediations:', JSON.stringify(full.mediations || []));
        // claims/returns: ¿la devolución volvió al stock (restock) o se perdió?
        try {
          const cl = await mlGet('/post-purchase/v1/claims/search?resource=order&resource_id=' + full.id, t.access_token);
          console.log('  CLAIMS:', JSON.stringify((cl.data || cl.results || []).map((c) => ({
            id: c.id, type: c.type, status: c.status, stage: c.stage,
            reason: c.reason_id, resolution: c.resolution && (c.resolution.reason || c.resolution.closed_by || c.resolution),
          }))));
        } catch (e) { console.log('  CLAIMS error', String(e.message || '').slice(0, 60)); }
        console.log('  total_amount:', full.total_amount, 'paid_amount:', full.paid_amount);
        console.log('  items:', JSON.stringify((full.order_items || []).map((it) => ({
          mla: it.item?.id, varId: it.item?.variation_id || null,
          t: (it.item?.title || '').slice(0, 40), unit: it.unit_price, qty: it.quantity, fee: it.sale_fee,
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
        // 3) detalle del ENVÍO: destino + costo de lista + descuento de reputación + lo que pagás.
        const shipId = full.shipping?.id;
        if (shipId) {
          try {
            const s = await mlGet('/shipments/' + shipId, t.access_token);
            const addr = s.receiver_address || {};
            const so = s.shipping_option || {};
            console.log('  ENVÍO', shipId, JSON.stringify({
              destino: (addr.state?.name || '') + ' / ' + (addr.city?.name || ''),
              logistica: s.logistic_type,
              list_cost: so.list_cost,   // costo "de lista" del envío
              cost: so.cost,             // lo que efectivamente entra al cálculo
            }));
            try {
              const sc = await mlGet('/shipments/' + shipId + '/costs', t.access_token);
              const snd = (sc.senders || [])[0] || {};
              console.log('  ENVÍO/costos', JSON.stringify({
                bruto: sc.gross_amount,
                vendedor_paga: snd.cost,
                compensacion: snd.compensation,
                descuentos: (snd.discounts || []).map((d) => `${d.type}:${d.promoted_amount}`),
              }));
            } catch (e) { console.log('  ENVÍO/costos error', String(e.message || '').slice(0, 50)); }
          } catch (e) { console.log('  ENVÍO error', String(e.message || '').slice(0, 50)); }
        }
        console.log('  → neto que usa el robot (suma net_received):', net);
        break;
      }
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

  // ACCOUNT: si está seteado, procesa solo esa cuenta (para backfills por tandas).
  const onlyAcc = (process.env.ACCOUNT || '').trim().toLowerCase();
  for (const label of labels) {
    if (onlyAcc && label.toLowerCase() !== onlyAcc) continue;
    const acc = accounts[label];
    if (!acc?.refresh_token) continue;

    // 1) renovar token y guardar el nuevo refresh_token (ML lo rota)
    const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
    await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });

    // 2) traer ventas desde la última corrida (o últimos 7 días la 1ª vez).
    //    BACKFILL_DAYS fuerza una ventana amplia (para reprocesar el historial).
    const bfd = parseInt(process.env.BACKFILL_DAYS || '0', 10);
    // Backfill grande (>45 días): traemos por ventanas de fecha para llegar a
    // TODAS (ML no deja paginar tan atrás de una). Si no, el método normal.
    let orders;
    if (bfd > 45) {
      orders = await fetchOrdersRange(acc.seller_id, t.access_token, Date.now() - bfd * 864e5, Date.now());
    } else {
      const fromISO = bfd > 0
        ? new Date(Date.now() - bfd * 864e5).toISOString().replace(/\.\d+Z$/, '.000-00:00')
        : (state[label]?.lastFrom ||
          new Date(Date.now() - 7 * 864e5).toISOString().replace(/\.\d+Z$/, '.000-00:00'));
      orders = await fetchOrders(acc.seller_id, t.access_token, fromISO);
    }

    // 3) transformar cada venta → entradas ventaprod (solo las que enganchan)
    for (const o of orders) {
      const num = String(o.id);                       // ID interno de la orden (para dedup/cancelaciones)
      const numDisplay = String(o.pack_id || o.id);   // número que muestra ML en la web (el "Venta #")
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
        // Si NO está vinculada, la cargamos igual como "sin producto" (para no
        // perder ninguna venta); después la asignás/creás y se completa sola.
        if (p && !variant) variant = mlVariant(it, p); // variante desde la venta de ML
        // neto real del pago (una sola vez por orden)
        if (!netFetched) { orderNetAmt = await orderNet(o, t.access_token); netFetched = true; }
        const neto = (orderNetAmt != null && orderGross > 0)
          ? Math.round(orderNetAmt * (itemGross / orderGross))
          : netoFallback(itemGross, it.sale_fee, qty);
        const { costo, costBaseUSD, shipUSD } = p ? costoPesos(p, qty, tc) : { costo: 0, costBaseUSD: 0, shipUSD: 0 };
        const id = 'v' + o.id + '_' + idx;
        const obj = {
          id, saleId, prod: p ? p.name : title, prodId: p ? p.id : null, cuenta: label, qty,
          total: Math.round(itemGross),
          neto,
          costo, costBaseUSD, tcSale: tc, shipUSD,
          numVenta: numDisplay, mla: mla || '',
          ts: new Date(o.date_closed || o.date_created).getTime(),
          origen: 'ml-api',
        };
        if (!p) obj.sinVincular = true;    // marca: venta cargada sin producto
        if (variant) obj.variante = variant;
        if (DRY) console.log(`  [${label}] #${num} ${obj.prod}${p ? '' : ' (SIN PRODUCTO)'} x${qty} · total ${obj.total} · neto ${obj.neto}`);
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
      // devolución (volvió al stock) → no es pérdida; entregada sin devolver → reclamo;
      // ni entregada → cancelación previa al envío.
      const tipo = (await wasReturned(o, t.access_token)) ? 'devolucion'
        : ((await wasDelivered(o, t.access_token)) ? 'reclamo' : 'cancelada');
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

  // RETRO-RELLENO: ventas que quedaron "sin producto" cuya publicación ya
  // mapeaste después → les completamos el producto y el costo (una vez).
  if (!DRY) {
    let rf = 0;
    for (const [dayKey, day] of Object.entries(ventaprod)) {
      for (const [id, v] of Object.entries(day || {})) {
        if (!v || !v.sinVincular || !v.mla) continue;
        const e = map[v.mla];
        if (!e || !e.prodId) continue;                 // sigue sin mapear
        const p = products.find((pp) => pp.id === e.prodId);
        if (!p) continue;
        const { costo, costBaseUSD, shipUSD } = costoPesos(p, v.qty || 1, v.tcSale || tc);
        const patch = { prod: p.name, prodId: p.id, costo, costBaseUSD, shipUSD, sinVincular: null };
        if (e.variant) patch.variante = e.variant;
        await db.patch(`cyc/ventaprod/${dayKey}/${id}`, patch);
        v.sinVincular = false; rf++;
      }
    }
    if (rf) console.log(`✓ Completé el producto en ${rf} ventas que estaban sin vincular.`);
  }

  const pend = Object.values(map).filter((x) => x && !x.prodId).length;
  console.log(`\n✓ Listo. Renglones cargados: ${cargadas}. Publicaciones sin vincular: ${pend}.`);
  Object.values(map).filter((x) => x && !x.prodId).slice(0, 40).forEach((r) =>
    console.log('  · ' + r.title + '  → ' + (r.candidatos || []).map((c) => c.name).join(' | ')));
}

main().catch((e) => { console.error('✗ Error:', e.message); process.exit(1); });
