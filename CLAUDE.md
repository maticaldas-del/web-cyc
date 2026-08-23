
## PISO DURO: NUNCA BAJAR NINGÚN PRODUCTO A MENOS DE 30%

Regla suya, textual, del 20/08/2026: **"NUNCA BAJAR NINGUN PRODUCTO A MENOS DE 30%."**

No es una guía, es un freno en el código. Está en `setPriceTo`, que es la ÚNICA función que baja
precios en ML, y es OBLIGATORIO: quien quiera bajar tiene que declarar en qué margen queda
(`setPriceTo(mla, varId, precio, token, { margen })`).

  - Si no lo declara → NO BAJA. Un comando nuevo que se olvide del dato falla ruidoso.
  - Si queda abajo de 30 → NO BAJA, y dice en cuánto habría quedado.

Por qué está ahí y no en cada comando: la regla vivía repartida en tres lugares y dependía de que
el próximo comando que se escribiera se acordara de aplicarla. Un solo olvido = vender perdiendo.

`fijar:<grupo>:<precio>` YA NO PUEDE BAJAR. Pone un precio a mano sin calcular ningún margen, o sea
bajaba a ciegas. Subir sigue funcionando igual. Para bajar: `bajarcaja` o `corregir`, que calculan.


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
4. **El piso de margen es 30% y la BASE a la que se sube es 32%.** Regla suya del 19/08/2026:
   *"ponele 32% como base a todo a partir de ahora a cada cosa que se aumente. no retroactiva"*.
   Los dos números son distintos a propósito: se toca lo que está **abajo del 30%**, y cuando se
   toca se lo lleva al **32%**, no al 30% justo. Con la meta pegada al piso cualquier cosa mínima
   —un envío un peso más caro, un descuento de $10 de ML— lo volvía a hundir; el perfume De La
   Patagonia hubo que subirlo dos días seguidos por eso. **No es retroactiva**: lo que hoy está
   entre 30% y 32% se deja donde está, no se sale a subir nada. Se mide sobre el costo total
   (mercadería + envío del peor caso + % de reclamos + IIBB + monotributo). En la base está como
   `cyc/mlconfig` → piso 30 / meta 32 (se cambia con el comando `meta:<piso>:<meta>`), y a mano
   los comandos van con el 32: `unapub:<MLA>:32`, `bajopiso:32`, `submargen:32`.
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
8. **SACAR SIEMPRE TODAS LAS PROMOCIONES DE ML.** Regla suya del 18/08/2026. Todas: las que ya
   están aplicadas (`started`) y las aceptadas que todavía no arrancaron (`pending`). Las
   `candidate` son propuestas que nadie aceptó, no hacen nada y no se tocan (hay ~1.000).
   El robot las saca solo, en la vuelta completa de cada hora. A mano: `sacapromos`.
   **El agujero que hay que recordar:** una promo agendada NO baja el precio hoy, así que mirar
   sólo el precio no la encuentra. Pasó dos veces — 23 el 03/08 y 26 el 18/08, estas para arrancar
   el 24/08 con los 9 Paulvic a $7.898.

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
| `fijarvar:<MLA>=<variante>\|…[\|go]` | dice a mano de qué color/aroma es cada publicación cuando el título de ML no lo nombra igual que la ficha |
| `pausar:<busca>[!<saca>][:go]` | pausa varias de una · palabras con `+` · **mirar la lista antes** |
| `cargargasto:<fecha>\|<monto>\|<cat>\|<desc>[\|prov=][\|fact=][\|cae=][\|go]` | carga un gasto con su comprobante |
| `subirrecibidas[:go]` | sube las compras de ARCA a Facturas → Recibidas (lee `ml-sync/recibidas.json`) |
| `frenados[:díasStock]` | si conviene bajarle el precio al stock parado, con la cuenta hecha |
| `bajarcaja[:días][:piso][:maxBaja]` | qué bajar **poquito** para que vuelva a vender: las que tienen stock, no venden y perdieron la caja de compra por poca plata · **sale solo en el chequeo de las 8** |
| `proyec[:retiro][:tasa]` | cuánto le queda a CYC por mes |
| `retiromes[:monto]` | el retiro de los dueños que se carga solo el 1º de cada mes · `:probar:<mes>` para ver qué haría |
| `cajasllegaron[:go]` | marca las cajas que ya entraron a Full · **sale sola una vez por hora** |
| `variantes:<palabra>` | qué variantes tiene un producto y el título real de cada publicación, para cargar las que falten |
| `sinvincular[:cuenta]` | las publicaciones que NO tienen producto: el robot no les ve stock ni margen |
| `nomas:<MLA,...>[:go]` | "esto no lo vendemos más": oculta la publicación del panel · no toca nada en ML |
| `preguntas[:cuenta]` | las preguntas sin responder ENTERAS, con el producto de cada una |
| `facarca` | lo facturado en la ventana que mira ARCA, por cuenta |
| `catmono[:fecha]` | qué categoría de monotributo corresponde |
| `frenazo:<cuenta>` | por qué una cuenta dejó de vender |
| `netoweb` | calcula lo que deja cada producto al precio de hoy y lo carga en Margen ML |
| `netoref[:borrar]` | los netos escritos a mano que tapan el real, y sacarlos |
| `raizsucia[:go]` | qué quedó escrito fuera de `cyc/` por el bug de prefijo |
| `pubaviso[:borrar]` | de qué publicaciones ya se avisó "problema", para que no repita |
| `vergastos[:mes]` | los gastos de un mes uno por uno, con los 3 meses anteriores al lado |
| `partirgasto:<clave>:<meses>[:go]` | reparte un gasto pagado junto entre los meses que cubre |
| `sincargo:<palabra>[:go]` | "este reclamo no fue culpa del producto": deja de encarecerlo · **sin `:go` solo muestra** |
| `visitas[:cuenta][:días]` | **¿la ve alguien o no la ve nadie?** separa problema de visibilidad de problema de precio |
| `cajacompra[:cuenta]` | **¿la venta es nuestra o del otro?** el estado de la caja de compra de cada publicación · lo corre solo el robot cada hora y pinta la columna "Caja ML" de Rotación de Stock |
| `competencia:<MLA>` | los vendedores del catálogo con sus precios y **si la pelea se puede ganar** |
| `envioml:<MLA>` | el envío que **dice ML** (por destino) vs el que deducimos de las ventas · `envioreal` es OTRO comando |
| `apisnuevas:<MLA>` | qué endpoints de ML andan y no usamos |
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
| 1 vez por hora | la caja de compra de cada publicación (para la columna "Caja ML") |
| 00:03 | resumen del día por Telegram |
| 00:03 | junto con el resumen: facturas emitidas + recalcular Margen ML al precio de hoy |
| el 1º de cada mes | resumen del mes |
| 08:00 | el chequeo de la mañana, **escrito en el chat, NO por Telegram** |

