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

### Los números de ARCA (categoría K, la más alta · agosto 2026)

| qué | cuánto |
|---|---|
| Ingresos brutos máximos | $126.610.838,75 |
| **Límite de compras + gastos** (80% del anterior) | **$101.288.671** |

**La ventana son 12 meses corridos**, no el año calendario: se recalcula todos los meses. Cuenta
compras + gastos de la actividad, **por CUIT** (no se suman entre las cuatro). Las comisiones y
envíos de ML cuentan; los peajes, la salud y el colegio no.

Estado al 13/08/2026 (facturación de la ventana 07/2025→06/2026, compras proyectadas a 12 meses):

| cuenta | factura al año | % del tope | compras+gastos | % del límite | mercadería con factura | merc/venta |
|---|---|---|---|---|---|---|
| Ayelen | $62.341.557 | 49% | $40.872.143 | 40% | $1.395.352 | **2,2%** |
| Adriana | $57.183.498 | 45% | $32.614.043 | 32% | $2.596.360 | **4,5%** |
| Luciana | $56.416.951 | 45% | $37.118.588 | 37% | $4.170.038 | 7,4% |
| Matías | $54.388.754 | 43% | $52.061.940 | 51% | $9.502.998 | 17,5% |

**Ni el tope de facturación ni el límite del 80% aprietan.** Ninguna pasa del 51%.

### EL problema con ARCA: venden $230M y compran $17,7M con factura

Entre las cuatro facturan **$230.330.760** al año y tienen **$17.664.749** de mercadería con
comprobante: el **7,7%**. Haciendo la cuenta al revés —ML se lleva ~32%, y el margen es 30% sobre
el costo— esa venta necesita unos **$120 millones** de mercadería. **Faltan ~$102 millones sin
respaldo.** La pregunta que hace ARCA no es el 80%: es *de dónde salió lo que vendiste*.

Regla suya del 13/08/2026, y es la correcta: *"no puedo vender 10 y comprar 1"*. Están en 13 a 1.

**Qué se decidió hacer:** NO comprar más (hay $12M de stock parado). Comprar lo MISMO pero
**pidiendo siempre factura** a nombre de la cuenta que corresponda, repartiendo así de cada $100:

| cuenta | cuánto | CUIT para pedir la factura |
|---|---|---|
| **Ayelen** | **$40** | 27-42950142-9 |
| **Adriana** | **$35** | 27-23443755-6 |
| **Luciana** | **$25** | 27-27194694-0 |
| Matías | $0 — ya está ordenada | — |

Para emparejarlas al nivel de Matías hacen falta $22,6M/año más con factura (Ayelen $9,5M ·
Adriana $7,4M · Luciana $5,7M). Si un proveedor no factura, ese proveedor es parte del problema.

### Se facturan entre ellas: $17.163.842 en 2026

Ayelen→Matías $6.029.405 · Luciana→Adriana $4.095.941 · Luciana→Ayelen $2.798.300 ·
Adriana→Matías $1.304.000 · Ayelen→Adriana $1.261.496 · Ayelen→Luciana $1.063.500 ·
Luciana→Matías $576.000.

