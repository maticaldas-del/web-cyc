
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
| `ponmedida:<busca>\|<L>x<A>x<H>\|<peso>[;otro][;go]` | carga a mano el paquete (medidas y peso) de lo que ML no informa · sin eso el producto no entra en las barras de Armar caja |
| `vincular:<MLA>=<palabra\|id>[:go]` | pega una publicación a un producto y la saca de oculta |
| `nuevoprod:<nombre>[\|costo=][\|mla=][\|go]` | da de alta un producto nuevo y lo vincula · avisa si ya hay una ficha parecida |
| `fijarvar:<MLA>=<variante>\|…[\|go]` | dice a mano de qué color/aroma es cada publicación cuando el título de ML no lo nombra igual que la ficha |
| `pausar:<busca>[!<saca>][:go]` | pausa varias de una · palabras con `+` · **mirar la lista antes** |
| `cargargasto:<fecha>\|<monto>\|<cat>\|<desc>[\|prov=][\|fact=][\|cae=][\|go]` | carga un gasto con su comprobante |
| `subirrecibidas[:go]` | sube las compras de ARCA a Facturas → Recibidas (lee `ml-sync/recibidas.json`) |
| `porquepedido:<palabra>` | **por qué Pedidos dice lo que dice**: claves crudas de inventario, ventas, días con stock y qué camino toma la cuenta |
| `revisarpedidos` | barre TODO: claves de inventario basura + pedidos que ya no coinciden con la realidad de hoy |
| `limpiarclaves[:go]` | borra las claves de inventario basura (cuentas mal escritas, negativos, productos que no existen) |
| `ordenped[:cuántos]` | compara el orden de Pedidos Bs As antes y después de medir sobre los días con stock |
| `liquidar[:días]` | **qué mercadería conviene rematar**: separa muerto de sobrecomprado y de caja perdida |
| `probaralmacena[:MLA]` | **prueba si ML publica el almacenamiento por producto** · 13 rutas candidatas por cuenta |
| `patagoniako[:go]` | parte "De la Patagonia" en dos fichas por el costo distinto del KO UNISEX |
| `frenados[:díasStock]` | si conviene bajarle el precio al stock parado, con la cuenta hecha |
| `bajarcaja[:días][:piso][:maxBaja]` | qué bajar **poquito** para que vuelva a vender: las que tienen stock, no venden y perdieron la caja de compra por poca plata · **sale solo en el chequeo de las 8** |
| `proyec[:retiro][:tasa]` | cuánto le queda a CYC por mes |
| `retiromes[:monto]` | el retiro de los dueños que se carga solo el 1º de cada mes · `:probar:<mes>` para ver qué haría |
| `cajasllegaron[:go]` | marca las cajas que ya entraron a Full · **sale sola una vez por hora** |
| `variantes:<palabra>` | qué variantes tiene un producto y el título real de cada publicación, para cargar las que falten |
| `sinvincular[:cuenta]` | las publicaciones que NO tienen producto: el robot no les ve stock ni margen |
| `altanuevas[:go]` | las publicaciones nuevas que el panel todavía no conoce, con la ficha a la que se engancharían · **el robot lo hace solo cada hora**, esto es para mirarlo antes |
| `nomas:<MLA,...>[:go]` | "esto no lo vendemos más": oculta la publicación del panel · no toca nada en ML |
| `nomandar:<cuenta>[:<palabras>][:go]` | "este producto no se vende más en ESTA cuenta": la saca del reparto de Armar caja · nombre con `=` adelante = exacto · sin `:go` solo muestra |
| `preguntas[:cuenta]` | las preguntas sin responder ENTERAS, con el producto de cada una |
| `facarca` | lo facturado en la ventana que mira ARCA, por cuenta |
| `catmono[:fecha]` | qué categoría de monotributo corresponde |
| `frenazo:<cuenta>` | por qué una cuenta dejó de vender |
| `netoweb` | calcula lo que deja cada producto al precio de hoy y lo carga en Margen ML |
| `netoref[:borrar]` | los netos escritos a mano que tapan el real, y sacarlos |
| `raizsucia[:go]` | qué quedó escrito fuera de `cyc/` por el bug de prefijo |
| `pubaviso[:borrar]` | de qué publicaciones ya se avisó "problema", para que no repita |
| `tgchats` | quién recibe los avisos de Telegram · **solo lee, no manda nada** |
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

### Cómo leer el resultado de un comando SIN gastar tokens al pedo

**El chequeo de la mañana se lee del ARCHIVO, no de GitHub.** Queda guardado en `chequeo/ultimo.txt`
del repo: `git fetch` + `cat`, 126 líneas. Listo.

**NUNCA usar la lista de corridas de GitHub (`list_workflow_runs`) para encontrar un resultado.**
Esa llamada devuelve las últimas ~25 corridas **con el mensaje de commit COMPLETO de cada una**, y
los commits de este repo son largos a propósito. Son ~20.000 tokens por llamada y no hay parámetro
que la achique (`per_page` lo ignora). El 30/08/2026 se pidió 5 veces en una mañana: **~100.000
tokens tirados** para sacar un número de corrida.
Lo que sí sirve: `list_workflow_jobs` con el id de la corrida, y `get_job_logs` con `tail_lines`
chico. La salida de los probes va toda al final del log, así que con 30 o 40 líneas alcanza.

