import re,sys,math
src=sys.argv[1]; out=sys.argv[2]
T=30
L=open(src).read().split('\n')
prods=[];grupo='';cur=None
for l in L:
    m=re.match(r'════ (\w+) ·',l)
    if m: grupo=m.group(1); continue
    m=re.match(r'^(p\w+) · (.*?) · v30 (\d+) v60 (\d+) v180 (\d+) · últ (\S+)(?: · REMATE (\d+))?(?: · BARATA (\d+))? · dCS (\d+) · Full (\d+) \[[^\]]*\] · casa (\d+) · camino (\d+)(.*)$',l)
    if m and grupo in('BSAS','PY','PAULVIC'):
        rest=m.group(13)
        g=lambda r: int(re.search(r,rest).group(1)) if re.search(r,rest) else 0
        cur=dict(id=m.group(1),n=m.group(2),g=grupo,v30=int(m.group(3)),v60=int(m.group(4)),v180=int(m.group(5)),ult=m.group(6),rem=int(m.group(7) or 0),barata=int(m.group(8) or 0),full=int(m.group(10)),casa=int(m.group(11)),cam=int(m.group(12)),
          py=g(r'PYviaja (\d+)'),pv=g(r'PVviaja (\d+)'),colores=g(r'colores (\d+)'),neto=g(r'neto \$(\d+)'),costo=g(r'costo \$(\d+)'),precio=g(r'precio \$(\d+)'),cambios=(re.search(r'precio \$\d+ \((.*?)\)',rest).group(1) if re.search(r'precio \$\d+ \((.*?)\)',rest) else ''),vars=[])
        prods.append(cur); continue
    m=re.match(r'^   # (.*?) · v30 (\d+) v60 (\d+) v180 (\d+) · últ (\S+) · Full (\d+) · casa (\d+) · camino (\d+)(.*)$',l)
    if m and cur:
        pv=re.search(r'PVviaja (\d+)',m.group(9))
        cur['vars'].append(dict(v=m.group(1),v30=int(m.group(2)),v60=int(m.group(3)),v180=int(m.group(4)),ult=m.group(5),full=int(m.group(6)),casa=int(m.group(7)),cam=int(m.group(8)),pv=int(pv.group(1)) if pv else 0))
def ritmo(x):
    tiene=x['full']+x['casa']+x['cam']+x.get('py',0)+x.get('pv',0)
    r30=x['v30']/30; r60=x['v60']/60; r180=x['v180']/180
    if x['v30']>=3: r=max(r30,r60*0.8); base=f"vendió {x['v30']} en 30 d"
    elif x['v60']>=3: r=r60; base=f"vendió {x['v60']} en 60 d"
    elif x['v180']>=4 and x['full']==0: r=r180; base=f"agotado · vendía {x['v180']} en 180 d"
    elif x['v30']>0: r=x['v30']/30; base=f"vendió {x['v30']} en 30 d"
    else: r=0; base=f"{x['v180']} en 180 d" if x['v180'] else "nunca vendió"
    return r,tiene,base
def cuanto(x):
    r,tiene,base=ritmo(x)
    obj=r*T
    need=obj-tiene
    q=max(0,math.ceil(need-0.25)) if need>0 else 0
    return q,r,tiene,obj,base
res=[];lines=[]
for p in prods:
    rentable = p['neto']>0 and p['neto']>=p['costo']*1.1
    if p['vars']:
        tot=0;dets=[]
        for v in p['vars']:
            q,r,t,obj,b=cuanto(v)
            if not rentable: q=0
            dets.append([v,q,r,t,obj,b])
        # Lo que el producto tiene SIN COLOR (viajando de Paraguay, Full de publicaciones sin color, oficina o cajas sin color)
        # también cubre: se descuenta de los colores que más piden (revisión 9 · cerebro, 09/10/2026).
        sc=p.get('py',0)+max(0,p['full']-sum(v['full'] for v in p['vars']))+max(0,p['casa']-sum(v['casa'] for v in p['vars']))+max(0,p['cam']-sum(v['cam'] for v in p['vars']))
        p['sinColor']=sc
        while sc>0 and any(d[1]>0 for d in dets):
            d=max(dets,key=lambda d:d[1]); d[1]-=1; sc-=1
        dets=[tuple(d) for d in dets]; tot=sum(d[1] for d in dets)
        res.append((p,tot,dets,rentable))
    else:
        q,r,t,obj,b=cuanto(p)
        if not rentable: q=0
        res.append((p,q,(r,t,obj,b),rentable))
with open(out,'w') as f:
    for p,q,d,rent in res:
        if isinstance(d,list):
            f.write(f"{p['g']} {p['id']} {p['n'][:40]} TOTAL {q} {'NO RENTA' if not rent else ''} precio {p['precio']} {p['cambios']}\n")
            for v,qq,r,t,obj,b in d:
                if qq or v['v180']: f.write(f"    #{v['v']}: {qq}  (r {r*30:.1f}/mes · tiene {t} · obj {obj:.1f} · {b})\n")
        else:
            r,t,obj,b=d
            f.write(f"{p['g']} {p['id']} {p['n'][:40]} -> {q} (r {r*30:.1f}/mes · tiene {t} · obj {obj:.1f} · {b}) {'NO RENTA' if not rent else ''} precio {p['precio']} {p['cambios']}\n")
