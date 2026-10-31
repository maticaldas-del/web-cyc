# Decide Armar caja para TODO lo que hay en la oficina (09/10/2026, regla suya: "todo completo, nunca a mitad").
# Uso: python3 decide_cajas.py <log de pedidostodo>  → escribe cajas.txt AL LADO DE ESTE SCRIPT (ml-sync/notas, el que lee `cajaarmar`;
# revisión etapa 3, 29/10/2026: antes lo escribía y leía en la carpeta desde donde se corría, y corrido desde la raíz no veía lo anterior)
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
    # 31/10/2026 (él con las Cartas Casino: "está tomando la ganancia de las últimas ventas y el ritmo de cuando no se había aumentado"):
    # si el precio de hoy es 1,5 veces o más el mediano de 60 días y todavía no hay 7 días con stock a ese precio, el ritmo de 30 días es
    # de un precio que ya no existe. Se marca `suba` y `r_de` usa sólo lo vendido al precio de hoy (sin eso, nada salvo el mínimo en cero).
    # Cuenta los días seguidos (del más nuevo para atrás) en que el precio estuvo a 2/3 o más del de hoy: si son menos de 7 y antes hubo uno
    # más barato, es `suba`. (Con el mediano de 60 días caía el Cubreasiento, que ya vendía hace 46 días a precios parecidos.)
    pr=re.search(r' · precio \$(\d+) \(([^)]*)\)',t or ''); suba=False
    if pr:
        hoyP=int(pr.group(1)); dias=0; corta=False
        for b_,n_ in re.findall(r'\$\d+→\$(\d+) (\d+)d',pr.group(2)):
            if int(b_)*1.5<hoyP: corta=True; break
            dias+=int(n_)
        suba=corta and dias<7
    if h: return (int(h.group(1)),int(h.group(2)),suba)
    return (0,0,True) if suba else None
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
    if hoy and len(hoy)>2 and hoy[2]: return 0,f"subió mucho de precio hace poco ({hoy[0]} vendidas en {hoy[1]} días a este precio): el ritmo de antes era a un precio más barato y no vale, sólo va el mínimo si está en cero"
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
def calc(v30,v60,v180,full,cam,casa,dcs=30,dias=T,hoy=None,tDest=None,sinPubOtras=False):
    # Revisión etapa 3, 29/10/2026: `full` y `cam` son los de las 4 cuentas juntas (igual que el ritmo: v30/v60/v180 son del producto).
    # La cobertura (lo que hace falta para D días y el tope de 90) sigue con el total: si otra cuenta todavía tiene, esas unidades
    # también se venden. Pero "está en CERO" (el mínimo de 4 y el primer lugar del cupo) es de la cuenta que RECIBE (`tDest` = SU Full +
    # SU camino): una cuenta que publica y está en cero no vende aunque otra tenga (la regla de la web, `_pisoCeroAplica`). Antes, con
    # 12 en el Full de otra cuenta (`nomandar`), la que publicaba y estaba en 0 no recibía su mínimo. Sin publicación propia (`pasara`)
    # y con stock en otra cuenta no va el mínimo (07/10/2026, eligió la a: lo de la otra cuenta se vende ahí primero).
    t=full+cam; td=t if tDest is None else tDest; cero=(td==0 and not sinPubOtras)
    r,b=r_de(v30,v60,v180,t,dcs,hoy)
    # NUEVO (nunca vendió en 180 d y no hay nada en Full ni en camino): no se sabe cuánto vende, va el mínimo
    # para que pueda arrancar. Antes daba "no vende" y no salía nada (15/10/2026, eligió la a).
    if v30==v60==v180==0 and t==0: return max(0,min(PISO_CERO,casa)),0,'nuevo: nunca vendió, va el mínimo para arrancar'
    q=math.ceil(r*dias-t-0.25) if r*dias>t else 0
    if cero and (r>0 or v30>0 or v60>0): q=max(q,PISO_CERO)
    if r>0:
        tope=math.floor(r*TOPE_LENTO-t)
        if q>0 and q>max(tope,0):
            q=max(tope,1 if cero else 0); b+=f' · tope {TOPE_LENTO} días (vende lento)'
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
# LO DE CADA CUENTA (revisión etapa 3, 29/10/2026): pedidostodo trae, por producto y por color, el Full de cada cuenta (`[Ad3 Lu12]` del
# producto, `fullcta [..]` del color), lo que va en camino a cada una (`camcta [..]`), dónde está publicado de verdad (`pub [..]` el
# producto y `pubV [..]` el color; sin `pasara`) y lo que dice HOY mi decisión de caja en la base (`cajadec [..]`: la web le resta lo
# que se despacha). Antes se usaba el total de las 4 cuentas y no se sabía qué colores publica cada una.
def _ctas_num(s):   # "Ad3 Lu12" → {'Adriana':3,'Luciana':12}
    o={}
    for x in (s or '').split():
        mm=re.match(r'^([A-Z][a-z])(\d+)$',x)
        if mm and mm.group(1) in AB: o[AB[mm.group(1)]]=o.get(AB[mm.group(1)],0)+int(mm.group(2))
    return o