**EL REPO ES PÚBLICO Y LOS REGISTROS DE GITHUB TAMBIÉN.** Verificado el 30/08/2026 (`private:false`).
O sea que todo lo que un probe imprime en pantalla queda en una página que puede leer cualquiera.
Por eso `chequeo/ultimo.txt` NO lleva números de orden ni el texto de las preguntas — eso ya estaba
pensado. Pero `posventa` sí imprime los mensajes de los compradores con su número de paquete, y esos
quedaron públicos. **No correr `posventa` salvo que él lo pida**, y no meter datos de compradores en
ningún archivo del repo.
Pasarlo a privado NO es gratis: en repos públicos GitHub no cobra el tiempo de las corridas y en
privados sí, con tope mensual — con el robot corriendo cada 2 minutos ese tope se pasa enseguida.
Queda como decisión suya.

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
| 1 vez por hora | da de alta las publicaciones nuevas de ML y las engancha a su ficha |
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

**La caja tiene DOS límites y se ven los dos: 70×70×70 y 30 kg** (27/08/2026, pedido suyo). Arriba
de "Armar caja" van dos barritas —lugar y peso— con lo que llevás puesto. Van las dos y no una
sola de "qué tan llena está" porque llenar uno desperdicia el otro: las sábanas gastan lugar y no
pesan, las cartas pesan y no ocupan. Mirando las dos se ve qué le falta a la caja.
**Y la casilla de cada renglón NO deja pasarse**: el tope de cada una es lo que hay en casa, menos
lo apartado en las cajas de las otras cuentas, menos lo que ya ocupa el resto de ESTA caja.
El lugar se mide como FRACCIÓN de caja (cada unidad gasta `1/porCaja`), nunca como volumen:
343.000 cm³ de mercadería no entran en 343.000 cm³ de caja porque quedan huecos, y contando
cuántas entran por lado el hueco ya está descontado. Es la MISMA cuenta que usa `cajaSugerida`, a
propósito — si el medidor contara distinto del que arma la caja, la barra diría 80% en una caja
que el algoritmo ya dio por llena.
**Lo que no entró no se avisa**, decisión suya: *"si sobra no decir nada, me daré cuenta una vez
que ya envíe la caja, que siga recomendándome más mercadería"*. El sobrante no se pierde: queda en
la oficina y vuelve a salir sugerido en la caja siguiente.
**Ojo con las medidas que faltan:** lo que no tiene largo/ancho/alto o peso cargado NO entra en las
barras y se dice en pantalla, porque una barra que muestra media caja cuando está llena es peor que
no tener barra. Las carga solas el robot con `bajarmedidas`; lo que se escribe a mano en la ficha
queda marcado `fuente:'mano'` y el robot no lo pisa.
**El error que se cometió al hacerlo, para no repetirlo:** `cajaCabenDe` devuelve el TOTAL que
entra de ese renglón (se descuenta a sí mismo del cálculo), no un incremento. La primera versión le
sumaba encima lo que el renglón ya tenía puesto y dejaba cargar el DOBLE. Compilaba perfecto y en
pantalla no se notaba: lo agarró probar la cuenta con números inventados antes de subir.

**Lo que se sugiere mandar cubre 44 días, no 30.** Regla suya del 19/08/2026: desde que se arma
la caja hasta que la mercadería se puede vender pasan unos **14 días** —~7 hasta que la caja sale
y ~7 más hasta que ML la activa en Full— y en el medio la cuenta sigue vendiendo de lo que ya
tiene. Mandar para 30 días hace que la caja llegue justo cuando la publicación se quedó sin nada.
Los dos números están en `index.html` como `REPO_DIAS_COBERTURA` (**45**) y `REPO_DIAS_DEMORA` (**8**:
él corrigió el 20/08 que en la práctica el viaje son 8 días, no 14).

**UNA CAJA A MEDIO ARMAR RETIENE MERCADERÍA, Y AHORA SE VE.** Lo planteó él el 27/08/2026:
*"si no se cierra una caja no deja mercadería para una segunda no?"*. Es así, y es a propósito: el
stock de la oficina no baja hasta cerrar, así que lo cargado en una caja queda APARTADO y las otras
tres cuentas no lo pueden usar (`cajaMax` ← `reservadoEnOtras`). Sin eso, dos cajas podrían pedir
las mismas unidades y al cerrarlas faltaría mercadería.
El problema no era la regla sino que **no se veía**: lo único que lo decía era el "(N en otra caja)"
de cada renglón, que hay que ir a buscar entrando a la cuenta correcta. Una caja olvidada retenía
unidades para siempre sin que nada lo dijera. Ahora arriba de "Armar caja" hay un desplegable con
TODAS las cajas abiertas, cuántas unidades aparta cada una, hace cuánto, y el botón para vaciarla
—que pregunta antes, porque tira trabajo hecho a mano—. Va en color normal a propósito: tener una
caja armándose no es un problema, esconderla sí.

