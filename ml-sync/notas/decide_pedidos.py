import re,sys,math,os,json
# Arma los pedidos de TODO el catálogo a partir del log de `pedidostodo` (09/10/2026; revisión 9 del 13/10/2026).
# Uso: python3 decide_pedidos.py <log de pedidostodo> <salida> → escribe <salida>, <salida>.json y pedidos.txt
# Objetivo 30 días: ritmo (por día CON stock: dCS) menos Full + oficina + camino + viajando. Sin ganancia o sin costo = 0.
src=sys.argv[1]; out=sys.argv[2]
T=30
# El log de GitHub trae la hora adelante de cada renglón ("2026-10-13T11:52:03.1234567Z "): se saca, si no no se lee nada.
L=[re.sub(r'^\d{4}-\d\d-\d\dT[\d:.]+Z ?','',l) for l in open(src).read().split('\n')]
if any('NO LEÍ' in l for l in L):
    print('⚠️ el log dice NO LEÍ: pedidostodo no pudo leer algo de la base. No armo pedidos a medias:',*[l for l in L if 'NO LEÍ' in l],sep='\n  '); sys.exit(1)
tc=next((float(m.group(1)) for l in L for m in [re.match(r'^dólar ([\d.]+) ·',l)] if m),0)
if not tc>0: print('⚠️ el log no trae el dólar (o está en 0): sin dólar los costos dan 0. No armo nada.'); sys.exit(1)
prods=[];grupo='';cur=None;esper={};nfichas=None;noEnt=[];cuentaOk=False;nDecidir=None;nFuera=None
# `hist N d` (etapa 3, 20/10/2026): días de la PRIMERA a la ÚLTIMA venta en 180 d, con piso de 7 (lo mismo que `ventasHistoricas`
# de la web). Un log viejo no lo trae: ahí lo agotado se sigue midiendo ÷180.
def nor_de(t):
    m=re.search(r' · NOR (\d+)/(\d+) (\d+)/(\d+)@(\d+)',t or '')
    return dict(u30=int(m.group(1)),d30=int(m.group(2)),u=int(m.group(3)),d=int(m.group(4)),w=int(m.group(5))) if m else None
def hist_de(t):
    mh=re.search(r' · hist ([\d.]+)d',t)
    return float(mh.group(1)) if mh else None