El chequeo de las 8 lo pide Claude desde el chat: dispara `ml-chequeo.yml` (o `ml-sync.yml` con
`billing_probe` = `chequeo:7:nomandar`), lee el resultado y escribe el resumen ahí mismo. Por
Telegram va solo el resumen de ventas del día y el del mes.

### Los tres lugares donde está la mercadería

Desde el 19/08/2026 el panel distingue **tres**, no dos:

1. **Mi oficina** — lo que está en casa, contado a mano (por variante si el producto tiene).
2. **En camino a Full** — cajas ya despachadas que ML todavía no recibió. Vive en
   `cyc/envios_full/<id>/cajasDet`, una entrada por CAJA, con su seguimiento, su contenido
   (`items: [{prodId, variante, u}]`) y si llegó.
3. **En ML (Full)** — lo que ML informa.

Por qué importa: **todos los días salen cajas**. Sin el paso del medio, "Armar caja" recomendaba
mandar cosas que ya iban arriba de un camión, y la reposición contaba como faltante lo que estaba
por llegar. Ahora lo que va en camino **cuenta como stock** de la cuenta a la que va.

**Y cuenta en el patrimonio.** Al cerrar una caja las unidades salen de la oficina; si no se
contaran en el medio, el Arqueo bajaría solo por despachar y volvería a subir al llegar — plata
que aparece y desaparece sin que pase nada. Está como "En camino a Full" en la tarjeta de stock.

Colores de cada caja, regla suya: **verde** llegó · **naranja** en camino · **rojo** 7 días o más
sin llegar. **El verde lo pone el robot solo**, una vez por hora: ML publica las entradas a Full
en `/stock/fulfillment/operations/search` y se cruzan con el contenido de cada caja. Cuando hay
varias cajas del mismo producto se reparte **por orden de despacho, la más vieja primero** (ML no
dice de qué caja vino cada unidad). Una caja se marca **solo si TODOS sus renglones** quedaron
cubiertos: media caja recibida sigue siendo una caja en camino. A mano: `cajasllegaron`.

