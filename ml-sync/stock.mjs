// ROBOT DE STOCK (Fase 2): trae las unidades disponibles de cada publicación de
// ML y las escribe en el inventario del panel (inventory/<prodId>__<Cuenta>).
//
// SEGURIDAD: solo escribe stock de publicaciones con match CONFIRMADO con un
// producto interno. Las dudosas quedan en una lista de revisión (mlapi/review)
// y NO tocan tu inventario hasta que las confirmes. Nunca pone nada en 0 a lo loco.
//
// Requiere los mismos secrets que sync.mjs.

import { fbSignIn, makeDB, mlRefresh, mlGet } from './lib.mjs';

const {
  ML_CLIENT_ID, ML_CLIENT_SECRET,
  FIREBASE_API_KEY, FIREBASE_DB_URL, FIREBASE_BOT_EMAIL, FIREBASE_BOT_PASSWORD,
} = process.env;

const sid = (s) => String(s).replace(/[^a-z0-9]/gi, '_'); // igual que la app
const norm = (s) => (s || '')
  .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

// listar los IDs de publicaciones activas de una cuenta
async function listItemIds(sellerId, token) {
  const ids = [];
  let offset = 0;
  for (;;) {
    const q = new URLSearchParams({ status: 'active', limit: '100', offset: String(offset) });
    const d = await mlGet(`/users/${sellerId}/items/search?${q}`, token);
    const res = d.results || [];
    ids.push(...res);
    if (res.length < 100 || offset >= 900) break; // >1000 requiere modo scan (a futuro)
    offset += 100;
  }
  return ids;
}

// traer detalle de publicaciones de a 20 (multiget)
async function getItems(ids, token) {
  const out = [];
  for (let i = 0; i < ids.length; i += 20) {
    const chunk = ids.slice(i, i + 20);
    const d = await mlGet(
      `/items?ids=${chunk.join(',')}&attributes=id,title,available_quantity,variations,status`,
      token
    );
    for (const row of d) if (row.code === 200 && row.body) out.push(row.body);
  }
  return out;
}

// unidades de una publicación (suma variaciones si tiene)
function unidades(item) {
  if (Array.isArray(item.variations) && item.variations.length) {
    return item.variations.reduce((s, v) => s + (v.available_quantity || 0), 0);
  }
  return item.available_quantity || 0;
}

async function main() {
  const idToken = await fbSignIn(FIREBASE_API_KEY, FIREBASE_BOT_EMAIL, FIREBASE_BOT_PASSWORD);
  const db = makeDB(FIREBASE_DB_URL, idToken);

  const accounts = (await db.get('mlapi/tokens')) || {};
  const labels = Object.keys(accounts);
  if (!labels.length) { console.log('No hay cuentas conectadas todavía.'); return; }

  const products = Object.values((await db.get('cyc/products')) || {});
  const index = products.map((p) => ({ p, n: norm(p.name) })).filter((x) => x.n);
  const map = (await db.get('cyc/mllinks')) || {};   // MLA -> { prodId, variant, ... }
  const upd = {};                                   // solo publicaciones nuevas a agregar

  const desired = {}; // 'prodId__Cuenta' -> unidades
  const add = (prodId, label, q) => {
    const k = `${prodId}__${sid(label)}`;
    desired[k] = (desired[k] || 0) + q;
  };

  for (const label of labels) {
    const acc = accounts[label];
    if (!acc?.refresh_token) continue;
    const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
    await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });

    const ids = await listItemIds(acc.seller_id, t.access_token);
    const items = await getItems(ids, t.access_token);
    console.log(`· ${label}: ${items.length} publicaciones`);

    for (const it of items) {
      const q = unidades(it);
      let e = map[it.id]; // { prodId, variant, ... }
      if (typeof e === 'string') e = { prodId: e };
      if (e && e.prodId) { add(e.prodId, label, q); continue; }
      if (e) continue; // ya está en el mapa pero sin vincular → lo resolvés en la app
      // publicación nueva que nunca vendió: intentar match exacto por nombre
      const t2 = norm(it.title);
      const exact = index.find((x) => x.n === t2);
      const entry = exact
        ? { prodId: exact.p.id, variant: '', title: it.title, cuenta: label, auto: true }
        : { prodId: null, variant: '', title: it.title, cuenta: label, auto: true, candidatos: [] };
      map[it.id] = entry; upd[it.id] = entry;
      if (exact) add(exact.p.id, label, q);
    }
  }

  // guardar en el mapa solo las publicaciones nuevas (no pisa lo ya vinculado)
  if (Object.keys(upd).length) await db.patch('cyc/mllinks', upd);

  // escribir SOLO los stocks confirmados (merge; no toca otras claves)
  if (Object.keys(desired).length) await db.patch('cyc/inventory', desired);

  console.log(`\n✓ Stock actualizado en ${Object.keys(desired).length} claves (producto×cuenta).`);
  const rev = Object.values(map).filter((x) => x && !x.prodId).length;
  if (rev) console.log(`⚠ ${rev} publicaciones sin vincular — resolvelas en la app; no tocaron el inventario.`);
}

main().catch((e) => { console.error('✗ Error:', e.message); process.exit(1); });
