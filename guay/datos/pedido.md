# PEDIDO PARAGUAY · lo arma el chat de compras (regla de Matías vía CYC WEB, 02/10)
Tope US$ 1.000 crudos · mitad probados / mitad nuevos · máx 2 u. por producto nuevo · sólo lo medido por el robot en 25% o más.
Matías vació el pedido el 02/10 a la tarde. Estado:

## NUEVOS (candidatos, pedirU) · US$ 225
- Sony MDR-ZX110 Blanco (12746) x2 · 36% · US$13
- Sony MDR-ZX110 Rosa (12745) x2 · 37,2% · US$13
- Apple EarPods 3,5 (139639) x2 · 32,4% · US$19 (ojo: 1 solo vendedor en la ficha)
- JBL T110 Azul (28304) x2 · 51,2% · US$6,5
- JBL T125BT Blanco (63824) x2 · 41,4% · US$18
- JBL Tune 520C Negro (142507) x2 · 25,7% · US$20 (al filo)
- Haylou S30 Pro Blanco (125703) x2 · 28,7% · US$23
NO: Race 2 Blanco (34,6% sin cuotas, pero la ganadora da 6 cuotas → cae).

## PROBADOS (reposición) · pendiente: preguntado a CYC WEB cómo se cargan (candSetPedir es sólo para candidatos)

## Cómo cargar unidades SIN trabar el panel
candSetPedir llama a renderPedidos() y a alert(): varias seguidas traban la pestaña. Hacer:
  const P=candPuedePedir(c); if(P.ok){ c.pedirU=n; await fbSet('candidatos_py/'+c.id+'/pedirU', n); }
y releer de la base.

## Filtro rápido más realista (mi estimación vieja exageraba en lo barato)
margen ≈ (P×0,75 − 8.730) / (USD×1,17×1.535) − 1   (P = precio que gana en ML)