**Lo que se sugiere mandar cubre 44 días, no 30.** Regla suya del 19/08/2026: desde que se arma
la caja hasta que la mercadería se puede vender pasan unos **14 días** —~7 hasta que la caja sale
y ~7 más hasta que ML la activa en Full— y en el medio la cuenta sigue vendiendo de lo que ya
tiene. Mandar para 30 días hace que la caja llegue justo cuando la publicación se quedó sin nada.
Los dos números están en `index.html` como `REPO_DIAS_COBERTURA` (30) y `REPO_DIAS_DEMORA` (14).

**Las cajas se arman a mano y se pueden dejar a medias.** La recomendación del panel es el punto
de partida, no la orden: casi nunca se despacha exacto lo que dice (entra menos, se manda otra
cosa, hacen falta dos cajas). Cada renglón tiene su casilla y se listan TODOS los productos que
hay en casa, no solo los que la cuenta "necesita". La caja a medio armar vive en
`cyc/cajas_armando/<cuenta>` —una por cuenta— así que sobrevive a cambiar de cuenta y a cerrar la
app. Como el stock de la oficina no baja hasta cerrarla, el tope de cada renglón descuenta lo que
ya está apartado en las cajas de las otras cuentas.

## LAS PERCEPCIONES: MEDIDAS Y EL PANEL DA BIEN (21/08/2026)

ML avisó en Luciana *"estás pagando más impuestos porque llegaste a los topes"*. Al mirarlo
aparecieron **dos impuestos distintos que se confundían en uno**:

| | qué es | Luciana, agosto 2026 |
|---|---|---|
| **Retenciones** | salen de cada venta · ya están dentro del neto | $6.784 |
| **Percepciones** | ML las factura a fin de mes · se pagan aparte | **$231.497** |

**RESULTADO: el `ML_EXTRA_PCT` del panel está BIEN.** Medido con `percepcalc` (percepciones ÷ ventas
reales del mismo período, agosto 2026):

| cuenta | ventas | percepciones | REAL | panel |
|---|---|---|---|---|
| Adriana | $7.193.833 | $273.493 | 3,80% | 4,07% |
| Ayelen | $2.660.660 | $159.402 | 5,99% | 5,95% |
| Luciana | $5.780.144 | $231.497 | 4,01% | 4,37% |
| Matías | $10.284.587 | $349.774 | 3,40% | 4,58% |
| **total** | **$25.919.224** | **$1.014.166** | **3,91%** | |

Las cuatro dentro de ~1 punto, y en tres de ellas el panel descuenta **de más** (conservador). No
hay nada que corregir. Son $1.014.166/mes de IIBB, pero **ya estaban contados**.

**EL ERROR QUE SE COMETIÓ, PARA NO REPETIRLO:** primero se calculó "10,04%" dividiendo las
percepciones por la **"base imponible"** que muestra ML ($2.305.048). Esa base **NO son las ventas**:
las ventas reales de Luciana en el período fueron $5.780.144, más del doble. La base imponible es
solo la parte sujeta a ese régimen, y cada régimen tiene la suya ($1.785.253, $1.080.077, $395.411…).
Con eso se llegó a "los márgenes están 6 puntos inflados" y "falta un millón por mes", las dos cosas
FALSAS. **Para medir un % que va a mover precios, el denominador tiene que ser las ventas del panel,
no una base que informa ML.**

**Las percepciones NO salen por la API. Probado el 21/08/2026** con `probarpercep` en Matías: 11
endpoints candidatos, **10 fallan** (404 los de `/details`, `/summary`, `/perceptions`; 422 los que
prueban `group=MP` o `document_type=PERCEPTION`). El único que contesta es el que ya se usa
(`/billing/integration/monthly/periods?group=ML&document_type=BILL`) y devuelve **solo el total del
período**, sin abrir el impuesto. Van a mano, igual que el saldo de MercadoPago.
Ojo al probarlo: el billing de ML permite **5 llamadas por minuto**. El primer intento las mandó
seguidas, contestó 429 en casi todas y el resultado no valía — un 429 NO quiere decir que el
endpoint no exista. Hay que dejar ~14 segundos entre llamadas.

