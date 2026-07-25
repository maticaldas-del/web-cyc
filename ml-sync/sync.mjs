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
  .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

// Fecha local Argentina (UTC-3) → clave YYYY_MM_DD que usa la app.
function dayKeyFromISO(iso) {
  const d = new Date(iso);
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(d).reduce((o, x) => (o[x.type] = x.value, o), {});
  return `${p.year}_${p.month}_${p.day}`;
}

// ── matching publicación → producto interno (por nombre, primera versión) ──
function buildProductIndex(products) {
  // products: array de {id, name, costUSD, shipUSD, devPct, ...}
  return (products || []).map((p) => ({ p, n: norm(p.name) })).filter((x) => x.n);
}
function matchProduct(title, index) {
  const t = norm(title);
  // 1) match exacto normalizado
  let hit = index.find((x) => x.n === t);
  if (hit) return hit.p;
  // 2) el nombre del producto está contenido en el título de la publicación
  hit = index.filter((x) => t.includes(x.n)).sort((a, b) => b.n.length - a.n.length)[0];
  if (hit) return hit.p;
  // 3) sin match → lo dejamos sin producto (se revisa/corrige a mano)
  return null;
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

  // set de números de venta ya cargados, para no duplicar
  const ventaprod = (await db.get('cyc/ventaprod')) || {};
  const seenNum = new Set();
  for (const day of Object.values(ventaprod)) {
    for (const v of Object.values(day || {})) if (v.numVenta) seenNum.add(String(v.numVenta));
  }

  const state = (await db.get('mlapi/state')) || {};
  let totalNuevas = 0;
  const sinMatch = [];

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

    // 3) transformar cada venta nueva → entradas ventaprod
    for (const o of orders) {
      const num = String(o.id);
      if (seenNum.has(num)) continue;
      seenNum.add(num);
      const dayKey = dayKeyFromISO(o.date_closed || o.date_created);
      const saleId = 's' + o.id;
      const items = o.order_items || [];
      const orderGross = items.reduce((s, it) => s + (it.unit_price || 0) * (it.quantity || 0), 0);
      const shipSeller = await sellerShipping(o, t.access_token);
      let i = 0;
      for (const it of items) {
        const title = it.item?.title || '';
        const qty = it.quantity || 0;
        const itemGross = (it.unit_price || 0) * qty;
        const shipAlloc = orderGross > 0 ? shipSeller * (itemGross / orderGross) : 0;
        const p = matchProduct(title, index);
        if (!p) sinMatch.push(`${label}: ${title}`);
        const { costo, costBaseUSD, shipUSD } = costoPesos(p, qty, tc);
        const id = 'v' + o.id + '_' + i;
        const obj = {
          id, saleId,
          prod: p ? p.name : title,
          prodId: p ? p.id : null,
          cuenta: label,
          qty,
          total: Math.round(itemGross),
          neto: netoItem(itemGross, it.sale_fee, qty, shipAlloc),
          costo, costBaseUSD, tcSale: tc, shipUSD,
          numVenta: num,
          ts: new Date(o.date_closed || o.date_created).getTime(),
          origen: 'ml-api',
        };
        if (DRY) {
          console.log(`  [${label}] #${num} ${obj.prod} x${qty} · total ${obj.total} · neto ${obj.neto}` +
            (p ? '' : '  ⚠ SIN PRODUCTO'));
        } else {
          await db.set(`cyc/ventaprod/${dayKey}/${id}`, obj);
        }
        i++;
      }
      totalNuevas++;
    }

    // 4) marcar hasta dónde llegamos (para la próxima corrida) — no en dry-run
    if (!DRY) await db.patch('mlapi/state/' + label, {
      lastFrom: new Date(Date.now() - 2 * 864e5).toISOString().replace(/\.\d+Z$/, '.000-00:00'),
      lastRun: Date.now(),
    });
    console.log(`✓ ${label}: ${orders.length} ventas revisadas`);
  }

  console.log(`\n✓ Listo. Ventas nuevas cargadas: ${totalNuevas}`);
  if (sinMatch.length) {
    console.log(`\n⚠ Publicaciones sin producto (${sinMatch.length}) — revisar match por nombre:`);
    [...new Set(sinMatch)].slice(0, 40).forEach((s) => console.log('  · ' + s));
  }
}

main().catch((e) => { console.error('✗ Error:', e.message); process.exit(1); });
