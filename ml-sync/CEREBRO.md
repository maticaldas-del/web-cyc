# 🧠 CEREBRO · TODO LO QUE HAY QUE TENER EN CUENTA

Pedido suyo del 13/10/2026: *"no quiero que te olvides las cosas que agregamos a cerebro (...) me gustaría que tengas
una lista de TODO lo que tener en cuenta"*. **Cada vuelta (08:52 completa · 12:52, 16:52 y 20:52 cortas) arranca
leyendo este archivo.** Cada regla nueva que él dé se agrega ACÁ en el mismo commit (además de CLAUDE.md, que tiene
la historia y el porqué). Si algo de acá choca con CLAUDE.md, manda lo más nuevo y se corrige el otro.

## 0 · Quién hace qué
- **El robot SÓLO junta datos de ML.** No decide, no sugiere, no vincula, no le avisa a él. Todo lo demás lo hago yo.
- **Él no marca nada a mano: me lo dice y lo hago yo** por comando ("Ya lo pedí", "Llegó", cajas, oficina, ancla…).
- **Nunca tomar como dato una marca vieja del robot** (escalera, liquidando automático, expediente). Dato crudo siempre.
- Él no toca precios ni promos: **no hace falta que me avise nada de eso, lo miro yo en cada vuelta.**
- Lo grande o lo que no tiene respuesta clara lo decide él: va todo junto, numerado, con (a) sugerida y (b).

## 1 · Precios (cada decisión con su motivo en el 🧠, una por variante)
- **Objetivo 25% en el PEOR caso** (retención de otra provincia 2% + el peor envío visto + cuotas) ≈ 28% en el número
  normal. Sin piso del 22%: bajar de 25% sólo con motivo y `!piso`. **Nunca abajo de 0%.**
- **Paso 0 de TODAS las vueltas:** `planilla` → sección 🛡️ → subir DE UNA al precio del 25% en el peor caso, o dejarlo a
  propósito con `!piso` (excepción anotada). Lo nuevo que nunca estuvo en Full se pone a precio antes de activarse.
- **Cada variante (color/aroma) se juzga sola**: su precio, su stock, sus ventas. Nunca el promedio del producto.
- **Subir es casi gratis, no subir es caro (regla suya del 13/10, con la Lupa 100mm vendida a $11.990 dos horas después de subirla de $7.680):** probar más caro arriesga unos días de menos ventas, que se ven enseguida y se deshacen; no probar pierde plata en CADA venta, para siempre y sin que nadie lo vea. Ante la duda, se prueba. Una sola venta no confirma nada: se juzga con plata por día cuando hay certeza.
- **Las pruebas de techo van TODAS JUNTAS, nunca por tandas (regla suya del 13/10).** En cada vuelta se pasan todas las publicaciones y a cada una que se pueda probar se le pone su precio de prueba en ese mismo momento. Las que quedan afuera es por un motivo de esa publicación (cambio reciente en medición, sin stock, sobra, escasez, techo ya encontrado), nunca porque "van en la próxima tanda".
- **La nota del 🧠 dice SIEMPRE el porqué, se toque o no (regla suya del 13/10):** *"quiero explicación clara de por qué se subió/bajó y si no se subió/bajó por qué, en ambos casos"*. Cada nota: precio y estado · último cambio con fecha, de cuánto a cuánto y su motivo · ventas 7/30 d y stock · y **HOY NO LO TOCO PORQUE …** (cambié hace pocos días y mido · sin stock · grupo de comparación · sobra stock · vende muy poco · ML en revisión) o QUÉ HICE / POR QUÉ. **Sin la frase "se mira solo, no con el resto del producto"**: ya se sabe.
- **Barrera $33.000**: se frena en $32.999 salvo que cruzar deje claramente más (`!cruza`, explicado).
- **Techo $650.000.** Variantes: se suben todas o ninguna (ML borra las que faltan).
- **`decido` mide el piso en el PEOR caso** (el mismo número de la planilla 🛡️) y lo muestra al lado del normal. Una suba
  de más del doble de una se rechaza salvo con `!salto` (un cero de más en un archivo de 110 renglones no puede pasar).
  Algo que está en un descuento mío vigente no se sube de lista (infla el tachado): salir primero con `entrarpromo:…=salir`.
