// PROBAR LA PANTALLA DE VERDAD, NO SOLO LA SINTAXIS.
//
// Nació el 03/09/2026, cuando él reportó "se rompió la web, no muestra los productos ni nada".
// La causa: `flujoPlataHTML` usaba `fmtUSD`, que NO es una función global — era una variable
// LOCAL de renderProds. Al mudar la línea del dinero a su propia función quedó fuera de alcance
// y la ficha reventaba al dibujarse.
//
// EL PUNTO IMPORTANTE: `node --check` decía OK. El archivo era sintácticamente perfecto, la
// función existía, y sólo fallaba al EJECUTARSE. Es el mismo agujero que ya dejó la app rota dos
// veces seguidas el 21/08/2026 y que quedó anotado en CLAUDE.md como "lo que NO sirve para
// detectarlo es el chequeo de sintaxis". Esto es lo que sí sirve.
//
// Qué hace: arma un navegador de mentira mínimo, carga TODO el javascript de index.html, y llama
// a las ~45 funciones de dibujado. Cualquier "X is not defined" o "X is not a function" es un
// error real del código: la pantalla que use esa función va a quedar EN BLANCO.
//
// Cómo se usa:   node tools/probar-pantalla.mjs
// Correrlo ANTES de subir cualquier cambio que mueva código de lugar dentro de index.html.
import fs from 'fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const js = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n;\n');

const noop = () => {};
const el = new Proxy({}, {
  get: (t, k) => {
    if (k === 'style') return new Proxy({}, { get: () => '', set: () => true });
    if (k === 'classList') return { add: noop, remove: noop, toggle: noop, contains: () => false };
    if (k === 'querySelector' || k === 'querySelectorAll') return () => null;
    if (['appendChild', 'addEventListener', 'removeChild', 'setAttribute', 'focus', 'blur'].includes(k)) return noop;
    if (k === 'dataset') return {};
    if (['value', 'textContent', 'innerHTML'].includes(k)) return '';
    return undefined;
  },
  set: () => true,
});
// `navigator` en node moderno es de sólo lectura, así que va con defineProperty y no con assign.
const globales = {
  document: { getElementById: () => el, querySelector: () => el, querySelectorAll: () => [], addEventListener: noop, createElement: () => el, body: el, documentElement: el, head: el, cookie: '' },
  window: { addEventListener: noop, location: { href: '', search: '', hash: '' }, matchMedia: () => ({ matches: false, addEventListener: noop }), localStorage: { getItem: () => null, setItem: noop, removeItem: noop } },
  navigator: { serviceWorker: { register: () => Promise.resolve(), addEventListener: noop }, userAgent: 'node' },
  localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
  firebase: { initializeApp: () => ({}), database: () => ({ ref: () => ({ on: noop, once: () => Promise.resolve({ val: () => null }), update: () => Promise.resolve(), set: () => Promise.resolve(), remove: () => Promise.resolve(), push: () => ({ key: 'k' }) }) }), auth: () => ({ onAuthStateChanged: noop }) },
  Chart: Object.assign(function () { return { update: noop, destroy: noop }; }, { defaults: { color: '', borderColor: '' } }),
  fetch: () => Promise.resolve({ json: () => Promise.resolve({}), ok: true, text: () => Promise.resolve('') }),
  addEventListener: noop, removeEventListener: noop, setInterval: () => 0, setTimeout: () => 0,
  alert: noop, confirm: () => false, prompt: () => null,
};
for (const [k, v] of Object.entries(globales)) {
  try { Object.defineProperty(globalThis, k, { value: v, writable: true, configurable: true }); } catch { /* ya existe y no se puede pisar */ }
}

const renders = [...new Set([...js.matchAll(/\bfunction\s+(render[A-Za-z_$][\w$]*)\s*\(/g)].map((m) => m[1]))];
const arranque = `
  state.products=[{id:'ptest',name:'Producto Prueba',costUSD:10,cost:15000,shipUSD:0.1,gestFull:334,
    netoCalcPrecio:4620,netoCalc:2597,netoCalcEnvio:334,devPct:0,variantes:[]}];
  state.finanzas={tipo_cambio:1535}; state.mlconfig={minPct:25,targetPct:32};
  state.ventaprod={};state.compras={};state.inventory={};state.mllinks={};state.pedidos=[];state.pedidos_py=[];
  const _rotas=[];
  for(const n of ${JSON.stringify(renders)}){
    try{ eval(n)(); }catch(e){
      // Lo que revienta por el navegador falso NO cuenta: se buscan errores del CÓDIGO.
      // Se saltean las que necesitan argumentos obligatorios (dan otro tipo de error).
      if(/is not defined|is not a function/.test(e.message))_rotas.push(n+'  →  '+e.message);
    }
  }
  globalThis.__rotas=_rotas; globalThis.__total=${renders.length};
`;
try {
  new Function(js + arranque)();
} catch (e) {
  console.log('💥 EL SCRIPT NI SIQUIERA CARGA:\n   ' + e.message);
  process.exit(1);
}
const rotas = globalThis.__rotas || [];
if (rotas.length) {
  console.log('💥 ' + rotas.length + ' función(es) de dibujado rotas:\n');
  rotas.forEach((r) => console.log('   ' + r));
  console.log('\nLa pantalla que las use va a quedar EN BLANCO. No subir así.');
  process.exit(1);
}
console.log(`✓ Las ${globalThis.__total} funciones de dibujado corren sin errores de código.`);
