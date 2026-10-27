# 🧠 CEREBRO · REHECHO EL 21/10/2026 (pedido suyo: *"fijate si es necesario rehacer el cerebro (…) hay reglas viejas, que se pisan. manejalo"*)

**Cómo se usa.** Cada vuelta (03:00 completa · 11:52, 13:52, 15:52, 17:52, 19:52, 21:52, 23:52 cortas) arranca leyendo ESTE archivo y
`notas/preguntas.md`. Cada regla está UNA sola vez y en su versión más nueva. Las viejas, repetidas o pisadas se sacaron (el
archivo de antes quedó en `notas/cerebro_viejo_20261021.md`, sólo como historia: no se usa). La historia de cada regla (fecha,
frase suya, el caso) está en `HISTORIA.md` (hasta el 22/10) y en `REVISION.md`. **Regla nueva → va en su tema acá, en `CLAUDE.md` y en
`REVISION.md`, en el mismo commit; si toca cómo se juzga una venta, también en `VENTAS.md`.**
Si una regla nueva choca con una de acá, se REEMPLAZA la de acá (no se agrega abajo): así no vuelven a convivir dos versiones.

**🔬 TODAS LAS VUELTAS SON PESADAS Y LAS VENTAS SE ANALIZAN AL MÁXIMO (21/10/2026, regla suya; manda sobre cualquier prompt de tarea
que diga "liviana" o "gastá poco"):** *"necesito análisis máximo en las ventas"* y *"todas las revisiones son pesadas con esfuerzo más alto,
se quita eso de gasta poco"*. **Y CADA VENTA SE ANALIZA UNA SOLA VEZ** (*"no quiero que una venta se evalúe dos veces. para no
gastar tokens de más. que cada venta tenga un análisis profundo con esfuerzo máximo y listo"*). Cada vuelta (las de cada 2 h, 11:52 a 23:52 desde el 21/10, y la de
las 08:52) arranca con **`buzon`** (📬 lo que dejó el chat de Chrome de las cajas o él; se resuelve y se marca `buzon:leido=<ts>;go`, 25/10; el mensaje `RUTINA <fecha>` de la rutina diaria del chat de Chrome, 26/10: `cupo:` → `cupo:<cuenta>=<chicos>/<grandes>` · `mp:` → `ancla:<cuenta>=<pesos>@<AAAA-MM-DD HH:MM>;go` por ml-sync **con la hora en que lo leyó** (la del renglón; si no la trae, la del mensaje del buzón, nunca la de la vuelta: sin `@` lo que se liberó o se pagó en el medio se pierde hasta el día siguiente, revisión Plata 27/10), sólo si el número es claro (un "?" no se carga) · `pedido:` con algo que SUBIÓ o AGOTADO → decírselo a él antes de que pague) y **`ventasraras:nuevas`**, que trae SÓLO las ventas posteriores a la última analizada; cada publicación de esas
ventas se mira con su FICHA COMPLETA (`ficha:<MLA>`, varias en un disparo): año entero, reacción al precio, caja, competencia, stock,
reposición, fechas, rayas, y queda con estrategia bien pensada (🧭 sin ⚠️). Al terminar la vuelta, `ventasvistas:<ts>|esf=<esfuerzo>|<MLA>=<qué pasó y qué resolví>|…;go`
(el número que imprime el 📌; `esf` = el esfuerzo que usé de verdad: max, xhigh, high…) marca hasta dónde se analizó y deja en
CADA venta su análisis (`cyc/ventaanalisis`): la tarjeta lo muestra gris si no cambió nada y del color de la estrategia si cambió
(21/10, pedido suyo). El texto por MLA va siempre que hubo algo que contar (sin `;` ni `|`); sin texto sale el motivo de la estrategia; la vuelta siguiente no las vuelve a ver. Si la vuelta se corta antes de anotar, la
siguiente las retoma: nunca quedan sin analizar. **🔬 CAMBIO DEL 22/10/2026 (él eligió 2a, manda sobre lo de abajo): al ayudante en máximo van SÓLO las ventas de la lista 🔬 A FONDO
de `ventasraras` (rara o abajo del 35% o sin costo · sin estrategia con techo · escasez · lanzamiento que vendió · prueba de techo con 7+ días
para juzgar). Las "✓ normales" se cierran en el `ventasvistas` sin texto y no se les lee la ficha. Él: *"lo que quiero es que lo haga de
la forma más efectiva posible y que no me tenga que estar fijando a cada rato, cada venta si tiene error"*. Y al terminar CADA vuelta
(3a, desde el 22/10 con el detector, que reemplaza a `bajastecho:1` y manda sobre lo que diga la tarea): **🔎 `errores` por consulta**
(mira el resultado de TODO cambio de precio y descuento de las últimas 26 h contra cada error que él ya marcó, ver §0b); si sale algún
❌ pendiente, **`errores:go` en la ml-sync de la vuelta** lo deshace (vuelve al precio de antes o sale del descuento, releído) y le
manda UN aviso. Los ❌ "anotados antes del detector" (sin `fmt: 2`) no se deshacen a ciegas: se mira cada uno (puede ser una decisión
suya, ej. el arranque de lanzamiento del 20/10 de WD, microSD y Adyan) y se corre el comando que imprime o queda una nota en el 🧠 con
el porqué. Ninguna vuelta termina con un ❌ vivo sin decidir.** **Las ventas las piensa SIEMPRE un ayudante (Agent con `effort:"max"` escrito en la
llamada), aunque sea UNA sola venta (21/10, regla suya: *"no quiero que dependan de la config de esfuerzo que tengo yo"*): el chat
corre con el nivel que tenga la sesión, el ayudante con el que se le pide.** El ayudante lee las fichas y propone; decidir y aplicar es
mío, siguiendo lo que propuso (si no le hago caso, lo digo en el 🧠). `esf=` del `ventasvistas` = el del ayudante (max). Una publicación que vuelve a vender en otra vuelta se mira por esa venta NUEVA (lo que
cambió desde la decisión anterior, que ya está en su ficha), no se rehace el análisis de la venta vieja.
La de las 08:52 además mira lo que no depende de las ventas (pedidos de todo el catálogo, cajas, lo que no vende 📏/🔎/📦, juicios del
supervisor, promos a fondo, fotos de candidatos): eso NO se saca, porque lo que no vende nunca dispara una revisión de venta.

