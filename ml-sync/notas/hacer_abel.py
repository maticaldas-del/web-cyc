# ABEL (01/11/2026): arma tienda/abel/index.html a partir de tienda/index.html (la misma página, en modo CATÁLOGO):
# nombre ABEL, colores negro y dorado, sin carrito, sin cuotas; los detalles los toma de la tienda (../detalles/).
# 01/11/2026 (él: "quiero que esté el botón para que me mande al wsp, con el nombre y el código… hoy no tienen forma de comunicarse"):
# cada perfume (tarjeta y ventana) lleva "Consultar por WhatsApp" con el nombre y el código (`k` de abel/productos.json).
# Correr cada vez que se toca tienda/index.html: python3 ml-sync/notas/hacer_abel.py
import re, pathlib
R = pathlib.Path(__file__).resolve().parents[2] / 'tienda'
s = (R / 'index.html').read_text()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:60]); s = s.replace(a, b)
rep('location.hostname!=="tiendacyc.github.io")location.replace("https://tiendacyc.github.io/"', 'location.hostname!=="tiendacyc.github.io")location.replace("https://tiendacyc.github.io/abel/"')
rep('<title>CYC</title>', '<title>ABEL · Perfumes importados</title>')
s = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="Perfumes importados por encargo. Pedilo en tu perfumería ABEL.">', s)
s = re.sub(r'<meta property="og:title" content="[^"]*">', '<meta property="og:title" content="ABEL · Perfumes importados">', s)
s = re.sub(r'<meta property="og:description" content="[^"]*">', '<meta property="og:description" content="Perfumes importados por encargo. Pedilo en tu perfumería ABEL.">', s)
s = re.sub(r'<meta property="og:url" content="[^"]*">', '<meta property="og:url" content="https://tiendacyc.github.io/abel/">', s)
s = re.sub(r'<meta property="og:image" content="[^"]*">', '<meta property="og:image" content="https://tiendacyc.github.io/abel/icono-512.png">', s)
rep('<meta name="theme-color" content="#e8590c">', '<meta name="theme-color" content="#111111">')
rep('<meta name="apple-mobile-web-app-title" content="CYC">', '<meta name="apple-mobile-web-app-title" content="ABEL">')
rep('<h1 class="logo">CYC</h1>', '<h1 class="logo">ABEL</h1>')
rep('<option value="ahorro">Más ahorro contra ML</option>', '')   # 05/11/2026: ABEL no se compara con ML
rep('<footer id="pie">CYC</footer>', '<footer id="pie">ABEL</footer>')
rep('$("pie").textContent = "CYC · precios', '$("pie").textContent = "ABEL · precios')
rep('fetch("detalles/d" + b', 'fetch("../detalles/d" + b')
# Colores ABEL y modo catálogo (sin botones de compra, sin cuotas, sin barra de pedido).
rep('</style>', '''
/* ===== ABEL: negro y dorado, sólo catálogo ===== */
:root { --acc: #9a7b2f; --acc-ink: #ffffff; --acc-soft: #f4ecd8; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --acc: #d4b25e; --acc-ink: #111111; --acc-soft: #2c2616; } }
:root[data-theme="dark"] { --acc: #d4b25e; --acc-ink: #111111; --acc-soft: #2c2616; }
.logo { letter-spacing: 4px; font-weight: 700; }
.slot, .cuotas, .barra, #verCant, .nota { display: none !important; }
.sub-abel { color: var(--ink2); font-size: 13px; margin: 6px 0 0; }
</style>''')
rep('<main class="wrap">', '<main class="wrap">\n  <p class="sub-abel">Perfumes importados por encargo · llega en 7 días hábiles · consultá en tu perfumería ABEL</p>')
# 💬 WhatsApp por perfume (01/11/2026).
rep("<div class=\"slot\">' + cantHtml(p.id) + '</div></div></article>'", "<div class=\"slot\">' + cantHtml(p.id) + '</div>' + waBtn(p) + '</div></article>'")
rep('<div id="verCant"></div>', '<div id="verCant"></div><div id="verWa"></div>')
rep('$("verCant").dataset.id = id; $("verCant").innerHTML = cantHtml(id);', '$("verCant").dataset.id = id; $("verCant").innerHTML = cantHtml(id); $("verWa").innerHTML = waBtn(p);')
rep('  var DET = {};', '''  function waBtn(p) {
    if (!WA || WA.length < 8) return "";
    var t = "Hola! Quiero consultar por este perfume:\\n" + p.n + (p.k ? "\\nCódigo: " + p.k : "") + (p.p > 0 && !VIEJO ? "\\nPrecio en efectivo: " + pesos(p.p) + (p.pt > 0 ? "\\nCon tarjeta, QR o transferencia: " + pesos(p.pt) : "") : "");
    return '<a class="wa-abel" target="_blank" rel="noopener" href="https://wa.me/' + WA + '?text=' + encodeURIComponent(t) + '">Consultar por WhatsApp</a>';
  }
  var DET = {};''')