for l in L:
    m=re.match(r'^dólar \S+ · ventana .* · (\d+) fichas',l)
    if m: nfichas=int(m.group(1))
    m=re.match(r'════ (\w+) · (\d+) ════',l)
    if m: grupo=m.group(1); esper[grupo]=int(m.group(2)); cur=None; continue
    if l.startswith('════'): grupo=''; cur=None; continue
    # La línea final de pedidostodo (etapa 5, 20/10/2026): sin ella el log está cortado. Trae cuántas son para decidir.
    m=re.match(r'^CUENTA: (\d+) fichas = (\d+) para decidir \+ (\d+) fuera (.*)$',l)
    if m: cuentaOk=('✓' in m.group(4)); nDecidir=int(m.group(2)); nFuera=int(m.group(3)); continue
    m=re.match(r'^(p\w+) · (.*?) · v30 (\d+) v60 (\d+) v180 (\d+) · últ (\S+)(?: · REMATE (\d+))?(?: · BARATA (\d+))? · dCS (\d+)(?: · cortes (\d+))? · Full (\d+) \[[^\]]*\] · casa (\d+) · camino (\d+)(.*)$',l)
    if m and grupo in('BSAS','PY','PAULVIC'):
        rest=m.group(14)
        g=lambda r: int(re.search(r,rest).group(1)) if re.search(r,rest) else 0
        cm=re.search(r'precio \$\d+ \((.*?)\)',rest)
        cur=dict(id=m.group(1),n=m.group(2),g=grupo,v30=int(m.group(3)),v60=int(m.group(4)),v180=int(m.group(5)),ult=m.group(6),rem=int(m.group(7) or 0),barata=int(m.group(8) or 0),dcs=int(m.group(9)),cortes=int(m.group(10) or 0),full=int(m.group(11)),casa=int(m.group(12)),cam=int(m.group(13)),
          py=g(r'PYviaja (\d+)'),pv=g(r'PVviaja (\d+)'),li=g(r'LIviaja (\d+)'),colores=g(r'colores (\d+)'),neto=g(r'neto \$(\d+)'),costo=g(r'costo \$(\d+)'),precio=g(r'precio \$(\d+)'),med60=g(r'med60 \$(\d+)'),ultv=g(r'ultv \$(\d+)'),
          cambios=(cm.group(1) if cm else ''),decidido=(' YA DECIDÍ ' in rest),vars=[],hist=hist_de(rest),colFicha=None,nor=nor_de(rest))
        prods.append(cur); continue
    # Un renglón de producto que NO se entiende (un dato nuevo en el medio): sus colores NO pueden ir al producto de arriba.
    if re.match(r'^p\w+ · ',l): cur=None; noEnt.append(l[:110]); continue
    # Los colores de la ficha (etapa 3, 20/10/2026): también los que no tienen renglón (sin ventas ni mercadería).
    m=re.match(r'^   ## colores (\[.*\])\s*$',l)
    if m and cur:
        try: cur['colFicha']=[str(x) for x in json.loads(m.group(1))]
        except ValueError: pass
        continue
    m=re.match(r'^   # (.*?) · v30 (\d+) v60 (\d+) v180 (\d+) · últ (\S+)(?: · dCS (\d+))?(?: · cortes (\d+))? · Full (\d+) · casa (\d+) · camino (\d+)(.*)$',l)
    if m and cur:
        rv=m.group(11); pv=re.search(r'PVviaja (\d+)',rv); li=re.search(r'LIviaja (\d+)',rv); cv=re.search(r' · cambios \((.*?)\)',rv); mn=re.search(r' · mano (\d+)( vencida)?',rv)
        cur['vars'].append(dict(v=m.group(1),v30=int(m.group(2)),v60=int(m.group(3)),v180=int(m.group(4)),ult=m.group(5),dcs=int(m.group(6)) if m.group(6) else cur['dcs'],cortes=int(m.group(7) or 0),full=int(m.group(8)),casa=int(m.group(9)),cam=int(m.group(10)),pv=int(pv.group(1)) if pv else 0,li=int(li.group(1)) if li else 0,nunca=(' · NUNCA' in rv),
          hist=hist_de(rv),cambios=(cv.group(1) if cv else None),mano=(int(mn.group(1)) if mn else None),manoVenc=bool(mn and mn.group(2)),nor=nor_de(rv)))
# N DE M: que se hayan leído TODAS las fichas que imprimió pedidostodo (si no, un renglón con otro formato se pierde callado).
for gr,n in esper.items():
    if gr in('BSAS','PY','PAULVIC'):
        k=sum(1 for p in prods if p['g']==gr)
        print(f"{gr}: leí {k} de {n}"+(' ✓' if k==n else ' ⚠️ NO CIERRA: hay renglones que no entendí'))
if not esper: print('⚠️ no encontré ningún grupo (════ BSAS ════…): ¿es el log de pedidostodo?'); sys.exit(1)
# NO SE ESCRIBE NADA A MEDIAS (etapa 5, 20/10/2026): renglones que no entendí, un grupo que no cierra, un grupo que falta o la
# línea final "CUENTA: … ✓" que no está (el log se cortó o pedidostodo se cayó) → no se arma ningún archivo.
malo=[]
if noEnt: malo.append(f"{len(noEnt)} renglón(es) de producto que no entendí (¿formato nuevo?):\n    "+'\n    '.join(noEnt[:5]))
for gr in ('BSAS','PY','PAULVIC'):
    if gr not in esper: malo.append(f'falta el grupo {gr} (el log está cortado)')
    elif sum(1 for p in prods if p['g']==gr)!=esper[gr]: malo.append(f'{gr} no cierra')
