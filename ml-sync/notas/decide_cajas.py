# Decide Armar caja para TODO lo que hay en la oficina (09/10/2026, regla suya: "todo completo, nunca a mitad").
# Uso: python3 decide_cajas.py <log de pedidostodo>  → escribe cajas.txt
# La cuenta de cada producto sale de las cuentas que PUEDEN recibirlo (el "ctas [..]" del log: publican, sin `nomandar`,
# más las marcadas `pasara`; la misma regla que Armar caja y `cajasnotas`, revisión 9 del 13/10/2026). Si puede ir a más
# de una, no adivino: va a la lista "decidir a mano". Por color: cubrir 37 días (30 + 7 de viaje, 60 si vende parejo) con el ritmo de
# 30 d por día CON stock (o 60 d si vendió poco, o 180 d si está agotado) menos Full y camino; si está en cero y vende,
# mínimo 4; nunca más de lo que hay en la oficina. Nuevo (nunca vendió, nada en Full): 4. Nada pasa los 90 días
# de venta (tope para lo lento: Full cobra a los 120). 15/10/2026. Paulvic: todo a Adriana menos Persea (Luciana). Remates no cuentan.
import re,sys,math
T=37  # 30 días de venta + 7 de viaje (regla suya del 14/10/2026)
T_LARGO=60  # se estira a 60 días sólo en lo que vende parejo y no tiene prueba de precio abierta (eligió la a, 14/10/2026)
import os
_SE=os.path.join(os.path.dirname(os.path.abspath(__file__)),'sin_estirar.txt')
SIN_ESTIRAR=[l.strip().lower() for l in open(_SE)] if os.path.exists(_SE) else None
SIN_ESTIRAR=[x for x in SIN_ESTIRAR if x and not x.startswith('#')] if SIN_ESTIRAR is not None else None
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
def r_de(v30,v60,v180,tiene,dcs=30):
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
def calc(v30,v60,v180,full,cam,casa,dcs=30,dias=T):
    t=full+cam; r,b=r_de(v30,v60,v180,t,dcs)
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
P=[];cur=None;esper=0
for l in L:
    m=re.match(r'════ (BSAS|PY|PAULVIC) · (\d+) ════',l)
    if m: esper+=int(m.group(2)); continue
    m=re.match(r'^(p\w+) · (.*?) · v30 (\d+) v60 (\d+) v180 (\d+) · .*?dCS (\d+)(?: · cortes \d+)? · Full (\d+) \[([^\]]*)\] · casa (\d+) · camino (\d+)(.*)$',l)
    if m:
        ct=re.search(r' · ctas \[([^\]]*)\]',m.group(11))
        cur=dict(id=m.group(1),n=m.group(2),v=list(map(int,m.group(3,4,5))),dcs=int(m.group(6)),full=int(m.group(7)),br=m.group(8),casa=int(m.group(9)),cam=int(m.group(10)),
                 ctas=[AB[x] for x in ct.group(1).split() if x in AB] if ct else None,vars=[]);P.append(cur);continue
    m=re.match(r'^   # (.*?) · v30 (\d+) v60 (\d+) v180 (\d+) · últ \S+(?: · dCS (\d+))?(?: · cortes \d+)? · Full (\d+) · casa (\d+) · camino (\d+)',l)
    if m and cur: cur['vars'].append(dict(v=m.group(1),s=list(map(int,m.group(2,3,4))),dcs=int(m.group(5)) if m.group(5) else cur['dcs'],full=int(m.group(6)),casa=int(m.group(7)),cam=int(m.group(8))))
print(f"leí {len(P)} de {esper} productos"+(' ✓' if len(P)==esper else ' ⚠️ NO CIERRA: hay renglones que no entendí'))
if any(p['ctas'] is None for p in P): print('⚠️ el log es viejo (no trae "ctas [..]"): corré pedidostodo de nuevo'); sys.exit(1)
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
            D,por=dias_de(p['n'],x['s'][0],x['s'][1],x['dcs'])
            q,r,b=calc(*x['s'],x['full'],x['cam'],x['casa'],x['dcs'],D)
            out.append(f"caja:{p['id']}@{c}#{x['v']}=u|{q}|{b} · hay {x['full']} en Full y {x['cam']} en camino · {txt_dias(D,por)} hacen falta {r*D:.0f} · en la oficina {x['casa']}")
            if D==T_LARGO: largos.append(f"{p['n'][:38]} · {x['v']}")
            if q: res.append(f"{p['n'][:38]} · {x['v']} → {c}: {q}")
    else:
        D,por=dias_de(p['n'],p['v'][0],p['v'][1],p['dcs'])
        q,r,b=calc(*p['v'],p['full'],p['cam'],p['casa'],p['dcs'],D)
        out.append(f"caja:{p['id']}@{cta}=u|{q}|{b} · hay {p['full']} en Full y {p['cam']} en camino · {txt_dias(D,por)} hacen falta {r*D:.0f} · en la oficina {p['casa']}")
        if D==T_LARGO: largos.append(p['n'][:38])
        if q: res.append(f"{p['n'][:38]} → {cta}: {q}")
open('cajas.txt','w').write('\n'.join(out)+'\n')
print(len(out),'renglones de caja ·',nOfi,'productos con mercadería en la oficina');print('\n'.join(res))
print(f"estirados a {T_LARGO} días (venden parejo, sin prueba abierta): {len(largos)}",*largos,sep='\n  ')
if SIN_ESTIRAR is None: print('⚠️ no encontré sin_estirar.txt: todo quedó en 37 días')
if sin: print('SIN CUENTA:',*sin,sep='\n  ')
if amano: print('DECIDIR A MANO (más de una cuenta):',*amano,sep='\n  ')
