#!/usr/bin/env python3
"""Pasada de Claude por las fotos de "Para probar" (07/10/2026).

  python3 revfotos.py armar <log de fotosrev (json de get_job_logs o texto)> <carpeta> [margen mínimo, def 25]
      → baja las dos fotos de cada candidato y arma hojas de 4 (foto PY | foto ML | títulos) en <carpeta>/hojas
  python3 revfotos.py comando <carpeta> '<json {id: "no!nota" | "duda!nota"}>'
      → arma el `revcand:…;go` (los que no están en el json van como ok)
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

def armar(log, dir_, minm):
    from PIL import Image, ImageDraw, ImageFont
    sel = [o for o in leer_log(log) if num(o['m']) >= minm]
    os.makedirs(dir_ + '/img', exist_ok=True); os.makedirs(dir_ + '/hojas', exist_ok=True)
    jobs = []
    for o in sel:
        jobs.append((o.get('fotoPY', '').replace('/thumbs/med/', '/thumbs/big/'), f"{dir_}/img/{o['id'].replace('~','_')}_py"))
        jobs.append((o.get('fotoML', ''), f"{dir_}/img/{o['id'].replace('~','_')}_ml"))
    with cf.ThreadPoolExecutor(12) as ex: list(ex.map(lambda j: bajar(*j), jobs))
    F = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    font = ImageFont.truetype(F, 15); fb = ImageFont.truetype(F.replace('Sans.', 'Sans-Bold.'), 15)
    S, N = 240, 4; W, H = S * 2 + 540, S + 20
    def load(p):
        try:
            im = Image.open(p).convert('RGB'); im.thumbnail((S, S)); bg = Image.new('RGB', (S, S), 'white')
            bg.paste(im, ((S - im.width) // 2, (S - im.height) // 2)); return bg
        except Exception:
            bg = Image.new('RGB', (S, S), '#ddd'); ImageDraw.Draw(bg).text((60, 110), 'sin foto', fill='black', font=font); return bg
    for h in range(0, len(sel), N):
        ch = sel[h:h + N]; img = Image.new('RGB', (W, H * len(ch)), 'white'); d = ImageDraw.Draw(img)
        for k, o in enumerate(ch):
            y = k * H; img.paste(load(f"{dir_}/img/{o['id'].replace('~','_')}_py"), (5, y + 10)); img.paste(load(f"{dir_}/img/{o['id'].replace('~','_')}_ml"), (S + 15, y + 10))
            x = 2 * S + 30; d.text((x, y + 8), f"#{h + k + 1} {o['id']} · {o['m']}%{o['extra']}", fill='black', font=fb); yy = y + 32
            for lab, t in (('PY', o.get('PY', '')), ('ML', o.get('ML', ''))):
                for ln in textwrap.wrap(lab + ': ' + t, 52)[:5]: d.text((x, yy), ln, fill='#003399' if lab == 'PY' else '#990000', font=font); yy += 19
                yy += 8
            d.line((0, y + H - 1, W, y + H - 1), fill='#999', width=2)
        img.save(f"{dir_}/hojas/h{h // N + 1:02d}.jpg", quality=82)
    json.dump(sel, open(dir_ + '/sel.json', 'w'), ensure_ascii=False)
    print(f"{len(sel)} candidato(s) · {len(os.listdir(dir_ + '/hojas'))} hoja(s) en {dir_}/hojas")

def comando(dir_, js):
    sel = json.load(open(dir_ + '/sel.json')); v = json.loads(js)
    falta = set(v) - {o['id'] for o in sel}
    if falta: sys.exit('ids que no están en la lista: ' + ', '.join(falta))
    partes = [f"{o['id']}={v[o['id']]}" if o['id'] in v else f"{o['id']}=ok" for o in sel]
    print('revcand:' + ';'.join(partes) + ';go')

if __name__ == '__main__':
    if sys.argv[1] == 'armar': armar(sys.argv[2], sys.argv[3], float(sys.argv[4]) if len(sys.argv) > 4 else 25)
    elif sys.argv[1] == 'comando': comando(sys.argv[2], sys.argv[3])
