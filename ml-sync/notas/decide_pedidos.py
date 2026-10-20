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
prods=[];grupo='';cur=None;esper={};nfichas=None
for l in L:
    m=re.match(r'^dólar \S+ · ventana .* · (\d+) fichas',l)
    if m: nfichas=int(m.group(1))
    m=re.match(r'════ (\w+) · (\d+) ════',l)
    if m: grupo=m.group(1); esper[grupo]=int(m.group(2)); continue
    m=re.match(r'^(p\w+) · (.*?) · v30 (\d+) v60 (\d+) v180 (\d+) · últ (\S+)(?: · REMATE (\d+))?(?: · BARATA (\d+))? · dCS (\d+)(?: · cortes (\d+))? · Full (\d+) \[[^\]]*\] · casa (\d+) · camino (\d+)(.*)$',l)
    if m and grupo in('BSAS','PY','PAULVIC'):
        rest=m.group(14)
        g=lambda r: int(re.search(r,rest).group(1)) if re.search(r,rest) else 0
        cm=re.search(r'precio \$\d+ \((.*?)\)',rest)
        cur=dict(id=m.group(1),n=m.group(2),g=grupo,v30=int(m.group(3)),v60=int(m.group(4)),v180=int(m.group(5)),ult=m.group(6),rem=int(m.group(7) or 0),barata=int(m.group(8) or 0),dcs=int(m.group(9)),cortes=int(m.group(10) or 0),full=int(m.group(11)),casa=int(m.group(12)),cam=int(m.group(13)),
          py=g(r'PYviaja (\d+)'),pv=g(r'PVviaja (\d+)'),colores=g(r'colores (\d+)'),neto=g(r'neto \$(\d+)'),costo=g(r'costo \$(\d+)'),precio=g(r'precio \$(\d+)'),med60=g(r'med60 \$(\d+)'),
          cambios=(cm.group(1) if cm else ''),decidido=(' YA DECIDÍ ' in rest),vars=[])
        prods.append(cur); continue
    m=re.match(r'^   # (.*?) · v30 (\d+) v60 (\d+) v180 (\d+) · últ (\S+)(?: · dCS (\d+))?(?: · cortes (\d+))? · Full (\d+) · casa (\d+) · camino (\d+)(.*)$',l)
    if m and cur:
        pv=re.search(r'PVviaja (\d+)',m.group(11))
        cur['vars'].append(dict(v=m.group(1),v30=int(m.group(2)),v60=int(m.group(3)),v180=int(m.group(4)),ult=m.group(5),dcs=int(m.group(6)) if m.group(6) else cur['dcs'],cortes=int(m.group(7) or 0),full=int(m.group(8)),casa=int(m.group(9)),cam=int(m.group(10)),pv=int(pv.group(1)) if pv else 0,nunca=(' · NUNCA' in m.group(11))))
# N DE M: que se hayan leído TODAS las fichas que imprimió pedidostodo (si no, un renglón con otro formato se pierde callado).
for gr,n in esper.items():
    if gr in('BSAS','PY','PAULVIC'):
        k=sum(1 for p in prods if p['g']==gr)
        print(f"{gr}: leí {k} de {n}"+(' ✓' if k==n else ' ⚠️ NO CIERRA: hay renglones que no entendí'))