rep('</style>', '''.wa-abel { display: block; text-align: center; margin-top: 8px; padding: 9px 8px; border-radius: 10px; background: #25d366; color: #06290f; font-weight: 700; font-size: 13.5px; text-decoration: none; }
#verWa .wa-abel { margin: 12px 0 4px; padding: 12px; font-size: 15px; }
</style>''')
# 💵 EFECTIVO Y CUALQUIER OTRO MEDIO (02/11/2026, él: "el verde es sólo EFECTIVO. el otro precio más caro es cualquier otro método de pago"; él: "que aparezca el precio en efectivo grande en verde y el de tarjeta más chico en gris abajo").
rep("""<div class="precio">' + (p.cp || VIEJO ? "Consultar precio" : pesos(p.p)) + '</div>""", """<div class="precio">' + abelPrecio(p) + '</div>""")
rep("""$("verPrecio").innerHTML = p.cp || VIEJO ? "Consultar precio" : esc(pesos(p.p)) + (p.ml ? '<span class="enml">En Mercado Libre <s>' + esc(pesos(p.ml)) + "</s></span>" : "");""", """$("verPrecio").innerHTML = abelPrecio(p);""")
rep('  var DET = {};', """  function abelPrecio(p) {
    if (p.cp || VIEJO || !(p.p > 0)) return "Consultar precio";   // 08/11/2026: lista de más de 3 días = consultar, como en la Tienda
    return '<span class="pe-abel">' + esc(pesos(p.p)) + '<small> en efectivo</small></span>' + (p.pt > 0 ? '<span class="pt-abel">' + esc(pesos(p.pt)) + ' con tarjeta, QR, transferencia u otro medio</span>' : '');
  }
  var DET = {};""")
