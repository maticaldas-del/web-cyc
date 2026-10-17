# 🧠 CEREBRO · TODO LO QUE HAY QUE TENER EN CUENTA

Pedido suyo del 13/10/2026: *"no quiero que te olvides las cosas que agregamos a cerebro (...) me gustaría que tengas
una lista de TODO lo que tener en cuenta"*. **Cada vuelta (08:52 completa · 12:52, 16:52 y 20:52 cortas) arranca
leyendo este archivo.** Cada regla nueva que él dé se agrega ACÁ en el mismo commit (además de CLAUDE.md, que tiene
la historia y el porqué). Si algo de acá choca con CLAUDE.md, manda lo más nuevo y se corrige el otro.

## 📂 PASO OBLIGATORIO DE LA COMPLETA (08:52): EL EXPEDIENTE, PRODUCTO POR PRODUCTO, PENSADO (16/10/2026, eligió la b)
Él: *"quiero que sea 'vivo' el pensamiento, que gaste tokens, no que sea mecánico, sino que sea como que te lo pregunte por
acá (…) así todos/todo. pero fijate siempre que sea coherente, si no es un exceso de gastar tokens"*. Las reglas de este
archivo son AYUDA, no la decisión: si sólo se siguen las reglas, lo que nadie previó no lo ve nadie.
 1. Correr `escasez:expediente` por ml-consulta y leer el log ENTERO (scratchpad, en pedazos). Trae, por producto × cuenta
    (y color): stock en Full / camino / oficina, días que alcanza, cuánto tarda en volver a haber y en poder comprar, ventas
    14/30 días y últimos 3, cada publicación con precio de hoy vs al que vendía, caja, margen aprox y mi promo, mi última
    decisión con su motivo, y lo decidido de pedido y caja. Entran los que se movieron (vendieron o cambió el stock en
    2 días, escasez, una decisión mía de precio en 7 días) y un tercio del resto por día: nadie pasa 3 días sin
    mirarse (`escasez:expediente:todos` = todos).
 2. Por CADA bloque, pensar como si él me preguntara por el chat: ¿lo que está hoy (precio, promo, pedido, caja) sigue
    teniendo sentido con todo esto? ¿qué cambió desde mi última decisión? ¿hay algo raro que ninguna regla nombra? Mirar la
    línea de tiempo (`lupa`, `historia`, `porquebajo`) sólo cuando el bloque no alcanza para decidir.
 3. Escribir un juicio por bloque en el 🧠 (`decido:<MLA>=nota|…` o el cambio con su motivo): QUÉ HAGO o POR QUÉ NO HAGO NADA
    HOY, con los números de ese bloque. Nada de "sin cambios" pelado. Muchas notas: `ml-sync/notas/expediente_<fecha>.txt` y
    `decido:archivo=…;go`.
 4. COHERENCIA, para no gastar de más: si un bloque no cambió nada desde el juicio anterior (mismo stock, mismo ritmo, mismo
    precio, ninguna decisión vencida), alcanza con renovar el juicio en una línea; el pensamiento largo va donde algo se movió.
 5. En el chat cerrar con: "expediente: N mirados · C cambié · S sigue igual con motivo · R raros (qué)".

