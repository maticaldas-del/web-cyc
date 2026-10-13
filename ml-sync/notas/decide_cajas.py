# Decide Armar caja para TODO lo que hay en la oficina (09/10/2026, regla suya: "todo completo, nunca a mitad").
# Uso: python3 decide_cajas.py <log de pedidostodo>  → escribe cajas.txt
# La cuenta de cada producto sale de las cuentas que PUEDEN recibirlo (el "ctas [..]" del log: publican, sin `nomandar`,
# más las marcadas `pasara`; la misma regla que Armar caja y `cajasnotas`, revisión 9 del 13/10/2026). Si puede ir a más
# de una, no adivino: va a la lista "decidir a mano". Por color: cubrir 20 días (REPO_DIAS_COBERTURA) con el ritmo de
# 30 d por día CON stock (o 60 d si vendió poco, o 180 d si está agotado) menos Full y camino; si está en cero y vende,
# mínimo 4; nunca más de lo que hay en la oficina. Paulvic: todo a Adriana menos Persea (Luciana). Remates no cuentan.
import re,sys,math
T=20
AB={'Ad':'Adriana','Lu':'Luciana','Ay':'Ayelen','Ma':'Matias'}
def r_de(v30,v60,v180,tiene,dcs=30):
    d=max(7,min(30,dcs))
    if v30>=3: return max(v30/d,v60/60*0.8),f"vende {v30} en {d} d con stock" if d<30 else f"vende {v30} en 30 d"
    if v60>=3: return v60/60,f"vendió {v60} en 60 d"
    if v180>=4 and tiene==0: return v180/180,f"agotado, vendía {v180} en 180 d"
    if v30>0: return v30/d,f"vendió {v30} en 30 d"
    return 0,"no vende"
def calc(v30,v60,v180,full,cam,casa,dcs=30):
    t=full+cam; r,b=r_de(v30,v60,v180,t,dcs)
    q=math.ceil(r*T-t-0.25) if r*T>t else 0
    if t==0 and r>0: q=max(q,4)
    return max(0,min(q,casa)),r,b
L=[re.sub(r'^\d{4}-\d\d-\d\dT[\d:.]+Z ?','',l) for l in open(sys.argv[1]).read().split('\n')]
if any('NO LEÍ' in l for l in L):
    print('⚠️ el log dice NO LEÍ: no armo cajas a medias:',*[l for l in L if 'NO LEÍ' in l],sep='\n  '); sys.exit(1)
P=[];cur=None;esper=0
for l in L:
    m=re.match(r'════ (BSAS|PY|PAULVIC) · (\d+) ════',l)
    if m: esper+=int(m.group(2)); continue
    m=re.match(r'^(p\w+) · (.*?) · v30 (\d+) v60 (\d+) v180 (\d+) · .*?dCS (\d+) · Full (\d+) \[([^\]]*)\] · casa (\d+) · camino (\d+)(.*)$',l)
    if m:
        ct=re.search(r' · ctas \[([^\]]*)\]',m.group(11))
        cur=dict(id=m.group(1),n=m.group(2),v=list(map(int,m.group(3,4,5))),dcs=int(m.group(6)),full=int(m.group(7)),br=m.group(8),casa=int(m.group(9)),cam=int(m.group(10)),
                 ctas=[AB[x] for x in ct.group(1).split() if x in AB] if ct else None,vars=[]);P.append(cur);continue
    m=re.match(r'^   # (.*?) · v30 (\d+) v60 (\d+) v180 (\d+) · últ \S+(?: · dCS (\d+))? · Full (\d+) · casa (\d+) · camino (\d+)',l)
    if m and cur: cur['vars'].append(dict(v=m.group(1),s=list(map(int,m.group(2,3,4))),dcs=int(m.group(5)) if m.group(5) else cur['dcs'],full=int(m.group(6)),casa=int(m.group(7)),cam=int(m.group(8))))
print(f"leí {len(P)} de {esper} productos"+(' ✓' if len(P)==esper else ' ⚠️ NO CIERRA: hay renglones que no entendí'))
if any(p['ctas'] is None for p in P): print('⚠️ el log es viejo (no trae "ctas [..]"): corré pedidostodo de nuevo'); sys.exit(1)
out=[];res=[];sin=[];amano=[];nOfi=0
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
            q,r,b=calc(*x['s'],x['full'],x['cam'],x['casa'],x['dcs'])
            out.append(f"caja:{p['id']}@{c}#{x['v']}=u|{q}|{b} · hay {x['full']} en Full y {x['cam']} en camino · para 20 dias hacen falta {r*T:.0f} · en la oficina {x['casa']}")
            if q: res.append(f"{p['n'][:38]} · {x['v']} → {c}: {q}")
    else:
        q,r,b=calc(*p['v'],p['full'],p['cam'],p['casa'],p['dcs'])
        out.append(f"caja:{p['id']}@{cta}=u|{q}|{b} · hay {p['full']} en Full y {p['cam']} en camino · para 20 dias hacen falta {r*T:.0f} · en la oficina {p['casa']}")
        if q: res.append(f"{p['n'][:38]} → {cta}: {q}")
open('cajas.txt','w').write('\n'.join(out)+'\n')
print(len(out),'renglones de caja ·',nOfi,'productos con mercadería en la oficina');print('\n'.join(res))
if sin: print('SIN CUENTA:',*sin,sep='\n  ')
if amano: print('DECIDIR A MANO (más de una cuenta):',*amano,sep='\n  ')