rep('</style>', """.pe-abel { display: block; color: #16a34a; font-weight: 800; font-size: 19px; line-height: 1.15; }
.pe-abel small { display: inline-block; white-space: nowrap; font-size: 11px; font-weight: 700; letter-spacing: .3px; text-transform: uppercase; margin-left: 4px; }  /* 03/11: inline-block baja entero al renglón de abajo si no entra (en 390 px se cortaba "EN EFECTIV") */
.pt-abel { display: block; color: var(--ink2); font-weight: 500; font-size: 12.5px; margin-top: 2px; }
#verPrecio .pe-abel { font-size: 26px; } #verPrecio .pt-abel { font-size: 14px; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .pe-abel { color: #4ade80; } }
:root[data-theme="dark"] .pe-abel { color: #4ade80; }
</style>""")
# 🎄 ABEL EN NAVIDAD (idea 6, él eligió 6a el 08/11/2026): cartel arriba "Pedí hasta el 6/12 y lo retirás para Navidad", hasta el 6/12.
# La fila "Regalos de Navidad" y el botón "Mandáselo a alguien" son de la Tienda: en ABEL no van.
rep('var NAV_ON = true,', 'var NAV_ON = false,')
rep('<p class="sub-abel">', '<div class="aviso abel-nav" id="abelNav" hidden>🎄 <b>Pedí hasta el 6/12</b> y lo retirás para Navidad.</div>\n  <p class="sub-abel">')
rep('  function navVigente() {', '  if (hoyISO() <= "2026-12-06") $("abelNav").hidden = false;\n  function navVigente() {')
rep('</style>', '''.compartir, #verComp { display: none !important; }
.abel-nav { margin: 10px 0 0; font-size: 14px; text-align: center; }
/* 🔎 FILTROS (idea 19, 08/11/2026): para quién, marca y precio. */
.filtros-abel { display: grid; grid-template-columns: 0.95fr 1.25fr 1fr; gap: 6px; padding-bottom: 10px; }
.filtros-abel select { min-width: 0; width: 100%; height: 38px; border-radius: 10px; border: 1px solid var(--line); background: var(--card); color: var(--ink); font: inherit; font-size: 13px; padding: 0 4px; cursor: pointer; }
.filtros-abel select:focus { border-color: var(--acc); outline: none; }
.filtros-abel select.on { border-color: var(--acc); background: var(--acc-soft); }
@media (min-width: 900px) { .filtros-abel { grid-template-columns: 200px 260px 220px auto; } }
</style>''')
rep('<div class="chips" id="chips" role="toolbar" aria-label="Rubros"></div>', '''<div class="chips" id="chips" role="toolbar" aria-label="Rubros"></div>
    <div class="filtros-abel" id="filtrosAbel">
      <select id="fGen" aria-label="Para quién"><option value="">Para quién</option><option value="F">Ella</option><option value="M">Él</option><option value="U">Unisex</option></select>
      <select id="fMarca" aria-label="Marca"><option value="">Marca</option></select>
      <select id="fPrecio" aria-label="Precio en efectivo"><option value="">Precio</option><option value="0-100000">Hasta 100 mil</option><option value="100000-200000">100 a 200 mil</option><option value="200000-300000">200 a 300 mil</option><option value="300000-0">Más de 300 mil</option></select>
    </div>''')
