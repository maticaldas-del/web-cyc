# CYC · panel de MercadoLibre

Esto lo lee Claude solo al abrir cualquier chat en este repo. **Sirve para no tener que explicar
todo de nuevo cada vez.** Si algo de acá cambia (una regla, un número, una cuenta), actualizalo.

## Con quién hablás

Matías, revendedor en MercadoLibre desde Argentina. **No es programador: hablale en castellano,
sin términos técnicos.** Nada de "endpoint", "commit", "deploy". Si hay que nombrar algo técnico,
explicalo con una frase en criollo.

Cuando pida un análisis, dale el número y la conclusión, no el camino. Cuando algo esté mal, decilo
derecho y proponé qué hacer.

## El negocio

Cuatro cuentas de vendedor, todas de la misma familia, cada una con su CUIT y su monotributo:

| cuenta | quién | categoría ARCA | impuesto integrado |
|---|---|---|---|
| Adriana | Adriana Mabel Moyano · 27-23443755-6 | G | $71.497,87 |
| Luciana | Luciana Diamela Caldas · 27-27194694-0 | F | $57.719,64 |
| Ayelen | Ayelen Forti · 27-42950142-9 | H | $204.811,64 |
| Matías | Matías José Caldas · 20-42574066-1 | F | $57.719,64 |

Solo Ayelen aporta autónomos ($57.598,04) y obra social ($55.485,33); las otras tres figuran NO
APORTANTE. Total a ARCA: **$504.832/mes**.

**Pendiente para el contador: Luciana y Matías están en F pero facturan a nivel G/H.** Hay que
recategorizar. Y la actividad declarada de Luciana y Ayelen es "marroquinería, paraguas y
similares", que no es lo que venden; la que corresponde es "venta al por menor por internet"
(solo Matías la tiene). Se arregla en el mismo trámite.

### El facturador automático de ML

Datos de las constancias de ARCA (03/08/2026), los que pide MercadoLibre al configurarlo:

| cuenta | inicio de actividades | punto de venta ML | estado |
|---|---|---|---|
| Adriana | 01/05/2021 | 2 | **listo** · certificado vence 03/08/2028 |
| Luciana | 01/09/2022 | 2 | **listo** · certificado vence 04/08/2028 |
| Ayelen | 01/05/2024 | 2 | **listo** |
| Matías | 01/12/2020 | 2 | **listo** · actividad "venta al por menor por internet" |

Las cuatro quedaron configuradas el 05/08/2026. El domicilio distingue de quién es cada pantalla
cuando ARCA no muestra el nombre: Adriana **Av. Ceballos 18 PB**, Matías **Av. Ceballos 18 1ºA**,
Luciana **Pascual Grisolía 1383**, Ayelen **Pintos 646**.

El trámite son 5 pasos en ML **más uno que ML no avisa**: después de subir el certificado da error
y hay que ir a ARCA → *Administrador de Relaciones de Clave Fiscal* → **Nueva Relación** →
servicio `ARCA / WebServices / Facturación Electrónica` → representante = el computador fiscal del
certificado. Sin eso el facturador no emite. Ojo: *Administración de Certificados Digitales* y
*Administrador de Relaciones* son servicios distintos con nombre parecido.

El punto de venta tiene que ser del tipo **"Factura Electronica - Monotributo - Web Services"**, no
"Factura en Línea" (esa es la de facturar a mano) ni la de contingencias (CAEA).

El facturador arranca **desde la próxima venta**: las facturas ya pedidas de ventas viejas hay que
hacerlas a mano igual.

Casi todo se vende por **Full**. El retiro de la familia es **$1.800.000/mes** más un **2% de
interés** sobre el capital que los socios tienen puesto adentro (~US$ 10.000). Con el ritmo de
julio, a CYC le quedan **~$2.000.000/mes** después de todo eso.

## Reglas que no se rompen

1. **Antes de tocar un precio en ML tenés que estar 100% seguro de que el número es correcto.**
   Si no estás seguro, no lo hagas: preguntá. Esta es la regla más importante de todas.
2. **La barrera de los $33.000: subir hasta $32.999 y ahí frenar.** Arriba de ese precio ML te
   cobra el envío gratis y el margen se da vuelta. Si para llegar al 30% hay que cruzarla, se deja
   en **$32.999** y se avisa que quedó abajo del piso a propósito. NO se cruza. (Decidido por él
   el 13/08/2026; antes había que preguntar cada vez.)
