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


## 7 · DISEÑO
- **Métricas → Tendencia** (`_metBarraOn`, `_metLegendClick`, `cycMetBarras` en localStorage): las barras
  de ganancia y gastos del día arrancan apagadas; se prenden en la leyenda y queda recordado. Chequear
  que al apagarlas la escala del gráfico se ajuste a las líneas.
- **El cambio de precio en cada venta** (`cambioVentaHTML`, 08/10/2026): con 2+ cambios en los 7 días
  muestra desde el precio de antes del primero hasta el último (y la plata de más contra ese precio);
  % de ganancia antes (≈, la misma venta al precio viejo: `comisionEnPrecio`, envío de Full por lado de
  la barrera, IIBB en proporción) → después (el real), con `pctColor`. Chequear que el % de "después"
  sea el mismo de la píldora de la venta.

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