**El buscador de Armar caja filtra SOLO la lista de productos.** Las dos barras, el botón de cerrar
y el cartel de "conviene mandarla" se siguen calculando con la lista COMPLETA. Si el buscador los
moviera, escribir "balanza" haría que el botón dijera *"Cerrar esta caja · 4 u."* teniendo 301
adentro — y ese botón despacha de verdad. Misma decisión que en Rotación de Stock y por lo mismo.

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

## PUBLICACIONES NUEVAS: LAS CREA ÉL EN ML, LA FICHA LA CREA CLAUDE (26/08/2026)

Norma suya, textual: *"a partir de ahora te voy a ir pasando publicaciones nuevas que creo en ml
para que vos la crees y vincules en la web de cyc"*.

O sea: **él publica en ML** (fotos, categoría, título, precio) y **Claude da de alta la ficha en el
panel y la vincula**. Claude NO crea publicaciones en ML — el robot sólo sabe modificar las que ya
existen, nunca hizo un alta, y publicar sin costo cargado rompería la regla del piso del 30%.

El comando es `nuevoprod:<nombre>[|costo=<pesos>][|mla=<MLA>][|go]`.

**DESDE EL 30/08/2026 EL PANEL LAS RECONOCE SOLO.** Pedido suyo, textual: *"quiero que el panel
reconozca todos los productos nuevos aunque se hayan vendido — sino es un lío, quiero cargar una caja
y si el producto es nuevo tengo que decirte a vos"*. Una vez por hora el robot enumera los cuatro
catálogos de ML, da de alta lo que falta en `cyc/mllinks` y lo engancha a su ficha con el MISMO
match que ya usan las ventas (`matchProduct`: dos palabras distintivas y un ganador claro; ante la
duda la deja sin producto y la lista para vincular a mano). La variante sale del título.
Antes de eso una publicación entraba al panel **sólo cuando vendía**, así que hasta la primera venta
no tenía stock de Full, ni margen, ni caja de compra, y **no aparecía en Armar caja**.
El freno: mientras no haya vendido queda marcada `altaSinVender` y `activarPausadasFull` no la toca
— su costo lo eligió el match por el título y todavía no lo probó ninguna venta real. La marca se
cae sola en cuanto vende. Para mirarlo antes de que pase: `altanuevas`.

**Lo que SIGUE necesitando que él avise: el producto que no tiene ficha.** Si el título no engancha
con ninguna, no hay de dónde sacar un costo y nadie lo puede inventar. Ahí va `nuevoprod`.

**Lo que hay que pedirle cada vez:**
1. **El número MLA** (o el link) — sólo si no querés esperar la vuelta de la hora.
2. **El costo de compra.** Si no lo tiene todavía, se puede crear igual con costo 0 —él eligió eso
   el 26/08— pero **hay que decírselo**: hasta que llegue el costo el producto se ve como si fuera
   todo ganancia y puede aparecer arriba de todo en Rotación de Stock como si fuera un éxito.
   Se corrige después con `poncosto:<id>|<pesos>|go`.

**Y después de vincular va `netoweb`**, si no el producto sigue mostrando "—" en el panel.

## Cosas que ya pasaron (para no repetirlas)

- **UN SOLO TROPIEZO DE LECTURA BORRABA A UN DESTINATARIO DE TELEGRAM, EN SILENCIO (27/08/2026).**
  Su viejo dejó de recibir los resúmenes el 22/08 y se descubrió cinco días después, porque él lo
  contó. Los envíos NO fallaban: había **desaparecido de la lista de suscriptos**, y el robot ni
  siquiera intentaba mandarle.
  El motivo estaba en `resolveTgChat`: armaba la lista en memoria y, si la lectura de la guardada
  fallaba, **seguía de largo con el catch vacío** y el objeto vacío. Después le sumaba lo que
  devuelve `getUpdates` —sólo mensajes de las últimas ~24 h— y guardaba con `set`, que **pisa el
  nodo entero**. O sea que un tropiezo de lectura dejaba únicamente a los que le habían escrito al
  bot ese día. Mati se salvaba porque le escribe seguido.
  Arreglado con dos cosas: si la lectura falla **no se escribe nada**, y el guardado va con `patch`
  y **sólo los nuevos**, así no puede sacar a nadie ni con la lectura incompleta. Además cada
  corrida imprime cuántos suscriptos hay y quiénes, para que una baja se vea el mismo día.
  **La lección general: un `catch {}` vacío antes de un `set` que pisa el padre es una bomba.** El
  dato no se pierde con ruido, se pierde en silencio. Es el mismo patrón del bug de `cyc/mllinks`
  del 05/08. Para mirar la lista sin despertar a nadie: `tgchats`.