if not esper: print('⚠️ no encontré ningún grupo (════ BSAS ════…): ¿es el log de pedidostodo?'); sys.exit(1)
def ritmo(x,dcs=30):
    tiene=x['full']+x['casa']+x['cam']+x.get('py',0)+x.get('pv',0)
    d=max(7,min(30,dcs)); R=lambda n: f"{round(n):d}"   # con ventas sin color repartidas las cuentas pueden tener decimales   # días con stock en 30 (con piso de 7: con 1-2 días una venta suelta pediría una caja entera)
    r30=x['v30']/d; r60=x['v60']/60; r180=x['v180']/180
    if x['v30']>=3: r=max(r30,r60*0.8); base=f"vendió {R(x['v30'])} en {d} d con stock" if d<30 else f"vendió {R(x['v30'])} en 30 d"
    elif x['v60']>=3: r=r60; base=f"vendió {R(x['v60'])} en 60 d"
    elif x['v180']>=4 and x['full']==0: r=r180; base=f"agotado · vendía {R(x['v180'])} en 180 d"
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
    m=((p['neto']-0.08*pr-p['costo'])/p['costo']) if p['costo']>0 and p['neto']>0 else -1
    if m<0.25: return T,''
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
    rentable = p['costo']>0 and p['neto']>0 and p['neto']>=p['costo']*1.1
    p['motNoRenta']='' if rentable else ('falta el costo' if not p['costo']>0 else ('todavía no sé cuánto deja en ML' if not p['neto'] else 'no deja ganancia'))
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
            r,t,b=ritmo(dict(v,cambios=p['cambios']),v['dcs']); Tv,por=Tde(p,v,r); need=max(0.0,r*Tv-t)
            if por: b+=f' · {Tv} días porque {por}'
            dets.append([v,need,r,t,r*Tv,b])
        # Lo que el producto tiene SIN COLOR (viajando de Paraguay, Full de publicaciones sin color, oficina o cajas sin color)
        # también cubre: se descuenta de los colores que más piden (revisión 9, 09/10/2026).
        sc=p.get('py',0)+max(0,p['full']-sum(v['full'] for v in p['vars']))+max(0,p['casa']-sum(v['casa'] for v in p['vars']))+max(0,p['cam']-sum(v['cam'] for v in p['vars']))
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
                if qq or v['v180']: f.write(f"    #{v['v']}: {qq}  (r {r*30:.1f}/mes · tiene {t} · obj {obj:.1f} · {b})\n")
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
_ids={p['id'] for p in prods}; _vars={p['id']+'#'+v['v'] for p in prods for v in p['vars']}
for k in JU:
    if k not in _ids and k not in _vars: print(f"⚠️ el juicio {k} no coincide con ningún producto/color del log: no se usa")
# ---- notas para decido ----
def venta(p):
    # El precio NORMAL para el máximo de compra: el menor entre el de hoy y la mediana de lo cobrado en 60 días (sin remates).
    # Un precio subido por escasez no infla el máximo (revisión 9, 13/10/2026). Sin ventas en 60 d, el de hoy menos las subas recientes.
    pr=p['precio']; best=pr
    if p.get('med60'): best=min(pr,p['med60']) if pr else p['med60']
    for m in re.finditer(r'⬆️\$(\d+)→\$(\d+) (\d+)d',p['cambios']):
        de,a,d=int(m.group(1)),int(m.group(2)),int(m.group(3))
        if not p.get('med60') and d<=3 and pr>de*1.15: best=min(best,de)
    return best