def _campo(t,nom):   # lo de adentro de " · <nom> [..]"; None si el log no lo trae (log viejo)
    mm=re.search(r' · '+nom+r' \[([^\]]*)\]',t or '')
    return mm.group(1) if mm else None
def _num_o_none(t,nom):
    s=_campo(t,nom); return None if s is None else _ctas_num(s)
def _lst_o_none(t,nom):
    s=_campo(t,nom); return None if s is None else [AB[x] for x in s.split() if x in AB]
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
                 ctas=[AB[x] for x in ct.group(1).split() if x in AB] if ct else None,vars=[],gan=gan,grande=' · GRANDE' in m.group(11),porcaja=(int(re.search(r' · GRANDE porcaja (\d+)',m.group(11)).group(1)) if re.search(r' · GRANDE porcaja (\d+)',m.group(11)) else None),hoy=hoy_de(m.group(11)),
                 fullC=_ctas_num(m.group(8)),camC=_num_o_none(m.group(11),'camcta'),pub=_lst_o_none(m.group(11),'pub'),dec=_num_o_none(m.group(11),'cajadec'),perf=re.search(r' · PERF (\d+)(?:@(\S+))?',m.group(11)),resto=m.group(11),
                 soloPerf=(re.search(r' · SOLOPERF (\w+)',m.group(11)).group(1) if re.search(r' · SOLOPERF (\w+)',m.group(11)) else None));P.append(cur);continue
    # Un renglón de producto que NO se entiende (un dato nuevo en el medio): sus colores NO pueden ir al producto de arriba.
    if re.match(r'^p\w+ · ',l): cur=None; noEnt.append(l[:110]); continue
    m=re.match(r'^   # (.*?) · v30 (\d+) v60 (\d+) v180 (\d+) · últ \S+(?: · dCS (\d+))?(?: · cortes \d+)? · Full (\d+) · casa (\d+) · camino (\d+)',l)
    if m and cur: cur['vars'].append(dict(v=m.group(1),s=list(map(int,m.group(2,3,4))),dcs=int(m.group(5)) if m.group(5) else cur['dcs'],full=int(m.group(6)),casa=int(m.group(7)),cam=int(m.group(8)),hoy=hoy_de(l),
                                          fullC=_num_o_none(l,'fullcta'),camC=_num_o_none(l,'camcta'),pubV=_lst_o_none(l,'pubV'),dec=_num_o_none(l,'cajadec')))
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
# Revisión etapa 3, 29/10/2026: sin lo de cada cuenta no se arma (con el total de las 4 una cuenta en cero que publica no recibía su
# mínimo, y sin `pubV` un color que la cuenta no publica recibía unidades, como el P47 blanco del 25/10).
_viejo=[p['n'] for p in P if p['pub'] is None or p['camC'] is None or p['dec'] is None]+[f"{p['n']} · {x['v']}" for p in P for x in p['vars'] if None in (x['fullC'],x['camC'],x['pubV'],x['dec'])]
if _viejo: print(f'⚠️ el log es viejo (no trae "pub/camcta/cajadec" del producto o "fullcta/camcta/pubV/cajadec" del color, ej. {_viejo[0]}): corré pedidostodo de nuevo'); sys.exit(1)
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
  ('p17934023964270','','Ayelen'):(1,'Él 30/10: "con la mercadería nueva armá la caja" (llegó el 30/10, publicada en Ayelen el 30/10): va primero'),
  ('p17934023965311','','Ayelen'):(2,'Él 30/10: "con la mercadería nueva armá la caja" (llegó el 30/10, publicada en Ayelen el 30/10): va primero'),
  ('p17934023966843','','Ayelen'):(1,'Él 30/10: "con la mercadería nueva armá la caja" (llegó el 30/10, publicada en Ayelen el 30/10): va primero'),
  ('p17934023967884','','Ayelen'):(1,'Él 30/10: "con la mercadería nueva armá la caja" (llegó el 30/10, publicada en Ayelen el 30/10): va primero'),
  ('p17934023968925','','Ayelen'):(1,'Él 30/10: "con la mercadería nueva armá la caja" (llegó el 30/10, publicada en Ayelen el 30/10): va primero'),
  ('p17934023969966','','Ayelen'):(1,'Él 30/10: "con la mercadería nueva armá la caja" (llegó el 30/10, publicada en Ayelen el 30/10): va primero'),
  ('p17934023971007','','Ayelen'):(1,'Él 30/10: "con la mercadería nueva armá la caja" (llegó el 30/10, publicada en Ayelen el 30/10): va primero'),
}
out=[];res=[];sin=[];amano=[];nOfi=0;largos=[];soloPerfFuera=[]
# Revisión etapa 3, 29/10/2026: lo que CALCULA este script lleva esta marca al final del motivo. Así se distingue, sin adivinar por el
# comienzo del texto, de lo que escribí a mano en cajas.txt (ver "LAS DECISIONES A MANO" más abajo).
AUTO_TAG=' · (cuenta automática)'
def txt_dias(D,por):
    return f"para {D} dias ({por}: el cupo de esa cuenta lo controla el botón del cupo)" if D==T_LARGO else "para 37 dias (30 + 7 de viaje)"
