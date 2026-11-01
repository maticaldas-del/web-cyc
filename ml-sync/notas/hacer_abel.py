# ABEL (01/11/2026): arma tienda/abel/index.html a partir de tienda/index.html (la misma página, en modo CATÁLOGO):
# nombre ABEL, colores negro y dorado, sin carrito, sin cuotas, sin WhatsApp; los detalles los toma de la tienda (../detalles/).
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
rep('<main class="wrap">', '<main class="wrap">\n  <p class="sub-abel">Perfumes importados por encargo · consultá en tu perfumería ABEL</p>')
(R / 'abel' / 'index.html').write_text(s)
print('ok', len(s))