rep('      if (rubro === "__nav") {', '      if (!abelFiltra(p)) return false;\n      if (rubro === "__nav") {')
rep('  var DET = {};', '''  // 🔎 FILTROS DE ABEL (idea 19, él eligió 19a el 08/11/2026): Ella / Él / Unisex (lo que dice el nombre: "mujer", "hombre", "unisex"…; sin
  // eso sale sólo sin filtro), la marca (la lista de abajo o la palabra que sigue a "Perfume") y el precio en efectivo.
  var fGen = "", fMarca = "", fPrecio = "";
  var MARCAS = [["Afnan","afnan"],["Ahmed Al Maghribi","ahmed al maghribi"],["Al Wataniah","(al )?wataniah"],["Animale","animale"],["Arabiyat","arabiyat"],["Armaf","armaf"],["Armani","giorgio armani|armani|acqua di gio"],["Assala","assala"],["Azzaro","azzaro"],["Antonio Banderas","antonio banderas|banderas"],["Beverly Hills Polo Club","beverly hills polo club"],["Boucheron","boucheron"],["Britney Spears","britney spears"],["Burberry","burberry"],["Calvin Klein","calvin klein|\\\\bck (one|be|in2u|everyone)"],["Carolina Herrera","carolina herrera|\\\\b212\\\\b|good girl|bad boy"],["Chloé","chlo[eé]"],["Creed","\\\\bcreed\\\\b"],["Cristiano Ronaldo","cristiano ronaldo|\\\\bcr7\\\\b"],["Dar El Ward","dar el ward"],["Davidoff","davidoff|cool water"],["Dior","\\\\bdior\\\\b|j.?adore|sauvage"],["Elizabeth Arden","elizabeth arden"],["Elizabeth Taylor","elizabeth taylor"],["Ferrari","ferrari"],["French Avenue","fren?ch?e? avenue"],["Gabriela Sabatini","sabatini"],["Georges Mezotti","mezotti"],["Givenchy","givenchy"],["Grandeur","grandeur"],["Hugo Boss","hugo boss|\\\\bboss bottled"],["Issey Miyake","issey miyake"],["Jacques Bogart","bogart"],["Jean Paul Gaultier","jean paul gaultier|\\\\bjpg\\\\b|le male"],["Jimmy Choo","jimmy choo"],["Joli Joli","joli joli"],["Juicy Couture","juicy couture"],["Karl Lagerfeld","lagerfeld"],["Kenzo","\\\\bkenzo\\\\b"],["Lancôme","lanc[oô]me"],["Lattafa","lattafa"],["Maison Alhambra","maison alhambra"],["Maison Asrar","maison asrar"],["Mercedes-Benz","mercedes"],["Michael Kors","michael kors"],["Mirada","\\\\bmirada\\\\b"],["Montblanc","mont ?blanc"],["Moschino","moschino"],["Nabeel","nabeel"],["Nishane","nishane"],["Orientica","orientica"],["Paris Corner","paris corner"],["Police","\\\\bpolice\\\\b"],["Prada","\\\\bprada\\\\b"],["Rabanne","paco rabanne|rabanne|one million|1 million|invictus|phantom"],["Ralph Lauren","ralph lauren|polo (red|blue|black)"],["Rasasi","rasasi"],["Rayhaan","rayhaan"],["Risala","risala"],["Rochas","rochas"],["Shakira","shakira"],["Stella Dustin","stella\\\\s*(&|and)?\\\\s*dustin"],["Swiss Arabian","swiss arabian"],["Trussardi","trussardi"],["Valentino","valentino"],["Versace","versace|\\\\beros\\\\b"],["Xerjoff","xerjoff"],["Yves Saint Laurent","yves saint laurent|\\\\bysl\\\\b|\\\\blibre\\\\b(?! de)"],["Zimaya","zimaya"],["Adidas","adidas"],["Bvlgari","bvlgari|bulgari"],["Victoria's Secret","victoria.?s secret"],["Tommy Hilfiger","\\\\btommy\\\\b"],["Lacoste","lacoste"],["Natura","\\\\bnatura\\\\b"],["Hamidi","hamidi"],["Al Haramain","al haramain"],["Emper","\\\\bemper\\\\b"],["Fragluxe","fragluxe"],["Maison de Milan","maison de milan"],["Mawwal","mawwal"],["Nasma","nasma"],["Niche Avenue","niche avenue"],["Pascal Morabito","morabito"],["Puccini","puccini"],["Royal Opera","royal opera"],["Sahari","sahari"],["Tonino Lamborghini","lamborghini|tonino"],["UFC","\\\\bufc\\\\b"],["Vurv","vurv"],["Zirconia","zirconia"],["Giorgio Beverly Hills","giorgio beverly"],["I Candy","i ?candy"],["La Rive","la rive"],["Linn Young","linn young"],["Mauboussin","mauboussin"],["Princesse Marina de Bourbon","marina de bourbon"],["Bidaya","bidaya"],["Cyrus","cyrus"],["Amaran","amaran"],["Al Absar","al absar"],["Aurora Scents","aurora scents"],["Lonkoom","lonkoom"],["Semike","semike"],["Sospiro","sospiro"],["Vulcan","vulcan"],["Ariana Grande","ariana grande"],["Hollister","hollister"],["Abercrombie","abercrombie"],["Dolce & Gabbana","dolce|gabbana"],["Gucci","gucci"],["Chanel","chanel"],["Hermès","herm[eè]s"],["Montale","montale"],["Mancera","mancera"],["Ard Al Zaafaran","zaafaran"],["Khadlaj","khadlaj"],["Fragrance World","fragrance world"],["Benetton","benetton"],["Salvatore Ferragamo","ferragamo"],["Guess","\\\\bguess\\\\b"],["Nautica","nautica"],["Kevin","\\\\bkevin\\\\b"],["Hinode","hinode"],["Coach","\\\\bcoach\\\\b"],["Marc Jacobs","marc jacobs"],["Thierry Mugler","mugler"],["Cacharel","cacharel"],["Nina Ricci","nina ricci"],["Halloween","halloween"],["Hugo","\\\\bhugo\\\\b"]];
  var MARCAS_RE = MARCAS.map(function (m) { return [m[0], new RegExp(m[1], "i")]; });
  function abelGen(p) {
    if (p._g !== undefined) return p._g; var t = sinTilde(p.n);
    p._g = /\\bunisex|unissex\\b/.test(t) ? "U" : /\\b(hombre|hombres|masculin[oa]|men|man|homme|him|caballero|varon|uomo)\\b/.test(t) ? "M" : /\\b(mujer|mujeres|femenin[oa]|woman|women|femme|her|dama|donna|lady|girl)\\b/.test(t) ? "F" : (p.g || "");   // p.g: lo que dice el proveedor (análisis semanal del 08/11/2026)
    return p._g;
  }
  function abelMarca(p) {
    if (p._mk !== undefined) return p._mk; var best = null, i;
    for (i = 0; i < MARCAS_RE.length; i++) { var m = MARCAS_RE[i][1].exec(p.n); if (m && (!best || m.index < best[0])) best = [m.index, MARCAS_RE[i][0]]; }
    if (best) return (p._mk = best[1]);
    var w = /^(?:kit\\s+)?perfume\\s+([\\w'’-]+)(?:\\s+([\\w'’-]+))?/i.exec(p.n), k = "";
    if (w) { k = w[1]; if (/^(al|dar|dal|chris|aurora|maison|le|la|el|de|beverly|paris)$/i.test(k) && w[2]) k += " " + w[2]; k = k.charAt(0).toUpperCase() + k.slice(1); }
    return (p._mk = k);
  }
  function abelFiltra(p) {
    if (fGen && abelGen(p) !== fGen) return false;
    if (fMarca && abelMarca(p) !== fMarca) return false;
    if (fPrecio) { var r = fPrecio.split("-"), a = +r[0], b = +r[1]; if (!(p.p > 0) || p.p < a || (b && p.p > b)) return false; }
    return true;
  }
  function abelFiltrosInit() {
    var cu = {}; PRODS.forEach(function (p) { var m = abelMarca(p); if (m) cu[m] = (cu[m] || 0) + 1; });
    $("fMarca").innerHTML = '<option value="">Marca</option>' + Object.keys(cu).sort(function (a, b) { return a.localeCompare(b, "es"); }).map(function (m) { return '<option value="' + esc(m) + '">' + esc(m) + " (" + cu[m] + ")</option>"; }).join("");
    [["fGen", function (v) { fGen = v; }], ["fMarca", function (v) { fMarca = v; }], ["fPrecio", function (v) { fPrecio = v; }]].forEach(function (x) {
      $(x[0]).onchange = function () { x[1](this.value); this.classList.toggle("on", !!this.value); pag = 1; pintar(); window.scrollTo(0, 0); };
    });
  }
  var DET = {};''')
rep('    pintarChips(); pintar(); actualizarBarra();\n', '    abelFiltrosInit(); pintarChips(); pintar(); actualizarBarra();\n')
# Revisión etapa 9 (06/11/2026): ABEL y la Tienda están en el mismo sitio y compartían lo guardado en el navegador (el orden elegido en la
# Tienda dejaba vacío el selector de ABEL y lo del carrito salía marcado): ABEL usa sus propias claves.
s = s.replace('cycT_', 'abelT_')
# Análisis semanal (08/11/2026): ABEL pedía su propio sw.js (abel/sw.js no existe: 404 en cada visita, sin efecto). Se saca el registro.
rep('<script>if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js", { scope: "./" }).catch(function () {});</script>', '')
(R / 'abel' / 'index.html').write_text(s)
print('ok', len(s))
