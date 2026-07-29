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
// Cargo extra de ML (IIBB por débito automático) que NO viene descontado del neto de la venta:
// es un % del PRECIO y va sumado al costo, igual que en la app (ver ML_EXTRA_PCT en index.html).
// Sin esto el robot mide el margen "a la vieja" (~13 puntos más alto) y apunta a un piso que no es.
const ML_EXTRA_PCT = { adriana: 4.07, luciana: 4.37, ayelen: 5.95, matias: 4.58 };
const mlExtraPct = (cuenta) => { const v = ML_EXTRA_PCT[(cuenta || '').toLowerCase()]; return v != null ? v : 4.8; };
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

// ── Subir el precio de TODAS las variantes de una publicación ──────────────
// PELIGRO que esto evita: si a ML le mandás la lista de variantes incompleta,
// BORRA las que faltan (te comés el historial y el stock de esa variante). Por
// eso siempre se manda la lista COMPLETA: las que suben con el precio nuevo y
// las que no, con el precio que ya tenían.
// Después de escribir se vuelve a leer la publicación y se verifica que siga
// teniendo la MISMA cantidad de variantes y los precios pedidos. Si algo no
// coincide, devuelve ok:false para que el que llama frene todo lo demás.
// 'nuevos' = { idVariante: precioNuevo }.  Devuelve {ok, cambios:[{id,from,to}]} o {ok:false, err}.
async function raiseVariations(itemId, nuevos, token) {
  let item;
  try { item = await mlGet('/items/' + itemId + '?attributes=id,price,status,variations', token); }
  catch { return { ok: false, err: 'sin-item' }; }
  if (item.status === 'closed') return { ok: false, err: 'cerrada' };
  const vars = Array.isArray(item.variations) ? item.variations : [];
  if (!vars.length) return { ok: false, err: 'sin-variantes' };
  const antes = vars.length;
  const cambios = [];
  // Lista COMPLETA: toda variante va, cambie o no.
  const payload = vars.map((v) => {
    const n = nuevos[String(v.id)];
    let precio = v.price;
    if (n && n > v.price && n <= v.price * 1.25) { precio = Math.ceil(n / 10) * 10; cambios.push({ id: v.id, from: v.price, to: precio }); }
    return { id: v.id, price: precio };
  });
  if (!cambios.length) return { ok: false, err: 'no-sube' };
  try {
    const r = await fetch(ML_API + '/items/' + itemId, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ variations: payload }),
    });
    if (!r.ok) return { ok: false, err: 'ML-' + r.status };
  } catch { return { ok: false, err: 'red' }; }
  // Verificación obligatoria: que no se haya borrado ninguna variante y que los precios sean los pedidos.
  let after;
  try { after = await mlGet('/items/' + itemId + '?attributes=id,variations', token); }
  catch { return { ok: false, err: 'no-pude-verificar' }; }
  const vd = Array.isArray(after.variations) ? after.variations : [];
  if (vd.length !== antes) return { ok: false, err: `PELIGRO-variantes-${antes}→${vd.length}` };
  for (const c of cambios) {
    const v = vd.find((x) => String(x.id) === String(c.id));
    if (!v) return { ok: false, err: 'PELIGRO-variante-desaparecida-' + c.id };
    if (Math.round(v.price) !== c.to) return { ok: false, err: `precio-no-quedo-${c.id}-${Math.round(v.price)}` };
  }
  return { ok: true, cambios };
}

// ── Subir una publicación a un precio EXACTO ───────────────────────────────
// Para nivelar grupos hay que llegar a un precio concreto, no multiplicar: el
// multiplicador se aplica sobre lo que ML tenga en ese instante y, si el precio
// cambió desde que se leyó, el resultado se pasa del objetivo.
// Sube o deja igual, nunca baja. Tope de seguridad: no sube más de 25%.
async function raisePriceTo(itemId, objetivo, token) {
  let item;
  try { item = await mlGet('/items/' + itemId + '?attributes=id,price,status', token); }
  catch { return { ok: false, err: 'sin-item' }; }
  if (item.status === 'closed') return { ok: false, err: 'cerrada' };
  if (!item.price) return { ok: false, err: 'sin-precio' };
  const to = Math.ceil(objetivo / 10) * 10;
  if (to <= item.price) return { ok: false, err: 'no-sube' };
  if (to > item.price * 1.25) return { ok: false, err: 'suba-mayor-a-25%' };
  try {
    const r = await fetch(ML_API + '/items/' + itemId, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: to }),
    });
    if (!r.ok) return { ok: false, err: 'ML-' + r.status };
    return { ok: true, from: Math.round(item.price), to };
  } catch { return { ok: false, err: 'red' }; }
}

// ── Envío deducido de las ventas reales, respetando el umbral de $33.000 ──
// El envío NO es una constante del producto: depende de a qué lado de los $33.000 esté el
// precio. Abajo lo paga el comprador (≈$0 para vos); arriba lo paga CYC (≈$6.000).
// Deducir el envío de ventas viejas y aplicarlo al precio de hoy da resultados falsos cuando
// el precio cruzó el umbral: a un Victoria's Secret que vendió barato hace meses le quedaba
// un envío de $275 aplicado a un precio de hoy de $45.300, y su margen figuraba 53% cuando
// en realidad es 31%. Por eso solo se usan las ventas del MISMO lado del umbral.
// Devuelve { envio, usadas, mismoLado } — mismoLado=false avisa que no hubo ventas del lado
// que corresponde y hubo que estimar.
const UMBRAL_ENVIO_GRATIS = 33000;
async function envioDeducido(ventas, precioHoy, feeAt, opts = {}) {
  const { modo = 'min' } = opts; // 'min' = mejor caso (para subir) · 'max' = peor caso (para bajar)
  if (!ventas || !ventas.length) return { envio: null, usadas: 0, mismoLado: false };
  const arribaHoy = precioHoy >= UMBRAL_ENVIO_GRATIS;
  const mismas = ventas.filter((v) => (v.tot >= UMBRAL_ENVIO_GRATIS) === arribaHoy);
  const usar = mismas.length ? mismas : ventas;
  const vals = [];
  for (const pv of [...new Set(usar.map((v) => Math.round(v.tot)))].slice(-8)) {
    const cv = await feeAt(pv);
    if (cv == null) continue;
    for (const v of usar) if (Math.round(v.tot) === pv) vals.push(Math.max(0, v.tot - v.net - cv));
  }
  if (!vals.length) return { envio: null, usadas: 0, mismoLado: false };
  vals.sort((a, b) => a - b);
  const envio = modo === 'max' ? vals[vals.length - 1] : vals[0];
  return { envio, usadas: vals.length, mismoLado: mismas.length > 0 };
}

// ── GRUPOS DE PRECIO: publicaciones que tienen que valer todas lo mismo ────
// Caso Paulvic: son el mismo perfume publicado varias veces en varias cuentas. Si
// quedan a distinto precio, el más barato se lleva todas las ventas — y justo ese
// puede ser el que está por debajo del piso de margen.
//
// La regla es: TODAS al precio MÁS ALTO del grupo. Se nivela en cada corrida, así
// da igual quién subió (el robot automático, el barrido a mano o vos desde ML).
//
// Config en cyc/mlconfig/gruposPrecio = { paulvic: { palabra: 'paulvic' } }
// La palabra se busca en el título de la publicación y en el nombre del producto,
// así una publicación nueva entra al grupo sola, sin cargarla a mano.
//
// Frenos:
//   · si el precio más alto es >50% que el de otro, no toca nada y avisa (algo está
//     mal: precio mal cargado o una publicación que no es de ese producto),
//   · si nivelar cruzaría los $33.000 de una publicación que hoy está por debajo,
//     esa se saltea (ahí el envío pasa a pagarlo CYC y el aumento sale caro).
async function nivelarGrupos(db, links, tokensRun, DRY, pName, sellerIds) {
  const grupos = (await db.get('cyc/mlconfig/gruposPrecio')) || {};
  const nombres = Object.keys(grupos).filter((g) => grupos[g] && grupos[g].palabra && grupos[g].activo !== false);
  if (!nombres.length) return [];
  const UMBRAL_ENVIO = 33000;
  const avisos = [];
  for (const g of nombres) {
    const palabra = String(grupos[g].palabra).toLowerCase();
    // Miembros: publicaciones vinculadas, no ignoradas, cuyo título o producto tiene la palabra.
    const miembros = Object.entries(links)
      .filter(([mla, e]) => e && !e.ignored && e.prodId && /^MLA/i.test(mla)
        && ((e.title || '') + ' ' + ((pName && pName[e.prodId]) || '')).toLowerCase().includes(palabra))
      .map(([mla, e]) => ({ mla, cuenta: e.cuenta || '', title: e.title || mla }));
    if (miembros.length < 2) continue;
    // OJO: muchas publicaciones viejas quedaron en mllinks SIN cuenta. Si las salteo por eso,
    // se quedan a otro precio y el grupo no sirve para nada. Leer se puede con cualquier token,
    // así que se leen todas y el dueño se resuelve por el seller_id que devuelve ML.
    const algunTok = Object.values(tokensRun)[0];
    if (!algunTok) continue;
    const porSeller = {};
    for (const [lab, tok] of Object.entries(tokensRun)) {
      const sid = sellerIds && sellerIds[lab];
      if (sid) porSeller[String(sid)] = { label: lab, tok };
    }
    // Se lleva la cuenta de POR QUÉ queda afuera cada publicación. Una omisión silenciosa acá
    // significa una publicación que se queda a otro precio sin que nadie se entere.
    const vivos = []; const sinDueno = [], inactivas = [], sinPrecio = [];
    const vistas = new Set();
    // CADA publicación se lee con el token de SU dueño. Leerlas todas con un solo token parecía
    // más simple, pero ML devuelve mal el estado de las publicaciones de otro vendedor: las de
    // Luciana salían como "pausadas" y el grupo terminaba nivelando solo las de Adriana.
    // Las que no tienen cuenta cargada se leen con cualquier token (solo para saber de quién son
    // por el seller_id) y después se releen con el token del dueño.
    const lotes = [];
    const porCta = {};
    for (const mb of miembros) (porCta[mb.cuenta || '?'] = porCta[mb.cuenta || '?'] || []).push(mb);
    for (const [cta, arr] of Object.entries(porCta)) {
      const tok = tokensRun[cta] || algunTok;
      for (let k = 0; k < arr.length; k += 20) lotes.push({ tok, lote: arr.slice(k, k + 20) });
    }
    const pendientes = []; // sin cuenta cargada: hay que releerlas con el token del dueño
    for (const { tok, lote } of lotes) {
      let res;
      try { res = await mlGet('/items?ids=' + lote.map((x) => x.mla).join(',') + '&attributes=id,status,price,variations,seller_id', tok); } catch { continue; }
      for (const row of (res || [])) {
        const b = row.body || {};
        if (!b.id) continue;
        const mb = lote.find((x) => x.mla === b.id);
        const title = mb ? mb.title : b.id;
        // ML no devuelve seller_id cuando la publicación se lee con el token de otra cuenta.
        // En ese caso se prueba cuenta por cuenta: la del dueño responde con los datos completos.
        let due = porSeller[String(b.seller_id)];
        if (!due && b.seller_id === undefined) {
          for (const [lab, tk] of Object.entries(tokensRun)) {
            try {
              const solo = await mlGet('/items/' + b.id + '?attributes=id,status,price,seller_id', tk);
              if (solo && String(solo.seller_id) === String(sellerIds[lab])) { due = { label: lab, tok: tk }; break; }
            } catch { /* no es de esta cuenta, probar la siguiente */ }
          }
        }
        if (!due) { vistas.add(b.id); sinDueno.push(`${title.slice(0, 30)} (seller ${b.seller_id})`); continue; }
        // Si la leí con un token que no es el del dueño, el estado y el precio no son confiables.
        if (due.tok !== tok) { pendientes.push({ ...mb, cuenta: due.label, tok: due.tok }); continue; }
        vistas.add(b.id);
        if (b.status !== 'active') { inactivas.push(`${title.slice(0, 30)} (${b.status})`); continue; }
        const vars = Array.isArray(b.variations) ? b.variations : [];
        const precio = vars.length ? Math.max(...vars.map((v) => v.price || 0)) : (b.price || 0);
        if (!precio) { sinPrecio.push(title.slice(0, 30)); continue; }
        vivos.push({ mla: b.id, cuenta: due.label, title, precio, vars, tok: due.tok });
      }
    }
    // Segunda vuelta: las que no tenían cuenta, ahora leídas con el token de su dueño real.
    const porDue = {};
    for (const pd of pendientes) (porDue[pd.cuenta] = porDue[pd.cuenta] || []).push(pd);
    for (const [cta, arr] of Object.entries(porDue)) {
      const tok = tokensRun[cta];
      for (let k = 0; k < arr.length; k += 20) {
        const lote = arr.slice(k, k + 20);
        let res;
        try { res = await mlGet('/items?ids=' + lote.map((x) => x.mla).join(',') + '&attributes=id,status,price,variations', tok); } catch { continue; }
        for (const row of (res || [])) {
          const b = row.body || {};
          if (!b.id) continue;
          vistas.add(b.id);
          const mb = lote.find((x) => x.mla === b.id);
          const title = mb ? mb.title : b.id;
          if (b.status !== 'active') { inactivas.push(`${title.slice(0, 30)} (${b.status})`); continue; }
          const vars = Array.isArray(b.variations) ? b.variations : [];
          const precio = vars.length ? Math.max(...vars.map((v) => v.price || 0)) : (b.price || 0);
          if (!precio) { sinPrecio.push(title.slice(0, 30)); continue; }
          vivos.push({ mla: b.id, cuenta: cta, title, precio, vars, tok });
        }
      }
    }
    const noLeidas = miembros.filter((mb) => !vistas.has(mb.mla));
    console.log(`Grupo "${g}": ${miembros.length} vinculadas · ${vivos.length} activas para nivelar`
      + (inactivas.length ? ` · ${inactivas.length} pausadas/cerradas` : '')
      + (sinDueno.length ? ` · ${sinDueno.length} de otro vendedor` : '')
      + (sinPrecio.length ? ` · ${sinPrecio.length} sin precio` : '')
      + (noLeidas.length ? ` · ${noLeidas.length} que ML no devolvió` : ''));
    if (sinDueno.length) console.log(`   No son de ninguna cuenta nuestra: ${sinDueno.join(', ')}`);
    if (noLeidas.length) console.log(`   ML no las devolvió (REVISAR): ${noLeidas.map((x) => x.mla + ' ' + x.title.slice(0, 24)).join(', ')}`);
    if (vivos.length < 2) continue;
    const techo = Math.max(...vivos.map((v) => v.precio));
    const piso = Math.min(...vivos.map((v) => v.precio));
    if (piso === techo) continue; // ya están todos iguales
    if (techo > piso * 1.5) {
      avisos.push(`⚠️ Grupo <b>${g}</b>: no nivelé nada porque los precios están muy dispares `
        + `(${money(piso)} vs ${money(techo)}). Revisalo: puede haber un precio mal cargado `
        + `o una publicación que no es de ese producto.`);
      continue;
    }
    const hechos = [], saltados = [];
    for (const v of vivos) {
      if (v.precio >= techo) continue;
      if (v.precio < UMBRAL_ENVIO && techo >= UMBRAL_ENVIO) {
        saltados.push(`${v.title.slice(0, 30)} (cruzaría los ${money(UMBRAL_ENVIO)})`);
        continue;
      }
      let r;
      // En prueba se calcula igual y se muestra, pero no se escribe en ML.
      if (DRY) r = { ok: true, from: v.precio, to: Math.ceil(techo / 10) * 10, dry: true };
      else if (v.vars.length) {
        const nuevos = {}; for (const vv of v.vars) if ((vv.price || 0) < techo) nuevos[String(vv.id)] = techo;
        r = await raiseVariations(v.mla, nuevos, v.tok);
        if (r.ok) r = { ok: true, from: v.precio, to: techo };
      } else r = await raisePriceTo(v.mla, techo, v.tok);
      // OJO: acá va el precio EXACTO, nunca un multiplicador. Con multiplicador, si el precio de ML
      // cambió entre que lo leí y lo escribí, el resultado se pasa del techo — y ese nuevo máximo
      // se vuelve el techo de la corrida siguiente, que arrastra a todas las demás. Un trinquete
      // que sube los precios solo cada 10 minutos. Pasó con un Paulvic: $14.360 → $14.520.
      if (r.ok) hechos.push({ title: v.title, from: r.from, to: r.to, cuenta: v.cuenta });
      else saltados.push(`${v.title.slice(0, 30)} (${r.err})`);
    }
    if (hechos.length) {
      avisos.push(`🟰 <b>Grupo ${g} nivelado a ${money(techo)}</b>\n`
        + hechos.map((h) => `· ${h.cuenta}: ${h.title.slice(0, 30)} ${money(h.from)} → <b>${money(h.to)}</b>`).join('\n')
        + (saltados.length ? `\n\nNo se tocaron: ${saltados.join(', ')}` : ''));
      console.log(`${DRY ? '(PRUEBA) ' : ''}Grupo "${g}" nivelado a ${money(techo)}: ${hechos.length} publicaciones subidas.`);
      hechos.forEach((h) => console.log(`  ${DRY ? '·' : '✓'} ${h.cuenta} · ${h.title}: ${money(h.from)} → ${money(h.to)}`));
    }
    if (saltados.length) console.log(`Grupo "${g}": no se tocaron ${saltados.length} → ${saltados.join(', ')}`);
  }
  return avisos;
}

// ── Poner un precio EXACTO en ML (puede BAJAR) ─────────────────────────────
// Se usa solo para corregir precios que quedaron demasiado altos. A diferencia
// de raisePrice, este SÍ baja, así que trae dos frenos propios:
//   · nunca baja más del 25% de una (por si el precio objetivo salió mal),
//   · nunca deja el precio en 0 ni sube por acá (para subir está raisePrice).
// Devuelve {ok, from, to} o {ok:false, err}.
async function setPriceTo(itemId, variationId, nuevo, token) {
  let item;
  try { item = await mlGet('/items/' + itemId + '?attributes=id,price,status,variations', token); }
  catch { return { ok: false, err: 'sin-item' }; }
  if (item.status === 'closed') return { ok: false, err: 'cerrada' };
  let base, body;
  const to = Math.ceil(nuevo / 10) * 10;
  if (variationId && (item.variations || []).length) {
    const v = item.variations.find((x) => String(x.id) === String(variationId));
    if (!v || !v.price) return { ok: false, err: 'sin-variante' };
    base = v.price; body = { variations: [{ id: v.id, price: to }] };
  } else {
    if (!item.price) return { ok: false, err: 'sin-precio' };
    base = item.price; body = { price: to };
  }
  if (to >= base) return { ok: false, err: 'no-baja' };
  if (to < base * 0.75) return { ok: false, err: 'baja-mayor-a-25%' };
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
    // 'started'  = descuento aplicado AHORA.
    // 'pending'  = ya aceptado y AGENDADO para arrancar en una fecha futura. Antes se ignoraba, y
    //              era el agujero grande: quedaban 23 agendadas para el 3/8 con 40-55% de descuento
    //              que se iban a aplicar solas (el Paulvic de $14.360 se vendía a $7.799).
    // 'candidate'= ML solo lo ofrece, no está aceptado. Ese NO se toca: no cuesta nada.
    if (pr.status !== 'started' && pr.status !== 'pending') continue;
    // Si ML pusiera plata en el descuento, conviene quedarse. Hoy no manda ese dato en estas
    // campañas, pero si algún día lo manda, no se saca.
    if (typeof pr.meli_percentage === 'number' && pr.meli_percentage >= 100) continue;
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
// OJO CON EL TIMING: ML no descuenta su parte en el instante de la compra. Durante los primeros
// minutos el pago figura aprobado pero con las retenciones de impuestos SOLAMENTE, sin la comisión
// ni el costo fijo. Si se lee justo en ese momento, net_received viene altísimo y la venta queda
// guardada con una ganancia que no existe (un Paulvic de $14.360 quedó con neto $14.040 y 71% de
// ganancia, cuando el neto real era $10.656 y la ganancia 33%).
// Por eso: si el pago todavía no tiene los cargos de ML, se devuelve null y el que llama usa el
// fallback (precio − comisión de la orden), que es mucho más cercano. En la próxima corrida, ya
// con el pago liquidado, la venta se vuelve a escribir con el neto exacto.
async function orderNet(order, token, feeOut) {
  let net = 0, ok = false, mlfee = 0, tieneCargosML = false;
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
      // Cargos de ML por venta (comisión + costo fijo + envío Full + financiación), SIN impuestos.
      // Guardarlo por venta permite calcular el almacenamiento del mes al instante (factura − Σ estos).
      for (const c of (b.charges_details || [])) {
        const n = (c.name || '').toLowerCase();
        if (n.startsWith('tax_withholding')) continue;
        mlfee += c.amounts?.original || 0;
        tieneCargosML = true;   // apareció al menos un cargo propio de ML → el pago ya está liquidado
      }
    } catch { /* ignore */ }
  }
  if (feeOut) { feeOut.mlfee = Math.round(mlfee); feeOut.liquidado = tieneCargosML; }
  // Sin cargos de ML el neto no sirve todavía: mejor el fallback que un número inflado.
  return (ok && tieneCargosML) ? net : null;
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
let TG_SILENCIO = false; // cyc/mlconfig/telegramOff: corta TODOS los envíos (avisos y resumen)
// Horario permitido: 10:00 a 00:30 (hora Argentina). Fuera de eso no se manda nada, para no
// despertar a nadie. El resumen diario corre 23:23/23:41/23:53, así que entra cómodo.
function tgHorarioOk() {
  const p = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date()).reduce((o, x) => (o[x.type] = x.value, o), {});
  const h = parseInt(p.hour, 10), m = parseInt(p.minute, 10);
  if (h >= 10) return true;            // 10:00 → 23:59
  if (h === 0 && m <= 30) return true; // 00:00 → 00:30
  return false;                        // 00:31 → 09:59: silencio
}
let TG_DB = null; // se setea al arrancar, para poder guardar los mensajes de la madrugada
// Manda de verdad, sin mirar el horario (lo usa la cola, que ya lo chequeó).
async function tgEnviar(text) {
  const dest = TG_CHATS.length ? TG_CHATS : (TG_CHAT ? [String(TG_CHAT)] : []);
  if (!dest.length) return false;
  let anyOk = false;
  for (const chat_id of dest) {
    const r = await tgApi('sendMessage', { chat_id, text, parse_mode: 'HTML', disable_web_page_preview: true });
    if (r && r.ok) anyOk = true;
  }
  return anyOk;
}
// Fuera de horario los mensajes NO se pierden: quedan guardados y salen cuando abre la ventana.
// Se guardan hasta 20 (los más nuevos) para que una madrugada movida no dispare una avalancha.
async function tgEncolar(text) {
  if (!TG_DB) return;
  try {
    const cola = (await TG_DB.get('mlapi/telegram/cola')) || {};
    cola['m' + Date.now() + '_' + Object.keys(cola).length] = { text, ts: Date.now() };
    const ids = Object.keys(cola).sort((a, b) => (cola[a].ts || 0) - (cola[b].ts || 0));
    while (ids.length > 20) delete cola[ids.shift()];
    await TG_DB.set('mlapi/telegram/cola', cola);
    console.log('(Telegram fuera de horario: el mensaje queda guardado para las 10:00)');
  } catch { /* si falla, se pierde: no vale la pena romper la corrida por un aviso */ }
}
// Manda lo que quedó de la madrugada, con la hora original para que se entienda cuándo pasó.
async function tgFlushCola(db) {
  if (!TG_TOKEN || TG_SILENCIO) return;
  let cola = null;
  try { cola = await db.get('mlapi/telegram/cola'); } catch { return; }
  if (!cola || !Object.keys(cola).length) return;
  const ids = Object.keys(cola).sort((a, b) => (cola[a].ts || 0) - (cola[b].ts || 0));
  console.log(`Telegram: mandando ${ids.length} mensaje(s) que habían quedado de la madrugada.`);
  for (const id of ids) {
    const m = cola[id]; if (!m || !m.text) continue;
    const hora = new Intl.DateTimeFormat('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    }).format(new Date(m.ts || Date.now()));
    await tgEnviar(`🕙 <i>Esto pasó a las ${hora} y quedó esperando el horario</i>\n\n${m.text}`);
  }
  if (!DRY) await db.set('mlapi/telegram/cola', null);
}
// Solo se mandan DOS cosas por Telegram: el resumen del día y cuando dan de baja una
// publicación. Todo el resto (cambios de precio, descuentos, grupos nivelados) queda en el log
// del robot y no llega al celular. Antes se avisaba de todo y era ruido.
const TG_PERMITIDO = new Set(['resumen', 'baja']);
async function sendTelegram(text, tipo) {
  if (!TG_TOKEN || TG_SILENCIO) return false;
  if (!TG_PERMITIDO.has(tipo)) {
    console.log(`(Telegram: no se manda "${String(text).slice(0, 60).replace(/\n/g, ' ')}..." — solo van resumen y bajas)`);
    return false;
  }
  // Sin restricción de horario. La ventana 10:00-00:30 estaba porque el robot mandaba un mensaje
  // por cada cambio de precio y despertaba a la madrugada. Ahora solo salen dos cosas —el resumen
  // del día y las bajas de publicaciones— así que no hay volumen que justifique retenerlos, y el
  // resumen de la medianoche llegaba tarde o quedaba encolado por esa misma ventana.
  return tgEnviar(text);
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
  TG_DB = db;
  try { TG_SILENCIO = (await db.get('cyc/mlconfig/telegramOff')) === true; } catch { /* */ }
  if (TG_SILENCIO) console.log('Telegram SILENCIADO (cyc/mlconfig/telegramOff = true). No se manda nada.');
  await resolveTgChat(db);
  await tgFlushCola(db); // primero lo que quedó de la madrugada, después lo de esta corrida

  // TELEGRAM_TEST=1 → solo manda un mensaje de prueba y sale (para verificar
  // que el token está bien y que llega a tu celular). No toca nada más.
  if (process.env.TELEGRAM_TEST) {
    if (!TG_TOKEN) { console.log('✗ Falta el secret TELEGRAM_BOT_TOKEN.'); return; }
    if (!TG_CHATS.length) { console.log('✗ Nadie suscripto todavía. Mandale un "hola" al bot y reintento.'); return; }
    console.log(`Suscriptos (${TG_CHATS.length}):`);
    TG_CHATS.forEach((id) => console.log(`  · ${id}${TG_NAMES[id] ? ' — ' + TG_NAMES[id] : ''}`));
    const ok = await sendTelegram('✅ <b>CYC</b>: prueba de avisos. Si ves esto, ¡los avisos ya funcionan! 🎉', 'resumen');
    console.log(ok ? `✓ Prueba enviada a ${TG_CHATS.length} chat(s).`
      : '✗ No se pudo enviar. ¿Apretaron Start en el bot?');
    return;
  }

  // DAILY_SUMMARY=1 → resumen de ventas del día por Telegram. DAILY_SUMMARY=2026_07_27 → el de ese día.
  // GitHub saltea corridas programadas cuando está cargado, y como esto corre UNA vez por día, si se
  // saltea no sale nada (pasó el 27 y 28 de julio). Por eso el workflow lo intenta 3 veces antes de
  // medianoche y acá se guarda el último día enviado para no mandarlo repetido.
  if (process.env.DAILY_SUMMARY) {
    const vp = (await db.get('cyc/ventaprod')) || {};
    const arg = String(process.env.DAILY_SUMMARY).trim();
    const forzado = /^\d{4}_\d{2}_\d{2}$/.test(arg);
    // QUÉ DÍA SE RESUME: SIEMPRE EL ANTERIOR. El cron corre pasada la medianoche de Argentina,
    // así que "ayer" es el día que acaba de terminar, con todas sus ventas cerradas.
    // Antes resumía "hoy" a las 23:23, pero GitHub demora las corridas programadas y arrancaban
    // después de medianoche: resumía un día recién empezado, sin ventas, y lo anotaba como enviado,
    // así que a la noche siguiente tampoco salía. Los crons nunca se adelantan, solo se atrasan,
    // por eso esta regla es segura: se atrase lo que se atrase, "ayer" sigue siendo el día correcto.
    let today;
    if (forzado) today = arg;
    else {
      const ayerAR = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
      ayerAR.setDate(ayerAR.getDate() - 1);
      today = `${ayerAR.getFullYear()}_${String(ayerAR.getMonth() + 1).padStart(2, '0')}_${String(ayerAR.getDate()).padStart(2, '0')}`;
    }
    if (!forzado) {
      const ya = await db.get('mlapi/telegram/lastDaily');
      if (ya === today) { console.log(`Resumen de ${today} ya enviado, no lo repito.`); return; }
    }
    const day = vp[today] || {};
    // Los impuestos van al COSTO, igual que en la web. Sin esto el resumen inflaba la ganancia:
    // mostraba $224.643 donde la web decía $162.813, porque no descontaba IIBB ni monotributo
    // (juntos pesan ~5,6% de lo facturado).
    const monoPctDia = parseFloat(((await db.get('cyc/monotributo')) || {}).pct) || 0;
    const impDe = (v) => ((v.total || 0) * (mlExtraPct(v.cuenta) + monoPctDia) / 100);
    let n = 0, fact = 0, gan = 0;
    const byProd = {};   // producto -> unidades
    const ganProd = {};  // producto -> ganancia en $
    for (const v of Object.values(day)) {
      if (!v || v.cancelada) continue; // canceladas/reclamos no cuentan
      n += v.qty || 0;
      fact += v.total || 0;
      const g = (v.neto || 0) - (v.costo || 0) - impDe(v);
      gan += g;
      const k = v.prod || '?';
      byProd[k] = (byProd[k] || 0) + (v.qty || 0);
      ganProd[k] = (ganProd[k] || 0) + g;
    }
    const top = Object.entries(byProd).sort((a, b) => b[1] - a[1])[0];
    // Los 3 que MÁS GANANCIA dejaron en pesos. No es lo mismo que el más vendido: algo que se
    // vende de a muchas unidades baratas puede dejar menos que una sola venta grande.
    const top3 = Object.entries(ganProd).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const _pt = today.split('_');
    const fecha = `${_pt[2]}/${_pt[1]}`;
    const msg = `📊 <b>Resumen del día ${fecha}</b>\n`
      + `Ventas: <b>${n}</b>\n`
      + `Facturado: ${money(fact)}\n`
      + `Ganancia: <b>${money(gan)}</b>\n`
      + (top ? `🥇 Más vendido: ${top[0]} (${top[1]})\n` : 'Sin ventas ese día')
      + (top3.length ? `\n<b>Los que más ganancia dejaron</b>\n`
        + top3.map((t, i) => `${['🥇', '🥈', '🥉'][i]} ${t[0]}: <b>${money(Math.round(t[1]))}</b>`).join('\n') : '');
    const ok = await sendTelegram(msg, 'resumen');
    if (ok && !forzado && !DRY) await db.set('mlapi/telegram/lastDaily', today);
    console.log(ok ? `✓ Resumen de ${today} enviado.` : '✗ No se pudo enviar el resumen (revisá Telegram).');
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
    // Facturas TOTALES de ML ya leídas (corrida =totals). Sirven de respaldo cuando la API de
    // facturación devuelve 429 (rate-limit 5/min). Los cargos por venta SÍ se calculan reales.
    const KNOWN_BILL = {
      '2026-05-01': { adriana: 1948053, ayelen: 4884639, luciana: 3279709, matias: 1967596 },
      '2026-06-01': { adriana: 2189931, ayelen: 3469968, luciana: 3087837, matias: 3056715 },
      '2026-07-01': { adriana: 1817026, ayelen: 1826477, luciana: 2420347, matias: 2245683 },
    };
    // BILLING_PROBE=fast:<periodo> → ALMACENAMIENTO rápido y casi exacto, SIN leer pago por pago.
    // storage = factura ML − Σ(total−neto de las ventas del período)×0.9695
    // El 0.9695 saca el ~3% de impuestos (calibrado contra julio, que sí calculamos exacto).
    if (String(process.env.BILLING_PROBE).startsWith('fast:')) {
      const key = String(process.env.BILLING_PROBE).slice(5).trim();
      const win = PERIOD_WIN[key];
      if (!win) { console.log('Período desconocido:', key); return; }
      const TAXADJ = 0.9695; // 1 − 3.05% impuestos (ratio real de julio)
      const fromDk = dayKeyFromISO(win[0]), toDk = dayKeyFromISO(win[1]);
      const vp = (await db.get('cyc/ventaprod')) || {};
      // Σ(total−neto) por cuenta, de las ventas cuyo día cae en la ventana del período
      const grossMinusNet = {};
      for (const [dk, ents] of Object.entries(vp)) {
        if (dk < fromDk || dk > toDk) continue;
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada) continue;
          const a = (v.cuenta || '').toLowerCase();
          grossMinusNet[a] = (grossMinusNet[a] || 0) + ((v.total || 0) - (v.neto || 0));
        }
      }
      const sleepK = (ms) => new Promise((r) => setTimeout(r, ms));
      const perAcct = {}; let total = 0, billsOk = 0;
      for (const label of labels) {
        const acc = accounts[label];
        if (!acc?.refresh_token) continue;
        const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
        await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
        let bill = null;
        for (let attempt = 0; attempt < 4 && bill == null; attempt++) {
          if (attempt) await sleepK(20000); // esperar si falló (rate-limit 5/min)
          try {
            const r = await fetch('https://api.mercadolibre.com/billing/integration/monthly/periods?group=ML&document_type=BILL&limit=13', { headers: { Authorization: 'Bearer ' + t.access_token } });
            if (r.status === 429) { console.log(`   (${label} facturación 429, reintento...)`); continue; }
            const pr = await r.json();
            const per = (pr.results || []).find((x) => x.key === key);
            if (per) { bill = per.amount; }
            else break; // respondió pero no está el período → no reintentar
          } catch (e) { console.log(`   (facturación ${label}: ${String(e.message || '').slice(0, 40)})`); }
        }
        await sleepK(13000); // espaciar la próxima cuenta (límite 5/min)
        const a = label.toLowerCase();
        const feesEst = Math.round((grossMinusNet[a] || 0) * TAXADJ);
        const storage = bill != null ? Math.round(bill - feesEst) : null;
        perAcct[a] = { bill: bill != null ? Math.round(bill) : null, fees: feesEst, storage };
        if (storage != null) { total += Math.max(0, storage); billsOk++; }
        console.log(`▶ ${label} ${key}: facturado ${money(Math.round(bill || 0))} − cargos venta ${money(feesEst)} = almacenamiento ${money(storage || 0)}`);
      }
      if (billsOk === 0) { console.log(`\n✗ No pude leer NINGUNA facturación de ML (rate-limit). NO sobrescribo ${key}. Reintentá más tarde.`); return; }
      const rec = { key, from: new Date(win[0]).toISOString(), to: new Date(win[1]).toISOString(), days: Math.round((win[1] - win[0]) / 86400000) + 1, total: Math.round(total), perAcct, ts: Date.now(), metodo: 'fast' };
      await db.set('cyc/mlapi/storage/periods/' + key, rec);
      console.log(`\n✓ Guardado almacenamiento período ${key} (rápido): TOTAL ${money(Math.round(total))} · ${billsOk}/4 cuentas`);
      return;
    }
    // BILLING_PROBE=bfull:<periodo> → DIAGNÓSTICO: para UNA cuenta muestra (a) la factura total, (b) el
    // desglose por concepto de TODOS los cargos que aparecen en los pagos (nombre → suma), (c) el resto
    // (factura − cargos de venta) que es lo que llamamos almacenamiento, y (d) prueba endpoints de
    // detalle de facturación de ML por si sueltan el desglose oficial. account=Adriana por defecto.
    if (String(process.env.BILLING_PROBE).startsWith('bfull:')) {
      const key = String(process.env.BILLING_PROBE).slice(6).trim();
      const win = PERIOD_WIN[key];
      if (!win) { console.log('Período desconocido:', key); return; }
      const forced = (process.env.ACCOUNT || 'adriana').trim().toLowerCase();
      const label = labels.find((l) => l.toLowerCase() === forced) || labels[0];
      const acc = accounts[label];
      if (!acc?.refresh_token) { console.log('Sin token:', label); return; }
      const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
      await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
      // factura total
      let bill = null, perObj = null;
      try {
        const r = await fetch('https://api.mercadolibre.com/billing/integration/monthly/periods?group=ML&document_type=BILL&limit=13', { headers: { Authorization: 'Bearer ' + t.access_token } });
        const pr = await r.json();
        perObj = (pr.results || []).find((x) => x.key === key) || null;
        if (perObj) bill = perObj.amount;
      } catch (e) { console.log('facturación error', String(e.message || '')); }
      console.log(`\n=== ${label} · período ${key} ===`);
      console.log('Factura total ML:', money(Math.round(bill || 0)));
      if (perObj) console.log('Objeto período (crudo):', JSON.stringify(perObj).slice(0, 1500));
      // desglose por concepto de los cargos que ML mete en cada pago
      const paid = await fetchOrdersRange(acc.seller_id, t.access_token, win[0], win[1]);
      const byId = new Map(paid.map((o) => [o.id, o]));
      const porConcepto = {}; let ventaFees = 0, done = 0;
      for (const o of byId.values()) {
        for (const p of (o.payments || [])) {
          if (!p.id) continue;
          let b = null;
          try { const r = await fetch('https://api.mercadopago.com/v1/payments/' + p.id, { headers: { Authorization: 'Bearer ' + t.access_token } }); b = await r.json(); } catch { continue; }
          for (const c of (b?.charges_details || [])) {
            const n = (c.name || '¿?'); const amt = c.amounts?.original || 0;
            porConcepto[n] = (porConcepto[n] || 0) + amt;
            if (!n.toLowerCase().startsWith('tax_withholding')) ventaFees += amt;
          }
        }
        done++; if (done % 150 === 0) console.log(`   ...${done}/${byId.size}`);
      }
      console.log(`\nCargos por concepto (en los pagos de ${byId.size} ventas):`);
      for (const [n, v] of Object.entries(porConcepto).sort((a, b) => b[1] - a[1])) console.log(`   ${n}: ${money(Math.round(v))}`);
      console.log(`\nCargos de venta (sin impuestos): ${money(Math.round(ventaFees))}`);
      console.log(`RESTO (factura − cargos de venta) = "almacenamiento": ${money(Math.round((bill || 0) - ventaFees))}`);
      // ¿ML suelta el detalle oficial por concepto?
      console.log('\nProbando endpoints de detalle de facturación:');
      const urls = [
        `https://api.mercadolibre.com/billing/integration/monthly/periods/${key}/details?group=ML&document_type=BILL`,
        `https://api.mercadolibre.com/billing/integration/periods/${key}/details?group=ML`,
        `https://api.mercadolibre.com/billing/integration/monthly/periods/${key}/summary?group=ML&document_type=BILL`,
        `https://api.mercadolibre.com/billing/integration/monthly/periods?group=ML&document_type=BILL&expand=details&limit=13`,
      ];
      for (const u of urls) {
        try { const rr = await fetch(u, { headers: { Authorization: 'Bearer ' + t.access_token } }); console.log(`   [${rr.status}] ${u.slice(46)}`); if (rr.ok) console.log('      →', JSON.stringify(await rr.json()).slice(0, 1200)); } catch (e) { console.log('   err', String(e.message || '').slice(0, 30)); }
      }
      return;
    }
    // BILLING_PROBE=calc1:<periodo> → almacenamiento EXACTO pero de a UNA cuenta por corrida (para no
    // saturar ML). Cada vez procesa la próxima cuenta que falta y guarda su resultado. Con 4 corridas
    // queda el período completo. Podés forzar una cuenta con account=Matias.
    if (String(process.env.BILLING_PROBE).startsWith('calc1:')) {
      const key = String(process.env.BILLING_PROBE).slice(6).trim();
      const win = PERIOD_WIN[key];
      if (!win) { console.log('Período desconocido:', key); return; }
      const sleep1 = (ms) => new Promise((r) => setTimeout(r, ms));
      const rec = (await db.get('cyc/mlapi/storage/periods/' + key)) || { key };
      rec.perAcct = rec.perAcct || {};
      // elegir la próxima cuenta que falta (o la forzada por account=)
      const forced = (process.env.ACCOUNT || '').trim().toLowerCase();
      const label = labels.find((l) => forced ? l.toLowerCase() === forced : (!rec.perAcct[l.toLowerCase()] || rec.perAcct[l.toLowerCase()].storage == null));
      if (!label) {
        rec.total = Object.values(rec.perAcct).reduce((s, x) => s + Math.max(0, x.storage || 0), 0);
        rec.metodo = 'exacto-por-cuenta'; rec.from = new Date(win[0]).toISOString(); rec.to = new Date(win[1]).toISOString(); rec.days = Math.round((win[1] - win[0]) / 86400000) + 1; rec.ts = Date.now();
        await db.set('cyc/mlapi/storage/periods/' + key, rec);
        console.log(`✓ Período ${key} COMPLETO (4/4): TOTAL ${money(rec.total)}`);
        return;
      }
      const acc = accounts[label];
      if (!acc?.refresh_token) { console.log('Sin token:', label); return; }
      const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
      await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
      // factura de esa cuenta (con reintento por rate-limit)
      let bill = null;
      for (let a2 = 0; a2 < 4 && bill == null; a2++) {
        if (a2) await sleep1(20000);
        try {
          const r = await fetch('https://api.mercadolibre.com/billing/integration/monthly/periods?group=ML&document_type=BILL&limit=13', { headers: { Authorization: 'Bearer ' + t.access_token } });
          if (r.status === 429) { console.log('   facturación 429, reintento...'); continue; }
          const pr = await r.json();
          const per = (pr.results || []).find((x) => x.key === key);
          if (per) bill = per.amount; else break;
        } catch (e) { console.log('   facturación error', String(e.message || '').slice(0, 40)); }
      }
      // Si la API no soltó la factura (rate-limit), uso la factura ya conocida de la corrida =totals.
      if (bill == null && KNOWN_BILL[key] && KNOWN_BILL[key][label.toLowerCase()] != null) {
        bill = KNOWN_BILL[key][label.toLowerCase()];
        console.log(`   (facturación ${label} desde respaldo conocido: ${money(bill)})`);
      }
      // cargos ML reales por venta de esa cuenta en el período (pago por pago, pero UNA sola cuenta)
      const paid = await fetchOrdersRange(acc.seller_id, t.access_token, win[0], win[1]);
      const byId = new Map(paid.map((o) => [o.id, o]));
      let fees = 0, done = 0;
      for (const o of byId.values()) {
        for (const p of (o.payments || [])) {
          if (!p.id) continue;
          let b = null;
          try { const r = await fetch('https://api.mercadopago.com/v1/payments/' + p.id, { headers: { Authorization: 'Bearer ' + t.access_token } }); b = await r.json(); } catch { continue; }
          for (const c of (b?.charges_details || [])) { const n = (c.name || '').toLowerCase(); if (!n.startsWith('tax_withholding')) fees += c.amounts?.original || 0; }
        }
        done++; if (done % 150 === 0) console.log(`   ...${label}: ${done}/${byId.size}`);
      }
      const storage = bill != null ? Math.round(bill - fees) : null;
      rec.perAcct[label.toLowerCase()] = { bill: bill != null ? Math.round(bill) : null, fees: Math.round(fees), storage, ordenes: byId.size };
      rec.total = Object.values(rec.perAcct).reduce((s, x) => s + Math.max(0, x.storage || 0), 0);
      rec.metodo = 'exacto-por-cuenta'; rec.from = new Date(win[0]).toISOString(); rec.to = new Date(win[1]).toISOString(); rec.days = Math.round((win[1] - win[0]) / 86400000) + 1; rec.ts = Date.now();
      await db.set('cyc/mlapi/storage/periods/' + key, rec);
      const cnt = Object.values(rec.perAcct).filter((x) => x.storage != null).length;
      console.log(`✓ ${label} ${key}: facturado ${money(Math.round(bill || 0))} − cargos ${money(Math.round(fees))} = almacenamiento ${money(storage || 0)} · ${byId.size} órdenes · ${cnt}/4 cuentas listas`);
      return;
    }
    // BILLING_PROBE=purgemes → BORRA los gastos mensuales de almacenamiento (almmes_*) y los períodos
    // guardados. Se usa para limpiar los números MAL calculados (método "resto", que inflaba de más).
    // Los reales (chicos, del reporte oficial de ML) se cargan después con seedreal.
    if (process.env.BILLING_PROBE === 'purgemes') {
      const compras = (await db.get('cyc/compras')) || {};
      const del = {}; let n = 0;
      for (const [id, x] of Object.entries(compras)) {
        if (id.startsWith('almmes_') || id.startsWith('mlcargo_') || (x && (x.cat === 'Almacenamiento Full' || x.cat === 'Cargos ML (débito automático)'))) { del[id] = null; n++; }
      }
      if (!DRY && n) await db.patch('cyc/compras', del);
      if (!DRY) await db.set('cyc/mlapi/storage/periods', null);
      console.log(`${DRY ? '(DRY) ' : ''}Borrados ${n} gastos sueltos de almacenamiento/cargos ML + períodos (ahora van en el % por venta).`);
      return;
    }
    // BILLING_PROBE=seedreal:<YYYY_MM>=<monto> → carga UN gasto mensual de almacenamiento con el número
    // REAL sacado del reporte oficial de ML (Costos por servicio de almacenamiento). Idempotente.
    // Ej: seedreal:2026_07=70085  → gasto almmes_2026_07 de $70.085 en el día 1 de julio.
    if (String(process.env.BILLING_PROBE).startsWith('seedreal:')) {
      const arg = String(process.env.BILLING_PROBE).slice(9).trim();
      const m = arg.match(/^(\d{4}_\d{2})=(\d+)$/);
      if (!m) { console.log('Formato: seedreal:2026_07=70085'); return; }
      const ym = m[1], monto = parseInt(m[2], 10);
      const id = 'almmes_' + ym;
      const gasto = { id, monto, cat: 'Almacenamiento Full', tipo: 'gasto', desc: `Almacenamiento Full ML (real, reporte oficial ${ym})`, dayKey: ym + '_01', ts: Date.now(), auto: true };
      if (!DRY) await db.patch('cyc/compras', { [id]: gasto });
      console.log(`${DRY ? '(DRY) ' : ''}Cargado ${id} = ${money(monto)} (almacenamiento real).`);
      return;
    }
    // BILLING_PROBE=licua → mide la LICUACIÓN: cuánto pierden mes a mes los pesos parados (efectivo +
    // MP disponible + a liquidar) por la suba del dólar. Usa los cierres guardados (cyc/snapshots).
    if (process.env.BILLING_PROBE === 'licua') {
      const snaps = (await db.get('cyc/snapshots')) || {};
      const keys = Object.keys(snaps).sort();
      console.log('LICUACIÓN DE PESOS PARADOS (por la suba del dólar), mes a mes:');
      console.log('(pesos parados = efectivo + MercadoPago disponible + a liquidar en ML)\n');
      console.log('mes cerrado   dólar          sube%   pesos parados   LICUACIÓN');
      let totLic = 0, n = 0;
      for (let i = 1; i < keys.length; i++) {
        const a = snaps[keys[i - 1]], b = snaps[keys[i]];
        const tcA = a.tipoCambio || 0, tcB = b.tipoCambio || 0;
        if (!tcA || !tcB) continue;
        const f = a.finanzas || {};
        const holdUSD = (parseFloat(f.efectivo) || 0) + (parseFloat(f.mp_disp) || 0) + (parseFloat(f.mp_liq) || 0);
        const rise = (tcB / tcA - 1) * 100;
        const licua = Math.round(holdUSD * (tcB - tcA));
        totLic += licua; n++;
        console.log(`${(b.label || keys[i]).padEnd(12)}  $${Math.round(tcA)}→$${Math.round(tcB)}   ${rise.toFixed(1).padStart(5)}%   US$${Math.round(holdUSD).toLocaleString('es-AR').padStart(7)}   ${money(licua)}`);
      }
      if (n) console.log(`\nPromedio de licuación por mes: ${money(Math.round(totLic / n))} (sobre ${n} meses).`);
      return;
    }
    // BILLING_PROBE=chkmes:<YYYY_MM> → dumpea lo que la WEB tiene de ese mes: neto+costo por cuenta,
    // la lista de GASTOS cargados, y el retiro. Para cruzar contra la realidad de MercadoPago.
    if (String(process.env.BILLING_PROBE).startsWith('chkmes:')) {
      const ym = String(process.env.BILLING_PROBE).slice(7).trim(); // 2026_06
      const vp = (await db.get('cyc/ventaprod')) || {};
      const perAcc = {};
      for (const [dk, ents] of Object.entries(vp)) {
        if (!dk.startsWith(ym)) continue;
        for (const v of Object.values(ents || {})) {
          if (!v) continue;
          const a = (v.cuenta || '?');
          perAcc[a] = perAcc[a] || { neto: 0, canc: 0, n: 0 };
          if (v.cancelada) { perAcc[a].canc++; continue; }
          perAcc[a].neto += (v.neto || 0); perAcc[a].n++;
        }
      }
      console.log(`\n=== WEB · mes ${ym} ===\nNETO por cuenta (ventas no canceladas):`);
      let netoTot = 0;
      for (const [a, x] of Object.entries(perAcc)) { console.log(`   ${a}: neto ${money(Math.round(x.neto))} · ${x.n} ventas · ${x.canc} canc`); netoTot += x.neto; }
      console.log(`   TOTAL neto web: ${money(Math.round(netoTot))}`);
      const compras = (await db.get('cyc/compras')) || {};
      const gastos = Object.values(compras).filter((x) => x && (x.dayKey || '').startsWith(ym));
      let gTot = 0;
      console.log(`\nGASTOS cargados en ${ym}:`);
      for (const g of gastos.sort((a, b) => (b.monto || 0) - (a.monto || 0))) { console.log(`   ${money(Math.round(g.monto || 0))}  [${g.cat || g.tipo || '?'}]  ${(g.desc || '').slice(0, 45)}`); gTot += (g.monto || 0); }
      console.log(`   TOTAL gastos web: ${money(Math.round(gTot))} (${gastos.length} items)`);
      const rm = (await db.get('cyc/retiro_mes/' + ym));
      console.log(`\nRETIRO cargado ${ym}: ${rm != null ? money(Math.round(Number(rm))) : '(no cargado)'}`);
      return;
    }
    // BILLING_PROBE=mlcargo:<YYYY_MM>=<monto> → carga UN gasto mensual con los CARGOS DE ML que ML te
    // cobra por DÉBITO AUTOMÁTICO / "facturas vencidas" (los que NO están en el neto de cada venta).
    // Es la parte de la factura de ML que sale de tu saldo aparte. Ej: mlcargo:2026_06=1043595.
    if (String(process.env.BILLING_PROBE).startsWith('mlcargo:')) {
      const arg = String(process.env.BILLING_PROBE).slice(8).trim();
      const m = arg.match(/^(\d{4}_\d{2})=(\d+)$/);
      if (!m) { console.log('Formato: mlcargo:2026_06=1043595'); return; }
      const ym = m[1], monto = parseInt(m[2], 10);
      const id = 'mlcargo_' + ym;
      const gasto = { id, monto, cat: 'Cargos ML (débito automático)', tipo: 'gasto', desc: `Cargos de ML por débito automático / facturas vencidas (${ym})`, dayKey: ym + '_01', ts: Date.now(), auto: true };
      if (!DRY) await db.patch('cyc/compras', { [id]: gasto });
      console.log(`${DRY ? '(DRY) ' : ''}Cargado ${id} = ${money(monto)} (cargos ML débito automático).`);
      return;
    }
    // BILLING_PROBE=traceventa → rastrea 3 ventas reales de una cuenta (ACCOUNT=Matias) en junio:
    // muestra precio → qué le sacó ML en el momento (charges) → cuánto quedó (net_received). Para ver
    // si "Recibís" ya tiene todo descontado o no. account=Matias.
    if (process.env.BILLING_PROBE === 'traceventa') {
      const forced = (process.env.ACCOUNT || 'matias').trim().toLowerCase();
      const label = labels.find((l) => l.toLowerCase() === forced) || labels[0];
      const acc = accounts[label];
      if (!acc?.refresh_token) { console.log('Sin token:', label); return; }
      const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
      await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
      const win = [Date.UTC(2026, 5, 1), Date.UTC(2026, 5, 30, 23, 59, 59)];
      const orders = await fetchOrdersRange(acc.seller_id, t.access_token, win[0], win[1]);
      console.log(`\n=== RASTREO de ventas de ${label} (junio) — ${orders.length} órdenes ===\n`);
      let shown = 0;
      for (const o of orders) {
        if (shown >= 3) break;
        const it = (o.order_items || [])[0];
        if (!it) continue;
        const precio = (it.unit_price || 0) * (it.quantity || 1);
        for (const p of (o.payments || [])) {
          if (!p.id) continue;
          let b = null;
          try { const r = await fetch('https://api.mercadopago.com/v1/payments/' + p.id, { headers: { Authorization: 'Bearer ' + t.access_token } }); b = await r.json(); } catch { continue; }
          const net = b?.transaction_details?.net_received_amount;
          if (typeof net !== 'number') continue;
          console.log(`Venta #${o.pack_id || o.id} · ${(it.item?.title || '').slice(0, 40)}`);
          console.log(`   Precio de venta:        ${money(Math.round(precio))}`);
          let sumCh = 0;
          for (const c of (b.charges_details || [])) {
            const amt = c.amounts?.original || 0; sumCh += amt;
            console.log(`   − ${(c.name || '?').padEnd(28)} ${money(Math.round(amt))}`);
          }
          console.log(`   = RECIBÍS (net):        ${money(Math.round(net))}`);
          console.log(`   (precio − cargos = ${money(Math.round(precio - sumCh))} · net real = ${money(Math.round(net))})\n`);
          shown++;
          break;
        }
      }
      console.log(`Recordá: el débito "facturas vencidas" de ${label} en junio fue chico. Ese monto es aparte,\nse cobra del saldo a fin de mes, y NO figura en estos net_received de arriba.`);
      return;
    }
    // BILLING_PROBE=rentab[:<días>] → ANÁLISIS DE RENTABILIDAD COMPLETO para decidir el % mínimo
    // de ganancia por producto. Usa el modelo ACTUAL de la web (cargo ML % por cuenta sobre el precio).
    // Muestra: (A) economía mensual (neto − costo − cargo ML − gastos fijos − retiros), (B) gastos
    // fijos por categoría, (C) punto de equilibrio, (D) margen real por producto con ganancia $,
    // stock y capital parado, (E) simulación de pisos de margen (qué se pierde si cortás bajo X%).
    if (String(process.env.BILLING_PROBE || '').startsWith('rentab')) {
      const _rp = String(process.env.BILLING_PROBE).split(':');
      const days = parseInt(_rp[1], 10) || 60;
      // rentab:60:2026_06,2026_07 → analiza SOLO esos meses (sirve para sacar de la cuenta un mes
      // atípico). El margen por producto también sale de las ventas de esos meses, no de los N días.
      const pickYM = (_rp[2] || '').split(',').map((s) => s.trim()).filter(Boolean);
      const MLX = { adriana: 4.07, luciana: 4.37, ayelen: 5.95, matias: 4.58 };
      const mlx = (c) => { const v = MLX[(c || '').toLowerCase()]; return v != null ? v : 4.8; };
      const vp = (await db.get('cyc/ventaprod')) || {};
      const compras = (await db.get('cyc/compras')) || {};
      const retiros = (await db.get('cyc/retiro_mes')) || {};
      const inventory = (await db.get('cyc/inventory')) || {};
      const fin = (await db.get('cyc/finanzas')) || {};
      const tc = parseFloat(fin.tipo_cambio) || 1500;
      const pIdx = {}; for (const p of products) pIdx[p.id] = p;

      // ── A. Economía mensual (últimos 4 meses) — costo = el guardado en cada venta + cargo ML,
      //       igual que el arqueo de la web.
      const now = new Date();
      let months = [];
      if (pickYM.length) months = pickYM.slice().sort();
      else for (let i = 3; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); months.push(d.getFullYear() + '_' + String(d.getMonth() + 1).padStart(2, '0')); }
      // Días realmente cubiertos por los meses elegidos (el mes en curso cuenta solo los transcurridos).
      let spanDays = days;
      if (pickYM.length) {
        spanDays = 0;
        for (const ym of months) {
          const [yy, mm] = ym.split('_').map(Number);
          if (now.getFullYear() === yy && now.getMonth() + 1 === mm) spanDays += now.getDate();
          else spanDays += new Date(yy, mm, 0).getDate();
        }
      }
      const mAgg = {};
      for (const [k, ents] of Object.entries(vp)) {
        const ym = k.slice(0, 7); if (!months.includes(ym)) continue;
        const m = mAgg[ym] || (mAgg[ym] = { neto: 0, total: 0, costo: 0, mlx: 0, ventas: 0 });
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada) continue;
          m.neto += v.neto || 0; m.total += v.total || 0; m.ventas++;
          m.mlx += (v.total || 0) * mlx(v.cuenta) / 100;
          m.costo += v.costo || 0;
        }
      }
      const gastosMes = {}, gastosCat = {};
      for (const g of Object.values(compras)) {
        if (!g || g.tipo === 'mercaderia') continue;
        const ym = (g.dayKey || '').slice(0, 7); if (!months.includes(ym)) continue;
        gastosMes[ym] = (gastosMes[ym] || 0) + (g.monto || 0);
        const cat = g.cat || 'Otros'; (gastosCat[cat] = gastosCat[cat] || {})[ym] = (gastosCat[cat][ym] || 0) + (g.monto || 0);
      }
      console.log(`=== RENTABILIDAD CYC · dólar actual ${money(tc)} ===\n`);
      console.log(`── A. ECONOMÍA MENSUAL (modelo actual: cargo ML % por cuenta ya descontado) ──`);
      for (const ym of months) {
        const m = mAgg[ym]; if (!m) { console.log(`  ${ym}: sin ventas`); continue; }
        const gan = m.neto - m.costo - m.mlx;
        const gFijos = gastosMes[ym] || 0;
        const ret = retiros[ym] != null ? Number(retiros[ym]) : null;
        const retVal = ret != null ? ret : Math.round(m.neto * 0.15);
        const cyc = gan - gFijos - retVal;
        const mgC = (m.costo + m.mlx) > 0 ? gan / (m.costo + m.mlx) * 100 : 0;
        console.log(`  ${ym}: fact ${money(Math.round(m.total))} · neto ${money(Math.round(m.neto))} · costo+ML ${money(Math.round(m.costo + m.mlx))} → GANANCIA ${money(Math.round(gan))} (${mgC.toFixed(1)}% s/costo)`);
        console.log(`          − gastos fijos ${money(Math.round(gFijos))} − retiros ${money(retVal)}${ret == null ? ' (est. 15%)' : ''} = QUEDA CYC ${money(Math.round(cyc))} · ${m.ventas} ítems`);
      }
      console.log(`\n── B. GASTOS FIJOS POR CATEGORÍA (por mes) ──`);
      for (const [cat, per] of Object.entries(gastosCat).sort((a, b) => Object.values(b[1]).reduce((s, x) => s + x, 0) - Object.values(a[1]).reduce((s, x) => s + x, 0))) {
        const vals = months.map((ym) => per[ym] != null ? money(Math.round(per[ym])) : '—');
        console.log(`  ${cat.padEnd(30)} ${vals.join('  ')}`);
      }
      // ── C. Punto de equilibrio con promedios de los meses CERRADOS (todos menos el actual)
      const closed = (pickYM.length ? months : months.slice(0, -1)).filter((ym) => mAgg[ym]);
      const avg = (f) => closed.length ? closed.reduce((s, ym) => s + f(ym), 0) / closed.length : 0;
      const avgCosto = avg((ym) => mAgg[ym].costo + mAgg[ym].mlx);
      const avgGfijos = avg((ym) => gastosMes[ym] || 0);
      const avgRet = avg((ym) => retiros[ym] != null ? Number(retiros[ym]) : Math.round(mAgg[ym].neto * 0.15));
      const avgFact = avg((ym) => mAgg[ym].total);
      const beSinRet = avgCosto > 0 ? avgGfijos / avgCosto * 100 : 0;
      const beConRet = avgCosto > 0 ? (avgGfijos + avgRet) / avgCosto * 100 : 0;
      console.log(`\n── C. PUNTO DE EQUILIBRIO (promedio de: ${closed.join(', ')}) ──`);
      console.log(`  Facturación prom: ${money(Math.round(avgFact))} · costo+ML vendido prom: ${money(Math.round(avgCosto))}`);
      console.log(`  Gastos fijos prom: ${money(Math.round(avgGfijos))}/mes · Retiros prom: ${money(Math.round(avgRet))}/mes`);
      console.log(`  → margen s/costo para cubrir SOLO gastos fijos: ${beSinRet.toFixed(1)}%`);
      console.log(`  → margen s/costo para cubrir fijos + retiros (CYC=0): ${beConRet.toFixed(1)}%`);
      // ── D. Margen real por producto (últimos N días, costo ACTUAL del producto × dólar actual)
      const fromKey = dayKeyFromISO(Date.now() - (days - 1) * 864e5);
      const inWin = (k) => pickYM.length ? months.includes(k.slice(0, 7)) : (k >= fromKey);
      const byProd = {};
      for (const [k, ents] of Object.entries(vp)) {
        if (!inWin(k)) continue;
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada) continue;
          const total = v.total || 0, neto = v.neto || 0; if (neto <= 0) continue;
          const id = v.prodId || v.prod || '?';
          const b = byProd[id] || (byProd[id] = { nom: v.prod || id, ventas: 0, qty: 0, total: 0, neto: 0, mlx: 0 });
          b.ventas++; b.qty += v.qty || 1; b.total += total; b.neto += neto; b.mlx += total * mlx(v.cuenta) / 100;
        }
      }
      const stockU = (pid) => Object.entries(inventory).filter(([k]) => k.startsWith(pid + '__') && !k.includes('__v__')).reduce((s, [, v]) => s + (parseInt(v) || 0), 0);
      const rows = []; let sinCosto = 0;
      for (const [id, b] of Object.entries(byProd)) {
        const p = pIdx[id];
        const cU = p ? costoPesos(p, 1, tc).costo : 0;
        if (!cU) { sinCosto++; continue; }
        const costo = cU * b.qty + b.mlx;
        const gan = b.neto - costo;
        const mg = costo > 0 ? gan / costo * 100 : 0;
        const stk = stockU(id);
        rows.push({ nom: b.nom, ventas: b.ventas, qty: b.qty, gan, mg, ganMes: gan / spanDays * 30, stk, capital: Math.round(stk * cU), precio: b.total / Math.max(1, b.ventas) });
      }
      rows.sort((a, b) => a.mg - b.mg);
      const ganTot = rows.reduce((s, r) => s + r.gan, 0);
      console.log(`\n── D. MARGEN REAL POR PRODUCTO (${pickYM.length?'meses '+months.join(', '):'últimos '+days+' días'} · ${spanDays} días · ${rows.length} prods con costo · ${sinCosto} sin costo omitidos) ──`);
      for (const r of rows) console.log(`  ${String(Math.round(r.mg)).padStart(4)}% · gan/mes ${money(Math.round(r.ganMes)).padStart(11)} · ${String(r.ventas).padStart(3)}v · precio ${money(Math.round(r.precio)).padStart(9)} · stock ${String(r.stk).padStart(4)}u (${money(r.capital)}) · ${r.nom.slice(0, 38)}`);
      // ── E. Simulación de pisos
      console.log(`\n── E. SI CORTÁS TODO PRODUCTO QUE GANA MENOS DE X% (proyección /mes sobre ${spanDays} días) ──`);
      console.log(`  Ganancia total actual: ${money(Math.round(ganTot / spanDays * 30))}/mes`);
      for (const floor of [15, 20, 25, 30, 35, 40]) {
        const cut = rows.filter((r) => r.mg < floor);
        const ganCut = cut.reduce((s, r) => s + r.gan, 0);
        const capCut = cut.reduce((s, r) => s + r.capital, 0);
        const vCut = cut.reduce((s, r) => s + r.ventas, 0);
        console.log(`  piso ${String(floor).padStart(2)}%: cortás ${String(cut.length).padStart(3)} prods · perdés ${money(Math.round(ganCut / spanDays * 30)).padStart(11)}/mes (${ganTot > 0 ? (ganCut / ganTot * 100).toFixed(1) : 0}% de la gan.) · liberás ${money(capCut).padStart(12)} de stock · ${Math.round(vCut / spanDays * 30)} ventas/mes menos de trabajo`);
      }
      return;
    }
    // BILLING_PROBE=tg:off / tg:on → corta o reanuda TODOS los mensajes de Telegram
    // (avisos de margen, problemas de publicaciones y resumen diario). Queda guardado en
    // cyc/mlconfig/telegramOff, así sobrevive entre corridas.
    if (String(process.env.BILLING_PROBE || '').startsWith('tg:')) {
      const modo = String(process.env.BILLING_PROBE).split(':')[1];
      const off = modo === 'off';
      if (!DRY) await db.set('cyc/mlconfig/telegramOff', off);
      console.log(off
        ? '🔕 Telegram SILENCIADO. No se manda ningún mensaje hasta reactivarlo con tg:on.'
        : '🔔 Telegram REACTIVADO. Vuelven los avisos y el resumen diario.');
      return;
    }
    // BILLING_PROBE=monofix → saca de los GASTOS la parte del monotributo que ahora está en el costo
    // de los productos (el impuesto integrado), y deja cargado solo el autónomo + obra social.
    // Sin esto el monotributo queda contado DOS VECES: en el costo de cada venta y como gasto.
    // El monto que queda es fijoMensual × cantidad de meses que cubría ese pago (junio cubría 2).
    if (String(process.env.BILLING_PROBE || '').startsWith('monofix')) {
      const mono = (await db.get('cyc/monotributo')) || {};
      const fijo = parseFloat(mono.fijoMensual) || 0;
      if (!fijo) { console.log('Falta cargar el autónomo + obra social en Ajustes. No toco nada.'); return; }
      const compras = (await db.get('cyc/compras')) || {};
      // Cuántos meses cubre lo pagado en cada mes: en junio se pagaron mayo+junio juntos.
      const MESES = { '2026_06': 2, '2026_07': 1 };
      // Se agrupan por mes porque puede haber VARIOS gastos del mismo mes (uno por cuenta).
      // Se borran todos y se deja UNO solo con el autónomo + obra social. Si en vez de agrupar se
      // ajustara cada uno, el monto quedaría multiplicado por la cantidad de cuentas.
      const porMes = {};
      for (const [id, g] of Object.entries(compras)) {
        if (!g || g.tipo === 'mercaderia') continue;
        if (!/monotributo|impuesto/i.test(g.cat || '')) continue;
        if (id.startsWith('monofijo_')) continue; // ya son solo el fijo (los carga el robot)
        const ym = (g.dayKey || '').slice(0, 7); if (!ym) continue;
        (porMes[ym] = porMes[ym] || []).push({ id, monto: g.monto || 0 });
      }
      const del = {}, add = {};
      for (const [ym, lista] of Object.entries(porMes)) {
        const n = MESES[ym];
        const viejo = lista.reduce((s2, x) => s2 + x.monto, 0);
        if (!n) { console.log(`  (dejo ${ym} como está: no sé cuántos meses cubre)`); continue; }
        const nuevoMonto = Math.round(fijo * n);
        console.log(`  ${ym}: ${lista.length} gasto${lista.length > 1 ? 's' : ''} por ${money(Math.round(viejo))} → 1 gasto de ${money(nuevoMonto)} (autónomo + obra social × ${n})`);
        for (const x of lista) del[x.id] = null;
        const gid = 'monofijo_' + ym;
        add[gid] = {
          id: gid, monto: nuevoMonto, cat: 'Monotributo / Impuestos', tipo: 'gasto',
          desc: `Autónomo + obra social (${n} mes${n > 1 ? 'es' : ''})`,
          dayKey: ym + '_01', ts: Date.now(), auto: true,
        };
      }
      if (!Object.keys(add).length) { console.log('No hay nada para ajustar.'); return; }
      if (!DRY) { await db.patch('cyc/compras', del); await db.patch('cyc/compras', add); }
      const totNuevo = Object.values(add).reduce((s2, x) => s2 + x.monto, 0);
      console.log(`\n${DRY ? '(DRY) ' : ''}Borrados ${Object.keys(del).length} gastos, creados ${Object.keys(add).length} por ${money(totNuevo)} en total.`);
      console.log(`El impuesto integrado ahora vive SOLO en el costo de los productos.`);
      return;
    }
    // BILLING_PROBE=meta:<piso> → deja guardado el piso y la meta del robot de precios.
    // Hace falta porque el valor viejo (40/42) quedó de cuando el margen se medía sin impuestos.
    if (String(process.env.BILLING_PROBE || '').startsWith('meta:')) {
      const piso = parseFloat(String(process.env.BILLING_PROBE).split(':')[1]) || 30;
      // Sin colchón: se sube al piso EXACTO. Antes se apuntaba 2 puntos arriba para no quedar
      // rozando, pero eso hacía que el precio real quedara siempre por encima de lo pedido.
      const meta = piso;
      if (!DRY) { await db.set('cyc/mlconfig/minPct', piso); await db.set('cyc/mlconfig/targetPct', meta); }
      console.log(`${DRY ? '(DRY) ' : ''}Robot de precios: actúa por debajo de ${piso}% y lleva a ${meta}%.`);
      return;
    }
    // BILLING_PROBE=envioreal:<palabra> → EL ENVÍO REAL, VENTA POR VENTA, SIN PROMEDIOS NI MÍNIMOS.
    // Hace falta porque el margen que calculo depende de una estimación del envío: tomo el envío
    // MÁS BARATO visto en cada publicación. Con eso, dos publicaciones al MISMO precio y con el
    // MISMO costo daban 53% y 30% de margen — imposible en la realidad. Acá se ve venta por venta
    // cuánto se llevó el envío de verdad, para saber cuál de los dos números miente.
    if (String(process.env.BILLING_PROBE || '').startsWith('envioreal:')) {
      const kw = (String(process.env.BILLING_PROBE).split(':')[1] || '').trim().toLowerCase();
      if (!kw) { console.log('Usá: envioreal:<palabra>'); return; }
      const vp = (await db.get('cyc/ventaprod')) || {};
      const links = (await db.get('cyc/mllinks')) || {};
      const pIdx = {}; for (const p of products) pIdx[p.id] = p;
      // Todas las ventas del producto, con su publicación y su variante.
      const ventas = [];
      for (const [k, ents] of Object.entries(vp)) {
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada) continue;
          const nom = ((v.prod || '') + ' ' + ((links[v.mla] || {}).title || '')).toLowerCase();
          if (!nom.includes(kw)) continue;
          const q = v.qty || 1;
          ventas.push({
            dia: k.slice(0, 10).replace(/_/g, '-'), mla: v.mla || '?',
            variante: v.variante || (links[v.mla] || {}).variant || '',
            precio: (v.total || 0) / q, neto: (v.neto || 0) / q, qty: q, costo: (v.costo || 0) / q,
          });
        }
      }
      if (!ventas.length) { console.log(`No hay ventas de "${kw}".`); return; }
      ventas.sort((a, b) => (a.dia < b.dia ? 1 : -1));
      // Comisión oficial de ML para cada precio, así el envío sale por diferencia y no estimado.
      const feeCache = {};
      let tok = null, site = 'MLA', lt = null, cat = null;
      for (const label of labels) {
        const acc = accounts[label];
        if (!acc?.refresh_token) continue;
        const mla = ventas.find((v) => (links[v.mla] || {}).cuenta === label);
        if (!mla) continue;
        try {
          const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
          await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
          const it = await mlGet('/items/' + mla.mla + '?attributes=id,listing_type_id,category_id,site_id', t.access_token);
          tok = t.access_token; site = it.site_id || 'MLA'; lt = it.listing_type_id; cat = it.category_id;
          break;
        } catch { /* probar otra cuenta */ }
      }
      const feeAt = async (price) => {
        if (!tok) return null;
        const key = Math.round(price);
        if (feeCache[key] !== undefined) return feeCache[key];
        let out = null;
        try {
          const d = await mlGet(`/sites/${site}/listing_prices?price=${key}&listing_type_id=${lt}&category_id=${cat}`, tok);
          const o = Array.isArray(d) ? d[0] : d;
          if (typeof o?.sale_fee_amount === 'number') out = o.sale_fee_amount;
        } catch { out = null; }
        feeCache[key] = out; return out;
      };
      console.log(`=== ENVÍO REAL DE "${kw}" · ${ventas.length} ventas ===`);
      console.log(`envío = precio − neto recibido − comisión oficial de ML a ESE precio\n`);
      console.log(`  fecha        precio      neto   comisión     ENVÍO  variante`);
      const porMla = {};
      for (const v of ventas.slice(0, 60)) {
        const com = await feeAt(v.precio);
        if (com == null) continue;
        const envio = v.precio - v.neto - com;
        (porMla[v.mla] = porMla[v.mla] || { envios: [], variante: v.variante }).envios.push(envio);
        console.log(`  ${v.dia}  ${money(Math.round(v.precio)).padStart(9)} ${money(Math.round(v.neto)).padStart(9)}`
          + ` ${money(Math.round(com)).padStart(9)} ${money(Math.round(envio)).padStart(9)}  ${(v.variante || '').slice(0, 24)}`);
      }
      console.log(`\n── ENVÍO POR PUBLICACIÓN ──`);
      console.log(`  Si el envío es parecido en todas, el margen tiene que ser parecido también.\n`);
      const todos = [];
      for (const [mla, d] of Object.entries(porMla)) {
        const e = d.envios.slice().sort((a, b) => a - b);
        const min = e[0], max = e[e.length - 1], med = e[Math.floor(e.length / 2)];
        const prom = e.reduce((s, x) => s + x, 0) / e.length;
        todos.push(...e);
        console.log(`  ${mla} · ${(d.variante || '').slice(0, 22).padEnd(22)} · ${e.length} ventas`
          + ` · más barato ${money(Math.round(min))} · mediana ${money(Math.round(med))} · más caro ${money(Math.round(max))} · promedio ${money(Math.round(prom))}`);
      }
      if (todos.length) {
        const t2 = todos.slice().sort((a, b) => a - b);
        const medG = t2[Math.floor(t2.length / 2)];
        const promG = t2.reduce((s, x) => s + x, 0) / t2.length;
        console.log(`\n  TODO EL PRODUCTO · ${t2.length} ventas · más barato ${money(Math.round(t2[0]))}`
          + ` · mediana ${money(Math.round(medG))} · más caro ${money(Math.round(t2[t2.length - 1]))} · promedio ${money(Math.round(promG))}`);
        console.log(`\n  El margen se calcula hoy con el envío MÁS BARATO de cada publicación. Si el más barato`);
        console.log(`  y la mediana están lejos, ese margen está inflado y hay que usar la mediana.`);
      }
      return;
    }
    // BILLING_PROBE=volver:<MLA=precio,MLA=precio,...>[:go] → DEJA ESOS PRECIOS EXACTOS.
    // Para deshacer una subida mal aplicada: pone el precio que se le pasa, suba o baje.
    if (String(process.env.BILLING_PROBE || '').startsWith('volver:')) {
      const raw = String(process.env.BILLING_PROBE).slice(7);
      const APLICAR = raw.endsWith(':go');
      const lista = (APLICAR ? raw.slice(0, -3) : raw).split(',').map((x) => {
        const [mla, pr] = x.split('=');
        return { mla: (mla || '').trim(), precio: Math.round(parseFloat(pr) || 0) };
      }).filter((x) => /^MLA/i.test(x.mla) && x.precio > 0);
      if (!lista.length) { console.log('Usá: volver:MLA123=45300,MLA456=14360[:go]'); return; }
      const links = (await db.get('cyc/mllinks')) || {};
      console.log(`=== VOLVER PRECIOS ${APLICAR ? '(APLICANDO)' : '(PRUEBA)'} · ${lista.length} ===\n`);
      const toks = {}, sids = {};
      for (const label of labels) {
        const acc = accounts[label];
        if (!acc?.refresh_token) continue;
        try {
          const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
          await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
          toks[label] = t.access_token; if (acc.seller_id) sids[label] = acc.seller_id;
        } catch { /* sigue */ }
      }
      let ok = 0, err = 0;
      for (const x of lista) {
        const cta = (links[x.mla] || {}).cuenta;
        let tok = toks[cta];
        if (!tok) for (const [lab, tk] of Object.entries(toks)) { // sin cuenta cargada: probar
          try { const it = await mlGet('/items/' + x.mla + '?attributes=id,seller_id', tk); if (String(it.seller_id) === String(sids[lab])) { tok = tk; break; } } catch { /* sigue */ }
        }
        if (!tok) { err++; console.log(`  ✗ ${x.mla}: no encontré la cuenta`); continue; }
        let actual = 0;
        try { const it = await mlGet('/items/' + x.mla + '?attributes=id,price', tok); actual = it.price || 0; } catch { /* sigue */ }
        const nom = ((links[x.mla] || {}).title || x.mla).slice(0, 38);
        if (Math.abs(actual - x.precio) < 1) { console.log(`  = ${x.mla} · ${nom}: ya está en ${money(x.precio)}`); continue; }
        if (!APLICAR) { console.log(`  · ${x.mla} · ${nom}: ${money(Math.round(actual))} → ${money(x.precio)}`); continue; }
        try {
          const r = await fetch(ML_API + '/items/' + x.mla, {
            method: 'PUT', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' },
            body: JSON.stringify({ price: x.precio }),
          });
          if (r.ok) { ok++; console.log(`  ✓ ${x.mla} · ${nom}: ${money(Math.round(actual))} → ${money(x.precio)}`); }
          else { err++; console.log(`  ✗ ${x.mla} · ${nom}: ML-${r.status}`); }
        } catch { err++; console.log(`  ✗ ${x.mla} · ${nom}: red`); }
      }
      console.log(`\n${APLICAR ? `${ok} aplicados, ${err} con error.` : 'PRUEBA: no se escribió nada. Agregá ":go" para aplicar.'}`);
      return;
    }
    // BILLING_PROBE=nocuotas → BORRA los % de cuotas medidos automáticamente.
    // El probe 'cuotas' contaba como costo de financiación cargos que NO son del vendedor: le puso
    // 9,9% a publicaciones que no ofrecen cuotas (Victoria's Secret) y por eso el barrido subió 6
    // precios que no había que subir. Hasta poder distinguir bien quién paga cada cargo, se limpia.
    if (String(process.env.BILLING_PROBE || '') === 'nocuotas') {
      const prev = (await db.get('cyc/mlcuotas')) || {};
      const n = Object.keys(prev).length;
      if (!DRY) await db.set('cyc/mlcuotas', null);
      console.log(`${DRY ? '(DRY) ' : ''}Borrados los % de cuotas de ${n} publicaciones. El barrido vuelve a calcular sin ese dato.`);
      return;
    }
    // BILLING_PROBE=cuotas[:<días>] → MIDE EL COSTO DE OFRECER CUOTAS, POR PUBLICACIÓN.
    //
    // ML cobra "financing_add_on_fee" cuando la publicación ofrece cuotas sin interés, y NO lo
    // informa en la calculadora de precios (ahí devuelve 0). Sí lo informa en el pago de cada venta.
    // En la Samsung fueron $67.199 sobre $349.999 = 19,2%, más que toda la ganancia de esa venta.
    // Sin este número, cualquier precio calculado para un producto con cuotas queda ~19% corto.
    // Guarda en cyc/mlcuotas el % por publicación para que el barrido de precios lo use.
    if (String(process.env.BILLING_PROBE || '').startsWith('cuotas')) {
      const DIAS = parseFloat(String(process.env.BILLING_PROBE).split(':')[1]) || 60;
      const desde = new Date(Date.now() - DIAS * 864e5).toISOString().replace(/\.\d+Z$/, '.000-00:00');
      const links = (await db.get('cyc/mllinks')) || {};
      const acum = {}; // mla → { fin, envio, precio, n }
      for (const label of labels) {
        const acc = accounts[label];
        if (!acc?.refresh_token) continue;
        let t; try { t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token); } catch { continue; }
        await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
        let orders; try { orders = await fetchOrders(acc.seller_id, t.access_token, desde); } catch { continue; }
        for (const o of orders) {
          const its = o.order_items || [];
          const bruto = its.reduce((s, it) => s + (it.unit_price || 0) * (it.quantity || 1), 0);
          if (bruto <= 0) continue;
          let fin = 0, env = 0, leido = false;
          for (const p of (o.payments || [])) {
            if (!p.id) continue;
            try {
              const r = await fetch('https://api.mercadopago.com/v1/payments/' + p.id, { headers: { Authorization: 'Bearer ' + t.access_token } });
              if (!r.ok) continue;
              const b = await r.json();
              leido = true;
              for (const c of (b.charges_details || [])) {
                const n = (c.name || '').toLowerCase();
                const a = c.amounts?.original || 0;
                if (n.includes('financing')) fin += a;
                else if (n.includes('shp_')) env += a;
              }
            } catch { /* sigue */ }
          }
          if (!leido) continue;
          // el cargo es de la orden: se reparte entre los ítems por su peso en el bruto
          for (const it of its) {
            const mla = it.item?.id; if (!mla) continue;
            const sub = (it.unit_price || 0) * (it.quantity || 1);
            const peso = sub / bruto;
            const a = acum[mla] = acum[mla] || { fin: 0, envio: 0, precio: 0, n: 0 };
            a.fin += fin * peso; a.envio += env * peso; a.precio += sub; a.n++;
          }
        }
      }
      const filas = Object.entries(acum).map(([mla, a]) => ({
        mla, n: a.n, precio: a.precio,
        pctFin: a.precio > 0 ? (a.fin / a.precio * 100) : 0,
        envioUnit: a.n > 0 ? (a.envio / a.n) : 0,
        nom: ((links[mla] || {}).title || mla).slice(0, 40),
        cuenta: (links[mla] || {}).cuenta || '?',
      })).filter((f) => f.n > 0);
      const conCuotas = filas.filter((f) => f.pctFin >= 0.5);
      console.log(`=== COSTO DE OFRECER CUOTAS · últimos ${DIAS} días · ${filas.length} publicaciones con ventas ===\n`);
      console.log(`── CON COSTO DE CUOTAS · ${conCuotas.length} ──`);
      console.log(`   Este % se le resta al neto al calcular el precio. Antes no se contaba.\n`);
      conCuotas.sort((a, b) => b.pctFin - a.pctFin).forEach((f) => console.log(
        `   ${f.pctFin.toFixed(1).padStart(5)}% cuotas · envío ${money(Math.round(f.envioUnit)).padStart(8)} · ${f.n} ventas · ${f.cuenta.padEnd(8)} · ${f.nom}`));
      console.log(`\n── SIN COSTO DE CUOTAS · ${filas.length - conCuotas.length} ──`);
      if (!DRY) {
        const upd = {};
        for (const f of filas) upd[f.mla] = { pct: Math.round(f.pctFin * 100) / 100, envio: Math.round(f.envioUnit), n: f.n, ts: Date.now() };
        await db.patch('cyc/mlcuotas', upd);
        console.log(`\n✓ Guardado en cyc/mlcuotas: el barrido de precios ya lo va a descontar.`);
      }
      return;
    }
    // BILLING_PROBE=sindatos → ARREGLA LAS PUBLICACIONES "SIN DATOS SUFICIENTES".
    //
    // Dos agujeros que se tapan acá, los dos porque no le pedía a ML datos que sí tiene:
    //
    // 1) ENVÍO. Lo venía deduciendo de ventas viejas (precio − neto − comisión). Las publicaciones
    //    que nunca vendieron quedaban sin precio calculable y se salteaban del barrido.
    //    ML lo dice directo en /items/{id}/shipping_options/free: cuánto le cuesta al vendedor.
    //
    // 2) CUOTAS. La respuesta de comisión de ML trae "financing_add_on_fee", que es lo que cuesta
    //    la financiación en cuotas. En los productos baratos da 0, por eso no se notaba. En una
    //    Samsung de $349.999 se fueron $127.267 (36,4%) y comisión + envío no explican ni la mitad.
    //    Si sale_fee_amount NO lo incluye, todos los precios calculados para productos caros están
    //    mal: el Pendrive, el Xbox, los Smartwatch.
    if (String(process.env.BILLING_PROBE || '') === 'sindatos') {
      const links = (await db.get('cyc/mllinks')) || {};
      const vp = (await db.get('cyc/ventaprod')) || {};
      const pIdx = {}; for (const p of products) pIdx[p.id] = p;
      // publicaciones activas sin ninguna venta registrada (las "sin datos")
      const conVenta = new Set();
      for (const ents of Object.values(vp)) for (const v of Object.values(ents || {})) if (v && v.mla) conVenta.add(v.mla);
      console.log(`=== PUBLICACIONES SIN VENTAS: ENVÍO Y CUOTAS DIRECTO DE ML ===\n`);
      for (const label of labels) {
        const acc = accounts[label];
        if (!acc?.refresh_token) continue;
        let t; try { t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token); } catch { continue; }
        await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
        const ids = Object.entries(links)
          .filter(([mla, e]) => e && e.cuenta === label && !e.ignored && e.prodId && /^MLA/i.test(mla))
          .map(([mla]) => mla);
        for (let k = 0; k < ids.length; k += 20) {
          let arr;
          try { arr = await mlGet('/items?ids=' + ids.slice(k, k + 20).join(',') + '&attributes=id,status,price,title,listing_type_id,category_id,site_id,shipping', t.access_token); } catch { continue; }
          for (const row of (arr || [])) {
            const b = row.body || {}; const mla = b.id; if (!mla || b.status !== 'active') continue;
            const caro = (b.price || 0) >= 100000;
            const sinVta = !conVenta.has(mla);
            if (!sinVta && !caro) continue; // solo las que no tienen datos y las caras (por las cuotas)
            const nom = ((links[mla] || {}).title || b.title || mla).slice(0, 40);
            console.log(`── ${label} · ${mla} · ${nom}`);
            console.log(`   precio ${money(Math.round(b.price || 0))}${sinVta ? ' · SIN VENTAS' : ''}${caro ? ' · CARO (mirar cuotas)' : ''}`);
            // 1) ENVÍO que paga el vendedor, directo de ML
            try {
              const s = await mlGet('/items/' + mla + '/shipping_options/free', t.access_token);
              const cov = s && s.coverage ? s.coverage : {};
              const ac = cov.all_country || {};
              console.log(`   ENVÍO según ML: costo vendedor ${ac.list_cost != null ? money(Math.round(ac.list_cost)) : '?'}`
                + `${ac.currency_id ? ' ' + ac.currency_id : ''}${s && s.free_shipping_eligible != null ? ' · elegible envío gratis: ' + s.free_shipping_eligible : ''}`);
            } catch (err) {
              console.log(`   ENVÍO: ML no lo devolvió (${String(err.message || '').slice(0, 50)})`
                + `${b.shipping?.free_shipping ? ' · la publicación tiene envío gratis activado' : ''}`);
            }
            // 2) COMISIÓN con el desglose completo, para ver las cuotas
            try {
              const d = await mlGet(`/sites/${b.site_id || 'MLA'}/listing_prices?price=${Math.round(b.price || 0)}&listing_type_id=${b.listing_type_id}&category_id=${b.category_id}`, t.access_token);
              const o = Array.isArray(d) ? d[0] : d;
              const det = o?.sale_fee_details || {};
              const fin = det.financing_add_on_fee || 0;
              const gross = det.gross_amount || 0;
              const total = o?.sale_fee_amount || 0;
              console.log(`   COMISIÓN ML: total ${money(Math.round(total))} · ${det.percentage_fee || 0}% sobre el precio`
                + ` · fijo ${money(Math.round(det.fixed_fee || 0))} · CUOTAS ${money(Math.round(fin))}`);
              // La pregunta clave: ¿el total ya incluye las cuotas o hay que sumarlas aparte?
              if (fin > 0) {
                const suma = gross + fin + (det.fixed_fee || 0);
                console.log(`      bruto ${money(Math.round(gross))} + cuotas ${money(Math.round(fin))} + fijo ${money(Math.round(det.fixed_fee || 0))} = ${money(Math.round(suma))}`);
                console.log(`      ${Math.abs(suma - total) < 2 ? '→ el TOTAL YA INCLUYE las cuotas ✓' : '→ ⚠️ el total NO cuadra: hay que sumar las cuotas aparte'}`);
              }
            } catch { console.log(`   COMISIÓN: ML no la devolvió`); }
            console.log('');
          }
        }
      }
      console.log(`Con el envío que da ML ya no hace falta esperar a que un producto venda para ponerle precio.`);
      return;
    }
    // BILLING_PROBE=recosto:<palabra>[:go] → RECALCULA EL COSTO DE LAS VENTAS YA HECHAS.
    //
    // Como regla, el costo de una venta hecha NO se toca: es lo que costó esa mercadería ese día.
    // La excepción es cuando el costo guardado nunca fue el real. Es el caso de Victoria's Secret:
    // estaba cargado US$14,8, que era un PROMEDIO entre el común (US$13,8) y el Bliss (US$16,1).
    // Ese promedio no existió nunca: cada venta fue de uno o del otro. Corregirlo no es reescribir
    // la historia, es arreglar un dato que estaba mal desde el principio.
    // Se usa el DÓLAR DEL DÍA DE CADA VENTA (v.tcSale), no el de hoy, para no mezclar el error de
    // costo con la variación del tipo de cambio.
    if (String(process.env.BILLING_PROBE || '').startsWith('recosto:')) {
      const _rc = String(process.env.BILLING_PROBE).split(':');
      const kw = (_rc[1] || '').trim().toLowerCase();
      const APLICAR = _rc[2] === 'go';
      if (!kw) { console.log('Usá: recosto:<palabra>[:go] — ej recosto:victoria'); return; }
      const vp = (await db.get('cyc/ventaprod')) || {};
      const tcHoy = parseFloat(((await db.get('cyc/finanzas')) || {}).tipo_cambio) || 1500;
      const objetivo = products.filter((p) => (p.name || '').toLowerCase().includes(kw));
      if (!objetivo.length) { console.log(`No hay productos con "${kw}".`); return; }
      console.log(`=== RECALCULAR COSTO DE VENTAS YA HECHAS · "${kw}" ${APLICAR ? '(APLICANDO)' : '(PRUEBA)'} ===\n`);
      objetivo.forEach((p) => console.log(`  ${p.id} · "${p.name}" · costo hoy US$${p.costUSD} · full US$${p.costFullUSD}`));
      const idx = {}; for (const p of objetivo) idx[p.id] = p;
      const cambios = []; const porProd = {};
      for (const [dk, ents] of Object.entries(vp)) {
        for (const [id, v] of Object.entries(ents || {})) {
          if (!v || !v.prodId || !idx[v.prodId]) continue;
          if (v.cancelada) continue;
          const p = idx[v.prodId];
          const tcV = parseFloat(v.tcSale) || tcHoy;
          const { costo, costBaseUSD, shipUSD } = costoPesos(p, v.qty || 1, tcV);
          const viejo = v.costo || 0;
          if (Math.abs(costo - viejo) < 1) continue;
          cambios.push({ dk, id, prod: p.name, viejo, nuevo: costo, costBaseUSD, shipUSD, tcV, qty: v.qty || 1 });
          const k = p.name;
          porProd[k] = porProd[k] || { n: 0, viejo: 0, nuevo: 0 };
          porProd[k].n++; porProd[k].viejo += viejo; porProd[k].nuevo += costo;
        }
      }
      console.log(`\n── VENTAS CON EL COSTO DESACTUALIZADO · ${cambios.length} ──\n`);
      for (const [nom, d] of Object.entries(porProd)) {
        const dif = d.nuevo - d.viejo;
        console.log(`  ${nom}`);
        console.log(`     ${d.n} ventas · costo guardado ${money(Math.round(d.viejo))} → real ${money(Math.round(d.nuevo))}`
          + ` · ${dif >= 0 ? 'sube' : 'baja'} ${money(Math.abs(Math.round(dif)))}`);
        console.log(`     (la ganancia histórica de este producto ${dif >= 0 ? 'BAJA' : 'SUBE'} ${money(Math.abs(Math.round(dif)))})`);
      }
      const totV = Object.values(porProd).reduce((s, d) => s + d.viejo, 0);
      const totN = Object.values(porProd).reduce((s, d) => s + d.nuevo, 0);
      console.log(`\n  TOTAL · costo guardado ${money(Math.round(totV))} → real ${money(Math.round(totN))}`
        + ` · diferencia ${money(Math.round(totN - totV))}`);
      console.log(`\n  Ojo: esto cambia la ganancia de meses ya cerrados. Es a propósito — el costo`);
      console.log(`  guardado era un promedio que nunca existió. Se usa el dólar del día de cada venta.`);
      if (!APLICAR) { console.log(`\nPRUEBA: no se escribió nada. Para aplicar: recosto:${kw}:go`); return; }
      for (const c of cambios) {
        await db.set(`cyc/ventaprod/${c.dk}/${c.id}/costo`, c.nuevo);
        await db.set(`cyc/ventaprod/${c.dk}/${c.id}/costBaseUSD`, c.costBaseUSD);
        await db.set(`cyc/ventaprod/${c.dk}/${c.id}/shipUSD`, c.shipUSD);
      }
      console.log(`\n✓ ${cambios.length} ventas recalculadas con el costo real.`);
      return;
    }
    // BILLING_PROBE=repbliss[:go] → REPARA LAS PUBLICACIONES BLISS HUÉRFANAS.
    // Qué pasó: splitbliss creó su propio producto Bliss y repuntó 3 publicaciones hacia él. Ese
    // producto después se borró, así que esas 3 publicaciones quedaron apuntando a un producto
    // inexistente: sus ventas nuevas entrarían como "sin producto".
    // Esto las engancha al producto Bliss que existe, traduce el nombre de la variante (las
    // publicaciones dicen "Bare Vanilla Bliss" / "Velve Petals" y el producto "Bare Vanilla" /
    // "Velvet Petals"), mueve las ventas ya hechas SIN tocarles el costo, y saca del producto
    // común las variantes que dicen "bliss".
    if (String(process.env.BILLING_PROBE || '').startsWith('repbliss')) {
      const APLICAR = String(process.env.BILLING_PROBE).split(':')[1] === 'go';
      const links = (await db.get('cyc/mllinks')) || {};
      const vp = (await db.get('cyc/ventaprod')) || {};
      const bliss = products.find((p) => /bliss/i.test(p.name || ''));
      const comun = products.find((p) => /victoria/i.test(p.name || '') && !/bliss/i.test(p.name || ''));
      if (!bliss) { console.log('No encontré ningún producto Bliss.'); return; }
      if (!comun) { console.log('No encontré el producto Victoria\'s Secret común.'); return; }
      const vivos = new Set(products.map((p) => p.id));
      const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/bliss/g, '').replace(/[^a-z]/g, '');
      // distancia de edición chica, para que "velve" enganche con "velvet"
      const dist = (a, b) => {
        const m = a.length, n = b.length; const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
        for (let j = 0; j <= n; j++) d[0][j] = j;
        for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
          d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        return d[m][n];
      };
      const varsBliss = bliss.variantes || [];
      const matchVar = (cand) => {
        const c = norm(cand);
        let best = null, bd = 99;
        for (const v of varsBliss) { const d = dist(c, norm(v)); if (d < bd) { bd = d; best = v; } }
        return bd <= 2 ? best : null;
      };
      // Publicaciones huérfanas (apuntan a un producto que ya no existe) y las que ya son del Bliss
      const huerfanas = Object.entries(links).filter(([mla, e]) => e && e.prodId && !e.ignored && /^MLA/i.test(mla) && !vivos.has(e.prodId));
      console.log(`=== REPARAR BLISS ${APLICAR ? '(APLICANDO)' : '(PRUEBA)'} ===`);
      console.log(`Producto Bliss: ${bliss.id} · "${bliss.name}" · variantes: ${varsBliss.join(' · ')}`);
      console.log(`Producto común: ${comun.id} · "${comun.name}" · ${(comun.variantes || []).length} variantes\n`);
      console.log(`── PUBLICACIONES HUÉRFANAS (apuntan a un producto borrado) · ${huerfanas.length} ──`);
      const plan = [];
      for (const [mla, e] of huerfanas) {
        const destino = matchVar(e.variant || e.title || '');
        plan.push({ mla, cuenta: e.cuenta || '?', varVieja: e.variant || '', varNueva: destino, title: e.title || '' });
        console.log(`   ${mla} · ${e.cuenta || '?'} · variante "${e.variant || '(sin)'}" → ${destino ? `"${destino}"` : '⚠️ NO PUDE MAPEARLA'}`);
      }
      const sinMapear = plan.filter((x) => !x.varNueva);
      // Ventas ya hechas que tienen que pasar al Bliss. Se buscan por DOS caminos, porque uno solo
      // deja ventas afuera: por PUBLICACIÓN (las 3 huérfanas) y por VARIANTE (cualquier venta del
      // producto común cuya variante diga "bliss", aunque haya entrado por otra publicación).
      const mlas = plan.map((x) => x.mla);
      const ventas = [];
      for (const [dk, ents] of Object.entries(vp)) {
        for (const [id, v] of Object.entries(ents || {})) {
          if (!v) continue;
          const porPub = v.mla && mlas.includes(v.mla);
          const porVar = /bliss/i.test(v.variante || '') && (v.prodId === comun.id || !vivos.has(v.prodId));
          if (!porPub && !porVar) continue;
          // A qué variante del Bliss va: si vino por publicación, la del plan; si vino por
          // variante, se traduce el nombre de la variante de la venta.
          const x = porPub ? plan.find((y) => y.mla === v.mla) : null;
          const destino = (x && x.varNueva) || matchVar(v.variante || '');
          ventas.push({ dk, id, mla: v.mla || '', varVieja: v.variante || '', destino, costo: v.costo || 0, via: porPub ? 'publicación' : 'variante' });
        }
      }
      const ventasSinDestino = ventas.filter((v) => !v.destino);
      const varsComunLimpias = (comun.variantes || []).filter((v) => !/bliss/i.test(v));
      const sacadas = (comun.variantes || []).filter((v) => /bliss/i.test(v));
      console.log(`\n── VENTAS YA HECHAS A MOVER · ${ventas.length} ──`);
      console.log(`   Cambian de producto y de variante, conservan su costo original.`);
      const porDestino = {};
      ventas.forEach((v) => { const k = (v.varVieja || '(sin variante)') + ' → ' + (v.destino || '⚠️ SIN DESTINO'); porDestino[k] = (porDestino[k] || 0) + 1; });
      Object.entries(porDestino).sort((a, b) => b[1] - a[1]).forEach(([k, n]) => console.log(`   ${String(n).padStart(4)} ventas · ${k}`));
      if (ventasSinDestino.length) console.log(`   ⚠️ ${ventasSinDestino.length} ventas sin variante equivalente: NO se tocan.`);
      console.log(`\n── VARIANTES A SACAR DEL PRODUCTO COMÚN · ${sacadas.length} ──`);
      console.log(`   ${sacadas.join(' · ') || '(ninguna)'}`);
      if (sinMapear.length) {
        console.log(`\n⚠️ ${sinMapear.length} publicación(es) sin variante equivalente en el producto Bliss.`);
        console.log(`   No se tocan hasta resolverlo: ${sinMapear.map((x) => x.mla + ' "' + x.varVieja + '"').join(', ')}`);
      }
      if (!APLICAR) { console.log(`\nPRUEBA: no se escribió nada. Para aplicar: repbliss:go`); return; }
      let okPub = 0;
      for (const x of plan) {
        if (!x.varNueva) continue; // sin mapeo seguro, no se toca
        await db.set('cyc/mllinks/' + x.mla + '/prodId', bliss.id);
        await db.set('cyc/mllinks/' + x.mla + '/variant', x.varNueva);
        okPub++;
      }
      let okVta = 0;
      for (const v of ventas) {
        if (!v.destino) continue; // sin variante equivalente clara, no se toca
        await db.set(`cyc/ventaprod/${v.dk}/${v.id}/prodId`, bliss.id);
        await db.set(`cyc/ventaprod/${v.dk}/${v.id}/prod`, bliss.name);
        await db.set(`cyc/ventaprod/${v.dk}/${v.id}/variante`, v.destino);
        okVta++;
      }
      if (sacadas.length) await db.set('products/' + comun.id + '/variantes', varsComunLimpias);
      console.log(`\n✓ ${okPub} publicaciones enganchadas a "${bliss.name}" con su variante traducida.`);
      console.log(`✓ ${okVta} ventas ya hechas movidas (costo original intacto).`);
      console.log(`✓ ${sacadas.length} variantes Bliss sacadas del producto común.`);
      return;
    }
    // BILLING_PROBE=visitas[:<días>] → ¿POR QUÉ NO VENDE? ¿PRECIO O NADIE LO VE?
    //
    // Hasta ahora, cuando un producto no vendía no sabíamos el motivo y la única palanca que se nos
    // ocurría era bajar el precio. Eso es adivinar: si el problema era que nadie lo encuentra,
    // bajar el precio regala margen y no cambia nada.
    // Con las visitas de ML se separan dos problemas opuestos:
    //   · LO VEN Y NO COMPRAN  → muchas visitas, poca conversión → precio / competencia / fotos
    //   · NO LO VEN            → pocas visitas → posicionamiento, título, categoría
    // El corte no es un número inventado: se compara contra la MEDIANA de tu propio catálogo.
    if (String(process.env.BILLING_PROBE || '').startsWith('visitas')) {
      const DIAS = parseFloat(String(process.env.BILLING_PROBE).split(':')[1]) || 30;
      const desde = Date.now() - DIAS * 864e5;
      const links = (await db.get('cyc/mllinks')) || {};
      const vp = (await db.get('cyc/ventaprod')) || {};
      const pIdx = {}; for (const p of products) pIdx[p.id] = p;
      const uMla = {};
      for (const [k, ents] of Object.entries(vp)) {
        const ts = Date.parse(k.slice(0, 10).replace(/_/g, '-'));
        if (!isFinite(ts) || ts < desde) continue;
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada || !v.mla) continue;
          uMla[v.mla] = (uMla[v.mla] || 0) + (v.qty || 1);
        }
      }
      const dFrom = new Date(desde).toISOString().replace(/\.\d+Z$/, '.000-00:00');
      const dTo = new Date().toISOString().replace(/\.\d+Z$/, '.000-00:00');
      const filas = [];
      for (const label of labels) {
        const acc = accounts[label];
        if (!acc?.refresh_token) continue;
        let t; try { t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token); } catch { continue; }
        await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
        const ids = Object.entries(links)
          .filter(([mla, e]) => e && e.cuenta === label && !e.ignored && e.prodId && /^MLA/i.test(mla))
          .map(([mla]) => mla);
        // estado + precio de cada publicación
        const info = {};
        for (let k = 0; k < ids.length; k += 20) {
          let arr;
          try { arr = await mlGet('/items?ids=' + ids.slice(k, k + 20).join(',') + '&attributes=id,status,price,variations,available_quantity', t.access_token); } catch { continue; }
          for (const row of (arr || [])) {
            const b = row.body || {}; if (!b.id) continue;
            const vars = Array.isArray(b.variations) ? b.variations : [];
            info[b.id] = {
              estado: b.status,
              precio: vars.length ? (vars[0].price || 0) : (b.price || 0),
              stock: vars.length ? vars.reduce((s, v) => s + (v.available_quantity || 0), 0) : (b.available_quantity || 0),
            };
          }
        }
        const activos = ids.filter((m) => info[m] && info[m].estado === 'active');
        // visitas: se pide de a lotes; si el endpoint por rango falla se cae al total simple
        for (let k = 0; k < activos.length; k += 40) {
          const lote = activos.slice(k, k + 40);
          let vis = null;
          try {
            vis = await mlGet('/visits/items?ids=' + lote.join(',') + '&date_from=' + encodeURIComponent(dFrom) + '&date_to=' + encodeURIComponent(dTo), t.access_token);
          } catch {
            try { vis = await mlGet('/visits/items?ids=' + lote.join(','), t.access_token); } catch { vis = null; }
          }
          if (!vis) continue;
          for (const mla of lote) {
            const raw = vis[mla];
            const v = typeof raw === 'number' ? raw : (raw && typeof raw.total_visits === 'number' ? raw.total_visits : null);
            if (v == null) continue;
            const e = links[mla] || {};
            const p = pIdx[e.prodId];
            filas.push({
              label, mla, visitas: v, vendidas: uMla[mla] || 0,
              precio: info[mla].precio, stock: info[mla].stock,
              nom: (e.variant || e.title || (p && p.name) || mla).slice(0, 38),
            });
          }
        }
      }
      if (!filas.length) { console.log('ML no devolvió visitas. Puede que el permiso no esté habilitado en la app.'); return; }
      if (!DRY) {
        const upd = {}; for (const f of filas) upd[f.mla] = { v: f.visitas, u: f.vendidas, dias: DIAS, ts: Date.now() };
        await db.patch('cyc/visitas', upd);
      }
      filas.forEach((f) => { f.conv = f.visitas > 0 ? (f.vendidas / f.visitas * 100) : null; });
      const conVis = filas.filter((f) => f.visitas > 0);
      const visOrd = conVis.map((f) => f.visitas).sort((a, b) => a - b);
      const medVis = visOrd[Math.floor(visOrd.length / 2)] || 0;
      const convOrd = conVis.filter((f) => f.vendidas > 0).map((f) => f.conv).sort((a, b) => a - b);
      const medConv = convOrd[Math.floor(convOrd.length / 2)] || 0;
      console.log(`=== VISITAS Y CONVERSIÓN · últimos ${DIAS} días · ${filas.length} publicaciones activas ===`);
      console.log(`Mediana de visitas: ${medVis} · Mediana de conversión (de las que venden): ${medConv.toFixed(2)}%\n`);
      const linea = (f) => `  ${String(f.visitas).padStart(5)} visitas · ${String(f.vendidas).padStart(3)} vendidas`
        + ` · ${f.conv != null ? (f.conv.toFixed(2) + '%').padStart(7) : '      —'} conv`
        + ` · ${money(Math.round(f.precio)).padStart(10)} · ${String(f.stock).padStart(3)} u · ${f.label.padEnd(8)} · ${f.nom}`;
      // LO VEN Y NO COMPRAN: visitas por encima de la mediana y cero (o casi cero) ventas.
      const miran = conVis.filter((f) => f.visitas >= medVis && f.stock > 0 && (f.vendidas === 0 || (f.conv != null && f.conv < medConv / 2)));
      console.log(`── 👀 LO VEN Y NO COMPRAN · ${miran.length} ──`);
      console.log(`   Tienen visitas y stock, pero no convierten. Acá SÍ el precio (o la competencia) es sospechoso.\n`);
      miran.sort((a, b) => b.visitas - a.visitas).slice(0, 25).forEach((f) => console.log(linea(f)));
      // NO LO VEN: pocas visitas. Bajar el precio no sirve, el problema es que no aparece.
      const invisibles = filas.filter((f) => f.visitas < medVis / 3 && f.stock > 0);
      console.log(`\n── 🕳️ NO LO VEN · ${invisibles.length} ──`);
      console.log(`   Muy pocas visitas. Bajar el precio no cambia nada: el problema es título, fotos o categoría.\n`);
      invisibles.sort((a, b) => a.visitas - b.visitas).slice(0, 25).forEach((f) => console.log(linea(f)));
      // LAS QUE FUNCIONAN: sirven de referencia de cuánta visita hace falta para vender.
      const buenas = conVis.filter((f) => f.vendidas > 0 && f.conv >= medConv);
      console.log(`\n── ✅ CONVIERTEN BIEN (referencia) · ${buenas.length} ──\n`);
      buenas.sort((a, b) => b.conv - a.conv).slice(0, 15).forEach((f) => console.log(linea(f)));
      const sinVis = filas.filter((f) => f.visitas === 0);
      if (sinVis.length) console.log(`\n(${sinVis.length} publicaciones con 0 visitas en el período)`);
      console.log(`\nGuardado en cyc/visitas para que lo pueda usar la web.`);
      return;
    }
    // BILLING_PROBE=fixbliss[:<idAConservar>[:go]] → DEJA UN SOLO PRODUCTO BLISS Y ENGANCHA TODO.
    // Quedaron dos productos "Victoria Secret BLISS": uno creado a mano y otro que creó splitbliss.
    // Esto lista los dos con sus publicaciones, y con un id + ':go' deja ese, borra el otro, y
    // engancha al que queda TANTO las publicaciones COMO las ventas ya hechas de esas publicaciones.
    // A las ventas viejas se les cambia el producto pero NUNCA el costo: cada venta conserva lo que
    // costó ese día, así el historial y las ganancias de meses cerrados no se mueven.
    if (String(process.env.BILLING_PROBE || '').startsWith('fixbliss')) {
      const _fb = String(process.env.BILLING_PROBE).split(':');
      const KEEP = (_fb[1] || '').trim();
      const APLICAR = _fb[2] === 'go';
      const links = (await db.get('cyc/mllinks')) || {};
      const vp = (await db.get('cyc/ventaprod')) || {};
      const blissProds = products.filter((p) => /bliss/i.test(p.name || ''));
      console.log(`=== PRODUCTOS "BLISS" EN EL CATÁLOGO · ${blissProds.length} ===\n`);
      for (const p of blissProds) {
        const pubs = Object.entries(links).filter(([, e]) => e && e.prodId === p.id);
        let ventas = 0;
        for (const ents of Object.values(vp)) for (const v of Object.values(ents || {})) if (v && v.prodId === p.id) ventas++;
        console.log(`  ${p.id} · "${p.name}" · costo US$${p.costUSD} · ${(p.variantes || []).length} variantes`);
        console.log(`     variantes: ${(p.variantes || []).join(' · ') || '(ninguna)'}`);
        console.log(`     ${pubs.length} publicaciones vinculadas · ${ventas} ventas ya cargadas`);
        pubs.forEach(([mla, e]) => console.log(`       ${mla} · ${e.cuenta || '?'} · ${e.variant || e.title || ''}`));
        console.log('');
      }
      if (!KEEP) { console.log('Elegí cuál conservar: fixbliss:<idDelQueQueda>:go'); return; }
      const keep = products.find((p) => p.id === KEEP);
      if (!keep) { console.log(`No existe el producto ${KEEP}.`); return; }
      const sobran = blissProds.filter((p) => p.id !== KEEP);
      // Publicaciones que hoy apuntan a CUALQUIER producto bliss → van al que queda
      const mlasBliss = Object.entries(links)
        .filter(([, e]) => e && blissProds.some((p) => p.id === e.prodId))
        .map(([mla]) => mla);
      // Ventas ya cargadas de esas publicaciones (por MLA, que es lo único que identifica bien:
      // el nombre de variante no alcanza, "Velve Petals" existe en la línea común y en la Bliss)
      const ventasAMover = [];
      for (const [dk, ents] of Object.entries(vp)) {
        for (const [id, v] of Object.entries(ents || {})) {
          if (!v || !v.mla) continue;
          if (!mlasBliss.includes(v.mla)) continue;
          if (v.prodId === KEEP && v.prod === keep.name) continue; // ya está bien
          ventasAMover.push({ dk, id, mla: v.mla, prodViejo: v.prod || '', costo: v.costo || 0 });
        }
      }
      console.log(`── PLAN ──`);
      console.log(`  Queda:  ${keep.id} · "${keep.name}" · US$${keep.costUSD}`);
      sobran.forEach((p) => console.log(`  Se borra: ${p.id} · "${p.name}"`));
      console.log(`  Publicaciones a enganchar: ${mlasBliss.length} → ${mlasBliss.join(', ')}`);
      console.log(`  Ventas ya hechas a re-etiquetar: ${ventasAMover.length} (se les cambia el producto, NO el costo)`);
      if (!APLICAR) { console.log(`\nPRUEBA: no se escribió nada. Para aplicar: fixbliss:${KEEP}:go`); return; }
      for (const mla of mlasBliss) await db.set('cyc/mllinks/' + mla + '/prodId', KEEP);
      for (const v of ventasAMover) {
        await db.set(`cyc/ventaprod/${v.dk}/${v.id}/prodId`, KEEP);
        await db.set(`cyc/ventaprod/${v.dk}/${v.id}/prod`, keep.name);
      }
      for (const p of sobran) await db.set('products/' + p.id, null);
      console.log(`\n✓ ${mlasBliss.length} publicaciones enganchadas a "${keep.name}".`);
      console.log(`✓ ${ventasAMover.length} ventas ya hechas re-etiquetadas (con su costo original intacto).`);
      console.log(`✓ ${sobran.length} producto(s) duplicado(s) borrado(s).`);
      return;
    }
    // BILLING_PROBE=splitbliss[:go] → SEPARA LOS "BLISS" EN SU PROPIO PRODUCTO.
    // Los Bliss cuestan USD 16 y los comunes USD 13,8, pero en CYC estaban todos en un solo
    // producto con un costo promedio de USD 15. Resultado: los comunes figuraban peor de lo que
    // son (30% cuando dan 40%) y los Bliss mejor (23% reales figuraban como 30%). Mientras
    // compartan producto, TODOS los márgenes de la línea están mal.
    // Crea el producto "Victoria Secret BLISS" con costo USD 16 y sus variantes, y repunta hacia
    // él las publicaciones cuyo título diga "bliss". Sin ':go' solo muestra lo que haría.
    if (String(process.env.BILLING_PROBE || '').startsWith('splitbliss')) {
      const APLICAR = String(process.env.BILLING_PROBE).split(':')[1] === 'go';
      const COSTO_BLISS = 16;   // USD, lo que te sale el Bliss
      const COSTO_COMUN = 13.8; // USD, lo que sale el común
      const links = (await db.get('cyc/mllinks')) || {};
      // El producto actual que agrupa todos los Victoria's Secret
      const base = products.find((p) => /victoria/i.test(p.name || ''));
      if (!base) { console.log('No encontré el producto "Victoria\'s Secret" en el catálogo.'); return; }
      console.log(`=== SEPARAR BLISS ${APLICAR ? '(APLICANDO)' : '(PRUEBA: no se escribe nada)'} ===`);
      console.log(`Producto actual: "${base.name}" (${base.id}) · costo hoy US$${base.costUSD}\n`);
      // Publicaciones de ese producto, separadas por si son Bliss o no
      const suyas = Object.entries(links)
        .filter(([mla, e]) => e && e.prodId === base.id && /^MLA/i.test(mla));
      const esBliss = (e, mla) => /bliss/i.test((e.title || '') + ' ' + (e.variant || ''));
      const bliss = suyas.filter(([mla, e]) => esBliss(e, mla));
      const comunes = suyas.filter(([mla, e]) => !esBliss(e, mla));
      console.log(`── BLISS (pasan al producto nuevo, costo US$${COSTO_BLISS}) · ${bliss.length} ──`);
      bliss.forEach(([mla, e]) => console.log(`   ${mla} · ${e.cuenta || '?'} · ${(e.variant || e.title || '').slice(0, 44)}`));
      console.log(`\n── COMUNES (se quedan, costo baja a US$${COSTO_COMUN}) · ${comunes.length} ──`);
      comunes.forEach(([mla, e]) => console.log(`   ${mla} · ${e.cuenta || '?'} · ${(e.variant || e.title || '').slice(0, 44)}`));
      if (!bliss.length) { console.log('\nNo hay publicaciones Bliss para separar.'); return; }
      // Variantes del producto nuevo: los nombres de variante de las publicaciones Bliss
      const varsBliss = [...new Set(bliss.map(([, e]) => (e.variant || '').trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
      const varsComunes = [...new Set(comunes.map(([, e]) => (e.variant || '').trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
      const nuevoId = 'p' + Date.now();
      const ship = parseFloat(base.shipUSD) || 0, dev = parseFloat(base.devPct) || 0;
      const nuevo = {
        id: nuevoId, name: 'Victoria Secret BLISS',
        costUSD: COSTO_BLISS, cost: Math.round(COSTO_BLISS * ((await db.get('cyc/finanzas/tipo_cambio')) || 1500)),
        costFullUSD: Math.round((COSTO_BLISS * (1 + dev / 100) + ship) * 100) / 100,
        variantes: varsBliss,
      };
      if (ship) nuevo.shipUSD = ship;
      if (dev) nuevo.devPct = dev;
      if (base.proveedorId) nuevo.proveedorId = base.proveedorId;
      if (base.origen) nuevo.origen = base.origen;
      console.log(`\n── PRODUCTO NUEVO ──`);
      console.log(`   "${nuevo.name}" · costo US$${nuevo.costUSD} · costo full US$${nuevo.costFullUSD}`);
      console.log(`   variantes (${varsBliss.length}): ${varsBliss.join(' · ') || '(ninguna)'}`);
      console.log(`\n── PRODUCTO QUE QUEDA ──`);
      console.log(`   "${base.name}" · costo pasa de US$${base.costUSD} a US$${COSTO_COMUN}`);
      console.log(`   variantes (${varsComunes.length}): ${varsComunes.join(' · ') || '(ninguna)'}`);
      console.log(`\nLas VENTAS VIEJAS no se tocan: cada venta ya tiene su costo guardado. Esto cambia`);
      console.log(`el costo de acá en adelante y arregla los márgenes que se muestran hoy.`);
      if (!APLICAR) { console.log(`\nPRUEBA: no se escribió nada. Para aplicar: splitbliss:go`); return; }
      await db.set('products/' + nuevoId, nuevo);
      const patchLinks = {};
      for (const [mla, e] of bliss) patchLinks[mla + '/prodId'] = nuevoId;
      for (const [k, v] of Object.entries(patchLinks)) await db.set('cyc/mllinks/' + k, v);
      await db.set('products/' + base.id + '/costUSD', COSTO_COMUN);
      await db.set('products/' + base.id + '/costFullUSD', Math.round((COSTO_COMUN * (1 + dev / 100) + ship) * 100) / 100);
      await db.set('products/' + base.id + '/variantes', varsComunes);
      console.log(`\n✓ Creado "${nuevo.name}" (${nuevoId}) con ${varsBliss.length} variantes.`);
      console.log(`✓ ${bliss.length} publicaciones repuntadas al producto nuevo.`);
      console.log(`✓ "${base.name}" quedó en US$${COSTO_COMUN} con ${varsComunes.length} variantes.`);
      await sendTelegram(`🧴 <b>Victoria's Secret separado</b>\nSe creó "Victoria Secret BLISS" (US$${COSTO_BLISS}) `
        + `con ${bliss.length} publicaciones. Los comunes quedaron en US$${COSTO_COMUN}.`);
      return;
    }
    // BILLING_PROBE=chkrot[:<palabra>] → ¿EL "X DÍAS CUBIERTOS" DE LA WEB ES REAL?
    // La web calcula  diasCubiertos = stock / vendidos30d × 30  usando el stock guardado en
    // cyc/inventory. Este probe compara ese stock guardado contra el stock EN VIVO de ML, cuenta
    // por cuenta, y recalcula los días cubiertos con los dos números. Si no coinciden, la web está
    // decidiendo reposición con un stock viejo.
    // Además marca dos cosas que el número global esconde: stock repartido entre cuentas (una
    // cuenta puede estar en CERO aunque el total dé bien) y productos con poco historial de ventas.
    if (String(process.env.BILLING_PROBE || '').startsWith('chkrot')) {
      const kw = (String(process.env.BILLING_PROBE).split(':')[1] || '').trim().toLowerCase();
      const vp = (await db.get('cyc/ventaprod')) || {};
      const links = (await db.get('cyc/mllinks')) || {};
      const invWeb = (await db.get('cyc/inventory')) || {};
      const pIdx = {}; for (const p of products) pIdx[p.id] = p;
      const desde = Date.now() - 30 * 864e5;
      // ventas de los últimos 30 días por producto, y primera venta (para medir el historial)
      const u30 = {}, primera = {};
      for (const [k, ents] of Object.entries(vp)) {
        const ts = Date.parse(k.slice(0, 10).replace(/_/g, '-'));
        if (!isFinite(ts)) continue;
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada || !v.prodId) continue;
          if (ts >= desde) u30[v.prodId] = (u30[v.prodId] || 0) + (v.qty || 1);
          if (!primera[v.prodId] || ts < primera[v.prodId]) primera[v.prodId] = ts;
        }
      }
      // stock EN VIVO de ML, por producto y por cuenta
      const vivoProd = {}, vivoCta = {};
      for (const label of labels) {
        const acc = accounts[label];
        if (!acc?.refresh_token) continue;
        let t; try { t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token); } catch { continue; }
        await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
        const ids = Object.entries(links)
          .filter(([mla, e]) => e && e.cuenta === label && !e.ignored && e.prodId && /^MLA/i.test(mla))
          .map(([mla]) => mla);
        for (let k = 0; k < ids.length; k += 20) {
          let arr;
          try { arr = await mlGet('/items?ids=' + ids.slice(k, k + 20).join(',') + '&attributes=id,status,available_quantity,variations', t.access_token); } catch { continue; }
          for (const row of (arr || [])) {
            const b = row.body || {}; const mla = b.id; if (!mla || !links[mla]) continue;
            if (b.status !== 'active') continue;
            const pid = links[mla].prodId; if (!pid) continue;
            const vars = Array.isArray(b.variations) ? b.variations : [];
            const st = vars.length ? vars.reduce((s, v) => s + (v.available_quantity || 0), 0) : (b.available_quantity || 0);
            vivoProd[pid] = (vivoProd[pid] || 0) + st;
            vivoCta[pid + '__' + label] = (vivoCta[pid + '__' + label] || 0) + st;
          }
        }
      }
      // stock que tiene guardado la web (lo que usa para el cálculo)
      const webProd = {};
      for (const [k, v] of Object.entries(invWeb)) {
        if (k.includes('__v__')) continue; // las variantes ya están sumadas en el total del producto
        const pid = k.split('__')[0];
        webProd[pid] = (webProd[pid] || 0) + (Number(v) || 0);
      }
      const filas = [];
      for (const p of products) {
        if (kw && !(p.name || '').toLowerCase().includes(kw)) continue;
        const vend = u30[p.id] || 0;
        const vivo = vivoProd[p.id] != null ? vivoProd[p.id] : null;
        const web = webProd[p.id] || 0;
        if (vend === 0 && !vivo && !web) continue;
        const diasHist = primera[p.id] ? Math.round((Date.now() - primera[p.id]) / 864e5) : null;
        const dCubWeb = vend > 0 ? Math.round(web / vend * 30) : null;
        const dCubVivo = (vend > 0 && vivo != null) ? Math.round(vivo / vend * 30) : null;
        const ctas = labels.map((l) => ({ l, st: vivoCta[p.id + '__' + l] })).filter((x) => x.st != null);
        filas.push({ nom: p.name || p.id, vend, vivo, web, dCubWeb, dCubVivo, diasHist, ctas });
      }
      const dif = filas.filter((f) => f.vivo != null && f.vivo !== f.web);
      console.log(`=== ¿EL STOCK DE LA WEB COINCIDE CON ML? · ${filas.length} productos ===`);
      console.log(`La web calcula los días cubiertos con el stock guardado. Acá se compara contra ML en vivo.\n`);
      console.log(`── ❌ NO COINCIDEN · ${dif.length} ──`);
      dif.sort((a, b) => Math.abs(b.vivo - b.web) - Math.abs(a.vivo - a.web)).slice(0, 30).forEach((f) => console.log(
        `  web ${String(f.web).padStart(4)} u vs ML ${String(f.vivo).padStart(4)} u`
        + ` · días cubiertos: web dice ${f.dCubWeb != null ? f.dCubWeb + 'd' : '—'}, real ${f.dCubVivo != null ? f.dCubVivo + 'd' : '—'}`
        + ` · ${f.vend} vendidos 30d · ${f.nom.slice(0, 34)}`));
      if (dif.length > 30) console.log(`  … y ${dif.length - 30} más`);
      const ok = filas.filter((f) => f.vivo != null && f.vivo === f.web);
      console.log(`\n── ✅ COINCIDEN · ${ok.length} ──`);
      // Stock repartido: el total alcanza pero alguna cuenta está en cero y ahí no se vende nada.
      const repartido = filas.filter((f) => f.vend > 0 && f.ctas.length > 1 && f.ctas.some((c) => c.st === 0) && f.ctas.some((c) => c.st > 0));
      console.log(`\n── ⚠️ STOCK REPARTIDO: el total engaña · ${repartido.length} ──`);
      console.log(`   El total da bien pero hay cuentas en CERO: ahí la publicación no vende aunque "haya stock".\n`);
      repartido.slice(0, 20).forEach((f) => console.log(
        `  ${String(f.vivo).padStart(4)} u en total · ${f.ctas.map((c) => `${c.l}:${c.st}`).join(' · ')} · ${f.nom.slice(0, 34)}`));
      // Historial corto: la web multiplica para estimar 30 días y puede exagerar la demanda.
      const corto = filas.filter((f) => f.vend > 0 && f.diasHist != null && f.diasHist < 30);
      console.log(`\n── ⚠️ POCO HISTORIAL (la web extrapola y puede exagerar) · ${corto.length} ──`);
      corto.sort((a, b) => a.diasHist - b.diasHist).slice(0, 20).forEach((f) => console.log(
        `  ${f.diasHist} días de historial · ${f.vend} vendidos · ${f.vivo != null ? f.vivo : '?'} u stock · ${f.nom.slice(0, 34)}`));
      console.log(`\nSOLO LECTURA.`);
      return;
    }
    // BILLING_PROBE=variantes:<palabra>[:<días>] → UN PRODUCTO, VARIANTE POR VARIANTE.
    // Caso Victoria's Secret / Paulvic: un mismo producto publicado muchas veces, una por aroma.
    // Mismo costo, distinto precio, y cada uno rota distinto. Mirar el promedio del producto no
    // sirve: esconde que unos vuelan y otros están muertos. Acá se ve cada uno por separado, con
    // su precio, su stock, lo que vendió y su margen, para decidir de a uno.
    if (String(process.env.BILLING_PROBE || '').startsWith('variantes:')) {
      const _v = String(process.env.BILLING_PROBE).split(':');
      const kw = (_v[1] || '').trim().toLowerCase();
      const DIAS = parseFloat(_v[2]) || 30;
      if (!kw) { console.log('Usá: variantes:<palabra>[:días] — ej variantes:victoria'); return; }
      const cfgV = (await db.get('cyc/mlconfig')) || {};
      const PISO = (parseFloat(cfgV.minPct) || 30);
      const META = (parseFloat(cfgV.targetPct) || 32) / 100;
      const desde = Date.now() - DIAS * 864e5;
      const vp = (await db.get('cyc/ventaprod')) || {};
      const links = (await db.get('cyc/mllinks')) || {};
      const fin = (await db.get('cyc/finanzas')) || {};
      const tc = parseFloat(fin.tipo_cambio) || 1500;
      const monoP = parseFloat(((await db.get('cyc/monotributo')) || {}).pct) || 0;
      const pIdx = {}; for (const p of products) pIdx[p.id] = p;
      const uMla = {}, ultMla = {}, vtaMla = {}, vtaProd = {};
      for (const [k, ents] of Object.entries(vp)) {
        const ts = Date.parse(k.slice(0, 10).replace(/_/g, '-'));
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada) continue;
          const q = v.qty || 1;
          if (isFinite(ts)) {
            if (ts >= desde && v.mla) uMla[v.mla] = (uMla[v.mla] || 0) + q;
            if (v.mla && (!ultMla[v.mla] || ts > ultMla[v.mla])) ultMla[v.mla] = ts;
          }
          const tot = (v.total || 0) / q, net = (v.neto || 0) / q;
          if (tot <= 0 || net <= 0) continue;
          if (v.mla) (vtaMla[v.mla] = vtaMla[v.mla] || []).push({ tot, net });
          if (v.prodId) (vtaProd[v.prodId] = vtaProd[v.prodId] || []).push({ tot, net });
        }
      }
      const feeCache = {};
      const feeAt = async (site, price, ltype, cat, token) => {
        const key = site + '|' + ltype + '|' + cat + '|' + Math.round(price);
        if (feeCache[key] !== undefined) return feeCache[key];
        let out = null;
        try {
          const d = await mlGet(`/sites/${site}/listing_prices?price=${Math.round(price)}&listing_type_id=${ltype}&category_id=${cat}`, token);
          const o = Array.isArray(d) ? d[0] : d;
          if (typeof o?.sale_fee_amount === 'number') out = o.sale_fee_amount;
        } catch { out = null; }
        feeCache[key] = out; return out;
      };
      const filas = [];
      for (const label of labels) {
        const acc = accounts[label];
        if (!acc?.refresh_token) continue;
        const ids = Object.entries(links)
          .filter(([mla, e]) => e && e.cuenta === label && !e.ignored && e.prodId && /^MLA/i.test(mla)
            && (((e.title || '') + ' ' + ((pIdx[e.prodId] || {}).name || '')).toLowerCase().includes(kw)))
          .map(([mla]) => mla);
        if (!ids.length) continue;
        let t; try { t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token); } catch { continue; }
        await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
        const m = (mlExtraPct(label) + monoP) / 100;
        for (let k = 0; k < ids.length; k += 20) {
          let arr;
          try { arr = await mlGet('/items?ids=' + ids.slice(k, k + 20).join(',') + '&attributes=id,status,price,available_quantity,variations,title,listing_type_id,category_id,site_id', t.access_token); } catch { continue; }
          for (const row of (arr || [])) {
            const b = row.body || {}; const mla = b.id; if (!mla || !links[mla]) continue;
            const p = pIdx[links[mla].prodId]; if (!p) continue;
            const vars = Array.isArray(b.variations) ? b.variations : [];
            const precio = vars.length ? (vars[0].price || 0) : (b.price || 0);
            const stock = vars.length ? vars.reduce((s, v) => s + (v.available_quantity || 0), 0) : (b.available_quantity || 0);
            const vendidas = uMla[mla] || 0;
            const ult = ultMla[mla] || 0;
            const f = {
              label, mla, estado: b.status,
              nom: (links[mla].variant || links[mla].title || b.title || mla).slice(0, 40),
              precio, stock, vendidas,
              prodId: p.id, prodNom: p.name || '',
              diasSin: ult ? Math.round((Date.now() - ult) / 864e5) : null,
            };
            const costo = costoPesos(p, 1, tc).costo;
            if (b.status === 'active' && costo && precio) {
              const com = await feeAt(b.site_id || 'MLA', precio, b.listing_type_id, b.category_id, t.access_token);
              if (com != null) {
                const ventas = (vtaMla[mla] && vtaMla[mla].length) ? vtaMla[mla] : (vtaProd[p.id] || []);
                let envio = Infinity;
                for (const pv of [...new Set(ventas.map((v) => Math.round(v.tot)))].slice(-6)) {
                  const cv = await feeAt(b.site_id || 'MLA', pv, b.listing_type_id, b.category_id, t.access_token);
                  if (cv == null) continue;
                  for (const v of ventas) if (Math.round(v.tot) === pv) { const x = v.tot - v.net - cv; if (x < envio) envio = x; }
                }
                if (!isFinite(envio)) envio = 0;
                if (envio < 0) envio = 0;
                f.neto = precio - com - envio;
                f.costo = costo; f.mlx = precio * m;
                f.mg = (f.neto - costo - f.mlx) / (costo + f.mlx) * 100;
                // precio que dejaría el margen justo en la meta (sirve para subir o para bajar)
                const den = 1 - m * (1 + META);
                if (den > 0) {
                  let P = precio, comP = com;
                  for (let it = 0; it < 3; it++) {
                    const Pn = (costo * (1 + META) + comP + envio) / den;
                    const c2 = await feeAt(b.site_id || 'MLA', Pn, b.listing_type_id, b.category_id, t.access_token);
                    if (c2 == null) break;
                    if (Math.abs(Pn - P) < 1 && it > 0) { P = Pn; comP = c2; break; }
                    P = Pn; comP = c2;
                  }
                  f.aMeta = Math.ceil(P / 10) * 10;
                }
              }
            }
            filas.push(f);
          }
        }
      }
      if (!filas.length) { console.log(`No encontré publicaciones con "${kw}".`); return; }
      const act = filas.filter((f) => f.estado === 'active');
      const totalU = act.reduce((s, f) => s + f.vendidas, 0);
      const conVenta = act.filter((f) => f.vendidas > 0);
      const sinVenta = act.filter((f) => f.vendidas === 0);
      console.log(`=== "${kw}" VARIANTE POR VARIANTE · últimos ${DIAS} días ===`);
      console.log(`${act.length} publicaciones activas · ${totalU} unidades vendidas · ${conVenta.length} rotan, ${sinVenta.length} no\n`);
      // Se muestran el COSTO y el PRODUCTO de cada publicación: si dos variantes al mismo precio
      // dan margen distinto, la causa está acá. Pasó con Victoria's Secret (53% vs 31% con el mismo
      // precio, la misma comisión y el mismo envío) y sin este dato no había forma de verlo.
      const linea = (f) => `  ${String(f.vendidas).padStart(3)} u · ${money(Math.round(f.precio)).padStart(10)}`
        + ` · ${f.mg != null ? (String(Math.round(f.mg)) + '%').padStart(5) : '    —'}`
        + ` · costo ${f.costo != null ? money(Math.round(f.costo)).padStart(9) : '        —'}`
        + ` · neto ${f.neto != null ? money(Math.round(f.neto)).padStart(9) : '        —'}`
        + ` · ${String(f.stock).padStart(3)} u stock`
        + ` · ${f.diasSin != null ? (f.diasSin + 'd').padStart(5) : ' nunca'} `
        + ` · ${f.label.padEnd(8)} · ${f.nom}`
        + `\n        producto "${(f.prodNom || '').slice(0, 34)}" (${f.prodId || '?'})`;
      console.log(`── ROTAN (vendieron en ${DIAS} días) · ordenadas por unidades ──`);
      console.log(`   u · precio · margen · stock · última venta · cuenta · variante\n`);
      conVenta.sort((a, b) => b.vendidas - a.vendidas).forEach((f) => {
        console.log(linea(f) + (f.mg != null && f.mg < PISO && f.aMeta ? `\n        ⬆ margen bajo: subir a ${money(f.aMeta)} para llegar al ${(META * 100).toFixed(0)}%` : ''));
      });
      console.log(`\n── NO ROTAN (0 ventas en ${DIAS} días) ──\n`);
      sinVenta.sort((a, b) => (b.mg || 0) - (a.mg || 0)).forEach((f) => {
        let sug = '';
        if (f.mg != null && f.aMeta) {
          if (f.mg > PISO + 10) sug = `\n        ⬇ tiene ${Math.round(f.mg)}% de margen: podría bajar hasta ${money(f.aMeta)} y seguir en el ${(META * 100).toFixed(0)}%`;
          else if (f.mg < PISO) sug = `\n        ⚠ ni siquiera llega al piso: no vende Y deja poco. Liquidar y no reponer.`;
          else sug = `\n        = ya está en el piso: bajar no es la palanca. Esperar o liquidar y no reponer.`;
        }
        console.log(linea(f) + sug);
      });
      const cerradas = filas.filter((f) => f.estado !== 'active');
      if (cerradas.length) console.log(`\n(${cerradas.length} publicaciones pausadas o cerradas, no se listan)`);
      // Referencia útil: a qué precio venden las que SÍ rotan. Es el dato que dice si una variante
      // muerta está cara respecto de sus hermanas, que es más fiable que compararla contra la meta.
      if (conVenta.length) {
        const precios = conVenta.map((f) => f.precio).sort((a, b) => a - b);
        const med = precios[Math.floor(precios.length / 2)];
        console.log(`\nLas que rotan van de ${money(Math.round(precios[0]))} a ${money(Math.round(precios[precios.length - 1]))} (mediana ${money(Math.round(med))}).`);
        const caras = sinVenta.filter((f) => f.precio > med * 1.1);
        if (caras.length) {
          console.log(`\nDe las que NO rotan, ${caras.length} están más de 10% por encima de esa mediana:`);
          caras.sort((a, b) => b.precio - a.precio).forEach((f) => console.log(
            `   ${money(Math.round(f.precio)).padStart(10)} (+${((f.precio / med - 1) * 100).toFixed(0)}% vs mediana) · ${f.nom}`));
        } else {
          console.log(`Ninguna de las que no rotan está cara respecto de sus hermanas: el precio no parece ser el motivo.`);
        }
      }
      console.log(`\nSOLO LECTURA: no se tocó ningún precio.`);
      return;
    }
    // BILLING_PROBE=rotacion[:<días>][:<margenMin>] → QUÉ PRODUCTOS NO ROTAN, MIRANDO EL STOCK.
    //
    // Por qué existe, y por qué el probe 'dormidos' anterior estaba mal: contaba los días sin vender
    // a secas. Un producto SIN STOCK no puede venderse — la Lupa llevaba 57 días "sin rotar" y el
    // motivo era que no había mercadería. Bajarle el precio no habría cambiado nada.
    //
    // Acá se separa lo que se puede juzgar de lo que no:
    //   · sin stock            → no se juzga, no había nada para vender
    //   · stock recién llegado → todavía no tuvo tiempo, se avisa y se espera
    //   · con stock hace rato y no vende, con margen alto → ESE es el candidato a bajar
    //   · vendió en la ventana → no se toca, tu regla
    // La fecha de llegada sale de las operaciones de Full de ML (inbound_reception).
    if (String(process.env.BILLING_PROBE || '').startsWith('rotacion')) {
      const _r = String(process.env.BILLING_PROBE).split(':');
      const DIAS = parseFloat(_r[1]) || 30;
      const MG_ALTO = parseFloat(_r[2]) || 45;
      const RECIEN = 14; // stock que llegó hace menos de esto = todavía no se puede juzgar
      const cfgR = (await db.get('cyc/mlconfig')) || {};
      const META = (parseFloat(cfgR.targetPct) || 32) / 100;
      const desde = Date.now() - DIAS * 864e5;
      const vp = (await db.get('cyc/ventaprod')) || {};
      const links = (await db.get('cyc/mllinks')) || {};
      const fin = (await db.get('cyc/finanzas')) || {};
      const hist = (await db.get('cyc/stockhist')) || {};
      const tc = parseFloat(fin.tipo_cambio) || 1500;
      const monoP = parseFloat(((await db.get('cyc/monotributo')) || {}).pct) || 0;
      const pIdx = {}; for (const p of products) pIdx[p.id] = p;
      const uMla = {}, ultMla = {}, ultProd = {}, vtaMla = {}, vtaProd = {}, uProd = {};
      for (const [k, ents] of Object.entries(vp)) {
        const ts = Date.parse(k.slice(0, 10).replace(/_/g, '-'));
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada) continue;
          const q = v.qty || 1;
          if (isFinite(ts)) {
            if (ts >= desde) {
              if (v.mla) uMla[v.mla] = (uMla[v.mla] || 0) + q;
              if (v.prodId) uProd[v.prodId] = (uProd[v.prodId] || 0) + q;
            }
            if (v.mla && (!ultMla[v.mla] || ts > ultMla[v.mla])) ultMla[v.mla] = ts;
            if (v.prodId && (!ultProd[v.prodId] || ts > ultProd[v.prodId])) ultProd[v.prodId] = ts;
          }
          const tot = (v.total || 0) / q, net = (v.neto || 0) / q;
          if (tot <= 0 || net <= 0) continue;
          if (v.mla) (vtaMla[v.mla] = vtaMla[v.mla] || []).push({ tot, net });
          if (v.prodId) (vtaProd[v.prodId] = vtaProd[v.prodId] || []).push({ tot, net });
        }
      }
      const feeCache = {};
      const feeAt = async (site, price, ltype, cat, token) => {
        const key = site + '|' + ltype + '|' + cat + '|' + Math.round(price);
        if (feeCache[key] !== undefined) return feeCache[key];
        let out = null;
        try {
          const d = await mlGet(`/sites/${site}/listing_prices?price=${Math.round(price)}&listing_type_id=${ltype}&category_id=${cat}`, token);
          const o = Array.isArray(d) ? d[0] : d;
          if (typeof o?.sale_fee_amount === 'number') out = o.sale_fee_amount;
        } catch { out = null; }
        feeCache[key] = out; return out;
      };
      // Cuándo entró el stock a Full. Se pregunta SOLO por los que no vendieron (son pocos),
      // porque es una llamada por inventario y si no se hace para las 160 publicaciones tarda una eternidad.
      const cuandoLlego = async (invIds, sellerId, token) => {
        let ult = 0;
        for (const id of invIds) {
          try {
            const o = await mlGet('/stock/fulfillment/operations/search?seller_id=' + sellerId + '&inventory_id=' + id + '&limit=20', token);
            const ops = Array.isArray(o) ? o : (o.results || o.operations || []);
            for (const op of (ops || [])) {
              const tipo = String(op.type || op.operation_type || '').toLowerCase();
              if (!tipo.includes('inbound') && !tipo.includes('reception')) continue;
              const f = Date.parse(op.date_created || op.date || op.last_updated || '');
              if (isFinite(f) && f > ult) ult = f;
            }
          } catch { /* sin datos de Full */ }
        }
        return ult || 0;
      };
      const vendio = [], sinStock = [], recien = [], candidatos = [], normales = [], sinDato = [];
      for (const label of labels) {
        const acc = accounts[label];
        if (!acc?.refresh_token) continue;
        let t; try { t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token); } catch { continue; }
        await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
        const m = (mlExtraPct(label) + monoP) / 100;
        const ids = Object.entries(links)
          .filter(([mla, e]) => e && e.cuenta === label && !e.ignored && e.prodId && /^MLA/i.test(mla))
          .map(([mla]) => mla);
        for (let k = 0; k < ids.length; k += 20) {
          let arr;
          try { arr = await mlGet('/items?ids=' + ids.slice(k, k + 20).join(',') + '&attributes=id,status,price,available_quantity,variations,title,listing_type_id,category_id,site_id,inventory_id', t.access_token); } catch { continue; }
          for (const row of (arr || [])) {
            const b = row.body || {}; const mla = b.id; if (!mla || !links[mla]) continue;
            if (b.status !== 'active') continue;
            const p = pIdx[links[mla].prodId]; if (!p) continue;
            const nom = (links[mla].title || b.title || p.name || mla).slice(0, 38);
            const vars = Array.isArray(b.variations) ? b.variations : [];
            const stock = vars.length
              ? vars.reduce((s, v) => s + (v.available_quantity || 0), 0)
              : (b.available_quantity || 0);
            const vendidas = uMla[mla] || 0;
            // OJO: la regla es "si el PRODUCTO tuvo ventas, no se toca" — no la publicación. Un mismo
            // producto suele estar publicado varias veces y las ventas se van por una sola. Mirando
            // solo la publicación, el Victoria's Secret aparecía como candidato a bajar cuando el
            // producto vendió 45 unidades en el mes por otra publicación.
            const vendidasProd = uProd[p.id] || 0;
            const ult = ultMla[mla] || ultProd[p.id] || 0;
            const diasSin = ult ? Math.round((Date.now() - ult) / 864e5) : null;
            const base = { label, mla, nom, stock, vendidas, vendidasProd, diasSin, prod: p.name || '', nVar: vars.length, precio: vars.length ? (vars[0].price || 0) : (b.price || 0) };
            if (vendidasProd > 0) { vendio.push(base); continue; }   // el producto vendió: no se toca (tu regla)
            if (stock <= 0) { sinStock.push(base); continue; }   // sin stock: no se puede juzgar
            // Con stock y sin vender: ¿desde cuándo hay stock?
            const invIds = [];
            if (b.inventory_id) invIds.push(b.inventory_id);
            for (const v of vars) if (v.inventory_id) invIds.push(v.inventory_id);
            const hKey = p.id + '__' + label;
            const desdeHist = hist[hKey] && hist[hKey].desde ? hist[hKey].desde : 0;
            const llego = invIds.length ? await cuandoLlego(invIds, acc.seller_id, t.access_token) : 0;
            const conStockDesde = Math.max(llego, desdeHist);
            base.diasConStock = conStockDesde ? Math.round((Date.now() - conStockDesde) / 864e5) : null;
            base.fuenteStock = llego ? 'Full' : (desdeHist ? 'histórico' : null);
            if (base.diasConStock != null && base.diasConStock < RECIEN) { recien.push(base); continue; }
            // Ahora sí: con stock hace rato y sin vender. ¿Tiene margen alto?
            const costo = costoPesos(p, 1, tc).costo;
            if (!costo || !base.precio) { sinDato.push({ ...base, why: !costo ? 'sin costo' : 'sin precio' }); continue; }
            const com = await feeAt(b.site_id || 'MLA', base.precio, b.listing_type_id, b.category_id, t.access_token);
            if (com == null) { sinDato.push({ ...base, why: 'ML no dio la comisión' }); continue; }
            const ventas = (vtaMla[mla] && vtaMla[mla].length) ? vtaMla[mla] : (vtaProd[p.id] || []);
            let envio = Infinity;
            for (const pv of [...new Set(ventas.map((v) => Math.round(v.tot)))].slice(-6)) {
              const cv = await feeAt(b.site_id || 'MLA', pv, b.listing_type_id, b.category_id, t.access_token);
              if (cv == null) continue;
              for (const v of ventas) if (Math.round(v.tot) === pv) { const x = v.tot - v.net - cv; if (x < envio) envio = x; }
            }
            if (!isFinite(envio)) { sinDato.push({ ...base, why: 'nunca vendió: no puedo deducir el envío' }); continue; }
            if (envio < 0) envio = 0;
            const neto = base.precio - com - envio;
            const mlx = base.precio * m;
            const mg = (neto - costo - mlx) / (costo + mlx) * 100;
            const fila = { ...base, mg, costo, com, envio, neto, mlx };
            if (mg < MG_ALTO) { normales.push(fila); continue; }
            const den = 1 - m * (1 + META);
            let P = base.precio, comP = com;
            if (den > 0) {
              for (let it = 0; it < 3; it++) {
                const Pn = (costo * (1 + META) + comP + envio) / den;
                const c2 = await feeAt(b.site_id || 'MLA', Pn, b.listing_type_id, b.category_id, t.access_token);
                if (c2 == null) break;
                if (Math.abs(Pn - P) < 1 && it > 0) { P = Pn; comP = c2; break; }
                P = Pn; comP = c2;
              }
            }
            fila.nuevo = Math.ceil(P / 10) * 10;
            fila.baja = (1 - fila.nuevo / base.precio) * 100;
            candidatos.push(fila);
          }
        }
      }
      const dd = (f) => f.diasConStock != null ? `${f.diasConStock}d con stock` : 'no sé desde cuándo';
      console.log(`=== ROTACIÓN CON STOCK · ventana ${DIAS} días · margen alto ≥${MG_ALTO}% ===\n`);
      console.log(`── 🔴 BAJAR EL PRECIO · ${candidatos.length} ──`);
      console.log(`   Tienen stock hace más de ${RECIEN} días, margen alto y NO se venden.\n`);
      candidatos.sort((a, b) => b.mg - a.mg).forEach((f) => console.log(
        `   ${String(Math.round(f.mg)).padStart(4)}% · ${money(Math.round(f.precio)).padStart(10)} → ${money(f.nuevo).padStart(10)} (−${f.baja.toFixed(0)}%) · ${String(f.stock).padStart(3)} u · ${dd(f)} · ${f.label.padEnd(8)} · ${f.nom}`));
      console.log(`\n── ⏳ RECIÉN LLEGÓ EL STOCK, DARLE TIEMPO · ${recien.length} ──`);
      recien.sort((a, b) => (a.diasConStock || 0) - (b.diasConStock || 0)).forEach((f) => console.log(
        `   ${String(f.stock).padStart(3)} u · llegó hace ${f.diasConStock} días · ${money(Math.round(f.precio)).padStart(10)} · ${f.label.padEnd(8)} · ${f.nom}`));
      console.log(`\n── ⚪ SIN STOCK: NO SE PUEDE JUZGAR · ${sinStock.length} ──`);
      console.log(`   No se venden porque no hay qué vender. Bajarles el precio no cambia nada.\n`);
      sinStock.slice(0, 25).forEach((f) => console.log(
        `   ${money(Math.round(f.precio)).padStart(10)} · ${f.diasSin != null ? f.diasSin + ' días sin vender' : 'NUNCA vendió'} · ${f.label.padEnd(8)} · ${f.nom}`));
      if (sinStock.length > 25) console.log(`   … y ${sinStock.length - 25} más`);
      console.log(`\n── 🟡 CON STOCK, NO VENDE, PERO EL MARGEN YA ES NORMAL · ${normales.length} ──`);
      console.log(`   Bajar el precio NO es la palanca acá: ya están cerca del piso.\n`);
      normales.sort((a, b) => b.mg - a.mg).slice(0, 20).forEach((f) => console.log(
        `   ${String(Math.round(f.mg)).padStart(4)}% · ${money(Math.round(f.precio)).padStart(10)} · ${String(f.stock).padStart(3)} u · ${dd(f)} · ${f.label.padEnd(8)} · ${f.nom}`));
      if (normales.length > 20) console.log(`   … y ${normales.length - 20} más`);
      console.log(`\n── 🟢 VENDIERON EN ${DIAS} DÍAS (no se tocan) · ${vendio.length} ──`);
      console.log(`\n── ❔ SIN DATOS · ${sinDato.length} ──`);
      sinDato.slice(0, 12).forEach((f) => console.log(`   ${f.label.padEnd(8)} · ${f.nom} · ${f.why}`));
      console.log(`\nSOLO LECTURA: no se tocó ningún precio.`);
      console.log(`La fecha de llegada sale de las operaciones de Full de ML. Para lo que no es Full, el`);
      console.log(`robot empezó a anotar desde hoy cuándo un producto pasa de 0 a tener stock.`);
      return;
    }
    // BILLING_PROBE=netoweb[:prueba] → CARGA EN LA WEB el neto que deja cada producto AL PRECIO DE HOY.
    // La pantalla "Margen ML" mostraba el neto promedio de las ventas VIEJAS. Después de cambiar
    // precios ese número miente, y los productos que nunca vendieron no mostraban nada.
    // Esto calcula, por cada producto, neto = precio − comisión oficial de ML − envío, y lo guarda
    // en products/<id>/netoCalc para verlo ANTES de vender. No pisa el neto que cargues a mano.
    if (String(process.env.BILLING_PROBE || '').startsWith('netoweb')) {
      const prueba = String(process.env.BILLING_PROBE).split(':')[1] === 'prueba';
      const vp = (await db.get('cyc/ventaprod')) || {};
      const links = (await db.get('cyc/mllinks')) || {};
      const fin = (await db.get('cyc/finanzas')) || {};
      const tc = parseFloat(fin.tipo_cambio) || 1500;
      const pIdx = {}; for (const p of products) pIdx[p.id] = p;
      const vtaMla = {}, vtaProd = {};
      for (const ents of Object.values(vp)) {
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada) continue;
          const q = v.qty || 1, tot = (v.total || 0) / q, net = (v.neto || 0) / q;
          if (tot <= 0 || net <= 0) continue;
          if (v.mla) (vtaMla[v.mla] = vtaMla[v.mla] || []).push({ tot, net });
          if (v.prodId) (vtaProd[v.prodId] = vtaProd[v.prodId] || []).push({ tot, net });
        }
      }
      const feeCache = {};
      const feeAt = async (site, price, ltype, cat, token) => {
        const key = site + '|' + ltype + '|' + cat + '|' + Math.round(price);
        if (feeCache[key] !== undefined) return feeCache[key];
        let out = null;
        try {
          const d = await mlGet(`/sites/${site}/listing_prices?price=${Math.round(price)}&listing_type_id=${ltype}&category_id=${cat}`, token);
          const o = Array.isArray(d) ? d[0] : d;
          if (typeof o?.sale_fee_amount === 'number') out = o.sale_fee_amount;
        } catch { out = null; }
        feeCache[key] = out; return out;
      };
      // Un producto puede estar publicado varias veces. Se toma el neto MÁS BAJO de sus
      // publicaciones activas: es el peor caso, el que conviene mirar antes de vender.
      const porProd = {};
      for (const label of labels) {
        const acc = accounts[label];
        if (!acc?.refresh_token) continue;
        let t; try { t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token); } catch { continue; }
        await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
        const ids = Object.entries(links)
          .filter(([mla, e]) => e && e.cuenta === label && !e.ignored && e.prodId && /^MLA/i.test(mla))
          .map(([mla]) => mla);
        for (let k = 0; k < ids.length; k += 20) {
          let arr;
          try { arr = await mlGet('/items?ids=' + ids.slice(k, k + 20).join(',') + '&attributes=id,status,price,variations,listing_type_id,category_id,site_id', t.access_token); } catch { continue; }
          for (const row of (arr || [])) {
            const b = row.body || {}; const mla = b.id; if (!mla || !links[mla]) continue;
            if (b.status !== 'active') continue;
            const p = pIdx[links[mla].prodId]; if (!p) continue;
            const vars = Array.isArray(b.variations) ? b.variations : [];
            const precio = vars.length ? (vars[0].price || 0) : (b.price || 0);
            if (!precio) continue;
            const com = await feeAt(b.site_id || 'MLA', precio, b.listing_type_id, b.category_id, t.access_token);
            if (com == null) continue;
            const ventas = (vtaMla[mla] && vtaMla[mla].length) ? vtaMla[mla] : (vtaProd[p.id] || []);
            let envio = Infinity;
            for (const pv of [...new Set(ventas.map((v) => Math.round(v.tot)))].slice(-6)) {
              const cv = await feeAt(b.site_id || 'MLA', pv, b.listing_type_id, b.category_id, t.access_token);
              if (cv == null) continue;
              for (const v of ventas) if (Math.round(v.tot) === pv) { const x = v.tot - v.net - cv; if (x < envio) envio = x; }
            }
            if (!isFinite(envio)) envio = 0; // sin ventas: al menos el neto sin envío deducido
            if (envio < 0) envio = 0;
            const neto = Math.round(precio - com - envio);
            if (neto <= 0) continue;
            const prev = porProd[p.id];
            if (!prev || neto < prev.neto) porProd[p.id] = { neto, precio: Math.round(precio), mla, cuenta: label, sinEnvio: !ventas.length };
          }
        }
      }
      const lista = Object.entries(porProd);
      console.log(`=== NETO AL PRECIO DE HOY · ${lista.length} productos ${prueba ? '(PRUEBA: no se guarda)' : ''} ===`);
      console.log(`neto = precio − comisión oficial de ML − envío · si un producto tiene varias publicaciones se toma el PEOR neto\n`);
      let guardados = 0;
      for (const [pid, d] of lista) {
        const p = pIdx[pid];
        const costo = costoPesos(p, 1, tc).costo;
        const mg = costo > 0 ? ((d.neto - costo) / costo * 100).toFixed(0) + '%' : '—';
        console.log(`  ${money(d.precio).padStart(10)} → neto ${money(d.neto).padStart(10)} · margen s/costo ${String(mg).padStart(5)} · ${d.cuenta.padEnd(8)} · ${(p.name || pid).slice(0, 40)}${d.sinEnvio ? ' (sin ventas: envío no deducido)' : ''}`);
        if (!prueba && !DRY) {
          await db.set('products/' + pid + '/netoCalc', d.neto);
          await db.set('products/' + pid + '/netoCalcPrecio', d.precio);
          await db.set('products/' + pid + '/netoCalcTs', Date.now());
          guardados++;
        }
      }
      console.log(`\n${prueba ? '(PRUEBA) ' : ''}${prueba ? lista.length + ' se guardarían' : guardados + ' guardados'} en la web (pantalla Margen ML).`);
      return;
    }
    // BILLING_PROBE=dormidos[:<días>][:<margenMin>] → PRODUCTOS CON MARGEN ALTO QUE NO ROTAN.
    // Regla tuya: si el producto VENDIÓ en la ventana, no se toca aunque tenga margen alto. Solo
    // interesan los que tienen buen margen y NO se venden: ahí bajar el precio puede despertarlos.
    // Solo lee, no toca ningún precio.
    if (String(process.env.BILLING_PROBE || '').startsWith('dormidos')) {
      const _d = String(process.env.BILLING_PROBE).split(':');
      const DIAS = parseFloat(_d[1]) || 30;
      const MG_ALTO = parseFloat(_d[2]) || 45;      // de acá para arriba es "margen alto"
      const cfgD = (await db.get('cyc/mlconfig')) || {};
      const META = (parseFloat(cfgD.targetPct) || 32) / 100; // a dónde bajarlos
      const desde = Date.now() - DIAS * 864e5;
      const vp = (await db.get('cyc/ventaprod')) || {};
      const links = (await db.get('cyc/mllinks')) || {};
      const fin = (await db.get('cyc/finanzas')) || {};
      const tc = parseFloat(fin.tipo_cambio) || 1500;
      const monoP = parseFloat(((await db.get('cyc/monotributo')) || {}).pct) || 0;
      const UMBRAL_ENVIO = 33000;
      const pIdx = {}; for (const p of products) pIdx[p.id] = p;
      // Ventas: por publicación y por producto. Se guarda cuántas unidades en la ventana y cuándo
      // fue la última venta de todas (aunque sea vieja), más precio/neto para deducir el envío.
      const uMla = {}, uProd = {}, ultMla = {}, ultProd = {}, vtaMla = {}, vtaProd = {};
      for (const [k, ents] of Object.entries(vp)) {
        const ts = Date.parse(k.slice(0, 10).replace(/_/g, '-'));
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada) continue;
          const q = v.qty || 1;
          if (isFinite(ts)) {
            if (ts >= desde) {
              if (v.mla) uMla[v.mla] = (uMla[v.mla] || 0) + q;
              if (v.prodId) uProd[v.prodId] = (uProd[v.prodId] || 0) + q;
            }
            if (v.mla && (!ultMla[v.mla] || ts > ultMla[v.mla])) ultMla[v.mla] = ts;
            if (v.prodId && (!ultProd[v.prodId] || ts > ultProd[v.prodId])) ultProd[v.prodId] = ts;
          }
          const tot = (v.total || 0) / q, net = (v.neto || 0) / q;
          if (tot <= 0 || net <= 0) continue;
          if (v.mla) (vtaMla[v.mla] = vtaMla[v.mla] || []).push({ tot, net });
          if (v.prodId) (vtaProd[v.prodId] = vtaProd[v.prodId] || []).push({ tot, net });
        }
      }
      const feeCache = {};
      const feeAt = async (site, price, ltype, cat, token) => {
        const key = site + '|' + ltype + '|' + cat + '|' + Math.round(price);
        if (feeCache[key] !== undefined) return feeCache[key];
        let out = null;
        try {
          const d = await mlGet(`/sites/${site}/listing_prices?price=${Math.round(price)}&listing_type_id=${ltype}&category_id=${cat}`, token);
          const o = Array.isArray(d) ? d[0] : d;
          if (typeof o?.sale_fee_amount === 'number') out = o.sale_fee_amount;
        } catch { out = null; }
        feeCache[key] = out; return out;
      };
      console.log(`=== MARGEN ALTO SIN ROTACIÓN · últimos ${DIAS} días · margen alto = ${MG_ALTO}% ===`);
      console.log(`Los que VENDIERON en la ventana NO se listan para bajar, por más margen que tengan.`);
      console.log(`El precio sugerido lleva el margen a la meta de ${(META * 100).toFixed(0)}%. SOLO LECTURA.\n`);
      const dormidos = [], vendieron = [], normales = [], sinDato = [];
      for (const label of labels) {
        const acc = accounts[label];
        if (!acc?.refresh_token) continue;
        let t; try { t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token); } catch { continue; }
        await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
        const m = (mlExtraPct(label) + monoP) / 100;
        const ids = Object.entries(links)
          .filter(([mla, e]) => e && e.cuenta === label && !e.ignored && e.prodId && /^MLA/i.test(mla))
          .map(([mla]) => mla);
        for (let k = 0; k < ids.length; k += 20) {
          let arr;
          try { arr = await mlGet('/items?ids=' + ids.slice(k, k + 20).join(',') + '&attributes=id,status,price,variations,title,listing_type_id,category_id,site_id', t.access_token); } catch { continue; }
          for (const row of (arr || [])) {
            const b = row.body || {}; const mla = b.id; if (!mla || !links[mla]) continue;
            if (b.status !== 'active') continue;
            const p = pIdx[links[mla].prodId]; if (!p) continue;
            const nom = (links[mla].title || b.title || p.name || mla).slice(0, 36);
            const vendidas = (uMla[mla] || 0) || (uProd[p.id] && !uMla[mla] && !vtaMla[mla] ? uProd[p.id] : 0);
            const ult = ultMla[mla] || ultProd[p.id] || 0;
            const diasSin = ult ? Math.round((Date.now() - ult) / 864e5) : null;
            const site = b.site_id || 'MLA', lt = b.listing_type_id, cat = b.category_id;
            const costo = costoPesos(p, 1, tc).costo;
            const vars = Array.isArray(b.variations) ? b.variations : [];
            const precio = vars.length ? (vars[0].price || 0) : (b.price || 0);
            const base = { label, mla, nom, precio, vendidas, diasSin, prod: p.name || '', nVar: vars.length };
            if (vendidas > 0) { vendieron.push(base); continue; } // vendió: no se toca
            if (!costo || !precio) { sinDato.push({ ...base, why: !costo ? 'sin costo' : 'sin precio' }); continue; }
            const com = await feeAt(site, precio, lt, cat, t.access_token);
            if (com == null) { sinDato.push({ ...base, why: 'ML no dio la comisión' }); continue; }
            const ventas = (vtaMla[mla] && vtaMla[mla].length) ? vtaMla[mla] : (vtaProd[p.id] || []);
            let envio = Infinity;
            for (const pv of [...new Set(ventas.map((v) => Math.round(v.tot)))].slice(-6)) {
              const cv = await feeAt(site, pv, lt, cat, t.access_token);
              if (cv == null) continue;
              for (const v of ventas) if (Math.round(v.tot) === pv) { const x = v.tot - v.net - cv; if (x < envio) envio = x; }
            }
            if (!isFinite(envio)) { sinDato.push({ ...base, why: 'nunca vendió: no puedo deducir el envío' }); continue; }
            if (envio < 0) envio = 0;
            const neto = precio - com - envio;
            const mlx = precio * m;
            const mg = (neto - costo - mlx) / (costo + mlx) * 100;
            const fila = { ...base, mg, costo, com, envio, neto, mlx };
            if (mg < MG_ALTO) { normales.push(fila); continue; }
            // Precio que dejaría el margen en la meta (mismo punto fijo, pero para BAJAR)
            const den = 1 - m * (1 + META);
            let P = precio, comP = com;
            if (den > 0) {
              for (let it = 0; it < 3; it++) {
                const Pn = (costo * (1 + META) + comP + envio) / den;
                const c2 = await feeAt(site, Pn, lt, cat, t.access_token);
                if (c2 == null) break;
                if (Math.abs(Pn - P) < 1 && it > 0) { P = Pn; comP = c2; break; }
                P = Pn; comP = c2;
              }
            }
            fila.nuevo = Math.ceil(P / 10) * 10;
            fila.baja = (1 - fila.nuevo / precio) * 100;
            fila.cruza = (precio >= UMBRAL_ENVIO && fila.nuevo < UMBRAL_ENVIO);
            dormidos.push(fila);
          }
        }
      }
      dormidos.sort((a, b) => b.mg - a.mg);
      console.log(`── A. MARGEN ALTO Y SIN VENDER · ${dormidos.length} publicaciones ──`);
      console.log(`   (candidatas a bajar de precio para que roten)\n`);
      dormidos.forEach((f) => console.log(
        `  ${String(Math.round(f.mg)).padStart(4)}% → ${(META * 100).toFixed(0)}% · ${money(Math.round(f.precio)).padStart(10)} → ${money(f.nuevo).padStart(10)} (−${f.baja.toFixed(1)}%)`
        + ` · ${f.diasSin != null ? f.diasSin + ' días sin vender' : 'NUNCA vendió'} · ${f.label.padEnd(8)} · ${f.mla} · ${f.nom}${f.nVar ? ` [${f.nVar} var]` : ''}${f.cruza ? ' ⚠️ cruzaría los $33.000 para abajo (ahí el envío deja de pagarlo CYC: MEJOR)' : ''}\n`
        + `        precio ${money(Math.round(f.precio))} − comisión ${money(Math.round(f.com))} − envío ${money(Math.round(f.envio))} = neto ${money(Math.round(f.neto))}`
        + ` · costo ${money(Math.round(f.costo))} + cargo ML ${money(Math.round(f.mlx))} = ${money(Math.round(f.costo + f.mlx))}`));
      console.log(`\n── B. VENDIERON EN ${DIAS} DÍAS (NO SE TOCAN) · ${vendieron.length} ──`);
      vendieron.sort((a, b) => b.vendidas - a.vendidas).slice(0, 30).forEach((f) =>
        console.log(`  ${String(f.vendidas).padStart(3)} u · ${money(Math.round(f.precio)).padStart(10)} · ${f.label.padEnd(8)} · ${f.nom}`));
      if (vendieron.length > 30) console.log(`  … y ${vendieron.length - 30} más`);
      console.log(`\n── C. SIN VENDER PERO CON MARGEN NORMAL (bajar no es la palanca) · ${normales.length} ──`);
      normales.sort((a, b) => b.mg - a.mg).slice(0, 20).forEach((f) =>
        console.log(`  ${String(Math.round(f.mg)).padStart(4)}% · ${money(Math.round(f.precio)).padStart(10)} · ${f.diasSin != null ? f.diasSin + ' días' : 'NUNCA'} · ${f.label.padEnd(8)} · ${f.nom}`));
      if (normales.length > 20) console.log(`  … y ${normales.length - 20} más`);
      console.log(`\n── D. SIN DATOS · ${sinDato.length} ──`);
      sinDato.slice(0, 15).forEach((f) => console.log(`  ${f.label.padEnd(8)} · ${f.nom} · ${f.why}`));
      if (sinDato.length > 15) console.log(`  … y ${sinDato.length - 15} más`);
      console.log(`\nSOLO LECTURA: no se tocó ningún precio.`);
      return;
    }
    // BILLING_PROBE=sacapromos[:prueba] → saca AHORA todas las promociones aceptadas (aplicadas y
    // agendadas) de las 4 cuentas, sin esperar a la corrida automática.
    if (String(process.env.BILLING_PROBE || '').startsWith('sacapromos')) {
      const prueba = String(process.env.BILLING_PROBE).split(':')[1] === 'prueba';
      const links = (await db.get('cyc/mllinks')) || {};
      console.log(`=== SACAR PROMOCIONES ACEPTADAS ${prueba ? '(PRUEBA: no se toca nada)' : ''} ===`);
      console.log(`Se sacan las 'started' (activas) y las 'pending' (agendadas). Las 'candidate' no se tocan.\n`);
      let sacadas = 0, fallidas = 0, revisadas = 0; const detalle = [];
      for (const label of labels) {
        const acc = accounts[label];
        if (!acc?.refresh_token) continue;
        let t; try { t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token); } catch { console.log(`(${label}: no pude renovar token)`); continue; }
        await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
        const ids = Object.entries(links)
          .filter(([mla, e]) => e && e.cuenta === label && !e.ignored && /^MLA/i.test(mla))
          .map(([mla, e]) => ({ mla, title: e.title || mla }));
        for (const it of ids) {
          revisadas++;
          let arr;
          try {
            const r = await mlGet('/seller-promotions/items/' + it.mla + '?app_version=v2', t.access_token);
            arr = Array.isArray(r) ? r : (r.results || []);
          } catch { continue; }
          const malas = (arr || []).filter((pr) => pr.status === 'started' || pr.status === 'pending');
          if (!malas.length) continue;
          for (const pr of malas) {
            const desc = `${label} · ${it.title.slice(0, 38)} · ${pr.type} ${pr.original_price != null ? money(Math.round(pr.original_price)) : ''}→${pr.price != null ? money(Math.round(pr.price)) : ''}${pr.start_date ? ' desde ' + String(pr.start_date).slice(0, 10) : ''}`;
            if (prueba) { console.log(`  · ${desc}`); sacadas++; continue; }
            const qs = new URLSearchParams({ app_version: 'v2' });
            if (pr.id) qs.set('promotion_id', pr.id);
            if (pr.type) qs.set('promotion_type', pr.type);
            try {
              const r = await fetch(ML_API + '/seller-promotions/items/' + it.mla + '?' + qs.toString(), {
                method: 'DELETE', headers: { Authorization: 'Bearer ' + t.access_token },
              });
              if (r.ok) { sacadas++; detalle.push(desc); console.log(`  ✓ ${desc}`); }
              else { fallidas++; console.log(`  ✗ ${desc} → ML-${r.status}`); }
            } catch { fallidas++; console.log(`  ✗ ${desc} → red`); }
          }
        }
      }
      console.log(`\n${prueba ? '(PRUEBA) ' : ''}${sacadas} promociones ${prueba ? 'se sacarían' : 'sacadas'} · ${fallidas} con error · ${revisadas} publicaciones revisadas`);
      if (!prueba && sacadas) {
        await sendTelegram(`🛑 <b>Promociones sacadas</b>\n${sacadas} descuentos de ML dados de baja `
          + `(activos y agendados).${fallidas ? `\n⚠️ ${fallidas} no se pudieron sacar.` : ''}`);
      }
      return;
    }
    // BILLING_PROBE=promos[:<palabra>] → VUELCA CRUDO lo que ML dice de las promociones de cada
    // publicación: estado, tipo, precio con descuento y quién lo paga. Solo lee.
    // Hace falta para saber con qué estado quedan las PROGRAMADAS: el robot solo sacaba las
    // 'started' (ya aplicadas) y las agendadas para más adelante se le escapaban enteras.
    if (String(process.env.BILLING_PROBE || '').startsWith('promos')) {
      const kw = (String(process.env.BILLING_PROBE).split(':')[1] || '').trim().toLowerCase();
      const links = (await db.get('cyc/mllinks')) || {};
      const estados = {}; // estado → cuántas
      console.log(`=== PROMOCIONES CRUDAS DE ML ${kw ? `(filtro "${kw}")` : '(todas)'} · SOLO LECTURA ===\n`);
      for (const label of labels) {
        const acc = accounts[label];
        if (!acc?.refresh_token) continue;
        let t; try { t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token); } catch { continue; }
        await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
        const ids = Object.entries(links)
          .filter(([mla, e]) => e && e.cuenta === label && !e.ignored && /^MLA/i.test(mla)
            && (!kw || (e.title || '').toLowerCase().includes(kw)))
          .map(([mla, e]) => ({ mla, title: e.title || mla }));
        let mostradas = 0;
        for (const it of ids) {
          let arr;
          try {
            const r = await mlGet('/seller-promotions/items/' + it.mla + '?app_version=v2', t.access_token);
            arr = Array.isArray(r) ? r : (r.results || []);
          } catch { continue; }
          if (!arr || !arr.length) continue;
          for (const pr of arr) estados[pr.status || 'sin-estado'] = (estados[pr.status || 'sin-estado'] || 0) + 1;
          // Solo se imprimen las que NO son simples ofertas sin aplicar, para no llenar el log.
          const interesantes = arr.filter((pr) => pr.status !== 'candidate');
          if (!interesantes.length) continue;
          if (mostradas >= 12) continue; // tope por cuenta, para poder leerlo
          mostradas++;
          console.log(`${label} · ${it.mla} · ${it.title.slice(0, 44)}`);
          for (const pr of interesantes) {
            console.log(`   estado=${pr.status} tipo=${pr.type} id=${pr.id || '-'}`
              + ` precio=${pr.price != null ? money(Math.round(pr.price)) : '-'}`
              + ` original=${pr.original_price != null ? money(Math.round(pr.original_price)) : '-'}`
              + `${pr.deal_price != null ? ' deal=' + money(Math.round(pr.deal_price)) : ''}`
              + `${pr.meli_percentage != null ? ' pagaML=' + pr.meli_percentage + '%' : ''}`
              + `${pr.seller_percentage != null ? ' pagaVos=' + pr.seller_percentage + '%' : ''}`
              + `${pr.start_date ? ' desde=' + String(pr.start_date).slice(0, 10) : ''}`
              + `${pr.finish_date ? ' hasta=' + String(pr.finish_date).slice(0, 10) : ''}`);
          }
        }
      }
      console.log(`\n── CUÁNTAS HAY DE CADA ESTADO ──`);
      Object.entries(estados).sort((a, b) => b[1] - a[1]).forEach(([e, n]) => console.log(`   ${e}: ${n}`));
      console.log(`\nHoy el robot SOLO saca las de estado "started". Todo lo demás se le escapa.`);
      return;
    }
    // BILLING_PROBE=fijar:<grupo>:<precio>[:prueba] → pone TODAS las publicaciones activas de un grupo
    // en ese precio exacto, subiendo o bajando. Sirve para corregir cuando una se pasó del techo y
    // arrastraría al resto en la próxima nivelación.
    if (String(process.env.BILLING_PROBE || '').startsWith('fijar:')) {
      const _f = String(process.env.BILLING_PROBE).split(':');
      const gNom = (_f[1] || '').trim().toLowerCase();
      const precioFijo = Math.round(parseFloat(_f[2]) || 0);
      const prueba = _f[3] === 'prueba';
      if (!gNom || !precioFijo) { console.log('Usá: fijar:<grupo>:<precio>[:prueba] — ej fijar:paulvic:14360'); return; }
      const grupos = (await db.get('cyc/mlconfig/gruposPrecio')) || {};
      const cfgG = grupos[gNom];
      if (!cfgG || !cfgG.palabra) { console.log(`No existe el grupo "${gNom}".`); return; }
      const pal = String(cfgG.palabra).toLowerCase();
      const links = (await db.get('cyc/mllinks')) || {};
      const pName = {}; for (const p of products) pName[p.id] = p.name || '';
      const toks = {}, sids = {};
      for (const label of labels) {
        const acc = accounts[label];
        if (!acc?.refresh_token) continue;
        try {
          const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
          await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
          toks[label] = t.access_token; if (acc.seller_id) sids[label] = acc.seller_id;
        } catch { /* sigue */ }
      }
      const miembros = Object.entries(links)
        .filter(([mla, e]) => e && !e.ignored && e.prodId && /^MLA/i.test(mla)
          && ((e.title || '') + ' ' + (pName[e.prodId] || '')).toLowerCase().includes(pal))
        .map(([mla, e]) => ({ mla, cuenta: e.cuenta || '', title: e.title || mla }));
      console.log(`=== FIJAR grupo "${gNom}" en ${money(precioFijo)} · ${miembros.length} vinculadas ===`);
      console.log(prueba ? 'MODO PRUEBA: no se escribe nada en ML\n' : '');
      let sube = 0, baja = 0, igual = 0, err = 0; const hechos = [];
      for (const mb of miembros) {
        // cada una con el token de su dueño; si no se sabe, se prueba cuenta por cuenta
        let tok = toks[mb.cuenta], cta = mb.cuenta;
        let b = null;
        const probar = tok ? [[cta, tok]] : Object.entries(toks);
        for (const [lab, tk] of probar) {
          try {
            const it = await mlGet('/items/' + mb.mla + '?attributes=id,status,price,variations,seller_id', tk);
            if (it && (!sids[lab] || String(it.seller_id) === String(sids[lab]))) { b = it; tok = tk; cta = lab; break; }
          } catch { /* probar la siguiente */ }
        }
        if (!b) { continue; }
        if (b.status !== 'active') continue;
        const vars = Array.isArray(b.variations) ? b.variations : [];
        const actual = vars.length ? Math.max(...vars.map((v) => v.price || 0)) : (b.price || 0);
        if (!actual) continue;
        if (Math.abs(actual - precioFijo) < 1) { igual++; continue; }
        if (prueba) {
          console.log(`  · ${cta} · ${mb.title.slice(0, 40)}: ${money(Math.round(actual))} → ${money(precioFijo)}`);
          if (actual < precioFijo) sube++; else baja++;
          continue;
        }
        let r;
        if (vars.length) {
          // para variantes se manda la lista completa con el precio fijo (raiseVariations solo sube,
          // así que si hay que bajar se hace con un PUT directo con TODAS las variantes)
          if (actual < precioFijo) {
            const nuevos = {}; for (const vv of vars) nuevos[String(vv.id)] = precioFijo;
            r = await raiseVariations(mb.mla, nuevos, tok);
            if (r.ok) r = { ok: true, from: actual, to: precioFijo };
          } else {
            try {
              const resp = await fetch(ML_API + '/items/' + mb.mla, {
                method: 'PUT', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' },
                body: JSON.stringify({ variations: vars.map((vv) => ({ id: vv.id, price: precioFijo })) }),
              });
              r = resp.ok ? { ok: true, from: actual, to: precioFijo } : { ok: false, err: 'ML-' + resp.status };
            } catch { r = { ok: false, err: 'red' }; }
          }
        } else if (actual < precioFijo) r = await raisePriceTo(mb.mla, precioFijo, tok);
        else r = await setPriceTo(mb.mla, null, precioFijo, tok);
        if (r.ok) {
          if (r.to > r.from) sube++; else baja++;
          hechos.push({ title: mb.title, from: r.from, to: r.to, cuenta: cta });
          console.log(`  ✓ ${cta} · ${mb.title.slice(0, 40)}: ${money(r.from)} → ${money(r.to)}`);
        } else { err++; console.log(`  ✗ ${cta} · ${mb.title.slice(0, 40)}: ${r.err}`); }
      }
      console.log(`\n${prueba ? '(PRUEBA) ' : ''}${sube} subidas · ${baja} bajadas · ${igual} ya estaban en ${money(precioFijo)} · ${err} con error`);
      if (!prueba && hechos.length) {
        await sendTelegram(`🟰 <b>Grupo ${gNom} fijado en ${money(precioFijo)}</b>\n`
          + `${hechos.length} publicaciones ajustadas (${sube} subieron, ${baja} bajaron).`);
      }
      return;
    }
    // BILLING_PROBE=nivelar[:prueba] → corre AHORA la nivelación de los grupos de precio, sin esperar
    // a la corrida automática. Con ':prueba' calcula y muestra pero NO escribe en ML.
    if (String(process.env.BILLING_PROBE || '').startsWith('nivelar')) {
      const soloPrueba = String(process.env.BILLING_PROBE).split(':')[1] === 'prueba';
      const links = (await db.get('cyc/mllinks')) || {};
      const pName = {}; for (const p of products) pName[p.id] = p.name || '';
      const tokensRun = {}, sellerIds = {};
      for (const label of labels) {
        const acc = accounts[label];
        if (!acc?.refresh_token) continue;
        try {
          const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
          await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
          tokensRun[label] = t.access_token;
          if (acc.seller_id) sellerIds[label] = acc.seller_id;
        } catch { console.log(`(${label}: no pude renovar token)`); }
      }
      console.log(soloPrueba ? '=== PRUEBA: no se escribe nada en ML ===' : '=== NIVELANDO GRUPOS EN ML ===');
      const avisos = await nivelarGrupos(db, links, tokensRun, DRY || soloPrueba, pName, sellerIds);
      if (!soloPrueba) for (const a of avisos) await sendTelegram(a);
      if (!avisos.length) console.log('No hubo nada para nivelar.');
      return;
    }
    // BILLING_PROBE=grupos                       → lista los grupos de precio y cómo está cada uno.
    // BILLING_PROBE=grupos:<nombre>:<palabra>    → crea/actualiza un grupo (ej: grupos:paulvic:paulvic).
    // BILLING_PROBE=grupos:<nombre>:off          → lo desactiva sin borrarlo.
    // Un grupo son publicaciones que tienen que valer TODAS lo mismo (el mismo perfume publicado
    // varias veces). Se nivelan solas al precio más alto en cada corrida del robot.
    if (String(process.env.BILLING_PROBE || '').startsWith('grupos')) {
      const _g = String(process.env.BILLING_PROBE).split(':');
      const nombre = (_g[1] || '').trim().toLowerCase();
      const palabra = (_g[2] || '').trim();
      if (nombre && palabra && palabra.toLowerCase() !== 'off') {
        if (!DRY) await db.patch('cyc/mlconfig/gruposPrecio/' + nombre, { palabra: palabra.toLowerCase(), activo: true });
        console.log(`${DRY ? '(DRY) ' : ''}Grupo "${nombre}" guardado: agrupa todo lo que diga "${palabra}" en el título o en el producto.`);
      } else if (nombre && palabra.toLowerCase() === 'off') {
        if (!DRY) await db.patch('cyc/mlconfig/gruposPrecio/' + nombre, { activo: false });
        console.log(`${DRY ? '(DRY) ' : ''}Grupo "${nombre}" desactivado.`);
      }
      // Mostrar cómo queda cada grupo: miembros, precio de cada uno y si están parejos.
      const grupos = (await db.get('cyc/mlconfig/gruposPrecio')) || {};
      const links = (await db.get('cyc/mllinks')) || {};
      const pName = {}; for (const p of products) pName[p.id] = p.name || '';
      const gs = Object.keys(grupos);
      if (!gs.length) { console.log('No hay ningún grupo de precio configurado.'); return; }
      console.log(`\n=== GRUPOS DE PRECIO · ${gs.length} ===\n`);
      for (const g of gs) {
        const cfgG = grupos[g] || {};
        const pal = String(cfgG.palabra || '').toLowerCase();
        console.log(`── ${g} ── palabra "${pal}" · ${cfgG.activo === false ? 'DESACTIVADO' : 'activo'}`);
        const miembros = Object.entries(links)
          .filter(([mla, e]) => e && !e.ignored && e.prodId && /^MLA/i.test(mla)
            && ((e.title || '') + ' ' + (pName[e.prodId] || '')).toLowerCase().includes(pal))
          .map(([mla, e]) => ({ mla, cuenta: e.cuenta || '', title: e.title || mla }));
        if (!miembros.length) { console.log('   (ninguna publicación coincide)\n'); continue; }
        const porCta = {};
        for (const mb of miembros) (porCta[mb.cuenta] = porCta[mb.cuenta] || []).push(mb);
        const filas = [];
        for (const [cta, arr] of Object.entries(porCta)) {
          const acc = accounts[cta];
          if (!acc?.refresh_token) { arr.forEach((mb) => filas.push({ ...mb, precio: 0, why: 'sin token' })); continue; }
          let t; try { t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token); } catch { arr.forEach((mb) => filas.push({ ...mb, precio: 0, why: 'no pude renovar token' })); continue; }
          await db.patch('mlapi/tokens/' + cta, { refresh_token: t.refresh_token, updated_ts: Date.now() });
          for (let k = 0; k < arr.length; k += 20) {
            let res;
            try { res = await mlGet('/items?ids=' + arr.slice(k, k + 20).map((x) => x.mla).join(',') + '&attributes=id,status,price,variations', t.access_token); } catch { continue; }
            for (const row of (res || [])) {
              const b = row.body || {}; if (!b.id) continue;
              const mb = arr.find((x) => x.mla === b.id) || { mla: b.id, cuenta: cta, title: b.id };
              const vars = Array.isArray(b.variations) ? b.variations : [];
              const precio = vars.length ? Math.max(...vars.map((v) => v.price || 0)) : (b.price || 0);
              filas.push({ ...mb, precio, why: b.status !== 'active' ? b.status : '', nVar: vars.length });
            }
          }
        }
        const act = filas.filter((f) => f.precio > 0 && !f.why);
        const techo = act.length ? Math.max(...act.map((f) => f.precio)) : 0;
        filas.sort((a, b) => b.precio - a.precio).forEach((f) => console.log(
          `   ${money(Math.round(f.precio)).padStart(10)}${f.precio && !f.why && f.precio < techo ? ` → subiría a ${money(techo)}` : (f.precio === techo && !f.why ? ' ← el más alto' : '')}`
          + ` · ${(f.cuenta || '?').padEnd(8)} · ${f.mla} · ${f.title.slice(0, 34)}${f.nVar ? ` [${f.nVar} variantes]` : ''}${f.why ? ` · ${f.why}` : ''}`));
        const desparejos = act.filter((f) => f.precio < techo).length;
        console.log(`   ${act.length} activas · ${desparejos ? `${desparejos} por debajo del más alto (se van a nivelar solas)` : 'todas al mismo precio ✓'}\n`);
      }
      console.log('Los grupos se nivelan solos en cada corrida del robot (cada 10 minutos).');
      return;
    }
    // BILLING_PROBE=tocados[:<horas>][:bajar:<MLA|todos>] → QUÉ PRECIOS TOCÓ SOLO EL ROBOT en las
    // últimas N horas (default 72) y en qué margen quedaron HOY, con la comisión oficial de ML. Sirve
    // para revisar el daño de haber corrido con la meta vieja (42%): muestra cuáles quedaron muy por
    // encima de la meta nueva y a qué precio habría que dejarlos.
    // Sin 'bajar' SOLO LEE. Con 'bajar:<destino>' corrige en ML los que se pasaron (solo baja, nunca
    // sube, y nunca más de 25% de una). El destino es obligatorio para que no pase por accidente.
    if (String(process.env.BILLING_PROBE || '').startsWith('tocados')) {
      const _ct = String(process.env.BILLING_PROBE).split(':');
      const HS = parseFloat(_ct[1]) || 72;
      const BAJAR = _ct[2] === 'bajar';
      const DEST = (_ct[3] || '').trim();
      if (BAJAR && !DEST) { console.log('Para corregir hace falta el destino: tocados:96:bajar:MLA123 o tocados:96:bajar:todos'); return; }
      const cfgT = (await db.get('cyc/mlconfig')) || {};
      const META = (parseFloat(cfgT.targetPct) || 32) / 100;
      const desde = Date.now() - HS * 3600e3;
      const priced = (await db.get('mlapi/priced')) || {};
      const tocados = Object.entries(priced)
        .filter(([mla, e]) => e && (e.ts || 0) >= desde && /^MLA/i.test(mla));
      console.log(`=== PRECIOS QUE TOCÓ EL ROBOT SOLO en las últimas ${HS} h · ${tocados.length} publicaciones ===`);
      console.log(`Meta guardada hoy: ${(META * 100).toFixed(0)}% · ${BAJAR ? `MODO CORRECCIÓN → destino "${DEST}"` : 'SOLO LECTURA, no se toca nada en ML'}\n`);
      if (!tocados.length) { console.log('Ninguna. El robot no subió precios solo en ese lapso.'); return; }
      const links = (await db.get('cyc/mllinks')) || {};
      const vp = (await db.get('cyc/ventaprod')) || {};
      const fin = (await db.get('cyc/finanzas')) || {};
      const tc = parseFloat(fin.tipo_cambio) || 1500;
      const monoP = parseFloat(((await db.get('cyc/monotributo')) || {}).pct) || 0;
      const pIdx = {}; for (const p of products) pIdx[p.id] = p;
      // ventas por publicación/producto para deducir el envío (igual que el probe 'precios')
      const vtaMla = {}, vtaProd = {};
      for (const [k, ents] of Object.entries(vp)) {
        if (k.slice(0, 7) < '2026_06') continue;
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada) continue;
          const q = v.qty || 1, tot = (v.total || 0) / q, net = (v.neto || 0) / q;
          if (tot <= 0 || net <= 0) continue;
          const reg = { tot, net };
          if (v.mla) (vtaMla[v.mla] = vtaMla[v.mla] || []).push(reg);
          if (v.prodId) (vtaProd[v.prodId] = vtaProd[v.prodId] || []).push(reg);
        }
      }
      const feeCache = {};
      const feeAt = async (site, price, ltype, cat, token) => {
        const key = site + '|' + ltype + '|' + cat + '|' + Math.round(price);
        if (feeCache[key] !== undefined) return feeCache[key];
        let out = null;
        try {
          const d = await mlGet(`/sites/${site}/listing_prices?price=${Math.round(price)}&listing_type_id=${ltype}&category_id=${cat}`, token);
          const o = Array.isArray(d) ? d[0] : d;
          if (typeof o?.sale_fee_amount === 'number') out = o.sale_fee_amount;
        } catch { out = null; }
        feeCache[key] = out;
        return out;
      };
      // agrupar por cuenta para pedir un solo token por cuenta
      const porCta = {};
      for (const [mla, e] of tocados) {
        const l = links[mla]?.cuenta; if (!l) continue;
        (porCta[l] = porCta[l] || []).push([mla, e]);
      }
      const pasados = [], bien = [], sinDato = [];
      for (const [label, arr] of Object.entries(porCta)) {
        const acc = accounts[label];
        if (!acc?.refresh_token) { console.log(`(${label}: sin token, salteada)`); continue; }
        let t; try { t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token); } catch { console.log(`(${label}: no pude renovar token)`); continue; }
        await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
        const m = (mlExtraPct(label) + monoP) / 100;
        for (const [mla, e] of arr) {
          let b; try { b = await mlGet('/items/' + mla + '?attributes=id,status,price,variations,title,listing_type_id,category_id,site_id', t.access_token); } catch { continue; }
          const p = pIdx[links[mla].prodId];
          const nom = (links[mla].title || b.title || p?.name || mla).slice(0, 34);
          if (!p) { sinDato.push({ label, mla, nom, why: 'sin producto vinculado' }); continue; }
          const site = b.site_id || 'MLA', lt = b.listing_type_id, cat = b.category_id;
          const costo = costoPesos(p, 1, tc).costo;
          if (!costo) { sinDato.push({ label, mla, nom, why: 'sin costo cargado' }); continue; }
          const vars = Array.isArray(b.variations) ? b.variations : [];
          const precio = vars.length ? (vars[0].price || 0) : (b.price || 0);
          if (!precio) { sinDato.push({ label, mla, nom, why: 'sin precio' }); continue; }
          const com = await feeAt(site, precio, lt, cat, t.access_token);
          if (com == null) { sinDato.push({ label, mla, nom, why: 'ML no devolvió la comisión' }); continue; }
          const ventas = (vtaMla[mla] && vtaMla[mla].length) ? vtaMla[mla] : (vtaProd[p.id] || []);
          // OJO con la asimetría: para SUBIR precios se usa el envío MÁS BARATO (optimista, así no se
          // sube de más). Acá se BAJA, y ahí el error caro es el otro: si subestimo el envío, bajo
          // demasiado y se pierde plata en cada venta. Por eso acá se usa el envío MÁS CARO visto.
          // Si aun con el peor envío el margen sigue arriba de la meta, bajar es seguro.
          let envio = -Infinity, envioMin = Infinity;
          for (const pv of [...new Set(ventas.map((v) => Math.round(v.tot)))].slice(-6)) {
            const cv = await feeAt(site, pv, lt, cat, t.access_token);
            if (cv == null) continue;
            for (const v of ventas) {
              if (Math.round(v.tot) !== pv) continue;
              const x = v.tot - v.net - cv;
              if (x > envio) envio = x;
              if (x < envioMin) envioMin = x;
            }
          }
          if (!isFinite(envio)) { sinDato.push({ label, mla, nom, why: 'no pude deducir el envío' }); continue; }
          if (envio < 0) envio = 0;
          if (!isFinite(envioMin) || envioMin < 0) envioMin = 0;
          const neto = precio - com - envio;
          const mlx = precio * m;
          const mg = (neto - costo - mlx) / (costo + mlx);
          // precio que dejaría el margen justo en la meta nueva (mismo punto fijo que 'precios')
          const den = 1 - m * (1 + META);
          let P = precio, comP = com;
          if (den > 0) {
            for (let it = 0; it < 3; it++) {
              const Pn = (costo * (1 + META) + comP + envio) / den;
              const c2 = await feeAt(site, Pn, lt, cat, t.access_token);
              if (c2 == null) break;
              if (Math.abs(Pn - P) < 1 && it > 0) { P = Pn; comP = c2; break; }
              P = Pn; comP = c2;
            }
          }
          const fila = { label, mla, nom, precio, mg: mg * 100, deb: Math.ceil(P / 10) * 10, puso: e.to || 0, cuando: new Date(e.ts).toISOString().slice(0, 16).replace('T', ' '), nVar: vars.length, tok: t.access_token, prod: p.name || '', com, envio, envioMin, costo, mlx, neto };
          fila.sobra = fila.precio - fila.deb;
          if (mg > META + 0.03) pasados.push(fila); else bien.push(fila);
        }
      }
      const ln = (f) => `  ${String(Math.round(f.mg)).padStart(4)}% · ${money(Math.round(f.precio)).padStart(10)} · debería ser ${money(f.deb).padStart(10)} (${f.sobra >= 0 ? '+' : ''}${money(Math.round(f.sobra))}) · ${f.label.padEnd(8)} · ${f.mla} · ${f.nom}${f.nVar ? ' [variantes]' : ''}\n`
        + `        el robot lo puso en ${money(f.puso)} el ${f.cuando} UTC\n`
        + `        precio ${money(Math.round(f.precio))} − comisión ${money(Math.round(f.com))} − envío ${money(Math.round(f.envio))} (el PEOR visto; el mejor fue ${money(Math.round(f.envioMin))}) = neto ${money(Math.round(f.neto))}\n`
        + `        costo mercadería ${money(Math.round(f.costo))} + cargo ML ${money(Math.round(f.mlx))} = ${money(Math.round(f.costo + f.mlx))}`;
      pasados.sort((a, b) => b.mg - a.mg);
      console.log(`── SE PASARON DE LA META (${(META * 100).toFixed(0)}% + 3 de tolerancia) · ${pasados.length} ──`);
      pasados.forEach((f) => console.log(ln(f)));
      console.log(`\n── QUEDARON BIEN · ${bien.length} ──`);
      bien.sort((a, b) => a.mg - b.mg).forEach((f) => console.log(ln(f)));
      console.log(`\n── SIN DATOS · ${sinDato.length} ──`);
      sinDato.forEach((f) => console.log(`  ${f.label.padEnd(8)} · ${f.mla} · ${f.nom} · ${f.why}`));
      if (!BAJAR) { console.log(`\nSOLO LECTURA: no se tocó ningún precio en ML.`); return; }
      // ── Corregir en ML: solo los que se pasaron, sin variantes (esas van a mano) ──
      const objetivo = (DEST === 'todos' ? pasados
        : /^MLA/i.test(DEST) ? pasados.filter((f) => f.mla === DEST)
        : pasados.filter((f) => (f.nom + ' ' + f.prod).toLowerCase().includes(DEST.toLowerCase())))
        .filter((f) => !f.nVar);
      if (!objetivo.length) { console.log(`\nNo hay nada para corregir con destino "${DEST}".`); return; }
      console.log(`\n══ CORRIGIENDO ${objetivo.length} precio${objetivo.length > 1 ? 's' : ''} en ML (bajando a la meta ${(META * 100).toFixed(0)}%) ══`);
      let okN = 0, errN = 0; const hechos = [];
      for (const f of objetivo) {
        const r = DRY ? { ok: false, err: 'DRY' } : await setPriceTo(f.mla, null, f.deb, f.tok);
        if (r.ok) { okN++; hechos.push({ nom: f.nom, from: r.from, to: r.to }); console.log(`  ✓ ${f.mla} · ${f.nom}: ${money(r.from)} → ${money(r.to)}`); }
        else { errN++; console.log(`  ✗ ${f.mla} · ${f.nom}: no se pudo (${r.err})`); }
      }
      console.log(`\nListo: ${okN} corregidos, ${errN} con error.`);
      if (hechos.length) {
        const lista = hechos.map((h) => `· ${h.nom}: ${money(h.from)} → <b>${money(h.to)}</b>`).join('\n');
        await sendTelegram(`🔽 <b>Precios corregidos para abajo</b>\n`
          + `Habían quedado altos porque el robot venía con la meta vieja (42%). Los llevé a la meta nueva de ${(META * 100).toFixed(0)}%.\n\n${lista}`
          + (errN ? `\n\n⚠️ ${errN} no se pudieron corregir.` : ''));
      }
      return;
    }
    // BILLING_PROBE=margendia[:YYYY_MM_DD] → por qué el margen del día da lo que da. Muestra venta por
    // venta el precio, el neto real, el costo con impuestos y el margen, y marca las que quedaron
    // abajo del piso. Sirve para ver si el promedio bajo es por pocas ventas, por una publicación
    // puntual, o porque el neto real vino peor que el estimado al fijar el precio.
    if (String(process.env.BILLING_PROBE || '').startsWith('margendia')) {
      const arg = (String(process.env.BILLING_PROBE).split(':')[1] || '').trim();
      const dia = /^\d{4}_\d{2}_\d{2}$/.test(arg) ? arg : dayKeyFromISO(new Date().toISOString());
      const vp = (await db.get('cyc/ventaprod/' + dia)) || {};
      const fin = (await db.get('cyc/finanzas')) || {};
      const mono = (await db.get('cyc/monotributo')) || {};
      const monoP = parseFloat(mono.pct) || 0;
      const tc = parseFloat(fin.tipo_cambio) || 1500;
      const pIdx = {}; for (const p of products) pIdx[p.id] = p;
      const filas = [];
      for (const v of Object.values(vp)) {
        if (!v || v.cancelada) continue;
        const p = v.prodId ? pIdx[v.prodId] : null;
        const qty = v.qty || 1, total = v.total || 0, neto = v.neto || 0;
        const cMerc = p ? costoPesos(p, qty, tc).costo : 0;
        const imp = total * (mlExtraPct(v.cuenta) + monoP) / 100;
        const costo = cMerc + imp;
        const mg = costo > 0 ? (neto - costo) / costo * 100 : null;
        filas.push({ nom: (v.prod || '?').slice(0, 30), cuenta: v.cuenta || '?', qty, total, neto,
          cMerc, imp, costo, mg, ratio: total > 0 ? neto / total * 100 : 0, mla: v.mla || '' });
      }
      console.log(`=== MARGEN DEL ${dia.replace(/_/g, '-')} · ${filas.length} ventas ===\n`);
      if (!filas.length) { console.log('Sin ventas cargadas todavía en ese día.'); return; }
      filas.sort((a, b) => (a.mg ?? 999) - (b.mg ?? 999));
      for (const f of filas) {
        const flag = f.mg == null ? '  (sin costo)' : f.mg < 30 ? '  ← ABAJO DEL PISO' : '';
        console.log(`  ${f.mg == null ? '  ?' : String(Math.round(f.mg)).padStart(4)}% · ${f.cuenta.padEnd(8)} · x${f.qty} · ${f.nom}${flag}`);
        console.log(`        precio ${money(Math.round(f.total))} → neto ${money(Math.round(f.neto))} (${f.ratio.toFixed(1)}%) · costo ${money(Math.round(f.cMerc))} + imp ${money(Math.round(f.imp))} = ${money(Math.round(f.costo))}`);
      }
      const conCosto = filas.filter((f) => f.mg != null);
      const sNeto = conCosto.reduce((s2, f) => s2 + f.neto, 0);
      const sCosto = conCosto.reduce((s2, f) => s2 + f.costo, 0);
      const bajo = conCosto.filter((f) => f.mg < 30);
      console.log(`\n── RESUMEN ──`);
      console.log(`  Margen del día: ${sCosto > 0 ? ((sNeto - sCosto) / sCosto * 100).toFixed(1) : '—'}%  (neto ${money(Math.round(sNeto))} sobre costo ${money(Math.round(sCosto))})`);
      console.log(`  Abajo del piso: ${bajo.length} de ${conCosto.length} ventas`);
      if (bajo.length) {
        const arrastre = bajo.reduce((s2, f) => s2 + (f.costo * 0.30 - (f.neto - f.costo)), 0);
        console.log(`  Esas ${bajo.length} restan ${money(Math.round(arrastre))} para llegar al 30% del día.`);
      }
      console.log(`  (impuestos usados: IIBB por cuenta + monotributo ${monoP.toFixed(2)}%)`);
      return;
    }
    // BILLING_PROBE=capital → foto del capital de CYC: stock, efectivo, deudas y los dólares de los
    // socios. Sirve para decidir si conviene sacar plata del negocio o dejarla trabajando.
    if (String(process.env.BILLING_PROBE || '') === 'capital') {
      const fin = (await db.get('cyc/finanzas')) || {};
      const inv = (await db.get('cyc/inventory')) || {};
      const tc = parseFloat(fin.tipo_cambio) || 1500;
      const pIdx = {}; for (const p of products) pIdx[p.id] = p;
      let stock = 0, unidades = 0;
      for (const [k, v] of Object.entries(inv)) {
        if (k.includes('__v__')) continue;
        const q = parseInt(v) || 0; if (q <= 0) continue;
        const p = pIdx[k.split('__')[0]]; if (!p) continue;
        stock += costoPesos(p, q, tc).costo; unidades += q;
      }
      // OJO: cyc/finanzas está TODO en DÓLARES (igual que el arqueo de la app). El stock de arriba
      // sale en pesos, así que acá se pasa a dólares para poder sumar y restar sin mezclar monedas.
      const n = (k) => parseFloat(fin[k]) || 0;
      const stockUSD = tc > 0 ? stock / tc : 0;
      const u = (x) => 'US$ ' + Math.round(x).toLocaleString('es-AR');
      console.log(`=== CAPITAL DE CYC · todo en DÓLARES · dólar ${money(tc)} ===\n`);
      console.log(`── LO QUE TIENE ──`);
      console.log(`  Mercadería en stock: ${u(stockUSD).padStart(14)}  (${unidades} unidades · ${money(Math.round(stock))})`);
      const campos = [['of_viejo', 'Oficina CYC'], ['of_mia', 'Oficina Mati'], ['vendedores', 'Vendedores'],
        ['efectivo', 'Efectivo'], ['mp', 'Mercado Pago'], ['banco', 'Banco'], ['deben', 'Nos deben']];
      let otros = 0;
      for (const [k, lbl] of campos) { const v = n(k); if (v) { console.log(`  ${lbl.padEnd(20)} ${u(v).padStart(14)}`); otros += v; } }
      console.log(`  ${'─'.repeat(36)}`);
      console.log(`  TOTAL activos:       ${u(stockUSD + otros).padStart(14)}   (${money(Math.round((stockUSD + otros) * tc))})`);
      console.log(`\n── LO QUE DEBE ──`);
      let deudas = 0;
      for (const [k, lbl] of [['deuda_cyc', 'Deuda de CYC'], ['tarjeta', 'Tarjeta'],
        ['dolares_mati', 'Dólares de Mati'], ['dolares_tito', 'Dólares del viejo']]) {
        const v = Math.abs(n(k)); if (v) { console.log(`  ${lbl.padEnd(20)} ${u(v).padStart(14)}`); deudas += v; }
      }
      console.log(`  ${'─'.repeat(36)}`);
      console.log(`  TOTAL deudas:        ${u(deudas).padStart(14)}   (${money(Math.round(deudas * tc))})`);
      const patr = stockUSD + otros - deudas;
      console.log(`\n  PATRIMONIO NETO:     ${u(patr).padStart(14)}   (${money(Math.round(patr * tc))})`);
      const propio = Math.abs(n('dolares_mati')) + Math.abs(n('dolares_tito'));
      if (propio) console.log(`  De las deudas, ${u(propio)} son los dólares de ustedes (no es plata de terceros).`);
      // Cuánto dura el stock al ritmo de compra actual
      const vp = (await db.get('cyc/ventaprod')) || {};
      const desde = dayKeyFromISO(Date.now() - 59 * 864e5);
      let costoVendido = 0;
      for (const [k, ents] of Object.entries(vp)) {
        if (k < desde) continue;
        for (const v of Object.values(ents || {})) { if (v && !v.cancelada) costoVendido += v.costo || 0; }
      }
      const porMes = costoVendido / 2;
      console.log(`\n── QUÉ TAN RÁPIDO SE CONSUME ──`);
      console.log(`  Mercadería vendida (costo): ${money(Math.round(porMes))}/mes`);
      if (porMes > 0) console.log(`  El stock actual alcanza para ${(stock / porMes).toFixed(1)} meses de venta.`);
      return;
    }
    // BILLING_PROBE=mono → mide cuánto pesa el MONOTRIBUTO sobre la facturación, para poder cargarlo
    // como un % en el costo de cada producto (igual que el cargo de ML). Va sobre el PRECIO de venta
    // porque es la facturación la que define la categoría, no el costo. Muestra mes por mes, el
    // promedio ponderado, y si los gastos están separados por cuenta o vienen en un solo monto.
    if (String(process.env.BILLING_PROBE || '').startsWith('mono')) {
      const vp = (await db.get('cyc/ventaprod')) || {};
      const compras = (await db.get('cyc/compras')) || {};
      // Facturación por mes y por cuenta
      const facMes = {}, facCta = {}, facMesCta = {};
      for (const [k, ents] of Object.entries(vp)) {
        const ym = k.slice(0, 7);
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada) continue;
          const tot = v.total || 0; if (tot <= 0) continue;
          const c = (v.cuenta || '?').toLowerCase();
          facMes[ym] = (facMes[ym] || 0) + tot;
          facCta[c] = (facCta[c] || 0) + tot;
          (facMesCta[ym] = facMesCta[ym] || {})[c] = (facMesCta[ym][c] || 0) + tot;
        }
      }
      // Gastos de monotributo por mes (y el detalle, para ver si están separados por cuenta)
      const monoMes = {}, detalle = [];
      for (const g of Object.values(compras)) {
        if (!g || g.tipo === 'mercaderia') continue;
        const cat = (g.cat || '').toLowerCase();
        if (!/monotributo|impuesto/.test(cat)) continue;
        const ym = (g.dayKey || '').slice(0, 7); if (!ym) continue;
        monoMes[ym] = (monoMes[ym] || 0) + (g.monto || 0);
        detalle.push({ ym, monto: g.monto || 0, desc: (g.desc || '').slice(0, 50), cat: g.cat || '' });
      }
      const meses = [...new Set([...Object.keys(monoMes), ...Object.keys(facMes)])].sort();
      console.log('=== ¿CUÁNTO PESA EL MONOTRIBUTO SOBRE LA FACTURACIÓN? ===');
      console.log('Va sobre el PRECIO de venta: la facturación es la que define la categoría.\n');
      console.log('  mes       monotributo    facturación        %');
      let mTot = 0, fTot = 0;
      for (const ym of meses) {
        const mo = monoMes[ym] || 0, fa = facMes[ym] || 0;
        if (!mo && !fa) continue;
        const pct = fa > 0 ? mo / fa * 100 : null;
        console.log(`  ${ym}  ${money(Math.round(mo)).padStart(12)}  ${money(Math.round(fa)).padStart(14)}   ${pct != null ? pct.toFixed(2) + '%' : '—'}`);
        if (mo > 0 && fa > 0) { mTot += mo; fTot += fa; }
      }
      console.log(`\n  PROMEDIO PONDERADO (solo meses con ambos datos): ${fTot > 0 ? (mTot / fTot * 100).toFixed(2) : '—'}%`);
      console.log(`  (monotributo ${money(Math.round(mTot))} sobre facturación ${money(Math.round(fTot))})`);
      console.log('\n── DETALLE DE LOS GASTOS CARGADOS (para ver si están separados por cuenta) ──');
      for (const d of detalle.sort((a, b) => a.ym.localeCompare(b.ym))) {
        console.log(`  ${d.ym} · ${money(Math.round(d.monto)).padStart(11)} · [${d.cat}] ${d.desc}`);
      }
      console.log('\n── FACTURACIÓN POR CUENTA (todo el histórico cargado) ──');
      const totCta = Object.values(facCta).reduce((s, x) => s + x, 0);
      for (const [c, v] of Object.entries(facCta).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${c.padEnd(10)} ${money(Math.round(v)).padStart(14)}  (${(v / totCta * 100).toFixed(1)}% del total)`);
      }
      console.log(`\n  Si el monotributo se reparte por facturación, cada cuenta aporta en esa proporción.`);
      console.log(`  Para un % POR CUENTA hace falta saber cuánto paga de monotributo cada una por mes.`);
      return;
    }
    // BILLING_PROBE=umbral → busca el PRECIO A PARTIR DEL CUAL ML pone envío gratis obligatorio
    // (lo paga el vendedor). En vez de preguntarle a un endpoint, lo deduce de TUS publicaciones:
    // lista todas por precio con su bandera free_shipping. El corte se ve solo. Es el dato que decide
    // si una suba de precio conviene o hunde el margen al cruzar ese punto.
    if (String(process.env.BILLING_PROBE || '') === 'umbral') {
      const links = (await db.get('cyc/mllinks')) || {};
      const filas = [];
      for (const label of labels) {
        const acc = accounts[label]; if (!acc?.refresh_token) continue;
        let t; try { t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token); } catch { continue; }
        await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
        const ids = Object.entries(links)
          .filter(([mla, e]) => e && e.cuenta === label && !e.ignored && /^MLA/i.test(mla))
          .map(([mla]) => mla);
        for (let k = 0; k < ids.length; k += 20) {
          let arr;
          try { arr = await mlGet('/items?ids=' + ids.slice(k, k + 20).join(',') + '&attributes=id,status,price,title,shipping', t.access_token); } catch { continue; }
          for (const row of (arr || [])) {
            const b = row.body || {}; if (!b.id || b.status !== 'active' || !b.price) continue;
            filas.push({ label, mla: b.id, precio: b.price, free: !!(b.shipping && b.shipping.free_shipping),
              lt: (b.shipping && b.shipping.logistic_type) || '?', nom: (b.title || '').slice(0, 40) });
          }
        }
      }
      filas.sort((a, b) => a.precio - b.precio);
      console.log(`=== ¿DESDE QUÉ PRECIO ML OBLIGA A ENVÍO GRATIS? · ${filas.length} publicaciones activas ===`);
      console.log(`Ordenadas por precio. "SÍ" = el envío lo pagás vos.\n`);
      let ultimoNo = null, primerSi = null;
      for (const f of filas) {
        if (!f.free) ultimoNo = f;
        if (f.free && !primerSi) primerSi = f;
        console.log(`  ${money(Math.round(f.precio)).padStart(11)} · envío gratis ${f.free ? 'SÍ ' : 'no '} · ${f.lt.padEnd(12)} · ${f.label.padEnd(8)} · ${f.nom}`);
      }
      console.log(`\n── DÓNDE ESTÁ EL CORTE ──`);
      // El más caro SIN envío gratis y el más barato CON envío gratis acotan el umbral.
      const masCaroSin = [...filas].filter((f) => !f.free).sort((a, b) => b.precio - a.precio)[0];
      const masBaratoCon = filas.filter((f) => f.free)[0];
      if (masCaroSin) console.log(`  El más CARO sin envío gratis:  ${money(Math.round(masCaroSin.precio))} · ${masCaroSin.nom}`);
      if (masBaratoCon) console.log(`  El más BARATO con envío gratis: ${money(Math.round(masBaratoCon.precio))} · ${masBaratoCon.nom}`);
      if (masCaroSin && masBaratoCon) {
        if (masBaratoCon.precio > masCaroSin.precio) console.log(`  → El umbral está entre ${money(Math.round(masCaroSin.precio))} y ${money(Math.round(masBaratoCon.precio))}.`);
        else console.log(`  → Se superponen: el envío gratis no depende solo del precio (puede estar puesto a mano en algunas).`);
      }
      console.log(`\n  Con envío gratis: ${filas.filter((f) => f.free).length} · Sin envío gratis: ${filas.filter((f) => !f.free).length}`);
      return;
    }
    // BILLING_PROBE=envio:<palabra> → averigua A PARTIR DE QUÉ PRECIO ML obliga a poner envío gratis
    // (que lo paga el vendedor) y cuánto cuesta. Es el dato que falta para no proponer una suba que
    // cruce ese umbral sin darse cuenta: ahí el margen se desploma en vez de mejorar.
    // Consulta /users/{id}/shipping_options/free a varios precios y muestra la respuesta cruda.
    if (String(process.env.BILLING_PROBE || '').startsWith('envio')) {
      const kw = (String(process.env.BILLING_PROBE).split(':')[1] || '').trim().toLowerCase();
      const links = (await db.get('cyc/mllinks')) || {};
      let crudo = false, vistos = 0;
      for (const label of labels) {
        if (vistos >= 3) break;
        const acc = accounts[label]; if (!acc?.refresh_token || !acc.seller_id) continue;
        let t; try { t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token); } catch { continue; }
        await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
        const ids = Object.entries(links)
          .filter(([mla, e]) => e && e.cuenta === label && !e.ignored && e.prodId && /^MLA/i.test(mla)
            && (!kw || (e.title || '').toLowerCase().includes(kw)))
          .map(([mla]) => mla).slice(0, 3);
        for (const mla of ids) {
          if (vistos >= 3) break;
          let it; try { it = await mlGet('/items/' + mla + '?attributes=id,title,price,status,shipping,listing_type_id,category_id,site_id', t.access_token); } catch { continue; }
          if (it.status !== 'active') continue;
          console.log(`── ${label} · ${mla} · ${(it.title || '').slice(0, 44)}`);
          console.log(`   precio HOY ${money(Math.round(it.price))} · tipo ${it.listing_type_id} · categoría ${it.category_id}`);
          console.log(`   shipping del item: ${JSON.stringify(it.shipping || {})}`);
          const lt = (it.shipping && it.shipping.logistic_type) || 'fulfillment';
          // Precios de prueba alrededor del umbral sospechado (entre $32.000 y $57.000).
          const pruebas = [...new Set([Math.round(it.price), 25000, 31999, 33020, 36000, 40000, 57000].map(Number))].sort((a, b) => a - b);
          for (const pr of pruebas) {
            const qs = `item_price=${pr}&listing_type_id=${it.listing_type_id}&mode=me2&condition=new`
              + `&logistic_type=${lt}&category_id=${it.category_id}&currency_id=ARS&verbose=true`;
            let r = null, err = '';
            try { r = await mlGet(`/users/${acc.seller_id}/shipping_options/free?${qs}`, t.access_token); }
            catch (e) { err = String(e.message || e).slice(0, 150); }
            if (r && !crudo) { console.log('\n   RESPUESTA CRUDA DE ML (para verificar los campos):\n' + JSON.stringify(r, null, 2).split('\n').map((x) => '   ' + x).join('\n') + '\n'); crudo = true; }
            const costo = r?.coverage?.all_country?.list_cost ?? r?.options?.[0]?.list_cost ?? null;
            const bill = r?.coverage?.all_country?.billable_weight ?? null;
            console.log(`   precio ${money(pr).padStart(11)} → envío gratis: ${costo != null ? money(Math.round(costo)) : (err ? 'ERROR ' + err : 'no aplica / sin costo')}${bill != null ? ' · peso facturable ' + bill : ''}`);
          }
          console.log('');
          vistos++;
        }
      }
      if (!vistos) console.log('No encontré publicaciones activas que coincidan.');
      return;
    }
    // BILLING_PROBE=mlfee:<palabra> → le pregunta a ML cuánto cobra de comisión a un precio dado
    // (endpoint oficial /sites/MLA/listing_prices) y lo compara contra lo que realmente pasó en la
    // última venta de esa publicación. De ahí sale el ENVÍO (que es un monto fijo, no un %):
    //     envío = precio_venta − neto_venta − comisión_a_ese_precio
    // Con comisión exacta + envío fijo, el neto de cualquier precio nuevo se calcula sin estimar nada.
    // Diagnóstico: muestra la respuesta cruda de ML para poder verificar los campos.
    if (String(process.env.BILLING_PROBE || '').startsWith('mlfee')) {
      const kw = (String(process.env.BILLING_PROBE).split(':')[1] || '').trim().toLowerCase();
      const vp = (await db.get('cyc/ventaprod')) || {};
      const links = (await db.get('cyc/mllinks')) || {};
      // Última venta por publicación (mla)
      const ult = {};
      for (const [k, ents] of Object.entries(vp)) {
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada || !v.mla) continue;
          const tot = v.total || 0, net = v.neto || 0, q = v.qty || 1;
          if (tot <= 0 || net <= 0) continue;
          const cur = ult[v.mla];
          if (!cur || k > cur.dk) ult[v.mla] = { dk: k, unit: tot / q, neto: net / q, cuenta: v.cuenta || '?' };
        }
      }
      const feeDe = async (site, price, ltype, cat, token) => {
        try {
          const d = await mlGet(`/sites/${site}/listing_prices?price=${Math.round(price)}&listing_type_id=${ltype}&category_id=${cat}`, token);
          const o = Array.isArray(d) ? d[0] : d;
          return { raw: o, fee: o?.sale_fee_amount ?? null, det: o?.sale_fee_details || null };
        } catch (e) { return { err: String(e.message || e).slice(0, 120) }; }
      };
      let mostrados = 0, crudoMostrado = false;
      for (const label of labels) {
        if (mostrados >= 8) break;
        const acc = accounts[label]; if (!acc?.refresh_token) continue;
        let t; try { t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token); } catch { continue; }
        await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
        const ids = Object.entries(links)
          .filter(([mla, e]) => e && e.cuenta === label && !e.ignored && e.prodId && /^MLA/i.test(mla)
            && (!kw || (e.title || '').toLowerCase().includes(kw)))
          .map(([mla]) => mla).slice(0, 6);
        for (const mla of ids) {
          if (mostrados >= 8) break;
          let it; try { it = await mlGet('/items/' + mla + '?attributes=id,title,price,status,listing_type_id,category_id,site_id', t.access_token); } catch { continue; }
          if (it.status !== 'active' || !it.price) continue;
          const site = it.site_id || 'MLA';
          const fHoy = await feeDe(site, it.price, it.listing_type_id, it.category_id, t.access_token);
          if (!crudoMostrado && fHoy.raw) { console.log('RESPUESTA CRUDA DE ML (para verificar los campos):\n' + JSON.stringify(fHoy.raw, null, 2) + '\n'); crudoMostrado = true; }
          console.log(`── ${label} · ${mla} · ${(it.title || '').slice(0, 44)}`);
          console.log(`   tipo ${it.listing_type_id} · categoría ${it.category_id}`);
          console.log(`   precio HOY ${money(Math.round(it.price))} → comisión ML ${fHoy.fee != null ? money(Math.round(fHoy.fee)) + ' (' + (fHoy.fee / it.price * 100).toFixed(1) + '%)' : 'ERROR ' + (fHoy.err || '')}`);
          const u = ult[mla];
          if (u && fHoy.fee != null) {
            const fVta = await feeDe(site, u.unit, it.listing_type_id, it.category_id, t.access_token);
            if (fVta.fee != null) {
              const envio = u.unit - u.neto - fVta.fee;
              const netoCalc = it.price - fHoy.fee - envio;
              console.log(`   última venta ${u.dk.replace(/_/g, '-')}: precio ${money(Math.round(u.unit))} · neto real ${money(Math.round(u.neto))}`);
              console.log(`      comisión ML a ESE precio ${money(Math.round(fVta.fee))}  →  ENVÍO deducido = ${money(Math.round(envio))}`);
              console.log(`      ⇒ neto estimado al precio de HOY = ${money(Math.round(netoCalc))} (${(netoCalc / it.price * 100).toFixed(1)}% del precio)`);
            } else console.log(`   (no pude pedir la comisión al precio de la venta: ${fVta.err || ''})`);
          } else if (!u) console.log(`   (sin ventas registradas de esta publicación → no puedo deducir el envío)`);
          console.log('');
          mostrados++;
        }
      }
      if (!mostrados) console.log('No encontré publicaciones activas que coincidan.');
      return;
    }
    // BILLING_PROBE=chkneto[:<palabra>][:<YYYY_MM,...>] → mira qué tan CONFIABLE es estimar el neto
    // como "precio × relación neto/precio del producto". Si esa relación varía mucho entre ventas del
    // MISMO producto (envío gratis vs pago, promos, precios distintos), la estimación del barrido de
    // precios no sirve. Muestra la dispersión por producto y, con palabra, cada venta una por una.
    if (String(process.env.BILLING_PROBE || '').startsWith('chkneto')) {
      const _cn = String(process.env.BILLING_PROBE).split(':');
      const kw = (_cn[1] || '').trim().toLowerCase();
      const pickYM = (_cn[2] || '2026_06,2026_07').split(',').map((s) => s.trim()).filter(Boolean);
      const vp = (await db.get('cyc/ventaprod')) || {};
      const byProd = {};
      for (const [k, ents] of Object.entries(vp)) {
        if (!pickYM.includes(k.slice(0, 7))) continue;
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada || !v.prodId) continue;
          const tot = v.total || 0, net = v.neto || 0;
          if (tot <= 0 || net <= 0) continue;
          const b = byProd[v.prodId] || (byProd[v.prodId] = { nom: v.prod || v.prodId, ventas: [] });
          b.ventas.push({ dk: k, tot, net, qty: v.qty || 1, cuenta: v.cuenta || '?', r: net / tot });
        }
      }
      const med = (a) => { const s = [...a].sort((x, y) => x - y); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
      if (kw) {
        console.log(`=== VENTAS DE "${kw}" · ${pickYM.join(', ')} ===\n`);
        for (const b of Object.values(byProd)) {
          if (!b.nom.toLowerCase().includes(kw)) continue;
          const rs = b.ventas.map((v) => v.r);
          console.log(`── ${b.nom} · ${b.ventas.length} ventas ──`);
          console.log(`   fecha        cuenta    precio     neto     neto/precio   qty`);
          for (const v of b.ventas.sort((a, c) => a.dk.localeCompare(c.dk))) {
            console.log(`   ${v.dk.replace(/_/g, '-')}  ${v.cuenta.padEnd(8)} ${money(Math.round(v.tot)).padStart(10)} ${money(Math.round(v.net)).padStart(9)}     ${(v.r * 100).toFixed(1)}%`.padEnd(72) + `  x${v.qty}`);
          }
          const prom = rs.reduce((s, x) => s + x, 0) / rs.length;
          console.log(`   → promedio ponderado ${(b.ventas.reduce((s, v) => s + v.net, 0) / b.ventas.reduce((s, v) => s + v.tot, 0) * 100).toFixed(1)}% · simple ${(prom * 100).toFixed(1)}% · mínimo ${(Math.min(...rs) * 100).toFixed(1)}% · máximo ${(Math.max(...rs) * 100).toFixed(1)}%\n`);
        }
        return;
      }
      const rows = [];
      for (const b of Object.values(byProd)) {
        if (b.ventas.length < 3) continue;
        const rs = b.ventas.map((v) => v.r);
        const mn = Math.min(...rs), mx = Math.max(...rs);
        const pond = b.ventas.reduce((s, v) => s + v.net, 0) / b.ventas.reduce((s, v) => s + v.tot, 0);
        rows.push({ nom: b.nom, n: b.ventas.length, mn, mx, pond, med: med(rs), spread: (mx - mn) * 100 });
      }
      rows.sort((a, b) => b.spread - a.spread);
      console.log(`=== ¿SIRVE ESTIMAR EL NETO CON UNA RELACIÓN PROMEDIO? · ${rows.length} productos con 3+ ventas ===`);
      console.log(`Si la relación neto/precio varía mucho DENTRO del mismo producto, la estimación no sirve.\n`);
      console.log(`  dispersión   mín     máx    ponder.  mediana   vtas  producto`);
      for (const r of rows.slice(0, 30)) {
        console.log(`   ${r.spread.toFixed(1)} pts`.padEnd(14) + `${(r.mn * 100).toFixed(1)}%`.padStart(7) + `${(r.mx * 100).toFixed(1)}%`.padStart(8)
          + `${(r.pond * 100).toFixed(1)}%`.padStart(9) + `${(r.med * 100).toFixed(1)}%`.padStart(9) + `${r.n}`.padStart(6) + `  ${r.nom.slice(0, 34)}`);
      }
      const anchos = rows.filter((r) => r.spread >= 10).length;
      console.log(`\n${anchos} de ${rows.length} productos tienen más de 10 puntos de dispersión → en esos, estimar el neto con un promedio da un margen poco confiable.`);
      return;
    }
    // BILLING_PROBE=chkcosto[:<YYYY_MM,...>] → COMPARA el costo que usa el ROBOT contra el que usa la
    // APP, producto por producto. La app prioriza RECALCULAR (costUSD × (1+%reclamos) + envío) y solo
    // usa costFullUSD si el producto no tiene envío/devPct/reclamos; el robot hace lo CONTRARIO
    // (prioriza costFullUSD guardado). Si ese campo quedó viejo, el robot ve un costo distinto y por
    // lo tanto un margen distinto. Esto muestra en cuántos productos pasa y cuánto pesa.
    if (String(process.env.BILLING_PROBE || '').startsWith('chkcosto')) {
      const pickYM = (String(process.env.BILLING_PROBE).split(':')[1] || '2026_06,2026_07').split(',').map((s) => s.trim()).filter(Boolean);
      const vp = (await db.get('cyc/ventaprod')) || {};
      const fin = (await db.get('cyc/finanzas')) || {};
      const tc = parseFloat(fin.tipo_cambio) || 1500;
      // Reclamos y ventas por producto (mismo criterio que _statsFor de la app: TODO el historial).
      const st = {};
      for (const ents of Object.values(vp)) {
        for (const v of Object.values(ents || {})) {
          if (!v || !v.prodId) continue;
          const s = st[v.prodId] || (st[v.prodId] = { rec: 0, ven: 0 });
          const esRec = v.cancelada && (v.tipoCancelacion === 'reclamo' || v.tipoCancelacion === 'perdida');
          if (esRec) s.rec += v.qty || 1;
          else if (!v.cancelada) s.ven += v.qty || 1;
        }
      }
      // Ventas del período para saber cuánto pesa cada producto.
      const vpp = {};
      for (const [k, ents] of Object.entries(vp)) {
        if (!pickYM.includes(k.slice(0, 7))) continue;
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada || !v.prodId) continue;
          const b = vpp[v.prodId] || (vpp[v.prodId] = { n: 0, qty: 0 });
          b.n++; b.qty += v.qty || 1;
        }
      }
      const rows = [];
      for (const p of products) {
        const cu = parseFloat(p.costUSD) || 0;
        const ship = parseFloat(p.shipUSD) || 0;
        const dpStored = parseFloat(p.devPct) || 0;
        const cfu = (p.costFullUSD != null && p.costFullUSD !== '') ? (parseFloat(p.costFullUSD) || 0) : null;
        const s = st[p.id] || { rec: 0, ven: 0 };
        const devLive = s.rec > 0 && s.ven > 0 ? Math.round((s.rec / s.ven) * 1000) / 10 : 0;
        // ROBOT: costFullUSD si existe; si no, recalcula con devPct guardado.
        const robot = cfu != null ? cfu : cu * (1 + dpStored / 100) + ship;
        // APP: recalcula con reclamos EN VIVO si el producto tiene envío/devPct/reclamos; si no, costFullUSD.
        const usaRecalc = (p.shipUSD != null) || (p.devPct != null) || s.rec > 0;
        const app = usaRecalc ? Math.round((cu * (1 + devLive / 100) + ship) * 100) / 100 : (cfu != null ? cfu : cu);
        if (!robot && !app) continue;
        const gapPct = app > 0 ? (robot - app) / app * 100 : 0;
        const v = vpp[p.id] || { n: 0, qty: 0 };
        rows.push({ nom: p.name || p.id, cu, ship, dpStored, devLive, cfu, robot, app, gapPct, ventas: v.n, qty: v.qty, rec: s.rec, ven: s.ven });
      }
      const malos = rows.filter((r) => Math.abs(r.gapPct) >= 1).sort((a, b) => Math.abs(b.gapPct) - Math.abs(a.gapPct));
      const conVenta = rows.filter((r) => r.ventas > 0);
      const malosConVenta = malos.filter((r) => r.ventas > 0);
      console.log(`=== COSTO: ROBOT vs APP · ${rows.length} productos (${conVenta.length} con ventas en ${pickYM.join(', ')}) ===`);
      console.log(`Robot = costFullUSD guardado (o recalculo con devPct) · App = costUSD × (1+%reclamos en vivo) + envío\n`);
      console.log(`DIFERENCIAS ≥1%: ${malos.length} de ${rows.length} productos (${malosConVenta.length} tienen ventas)\n`);
      console.log(`  gap  robotUS$  appUS$  costUS$  envío  devGuard  devVivo  reclamos/ventas  vtas  producto`);
      for (const r of malos.slice(0, 45)) {
        console.log(`  ${(r.gapPct >= 0 ? '+' : '') + r.gapPct.toFixed(1) + '%'}`.padEnd(9)
          + `${r.robot.toFixed(2)}`.padStart(9) + `${r.app.toFixed(2)}`.padStart(8)
          + `${r.cu.toFixed(2)}`.padStart(9) + `${r.ship.toFixed(2)}`.padStart(7)
          + `${r.dpStored.toFixed(1)}%`.padStart(9) + `${r.devLive.toFixed(1)}%`.padStart(9)
          + `   ${r.rec}/${r.ven}`.padEnd(12) + `${r.ventas}`.padStart(5) + `  ${r.nom.slice(0, 32)}`);
      }
      if (malos.length > 45) console.log(`  … y ${malos.length - 45} más`);
      const pesado = malosConVenta.reduce((s, r) => s + r.ventas, 0);
      const totalV = conVenta.reduce((s, r) => s + r.ventas, 0);
      console.log(`\nPeso: ${pesado} de ${totalV} ventas del período (${totalV ? (pesado / totalV * 100).toFixed(0) : 0}%) son de productos con el costo desalineado.`);
      const sobre = malosConVenta.filter((r) => r.gapPct > 0).length, bajo = malosConVenta.filter((r) => r.gapPct < 0).length;
      console.log(`De esos: ${sobre} el robot los ve MÁS CAROS que la app (margen subestimado → subiría de más)`);
      console.log(`         ${bajo} el robot los ve MÁS BARATOS (margen sobreestimado → no subiría lo que hace falta)`);
      return;
    }
    // BILLING_PROBE=factml[:<días>] → FACTURACIÓN REAL DE CADA CUENTA, PEDIDA A ML.
    //
    // Por qué no alcanza con el panel: el panel arranca en mayo 2026, así que su "últimos 12 meses"
    // son en realidad 90 días y deja afuera todo lo anterior. Para la categoría de monotributo lo
    // que cuenta son los 12 meses de verdad, así que hay que ir a buscarlos a ML.
    // Solo LEE: suma el total de las órdenes pagadas, mes a mes y por cuenta.
    if (String(process.env.BILLING_PROBE || '').startsWith('factml')) {
      const DIAS = parseFloat(String(process.env.BILLING_PROBE).split(':')[1]) || 365;
      const CATS = [
        { c: 'G', tope: 53995798.87, cuota: 158815.05 },
        { c: 'H', tope: 81924660.37, cuota: 317895.01 },
        { c: 'I', tope: 91699761.90, cuota: 474992.78 },
        { c: 'J', tope: 105012519.20, cuota: 580793.69 },
        { c: 'K', tope: 126610838.75, cuota: 0 },
      ];
      const catDe = (a) => CATS.find((x) => a <= x.tope) || { c: 'K+ (se pasó del régimen)', tope: Infinity, cuota: 0 };
      const desdeMs = Date.now() - DIAS * 864e5;
      console.log(`=== FACTURACIÓN REAL EN ML · últimos ${DIAS} días ===`);
      console.log(`MODO PRUEBA · no se escribe nada · esto lo dice ML, no el panel\n`);
      const totalPorCuenta = {}, porMes = {};
      for (const label of labels) {
        const acc = accounts[label];
        if (!acc?.refresh_token || !acc.seller_id) { console.log(`(${label}: sin token o sin seller_id)`); continue; }
        let t; try { t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token); } catch { console.log(`(${label}: no pude renovar token)`); continue; }
        await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
        let ords;
        try { ords = await fetchOrdersRange(acc.seller_id, t.access_token, desdeMs, Date.now()); }
        catch (e) { console.log(`(${label}: ML falló — ${String(e.message || e).slice(0, 50)})`); continue; }
        let tot = 0, n = 0;
        for (const o of (ords || [])) {
          const monto = Number(o.total_amount) || 0;
          if (!monto) continue;
          tot += monto; n++;
          const ym = String(o.date_created || o.date_closed || '').slice(0, 7).replace('-', '_');
          if (ym) { porMes[ym] = porMes[ym] || {}; porMes[ym][label] = (porMes[ym][label] || 0) + monto; }
        }
        totalPorCuenta[label] = tot;
        console.log(`${label.padEnd(9)} ${money(Math.round(tot)).padStart(16)}  ·  ${n} órdenes pagadas  →  categoría ${catDe(tot).c}`);
      }
      const meses = Object.keys(porMes).sort();
      if (meses.length) {
        console.log(`\n── MES A MES (para ver desde cuándo hay datos y cómo viene creciendo) ──`);
        console.log(`  mes       ` + labels.map((l) => l.slice(0, 8).padStart(14)).join('') + '          TOTAL');
        for (const ym of meses) {
          const row = labels.map((l) => money(Math.round(porMes[ym][l] || 0)).padStart(14)).join('');
          const tm = labels.reduce((s, l) => s + (porMes[ym][l] || 0), 0);
          console.log(`  ${ym}  ${row}  ${money(Math.round(tm)).padStart(15)}`);
        }
      }
      const gran = Object.values(totalPorCuenta).reduce((s, x) => s + x, 0);
      console.log(`\n── RESUMEN ──`);
      console.log(`  TOTAL las 4 cuentas en ${DIAS} días: ${money(Math.round(gran))}`);
      const nAcc = Object.keys(totalPorCuenta).length || 1;
      const parejo = gran / nAcc;
      console.log(`  Si estuviera parejo: ${money(Math.round(parejo))} por cuenta → categoría ${catDe(parejo).c}`);
      const cuotaHoy = Object.values(totalPorCuenta).reduce((s, x) => s + catDe(x).cuota, 0);
      const cuotaParejo = catDe(parejo).cuota * nAcc;
      console.log(`\n  Cuota mensual como está:  ${money(Math.round(cuotaHoy))}`);
      console.log(`  Cuota mensual emparejado: ${money(Math.round(cuotaParejo))}`);
      const ahorro = cuotaHoy - cuotaParejo;
      console.log(`  ${ahorro > 0 ? `Emparejar ahorra ${money(Math.round(ahorro))}/mes (${money(Math.round(ahorro * 12))}/año)` : 'Emparejar no cambia la cuota: ya están todas en la misma categoría.'}`);
      console.log(`\nOJO: esto es lo FACTURADO según ML. Para AFIP cuenta lo que efectivamente facturaste vos.`);
      return;
    }
    // BILLING_PROBE=cuentas → ¿CUÁNTO FACTURA CADA CUENTA Y EN QUÉ CATEGORÍA LA DEJA?
    //
    // Hace falta para decidir la facturación automática de ML: hoy elegís a mano qué cuenta emite
    // cada factura, así que podés emparejarlas. Con el automático cada cuenta factura lo que vende,
    // y si una ya está cerca del tope de su categoría se pasa sola.
    //
    // Mira dos cosas por cuenta: lo facturado en los últimos 12 meses (lo que mira AFIP para
    // recategorizar) y el ritmo de los últimos 3 meses anualizado (hacia dónde va). Solo LEE.
    if (String(process.env.BILLING_PROBE || '') === 'cuentas') {
      // Topes anuales de monotributo 2026, "venta de cosas muebles". Actualizar cuando AFIP los mueva.
      const CATS = [
        { c: 'G', tope: 53995798.87, cuota: 158815.05 },
        { c: 'H', tope: 81924660.37, cuota: 317895.01 },
        { c: 'I', tope: 91699761.90, cuota: 474992.78 },
        { c: 'J', tope: 105012519.20, cuota: 580793.69 },
        { c: 'K', tope: 126610838.75, cuota: 0 },
      ];
      const catDe = (anual) => CATS.find((x) => anual <= x.tope) || { c: 'K+', tope: Infinity, cuota: 0 };
      const vp = (await db.get('cyc/ventaprod')) || {};
      const desde12 = dayKeyFromISO(Date.now() - 365 * 864e5);
      const desde3 = dayKeyFromISO(Date.now() - 90 * 864e5);
      const acc12 = {}, acc3 = {};
      for (const [k, ents] of Object.entries(vp)) {
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada) continue;
          const c = v.cuenta || '(sin cuenta)';
          if (k >= desde12) acc12[c] = (acc12[c] || 0) + (v.total || 0);
          if (k >= desde3) acc3[c] = (acc3[c] || 0) + (v.total || 0);
        }
      }
      console.log(`=== FACTURACIÓN POR CUENTA Y CATEGORÍA DE MONOTRIBUTO ===`);
      console.log(`MODO PRUEBA · no se escribe nada\n`);
      const nombres = [...new Set([...Object.keys(acc12), ...Object.keys(acc3)])].sort();
      const filas = [];
      for (const c of nombres) {
        const a12 = acc12[c] || 0;
        const ritmo = (acc3[c] || 0) * 4;          // últimos 90 días × 4 = ritmo anual
        const cat12 = catDe(a12), catR = catDe(ritmo);
        filas.push({ c, a12, ritmo, cat12, catR });
      }
      filas.sort((a, b) => b.ritmo - a.ritmo);
      for (const f of filas) {
        const falta = f.catR.tope - f.ritmo;
        const medio = f.catR.tope - (f.catR.tope - (CATS[CATS.indexOf(f.catR) - 1]?.tope || 0)) / 2;
        console.log(`${f.c}`);
        console.log(`   últimos 12 meses  ${money(Math.round(f.a12)).padStart(15)}  → categoría ${f.cat12.c}`);
        console.log(`   ritmo actual (×4) ${money(Math.round(f.ritmo)).padStart(15)}  → categoría ${f.catR.c}${f.catR.cuota ? ` · cuota ${money(Math.round(f.catR.cuota))}/mes` : ''}`);
        console.log(`   le falta ${money(Math.round(falta))} para pasar a la siguiente`
          + ` · el medio de la ${f.catR.c} son ${money(Math.round(medio))}`
          + (f.ritmo > medio ? '  ⚠️ está arriba del medio' : ''));
        console.log('');
      }
      const totalR = filas.reduce((s, f) => s + f.ritmo, 0);
      const parejo = totalR / (filas.length || 1);
      console.log(`── SI ESTUVIERA PAREJO ──`);
      console.log(`  Total al ritmo actual: ${money(Math.round(totalR))}/año · parejo serían ${money(Math.round(parejo))} por cuenta → categoría ${catDe(parejo).c}\n`);
      console.log(`── CUÁNTO HAY QUE MOVER PARA EMPAREJARLAS ──`);
      for (const f of filas) {
        const dif = f.ritmo - parejo;
        console.log(`  ${f.c.padEnd(10)} ${dif > 0 ? 'sacarle ' : 'darle   '} ${money(Math.round(Math.abs(dif))).padStart(15)} al año`
          + ` (${money(Math.round(Math.abs(dif) / 12))} por mes)`);
      }
      console.log(`\nOJO: mover facturación = mover PUBLICACIONES de una cuenta a otra. Antes de activar`);
      console.log(`la facturación automática de ML conviene que ninguna esté arriba del medio de su categoría.`);
      return;
    }
    // BILLING_PROBE=costomes[:<YYYY_MM>] → ¿CON QUÉ COSTO ESTÁ VALUANDO LA WEB LO VENDIDO?
    //
    // La web NO usa el costo actual del producto: si el mes tiene cargado un "precio histórico"
    // (cyc/precios_hist_prod/<mes>/<prodId>), usa ESE. Si ese histórico quedó viejo, todas las ventas
    // del mes se valúan con un costo más barato del real y la ganancia del mes sale inflada — sin que
    // nada avise. Este probe compara, producto por producto:
    //   · el costo HISTÓRICO cargado para el mes  (el que usa la web)
    //   · el costo ACTUAL del producto             (lo que vale hoy)
    //   · el costo CONGELADO en cada venta         (lo que se guardó el día de la venta)
    // y dice cuánta ganancia del mes se explica por la diferencia. Solo LEE.
    if (String(process.env.BILLING_PROBE || '').startsWith('costomes')) {
      const ym = (String(process.env.BILLING_PROBE).split(':')[1] || '').trim()
        || (() => { const d = new Date(); return d.getFullYear() + '_' + String(d.getMonth() + 1).padStart(2, '0'); })();
      const vp = (await db.get('cyc/ventaprod')) || {};
      const hist = ((await db.get('cyc/precios_hist_prod')) || {})[ym] || {};
      const tcMes = (await db.get('cyc/tc_mes')) || {};
      const fin = (await db.get('cyc/finanzas')) || {};
      const tcAhora = parseFloat(fin.tipo_cambio) || 1500;
      const tcDelMes = parseFloat(tcMes[ym]) || tcAhora;
      const monoPct = parseFloat(((await db.get('cyc/monotributo')) || {}).pct) || 0;
      const comprasMes = (await db.get('cyc/compras')) || {};
      const retiroMes = (await db.get('cyc/retiro_mes')) || {};
      const pIdx = {}; for (const p of products) pIdx[p.id] = p;
      // Ventas del mes, agrupadas por producto.
      const porProd = {};
      for (const [k, ents] of Object.entries(vp)) {
        if (k.slice(0, 7) !== ym) continue;
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada || !v.prodId) continue;
          const b = porProd[v.prodId] || (porProd[v.prodId] = { nom: v.prod || v.prodId, qty: 0, n: 0, congelado: 0, neto: 0 });
          b.qty += v.qty || 1; b.n++; b.congelado += v.costo || 0; b.neto += v.neto || 0;
          b.bruto = (b.bruto || 0) + (v.total || 0);
          // Impuestos igual que la web: IIBB de la cuenta + monotributo, sobre el precio de venta.
          b.imp = (b.imp || 0) + (v.total || 0) * (mlExtraPct(v.cuenta) + monoPct) / 100;
        }
      }
      console.log(`=== CON QUÉ COSTO SE VALÚA ${ym} ===`);
      console.log(`Dólar del mes: ${money(tcDelMes)}${tcMes[ym] ? '' : ' (no hay dólar cargado para el mes → usa el de Finanzas)'} · dólar de Finanzas: ${money(tcAhora)}`);
      console.log(`Precios históricos cargados para ${ym}: ${Object.keys(hist).length} productos\n`);
      const filas = [];
      for (const [pid, b] of Object.entries(porProd)) {
        const p = pIdx[pid]; if (!p) continue;
        const dev = parseFloat(p.devPct) || 0;
        const ship = parseFloat(p.shipUSD) || 0;
        const histUSD = hist[pid] != null ? parseFloat(hist[pid]) : null;
        const actualUSD = parseFloat(p.costUSD) || 0;
        const usaUSD = histUSD != null ? histUSD : actualUSD;
        const aPesos = (u) => (u * (1 + dev / 100) + ship) * tcDelMes * b.qty;
        const usaWeb = aPesos(usaUSD);          // lo que la web descuenta hoy
        const conActual = aPesos(actualUSD);    // lo que descontaría con el costo de hoy
        filas.push({
          nom: b.nom, qty: b.qty, n: b.n, neto: b.neto, imp: b.imp || 0, bruto: b.bruto || 0,
          histUSD, actualUSD, usaWeb, conActual, congelado: b.congelado,
          gapActual: conActual - usaWeb,        // + = la web está descontando de MENOS
          gapCongelado: usaWeb - b.congelado,   // + = la web descuenta MÁS que lo guardado en la venta
        });
      }
      filas.sort((a, b2) => Math.abs(b2.gapActual) - Math.abs(a.gapActual));
      const conHist = filas.filter((f) => f.histUSD != null);
      const desalineados = filas.filter((f) => f.histUSD != null && Math.abs(f.histUSD - f.actualUSD) > 0.001);
      console.log(`── PRODUCTOS CON PRECIO HISTÓRICO DISTINTO AL ACTUAL (${desalineados.length}) ──`);
      if (!desalineados.length) console.log('  Ninguno: el histórico del mes coincide con el costo de hoy.');
      for (const f of desalineados.slice(0, 30)) {
        const signo = f.gapActual > 0 ? 'la web descuenta DE MENOS' : 'la web descuenta DE MÁS';
        console.log(`  US$${f.histUSD.toFixed(2)} (histórico) vs US$${f.actualUSD.toFixed(2)} (hoy) · ${f.qty} u. · ${signo} ${money(Math.round(Math.abs(f.gapActual)))} · ${f.nom.slice(0, 38)}`);
      }
      if (desalineados.length > 30) console.log(`  … y ${desalineados.length - 30} más`);
      const totWeb = filas.reduce((s, f) => s + f.usaWeb, 0);
      const totActual = filas.reduce((s, f) => s + f.conActual, 0);
      const totCong = filas.reduce((s, f) => s + f.congelado, 0);
      const totNeto = filas.reduce((s, f) => s + f.neto, 0);
      console.log(`\n── TOTALES DEL MES (${filas.length} productos con ventas, sin impuestos) ──`);
      console.log(`  Costo que usa la WEB hoy            ${money(Math.round(totWeb))}`);
      console.log(`  Costo con el precio ACTUAL          ${money(Math.round(totActual))}   → diferencia ${money(Math.round(totActual - totWeb))}`);
      console.log(`  Costo CONGELADO en las ventas       ${money(Math.round(totCong))}   → diferencia ${money(Math.round(totWeb - totCong))}`);
      console.log(`  Neto del mes                        ${money(Math.round(totNeto))}`);
      console.log(`\n  Si el costo correcto fuera el ACTUAL, la ganancia del mes cambiaría en ${money(Math.round(-(totActual - totWeb)))}.`);
      console.log(`  (${conHist.length} de ${filas.length} productos tienen precio histórico cargado para ${ym}; el resto usa el costo de hoy.)`);

      // ── ¿CIERRA EL MES? El mismo cierre que muestra el Resumen, pero calculado acá desde cero,
      //    para poder cruzarlo contra la web y confirmar que no hay nada raro en el medio.
      const totImp = filas.reduce((s, f) => s + (f.imp || 0), 0);
      const totBruto = filas.reduce((s, f) => s + (f.bruto || 0), 0);
      const costoConImp = totWeb + totImp;
      const ganancia = totNeto - costoConImp;
      const markup = costoConImp > 0 ? ganancia / costoConImp * 100 : 0;
      let gastosDelMes = 0;
      for (const g of Object.values(comprasMes)) {
        if (!g || g.tipo === 'mercaderia') continue;
        if ((g.dayKey || '').slice(0, 7) === ym) gastosDelMes += g.monto || 0;
      }
      const ret = retiroMes[ym] != null ? Number(retiroMes[ym]) : null;
      console.log(`\n══ ¿CIERRA ${ym}? ══`);
      console.log(`  Facturado                        ${money(Math.round(totBruto))}`);
      console.log(`  Neto ML                          ${money(Math.round(totNeto))}`);
      console.log(`  − mercadería                     ${money(Math.round(totWeb))}`);
      console.log(`  − IIBB + monotributo (${monoPct.toFixed(2)}%)     ${money(Math.round(totImp))}`);
      console.log(`  = GANANCIA                       ${money(Math.round(ganancia))}   · markup ${markup.toFixed(1)}%`);
      console.log(`  − gastos cargados                ${money(Math.round(gastosDelMes))}`);
      console.log(`  − retiro                         ${ret != null ? money(Math.round(ret)) : '(no cargado)'}`);
      if (ret != null) {
        const queda = ganancia - gastosDelMes - ret;
        const equil = costoConImp > 0 ? (gastosDelMes + ret) / costoConImp * 100 : 0;
        console.log(`  = QUEDA EN CYC                   ${money(Math.round(queda))}`);
        console.log(`\n  Punto de equilibrio del mes: ${equil.toFixed(1)}% de markup`);
        console.log(`  Estás ${(markup - equil).toFixed(1)} puntos arriba → ${money(Math.round((markup - equil) / 100 * costoConImp))}`);
        console.log(`  (tiene que dar lo mismo que "QUEDA EN CYC"; si no, hay algo mal)`);
      }
      return;
    }
    // BILLING_PROBE=activarfull[:go][:<piso>] → REACTIVA LAS PAUSADAS QUE TIENEN STOCK EN FULL.
    //
    // Regla pedida: SOLO se reactiva lo que tiene stock EN FULL (en el depósito de ML). Lo que
    // tiene stock en el depósito propio NO se toca — hay que mandarlo a Full primero. Y antes de
    // reactivar, la publicación tiene que llegar al piso de ganancia: si está por debajo, primero
    // se le sube el precio y recién después se activa. Nunca se activa algo que pierde plata.
    //
    // El margen se mide igual que el barrido de precios: neto = precio − comisión oficial de ML
    // − envío (mediana de las ventas reales) − cuotas (cyc/mlcuotas). Sin colchón: se apunta al
    // piso exacto.
    //
    // Sin 'go' solo lista. Con 'go' escribe en ML (sube precios y activa).
    if (String(process.env.BILLING_PROBE || '').startsWith('activarfull')) {
      const _af = String(process.env.BILLING_PROBE).split(':');
      const APLICAR = _af[1] === 'go';
      const PISO = (parseFloat(_af[2]) || 30) / 100;
      const T = PISO;                       // destino = piso exacto, sin colchón
      const MAX_UP = 1.25;                  // mismo tope de seguridad de siempre
      const UMBRAL_ENVIO = 33000;           // desde acá ML obliga envío gratis pago por CYC
      const vp = (await db.get('cyc/ventaprod')) || {};
      const links = (await db.get('cyc/mllinks')) || {};
      const fin = (await db.get('cyc/finanzas')) || {};
      const tc = parseFloat(fin.tipo_cambio) || 1500;
      const monoP = parseFloat(((await db.get('cyc/monotributo')) || {}).pct) || 0;
      const cuotasCfg = (await db.get('cyc/mlcuotas')) || {};
      const pctCuotas = (mla) => { const v = cuotasCfg[mla] && parseFloat(cuotasCfg[mla].pct); return isFinite(v) && v > 0 ? v / 100 : 0; };
      const pIdx = {}; for (const p of products) pIdx[p.id] = p;
      // Ventas de los últimos 2 meses, para deducir el envío real de cada publicación.
      const meses = (() => { const now = new Date(); const a = []; for (let i = 1; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); a.push(d.getFullYear() + '_' + String(d.getMonth() + 1).padStart(2, '0')); } return a; })();
      const vtaMla = {}, vtaProd = {};
      for (const [k, ents] of Object.entries(vp)) {
        if (!meses.includes(k.slice(0, 7))) continue;
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada) continue;
          const q = v.qty || 1, tot = (v.total || 0) / q, net = (v.neto || 0) / q;
          if (tot <= 0 || net <= 0) continue;
          if (v.mla) (vtaMla[v.mla] = vtaMla[v.mla] || []).push({ tot, net });
          if (v.prodId) (vtaProd[v.prodId] = vtaProd[v.prodId] || []).push({ tot, net });
        }
      }
      const feeCache = {};
      const feeAt = async (site, price, ltype, cat, token) => {
        const key = site + '|' + ltype + '|' + cat + '|' + Math.round(price);
        if (feeCache[key] !== undefined) return feeCache[key];
        let out = null;
        try {
          const d = await mlGet(`/sites/${site}/listing_prices?price=${Math.round(price)}&listing_type_id=${ltype}&category_id=${cat}`, token);
          const o = Array.isArray(d) ? d[0] : d;
          if (typeof o?.sale_fee_amount === 'number') out = o.sale_fee_amount;
        } catch { out = null; }
        feeCache[key] = out;
        return out;
      };
      console.log(`=== REACTIVAR PAUSADAS CON STOCK EN FULL · piso ${(PISO * 100).toFixed(0)}% exacto ===`);
      console.log(APLICAR ? '⚠️  MODO REAL: se suben precios y se activan publicaciones en ML\n' : 'MODO PRUEBA · no se escribe NADA en ML\n');
      const activar = [], sinFull = [], fueraFull = [], sinDatos = [], noLlegan = [];
      for (const label of labels) {
        const acc = accounts[label];
        if (!acc?.refresh_token) { console.log(`(${label}: sin token)`); continue; }
        let t; try { t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token); } catch { console.log(`(${label}: no pude renovar token)`); continue; }
        await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
        const m = (mlExtraPct(label) + monoP) / 100;
        const ids = Object.entries(links)
          .filter(([mla, e]) => e && e.cuenta === label && !e.ignored && e.prodId && /^MLA/i.test(mla))
          .map(([mla]) => mla);
        for (let k = 0; k < ids.length; k += 20) {
          const lote = ids.slice(k, k + 20);
          let arr;
          try { arr = await mlGet('/items?ids=' + lote.join(',') + '&attributes=id,status,price,available_quantity,shipping,inventory_id,variations,title,listing_type_id,category_id,site_id', t.access_token); }
          catch (e) { for (const mla of lote) sinDatos.push({ label, mla, nom: (links[mla] || {}).title || mla, why: 'ML no contestó' }); continue; }
          for (const row of (arr || [])) {
            const b = row.body || {}; const mla = b.id;
            if (!mla || !links[mla] || b.error || typeof b.status === 'number') continue;
            const nom = (links[mla].title || b.title || mla).slice(0, 34);
            const vars = Array.isArray(b.variations) ? b.variations : [];
            // ¿Está en Full? El tipo de logística lo dice la publicación.
            const logi = (b.shipping && b.shipping.logistic_type) || '';
            const esFull = logi === 'fulfillment';
            // Stock EN FULL: se pide al inventario de ML, publicación o variante por variante.
            let stockFull = 0;
            if (esFull) {
              const invIds = vars.length ? vars.map((v) => v.inventory_id).filter(Boolean) : [b.inventory_id].filter(Boolean);
              for (const inv of invIds) {
                try {
                  const st = await mlGet('/inventories/' + inv + '/stock/fulfillment', t.access_token);
                  stockFull += Number(st?.available_quantity) || 0;
                } catch { /* si no contesta, cuenta 0: nunca se activa por las dudas */ }
              }
            }
            // Stock propio declarado en la publicación (el que NO está en Full).
            const stockPropio = esFull ? 0 : (Number(b.available_quantity) || 0);
            if (b.status !== 'paused') {
              // Activas: solo interesa avisar si tienen stock propio fuera de Full.
              if (b.status === 'active' && !esFull && stockPropio > 0) fueraFull.push({ label, mla, nom, stock: stockPropio, logi: logi || '(sin logística)', activa: true });
              continue;
            }
            // De acá para abajo: PAUSADAS.
            if (!esFull) { fueraFull.push({ label, mla, nom, stock: stockPropio, logi: logi || '(sin logística)', activa: false }); continue; }
            if (stockFull <= 0) { sinFull.push({ label, mla, nom }); continue; }
            // Tiene stock en Full → antes de activar, ¿llega al piso?
            const p = pIdx[links[mla].prodId];
            if (!p) { sinDatos.push({ label, mla, nom, why: 'sin producto en la web' }); continue; }
            const costo = costoPesos(p, 1, tc).costo;
            if (!costo) { sinDatos.push({ label, mla, nom, why: 'sin costo cargado' }); continue; }
            const precio = vars.length ? (vars[0].price || 0) : (b.price || 0);
            if (!precio) { sinDatos.push({ label, mla, nom, why: 'sin precio' }); continue; }
            const ventas = (vtaMla[mla] && vtaMla[mla].length) ? vtaMla[mla] : (vtaProd[p.id] || []);
            if (!ventas.length) { sinDatos.push({ label, mla, nom, why: 'sin ventas para deducir el envío' }); continue; }
            const site = b.site_id || 'MLA', lt = b.listing_type_id, cat = b.category_id;
            const precios = [...new Set(ventas.map((v) => Math.round(v.tot)))].slice(-6);
            const envios = [];
            for (const pv of precios) {
              const cv = await feeAt(site, pv, lt, cat, t.access_token);
              if (cv == null) continue;
              for (const v of ventas) { if (Math.round(v.tot) === pv) envios.push(Math.max(0, v.tot - v.net - cv)); }
            }
            if (!envios.length) { sinDatos.push({ label, mla, nom, why: 'no pude deducir el envío' }); continue; }
            envios.sort((a, b2) => a - b2);
            const envio = Math.max(0, envios[Math.floor(envios.length / 2)]);
            const cuo = pctCuotas(mla);
            const com = await feeAt(site, precio, lt, cat, t.access_token);
            if (com == null) { sinDatos.push({ label, mla, nom, why: 'ML no devolvió la comisión' }); continue; }
            const neto = precio - com - envio - precio * cuo;
            const mg = (neto - costo - precio * m) / (costo + precio * m);
            const fila = { label, mla, nom, stockFull, precio, mg: mg * 100, com, envio, cuo, costo, tok: t.access_token, nVar: vars.length };
            if (mg >= PISO) { activar.push(fila); continue; }
            // Está por debajo del piso: hay que subirlo ANTES de activar.
            const den = 1 - cuo - m * (1 + T);
            if (den <= 0) { noLlegan.push({ ...fila, why: 'el cargo de ML no deja margen a ningún precio' }); continue; }
            let P = precio, comP = com, bien = true;
            for (let it = 0; it < 3; it++) {
              const Pn = (costo * (1 + T) + comP + envio) / den;
              const c2 = await feeAt(site, Pn, lt, cat, t.access_token);
              if (c2 == null) { bien = false; break; }
              if (Math.abs(Pn - P) < 1 && it > 0) { P = Pn; comP = c2; break; }
              P = Pn; comP = c2;
            }
            if (!bien) { noLlegan.push({ ...fila, why: 'ML no devolvió la comisión del precio nuevo' }); continue; }
            const nuevo = Math.ceil(P / 10) * 10;
            if (nuevo > precio * MAX_UP) { noLlegan.push({ ...fila, nuevo, why: `necesita subir ${((nuevo / precio - 1) * 100).toFixed(0)}%, más del 25%` }); continue; }
            if (precio < UMBRAL_ENVIO && nuevo >= UMBRAL_ENVIO) { noLlegan.push({ ...fila, nuevo, why: 'cruzaría los $33.000 y el envío pasaría a pagarlo CYC' }); continue; }
            if (vars.length) { noLlegan.push({ ...fila, nuevo, why: 'tiene variantes: subila con el barrido de precios y después activala' }); continue; }
            activar.push({ ...fila, nuevo, mgNuevo: ((nuevo - comP - envio - nuevo * cuo) - costo - nuevo * m) / (costo + nuevo * m) * 100 });
          }
        }
      }
      const $ = (x) => money(Math.round(x));
      console.log(`── A. SE ACTIVAN (stock en Full y llegan al ${(PISO * 100).toFixed(0)}%) · ${activar.length} ──`);
      activar.sort((a, b) => b.stockFull - a.stockFull).forEach((f) => {
        console.log(`  ${String(f.stockFull).padStart(4)} u. en Full · ${String(Math.round(f.mg)).padStart(3)}%${f.nuevo ? ` → ${Math.round(f.mgNuevo)}%` : ''} · ${$(f.precio)}${f.nuevo ? ` → ${$(f.nuevo)} (+${((f.nuevo / f.precio - 1) * 100).toFixed(1)}%)` : ' (no hace falta tocar el precio)'} · ${f.label} · ${f.mla} · ${f.nom}`);
        console.log(`        precio ${$(f.precio)} − comisión ${$(f.com)} − envío ${$(f.envio)}${f.cuo ? ` − cuotas ${(f.cuo * 100).toFixed(1)}%` : ''} · costo ${$(f.costo)}`);
      });
      console.log(`\n── B. NO SE ACTIVAN: no llegan al piso ni subiendo · ${noLlegan.length} ──`);
      noLlegan.forEach((f) => console.log(`  ${String(f.stockFull).padStart(4)} u. en Full · ${Math.round(f.mg)}% · ${$(f.precio)} · ${f.label} · ${f.mla} · ${f.nom} → ${f.why}`));
      console.log(`\n── C. PAUSADAS EN FULL PERO SIN STOCK EN FULL (no hay nada que activar) · ${sinFull.length} ──`);
      sinFull.slice(0, 25).forEach((f) => console.log(`  ${f.label} · ${f.mla} · ${f.nom}`));
      if (sinFull.length > 25) console.log(`  … y ${sinFull.length - 25} más`);
      console.log(`\n── D. ⚠️ CON STOCK EN DEPÓSITO Y FUERA DE FULL (esto es lo que pediste revisar) · ${fueraFull.length} ──`);
      fueraFull.sort((a, b) => b.stock - a.stock).forEach((f) => console.log(`  ${String(f.stock).padStart(4)} u. · ${f.activa ? 'ACTIVA  ' : 'PAUSADA '} · logística ${f.logi.padEnd(14)} · ${f.label} · ${f.mla} · ${f.nom}`));
      if (!fueraFull.length) console.log('  Ninguna: todo lo que tiene stock está en Full.');
      console.log(`\n── E. SIN DATOS · ${sinDatos.length} ──`);
      sinDatos.slice(0, 20).forEach((f) => console.log(`  ${f.label} · ${f.mla} · ${f.nom} · ${f.why}`));
      if (sinDatos.length > 20) console.log(`  … y ${sinDatos.length - 20} más`);
      if (!APLICAR) { console.log(`\nRECORDÁ: fue solo una LISTA. No se tocó nada en ML. Para hacerlo: activarfull:go`); return; }
      // ── Aplicar: primero el precio (si hace falta), después activar. Si el precio falla, NO se
      //    activa: es preferible dejarla pausada que venderla por debajo del piso.
      console.log(`\n══ APLICANDO ${activar.length} publicaciones ══`);
      let okP = 0, okA = 0, err = 0; const hechos = [];
      for (const f of activar) {
        if (f.nuevo) {
          const r = DRY ? { ok: false, err: 'DRY' } : await raisePriceTo(f.mla, f.nuevo, f.tok);
          if (!r.ok) { err++; console.log(`  ✗ ${f.mla} · ${f.nom}: no pude subir el precio (${r.err}) → NO la activo`); continue; }
          okP++; console.log(`  ↑ ${f.mla} · ${f.nom}: ${$(r.from)} → ${$(r.to)}`);
        }
        if (DRY) { console.log(`  (DRY) activaría ${f.mla}`); continue; }
        let act = false;
        try {
          const r = await fetch(ML_API + '/items/' + f.mla, {
            method: 'PUT',
            headers: { Authorization: 'Bearer ' + f.tok, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'active' }),
          });
          act = r.ok;
          if (!r.ok) console.log(`  ✗ ${f.mla} · ${f.nom}: ML rechazó la activación (${r.status})`);
        } catch { console.log(`  ✗ ${f.mla} · ${f.nom}: error de red al activar`); }
        if (!act) { err++; continue; }
        // Verificación: volver a leerla y confirmar que quedó activa.
        let ver = null;
        try { ver = await mlGet('/items/' + f.mla + '?attributes=id,status,price', f.tok); } catch { /* ignore */ }
        if (ver && ver.status === 'active') { okA++; hechos.push({ nom: f.nom, precio: ver.price, stock: f.stockFull }); console.log(`  ✓ ${f.mla} · ${f.nom}: ACTIVA · ${$(ver.price)} · ${f.stockFull} u. en Full`); }
        else { err++; console.log(`  ✗ ${f.mla} · ${f.nom}: pedí activarla pero quedó en "${ver ? ver.status : '?'}"`); }
      }
      console.log(`\nListo: ${okP} precios subidos · ${okA} publicaciones activadas · ${err} con error.`);
      return;
    }
    // BILLING_PROBE=prodpubs[:<palabra>][:<días>] → ¿POR QUÉ UN PRODUCTO QUE VENDE NO TIENE
    // PUBLICACIONES VINCULADAS? Sin palabra lista TODOS los productos con ventas en el período que
    // no tienen ni una publicación activa y vinculada: esos el robot de precios no los mira nunca.
    // Con palabra, muestra ese producto con TODAS sus publicaciones (activas, pausadas, cerradas,
    // ignoradas) para ver dónde se cortó el vínculo. Solo LEE.
    if (String(process.env.BILLING_PROBE || '').startsWith('prodpubs')) {
      const _pp = String(process.env.BILLING_PROBE).split(':');
      const kw = (_pp[1] || '').trim().toLowerCase();
      const DIAS = parseFloat(_pp[2]) || 90;
      const vp = (await db.get('cyc/ventaprod')) || {};
      const links = (await db.get('cyc/mllinks')) || {};
      const inventory = (await db.get('cyc/inventory')) || {};
      const pIdx = {}; for (const p of products) pIdx[p.id] = p;
      // Stock del producto según el Inventario de la web. Es el dato que decide qué hacer con una
      // publicación pausada: con stock hay que reactivarla, sin stock no hay nada que reactivar.
      const stockU = (pid) => Object.entries(inventory)
        .filter(([k]) => k.startsWith(pid + '__') && !k.includes('__v__'))
        .reduce((s, [, v]) => s + (parseInt(v) || 0), 0);
      const desde = dayKeyFromISO(Date.now() - (DIAS - 1) * 864e5);
      const porProd = {}, ventasMla = {};
      for (const [k, ents] of Object.entries(vp)) {
        if (k < desde) continue;
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada || !v.prodId) continue;
          const b = porProd[v.prodId] || (porProd[v.prodId] = { nom: v.prod || v.prodId, n: 0, neto: 0 });
          b.n++; b.neto += v.neto || 0;
          if (v.mla) ventasMla[v.mla] = (ventasMla[v.mla] || 0) + 1;
        }
      }
      // Publicaciones por producto (todas, sin filtrar).
      const pubsProd = {};
      for (const [mla, e] of Object.entries(links)) {
        if (!e || !e.prodId || !/^MLA/i.test(mla)) continue;
        (pubsProd[e.prodId] = pubsProd[e.prodId] || []).push(mla);
      }
      // Qué productos mirar.
      let objetivo;
      if (kw) objetivo = Object.keys(porProd).filter((pid) => ((porProd[pid].nom || '') + ' ' + ((pIdx[pid] || {}).name || '')).toLowerCase().includes(kw));
      else objetivo = Object.keys(porProd);
      // Estado real en ML de todas las publicaciones involucradas.
      const aPedir = [...new Set(objetivo.flatMap((pid) => pubsProd[pid] || []))];
      const estado = {};
      for (const label of labels) {
        const acc = accounts[label]; if (!acc?.refresh_token) continue;
        let t; try { t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token); } catch { continue; }
        await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
        const faltan = aPedir.filter((m) => !estado[m]);
        for (let k = 0; k < faltan.length; k += 20) {
          let arr;
          try { arr = await mlGet('/items?ids=' + faltan.slice(k, k + 20).join(',') + '&attributes=id,status,price,title', t.access_token); } catch { continue; }
          for (const row of (arr || [])) {
            const b = row.body || {}; if (!b.id) continue;
            // Cuando ML no puede devolver un ítem manda un cuerpo de error donde `status` es el código
            // HTTP (un número, ej 404). Ese no es el estado de la publicación: se descarta.
            if (b.error || typeof b.status === 'number') continue;
            if (!estado[b.id]) estado[b.id] = { status: String(b.status || '?'), precio: b.price || 0, leidaPor: label };
          }
        }
      }
      const sana = (mla) => { const e = links[mla] || {}; const s = estado[mla]; return s && s.status === 'active' && !e.ignored && e.prodId && e.cuenta; };
      const rotos = objetivo.filter((pid) => !(pubsProd[pid] || []).some(sana));
      const lista = kw ? objetivo : rotos;
      lista.sort((a, b) => porProd[b].neto - porProd[a].neto);
      console.log(`=== PRODUCTOS Y SUS PUBLICACIONES (últimos ${DIAS} días)${kw ? ` · filtro "${kw}"` : ' · SOLO los que no tienen ninguna publicación sana'} ===`);
      console.log(`MODO PRUEBA · no se escribe nada\n`);
      if (!lista.length) { console.log('Nada para mostrar: todos los productos con ventas tienen al menos una publicación activa y vinculada.'); return; }
      // Qué hacer con cada producto, según stock y motivo. Sirve como lista de tareas.
      const conStock = [], sinStock = [], aArreglar = [];
      for (const pid of lista) {
        const b = porProd[pid];
        const pubs = pubsProd[pid] || [];
        const stk = stockU(pid);
        // Un vínculo roto solo importa si la publicación sigue VIVA. Si está cerrada, que le falte
        // la cuenta no molesta a nadie: es historia. Sin esto, un producto con stock para reactivar
        // caía en "arreglar el vínculo" por culpa de una publicación cerrada hace meses (el Chispero).
        const hayLinkRoto = pubs.some((m) => {
          const e = links[m] || {}, s = estado[m];
          const viva = s && s.status !== 'closed';
          return viva && (!e.cuenta || e.ignored);
        });
        const accion = hayLinkRoto ? 'ARREGLAR EL VÍNCULO en la web (Publicaciones)'
          : stk > 0 ? `REACTIVAR en ML — hay ${stk} u. de stock`
          : 'nada: no hay stock, la publicación está bien pausada';
        (hayLinkRoto ? aArreglar : stk > 0 ? conStock : sinStock).push({ nom: b.nom, stk, neto: b.neto, n: b.n });
        console.log(`${b.nom.slice(0, 42)} · ${b.n} ventas · neto ${money(Math.round(b.neto))} · stock ${stk} u. · ${pubs.length} publicaciones`);
        console.log(`   → ${accion}`);
        if (!pubs.length) { console.log(`      NINGUNA publicación apunta a este producto en mllinks.`); }
        for (const mla of pubs.sort((x, y) => (ventasMla[y] || 0) - (ventasMla[x] || 0))) {
          const e = links[mla] || {}, s = estado[mla];
          const marcas = [];
          if (e.ignored) marcas.push('IGNORADA');
          if (!e.cuenta) marcas.push('SIN CUENTA');
          if (!s) marcas.push('ML no la devolvió');
          else if (s.status !== 'active') marcas.push(s.status.toUpperCase());
          console.log(`      ${mla} · ${String(ventasMla[mla] || 0).padStart(3)} ventas · ${s ? money(s.precio).padStart(10) : '         —'}`
            + ` · cuenta ${(e.cuenta || '(vacía)').padEnd(9)} · ${marcas.length ? marcas.join(' + ') : 'OK, el robot la mira'}`);
        }
        console.log('');
      }
      if (!kw) {
        console.log(`═══ QUÉ HACER ═══`);
        const linea = (r) => `   ${String(r.stk).padStart(4)} u. · ${money(Math.round(r.neto)).padStart(12)} en ${r.n} ventas · ${r.nom.slice(0, 40)}`;
        console.log(`\n1) REACTIVAR EN ML — tienen stock y están pausadas (${conStock.length}):`);
        conStock.sort((a, b) => b.neto - a.neto).forEach((r) => console.log(linea(r)));
        if (!conStock.length) console.log('   (ninguna)');
        console.log(`\n2) ARREGLAR EL VÍNCULO en la web → Publicaciones (${aArreglar.length}):`);
        aArreglar.sort((a, b) => b.neto - a.neto).forEach((r) => console.log(linea(r)));
        if (!aArreglar.length) console.log('   (ninguna)');
        console.log(`\n3) NO HACER NADA — sin stock, está bien que estén pausadas (${sinStock.length}):`);
        sinStock.sort((a, b) => b.neto - a.neto).slice(0, 12).forEach((r) => console.log(linea(r)));
        if (sinStock.length > 12) console.log(`   … y ${sinStock.length - 12} más`);
        console.log(`\nTotal: ${lista.length} productos vendieron y hoy no tienen ninguna publicación que el robot pueda tocar.`);
      }
      return;
    }
    // BILLING_PROBE=catalogo[:<días>][:<top>] → ¿SUBIR EL PRECIO ES GRADUAL O ES UN PRECIPICIO?
    //
    // La duda de fondo: en las publicaciones de CATÁLOGO, ML le da casi todas las ventas al que gana
    // la "caja de compra" (buy box). Ahí subir 5% no te hace vender 5% menos: te puede sacar del box
    // y hacerte vender casi nada. En las publicaciones NORMALES no hay box y la caída es gradual.
    // Entonces un piso de margen no se puede decidir en promedio: hay que saber CUÁLES de los
    // productos que dan la plata están en catálogo y cuánto aire tienen antes de perder el box.
    //
    // Solo LEE. Ordena los productos por GANANCIA en $ (no por %), y para cada publicación muestra
    // si es de catálogo, si hoy ganamos el box, y a qué precio está el que lo gana.
    if (String(process.env.BILLING_PROBE || '').startsWith('catalogo')) {
      const _c = String(process.env.BILLING_PROBE).split(':');
      const DIAS = parseFloat(_c[1]) || 90;
      const TOP = parseFloat(_c[2]) || 12;
      const vp = (await db.get('cyc/ventaprod')) || {};
      const links = (await db.get('cyc/mllinks')) || {};
      const fin = (await db.get('cyc/finanzas')) || {};
      const tc = parseFloat(fin.tipo_cambio) || 1500;
      const monoP = parseFloat(((await db.get('cyc/monotributo')) || {}).pct) || 0;
      const pIdx = {}; for (const p of products) pIdx[p.id] = p;
      const desde = dayKeyFromISO(Date.now() - (DIAS - 1) * 864e5);
      // Ganancia por producto, mismo criterio que la web: neto − costo − (IIBB + monotributo).
      const porProd = {};
      for (const [k, ents] of Object.entries(vp)) {
        if (k < desde) continue;
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada || !v.prodId) continue;
          const neto = v.neto || 0; if (neto <= 0) continue;
          const b = porProd[v.prodId] || (porProd[v.prodId] = { nom: v.prod || v.prodId, neto: 0, qty: 0, imp: 0, n: 0 });
          b.neto += neto; b.qty += v.qty || 1; b.n++;
          b.imp += (v.total || 0) * (mlExtraPct(v.cuenta) + monoP) / 100;
        }
      }
      const filas = [];
      for (const [pid, b] of Object.entries(porProd)) {
        const p = pIdx[pid]; if (!p) continue;
        const cU = costoPesos(p, 1, tc).costo; if (!cU) continue;
        const costo = cU * b.qty + b.imp;
        const gan = b.neto - costo;
        filas.push({ pid, nom: b.nom, gan, ganMes: gan / DIAS * 30, mg: costo > 0 ? gan / costo * 100 : 0, n: b.n, qty: b.qty });
      }
      filas.sort((a, b) => b.ganMes - a.ganMes);
      const ganTot = filas.reduce((s, f) => s + f.ganMes, 0);
      const top = filas.slice(0, TOP);
      console.log(`=== ¿DÓNDE ESTÁ LA PLATA Y CUÁNTO AGUANTA UNA SUBA? (últimos ${DIAS} días) ===`);
      console.log(`MODO PRUEBA · no se escribe nada · ganancia total ${money(Math.round(ganTot))}/mes\n`);
      // Publicaciones activas de esos productos, agrupadas por cuenta para usar el token que va.
      const pubsDe = {};
      for (const [mla, e] of Object.entries(links)) {
        if (!e || e.ignored || !e.prodId || !/^MLA/i.test(mla)) continue;
        if (!top.some((f) => f.pid === e.prodId)) continue;
        (pubsDe[e.cuenta] = pubsDe[e.cuenta] || []).push(mla);
      }
      const info = {};   // mla → {precio, catalogo, cpid, gana, precioGanador, vendedorGanador}
      for (const label of labels) {
        const ids = pubsDe[label]; if (!ids || !ids.length) continue;
        const acc = accounts[label]; if (!acc?.refresh_token) continue;
        let t; try { t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token); } catch { continue; }
        await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
        for (let k = 0; k < ids.length; k += 20) {
          let arr;
          try { arr = await mlGet('/items?ids=' + ids.slice(k, k + 20).join(',') + '&attributes=id,status,price,catalog_listing,catalog_product_id,seller_id,title', t.access_token); } catch { continue; }
          for (const row of (arr || [])) {
            const b = row.body || {}; if (!b.id || b.status !== 'active') continue;
            const r = info[b.id] = { label, precio: b.price || 0, catalogo: !!b.catalog_listing, cpid: b.catalog_product_id || null, prodId: (links[b.id] || {}).prodId };
            if (!r.catalogo || !r.cpid) continue;
            // Quién gana la caja de compra de ese producto de catálogo.
            try {
              const prod = await mlGet('/products/' + r.cpid, t.access_token);
              const w = prod && prod.buy_box_winner;
              if (w) {
                r.gana = String(w.item_id) === String(b.id);
                r.precioGanador = w.price;
                r.vendedorGanador = w.seller_id;
              } else r.sinBox = true;
            } catch (e) { r.errBox = String(e.message || e).slice(0, 40); }
          }
        }
      }
      let ganCat = 0, ganLibre = 0;
      for (const f of top) {
        const mias = Object.entries(info).filter(([, r]) => r.prodId === f.pid);
        const enCat = mias.filter(([, r]) => r.catalogo);
        const pctCat = mias.length ? enCat.length / mias.length : 0;
        ganCat += f.ganMes * pctCat; ganLibre += f.ganMes * (1 - pctCat);
        console.log(`${money(Math.round(f.ganMes)).padStart(11)}/mes · ${String(Math.round(f.mg)).padStart(4)}% · ${String(f.n).padStart(4)} ventas · ${f.nom.slice(0, 38)}`);
        if (!mias.length) { console.log(`      (sin publicaciones activas vinculadas)`); continue; }
        for (const [mla, r] of mias.sort((a, b) => (b[1].catalogo ? 1 : 0) - (a[1].catalogo ? 1 : 0))) {
          if (!r.catalogo) { console.log(`      ${mla} · ${money(r.precio).padStart(10)} · publicación NORMAL (no hay caja de compra: subir es gradual)`); continue; }
          const est = r.errBox ? `no pude leer el box (${r.errBox})`
            : r.sinBox ? 'catálogo, pero ML no informa ganador'
            : r.gana ? `CATÁLOGO · lo GANÁS vos`
            : `CATÁLOGO · lo PERDÉS · gana otro a ${money(Math.round(r.precioGanador || 0))}`;
          let aire = '';
          if (r.gana && r.precioGanador != null) aire = '';
          if (!r.gana && r.precioGanador > 0 && r.precio > 0) {
            aire = `  ← estás ${((r.precio / r.precioGanador - 1) * 100).toFixed(1)}% más caro`;
          }
          console.log(`      ${mla} · ${money(r.precio).padStart(10)} · ${est}${aire}`);
        }
      }
      console.log(`\n── RESUMEN ──`);
      console.log(`  Del top ${top.length}: ${money(Math.round(ganCat))}/mes viene de publicaciones de CATÁLOGO (subir ahí es apuesta: ganás o perdés el box)`);
      console.log(`               ${money(Math.round(ganLibre))}/mes viene de publicaciones NORMALES (subir ahí es gradual y controlable)`);
      console.log(`  Esos ${top.length} productos son ${ganTot > 0 ? (top.reduce((s, f) => s + f.ganMes, 0) / ganTot * 100).toFixed(0) : 0}% de toda la ganancia.`);
      return;
    }
    // BILLING_PROBE=ciegas[:<días>] → PUBLICACIONES QUE VENDEN PERO EL ROBOT DE PRECIOS NO VE.
    //
    // Por qué existe: el barrido de precios solo mira las publicaciones que en cyc/mllinks tienen
    // cuenta + prodId y no están ignoradas. Si a un link le falta la cuenta (o quedó ignorado), esa
    // publicación NUNCA sube de precio, aunque venda todos los días. Pasó con una sábana 2½: cinco
    // publicaciones iguales a $19.380 y esta, invisible, vendiendo a $18.800.
    //
    // Solo LEE. Lista cada publicación con ventas en el período que el barrido saltea, con el motivo
    // y el precio de hoy, y al lado el precio de las publicaciones hermanas (mismo producto) que sí
    // se barren, para ver cuánto quedó atrasada.
    if (String(process.env.BILLING_PROBE || '').startsWith('ciegas')) {
      const DIAS = parseFloat(String(process.env.BILLING_PROBE).split(':')[1]) || 60;
      const vp = (await db.get('cyc/ventaprod')) || {};
      const links = (await db.get('cyc/mllinks')) || {};
      const desde = dayKeyFromISO(Date.now() - (DIAS - 1) * 864e5);
      // Ventas por publicación en el período.
      const ventasDe = {};
      for (const [k, ents] of Object.entries(vp)) {
        if (k < desde) continue;
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada || !v.mla) continue;
          const b = ventasDe[v.mla] || (ventasDe[v.mla] = { n: 0, prod: v.prod || '', prodId: v.prodId || '', cuenta: v.cuenta || '' });
          b.n++;
        }
      }
      // Motivo por el que el barrido la saltea (mismo filtro exacto que el probe 'precios').
      const bajoLupa = [];
      for (const [mla, b] of Object.entries(ventasDe)) {
        const e = links[mla];
        let why = null;
        if (!e) why = 'no está en mllinks';
        else if (e.ignored) why = 'marcada como ignorada';
        else if (!e.prodId) why = 'sin producto vinculado';
        else if (!e.cuenta) why = 'sin cuenta en el link';
        else if (!labels.includes(e.cuenta)) why = `cuenta "${e.cuenta}" no es una de las 4`;
        if (why) bajoLupa.push({ mla, why, ...b, prodId: (e && e.prodId) || b.prodId });
      }
      console.log(`=== PUBLICACIONES QUE VENDEN Y EL ROBOT DE PRECIOS NO TOCA (últimos ${DIAS} días) ===`);
      console.log(`MODO PRUEBA · no se escribe nada\n`);
      if (!bajoLupa.length) { console.log('Ninguna: todas las publicaciones con ventas entran al barrido.'); return; }
      // Precio de hoy de las ciegas y de sus hermanas (mismo prodId) que sí se barren.
      const hermanas = {};   // prodId → [precios de las que SÍ ve el robot]
      const precioDe = {};
      for (const label of labels) {
        const acc = accounts[label];
        if (!acc?.refresh_token) continue;
        let t; try { t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token); } catch { continue; }
        await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
        const mios = Object.entries(links)
          .filter(([mla, e]) => e && e.cuenta === label && !e.ignored && e.prodId && /^MLA/i.test(mla))
          .map(([mla]) => mla);
        const pedir = [...new Set(mios.concat(bajoLupa.map((r) => r.mla)))];
        for (let k = 0; k < pedir.length; k += 20) {
          let arr;
          try { arr = await mlGet('/items?ids=' + pedir.slice(k, k + 20).join(',') + '&attributes=id,status,price,seller_id', t.access_token); } catch { continue; }
          for (const row of (arr || [])) {
            const b = row.body || {}; if (!b.id || b.status !== 'active' || !(b.price > 0)) continue;
            precioDe[b.id] = b.price;
            const e = links[b.id];
            // Solo cuenta como "hermana sana" la que el barrido efectivamente mira.
            if (e && e.cuenta === label && !e.ignored && e.prodId) (hermanas[e.prodId] = hermanas[e.prodId] || []).push(b.price);
          }
        }
      }
      bajoLupa.sort((a, b) => b.n - a.n);
      let atrasadas = 0;
      for (const r of bajoLupa) {
        const p = precioDe[r.mla];
        const hs = (hermanas[r.prodId] || []).filter((x) => x > 0);
        const ref = hs.length ? Math.max(...hs) : null;
        const gap = (p && ref && ref > p) ? ((ref / p - 1) * 100) : 0;
        if (gap > 0.5) atrasadas++;
        console.log(`  ${r.mla} · ${String(r.n).padStart(3)} ventas · ${(r.prod || '').slice(0, 34).padEnd(34)}`);
        console.log(`      motivo: ${r.why}`);
        console.log(`      precio hoy ${p ? money(p) : '(no activa / no la pude leer)'}`
          + (ref ? ` · hermanas del mismo producto ${money(ref)}${gap > 0.5 ? `  ← ATRASADA ${gap.toFixed(1)}%` : ''}` : ' · sin hermanas para comparar'));
      }
      console.log(`\nTotal: ${bajoLupa.length} publicaciones invisibles para el robot de precios, ${atrasadas} con el precio atrasado respecto de sus hermanas.`);
      console.log(`Se arreglan completando la cuenta / el producto del link en la web (pestaña Publicaciones).`);
      return;
    }
    // BILLING_PROBE=precios:<piso>[:<YYYY_MM,...>] → LISTA (solo lee, NO escribe nada en ML) qué
    // precio habría que ponerle a cada publicación para llegar al piso de margen pedido.
    //
    // CÓMO CALCULA EL NETO (sin estimar con promedios, que era lo que fallaba):
    //   neto(P) = P − comisión_ML(P) − envío
    //   · comisión: la da MERCADOLIBRE (/sites/MLA/listing_prices) → % y monto fijo exactos.
    //   · envío: monto FIJO por paquete, deducido de las ventas reales:  envío = P − neto − comisión(P).
    //     De todas las ventas se toma el envío MÁS BAJO = el neto MÁS ALTO, o sea el mejor caso ya
    //     corregido (las ventas viejas con costos extra puntuales quedan descartadas).
    //
    // Precio objetivo, despejando  (neto(P) − costo − cargoML(P)) / (costo + cargoML(P)) = meta:
    //   P = [costo × (1+meta) + fijo + envío] / (1 − %comisión − %cargoML × (1+meta))
    if (String(process.env.BILLING_PROBE || '').startsWith('precios')) {
      const _cp = String(process.env.BILLING_PROBE).split(':');
      // 'precios' = solo lista. 'preciosgo' = ESCRIBE en ML. El destino (4º campo) es obligatorio
      // para aplicar: un MLA puntual o 'todos'. Sin eso no toca nada, para que no pase por accidente.
      const APLICAR = _cp[0] === 'preciosgo';
      const DESTINO = (_cp[3] || '').trim();
      if (APLICAR && !DESTINO) { console.log('Para aplicar hace falta el destino: preciosgo:30:meses:MLA123 o preciosgo:30:meses:todos'); return; }
      const MIN = (parseFloat(_cp[1]) || 30) / 100;      // piso: por debajo de esto se toca
      const T = MIN;                                      // destino: el piso EXACTO, sin colchón
      const pickYM = (_cp[2] || '2026_06,2026_07').split(',').map((s) => s.trim()).filter(Boolean);
      const MAX_UP = 1.25;                                // mismo tope de seguridad que el robot
      const vp = (await db.get('cyc/ventaprod')) || {};
      const links = (await db.get('cyc/mllinks')) || {};
      const fin = (await db.get('cyc/finanzas')) || {};
      const tc = parseFloat(fin.tipo_cambio) || 1500;
      const monoP = parseFloat(((await db.get('cyc/monotributo')) || {}).pct) || 0; // % monotributo
      // COSTO DE CUOTAS por publicación (cyc/mlcuotas, lo llena el probe 'cuotas'). ML lo cobra pero
      // NO lo informa en la calculadora de precios: en la Samsung fue 19,2% del precio, más que toda
      // la ganancia de esa venta. Sin esto, el precio calculado para un producto con cuotas queda corto.
      const cuotasCfg = (await db.get('cyc/mlcuotas')) || {};
      const pctCuotas = (mla) => {
        const v = cuotasCfg[mla] && parseFloat(cuotasCfg[mla].pct);
        return isFinite(v) && v > 0 ? v / 100 : 0;
      };
      const UMBRAL_ENVIO = 33000; // desde acá ML obliga a envío gratis y lo paga el vendedor
      const pIdx = {}; for (const p of products) pIdx[p.id] = p;
      // Ventas por publicación y por producto (precio y neto UNITARIOS).
      const vtaMla = {}, vtaProd = {};
      for (const [k, ents] of Object.entries(vp)) {
        if (!pickYM.includes(k.slice(0, 7))) continue;
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada) continue;
          const q = v.qty || 1, tot = (v.total || 0) / q, net = (v.neto || 0) / q;
          if (tot <= 0 || net <= 0) continue;
          const reg = { tot, net };
          if (v.mla) (vtaMla[v.mla] = vtaMla[v.mla] || []).push(reg);
          if (v.prodId) (vtaProd[v.prodId] = vtaProd[v.prodId] || []).push(reg);
        }
      }
      // Comisión EXACTA de ML para UN precio puntual. Se cachea por (categoría|tipo|PRECIO), no solo
      // por categoría: el cargo fijo de ML cambia según el precio, y cachear por categoría le aplicaba
      // a un producto el fijo calculado para otro (a las sábanas les metía $2.505 en vez de $1.250 y
      // las hundía de 29% a 15%).
      const feeCache = {};
      let feeCalls = 0;
      const feeAt = async (site, price, ltype, cat, token) => {
        const key = site + '|' + ltype + '|' + cat + '|' + Math.round(price);
        if (feeCache[key] !== undefined) return feeCache[key];
        let out = null;
        try {
          const d = await mlGet(`/sites/${site}/listing_prices?price=${Math.round(price)}&listing_type_id=${ltype}&category_id=${cat}`, token);
          const o = Array.isArray(d) ? d[0] : d;
          if (typeof o?.sale_fee_amount === 'number') out = o.sale_fee_amount;
        } catch { out = null; }
        feeCache[key] = out; feeCalls++;
        return out;
      };
      console.log(`=== PRECIOS PARA LLEGAR AL PISO ${(MIN * 100).toFixed(0)}% (destino ${(T * 100).toFixed(0)}%) ===`);
      console.log(`MODO PRUEBA · NO se escribe NADA en ML · dólar ${money(tc)}`);
      console.log(`Impuestos al costo: IIBB por cuenta + monotributo ${monoP.toFixed(2)}%`);
      console.log(`Neto = precio − comisión oficial de ML (pedida a ML para ESE precio) − envío`);
      console.log(`Envío = la MEDIANA de las últimas ventas (el envío típico, ni el mejor ni el peor caso)\n`);
      const subir = [], grandes = [], conVar = [], yaOk = [], sinDato = [], cruzan = [];
      for (const label of labels) {
        const acc = accounts[label];
        if (!acc?.refresh_token) { console.log(`(${label}: sin token, salteada)`); continue; }
        let t; try { t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token); } catch { console.log(`(${label}: no pude renovar token)`); continue; }
        await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
        const m = (mlExtraPct(label) + monoP) / 100; // IIBB de la cuenta + monotributo (general)
        const ids = Object.entries(links)
          .filter(([mla, e]) => e && e.cuenta === label && !e.ignored && e.prodId && /^MLA/i.test(mla))
          .map(([mla]) => mla);
        // CONTABILIDAD: toda publicación que entra tiene que salir en alguna lista. Los `continue`
        // mudos de acá abajo escondían publicaciones que venden y nunca subían de precio (una sábana
        // 2½ quedó a $18.800 mientras sus hermanas estaban a $19.380 y no figuraba en ninguna lista).
        for (let k = 0; k < ids.length; k += 20) {
          const lote = ids.slice(k, k + 20);
          let arr;
          try { arr = await mlGet('/items?ids=' + lote.join(',') + '&attributes=id,status,price,variations,attribute_combinations,title,listing_type_id,category_id,site_id', t.access_token); }
          catch (e) {
            // Si falla el pedido se caían 20 publicaciones de una sin decir nada.
            for (const mla of lote) sinDato.push({ label, mla, nom: (links[mla] || {}).title || mla, why: `ML no contestó el pedido (${String(e.message || e).slice(0, 40)})` });
            continue;
          }
          const vinieron = new Set((arr || []).map((r) => r.body && r.body.id).filter(Boolean));
          for (const mla of lote) if (!vinieron.has(mla)) sinDato.push({ label, mla, nom: (links[mla] || {}).title || mla, why: 'ML no la devolvió en la consulta' });
          for (const row of (arr || [])) {
            const b = row.body || {}; const mla = b.id; if (!mla || !links[mla]) continue;
            if (b.status !== 'active') { sinDato.push({ label, mla, nom: (links[mla].title || b.title || mla).slice(0, 34), why: `no está activa (${b.status || 'sin estado'})` }); continue; }
            const p = pIdx[links[mla].prodId];
            if (!p) { sinDato.push({ label, mla, nom: (links[mla].title || b.title || mla).slice(0, 34), why: `el producto ${links[mla].prodId} no existe en la web` }); continue; }
            const nom = (links[mla].title || b.title || p.name || mla).slice(0, 34);
            const site = b.site_id || 'MLA', lt = b.listing_type_id, cat = b.category_id;
            const costo = costoPesos(p, 1, tc).costo;
            if (!costo) { sinDato.push({ label, mla, nom, why: 'sin costo cargado' }); continue; }
            const vars = Array.isArray(b.variations) ? b.variations : [];
            // Cada VARIANTE tiene su propio precio, así que cada una se mide y se sube por separado.
            // Sin variantes, la publicación es una sola "unidad".
            const unidades = vars.length
              ? vars.map((v) => ({
                varId: v.id,
                precio: v.price || 0,
                etiqueta: (v.attribute_combinations || []).map((a) => a.value_name).filter(Boolean).join(' / ') || String(v.id),
              }))
              : [{ varId: null, precio: b.price || 0, etiqueta: '' }];
            if (!unidades.some((u) => u.precio > 0)) { sinDato.push({ label, mla, nom, why: 'sin precio' }); continue; }
            const precio = unidades[0].precio;
            // ENVÍO: se deduce de ventas reales como  precio − neto − comisión(a ESE precio).
            // Se usa la MEDIANA de las ventas, no el mínimo. Con el mínimo el cálculo daba ~4 puntos
            // por encima de la realidad (32% calculado vs 28% real) y el piso del 30% era nominal, no
            // real. Con el máximo pasaría lo contrario: subiría precios de más por una venta con un
            // costo puntual. La mediana es el envío típico: 30% calculado = 30% de verdad.
            const ventas = (vtaMla[mla] && vtaMla[mla].length) ? vtaMla[mla] : (vtaProd[p.id] || []);
            if (!ventas.length) { sinDato.push({ label, mla, nom, why: 'sin ventas para deducir el envío' }); continue; }
            const precios = [...new Set(ventas.map((v) => Math.round(v.tot)))].slice(-6);
            const envios = [];
            for (const pv of precios) {
              const cv = await feeAt(site, pv, lt, cat, t.access_token);
              if (cv == null) continue;
              for (const v of ventas) {
                if (Math.round(v.tot) !== pv) continue;
                envios.push(Math.max(0, v.tot - v.net - cv));
              }
            }
            if (!envios.length) { sinDato.push({ label, mla, nom, why: 'no pude deducir el envío' }); continue; }
            envios.sort((a, b) => a - b);
            let envio = envios[Math.floor(envios.length / 2)];
            const usadas = envios.length;
            if (envio < 0) envio = 0; // nunca negativo
            // Cuotas: sale del precio, igual que la comisión. Entra en el neto y en el denominador
            // del precio objetivo, si no el precio calculado queda corto en ese mismo porcentaje.
            const cuo = pctCuotas(mla);
            const den = 1 - cuo - m * (1 + T);
            if (den <= 0) { sinDato.push({ label, mla, nom, why: 'el cargo de ML no deja margen a ningún precio' }); continue; }
            // Se mide CADA unidad (publicación simple o variante) por separado.
            let falloML = false;
            for (const u of unidades) {
              if (!u.precio) { u.saltar = 'sin precio'; continue; }
              const comHoy = await feeAt(site, u.precio, lt, cat, t.access_token);
              if (comHoy == null) { falloML = true; break; }
              u.com = comHoy;
              u.neto = u.precio - comHoy - envio - u.precio * cuo;
              u.mlx = u.precio * m;
              u.mg = (u.neto - costo - u.mlx) / (costo + u.mlx);
              if (u.mg >= MIN) { u.ok = true; continue; }
              // Precio objetivo por punto fijo: P = [costo(1+meta) + comisión(P) + envío] / (1 − %cargoML(1+meta)).
              // Se itera porque la comisión depende del precio (y su parte fija salta por tramos).
              let P = u.precio, comP = comHoy, bien = true;
              for (let it = 0; it < 3; it++) {
                const Pn = (costo * (1 + T) + comP + envio) / den;
                const c2 = await feeAt(site, Pn, lt, cat, t.access_token);
                if (c2 == null) { bien = false; break; }
                if (Math.abs(Pn - P) < 1 && it > 0) { P = Pn; comP = c2; break; }
                P = Pn; comP = c2;
              }
              if (!bien) { falloML = true; break; }
              u.nuevo = Math.ceil(P / 10) * 10;
              u.mult = u.nuevo / u.precio;
              u.mgNuevo = ((u.nuevo - comP - envio - u.nuevo * cuo) - costo - u.nuevo * m) / (costo + u.nuevo * m) * 100;
              if (u.mult <= 1) u.ok = true;
            }
            if (falloML) { sinDato.push({ label, mla, nom, why: 'ML no devolvió la comisión' }); continue; }
            const tocar = unidades.filter((u) => u.nuevo && !u.ok && !u.saltar);
            // La publicación se clasifica por su unidad PEOR: la de menor margen entre las que hay que tocar.
            const peor = tocar.slice().sort((a, b2) => a.mg - b2.mg)[0];
            const fila = {
              label, mla, nom, nVar: vars.length, envio, costo, nVtas: usadas, prod: p.name || '', tok: t.access_token,
              unidades, tocar,
              precio: peor ? peor.precio : unidades[0].precio,
              mg: (peor ? peor.mg : (unidades[0].mg || 0)) * 100,
              com: peor ? peor.com : unidades[0].com, neto: peor ? peor.neto : unidades[0].neto,
              mlx: peor ? peor.mlx : unidades[0].mlx,
              nuevo: peor ? peor.nuevo : 0, mult: peor ? peor.mult : 1, mgNuevo: peor ? peor.mgNuevo : 0,
            };
            if (!tocar.length) { yaOk.push(fila); continue; }
            // Si el precio nuevo cruza los $33.000, ML pasa a obligar envío gratis (lo pagás vos):
            // el aumento se lo come el envío y encima facturás más. No se toca: queda para decidir.
            if (tocar.some((u) => u.precio < UMBRAL_ENVIO && u.nuevo >= UMBRAL_ENVIO)) { cruzan.push(fila); continue; }
            if (tocar.some((u) => u.mult > MAX_UP)) grandes.push(fila);
            else if (vars.length) conVar.push(fila);
            else subir.push(fila);
          }
        }
      }
      // Cada renglón trae TODOS los números para poder verificarlo a mano:
      //   neto = precio − comisión − envío  ·  margen = (neto − costo − cargoML) / (costo + cargoML)
      const line = (f) => `  ${String(Math.round(f.mg)).padStart(4)}% → ${String(Math.round(f.mgNuevo)).padStart(2)}% · ${money(Math.round(f.precio)).padStart(10)} → ${money(f.nuevo).padStart(10)} (+${((f.mult - 1) * 100).toFixed(1)}%) · ${f.label.padEnd(8)} · ${f.mla} · ${f.nom}\n`
        + `        precio ${money(Math.round(f.precio))} − comisión ${money(Math.round(f.com))} (${(f.com / f.precio * 100).toFixed(1)}%) − envío ${money(Math.round(f.envio))} = neto ${money(Math.round(f.neto))}\n`
        + `        costo mercadería ${money(Math.round(f.costo))} + cargo ML ${money(Math.round(f.mlx))} = ${money(Math.round(f.costo + f.mlx))} · ${f.nVtas} ventas usadas · producto "${f.prod.slice(0, 30)}"`;
      subir.sort((a, b) => a.mg - b.mg); conVar.sort((a, b) => a.mg - b.mg); grandes.sort((a, b) => a.mg - b.mg);
      // Detalle variante por variante: cuál sube, cuál ya está bien y cuál queda igual.
      const detVar = (f) => f.unidades.map((u) => {
        const et = (u.etiqueta || '').slice(0, 26).padEnd(26);
        if (u.saltar) return `          · ${et} ${u.saltar}`;
        if (u.ok || !u.nuevo) return `          · ${et} ${money(Math.round(u.precio)).padStart(10)} · ${String(Math.round((u.mg || 0) * 100)).padStart(3)}% · ya está bien, no se toca`;
        return `          · ${et} ${money(Math.round(u.precio)).padStart(10)} → ${money(u.nuevo).padStart(10)} · ${String(Math.round(u.mg * 100)).padStart(3)}% → ${String(Math.round(u.mgNuevo)).padStart(2)}% (+${((u.mult - 1) * 100).toFixed(1)}%)`;
      }).join('\n');
      console.log(`── A. SE PUEDEN SUBIR YA (sin variantes, suba ≤25%) · ${subir.length} publicaciones ──`);
      subir.forEach((f) => console.log(line(f)));
      console.log(`\n── B. CON VARIANTES (suba ≤25%) · ${conVar.length} publicaciones · ${conVar.reduce((s, f) => s + f.tocar.length, 0)} variantes a subir ──`);
      conVar.forEach((f) => console.log(line(f) + ` · ${f.nVar} variantes\n` + detVar(f)));
      console.log(`\n── C1. CRUZARÍAN LOS $33.000 (NO tocar: ahí el envío pasa a pagarlo CYC) · ${cruzan.length} ──`);
      cruzan.sort((a, b) => a.mg - b.mg).forEach((f) => console.log(line(f)));
      console.log(`\n── C. NECESITAN SUBA MAYOR A 25% (revisalos a mano) · ${grandes.length} publicaciones ──`);
      grandes.forEach((f) => console.log(line(f)));
      // Las que "ya están bien" también se listan: si solo se muestra el número, una publicación que
      // el cálculo da por buena y en realidad no lo está queda escondida y nunca se revisa. Pasó con
      // una sábana 2½ que vendía a $18.800 mientras sus hermanas estaban a $19.380.
      console.log(`\n── D. YA ESTÁN EN EL PISO O ARRIBA · ${yaOk.length} publicaciones ──`);
      yaOk.sort((a, b) => a.mg - b.mg).forEach((f) => console.log(
        `  ${String(Math.round(f.mg)).padStart(4)}% · ${money(Math.round(f.precio)).padStart(10)} · ${f.label.padEnd(8)} · ${f.mla} · ${f.nom}\n`
        + `        precio ${money(Math.round(f.precio))} − comisión ${money(Math.round(f.com))} − envío ${money(Math.round(f.envio))} = neto ${money(Math.round(f.neto))}`
        + ` · costo ${money(Math.round(f.costo + f.mlx))} · ${f.nVtas} ventas usadas`));
      console.log(`\n── E. SIN DATOS SUFICIENTES · ${sinDato.length} ──`);
      sinDato.forEach((f) => console.log(`  ${f.label.padEnd(8)} · ${f.mla} · ${f.nom} · ${f.why}`));
      if (!APLICAR) { console.log(`\nRECORDÁ: esto fue solo una LISTA. No se tocó ningún precio en ML.`); return; }
      // Se aplican los grupos A (sin variantes) y B (con variantes), ambos con suba ≤25% y sin cruzar
      // los $33.000. Quedan afuera C y C1, que son los que hay que mirar a mano.
      const candidatos = subir.concat(conVar);
      const objetivo = DESTINO === 'todos' ? candidatos
        : /^MLA/i.test(DESTINO) ? candidatos.filter((f) => f.mla === DESTINO)
        : candidatos.filter((f) => (f.nom + ' ' + f.prod).toLowerCase().includes(DESTINO.toLowerCase()));
      if (!objetivo.length) { console.log(`\nNo hay nada para aplicar con destino "${DESTINO}".`); return; }
      const nVarTot = objetivo.reduce((s, f) => s + (f.nVar ? f.tocar.length : 0), 0);
      console.log(`\n══ APLICANDO ${objetivo.length} publicacion${objetivo.length > 1 ? 'es' : ''} en ML`
        + (nVarTot ? ` (${nVarTot} variantes)` : '') + ` ══`);
      let ok = 0, err = 0; const hechos = [];
      // Freno de seguridad para variantes: si la PRIMERA publicación con variantes vuelve mal de la
      // verificación (se borró alguna, o el precio no quedó), no se toca ninguna más.
      let varProbada = false, varAbortado = false;
      for (const f of objetivo) {
        if (f.nVar) {
          if (varAbortado) { err++; console.log(`  ⊘ ${f.mla} · ${f.nom}: salteada (la prueba de variantes falló)`); continue; }
          const nuevos = {}; for (const u of f.tocar) nuevos[String(u.varId)] = u.nuevo;
          const r = DRY ? { ok: false, err: 'DRY' } : await raiseVariations(f.mla, nuevos, f.tok);
          if (r.ok) {
            ok++;
            for (const c of r.cambios) hechos.push({ nom: f.nom + ' · variante', from: c.from, to: c.to });
            console.log(`  ✓ ${f.mla} · ${f.nom}: ${r.cambios.length} de ${f.nVar} variantes subidas`);
            r.cambios.forEach((c) => console.log(`      ${money(c.from)} → ${money(c.to)}`));
          } else {
            err++; console.log(`  ✗ ${f.mla} · ${f.nom}: no se pudo (${r.err})`);
            // Un error de verificación es grave: puede haber tocado la estructura de la publicación.
            if (String(r.err).startsWith('PELIGRO') || String(r.err).startsWith('precio-no-quedo')) {
              varAbortado = true;
              console.log(`  ⛔ FRENO: la verificación falló. No se toca ninguna publicación con variantes más. REVISAR ${f.mla} A MANO.`);
            } else if (!varProbada) {
              varAbortado = true;
              console.log(`  ⛔ FRENO: la primera con variantes falló. No sigo con el resto hasta entender por qué.`);
            }
          }
          varProbada = true;
          continue;
        }
        const mult = f.nuevo / f.precio; // raisePrice recalcula sobre el precio real de ML y nunca baja
        const r = DRY ? { ok: false, err: 'DRY' } : await raisePrice(f.mla, null, mult, f.tok);
        if (r.ok) { ok++; hechos.push({ nom: f.nom, from: r.from, to: r.to }); console.log(`  ✓ ${f.mla} · ${f.nom}: ${money(r.from)} → ${money(r.to)}`); }
        else { err++; console.log(`  ✗ ${f.mla} · ${f.nom}: no se pudo (${r.err})`); }
      }
      console.log(`\nListo: ${ok} aplicados, ${err} con error.`);
      // Aviso por Telegram: cada cambio de precio tiene que quedar avisado, aunque lo haya hecho
      // este comando a mano y no el automático (que además está sujeto al switch de Ajustes).
      if (hechos.length) {
        const lista = hechos.slice(0, 25).map((h) => `· ${h.nom}: ${money(h.from)} → <b>${money(h.to)}</b>`).join('\n');
        await sendTelegram(`🔼 <b>Precios actualizados a mano</b>\n`
          + `${hechos.length} publicacion${hechos.length > 1 ? 'es' : ''} llevada${hechos.length > 1 ? 's' : ''} al piso de ${(MIN * 100).toFixed(0)}% `
          + `(destino ${(T * 100).toFixed(0)}%)\n\n${lista}`
          + (hechos.length > 25 ? `\n… y ${hechos.length - 25} más` : '')
          + (err ? `\n\n⚠️ ${err} no se pudieron aplicar.` : ''));
      }
      return;
    }
    // BILLING_PROBE=piso:<margen>[:<YYYY_MM,...>] → SIMULA UN PISO DE MARGEN SUBIENDO PRECIOS (no
    // cortando). Por cada producto bajo el piso calcula cuánto hay que subir el precio para llegar,
    // qué ganancia daría si el volumen aguanta, y cuánto volumen podés perder antes de que hubiera
    // sido mejor no tocarlo. Además compara el resultado de CYC con RETIRO FIJO vs RETIRO 15% DEL NETO
    // (que es la política de la web) — que es lo que decide si el piso 25% alcanza o no.
    if (String(process.env.BILLING_PROBE || '').startsWith('piso')) {
      const _pp = String(process.env.BILLING_PROBE).split(':');
      const FLOOR = (parseFloat(_pp[1]) || 30) / 100;
      const pickYM = (_pp[2] || '2026_06,2026_07').split(',').map((s) => s.trim()).filter(Boolean);
      const MLX = { adriana: 4.07, luciana: 4.37, ayelen: 5.95, matias: 4.58 };
      const mlxOf = (c) => { const v = MLX[(c || '').toLowerCase()]; return v != null ? v : 4.8; };
      const vp = (await db.get('cyc/ventaprod')) || {};
      const compras = (await db.get('cyc/compras')) || {};
      const retiros = (await db.get('cyc/retiro_mes')) || {};
      const fin = (await db.get('cyc/finanzas')) || {};
      const tc = parseFloat(fin.tipo_cambio) || 1500;
      const pIdx = {}; for (const p of products) pIdx[p.id] = p;
      const now = new Date();
      let spanDays = 0;
      for (const ym of pickYM) {
        const [yy, mm] = ym.split('_').map(Number);
        if (now.getFullYear() === yy && now.getMonth() + 1 === mm) spanDays += now.getDate();
        else spanDays += new Date(yy, mm, 0).getDate();
      }
      const perMonth = (x) => x / spanDays * 30;
      // Gastos fijos y retiros: son montos MENSUALES, se promedian por cantidad de meses (no por días).
      let gTot = 0;
      for (const g of Object.values(compras)) {
        if (!g || g.tipo === 'mercaderia') continue;
        if (pickYM.includes((g.dayKey || '').slice(0, 7))) gTot += g.monto || 0;
      }
      const gastosProm = gTot / pickYM.length;
      let rTot = 0, rN = 0;
      for (const ym of pickYM) if (retiros[ym] != null) { rTot += Number(retiros[ym]); rN++; }
      const retiroFijoProm = rN ? rTot / rN : 0;
      // Agregado por producto
      const byProd = {};
      for (const [k, ents] of Object.entries(vp)) {
        if (!pickYM.includes(k.slice(0, 7))) continue;
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada) continue;
          const neto = v.neto || 0; if (neto <= 0) continue;
          const id = v.prodId || v.prod || '?';
          const b = byProd[id] || (byProd[id] = { nom: v.prod || id, ventas: 0, qty: 0, neto: 0, mlx: 0 });
          b.ventas++; b.qty += v.qty || 1; b.neto += neto; b.mlx += (v.total || 0) * mlxOf(v.cuenta) / 100;
        }
      }
      // Subir el precio ×k hace que el neto y el cargo ML escalen ×k (ambos son % del precio).
      // Margen = (k·neto − cMerc − k·mlx)/(cMerc + k·mlx) = FLOOR  →  k = cMerc(1+F)/(neto − mlx(1+F))
      const rows = [];
      let netoRealTot = 0;
      for (const [id, b] of Object.entries(byProd)) {
        const p = pIdx[id]; const cU = p ? costoPesos(p, 1, tc).costo : 0;
        if (!cU) continue;
        const cMerc = cU * b.qty, costo = cMerc + b.mlx, gan = b.neto - costo;
        const mg = costo > 0 ? gan / costo : 0;
        netoRealTot += b.neto;
        let k = null, ganNew = gan, netoNew = b.neto, suba = 0, tol = 0;
        if (mg < FLOOR) {
          const den = b.neto - b.mlx * (1 + FLOOR);
          if (den > 0) {
            k = cMerc * (1 + FLOOR) / den;
            suba = (k - 1) * 100;
            ganNew = FLOOR * (cMerc + k * b.mlx);
            netoNew = b.neto * k;
            tol = ganNew > 0 ? (1 - gan / ganNew) * 100 : 0;
          }
        }
        rows.push({ nom: b.nom, ventas: b.ventas, mg: mg * 100, gan, ganNew, neto: b.neto, netoNew, suba, tol, bajo: mg < FLOOR && k != null, cMerc, mlx: b.mlx, mlxNew: (mg < FLOOR && k != null) ? b.mlx * k : b.mlx });
      }
      const ganActual = rows.reduce((s, r) => s + r.gan, 0);
      const ganSube = rows.reduce((s, r) => s + r.ganNew, 0);
      const netoSube = rows.reduce((s, r) => s + r.netoNew, 0);
      const bajos = rows.filter((r) => r.bajo).sort((a, b) => b.gan - a.gan);
      console.log(`=== PISO DE MARGEN ${(FLOOR * 100).toFixed(0)}% SUBIENDO PRECIOS · meses ${pickYM.join(', ')} (${spanDays} días) ===\n`);
      console.log(`── 1. CUÁNTO HAY QUE SUBIR CADA PRODUCTO QUE ESTÁ BAJO EL PISO (${bajos.length} prods) ──`);
      console.log(`   (tolerancia = cuánto volumen podés perder y aun así ganar lo mismo que hoy)\n`);
      for (const r of bajos) console.log(`  ${String(Math.round(r.mg)).padStart(3)}% → subir precio ${('+' + r.suba.toFixed(1) + '%').padStart(7)} · gan/mes ${money(Math.round(perMonth(r.gan))).padStart(10)} → ${money(Math.round(perMonth(r.ganNew))).padStart(10)} · tolerás perder ${String(Math.round(r.tol)).padStart(3)}% de las ventas · ${String(r.ventas).padStart(3)}v · ${r.nom.slice(0, 32)}`);
      const subaProm = bajos.length ? bajos.reduce((s, r) => s + r.suba, 0) / bajos.length : 0;
      const tolProm = bajos.length ? bajos.reduce((s, r) => s + r.tol, 0) / bajos.length : 0;
      console.log(`\n  Suba PROMEDIO necesaria: +${subaProm.toFixed(1)}% · tolerancia promedio de pérdida de volumen: ${tolProm.toFixed(0)}%`);
      console.log(`\n── 2. GANANCIA SEGÚN CUÁNTO VOLUMEN SE PIERDA EN LOS PRODUCTOS SUBIDOS ──`);
      console.log(`  hoy (sin tocar nada):        ${money(Math.round(perMonth(ganActual)))}/mes`);
      for (const perd of [0, 10, 20, 30, 40, 50]) {
        const g = rows.reduce((s, r) => s + (r.bajo ? r.ganNew * (1 - perd / 100) : r.gan), 0);
        const d = perMonth(g - ganActual);
        console.log(`  si perdés ${String(perd).padStart(2)}% de esas ventas: ${money(Math.round(perMonth(g))).padStart(12)}/mes  (${d >= 0 ? '+' : '−'}${money(Math.abs(Math.round(d)))})`);
      }
      // ── 3. La pregunta de fondo: ¿alcanza el piso con retiro 15% del neto?
      const costoProm = perMonth(netoRealTot - ganActual);
      console.log(`\n── 3. ¿ALCANZA? · CYC según el margen PROMEDIO y cómo se calcula el retiro ──`);
      console.log(`  Base real: costo+ML ${money(Math.round(costoProm))}/mes · gastos fijos ${money(Math.round(gastosProm))}/mes`);
      console.log(`  Retiro REAL que vienen cargando: ${money(Math.round(retiroFijoProm))}/mes fijo = ${(retiroFijoProm / perMonth(netoRealTot) * 100).toFixed(1)}% del neto\n`);
      console.log(`  margen │ ganancia/mes │ retiro FIJO ${money(Math.round(retiroFijoProm))} → CYC │ retiro 15% del neto → CYC`);
      for (const mPct of [20, 25, 28, 30, 32, 35, 40]) {
        const m = mPct / 100;
        const ganM = m * costoProm, netoM = costoProm * (1 + m);
        const cycFijo = ganM - gastosProm - retiroFijoProm;
        const ret15 = netoM * 0.15;
        const cyc15 = ganM - gastosProm - ret15;
        const f = (x) => (x >= 0 ? ' ' : '') + money(Math.round(x));
        console.log(`   ${String(mPct).padStart(3)}%  │ ${money(Math.round(ganM)).padStart(11)}  │ ${f(cycFijo).padStart(16)}      │ retiro ${money(Math.round(ret15))} → ${f(cyc15)}`);
      }
      // Margen de equilibrio con retiro 15% del neto: m·C − 0.15·C·(1+m) − G = 0 → m = (G/C + .15)/.85
      const beFijo = (gastosProm + retiroFijoProm) / costoProm * 100;
      const be15 = ((gastosProm / costoProm) + 0.15) / 0.85 * 100;
      console.log(`\n  → EQUILIBRIO (CYC = 0) con retiro FIJO ${money(Math.round(retiroFijoProm))}: ${beFijo.toFixed(1)}% de margen`);
      console.log(`  → EQUILIBRIO (CYC = 0) con retiro 15% DEL NETO:  ${be15.toFixed(1)}% de margen`);
      // ── 4. Cuánto del margen se lo come el cargo de ML (IIBB). Los productos "bajo el piso" están
      //      bajo el piso justamente porque ahora ese cargo SÍ se cuenta como costo.
      const cMercTot = rows.reduce((s, r) => s + r.cMerc, 0);
      const mlxTot = rows.reduce((s, r) => s + r.mlx, 0);
      const mlxNewTot = rows.reduce((s, r) => s + r.mlxNew, 0);
      const mgHoyCon = ganActual / (cMercTot + mlxTot) * 100;
      const mgHoySin = (netoRealTot - cMercTot) / cMercTot * 100;
      const mgPisoCon = ganSube / (cMercTot + mlxNewTot) * 100;
      const mgPisoSin = (netoSube - cMercTot) / cMercTot * 100;
      console.log(`\n── 4. CUÁNTO PESA EL CARGO DE ML (IIBB) EN EL MARGEN ──`);
      console.log(`  Costo mercadería ${money(Math.round(perMonth(cMercTot)))}/mes + cargo ML ${money(Math.round(perMonth(mlxTot)))}/mes = ${(mlxTot / (cMercTot + mlxTot) * 100).toFixed(1)}% del costo total`);
      console.log(`  Margen HOY:           ${mgHoyCon.toFixed(1)}% contando el IIBB   →  ${mgHoySin.toFixed(1)}% si NO se contara (como se medía antes)`);
      console.log(`  Margen con piso ${(FLOOR * 100).toFixed(0)}%:  ${mgPisoCon.toFixed(1)}% contando el IIBB   →  ${mgPisoSin.toFixed(1)}% si NO se contara`);
      console.log(`  → Un piso de ${(FLOOR * 100).toFixed(0)}% "de ahora" equivale a pedir ${(FLOOR * 100 * (mgPisoSin / mgPisoCon)).toFixed(1)}% "de los de antes".`);
      console.log(`\n  Con el piso ${(FLOOR * 100).toFixed(0)}% aplicado y volumen intacto, el margen promedio quedaría en ` +
        `${((ganSube / (netoSube - ganSube)) * 100).toFixed(1)}% → CYC con retiro 15%: ${money(Math.round(perMonth(ganSube) - gastosProm - perMonth(netoSube) * 0.15))}/mes`);
      return;
    }
    // BILLING_PROBE=prodmargin:<días> → GANANCIA REAL por producto. Junta neto y precio de cada
    // producto, le resta el costo (costo USD + envío) × dólar, y le aplica el descuento del débito de
    // ML (~8.5% del neto, que no está en el neto). Ordena de peor a mejor margen.
    if (String(process.env.BILLING_PROBE || '').startsWith('prodmargin')) {
      const parts = String(process.env.BILLING_PROBE).split(':');
      const days = parseInt(parts[1], 10) || 60;
      const DEB = parts[2] != null ? parseFloat(parts[2]) : 0.085; // ratio débito ML sobre neto
      const fromKey = dayKeyFromISO(Date.now() - (days - 1) * 864e5);
      const vp = (await db.get('cyc/ventaprod')) || {};
      const fin = (await db.get('cyc/finanzas')) || {};
      const tc = parseFloat(fin.tipo_cambio) || 1500;
      const byProd = {};
      for (const [k, ents] of Object.entries(vp)) {
        if (k < fromKey) continue;
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada || v.origen !== 'ml-api') continue;
          const total = v.total || 0, neto = v.neto || 0, qty = v.qty || 1;
          if (total <= 0 || neto <= 0) continue;
          const id = v.prodId || v.prod || '?';
          const b = byProd[id] || (byProd[id] = { nom: v.prod || id, ventas: 0, qty: 0, total: 0, neto: 0 });
          b.ventas++; b.qty += qty; b.total += total; b.neto += neto;
        }
      }
      const rows = []; let sinCosto = 0;
      for (const [id, b] of Object.entries(byProd)) {
        const p = products.find((pp) => pp.id === id);
        let cu = 0, ship = 0, cfu = null;
        if (p) {
          cu = (p.costUSD != null && p.costUSD !== '') ? (parseFloat(p.costUSD) || 0) : 0;
          ship = parseFloat(p.shipUSD) || 0;
          if (p.costFullUSD != null && p.costFullUSD !== '') cfu = parseFloat(p.costFullUSD) || 0;
        }
        const costFullUSD = cfu != null ? cfu : (cu + ship);
        if (!costFullUSD) { sinCosto++; continue; }
        const costoPesos = costFullUSD * tc * b.qty;
        const netoReal = b.neto * (1 - DEB);
        const netoPct = b.neto / b.total * 100;      // % del precio que te queda tras comisión ML
        const costoPct = costoPesos / b.total * 100; // % del precio que es costo de producto
        const ganRealPct = (netoReal - costoPesos) / b.total * 100;
        const ganWebPct = (b.neto - costoPesos) / b.total * 100;
        rows.push({ nom: b.nom, ventas: b.ventas, precio: b.total / b.ventas, netoPct, costoPct, ganWebPct, ganRealPct });
      }
      rows.sort((a, c) => a.ganRealPct - c.ganRealPct);
      const fmtRow = (r) => `  gana ${r.ganRealPct.toFixed(0).padStart(3)}% real (web ${r.ganWebPct.toFixed(0)}%) · precio ${money(Math.round(r.precio))} · te queda ${r.netoPct.toFixed(0)}% tras ML · costo ${r.costoPct.toFixed(0)}% · ${r.ventas}v · ${r.nom.slice(0, 34)}`;
      console.log(`GANANCIA REAL POR PRODUCTO (últimos ${days} días · dólar ${money(tc)} · débito ML ${(DEB * 100).toFixed(1)}%)\n`);
      console.log(`=== PEORES ${Math.min(15, rows.length)} (candidatos a AUMENTAR) ===`);
      for (const r of rows.slice(0, 15)) console.log(fmtRow(r));
      console.log(`\n=== MEJORES 8 ===`);
      for (const r of rows.slice(-8).reverse()) console.log(fmtRow(r));
      console.log(`\n(${rows.length} productos con costo cargado · ${sinCosto} sin costo, omitidos)`);
      return;
    }
    // BILLING_PROBE=unpost → borra los gastos DIARIOS de almacenamiento (almfull_*) que cargamos antes.
    if (process.env.BILLING_PROBE === 'unpost') {
      const compras = (await db.get('cyc/compras')) || {};
      const del = {}; let n = 0;
      for (const [id, x] of Object.entries(compras)) {
        if (id.startsWith('almfull_') || (x && x.cat === 'Almacenamiento Full' && /diario/.test(x.desc || ''))) { del[id] = null; n++; }
      }
      if (!DRY && n) await db.patch('cyc/compras', del);
      console.log(`${DRY ? '(DRY) ' : ''}Borrados ${n} gastos diarios de almacenamiento.`);
      return;
    }
    // BILLING_PROBE=month → carga UN gasto mensual por período con el almacenamiento REAL guardado
    // (factura − comisión/fijo/envío). Idempotente: id almmes_<YYYY_MM>. dayKey = día 1 del mes.
    if (process.env.BILLING_PROBE === 'month') {
      const periods = (await db.get('cyc/mlapi/storage/periods')) || {};
      const upd = {}; let n = 0, sum = 0; const espera = [];
      for (const p of Object.values(periods)) {
        if (!p || !p.perAcct) continue;
        // Solo se carga un mes cuando su factura está COMPLETA: las 4 cuentas con almacenamiento real
        // calculado. Nunca un número parcial, inventado ni repetido del mes anterior. Si falta una
        // cuenta o todavía no cerró el período, se espera (no se carga nada para ese mes).
        const completo = labels.every((l) => { const x = p.perAcct[l.toLowerCase()]; return x && x.storage != null; });
        if (!completo || !(p.total > 0)) { espera.push(String(p.key)); continue; }
        const ym = String(p.key).slice(0, 7).replace('-', '_'); // 2026_07
        const id = 'almmes_' + ym;
        upd[id] = { id, monto: Math.round(p.total), cat: 'Almacenamiento Full', tipo: 'gasto', desc: `Almacenamiento Full ML (período ${p.key})`, dayKey: ym + '_01', ts: Date.now(), auto: true };
        n++; sum += Math.round(p.total);
      }
      if (!DRY && n) await db.patch('cyc/compras', upd);
      console.log(`${DRY ? '(DRY) ' : ''}Gasto mensual de almacenamiento: ${n} meses · total ${money(sum)}.`);
      for (const u of Object.values(upd)) console.log(`   ${u.dayKey.slice(0, 7)}: ${money(u.monto)}`);
      if (espera.length) console.log(`   (períodos incompletos, se esperan hasta tener las 4 cuentas: ${espera.join(', ')})`);
      return;
    }
    // BILLING_PROBE=seed → guarda directo el almacenamiento YA calculado del período 2026-07-01
    // (números exactos de la corrida de fees), sin volver a pegarle a ML. Instantáneo.
    if (process.env.BILLING_PROBE === 'seed') {
      const perAcct = {
        adriana: { bill: 1817026, fees: 1755302, storage: 61724 },
        ayelen: { bill: 1826477, fees: 1360851, storage: 465626 },
        luciana: { bill: 2420347, fees: 1926051, storage: 494296 },
        matias: { bill: 2245683, fees: 1867995, storage: 377688 },
      };
      const total = Object.values(perAcct).reduce((s, x) => s + x.storage, 0);
      const win = PERIOD_WIN['2026-07-01'];
      const rec = { key: '2026-07-01', from: new Date(win[0]).toISOString(), to: new Date(win[1]).toISOString(), days: Math.round((win[1] - win[0]) / 86400000) + 1, total, perAcct, ts: Date.now() };
      await db.set('cyc/mlapi/storage/periods/2026-07-01', rec);
      console.log(`✓ Sembrado almacenamiento 2026-07-01: TOTAL ${money(total)} · ${rec.days} días · ${money(Math.round(total / rec.days))}/día`);
      return;
    }
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
        // El costo de una venta YA HECHA no se toca nunca: es lo que costó esa mercadería ese día.
        // Si se reescribiera con el costo de hoy, cambiar un precio o separar un producto te
        // reescribiría la ganancia de meses cerrados. Solo se completa si la venta no tenía costo.
        if (!v.cancelada && !(v.costo > 0)) { updates[b + 'costo'] = costo; updates[b + 'costBaseUSD'] = costBaseUSD; updates[b + 'shipUSD'] = shipUSD; }
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
  // ── MONOTRIBUTO ───────────────────────────────────────────────────────────
  // cyc/monotributo = { impuesto:{cuenta:monto}, fijoMensual:n, desde:'YYYY_MM' }
  // Se carga a mano en Ajustes cada 6 meses (recategorización). Acá el robot hace dos cosas:
  //  1) IMPUESTO INTEGRADO: es un costo de VENDER (más facturás → categoría más alta), así que va
  //     al costo de cada producto como % del precio. El monto es fijo y la facturación varía, así
  //     que el % se recalcula con la facturación REAL de los últimos 90 días y se guarda en /pct.
  //     La app solo lee ese número: no tiene que recalcular nada por venta.
  //     Es UNO SOLO para las 4 cuentas a propósito: si cada cuenta tuviera el suyo, el precio del
  //     mismo producto cambiaría según dónde esté publicado y te empujaría a mudarlo de cuenta.
  //  2) AUTÓNOMO + OBRA SOCIAL: NO es costo de producto (es jubilación y salud de una persona),
  //     va como gasto del mes. Se carga solo el día 1 para no depender de acordarse.
  const mono = (await db.get('cyc/monotributo')) || {};
  {
    const imp = mono.impuesto || {};
    const totImp = Object.values(imp).reduce((s, x) => s + (parseFloat(x) || 0), 0);
    if (totImp > 0) {
      const vpAll = (await db.get('cyc/ventaprod')) || {};
      const desde = dayKeyFromISO(Date.now() - 89 * 864e5);
      let fact90 = 0;
      for (const [k, ents] of Object.entries(vpAll)) {
        if (k < desde) continue;
        for (const v of Object.values(ents || {})) {
          if (!v || v.cancelada) continue;
          fact90 += v.total || 0;
        }
      }
      const factMes = fact90 / 3; // 90 días ≈ 3 meses
      if (factMes > 0) {
        const pct = Math.round((totImp / factMes) * 10000) / 100; // % con 2 decimales
        if (mono.pct !== pct && !DRY) await db.patch('cyc/monotributo', { pct, pctCalc: Date.now(), pctFact: Math.round(factMes) });
        console.log(`Monotributo: ${money(Math.round(totImp))}/mes sobre ${money(Math.round(factMes))} facturados → ${pct}% al costo`);
      }
    }
    const fijo = parseFloat(mono.fijoMensual) || 0;
    if (fijo > 0) {
      const ymNow = dayKeyFromISO(new Date().toISOString()).slice(0, 7);
      const gid = 'monofijo_' + ymNow;
      let ya = null;
      try { ya = await db.get('cyc/compras/' + gid); } catch { /* */ }
      if (!ya) {
        const gasto = {
          id: gid, monto: Math.round(fijo), cat: 'Monotributo / Impuestos', tipo: 'gasto',
          desc: `Autónomo + obra social (${ymNow.replace('_', '-')})`,
          dayKey: ymNow + '_01', ts: Date.now(), auto: true,
        };
        if (!DRY) await db.patch('cyc/compras', { [gid]: gasto });
        console.log(`${DRY ? '(DRY) ' : ''}Cargado ${gid} = ${money(Math.round(fijo))} (autónomo + obra social).`);
      }
    }
  }

  const cfg = (await db.get('cyc/mlconfig')) || {};
  // SKIP_PRICES=1 → esta vuelta trae ventas pero NO toca precios. Lo usa el ciclo automático:
  // las ventas se sincronizan cada 2 minutos, pero el robot de precios corre una vez por hora.
  // Sin esto, bajar el intervalo a 2 minutos haría que el robot evalúe 720 veces por día en vez
  // de 14, y una publicación que queda justo en el piso empezaría a subir de a poco sin parar.
  const SKIP_PRICES = process.env.SKIP_PRICES === '1';
  const autoPrice = cfg.autoPrice !== false && !SKIP_PRICES; // por defecto ON (lo pediste)
  const autoPromo = cfg.autoPromo !== false; // sacar descuentos de ML — ON por defecto
  const autoStock = cfg.autoStock !== false; // cargar stock de ML al panel — ON por defecto
  // OJO: 30/32, no 40/42. Los valores viejos eran de cuando el margen se medía SIN IIBB ni
  // monotributo; con los impuestos adentro, pedir 42% es pedir ~65% de la escala vieja.
  const targetPct = parseFloat(cfg.targetPct) || 32; // margen objetivo (piso + 2 de colchón)
  const minPct = parseFloat(cfg.minPct) || 30;        // umbral para actuar
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
  const tokensRun = {}; // token de cada cuenta, para nivelar los grupos de precio al final
  for (const label of labels) {
    if (onlyAcc && label.toLowerCase() !== onlyAcc) continue;
    const acc = accounts[label];
    if (!acc?.refresh_token) continue;

    // 1) renovar token y guardar el nuevo refresh_token (ML lo rota)
    const t = await mlRefresh(ML_CLIENT_ID, ML_CLIENT_SECRET, acc.refresh_token);
    await db.patch('mlapi/tokens/' + label, { refresh_token: t.refresh_token, updated_ts: Date.now() });
    tokensRun[label] = t.access_token;

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
      let orderNetAmt = null, orderFeeAmt = 0, netFetched = false; // neto y cargos ML del pago (una vez por orden)
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
        if (!netFetched) {
          const fo = {};
          orderNetAmt = await orderNet(o, t.access_token, fo);
          orderFeeAmt = fo.mlfee || 0; netFetched = true;
          // Si ML todavía no descontó lo suyo, se avisa: la venta queda con el neto estimado y se
          // corrige sola en cuanto el pago se liquide (la ventana de sincronización son 2 días).
          if (orderNetAmt == null && !DRY) console.log(`  · venta ${o.id}: ML todavía no descontó su parte, uso el neto estimado (se corrige en la próxima vuelta)`);
        }
        const neto = (orderNetAmt != null && orderGross > 0)
          ? Math.round(orderNetAmt * (itemGross / orderGross))
          : netoFallback(itemGross, it.sale_fee, qty);
        const mlfee = (orderFeeAmt && orderGross > 0) ? Math.round(orderFeeAmt * (itemGross / orderGross)) : 0; // cargo ML por venta (para el almacenamiento mensual)
        const { costo, costBaseUSD, shipUSD } = p ? costoPesos(p, qty, tc) : { costo: 0, costBaseUSD: 0, shipUSD: 0 };
        const id = 'v' + o.id + '_' + idx;
        const obj = {
          id, saleId, prod: p ? p.name : title, prodId: p ? p.id : null, cuenta: label, qty,
          total: Math.round(itemGross),
          neto, mlfee,
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
          // Margen REAL = (neto − costo mercadería − cargo ML) ÷ (costo mercadería + cargo ML), igual
          // que la app. El cargo ML es un % del PRECIO, así que al subir el precio ×k también sube ×k:
          // por eso el multiplicador sale de   k = costo × (1+meta) / (neto − cargoML × (1+meta)).
          const mlx = itemGross * mlExtraPct(label) / 100;
          const costoTot = costo + mlx;
          const margen = (neto - costoTot) / costoTot;
          if (margen < minPct / 100) {
            const T = targetPct / 100;
            const _den = neto - mlx * (1 + T);
            const mult = _den > 0 ? (costo * (1 + T)) / _den : Infinity; // Infinity → cae en el aviso, no toca
            const unit = itemGross / qty;
            const sugUnit = isFinite(mult) ? Math.ceil((mult * unit) / 10) * 10 : 0;
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
                + (b.permalink || ''), 'baja');
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
      // HISTORIAL DE STOCK: se anota DESDE CUÁNDO un producto tiene stock. Hace falta para saber si
      // algo "no rota" de verdad o simplemente no había mercadería para vender: sin este dato, un
      // producto que estuvo agotado dos meses parece un fracaso de precio y no lo es.
      // Solo se guarda el cambio 0 → hay stock (y la fecha en que se quedó en cero), no un log entero.
      const invPrev = (await db.get('cyc/inventory')) || {};
      const histPrev = (await db.get('cyc/stockhist')) || {};
      const histUpd = {};
      for (const [k, v] of Object.entries(stockTot)) {
        const antes = Number(invPrev[k] || 0), ahora = Number(v || 0);
        const h = histPrev[k] || {};
        if (ahora > 0 && antes <= 0) histUpd[k] = { ...h, desde: Date.now() };       // volvió a haber stock
        else if (ahora <= 0 && antes > 0) histUpd[k] = { ...h, desde: null, cero: Date.now() }; // se agotó
        else if (ahora > 0 && !h.desde) histUpd[k] = { ...h, desde: Date.now() };    // primera vez que lo vemos con stock
      }
      if (Object.keys(histUpd).length) await db.patch('cyc/stockhist', histUpd);
      await db.patch('cyc/inventory', invUpd);
      console.log(`✓ Stock actualizado: ${Object.keys(stockTot).length} producto×cuenta.`
        + (Object.keys(histUpd).length ? ` · ${Object.keys(histUpd).length} cambios de stock anotados.` : ''));
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

  // NIVELAR GRUPOS DE PRECIO (ej: todos los Paulvic al mismo precio). Va al final, después
  // de que el robot pudo haber subido alguno: así se empareja igual quién lo haya movido.
  // En backfills no corre, para no tocar precios mientras se reprocesa el historial.
  // Tampoco se nivela en las vueltas rápidas (SKIP_PRICES): nivelar también escribe precios en ML.
  if (parseInt(process.env.BACKFILL_DAYS || '0', 10) === 0 && !onlyAcc && process.env.SKIP_PRICES !== '1') {
    try {
      const pName = {}; for (const p of products) pName[p.id] = p.name || '';
      const sellerIds = {}; for (const l of labels) if (accounts[l]?.seller_id) sellerIds[l] = accounts[l].seller_id;
      const avisos = await nivelarGrupos(db, map, tokensRun, DRY, pName, sellerIds);
      for (const a of avisos) await sendTelegram(a);
    } catch (e) { console.log('No pude nivelar los grupos de precio: ' + e.message); }
  }

  const pend = Object.values(map).filter((x) => x && !x.prodId).length;
  console.log(`\n✓ Listo. Renglones cargados: ${cargadas}. Publicaciones sin vincular: ${pend}.`);
  Object.values(map).filter((x) => x && !x.prodId).slice(0, 40).forEach((r) =>
    console.log('  · ' + r.title + '  → ' + (r.candidatos || []).map((c) => c.name).join(' | ')));
}

main().catch((e) => { console.error('✗ Error:', e.message); process.exit(1); });