- **Terminaciones 90/990** (también en lo más barato: `decido` redondea a $10, así que el "99" no se puede escribir). Cruzar $5.000/$10.000/$20.000/$50.000/$100.000 YA NO se
  frena: medido el 13/10 con `redondos` (40 subas que cruzan, 8,3%, venden ×0,60 · 83 que no cruzan, 3,3%, ×0,60), no pesa.
- **Comisión de ML con escalones** (ej. ~$15.000): antes de subir, mirar la ganancia por unidad al precio NUEVO
  (el `decido` en prueba la muestra). Subir y ganar menos no se hace.
- **La caja de compra orienta, no decide.** Perdiendo y vendiendo bien → no se baja. Full vale ~19% de precio.
- **Toda baja va primero como promo** (descuento propio, mínimo 5%, 14 días) que deje el mismo neto; recién si no se
  puede, bajar el precio de lista. Nunca subir la lista para inflar el tachado.
- **Escasez** (todas las vueltas, `escasez`): sin caja despachada se estira sin fecha, directo al precio que pienso (ML deja hasta +100% sin problema),
  techo ~×2 del normal; con caja despachada, que la última salga cerca del día 8. Nunca abajo del precio normal. Al llegar la
  caja no se vuelve a ciegas.
- **Lo nuevo que vuela se sube al toque**; venta abajo de 25% con poco stock → subir en la MISMA vuelta.
- **Productos nuevos arrancan directo a su precio final.** Y en la primera semana se mira la caja: si es de catálogo y la pierde
  (0 visitas), el precio no es el final: descuento al precio que gana la caja si deja 25%+ (caso del pedido del 21/09, 13/10).
- **Buscar el techo** (`notas/techo.md`): TODO lo que vende y no tiene techo conocido, todas juntas. **SIN ESCALONES
  (regla suya del 13/10): directo al precio que pienso que es el techo, a cualquier precio. ML deja subir hasta +100% del
  precio actual sin pausar nada** (lo del Espejo 8" fue por otra cosa, no por el precio). Juicio por CERTEZA en plata por día (Poisson: 3 esperadas y 0 = 5% azar · 6 y 0-1 =
  2% · 10 y ≤2 = 0,3%), nunca con un solo día, máximo 30 días. Afuera: escasez, sobra (+90 d), liquidando, mis promos,
  regalables antes de su fecha, frenadas por ML.
  Lo que cambió de precio en 7 días (subas del peor caso) espera los primeros juicios y entra desde el 15-16/10 en su
  SEGUNDO escalón, juzgado antes contra esa suba (decisión suya del 13/10).
- **Venta barata ≠ remate**: remate sólo si antes estuvo parado de verdad (línea de tiempo `mlapi/linea`).
- **Juzgar los resultados de precios todos los días** (08:52: `supervisor:medir:go` + `juzgo:`). Lo que perdió no se
  vuelve atrás por regla: se piensa.
- Siempre releer de ML después de cambiar un precio.

## 2 · Promos y descuentos
- **Las analizo yo, sin que él avise.** En la completa: `analizapromo` entero (eventos de ML, compartidas, cuánto pone ML,
  margen a ese precio, si ya vende bien sin promo, stock, fechas). Se entra si deja más plata.
- El guardián de cada hora saca las promos que nadie analizó; las mías viven en `cyc/promoclaude` y no se tocan.
- Las mías que vencen en 2 días: renovar o dejar terminar (sección 6 de `analizapromo:7`, también en las cortas).
- **Cupón de ML (lo paga ML entero):** no nos cuesta nada, a nosotros nos llega el precio lleno. En la web va en AZUL
  ("Descuento ML"). **Promo nuestra (pusimos plata):** DORADO ("Vendido en promoción"). Él sólo quiere seguir de cerca las doradas.
- **Medir si una promo activa la venta**: plata por día antes vs durante, igual que el techo. Primera oportunidad
  grande: **CyberMonday 02/11**. No suponer que la promo vende más (Halloween 9-10/10: 3 con cupón y 2 sin, al mismo precio).
- En el `resumen:` de cada cerebro, una línea con las ventas en promo de la vuelta (cuántas, cuánto puso ML, si pusimos nosotros).
- Fechas y eventos: sección 14/14b del `informe` y `eventos`. El ×1,4 de lo regalable NO está confirmado: mirar lo que vende de verdad.

