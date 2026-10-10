# QUÉ TIENE QUE MIRAR CADA ETAPA DE LA REVISIÓN

Regla suya (08/10/2026): *"cada movimiento, cambio que hagas lo agregues a una etapa existente o una
nueva"*. **Todo cambio o cosa nueva del panel o del robot se anota acá, en su etapa, en el mismo
commit.** Así la revisión de cada etapa lo mira sin que él tenga que acordarse de pedirlo.
Si una cosa nueva no entra en ninguna etapa, se crea una (en `REV_ETAPAS` de `index.html` también).

Cada renglón: **qué es · dónde vive · qué hay que chequear**. Lo que está en "SIEMPRE" se mira en
todas las etapas.

## SIEMPRE, EN CUALQUIER ETAPA
- **Contar dos (o cuatro) veces lo mismo.** El caso de la línea del Centímetro (08/10): el stock se
  sumaba por clave de producto Y por cada clave de color → 413 en vez de ~107. Cada vez que algo
  suma stock, ventas o plata de varias claves, chequear que no haya una clave "total" y claves
  "parte" sumadas juntas.
- **Una falla leída como dato** (un 429, un catch vacío, un cero que parece buena noticia).
- **Dos fórmulas para el mismo número** (web y robot, o dos comandos): tienen que llamar a la misma
  función o dar lo mismo con los mismos datos.
- **Datos de terceros en el registro público** (nombres, documentos, números de orden enteros).

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

### Sin piso del 22%: objetivo 25% (09/10/2026, regla suya)
- **Qué es:** `cyc/mlconfig` minPct = targetPct = 25 (`meta:25:25`). Colores: abajo de 25 rojo, desde 25 verde. Bajar de 25% sólo con motivo y `!piso`; nunca abajo de 0%.
- **Qué chequear:** que nadie vuelva a usar 22 como freno, que los comandos que hablan de "piso" lean 25, y que una baja abajo de 25 tenga su motivo en el 🧠.

### Escasez: estirar el stock hasta la caja (08/10/2026, regla suya)
- **Qué es:** decisión de Claude en cada vuelta, no del robot. Sin caja despachada: subir de a escalones (≤+25%), techo ~×2 del precio normal, mirar en cada vuelta. Con caja despachada: que la última salga cerca del día 8. Nunca abajo del precio normal.
- **Dónde vive:** las vueltas de Claude (`trig_01475PwdPVJ1qTnYswcDxRq8`, `trig_01FCaQqzU5MA422N6Z8nH63Z`); datos con `cerebro:todas` (sólo lee, sección escasez) y `porquebajo`; precio con `decido`.
- **Qué chequear:** que ninguna pase ×2 del normal, que ML no la pause, que al llegar la caja se revise (no quede cara sin vender), y que una caja despachada se note (`cyc/envios_full`).

### Agregados el 09/10/2026 (cambios del 08/10 que no se habían anotado)
- **`escasez` (a3dce89):** el ritmo sale de ventas y días de la MISMA ventana, y avisa cajas viejas sin marcar. Chequear: que un producto con stock vuelto hace pocos días no dé un ritmo inflado.
- **`analizapromo` (2428f51, cddbe1d):** sección de las promos donde ML pone plata (con el crudo) y lo que te queda en una compartida = lista menos tu parte. Chequear: que "ML pone" salga del dato de la promo y no se suponga.
- **Activar pausadas (5839aec):** `paused_by_seller` es nuestra, no de ML. Con SOLO_DATOS el robot ya no activa: lo hace Claude con `decido:…!activar`. Chequear: que no quede ninguna con stock en Full pausada sin motivo.
- **Arreglos de la etapa 1 del 08/10 (52b4710, 774d1b4, 9e2ec84, 04f8917, ead3675):** son los de v22.63, anotados arriba.

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

## 3 · MERCADERÍA
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

## 4 · CHOQUES
- `mlapi/lineatodo` lo escriben `ritmo:go` (noche) y `lineatodo:go` (ml-consulta): los dos con la
  misma función `calcLineaTodo`.

## 5 · FALLAS MUDAS Y PRIVACIDAD
- **Visitas de la noche** (`linea:go`): el pedido en lote falló callado desde ~01/10. Ahora hay
  respaldo publicación por publicación y el log dice "visitas: N con dato". Chequear que el número
  no caiga a 0.

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


- **Informe 7b: reclamos abiertos y mensajes sin leer (auditoría del 10/10/2026):** el `chequeo` veía 3 reclamos
  abiertos (uno de Matías de 2 días con "podés: reembolsar, mandar mensaje, abrir disputa") y 3 mensajes de
  compradores sin leer, y el `informe` no: su sección 7 sólo miraba ventas canceladas de esas horas. Ahora la 7b
  pregunta a ML los reclamos abiertos de las 4 cuentas (producto, días, motivo, qué te deja hacer ML; ⏰ los que
  esperan respuesta) y cuántos mensajes de posventa hay sin leer. Chequear: sin número de orden ni texto del
  comprador en el registro; que un 429 diga "no pude leer" y no "0 reclamos".

## 6 · IDEAS NUEVAS
- **QUÉ TIENE QUE PROPONER, regla suya del 09/10/2026:** *"lo que hicimos hoy con los colores y movimientos y
  efectos de las tarjetas son detalles que quiero que estén en la revisión de diseño o ideas para ir mejorando la
  web. no puede ser que no me lo haya recomendado cuando está tan bueno (…) que piense cosas así. detalles o mejoras
  de comodidad, cosas duplicadas o faltantes. todo eso"*. O sea: además de datos de ML sin usar y trabajo a mano,
  esta etapa tiene que traer **ideas que den gusto usar la web** (como las ventas con vida: color por %, formas que
  se mueven según la plata, fuego en las mejores), **mejoras de comodidad** (menos toques, lo importante arriba),
  **cosas duplicadas** (el mismo número en dos lados) y **cosas que faltan** (un dato que él busca y no está).
  Que no espere a que él lo pida. Se le pasan todas juntas, con maqueta cuando es visual.

## 7 · DISEÑO
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

## 8 · DATOS E HISTORIAL (nueva, 08/10/2026)
Todo lo que guarda la historia día por día y las pantallas que la dibujan.
- **Línea de tiempo por producto** (`mlapi/linea/<MLA>/<día>`, `_lineaJunta`, `lineaPintar`): stock,
  precio, caja, visitas, ventas, remate, escalera; el día de hoy armado en la web; campo ausente =
  no se sabe (nunca cero).
- **Línea de todo** (`mlapi/lineatodo`, `calcLineaTodo`, `lineaTodoPintar`): suma de todos los
  productos; precio como promedio de cambios (sólo cambios entre ×0,5 y ×2), subas/bajas, ganancia
  del día con la misma cuenta que Ventas, cambios del robot desde supervisor + autoprecio sin repetir.
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

## 9 · CEREBRO (nueva, 09/10/2026, pedido suyo)
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
