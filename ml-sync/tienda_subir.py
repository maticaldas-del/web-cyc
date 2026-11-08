#!/usr/bin/env python3
# LA TIENDA SE SUBE DIRECTO A SU PROPIO REPO (08/11/2026, él eligió 1a y 3a de la revisión de la Tienda del 07/11).
#
#  1a "copiar las fotos del proveedor a la Tienda con nombres nuestros": las fotos que no son de ML (las del proveedor) se bajan, se les
#     saca todo dato escondido (EXIF/XMP/comentarios) y se guardan en el repo de la Tienda como fotos/<código>.<ext>, con un nombre que sale
#     de un resumen de la dirección (no se puede volver a la dirección original). La lista pasa a decir "/fotos/<código>.<ext>": quien abre una
#     foto ya no llega al proveedor y si el proveedor la corta la Tienda sigue con su foto. Sólo se bajan las NUEVAS (las que ya están se
#     reusan) y las que ya no usa ningún producto se borran. ~8.000 fotos de ~10 KB = ~90 MB la primera vez; después, sólo lo nuevo de cada día.
#  3a "que el robot la suba directo y sin comentarios": la lista, los detalles, ABEL y las páginas (tienda/index.html, sw.js, ABEL) se copian
#     al repo de la Tienda SIN los comentarios internos (fechas, "él eligió…", nombres de funciones del robot), y se borra el paso que la hacía
#     bajar la lista de este repo cada hora (.github/workflows/traer.yml de ese repo), que era el rastro que llevaba acá.
#
# Uso (lo corre ml-daily / ml-tienda, NO se corre a mano):  python3 ml-sync/tienda_subir.py <carpeta del robot> <tienda/ de este repo> <clon del repo de la Tienda> [forzar]
# Sale con 0 si dejó todo listo para commitear, 2 si la lista nueva es mucho más chica que la publicada (sin "forzar"), 3 si falló algo grave.
# 🔒 El registro es público: imprime sólo cantidades (ni direcciones, ni nombres de productos).
import hashlib, json, os, re, shutil, subprocess, sys, tempfile, urllib.request
from concurrent.futures import ThreadPoolExecutor

ORIG, PAG, DEST = sys.argv[1], sys.argv[2], sys.argv[3]
FORZAR = len(sys.argv) > 4 and sys.argv[4] == 'forzar'
PROHIBIDO = re.compile(r'nissei|paragua|compras ?paraguay|web-cyc|maticaldas|sync\.mjs|claude|\busd\b|d[oó]lar', re.I)
ML_FOTO = re.compile(r'^https://[a-z0-9.-]*mlstatic\.com/', re.I)
FOTOS = os.path.join(DEST, 'fotos')

def leer(p, defecto=None):
    try:
        with open(p, encoding='utf-8') as f: return json.load(f)
    except Exception: return defecto

tienda = leer(os.path.join(ORIG, 'productos.json'))
abel = leer(os.path.join(ORIG, 'abel', 'productos.json'))
if not tienda or not isinstance(tienda.get('productos'), list) or not tienda['productos']:
    print('❌ la lista nueva no se puede leer o está vacía: no subo nada'); sys.exit(3)
antes = leer(os.path.join(DEST, 'productos.json'), {}) or {}
nA, nN = len(antes.get('productos') or []), len(tienda['productos'])
if nA and nN * 4 < nA * 3 and not FORZAR:
    print(f'❌ la lista nueva tiene {nN} productos y la publicada {nA} (menos del 75%): no la subo (si es a propósito, ml-tienda con "forzar")'); sys.exit(2)

# ── 1a · FOTOS DEL PROVEEDOR ────────────────────────────────────────────────────────────────────────────────────────────────
def nombre_foto(u):
    ext = (re.search(r'\.(webp|jpe?g|png)(?:$|[?#])', u, re.I) or [None, 'jpg'])[1].lower().replace('jpeg', 'jpg')
    return hashlib.sha256(('cyc-foto|' + u).encode()).hexdigest()[:20] + '.' + ext