3. **TECHO DURO: nunca subir un precio por encima de $600.000.** Regla suya del 13/08/2026. Si
   para llegar al 30% haría falta cruzar ese número, se deja donde está y se avisa.
4. **El piso de margen es 30%**, medido sobre el costo total (mercadería + envío + % de reclamos +
   IIBB + monotributo). El robot baja al piso solo; subir por encima del piso se decide a mano.
5. **NUNCA bajar un precio.** Regla suya del 13/08/2026, sin excepciones. Si una cuenta dice que
   para llegar al 30% hay que BAJAR, el número está mal: no se toca y se investiga.
6. Después de aplicar un precio en ML, **volvé a leerlo de ML para confirmar** que quedó.
7. **Las publicaciones con variantes también se suben.** No alcanza con el precio de la
   publicación: hay que tocar cada variante, y mandar la lista incompleta hace que ML borre las
   que faltan. Después de subirlas, releer y verificar que estén TODAS.

## Cómo están hechas las cosas

- `index.html` — la app entera en un archivo (PWA). Al tocarla hay que subir la versión abajo de
  todo y el número de caché en `sw.js`, si no el celular sigue viendo la vieja.
- `sw.js` — el service worker. Su `CACHE = "cyc-vNN"` va de la mano con la versión del index.
- `ml-sync/sync.mjs` — el robot. Trae las ventas, ajusta precios y manda avisos por Telegram.
- Firebase Realtime Database, namespace `cyc/` — todos los datos.
- GitHub Actions — corre el robot. La rama por defecto es `claude/add-folder-78ysyb`.

### Los "probes": cómo pedirle cosas al robot

`ml-sync/sync.mjs` tiene ~80 comandos que se disparan con la variable `BILLING_PROBE` desde el
workflow `ml-sync` (el campo se llama `billing_probe`). Cada uno arranca con un comentario que
explica qué hace y por qué existe. **Antes de escribir uno nuevo, buscá si ya está.**

Los que más se usan:

| comando | para qué |
|---|---|
| `chequeo[:días]` | el chequeo de la mañana de las 4 cuentas |
| `unapub:<MLA o palabra>` | todo sobre una publicación: precio real, caja de compra, margen |
| `hermanas:<palabra>` | todas las publicaciones del mismo producto, por si hay que subirlas juntas |
| `bajopiso[:piso]` | las publicaciones abajo del 30%, con recomendación · **solo las que vendieron** |
| `submargen[:piso][:go]` | sube al piso con la cuenta de Margen ML · **llega a las que no vendieron** |
| `volver:<MLA=precio>[:go]` | deja un precio exacto (sin `:go` es prueba) · maneja variantes |
| `huerfanos[:palabra]` | los productos en "—": por qué no tienen precio y cuál es su publicación |
| `cargargasto:<fecha>\|<monto>\|<cat>\|<desc>[\|prov=][\|fact=][\|cae=][\|go]` | carga un gasto con su comprobante |
| `proyec[:retiro][:tasa]` | cuánto le queda a CYC por mes |
| `facarca` | lo facturado en la ventana que mira ARCA, por cuenta |
| `catmono[:fecha]` | qué categoría de monotributo corresponde |
| `frenazo:<cuenta>` | por qué una cuenta dejó de vender |
| `netoweb` | calcula lo que deja cada producto al precio de hoy y lo carga en Margen ML |
| `netoref[:borrar]` | los netos escritos a mano que tapan el real, y sacarlos |
| `raizsucia[:go]` | qué quedó escrito fuera de `cyc/` por el bug de prefijo |
| `pubaviso[:borrar]` | de qué publicaciones ya se avisó "problema", para que no repita |
| `vergastos[:mes]` | los gastos de un mes uno por uno, con los 3 meses anteriores al lado |
| `partirgasto:<clave>:<meses>[:go]` | reparte un gasto pagado junto entre los meses que cubre |
| `apis` | qué endpoints de ML contestan (para diagnosticar) |
| `ciclo` | **no es un comando: vuelve a prender el ciclo de 2 minutos** (ver abajo) |