- **EL AVISO DEL DÓLAR NUNCA SALIÓ: NO DECLARABA SU TIPO (27/08/2026).** El dólar pasó de $1.510 a
  $1.535 (+1,66%), el robot lo actualizó bien en el panel, y a Mati no le llegó nada por Telegram.
  Lo contó él. **No fallaba el envío ni la lista de suscriptos** —eso era el bug del 22/08, otro—:
  el mensaje se tiraba ANTES de intentar mandarlo.
  `sendTelegram(texto, tipo)` filtra por el segundo parámetro contra `TG_PERMITIDO`, y el que no lo
  declara cae en el `no se manda` y se pierde en una línea del log. El aviso del dólar llamaba
  `sendTelegram(rd.msg)` **sin el tipo**, así que `tipo` quedaba `undefined` y no salió nunca ni uno.
  Arreglado: se agregó `'dolar'` al conjunto y la llamada lo pasa.
  **Ojo con lo que queda igual a propósito:** los avisos de precios (subidas, bajadas, promos
  sacadas, "problema en una publicación") tampoco declaran tipo y por lo tanto tampoco salen — eso
  SÍ fue una decisión, para que el robot no mande un mensaje por cada cambio de precio. Y `'baja'`
  está en el conjunto pero **ningún llamado lo usa**, así que hoy lo único que sale de verdad es el
  resumen. Si algún día se quiere prender alguno, hay que agregarle el tipo a la llamada.
  **La lección: un filtro que descarta por omisión es un filtro que apaga cosas en silencio.** El
  que escribe un aviso nuevo no se entera de que existe el tipo hasta que alguien pregunta por qué
  no le llegó. Es el mismo patrón que el `catch {}` vacío: el dato no se pierde con ruido.

- **"MUERTO" CONFUNDÍA MERCADERÍA RECIÉN LLEGADA CON MERCADERÍA PARADA HACE MESES (02/09/2026).**
  Él lo marcó: *"me marca los 8 en 1 como que están muertos y tengo un montón. pero acaban de llegar
  a ml. no es lo mismo que un producto que está hace 2 meses con stock y no vende nada hace 1 mes."*
  El estado salía SOLO de ventas ÷ stock, así que una caja que llegó ayer daba el mismo rojo que
  mercadería parada hace medio año — y los remedios son opuestos: a una hay que darle tiempo, a la
  otra bajarle el precio o rematarla. La única gracia que había eran 7 días desde `restockTs`, un
  campo que sólo se escribe cuando el robot ve el stock pasar de cero.
  Ahora hay **🆕 Recién llegado hasta los 30 días** (`ROT_GRACIA_DIAS`) y no cuenta como capital
  muerto, y al lado del estado va el aviso de almacenamiento: *"empieza a pagar en N d"* en ámbar y
  *"paga almacenamiento hace N d"* en rojo (`ALMAC_DIAS` = 60). Va pegado al estado y no en una
  columna aparte porque él dijo que lo único que mira es cuando algo se pone naranja.
  **Sólo con fecha REAL de entrada.** `diasEnStockDe` puede devolver una fecha aproximada (cuando el
  robot empezó a anotar el producto ya tenía stock): decir "recién llegado" sobre eso taparía justo
  la mercadería más vieja, que es la que está pagando. Sin fecha real no se opina.
  Y la clasificación pasó a vivir en **una** función (`rotEstadoDe`): estaba copiada en la tabla y en
  el puntaje de Inicio, así que la tabla podía decir "Reciente" mientras el puntaje contaba ese
  mismo producto como capital muerto.

- **EL % DE MÉTRICAS NO SE GUARDA POR VENTA: SE CALCULA AL ABRIR LA PANTALLA (02/09/2026).**
  Pregunta suya: *"los % del 25% no se aplicó a todas las ventas desde mayo... me va a mostrar que
  venía a un 40% y pasé a un 32% cuando en realidad el % es el mismo"*. **No hay nada que migrar.**
  El % sale de `neto` y `costo` en el momento, así que cambiar la fórmula recalcula mayo igual que
  hoy: la comparación contra el período anterior y el gráfico siguen siendo honestos, sin escalón.
  El divisor quedó en **una** función (`metCostoPctDay`) — estaba escrito cinco veces (tarjetas,
  promedio y las dos vistas del gráfico) y con cinco copias las tarjetas podían decir un número y el
  gráfico otro sobre los MISMOS días.
  Lo que sí cambia de criterio: la gestión de Full sale del costo de **hoy** del producto, no de lo
  que ML cobró en aquella venta. Es la misma convención que ya usaba `efectivoCostoVP` para el envío
  y el embalaje, no una excepción nueva.