if not cuentaOk: malo.append('falta la línea final "CUENTA: … ✓" (el log está cortado o pedidostodo no cerró)')
if malo: print('⚠️ NO ARMO PEDIDOS: '+' · '.join(malo)); sys.exit(1)
def ritmo(x,dcs=30):
    # 🛒 A PRECIO NORMAL (27/10/2026, él eligió 1a): si pedidostodo trae `NOR u30/d30 u/d@ventana`, el ritmo sale SÓLO de los días con
    # stock a precio normal (sin 🔥 escasez, ⏳ sin reposición, 📦 sobra, liquidando ni remate): lo vendido caro en escasez no achica la
    # compra y lo vendido barato por sobra no la agranda. 60 días; con menos de 14 días normales, 180; si tampoco, 365 (con 7+ días).
    # Con 3+ ventas en los últimos 30 días normales manda el más alto entre ése y el 80% del largo (como antes con v30/v60).
    nr=x.get('nor')
    if nr and (nr['d']>=14 or (nr['w']==365 and nr['d']>=7)):
        tiene=x['full']+x['casa']+x['cam']+x.get('py',0)+x.get('pv',0)+x.get('li',0)
        rL=nr['u']/nr['d']; r=rL
        if nr['u30']>=3 and nr['d30']>=7: r=max(nr['u30']/nr['d30'],rL*0.8)
        base=f"a precio normal vendió {nr['u']} en {nr['d']} días con stock (últimos {nr['w']} d, sin contar escasez, sobra ni remate)"
        if r!=rL: base+=f" · {nr['u30']} en los últimos {nr['d30']}"
        return r,tiene,base
    # `li` (20/10/2026, decisión 1a): lo ya probado pedido a una lista que viaja (o llegó y falta contar), igual que Paraguay y el Paulvic.
    tiene=x['full']+x['casa']+x['cam']+x.get('py',0)+x.get('pv',0)+x.get('li',0)
    d=max(7,min(30,dcs)); R=lambda n: f"{round(n):d}"   # con ventas sin color repartidas las cuentas pueden tener decimales   # días con stock en 30 (con piso de 7: con 1-2 días una venta suelta pediría una caja entera)
    r30=x['v30']/d; r60=x['v60']/60; r180=x['v180']/180
    # LO AGOTADO SE MIDE MIENTRAS SE VENDÍA (etapa 3, 20/10/2026): unidades ÷ los días de la primera a la última venta en 180 d
    # (`hist`, piso 7), como `ventasHistoricas` de la web. Antes ÷180 o ÷60 fijos: el Adaptador 8 en 1 (35 en un mes, agotado desde
    # julio) pedía 6 cuando vendía más de 1 por día. Sin `hist` (log viejo) queda la cuenta de antes.
    hs=x.get('hist'); agot=x['full']==0
    def _hist(): return f"agotado · vendía {R(x['v180'])} en {R(hs)} d (de la primera a la última venta)"
    if x['v30']>=3: r=max(r30,r60*0.8); base=f"vendió {R(x['v30'])} en {d} d con stock" if d<30 else f"vendió {R(x['v30'])} en 30 d"
    elif agot and x['v30']==0 and x['v180']>=3 and hs: r=max(r60,x['v180']/hs); base=_hist()
    elif x['v60']>=3: r=r60; base=f"vendió {R(x['v60'])} en 60 d"
    elif x['v180']>=4 and agot:
        if hs: r=x['v180']/hs; base=_hist()
        else: r=r180; base=f"agotado · vendía {R(x['v180'])} en 180 d"
    elif x['v30']>0: r=x['v30']/d; base=f"vendió {R(x['v30'])} en 30 d"
    else: r=0; base=f"{R(x['v180'])} en 180 d" if x['v180'] else "nunca vendió"
    # ESCASEZ (13/10/2026, él: "si subo por escasez se vende menos de lo normal; eso no debería achicar las unidades a
    # comprar"). Si en los últimos 30 días subí el precio POR ESCASEZ, las ventas de después no son el ritmo real:
    # manda el ritmo de antes (los 30 días previos, o el de 60 días), nunca uno más bajo.
    # 2a (16/10/2026): también una suba de PRUEBA de techo (PRU) achica las ventas: manda el ritmo normal de antes.
    esc=[int(d) for d in re.findall(r'⬆️\$\d+→\$\d+ (\d+)d(?:ESC|PRU)',x.get('cambios',''))]
    if esc and min(esc)<=30:
        rPre=max((x['v60']-x['v30'])/30, x['v60']/60)
        if rPre>r: r=rPre; base+=f" · subí el precio (escasez o prueba) hace {min(esc)} d: uso el ritmo de antes ({R(x['v60']-x['v30'])} en los 30 d previos)"
    return r,tiene,base