**🏔️ EN CADA VENTA, LO PRIMERO ES LA LÍNEA DE TECHO (21/10/2026, regla suya; manda sobre cualquier prompt de tarea).** Después del
Persea y del Aer Jasmín (bajados sin techo, y la revisión de prueba los dio por buenos): por cada publicación que vendió, antes de
cualquier otra cosa, mirar en su ficha si tiene 🔴 techo al 95% (rayas) o 🏔️ de techo95. **Si no lo tiene, la decisión es 📈 buscar
techo (subir con salto grande)**, salvo sobra, sin reposición, liquidando, remate o escasez, y el texto del `ventasvistas` lo dice.
"Ya probó techo", "va volviendo al normal" o "está bien a este precio" NO alcanzan. Si la ficha o la corrida dicen DATOS INCOMPLETOS,
esa venta no se decide: se vuelve a leer. Ver §0 fila 4b y §6.

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
| 4 | **Nunca abajo de 0%** (sólo él lo abre: `!bajocero`, sólo en `entrarpromo` y 🔐 con su "autorizo" por Telegram) | 🔒 F0 |
| 4b | **SIN LÍNEA DE TECHO NO SE BAJA** (21/10/2026, él: *"nunca puede bajar si no hay línea de techo y si no hay línea de techo tiene que buscar techo hasta que esté 95% o más seguro de que ése es el techo"*). Línea = 🔴 de las rayas o 🏔️ de techo95. Sin línea: 📈 buscar techo (subir). Afuera sólo sobra, sin reposición, liquidando, remate y la salida de una escasez. **Pasados 15 días de la última suba deja de frenar y decide la plata por día (F4)**. **`!sinlinea` es 🔐 SÓLO SUYA (22/10): escribirla no alcanza, hace falta su "autorizo" por Telegram (ver 🔐 abajo); lo que vendieron OTRAS variantes o la familia NO alcanza nunca** (22/10, él con los Protectores de talón: *"si no encontró techo, ¿por qué bajó?"*). Única salida mía sin él: corregir el precio de una publicación que NUNCA estuvo activa ni vendió, al activarla (`!activar` + "EXCEPCIÓN: …"; lo verifica la línea de tiempo) (2a, 21/10: si no, lo que vende poco quedaba trabado) | 🔒 F7 · lista 🔎 |
| 4c | **ARRIBA DEL 💰 NO SE BAJA SIN 95%** (21/10/2026, él con el Pendrive 8gb: *"antes de bajar tenés que estar 95% seguro o más que ese precio genera menos ganancia que la línea de ganancia. Si estás seguro volver a bajar en escalera (…) si ves que genera más dinero entonces subir la línea de más ganancia a ese precio"*). Con 🔴 encontrado y el precio arriba del 💰: días seguidos con stock al precio de hoy contra lo que tenía que vender para igualar la plata por día del 💰 (Poisson). Con 95% → otro escalón (al 💰 o al medio); sin 95% → se queda, estrategia 💰 `punto` (*buscando el de más ganancia*). Si deja más, la raya 💰 sube sola. Afuera lo mismo que F5 | 🔒 F8 |
| 5 | **Lo nuevo no se baja sin 🏔️ al 95%** (primera tanda en Full de menos de 30 d, o 🆕 lanzamiento). Ganar la caja NO es excepción. `!sintecho` es 🔐 sólo suya | 🔒 F1 |
| 6 | **No llegar a pagar stock antiguo** (120 d lo chico, 60 lo grande/Tenders; apuntar a ~100). **15 días antes: ganar la caja bajando hasta el 0% (al costo); si no se vende, se retira 3 días antes de pagar stock antiguo** (27/10, él: *"vende al costo antes de retirar. 3 días antes de pagar por stock retiramos"*) | 🧠 (la lista 💸 lo trae) |
| 7 | **Escasez: se sube** para que dure hasta que vuelva a haber. "Escasez" siempre = el precio sube | 🧠 + la lista 📈 |
| 8 | **Sobra: se baja en escalera** — lo caro que no vende: a los 60 días sin vender, hasta el precio que GANA la caja (26/10, él) | 🔒 F2-F3 la escalera · 🧠 cuánto |
| 8b | **🌸 Perfumes nunca abajo del 10%** en el peor caso (26/10, él): antes de liquidar más abajo se retira a la perfumería del local; cerca de pagar stock antiguo se le avisa para que lo retire | 🔒 F12 (salida sólo suya: 🔐 !bajocero) |
| 8c | **Bajar pide 95%, subir pide 50%** (26/10, él): una suba sólo si es más probable ganar que perder; si `techo95` ya da 50%+ de que el precio en prueba es el techo, se espera | 🔒 freno 50% en `decido` (salvo 🔥/⏳, volver a un precio de 90 días, `!chico`) |
| 9 | **35% en el PEOR caso** (🛡️) | 🔒 en bajas · lista 🛡️ |
| 10 | **Buscar el techo** en todo lo demás | 🧠 |
| 11 | **Formas:** escalera (≤15% por escalón, 25% en escasez; uno cada 48 h, 12 h en escasez; mis descuentos también son escalones) · una suba no se deshace sin 95% (🔐 `!sincerteza`) · no abajo del 💰 piso · en escasez nunca abajo del precio de antes (F9) · 90/990 · barrera $33.000 · descuento sólo si tiene sentido (🤔) | 🔒 F2-F9 |

**Choques ya resueltos (no se vuelven a pensar):**
- *25% vs stock antiguo* → gana 6: se baja abajo del 35% para que salga a tiempo (tag 📦 `sobra` o ⏳ `sinrepo`). El 🧠 lo dice
  y lo que falta para el 25% se anota al error de origen (mandar/comprar de más). El cerebro se juzga contra NO hacer nada.