- **PEDIDOS: "PAUSADO POR PRECIO", UN ESTADO QUE SE REVISA SOLO (02/09/2026).** Planteo suyo:
  *"hay productos que están en 'pedidos' que el precio no da... pero me sigue diciendo que es el
  mayor error, cuando en realidad no depende taanto de nosotros"*. Un producto que no se repone A
  PROPÓSITO sumaba plata en riesgo y hundía el Puntaje del mes como si fuera un olvido.
  Es una lista aparte de la papelera y no la misma: la papelera es "esto no se vende más" y a los 7
  días es definitiva; esto es "no lo compro POR AHORA", y lo que cambia la decisión es un número que
  se mueve solo. El panel lo vuelve a medir en cada dibujado y **el número de la solapa se pone
  verde con un ✓** cuando alguno volvió a llegar al piso. Sin ese aviso la lista se convertiría en
  un cementerio. Vive en `cyc/pausado_precio/<prodId>`.

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
- **La pantalla "Margen ML" YA NO EXISTE: está adentro de la ficha del producto** (24/08/2026,
  pedido suyo). En Productos, cada ficha tiene ahora la caja **Neto ML** al lado de "Costo vender
  en Full": el neto que dice ML al precio de hoy, el margen %, el neto que haría falta para llegar
  a la meta y las visitas. Arriba del listado quedó el resumen (cuántos bajo la meta, cuándo se
  recalculó) y el botón **"Ver solo los que están bajo la meta"**, que es lo único que la pantalla
  vieja hacía y la ficha no. Todo sale de `mmlBoxHTML()`, que llama a `margenMLDe()` y `visitasDe()`
  — las MISMAS funciones que usa Rotación de Stock, para que no puedan discrepar.
  **Y las cuatro pantallas de datos se mudaron a Ajustes** como tarjetas desplegables: Facturación
  por mes y cuenta (monotributo), Dólar por mes, Precios históricos y Últimos cambios. Se dibujan
  al abrirlas (`ontoggle`), no al entrar a Ajustes.
  Al hacerlo se corrió el chequeo de las tres listas contra la versión anterior y lo ÚNICO que
  faltaba era lo que se quiso sacar: `renderMargenML`, los tres `id` de esa pantalla,
  `tab-margen-ml` y `tab-btn-monotributo`. Ese chequeo no es opcional (ver más abajo).
- **UNA FICHA NUEVA SIN VENTAS PUEDE TENER DOS COSTOS: el de la web y el del robot.** El
  24/08/2026 la ficha "De la Patagonia KO UNISEX" mostraba US$ 12,41 en pantalla y `unapub` decía
  US$ 12,51 — $151 de diferencia en el mismo producto. El motivo: la web **siempre** recalcula
  (`costFullUSDof`: costo × (1+%reclamos) + envío), pero `costoPesos()` del robot solo recalcula si
  el producto tiene reclamos en vivo; **sin ninguna venta cae en el `costFullUSD` guardado**, que
  en una ficha recién creada puede tener cualquier resto viejo adentro. Se arregló haciendo que
  `patagoniako` lo escriba explícito. **Regla para cualquier ficha que se cree desde un probe:
  escribirle `costFullUSD` a mano, no dejarlo librado.** Verificado: el costo pasó de $21.561 a
  $21.410 y el margen de 50,1% a 51,2%, que es el que muestra la web.
- **"Costo vender en Full" (ficha) y "Costo full" (Margen ML) NO son el mismo número, y los dos
  están bien.** El 24/08/2026 él marcó los dos perfumes De la Patagonia: la ficha decía $29.984 y
  Margen ML $24.364. La diferencia son los **$5.620 de gestión de Full** (`gestFull`, el cargo
  `shp_fulfillment` que Mercado Pago descuenta en cada venta). La ficha la SUMA porque ahí el número
  se compara contra el **precio**; Margen ML NO la suma porque el **neto ya la trae descontada** —
  el neto es precio − comisión − envío del peor caso, y ese envío ES la gestión de Full. Sumarla en
  Margen ML contaría el envío dos veces y hundiría todos los márgenes de mentira.
  Regla para no volver a dudar: **la gestión de Full se suma al COSTO o se resta del PRECIO, nunca
  las dos cosas.** Las dos cajas ahora lo dicen en pantalla.
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
- **EL FERRARI NEGRO SE BAJÓ ABAJO DEL PISO, CON SU AUTORIZACIÓN EXPRESA (25/08/2026).**
  `MLA1771184347` (Adriana) pasó de **$61.980 a $59.900**. El piso del 30% de esa publicación es
  $61.200, así que quedó en **~27,4%**. Él lo pidió tres veces, con el número del margen a la
  vista. **No es un permiso general: fue para esta publicación y este día.**
  Resultado, releído de ML: la caja de compra pasó de **PERDIENDO a GANANDO**. No a "compartiendo",
  que era lo que él pedía — compartir no se puede elegir, lo decide ML.
  **La explicación de por qué ganamos teniendo dos vendedores a $53.900:** esos dos **no están
  compitiendo** (sin stock o no califican). Por eso ML pedía $59.966 y no $53.900. **Si alguno se
  reactiva, se pierde la caja y quedamos con el margen bajo sin la ventaja** — hay que mirarlo.
  **Y el agujero que salió a la luz: `volver` NO pasa por el freno del piso.** En una publicación
  sin variantes hace un PUT directo a ML, salteando `setPriceTo` y `_chequeoPiso`. O sea que la
  frase "setPriceTo es la ÚNICA función que baja precios" **no es cierta hoy**. Con variantes sí
  está tapado (`raiseVariations` se niega a bajar). Queda pendiente cerrarlo.