Para ARCA cada una de esas facturas es una VENTA de quien la emite, así que infla la facturación
de las cuatro sin que entre un peso nuevo ni aparezca mercadería nueva. **Va al contador junto con
la recategorización y lo de las compras: es una sola conversación.**

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
5. **NUNCA bajar un precio por tu cuenta.** Regla suya del 13/08/2026. Si una cuenta dice que para
   llegar al 30% hay que BAJAR, el número está mal: no se toca y se investiga.
   **Única excepción, y la pide ÉL cada vez:** recuperar la caja de compra de un producto que tiene
   stock y no vende. El 16/08/2026 autorizó las tres primeras (pendrive 128gb, Ferrari, De La
   Patagonia). Aun así: nunca se baja sin que lo apruebe, nunca abajo del piso del 30%, y el robot
   **no baja nada solo** — `bajarcaja` deja la lista y el comando, la decisión es suya.
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
| `poncosto:<palabra\|id>\|<pesos>[\|go]` | corrige el costo de un producto (lo mismo que el campo de la ficha) |
| `vincular:<MLA>=<palabra\|id>[:go]` | pega una publicación a un producto y la saca de oculta |
| `pausar:<busca>[!<saca>][:go]` | pausa varias de una · palabras con `+` · **mirar la lista antes** |
| `cargargasto:<fecha>\|<monto>\|<cat>\|<desc>[\|prov=][\|fact=][\|cae=][\|go]` | carga un gasto con su comprobante |
| `subirrecibidas[:go]` | sube las compras de ARCA a Facturas → Recibidas (lee `ml-sync/recibidas.json`) |
| `frenados[:díasStock]` | si conviene bajarle el precio al stock parado, con la cuenta hecha |
| `bajarcaja[:días][:piso][:maxBaja]` | qué bajar **poquito** para que vuelva a vender: las que tienen stock, no venden y perdieron la caja de compra por poca plata · **sale solo en el chequeo de las 8** |
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
- **`paused_by_seller` lo pausan ellos**, no ML. No es un problema — **salvo que tenga stock en
  Full**. Ahí sí: no vende nada, paga almacenamiento todos los meses y el reloj del descarte corre
  igual. Por eso el chequeo de la mañana ahora lo avisa aparte de las pausadas.
- **Filtrar publicaciones por palabras del título es peligroso: hay que MIRAR la lista antes.**
  El 15/08 se pidió pausar las tarjetas de memoria y el primer filtro se llevaba puesto el
  "Auricular Bluetooth Vincha **Micro Sd** Radio Fm" (que vendía 3 por mes) y las "Tablet Xiaomi
  Redmi Pad 2, 128gb **Memoria**" de medio millón. Por eso `pausar` sin `:go` solo muestra, y tiene
  lista de exclusión con `!`. Nunca aplicar un filtro por título sin leer qué agarró.
- **El saldo de ML NO se puede leer por la API.** Probado el 15/08/2026 con `probarsaldo` en las
  cuatro cuentas y en los tres endpoints que existen (`/users/<id>/mercadopago_account/balance`,
  `/v1/account/balance` de MercadoPago y la variante por usuario): los doce intentos devuelven
  **403 forbidden**. No es configuración ni token — la app no tiene ni puede pedir ese permiso.
  Por eso el disponible por cuenta en el Arqueo se carga a mano. Si algún día ML lo habilita, se
  corre `probarsaldo` y se ve al toque.
- **La marca roja de "para evitar descarte" NO viene por la API.** El stock de Full
  (`/inventories/<id>/stock/fulfillment`) devuelve `available_quantity` y `not_available_quantity`
  y nada más: ni la marca ni la fecha de descarte que se ven en "Estado de tu stock". Se deduce
  cruzando el stock de Full con las ventas del panel (stock > 0 y cero ventas en 30 días), que
  además es mejor dato porque las ventas las tenemos de verdad.
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
- **`frenados` SOLO ve lo sobrecomprado: se saltea todo lo que tenga menos de 90 días de stock.**
  El filtro es `diasStock < DIAS_MIN → continue`, con `DIAS_MIN` = 90 por defecto. Un producto con
  20 unidades que vendía 1 por día y se frenó hace 15 días tiene 20 días de stock y **no aparece**.
  El 16/08/2026 le pasé los 3 candidatos que dio `frenados` y él desconfió: *"me resulta raro que
  justo el que te dije esté y que no haya más que dos más"*. Tenía razón — el filtro los tapaba.
  Para la pregunta "¿qué bajo para que rote?" va `bajarcaja`, que mira TODAS las activas con stock.
- **El margen de una publicación no se sabe del todo hasta que vende con el envío CARO.** El
  14/08 revisé la Plantilla Metatarso (`MLA1472615965`, Ayelen) y `unapub` dio 37% con peor caso
  $14, porque TODAS sus ventas habían salido con el envío barato: no había con qué medir el caro.
  Le dije que estaba bien. Esa tarde vendió al 28% real y ahí apareció el envío de $126. Hubo que
  subirla de $3.730 a $3.770. Lección: cuando el "peor caso" de una publicación es sospechosamente
  bajo (unos pesos), NO es que sea barata de enviar — es que todavía no le tocó un envío caro. Las
  ventas que él manda en naranja son justo las que el comando solo no puede ver.