def limpiar(b):
    """Saca los datos escondidos de la foto (EXIF, XMP, comentarios). Devuelve None si no es una foto."""
    if b[:3] == b'\xff\xd8\xff':   # JPEG: fuera APP1..APP15 (EXIF/XMP/…) y COM; queda APP0 (JFIF) y la imagen
        out, i = bytearray(b'\xff\xd8'), 2
        while i + 4 <= len(b) and b[i] == 0xFF:
            m = b[i + 1]
            if m == 0xDA: out += b[i:]; return bytes(out)   # empieza la imagen: el resto va igual
            if m in (0xD8, 0x01) or 0xD0 <= m <= 0xD7: out += b[i:i + 2]; i += 2; continue
            L = int.from_bytes(b[i + 2:i + 4], 'big')
            if not (0xE1 <= m <= 0xEF or m == 0xFE): out += b[i:i + 2 + L]
            i += 2 + L
        return None
    if b[:4] == b'RIFF' and b[8:12] == b'WEBP':   # WEBP: fuera los pedazos EXIF y XMP (y su marca en VP8X)
        out, i = bytearray(), 12
        while i + 8 <= len(b):
            t, L = b[i:i + 4], int.from_bytes(b[i + 4:i + 8], 'little'); ch = bytearray(b[i:i + 8 + L + (L & 1)])
            if t == b'VP8X' and len(ch) > 8: ch[8] &= ~0x0C & 0xFF
            if t not in (b'EXIF', b'XMP '): out += ch
            i += 8 + L + (L & 1)
        return b'RIFF' + (len(out) + 4).to_bytes(4, 'little') + b'WEBP' + bytes(out)
    if b[:8] == b'\x89PNG\r\n\x1a\n':   # PNG: fuera tEXt/iTXt/zTXt/eXIf/tIME
        out, i = bytearray(b[:8]), 8
        while i + 12 <= len(b):
            L = int.from_bytes(b[i:i + 4], 'big'); t = b[i + 4:i + 8]
            if t not in (b'tEXt', b'iTXt', b'zTXt', b'eXIf', b'tIME'): out += b[i:i + 12 + L]
            i += 12 + L
        return bytes(out)
    return None

def bajar(u):
    for _ in range(3):
        try:
            req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=25) as r: b = r.read(5_000_000)
            b = limpiar(b)
            if b and len(b) > 300 and not PROHIBIDO.search(b.decode('latin-1')): return b
            return None
        except Exception:
            continue
    return None

listas = [x for x in (tienda, abel) if x and isinstance(x.get('productos'), list)]
prov = sorted({u for L in listas for p in L['productos'] for u in (p.get('f') or []) if isinstance(u, str) and u.startswith('http') and not ML_FOTO.match(u)})
os.makedirs(FOTOS, exist_ok=True)
hay = set(os.listdir(FOTOS))
nuevas = [u for u in prov if nombre_foto(u) not in hay]
ok_n = fallo_n = 0
def guardar(u):
    b = bajar(u)
    if not b: return False
    with open(os.path.join(FOTOS, nombre_foto(u)), 'wb') as f: f.write(b)
    return True
with ThreadPoolExecutor(16) as ex:
    for r in ex.map(guardar, nuevas):
        if r: ok_n += 1
        else: fallo_n += 1
if nuevas and fallo_n > 50 and fallo_n * 5 > len(nuevas):
    print(f'❌ fotos: fallaron {fallo_n} de {len(nuevas)} nuevas (¿el proveedor no deja bajarlas?): no subo nada'); sys.exit(3)
hay = set(os.listdir(FOTOS))
sacados = {}
for L in listas:
    quedan = []
    for p in L['productos']:
        fs = []
        for u in p.get('f') or []:
            if isinstance(u, str) and ML_FOTO.match(u): fs.append(u)
            elif isinstance(u, str) and nombre_foto(u) in hay: fs.append('/fotos/' + nombre_foto(u))
        if fs: p['f'] = fs; quedan.append(p)
    sacados[id(L)] = len(L['productos']) - len(quedan); L['productos'] = quedan
usadas = {u.rsplit('/', 1)[1] for L in listas for p in L['productos'] for u in p['f'] if u.startswith('/fotos/')}
borradas = 0
for n in hay - usadas:
    os.remove(os.path.join(FOTOS, n)); borradas += 1
# Nada del proveedor puede quedar en la lista (fuera de las fotos de ML).
for L in listas:
    t = json.dumps(L, ensure_ascii=False)
    if re.search(r'https?://(?![a-z0-9.-]*mlstatic\.com/)', t, re.I) or PROHIBIDO.search(re.sub(r'https://[^"]+', '', t)):
        print('❌ la lista todavía tiene una dirección que no es de ML o una palabra que no puede salir: no subo nada'); sys.exit(3)
print(f'📷 fotos del proveedor: {len(prov)} en uso · {ok_n} nuevas bajadas · {fallo_n} no se pudieron bajar · {borradas} viejas borradas · productos sin ninguna foto (afuera): Tienda {sacados[id(tienda)]}' + (f' · ABEL {sacados[id(abel)]}' if abel else ''))

# Lista, ABEL y detalles.
with open(os.path.join(DEST, 'productos.json'), 'w', encoding='utf-8') as f: f.write(json.dumps(tienda, ensure_ascii=False, separators=(',', ':')) + '\n')
if abel and (len(abel.get('productos') or []) >= 20 or abel.get('actualizando')):
    os.makedirs(os.path.join(DEST, 'abel'), exist_ok=True)
    with open(os.path.join(DEST, 'abel', 'productos.json'), 'w', encoding='utf-8') as f: f.write(json.dumps(abel, ensure_ascii=False, separators=(',', ':')) + '\n')