# 45 DÍAS PARA LO DE BS AS QUE SE CORTA (16/10/2026, idea 1 del análisis, eligió la a): lo que se cortó 2+ veces en 60 días,
# vende medio por día o más y deja 25%+ se compra para 45 días (con ~14 días de compra a Full, 30 no alcanzaba y se volvía a
# cortar). Y lo nuevo que vuela (1+ por día en su primera semana con stock) también. El resto sigue en 30.
def Tde(p,x,r):
    # PAULVIC: pedido cada 15 días para 45 días de su ritmo (análisis a fondo, 16/10/2026, idea 3 · CEREBRO.md).
    if p['g']=='PAULVIC' and r>0: return 45,'el Paulvic se pide cada 15 días'
    if p['g']!='BSAS' or r<0.5: return T,''
    pr=p.get('precio') or p.get('med60') or 0
    # Mismo % que la app (revisión etapa 1, 24/10): impuestos también en el divisor (antes sólo el costo: daba 27% donde la app da 22,6%).
    # El log no trae el envío de Full: abajo de $33.000 (casi todo Bs As) es 0; arriba ya viene restado del neto.
    imp=0.08*pr
    m=((p['neto']-imp-p['costo'])/(p['costo']+imp)) if p['costo']>0 and p['neto']>0 else -1
    if m<0.35: return T,''   # 24/10/2026: 35% (él: todo en 35% o más)
    if x.get('cortes',0)>=2: return 45,f"se cortó {x['cortes']} veces en 60 días"
    if p['v180']==p['v30'] and x.get('dcs',30)<=10 and r>=1: return 45,'es nuevo y vuela'
    return T,''
def reparto(total,pesos):
    # reparte `total` unidades enteras según `pesos` (resto mayor): la suma da justo el total
    s=sum(pesos)
    if total<=0 or s<=0: return [0]*len(pesos)
    ex=[total*w/s for w in pesos]; q=[int(math.floor(e)) for e in ex]
    for i in sorted(range(len(ex)),key=lambda i:ex[i]-q[i],reverse=True)[:total-sum(q)]: q[i]+=1
    return q
res=[]
for p in prods:
    # Sin costo cargado no se puede decir que deja ganancia (antes 0 de costo = "rentable" y pedía de todo).
    # 24/10/2026 (él: "quiero que todo quede en 35% o más, ventas y pedidos, no tenemos plata para todo"): se repone sólo lo que a su
    # precio deja 35%+ con la cuenta de la app (impuestos en el divisor; el envío de Full ya viene restado del neto).
    _imp=0.08*(p.get('precio') or p.get('med60') or 0)
    _m=((p['neto']-_imp-p['costo'])/(p['costo']+_imp)) if p['costo']>0 and p['neto']>0 else -1
    rentable = p['costo']>0 and p['neto']>0 and _m>=0.35
    p['motNoRenta']='' if rentable else ('falta el costo' if not p['costo']>0 else ('todavía no sé cuánto deja en ML' if not p['neto'] else f'deja {round(_m*100)}%, abajo del 35% (no se repone hasta que su precio llegue)'))
    if p['vars']:
        # Ventas SIN color (la venta no dice qué color fue): se reparten entre los colores según lo que vende cada uno.
        for f in ('v30','v60','v180'):
            sobra=max(0,p[f]-sum(v[f] for v in p['vars']))
            if sobra:
                pesos=[v['v180'] or v['v60'] or v['v30'] for v in p['vars']]
                if sum(pesos)>0:
                    for v,w in zip(p['vars'],pesos): v[f]=v[f]+sobra*w/sum(pesos)
                p['sinColorV_'+f]=sobra
        dets=[]
        for v in p['vars']:
            # Cada color con SUS cambios de precio (etapa 3, 20/10/2026): un log nuevo los trae en el renglón del color; un log viejo no, y
            # ahí se usan los del producto como antes. Sin hora de venta propia, el `hist` del producto.
            vc=v['cambios'] if p.get('colFicha') is not None else p['cambios']
            r,t,b=ritmo(dict(v,cambios=vc or '',hist=v.get('hist') or p.get('hist')),v['dcs']); Tv,por=Tde(p,v,r); need=max(0.0,r*Tv-t)
            if por: b+=f' · {Tv} días porque {por}'
            dets.append([v,need,r,t,r*Tv,b])
        # Lo que el producto tiene SIN COLOR (viajando de Paraguay, Full de publicaciones sin color, oficina o cajas sin color)
        # también cubre: se descuenta de los colores que más piden (revisión 9, 09/10/2026).
        sc=p.get('py',0)+max(0,p.get('li',0)-sum(v.get('li',0) for v in p['vars']))+max(0,p['full']-sum(v['full'] for v in p['vars']))+max(0,p['casa']-sum(v['casa'] for v in p['vars']))+max(0,p['cam']-sum(v['cam'] for v in p['vars']))
        sc0=sc
        while sc>0 and any(d[1]>0 for d in dets):
            d=max(dets,key=lambda d:d[1]); u=min(1,d[1],sc); d[1]-=u; sc-=u
        p['sinColor']=round(sc0-sc)   # lo que de verdad se descontó
        # Total del producto con UN redondeo y reparto por resto mayor (antes cada color redondeaba para arriba y se inflaba).
        tot=max(0,math.ceil(sum(d[1] for d in dets)-0.25)) if rentable else 0
        qs=reparto(tot,[d[1] for d in dets])
        dets=[(d[0],q,d[2],d[3],d[4],d[5]) for d,q in zip(dets,qs)]
        res.append((p,tot,dets,rentable))
    else:
        r,t,b=ritmo(p,p['dcs']); Tp,por=Tde(p,p,r); need=r*Tp-t
        if por: b+=f' · {Tp} días porque {por}'
        q=max(0,math.ceil(need-0.25)) if need>0 else 0
        if not rentable: q=0
        res.append((p,q,(r,t,r*Tp,b),rentable))
