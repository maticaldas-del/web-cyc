// ROBOT DE VENTAS (Fase 1): trae las ventas nuevas de las 4 cuentas de ML y
// las escribe en el panel (ventaprod/…), en el mismo formato que la carga manual.
// Las métricas de la app se calculan solas a partir de eso.
//
// Corre en GitHub Actions. Sin IA, sin tokens.
// Requiere secrets: ML_CLIENT_ID, ML_CLIENT_SECRET,
//   FIREBASE_API_KEY, FIREBASE_DB_URL, FIREBASE_BOT_EMAIL, FIREBASE_BOT_PASSWORD

import { fbSignIn, makeDB, mlRefresh, mlGet } from './lib.mjs';

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

// costo en pesos, replicando la lógica de la app (costUSD, devolución, envío × dólar)
function costoPesos(p, qty, tc) {
  if (!p) return { costo: 0, costBaseUSD: 0, shipUSD: 0 };
  const costUSD = parseFloat(p.costUSD) || 0;
  const shipUSD = parseFloat(p.shipUSD) || 0;
  const devPct = parseFloat(p.devPct) || 0;
  const fullUSD = costUSD * (1 + devPct / 100) + shipUSD;
  return { costo: Math.round(fullUSD * tc * qty), costBaseUSD: costUSD, shipUSD };
}

// ── envío que paga el vendedor (best-effort; si el dato viene distinto → 0) ──
// TODO(verificar 1ª tanda): forma exacta de /shipments/{id}/costs y qué campo
// es el costo del vendedor. Va con try/catch: si falla, neto = total − comisión.
async function sellerShipping(order, token) {
  const shipId = order.shipping?.id;
  if (!shipId) return 0;
  try {
    const c = await mlGet(`/shipments/${shipId}/costs`, token);
    const s = Array.isArray(c.senders) ? c.senders[0] : null;
    const cost = (s?.cost || 0) - (s?.compensation || 0);
    return cost > 0 ? cost : 0;
  } catch { return 0; }
}
// neto por ítem = (total del ítem) − comisión − parte proporcional del envío.
// TODO(verificar): si order_items.sale_fee es por unidad o por línea.
function netoItem(itemGross, saleFeeUnit, qty, shipAlloc) {
  const fee = (saleFeeUnit || 0) * (qty || 0); // ← revisar base de sale_fee
  return Math.max(0, Math.round(itemGross - fee - shipAlloc));
}

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

