# 🧠 CEREBRO · REHECHO EL 21/10/2026 (pedido suyo: *"fijate si es necesario rehacer el cerebro (…) hay reglas viejas, que se pisan. manejalo"*)

**Cómo se usa.** Cada vuelta (08:52 completa · 10:52, 12:52, 14:52, 16:52, 18:52, 20:52 cortas) arranca leyendo ESTE archivo y
`notas/preguntas.md`. Cada regla está UNA sola vez y en su versión más nueva. Las viejas, repetidas o pisadas se sacaron (el
archivo de antes quedó en `notas/cerebro_viejo_20261021.md`, sólo como historia: no se usa). La historia de cada regla (fecha,
frase suya, el caso) está en `CLAUDE.md`. **Regla nueva → va en su tema acá, en `CLAUDE.md` y en `REVISION.md`, en el mismo commit.**
Si una regla nueva choca con una de acá, se REEMPLAZA la de acá (no se agrega abajo): así no vuelven a convivir dos versiones.

**🔬 TODAS LAS VUELTAS SON PESADAS Y LAS VENTAS SE ANALIZAN AL MÁXIMO (21/10/2026, regla suya; manda sobre cualquier prompt de tarea
que diga "liviana" o "gastá poco"):** *"necesito análisis máximo en las ventas"* y *"todas las revisiones son pesadas con esfuerzo más alto,
se quita eso de gasta poco"*. **Y CADA VENTA SE ANALIZA UNA SOLA VEZ** (*"no quiero que una venta se evalúe dos veces. para no
gastar tokens de más. que cada venta tenga un análisis profundo con esfuerzo máximo y listo"*). Cada vuelta (las de cada 2 h, 11:52 a 23:52 desde el 21/10, y la de
las 08:52) arranca con **`ventasraras:nuevas`**, que trae SÓLO las ventas posteriores a la última analizada; cada publicación de esas
ventas se mira con su FICHA COMPLETA (`ficha:<MLA>`, varias en un disparo): año entero, reacción al precio, caja, competencia, stock,
reposición, fechas, rayas, y queda con estrategia bien pensada (🧭 sin ⚠️). Al terminar la vuelta, `ventasvistas:<ts>|esf=<esfuerzo>|<MLA>=<qué pasó y qué resolví>|…;go`
(el número que imprime el 📌; `esf` = el esfuerzo que usé de verdad: max, xhigh, high…) marca hasta dónde se analizó y deja en
CADA venta su análisis (`cyc/ventaanalisis`): la tarjeta lo muestra gris si no cambió nada y del color de la estrategia si cambió
(21/10, pedido suyo). El texto por MLA va siempre que hubo algo que contar (sin `;` ni `|`); sin texto sale el motivo de la estrategia; la vuelta siguiente no las vuelve a ver. Si la vuelta se corta antes de anotar, la
siguiente las retoma: nunca quedan sin analizar. Si vendieron más de ~5 publicaciones distintas, las piensa un ayudante con esfuerzo
MÁXIMO que propone; decidir y aplicar es mío. Una publicación que vuelve a vender en otra vuelta se mira por esa venta NUEVA (lo que
cambió desde la decisión anterior, que ya está en su ficha), no se rehace el análisis de la venta vieja.
La de las 08:52 además mira lo que no depende de las ventas (pedidos de todo el catálogo, cajas, lo que no vende 📏/🔎/📦, juicios del
supervisor, promos a fondo, fotos de candidatos): eso NO se saca, porque lo que no vende nunca dispara una revisión de venta.

**Las marcas:**
- 🔒 **freno en el código**: no se puede romper. `decido`/`entrarpromo`/`tag` lo rechazan solos y dicen la regla. Para pasar
  a propósito hay una bandera (`!…`) que vale SÓLO si el motivo dice **"EXCEPCIÓN: …"** con el porqué.
- 🧠 **pensar**: depende de juicio. Ahí es donde me puedo equivocar: se mira con la ficha, las preguntas y el revisor en contra.

Por qué así (21/10, después del Cuba Platinum y el Adaptador 8 en 1): una regla escrita sólo como texto depende de que yo la
recuerde, y los ayudantes leen el mismo texto, así que se equivocan para el mismo lado. **Lo que se puede medir con un dato va
al código; lo que es pensar queda acá, y una regla dura ("nunca", "sólo si") gana siempre sobre la que parece dar más plata hoy.**

===========================================================================================================================
## 0 · QUIÉN MANDA (cuando dos reglas tiran para lados distintos, gana la de más arriba)

