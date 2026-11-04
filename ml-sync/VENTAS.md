# 🔬 VENTAS · el documento para analizar cada venta de CYC

**Qué es.** La referencia ÚNICA para analizar las ventas de CYC (revendedor en MercadoLibre Argentina, 4 cuentas: Adriana,
Luciana, Ayelen, Matías; todo se vende por Full). Pedido de Matías del 22/10/2026: *"que haya un documento especializado solo
para que revise las ventas. Pero que siga siendo parte de cyc ese documento. Así podemos leerlo todos"*.

**Quién lo lee.** El ayudante que analiza las ventas (Agent con `effort:"max"` escrito en la llamada, en cada vuelta), y también
Matías y Tito (su padre). Con ESTE archivo + la ficha de cada publicación tiene que alcanzar: no hace falta leer `CLAUDE.md`
(~800 KB) ni el `CEREBRO.md` entero.

**Si algo de acá choca con `ml-sync/CEREBRO.md`, manda CEREBRO.md** y este archivo está mal: se corrige acá en el mismo commit.
Regla nueva de precios o de ventas → va en CEREBRO.md, en este archivo y en `REVISION.md`, todo junto.
**Cada error que él marca sobre una venta** se agrega en la sección 7 de este archivo (1-2 renglones: qué pasó y la regla), en el
mismo commit que su chequeo en el detector `errores` y su pregunta en `notas/preguntas.md`. Este archivo no guarda historia larga
(va a `REVISION.md`/`HISTORIA.md`): tiene que seguir chico para que el ayudante lo lea entero.

**Quién decide.** El ayudante LEE y PROPONE. Decidir, escribir los comandos en ML y anotar es del chat principal (que sigue lo
propuesto; si no le hace caso, lo dice en el 🧠). El robot sólo junta datos: nunca tomar como dato una marca vieja del robot
(escalera, liquidando automático, expedientes, juicios viejos del supervisor). Se mira el dato crudo: ventas, stock, precio, ML.

---------------------------------------------------------------------------------------------------------------------------
## 1 · QUÉ VENTAS VAN "A FONDO"

Cada vuelta arranca con **`ventasraras:nuevas`** (ml-consulta, solo lee): trae SÓLO las ventas posteriores a la última analizada
(`mlapi/ventasvistas/hasta`). **Cada venta se analiza UNA sola vez** (regla suya del 21/10). Al final imprime:

- **📌** `ventas nuevas desde … · al terminar la vuelta: ventasvistas:<ts>;go` → el número `<ts>` que se usa al cerrar.
- **🧭 ESTRATEGIA DE LO QUE VENDIÓ**: ✓ con estrategia y techo · ⚠️ para decidir EN ESTA VUELTA.
- **🔬 A FONDO** (lo único que va al ayudante, decisión 2a del 22/10). Una publicación entra si:
  - la venta es **rara** (dejó bastante menos que lo normal a ese precio) o salió **abajo del 35%** o **sin costo / sin ficha**;
  - **sin estrategia con techo** (la ⚠️ de 🧭: sin tag, promo, descuento, excepción, caja, o volviendo 7+ días sin techo anotado);
  - está en **🔥 escasez** (¿subir más o se frenó?);
  - es un **🆕 lanzamiento que vendió** (¿buscar techo?);
  - tiene una **prueba de techo** (📈 `techo`, 💰 `punto`, 🧪 `prueba`) con **7+ días** desde la última decisión: hay que juzgarla.
- **✓ normales**: se cierran solas en el `ventasvistas` sin texto (la tarjeta muestra el motivo de su estrategia). No se les lee
  la ficha.

Una publicación que vuelve a vender en otra vuelta se mira por la venta NUEVA (qué cambió desde la decisión anterior, que ya
está en su ficha): no se rehace el análisis de la venta vieja.

---------------------------------------------------------------------------------------------------------------------------
## 2 · CÓMO SE LEE LA FICHA

- **`ficha:<MLA>`** por **ml-consulta** (solo lee; sin `:go` no guarda nada). Una ficha por renglón del campo `comando` (el
  workflow corre un comando por renglón y separa cada uno con `##### ✓ terminó: …`). **Como mucho 10 fichas por corrida**
  (cupo de lecturas de Firebase). El log se baja ENTERO a un archivo; tienen que estar todos los `##### ✓ terminó:` y la línea
  final "todos bien".
- **Si la corrida o la ficha dicen `⚠️⚠️ DATOS INCOMPLETOS` (o `incompleta`) esa venta NO se decide**: se vuelve a leer.
  Una lista que dice "faltan N sin leer" no cuenta como vacía. Dato dudoso (⚠️ de `raros`) = no se toca el precio esa vuelta.
- La ficha (`mlapi/ficha/<MLA>`) trae: línea de tiempo del año (stock, precio, ventas, neto, caja, visitas), cada cambio mío con
  su resultado, tramos de precio, las rayas (🔴 techo, 🟠 deja de convenir, 💰 más plata), mis notas, y **CÓMO REACCIONA**: 🥊 vende sólo ganando la caja /
  igual perdiéndola · 👀 visitas · 💲 qué le pega el precio · 🎁 fechas · 📦 visitas sin stock · 🧾 reclamos · 💳 cuánto se queda ML
  · ⚔️ competencia · 📆 día de la semana y mes · ⏳ edad del stock en Full · ⭐ opiniones · 👯 otras publicaciones del mismo producto.
  Con pocos días, lo que dice "es una pista": no se concluye.
- Ayudas que lee el chat si hacen falta (solo leen): `cargosventa:<MLA>:<días>` (qué cobró ML en cada venta: retención, cuotas,
  envío, comisión) · `techo95:<MLA>` (¿el techo está 95% seguro?) · `techofreno` · `escasez` · `porquebajo:<palabras>` ·
  `bajastecho:1`.

---------------------------------------------------------------------------------------------------------------------------
## 3 · EL PROCEDIMIENTO PARA UNA VENTA

1. **¿Qué pasó en la venta?** Precio cobrado de la orden (no el precio del día), % de ganancia, si fue en carrito, en promo o con
   cupón (🏷️ de `ventasraras`: cuánto puso ML y cuánto nosotros; **la venta con cupón o plata de ML cuenta a NUESTRO precio**, 15b del
   29/10: no es "vendió más barato"), si es Clásica o Premium y en cuántas cuotas. Lo de UNA sola vez
   (retención de IIBB de otra provincia, cuotas que pagamos, carrito, envío caro) **no toca el precio**. Casi todas las ventas
   tienen una retención chica (0,5-2%): sólo es motivo si explica la diferencia. "Dejó lo normal para su precio" = el problema es el
   PRECIO de hoy, no la venta.
