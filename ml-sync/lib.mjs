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
export function makeDB(dbUrl, idToken, reauth) {
  const base = dbUrl.replace(/\/$/, '');
  let token = idToken;
  const url = (p) => `${base}/${p}.json?auth=${token}`;
  async function req(path, opts, method) {
    let r = await fetch(url(path), opts);
    if (r.status === 401 && reauth) {
      token = await reauth();
      r = await fetch(url(path), opts);
    }
    if (!r.ok) throw new Error(`DB ${method} ${path}: ${r.status}`);
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
export async function mlRefresh(clientId, clientSecret, refreshToken) {
  const r = await fetch(ML_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', accept: 'application/json' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId, client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error('ML refresh falló: ' + JSON.stringify(d));
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
export async function mlGet(path, accessToken, ms = 25000) {
  const r = await fetch(`${ML_API}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(ms),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(`ML GET ${path}: ${r.status} ${JSON.stringify(d)}`);
  return d;
}

export { ML_API };
