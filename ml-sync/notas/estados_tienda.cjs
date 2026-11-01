// ESTADOS DE WHATSAPP DE LA TIENDA (01/11/2026, él eligió 2a): cada día 4 productos de la Tienda que salen más baratos que en ML,
// en una imagen vertical (1080×1920) lista para el estado, con foto, nombre, precio, el de ML tachado y el link directo (#p=<código>).
// Uso: node ml-sync/notas/estados_tienda.cjs <carpeta de salida> [cuántos=4]
// Lee la Tienda publicada; los ya usados quedan en ml-sync/notas/tienda_estados.txt (código y fecha) y no se repiten en 60 días.
const fs = require('fs'), path = require('path'), https = require('https');
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', N = Number(process.argv[3] || 4);
const USADOS = path.join(__dirname, 'tienda_estados.txt');
const bajar = (u) => new Promise((ok, mal) => https.get(u, (r) => { let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => ok(d)); }).on('error', mal));
const pesos = (n) => '$' + Math.round(n).toLocaleString('es-AR');
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
(async () => {
  const d = JSON.parse(await bajar('https://tiendacyc.github.io/productos.json?t=' + Date.now()));
  const hoy = new Date(Date.now() - 3 * 36e5).toISOString().slice(0, 10);
  const usados = {}; try { for (const l of fs.readFileSync(USADOS, 'utf8').split('\n')) { const [id, f] = l.trim().split(/\s+/); if (id) usados[id] = f; } } catch { /* primera vez */ }
  const viejo = (f) => !f || (Date.parse(hoy) - Date.parse(f)) / 864e5 >= 60;
  // Los que más ahorran, sin repetir rubro en el mismo día, y que no hayan salido en 60 días.
  const cand = d.productos.filter((p) => p.ml && p.p > 0 && p.f && p.f.length && viejo(usados[p.id])).sort((a, b) => a.p / a.ml - b.p / b.ml);
  const elegidos = [], rubros = new Set();
  for (const p of cand) { if (elegidos.length >= N) break; if (rubros.has(p.c)) continue; rubros.add(p.c); elegidos.push(p); }
  for (const p of cand) { if (elegidos.length >= N) break; if (!elegidos.includes(p)) elegidos.push(p); }
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const lineas = [];
  for (const [i, p] of elegidos.entries()) {
    const ah = Math.round((1 - p.p / p.ml) * 100), foto = String(p.f[0]).replace(/-[A-Z]\.jpg$/, '-F.jpg');
    await pg.setContent(`<html><body style="margin:0;width:1080px;height:1920px;background:linear-gradient(#ff8a3d,#d9480f);font-family:Arial,Helvetica,sans-serif;display:flex;flex-direction:column;align-items:center;color:#fff">
      <div style="font-size:84px;font-weight:900;letter-spacing:2px;margin-top:90px">CYC</div>
      <div style="margin-top:50px;width:900px;height:900px;background:#fff;border-radius:48px;display:flex;align-items:center;justify-content:center;position:relative">
        <img src="${esc(foto)}" referrerpolicy="no-referrer" style="max-width:820px;max-height:820px;object-fit:contain">
        <div style="position:absolute;left:30px;top:30px;background:#16a34a;color:#fff;font-size:44px;font-weight:800;border-radius:999px;padding:14px 30px">${ah}% menos que en ML</div></div>
      <div style="width:900px;margin-top:50px;font-size:52px;font-weight:700;line-height:1.2;text-align:center;max-height:190px;overflow:hidden">${esc(p.n)}</div>
      <div style="margin-top:36px;font-size:120px;font-weight:900">${pesos(p.p)}</div>
      <div style="font-size:46px;opacity:.9">En Mercado Libre <s>${pesos(p.ml)}</s></div>
      <div style="margin-top:auto;margin-bottom:70px;text-align:center"><div style="background:#fff;color:#d9480f;border-radius:999px;padding:24px 50px;font-size:50px;font-weight:900">👉 tiendacyc.github.io</div>
        <div style="margin-top:22px;font-size:38px;opacity:.95">Tocá el link del estado · hay miles de productos más</div></div>
      </body></html>`, { waitUntil: 'load' });
    await pg.waitForTimeout(800);
    const arch = path.join(OUT, `estado_${hoy}_${i + 1}.png`); await pg.screenshot({ path: arch });
    // Página chiquita por producto (01/11, él: "que esté el producto y al clickear los lleve a la web"): al pegar ESTE link en WhatsApp sale la
    // vista previa con la imagen del producto, y al tocarla abre la Tienda en ese producto. Va en la carpeta estados/ de la Tienda junto al PNG.
    const png = path.basename(arch), pag = p.id + '.html';
    fs.writeFileSync(path.join(OUT, pag), `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(p.n)} · CYC</title><meta property="og:title" content="${esc(p.n)} a ${pesos(p.p)}"><meta property="og:description" content="En Mercado Libre ${pesos(p.ml)} · ${ah}% menos en CYC. Tocá para verlo.">
<meta property="og:image" content="https://tiendacyc.github.io/estados/${png}"><meta property="og:url" content="https://tiendacyc.github.io/estados/${pag}"><meta property="og:type" content="product">
<meta http-equiv="refresh" content="0;url=https://tiendacyc.github.io/#p=${p.id}"><script>location.replace("https://tiendacyc.github.io/#p=${p.id}")</script></head>
<body style="font-family:Arial;background:#d9480f;color:#fff;text-align:center;padding:40px"><a style="color:#fff" href="https://tiendacyc.github.io/#p=${p.id}">Abrir en la Tienda CYC</a></body></html>\n`);
    lineas.push(`${arch}\t${p.n}\t${pesos(p.p)} (ML ${pesos(p.ml)}, ${ah}% menos)\thttps://tiendacyc.github.io/estados/${pag}`);
    usados[p.id] = hoy;
  }
  await b.close();
  fs.writeFileSync(USADOS, Object.entries(usados).map(([k, v]) => `${k} ${v}`).join('\n') + '\n');
  console.log(lineas.join('\n'));
})();
