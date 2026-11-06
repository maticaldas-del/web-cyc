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
    var t = "Hola! Quiero consultar por este perfume:\\n" + p.n + (p.k ? "\\nCódigo: " + p.k : "") + (p.p > 0 ? "\\nPrecio en efectivo: " + pesos(p.p) + (p.pt > 0 ? "\\nCon tarjeta, QR o transferencia: " + pesos(p.pt) : "") : "");
    return '<a class="wa-abel" target="_blank" rel="noopener" href="https://wa.me/' + WA + '?text=' + encodeURIComponent(t) + '">Consultar por WhatsApp</a>';
  }
  var DET = {};''')
rep('</style>', '''.wa-abel { display: block; text-align: center; margin-top: 8px; padding: 9px 8px; border-radius: 10px; background: #25d366; color: #06290f; font-weight: 700; font-size: 13.5px; text-decoration: none; }
#verWa .wa-abel { margin: 12px 0 4px; padding: 12px; font-size: 15px; }
</style>''')
# 💵 EFECTIVO Y CUALQUIER OTRO MEDIO (02/11/2026, él: "el verde es sólo EFECTIVO. el otro precio más caro es cualquier otro método de pago"; él: "que aparezca el precio en efectivo grande en verde y el de tarjeta más chico en gris abajo").
rep("""<div class="precio">' + (p.cp ? "Consultar precio" : pesos(p.p)) + '</div>""", """<div class="precio">' + abelPrecio(p) + '</div>""")
rep("""$("verPrecio").innerHTML = p.cp ? "Consultar precio" : esc(pesos(p.p)) + (p.ml ? '<span class="enml">En Mercado Libre <s>' + esc(pesos(p.ml)) + "</s></span>" : "");""", """$("verPrecio").innerHTML = abelPrecio(p);""")
rep('  var DET = {};', """  function abelPrecio(p) {
    if (p.cp || !(p.p > 0)) return "Consultar precio";
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
# Revisión etapa 9 (06/11/2026): ABEL y la Tienda están en el mismo sitio y compartían lo guardado en el navegador (el orden elegido en la
# Tienda dejaba vacío el selector de ABEL y lo del carrito salía marcado): ABEL usa sus propias claves.
s = s.replace('cycT_', 'abelT_')
(R / 'abel' / 'index.html').write_text(s)
print('ok', len(s))