with open(out,'w') as f:
    for p,q,d,rent in res:
        nr=f"NO RENTA ({p['motNoRenta']})" if not rent else ''
        if isinstance(d,list):
            f.write(f"{p['g']} {p['id']} {p['n'][:40]} TOTAL {q} {nr} precio {p['precio']} med60 {p['med60']} {p['cambios']}\n")
            for v,qq,r,t,obj,b in d:
                mano=(f"  ✋ a mano {v['mano']}"+(' (vencida: entró mercadería a la oficina)' if v.get('manoVenc') else ' (manda en la web sobre esto)')) if v.get('mano') is not None else ''
                if qq or v['v180'] or mano: f.write(f"    #{v['v']}: {qq}  (r {r*30:.1f}/mes · tiene {t} · obj {obj:.1f} · {b}){mano}\n")
        else:
            r,t,obj,b=d
            f.write(f"{p['g']} {p['id']} {p['n'][:40]} -> {q} (r {r*30:.1f}/mes · tiene {t} · obj {obj:.1f} · {b}) {nr} precio {p['precio']} med60 {p['med60']} {p['cambios']}\n")
json.dump([(p,q,d,rent) for p,q,d,rent in res],open(out+'.json','w'),default=str)
# ---- JUICIOS A MANO (09/10/2026): lo que Claude decidió mirando la línea de tiempo de un producto, que la cuenta sola no
# puede ver (ej. el Ultra Shift: se vendió a pérdida porque estuvo parado; la Lupa 75mm: barata pero se vendía al toque).
# ml-sync/notas/juicios.txt · un renglón por producto: <prodId>[#color]=<unidades>|<motivo> · manda sobre la cuenta.
JU={}
_jp=os.path.join(os.path.dirname(os.path.abspath(__file__)),'juicios.txt')
if os.path.exists(_jp):
    for l in open(_jp):
        l=l.strip()
        if not l or l.startswith('#') or '=' not in l: continue
        k,r=l.split('=',1); n,_,mo=r.partition('|')
        try: JU[k.strip()]=(int(n),mo.strip())
        except ValueError: print(f"⚠️ juicio que no entiendo: {l[:80]}")
# JUICIOS DE UN COLOR SIN RENGLÓN (etapa 3, 20/10/2026): `pedidostodo` no imprime los colores sin ventas ni mercadería, y el juicio
# de uno de ésos (ej. Pizarra 12" Rojo=4) se perdía sin aviso. Ahora el color se busca en la FICHA (`## colores`, sin mirar mayúsculas)
# y el juicio se aplica aunque no tenga renglón; si el color no existe en la ficha, se avisa y no se usa.
_JUn={k.lower():k for k in JU}
def juDe(pid,color=None):
    k=_JUn.get((pid+('#'+color if color else '')).lower()); return JU[k] if k else None
def colorFicha(p,c):
    lst=p.get('colFicha') if p.get('colFicha') is not None else [v['v'] for v in p['vars']]
    return next((x for x in lst if x.lower()==c.lower()),None)
_ids={p['id']:p for p in prods}
for k in JU:
    pid,_,c=k.partition('#')
    if pid not in _ids: print(f"⚠️ el juicio {k} no coincide con ningún producto del log: no se usa"); continue
    if c and colorFicha(_ids[pid],c) is None:
        if _ids[pid].get('colFicha') is None: print(f"⚠️ el juicio {k}: el log es viejo (sin la lista de colores de la ficha) y ese color no tiene renglón: no se usa")
        else: print(f"⚠️ el juicio {k}: la ficha {_ids[pid]['n']} no tiene el color \"{c}\" (tiene: {' | '.join(_ids[pid]['colFicha'])}): no se usa")