## 3 · Pausadas, publicaciones, vínculos
- **Activar lo pausado es PRIORIDAD** en todas las vueltas (`pausadas:25` + `activarfull:go:25`). Lo que no se activa
  va al `pregunto:` con motivo y propuesta. Nunca pausada en silencio.
- Publicaciones nuevas sin ficha: las vinculo yo (`vincular`). Él crea la publicación en ML; yo la ficha y el vínculo.
- Frenadas por ML (`under_review`, documentación): no se puede tocar precio; si hay que arreglar algo en ML, se le avisa.

## 4 · Ventas y preguntas
- **Ventas una por una** en cada vuelta (`ventasraras`): lo de una sola vez (retención de provincia, cuotas, carrito)
  no toca el precio; si el precio de hoy ya no deja lo que creíamos, se decide.
- **Preguntas:** contesto las que sé SIN DUDA (`contesto:`), cortas, sin teléfonos/links. Las demás, a él. Nada de más de 7 días.
- Reclamos con ⏰ que esperan respuesta suya: recordarle una vez por día como mucho.

## 5 · Pedidos, cajas, Paraguay
- **Pedidos COMPLETOS, todo el catálogo**, en la completa (`pedidostodo` → `decide_pedidos.py` → revisar → `decido:archivo=pedidos`).
  Objetivo 30 días. El stock de las 4 cuentas va SUMADO. Lo que se pide sin ventas recientes se mira en la línea de tiempo.
  El ritmo es por día CON stock (`dCS`, también por color). Sin costo cargado no se pide (va a la lista "venden y no tienen
  costo"). El precio para el máximo de compra es la mediana de lo cobrado en 60 días (no el subido por escasez). Si el log
  dice "NO LEÍ" o el script dice "NO CIERRA", no se carga nada: se vuelve a correr.
- **Cajas:** `decide_cajas.py` lee del mismo log de `pedidostodo` a qué cuentas se le puede mandar (`ctas [..]`: publican,
  sin `nomandar`, más `pasara`). Si puede ir a más de una, sale en "decidir a mano": lo decido yo mirando `cajasnotas`.
- **Los motivos de Pedidos los lee Tito**: arrancan con "Hola Tito!", cortos y en criollo.
- **Cajas:** marco yo las que ML dio por entradas (`cajallego`). Decido cuántas mandar (`decido:caja`): **30 días de venta + 7 de viaje = 37 días desde hoy** (regla suya del 14/10),
  cuenta en cero recibe el mínimo salvo que otra cuenta tenga stock de ese color. Costo de la caja: $17.310.
- **Almacenamiento de Full: lo chico paga a los 4 meses (120 días) parado; los Tenders (grandes) a los 60** (dicho por él el 14/10). Nada se manda para más de 37 días, así que una caja nunca llega a pagar sola.
- Caja para mandar ya → al `pregunto:`.
- **Paraguay:** el ticket real es obligatorio para cerrar un pedido (`compray:<fecha>|det=…|go`). Gastos de cada pedido:
  dólares (ticket ×1,005 del cambista + US$ 3,80 de la red), el que retira y despacha, correo (monto y kilos).
  Pedido viejo sin datos: `compray:…|sinpesos|go` y lo que falta se le pide. Con los gastos del próximo pedido se
  re-evalúa el recargo del 17% (medidos: 19,9% y 22,4%). Precios y códigos sólo de comprasparaguay (nunca nissei.com).
- Al llegar un pedido: ficha (costo pagado ×1,17), cuenta según rubro (perfumes → Adriana) y equilibrio, vínculo.

## 6 · Plata
- **El 1º de cada mes cargo el retiro** ($1.800.000 hasta que él diga otra cosa).
- Gastos del mes que se cargan a mano: la lista de Gastos dice qué falta; recordárselo a fin de mes.
- Lo que se cobra en el mes que viene: la ganancia real del mes ÷ 3 (CYC, él y su papá).

## 7 · Telegram y resúmenes
- `pregunto:` SÓLO decisiones suyas o cosas que tiene que hacer con las manos. Nunca "subí/bajé/activé".
- `resumen:` en cada cerebro: la completa SIEMPRE (6-10 renglones), las cortas sólo si cambiaron o descubrieron algo.
- Sin datos de compradores ni números de orden en nada que se publique (el registro es público).

## 8 · Cada vuelta busca algo nuevo
- Mirar el negocio como dueño: dónde se pierde o se gasta plata que nadie mira. Lo chico se hace; lo grande se
  propone con números y (a)/(b). Anotado en `notas/ideas.md` para no repetir. Si no aparece nada, no se inventa.

## 9 · Al cambiar algo del sistema
- Anotarlo en `ml-sync/REVISION.md` en su etapa, en el mismo commit. Subir a las dos ramas (la de la sesión y
  `claude/add-folder-78ysyb`). Web: subir `APP_VERSION`, `APP_CAMBIOS` y `CACHE` de `sw.js` (y que `sw.js` no quede vacío).
- Workflows: mirar opciones repetidas en un paso antes de subir.

## 10 · Pendientes vivos (se borran al cerrarse)
- Paraguay 08/10: falta sólo el correo (monto y kilos). Paraguay 08/09: pesos de los dólares, ticket, retira, correo.
  Transferencia de $50.000 del 29/09: preguntar de qué es.
- Paulvic del 06/10 (40 u.): al llegar, `pvped:llego`, rehacer la cuenta con el flete y ofrecer `poncosto`.
- Idea propuesta: probar un Paulvic de hombre a ~$17.990 después del Día de la Madre (escalón de comisión de $15.000).
- Medir promos en el CyberMonday 02/11.
- Descuentos del 13/10 (Tendedero, Ferrari Rojo, Pendrive 16gb, Centímetro Blanco, Mercedes, Corsair, Pokémon, Adyan): ML los
  aceptó pero no se veían al releer. Confirmar en la vuelta de las 12:52 que estén puestos y juzgarlos a los 7-14 días.
- Tarifa de almacenamiento (`almactarifa`) sigue sin pasarla él.

## 🔍 LA LUPA: CADA PUBLICACIÓN, TODOS LOS DÍAS (13/10/2026, pedido suyo)
Él: *"todos esos pequeños detalles diarios, casi milimétricos (…) en TODOS los productos (…) necesito ese nivel de detalle"*.
En la completa de las 08:52 y en cada corta: `lupa` por ml-consulta (solo lee). Por cada publicación con stock o ventas:
últimos 7 días con stock contra los 30 anteriores (ritmo, ganancia por unidad, plata por día, días sin vender, caja, precio).
Cada 🚩 se mira con la línea de tiempo y se decide (o se anota por qué no se toca). La caja perdida sola no es motivo.
Línea de tiempo: el ▾ ámbar = ese día se cobró menos sin cambiar el precio (promo/cupón, carrito o color más barato).
- **Escasez y pedidos (13/10):** subir por escasez frena las ventas a propósito; para COMPRAR manda el ritmo de antes de la suba. En `decido` el motivo de una suba por escasez dice "escasez" (así `pedidostodo` la marca ESC).
- **Motivos de `decido` con la causa en palabras (13/10):** escasez · techo/prueba · peor caso 25% · caja · remate/liquidar · vuelvo (no funcionó). De eso sale el color de la flechita y el ritmo de compra.

## ✍️ CADA DECISIÓN DE PRECIO SE EXPLICA EN 4 PARTES (13/10/2026, regla suya)
Él: *"quiero que diga algo como 'subí el producto para probar el techo de x a y, lo que espero ver es tal cosa, y si no pasa
eso espero tantos días o haré tal cosa'"*. Todo motivo de `decido` (y toda nota del 🧠 de precio) lleva:
1. **QUÉ HICE:** de $X a $Y (+N%).
2. **POR QUÉ:** el tipo con su palabra (techo/prueba · escasez · peor caso 25% · caja · remate/liquidar · vuelvo) y el dato que lo dispara.
3. **QUÉ ESPERO VER:** en números (cuántas ventas por semana, cuánto deja por unidad, plata por día).
4. **SI NO PASA:** cuántos días espero y qué hago (volver a $Z, bajar, promo, otro escalón).
Sin `;` adentro. Al revisar una decisión vieja, se escribe la nota con lo que pasó contra lo esperado.

- **Cajas a 60 días sólo en lo parejo (14/10/2026, eligió la a):** 37 días de base; 60 si vende parejo hace 2 meses y no tiene prueba de precio abierta (`notas/sin_estirar.txt`, mantenerla al abrir o cerrar pruebas). Respetar el cupo de la cuenta.
