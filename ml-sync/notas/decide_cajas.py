# Decide Armar caja para TODO lo que hay en la oficina (09/10/2026, regla suya: "todo completo, nunca a mitad").
# Uso: python3 decide_cajas.py <log de pedidostodo>  → escribe cajas.txt
# La cuenta de cada producto sale de las cuentas que PUEDEN recibirlo (el "ctas [..]" del log: publican, sin `nomandar`,
# más las marcadas `pasara`; la misma regla que Armar caja y `cajasnotas`, revisión 9 del 13/10/2026). Si puede ir a más
# de una, no adivino: va a la lista "decidir a mano". Por color: cubrir 37 días (30 + 7 de viaje, 60 si vende parejo) con el ritmo de
# 30 d por día CON stock (o 60 d si vendió poco, o 180 d si está agotado) menos Full y camino; si está en cero y vende,
# mínimo 4; nunca más de lo que hay en la oficina. Nuevo (nunca vendió, nada en Full): 4. Nada pasa los 90 días
# de venta (tope para lo lento: Full cobra a los 120). 15/10/2026. Paulvic: todo a Adriana menos Persea (Luciana). Remates no cuentan.
# Y si la cuenta tiene cupo de Full cargado y la caja no entra, se recorta con la regla de la web (6.P1, 21/10/2026): lo que queda
# afuera dice "✂️ … (faltan N)" en el motivo y `decido` lo anota como `cupoCorto` (6.P2: esa oficina no es reposición ni sobra).
import re,sys,math
T=37  # 30 días de venta + 7 de viaje (regla suya del 14/10/2026)
T_LARGO=60  # se estira a 60 días sólo en lo que vende parejo y no tiene prueba de precio abierta (eligió la a, 14/10/2026)
import os
_SE=os.path.join(os.path.dirname(os.path.abspath(__file__)),'sin_estirar.txt')
SIN_ESTIRAR=[l.strip().lower() for l in open(_SE)] if os.path.exists(_SE) else None
SIN_ESTIRAR=[x for x in SIN_ESTIRAR if x and not x.startswith('#')] if SIN_ESTIRAR is not None else None
def hoy_de(t):
    h=re.search(r' · HOY (\d+)/(\d+)',t or '')
    return (int(h.group(1)),int(h.group(2))) if h else None
def parejo(v30,v60,dcs):
    # "vendió todas las semanas de los últimos 2 meses": el log no trae semanas, así que se pide lo que lo aproxima:
    # 4+ en 30 días (una por semana), 8+ en 60, stock casi todo el mes y los dos meses parecidos (ni subiendo ni cayendo).
    return v30>=4 and v60>=8 and dcs>=28 and 0.4<=v30/v60<=0.6
def dias_de(nombre,v30,v60,dcs):
    if SIN_ESTIRAR is None: return T,'sin la lista de pruebas abiertas no estiro'
    n=nombre.lower()
    if any(x in n for x in SIN_ESTIRAR): return T,'tiene una prueba de precio abierta'
    if parejo(v30,v60,dcs): return T_LARGO,'vende parejo hace 2 meses'
    return T,''
