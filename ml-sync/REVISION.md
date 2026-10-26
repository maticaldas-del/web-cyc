# QUÉ TIENE QUE MIRAR CADA ETAPA DE LA REVISIÓN

Regla suya (08/10/2026): *"cada movimiento, cambio que hagas lo agregues a una etapa existente o una
nueva"*. **Todo cambio o cosa nueva del panel o del robot se anota acá, en su etapa, en el mismo
commit.** Así la revisión de cada etapa lo mira sin que él tenga que acordarse de pedirlo.
Si una cosa nueva no entra en ninguna etapa, se crea una (en `REV_ETAPAS` de `index.html` también).

Cada renglón: **qué es · dónde vive · qué hay que chequear**. Lo que está en "SIEMPRE" se mira en
todas las etapas.


- **`ml-sync/CEREBRO.md` (13/10/2026):** la lista única de todo lo que el cerebro tiene en cuenta; las dos rutinas la leen al arrancar. Chequear en cada etapa: que cada regla nueva esté ahí y que los pendientes vivos estén al día.

- **informe 12d (13/10/2026, auditoría):** unidades `not_available` adentro de Full (perdidas = las paga ML, `notSupported` = retirar), sólo con `informe:12` o más. Y el `chequeo` no cuenta como sin ficha las publicaciones cerradas. Chequear: que 12d coincida con "Full: N u. con problema" del chequeo.

## EL CALENDARIO: 7 ETAPAS, UNA POR DÍA, CORREN SOLAS (20/10/2026, pedido suyo)
Él: *"organiza las etapas para que sean 7 una para cada dia. pueden correrse sola?"* y *"ahora tengo 20x. asi que me va a alcanzar"*.
**lun 1 Precios · mar 2 Plata · mié 3 Mercadería · jue 4 Choques y fallas mudas (las viejas 4 y 5) · vie 5 Datos, historial y
cerebro (las viejas 8 y 9) · sáb 6 Ideas nuevas · dom 7 Diseño.** Corre sola todas las madrugadas a las 04:00 de acá (desde el 20/10, pedido suyo; antes 22:13) (tarea programada
que entra a esta sesión). Cada corrida: leer la etapa de hoy en este archivo + lo de SIEMPRE, 4 revisores en Alto, verificar cada
hallazgo con el código real antes de contarlo (**los 4 revisores van con esfuerzo MÁXIMO desde el 20/10, plan 20x; antes Alto**), hacer lo obvio (probado, en las dos ramas, anotado acá), y lo que es decisión suya
va TODO JUNTO a `notas/para_mati.md` numerado (a)/(b) y en `REV_PENDIENTE` (23/10: a CYC Avisos ya no van decisiones). Al terminar: `REV_HECHAS[n]`=hoy y un renglón en
`REV_HIST` (index.html). Inicio dice la etapa de hoy, si ya quedó hecha o si no terminó. **En el archivo el orden de las secciones
quedó 0·1·2·3·4·6·7·5** (la 5 nueva está abajo de todo, donde vivían la 8 y la 9).

**DESDE EL 20/10/2026 A LA TARDE NO VA POR DÍA DE LA SEMANA: TOCA LA QUE HACE MÁS QUE NO SE REVISA** (él: *"que las revisiones
automáticas diarias miren hasta qué revisión se hizo, así no repite"*). Última corrida de cada etapa = la fecha más nueva entre
`REV_HIST[n]` y `REV_HECHAS[n]` (`revUltCorrida` en index.html); toca la más vieja, empate → número menor, nunca una corrida en los
últimos 6 días ni una que esté corriendo. Cada corrida termina SIEMPRE con un renglón en `REV_HIST` (aunque queden decisiones), si
no se repite. Inicio (`revProxima`) y Ajustes (`revAgenda`) usan la misma regla. Los días de la semana de arriba quedan como historia.

**21/10/2026: ETAPA 8 · REGLAS DEL CEREBRO, CADA 7 DÍAS** (él: *"las reglas del cerebro es lo más importante de todo no? no vale la
pena meterlo en etapas de revisión? así todas las semanas se actualiza?"*). Son 8 etapas; la 8 lleva `cada:7` en `REV_ETAPAS`: cuando
pasaron 7 días desde su última corrida va PRIMERO, aunque haya otra más vieja (`_revVencida`/`_revOrden` en index.html, usados por
`revProxima` y `revAgenda`, que ahora simula día por día). El resto sigue la regla de la más vieja. Sección propia abajo de todo.

## SIEMPRE, EN CUALQUIER ETAPA
- **Contar dos (o cuatro) veces lo mismo.** El caso de la línea del Centímetro (08/10): el stock se
  sumaba por clave de producto Y por cada clave de color → 413 en vez de ~107. Cada vez que algo
  suma stock, ventas o plata de varias claves, chequear que no haya una clave "total" y claves
  "parte" sumadas juntas.
- **Una falla leída como dato** (un 429, un catch vacío, un cero que parece buena noticia).
- **Dos fórmulas para el mismo número** (web y robot, o dos comandos): tienen que llamar a la misma
  función o dar lo mismo con los mismos datos.
- **Datos de terceros en el registro público** (nombres, documentos, números de orden enteros).
- **`sw.js` vacío (16/10/2026, v23.89-23.90): la app no abría.** Al subir el número de caché el archivo quedó en 0
  bytes y se publicó así. Antes de subir: `node --check sw.js` y que tenga más de 1 KB (`wc -c sw.js`). Arreglado en v23.91 (`cyc-v672`).

## 0 · EL ROBOT SÓLO JUNTA DATOS (09/10/2026, regla suya)
*"no quiero que el robot automático modifique nada ni que dé sugerencias ni nada. SU única función es sacar información
de la api de ml NADA MÁS. Todo el resto te encargás vos"*.
- **Dónde vive:** `SOLO_DATOS` (sync.mjs, prendido por defecto y si la config no se lee; `cyc/mlconfig/soloDatos='off'` lo
  apaga) y `CORRIDA_AUTOMATICA` (ciclo sin comando, ml-daily, ml-candidatos). Los comandos de Claude siguen andando.
- **Apagado en lo automático:** precios (robot de la hora, rescate al vender, grupos, volver sin Full), activar pausadas,
  marcar cajas (`cajasQueLlegaron(...,soloAnotar)`: sólo anota `cyc/cajasentrado` y lista en el log las que ML dio por
  entradas), sacar marcas liquidando, contestar preguntas, retiro del 1º, `avisos`/`supervisor`/`cerebro` en ml-daily,
  la salida del remate de `ritmo`, tachar/destachar candidatos, y TODO aviso a Telegram (queda en `mlapi/cerebroavisos`
  para Claude; salen sólo los `directo` y el resumen del día).
- **Sigue (datos):** ventas, stock, caja de compra, reputación, visitas, cuotas, netoweb, facturas, MP (saldoml/dispo),
  entregas, motivo de reclamos, línea de tiempo, ritmo normal, techo con Full, medir candidatos, dólar, alta de publicaciones.
- **Sus tres decisiones del 09/10 (v22.77 · `cyc-v557`):**
  1. **Guardián de promos: sigue prendido** (*"si no estás seguro dejalos como están"*). Cada promo que saca queda en
     `mlapi/cerebroavisos` (sección 1 del `informe`): Claude ve todo lo que hace. Revisar promos en cada vuelta con `analizapromo`.
  2. **"Vinculá siempre vos":** con `SOLO_DATOS`, `altaDeNuevas` da de alta la publicación SIN producto (guarda `candidatos`
     como dato) y la vuelta de ventas no empareja nada nuevo (ni por título ni por `upid`): conserva el `prodId` que ya
     tenía o deja la venta "sin producto". La sección 6 del `informe` lista TODAS las vivas sin ficha con a qué se parecen;
     se vinculan con `vincular:<MLA>=<id>:go`. La sección 4 (lo que haría el robot) ya no se calcula.
  3. **(b) La web no propone números (`SOLO_CLAUDE` en index.html):** Pedidos sólo tiene renglones que Claude decidió
     (`decido:ped:…=u|N`; sin decisión `aComprar=0` y el pedido automático se borra solo; colores no decididos = 0); la
     tarjeta muestra sólo la decisión con su motivo (sin la cuenta automática). Armar caja sólo manda lo de
     `decido:caja:…`; sin decisión dice "🧠 sin decidir". El máximo de compra sale sólo del precio de venta que fija
     Claude (`=venta|$`), si no "🧠 sin decidir". **Las decisiones no vencen** (antes 4 días); `=auto` las borra.
  Chequear: que ningún pedido/caja/máximo aparezca sin decisión de Claude; que ninguna publicación nueva ni venta se
  enganche sola a una ficha; que lo vendido "sin producto" se vincule en la revisión siguiente.
- **Desde cero:** `desdecero[:go]` borra escalera, cerebro, salidas de remate, marcas liquidando y "no traer más" del
  robot, y las decisiones de pedidos/cajas de Claude. Las marcas a mano quedan.
- **Qué chequear:** que ninguna corrida automática escriba precios, marcas o decisiones; que los avisos lleguen a Claude
  por `informe`/`alertas` y no a Telegram; que las cajas que ML da por entradas las marque Claude y no queden contadas dos veces.

## 1 · PRECIOS (lunes)

### 🔒 Freno 50% para subir (26/10/2026, pedido suyo)
- **Qué es:** en `decido`, una suba se frena si `cyc/techo95pct/<MLA>` (lo guarda `techo95;go` en la completa, de 4 días o menos) da 50%+ de certeza de que el precio en prueba ya es el techo y el precio nuevo está en o arriba de ese. No frena 🔥 escasez, ⏳ sin reposición, volver a un precio de los últimos 90 días ni `!chico`.
- **Qué chequear:** que no frene una 📈 que todavía no tiene medición (sin dato no frena) · que el dato sea del MISMO precio (±2%) · que lo frenado aparezca en la vuelta con su motivo.

### 🌸 F12 · perfumes nunca abajo del 10% (26/10/2026, pedido suyo)
- **Qué es:** en `frenosBajas` (todas las bajas: `decido`, `entrarpromo`, la puerta de `setPriceTo`), si la ficha o el título es perfume (`esPerfumeNom`) y el precio nuevo deja menos de 10% en el peor caso, frena; el texto dice si está cerca de pagar stock antiguo → avisarle para retirarlo al local. `!bajocero` con su autorización lo abre.
- **Qué chequear:** que agarre los VS, Paulvic y Persea (y no un "Splash" que no sea perfume) · el Cyber del Coconut y la escalera del Pure Seduction pasan por acá · que los avisos de retiro le lleguen en el chat, no por Telegram.

### `pausadas`: las que pausó él a propósito no se avisan (26/10/2026, él: "no avises más de esas")
- **Qué es:** las pausadas con stock en Full cuyo freno es "pausada a mano con el comando pausar" (hoy las 35 gemelas de envío gratis de
  Paulvic, su 11b del 25/10) ya no se listan una por una ni van al aviso de "no las puedo medir": salen en UN renglón con el total y no
  cuentan en "N no". Las vueltas no las vuelven a nombrar en el chat.
- **Dónde vive:** `sync.mjs`, bloque de pausadas con stock (`sinMedir`, el resumen "Activar pausadas con Full" y el listado `aProposito`).
- **Qué chequear:** que una pausada por otro motivo (sin costo, sin ficha, la pausó ML) siga saliendo con su renglón.

### `ventasraras`: 💰 punto con precio probado ya cuenta como "con techo" (26/10/2026)
- **Qué es:** en 🧭 ESTRATEGIA DE LO QUE VENDIÓ, una publicación en 💰 `punto` con su precio probado anotado en `techofreno` sale ✓ (antes
  ⚠️ "sin estrategia con techo" y se iba al ayudante a fondo: la Lupa 90 y el Filtro de agua el 26/10, falsos avisos). 💰 punto sin precio
  probado (lo lento que no busca techo, 4a) sigue saliendo ⚠️.
- **Dónde vive:** `sync.mjs`, bloque 🧭 de `ventasraras` (`const bien = …`).
- **Qué chequear:** que una 💰 punto sin `techofreno` siga apareciendo ⚠️; que la Lupa 90 (`MLA3690637828`, techofreno $7.520) salga ✓.

### VENTAS.md con la regla de "menos de 1 por semana no sube" (25/10/2026)
- **Qué es:** el ayudante de ventas lee sólo VENTAS.md y ahí faltaba la 4a/37a: el paso 2 decía "sin línea, buscar techo" sin esa excepción. Agregada en el paso 2 y en la lista de "se busca techo".
- **Dónde vive:** `ml-sync/VENTAS.md`.
- **Qué chequear:** que el ayudante no proponga subir algo que vende menos de 1 por semana salvo al 35% o escasez/sin reposición.

### `gemelamedir` (25/10/2026, sólo lee): medir las gemelas los domingos
- **Qué es:** el paso 9 de la completa del domingo (CEREBRO) no tenía comando. Por cada gemela viva (Premium o envío gratis): días desde el alta, unidades y ganancia de la gemela, y la Clásica en el mismo tiempo antes y después. Agrupa: ✅ venden y suman · ⚠️ le sacan a la Clásica sin sumar · 💤 no venden en 30+ días · ⏳ menos de 30 días.
- **Dónde vive:** `sync.mjs`, bloque `gemelamedir`, antes del de `gemela`.
- **Qué chequear:** que las sin `altaTs` salgan aparte y no como "no venden"; que la ganancia sea neto − costo de cada venta.

### 🔔 El timbre del revisor de ventas (24/10/2026, pedido suyo: "venta a menos del 35% o 6 ventas → que entre el revisor"; "gastar menos tokens")
- **Qué es:** el ciclo de 2 minutos (`timbreVentas`, después del aviso de venta) cuenta las compras sin revisar (posteriores a
  `mlapi/ventasvistas/hasta`) y el % de cada compra nueva (misma cuenta que `ventasraras`). Con 6+ compras o una nueva abajo del 35%
  hace un POST al disparador por API de la tarea `trig_01CjrLU1rXYy3TM1jbQndKGp` (🔔 Revisor de ventas, sesión nueva por toque, sólo
  ventas). Llave en los secretos de GitHub `TIMBRE_URL` y `TIMBRE_TOKEN`. Memoria `mlapi/timbre` (cada compra toca una vez; mientras el
  revisor trabaja y `ventasvistas` no se mueve, espera 45 min). `timbre` (sólo mira) · `timbre:tocar:go` (ml-sync, lo toca a mano).
- **Qué chequear:** que toque con la 6ª compra o con una abajo del 35% · que no toque dos veces por lo mismo · que la sesión del revisor
  cierre con `ventasvistas` (si no, el timbre vuelve a sonar a los 45 min) · sin llave el ciclo lo dice cada 6 h y no falla.

### 📈 "2ª suba" = subas de verdad · qué busca el 📈 · `tag:hist` (24/10/2026, v26.57, corrección suya con Casino)
- **Qué es:** el chip "📈 buscando techo · Nª suba" (y el "×N" de la línea) contaba renglones de `cyc/estrategia`; `techo95` anota
  "volver a buscar techo" sin tocar el precio y Casino decía "2ª suba" con UNA suba. Ahora `estrategiaDe` cuenta las subas reales de
  `cyc/claudecambios` (a > de) desde que empezó la racha. La explicación del 📈 dice que busca el 🔴 techo y que si el precio nuevo vende y
  deja más plata se sigue subiendo. `tag:hist:<MLA>` (sólo lee) lista la historia de estrategias con los cambios de precio.
  **El mismo error en el robot (2 lugares más):** `pruebasTechoEnCurso` (lista 📈 prueba con respuesta y `techodias`) medía el antes/después
  desde el último renglón 📈 y no desde la suba; ahora desde la última suba real de la racha. `ventasraras` (🔬 "prueba con 7+ días")
  contaba los días desde el último renglón; ahora desde que empezó la racha del mismo tag.
- **Qué chequear:** un 📈 con dos subas seguidas dice "2ª suba" · en `planilla` la prueba de Casino cuenta desde el 19/10 15:22 (la suba) · una 🔥 escasez con escalones los cuenta igual · un 📈 puesto con `tag:`
  sin cambio de precio no muestra número.

### 📅 Franjas: sólo se pinta lo que se aparta · "fecha especial" (24/10/2026, v26.56)
- **Qué es:** verde si el tramo vende 12%+ más que el mes, rojo si 12%+ menos, lo demás sin color (días normales). "Temporada" pasó a
  llamarse "fecha especial". En CLAUDE.md y CEREBRO el calendario es un dato para pesar en cada decisión, no una regla de "nunca".
- **Qué chequear:** que no quede todo el mes pintado · el cartel al pasar el mouse dice el número del tramo.

### 📅 Franjas del mes y del año (24/10/2026, v26.55, pedido suyo)
- **Qué es:** `ventasdiames` mide compras y plata por día del mes (cada día contra el promedio de SU mes, sin fechas especiales). La noche lo
  guarda en `cyc/mlconfig/franjasMes` (tramos de 5 días). Las rayas (`rayasPrecioLinea` y `_rayas` de la web) y F8 pesan cada día de prueba
  por su factor de compras (`franjaDe`/`_franjaMesW`): no vender en la franja fuerte pesa más que en la floja. La web pinta en "Plata por día"
  la franja fuerte (verde), la floja (rojo) y las temporadas del año (ámbar, `_fechasEspR`; se sumó el Hot Sale, 2ª semana de mayo, en
  robot y web).
- **Qué chequear:** con pocos meses el factor salta: revisar cada mes que los tramos sigan parecidos · el techo de algo probado sólo en días
  flojos tiene que tardar un poco más · el ámbar coincide con las fechas reales (Hot Sale 2026 = 11-13/5).

### Gemelas al 35% · barrera al 35% · 30 días sin vender = techo · las 3 en revisión fuera (24/10/2026, respuestas suyas)
- **Qué es:** (1) ninguna gemela (Premium o 📦 envío gratis) queda abajo del 35% en el peor caso si su Clásica está en 35%+ (`precioGemelaAlPiso`,
  en `alinearGemelas`, `alinearGemelasEnvio`, `gemela` y `gemelaenvio`; Clásica abajo del 35% por excepción → misma plata, como antes) ·
  (2) lo frenado en $32.990 que ahí queda abajo del 35% ya no es excepción: va a 🛡️ "para subir" cruzando la barrera, salvo la unidad más
  vieja con 100+ días en Full (`barreraCercaAntiguo` en `planilla`) · (3) 🔴 techo sí o sí con 30 días a la venta con stock sin vender a ese
  precio o más caro (`TECHO_DIAS_SIN_VENTA`: `rayasPrecioLinea`, lanzamiento de `techo95`; web `TECHO_DIAS_SIN_VENTA_W` en `_rayas`) ·
  (4) Dalí La Belle, Galaxy A06 y Scandal Bliss (en revisión de ML para siempre) fuera de `planilla` y del `informe` (`ML_REVISION_NO_MIRAR`).
- **Qué chequear:** la próxima hora `gemelaalinear` sube las Premium flojas y ninguna baja de más · el 🔴 de 30 días sólo aparece arriba del 💰
  (abajo vendió) · F7/F11 dejan bajar con ese 🔴 (en escalera) · la cuenta de `planilla` sigue cerrando con las 3 afuera.
- **24/10/2026 · v26.48 · 💰 "más plata" (antes "piso") y no frena si abajo nunca se midió** (él: *"si le faltó datos para ver si el precio donde más genera es más bajo, no lo dejaría bajar porque está el piso"*, eligió la a). `rayasPrecioLinea` devuelve `abajoMedido` (algún precio 2%+ más bajo con 5+ días); F5 frena sólo si lo hay. La web dice "💰 más plata". Y lo que no vende al 35% (eligió la a): no se repone y, al terminarse, la publicación queda pausada (no se borra). **Qué chequear:** que una baja abajo del 💰 sin nada medido abajo pase F5 y la frenen igual los demás (escalera, F7, 35%).
- **24/10/2026 · v26.47 · la seguridad para decir "techo" baja con los días** (él con el Cuba Gold: *"la idea no es tener 1 mes buscando techo, la idea es vender y ganar… al pasar los días necesita menos % de seguridad para decidir que fue techo y que marque se decidió al 70%"*). `umbralTecho(días con stock a ese precio)`: 95% hasta el día 7, baja lineal hasta 70% el día 21 (robot `rayasPrecioLinea`/`techo95`, web `umbralTechoW`). El 🔴 y la 🏔️ dicen con cuánto se decidió; mientras busca, la línea dice "techo a $X: N% seguro · decide con U%" (rayas, o en un lanzamiento lo que anota `techo95;go` en `cyc/techo95pct`). F4/F8 (deshacer una suba, bajar arriba del 💰) siguen en 95%. **Qué chequear:** la completa: cuántas 🏔️ nuevas salen con menos de 95% y que ninguna sea con menos de 7 días.
- **24/10/2026 · v26.45 · el 💰 explica por qué está ahí y las fechas sólo se sacan si hubo pico** (él con los Naipes: *"el piso quiero que explique por qué está a esa altura… ¿tiene en cuenta que vender mucho más barato hace que tenga más trabajo/gastos?"*). Sí: la plata por día es neta (−$100/u, −3% tope, −plata parada). Debajo del gráfico (`_pisoPorQue`) van los precios medidos de más a menos plata por día (por día × cada una = por día). Y sacar el Día de la Madre a todos dejaba a los Naipes sin 💰: ahora la ventana de una fecha sale sólo si ese producto vendió el doble o más por día ahí (`diasFechaPico` robot / `_fueraR` web); el 💰 provisorio también mide 60 días. **Qué chequear:** Naipes e Infusor con su 💰 y la explicación.
- **24/10/2026 · 🔐 las autorizaciones por el chat, no por Telegram** (él: *"no quiero que me mande a Telegram eso, que lo guarde y me lo mande por acá, en el aviso de las 12:30, y si no que lo siga guardando hasta que lo resolvemos"*). `pedirAutorizaciones` guarda el pedido (pendiente, `porChat`, vence en un año) y no manda nada (`AUT_POR_TELEGRAM = false`); `autorizo:<su texto>[;go]` (`autDesdeChat`, ml-sync) anota su respuesta con la misma lectura que Telegram, firmada por el robot, con su texto literal (`txtChat`), vale 48 h desde que la anoto; `autoriza` muestra las pendientes sin vencer. La tarea de las 12:30 se las pasa. **Qué chequear:** que ningún 🔐 salga por Telegram; que `autorizo:<código>;go` deje la autorización firmada y `decido` la use.
- **24/10/2026 · v26.43 · las rayas 💰/🔴 con los últimos 60 días y sin fechas especiales** (él con el Infusor cajita: *"un claro ejemplo de que el techo que tenía antes era mentiroso, ya que se pasó ese techo y se está vendiendo"*). El 💰 $4.480 salía de 28/07-04/08 (12 por día, el triple de lo normal, antes del Día del Niño y hasta cortarse el stock) y contra eso $5.290 "dejaba menos al 95%": 🔴 falso. `RAYAS_DIAS = 60` y `diaFechaRaya` (ventanas de `fechasEspeciales`) en `rayasPrecioLinea` (robot: techo95, F5/F7/F8/F11, ficha) y en `_rayas` (web, `_fechasEspR`/`_diaFechaRaya`, copia). Probado con una línea inventada: un pico viejo a $4.000 ya no es el 💰. **Qué chequear:** `techo95` de la completa: cuántos 🏔️/🔴 cambian; que el Infusor quede sin 🔴 y en 📈; que nada con 💰 provisorio se rompa.
- **24/10/2026 · v26.43 · el precio de HOY en la línea de tiempo** (él con el Kit Jade: *"marca que está 14.990 y hace un par de horas ya está en 19.990"*). Los días con ventas dibujan lo cobrado por unidad; hoy eso tapaba el cambio de la mañana. Hoy manda `_pHoy` (el último precio puesto, con los cambios de hoy). **Qué chequear:** una publicación cambiada hoy muestra el precio nuevo en el último punto.
- **24/10/2026 · TODO EN 35% O MÁS** (él: *"quiero que todo quede en 35% o más, me refiero a ventas y pedidos, ya que no tenemos suficiente plata para todo… no quiero que nada se venda a menos de 35% excepto si ya está quedando en sobrestock, ahí sí liquidar siempre con margen para nunca pagar stock"*). `meta:35:35` (cyc/mlconfig minPct = targetPct = 35 → `PISO_DURO`, 🛡️ de `planilla`, el máximo de compra por defecto de la web) · `CAND_VARA_VENDE` 30→35 (se acabó la entrada con 30%) · `PERF_LOCAL_GAN` 25→35 · web `PY_PROB_PISO`, `LL_META`, `EMBUDO_PISO`, `SIM_PISO_PCT` 25→35 · `decide_pedidos.py`: se repone sólo lo que deja 35%+ con la cuenta de la app (antes neto ≥ costo × 1,1) · freno 4a `al25` usa `PISO_DURO`. Medido al cambiar (planilla 16:30 UTC): de 460 activas con stock, ~65 quedan abajo del 35% y vendieron 43 de 1.796 u. en 30 días (~$171.000/mes de ganancia). **Qué chequear:** la próxima vuelta sube las 🛡️ al 35% (o `!piso` con motivo de sobra); que la próxima completa no pida nada abajo del 35% y diga cuántos se cayeron del pedido; que Paulvic (14.990) siga llegando.
- **24/10/2026 · sus 11 respuestas a la revisión de Precios (36 a 46).** **36 (él: falta de stock nunca baja sin techo 95%, salvo stock por cumplir 4 meses en Full):** freno **F11** en `frenosBajas` (`enFalta` = escasez con su suba, o última estrategia 🔥/⏳ salteando 🪜, o el tag nuevo; `antiguoCerca` = la unidad más vieja a ≤20 d del primer escalón pago de `tablaAntiguoDe`, con el Excel de lotes o `stockhist` real); ↘️ #volviendo de una escasez pasa sólo con stock para 30+ días; ⏳ sinrepo abre F5/F7/F8/F9 sólo con `antiguoCerca`. **37a:** el freno 4a mira TODA suba (afuera: subir al 25% del peor caso `mgP0<25 && mgPA≤27`, 🔥/⏳ con stock para <100 días, ↘️/↗️ volver a un precio de mis cambios de 90 d) y "bajar la lista de algo que buscó techo va como descuento" mira toda baja (salvo #volviendo de escasez). **38a:** `nobajar:-…;go` pide su autorización (`sacanobajar`, tipo propio en `cyc/autoriza`) y la marca usada. **39a:** `alinearGemelasEnvio` no baja una gemela de envío abajo del piso del peor caso: queda en `cyc/gemelafloja/<MLA>` y sale en `planilla` (📦🛡️). **40a:** `gemelacrea` no crea si para la misma plata pasa $550.000 (ni con !piso) y `gemela` lo avisa. **41a:** sin cambios. **42a:** `lineaConNetoEst` (días sin neto de ML antes de mayo: neto = cobrado × proporción del día con precio más parecido, como `_gdViejo` de la web) en `rayasPrecioLinea`, `armarFicha`, `frenosBajas` y `efectotecho`. **43a:** listas con `svm` (🌟) ya no las tapa `mv<1` (robot `cuentaLista`, web `_listaMed25`, `listarevisar`). **44a:** `revisarcompra` acepta el perfume que deja 25%+ en el local (reparo, no freno). **45a:** Rotación sin "rematar al 12% / limpiar al 20%". **46a:** renovar el mismo descuento (`opts.promo && !esEscalon`) no lo frenan F5, F7 ni F11. **Qué chequear:** `errores` y `planilla` limpios en la próxima vuelta; una baja de algo en 🔥/⏳ sin techo sale con F11; `nobajar:-<algo>;go` manda el pedido por Telegram y con "autorizo" la saca; `ficha:` de algo viejo ya no muestra días de abril con ganancia negativa; la sección 📦🛡️ de `planilla`.
- **24/10/2026 · la última unidad ya no es excepción para bajar de golpe** (él con el Cuba Gold, $67.174 → pedido a $32.990: *"que baje cuando encuentre techo en escalera, no de una a 32.990. excepto que haya algo con el envío o cosas excepcionales"*). Las excepciones de la escalera quedan: precio mal puesto · stock antiguo · ML la pausó por el precio · lo pide él · el envío (barrera $33.000). Y en escasez / sin reposición que vende no se baja (sube), salvo que no se vacíe en 120 días (escalera). **Dónde vive:** CLAUDE.md §3 regla 5, CEREBRO (excepciones y §6), texto de F2 en `sync.mjs`. **Qué chequear:** que la próxima última unidad cara no pida una baja de golpe y que el detector no la deje pasar.
- **23/10/2026 · marcas prohibidas sólo para ML** (él con el CK One: *"por la marca nos denuncian al toque (…) marca prohibida para ml, ya que para perfumería son los que más venden"*). `cyc/mlconfig/marcasNoML`, comando `marcanoml` (ml-consulta; lista las publicaciones vivas de esa marca sin tocarlas), `marcaNoMLDe` frena `publicar`, `gemelacrea` y `gemelaenviocrea`. NO toca candidatos ni pedidos (a diferencia de `marcano`). Primera: Calvin Klein. Qué chequear: `publicar:ck one…` sale frenado; un perfume CK sigue entrando a los pedidos de perfumería.
- **23/10/2026 · publicar a 35% mínimo** (él). `PUBLICAR_MIN_PCT = 35`: `publicar` busca el precio que llega a 35% en el peor caso (binaria a cada lado de la barrera de $33.000, termina en 990/90) y frena abajo. `porquedaba:<palabra>` muestra lo que medía el candidato al comprarse contra el costo de hoy. Qué chequear: que un precio que pasa la barrera no se elija si abajo ya llega; que la búsqueda no gaste más de ~32 consultas a ML.
- **23/10/2026 · 🔒 F10 no bajar** (él, waflera). `cyc/nobajar/<MLA>` = {ts, m}; comando `nobajar[:<MLA|palabra>[=motivo]|:-…][;go]` (ml-consulta, marca Clásica y gemelas de la ficha); F10 DESPUÉS de las otras reglas en `frenosBajas` (él: *"que evalúe y que diga qué hubiera hecho"*): dice "HUBIERA HECHO: bajarla de X a Y" + mi motivo y lo guarda en `cyc/nobajar/<MLA>/hubiera` (la lista `nobajar` lo muestra); `nobajar` en `BANDERAS_SUYAS` (🔐 su autorización), en los dos parsers y en `BAN_DEC`. 🧊 `!congelar` (23/10, waflera, última unidad): `congelado`+`stockAl` en `cyc/nobajar/<MLA>`; `_chequeoNoSubir` (todas las subas) no sube mientras `cyc/inventory/<prod>__<cuenta>` ≤ `stockAl`; sin poder leer, no sube. El detector 🆕 no la lista mientras está congelada (la cuenta dice "N 🧊 congeladas"). Qué chequear: que al llegar una caja suba normal; `decido:<MLA>=<más bajo>#bajando|…` sale frenado con F10; una suba pasa; el detector marca ❌ una baja de una marcada.

### 🆕 Lanzamiento que vendió por la gemela y no subió (23/10/2026, corrección suya con el Masajeador)
- **Qué es:** la venta del Masajeador entró por la Premium; el 🧭/🔬 de `ventasraras` leía la estrategia de la gemela (💳 = bien) y no la 🆕 de su
  Clásica, así que no salió "lanzamiento que vendió" y la vuelta no lo subió. Ahora una venta de gemela se juzga con la estrategia (y el techo
  probado) de su Clásica, y el detector `errores` agrega el bloque 🆕 LANZAMIENTOS QUE VENDIERON Y NO SUBIERON (Clásica activa con tag 🆕,
  venta propia o de gemela/hermana después del tag, sin suba mía después de esa venta) con el `decido` +30% listo.
- **Dónde vive:** `sync.mjs` → `ventasraras` (`clasDe`, `estDe`) y `detectarErrores` (bloque `lanza`, `res.lanza`).
- **Qué chequear:** que el bloque salga vacío al terminar cada vuelta · que no liste lo que ya subió · que la venta de una gemela 🆕 salga 🔬
  "lanzamiento que vendió (por la gemela…)".

### Vara de compra: 35%, o 30% si vende 100+ con 2+ vendedores (23/10/2026, v26.13, eligió la 1a)
- Qué: `varaCompra`/`candVaraDe`/`listaVaraDe` en index.html y sync.mjs (las dos iguales). Web: `candPisoDe`, colores (`candPctCol`), `_listaMed25`, carpetas de Listas. Robot: `pedir`, `revisarcompra`, `cuentaLista`, `listarevisar`; `faltaventas` lista desde 30% (las vendidas deciden).
- Por qué: hasta el 31/12 sobran ~$52 M contra el tope de H (Matías al límite): un 30-35% que vende mucho suma en vez de desplazar. En febrero, con los topes nuevos, se vuelve a medir.
- Chequear: Sony EX15LP rosa (32%, 1.000 vendidas, 8 vend.) en verde y pedible; uno de 32% con 25 vendidas en rojo; que web y robot den la misma vara.

### `vara` (23/10/2026, sólo lee): ¿35% o 30% para comprar algo nuevo?
- Qué: cuenta los candidatos de Paraguay y los productos de las listas por tramo de % (25-30, 30-35, 35-50, 50+), cuántos pasaron todo y cuántos venden 100+, y lista los de 30-35% que pasaron todo.
- Chequear: que use los mismos filtros que `faltaventas` (vivos, sin categoría que no se mira, costo vigente).

### Publicar desde acá: Clásica + Premium + envío gratis, todo PAUSADO (23/10/2026, él: "intentalo", etapa 3)
- **Qué es:** él aceptó que yo cree las publicaciones nuevas (todas de catálogo). Cada producto lleva Clásica (`publicar`), su gemela
  Premium (`gemelacrea`) y, si queda abajo de $33.000, la Clásica con envío gratis (`gemelaenviocrea`; arriba de $33.000 la Clásica ya
  tiene envío gratis, no se crea). **Todo queda pausado** (*"esa mercadería no la podemos mandar por correo, sí o sí a Full"*):
  `publicar` ya pausaba; desde hoy las dos gemelas se pausan en el acto si la Clásica no está activa, y se relee.
- **Dónde vive:** `sync.mjs` → `publicar`, `gemelacrea`, `gemelaenviocrea` (bloque "pausar la gemela nueva").
- **Qué chequear:** que ninguna quede activa con el 1 de depósito · que la vuelta de la hora las active cuando entra la caja a Full.

### CYC Avisos = sólo urgente y recordatorios (23/10/2026, regla suya, etapa 4)
- **Qué es:** él: *"si me llega un mensaje de CYC Avisos sé que es algo que tengo que resolver ya"*. `pregunto:` sólo sale si el texto
  empieza con "URGENTE"; `resumen:` no sale; lo que deshace el detector va al log. Las decisiones van a `notas/para_mati.md`.
  Siguen yendo: `recordar:`, las 🔐 autorizaciones que él pidió en el chat, el chat nuevo del bot.
- **Dónde vive:** `sync.mjs` → bloque `recordar|pregunto|resumen` y el aviso de `detectarErrores`; CLAUDE.md §4, CEREBRO §20.
- **Qué chequear:** que ninguna vuelta mande decisiones por Telegram (las vueltas pasan por `pregunto:` y ahora se les niega).

### 4a · lo que vende menos de 1 por semana no busca techo (23/10/2026, eligió la a, etapa 1)
- **Qué es:** `techodias` mostró que 31 de 34 lentos (menos de 1 por semana) no vendieron ninguna al precio nuevo (~9 esperadas entre
  todos) y dejaban ~$12.500 menos por día. Él eligió: vuelven a su precio de antes (redondeado a 90) como 💰 #punto, salvo los que
  eran 🆕 lanzamiento, y freno nuevo en `decido`: suba #techo con ritmo de 60 días (con gemelas y hermanas) menor a 1 por semana → no.
- **Dónde vive:** `sync.mjs` → `ritmoSemanalGrupo`, `TECHO_RITMO_MIN_SEMANA`, el freno en el bloque de subas de `decido`, y la lista
  "4a" de `techodias` (con `tagPrev` y `pAntes`). Las vueltas pasan por 🔐 (`!sinlinea !sincerteza`): le llega UN Telegram.
- **Qué chequear:** que un 🆕 que vende siga pudiendo subir · que el freno no lea mal el ritmo de lo recién llegado (60 días fijos).

### Packs: sí si el pack tiene su propio catálogo (23/10/2026, regla suya, etapa 3)
- **Qué es:** él: *"si el pack está en catálogo sí se arman"*. Reemplaza el "packs NO" del 27/09, que era por sacar de la competencia
  algo que hoy compite suelto. Un pack se mide como cualquier producto nuevo contra SU catálogo (2+ vendedores, mismo pack exacto).
- **Dónde vive:** CLAUDE.md §5 (renglón de la comisión). Primer caso: rejilla Media Naranja 40x45 → no hay catálogo de pack de esa
  rejilla (los x4/x6 de Media Naranja son trapo de piso, otro producto): no se compra.
- **Qué chequear:** que la medición de candidatos no confunda un pack con la unidad (ya lo frena `pack`/`3x`/`x2` en CEREBRO §17).

### `!activar` sin fecha de alta (23/10/2026, etapa 1)
- **Qué es:** la única salida mía sin él (corregir el precio de lo que NUNCA estuvo activo al activarlo) pedía `altaTs` en el renglón de
  `cyc/mllinks`; el Sacapelusas y la Mentonera (Ayelen) no lo tenían y quedaban frenados por F2/F7 aunque su línea dijera "siempre
  pausada". Sin `altaTs` vale el primer día de la línea de tiempo, y el freno dice por qué `!activar` no vale (activa tal día, sin fecha, +90 d).
- **Dónde vive:** `sync.mjs` → `frenosBajas` (`altaRef`, `diaActiva`, `porQueNoActivar`).
- **Qué chequear:** que algo que estuvo activo un solo día siga frenado (pide su autorización).

### `pydet:<id>` (23/10/2026, sólo lee): el detalle guardado de un pedido de Paraguay
- **Qué es:** cada renglón como `código*unidades*pagado` con el precio de la web al lado. Para cargar un ticket que faltaba hay que
  mandar el `det=` ENTERO (lo que no figura sale del pedido). Primer uso: el 4º ticket del pedido del 08/10 (`py20261010`; Revlon 14,
  Gudsport 10, Medicube 13, Wella 33), total US$ 475,40 igual al pagado.
- **Qué chequear:** el código del Gudsport en el ticket (6146978) no termina igual que el guardado (145978): se cargó con el guardado.

### 📈 PRUEBA CON RESPUESTA en `planilla` (23/10/2026)
- **Qué es:** toda 📈 activa que llegó a 3 ventas esperadas desde la suba (o 3 más desde mi última nota) sale en la lista y se decide en
  esa vuelta. El 23/10 había 10 con respuesta sin juzgar (Naipes, Centímetro ×2, Infusor ×2, Termómetro ×2, Mazo, Adaptador Hub, Paulvic Good).
- **Dónde vive:** `sync.mjs` → `pruebasTechoEnCurso` (la usan `techodias` y `planilla`).
- **Qué chequear:** que una nota "sigue" la saque hasta 3 esperadas más · que lo decidido salga (el tag nuevo cambia el inicio).
- **Arreglo 23/10 (tarde):** la ganancia por día antes/después era BRUTA y la ficha la da NETA (dos cuentas para un número). Ahora
  resta −$100/u de trabajo y −3% de lo facturado (tope de H), como la ficha y `techo95`; la plata parada no entra (pide el stock por día).
  **Chequear:** que el antes/después de la lista y el de la ficha den parecido para la misma publicación.

### `techodias` (23/10/2026, sólo lee): ¿cuánto tarda cada prueba de techo en dar certeza?
- **Qué es:** él: *"mientras más días buscando techo, más días perdiendo ventas; el punto justo para tener info lo más rápido sin apurar"*.
  Cada publicación activa con 📈: días en la prueba, ritmo de los 30 días antes (con gemelas/hermanas), vendidas desde la suba y
  esperadas; el 95% llega con 3 esperadas y 0 vendidas → días que hacen falta = 3 ÷ ritmo. Agrupado por ritmo.
- **Dónde vive:** `sync.mjs`, antes de `pycatdia`.
- **Qué chequear:** que el ritmo de antes no cuente días sin stock como días sin venta (hoy divide por 30 fijo: lo de poco stock sale más lento de lo que es).

### ¿Vendemos menos por buscar techo? `efectotecho[:días]` (22/10/2026, pregunta suya, sólo lee)
- Qué: semana por semana la tienda entera (u., facturado, ganancia, cuántas subas 📈) + cada suba buscando techo de `cyc/claudecambios` con 7+ días: u./día, visitas y ganancia/día con stock, 14 d antes contra hasta 14 después (corta en el próximo cambio), comparado contra lo que se movió la tienda en las mismas ventanas.
- Chequear: que los días sin stock no cuenten; que el costo c/u salga de lo vendido (sin costo → ⚠️); que el "esperado" use las mismas ventanas que la suba.
- **✅ LAS 6 DECISIONES DE PRECIOS: ELIGIÓ TODAS (a) EL 21/10/2026** (en 1.6 aclaró: *"en verdad son las mismas unidades, no habría que duplicar la plata"*). Antes decía: ESPERAN SU RESPUESTA (él: *"guardás eso junto con las de diseño"*). Se le
  recuerdan junto con las 30 de diseño. (a) = la recomendada. 1 volver al precio de antes tras una prueba de techo que no rindió →
  (a) 🪜 bajando hasta que techo95 diga 95% (b) sigue quedando 🏔️ hasta que techo95 lo corrija · 2 la marca liquidando frena también
  mis bajas/descuentos/remates → (a) que frene sólo las subas (b) como hoy, sacarla antes · 3 la 🏔️ no vence → (a) techo95 guarda la
  foto del mercado en `cyc/techofreno` y se reabre sola (sube/desaparece la competencia o 30 d) (b) a mano · 4 tags que ya no
  explican el precio → (a) 🎁 7 d después de la fecha, 🪜 14 d sin escalón nuevo, 🥊 30 d, después a 🔎 (b) duran hasta que los
  cambie · 5 candidatos, listas y máximo de compra con el peor caso (2% retención) → (a) sí (b) no · 6 plata parada de un stock
  compartido (gemela/repetidas) → (a) repartir por lo que vende cada una (b) dejarlo y no sumarlas.
- **APLICADAS LAS 6 DE PRECIOS (v25.75, 21/10/2026).** Lo que se hizo, dónde vive y qué chequear:
  - **21/10/2026 · las 6 aplicadas (a).** 1 `pasajeDe`/`estrategiaPasaje`: volver de 📈/🏔️ = 🪜; `decido` lo anota 🪜 (y 🚧 en techofreno);
    `techo95` mira esas 🪜 (`bajaDeTecho`): 95% → 🏔️, si no siguen 🪜. · 2 `calcCerebro`: liquidando con `forzar` (decido/entrarpromo) baja,
    no sube; `aplicarCerebro` baja la marcada si lo decidí yo. · 3 `fotoMercadoTecho`/`porQueReabrirTecho` (una sola cuenta con `techofreno`):
    `techo95:go` guarda la foto (`cyc/techofreno/<MLA>` con `t95`) al anotar 🏔️ y la reabre a 📈 si el ajeno sube 8%+, desaparece, no queda
    abajo, ganamos la caja o pasan 30 d. · 4 `tagVencido`: 🎁 7 d después de la fecha, 🪜 14 d sin escalón, 🥊 30 d → 🔎 SIN AFINAR.
    · 5 `cuentaCandidato` y `maxCompraDe` con `PEOR_RET_PCT` (CAND_CALC_VER 13, pycat/listas `cv`). · 6 stock compartido: línea junta
    (stock una vez) o `partesStockDe` (escmedir, lupa, `rayasPrecioLinea`/`armarFicha` con `parte`).
    Qué chequear: ninguna 🏔️ sin foto t95 después de la completa (salvo las especiales); la 🔎 sin afinar con los vencidos; ningún
    liquidando subido; máximo de compra = 25% en el peor caso; los candidatos medidos con calcVer 13.
- **21/10/2026 · v25.61 · 🪜 bajando con techo marcado** (él con el Centímetro Blanco: *"está bajando sin techo"* · *"todos los productos
  tienen que tener techo marcado, excepto los que tienen sobrestock, bajando por algún motivo puntual, o que todavía están buscando
  techo"*). `decido` con 🪜 anota solo en `cyc/techofreno` el precio que no rindió (`auto:true`, no pisa uno de 30 días con precio
  igual o más alto). `techofreno` sin args lista 🪜 sin precio probado y 📏 activas con stock sin techo marcado. Web: la línea dice
  "🪜 bajando desde $X · no baja de $piso" y con raya 🚧 ya no dice "techo: todavía no se sabe". Qué chequear: las dos listas vacías
  después de la completa; ninguna 🪜 sin raya 🚧 en la línea.
- **21/10/2026 · F4 con 15 días (decisión 2b):** `frenosBajas` F4 pide 95% o visitas a la mitad sólo los primeros 15 días de una suba
  de 5%+ (`F4_ESPERA_DIAS`); de 15 a 60 días frena la baja si la suba deja igual o más plata por día que la ventana de antes (sin
  dato para medir, decide el 🧠). Chequear: el texto del freno dice cuál de los dos casos fue.
- **El expediente trae el stock antiguo (16/10/2026).** `calcAntiguoFilas` (una sola cuenta para `antiguo` y el expediente):
  sección 💸 arriba de todo con lo que paga o va a pagar (por color), mi última decisión o SIN DECIDIR, y una línea 💸 en cada
  bloque. Caso: P47 blanco pagaba y le subí el precio; Tira Led paga ~$39.000/cierre. Chequear: la sección sale aunque el
  producto venda poco (antes `fueraPocas` lo sacaba del expediente).
- **LOS PRECIOS LOS DECIDE CLAUDE, NO EL ROBOT (08/10/2026 a la tarde, v22.68).** Él: *"que haya solo robots
  automáticos de api para cosas que no hay que pensar, como ventas y cosas así de datos. TODO lo que sea pensar lo
  veas exclusivamente vos"*. Reemplaza la decisión 2a de ese mismo día. `autoPrecios: off` (se cambia con
  `decido:modo=claude;go` / `decido:modo=robot;go`): la noche (`avisos:go`) sólo CALCULA y anota en el expediente 🧠
  lo que haría (rescate/base, caja barata, remate, escalera, corrección, cerebro), y `volverSinFull`, el "volver" del
  supervisor y la suba al vender quedan quietos. La rutina de Claude (10:47 y 22:47) mira todo y aplica con
  **`decido:<MLA>=<precio>[!piso][!cruza]|<motivo>;…;go`** (ml-sync): `calcCerebro` con `forzar` (misma cuenta que
  la noche: comisión a ese precio, envío del lado de la barrera, cuotas, IIBB, mono) + `aplicarCerebro` (relee,
  `cyc/autoprecio` con `por:'claude'`, memoria del cerebro). Siguen automáticos, por mecánicos: sacar promos
  (regla 8), activar pausadas con stock en Full que dejan el piso, cajas, stock, vínculos, ventas.
  Chequear: que nada que mueva un precio quede prendido con `autoPrecios: off` · que `decido` respete techo,
  barrera (sólo `!cruza`), piso (sólo `!piso`), 0%, variantes, liquidando · que el supervisor cuente `por:'claude'`
  como subir/bajar · que la rutina lea el expediente y no repita lo que ya hizo.
  · **Pausadas y novedades también las decide Claude:** con `autoPrecios: off` la vuelta de la hora sólo MIDE las
  pausadas con stock en Full (no activa ni avisa); Claude las activa con `decido:<MLA>=activar` o
  `=<precio>!activar` (sólo si queda al precio pedido y deja el piso, o con `!piso`; sólo pausas nuestras, no las de ML;
  relee el estado). **`informe[:horas]`** (ml-consulta, solo lee) junta en un log lo que la revisión necesita: avisos,
  ventas, lo que ya decidió Claude y cómo le fue, lo que haría el robot (cerebro sin aplicar), pausadas con stock y
  publicaciones nuevas, y (desde la misma noche) canceladas/reclamos, ventas sin costo o sin ficha, los pedidos que más
  plata ponen en riesgo y las cajas en camino con 9+ días. **Auditoría del 08/10 (la primera):** el informe leía los avisos de
  `alertaslog`, que sólo guarda lo que SALIÓ por Telegram — lo que el filtro se tragaba (`info`: pasos de la noche que
  fallaron, promos no leídas…) no le llegaba nunca a Claude. Ahora lee `mlapi/cerebroavisos` (todos, 📨 salió / 🔇 no).
  Y se sumaron: 10 preguntas sin responder (leídas de ML en el momento, texto tapado y corto: el registro es público) ·
  11 publicaciones frenadas por ML o cerradas · 12 caja de compra perdida en lo que vende · 12b sin stock y vendían ·
  13 reputación, promos sin leer y dólar. **`contesto:<id>=<respuesta>;…;go`** (ml-sync): Claude contesta las preguntas
  que sabe sin duda; mismo freno que la IA (`respuestaIAValida`), busca la cuenta, relee de ML, registro
  `cyc/respuestasauto/<id>` `cat:'claude'`. Chequear: que el informe no imprima mails/teléfonos de compradores. Sacar promos (regla 8) sigue automático. **ml-sync cancela la corrida anterior si se dispara
  otra: los `decido` van TODOS en un solo comando por revisión.**
  · **Las explicaciones del 🧠 las escribe Claude (v22.69):** `decido` guarda en `mlapi/claudeexp/<MLA>` el motivo de
  cada cambio (o el fallo), `MLA=nota|texto` deja una nota sin tocar el precio y `revisado` anota
  `mlapi/claudeexp/_ultima`. Con `autoPrecios: off` el 🧠 (`cerebroAbrir`) muestra SÓLO eso (más el margen de hoy);
  sin nota dice cuándo la revisó. Chequear: que no vuelva a aparecer el texto automático del robot en modo Claude.
  · **Auditoría del robot (`ml-sync/AUDITORIA.md`, rutina `trig_0138cyCgYeEHjqeayqiQPqWQ`):** Claude mira los datos
  crudos sin el `informe`, compara y arregla lo que el robot no le pasaba. Diaria al principio y se espacia sola
  (3-4 d → semanal → quincenal → mensual) mientras no encuentre nada; si encuentra algo, vuelve a diaria.
- **Cerebro de precios** (`calcCerebro`, `cyc/cerebro/<MLA>`, `avisos:go`): plata por día, escasez
  (tope ×2,5, ML pausó el espejo a $49.190), paciencia de la apuesta alta, vuelta al precio de antes
  al llegar la reposición, fechas especiales.
- **Corrección de las subas de más** (`exceso` en `calcSubirPorMargen`, `por:'correccion'`): sólo
  lo que no vendió desde la suba, nunca abajo del precio de antes de la suba, ni abajo de los $33.000 si
  ANTES de la suba ya estaba arriba (si la suba cruzó la barrera, puede volver abajo, medido sin envío).
- **Cuotas que ya vienen en la comisión** (`enComision`, probe `cuotas`): no sumarlas dos veces en
  rescate, cerebro, caja barata, escalera, comandos.
- **Rescate sin umbral** (`subeDesdeDe` = base − 1) y sin frenos con stock 0 (por color, `subStatus`).
- **Escalera con fecha aproximada** (`edadFullCb`): puede esperar de más, nunca bajar antes.
- **Supervisor** (`cuentaRemate`, regla firme del 08/10): el ritmo sin robot sale sólo de las ventas
  al precio viejo.
- **Revisión del 08/10/2026 (lo que se arregló, para mirar que siga así):** el probe `cuotas` no pisa
  `enComision` si ML no contesta · `ventasProdClasica` (una Clásica no deduce el envío con ventas de
  una Premium) · `precioJustoMeta` (el rescate llega a la meta, no más) · `cruza` viaja en las tareas
  del rescate · prefiltro del rescate mira `cyc/netopub` publicación por publicación · al vender entra
  todo lo de ≤ `SUBE_DESDE` · `_subiendoVivo`/`_bajandoVivo` (las marcas vencen a las 24 h) · cerebro:
  `D.segPrev` (ventana mezclada, cada venta a su precio), no vuelve para arriba después de una
  `correccion`, `pisoEntre` (fin de escasez y precio de antes abajo del piso), `limpiarEsc` · la
  corrección mira la barrera con el precio de ANTES de la suba y sigue la cadena de subas en varias
  noches · `calcCajaBarata` sin `comHoy` no baja lo que sobra · `CLAS_COLCHON` (se clasifica con el
  mismo medio punto con que se aplica) · `unapub`/`bajar` usan `cuotaPremiumDe` · `correrVolver`
  devuelve lo de antes si ML rechaza · supervisor: aviso de pérdidas sólo lo medido, `rescateventa`
  como fuente, `por` en cada registro · el rescate no deshace bajas del cerebro (`bajaPerdio`).
- **El cerebro manda (08/10/2026, decisiones 1a-6a):** `calcCerebro` corre PRIMERO en `avisos:go` y lo que decide
  (`cerTocadas`) sale de las listas de base/rescate, corrección, caja barata, remate y escalera; ninguna de esas
  pone un precio que el cerebro marcó "no funcionó" en 30 días (`cerNoFunciono`, ±2%). Chequear: que ninguna
  regla de afuera vuelva a mover lo que el cerebro decidió esa noche · `filtrarRescate` no lleva a la base lo
  que puso el cerebro arriba del piso (`pisoPct`) · pausadas con stock en Full sin `noAutoActivar`/`nomas`/pausa
  de ML se rescatan (`pausadaFull`) · `RESCATE_AL_VENDER_OFF` (estado `noche` en `cyc/rescateventa`) · cerebro:
  no vuelve para arriba con stock de sobra (`juicio:'sobra'`), no explora con 🔴 del supervisor (`malosSupC`) ·
  supervisor: `mot` en eventos y registros, escasez del cerebro sin volumen, lo del cerebro en el aviso de
  pérdidas sólo como info (`nuevasCer`) · `escPrecioPara` mira $32.990 primero si hoy está arriba de la barrera.
- **El expediente y el botón 🧠 (08/10/2026):** `EXP`/`expA` en `avisos:go` → `mlapi/cerebroexp` (se reemplaza
  entero cada noche, sólo la 1ª corrida y sin DRY) · `mlapi/cerebroact` lo escribe `activarPausadasFull` cada hora ·
  web `cerebroBtn`/`cerebroAbrir`. Chequear: que cada regla que mira una publicación anote lo que dijo (una regla
  nueva sin `expA` deja el botón mudo) · que lo que se hizo coincida con lo que dice ✅ HECHO · con el cerebro
  prendido el supervisor no mueve precios (`CEREBRO_SUP`) y `nivelarGrupos` no corre · fecha de regalos permite
  reintentar un precio que falló (`fDem > 1`).
- **El 🧠 en palabras simples (08/10/2026, v22.67):** `cerebroSimple(D)` (sync) arma una frase sin nada técnico
  de cada decisión del cerebro; va en `autoprecio.simple` y en el expediente (`EXPS`/`expS` con prioridad: lo
  hecho gana sobre lo que no) y `activarPausadasFull` deja `cerebroact.simple`. La web (`cerebroAbrir`) sólo
  muestra esas frases + el % de hoy; en Pedidos `_cerPedidoSimple` arma "pido N porque vende X y tenés…".
  Chequear: que una regla nueva que toca precios escriba también su `expS` (si no, la ventanita dice "no hizo
  falta cambiar nada" cuando sí cambió) · que la frase y el número de la ficha digan lo mismo · que el motivo
  nuevo de una regla caiga en alguna fila de la tabla de `cerebroSimple` y no en el genérico.
- **El 🧠 sólo con lo que escribe Claude (08/10/2026, v22.70):** él: *"antes de ver uno escrito por el robot
  automático prefiero que no aparezca nada, solo lo tuyo"*. Con `autoPrecios: off`, `cerebroAbrir` muestra SÓLO
  notas de `mlapi/claudeexp` (por publicación, y por renglón: `ped__<prodId>[__v__<var>]` y
  `caja__<prodId>__<cuenta>[__v__<var>]`, clave armada por `_cerClaveCtx` en la web y por `decido` en sync); si no hay
  ninguna dice "Todavía no escribí nada sobre esto." No se borró ningún dato (expediente, cerebroact, `_ultima`).
  Se escriben con `decido:ped:<palabras|id>[#var]=nota|texto` y `decido:caja:<palabras|id>@<cuenta>[#var]=nota|texto`
  (tiene que agarrar UNA ficha). Chequear: que las dos claves (web y sync) sigan iguales · que una nota de caja/pedido
  vieja no quede contradiciendo los números de hoy (la revisión de 12 h las reescribe cuando cambian).

- **CORREGIDO en v22.74:** lo que él quería era el "🧠 qué pasó" de la tarjeta Ventas de hoy (y el de Ventas): nota del DÍA
  `dia__<AAAA_MM_DD>` (`decido:dia:<AAAA-MM-DD>=nota|…`), y sin nota el botón no aparece (`_cerDiaVisible`, `vpCerebroBtnSync`).
  Los 🧠 de cada venta volvieron a mostrar la nota de precio. Lo de abajo (`venta__`) quedó sin uso en la web.
- **El 🧠 de Ventas, sólo si ese día pasó algo (08/10/2026, v22.73):** él: *"en el cerebro de ventas escribí algo si fue
  importante en el día, si no no"*. En Ventas x Producto el botón lee `mlapi/claudeexp/venta__<AAAA_MM_DD>__<MLA>`
  (no la nota de precio) y sin esa nota no aparece. Se escribe con `decido:venta:<MLA>@<AAAA-MM-DD>=nota|texto`.
  Productos y Rotación siguen con la nota de precio; Pedidos y Armar caja con las de unidades. Chequear: que la
  clave del día sea la misma (`v._dateKey`, `AAAA_MM_DD`) en la web y en `decido`.
- **`decido:archivo=<nombre>;go` (08/10/2026):** lee los renglones de `ml-sync/notas/<nombre>.txt` (uno por renglón, `#` =
  comentario) para escribir muchas notas del 🧠 de una vez. Ojo: el repo es público, ahí sólo van notas de NUESTRAS
  publicaciones (precio, margen, stock), nunca datos de compradores. Chequear: que el `go` sea el del comando.
- **`pedidosnotas` (08/10/2026, solo lee):** cada renglón de Pedidos con la cuenta guardada (`cuentaPed`) y si ya tiene nota
  de Claude, para escribir la de cada pedido. Chequear: que la clave de variante sea la misma que arma la web (`sid`).
- **`cajasnotas` (08/10/2026, solo lee):** lo que hay en la oficina por producto y color, con cada cuenta que lo publica (Full,
  camino, vendidas 30 d, días que alcanza) para escribir la nota del 🧠 de Armar caja. No calcula cuánto mandar (eso es la
  web). Chequear: claves de inventario de la oficina (`__Oficina_Mati`) y de color (`__v__`).
- **Descuento propio en cualquier publicación (08/10/2026, suyo: *"revisá siempre las promos que hay y fijate si sirve alguna.
  el descuento lo podés hacer siempre en ML en cualquier producto"*).** `analizapromo` tiene la sección **2c**: toda baja pensada
  (`bajarA` del expediente) que ninguna promo de ML cubre —o cuya promo pide bajar de más— sale con
  `entrarpromo:<MLA>=<precio pensado>@PRICE_DISCOUNT` listo, con el margen a ese precio; si la baja es menor al 5% (mínimo de
  ML) lo dice y ofrece `decido` o el 5%. `entrarpromo …@PRICE_DISCOUNT` ya no exige que ML lo liste como opción (arma el pedido
  igual), frena si la publicación ya está en otra promo de ML y si el descuento es menor al 5%. Las 4 vueltas del día corren
  `analizapromo`. Chequear: que 2c no proponga lo que ya tiene un descuento mío · que nunca se suba la lista para inflar el
  tachado · que ML acepte el POST sin candidato (si contesta error, anotarlo acá).
- **Toda baja va primero como promo (08/10/2026, regla suya):** precio tachado con el mismo neto (o mejor si ML pone algo) en
  vez de bajar el de lista. PRICE_DISCOUNT de 14 días que se renueva en la revisión. Chequear: que nunca se suba el precio de
  lista para inflar el tachado · que al vencer una promo propia se decida renovar o dejarla terminar · que el guardián de la
  hora siga sacando lo que no puso Claude.
- **Promos de ML, ampliado el 08/10 a la noche:** él confía en el análisis de Claude: cada promo se mide (lo que pone ML cambia
  de una a otra) y se entra si deja más plata, aunque la baja no estuviera pensada. `analizapromo` sigue separando, pero la
  sección "sin baja pensada" ya no es un no automático.
- **Promos de ML: excepción a la regla 8 (08/10/2026).** Él: *"si tenés identificada una publicación que vas a bajar y
  falta poco para una promo (y la promo te da algún beneficio) activala"*. `analizapromo[:días][:palabras]` (solo lee)
  lista las promos candidatas de cada publicación activa, mide el margen al precio de la promo con `calcCerebro` y
  separa: ✅ conviene (la baja ya estaba pensada —`bajarA` del expediente de la noche, o las frases viejas— y la promo
  la deja igual, o ML pone plata con `meli_percentage`) · 🟠 la promo pide bajar más que lo pensado · sin baja pensada
  (no se entra) · no se puede. `entrarpromo:<MLA>=<precio>@<id|PRICE_DISCOUNT>[!piso]|motivo[;go]` (ml-sync) entra:
  anota `cyc/promoclaude/<MLA>` ANTES del POST (si falla, la borra), relee de ML y deja la nota del 🧠;
  `entrarpromo:<MLA>=salir|motivo;go` sale. `removeStartedPromos` (vuelta de la hora), `sacapromos` y
  `promosAgendadas` NO tocan la promo anotada (por id; PRICE_DISCOUNT por tipo) hasta 1 día después de `hasta`; si
  `cyc/promoclaude` no se puede leer, esa vuelta no se saca ninguna promo. Medido el 08/10: los eventos (DEAL "DIA DE
  LA MADRE OCTUBRE", "OFERTAS OCTUBRE", LIGHTNING) piden 5% mínimo y ML no pone nada. Chequear: que una promo ajena
  en la misma publicación se siga sacando · que vencida la fecha la saque la vuelta de la hora · que el precio de la
  promo no pase por abajo del piso sin `!piso` ni de 0% · que el cerebro de la noche no lea el precio de promo como
  "cambio a mano" y frene subas.

### 22/10/2026 · 🔐 UN AVISO ALCANZA: todos los caminos por las reglas, salidas sólo suyas y el detector (etapa 1, eligió todo)
Después de los 3 Protectores de talón bajados con `!sinlinea` apoyados en la familia. **Reemplaza la 1a de abajo** (`!sinlinea` +
`!activar`): `!sinlinea` pasa a ser SÓLO SUYA; lo único que queda mío es corregir el precio de lo que NUNCA estuvo activo.
 · **LOS CAMINOS QUE CAMBIAN UN PRECIO O UN DESCUENTO EN ML** (medido en sync.mjs el 22/10, función por función):
   - BAJAN la lista y pasan por `frenosBajas`: `decido` (antes de escribir, con sus banderas) → `aplicarCerebro` → `setPriceTo` (entra
     por la marca `_FRENOS_OK`, una vez, 1 h) · y TODO lo demás que llama a `setPriceTo` pasa por LA PUERTA (`_frenosEnLaPuerta`, sin
     banderas): `alpiso`, `bajar`, `tocados`, `unapub …bajar=`/`empatar` (éstos también la miran ANTES de marcar liquidando), el
     `cerebro:go` y las bajas de `avisos:go` (rescate/caja/remate/escalera, apagadas con `autoPrecios` off), `volverSinFull` y el
     `supervisor` (apagados con SOLO_DATOS). Sin base (corrida de prueba) la puerta no deja bajar.
   - BAJAN el precio que ve el comprador: `entrarpromo` (POST de promos) pasa por `frenosBajas` con `promo` y pide las 🔐 igual.
   - NO pasan, a propósito: `alinearGemelas` y `alinearGemelasEnvio` (`setPriceTo` con `gemela`: siguen a su Clásica, que ya pasó por
     la puerta; el precio sale de la misma plata neta) · `gemelacrea`/`gemelaenviocrea`/`publicar` (crean, no bajan) · `activarPausadasFull`,
     `pausar`, `gemelaenvio` (estado o envío gratis, no precio) · `aclasica` (tipo de publicación) · `sacapromos`/`removeStartedPromos`
     (sacan descuentos: el comprador paga más) · `probarput` (el mismo precio).
   - SUBEN: `raisePrice`/`raisePriceTo`/`raiseVariations` (frenosSuba: techo $650.000, barrera, +25% salvo `libre`; liquidando y mi
     descuento vigente con `_chequeoNoSubir`), `volver` y `fijar` (no pueden bajar), `submargen` (sólo sube, frenosSuba + mi descuento),
     `precios`, `bajopiso`, `nivelarGrupos`, `rescatarAlVender`, `subirPorCosto` (apagados con autoPrecios/SOLO_DATOS). El 🔎 detector
     mira las subas mías (techo +30%, más del doble, terminación).
 · **🔐 Salidas sólo suyas** (`BANDERAS_SUYAS` + `#remate`): `!sinlinea` (F7) · `!sincerteza` (F4/F8) · `!sintecho` (F1) · `!bajocero`
   (F0, nuevo freno) · 🧨 `#remate` (abre F5/F7/F8 sólo autorizado; `tag:` ya no lo pone). Pedido: `pedirAutorizaciones` →
   `cyc/autoriza/<código>` {mla, tipo, de, precio, banderas, regla, freno, motivo, linea, ts, vencePed, estado, sigPed} y UN mensaje a
   `tgAlertas`. Respuesta: `_autDeTelegram` (en `resolveTgChat`, el mismo getUpdates, SIN offset: no se le pierde nada a nadie; nunca en
   consulta ni DRY): sólo su chat, nunca un bot, posterior al pedido, firmado HMAC con el token del bot; "autorizo"/"no", por código,
   el último verbo antes de cada código; un "no" posterior revoca lo no usado; lo rechazado no se vuelve a pedir por 48 h. `autNoVale`
   verifica (mla, bandera, precio ±$10, vigencia 48 h, las dos firmas). Usada → `usada`. Probe `autoriza[:todas]` (solo lee).
 · **Lo que cambió en `frenosBajas`:** lee una vez para varias (`pre`, el detector) · juzga en un momento (`ahora`, `propio`, `p0v`,
   `autCodigos`) · F0 nuevo (abajo de 0% con `mgA`) · F9 nuevo (en escasez nunca abajo del precio de antes) · la escasez cuenta sólo con
   su suba anotada en mis cambios, y la escalera de escasez (sin ventas desde el último cambio, 12+ h, sin bajar del normal) no la frena
   F4 · 📦 sobra y 📉 liquidando abren F5/F7/F8 sólo con sobra de verdad (90+ d de stock al ritmo con stock, sin ventas con stock en
   60 d, o lotes de 90+ d) · mis descuentos (`cyc/promohist`) son escalones de F3 · las vueltas atrás del detector (`por: 'errores'`) no
   cuentan como suba de F4/F7 · "antes de activar": lo que nunca estuvo activo ni vendió (línea de tiempo, alta de menos de 90 d) se
   corrige con `!activar` + EXCEPCIÓN sin F1/F7.
 · **🔎 `errores[:horas][:go]`** (`detectarErrores`, default 26 h): junta `cyc/claudecambios` (con `fmt: 2` = banderas, estrategia,
   autorizaciones y margen), `cyc/promohist` (entradas y salidas de mis descuentos, con lo mismo), `cyc/promoclaude` viejos, `cyc/autoprecio`
   que no es mío y la foto (`cyc/supervisor/eventos`, "a mano"); juzga cada baja con `frenosBajas` en seco en su momento, el 25% en el
   peor caso sin `!piso`, la estrategia (escasez/techo en una baja), las subas #techo de menos de +30% o de más del doble, y la
   terminación 90/990. Categorías ❌ · ↩️ · ⚠️ · ❓ · ✅ · 🔚 · 📷 · 💳 · 🔗 y la cuenta tiene que cerrar. `:go` deshace sólo lo `fmt: 2`
   (vuelve al precio de antes con `raisePriceTo` y relee, o `salirPromoMia`; anota `por: 'errores'` + `deshace` y la estrategia de antes;
   UN aviso con `sendAlerta` directo). Lo de antes se lista con su comando.
 · Probado con las funciones REALES (copia del archivo con exports) y una base y un ML de mentira: 66 casos (el de los Protectores con y
   sin su autorización, autorización tocada a mano o sin firma, F2/F3/F6/F9, la escalera de escasez, :go que deshace y avisa una vez,
   las respuestas de Telegram de otro chat/bot/viejas/editadas, "pero no", revocar, la puerta) + la de antes contra la de ahora en 14
   casos sin banderas (sólo cambian las 5 buscadas).
 · **Primera corrida con datos reales (22/10 18:21 UTC, `errores:72` por consulta):** 177 cambios en 72 h (162 de lista míos · 9
   descuentos · 1 salida · 5 de la foto), la cuenta cerró. ❌ 22 · ↩️ 19 · ⚠️ 38 · ✅ 92 · 🔚 1 · 📷 5. Los 22 ❌ son TODOS de antes
   del detector (sin banderas anotadas): F7 (sin línea de techo) 10 · F4 (deshacer una suba sin 95%) 5 · F2 (escalón de más) 3 · F1 1 ·
   F3 1 · sólo la terminación 2. Se listan con su comando; no se deshicieron (algunos son a propósito: el arranque de lanzamiento del
   20/10). Los 3 Protectores salen ↩️ (F4, ya devueltos a las 13:24). Lo que mostró y se arregló el mismo día:
   - los 38 ⚠️ eran TODOS "suba #techo de menos de +30%" de antes de que existiera esa regla (el freno de decido es del 21/10 03:30
     UTC): las reglas de CÓMO se decide (estrategia de una baja, +30%, más del doble) se miran sólo desde que existen (`DET_REGLA_DESDE`);
   - el redondeo de la terminación pedía la estrategia de ANTES (#prueba en el Adaptador, #caja en el Cuba): ahora la de HOY, y si hoy
     está en 🏔️ (techo95 midió ese precio) sólo avisa; y no cruza los $33.000 (queda $32.999) ni pasa el techo;
   - volver al precio de antes con la estrategia de antes pedía #descuento (WD) o #promo (Seagate) para una lista sin descuento: lo
     que habla de un descuento, o nada (⚪ ⏸️), vuelve como 📈 buscando techo (`tgVuelta`), que es lo que piden F1/F7;
   - 3 de los 5 📷 eran publicaciones que ML iguala solas con su hermana (`esHermanaPrecio`, la Lupa 90mm): los dos Mazos de cartas y
     un P47 de Matías. Van aparte como 🔗 (se juzga la que se cambió). Quedan 2 📷 que nadie anotó: Cuba Blue $32.990 → $45.000 y Cuba
     Gold $28.990 → $67.174 (~20/10, Adriana) — ¿a mano en ML?
   Segunda corrida con los arreglos (18:37 UTC, 171 cambios porque la ventana corrió): ❌ 22 · ↩️ 18 · ⚠️ 0 · ✅ 125 · 🔚 1 · 📷 2 · 🔗 3,
   la cuenta cerró.
   - lo anotado con el formato nuevo guarda también el stock con el que se decidió (`st`, en `cyc/claudecambios` y en las entradas de
     `cyc/promohist`) y el detector juzga con ése: la línea de tiempo tiene el de la noche anterior, y una caja que entró hoy hacía ver
     "no sobra" lo que al decidir sí sobraba (y `:go` lo habría vuelto atrás).
   Probado: 81 casos (los 66 + 15 nuevos con lo que mostró la corrida).
 · **Qué chequear:** que todo camino nuevo que baje un precio llame a `setPriceTo` (o pase por `frenosBajas`); que toda bandera nueva
   esté en los dos parsers y en `BAN_DEC`/el `ban` de `entrarpromo`; que una salida usada mal pase a `BANDERAS_SUYAS`; que cada corrección
   nueva tenga su chequeo en `detectarErrores`; que `errores` cierre la cuenta; que `autoriza` no muestre pedidos "TODAVÍA NO SALIÓ".

### 22/10/2026 · 1a 2a 3a: sin excepciones al "sin techo no se baja", ventas a fondo sólo las que lo piden, chequeo de bajas
 · **1a:** F7 de `frenosBajas` acepta `!sinlinea` sólo junto con `!activar` (precio mal puesto antes de activar). Antes la usé para bajar
   3 Protectores de talón por lo que vendió la familia. Qué chequear: ninguna baja sin 🔴/🏔️ salvo activaciones y las tags que F7 exime.
 · **2a:** `ventasraras` imprime 🔬 A FONDO (con motivo) y ✓ normales. Sólo las 🔬 van al ayudante en máximo.
 · **3a:** cada vuelta termina con `bajastecho:1` y deshace las ❌ del día (texto de las tareas programadas y CEREBRO 🔬).

### 23/10/2026 · Nissei: la carpeta "Sin medir o sin precio en ML" pasa a "Sin precio en ML" (etapa 7, pregunta suya)
 · Él leyó "5.571 sin medir" cuando sólo faltan ~100: el resto ya está buscado (nadie lo vende o afuera por regla). v26.17. Qué chequear: que el título no diga "sin medir" y que "Falta analizar" muestre los que faltan de verdad.

### 23/10/2026 · F9 de escasez: el precio de antes es el de antes de la PRIMERA suba (etapa 1, revisor de la completa)
 · `frenosBajas` tomaba como "precio de antes de la escasez" el `de` de la ÚLTIMA suba de escasez. Con una escasez subida en
   varios escalones ese número ya era de escasez (Brisa Marina $25.990 contra $18.150 real, Pizarra Rosa $6.490 contra $5.090,
   Chispero $8.490 contra $6.990) y F9 frenaba escaleras que el CEREBRO §7 permite. Ahora busca la primera suba de escasez del
   mismo tramo (escasez y 🪜 seguidas, 45 días). Qué chequear: que una escasez de un solo escalón siga igual y que una baja abajo
   del precio normal real siga frenada.

### 23/10/2026 · 📈 "dice techo y no sube": la prueba en curso no es un tag mentiroso (etapa 1)
 · `planilla` sacaba en 📈 toda 📈/🔥 sin suba DESPUÉS del tag. La revisión del 21/10 volvió a poner 📈 sobre pruebas ya subidas
   (Protector de talón $5.290→$6.490 el 19/10, Hub USB $9.030→$13.990 el 13/10): la lista no se podía vaciar sin subir otra vez una
   prueba que todavía no tiene certeza. Ahora, si mi último cambio de los 15 días antes del tag fue una SUBA, el precio de hoy es ese
   y no pasaron 15 días (F4), va abajo como "(prueba de techo en curso …)" y no cuenta. A los 15 días vuelve a la lista.
   Qué chequear: que una 📈 puesta sin ninguna suba (el caso de la Batidora) siga saliendo, y que una prueba de más de 15 días también.

### 22/10/2026 · `!sinlinea` no lo leía nadie (etapa 1)
 · F7 de `frenosBajas` acepta `!sinlinea` + "EXCEPCIÓN" en el motivo, pero ni `decido` ni `entrarpromo` pasaban esa bandera: la
   excepción era imposible (en la completa del 22/10 frenó la activación del Corsair y del Soundpeats y 2 bajas). Ahora las dos
   la leen. Qué chequear: que toda bandera nueva de `frenosBajas` esté también en los dos parsers.

### v25.92 · 21/10/2026 · Rayas al precio cobrado y F7 que vence a los 15 días (etapa 1, eligió 1a 2a)
 · **1a:** `rayasPrecioLinea` (sync.mjs) y `_rayas` (index.html): el día que cambia el precio, lo vendido cuenta al precio (de hoy o de
   ayer) más parecido a lo cobrado por unidad, la misma regla de los tramos de `armarFicha`. Antes iba todo al precio de la noche
   (Filtro 19/10: 5 de 6 a $4.990 quedaban a $5.750; Cartas: 26 a $3.310 quedaban a $3.890 y el 💰 iba a saltar). Qué chequear: que
   las dos copias sigan iguales.
 · **2a:** `frenosBajas` F7 no frena si la última suba de 5%+ tiene 15 días o más (`F4_ESPERA_DIAS`) y el precio sigue ahí: decide F4
   por plata por día. Antes F7 corría antes que F4 y lo que vende poco (sin 🔴 medible con 1-2 u. en Full) quedaba trabado.

### Revisión de la etapa 1, arreglos del 20/10/2026 a la noche (v25.60 · sync.mjs + web)
Qué es · dónde vive · qué chequear:
- **25% en el peor caso** en `entrarpromo` (sin caer al margen normal si falta) y en `analizapromo` ("conviene" y el `!piso` sugerido);
  la línea impresa dice normal y peor caso. Chequear: un descuento con normal ≥25% y peor caso <25% no entra sin `!piso`.
- **🏔️ sólo de techo95**: `techookDeTecho95` (texto `Techo encontrado, N% seguro` o `🔴 Techo de lanzamiento`) decide el freno F1
  de `frenosBajas` y `bajasnuevas` (que ahora lee también los descuentos de `cyc/promoclaude`). `decido`/`entrarpromo`/`tag:` rechazan
  `#techook` (y `decido`/`entrarpromo` también `#sindecidir`/`#agotado`); `tagDeMotivo` ya no deduce `techook`. Chequear: un
  `techook` anotado a mano no deja bajar lo nuevo.
- **`entrarpromo`**: renovar el descuento propio encuentra el que ya está (por tipo, no por id); si ML rechaza vuelve la excepción
  de antes en `cyc/promoclaude`; precio fijo de ML pedido a otro precio no entra; releído distinto o no visto → sale de la promo,
  restaura y no anota estrategia ni nota; `=salir` vuelve la estrategia de antes de la promo; `#descuento` con ML poniendo plata = 🏷️ promo.
- **`gemelacrea`** mide la Premium al precio pedido con `cuentaGemela` (la misma de `gemela`): peor caso <25% o neta menor que la
  Clásica → no crea salvo `!piso`. El envío de las dos sale de `envioGemelaDe` (netopub sólo si se midió arriba).
- **Redondeo**: `decido` usa el precio exacto; `setPriceTo` y `raisePriceTo` con `exacto` (lo que decidió Claude) no redondean, y sin
  `exacto` redondean a $10 sin cruzar los $33.000 (`redondeoSube`). Chequear: 32.999 queda 32.999 y 4.999 queda 4.999.
- **`!cruza`** sólo si a ese precio deja más por unidad que en $32.999 (calcCerebro). **`aplicarCerebro`**: el colchón de 0,5 no hunde
  abajo de 0% un margen positivo.
- **`sacapromos` a mano** manda `offer_id` y relee `cyc/promoclaude/<MLA>` antes de cada DELETE (como el guardián).
- **Pausar lo activo fuera de Full** corre cada hora también con SOLO_DATOS (bloque propio, sólo pausa).
- **No inflar el tachado**: `_chequeoPromoMia` (por `_chequeoNoSubir`: raisePriceTo, raiseVariations, raisePrice, `volver`; y
  `submargen` antes de su PUT) no sube el precio de lista con un descuento mío vigente; sin leer `cyc/promoclaude` no sube.
- **Envío por lado de la barrera**: `unapub` (`bajar=`/`empatar`) mide con las ventas del lado del precio que mide, sin compras que
  cruzan por cantidad ni netos estimados y sin cuotas adentro; arriba sin ventas de arriba, netopub (si se midió arriba) o
  `CAND_ENVIO_ARRIBA`. `margenAlDia`, `calcCerebro` y `planilla` reusan el envío de netopub sólo si su precio era de arriba.
- **Sin dólar no se mide** en `activarPausadasFull` (no activa) ni en `unapub`.
- **Plata por día NETA (⚖️) en todas las comparaciones de precio**: `rayasPrecioLinea` (y por ella `techo95`), `raros`, `escmedir`,
  `lupa` y en la web `_rayas`/`_ven` (`_pdDed`, constantes `PD_TRABAJO_U`/`PD_TOPE_PCT`/`PD_CAPITAL_DIA` copiadas en index.html): −$100/u,
  −3% de lo facturado, −2%/mes del stock. Y los días con `est` distinto de `active` (pausada, en revisión) no cuentan en las rayas
  (robot y web; `_lineaJunta` anota `est`). La web usa una sola publicación también con 2+ activas al MISMO precio. Chequear: web y
  robot dan la misma raya (💰/🔴) para la misma publicación; después de este cambio hay que volver a correr `techo95` en la completa.
- **`techo95`**: la 🏔️/🪜 de lanzamiento no pasa a 📈 sin ventas (se mide con la vara de lanzamiento desde el último escalón); la 🏔️
  se anota después del último tag (`· hallado el dd/mm`) para que una 🪜 posterior no la tape; con 📦/📉/🧨/🔥 y sin 95% no anota 📈.
- **🛡️ de `planilla`**: propone el precio MÁS BAJO que deja 25% en el peor caso (por mitades, `precioJustoMeta`); hasta $5.500 el mayor
  entre ése y el que deja $1.000/u (dice cuál manda); 429 → "ML no contestó la comisión a $X"; en la barrera dice lo que deja por unidad
  a $32.990 y cruzando. Ojo: la regla de $1.000/u sólo se mira en lo que ya está en 🛡️.
- **🤔**: la excepción de lanzamiento pide una 🏔️ de techo95 posterior a la llegada; sin excepción para 🧪 ni "prueba de tachado".
  **🔎 / 🏷**: un 💸/🏷️ sin promo mía vigente y un 🧪 cuentan como sin estrategia.
- **`escasez`**: con pocos datos el ritmo normal manda sólo con estrategia de suba y ritmo normal firme (si no, `ritmo14`); lo sin
  reposición no se filtra por "menos de 2 ventas en 14 d". Las notas de FALLO de `decido` no cuentan como decisión (🚨 📦 🔎 🤔).
- **`armarFicha`**: el "antes" de cada cambio arranca después del cambio anterior (no mezcla otro precio), mínimo 5 días;
  `FICHA_VENCE_DIAS` = 30 (regla 🔓). **Línea de tiempo**: `linea:atras` (fase ventas) reescribe u/tot/neto/uR de los días del panel
  (corrige los días viejos con el neto repartido del carrito; relleno: `linea:atras:go:ventas`); `mg` del día se calcula de netopub.
- **netoweb / `envioDeducido`**: abajo de $33.000 sin ventas de abajo el envío es 0 (antes el de arriba).
- **% de reclamos**: `setDevLive` asigna también por nombre (como la web y `armarCostoWeb`); emoji del aviso de venta (`_nivelPct`) =
  `_pctNivel` de la web (piso/meta de `cyc/mlconfig`, un decimal).
- **Web (v25.60)**: `precioParaMargen` con cargo fijo (`simComParams`) y verificado con `simMargen` · `cajaBajarDe`/`rotCajaBajaHtml`/
  `rotMargenHtml` juzgan con el peor caso (`PEOR_RET_PCT` 2%, `_pctPiso`) · `maxCompraDe` resta el envío del lado de la barrera del
  precio de venta (`gestP`) · `ritmoNormalDe(pid,loc,vari)` lee la clave del color y `escasezDe` mira sólo las publicaciones del color ·
  `_cerMlas` filtra por `_lineaColorDe` y los encabezados dicen el color · `cambiosPrecioDe` dice "Claude" en lo de `por:'claude'` ·
  `normTxt` con trim. Chequear: el máximo de compra de algo que hoy está del otro lado de la barrera da 25% al precio decidido.

### `entrarpromo`: la relectura espera a que ML muestre el descuento (21/10/2026)
- **Qué es:** ML tarda segundos en mostrar un descuento recién puesto; la relectura inmediata no lo veía, el robot quería salir ("No offers found") y lo dejaba sin anotar en `cyc/promoclaude` (el guardián de la hora lo sacaba). Ahora relee hasta 4 veces (0/3/6/10 s). **Dónde vive:** sync.mjs, `entrarpromo`. **Qué chequear:** que un descuento nuevo salga "✓ ADENTRO" y quede en `cyc/promoclaude`.

### 💳 Cuotas en todo: gemela Premium para cada Clásica y que siga sola (21/10/2026, pedido suyo)
- **Qué es:** `precioGemelaIgual` (el Premium más bajo con la misma plata neta, probado precio por precio con `cuentaGemela`; antes `gemela` despejaba con el envío sumado siempre y en lo barato saltaba la barrera: Naipes $3.890 → $34.190) · `alinearGemelas` en la vuelta de cada hora (también con SOLO_DATOS) y `gemelaalinear[:go]` · `gemelacrea` ya no frena por el piso si la Premium deja lo mismo que la Clásica · `gemela:<mínimo>` muestra además las gemelas que ya existen con sus ventas y su caja. 148 gemelas nuevas creadas el 21/10.
- **Dónde vive:** sync.mjs (`precioGemelaIgual`, `alinearGemelas`, probes `gemela`, `gemelacrea`, `gemelaalinear`), memoria `cyc/gemelasigue/<MLA>` {c, p, ts}.
- **21/10 · `gemelacrea:anotar:<Premium>=<Clásica>[,…][:go]`:** 7 Premium dadas de alta el 21/10 sin `gemelaDe` (Leyton, Lupa 90, Mazo Rojo, Termómetro, Espejo 4", P47 azul, Codera) no las seguía `alinearGemelas` y la de Leyton quedaba más barata que su Clásica. El comando anota la gemela sólo si ML dice misma cuenta, mismo `user_product_id` y Premium/Clásica, y relee. Qué chequear: que `ver:gemelas` no deje Premium activas con Full sin `gemelaDe` (las que aparecen "sin ficha" en el informe y son gold_pro).
- **Qué chequear:** que ninguna Premium quede más barata que lo que le toca (gemelaalinear sin go da "N bien"); que `/items` da el precio de LISTA aunque la Clásica tenga un descuento mío (la Premium queda alineada a la lista: más cara, el lado seguro); que las ventas Premium sean ventas de más y no las mismas de la Clásica (medir el 04/11 con `gemela:1`).
- **F2 en descuentos (mismo día, revisor en contra):** con `promo`, el escalón se mide contra lo que veía el comprador (`cyc/promoclaude` o la salida de `cyc/promohist` de menos de 72 h), no contra la lista. Chequear: una escalera de descuentos pasa de −15% de la lista en escalones de 15%.

### 📦 Gemela Clásica con envío gratis (22/10/2026, pedido suyo)
- **Qué es:** él: *"otra opción de venta como hicimos con las premium pero ahora clásica con envíos gratis. siempre manteniendo ganancia"*, *"sólo (…) publicaciones que hoy están por debajo de 33.000"* y *"tenés que medir bien los precios ya que varían muchísimo"*. A cada Clásica abajo de $33.000 con stock en Full se le agrega en el MISMO producto de ML (user_product_id, stock compartido) otra condición de venta Clásica con `shipping.free_shipping=true`, al precio más bajo que deja la MISMA plata neta que la Clásica de hoy. El envío gratis que paga el vendedor se le pregunta a ML A CADA precio candidato (`/users/<id>/shipping_options/free` con precio, tipo, logística y medidas del paquete); arriba de $33.000 es el envío de Full de arriba de la barrera (`envioGemelaDe`).
- **Medido el 22/10 (138 Clásicas):** abajo de $33.000 ML le cobra al vendedor la tarifa ENTERA del envío gratis, **$8.113-$11.606 fijo, no depende del precio** (sin el descuento de Full de arriba de la barrera). Por eso lo barato tiene que subir muchísimo para dejar lo mismo (Naipes $3.890 → $18.590, +378%) y casi todo lo de $18.000-$30.000 cae justo arriba de la barrera ($33.090), donde el envío de Full es más barato que el gratis de abajo. Suba 20% a 479%; 82 dejan 25%+ en el peor caso.
- **Dónde vive:** sync.mjs: `dimsDeItem`, `envioGratisEn`, `cuentaGemelaEnvio`, `precioGemelaEnvioIgual`, `alinearGemelasEnvio` (vuelta de cada hora, al lado de `alinearGemelas`; misma memoria `cyc/gemelasigue`, mismo interruptor `gemelaSigue`). Probes `gemelaenvio[:<MLA>,…][:max=N]` (solo lee: tabla con lo que paga hoy el comprador por el envío), `gemelaenvio:ver:<MLA>,…`, `gemelaenvio:anotar:<gemela>=<Clásica>[:go]`, `gemelaenviocrea:<MLA>=<precio>[;…][:go]`, `gemelaenvioalinear[:go]`. Marca en `cyc/mllinks/<MLA>`: `gemelaDe` + `gemelaTipo:'envio'` (las Premium no tienen gemelaTipo).
- **Para no confundirlas con las Premium:** `alinearGemelas` saltea `gemelaTipo:'envio'`; `gemela:todas` no le hace Premium a una gemela de envío; `gemelacrea:ver:gemelas` y la lista de gemelas que ya existen sólo muestran las Premium.
- **La primera, a mano (él):** Paulvic Witch Night de Adriana `MLA4111482640` ($33.000, `mandatory_free_shipping`), gemela de `MLA1550577582` ($21.990). Anotada; misma neta pide $33.090 y queda dentro del 1% (neta ~$9.500 contra $6.713 de la Clásica, peor caso ~56%).
- **Cómo lo deja ML (medido el 22/10):** el alta va por `POST /user-products/<upid>/items` con `listing_type_id:'gold_special'` y `shipping:{free_shipping:true}` NADA MÁS (con `local_pick_up` da 400 "invalid fields"; con `logistic_type`/`mode` da "logistic_type not_modifiable"). Sale pausada sin stock unos minutos y después queda activa por Full con el stock compartido. Abajo de $33.000 ML SÍ deja una Clásica con envío gratis al lado de la Clásica sin envío (probado con el Mazo Azul `MLA4114264954` a $23.190, gemela de `MLA1812799239` $8.490).
- **Creadas el 22/10: 76** (la de prueba + 72 + 3 que en la primera pasada quedaron a $6-13 de la misma neta porque el envío de arriba de la barrera pasó de $8.113 a $8.154 y se crearon $100 más arriba) + la Witch Night anotada = 77 seguidas por `alinearGemelasEnvio` ("75 bien" en la primera vuelta). Una (Espejo 5" `MLA2225759075`) ML la creó SIN envío gratis: se arregló con `gemelaenvio:prender:<MLA>:go` (PUT `shipping.free_shipping=true`, releído; si ML no deja, la pausa con `noAutoActivar`), y `alinearGemelasEnvio` ahora avisa si alguna no tiene el envío gratis. No se crearon: 56 con el peor caso abajo del 25% (lo barato: el envío gratis entero se come el precio) y 1 sin costo de envío de ML (Pizarrón LCD `MLA1894941062`); 4 se saltearon porque otra Clásica del MISMO producto ya recibió su gemela en la misma corrida (Mazo azul 2ª, Batidor, y 2 más).
- **Qué chequear:** que `gemelaenvioalinear` dé "N bien"; que ninguna gemela de envío pierda el `free_shipping` al bajarle el precio abajo de $33.000 (el log lo avisa); que las ventas de la gemela sean ventas de más (que el comprador la elija: comparar contra precio + lo que paga de envío, columna de `gemelaenvio`).

### Chequeo · "para bajar y que roten": las publicaciones nuevas cuentan desde su alta (auditoría 21/10/2026)
`bajarParaMover` tomaba la última venta del PRODUCTO cuando la publicación no tenía ventas propias, así que la gemela Premium
de Velvet Petals (creada el 20/10) salía con "27 días sin vender" y propuesta para bajar. Ahora sin ventas propias cuenta desde
`mllinks.altaTs` si es más nuevo. Y el comando sugerido pasó de `volver:` (que ya no baja) a `entrarpromo:…@PRICE_DISCOUNT`
(toda baja va primero como descuento). Qué chequear: una publicación de menos de 10 días nunca aparece en esa lista.

### `decido` sube aunque no haya stock en Full (09/10/2026)
Cool Water Woman (`MLA2070716651`): se agotó en un día las dos veces a $92.499 (19%) y `decido` se negaba a subirla
"sin stock en Full", así que la tanda nueva se iba a vender otra vez barata. Ahora en `calcCerebro`, si Claude
decidió una SUBA, se aplica aunque no haya stock (también pausada por falta de stock). Bajar sin stock sigue frenado. Y en `aplicarCerebro` una suba de Claude ya no se frena porque la caja no está
`winning` (pausada da `not_listed`): sólo se anota en el log.
Qué chequear: que no se cuele una baja; que la suba en pausada se relea de ML.
Y la regla de la revisión, suya: *"quiero que cada run evalues publicacion por publicacion"* — incluidas las
pausadas sin stock que se agotan rápido (lo que se vende en 1-2 días al llegar está barato).

### `aclasica`: Premium → Clásica (09/10/2026, decisión suya)
*"poner cuotas casi siempre es malo, ya que aumentamos mucho el monotributo por la misma venta"*. `aclasica:<MLA>,…[:go]`
(ml-sync) hace POST /items/<MLA>/listing_type {gold_special} y relee. Qué chequear: que ML acepte el cambio y que el
margen del panel lo refleje en la noche siguiente.

### `planilla`: TODAS las publicaciones en cada revisión (09/10/2026)
Él: *"tres veces te pedí que mires TODOS los productos en las runs"*. Las runs leían `informe` (sólo lo que se movió).
`planilla[:cuenta]` (solo lee, ml-consulta) lista cada publicación con ficha, activa o pausada: precio leído de ML,
margen y ganancia/u a ese precio (comisión preguntada a ML), stock en Full, ventas 7/30/60 d, cuánto duró la última
tanda (`stockhist` desde/desdePrev → cero), caja y último cambio. Es OBLIGATORIA en las revisiones de 08:52 y 20:52.
Qué chequear: que el total de renglones cierre con las publicaciones vivas con ficha; que "sin leer" se diga.

### `planilla`: el peor caso de TODAS, con o sin stock (12/10/2026, regla suya, eligió la a)
Él: *"una vez que el producto estuvo una vez en full siempre se activan solo (…) todo producto que existe tiene que estar arriba
del 25% (salvo excepciones que haya hecho el cerebro)"*. ML reactiva sola una pausada sin stock apenas le entra la caja.
`planilla` calcula además el margen en el PEOR CASO (`PEOR_RET_PCT` 2% de retención de otra provincia + el envío más caro
visto en sus ventas, o el de referencia si nunca vendió + cuotas Premium) y lista 🛡️ las que quedan abajo del 25%, activas o pausadas. Excepciones mías aparte:
liquidando, `cyc/claudepiso/<MLA>` (lo escribe `decido` con `!piso`, con el precio exacto; otro precio sin `!piso` lo borra)
y `cyc/promoclaude`. También nombra las que no tienen margen medible. Se corre en TODAS las vueltas (no sólo 08:52/20:52) y lo
🛡️ se sube en esa misma vuelta. Lo nuevo (nunca estuvo en Full) no se activa solo: lo activo yo con el precio ya puesto.
Qué chequear: que la cuenta del peor caso use la misma comisión que la normal, y que una excepción vieja no tape un precio nuevo.

- **12/10/2026 · `planilla` dice el precio que hace falta** en cada 🛡️: se despeja y se VERIFICA con la comisión de ML al precio nuevo, termina en 90/990, avisa si pasa +25% (da el escalón) o cruza $33.000 (y cuánto queda a $32.990). Con variantes: a mano. Chequear: el precio propuesto da ≥25% en el peor caso.
- **12/10/2026 · `ventasraras` marca las ventas en promo** (🏷️, de `cyc/promoventa`): cada renglón dice descuento, cuánto puso ML y nosotros, y abajo el total. Pedido suyo: que avise cuando se vende algo en promo. Chequear: sin registro no inventa nada.

### Sin piso del 22%: objetivo 25% (09/10/2026, regla suya)
- **Qué es:** `cyc/mlconfig` minPct = targetPct = 25 (`meta:25:25`). Colores: abajo de 25 rojo, desde 25 verde. Bajar de 25% sólo con motivo y `!piso`; nunca abajo de 0%.
- **Qué chequear:** que nadie vuelva a usar 22 como freno, que los comandos que hablan de "piso" lean 25, y que una baja abajo de 25 tenga su motivo en el 🧠.

### Escasez: estirar el stock hasta la caja (08/10/2026, regla suya)
- **Qué es:** decisión de Claude en cada vuelta, no del robot. Sin caja despachada: subir de a escalones (≤+25%), techo ~×2 del precio normal, mirar en cada vuelta. Con caja despachada: que la última salga cerca del día 8. Nunca abajo del precio normal.
- **Dónde vive:** las vueltas de Claude (`trig_01475PwdPVJ1qTnYswcDxRq8`, `trig_01FCaQqzU5MA422N6Z8nH63Z`); datos con `cerebro:todas` (sólo lee, sección escasez) y `porquebajo`; precio con `decido`.
- **Qué chequear:** que ninguna pase ×2 del normal, que ML no la pause, que al llegar la caja se revise (no quede cara sin vender), y que una caja despachada se note (`cyc/envios_full`).

### Escasez: arrancar muy alto y bajar en escalera (16/10/2026, regla suya, eligió 1a 2b 3a)
- **Qué es:** reemplaza el "techo ~×2" de arriba. Primer salto por ritmo (3+/día ×4 · 1-3 ×3 · <1 ×2 · <0,5 ×1,5 fijo), escalera
  para abajo si no vende (25%/12 h · 20%/24 h · 15%/2-3 d), sube un escalón si vende de más, nunca abajo del normal. Va para todo
  lo que está en escasez y tiene sentido, salvo techo conocido (falló una suba), liquidando, mis promos. La caja de compra no frena (corrección suya del 16/10).
- **Dónde vive:** `ml-sync/CEREBRO.md` (🪜), las vueltas de Claude, `decido`, `escmedir`, `notas/techo.md`.
- **Qué chequear:** que ninguna quede pausada por ML (si pasa, volver al último precio aceptado y anotarlo) · que la escalera
  baje de verdad cuando no vende · que al llegar la caja o pasar a sobrar se salga (promo primero) · que no se use ×3/×4 en lo
  que ya sabemos que no funciona más arriba.

### Escasez y semáforo de Pedidos: lo que tarda reponer, producto por producto (15/10/2026, v23.69, regla suya)
Él: *"no son las mismas condiciones el que no tiene stock en Nissei o el precio no da, al que ya está pedido, otro que está en
camino hace 3 días o el que tengo en la oficina"*. **Qué es:** `reponerDe(p)` (index.html) da los días hasta que vuelva a haber
COMPRANDO: pedido de Paraguay/Paulvic en camino → lo que le falta + 10 (armar 2 + caja 8) · Paraguay y el precio da → 17 + lo que
falte del pedido que viaja · precio no da / Nissei no lo tiene / "no traer más" → SIN FECHA (cuenta 60) · Bs As/Paulvic → 14.
Es el corte del naranja (`pedDiasRojoDe`) y se ve abajo del tanque (⏱️ reponer). La web lo escribe en `cyc/reponer/<prodId>`
(sólo lo que cambió) y `escasez` lo lee (respaldo 📅 si falta o tiene +3 días). En `escasez` cada fila dice cuándo vuelve a
haber en Full (caja despachada → lo que le falta · oficina → 10 d · si no, comprar) y marca 🔥 ESCASEZ si Full se corta antes,
o 🔥 ESCASEZ DE COMPRA si todo junto (Full + camino + oficina) se corta antes de que llegue una compra.
**Qué chequear:** que `cyc/reponer` se actualice (lo escribe syncPedidosAuto, o sea alguien abre la web) · que lo "sin fecha"
no deje naranja algo con meses de stock (tope 60) · que el pedido en camino se saque al marcar "Llegó".

### Agregados el 09/10/2026 (cambios del 08/10 que no se habían anotado)
- **`escasez` (a3dce89):** el ritmo sale de ventas y días de la MISMA ventana, y avisa cajas viejas sin marcar. Chequear: que un producto con stock vuelto hace pocos días no dé un ritmo inflado.
- **`analizapromo` (2428f51, cddbe1d):** sección de las promos donde ML pone plata (con el crudo) y lo que te queda en una compartida = lista menos tu parte. Chequear: que "ML pone" salga del dato de la promo y no se suponga.
- **Activar pausadas (5839aec):** `paused_by_seller` es nuestra, no de ML. Con SOLO_DATOS el robot ya no activa: lo hace Claude con `decido:…!activar`. Chequear: que no quede ninguna con stock en Full pausada sin motivo.
- **Arreglos de la etapa 1 del 08/10 (52b4710, 774d1b4, 9e2ec84, 04f8917, ead3675):** son los de v22.63, anotados arriba.
- **Activar pausadas, envío del lado de la barrera (10/10/2026):** abajo de $33.000 ya no se mide el envío con ventas de ARRIBA (los Redmi Buds 6 Play a $32.999 daban −5% por una venta de $101.859 del Buds 6 común). Sin ventas del mismo lado, abajo = $0. Chequear: que una publicación barata sin ventas propias no herede el envío de una cara de la misma ficha.

- **Notas del 🧠 de variantes reescritas (13/10/2026), pedido suyo.** Las 117 que decían "se mira solo, no con el resto del producto" (lote del 12/10) se rehicieron con la planilla del día (`ml-sync/notas/variantes_1310.txt`): precio, último cambio con motivo (sacado de los `decido` guardados), ventas y "HOY NO LO TOCO PORQUE…". Comando nuevo `vernotas[:texto]` (solo lee) para ver las notas como están. Chequear: ninguna nota con "se mira solo" (`vernotas:se mira solo` da 0) y que ninguna pase los 600 caracteres.

- **`!bajocero` (18/10/2026).** Excepción al "nunca abajo de 0%" en `calcCerebro` (forzar) y `entrarpromo`, sólo si él pide rematar
  a cualquier precio (Tira Led). Qué chequear: que ninguna regla automática ni comando lo ponga solo.

- **Plata por día neta (18/10/2026).** `armarFicha` resta `PD_TRABAJO_U` ($100/u, sólo tiempo: caja y reclamos ya están en el costo) y `PD_TOPE_PCT` (3% de lo facturado) en tramos y
  juicios de cambios. Qué chequear: que los "rindió/no rindió" de la ficha sigan teniendo sentido con el descuento.
  Y `PD_CAPITAL_DIA` (2%/mes ÷ 30 × stock del día × costo): la plata parada también se resta. Qué chequear: que `st` de la
  línea de tiempo sea el stock de ESA publicación (si suma colores, el capital sale de más).

 · **Escasez con el ritmo rápido (18/10/2026, eligió la a).** En `escasez` (sync.mjs, junto a `ritmo14`): si en 7 días con stock vendió 2+ u. y el doble o más del ritmo de 30 d, manda ese ritmo (⚡ en el renglón). Chequear: que no dispare con 1 sola venta.

 · **🚨 Escasez que vendió después de mi última decisión (19/10/2026, con el Cabotine Turquoise).** Al final de `escasez`: toda publicación en escasez con stock cuya última venta es posterior a mi último cambio de precio (`cyc/claudecambios`) o nota (`mlapi/fichanotas`) sale en la lista 🚨 y se decide en esa vuelta. Chequear: que una nota con motivo la saque de la lista.

### 🆕 Lanzamiento con tachado real y 🧪 prueba del tachado (20/10/2026, v25.16)
Qué es: escalera de lanzamiento (arranca ~20% arriba, 7 días de lista real, después escalones como descuento) y la prueba de 2 semanas
tachado contra liso (10 publicaciones, tag nuevo `prueba` 🧪). Dónde vive: `ESTRATEGIAS`/`tagDeMotivo` (sync.mjs) y `ESTRATEGIA_UI`
(index.html) · `entrarpromo` acepta `#tag` después del id (`=3690@PRICE_DISCOUNT#prueba`) · la lista 🤔 de `planilla` no marca
"no sobra" ni "recién llegado" si el motivo de la promo dice lanzamiento/prueba de tachado o la estrategia es 🧪. `techo95` mide también las 🆕 (conversión de referencia: mediana de nuestras de precio parecido, λ ≥ 3 sin venta = 95%) y
sólo anota 🏔️ cuando llega. Qué chequear: que un lanzamiento con 1 venta no se marque techo · que la conversión de referencia
tenga 8+ publicaciones · que
las 10 de la prueba no se toquen hasta el 04/11 · que el 27/10 se haga el primer escalón de los 5 lanzamientos · que un descuento
abajo del 25% peor caso igual salga en 🤔.

### Línea de tiempo: flechas de precio con `cyc/claudecambios` (20/10/2026, v25.19)
Qué es: las ▲▼ del precio salían sólo de `cyc/supervisor/eventos` (foto de la noche); ahora `lineaAbrir` suma cada decisión de
`cyc/claudecambios` y saca el evento de la foto que es el mismo cambio (misma publicación, mismo precio final, menos de 2 días).
Qué chequear: que un cambio no salga dos veces (foto + decisión) y que un `decido` de hoy tenga flecha.

### Comandos de sólo lectura del 20/10/2026 que no se habían anotado (agregados el mismo día)
- `verpromo:<MLA>` (ml-consulta): las promos de una publicación según ML, lo anotado en `cyc/promoclaude` y las últimas notas de su ficha. **Chequear:** no imprime datos de compradores.
- `bajacuotas` (ml-consulta): si ML cambió precios con la baja de cuotas del 20/10; compara las 💳 gemelas contra el precio decidido y muestra la historia de precio y estrategia de lo que cambió. **Chequear:** sólo lee.
- `pruebatachado` (ml-consulta): las publicaciones en 🧪 prueba con su precio de antes (sirvió para cancelar la prueba 3b). **Chequear:** sólo lee.
- v25.31/v25.32 (Ventas): la Clásica se ve en gris como siempre y la Premium en dorado (`tipoPub`, ver etapa 5). **Chequear:** en los dos temas se distinguen.

### 22/10/2026 · 💹 La estrategia "ganar más por cada peso facturado" (v26.06, eligió 1a 2a 4a 5a 6a 7a 8b)
- **Qué:** vara de compra 35% para lo NUEVO (`CAND_VARA_COMPRA` en index.html = sync.mjs; `candPisoDe` de la web la devuelve,
  `_listaMed25`, comando `pedir`, `revisarcompra`, `faltaventas`, `cuentaLista`). El descarte del robot (`candPisoDe` de sync.mjs)
  sigue en 25%: lo de 25-34% queda guardado (Listas: carpeta 💾 Guardados). Reponer sigue en 25%. · Tarjeta 🧮 Mezcla en Métricas
  (`metMezclaMeses`/`renderMetMezcla`, 6 meses, tramos por el % de cada venta, ganancia cada $100 facturados). · `repartopy` y
  `paramcompra` eligen la cuenta con más lugar contra el tope de H (`lugarHPorCuenta`, `TOPE_H_ANUAL`). · Watch S5 y Redmi Pad 2:
  `decido:ped` u 0. · Reglas 2a y 6a en CEREBRO §14 y §15.
- **Chequear:** que ningún camino de COMPRA use todavía 25 (grep `>= 25`/`candPisoDe(` en lo que pide o llena) · que el descarte siga
  en 25 (si sube a 35, lo de 25-34% se iría a "nunca más") · que la mezcla cierre contra los KPIs (mismo % que el renglón de Ventas) ·
  que `lugarHPorCuenta` mire la misma ventana que `topeh` y la tarjeta ⚖️.

### 22/10/2026 · 📈 La línea de tiempo y las ventas por gemela (v26.07, etapa 8)
- Él: *"al vender en cuota y envío gratis aumenta el precio pero el neto y la ganancia es el mismo"*. Los días con ventas la línea
  dibuja lo COBRADO por unidad, y la gemela (Premium o con envío gratis) se cobra más cara para dejar la misma plata. Ahora, para el
  PRECIO, cada venta de una gemela vale el precio de su Clásica ese día (`lineaPintar` tE/qE; `_lineaJunta` `totEq`/`uEq` para las rayas;
  robot `juntarLineaStock` `uOwn`/`totOwn` en `rayasPrecioLinea` y en los tramos de la ficha). Lo cobrado (`tot`) y la ganancia no cambian.
- **Chequear:** todo lugar que saque un "precio cobrado" de `tot/u` de una línea junta (grep `tot) / Number`), y que el 3% de tope de H
  siga usando lo cobrado de verdad (la gemela sí gasta más tope).

### 22/10/2026 · 🎉 "primera venta" de una gemela (v26.06, etapa 5)
- Él con las Cartas Casino: el cartel decía "primera venta de esta publicación · tardó 30 días con stock en Full" en la gemela Premium
  creada el 20-21/10. El stock de Full es del producto (lo comparten todas sus publicaciones): `_vhDiasStock` cuenta desde `altaTs` si la
  publicación se creó después de que entró el stock, y el cartel dice "primera venta de la gemela Premium/con envío gratis".
- **Chequear:** otros carteles que cuenten días por `stockhist` de una publicación nueva (mismo patrón).

### 24/10/2026 · Revisión etapa 1 (Precios), 4 revisores en máximo · v26.41 `cyc-v922`
- **Qué se arregló (robot, sync.mjs):** `tagDeMotivo` ("4 meses" ya no es sinrepo) · F10 juzga con la fecha de la marca 🔒 y el detector se
  la pasa · `frenosBajas`/`decido` frenan si no leyeron nobajar/promohist/promoclaude/techofreno · freno 4a con días CON stock (mín. 14,
  `TECHO_RITMO_MIN_DIAS_ST`) y frena si no leyó ventas · `submargen` pasa por `_chequeoNoSubir` · `gemelaenviocrea` con techo, tope de
  crear y 25% · `alpiso`/`bajar`/`tocados` sin `:go` (bajar va por `decido`) · `anotarCambioFuera`: unapub bajar=/empatar, volver, submargen,
  fijar y bajopiso anotan en `cyc/claudecambios` · `autNoVale` mira el tipo (descuento ≠ lista) · el "hubiera" de F10 sólo en corridas reales ·
  la 🏔️ conserva su fecha al salir de un descuento · gemelas: comisión ≤0 o envío <$3.000 (`ENVIO_GRATIS_MIN`) = ML no contestó, baja >15% de
  una va a revisar, 🔒 no baja si la Clásica no bajó, tolerancia sólo para arriba, sin envío gratis no se re-precia · `publicar` sin doble
  retención y con la barrera ($33.000, salvo `|!cruza|motivo=EXCEPCIÓN`) · `activarPausadasFull` mide la gemela de envío con su envío gratis ·
  `gemelacrea`/`gemelaenviocrea` frenan si no leyeron hermanas y pausan si no releen la Clásica · F4/F8 con el precio que ve el comprador
  (`p0v`) y F4 neta · `planilla` 🤔 al precio del descuento, 🔎 y `bajasviejas` con la línea junta, 📦/🔎/🤔 con ritmo con stock, 🛡️ cuenta
  las sin margen · `pruebasTechoEnCurso` y `efectotecho` con días con stock, línea junta y neto · `escasez` avisa si no leyó ritmonormal ·
  `revfondo` sin notas de fallo y lista colores sin publicación · `pedidostodo` `ultV` saltea ventas de gemela · `candMaxUBot` = web ·
  textos de `pedir`/`revisarcompra` con la vara real.
- **Web (index.html):** `_llMaxNuevo` con la vara de compra (35/30) para lo nuevo · `margenMLDe` `sinCosto` ("sin costo" en Rotación y la caja,
  no ~800%) · `precioParaMargen` y el chip "bajo 25%" en el peor caso · `pycatPrecio35` redondea para arriba y sin pasar $550.000 ·
  `candPuedePedir` frena 🌟 con precio visto de +30 d · `pycatFila` verde desde la vara · venta por gemela no hereda 💸 de la Clásica ·
  comparación de Ventas x Producto sin canceladas · `listaSetU` dice el motivo real · rayas: toda la línea hasta ayer (`ksR`, `_gdFuera`) y
  `uOwn/totOwn` como el robot. `decide_pedidos.py` `Tde` con el % de la app.
- **No se tocó a propósito:** las gemelas siguen alineándose aunque `robot:off` (son mecánicas, se apagan con `gemelaSigue=off`) ·
  ⏸️ sin stock en la web (chico, queda) · decisiones suyas 36-46 en `notas/para_mati.md`.
- **Qué chequear:** `errores` y `planilla` corren limpios la primera vuelta · que una baja hecha antes de marcar 🔒 no se deshaga · que la
  primera alineación no deje ninguna gemela en "ML no contestó" por error (si son muchas, el mínimo de $3.000 está mal) · `publicar` sin go
  en la próxima llegada.

## 2 · PLATA (martes)
- **24/10/2026 · `almactarifa` con centavos** (pregunta 23 suya: *"¿no aparece en la factura?"*). ML no da la tarifa por unidad; se midió con la factura de septiembre (`cargosmes:2026_09`): almacenamiento común $47.735 ÷ ~2.640 u. en Full ÷ 30 d ≈ $0,60 por unidad por día. `pesosArg` redondeaba a $1 (quedó guardado $1 en la primera corrida): ahora `almactarifa` lee decimales. Qué chequear: `almactarifa` muestra $0,60; rehacerlo con la factura de octubre.
- **24/10/2026 · v26.24 · lista pagada al pedir = mercadería en camino** (eligió la 12a). `listaEnCaminoUSD` (pedidos de `compraslista` en camino con `pagado:true`, valuados a `pc`) se suma a `stockCamino` del Arqueo junto a Paraguay y sale en el detalle de "en camino". Botón 💵 Ya lo pagué también mientras viaja (`listaPagado` acepta camino). `listaLlego` (web y robot) ya no pisa un `pagado:true`, así no queda en los dos lados. Qué chequear: que un pedido pagado al pedir aparezca en camino y al llegar NO salga como deuda; que uno sin pagar siga saliendo como deuda al llegar.
- **Cada lugar, su nota (08/10/2026, v22.71):** él: *"en ventas por qué aumentó el precio o por qué no, y en pedidos por qué
  pide x unidades"*. `cerebroAbrir`: con `ped` o `ctx:'caja'` muestra SÓLO las notas `ped__`/`caja__`; con `ctx:'venta'`
  (Ventas x Producto) y en Productos/Rotación, las notas de precio (`claudeexp/<MLA>`). **Chequear:** el mismo producto
  dice cosas distintas en Ventas y en Pedidos; ninguna nota de precio se cuela en Pedidos.
- **Sin nota, sin botón (08/10/2026, v22.72):** él: *"si no hay nada que no aparezca"*. Con `autoPrecios: off`,
  `cerebroBtn` se dibuja sólo si `_cerHayNota` encuentra una nota de ese lugar en `mlapi/claudeexp` (escuchado en vivo
  con `_cerNotas`; si no se puede leer, no hay botón). **Chequear:** misma clave que lee `cerebroAbrir` en los tres casos.
- **Fechas y eventos de ML (08/10/2026):** sección 14 del `informe` (calendario de `fechasEspeciales` a 60 días + eventos
  leídos de `/seller-promotions/users/<id>`, sólo nombre/tipo/fechas, sin tocar ninguno, regla 8) y comando `fechas`
  (solo lee): por cada fecha pasada, unidades por día y precio promedio de lo regalable contra el resto, contra las 4
  semanas previas. **Chequear:** que el ×1,4 del cerebro coincida con lo medido; que un evento leído de ML no se acepte.
  Primera corrida (08/10): `RE_REGALO` contaba los termómetros como regalo (`termo` sin borde de palabra) y `mate`
  agarraba "automático": corregido con `\btermos?\b` y `\bmate\b`. Las ventas guardadas arrancan el 01/05/2026: sólo
  se pueden medir Padre, Amigo y Niño 2026, y ningún evento de ofertas de ML todavía.
  Los eventos de ML viven en `listarEventosML` (sección 14b y comando `eventos[:días]`, solo lee): él avisó del evento
  del 10/10 que el calendario fijo no tenía.

- **% del mes pasado en Métricas** (`renderMetPctAvg`): el chip del período anterior usa el promedio
  del mes ENTERO, y "a esta altura" va en chico.
- **Costo real por mes** (probe `costomes`): costo congelado del mes o el de hoy, dólar del mes.

- **🧠 qué pasó (08/10/2026, v22.67):** `vpAnalisisSimple(keys,prevKeys,o)` en Ventas (`vpCerebroAbrir`, período
  y cuenta elegidos) y en Inicio (`homeHoyCerebro`). Mismas cuentas que los KPIs (`efectivoCostoVP`, `gestDivVP`,
  `pctGananciaVP`, `ventaEnRemate`). Chequear: que la ganancia y el % de la primera frase sean los mismos de los
  KPIs de arriba · que con el día en curso no diga "se vendió peor" contra un día entero.

- **Ventas en promo o con cupón (11/10/2026, v23.13).** Qué es: cada venta dice si tuvo descuento, cuánto puso ML y
  cuánto nosotros; el bloque por cuenta de Ventas suma lo del período. Dónde: robot `anotarPromoVenta` (ciclo, una vez por
  orden) → `cyc/promoventa/<día>/<orden>` = `{t, s, ml, tipo, mla:{<MLA>:{t,s}}}` o 0; relleno `promoventas:<días>:go` por
  `promoventas:<días>:<cuántas>:<palabra>` (14/10) mira sólo las ventas de ese título, para explicar una tarjeta puntual.
  ml-sync (sin `go` muestra la estructura, solo lee). Web `vpPromoDe`/`vpPromoLabel`/`vpPromoTotalHTML`. Qué chequear:
  `/orders/<id>/discounts` da 404 = sin descuento (se guarda 0); un 429 no se guarda (se reintenta); que lo de ML no se
  descuente del neto (el cupón de ML no baja lo depositado); que la suma por compra no cuente dos veces una orden.

### Gastos del mes, todos al día 1 en Métricas (15/10/2026, v23.49, pedido suyo)
- `_cargosDiaDet` pone retiro y TODOS los gastos en el primer día del mes con ventas (antes cada gasto iba a su día de pago). La fecha
  real del gasto no se toca. Qué chequear: que la suma del mes siga dando igual que el Resumen.

### Tope de H: el ritmo son los 30 días enteros hasta ayer (12/10/2026, v23.14)
Qué: `parejoDatos` (index.html) proyecta el cierre con las ventas de los 30 días ENTEROS hasta ayer. Antes contaba hoy recién empezado ÷ 30: a la madrugada la proyección caía sola y Matías pasaba de rojo a amarillo sin que nada cambiara. Chequear: que el número no salte a la medianoche y que la barra de ventas siga incluyendo canceladas.

### El retiro de los socios también se carga desde Gastos (12/10/2026, v23.15)
Pedido suyo: *"poner una opción en gastos lo que retiramos nosotros al mes"*. Arriba de la lista de
Gastos (vista por mes) va la casilla del retiro (`renderComprasRetiro` / `saveRetiroGastos`). **Es la
MISMA casilla del Arqueo** (`cyc/retiro_mes/<AAAA_MM>`, vía `saveRetiroMesYM`), no un gasto: si se
guardara como gasto, Resumen y Puntaje lo restarían dos veces. Vacío = sin cargar (usa el supuesto).
**Qué chequear:** que no aparezca ningún gasto con categoría o descripción "retiro de socios"
(sería doble), y que el número de Gastos y el del Arqueo sean el mismo para cada mes.

## 3 · MERCADERÍA (miércoles)

### 🧾 `pyped:nuevos:<resto|perf|elegancia>` (26/10/2026, él pagó sólo el pedido de Resto)
- **Qué es:** "Ya lo pedí" de los productos nuevos de UN solo pedido del momento (Nissei resto `py…`, perfumería `pyb…`, Elegancia `pyel…`); antes marcaba los tres juntos.
- **Qué chequear:** que los otros dos sigan en el armado con sus unidades · que lo de uso personal pase al historial sólo del que se pidió.

### 🏷️ Pasar a "con etiqueta" sólo con su palabra (26/10/2026, él: "que nunca se pueda pasar a con etiqueta sin que yo te diga")
- **Qué es:** `sinetiq` que BAJA (=0, -N, un número menor) y `ofi:…!ok` piden `dijo=<lo que dijo él>` en el mismo comando; sin eso: "NO ESCRIBO NADA".
- **Qué chequear:** que subir siga andando sin `dijo=` · que el ✅ Etiquetadas de la web (lo aprieta él) no cambie.

### 🏷️ Los "llegó" del robot también dejan sin etiqueta (26/10/2026, él: "¿los agregaste a mi oficina? así voy viendo las etiquetas")
- **Qué es:** `sinEtiqSumarBot` suma a `cyc/sinetiq` lo que `ofiSumarBot` sube a la oficina (`pyped:llego` y las listas) y lo que suma `pvped:llego` (Paulvic). Antes sólo lo hacían la web y `ofi:`: el pedido de Paraguay del 19/10 entró con 12 u. y 0 sin etiqueta (cargadas a mano con `sinetiq`).
- **Qué chequear:** que un "llegó" del robot muestre "🏷️ sin etiqueta a → b" en cada renglón · que la tarjeta de Contar lo que hay las liste · que deshacer una caja (devolución) NO las sume.

### 🧾 % de hoy en cada renglón del pedido de Paraguay (26/10/2026, v26.75, él con el GoPro Handler)
- **Qué es:** en `_pyItsHTML`, al lado de "margen medido al pedirlo" (web + recargo estimado), "hoy, peor caso con todo pagado N% a $precio" = `margenMLDe` menos la retención de otra provincia (`PEOR_RET_PCT`) de la ficha (costo pagado × recargo real) con el `netopub` de su publicación; sin medición todavía dice "se mide esta noche".
- **Qué chequear:** que el % de hoy de un renglón que salió más caro (Handler US$ 18 → 28,50) sea menor que el de al pedirlo · que tome la publicación activa si hay varias.

### ⏸️ Pausar / reanudar un envío a Full (26/10/2026, v26.74, pedido suyo)
- **Qué es:** botón en la cabecera del envío (Mi oficina → En camino). `cyc/envios_full/<id>/pausado` = cuándo se pausó: `envSalidaTs` (web y robot) devuelve 30 días adelante, la caja dice "⏸️ en pausa · no sale" y el robot no la lista como atrasada. Reanudar pone `fecha` = hoy y `ts` = ahora (y la fecha propia de las cajas sin recibir), guarda la original en `fechaArmada`.
- **Qué chequear:** que una caja en pausa siga contando como stock (no se compra de nuevo) pero NO como "llega a tiempo" en la escasez · que al reanudar diga "sale … a las 12" · que el robot no la marque llegada sola.

### 🧾 `pyticketvisto` (26/10/2026, v26.73, pedido suyo: "siempre subí vos eso")
- **Qué es:** la foto del ticket que me pasa por el chat no puede llegar a la base sin pasar por el repo o el registro (públicos). `pyticketvisto:<id>=<n>|<nota>;go` (ml-consulta) anota en `cyc/compraspy/<id>` `ticketFoto` y `ticketFotoChat` (quién, cuándo, cuántas); la web dice "✓ la vio Claude en el chat". Pide los renglones (`det=`) ya cargados.
- **Qué chequear:** que no se use sin haber comparado la foto renglón por renglón · que `pyped:llego` lo acepte · que la web no muestre "ver" sin imágenes.

### ❌ no da 35% en Armar caja (24/10/2026, v26.58, él: "que el % lo tome del más alto, de la venta más alta y de la competencia")
- **Qué es:** `_cajaPct35`: % del peor caso al precio de hoy (`margenMLDe`), a la venta más cara de 90 días y contra la competencia
  (`cyc/techofull`, ≤4 días); manda el más alto. Chip rojo en el renglón si ninguno llega a la meta; detalle de los tres al abrirlo.
- **Qué chequear:** que "hoy" coincida con el ⚠️ bajo 35% de Productos · que una venta en promo vieja no haga pasar algo que hoy no da.
- **Corrección 24/10 21:26 (v26.59, él con el Watch 5 Lite: "cuando da menos del 35% que se vea en rojo"):** el precio de hoy ya NO entra en
  "el más alto": sólo la venta más alta y la competencia (lo que él pidió). Hoy sólo si no hay ninguna de las dos. El Watch, pausado a
  $142.990 (39%) con su única venta a $113.250 (~10%), no salía en rojo. Chequear: algo pausado con precio inflado no se salva del rojo.

### `PROMPT_CAJAS.md` · el chat de Chrome arma las cajas "MANDALA YA" (24/10/2026, él: "decirle arrancá y que arme todas las cajas")
- **Qué es:** un prompt fijo: lee en el panel qué cuentas tienen la caja en verde (`cajasVerdes`/`cajaVeredicto`), copia cada renglón
  (código de etiqueta y unidades) a Planificación de envíos de ESA cuenta y no confirma el envío.
- **Etiquetas (24/10, él):** baja el .txt de etiquetas SÓLO de lo que dice "🏷️ N sin etiqueta" (como mucho N) y lo guarda en su carpeta.
- **Qué chequear:** que el texto siga coincidiendo con lo que muestra la web (cartel "MANDALA YA", "📦 N cajas para mandar ya", el código
  de etiqueta en cada renglón) cada vez que se toca Armar caja o Inicio.

### `FIJO` en `decide_cajas.py` · las decisiones suyas de una caja no las pisa ninguna vuelta (25/10/2026)
- **Qué es:** la completa de las 03:00 recalculó las cajas y le pisó dos decisiones del día (Persea de Luciana volvió a 0 y el Watch 5 Lite a 2).
  `FIJO[(id, color, cuenta)] = (unidades, motivo)` manda sobre la cuenta (nunca más que la oficina). Hoy: Persea 3, Watch 0, P47 blanco Ayelen 0,
  Sony EX15LP Blanco 0, Alfaparf 1/3/8 Luciana 0. Se saca de ahí cuando él cambia de idea.
- **Qué chequear:** que cada vez que él decide una caja a mano, el renglón entre a `FIJO` en el mismo commit.

### `pybusca:<palabras>` · un producto en todos los pedidos de Paraguay, sin precios (25/10/2026, él: "¿miraste en el ticket si estaba el Sony que falta?")
- **Qué es:** sólo lee `cyc/compraspy`: pedido, fecha, estado, unidades, código y si tiene ticket. No imprime precios (el registro es público).
- **Qué chequear:** que nunca salga un precio del mayorista.

### `cajaquitar:<envío>!<palabras o código>=<u>:go` · sacar de una caja en camino lo que no estaba (25/10/2026, él: "sacá los dos del pedido mandado, no los encuentro, ya lo modifiqué del envío")
- **Qué es:** baja unidades de un renglón de una caja que va en camino (`cyc/envios_full/<id>/cajasDet`, lista entera releída) y deja
  constancia en `quitado`. No vuelven a la oficina (no existen). Tiene que agarrar UN solo renglón. Primer caso: 2 Sony EX15LP Blanco del #80494103.
- **Qué chequear:** que el stock "en camino" baje y que al llegar la caja no aparezca un faltante falso de esas unidades.

### `fijarinv:<MLA>[=<código>];…;go` · el código de etiqueta de lo pausado (25/10/2026, el chat de Armar cajas)
- **Qué es:** la vuelta de stock sólo guarda el `inventory_id` de lo que está en Full con stock; esto se lo pregunta a ML para cualquier
  publicación (pausada también) y hace patch de `cyc/mllinks/<MLA>/inv`. El código que vio el chat sólo se compara: si no coincide, no se escribe.
- **Qué chequear:** que una venta (que reescribe el renglón de mllinks) no lo borre para siempre: la vuelta lo repone si está en Full; si
  sigue pausada se vuelve a correr.

### `publicar` frena con un catálogo repetido vacío (25/10/2026, él con la Bowen: "esta es la cera, ¿por qué no la encontraste?")
- **Qué es:** ML tiene catálogos duplicados con el mismo nombre (Bowen MLA73100796 vacío / MLA20002465 con vendedores; Calipso
  MLA19895794 / MLA19895795). Si el catálogo elegido no tiene vendedores, `publicar` busca los de nombre idéntico y, si alguno tiene, frena y dice cuál.
- **Qué chequear:** que no frene cuando el otro es de otro tamaño o tono (sólo nombre idéntico) · 2 de 10 productos nuevos del 25/10 tenían este error.

### `fotocat:<catálogo>` · las fotos de un catálogo de ML (25/10/2026, él: "¿tenés foto de la Calipso que está en ML? pasámela")
- **Qué es:** sólo lee: nombre, 4 características y hasta 6 fotos (sólo direcciones de mlstatic) de un catálogo, para confirmar que es
  el mismo producto antes de `publicar`. **Qué chequear:** que no imprima nada que no sea de ML.

### `cajaarmar` · cargar la caja como el botón "🎯 Cargar lo que entra en el cupo" (25/10/2026, él: "cuando te digo armá la caja (…) hacé idéntico como ahora, pero apretá el botón de cargar lo que entra en el cupo, si no queda incompleta")
- **Qué es:** después de `decido:archivo=cajas;go`, `cajaarmar[:<cuenta>];go` (ml-sync) escribe `cyc/cajas_armando/<cuenta>` (lo mismo que el botón)
  con lo decidido en `notas/cajas.txt`, que `decide_cajas.py` ya recortó por cupo con la misma regla (`llenar_cupo` = `cajaLlenarCupoPlan`).
  Clave `<prodId>|<color>` (`_ck`), nunca más que la oficina, reemplaza la caja cargada (dice cuánto tenía) y relee.
- **Qué chequear:** que Armar caja muestre la caja cargada igual que con el botón · que un color con `.`/`/` en el nombre entre con su clave.

### `ofi35` · lo de la oficina contra el 35% (24/10/2026, él: "mercadería en mi oficina que no da para el 35%… me la podés marcar?")
- **Qué es:** sólo lee. Por ficha con unidades en la oficina: la mejor publicación viva (Clásica) y su % en el peor caso al precio de
  hoy (la cuenta de `planilla`), y la plata parada a costo. Primero lo que no llega al 35%; aparte lo sin publicación y lo sin %.
- **Qué chequear:** que el % coincida con el de la tarjeta de la web para 2-3 productos · que lo "sin publicación" no tenga una viva.

### Para probar mide cada 2 horas, 500 consultas por vuelta (24/10/2026, control de la tarde de Elegancia)
- **Qué es:** `ml-candidatos` corría 1 vez por día (+ la noche) con 250 consultas: ~60 medidos por vuelta y 2.647 en fila (los 993 de
  Elegancia) = ~3 semanas. Ahora `cron 7 */2` y `candidatos:max=500:go` (~120 por vuelta), con `concurrency` para que dos no se pisen.
- **Qué chequear:** en `candresumen` "sin medir" baja ~1.000 por día · `consultas a ML` sin 429 · que no choque con el paso de candidatos
  de ml-daily (~09-10 UTC) dejando algo medido dos veces.

### Las cajas que entraron completas se marcan solas (24/10/2026, error que marcó él: la 79567049 de Matías, 93/93 en ML y 8 días "no llegó")
- **Qué es:** con SÓLO DATOS el robot sólo anotaba lo entrado y yo tenía que marcar; la vuelta no la marcó. Ahora `cajasQueLlegaron` en la vuelta
  horaria marca sola toda caja en la que entró TODO lo mandado; las que tienen faltantes siguen listadas para mí ("las marca Claude").
- **Qué chequear:** ninguna caja completa queda abierta más de ~1 h después de que ML la da de alta · una caja con faltantes NO se marca sola ·
  no sale Telegram por una completa.

**24/10/2026 · v26.49 · "Remate" → "📦 Sacando stock"** (él: *"¿qué pasó con remate? quizás no se llaman remate, pero cumplen el mismo objetivo: sacar stock de productos que no dan o hay sobrestock"*). La franja contaba sólo `cyc/nosubir` y `cyc/escalera` del robot viejo (apagado el 09/10), por eso se cortó. La línea de cada noche (`lineatodo`/ml-daily) ahora pone `rem` también con la estrategia del día 📦 sobra / 📉 liquidando / 🧨 remate y `esc` con 🪜 bajando (`tagAyer`). Los días de antes no se rellenan. **Qué chequear:** mañana la franja vuelve a mostrar los de sobra/escalera de hoy.

**24/10/2026 · v26.42 · "Falta reponer" de Paraguay cuenta sólo lo que da** (él: *"¿por qué dice falta reponer más de 3M y me da solo ese producto?"*). Sumaba todos los pedidos de Nissei (también los de "No da, no hay o falta revisar"). Ahora `_pedsPyQueDan` (✅ `pyProbVeredicto`) en la solapa y en `pedFaltaReponerTodo` (Resumen): lo cargado en el 🧾 Pedido y lo oculto por "Vender en" sí cuentan. **Qué chequear:** que el número de arriba se parezca a lo que muestran Dan + Ya cargado + ocultos.

**24/10/2026 · `pyprecio:prov=elegancia;…` (él eligió la 10a: lo que Nissei no tiene y Elegancia sí, se repone de Elegancia).** Además del
código y el precio pone `provPy:'elegancia'` en la ficha (Pedidos la pide en Elegancia; el catálogo la compara con `EL_<código>`). **Qué chequear:**
que Halloween 100, Cabotine 30, Cool Water mujer y Cuba Prestige aparezcan en la solapa 🟣 de Pedidos y ya no digan "Nissei no lo tiene".

**24/10/2026 · v26.39 · ⭐ la nota a la vista (él: *"¿de qué puntaje no debería aparecer?"*).** `candCombo` = % × log10(🚀+1) ÷ 10;
`CAND_COMBO_MIN`=7 = lo mínimo para comprar (35% con 100 de salida). Chip ⭐ en tarjetas y pedido (verde 7+ con salida 100+, ámbar abajo).
El orden ⭐ usa el mismo número. **Qué chequear:** que nada de lo que "se puede pedir" quede abajo de 7 salvo los de 30% con 100+ y 2 vendedores (6,0).

**24/10/2026 · v26.37 · ⭐ "gana mucho y sale mucho" (él: *"juntando el puntaje de salida y el % de ganancia: el primero tiene que ser el que
se le gana mucho y se vende mucho"*).** Orden nuevo en Productos nuevos = % × log10(🚀 puntaje + 1) (el % entero, la salida por escalones de ×10,
para que vender muchísimo no gane solo). Lo de rotación baja (🚀 menos de 100) va después de todo lo que sale bien aunque deje 200%; sin % o sin puntaje, al final. Se sacaron "🛒 más vendidos" y "$ por unidad" (él); un orden guardado que
ya no existe vuelve a ⭐ (que es el de entrada). **Qué chequear:** que arriba queden los de mucho % con 🚀 verde y que los sin vendidas/reseñas cargadas
queden abajo.

**24/10/2026 · v26.36 · 🚀 Puntaje de salida (él: *"que para ordenar se junten ambas, ventas y reseñas… ordenar por puntaje de salida y ahí
me aseguro que los primeros salen bien"*).** `puntajeSalida(v,res)` = max(vendidas, reseñas × `CAND_VENTAS_X_RESENA`=20); orden nuevo en
Nuevos; chip 🚀 en tarjetas y en el pedido; menos de 100 = rotación baja (misma vara que `pocasVentas`: 100 vendidas o 5 reseñas). MEDIDO con
`resenamedir`: las vendidas que ve el chat ("+5", "+25", "+100") son de UN vendedor (el que gana el catálogo) y las reseñas son del catálogo
entero de toda la vida (25 vendidas contra 1.041 reseñas): no hay un "1 reseña = N ventas" fijo. ML no deja leer las fechas de las reseñas
ajenas (403), así que "reseñas de los últimos 90 días" no se puede medir por el robot. El 20 sale de la regla que él aprobó (5 reseñas = 100).
**Qué chequear:** que ordenar por 🚀 ponga arriba lo de muchas reseñas y que nada con dato quede sin puntaje.

**24/10/2026 · `pycodcolor` (sólo lee): el código de Paraguay de cada ficha contra su color (corrección suya con los Redmi Buds 6 Play:
la ficha del negro tenía el 131119, que es el azul).** Para cada `codPy` y cada `pyVar` compara el color del renglón del catálogo con el
de la ficha (nombre, color de la variante y títulos de sus publicaciones de ML): ❌ choca = código casi seguro equivocado (muestra los
códigos de los otros colores) · ❔ la ficha no dice color y el catálogo tiene el mismo producto en varios colores (mirar la foto). **Qué
chequear:** que el Buds 6 Play ya no salga; correrlo en la completa del sábado después de la pasada de Nissei.

**24/10/2026 · 🟣 El catálogo ENTERO de Elegancia, como el de Nissei (él: *"este de elegancia, también miro todos los productos? (…) de
acá también podemos pedir"*).** Antes sólo estaban los ~36 del PDF "Atacado". Ahora el chat de compras lo copia con
`pycat:prov=elegancia;#<pág>;<código>|<nombre>|<US$>|<link>|<foto>;…;go` (ml-consulta): va a `mlapi/pycat` con clave `EL_<código>` y
`pv:'elegancia'` (así nunca choca con un código de Nissei que termine igual), su página en `mlapi/pycatprog_el`. El robot del catálogo lo
mide igual; lo que da pasa a Para probar como candidato de Elegancia (`prov:'elegancia'`, código sin `EL_`). Números aparte en
`cyc/pycatres_el` (la solapa 🟣 Elegancia → Nuevos los muestra como los de Nissei). `faltaprecio` dice `py|elegancia|EL_<cód>` y
`svprecio:EL_<cód>=…` lo carga. Dónde vive: `pycatProvDe`/`pycatCodDe`/`pycatEsDe` (sync.mjs e index.html). **Qué chequear:** `pycat:prov=elegancia`
(sin go) dice "CATÁLOGO DE ELEGANCIA" y cuántos; que un candidato nuevo de Elegancia aparezca en la solapa 🟣 y no en la 🟢; que
`cyc/pycatres` (Nissei) no cambie de total por Elegancia.

**24/10/2026 · `/borrar` para las vendidas.** El chat cargó "/0" en 36 catálogos que no muestran vendidas (es duda, no 0: con 1 vendedor un 0
lo deja afuera para siempre). `candprecio:<cód>=/borrar` saca `vendCarga`; `listadato:<prov>;<cód>=borrar` saca `vend`. **Qué chequear:** que
los borrados vuelvan a "falta cargar las vendidas" en `candresumen`.

**24/10/2026 · v26.30 · 🌟 Sin competencia sin precio (eligió la 3a).** Los catálogos sin vendedores y sin ningún precio a la vista NO entran
solos: van a la carpeta "🌟 Sin competencia en ML" (antes "nadie lo vende") con el precio estimado para dejar 35% (`pycatPrecio35`:
comisión ~14,5% + fijo, impuestos peor caso ~10%, envío de Full arriba de $33.000) y el botón **➕ Lo quiero** (`pycatQuiero`): crea el
candidato con `sinComp`, `svp` = ese precio (o el que vio el chat) y `elegido`, y marca el renglón del catálogo. El robot lo mide exacto
(`correrCandidatos` → `ofertaVista`) y yo confirmo las fotos (`fotosrev`) antes de que se pueda pedir. Orden de la carpeta: rubros que ya
vendemos, US$ 10-80, el más caro primero; los catálogos genéricos (3+ productos al mismo) al final. **Qué chequear:** que el ➕ no deje
un producto sin foto de Paraguay; que el % medido por el robot quede cerca de 35%.

**24/10/2026 · v26.29 · 1 vendedor con 100+ y 🌟 sin competencia (eligió 1a 2a).** **1a:** `vendOk(nv, vend, sinComp)` (sync.mjs) y
`_vendOk`/`candVendOk` (web): entra con 2+ vendedores, con 1 si vendió 100+ (`vendCarga`/`vend`), o `sinComp`. `faltaventas` y
`listarevisar` traen también los de 1 vendedor (vara 35%). **2a:** `faltaprecio` lista los catálogos sin vendedores (Nissei y listas) para
el chat; `svprecio` carga el precio VISTO en ML (`svp`/`svpTs`, vale `SVP_DIAS`=30); `ofertaVista` arma una oferta con Full a ese precio
(categoría por `domain_discovery`) y la miden `correrPyCatMedir` (`svm`) y `correrCandidatos` (`sinComp`). **Catálogo padre:** si un
catálogo no tiene vendedores y tiene hijos (colores), se miden los hijos (`_vis`, `hv:1`; los `sv` viejos se re-miden). Medido con
`catvacio`: Xiaomi Sound Outdoor "nadie lo vende" tenía 18 y 13 vendedores en sus hijos. **Qué chequear:** `pycatmedir:prueba` con el
Xiaomi da vendedores; un `svprecio` mide y pasa a Para probar con 🌟; ningún 1-vendedor sin vendidas aparece como "da".

**24/10/2026 · v26.28 · Revisión de "¿dejamos algo afuera injustamente?"** (él). Muestras de cada carpeta del catálogo de Nissei
(`pycatmuestra:<grupo>:<n>`): **fz** (110V, D&G) bien · **margen** (810 descartados por no dar) ~95% bien medidos · **scr** (3.885 no
están en ML) casi todos de verdad no están · **sv** (5.279 "nadie lo vende") = catálogo de ML SIN vendedores: muchos se venden en
publicaciones sueltas que la API no deja medir (búsqueda 403) y la regla del 20/10 pide catálogo con 2+ vendedores → se renombró la
carpeta · **bajo** (2.365 no llegan) ~1 de cada 5 medido contra OTRO producto (RAM 32 GB contra 16 GB, Eros masculino contra pour
Femme, Flip 7 contra Flip 6). **Hecho:** `chequeoMismoProducto` suma tres reparos DUROS (`_rvCapacidadChoca`, `_rvGeneroChoca`,
`_rvNumModeloChoca`) y `correrPyCatMedir` vuelve a buscar lo ya medido cuyo catálogo guardado choca (`_chocaNuevo`, no los fijados ni
los `ok`). **Qué chequear:** que esos se re-midan en las próximas vueltas y ninguno vuelva al mismo catálogo; falsos choques
(misma palabra con otro número que NO es otro modelo) → agregar la palabra a `RV_NUM_NO`.

**24/10/2026 · v26.27 · 🔁 Rebusca de los descartados por "otro producto" (eligió la 1a).** De 1.386 descartados, 513 los había sacado
yo mirando las fotos porque ML los comparaba con OTRO producto, y quedaban afuera para siempre sin que nadie les buscara el correcto.
**Dónde vive:** `rebusca[;go]` (sync.mjs, ml-consulta) los pasa a `noTipo:'rebusca'` y le saca `cand`/`t` a su renglón de `mlapi/pycat`;
`correrPyCatMedir` ya no los saltea, busca sin los catálogos de su `mlNoEs` y, si dan, vuelve el MISMO candidato (`rebuscaVolvio`). La
web no los cuenta como descartados. `descartesmot` agrupa los descartes por motivo. **Qué chequear:** que ninguno vuelva con un
catálogo de su `mlNoEs`; que los que vuelven pasen por `fotosrev`; que el número de Descartados baje ~513.

**24/10/2026 · v26.26 · Paraguay → "Dan el %, pero no entran al pedido".** Él: *"acá creo que quedan productos que no van"*. La carpeta
"🟢 Medidos que dan, pero el robot no confirmó…" mostraba en verde 59 productos del catálogo con 2+ vendedores que NUNCA pueden entrar a
un pedido: a los 59 les falta la foto de Paraguay (sin las dos fotos no se compra) y muchos son otro producto (Klasse shampoo ⇒ vino
Rutini, tag de mochila ⇒ Funko, testers ⇒ perfume en caja, Invictus ⇒ Invictus Platinum). **Dónde vive:** `pycatFila` (`noVa`: motivo
y % en ámbar), título de la carpeta; `pycatbusca:!sinpasar` (sync.mjs) los lista con motivo y `pycatbusca:<palabra>` muestra la medición
y el candidato. **Qué chequear:** ningún % verde en esa carpeta; cuando la pasada de Nissei traiga la foto, el robot los vuelve a medir y
recién ahí pasan a Para probar (y a la revisión de fotos).
- **26/10/2026 · el envío del peor caso no se mide con carritos de varios productos** (lo encontró la revisión del CyberMonday: Bare Vanilla Bliss medía $12.043 de envío por una orden de carrito, de verdad ~$6.800; Pure Seduction $11.515; el Tendedero $19.215 contra ~$11.900; los VS daban ~35% estando en ~55% y las subas del 24/10 a $68.990 salieron de ahí). `ventaEnCarritoConOtros` adentro de `compraCruzaBarrera` (por ahí pasan los 18 lugares que miden el envío; `cruza33` sigue con sólo la barrera). Qué chequear: `planilla` del Bliss y del Pure Seduction con el envío ~$6.800 y su % ~55%.
- **26/10/2026 · 👯 lista nueva en `planilla`: mismo producto y color con distinto precio** (él eligió que tengan el mismo precio si son exactamente el mismo producto). Agrupa por stock (`kSt`), activas, sin gemelas; tiene que quedar vacía en cada vuelta (CLAUDE §4 listas vacías). Probado contra la base: 2 de verdad (Centímetro Blanco y Codera; el Redmi Watch 4 era Clásica contra Premium, que sí puede tener otro precio, y por eso compara dentro del mismo tipo). Los 9 que conté antes salían de agrupar por título. Qué chequear: que la vuelta mire si es el mismo producto antes de igualar (el Redmi Watch 4 o la Lupa pueden ser otra variante mal vinculada).
- **26/10/2026 · 👯 también mismo precio con distinta estrategia** (él con las Cartas Poker Rojo y Azul: las dos publicaciones de cada color al mismo precio, una 📈 techo y otra 💰, "no entiendo"). La lista agarra el grupo si difiere el precio O la estrategia. Qué chequear: que la vuelta deje las dos con la estrategia que se está midiendo (la línea de techo es una sola por stock).
- **26/10/2026 · v26.71 · Inicio: el cuadro de Ventas quedaba con las del día anterior** (él: 39 · $157.122 del domingo; hoy iban 8 · $30.118). `_ventasHoyFrescas` (al volver a la app, cada minuto, al reconectar) redibujaba "Hoy" pero no `renderHomeVivos`. Mismo patrón buscado: el ☰ recalcula al abrirse (bien) y `renderAll` ya incluía los dos. Qué chequear: dejar la app abierta de un día para el otro y que al volver diga las de hoy.
- **26/10/2026 · v26.70 · tarjeta de Precio con las publicaciones que no coinciden** (él con el Centímetro Blanco: una a $4.290 🪜 y otra a $3.990 📈 con el mismo stock; la tarjeta mostraba una sola). `_pubsDistintas` en la línea de tiempo: 2+ activas sin gemelas con distinto precio o estrategia → renglón ámbar con todas. Medido en `planilla`: 9 productos así (Centímetro Blanco, Mazos Rojo y Azul, Lupa 90, Sábanas 2½, P47 azul, Paulvic Leyton, Codera, Redmi Watch 4). Y el 🔔 control de ventas cada hora (1a) reemplaza al timbre por API. Qué chequear: el Centímetro Blanco muestra las dos.
- **26/10/2026 · `revcand:cod:<código>=…`**: además del número interno, acepta el código de Nissei/Elegancia (sólo si hay UN candidato vivo con ese código; si no, lo dice). Para sacar lo que marca el chat de compras sin buscar ids.
- **26/10/2026 · sus respuestas de la mañana:** autorizaciones viejas del 23/10 (16) → "no" con `autorizo:no …;go`, y regla nueva: lo caro que no vende, a los 60 días sin vender, escalera hasta el precio que GANA la caja (CLAUDE §5 Sobra, CEREBRO renglón 8) · 4a: la rutina del chat de Chrome suma la parte 3b (lo que ML frena en Publicaciones, renglón `ml:` del buzón) · 5b: los 6 candidatos con variante dudosa se sacan (`revcand:<id>=no`). Qué chequear: que los VS/Watch/Dalí con 60 días sin vender bajen en escalera hacia la caja y no más abajo.
- **26/10/2026 · `faltaventas` no repite lo ya mirado.** Si ML no muestra vendidas, el chat carga sólo las reseñas (`/r<n>`) y el filtro exigía vendidas para sacarlo: 71 de los 207 que cargó a la noche volvían a la lista (el Sony EX15C con 1.693 reseñas, entre ellos). Ahora con `resCarga` cargado sale. Qué chequear: `faltaventas` ya no trae los que tienen reseñas.
- **26/10/2026 · `svprecio:<cód>=otro`** (el chat de compras dejó 66 "el catálogo de ML es otro producto" de Nissei/Elegancia y no había cómo marcarlo: volvían cada día a `faltaprecio`). Ahora `otro` pone `noEs`/`noEsCat` en `mlapi/pycat` como en las listas, el robot vuelve a buscar sin ese catálogo (`_rechazado` ya no es sólo de listas) y `faltaprecio` los saca (`listaNoEsVale`). PROMPT_GUAY lo explica. Qué chequear: que los marcados no vuelvan a salir en `faltaprecio` y que se midan contra otro catálogo.
- **26/10/2026 · `buzon:ver=<ts>`**: muestra el mensaje entero (la lista lo corta en 600 letras; el chat de compras dejó 120 dudas en dos mensajes). Sólo lee.
- **26/10/2026 · `faltaprecio` y `faltaventas` sin marcas prohibidas.** El texto del 24/10 para el chat de compras traía Dolce & Gabbana (prohibida) y Calvin Klein (prohibida para ML) en la lista de precios a mirar. Ahora `faltaprecio` saca las de `marcasFrenadas` y `marcasNoML` (dice cuántas sacó) y `faltaventas` las de `marcasNoML`. Además `marcaFrenadaDe` reconoce las abreviadas (`MARCA_ALIAS`: "D&G", "CK"), que Elegancia usa y se colaban también en candidatos y `publicar`. Qué chequear: que en el próximo texto no salga ninguna D&G ni CK, y que "Dior Dolce Vita" no quede frenada.
- **26/10/2026 · rutina diaria del chat de Chrome** (él: *"podemos hacer una rutina del chat en local que haga todo eso… lo haría diario"*; eligió 1a 2a 3a 5b 6b, la 4 la tiene que entender). Qué es: `ml-sync/PROMPT_RUTINA_LOCAL.md` (cupo de Full de las 4, disponible de MP de las 4, repaso del Pedido del momento en la fila de Nissei) → un mensaje `RUTINA <fecha>` en el 📬 buzón; yo lo cargo en la vuelta (CEREBRO, paso del buzón). Qué chequear: que los números del buzón sean los de la pantalla y que no traiga datos de terceros (movimientos de MP); recordatorio del 02/11 (`trig_01TvZRbCah3SQoTCrcWTKxER`).
- **25/10/2026 · v26.69 · 🎨 otros colores de referencia en los candidatos con aviso rojo** (él con el JBL Grip Purple a 99%: *"quizás hay otro color mucho más barato… para tener referencia del negocio del producto"*). Dónde: `correrCandidatos` (sync.mjs, antes del renglón "se vende…") sube al catálogo padre (`parent_id`) y mide cada hermano (`mlOtrosColores`, cada 3 días como mucho, sólo con 80%+, un vendedor sin Full o reparos de nombre); la web lo muestra en `candPreciosPartes` (`R.colores`). No cambia el margen. Qué chequear: el JBL Grip muestra los otros colores en la próxima medición; que no gaste de más el cupo de consultas.
- **26/10/2026 · v26.67 · el orden del pedido usa `candCombo`** (él: *"el último quedó el que más reseñas tiene y el que más % de ganancia tiene. parece joda"*): ventas × % dejaba sin dato lo que tenía reseñas y no vendidas cargadas. Ahora Nuevos = `candCombo` (mismo ⭐ que Productos nuevos) y Probados = % × log10(ventas+1)/10. Qué chequear: el Sony EX15C (1693 reseñas, 146%) arriba de todo.
- **26/10/2026 · v26.66 · orden "🔥 vende y gana" en el Pedido del momento** (él: *"que se pueda ordenar con el que más se vende y más % de ganancia da"*). `_k.vendpct` = ventas × % (Probados: ventas propias; Nuevos: vendidas en ML), lo que no tiene uno de los dos va al final. Qué chequear: que en Nuevos un 146% con 0 vendidas no quede arriba de un 60% con 500.
- **26/10/2026 · 🥊 `ganarcaja` + `mantenerCaja`** (él con la waflera: *"podés mantenerla en ganando siempre hasta que se venda? sin bajar muchísimo"*). `cyc/ganacaja/<MLA>` = {piso, m, desde, por}; cada hora después de la caja: si la perdemos/compartimos y ML da el precio para ganarla, baja a ese (terminado en 90, sin pasarlo), como mucho 15% por hora, nunca abajo del piso que él aceptó ni del 35%; ganándola no se toca; con stock 0 nada. Pasa por encima de 🔒/🧊 y de la puerta de las bajas (`chequeo.ganacaja`) porque es SU pedido para esa publicación; relee de ML y anota en `claudecambios`. Qué chequear: que sólo actúe sobre lo que él pidió; que con la caja ganada no baje; que el piso frene.
- **25/10/2026 · v26.65 · la nota 📈 de la línea de tiempo** (él con el Centímetro Blanco: *"está bajando y dice que está un 73% seguro y que termina de decidir en 2 días. no tiene sentido nada"*). En `lineaPintar`: "(N días)" eran los días medidos → ahora "lleva N días medidos"; si el precio de hoy está 2%+ abajo del de la prueba, dice "la prueba de $X se cortó: N días, Y% seguro (pedía Z%)". Qué chequear: el Centímetro Blanco dice "se cortó".
- **25/10/2026 · `techo95:buscando`** (él: *"tabla de producto buscando techo, hace cuánto están buscando y qué % de seguridad lleva y en qué fecha aprox"*): mira todas las 📈 (sin gemelas) e imprime `TABLA|…`: desde cuándo busca, subas de verdad, precio de prueba, vendidas/días, % seguro, umbral, fecha estimada (primer día en que, sin vender más, la certeza pasa el umbral que baja con los días, o el día 30 sin vender) y el 💰. Qué chequear: que la fecha se corra cuando vende; que no salgan gemelas.
- **25/10/2026 · v26.64 · 💰 la escalera después del techo es "buscando el de más ganancia"** (él: *"la estrategia es buscar el mejor precio por ganancia CON escalera"*). `estrategiaDe` (index.html): un `bajando` cuya estrategia anterior es techo/techook/punto se muestra `punto` con `esc:true` y `n` = bajas de verdad (`claudecambios` a<de) desde que empezó la escalera; chip "· Nº escalón". Los dos que miraban `t==='bajando'` (notas de rayas, `probando`) miran también `esc`. CEREBRO y CLAUDE §5: el orden techo → 💰 en escalera. Qué chequear: que una escalera de fin de escasez siga diciendo 🪜; que el color de la línea de tiempo en esos días sea el de 💰.
- **25/10/2026 · `pausar` elige gemelas de envío o un MLA** (él eligió sacar las 17 gemelas de envío gratis de Paulvic, 11b). `pausar:gemelaenvio+<palabra>[:go]` = sólo `gemelaTipo:'envio'` con esa palabra; un MLA entre las palabras la elige por número. Las pausadas quedan con `noAutoActivar` (no las reactiva el robot). Qué chequear: que `pausar:gemelaenvio+paulvic` liste sólo las de envío y no las Clásicas ni las Premium.
- **25/10/2026 · v26.63 · 📬 buzón para Claude** (eligió la 15a: cómo se comunica el chat de Chrome que arma cajas). Web: `renderBuzonCard`/`buzonEnviar` en Mi oficina → Contar lo que hay (`cyc/buzon/<ts>` = {t, ts, leido}); no pierde lo escrito al redibujar. Robot: `buzon` lista los sin leer, `buzon:leido=<ts>,…;go` los marca (ml-consulta). PROMPT_CAJAS paso 6. Cada vuelta corre `buzon`. Qué chequear: que el mensaje llegue y salga en `buzon`; que no se escriban datos de compradores (es una nota libre: si aparece uno, borrarlo).
- **25/10/2026 · v26.62 · 🏷️ código de etiqueta de Full en la tarjeta de Productos** (él con los Separadores de dedos: *"poner código de ml de envío full"*). `_etiqProdHTML` (index.html, en el resumen de `prod-card`): por cada publicación no cerrada de la ficha, cuenta + color + `inv`/`invVar` de `cyc/mllinks`. Sin código no muestra nada (nunca se adivina). Qué chequear: que en 360 px los chips bajen de renglón sin correr "ver todo"; que una ficha con colores muestre un código por color.
- **25/10/2026 · v26.61 · 🧾 foto del ticket de Paraguay obligatoria y aviso en rojo** (él: *"no sabemos si no lo mandaron o si no lo cobraron. a partir de ahora que sea obligatorio cargar el ticket de cada pedido de paraguay y que el ticket se vea en el detalle del pedido. si el ticket no está que aparezca en rojo avisando"*). Web: `pyTicketEstado`, `pyTicketsFaltanHTML` (arriba de Pedidos Paraguay en todas las pestañas), `pyTicketSubir` (achica la foto a 1600 px JPEG, `mlapi/pyticketfoto/<id>/<ts>`, anota `cyc/compraspy/<id>/ticketFoto`), `pyTicketVer`; fila "📷 foto del ticket" en La plata del detalle; "Ya llegó" no cierra sin foto. Robot: `pyped:llego` tampoco. Se exige a lo en camino y a lo pedido desde el 25/10. Qué chequear: subir una foto desde el teléfono (que no tarde ni falle con fotos de 4 MB); que el renglón rojo desaparezca; que la foto NUNCA aparezca en el repo ni en un log.
- **25/10/2026 · v26.60 · las cajas salen de lunes a viernes a las 12** (él: *"si la caja se arma después del viernes al mediodía ya se envía el lunes"*). Web `envSalidaTs`/`envDias`/`envSaleTxt` (index.html) y robot `envSalidaTs` (sync.mjs, usado en lo que viaja de la ficha y en la sección 9 del `informe`): armada un día hábil antes de las 12 sale ese día, si no el próximo día hábil a las 12 (hora de `ts` si es del mismo día que `fecha`; sin hora = a la mañana). `envDias` da NEGATIVO mientras no salió (la escasez suma esos días: 8 − d). La caja dice "armada · sale el lunes 26/10 a las 12". Qué chequear: una caja cargada el domingo muestra "sale el lunes"; el lunes después de las 12 dice "salió hoy"; los "hace +7 días" no cuentan el finde de espera.
- **25/10/2026 · v26.60 · todo lo que entra a la oficina queda 🏷️ sin etiqueta + botón ✅ Etiquetadas** (él: *"al cargar unidades a mi oficina, que siempre salgan como a etiquetar. y que haya un botón (…) ya que el chat en local imprime las etiquetas y quiere poner que ese producto ya se etiquetó"*). Web: `ofiMover` y `setQ` (oficina) suman lo que SUBE a `cyc/sinetiq` con `sinEtiqSumar` (transacción), salvo `entra:false` (deshacer una caja); botón por renglón en la tarjeta → `sinEtiqListo` (pone 0 ese renglón). Robot: `ofi:` suma siempre a sin etiqueta lo que sube (antes sólo con `!se`); `!ok` = ya viene etiquetado. Qué chequear: sumar 3 en Contar lo que hay → la tarjeta dice 3 más; deshacer una caja NO suma; el botón deja el renglón en 0 y desaparece; en 360 px el botón no corre el número.
- **24/10/2026 · `pyprecio` también por ml-consulta** (`CONSULTA_ESCRIBE`). El chat de compras mandó 8 `pyprecio` seguidos por ml-sync y cada uno canceló al anterior (ml-sync corta el que está corriendo): sólo quedó el último. ml-consulta corre en paralelo. Sólo toca `nisseiUSD`/`nisseiTs`/`codPy`/`pyLink` de la ficha, nunca el costo. Qué chequear: que varios `pyprecio` seguidos por ml-consulta terminen todos con "quedaron bien".
- **24/10/2026 · `pyprobadoslista` (sólo lee) y el PROMPT GUAY con los probados primero** (él: *"que primero mire los productos probados y que los cargue lo antes posible, después que siga con el resto"*). Lista cada ficha de Nissei (id, código, US$ guardado, días) para que el chat de compras actualice su precio con `pyprecio` (ml-sync) antes de recorrer el catálogo con `pycat`. Qué chequear: que después de la pasada "Productos probados" de Paraguay muestre los que dan.
- **23/10/2026 · el máximo de compra usa el precio de la ÚLTIMA venta** (él: *"si nunca vendió toma el % que decís vos. si ya vendió no importa si fue sólo 1 unidad. tomar ese %"*). `pedidostodo` imprime `ultv $X` (última venta de 180 d sin remates, salteando las vendidas con 🔥 escasez o ⏳ sin reposición vigente: `tagVigente`/`ultV`); `decide_pedidos.py` `venta()` = min(precio de hoy, ultv); nunca vendió = precio de hoy; log viejo sin `ultv` = la mediana de 60 d de antes. El motivo del `=venta|` dice cuál usó (`venta_mot`). Qué chequear: una suba que vendió 1 sube el máximo de compra de Paraguay en la web (maxCompraDe lee ese `pv`); que una venta de escasez no lo infle.
- **23/10/2026 · `sololocal`** (él: *"el producto 7114209 es un joystick ps5. se vende en local"*). `soloLocal: true` en la ficha: `publicar` frena y `ofisinpub` no la lista. Qué chequear: que Armar caja no la sugiera (no tiene publicación).
- **23/10/2026 · v26.23 · aviso 🏷️ en Armar caja** (él: *"si hay productos que faltan trabajo (terminarlos/etiquetas) que tenga un pequeño anuncio"*). En `renderOfiCaja`, después del cartel del veredicto: suma por renglón `min(sinEtiq, lo sugerido para esa cuenta)` y lista hasta 4 productos. Además `sinetiq:pvped=<id|ultimo>` marcó los 114 Paulvic del pv20261019 (264 u. sin etiqueta en total) y `cupo:ayelen=46/100`. Qué chequear: sin cuenta elegida suma todas; que el aviso se vaya al poner `sinetiq:<x>=0`.
- **23/10/2026 · 1 unidad no se mide contra un pack** (él con el Deco X60: *"estos en ml se venden x2 unidades, en paraguay es de una unidad"*; el panel daba 31% contra el pack de 2 y medido contra el de 1 da −24%). `unidadesPackTit` (título: N unidades/unidade/piezas/peças/pack, pack de N, N-pack, paquete de N) y `unidadesCatML` (título o atributos de unidades por pack); `packDistinto` es reparo DURO en `chequeoMismoProducto` (pycat, listas, revisiones), corta `_esGemelo`, y en la medición de candidatos de Paraguay saltea o frena el catálogo con otra cantidad. Probes: `candpack` (los vivos con otra cantidad por título), `catunid:<MLA>` (unidades y atributos de un catálogo). `catbusca` ahora dice los precios con Full. Qué chequear: que "16 Piezas" contra "16 peças" no frene; que un título sin número no cuente como distinto.
- **23/10/2026 · v26.21 · Nissei: ⏳ Falta revisar en su propia carpeta (pedido suyo).** Afuera de "Lo que no entra en el pedido" (que pasa a llamarse ✅ Revisados), se arma al abrirla (`window._pyFaltaFn`). Qué chequear: que Falta revisar + Revisados den el total del catálogo menos candidatos del pedido y fichas.
- **23/10/2026 · lo nuevo va a Ayelen o Luciana** (él: *"van en la de ayelen o luciana. dependiendo el cupo de monotributo"*). `repartopy` reparte el equilibrio sólo entre esas dos (las otras sólo si ninguna llega al piso, y lo dice con ⚠️); la tarjeta ⚖️ de Inicio dice la de más lugar entre las dos. Qué chequear: que un perfume siga yendo a Adriana.
- **23/10/2026 · v26.18 · 🏷️ Sin terminar / sin etiqueta** (él: *"en contar lo que hay poner una tarjeta que sean productos sin etiquetas (…) pero sí que los tengan en cuenta como siempre para armar la caja"*). `cyc/sinetiq/<prodId>` = {t, v:{<variante>}, ts}; robot: `ofi:…=+N!se` (suma a oficina y a sin etiqueta) y `sinetiq:` (lista / fija / resta; en ml-consulta; nunca más que lo que hay en la oficina). Web: `sinEtiq`, `renderSinEtiqCard` (tarjeta arriba de Contar lo que hay, con la cuenta destino), chip `_sinEtiqChip` en cada renglón de Contar y de Armar caja; el reparto NO cambia. Qué chequear: que al despachar una caja el número no quede más alto que la oficina (se recorta solo en pantalla, el dato guardado queda: limpiarlo con `sinetiq:<palabra>=0`), y que el chip no corra la casilla en 360 px.

### Nissei: ✅ Revisados / ⏳ Falta revisar, y nada pasa 14 días sin volver a mirarse (23/10/2026, v26.20, pedido suyo)
- Él, mirando Pedidos → Paraguay → Nissei → "Lo que no entra en el pedido": *"quiero que haya dos carpetas: una que fueron revisados y otra que faltan revisar, y que cada 2 semanas se venza el producto revisado y pase a no revisado"*.
- Qué (robot, sync.mjs): `PYCAT_REVISADO_DIAS` = 14. `pycatRemedirDias` (Nissei y Listas): abajo de 15%, sin catálogo exacto (`sc`, era 60) y nadie lo vende (`sv`, era 30) → cada 14 días; 15%+ sigue cada 7; lo que ML no deja medir, 7. `pycatGrupoRev` dice a qué carpeta va cada fila y `pycatResumenEscribir` agrega a `cyc/pycatres`: `rev` (medido hace menos de 14 días con cualquier resultado, más afuera por regla) · `pend` = `pn` (nunca medido, incluye lo que ML no deja medir) + `pv` (vencido) · `rv` {bajo, dan, sc, scr, sv, fz} = los revisados por grupo · `dia.pend` para el "−N hoy". El log de `pycatmedir`/`pycatres` imprime la cuenta y marca ❌ si rev + pend ≠ tot − cand − ficha.
- Qué (web, index.html): con `rev`/`pend` en la base, las carpetas 📏 Medidos y ❔ Sin precio en ML pasan a ✅ Revisados (últimos 14 días) — 1 solo vendedor, no llegan, descartados, dan sin confirmar, nadie lo vende, sin catálogo, afuera por regla, ya son tuyos, revisados traducidos — y ⏳ Falta revisar (nunca medidos + vencidos + candidatos sin analizar). Las filas del catálogo se separan con `_pycGrupoRev` (misma regla que el robot) en `pycatNoDan` modo `!`. Sin `rev` (el robot todavía no corrió) se ven las carpetas de antes. El total de "Lo que no entra" ahora suma también `scr` (faltaba).
- Cupo (medido en el log de ml-pycat del 23/10): una vuelta hace 700 en ~20 min con ~1.600 consultas a ML (10 cortadas por 429, reintentadas). Corren ~5 vueltas de día (GitHub saltea las demás) + la cadena de noche 02-08 → más de 8.000 por día de lugar. La regla nueva pide ~13.500 Nissei + ~13.000 listas cada 14 días ≈ 1.900 por día (más lo de 15%+ cada 7): entra. Lo primero es una ola: todo lo medido hace 14+ días vence junto (los `sc`/`sv` de la medición del 17-19/10 vencen el 31/10-02/11) y se pone al día en 2-4 días.
- Chequear: en el log de `ml-pycat` la línea "✅ revisados … = … − candidatos − fichas" sin ❌; que ⏳ Falta revisar baje día a día y no crezca más de lo que mide; que ninguna lista quede con "medidos hace poco" de más de 14 días (`vueltas`); que no aparezcan más 429 que antes en las vueltas de día.

### Nissei: búsqueda con el nombre traducido; lo que no aparece queda ✔️ revisado (23/10/2026, v26.15, eligió la 1a)
- Qué: `traducirPyNombre`/`PY_TRAD` (sync.mjs) agrega a `qs` una búsqueda con el nombre en castellano (auriculares, reloj, negro, inalámbrico…); los `sc` sin `qp` se vuelven a buscar una vez (`_rebuscar`), y al medir queda `qp = PY_NOMBRE_VER`. `pycatres.scr` = sin catálogo y ya buscado traducido; la web lo saca de "Sin medir" y lo muestra en 📏 Medidos como "✔️ Revisados: no están en ML" (`_PYC_GRUPOS.scr`).
- Chequear: que en 1-2 días los ~3.969 `sc` pasen a `scr` o a medidos; cuántos aparecieron con la traducción (`pycatdia`); que el chequeo de mismo producto (con el nombre original) no deje pasar otro modelo.

### "❔ No medidos" de Nissei dice qué es cada cosa (23/10/2026, v26.14) + `pycatdia`
- Qué: la carpeta suma sin medir + sin catálogo exacto + nadie lo vende + por regla (9.471); ahora se llama "Sin medir o sin precio en ML" y arriba dice cuántos faltan buscar de verdad (`nomed`, ~100). `pycatdia[:días]` (sync.mjs, sólo lee) desglosa el catálogo y cuenta lo buscado por día.
- Medido el 23/10: 775 de 25%+ · 2.352 abajo · 3.969 sin el mismo producto en ML · 5.210 nadie lo vende · 205 por regla · 12 ML no deja. Buscados por día (última vez): 15/10 854 · 16/10 1.421 · 17/10 3.346 · 18/10 4.795 · 19/10 1.759 · 20/10 1 · 21/10 152 · 22/10 9 (la primera pasada terminó el 19/10).
- Chequear: que el número de arriba coincida con `pycatdia`; que "−N hoy" siga contando sólo los sin medir.
- **23/10/2026 · Cajas: la ventana de lectura no pasa los 60 días (vuelta corta).** `cajasllegaron` dio 194 consultas con 400 "Date range can't be greater than 60 days": una caja marcada a mano despachada hace ~58-60 días estiraba la ventana de sus productos (despacho − 1 día hasta hoy + 1) y ninguna caja abierta de esos productos se podía leer (8 abiertas sin marcar). Ahora una marcada a mano despachada hace más de 57 días no estira la ventana (`limVentana`, en `marcarCajasLlegadas`). Qué chequear: que `cajasllegaron` no tenga ningún 400 de rango y que las cajas abiertas no vuelvan a quedar sin leer por eso.

### Nuevos de Paraguay abajo de 35% en rojo (23/10/2026, v26.12, pedido suyo)
- Qué: `candPctCol` (index.html) pinta el % de un candidato nuevo en rojo abajo de `CAND_VARA_COMPRA`, en la fila del pedido (Nuevos) y en la tarjeta de Para probar; Listas ya lo hacía. Probados (reponer, vara 25%) no cambia.
- Chequear: que un nuevo de 27% (Lattafa Queen of Arabia) se vea rojo y uno de 40% verde; que Probados no se ponga rojo entre 25 y 35.

### Las categorías que no se miran frenan Para probar y faltaventas (23/10/2026, eligió la a)
- Qué: `pyCatNoSeMira` (sync.mjs) usa `PYCAT_FUERA_RE` (la regla del 03/10) en el paso pycat → Para probar y en `faltaventas`; el catálogo se sigue guardando y midiendo entero. `candfuera[;go]` descarta los candidatos vivos de esas categorías (`noTipo:'regla'`); `candfuera;prov=<p>;<cód>=<motivo>;go` descarta uno puntual (`noTipo:'duro'`).
- Chequear: que ninguna cámara, celular, notebook, termo, etc. aparezca en Para probar; que `candfuera` sin go muestre la lista antes de sacar; que no saque lo que ya viaja.
- **21/10/2026 · `vendcat:<MLA o catálogo>` (solo lee):** prueba todas las puertas para saber las unidades vendidas de un catálogo ajeno (ficha, ofertas, publicación ajena con y sin token, visitas, opiniones, ranking de más vendidos, página web). Pedido suyo. **Resultado 21/10: NO HAY FORMA.** La ficha y las ofertas del catálogo no traen ningún campo de ventas; la publicación ajena da 403 con y sin token; visitas, opiniones y ranking de más vendidos (`highlights`) dan 403 (PolicyAgent); la página web pide verificación (también desde el chat). Sólo un navegador con una persona ve el "+100 vendidos".
- **21/10/2026 · Lo que no está en ML se vuelve a buscar de a poco (pedido suyo, v25.58).** `pycatRemedirDias`: sin catálogo exacto (`sc`) cada 60 días (`PYCAT_SINCAT_DIAS`), catálogo sin vendedores (`sv`) cada 30. Antes `Infinity`. Qué chequear: el log de `pycatmedir` dice los días; una ola grande de `sc` recién a mitad de diciembre.
- **21/10/2026 · v25.56 · cuántas de cada nuevo de Paraguay (decisión 4a):** `candMaxU` = barato (≤US$15 crudo) 3 · caro (+US$60) 1
  · resto lo de la casilla (2), sin mirar vendidas ni vendedores. Chequear: 🪄 Llenar no pone 4 a nada.
- **20/10/2026 · Lista por lista, con la última vuelta completa (pedido suyo, v25.52).** `pycatmedir` (ml-pycat, cada hora) ya no mide Paraguay con las listas de costado: va por turno (`cyc/mlconfig/medirTurno` = {k, desde, med}): Nissei y después cada lista no descartada, en orden. Mide la del turno hasta que no le queda nada vencido y anota `cyc/mlconfig/vueltas/<fuente>` = {fin, desde, med, alDia} (una vuelta que no midió nada sólo pone `alDia`); en la misma corrida pasa a la siguiente si queda tiempo. `listaprioridad` toma el turno primero. Lo que no está en ML (`sc`/`sv`) ya NO se vuelve a buscar (él: *"no los van a encontrar, sacalos de la revisión"*), salvo la búsqueda única con el nombre traducido (`qv`). La web muestra `medirVueltaHTML` arriba de cada lista y de Nissei. Chequear: que el turno avance solo y que la fecha aparezca al terminar Dai Nippon.
- **20/10/2026 · Paraguay y Listas se vuelven a medir según qué tan cerca están (eligió la 1a).** `pycatRemedirDias` en sync.mjs: lo que dio 15%+ cada 7 días · abajo de 15% cada 30 · sin catálogo o sin vendedores cada 30 · lo que ML no deja medir, 7. Costo nuevo (`uMed`) y nombre traducido (`qv`) lo vuelven a medir igual. Motivo: todo cada 7 días gastaba el cupo de ML que usan ventas y cajas. Chequear en el log de `ml-pycat` que la cola de la ola del 22-26/10 sea ~4 veces más chica.
- **20/10/2026 · Productos nuevos: catálogo con 2+ vendedores en vez de 100 ventas (eligió la 1a, v25.51).** Él: *"sacar las 100 ventas y que ahora sean todos productos que estén en catálogo. no está en catálogo es como si vendiera menos de 100"*. `CAND_MIN_VENDEDORES` = 2 en index.html y sync.mjs. Paraguay: `candPuedePedir`, 🪄 Llenar (`pedLlenarPlan`), el desplegable de abajo (`_pocas`), el comando `pedir` y el resumen de `candidatos` miran `mlVendedores`. Listas: `_listaMed25`/`_listaDa` y `cuentaLista` miran `mv`; `listarevisar` ya no pide ventas (sólo el ✅) y no lista los de 1 vendedor; `listaestado` cuenta "1 solo vendedor". Sigue igual: mismo producto confirmado (✅/fotos), 25%, fotos. Las ventas cargadas se siguen mostrando y `candMaxU` las usa para dar 3-4 u. a lo barato que vende. Se sacó la casilla "Mín. vendidas en ML". PROMPT_GUAY y PROMPT_LISTAS ya no piden ventas. Chequear: que un candidato con 1 vendedor no se pueda pedir y que los contadores de cada lista (`listacuenta:go`) se rehagan.
- **REVISIÓN DEL 20/10/2026 (4 revisores, máximo): 33 arreglos, 2 decisiones suyas (1a lo probado de una lista entra a su 🧾 Pedido como Paraguay — hecho v25.41; 2a lo grande paga desde 60 d — hecho).**
- 20/10/2026 · Etapa 3 · **Cajas (revisor 1):** `recUsadas` de las cajas marcadas a mano se guarda también con SOLO_DATOS (es dato) · si la ventana de movimientos arranca hace 20+ días se leen hasta 3.000 (antes 1.000) y el corte queda con motivo `tope` (informe §9 ya no dice "429") · `delEnvioFull` no borra un envío con cajas llegadas hace menos de 60 días · `decide_cajas.py` con 1-2 ventas no saca ritmo (C8, sólo el piso si está en cero) · `cajaitems` = "Cerrar caja": resta/devuelve en `cyc/claudedecide/caja/<id>__<cuenta>[__v__<color>]/u`, descuenta `cyc/cajas_armando/<cuenta>/items` (claves `_clCajaKey`/`_ck` de la web) y anota en `cyc/history` · `ofiTx`/`ofiMover` con `{entra:false}` en `deshacerCaja` (no anota `cyc/ofientro`) · textos del cupo (lo vendido no devuelve cupo) y de "lo sugerido" (decisión de `decide_cajas.py`, 37 d). **Chequear:** claves del robot = `_clCajaKey`/`_ck`; toda devolución a la oficina pasa `entra:false`; que §9 diga `tope` cuando corresponde.
- 20/10/2026 · Etapa 3 · **La mercadería en los números (7 arreglos).** (1) `cyc/reponer/<prod>`: la web lo reescribe también si tiene más de 1 día (`syncPedidosAuto`) y el respaldo del robot (`repoFallback` en `escasez`) lee `cyc/notraer`. (2) ⚡ "se aceleró" es UNA regla en los dos lados: robot `escasez` y web `ritmoRapido`/`ventas7De` (en `escasezDe`, `_pdiaAntes` de la línea y el semáforo de Pedidos). (3) El plazo de lo que viene en camino sale sólo de cajas de menos de 8 días (web `transitoInfoDe().diasLead` + `escasezDe`, robot `escasez`); las vencidas suman unidades pero el plazo pasa a oficina o compra. (4) Reposición por color: robot lee `noconsigo/<prod>/nunca` y no usa "mandar caja" para un color sin oficina; web `_reponerCalc` mira el color antes del pedido en camino, `_pedidoViaja(pid,vari)` filtra por los colores del pedido y la oficina es la de ese color. (5) `planilla` 🔎 mide los días con el grupo `kSt`, igual que la 📦. (6) `antiguo`: fila "sin color" = total − Σ colores; la CUENTA compara unidades. (7) Rayas: con 2+ publicaciones activas a precios distintos salen de la más barata sola (`_mlaRaya`, `gd[k].porMla`), como `techo95`. **Chequear:** mismo ritmo ⚡ en los dos lados; una caja vieja con 1 u. no dice "llega en 1 d"; la raya y `techo95` dicen el mismo techo.
- 20/10/2026 · Etapa 3 · **Pedidos (9 arreglos).** Lo agotado se mide mientras se vendía (`pedidostodo` imprime `hist <días>d` = de la primera a la última venta en 180 d; `ritmo()` de `decide_pedidos.py` usa `max(v60/60, v180/hist)`; Adaptador 8 en 1 pasa de 6 a 35) · las subas ESC/PRU se reconocen por la estrategia del momento (`cyc/estrategia`) y `cyc/claudecambios`, color por color y todas las de 45 d · lo cambiado a mano (`mano`) se descuenta al pedir en el botón, "Ya lo pedí", `pvped` y `pyped:repo` (web `clDescontarPed` = robot `clDescontarPedBot`); en Bs As vence cuando entra mercadería a la oficina (`cyc/ofientro`) · los juicios de un color sin renglón se aplican (`## colores` en el log) · `decido` decide `desde` una vez por producto (los 10 días de "no se consigue" ya llegan) · Listas: no da nada medido con costo viejo (`_listaCostoVigente`/`listaCostoVigente`, "⏳ costo nuevo, falta medir") · Bs As "De siempre" sólo esconde probados de listas que se ven · `pedidostodo` cuenta ventas como la web (reclamos sí, `ventasDesde`) · `pvped:llego` acepta `fecha=` y `lista:` sin `|fecha=` frena si el proveedor ya tenía fecha. **Chequear:** `clDescontarPed` y `clDescontarPedBot` son la misma cuenta; `desde` no se resetea día a día; una suba #escasez sale ESC en el color correcto.
- 20/10/2026 · Etapa 3 · **Paraguay por color, proveedor y "Ya lo pedí" por chat (8 arreglos).** El pedido del momento de probados se guarda por color (`cyc/py_armado/<pid>` = `{u, ts, v:{<color>:{c,u}}}`; `pyArmSet`/`pyArmSetVar`/`pyArmSugeridas`/`pyArmadoFilas`) y cada color va a Nissei con su código y precio (`pyDeColor`); `pyped:repo` acepta `palabra#color=u`. Los códigos sólo se comparan dentro del mismo proveedor (`provPyDeBot`: pycat, pycatprobados, pycatmedir, pycatres, candalta, pyped:llego, compray det=; web `candFichaMisma`): Elegancia `100572` ≠ Nissei `7100572`; `compray` empareja por el final sólo con 5+ dígitos. Las fichas que nacen al llegar llevan `provPy`, `pyLink`, `pyFoto`. `pyped:repo`/`nuevos` = el botón (saca de `py_armado`, descuenta de la decisión, `py_personal` al historial, renglones con `desc:1` y `ts`); `syncPedidosAuto` resta lo de Paraguay pedido después de la decisión sin `desc` (`_pyPost`). `compray det=`: `usdWeb` = guardado → `usd` del pedido → `nisseiUSD`. `pycatmedir` usa `ofertasParaMedir` (+20% si sólo venden de afuera). `pycat` renueva `ts`/`visto` aunque el precio no cambie; Nuevos tiene "⌛ Vencidos (N)" con Devolver (`candRenovar`). Menores: informe §8b (descartados por margen que dan de nuevo), `pedir` exige las dos fotos y lee `pedTopeUSD`/`pedMaxU`, "Llenar" vacío con su grupo, un 429 en `/products/<id>` ya no se guarda como "no existe". **Chequear:** el mensaje a Nissei de un producto con colores lleva el código de cada color; una ficha de Elegancia creada al llegar tiene `provPy`; lo pedido por chat sale del pedido del momento y de la decisión; `pycat` no toca nada de Elegancia.
- 20/10/2026 · Etapa 3 · **📋 Lo ya probado de una lista se pide como Paraguay (decisión 1a, v25.41).** Un producto con ficha de una lista (`listaProv`) se carga desde su tarjeta de Pedidos ("📋 pedir a <lista>", por color) al 🧾 Pedido de esa lista; el mensaje lo pide con el nombre de la lista (`codLista`). "✅ Ya lo pedí" guarda cada renglón con `prodId`, `variante`, `desc:1`, `ts` y lo descuenta de `cyc/claudedecide/ped` (`clDescontarPed`). Mientras viaja (y hasta 7 días después de llegar si falta contarlo, `ofiAlLlegar`) Pedidos lo resta; el Arqueo no (2b). "📦 Llegó" no crea ficha para lo probado (6a sigue). El buscador no deja cargar como nuevo algo que ya es ficha. Dónde: `cyc/listas_pedido_prob/<prov>/<prodId>`, `cyc/compraslista/<id>`; web `listaProbSet`/`listaProbSetVar`/`listaProbFilas`/`listaProbCasillaHTML`, `listaEnCamino` (en `syncPedidosAuto` y `_pedidoViaja`), `_listaFichaDe`, `listaYaLoPedi`, `listaLlego`; robot `pedidostodo` imprime `LIviaja` y `decide_pedidos.py` lo resta; el respaldo de `escasez` conoce el pedido a lista. **Chequear:** después de "Ya lo pedí" la decisión baja y no se resta dos veces; el patrimonio no cambia por un pedido a lista en camino; `LIviaja` coincide con los pedidos en camino.
- 20/10/2026 · Etapa 3 · **Decisión 2a:** lo GRANDE (Tenders) paga stock antiguo desde los 60 días en el robot (`STOCK_ANTIGUO_TABLA.grande` y la copia del supervisor), igual que la web (`almacDiasDe`). Entre 60 y 120 se usa la tarifa del escalón siguiente ($1.355) como estimación: la factura (`cargosmes`) trae el almacenamiento por cuenta, no por producto.
- **Ningún "da" sin chequear el catálogo de ML (20/10/2026, v25.10, eligió la a).** El chat de compras encontró mal emparejados
  67 de 344 candidatos de Paraguay y 21 de 36 de las listas. Paraguay: `candCatChequeado` (index.html y sync.mjs) pide `mismoOk` o
  `revClaude` ok atados al catálogo que se midió; sin eso `candPuedePedir` y el comando `pedir` no dejan cargar, y la tarjeta va a
  "🔍 Dan, pero falta confirmar". Listas: `_listaDa`/`cuentaLista` piden `ok` de `listadato` (`listaOkVale`); `listadato` guarda
  `okCat` = el catálogo que se miró, y si el robot mide contra otro el ✅ deja de valer. Chequear: que lo confirmado suba solo y que
  un cambio de catálogo lo baje.
- **El catálogo de Paraguay se mide más rápido (16/10/2026).** Él: *"no veo ni cerca los 13.000"*. Medido: 13.467 guardados,
  1.436 medidos en 7 días, 10.595 esperando; GitHub corrió `ml-pycat` 8 veces en ~2 días. `PYCAT_POR_VUELTA` 300 → 700 y cada
  2 h (era 3). Chequear en el log de `ml-pycat`: que no aparezcan 429 de ML y que la vuelta termine antes de 55 min.
- **Lo "no disponible" de Nissei sale de Para probar (16/10/2026, regla suya).** El chat de compras no lo copia en `pycat` y lo
  carga con `candprecio:<cód>=nohay;go` (duro `noTipo:'nissei'`, vuelve solo si reaparece con precio). Caso: Corsair Void Elite
  58605, listado a US$ 2,25 (precio viejo) daba 599%. Escrito en `PROMPT_GUAY.md`.
- **`antiguo` color por color (16/10/2026).** ML cobra stock antiguo por código de Full (= color). El comando sumaba el
  producto×cuenta y usaba el código de UNA publicación: los colores que venden tapaban a los parados (P47 Matías blanco 12 u.
  195 d y azul 10 u. 157 d en el Excel no aparecían). Ahora, si hay stock por color (`__v__`), va una fila por color con su
  código (`mllinks.variant` o el título), su Excel, su ritmo (`ritmonormal`/ventas con `variante`) y su `stockhist`. Las cajas
  llegadas no tienen color: por color no se usan. Chequear: la `CUENTA` del final sigue cerrando.

### Armar caja: barra del cupo y el veredicto por costo de esperar (21/10/2026, v25.88, pedido suyo · también etapa 7)
- **Qué es:** (1) se fueron el desplegable de cajas a medio armar (el apartado `reservadoEnOtras`/`cajaMax` sigue igual) y
  el texto de ayuda. (2) El cupo de cada cuenta es una barra por tipo (chicos y medianos / grandes, `esGrandeFull`): total =
  en Full + en camino + lo que queda de cupo (leíste − mandaste, `cupoRestante`). Sólido = en Full (`getQ`) · medio = en
  camino (`enTransito`, `_cupoOcupadoDe`) · transparente = esta caja (`cupoDeCaja`) · rojo = lo que se pasa del cupo. Sin cupo
  cargado no se dibuja (como antes). (3) `convieneCaja`/`cajaVeredicto` ya no comparan la ganancia de la caja contra el envío
  (esa plata se cobra igual si esperás). Comparan: **esperar 7 días** (`CAJA_ESPERA_DIAS`) = Σ por producto de
  `min(u, días de corte de más × vDia) × ganancia/u`, con días de corte de más = `max(0, viaje+7−corte) − max(0, viaje−corte)`,
  `corte = (Full+camino)/vDia`, `viaje = REPO_DIAS_DEMORA` · contra **mandarla a medias** = `costoCaja × (1 − lleno)`, con
  `lleno` = el mayor entre lugar y peso de `cajaOcupacion`. Verde si esperar ≥ envío de más o la caja va al 90%+ · naranja si
  esperar ≥ la mitad · rojo si no. El cartel es un `<details>`: cerrado veredicto + una línea; abierto los dos costos con números.
- **Dónde vive:** `index.html` (`renderOfiCaja`, `_cupoOcupadoDe`, `convieneCaja`, `cajaVeredicto`; `cajasVerdes` de Inicio
  usa el mismo veredicto).
- **Qué chequear:** que Inicio (📦 cajas para mandar ya) y el cartel digan lo mismo; que una caja con productos a punto de
  cortarse salga verde y una con todo sobrado salga roja; productos sin medidas cuentan como caja vacía (el envío de más se ve
  más alto, lo avisa); el veredicto mide los productos en Full de ESA cuenta (no las otras).

### Pedidos: precio de venta a mano para el máximo (`notas/venta_max.txt`, 20/10/2026)
`decide_pedidos.py` mide si reponer da con el menor entre el precio de hoy y la mediana de 60 días. En lo que vendía barato y
se agotaba, esa mediana tira para abajo y da "el precio de Paraguay no da" cuando sí da. Caso: Ferrari Negro, medido a $68.510
(14%) cuando al precio que más plata dejó, $75.360, deja ~27%. El 16/10 quedó en "no se repone" por eso. Ahora
`ml-sync/notas/venta_max.txt` (`<prodId>=<precio>|<motivo>`) manda sobre esa cuenta. **Qué chequear:** que cada renglón sea un
precio al que ya vendió con 5+ días de stock, nunca uno de escasez ni de prueba sin ventas. Y en los juicios de
"no se repone" de `juicios.txt`, que el motivo diga cuál de las dos cosas pasa (Nissei no lo tiene / el precio no da) y con qué
precio de venta se midió.

### El análisis a fondo aplicado (16/10/2026, eligió "lo que recomiendes" en las 11)
Qué es: reglas nuevas del cerebro (`ml-sync/CEREBRO.md`, sección 🔬). Código: `pedidostodo` imprime `cortes N` (veces que
quedó en 0 en Full en 60 d, `cortes60`) y `decide_pedidos.py` compra 45 días lo de Bs As que se corta 2+ veces, vende 0,5+/día
y deja 25%+ (`Tde`); el motivo de Tito y el 📋 Copiar pedido dicen "SÓLO este color / estos colores"; `escasez` lista aparte
"📦 EN CERO EN FULL CON MERCADERÍA EN LA OFICINA" (antes los escondía el filtro de 2 ventas en 14 d); la `lupa` ya no dice
"desaparecieron N u." con stock compartido; `antiguo` muestra también la cuenta con las ventas de 30 d. Qué chequear:
que `cortes` salga en el log de `pedidostodo` y `decide_pedidos.py` lea N de M ✓.

### Paraguay Nuevos: carpetas Medidos / No medidos (17/10/2026, v24.15, pedido suyo)
- Medidos: pocas ventas · no llegan (+catálogo `bajo`) · descartados con margen · ya son tuyos. No medidos: falta analizar (+`nomed`) · descartados sin margen (+`sc/sv/fz`). `candDescartadosHTML(nCat,med)`. Chequear que la suma de las dos carpetas = el total de arriba.

### Línea de tiempo: caja en camino, días que faltan y oficina (17/10/2026, v24.14, pedido suyo)
- En el resumen de arriba (`_stHoy`): cada caja pendiente (`transitoInfoDe(...).lista`) con unidades y ~8 d desde el despacho, la oficina del color y `_pedidoViaja`. Chequear que con un color elegido muestre sólo ese color.

### Paraguay: el catálogo ENTERO dividido en los grupos (17/10/2026, v24.13, pedido suyo)
- Robot: `pycatResumenEscribir` → `cyc/pycatres` {tot,cand,ficha,fz,bajo,sc,sv,nomed} (corre en `pycatmedir:go` y con `pycatres:go`); emparejado de códigos `pyCodMatcher`. Web: `pycatNoDan` con los MISMOS grupos (`_pycMatcher`) + ficha y nomed; encabezados con "+ N del catálogo".
- Chequear: que la suma cierre con el total (`📊` del log) y que web y robot dividan igual.

### Paraguay: piso 25%, no 24% (17/10/2026, v24.12, regla suya)
- `CAND_PISO_PCT`/`CAND_PISO_PERFUME` (index.html y sync.mjs) y `PY_PROB_PISO` (probados) en 25. Chequear que las dos copias digan lo mismo.

### Paraguay Nuevos: lo que no entra en el pedido, en un solo desplegable (17/10/2026, v24.10)
- Pocas ventas · no llegan al % · falta analizar · descartados · resto del catálogo, adentro de "🗂️ Lo que no entra en el pedido". `pycatNoDan` saltea los códigos que ya son candidatos (aunque `mlapi/pycat` no tenga `cand`). Chequear que no se repita nada entre grupos. v24.11 (él: "¿no se puede meter en no dan o descartados?"): el catálogo ya no es un grupo aparte: `pycatNoDanHTML(keys,id,título)` — `bajo` adentro de 🔻 No llegan, `sc/sv/fz` adentro de 👎 Descartados.

### Paulvic: Pedidos a 45 días en `decide_pedidos.py` (17/10/2026)
- La regla del análisis (Paulvic cada 15 días, 45 días de ritmo) estaba en CEREBRO.md pero no en el script: Paulvic pedía para 30. `Tde` devuelve 45 para PAULVIC. Chequear que el pedido del Paulvic tenga decisiones por color (el 17/10 estaba vacío: él vio "nada para reponer").

### Pedidos sin cartel "sin decidir" ni cuadros de conteo (17/10/2026, v24.08, pedido suyo)
- Ocultos por CSS (`#ped-sindecidir` y los `#pedidos-*-count`); el cálculo sigue. v24.09: de los cuadros queda sólo "Falta reponer" (`.pcount-reponer`). Chequear que no vuelvan a verse y que nada dependa de verlos.

### Paulvic: los testers no entran en el costo (22/10/2026, v26.11, regla suya)
- Qué: los testers son probadores que se le dan a la perfumería (no se venden ni se cobran): `pvCosto` (sync.mjs) y `pvPedidoTarjeta` (index.html) dividen por llegadas + regalos, ya no por testers. Se siguen anotando (`tester=`) y no entran a la oficina.
- Chequear: que el costo c/u de la tarjeta y el de la ficha den lo mismo; que el pedido del 06/10 (ya cerrado, con 1 tester adentro) no se recalcule solo.

### Paulvic: costo del último pedido y tarjeta de pedido (17/10/2026, v24.07, pedido suyo)
- Qué: `pvCosto` en `pvped` = (montoPago||aPagar + flete) ÷ (llegadas + testers + regalos) → ficha "Paulvic TODOS" (sólo si es el último llegado; congela el costo viejo en meses con ventas como `poncosto`). Corre en `llego`, `pago` con monto y `costo`.
- Web: `pvPedidoTarjeta` (index.html), tarjeta por pedido como `pyPedidoTarjeta`: plata, días, aroma por aroma (faltaron, no pedidas, 🚫 no viene más), comprobantes.
- Chequear: que un pedido viejo no pise el costo de uno más nuevo; que los regalos que NO son perfume no se carguen en `regalo=`; que el flete se sume cuando llegue.

### Paulvic: lo que no vino no viene más (17/10/2026, v24.06, regla suya)
- Qué: `pvped:llego` marca cada aroma que faltó en `cyc/noconsigo/<prod>/nunca/<sid>` ({ts, ped, v, falto}); `pvped:nunca[:aroma;-aroma][;go]` a mano; volver a pedirlo con `pvped:<aroma>=<u>;go` saca la marca.
- Dónde: sync.mjs (pvped, `pedidostodo` imprime ` · NUNCA` en el color), `notas/decide_pedidos.py` (pone 0 con motivo para Tito), index.html (`_noConsigoActivo` la devuelve siempre, botón "🚫 no viene más").
- Chequear: que la marca NO se caiga al entrar mercadería a la oficina, que Pedidos no pida ese aroma y que pedirlo de nuevo la saque.

### `cajaitems`: corregir lo que salió en una caja ya despachada (17/10/2026)
Qué: `cajaitems:<seguimiento>|<palabra>[@color]=<u>;…;go` (ml-sync) fija las unidades de la caja y mueve la diferencia contra la
oficina (salió de más → baja la oficina; de menos → vuelve). No toca cajas recibidas. Chequear: que la suma caja + oficina no cambie
y que el `__v__` de la oficina sea el mismo que usa la web (`sid(variante)`).

### La estrategia de cada precio (17/10/2026, v24.00, pedido suyo)
Qué: cada precio guarda su estrategia en `cyc/estrategia/<MLA>/<ts>` = {t, m} (historia). `decido:<MLA>=<precio>#<tag>|motivo` la pone;
sin `#tag` sale de `tagDeMotivo(motivo)`. A mano `tag:<MLA>=<tag>|motivo;go`; `tag:semilla;go` arma la historia vieja (claudecambios,
nosubir, promoclaude); `tag` solo lista. Web: `estrategiaVentaHTML` en cada venta de Ventas x Producto (la última estrategia anterior
a la venta; sin dato y marcada liquidando → 📉). Lista igual en `ESTRATEGIAS` (sync.mjs) y `ESTRATEGIA_UI` (index.html).
Chequear: que las dos listas coincidan, que `tagDeMotivo` no ponga "base" a motivos claros de escasez/liquidar, y que cada `decido` deje su estrategia.
**18/10/2026 (v24.51), pedido suyo con el Pendrive 128gb (salía 🎯 base a 13%):** estrategia nueva `sobra` (📦 sobra stock: se baja abajo
del 25% porque sobra mercadería y va a pagar stock antiguo; vuelve al normal con lo justo). `tagDeMotivo`: "stock antiguo/sobrestock/sobran"
→ sobra antes que liquidando. `entrarpromo` ahora guarda la estrategia (si el motivo da base, queda 🏷️ promo). Chequear: ninguna
publicación abajo del 25% con 🎯 base. `planilla` ahora dice la estrategia de cada renglón (🏷) y abajo lista **🏷 ETIQUETAS QUE NO CUADRAN**
(base abajo del 25%, promo mía anotada base, o sobra/liquidando/excepción/caja con el precio ya 30%+). Mirarla en cada completa.

### Todo lo que el robot revisó y no da, en Nuevos (17/10/2026, v23.99, pedido suyo)
Qué: abajo de todo en Pedidos → Paraguay → Nuevos (sólo Nissei), desplegable `pycatNoDanHTML`/`pycatNoDan` que lee `mlapi/pycat` al
abrirlo y lista en 4 grupos: medidos abajo del piso, sin catálogo exacto, nadie lo vende, afuera por regla (de a 100). El renglón es
`pycatFila`, el mismo del buscador. Chequear: que los números cierren contra `pycat` (fuera por regla, menos de 15%, sin catálogo) y que
lo que ya está en Para probar (`cand`) no aparezca.

### Vendidas en ML desde la tarjeta del candidato (16/10/2026, v23.84)
Casilla "🛒 Vendidas en ML" en el detalle (`candSetVend` → `candidatos_py/<id>/vendCarga`). Qué chequear: que con 100+ el candidato pase arriba y se pueda pedir.

### Paraguay con DOS proveedores: Nissei y Elegancia (16/10/2026, v23.82, pedido suyo)
Qué es: él, con el catálogo "Atacado Black Friday" del proveedor **Elegancia**: *"separar por proveedor dentro de paraguay
(…) dentro de cada uno tenés probados, nuevos y pedidos. ya que los pedidos no se pueden juntar (…) que sea idéntico a
como está armado nissei"*. Dónde vive: `PY_PROVS`, `pyProv` (localStorage `cycPyProv`), `pyProvDe`, `pySetProv`,
`pyIdHoy` en index.html; candidatos con `prov:'elegancia'`, compras `compraspy/pyel<fecha>` con `prov`, fichas con
`provPy`, uso personal con `prov`. Filtran por proveedor: `candList`, `pyCompras`, `pyArmadoFilas`,
`pyPersonalFilas` y la lista de Probados; "Ya lo pedí" vacía sólo lo del proveedor elegido (`pyArmadoVaciarProv`).
Robot: `candalta:prov=elegancia;…;go` (sólo compara contra candidatos del mismo proveedor). Fotos de Elegancia
recortadas del PDF en `elegancia/<código>.jpg` (se publican en GitHub Pages). Qué chequear: que un pedido de un
proveedor no aparezca ni se vacíe en el otro · `compray`/`pyped:llego` de Elegancia usan el id `pyel<fecha>` · el
"Sharaf The Club" del PDF trae la foto y el código del Yaa Umree (error del catálogo): sin foto hasta confirmarlo.

### Pasada de fotos: los candidatos del catálogo entero (16/10/2026)
**Qué es:** los candidatos que vienen de `pycat` tienen código `c<números>p<números>` y ni `revfotos.py armar` ni `revcand` los reconocían: la pasada decía 0 para mirar con 29 arriba del 25%, y `revcand` no escribía nada. Ahora los dos aceptan ese formato. **Qué chequear:** que `revfotos.py armar` no diga "30 de 30 afuera" cuando `fotosrev` lista más.

### Las notas del 🧠 enteras (16/10/2026, v23.73)
**Qué es:** `decido` guardaba las notas en `mlapi/claudeexp` cortadas a 600 caracteres (900 las del día, 400 los motivos de Pedidos y la web también los cortaba a 400): las de 4 partes quedaban sin el final. Ahora 2500. **Qué chequear:** que ninguna nota del 🧠 termine a mitad de frase.

### Paraguay: la llegada se cuenta desde el despacho (16/10/2026, v23.71 · v23.72 la muestra en la tarjeta cerrada: "llega ~dd/mm", `pyLlegadaAprox`)
**Qué es:** `compray:…|despacho=AAAA-MM-DD|go` guarda el día de la guía del correo y la tarjeta del pedido calcula "llegaría aprox." con `PY_DIAS_CORREO` (3 hábiles) desde ahí; sin guía sigue 5 hábiles desde el pedido. **Qué chequear:** medir con los próximos pedidos cuánto tarda de verdad el correo y ajustar el 3.

### Deshacer caja devuelve lo decidido (16/10/2026, v23.70)
**Qué es:** `cerrarCaja` resta lo mandado de `claudedecide/caja` (`clDescontarCaja`) y `deshacerCaja` no lo devolvía: Armar caja quedaba sin sugerencia. Ahora `clDevolverCaja` lo suma de vuelta (sólo si la decisión existe). **Qué chequear:** cerrar y deshacer una caja deja Armar caja igual que antes.

### Informe 12c: cada color parado se juzga solo (16/10/2026, auditoría)
**Qué es:** la sección 12c del `informe` (con stock en Full y sin vender en 30 días) agrupaba por producto×cuenta y un color parado quedaba tapado por otro que vendía. Ahora, si el inventario tiene claves `__v__`, se juzga cada color con sus publicaciones (`colorDeI`). **Qué chequear:** que el total de 12c se parezca al del chequeo de la mañana (16/10: 46 · $3,10M contra 45 · $2,75M).

- **Cajas: 30 días + 7 de viaje, almacenamiento a los 4 meses (14/10/2026, v23.36).** `REPO_DIAS_TOTAL`=37 (index.html) y `T=37` en `ml-sync/notas/decide_cajas.py`. `almacDiasDe(p)`: 120 días lo chico, 60 lo grande (`esGrandeFull`). Chequear: Armar caja y el script dan el mismo objetivo · ninguna caja manda para más de 37 días · el aviso "empieza a pagar en N d" de Rotación cuenta desde 120 en lo chico.

### Paraguay: el catálogo ENTERO de Nissei en CYC, medido por el robot (15/10/2026, eligió 1a y 2a)
- Qué: el chat de compras sólo COPIA el catálogo (código, nombre, US$, link, foto) página por página con `pycat:#<pág>@<orden>;…;go`
  (va por ml-consulta: es el único que escribe ahí, sólo en `mlapi/pycat`). `pycat` solo dice cuántos hay y la última página guardada
  (`mlapi/pycatprog`). Al cargar, si el código ya es candidato o ficha, les pone el precio de Paraguay de hoy (el costo no se toca).
- `pycatmedir[:N][:go]` (workflow `ml-pycat`, cada 3 h, 300 por vuelta, tope 40 min): saca lo obvio (`pyCatFuera`: +US$215, 110V,
  marcas frenadas o que no se compran, celulares/notebooks/cámaras/TV/muebles/electrodomésticos grandes/termos), busca en el catálogo
  de ML el primer resultado sin reparos de `chequeoMismoProducto`, y mide con `cuentaCandidatoMejor` (la de `candidatos`). Guarda margen
  y catálogo en el mismo nodo; se vuelve a medir a los 7 días o si cambió el precio.
- Lo que da el piso de candidatos pasa SOLO a `cyc/candidatos_py` (fuente `pycat`, con el catálogo fijo y la foto): ahí `candidatos`
  lo mide dos veces y `fotosrev` revisa las fotos. Perfumería, maquillaje y cuidado personal NO pasan (regla del 13/10), quedan medidos.
- CAMBIO DEL MISMO 15/10, él: "guardá TODOS y vos hacés el filtro del 25% y más de 100 ventas, y listo". `pyCatFuera` ya no saca nada por
  precio, rubro ni tamaño (sólo 110V y marcas frenadas por ML) y perfumería también pasa. Las ventas de ML el robot no las ve: `pycatventas`
  lista los que pasaron sin ventas, el chat las mira y las carga con `candprecio:<cód>=<US$>/<vendidas>;go` (ahora va por ml-consulta).
  El panel ya muestra arriba sólo 25%+ y 100+ ventas (`CAND_MIN_VENT`).
- Nada se borra: lo de menos de 15% queda guardado (él: "quizás mañana dan, y sirve para la perfumería del local").
- Qué chequear: que `pycat` y el panel cuenten igual; que lo que pasa a Para probar no repita candidatos ni fichas (código también por
  el final); que un 429 no quede como "sin catálogo"; que lo "fuera por regla" no se coma cosas que sí se miran (webcam, mesa digitalizadora).
- **Los probados primero** (15/10, pedido suyo): `pycatprobados[:go]` (ml-consulta) pone el precio de Paraguay de hoy en cada ficha de
  Paraguay desde `mlapi/pycat` (gratis, sin consultar a ML; el costo no se toca), lista las fichas con código que no está en el catálogo y
  propone el código más parecido para las que no tienen (no elige solo: se carga con `pyprecio`). La carga de `pycat` ahora refresca
  `nisseiTs` aunque el precio sea igual. Qué chequear: que no toque `costUSD`; que el código se compare también por el final.
- Decisiones suyas del 15/10 (1b 2b 3a): los 7 probados cuyo código no está en el catálogo quedan "Nissei no lo tiene" (`cyc/py_sinstock`),
  y la marca se cae sola si `pycat`/`pycatprobados` vuelven a encontrar el código · los 15 sin código quedan así hasta su próxima compra ·
  `pycatmedir` mide primero los rubros que ya vendemos (`PYCAT_RUBRO_RE`: perfumes, auriculares, pendrives/memorias, relojes).
  Qué chequear: que el regex no deje afuera un rubro nuestro escrito en portugués.

### Paraguay: todo guardado en CYC y una pasada por mes (14/10/2026, pedido suyo · v23.37 `cyc-v617`)
- **Qué es:** el chat de compras carga TODO lo de Nissei con catálogo exacto en ML (aunque no dé 25% ni tenga 100 vendidas: el panel ya lo esconde en desplegables), anota lo que no tiene catálogo con `pyvisto` (`cyc/pyvistos/<código>`), y una vez por mes actualiza precios con `candprecio:<código>=<US$>[/<vendidas>]|=nohay` sin volver a buscar en ML, usando la lista de `pyconocidos`. `candalta` de un código ya cargado ya no lo saltea: le pone el precio y la fecha. El robot mide hasta 250 por vuelta (antes 40) y los descartados por margen se vuelven a medir cada 2 días (antes 7). Un candidato vence a los 60 días sin precio nuevo (antes 45).
- **Dónde:** `candalta`, `candprecio`, `pyvisto`, `pyconocidos`, `CAND_MAX_ML`, `CAND_REMEDIR_DIAS` (sync.mjs) · `CAND_VENCE_DIAS` (index.html) · `ml-sync/PROMPT_GUAY.md`.
- **Qué chequear:** que `candprecio` no reviva lo tachado a mano; que un precio nuevo borre `calcTs` y se vuelva a medir; que la corrida de `candidatos` con 250 no tarde demasiado ni dé 429 a otros pasos de la noche.

### Por qué cada caja abierta no se lee sola, en el informe (14/10/2026, auditoría)
- **Qué es:** `cajasQueLlegaron` anota en `mlapi/cajasciegas` (cada hora) los renglones de cada caja abierta que quedaron sin leer y el motivo (`sinpub` sin publicación de Full con código en esa cuenta · `color` falta fijarvar · `sincolor` renglón sin color · `ml` 429). La sección 9 del `informe` lo muestra para TODAS las abiertas, no sólo las de 9+ días.
- **Dónde:** `motivoSL` en `cajasQueLlegaron` (sync.mjs) y el bloque "Auditoría 14/10" de la sección 9 del informe.
- **Qué chequear:** que sólo muestre cajas que siguen abiertas con el mismo seguimiento; que un producto nuevo (primera caja) diga "normal"; que no escriba en modo prueba.

### Cada color con su código de Paraguay (13/10/2026, v23.34 · `cyc-v614`)
Él con el Joystick Xbox: *"me pide el azul, pero no puso el link del azul, puso el del negro"*. La ficha tenía un solo
código/link/foto para todos los colores. Ahora `cyc/products/<id>/pyVar/<color>` = {cod, usd, link, foto, ts}, cargado con
`pyprecio:<ficha>#<color>=<cód>/<US$>@<link>@<foto>` (valida que el color exista en la ficha). Web: `pyDeColor`; el renglón
de Probados usa link, foto, código y precio del color, y `pyCanasta` (mensaje para Nissei) usa el código y precio del color
cuando el pedido es de UN solo color. **Qué chequear:** con varios colores pedidos sigue el código de la ficha (aviso rojo);
que la clave del color sea la misma en el robot y la web (minúsculas, no alfanumérico → _).

- **`compray:<fecha>|usd=…|sinpesos` (12/10/2026):** crea un pedido de Paraguay viejo sin los pesos de los dólares (él: *"crealo igual, si faltan cosas me la indicas"*). Queda INCOMPLETO, fuera del promedio, y la falta se lista como los otros gastos. Primer uso: el pedido del 08/09 (ticket US$ 652, sin detalle de productos). Chequear: que sin `sinpesos` siga pidiendo `merc=`.
- **Estado de la caja de cada producto** (probe `cajahoy`, `mllinks.caja`): winning/sharing/losing
  y también nocat/sincaja; un producto sin publicación activa no es "sin dato".
- **Stock en las líneas de tiempo**: por cuenta manda la clave del producto sobre las de color; con
  un color elegido, sólo esa clave.

- **Lo que decide Claude en Pedidos y Armar caja (09/10/2026)**, él: *"hacelo todo vos. que el robot solo pase datos"*.
  `decido:ped:<q>[#var]=u|N|motivo` (cuántas comprar), `decido:ped:<q>=venta|$|motivo` (precio de venta con el que se
  calcula el máximo de compra: el normal, no el subido por escasez), `decido:caja:<q>@<cuenta>[#var]=u|N|motivo`
  (cuántas mandar) y `=auto` para volver a la cuenta automática. Vive en `cyc/claudedecide/{ped,caja}` y vale
  `CL_DEC_DIAS` (4) días. Web: `clPedDe`/`clCajaDe`, override en `syncPedidosAuto` (cantidad y colores), `maxCompraDe`
  (fuente `claude`) y `_repartoVariantes`/`repartoOficina` (`sug[].cl`). `pedidosnotas` muestra precio de hoy, últimos
  cambios de precio y lo ya decidido. Chequear: que una decisión vieja (+4 d) deje de mandar, que la cuenta automática
  siga visible al lado, que con colores sólo valga color por color, y que el máximo no use un precio de escasez.
- **Contestar preguntas solo** (`responder`) apagado con `responder:off`: las contesta Claude en cada vuelta.

- **09/10 · VS en 0 por "remate" (error de Claude):** las marcas viejas del robot no son dato; antes de poner 0 o bajar, `porquebajo` (ventas 180 d y días con stock). Chequear: Xbox azul y las demás marcas liquidando del robot.

- **09/10/2026 · PEDIDOS COMPLETOS (etapa 3, mercadería).** Con SOLO_CLAUDE la web pide sólo lo que decidí; yo decidía mirando `pedidosnotas`, que lee `cyc/pedidos` (= sólo lo ya decidido), así que nunca veía el resto: Pedidos quedó casi vacío (sábanas, Paraguay y Paulvic sin nada). Nuevo `pedidostodo` (solo lee, TODO el catálogo color por color) + `ml-sync/notas/decide_pedidos.py` (ritmo 30/60/180 d, objetivo 30 días, menos Full+casa+camino+viajando, sin ganancia = 0) → `ml-sync/notas/pedidos.txt` → `decido:archivo=pedidos;go`. Se rehace en cada vuelta (rutina CEREBRO 08:52/20:52). Chequear: que cada producto con ventas de 180 d tenga renglón, y que el log de decido diga "guardado" en todos.
  Comando `pedidostodo` (solo lee): ventas 30/60/180 por color (`v.variante` → `mllinks.variant` → título), Full por cuenta y color, oficina, en camino a Full menos lo que ML ya dio de alta (`cyc/cajasentrado`), viajando de Paraguay (`compraspy` en camino) y del Paulvic (`pedidospv`), precio de hoy y cambios de 45 d (`cyc/autoprecio`), y lo que queda afuera (papelera, no traer). La cuenta: `ml-sync/notas/decide_pedidos.py`.

### Cada variante con su propio análisis y su propio 🧠 (12/10/2026, regla suya)
Él: *"cada variante debe llevar su propio análisis y su propio cerebro (…) algunos aromas se pueden vender a 50% y otros al 5%"*.
Todas las variantes son publicaciones aparte (0 con variaciones adentro, medido con `planilla` el 12/10), así que se juzgan por
MLA: precio, margen, stock de ese color, ventas de esa publicación y caja. **Arreglo en `planilla`:** si la publicación es de un
color y no hay clave de stock de ese color, ya no toma el stock del producto entero (Scandal Bliss mostraba 212 = todos los
Paulvic de Adriana): dice `?`. El registro de tandas (`stockhist`) tampoco cae al del producto. Las notas del 🧠 de cada
variante se rehicieron una por una con sus números (`ml-sync/notas/variantes_1210.txt`).
**Qué chequear:** ningún renglón con `#color` muestra el stock del producto; las notas de dos aromas del mismo producto dicen
números distintos.

### La caja de compra orienta, no decide (12/10/2026, regla suya)
Qué es: `price_to_win` es lo que ML quiere que pongamos; manda la venta real. Dónde vive: CLAUDE.md (🥊). Qué
chequear: que ninguna baja se decida SÓLO por "perdiendo"; que lo que pierde y vende no se baje; que la primera baja
de algo parado no regale más margen que el premio de Full (~19%).

### Resultados de precios: la cuenta del supervisor + mi juicio diario (10/10/2026, v23.11)
Él: *"quiero que aparezca todo, desde la primer decisión del robot anterior y que hagas el análisis (…) todos los días"* y
*"no hay reglas (…) quizás esa decisión es buena y está unos días perdiendo y después recupera"*. La tarjeta de Métricas
estaba congelada desde el 09/10 (SOLO_DATOS apagó el supervisor). **Hecho:** `supervisor:medir[:go]` (por ml-sync) sólo
mide y guarda la tarjeta, lista TODOS los cambios con su id y no vuelve nada atrás ni manda Telegram; `supervisor` a secas
con SOLO_DATOS no corre. Cada decisión de `decido` queda además en `cyc/claudecambios/<ts>_<MLA>` (autoprecio guarda sólo
la última) y suma con motivo `claude`. `juzgo:<id>=<gano|perdio|igual|espera|nocuenta>|<texto>;…;go` guarda mi juicio en
`cyc/supervisor/juicio/<id>` y la tarjeta lo muestra (y su color manda sobre el del número). Va en la completa de las 08:52.
**Qué chequear:** que todo cambio medido tenga juicio; que los juicios viejos se revisen cuando cambian los números; que lo
que perdió se piense (volver, seguir, otro precio) y no se vuelva atrás por regla.
**12/10 · llevar al piso va de una:** la sección 🛡️ de `planilla` ya no propone escalón de +25%: el precio que deja 25% en el peor caso se pone directo (él, con la Cinta Boob Tape). Los escalones quedan sólo para la escasez. **Qué chequear:** que ninguna corrección al piso quede a medias.
**12/10:** `juzgo` no aceptaba los cambios con hora en el id (`MLA…_AAAAMMDD_HHMM`, dos cambios el mismo día) y por UN renglón no escribía ninguno. Ahora el id acepta `_HHMM`. **Qué chequear:** que `juzgo:archivo=…` diga 0 renglones con problema.

### Fotos de Probados: el color que se pide, y en mi revisión (10/10/2026, v23.10)
Él con el Joystick Xbox (foto de Paraguay negra, de ML verde): *"claramente no se miró"*. Mi revisión de fotos
(`fotosrev`) sólo cubría "Para probar"; Probados nunca se cruzó. **Hecho:** `pyProbVisHTML(prod, colores)` muestra la
foto de la publicación del COLOR que pide el pedido (`pubDeVariante`, no adivina) y avisa en rojo cuando la ficha tiene
varios colores y un solo código de Paraguay. `fotosrev:probados` lista ficha de Paraguay × cada publicación viva con
las dos fotos (`revfotos.py armar` acepta los ids `p…~MLA…`); va en la completa de las 08:52.
**Qué chequear:** que la foto de ML del renglón sea del color pedido; publicaciones de OTRO producto pegadas a una
ficha (el Joystick tenía pegado un genérico de Xbox 360 con cable).

### Paraguay: el ticket es obligatorio y se ve el descuento (10/10/2026, v23.12)
Él: *"los pedidos que cargo en paraguay siempre tienen descuento de lo que aparece en la web (…) quizás hay productos
con más descuento que otro, o algunos quizás nada (…) agregar el ticket como una info obligatoria para cerrar el
pedido"*. **Hecho:** `compray:<fecha>|det=<cod>*<u>*<pagado>;…|go` guarda en cada renglón `usdWeb` (el precio de la web
del pedido; si ya había ticket, se conserva el de antes) y `usd` (pagado), y marca `ticket {ts, productos, usdWeb,
usdPagado}`. Sin `ticket`, "Ya llegó" (web) y `pyped:llego` (robot) no cierran. La tarjeta del pedido dice "🧾 falta
ticket" o "🧾 −N%", y adentro el descuento total y por producto (web tachado → pagado).
**Qué chequear:** que el `usdWeb` no se pise con el pagado al recargar el ticket; que la ficha nueva nazca con el
precio PAGADO; pedidos viejos en camino sin ticket.
**11/10 · pedidos guardados con el ticket antes del 10/10:** si el renglón ya tenía el precio pagado, el de la web sale del
candidato de ese código (`cyc/candidatos_py`, precio de la lista de Nissei con que se armó el pedido). Chequear que no tome
el precio de un candidato distinto con código parecido (se compara también por el final).
- **`buscacosto` por código (11/10/2026):** si todo lo que se le pasa son números (`buscacosto:137567+164712`), busca el código de Nissei en fichas, candidatos y compras (también por el final). Para cruzar el pedido que Matías pasa como "código x unidades". Chequear: que un código corto no agarre otro producto.

- **📄 Verlo en la lista (18/10/2026, v24.43).** Cada producto de 📋 Listas tiene el link que muestra el renglón TEXTUAL del
  archivo del proveedor (archivo, hoja, fila, título de la sección). Datos: `ml-sync/listasori.json.gz` (lo arma Claude cruzando
  cada código con el archivo que él pasó) → probe `listaori:go` → `mlapi/listasori/<prov>/<código>` → `listaVerOri` en index.html.
  Qué chequear: al cargar una lista NUEVA hay que regenerar el .gz y correr `listaori:go`, si no el link dice "no tengo el renglón".
  Wels vino en fotos (no hay renglón). Iscos: 44 de 3475 no se ubicaron (hojas Hombre/Mujer con códigos armados por talle).

- **Copiar pedido de Listas igual que Paulvic (18/10/2026, v24.44).** En 🧾 Pedido el mensaje es "<nombre tal cual la lista> x<u>"
  por renglón + "SÓLO estos productos…". Sin redondeo (las unidades son las que él carga). Vive en el armado de `_listaVista==='hechos'`.

- **Buscador en todas las listas (18/10/2026, v24.45).** Arriba de 📋 Listas: busca por nombre o código en las listas de todos los
  proveedores (todas las palabras), con proveedor, lo que te sale, % ML, links y casilla para pedir (`listaBuscar`/`_listaBuscarYa`).
  Baja todas las listas la primera vez (Dai Nippon son ~7.800 renglones). El buscador de abajo sigue siendo sólo del proveedor elegido.

- **Sacar una lista por ahora (18/10/2026, v24.46).** `cyc/mlconfig/listasProv/<prov>/pausa` (fecha) la esconde de 📋 Listas y del
  buscador; vuelve desde "⏸️ sacadas por ahora" (`listaPausar`). Las listas sin nada que dé ya no se pueden ver (se sacó el botón).
  Qué chequear: que el robot (`lista`, `listacuenta`) siga haciendo patch y no pise `pausa`.

- **Nunca una lista vieja (18/10/2026).** `lista:<prov>|fecha=AAAA-MM-DD` guarda la fecha en `listasProv/<prov>/fecha` y rechaza
  una lista con fecha anterior. Qué chequear: que cada carga nueva lleve `|fecha=`.

 · **Ritmo normal sólo de las cuentas que venden el producto (v24.61, 19/10/2026, con el F9).** `ritmoNormalDe` (web) saltea las cuentas donde todas sus publicaciones de ese producto están pausadas a mano, cerradas o "no la vendemos más" (`_ctaVendeProd`). Chequear: un producto agotado en su cuenta (pausado por falta de stock) sigue contando.

- **20/10/2026 · v25.42 · Listas: la línea de arriba suma entera** (etapa 3, mercadería). Él vio "7777 productos · 3154 medidos · 18 sin medir" y preguntó por el resto: los otros ~4.600 estaban clasificados (sin el mismo producto en ML `sc`, nadie lo vende `sv`, afuera por regla `fz`) y la línea no lo decía. Ahora dice las cinco partes y suman el total. `listaestado[:prov]` (solo lee) da lo mismo por proveedor, con los motivos de "afuera" y los que faltan medir. Chequear: que las cinco partes sumen el total; que "sin medir" baje a 0 después de `listamedir`.

- **20/10/2026 · Listas: el robot traduce los nombres abreviados antes de buscar en ML** (etapa 3). Dai Nippon escribe "COMFORT CONC.CuidESENC.(DOY) 450 ml. 4": palabras pegadas, abreviaturas, el código interno entre paréntesis y la columna del tamaño repetida y cortada. Con eso 4.605 de 7.777 quedaron "sin el mismo producto en ML" o emparejados con otra cosa (F50 de un protector solar contra una brocha F50). `limpiarNombreLista` (sync.mjs, antes de `correrPyCatMedir`) arma el nombre para buscar y comparar (marcas: RV.→Revlon, RML→Rimmel, MB.→Maybelline…; abreviaturas: CrDEN→crema dental, JbLQ→jabón líquido, SH.→shampoo…; corta después de la primera medida; saca códigos internos; (F50)→fps 50). El nombre de la lista no se toca. Lo que había quedado `sc`/`sv` se vuelve a buscar una vez con el nombre nuevo aunque esté fresco (`qv` ≠ `LISTA_NOMBRE_VER`); al cambiar el traductor, subir `LISTA_NOMBRE_VER` y se rebusca todo de nuevo. Y `listamedir` reintenta cuando ML devuelve una página (HTML) en vez de datos, como con el 429. Chequear: cuántos de los 4.605 pasan a medidos; que lo nuevo emparejado sea el mismo producto (los "da" igual necesitan el ok del chat de compras).
- **20/10/2026 · Una lista con PRIORIDAD le gana a Paraguay en la vuelta de cada hora, y de noche la vuelta dura 50 min** (etapa 3). Él: *"nippon es la más importante ahora"* y *"en las horas de 02am y 08am nadie mira las ventas. ahí podés utilizar el 100%"*. La medición de Paraguay (`ml-pycat`, cada hora) y la de Nippon (a mano por ml-consulta) se repartían el mismo cupo de ML y cada una iba a media máquina. Ahora `cyc/mlconfig/listaPrioridad` (comando `listaprioridad:<prov>|-[:go]`) hace que `pycatmedir` mida ESA lista entera (hasta 5.000) y, cuando no le queda nada pendiente (`correrPyCatMedir` devuelve `quedan`), borra la marca y sigue con Paraguay en la misma vuelta. De 02 a 08 de acá la vuelta dura 48 minutos (`opts.maxMin`; el job corta a los 55), de día 40, y si a la lista le queda algo el robot deja `/tmp/pycat_seguir` y el paso "Seguir de noche" de `ml-pycat.yml` (permiso `actions: write`) larga la vuelta siguiente al toque: GitHub saltea la mayoría de las corridas de cada hora (28 en 5 días). De día sigue el reloj de cada hora. Con prioridad puesta NO largar `listamedir` a mano: las dos corridas armarían la misma cola; para adelantar, largar `ml-pycat` (concurrency lo pone en fila). Chequear: que la marca se borre sola al terminar, que Paraguay vuelva a medir y que de noche las vueltas salgan una atrás de la otra.
- **20/10/2026 · v25.46 · Listas: tres grupos que no se mezclan** (etapa 3). Él: *"si mide 10 y 6 no están en ML, no quiere decir que no estén medidos, sino no encontrados. son otro grupo"*. La línea de arriba de cada lista (index.html) y `listaestado` dicen ✅ encontrados en ML y medidos · 🔍 buscados y no encontrados (sin el mismo producto / nadie lo vende) · ⏳ por buscar (nunca buscados + los `sc`/`sv` con `qv` distinto de `LISTA_NOMBRE_VER`, que el robot vuelve a buscar traducidos) · 🚫 afuera por regla. `LISTA_NOMBRE_VER` está en los dos archivos y van juntos. Al hablar con él: "medidos" son sólo los encontrados. Chequear: que los cuatro sumen el total de la lista.
- **20/10/2026 · `listarevisar` también saca los que tienen ventas y les falta el ✅** (etapa 3). Antes salían sólo los sin `vend`; los que tenían ventas cargadas antes de la regla del ✅ (`listaOkVale`) quedaban en "Para revisar" sin que nadie los mirara. Ahora sale todo lo de 25%+ con costo vigente al que le falte `vend` o el ✅ de ese catálogo (no los de menos de 100 ventas), DA primero y del margen más alto al más bajo, con una columna más: qué falta (`ventas+ok` / `ventas` / `ok`). Lo usa el prompt del chat de la PC (`ml-sync/PROMPT_LISTAS.md`). Chequear: que al cargar `listadato …,ok` el producto salga de la lista.
- **20/10/2026 · v25.47 · Las listas de Bs As (Dai Nippon) no tienen pedido** (etapa 3). Él: *"en dai nippon no se hacen pedidos, se trabajan igual que en resto de bs as. eso lo trae mi viejo personalmente"*. En la solapa 📋 de Bs As no está 🧾 Pedido, `listaProbCasillaHTML` no dibuja "📋 pedir a …" para listas con `bsas`, y en 🆕 Nuevos (y en el buscador) lo que da dice "da · lo trae Tito" en vez de la casilla de unidades. Los probados son tarjetas de Pedidos como las de De siempre. Chequear: que ninguna tarjeta de Bs As tenga casilla de pedir a una lista y que las listas que no son de Bs As (Iscos, Wels…) sigan con su 🧾 Pedido.
- **20/10/2026 · v25.48 · El "otro producto" de una lista vale sólo para el catálogo que se miró** (etapa 3). `listaestado` mostró 490 de los 674 de Nippon con 25%+ marcados `noEs` (el chat de compras los miró el 18/10, cuando el robot buscaba con el nombre abreviado y traía cualquier cosa). La marca era del producto y no del catálogo: aunque el robot encontrara el correcto, quedaban afuera para siempre. Ahora `listaNoEsVale` (sync.mjs) / `_listaNoEsVale` (index.html) exigen que `noEsCat` sea el `mi` de hoy; `listadato …=no` guarda `noEsCat`, `ok` lo borra; las marcas viejas lo reciben (el `mi` de antes) la primera vez que se vuelven a medir. Los `noEs` sin `qv` se vuelven a buscar con el nombre traducido aunque estén frescos, y la búsqueda saltea el catálogo rechazado. Chequear: que un `noEs` con catálogo nuevo salga en `listarevisar` y no cuente como dado hasta el ✅.
- **20/10/2026 · v25.49 · Arriba de cada lista: evaluados y sin evaluar** (etapa 3, reemplaza la línea de v25.46). Él: *"poné los productos evaluados y los no evaluados, con sus números de cuántos dan bien, cuántos no"*. Cada producto cae en UN grupo (`_grp` en `renderListas`): ya es ficha · afuera (sacado, `noWeb`, `fz`) · ⏳ sin evaluar (nunca buscado, `sc`/`sv`/`noEs` con `qv` viejo, o costo no vigente) · ✅ evaluados: 🟢 `_listaDa` · 🔎 `_listaRevisar` · ⚫ no está en ML (`m` null) · 🔴 no da. Chequear: que los grupos sumen el total.

### Etapa 3 · 26/10/2026 · 📷 Las fotos del ticket que me pasa por el chat se ven en el detalle
Él: *"los cargaste para poder verlo en el detalle del envío? siempre quiero ver"*. Antes sólo quedaba "la vio Claude" (`pyticketvisto`)
porque la foto no podía pasar por el repo ni el registro (públicos). Ahora viaja CERRADA: `ticketllave;go` crea la llave del robot (la
privada en `mlapi/ticketllave`, nunca en el repo); yo cierro cada foto con la pública (AES-256-GCM + RSA-OAEP 3072) en
`ml-sync/cifrado/<pedido>/*.enc` y `ticketsube:<pedido>;go` (ml-sync) la abre y la sube igual que el 📷 de la web
(`mlapi/pyticketfoto/<id>/<ts>`, con huella `h` para no subirla dos veces) y anota `ticketFoto`. El registro sólo dice tamaños.
- **Qué chequear:** que la foto se vea en el detalle del pedido; que `ml-sync/cifrado` siga fuera de la web (`.assetsignore` tiene `ml-sync`);
  que nunca se imprima `priv` ni la imagen.

### Etapa 7 · 26/10/2026 · v26.79 · 💵 Plata por día con promedio de 15 días
Él: *"línea en vez de 7 días 15 días"*. `LN_PROM_DIAS=15` en la línea de cada producto y en la general (los 14 días de antes del gráfico
se suman solos). Qué chequear: que la línea arranque desde el primer día del gráfico cuando hay datos de antes.

### Etapa 3 · 26/10/2026 · v26.78 · Elegancia apagada
Él: *"eliminá elegancia. nunca se usa y genera problemas"*.
- **Qué es:** la web ya no deja elegir Elegancia ni muestra la fila "Proveedor:" (`PY_PROVS_VER=['nissei']`; quien la tenía guardada
  vuelve a Nissei). Sigue en `PY_PROVS` a propósito: así sus fichas y candidatos (`prov:'elegancia'`) NO se cuelan en las listas de Nissei.
  El robot no mide su catálogo (`EL_…`) ni arma `cyc/pycatres_el` (`PY_ELEGANCIA_OFF`). No se borró ningún dato.
- **Qué chequear:** que en Nissei no aparezca nada de Elegancia (probados, nuevos, pedido del momento); que la vuelta de `pycatmedir`
  no cuente los `EL_` como pendientes. Para volver: `PY_PROVS_VER` + `PY_ELEGANCIA_OFF=false`.

### Etapa 3 · 26/10/2026 · v26.77 · 🪄 Llenar con probados y nuevos · ⛔ lo mirado hace 7+ días no se pide
Él: *"otro boton que sea llenar con nuevos y probados. entonces poner primero todos los productos probados las unidades que pide y que de
mas de el 35% o mas de ganancia y lo que resta todos productos nuevos siempre desde el que mas gana y vende (el boton de estrella) y que
avise en rojo todos los productos que fueron revisados hace 7 o mas dias en paraguay. porque pudo modificarse el precio o el stock y que
no deje perdirlo"*.
- **Qué es:** botón 🪄 *Llenar con probados y nuevos* en el 🧾 Pedido del momento (también vacío). 1º probados: lo que pide Pedidos (por
  color si Pedidos lo pide por color), sólo `pyProbVeredicto`='da' (35%+ con el precio de hoy), lo ya cargado no se toca. 2º nuevos: con lo
  que queda del tope, orden ⭐ (`candCombo`), mismos filtros que el botón viejo. Lo mirado en Paraguay hace 7+ días no entra y se lista.
- **⛔ 7+ días:** `PY_VIEJO_DIAS=7`. Nuevos: la fecha más nueva entre `visto` y `ts` (`candViejoPy`); probados: `nisseiTs` (`pyProbViejo`).
  Frena: `candPuedePedir` (casilla, los dos botones de llenar), `pyArmSet`/`pyArmSetVar`/`pyArmSugeridas` (sólo al SUMAR), el 📋 mensaje
  para el proveedor (no sale si hay uno cargado en rojo) y *Ya lo pedí*. Bloque rojo `pedViejosLista` arriba del pedido con código y días.
  En el robot, `pedir` tiene la misma regla. `pyped:repo`/`pyped:nuevos` (lo ya pagado) NO se frenan: si pagó, se registra.
  `pyProbVeredicto` pasó de "más de 7" a "7 o más".
- **Dónde vive:** `index.html` (`pedLlenarTodo`, `pedLlenarTodoPlan`, `pedViejosLista`, `_pedNuevosEscribir`, `candViejoPy`, `pyProbViejo`);
  `sync.mjs` (`PY_VIEJO_DIAS`, comando `pedir`); la rutina del chat de Chrome (parte 3) mira también la lista roja.
- **Qué chequear:** que la rutina diaria (`ofi`… buzón) renueve las fechas (con `pyprecio`/`candprecio`) y la lista roja baje; que el
  botón no cargue un probado que Pedidos no pide; que el tope cierre (probados + nuevos); que un candidato devuelto con ↩︎ no se cuele como
  fresco: ↩︎ renueva `ts` sin mirar el precio, así que guarda `renovTs`/`renovDe` y vale la fecha de antes (`candVistoTs`, `candVistoTsBot`).

### Etapa 3 · 21/10/2026 · v25.94 · 🛒 Para comprar en el local (Dai Nippon y toda lista de Bs As)
Él: *"Dai Nippon no trae fotos ni código de barras (…) mi viejo compra personalmente en el local, siempre desde el celular. Que le
aparezca la foto de ML, el precio de la lista, el precio máximo a pagar y las unidades (…) al clickear en la tarjeta, sino es un lio"*.
 · **Dónde vive:** `index.html`, arriba de la solapa de una lista con `bsas` en Pedidos → Bs As (`listaLocalHTML`, `listaLocalFilas`,
   `_llTarjeta`, `#ll-box`). Junta los nuevos de `cyc/listas_pedido/<prov>` y los probados de `cyc/listas_pedido_prob/<prov>`,
   ordenados por la primera palabra del nombre (marca). Tarjeta chica (foto + nombre + "Comprar N u."); al tocarla: foto grande de
   ML, título de ML, "⚠️ Fijate" (tamaño, pack y palabras del título de ML que la lista no dice, `_llFijate`), precio de la lista,
   "Pagá como máximo", unidades y tres botones.
 · **El máximo:** nuevos = la cuenta del robot (`cuentaCandidato`) dada vuelta con el margen `m` medido al costo `uMed` (`_llMaxNuevo`):
   C* = C0·(1+m)/1,25 + (A+E)·(m−0,25)/1,25, con el IIBB de la cuenta que da el MENOR (no se sabe la cuenta) y sin el recargo del
   proveedor (precio de la lista). Probados = `maxCompraDe(pr,25,color).usd` × dólar ÷ (1+recargo); si no hay (precio de venta sin
   decidir, `SOLO_CLAUDE`), la misma cuenta que un nuevo con su renglón de la lista. Sin dato: "sin máximo: no comprar".
 · **Lo que marca Tito:** `cyc/listas_local/<prov>/<cód o prodId[__color]>` = {estado compro|noestaba|otro, u, p, ts, tipo, prev?}.
   "Era otro producto" en un nuevo escribe `mlapi/listas/<prov>/<cód>` noEs=1, ok=null, noEsCat=mi (como `listadato …=no`) y lo saca
   del pedido; "deshacer" lo devuelve todo (`prev`). Lo marcado que salió del pedido se sigue viendo 7 días.
 · **Regla cambiada:** en las listas `bsas` un nuevo se puede cargar con 25%+ y 2+ vendedores sin el ✓ de mismo producto
   (`_listaDa(e,k)`); la tarjeta del local dice "sin confirmar: mirá bien la foto". noEs/noWeb/noFull siguen frenando.
 · **Qué chequear:** que el máximo de un nuevo dé ≥25% con el robot (probado: 25,4% y 26,3% con los dos IIBB extremos); que el robot
   no lea `cyc/listas_local` todavía (nadie lo usa para costos: el precio pagado real queda anotado, no mueve la ficha); que el
   "otro producto" del local y el `listadato` del chat no se pisen.

### Invictus y Phantom no vuelven a la caja ni al pedido (24/10/2026, completa de las 03:00)
- **Qué es:** ML los dio de baja para siempre (él, 24/10). `decide_cajas.py` los volvía a proponer cada noche (4 y 3 a Full, porque
  hay en la oficina) y `decide_pedidos.py` les ponía el motivo "lo pedimos y no vino". Ahora los dos scripts los dejan en 0 con
  el motivo real ("ML lo dio de baja… lo de la oficina va al local"). `nomandar` no sirve: frena TODO el Paulvic de Adriana.
- **Dónde vive:** `ml-sync/notas/decide_cajas.py` (`BAJA_ML`) y `decide_pedidos.py` (mismo par, en el renglón de "no viene más").
- **Qué chequear:** que la completa ya no tenga que corregirlos a mano · si otro aroma pasa a dado de baja, agregarlo a los DOS.

## 4 · CHOQUES Y FALLAS MUDAS (jueves · junta las viejas 4 y 5)

### 📲 Telegram cuando ML da de baja una publicación y cuando la vuelve a habilitar (26/10/2026, pedido suyo)
- **Qué es:** el aviso "⚠️ Problema en una publicación" (cerrada, en revisión, inactiva, falta de papeles/facturas) vuelve a salir por Telegram (con SOLO_DATOS había quedado sólo en `mlapi/cerebroavisos`); y cuando una que avisó vuelve a estar bien sale "✅ ML la volvió a habilitar". Una vez por cambio de estado (`mlapi/pubalert`), tope 8 por vuelta.
- **Qué chequear:** que al estrenarlo no llegue una catarata (lo que ya estaba inactivo no es novedad) · que una pausa nuestra (fuera de Full, sin stock) NO avise · que las 3 en revisión para siempre no avisen el alta.

### La ficha nunca decía "Nissei NO lo tiene" (26/10/2026, vuelta de las 21:22)
- **Qué es:** `fichaExtras` miraba `pr.nisseiNoHay || pr.pyNoHay`, que no los escribe nadie; la marca real es `cyc/py_sinstock/<prodId>` (la usan la web y `escasez`). El Cuba Prestige salía "se repone de Paraguay" sin reposición. Ahora la ficha lee `cyc/py_sinstock`.
- **Dónde vive:** `sync.mjs`, `fichaExtras` y la carga de la ficha (`pySinF`).
- **Qué chequear:** `ficha:MLA2155294207` dice "Nissei NO lo tiene". Pendiente: la sugerencia "+30% #techo" de `ventasraras` y del detector 🆕 no mira si está en escasez o sin reposición.

### Vínculos sin cuenta en la sección 11 del informe (25/10/2026, auditoría)
- **Qué es:** el Timer MLA1474412507 vendió 11 en 30 d (la última el 23/10) y el informe lo mostraba "en revisión" sin cuenta. Un vínculo sin `cuenta` no lo refresca la vuelta de cada hora (recorre sólo los de su cuenta) y `unapub` lo lee con el token de otra cuenta (403): el estado queda viejo. Ahora la 11 pregunta a ML con el token de cada cuenta (comparando el vendedor) de quién es y cómo está hoy.
- **Dónde vive:** `sync.mjs`, `informe`, sección 11.
- **Arreglo:** el alta de nuevas (`altaDeNuevas`, cada hora y `altanuevas:go`) ahora le devuelve la `cuenta` a todo vínculo de su catálogo que la perdió (antes lo salteaba porque el vínculo "ya existía").
- **Qué chequear:** que la 11 ya no muestre "sin cuenta"; de dónde salen los vínculos sin `cuenta` (qué los escribe).

### `techo95;go` era "comando desconocido" (25/10/2026, vuelta de las 21:22)
- **Qué es:** CLAUDE.md dice `techo95[;go]`, pero el robot sólo reconocía `techo95` o `techo95:<MLA>`: con `;go` salía "comando desconocido" y nunca anotaba el 🏔️, así que F1 seguía frenando lo nuevo con techo ya medido (microSD Pokémon, 90% con umbral de 81% a los 15 días). Ahora acepta `techo95;go`. Revisados los otros 162 comandos con el mismo molde: ninguno más tenía la forma `;go` sin `:` documentada.
- **Dónde vive:** `sync.mjs`, bloque `techo95`.
- **Qué chequear:** `techo95;go` corre y anota; `techo95:<MLA>;go` sigue andando.

### 2b del informe: las 4 cuentas juntas (24/10/2026, auditoría)
- **Qué es:** el 24/10 las 4 cuentas vendieron 19 en 24 h contra ~46/día y el informe sólo marcaba ⚠️ Adriana (cada cuenta sola no llegaba al tercio). Ahora la 2b tiene un renglón "LAS 4 JUNTAS" contra el promedio de 14 días y contra el mismo día de las 2 semanas anteriores; si cae abajo del 60% de los dos, ⚠️ y dice cuántas subas mías de las últimas 36 h hay y cuánto vendieron contra lo esperado.
- **Dónde vive:** `sync.mjs`, `informe`, sección 2b.
- **Qué chequear:** que el sábado flojo normal no dispare (compara contra el mismo día de la semana) y que el renglón de subas use sólo subas (`a > de`).
- **24/10/2026 · horario para resolver** (él): tarea de las 10:00 (sólo lo urgente antes de las 12:30) y de las 12:30 (todo lo demás). **Dónde vive:** `trig_01XcMnTFRBwdBa5kgH1b2hko` y `trig_011SxsjVECrbY9b8ZkkhdBUT`, en la sesión de compras/decisiones; CLAUDE.md §1. **Qué chequear:** que la de las 10 no traiga decisiones (a)/(b) y que la de las 12:30 no repita lo que ya contestó.

- **LAS 2 DECISIONES DE LA ETAPA 4 DEL 20/10/2026, CERRADAS (v25.45).**
  · **1a · lo privado viaja CIFRADO.** `ml-sync/listasori.json.gz` y `ml-sync/notas/listaweb_iscos.txt` (precios de proveedores)
    salieron del repo público: ahora son `ml-sync/privado/<nombre>.enc`, cifrados con `ml-sync/tools/cifrar.mjs` y la llave pública
    de los comprobantes (`ml-sync/tools/comprob.pub.pem`); el robot los abre con `leerPrivado(db, nombre)` (sync.mjs, arriba de todo)
    usando la privada de `mlapi/comprobkey`. Lo usan `listaori` y `listaweb`. **Toda lista nueva de un proveedor que se suba al repo
    va cifrada así, nunca legible.** Qué chequear: que no aparezca ningún `.json`/`.txt` de proveedor suelto en `ml-sync/`, y que
    `listaweb:iscos` (sin `;go`) abra el archivo. Ojo: el historial de git todavía tiene las versiones viejas legibles.
  · **2 · "cuando se cancela una venta se cancela y listo" (regla suya).** El robot marca `canceladaML: true` en toda venta que
    cancela ML (alta nueva cancelada y la que pasa a cancelada). La web no muestra ↩ Reactivar en esas (ni en las canceladas sin
    `manualTs`: la web siempre lo pone al cancelar a mano) y dice "🔒 la canceló Mercado Libre"; `vpReactivarGrupo` también se niega.
    Reactivar queda sólo para lo que él canceló a mano. Qué chequear: que una cancelación nueva del robot traiga `canceladaML`.
- 20/10/2026 · Etapa 4 · **Fallas leídas como dato en el robot (8 arreglos).** `planilla` no arma 🏷/📦/🤔/🔎/📈 sin `cyc/estrategia` o `cyc/stockhist` (`faltaTag`) · `escasez` corta 🔥/🚨/🔁 si no lee stockhist, py_sinstock, noconsigo, ofientro, notraer, compraspy o compraslista (`noLeiE`); si falla la línea de UNA publicación de un producto×cuenta, esa clave usa el ritmo de ventas + stock (`linRota`); el expediente marca "de anoche" el precio que ML no contestó · un día de la línea cuenta "con stock" sólo si se sabe (`diaConStock`: ficha, reaccionesDe, fichaExtras, raros, escmedir, lupa; las fichas muestran menos días medidos, a propósito) · con `miFijo`, si ML no contesta no se mide otro catálogo y `listaOkVale` (robot y web) exige `mi === miFijo` · `analizapromo` sin `cyc/promoclaude` no dice mías/ajenas (`permFalla`) · `decido` caja sin `cyc/claudedecide/caja` no escribe esa caja · `ventasraras` dice "no sé" sin `promoventa` · `ficha:go` guarda opiniones a medias sin renovar la fecha y marca `incompleta` (la web lo muestra) · `linea` saltea la publicación si no lee lo que había. **Chequear:** ningún `catch {}` que dé `{}` en algo que decide; `listaOkVale` igual en los dos lados; todo ritmo sobre `mlapi/linea` con `diaConStock`.
- 20/10/2026 · Etapa 4 · **Web: doble toque, descuentos mudos y privacidad.** Candado por botón (`conCandado`, `_candados`) y contador `_opsEnCurso` en "Ya lo pedí"/"Pedido hecho"/"Llegó"/cerrar y deshacer caja; la recarga por versión nueva espera a que terminen. "📦 Llegó" de Listas se adueña del pedido con transacción camino→llegado antes de crear fichas (no pisa `pagado:true` ni `ofiAlLlegar`; si falla una ficha vuelve a camino). `clDescontarPed`/`clDescontarCaja`/`clDevolverCaja` devuelven true/false y el que llama avisa (`clAvisarFallo`); los renglones van con `dp:1` y pasan a `desc:1` sólo después de descontar (`_marcarDescItems`; Paulvic `desc` por aroma); la resta de `syncPedidosAuto` cuenta los `dp` sin `desc`. `pedNumerar` con transacción (sólo si existe y no tiene número). `_listaCache` se tira si cambia `mlconfig/listasProv/<prov>` (`_listaCacheRevisar`) y "Ya lo pedí" relee la lista. Privacidad: `tgalertas` y `TELEGRAM_TEST` con `_tgMask` y elección por últimos números; `mlGet` tapa números de 10+ cifras en el error (`tapaIdsLargos`, lib.mjs) y `campos`/`posventa`/`unreclamo` imprimen rutas tapadas. **Chequear:** ningún renglón con `dp` y sin `desc` en `compraspy`/`compraslista` (falló un descuento); Pedidos no resta dos veces; el registro no muestra números de orden, paquete o chat enteros. Pendiente: `pyped:repo` del robot escribe `desc:1` antes de descontar.
- 20/10/2026 · Etapa 4 · **Web y robot escribiendo lo mismo (6 arreglos).** (1) Venta borrada que resucita: si estaba al empezar la vuelta y al releerla no está, no se recrea; si existe con marca en `cyc/ventaborrada`, no se reescribe y el log dice "🧟 resucitada, borrala de nuevo". (2) Precio de Paraguay cambiado sin medir (`usdAntes` + `calcTs:null`): `candPrecioViejo` frena `candPuedePedir`/Llenar, la tarjeta muestra el % gris "medido a US$ X", y `pedir` igual. (3) `vincular`/`fijarvar` mueven las ventas viejas con `reasignVentasMlaBot` (copia de `reasignVentasMla` de la web + salteo de `manualTs`: si se toca una, la otra). (5) `compray` no pisa `ts` del pedido. (6) `BACKFILL_RECLAMOS` sólo crea las ventas que faltan y respeta las borradas. (7) `vpSaveEdit` saca `sinVincular`; RETRO-RELLENO y AUTOLINK paso 2 saltean `manualTs`. **Chequear:** todo comando que cambie una vinculación mueve sus ventas como la web; toda escritura en ventas respeta `manualTs` y `ventaborrada`.
- 20/10/2026 · Etapa 4 · **Corridas canceladas, errores de ML y ml-daily dos veces.** GitHub cancela mandando SIGINT sólo al bash del paso: node quedaba huérfano y `CORTAR` nunca se prendía. Ahora `corre` en los bucles de ml-sync.yml/ml-consulta.yml (cada comando deja `##### ✓ terminó`), `corre`/`cortado` en ciclo.sh, `exec` en los pasos de un solo comando y `_cortarCiclo` en sync.mjs antes de cada tanda de escrituras. `mlGet`/`mlRefresh` (lib.mjs, `_recorte`) dicen el código cuando ML contesta HTML. `ef`/`nm` en `mlapi/pycat/<cód>`: 3 fallas seguidas (no 429) = "ML no deja medirlo", se reintenta a los 7 días. Probes `nochehecha`/`nochehecha:anotar` (`mlapi/daily/<día>`): la 2ª y 3ª corrida programada sólo corren la línea para atrás; si un paso falló, la noche no se anota. `webpush` en `CONSULTA_NIEGA`; el viejo `lista` es `avisolista`. **Chequear:** al cancelar, el registro dice "✋ Cancelaron la corrida" y no corre nada después · ningún paso nuevo usa `node` sin `exec` o `corre` · los errores de ML dicen el código · ningún paso de ml-daily tiene dos `if:`.
- `mlapi/lineatodo` lo escriben `ritmo:go` (noche) y `lineatodo:go` (ml-consulta): los dos con la
  misma función `calcLineaTodo`.
- **El guardián de promos relee mis promos antes de sacar una (20/10/2026).** La vuelta completa leía `cyc/promoclaude`
  una vez al arrancar: el descuento del Mazo Poker azul (prueba del tachado) se entró a las 13:37 con la vuelta ya andando
  y a las 13:44 lo sacó. Ahora `removeStartedPromos` relee `cyc/promoclaude/<MLA>` antes del DELETE; si no puede leer,
  no saca. Chequear: una promo entrada con `entrarpromo` durante la vuelta de la hora sigue puesta en la siguiente.

### 4b · FALLAS MUDAS Y PRIVACIDAD (antes etapa 5)
- **Visitas de la noche** (`linea:go`): el pedido en lote falló callado desde ~01/10. Ahora hay
  respaldo publicación por publicación y el log dice "visitas: N con dato". Chequear que el número
  no caiga a 0.

- **Promos "sin leer" que no eran falla (15/10/2026, auditoría):** ML contesta 400 a la consulta de promos de una
  publicación cerrada, inactiva o en revisión. Se contaban como "sin leer" (55 fijas, "hace 388 horas seguidas") y tapaban
  una falla real. `PROMO_NO_APLICA` (sync.mjs) las saca de la cuenta en la vuelta de la hora, en `sacapromos` (que las
  cuenta aparte) y en el chequeo. Chequear: con un 400 en una publicación ACTIVA o pausada sigue contando como sin leer.

### Aviso de venta: suma la compra entera (16/10/2026)
`avisarVentasNuevas` agrupa por cuenta + `numVenta` (también órdenes de otra vuelta) antes del corte de $10.000. Qué chequear: un carrito de 2+ productos que pasa $10.000 avisa.

### 4c · AVISOS DE TELEGRAM QUE LEE CLAUDE (antes 5 bis, 08/10/2026)
- `sendAlerta` guarda copia de cada aviso que SALIÓ en `mlapi/alertaslog/<ts>`; probe `alertas[:horas]` (solo lee,
  tapa números largos). Una rutina de Claude los lee y resuelve lo que puede
  (2 por día, 10:47 y 22:47, `alertas:12`: la ventana tiene que tapar las 12 h entre vueltas) · desde el 08/10 a la tarde (reemplaza la 2a) la rutina ES la que decide los precios (ver etapa 1, `decido`). Chequear: que sólo se guarde lo que
  salió, que no quede nada de terceros en el texto impreso, y que el log no crezca sin fin (podar a 30 días).
- **Los avisos pasan por el cerebro antes de Telegram (08/10/2026, v22.67):** `cerebroDeAvisos(text,opt)` en
  `sendAlerta`: `info` y "Con stock en Full y siguen pausadas" (lo resuelve la noche) no salen; lo demás sale con
  "🧠 Pasó por el cerebro: esto no lo puede resolver solo", salvo `directo` (recordatorios y chat nuevo del bot).
  Todo queda en `mlapi/cerebroavisos/<día>/<ts>` (se borran los días 15-21 para atrás una vez por corrida).
  Chequear: que algo que sí pide una decisión no caiga en "resuelto" · que un aviso nuevo que sólo informa vaya
  con `{ info: true }` · que la rutina de Claude decida los precios con `decido` (etapa 1).


- **Aviso de cada venta nueva (15/10/2026, pedido suyo, eligió 1a 2a 3a):** `avisarVentasNuevas` en sync.mjs, al
  final de cada vuelta del ciclo: UN mensaje con las ventas nuevas de esa vuelta (cuenta · hora · producto y color ·
  precio · ganancia en $ y % con emoji de nivel 🔴<25 🟢 🩵45 🔵70 🟣130 💎200 · ≈ si el neto es estimado) y cómo va
  el día. Tipo `'venta'` en `TG_PERMITIDO`, va al chat del resumen (`TG_CHATS`: él y Tito). Memoria
  `mlapi/avisoventa/<id>` (+ `_ini`), sólo ventas de las últimas 3 h, la primera vez anota sin mandar, se anota
  sólo si salió, sin memoria legible no manda. Ganancia con `armarCostoWeb` (la regla de la web). Chequear: que no
  repita · que un relleno viejo no dispare una avalancha · sin nombre de comprador ni número de orden.
  **Y vibra y suena en el teléfono (v23.44, él: "ya lo tengo en el inicio en iphone"):** el mismo aviso va por push
  (`enviarPush`, librería `web-push` en `ml-sync/package.json`). Llaves VAPID las arma el robot la primera vez
  (`vapidKeys`): privada en `mlapi/vapid` (NUNCA al repo ni al registro), pública en `cyc/mlconfig/vapidPublic`; no se
  pisan nunca. Cada teléfono toca "🔔 Activar aviso de cada venta" (Inicio o Ajustes) y queda en `cyc/pushsubs/<clave>`
  ({endpoint, keys, pub, disp}); 404/410 = se borra solo. `sw.js` muestra el aviso (vibra) y al tocarlo abre Ventas.
  Se anota como avisado si salió por Telegram O por algún teléfono. Probe `webpush[:go|:probar]` (ml-sync). Chequear:
  que la llave pública de la base sea la de `mlapi/vapid` · teléfonos anotados · que el registro no imprima endpoints.
  **Por Telegram se dio de baja el mismo día** (él ya lo activó en la web): `AVISO_VENTA_TELEGRAM = false`. Queda sólo el push. **Horario de descanso 00:30-10:00 de Argentina**
  (`AVISO_VENTA_DUERME`): las ventas de esa franja quedan en `mlapi/avisoventa_pend` y salen en la primera vuelta después de las 10:00, con el mismo corte de $10.000 por compra entera (16/10/2026, pedido suyo). Chequear: que la lista se borre sólo si el aviso salió.
- `candprecio:prov=elegancia;…` (16/10/2026): toca sólo los candidatos de ese proveedor (sin `prov=` sólo Nissei). Las ventas de ML de publicaciones ajenas no se pueden leer ni por la API (403) ni por la página (pide iniciar sesión): las carga el chat de compras con su navegador. Chequear: que una carga de Elegancia no mueva el precio de un candidato de Nissei con código parecido.

- **Informe 7b: reclamos abiertos y mensajes sin leer (auditoría del 10/10/2026):** el `chequeo` veía 3 reclamos
  abiertos (uno de Matías de 2 días con "podés: reembolsar, mandar mensaje, abrir disputa") y 3 mensajes de
  compradores sin leer, y el `informe` no: su sección 7 sólo miraba ventas canceladas de esas horas. Ahora la 7b
  pregunta a ML los reclamos abiertos de las 4 cuentas (producto, días, motivo, qué te deja hacer ML; ⏰ los que
  esperan respuesta) y cuántos mensajes de posventa hay sin leer. Chequear: sin número de orden ni texto del
  comprador en el registro; que un 429 diga "no pude leer" y no "0 reclamos".

 · **Informe 7b (auditoría 19/10/2026):** los mensajes de compradores sin leer salen por cuenta (sin el texto). Chequear: que la suma coincida con el título.

### `ventasraras:nuevas` se caía con una venta de gemela cuya Clásica tiene techo anotado (24/10/2026, vuelta de las 11:52)
- **Qué era:** vendió la gemela Premium de los Naipes Casino. El 🧭 calculaba "tiene techo" con la Clásica pero al escribir el texto leía
  `tf[<gemela>].probado` (no existe) → "Cannot read properties of undefined (reading 'probado')". Se perdía la lista 🔬 y el 📌 con el número
  para `ventasvistas`, así que la vuelta no podía cerrar las ventas.
- **Arreglo:** el texto usa el mismo registro que el cálculo (`tfM`, el de la Clásica) y, si esa parte se cae igual, el 📌 sale igual.
  Busqué el mismo patrón (`tf[mla].`) en el resto del robot: ninguno más.
- **Dónde vive:** `sync.mjs` → `ventasraras`, bloque 🧭 ESTRATEGIA DE LO QUE VENDIÓ.
- **Qué chequear:** una venta de gemela con techo anotado en su Clásica sale con "techo probado $…" y el 📌 aparece siempre.

### `bajastecho` marcaba ❌ las bajas que él autorizó (24/10/2026, vuelta de las 15:52)
- **Qué era:** los 17 Paulvic que volvieron de $21.990 a $14.990 con su "autorizo" salían como ❌ "sin escalera / sin certeza". La regla
  de la vuelta dice "toda ❌ del día se deshace": una vuelta podía deshacer algo que él pidió. El detector `errores` ya los daba bien (✅).
- **Arreglo:** si el cambio guardó `aut` (salida 🔐 autorizada), sale "✓ 🔐 la autorizó él" y no cuenta como ❌.
- **Dónde vive:** `sync.mjs` → `bajastecho`.
- **Qué chequear:** `bajastecho:1` después de una autorización: el renglón con ✓ 🔐, y una baja mía sin autorización sigue en ❌.

## 6 · IDEAS NUEVAS (sábado)
- **✅ LAS 24 IDEAS DE LA ETAPA 6: ELIGIÓ TODAS (a) EL 21/10/2026** (A1: *"probemos y me decís"* = una sola publicación en la próxima llegada). Antes decía: ESPERAN SU RESPUESTA (él: *"avisame cuando termine el último (…) tengo que elegir las decisiones"*). (a) = la recomendada. Una cosa obvia quedó sin hacer porque las revisiones se pausaron: el `ofi` que imprime `pyped:llego` sale sin `@color` y falla entero en una reposición con colores (arreglarlo al retomar).
  **Datos de ML sin usar:**
  · D1 Lo que ML recomienda mandar a Full (replenishment por upid) + días sin stock: (a) mostrar y avisar 2 semanas · (b) tope duro.
  · D2 Por qué se pierde la caja (winner.price + boosts, 0 consultas más): marcar "perdés por cuotas" → gemela, no bajar: (a) guardar y marcar · (b) sólo mostrar boosts.
  · D3 Excel de cargos de Full solo en cada cierre (lotes, tamaño, multas): (a) automático · (b) baja el Excel y deja los comandos para revisar.
  · D4 Precio sugerido de ML para las ~36 sin catálogo: (a) usarlo para el salto de techo y el lanzamiento · (b) sólo en la ficha.
  · D5 ¿El competidor que pone el precio está en promo? (a) medir y marcar · (b) en semanas de evento no descartar candidatos.
  · D6 Etiquetas de calidad de cada publicación: (a) guardarlas y listar las dormidas con problema · (b) sólo en la ficha.
  **Dónde se gana o pierde plata:**
  · P1 El cupo chico de Ayelen se recorta a mano y deja en 0 lo agotado que vende (~$47.000 más por caja con la regla de la web): (a) decide_cajas recorta solo con la regla de la web (1 u. a cada uno, después por plata) · (b) sigo a mano con la regla escrita en el CEREBRO.
  · P2 Con "NO ENTRA" por cupo, la oficina no repone ni es sobra (el Enchufe se bajó por una sobra que no llega a Full): (a) marca cupoCorto que leen escasez y sobra · (b) sólo un aviso en escasez.
  · P3 El dólar de Paraguay se compara sólo contra el oficial (+5,5 a +7,4%): (a) el robot guarda cripto y MEP del día y el pedido muestra contra ellos · (b) cargarlo a mano en compray.
  · P4 El envío que pagamos cuando 2 u. o un carrito cruzan los $33.000: (a) comando que lo suma y compara contra la venta suelta · (b) sólo contarlas con lo que ya hay.
  · P5 La caja de $17.310 se reparte como si fuera llena (lo barato de Ayelen carga $35-60/u y le cuesta ~$266): (a) costo real por cuenta en ficha y planilla + "¿conviene?" para cajas chicas · (b) sólo una columna en planilla.
  · P6 El escalón de comisión de $15.000 (subir a $15.990 deja menos que $14.990): (a) probar abajo del escalón, lista en planilla y freno en decido · (b) sólo la lista.
  **Lo que hacés a mano:**
  · A1 Claude publica en ML lo nuevo de cada pedido, en el catálogo ya confirmado, pausado y con su precio (vuelve atrás tu "ML la hago yo" del 26/09): (a) probar con UNA en la próxima llegada · (b) seguís publicando vos y te dejo una hoja lista por producto.
  · A2 Lo nuevo no se activa solo sin el precio de lanzamiento decidido, y el alta dice el catálogo exacto: (a) freno + dato · (b) sólo una lista.
  · A3 "Llegó" suma a la oficina en Paraguay y Listas como ya hace Paulvic, y Listas tiene comando por chat: (a) suma sola con "llegó todo" y vos avisás lo que faltó · (b) se sigue contando aparte.
  · A4 Menos llamadas a ML (cada comando reinicia la vuelta pesada, comisiones repetidas, permiso que no reintenta): (a) contador + memoria de la vuelta pesada + reintento · (b) sólo contador y reintento.
  · A5 Una venta nueva no queda tapada por una nota vieja, y cada venta dice si es la 1ª/2ª desde el cambio: (a) las dos · (b) sólo la primera.
  **Gusto y comodidad (maquetas en el scratchpad, se pierden con el contenedor):**
  · G1 Pedidos marca qué cambió desde que lo miraste (para Tito; ~36 de 90 renglones cambian por día): (a) se da por visto al salir tras 10 s · (b) botón "✓ ya lo vi".
  · G2 Cada venta dice qué significa (🎉 primera · ⚡ se aceleró · 🔁 volvió a vender · 🏁 era la última en Full): (a) los 4 · (b) sólo 🎉 y 🔁.
  · G3 Las 4 cuentas "a esta hora" en Ventas de hoy, ámbar si una se frena de verdad: (a) carriles en Inicio + flechita "a esta hora" en Ventas · (b) sólo la flechita.
  · G4 Racha 🔥 de días cumplidos, mejor día 🏆 y el mes en cuadritos de colores: (a) las dos · (b) sólo el calendario del mes.
  · G5 Ventas en el celu: los 6 cuadros de arriba en un renglón que se abre: (a) el renglón · (b) sólo 3 cuadros.
  · G6 "N ventas nuevas desde que miraste" en Ventas, con puntito y rayita: (a) todo · (b) sólo el aviso de arriba.
  · G7 Sonido de venta con el tono del nivel (el iPhone no vibra): (a) interruptor en Ajustes, apagado de fábrica · (b) sólo día cumplido y día de oro.
- **Medido con `medir6` el 21/10 02:23:** reposición de Full y dólar MEP/cripto vienen bien; `/suggestions/items/<MLA>/details` contesta 404 "price suggestion not found" en las sin catálogo (6.D4 sin dato, no inventa); el `winner` de price_to_win trae sólo item_id/price/currency_id/boosts, sin precio original (6.D5 desde la caja sin dato). Chequear D4 en otras publicaciones más adelante.
- **APLICADAS LAS 24 IDEAS (v25.75, 21/10/2026).** Lo que se hizo, dónde vive y qué chequear:
  **Etapa 3 (mercadería)**
  - **6.D1 · Reposición que recomienda ML.** Una vez cada ~20 h por producto×cuenta (tope 150 por vuelta) el robot lee `/marketplace/fbm/user-products/<upid>/replenishment` y guarda `cyc/fullreco/<upid>` = {cta, ts, st, urg, v30, sem:[[vendidas, días sin stock]…], tipo, sug, plazo}. Web: `fullRecoDe`/`fullRecoHTML` en Armar caja (chip "ML N" y renglón con barritas); robot: sección "📦 ML PIDE REPONER EN ≤2 SEMANAS" de `escasez` (⏰ sin caja en camino). Probe a mano `reposfull[:go]`. Chequear: que `sug` null no se lea como 0; que el aviso de "mandás N veces lo que recomienda ML" no salte en todos.
  - **6.P1 · decide_cajas recorta por cupo con la regla de la web.** `pedidostodo` imprime `CUPO <Cuenta> peq N gra M · leído hace D d · mandado después P/G` y `· GRANDE` por producto; `llenar_cupo` (Python) = `cajaLlenarCupoPlan` (web): 1 u. a cada uno y después por plata. El motivo de la caja empieza con `✂️ por el cupo de Full de <cta> … (faltan Q)`. Chequear: si la web cambia `cajaLlenarCupoPlan`, cambiar `llenar_cupo` (probadas iguales en 400 casos al azar).
  - **6.P2 · cupoCorto.** `decido:caja` guarda `cupoCorto:{falta,ts}` cuando el motivo trae `✂️ … (faltan N)`; `escasez` resta esas unidades de la oficina (15 días, `CUPO_CORTO_DIAS`) y `planilla` las dice en la sobra. Chequear: la clave de `claudedecide/caja` contra la de inventario (color con mayúsculas/espacios: probado).
  - **6.P5 · Caja real por cuenta.** `cajaRealPorCuenta` (robot) = `cajaRealDe` (web): costoCaja ÷ unidades promedio de las últimas 8 cajas de esa cuenta en 120 días. Ficha (`cajaRealFichaHTML`) y `planilla` (sección 📦 con "¿conviene?", avisa si la caja se come 25%+ de lo que deja). Chequear: robot y web dan lo mismo (probado).

  **Etapa 1 (precios)**
  - **6.D2 · Caja perdida por cuotas.** `cajaDeCompraML` guarda `cajaBoost`, `cajaGanP` (precio del ganador), `cajaPorCuotas` (`cajaPerdidaPorCuotas`: pierde/comparte, el ganador está a 98%+ de nuestro precio y `free_installments` no está boosted). Rotación muestra "💳 la perdés por cuotas"; `gemela` las pone primero aunque estén abajo de $50.000. Chequear con `medir6` qué trae `winner`.
  - **6.D4 · Precio sugerido de ML (sólo no catálogo).** `/suggestions/items/<MLA>/details` cada ~20 h (tope 40 por vuelta) → `sugP`, `sugMin`, `sugTs`. Sólo referencia: `planilla` (sección 💡) y la ficha. **No mueve precios.** Forma de la respuesta NO medida: código tolerante (número suelto o `.amount`). Correr `medir6` para confirmar.
  - **6.D5 · Competidor en promo.** `promoDeOferta` (original_price) en `precioAIgualar` → `promoPct`; candidatos guardan `mlPromoPct`/`mlSinPromo`, pycat/listas `pp`; la caja guarda `cajaGanPromo` (original_price/regular_amount del ganador, tolerante). Chequear con `medir6` que `winner.original_price` exista; si no, `cajaGanPromo` queda vacío y no dice nada.
  - **6.P6 · Escalón de comisión en $15.000.** `escalonDeComision` (zona = hasta 15% arriba). `planilla` lista las que están en la zona con lo que dejarían a $14.990; `decido` frena una SUBA que cae en la zona si a $14.990 deja igual o más por unidad ("🚫 FRENO zona muerta…"); a propósito con `!escalon`. Probado de punta a punta con un ML de mentira.

  **Etapa 2 (plata)**
  - **6.D3 · Cargos de Full al cierre.** Paso nuevo en `ml-daily` "Cargos de Full del mes" (`cargosmes:auto:go`, continue-on-error, en FALLOS_NOCHE). Sólo días 1–5 (hora AR), memoria `mlapi/cargosmes/<AAAA_MM>`; si ya hay uno cargado a mano lo marca hecho sin cargar otro. Chequear el 1º de noviembre que cargue octubre UNA vez.
  - **6.P3 · Dólar MEP/cripto.** Una vez por día (`mlapi/dolar/refDia`) → `cyc/dolarref/<AAAA_MM_DD>` = {of, mep, cri, ts, fuentes} (dolarapi, respaldo criptoya; si no contesta ninguna, no escribe). Paraguay muestra "ese día MEP $X (+Y%) · cripto $Z"; `compray` lo imprime. Chequear que las fuentes sigan contestando.
  - **6.P4 · `cruza33[:días]`** (solo lee): envío que pagamos cuando 2 u. o un carrito cruzan $33.000 contra la venta suelta del mismo producto.

  **Etapa 8 (datos)**
  - **6.D6 · Etiquetas de calidad.** `cajaDeCompraML` pide `tags,health` y guarda `etq` (ordenadas, separadas por coma) y `salud`. `etqProblemas` traduce las malas (`ETQ_PROBLEMA`); `planilla` lista las que no venden y tienen un problema (sección 🩺); la ficha las muestra.
  - **Probe `medir6[:MLA]`** (solo lee): las claves de `winner`/boosts, la forma de suggestions, el conteo de etiquetas, una reposición y el dólar de referencia.

  - **A1 · HECHO (preparado, falta la prueba en la próxima llegada) · `publicar:<ficha>|cuenta=<cuenta>|precio=<pesos>[|catalogo=<MLA…>][|color=<variante>][|!piso][|go]`** (ml-sync; ml-consulta lo niega). Crea UNA publicación Clásica PAUSADA en el catálogo CONFIRMADO de la ficha (`mlCatalogo` de la lista o el candidato de Paraguay con ✅/revisión de fotos, o `catalogo=` mirado por mí), con título/fotos/categoría del catálogo (categoría = la de las ofertas del catálogo; si no, `domain_discovery`). Sin `|go` muestra el cuerpo y le pide a ML `POST /items/validate` (no crea nada). Con `|go`: valida, crea, PAUSA en el acto, relee, vincula (`cyc/mllinks/<MLA>` con `catOk`, `altaClaude`, `altaSinVender`) y anota 🆕 lanzamiento. Frenos: ficha con colores pide `color=`, ya hay publicación viva de esa ficha en la cuenta, techo $650.000, margen en el peor caso (`cuentaCandidato` + 2% de retención) abajo del piso salvo `!piso`, sin dólar/costo/comisión no publica, ML no valida → no crea. Riesgo conocido: entre el alta y la pausa (~segundos) queda activa con 1 u. de depósito; si la pausa falla lo grita y `pausarFuera` la pausa en la vuelta de la hora. Qué chequear: que sin go no cree nada (sólo validate), que la creada quede `paused` y vinculada, que no repita en la misma cuenta.
  - **`publicar` con el modelo nuevo de ML (23/10)** · la Webcam EMEET S600 (Ayelen) volvió de `/items/validate` con "The fields [title] are invalid": ML pide `family_name` en vez de `title` en esa categoría. Ahora reintenta una vez sin `title` y con `family_name`, validando antes; y manda `shipping: {mode: me2}` (sin eso ML toma me1: "User has not mode me1"), envío gratis desde $33.000. Si ML devuelve 400 pero todo lo que lista es `type: warning`, se toma como válido (lo dice en el log). Qué chequear: que la creada tenga título del catálogo y quede pausada.
  - **Tope para crear $550.000 (23/10, él: *"nunca crear publicaciones más caras que 550.000"*)** · `TOPE_CREAR` en `sync.mjs`, freno en `publicar` y en `gemelacrea` (la de envío gratis va siempre abajo de $33.000). Qué chequear: que `publicar:…|precio=560000` y `gemelacrea:<MLA>=560000` salgan frenados con "pasa los $550.000"; el techo de $650.000 para subir un precio que ya existe no cambia.
  - **A2 · HECHO · lo nuevo no se activa solo sin precio de lanzamiento y sin catálogo confirmado.** En `activarPausadasFull` (vuelta de la hora, `activarfull`, `pausadas`): "nuevo" = ni la publicación ni su ficha vendieron NUNCA (todas las ventas, no 120 días). Pide (1) una estrategia mía anotada en `cyc/estrategia/<MLA>` (cualquiera decidida; `decido:<MLA>=<precio>#nuevo|…`) y (2) que el `catalog_product_id` de la publicación sea el confirmado de la ficha (`mlCatalogo` o candidato `candCatChequeado`) o que esté confirmado a mano en `cyc/mllinks/<MLA>/catOk` (`catok:<MLA>=ok|sincat|MLA…|-[;…][;go]`, lee el catálogo de ML en el momento). Si no, queda pausada con el motivo (y el 🧠 lo dice en simple). El alta de nuevas guarda `catalogo` (`catalog_product_id` o null) y `catalogoListing`, y el log lo muestra. La ficha nace con `mlCatalogo` del candidato confirmado (web `candFichaDesde` y robot `pyped:llego`). Qué chequear: que una gemela o un producto que ya vendió NO quede frenado; que `pausadas` nombre los frenados por esto; que `catok` no escriba si ML dice otro catálogo.
  - **A3 · HECHO · "Llegó" suma a la oficina en Paraguay y Listas.** Web: `_pyPedidoLlego` (reposición y con nuevos) y `_listaLlego` preguntan "¿Llegó TODO?" (`_llegoTodoPreg`); con sí suman con `llegadaSumarOfi` (usa `ofiMover`, color con `_ofiColorDe`); lo que no se puede (producto con colores y renglón sin color, sin ficha) sale en el cartel para contarlo a mano. `ofiAlLlegar` es la foto de ANTES de sumar y queda sólo de lo no sumado (la canasta/`LIviaja` no esperan lo ya contado); `sumoOfi` {ts, por, items} en el pedido. Robot: `pyped:llego:<id>[;<palabra>[#color]=<llegaron>…][;nosumar][;go]` suma con `ofiSumarBot` (misma cuenta que `ofi`), anota `falto` y `sumoOfi`, y el `ofi` que imprime para lo no sumado sale con `@color` (o `@<color: …>` para elegir) — ARREGLADO el pendiente: antes salía sin `@` y fallaba entero. Comando nuevo **`listaped`** (lista en camino) y **`listaped:llego:<id|número>[;…][;nosumar][;go]`**: lo mismo que el botón Llegó de Listas (fichas nuevas con costo pc÷dólar del pedido, `listaProv`, `codLista`, `mlCatalogo`; probados suben costo congelando el viejo en `precios_hist_prod`) + suma a la oficina. Qué chequear: que dos "Llegó" no sumen dos veces (el estado se chequea antes), que el total de la oficina no quede abajo de la suma de colores, que lo faltado quede en `falto`.
  - **A4 · HECHO · menos llamadas a ML.** `lib.mjs`: `mlConteo` (consultas, 429, reintentos, comisiones de memoria, permisos) y al salir cada corrida imprime `📞 consultas a ML en esta corrida: …`; `mlGet` reintenta UNA vez un 429 (~2 s; `ML_REINTENTO_429=0` lo apaga) y guarda `/sites/…/listing_prices?…` por ruta y permiso durante la corrida; `mlRefresh` reintenta 429/5xx (3 s y 8 s; un 400 no). `sync.mjs` main: `mlapi/vueltapesada` {ts, consultas, e429} — una vuelta pesada a menos de 45 min de la última va liviana; una liviana del ciclo (`PESADA_SI_TOCA=1`, puesto en `ciclo.sh`) se vuelve pesada a los 60 min; sin memoria legible manda lo que decidió el ciclo; `FORZAR_PESADA=1` la corre igual; se anota sólo si la vuelta terminó entera. Qué chequear: en el log, `⏩ La vuelta pesada se hizo hace N min` tras un comando y `⏫` en las livianas; que el stock/cajas se sigan leyendo una vez por hora.
  - **A5 · HECHO.** Web: en la ventanita 🧠 (modo Claude, notas de precio) si después de la nota hubo ventas de esa publicación, renglón ámbar "⚠️ Esta nota es del dd/mm hh:mm y después vendió N veces (la última el …): todavía no la revisé" (`_comprasEntre`). En Ventas x Producto cada venta lleva 🥇 1ª / 🥈 2ª venta desde el cambio (`ventaNroHTML` / `ventaNroDesdeCambio`: compras —no renglones— no canceladas de ESA publicación desde el último cambio de `cambiosPrecioLista`); de la 3ª en adelante nada. Qué chequear: que un carrito cuente una vez; que no aparezca en canceladas.

  - **G1 · Pedidos: qué cambió desde que lo miraste** (`pedCambioDe`, `pedCambioChip`, `pedCambioAvisoHTML`, `#ped-cambio-aviso`,
    localStorage `cycPedVisto` = {ts, p:{id:{c,n,s,v}}}). La cantidad comparada sale de `_pedCantVista`, que ahora usa también la
    tarjeta (`_cantShow`; en Paulvic, redondeada con `pvRedondo`). "Visto" = `_vistoSalir` (goPage, ocultar la app, pagehide) si
    estuvo 10 s (`VISTO_SEG`). La primera vez en un aparato se anota sin marcar nada; sin pedidos cargados no se anota.
    **Chequear:** que la cantidad del chip sea la misma que la del número grande · que el filtro "sólo lo que cambió" se apague solo
    si no hay cambios o en Listas/Papelera · que nada falle sin localStorage.
  - **G2 · lo que significa cada venta** (`ventaHechoDe`/`ventaHechoHTML`, índice `_ventaHechosIdx` cacheado por firma). 🎉 sólo si la
    publicación tiene `altaTs` posterior al primer día guardado o la venta es 90+ días posterior (las ventas arrancan el 01/05/2026) ·
    🏁 sólo con stock MEDIDO en 0 (clave de inventario existente; producto con colores y color sin identificar = no dice nada) y sin
    ventas posteriores de esa clave · 🔁 30+ días desde la venta anterior de ESA publicación · ⚡ `ritmoRapido` (7 d contra los 30
    anteriores) sólo en la venta en que empieza y con ritmo de antes > 0. **No hice el papelito de colores** de la maqueta (adorno; se
    puede agregar). **Chequear:** que un relleno viejo de ventas no llene todo de 🎉 (por eso la vara de altaTs/90 días).
  - **G3 · las 4 cuentas a esta hora** (`cuentasAEstaHora`, `_homeCuentasHTML`, `vpAehChip`; `_homeCurva(k,cta)` ahora acepta cuenta y
    da `compras(min)`; `_homeCurvaPrev` = los mismos días que la línea). Ámbar: suele llevar 3+ compras a esa hora y P(X≤hoy) < 5%
    (`_poisCdf`). En Ventas (Día = hoy) la flechita de ganancia por cuenta es "vs a esta hora"; el % sigue contra el día anterior.
    **Chequear:** misma cuenta que la línea de Ventas de hoy (efectivoCostoVP) · sin días previos no se dibuja.
  - **G4 · racha 🔥, mejor día 🏆 y el mes en cuadritos** (`rachaHasta`, `_mesRachas`, `_homeGustoHTML`, `homeCalIr`). Día cumplido =
    `PUNT_DIA_7` ($115.000); hoy sin llegar no corta (cuenta hasta ayer). Colores = `VIVA_DIA_NIV`. Todo sale de `_homeDiaTot`, no
    guarda nada. **Chequear:** que el cuadrito de un día abra Ventas en ese día · que días sin datos (antes del 01/05) queden vacíos.
  - **G5 · Ventas en el celu en un renglón** (`vpKpiResHTML`, `vpKpiToggle`, clase `vp-kc` en `#vp-kpis`, localStorage `cycVpKpi`).
    Sólo ≤640px; en la PC no cambia. Mismos números que los cuadros (se arma con las mismas variables).
  - **G6 · ventas nuevas desde que miraste** (`ventaVistoTs`/`ventaVistoGuardar`, localStorage `cycVentaVisto` = ts de la última venta
    vista; `.vp-nuevas`, `.vp-nueva-dot`, `#vp-rayita`). Visto al salir de Ventas tras 5 s. **Chequear:** primera vez sin marcas.
  - **G7 · sonido de cada venta** (`ventaSonidoCheck` en renderAll, renderHomeHoy y renderVentaProd; `sonarVenta` con Web Audio, sin
    archivos; `sonidoAjusteHTML` en `#ajuste-sonido`; localStorage `cycSonidoVenta`, `cycSonidoMin`). Apagado de fábrica, no suena en
    modo discreto ni en otra página ni con la app oculta; la primera mirada y el cambio de día no cuentan; hasta 3 sonidos por tanda;
    venta sin costo no suena (no se sabe el nivel). El aparato se "destraba" con el primer toque (iPhone). **Chequear:** que una venta
    vieja no suene al volver a Inicio (la base se actualiza en cualquier página).
- **QUÉ TIENE QUE PROPONER, regla suya del 09/10/2026:** *"lo que hicimos hoy con los colores y movimientos y
  efectos de las tarjetas son detalles que quiero que estén en la revisión de diseño o ideas para ir mejorando la
  web. no puede ser que no me lo haya recomendado cuando está tan bueno (…) que piense cosas así. detalles o mejoras
  de comodidad, cosas duplicadas o faltantes. todo eso"*. O sea: además de datos de ML sin usar y trabajo a mano,
  esta etapa tiene que traer **ideas que den gusto usar la web** (como las ventas con vida: color por %, formas que
  se mueven según la plata, fuego en las mejores), **mejoras de comodidad** (menos toques, lo importante arriba),
  **cosas duplicadas** (el mismo número en dos lados) y **cosas que faltan** (un dato que él busca y no está).
  Que no espere a que él lo pida. Se le pasan todas juntas, con maqueta cuando es visual.

### ETAPA 6 DEL 14/10/2026 (en curso)
- Hecho de paso (obvio): el contador de Pedidos (`_pedSemCount`) decía "≤14 días" también en Paraguay, que corta en
  `PED_DIAS_ROJO_PY` (17). Ahora recibe el corte de cada sección. **Chequear:** el rótulo de cada pestaña coincide con
  el `pedDiasRojoDe` que usa `syncPedidosAuto` para pintar el naranja.
- **Varios comandos en una corrida** (`ml-consulta.yml` y la rama a mano de `ml-sync.yml`): uno por renglón, cada uno
  corre aparte (`BILLING_PROBE="$c" node …`, el chequeo de sólo lectura de ml-consulta se aplica a cada uno), separados
  por `##### <comando>`; si uno falla siguen los demás y la corrida termina en error. **Chequear:** que el texto siga
  entrando por variable de entorno (nunca pegado en bash) y que no haya opciones repetidas en un paso del workflow.
- **`antiguo[:cuenta]`** (solo lee): lo que Full va a cobrar de stock antiguo por producto×cuenta, al ritmo normal
  (`lotesFifo` + `cargoAntiguoProy`, la misma cuenta de la sobra, que con SOLO_DATOS no miraba nadie): próximo cierre,
  3 y 12 cierres. Lo recién llegado sin ventas no se proyecta (si no, suma 3 años de cargo inventado). Primera medición
  14/10: 8 con cargo, $40.613 en el próximo cierre, $1,19M a 12 cierres (la Tira Led de Luciana se lleva $761.450).
  **Chequear:** que la cuenta cierre (`CUENTA: N = con cargo + sin cargo ✓`) y que use la misma tabla que la sobra.
- **`reclamocubre[:días]`** (solo lee): qué dice ML de cada reclamo (`resolution`) y cómo quedó la plata del pago.
  Medido 14/10 (90 días): **68 de 69 los pagó el programa de protección de ML** (`refunds[].source.type = bpp`,
  `bpp_refunded`/`bpp_covered`), 1 lo pagamos nosotros. **Imprime sólo códigos y tipos: NUNCA `source.name`** (trae
  nombre y apellido del titular; pasó en la primera corrida y se borró ese registro de GitHub).
- **Adelanto de plata para el pedido de Paraguay (15/10/2026, v23.48):** `compraspy/<id>/pagos/adelanto`, se carga con
  `compray:<fecha>|adelanto=<pesos>|go`. Gasto fijo extra (no obligatorio): suma en el total y el recargo real de la web
  (`pyRecargoReal`, `pyGastosChecklistHTML`, `pyPedidoDetalleHTML`) y del robot (`recargoRealPedido`, historial de
  `compray`, `buscacosto`). **Chequear:** que toda suma de `pagos` lo incluya (buscar `otros` y ver que vaya al lado).
- **`reclamoplata[:días]`** (solo lee, 15/10/2026): para cada reclamo/devolución suma TODAS las filas del reporte de
  liquidación de MP de esa orden (`ORDER_ID`) y lo compara contra el neto de la venta: dice si la plata quedó, se fue o
  quedó una parte. Es la confirmación que faltaba para la idea 7. Imprime sólo cantidades, tipos y %. **Chequear:** que
  no imprima números de orden ni columnas con texto (DESCRIPTION puede traer datos).
- **Cargos de Full por tipo** (`cargosfull` sin `:go`): el resumen del período de ML trae almacenamiento (CFWA),
  almacenamiento prolongado (CFBA), retiro/descarte (CFRS), devoluciones (CDSD) y multas por envíos a Full (CFPB), por
  cuenta. Con eso el "gasto de Full del mes" puede salir de ML en vez de pasarlo él. Y el "$1M que ML factura y no se
  explica" (idea de un revisor) NO existe: el resto de la factura son cargos por venta (CVFV, CVFF, CFF, CVFN) que ya
  están en el neto de cada venta, más percepciones.
- **Precio sugerido de ML** (`/suggestions/items/<MLA>/details`): contesta en publicaciones con comparables
  (`lowest_price`, `suggested_price`, `status: with_benchmark_highest`); en las que no tienen, 404. `health` da 404
  ("buy_it_now not allowed") y `trends` vuelve vacío: descartados.
- **informe §9** lista las cajas que ML ya dio de alta ENTERAS (cualquier edad) con el `cajallego:<seg>;…:go` listo
  (antes salían sólo con 9+ días y el seguimiento cortado). **Chequear:** misma regla que `cajaEntradoDe` (seguimiento
  igual, nunca más de lo que llevaba el renglón).

- **Lo que eligió (14/10/2026, él: "arma todas las ideas que vos tiraste, excepto lo super importante que modifica
  mucho y tenes dudas"). v23.42 · `cyc-v622`:**
  - **1 · tanque de días en Pedidos** (`pedTanqueHTML`): barra en DÍAS al ritmo del pedido (`cVdia`) con ML, camino,
    oficina y lo rayado que se compra, raya roja en `pedDiasRojoDe` (14/17). En los pedidos automáticos se sacó el chip
    "🔴 Urgente" (mide sólo ML y contradecía al "alcanza ~N d") y de la nota se ocultan "~Nd cubiertos" y los tres
    lugares (van en la barra). Los pedidos a mano conservan su botón de estado. **Chequear:** con 0 en Full y mucho en
    casa la barra dice "hay que MANDAR", nunca "urgente"; los días salen de los campos guardados (`cuentaPed`).
  - **2 · nota "Hola Tito!" a la vista** (`_cerNotaCtx`/`_cerNotaVisHTML`, `_cerTxt` lo llena el listener de
    `mlapi/claudeexp` sólo con `ped__`/`caja__`): en la tarjeta de Pedidos (2 renglones, entera al abrir) y en cada
    renglón de Armar caja (se abre al tocar). En probados de Paraguay no se repite (ya va el "🧠 Por qué N" de abajo).
    **Chequear:** misma clave que el 🧠 (`_cerClaveCtx`); sin nota no se dibuja nada.
  - **3 · Ventas de hoy contra la semana pasada a la misma hora** (`_homeCurva`/`_homeCurvaHTML`): ganancia acumulada
    hora por hora con `efectivoCostoVP` y la hora real (`ts`) de cada venta; un día que no es hoy se compara entero.
    **Chequear:** las ventas sin `ts` no entran en la línea (sí en el total); la cuenta es la misma de la tarjeta.
  - **4 · venta nueva con Inicio abierto** (`_homeHoyEfectos`, `_hoyPastilla`, `_hoyRodar`): pastilla del color del %
    de esa venta, el total y la ganancia suben rodando, `navigator.vibrate(35)`. Sólo Día=hoy, Inicio a la vista y la
    app al frente; la primera pintada no cuenta. Respeta "menos movimiento".
  - **5 · día cumplido** (`_hoyChispas`): chispas verdes al pasar `PUNT_DIA_7` ($115.000) de ganancia en el día y
    doradas al pasar el doble; una vez por día y nivel (`localStorage cycDiaCumplido`).
  - **6 · una sola escala de puntos**: Ventas usa `_puntajeDia` con la ganancia promedio por día (antes `GAN_DIA_TABLA`,
    borrada). Código muerto sacado: `retiroMes`/`retMitadMes` (0,15 del neto) de los KPIs de Ventas y `RETIRO_PCT`,
    `_vpGan`, `vpGanSum` del Resumen. **Chequear:** el mismo día da el mismo puntaje en Inicio y en Ventas.
  - **9 y 10 · `cargosmes[:<AAAA_MM>][:<meses>][:go]`** (sync.mjs; `:go` sólo por ml-sync): la factura de ML por tipo
    de cargo de las 4 cuentas. (9) gasto de Full = CFWA + CFBA + CFRS + CFPB netos de bonificaciones, con `:go` en
    `cyc/compras/fullml_<AAAA_MM>_<cuenta>` (cat Envios, día 15 del MES SIGUIENTE al período, como lo cargaba él); no escribe si falta leer una cuenta ni si ya hay uno
    cargado a mano ese mes. Afuera: cargos de cada venta (ya en el neto), percepciones (ya van como %), devolución CDSD
    (ya la cuenta el % de reclamos). (10) tabla de percepciones de IIBB por provincia × cuenta para el contador.
    **Chequear:** que ningún cargo de Full quede en "otros" sin mirar y que la tabla de IIBB use sólo renglones de IIBB.
    v23.43: el renglón "Cargos de Full de ML" de la lista de Gastos ya no le pide el reporte (dice que lo cargo yo con
    `cargosmes`). **Chequear:** que ese texto y el comando sigan diciendo lo mismo.
  - **7 (reclamos que pagó ML) · CERRADA 15/10/2026, NO se hace:** `reclamoplata:90` cruzó el reporte de MP: de 70
    reclamos, en NINGUNO quedó la plata (46 se fue entera, 24 una parte; filas DISPUTE −). `applied_coverage`/`bpp` quiere
    decir que ML le devolvió al comprador con su programa, no que nos repuso. El % de reclamos en el costo está bien. 8 (juntar pedidos de Paraguay a ~US$1.000) es una
    decisión de compra, no código. 11 (dinero que rinde en MP) lo mira él en la app.

## 7 · DISEÑO (domingo)

### 🔥 Fuego de las ventas vivas desde $20.000 (26/10/2026, v26.72, pedido suyo)
- **Qué es:** `VIVA_GAN_FUEGO=20000` en `vivaVenta`: el fuego necesita $20.000+ de ganancia (antes alcanzaba $10.000, `VIVA_GAN_TIEMBLA`, que sigue para el temblor). Caso: Lupa de $16.095 ardía.
- **Qué chequear:** una venta de $10.000-$19.999 que antes ardía ahora tiembla (no queda quieta) · una de $20.000+ con puntaje 10.500+ sigue ardiendo.

### 🏷️ Sin terminar por cuenta (24/10/2026, v26.53, pedido suyo)
- **Qué es:** la tarjeta de Contar lo que hay agrupa por cuenta (nombre arriba, productos abajo); cada color/aroma va a la cuenta que lo
  publica (`_sinEtiqCtas` con `_varPorMla`); con una cuenta elegida arriba (`ofiContarCuenta`) muestra sólo la suya.
- **Qué chequear:** el Paulvic sale repartido Adriana/Luciana por aroma (no "Adriana · Luciana" en todos) · el total de la tarjeta = la suma de los grupos.

### 📦 Sacando stock con la estrategia de cada día (24/10/2026, v26.52, error que marcó él: "figura la última el 13/10")
- **Qué es:** desde el 13/10 (el robot sólo junta datos) nadie marcaba `rem`/`esc` en la línea y la franja se cortó. Ahora cada día con stock
  cuenta la estrategia que tenía: sobra/liquidando/remate → 📦, bajando → 🪜. Robot: `calcLineaTodo(lin, links, estrat)` (`TAG_SACA_STOCK`,
  lee `cyc/estrategia`); web, línea de un producto: `remT`/`escT` con `estrategiaDe(mla, fin del día)`.
- **Ajuste del mismo día (él):** la 🪜 escalera que viene de buscar techo NO es sacar stock; desde el 24/10 cuenta todo día abajo del 35% en el
  peor caso (`mgP` nuevo en la línea de cada noche, `SACA_35_DESDE`). El violeta queda sólo para las marcas viejas del robot (antes del 13/10).
- **Qué chequear:** la franja de "Todos" llega hasta ayer · un producto en 📦 sobra se pinta naranja esos días · no se cuenta dos veces un
  día que ya traía `rem` del robot.

### Mes y año se miden como el día · globo de "Todos" por franja (24/10/2026, v26.50, pedidos suyos)
- **Qué es:** (1) la tarjeta de Ventas del mes/año reparte lo ganado en TODOS los días del período (`_homePerTot().diasPer`): puntaje,
  color y escalerita arrancan bajos y suben con cada venta, como el día. El año 2026 se mide desde el primer día con ventas guardadas
  (mayo); 2027 entero. La escalerita dice cuánto falta en total y por día en los que quedan. En el año en meses, el mes en curso se
  pinta igual (no corta la racha mientras no llega). (2) La línea de "Todos los productos" tiene un globo por franja (como la de un
  producto): Ventas = normales / Premium / envío gratis / liquidadas + visitas; cada franja dice sólo lo suyo.
- **Dónde vive:** `index.html` · `_homePerTot`, `renderHomeHoy` (`_nP`), `_diaEscaleraHTML(gan,dias,quedan,esc)`, `_anioMeses`,
  `_homeAnioHTML` · `lineaTodoPintar` (capa de globos por carril).
- **Qué chequear:** el 1º del mes la tarjeta del mes no dice "Bajo" con un día bueno sin explicar (dice cuánto falta) · el último
  día del mes el puntaje coincide con el de antes (días pasados = días del mes) · ningún globo de "Todos" pasa de ~10 renglones.
- **24/10/2026 · v26.46 · flechas en la línea y con el color de su estrategia** (él: *"quiero que la flechita esté en el punto de la línea donde se subió o bajó"* y *"muchas aparecen en gris: quiero que todas tengan color/estrategia/nombre, a partir de ahora sí o sí"*). La ▲ va justo arriba del punto del precio de ese día y la ▼ justo abajo; el color sale del `tag` del cambio (`claudecambios`), si no de la estrategia de ese día (la de la línea, `_estD`), y una gemela es 💳. El globito dice el nombre. Gris sólo sin nada anotado (viejo o a mano en ML). Probado con Playwright. **Qué chequear:** que no quede ninguna gris de cambios nuevos.
- **24/10/2026 · v26.44 · franjas de la línea de tiempo grandes y que se cierran** (él: *"se ven 4 tarjetas, me gustaría que se vieran dos, así están más grandes… total después scroleo hacia abajo, y que se puedan minimizar al clickear en la tarjeta"*). Parada, cada franja grande mide media pantalla (`_lnAlto`); girada sigue entrando entera (`_lineaFac`). Tocar el título (▾/▸) la cierra/abre (`lineaBanda`, `localStorage cycLineaCerr`); lo de una franja cerrada se recorta (`_lnClip`). Vale para la de un producto y la de Todos. Probado con Playwright (1300×900): 5 franjas, cerrar Ventas la deja en un renglón y la siguiente sube. **Qué chequear:** en el teléfono girado, que tocar el título funcione; que nada de una franja cerrada se vea por encima de la de abajo.

**24/10/2026 · v26.40 · 📈 Todos los productos: Premium y envío gratis aparte (él: *"¿se puede saber cuánto fue Premium? así veo cuánto más
vendemos por esa idea"*).** Barras: verde Clásica, naranja Premium (gold_pro o gemela Premium), celeste gemela de envío gratis, ámbar remate (misma
regla que la línea de un producto). Tarjeta Vendió: "N en Premium · M con envío gratis"; Ganancia: lo que dejó cada una. Dónde vive:
`lineaTodoPintar` (vd[k].uP/uG/gP/gG). **Qué chequear:** que verde+naranja+celeste+ámbar = el total del día; ventas viejas sin `tipoPub` cuentan como Clásica.

**24/10/2026 · v26.35 · Pedido de nuevos: vendidas y reseñas a la vista (él: *"quiero que en el detalle en el pedido aparezcan ventas y
reseñas"*).** El renglón de arriba (al lado de los vendedores) dice `🛒 N vendidas · ⭐ N reseñas` (o "sin cargar"), y la casilla del
detalle pasó a "🛒 vendidas · ⭐ reseñas en ML" con la regla (100+ vendidas o 5+ reseñas). Dónde vive: `pedNuevoFilaHTML` y el armado de
`filasN` en index.html. **Qué chequear:** a 360 px que la casilla no se corte con los dos números.

**24/10/2026 · v26.25 · Inicio → Pedidos con 4 puertas.** Él: *"sacar lo que tiene abajo de pedidos y poner las tarjetas de bs as,
paraguay, paulvic y listas. para entrar de una clickeando en esas"*. **Dónde vive:** `index.html` tarjeta `.ht-ped` (botones `.ht-ped-b`,
`homePedIr(sec)`); se sacaron `hv-ped` y `nc-pedidos-costo` de la tarjeta (sus funciones siguen y no fallan sin el elemento). En el
celu sólo las banderas/íconos (2×2, sin el 🚚). **Qué chequear:** cada botón abre SU solapa (no Bs As); dibujado a 360/390/1200 px, los
4 botones entran en la tarjeta sin cortarse.

**24/10/2026 · completa: 📸 fotos de lo nuevo de Paraguay** (CEREBRO §completa paso 2). La confirmación del "mismo producto" de los
candidatos nuevos (`fotosrev` → `revfotos.py` → `revcand`) no estaba en ninguna vuelta: lo nuevo que daba 35% quedaba esperando sin que
nadie lo mirara (187 en la lista al 24/10). **Qué chequear:** que `fotosrev` quede vacío al terminar la completa.
- **23/10/2026 · v26.22 · color de la barra del cupo** (él: *"según el cupo que haya que vaya de verde, amarillo, naranja y rojo, siendo rojo que casi no hay lugar"*). En `renderOfiCaja` (`fila` del cupo): libre después de esta caja ÷ cupo entero → 25%+ `--green` · 12-25% `--lv-joya` · 5-12% `--lv-justo` · <5% o pasada `--red`; el número "N libres" va del mismo color. Qué chequear: con 0 libres se ve roja (antes verde).
- **23/10/2026 · v26.16 · el puntaje del día puede pasar de 10** (él: *"que pueda romper el 10 hacia arriba y que al romperlo tenga un pequeño movimiento denotando un día excepcional"*). `_puntajeDia` sin `Math.min(10)` (misma pendiente: 3 puntos cada $115.000 × días; $284.491 en un día = 11,4); arriba de 10 dice "🚀 Día/Mes/Año excepcional" y el número lleva `.punt-rompe` (saltito con brillo cada 2,6 s; nada con movimiento reducido). En Inicio y en Ventas → Ganancia. Qué chequear: que en 360 px el número de 2 cifras ("11,4 /10") no corra los botones de al lado.
- **21/10/2026 · v25.64 · el dólar de Inicio cortaba el último número** (lo marcó él: *"la revisión de diseño no ve que está cortado? (…) lo primero que aparece en la web"*). La casilla medía 150px fijos y "1.535" en Syne mide 154px en la PC. Ahora `_dolarAncho` la mide con lo que tiene adentro (también al tipear y cuando termina de cargar la letra) y en el teléfono la tarjeta puede partirse en dos renglones. **Por qué se le pasó a la revisión: los revisores leían el código y nunca vieron la pantalla con la letra real** (el index entero se cuelga al conectar con Firebase). **Desde ahora la etapa 7 SIEMPRE dibuja** cada pantalla con el CSS real y las letras de Google (pedazo por pedazo con Playwright, a 360, 390 y 1200 px) y mide toda casilla y todo número grande: `scrollWidth > clientWidth` o `scrollHeight > clientHeight` = cortado. Empezar por lo que se ve primero (Inicio: dólar, ventas de hoy, puntaje). Chequear: probado con 1.535 · 10.000 · 1.535,50 · vacío, a 360/390/1200 px, nada cortado.
- **21/10/2026 · v25.57 · Inicio → Para cobrar sin "En <mes> cobran lo que dejó <mes anterior>"** (él: *"sacar eso del inicio, ya que lo
  sabemos"*). `_homeCobroHtml` queda con lo que se cobra el mes que viene y lo ganado hasta hoy. Chequear: no volver a ponerlo.
- **21/10/2026 · v25.58 · Inicio → Para cobrar queda sólo con el número** (él: *"siguen apareciendo texto"*): se sacaron de `_homeCobroHtml` las líneas grises "Ventas al ritmo de… ÷ 3 / Ya ganado hasta hoy…" y "Ganancia real de CYC… ÷ 3". Quedan el título, el número y el aviso de gastos que faltan cargar. Qué chequear: que la tarjeta no vuelva a explicar la cuenta (la explicación vive en el Puntaje).
- **21/10/2026 · v25.59 · Armar caja: el color de cada cuenta = el veredicto de su caja** (él: *"verde sólo si la caja es mandala ya, naranja si es podés mandarla y rojo si podemos esperar"*). Una sola función `cajaVeredicto(cv)` (verde ≤2 días o `porTamano` · naranja ≤7 días · rojo el resto · null sin nada) que usan el cartel, los botones de `#ofi-filtro-cuentas` (borde, fondo al elegirla, número y 📦 por la variable CSS `--cv`) y `cajasVerdes` (Inicio). Antes el botón elegido y el 📦 eran siempre verdes y el número se ponía verde con ≤7 días. Qué chequear: que el botón, el número, el 📦 y el cartel de la misma cuenta digan siempre el mismo color; "Todas" y una cuenta sin caja van en gris.

- **✅ LAS 30 DECISIONES DE DISEÑO: ELIGIÓ TODAS (a) EL 21/10/2026.** Antes decía: ESPERAN SU RESPUESTA (él: *"dejamos las respuestas para más tarde. acordate"*).
  Recordárselas y aplicar lo que elija. (a) = la recomendada. Las maquetas vivían en el scratchpad (se pierden con el contenedor;
  si hace falta se rehacen). 1 cuadros de Armar caja e Inicio con el cupo restado · 2 Resumen "Pedidos pendientes" → (a) un cuadro
  "Falta reponer" con la cuenta de Pedidos (b) sacarlo · 3 Métricas "👀 Qué está mirando ahora" (foto del 07/10) → (a) sacar ·
  4 "🔧 Reparar stock variantes" del Arqueo (escribe sin preguntar) → (a) sacar (b) que pregunte · 5 "⚡ Auto Paulvic+Victoria" y
  "🗑 Ocultar sin vincular" → (a) sacar · 6 Paraguay "Falta reponer" sólo del proveedor elegido · 7 dos "Patrimonio total" → (a) el
  de arriba dice "hoy" y no se ve en el teléfono · 8 "Última actividad" sólo en Ajustes · 9 Ajustes: juntar las dos 🔄 y el backup ·
  10 botones sin fondo (manchas blancas en oscuro) → (a) todos con fondo y se hunden al tocar · 11 un solo verde para "estás acá" ·
  12 tarjeta del día en un idioma (cartel con el color y nombre del nivel y cuánto falta para el siguiente) · 13 colores de
  estrategias por familia · 14 "atrás" de Android vuelve a la pantalla anterior en el mismo lugar (b sólo a Inicio) · 15 hoja del
  producto + buscador en el ☰ · 16 Inicio en grilla 3×3 con números vivos (b de a dos) · 17 ☰ por uso con números y "🗂️ Fichas" ·
  18 lista de Tito para el mayorista (b copiar todo) · 19 saltos 📈 en Pedidos/Armar caja, 📋 en la línea, mandar → Armar caja ·
  20 la venta del aviso late y dice "la del aviso" · 21 Paraguay con filtros plegados · 22 ☀️ al ☰ y el ☰ se esconde al bajar ·
  23 línea de tiempo: tocar un día muestra la franja · 24 ficha médica en tarjetitas en el teléfono · 25 deslizar Ventas de hoy ·
  26 "🧠 Última vuelta de Claude" en Inicio · 27 barrita piso/techo/hoy en 🧠 y Rotación · 28 camioncito de la caja y casilleros del
  pago Paulvic · 29 ventas separadas por día · 30 Listas un solo buscador y Gastos "Nuevo movimiento" plegado.

- **APLICADAS LAS 30 DE DISEÑO (v25.75, 21/10/2026).** Lo que se hizo, dónde vive y qué chequear:
  - **21/10/2026 · las 15 primeras decisiones de diseño (7.1-7.15, todas a).**
    · 7.1 `aMandarConCupo(filas)` (una sola cuenta): botones y cuadros de Armar caja y la línea de Mi oficina en Inicio, con el cupo
      de Full restado (chicos y grandes aparte; un cupo negativo cuenta 0). Chequear: Ayelen con 142 sugeridas y cupo 38 → 38 en botón, cuadro e Inicio.
    · 7.2 `pedFaltaReponerTodo()` = `_pedsCostoReponer` de todos los pedidos + productos no "suficiente" + riesgo; la usan Inicio
      (`nc-pedidos-costo`) y el Resumen (`res-ped-reponer/-n/-riesgo`). Chequear: Resumen e Inicio dicen la misma plata.
    · 7.3/7.4/7.5 borrados: `metVigBox/renderMetVig/metVigSet/MET_VIG_EST/metCerebroOn` (state.vigilancia se sigue leyendo, nadie la
      dibuja), `repararStockVariantes`, `autoLinkFamilies`, `bulkHidePending`. Tres listas: falta sólo eso.
    · 7.6 Pedidos → Paraguay: el filtro por `pyProv` va ANTES de la cuenta de arriba.
    · 7.7 `.total-pill` dice "Patrimonio hoy" (updateHeaderTotal siempre en vivo) y `@media(max-width:640px){display:none}`.
    · 7.8 fuera `#act-bar`/`updateAct` del Arqueo y "Última actividad" del Resumen; queda Ajustes → 🕘 Últimos cambios (renderHist).
    · 7.9 Ajustes: una tarjeta "🔄 Versión, actualizaciones y backup" (se fueron "💾 Datos", "🔄 Aplicación" y `#ajustes-version`).
    · 7.10 CSS: `.btn` sin `style*="background"` ni clase de color toma `--surface2`/`--border2`; `:active{transform:scale(.95)}` en
      .btn/.vbtn/.pf-btn/.tab/.dd-opt/.back-btn/.fnav-item. Un botón nuevo con fondo propio lo trae en el style; sin fondo queda parejo solo.
    · 7.11 tokens `--sel-bg/--sel-tx` (oscuro verde con letra oscura, claro verde oscuro con letra blanca) en .tab.active, .vbtn.active,
      .dd-opt.active, .pf-btn.active-all, .fnav-item.active-page y los botones elegidos de Paraguay/Listas/Bs As/Paulvic/rango/proveedor.
      Lo elegido nuevo usa esos tokens, no azul ni violeta. (Los botones de cuenta de Armar caja siguen con el color del veredicto, v25.59.)
    · 7.12 `VIVA_DIA_NOM` + `_diaEscaleraHTML(gan,dias)`: el cartel del puntaje de Ventas de hoy toma `--c` y el nombre del nivel de la
      tarjeta; escalerita con lo que falta (Mes/Año por día, con el promedio). El número 0-10 (`_puntajeDia`) no cambió.
    · 7.13 `ESTRATEGIA_UI` usa `var(--es-*)` por familia (sube*, baja*, vuelve, esp*, neu*), con claro y oscuro en :root/body.light;
      los alfas pegados al hex pasaron a `color-mix`. Una estrategia nueva lleva su token en su familia (y en las dos paletas).
    · 7.14 `goPage(page,opt)`: guarda `_pagScroll[pantalla]` y hace `history.pushState({cycPage})`; `popstate` cierra primero la
      ventanita de arriba (`_MODALES_ATRAS`) y si no vuelve a la pantalla anterior con `{atras:true}` y la deja donde estaba. Al abrir
      por acceso directo (#pedidos…) Inicio queda abajo en el historial. Chequear: Rotación bajada → Pedidos → atrás = Rotación en el mismo lugar.
    · 7.15 `fnavBuscar` (buscaCoincide+textosDeProd) en el ☰ y `hojaProdAbrir(prodId)` (z 8900, debajo de 🧠/ficha/línea) con
      `hojaIr(prodId,'ventas'|'pedido'|'caja'|'contar')`. Sólo números ya calculados (stockOf, stockOficina, enTransito, margenMLDe,
      ventas de 30 d sin canceladas). Chequear: un nombre largo no ensancha el menú; desde la hoja, Pedidos abre la solapa del origen.

  - **Inicio en grilla 3×3 (7.16)** · `renderHomeVivos`/`_homeVivos` + CSS `.ht-grid` · chequear: arriba siempre CYC+dólar,
    después `#home-hoy`, `#home-vuelta` y `#home-puntaje`; baldosas de altura fija (un número largo no mueve nada); en
    ≤640px 3 columnas sin cortes; los números salen de las mismas funciones que las pantallas (`_homeDiaTot`,
    `cajasVerdes`, `gastosChecklistMes`, `_facRojas`).
  - **☰ por uso (7.17/7.22)** · `#fnav-menu`, `_fnavNumeros`, `_syncFnav` · chequear: activo correcto por página y solapa,
    números sólo cuando está abierto, ☀️ cambia el texto, `body.fnav-oculto` vuelve al subir.
  - **Lista de Tito (7.18)** · `titoAbrir`, `_titoRenglones` usa `_pedsBsasSiempre` (la misma lista que Pedidos → De siempre) ·
    chequear: misma cantidad y colores que las tarjetas; tildes por día en el teléfono (no en la base); imprimir sólo la lista.
  - **Atajos (7.19)** · `lineaBtn` en Pedidos/Armar caja, `lineaFichaAbrir`, `_irCajaLink` · chequear: la ficha abre arriba de
    la línea y al volver al gráfico baja.
  - **Venta del aviso (7.20)** · robot `cyc/avisoventa_ult`, web `vpMarcarAviso` · chequear: sólo marca si el aviso tiene menos
    de 3 h; el latido se apaga con modo discreto / menos movimiento; no hay datos del comprador.
  - **Filtros de Paraguay plegados (7.21)** · `_pyFiltrosHTML` · chequear: el resumen dice lo elegido y ✕ vuelve a todo.
  - **Franja del día en la línea de tiempo (7.23)** · `_lineaFranjaEn` · chequear: girada (de costado) también; se cierra al
    cerrar la línea; los números del día son los de la línea guardada (no se recalcula nada).
  - **Ficha en tarjetitas (7.24)** · `tb()` con `{prim,res}` · chequear ≤640px: ninguna etiqueta vacía, nada recortado.
  - **Deslizar Ventas de hoy (7.25)** · `_homeHoyDeslizar` · chequear: nunca pasa hoy, el toque normal sigue abriendo Ventas.
  - **Última vuelta de Claude (7.26)** · `renderHomeVuelta`, `_cerTs` · chequear: ventana de 90 min (`VUELTA_VENTANA_MS`), ámbar
    con más de 14 h; cuenta sólo lo de `cyc/claudecambios` y `mlapi/claudeexp`.
  - **Barrita piso/techo (7.27, etapa 8 también)** · robot `armarFicha().rayas` → `cyc/rayas/<MLA>`; web `rayasBarHTML` ·
    chequear: es la MISMA cuenta que las rayas de la línea de tiempo (`rayasPrecioLinea` = `_rayas`); sin 💰 no se dibuja;
    el punto respira sólo en 📈 buscando techo / 🪜 bajando; `cyc/rayas` se escribe con `ficha:go` (correr `ficha:<MLA>`
    sin go para ver la línea RAYAS).
  - **Camioncito y casilleros (7.28)** · `cajaViajeHTML` (usa `envDias`, `ENV_ROJO_DIAS`, `REPO_DIAS_DEMORA`, `cajaEntradoDe`);
    `_casTxt` (usa `_pvLimitePago`/`_pvHabilesHasta`, `PV_DIAS_PAGO`) · chequear: cajas llegadas sin camión; casilleros sólo
    en pedidos llegados sin pagar; vencido = 7 en rojo.
  - **Ventas por día (7.29)** · `_vpDiasStats`/`_vpDiaCabHTML` · chequear: la ganancia del día usa `efectivoCostoVP` /
    `pctGananciaVP` como los KPIs (sin canceladas); sólo con más de un día en el período.
  - **Un buscador en Listas y Gastos plegado (7.30)** · `#lista-buscar` + `_listaBuscarYa` (`_soloB`); `#cmp-nuevo` ·
    chequear: en Bs As → Dai Nippon el buscador está y busca sólo listas de Bs As; los textos "el resto con el buscador"
    apuntan al de arriba; Gastos: `addCompra` igual, sólo plegado.
- **ETAPA 7 DEL 20/10/2026 (v25.54), 4 revisores en máximo: lo chico HECHO.** Qué chequear en la próxima:
  · `buscaCoincide(q,...textos)` + `textosDeProd(p)` (sin tildes, palabra por palabra, nombre/colores/título ML/MLA/código PY) es LA
    búsqueda de Productos, Contar, Ventas, Rotación y Pedidos; un buscador nuevo usa ésa. Armar caja busca por renglón a propósito.
  · `#page-home` sólo se ve con `.active` (antes Inicio quedaba dibujado arriba de cada pantalla). Una pantalla nueva no puede tener
    `display` propio con `#id` que le gane a `.page{display:none}`.
  · Teléfono: `@media(pointer:coarse)` agranda 🧠/📈/chips/✕; colores de Pedidos en dos pisos (≤640px); flechas ‹ › juntas en Ventas y
    Métricas (no se corren con el "· hoy"); la › no pasa de hoy; `ttI`/`ttMostrar` hacen legibles los ⓘ al tocar; safe-area del iPhone.
  · Tema claro: tokens `--lv-*` en `:root`/`body.light` para `_pctNivel`, `VIVA_DIA_NIV`, `scoreColor`, `puntColor` (un color nuevo de
    nivel va como token, no en hex suelto); logo invertido en claro; `fmtUS2` para dólares con coma.
  · Pedidos: confirm en origen/solapa/no lo consigo, ✕ con `toastDeshacer`; sin colores, lo raro en "⚙️ cambiar o sacar ▾".
  · Navegación: `goTab` sólo apaga las pestañas del Arqueo; la línea de tiempo (z 9200) abre adelante de la ficha; cabeceras de ficha/🧠
    fijas; `irACaja` desde Inicio; `vpLimpiarFiltros` al entrar desde Ventas de hoy o el aviso; accesos del ícono (`shortcuts` del
    manifest + `_paginaDeHash`).
  · Textos: lo que decía "el robot" (cajas, precios, monotributo) ahora dice que lo hace Claude; "objetivo 25%" único; Rotación "En stock
    hace" con la regla de 30/120 días. `setPuntajeMeta` borrada (nadie la llamaba).
  · Las ideas grandes (para él) quedaron en `REV_PENDIENTE`; maquetas en el scratchpad de la sesión (se pierden con el contenedor).

- **El % de un producto no sube por ir en carrito (18/10/2026, v24.59, regla suya: *"no podés subir el % de un producto por venderse con otro… siempre el % de ese producto, no por venta"*).** `netoProductoVP(v)` (index.html): si la venta es parte de un carrito (misma cuenta y `numVenta` con 2+ renglones ese día) usa lo cobrado × la proporción neto/precio de una venta SUELTA de esa publicación al precio más parecido (o del producto); sin venta suelta, el neto repartido. Lo usan la línea de tiempo (ganancia y % por día; las referencias de los días viejos ya excluyen carritos) y el ranking por producto. Totales de plata (Inicio, Ventas, mes, cuentas, origen) siguen con el neto real. Chequear: un carrito no sube la línea del % · los totales no cambian.

- **Ventas x Producto (PC), tarjetas del mismo alto (18/10/2026, v24.58, pedido suyo: "quiero que todas las tarjetas sean iguales de grandes").** La fila de arriba (`.vp-pc-cab`) va sin saltos (`nowrap`) y la promo se resume en "🏷️ promo" / "🏷️ desc. ML" (el texto entero sigue en el detalle y en el globito). Cada renglón de producto (`.vp-pc-txt`) en una línea con "…"; 🧠 y 📈 fijos a la derecha. Chequear: ninguna tarjeta crece por un nombre largo, una promo o un cambio de precio; en ≤640px sigue la tarjeta del celu.

- **Proyección a fin de mes en Métricas (18/10/2026, v24.57, pedido suyo).** `renderLineChartFromScope`: dataset punteado "≈ Proyección" desde hoy al último día. Ritmo = promedio diario del período SIN hoy y sin los cargos del día 1 (retiro + gastos, `barDet`) si el campo es Ganancia CYC. Sólo vista general, una métrica, buckets diarios. Chequear: que en acumulativo arranque en el valor de hoy y no salga en meses cerrados.

- **Sin % de diferencia con números negativos (18/10/2026, v24.56).** El globito de Métricas decía "+45,4%" entre −$149.012 y −$272.977: era perder menos, no ganar 45% más. Con algún lado negativo dice sólo la plata y mejor/peor.

- **Los números de las cuentas en Armar caja con el tope del cupo (18/10/2026, v24.55, pedido suyo).** `renderOfiCaja`: `porCtaCupo` = lo sugerido limitado por `cupoRestante` (chicos contra `estPeq`, grandes contra `estGra`); "Todas" suma eso. Sin cupo cargado queda lo sugerido. El color sigue con `convieneCaja`. Chequear: Ayelen con 142 sugeridas y cupo 38 → dice 38.

- **El cupo de Full ya no suma lo vendido (18/10/2026, v24.54).** `cupoRestante` daba 54 en Ayelen (leído 38 + 16 vendidas) y ML seguía diciendo 38: el cupo no se libera al vender. Queda lo leído − lo mandado después. Chequear contra la pantalla de ML la próxima vez que lea el cupo.

- **La etiqueta de techo dice "2ª suba" en vez de "×2" (18/10/2026, v24.53, pedido suyo).** `estrategiaChip` en index.html (`e.n` = número de suba seguida).

- **Ventas x Producto en la PC, lo básico (18/10/2026, v24.52).** Él: *"hay muchas letras y numeros, quiero que todo eso este en el detalle al clickear"*. El renglón `.vp-pc` ya no muestra el N° de venta ni el total/neto de CADA producto; arriba va una vez el total y neto de la compra (`_tot`, `gn`) y el botón "detalle ▾" abre el mismo `_det` del teléfono (N°, cobrado·neto, costo, ganancia, total/neto por producto si son varios, cambios de precio). Chequear: carrito de 2+ productos (total arriba = suma), venta cancelada (sin total), y que el detalle abierto se recuerde (`vpDetOpen`).
- **Modo discreto (16/10/2026, v23.95).** Ajustes → Apariencia → `toggleDiscreto` (clase `body.discreto`, `localStorage cycDiscreto`):
  ventas vivas sin movimiento, figuras, fuego, brillo ni fondo de color; las que tenían efecto quedan con rayita izquierda de su
  color y las que temblaban/ardían con ✦. `_vivaPaso` no dibuja. Chequear: un nivel nuevo de `.viva` no puede volver a pintar
  el fondo en modo discreto (la regla usa `[class*=lv-]`).

### Inicio en el celular: sin logo y el dólar al final (21/10/2026, v25.79, pedido suyo)
- **Qué es:** en ≤640px `#home-dolar-logo` no se dibuja y `#home-cab` (dólar) va con `order:98`, antes de `.home-status`. **Dónde vive:** index.html (CSS). **Qué chequear:** que lo primero en el teléfono sea Ventas de hoy y que el dólar siga editable abajo; en la PC sin cambios.

### iPhone: el encabezado de cada página debajo de la barra de estado (21/10/2026, v25.78, pedido suyo)
- **Qué es:** `.page-wrap` y `#page-home` suman `env(safe-area-inset-top)` arriba; antes "← Inicio" quedaba debajo de la hora (barra translúcida, `viewport-fit=cover`) y no se podía tocar. **Dónde vive:** index.html (CSS). **Qué chequear:** en la etapa 7, que nada tocable quede en la franja de arriba del teléfono (botones fijos, carteles con `top:0`).
- **21/10/2026 · v25.80 · se sacó el botón 🛒 Lista para el mayorista** de Pedidos → Bs As (él: *"sacar eso no se usa"*). Sólo el botón: `titoAbrir`/`titoCerrar` y su CSS quedan sin llamar. **Qué chequear:** que nadie vuelva a proponer una lista para el mayorista sin que él la pida.
- **21/10/2026 · v25.81 · tarjeta de cada venta** (él, con capturas): (1) el 🔬 analizada · esfuerzo **no salía en NINGUNA venta**: `_ventaAnalisisDe` buscaba la venta por objeto y Ventas x Producto arma copias (`vpEntries`: `{...v,_dateKey}`); ahora también por firma (día, venta, publicación, hora). (2) sólo se marca 💳 Premium, la Clásica no. (3) sólo 🥇 1ª venta desde el cambio. (4) 💳 gemela **no es una estrategia** (*"es algo nuevo que se hizo y queda"*): salió de `ESTRATEGIA_UI` y `estrategiaDe` de una Premium con `gemelaDe` devuelve la estrategia de su Clásica (el robot sigue anotando `gemela` en su historia: es dato, no se muestra). (5) promo/descuento es estrategia sólo cuando la decidimos (entrarpromo); una venta con cupón o promo que puso ML muestra la estrategia real del precio y aparte "🏷️ ML puso $X" (caso: Cartas Casino salía "🏷️ promo · de 📈" estando en 📈 buscando techo). **Qué chequear:** que toda venta de las vueltas con `ventasvistas` muestre 🔬; que ninguna pantalla vuelva a mostrar 💳 como estrategia.
- **21/10/2026 · v25.87 · Arqueo en dos solapas y la tarjeta de producto chica (etapa 7).** Él: *"sacar eso de arqueo que no se usa [🏭 Proveedores]. en productos - arqueo que los productos muestren lo importante. el resto en desplegable al clickear en la tarjeta. que inventario vaya adentro de productos y que comparar vaya adentro de finanzas"*. Solapas: Finanzas y Productos (`goTab` sólo conoce arqueo/resumen/productos/oficinas). Comparar = `<details id="fin-comparar">` al final de Finanzas, se arma al abrirlo (`compararAbrir`). Inventario = `<details id="prod-inventario">` abajo de las fichas (`renderInv` al abrirlo). Se borraron la solapa y las funciones de Proveedores (ninguna se usaba en otro lado; `state.proveedores` se sigue leyendo para pedidos viejos con `proveedorId`). Cada producto es un `<details class="prod-card">`: a la vista foto, nombre, 🇦🇷/🇵🇾, 📈 línea, 🧠, ✕, costo US$ y $, precio de hoy, te queda $ y % (`margenMLDe`, color `pctColor`), activa/pausada con motivo y ⚠️ abajo de la meta; el resto (nombre editable, casillas, paquete, Paraguay, reclamos, `flujoPlataHTML`, `fichaDatosMLHTML`, variantes) adentro. Los botones van en un span con `preventDefault` (no abren la tarjeta). Probado en Chromium a 390 y 1200 px. **Qué chequear:** que una solapa nueva del Arqueo se sume a la lista de `goTab`; que lo abierto siga abierto al redibujar (`_detAbiertos`).
- **21/10/2026 · v25.86 · Pedidos con botón de cargar, Dai Nippon con pedido y lo cargado se descuenta (etapa 3).** Él: *"al agregar unidades a un producto carga al momento, tarda y borra cualquier movimiento hecho mientras cargaba. quiero un botón de cargar"*, *"en nippon ahora me pidió que haga un pedido así se lo cargan más rápido (…) copiar el mensaje y mandarlo por wsp. nombre, unidades y código"* y *"si me pide 10 y cargo 10 o más que salgan, si cargo 9 o menos que siga apareciendo lo que falta pero que indique en chiquito que pedí X"*.
  · Borrador: listener de `input`/`change` en captura en `document` para las casillas cuyo onchange llama a `_BORR_RE` (candSetPedir, pyArmSet, pyArmSetVar, listaSetU, listaProbSet, listaProbSetVar, pedSetVarU); el `change` no llega al onchange (stopPropagation en captura); `_borr` (onchange → valor), ámbar, `_borrReponer` por MutationObserver de `#page-pedidos`, barra `#borr-barra` sólo en Pedidos, `borrAplicar` corre cada onchange con `new Function` y `this.value` = lo escrito, con `renderPedidos`/`renderListas` en pausa y UN redibujado al final; `beforeunload` avisa si queda algo. **Una casilla nueva de unidades con otra función tiene que sumarse a `_BORR_RE`.**
  · Dai Nippon: se deshace la v25.47 (casilla `listaProbCasillaHTML`, pestaña 🧾 Pedido, casillas de 🆕 Nuevos en listas de Bs As). Todo usa lo de Listas: `cyc/listas_pedido_prob`, `cyc/listas_pedido`, `cyc/compraslista` (número #NNNN, Ya lo pedí descuenta de lo decidido, Llegó). En listas de Bs As el mensaje lleva "· cód <código>" en vez del precio. El robot ya cuenta `compraslista` en camino como viajando (`pedidostodo`, LIviaja): no hizo falta tocar sync.mjs.
  · `_pedTrasCargado`/`_pedPartirCargado`/`_pedYaCargadosHTML`: Paraguay probados (antes cualquier unidad cargada sacaba la tarjeta) y probados de listas; cantidad y q por color con lo cargado restado, "🧾 pediste N" en la tarjeta y en la casilla, lo cubierto en "🧾 Ya cargado en el pedido".
  · **Qué chequear:** escribir en dos casillas seguidas no pierde nada aunque llegue un dato; "Agregar al pedido" respeta los frenos (no llega al piso, ya viaja) con su confirmación; Dai Nippon: el mensaje copia nombre, unidades y código; 10 recomendados y 9 cargados → queda 1 con "pediste 9".
- **21/10/2026 · lecturas de la base con reintento y "⚠️⚠️ DATOS INCOMPLETOS" (etapa 4/5).** Una revisión decidió con la base contestando 500. `makeDB.req` (lib.mjs) reintenta las lecturas 3 veces (1/3/7 s) en 5xx o red; lo que igual falla queda en `dbConteo` y al salir la corrida imprime "⚠️⚠️ DATOS INCOMPLETOS … NO DECIDIR". CEREBRO §0 fila 4b y §6: primero la línea de techo, sin línea no se baja, datos incompletos no se decide. Probado con un servidor falso (500→ok al 3er intento, 500 siempre, 404 sin reintento). **Qué chequear:** que las vueltas lean el final del log antes de decidir.
- **21/10/2026 · v25.89 · las listas de Bs As (Dai Nippon) son del MES (etapa 3).** Él: *"solo podemos pedir lo que está en la lista del mes (…) si no está en la lista no lo saques de productos pedidos. pero sacale el cuadradito"*. `_listaMesDe(k)`: lista del mes = renglones de `mlapi/listas/<prov>` con `ts` ≥ la carga más nueva − 2 días; el producto se busca por `codLista` o `_listaFichaDe`. `listaProbCasillaHTML` (sólo listas `bsas`): fuera de la lista del mes no hay casilla (cartel "no está en la lista del dd/mm", y si tenía unidades cargadas, botón para sacarlas); dentro, el precio de la lista del mes al lado. **Qué chequear:** cargar la lista nueva todos los meses con `lista:` (si no, nada se puede pedir); que un producto sin `codLista` y con otro nombre no quede afuera por error.
- **21/10/2026 · v25.85 · total gastado del mes en "¿Falta cargar algún gasto?" (etapa 2) y el 🔴 techo no puede estar abajo de un precio mejor (etapa 1).** El total suma TODOS los gastos del mes (`renderComprasChecklist`). En `rayasPrecioLinea` (robot) y `_rayas` (web): un precio no es 🔴 techo si otro precio MÁS ALTO medido (5+ días, con ventas) dejó más plata por día (Persea: 🔴 en $14.360 con $14.850 mejor). **Qué chequear:** que las dos funciones sigan iguales; que el Persea ya no tenga 🔴 en $14.360.
- **21/10/2026 · v25.84 · Inicio vuelve arriba de todas las pantallas (etapa 7, revierte el arreglo T del 20/10).** Él: *"estamos acostumbrados a que se abra abajo y poder subir scroleando y entrar a otra tarjeta, es más fluido que apretar un botón para ir para atrás"*. `#page-home` siempre `display:flex`; `goPage` ya bajaba hasta el encabezado de la pantalla. **Qué chequear:** que la revisión de diseño no vuelva a sacarlo (decisión suya); que al volver con atrás quede donde estaba.
- **21/10/2026 · v25.83 · Pedidos hechos de Paraguay: ✅ gastos completos / ⚠️ faltan gastos (etapa 3).** Él: *"quiero que en la tarjeta de pedidos marque si están todos los gastos cargados o faltan"*. Sale de `pyRecargoReal(c).falta` (PY_GASTOS + dólar del día + dólares crudos), en `pyPedidoResumenHTML`. Ese día se cargó `retira=50000` al pedido del 19/10 (#1008). **Qué chequear:** que el chip y el "+N% recargo/estimado" digan lo mismo.
- **21/10/2026 · v25.82 · los desplegables no se cierran solos (etapa 7).** Él: *"abro un desplegable y después de un ratito se cierra"*: cada dato nuevo redibuja la sección y los `<details>` nacían cerrados. Ahora se recuerdan los abiertos (título sin números + id de la sección) y un MutationObserver los reabre al redibujar; cerrado a mano queda cerrado. Probado en Chromium. **Qué chequear:** que ningún desplegable nuevo dependa de su propio "recordar abierto" (ya lo hace éste para todos).
- **21/10/2026 · F7 SIN LÍNEA DE TECHO NO SE BAJA + 🔎 por línea de techo (etapa 1).** Regla suya: *"nunca puede bajar si no hay línea de techo y si no hay línea de techo tiene que buscar techo hasta que esté 95% o más seguro"*. `frenosBajas` F7: sin 🔴 de `rayasPrecioLinea` ni 🏔️ de techo95 (60 d) no se baja; no frena sobra, sin reposición, liquidando, remate ni la salida de una escasez; excepción `!sinlinea` + "EXCEPCIÓN: …". La 🔎 SIN AFINAR de `planilla` ya no se conforma con "probó techo en 60 días": entra todo lo que no tiene estrategia que explique el precio y no tiene 🔴 al 95% (bajando, volviendo, caja, prueba, sin estrategia), sin gemelas. **Qué chequear:** que un `decido` de baja sin línea salga 🚫 F7 y que el Persea y el Aer Jasmín aparezcan en la 🔎.
- **21/10/2026 · F8 ARRIBA DEL 💰 NO SE BAJA SIN 95% + estrategia 💰 `punto` (etapa 1, v25.90).** Regla suya con el Pendrive 8gb. `frenosBajas` F8 (después de F4): si el precio de hoy está 2%+ arriba del 💰 de `rayasPrecioLinea`, cuenta los días seguidos con stock a ese precio (desde el último cambio, días pausados afuera) y pide 95% (Poisson, λ = r💰 × gu💰/gu_hoy × días) de que deja menos plata por día; si no, frena y deja el detalle en `d.f8`. Afuera sobra, sin reposición, liquidando, remate, salida de escasez; `!sincerteza` + "EXCEPCIÓN: …". Tag nuevo `punto` (💰 buscando el de más ganancia) en `ESTRATEGIAS`, `ESTRATEGIA_UI` (`--es-sube-punto`), `pasajeDe`/`estrategiaPasaje` (vuelve como 🪜) y `tagDeMotivo`; cuenta como estrategia que explica el precio en la 🔎. **Qué chequear:** un `decido` de baja del Pendrive 8gb sin certeza sale 🚫 F8 con los números; la web muestra el chip 💰.
- **21/10/2026 · `bajastecho[:días]` (solo lee, etapa 1 precios).** Él, con el Persea ($21.990 → $14.950 de una el 20/10) y el Aer Jasmín ($19.490 → $18.190 a los ~7 días): *"bajando sin encontrar techo"*. Lista mis bajas (decido y descuentos) que deshicieron una suba mía de 5%+ de hasta 21 días antes sin 🏔️ de techo95 en el medio, con días de espera, tamaño de la baja y lo vendido al precio probado contra el ritmo de antes (azar Poisson). Desde el 21/10 F2 (≤15%) y F4 (15 días sin certeza) de `frenosBajas` las frenan; esto encuentra las de antes. **Qué chequear:** que dé 0 ❌ con fecha posterior al 21/10 (si aparece alguna, un freno no anduvo).

### Inicio: "🧠 Última vuelta de Claude" abajo de las tarjetas (21/10/2026, v25.77, pedido suyo)
- **Qué es:** `#home-vuelta` se movió de arriba (después de Ventas de hoy) a abajo de la grilla, antes de "en línea". **Dónde vive:** index.html. **Qué chequear:** que siga apareciendo y que no quede pegada a la grilla.

### Ventas de hoy: la barra de niveles se llena de a poco (21/10/2026, v25.76, pedido suyo)
- **Qué es:** `_diaEscaleraHTML` llena cada tramo en proporción (el de curso a medias, con el color del último nivel completo) y lo anima tramo por tramo (`.esc-fill`, keyframes `escLlena`); `_escPrev` guarda dónde quedó para que una venta nueva la empuje desde ahí.
- **Dónde vive:** index.html (`_diaEscaleraHTML`, CSS `.esc-fill`).
- **Qué chequear:** que no se vuelva a llenar desde cero en cada actualización; que el color del tramo a medias sea el del nivel alcanzado; sin animación con "menos movimiento".

### Probados se ve igual que Nuevos · Precios ML en Ajustes (15/10/2026, v23.58-23.59, pedidos suyos)
- Pedidos → Probados (`_pedidoItemHtml` con `_armU!=null`): tarjeta compacta como la de Nuevos (foto, nombre, código, US$ → puesto,
  pesos, lo vendido, % grande de "pidiéndolo queda"); la tarjeta de siempre va adentro de "detalle ▾" con su cabecera escondida.
  Bs As y Paulvic no cambian. Qué chequear: que el % grande sea el mismo que el veredicto ("pidiéndolo queda en N%").
- Ajustes: fuera el botón "Subir precios automático" (con SOLO_DATOS no hacía nada); quedan sacar descuentos y cargar stock.

### Revisiones y versión en Ajustes · rojo del tope en Facturas · % de la promo en Rotación (15/10/2026, v23.57, pedidos suyos)
- La revisión, la versión y los últimos cambios salieron de Inicio y viven en Ajustes. `renderRevPanel` lista las 9 etapas en el
  orden en que tocan (`revAgenda`), cada una desplegable con qué mira, última fecha, cuándo toca y lo que pasó (`REV_HIST`).
  **Al cerrar una etapa: fecha en `REV_HECHAS` Y un renglón en `REV_HIST`.**
- `renderNcFacAviso`: si alguna cuenta cierra el año arriba de H (misma regla roja de la tarjeta del tope), la tarjeta de Facturas
  de Inicio lo dice en rojo.
- `promoMargenDe`: en Rotación, si una publicación está en una promo mía (`cyc/promoclaude`, vigente), abajo del % (que es al
  precio tachado) va "🏷️ en promo a $X · Y%". Caso: Galaxy A07 a $394.690 tachado, $264.990 en promo hasta el 26/10.

### Tope de H en Facturas · detalle de Probados plegado (15/10/2026, v23.56, pedido suyo)
- `#home-parejo` vive en la página de Facturas (se dibuja al entrar, `renderHomeParejo`); en Inicio ya no está. En Pedidos →
  Probados, `pyProbVisHTML` (precio, código, fotos, links) va dentro de "detalle ▾"; la casilla de pedir queda a la vista.

### El 🧠 no repite la explicación (15/10/2026, v23.55, pedido suyo con la Lupa 90mm)
- `_repetido` del cerebro saca la etiqueta "Claude:" del principio y además compara un pedazo del medio (40 letras): un motivo de
  `cyc/claudecambios` que ya está en la nota no se vuelve a escribir en "Por qué cambió el precio". Qué chequear: que dos motivos
  distintos de la misma publicación sigan saliendo los dos.

### Pedidos: sin "Hola Tito" a la vista, colores con su 🧠 (15/10/2026, v23.53, pedido suyo)
- Bs As, Paraguay y Paulvic (misma tarjeta): la nota del 🧠 ya no se ve en la tarjeta ni el "Por qué N" abajo de 🧾 pedir; sale
  tocando el 🧠. Al abrir un producto con colores se ven sólo los colores (cada uno con su 🧠, `pedVarFila(x,p)`) y lo demás va en
  "más datos". Qué chequear: que el 🧠 de cada color abra la nota de ESE color.

### Armar caja: lo importante a la vista, el resto al tocar (15/10/2026, v23.50, pedido suyo)
- Cada renglón muestra nombre · variante · "tenés N" · casilla, y por cuenta "mandar N u." + código de etiqueta. Ritmo, 🧠, avisos y
  botones se abren tocando el producto (`cajaToggleDet`, recordado en `localStorage` `cycCajaAb`). Si hay un aviso importante
  escondido (falta crear la publicación, sin variante, sin publicar) el renglón cerrado dice "⚠️ ver detalle". Qué chequear: que
  ningún aviso que frena la caja quede escondido sin la marca.
- (v23.54) Lo que no tiene nada para mandar (en la cuenta elegida) y no está cargado en la caja va abajo, en "Sin recomendación
  para mandar (N)", cerrado (`localStorage` `cycCajaSinRec`). Qué chequear: que algo cargado en la caja nunca quede escondido.

- **Etiqueta de promo en el celu (13/10/2026, v23.35).** Se salía de la tarjeta por `white-space:nowrap`. En ≤640px `.vp-promo` baja de renglón. "discount" ahora dice "descuento". Chequear: ninguna etiqueta o chip de Ventas con `nowrap` y texto largo en el celu.

- **Venta en promo en dorado (v23.22, 12/10/2026):** `vpPromoLabel` (clase `.vp-promo`, también en `body.light`) dice "Descuento ML" si ML puso el descuento entero y "Vendido en promoción" si pusimos algo nosotros. Datos de `cyc/promoventa`. Chequear: que se vea en PC y celu, y en los dos temas.
- **v23.23 (13/10):** "Descuento ML" va en AZUL (`.vp-promo-ml`); el dorado queda sólo para "Vendido en promoción" (pusimos plata nosotros).
- **NO SÓLO ARREGLAR: PROPONER (09/10/2026, regla suya, ver etapa 6).** La revisión de diseño no se limita a lo que
  se ve mal o se corta en el teléfono: tiene que traer ideas que hagan la web más linda y más viva (efectos, color,
  movimiento con sentido — que el efecto diga algo del dato, como la velocidad = la plata), detalles de comodidad,
  cosas repetidas y cosas que faltan. Cada idea visual va con un ejemplo para mirar antes de aplicar.
- **Métricas → Tendencia** (`_metBarraOn`, `_metLegendClick`, `cycMetBarras` en localStorage): las barras
  de ganancia y gastos del día arrancan apagadas; se prenden en la leyenda y queda recordado. Chequear
  que al apagarlas la escala del gráfico se ajuste a las líneas.
- **El cambio de precio en cada venta** (`cambioVentaHTML`, 08/10/2026): con 2+ cambios en los 7 días
  muestra desde el precio de antes del primero hasta el último (y la plata de más contra ese precio);
  % de ganancia antes (≈, la misma venta al precio viejo: `comisionEnPrecio`, envío de Full por lado de
  la barrera, IIBB en proporción) → después (el real), con `pctColor`. Chequear que el % de "después"
  sea el mismo de la píldora de la venta.

### El brillo de cada venta va con el neto (09/10/2026, v22.85)
Él, con un Metatarso de $4.920 de neto lleno de estrellas por su 168%: *"quiero que el brillo vaya de mano con el neto"*.
`vivaVenta`: color por % (igual), pero figuras (`vi` → `data-vi`, cantidad y opacidad), brillo, flota y fuego sólo por el
neto: ≤$5.000 nada · $10.000 glow · $25.000 flota · $55.000 fuego. v22.86: fondo/borde/halo de cada venta también por
el neto (`--tint/--bd/--bw/--halo` inline en `vivaEnvolver`, `vi` de $1.500 a $80.000), figuras ∝ vi². Qué chequear:
una venta chica con % alto no brilla; $1.500 y $12.500 se ven distintas. v22.87: fuego sólo desde $100.000 de neto
(flota $30.000, glow $12.000, `vi` hasta $120.000). v22.88: `_vivaFuego` con colores de fuego, lenguas alargadas y
llamas desde el piso de la tarjeta (arriba se corta en listas con scroll). v22.89: fuego sólo con nivel ≥ bueno;
`#vp-day-list` sin scroll horizontal y con margen derecho de 56px en PC para scrollear la página. v22.90: el dibujo del fuego
vuelve al de v22.87 (le gustaba más) y la venta que arde lleva `.vf` (margen 46px arriba, 18px costados). v22.91: $100.000+ de neto tiembla siempre
(`ef:'tiembla'`), el fuego sólo desde Bueno. v22.92: intensidad `tm` (75% neto $30.000→$300.000, 25% nivel): flota → flota2 →
tiembla (tm ≥ .45) con amplitud `--tz` .6→3.2 y velocidad `--tv` .5s→.22s. v22.93: tiembla desde tm ≥ .3 y `--tz` = 3,4·tm^1,5
(Ferrari $59.000 ≈ 0,7 · SSD $297.000 ≈ 2,6). v22.94: el fuego sale de `fs` = ganancia × (%/30, entre 0,5 y 2,5);
arde desde 35.000 y la intensidad `fi` (data-vf, `_vivaFuego`) llega al tope en 250.000. #vp-day-list más ancho y con 26px a los costados. v22.95: `VIVA_NETO_MAX`=550.000 (venta de $650.000): vel y tm
llegan al tope ahí, tz=4,5·tm^1,5, tiembla desde tm .28, fuego tope 400.000.

### Ventas de hoy: Día · Mes · Año (09/10/2026, v22.84)
Pedido suyo: *"poner el selector de día, mes y año. y que siga el mismo pensamiento: el 7 del mes es 115.000 por los
días del mes"*. `_homePerTot(esc,off)` suma día por día con `_homeDiaTot` (el % sale de las sumas); `_puntajeDia` recibe
los días: 7 = $115.000 × días, 10 = el doble. Período en curso cuenta hasta hoy; los días antes del primer día con
ventas guardadas (01/05/2026) no cuentan. La vida de la tarjeta usa el promedio por día. Elección en `cycHoyEsc`.
Qué chequear: que el total del mes coincida con Ventas en "Mes"; que las flechas no pasen de hoy.

### El 🧠 nunca repite oraciones (14/10/2026, v23.39 `cyc-v619`, regla suya)
Él, con el Metatarso Fuerte: *"repite oraciones. no quiero que nunca repita oraciones"*. La nota de la publicación ya trae el
motivo del último cambio y abajo "Por qué cambió el precio" lo volvía a escribir. Vive en `cerebroBtn` (index.html, modo Claude):
`yaDicho`/`_repetido`/`_decir` comparan el texto normalizado (sin tildes ni signos, primeros 80 caracteres) y un motivo o nota que
ya está adentro de algo mostrado no se vuelve a escribir; si todos los cambios se repiten, no sale el título. Qué chequear: una
nota con el motivo adentro + el mismo cambio en claudecambios → sale una sola vez; un cambio con otro motivo sí sale.

### Ventas con vida (08/10/2026 a la noche, v22.78)
- **Qué es:** cada venta de Ventas x Producto (celu y PC) y la tarjeta "Ventas de hoy" de Inicio llevan color de nivel y figuras animadas atrás. Elegido por él con ejemplos.
- **Dónde vive:** `index.html`: CSS `.vw`/`.viva`/`lv-*`/`mv-*`; motor `vivaScan` (un solo reloj, sólo anima lo que está en pantalla, reloj de respaldo si el visor frena requestAnimationFrame); `vivaVenta` + `vivaEnvolver` (ventas) y `vivaDia` (Inicio). `_pctNivel` ahora devuelve también la clave `k`.
- **Reglas:** venta: color = % (7 niveles), velocidad = neto (log $1.500→$60.000), animación por puntaje = 40% nivel del % + 60% ganancia en pesos (|ganancia| log $300→$60.000; también las que perdieron): ≥4 brilla, ≥5,5 flota, ≥7 tiembla y arde. Estimadas y sin costo: grises y quietas. Canceladas: sin efecto. Día: color por ganancia en pesos (Justo 90.000 · Bien 115.000 · Bueno 150.000 · Excelente 190.000 · Estrella 230.000 · JOYA 300.000), velocidad y movimiento por total vendido (flota 600.000 · más rápido 1.000.000 · tiembla 1.400.000 · tope 2.500.000), fuego con ganancia ≥190.000 Y total ≥1.200.000.
- **v22.82 (09/10):** Ventas x Producto ya no muestra la etiqueta del rescate al vender (`rescLabel`, de `cyc/rescateventa`, robot viejo); agrandaba el renglón y decía "precios automáticos apagados".
- **v22.81 (09/10):** se sacó la pausa en el scroll (él prefiere que se mueva aunque se trabe un poco); qué tarjeta está en pantalla lo dice un IntersectionObserver (`_viva.io`) y sólo se mide el tamaño de las visibles. Inicio: la tarjeta del Puntaje del mes no se dibuja (`renderPuntajeMes` sigue calculando para ⚖️ y Rotación); "💸 cuánto cobrar" es un desplegable de Ventas de hoy (`_homeCobroHtml`, misma cuenta `cobroProxMes`, se calcula sólo abierto). Ventas de hoy sin la línea de abajo y con el puntaje siempre ("sin ventas todavía") para no cambiar de tamaño.
- **v22.80 (09/10):** rojas, naranjas, estimadas y sin costo quedan sin efectos (sólo el color del %); desde Bien la cantidad de figuras sube por nivel (`VIVA_NV`). Pedido suyo: "hay muchos colores y quilombo".
- **v22.79 (09/10):** se trababa al hacer scroll. Ahora durante el scroll no se dibuja ni se mide (clase `viva-quieto` en body, pausa las animaciones CSS), el brillo late con la opacidad de un `::before` del envoltorio (antes animaba `box-shadow`, que repinta todo) y el lienzo usa menos resolución.
- **Qué chequear:** que no tape números (alfa), que en el teléfono no se trabe con 200 ventas, que "menos movimiento" deje todo quieto, y que el % de la venta siga saliendo de `pctGananciaVP` (una sola fórmula).

- **v22.96 (09/10/2026) · Ventas: las figuras rompen el techo.** En las tarjetas con fuego (`c.fc`), `_vivaDibujarCard`: la figura que llega arriba rebota (`p.golpe`, `p.rb` .11 s, chispas `_vivaChispas`) y al segundo golpe pasa a `c.fuera` (coordenadas del canvas del fuego, +24/+70) y `_vivaFuego` la dibuja subiendo, girando y apagándose. Sin fuego, igual que antes. Chequear: que no se acumulen en `c.fuera` (vida ≤ .9 s) y que el offset 24/70 siga igual al CSS de `canvas.viva-fuego`.
- **v22.97 (09/10/2026):** el techo depende de la venta: `aguanta` = golpes hasta romperlo (fi ≥ .55 → 1, ≥ .3 → 2, si no 3; figuras rápidas `p.k` ≥ 1.3 lo rompen al primero); fuerza de salida, tamaño, giro, altura (vida) y chispas escalan con `fi` (Inicio usa .7 fijo).

- **v22.99 (09/10/2026) · rojas y naranjas grandes con vida:** en `vivaVenta`, `bajo` desde $60.000 de neto y `justo` desde $45.000 tienen brillo/figuras (`vi` .35→1 con el log del neto), flotan desde el doble y tiemblan arriba de ~$200.000; el fuego sigue saliendo del puntaje. Chequear: que las chicas sigan sólo con el color.

### El nombre de la ficha se lee entero en el celu (14/10/2026, v23.38 · `cyc-v618`)
- **Qué es:** el nombre en Productos pasó de casilla de una línea a texto que corta en renglones (`pname-area`); en ≤640px va primero y a todo el ancho. Enter guarda (no mete saltos de línea).
- **Qué chequear:** que renombrar siga guardando igual (`updProdName`) y que en la PC no quede un renglón vacío de más.

- **Barra de costado arriba de las tablas (18/10/2026, v24.47).** `_tblTopbars` (cada 1 s) pone una `.tbl-topbar` sincronizada arriba de
  cada `.tbl-outer` que no entra a lo ancho (Rotación y las demás). Qué chequear: que no aparezca en el teléfono cuando la tabla es tarjetas.

- **Ventas de hoy contra el promedio de 5 (18/10/2026, v24.48).** `_homeCurvaHTML` compara la ganancia acumulada a la misma hora
  contra el PROMEDIO de los últimos 5 días iguales que tengan ventas (antes uno solo, el de la semana pasada).


 · **El robot mide el producto vendido SOLO (18/10/2026).** `prepNetoSolo(vp)` (sync.mjs, misma cuenta que `netoProductoVP` de la web): la línea de tiempo (`mlapi/linea`, de ahí la ficha, los tramos y los juicios de techo) y el supervisor usan el neto que dejaría cada producto vendido solo, no el reparto del carrito. Comando `carritos[:días]` (solo lee) lista los productos inflados por carritos y los que caen abajo del piso. Chequear: si se toca una de las dos funciones, tocar la otra.

 · **Tags en Ventas (v24.60, 18/10/2026).** Arriba de la lista de Ventas, un botón por estrategia (`vp-tag-chips`, `setVpTag`, `vpTagsDeGrupo`) con cuántas ventas del período la tenían al venderse (`estrategiaDe`). Tocar uno filtra; se cuenta después de la búsqueda y la cuenta. Chequear: que la cuenta del botón coincida con los chips de las ventas.

 · **Total en blanco (v24.62):** en el renglón de la venta el total va en `var(--text)`, el neto sigue gris.

 · **Todos los tags en Ventas (v24.63):** los que no tienen ventas en el período salen apagados con 0 (no se pueden tocar).

 · **Detalle de la venta sólo con ▾ (v24.64).**

 · **Tags sin ventas en desplegable (v24.65):** `vpTagsCero`; a la vista sólo los que tienen ventas o el elegido.

 · **Detalle de la venta al tocar la tarjeta (v24.66):** `vpCardClick` (no abre si el toque fue en un botón, link, casilla o algo con su propio onclick).

 · **Ventas sin lápiz, 🧠 adentro del detalle (v24.67).** `vpToggleEdit` queda en el código sin botón.

### Etapa 5 · 20/10/2026 · auditoría · 12b del informe con lo caro que vendió una sola vez
La sección 12b (sin stock y vendían) pedía 2+ u. en 30 d y escondía lo caro que vendió una (Joystick Xbox Azul, Sennheiser,
Mercedes Club Black). Ahora entra con 2+ u. **o** $60.000+ vendidos en 30 d. Chequear: que el número de 12b se parezca al
"sin stock" del chequeo de la mañana.

### Etapa 3 · 20/10/2026 · fotos de "Para probar": los ids de Elegancia mezclaban candidatos
`revfotos.py` no entendía los ids de Elegancia (`c…e27`): el renglón `@@` se salteaba y el nombre y las fotos de ese candidato
quedaban pegados al id del de arriba (un Kundal). Así marqué "no" a un reproductor Fiio, una placa madre y una barra de sonido que
eran el mismo producto, y "ok" a dos Kundal que no lo eran. Arreglo: el script acepta `c\d+[a-z]\d+` y un `@@` que no entiende
corta el candidato anterior; `revcand` acepta esos ids y, con `ok`/`duda` sobre uno que sacó Claude por ese catálogo, lo devuelve
a la lista. Chequear: que cada hoja muestre el nombre del mismo id que se marca (mirar `sel.json` si dudás).

### Etapa 9 · 20/10/2026 · plan 20x: ayudantes por cuenta en la completa
`ficha:cuenta=<cuenta>` (sólo lee) imprime las fichas ENTERAS de una cuenta (activas, con stock o agotadas que vendían): Luciana
71 publicaciones, ~158 KB. La completa reparte las 4 cuentas entre 4 agentes que sólo leen; las vueltas cortas pasan a cada 2 h.
Chequear: que los ayudantes no corran nada que escriba y que cada publicación activa tenga juicio.

## 5 · DATOS, HISTORIAL Y CEREBRO (viernes · junta las viejas 8 y 9; datos e historial nació el 08/10/2026)
- **24/10/2026 · `revfondo`: que no se escape ningún producto** (pregunta suya: *"habría que hacer uno para los productos en general"*; eligió la 3a). Sólo lee: cada producto × cuenta (y color) con stock en Full y alguna publicación activa (sin gemelas), la última nota del 🧠 (`mlapi/claudeexp`) de sus publicaciones y gemelas; atrasado si tiene 2+ días y no vendió en 7, o 7+ días si vendió. Va en las lecturas de la completa y tiene que quedar vacía. Qué chequear: que la cuenta "N de M" tenga sentido contra las activas con stock; que al otro día de la completa dé 0 o casi; que una venta sola (✓ rápida) no la saque de la lista.
- **🔬 EL ANÁLISIS DE CADA VENTA EN SU TARJETA (21/10/2026, v25.74, pedido suyo).** `ventasvistas:<ts>|esf=<nivel>|<MLA>=<texto>;go`
  escribe `cyc/ventaanalisis/<día>/<id>` (mismas claves que `cyc/ventaprod`) para cada venta no cancelada del tramo (marca anterior, ts]:
  `{ts, esf, cambio, t, m, de, a}`. Hay cambio si después de la venta hay estrategia nueva (`cyc/estrategia/<MLA>`) o precio mío
  (`cyc/claudecambios`). Si un análisis no se anota, la marca NO se mueve. La web (`analisisVentaHTML`, en Ventas x Producto PC y celular):
  gris si no cambió, color de la estrategia si cambió, globito con qué pasó y qué se resolvió. **Chequear:** que el `esf` sea el que
  se usó de verdad, que el texto no traiga datos del comprador (la base la lee la web, el log es público) y que ninguna venta del
  tramo quede sin su análisis.
- **✅ LAS 2 DECISIONES DE LA ETAPA 5: ELIGIÓ LAS DOS (a) EL 21/10/2026.** Antes decía: ESPERAN SU RESPUESTA (junto con las 6 de precios y las 30 de diseño).
  (a) = la recomendada. 1 un remate decidido por mí con `decido …#liquidando/#remate/#sobra` no prueba remate: sus ventas abajo de
  20% cuentan como demanda (Pedidos vuelve a comprar lo que se liquida) → (a) la estrategia liquidando/remate vigente al venderse
  vale como la marca liquidando (y sobra abajo de 20% también) (b) sólo remate si estaba parado o se usó el comando `liquidando` ·
  2 la gemela Premium y su Clásica se juzgan por separado (techo95, rayas, ficha) aunque comparten demanda y stock: la Clásica
  "deja de vender" porque vende la Premium → (a) medirlas juntas por la clave de stock, como `planilla` (`kSt`) (b) seguir por
  publicación y avisarlo en el texto. (La plata parada compartida es la decisión 6 de precios.)
- **APLICADAS LAS 2 DE LA ETAPA 5 (v25.75, 21/10/2026).** Lo que se hizo, dónde vive y qué chequear:
  - **21/10/2026 · las 2 aplicadas (a).** 1 `clasificarRemates` con `estrat`: 📉/🧨/📦 vigente al venderse (`tagVigenteEn`, sólo lo anotado
    antes) + abajo de 20% = remate (`linea` y `pedidostodo`). · 2 gemela + Clásica (y repetidas) juntas por la clave de stock
    (`claveStockPub`, `lineaJuntaStock`; web `_lineaJuntaStock`, copia exacta): `techo95`, ficha (`juntaCon`), `frenosBajas`, rayas de la web.
    Qué chequear: la línea junta del robot y la de la web dan lo mismo (si se toca una, la otra); ninguna venta liquidando/remate abajo de 20%
    contando como demanda en `pedidostodo`; una ficha con gemela dice "🔗 medida junto con…".
- **CEREBRO.md §1 (20/10 a la noche, de la revisión):** las cortas leen también `preguntas` (antes no traían ninguna) · el log de
  las lecturas se baja entero y se chequean los `✓ terminó` · la completa corre `ventasraras:13` (las de la noche). Chequear:
  que la rutina lo haga.
### Etapa 3 · 20/10/2026 · los juicios de pedidos son un objetivo ("tener N"), no una compra fija
Idea 1 del ayudante de ideas: `decide_pedidos.py` copiaba la cantidad de `juicios.txt` aunque ya hubiera llegado la mercadería
(Cortapelo 2 en 1 con 10 en la oficina, 1 en 1 con 15, Lupa 75mm con 10 en Full: $185.034 de compra repetida). Ahora `juicioQ`
pide N − (Full + oficina + camino) y, si da 0, avisa "✅ juicio cumplido" para sacarlo o renovarlo. Se sacaron los 3 cumplidos.
Chequear: lo agotado pide lo mismo que antes; cada aviso de cumplido se resuelve en la completa.

### Lo que ninguna regla nombra: `raros`, revisor en contra y preguntas (20/10/2026, eligió 1abc 2a 3a 4ab)
Qué es: (1) probe `raros` (sync.mjs, solo lee, va en todas las vueltas): cada publicación contra su propio año (🧭), cruces de
sentido común (🔀), dato dudoso que frena tocar el precio (⚠️), y precio sin certeza con familia, visitas y parecidas (💭).
(2) Un sexto ayudante "revisor en contra" en la completa, antes de aplicar. (3) `ml-sync/notas/preguntas.md`: cada corrección
como pregunta general. (4) CEREBRO ordenado con la tabla de quién manda: aprobado el 20/10 y reemplazó a `CEREBRO.md` (el detalle viejo quedó en su ANEXO). Qué chequear: que una regla nueva entre en su tema arriba y no sólo en el anexo, y que el anexo no contradiga la sección 0. Dai Nippon y toda lista de Bs As también se mide contra ML (20/10, suyo). Esfuerzo de cada parte fijo (sección 2 del CEREBRO).
Qué chequear: que 🧭 y 🔀 no salten en la mitad del catálogo (un aviso que suena siempre no se mira: el 20/10 el primer intento
daba ⚠️ en 156 de 235 por la marca `inc`, y "cobra distinto" en todo lo subido a propósito; se sacaron) · que lo que está en ⚠️
de verdad no se toque · que las familias del 💭 se juzguen cuando ya se sabe · que cada corrección nueva sume su pregunta.
Y quién piensa cada renglón (20/10/2026, eligió la a): en la completa, los de cada cuenta van a su ayudante; en las cortas, hasta
~8 los miro yo y con más, un ayudante en Alto. Los ayudantes sólo proponen; aplicar es mío. Qué chequear: que en el chat de cada
vuelta diga quién miró los raros, y que ningún ayudante haya corrido algo que escribe.
- 20/10/2026 · `vistas[:días]` (solo lee, ml-consulta): cómo reaccionan las visitas con la línea de tiempo de todas las
publicaciones: cambios de precio (sin y con tachado), caja, sin stock, lo nuevo por semana, y días con tachado contra días sin
tachado al mismo precio final. Corrige cada comparación con un panel: las otras publicaciones con visitas sabidas esos mismos
días y sin cambio de precio en el medio (el índice encadenado del primer intento se infló ×19 con el ruido). Qué chequear: que los días con tachado salgan de mis promos y de ventas en promo sin cupón, que cada grupo
diga cuántos cambios midió (con pocos no se concluye) y que no imprima nada de compradores.

- **20/10/2026 · v25.44 · la línea de tiempo de costado en el teléfono** (etapa 7, diseño). Pedido suyo: que abra de costado aunque tenga el giro bloqueado. Una página no puede girar la pantalla con el giro bloqueado, así que se gira el contenido (`_lineaAplicarGiro`: en un teléfono parado, `linea-modal` mide alto×ancho y va rotada 90°). Botón "⤾ parada" lo apaga (`localStorage` `cycLineaGiro`). `_lineaLlenar` mide la altura desde el borde derecho cuando está girada. Chequear: que en la PC y con el teléfono acostado no cambie nada; que el gráfico llegue hasta el borde; que el scroll ande.

### Etapa 5 · 20/10/2026 a la noche · arreglos de la línea, el ritmo y las vueltas
Todo en `ml-sync/sync.mjs` salvo el 11 (los dos `.py` de `ml-sync/notas/`). Probado con el código real y bases de mentira.
1. **Remate con historia:** al caerse una marca `liquidando` (stock 0, ya no hermana, `liquidando:-`) queda su período en
   `cyc/nosubirhist/<MLA>/<desde>` = `{hasta, por}` (`anotarFinLiquidando`); si no se pudo guardar, la marca NO se borra.
   `clasificarRemates` (noche `linea`, `pedidostodo`) cuenta las ventas dentro de un período ya terminado. Con `SOLO_DATOS` la
   etiqueta `remate` de `cyc/rescateventa` se escribe igual (sin rescatar). Chequear: una marca caída deja su renglón en nosubirhist.
2. **Canceladas tarde:** la noche relee 45 días (no 7) y `linea:atras` corrige los días de ventas (`_difVentasLinea`): un día que
   la línea tiene con u>0 y el panel ya no, pasa a 0. Chequear: una venta cancelada a los 10 días baja de la línea.
3. **Caja de una pausada:** `caja`/`ptw` en la línea sólo si la publicación está activa y la caja tiene menos de 26 h; `ritmo`
   no toma la caja de días no activos. Chequear: una pausada no "gana" en la línea.
4. **Ritmo normal:** `calcRitmoNormal` saca canceladas y devoluciones con `_esCancelada` (antes sólo `v.cancelada`: un reclamo contaba).
5. **Antes del alta:** la línea (ventas y relleno de stock) no escribe días anteriores a `altaTs` de la publicación (las gemelas nuevas).
6. **Supervisor `stockDe`:** si hay clave del producto se usa ésa; si no, la suma de colores (antes sumaba las dos: ×2).
7. **`planilla`:** si quedaron publicaciones sin leer, "Cuenta completa" dice ⚠️ FALTAN N SIN LEER y cada lista lo repite.
8. **Preguntas (`preguntas` y sección 10 del `informe`):** la cuenta sin token o que ML no contestó sale "no leída / no pude
   entrar", el corte dice "leí N de M" y el total "o más · ⚠️ INCOMPLETO" (antes faltaba o decía 0).
9. **`historia` y `cajasnotas`:** sin fichas o vínculos no arman nada ("⚠️ NO LEÍ"); papelera, no traer, pasara, decisiones y
   notas que no se leen se avisan (no son vacío); `cajasnotas` dice "N productos de M fichas con mercadería en la oficina".
10. **`entrarpromo`:** cada entrada y salida deja `cyc/promohist/<MLA>/<ts>` = `{de, a, tipo, nombre, accion}` (de = lista, a = promo).
11. **`decide_cajas.py` / `decide_pedidos.py`:** un renglón de producto que no se entiende ya no le pega sus colores al de arriba;
    si algo no cierra, falta un grupo (BSAS/PY/PAULVIC) o la línea "CUENTA: … ✓", salen con error SIN escribir. `decide_cajas`
    pide el dólar y rechaza `;`. `decide_pedidos` dice "de N para decidir (M fichas, F fuera)". Y `decido:archivo=` rechaza el
    archivo entero si una clave (`ped:id#color=u`, `caja:id@cta#color`, el precio de un MLA) aparece dos veces.

### Etapa 5 · 20/10/2026 a la noche · arreglos de la ficha y el techo
Todos en `ml-sync/sync.mjs`, probados con la función o el bloque real y datos inventados (antes → después).
- **`diaConStock`**: un día pausado o cerrado (est ≠ active) que no vendió ya no cuenta como día con stock. Qué chequear: que una
  suba seguida de una pausa de ML salga "en curso" y no "perdió".
- **`ficha:go`**: si guardó menos fichas de las que tocaba o la relectura no coincide, dice ⚠️ y sale con código 1 (antes ✓ con 0 de 2).
- **🏆 de la ficha** = `rayasPrecioLinea(...).best` (la misma cuenta de la línea de tiempo y de `techo95`).
- **Lo que le pega el precio** (`reaccionesDe`): medianas y elasticidad con el ritmo suavizado (u+0,5)/días y con TODOS los cambios;
  no dice "subir le deja más plata" si alguna suba bajó las ventas con certeza (`reac.subaFreno`).
- **"En curso"** de la ficha: sólo el último cambio, si está en curso o sin certeza y su precio es el de hoy (±2%).
- **Veredicto de cada cambio** con Poisson sobre la plata por día (λ = ritmo antes × gan/u antes ÷ gan/u después × días después);
  sin 95% → "sin certeza". Guarda `nec` (lo que hacía falta vender).
- **Día de la semana**: sólo se afirma con certeza (Poisson del día contra el resto, <5%/7); si no, "no se distingue el día (pocas
  ventas)". Plurales bien.
- **Caja y visitas**: "vende igual perdiendo la caja" pide 3+ ventas de cada lado y certeza; "siguen a las visitas" pide rv > 1,3 y
  ~8+ ventas. Si no, "es una pista".
- **Fechas especiales**: la base saca los días en la ventana de cualquier otra fecha; con menos de 7 días de base no compara.
- **Edad del stock** (`fichaExtras` §6): `lotesFifo` + `tablaAntiguoDe` (como `antiguo`: Excel, cajas, `stockhist`), con respaldo de la
  línea que marca los huecos ("hasta X días"); stock de hoy 0 o sin dato = no dice nada; el aviso usa los días de gracia del producto.
- **`ficha:cuenta=`**: decide después de leer la línea (activa, con stock o vendió en 60 d) e imprime "N de M (K afuera)".
- **Ficha**: el log dice cuántos tramos anteriores no se muestran.
- **`diasTachado`**: corta el tramo de descuento/promo en el fin conocido (el "hasta" de la promo o "Salí de la promo").
- **`techo95:go`**: ya no borra las 🏔️ viejas de la historia (la estrategia que tenía cada venta pasada no cambia); si ya está anotado
  igual no lo repite; el resumen cuenta las "sin ficha", las "no leí la línea" y las miradas.
- **`lupa`**: el stock de hoy es el del último día con dato (como `raros`); sin ningún dato: "stock ?", sin AGOTADA ni "desaparecieron".
- **`escasez` · 🔁 mis subas cuya razón cambió** y el "en escasez" de cada cambio de la ficha: el tipo sale de la estrategia que tenía
  la publicación en ese momento (`tagEstrategiaEn`, misma regla que `tagEnMomento` de `pedidostodo`); el motivo, sólo de respaldo. El
  encabezado dice "N de K decisiones con tag escasez/sinrepo en 60 d".
- **Turno del expediente** (`escasez:expediente`): los quietos entran si su última nota del 🧠 (`mlapi/claudeexp/<MLA>.ts`) tiene 2+ días
  o no existe (antes un tercio fijo por día). Sin poder leer las notas, vuelve el turno fijo y lo dice.
- **`raros` y `lupa`**: "Miradas N de M vivas con ficha".
Qué chequear en la próxima: que `techo95` no muestre "ya estaba anotado" en algo que cambió de motivo, y que el expediente no se
dispare a todo el catálogo el día después de una vuelta sin notas.

### Etapa 5 · 20/10/2026 a la noche · arreglos de la línea de tiempo en la web
**Arreglos web de la línea de tiempo y las estrategias (fixer F, 21/10/2026, v25.61):**
 · Margen del carrito sin costo: la línea (`gd`/`_gdPanel`/`_gdViejo`) y el ranking de Ventas x Producto usan `efectivoCostoVP({...v,neto:netoProductoVP(v)})`. Chequear: una venta sin costo en un carrito nunca da pérdida · un día todo sin costo no tiene % · venta estimada con "≈" y en gris.
 · Caché de `lineaAbrir`: sólo guarda `porMla` (la línea del robot), vence a los 10 min, con `fallo` o una publicación faltante se relee; los cambios de precio salen de state en cada dibujo. Chequear: un `decido` hecho con la línea abierta aparece al reabrirla.
 · `cambiosPrecioLista(mlas|null)`: la ÚNICA lista de cambios de precio (supervisor, claudecambios que le gana al evento repetido, autoprecio salvo 'subiendo', `cyc/promohist`, promoclaude). La usan `lineaPintar`, `cambiosPrecioDe` y `_ltCambios`. Chequear: el mismo cambio sale igual en la venta, en la línea del producto y en la de todos.
 · `cyc/promohist/<MLA>/<ts>` = {de,a,tipo,nombre,accion:'entra'|'sale'}: lo lee la web; lo escribe el robot (sin eso una promo terminada pierde su ▼).
 · `_promoTipoEn(mla,ts)`: tipo de promo vigente en esa fecha. Lo usan `estrategiaDe` y `estrategiaPromoAjuste`. Chequear: una venta vieja no cambia de tag porque hoy haya un descuento.
 · `_estrategiaPrimeraTs` y el tag ▫️ `noanotada`: antes de la primera anotación de estrategia no se dice "el cerebro la tiene que decidir"; al elegir la estrategia del día y en el "· de X" se trata como 'sindecidir'. Aparece también como chip de filtro en Ventas.
 · Stock que no se sabe (`_stCiegoTxt`): lectura fallida, o color elegido con una publicación de 2+ colores en `invVar` → los días viejos en gris con el motivo, sin llegadas inventadas. Hoy muestra el stock real.
 · `_pedidoViaja(prodId,_lineaVar||undefined)`: el pedido en camino se mira por color.
 · Globitos: semana del lunes en cada día · visitas en el carril de ventas · texto del carrito ("en Ventas figura lo cobrado repartido; acá lo que deja vendido solo") · "todavía no hay 7 días con dato". Promedio de 7 días: el producto estima los 6 días previos; en la línea de todos queda vacío si la ventana empieza antes de lo guardado.
 · Precio de hoy = último `a` de hoy de los cambios frescos; pIni/pFin usan `pLista||p`. Línea de todos: `n` cuenta compras (`vpGrupoKey`); la caja de `_lineaJunta` ignora publicaciones no activas (igual que `calcLineaTodo`).
 · Cabecera de las dos líneas: título solo arriba y botones abajo (`.linea-btns`, giro con ancho mínimo 96px): ningún botón se corre al cambiar el título. Falta mirarlo a 375px.

## 5b · DATOS E HISTORIAL (la vieja etapa 8 del 08/10/2026; desde el 20/10 la revisa la 5 · lo que diga "Etapa 8" antes del 21/10 es esto)
- 20/10/2026 · la ficha (`armarFicha` → `reaccionesDe`, `mlapi/ficha/<MLA>.reac` y `.reacTxt`; en la web "Cómo reacciona este
producto") dice por publicación: caja ganando/perdiendo, ventas contra visitas, cambios de precio, fechas especiales, sin stock y
tachado. Los días con tachado salen de `diasTachado` (la misma función de `vistas`). `vistas` suma la sección F (fechas
especiales, lo regalable contra lo demás). Qué chequear: que con pocos días diga "pista" y no concluya, que "vende sólo ganando"
pida certeza (Poisson < 5%), y que las fechas comparen sólo días con stock.
- 20/10/2026 · la ficha suma "Más datos para decidir" (`fichaExtras`, `datos`/`datosTxt`): reposición y costo de reponer hoy,
"no lo consigo", reclamos de 90 días con motivo, lo que se queda ML (`cyc/netopub`), competencia (caja de la línea, `cyc/techofull`,
visitas de la ficha del catálogo), día de la semana y mes, edad de la unidad más vieja en Full (primero entra primero sale con la
línea de tiempo), opiniones/preguntas/tipo/foto de ML (`mlapi/opiniones`, `ficha:go` relee 150 por noche cada 7 días; medido con
`fichaml`: `/health` y `/performance` ML no los da para catálogo) y las otras publicaciones del mismo producto. Y la elasticidad
(cada 10% de suba, cuánto vende menos) con 3+ cambios. Qué chequear: que "ML pide $1.000" abajo del costo no se lea como precio
posible, que las fechas sin ventas de ningún lado no salgan, que la edad del stock diga "por lo menos" cuando no se vio entrar.
- 20/10/2026 · planilla 🛡️: lo que ML tiene en revisión (`under_review`) pasa a excepción ("no deja cambiar el precio") en vez de
"para subir": no se puede tocar y quedaba en la lista para siempre. Qué chequear: que al liberarla vuelva a la lista.
- **🚧 El techo en la línea de tiempo (18/10/2026, v24.49).** `lineaPintar` dibuja una raya roja punteada en el carril del precio por cada `cyc/techofreno/<MLA>` (`probado`, roja "ya no vende") y otra verde en `volvio` ("sí vende") de las publicaciones del gráfico (respeta el color elegido), desde el día que se anotó; entra en la escala. Qué chequear: que todo techo encontrado se anote con `techofreno:<MLA>=<precio>|motivo;go` (si no, no aparece).
- **Reloj de los 4 meses en la línea de tiempo (16/10/2026, v23.92 · corregido en v23.93: EDAD DE LA UNIDAD MÁS VIEJA, primero
  entra primero sale — lotes armados con stock de hoy − el de antes + lo vendido; él: "el stock va rotando").** Carril de stock: barra roja por día = edad del lote más viejo
  (v23.94: el día del Excel de lotes de ML, `cyc/lotesfull` `ref`, los lotes se reemplazan por las edades reales de ML)
  (v23.96, él: "sólo los del Excel pagan": producto del Excel = sus lotes viejos + el resto con nuestras fechas; producto que NO figura
  = el día del Excel ninguna unidad puede tener 120+ días; se corrige en una segunda pasada, también hacia atrás. Chequear con `lotesfull` sin args.)
  ÷ `almacDiasDe(p)` (120 chico · 60 Tenders); vuelve a 0 cuando el stock queda en cero; arranca desde `_stHistDesde`
  (historial o lotes de ML) si es anterior al gráfico. Arriba a la derecha "⏳ faltan N d". Chequear: que no se cuente un día
  sin dato como "con stock" (usa `_conSt`, la misma regla que la franja verde/roja). Es aproximado: manda la unidad más vieja.
Todo lo que guarda la historia día por día y las pantallas que la dibujan.
- **Línea de tiempo por producto** (`mlapi/linea/<MLA>/<día>`, `_lineaJunta`, `lineaPintar`): stock,
  precio, caja, visitas, ventas, remate, escalera; el día de hoy armado en la web; campo ausente =
  no se sabe (nunca cero).
- **Línea de todo** (`mlapi/lineatodo`, `calcLineaTodo`, `lineaTodoPintar`): suma de todos los
  productos; precio como promedio de cambios (sólo cambios entre ×0,5 y ×2), subas/bajas, ganancia
  del día con la misma cuenta que Ventas, cambios del robot desde supervisor + autoprecio sin repetir.
- **Color de "$ ganancia/día"** (`ganColor`, las dos líneas): verde > $0, rojo < $0, **gris en $0** (15/10/2026,
  pedido suyo: en verde se leía como ganancia). Chequear que las dos pantallas usen `ganColor` y no un color propio.
- **Relleno hacia atrás** (`linea:atras`, `mlapi/lineaprog`): ventas, visitas (`:rehacer`), precio,
  stock a medias por cupo de ML.
  Desde el 08/10 el stock va primero por los depósitos de publicaciones activas con stock, después activas
  o con stock, y al final los sin ficha (`_prio`); el log dice cuántos pendientes son útiles (`pendUtil`).
- **En la línea de un producto (08/10/2026)**: precio y costo comparten carril y escala (`pcMin/pcMax`,
  piso = el más bajo de los dos, techo = el más alto); llegadas de stock (`stIn`: stock de hoy − el
  anterior + lo vendido en el medio, 2+ u. o desde cero) con marca celeste; el globito es por carril.
  Chequear que una devolución de 1 u. no se marque como llegada.
- **Ritmo normal** (`cyc/ritmonormal`, `ritmo:go`): ventas sin remate ÷ días con stock sin remate.
- Chequear: totales de un día contra Ventas de ese día · stock contra el Arqueo · que un día sin
  lectura no se dibuje como cero · que hoy diga "incompleto".

- **Línea de tiempo: "alcanza N días" con una sola cuenta (08/10/2026, v22.75):** el resumen usaba `_conSt` (días con stock
  supuestos por el historial) y la línea `conS` (sólo días con venta o stock anotado): el Pendrive 32gb decía 52 d · sobra
  arriba y verde en la línea (real ~31 d). Ahora los dos usan `_pdiaAntes(i)`. Chequear: que no vuelva a haber dos cuentas
  del mismo ritmo en la línea.

- **Revisión de la etapa 8 (12/10/2026, v23.15) · web:** (1) en `lineaPintar` las unidades (`u`, `uR`) de cada día salen del
  PANEL desde su primer día (`_vp1`), con el mismo filtro que la ganancia: la fila de ayer del robot llega ~06-07 h y no ve lo
  cancelado después (un día que vendió 4 decía "no vendió" y la franja de stock salía roja). (2) La ganancia de la línea de un
  producto (`gd`, `_ganPre`) y la de la línea de todos (`vd`) llevan `_dateKey` = misma cuenta que Ventas (costo y dólar del
  mes). (3) "En remate" en la línea de un producto = `ventaEnRemate` (la misma regla que la línea de todos y Pedidos). (4) Sin
  ritmo para medir, el stock va en gris "sin ventas para medir el ritmo" (antes violeta "+999 d exceso"). (5) Hoy: stock sin
  negativos y `qty||0` como Ventas; el "stock hoy" del resumen usa la misma ventana que el último punto.
  Chequear: que ayer a la mañana la línea ya muestre las ventas del panel; que la ganancia de un día coincida con Ventas.
- **Revisión de la etapa 8 (12/10/2026, v23.16) · robot e historial:** línea de tiempo · (1) `linea:go`: el color de la
  publicación sale también del TÍTULO (`linksConColor`, misma regla que `_varPorMla`); con color y sin clave de ese color, o
  producto con colores sin color identificado, el stock queda sin dato (antes ponía el del producto entero: Centímetro 10 →
  107 y "llegaron ~97" falso); el stock de ayer suma lo vendido de madrugada (`vendHoy`: corre 06-07 h y la web veía una
  llegada falsa); las ventas de los 7 días anteriores se releen del panel cada noche (tardías, canceladas, neto real).
  (2) `linea:atras` stock: un depósito queda "hecho" sólo si se leyó el año o ML contestó 4xx (corte de tiempo, 429, 5xx o red
  = se vuelve a pedir; `lineaprog/stock.ok` sólo sin pendientes, sin fallas y sin medias); sin movimientos se pide el stock de
  ESE depósito (antes la clave del producto); una publicación con varios depósitos se escribe sólo si se leyeron todos en la
  misma corrida (si no, se releen juntos). (3) `linea:atras` ventas: una cuenta con la lista cortada no escribe nada.
  (4) `calcLineaTodo` y `_lineaJunta` (web): color del título; una publicación de un color sin identificar cuenta sólo su
  depósito como un color aparte; índice de precio: los saltos se recortan a ±×2,5 en vez de tirarse (la escasez del cerebro
  llega a ×2,5). Ritmo normal · (5) el remate de un color marca sólo ese color, no el producto ni las hermanas (`marcaDesde`,
  `d[3]`); una baja de remate/escalera de autoprecio vale si no terminó el remate; sin poder leer la línea NO se guarda el ritmo
  (pisaba el bueno con uno corto). Registros · (6) poda del registro de stock en `podarStocklog`, 430 días, dejando el último
  cambio ANTERIOR al corte (antes el último de toda la clave: borraba el "tenía stock desde hace 150 días"); corre también en
  `ritmo:go` (el supervisor sale temprano en sólo datos); `alertaslog` se poda a 90 días. Supervisor · (7) costo, dólar y
  monotributo del MES del cambio (`armarCostoWeb`, igual que la web): un `poncosto` ya no reescribe meses cerrados; dos cambios
  distintos de la misma publicación el mismo día ya no se pisan (id con hora); la foto de precios no copia filas `sinMedir` y
  "ya anotado" busca desde la foto anterior (armaba un "a mano" falso que dejaba el cambio real en curso para siempre).
  Otros · (8) el aviso de chat nuevo de Telegram lleva sólo la inicial (`_tgMask`: se reimprime en el log público) · cargar un
  mes cerrado a mano guarda el dólar de ESE mes, no el de hoy · `costomes:<AAAA_MM>` vuelve al comando viejo y el nuevo arma los
  meses hasta el actual (tenía octubre fijo). No se hizo: Pedidos por cuenta con remate en una sola (Pedidos ya no propone
  números, `SOLO_CLAUDE`); `entregas` no ve devoluciones posteriores a la entrega (chip "↩ volvió" casi nunca sale); `informe`
  con más de 36 h; `ventaborrada` 60 d contra un relleno de más días.
  Para decidir él: (a) una sola definición de "venta en remate" (prueba + % bajo, su regla O2) en robot y web; (b) qué dólar
  usa un mes al cerrarlo (hoy: el del día del cierre, y la ganancia del mes cambia al cerrar).
  Chequear: que `linea:go` no deje sin stock lo que tiene colores dentro de una publicación; que `ritmo:go` diga cuántos
  renglones podó; que lo que trajo el robot de agosto no cambie de una noche a otra.
- **Las dos decisiones de la etapa 8, de él (12/10/2026, v23.17): 1a y 2a.**
  · **1a · venta en remate = UNA regla** (`clasificarRemates` en sync.mjs): % de la venta con la cuenta de la web
    (`armarCostoWeb`) abajo de `VENTA_REMATE_PCT` (20) **y** prueba: etiqueta `remate` (`cyc/rescateventa`), marca
    `liquidando` de antes de la venta, baja de remate/escalera de antes que no terminó, o `paradoEnLinea` (30+ días con
    stock en los 45 anteriores vendiendo menos de 1 por semana; sin stock sabido, baja de precio 12%+ y casi sin
    ventas). `linea:go` (noche) la calcula y guarda `cyc/ventaremate/<día>/<id>` = 1 (si una línea no se lee, queda lo
    de antes); `linea:atras` usa lo guardado; `ritmo:go` (`calcRitmoNormal`) y `pedidostodo` la usan; la web
    (`ventaEnRemate`) SÓLO lee `state.ventaremate`. Reemplaza la regla del 03/10 (toda venta abajo de 20%) y el 10% de
    `pedidostodo`. Chequear: que el log de `linea` diga cuántas son remate y cuántas "demanda"; que ninguna venta de
    hoy aparezca como remate; que Pedidos y la línea den las mismas unidades en remate.
  · **2a · dólar del mes cerrado**: `saveSnapshot` guarda `tcMes` (dólar cargado del mes o promedio de sus ventas;
    si no hay, el del día) además de `tipoCambio` (el del día, para el Arqueo). `histTCforYM` (`_tcGananciaSnap`) y
    el robot (`armarCostoWeb`, `costomes`) usan `tcMes` y, en cierres viejos sin él, `tipoCambio`. Chequear: cerrar un
    mes no cambia su ganancia en Resumen.

### Línea de tiempo: renglones juntos (20/10/2026, v25.21, pedido suyo: *"juntar las líneas, así no ocupan tanto lugar. lo mismo con ventas y visitas"*)
Ganancia/día y ganancia/semana comparten el carril `gan` (`_lineaSemSvg(...,junto=true)`: la semana en violeta detrás, su número en
el 2º renglón de la derecha); las visitas van en el carril `vent`, en celeste detrás de las ventas, cada una con SU escala (`maxU` y
`maxV`). Ya no existen los carriles `ganS` ni `vis`. **Chequear:** que las dos escalas no se mezclen (una barra de visitas no es una
venta) y que el globito de cada día siga diciendo los números.

### Línea de tiempo: sin stock el precio no baja solo (12/10/2026, v23.19)
Él: *"al quedar sin stock el precio de venta baja. ¿está bien eso?"*. En `_lineaJunta`, una publicación
PAUSADA ya no entra al "más barato de todas": se trata como un día sin estado (vale la que vendió más
reciente en 30 días, o la última activa). Antes, al agotarse, ganaba una publicación vieja y barata y la
línea bajaba sin que ningún precio hubiera cambiado. **Qué chequear:** un producto agotado mantiene la
línea del precio en el de la publicación que vendía.
**Ojo, aparte:** los días CON ventas la línea es lo COBRADO por unidad (03/10), que mezcla colores a
distinto precio y carritos: puede subir y bajar sin ▲▼ (las flechas son sólo cambios de precio de la
publicación).
**DECIDIDO POR ÉL EL 12/10, eligió la (b): la línea sigue mostrando lo COBRADO los días con ventas.** No volver a
proponer cambiarla al precio puesto.

### Línea de tiempo: desde una venta abre la de ESA variante (12/10/2026, v23.20)
Él: *"al apretar línea en una variante, quiero ver la línea de esa variante"*. `lineaBtn(prodId,txt,varSel)` y
`lineaAbrir(prodId,ev,varSel)`; la variante sale de `_lineaVarDeVentas` (la de la venta o, si no la trae, la de su
publicación por `_varPorMla`). Si el carrito trae dos colores del mismo producto, abre todas. Si el nombre no está
entre los colores de la línea, cae a "todas" (no se inventa). **Qué chequear:** que el color elegido arriba de la
línea sea el de la venta.

### Buscar el techo de lo que vende bien (12/10/2026, regla suya)
**13/10: SIN ESCALONES (regla suya).** ML deja subir hasta +100% sin pausar; cada prueba va directo al precio que creo que es
el techo, también en lo caro. Lo del +10/15% de abajo ya no rige. **Qué chequear:** que ninguna prueba nueva sea un +10% "por las
dudas", que las reglas de CEREBRO.md/CLAUDE.md digan esto, y que la vuelta no se haga por calendario sino por certeza.
Paso 2c de la completa (trigger `trig_01475PwdPVJ1qTnYswcDxRq8`) y sección en CLAUDE.md. Escalones de +10/15% en lo que
vende bien con stock, juicio por ganancia por día con stock (misma cuenta que la línea de tiempo y `supervisor:medir`),
memoria en `ml-sync/notas/techo.md`. **Qué chequear:** que cada prueba tenga su renglón en techo.md y su motivo en el 🧠,
que no se juzgue con días de quiebre o fechas especiales adentro. **Ampliado el mismo día (regla suya): sin tope de
cantidad, entra el 100% de lo que vende con stock y sin techo conocido**, arrancando ~1/3 por día; afuera sólo escasez,
sobra (>90 días de stock), liquidando, mis promos, regalables antes de su fecha y frenadas por ML, contadas con su motivo.
Chequear que ninguna candidata quede afuera sin motivo escrito. **Y el mismo día, corrección suya:** arrancan TODAS juntas (cada una se juzga con sus propias ventas) y el
juicio va a los 7 días con stock (vende 1+/día) o 14 (el resto); con menos de 6 ventas esperadas sólo si la diferencia es
clara, si no hasta 30 días como mucho (antes decía 60). **Tercera corrección:** el juicio es por CERTEZA (lo esperado contra lo vendido, tipo
Poisson, nunca con un solo día) y en plata por día, no por calendario; lo de mucho volumen se mira también en las vueltas
cortas (paso 1c). **Y regla nueva:** cada cerebro busca mejoras nuevas (paso 10 de la completa, 5b de las cortas), con
memoria en `ml-sync/notas/ideas.md`. Chequear que cada idea tenga números y estado.

### Ventas de hoy al volver a la web (v23.21, 12/10/2026)
`_ventasHoyFrescas` (index.html): al volver de segundo plano fuerza `db.goOffline/goOnline` (si estuvo oculta 15+ s) y pide
aparte `cyc/ventaprod/<hoy>` y `<ayer>` con `.get()`, y redibuja Inicio o Ventas; con la web a la vista, cada 60 s.
**Chequear:** que no pise ventas recién escritas por la web (lo de la base manda) y que no corra antes de la primera carga.
**Y el mismo día:** el commit de v23.19 dejó `sw.js` VACÍO (0 bytes) en las dos ramas: sin `CACHE` la web no detecta
versiones nuevas. Restaurado en v23.21 (`cyc-v601`). **Antes de cada commit: `wc -c sw.js` > 0.**

### La ficha médica de cada publicación (16/10/2026, v23.81 · `cyc-v662`, eligió 1a 2a 3a)
- **Qué es:** él: *"como si fuera una ficha médica del producto (...) cada vez que hacés un análisis abrís eso y tenés todo"* y
  *"quiero poder verla (...) completa, mínimo la info que está en la línea temporal"*. `armarFicha` (sync.mjs) junta por
  publicación: la línea de tiempo, mis cambios (`cyc/claudecambios`), mis promos (`cyc/promoclaude`), los cambios viejos del
  supervisor (`cyc/supervisor/eventos`) y la historia de mis notas (`mlapi/fichanotas/<MLA>/<ts>`, nueva: cada nota del 🧠
  se guarda también ahí). Saca tramos de precio (ganancia por día con stock), el resultado de cada cambio (21 d antes contra
  después, Poisson) y LO QUE SABEMOS con vencimiento (60 d para un precio que no rindió).
- **Dónde vive:** `mlapi/ficha/<MLA>` · comando `ficha[:<MLA o palabras>][:go]` (con filtro imprime la ficha entera) · paso
  "Ficha de cada publicación" en ml-daily después de la línea de tiempo · línea `📋 ficha:` en `escasez` y en el expediente
  · web: botón "📋 Ficha completa" en el 🧠 (`fichaAbrir`, `_fichaBotones`) con la línea de tiempo entera día por día.
- **Qué chequear:** que el día de un cambio de precio las ventas vayan al precio cobrado (no al de la noche) · que una nota
  nueva quede en la historia · que la ficha se arme cada noche (el paso entra en `avisonoche` si falla) · que "lo que
  sabemos" no diga algo con $0 · que la ganancia use la misma cuenta que `lupa`/`escmedir`.

### 5b · CEREBRO (antes etapa 9, nueva 09/10/2026, pedido suyo)

### Una suba por escasez no se mide como pérdida por vender menos (16/10/2026, él con el Barbarella)
- **Qué es:** él: *"el objetivo no fue ganar más, sino ganar lo mismo manteniendo stock (…) sería pérdida si llegó la otra
  mercadería y la que estábamos alargando no se vendió"*. El supervisor ya no cuenta volumen en ninguna suba por escasez o
  sin reposición (antes sólo las del robot viejo): las mías se reconocen por el motivo (`escSup`), el registro lleva `esc`.
  Y el 🔁 de `escasez` mide si "ya no hay escasez" con el ritmo de ANTES de la suba (lo guarda la ficha): la suba frena las
  ventas a propósito y con el ritmo de ahora parecía que ya alcanzaba. Sale cuando al precio normal alcanza hasta la caja:
  ahí se vuelve al normal para terminar el stock cerca del día que llega.
- **Qué chequear:** que el Barbarella deje de salir con −$20.922 · que el 🔁 no oscile (subo → frena → "ya alcanza" → bajo).

### El armador de cajas no leía los productos con "cortes" (17/10/2026, lo encontré en la completa)
- **Qué es:** desde el 16/10 `pedidostodo` imprime `· cortes N ·` entre `dCS` y `Full`, y `decide_cajas.py` no lo esperaba:
  leía 146 de 180 productos (lo decía con "⚠️ NO CIERRA" y no lo miré) y los colores con cortes se pegaban al producto de
  arriba (el 3 Patas del enchufe de Ayelen salió como "Filtro agua" de Matías; el Centímetro salió sin colores, 95 u. de golpe).
  Arreglado el patrón del producto y del color. `decide_pedidos.py` no tenía el problema (99 + 80 + 1 ✓).
- **Qué chequear:** que `decide_cajas.py` diga "leí N de N ✓" en cada vuelta; si dice NO CIERRA, no se carga nada hasta arreglarlo.

### "Buscando techo ×2": la web cuenta las subas seguidas (17/10/2026, pedido suyo, v24.03)
- **Qué es:** él: *"cuando vuelve a subir puede poner el tag como buscando techo x2. Así me doy cuenta que fue una segunda suba"*.
  `estrategiaDe` (index.html) cuenta, para atrás desde la estrategia vigente, cuántas anotaciones 📈 techo seguidas hay en
  `cyc/estrategia/<MLA>` hasta la primera que no es techo; el chip dice ×N desde la segunda. No cambia nada en el robot: cada
  suba de techo va con `#techo` como siempre.
- **Qué chequear:** que una nota sin precio no cuente como suba (sólo las subas guardan estrategia) · que después de una corrección vuelva a 1.

Él, después de que dos veces salió incompleto (precios y pedidos): *"es un problema grave que pasó dos veces ya (...) en los dos se hizo súper incompleto y nunca te diste cuenta (...) quiero agregar esto de revisar cerebro a las etapas"*. Revisa LO QUE HACE CLAUDE en cada vuelta (08:52, 12:52, 16:52, 20:52): que cada parte se haga ENTERA.
- **La pregunta de esta etapa, para cada tarea:** ¿de dónde salió la lista que miré? ¿esa lista es TODO o sólo lo que ya existe / se movió / ya decidí? El error de las dos veces fue el mismo: mirar una lista que sólo traía una parte (`informe` = lo que se movió · `pedidosnotas` = lo ya decidido) y creer que era todo.
- **Contar contra el total:** cada tarea termina con "N de M" contra el universo completo (publicaciones vivas, fichas del catálogo, productos con mercadería en la oficina, preguntas sin responder, publicaciones sin ficha). Si N < M, decir cuáles faltan y por qué.
- **Lo que tiene que estar entero en cada vuelta:** precios (`planilla`, cada publicación) · pedidos (`pedidostodo`, cada ficha y color) · cajas (`cajasnotas`, cada producto en la oficina) · máximo de compra (precio normal de venta de cada pedido) · notas del 🧠 · preguntas · vínculos · cajas llegadas · promos · escasez · retiro del 1º.
- **Herramientas del cerebro y qué chequear de cada una:** `informe` (1ca4722: monto de la cancelada desde `antesCancel`) · `planilla` · `pedidostodo` · `cajasnotas` · `escasez` · `analizapromo` · `decido` (lo escrito se relee: "guardado") · `contesto` · `alertas` · auditoría del robot (`ml-sync/AUDITORIA.md`, 2975d18: no largar 6 consultas juntas).
- **ml-daily (bb45c5f):** sólo comentarios; con SOLO_DATOS el paso de avisos no toca precios.
- Dónde se mira: el log de cada comando (cantidades) contra la base (`cyc/claudedecide`, `mlapi/claudeexp`) y la web.
- **v23.00 (09/10/2026) · lo que salió de la revisión 9:** web — `pedSinDecidirLista`/`#ped-sindecidir` (productos que venden sin decisión), colores sin decidir en ámbar, `_clMotH` (motivo por color y `motPv`), 🧠 de Pedidos con `ped__<id>__v__*`, Armar caja con `sinDecCtas` por cuenta, `_cajaNadaMsg` (Cargar lo sugerido no vacía), `convieneCaja` cuenta lo cargado a mano, `clDescontarCaja` (al cerrar caja) y `clDescontarPed` (al "Ya lo pedí" de Paraguay) restan de `cyc/claudedecide`, `_homeHoyFecha` (Mes/Año). Robot — `decido` borra colores/cajas viejas del producto al decidir de nuevo (`_limpiosDec`), `motPv`/`motVars`, preguntas más nuevas primero en el `informe`, `limpiarNoSubir` corre con SOLO_DATOS (sin contagiar), `escasez`/`cajasnotas` restan `cajasentrado`, `cajasnotas` con `pasara` y decisiones, `planilla` cuenta contra el total, `pedidostodo` suma PY llegado sin contar y juzga las ventas baratas con la línea de tiempo (REMATE/BARATA), `analizapromo` avisa que no hay bajas pensadas. **Quedan pendientes** (ver la sección "Pendientes de la revisión 9" abajo).

### `pregunto:` — a Telegram sólo las decisiones (09/10/2026, regla suya)
 · Qué es: `pregunto:<texto>` (ml-sync) manda al canal privado "🤔 Para decidir vos" + el texto (`//` = salto de línea).
   Vive en el mismo bloque que `recordar:` en sync.mjs. Las rutinas de las vueltas lo usan en vez de PushNotification.
 · Qué chequear: que en las vueltas no salgan avisos de cosas ya hechas (subas, bajas, activadas), que sin decisiones no
   salga nada, y que el texto no lleve datos de compradores (el log es público).

### "🚫 No lo consigo" por color (16/10/2026, v23.98, pedido suyo)
 · Él: *"si apreto el botón en la publicación es porque no se consigue ninguna variante. si clickeo en una variante es
   porque esa sola no se consigue"*. `cyc/noconsigo/<prodId>` = `{todo: fecha, v: {<color sid>: fecha}}` (un número suelto
   de la v23.97 vale como `todo`). Botón en cada renglón de color de Pedidos. `reponerDe(p, color)` / `escasezDe(p,{vari})`
   y la línea de tiempo con color elegido lo usan; el robot (`escasez`) lo aplica por clave de color. La de un color se cae
   cuando entró algo a la oficina después de marcarla y ese color tiene unidades ahí.
 · Qué chequear: marcar un color → la escasez de ESE color dice "no se consigue este color" y los otros siguen normales.

### "🚫 No lo consigo" en Pedidos (16/10/2026, v23.97, pedido suyo)
 · Él, con las Sábanas: *"no está el botón de no lo consigo. para que entre en escasez"*. Botón en la tarjeta de Pedidos
   (Bs As y Paulvic; Paraguay ya tiene "Nissei no lo tiene"): guarda `cyc/noconsigo/<prodId>` = fecha. `_reponerCalc` lo
   trata como sin reposición (escasez, estirar a ~4 meses) mientras no entre mercadería a la oficina después de la marca
   (`cyc/ofientro`); el robot lo ve por `cyc/reponer` y, de respaldo, leyendo la marca.
 · Qué chequear: marcar un producto → la escasez lo muestra "no se consigue: sin fecha"; cargar unidades en la oficina →
   vuelve solo a "~1 semana + caja"; "deshacer" lo saca.

### Auditoría 17/10/2026: 12b por plata, cajas del chequeo, `reputa` en sólo lectura
 · `informe` 12b (sin stock y vendían): ordena por lo facturado en 30 d ÷ 30 y lista TODAS (antes por unidades y
   cortado en 15: lo caro que vende poco quedaba escondido). Qué chequear: que el Watch S5 y la Pad 2 salgan arriba.
 · `chequeo`: las cajas llegadas salen de `cyc/envios_full` (cajas `recibida` con `recFecha` en la ventana), no de
   `/stock/fulfillment/operations/search` (sin `date_to` daba 400 y siempre "0 cajas"). Qué chequear: el día que se marca
   una caja, el chequeo la cuenta y el 🔴 "0 cajas a Full" no sale.
 · `reputa` por ml-consulta no intenta guardar (`GITHUB_WORKFLOW`), así lee las 4 cuentas.

### Telegram: sólo lo importante, sin resúmenes (16/10/2026, regla suya)
 · Él: *"quiero que en telegram lleguen cosas más importantes. sino nada. o algo que tenga que decidir"*.
 · Qué cambió: se sacó el `resumen:` de las dos rutinas (completa 08:52 `trig_01475PwdPVJ1qTnYswcDxRq8` y cortas
   `trig_01FCaQqzU5MA422N6Z8nH63Z`). El `pregunto:` va sólo con decisiones suyas o con lo importante que sólo puede hacer
   él y cuesta plata si no lo hace hoy (reclamo que espera su respuesta, ML frenó algo que vende, algo que vende fuerte en
   0 en Full con mercadería en la oficina, costo que falta en algo que se vende). Ya NO van preguntas sin contestar ni cajas
   "para la próxima". Reglas en CLAUDE.md y CEREBRO.md (sección 7).
 · Qué chequear: que ninguna vuelta mande `resumen:` y que un día sin nada importante no salga ningún mensaje. El comando
   `resumen:` sigue existiendo en sync.mjs (no se borró) por si él lo vuelve a pedir.

### Aviso de venta al teléfono: sólo desde $10.000 de ganancia (15/10/2026, v23.46, regla suya)
Qué: `avisarVentasNuevas` (sync.mjs) filtra con `AVISO_VENTA_GAN_MIN` = 10000 la ganancia de cada venta (misma cuenta
`armarCostoWeb` que el panel). Las de menos o sin costo se anotan en `mlapi/avisoventa` sin avisar. Qué chequear: que una
venta grande avise y una chica no; que el total del día del aviso siga contando todas; un carrito se mide por renglón.

### Ventas con vida: temblor y fuego sólo desde $10.000 de ganancia (15/10/2026, v23.45, regla suya)
Él: *"dejar las reglas idénticas, excepto que la vibración y fuego permita activarse a partir de $10.000 de ganancia"*.
`vivaVenta` (index.html): `VIVA_GAN_TIEMBLA` = 10000. Abajo de eso no hay fuego (`fi`=0) ni `tiembla` (cae a flota rápido);
el resto (color, brillo, figuras, velocidad, puntaje) igual. Chequear: una venta con puntaje alto y ganancia < $10.000 no arde.

### Ventas con vida: color por %, todo lo demás por puntaje (09/10/2026, v23.01, regla suya)
 · Qué es: `vivaVenta` (index.html) da a TODA venta el color de su nivel de % (rojo y naranja incluidos, JOYA en oro
   `#facc15` con fondo dorado) y saca brillo, figuras, velocidad, movimiento y fuego de `vivaScore` = ganancia ×
   (% ÷ 30, entre 0,5 y 2,5); las que perdieron puntúan por lo perdido y no arden. El renglón de cambio de precio
   (`cambioVentaHTML`) va verde/rojo según la plata de más o de menos.
 · 23.02: la base de cada nivel es un tinte mínimo y el color crece con el puntaje (ventas chicas casi neutras).
 · Qué chequear: que una venta chica JOYA se vea dorada (no naranja), que las rojas se vean rojas, que una verde muy
   cara pueda arder, y que el fuego no aparezca en ventas chicas.

 · **23.03 (09/10):** la venta viva aparece recién con puntaje ≥ 2.000 (`VIVA_SC_MIN`, ganancia × %/30 acotado). Abajo, `vivaVenta` devuelve null y la tarjeta queda común. Chequear: que una venta chica no tenga color ni figuras y que una de 2.000+ sí.

 · **23.04 (09/10):** sin el margen de 46px de la venta que arde (`.vw.vf`): las ventas van juntas. El canvas del fuego de una VENTA va atrás de la tarjeta (z-index 0, top 0) y `_vivaFuego` sólo larga llamas por los costados (`c.dia` sigue igual). Chequear: sin huecos entre ventas y fuego visible a los lados.

 · **23.05 (09/10):** `vivaScore` = ganancia² ÷ costo de la venta, el MISMO ⚡ Score del ranking (`roiScore`), para que el número que él ve y el que anima coincidan. Escalones reescalados: 1.800 brilla · 2.400 flota · 10.500 arde · máximo 120.000; mínimo 2.000. Chequear: el Pendrive 64gb (⚡ 1.550) queda común.

 · **23.06 (09/10):** compra de varios productos → un `lineaBtn` por renglón (`_varios`) y en el detalle del teléfono un botón por producto. `cambioVentaHTML`: texto en gris, sólo la flecha ▲ verde / ▼ roja según subió o bajó el precio (la tarjeta del teléfono busca '▲'). Chequear: carrito de 3 productos con 3 botones 📈.

 · **23.07 (09/10):** `_vivaDibujarCard`: la velocidad de subida de las figuras de una venta se multiplica por `_x3` (1 abajo de vel .25, 3 desde vel .55, en el medio de a poco). Chequear: SSD 1TB (puntaje ~21.000) sube 3× y una venta chica igual que antes.

 · **23.08 (09/10):** la velocidad de subida de las figuras de una venta sale del NETO con la tabla que eligió él (`VIVA_VEL_NETO`, interpolada en escala logarítmica; `data-vpx` → `c.vpx`). Lo demás (color, brillo, fuego, mínimo 2.000 de puntaje) sigue igual. Chequear: SSD $296.883 de neto ≈ 1.580 px/s.

 · **23.09 (09/10):** cantidad de figuras de una venta = base × (0,25 + 0,75·vi²), mínimo 4 (antes base × vi², daba 0 cerca de 2.000 de puntaje). El canvas del fuego de una venta mide el alto de la tarjeta. Chequear: el Aer x6 de 2 prod. (puntaje ~2.500) muestra figuras.

 · **Tito (09/10):** los motivos de `ped:` los lee el papá de Matías: `decide_pedidos.py` arma cada uno con `tito()` ("Hola Tito! Te pido N…", sin ";" ni "|"); los juicios van con `titoJ`. `pedidos.txt` de hoy convertido (279 renglones). Chequear: que ningún motivo de pedido quede en el formato viejo ("ritmo N por mes · tiene…").

- **`cargosventa:<MLA>[:días]` (09/10/2026, solo lee):** cada venta de una publicación con los cargos de Mercado Pago por nombre (comisión, envío, cuotas, retenciones), sin datos del comprador. Nació con la Muñequera (29,8% en la nota contra 15% en una venta). Chequear: que no imprima ids ni nombres; que un carrito se vea como CARRITO.

- **`ventasraras[:horas]` (09/10/2026, solo lee, regla suya: *"en cada corrida analizá las ventas del día para ver si pasó algo"*):** cada compra del período con su % (cuenta de la web, `armarCostoWeb`) contra lo normal de esa publicación al mismo precio (mediana del neto por unidad de sus ventas sueltas de 45 días); las que salen abajo de 25% o dejan bastante menos que lo normal se explican con los cargos de Mercado Pago (retención de provincia, cuotas, envío, comisión). Corre en las 4 vueltas. Chequear: un carrito es una compra; sin datos del comprador ni números de orden; estimadas no se juzgan.

- **`resumen:<texto>` (10/10/2026, pedido suyo: "cada vez que se activa cerebro me mandás un pequeño resumen"):**
  mismo canal privado que `recordar`/`pregunto`, con el título "🧠 Lo que hizo el cerebro". La completa lo manda
  siempre, las cortas sólo si hicieron o encontraron algo. Chequear: sin datos de compradores ni números de orden
  (el registro es público); que no reemplace al `pregunto:` de las decisiones.

- **Psicología del precio (10/10/2026, él eligió 1a 2a 3a 4b):** (1) los precios que decido terminan en 90/990 (99 en lo
  más barato), nunca redondos · (2) una suba que cruza un redondo ($5.000, $10.000, $20.000…) se frena en $X.990 salvo que la
  ganancia extra lo valga, y se dice en el motivo · (4) los productos nuevos arrancan directo al precio final (NO se arranca
  más barato para juntar ventas). Dónde vive: `UMBRALES_REDONDOS`, `umbralRedondoCruzado`, `precioRedondoAviso` (sync.mjs);
  `decido` imprime `🔢` al lado de cada cambio que termina redondo o cruza uno (avisa, no frena). (3) Probe **`redondos[:días]`**
  (solo lee): cambios de precio de la línea de tiempo, los que cruzan un redondo contra los que no (mismo tamaño, sin los que
  cruzan $33.000), ventas por día CON stock antes/después. Qué chequear: que no cuente días sin dato de stock; con pocos casos
  no concluir; si los que cruzan no venden peor, se saca la regla 2.
  - `redondos` primera corrida: 0 medibles (954 afuera: los días viejos de `mlapi/linea` no tienen stock). Se agregó una medida APROXIMADA por calendario para esos días, sólo si la ventana siguió vendiendo (sin cortes de 7+ días sin ventas) y con 1+ venta después; sale marcada ≈ y contada aparte. Chequear: que un día con stock 0 conocido nunca cuente.

### Pendientes de la revisión 9 (09/10/2026, a la madrugada) — se van cerrando en las vueltas
- **Publicaciones con variantes no tienen dueño de precio:** `decido`/`analizapromo`/`entrarpromo` las rechazan ("la maneja el robot de siempre") y con SOLO_DATOS el robot no las toca. Hace falta un camino de Claude por `raiseVariations` (y que la planilla las muestre como "nadie las maneja").
- **`escasez` no mira colores** (saltea las claves `__v__`): un color con 1 u. dentro de un producto con stock no salta.
- **El guardián de promos no puede leer 252 publicaciones** (`informe` §1 y §13: "hace 246 horas que ML no contesta"): una promo que meta ML ahí no se ve. Revisar por qué ML no contesta (permiso, 429, endpoint).
- **§12 del informe: "ML pide $1.000"** en Cartas Casino, Filtro, Infusor que venden cientos: el `price_to_win` guardado es sospechoso; verificar con `cajacompra` antes de creerlo.
- **Cajas que ML ya da por llegadas:** sólo salen en el log del ciclo; correr `cajasllegaron` en cada vuelta (hay 2 cajas con 11 días: Adriana 68 u., Ayelen 215 u.).
- **Promos de Claude con su fecha de fin** no se listan en ningún lado (`cyc/promoclaude`): se pueden vencer sin que se note. `entrarpromo` sobre una promo ya entrada no cambia el precio de ML.
- **`alertas`** lee sólo lo que salió por Telegram (casi nada con SOLO_DATOS): usar el `informe` §1.
- **Preguntas:** 81 sin responder (80 de más de 7 días, regla suya: no contestar las viejas) y 1 del Espejo 8" de hace 4 días sin contestar ("Hola aumento porfi").
 · **Juicios por producto (09/10, madrugada):** `historia` (365 días en tramos de 14) leído entero, 152 productos. `ml-sync/notas/juicios.txt` corrige 16: lo que la cuenta de 30/180 días daba por muerto y estaba agotado (Termómetro horno, Termómetro Cable, Estimulador, Linterna Minera, cortapelos, B39…) y lo que vuela (Mini balanza, Adaptador 8 en 1). Ultra Shift = 0. Indoor = 0 hasta revisar el precio ($32.999). **Qué chequear:** en cada vuelta de pedidos se relee `historia` y se rehacen los juicios; un juicio viejo no vale para siempre. Los motivos NO llevan `;` (cortan el comando).
- **Informe 2b · ventas por cuenta (11/10/2026, auditoría):** últimas 24 h de cada cuenta contra su promedio diario de 14 días, ⚠️ si cae a menos de un tercio (con promedio de 3+). Nació porque Matías vendió 0 el 10/10 y el informe no lo decía. Chequear: que una cuenta que deja de vender salga en la revisión de 12 h, no en la auditoría.
- **Informe 12c · con stock en Full y sin vender en 30 días (12/10/2026, auditoría):** por producto×cuenta, plata parada (costo de la ficha), si alguna publicación está activa y visitas de 30 días (<20 = no la ve nadie). El chequeo lo traía (40 publicaciones, $3,2M) y el informe no. Chequear: que la plata parada salga en la revisión de 12 h.
- **Precio para el peor caso (12/10/2026, regla suya):** el 25% se mide con retención de otra provincia/cuotas/envío caro (~28% en el panel); lo nuevo se revisa antes de activar y lo que vende abajo de 25% con poco stock se sube en la misma vuelta (caso Sony ZX310). Chequear: que ninguna venta de algo recién activado salga abajo de 25%.
- **Chequeo: "sin ficha" ya no cuenta las marcadas `nomas` u ocultas (12/10/2026, auditoría):** decía 8 contra 0 del informe; 6 eran las de `nomas` del 18/08. Chequear: que el número del chequeo y el del informe coincidan.

### REVISIÓN 9 DEL 13/10/2026 (4 revisores · ~50 hallazgos verificados · v23.24 `cyc-v604`)
La pregunta de la etapa: *¿la lista que miré es TODO o sólo una parte? ¿una falla se leyó como dato?* Lo obvio, hecho:
 · **Pedidos y cajas:** `pedidostodo`/`cajasnotas` cortan con "⚠️ NO LEÍ" si una lectura falla (antes 0 ventas / 0 en camino);
   sin dólar no sigue; `dCS` por color; `med60` (mediana cobrada en 60 d = precio normal para el máximo de compra, no el subido
   por escasez); `ctas [..]` = cuentas que pueden recibir; cierra "N fichas = para decidir + fuera". `decide_pedidos.py`: ritmo
   por días con stock, ventas sin color repartidas entre colores, sin costo = no se pide (y se lista), log con hora de GitHub,
   N de M por grupo, un redondeo por producto y reparto por resto mayor, juicio de producto reparte entre colores, `=auto` para
   decisiones viejas sin colores, juicios que no coinciden se avisan, nada con ";". `decide_cajas.py`: la cuenta sale de `ctas`
   (antes del Full o de una lista a mano: P47 iba a Matías en vez de Ayelen); más de una cuenta → "decidir a mano".
 · **decido:** piso medido en el PEOR caso (igual que la planilla) y los dos números a la vista; suba de más del doble sólo con
   `!salto`; no sube la lista de algo en un descuento mío vigente; relee el precio y si no coincide va a "no se pudo"; cada nota
   se relee y al final "X de Y guardadas · Z rechazadas".
 · **Cerebro/planilla:** color sin clave de stock propia = "no sé" (antes tomaba el total del producto); la planilla no cuenta dos
   veces los errores (falso "NO CIERRA") y nombra el MLA; corta si no lee nosubir/claudepiso/promoclaude/mlconfig/monotributo/
   autoprecio; una promo mía vencida ya no es excepción (`promoClaudeVigente`).
 · **activarfull:** margen en el peor caso; nombra las cuentas sin permiso; "no la vendemos más" frena desde el primer chequeo.
   `vincular` saca también `noVendemosMas`.
 · **redondos:** `stF` es la fuente del dato (`'inv'`), no el stock: todos los días con stock contaban como "sin stock" y no
   medía nada (el "0 medibles" de la primera corrida era esto).
 · **Promos:** `entrarpromo` ya puede poner el descuento propio donde ML no lo lista (chocaba con "entre $0 y $0"); no anota como
   mía una promo puesta a otro precio; `analizapromo` dice N de M, "(y N más)" y en §6 la fecha de fin de cada promo mía (⏰ renovar
   / ⌛ vencida). El guardián guarda el código de error de ML y §13 dice cuántas publicaciones no lee (antes mostraba horas).
 · **Preguntas y avisos:** `contesto` entiende todo antes de mandar (una respuesta con ";" ya no sale cortada); `pregunto/resumen/
   recordar` no parten los links `https://`; `ml-sync.yml` ya no pega el texto libre del comando en bash (inyección).
 · **Fotos:** `revfotos` no da por "ok" una foto que no bajó (`duda`), saltea los probados, cuenta lo que deja afuera; `fotosrev`
   dice N de M y por qué quedan afuera.
 · **Informe y ventas:** `informe` corta si no lee publicaciones o ventas; 12c con `costoPesos` y dólar (como el chequeo); 12d mira
   los depósitos de cada color; `e.oculta` (no existe) → `e.ignored`; toda lista cortada dice cuántas faltan; §7b avisa si hay más
   de 20 reclamos; §9 dice "ML ya dio de alta N de M" de cada caja vieja; §12 avisa cuando el precio de la caja no deja ganancia.
   Canceladas: `canceladaTs` (robot y web) y el informe/`ventasraras` filtran por cuándo se canceló. `ventasraras`: venta sin
   costo/ficha va aparte (antes "755% ✓"), piso de la base, cuenta las estimadas. `cargosventa` no dice "0 ventas" si no leyó.
 · **escasez:** corta si no lee; cada COLOR se juzga solo; ritmo por días con stock (`stocklog`, como el cerebro; 📅 si usa días
   corridos); cierra con "N de M · afuera …".
 · **Pruebas reales (13/10, ml-consulta):** `pedidostodo` → "170 fichas = 152 + 18 ✓", `decide_pedidos.py` lee 99/52/1 de 99/52/1.
   Salió un error mío: el `dCS` de `stockhist` sólo mira desde la última vez que volvió el stock (Enchufe 2 patas daba 5 días
   con 110 en Full y pedía 286) → ahora sale del registro hora por hora (`cyc/stocklog/cambios`), y lo que el registro no
   miraba (antes del 24/09) cuenta con stock. Total propuesto 804 u. (antes 522). `planilla` → "410 = 410 ✓ cierra"; el
   color de la publicación ahora sale también del título (sin eso 40 decían "stock del color: no sé"; quedan 15 pausadas sin
   dato del color). `escasez` → "90 de 174 · 84 con menos de 2 ventas · 0 sin clave". `redondos` midió 141 cambios: la regla
   de frenar en $X.990 se sacó (ver CLAUDE.md, psicología del precio).
 · **Qué chequear la próxima:** que `decide_pedidos.py` diga "leí N de N ✓" en los tres grupos; que `redondos` ya mida algo; que
   `planilla` diga "✓ cierra"; que §13 diga cuántas publicaciones y qué código de error da ML.
 · **Sigue abierto:** las publicaciones con variantes adentro (no los colores en publicaciones separadas) siguen sin dueño de
   precio: `decido` las rechaza y la planilla las lista "a mano". Falta un camino de Claude por `raiseVariations`.


- **13/10/2026 · Paraguay: belleza y salud van con los perfumes** (etapa 3, mercadería). `esBellezaNom` + `_BELLEZA_RE` en
  index.html: parte la lista del pedido (`_perfGrupos`), el botón 🧴 (`_pyRubroOk`) y el mensaje para Nissei
  (`nisseiMsgLineas`). Mira nombre (castellano y portugués), `catNom`/`dom` de la ficha y `mlTit` del candidato.
  NO toca el piso (`candPisoDe` sigue con `esPerfumeNom`) ni la cuenta (perfumes → Adriana). Chequear: que nada de
  electrónica caiga en belleza por una palabra suelta (ej. "facial", "crema") y que el termómetro de cocina sea salud a propósito.

- **13/10/2026 · `debencyc:<+N|-N|N>[|nota][;go]`** (etapa 2, plata). Escribe "Lo que nos deben" del Arqueo
  (`cyc/finanzas/deben_cyc`, en DÓLARES) con relectura, y deja cada movimiento en `cyc/debencyc/<ts>`. Primer uso:
  la perfumería le debe a CYC los 8 perfumes del pedido py20261005 que no van a ML (decisión suya, eligió la a).
  Chequear: que el Arqueo lo sume una sola vez y que se reste cuando paguen.
- **13/10/2026 · `borrarficha:<id,...>[;go]`** (etapa 3, mercadería): borra fichas sin publicación, ventas ni stock
  (y sus claves en 0 de inventario y repoextra). Primer uso: los 5 perfumes del pedido 05/10 que se queda la
  perfumería (decisión suya: "sacalos de web cyc, yo me encargo"). El `debencyc` de esa tarde se volvió a US$ 2.380.
- **13/10/2026 · v23.26 · la promo mía cuenta como baja de precio** (etapa 1, precios). `state.promoclaude` (de
  `cyc/promoclaude`) entra en `cambiosPrecioDe` (⬇️ de la venta) y en los eventos de la línea de tiempo (▼, motivo
  `promo`). `promoNombreDe` da el nombre (PRICE_DISCOUNT = "descuento propio") y `vpPromoLabel` lo agrega a la
  etiqueta. Chequear: que no cuente dos veces una baja que además se hizo en el precio de lista, y que una promo
  vencida (registro borrado) deje de aparecer en ventas viejas (se pierde la marca: aceptado).

### Línea de tiempo: ▾ ámbar = se cobró menos sin cambiar el precio (13/10/2026, v23.27)
Él, con la Batidora: *"porque se nota que el precio baja si no hay flechita roja"*. Los días con ventas la línea del precio es
lo COBRADO por unidad (`pCob`), y baja sin ningún cambio de precio por promo/cupón de ML, carrito o un color más barato
vendido ese día (en "Todas juntas" se mezclan los colores). Ahora se guarda el precio publicado (`pLista`) y, si lo cobrado
quedó 3%+ abajo y ese día no hubo ▲▼, sale un ▾ ámbar chico y el globito dice cuánto y por qué. Chequear: que no tape una ▼
real (sólo sale sin evento ese día) y que en una sola publicación sin promo no aparezca.

### `lupa`: cada publicación, todos los días (13/10/2026)
Probe de sólo lectura (ml-consulta): de cada publicación con ficha y stock o ventas, los últimos 7 días con stock contra los 30
anteriores (ritmo, ganancia por unidad, plata por día, días sin vender, caja, precio). Un día cuenta salvo que se SEPA que no
había stock. El cambio de precio sólo se muestra como contexto de otra bandera. Va en las vueltas del cerebro. Chequear que
las 🚩 sean pocas y reales (la primera corrida dio 185 de 236: demasiadas).

### Juicio contra el número del supervisor (13/10/2026, v23.28)
Él, con el Chispero: *"porque dice perdió y dio positivo?"*. El número del supervisor es sólo el efecto precio (lo cobrado de
más en lo que SÍ se vendió; el volumen perdido no se cuenta, `VOLUMEN_CONFIABLE`). Si mi juicio dice lo contrario, el número
sale en gris con la aclaración. Chequear que no aparezca cuando coinciden.

### Pedidos: el ritmo de antes cuando subí por escasez (13/10/2026)
Él: *"si subo por escasez se vende menos de lo normal; eso no debería achicar las unidades a comprar"*. `pedidostodo` marca
`ESC` en cada suba cuyo motivo dice escasez/estirar; `decide_pedidos.py` (`ritmo`) usa el mayor entre el ritmo de hoy y el de
los 30 días previos / 60 días, si la suba fue hace 30 d o menos. **Los motivos de escasez en `decido` tienen que decir "escasez"**.
Chequear que un producto en escasez no baje su pedido.

### Flechas de precio con el color del motivo (13/10/2026, v23.29)
Él: *"cuando se aumenta por escasez o se baja por distintos motivos, ¿podés poner las flechitas de otro color?"*. `flechaTipo`
(index.html) lee el motivo de `cyc/claudecambios` (o `autoprecio`, o el evento) y `FLECHA_TIPOS` da el color: verde prueba/hay
lugar · celeste margen · naranja escasez · cian caja · violeta promo · amarillo vuelta atrás · rojo remate · gris a mano.
Línea de tiempo, renglón de cada venta y su detalle. **Los motivos de `decido` tienen que nombrar la causa** (escasez,
techo/prueba, peor caso/25%, caja, remate, vuelvo) o la flecha sale gris. Chequear que la leyenda y las flechas coincidan.

### `pyped:fichas:<id>[:go]` (13/10/2026, etapa 3)
Rehace las fichas que faltan de un pedido de Paraguay YA llegado (las de perfumería se habían borrado y él quiere los costos
de todo: *"no van a venderse en ML, pero quiero tener los costos"*). Mismo costo que `llego` (pagado × recargo real), no toca
la oficina ni el estado. `llego` ahora también trata como "sin ficha" a un candidato cuyo `prodId` apunta a una ficha borrada.

### El 🧠 dice por qué cambió el precio (13/10/2026, v23.31)
Él, con el Paulvic Barbarella: *"no explica por qué aumentó de 58 a 97%"*. La nota de la publicación dice cómo está hoy; ahora
el 🧠 (Ventas, Productos, Rotación) agrega las últimas 3 decisiones de `cyc/claudecambios` con su motivo y su flechita de
color. Chequear que cada `decido` tenga motivo escrito (si no, sale "sin motivo anotado").

### La flechita explica por qué (13/10/2026, v23.32)
Él: *"si pongo el mouse ahí es porque quiero saber qué pasó y por qué"*. `cambioTxt` arma el texto: tipo de cambio (el
color de `FLECHA_TIPOS`), precio de antes → después, % y el motivo de `claudecambios`/`autoprecio`. Va en el globito de la
flechita (dibujada arriba de los rectángulos del globito, si no el mouse no llega) y en el del día. Chequear con el mouse.

### El 🧠 sin "¿te queda alguna duda?" y con los cambios viejos (13/10/2026, v23.33)
Se sacó el renglón final. "Por qué cambió el precio" también toma el último de `cyc/autoprecio` si no está en
`claudecambios`. Regla de las 4 partes del motivo en `CEREBRO.md`. Chequear que las notas nuevas la cumplan.

- 13/10 · PROMPT_GUAY rehecho con las correcciones del chat de compras: Chrome al frente con 3 pestañas, Claude in Chrome (no el navegador integrado), sin leer direcciones remotas (se pega entero), recorrido por `ordem=maior-preco` sin www, foto `thumbs/big`, ML por HTML (polycard), algo cada 15 min, y pregunta antes de pegar en el chat CYC. Se sacó la contradicción maquillaje/perfumes (afuera desde el 13/10) y el "17%" (el recargo se mide, hoy ~21%). Chequear: que "DÓNDE QUEDÓ" se actualice después de cada barrido.

- **(etapa 3 · 14/10/2026) Cajas a 60 días en lo parejo:** `decide_cajas.py` `dias_de`/`parejo`, lista `notas/sin_estirar.txt`. Chequear: que la lista siga al día con las pruebas abiertas de `techo.md`, que el criterio de "parejo" no estire algo que se está frenando, y que el cupo de la cuenta no se pase.

- **15/10/2026 · códigos de Nissei con letras (Ferso: `FE00633`).** `_pyDg` los guarda enteros en mayúscula y `_pyCodIg` los empareja sólo EXACTOS (antes quedaban en sus dígitos y podían pegarse a otro código que termine igual). `candprecio` usa la misma función. Chequear: un código con letras nunca matchea por el final.

- **Cajas: tope 90 días y lo nuevo sale solo** (`decide_cajas.py`, `TOPE_LENTO`, `PISO_CERO`, 15/10/2026). Chequear que el
  tope no pise el mínimo de 1 de una cuenta en cero que vende, y que "nuevo" sea sólo v30=v60=v180=0 con Full+camino en 0.

- **Unidades por nuevo de Paraguay (15/10/2026, v23.50):** `candMaxU` en index.html (lo usan `pedLlenarPlan` y el aviso ámbar de `pedNuevoFilaHTML`). Chequear: barato que vende = 3-4, caro = 1, resto = casilla; que nunca pase el tope del pedido.

### Etapa 7 · 15/10/2026 · v23.60 · Paraguay simple
Pedidos → Paraguay abre en `pyVista='ambos'` (probados arriba, nuevos abajo). `candidatosHTML` arranca con `cab(nDan)`, un solo
renglón; se sacaron la línea "Arriba sólo lo que da", "cómo funciona esto", `pedNuevosResumenHTML()` de esa vista (sigue en 🧾 Pedido)
y la caja `_cuenta`. Chequear: el renglón 🆕 Nuevos muestra el mismo número que antes daba la caja verde.

### Etapa 3 · 15/10/2026 · v23.61 · Perfumes: la perfumería del local
Regla suya: los perfumes también se venden en el local; costo puesto × 1,25 × 1,30 ≈ precio de ML, sin comisión ni impuestos.
`perfLocalPct(costo, precioML)` = (precioML ÷ 1,30 − costo) ÷ costo, en index.html y sync.mjs (misma fórmula, tocar las dos).
Con 25%+ (`PERF_LOCAL_GAN`) el perfume entra aunque en ML no llegue: no se descarta en `candidatos`, pasa de pycat a Para probar,
`candPuedePedir`/`pedir` lo dejan cargar, en Probados cuenta como "da", y NO se filtra por marca frenada (en el local va cualquier
marca). En pantalla: % azul 🏪 al lado del de ML; el % de ML abajo de 25 en rojo. Chequear: que el costo use el puesto (17%).

### Etapa 7 · 15/10/2026 · v23.62
Se sacó el 🧮 Simulador real de precio de Pedidos → Nuevos (él: "no lo uso"). `simPYHTML` queda sin llamar, por si vuelve.

### Etapa 3 · 15/10/2026 · v23.63
Marca `noLocal` (en `cyc/candidatos_py/<id>` o `cyc/products/<id>`): "ya lo probamos en la perfumería y no da". Apaga el % azul y la entrada por el local (web `candLocalPct`/probados, robot `candidatos` y `pedir`). Botón 🏪✕ / ↩︎ en la tarjeta.

### Etapa 3 · 15/10/2026 · v23.64
`pyNuDePedido`: el precio de Paraguay de un probado sale de los colores a comprar (`pyVar`, el más caro), si no de la ficha. Lo usan la tarjeta y `pyProbVeredicto`. Fotos y links (`pyProbVisHTML`) arriba de la tarjeta abierta. Chequear: un producto con colores de distinto precio.

### Etapa 3/7 · 15/10/2026 · v23.65
Buscador de todo comprasparaguay en Nuevos (`pycatBuscar`, lee `mlapi/pycat` recién al buscar, ~4 MB, queda en memoria). Sólo muestra. Línea de tiempo: etiquetas del % con `pctColor`. Chequear: que las reglas de Firebase dejen leer `mlapi/pycat` con la sesión (son por uid, sí).

### Etapa 7 · 15/10/2026 · v23.66
`html,body{overflow-x:hidden}`: en el celu la página no se desliza de costado. Chequear: que las tablas con barrita propia (Rotación, gráficos) se sigan deslizando.

### Etapa 3 · 15/10/2026 · v23.67 · Listas de precios de otros proveedores
`lista:<proveedor>[|rec=<%>];<producto>=<pesos>[@<código>];…;go` guarda en `mlapi/listas/<prov>` y el proveedor en `cyc/mlconfig/listasProv`. `listamedir[:<prov>][:N][:go]` las mide con `correrPyCatMedir` (opts.lista: costo en pesos + recargo, no pasa nada a Para probar), corre cada 3 h en ml-pycat (paso aparte, `!cancelled()`). Web: Pedidos → 📋 Listas (`renderListas`). Chequear: que el costo en pesos se convierta bien a dólares (÷ dólar del día) y que la lista de un proveedor no pise la de otro.

### Etapa 3 · 15/10/2026 · v23.68
Listas: se sacó `listamedir` del ml-pycat (regla suya: se evalúa la lista una vez y si no da se descarta). `lista:<prov>|descartar;go` / `|volver;go` (`listasProv.<k>.desc`), la web no muestra los descartados.

### 16/10/2026 · v23.74 · máximo de compra por color y regla "sin reposición" (etapa 3 · mercadería)
 · `maxCompraDe(p,meta,color)` (index.html): margen de la publicación del color (`netopub`), caja del color y precio
   `claudedecide/ped/<id>/pvVars/<color>`; `pedVarMaxTxt` lo muestra en el renglón del color. `decido:ped:<id>#<color>=venta|$`
   escribe `pvVars`/`motPvVars` (sync.mjs). Chequear: un color sin precio propio NO muestra nada (sigue el del producto).
 · Regla nueva en CEREBRO.md: lo que no tiene reposición se estira para vaciarse en ~100-120 días al precio más alto.

### TODAS LAS ETAPAS · 16/10/2026 · ¿cada decisión tiene salida?
Pedido suyo: que lo que cambia sin que nadie lo diga no quede con una decisión vieja colgada. En cada etapa, por cada regla
que cambia algo (precio, pedido, caja, marca): ¿qué pasa si desaparece la condición que la disparó? ¿qué la deshace, y en qué
vuelta se mira? Si la respuesta es "nada" o "se acuerda él", es un hallazgo. Hecho hoy: `escasez` → sección 🔁 (escasez y sin
reposición). Faltan controles iguales para: bajas por caja o sobra, promos propias, liquidando, notraer, pausas, decisiones de
pedidos y cajas (`claudedecide`) cuyo motivo ya no vale.

### ETAPA 9 · CEREBRO · 16/10/2026 · el expediente (`escasez:expediente[:todos]`)
Un bloque por producto × cuenta (y color) con stock por lugar, ritmo, reposición, cada publicación (precio de hoy vs vendía,
caja, margen aprox, mi promo, mi última decisión) y lo decidido de pedido y caja. Selección: vendió o cambió el stock en 2 días,
escasez, decisión mía de precio en 7 días, y un tercio del resto por turno. Paso obligatorio de la completa (CEREBRO.md arriba
de todo). Chequear: que "Afuera hoy" no dé 0 (si da 0 la selección no filtra nada) y que el margen aprox no se aleje del panel.
**Ajustes del 16/10 (v23.75), después de la primera corrida (184 de 225):** "decisión mía" ya no cuenta las correcciones al
peor caso del 12/10 (no son pruebas) · la caja decidida de un color muestra sólo ESE color (antes salían los de los otros) ·
⚠️ NO CIERRA cuando el pedido decidido pide comprar algo que no se puede reponer (Nissei no lo tiene / el precio no da) ·
"sin ventas en 30 d" en vez de "vendía a —" · el renglón de reponer no repite "comprar" · un pedido al proveedor vencido dice
"ya debería haber llegado" (web y robot) · `escasez` por ml-consulta ya no intenta el POST de Telegram. Chequear: que el
⚠️ NO CIERRA aparezca en los que de verdad chocan y no en los que sí se pueden comprar.
**v23.76 (16/10):** la línea de tiempo de cada producto (`lineaPintar`, "stock hoy") usa `reponerDe` como Pedidos y el
robot: 🔥 escasez si se acaba antes de reponer, 🔥 sin reposición si no se puede reponer. Chequear: que no diga "bien" en un
producto sin reposición (caso Pendrive 16gb).
**v23.77 (16/10) · UNA SOLA REGLA DE ESCASEZ** (él: "quiero que sean lo mismo"): `escasezDe` en index.html la usan el
semáforo y la barra de Pedidos y la línea de tiempo; el robot (`escasez`, sync.mjs) hace la misma cuenta con el mismo corte
(`cyc/reponer` que escribe la web; sin reposición = 60 d). Dos condiciones: todo junto dura menos que reponer · ML dura menos
que la caja en camino (8 d desde el despacho) / la oficina (10 d) / comprar. Se corrigió: "hay que MANDAR" comparaba ML contra
lo que tarda COMPRAR; el semáforo usaba ≤ y el robot <. Chequear: que un producto dé lo mismo en Pedidos, línea y expediente.
Ritmo: los tres con 30 días con stock (eligió la a el 16/10; antes el robot usaba 14).
**v23.78:** la línea de tiempo pinta en naranja (número, texto y línea del gráfico) lo que alcanza menos de lo que tarda reponer (`_corteE` = `reponerDe(p).d`). Chequear: Pendrive 16gb en naranja, no verde.
**16/10 · ritmo único:** el robot (`escasez`) saca el ritmo de `mlapi/linea` (últimos 30 días, días con venta o stock, sin remates, 3+ ventas y 7+ días; si no, `cyc/ritmonormal`), la misma cuenta que `_pdiaAntes` de la línea de la web. Respaldo: el registro hora por hora. Chequear: Pendrive 16gb da los mismos días en la línea y en el expediente.
**v23.79 (16/10) · ESCASEZ ES ROJO, regla suya:** *"escasez significa lo mismo siempre: rojo. Naranja es que compramos y
recuperamos el stock (…) mientras tanto escasez, rojo y tratar el producto como tal: agrandar el % lo máximo posible"*.
`pedSemDe`: 🔴 sin stock o escasez (dura menos que reponer, o sin reposición con algo de stock) · 🟠 comprar ya y llega a
tiempo (hasta `PED_NARANJA_MARGEN`=7 d más que reponer) · 🟡 hay tiempo. Igual en `escasezDe`, la línea de tiempo y el robot
(sin reposición = escasez siempre, sin el corte de 60 d). Si mañana Paraguay vuelve a dar el 25%, `reponerDe` deja de ser
"sin fecha" y el producto pasa solo a naranja o amarillo. Chequear: Pendrive 16gb en rojo en Pedidos, línea y expediente.

### v23.80 · 16/10/2026 · la línea de tiempo de un color cuenta su caja en camino (etapa 3 · mercadería)
`transitoInfoDe(pid, vari)` acepta el color y la línea de tiempo (`_stHoy`) la llama con `_lineaVar`. Antes, con un color
elegido, la caja en camino quedaba en 0 y `escasezDe` daba escasez de COMPRA falsa (Protector talón Común Beige: 6 en Full
+ 13 en la oficina "se corta a los 12 d" con 18 viajando). Chequear: con color elegido el camino coincide con Armar caja;
sin color, igual que antes. La escasez de Full (se vacía antes de que llegue la caja) sigue saliendo y es real.

### 16/10/2026 · `escmedir[:días]` (etapa 1 · precios) · SOLO LEE
Mide cada suba mía (`cyc/claudecambios`, a > de): ritmo con stock y plata por día 21 días antes contra después, con la
línea de tiempo; elasticidad por suba y resumen escasez/otras. Sirve para elegir cuánto subir en escasez. Chequear que el
día de la suba no cuente en ningún lado y que una segunda suba corte el tramo de la primera.

- **16/10/2026 · v23.85 · Paraguay → Nuevos: desplegables "Ver" y "Ordenar".** Ver: todos / dan en ML (margen ≥ piso, `candPisoDe`) / dan en el local (`candLocalOk`) / los dos. Ordenar reemplaza los botones (mismos criterios). Vive en `_candFiltro` (localStorage `cycCandFiltro`) y `_candOrden`. Chequear: el filtro se aplica a las cuatro listas (arriba, flojas, rojas, sin analizar) y "Nuevos N dan" cuenta sólo lo filtrado.
- **16/10/2026 · v23.86 · Pedidos hechos de Paraguay, más simple.** Sin íconos: fecha y estado a la izquierda, US$ puesto a la derecha con el recargo y el ticket chico abajo; tarjeta en `--surface2` con borde `--border2` y barra de color a la izquierda (celeste en camino, ámbar atrasado, verde llegó). "Ya llegaron" en un desplegable cerrado. Una sola tarjeta (`pyPedidoTarjeta`) para Pedidos hechos y para los en camino de Probados/Nuevos. Chequear: "falta ticket" sigue en rojo en los en camino; el detalle al abrir no cambió.
- **16/10/2026 · textos de `candidatos`/`revisarcompra` sobre Full.** Decían "mido contra $X, el más barato CON Full" mostrando el precio del más barato de todos (desde el 02/10 se mide contra el más barato de todos, `precioAIgualar`). Ahora dicen los dos precios y contra cuál se mide. Sólo texto, la cuenta no cambió.
- **16/10/2026 · Paraguay: si en ML sólo lo venden desde afuera, se mide contra ellos +20% (regla suya).** `ofertasParaMedir` + `RECARGO_INTER` (sync.mjs), usada en `candidatos`, `revisarcompra` y `gondola`. Con un vendedor argentino, los de afuera se siguen sacando enteros (`esOfertaDeAfuera`, tag `cbt`). Antes quedaba "sin dato". Chequear: un catálogo sólo de afuera ahora tiene margen y el renglón lo dice.

### v23.87 · 16/10/2026 · cargar en el pedido lo que no llega al piso, con confirmación (etapa 3)
Él: *"que deje agregar productos que no dan. pero que tenga que confirmar al agregar uno de esos"*. `candPuedePedir`
devuelve `bajoPiso:true` cuando el ÚNICO freno es el margen (fotos, vendidas, descartado, viajando y sin medir siguen
duros); `candSetPedir` pide `confirm()` antes de subir unidades. La tarjeta muestra la casilla con "⚠️ no da". 🪄 Llenar y
el comando `pedir` siguen sin meterlos. Chequear: que `.ok` siga en false para esos (resúmenes y Llenar lo usan).

- 16/10/2026 · Etapa 1 (precios): descuento propio del Ferrari Rojo (MLA1841629747) sacado: se había puesto por "sobra stock" con 5 días de stock. Regla nueva en CEREBRO.md (🏷️): descuento por sobrestock sólo con 30+ días con stock y ~100+ días de stock. Chequear en cada vuelta que ninguna promo propia por sobrestock la incumpla.

- 16/10/2026 · Etapa 3 (mercadería) y 1 (precios): `_reponerCalc` (index.html, v23.88): Bs As ya no es "~1 semana + caja". Con unidades en la oficina → mandar caja (REPO_ARMAR_CAJA); sin nada → sin reposición (REPO_SIN_FECHA_DIAS, regla ⏳ de 4 meses). Paulvic sigue en ~1 semana + caja. Chequear que la lupa y el expediente de escasez digan lo mismo.
- 16/10/2026 · Etapas 3 y 1 (v23.89, eligió 1b 2a): corrige el bucle de la v23.88. Bs As sin oficina = repuesto hasta que Pedidos lo pide 10+ d (`claudedecide/ped/<id>/desde`, lo mantiene `decido` en sync.mjs) sin entrada a la oficina (`cyc/ofientro`, `_ofiEntro` en ofiTx/setQ y el comando `ofi`). `escasezDe` usa max(ritmo de hoy, ritmo normal firme) (no con color elegido en la línea); el robot `escasez` igual en RIT; `decide_pedidos.py` también toma el ritmo de antes tras subas de prueba (tag `PRU` en `pedidostodo`). Chequear: un producto en escasez por "no se consigue" sale de escasez al contar mercadería en la oficina.
- 16/10/2026 · Etapa 7 (diseño) · v23.90: `pedVarMaxTxt` muestra el máximo de compra en TODOS los colores (antes sólo con `pvVars` del color). Chequear que un color sin precio propio dé el mismo número que la cabecera.

- **`cajaitems:<seguimiento>@<cuenta>|…;go` crea una caja nueva (17/10/2026).** Si el seguimiento no existe y se pasa `@<cuenta>`, arma el envío igual que "Cerrar caja" de la web (una caja, no recibida) y saca de la oficina lo que lleva. Vive en `sync.mjs` (bloque `cajaitems`). Chequear: que la caja aparezca en Mi oficina → En camino y que la oficina baje lo mismo.
- **`decido:…!sinstock` (17/10/2026):** deja BAJAR el precio de una publicación sin stock en Full (las nuevas, antes de que llegue la caja: ML las activa solas al entrar stock). Sin la marca sigue igual (sin stock no se baja). Chequear: que sólo se use en publicaciones nuevas.
- **`techofreno` (17/10/2026):** el freno de "no probar más caro" guarda la foto del mercado (`cyc/techofreno/<MLA>`) y se reabre si el competidor más barato sube 8%+, se queda sin ajenos abajo del precio probado, ganamos la caja o pasan 30 días. Vive en `sync.mjs` (bloque `techofreno`). Chequear: que lo frenado no se quede sin mirar y que la foto se tome el día que se vuelve.

- **17/10/2026 · Etapa 1 (precios) · salida de la escasez por pasos al medio (eligió la a).** Qué: al llegar la caja, si el
  precio de escasez deja menos plata por día, se busca el mejor entre escasez y normal por pasos, arrancando por el mejor
  tramo de la escalera. Dónde: regla mía en las vueltas (`ml-sync/CEREBRO.md` 🎯), sin código nuevo. Chequear: que las
  publicaciones que salen de escasez tengan su paso anotado en `notas/techo.md` y no vuelvan directo al normal.

### Etapa 3 · 17/10/2026 · recargo de Paraguay de respaldo 17% → 20% (v24.02, eligió la a)
 · Qué: `RECARGO_PY` (index.html) y `RECARGO_PAR` (sync.mjs) arrancan en 1,20. Sólo valen si `cyc/mlconfig/paramCompra.recargo`
   no está (lo mide `paramcompra:go` cada noche con el promedio de los últimos pedidos completos: 17/10 = 22,7%).
 · Los textos de Paraguay ya no dicen "17%" fijo: dicen "recargo". El log de `revisarcompra`/historial usa `RECARGO_PAR_PCT`.
 · Qué chequear: que ninguna pantalla vuelva a escribir un % de recargo a mano.

### Etapa 8 · 17/10/2026 · la línea del precio con el color de su estrategia (v24.04, pedido suyo)
 · Qué: en la línea de tiempo (`_estD` en la función de la línea), cada día el precio toma el color de su estrategia
   (`estrategiaDe` + `ESTRATEGIA_UI`, lo mismo que el chip de Ventas), de la publicación más barata ese día, al cierre del día.
   El globito del carril del precio dice la estrategia, qué significa y el motivo (🧠 por qué). Abajo, la leyenda con las
   estrategias que aparecen. El costo pasó a línea punteada (para no confundirse con escasez/sin reposición).
 · Qué chequear: que un cambio de estrategia cambie el color el día correcto; días sin estrategia anotada = 🎯 base (azul).
 · 17/10 (v24.05): con dos publicaciones al mismo precio el color sale de la que vendió ese día, después la de precio más
   parecido y, en empate, la que tiene estrategia anotada (antes ganaba la primera de la lista: Espejo 5" azul en 📈).

### 17/10/2026 · v24.16 · tarjeta de Pedidos (Paraguay probados) más corta (etapa 7)
Pedido suyo: "deja lo importante, los detalles que sean desplegables". A la vista: foto, nombre, etiqueta sin repetir el "pidiéndolo queda en N%" (es el número grande), el aviso del semáforo y "comprar N u.". El renglón código · US$ puesto · pesos · vendiste pasa a la primera línea adentro del desplegable. Vive en la rama `_esProb` de la tarjeta de Pedidos. Chequear: que el % grande y el aviso de escasez sigan visibles.
· v24.17, mismo día: él sacó de la vista "no da" y el aviso de escasez; "comprar N u." en blanco y grande; la casilla 🧾 pedir pasa al resumen de la tarjeta (con stopPropagation para no abrir/cerrar) y sale del desplegable (`_card` sin `_armHTML`). Chequear: tocar la casilla no abre la tarjeta.
· v24.18: probados y nuevos con la MISMA tarjeta (pedido suyo: "todos los productos dentro de paraguay se vean igual"): renglón código · US$ → puesto · $ · vendidas abajo del nombre en los dos, y a la derecha UNA fila (local, comprar N en probados, 🧾 pedir, % grande + detalle). La casilla de nuevos llama a `candSetPedir` (mismo freno del piso). Chequear: al tocar la casilla no se abre la tarjeta; si se toca alguna, tocar la otra igual.

### v24.19 · 17/10/2026 · Robot de precios: firme / sin confirmar y juicio a los 30 días (etapa 1, eligió 1a 2a 3)
- **Qué:** el supervisor marca cada cambio `firme` (volumen medido entero con el stock hora por hora), `decidido` y `volFuente`
  (`medido` · `estimado` · `escasez` · `soloprecio` · `pisado` · `espera`). Pasados `SUP_PLAZO_JUICIO` (30) días todo cambio se juzga:
  ventas por día CON stock antes vs después (7+ días de cada lado, se descuenta ±√esperadas por azar; `diasStockSup`: stocklog o, si no cubre, `mlapi/linea` st>0; null con menos de la mitad
  de los días sabidos); escasez: lo "ahorrado" que seguía en stock al entrar la caja siguiente (`sobraTrasSup`, repartido una sola vez
  por caja con `sobraUsada`) se resta a la ganancia del precio viejo. Sin dato de stock: sólo precio. `resumen.firme/decidido/espera`.
- **Web:** `renderMetAuto` muestra "✅ Firme" y "sin confirmar" (gris) abajo del total, y cada renglón dice cómo se midió (`fuenteTxt`).
- **Chequear:** que la suma firme + sin confirmar = total; que un cambio de escasez no reste la misma sobra dos veces; que `estimado`
  mantenga la regla de dirección (subas sólo restan, bajas sólo suman); que la lectura de la línea no alargue mucho la corrida.

### 17/10/2026 · completado de la revisión (pedido suyo: "fijate si hay cosas nuevas que tienen que estar en etapas de revisión y no lo están")
Se cruzaron las versiones de `APP_CAMBIOS` y los commits del robot desde el 13/10 contra este archivo. Faltaban:
 · **Etapa 3 · corte de Paraguay 17 días (v23.40):** el contador de arriba de Pedidos → Paraguay usa viaje + preparar + caja (17 d),
   no los 14 de Bs As. Chequear que el rojo de Paraguay y el de Bs As salgan de su propio número.
 · **Etapa 3 · "SÓLO estos colores" (v23.83):** 📋 Copiar pedido termina avisando que no se reemplace un color por otro. Chequear
   que salga en todos los pedidos con colores (Bs As, Paulvic y Paraguay).
 · **Etapa 3 · `candidatos`: entre los nunca medidos, primero los recién cargados (commit 6a92720).** Chequear que un candidato
   viejo sin medir no quede para siempre atrás (el tope de 250 por vuelta los alcanza a todos).
 · **Etapa 3 · `pycatbusca` (solo lee):** busca en el catálogo de Paraguay guardado (`mlapi/pycat`). Chequear que no imprima nada de terceros.
 · **Etapa 7 · Armar caja simple (v23.52):** a la vista sólo nombre, variante, cuántas tenés, cuántas mandar y el código de
   etiqueta; lo demás al tocar. Chequear que el código de etiqueta siga a la vista (es el control de que se manda lo correcto).
 · **Títulos de las etapas (`REV_ETAPAS`):** la 1 decía "el robot que sube y baja, el rescate, la escalera, el remate", que ya no
   existen desde `SOLO_DATOS` (09/10): ahora dice lo que hago yo (escasez, techo, peor caso, promos, estrategias) y el robot que
   mide. La 3 suma Paulvic, Elegancia, el catálogo de Paraguay, las listas y "no lo consigo". La 8 suma la ficha médica y las
   estrategias.

### Etapa 2 · 17/10/2026 · "cuánto cobrar" proyecta a fin de mes (v24.21, pedido suyo)
 · Qué: `cobroProyMes(ym)` (index.html) lleva neto − mercadería del mes al mes entero (ritmo del mes por días transcurridos; la línea de los
   últimos 7 días se sacó en v24.22, pedido suyo) y resta los gastos del mes (lo cargado o lo del mes anterior si fue más). ÷ 3, a $1.000.
   `_homeCobroHtml` lo muestra grande en el mes en curso; lo ganado hasta hoy (`cobroProxMes`) queda abajo. Robot: `cobromes[:AAAA_MM]`
   (solo lee) con la misma cuenta y la lista de gastos del mes anterior contra los cargados.
 · Qué chequear: que `cobromes` y la tarjeta den lo mismo; que un mes cerrado siga mostrando lo real (sin proyección).

### Etapa 2 · 17/10/2026 · deuda con ARCA por la categoría H (v24.23, eligió la a)
 · Qué: `arcaDeudaARS()`/`arcaDeudaUSD()` (index.html) suman `cyc/mlconfig/arcaHMes` (427.498 = G→H Adriana + F→H Luciana y Matías)
   por cada mes desde `arcaHDesde` (por defecto 2026_05, "estos 6 meses") hasta hoy, salteando hasta `arcaHPagadoHasta`. Entra en
   "Lo que debemos" de `calcArqueo` (no en un mes cerrado). Sin intereses ni multas.
 · Qué chequear: que al pagar se cargue `arcaHPagadoHasta`; que en febrero 2027 (cambian las cuotas) se actualice `arcaHMes`; que la
   ganancia (que ya descuenta H en cada venta) no la reste otra vez.
### Etapa 2 · 17/10/2026 · "¿Cierra el mes?" sin el golpe de la deuda vieja con ARCA (v24.24)
 · Qué: él: *"voy a hacer el arqueo a fin de mes y me va a dar muy negativo, porque agregamos este gasto de H todos juntos"*.
   `renderReconciliacion`: si el cierre anterior no tiene `arcaARS` y el patrimonio de hoy sí incluye la deuda, se le suma de vuelta
   `arcaDeudaARS(<mes del cierre anterior>)` (lo acumulado hasta ese mes). El mes sólo carga con lo que H suma ese mes, que la ganancia
   ya descuenta. Cada cierre nuevo guarda `arcaARS` (la deuda que tenía adentro), así desde noviembre la cuenta sale sola.
 · Qué chequear: octubre no tiene que dar "Falta plata" por ~$2,1M; el aviso ámbar del ajuste sale sólo cuando aplica.
### Etapa 2 · 17/10/2026 · la deuda con ARCA adentro de cada mes cerrado (v24.25)
 · Qué: él: *"debería descontarse al patrimonio cerrado de cada mes, a partir del primer mes que deberíamos haber pagado H"*.
   Probe `arcacierres[:go]` (ml-sync): a cada `cyc/snapshots/<mes>` desde `arcaHDesde` le resta del `total` la deuda acumulada
   hasta ese mes (en dólares con el `tipoCambio` de ese cierre) y guarda `arcaARS` y `totalSinArca` (para volver). No toca un cierre
   que ya tiene `arcaARS`. La web, mirando un mes cerrado, suma esa deuda en "Lo que debemos" (`calcArqueo` lee `arcaARS`).
 · Qué chequear: que el total de un mes cerrado en pantalla coincida con `snapshots/<mes>/total`; si cambia `arcaHDesde` o `arcaHMes`,
   hay que volver a correrlo (borrando antes `arcaARS` y reponiendo `totalSinArca`).
### Etapa 7 · 17/10/2026 · la línea de hoy del gráfico "a esta hora" se cortaba en el iPhone (v24.26)
 · Qué: `_homeCurvaHTML` dibujaba la línea con `pathLength="1000"` + `vector-effect:non-scaling-stroke` y una animación de trazo;
   en Safari ese largo no coincide y la línea quedaba cortada (en la captura, a las ~13 h con el punto a las ~19 h). Se sacó
   `pathLength` y el trazo usa 4000. El número (−53%) estaba bien: compara el punto de ahora contra la punteada a la misma hora.
 · Qué chequear: en el teléfono la línea de color llega hasta el punto.
### Etapa 7 · 18/10/2026 · Paraguay en el celu: tarjeta mínima (v24.27)
 · Qué: él, con captura: *"no se entiende nada en el celu. minimizá todo a lo mínimo. el resto a detalles"*. En ≤640px las tarjetas de
   Nuevos (`candidatosPyHTML`) y Probados (tarjeta de pedido PY) muestran sólo: foto chica, nombre en 2 renglones (`cand-nom`), una línea
   (`cand-cel`: precio puesto · vendidas en Nuevos; comprar N u. · pesos en Probados), pedir y el %. Código, US$ y el % del local
   (`cand-sub`, `cand-loc`) se esconden y aparecen arriba del detalle (`cand-solocel`). En la PC no cambia.
 · Qué chequear: al agregar algo a la fila de arriba de estas tarjetas, decidir si va en el celu o al detalle.
### Etapa 3 · 18/10/2026 · cuántos se analizaron hoy en "No medidos" (v24.28)
 · Qué: `pycatResumenEscribir` guarda en `cyc/pycatres/dia` {d, nomed, tot}: la última cuenta de "sin medir" antes de hoy (se fija en
   la primera escritura del día). La carpeta ❔ No medidos muestra en verde "−N hoy" = dia.nomed − nomed de ahora. Sin el dato de
   ayer no muestra nada.
 · Qué chequear: si se cargan productos nuevos al catálogo en el día, el número puede quedar más chico de lo analizado (entran a sin medir).
### Etapa 3 · 18/10/2026 · el catálogo de Paraguay se mide cada hora (ml-pycat)
 · Qué: él vio que no se revisaban ~300 cada 3 h. Medido: cada vuelta mide 700 (tope 40 min), pero GitHub atrasa el reloj de "cada 2 h"
   y el 17/10 salieron 5 vueltas (≈3.500). Cron pasa a cada hora; `concurrency: ml-pycat` no deja que se pisen.
   Ojo al leer "❔ No medidos": incluye los ya analizados sin catálogo exacto o que nadie vende (sc/sv), por eso el total baja menos que lo
   analizado; el "−N hoy" cuenta sólo lo que salió de "sin medir".
 · Qué chequear: que ML no corte por cupo (429) con más vueltas; si corta, volver a cada 2 h.
### Etapa 7 · 18/10/2026 · el % del local se había escondido en el celu (v24.29)
 · Qué: v24.27 escondió `cand-loc` en ≤640px y los probados que dan SÓLO por la perfumería del local (`pyProbVeredicto` → 'da' por
   `perfLocalPct` ≥ 25%: VS 12%, Cabotine 4%, Lapidus 18% en ML) quedaban arriba con el % de ML en rojo sin explicación. Ahora la línea
   chica (`cand-cel`) lleva el 🏪 % del local en Probados y Nuevos.
 · Qué chequear: al esconder algo en el celu, mirar si es el motivo por el que el renglón está donde está.
### Etapa 3 · 18/10/2026 · botón "🚫 en ML no se puede (marca)" en Nuevos (v24.30)
 · Qué: él: *"botón para sacarlo de vender en ML, ya que son marcas que no se puede. que aparezcan en perfumería pero en ML no. no hagas
   nada automático"*. `candNoML` pone `candidatos_py/<id>/noML` (sólo él, con el botón del detalle). Con la marca: no entra en "los que
   dan en ML" ni en "los dos"; en "perfumería" sólo si da en el local; el % grande dice "🚫 ML"; `_esRojo` la juzga sólo por el local.
   El robot no la toca (los candidatos existentes se actualizan por campo).
 · Qué chequear: que una marca nueva frenada por ML no se pida para ML (el robot sigue midiendo el % de ML, pero la web lo ignora).
### Etapa 8 · 18/10/2026 · el informe ya dice lo ACTIVO FUERA DE FULL (auditoría)
 · Qué: `activarPausadasFull` pide `available_quantity` y junta las activas con `logistic_type` distinto de `fulfillment` y stock > 0
   (`fueraFull`); las imprime como "📤 ACTIVAS FUERA DE FULL" (sección 5 del informe y `pausadas`). El chequeo ya lo tenía en 🔴.
 · Qué chequear: que no aparezca nada ahí (él no vende fuera de Full); lo nuevo que él crea con envío propio sale acá hasta que entra a Full.
### Etapa 3 · 18/10/2026 · "Vender en" arriba, para Probados y Nuevos (v24.31)
 · Qué: él: *"poner el filtro de perfumería, ML, todos arriba, en general para probados y nuevos"*. Botones abajo de "Mostrar" que usan
   `_candFiltro` (el mismo de Nuevos; se sacó el desplegable "Ver"). En Probados filtra lo que DA: ML = `pyProbVeredicto` 'da' sin
   `via:'local'` · Perfumería = `pyProbLocalOk` (el local deja 25%+) · Los dos = ambas. Lo que el filtro esconde se cuenta abajo.
 · Qué chequear: `pyProbLocalOk` repite la cuenta del % azul de la tarjeta (`_locP`); si cambia una, cambiar la otra.

### 18/10/2026 · v24.32 · cartel falso "No se guardó: Attempt to get records… in-progress transaction" (etapa 5)
Qué: en el iPhone, al volver a la app, el guardado de la sesión de Firebase (IndexedDB del navegador) tira ese error; el aviso de
`unhandledrejection` lo leía como "No se guardó" porque el texto dice "database". Ahora se ignora (sólo errores de IndexedDB).
Dónde: `index.html`, listener `unhandledrejection`. Chequear: que un rechazo real de la base (PERMISSION_DENIED) siga avisando.

### 18/10/2026 · lo activo FUERA de Full se pausa solo (etapa 1/3)
Regla suya: *"Pausá todo lo que esté en depósito. No podemos mandar a mano. Siempre Full"*. `activarPausadasFull(…, {pausarFuera})`:
toda publicación activa, no `fulfillment`, con unidades, se pausa (PUT + relectura) en la vuelta de cada hora (aunque decida
Claude) y con `activarfull:go`. Sin `noAutoActivar`: al llegar a Full se activa como cualquier pausada con stock. Marca
`mllinks/<MLA>/pausaFueraFull`. Chequear: que no pause publicaciones de Full sin stock (filtro `available_quantity>0` y logistic ≠ fulfillment).

### 18/10/2026 · v24.42 · ✕ sacar producto de una lista · y Paraguay → Pedido arreglado (etapa 3)
Pedido suyo: botón de sacar en un "detalle ▾" de cada producto de 📋 Listas. `listaSacar` escribe `mlapi/listas/<prov>/<cód>/sacado`
(y lo saca del pedido); no cuenta en ✅/🔎 (`_listaMed25`, `cuentaLista`), no sale en `listarevisar`; va a "🗑️ Sacados" con ↩︎ volver.
**ERROR MÍO de la v24.35:** el bloque "🔎 Para revisar" se insertó en `pyHechosHTML` (Paraguay → 🧾 Pedido) en vez de `renderListas`:
`revis` no existe ahí y esa solapa tiraba error. Se movió. **Chequear:** abrir Paraguay → 🧾 Pedido después de tocar Listas.

### 18/10/2026 · v24.41 · listas: mínimo 100 ventas (etapa 3)
Él: *"el mínimo es 100 ventas. para todas las listas"*. ✅ Dan = 25%+ (con nombre y foto bien, o `ok` del chat) Y `vend` ≥ 100.
Sin `vend` → 🔎 Para revisar (lo mira el chat con `listarevisar`/`listadato`); `vend` < 100 → afuera. Misma regla en `_listaDa` (web)
y `cuentaLista` (robot).

### 18/10/2026 · v24.40 · Paulvic: el mensaje copiado en cantidades redondas (etapa 3)
Él: *"que al copiar el mensaje siempre las unidades pedidas sean 3, 5, 10, 20, 50, 100. si hay que pedir 1 que diga 3"*. `_pvPaso` en
`_pedidoItemHtml` (sólo si `esPedidoPaulvic`): para arriba al escalón siguiente, arriba de 100 a la centena. Sólo el texto copiado.

### 18/10/2026 · v24.39 · el chat de compras completa las listas (etapa 3)
ML no le deja al robot ver ventas de otros ni la página del producto. `listarevisar[:<prov>]` (solo lee) arma la lista para el chat
(lo que da o está "para revisar", sin ventas cargadas) entre @@LISTA y @@FIN; el chat la mira en ML y devuelve
`listadato:<prov>;<cód>=<vendidas>[,ok|,no][,mi=<MLA>];…;go` (ml-consulta): `vend`, `ok` (mismo producto → ✅ aunque falte palabra o dé
80%+), `noEs` (otro producto → afuera), `miFijo` (catálogo correcto: `listamedir` lo mide con ése sin buscar). Recuenta el botón.
**Chequear:** que un `ok` con margen nuevo abajo del 25% no quede en ✅ (manda el margen).

### 18/10/2026 · v24.37 · el botón de cada proveedor dice cuántos dan (etapa 3)
Pedido suyo: *"que ponga la cantidad de productos más de 25%. Y los que no tengan, sacarlos de la lista. Ocultarlos"*. `cuentaLista`
(sync.mjs, misma regla que `_listaDa`) guarda en `listasProv/<prov>` {n, med, pend, dan, revisar}; lo escriben `listamedir` y
`listacuenta[:go]` (sólo cuenta). La web muestra "✅ N" (y ⏳ los sin medir) y esconde el proveedor medido entero sin ninguno que dé
(lo "para revisar" no cuenta), salvo que tenga probados. **Chequear:** que un proveedor a medio medir no se esconda (pend > 0).

### 18/10/2026 · v24.35 · 7 listas nuevas y "🔎 Para revisar" (etapa 3)
Cargadas con `lista:` (costo con IVA por unidad): Cadam/Estrella (unitario c/IVA) · Qsoft (precio nuevo s/IVA ×1,21) · Unilever (precio
final) · Saint Julien (U/c IVA) · Rofina/lista 58 (precio al canal ×1,21) · Iscos (todas las hojas, ×1,21; fuera MAYBELLINE 2018, COTY,
MERCLIN 2023, PREAL, COVID, PEDIDO, y lo de menos de $1.000) · Dai Nippon L1309 (CTDO c/IVA; la columna OFERTA es del salón y no se usa).
Las promos del PDF de Estrella y las del salón de Dai Nippon no se cargaron (son del salón o vencen el 30-31/10).
Saint Julien dio 50 "dan" falsos (ML emparejaba con otro producto cuando faltaba el aroma). La web ahora: ✅ Dan = 25% a 80% sin `rp`;
🔎 Para revisar = 25%+ con `rp` o 80%+ (sin casilla). **Chequear:** que lo de "Dan" sea de verdad el mismo producto (mirar la foto).

### 18/10/2026 · lista Godrej (solares Villeneuve) · medida y descartada (etapa 3)
21 productos, costo = "P. Neto S/IVA" (con el 9% de pie de factura) × 1,21. La lista dice "VN": cargada como "Villeneuve" (con "VN"
ML emparejaba con Dermaglós y Bagóvit). `lista:` ahora borra la medición cuando cambia el nombre (se vuelve a medir) y `listamedir`
busca el proveedor sin mirar mayúsculas. Resultado: Villeneuve se vende en ML MÁS BARATO que este costo (−20% a −66%); los dos "dan"
eran emparejados mal (Dermaglós; 50 ml contra 250 ml). Descartado con `lista:Godrej|descartar;go` (regla suya del 15/10: si todos están
lejos se descarta). Se devuelve con `|volver;go`. **Chequear:** el chequeo de tamaño no ve "50 ml" contra "250 ml" cuando hay "FPS 50".

### 18/10/2026 · v24.34 · 📋 Listas = otro Paraguay, sólo ML (etapa 3)
Él: *"queda así bs as / paraguay / paulvic / listas (ahí van todas las listas que te paso de la perfumería…) quiero que en listas se
trate igual que en paraguay. Y va a ser solo mercadería para ml"*.
 · Pedidos: 🇦🇷 Bs As · 🇵🇾 Paraguay · 🧴 Paulvic · 📋 Listas · 🗑️ Papelera.
 · `renderListas` (index.html): proveedor arriba y tres solapas (`_listaVista`): ✅ Probados (fichas con `listaProv`, con su pedido de
   reposición de `state.pedidos`; Bs As los saca) · 🆕 Nuevos (dan = medido ≥25% en ML y con foto de ML, `_listaDa`; casilla de unidades
   → `cyc/listas_pedido/<prov>/<cód>`, `listaSetU` no deja cargar lo que no da ni lo que ya viaja) · 🧾 Pedido (mensaje cód × u, "Ya lo
   pedí" → `cyc/compraslista/<id>` estado camino; "Llegó" → `listaLlego` crea fichas con costo = lista + recargo en US$ del día del
   pedido, `origen:'bsas'`, `proveedor`, `listaProv`, `codLista`; si ya hay una con el mismo nombre/código la engancha).
 · Se fueron la carpeta "Lista precio negocio" y el % del local en Listas. Robot: `correrPyCatMedir` con lista ya no hace pasar por el local.
 · **Qué chequear:** que un probado de Listas no aparezca también en Bs As; que el robot de pedidos decida esas fichas (origen bsas).

### 18/10/2026 · v24.33 · carpeta "📁 Lista precio negocio" (etapa 3)
Pedido suyo: los proveedores de la perfumería del local van en una carpeta aparte en Pedidos → 📋 Listas. `lista:<prov>|negocio;go`
pone `cyc/mlconfig/listasProv/<prov>/negocio` (`|sinnegocio;go` lo saca; también se puede pasar al cargar la lista). En la web
(`renderListas`) esos proveedores van en un desplegable y en ellos el % del local se calcula para TODO (no sólo perfumes).
Primero: Wels (89 productos, precio con IVA; los 13 "Internacional" son imitaciones y no se cargaron).
Chequear: que un proveedor de la carpeta siga apareciendo si es el único.

### Etapa 7 · 19/10/2026 · el cambio de precio se salía de la tarjeta de Ventas en la PC (v24.68)
- Qué: en el renglón de la PC (`.vp-pc`) el texto de `cambioVentaHTML` ($antes→$ahora, N cambios, % antes→después) se salía de la tarjeta. Ahora el renglón muestra sólo la flecha ▲/▼ (`_flechaCambio`) y el texto entero queda en el detalle (`_det`), igual que en el celu.
- Chequear: en la PC ningún renglón de venta pasa el borde de la tarjeta; al tocarla, el detalle muestra el cambio de precio completo.

### Etapa 8 · 19/10/2026 · stock antiguo: lo que no vendió con fecha aproximada ya no es "recién llegado"
- Qué: `calcAntiguoFilas` (sync.mjs) por color usaba sólo la fecha del registro del color (arrancó ~25/09) y daba por "recién llegado" el Joystick Xbox Velocity de Matías, que ML iba a descartar por 120 d sin vender. Ahora toma también la fecha del producto en la cuenta, y lo que no vendió con fecha que no es de caja, Excel ni registro real sale como `sinFechaReal`: en `antiguo` (⚠️ SIN VENTAS Y NO SÉ DESDE CUÁNDO ESTÁN) y en el 💸 del expediente, para decidir en la vuelta.
- Chequear: el Joystick Velocity sale con cargo y no en "recién llegados". Y por color también cuentan las cajas que dicen la variante (`cajasLlegadasPorClave` arma claves `__v__`): los VS de la caja del 07/10 salen con 12 d, no 61.

### Etapa 7 · 19/10/2026 · el puntaje de Rotación no entraba en su círculo (v24.69)
- Qué: en la tarjeta de Inicio (`nc-rot-score`) el número (ej. 9.5) en Syne no entraba en el círculo de 26px. Ahora es una píldora de 36px mínimo con letra mono; 10 se muestra sin decimal.
- Chequear: 9.5 y 10 se ven enteros en la tarjeta, en el teléfono y en la PC.

### Etapa 7 · 19/10/2026 · la cabecera de la venta se cortaba en la PC (v24.70)
- Qué: en `.vp-pc-cab` (Ventas x Producto, PC) con `overflow:hidden` se perdía lo de la derecha ("Bien", 📈). Salieron el neto y el costo (están en el detalle: "Cobrado · neto" y "Costo") y la fila puede pasar a dos líneas en vez de cortarse.
- Chequear: en una ventana de ~1000px se ven el % con su etiqueta y la 📈; nada queda afuera de la tarjeta.

### Etapa 3 · 19/10/2026 · Paraguay Probados: lo cargado en el pedido sale de la lista (v24.71)
- Qué: en Pedidos → Paraguay → Probados, las fichas con unidades en `state.pyArmado` no se dibujan (se cuenta "N ya están en el 🧾 Pedido"). Nuevos ya lo hacía con `candEnPedido`. Al poner 0 en el pedido vuelven solas (se mira en cada dibujado).
- Chequear: cargar un probado → desaparece de Probados y aparece en 🧾 Pedido; sacarlo → vuelve a Probados.

### 19/10/2026 · cerebro completo
- Pedidos y cajas rehechos con `pedidostodo` del día (`ml-sync/notas/pedidos.txt`, 35 renglones cambiaron). Blush sigue en 0: no tiene publicación en ML.
- Chequear: que `decido:archivo=pedidos;go` aplique todo y que Pedidos/Armar caja muestren lo nuevo.
- **📦 SOBRA STOCK Y NO LO DECIDÍ (planilla, 19/10/2026, regla suya con el Timer):** todo stock de Full que al ritmo de hoy (mayor entre 30 y 60 d, sumando las publicaciones que comparten la mercadería) dura más de 90 días o no vendió en 60, sin anotar 📦 sobra / 📉 liquidando / promo mía / !piso y sin nota mía en 7 días, sale en la lista y se decide en esa vuelta. Lo llegado hace menos de 30 días (fecha real) va aparte como lanzamiento. Chequear: que la lista quede vacía al cerrar cada completa.

### Etapa 3 · 19/10/2026 · v24.72 · Nissei: dos pedidos del momento (perfumería / resto)
- Pedido suyo: *"en nissei que haya dos pedidos del momento, uno de resto y otro de perf y esas cosas"*. `pedidoMomentoHTML(g)` dibuja uno por grupo (`pyMomGrupos`: Nissei = perf/resto, Elegancia = uno solo). Grupo = `esBellezaNom` (la misma regla del mensaje para Nissei), filtro `pyMomEs`.
- Cada uno tiene su total, su tope (`pedTopeUSD`, el mismo número para los dos), 🪄 Llenar, Vaciar y "Ya lo pedí". Perfumería se guarda como `compraspy/pyb<fecha>`, el resto como `py<fecha>` (`pyIdHoy(hoy,g)`, campo `rubro`). Los botones viejos sin grupo (Ya lo pedí de 🆕 Nuevos y de la canasta) parten solos en los dos.
- Robot: `compray` busca también `pyb<fecha>`; con los dos el mismo día pide `|perf` o `|resto` (no adivina).
- Chequear: que un producto no aparezca en los dos pedidos, que "Ya llegó" de un `pyb` cree las fichas igual que un `py`, y que `pyped:llego:pyb<fecha>` ande.

### Etapa 3 · 19/10/2026 · v24.73 · vendidas en el pedido del momento y fichas sin colores
- Pedido del momento: cada renglón muestra las vendidas (nuevos: `candVentasDe`, verde desde `pedMinVent`; probados: `pedVentasNorm` 30 d). Chequear que no falte en ninguno de los dos bloques.
- La Pizarra 12" tenía 3 publicaciones de colores y la ficha sin colores: Pedidos pedía 10 sin decir de cuál. Cargados Rojo/Negro/Azul, `fijarvar` en las 3 de Luciana, pedido color por color (juicios.txt). Las 2 Calculadoras de Matías estaban en esa ficha: vinculadas a Calculadora.
- Comando nuevo `variantes:*sincolor` (solo lee): fichas sin colores cuyas publicaciones nombran 2+ colores. Corrido el 19/10: 21, casi todas el mismo producto repetido entre cuentas. Colores reales cargados: Linterna Multifunción (Naranja/Azul), Juguete Gato Bola (Celeste/Rosa). Para mirar: Cortapelo 4 en 1 (mezcla modelos), balanza equipaje (Negro/Celeste/Amarillo), Pendrive 16gb con un Kingston Exodia vinculado (MLA1681419417).
- v24.74: botón "🛒✕ no da en ML" a la vista en cada candidato de Nuevos (mismo `candNoML`/`noML` que el del detalle). Chequear que lo marcado no entre en Llenar ni en "dan en ML".
- v24.75: "🚫 no se consigue más" en el detalle de cada venta (`vpNoConsigoBtn` → `toggleNoConsigo`, misma marca `cyc/noconsigo` que Pedidos, por color si la venta lo tiene). Chequear que el producto marcado siga en Pedidos.
- v24.76: `escasezDe` usa `ritmoNormalDe` sólo si alguna publicación del producto está en estrategia escasez/techo/sinrepo (el bucle que tapaba la 2a). Caso: Chispero bajado de precio salía en escasez con 34 d. Chequear que el robot (`escasez`, `decide_pedidos.py`) mida igual.
- 19/10: el guardián sacó mi descuento del Pendrive 128 (MLA1782602199) porque ML le cambió el id. `promoPermitida` acepta ahora un PRICE_DISCOUNT anotado mío aunque cambie el id (sólo nosotros ponemos ese tipo). Chequear que ninguna promo mía se pierda en la vuelta de la hora.
- v24.77: Pedidos: unidades por color editables a mano (`cyc/claudedecide/ped/<id>/mano/<color>` {u,ts}, manda sobre lo mío, el robot no lo toca; `=auto` sin color lo borra). Paulvic: "✅ Pedido hecho" escribe `cyc/pedidospv/pv<fecha>` igual que `pvped` con las unidades redondeadas del copiar, descuenta lo decidido y borra `mano`. Chequear que el copiar y el pedido hecho usen las mismas unidades.
- v24.78: Paulvic: cada aroma recomendado se redondea al más cercano de 3·5·10·20·50·100 (`pvRedondo`, empate para arriba, más de 100 a la centena); total, copiar y pedido hecho usan el mismo. Se sacó "SÓLO estos colores/productos…" del copiar, de Listas, de `decide_pedidos.py` y de las notas mostradas (`_sinSoloTxt`).
- v24.79: Paulvic con pestañas 📦 A comprar / 🧾 Pedidos hechos (`_pvVista`, `pvEnCaminoHTML` va sólo en la segunda).
- 19/10: regla nueva en CEREBRO.md (📤 retiro de Full → rehacer la promo con lo que queda y los días al stock antiguo). Pendrive 128 a $39.890.
- v24.80: listas que compra Tito en Bs As (`listasProv/<prov>/bsas`, comando `lista:<prov>|bsas;go` / `|nobsas`): se dibujan en Pedidos → Bs As (`bsas-listas-body`) y no en Listas; sus probados quedan en Bs As. Pedido Paulvic pv20261019 (114 u., 19 aromas) cargado.
- 19/10: `lista2py:<prov>[;go]` pasa una lista de 📋 Listas a candidatos de 🟣 Elegancia (US$ = pesos ÷ dólar si la lista no trae US$, foto de `elegancia/<cód>.jpg` publicada en Pages) y descarta la lista. Aplicado a "atacado bf" (regla suya: atacado = Elegancia, sin tarjeta aparte). Chequear que no queden candidatos duplicados entre Nissei y Elegancia.
- v24.81: Paraguay arranca en `pyVista='probados'` (antes 'ambos'): los Nuevos se dibujan al tocar el botón, por lentitud.
- v24.82: "🗂️ Lo que no entra en el pedido" de Paraguay → Nuevos se arma al abrirlo (`window._pyNoEntraFn`, ontoggle). Chequear que al abrirlo aparezcan las dos carpetas.
- v24.83: `pedVendTxt` en el pedido del momento: vendidas con días con stock y lo vendido desde el último cambio de precio o caja (`ritmonormal.ra`). Chequear que coincida con la línea de tiempo.
- v24.84: línea de tiempo: "escasez" sólo si `escasezDe` da escasez (se sube el precio); poco en Full pero cubierto por caja en camino u oficina = "🚚 cubierto" (celeste); el gráfico dice "poco en Full". Regla en CEREBRO.md (🔥). Chequear con Cartas Casino.
- v24.85: tag nuevo `descuento` (💸): `entrarpromo` lo pone si es PRICE_DISCOUNT o ML no pone plata (`meli_percentage`); `promo` sólo si ML pone parte. Web: `ESTRATEGIA_UI.descuento`, `estrategiaPromoAjuste` (cada venta decide por `cyc/promoventa`: ML puso algo = promo, si no descuento), `estrategiaDe` pasa a descuento si `promoclaude.tipo` es PRICE_DISCOUNT. Chequear: Pendrive 128 (descuento propio) muestra 💸.

- v24.86 (19/10/2026) · Tags de pasaje (🏔️ 🪜 ↘️ ↗️ 🧨), sin ↩️ corrección (se nombra por el anterior: `pasajeDe`/`estrategiaPasaje`, las dos iguales), chip "de X", escalón de escasez, y lista 🔎 SIN AFINAR en `planilla`. Qué chequear: que una vieja "correccion" se vea con el nombre del pasaje y que la lista nueva salga vacía al final de cada completa.
- v24.87 (19/10/2026) · Sin 🎯 base: ⚪ sin estrategia / ⏸️ sin stock, `decido` exige estrategia, `pasajeDe` cae en ↘️ volviendo. Chequear: que ninguna activa con stock quede ⚪ al terminar la completa.
- v24.88 (19/10/2026) · Pedidos de Listas: precio de lista por renglón, total a precio de lista y en el mensaje para copiar (pedido suyo con Iscos). Chequear: que el mensaje y el pedido hecho muestren lista y lo que te sale.
- v24.89 (19/10/2026) · `techo95`: 🏔️ sólo con 95% (Poisson con plata por día), raya 🏔️ en la línea de tiempo con el porqué. Chequear: que cada 🏔️ diga su % y que ninguna se haya anotado a mano.
- v24.90 (19/10/2026) · Sin cartel dorado de promo en la venta cuando la estrategia ya es promo/descuento (`vpPromoLabel`).
- v24.91 (19/10/2026) · Línea de tiempo con 🔴 techo (95%, Poisson con plata por día), 🟢 piso (precio más alto con 3+ ventas en 5+ días con stock) y 💰 máxima plata por día (`_rayas`). En 📦 sobra / 📉 liquidando no se dibujan y se dice. Chequear: que la cuenta del 🔴 dé igual que `techo95` del robot.
- v24.92 (19/10/2026) · 💰 piso unificado (el de más plata por día); se sacó la raya 🟢. Chequear: que no se baje abajo del 💰 sin motivo de sobra/problema.
- v24.92+ (19/10/2026) · `lotesFifo` ignora lotes del Excel y cajas anteriores a la vuelta del stock desde cero (`stockhist.desde` real). Error que lo disparó: descuento al Paulvic Scarf por stock antiguo con unidades nuevas. Chequear: `antiguo` no muestra lotes viejos en productos que estuvieron en cero.

### 19/10/2026 · tags techo/escasez que no suben (etapa 1, precios)
- Qué: `decido` que baja con #techo/#escasez guarda 🪜 bajando; `planilla` lista 📈 DICE TECHO/ESCASEZ Y NO SUBE (cyc/claudecambios desde el tag).
- Dónde: sync.mjs, `decido` (guardado del tag) y `planilla` (después de 🔎 SIN AFINAR).
- Chequear: la lista sale vacía al final de cada vuelta; una baja de escalera nunca queda como 🔥.
- Stock antiguo: con `lotesFifo` corregido (desdeCero), se revisaron mis descuentos por stock antiguo: Pendrive 128 salió del descuento (de 48 quedan 8). Timer y auricular vincha siguen por sobra.

### Etapa 3 · 19/10/2026 · `listaver:<proveedor>` (solo lee)
Imprime la lista guardada ENTERA de un proveedor (`mlapi/listas/<prov>`: cód|nombre|pesos|fecha) para compararla contra otra fuente
(primer uso: el catálogo web de Iscos, septiembre, contra la lista de octubre). Qué chequear: que no escriba nada y que no imprima datos de terceros.

### Etapa 3 · 19/10/2026 · v24.93 · Iscos: el costo es el P. Lista menos el descuento (eligió la a)
El remito de Iscos del 16/09 mostró que el "P. Lista" es el precio al público y que se paga el NETO (−30%; Cher y Bensimon −33,5%;
el total del remito es la suma de los netos, sin IVA encima). La lista se había cargado ×1,21 (como si fuera sin IVA): el costo quedó
entre 73% y 82% más caro que lo real. `listadto:<prov>;base=;dto=;<prefijo>=<%>;go` guarda en cada producto `pl` (P. Lista), `dto` y
`p` = pl × (1 − dto), y `listamedir` lo vuelve a medir solo. La web muestra "lista $X −N%" y el pedido sigue con el precio de lista.
**Chequear:** que una marca de Iscos con otro descuento no quede con el 30% general; que re-correr `listadto` no descuente dos veces.

### Etapa 7 · 19/10/2026 · v24.94 · ventas: la promo sólo como tag
Pedido suyo con el Timer (ML puso $0 y decía "🏷️ promo" arriba y "⚪ sin estrategia" en el tag). `vpPromoLabel` ya no dibuja nada;
`estrategiaVentaHTML` usa lo que pasó en esa venta (`cyc/promoventa`): ML puso algo = 🏷️ promo, sólo nosotros = 💸 descuento, con la
estrategia del precio como "· de X". Además el tag del Timer (`MLA3735058390`, 📦 sobra) se anotó desde el 18/10 con `tag:…@fecha`:
se había guardado después de la venta. **Chequear:** que una venta en promo nunca muestre ⚪ sin estrategia.

### Etapa 3 · 19/10/2026 · v24.96 · Pedidos: el pedido al Paulvic en camino se descuenta de lo decidido
Él: *"al realizar el pedido no sacó los productos de paulvic que pedí"* (pedido del 19/10, 114 u., y Pedidos seguía pidiendo 104).
Lo decidido por Claude (`claudedecide/ped`) mandaba y no restaba lo pedido después. Ahora: cada pedido en camino (`cyc/pedidospv`) con
`ts` posterior a la decisión y sin `desc` se resta aroma por aroma (no lo que él cambió a mano). El botón "pedido hecho" de la tarjeta
ya descuenta y marca `desc:true`. Se da por hecho que llega todo; lo que falte se corrige con `pvped:llego`.
**Chequear:** que un pedido hecho desde el botón no se reste dos veces; que al re-decidir (ts nuevo) no se reste de nuevo.

### Etapa 3 · 19/10/2026 · v24.97 · Links en los pedidos hechos de Listas
Pedido suyo: cada renglón de un pedido hecho (📋 Listas → 🧾 Pedido → Pedidos hechos) tiene "📄 verlo en la lista" (`listaVerOri`,
el renglón original en `mlapi/listasori/<prov>/<cód>`) y "🔗 verlo en ML" (`i.mi`, el catálogo contra el que se midió, guardado
por `listaYaLoPedi`). Sin `mi` dice "sin link de ML". Chequear: que el link de ML sea el mismo producto (sobre todo lo de 80%+).

### Etapa 3 · 19/10/2026 · v24.98 · Listas: sólo lo que está en la web del proveedor (`listaweb`)
Él: *"solo tienen en stock lo que hay en la web de ellos. No en la lista que te pasé en Excel. Solo la web de Iscos"*. Cruce hecho en
el chat (web de Iscos relevada el 19/10, código sin el prefijo de la lista, o el mismo nombre): 1.494 de 3.475 están. `listaweb:<prov>;go`
lee `ml-sync/notas/listaweb_<prov>.txt` (los códigos que SÍ están) y marca `noWeb` en el resto. Web: `noWeb` no entra en Dan / Para
revisar / buscador, no deja cargar unidades y va a "🚫 No está en la web"; en Pedidos hechos el renglón lo dice en rojo. `cuentaLista` y
`listarevisar` lo excluyen. Qué chequear: rehacer el cruce cuando cambie la web (el archivo no se actualiza solo).
- 19/10 (mismo día): `listaweb` también toma el PRECIO de la web (archivo `cód|precio`) y lo deja como costo con los descuentos de la
  web (`listasProv/<prov>/dtoWeb`, Iscos por defecto [30, 5] = ×0,665, él: *"si ves 100.000 queda 66.500"*). Guarda `pl` = precio
  web, `dto`, `p` y `precioWeb`. `correrPyCatMedir` no mide lo `noWeb`. Chequear: que `p` = round(pl × 0,665) y que `listamedir` re-mida.

### Etapa 3 · 19/10/2026 · v24.99 · Listas: un solo vendedor en ML no confirma el precio
Él: *"hay un flaco que vende los perfumes re caros. Y es el único (…) es un precio inflado que no sabemos si vende"*. Con `mv`==1 el
producto nunca va solo a ✅ Dan (web `_listaDa`, robot `cuentaLista`): va a 🔎 Para revisar hasta que el chat lo marque `ok`.
`listarevisar` lo lista como REVISAR-1VEND. La fila y Pedidos hechos dicen "⚠️ 1 solo vendedor". Chequear: que ningún Dan tenga mv 1 sin ok.

### Etapa 7 · 19/10/2026 · v25.00 · La tarjeta de venta del teléfono no se sale al abrir el detalle
Captura suya: al abrir "detalle" la tarjeta (`.vp-cel`) se ensanchaba (chips, el renglón del cambio de precio y los botones con
`nowrap`), se cortaban el % y los botones, y el iPhone agrandaba la letra (text-size-adjust). CSS en ≤640px: nada pasa del ancho,
todo corta renglón; `html{text-size-adjust:100%}`. Probado con una maqueta a 390px (scrollWidth 390). Chequear en cada cambio de la tarjeta.

### Etapa 7 · 20/10/2026 · v25.05 · Las ventas del celu salían aplastadas (consecuencia de v25.00)
Captura suya: cada tarjeta de Ventas se veía cortada por la mitad. La lista (`.ingreso-list`, `#vp-day-list`) es flex en columna
con alto máximo (68vh en el celu) y el `overflow:hidden` de v25.00 le saca el piso de alto a cada tarjeta (min-height auto → 0):
el navegador las achicaba hasta que entraran todas (5 px c/u). Arreglo: `#vp-day-list>*,.ingreso-list>*{flex-shrink:0}`.
Probado con maqueta de 30 tarjetas a 390px: 5 px → 107 px. **Chequear: al poner overflow en algo que vive adentro de una lista
flex con alto máximo, que no se achique; probar con muchas tarjetas, no con tres.**

### Etapa 7 · 20/10/2026 · v25.06 · En camino: el contenido de la caja en lista con el código de Full
Pedido suyo ("uno arriba del otro con unidad y código, así es más fácil el armado del celu"). `renderCajasEnCamino`: cada renglón
= unidades grandes · código de la etiqueta de Full de esa cuenta (`etiquetaFullDe`, la misma de Armar caja; sin código dice
"sin código", no adivina) · producto y variante. Chequear: que el código sea el de la cuenta de la caja y de esa variante.
v25.07: el contenido arranca cerrado y se abre tocando el encabezado del envío (`_cajaAbierta`, `cajaToggle`; cerrado dice
renglones y unidades). Se recuerda mientras la app está abierta.

### Etapa 2 · 19/10/2026 · v25.01 · Paulvic: "a pagar ≈" en el pedido en camino
Pedido suyo. `_pvPrecioUnitAnt`: lo que salió cada unidad en el último pedido con monto (calculadora ÷ llegadas, sin flete); la
tarjeta en camino muestra unidades pedidas × eso como "≈ $X · aprox" (y arriba a la derecha). No se guarda en ningún lado: es sólo
para mirar. Chequear: que no se use como deuda en el Arqueo (la deuda sigue siendo sólo lo llegado sin pagar).

### Etapa 3 · 19/10/2026 · `catbusca:<texto>[;…]` (solo lee)
Lista los catálogos de ML de una búsqueda (15) con vendedores, rango de precio y cuántos Full, para elegir a mano el catálogo correcto
cuando el emparejado por nombre agarra un set u otro tamaño (caso Cheeky Cool Boys → "perfume + espuma"). No escribe nada.

### 19/10/2026 · Revisión de cajas con el cupo de Full
`decide_cajas.py` pedía 200 u. para Ayelen y 16 para Matías con cupo de 38 y 11. Se recortó a mano por urgencia (días hasta cortarse) × ganancia por unidad, y lo que no entra queda en la nota con "NO ENTRA". El Blush de Paulvic no va: no tiene publicación. **Qué chequear:** que el script no proponga más que el cupo de cada cuenta (hoy no lo mira: se recorta a mano).
· **19/10 · Armar caja busca también por el título de ML** (v25.02): `_coincide` en `renderOfiCaja` suma los títulos de `cyc/mllinks` del producto (renglones sin variante). Las fichas de Paraguay quedan en portugués y él busca en castellano. Qué chequear: que un aroma siga trayendo sólo ese aroma (los renglones con variante no miran el título).
· **19/10 · Armar caja: buscando, "Sin recomendación para mandar" se abre solo** (v25.03). Lo decidido en 0 vive ahí y quedaba escondido al buscar. Qué chequear: que sin búsqueda siga recordando abierto/cerrado.
· **19/10 · Al vincular, la ficha toma el nombre de ML** (regla suya). `vincular` llama a `nombreDeML` (no con variantes); `nombreml[:go]` (ya existía desde el 06/10) para las de Paraguay ya vinculadas. `cajaweb:<cuenta>:<palabra>` (solo lee) dice si la web debería mostrar un producto en Armar caja.

- **20/10/2026 · Paulvic: llegada aprox y vencimiento del pago (v25.04, etapa 3).** `_pvDemoraDias` (mediana pedido→llegada de los ya llegados; sin ninguno, 11 d), `_pvLimitePago` (7 días hábiles lun-vie desde que llega, `PV_DIAS_PAGO`) y `_pvHabilesHasta`, en `pvPedidoTarjeta`: en camino dice "llega aprox" y "pagar aprox antes del"; llegado sin pagar dice los días hábiles que quedan (rojo con 2 o menos) y "venció: cobran 10% más". Qué chequear: no cuenta feriados; la llegada real se carga con `pvped:llego`.
- **20/10/2026 · Caja de Matías con cupo 81 (`cupo:matias=81/100;go`).** Lo que hay en la oficina para Matías son 16 u. (Chispero 12, Muñequera 3, Seagate 1): el cupo nuevo no agrega más porque no hay más mercadería suya en la oficina. Las decisiones de Ayelen pasaron a 0: salieron en la caja 79993558 (16 renglones, 65 u., igual en ML y en el panel; el Afinador/Mentonera va con costo 0 y vale $0 en el Arqueo hasta que tenga costo).

- 20/10 · Navidad: pedir 45 días a mitad de noviembre lo que subió en dic-2025 (CEREBRO.md 🎄, recordatorio 14/11) · tarjetas SanDisk: todas originales, la 32GB queda activa · Bola de hielo MLA1754449117 desocultada para venderse (chequear margen 25% peor caso).
- 20/10 · VS: salí del descuento propio en 12 publicaciones (9 abajo del 25% y Love Addict, Sizzling, Wild Neroli recién llegadas) · regla nueva 🤔 ¿tiene sentido el descuento? (CEREBRO.md): sobra real, no recién llegado, 25%+ peor caso. Qué chequear: que vuelvan al precio de lista y que el próximo `analizapromo` no proponga descuentos que fallen la regla.

- 20/10/2026 · `planilla` · lista 🤔 de descuentos míos vigentes que ya no cumplen la regla (sobra, recién llegado, peor caso). Chequear: que la lista salga vacía al terminar cada completa.
- 20/10/2026 · `entrarpromo` salir y el guardián de promos mandan `offer_id` (las SMART/compartidas daban 400 "Offer id is required" y no salían). Y las promos con plata de ML pasan por las mismas tres condiciones (eligió la a). Chequear: que una SMART salga con ✓.

### Etapa 3 · 20/10/2026 · Pedidos → Bs As en dos solapas (v25.13)
Qué: 🏬 De siempre / 📋 Dai Nippon (listas con `bsas`). Dónde: `index.html` (`_bsasVista`, `bsasSetVista`, `_bsasProvs`, `renderPedidos`
rama Bs As, `renderListas` con `_enB`). Chequear: un producto con `listaProv` nunca sale en "De siempre" ni falta en su solapa; sin listas
de Bs As no se dibujan solapas; los ✅ Probados de Nippon muestran sus pedidos de reposición.
v25.14: botón 🏬/📋 en cada pedido de Bs As (`_grupoBsasBtn`, `pedCambiarGrupo`, pone/saca `listaProv`); el ⏸️ sacar por ahora no sale
en la solapa Dai Nippon. Chequear: al tocarlo el pedido cambia de solapa; con varias listas de Bs As pregunta a cuál; no sale en Paraguay.

### Etapa 3 · 20/10/2026 · v25.15 · links de los probados en la tarjeta del pedido de Paraguay
Él, con el Mouse Corsair: *"porque no tiene link"*. Los renglones de reposición (sin `id`) se guardan sin `mlId` ni `link`, así
que la tarjeta decía "sin links guardados". Ahora `_pyLinksProd(prodId)` los saca de la ficha: `pyLink` y la publicación de ML
vinculada (activa primero, sin las ocultas). **Chequear:** que un probado sin `pyLink` cargado igual muestre "ver en ML", y que
los nuevos sigan usando su `mlId`/`link` propio. Era el único lugar que dibuja esos renglones (`_pyItsHTML`).

### Etapa 1 · 20/10/2026 · Premium contra Clásica con la plata neta (regla suya)
Al proponer una gemela con cuotas (Premium) y otra sin cuotas (Clásica), se comparan con la plata neta de ⚖️ (el 3% del facturado
de más que gasta tope de H), no sólo con el %. Vive en `ml-sync/CEREBRO.md` (⚖️). **Chequear:** que ninguna propuesta Premium/Clásica
diga "mismo margen" sin la cuenta neta.

### Etapa 1 · 20/10/2026 · `gemela[:precio mínimo]` (solo lee) · candidatos a una gemela Premium
Él, con el Ferrari Rojo (la Premium vendió 2 en 30 d y las Clásicas 0 en 88): *"armalo ahora"*. Lista las Clásicas activas con stock
en Full, desde $50.000, sin Premium hermana (misma ficha y cuenta), y el precio Premium que deja la misma plata neta (comisión Premium,
cuotas aparte si ML no las mete en la comisión con el peor % medido, IIBB/mono, 3% del facturado de más por tope de H). La publicación
la crea él. **Chequear:** que la neta Premium ≥ neta Clásica, que no proponga arriba de $650.000 y que avise variantes/catálogo.

### Etapa 1 · 20/10/2026 · `gemelacrea:<MLA>=<precio>[:go]` · crear la Premium gemela (eligió la a: primero una)
Él: *"podés hacerlo vos? no hay que crear publicación nueva, hay que crear un método distinto de pago"*. Agrega a la MISMA publicación
(User Product de ML) una condición de venta Premium con cuotas: `POST /user-products/<upid>/items` con precio, `gold_pro`, ARS y
buy_it_now. ML crea un item nuevo (otro MLA) que comparte el stock. Sin `:go` sólo lee y muestra el envío. Con `:go` relee de ML la
nueva y la Clásica, la vincula en `cyc/mllinks` a la misma ficha/color (`gemelaDe`) y le anota la estrategia 💳 `gemela` (tag nuevo,
en `ESTRATEGIAS` del robot y `ESTRATEGIA_UI` de la web). `gemelacrea:ver:<MLA>,…` (solo lee) muestra tipo, upid, family y marcas.
**Medido antes:** la Premium del Ferrari Rojo (`MLA1841629747`) y sus dos Clásicas comparten upid `MLAU3928954599` y las mismas 9 u.,
y ninguna tiene la marca `user_product_listing` → esa marca NO frena (primera versión frenaba por eso). Frenos que quedan: sin upid,
variantes, ya Premium, Premium más barata que la Clásica, techo $650.000, otra Premium del mismo producto.
**Chequear:** que la nueva quede `gold_pro`, al precio pedido, en el mismo upid, con el stock compartido y vinculada a la ficha; y que
sus ventas entren a la ficha (el ciclo la reconoce por `cyc/mllinks`).
**Primer intento:** sin `category_id` ML contestó 500 "internal_error" y no creó nada. Campos obligatorios de la documentación: price,
category_id, currency_id, buying_mode, listing_type_id (+ catalog_listing y catalog_product_id si es de catálogo). Con eso: **VS Coconut
Passion `MLA4103953976` Premium $64.490, comparte las 13 u. con la Clásica `MLA1771197881` ($54.990)**, releída y vinculada (20/10 17:00). Después Animale `MLA4103966984` ($110.990, Clásica `MLA1869295391` $93.990, 8 u.), Azzaro
`MLA4103941572` ($164.990, Clásica `MLA1873659093` $139.990, 2 u.) y Joystick `MLA4103890882` ($214.990, Clásica `MLA3528837742`
$182.990, 2 u.; a la Clásica se le sacó el descuento propio de $173.790). **Ojo:** Animale y Azzaro salieron recién creadas pausadas
`out_of_stock` con 0 u. (Animale con envío drop_off); a los 5 minutos ML les pasó el stock y quedaron activas por Full. O sea: releer
a los ~5 minutos antes de dar por mal una gemela recién creada. v25.22 (web: tag 💳 en `ESTRATEGIA_UI`).
**Él: *"hacé las otras de la lista también"* (20/10 14:15):** `gemela` dio 21 más (desde $50.000, con stock en Full, sin Premium) y se
crearon las 21 en una corrida (21 de 21 con 201). Releer todas juntas con `gemelacrea:ver:gemelas` (cada Premium al lado de su Clásica,
dice cuántas quedaron activas por Full con stock).

### Etapa 5 · 20/10/2026 · v25.16 · techo: una sola cuenta para la raya y `techo95` (eligió la a)
Dos fórmulas para el mismo número: la raya 🔴 de la web (desde el 💰, todos los días "con stock") y `techo95` (desde el precio de
hoy, por tramos). Ahora las dos usan `rayasPrecioLinea` / `_rayas`: sólo días con 3+ u. en Full y con visitas. `techo95` da 🏔️ sólo
si el precio de hoy es el 💰 y hay 🔴 al 95%. La línea avisa "hoy probando" si el precio está arriba del 🔴 con estrategia techo/escasez.
**Chequear:** que las dos copias sigan iguales (si se toca una, la otra) y que un producto con pocos días medibles diga eso y no invente rayas.

### Etapa 5 · 20/10/2026 · v25.18 · línea de tiempo: ganancia por semana
Él: *"que haya otra línea que vea por semana en vez de por día"*. Renglón nuevo "$ ganancia/semana" en las dos líneas de tiempo
(producto y todas juntas): suma de lunes a domingo (`_lineaSemanas`, `_lineaSemSvg`), misma ganancia que la línea por día
(`_ganK` / `vd`). La semana incompleta va punteada y lo dice. **Chequear:** que la suma de las semanas enteras coincida con la
ganancia de Ventas en período Semana.

### Etapa 1 · 20/10/2026 · ↗️/↘️ volviendo de más de 7 días entra en 🔎 SIN AFINAR
`planilla`: un precio con tag desobra/volviendo hace más de 7 días sale en la lista para decidir (buscar techo o motivo).
**Chequear:** que la lista los muestre con su 🏷 y que con una nota de 7 días queden en "ya pensadas".

### Etapa 2 · 20/10/2026 · v25.23 · revisión de la etapa (4 revisores, esfuerzo máximo) · arreglos obvios
Arqueo: `saveSnapshot` guarda `arcaARS = arcaDeudaARS(key)` (hasta el mes que se cierra, como `arcacierres`) y ajusta el total;
el cierre guarda `vsrUSD` y `pvUSD` y `calcArqueo` los usa mirando un mes cerrado; las flechitas de Efectivo/Deudas comparan contra
el cierre con ARCA, Paulvic y vendido sin reporte; Comparar ("Mes actual" y "Por año") con `stockLocal` y esos tres montos;
`loadFinView` con `FIN_CON_SIGNO`; Stock ML por cuenta con `stockoculto` y sin negativos; `of_mia` no revive (`mlconfig/ofiPorUnidades`);
"¿Cierra el mes?" suma todos los meses desde el último cierre si falta uno en el medio; US$ en Arqueo, Comparar, agenda, encabezado
y Capital del Resumen (`deltaBadge` ahora en dólares: todas sus llamadas son del Arqueo/inventario).
Mes/cobro: `retiroDefMes` desde 2026_11 = "cuánto cobrar" del mes anterior × 2 (`_retiroTarjetaDe`, sin recursión) · Resumen fuera
de "Mes" toma los gastos de los meses cuyo primer día con ventas cae en el período (= Métricas) · la tarjeta 💸 avisa gastos sin
cargar (`gastosChecklistMes`, la MISMA que la lista de Gastos) · robot: `retiromes:<AAAA_MM>=<pesos>:go` carga el retiro del mes
(con SOLO_DATOS la carga del 1º no corre) · `cobromes`/`cierrevs`: venta sin costo = $0 de ganancia como la web, tercio redondeado
a $1.000 · resumen mensual de Telegram con la sin costo en el divisor · `cargosmes` frena con la regla de la lista de Gastos ·
`capital` no opina sin dólar y avisa que no es el patrimonio del Arqueo.
**Chequear:** que el cierre de octubre (02/11) guarde 6 meses de ARCA; que "¿Cierra el mes?" sume meses sólo si falta un cierre;
que el retiro supuesto de noviembre = 2 × tercio de octubre; que Resumen y Métricas den la misma ganancia CYC en 30 días.
**v25.24 (mismo día), monedas y costos:** `pyped` guarda proveedor y rubro (ids `pyel`/`pyb`/`py`) y `compray` frena si hay
pedidos de dos proveedores sin decir cuál, o si el ticket no empareja ningún código · el costo de las fichas de un pedido usa el
recargo contra lo pagado (`recargoFichasPedido` robot = `pyRecargoFichas` web) · `leerMonoPct(db)` reemplaza el 2% fijo en ficha,
escmedir, raros, lupa, escasez y techo95 (si no se lee, 2% y lo dice) · `setDevLive` en 10 comandos más · `prepNetoSolo` =
`netoProductoVP` · sin dólar: ni `tcSale`, ni `candidatos`, ni fichas de `listaLlego`.
**Chequear:** que un pedido de Elegancia y uno de Nissei el mismo día queden separados y `compray` pida `|eleg`/`|nissei`.
**v25.26, robot de MP:** `saldoml` guarda `agenda/_corte` y `dispo` corta en ese mismo momento (y lo anota en `_dispTs`) ·
`ancla:<cuenta>=<pesos>@AAAA-MM-DD HH:MM` (hora en que leyó, ≤7 días) y después corre `saldoml:go` + `dispo:go` en la misma corrida ·
token con reintento y motivo (`_mpTokenReintento`) · "Cerrar el mes" avisa si un ancla es más nueva que el corte · probe `sinfecha`
(solo lee, sin montos) mide las ~62 filas por cuenta sin fecha de liberación que `saldoml` suma a "a liquidar".
**Chequear:** que `ancla` termine con ✅ saldoml y ✅ dispo; resultado de `sinfecha` y qué se hace con esas filas.
**`sinfecha` medido el 20/10:** ~62 filas por cuenta, todas SETTLEMENT, una por día hábil, sin ORDER_ID, IS_RELEASED false,
sin unidad ni medio de pago; 0,8% a 1,6% de "a liquidar"; ~51 anteriores al punto de partida. Qué hacer: decisión 8 suya.
**Decisiones mandadas por Telegram (20/10):** 1 deuda ARCA del mes prorrateada · 2 listas en camino o deuda · 3 canceladas en el
ritmo del tope de H · 4 base del recargo de Paraguay · 5 rayas con costo de hoy · 6 costo de recompras de listas · 7 adelanto
fuera del promedio · 8 filas de MP sin fecha.
**Eligió el 20/10 (v25.33 · `cyc-v814`): 1b 2b 3a 4a 5a 6a 7a 8a.** 1b: la deuda de ARCA del mes queda entera desde el día 1
(ya era así, no se tocó). 2b: `listaLlego` pone `pagado:false`; `listaDeudaUSD` (adentro de `pvDeudaUSD`, así el cierre la guarda
en `pvUSD`) cuenta lo llegado sin pagar a `pc`; botón "💵 Ya lo pagué" (`listaPagado`). Los pedidos viejos (sin `pagado`) se dan por
pagados. 3a: `parejoDatos` suma `antesCancel.total` de las canceladas. 4a: `recargoRealPedido` (robot) y `pyRecargoReal` (web) miden
contra `ticket.usdWeb` si hay ticket, si no `usdCrudo`; "en camino" y la caja de gastos usan la misma base (`pyBaseUSD`). 7a:
`paramcompra` promedia con `{sinAdelanto:true}`. 5a: `_rayas` usa `gd[k].ganHoy` (costo full de hoy × u + total × (IIBB de la
cuenta + monotributo vigente)), igual que `rayasPrecioLinea`. 6a: `listaLlego` sube el costo de una ficha existente si la recompra
sale más cara (congela el viejo; nunca baja). 8a: `saldoml` saltea la fila sin `ORDER_ID` y sin fecha de liberación y `dispo` la
suma si es posterior al punto de partida (misma condición en los dos). **Chequear:** que "a liquidar" baje ~1% en la próxima noche
y el disponible no salte; que un pedido de lista llegado aparezca en Deudas hasta tocar "pagado".


- 20/10/2026 · Etapa 7 (diseño) · v25.25: la línea de tiempo (de un producto y de todos) llega hasta abajo de la pantalla
  (`_lineaLlenar`): después de dibujar mide el lugar que queda debajo del encabezado y estira SÓLO los carriles altos
  (`_lineaFac`, entre 1 y 4; remate y caja quedan igual), así las letras del SVG no se deforman. Nunca achica. Al cambiar el
  tamaño de la ventana se vuelve a medir. **Chequear:** que el gráfico termine en el borde de abajo en PC y en el teléfono, y
  que lo de abajo (cambios de precio, colores) aparezca al bajar. Carril nuevo: si es alto (h0 ≥ 30) se estira solo.

- 20/10/2026 · Etapa 5 (datos) · v25.27: **Clásica o Premium y cuántas cuotas en cada venta.** El ciclo guarda en la venta
  `tipoPub` (`listing_type_id` de la orden: gold_special/gold_pro), `cuotas` (`installments` del pago de MP, si no el de la
  orden) y `cuotasSI` (hubo cargo `financing` del vendedor = cuotas sin interés pagadas por nosotros). `orderNet` devuelve
  `cuotas` y `finan`; en carritos sale de `ordPago` (una lectura por orden). Si el pago no se pudo leer se conserva lo
  guardado. Las viejas: `tipoventa[:días][:go]` (ml-sync, patch de esos 3 campos sólo en ventas que existen; sin `:go`
  cuenta Clásica/Premium por cuotas). Web: chip `tipoLabel` en Ventas x Producto (PC y teléfono).
  **Chequear:** que una venta de una gemela Premium diga "Premium · N cuotas s/interés" y que una con `manualTs` no pierda el dato.

- 20/10/2026 · Etapa 3 (mercadería) · v25.29: **número de 4 cifras en cada pedido hecho** (`compraspy`, `pedidospv`,
  `compraslista`). `pedNumerar` (web, después de cargar los datos) numera por fecha los que no tienen `num`, desde 1001, con el
  contador `cyc/mlconfig/pedNumUlt` reservado por transacción; `pedNumTag` lo pinta al lado de la fecha. El número no se toca
  nunca. `pvped` conserva `num` al reescribir el pedido. **Chequear:** que ninguna escritura del robot o de la web reemplace un
  pedido entero sin arrastrar `num` (si pasa, recibe un número nuevo y el viejo queda "perdido").

- 20/10/2026 · Etapa 3 (mercadería): **`compray … |det=` arregla el pedido cuando Nissei no tenía algo y se agregó otra cosa.**
  `det=<cód>*<u>*<precio>[*<nombre>]`: el 4º campo es el nombre del ticket para lo agregado que no estaba en el panel (queda
  `agregado:true` y "Llegó" crea la ficha con ese nombre). Lo que estaba en el pedido y no figura en el ticket sale del pedido y su
  candidato vuelve a la lista (`pedidoEn` en null); lo agregado que coincide con un candidato queda viajando. El log lo dice
  (✂️ no vinieron · ➕ agregados). **Chequear:** que un candidato que no vino vuelva a "Para probar" y no quede "viajando".

- 20/10/2026 · Etapa 5 (datos y cerebro) · v25.30: **💰 piso provisorio desde la primera venta** en la línea de tiempo de cada
  producto (`_rayas`, index.html). Sin 5 días medibles (3+ u. en Full y con visitas) se toma el precio que más plata por día dejó
  entre los días con stock que vendieron (`aprox:true`, raya punteada "provisorio"); con 5+ días medibles, como antes. Los de
  sobra/liquidando también muestran el piso (sin techo). El 🔴 techo y `techo95` del robot no cambian. **Chequear:** que el
  provisorio no se use para marcar 🏔️ ni para decidir un precio sin mirarlo.

- 20/10/2026 · Etapa 7 (diseño) · v25.35: **las ventas vivas estaban apagadas desde la v24.86 (19/10).** `vivaEnvolver` buscaba
  `class="ingreso-item vp-pc" style="` pegados, y la v24.86 metió `onclick`/`title` en el medio: no encontraba la tarjeta y
  devolvía la venta sin efecto, sin avisar. Ahora busca el `style="` dentro de la misma etiqueta. **Chequear:** al tocar el
  markup de una tarjeta de Ventas, que siga apareciendo el color/efecto (prueba: una venta de 25%+ tiene que verse con tinte).

- 20/10/2026 · Etapa 7 (diseño) · v25.36: en la línea de tiempo de un producto el **costo** salió del carril del precio y va en el
  del **% de ganancia** (escala propia `cMin/cMax`, etiqueta "costo $X" abajo a la izquierda, globito del costo en ese carril).
  El precio ya no mete el costo en su escala (`_pcv` sin `cvs`). **Chequear:** que el carril del % aparezca aunque no haya %
  (sólo costo) y que las rayas de piso/techo sigan en el del precio.

- 20/10/2026 · Etapa 5 (datos) · v25.37: **Métricas → de dónde viene la mercadería, con 📋 Listas y por score.** `metGrupoDeProd`
  manda lo de `listaProv` a 'lista' (antes contaba en Bs As, como en Pedidos ya no). El botón 📋 Listas muestra cada proveedor
  de lista con ventas en el período (`provs` de `metPorOrigen`); los que no vendieron no salen. Todo se ordena por
  `metScoreDe`: el score del ranking de Ventas (gan²/costo por producto) PROMEDIADO por producto vendido, con la escala
  `scoreColor/scoreLabel` llevada a 30 días. **Chequear:** que la suma de los grupos siga cerrando contra los KPIs de arriba.

- 20/10/2026 · v25.38: `metScoreDe` promedia por COLOR/AROMA (`vars`, ficha + variante de la venta), no por ficha: el Paulvic (una ficha, ~70 aromas) salía como un solo producto gigante. Y las cajas de la vista de un origen no se pisan (min 140px, sin cortar).

- 20/10/2026 · Etapa 7 (diseño) · v25.39: botón **📋 ficha** en el detalle de cada venta (Ventas x Producto), al lado de 📈 línea: `fichaAbrir(<MLA de la venta>)`, uno por publicación del carrito. **Chequear:** que una venta sin MLA no muestre el botón.

- **20/10/2026 · v25.50 · la línea de tiempo no abría en la PC.** `_lineaAplicarGiro` (v25.44), sin giro, ponía `inset:'0'` y después `top/left/right/bottom:''`, que BORRAN el inset: la ventana fija quedaba en su lugar natural, al final de la página (medido: 3.008 px abajo). Ahora se limpian primero y el `inset` va último. Qué chequear: abrir la línea en la PC y en el teléfono acostado; un estilo que se arma con `Object.assign` no puede poner un atajo (`inset`) y después sus partes.

- **20/10/2026 · Etapa 5 (datos) · EL WIDGET DEL IPHONE: "VENTAS DE HOY" EN LA PANTALLA DE INICIO (pedido suyo).** El ciclo deja en `mlapi/widget/hoy` (fuera de `cyc/`) el resumen de la tarjeta de Inicio: facturado, ventas (compras enteras), unidades, ganancia, % (envío de Full en el divisor), puntaje del día (`_puntajeDia`), color (`VIVA_DIA_NIV`) y la ganancia acumulada cada 15 min de hoy y del promedio de los últimos 5 mismos días (`_homeCurvaHTML`). Sale de `escribirWidgetHoy` (sync.mjs, con `armarCostoWeb`), lee sólo 6 días de `cyc/ventaprod` y escribe sólo si cambiaron las ventas de hoy, cambió el día o pasaron 20 min. Probe `widgethoy[:go]`. El widget es `ml-sync/widget/cyc-hoy.js` para la app Scriptable (chico, mediano y grande; pide mail y contraseña una vez y guarda sólo la llave de sesión en el llavero). **Chequear:** los números del probe coinciden con la tarjeta de Inicio a la misma hora · si se toca la tarjeta (puntaje, color, curva, cuenta del costo), se toca `escribirWidgetHoy` · el widget no imprime ni guarda datos de compradores.
- **20/10/2026 · Etapa 5 (datos) · EL WIDGET TAMBIÉN EN LA PANTALLA BLOQUEADA (pedido suyo: "quiero que esté en los dos (…) en la pantalla bloqueada hacerlo mejor").** `ml-sync/widget/cyc-hoy.js` reconoce los tamaños de la bloqueada (`accessory*`, función `bloqueada`): rectangular = facturado grande + ventas, ganancia con %, y puntaje con cómo va contra el día igual · redondo = el puntaje con su anillo (`anillo`) · de una línea = facturado, ganancia y puntaje. Sin colores (el iPhone la pinta en un solo tono). Dato de más de 1 h = ⚠️. Chequear: los números son los mismos que el grande · sin sesión dice "abrí Scriptable".
- **21/10/2026 · Etapa 5 (datos/cerebro) · EL CEREBRO REHECHO (él: "fijate si es necesario rehacer el cerebro (…) hay reglas viejas, que se pisan. manejalo").** `ml-sync/CEREBRO.md` pasó de 917 a 329 líneas: ~190 reglas, cada una una vez y en su versión más nueva, sin anexo. Se resolvieron 24 choques (base eliminada, 100 ventas → 2+ vendedores, recargo medido, retiro = cobromes, lanzamiento 20/10 sobre "precio final", sobra = Full al ritmo con stock, Bs As 1b, tachado 3b cancelado…) y quedan 4 para él en la sección 0b con su regla provisoria. Cada regla marcada 🔒 (freno en el código) o 🧠 (pensar). El viejo quedó en `notas/cerebro_viejo_20261021.md` (no se usa). **Chequear:** una regla nueva REEMPLAZA a la de su tema (no se agrega abajo); toda regla "nunca/sólo si" medible tiene su 🔒 en el código; la 0b se vacía cuando él contesta.
- **21/10/2026 · Etapa 1 · LAS REGLAS DURAS DE LAS BAJAS, EN EL CÓDIGO (él: "a, dale" a pasar a freno toda regla medible, después del Cuba Platinum y del Adaptador 8 en 1).** `frenosBajas` (sync.mjs), usada por `decido` y por `entrarpromo`: F1 lo nuevo sin 🏔️ (claves de color con mayúscula y minúscula) · F2 escalera: ≤15% por escalón (25% en escasez) · F3 un escalón por 48 h (12 h en escasez) · F4 una suba (de 5% o más) de menos de 30 d no se deshace sin 95% (Poisson sobre la plata por día) o visitas a la mitad · F5 no abajo del 💰 piso (`rayasPrecioLinea`) salvo sobra/sinrepo/liquidando/remate, sugiere el redondeo para arriba · F6 🤔 descuento fuera de una escalera (techo, escasez, lanzamiento, sinrepo, fecha) pide 90+ d de stock al ritmo con stock y 30+ d desde la última entrada. Banderas `!sintecho` `!golpe` `!sincerteza` `!bajopiso` `!nosobra` valen sólo con "EXCEPCIÓN" en el motivo. Sin poder leer los datos, no baja. `#techook` a mano rechazado en `decido`, `entrarpromo` y `tag:` (sólo `techo95`). `entrarpromo` mide el 25% en el peor caso (antes con el normal). `bajasnuevas` busca el color con sus mayúsculas. Probado con la función real y 13 casos (los del Adaptador y el Cuba frenan; 19.990→18.290 y un descuento con 300 u. pasan). **Chequear:** toda regla nueva que diga "nunca/sólo si" sobre una baja va acá; una baja frenada dice la regla y la excepción.
- **21/10/2026 · Etapa 5 (vieja 8) · v25.55 · la raya 🚧 del techo dice si es segura (él con el Adaptador 8 en 1: "¿ese techo está bien puesto? ¿con info segura?").** La raya de `cyc/techofreno` ("a $X ya no vende") la anoto yo al volver una prueba y salía siempre en rojo como definitiva. El Adaptador estuvo 1-2 días a $27.990 y vendió 0 de ~2,7 esperadas: no es seguro. Ahora `_segTecho` (index.html, la misma cuenta Poisson del 🔴 contra el 💰) la pinta roja "· N% seguro" sólo con 95%+; si no, naranja punteada "no vendió · sin certeza (N d)". **Chequear:** una prueba de 1-3 días sin ventas sale naranja; el 🔴 de `_rayas` y esta raya usan la misma cuenta.
- **20/10/2026 · v25.53 · "martess".** El plural de lunes a viernes no lleva otra s: `_diaPl` en `_homeCurvaHTML` (web), `pl` en el widget y el log de `widgethoy`. Chequear: un martes dice "los últimos 5 martes" y un sábado "sábados".
- **20/10/2026 · Etapa 1 · una nota no tapa un descuento sobre algo recién llegado (Cuba Prestige Platinum).** El 18/10 lo metí en una promo de ML a $47.490 "para ver si sale" sin techo medido; el 20/10 la nota del ayudante ("nada que hacer") lo escondió en la lista 🤔 como "pensado". Ahora en `planilla` (🤔 MIS DESCUENTOS QUE YA NO TIENEN SENTIDO) lo recién llegado sale siempre aunque tenga nota: lo nuevo baja sólo con `techo95` al 95% (decisión 3a). Se sacó de la promo y volvió a $50.000 (🆕 lanzamiento). **Chequear:** la lista 🤔 no esconde ningún recién llegado; ningún lanzamiento en promo sin 🏔️ de `techo95`.
- **20/10/2026 · Etapa 1 · `decido` no baja lo nuevo sin techo (Cuba Platinum, la segunda mitad).** La vuelta de las 10:27 sacó el Cuba de la promo de ML (bien, regla 2.1a) pero bajó el precio de lista de $50.000 a $47.490 "para seguir ganando la caja", sin techo. Ahora `decido`, antes de aplicar, convierte en "no se toca" toda baja de algo recién llegado (menos de 30 d en Full con fecha real, `cyc/stockhist`) o en 🆕 lanzamiento si no hay 🏔️ `techook` en `cyc/estrategia` después de la llegada. `!sintecho` la deja pasar a propósito (con el porqué en el motivo). Sin poder leer stockhist/estrategia, no baja. **Chequear:** una baja de un lanzamiento sin 🏔️ sale como "✗ no se toca: es nuevo…"; con 🏔️ de `techo95` sí baja.
- **20/10/2026 · Etapa 1 · probe `bajasnuevas[:días]` (solo lee):** mis bajas (`cyc/claudecambios`) de lo recién llegado o en lanzamiento sin 🏔️ antes de la baja. Para encontrar las que se hicieron antes del freno de `decido`. **Chequear:** misma regla que el freno (30 d con fecha real, `techook` posterior a la llegada).
  Nuevo = primera tanda en Full (sin `cero` ni `desdePrev` en `cyc/stockhist`) o 🆕 lanzamiento: una reposición después de agotarse no es un lanzamiento y baja normal (escalera). Y la publicación tiene que ser nueva (`altaTs` de menos de 60 días): una publicación vieja que se repuso no es lanzamiento.


### 22/10/2026 · 🟧🟦 Premium y envío gratis en las barras de ventas (v26.10, etapa 7)
- Él: *"en las barras de ventas no aparecen las premium ni envío gratis"*. Premium en naranja ya existía pero HOY no se separaba (el día
  de hoy lo arma otro bloque y se salteaba); envío gratis no existía. Ahora `uP` (Premium: `tipoPub` gold_pro o gemela Premium) y `uG`
  (gemela con `gemelaTipo:'envio'`, celeste #38bdf8, el color del chip de la venta) en todos los días, hoy incluido; tarjeta Vendió y leyenda.
- **Chequear:** que las cuatro partes (Clásica, envío, Premium, remate) sumen la barra entera.

### 22/10/2026 · 💳📦 Filtro de ventas por Premium o envío gratis (v26.09, etapa 7)
- Ventas → ⚙️ Filtros, al lado de las cuentas: `vpFilterVia` ('premium' = `tipoPub` gold_pro · 'envio' = `mllinks.gemelaTipo==='envio'`,
  la misma regla del chip "📦 envío gratis" de cada venta). El botón dice cuántas hay con la búsqueda y la cuenta de ahora.
- **Chequear:** que "Limpiar filtros" y el aviso de venta lo saquen (`vpLimpiarFiltros`), y que una venta Premium vieja sin `tipoPub`
  no cuente (no se sabe: se ve con `tipoventa`).

### 22/10/2026 · 📈 La línea de tiempo reordenada (v26.08, etapa 7, eligió 1a 2a 3a con la Codera: "cuesta entender")
- **Qué:** arriba un cartel de una frase (escasez · cubierto · sin reposición · agotado) y 4 tarjetas (`_lnCard`); el renglón largo
  quedó chico con el historial. Cada franja deja `LN_TG` arriba para su título, sus colores y el número de hoy (`lnHdrHTML`); el precio
  va primero. Las notas que se pisaban adentro del gráfico (techo, sobra, bajando, prueba, "rayas de MLA…", costo, reloj de 4 meses)
  pasaron al título de su franja (`_prNotas`, `_prRayasDe`, `_pctCosto`, `_stReloj`). La de Todos también (tarjetas + títulos; ahí el
  orden queda con ventas primero: el índice de precio no se decide).
- **Chequear:** a 390 px el título de cada franja no se corta (la leyenda sí, con …) · ningún texto del gráfico pisa el título · el
  cartel dice lo mismo que el renglón de stock (`escasezDe`) · al agregar una franja nueva, ponerle su `lnHdrHTML`.
- **Emojis nuevos que Windows no dibuja** (él vio un cuadradito en "Bueno"): 🩵 (Unicode 15) → 💠, 🪪 (14) → 📇, 🫨 (15) → 📳. **Regla: no usar
  emojis de Unicode 14 o más nuevos** (🩵 🩷 🫨 🪪 🫧…); 🪜 y 🪄 son de Unicode 13: si él ve cuadraditos ahí, cambiarlos también.

## 8 · REGLAS DEL CEREBRO (cada 7 días, nació el 21/10/2026)
Lo que mira, siempre con `ml-sync/CEREBRO.md` entero, `notas/correcciones.md`, `notas/preguntas.md` y `frenosBajas` (sync.mjs):
- **Contradicciones y repetidos:** dos reglas sobre el mismo tema → queda la más nueva (la vieja se borra, no se tacha); una regla
  que no está en la tabla de QUIÉN MANDA y choca con otra → fila nueva en la sección 0 o al `pregunto:`.
- **Decisiones suyas que no llegaron:** lo que eligió en el chat o en `REV_PENDIENTE` de la semana tiene que estar en su sección del
  CEREBRO; la 0b tiene que quedar vacía (o con provisorias de esta semana).
- **🔒 contra el código:** cada regla marcada 🔒 tiene que tener su freno (F1-F6 de `frenosBajas`, `decido`, `entrarpromo`, las
  listas de `planilla`/`escasez`) y una prueba con la función real; lo 🧠 que se pueda medir con un dato se propone pasar a 🔒.
- **Correcciones de la semana:** cada renglón de `correcciones.md` de los últimos 7 días → regla nueva (en su sección, reemplazando
  la vieja de su tema) o pregunta general en `preguntas.md`. Contar cuántas fueron (la meta: 1-2 por semana).
- **Que se use:** mirar 3-5 notas del 🧠 de la semana y si citan la regla vigente o una vieja.
- Lo obvio se arregla (texto o freno, probado, en las dos ramas); lo que es decisión suya va TODO JUNTO a `notas/para_mati.md`.
- **21/10/2026 · lo que dejó la primera:** sus 4 decisiones aplicadas — 1a bajar sin que sobre = descuento con tachado (CEREBRO §11)
  · 2b F4 espera la certeza 15 días (`F4_ESPERA_DIAS`) y después no deja bajar si la suba deja igual o más plata por día (hasta 60 d)
  · 3a visitas a la mitad → un escalón, no volver directo · 4a `candMaxU` barato 3 / caro 1 / resto 2 sin vendidas (v25.56).
  Chequear: que un `decido` que baja una suba de 16-60 días que deja más plata frene con "deja igual o más plata por día".


**v25.63 (21/10/2026) · etapa 7 (diseño) · el % de diferencia en los globitos de Métricas.** Pedido suyo: *"en todas muestre el % de
diferencia entre ambas. en todos lados. no importa si es negativa o positiva"*. `_metTipDifs` (index.html) arma, en el globito del
gráfico de pesos y del de %, la diferencia del período actual (o de la proyección en los días futuros) contra el anterior y contra el
año pasado: % con signo en pesos, puntos en el gráfico de %, "sin %" contra un $0. Sólo en la vista general (en "por cuenta" y con
varias métricas no hay contra qué). Qué chequear: que el número del globito coincida con (actual − anterior) ÷ |anterior|.

**v25.64 (21/10/2026) · etapa 7 (diseño) · Listas con lo básico arriba y el resto en "detalle".** Pedido suyo: *"dejar lo basico en
el producto. el resto va a detalle al clickear desplegable. como estan las ventas x productos"*. El renglón de 🆕 Nuevos de Listas (y
el del buscador de todas las listas) muestra nombre, foto, te sale, precio en ML, el % y pedir; código, recargo, lista −dto, vendedores,
vendidas, mismo producto, título del catálogo, links, reparo y sacar van en `<details>`. Si hay 1 solo vendedor, otro producto o un
reparo, arriba dice "⚠️ mirar el detalle". Qué chequear: que ningún aviso que decide quede sólo escondido.

**v25.65 (21/10/2026) · etapa 7 (diseño) · Listas → Nuevos en carpetas.** Pedido suyo: *"esto poner desplegable. y agregar carpetas
los que tienen catalogo y los que no. y despues dividirlos como vos sabes"*. El resumen de arriba es un `<details>` (cerrado: productos,
dan, por confirmar, sin evaluar). Lo que no está en ✅ Dan va a 📗 Con catálogo en ML (🔎 por confirmar abierto primero · 🟠 casi 15-24%
· 📷 sin foto · 👤 1 vendedor · ⏳ costo nuevo · 🔴 <15% · ⛔ <0% · 👻 nadie lo vende · ✗ otro producto), 📕 Sin catálogo exacto, ⏳ Sin
medir y 🚫 Afuera por regla (`_cg` en `renderListas`). Qué chequear: que la suma de las carpetas dé lo que no da, sin repetir ni perder.

**v25.66 (21/10/2026) · etapa 3 (mercadería) · las 100 ventas vuelven, al final.** Él: *"para estar seguros de la compra quiero agregar
también el filtro de las 100 ventas. pero que se haga al final"* y *"las que no tienen info que no queden afuera, que queden afuera sólo
cuando se carguen las ventas"*. `CAND_MIN_VENTAS`=100 (index.html y sync.mjs). Paraguay: `candPuedePedir` y el comando `pedir` frenan si
`candVentasDe` < 100; sin dato no frena; carpeta "🛒 vendieron menos de 100". Listas: `_listaDa`/`cuentaLista` piden no tener `vend` < 100;
carpeta en 📗 con catálogo. Comando nuevo `faltaventas` (solo lee): lo que pasó todo y no tiene vendidas, para el chat de compras.
`candprecio:<cód>=/<vendidas>` carga sólo las vendidas. Qué chequear: que un candidato sin vendidas siga apareciendo para pedir.

**21/10/2026 · etapa 1 (precios) y 8 (reglas del cerebro) · techo con salto grande, bajada con descuento.** Él: *"cuando buscan techo
siempre dar un salto grande nunca ir subiendo de a poco. despues cuando se encuentre el techo ahi si bajar de a poco con descuentos"*.
En `decido` (sync.mjs, después de `frenosBajas`): 🔒 suba #techo < +30% se frena (salvo $32.900-32.999 por la barrera, ≥$640.000 o
`!chico` + EXCEPCIÓN) · 🔒 baja #bajando de una publicación con `cyc/techofreno` o con tag techo/techook en su historia se frena si baja
la lista: va con `entrarpromo …@PRICE_DISCOUNT#bajando` (salvo `!lista` + EXCEPCIÓN). CEREBRO.md sección 6. Qué chequear: que la
escalera post-techo salga como descuento y que el descuento siguiente reemplace al anterior.

**v25.68 (21/10/2026) · etapa 3 · Listas → Nuevos sin lo que ya viaja.** Él: *"lo que esta viajando o ya tenemos stock que salgan de
ahi"*. `renderListas`: `nuevos` excluye lo de `_listaViajando(k)` (pedido en camino sin llegar); va a la carpeta "🚚 Ya están viajando
en un pedido". Lo que ya es ficha ya no estaba. El resumen lo cuenta junto con "ya los vendés". Qué chequear: que al marcar "Llegó" el
producto pase a ✅ Probados y no vuelva a Nuevos.

**v25.69 (21/10/2026) · etapa 7 (diseño) · Dai Nippon más simple y tarjetas de Listas que se abren enteras.** Pedidos suyos: sacar el
buscador y el botón "Proveedor: Dai Nippon" (en Bs As con una sola lista) · al abrir Dai Nippon siempre ✅ Probados (`_nipAbierto`,
se resetea en `goPage('pedidos')` y al salir de la solapa) · la tarjeta entera abre el detalle (`<details class="lst-card">` con el
summary = la tarjeta; la casilla de pedir y la foto no la abren) · sin el código a la vista (queda en "verlo en la lista") · ⚠️ sólo con
duda de verdad: `_listaNoEsVale` o, sin el ✓ del chat, 1 solo vendedor o un reparo de nombre. Qué chequear: que en el teléfono la
casilla de pedir se pueda tocar sin que se abra/cierre la tarjeta.

**v25.70 (21/10/2026) · etapa 7 · Listas → Nuevos: arriba sólo los que dan, todo lo demás en "📂 Toda la lista".** Él: *"en nippon saca
eso o metelo en el detalle"* (el aviso de vendidas sin mirar: en Bs As ya no sale arriba, va en el detalle de cada producto que da) y
*"unifica toda la info de los productos vistos y los que no etc. todos abajo. junto con catálogo y sin catálogo"*. El resumen (vuelta,
evaluados, sin evaluar, afuera) y las carpetas (con/sin catálogo, sin medir, regla, viajando, no está en su web, sacados) van adentro de
un solo `<details>` cerrado debajo de ✅ Dan. Qué chequear: que las etiquetas se cierren bien (prueba con datos de ejemplo: 9/9 details).

**v25.71 (21/10/2026) · etapa 7 · Dai Nippon sin títulos.** Él: *"todo eso sacalos"*: en Bs As (`_enB`) no salen el título "📋 Listas que
compra Tito en Bs As", la línea "N productos de Dai Nippon · N con pedido…" de ✅ Probados ni el título verde "✅ Dan 25% o más…" de Nuevos.
En 📋 Listas (Paraguay/otros) siguen igual.

**v25.72 (21/10/2026) · etapa 7 · la Papelera de Pedidos pasó a Ajustes.** Pedido suyo: *"ponelo en ajustes"*. Sin la solapa en Pedidos;
tarjeta `#aj-papelera` en Ajustes (antes de Últimos cambios) con la búsqueda, lo que se puede devolver, lo vencido y "no traer más".
`renderPapelera()` (sale del bloque de `renderPedidos`) se dibuja al abrir la tarjeta y cuando Pedidos se redibuja con ella abierta.
Qué chequear: que "↩︎ Devolver" y "Volver a traer" funcionen desde Ajustes.

**v25.73 (21/10/2026) · etapa 1 (precios) y 5 (datos) · el 💰 piso sólo con un precio que vendió.** Él con el Aer Jasmín (MLA3429019146):
*"dice que el piso donde mejor vende es donde esta el techo y se bajo. hay dos errores en uno"*. `rayasPrecioLinea` (sync.mjs) y `_rayas`
(index.html) tomaban como 💰 "más plata" el mejor de los precios con 5+ días medibles aunque no hubiera vendido nada: $19.490 (5 días, 0
ventas, −$63/día) era el único con 5 días y ganaba por descarte → la línea decía "bajando desde $19.490 · no baja de $19.490" con el precio
en $18.190, y el freno F5 habría frenado volver a su precio real. Ahora `med` pide `u > 0`; sin eso queda el piso provisorio de lo que
vendió. Qué chequear: que ningún 💰 tenga 0 vendidas.

**21/10/2026 · etapa 8 (reglas del cerebro) · cada venta deja su producto con estrategia.** Él: *"quiero que siempre se mire con
detenimiento venta x venta, así todos los productos quedan con estrategias siempre y con estrategias bien pensadas"*. `ventasraras` termina
con "🧭 ESTRATEGIA DE LO QUE VENDIÓ": cada publicación vendida en la ventana con su estrategia (`cyc/estrategia`) y si tiene techo probado
(`cyc/techofreno`); ⚠️ las que no tienen una con techo. CEREBRO.md sección 1 paso 5. Qué chequear: que la lista ⚠️ quede vacía en cada
vuelta y que lo que no vende siga barrido por la completa.

**21/10/2026 · etapa 8 · todas las vueltas pesadas, ventas al máximo.** Él: *"necesito análisis máximo en las ventas"* y *"todas las
revisiones son pesadas con esfuerzo más alto, se quita eso de gasta poco"*. Arriba de todo en CEREBRO.md (manda sobre el prompt de la
tarea de cada 2 h, que todavía dice "liviana": la tarea sólo se puede editar desde su conversación). La completa de las 08:52 sigue
(pedidos, cajas, lo que no vende). Qué chequear: que cada vuelta corta abra la ficha de cada publicación que vendió y deje la 🧭 sin ⚠️.

**21/10/2026 · etapa 8 · cada venta se analiza UNA sola vez.** Él: *"no quiero que una venta se evalúe dos veces. para no gastar tokens
de más. que cada venta tenga un análisis profundo con esfuerzo máximo y listo"*. `ventasraras:nuevas` trae sólo las ventas posteriores a
`mlapi/ventasvistas/hasta` (sin marca: últimas 24 h) e imprime 📌 con el `ventasvistas:<ts>;go` para anotar al terminar la vuelta;
`ventasvistas` nunca retrocede y corre también por ml-consulta. `ventasraras:<horas>` sigue para mirar a mano. Qué chequear: que cada
vuelta use `:nuevas` y anote al final; que una vuelta cortada no deje ventas sin ver (la marca sólo avanza al terminar).
**Arreglo 21/10:** sin ventas raras el comando salía antes (`return`) y no imprimía el 📌 ni la 🧭 de lo vendido: la vuelta no
sabía desde cuándo anotar. Ahora sigue de largo. Qué chequear: que con "Ninguna venta rara" igual salgan el 📌 y la 🧭.

**21/10/2026 · etapa 8 · el esfuerzo va escrito en el ayudante, no se hereda de la sesión.** Él: *"no quiero que dependan de la config
de esfuerzo que tengo yo"*. Las ventas las piensa SIEMPRE un ayudante con `effort:"max"` escrito en la llamada (aunque sea una sola
venta; antes sólo con más de ~5 publicaciones y si no las pensaba la sesión con su nivel); los raros (🧭/🔀/💭) siempre un ayudante
`effort:"high"`. Vive en `ml-sync/CEREBRO.md` (bloque 🔬, paso 4 y §2). **Qué chequear:** en cada vuelta, que el log tenga la llamada
al ayudante con `effort` y que `ventasvistas` diga `esf=max`.

**21/10/2026 · etapa 7 (diseño) · 🎉 primera venta dice días con stock (v25.91).** Él: *"no quiero que diga hace cuánto está publicada,
sino cuántos días llevó de stock hasta la primera venta"*. `_vhDiasStock` (index.html) usa `cyc/stockhist` del color o del producto en esa
cuenta (`desde`/`desdePrev` anterior a la venta). Sin fecha vista entrar dice "o más"; sin dato, nada. **Qué chequear:** si el producto se
repuso después de la venta, `desdePrev` ya se borró y el cartel queda sin días (no inventa).

**21/10/2026 · etapa 1 · ventas Premium en naranja y toda publicación con su Premium (v25.92).** Él: *"las que se vendan como clásicas
sigan en verde y las premium en naranja"* y *"quiero que todas las publicaciones tengan clásica y premium"*. (1) Línea de tiempo de cada
producto: barra verde = Clásica, naranja = Premium (`tipoPub` de cada venta, `uP`), amarillo = remate; el encabezado dice cuántas en
Premium. (2) `gemela:todas` (sync.mjs): sin mínimo de precio, activas o pausadas, sólo con stock en Full (corrección suya: "no mirar todas las demás"); la completa crea cada una con `gemelacrea`
(CEREBRO §completa 6b). **Qué chequear:** ventas viejas sin `tipoPub` cuentan como Clásica; que `gemela:todas` quede vacía cada noche.

**21/10/2026 · etapa 3 · lo que no va a Full sale de las listas (v25.93).** Él: *"estaba viendo la lista de nippon y hay desodorantes.
no sé si cuentan como inflamable (…) todos esos productos que no se pueden enviar sacarlos del pedido"*. `listanofull:<prov|todas>[;go]`
(sync.mjs) marca `noFull` (el motivo) por nombre: aerosoles, gas, alcohol, acetona/quitaesmalte, laca, espuma de afeitar, insecticidas;
perfumes y body splash no (van a Full desde siempre). `noFull` cuenta igual que `noWeb` en la web y el robot (no da, no se pide) y se saca
del pedido del momento. **Qué chequear:** falsos positivos por nombre (mirar la prueba antes del `;go`); lo que ML acepte de verdad lo dice
Planificación de envíos.

**21/10/2026 · etapa 3 · listas sin foto: confirmar sólo lo exacto.** Él mostró el Lux (1 jabón orquídea contra pack 3x jazmín) y la Dove
máscara Nutrición contra la Factor 80+. Las listas (Dai Nippon y demás) no traen foto ni código de barras: `ok` sólo con marca, línea,
variante, tamaño y cantidad iguales; si ML agrega algo, `no` (CEREBRO paso 8). `listarevisar:confirmados` (sync.mjs) relista los ya
confirmados: revisados 113 el 21/10, 34 estaban mal. **Qué chequear:** que ningún `ok` nuevo tenga palabras de línea o pack de más en ML.

**21/10/2026 · etapa 7 · vendidas al final del nombre en las listas (v25.95).** Él: *"en nippon agregar las ventas al final del nombre
(…) que se indique que no están cargadas"*. `_listaVendHTML(e)` (index.html) en Nuevos y en 🛒 Para comprar en el local: `e.vend` (lo carga
el chat local con `listadato:<prov>;<cód>=<vendidas>`) o "ventas sin cargar". **Qué chequear:** que el número sea de la publicación más
barata del catálogo medido, no del producto equivocado.

**21/10/2026 · etapa 7 · Nissei: sin "no da en el local", "no se puede ML" y abre en Todo · ML (v25.96).** Él lo pidió con el Zimaya Tiramisú.
`perfNoLocalBtn` ya no dibuja nada (lo marcado `noLocal` sigue); el botón de `candNoML` dice "🛒✕ no se puede ML" y con el filtro ML (el
de arranque) lo marcado no aparece. `_pyRubro='todos'` y `_candFiltro='ml'` al abrir, sin localStorage. **Qué chequear:** que con el filtro
ML no se vea ningún `noML`.

**22/10/2026 · etapa 7 · el año en meses (v25.97).** Él: *"quiero que el año sea como el mes. En vez de los días, que el año tenga los
meses con los análisis y colores"*. `_homeAnioHTML`/`_anioMeses` (index.html): 12 cuadritos del color de la ganancia promedio por día
(niveles de `VIVA_DIA_NIV`), total abajo, 🏆 mejor mes y 🔥 racha de meses con promedio ≥ `PUNT_DIA_7`; tocar abre la tarjeta en ese mes
(`homeCalMes`). **Qué chequear:** que el promedio del mes en curso use sólo los días ya pasados.

**22/10/2026 · etapa 7 · la tarjeta viva termina en los números (v26.00).** Él marcó con una raya roja: *"que las ventas viva sea hasta
la línea roja, así lo de abajo se nota más"*. `renderHomeHoy` arma dos tarjetas: la viva (`.vw`/`.viva`, título, facturado, ganancia,
puntaje) y abajo una común (escalera, curva, calendario de mes/año, cuentas, cuánto cobrar). **Qué chequear:** que los efectos
(`_homeHoyEfectos`, deslizar) sigan andando y que en claro la de abajo se lea.

**22/10/2026 · etapa 3 · lo que está en la oficina o viajando a Full cubre lo decidido (v26.03).** Él con el Mercedes Club Black (1 u. en
la oficina, el pedido decía comprar 1): *"si está en el envío hay que sacarlo, siempre que llegue a lo que me pedís vos"*. En `syncPedidosAuto`,
con decisión mía en `u` (sin colores): si oficina + `transitoTotal` ≥ lo decidido → 0, el 🧠 lo dice y se saca de `cyc/py_armado` (una vez).
`decide_pedidos.py` también tiene que restar la oficina. **Qué chequear:** productos con colores no entran (falta hacerlo color por color).
**Y en Inicio (Mes y Año):** renglón `hcal-tot` con la ganancia total y el promedio por día arriba del calendario.

### 📦 Cartel "envío gratis" en Ventas (22/10/2026, v26.04)
Pedido suyo: la venta que salió por una gemela Clásica con envío gratis (`cyc/mllinks/<MLA>.gemelaTipo==='envio'`) lleva el
cartel celeste "📦 envío gratis" al lado del de Premium (`tipoLabel` en Ventas x Producto). Qué chequear: que no salga en ventas
de la Clásica original ni de las Premium.
- 22/10/2026: la completa de los domingos mide las gemelas (Premium y envío gratis) y propone sacar las que no sirven (CEREBRO.md paso 9 de la completa).
- 22/10/2026: CEREBRO, choque nuevo resuelto: escasez + stock que paga almacenamiento (caso F9).
- 22/10/2026 (v26.05): Inicio · calendario de mes y año con ventas brutas (blanco) y ganancia (verde) arriba, y números completos sin "k" (`_kTxt`, `_hcalTotHTML`).
- 22/10/2026: probe `mezcla[:días]` (solo lee): ventas por tramo de % de ganancia, qué se iría con cada vara y Paulvic aroma por aroma.
- 22/10/2026: `faltaventas:todas` (solo lee): todos los productos de las listas con catálogo de ML y sin vendidas, para que el chat local las cargue con `listadato`.

### 📚 CLAUDE.md achicado y VENTAS.md (22/10/2026, pedido suyo: "la b")
CLAUDE.md pasó de 794 KB a ~50 KB: sólo lo vigente, una vez cada regla. La historia completa (texto textual hasta el 22/10) quedó en
`ml-sync/HISTORIA.md`, que no se carga sola (grep cuando haga falta). `ml-sync/VENTAS.md` (~31 KB) es el documento único para juzgar
ventas: lo leen el ayudante de las vueltas y el de la completa (con la ficha), no el CLAUDE.md entero. Las dos tareas programadas ya
lo dicen. Qué chequear: que una regla nueva vaya a CLAUDE.md (corta), CEREBRO.md y, si toca ventas, VENTAS.md; que nada vigente quede
sólo en HISTORIA.md; que CLAUDE.md no vuelva a crecer con historia (la historia va a REVISION.md o HISTORIA.md).
- 22/10/2026: VENTAS.md al día con 🔐 (`!sinlinea` `!sincerteza` `!sintecho` `!bajocero` `#remate` son suyas), F9 y el detector `errores`; cada error de una venta se anota en su sección 7. Qué chequear: que VENTAS.md no contradiga CEREBRO §0c.
- 22/10/2026: `planilla` 🛡️: las gemelas (Premium y envío gratis, `gemelaDe`) salen como excepción "la alinea el robot a su Clásica", no para subir a mano. Qué chequear: que la lista 🛡️ no traiga MLA con `gemelaDe` en "para subir".
- 22/10/2026: `escasez` 🚨: las gemelas no salen como "nunca decidí su precio" (la decisión es la de su Clásica). Qué chequear: que la lista 🚨 no traiga MLA con `gemelaDe`.
