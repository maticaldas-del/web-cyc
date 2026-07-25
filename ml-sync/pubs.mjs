// LISTAR TODAS LAS PUBLICACIONES de cada cuenta conectada (activas E inactivas)
// y volcarlas al nodo cyc/mllinks para que las mapees en la web.
// Cada entrada: { prodId, variant, title, cuenta, status, manual }.
// - Respeta lo que vos ya fijaste a mano (manual:true): no lo pisa.
// - A las nuevas les pone una SUGERENCIA de producto (podés corregirla).
// - Limpia la basura que quedó en el mapa viejo (claves MLA en cyc/mlmap).
//
// Requiere los mismos secrets que sync.mjs.

import { fbSignIn, makeDB, mlRefresh, mlGet } from './lib.mjs';

const {
  ML_CLIENT_ID, ML_CLIENT_SECRET,
  FIREBASE_API_KEY, FIREBASE_DB_URL, FIREBASE_BOT_EMAIL, FIREBASE_BOT_PASSWORD,
} = process.env;

// ── matcher por palabras (igual criterio que el robot de ventas) ──
const norm = (s) => (s || '')
  .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9 ]/g, ' ')
  .replace(/(\d+)\s*(gb|tb|mb|ml|cm|mm|w|v)\b/g, '$1$2')
  .replace(/\s+/g, ' ').trim();
const STOP = new Set(['de','con','y','la','el','los','las','para','en','del','al',
  'un','una','x','color','negro','blanco','gris','rojo','azul','verde','celeste',
  'pc','set','the','memoria','luz','led','2','0','1','o','a','tipo','marca',
  'usb','hub','bluetooth','wireless','inalambrico','inalambrica','inalambricos',
  'inalambricas','recargable','flexible','micro','mini','original','premium']);
const toks = (s) => [...new Set(norm(s).split(' ').filter((t) => t.length >= 2 && !STOP.has(t)))];
function buildIndex(products) {
  return (products || []).map((p) => ({ p, toks: toks(p.name) })).filter((x) => x.toks.length);
}
function suggest(title, index) {
  const tt = new Set(toks(title));
  let best = null, bestScore = 0, second = 0;
  for (const x of index) {
    let s = 0; for (const tk of x.toks) if (tt.has(tk)) s++;
    if (s > bestScore) { second = bestScore; bestScore = s; best = x; }
    else if (s > second) { second = s; }
  }
  if (best && bestScore >= 2 && bestScore > second) return best.p;
  if (best && bestScore >= 1 && best.toks.length === 1 && bestScore > second) return best.p;
  return null;
}

// listar IDs de publicaciones de una cuenta para un estado dado
async function listIds(sellerId, token, status) {
  const ids = [];
  let offset = 0;
  for (;;) {
    const q = new URLSearchParams({ status, limit: '100', offset: String(offset) });
    const d = await mlGet(`/users/${sellerId}/items/search?${q}`, token);
    const res = d.results || [];
    ids.push(...res);
    if (res.length < 100 || offset >= 900) break;
    offset += 100;
  }
  return ids;
}
async function getItems(ids, token) {
  const out = [];
  for (let i = 0; i < ids.length; i += 20) {
    const chunk = ids.slice(i, i + 20);
    const d = await mlGet(`/items?ids=${chunk.join(',')}&attributes=id,title,status,variations`, token);
    for (const row of d) if (row.code === 200 && row.body) out.push(row.body);
  }
  return out;
}

async function main() {
  const idToken = await fbSignIn(FIREBASE_API_KEY, FIREBASE_BOT_EMAIL, FIREBASE_BOT_PASSWORD);
  const db = makeDB(FIREBASE_DB_URL, idToken);

  // limpiar la basura que metí en el mapa viejo de Cowork (solo claves MLA…)
  const viejo = (await db.get('cyc/mlmap')) || {};
  const limpiar = {};
  for (const k of Object.keys(viejo)) if (/^MLA/i.test(k)) limpiar[k] = null;
  if (Object.keys(limpiar).length) {
    await db.patch('cyc/mlmap', limpiar);
    console.log(`🧹 Limpié ${Object.keys(limpiar).length} entradas MLA del mapa viejo.`);
  }

  const accounts = (await db.get('mlapi/tokens')) || {};
  const labels = Object.keys(accounts);
  if (!labels.length) { console.log('No hay cuentas conectadas.'); return; }

  const products = Object.values((await db.get('cyc/products')) || {});
  const index = buildIndex(products);
  const map = (await db.get('cyc/mllinks')) || {};
  const upd = {};
  let total = 0;

  for (const label of labels) {
    const acc = accounts[label];
    if (!acc?.refresh_token) continue;
    const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
    await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });

    const ids = new Set();
    for (const st of ['active', 'paused', 'closed']) {
      (await listIds(acc.seller_id, t.access_token, st)).forEach((id) => ids.add(id));
    }
    const items = await getItems([...ids], t.access_token);
    console.log(`· ${label}: ${items.length} publicaciones (activas + inactivas)`);
    total += items.length;

    for (const it of items) {
      const prev = map[it.id];
      // respetar lo que fijaste a mano
      if (prev && (prev.manual || (typeof prev === 'object' && prev.manual))) {
        const e = { ...prev, title: it.title, cuenta: label, status: it.status };
        map[it.id] = e; upd[it.id] = e; continue;
      }
      const s = suggest(it.title, index);
      const e = {
        prodId: s ? s.id : null,
        variant: (prev && prev.variant) || '',
        title: it.title, cuenta: label, status: it.status, auto: true,
      };
      map[it.id] = e; upd[it.id] = e;
    }
  }

  if (Object.keys(upd).length) await db.patch('cyc/mllinks', upd);
  const pend = Object.values(map).filter((x) => x && !x.prodId).length;
  console.log(`\n✓ Listo. ${total} publicaciones en total. Sin vincular: ${pend}. Mapealas en la app (Ajustes).`);
}

main().catch((e) => { console.error('✗ Error:', e.message); process.exit(1); });
