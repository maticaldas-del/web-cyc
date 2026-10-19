# QUÉ TIENE QUE MIRAR CADA ETAPA DE LA REVISIÓN

Regla suya (08/10/2026): *"cada movimiento, cambio que hagas lo agregues a una etapa existente o una
nueva"*. **Todo cambio o cosa nueva del panel o del robot se anota acá, en su etapa, en el mismo
commit.** Así la revisión de cada etapa lo mira sin que él tenga que acordarse de pedirlo.
Si una cosa nueva no entra en ninguna etapa, se crea una (en `REV_ETAPAS` de `index.html` también).

Cada renglón: **qué es · dónde vive · qué hay que chequear**. Lo que está en "SIEMPRE" se mira en
todas las etapas.


- **`ml-sync/CEREBRO.md` (13/10/2026):** la lista única de todo lo que el cerebro tiene en cuenta; las dos rutinas la leen al arrancar. Chequear en cada etapa: que cada regla nueva esté ahí y que los pendientes vivos estén al día.

- **informe 12d (13/10/2026, auditoría):** unidades `not_available` adentro de Full (perdidas = las paga ML, `notSupported` = retirar), sólo con `informe:12` o más. Y el `chequeo` no cuenta como sin ficha las publicaciones cerradas. Chequear: que 12d coincida con "Full: N u. con problema" del chequeo.

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

## 1 · PRECIOS
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

## 2 · PLATA
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

## 3 · MERCADERÍA
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

## 4 · CHOQUES
- `mlapi/lineatodo` lo escriben `ritmo:go` (noche) y `lineatodo:go` (ml-consulta): los dos con la
  misma función `calcLineaTodo`.

## 5 · FALLAS MUDAS Y PRIVACIDAD
- **Visitas de la noche** (`linea:go`): el pedido en lote falló callado desde ~01/10. Ahora hay
  respaldo publicación por publicación y el log dice "visitas: N con dato". Chequear que el número
  no caiga a 0.

- **Promos "sin leer" que no eran falla (15/10/2026, auditoría):** ML contesta 400 a la consulta de promos de una
  publicación cerrada, inactiva o en revisión. Se contaban como "sin leer" (55 fijas, "hace 388 horas seguidas") y tapaban
  una falla real. `PROMO_NO_APLICA` (sync.mjs) las saca de la cuenta en la vuelta de la hora, en `sacapromos` (que las
  cuenta aparte) y en el chequeo. Chequear: con un 400 en una publicación ACTIVA o pausada sigue contando como sin leer.

### Aviso de venta: suma la compra entera (16/10/2026)
`avisarVentasNuevas` agrupa por cuenta + `numVenta` (también órdenes de otra vuelta) antes del corte de $10.000. Qué chequear: un carrito de 2+ productos que pasa $10.000 avisa.

## 5 bis · AVISOS DE TELEGRAM QUE LEE CLAUDE (08/10/2026)
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

## 6 · IDEAS NUEVAS
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

## 7 · DISEÑO

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

## 8 · DATOS E HISTORIAL (nueva, 08/10/2026)
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

## 9 · CEREBRO (nueva, 09/10/2026, pedido suyo)

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
