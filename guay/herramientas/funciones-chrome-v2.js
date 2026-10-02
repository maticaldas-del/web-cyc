// FUNCIONES DE GUAY v2 (02/10/2026) para las pestañas de https://listado.mercadolibre.com.ar/...
// Reemplaza a funciones-chrome.js.
// Se cargan desde la PC con serve.ps1 corriendo:
//   eval(await (await fetch('http://127.0.0.1:8765/funciones-chrome-v2.js')).text())
// (serve.ps1 sirve guay-datos: copiar este archivo ahí.)  Luego: await runFile('q-t8.txt', 0, 200, 't8a')
// El resultado de cada tanda se guarda solo en guay-datos/res-<clave>.json.
// Si la pestaña no puede leer 127.0.0.1 (Chrome pide permiso de "red local"): pegar este archivo entero en la consola,
// guardarlo en localStorage 'guayfn', y en las otras pestañas de listado: eval(localStorage.getItem('guayfn'))
// y scan(clave, lista, 0.15, 25).

window.LS = 'http://127.0.0.1:8765/';
window.norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
// filtro grueso (realista) de margen: (P×0,75 − 8.730) / (USD×1,17×1.535) − 1. SÓLO para descartar.
window.estM = (P, usd) => (P * 0.75 - 8730) / (usd * 1.17 * 1535) - 1;
window.__mlres = window.__mlres || {}; window.SC = window.SC || {};