- **Después de tocar precios hay que correr `netoweb`.** Si no, "Margen ML" sigue mostrando el neto
  del precio viejo y parece que el aumento no se aplicó. Pasó dos veces el 13/08.
- **Hay DOS envíos conviviendo y dan márgenes distintos.** `netoweb`, "Margen ML" y `submargen`
  deducen el envío MÁS BARATO que se vio en las ventas; `bajopiso` y `unapub` usan el MÁS CARO.
  El Espejo 8" daba 31,8% con uno y 26,9% con el otro (14/08). **El que vale es el del peor caso**:
  es el criterio conservador con el que se fijaron todos los precios. Mientras `submargen` use el
  barato se va a saltear publicaciones que están abajo del piso — PENDIENTE cambiarlo.
- **Un aumento no está hecho hasta que la PANTALLA lo muestre arriba del 30%.** El 13/08 subí 62
  publicaciones, el comando dijo que todas habían llegado al piso, y en la pantalla seguían en
  27-29%: `submargen` estimaba el cargo de ML como un % del precio nuevo y la pantalla usa el
  promedio de los impuestos de las ventas reales. Corregido el 14/08. La lección general:
  **verificar contra lo que él ve, no contra lo que dice el comando que lo hizo.**
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

- **PREGUNTARLE POR LAS FACTURAS DE LOS PRODUCTOS "IMITABLES".** Él las tiene y las va a pasar;
  pidió expresamente que se le haga acordar. **Sacarlo en cada chat hasta que las mande.** ML le
  exige factura de compra de todo lo que puede ser falsificado —Victoria's Secret, pendrives y
  tarjetas de memoria, y todo lo de marca— y sin esa factura te frena la publicación (es lo que
  pasó con el "Bare Vanilla") o te da el reclamo en contra (el "adulterado" del 11/08). Cuando
  lleguen: cruzar contra el catálogo y decirle **de qué productos FALTA** la factura. Las de ARCA
  que ya están en `cyc/facturas_recibidas` sirven de punto de partida, pero ahí falta 09/2025 a
  12/2025 y no todas las compras salieron con comprobante. y los Excel de
  compras de ARCA (Mis Comprobantes → Recibidos, una cuenta por vez). Cuando lleguen: vincular con
  `huerfanos` de guía, y armar el cuadro de compras con factura por proveedor.
- **NO son fichas repetidas: son 10 productos SIN NINGUNA publicación en ML.** El 16/08/2026 le
  pregunté con cuál ficha se quedaba de los tres pares (Batidora / Filtro / Separador) y contestó
  **"son 6 productos diferentes"**. Tenía razón y la nota vieja de acá estaba mal: el parecido de
  nombres que muestra `huerfanos` es una pista, no un diagnóstico. Lo que pasa de verdad es más
  simple: **no existe la publicación**. Son 10 de 137 productos, y `huerfanos` los lista.
  Los que sí tienen arreglo conocido: Balanza persona y Bioxidil (publicación cerrada, ver abajo)
  y Cargador notebook (`MLA1474825987`, Ayelen, OCULTA y SIN PRODUCTO → se vincula y listo).
  Los otros siete —Separador dedo Gordo, Calculadora, Bola Cristal, Filtro Con precito, Alargue
  Zapatilla Hub USB 220, Dermaglos Facial Ultra Volumen, Batidora 1 Cabezal— **necesitan que se
  publiquen**, no que se revinculen. Falta que él diga cuáles quiere publicar.