async function main() {
  const idToken = await fbSignIn(FIREBASE_API_KEY, FIREBASE_BOT_EMAIL, FIREBASE_BOT_PASSWORD);
  const db = makeDB(FIREBASE_DB_URL, idToken);

  const accounts = (await db.get('mlapi/tokens')) || {};
  const labels = Object.keys(accounts);
  if (!labels.length) { console.log('No hay cuentas conectadas todavía.'); return; }

  const products = Object.values((await db.get('cyc/products')) || {});
  const index = buildProductIndex(products);
  if (process.env.CATALOG_ONLY) {
    console.log('CATÁLOGO total:', products.length);
    console.log('CAMPOS:', JSON.stringify(Object.keys(products[0] || {})));
    console.log('NOMBRES:', JSON.stringify(products.map((p) => p.name)));
    console.log('EJEMPLO:', JSON.stringify(products[0] || {}));
    return;
  }
  const finanzas = (await db.get('cyc/finanzas')) || {};
  const tc = parseFloat(finanzas.tipo_cambio) || 1500;

  // mapa permanente publicación(MLA) → producto interno (resuelto en la app)
  const map = (await db.get('cyc/mlmap')) || {};

  // ventas ya cargadas a mano / por cowork (para no duplicarlas). Las nuestras
  // (origen ml-api) usan id determinístico, así que reescribirlas es inofensivo.
  const ventaprod = (await db.get('cyc/ventaprod')) || {};
  const seenManual = new Set();
  for (const day of Object.values(ventaprod)) {
    for (const v of Object.values(day || {})) {
      if (v.numVenta && v.origen !== 'ml-api') seenManual.add(String(v.numVenta));
    }
  }

  const state = (await db.get('mlapi/state')) || {};
  let cargadas = 0;
  const review = {}; // MLA -> { title, cuenta, candidatos:[{id,name}] }

  for (const label of labels) {
    const acc = accounts[label];
    if (!acc?.refresh_token) continue;

    // 1) renovar token y guardar el nuevo refresh_token (ML lo rota)
    const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
    await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });

    // 2) traer ventas desde la última corrida (o últimos 7 días la 1ª vez)
    const fromISO = state[label]?.lastFrom ||
      new Date(Date.now() - 7 * 864e5).toISOString().replace(/\.\d+Z$/, '.000-00:00');
    const orders = await fetchOrders(acc.seller_id, t.access_token, fromISO);

    // 3) transformar cada venta → entradas ventaprod (solo las que enganchan)
    for (const o of orders) {
      const num = String(o.id);
      if (seenManual.has(num)) continue; // ya cargada a mano/cowork
      const dayKey = dayKeyFromISO(o.date_closed || o.date_created);
      const saleId = 's' + o.id;
      const items = o.order_items || [];
      const orderGross = items.reduce((s, it) => s + (it.unit_price || 0) * (it.quantity || 0), 0);
      const shipSeller = await sellerShipping(o, t.access_token);
      let i = 0;
      for (const it of items) {
        const mla = it.item?.id;
        const title = it.item?.title || '';
        const qty = it.quantity || 0;
        const itemGross = (it.unit_price || 0) * qty;
        const shipAlloc = orderGross > 0 ? shipSeller * (itemGross / orderGross) : 0;
        const idx = i; i++;
        // 1) mapa confirmado por MLA · 2) match por palabras
        let p = (mla && map[mla]) ? (products.find((pp) => pp.id === map[mla]) || null) : null;
        if (!p) p = matchProduct(title, index);
        if (!p) { // ambiguo → a revisión, NO se carga (para no quedar sin costo)
          if (mla) review[mla] = { title, cuenta: label, candidatos: candidatesFor(title, index) };
          continue;
        }
        const { costo, costBaseUSD, shipUSD } = costoPesos(p, qty, tc);
        const id = 'v' + o.id + '_' + idx;
        const obj = {
          id, saleId, prod: p.name, prodId: p.id, cuenta: label, qty,
          total: Math.round(itemGross),
          neto: netoItem(itemGross, it.sale_fee, qty, shipAlloc),
          costo, costBaseUSD, tcSale: tc, shipUSD,
          numVenta: num,
          ts: new Date(o.date_closed || o.date_created).getTime(),
          origen: 'ml-api',
        };
        if (DRY) console.log(`  [${label}] #${num} ${p.name} x${qty} · total ${obj.total} · neto ${obj.neto}`);
        else await db.set(`cyc/ventaprod/${dayKey}/${id}`, obj);
        cargadas++;
      }
    }

    // 4) marcar hasta dónde llegamos (para la próxima corrida) — no en dry-run
    if (!DRY) await db.patch('mlapi/state/' + label, {
      lastFrom: new Date(Date.now() - 2 * 864e5).toISOString().replace(/\.\d+Z$/, '.000-00:00'),
      lastRun: Date.now(),
    });
    console.log(`✓ ${label}: ${orders.length} ventas revisadas`);
  }

  // guardar la lista de revisión (sacando las que ya están resueltas en el mapa)
  for (const mla of Object.keys(review)) if (map[mla]) delete review[mla];
  if (!DRY) await db.set('cyc/mlreview', review);

  const pend = Object.keys(review).length;
  console.log(`\n✓ Listo. Renglones cargados: ${cargadas}. Publicaciones a revisar: ${pend}.`);
  Object.values(review).slice(0, 40).forEach((r) =>
    console.log('  · ' + r.title + '  → ' + r.candidatos.map((c) => c.name).join(' | ')));
}

main().catch((e) => { console.error('✗ Error:', e.message); process.exit(1); });