AB={'Ad':'Adriana','Lu':'Luciana','Ay':'Ayelen','Ma':'Matias'}
def r_de(v30,v60,v180,tiene,dcs=30,hoy=None):
    # 🏷️ AL PRECIO DE HOY (27/10/2026 a la noche, la estrategia nueva: buscar techo, bajar hasta la primera venta y quedarse; "100 productos
    # con pocas unidades que venden poco y ganan muchísimo"): con 7+ días con stock desde el último cambio de precio (`HOY u/d` de
    # pedidostodo), se manda con lo que se vende A ESE PRECIO. Si no, después de una suba se mandaban 37 días al ritmo del precio barato.
    if hoy and hoy[1]>=7: return hoy[0]/hoy[1],f"al precio de hoy vende {hoy[0]} en {hoy[1]} días con stock (desde el último cambio de precio)"
    d=max(7,min(30,dcs))
    if v30>=3: return max(v30/d,v60/60*0.8),(f"vende {v30} en {d} d con stock" if d<30 else f"vende {v30} en 30 d")
    if v60>=3: return v60/60,f"vendió {v60} en 60 d"
    if v180>=4 and tiene==0: return v180/180,f"agotado, vendía {v180} en 180 d"
    # C8 (29/09/2026, la misma regla que Armar caja de la web): con 1 o 2 ventas no se saca un ritmo. Sólo el piso si la
    # cuenta está en cero (lo pone `calc`). Antes 2 ventas en 7 días con stock pedían 8 u. (etapa 3, 20/10/2026).
    if v30>0 or v60>0: return 0,f"pocas ventas ({v30} en {d} d con stock, {v60} en 60 d): sin ritmo, sólo el mínimo si está en cero"
    return 0,"no vende"
PISO_CERO=4     # cuenta en cero que vende: mínimo para no quedar sin vender
TOPE_LENTO=90   # lo que se manda nunca pasa los 90 días de venta (Full cobra a los 120 en lo chico). Eligió la a, 15/10/2026
def calc(v30,v60,v180,full,cam,casa,dcs=30,dias=T,hoy=None):
    t=full+cam; r,b=r_de(v30,v60,v180,t,dcs,hoy)
    # NUEVO (nunca vendió en 180 d y no hay nada en Full ni en camino): no se sabe cuánto vende, va el mínimo
    # para que pueda arrancar. Antes daba "no vende" y no salía nada (15/10/2026, eligió la a).
    if v30==v60==v180==0 and t==0: return max(0,min(PISO_CERO,casa)),0,'nuevo: nunca vendió, va el mínimo para arrancar'
    q=math.ceil(r*dias-t-0.25) if r*dias>t else 0
    if t==0 and (r>0 or v30>0 or v60>0): q=max(q,PISO_CERO)
    if r>0:
        tope=math.floor(r*TOPE_LENTO-t)
        if q>0 and q>max(tope,0):
            q=max(tope,1 if t==0 else 0); b+=f' · tope {TOPE_LENTO} días (vende lento)'
    return max(0,min(q,casa)),r,b
L=[re.sub(r'^\d{4}-\d\d-\d\dT[\d:.]+Z ?','',l) for l in open(sys.argv[1]).read().split('\n')]
if any('NO LEÍ' in l for l in L):
    print('⚠️ el log dice NO LEÍ: no armo cajas a medias:',*[l for l in L if 'NO LEÍ' in l],sep='\n  '); sys.exit(1)
# El dólar, como decide_pedidos (etapa 5, 20/10/2026): sin esa línea el log está cortado al principio.
tc=next((float(m.group(1)) for l in L for m in [re.match(r'^dólar ([\d.]+) ·',l)] if m),0)
if not tc>0: print('⚠️ el log no trae el dólar (o está en 0): está cortado al principio o no es de pedidostodo. No armo nada.'); sys.exit(1)
P=[];cur=None;esper=0;grupos=set();noEnt=[];cuentaOk=False
# 6.P1 (etapa 6, eligió la a, 21/10/2026): el cupo de Full que le queda a cada cuenta (lo imprime pedidostodo: "CUPO <cuenta> peq N
# gra M"). Con cupo, la caja de esa cuenta se recorta con la MISMA regla que la web ("Cargar lo que entra en el cupo",
# `cajaLlenarCupoPlan`): 1 u. a cada producto, de lo que más deja por unidad a lo que menos, y después se llena por plata.
# Sin la línea (o con "?") esa cuenta NO se recorta: no se inventa un cupo.
CUPO={}
for l in L:
    m=re.match(r'^CUPO (\w+) peq (\d+|\?) gra (\d+|\?)',l)
    if m: CUPO[m.group(1)]={'peq':None if m.group(2)=='?' else int(m.group(2)),'gra':None if m.group(3)=='?' else int(m.group(3))}