Casi todos son de solo lectura. Los que escriben piden `:go` explícito.

**SIEMPRE, después de correr un comando: volver a prender el ciclo** disparando `ml-sync` con
`billing_probe` = `ciclo`. Cada corrida a mano **mata** el ciclo automático (es el mismo candado),
y el ciclo NO se recupera solo: solo lo arranca el reloj de GitHub, que saltea corridas. La noche
del 05/08/2026 pasaron 3 horas sin ninguna y el resumen del día no salió porque no había ciclo
vivo. Chequeo rápido: si `ml-sync` no figura "in progress", el robot está apagado.

Ojo también: el workflow `ml-sync` **ya tiene las 25 opciones que permite GitHub**. Agregar una más
rompe el archivo entero y deja de correr TODO, sin aviso. Si hace falta algo nuevo, va adentro de
`billing_probe`.

### Los automáticos

| cuándo | qué |
|---|---|
| cada 2 minutos | trae las ventas nuevas |
| 1 vez por hora | robot de precios |
| 00:03 | resumen del día por Telegram |
| 00:03 | junto con el resumen: facturas emitidas + recalcular Margen ML al precio de hoy |
| el 1º de cada mes | resumen del mes |
| 08:00 | el chequeo de la mañana, **escrito en el chat, NO por Telegram** |

El chequeo de las 8 lo pide Claude desde el chat: dispara `ml-chequeo.yml` (o `ml-sync.yml` con
`billing_probe` = `chequeo:7:nomandar`), lee el resultado y escribe el resumen ahí mismo. Por
Telegram va solo el resumen de ventas del día y el del mes.

## Cosas que ya pasaron (para no repetirlas)

- **GitHub demora las corridas programadas**, a veces horas. Por eso los crons se piden 3 veces y
  el robot guarda el último día que mandó cada aviso, para no repetir.
- **Las compras con carrito** llegan con el número del paquete, no el de la orden. Hay que
  indexar por las dos cosas o las canceladas se cuentan doble.
- **El cargo fijo de ML es ~$1.230 por venta**, sin importar el precio. En un producto de $3.400
  eso es el 36%: los productos baratos dan mucho menos margen del que parece.
- **SIRTAC retiene 0,90% de todo lo que pagó el comprador**, envío incluido.
- **`paused_by_seller` lo pausan ellos**, no ML. No es un problema.
- **El margen se calcula con el envío del PEOR caso**, que es el criterio conservador con el que se
  fijaron todos los precios. Con Full el envío real suele ser $0, así que el margen que se ve en el
  panel queda por arriba del piso.
- **TODO lo del panel vive abajo de `cyc/`.** Escribir `products/...` en vez de `cyc/products/...`
  manda el dato a una rama aparte que la web no lee nunca: el comando dice "guardado" y en la
  pantalla no cambia nada. Ya pasó dos veces (`ventaprod` y `products`, 10 escrituras). Lo único
  que sí va en la raíz es `mlapi/` (tokens y estado de Telegram). Para chequearlo: `raizsucia`.
- **"Margen ML" muestra SOLO lo que dice ML**, desde el 13/08/2026. Antes elegía entre tres números
  —el escrito a mano, el calculado al precio de hoy y el promedio de las ventas viejas— y el
  escrito a mano ganaba siempre: un número tipeado hacía meses seguía mandando aunque el precio
  hubiera cambiado diez veces, y el producto aparecía muy abajo del piso sin que se notara. Ahora
  el campo para escribirlo NO existe y el promedio de ventas ya no rellena: si ML no tiene el
  producto publicado, la pantalla dice "—" en vez de inventar. El robot lo recalcula todas las
  noches (paso "Margen ML al precio de hoy" en `ml-daily`) y la pantalla muestra arriba cuándo fue
  la última vez. Para chequear que coincide con ML: `margenweb`.
- **"Margen ML" y `bajopiso` no miden lo mismo y no tienen por qué coincidir.** Margen ML va por
  PRODUCTO (neto de ML contra el costo full); `bajopiso` va por PUBLICACIÓN y suma el envío del
  peor caso, IIBB, monotributo y el % de reclamos. Ninguna miente.