def txt_stock(fd,cd,otras):   # lo de la cuenta que recibe y, si hay, lo de las otras (revisión etapa 3, 29/10/2026)
    return f"hay {fd} en Full y {cd} en camino"+(f" (y {otras} en las otras cuentas)" if otras>0 else '')
# 🛍️ LO QUE PIDIÓ LA PERFUMERÍA queda en la oficina (29/10/2026, `cyc/pedperf`): esas unidades no van a Full.
# 12b de la revisión etapa 9 (30/10/2026, él): lo FIJO de él para Full (el Persea de Luciana) va ANTES que lo que pide la perfumería: sus
# unidades no se apartan; la perfumería se lleva lo que sobra.
def fijo_q(pid,v): return max([q for (a,b,_c),(q,_m) in FIJO.items() if a==pid and b==v] or [0])
for p in P:
    pm=p.get('perf')
    if not pm: continue
    pu=int(pm.group(1)); pva=(pm.group(2) or '').replace('_',' ').lower()
    _oc=re.search(r' · OFICYC (\d+)',p.get('resto','')); pu=max(0,pu-(int(_oc.group(1)) if _oc else 0))   # lo de la Oficina CYC cubre primero
    if pu<=0: continue
    if p['vars']:
        _m=[x for x in p['vars'] if x['v'].lower()==pva]
        # Revisión etapa 9, 30/10/2026: pidió un color sin renglón (no hay de ése en la oficina): no se aparta OTRO color (antes el que más vende:
        # pidió Rosa y se quedaban 2 Azul en la oficina). El mismo cambio en decide_pedidos.py.
        if pva and not _m: continue
        tv=_m[0] if _m else max(p['vars'],key=lambda x:(x['s'][2],x['casa']))
        r=min(pu,max(0,tv['casa']-fijo_q(p['id'],tv['v']))); tv['casa']-=r; p['casa']=max(0,p['casa']-r); tv['perfR']=r
    else: r=min(pu,max(0,p['casa']-fijo_q(p['id'],''))); p['casa']-=r
    p['perfR']=r   # lo apartado (revisión etapa 9): va en el motivo y, si es todo, en un renglón en 0 que pisa la decisión de antes
    if r: print(f"🛍️ {p['n']}: {r} quedan en la oficina para la perfumería (no van a Full)")