// Búsqueda de ML: cada tarjeta "polycard" trae catálogo, precio de la que gana, vendidos (de la familia), Full.
window.mlSearch = async (q) => {
  const raw = await (await fetch('/' + q.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-'))).text();
  const h = raw.replace(/\\u002F/g, '/').replace(/\\"/g, '"');
  const pos = []; let re = /"polycard":\{/g, m; while ((m = re.exec(h))) pos.push(m.index); pos.push(h.length);
  const res = [];
  for (let i = 0; i < pos.length - 1; i++) {
    const c = h.slice(pos[i], Math.min(pos[i + 1], pos[i] + 12000)); const g = r => (c.match(r) || [])[1];
    res.push({id: g(/"id":"(MLA\d+)"/), pid: g(/"product_id":"(MLA\d+)"/), t: (g(/"title":\{"text":"([^"]+)"/) || ''), p: +(g(/"price":(\d+)/) || 0), sold: +(g(/"sold_quantity":(\d+)/) || 0), full: /full_icon/.test(c), intl: /cbt_|cross_border|_cbt/i.test(c)});
  }
  return res;
};

// Palabras genéricas (portugués/castellano) que no son marca ni modelo.
window.GEN = /^(pilhas|parede|bateria|baterias|batería|kit|cargador|carregador|carros|mesa|base|estojo|suporte|magnetico|magnético|duplo|usb|fonte|alimentacao|alimentação|dock|carga|power|bank|powerbank|adap\.?|enchufe|universal|estacao|estação|carro|cabo|roteador|disco|ssd|cartao|cartão|memoria|memória|controle|microfone|secador|adaptador|luz|ring|jogo|cooler|placa|filtro|lente|tripe|tripé|capa|case|mini|portatil|portátil|externo|interno|sem|fio|gamer|de|para|com|e|do|da|o|a|batom|po|pó|rimel|rímel|mascara|máscara|sombra|paleta|delineador|corretivo|primer|iluminador|blush|gloss|lapis|lápis|creme|serum|sérum|protetor|solar|hidratante|locao|loção|shampoo|condicionador|esmalte|pincel|esponja|fixador|demaquilante|agua|água|micelar|tonico|tônico|gel|oleo|óleo|labial|liquido|líquido|facial|capilar|corporal|monopé|bolsa|mochila|alca|alça|correia|funda|capinha|pelicula|película|vidro|temperado|anel|lampada|lâmpada|painel|led|refletor|softbox|game|videogame|fan|ventoinha|water|colonia|colônia|ampola|tratamento|perfume|body|splash|tinta|coloracao|coloração|escova|alisador|prancha|chapinha|modelador|babyliss|sistema|ponto|acesso|router|relogio|relógio|fone|fones|ouvido|caixa|som|teclado|mouse|cartucho|oculos|óculos|pendrive|camera|câmera|aparelho|maquina|máquina|cortador|aparador|barbeador|depilador|escovas|eletrica|elétrica|eletrico|elétrico|smart|inteligente|tomada|lampada|interruptor|sensor)$/i;
window.SPEED = /^(ac|ax|be|n)\d{3,5}$|^\d+(mah|w|gb|tb|g|mm|ml|kw|mbps|mbs|ghz|gbps|k|x|v|mb|hz|cm|m|l|kg|rpm)$|^(uhs\w*|u[13]|v[369]0|c10|a[12]|gen\d+|qc\d*|pd\d*|usb\w*|typec|tipoc|wifi\d*|ipx\d|ip6\d)$/;
window.BR = ('kingston keepdata sandisk toshiba western seagate lexar ftx tp-link tplink xiaomi mercusys ubiquiti hikvision teltonika grandstream huawei cudy philips baseus smallrig godox gopro targus apple samsung ugreen sony mega 4life satechi baofeng havit quanta yongnuo canon nikon belkin ecoflow hyperjuice hyper kolke rokid hori dji spigen argom satellite gravastar g-tide link-it starstore hypershell xion jbl logitech razer redragon corsair hyperx fifine boya rode saramonic maono shure babyliss remington wahl gama conair revlon dyson panasonic braun nintendo playstation xbox gamesir 8bitdo dualsense dualshock thermalright deepcool noctua arctic nzxt asus msi gigabyte adata crucial kingspec xpg teamgroup patriot evga seasonic aerocool elgato neewer ulanzi zhiyun tiktok amazfit haylou qcy soundpeats anker edifier jabra sennheiser hollyland fujifilm insta360 oculus nokia motorola lenovo weikang mibro ' +
  'maybelline loreal revlon nyx mac vult dailus neutrogena nivea cerave vichy avene bioderma clinique lancome dior chanel estee kiko essence catrice elf benefit urban huda fenty rare kylie natura eudora payot garnier pantene dove kerastase wella schwarzkopf tresemme elseve redken lola haskell bourjois rimmel milani physicians covergirl almay isdin eucerin cetaphil ordinary sephora tarte morphe anastasia smashbox nars bobbi shiseido ponds avon jequiti oceane principia sallve simple sinful sirui manfrotto benro joby peak tether otterbox uag ringke nillkin esr pitaka zagg mous rhinoshield caseology supcase gear4 incipio tech21 speck pela casetify moment sandmarc freewell kase nisi tiffen hoya polarpro kf feiyu hohem deity tascam zoom comica movo lume viltrox meike 7artisans ttartisans sigma tamron truss kerasys elizavecca medicube cosrx anua skin1004 beauty round laneige innisfree missha some purito klairs victoria victorias bath ariana lattafa stella mondial taiff enzo vgr laifen wavytalk ga.ma gama onida krab alyon philco oster arno britania multilaser intelbras positivo epson hp brother kodak garmin polar coros suunto fitbit tile chipolo ring blink eufy tapo yale sonoff broadlink').split(' ');

window.capsOf = (name) => { const m = [...name.matchAll(/(\d+(?:[.,]\d+)?)\s*(gb|tb|mah|ml|g)\b/gi)].map(x => (x[1].replace(/[.,]/g, '') + x[2]).toLowerCase()); return [...new Set(m)]; };
window.cleanQ = q => { const w = q.split(/\s+/); while (w.length > 1 && GEN.test(w[0])) w.shift(); return w.join(' '); };

// Arma la consulta: marca (de la lista BR, o la primera palabra no genérica) + código de modelo + capacidad.
window.bigQ0 = (name) => {
  const w = name.replace(/[()\/,+]/g, ' ').split(/\s+/).filter(Boolean);
  let bi = w.findIndex(x => BR.includes(x.toLowerCase())); if (bi < 0) bi = w.findIndex(x => !GEN.test(x)); if (bi < 0) bi = 0;
  let brand = norm(w[bi]); if (brand === 'western') brand = 'wd';
  let pi = -1;
  for (const digitOnly of [false, true]) {
    for (let j = bi + 1; j < w.length && pi < 0; j++) {
      const nx = norm(w[j]);
      const ok = digitOnly ? /^\d{4,6}$/.test(nx) && !/^(1000|2000|3000|5000|10000|20000)$/.test(nx) : (/\d/.test(nx) && /[a-z]/.test(nx) && nx.length >= 2 && !SPEED.test(nx));
      if (ok) pi = j;
    }
    if (pi >= 0) break;
  }
  const caps = capsOf(name); let key = null, qw;
  if (pi >= 0) {
    const seg = w[pi].split('-'); let nx = norm(w[pi]); if (seg.length > 1 && norm(seg[0]).length >= 5) nx = norm(seg[0]);
    const short = nx.length < 5; key = short ? norm(w[pi - 1]) + nx : nx;
    qw = [w[bi]]; if (short && pi - 1 > bi) qw.push(w[pi - 1]); qw.push(seg.length > 1 && norm(seg[0]).length >= 5 ? seg[0] : w[pi]);
  } else { qw = w.slice(bi).filter(x => !GEN.test(x) && !/^(mb|s|sata|gb|tb|w)$/i.test(x)).slice(0, 5); }
  const q = (qw.join(' ') + ' ' + caps.map(c => c.replace(/(\d)([a-z])/, '$1 $2')).join(' ')).trim();
  return {q, brand, key, caps};
};
window.bigQ = (name) => { const B = bigQ0(name); const w = name.replace(/[()\/,+]/g, ' ').split(/\s+/); const tok = w.find(x => B.key && B.key.endsWith(norm(x)) && norm(x).length >= 2 && norm(x).length < 5 && /\d/.test(x)); B.re = tok ? new RegExp('(^|[^a-z0-9])' + tok.toLowerCase().replace(/[^a-z0-9]/g, '[- ]?') + '([^a-z0-9]|$)') : null; return B; };

// ¿El título de ML es el mismo producto? marca + misma capacidad + código (o, sin código, 75% de las palabras y todos los números).
window.match2 = (B, t) => {
  const nt = norm(t); const bOk = nt.includes(B.brand) || (B.brand === 'wd' && nt.includes('westerndigital'));
  if (B.brand && !bOk) return false;
  if (B.caps.length && !B.caps.every(c => nt.includes(c))) return false;
  if (B.key) return (nt.includes(B.key) || (B.re && B.re.test(t.toLowerCase()))) ? 'C' : false;
  const ws = B.q.split(/\s+/).slice(1).map(norm).filter(x => x && !B.caps.some(c => c.startsWith(x)));
  if (!ws.length) return 'N';
  const nums = ws.filter(x => /^\d+$/.test(x));
  const tw = t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/);
  if (!nums.every(n => tw.includes(n))) return false;
  const hit = ws.filter(x => nt.includes(x)).length; return hit >= Math.ceil(ws.length * 0.75) ? 'N' : false;
};

window.mlScan2 = async (qs, st, minM, minSold) => {
  minM = minM ?? 0.15; minSold = minSold ?? 25; const out = [];
  for (const [name, usd, n, i] of qs) {
    const B = bigQ(name);
    try {
      let r = (await mlSearch(B.q)).filter(x => x.pid && !x.intl); const match = r.filter(x => match2(B, x.t));
      window.__mlres[i] = {q: B.q, name, usd, all: r.slice(0, 12), match}; st.done++;
      if (!match.length) continue;
      const best = match.slice().sort((a, b) => b.sold - a.sold)[0];
      const cheapest = match.filter(x => x.sold >= minSold).sort((a, b) => a.p - b.p)[0] || best;
      const e = estM(cheapest.p, usd);
      if (e >= minM && best.sold >= minSold) out.push(i + ' ' + B.q.slice(0, 30) + ' $' + usd + ' -> ' + cheapest.pid + ' $' + cheapest.p + ' v' + best.sold + ' ' + Math.round(e * 100) + '% ' + match2(B, cheapest.t) + ' ' + cheapest.t.slice(0, 30));
    } catch (e) { out.push(i + ' ERR ' + B.q); st.done++; }
    st.out = out.join('\n');
  }
  st.running = false; return out.join('\n');
};
window.scan = (key, qs, minM, minSold) => { const st = SC[key] = {running: true, out: '', n: qs.length, done: 0}; mlScan2(qs, st, minM, minSold).catch(e => { st.out += '\nERR ' + e; st.running = false; }); return 'lanzado ' + key + ' ' + qs.length; };
window.saveRes = async (key) => { const st = SC[key]; const det = {}; (st.ids || []).forEach(i => { const r = __mlres[i]; if (r) det[i] = {q: r.q, name: r.name, usd: r.usd, match: r.match.slice(0, 6)}; }); await fetch(LS + 'res-' + key + '.json', {method: 'POST', body: JSON.stringify({out: st.out, done: st.done, n: st.n, det})}); return 'guardado res-' + key; };
window.runFile = async (file, from, to, key) => { const t = await (await fetch(LS + encodeURIComponent(file))).text(); const all = JSON.parse(t.replace(/^﻿/, '')); const qs = all.slice(from, to); scan(key, qs, 0.15, 25); SC[key].ids = qs.map(x => x[3]); const st = SC[key]; (async () => { while (st.running) await new Promise(r => setTimeout(r, 5000)); await saveRes(key); st.saved = true; })(); return 'lanzado ' + key + ' ' + qs.length; };
window.estado = () => Object.entries(SC).map(([k, s]) => k + ' ' + s.done + '/' + s.n + (s.saved ? ' guardado' : '')).join(' · ');
// Para verificar en la pestaña www.mercadolibre.com.ar/p/...: mlCat(pid) (precio que gana, +vendidos, Full, cuotas, foto) y
// vendedores(pid) = fetch('/p/'+pid+'/s') y contar los "item_id" distintos.
'funciones v2 ok';