N=[];avisos=[]
# EL MOTIVO LO LEE TITO (09/10/2026, Matías: "los pedidos los ve mi viejo y entra en el cerebrito (...) referite como
# 'hola tito!' y explicale por qué le pediste ese producto y esas unidades. hablale con confianza y resumido").
def tito(q,r,t,obj,b,rent,neto,color=None,extra='',motNo=''):
    de=f" del {color}" if color else ''
    quien=f"El {color}" if color else "Este"
    if not rent:
        return "Hola Tito! "+quien+" no lo compres: "+({'falta el costo':'todavía no tengo cargado cuánto cuesta.','todavía no sé cuánto deja en ML':'todavía no sé cuánto deja en ML.'}.get(motNo,'con lo que cuesta no nos deja ganancia.'))
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
            if not (qq or v['v180'] or v['full'] or v['casa']): continue
            filas.append([v,qq,r,t,obj,b])
        # Juicio del producto ENTERO en un producto con colores: el total del juicio se reparte entre los colores según lo que
        # pedía cada uno (antes cambiaba el motivo y dejaba las unidades de la cuenta).
        if pid in JU and not any(f"{pid}#{f[0]['v']}" in JU for f in filas):
            nJ,moJ=JU[pid]; pes=[f[1] or f[0]['v30'] or f[0]['v180'] for f in filas]
            nJ,moJ=juicioQ(nJ,sum(f[3] or 0 for f in filas),moJ,p['n'])
            moJ=moJ[len('Hola Tito! '):]
            if nJ>0 and sum(pes)==0: avisos.append(f"{p['n']}: juicio de {nJ} sin colores que vendan: poné el color (p…#color)")
            for f,qq in zip(filas,reparto(nJ,pes) if nJ>0 else [0]*len(filas)): f[1]=qq
            moJt=titoJ(moJ)
        else: moJt=None
        for v,qq,r,t,obj,b in filas:
            mot=moJt or tito(qq,r,t,obj,b,rent,p['neto'],v['v'],ex,p['motNoRenta'])
            kj=f"{pid}#{v['v']}"
            if kj in JU: qq,mot=juicioQ(JU[kj][0],t,JU[kj][1],p['n']+' #'+v['v'])
            # SÓLO ESTOS COLORES (16/10/2026, idea 11 del análisis): llegaban colores lentos en vez de los que se agotan.
            # NO VIENE MÁS (17/10/2026, regla suya): un aroma que se pidió al Paulvic y no vino no se vuelve a pedir.
            if v.get('nunca'): qq,mot=0,f"Hola Tito! {v['v']}: no te lo pido más. Lo pedimos y no vino, así que lo damos por que no viene más."
            N.append(f"ped:{pid}#{v['v']}=u|{qq}|{mot}")
        if not filas:
            # Producto con colores sin ningún color con datos: no se puede escribir sin color (decido lo rechaza). Si había
            # una decisión mía vieja, se borra (=auto) para que no quede pidiendo unidades de otro momento.
            if p['decidido']: N.append(f"ped:{pid}=auto"); avisos.append(f"{p['n']}: tenía decisión vieja y ningún color con datos: la borro (=auto)")
        if p['precio'] or p.get('med60'): N.append(f"ped:{pid}=venta|{venta(p)}|precio normal de venta para el maximo de compra")
    else:
        r,t,obj,b=d
        # siempre se escribe (aunque sea 0): si no, una decisión vieja queda colgada (el Ultra Shift del 09/10).
        if p.get('colores'):
            # Un producto con colores sin ningún dato por color no se puede escribir sin color (decido lo rechaza).
            if p['decidido']: N.append(f"ped:{pid}=auto"); avisos.append(f"{p['n']}: tiene colores sin datos por color y una decisión vieja: la borro (=auto)")
            elif q>0: avisos.append(f"{p['n']}: la cuenta pide {q} pero no sé de qué colores: decidilo a mano")
            continue
        ex=''
        if p.get('rem'): ex+=f"No cuento {p['rem']} que se remataron porque estaban parados. "
        if p.get('barata'): ex+=f"Cuento {p['barata']} que se vendieron baratas porque salían al toque. "
        mot=tito(q,r,t,obj,b,rent,p['neto'],None,ex.strip(),p['motNoRenta'])
        if pid in JU: q,mot=juicioQ(JU[pid][0],t,JU[pid][1],p['n'])
        N.append(f"ped:{pid}=u|{q}|{mot}")
        if p['precio'] or p.get('med60'): N.append(f"ped:{pid}=venta|{venta(p)}|precio normal de venta para el maximo de compra")
bad=[n for n in N if ';' in n]
if bad: print('⚠️ renglones con ";" (decido los cortaría):',*bad[:5],sep='\n  '); sys.exit(1)
open('pedidos.txt','w').write('\n'.join(N)+'\n')
sinCosto=[p['n'] for p in prods if p['motNoRenta']=='falta el costo' and (p['v30'] or p['v60'])]
print(len(N),'renglones ·',len(prods),'productos'+(f' de {nfichas} fichas' if nfichas else ''))
if sinCosto: print('⚠️ venden y no tienen costo (no se piden):',*sinCosto,sep='\n  ')
if avisos: print('⚠️ para mirar:',*avisos,sep='\n  ')