for l in L:
    m=re.match(r'════ (BSAS|PY|PAULVIC) · (\d+) ════',l)
    if m: esper+=int(m.group(2)); grupos.add(m.group(1)); cur=None; continue
    if l.startswith('════'): cur=None; continue
    if re.match(r'^CUENTA: .*✓\s*$',l): cuentaOk=True; continue
    m=re.match(r'^(p\w+) · (.*?) · v30 (\d+) v60 (\d+) v180 (\d+) · .*?dCS (\d+)(?: · cortes \d+)? · Full (\d+) \[([^\]]*)\] · casa (\d+) · camino (\d+)(.*)$',l)
    if m:
        ct=re.search(r' · ctas \[([^\]]*)\]',m.group(11))
        nc=re.search(r' · neto \$(\d+) costo \$(\d+)',m.group(11))
        gan=(int(nc.group(1))-int(nc.group(2))) if nc and int(nc.group(1))>0 else None   # lo que deja por unidad (sin neto medido: no se sabe)
        cur=dict(id=m.group(1),n=m.group(2),v=list(map(int,m.group(3,4,5))),dcs=int(m.group(6)),full=int(m.group(7)),br=m.group(8),casa=int(m.group(9)),cam=int(m.group(10)),
                 ctas=[AB[x] for x in ct.group(1).split() if x in AB] if ct else None,vars=[],gan=gan,grande=' · GRANDE' in m.group(11),hoy=hoy_de(m.group(11)));P.append(cur);continue
    # Un renglón de producto que NO se entiende (un dato nuevo en el medio): sus colores NO pueden ir al producto de arriba.
    if re.match(r'^p\w+ · ',l): cur=None; noEnt.append(l[:110]); continue
    m=re.match(r'^   # (.*?) · v30 (\d+) v60 (\d+) v180 (\d+) · últ \S+(?: · dCS (\d+))?(?: · cortes \d+)? · Full (\d+) · casa (\d+) · camino (\d+)',l)
    if m and cur: cur['vars'].append(dict(v=m.group(1),s=list(map(int,m.group(2,3,4))),dcs=int(m.group(5)) if m.group(5) else cur['dcs'],full=int(m.group(6)),casa=int(m.group(7)),cam=int(m.group(8)),hoy=hoy_de(l)))