# Revisión etapa 9, 30/10/2026 (él, 29/10: "que no vaya a Full"): si TODO lo de la oficina de un producto (o de un color) quedó apartado para la
# perfumería, antes se salteaba sin renglón y la decisión de caja de antes (con SOLO_CLAUDE no vence) seguía en la base: Armar caja y el chat
# de Chrome mandaban a Full lo apartado. Ahora va un renglón en 0 que la pisa. Y en los demás el motivo dice cuántas quedan para ella.
def perf_txt(r): return f" · 🛍️ {r} para la perfumería (quedan en la oficina, no van a Full)" if r else ''
def perf_cero(cab,cta,nom,r,grande):
    return dict(cab=cab,q=0,cola=f"🛍️ las {r} de la oficina quedan para la perfumería (no van a Full)"+AUTO_TAG,cta=cta,nom=nom,gan=None,grande=grande,enCero=False,dias=None,casa=0,perf0=True,dec=None)
for p in P:
    # 🛍️ SÓLO PARA LA PERFUMERÍA (30/10/2026, 3a de la revisión del Local): lo de la papelera o "sólo local" que la perfumería pide entra al log
    # de pedidostodo (`SOLOPERF`) para que Pedidos se lo pida a Tito, pero NO va a Full (antes ni estaba en el log). Lo de "no traer" sí sigue:
    # lo que ya hay se puede mandar, sólo no se compra más para ML.
    if p.get('soloPerf') in ('papelera','sololocal'):
        if p['casa']>0 or any(x['casa']>0 for x in p['vars']): soloPerfFuera.append(f"{p['n']} ({'papelera' if p['soloPerf']=='papelera' else 'sólo local'}): no va a Full")
        continue
    if p['casa']<=0 and not any(x['casa']>0 for x in p['vars']):
        if p.get('perfR'):   # todo apartado para la perfumería (revisión etapa 9, ver `perf_cero`): un 0 en cada cuenta que lo puede recibir
            _pv0='paulvic' in p['n'].lower(); _cs=['Adriana'] if _pv0 else (p['ctas'] or [])
            if p['vars']:
                for x in p['vars']:
                    if x.get('perfR'):
                        for cc in (['Luciana'] if (_pv0 and x['v']=='Persea') else _cs): out.append(perf_cero(f"caja:{p['id']}@{cc}#{x['v']}",cc,f"{p['n'][:38]} · {x['v']}",x['perfR'],p['grande']))
            else:
                for cc in _cs: out.append(perf_cero(f"caja:{p['id']}@{cc}",cc,p['n'][:38],p['perfR'],p['grande']))
        continue
    nOfi+=1
    pv='paulvic' in p['n'].lower()
    ctas=p['ctas']
    _apT=f" y {p['perfR']} apartadas para la perfumería" if p.get('perfR') else ''   # revisión etapa 9, 30/10/2026
    if pv: cta='Adriana'
    elif len(ctas)==1: cta=ctas[0]
    elif not ctas: sin.append(f"{p['n']} ({p['casa']} en la oficina{_apT}): ninguna cuenta lo puede recibir (no publica o está en nomandar)"); continue
    else: amano.append(f"{p['n']} ({p['casa']} en la oficina{_apT}): puede ir a {', '.join(ctas)} — decidir a mano"); continue
    if p['vars'] and any(x['casa']>0 for x in p['vars']):
        for x in p['vars']:
            if x['casa']<=0:
                # el color quedó todo apartado para la perfumería: 0 que pisa la decisión de antes (revisión etapa 9, ver `perf_cero`)
                if x.get('perfR'): c0='Luciana' if (pv and x['v']=='Persea') else cta; out.append(perf_cero(f"caja:{p['id']}@{c0}#{x['v']}",c0,f"{p['n'][:38]} · {x['v']}",x['perfR'],p['grande']))
                continue
            c='Luciana' if (pv and x['v']=='Persea') else cta
            if pv and c not in ctas: sin.append(f"{p['n']} · {x['v']}: va a {c} pero {c} no lo puede recibir (no publica o nomandar)"); continue
            # 24/10/2026 (él): ML dio de baja para siempre estos aromas por la marca del nombre: no se mandan más a Full (lo de la oficina va al local).
            if (p['id'],x['v']) in BAJA_ML:
                out.append(dict(cab=f"caja:{p['id']}@{c}#{x['v']}",q=0,cola="ML lo dio de baja para siempre por la marca del nombre (24/10): no se manda más a Full. Lo de la oficina va al local.",
                                cta=c,nom=f"{p['n'][:38]} · {x['v']}",gan=0,grande=p['grande'],enCero=False,dias=None,casa=x['casa'],baja=True,dec=x['dec'].get(c))); continue
            if (p['id'],x['v'],c) in FIJO:
                fq,fm=FIJO[(p['id'],x['v'],c)]
                out.append(dict(cab=f"caja:{p['id']}@{c}#{x['v']}",q=min(fq,x['casa']),cola=fm+perf_txt(x.get('perfR',0)),cta=c,nom=f"{p['n'][:38]} · {x['v']}",gan=p['gan'],grande=p['grande'],enCero=False,dias=None,casa=x['casa'],fijo=True,dec=x['dec'].get(c))); continue
            # UN COLOR QUE ESA CUENTA NO PUBLICA NO SE MANDA (revisión etapa 3, 29/10/2026): el producto va a una sola cuenta, pero cada
            # color es su publicación. Sin publicación de ESE color no hay código de etiqueta, Armar caja de la web no lo muestra y el robot
            # no puede leer su llegada (el P47 blanco del 25/10, arreglado a mano en FIJO). Una cuenta `pasara` (todavía no publica nada del
            # producto) sí recibe, como en la web.
            if c in p['pub'] and c not in x['pubV']:
                out.append(dict(cab=f"caja:{p['id']}@{c}#{x['v']}",q=0,cola=f"En {c} no hay publicación de este color ({x['v']}): sin publicación de ese color no va (lo de la oficina espera){perf_txt(x.get('perfR',0))}"+AUTO_TAG,
                                cta=c,nom=f"{p['n'][:38]} · {x['v']}",gan=p['gan'],grande=p['grande'],enCero=False,dias=None,casa=x['casa'],dec=x['dec'].get(c))); continue
            fd=x['fullC'].get(c,0);cd=x['camC'].get(c,0);otras=max(0,(x['full']+x['cam'])-(fd+cd));sinPubOtras=(c not in p['pub']) and otras>0
            D,por=dias_de(p['n'],x['s'][0],x['s'][1],x['dcs'])
            q,r,b=calc(*x['s'],x['full'],x['cam'],x['casa'],x['dcs'],D,x.get('hoy'),tDest=fd+cd,sinPubOtras=sinPubOtras)
            out.append(dict(cab=f"caja:{p['id']}@{c}#{x['v']}",q=q,cola=f"{b} · {txt_stock(fd,cd,otras)} · {txt_dias(D,por)} hacen falta {r*D:.0f} · en la oficina {x['casa']}{perf_txt(x.get('perfR',0))}"+AUTO_TAG,
                            cta=c,nom=f"{p['n'][:38]} · {x['v']}",gan=p['gan'],grande=p['grande'],enCero=(fd+cd)==0 and not sinPubOtras,r=r,dias=((x['full']+x['cam'])/r if r>0 else None),casa=x['casa'],dec=x['dec'].get(c)))
            if D==T_LARGO: largos.append(f"{p['n'][:38]} · {x['v']}")
    elif (p['id'],'',cta) in FIJO:
        fq,fm=FIJO[(p['id'],'',cta)]
        out.append(dict(cab=f"caja:{p['id']}@{cta}",q=min(fq,p['casa']),cola=fm+perf_txt(p.get('perfR',0)),cta=cta,nom=p['n'][:38],gan=p['gan'],grande=p['grande'],enCero=False,dias=None,casa=p['casa'],fijo=True,dec=p['dec'].get(cta)))
    else:
        fd=p['fullC'].get(cta,0);cd=p['camC'].get(cta,0);otras=max(0,(p['full']+p['cam'])-(fd+cd));sinPubOtras=(cta not in p['pub']) and otras>0
        D,por=dias_de(p['n'],p['v'][0],p['v'][1],p['dcs'])
        q,r,b=calc(*p['v'],p['full'],p['cam'],p['casa'],p['dcs'],D,p.get('hoy'),tDest=fd+cd,sinPubOtras=sinPubOtras)
        out.append(dict(cab=f"caja:{p['id']}@{cta}",q=q,cola=f"{b} · {txt_stock(fd,cd,otras)} · {txt_dias(D,por)} hacen falta {r*D:.0f} · en la oficina {p['casa']}{perf_txt(p.get('perfR',0))}"+AUTO_TAG,
                        cta=cta,nom=p['n'][:38],gan=p['gan'],grande=p['grande'],enCero=(fd+cd)==0 and not sinPubOtras,r=r,dias=((p['full']+p['cam'])/r if r>0 else None),casa=p['casa'],dec=p['dec'].get(cta)))
        if D==T_LARGO: largos.append(p['n'][:38])