| # | qué | |
|---|---|---|
| 1 | **Lo que pide él para ESE producto** (un precio, rematar, "no lo vendemos más", "no lo consigo") | se anota en el 🧠 que vino de él |
| 2 | **Dato dudoso → no se toca el precio esa vuelta** (⚠️ de `raros`) | 🧠 |
| 3 | **Frenos que no se discuten:** ML la tiene frenada · variantes de UNA publicación, todas o ninguna · techo $650.000 · liquidando no se sube · releer de ML después de cambiar | 🔒 |
| 4 | **Nunca abajo de 0%** (sólo él lo abre: `!bajocero`, y sólo en `entrarpromo`) | 🔒 |
| 5 | **Lo nuevo no se baja sin 🏔️ al 95%** (primera tanda en Full de menos de 30 d, o 🆕 lanzamiento). Ganar la caja NO es excepción | 🔒 F1 |
| 6 | **No llegar a pagar stock antiguo** (120 d lo chico, 60 lo grande/Tenders; apuntar a ~100) | 🧠 (la lista 💸 lo trae) |
| 7 | **Escasez: se sube** para que dure hasta que vuelva a haber. "Escasez" siempre = el precio sube | 🧠 + la lista 📈 |
| 8 | **Sobra: se baja en escalera** | 🔒 F2-F3 la escalera · 🧠 cuánto |
| 9 | **25% en el PEOR caso** (🛡️) | 🔒 en bajas · lista 🛡️ |
| 10 | **Buscar el techo** en todo lo demás | 🧠 |
| 11 | **Formas:** escalera (≤15% por escalón, 25% en escasez; uno cada 48 h, 12 h en escasez) · una suba no se deshace sin 95% · no abajo del 💰 piso · 90/990 · barrera $33.000 · descuento sólo si tiene sentido (🤔) | 🔒 F2-F6 |

**Choques ya resueltos (no se vuelven a pensar):**
- *25% vs stock antiguo* → gana 6: se baja abajo del 25% para que salga a tiempo (tag 📦 `sobra` o ⏳ `sinrepo`). El 🧠 lo dice
  y lo que falta para el 25% se anota al error de origen (mandar/comprar de más). El cerebro se juzga contra NO hacer nada.
- *Escasez vs techo conocido* → gana 7, pero con el precio que pienso (no ×3/×4): ya se sabe que más arriba no rinde.
- *Escasez vs mercadería en camino u oficina que llega a tiempo* → NO es escasez: "🚚 cubierto", se manda la caja.
- *Buscar techo vs sobra* → con sobra no se busca techo: primero sale lo que sobra.
- *Descuento mío vigente vs suba de lista* → primero salir del descuento (`entrarpromo:…=salir`); nunca inflar el tachado. 🔒
- *Sin reposición que al precio normal no se vacía en 120 días* → gana 6 (no pagar stock antiguo): se baja en escalera.
- *Una regla dice A, otra B y ninguna fila lo resuelve* → no se hace nada esa vuelta, se anota y va al `pregunto:` con (a)/(b).
  Después se agrega la fila acá.
- **Las excepciones a los frenos son siempre las mismas cinco:** precio mal puesto · stock antiguo con fecha encima · ML la
  pausó por el precio · lo pide él · la última unidad. "Ganar la caja" y "para ver si sale" NO son excepciones.

### 0b · PARA DECIDIR CON ÉL — vacío (las 4 del 21/10/2026 las decidió él ese mismo día: 1a 2b 3a 4a, ya están en sus secciones)
Lo que choque y no tenga fila en 0 va acá con su regla provisoria hasta que conteste; al contestar, pasa a su sección y se borra de acá.
La etapa 8 de la revisión (Reglas del cerebro, cada 7 días) mira que esto quede vacío.

===========================================================================================================================
## 1 · CADA VUELTA, EN ESTE ORDEN

**Cortas (10:52 a 20:52, cada 2 h):**
1. Leer este archivo y `notas/preguntas.md`.
2. Lecturas en UNA ml-consulta (uno por renglón): `planilla` · `escasez` · `raros` · `lupa` · `ventasraras:5` · `pausadas:25` · `analizapromo:7` · `preguntas`.
   **El log se baja ENTERO a un archivo** (no con `tail_lines` chico) y antes de usarlo tienen que estar los N `##### ✓ terminó:` y la
   línea final "todos bien"; si falta uno, se repite esa lectura. Una lista que dice "faltan N sin leer" no cuenta como vacía.
3. **Listas que quedan VACÍAS al terminar** (cada renglón: decisión o nota con motivo): 🛡️ abajo del 25% peor caso · 🚨 escasez
   que vendió después de mi decisión · 📈 dice techo/escasez y no sube · 🤔 descuentos que ya no tienen sentido · 🔁 subas por
   escasez/sinrepo cuya razón cambió · 🧭 fuera de lo normal · 🔀 no cierra.
4. ⚠️ dato dudoso: no tocar precio, anotar. 💭 sin certeza: juzgar en familia, por visitas o por parecidas, nunca colgado.
   Si 🧭 + 🔀 + 💭 traen más de ~8 renglones, un ayudante en Alto los piensa y propone; si no, los miro yo. Aplicar siempre es mío.