print(f"leí {len(P)} de {esper} productos"+(' ✓' if len(P)==esper else ' ⚠️ NO CIERRA: hay renglones que no entendí'))
# NO SE ESCRIBE NADA A MEDIAS (etapa 5, 20/10/2026): renglones que no entendí, grupos que no cierran, falta un grupo o la
# línea final "CUENTA: … ✓" (el log se cortó o el comando se cayó) → no se arma cajas.txt.
malo=[]
if noEnt: malo.append(f"{len(noEnt)} renglón(es) de producto que no entendí (¿formato nuevo?):\n    "+'\n    '.join(noEnt[:5]))
if len(P)!=esper: malo.append(f"leí {len(P)} productos y los grupos dicen {esper}")
falt=[g for g in ('BSAS','PY','PAULVIC') if g not in grupos]
if falt: malo.append('falta el grupo '+', '.join(falt)+' (el log está cortado)')
if not cuentaOk: malo.append('falta la línea final "CUENTA: … ✓" (el log está cortado o pedidostodo no cerró)')
if malo: print('⚠️ NO ARMO CAJAS: '+' · '.join(malo)); sys.exit(1)
if any(p['ctas'] is None for p in P): print('⚠️ el log es viejo (no trae "ctas [..]"): corré pedidostodo de nuevo'); sys.exit(1)
BAJA_ML={('p1779912655490','Invictus'),('p1779912655490','Phantom')}   # Paulvic dados de baja en ML (24/10/2026)
# DECISIONES SUYAS FIJAS (25/10/2026): la completa de las 03:00 recalculaba todo y le pisó dos decisiones del día (Persea volvió a 0 y
# el Watch 5 Lite volvió a 2). Lo que él decidió para un producto (y color) en una cuenta va acá y NINGUNA vuelta lo cambia:
# (id, color o '', cuenta) → (unidades, motivo). Las unidades nunca pasan lo que hay en la oficina. Se saca de acá cuando él lo cambia.
FIJO={
  ('p1779912655490','Persea','Luciana'):(3,'Él 25/10: el Persea queda en Luciana y es el único perfume que vende ahí. Van las 3 de la oficina (etiquetadas JVUG50085)'),
  ('p17833581096733','','Matias'):(0,'Él eligió la 1a del 25/10: no va a Full porque deja ~10% (su única venta fue a $113.250). Se vende por otro lado'),
  ('p1779912656220','blanco','Ayelen'):(0,'En Ayelen no hay publicación de P47 blanco (sólo P47m Rosa), 25/10. Sin publicación de ese color no va'),
  ('p1792787629845','','Ayelen'):(0,'25/10 él: los 2 Sony EX15LP Blanco no estaban en la oficina. No va nada hasta que aparezcan'),
  ('p1792881565786','','Luciana'):(0,'Él 25/10: Alfaparf al local, no da 35% en ML (el catálogo que vende tiene Full a $7.990 y el kit cuesta $7.895)'),
  ('p1792881567867','','Luciana'):(0,'Él 25/10: Alfaparf al local, no da 35% en ML (el catálogo que vende tiene Full a $7.990 y el kit cuesta $7.895)'),
  ('p178287291398902','','Matias'):(0,'Las 2 de la oficina son blancas/celestes (él 25/10, con foto) y la publicación es la NEGRA. Van al local: en ML no llega al 35%'),
  ('p1792881587218','','Luciana'):(0,'Él 25/10: Alfaparf al local, no da 35% en ML (el catálogo que vende tiene Full a $7.990 y el kit cuesta $7.895)'),
}
out=[];res=[];sin=[];amano=[];nOfi=0;largos=[]
def txt_dias(D,por):
    return f"para {D} dias ({por}: el cupo de esa cuenta lo controla el botón del cupo)" if D==T_LARGO else "para 37 dias (30 + 7 de viaje)"