def juiciosSinRenglon(p,ya):
    # los juicios de color de este producto cuyo color existe en la ficha y no está en `ya` (los colores con renglón)
    out=[]
    for k in JU:
        pid,_,c=k.partition('#')
        if pid!=p['id'] or not c: continue
        cf=colorFicha(p,c)
        if cf and cf.lower() not in {x.lower() for x in ya} and p.get('colFicha') is not None:
            out.append(dict(v=cf,v30=0,v60=0,v180=0,full=0,casa=0,cam=0,nunca=False,mano=None))
    return out
# ---- notas para decido ----
# PRECIO DE VENTA A MANO PARA EL MÁXIMO (20/10/2026): la mediana de 60 días arrastra ventas viejas baratas. El Ferrari Negro
# quedaba en $68.510 (vendía barato y se agotaba) y con eso "el precio de Paraguay no da" cuando al precio que más plata dejó
# ($75.360) da ~27%. ml-sync/notas/venta_max.txt · <prodId>=<precio>|<motivo> · manda sobre la cuenta de abajo.
VM={}
_vp=os.path.join(os.path.dirname(os.path.abspath(__file__)),'venta_max.txt')
if os.path.exists(_vp):
    for _l in open(_vp):
        _m=re.match(r'^(p\d+)=(\d+)\|',_l.strip())
        if _m: VM[_m.group(1)]=int(_m.group(2))
def venta(p):
    if p['id'] in VM: return VM[p['id']]
    # SI YA VENDIÓ, MANDA EL PRECIO DE LA ÚLTIMA VENTA (23/10/2026, él: *"si nunca vendió toma el % que decís vos. si ya vendió no
    # importa si fue sólo 1 unidad. tomar ese %"*): una suba que ya vendió vale para el máximo de compra aunque sea 1 unidad (antes la
    # mediana de 60 d la tapaba con las ventas viejas, más baratas). Sin pasar el precio de hoy: si después lo bajé, se vende a ése.
    # La última venta de escasez o sin reposición no cuenta (`ultv` ya la saltea en pedidostodo). Nunca vendió → el precio de hoy.
    if p.get('ultv'): return min(p['precio'],p['ultv']) if p['precio'] else p['ultv']
    if p['v180']==0 and p['precio']: return p['precio']
    # Log viejo sin `ultv`: el precio NORMAL para el máximo de compra: el menor entre el de hoy y la mediana de lo cobrado en 60 días (sin remates).
    # Un precio subido por escasez no infla el máximo (revisión 9, 13/10/2026). Sin ventas en 60 d, el de hoy menos las subas recientes.
    pr=p['precio']; best=pr
    if p.get('med60'): best=min(pr,p['med60']) if pr else p['med60']
    for m in re.finditer(r'⬆️\$(\d+)→\$(\d+) (\d+)d',p['cambios']):
        de,a,d=int(m.group(1)),int(m.group(2)),int(m.group(3))
        if not p.get('med60') and d<=3 and pr>de*1.15: best=min(best,de)
    return best
def venta_mot(p):
    if p['id'] in VM: return 'precio de venta que fijé a mano para el maximo de compra'
    if p.get('ultv') and (not p['precio'] or p['ultv']<=p['precio']): return f"precio de la ultima venta (${p['ultv']}) para el maximo de compra"
    if p.get('ultv'): return f"precio de hoy para el maximo de compra (la ultima venta fue a ${p['ultv']}, mas cara)"
    if p['v180']==0: return 'nunca vendio: precio de hoy para el maximo de compra'
    return 'precio normal de venta para el maximo de compra'