- **UNA CUENTA PUEDE NO QUERER UN PRODUCTO, Y EL PANEL NO TENÍA CÓMO DECIRLO.** El 24/08/2026
  miró Armar caja de Adriana y le aparecía medio catálogo: mercadería mezclada de un experimento
  que no funcionó. Textual: *"puede que tenga stock en full, que venda re bien, que vaya en otra
  caja, lo que sea. solamente NO se van a vender mas en ADRIANA"*.
  Lo que los hacía aparecer es la regla **"una cuenta en CERO siempre recibe"** (19/08/2026), que
  es correcta para algo que se vende y pésima para algo que esa cuenta no piensa vender más.
  Se marca en `cyc/norepo/<prodId>__<cuenta>` y la web saca esa cuenta del reparto. Es **por
  producto×CUENTA a propósito**: el mismo producto sigue reponiéndose donde sí funciona. NO borra
  la ficha —las unidades siguen contando en el Arqueo— ni toca el stock, ni ML, ni las ventas
  viejas. Abajo de Armar caja queda el desplegable con lo que se sacó y el botón para deshacerlo:
  una lista que esconde renglones sin decirlo es una lista que miente.
  **Dos cosas que salieron mal en el camino y conviene no repetir:**
  · Al principio el botón se puso en CADA renglón de las CUATRO cuentas. Él lo cortó en seco:
    *"esto esta mal. solo era lo de adriana. no las otras cuentas. estaban bien las otras"*. Se
    sacó. **Un pedido sobre una cuenta no es permiso para tocar la pantalla de las otras tres.**
  · El filtro por palabras agarró **42 productos cuando se pidieron 32**: "metatarso" traía
    *Metatarso Fuerte*, "P47" traía *p47 oreja gato*, "Cortapelo 1 en 1" traía el *a pila*,
    "Batidora" traía *Batidora 1 Cabezal* y "Cruzer Blade" traía los pendrives de 8/16/32/128gb.
    Por eso `nomandar` acepta el nombre con **`=` adelante = coincidencia exacta**. Es la misma
    lección del 15/08 con las tarjetas de memoria, otra vez: **mirar la lista de la prueba antes
    de aplicar.**
  Marcados en Adriana el 24/08/2026: 32 productos. La **balanza equipaje tiene 2 u. adentro del
  Full de Adriana** y se van a seguir vendiendo hasta que se acaben — marcar no retira stock.

- **EL COLOR ES UNA SEÑAL, NO UN ADORNO — Y LO IMPORTANTE VA PRIMERO.** El 26/08/2026 él marcó
  Finanzas: *"lo más importante de esa página es el total y se ve menos que lo que cobramos con mi
  viejo"*. Dos cosas estaban al revés y las dos se repiten fácil:
  · **El orden.** El patrimonio total estaba ABAJO DE TODO, después de quince casillas de carga.
    Ahora abre la pantalla, con las cuatro tarjetas que lo forman debajo, y recién después las
    casillas. Regla: **primero la conclusión, después el detalle, al final lo que se carga.**
  · **El color.** La etiqueta del retiro estaba en ámbar y la de "Corregir" en azul — dos campos de
    carga pintados como si avisaran algo, mientras el total tenía la etiqueta en gris. El ámbar y
    el rojo son para lo que AVISA (deudas, "solo lectura", "se cuenta dos veces"). **La importancia
    se muestra con el TAMAÑO, no pintando etiquetas**: el total pasó de 1,5rem a 2,3rem y los dos
    campos volvieron a etiqueta común.
  Él autorizó usar color en las letras (*"si querés podés usar colores en letras"*), pero eso no es
  permiso para pintar todo: cuando todo está pintado, nada resalta.

- **DOS ERRORES EN EL MISMO COMANDO NUEVO (`liquidar`), Y NINGUNO SE NOTABA.** El 24/08/2026, al
  armar la lista de qué rematar:
  · **La caja de compra se guarda como TEXTO, no como objeto.** El robot escribe
    `cyc/mllinks/<MLA>/caja = 'losing'`, y yo leía `caja.st`. Resultado: el grupo "perdieron la
    caja" daba **0 productos**, y un cero así **parece una buena noticia** — no se nota. Lo que lo
    delató fue desconfiar del número: 0 de 137 era demasiado lindo.
  · **Perder la caja NO alcanza para rematar.** Al arreglar lo anterior, el comando mandó a la
    lista de remate a TODO el que tuviera la caja perdida, vendiera bien o no: pasó de 5 productos
    a **27 y $5.940.189**, con la balanza de equipaje adentro (vendió anteayer). Perder la caja
    recién importa cuando ADEMÁS el stock no rota (>120 días). Con las dos cosas juntas: 15
    productos · $2.767.075.
  **La lección: un comando nuevo hay que leerlo con la misma desconfianza que a los viejos, y un
  grupo que da CERO merece tanta sospecha como uno que da de más.**
