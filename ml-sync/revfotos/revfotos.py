#!/usr/bin/env python3
"""Pasada de Claude por las fotos de "Para probar" (07/10/2026).

  python3 revfotos.py armar <log de fotosrev (json de get_job_logs o texto)> <carpeta> [margen mínimo, def 25]
      → baja las dos fotos de cada candidato y arma hojas de 4 (foto PY | foto ML | títulos) en <carpeta>/hojas
  python3 revfotos.py comando <carpeta> '<json {id: "no!nota" | "duda!nota"}>'
      → arma el `revcand:…;go` (los que no están en el json van como ok, salvo que alguna de sus dos fotos no
        haya bajado: ésos van como duda). Los probados (`p…~MLA…`) no se escriben con revcand: se saltean.
"""
import json, os, re, sys, ssl, textwrap, urllib.request, concurrent.futures as cf

def leer_log(p):
    raw = open(p).read()
    try: raw = json.loads(raw)['logs_content']
    except Exception: pass
    L = [re.sub(r'^\S+Z ', '', l) for l in raw.split('\n')]
    out, cur = [], None
    for l in L:
        if l.startswith('@@ '):
            m = re.match(r'(c\d+|p\d+~MLA\d+) · margen (\S+)% · (MLA\d+)(.*)', l[3:])
            if not m: continue
            cur = dict(zip(('id', 'm', 'cat', 'extra'), m.groups())); out.append(cur)
        elif cur is not None:
            for k in ('PY', 'ML', 'fotoPY', 'fotoML'):
                if l.strip().startswith(k + ':'): cur[k] = l.strip()[len(k) + 1:].strip()
    return out

def num(x):
    try: return float(x)
    except Exception: return -999

def bajar(u, dst):
    if not u.startswith('https://'): return False
    if os.path.exists(dst) and os.path.getsize(dst) > 500: return True
    try:
        ctx = ssl.create_default_context(cafile='/root/.ccr/ca-bundle.crt') if os.path.exists('/root/.ccr/ca-bundle.crt') else None
        r = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=25, context=ctx)
        open(dst, 'wb').write(r.read()); return True
    except Exception: return False

def ruta(dir_, i, lado): return f"{dir_}/img/{i.replace('~','_')}_{lado}"

def bajo(p): return os.path.exists(p) and os.path.getsize(p) > 500

def armar(log, dir_, minm):
    from PIL import Image, ImageDraw, ImageFont
    todos = leer_log(log)
    sel = [o for o in todos if num(o['m']) >= minm]
    os.makedirs(dir_ + '/img', exist_ok=True); os.makedirs(dir_ + '/hojas', exist_ok=True)
    jobs = []
    for o in sel:
        jobs.append((o.get('fotoPY', '').replace('/thumbs/med/', '/thumbs/big/'), f"{dir_}/img/{o['id'].replace('~','_')}_py"))
        jobs.append((o.get('fotoML', ''), f"{dir_}/img/{o['id'].replace('~','_')}_ml"))
    with cf.ThreadPoolExecutor(12) as ex: res = list(ex.map(lambda j: bajar(*j), jobs))
    # Una foto que NO BAJÓ no es lo mismo que una que no existe (13/10/2026, revisión 9): se cuentan y se dibujan
    # distinto, y `comando` las manda como duda en vez de ok.
    sinurl = sum(1 for (u, _) in jobs if not u.startswith('https://'))
    fallo = sum(1 for (u, _), r in zip(jobs, res) if u.startswith('https://') and not r)
    F = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    font = ImageFont.truetype(F, 15); fb = ImageFont.truetype(F.replace('Sans.', 'Sans-Bold.'), 15)
    S, N = 240, 4; W, H = S * 2 + 540, S + 20
    def load(p, url):
        try:
            im = Image.open(p).convert('RGB'); im.thumbnail((S, S)); bg = Image.new('RGB', (S, S), 'white')
            bg.paste(im, ((S - im.width) // 2, (S - im.height) // 2)); return bg
        except Exception:
            txt = 'no bajó' if str(url or '').startswith('https://') else 'sin foto'
            bg = Image.new('RGB', (S, S), '#fdd' if txt == 'no bajó' else '#ddd'); ImageDraw.Draw(bg).text((60, 110), txt, fill='black', font=font); return bg
    for h in range(0, len(sel), N):
        ch = sel[h:h + N]; img = Image.new('RGB', (W, H * len(ch)), 'white'); d = ImageDraw.Draw(img)
        for k, o in enumerate(ch):
            y = k * H; img.paste(load(ruta(dir_, o['id'], 'py'), o.get('fotoPY', '')), (5, y + 10)); img.paste(load(ruta(dir_, o['id'], 'ml'), o.get('fotoML', '')), (S + 15, y + 10))
            x = 2 * S + 30; d.text((x, y + 8), f"#{h + k + 1} {o['id']} · {o['m']}%{o['extra']}", fill='black', font=fb); yy = y + 32
            for lab, t in (('PY', o.get('PY', '')), ('ML', o.get('ML', ''))):
                for ln in textwrap.wrap(lab + ': ' + t, 52)[:5]: d.text((x, yy), ln, fill='#003399' if lab == 'PY' else '#990000', font=font); yy += 19
                yy += 8
            d.line((0, y + H - 1, W, y + H - 1), fill='#999', width=2)
        img.save(f"{dir_}/hojas/h{h // N + 1:02d}.jpg", quality=82)
    json.dump(sel, open(dir_ + '/sel.json', 'w'), ensure_ascii=False)
    print(f"{len(sel)} candidato(s) · {len(os.listdir(dir_ + '/hojas'))} hoja(s) en {dir_}/hojas")
    print(f"afuera por margen abajo de {minm:g}%: {len(todos) - len(sel)} de {len(todos)} · fotos que no bajaron: {fallo} · sin link de foto: {sinurl}")

def comando(dir_, js):
    sel = json.load(open(dir_ + '/sel.json')); v = json.loads(js)
    falta = set(v) - {o['id'] for o in sel}
    if falta: sys.exit('ids que no están en la lista: ' + ', '.join(falta))
    # revcand sólo entiende candidatos (c…) y un id que no entiende frena TODO el comando: los probados se saltean
    # (13/10/2026, revisión 9). Y un candidato sin las dos fotos bajadas no va como ok: va como duda.
    prob = [o['id'] for o in sel if not re.match(r'^c\d+$', o['id'])]
    if prob: print(f"los probados no se escriben con revcand: {len(prob)} salteados", file=sys.stderr)
    partes, dudas = [], 0
    for o in sel:
        i = o['id']
        if i in prob: continue
        if i in v: partes.append(f"{i}={v[i]}"); continue
        if not (bajo(ruta(dir_, i, 'py')) and bajo(ruta(dir_, i, 'ml'))): partes.append(f"{i}=duda!no pude bajar la foto"); dudas += 1; continue
        partes.append(f"{i}=ok")
    if dudas: print(f"{dudas} van como duda porque alguna foto no bajó", file=sys.stderr)
    if not partes: sys.exit('no queda ningún candidato para revcand')
    print('revcand:' + ';'.join(partes) + ';go')

if __name__ == '__main__':
    if sys.argv[1] == 'armar': armar(sys.argv[2], sys.argv[3], float(sys.argv[4]) if len(sys.argv) > 4 else 25)
    elif sys.argv[1] == 'comando': comando(sys.argv[2], sys.argv[3])