## 0 · Quién hace qué
- **El robot SÓLO junta datos de ML.** No decide, no sugiere, no vincula, no le avisa a él. Todo lo demás lo hago yo.
- **Él no marca nada a mano: me lo dice y lo hago yo** por comando ("Ya lo pedí", "Llegó", cajas, oficina, ancla…).
- **Nunca tomar como dato una marca vieja del robot** (escalera, liquidando automático, expediente). Dato crudo siempre.
- Él no toca precios ni promos: **no hace falta que me avise nada de eso, lo miro yo en cada vuelta.**
- Lo grande o lo que no tiene respuesta clara lo decide él: va todo junto, numerado, con (a) sugerida y (b).
- **Stock antiguo** (14/10, reforzado 16/10 por él: *"resolver el problema de raíz… con una simple revisión te darías cuenta
  que hay que bajarlo porque está pagando stock"*): el `escasez:expediente` trae arriba de todo **💸 PAGA O VA A PAGAR STOCK
  ANTIGUO**, COLOR POR COLOR (ML cobra por código de Full), con la misma cuenta que `antiguo`, aunque venda poco. **Cada renglón
  que diga SIN DECIDIR se decide en esa vuelta** (promo/remate para que salga antes del cierre, retirar, o por qué se deja,
  con su número en el 🧠). Nunca subirle el precio a algo que paga stock antiguo sin decir por qué. Lo recién llegado sin
  ventas no se proyecta.
- **Varios comandos en UNA corrida** (14/10): en `comando` (ml-consulta) o `billing_probe` (ml-sync) van uno por renglón.
  Las lecturas de la vuelta (planilla, informe, pedidostodo, escasez, ventasraras…) van juntas en una sola ml-consulta, y
  las escrituras juntas en una sola ml-sync. El registro los separa con `##### <comando>`.
- **Gasto de Full del mes** (14/10, él eligió que lo cargue yo): en la completa del día 15 de cada mes (o la primera
  después) corro `cargosmes` por ml-consulta para mirar y `cargosmes:<AAAA_MM>:go` por ml-sync para cargarlo (el período de ML de un mes va como gasto del mes SIGUIENTE: el de septiembre en octubre) (almacenamiento
  + stock antiguo + retiro/descarte + multas, de la factura de ML de cada cuenta). Ya no hace falta que él me pase el reporte.
- **Las notas de Pedidos y Armar caja ahora se ven en la tarjeta** (sin tocar 🧠): escribirlas cortas, la primera frase
  es lo que se lee en dos renglones.

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
  SIN techo ×2 desde el 16/10: arranca alto y baja en escalera (ver 🪜 abajo); con caja despachada, que la última salga cerca del día 8. Nunca abajo del precio normal. Al llegar la
  caja no se vuelve a ciegas.
  **Qué es escasez (15/10, regla suya): no son 15 días fijos.** Es que se corta ANTES de que vuelva a haber: caja despachada →
  lo que le falta · oficina → ~10 d · si no, comprar (`cyc/reponer`: pedido en camino, Paraguay 17 d + espera, precio que no
  da o Nissei sin stock = SIN FECHA). `escasez` lo marca 🔥 por fila (Full o "de compra"). Lo sin fecha se estira aunque tenga 20 días.
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
- Las ventas en promo de la vuelta (cuántas, cuánto puso ML, si pusimos nosotros) se cuentan en el chat (el `resumen:` por Telegram se sacó el 16/10).
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
- **Paraguay se pide de a ~US$1.000, cada 2-3 semanas** (14/10/2026, eligió la a): cada pedido paga ~US$68 fijos (el que
  retira, la transferencia, el correo), o sea ~21% arriba de la web con US$500 y ~14% con US$1.000. Lo que no es urgente
  espera al próximo pedido grande; lo que se corta antes de que llegue (rojo o naranja de Paraguay) se pide igual.
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
- **Lo que NO SE CONSIGUE MÁS no se pide nunca** (`ml-sync/notas/juicios.txt` con 0). Dicho por él: los **De la Patagonia**
  (las 3 fichas, 14/10). Lo que queda se vende **a precio lleno, sin descuentos**, mientras haya tiempo antes de que Full
  cobre almacenamiento (120 días desde que entró). Regla suya del 14/10: *"al no haber más, ¿por qué lo dejamos barato?
  tenemos tiempo para venderlo antes de pagar por stock"*. Recién cerca de esa fecha se piensa bajar.
- **Gasto nuevo de Paraguay (14/10):** adelantar plata de "a liquidar" de MP para comprar los dólares cuesta (el 14/10, $29.000):
  va como `adelanto=` del pedido (renglón propio, 15/10; antes iba en `otros=` y se mezclaba con el cambista). **No es un gasto
  fijo** (él, 15/10: *"fue sólo para ese pedido, puede pasar de nuevo, pero normalmente no"*): no se pide en cada pedido ni frena el
  cierre; se carga sólo cuando él avisa que pasó. Lo que pagó de más el cambista sobre el ticket va en `cambio=`.

## 6 · Plata
- **El 1º de cada mes cargo el retiro** ($1.800.000 hasta que él diga otra cosa).
- Gastos del mes que se cargan a mano: la lista de Gastos dice qué falta; recordárselo a fin de mes.
- Lo que se cobra en el mes que viene: la ganancia real del mes ÷ 3 (CYC, él y su papá).

## 7 · Telegram y resúmenes
- Regla suya del 16/10: *"que lleguen cosas más importantes. sino nada. o algo que tenga que decidir"*.
- `pregunto:` SÓLO decisiones suyas o lo IMPORTANTE que sólo puede hacer él y cuesta plata si no lo hace (reclamo que
  espera su respuesta, ML frenó algo que vende, algo que vende fuerte en 0 en Full con mercadería en la oficina, costo que
  falta en algo que se vende). NO: preguntas sin contestar, cajas "para la próxima", ideas chicas. Nunca "subí/bajé/activé".
- `resumen:` YA NO SE MANDA (se sacó el 16/10), en ninguna vuelta.
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
- Descuentos del 13/10 y 14/10: CONFIRMADOS puestos (vencen 26-29/10), se juzgan desde el 20/10. El Asher quedó sin descuento a propósito (De la Patagonia a precio lleno).
- Tarifa de almacenamiento (`almactarifa`) sigue sin pasarla él.
- **Dinero que rinde en MP (idea 11):** lo revisa él en la app de cada cuenta.
- **Completa del 17/10 (eligió 2a el 16/10):** revisar los 4 perfumes Cuba de Adriana (Prestige Platinum $50.000, Blue $45.000, Gold $67.174, Prestige Classic $50.000; nunca vendieron, 2 u. cada uno): costo de la ficha contra el margen aprox de 98-169%, precio contra la competencia de catálogo, terminación 90/990. Juicio en el 🧠 de cada uno.
- **9 pedidos puestos en 0 el 16/10 (eligió 1a)** por no poder reponerse (Ferrari Negro, Halloween Kiss Sexy y Kiss, Ted Lapidus Rumba, Cool Water, Sony ZX310, SSD 1TB, Buds Core, VS STARLIT Bare Vanilla): si vuelve Nissei o baja el precio, se vuelven a pedir; cuando entre stock, regla ⏳.

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
Sin `;` adentro. **Nunca repetir oraciones** (regla suya del 14/10): la nota no copia el motivo de otro cambio que ya se ve. Al revisar una decisión vieja, se escribe la nota con lo que pasó contra lo esperado.

- **Cajas a 60 días sólo en lo parejo (14/10/2026, eligió la a):** 37 días de base; 60 si vende parejo hace 2 meses y no tiene prueba de precio abierta (`notas/sin_estirar.txt`, mantenerla al abrir o cerrar pruebas). Respetar el cupo de la cuenta.

## 🇵🇾 CUÁNTAS DE CADA PRODUCTO NUEVO DE PARAGUAY (15/10/2026, eligió la a)
Ya no son 2 de todo. El botón 🪄 Llenar hasta el tope (`candMaxU` en index.html): **barato (hasta US$15 crudo) con 100+ vendidas
en ML y 5 vendedores o menos → 3 (4 si tiene 300+ vendidas) · caro (más de US$60) → 1 · el resto → 2** (la casilla). Lo que
vuela (se agota rápido) entra en el pedido SIGUIENTE con unidades según sus ventas: eso lo decido yo con `pedidostodo`.
Medido antes: del pedido del 21/09, 1 de 12 se agotó rápido (ZX310) y 10 no vendieron nada en 17 días.

## ⏳ SIN REPOSICIÓN: ESTIRAR Y SACAR LA MAYOR PLATA EN 4 MESES (16/10/2026, regla suya)
Él, sobre lo que se agota y no se puede reponer (Nissei no lo tiene, o el precio de Paraguay no deja el %): *"lo mejor seria
una combinacion entre esperar lo maximo posible y maximizar ganancia lo maximo posible en los 4 meses de stock que tenemos.
pero si o si en los 4 meses hay que vender todo. siempre esperando a que se pueda pedir en nissei"*.
 · Se aplica a todo lo que `escasez`/`reponerDe` dice "sin fecha" (Nissei no lo tiene · el precio no da · **Bs As sin nada en la oficina**, regla del 16/10).
 · Con stock fijo, la plata máxima es vender TODO al precio más alto que todavía lo vacía en ~4 meses: el ritmo objetivo es
   (Full + camino + oficina) ÷ ~100 días (colchón contra los 120 en que Full cobra almacenamiento). Si vende más rápido que
   eso, subo; si vende más lento y no llega a vaciarse en 120 días, bajo. Directo al precio que pienso (sin escalones),
   nunca abajo del precio normal de antes, frenos de siempre (barrera $33.000, techo, variantes).
 · Cada vuelta se mira si Nissei volvió a tenerlo o el precio ya da: ahí deja de ser "sin reposición" y vuelve a la regla normal.
 · Y SI APARECE MERCADERÍA NUEVA (16/10, pregunta suya: "si lo consigo por otro lado y aparece en mi oficina, ¿vuelve para
   atrás?"): en cada vuelta comparo oficina + camino contra la vuelta anterior. Si subió sin un pedido de Paraguay que lo traiga,
   (1) la cuenta de los 100 días se rehace con el stock nuevo (más stock → el precio que lo vacía es MÁS BAJO, así que baja solo,
   nunca abajo del normal) y (2) le pregunto si ese proveedor sirve para volver a comprar: si sirve, deja de ser "sin reposición"
   y vuelve a la regla normal (precio normal, o escasez si Full se corta antes de que llegue la caja).
 · Lo que tiene 1-2 unidades no se toca más (ya está arriba): no hay ritmo que medir.

## 💰 MÁXIMO DE COMPRA POR COLOR (16/10/2026, eligió la 1a)
`decido:ped:<id>#<color>=venta|<precio>|motivo` guarda el precio de venta de ESE color (`claudedecide/ped/<id>/pvVars`); el
máximo de ese color sale con el margen de su publicación (`cyc/netopub`). El precio es el que el color sostuvo 2+ semanas con
stock, nunca uno de escasez ni de la primera semana de una prueba de techo. Lo pongo en las vueltas de pedidos cuando los colores
se venden a precios distintos (si no, alcanza el del producto).

## 🔴 ESCASEZ = ROJO, Y SE TRATA COMO ESCASEZ (16/10/2026, regla suya)
*"escasez significa lo mismo siempre (…) en este caso no tenemos fecha siquiera para recuperar stock, va en rojo (…) agrandar el
% de ganancia lo máximo posible"*. Lo que se termina antes de poder reponer, o lo que NO se puede reponer, es escasez: precio
para la mayor ganancia que vacíe el stock a tiempo (sin reposición: en ~100 días, nunca más de 120). Si vuelve a poder
comprarse con 25%, deja de ser escasez solo (naranja/amarillo) y el precio se vuelve a pensar.

## 🔁 TODA DECISIÓN TIENE SU SALIDA (16/10/2026, pedido suyo)
Él: *"si eso no te lo decía yo, ¿te ibas a dar cuenta? puede haber cosas que yo no me di cuenta, no te expliqué, no hay regla
para eso y vos no lo mirás. me gustaría que esté controlado"*. Respuesta honesta: no, no me iba a dar cuenta: las decisiones
viejas sólo se revisaban si una regla las miraba.
 · **En cada vuelta**, el final de `escasez` lista **🔁 mis subas por escasez o sin reposición cuya razón cambió** (ya no se
   corta, ya se puede reponer, entró mercadería nueva, no se vacía en 4 meses, casi no vende). Cada renglón se decide de nuevo.
   Las pruebas de techo ya tienen su control (`lupa`); las bajas, promos y remates todavía no (ver REVISION.md).
 · **Regla para todo lo nuevo:** al crear una regla que cambia un precio o un pedido, escribir también QUÉ la deshace y dónde
   se mira. Si no tiene salida, no está terminada.

## 📦 LAS CAJAS SE DECIDEN EN CADA COMPLETA, NO SÓLO LOS PEDIDOS (16/10/2026)
El 16/10 corrí `decide_pedidos.py` y me salteé `decide_cajas.py`: quedó la decisión del día anterior ("no mandar" del Protector
talón Común Beige, cuando las 18 todavía se estaban armando) y Armar caja no recomendaba mandar algo en escasez de Full con 13
en la oficina. Él lo marcó. En la completa de las 08:52 van LOS DOS scripts sobre el mismo log de `pedidostodo`, y
`decido:archivo=pedidos;go` + `decido:archivo=cajas;go`. Y todo lo que el expediente marca "🔥 Full se corta antes" con
mercadería en la oficina se mira contra la caja decidida.

## 🛡️ APENAS ENTRA EN ESCASEZ, SE PROTEGE HASTA QUE LLEGUE LA CAJA (16/10/2026, regla suya)
Él, viendo que lo subido por escasez se siguió vendiendo: *"me encantó eso (...) quiero que sigas así, y cuando un producto
entre en escasez, ahí nomás lo trates como tal y protegerlo hasta que calcules cuántos días aprox va a tardar en llegar la
próxima caja a Full"*.
 · En CADA vuelta (las 4 del día), todo lo que el expediente marca 🔥 por primera vez se trata en ESA vuelta: no espera a la
   completa. "Ahí nomás" = la próxima vuelta (el robot no toca precios, así que lo más rápido son ~4 h).
 · Para cada uno se calcula cuándo llega la próxima caja a Full: caja despachada ~8 d desde el despacho · en la oficina sin
   despachar ~10 d (y se pide mandarla en Armar caja) · hay que comprar: Paraguay ~16 d · **Bs As se da por repuesto (~1 semana + caja)** salvo que Pedidos lo pida hace 10+ días sin que entre nada a la oficina: ahí "no se consigue" = sin reposición (eligió 1b el 16/10; "oficina en 0" solo hacía un bucle). La escasez se mide SIEMPRE con el ritmo normal, no con el de después de una suba (2a) · sin
   reposición: estirar para venderlo en ~100 días (regla ⏳). El precio se pone para que la última unidad salga cerca de ese día.
 · Se sigue mirando en cada vuelta: si con el precio nuevo vende más rápido de lo pensado, se sube otra vez; si se frenó del
   todo, se baja de a poco. Nunca abajo del precio normal. Al llegar la caja se juzga con la línea de tiempo (no se vuelve a
   ciegas).
 · Y en la misma vuelta se mira Armar caja: si hay mercadería en la oficina de ese producto, se decide mandarla.

## 🎯 AL LLEGAR LA CAJA: EL MEJOR PRECIO ENTRE EL DE ESCASEZ Y EL NORMAL (17/10/2026, regla suya, eligió la a)
Él: *"si el precio está entre los dos? como lo sabes? quizás lo mejor es un poquito menos del precio de escasez"*.
Cuando termina la escasez no se elige entre dos puntos (escasez o normal): se BUSCA el mejor en el medio.
 · Si al precio de escasez sigue dejando igual o más plata por día que con el normal, se queda (como siempre).
 · Si deja menos: NO se vuelve directo al normal. Se baja al punto del medio entre los dos, **arrancando por el tramo de la
   escalera que más plata por día dejó** (los tramos están en la ficha médica de cada publicación; ojo, en escasez la gente
   compra apurada, así que esos números salen algo inflados: sirven para elegir por dónde arrancar, no para decidir).
 · Cada paso se mide con la misma vara de certeza que el techo (Poisson, nunca un solo día, manda la plata por día con stock
   normal): si deja más que el normal, se queda y se prueba un paso más cerca del de escasez; si deja menos, un paso más cerca
   del normal. En 2-3 pasos queda el mejor. Cada baja, primero como promo.
 · Lo encontrado va a `notas/techo.md` como el precio de esa publicación con stock normal.

## 🪜 ESCASEZ: ARRANCAR MUY ALTO Y BAJAR EN ESCALERA (16/10/2026, regla suya, eligió 1a 2b 3a)
Él: *"probemos más del 100% de lo que se vende (...) quizás algo que vendemos por 5.000 podemos venderlo a 25.000, no lo
sabemos (...) es gratis subir precio"* y *"vas bajando en escalera, si no vende o si nos pasamos de escasez a sobrestock"*.
Por qué: en escasez lo que no se vende antes de la caja se vende después al precio normal; subir de más casi no cuesta, quedarse
corto sí. **Se saca el techo ×2** (queda sólo el de $650.000).
 · **Primer salto (1a), según cuánto vendía ESA publicación con stock:** 3+/día → ×4 · 1 a 3/día → ×3 · menos de 1/día → ×2 ·
   menos de 1 cada 2 días → ×1,5 fijo, sin escalera.
 · **Escalera:** si no vende, baja 25% a las 12 h (3+/día) · 20% a las 24 h (1-3/día) · 15% a los 2-3 días (menos de 1/día).
   Si vende más rápido de lo que hace falta para llegar a la caja, sube un escalón. Nunca abajo del precio normal.
 · **A qué productos (2b, con su aclaración):** *"no vayamos con todos, los que tiene sentido subir. los que ya sabemos que no
   funcionan más arriba no"*. Va de una para todo lo que está en escasez y tiene sentido, MENOS: lo que ya falló una suba y
   volví (techo conocido en `notas/techo.md`: Naipes Casino, Centímetro Blanco/Gris, Pendrive 8gb, Infusores, Metatarso,
   Filtros, Chispero, Rebarbador, Pizarras… y lo que se frenó después de una suba), lo que tiene variantes que no se pueden
   subir solas, liquidando y mis promos. Ésos van con el precio que pienso, sin ×3/×4.
   **La caja de compra NO frena la escalera** (corrección suya del 16/10: *"ya dijimos que perder la caja no quiere decir no
   vender"*): de catálogo con competidor con stock también sube; lo que decide son las ventas a ese precio, no la caja.
 · **Barrera $33.000:** se cruza sólo si cada unidad deja más con el envío (~$6.200) restado. Comisión de ML al precio nuevo
   mirada con el `decido` en prueba (escalones de comisión).
 · **Salida:** cuando la escasez se termina (llegó la caja) o pasa a sobrar (el stock dura más que la caja + margen, o quedaría
   con más de 90 días), se baja: primero como promo (PRICE_DISCOUNT), si no con `decido`. Al llegar la caja se juzga con la
   línea de tiempo: si a ese precio sigue vendiendo y deja más, se queda.
 · **Riesgo vigilado:** ML nunca nos pausó hasta el doble; más arriba no se probó. En cada vuelta se mira si alguna quedó frenada
   por ML (`informe`, frenadas) y si pasa, se vuelve al último precio que ML aceptó y se anota.
 · **Medir:** `escmedir` en las completas; el techo encontrado de cada una va a `notas/techo.md`.
 · **Cómo se juzga (16/10, él con el Barbarella):** una suba por escasez NO pierde plata por vender menos: lo que no se vende
   en esos días se vende después. Cuenta sólo lo cobrado de más. La única pérdida real es que llegue la caja y quede stock caro
   que al precio normal se habría vendido: por eso, cuando AL RITMO NORMAL (el de antes de la suba) el stock alcanza hasta la
   caja, vuelve al precio normal para que la última salga cerca del día que llega (lo marca el 🔁 de `escasez`).
 · **Fuera de escasez (3a):** buscar el techo con saltos de +30 a +50% y, si funciona, otro salto (la escalera alta es sólo escasez).

## 📋 LA FICHA DE CADA PUBLICACIÓN SE ABRE ANTES DE DECIDIR (16/10/2026, regla suya, eligió 1a 2a 3a)
Él: *"cada vez que hacés un análisis abrís eso y tenés todo"*. Antes de tocar el precio de una publicación miro su ficha:
la línea `📋 ficha:` del expediente y de `escasez` (lo que no rindió y hasta cuándo, el mejor precio medido, la prueba en curso)
y, si hace falta el detalle, `ficha:<MLA o palabras>` por ml-consulta (cada cambio con su resultado, cada precio que tuvo
con su ganancia por día, mis notas). **Un precio que no rindió no se repite hasta que cambie la razón** (ver 🔓 abajo; máximo 30 días), salvo que
cambie algo grande (escasez, fecha de regalo, competidor sin stock o más caro, costo nuevo) y lo digo en el motivo. Si ya
venció, se puede volver a probar. Él ve lo mismo tocando "📋 Ficha completa" en el 🧠.

## 🔬 EL ANÁLISIS A FONDO: LAS 11, "LO QUE RECOMIENDES" (16/10/2026, eligió la (a) en todas)
Él: *"podemos hacer un análisis en profundo para ver si hay algo más que podamos hacer para hacer rendir al máximo a cada
producto?"* y, con la lista, *"lo que recomiendes"* en las 11. Cada una, en cada vuelta:
1. **Bs As que se corta: 45 días.** `decide_pedidos.py` compra para 45 días lo de Bs As que se cortó 2+ veces en 60 días
   (`cortes N` de `pedidostodo`), vende 0,5+/día y deja 25%+; y lo nuevo que vuela (1+/día en su primera semana). Resto, 30.
2. **Pendrives como familia.** Se juzgan por la plata por día del GRUPO (8/16/32/64/128 de Matías), no de a uno. El de 32 GB
   (se repone) es "el conveniente": el precio más tentador de la escalera. 8 y 16 (no se reponen, ⏳) pueden quedar más
   caros que el de 32 a propósito: así la compra se va a la que se repone y las que no se reponen duran sus 4 meses.
3. **Paulvic.** Pedido fijo cada 15 días, por aroma, para 45 días de su ritmo (`pvped`). Al juzgar la prueba de $21.990
   (19-20/10): si pierde, volver a **$14.950**, no a $14.360 (abajo del escalón de comisión de $15.000 deja más). Si gana,
   la primera a extender es Persea (Luciana, la que más vende).
4. **Las visitas cortan antes una prueba de precio mala.** En el techo/lupa: si las visitas de 3 días cayeron a la mitad
   o menos de las de los 14 anteriores **y** cambió la caja, se vuelve en esa misma vuelta, sin esperar las ventas. Siempre
   con una hermana sin cambio como control (si la hermana también cayó, es la temporada).
5. **Stock antiguo.** Lo que paga o va a pagar stock antiguo (`antiguo`, ahora también con las ventas de 30 d) es excepción
   del 🛡️ 25% y no entra en buscar el techo: se le pone descuento propio (`!piso`) para vaciarlo antes del cierre. "Sobra"
   = Full + oficina + camino en todas las reglas. Antes de retirar algo de Full, comparar el retiro contra rematarlo al 0%.
6. **Una suba no se deshace por casualidad.** En lo que se compra de a muchos se cuentan COMPRADORES (no unidades) y se
   esperan 7 días como mínimo, salvo certeza fuerte (Poisson) o el corte por visitas del punto 4.
7. **Lo barato: piso en pesos.** Al reponer o tocar algo de hasta ~$5.500, cada unidad tiene que dejar ~$1.000 o más de
   ganancia (el cargo fijo de ML ~$1.230 se lleva más que nosotros). Si no, subir (de una, regla del 13/10) antes de que entre la caja.
8. **Premium que gana la caja se queda en Premium** (Ferrari Rojo, Dalí: la gemela Clásica vendió 0). Una Clásica gemela
   nunca al precio de su Premium. Cuando ganar la caja pide bajar más de ~17%, conviene probar un gemelo Premium (lo crea él).
9. **Visitas que caen sin cambio de precio** (Adaptador Universal de Ayelen 21→7/día): mirar preguntas sin responder y la
   descripción; eso lo arregla él en ML y se le pasa en el `pregunto:`.
10. **Lo que vuelve de agotado** se compara contra el ÚLTIMO tramo con stock de su línea de tiempo (no contra 30 días en
    cero): así entra en el techo y en la lupa.
11. **Lista de Tito: "SÓLO estos colores, si no hay no reemplazar"** (lo agregan `decide_pedidos.py` y el 📋 Copiar pedido).

## 🌎 VENDEDORES DEL EXTERIOR (16/10/2026, regla suya)
No se miran (los saca `esOfertaDeAfuera`), salvo que no haya ningún vendedor de acá: ahí se mide contra el de afuera con su precio +20% (`RECARGO_INTER`), porque el comprador espera ~10 días.

## 🏷️ UN DESCUENTO POR "SOBRA STOCK" SE MIDE CON DÍAS CON STOCK (16/10/2026, error mío marcado por él)
Él, con el Ferrari Rojo vendido al 14% con descuento propio: *"tenemos stock justo y bastante tiempo para los 4 meses"*.
El 13/10 le puse descuento creyendo que sobraba, pero la mercadería había entrado el 08/10: 5 días con stock no dicen nada.
Regla: antes de un descuento por sobrestock, (1) 30+ días con stock desde la última entrada y (2) días de stock (Full +
oficina ÷ ritmo con stock) arriba de ~100. Si no, no se descuenta. Ferrari Rojo: 17 u., ~7/mes = ~70 días → se sacó el
descuento ($63.890 → $70.990). Revisadas las otras del 13/10: Tendedero (13 u., 58 días en Full, ya paga almacenamiento)
queda con descuento; Centímetro y Pendrive 16 no tenían.

## 🏬 BS AS NO SE DA POR REPUESTO (16/10/2026, regla suya)
Él: *"vos ahí estás pensando que en Bs As vamos a traer. pero a veces no se consiguen por meses. entonces lo de Bs As mirá si
hay en la oficina, si en la oficina no hay tomalo como en Paraguay cuando no hay stock o no da el % de ganancia"*.
Para escasez y precio: lo de Bs As con unidades en la oficina → la reposición es mandar esa caja (~10 d). Sin nada en la
oficina → sin reposición (regla ⏳): precio para vender lo que hay en ~100 días, al más alto que lo vacía.
Aclaración suya del mismo día: *"más importante que la escasez son los 4 meses para pagar. nunca tenemos que llegar a pagar
por stock"*. O sea: aunque haya stock para 1 mes, sin nada en la oficina se trata como escasez, y el techo de todo es vender
lo que hay antes de que Full cobre almacenamiento (~120 días; se apunta a ~100).

## 🏷️ CADA PRECIO LLEVA SU ESTRATEGIA (17/10/2026, pedido suyo)
Todo `decido:<MLA>=<precio>` va con `#<estrategia>` (si falta, se deduce del motivo y puede errar): `base` · `escasez` · `sinrepo`
(no se consigue, 4 meses) · `techo` (prueba de suba) · `liquidando` · `caja` · `promo` · `fecha` · `excepcion` · `nuevo` · `correccion`.
Cambiar sólo la estrategia, sin tocar el precio: `tag:<MLA>=<estrategia>|motivo;go`. Se ve en cada venta de Ventas x Producto.
Cada suba de techo seguida se cuenta sola en la web (📈 buscando techo ×2, ×3…, pedido suyo del 17/10): toda suba de techo va con `#techo`.

## 🔓 EL FRENO DE TECHO CON FOTO DEL MERCADO (17/10/2026, pedido suyo)
Él: *"y si el que pone el techo se queda sin stock o aumentó, se podría subir y perdemos 60 días sin mirar"*. El "no probar más
caro" ya no es un calendario fijo de 60 días. Cada vez que vuelvo una prueba que perdió: `techofreno:<MLA>=<precio probado>|motivo;go`
(ml-sync), que guarda la foto del mercado ese día (más barato ajeno, cuántos ajenos abajo del probado, caja). En CADA completa
corro `techofreno` (ml-consulta, solo lee): **🔓 REABRIR** si el más barato ajeno subió 8%+, ya no hay ajenos abajo del precio
probado, no queda ningún vendedor ajeno, pasamos a ganar la caja, o pasaron 30 días. Lo reabierto se vuelve a probar ese día
(`decido`) y se saca el freno (`techofreno:-<MLA>;go`). Sin catálogo sólo se reabre a los 30 días.