for p in P:
    if p['casa']<=0 and not any(x['casa']>0 for x in p['vars']): continue
    nOfi+=1
    pv='paulvic' in p['n'].lower()
    ctas=p['ctas']
    if pv: cta='Adriana'
    elif len(ctas)==1: cta=ctas[0]
    elif not ctas: sin.append(f"{p['n']} ({p['casa']} en la oficina): ninguna cuenta lo puede recibir (no publica o está en nomandar)"); continue
    else: amano.append(f"{p['n']} ({p['casa']} en la oficina): puede ir a {', '.join(ctas)} — decidir a mano"); continue
    if p['vars'] and any(x['casa']>0 for x in p['vars']):
        for x in p['vars']:
            if x['casa']<=0: continue
            c='Luciana' if (pv and x['v']=='Persea') else cta
            if pv and c not in ctas: sin.append(f"{p['n']} · {x['v']}: va a {c} pero {c} no lo puede recibir (no publica o nomandar)"); continue
            # 24/10/2026 (él): ML dio de baja para siempre estos aromas por la marca del nombre: no se mandan más a Full (lo de la oficina va al local).
            if (p['id'],x['v']) in BAJA_ML:
                out.append(dict(cab=f"caja:{p['id']}@{c}#{x['v']}",q=0,cola="ML lo dio de baja para siempre por la marca del nombre (24/10): no se manda más a Full. Lo de la oficina va al local.",
                                cta=c,nom=f"{p['n'][:38]} · {x['v']}",gan=0,grande=p['grande'],enCero=False,dias=None)); continue
            if (p['id'],x['v'],c) in FIJO:
                fq,fm=FIJO[(p['id'],x['v'],c)]
                out.append(dict(cab=f"caja:{p['id']}@{c}#{x['v']}",q=min(fq,x['casa']),cola=fm,cta=c,nom=f"{p['n'][:38]} · {x['v']}",gan=p['gan'],grande=p['grande'],enCero=False,dias=None)); continue
            D,por=dias_de(p['n'],x['s'][0],x['s'][1],x['dcs'])
            q,r,b=calc(*x['s'],x['full'],x['cam'],x['casa'],x['dcs'],D,x.get('hoy'))
            out.append(dict(cab=f"caja:{p['id']}@{c}#{x['v']}",q=q,cola=f"{b} · hay {x['full']} en Full y {x['cam']} en camino · {txt_dias(D,por)} hacen falta {r*D:.0f} · en la oficina {x['casa']}",
                            cta=c,nom=f"{p['n'][:38]} · {x['v']}",gan=p['gan'],grande=p['grande'],enCero=(x['full']+x['cam'])==0,r=r,dias=((x['full']+x['cam'])/r if r>0 else None)))
            if D==T_LARGO: largos.append(f"{p['n'][:38]} · {x['v']}")
    elif (p['id'],'',cta) in FIJO:
        fq,fm=FIJO[(p['id'],'',cta)]
        out.append(dict(cab=f"caja:{p['id']}@{cta}",q=min(fq,p['casa']),cola=fm,cta=cta,nom=p['n'][:38],gan=p['gan'],grande=p['grande'],enCero=False,dias=None))
    else:
        D,por=dias_de(p['n'],p['v'][0],p['v'][1],p['dcs'])
        q,r,b=calc(*p['v'],p['full'],p['cam'],p['casa'],p['dcs'],D,p.get('hoy'))
        out.append(dict(cab=f"caja:{p['id']}@{cta}",q=q,cola=f"{b} · hay {p['full']} en Full y {p['cam']} en camino · {txt_dias(D,por)} hacen falta {r*D:.0f} · en la oficina {p['casa']}",
                        cta=cta,nom=p['n'][:38],gan=p['gan'],grande=p['grande'],enCero=(p['full']+p['cam'])==0,r=r,dias=((p['full']+p['cam'])/r if r>0 else None)))
        if D==T_LARGO: largos.append(p['n'][:38])
CAJA_CORTE_DIAS=14   # la próxima caja llega en ~2 semanas (= CAJA_CORTE_DIAS de index.html)
CAJA_VIAJE_DIAS=7    # lo que tarda en entrar la caja que se arma (= CAJA_VIAJE_DIAS de index.html)
def llenar_cupo(cands,tope_peq,tope_gra):
    # La regla de la web (`cajaLlenarCupoPlan`, index.html), traída tal cual: orden por lo que deja cada unidad (sin dato al final,
    # pero no afuera), después el que está en cero y después el que menos días tiene. RONDA 1: una unidad a lo que está en 0 o se corta en 14 días. RONDA 2:
    # llenar con lo que más deja. Devuelve cuántas recibe cada uno (por índice).
    lib={'peq':float('inf') if tope_peq is None else max(0,tope_peq),'gra':float('inf') if tope_gra is None else max(0,tope_gra)}
    dado={}
    orden=sorted(range(len(cands)),key=lambda i:(-(cands[i]['gan'] if cands[i]['gan'] is not None else -1),-(1 if cands[i]['enCero'] else 0),(cands[i]['dias'] if cands[i]['dias'] is not None else 9999)))
    def sumar(i,n):
        c=cands[i];b='gra' if c['grande'] else 'peq';d=min(n,lib[b],c['q']-dado.get(i,0))
        if d>0: dado[i]=dado.get(i,0)+d;lib[b]-=d
    # 26/10/2026 (él: "siempre priorizamos ganar más, no cubrir stock"): la unidad de la ronda 1 va SÓLO a lo que está en 0 o
    # se corta antes de la próxima caja (CAJA_CORTE_DIAS, igual que la web). Dar 1 a cada uno se comía el cupo chico con lo que
    # tiene stock para 25-45 días (caja de Ayelen: $138.406 contra $360.793). Sin ganancia medida (nunca vendió y sin
    # publicación con precio) no entra en la ronda 1: va al final, como antes.
    # 27/10/2026 (él: "maximizar la máxima ganancia de $ posible siempre"): a lo que se corta antes de la próxima caja, LO QUE VENDE hasta
    # que llegue (desde que entra ésta, CAJA_VIAJE_DIAS), mínimo 1; no 1 sola. Igual que la web.
    for i in orden:
        c=cands[i]
        if c['q']>0 and c['gan'] is not None and (c['enCero'] or (c['dias'] is not None and c['dias']<CAJA_CORTE_DIAS)):
            dd=max(c['dias'] or 0,CAJA_VIAJE_DIAS); sumar(i,max(1,math.ceil((c.get('r') or 0)*(CAJA_CORTE_DIAS-dd)-1e-9)))
    for i in orden:
        if cands[i]['q']>0: sumar(i,cands[i]['q']-dado.get(i,0))
    return {i:int(dado.get(i,0)) for i in range(len(cands))}