**Dónde se miran a mano:** ML → Facturación → (elegir el mes) → Ir al detalle → Detalle de cuenta →
**Total de percepciones**. Ojo: si dice "EN CURSO" es parcial y no sirve. Y **cada cuenta cierra un
día distinto** (Adriana el 12, las otras el 14).

**Ojo con el comando `alicuota`:** mide RETENCIONES, no percepciones. Mirando solo los $6.784 habría
contestado "todo bien" — por casualidad acertaba, pero por el motivo equivocado.

**Para el contador (sigue abierto, pero es más chico de lo que parecía):** las percepciones son pago
a cuenta de IIBB y él las usa todas cada mes, sin dejar saldo a favor. O sea que el impuesto se paga
completo y no hay plata parada para recuperar.

## EL STOCK QUE NO ESTÁ EN FULL NO EXISTE

Regla suya del 20/08/2026, textual: **"todo lo que diga 'depósito' en ML no tener en cuenta nunca.
Ya que no existe ese stock. Dice uno porque es lo mínimo que permite ML para crear una
publicación."**

Ese `1` es un requisito del formulario de ML, no mercadería. Contarlo hacía dos daños a la vez:
metía **plata inventada en el patrimonio** del Arqueo (unidades × costo de algo que no está), y
**tapaba quiebres** — una publicación con "1 unidad" no figura sin stock, así que no aparecía en lo
que hay que reponer.

Está frenado en el robot, donde se carga el stock al panel: si la publicación no es `fulfillment`,
cuenta **cero**. Ojo con el detalle que casi se pasa: la clave se escribe **en cero igual**, no se
saltea — sólo se guarda en la base lo que aparece en ese objeto, así que saltearla dejaría para
siempre el número inventado de antes. Cada corrida dice cuántas publicaciones ignoró y cuántas
unidades falsas descartó.

Lo que está en casa se cuenta a mano en **Mi oficina**, que es el lugar que corresponde.

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
- **Lo que va EN CAMINO a Full no se puede leer de ML.** Probado el 20/08/2026 con `probarinbound`
  en las cuatro cuentas: 7 endpoints candidatos × 4 cuentas = 28 intentos, **todos fallan** (404 o
  directamente una página web, o sea que ni siquiera es una ruta de la API):
  `/inbound-shipments`, `/inbound-shipments/search`, `/stock/fulfillment/inbound/shipments`,
  `/stock/fulfillment/inbound_shipments`, `/users/<id>/inbound-shipments`, `/shipments/inbound`,
  `/fbm/inbound/shipments`. El único que sí anda es
  `/stock/fulfillment/operations/search`, y **exige `inventory_id`** (sin él da 400): sirve para ver
  lo que YA ENTRÓ, no lo que viaja. Conclusión: el contenido de las cajas en camino sale de lo que
  se carga al cerrarlas en "Armar caja", y no hay forma de sacarlo de ML. **Consecuencia práctica:
  una caja despachada sin cargar el contenido NO se puede marcar sola** — no hay con qué cruzarla.
- **"No vende" no se puede diagnosticar sin las VISITAS, y los remedios son opuestos.** Desde el
  20/08/2026 el chequeo de la mañana pregunta a ML cuántas visitas tuvo cada publicación dormida
  (con stock y cero ventas en 30 días): **menos de 20 visitas = no la ve nadie** —el problema es la
  caja de compra, el título o la foto, y bajar el precio no hace nada— y **50 o más con cero ventas
  = la ven y no compran**, ahí sí entra el precio. Sale de `/items/<MLA>/visits/time_window`.
  A mano y para todo el catálogo: `visitas`.