- **`bajopiso` NO mide las publicaciones sin ventas en 60 días: las saltea.** Necesita ventas para
  deducir el envío real. El 13/08/2026 salteó **121 de 401** y lo dijo en una línea al final; yo
  leí "23 abajo del piso" y le dije que no quedaba nada abajo del 30%. Era falso. Para esas está
  `submargen`, que usa la cuenta de Margen ML y no necesita ventas. **Los dos, siempre.**
- **Después de tocar precios hay que correr `netoweb`.** Si no, "Margen ML" sigue mostrando el neto
  del precio viejo y parece que el aumento no se aplicó. Pasó dos veces el 13/08.
- **Ojo con "Muerto" en Stock y reposición.** Mide rotación (ventas ÷ stock), no si vende. Un
  producto con 150 unidades que vende 25 cada 2 meses figura "Muerto" y vendió la semana pasada:
  no está muerto, está SOBRECOMPRADO. El remedio no es rematarlo, es dejar de comprarlo.
- **"0 sin vincular" en Vinculaciones no quiere decir que esté todo vinculado.** Cuenta que cada
  PUBLICACIÓN tenga producto — la dirección contraria. Un producto sin ninguna publicación que le
  apunte no aparece ahí. Y las publicaciones OCULTAS tampoco se cuentan: el 13/08 había 4 ocultas
  sin producto con el cartel diciendo 0. Para verlo de verdad: `huerfanos`.
- **Los productos en "—" casi siempre son fichas repetidas.** El mismo producto cargado dos veces:
  la publicación quedó pegada a una ficha y la otra quedó huérfana (Batidora / Batidora 1 Cabezal,
  Filtro agua / Filtro Con precito, Separador dedo Gordo / 2 Separadores...). Ahí revincular NO
  sirve: le sacás la publicación a la que funciona. Hay que quedarse con UNA ficha.
- **Los productos baratos no se arreglan subiendo un poco.** Venta real del 13/08: Talonera a
  $2.500, neto $862 — ML se quedó con $1.638, el 65%, casi todo el cargo fijo de ~$1.230. Con
  costo $812 quedaron $50 de ganancia. Abajo de ~$4.000 el cargo fijo se come el producto.
- **Las fichas de `cyc/mllinks` se reescriben ENTERAS cuando la publicación vende.** El auto-match
  arma un objeto nuevo y el patch sobre `cyc/mllinks` pisa el hijo completo: todo campo que no se
  arrastre en ese objeto se pierde. Así se perdía el estado de la publicación y el aviso "Problema
  en una publicación" se repetía cada 2 minutos (05/08/2026, el Cabotine de Adriana). Por eso la
  memoria de los avisos vive aparte, en `mlapi/pubalert`, y se mira con `pubaviso`.
- **Cuando él pasa un número, preguntar si es precio o costo.** El 03/08 dijo "el total que dice la
  web" para la Lupa 60mm x10 y era el COSTO ($11.638). Se aplicó como precio de venta. No alcanza
  con aplicarlo: hay que mirar el margen que queda ANTES de tocar ML.

## Cómo verificar antes de decir que algo anda

No alcanza con que el código compile. Para cualquier cambio que toque plata o precios:

1. Corré el probe en modo prueba y mirá la salida de verdad.
2. Si escribe algo, volvé a leerlo de la fuente (ML o Firebase) y compará.
3. Recién ahí decí que quedó.

Si un probe de verificación tiene la fórmula vieja copiada adentro, va a decir "todo bien" para
siempre. Los verificadores tienen que llamar a la misma función que el código real.

## Pendientes al 13/08/2026

Lo que quedó abierto. Borrá de acá lo que se vaya cerrando.

- **Él va a pasar de qué publicación de ML es cada uno de los 11 productos en "—"**, y los Excel de
  compras de ARCA (Mis Comprobantes → Recibidos, una cuenta por vez). Cuando lleguen: vincular con
  `huerfanos` de guía, y armar el cuadro de compras con factura por proveedor.
- **Tres productos están cargados DOS VECES** y por eso la ficha gemela quedó sin publicación:
  Batidora / Batidora 1 Cabezal · Filtro agua / Filtro Con precito · Separador dedo Gordo /
  2 Separadores. Falta que él diga con cuál se queda. Revincular NO alcanza.