N=[];avisos=[]
# EL MOTIVO LO LEE TITO (09/10/2026, Matías: "los pedidos los ve mi viejo y entra en el cerebrito (...) referite como
# 'hola tito!' y explicale por qué le pediste ese producto y esas unidades. hablale con confianza y resumido").
def tito(q,r,t,obj,b,rent,neto,color=None,extra='',motNo=''):
    de=f" del {color}" if color else ''
    quien=f"El {color}" if color else "Este"
    if not rent:
        return "Hola Tito! "+quien+" no lo compres: "+({'falta el costo':'todavía no tengo cargado cuánto cuesta.','todavía no sé cuánto deja en ML':'todavía no sé cuánto deja en ML.'}.get(motNo,(f"al precio de hoy deja {motNo.split(' ')[1].rstrip(',')} y ahora compramos sólo lo que deja 35% o más. Si al subirlo sigue vendiendo, lo vuelvo a pedir." if str(motNo).startswith('deja ') else 'con lo que cuesta no nos deja ganancia.')))
    mes=f"{r*30:.0f}"; b=str(b or '')
    if b.startswith('agotado'): base=f"está agotado y cuando había se vendían unos {mes} por mes"
    elif b.startswith('nunca'): base="todavía no se vendió nunca"
    else: base=f"se venden unos {mes} por mes"
    tt=round(t)
    if q>0:
        m45=re.search(r'45 días porque (.*)$',b)
        x=f"Hola Tito! Te pido {q}{de}: {base} y entre Full, la oficina y lo que viene en camino hay {tt}. Con {q} más cubrimos "+(f"un mes y medio ({m45.group(1)})." if m45 else "un mes.")
    elif b.startswith('nunca'):
        x=f"Hola Tito! {quien} no lo compres: {base}."
    else:
        dias=(t/r) if r>0 else None
        x=f"Hola Tito! {quien} no hace falta: {base} y ya hay {tt}"+(f", alcanza para unos {dias:.0f} días." if dias and dias<999 else ".")
    return x+(' '+extra if extra else '')
def titoJ(mo): return "Hola Tito! "+mo
# EL JUICIO ES UN OBJETIVO, NO UNA COMPRA FIJA (20/10/2026, idea 1 del ayudante de ideas, chica y alta confianza): pedía la
# cantidad tal cual aunque la mercadería ya hubiera llegado (Cortapelos 2 en 1 y 1 en 1 con 10 y 15 en la oficina, Lupa 75mm
# con 10 en Full). Ahora pide lo que falta para TENER N (Full + oficina + camino); si ya está, avisa que se cumplió.
def juicioQ(nJ,tiene,mo,quien=''):
    q=max(0,nJ-int(round(tiene or 0)))
    if nJ>0 and q==0:
        avisos.append(f"✅ juicio cumplido{(' · '+quien) if quien else ''}: pedía tener {nJ} y ya hay {round(tiene)}. Sacarlo de juicios.txt o renovarlo")
        return 0,f"Hola Tito! No hace falta: ya hay {round(tiene)} entre Full, la oficina y lo que viene."
    return q,("Hola Tito! "+mo if q==nJ else f"Hola Tito! Te pido {q}: quiero tener {nJ} y ya hay {round(tiene)}. ({mo})")