- **Margen bajo y caja de compra perdida se ven IGUAL en pantalla y se arreglan al revés.** Desde
  el 20/08/2026 Rotación de Stock tiene la columna **🥊 Caja ML** al lado del margen, justo por eso:
  un producto frenado con margen bajo hay que SUBIRLO; un producto frenado que perdió la caja de
  compra puede tener stock, buen margen y cero ventas para siempre, porque en el catálogo ML muestra
  **un solo botón de comprar** y se lo lleva otro vendedor — el precio no es el problema y tocarlo no
  hace nada. 🟢 la ganamos · 🟠 la compartimos (**subir el precio nos saca del reparto**) · 🔴 la tiene
  otro · ⚪ no es de catálogo. Cuando un producto tiene varias publicaciones manda la MEJOR: con que
  una sola gane la caja, el producto se vende.
  El dato sale de `/items/<MLA>/price_to_win`, lo escribe el robot en `cyc/mllinks/<MLA>/caja` una
  vez por hora y la pantalla lo lee de ahí — la web no puede preguntarle a ML por su cuenta, no tiene
  el token. Mismo camino que las visitas, a propósito. A mano: `cajacompra`.
  **Ojo con lo que ML dice que hace falta para ganar la caja: no es una recomendación de precio.**
  Que se gane a $900 no quiere decir que a $900 haya margen. Antes de tocar nada va `unapub:<MLA>`,
  y sigue mandando la regla de no bajar precios solo.
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
- **Había DOS envíos conviviendo y daban márgenes distintos. RESUELTO el 20/08/2026.** `netoweb`,
  "Margen ML" y `submargen` deducían el envío MÁS BARATO visto en las ventas; `bajopiso` y `unapub`
  usaban el MÁS CARO. El Espejo 8" daba 31,8% con uno y 26,9% con el otro (14/08). Ahora **los
  cinco lugares usan el PEOR caso** (`modo:'max'`), que es el criterio conservador con el que se
  fijaron todos los precios. Consecuencia: los márgenes en pantalla bajaron, pero son los reales —
  antes se mostraban de más. Si aparece un margen sospechosamente alto, lo primero sigue siendo
  mirar si esa cuenta descuenta el envío.
  Lo que NO se cambió: la fórmula sigue deduciendo el envío de nuestras ventas, no del número que
  informa ML (`/suggestions/items/<MLA>/details` → `costs.shipping_fees`). Ese solo se usa como
  respaldo cuando el producto NUNCA vendió y no hay nada que deducir; si ML tampoco lo tiene, queda
  marcado **SIN ENVÍO** en ámbar. Las dos comparaciones que hay dan parecido (abajo de $33.000 los
  dos dicen $0; arriba, ML $5.620 contra nuestros $6.620, o sea que quedamos más conservadores),
  pero **dos datos no alcanzan** para cambiar la fórmula que define todos los precios. Para juntar
  más está `envioml:<MLA>`.
- **Un reclamo por CÓMO SE ENVIÓ no es un problema del producto, y encarecía el precio.** El costo
  full es `costo × (1 + % de reclamos)`, y ese costo define si un precio llega al piso. El
  20/08/2026 él marcó dos casos que eran suyos, no del producto: la **Lupa 60mm x10** (se equivocó
  al despacharla — tenía **4 reclamos sobre 4 unidades vendidas, o sea 100%**, y el sistema le
  cobraba el DOBLE de costo: US$ 14,20 en vez de US$ 7,20) y **TODOS los espejos**, que mandaba sin
  protección y ahora van con protección (Espejo 5" 9,2% · 7" 12,5% · 6" 19,4% · 4" 1,7% → todos a 0).
  Se marcan con `sincargo:<palabra>[!<excluir>][:go]`, que escribe `sinCargo` en la venta.
  **La venta SIGUE siendo un reclamo** en Ventas x Producto y en el resumen del mes: el registro de
  lo que pasó no se falsea, lo único que cambia es que deja de encarecer el producto. Y se marca lo
  VIEJO: los reclamos nuevos no vienen marcados, así que cuentan solos — *"ahora sí cualquier
  reclamo que tengan los productos son reales"*.
  **Va en los DOS lados**: `devPctCosto()` en `index.html` y `setDevLive()` en `sync.mjs`. Cada uno
  calcula el % por su cuenta; tocar uno solo deja al robot poniendo precios con un costo distinto
  del que muestra el panel.
  Ojo con el filtro: `sincargo:lupa` agarra **la Lupa 90mm también**, que no era del caso. Sin `:go`
  solo muestra, con el antes y el después de cada producto. Mirar la lista siempre.