# LAS DECISIONES A MANO DE LA VUELTA NO SE PISAN (28/10/2026, error mío: al rearmar las cajas pisé las de la completa —Cartas Casino 0,
# Paulvic 0, Tendedero 0— y mandaba 97 Cartas recién subidas de precio). Si el cajas.txt anterior tiene un renglón con motivo escrito
# a mano, se queda ése. Revisión etapa 3, 29/10/2026 (cuatro agujeros que tenía):
#  · lo automático se reconocía por el comienzo del texto y faltaban "pocas ventas" y "no vende": 21 de 110 renglones quedaban
#    congelados como si fueran decisiones mías (un color que llegaba a 0 en Full no recibía su mínimo). Ahora lo que calcula este script
#    lleva AUTO_TAG al final; los renglones de antes (sin la marca) se reconocen por el comienzo, con esos dos agregados.
#  · si la cuenta de esta vuelta daba el MISMO número se perdía el motivo escrito a mano, y a la noche siguiente se recalculaba. Ahora
#    la decisión a mano se queda aunque coincida.
#  · se aplicaba DESPUÉS del recorte por el cupo y de "los grandes van aparte", y sin mirar la oficina: un 10 a mano pasaba un cupo de 6
#    o mezclaba un chico con 20 Tenders. Ahora va ANTES (pasa por los dos) y nunca más de lo que hay en la oficina.
#  · un número a mano que YA SALIÓ se volvía a pedir a la noche siguiente (la web descuenta lo despachado de la decisión en la base, no
#    de este archivo). Ahora se mira `cajadec` (lo que dice hoy esa decisión en la base): lo que bajó desde que se escribió salió en una
#    caja y se resta; si salió todo, la decisión se cumplió y vuelve la cuenta automática.
_CJ=os.path.join(os.path.dirname(os.path.abspath(__file__)),'cajas.txt')
_prev={}
if os.path.exists(_CJ):
    for l in open(_CJ):
        mm=re.match(r'(caja:[^=]+)=u\|(\d+)\|(.*)',l.strip())
        if mm: _prev[mm.group(1)]=(int(mm.group(2)),mm.group(3))