- *Escasez vs techo conocido* → gana 7, pero con el precio que pienso (no ×3/×4): ya se sabe que más arriba no rinde.
- *Escasez vs stock que YA paga almacenamiento o stock antiguo* (22/10/2026, él con el F9: *"el sobra stock puede convivir con
  escasez (…) todo el stock está pagando almacenamiento y al ritmo que viene se va a acabar, lo cual está bien"*) → conviven y gana 7
  (se sube), pero el precio se elige con la plata por día NETA de lo que cuesta cada día de más que esa mercadería queda en Full
  (almacenamiento y stock antiguo por unidad, de `cargosmes`/la lista 💸). Se sube hasta donde el extra por unidad paga los días de
  más; si subir hace que lo que paga stock antiguo no salga antes del próximo cobro, se sube menos. Que se acabe NO es un problema:
  es justo lo que conviene. Tag 🔥 `escasez`, y el 🧠 dice que además paga almacenamiento.
- *Escasez vs mercadería en camino u oficina que llega a tiempo* → NO es escasez: "🚚 cubierto", se manda la caja.
- *Buscar techo vs sobra* → con sobra no se busca techo: primero sale lo que sobra.
- *Descuento mío vigente vs suba de lista* → primero salir del descuento (`entrarpromo:…=salir`); nunca inflar el tachado. 🔒
- *🔥 Escasez o ⏳ sin reposición* → **NUNCA se baja sin techo al 95%** (🏔️ de techo95 o 🔴 de la línea), en todo caso sube (24/10, él: *"si está en no se puede reponer o falta stock o escasez NUNCA se pueda bajar si no hay techo 95% seguro, con una sola excepción, que esté llegando a los 4 meses de stock en Full y esté por pagar almacenamiento. Nada más"*). Freno F11 en `frenosBajas`. La única excepción: la unidad más vieja a 20 días o menos de que ML cobre stock antiguo (120 d lo chico, 60 lo grande); ahí se baja en escalera. Escribir #sinrepo ya no abre ningún freno. La salida de la escasez (↘️ #volviendo) pasa sólo con el stock que alcanza 30+ días.
- *Una regla dice A, otra B y ninguna fila lo resuelve* → no se hace nada esa vuelta, se anota y va a `notas/para_mati.md` con (a)/(b).
  Después se agrega la fila acá.
- **Las excepciones a los frenos son siempre las mismas cinco:** precio mal puesto · stock antiguo con fecha encima · ML la
  pausó por el precio · lo pide él · el envío (cruzar la barrera de $33.000 cuando deja claramente más). "Ganar la caja", "para ver si sale"
  y **"la última unidad" NO son excepciones** (24/10/2026, él con el Cuba Gold: *"que baje cuando encuentre techo en escalera, no de una a
  $32.990, excepto que haya algo con el envío o cosas excepcionales"*): la última unidad también baja en escalera y con línea de techo.

### 0b · PARA DECIDIR CON ÉL — vacío (las 4 del 21/10/2026 las decidió él ese mismo día: 1a 2b 3a 4a, ya están en sus secciones)
Lo que choque y no tenga fila en 0 va acá con su regla provisoria hasta que conteste; al contestar, pasa a su sección y se borra de acá.
La etapa 8 de la revisión (Reglas del cerebro, cada 7 días) mira que esto quede vacío.

### 0c · 🔐 UN AVISO ALCANZA (22/10/2026, él eligió todo: no quiere marcar el mismo error dos veces)
Después de los 3 Protectores de talón (22/10: el freno "sin línea de techo no se baja" existía y se pasó por la salida `!sinlinea`).
- **Toda baja pasa por las mismas reglas** (`frenosBajas`, F0-F9): `decido` y `entrarpromo` antes de escribir, y LA PUERTA de
  `setPriceTo` para cualquier otro camino (`alpiso`, `bajar`, `tocados`, `unapub …bajar=/empatar`, la noche). Las gemelas siguen a
  su Clásica. La lista de caminos está en `REVISION.md` (etapa 1, 22/10).
- **🔐 Salidas SÓLO SUYAS:** `!sinlinea` · `!sincerteza` · `!sintecho` · `!bajocero` · la estrategia 🧨 `#remate`. Si las escribo sin
  su autorización vigente, el cambio NO se hace: queda pedido en `cyc/autoriza/<código>` y le llega UN mensaje numerado a su canal
  privado. Él responde a ese mensaje "autorizo K7M3" (o "autorizo todo", o "no K7M3"); la vuelta siguiente del ciclo lo lee (sólo de
  su chat, firmado con el token del bot) y vale 48 h para ESE renglón (misma publicación, bandera y precio). **Al empezar cada vuelta:
  `autoriza` (consulta)**: lo ✅ autorizado se corre con el renglón que imprime, en la ml-sync de la vuelta. Lo que él rechazó no se
  vuelve a pedir por 48 h. Mis banderas (`!golpe` `!bajopiso` `!nosobra` `!piso` `!activar` `!chico` `!lista` `!escalon` `!cruza`
  `!salto`) siguen siendo mías, con "EXCEPCIÓN: …" en el motivo.
- **🔎 El detector `errores`** cierra cada vuelta (ver arriba): mira el RESULTADO de cada cambio de precio y descuento (mis cambios,
  mis descuentos, el robot y la foto de precios) con las mismas funciones que deciden, en el momento de cada cambio.
- **Regla para lo que venga:** cada corrección nueva suya (`notas/correcciones.md`) agrega su chequeo al detector (`detectarErrores`
  en sync.mjs) en el mismo commit, y si se puede medir, su freno en `frenosBajas`. Una salida que ya falló pasa a ser 🔐 suya.

===========================================================================================================================
- 🔒 **No bajar lo que él marcó** (23/10/2026, la waflera: *"que sea una excepción si el robot decide bajarlo, quizás lo mejor sería no tocarlo"*): `cyc/nobajar/<MLA>` (comando `nobajar`); freno F10 en `frenosBajas` (decido, entrarpromo, la puerta y el detector). Sólo con su autorización (`!nobajar`, 🔐). **Sacar la marca también pide su "autorizo"** (24/10, 38a): `nobajar:-…;go` sin autorización se la pide por Telegram.
- **Renovar el MISMO descuento no es una baja** (24/10, 46a): no lo frenan F5 (💰), F7 ni F11.

- 🔒 **Publicar: 35% mínimo en el peor caso** (23/10/2026, él): ninguna publicación nueva arranca abajo de 35% (`PUBLICAR_MIN_PCT`, freno en `publicar`). Lo que hoy no llega se publica a su precio de 35% y espera (el otro vendedor se queda sin stock); bajar recién cuando se acerca el stock antiguo, con las reglas de siempre.

## 1 · CADA VUELTA, EN ESTE ORDEN

**Cortas (10:52 a 20:52, cada 2 h):**
1. Leer este archivo y `notas/preguntas.md`.
2. Lecturas en UNA ml-consulta (uno por renglón): `autoriza` · `planilla` · `escasez` · `raros` · `lupa` · `ventasraras:5` · `pausadas:25` · `analizapromo:7` · `preguntas`.
   **El log se baja ENTERO a un archivo** (no con `tail_lines` chico) y antes de usarlo tienen que estar los N `##### ✓ terminó:` y la
   línea final "todos bien"; si falta uno, se repite esa lectura. Una lista que dice "faltan N sin leer" no cuenta como vacía.
3. **Listas que quedan VACÍAS al terminar** (cada renglón: decisión o nota con motivo): 🛡️ abajo del 35% peor caso · 🚨 escasez
   que vendió después de mi decisión · 📈 dice techo/escasez y no sube · 🤔 descuentos que ya no tienen sentido · 🔁 subas por
   escasez/sinrepo cuya razón cambió · 🧭 fuera de lo normal · 🔀 no cierra.
4. ⚠️ dato dudoso: no tocar precio, anotar. 💭 sin certeza: juzgar en familia, por visitas o por parecidas, nunca colgado.
   📅 **Antes de cada decisión, el calendario** (24/10, él): ¿en qué franja del mes estamos (11-15 fuerte, 1-5 floja en plata,
   `cyc/mlconfig/franjasMes`) y qué fecha especial viene (`fechas`)? **Es un dato para pesar, no un "nunca"**: a veces conviene esperar 2-3
   días a que llegue lo fuerte antes de decidir, y a veces no (ej. algo por pagar stock antiguo con una fecha cerca: comparar cuánto cuesta
   esperar contra lo que suma la fecha). Pedidos y cajas: que el stock llegue antes de lo fuerte; las ideas miran la próxima fecha.
   🧭 + 🔀 + 💭 los piensa SIEMPRE un ayudante con `effort:"high"` escrito en la llamada (21/10: nada depende del esfuerzo de la
   sesión), aunque sean pocos. Aplicar siempre es mío.
5. Cada venta nueva contra su ficha: ¿1ª o 2ª después de un cambio? ¿confirma o desmiente la prueba? ¿se aceleró ⚡? ¿la dejó en
   escasez? ¿se vendió en promo? Escasez nueva se trata en ESTA vuelta (precio + caja si hay oficina).
   🔒 **Y cada venta deja su producto con estrategia pensada** (21/10/2026, él: *"quiero que siempre se mire con detenimiento venta x
   venta, así todos los productos quedan con estrategias siempre y con estrategias bien pensadas"*): `ventasraras` termina con
   **🧭 ESTRATEGIA DE LO QUE VENDIÓ**; cada ⚠️ (sin estrategia, promo, descuento, excepción, caja, o volviendo 7+ días sin techo
   anotado) se decide EN ESTA VUELTA con la ficha abierta: buscar techo (salto grande), anotar el techo probado, o sobra/escasez/
   sin reposición con su motivo. La lista queda vacía. Lo que NO vende no pasa por acá: eso lo barre la completa (📏/🔎/📦).
6. Activar pausadas con stock en Full (`activarfull:go:25`); lo que no se activa va a `notas/para_mati.md` con motivo.
7. Preguntas de compradores que sé sin duda (`contesto:`). Mis descuentos que vencen en 2 días: renovar o dejar terminar.
8. 📋 Listas: confirmar el mismo producto (`listarevisar` → `listadato:<prov>;<cód>=ok|no|mi=MLA…;go`); con duda no se toca.
   **Sin foto ni código de barras (Dai Nippon y las demás listas, 21/10/2026, él: *"nippon sólo trae lo que viste vos"*): `ok` sólo si
   el título de ML coincide en marca, línea, variante/aroma, tamaño y cantidad.** Si ML agrega algo que la lista no dice (una línea
   como "80+", "1 minuto", "Intense", una edición, "pack", "3x", "x2", otro aroma) → `no`. Casos que la dejaron escrita: Lux orquídea
   120 g contra pack 3x120 jazmín, Dove máscara Nutrición contra Factor 80+ 1 minuto. Dan menos productos, pero no se compra uno por otro.
   De vez en cuando, `listarevisar:confirmados` para volver a mirar los ya confirmados.
9. Escrituras en UNA ml-sync (uno por renglón). Antes, mirar el job `sync` de la última corrida de ml-sync: si sigue andando,
   esperar. **Un solo disparo por turno.** Después confirmar `success`; si quedó `cancelled`, repetir sólo lo que faltó (cada
   comando terminado deja `##### ✓ terminó:`). No se toca `cancel-in-progress`.
10. **🔎 Al final, `errores` (consulta)**, después de que terminó la ml-sync de la vuelta. Si hay algún ❌ pendiente: `errores:go` por
   ml-sync (deshace lo del formato nuevo y le avisa); lo anotado antes, con el comando que imprime o una nota del porqué (no a ciegas:
   puede ser una decisión suya). 🔗 (hermanas que ML iguala sola) y 💳 no se juzgan solas. 🔐 lo frenado por una salida suya
   queda esperando su "autorizo" (no se reintenta por otro camino).
11. En el chat: "🚨 N → N · 🧭 N → N · 🔀 N → N · 🚫 frenadas N · 🔐 pedidas N · 🔎 errores N → N · ventas N miradas · ideas …" (nunca callado).

**Completa (03:00, una vez por día) · REHECHA EL 21/10/2026, eligió la (a): *"que mire cosas que nadie miró"* y *"a las 3am siempre, así no molesta"*.**
Antes recorría las ~590 publicaciones enteras todos los días (3 h, ~100 de tokens, frenaba las vueltas de ventas). Ahora mira SÓLO lo
que nadie miró, con esfuerzo max (no se baja: el revisor en contra frenó 7 de 29 cambios mal leídos el 21/10). Medida: ~1 h, ~35-40.
1. **Lecturas TODAS en UNA corrida de ml-consulta** (no una por comando): `autoriza` · `revfondo` · `planilla` · `informe:24` · `pedidostodo` · `historia` ·
   `escasez:expediente` · `raros` · `techo95` · `techofreno` · `escmedir` · `analizapromo:21` · `ventasraras:nuevas`. Después
   `supervisor:medir:go` (ml-sync).
2. **Qué se mira a fondo (ficha entera):**
   - las ventas de la noche (como una vuelta corta);
   - TODAS las listas de alarma: 🛡️ abajo del 35% · 💸 stock antiguo · 📦 sobra · 🔎 sin afinar · 📈 dice techo y no sube ·
     🚨 escasez · 🧭 raros · ⚠️/🤔 · pausadas con stock;
   - **las quietas con stock que nadie miró**: activas con stock en Full que NO vendieron desde la última completa (las que
     vendieron ya las vio la vuelta de ventas). Rotan: la mitad cada noche, primero la que hace más que no tiene nota mía; ninguna
     pasa 2 días sin mirarse.
   - **🧐 `revfondo` (24/10/2026, eligió la 3a: *"que no se escape ninguno"*)**: todo producto con stock en Full y publicación activa
     cuya última nota mía del 🧠 tiene 2+ días (quieto) o 7+ días (vendió en 7 días; la ✓ rápida de una venta no cuenta). Todo lo que
     sale se mira a fondo esa noche y deja su nota: **la lista tiene que quedar vacía** (al otro día se vuelve a correr y se ve).
   - **📸 Fotos de lo nuevo de Paraguay (24/10/2026, él: *"no se ven bien hasta que se haga la run"*)**: `fotosrev` (ml-consulta, log
     guardado en archivo) → `python3 ml-sync/revfotos/revfotos.py armar` → mirar las hojas → `revfotos.py comando` → `revcand:…;go`
     (ml-consulta). Sin esto lo nuevo que dio 35% NO entra a un pedido (le falta el "mismo producto"). Tiene que quedar vacía, igual
     que `listarevisar` (paso 8 de las vueltas).
   - **Afuera:** gemelas Premium (las alinea el robot con su Clásica) · pausadas sin stock (salvo que caigan en 🛡️) · lo que ya
     vio una vuelta de ventas en las últimas 24 h.
3. **Dos ayudantes (max)** se reparten lo de arriba (no uno por cuenta); `ficha:<MLA>` sólo de lo que se mira. Sólo leen.
4. **El revisor en contra (max)** ANTES de aplicar, igual que siempre: marca, no propone.
5. Yo miro lo dudoso, lo que cambia más de 20% y lo que deshace una decisión de menos de 7 días.
6. Pedidos y cajas como siempre (`decide_pedidos.py`, `decide_cajas.py`, revisados, `decido:archivo=…;go`). Juicios de precio,
   `techo95;go` y **`techo95:buscando;go`** (25/10: las 📈 que ya llegaron al umbral pasan a 🏔️ y arrancan la escalera hacia el 💰 en la
   misma vuelta; la `TABLA` dice cuándo llega cada una), frenos a reabrir. Nota con QUÉ MIRAR MAÑANA de cada una que miré (`decido:archivo=fichas_<fecha>;go`).
6b. **💳 Toda publicación con su Premium (21/10/2026, regla suya: *"quiero que todas las publicaciones tengan clásica y premium.
   puede que yo vaya creando publicaciones y queden sin premium"*).** Cada noche `gemela:todas` (ml-consulta, solo lee: cualquier
   precio, activas o pausadas, SÓLO con stock en Full: *"no mirar todas las demás"*). Cada renglón con precio Premium medido se crea con `gemelacrea:<MLA>=<precio>:go`
   (uno por renglón, en la corrida final de ml-sync). Si la Premium no llega a la misma plata neta o al 35% en el peor caso, no se
   crea y queda una nota con el motivo. Si ML no deja (sin `user_product_id`, con variantes), se anota y se le dice a él sólo si
   es algo que vende. La lista tiene que quedar vacía.
6b2. **👯 Mismo producto y color en dos publicaciones = mismo precio y misma estrategia (26/10/2026, él con el Centímetro Blanco y las Cartas Poker).** Lista 👯 de `planilla`
   (mismo stock, activas, sin gemelas). Por cada grupo: ¿es EXACTAMENTE el mismo producto (título, catálogo, foto, variante)? Sí → las dos
   al mismo precio y estrategia, AL PRECIO MÁS CARO de las dos (27/10, él: *"poner al precio más caro de ambas y que a partir de ahí se cuenten como mismo producto"*) (`decido` en cada una, mismo #tag). No (otra variante mal vinculada)
   → `fijarvar`/`vincular` bien. Borrar una de las dos lo decide él (se le propone en `para_mati.md`). Tiene que quedar vacía.
6c. **📦 Clásica con envío gratis (22/10/2026, pedido suyo):** lo que esté abajo de $33.000 con stock en Full también lleva su gemela
   Clásica con envío gratis al precio de misma plata neta (`gemelaenvio`, solo lee: la columna ✓ = peor caso ≥ 25%; los
   `gemelaenviocrea:<MLA>=<precio>:go` salen al final en `@@CREAR`). Se sigue sola cada hora (`alinearGemelasEnvio`). El envío gratis
   abajo de la barrera es la tarifa entera ($8.000-$11.600): en lo barato el precio sale muy alto y no se crea si queda abajo del 35%.
7. Todo lo que escribe va en UNA corrida de ml-sync al final. Después, **🔎 `errores` (consulta)** y, si hay ❌, `errores:go` (ml-sync), igual que las cortas.
8. **Los domingos, además:** el catálogo entero (todas las activas con stock, como era antes) y **el ayudante de ideas a fondo
   (max)**, que ya no corre todos los días (decisión suya del 21/10: *"semanal y a fondo"*). Lee `notas/ideas.md` para no repetir.
9. **Los domingos, además: medir las gemelas** (pedido suyo del 22/10), las Premium y las de envío gratis (`gemelaTipo:'envio'`, 6c).
   Por cada par: ventas por día con stock de la gemela y de su Clásica desde que existe la gemela contra antes, y la plata que dejó
   cada una. Cuáles venden, cuáles le sacan ventas a la Clásica sin sumar plata y cuáles no venden nada en 30+ días. Las que no
   sirven van a `notas/para_mati.md` como propuesta de sacarlas, todas juntas con (a)/(b). No se borra ninguna sin que él diga.
11. Los lunes: contar `notas/correcciones.md` de la semana contra la anterior.

===========================================================================================================================
- **🆕 que vende → 📈 en la misma vuelta (21/10/2026, él con el Sony EX15AP Blanco: *"no se buscó techo? (…) hagamos que todas las publicaciones que se puedan busquen techo ya mismo, sacando las que ya estamos con descuento, sobrestock, bajando y todo eso"*).** Un lanzamiento que vendió al precio de hoy ya no baja: sube a buscar el techo (+30%). **También si la venta entró por su gemela o hermana** (23/10, el Masajeador vendió por la Premium y quedó quieto): se mira la estrategia de la Clásica. El detector `errores` lista al final las 🆕 que vendieron y no subieron, con el `decido` listo; esa lista tiene que quedar vacía. Y en cada vuelta, lo activo con stock que no está en ninguna estrategia que lo explique (descuento, promo, sobra, bajando, volviendo, escasez, sin reposición, 🥊, gemela, excepción) y vendió a su precio, busca techo.

## 2 · QUIÉN HACE QUÉ
- El robot SÓLO junta datos. Yo decido todo. Él no marca nada a mano: me lo dice y lo hago por comando.
- Nunca tomar como dato una marca vieja del robot (escalera, liquidando automático, expediente viejo). Dato crudo.
- Él no toca precios ni promos; no hace falta que avise nada de eso.
- Lo grande o sin respuesta clara lo decide él: todo junto, numerado, (a) sugerida y (b). Lo chico y reversible lo decido yo y se lo cuento.
- Esfuerzo fijo (3a, 20/10; no se cambia sin que él lo diga): ayudantes de la completa, ideas (domingos) y revisor en max; raros de las
  cortas en Alto; las ventas en max. **El esfuerzo va escrito en cada llamada al ayudante (`effort:`), nunca se hereda de la sesión**
  (21/10): el chat sólo junta datos, aplica y escribe, y eso no necesita el nivel alto.

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
- **💰 DESPUÉS DEL TECHO SE BUSCA EL DE MÁS GANANCIA, EN ESCALERA (25/10/2026, él):** *"para mí tiene que ser prioridad buscar techo,
  segundo, buscar el precio que más ganancia da (siempre sacando que está sacando stock). veo mucho escalera (que está bien, pero la estrategia
  es buscar el mejor precio por ganancia CON escalera)"*. Con el 🔴 al 95% el objetivo de cada escalón es llegar al 💰 (el que más plata por día
  dejó): cada escalón ≤15%, medido, y se para en el que más deja. Si el 💰 ya se conoce y está abajo, se va a él en escalera. La web muestra
  esa escalera como 💰 "buscando el de más ganancia · Nº escalón" (el dato guardado sigue siendo `bajando`).
- **Tags:** 🔥 `escasez` · ⏳ `sinrepo` · 📈 `techo` · 🏔️ `techook` (🔒 sólo lo anota `techo95` al 95%) · 🪜 `bajando` · ↘️
  `volviendo` · ↗️ `desobra` · 📦 `sobra` · 💸 `descuento` (sólo nosotros) · 🏷️ `promo` (ML pone plata; `entrarpromo` elige solo) ·
  📉 `liquidando` · 🧨 `remate` (sólo él) · 🛡️ `excepcion` · 🆕 `nuevo` · 🎁 `fecha` · 🥊 `caja`. (💳 `gemela` NO es estrategia, regla suya del 21/10: el robot la anota como dato y la Premium muestra la estrategia de su Clásica. 🏷️/💸 son estrategia sólo si los entramos nosotros; un cupón o promo que puso ML en una venta no cambia la estrategia del precio.)
- Lo que "vuelve" se nombra por el tag anterior (`pasajeDe`); ↗️/↘️ son un paso: con 7 días en ese tag entra a 🔎 sin afinar.
- 🔒 Un `decido` que baja con `#techo` o `#escasez` se guarda 🪜 bajando (techo y escasez quieren decir que el precio sube).
- **La nota en 4 partes:** QUÉ HICE (de $X a $Y) · POR QUÉ (estrategia + el dato) · QUÉ ESPERO VER (números) · SI NO PASA (días y
  qué hago). Si no se toca: HOY NO LO TOCO PORQUE … Sin `;`, sin repetir oraciones, una por variante.
- Las notas de Pedidos y Armar caja se leen en la tarjeta: la primera frase corta. Pedidos arranca con "Hola Tito!"; cajas, para Matías.
- **🔒 Banderas de excepción MÍAS** (con "EXCEPCIÓN: …" en el motivo): `!golpe` (escalón más grande o antes de tiempo) · `!bajopiso`
  (abajo del 💰, o en escasez abajo del precio de antes) · `!nosobra` (descuento sin sobra) · `!piso` (abajo del 35%) · `!cruza`
  (barrera) · `!salto` (más del doble de una) · `!sinstock` · `!activar` (y corregir el precio de lo que nunca estuvo activo) · `!chico`
  · `!lista` · `!escalon`.
- **🔐 Banderas SÓLO SUYAS** (22/10/2026, §0c): `!sinlinea` (bajar sin línea de techo) · `!sincerteza` (deshacer una suba o bajar
  arriba del 💰 sin 95%) · `!sintecho` (bajar lo nuevo sin 🏔️) · `!bajocero` (abajo de 0%) · la estrategia 🧨 `#remate`. Sin su
  "autorizo" por Telegram no pasan: el renglón queda pedido y se vuelve a correr cuando `autoriza` lo muestra ✅.

===========================================================================================================================
## 5 · PRECIOS: LO GENERAL
- **Objetivo 35% en el PEOR caso**: retención de otra provincia 2% + el peor envío visto + cuotas (≈28% en el número normal). 🔒 Una
  baja que queda abajo pide `!piso`. Paso 🛡️ de todas las vueltas: lo que está abajo se sube DE UNA al precio del 25%, o se deja con
  `!piso` y motivo. Abajo del 25% se acepta sólo por stock antiguo, sobra de verdad o lo que pide él, y se cuenta como pérdida
  contra el 25%. 🔒 Nunca abajo de 0%.
- **Cada variante sola** (cada color/aroma en su publicación): su precio, su stock, sus ventas, su caja. Nunca el promedio. (Las
  variantes ADENTRO de una misma publicación se suben todas o ninguna: 🔒.)
- **El % de un producto se mide vendido SOLO**: los carritos no cuentan.
- **Plata por día NETA:** −$100 por unidad (trabajo) · −3% de lo facturado (tope de H) · −2%/mes del costo del stock parado. A igual
  plata neta gana el precio alto.
- **Lo barato** (hasta ~$5.500): cada unidad deja ~$1.000 o más; si no, se sube de una.
- **Barrera $33.000:** se frena en $32.999 salvo que cruzar deje claramente más con el envío restado (`!cruza`). 🔒 **Si en $32.990 queda abajo del 35% en el peor caso, cruza al precio del 35%** (24/10, él: *"así sabemos que no sirven (…) que vayan a ser buen producto o que se descarte. no que queden en el medio vendiendo al 30%"*), salvo que la unidad más vieja tenga 100+ días en Full (cerca del stock antiguo): `planilla` las pone en 🛡️ para subir.
- **Terminaciones 90/990.** Cruzar un número redondo NO se frena (medido 13/10). 🔒 Si el redondeo deja el precio abajo del 💰 piso,
  se redondea PARA ARRIBA.
- **Comisión con escalones:** mirar la ganancia por unidad AL precio nuevo; subir y ganar menos no se hace.
- **La caja de compra orienta, no decide** (Full vale ~19%). Perdiendo y vendiendo bien → no se baja.
- **Venta barata ≠ remate:** remate sólo si estuvo parado de verdad (30+ d con stock vendiendo <1 por semana).
- **Venta abajo del 35% con poco stock** → se sube en la misma vuelta. **Lo nuevo que vuela** se sube al toque.
- **Lo que vuelve de agotado** se compara contra su último tramo con stock.
- **Vendedores del exterior** no se miran salvo que no haya argentinos: ahí su precio +20%.
- **Visitas que caen sin cambio de precio** → preguntas sin responder y descripción (lo arregla él, va a `notas/para_mati.md`).
- **Pendrives de Matías como familia**: el de 32 es el conveniente; 8 y 16 (⏳) pueden quedar más caros a propósito.
- **Juzgar resultados todos los días:** `supervisor:medir:go` + `juzgo:`; lo que perdió no vuelve por regla, se piensa. Nada en
  `espera` más de 30 días.

## 6 · TECHO (📈 → 🏔️)
- 🔒 **PRIMERO, LA LÍNEA DE TECHO (21/10/2026, regla suya, después del Persea y del Aer Jasmín):** en cada publicación que se mira
  (cada venta, cada renglón de lista) la PRIMERA pregunta es *¿tiene 🔴 techo al 95% (rayas) o 🏔️ de techo95?* Si NO: la estrategia es
  📈 buscar techo y el precio SUBE (salto grande), salvo sobra, sin reposición, liquidando, remate o escasez. "Ya probé techo una vez",
  "volviendo al normal" o "está bien a este precio" NO alcanzan. Bajar sin línea no se puede (F7). Una baja vieja que deshizo una
  prueba sin certeza (`bajastecho`) se vuelve a abrir: se retoma la prueba.
- 🔒 **Un precio no es 🔴 techo si otro MÁS ALTO medido dejó más plata por día** (21/10, Persea: 🔴 en $14.360 con $14.850 mejor).
- 🔒 **⚠️ DATOS INCOMPLETOS = no se decide.** Si una corrida termina con "⚠️⚠️ DATOS INCOMPLETOS" (la base no contestó aun reintentando)
  o la ficha sale incompleta, esa vuelta no cambia precios: se vuelve a correr la lectura.
- **Todo lo que vende sin techo conocido se prueba para arriba**, todas juntas. Afuera: escasez, sobra (+90 d), liquidando, mis
  promos, regalables en las 2 semanas antes de su fecha, frenadas por ML.
- **Cómo:** 🔒 **siempre un salto grande, nunca de a poco** (21/10/2026, regla suya: *"cuando buscan techo siempre dar un salto
  grande nunca ir subiendo de a poco. después cuando se encuentre el techo ahí sí bajar de a poco con descuentos"*): +30% como
  mínimo, mejor +40-50% (ML deja hasta +100%; 🔒 más del doble pide `!salto`). `decido` frena una suba #techo de menos de +30% salvo
  $32.990 por la barrera, el techo de $650.000 o `!chico` con "EXCEPCIÓN: …". **Cada escalón se mide antes del
  siguiente**: por certeza (Poisson sobre la plata por día: 3 esperadas y 0 = 5% · 6 y 0-1 = 2% · 10 y ≤2 = 0,3%), nunca un solo
  día. En lo que se compra de a muchos se cuentan COMPRADORES y 7 días mínimo.
  **Una prueba de techo se mide en VENTAS ESPERADAS, no en días** (23/10, él: *"mientras más días buscando techo más días perdiendo
  ventas"*): al llegar a 3 esperadas a su ritmo de antes sale en 📈 PRUEBA CON RESPUESTA (`planilla`, `techodias`) y se decide en esa
  vuelta (0 vendidas = 95% → escalera · con ventas manda la ganancia por día · si no alcanza, nota y vuelve a salir con 3 esperadas más).
  Lo que vende 1+/día se resuelve en 1-3 días; lo de menos de 1 por semana necesita ~2 meses.
  🔒 **A lo que vende menos de 1 por semana no se le busca techo subiendo** (4a del 23/10, él; 60 días, con gemelas y hermanas):
  queda en su precio como 💰 #punto, o baja en escalera si sobra. Freno en `decido` (salvo 🆕 lanzamiento que vendió, o !chico con
  "EXCEPCIÓN"). **Desde el 24/10 (37a) vale para TODA suba, no sólo la etiquetada 📈**: afuera sólo subir al 25% del peor caso, 🔥/⏳
  con el stock que no llega a 100 días a ese ritmo, o ↘️/↗️ volver a un precio que ya tuvo en 90 días. Y bajar la LISTA de algo que ya
  buscó techo va como descuento **con cualquier etiqueta** (salvo ↘️ volviendo de una escasez). Medido el 23/10: 31 de 34 lentos no vendieron ninguna al precio nuevo y juntos dejaban ~$12.500 menos por día.
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
  plata. La raya 🚧 de una prueba vuelta dice "N% seguro" o "sin certeza". **Las rayas se miden con los últimos 60 días y sin los días de fechas especiales** (24/10, él con el Infusor cajita: el 🔴 $5.290 salía contra un 💰 de 8 días de fines de julio que vendieron el triple; lo pasó y vende a $6.890). Subir arriba del 🔴 → decir por qué no le creo.
- **🏔️ techo encontrado:** 🔒 sólo con `techo95` (95%); si no llega, vuelve a 📈. Corre en cada completa sobre las 🏔️ y las 🆕, y con `techo95:buscando` sobre todas las 📈 (25/10).
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
  **Tamaño (24/10, él: "los saltos de los escalones son medio grandes, fijate vos"):** el 15% es el TOPE, no el paso. Bajando a ciegas (sin
  un precio que haya vendido abajo) el escalón es de ~8-10%; volver de una prueba de techo que no vendió AL PRECIO QUE SÍ VENDÍA (✓ de la
  línea) va de una aunque sea 10-15% (ej. Seagate 500GB $197.990 → $175.590: volvió a donde vendía, no fue un escalón a ciegas).
- 🔒 **No abajo del 💰 piso** (F5) salvo 📦 sobra, ⏳ sinrepo, 📉 liquidando, 🧨 remate.
- **Sobra (📦):** más de 90 días de stock **en Full** al ritmo **con stock** (días en cero no cuentan), o sin ventas en 60 d. (La
  oficina no paga almacenamiento: se manda o no, pero no hace "sobra".) Lista **📦 SOBRA Y NO LO DECIDÍ** en la completa; lo
  llegado hace menos de 30 días va aparte (es lanzamiento).
- **Primero descuento, no bajar la lista:** descuento propio (mínimo 5%, 14 días) o promo de ML si pone plata, con el mismo neto.
  Nunca subir la lista para inflar el tachado.
- 🔒 **🤔 ¿Tiene sentido este descuento?** (F6, `entrarpromo` y `decido` con #descuento/#promo/#sobra): sobra de verdad (90+ d en
  Full al ritmo con stock) y no recién llegado (30+ d desde la última entrada). Y 🔒 35% en el peor caso (o `!piso`). No aplica a
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
- 🧨 **Rematar a cualquier precio** sólo si él lo pide: `entrarpromo:<MLA>=<precio>@PRICE_DISCOUNT!piso!bajocero#remate|motivo;go`, y 🔐 con su "autorizo" por Telegram (sin eso queda pedido, no se aplica).
- Lo medido de las visitas (20/10, `vistas:150`): bajar 3-25% sube visitas +22% a +56%; subir 3-10% casi no toca ventas; subir +25%
  baja ventas ~30%; perder la caja −40% ventas; tachado contra liso SIN PRUEBA todavía (se vuelve a medir el 28/10).

## 10 · LANZAMIENTO (🆕)
- **Arranque ~20% arriba** del precio que creo correcto (35%+ en el peor caso), tag 🆕, 7 días con stock a ese precio de lista.
  Lo nuevo que nunca estuvo en Full se pone a precio ANTES de activarse.
- **Si vende** → 📈 buscar techo desde ahí.
- 🔒 **No se baja** (ni descuento, ni promo, ni lista, ni para ganar la caja) **hasta que `techo95` diga 95%** (visitas × conversión
  típica a ese precio, λ ≥ 3 con 0 ventas) y anote 🏔️. Ahí escalones de ~5-8% como descuento propio con el arranque tachado
  (`entrarpromo:<MLA>=<precio>@PRICE_DISCOUNT#bajando|lanzamiento …`), cada uno con 95% o 7 días sin venta con visitas. Nunca abajo
  del 35% peor caso: ahí pasa a 📦. Reloj de fondo: 4 meses; a ~60 días sin venta entra la 📦.
- Si casi no lo ven (<1 visita/día), bajar no lo arregla: título, fotos, caja.

## 11 · PREMIUM Y GEMELAS (💳)
- 🔒 **Tope para crear $550.000** (23/10/2026, él: *"nunca crear publicaciones más caras que 550.000"*): ni una Clásica nueva (`publicar`) ni una gemela (`gemelacrea`) se crea arriba de $550.000 (`TOPE_CREAR`, freno en el código). Lo que ya existe sigue con el techo de $650.000.
- Premium que gana la caja se queda en Premium. Una Clásica gemela nunca al precio de su Premium.
- Premium contra Clásica con plata NETA (la Premium factura más: más IIBB, mono y tope de H): vale sólo si deja igual o más por día.
- La gemela la creo yo: `gemela` (solo lee) · `gemelacrea:<MLA>=<precio>:go` (misma publicación, comparte stock, tag 💳). Se juzga
  por las ventas que la Clásica sola no hacía.
- 🔒 **Cuotas en TODO (21/10/2026, él: *"poner cuotas a todas las publicaciones, no sólo a las de más de $50.000 (…) siempre que nos dé la misma ganancia en premium que en clásica (…) puede que en productos baratos tengas que aumentar mucho el precio, hacelo"*):** toda Clásica activa con stock en Full lleva su 💳 gemela Premium al precio que deja la MISMA plata neta (`precioGemelaIgual`, ~+17-24%; las que cruzan los $33.000 pagan el envío y suben más). **Pero nunca abajo del 35% en el peor caso si su Clásica está en el 35% o más** (24/10, él: *"que siga a la principal en el % de ganancia, no? nunca deberían quedar por debajo del 35% (excepto las que ya sabemos)"*): va al precio más alto de los dos (misma plata o 35%, `precioGemelaAlPiso`; también la 📦 de envío gratis). Con la Clásica abajo del 35% por una excepción (sobra, promo, `!piso`) sigue con la misma plata y **sí baja abajo del 35%** (él, 24/10: la publicación está para vender rápido y todas las formas de venta tienen que ayudar); una baja de más de 15% va de a −15% por hora. **Cada gemela sigue sola a su Clásica cada hora** (`alinearGemelas`, tolerancia 1%; `gemelaalinear[:go]` a mano; se apaga con `gemelaSigue=off`): al mover la Clásica no hay que tocar la Premium. Lo nuevo que entre en Full con Clásica se le crea la gemela en la vuelta siguiente (`gemela:1` lista las que faltan).

- **Paulvic con nombre de otra marca (21/10/2026, eligió la 1b):** ML congeló "en revisión · prohibido" a Invictus y Phantom con sus gemelas al crearlas. Se sigue con cuotas en todo, también en esos, y se espera que ML los libere. No se frena la creación de gemelas por eso.
- Una Premium que ya existe sin `gemelaDe` no la sigue nadie: `gemelacrea:anotar:<Premium>=<Clásica>:go` (chequea misma cuenta y mismo producto de ML).

## 12 · PAUSADAS, PUBLICACIONES, VÍNCULOS
- Activar lo pausado con stock en Full es prioridad en todas las vueltas; lo que no se activa, a `notas/para_mati.md` con motivo. Lo que está
  en depósito (fuera de Full) se pausa solo.
- Publicaciones nuevas: las crea él en ML; yo la ficha y el vínculo (la ficha toma el nombre de ML). La mercadería no se mueve entre cuentas.
- Frenadas por ML: no se toca precio; si hay que arreglar algo, se le avisa.

## 13 · VENTAS Y PREGUNTAS
- Cada venta contra su ficha en cada vuelta. Lo de una sola vez (retención, cuotas, carrito) no toca el precio. Las ventas en promo
  de la vuelta se cuentan en el chat.
- Preguntas: sólo las que sé sin duda, cortas, sin teléfonos ni links; nada de más de 7 días. Las que no sé quedan en ML y en el chat
  (no van a Telegram). Reclamos que esperan su respuesta: recordárselo una vez por día como mucho.

## 14 · PEDIDOS
- 💹 **ESTRATEGIA "GANAR MÁS POR CADA PESO FACTURADO" (22/10/2026, eligió 1a 2a 4a 5a 6a 7a 8b).** El tope de H no deja facturar
  más: sube la ganancia lo que deja cada $100 facturados (meta $22; oct $19). Lo que sale de ahí, en cada parte:
  · 🔒 **reponer sigue en 25%; comprar algo NUEVO pide 35%; 30% si en ML vende 100+ con 2+ vendedores** (§16, §17; 23/10 1a, `varaCompra`: colchón de ~$52 M del tope de H hasta fin de año, nada nuevo a Matías; en febrero se vuelve a medir con los topes nuevos) · **2a: lo que con el techo ya buscado (🏔️ o prueba de techo
  cerrada) sigue dejando menos de 25% NO se repone**: `decido:ped=u|0` con "Hola Tito!" y el motivo, y en la completa se le propone
  un reemplazo de 35%+ (de Paraguay o Listas) en `notas/para_mati.md`. Mientras el techo no esté buscado, se busca primero (no se corta de
  una). **Lo de 25-35% con el techo ya encontrado (🏔️) se sigue reponiendo** (22/10, eligió la a): se reemplaza de a poco sólo cuando
  aparece algo nuevo de 35%+ que ocupe su lugar (mismo rubro o misma plata), y eso se le propone en `notas/para_mati.md`. Stock antiguo, escasez o algo recién llegado no cuentan como "abajo de 25%" · **5a: Watch S5 y Redmi Pad 2 no se reponen más**
  (`decido:ped` u 0, 22/10) · lo caro de poco margen es lo primero a reemplazar (gasta mucho tope de H y deja poco).
- **Completos, todo el catálogo**, en la completa: objetivo 30 días; 45 en Bs As que se cortó 2+ veces en 60 d, vende 0,5+/día y
  deja 25%+, y en lo nuevo que vuela (1+/día la primera semana). Ritmo por día con stock (y por color); stock de las 4 cuentas
  sumado; sin costo no se pide; **el precio para el máximo = el de la ÚLTIMA venta** (23/10, él: *"si nunca vendió toma el % que decís vos. si ya vendió no importa si fue sólo 1 unidad. tomar ese %"*), sin pasar el de hoy y salteando la de escasez/sin reposición; nunca vendió → el precio de hoy. Máximo por color con `pvVars`
  (el precio que el color sostuvo 2+ semanas, nunca de escasez ni de la primera semana de techo).
- Navidad: en la completa del 14/11, medir lo que subió en Navidad 2025 (17-30/12) y pedirlo para 45 días.

## 15 · CAJAS
- 37 días (30 de venta + 7 de viaje); 60 sólo en lo parejo sin prueba abierta (`notas/sin_estirar.txt`); nada pasa 90 días; lo
  nuevo sale con el mínimo de 4. Una cuenta SIN publicación no recibe el mínimo si otra tiene stock de ese color; la que ya publica y
  está en cero, sí. Respetar el cupo (lo vendido no devuelve cupo). Costo de la caja $17.310.
- **Cupo de Full lleno con lo que no vende (21/10/2026, él con Ayelen en 0: *"retirar libera stock, pero es un poco de lío, lo mejor es vender"*):** con el cupo de una cuenta en 0 y mercadería que vende esperando en la oficina, lo lento que ocupa el Full de esa cuenta (Timer, cortapelo a pila, panel solar…) se empuja a VENDER (descuento propio o escalera, frenos de siempre) antes que retirarlo. Retirar sólo si vender no alcanza y él lo pide.
- 💹 **Full abajo de $100.000 por mes (22/10/2026, 6a).** Octubre fueron $347.700 (retiros y descartes $221.600, stock antiguo
  $64.000, almacenamiento $47.700, multa $14.200). No mandar de más (37 días), lo lento se vende con escalera ANTES de los 4 meses
  (stock antiguo), y **un retiro de Full sólo con su OK** (en `notas/para_mati.md`, con lo que cuesta retirar contra lo que cuesta quedarse).
  En la completa del 15, con `cargosmes`, decirle cuánto fue Full contra la meta.
- Con varias cuentas posibles, decidir a mano mirando `cajasnotas`. Las que ML dio por entradas las marco yo (`cajallego`).
- Caja para mandar ya de algo que vende fuerte y está en 0 en Full → `pregunto:URGENTE: …`.

## 16 · PARAGUAY
- Pedidos de ~US$1.000 cada 2-3 semanas. Lo no urgente espera al próximo; lo que se corta antes de que llegue se pide igual.
- Precios y códigos SÓLO de comprasparaguay (la fila de Nissei), nunca nissei.com. El chat local los copia una vez por mes.
- Para pedir: 🔒 **35%, la vara de compra (`CAND_VARA_COMPRA`, 22/10/2026, 1a)** — lo de 25-34% queda guardado y se sigue
  midiendo (el descarte del robot sigue en 25%) — **y** catálogo de ML con 2+ vendedores (o 1 vendedor con 100+ vendidas, o 🌟 sin competencia con el precio visto en ML por el chat: `svprecio`, 24/10/2026 1a 2a) **y** confirmado que es el mismo producto (✅ `mismoOk` o `revcand`
  ok de ESE catálogo). 🔒 **Y al final las 100 vendidas (21/10/2026, regla suya):** sin el dato entra igual; cargado y abajo de 100
  queda afuera (`CAND_MIN_VENTAS`, web y robot). Las mira el chat de compras sólo de lo que pasó todo (`faltaventas`).
- Cuántas de cada nuevo (decisión 4a del 21/10; las vendidas ya no se cargan): 🔒 barato (≤US$15 crudo) → 3 · caro (+US$60) → 1 ·
  resto → 2 (`candMaxU`, botón 🪄 Llenar). Lo que vuela se repone en el pedido siguiente por sus ventas.
- Ticket real obligatorio para cerrar (`compray:<fecha>|det=…|go`); gastos: dólares, retira, correo (monto y kilos); `adelanto=` y
  `cambio=` sólo cuando él avisa. Recargo: el medido de los pedidos (respaldo 20%).
- Al llegar: ficha (pagado × recargo), cuenta por rubro (perfumes → Adriana) y si no, la que **más lugar tiene contra el tope de H**
  (`repartopy`, 7a del 22/10), vínculo. Por ahora siempre las 4 cuentas en H (8b): ni 5ª cuenta ni K.
- Dos proveedores (Nissei, Elegancia) y dos pedidos en Nissei (perfumería y resto).

## 17 · LISTAS (otros proveedores)
- Todas se miden contra ML, también Dai Nippon (que no tiene pedido: lo trae Tito). Para que "dé": 🔒 35% (vara de compra, 22/10) y catálogo con 2+ vendedores
  y el mismo producto confirmado (`listadato` ok o `mi=`) y, al final, no menos de 100 vendidas si están cargadas. Un solo vendedor
  no vale como precio.
- Nunca cargar una lista vieja. Se paga el neto, no el precio de lista (preguntar antes de cargar). Iscos: sólo lo de su web, ×0,665.

## 18 · PAULVIC
- Pedido cada 15 días para 45 días por aroma, redondeado a 3/5/10/20/50 (lo que él cambia a mano no se toca). Nunca "Sólo este
  color" en motivos ni en el copiar.
- Costo = el del último pedido: (pagado + flete) ÷ (llegadas + regalos perfume); los testers son probadores para la perfumería y no cuentan (22/10). Lo que se pide y no viene, no se pide más (⏳).
- Pagar en 7 días hábiles desde que llega.

## 19 · PLATA
- El 1º de cada mes: retiro = "💸 cuánto cobrar" del mes cerrado (`cobromes`). La deuda de H con ARCA queda en CYC.
- Gasto de Full del mes: `cargosmes` en la completa del 15 (el período de ML va como gasto del mes siguiente).
- Gastos a mano: la lista de Gastos dice qué falta; recordárselo a fin de mes.

## 20 · TELEGRAM
- **CYC Avisos = sólo urgente y recordatorios** (23/10, él): `pregunto:URGENTE: …` sólo lo que cuesta plata si espera (reclamo
  esperando, ML frenó algo que vende, vende fuerte en 0 en Full con oficina, pago que vence). **Las decisiones van a `notas/para_mati.md`**
  (se le pasan cuando dice "resolvamos"). Nunca "subí/bajé/activé". Sin datos de compradores. `resumen:` no se manda.

## 21 · AL CAMBIAR ALGO DEL SISTEMA
- `REVISION.md` en su etapa, en el mismo commit; subir a la rama de la sesión y a `claude/add-folder-78ysyb`. Web: `APP_VERSION`,
  `APP_CAMBIOS`, `CACHE` de `sw.js`. Workflows: sin opciones repetidas en un paso.
- **Toda regla nueva que diga "nunca", "siempre" o "sólo si" y se pueda medir con un dato va al código** (`frenosBajas` u otro
  freno), no sólo acá. Acá se marca 🔒.

## 22 · PENDIENTES VIVOS (se borran al cerrarse)
- **03/11 · Centímetro Rosa en catálogo vs las Blancas fuera** (27/10, él eligió 4a: no al catálogo Surtido MLA46897799 por ahora): ventas por día con stock de MLA3559540968 (en catálogo) contra MLA1699834745 + MLA3112784736, a precio parecido. Si la Rosa vende claramente más por día, proponerle probar una Blanca en el Surtido.
- **27/10:** `techo95` de los 5 lanzamientos (Halloween Man, Ferrari Rojo, Adyan Oud, microSD Pokémon, WD 480; su precio actual es el
  de arranque); baja sólo el que llegue al 95%.
- **28/10:** `vistas` sobre las 12 que el 20/10 pasaron de descuento a precio liso al mismo precio (tachado contra liso).
- **02/11:** medir promos en el CyberMonday. **14/11:** Navidad (sección 14).
- Paulvic: juzgar la prueba de $21.990 (si perdió, volver a $14.950, no a $14.360; si ganó, extender primero Persea) y la idea de un
  Paulvic de hombre a ~$17.990 (escalón de comisión de $15.000).
- Paraguay 08/10: falta el correo (monto y kilos). Paraguay 08/09: pesos de los dólares, ticket, retira, correo. Transferencia de
  $50.000 del 29/09: preguntar de qué es.
- Dinero que rinde en MP: lo revisa él en la app de cada cuenta.

## ✅ 21/10/2026 · LO QUE CAMBIÓ CON SUS 62 DECISIONES (todas (a), v25.75)
- 🪜 al volver de un techo, no 🏔️ (1.1) · liquidando frena sólo subas (1.2) · la 🏔️ vence con la foto del mercado (1.3) · tags que vencen
  (1.4) · compras con peor caso (1.5) · gemela y Clásica juntas, plata parada una vez (1.6/5.2) · estrategia liquidando/remate/sobra
  vigente = remate para Pedidos (5.1).

- 💡 El precio sugerido de ML (`sugP`) es una referencia para lanzamiento y techo, nunca motivo para bajar algo que vende.
- 🪜 Arriba de $15.000 hay ~15% de zona muerta de comisión: una suba que cae ahí se frena sola salvo `!escalon` con motivo.
- 💳 Caja perdida por cuotas (`cajaPorCuotas`) = candidata a 💳 gemela Premium, no a bajar el precio.