recortes=[]
for cta in sorted({o['cta'] for o in out}):
    cu=CUPO.get(cta)
    if not cu or (cu['peq'] is None and cu['gra'] is None): continue
    idx=[i for i,o in enumerate(out) if o['cta']==cta and o['q']>0]
    if not idx: continue
    pide={'peq':sum(out[i]['q'] for i in idx if not out[i]['grande']),'gra':sum(out[i]['q'] for i in idx if out[i]['grande'])}
    if (cu['peq'] is None or pide['peq']<=cu['peq']) and (cu['gra'] is None or pide['gra']<=cu['gra']): continue   # entra todo: no se toca
    dado=llenar_cupo([out[i] for i in idx],cu['peq'],cu['gra'])
    for j,i in enumerate(idx):
        o=out[i];d=dado[j]
        if d<o['q']:
            b='grandes' if o['grande'] else 'chicos y medianos'
            o['cola']=f"✂️ por el cupo de Full de {cta} ({cu['gra'] if o['grande'] else cu['peq']} {b}) entran {d} de {o['q']} (faltan {o['q']-d}) · "+o['cola']
            recortes.append(f"{o['nom']} → {cta}: {o['q']} → {d}")
            o['q']=d
for o in out:
    if o['q']: res.append(f"{o['nom']} → {o['cta']}: {o['q']}")
out=[f"{o['cab']}=u|{o['q']}|{o['cola']}" for o in out]
bad=[x for x in out if ';' in x]
if bad: print('⚠️ renglones con ";" (decido los cortaría):',*bad[:5],sep='\n  '); sys.exit(1)
open('cajas.txt','w').write('\n'.join(out)+'\n')
print(len(out),'renglones de caja ·',nOfi,'productos con mercadería en la oficina');print('\n'.join(res))
print(f"estirados a {T_LARGO} días (venden parejo, sin prueba abierta): {len(largos)}",*largos,sep='\n  ')
if SIN_ESTIRAR is None: print('⚠️ no encontré sin_estirar.txt: todo quedó en 37 días')
if CUPO: print('cupo de Full leído: '+' · '.join(f"{c} {v['peq'] if v['peq'] is not None else '?'}/{v['gra'] if v['gra'] is not None else '?'}" for c,v in CUPO.items()))
else: print('⚠️ el log no trae el CUPO de Full (pedidostodo viejo): no recorté ninguna caja por el cupo')
if recortes: print(f"✂️ RECORTADO POR EL CUPO (la regla de la web: 1 u. a cada uno y después por plata) · {len(recortes)}:",*recortes,sep='\n  ')
if sin: print('SIN CUENTA:',*sin,sep='\n  ')
if amano: print('DECIDIR A MANO (más de una cuenta):',*amano,sep='\n  ')
