import re,sys,math
src=sys.argv[1]; out=sys.argv[2]
T=30
L=open(src).read().split('\n')
prods=[];grupo='';cur=None
for l in L:
    m=re.match(r'════ (\w+) ·',l)
    if m: grupo=m.group(1); continue
    m=re.match(r'^(p\w+) · (.*?) · v30 (\d+) v60 (\d+) v180 (\d+) · últ (\S+) · dCS (\d+) · Full (\d+) \[[^\]]*\] · casa (\d+) · camino (\d+)(.*)$',l)
    if m and grupo in('BSAS','PY','PAULVIC'):
        rest=m.group(11)
        g=lambda r: int(re.search(r,rest).group(1)) if re.search(r,rest) else 0
        cur=dict(id=m.group(1),n=m.group(2),g=grupo,v30=int(m.group(3)),v60=int(m.group(4)),v180=int(m.group(5)),ult=m.group(6),full=int(m.group(8)),casa=int(m.group(9)),cam=int(m.group(10)),
          py=g(r'PYviaja (\d+)'),pv=g(r'PVviaja (\d+)'),neto=g(r'neto \$(\d+)'),costo=g(r'costo \$(\d+)'),precio=g(r'precio \$(\d+)'),cambios=(re.search(r'precio \$\d+ \((.*?)\)',rest).group(1) if re.search(r'precio \$\d+ \((.*?)\)',rest) else ''),vars=[])
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
    if q==1 and r<1/30: q=1
    return q,r,tiene,obj,base
res=[];lines=[]
for p in prods:
    rentable = p['neto']>0 and p['neto']>=p['costo']*1.1
    if p['vars']:
        tot=0;dets=[]
        for v in p['vars']:
            q,r,t,obj,b=cuanto(v)
            if not rentable: q=0
            tot+=q;dets.append((v,q,r,t,obj,b))
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
for p,q,d,rent in res:
    pid=p['id']
    m=margen(p,p['precio'] or 1)
    if isinstance(d,list):
        anyv=any(qq for _,qq,*_ in d) or 'DECID' in str(p)
        for v,qq,r,t,obj,b in d:
            if not (qq or v['v180'] or v['full'] or v['casa']): continue
            mot=f"{b} · ritmo {r*30:.0f} por mes · tiene {t} entre Full casa y camino · para 30 dias hacen falta {obj:.0f}"
            if not rent: mot+=" · NO se compra: con el costo de la ficha no deja ganancia"
            N.append(f"ped:{pid}#{v['v']}=u|{qq}|{mot}")
        if q>0 and p['precio']: N.append(f"ped:{pid}=venta|{venta(p)}|precio normal de venta")
    else:
        r,t,obj,b=d
        if q==0 and not (p['v180'] or p['full']): continue
        mot=f"{b} · ritmo {r*30:.0f} por mes · tiene {t} entre Full casa camino y viajando · para 30 dias hacen falta {obj:.0f}"
        if not rent: mot+=" · NO se compra: con el costo de la ficha no deja ganancia"
        N.append(f"ped:{pid}=u|{q}|{mot}")
        if q>0 and p['precio']: N.append(f"ped:{pid}=venta|{venta(p)}|precio normal de venta")
open('pedidos.txt','w').write('\n'.join(N)+'\n')
print(len(N),'renglones')