import json;json.dump([(p,q,d,rent) for p,q,d,rent in res],open(out+'.json','w'),default=str)
# ---- JUICIOS A MANO (09/10/2026): lo que Claude decidió mirando la línea de tiempo de un producto, que la cuenta sola no
# puede ver (ej. el Ultra Shift: se vendió a pérdida porque estuvo parado; la Lupa 75mm: barata pero se vendía al toque).
# ml-sync/notas/juicios.txt · un renglón por producto: <prodId>[#color]=<unidades>|<motivo> · manda sobre la cuenta.
import os
JU={}
_jp=os.path.join(os.path.dirname(os.path.abspath(__file__)),'juicios.txt')
if os.path.exists(_jp):
    for l in open(_jp):
        l=l.strip()
        if not l or l.startswith('#') or '=' not in l: continue
        k,r=l.split('=',1); n,_,mo=r.partition('|')
        try: JU[k.strip()]=(int(n),mo.strip())
        except ValueError: pass
# ---- notas para decido ----
def venta(p):
    pr=p['precio']; best=pr
    for m in re.finditer(r'⬆️\$(\d+)→\$(\d+) (\d+)d',p['cambios']):
        de,a,d=int(m.group(1)),int(m.group(2)),int(m.group(3))
        if d<=3 and pr>de*1.15: best=min(best,de)
    return best
def margen(p,pr):
    if not p['neto'] or not p['costo']: return None
    return (p['neto']-0.06*pr-p['costo'])/p['costo']
N=[];Rz=[]
# EL MOTIVO LO LEE TITO (09/10/2026, Matías: "los pedidos los ve mi viejo y entra en el cerebrito (...) referite como
# 'hola tito!' y explicale por qué le pediste ese producto y esas unidades. hablale con confianza y resumido").
def tito(q,r,t,obj,b,rent,neto,color=None,extra=''):
    de=f" del {color}" if color else ''
    quien=f"El {color}" if color else "Este"
    if not rent:
        return "Hola Tito! "+quien+" no lo compres: "+("todavía no sé cuánto deja en ML." if not neto else "con lo que cuesta no nos deja ganancia.")
    mes=f"{r*30:.0f}"; b=str(b or '')
    if b.startswith('agotado'): base=f"está agotado y cuando había se vendían unos {mes} por mes"
    elif b.startswith('nunca'): base="todavía no se vendió nunca"
    else: base=f"se venden unos {mes} por mes"
    if q>0:
        x=f"Hola Tito! Te pido {q}{de}: {base} y entre Full, la oficina y lo que viene en camino hay {t}. Con {q} más cubrimos un mes."
    elif b.startswith('nunca'):
        x=f"Hola Tito! {quien} no lo compres: {base}."
    else:
        dias=(t/r) if r>0 else None
        x=f"Hola Tito! {quien} no hace falta: {base} y ya hay {t}"+(f", alcanza para unos {dias:.0f} días." if dias and dias<999 else ".")
    return x+(' '+extra if extra else '')
def titoJ(mo): return "Hola Tito! "+mo
for p,q,d,rent in res:
    pid=p['id']
    m=margen(p,p['precio'] or 1)
    if isinstance(d,list):
        anyv=any(qq for _,qq,*_ in d) or 'DECID' in str(p)
        for v,qq,r,t,obj,b in d:
            if not (qq or v['v180'] or v['full'] or v['casa']): continue
            mot=tito(qq,r,t,obj,b,rent,p['neto'],v['v'],(f"Ya desconté {p['sinColor']} que están sin color." if p.get('sinColor') else ''))
            kj=f"{pid}#{v['v']}"
            if kj in JU: qq,mot=JU[kj][0],titoJ(JU[kj][1])
            elif pid in JU: qq,mot=0 if JU[pid][0]==0 else qq,titoJ(JU[pid][1])
            N.append(f"ped:{pid}#{v['v']}=u|{qq}|{mot}")
        if p['precio']: N.append(f"ped:{pid}=venta|{venta(p)}|precio normal de venta para el maximo de compra")
    else:
        r,t,obj,b=d
        # siempre se escribe (aunque sea 0): si no, una decisión vieja queda colgada (el Ultra Shift del 09/10).
        # Un producto con colores sin ningún dato por color no se puede escribir sin color (decido lo rechaza): se saltea.
        if p.get('colores') and q==0: continue
        ex=''
        if p.get('rem'): ex+=f"No cuento {p['rem']} que se remataron porque estaban parados. "
        if p.get('barata'): ex+=f"Cuento {p['barata']} que se vendieron baratas porque salían al toque. "
        mot=tito(q,r,t,obj,b,rent,p['neto'],None,ex.strip())
        if pid in JU: q,mot=JU[pid][0],titoJ(JU[pid][1])
        N.append(f"ped:{pid}=u|{q}|{mot}")
        if p['precio']: N.append(f"ped:{pid}=venta|{venta(p)}|precio normal de venta para el maximo de compra")
open('pedidos.txt','w').write('\n'.join(N)+'\n')
print(len(N),'renglones')