_auto_viejo=re.compile(r'^(vende |vendió |al precio de hoy|agotado|nuevo|sin ventas|nunca vendió|pocas ventas|no vende)')
def _base_motivo(mot):
    # Saca los prefijos que pone este script (📦 los grandes en caja aparte, ✂️ el recorte del cupo) y devuelve el motivo de abajo y
    # cuántas eran ANTES de recortarlas (None si no tenía prefijo).
    q0=None
    while True:
        mm=re.match(r'^📦 grande: (?:va en caja aparte \(ML no deja mezclarlo con chicos\)|espera a juntar una caja llena \([^)]*\)), quedan (\d+) para esa caja · (.*)$',mot) or re.match(r'^✂️ por el cupo de Full de \w+ \([^)]*\) entran \d+ de (\d+) \(faltan \d+\) · (.*)$',mot)
        if not mm:
            # 30/10/2026: el grande que sale en su propia caja no cambia las unidades (sólo se saca el prefijo para no repetirlo)
            ms=re.match(r'^📦 grande: sale en SU PROPIA caja \(ML no deja mezclarlo con chicos\), porque .*? · (.*)$',mot)
            if not ms: return mot,q0
            mot=ms.group(1); continue
        q0=int(mm.group(1)); mot=mm.group(2)
def _es_auto(mot): return mot.endswith(AUTO_TAG.strip(' ·')) or bool(_auto_viejo.match(mot))
mantenidos=[];cumplidas=[]
for o in out:
    if o.get('fijo') or o.get('baja') or o.get('perf0') or len(sys.argv)>=3: continue      # lo FIJO de él, lo dado de baja y lo apartado para la perfumería (revisión etapa 9) mandan siempre
    pv=_prev.get(o['cab'])
    if not pv: continue
    mot,q0=_base_motivo(pv[1])
    if _es_auto(mot): continue
    Q=pv[0] if q0 is None else q0            # lo que decidí a mano (antes de que lo recortara el cupo o la caja aparte)
    U=o.get('dec')                          # lo que dice HOY esa decisión en la base (None: no está)
    salio=max(0,pv[0]-U) if U is not None else 0
    q=max(0,Q-salio)
    if Q>0 and q==0:
        cumplidas.append(f"{o['nom']} → {o['cta']}: decidí {Q} a mano y ya salieron → vuelve la cuenta automática ({o['q']})"); continue
    q=min(q,o['casa'])
    mantenidos.append(f"{o['nom']} → {o['cta']}: queda {q}{f' (de {Q}: ya salieron {salio})' if salio else ''} (decisión anterior: {mot[:80]})")
    o['q']=q;o['cola']=mot
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
    # LO FIJO DE ÉL VA PRIMERO (revisión etapa 3, 29/10/2026): antes entraba al recorte como uno más y el Persea fijo de 3 quedaba en 1
    # con cupo 1. Ahora sus unidades se apartan del cupo antes de repartir el resto; si lo fijo solo ya lo pasa, va igual y se avisa.
    resv={k:sum(o['q'] for o in out if o['cta']==cta and o.get('fijo') and o['q']>0 and (o['grande'] if k=='gra' else not o['grande'])) for k in ('peq','gra')}
    top={k:(None if cu[k] is None else max(0,cu[k]-resv[k])) for k in ('peq','gra')}
    for k in ('peq','gra'):
        if cu[k] is not None and resv[k]>cu[k]: recortes.append(f"⚠️ {cta}: lo FIJO de él ({resv[k]} {'grandes' if k=='gra' else 'chicos y medianos'}) ya pasa el cupo ({cu[k]}): va igual y lo demás queda afuera")
    idx=[i for i,o in enumerate(out) if o['cta']==cta and o['q']>0 and not o.get('fijo')]
    if not idx: continue
    pide={'peq':sum(out[i]['q'] for i in idx if not out[i]['grande']),'gra':sum(out[i]['q'] for i in idx if out[i]['grande'])}
    if (top['peq'] is None or pide['peq']<=top['peq']) and (top['gra'] is None or pide['gra']<=top['gra']): continue   # entra todo: no se toca
    dado=llenar_cupo([out[i] for i in idx],top['peq'],top['gra'])
    for j,i in enumerate(idx):
        o=out[i];d=dado[j]
        if d<o['q']:
            b='grandes' if o['grande'] else 'chicos y medianos';k='gra' if o['grande'] else 'peq'
            o['cola']=f"✂️ por el cupo de Full de {cta} ({top[k]} {b}{' después de lo fijo de él' if resv[k] else ''}) entran {d} de {o['q']} (faltan {o['q']-d}) · "+o['cola']
            recortes.append(f"{o['nom']} → {cta}: {o['q']} → {d}")
            o['q']=d