- **La reposición dividía por 30 fijo y subestimaba justo lo que más vende.** Hasta el 20/08/2026
  "Armar caja" calculaba `ventas del mes ÷ 30` sin preguntar si en esos 30 días había mercadería
  para vender. Un producto que vendió 10 unidades en 5 días y se agotó daba **0,33 por día** cuando
  vendía **2 por día**: sugería **15 unidades en vez de 88**. Y el error va siempre para el mismo
  lado — cuanto más rápido se vende algo, antes se agota, más días pasa en cero y más lo achica la
  cuenta; el que más urge reponer es el que peor mide. Ese día había 68 publicaciones sin stock que
  vendían, $222.489 por día. Ahora divide por los días que REALMENTE tuvo stock, que salen de
  `cyc/stockhist` (el robot ya los venía anotando y la pantalla nunca los miró). Piso de 7 días
  (`REPO_DIAS_MIN`): con 1 o 2 días medidos una venta de casualidad pediría una caja entera.
  Lo probado: el producto que tuvo stock todo el mes **no cambia**; el que se agotó sube.
  Ojo: `cyc/stockhist` es por producto×cuenta, no por variante — en los productos con aromas se usa
  como aproximación.
- **Una variante puede tener su publicación andando y figurar "sin publicar en ninguna cuenta".**
  El panel adivina de qué color/aroma es cada publicación leyendo el TÍTULO, y exige que TODAS las
  palabras de la variante estén ahí. Si la ficha la llama "Azul Marino" y ML dice sólo "Azul", no
  engancha: la variante no aparece en Armar caja y el stock de Full no se le imputa. Pasó el
  21/08/2026 con las 4 sábanas de 105x190 de Luciana (Azul Marino, Beige Oscuro, Rosa Chicle, Verde
  Musgo) y la Azul Oscuro de 140x190. Aflojar la regla sería peor —"Azul Marino" y "Azul Oscuro"
  conviven en la misma ficha— así que se dice a mano con `fijarvar:<MLA>=<variante>[|go]`, que lo
  escribe en `cyc/mllinks/<MLA>/variant`. Ese campo lo respetan la web, el stock de Full por
  variante y el marcado de cajas recibidas.
  **Y antes de aplicar, mirar SIEMPRE la prueba:** de los 8 que él marcó ese día, 3 (los Victoria's
  Secret) ya estaban bien vinculados a la ficha "Victoria's Secret BLISS" y aplicarlos los habría
  devuelto a la ficha vieja. Lo que se veía en cero en pantalla no era una variante sin publicación:
  eran 3 nombres de color sobrantes en la ficha vieja, que se sacaron con `repbliss:go`.
- **Leer la salida ENTERA del comando, no el renglón final.** El 19/08/2026 corrí `ponvariantes`
  sobre el Paulvic, leí solo el "✓ Quedó" del final y no vi el renglón de arriba que decía qué
  había antes. La ficha ya tenía **70 aromas cargados** y con `reemplazar` **borré 43** (Abismo,
  Acqua, Barbarella, Invictus, Libre, Paradise, Turbulence, Witch Night, Diva, Gold, Green, Hot…).
  Se restauraron los 71 en el momento leyéndolos del log del propio comando, pero el error no fue
  el comando: fue mirar solo la última línea. Los probes imprimen el ANTES justamente para eso.
- **"Armar caja" no veía los aromas y por eso decía que no había que mandar nada.** El 19/08/2026
  el Paulvic tenía **97 u. en casa y Free Love en CERO en Full**, y la pantalla decía *"ninguna
  cuenta lo necesita: todas tienen para más de 30 días"*. Miraba el PRODUCTO entero: sumaba el
  stock de los 28 aromas y le daba de sobra. Dos cosas estaban faltando y las dos se arreglaron:
  el robot solo separaba el stock por variante cuando la publicación tenía el desplegable de ML
  adentro —y en el Paulvic **cada aroma es una publicación aparte**, así que nunca separó nada—, y
  el reparto de la oficina iba por producto. Ahora el stock por aroma se deduce del TÍTULO de cada
  publicación (misma regla en el robot y en la web, a propósito) y el reparto va aroma por aroma.
  **Regla nueva del reparto: una cuenta con CERO unidades siempre recibe, aunque "no lo necesite"
  por días de stock.** En cero no vende — eso no es reponer, es la diferencia entre vender y no.