5. Cada venta nueva contra su ficha: ¿1ª o 2ª después de un cambio? ¿confirma o desmiente la prueba? ¿se aceleró ⚡? ¿la dejó en
   escasez? ¿se vendió en promo? Escasez nueva se trata en ESTA vuelta (precio + caja si hay oficina).
   🔒 **Y cada venta deja su producto con estrategia pensada** (21/10/2026, él: *"quiero que siempre se mire con detenimiento venta x
   venta, así todos los productos quedan con estrategias siempre y con estrategias bien pensadas"*): `ventasraras` termina con
   **🧭 ESTRATEGIA DE LO QUE VENDIÓ**; cada ⚠️ (sin estrategia, promo, descuento, excepción, caja, o volviendo 7+ días sin techo
   anotado) se decide EN ESTA VUELTA con la ficha abierta: buscar techo (salto grande), anotar el techo probado, o sobra/escasez/
   sin reposición con su motivo. La lista queda vacía. Lo que NO vende no pasa por acá: eso lo barre la completa (📏/🔎/📦).
6. Activar pausadas con stock en Full (`activarfull:go:25`); lo que no se activa va al `pregunto:` con motivo.
7. Preguntas de compradores que sé sin duda (`contesto:`). Mis descuentos que vencen en 2 días: renovar o dejar terminar.
8. 📋 Listas: confirmar el mismo producto (`listarevisar` → `listadato:<prov>;<cód>=ok|no|mi=MLA…;go`); con duda no se toca.
9. Escrituras en UNA ml-sync (uno por renglón). Antes, mirar el job `sync` de la última corrida de ml-sync: si sigue andando,
   esperar. **Un solo disparo por turno.** Después confirmar `success`; si quedó `cancelled`, repetir sólo lo que faltó (cada
   comando terminado deja `##### ✓ terminó:`). No se toca `cancel-in-progress`.
10. En el chat: "🚨 N → N · 🧭 N → N · 🔀 N → N · 🚫 frenadas N · ventas N miradas · ideas …" (nunca callado).

**Completa (08:52), además:**
1. `historia` · `escasez:expediente` · `informe:24` · `ficha:cuenta=<c>` ×4 · `pedidostodo` · `techo95` · `techofreno` ·
   `escmedir` · `supervisor:medir:go` · `analizapromo` entero.
   Y `ventasraras:13` (las compras de 20:52 a 08:52, una por una: las de la noche no las mira ninguna corta).
2. **Cuatro ayudantes (uno por cuenta, esfuerzo max)**: cada uno abre la ficha ENTERA de cada publicación de su cuenta y le hace
   las preguntas de `notas/preguntas.md`; recibe también los `raros` de su cuenta. Devuelve por publicación: estrategia, precio (o
   "igual"), pedido/caja si corresponde, el porqué con números y "no estoy seguro" cuando lo está. Sólo leen.
3. **Un quinto, ideas nuevas (max)**: el negocio entero, plata que se pierde o se puede ganar y nadie mira, medida y con (a)/(b).
   Lee `notas/ideas.md` para no repetir. Lo chico lo hago yo; lo grande al `pregunto:`.
4. **Un sexto, el revisor en contra (max)**, ANTES de aplicar: abre la ficha de cada publicación que cambia y busca en qué me
   equivoco (dato que no cierra, regla de la tabla 0 que pisé, pregunta sin contestar, decisión de menos de 7 días que deshago).
   Marca, no propone. Lo que no puedo resolver no se aplica esa vuelta.
5. Yo miro todo lo dudoso, lo que cambia más de 20% y lo que contradice una decisión de menos de 7 días. Si los ayudantes se
   cortan por límite, se rehacen y se dice: **nunca se aplica un juicio a medias.**
6. Listas de la completa que se vacían: 📦 sobra sin decidir · 🔎 sin afinar · 💸 paga o va a pagar stock antiguo · ⚠️ no vendió
   y no sé desde cuándo.
7. **El expediente pensado** (`escasez:expediente`): un juicio por bloque (QUÉ HAGO o POR QUÉ NO, con sus números). Entran los que
   se movieron y un tercio del resto: nadie pasa 3 días sin mirarse. Si no cambió nada, una línea; lo largo va donde algo se movió.
8. Pedidos (`decide_pedidos.py`) y cajas (`decide_cajas.py`) sobre el mismo log de `pedidostodo`, revisados a mano,
   `decido:archivo=pedidos;go` + `decido:archivo=cajas;go`. Si el log dice NO LEÍ o el script NO CIERRA, no se carga nada.
9. Juicios de precio (`juzgo:`) · `techo95;go` · frenos de techo a reabrir.
10. Toda publicación juzgada queda con su nota del 🧠 y QUÉ MIRAR MAÑANA (`decido:archivo=fichas_<fecha>;go`).
11. Los lunes: contar `notas/correcciones.md` de la semana contra la anterior.

===========================================================================================================================
- **🆕 que vende → 📈 en la misma vuelta (21/10/2026, él con el Sony EX15AP Blanco: *"no se buscó techo? (…) hagamos que todas las publicaciones que se puedan busquen techo ya mismo, sacando las que ya estamos con descuento, sobrestock, bajando y todo eso"*).** Un lanzamiento que vendió al precio de hoy ya no baja: sube a buscar el techo (+30%). Y en cada vuelta, lo activo con stock que no está en ninguna estrategia que lo explique (descuento, promo, sobra, bajando, volviendo, escasez, sin reposición, 🥊, gemela, excepción) y vendió a su precio, busca techo.

## 2 · QUIÉN HACE QUÉ
- El robot SÓLO junta datos. Yo decido todo. Él no marca nada a mano: me lo dice y lo hago por comando.
- Nunca tomar como dato una marca vieja del robot (escalera, liquidando automático, expediente viejo). Dato crudo.
- Él no toca precios ni promos; no hace falta que avise nada de eso.
- Lo grande o sin respuesta clara lo decide él: todo junto, numerado, (a) sugerida y (b). Lo chico y reversible lo decido yo y se lo cuento.
- Esfuerzo fijo (3a, 20/10; no se cambia sin que él lo diga): ayudantes de la completa, ideas y revisor en max; raros de las
  cortas en Alto; el chat con el nivel que él le ponga.

## 3 · PENSAR (🧠)
- **🧐 ¿Tiene sentido?** Antes de usar un número, cruzarlo: otro tamaño, otra cuenta, otra fecha, parecidos del rubro, el costo,
  cuántos lo venden. Margen de 150% o negativo = casi seguro un dato mal. Si no cierra, no se usa y se dice por qué.
- **Las preguntas de `notas/preguntas.md`** a cada publicación; la 20 ("¿qué me preguntaría él?") siempre.
- **La ficha se abre antes de tocar un precio** (`📋 ficha:` del expediente, o `ficha:<MLA>`): cada cambio con su resultado, los
  tramos de precio, mis notas, CÓMO REACCIONA (vende sólo ganando la caja → perderla es urgente; vende igual perdiendo → no se
  baja por la caja; las ventas no siguen a las visitas → el freno es precio o ficha; subió en una fecha → la próxima se sube antes)
  y MÁS DATOS (reposición y su costo hoy, reclamos 2+ → calidad antes de subir, competencia, día de la semana, edad del stock,
  opiniones, otras publicaciones del mismo producto). Con pocos días "es una pista", no se concluye.
- **Un precio que no rindió no se repite** hasta que cambie la razón (máx. 30 días, ver `techofreno`).
- **Toda decisión tiene su salida:** qué la deshace y dónde se mira. Si no la tiene, no está terminada.
- **Cada vuelta busca algo nuevo** (`notas/ideas.md`). **Correcciones:** a `notas/correcciones.md` y su pregunta a `notas/preguntas.md`.
- **No se baja el precio de algo que vende bien sólo para medir** (la prueba del tachado se canceló el 20/10).

## 4 · CÓMO SE ESCRIBE CADA DECISIÓN
- **Todo precio lleva estrategia** (`#tag`); no existe "base". Sin estrategia = ⚪ para decidir; sin stock = ⏸️. 🔒 `decido`
  rechaza un precio sin estrategia; `!piso` solo = 🛡️ excepción.
- **Tags:** 🔥 `escasez` · ⏳ `sinrepo` · 📈 `techo` · 🏔️ `techook` (🔒 sólo lo anota `techo95` al 95%) · 🪜 `bajando` · ↘️
  `volviendo` · ↗️ `desobra` · 📦 `sobra` · 💸 `descuento` (sólo nosotros) · 🏷️ `promo` (ML pone plata; `entrarpromo` elige solo) ·
  📉 `liquidando` · 🧨 `remate` (sólo él) · 🛡️ `excepcion` · 🆕 `nuevo` · 🎁 `fecha` · 🥊 `caja` · 💳 `gemela`.
- Lo que "vuelve" se nombra por el tag anterior (`pasajeDe`); ↗️/↘️ son un paso: con 7 días en ese tag entra a 🔎 sin afinar.
- 🔒 Un `decido` que baja con `#techo` o `#escasez` se guarda 🪜 bajando (techo y escasez quieren decir que el precio sube).
- **La nota en 4 partes:** QUÉ HICE (de $X a $Y) · POR QUÉ (estrategia + el dato) · QUÉ ESPERO VER (números) · SI NO PASA (días y
  qué hago). Si no se toca: HOY NO LO TOCO PORQUE … Sin `;`, sin repetir oraciones, una por variante.
- Las notas de Pedidos y Armar caja se leen en la tarjeta: la primera frase corta. Pedidos arranca con "Hola Tito!"; cajas, para Matías.
- **🔒 Banderas de excepción** (con "EXCEPCIÓN: …" en el motivo): `!sintecho` (bajar lo nuevo) · `!golpe` (escalón más grande o
  antes de tiempo) · `!sincerteza` (deshacer una suba sin 95%) · `!bajopiso` (abajo del 💰) · `!nosobra` (descuento sin sobra) ·
  `!piso` (abajo del 25%) · `!cruza` (barrera) · `!salto` (más del doble de una) · `!sinstock`.

===========================================================================================================================
## 5 · PRECIOS: LO GENERAL
- **Objetivo 25% en el PEOR caso**: retención de otra provincia 2% + el peor envío visto + cuotas (≈28% en el número normal). 🔒 Una
  baja que queda abajo pide `!piso`. Paso 🛡️ de todas las vueltas: lo que está abajo se sube DE UNA al precio del 25%, o se deja con
  `!piso` y motivo. Abajo del 25% se acepta sólo por stock antiguo, sobra de verdad o lo que pide él, y se cuenta como pérdida
  contra el 25%. 🔒 Nunca abajo de 0%.
- **Cada variante sola** (cada color/aroma en su publicación): su precio, su stock, sus ventas, su caja. Nunca el promedio. (Las
  variantes ADENTRO de una misma publicación se suben todas o ninguna: 🔒.)
- **El % de un producto se mide vendido SOLO**: los carritos no cuentan.
- **Plata por día NETA:** −$100 por unidad (trabajo) · −3% de lo facturado (tope de H) · −2%/mes del costo del stock parado. A igual
  plata neta gana el precio alto.
- **Lo barato** (hasta ~$5.500): cada unidad deja ~$1.000 o más; si no, se sube de una.
- **Barrera $33.000:** se frena en $32.999 salvo que cruzar deje claramente más con el envío restado (`!cruza`). 🔒
- **Terminaciones 90/990.** Cruzar un número redondo NO se frena (medido 13/10). 🔒 Si el redondeo deja el precio abajo del 💰 piso,
  se redondea PARA ARRIBA.
- **Comisión con escalones:** mirar la ganancia por unidad AL precio nuevo; subir y ganar menos no se hace.
- **La caja de compra orienta, no decide** (Full vale ~19%). Perdiendo y vendiendo bien → no se baja.
- **Venta barata ≠ remate:** remate sólo si estuvo parado de verdad (30+ d con stock vendiendo <1 por semana).
- **Venta abajo del 25% con poco stock** → se sube en la misma vuelta. **Lo nuevo que vuela** se sube al toque.
- **Lo que vuelve de agotado** se compara contra su último tramo con stock.
- **Vendedores del exterior** no se miran salvo que no haya argentinos: ahí su precio +20%.
- **Visitas que caen sin cambio de precio** → preguntas sin responder y descripción (lo arregla él, va al `pregunto:`).
- **Pendrives de Matías como familia**: el de 32 es el conveniente; 8 y 16 (⏳) pueden quedar más caros a propósito.
- **Juzgar resultados todos los días:** `supervisor:medir:go` + `juzgo:`; lo que perdió no vuelve por regla, se piensa. Nada en
  `espera` más de 30 días.

## 6 · TECHO (📈 → 🏔️)
- **Todo lo que vende sin techo conocido se prueba para arriba**, todas juntas. Afuera: escasez, sobra (+90 d), liquidando, mis
  promos, regalables en las 2 semanas antes de su fecha, frenadas por ML.
- **Cómo:** 🔒 **siempre un salto grande, nunca de a poco** (21/10/2026, regla suya: *"cuando buscan techo siempre dar un salto
  grande nunca ir subiendo de a poco. después cuando se encuentre el techo ahí sí bajar de a poco con descuentos"*): +30% como
  mínimo, mejor +40-50% (ML deja hasta +100%; 🔒 más del doble pide `!salto`). `decido` frena una suba #techo de menos de +30% salvo
  $32.990 por la barrera, el techo de $650.000 o `!chico` con "EXCEPCIÓN: …". **Cada escalón se mide antes del
  siguiente**: por certeza (Poisson sobre la plata por día: 3 esperadas y 0 = 5% · 6 y 0-1 = 2% · 10 y ≤2 = 0,3%), nunca un solo
  día. En lo que se compra de a muchos se cuentan COMPRADORES y 7 días mínimo.
- **Si funciona** (igual o más plata por día) → otro salto. **Si sale mal** → 🔒 se baja en escalera **como DESCUENTO propio con el
  precio tachado** (`entrarpromo:<MLA>=<precio>@PRICE_DISCOUNT#bajando`; `decido` frena bajar la lista de algo que ya probó su techo
  salvo `!lista` con "EXCEPCIÓN: …") (≤15% por escalón, uno cada 48 h),
  nunca abajo del último que vendía ni del 💰 piso, y se anota `techofreno:<MLA>=<precio>|motivo;go`.
- 🔒 **Una suba no se deshace por casualidad:** bajar del precio de una suba (5%+) de menos de 15 días pide 95% (Poisson sobre la plata
  por día) o las visitas a la mitad. Si no, se espera **15 días como mucho** (decisión suya 2b del 21/10: *"máximo 15 días de espera,
  después a"*): pasados los 15 días decide la plata por día de las dos ventanas — si la prueba deja igual o más, se queda (🔒 F4 no
  deja bajar); si deja menos, baja un escalón (≤15%, F2), no vuelve directo.
- **Visitas a la mitad y caja perdida durante una prueba** (decisión 3a del 21/10) → baja un escalón (≤15%), no vuelve directo al
  precio de antes. Después se mide ese escalón como cualquier otro.
- **Las rayas** (una sola cuenta en la web y el robot, `_rayas` = `rayasPrecioLinea`; días con 3+ u. en Full y con visitas):
  💰 **piso** = el precio que más plata por día dejó (5+ días; desde la primera venta hay uno provisorio, punteado). 🔒 No se baja
  de ahí salvo sobra, sin reposición o stock antiguo. 🔴 **techo** = el precio más bajo arriba del 💰 donde, al 95%, no deja la misma
  plata. La raya 🚧 de una prueba vuelta dice "N% seguro" o "sin certeza". Subir arriba del 🔴 → decir por qué no le creo.
- **🏔️ techo encontrado:** 🔒 sólo con `techo95` (95%); si no llega, vuelve a 📈. Corre en cada completa sobre las 🏔️ y las 🆕.
- **📏 Todo producto tiene su techo marcado** (21/10/2026, regla suya): 🏔️, raya 🔴 o raya 🚧. Las únicas excepciones: 📦 sobra,
  🪜 bajando por un motivo puntual (y ese motivo es el precio probado que no rindió, anotado en `techofreno`) o 📈 todavía buscándolo
  (🔥 escasez y 🆕 lanzamiento también buscan su precio; 💳 la gemela sigue el techo de su Clásica). 🔒 La primera baja 🪜 de `decido` anota sola el precio que no rindió en `techofreno`.
  `techofreno` (sin args, solo lee) lista 🪜 sin precio probado y 📏 activas con stock sin techo marcado: las dos se vacían en la completa.
- **`techofreno`**: el freno de no volver a probar se reabre si el más barato ajeno sube 8%+, ya no hay ajenos abajo, ganamos la
  caja o pasan 30 días (sin catálogo, sólo a los 30).
- Lista **📈 DICE TECHO/ESCASEZ Y NO SUBE**: se vacía en la vuelta (otro escalón para arriba, o el tag que corresponde).

## 7 · ESCASEZ (🔥)
- **Escasez = se corta antes de que vuelva a haber.** Cuándo vuelve: caja despachada ~8 d · oficina ~10 d (y se decide mandarla) ·
  Paraguay ~16-17 d · Bs As ~1 semana + caja (salvo que Pedidos lo pida hace 10+ d sin que entre nada a la oficina: ahí ⏳) · sin
  reposición = sin fecha (⏳). Poco en Full pero la caja/oficina llega a tiempo = "🚚 cubierto", NO escasez.
- Se mide con el **ritmo NORMAL** (no el de después de la suba) y con el de 7 días si se aceleró (⚡: 2+ u. y el doble del de 30 d).
  Para COMPRAR manda el ritmo de antes de la suba.
- **"Escasez" = el precio SE SUBE en esa vuelta.** Si decido no subirlo, el tag no puede ser escasez.
- **Primer salto** por el ritmo de ESA publicación: 3+/día ×4 · 1-3 ×3 · <1 ×2 · <1 cada 2 días ×1,5 (con `!salto`). Lo que ya falló
  más arriba (`notas/techo.md`), variantes, liquidando y mis promos: el precio que pienso, sin ×3/×4. Techo $650.000; la barrera se
  cruza sólo si deja más. La caja de compra no frena.
- **Escalera de escasez:** si no vende, −25% a las 12 h (3+/día) · −20% a las 24 h (1-3) · −15% a los 2-3 días (<1); si vende de
  más, sube un escalón. Nunca abajo del precio normal. Con caja despachada: que la última unidad salga cerca del día 8.
- **Se trata en la MISMA vuelta en que aparece**, y si hay oficina se decide la caja (poco si venía lento). Pocas unidades: se
  rejuzga con cada venta; la 2ª que confirma el ritmo y deja en escasez → se sube sí o sí.
- Si ML la pausa por el precio → se vuelve al último precio que aceptó (excepción a la escalera).
- **Se juzga sólo por lo cobrado de más**; la única pérdida es stock caro al llegar la caja. Si al ritmo normal ya alcanza, vuelve al
  normal antes (lo marca la lista 🔁).
- **Al terminar:** no volver a ciegas. Si deja igual o más plata por día que el normal, se queda; si no, se busca el medio arrancando
  por el tramo de la escalera que mejor anduvo, con certeza, en escalera. Lo encontrado a `notas/techo.md`.

## 8 · SIN REPOSICIÓN (⏳) Y NO SE CONSIGUE
- **Qué es:** Nissei no lo tiene · el precio de Paraguay no da 25% · Bs As "no se consigue" (Pedidos lo pide hace 10+ d sin que
  entre nada) · "no lo consigo" marcado (`cyc/noconsigo`) · Paulvic que no vino · De la Patagonia y lo marcado "no se consigue más".
- **Vender TODO en ~100 días** (nunca 120) al precio más alto que lo vacía: ritmo objetivo = (Full + camino + oficina) ÷ 100. Si vende
  más rápido, se sube; si más lento y no se vacía, se baja en escalera (gana no pagar stock antiguo).
- Si aparece mercadería nueva o vuelve a poder comprarse: se rehace la cuenta y se le pregunta si ese proveedor sirve.
- 1-2 unidades no se tocan más.
- **9 pedidos en 0 desde el 16/10** (Ferrari Negro, Halloween Kiss Sexy y Kiss, Ted Lapidus Rumba, Cool Water, Sony ZX310, SSD 1TB,
  Buds Core, VS STARLIT Bare Vanilla): si vuelve Nissei o baja el precio, se vuelven a pedir.

## 9 · BAJAR: ESCALERA, SOBRA, DESCUENTOS, PROMOS, STOCK ANTIGUO
- 🔒 **Toda baja en escalera** (F2-F3): ≤15% por escalón (25% en escasez), uno cada 48 h (12 h en escasez). Excepciones: las cinco
  de la sección 0, con `!golpe` y "EXCEPCIÓN".
- 🔒 **No abajo del 💰 piso** (F5) salvo 📦 sobra, ⏳ sinrepo, 📉 liquidando, 🧨 remate.
- **Sobra (📦):** más de 90 días de stock **en Full** al ritmo **con stock** (días en cero no cuentan), o sin ventas en 60 d. (La
  oficina no paga almacenamiento: se manda o no, pero no hace "sobra".) Lista **📦 SOBRA Y NO LO DECIDÍ** en la completa; lo
  llegado hace menos de 30 días va aparte (es lanzamiento).
- **Primero descuento, no bajar la lista:** descuento propio (mínimo 5%, 14 días) o promo de ML si pone plata, con el mismo neto.
  Nunca subir la lista para inflar el tachado.
- 🔒 **🤔 ¿Tiene sentido este descuento?** (F6, `entrarpromo` y `decido` con #descuento/#promo/#sobra): sobra de verdad (90+ d en
  Full al ritmo con stock) y no recién llegado (30+ d desde la última entrada). Y 🔒 25% en el peor caso (o `!piso`). No aplica a
  las escaleras con causa propia: techo, escasez, lanzamiento con 🏔️, sinrepo, fecha. **Bajar algo que no sobra** (salir de una
  prueba de techo, de escasez o de lanzamiento) va como 💸 descuento con el precio de antes tachado, con su tag
  (techo/bajando/escasez/lanzamiento), no bajando la lista (decisión 1a del 21/10). Las promos de ML pasan por lo mismo:
  que ML ponga parte no la justifica sola. Lista **🤔 MIS DESCUENTOS QUE YA NO TIENEN SENTIDO** todos los días.
- **Promos de ML:** las analizo en cada completa (`analizapromo` entero) y entro si deja más plata y pasa el 🤔. Mías en
  `cyc/promoclaude`; el guardián saca las que nadie analizó. Medir si vende más (plata por día antes vs durante), no suponerlo.
- **Stock antiguo:** lista **💸 PAGA O VA A PAGAR STOCK ANTIGUO**, color por color (ML cobra por código de Full); cada SIN DECIDIR se
  decide en la vuelta (descuento `!piso` para vaciarlo antes del cierre, retirar, o por qué se deja). Antes, confirmar en la línea
  que no estuvo en cero después del lote. Fecha aproximada ≠ recién llegado (va a ⚠️ NO VENDIÓ Y NO SÉ DESDE CUÁNDO). Nunca subirle el
  precio a algo que paga stock antiguo sin decir por qué. Antes de retirar, comparar retiro contra rematar al 0%.
- **Cuando él retira de Full:** rehacer el descuento con las unidades que quedan ÷ ritmo a cada precio contra los días al stock
  antiguo. Si a precio normal salen a tiempo, sin descuento.
- 🧨 **Rematar a cualquier precio** sólo si él lo pide: `entrarpromo:<MLA>=<precio>@PRICE_DISCOUNT!piso!bajocero|motivo;go`.
- Lo medido de las visitas (20/10, `vistas:150`): bajar 3-25% sube visitas +22% a +56%; subir 3-10% casi no toca ventas; subir +25%
  baja ventas ~30%; perder la caja −40% ventas; tachado contra liso SIN PRUEBA todavía (se vuelve a medir el 28/10).

## 10 · LANZAMIENTO (🆕)
- **Arranque ~20% arriba** del precio que creo correcto (25%+ en el peor caso), tag 🆕, 7 días con stock a ese precio de lista.
  Lo nuevo que nunca estuvo en Full se pone a precio ANTES de activarse.
- **Si vende** → 📈 buscar techo desde ahí.
- 🔒 **No se baja** (ni descuento, ni promo, ni lista, ni para ganar la caja) **hasta que `techo95` diga 95%** (visitas × conversión
  típica a ese precio, λ ≥ 3 con 0 ventas) y anote 🏔️. Ahí escalones de ~5-8% como descuento propio con el arranque tachado
  (`entrarpromo:<MLA>=<precio>@PRICE_DISCOUNT#bajando|lanzamiento …`), cada uno con 95% o 7 días sin venta con visitas. Nunca abajo
  del 25% peor caso: ahí pasa a 📦. Reloj de fondo: 4 meses; a ~60 días sin venta entra la 📦.
- Si casi no lo ven (<1 visita/día), bajar no lo arregla: título, fotos, caja.

## 11 · PREMIUM Y GEMELAS (💳)
- Premium que gana la caja se queda en Premium. Una Clásica gemela nunca al precio de su Premium.
- Premium contra Clásica con plata NETA (la Premium factura más: más IIBB, mono y tope de H): vale sólo si deja igual o más por día.
- La gemela la creo yo: `gemela` (solo lee) · `gemelacrea:<MLA>=<precio>:go` (misma publicación, comparte stock, tag 💳). Se juzga
  por las ventas que la Clásica sola no hacía.

## 12 · PAUSADAS, PUBLICACIONES, VÍNCULOS
- Activar lo pausado con stock en Full es prioridad en todas las vueltas; lo que no se activa, al `pregunto:` con motivo. Lo que está
  en depósito (fuera de Full) se pausa solo.
- Publicaciones nuevas: las crea él en ML; yo la ficha y el vínculo (la ficha toma el nombre de ML). La mercadería no se mueve entre cuentas.
- Frenadas por ML: no se toca precio; si hay que arreglar algo, se le avisa.

## 13 · VENTAS Y PREGUNTAS
- Cada venta contra su ficha en cada vuelta. Lo de una sola vez (retención, cuotas, carrito) no toca el precio. Las ventas en promo
  de la vuelta se cuentan en el chat.
- Preguntas: sólo las que sé sin duda, cortas, sin teléfonos ni links; nada de más de 7 días. Las que no sé quedan en ML y en el chat
  (no van a Telegram). Reclamos que esperan su respuesta: recordárselo una vez por día como mucho.

## 14 · PEDIDOS
- **Completos, todo el catálogo**, en la completa: objetivo 30 días; 45 en Bs As que se cortó 2+ veces en 60 d, vende 0,5+/día y
  deja 25%+, y en lo nuevo que vuela (1+/día la primera semana). Ritmo por día con stock (y por color); stock de las 4 cuentas
  sumado; sin costo no se pide; el precio para el máximo = mediana cobrada en 60 d (no el de escasez). Máximo por color con `pvVars`
  (el precio que el color sostuvo 2+ semanas, nunca de escasez ni de la primera semana de techo).
- Navidad: en la completa del 14/11, medir lo que subió en Navidad 2025 (17-30/12) y pedirlo para 45 días.

## 15 · CAJAS
- 37 días (30 de venta + 7 de viaje); 60 sólo en lo parejo sin prueba abierta (`notas/sin_estirar.txt`); nada pasa 90 días; lo
  nuevo sale con el mínimo de 4. Una cuenta SIN publicación no recibe el mínimo si otra tiene stock de ese color; la que ya publica y
  está en cero, sí. Respetar el cupo (lo vendido no devuelve cupo). Costo de la caja $17.310.
- Con varias cuentas posibles, decidir a mano mirando `cajasnotas`. Las que ML dio por entradas las marco yo (`cajallego`).
- Caja para mandar ya de algo que vende fuerte y está en 0 en Full → al `pregunto:`.

## 16 · PARAGUAY
- Pedidos de ~US$1.000 cada 2-3 semanas. Lo no urgente espera al próximo; lo que se corta antes de que llegue se pide igual.
- Precios y códigos SÓLO de comprasparaguay (la fila de Nissei), nunca nissei.com. El chat local los copia una vez por mes.
- Para pedir: 25% (no 24) **y** catálogo de ML con 2+ vendedores **y** confirmado que es el mismo producto (✅ `mismoOk` o `revcand`
  ok de ESE catálogo). 🔒 **Y al final las 100 vendidas (21/10/2026, regla suya):** sin el dato entra igual; cargado y abajo de 100
  queda afuera (`CAND_MIN_VENTAS`, web y robot). Las mira el chat de compras sólo de lo que pasó todo (`faltaventas`).
- Cuántas de cada nuevo (decisión 4a del 21/10; las vendidas ya no se cargan): 🔒 barato (≤US$15 crudo) → 3 · caro (+US$60) → 1 ·
  resto → 2 (`candMaxU`, botón 🪄 Llenar). Lo que vuela se repone en el pedido siguiente por sus ventas.
- Ticket real obligatorio para cerrar (`compray:<fecha>|det=…|go`); gastos: dólares, retira, correo (monto y kilos); `adelanto=` y
  `cambio=` sólo cuando él avisa. Recargo: el medido de los pedidos (respaldo 20%).
- Al llegar: ficha (pagado × recargo), cuenta por rubro (perfumes → Adriana) y equilibrio, vínculo.
- Dos proveedores (Nissei, Elegancia) y dos pedidos en Nissei (perfumería y resto).

## 17 · LISTAS (otros proveedores)
- Todas se miden contra ML, también Dai Nippon (que no tiene pedido: lo trae Tito). Para que "dé": 25% y catálogo con 2+ vendedores
  y el mismo producto confirmado (`listadato` ok o `mi=`) y, al final, no menos de 100 vendidas si están cargadas. Un solo vendedor
  no vale como precio.
- Nunca cargar una lista vieja. Se paga el neto, no el precio de lista (preguntar antes de cargar). Iscos: sólo lo de su web, ×0,665.

## 18 · PAULVIC
- Pedido cada 15 días para 45 días por aroma, redondeado a 3/5/10/20/50 (lo que él cambia a mano no se toca). Nunca "Sólo este
  color" en motivos ni en el copiar.
- Costo = el del último pedido: (pagado + flete) ÷ (llegadas + testers + regalos perfume). Lo que se pide y no viene, no se pide más (⏳).
- Pagar en 7 días hábiles desde que llega.

## 19 · PLATA
- El 1º de cada mes: retiro = "💸 cuánto cobrar" del mes cerrado (`cobromes`). La deuda de H con ARCA queda en CYC.
- Gasto de Full del mes: `cargosmes` en la completa del 15 (el período de ML va como gasto del mes siguiente).
- Gastos a mano: la lista de Gastos dice qué falta; recordárselo a fin de mes.

## 20 · TELEGRAM
- Sólo `pregunto:` con decisiones suyas (todas juntas, numeradas, (a)/(b)) o lo importante que sólo él puede hacer y cuesta plata
  (reclamo esperando, ML frenó algo que vende, vende fuerte en 0 en Full con oficina, costo faltante en algo que se vende). Nunca
  "subí/bajé/activé". Sin datos de compradores. `resumen:` no se manda.

## 21 · AL CAMBIAR ALGO DEL SISTEMA
- `REVISION.md` en su etapa, en el mismo commit; subir a la rama de la sesión y a `claude/add-folder-78ysyb`. Web: `APP_VERSION`,
  `APP_CAMBIOS`, `CACHE` de `sw.js`. Workflows: sin opciones repetidas en un paso.
- **Toda regla nueva que diga "nunca", "siempre" o "sólo si" y se pueda medir con un dato va al código** (`frenosBajas` u otro
  freno), no sólo acá. Acá se marca 🔒.

## 22 · PENDIENTES VIVOS (se borran al cerrarse)
- **27/10:** `techo95` de los 5 lanzamientos (Halloween Man, Ferrari Rojo, Adyan Oud, microSD Pokémon, WD 480; su precio actual es el
  de arranque); baja sólo el que llegue al 95%.
- **28/10:** `vistas` sobre las 12 que el 20/10 pasaron de descuento a precio liso al mismo precio (tachado contra liso).
- **02/11:** medir promos en el CyberMonday. **14/11:** Navidad (sección 14).
- Paulvic: juzgar la prueba de $21.990 (si perdió, volver a $14.950, no a $14.360; si ganó, extender primero Persea) y la idea de un
  Paulvic de hombre a ~$17.990 (escalón de comisión de $15.000).
- Paraguay 08/10: falta el correo (monto y kilos). Paraguay 08/09: pesos de los dólares, ticket, retira, correo. Transferencia de
  $50.000 del 29/09: preguntar de qué es.
- Dinero que rinde en MP: lo revisa él en la app de cada cuenta.