- **EL PROVEEDOR NO TARDA LO MISMO SEGÚN DE DÓNDE VENGA, Y EL PANEL LOS TRATABA IGUAL.** Plazos
  que él pasó el 24/08/2026: **Bs As 1 semana · Paulvic 1 semana · Paraguay 2 MESES**. Hasta ese
  día el origen sólo decidía en qué pestaña aparecía el pedido; no cambiaba ninguna cuenta. Con 2
  meses de viaje eso deja el aviso inservible: un producto de Paraguay con 20 días de stock salía
  **amarillo** cuando ya estaba condenado a ~40 días sin vender aunque se comprara esa tarde. Y la
  otra mitad es peor — comprando cada 2 meses **para 30 días** te quedás corto siempre, por diseño.
  Números elegidos por él: **Paraguay rojo a 50 días y comprar para 95**; Bs As y Paulvic quedan
  en 14 y 30. Están en `index.html` como `PED_DIAS_ROJO_PY` / `PED_TARGET_PY` y se aplican con
  `pedDiasRojoDe(p)` / `pedTargetDiasDe(p)`.
  **El Paulvic NO entra en el plazo de Paraguay** aunque su ficha esté marcada `origen:'py'`: viene
  en una semana. Lo separa `esPaisLento()` usando `esProductoPaulvic()`.
  Ojo con no confundir dos plazos que se parecen: `REPO_DIAS_DEMORA` (8 días) es el tramo
  caja→Full y es igual para todos, porque sale de la misma oficina. Este otro es el del PROVEEDOR
  y arranca antes, cuando todavía hay que comprar la mercadería.
- **LA PLATA YA NO ES EL LÍMITE: EL PROVEEDOR SÍ.** Dicho por él el 24/08/2026: *"siempre el límite
  fue el dinero, pero hoy es el proveedor"* — hacen falta $3.400.000 para reponer y hay $5.000.000.
  Importa para la pregunta de qué mercadería conviene rematar: **con plata sobrando, liberar caja
  vale mucho menos** de lo que parece, porque no se puede gastar ni lo que ya está. Lo que manda
  entonces es el almacenamiento de Full, el reloj del descarte y el lugar que ocupa. El argumento
  de "esa plata rinde en otro lado" vuelve a pesar recién cuando el proveedor tenga stock.
- **UN PEDIDO CARGADO A MANO QUEDABA CONGELADO PARA SIEMPRE.** El 24/08/2026 él marcó *"error
  grave"*: el Termómetro pincha pedía comprar 31 con urgencia teniendo **30 en Full y 150 en la
  oficina** — y lo probó mostrando una venta de ese mismo día. `stockreal` decía que el panel y ML
  coincidían, así que el problema no era el stock sino **quién lo lee**. Con `porquepedido` y
  `revisarpedidos` salieron dos cosas:
  · **El pedido era `auto:false`.** La limpieza de pedidos obsoletos filtra `arr.filter(x=>x.auto)`
    y la actualización sólo escribe los `auto`: un pedido a mano no lo toca NADIE. Ese estaba
    escrito desde el 27/06 con "0 en stock". Ahora se le refresca la nota y la plata en riesgo (la
    CANTIDAD y el ESTADO no se pisan: los puso él), avisa *"con lo que tenés alcanza"* cuando la
    cuenta da comprar 0, y la tarjeta lo marca **· a mano**.
  · **`stockOf` sumaba TODA clave que empezara con el id del producto**, sin mirar de qué cuenta
    era. En la base hay **13 claves basura** con el nombre de cuenta en MAYÚSCULA y cantidades
    NEGATIVAS (`p1779912655880__AYELEN = −1` y 12 más), y se sumaban igual — el Enchufe viajero
    llegó a mostrar **"−1 en stock"**. Ahora suma las 4 cuentas una por una con `Math.max(0,…)`.
    Se limpian con `limpiarclaves[:go]`; `revisarpedidos` las lista y comprueba que el arreglo
    sólo SUBA stocks (si alguno bajara, habría stock bueno en una clave rara).
  **La lección: cuando un número de la pantalla no cuadra, `stockreal` dice si el dato está bien
  guardado, pero no si quien lo lee lo lee bien. Son dos preguntas distintas.**
- **El ROJO de Pedidos no se hablaba con la demora del viaje.** Un pedido se pintaba rojo con 7
  días de stock o menos, pero la caja tarda 8 días en llegar y activarse (más lo que tarde comprar
  la mercadería). O sea que el AMARILLO podía significar "ya está condenado a cortarse": las Cartas
  Casino tenían 10 días de stock, salían amarillas, y en 10 días no llega ni la caja. Planteo suyo
  del 24/08/2026 y aprobado el mismo día — el umbral pasó a **14 días**, en `PED_DIAS_ROJO`. Ahora
  el rojo quiere decir *"si no lo comprás AHORA, se corta sí o sí"*.
  Va aparte de `REPO_DIAS_DEMORA` a propósito: aquel mide sólo el tramo caja→ML, y este arranca
  antes, cuando todavía hay que comprar.