- **La pantalla "Margen ML" tampoco descontaba bien el envío.** El 19/08/2026 mostraba **+47%** en
  el Ferrari Negro (costo full $33.867 · neto ML $49.687) cuando las ventas REALES de ese producto
  dejaban $41.490, o sea **22%**. Los $8.197 de diferencia eran justo el envío: `netoweb` tomaba el
  envío MÁS BARATO visto y ahí daba casi cero. Corregido: ahora usa el PEOR caso. Y los productos
  que nunca vendieron —donde no hay ningún envío que deducir— salen marcados **SIN ENVÍO** en
  ámbar, porque su margen se ve más alto de lo que va a ser. Antes ese caso salía callado, igual
  que cualquier otro. Es el tercer lugar con el mismo error en un día: **cuando aparezca un margen
  sospechosamente alto, lo primero que hay que mirar es si esa cuenta descuenta el envío.**
- **`hermanas` no descontaba el envío y por eso mentía feo.** El 19/08/2026 mostraba **57%** de
  margen en el perfume De La Patagonia cuando el margen real de esa misma publicación era **32%**:
  hacía la cuenta `precio − comisión` y listo, sin envío ni cuotas. O sea, el margen de una venta
  que no paga envío, que no existe. Un número así hace pensar que una publicación está holgada
  cuando está justo en el filo. Corregido: ahora usa el envío del PEOR caso llamando a la misma
  función que `bajopiso` y `unapub`, y cuando no hay ventas para deducirlo muestra "?" en vez de
  inventar. Lección general: **si dos comandos dan márgenes muy distintos para la misma
  publicación, no es que "midan cosas distintas" — hay uno que está mal. Mirar la fórmula.**
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

## BORRAR CÓDIGO A OJO ROMPIÓ LA APP DOS VECES SEGUIDAS (21/08/2026)

Al sacar la pantalla "Envíos a Full" se borró `renderEnviosFull` buscando **"el próximo cierre de
función"** con una expresión regular. Cortó de más y se llevó puestas cuatro funciones que no tenían
nada que ver: `calcArqueo`, `efectivoCostP`, `getHistCostUSDProd` y `renderReconciliacion`.

`calcArqueo` la usa media app. Sin ella, **la pantalla tiraba error en pleno dibujado y las ventas
aparecían vacías**. Él lo reportó así: *"la nueva actualización rompió las ventas"*.

Y al restaurarlas se repitió el error en chico: se empezó a copiar desde la primera función, pero
justo arriba había una variable suelta (`let _arqViewYM=null`, la usan 25 lugares) que también se
había ido. Segunda rotura: Resumen, Métricas y Arqueo.

**Lo que NO sirve para detectarlo:** el chequeo de sintaxis. El archivo quedaba perfectamente válido
las dos veces — solo que sin pedazos.

**Lo que SÍ sirve, y hay que correrlo ANTES de subir** cualquier borrado grande en `index.html`:
comparar contra la versión anterior las **tres listas** —funciones, `const`/`let` de nivel superior,
e `id="..."`— y revisar que lo único que falte sea exactamente lo que se quiso sacar.

```
git show HEAD:index.html > /tmp/viejo.html   # y comparar los tres conjuntos
```

Regla simple: **para borrar un bloque hay que marcar dónde empieza Y dónde termina a mano.** Buscar
"el próximo }" es adivinar dónde termina algo.

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
  El Cargador notebook **ya está resuelto** (se vinculó el 18/08, ver abajo). Balanza persona y
  Bioxidil tienen la publicación cerrada (ver abajo).
  Los otros siete —Separador dedo Gordo, Calculadora, Bola Cristal, Filtro Con precito, Alargue
  Zapatilla Hub USB 220, Dermaglos Facial Ultra Volumen, Batidora 1 Cabezal— **necesitan que se
  publiquen**, no que se revinculen. Falta que él diga cuáles quiere publicar.
- **Las publicaciones sin producto ya están resueltas** (18/08/2026). Eran 81 en el conteo del
  robot, pero **71 estaban dadas de baja**: renglones viejos de `cyc/mllinks`, nada para hacer.
  De las 10 vivas él decidió: `MLA1474825987` (Cargador Universal Laptop, Ayelen) → vinculada al
  producto **Cargador notebook** (`p1782926072704`), y **seis marcadas "no las vendemos más"** con
  el comando `nomas` — Espumador de leche, los dos Playstation VR 2, los dos Redmi Note 15 y el
  **Masajeador Bola de Hielo**. Quedan dos sin decidir: `MLA1504814419` y `MLA3127034782`, los dos
  **Termómetros de heladera**, que están **EN REVISIÓN de ML con 2 unidades cada uno** — mismo tema
  que el "Bare Vanilla": ML pide documentación. Él dijo "no dar bola todavía".
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
