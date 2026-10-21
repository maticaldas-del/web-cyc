// Helpers compartidos: Firebase (leer/escribir el panel) + MercadoLibre (tokens).
// Node 20+ (fetch global). Sin dependencias externas.

const ML_TOKEN_URL = 'https://api.mercadolibre.com/oauth/token';
const ML_API = 'https://api.mercadolibre.com';

// ── Firebase: login del usuario "bot" (email/clave) → idToken para escribir ──
export async function fbSignIn(apiKey, email, password) {
  const r = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }) }
  );
  const d = await r.json();
  if (!r.ok) throw new Error('Firebase login falló: ' + (d.error?.message || r.status));
  return d.idToken; // válido ~1h, alcanza de sobra para una corrida
}

// ── Firebase Realtime DB por REST ──
// El idToken de Firebase caduca a la ~1h. Para corridas largas (backfill),
// pasamos `reauth` (una función que vuelve a loguear y devuelve un idToken
// nuevo): ante un 401, renovamos el token y reintentamos una vez.
export const dbConteo = { get: 0, reint: 0, fallos: 0, rutas: [] };
export function makeDB(dbUrl, idToken, reauth) {
  const base = dbUrl.replace(/\/$/, '');
  let token = idToken;
  const url = (p) => `${base}/${p}.json?auth=${token}`;
  // 21/10/2026: la base contestó 500 en varias lecturas de una revisión (ventas, nosubir, ficha) y la revisión decidió igual con
  // datos a medias. Ahora una LECTURA que falla por 5xx o por red se reintenta 3 veces (1 s, 3 s, 7 s) y, si igual falla, se anota en
  // `dbConteo` y al terminar la corrida sale "⚠️ DATOS INCOMPLETOS" (ver sync.mjs): con eso la revisión no decide. Las escrituras
  // no se reintentan solas (podrían duplicarse).
  async function req(path, opts, method) {
    const esLect = method === 'get'; let r = null, err = null;
    for (const espera of esLect ? [0, 1000, 3000, 7000] : [0]) {
      if (espera) { dbConteo.reint++; await new Promise((ok) => setTimeout(ok, espera)); }
      try {
        r = await fetch(url(path), opts); err = null;
        if (r.status === 401 && reauth) { token = await reauth(); r = await fetch(url(path), opts); }
        if (r.ok || r.status < 500) break;
      } catch (e) { err = e; r = null; }
    }
    if (esLect) dbConteo.get++;
    if (!r || !r.ok) { if (esLect) { dbConteo.fallos++; if (dbConteo.rutas.length < 15) dbConteo.rutas.push(String(path).split('/').slice(0, 3).join('/') + ' (' + (r ? r.status : 'red') + ')'); }
      throw new Error(`DB ${method} ${path}: ${r ? r.status : (err && err.message) || 'sin respuesta'}`); }
    return r.json();
  }
  const body = (value) => ({ headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) });
  return {
    get: (path) => req(path, {}, 'get'),
    set: (path, value) => req(path, { method: 'PUT', ...body(value) }, 'set'),
    patch: (path, value) => req(path, { method: 'PATCH', ...body(value) }, 'patch'),
  };
}

// ── MercadoLibre: intercambiar el "code" de autorización por tokens (una sola vez) ──
export async function mlExchangeCode(clientId, clientSecret, code, redirectUri) {
  const r = await fetch(ML_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', accept: 'application/json' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId, client_secret: clientSecret,
      code, redirect_uri: redirectUri,
    }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error('ML code exchange falló: ' + JSON.stringify(d));
  return d; // { access_token, refresh_token, user_id, ... }
}