for p,q,d,rent in res:
    pid=p['id']
    if isinstance(d,list):
        ex=f"Ya desconté {p['sinColor']} que están sin color." if p.get('sinColor') else ''
        filas=[]
        for v,qq,r,t,obj,b in d:
            if not (qq or v['v180'] or v['full'] or v['casa'] or juDe(pid,v['v'])): continue
            filas.append([v,qq,r,t,obj,b])
        for v in juiciosSinRenglon(p,[f[0]['v'] for f in filas]): filas.append([v,0,0,0,0,'nunca vendió'])
        # Juicio del producto ENTERO en un producto con colores: el total del juicio se reparte entre los colores según lo que
        # pedía cada uno (antes cambiaba el motivo y dejaba las unidades de la cuenta).
        if juDe(pid) and not any(juDe(pid,f[0]['v']) for f in filas):
            nJ,moJ=juDe(pid); pes=[f[1] or f[0]['v30'] or f[0]['v180'] for f in filas]
            nJ,moJ=juicioQ(nJ,sum(f[3] or 0 for f in filas),moJ,p['n'])
            moJ=moJ[len('Hola Tito! '):]
            if nJ>0 and sum(pes)==0: avisos.append(f"{p['n']}: juicio de {nJ} sin colores que vendan: poné el color (p…#color)")
            for f,qq in zip(filas,reparto(nJ,pes) if nJ>0 else [0]*len(filas)): f[1]=qq
            moJt=titoJ(moJ)
        else: moJt=None
        for v,qq,r,t,obj,b in filas:
            mot=moJt or tito(qq,r,t,obj,b,rent,p['neto'],v['v'],ex,p['motNoRenta'])
            jv=juDe(pid,v['v'])
            if jv: qq,mot=juicioQ(jv[0],t,jv[1],p['n']+' #'+v['v'])
            # SÓLO ESTOS COLORES (16/10/2026, idea 11 del análisis): llegaban colores lentos en vez de los que se agotan.
            # NO VIENE MÁS (17/10/2026, regla suya): un aroma que se pidió al Paulvic y no vino no se vuelve a pedir.
            # 24/10/2026 (él): Invictus y Phantom los dio de baja ML para siempre por la marca del nombre (no es que no vengan)
            if (p['id'],v['v']) in {('p1779912655490','Invictus'),('p1779912655490','Phantom')}: qq,mot=0,f"Hola Tito! {v['v']}: no te lo pido más. ML lo dio de baja para siempre por la marca del nombre. Lo que hay en la oficina va al local."
            elif v.get('nunca'): qq,mot=0,f"Hola Tito! {v['v']}: no te lo pido más. Lo pedimos y no vino, así que lo damos por que no viene más."
            if v.get('mano') is not None and not v.get('manoVenc'): avisos.append(f"{p['n']} #{v['v']}: ✋ él lo cambió a mano a {v['mano']} en Pedidos: en la web manda eso (no lo que decido) hasta el pedido hecho")
            N.append(f"ped:{pid}#{v['v']}=u|{qq}|{mot}")
        if not filas:
            # Producto con colores sin ningún color con datos: no se puede escribir sin color (decido lo rechaza). Si había
            # una decisión mía vieja, se borra (=auto) para que no quede pidiendo unidades de otro momento.
            if p['decidido']: N.append(f"ped:{pid}=auto"); avisos.append(f"{p['n']}: tenía decisión vieja y ningún color con datos: la borro (=auto)")
        if p['precio'] or p.get('med60'): N.append(f"ped:{pid}=venta|{venta(p)}|{venta_mot(p)}")
    else:
        r,t,obj,b=d
        # siempre se escribe (aunque sea 0): si no, una decisión vieja queda colgada (el Ultra Shift del 09/10).
        if p.get('colores'):
            # Un producto con colores sin ningún dato por color no se puede escribir sin color (decido lo rechaza).
            jc=juiciosSinRenglon(p,[])
            if jc:   # pero un juicio de color sí (etapa 3, 20/10/2026): va color por color
                for v in jc:
                    jv=juDe(pid,v['v']); qq,mot=juicioQ(jv[0],0,jv[1],p['n']+' #'+v['v']); N.append(f"ped:{pid}#{v['v']}=u|{qq}|{mot}")
                if p['precio'] or p.get('med60'): N.append(f"ped:{pid}=venta|{venta(p)}|{venta_mot(p)}")
                continue
            if p['decidido']: N.append(f"ped:{pid}=auto"); avisos.append(f"{p['n']}: tiene colores sin datos por color y una decisión vieja: la borro (=auto)")
            elif q>0: avisos.append(f"{p['n']}: la cuenta pide {q} pero no sé de qué colores: decidilo a mano")
            continue
        ex=''
        if p.get('rem'): ex+=f"No cuento {p['rem']} que se remataron porque estaban parados. "
        if p.get('barata'): ex+=f"Cuento {p['barata']} que se vendieron baratas porque salían al toque. "
        mot=tito(q,r,t,obj,b,rent,p['neto'],None,ex.strip(),p['motNoRenta'])
        if juDe(pid): q,mot=juicioQ(juDe(pid)[0],t,juDe(pid)[1],p['n'])
        N.append(f"ped:{pid}=u|{q}|{mot}")
        if p['precio'] or p.get('med60'): N.append(f"ped:{pid}=venta|{venta(p)}|{venta_mot(p)}")
bad=[n for n in N if ';' in n]
if bad: print('⚠️ renglones con ";" (decido los cortaría):',*bad[:5],sep='\n  '); sys.exit(1)
open('pedidos.txt','w').write('\n'.join(N)+'\n')
sinCosto=[p['n'] for p in prods if p['motNoRenta']=='falta el costo' and (p['v30'] or p['v60'])]
# "de N para decidir": las fichas que están afuera (papelera / no traer) no se cuentan (etapa 5, 20/10/2026).
print(len(N),'renglones ·',len(prods),'productos'+(f' de {nDecidir} para decidir ({nfichas} fichas, {nFuera} fuera: papelera / no traer)' if nDecidir is not None else ''))
if sinCosto: print('⚠️ venden y no tienen costo (no se piden):',*sinCosto,sep='\n  ')
if avisos: print('⚠️ para mirar:',*avisos,sep='\n  ')