# LOS GRANDES VAN EN CAJA APARTE (28/10/2026, él: "los tenders son productos grandes, ML no permite mandar juntos. los tenders se mandan
# en cajas solos"). Hasta el 30/10 quedaban en 0 mientras la cuenta tuviera algo chico para mandar, y como casi siempre hay chicos, los
# Tenders no salían nunca. 30/10/2026 (él eligió la 3a de la revisión de Mercadería: "que salgan en su propia caja cuando juntan 1 caja llena
# o se cortan en 14 días"): con chicos en la caja de esa cuenta, los grandes SALEN en su propia caja (no se ponen en 0) si entre todos
# llenan una caja (cada unidad gasta 1/`porcaja`, la misma cuenta que la barra de lugar de la web; sin medidas no se da por llena) o si
# alguno está en 0 o se corta antes de CAJA_CORTE_DIAS (14). Si no, esperan en la oficina a juntar la caja. Sin chicos para esa cuenta, van
# como siempre (esa caja ya es sólo de grandes). La web (Armar caja y `cajaarmar`) los deja afuera de la caja de los chicos: van en otra.
_porcaja={p['id']:p.get('porcaja') for p in P}
grandesSalen=[]
for cta in set(o['cta'] for o in out):
    if any(o['cta']==cta and o['q']>0 and not o['grande'] for o in out):
        G=[o for o in out if o['cta']==cta and o['grande'] and o['q']>0]
        if not G: continue
        _pc=lambda o:_porcaja.get(o['cab'].split(':',1)[1].split('@',1)[0])
        lugar=sum(o['q']/_pc(o) for o in G if _pc(o))   # fracción de caja que llenan (sin medidas no suman: no se inventa)
        corta=[o for o in G if o.get('enCero') or (o.get('dias') is not None and o['dias']<CAJA_CORTE_DIAS)]
        if lugar>=1 or corta:
            por=(f"juntan una caja llena ({round(lugar*100)}% de una caja)" if lugar>=1 else f"{'está en 0' if corta[0].get('enCero') else 'se corta en '+str(round(corta[0]['dias']))+' días'} ({corta[0]['nom'][:30].replace(' · ',' ')})")
            for o in G: o['cola']=f"📦 grande: sale en SU PROPIA caja (ML no deja mezclarlo con chicos), porque {por} · "+o['cola']
            grandesSalen.append(f"{cta}: {sum(o['q'] for o in G)} u. de {len(G)} producto(s) en su propia caja, porque {por}")
        else:
            sinMed=sum(1 for o in G if not _pc(o))
            for o in G:
                o['cola']=f"📦 grande: espera a juntar una caja llena (hay para {round(lugar*100)}% de una caja{', '+str(sinMed)+' sin medidas' if sinMed else ''} y ninguno se corta en {CAJA_CORTE_DIAS} días), quedan {o['q']} para esa caja · "+o['cola'];recortes.append(f"{o['nom']} → {cta}: {o['q']} → 0 (espera a juntar una caja llena de grandes)");o['q']=0