// ── MercadoLibre: renovar el access_token con el refresh_token ──
// OJO: ML rota el refresh_token en cada renovación → hay que guardar el nuevo.
// ── CUÁNTO LE PEDIMOS A ML POR VUELTA (etapa 6 · A4, 21/10/2026, eligió la a) ──
// Cada vuelta (y cada comando) dice al terminar cuántas consultas hizo, cuántas cortó ML por cupo (429), cuántas se
// reintentaron y cuántas comisiones salieron de la memoria de la corrida. Sin el número no se puede saber qué vuelta gasta el
// cupo que después nos falta para leer las cajas. Lo imprime `sync.mjs` al salir (`mlConteoTxt`).
export const mlConteo = { get: 0, e429: 0, reint: 0, otrosErr: 0, comMemo: 0, refresh: 0, refreshReint: 0, ini: Date.now() };
export function mlConteoTxt() {
  const c = mlConteo, min = Math.max(1, Math.round((Date.now() - c.ini) / 60000));
  return `📞 consultas a ML en esta corrida: ${c.get} en ${min} min · cortadas por cupo (429): ${c.e429} · reintentadas: ${c.reint} · otros errores: ${c.otrosErr} · comisiones de memoria (no se volvieron a pedir): ${c.comMemo} · permisos renovados: ${c.refresh}${c.refreshReint ? ' (' + c.refreshReint + ' reintentados)' : ''}`;
}
const _esperaMs = (ms) => new Promise((ok) => setTimeout(ok, ms));
export async function mlRefresh(clientId, clientSecret, refreshToken) {
  // EL PERMISO SE REINTENTA (A4, 21/10/2026): un 429 o un 5xx de ML al renovar dejaba la cuenta afuera de TODA la vuelta (sin
  // ventas, sin stock). Con esos dos ML no procesó el pedido (el refresh_token no se gastó), así que reintentar es seguro: 3 s y 8 s.
  // Un 400 (invalid_grant) no se reintenta: ése no se arregla esperando.
  mlConteo.refresh++;
  for (const w of [0, 3000, 8000]) {
    if (w) { await _esperaMs(w); mlConteo.refreshReint++; }
    try { return await _mlRefresh1(clientId, clientSecret, refreshToken); }
    catch (e) { if (w === 8000 || !/ML refresh falló: (429|5\d\d) /.test(String((e && e.message) || e))) throw e; }
  }
}
async function _mlRefresh1(clientId, clientSecret, refreshToken) {
  const r = await fetch(ML_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', accept: 'application/json' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId, client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
    // Sin tope, una renovación colgada frenaba la vuelta entera ~5 min (revisión final, 30/09).
    signal: AbortSignal.timeout(25000),
  });
  // Etapa 4 (20/10/2026): se lee como TEXTO y después se intenta JSON. Un 429/403/5xx que viene en HTML (borde o
  // proxy de ML) tiraba "Unexpected token '<'" sin el código, y no se sabía qué había pasado. El error no lleva el
  // cuerpo entero (podría traer el token): código y los primeros 120 caracteres, sin tokens.
  const txt = await r.text();
  let d = null; try { d = JSON.parse(txt); } catch { d = null; }
  if (!r.ok || !d) throw new Error('ML refresh falló: ' + r.status + ' ' + _recorte(txt).replace(/(access|refresh)_token["':=\s]+[^"',\s}]+/gi, '$1_token=…'));
  return d; // { access_token, refresh_token (NUEVO), user_id, ... }
}

// ── MercadoLibre: llamada GET autenticada ──
// TIMEOUT OBLIGATORIO. Hasta el 26/08/2026 esto era un fetch pelado, sin límite de tiempo: si ML
// no contestaba una llamada, el robot se quedaba esperando PARA SIEMPRE. No es teoría — así se
// colgó el chequeo de la mañana ese día, tres veces: no terminaba tarde, no terminaba nunca, y
// GitHub lo mataba a los 45 minutos sin dejar ni una línea de log.
// 25 segundos es holgado a propósito: una llamada normal de ML tarda menos de 2. Lo que se corta
// acá es una llamada COLGADA, no una lenta. Al abortar, fetch tira error y el que llamó decide:
// casi todos los recorridos tienen try/catch y saltean ese renglón, que es lo correcto — perder
// un dato es mucho mejor que perder el informe entero.
// LAS COMISIONES SE PIDEN UNA VEZ POR CORRIDA (A4, 21/10/2026): `/sites/<sitio>/listing_prices?…` con el mismo precio, tipo y
// categoría da la misma comisión durante los minutos de una corrida, y la pedían varias funciones (netoweb, activar pausadas, el
// cerebro, candidatos…). La memoria es por ruta Y por permiso (la cuenta), de la corrida nomás (se va al terminar).
const _comMemo = new Map();
// EL 429 SE REINTENTA UNA VEZ ADENTRO (A4, 21/10/2026): ML corta por cupo y la mayoría de los lugares saltaban el dato (un producto
// sin medir, una caja sin leer) por un corte de un segundo. Una espera de ~2 s alcanza casi siempre. Los lugares que ya tenían su
// propia espera larga (4/10/20 s, 5/15/30 s) la siguen teniendo; esto va antes. `ML_REINTENTO_429=0` lo apaga.
export async function mlGet(path, accessToken, ms = 25000) {
  const esCom = /^\/sites\/[A-Z]{3}\/listing_prices\?/.test(String(path));
  const kCom = esCom ? path + '|' + String(accessToken || '').slice(-10) : '';
  if (esCom && _comMemo.has(kCom)) { mlConteo.comMemo++; return JSON.parse(_comMemo.get(kCom)); }
  const reint = process.env.ML_REINTENTO_429 !== '0';
  for (let intento = 0; ; intento++) {
    try {
      const d = await _mlGet1(path, accessToken, ms);
      if (esCom) _comMemo.set(kCom, JSON.stringify(d));
      return d;
    } catch (e) {
      const m = String((e && e.message) || e);
      const es429 = /^ML GET \S*: 429 /.test(m);
      if (es429) mlConteo.e429++; else mlConteo.otrosErr++;
      if (!es429 || !reint || intento >= 1) throw e;
      mlConteo.reint++;
      await _esperaMs(1800 + Math.round(Math.random() * 700));
    }
  }
}
async function _mlGet1(path, accessToken, ms) {
  mlConteo.get++;
  const r = await fetch(`${ML_API}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(ms),
  });
  // Etapa 4 (20/10/2026): primero el TEXTO, después JSON. Antes se hacía `r.json()` antes de mirar `r.ok`: un 429,
  // 403 o 5xx que ML (o su borde) contesta en HTML tiraba "Unexpected token '<'" SIN el código, y los reintentos que
  // buscan "429" en el mensaje no lo veían. Ahora el error es siempre `ML GET <ruta>: <código> <120 caracteres>`.
  const txt = await r.text();
  let d; try { d = JSON.parse(txt); } catch { d = undefined; }
  if (!r.ok) throw new Error(tapaIdsLargos(`ML GET ${path}: ${r.status} ${_recorte(d !== undefined ? JSON.stringify(d) : txt)}`));
  if (d === undefined) throw new Error(tapaIdsLargos(`ML GET ${path}: ${r.status} contestó algo que no es JSON: ${_recorte(txt)}`));
  return d;
}
// Los primeros 120 caracteres de una respuesta, en una línea (un HTML entero no sirve en el registro).
function _recorte(t) { return String(t == null ? '' : t).replace(/\s+/g, ' ').trim().slice(0, 120); }
// ETAPA 4 (20/10/2026): EL MENSAJE DE ERROR LLEVABA LA RUTA ENTERA, y `posventa`, `unreclamo` y `campos` lo imprimen en el registro
// de GitHub, que es PÚBLICO: el número de orden o de paquete del comprador salía entero aunque arriba se tapara con `_idPub`.
// Acá se tapan los números de 10 cifras o más que NO vienen pegados a letras (`MLA1234567890` queda: es la publicación, pública),
// dejando los últimos 3 para poder seguirlo. Sin espacios, así `ML GET <ruta>: <status>` se sigue leyendo igual (lo usan dos lugares).
export function tapaIdsLargos(t) { return String(t).replace(/(^|[^A-Za-z0-9])(\d{7,})(\d{3})(?!\d)/g, '$1…$3'); }

export { ML_API };