- **Balanza persona y Bioxidil tienen la publicación CERRADA en ML** (`MLA2316189534` y
  `MLA2301693130`). No es error de vinculación: o las reabre o siguen en "—".
- **La Cortadora Sportsman está a $32.999 en Adriana y a $13.180 en Ayelen.** Mismo producto, dos
  precios: hay un costo mal cargado en una de las dos fichas. Él decidió subir igual el 13/08. Si la
  de Adriana deja de vender, empezar por ahí.
- **Packs/combos, propuesto y sin respuesta.** Abajo de ~$4.000 el cargo fijo de ML se come el
  producto. Vender de a 3 paga UN cargo fijo en vez de tres, sin bajar ningún precio. Falta armar
  la lista de qué conviene empaquetar y a qué precio.
- **Stock frenado: $3.123.616 en 27 productos.** Tres de los cuatro más grandes vendieron esta
  semana — están SOBRECOMPRADOS, no muertos. Falta mirar la caja de compra de cada uno para saber
  si además hay un problema de competencia.
- **Faltan gastos de agosto**: alquiler (~$95.000) y servicios ($150.000). Los honorarios del
  contador ya están ($100.000, factura C 00001-00000929).

- **Vigilar las 8 publicaciones que ganaban la caja de compra y se subieron igual** (11/08). Él lo
  decidió así: *"aunque perdamos en catálogo ganamos igual, y si hay que mantenerlos abajo para que
  ganen no sirven como productos"*. Entre ellas el Separador de Dedos x2 (35 ventas en 60 días) y
  las luces de bici. Si alguna se cae fuerte en ventas, avisarle para que decida.
- **Cuatro Corta Pelo / Recortadora topados en $32.999** (MLA1751064238, MLA1751165454,
  MLA1452471312, MLA1377920253). Para llegar al 30% habría que cruzar la barrera, así que se quedan
  ahí. En dos de ellos `bajopiso` además dice que hay que BAJARLOS a ~$30.300 — un precio menor no
  puede dar más margen, así que ahí hay un error de cuenta que sigue sin explicarse.
- **Grupo Paulvic: NO TOCAR.** 26 publicaciones entre 24% y 30% a $14.360. Subirlas todas a $14.840
  las pondría arriba del piso (~$34.500/mes más), pero él dijo expresamente que no.
- **Obra social privada: falta dejarla automática.** Son $83.333/mes. El pago de $250.000 del
  04/08 eran 3 meses atrasados y ya se repartió en mayo, junio y julio (`partirgasto`). Falta que
  él confirme si agosto ya tiene su cuota o si el primer mes del régimen nuevo es septiembre, y
  después dejarla cargándose sola todos los meses (como hace el robot con el monotributo).
- **Victoria's Secret "adulterado"** (reclamo de Adriana, 11/08, $45.300). Él dice que son
  originales con factura. ML cerró el caso a favor del comprador sin dejar responder. Se le
  recomendó guardar la factura del lote, abrir una unidad y filmarla, y reclamarle al proveedor.
- **ARCA y las compras (12/08).** Él quiere empezar a controlar que las compras estén respaldadas
  con factura. **Recordarle que pase las compras.** Aclaraciones que ya se le dieron: en monotributo
  las facturas de compra NO bajan lo que paga, y NO existe ningún mínimo de compras — lo que existe
  es un máximo (si compras + gastos de 12 meses llegan al 80% del tope de la categoría más alta,
  queda excluido). El panel hoy NO guarda si una compra tuvo factura ni de qué proveedor: si lo va
  a controlar, hay que armar esa pantalla.
- **Factura A de Luciana**, pedida el 29/07 por mensaje de posventa y sin responder. Al 12/08 son
  TRES compradores distintos pidiendo factura en Luciana, uno ya insistió dos veces.
- **El robot NO sabe reembolsar ni contestar reclamos**: solo lee. Si alguna vez se programa,
  probarlo primero con un reclamo chico, nunca con uno grande.

### Lo grande, que no se arregla con precios

**~100 publicaciones sin stock que dejan de vender ~$500.000 por día**, y cero cajas entrando a
Full desde el 01/08. Todo lo que se puede ganar subiendo precios son ~$34.000/mes: reponer un solo
día vale más que eso. Él ya está reponiendo — no hace falta insistirle, pero sí medirlo.