- **Cuatro publicaciones están OCULTAS y SIN PRODUCTO** (16/08): `MLA1474825987` Ayelen "Cargador
  Universal Computadora Laptop" · `MLA2019878760` Matías "Cafetera Eléctrica De Filtro Sprint" ·
  `MLA2046277374` Ayelen "Espumador De Leche Manual Acero Inoxidable" · `MLA1754449117` Matías
  "Masajeador Facial Bola De Hielo". Antes de vincular ninguna hay que preguntarle **a qué producto
  suyo corresponde cada una**: por el título no alcanza.
- **Balanza persona y Bioxidil tienen la publicación CERRADA en ML** (`MLA2316189534` y
  `MLA2301693130`). No es error de vinculación: o las reabre o siguen en "—".
- **El masajeador: falta saber si son UNO o DOS productos.** El 14/08 se le puso costo $9.000 a la
  ficha "masajeador de cara" (full $10.132 con el 12,5% de reclamos), que era lo que él dijo que se
  paga. Su única publicación, `MLA1714540251` de Ayelen ("Masajeador Facial Y Corporal Reductor
  3en1"), está PAUSADA. Aparte hay `MLA1754449117` de Matías, **"Masajeador Facial Bola De Hielo
  Crioterapia"**, pausada sin stock, a $15.000, 4 vendidas y **sin producto**. Él dijo "son todos
  los mismos", pero por el título una es un rodillo de hielo para la cara y la otra un reductor
  corporal 3 en 1: son cosas distintas. **No se vinculó nada hasta que él lo confirme.** Si son el
  mismo: `vincular:MLA1754449117=p1779912656170:go`. Si no, hay que darle su propia ficha con su
  costo. Ninguna de las dos está vendiendo, así que no corre riesgo hoy.
- **La Cortadora Sportsman está a $32.999 en Adriana y a $13.180 en Ayelen.** Mismo producto, dos
  precios: hay un costo mal cargado en una de las dos fichas. Él decidió subir igual el 13/08. Si la
  de Adriana deja de vender, empezar por ahí.
- **Packs/combos, propuesto y sin respuesta.** Abajo de ~$4.000 el cargo fijo de ML se come el
  producto. Vender de a 3 paga UN cargo fijo en vez de tres, sin bajar ningún precio. Falta armar
  la lista de qué conviene empaquetar y a qué precio.
- **Stock frenado: $3.123.616 en 27 productos.** Tres de los cuatro más grandes vendieron esta
  semana — están SOBRECOMPRADOS, no muertos. Falta mirar la caja de compra de cada uno para saber
  si además hay un problema de competencia.
- **Stock en Full que ML va a descartar (14/08).** El chequeo lo mide desde hoy. Están así:
  **32 publicaciones con stock y CERO ventas en 30 días · 309 u. · $2.908.548**, las más grandes
  la Tablet Redmi Pad (2 u., $587.844), el Ferrari de Adriana (14 u., $427.448) y la Tarjeta
  Sandisk 32gb (30 u., $238.290). Y **1 pausada con stock adentro**: Filtros Purificador de Agua
  de Matías, 20 u., $20.840 — o la reactiva o retira el stock. De las 44 pausadas a mano, es la
  única con mercadería adentro.
- **Las 7 tarjetas de memoria quedaron TODAS pausadas** (15/08, decisión suya: "son para
  problemas"). Son todas de Matías. Pero **quedan 54 unidades adentro de Full**: Sandisk 32gb 28 u.
  · Kingston Canvas 64gb 15 u. · Kingston con adaptador 7 u. · Sandisk 128gb 4 u. Pausar NO saca la
  mercadería del depósito: sigue pagando almacenamiento y ML la descarta igual. El 16/08 decidió:
  **las retira**. El retiro se pide desde ML (Full → Estado de tu stock → Retirar), no hay API para
  eso: lo hace él. Falta confirmar que las 54 unidades salieron. Los pendrives NO se tocaron.
- **Faltan gastos de agosto**: servicios ($150.000, en julio figura como "Claude"). El alquiler
  ($100.000), los honorarios ($100.000) y la obra social Sancor ($65.227) ya están.
- **OSDE es PERSONAL, no es de CYC. No cargarlo nunca.** Aparece en los comprobantes recibidos de
  ARCA ($321.796 de Adriana + $200.414 de Luciana el 25/07) y es tentador tomarlo por un gasto del
  negocio. Él lo dijo expreso el 13/08/2026. Lo mismo el colegio (Asociación Hijas de Nuestra
  Señora de la Misericordia) y los peajes.
- **SANCOR SALUD sí es de CYC, y no es lo mismo que OSDE.** Es la obra social de Ayelen y la paga
  CYC porque *no se descuenta del monotributo* (el aporte de obra social del monotributo, $55.485,
  va igual; Sancor se paga aparte y encima). Se factura todos los meses a nombre de Ayelen y el
  monto cambia: 2026 fue $85.045 · $57.524 · $91.596 · $82.151 · $87.627 · $90.192 · $152.716 ·
  $65.227 (ene a ago). **Cargarla con el monto REAL de la factura, no con un promedio.**

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
- **El "Bare Vanilla" de VS (`MLA3546445862`) está EN REVISIÓN de ML esperando documentación**
  (`under_review · pending_documentation`) y por eso ML rechaza cualquier cambio, el precio
  incluido (ML-400). El 14/08 quedó en $45.300 cuando las otras 9 subieron a $49.000. Cuando él
  mande los papeles y ML la libere: `volver:MLA3546445862=49000:go`. Es el mismo tema que el
  reclamo del "adulterado": ML quiere que pruebe que son originales.
- **Las 13 publicaciones de VS son TODAS de Adriana** y están en dos fichas: `p1779912655550`
  (mercadería $21.533, 10 publicaciones) y `p1785263851692` ($24.462, 3). El 14/08 él pidió
  llevarlas todas a $49.000; tres ya estaban más caras y no se tocaron (regla de no bajar):
  `MLA1771171013` $49.040 · `MLA3374447776` $49.640 · `MLA3374364116` $52.130.
- **ARCA y las compras.** Ya está la pantalla (Facturas → Recibidas, 338 comprobantes de ene a
  ago 2026) y ya está el diagnóstico (ver arriba: venden $230M, compran $17,7M con factura). Lo que
  falta es que **empiece a pedir factura en cada compra** y que pase los comprobantes nuevos para
  cargarlos con `subirrecibidas`. Faltan también los meses 09/2025 a 12/2025, que hoy están dentro
  de la ventana de 12 meses que mira ARCA y no los tenemos.
  Aclaración que ya se le dio y conviene no repetir: en monotributo las facturas de compra NO bajan
  lo que paga; sirven para respaldar, no para descontar.
- **Las facturas RECIBIDAS no son gastos.** Viven en `cyc/facturas_recibidas`, aparte de
  `cyc/compras`. Si entraran en los gastos, la mercadería se contaría dos veces —su costo ya está
  dentro del costo de cada producto— y la ganancia del mes saldría millones más baja.
- **Los gastos ya NO se cargan solos.** El robot creaba `monofijo_<mes>` con un monto fijo; se sacó
  el 13/08/2026 porque el monto real cambia todos los meses y nadie lo miraba. Ahora los carga
  Claude con `cargargasto` cuando él pasa los comprobantes. **Los VEPs del monotributo NO se cargan
  como gasto**: el impuesto integrado ($391.748/mes entre las cuatro) ya se descuenta como % en
  cada venta. Lo único que va como gasto es autónomos + obra social de Ayelen ($113.083).
- **Factura A de Luciana**, pedida el 29/07 por mensaje de posventa y sin responder. Al 12/08 son
  TRES compradores distintos pidiendo factura en Luciana, uno ya insistió dos veces.
- **El robot NO sabe reembolsar ni contestar reclamos**: solo lee. Si alguna vez se programa,
  probarlo primero con un reclamo chico, nunca con uno grande.

### Lo grande, que no se arregla con precios

**~100 publicaciones sin stock que dejan de vender ~$500.000 por día**, y cero cajas entrando a
Full desde el 01/08. Todo lo que se puede ganar subiendo precios son ~$34.000/mes: reponer un solo
día vale más que eso. Él ya está reponiendo — no hace falta insistirle, pero sí medirlo.