2. **PRIMERO, LA LÍNEA DE TECHO (🔒, regla suya del 21/10, manda sobre todo lo demás).** ¿Tiene 🔴 techo al 95% (rayas) o 🏔️ de
   `techo95` (últimos 60 días)? **Si NO: la decisión es 📈 buscar techo (subir con salto grande, cuando el precio de hoy se confirmó: ⚡
   punto medio, §4)** — también 🔥 escasez y ⏳ sin reposición SIN techo medido que vendieron (1a del 28/10, el Espejo 4") —, salvo
   liquidando, remate, sobra (con sobra no se ARRANCA a buscar techo, pero lo que ya venía subiendo y vendió sube igual: 2b del 28/10) o
   **lo que vende menos de 1 por semana** (4a/37a: no sube, queda 💰 punto, salvo llevarlo al 35%, 🔥/⏳ con stock para menos de 100 días
   o la prueba de +50% una vez por mes, 1a del 02/11). "Ya probó techo", "va volviendo al normal" o "está bien a este precio" NO alcanzan.
3. **Escasez / sobra / stock / reposición.** Días de stock en Full al ritmo CON stock; ¿se corta antes de que vuelva a haber?
   (caja despachada ~8 d · oficina ~10 d · Paraguay ~16-17 d · Bs As ~1 semana + caja · sin reposición = sin fecha). ¿Le sobra
   (+90 d)? ¿Paga o va a pagar stock antiguo (120 d lo chico, 60 lo grande/Tenders)? ¿Hay unidades en la oficina para mandar?
4. **La caja de compra** (ganando / compartiendo / perdiendo, y cómo reacciona ESTE producto según la ficha).
5. **Cada variante sola** (cada color/aroma es su publicación): su precio, su stock, sus ventas, su caja. Nunca el promedio del
   producto. Si falta el stock del color, se dice "no sé", no se usa el del producto.
6. **Carritos:** el % de un producto se mide **vendido SOLO**. En un carrito ML cobra el cargo fijo una vez y cada producto se ve
   más rentable: ese ahorro no es mérito del producto.
7. **Promo o descuento vigente:** ¿sigue teniendo sentido (🤔)? ¿vence en 2 días (renovar o dejar terminar)? Subir la lista con un
   descuento mío puesto = primero `entrarpromo:<MLA>=salir`.
8. **Fechas especiales** (Día de la Madre, Navidad, CyberMonday…): ¿la venta es de la fecha y no del precio? Lo regalable en las 2
   semanas antes de su fecha no se prueba para arriba.
9. **Gemelas:** 💳 Premium (cuotas) y 📦 Clásica con envío gratis **las alinea el robot solo cada hora** con su Clásica: no se
   deciden a mano. Se decide la Clásica. Las ventas de la gemela se miran junto con la Clásica (stock compartido, línea junta).
10. **¿Qué me preguntaría él?** (`notas/preguntas.md`, pregunta 20). Si la respuesta es "no sé", no se decide a ciegas.
11. Proponer: el comando exacto, el texto para `ventasvistas` y la nota del 🧠 (sección 6). Toda decisión dice qué la deshace y
    cuándo se mira.

---------------------------------------------------------------------------------------------------------------------------
## 4 · LAS REGLAS QUE DECIDEN (🔒 = freno en el código · 🧠 = pensar)

### Quién manda cuando dos chocan (de arriba gana)
**🎯 El objetivo de todo precio** (02/11, él: *"encontrar el precio que más ganancia da entre 35% y 500% de ganancia. lo más rápido
posible"*): el que más plata por día deja (ganancia por unidad × ritmo: barato y muchos contra caro y pocos), entre 35% y 500% en el
peor caso, encontrado lo más rápido posible. Las filas son el camino:
1. Lo que pide él para ESE producto · 2. dato dudoso = no se toca · 3. frenos duros (ML la frenó, variantes de una publicación
todas o ninguna, techo $650.000, 🛑 ninguna suba pasa el 500% de ganancia, liquidando no se sube, releer de ML) · 4. nunca abajo de 0%
· 4a. **⚡ la suba que salió mal vuelve de una** al escalón medido que más ganancia dejó (punto medio, `!vuelve`; no la frenan F1-F4,
F7, F8 ni F14; sí F5, F10 y el 35%) · 4b. **sin línea de techo no se baja** (F7) · 4c. **arriba del 💰 no se baja sin 95%** (F8) · 4d.
**lo que vendió a su precio no se baja** (F14) · 5. **lo nuevo no se baja sin 🏔️** (F1) · 6. no llegar a pagar stock antiguo (15 días
antes: ganar la caja hasta el 0%; si a 3 días sigue sin venderse, pedirle el retiro) · 7. escasez = sube (🔥/⏳ nunca bajan sin techo al
95%, F11) · 7b. **nunca abajo del 💰** (F5: sólo los 15 días antes del stock antiguo, la liquidación de 30 días, 🧨 remate o 🔐
`!bajopiso`) · 8. sobra = baja en escalera **sólo si deja igual o más plata** (lo que no vende nada en 30 días es la liquidación, 9) ·
8b. **perfumes nunca abajo del 10%** (F12) · 8c. **bajar pide 95%, subir 50%** · 9. 35% en el peor caso; **abajo sólo con la unidad
más vieja de 90+ días** (F13); 🧲 la liquidación de 30 días sin vender, hasta el 30% antes de los 90 días · 9b. **menos de 1 por
semana no sube** (4a, salvo una prueba de +50% por mes) y **1+ por semana no queda en 💰 sin 🔴** · 10. buscar el techo · 11. las
formas (escalera, 90/990, barrera, 🤔). Una regla dura ("nunca", "sólo con 95%") gana siempre sobre la que parece dar más plata hoy.
Si dos reglas tiran para lados distintos y ninguna fila lo resuelve: no se hace nada esa vuelta y va a las decisiones de él.

### Margen y formas
- **35% en el PEOR caso** (retención 2% de otra provincia + el peor envío visto + cuotas; ≈28% en el número normal). 🔒 Una baja
  que queda abajo pide `!piso`, y **sólo con la unidad más vieja en Full de 90+ días, en los 15 días antes del stock antiguo o si lo
  pide él** (F13, 27/10, él: *"nunca abajo del 35% si lleva menos de 90 días"*). Lo que queda abajo cuenta como pérdida contra el 35%
  (pero si bajar evita perder más, la decisión ganó: se juzga contra no hacer nada).
- 🔒 **Nunca abajo de 0%** (sólo él lo abre: `!bajocero`, sólo en `entrarpromo`).
- 🔒 **Terminaciones 90/990** (99 en lo muy barato). Cruzar un número redondo NO se frena. Si el redondeo deja el precio abajo
  del 💰 más plata, se redondea PARA ARRIBA.
- 🔒 **Barrera $33.000:** arriba ML cobra el envío. `decido` frena en $32.999; cruzar sólo con `!cruza` y si deja MÁS por unidad
  que quedarse en $32.999 (lo mide el código).
- 🔒 **Techo duro $650.000.** 🔒 Más del doble de una sola vez pide `!salto`.
- 🔒 **Zona muerta de la comisión** (~$15.000): una suba que cae justo arriba del escalón y deja igual o menos por unidad se frena;
  a propósito, `!escalon`. Siempre mirar la ganancia por unidad AL precio nuevo.
- **Plata por día NETA** para comparar precios: −$100 por unidad (trabajo) · −3% de lo facturado (tope de H) · −2%/mes del costo del
  stock parado. A igual plata neta gana el precio alto.
- **Lo barato** (hasta ~$5.500): cada unidad tiene que dejar ~$1.000 o más; si no, se sube de una.
- **Venta abajo del 35% con poco stock** → se sube en la misma vuelta. **Lo nuevo que vuela** se sube al toque.
- **Venta barata ≠ remate:** remate sólo si estuvo parado de verdad (30+ d con stock vendiendo <1 por semana). Si llegó y se vendió
  al toque, es DEMANDA: el precio estaba barato.

### Techo (📈 → 🏔️)
- **Sin línea de techo, se busca techo** (ver paso 2). Todo lo que vende sin techo conocido se prueba para arriba (🔥/⏳ sin techo
  medido también: si vendieron, +50%, 1a del 28/10). Afuera: sobra (+90 d: no se ARRANCA, pero lo que ya venía subiendo y vendió sube
  igual, 2b del 28/10), lo que vende menos de 1 por semana (queda 💰 punto, salvo la prueba del mes), liquidando, mis promos,
  regalables en las 2 semanas antes de su fecha, frenadas por ML, lo 🔒/🥊 que él pidió (no sale en las listas de subas, 20a del 03/11)
  y lo que ya deja 500%.
- 🔒 **Salto grande, nunca de a poco: +50%** (y la próxima, cuando el precio nuevo se confirma: ⚡ abajo). `decido` frena una suba
  `#techo` de menos de +50%, salvo frenar en $32.990 por la barrera, el techo de $650.000, el tope de 500% o `!chico` con "EXCEPCIÓN: …"
  (un techo ya visto). 🛑 **Ninguna suba pasa el 500% de ganancia en el peor caso** (02/11, él: *"y para, pongamos que tome 500% de
  ganancia. Sino no para de subir"*): ahí termina la búsqueda de techo aunque siga vendiendo; no es motivo para bajar.
- **Cada escalón se mide antes del siguiente**, por certeza (Poisson sobre la plata por día: 3 esperadas y 0 ventas = 5% de azar ·
  6 y 0-1 = 2% · 10 y ≤2 = 0,3%), con **24 h como mínimo**. En lo que se compra de a muchos se cuentan COMPRADORES y 7 días mínimo.
- 🔒 **⚡ PUNTO MEDIO** (02/11, él eligió 1 2 3 4 + *"mínimo dejar 24 h"*; las Cartas Casino subieron 7 veces en una semana con una
  venta cada vez, $4.290 → $26.290, y dejaron de vender): (1) todo precio se juzga con **24 h como mínimo** y por las **ventas
  esperadas al ritmo del precio de antes** (~3); nunca más de **10 días** sin vender (los días con 0 visitas no cuentan, 18a del 03/11).
  (2) **La suba que salió mal** (menos de la mitad de lo esperado con 3+ esperadas, o 10 días sin vender) **vuelve DE UNA al escalón
  MEDIDO que más ganancia por día dejó** (2+ días con stock y alguna venta; si arriba hay uno que vendió y no se llegó a medir, primero a
  ése: la Lupa Monóculo) con `decido:<MLA>=<precio>!vuelve#volviendo|…`. Se mide en PLATA: si hoy vende algo, vuelve sólo si el de antes
  facturaba 1,5 veces lo de hoy (Almohadillas Metatarso); a los 10 días decide la ganancia por día. Nunca abajo del 💰 ni del 35% (Sony
  EX15C: *"dejalo al precio que está, nunca bajar el 35"*), ni sobre un 🔒; el stock que dura mucho no hace volver (si sobra, sigue la
  regla de sobra); en 🔥/⏳ sólo con 10 días sin vender. Lista 📉 de `errores`: vacía. (3) La **escalera de ≤15%** queda para lo que NO
  tiene un precio anterior que vendía (lanzamientos, lo que nunca vendió). (4) **La próxima +50% espera a confirmar**
  (`subaConfirmada`): 24 h y la mitad de lo esperado al ritmo de antes (3+ esperadas) o 3 ventas si las esperadas no llegan a 3; un 🆕
  sin ritmo de antes, 3 ventas (13a del 03/11). Una sola venta ya no alcanza. Las fechas especiales cuentan (17b del 03/11). Hoy 🔥/⏳
  suben con cada venta (16b del 03/11; a decidir el freno cuando el stock ya alcanza: 9 del 04/11).
- **Vende (y se confirma)** → otro salto (+50%). **Sale mal o no vende (🔴)** → ⚡ vuelve de una (punto medio); sin un precio anterior
  que vendía, 🔒 escalera hasta la PRIMERA VENTA y ahí se queda (F14) **como DESCUENTO propio con el precio tachado**
  (`entrarpromo:<MLA>=<precio>@PRICE_DISCOUNT#bajando|…`); `decido` frena bajar la LISTA de algo que ya probó techo salvo `!lista` con
  "EXCEPCIÓN: …". La vuelta y la primera baja 🪜 anotan solas el precio que no rindió (`techofreno`).
- 🔒 **Vende cualquier forma de venta = vale para todas** (30/10, él con el Aer Jasmín): si vendió la gemela de envío gratis arriba de
  $33.000, el +50% va sobre ESE precio y la Clásica cruza la barrera (`!vendio!cruza`, o `!cruza` en 🔥/⏳). 🧠 Las formas de venta siguen
  al % más alto en las subas y **bajan todas juntas** en las bajas a propósito (3a del 30/10).
- 🧠 **Aunque le sobre stock, la que vendió sin techo sube igual** (2b del 28/10). **Vender menos por las subas es a propósito** (29/10):
  la caída de unidades después de subir no es motivo para bajar.
- 🔒 **🔁 Precios vivos: una prueba por mes, sólo para arriba** (02/11, él: *"que cada un mes se cuestione… sólo para arriba, nunca abajo
  del precio que más da… 10 días como máximo en decidir"*): todo 💰/🏔️ sin suba en 30 días prueba más caro (con techo +20%, `!mensual`;
  sin techo +50%), y lo que vende menos de 1 por semana prueba UNA suba de +50% por mes si no tiene 🔴 y no subió en 30 días
  (`pruebaLentoOk`, 1a del 02/11). A los 10 días como máximo decide la ganancia por día: si arriba deja igual o más, se queda; si no,
  vuelve de una. La prueba del mes que vende se queda en ese precio (19a del 03/11). Nunca abajo del 💰. Listas 🔁 y 🧪 de `errores`.
- **Un precio no es 🔴 techo si otro MÁS ALTO medido dejó más plata por día** (Persea).
- 🔒 **🏔️ techo encontrado sólo lo anota `techo95`** (`techo95:<MLA>;go`), con la certeza que pide ese día: 95% hasta el día 30 con
  stock a ese precio, baja hasta 70% el día 44 (28/10, él: *"alargar de 7 días a 30 y después sí bajar a 70%"*); **10 días sin vender ahí = techo sí o sí** (02/11, antes 30).
  `#techook` a mano lo rechaza el código.
- **Las rayas** (días con 3+ u. en Full y con visitas; últimos 60 días, sin fechas especiales; con el precio que vio el comprador, lista
  menos mi descuento: 1a del 03/11): 💰 **más plata** = el precio que más plata por día dejó de los que se probaron (5+ días con ventas;
  desde la primera venta hay uno provisorio, punteado, que es sólo para mirar; nunca se baja de ahí, F5) · 🔴 **techo: no vende** =
  arriba del 💰, no vende (10 días sin vender ahí o más caro, 02/11, sin contar días con 0 visitas; vale aunque no haya 💰; o 0
  vendidas con la certeza del día) ·
  🟠 **deja de convenir** = vende, pero deja menos plata por día que el 💰 con esa certeza (27/10). El robot toma como techo el más
  bajo de los dos. Subir arriba del 🔴 → decir por qué no le creo.
- **`techofreno`**: el freno de no volver a probar más caro se reabre si el más barato ajeno sube 8%+, ya no hay ajenos abajo, ganamos
  la caja o pasan 30 días.

### Bajar (los frenos F0-F14 de `frenosBajas`, en `decido` y `entrarpromo`)
- 🔒 **F1 · lo nuevo no se baja sin 🏔️ de `techo95`** (primera tanda en Full de menos de 30 d o tag 🆕). Ganar la caja NO es excepción.
  Bandera `!sintecho`.
- 🔒 **F2 · escalera:** ≤15% por escalón (25% en escasez). En un descuento se mide contra el último precio que vio el comprador.
  Bandera `!golpe`.
- 🔒 **F3 · escalón medido:** otra baja antes de 48 h de la anterior (12 h en escasez) no pasa. Bandera `!golpe`.
- 🔒 **F4 · una suba no se deshace por casualidad:** bajar del precio de una suba (5%+) de menos de 15 días pide 95% (Poisson) o las
  visitas a la mitad. **La vuelta del punto medio (`!vuelve`) no pasa por F4** (tiene su cuenta: 24 h a 10 días); F4 queda para las
  otras bajas. Pasados 15 días: si vendió a ese precio en 30 días manda F14 (se queda; un escalón hacia el 💰 sólo si deja menos de la
  MITAD); si no vendió, decide la plata por día de las dos ventanas: si la suba deja igual o más, se queda; si deja menos, baja UN
  escalón (≤15%). Bandera `!sincerteza`.
- 🔒 **F5 · nunca abajo del 💰 más plata** (02/11, él: *"nunca bajar precios por debajo de la línea de mejor precio, o sea del precio que
  da más ganancias"*): sólo los 15 días antes del stock antiguo, la liquidación de 30 días sin vender, 🧨 remate autorizado (escribir el
  tag no alcanza) y 🔐 `!bajopiso` (suya desde el 02/11). La sobra, el sin reposición y "nunca se midió uno más bajo" ya no lo abren; la
  vuelta del punto medio tampoco baja de ahí. Renovar el mismo descuento no es una baja.
- 🔒 **F6 · 🤔 ¿tiene sentido el descuento?** Un descuento o promo nuevo (fuera de escalera de techo, escasez, lanzamiento, sinrepo,
  fecha) pide sobra de verdad (90+ d en Full al ritmo con stock) y no recién llegado (30+ d desde la última entrada). Que ML ponga
  parte no lo justifica solo. Bandera `!nosobra`.
- 🔒 **F7 · SIN LÍNEA DE TECHO NO SE BAJA NUNCA.** Línea = 🔴 al 95% o 🏔️ de techo95 en 60 días. No frena la sobra de verdad
  (📦/📉 con sobra medida), ⏳ a 20 días o menos del stock antiguo, los 15 días antes del stock antiguo, la liquidación de 30 días, el
  remate autorizado ni la escasez mientras no baje del precio de
  antes (y su salida, ↘️ #volviendo, pasa sólo con 30+ días de stock: F11). **Vence a los 15 días de la última suba (5%+)**: ahí decide la plata por día (F4).
  `!sinlinea` es 🔐 **SÓLO SUYA** (ver abajo). **Lo que vendieron OTRAS variantes o la familia NO alcanza nunca** (Protectores de
  talón, 22/10). Única salida mía: corregir el precio de lo que NUNCA estuvo activo ni vendió, al activarlo (`!activar` +
  "EXCEPCIÓN: …").
- 🔒 **F8 · arriba del 💰 no se baja sin 95%:** con el precio de hoy 2%+ arriba del 💰, se cuentan los días seguidos con stock a este
  precio contra lo que tenía que vender para igualar la plata por día del 💰. Con 95% y sin venta a este precio en 30 días → otro
  escalón (≤15%); si vendió, manda F14. Sin 95% se queda (estrategia 💰 `punto`, *el más alto que vende*); si deja más, la raya 💰
  sube sola. Bandera `!sincerteza`.
- 🔒 **F9 · en escasez nunca abajo del precio de antes de la escasez.** Bandera `!bajopiso` (acá sigue siendo mía, con "EXCEPCIÓN":
  25b del 03/11).
- 🔒 **F10 · él pidió no bajarla** (🔒 `nobajar`, 23/10): ninguna baja ni descuento; antes dice "HUBIERA HECHO…". 🔐 `!nobajar`.
- 🔒 **F11 · 🔥 escasez y ⏳ sin reposición NUNCA bajan sin techo al 95%** (24/10, él: *"Nada más"*), en todo caso suben. Única
  excepción: la unidad más vieja a 20 días o menos del stock antiguo. Escribir #sinrepo no abre ningún freno. 🔐 `!sinlinea`.
- 🔒 **F12 · 🌸 perfumes nunca abajo del 10%** (26/10), salvo los 15 días antes del stock antiguo: ahí hasta el 0% (27/10, él:
  *"perfumes hasta 0%"*). 🔐 `!bajocero`.
- 🔒 **F13 · abajo del 35% sólo con la unidad más vieja en Full de 90+ días** (27/10, él con el Paulvic Hot): antes ni la sobra ni
  `!piso` lo abren (sí los 15 días antes del stock antiguo, y la liquidación de 30 días sin vender, `liq30`, pero sólo hasta el 30%: 3a
  del 03/11); a los 90 días se abre hasta el 0%. 🔐 `!bajocero`.
- 🔒 **F14 · lo que vendió a su precio no se baja** (27/10 a la noche, él: *"primero buscar techo, segundo buscar 1 venta y quedarse ahí…
  normalmente siempre conviene mantener el precio más caro posible… 100 productos con pocas unidades que venden poco y ganan muchísimo"*):
  una venta (ésta, su gemela o las de su stock) desde el último cambio del precio que ve el comprador, en 30 días, frena toda baja y
  descuento. Sólo baja si sobra (90+ días de stock al ritmo de ESE precio con 7+ días medidos, o al de 60 días, o la unidad más vieja con
  90+ días), ⏳ a 20 días o menos del stock antiguo, en los 15 días antes del stock antiguo, con remate autorizado, renovando el mismo
  descuento o si **vende muchísimo menos** (1a del 28/10: en ese escalón deja menos de la MITAD de la plata por día que el 💰, 95% seguro
  y 7+ días con stock → baja un escalón hacia el 💰, sin pasarlo). **Una venta que entró bajando del techo = el precio donde se queda**:
  no se propone bajarla para buscar más plata por día. Bandera `!sincerteza` (🔐 suya).
- **Excepciones a los frenos, siempre las mismas cinco:** precio mal puesto · stock antiguo con fecha encima · ML la pausó por el
  precio · lo pide él · el envío (cruzar la barrera de $33.000 cuando deja claramente más). "Ganar la caja", "para ver si sale" y
  **la última unidad NO son excepciones** (24/10, él con el Cuba Gold: también en escalera y con techo). La vuelta del punto medio a un
  escalón que ya vendía no es una excepción: es su regla (4a).
- **Bajar algo que NO sobra** (salir de techo, escasez o lanzamiento) va como 💸 descuento con el precio de antes tachado, con su tag;
  no bajando la lista. Primero descuento (mínimo 5%, 14 días, renovable), nunca subir la lista para inflar el tachado.

### Escasez (🔥)
- **Escasez = se corta antes de que vuelva a haber. Y "escasez" SIEMPRE quiere decir que el precio SUBE en esa vuelta.** Si se decide
  no subir, el tag no puede ser escasez. Poco en Full pero la caja/oficina llega a tiempo = "🚚 cubierto", NO es escasez.
- Se mide con el **ritmo NORMAL** (no el de después de la suba, ni el de un tramo viejo mucho más barato: Enchufe). Si se aceleró
  (⚡: 2+ u. en 7 días y el doble del ritmo de 30 d) manda el ritmo rápido. Cada venta de algo con pocas unidades es un dato: la 1ª
  dice que a ese precio vende; la 2ª que confirma el ritmo y deja en escasez → se sube sí o sí.
- **Primer salto** por el ritmo de ESA publicación: 3+/día ×4 · 1-3/día ×3 · <1/día ×2 · <1 cada 2 días ×1,5 (con `!salto` si pasa el
  doble). Lo que ya falló más arriba (`notas/techo.md`), variantes, liquidando y mis promos: el precio que se piensa, sin ×3/×4.
- **Escalera de escasez, sólo con techo al 95%** (F11, 24/10): sin 🏔️/🔴 una escasez que no vende NO baja; se queda hasta que llega
  la reposición (↘️ #volviendo con 30+ días de stock). Con techo: −25% a las 12 h (3+/día) · −20% a las 24 h (1-3/día) · −15% a los 2-3
  días (<1/día). Si vende de más, otro escalón arriba. **Nunca abajo del precio normal** (F9). Con caja despachada: que la última unidad
  salga cerca del día 8.
- Si ML la pausa por el precio → se le avisa en el chat y lo arregla él (28/10, 3b).
- Al terminar: no volver a ciegas. Si a este precio deja igual o más plata por día que el normal, se queda; si no, se busca el medio.
- Lista **🚨 escasez que vendió después de mi última decisión**: se vacía en la misma vuelta (subir o nota con motivo).
- Escasez con unidades en la oficina → se decide la caja en la misma vuelta (`decido:caja:…`).

### Sobra (📦), sin reposición (⏳), stock antiguo
- **Sobra (una sola definición):** más de 90 días de stock **en Full** al ritmo **con stock** (de los últimos 60 días, o al de ESE
  precio con 7+ días medidos), o sin ventas con stock en 60 d, o la unidad más vieja con 90+ días en Full. La oficina no hace "sobra".
  Con sobra NO se ARRANCA a buscar techo: primero sale lo que sobra (escalera, como descuento); lo que ya venía subiendo y vendió sube
  igual (2b del 28/10). 🔒 **La baja por sobra pasa sólo si deja igual o más plata** (02/11, él eligió 1a: *"si vende más lo suficiente
  bajalo… o sino dejalo a este precio"*): con ventas hoy, el precio nuevo tiene que facturar por día 1,3 veces lo de hoy con su ritmo
  medido; sin ritmo medido, se queda (freno `sobra-plata`; "lo pide él" no la saltea: es la 🔐 `!pideel`, 22a del 03/11). Nunca abajo
  del 💰 (F5), del 35% si la unidad más vieja tiene menos de 90 días (F13) ni del 10% en perfumes (F12).
- 🔒 **🧲 30 días sin vender con stock = se liquida** (29/10, él: *"ir a los extremos"*; `liq30`): un escalón (≤15%, como descuento)
  hasta el primero que vende y ahí se queda (abajo del 35%, uno por semana; arriba, la escalera de siempre: 23b del 03/11), con el
  motivo "30 días sin vender" y `#liquidando` (así se ve 📉 liquidando, 30/10); abre F5, F7, F8 y F13, pero **no baja del 30% en el peor
  caso mientras la unidad más vieja tenga menos de 90 días** (3a del 03/11); desde los 90, hasta el 0%; perfumes 10% (F12). 🎄 Del
  15/11 al 24/12 no se liquida ni baja por sobra lo que vendió ×2+ en la Navidad pasada (4a del 03/11).
- **Sin reposición** (Nissei no lo tiene, Paraguay no da 35%, Bs As no se consigue, "no lo consigo"): vender TODO en ~100 días (nunca
  120) al precio más alto que lo vacía. Más rápido → sube; más lento → **no baja sin techo al 95% (F11)** ni si vendió a ese precio en
  30 días (F14); con techo, en escalera. A 20 días del stock antiguo se abre (F11). 1-2 unidades no se tocan más.
- **Stock antiguo** (ML cobra a los 120 d lo chico, 60 lo grande): gana sobre el 35%, pero abajo del 35% sólo con la unidad más vieja
  de 90+ días o en los 15 días antes (F13); se baja (📦 o ⏳ con `!piso`) para que salga a tiempo, y lo que falta para el 35% se anota al
  error de origen (mandar o comprar de más), no al precio. **15 días antes: ganar la caja hasta el 0% (al costo; sin catálogo, en
  escalera); si a 3 días de pagar sigue sin venderse, se le pide el retiro** (27/10, él: *"vende al costo antes de retirar. 3 días antes
  de pagar por stock retiramos"*). Fecha aproximada ≠ recién llegado. El motivo de toda baja por stock antiguo dice "stock antiguo"
  (así se ve ⏰ pagando stock y no "sobra", 30/10).

### Lanzamiento (🆕)
- Arranca en lo MÁS ALTO que tenga sentido contra su catálogo (23/10, él: *"buscá el precio más alto que podamos, que tenga sentido,
  quizás al de los competidores"*): si nadie tiene Full, cerca del más caro (Full vale ~19%); si hay otros con Full, ~20% arriba del
  Full más barato sin pasar el más caro; nunca abajo del 35% en el peor caso. **🆕 que vende → 📈 buscar techo (+50%) en la vuelta en
  que se confirma:** sin ritmo de antes medible, con 3 ventas a su precio y 24 h (13a del 03/11; antes alcanzaba la primera). 🔒 No se
  baja (ni descuento, ni promo, ni lista, ni para ganar la caja) hasta que `techo95` lo diga y anote 🏔️; ahí escalones de ~5-8% como
  descuento propio con el arranque tachado. Si casi no lo ven (<1 visita/día), bajar no lo arregla: título, fotos, caja (y los días con
  0 visitas no cuentan para los 10 días sin vender: 18a del 03/11).

### Caja, competencia, Premium, cuotas
- **La caja de compra orienta, no decide** (Full vale ~19% de precio). Perdiendo y vendiendo bien → no se baja. Perdiendo y sin vender
  → se piensa, y recién con línea de techo se baja.
- **Un solo vendedor en el catálogo no vale como precio** (puede ser inflado). Vendedores del exterior no se miran salvo que no haya
  argentinos: ahí su precio +20%. Se compara contra el más barato CON Full.
- **Premium:** la que gana la caja se queda en Premium. Premium sin cuotas medidas no se baja ni se rescata. En algunas categorías la
  comisión de Premium YA trae las cuotas adentro: no contarlas dos veces. Caja perdida por cuotas = candidata a gemela, no a bajar.
- 💳 **Toda Clásica con stock lleva su gemela Premium** al precio de igual plata neta y el mismo % en el peor caso (4a del 03/11); 📦 lo
  de menos de $33.000 lleva además su gemela Clásica con envío gratis (pausada sola mientras su Clásica esté en $33.000 o más, 6a del
  28/10). **Las dos las alinea el robot solo** (`alinearGemelas` / `alinearGemelasEnvio`), siguiendo el precio CON descuento de la
  Clásica (6a del 03/11): al mover la Clásica no se toca la gemela. Con la Clásica abajo del 35% a propósito (sobra, liquidando, remate,
  promo, descuento, `!piso`) la acompañan; si quedó abajo sin querer (dólar, costo), quedan en el 35% (21a del 03/11). 💳 `gemela` NO es
  una estrategia: la gemela muestra la de su Clásica.
- 💡 El precio sugerido de ML es una referencia, nunca motivo para bajar algo que vende.

### Lo que vende poco y los datos
- **Lo que vende poco** se ENTIENDE en familia, por visitas y por parecidas, y dice "💭 sin certeza, falta X". Pero **bajar sigue
  pidiendo su propia línea de techo** (F7) o los 15 días de la suba: la familia no reemplaza al 95%.
- **🧐 ¿Tiene sentido?** Cruzar cada número con otro tamaño, otra cuenta, otra fecha, el costo, parecidos. Margen de 150% o negativo =
  casi seguro un dato mal: no se usa y se dice por qué.
- **Pendrives de Matías como familia:** el de 32 es el conveniente; 8 y 16 (⏳) pueden quedar más caros a propósito.
- **Liquidando:** 🔒 no se sube. Si la marcó él a mano, no se toca ni se saca sin que lo pida.
- **Frenada por ML** (en revisión, pide documentación): no se toca el precio; si hay algo que hacer, se le avisa a él.
- **No se baja el precio de algo que vende bien sólo para medir** (la prueba del tachado se canceló el 20/10).
- **Un precio que no rindió no se repite** hasta que cambie la razón (máx. 30 días, `techofreno`).
- **Él no toca precios ni promos**: lo que diga él para un producto manda (fila 1) y el 🧠 dice que vino de él.

---------------------------------------------------------------------------------------------------------------------------
## 5 · LOS COMANDOS (sintaxis real del código)

Todos: **sin `;go` = PRUEBA** (muestra qué haría, no toca nada). Varios en uno se separan con `;` y el `;go` va al final. Los que
escriben en ML (`decido`, `entrarpromo`) van por **ml-sync**; `tag` también. `ventasvistas` puede ir por ml-consulta.
**Los textos (motivo, nota) NO llevan `;` ni `|`** (`;` corta el comando; `|` separa campos). Nada de datos de compradores.

### Precio de lista
```
decido:<MLA>=<precio>[!banderas]#<tag>|<motivo>;go
decido:MLA123=24990#techo|QUÉ HICE de $18.990 a $24.990 POR QUÉ sin línea de techo, vende 1/día …;go
decido:<MLA>=nota|<texto>;go                 (sólo la nota del 🧠, sin tocar el precio)
decido:<MLA>=activar;go   ·   decido:<MLA>=<precio>!activar#<tag>|…;go   (pone el precio y la activa si deja el piso en el peor caso)
decido:venta:<MLA>@<AAAA-MM-DD>=nota|<texto>;go   (nota del 🧠 de las ventas de ese día de esa publicación)
decido:archivo=<nombre>;go                   (lee ml-sync/notas/<nombre>.txt, un renglón por decisión; una clave repetida rechaza todo)
```
- El precio es EXACTO (no se redondea): escribir ya en 90/990.
- **Todo precio nuevo lleva estrategia** (`#tag`, o un motivo que la nombre); sin eso el código lo rechaza. `!piso` solo = 🛡️ excepción.
- Un `decido` que BAJA con `#techo` o `#escasez` queda guardado 🪜 bajando (techo y escasez = sube). Bajar volviendo de una prueba de
  techo también queda 🪜.
- No se sube la lista de algo con un descuento mío vigente: primero `entrarpromo:<MLA>=salir`.

### Descuento propio y promos de ML
```
entrarpromo:<MLA>=<precio>@PRICE_DISCOUNT[!banderas][#tag]|<motivo>;go     (descuento propio, precio de lista tachado, 14 días)
entrarpromo:<MLA>=<precio>@<id de la promo>[!banderas][#tag]|<motivo>;go   (promo de ML: el id sale de analizapromo)
entrarpromo:<MLA>=salir|<motivo>;go
```
- Mínimo 5% de descuento (ML no deja menos). Si ya está en otra promo de ML, primero salir.
- El tag lo elige solo: 🏷️ `promo` sólo si ML pone plata; si ponemos sólo nosotros, 💸 `descuento`. Para una escalera, `#bajando`.
- Pasa por los mismos frenos F0-F14 y por el 35% en el peor caso (`!piso`, F13). Rematar a cualquier precio, sólo si lo pide él:
  `entrarpromo:<MLA>=<precio>@PRICE_DISCOUNT!piso!bajocero#remate|EXCEPCIÓN: lo pidió él …;go` (🔐 con su autorización).

### Estrategia sin tocar el precio
```
tag:<MLA>=<tag>|<motivo>;go
tag:<MLA>=<tag>@AAAA-MM-DDTHH:MM|<motivo>;go   (desde cuándo vale, hora de acá)
```

### Caja y pedido (cuando la venta lo pide)
```
decido:caja:<prodId|palabras>@<cuenta>[#color]=u|<N>|<motivo>;go    (cuántas mandar a Full; la nota es para Matías)
decido:caja:<prodId|palabras>@<cuenta>[#color]=nota|<texto>;go
decido:ped:<prodId|palabras>[#color]=u|<N>|<motivo>;go              (cuántas comprar; el motivo arranca "Hola Tito!")
decido:ped:<prodId|palabras>[#color]=venta|<precio>|<motivo>;go     (precio NORMAL para el máximo de compra, nunca el de escasez)
…=auto;go   (borra lo mío y vuelve la cuenta automática)
```
Cuentas: `adriana`, `luciana`, `ayelen`, `matias`. Las palabras tienen que agarrar UNA ficha; con colores, color por color.

### Techo
```
techo95:<MLA>[,<MLA>…];go          (anota 🏔️ sólo si llega a la certeza del día: 95% hasta el día 30, 70% el día 44; sin ;go solo mide)
techofreno:<MLA>=<precio probado>|<motivo>;go
```

### Banderas (sólo cuando hace falta, nunca "por las dudas")
| bandera | qué saltea | dónde | pide "EXCEPCIÓN:" en el motivo |
|---|---|---|---|
| `!piso` | bajar abajo del 35% en el peor caso (sólo con la unidad más vieja de 90+ días o en los 15 días antes del stock antiguo, F13) | decido, entrarpromo | no (pero decir por qué) |
| `!cruza` | cruzar los $33.000 (sólo si paga más) | decido | no |
| `!salto` | subir más del doble de una | decido | no |
| `!activar` | activar la pausada al precio | decido | no |
| `!sinstock` | poner precio a una nueva todavía sin stock (copiado mal) | decido | no |
| `!escalon` | zona muerta de la comisión | decido | no (decir por qué) |
| `!sintecho` | F1 lo nuevo sin 🏔️ | decido, entrarpromo | 🔐 **suya** |
| `!golpe` | F2/F3 escalón más grande o antes de tiempo | decido, entrarpromo | **sí** |
| `!sincerteza` | F4 deshacer una suba sin 95% · F8 bajar arriba del 💰 sin 95% · F14 bajar algo que vendió a su precio | decido, entrarpromo | 🔐 **suya** |
| `!bajopiso` | F5 abajo del 💰 · F9 en escasez abajo del precio de antes | decido, entrarpromo | F5: 🔐 **suya** (02/11) · F9: **sí** (mía, 25b del 03/11) |
| `!nosobra` | F6 descuento sin sobra | decido, entrarpromo | **sí** |
| `!sinlinea` | F7 sin línea de techo | decido | 🔐 **suya** |
| `!chico` | suba `#techo` de menos de +50% | decido | **sí** |
| `!vendio` | subir +50% una prueba 📈 que vendió a este precio, con el precio ya confirmado (decido verifica la venta y el punto medio; el freno 50% pide la certeza de techo95, 🟠) | decido | no |
| `!vendiocaro` | volver al precio más caro que vendió en 60 días (decido lo verifica en la línea; no lo frenan 4a ni el 50%; no va si el de hoy, medido, deja igual o más plata por día: 7 del 03/11, Barbarella) | decido | no |
| `!vuelve` | la vuelta del punto medio: volver de una al escalón medido que más ganancia dejó (decido la mide con `vueltaDeSuba`; no la frenan F1-F4, F7, F8 ni F14; sí F5, F10 y el 35%) | decido | no |
| `!mensual` | la prueba del mes: hasta +20% a lo que no subió en 30 días (no la frenan el +50%, la 4a ni el 50%) | decido | no |
| `!lista` | bajar la LISTA de algo que ya probó techo | decido | **sí** |
| `!nobajar` | F10 bajar una publicación que él marcó 🔒 | decido, entrarpromo | 🔐 **suya** |
| `!pideel` | la regla de sobra-plata: bajar por sobra lo que no deja más plata, porque lo pide él (22a del 03/11) | decido, entrarpromo | 🔐 **suya** |
| `!bajocero` | F0 abajo de 0% · F12 perfume abajo del 10% · F13 abajo del 35% antes de los 90 días | entrarpromo | 🔐 **suya** |

**Una bandera de excepción sin "EXCEPCIÓN: <por qué>" en el motivo NO vale** (el código la ignora y frena igual). Las únicas
excepciones válidas son las cinco de la sección 4.

**🔐 Salidas SÓLO SUYAS (22/10, CEREBRO §0c):** `!sinlinea` · `!sincerteza` · `!sintecho` · `!bajocero` · `!nobajar` · `!bajopiso`
(abajo del 💰, desde el 02/11) · `!pideel` (22a del 03/11) · la estrategia 🧨 `#remate` (y prender 🥊 `ganarcaja` o sacar un 🔒). Sin su
autorización vigente el cambio NO se hace: queda GUARDADO en `cyc/autoriza/<código>` (no vence ni sale por
Telegram, 24/10); se lo paso en el chat (aviso de las 12:30) y su respuesta la anoto con `autorizo:<su texto>;go` (vale 48 h desde que
la anoto, para ese renglón). El ayudante NO las propone como si fueran mías: si cree que hace falta una, lo dice como
decisión de Matías. `autoriza` (consulta) lista lo autorizado. Todo camino que baja pasa por `frenosBajas` (F0-F14; F9: en escasez
nunca abajo del precio de antes de la escasez) y toda suba por `frenosSuba`.

**🔎 Detector `errores`** (consulta, al final de cada vuelta): mira el resultado de cada cambio de precio y descuento de 26 h contra
los errores que él ya marcó; con `:go` (ml-sync) deshace lo ❌. Cada corrección nueva suya agrega su chequeo ahí y, si se mide, su
freno.

### Tags válidos
🔥 `escasez` · ⏳ `sinrepo` · 📈 `techo` (buscando techo, sube) · 💰 `punto` (el más alto que vende) · 🪜 `bajando` · ↘️
`volviendo` (al normal) · ↗️ `desobra` · 📦 `sobra` · 💸 `descuento` (sólo nosotros) · 🏷️ `promo` (ML pone plata) · 📉 `liquidando` ·
🧨 `remate` (sólo si él lo pide) · 🛡️ `excepcion` · 🆕 `nuevo` · 🎁 `fecha` · 🥊 `caja`.
**No se usan a mano:** `techook` (lo anota `techo95`) · `sindecidir` / `agotado` (son lo que muestra la web cuando falta) · `gemela`
(lo anota el robot) · `prueba` (la prueba del tachado se canceló). ↘️/↗️ son un PASO: con 7 días en ese tag entra a 🔎 sin afinar.

### Al cerrar la vuelta (lo hace el chat)
```
ventasvistas:<ts>|esf=max|<MLA>=<texto>|<MLA>=<texto>;go
```
- `<ts>` = el número del 📌 de `ventasraras:nuevas`. `esf` = el esfuerzo usado de verdad (`low` · `medium` · `high` · `xhigh` · `max`;
  el del ayudante es `max`). Nunca retrocede.
- Deja en CADA venta del tramo su análisis (`cyc/ventaanalisis`): la tarjeta sale gris si no cambió nada y del color de la estrategia
  si cambió. El cambio lo detecta solo (estrategia nueva o precio mío después de la venta). El texto por MLA reemplaza al motivo
  guardado; máximo 400 caracteres; sin `;` ni `|`. Las normales van sin texto.
- Después, el detector `errores` (consulta; reemplaza a `bajastecho:1` desde el 22/10, CEREBRO §1): si hay algún ❌ pendiente,
  `errores:go` por ml-sync lo deshace (vuelve al precio de antes o sale del descuento, releído) y le avisa. Ninguna vuelta termina
  con un ❌ vivo sin decidir.

---------------------------------------------------------------------------------------------------------------------------
## 6 · QUÉ DEVUELVE EL AYUDANTE

**Por cada MLA de la lista 🔬:**
- **(a) Qué pasó**, en una frase (la venta y lo que dice la ficha).
- **(b) El comando exacto** (`decido` / `entrarpromo` / `tag` / `decido:caja` / `decido:<MLA>=nota`), ya en 90/990, con su `#tag`,
  sus banderas y el motivo. Si no se toca: el `decido:<MLA>=nota|HOY NO LO TOCO PORQUE …`.
- **(c) El texto para `ventasvistas`**: corto, en criollo, sin `;` ni `|`, hasta 400 caracteres (qué pasó y qué se resolvió).
- **(d) Certeza**: alta / media / baja, y qué dato falta si no es alta. Con "datos incompletos", no se propone precio: se pide releer.

**La nota del 🧠** (la lee Matías en la tarjeta; una por variante, sin repetir oraciones, sin `;`):
- Si se toca: **QUÉ HICE** (de $X a $Y) · **POR QUÉ** (estrategia + el dato) · **QUÉ ESPERO VER** (números) · **SI NO PASA** (en
  cuántos días y qué hago).
- Si no se toca: **HOY NO LO TOCO PORQUE** … · **QUÉ ESPERO VER** … · **SI NO PASA** …
- Prohibido el "se mira solo": siempre el motivo de subir, bajar o dejar.

**Al final, las decisiones de Matías**, TODAS JUNTAS en un solo bloque, numeradas, cada una corta con **(a) sugerida** y **(b)**
(él contesta "1a 2b …"). Va sólo lo grande o sin respuesta clara: dos reglas que chocan sin fila que lo resuelva, algo que cuesta
plata y sólo él puede hacer (reclamo esperando, ML frenó algo que vende, vende fuerte en 0 en Full con oficina, costo faltante en
algo que se vende). Lo chico y reversible lo decide el chat y se lo cuenta. Si no hay nada, no se inventa.
**Toda decisión de bajar un precio va con el % de seguridad de que es el techo** (`techo95:<MLA>` de CADA uno; sin %, cuántos días
lleva y qué falta) (27/10, él con los Paulvic a $21.990: *"dame el % de seguridad de que es un techo, sino me faltan datos para responder"*).

---------------------------------------------------------------------------------------------------------------------------
## 7 · ERRORES QUE YA SE COMETIERON (no se repiten)

- **Protectores de talón (22/10):** se bajaron 3 sin línea de techo usando lo que vendió la familia como certeza (`!sinlinea`). Él:
  *"si no encontró techo, ¿por qué bajó?"*. Cada variante sola; `!sinlinea` pasó a ser 🔐 suya.
- **Persea y Aer Jasmín (20-21/10):** bajados sin techo ($21.990 → $14.950 de una; $19.490 → $18.190 a los 7 días) y la revisión los
  dio por buenos. Nació la regla "lo primero es la línea de techo" (F7) y `bajastecho`.
- **Enchufe 3 patas (22/10):** se dijo "escasez" con el ritmo de un tramo viejo mucho más barato. El ritmo de la escasez es el del
  precio de hoy (o el normal), no el de una época barata.
- **F9 (22/10):** se juzgó un precio con una venta que en realidad se había cobrado a otro precio, y además la escasez se midió
  con el ritmo de un tramo viejo más barato (como el Enchufe). Mirar el precio COBRADO de cada orden, no el precio del día.
- **Cuba Platinum y otros 3 (20/10):** se bajó lo recién llegado sin 🏔️ para "ganar la caja". La regla dura (lo nuevo no baja sin 95%)
  gana sobre la que parece dar más plata. Hoy es F1.
- **Adaptador 8 en 1 (13-18/10):** subido sin medir el escalón, vuelto de golpe, y después el redondeo a 990 lo dejó abajo del 💰 más plata.
  Escalón medido antes del siguiente, la vuelta sólo a un escalón medido (⚡ punto medio) y redondeo PARA ARRIBA si el 💰 queda abajo.
- **Cabotine Turquoise (18/10):** se midió con el ritmo de 2 meses cuando vendía 4 en 10 días: no se subió en la 1ª venta ni en la 2ª
  que lo dejaba en escasez. Cada venta es un dato (⚡).
- **Batidora negro (19/10):** decía "buscando techo" y no había subido. Techo y escasez = el precio sube; si no, otro tag.
- **Victoria's Secret (08-09/10):** se usaron marcas viejas del robot (escalera, liquidando) como dato. Dato crudo siempre.
- **Iscos (19/10):** se midió contra un solo vendedor inflado ($96.000 cuando el real era ~$20.000). Un solo vendedor no vale.
- **Ferrari Premium (20/10):** se comparó la gemela contra sus hermanas y no contra qué pasaba SIN ella.
- **Hub 8 en 1 (18/10):** saltó a $27.990 sin medir $19.990 y volvió directo. Cada escalón se juzga antes del siguiente (24 h como
  mínimo); la vuelta va al escalón MEDIDO que más ganancia dejó (⚡ punto medio, 02/11), no a ciegas.
- **Pendrive 128 (18/10):** abajo del 35% por haber mandado 48: el error es de la cantidad, no del precio. El cerebro se juzga contra
  no hacer nada.
- **Masajeador de cara (23/10):** 🆕 que vendió por su gemela Premium y quedó quieto (se leyó la estrategia 💳 de la gemela). La venta
  de una gemela o hermana se juzga con la estrategia de su CLÁSICA: cuenta para confirmar la próxima +50% de la Clásica.
- **Naipes / Cartas Casino (24/10 y 02/11):** el 24/10 la prueba de $3.890 vendía hace 5 días y no se subió más (*"a ese precio ya vendió,
  no es techo"*); después subió +50% con cada venta, 7 veces en una semana ($4.290 → $26.290, 373 u. en Full), y dejó de vender. Hoy (⚡
  punto medio, 02/11): si vende no es techo, pero la próxima +50% espera a que el precio se confirme (24 h y la mitad de lo esperado al
  ritmo de antes, o 3 ventas si las esperadas no llegan a 3), y la suba que sale mal vuelve de una.
- **Cuba Gold (24/10):** se pidió bajar de golpe la última unidad ($67.174 → $32.990). La última unidad NO es excepción: escalera y con
  línea de techo.
- **Infusor cajita (24/10):** 🔴 $5.290 falso: el 💰 salía de 8 días de fines de julio (antes del Día del Niño) que vendieron el triple;
  lo pasó y vende a $6.890. Antes de creerle a un 🔴 o un 💰, mirar de qué días sale.
- **VS Bliss y Pure Seduction (26/10, lo encontré yo):** el peor envío salía de un carrito de 2 productos: daban ~35% estando en ~55% y
  se subieron con ese número. El peor envío se mide sólo con ventas sueltas.
- **Cartas Poker y Centímetro Blanco (26-27/10):** dos publicaciones del mismo stock y color con distinto precio o estrategia (*"no
  entiendo"*). 👯 = mismo precio y misma estrategia, al precio MÁS CARO de las dos.
- **Adaptador 8 en 1 y Centímetro Blanco (27/10):** quedaron en 💰 con la prueba de techo cortada sin 🔴 (*"es raro, no busca techo"*).
  Lo que vende 1+ por semana no queda en 💰 sin 🔴 ni 🏔️: vuelve a 📈.
- **Sábanas Rojo (27/10):** la venta de UN color a $23.490 se usó para el máximo de compra de todas (*"ese color se vendió a ese precio,
  no todos"*). Cada color su precio y su máximo; el del producto es el más bajo de los colores.
- **Seagate 500GB (27/10):** *"¿este no llega al 35%?"* sobre una venta se contestó con el costo de lo que ya había, y preguntaba por
  volver a comprarlo. Dar las dos cuentas (costo de hoy y de reponer) y el precio del 35% repuesto.
- **Paulvic Hot (27/10):** se pidió bajarlo al 20% con menos de 90 días en Full. Abajo del 35% sólo con la unidad más vieja de 90+ días
  (F13); antes, ni la sobra ni `!piso`.
- **Espejo 4" (28/10):** 🔥 escasez que vendió sin techo medido y no se subió. Él: *"¿por qué no lo subió? no tiene techo conocido aún"*. 🔥/⏳ sin techo que vende también sube +50%.
- **Aer Jasmín (30/10):** vendió la gemela de envío gratis arriba de $33.000 y la Clásica no se movió. Él: *"no importa quién venda, si no tiene techo tiene que seguir buscando"*. La venta de cualquier forma de venta vale para todas (`!vendio!cruza`).
- **Lupa Monóculo, Almohadillas Metatarso y Sony EX15C (02/11), la vuelta del punto medio:** la Lupa volvió de $10.690 a $4.690 sin medir
  $7.090, donde había vendido (*"sí se puede bajar así si sabemos que es el mejor precio… ya que conoce todos los escalones"*): se vuelve
  al escalón MEDIDO que más ganancia por día dejó, y si arriba hay uno que vendió sin medir, primero a ése. Las Almohadillas a $19.690
  dejaban más plata que a $4.390 (*"¿estás seguro de que esos precios generan más ganancia?"*): la vuelta se mide en plata, no en
  unidades. El Sony volvía abajo del 35% (*"dejalo al precio que está, nunca bajar el 35"*): la vuelta nunca baja del 35%.

---------------------------------------------------------------------------------------------------------------------------
## 8 · PRIVACIDAD

El registro de GitHub y el repo son **PÚBLICOS**. Nada de datos de compradores en ningún texto, nota, `ventasvistas`, motivo o
archivo: ni nombres, ni usuarios, ni teléfonos, ni direcciones, ni números de orden o de paquete, ni el texto de sus preguntas o
mensajes. Se habla del producto, la cuenta, el precio, el día y los números de ML. Ante la duda: **¿de quién es este dato?** Si no
es de CYC, no va.
