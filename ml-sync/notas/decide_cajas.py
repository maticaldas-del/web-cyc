# Decide Armar caja para TODO lo que hay en la oficina (09/10/2026, regla suya: "todo completo, nunca a mitad").
# Uso: python3 decide_cajas.py <log limpio de pedidostodo>  → escribe cajas.txt
# La cuenta de cada producto sale de dónde está su Full (el [Lu44] del log) o de CTA (las que hoy están en cero:
# mirar `cajasnotas` y agregarlas acá). Por color: cubrir 20 días (REPO_DIAS_COBERTURA) con el ritmo de 30 d
# (o 60 d si vendió poco, o 180 d si está agotado) menos Full y camino; si está en cero y vende, mínimo 4; nunca
# más de lo que hay en la oficina. Paulvic: todo a Adriana menos Persea (Luciana). Ventas en remate no cuentan.
import re,sys,math
T=20
CTA={'p1779912656130':'Ayelen','p1779912655950':'Ayelen','p1783381648682':'Matias','p1779912656370':'Matias',
     'p17904445725051':'Adriana','p17904445725742':'Adriana','p17904445726433':'Adriana','p179044457312310':'Adriana',
     'p1779912656220':None}
AB={'Ad':'Adriana','Lu':'Luciana','Ay':'Ayelen','Ma':'Matias'}
def r_de(v30,v60,v180,tiene):
    if v30>=3: return max(v30/30,v60/60*0.8),f"vende {v30} en 30 d"
    if v60>=3: return v60/60,f"vendió {v60} en 60 d"
    if v180>=4 and tiene==0: return v180/180,f"agotado, vendía {v180} en 180 d"
    if v30>0: return v30/30,f"vendió {v30} en 30 d"
    return 0,"no vende"
def calc(v30,v60,v180,full,cam,casa):
    t=full+cam; r,b=r_de(v30,v60,v180,t)
    q=math.ceil(r*T-t-0.25) if r*T>t else 0
    if t==0 and r>0: q=max(q,4)
    return max(0,min(q,casa)),r,b
P=[];cur=None
for l in open(sys.argv[1]).read().split('\n'):
    m=re.match(r'^(p\w+) · (.*?) · v30 (\d+) v60 (\d+) v180 (\d+) · .*?Full (\d+) \[([^\]]*)\] · casa (\d+) · camino (\d+)',l)
    if m:
        cur=dict(id=m.group(1),n=m.group(2),v=list(map(int,m.group(3,4,5))),full=int(m.group(6)),br=m.group(7),casa=int(m.group(8)),cam=int(m.group(9)),vars=[]);P.append(cur);continue
    m=re.match(r'^   # (.*?) · v30 (\d+) v60 (\d+) v180 (\d+) · últ \S+ · Full (\d+) · casa (\d+) · camino (\d+)',l)
    if m and cur: cur['vars'].append(dict(v=m.group(1),s=list(map(int,m.group(2,3,4))),full=int(m.group(5)),casa=int(m.group(6)),cam=int(m.group(7))))
out=[];res=[];sin=[]
for p in P:
    if p['casa']<=0 and not any(x['casa']>0 for x in p['vars']): continue
    cs=[AB.get(x[:2]) for x in p['br'].split() if x[:2] in AB]
    cta=CTA.get(p['id'], cs[0] if len(cs)==1 else (cs[0] if cs else None))
    pv='paulvic' in p['n'].lower()
    if not cta and not pv: sin.append(f"{p['n']} ({p['casa']} en la oficina): no sé a qué cuenta va"); continue
    if p['vars'] and any(x['casa']>0 for x in p['vars']):
        for x in p['vars']:
            if x['casa']<=0: continue
            c='Luciana' if (pv and x['v']=='Persea') else ('Adriana' if pv else cta)
            q,r,b=calc(*x['s'],x['full'],x['cam'],x['casa'])
            out.append(f"caja:{p['id']}@{c}#{x['v']}=u|{q}|{b} · hay {x['full']} en Full y {x['cam']} en camino · para 20 dias hacen falta {r*T:.0f} · en la oficina {x['casa']}")
            if q: res.append(f"{p['n'][:38]} · {x['v']} → {c}: {q}")
    else:
        q,r,b=calc(*p['v'],p['full'],p['cam'],p['casa'])
        out.append(f"caja:{p['id']}@{cta}=u|{q}|{b} · hay {p['full']} en Full y {p['cam']} en camino · para 20 dias hacen falta {r*T:.0f} · en la oficina {p['casa']}")
        if q: res.append(f"{p['n'][:38]} → {cta}: {q}")
open('cajas.txt','w').write('\n'.join(out)+'\n')
print(len(out),'renglones de caja');print('\n'.join(res));print('SIN CUENTA:',*sin,sep='\n  ')