det = os.path.join(ORIG, 'detalles')
if os.path.isdir(det):
    os.makedirs(os.path.join(DEST, 'detalles'), exist_ok=True)
    for n in os.listdir(det):
        if re.fullmatch(r'd\d+\.json', n) and leer(os.path.join(det, n)) is not None: shutil.copyfile(os.path.join(det, n), os.path.join(DEST, 'detalles', n))

# ── 3a · LAS PÁGINAS SIN COMENTARIOS ─────────────────────────────────────────────────────────────────────────────────────────
def sin_comentarios_js(s):
    """Saca // y /* */ de un JavaScript sin tocar textos ni expresiones regulares."""
    out, i, n, prev = [], 0, len(s), ''
    while i < n:
        c = s[i]
        if c in '"\'`':
            j = i + 1
            while j < n and s[j] != c:
                j += 2 if s[j] == '\\' else 1
            out.append(s[i:j + 1]); i = j + 1; prev = c; continue
        if c == '/' and i + 1 < n and s[i + 1] == '/':
            j = s.find('\n', i); j = n if j < 0 else j
            while out and out[-1] in (' ', '\t'): out.pop()
            i = j; continue
        if c == '/' and i + 1 < n and s[i + 1] == '*':
            j = s.find('*/', i + 2); i = n if j < 0 else j + 2; continue
        if c == '/' and (prev == '' or prev in '(,=:[!&|?{};+-*%<>~^\n' or re.search(r'\b(return|typeof|case|in|of)\s*$', ''.join(out[-12:]))):
            j, clase = i + 1, False   # una expresión regular: se copia entera
            while j < n and (s[j] != '/' or clase):
                if s[j] == '\\': j += 1
                elif s[j] == '[': clase = True
                elif s[j] == ']': clase = False
                j += 1
            j += 1
            while j < n and s[j].isalpha(): j += 1
            out.append(s[i:j]); i = j; prev = '/'; continue
        out.append(c)
        if not c.isspace(): prev = c
        i += 1
    return re.sub(r'\n\s*\n+', '\n', ''.join(out))

def sin_comentarios_html(h):
    partes = re.split(r'(<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>)', h, flags=re.S | re.I)
    res = []
    for k, p in enumerate(partes):
        if k % 2 == 0: res.append(re.sub(r'<!--.*?-->', '', p, flags=re.S))
        elif p.lower().startswith('<style'): res.append(re.sub(r'/\*.*?\*/', '', p, flags=re.S))
        else:
            m = re.match(r'(<script\b[^>]*>)(.*?)(</script>)', p, re.S | re.I)
            res.append(m.group(1) + sin_comentarios_js(m.group(2)) + m.group(3))
    return re.sub(r'\n\s*\n+', '\n', ''.join(res))

def js_anda(codigo):
    if not shutil.which('node'): return True
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f: f.write(codigo); t = f.name
    try: return subprocess.run(['node', '--check', t], capture_output=True).returncode == 0
    finally: os.remove(t)

paginas = {}
for rel in ('index.html', 'abel/index.html', 'sw.js'):
    src = os.path.join(PAG, rel)
    if not os.path.isfile(src): continue
    s = open(src, encoding='utf-8').read()
    t = sin_comentarios_js(s) if rel.endswith('.js') else sin_comentarios_html(s)
    scripts = [t] if rel.endswith('.js') else re.findall(r'<script>(.*?)</script>', t, re.S)
    if PROHIBIDO.search(t) or re.search(r'él eligió|\b\d{2}/\d{2}/2026\b', t) or not all(js_anda(x) for x in scripts):
        print(f'⚠️ página {rel}: sin los comentarios no quedó bien (o quedó algo interno): no la cambio'); continue
    paginas[rel] = t
for rel, t in paginas.items():
    d = os.path.join(DEST, os.path.dirname(rel)); os.makedirs(d, exist_ok=True)
    with open(os.path.join(DEST, rel), 'w', encoding='utf-8') as f: f.write(t)
for rel in ('manifest.webmanifest', 'icono.svg', 'icono-180.png', 'icono-192.png', 'icono-512.png',
            'abel/manifest.webmanifest', 'abel/icono.svg', 'abel/icono-180.png', 'abel/icono-192.png', 'abel/icono-512.png'):
    src = os.path.join(PAG, rel)
    if os.path.isfile(src): os.makedirs(os.path.dirname(os.path.join(DEST, rel)), exist_ok=True); shutil.copyfile(src, os.path.join(DEST, rel))
print(f'📄 páginas sin comentarios: {len(paginas)} de 3')

# El paso que bajaba la lista de este repo cada hora ya no hace falta (y era el rastro que llevaba acá).
traer = os.path.join(DEST, '.github', 'workflows', 'traer.yml')
if os.path.isfile(traer): os.remove(traer); print('🧹 se saca el paso que bajaba la lista de afuera')
print(f'✓ listo para subir: Tienda {len(tienda["productos"])} productos' + (f' · ABEL {len(abel["productos"])}' if abel else ''))