# (Las decisiones a mano de la vuelta se aplican ANTES del recorte del cupo y de los grandes: ver "LAS DECISIONES A MANO" más arriba.)
for o in out:
    if o['q']: res.append(f"{o['nom']} → {o['cta']}: {o['q']}")
out=[f"{o['cab']}=u|{o['q']}|{o['cola']}" for o in out]
bad=[x for x in out if ';' in x]
if bad: print('⚠️ renglones con ";" (decido los cortaría):',*bad[:5],sep='\n  '); sys.exit(1)
open(_CJ,'w').write('\n'.join(out)+'\n')
print(len(out),'renglones de caja ·',nOfi,'productos con mercadería en la oficina · escrito en',_CJ);print('\n'.join(res))
if mantenidos: print('🔒 DECISIONES ANTERIORES QUE SE QUEDAN (para pisarlas: correr con un 2º argumento cualquiera) ·',len(mantenidos),*mantenidos,sep='\n  ')
if cumplidas: print('✅ DECISIONES A MANO QUE YA SALIERON (vuelve la cuenta automática) ·',len(cumplidas),*cumplidas,sep='\n  ')
print(f"estirados a {T_LARGO} días (venden parejo, sin prueba abierta): {len(largos)}",*largos,sep='\n  ')
if SIN_ESTIRAR is None: print('⚠️ no encontré sin_estirar.txt: todo quedó en 37 días')
if CUPO: print('cupo de Full leído: '+' · '.join(f"{c} {v['peq'] if v['peq'] is not None else '?'}/{v['gra'] if v['gra'] is not None else '?'}" for c,v in CUPO.items()))
else: print('⚠️ el log no trae el CUPO de Full (pedidostodo viejo): no recorté ninguna caja por el cupo')
if recortes: print(f"✂️ RECORTADO POR EL CUPO (la regla de la web: 1 u. a cada uno y después por plata) · {len(recortes)}:",*recortes,sep='\n  ')
if grandesSalen: print('📦 GRANDES QUE SALEN EN SU PROPIA CAJA (aparte de la de los chicos) ·',len(grandesSalen),*grandesSalen,sep='\n  ')
if soloPerfFuera: print('🛍️ PEDIDO SÓLO PARA LA PERFUMERÍA (papelera / sólo local, no van a Full) ·',len(soloPerfFuera),*soloPerfFuera,sep='\n  ')
if sin: print('SIN CUENTA:',*sin,sep='\n  ')
if amano: print('DECIDIR A MANO (más de una cuenta):',*amano,sep='\n  ')