- **El ORDEN de Pedidos tenía el mismo error del 20/08, y encima la corrección no llegaba a
  aplicarse.** Planteo suyo del 24/08/2026: el padre compra las primeras de la lista y deja la
  cola, *"y cada vez hay más publicaciones inactivas"*. Dos cosas estaban mal, las dos medidas con
  el comando nuevo `ordenped`:
  · **`pedGananciaNorm` dividía por 30 fijo.** Es el número que define el orden. Un producto
    agotado 25 de 30 días figuraba ganando SEIS VECES MENOS → caía al fondo → no se compraba →
    seguía agotado. Es la misma corrección que se hizo en las unidades y acá había quedado sin
    hacer.
  · **`diasConStockProd` tomaba el máximo entre las CUATRO cuentas, y una cuenta sin registro
    devuelve el mes entero.** O sea que con que UNA de las cuatro no tuviera el producto, la
    corrección quedaba en cero. Al medirlo daba **0 de 37** productos corregidos: no se aplicaba
    nunca. El Joystick x3 lo mostraba entero — Adriana en cero hace 27 días y Matías hace 29, pero
    Luciana y Ayelen sin registro → máximo 30 → corrección cero. Ahora se miran sólo las cuentas
    con registro (una fecha "aproximada" SÍ cuenta: ahí hubo stock, sólo que no se vio entrar).
    Después del arreglo: **12 de 37**, y la Funda Cubre Colchón pasó del puesto 18 al 7 (×4,3).
  · Y la lista **ordenaba por `riesgo` mientras la tarjeta muestra `riesgoComprar`**. La Cinta
    7.5M salía 3ª con $116.792 y en la tarjeta decía $15.572. Ahora los dos usan el mismo número.
  **La lección que se repite: cuando un arreglo "no se nota", medir si de verdad se está
  aplicando antes de explicar por qué debería notarse.** Yo le dije que los agotados iban a subir
  y en ese momento no subía ninguno.
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

- **REBARBADOR MANUAL GIRATORIO: RESUELTO el 29/08/2026.** Él pasó el costo: **$1.505**. Se cargó con
  `poncosto:p1787783558381|1505|go` y quedó releído: US$ 0,98 de mercadería · full US$ 1,01 = $1.550
  (envío US$ 0,03 · 0% de reclamos).
  **La ficha YA EXISTÍA** (`p1787783558381`) y **la publicación también**: `MLA2039134465`, Ayelen,
  hoy **pausada**. O sea que la nota vieja de acá —"no se creó la ficha todavía, a propósito"— estaba
  desactualizada, y `nuevoprod` lo frenó solo antes de crear una repetida. Es exactamente para lo que
  está ese chequeo: **no confiar en lo que dice esta lista sin correr el comando y mirar.**
  Cuenta al precio de la competencia ($6.000, en Ayelen): neto ~$2.850 (comisión ~32% + cargo fijo
  $1.230) contra un costo total de ~$2.028 (mercadería + embalaje + IIBB 5,95% + monotributo) →
  **~40% de margen**. Cierra cómodo; el techo que se había calculado era comprarlo a menos de $1.900.
  Ojo: el ~32% es la comisión general, no la de esa categoría, y el número real recién sale de
  `unapub:MLA2039134465` cuando la publicación esté activa y venda.
  **Lo que falta es de él:** reactivar la publicación, fotos PROPIAS (las del screenshot son de otro
  vendedor) y el stock real.

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
  Los otros siete eran Separador dedo Gordo, Calculadora, Bola Cristal, Filtro Con precito, Alargue
  Zapatilla Hub USB 220, Dermaglos Facial Ultra Volumen y Batidora 1 Cabezal: **necesitan que se
  publiquen**, no que se revinculen. Falta que él diga cuáles quiere publicar.
  **El Alargue Zapatilla Hub USB 220 ya está resuelto** (24/08/2026): él pasó la publicación desde
  la app de ML y es `MLA1900463085` (Ayelen, activa, $8.850). Ya estaba vinculada a la ficha. Ese
  día `huerfanos` dio **0 de 137**, o sea que ninguno de los siete sigue en "—" — antes de darlos
  por cerrados hay que mirarlos uno por uno, porque la nota vieja decía otra cosa.
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
- **HAY UNA LISTA EN GASTOS DE LO QUE SE CARGA A MANO CADA MES** (28/08/2026, pedido suyo: *"que
  haya un lugar que me indique si se cargó los gastos del mes de las cosas que te tengo que pasar
  manual, para que al terminar el mes no falte cargar ninguno"*). Va arriba de los movimientos:
  ❌ rojo lo que falta, ✅ verde lo cargado con su monto. Se define en `GASTOS_DEL_MES`.
  Reconoce por categoría, y donde varias comparten categoría además por una palabra de la
  descripción (`pal`) o descartando una (`no`: "Servicios" excluye el Sancor). **Si un gasto se
  carga con otro nombre lo marca en rojo aunque esté**: es un falso faltante, a propósito — dar por
  cargado algo que falta sería mucho peor, y eso se dice en pantalla.
  Sólo se muestra en la vista por MES.

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
