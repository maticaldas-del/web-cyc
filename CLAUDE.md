
## PISO DURO: NINGÚN PRODUCTO SE BAJA POR DEBAJO DEL PISO CONFIGURADO

Regla suya, textual, del 20/08/2026: **"NUNCA BAJAR NINGUN PRODUCTO A MENOS DE 30%."** Ese 30 era
con la fórmula vieja y ya no rige. **Hoy el piso es 23% y la base a la que se sube es 25%**
(07/09/2026: *"acordate que la base es de 25% ahora. no 30 ni 32%"* y después *"dejalo 23/25%"*).
Antes de tocar cualquier precio, mirar el número que está en la base — NO el de esta línea:
cambió tres veces en un mes.

**El número NO está escrito en el código: vive en `cyc/mlconfig/minPct`** y se cambia con
`meta:<piso>:<meta>`. El robot lo lee al arrancar (`cargarPisoDuro`) y los comandos con
`pisoConfig(db)`. Si la lectura falla, cae en 30 — el lado seguro. Y por abajo hay un tope que no
se puede pasar ni configurando: **`PISO_MINIMO_ABSOLUTO` = 20%**.

No es una guía, es un freno en el código. Está en `setPriceTo`, que es la función que baja
precios en ML, y es OBLIGATORIO: quien quiera bajar tiene que declarar en qué margen queda
(`setPriceTo(mla, varId, precio, token, { margen })`).

  - Si no lo declara → NO BAJA. Un comando nuevo que se olvide del dato falla ruidoso.
  - Si queda abajo del piso → NO BAJA, y dice en cuánto habría quedado.

Por qué está ahí y no en cada comando: la regla vivía repartida en tres lugares y dependía de que
el próximo comando que se escribiera se acordara de aplicarla. Un solo olvido = vender perdiendo.
Es el mismo motivo por el que el número salió del código y se fue a la base: el 03/09 aparecieron
**ocho comandos con `|| 30` adentro** midiendo contra un piso que ya no existía.

**EL AGUJERO DE `volver` SE CERRÓ EL 17/09/2026, después de 23 días abierto.** Era el último camino
por el que un precio podía bajar sin que nada mirara el piso: en una publicación SIN variantes hacía
un PUT directo, salteando `setPriceTo` y `_chequeoPiso` (con variantes ya estaba tapado).
**`volver` ya no BAJA.** Sube o deja igual, y si le pedís un precio más bajo lo dice y manda a
`alpiso` o `bajarcaja`, que calculan el margen. **No se arregló calculando el margen adentro de
`volver`**: esa cuenta ya vive en esos dos comandos y una tercera copia es el error anotado seis
veces en este archivo. Es exactamente lo mismo que se le hizo a `fijar`, y por el mismo motivo:
un comando que pone un precio a mano sin calcular nada no puede bajar.

`fijar:<grupo>:<precio>` YA NO PUEDE BAJAR. Pone un precio a mano sin calcular ningún margen, o sea
bajaba a ciegas. Subir sigue funcionando igual. Para bajar: `bajarcaja` o `corregir`, que calculan.


## "ESTO LO ESTOY LIQUIDANDO: NO ME LO SUBAS" (12/09/2026)

Pedido suyo con el **Pendrive Sandisk 128g** (`MLA1787520621`, Matías), que vendió a **−5%**
(−$1.722): *"lo baje aproposito, hay que venderlo, porque nos van a cobrar por stock antiguo. pero
el bot quizas lo ve bajo y lo sube automaticamente."* Tenía razón — el robot mira el margen de cada
venta y, si cayó abajo del piso, sube el precio hasta la meta. O sea que **la PRIMERA venta de un
remate le deshacía la decisión**, justo cuando empezaba a funcionar.

Se marca con **`liquidando:<MLA o palabra>[:go]`** y vive en **`cyc/nosubir/<MLA>`**:

| comando | qué hace |
|---|---|
| `liquidando` | lista lo marcado, con stock y estado |
| `liquidando:<MLA\|palabra>` | muestra qué agarraría · **NO aplica** |
| `liquidando:<...>:go` | marca |
| `liquidando:-<...>:go` | saca la marca |

**El freno vive adentro de `raisePrice` y `raisePriceTo`** —las DOS funciones que suben precios en
ML— y no en cada comando, por el mismo motivo que el piso: la regla no puede depender de que el
próximo que escriba algo se acuerde.

**EL FRENO NO VIVÍA EN LAS DOS FUNCIONES QUE DECÍA ESTE ARCHIVO (16/09/2026).** La frase de
arriba —*"vive adentro de `raisePrice` y `raisePriceTo`, las DOS funciones que suben precios"*—
**era falsa**. `submargen` sube precios con un **PUT directo** y se salteaba el freno entero.
Salió al chequear los precios después de que él reactivara publicaciones pausadas: `submargen`
proponía subir el **Pendrive Sandisk 128g de $42.326 a $56.620**, que es *justo* el único marcado
en `cyc/nosubir` y el que él bajó a propósito para rematarlo antes de que ML le cobre stock
antiguo. Corriendo `submargen:25:go` le deshacía la decisión.
Es el MISMO agujero que `volver` con el piso, y la misma lección por tercera vez: **un comentario
que promete que algo está cubierto no es prueba de que lo esté.** Ya está tapado en `submargen`,
con el mismo lado seguro que `raisePrice`: si la lista no se puede leer, el comando no corre.
**Lo que queda por revisar: hay 17 comandos con el mismo filtro de publicaciones.** Los demás son
de sólo lectura, pero antes de que alguno empiece a escribir hay que mirar si pasa por el freno.

**EL LADO SEGURO ACÁ ES AL REVÉS QUE EN EL PISO.** Si la lista no se pudo leer, no se sabe qué está
marcado, así que **no se sube NADA esa vuelta** y se avisa en el log. Subir algo que él bajó a mano
le rompe una decisión suya y se entera cuando ya vendió; no subir por una vuelta no rompe nada.

**LA MARCA SE CAE SOLA CUANDO SE ACABA EL STOCK**, que es cuando deja de tener sentido: ya
liquidaste. Corre en el probe y en la vuelta de cada hora, con la MISMA función (`limpiarNoSubir`),
no una copia. **Stock DESCONOCIDO no es stock cero**: una publicación sin producto vinculado se
deja marcada, porque borrarla sería adivinar. Sin este vencimiento la lista se volvería un
cementerio de marcas viejas frenando subas que nadie quiere frenar — el mismo problema que ya
apareció con `repoextra` y con la pausa por precio.

**Y se ve en el panel:** en Rotación de Stock el margen lleva un **🔒 liquidando a propósito**. Sin
eso, un producto que él bajó para rematar se ve igual que uno que se hundió solo, **y el remedio es
el contrario**: a éste se lo deja en paz, al otro hay que subirlo.

Ojo con el filtro por palabra, la lección de siempre: `liquidando:sandisk` agarra **13
publicaciones** (los Cruzer Blade de 8/16/32/64/128, las microSD, los discos externos). Por eso sin
`:go` sólo muestra. **Marcado al 12/09/2026: sólo `MLA1787520621`.**

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

| cuenta | categoría ARCA | impuesto integrado |
|---|---|---|
| Adriana | G | $71.497,87 |
| Luciana | F | $57.719,64 |
| Ayelen | H | $204.811,64 |
| Matías | F | $57.719,64 |

**Los apellidos, los CUIT y los domicilios NO van en este archivo: el repo es PÚBLICO.** Se sacaron
el 15/09/2026. Están en la constancia de ARCA de cada una y Mati los tiene. Acá alcanza con el
nombre de pila, que es el que usa el código (`cyc/inventory/<producto>__ayelen`, las cuatro
cuentas de ML, etc.).

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

**Los números por cuenta NO se escriben acá: el repo es público** (sacados el 16/09/2026). Se
rehacen en el momento con **`facarca`** (lo facturado en la ventana que mira ARCA, por cuenta) y
**`catmono`** (qué categoría corresponde), que leen de la base — o sea que anotarlos nunca hizo
falta y quedaban viejos igual.
**La conclusión medida el 13/08/2026, que es lo único que hay que recordar: ni el tope de
facturación ni el límite del 80% aprietan.** Ninguna cuenta pasaba de la mitad del límite.

### COMPRAR CON FACTURA: LA DECISIÓN QUE YA ESTÁ TOMADA

El diagnóstico completo se midió el 13/08/2026 y **no se escribe en este archivo, que es público**
(sacado el 16/09/2026). Se habla por chat y con el contador. Lo que hay que saber acá es **la
decisión**, porque es la que se aplica todos los días.

Regla suya del 13/08/2026: *"no puedo vender 10 y comprar 1"*.

**Qué se decidió hacer:** NO comprar más (hay $12M de stock parado). Comprar lo MISMO pero
**pidiendo siempre factura** a nombre de la cuenta que corresponda, repartiendo así de cada $100:

| cuenta | cuánto | a nombre de |
|---|---|---|
| **Ayelen** | **$40** | Ayelen |
| **Adriana** | **$35** | Adriana |
| **Luciana** | **$25** | Luciana |
| Matías | $0 — ya está ordenada | — |

(El CUIT de cada una sale de su constancia de ARCA. **No se escribe acá**: repo público.)

La idea del reparto es emparejarlas al nivel de Matías, que es la que ya está ordenada. **Si un
proveedor no factura, ese proveedor es parte del problema.**

### Se facturan entre ellas

Las cuatro cuentas se emiten facturas unas a otras. **Los montos no van acá** (repo público, sacados
el 16/09/2026). Lo que importa recordar: para ARCA cada una de esas facturas es una VENTA de quien
la emite, así que **infla la facturación de las cuatro sin que entre un peso nuevo ni aparezca
mercadería nueva**. Va al contador junto con la recategorización y lo de las compras: es una sola
conversación.

### El facturador automático de ML

Datos de las constancias de ARCA (03/08/2026), los que pide MercadoLibre al configurarlo:

| cuenta | inicio de actividades | punto de venta ML | estado |
|---|---|---|---|
| Adriana | 01/05/2021 | 2 | **listo** · certificado vence 03/08/2028 |
| Luciana | 01/09/2022 | 2 | **listo** · certificado vence 04/08/2028 |
| Ayelen | 01/05/2024 | 2 | **listo** |
| Matías | 01/12/2020 | 2 | **listo** · actividad "venta al por menor por internet" |

Las cuatro quedaron configuradas el 05/08/2026. Cuando ARCA no muestra el nombre, **el domicilio
distingue de quién es cada pantalla** — los cuatro son distintos. **No se listan acá porque el repo
es público**; los tiene Mati.

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
4. **El piso de margen es 23% y la BASE a la que se sube es 25%** (07/09/2026, suyo: *"dejalo
   23/25%"*). Vuelven a ser dos números distintos, que es como tiene que ser — ver abajo por qué.
   Regla suya del 19/08/2026:
   *"ponele 32% como base a todo a partir de ahora a cada cosa que se aumente. no retroactiva"*.
   Los dos números son distintos a propósito: se toca lo que está **abajo del piso**, y cuando se
   toca se lo lleva al **32%**, no al piso justo. Con la meta pegada al piso cualquier cosa mínima
   —un envío un peso más caro, un descuento de $10 de ML— lo volvía a hundir; el perfume De La
   Patagonia hubo que subirlo dos días seguidos por eso. **No es retroactiva**: lo que hoy está
   entre el piso y 32% se deja donde está, no se sale a subir nada. Se mide sobre el costo total
   (mercadería + envío del peor caso + % de reclamos + IIBB + monotributo). En la base está como
   `cyc/mlconfig` → piso 23 / meta 25 (se cambia con el comando `meta:<piso>:<meta>`), y a mano
   los comandos van con el 25: `unapub:<MLA>:25`, `bajopiso:25`, `submargen:25`.
   **Ojo con comparar contra los números viejos.** Al corregir el monotributo —las cuatro cuentas
   pasaron a categoría H y el % subió de 1,94% a 4,06%— todos los márgenes bajaron ~2 puntos sin
   que cambiara nada del negocio. O sea que un 25% de hoy es más exigente que un 25% de agosto.
5. **NUNCA bajar un precio por tu cuenta.** Regla suya del 13/08/2026. Si una cuenta dice que para
   llegar al piso hay que BAJAR, el número está mal: no se toca y se investiga.
   **Única excepción, y la pide ÉL cada vez:** recuperar la caja de compra de un producto que tiene
   stock y no vende. El 16/08/2026 autorizó las tres primeras (pendrive 128gb, Ferrari, De La
   Patagonia). Aun así: nunca se baja sin que lo apruebe, nunca abajo del piso CONFIGURADO (hoy
   23%, `cyc/mlconfig/minPct` — este renglón decía "30%" hasta el 17/09/2026 y era el piso viejo), y el robot
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
| `ponenvio:<palabra\|id>\|<dólares>[\|go]` | el envío/embalaje del producto (`shipUSD`) · el hermano de `poncosto`, que toca la mercadería |
| `cajacosto[:<pesos>]` | lo que sale mandar una caja a Full · vive en `cyc/mlconfig/costoCaja` |
| `codigos[:<palabra>]` | **el código de etiqueta de Full, variante por variante** · dice a quién le falta y por qué |
| `embalaje[:<N>][:go]` | compara el envío/embalaje cargado en cada ficha contra lo que cuesta mandarlo de verdad |
| `abrircaja:<seguimiento\|id>[:go]` | vuelve a poner una caja "en camino" · para deshacer un marcado equivocado |
| `cajallego:<seguimiento\|id>[:go]` | **el hermano al revés**: marca una caja como llegada COMPLETA cuando ML ya lo confirmó y el robot no lo puede leer |
| `pausadas[:piso]` | **por qué el robot dejó pausada cada publicación con stock en Full** · llama a la MISMA función que corre sola cada hora · solo lee |
| `liquidando[:<MLA\|palabra>][:go]` | "esto lo estoy rematando: no me lo subas" · `-` adelante para sacar la marca |
| `ponmedida:<busca>\|<L>x<A>x<H>\|<peso>[;otro][;go]` | carga a mano el paquete (medidas y peso) de lo que ML no informa · sin eso el producto no entra en las barras de Armar caja |
| `vincular:<MLA>=<palabra\|id>[:go]` | pega una publicación a un producto y la saca de oculta |
| `buscarpub:<texto>` | **encontrar el MLA cuando no lo sabés**: busca el texto en el título, el SKU y los códigos de las 4 cuentas, y dice a qué ficha está vinculada hoy cada una |
| `nuevoprod:<nombre>[\|costo=][\|mla=][\|go]` | da de alta un producto nuevo y lo vincula · avisa si ya hay una ficha parecida |
| `fijarvar:<MLA>=<variante>[@<ficha>]\|…[\|go]` | dice a mano de qué color/aroma es cada publicación cuando el título de ML no lo nombra igual que la ficha · si el aroma vive en varias fichas, se aclara con `@` · **vincula y fija la variante de una, y acepta varias por vez** |
| `pausar:<busca>[!<saca>][:go]` | pausa varias de una · palabras con `+` · **mirar la lista antes** |
| `cargargasto:<fecha>\|<monto>\|<cat>\|<desc>[\|prov=][\|fact=][\|cae=][\|go]` | carga un gasto con su comprobante |
| `subirrecibidas[:go]` | sube las compras de ARCA a Facturas → Recibidas · **el archivo semilla se borró** (ver abajo) |
| `porquepedido:<palabra>` | **por qué Pedidos dice lo que dice**: claves crudas de inventario, ventas, días con stock y qué camino toma la cuenta |
| `revisarpedidos` | barre TODO: claves de inventario basura + pedidos que ya no coinciden con la realidad de hoy |
| `limpiarclaves[:go]` | borra las claves de inventario basura (cuentas mal escritas, negativos, productos que no existen) |
| `ordenped[:cuántos]` | compara el orden de Pedidos Bs As antes y después de medir sobre los días con stock |
| `rematar[:d1[:p1[:d2[:p2]]]]` | **qué bajar para que salga**: parada 45 d → hasta 20% · 90 d → hasta 15% · con las visitas y los PESOS que resignás · solo lee |
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
| `repartir[:días]` | **una sola cuenta por producto**: los publicados en más de una, con la última venta de cada una y la dueña que le toca · imprime los `nomandar` listos · solo lee |
| `nomandar:<cuenta>[:<palabras>][:go]` | "este producto no se vende más en ESTA cuenta": la saca del reparto de Armar caja · nombre con `=` adelante = exacto · sin `:go` solo muestra |
| `pasara:<cuenta>[:<palabras>][:go]` | lo contrario: "este producto lo quiero en ESTA cuenta", aunque todavía no esté publicado ahí · aparece en su Armar caja avisando en ámbar que falta crear la publicación |
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
| `subirpuede[:días]` | **dónde hay lugar para SUBIR sin perder ventas**: las que ganan la caja y tienen un competidor arriba · solo lee |
| `avisos[:go]` | **el aviso diario al canal privado**: qué subir, qué bajar y qué está parado · sin `:go` no manda nada · `avisos:reset[:go]` olvida lo ya avisado y vuelve a mandar TODO |
| `lista` | **vuelve a imprimir el último aviso con sus números**, para saber a qué publicación apunta "el 4" · solo lee |
| `tgalertas[:<chat>]` | **el segundo canal de Telegram**, sólo para Mati · sin número muestra los chats que el bot conoce |
| `verescalon:<MLA\|palabra>[:marcar]` | **¿ML cobró menos de verdad al bajar?** agrupa las ventas por precio y muestra lo que ML se quedó en cada uno |
| `envioml:<MLA>` | el envío que **dice ML** (por destino) vs el que deducimos de las ventas · `envioreal` es OTRO comando |
| `apisnuevas:<MLA>` | qué endpoints de ML andan y no usamos |
| `probarcaja:<MLA>[;otro]` | **¿ML dice quién tiene la caja de un catálogo?** vale el código del catálogo o el de una publicación tuya · solo lee |
| `verweb:<direccion>` | **leer una página de afuera y mostrar su texto** · el chat no tiene internet y el robot sí · solo lee · **lo que imprime queda en el registro PÚBLICO** |
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
**ACTUALIZACIÓN 15/09/2026: la herramienta cambió y `perPage` AHORA SÍ se respeta.** Con
`perPage:1` la lista devuelve UNA corrida (~800 tokens) y es la forma barata de sacar el id de la
que acabás de disparar. Lo que sigue prohibido es pedirla sin `perPage`: ahí vuelven las ~25 con el
commit entero de cada una. Y ojo con otro cambio del mismo día: **el repo se renombró a `web-cyc`**
—las URLs de los logs lo muestran— pero las herramientas siguen aceptando `maticaldas-del/a`.
Pedirle la API de GitHub a mano con `curl` NO funciona: el proxy contesta 403.

**EL REPO ES PÚBLICO Y LOS REGISTROS DE GITHUB TAMBIÉN.** Verificado el 30/08/2026 (`private:false`).
O sea que todo lo que un probe imprime en pantalla queda en una página que puede leer cualquiera.
Por eso `chequeo/ultimo.txt` NO lleva números de orden ni el texto de las preguntas — eso ya estaba
pensado. Pero `posventa` sí imprime los mensajes de los compradores con su número de paquete, y esos
quedaron públicos. **No correr `posventa` salvo que él lo pida**, y no meter datos de compradores en
ningún archivo del repo.
Pasarlo a privado NO es gratis: en repos públicos GitHub no cobra el tiempo de las corridas y en
privados sí, con tope mensual — con el robot corriendo cada 2 minutos ese tope se pasa enseguida.
Queda como decisión suya.

### LA LIMPIEZA DEL 15/09/2026: QUÉ SE SACÓ DEL REPO PÚBLICO Y POR QUÉ

Él lo planteó así: *"es muy peligroso que los datos estén públicos (…) tratemos de tener la máxima
seguridad que podamos. sin hacer pavadas."*

**LO PRIMERO QUE SE REVISÓ, Y ES LA BUENA NOTICIA: NUNCA SE SUBIÓ NINGUNA CLAVE.** Se listaron
TODOS los archivos que existieron alguna vez en los 768 commits: no hay `.env`, ni archivo de
credenciales, ni token escrito a mano. Los secretos de ML siempre vivieron en los secretos de
GitHub. **No hubo nada que rotar** — que es la diferencia entre un susto y una emergencia.

**Lo que sí estaba expuesto, en orden de gravedad:**
 · **`ml-sync/recibidas.json` — BORRADO.** 338 comprobantes con el **CUIT y el nombre de cada
   proveedor**, el número de factura, el CAE y el monto. **Datos de 338 terceros**, y es lo peor
   que había. Los 338 **ya estaban cargados en `cyc/facturas_recibidas`**, así que borrarlo no
   perdió absolutamente nada: el archivo era el sobrante de cuando se subieron.
 · **`CLAUDE.md` — limpiado.** Tenía el **apellido completo, el CUIT, la categoría y la
   facturación anual de las cuatro**, y los **cuatro domicilios**. Más el CAE de una factura del
   contador y un número de VEP. Todo eso salió; quedan los nombres de pila, que son los que usa el
   código.

**LA CORRECCIÓN QUE HUBO QUE HACERLE A OTRA IA, y vale como regla:** dijo que el `CLAUDE.md`
*"es tu manual, no datos de nadie más"*. **Es falso**: tenía el nombre y el CUIT de Adriana, de
Luciana y de Ayelen. Son tres personas más. El mismo problema que el JSON de proveedores, pero con
la familia. **Antes de decir "esto es sólo mío", contar cuántas personas aparecen adentro.**

**LO QUE NO SE HIZO, Y ES UNA DECISIÓN, NO UN OLVIDO: el repo SIGUE PÚBLICO.** Pasarlo a privado
suena a la solución obvia y **apaga el robot**. Medido: el ciclo no son corridas de 2 minutos, es
**una sola corrida de casi 6 horas** (`timeout-minutes: 355`), cuatro por día → **~43.000 minutos
por mes**. GitHub regala **2.000** en privado. O sea: **el robot se muere a la semana y media, o
salen ~USD 330 por mes.** Público + sin datos adentro es más seguro que privado + robot apagado.

**Y LO QUE HAY QUE SABER IGUAL: lo que estuvo público, estuvo público.** Esos datos estuvieron
accesibles desde julio. Sacarlos corta el sangrado hacia adelante; **no des-publica lo que alguien
ya haya copiado.** No es para asustarse —un CUIT en Argentina es semi-público— pero no es "como si
nunca hubiera pasado", y decirle eso sería mentirle.

**Y APARECIÓ ALGO PEOR QUE GITHUB, QUE NADIE HABÍA MIRADO: LA WEB SERVÍA EL REPO ENTERO.**
Cloudflare publica la web de CYC con **`assets.directory = "."`** (se ve en la rama
`cloudflare/workers-autoconfig`, que la creó Cloudflare sola) y **el repo no tenía
`.assetsignore`**. O sea que `recibidas.json`, el `CLAUDE.md`, `chequeo/ultimo.txt`,
`precios/bajopiso.txt` y `ml-sync/sync.mjs` entero **se bajaban desde la dirección de la web**, sin
GitHub y sin contraseña. Es exactamente el mismo agujero por el que se filtró el `CLAUDE.md` de la
wallet el 11/08 — **y acá era peor, porque nadie lo había pensado siquiera.**
**Arreglado: se creó `.assetsignore`.** La app sólo necesita CUATRO archivos —`index.html`,
`sw.js`, `manifest.webmanifest`, `icon.svg`— y se verificó antes de escribirlo: el service worker
cachea esos cuatro y `index.html` no busca ningún otro archivo del repo. Todo lo demás queda afuera.
**Al agregar un archivo nuevo al repo, preguntarse si tiene que estar en la WEB.** Si no, va al
`.assetsignore`. Lo que no está listado se publica: el lado por defecto es el peligroso.

**Y VOLVIÓ A PASAR EL 16/09, POR OTRA PUERTA: `vergastos` IMPRIMÍA EL CUIT Y EL NOMBRE DEL
PROVEEDOR.** Salió al chequear si los honorarios del contador ya estaban cargados: el renglón
`otros:` volcaba el **CUIT y el nombre completo del contador** al registro de GitHub, que es
público. Mismo dato de tercero que `recibidas.json`, sólo que allá era un archivo y acá es lo que
el comando escribe en pantalla.
**La causa era el lado por defecto, igual que el `.assetsignore`:** `otros:` imprimía **todo campo
que no conociera**, así que cualquier dato nuevo salía solo. Ahora se listan **las claves y no los
valores** (*"comprobante: cae ✓ · cuit ✓ · fact ✓ · prov ✓"*): para revisar el mes alcanza con
saber que el gasto TIENE su comprobante, el número no decide nada — y una clave que alguien agregue
mañana queda tapada sola. Autorizado por él (*"si tapalo"*). `subirrecibidas` se revisó el mismo
día y está limpio: sólo imprime totales por cuenta.
**Antes de escribir un dato en la salida de un probe, la pregunta es la misma que antes de
commitear un archivo: ¿de quién es este dato?**

**LA REGLA QUE QUEDA, y es la que falló tres veces (dos en la wallet, una acá):** *todo lo que
entra a este repo lo lee cualquiera, para siempre, sin contraseña.* Antes de commitear un archivo
con números adentro, la pregunta no es "¿esto es secreto?" sino **"¿de quién es este dato?"**. Si
aparece alguien que no es Mati, no va.

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

### EL CÓDIGO DE LA ETIQUETA DE FULL, EN ARMAR CAJA (12/09/2026)

Pedido suyo: *"al armar una caja quiero tener el numero de la etiqueta de esa publicacion que me da
ML (…) teniendo ese codigo al lado de la publicacion en la web de cyc puedo corroborar que estoy
mandando el producto correcto y etiquetado bien"*. Y la aclaración, que resultó exacta: *"cada
codigo cambia segun cada cuenta (…) el mismo producto, pero en diferente cuenta, es un codigo
diferente"*.

**Es el `inventory_id`** (formato `GAUL23741`), el MISMO dato que el robot ya pedía para leer el
stock de Full — sólo que no lo guardaba. **Verificado con `DUMP_FULLSTOCK=lupa` ANTES de escribir
nada**: ML devuelve `UTRJ34684` y `PKTG71359`, mismo formato que el que él ve en pantalla. Y
confirma lo suyo: las DOS publicaciones de Lupa 90mm de Ayelen comparten `PKTG71359`, o sea que el
código es **del producto EN ESA CUENTA**, no de la publicación.

**NO ES EL MLA.** Es el código del producto ADENTRO de Full. Confundirlos ya costó una tarde el
08/09, así que la pantalla lo aclara en el globito.

El robot lo guarda en **`cyc/mllinks/<MLA>/inv`** (y en `/invVar` cuando la publicación tiene
variantes adentro) en cada vuelta de stock, y Armar caja lo muestra al lado de cada cuenta.

**NO SE ADIVINA:** si el título de la publicación no nombra el color, **no se muestra código**.
Mostrar el de otro color sería peor que no mostrar nada — él usa este número justo para chequear
que manda lo correcto, así que un código equivocado le confirmaría un error en vez de evitarlo.
Para esos casos está `fijarvar:<MLA>=<variante>:go`, que escribe `variant` y ahí sí manda.
(La primera versión SÍ adivinaba: con el Centímetro devolvía el código del Blanco cuando se le
pedía el Rosa. Lo agarró la prueba con los códigos reales, no el chequeo de sintaxis.)

**EL ERROR QUE CASI ROMPE EL ROBOT ENTERO, Y NO LO AGARRA `node --check`:** la variable se llamó
primero `invUpd`, que **YA EXISTE** más abajo como `const` de un bloque interno (es el stock que se
escribe en `cyc/inventory`). Eso tira *"Cannot access 'invUpd' before initialization"* en ejecución
y **corta la corrida completa**. Compila perfecto. Se renombró a `etiqUpd`.
**Antes de crear una variable en `sync.mjs`, buscar si el nombre ya está usado.**

### EL CÓDIGO DE LA ETIQUETA DE FULL: PARA QUÉ SIRVE Y A QUIÉN LE FALTA

Para qué lo quiere, textual (12/09/2026): *"quiero ver por ejemplo que diga modista rosa codigo xxx
mandar 100 / modista blanco codigo yyy mandar 50. entonces yo miro el codigo pegado al modista que
tengo en la mano y me doy cuenta si esta bien lo que hago o no"*. **Es un control de que está
mandando lo correcto**, no un dato de adorno — por eso NUNCA se adivina.

Se revisa con **`codigos[:<palabra>]`** (solo lee), que muestra variante × cuenta × código y separa
los DOS motivos por los que puede faltar, que se arreglan distinto:
 · **"falta"** → el robot todavía no leyó esa publicación. Se llena solo en la vuelta de la hora.
 · **"SIN COLOR"** → el título de ML no nombra ninguna variante de la ficha, así que el panel no
   sabe de qué color es. Se arregla con `fijarvar:<MLA>=<color>:go`.

**Estado de los Centímetro modista (Luciana) al 12/09/2026 — verificado contra la captura de ML:**

| color | código | publicación |
|---|---|---|
| Blanco | `ZBGG56355` | MLA1699834745 |
| Gris | `FIGM65688` | MLA3112784736 |
| Rosa | `NJLU99914` | MLA3559540968 |
| **⚠️ sin identificar** | **`TRZK95506`** | **MLA1841730099** |

**Hay una QUINTA publicación de Centímetro que no estaba en su captura** y de la que el panel no
sabe el color. **Falta que él diga cuál es**; hasta entonces no muestra código, que es lo correcto.

### Los tres lugares donde está la mercadería

**Y SE VEN LOS TRES EN CADA RENGLÓN DE PEDIDOS (14/09/2026).** Pedido suyo: *"quiero que en todos
los productos de pedidos muestre cuanto stock hay en ml, en camino y en mi oficina"*.
Los tres números **ya se calculaban**; lo que fallaba era mostrarlos, y de dos formas:
 · **"264 en stock" no decía que ese número es sólo lo de ML.** `stockOf` deja la oficina afuera a
   propósito —para que el "dinero en riesgo" mida el quiebre real— así que "en stock" se leía como
   el total, y el total es otro.
 · **La oficina y el camino salían SÓLO cuando eran mayores a cero.** Un renglón sin ellos se leía
   igual que uno donde nadie los midió, y son justo las dos cosas que cambian la decisión: con 141
   en casa **no hay que comprar, hay que MANDAR**.
Ahora el renglón dice **📦 N en ML · 🚚 N en camino · 🏠 N en tu oficina**, siempre, aunque sean cero.

**Y EN LOS PRODUCTOS CON VARIANTES VA ADEMÁS EN CADA CHIP** (mismo día, corrección suya: *"no veo el
cambio, yo decia de las variantes"*). En un producto con colores o aromas el total del producto no
alcanza para decidir: *"150 en camino"* no dice de qué color. Cada variante lleva ahora sus tres
lugares abajo del nombre, y **salen TODAS las que le faltan a ML, no sólo las que hay que comprar**:
la variante que ya está cubierta desde casa dice **✓ mandar** en verde en vez de un número, y es
justo la que cambia la decisión — antes desaparecía del desglose y se leía igual que una que nadie
midió, el MISMO error que tenía el renglón del producto.
Un pedido viejo, guardado antes de este cambio, no tiene los tres números adentro: ahí el chip sale
como antes (sólo el nombre y cuánto comprar) hasta que el panel lo vuelva a calcular. **No se
inventa un cero**, que se leería como "no hay nada en ningún lado".
**Vive en UNA función (`pedTresLugares`)**: la nota se arma en dos lugares —el refresco de los
pedidos cargados a mano y el alta/actualización de los automáticos— y con dos copias el mismo
producto podía decir una cosa en un renglón y otra en el otro.
Probado con números inventados antes de subir, incluido el caso que antes no se veía (cero en casa
y cero en camino) y el de 0 en ML con 150 en casa, que es el que hay que leer al revés.

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
dice de qué caja vino cada unidad). A mano: `cajasllegaron`.

**UNA CAJA QUE LLEGA INCOMPLETA TAMBIÉN SE MARCA** (11/09/2026, pedido suyo: *"cuando el robot vea
que la caja llegó que ya la marque. y luego yo me fijo si hubo un problema o no"*). Antes se exigía
que TODOS los renglones estuvieran cubiertos, y eso dejaba colgada para siempre justo la mercadería
que NO coincide —rotura, faltante, o que ML no la dio de alta—: la caja se quedaba "en camino" y
esas unidades seguían contando en el patrimonio como si existieran.
**Sólo cuentan las entradas POSTERIORES al despacho de la caja.** Antes las entradas se sumaban en
un total suelto y la ventana arranca en la caja abierta más vieja, así que una recepción anterior al
despacho se le acreditaba igual. Con la regla nueva eso era GRAVE: la primera prueba iba a marcar una
caja de 64 u. despachada el 08/09 usando entradas del 07/09 —imposibles de ser suyas— y habría
borrado **51 unidades reales** del patrimonio. Ahora cada entrada se guarda con su fecha y se
consume de la más vieja a la más nueva, sólo entre las posteriores al despacho.
**Son TRES frenos, no uno**, y hicieron falta los tres: con sólo *"ML dejó de recibir hace 3 días"*
la prueba iba a marcar como llegada una caja despachada 3 días antes con **5 de 65 unidades** —las
pocas entradas de esa fecha eran la cola de la caja anterior—. Marcar el 8% de una caja no es
"llegó con faltantes", es "todavía no llegó".
 · **ML dejó de dar de alta** (3 días sin entradas nuevas): si sigue procesando no se puede decir
   que faltó nada.
 · **La caja tiene 10 días o más** (`MIN_DIAS`): antes de eso ni siquiera tuvo tiempo de llegar, el
   viaje son ~8 días.
 · **Entró la mitad o más** (`MIN_PARTE` = 0,5): abajo de eso se queda abierta y se pone roja, que
   es como tiene que verse algo que no llegó.
Una caja **completa** se marca siempre, sin esperar ninguno de los tres. Y la salida de
`cajasllegaron` dice, caja por caja, **cuál de los tres frenos la dejó abierta**. Marcarla apenas entra la
primera unidad sacaría de "en camino" mercadería que ML todavía está dando de alta, y el patrimonio
bajaría un día para volver a subir al otro. Una caja perdida entera (cero entradas) se queda abierta
y en rojo, que es como tiene que verse.
La caja marcada así **NO va en verde**: va en **ámbar**, dice *"llegó · faltaron N u."* y abajo
lista renglón por renglón lo que mandaste contra lo que entró. El verde liso escondería justo lo que
él quiere mirar. Se descuenta sólo lo que entró de verdad, así una caja posterior del mismo producto
no arranca con el saldo en negativo.

**Lo que ML tiene roto o vencido adentro de Full ya no cuenta, y nunca contó.** El robot se trae
`available_quantity` y nada más: lo que ML marca como no disponible (roto, en proceso interno, para
descartar) queda afuera del panel y del patrimonio solo. Ahí no hay nada que hacer.

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

**LO QUE SALE MANDAR UNA CAJA A FULL VIVE EN LA BASE: `cyc/mlconfig/costoCaja`** (12/09/2026).
Era **$16.000** y él lo subió a **$17.500**. Se cambia con **`cajacosto:<pesos>`**; sin número sólo
muestra cómo está.
Estaba escrito **a mano en DOS archivos** —`index.html` y el probe `embalaje` de `sync.mjs`, este
último con el comentario *"el mismo número que usa el panel"*, que es una promesa que no controla
nadie—. Es el mismo patrón de los ocho comandos con `|| 30` adentro. Ahora los dos leen del mismo
lado. **Si la lectura falla cae en el número ALTO** ($17.500): con una caja más cara el envío por
unidad sube, el costo sube y el margen se ve MENOR — ése es el lado seguro.
Lo usan dos cosas que deciden plata: el *"¿conviene armar esta caja?"* de Armar caja, y el probe
`embalaje`, que reparte ese costo entre las unidades que entran y con eso mide si el
"Envío+embalaje" de cada ficha está bien cargado.
**MEDIDO EL MISMO DÍA, y el resultado importa: subir la caja un 9,4% NO desajustó ningún costo.**
`embalaje` dio **118 razonables de 142**, 2 cargados de menos y 14 sin medidas. Los desfasajes
grandes que muestra la lista **son anteriores y por otro motivo** —los 4 espejos y el Kit Limpia
están cargados de MÁS a propósito, porque llevan protección desde el 20/08—. Sobre un envío por
unidad de entre $6 y $307, el 9,4% son centavos. **No hizo falta tocar ninguna ficha ni correr
`netoweb`.**

**LO QUE SE SUGIERE MANDAR CUBRE 30 DÍAS EN TOTAL, Y SE REDONDEA AL MÁS CERCANO (11/09/2026).**
Pedido suyo, textual: *"quiero ser un poco más moderado con el tema de envío de productos. me
gustaría cubrir los próximos 30 días máximo. así hay menos riesgo de stock parado."*
Cambian **dos** cosas y las dos importan:
 · **El objetivo son 30 días de stock TOTAL** (`REPO_DIAS_COBERTURA` = 30), contando lo que ya está
   en Full y lo que va en camino. **Los días de viaje YA NO se suman.** Antes eran 45 + 8 = 53.
   Tiene su costo y lo eligió sabiéndolo: con ~8 días de viaje, 30 días de stock desde hoy son unos
   22 días de venta desde que la caja se activa.
 · **Se redondea al MÁS CERCANO, no siempre para arriba** (`objetivoRepo`, antes `Math.ceil`). Lo
   marcó con las Sábanas 140x190 Terracota: vende 1 por semana y tiene 1 unidad, así que 30 días
   piden 4,29. Mandando 3 queda en 4 u. = **28 días**; mandando 4 queda en 5 u. = **35**. *"28 está
   más cerca que 34 de 30"*. `Math.ceil` elegía siempre el 35.
Verificado con sus números exactos antes de subir: objetivo 4 u., tiene 1, **manda 3**, queda en 28.
`REPO_DIAS_DEMORA` (**8**) sigue existiendo: lo usa el texto de la pantalla y es la referencia del
rojo de Pedidos, pero ya no entra en la cuenta de cuánto mandar.
**Lo que NO cambió:** la cuenta sigue dividiendo por los días que el producto REALMENTE tuvo stock
(no por 30 fijo), y una cuenta en CERO sigue recibiendo el piso de `REPO_PISO_CERO` (4 u.) aunque
la cuenta dé 0 — en cero no vende, y eso no es reponer de más.

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

## ¿CONVIENE FULL O MANDARLO A MANO? MEDIDO EL 10/09/2026

Pregunta suya: *"nosotros vendemos en full el 100% de las cosas. nos conviene vender ahi? o
mandarlos nosotros a mano? que tipo de productos?"*

**La respuesta es: Full, y no está cerca — salvo para lo que no rota.** Los números:

**1. Por venta, Full es GRATIS abajo de $33.000.** Está en el código, no es opinión: el cargo
`shp_fulfillment` que Mercado Pago descuenta sólo aparece arriba del umbral de envío gratis
(`FILL_GESTFULL` usa `MIN_GROSS`, *"debajo del umbral el comprador paga el envío, no hay cargo
Full al vendedor"*). Arriba de $33.000 son **~$5.900 a $6.190 por venta**, medidos en ventas reales.

**2. Mandarlo a mano NO esquiva ese cargo.** Arriba de $33.000 el envío gratis es obligatorio lo
mande quien lo mande: el vendedor paga el flete igual, sólo que sin el descuento de Full, y encima
lo embala y lo despacha él. Abajo de $33.000 no hay nada que ahorrar porque Full no cobra nada.

**3. Lo único que Full cobra de verdad es el ALMACENAMIENTO de lo que NO rota** (ML empieza a
cobrar a los ~60 días parado, `ALMAC_DIAS`). Medido con `fast:2026-07-01` (período 15/06→14/07):

| cuenta | facturó ML | cargos por venta | queda afuera |
|---|---|---|---|
| Adriana | $1.817.026 | $1.618.557 | $198.469 |
| Ayelen | $1.826.477 | $1.091.721 | $734.756 |
| Luciana | $2.420.347 | $1.739.380 | $680.967 |
| Matías | $2.245.683 | $1.620.898 | $624.785 |
| **total** | **$8.309.833** | **$6.070.556** | **$2.238.977** |

**OJO: ese "queda afuera" NO es todo almacenamiento.** La factura mensual de ML trae adentro las
**percepciones de IIBB**, que son ~$1.014.166/mes y **ya están contadas** en `ML_EXTRA_PCT` (ver la
sección de percepciones). Descontándolas, Full cuesta **~$1.200.000/mes** entre almacenamiento,
stock antiguo, retiros y publicidad si la hay. Es plata que el panel NO cuenta en ningún margen.

**La conclusión operativa: no hay que sacar el catálogo de Full, hay que sacar la cola.** Ese
$1.200.000 lo pagan las publicaciones paradas —las 29 con stock y sin vender hace 30 días
($3.439.197) y las 230 u. "con problema"—, no las que venden. Lo que rota en menos de 2 meses paga
CERO almacenamiento. Y el peor caso es lo **grande y liviano** que no rota (sábanas, cajas
voluminosas): el almacenamiento se cobra por LUGAR, no por plata.

**Y está el tiempo, que él mismo puso sobre la mesa.** Al ritmo de hoy son más de 40 paquetes por
día. Embalar y despachar eso a mano no es "hacerse un rato", es una persona a tiempo completo — y
lo que se ahorraría abajo de $33.000 es cero. La única versión que cierra es mandar a mano la cola
lenta, que son pocas ventas por mes, y ahí lo que se gana no es el envío: es dejar de pagar
almacenamiento por mercadería que no se mueve.

**Lo que quedó sin medir:** el período 2026-08-01 la API de facturación de ML **no lo devuelve**
(contesta "nada"). Por eso `fast:` ahora imprime qué períodos contestó ML y escribe "NO LO DIO ML"
en vez de $0 — un almacenamiento en $0 se lee como buena noticia y era simplemente falta de dato.
El número oficial y abierto por concepto está en ML → Facturación → Costos por servicio de
almacenamiento, y se carga con `seedreal:<YYYY_MM>=<monto>`.

## SUBIR EL PRECIO PUEDE HACERTE GANAR MENOS: LA COMISIÓN DE ML TIENE ESCALONES (12/09/2026)

Salió midiendo si se podía automatizar la suba de precios (`subirpuede`). **Los Paulvic de $14.360
a $15.790 dejan $312 MENOS por unidad. Quedándose en $14.840 dejan $369 MÁS.** El precio sube
$1.430 y la plata baja: la comisión se llevó más de lo que subió el precio.

**No es un error de cuenta, es cómo cobra ML.** Es el mismo cargo fijo que ya estaba anotado —
*"~$1.230 por venta, sin importar el precio"*— visto del otro lado: **no es un % parejo, es una
escalera**, y cruzar un escalón cuesta de golpe más que el aumento que lo cruzó. Hay uno cerca de
los **$15.000**.

**La consecuencia práctica, y vale para cualquier suba, la haga el robot o la mano:** entre un
escalón y el siguiente hay una **zona muerta** donde cobrás más caro y cobrás menos. Antes de subir
un precio hay que preguntarle a ML la comisión **en el precio nuevo**, no suponer el mismo %.

**Cómo se esquiva sin tener que saber dónde están los escalones:** `subirpuede` prueba 12 precios
entre el de hoy y el techo, le pregunta a ML la comisión de cada uno (`/sites/MLA/listing_prices`,
el mismo endpoint que usa `netoweb`) y se queda con el que **más plata deja**, no con el más alto.

**Y las filas que dan negativo NO salen con el comando al lado.** Un renglón que dice *"subí a
$15.790"* y te hace ganar menos es peor que no tener el renglón: el comando invita a aplicarlo. Es
la misma regla que el margen en verde sin envío descontado — **una conclusión sobre un número que
sabemos que está mal no se muestra como si fuera una recomendación.**

## EL SEGUNDO CANAL DE TELEGRAM: LO QUE HAY QUE DECIDIR (13/09/2026)

Pedido suyo: *"quiero que me lo mande a otro chat de telegram así quedan dos, uno que mande el
resumen del día como siempre, y otro que voy a estar yo solo que me avise de cosas importantes
como por ejemplo esas, subir precios, bajar precios, o cosas importantes que pasen en las páginas
de ml"*. Y el freno, el mismo día: **"no quiero que toques el telegram actual"**.

**NO SE TOCÓ NADA DEL CANAL DE HOY.** El resumen del día sigue saliendo igual, a los mismos dos
chats (Mati y Tito). `sendTelegram` y `TG_PERMITIDO` quedaron como estaban.

El canal nuevo vive en **`cyc/mlconfig/tgAlertas`** y se configura con **`tgalertas[:<chat_id>]`**.
Sin número muestra los chats que el bot conoce, para elegir; `tgalertas:-` lo saca.

**Ese chat queda FUERA de la lista del resumen**, que es todo el punto: si quedara adentro no habría
dos canales, habría uno repetido. Y al revés, los avisos **no** van a la lista general: ahí está el
padre, y estas son decisiones de precio que son de Mati.

**Si no está configurado NO se manda nada** y se dice en el log. Mandarlo a la lista general sería
peor que no mandarlo — el lado seguro acá es no mandar.

**CÓMO CONSEGUIR EL NÚMERO:** el bot sólo ve los chats donde alguien le escribió. Hay que crear un
**GRUPO** de Telegram, meter al bot adentro, mandarle un mensaje, y ahí aparece en `tgalertas`. Un
chat privado con el bot NO sirve: es el mismo donde ya llega el resumen.

## EL AVISO DIARIO: QUÉ SUBIR, QUÉ BAJAR Y QUÉ ESTÁ PARADO (13/09/2026)

El comando es **`avisos[:go]`** y corre solo al final de `ml-daily`, **después** de recalcular
Margen ML — si corriera antes decidiría sobre netos del precio viejo. **No toca ningún precio, ni
con `:go`**: `:go` sólo quiere decir "mandá el mensaje".

Junta tres cosas, y **las tres cuentas viven en funciones compartidas** (`calcSubirPuede`,
`calcZonaMuerta`, `calcBajarStock`), no adentro del comando: `subirpuede` usa la MISMA función que
el aviso, así no pueden decir números distintos sobre la misma publicación. Es el mismo motivo por
el que el piso salió de los ocho comandos y el costo de la caja salió de los dos archivos.

**LOS CUATRO FRENOS QUE HICIERON FALTA, y ninguno era opcional:**

1. **Lo marcado `liquidando` NO se recomienda subir.** Él lo bajó a propósito para rematarlo;
   decirle "subí esto" es proponerle deshacer su propia decisión — el mismo problema que el freno
   de `raisePrice` vino a resolver el 12/09. Si la lista no se puede leer no se recomienda nada.
2. **Después de subir, NO se vuelve a pedir subir por 14 días** (`SUBIR_ESPERA_DIAS`). La prueba
   lo mostró: en la misma corrida en que se aplicó el Infusor a $5.290, el comando ya pedía $5.740
   —porque el escalón del 10% lo dejó corto del techo—. Avisar eso al día siguiente es una escalera
   sin descanso: en una semana acumula +70% sobre algo que capaz dejó de venderse en el primer
   escalón. **La gracia del escalón chico es poder MIRAR entre uno y otro; sin la espera no se
   mira.** La espera es por PUBLICACIÓN y no por número, a propósito.
3. **No repite lo mismo todos los días** (`cyc/avisados/<MLA>`, 7 días). Un aviso que llega todos
   los días con los mismos seis renglones entrena a no abrirlo, y el día que hay algo nuevo tampoco
   se lee. Se anotan **todas** las avisadas, no sólo las 3 que se muestran: el mensaje dice "y 19
   más" y esas 19 ya fueron avisadas. Y se anota **sólo si el mensaje salió**: si falló el envío y
   se anotara igual, esa publicación quedaría callada una semana por un aviso que nunca llegó.
4. **Si no hay nada NUEVO no se manda mensaje.** Un aviso que dice "hoy no hay nada" es ruido.

**LA LISTA VA ENTERA Y NUMERADA (14/09/2026).** Él lo marcó mirando el mensaje en el teléfono:
*"Me paso la lista pero incompleta no? Y como hago para decirte que subas o bajes lo que quiero?"*.
Salían 3 renglones y un *"…y 13 más"*.
**No era sólo incómodo: se comía decisiones.** El freno 3 anotaba las 16 como avisadas —eso estaba
escrito acá arriba a propósito, para no repetir— pero mostraba 3. O sea que **esas 13 quedaban
calladas 14 días sin que él las hubiera visto nunca**: el aviso le prometía 13 decisiones y después
se las escondía. Cortar tenía sentido cuando el mensaje era el final del camino; no lo tiene cuando
el mensaje **es la lista sobre la que él decide**.
 · Sale entera, y cada renglón lleva **número** para poder contestar *"subí el 1 y el 4"*.
 · `sendAlerta` **parte el mensaje en varios**: Telegram corta en 4096 caracteres y contesta 400
   sin que se note. Si una parte falla devuelve `false` y **no se anota nada** — un envío a medias
   silenciaría una semana justo lo que no salió.
 · La lista se guarda en **`cyc/avisolista`** y se lee con **`lista`**. Un mensaje de Telegram queda
   enterrado abajo de otros; si el número viviera sólo ahí, mañana "el 4" no querría decir nada.
 · **`avisos:reset[:go]`** borra la memoria de avisados. Hizo falta una vez: arreglar el mensaje no
   devuelve solo las 16 que ya estaban calladas.

**EL ERROR QUE SE AGARRÓ ANTES DE SUBIR, y era del peor tipo:** la primera versión guardaba la lista
**antes** de mandar y sin mirar si había salido. Como los renglones que salen son los que NO estaban
avisados, una corrida de prueba al otro día devuelve pocos o ninguno **y le pisaba la lista de
anoche**: él tendría en el teléfono los números 1 al 16 y `lista` le contestaría otra cosa con los
mismos números. **Un número que apunta a otra publicación es PEOR que no tener número** — con eso se
aplica un precio equivocado. Ahora se guarda sólo si el mensaje salió.

**Y UN RENGLÓN QUE INVITABA A VENDER PERDIENDO.** El aviso del 14/09 decía *"Filtro agua · ML dice
que se gana la caja a $1.000"* y la mercadería sola cuesta **$1.059**. Es la regla que ya estaba
anotada para `price_to_win` —*"que se gane a $900 no quiere decir que a $900 haya margen"*— sin
aplicar. Ahora esos renglones **no llevan número**, avisan que el precio de ML no es un precio con
ganancia, y cuando está abajo del costo lo dicen: **"No se puede"**.
**El alcance es corto a propósito** (`bajoCosto`, no `noConviene`): compara contra la mercadería
**sola**, sin comisión de ML ni impuestos. Agarra el caso imposible y **no decide el dudoso** — los
Paulvic están muy arriba del costo y aun así ganar la caja los deja en −4,1%. Ése se mide de a uno
con `unapub` o `bajarcaja`, que sí tienen la cuenta completa.

**EL CERO QUE ERA UN FILTRO MAL PUESTO.** La primera corrida dio **"PARADO: 0"** habiendo 29
publicaciones que sí lo están. Contaba las ventas del PRODUCTO en las cuatro cuentas juntas, así que
algo que vende bien en Matías y está quieto en Adriana daba "vendió" y se descartaba entero — justo
el caso que hay que ver, porque **la que paga almacenamiento es la mercadería parada EN ESA
CUENTA**. Es la misma confusión ya anotada en `repartir`: *la cuenta correcta para saber CUÁNTO
reponer no es la correcta para saber DÓNDE está el problema.* Ahora cuenta por producto **y**
cuenta, y **imprime por qué se descartó cada uno** (vendió / sin fecha real de entrada / recién
llegado) — un cero sin explicación parece una buena noticia, que es como ya mordió `liquidar`
(0 de 137) y el marcado de cajas.

**Y LA VELOCIDAD, que también era un error de diseño:** la primera corrida tardó más de 9 minutos
por ~1.300 consultas. La caché de comisiones era **por publicación** cuando la comisión depende de
(sitio, tipo, categoría, precio) y **no** de cuál publicación sea: los 18 Paulvic, misma categoría y
mismo precio, preguntaban 18 veces lo mismo. Ahora la caché es de toda la corrida, y se miran 4
precios gruesos primero: si ninguno gana, no hay escalón en la ventana y se corta ahí.

## EL ROBOT YA SUBE PRECIOS SOLO, Y LAS PRIMERAS 36 HORAS DIERON 4 DE 5 (15/09/2026)

El interruptor (`cyc/mlconfig/autoSubeVenta`, se prende con `subeventa:on`) **ya estaba PRENDIDO**:
al correr `subeventa:on` el 15/09 contestó *"PRENDIDA → PRENDIDA"*. O sea que el robot **ya venía
tocando precios solo desde el 14/09** y nadie se había enterado — porque los dos avisos que lo
contaban (`Precio subido automático` y el `subilo vos`) llamaban a `sendTelegram` sin declarar el
tipo y el filtro los tiraba. Arreglado el mismo día: ahora van por `sendAlerta`, al canal de precios.

**Lo que hizo, medido con `tocados:36` (solo lee) — 5 publicaciones:**

| | quedó | precio | debería | cuenta |
|---|---|---|---|---|
| Temporizador Digital Cocina | 22% | $6.310 | $6.450 | Ayelen |
| **Funda Cubre Colchón queen** (`MLA1750080411`) | **25%** | $17.630 | $17.610 | Luciana |
| Linterna Led Multifunción | 26% | $10.340 | $10.290 | Ayelen |
| Joystick Bluetooth | 26% | $27.110 | $26.960 | Ayelen |
| **Funda Cubre Colchón twin** (`MLA1750080409`) | **33%** ⚠️ | $21.020 | $19.860 | Luciana |

**Cuatro clavadas en la meta y UNA que se pasó 8 puntos ($1.160 de más).** Y la causa es exactamente
la que él nombró sin ver el código: *"si no aumentamos mucho solo por algunos envíos"*.

**POR QUÉ SE PASA: el robot calcula con el neto de ESA venta, no con el envío típico.** El
multiplicador sale de `mult = costo × (1+meta) / (neto − cargoML × (1+meta))`, y `neto` es el de la
venta que disparó la suba. Si a esa venta le tocó un envío caro, el neto viene bajo y el precio que
"hace falta" sale más alto del que hace falta de verdad. En la twin ML se quedó $5.311 de una venta
de $17.610; al precio nuevo el peor envío visto es $53 y el margen quedó en 32,6%.
**No es lo mismo que el error del 20/08** (aquel era usar el envío más BARATO y quedar corto): acá
el sesgo va para el otro lado, hacia subir de más. `unapub` y `bajopiso` miran el PEOR caso de
TODAS las ventas; esta cuenta mira UNA sola.

**Decisión suya del 15/09, con los números a la vista:** *"claro, si son excepciones esas ventas al
10% y lo gral es arriba del 25% joya. lo dejamos asi. sino aumentamos mucho solo por algunos
envios"*. O sea: **se deja como está y no se cambia la fórmula.** 4 de 5 en la meta es un resultado
sano, y el caso que se pasó queda arriba del piso, que es el lado seguro para equivocarse.
**Lo que NO se hizo, a propósito: bajar la twin a $19.860.** Bajar un precio no lo decide el robot
ni yo (regla 5). Si la twin deja de vender, ése es el primer lugar donde mirar.

**Para revisarlo cuando quiera: `tocados[:horas]`**, que lista lo que tocó el robot, en qué margen
quedó hoy y a qué precio debería estar. Sin `bajar` SOLO LEE.

## EL ROBOT MEDÍA EL MARGEN SIN EL ENVÍO Y DEJABA PASAR 17 PUBLICACIONES (17/09/2026)

Salió de una venta que él vio en **+21%** y que el robot no subió ni avisó. **El Telegram estaba
bien** (el aviso de la suba del Kiss Sexy le llegó): lo que estaba mal era la cuenta.

**El margen se mide dividiendo por costo + impuestos + ENVÍO**, y eso lo decidió él el 01/09
(*"al vender un producto y pagar TODO lo que descuentan (…) me tiene que quedar un 30%"*). La
pantalla lo hace así y lo dice en el código: *"lo único que cambia es el DIVISOR"*. La ganancia en
pesos NO se mueve — el envío ya está restado del neto y sumarlo abajo no es contarlo dos veces.

**Tres comandos dividían sin el envío**, o sea que veían todo más cómodo de lo que estaba:
 · **el robot que sube solo al vender** — el grave: no subía y **tampoco avisaba**.
 · **`submargen`** — peor todavía: calculaba el precio contra un divisor más chico y devolvía un
   precio **CORTO**. Medido con los números reales del VS Mango Temptation: subía y quedaba en
   **20,19%**, o sea ABAJO del piso, **diciendo que había llegado a la meta**. Es exactamente el
   error del 13/08, cuando se subieron 62 y en la pantalla seguían en 27-29%.
 · **`hermanas`** — solo muestra, pero mostraba de más.

**Abajo de los $33.000 las dos cuentas dan IGUAL** (ML no cobra envío), y por eso nadie lo notó en
un año: el agujero se abre sólo arriba de la barrera, donde están los productos caros.

**Medido ANTES de tocar nada con `comparo:23:60`** (comando nuevo, solo lee, hace las dos cuentas
en **una sola línea** para que no se puedan separar): **17 publicaciones abajo del piso en la
pantalla que el robot daba por sanas**. La peor, el Tendedero Vertical de Luciana: **21% real
contra 36%** que veía el robot. Subirlas todas al piso son $23.120. Ocho están pausadas.

**El multiplicador también cambió.** El envío es un cargo FIJO de Full: no se mueve al subir el
precio, así que entra como constante →
`k = (costo×(1+meta) + meta×envío) / (neto − impuestos×(1+meta))`. Sin ese término el precio nuevo
quedaba corto justo en las caras, que son las únicas donde el envío existe.

**De dónde sale el envío en el robot:** del cargo `shp_fulfillment` de ESA venta, el mismo con el
que `FILL_GESTFULL` arma el `gestFull` de cada ficha. Se reparte igual que el neto cuando la compra
lleva varios productos (si no, vuelve el bug de los Ferrari del 08/09). Si el pago todavía no está
liquidado viene en cero, **pero ahí el `neto` también es estimado y sale MÁS ALTO**: el margen se ve
mejor, no dispara ninguna suba y se corrige solo en la vuelta siguiente. Ése es el lado seguro.

**Probado con las líneas REALES sacadas del archivo** (no una copia, que diría "todo bien" para
siempre) y cuatro casos: el Mango Temptation da 21,0% igual que la pantalla · el multiplicador deja
exactamente 25,00% · abajo de los $33.000 no cambia ni un decimal · y `submargen` pide el neto que
deja 25,00% y 23,00% clavados.

**Y LA MISMA NOCHE SALIÓ EL PRIMER AGUJERO DEL ARREGLO, con el Filtro agua.** A la 1:07 el robot
subió bien el **VS Mango Temptation** (21% → $45.000 a $46.930), que es exactamente el caso que el
arreglo vino a resolver. A la 1:10 avisó *"Margen bajo: **4%** · Filtro agua · subilo a $9.470"*
—de $3.560, o sea **+166%**— de una publicación que **la ficha muestra en 28%**.
**La causa: el envío y el neto salían de lugares distintos.** Cuando ML todavía no liquidó el pago,
`orderNet` devuelve null y el `neto` sale del fallback (precio − comisión), que **NO tiene el envío
restado**; el envío, en cambio, sí podía venir cargado. Con eso el envío se cobraba **una sola vez,
del lado del divisor**, y el margen se hundía de mentira.
**Dos frenos, y hacen falta los dos:** el envío se usa sólo si el neto es el REAL, y nunca puede ser
más grande que lo que ML se quedó en esa venta (`itemGross − neto`) — si lo es, los dos números no
son de la misma venta y se avisa en el log con el nombre del producto. Si alguno no da, el envío
queda en **cero**, que es la cuenta de antes: el margen se ve un poco mejor y el robot no toca nada.
Equivocarse para arriba no rompe ningún precio.
**Y AHORA EL AVISO LLEVA EL ENVÍO Y LOS IMPUESTOS ADENTRO.** Sin esos dos números el mensaje no se
puede chequear contra la ficha, que es justo lo que hubo que hacer a mano esa noche.
Probado con el bloque REAL del archivo y cuatro casos: el Filtro agua da 27% (la ficha dice 28) por
los dos caminos, el Mango Temptation sigue dando 21% y un carrito reparte el envío por lo que vale
cada producto.
**LA LECCIÓN: al meter un número nuevo en una cuenta, la pregunta no es si el número es correcto
sino si sale de la MISMA venta que los otros.** Es la misma del 12/09 con las cajas: cuando dos
partes cuentan la misma plata con números distintos, la diferencia no se pierde.

**LA LECCIÓN, otra vez la misma: si dos partes del sistema miden la misma plata con fórmulas
distintas, una está mal — y la que está sola no es la que está bien por ser el robot.** Y la
segunda: el agujero se escondió un año porque **abajo de la barrera las dos fórmulas coinciden**;
un error que sólo aparece en la mitad de los casos parece que no existe.

## ¿CONVIENE BAJAR UN PRECIO PARA GANAR MÁS? SÍ, PERO SON 2 DE 105 (13/09/2026)

Pregunta suya, y la desconfianza era correcta: *"me parece muy raro que vendiendo más barato ganemos
más"*. Es raro. Medido publicación por publicación con `avisos`, aparecen **dos de 105**:

| | hoy | a | deja |
|---|---|---|---|
| **Pendrive Cruzer Blade 64gb** (Matías) | $24.110 | $23.860 (−1%) | **+$7.030/mes** |
| Piedra Pómez X6 (Ayelen) | $16.510 | $14.850 (−10,1%) | +$667/mes |

**El único caso donde bajar deja más es estar pegado ARRIBA de un escalón de comisión.** El Pendrive
está $250 arriba de uno: bajando esos $250, el cargo que ML deja de cobrar es mucho más grande que
lo que bajó el precio. Cobrás menos y te queda más — y encima quedás más barato, así que no podés
vender menos.

**Fuera de ese caso bajar siempre deja menos.** Por eso son 2 de 105 y no 50: si el comando
empezara a devolver decenas, lo primero que hay que sospechar es la cuenta, no el negocio.

**EL FILTRO AGUA, EL PRIMERO QUE PASÓ EL FRENO DE LA CAJA: NO CONVIENE (14/09/2026).** Es el caso
que él quiso que el robot detectara —vendía 4,13 por día, perdió la caja de compra y se frenó 18
días con 70 u. adentro de Full—, y medido con `hermanas:filtro agua:23` la respuesta es **que no**:
la publicación viva (`MLA1459229525`, Matías, $3.560) ya está en **23,2%**, o sea **justo en el
piso**, y ML pide **$2.721** para ganar la caja. Son $839 abajo del piso: a ese precio se vende
perdiendo.
**La lección, y es la que hace útil al freno: que el robot marque una publicación NO quiere decir
que haya que bajarla.** El freno contesta *"acá hay algo para mirar"*; el margen contesta *"y no se
puede"*. Cuando el precio de la caja está abajo del piso, el competidor la vende más barata de lo
que a nosotros nos cuesta y **el precio no es el problema**: lo que queda es rematarlo a propósito
(`liquidando`) o retirar el stock de Full para dejar de pagar almacenamiento, las dos decisiones
suyas. Por eso `calcFrenoCaja` deja el precio y no baja nada.

## "GANAR LA CAJA DE ALGO QUE NO VENDE, MIENTRAS EL MARGEN AGUANTE" (15/09/2026)

Pedido suyo, con el Seagate 500GB en la mano: *"ese es un claro ejemplo de lo que me tiene que
mandar el robot. bajar re poquito, quedar en % sano y ganar caja de algo que no vende"*.

**EL SEAGATE NO SALÍA EN NINGÚN LADO, Y NO ERA CASUALIDAD.** Las dos cuentas que ya miraban la caja
perdida lo descartaban por el MISMO motivo: **exigen haber vendido antes**.
 · `calcFrenoCaja` (la del aviso diario) → `if (!a || !a.ultima) continue;  // nunca vendió`.
 · `bajarParaMover` (el probe `bajarcaja`) → sin ventas no puede deducir el envío y lo tira.
Las dos están bien para lo que fueron hechas —para medir un FRENAZO hay que saber qué vendía
antes— pero dejan afuera justo su caso: **algo que no vendió NUNCA**. Ahí no hay frenazo que medir
y la pregunta es otra: *¿a qué precio se gana la caja, y con qué margen queda?*

### LA REGLA LA TUVE MAL Y ÉL LA CORRIGIÓ EL MISMO DÍA

Primero puse un tope al **cuánto se baja** (5%, "re poquito"). Él lo cortó, textual:
*"la regla de re poquito está mal. porque en ese caso le ganábamos más del 40%. hasta el 25% se
puede bajar sin problema y es mucho mejor que no vender nada. así que ese re poquito está mal,
porque yo lo bajaría hasta el 25% si es necesario. y el % sano es de 25 hacia arriba"*.

Yo había leído "re poquito" como un límite; no lo era. En el Seagate **alcanzó** con poquito, pero
el límite no es el tamaño de la baja — **es el margen que queda**. Un tope al % escondía justo lo
que él quiere ver: algo que no vende y que bajando 20% pasa a vender quedando en 30%.
**No vender no deja 0% de margen: deja CERO PESOS.**

**LA LECCIÓN, y es de las que se repiten: un ejemplo no es una regla.** Él mostró un caso donde la
baja era chica y yo convertí esa circunstancia en un filtro. Lo que hay que preguntar es qué DECIDE,
no qué se vio en el único caso que había sobre la mesa.

### CÓMO QUEDÓ: `calcCajaBarata`, dos filtros y ninguno más

 1. **NO VENDE** — cero ventas de esa publicación en 30 días.
 2. **% SANO = 25 PARA ARRIBA** — al precio que gana la caja el margen tiene que quedar en 25% o
    más. **Cuánto haya que bajar no importa**: si el margen aguanta, la baja está bien. El % de
    baja se muestra igual, porque es lo que él mira para decidir, pero no descarta nada.

**EL ENVÍO DE ESTAS NO ESTÁ MEDIDO Y SE DICE EN EL RENGLÓN.** Nunca vendieron, así que sale de la
**tarifa de ML** (lo mismo que hace `unapub`), y esa tarifa se midió **$246 CORTA** el 20/08. **No
se le suma un colchón por arriba del 25 porque el 25 es el número que puso él**: lo que corresponde
es que sepa que ese margen tiene un envío estimado adentro, no cambiarle la vara por mi cuenta.

**ESTOS SÍ LLEVAN NÚMERO, al revés que "perdieron la caja y se frenaron".** La diferencia no es de
forma: allá el precio de ML es para ganar la caja **y nada más** —el Filtro agua salió con *"se gana
a $1.000"* teniendo la mercadería a $1.059—, mientras que acá la cuenta ya está hecha ENTERA
(comisión al precio nuevo, envío, IIBB, monotributo y costo) y sólo entran las que quedan sanas.
**Un renglón medido se puede aplicar; uno que no, no.**

**Y LA MISMA PUBLICACIÓN NO PUEDE SALIR EN LAS DOS SECCIONES.** `calcCajaBarata` y `calcFrenoCaja`
se pisan cuando algo vendió hace más de 30 días: para una es un frenazo, para la otra "no vende".
Saldría dos veces, una con número y otra sin él. Gana la medida, y lo descartado se dice en el log.
Es la misma lección de la Piedra Pómez, que salía en subir y bajar a la vez.

**Y las que NO llegan al 25% se listan igual en el log**, con cuánto habría que bajar y en cuánto
quedarían: un *"8 con margen flaco"* sin decir cuáles esconde la que está en 24% por dos pesos.
Al log y no al mensaje — en Telegram sería ruido sobre algo que no se va a aplicar.

**Y HUBO QUE HACERLO MÁS RÁPIDO, porque sacar el tope lo puso lento.** Con el filtro del 5% las
que había que bajar mucho se descartaban GRATIS; sin él, todas pasaban a pedir el envío a ML, que
es la llamada cara (`envioSegunML` consulta varios códigos postales por publicación). La corrida se
fue de 1,5 minutos a más de 20 — el mismo problema de velocidad que ya había mordido en la primera
versión de `avisos`.
**El atajo, y no cambia ningún resultado:** el margen SIN envío es el **TECHO** —con envío sólo
puede ser menor—, así que si ni ese techo llega al 25% no hace falta preguntar el envío. Verificado
con 7 casos con y sin atajo: **los 7 dan exactamente lo mismo**.

**Y UN TOPE DE 15 CONSULTAS DE ENVÍO POR CORRIDA** (`maxEnvios`). Esto corre adentro de `ml-daily`
todas las noches: si un día hay 40 candidatas, el aviso se cuelga y **se lleva puesto el resto del
paso nocturno**. Un aviso que no sale porque tardó es peor que uno incompleto.
**Las que quedan sin medir se cuentan y se imprimen con nombre**, aclarando que no es que no
sirvan sino que no se alcanzó a mirarlas y salen en la corrida siguiente. Un tope mudo sería el
descarte por omisión que ya mordió tres veces.

**Probado con los números REALES del Seagate**: da **44,2%**, idéntico a lo que devolvió ML con
`unapub` — que es la forma de saber que la fórmula es la misma y no una copia que se va a separar.
Probados también los casos que la regla vieja se comía (bajar 20% y quedar en 36%, bajar 35% y
quedar en 30%: los dos SALEN) y los tres que no tienen que salir (el WD Green en 22,9%, una baja
chica con margen flaco, y una baja del 45% que hunde el margen a 1,7%).

**EL SEAGATE, APLICADO EL MISMO DÍA CON SU AUTORIZACIÓN** (*"baja seagate hasta ganar. ojo no bajar
mucho %"*): `MLA3920081802` pasó de **$187.469 a $180.046** (−4,0%). Releído de ML: la caja de
compra pasó de **PERDIENDO a GANANDO** y el margen quedó en **44,2%**.

## MODO REMATAR: DOS ESCALONES, Y LA PAD 2 ES LA QUE DEFINIÓ LOS NÚMEROS (16/09/2026)

Pedido suyo: *"a los 45 días de que un producto llega a full y no vendió ni un solo día, activar
modo 'ganar competencia/vender' (…) obviamente que no sea automático, que avise. y cada caso se
analiza manualmente"*.

El comando es **`rematar[:días1[:pct1[:días2[:pct2]]]]`** y **SOLO LEE**. Los números viven en
`cyc/mlconfig` (`rematarDias1/rematarPct1/rematarDias2/rematarPct2`).

| escalón | cuándo | hasta qué margen | por qué ese número |
|---|---|---|---|
| **1** | **45 días** sin vender | **20%** | ML cobra almacenamiento a los 60 (`ALMAC_DIAS`): a los 45 quedan 15 días para reaccionar **antes de empezar a pagar**. |
| **2** | **90 días** | **15%** | Ya lleva un mes pagando almacenamiento y el reloj del descarte corre. |

**NO ES UN COMANDO NUEVO: extiende `calcCajaBarata`**, que ya medía esto con piso 25% y ventana de
30 días. Dos copias de la misma cuenta es el error que ya mordió cuatro veces en este archivo.
Y hace **UNA sola pasada** a ML con el filtro más flojo, clasificando después: correrlo dos veces
duplicaba las consultas sin cambiar un resultado.

### LO QUE CAMBIÓ LA PAD 2, QUE ES EL EJEMPLO QUE ELIGIÓ ÉL

Él pidió bajar **hasta 0%**. Probar la regla contra la **Tablet Xiaomi Redmi Pad 2**
(`MLA1782639641`, Matías) mostró que 0% es demasiado suelto, y por tres motivos distintos:

**1. EL RELOJ, tal como él lo dijo, se comía su propio ejemplo.** *"No vendió ni un solo día"* deja
afuera a la Pad 2, que **vendió 4 unidades, la última hace 71 días**. Ahora se mide **días SIN
VENDER**, y para las que no vendieron nunca el reloj arranca cuando llegó a Full — **sólo con fecha
REAL de entrada** (`aprox:false`), igual que `calcBajarStock`: una fecha aproximada dice hace cuánto
MIRAMOS, no hace cuánto hay stock.

**2. EL % ES EL CONTROL EQUIVOCADO PARA LAS CARAS.** La Pad 2 está a $497.310 con margen 23,5%;
ganar la caja pide $425.741 y la deja en **7,6%**. En porcentaje suena a "se puede"; en plata son
**$54.750 por unidad, $109.500 por las dos**. Es la lección de los Paulvic **al revés** —allá 30,8%
eran $610—: un piso en % trata igual a un perfume de $14.000 y a una tablet de medio millón.
**Por eso cada renglón dice cuánta plata resignás, en pesos.** Es el número con el que se decide.

**3. Y A ESA TABLET NO HAY QUE REMATARLA**, por dos cosas ya medidas: el almacenamiento **se cobra
por LUGAR, no por plata** (una tablet es chica: paga casi nada por estar ahí), y *"la plata ya no es
el límite, es el proveedor"* — liberar $597.576 que no se pueden gastar vale mucho menos que los
$109.500 que se resignan. **Con piso 0% ese renglón salía recomendado.** Con 15% queda afuera.

**El 0% no se perdió: vive en `liquidando`**, que lo decide él uno por uno y es exactamente para eso.

### LAS VISITAS MANDAN SOBRE TODO LO DEMÁS

Regla ya medida el 20/08: **menos de 20 visitas = no la ve nadie**, y ahí bajar el precio **regala el
margen SIN vender** — te quedás sin la ganancia *y* con el stock adentro, el peor de los dos
resultados. Esas salen en su propia lista, con el motivo y **SIN precio al lado**: un renglón con
precio invita a aplicarlo (la lección del Filtro agua del 14/09). La consulta va **después** del
descarte gratis del margen, para preguntar menos.

### LA PRIMERA CORRIDA: CERO, Y CON EL PORQUÉ DE CADA UNA

Miró 9 candidatas y **ninguna entró en ningún escalón** — pero el cero viene explicado, que es la
lección de `liquidar` (0 de 137) y del marcado de cajas:
 · **2 que no las ve nadie**: Samsung Buds Core Black (**2 visitas**) y Lapidus (**0 visitas**).
 · **7 que no llegan al piso ni bajando**, la Pad 2 entre ellas (11,1% antes del envío).
 · Y 32 descartadas por recientes + 4 sin fecha real de entrada.
**Que no haya nada para rematar hoy es un resultado, no una falla.**

### YA SALE SOLO EN EL AVISO DIARIO (16/09/2026)

Pedido suyo: *"dale, meteselo al aviso diario"*. Ya no hay que correr `rematar` a mano: los dos
escalones salen todas las noches en el mensaje de Telegram, numerados, para poder contestar
*"bajá el 3"*. El comando `rematar` sigue existiendo para mirarlo cuando quiera.

**Se hizo con la MISMA llamada a `calcCajaBarata` que ya usaba el aviso**, no con una segunda
consulta a ML: se pide con el piso MÁS FLOJO (el 15% del escalón 2) y se clasifica después en tres
niveles. Pedirla dos veces duplicaba el trabajo del paso nocturno sin cambiar un solo resultado.

**Gana SIEMPRE el nivel que menos margen resigna.** Si algo llega al 25% sale en la sección sana y
NO como remate al 15% — sería proponerle regalar plata que no hace falta regalar. Por eso el orden
es: sano 25% → escalón 2 (90 d / 15%) → escalón 1 (45 d / 20%).

**Cada renglón del remate dice la plata que resigna EN PESOS**, que es el número con el que se
decide. Es la lección de la Pad 2: 7,6% se lee como *"se puede"* y son $109.500 por dos unidades.

**Tres cosas que hicieron falta y no eran opcionales:**
 · **La deduplicación se arma con lo que SE MUESTRA, no con la lista entera.** Al pedir con el piso
   flojo quedan adentro filas que no entran en ningún nivel; si ésas taparan el renglón de
   `calcFrenoCaja`, la publicación no saldría en NINGUNA lista. El descarte silencioso de siempre.
 · **Las que no las ve nadie (menos de 20 visitas) van al log y SIN precio al lado.** Bajarlas
   regala el margen sin vender: te quedás sin la ganancia *y* con el stock adentro.
 · **Las que pasan el piso flojo y no entran en ningún escalón se listan igual**, con cuánto habría
   que bajar. La que hoy está en 17% con 50 días entra sola dentro de 40, y conviene saberlo.

**Y APARECIÓ UN AGUJERO VIEJO AL TOCARLO:** el chequeo de *"no hay nada nuevo, no mando mensaje"*
estaba **antes** del bloque *"perdieron la caja y se frenaron"*. O sea que un día en que eso fuera
lo único nuevo, el aviso se cortaba y no salía nada — justo la sección que él pidió expreso el
13/09. Se movió al final, después de todas las secciones.

**OJO AL APLICAR UNO DEL ESCALÓN 2:** `setPriceTo` tiene el tope duro de `PISO_MINIMO_ABSOLUTO`
(20%) que **no se pasa ni configurando**, así que un precio del 15% lo va a rechazar. Es a propósito:
esa red se abre el día que él quiera aplicar uno, no antes.

## ¿SE PUEDE AUTOMATIZAR LA SUBA DE PRECIOS? MEDIDO EL 12/09/2026

Pregunta suya: *"se puede automatizar que se aumente sola una publicación que se esté vendiendo
bien y tras un análisis vea que se pueda aumentar para ganar más y seguir vendiendo igual?"*.

**Se hizo primero el que MIDE (`subirpuede`), a propósito, y no se automatizó nada.** Subir es la
única operación del robot que puede **apagar las ventas de un producto que hoy funciona**, y eso se
nota tarde: bajar de más se ve en la primera venta, subir de más simplemente deja de vender y
parece que el producto se murió. Antes de dar esa palanca hay que saber cuánta plata hay en juego.

**LA SEÑAL, y es la única dura que tenemos:** en una publicación de CATÁLOGO, si hoy GANAMOS la caja
de compra, todos los que están más baratos **no están compitiendo** (sin stock o no califican) — ya
verificado con el Ferrari el 25/08 y con el Pendrive 8gb hoy. El techo es entonces el competidor más
barato que está ARRIBA nuestro.

**ES UNA COTA, NO UNA RECOMENDACIÓN DE PRECIO**, y la primera corrida lo mostró feo: en los Paulvic
ese competidor de arriba estaba al **DOBLE** ($14.360 contra $28.990) y el comando proponía **+99,9%**.
No es el mismo perfume: es otra presentación que ML metió en el mismo catálogo. Es la misma lección
que ya estaba anotada para `price_to_win` —*"que se gane a $900 no quiere decir que a $900 haya
margen"*— sólo que para el otro lado. **Por eso se sube como mucho +10% por vez y se vuelve a
medir**: un escalón chico se nota en las ventas del mes y se deshace; uno grande te deja un mes sin
vender.

**LO QUE NO SE PUEDE MEDIR: las 36 publicaciones que venden y NO son de catálogo.** Ahí no hay
competidor contra el cual medir y las visitas solas no alcanzan. La única forma de saberlo es probar.

**NO SE RECOMIENDA SUBIR LO QUE NECESITÁS VENDER (14/09/2026).** Él lo marcó con el Ferrari Negro:
*"dice que vendió 3, pero hacía como 1 mes que no vendía y tenemos 12 en stock. yo lo bajé para que
venda y no paguemos stock antiguo. o sea estamos 'desesperados' en vender, si lo aumento quizás se
vende menos aún. yo creo que el robot no tiene en cuenta nada de eso"*.
Tenía razón: `calcSubirPuede` miraba **cuántas** vendió en 30 días y nunca **cuándo** ni **cuánto
stock hay**. Así, algo que vendió 3 el primer día de la ventana y NADA en los 29 siguientes se leía
igual que algo que vende todas las semanas — y son situaciones opuestas.
**Dos frenos, y hacen falta los dos porque agarran casos distintos:**
 · **`SUBIR_MAX_DIAS_SIN` (15 días)** → si dejó de vender, subirle el precio no lo despierta.
   2 unidades que se frenaron pasan el freno de stock, así que ese solo no alcanza.
 · **`SUBIR_MAX_DIAS_STOCK` (60 días)** → con más stock del que vendés en 60 días ya vas camino a
   pagar almacenamiento (`ALMAC_DIAS`), o sea que subir empeora justo lo que hay que resolver.
   200 u. que venden todos los días pasan el freno de días sin vender, así que ése solo tampoco.
**Medido el mismo día:** Ferrari Negro **11 u. = 110 d de stock** → afuera (su caso exacto) ·
Batidora de Luciana **39 u. = 65 d** → afuera · 5 Paulvic afuera por 17-25 días sin vender · los
Paulvic que quedan tienen **46 d de stock** y vendieron hace 3-9 días, o sea que rotan.
Y cada renglón del aviso ahora dice **vendió N · última hace X d · N u. en Full**: los tres juntos
son justo lo que le faltó para no tener que dudar.

**LOS DÍAS DE STOCK VAN POR PRODUCTO×CUENTA, NO POR PUBLICACIÓN**, y la primera prueba mostró por
qué. `cyc/inventory` guarda el stock por producto×cuenta, así que en el Paulvic —donde cada aroma
es una publicación aparte de la MISMA ficha— las 236 unidades se le imputaban ENTERAS a cada una:
el renglón decía *"236 u. = 7.080 días de stock"*. **La conclusión daba bien igual, y ése es el
peligro**: un número absurdo al lado de una conclusión correcta pasa desapercibido hasta que
alguien lo mira. Dividiendo por lo que ese producto vende en esa cuenta da 46 días, que quiere
decir algo. Misma clave que usa `calcBajarStock`.

**Y APARECIÓ ALGO PEOR AL TOCARLO: el probe `subirpuede` tenía la cuenta COPIADA adentro**, no
llamaba a la función compartida — **y este archivo afirmaba que sí**. Las dos copias ya se habían
separado: a la del probe le **faltaba el freno de `liquidando`**, o sea que proponía subir lo que él
bajó a propósito para rematar. Es el mismo patrón de los ocho comandos con `|| 30` adentro y del
costo de la caja escrito en dos archivos, con el agravante de que acá **el comentario prometía lo
contrario**. Ya llama a `calcSubirPuede` y se borraron las 94 líneas duplicadas.
**La lección, otra vez: un comentario que dice que dos cosas comparten código no es prueba de que
lo compartan.** Si dos comandos tienen que dar el mismo número, la forma de garantizarlo es que
llamen a la misma función — y eso se verifica corriéndolos, no leyéndolos.

## LO QUE COBRA ML POR VENDER: 28,3% PROMEDIO, Y NO ES LO MISMO QUE EL 16% (11/09/2026)

Salió de que él comparó la ficha contra el simulador de ML y no coincidían: la ficha decía **30,5%**
de comisión y ML **16%**. Medido con el comando nuevo `comisiones`, preguntándole a ML publicación
por publicación (`/sites/MLA/listing_prices`, el MISMO endpoint con el que `netoweb` fija precios):

| tipo | publicaciones | comisión promedio | vendidas en 30 días |
|---|---|---|---|
| **CLÁSICA** | **142** | **28,3%** | 1.276 u. |
| PREMIUM (con cuotas) | 4 | 26,5% | 1 u. |

**LOS DOS NÚMEROS SON CIERTOS Y NO SE CONTRADICEN.** El 16% es la comisión **base**; el panel
muestra lo que ML cobra **completo**, con el **cargo fijo de ~$1.230** adentro. Ese cargo no depende
del precio, así que **cuanto más barato el producto, más alto sale el %**. Medido por ML misma:

| precio | lo que cobra ML |
|---|---|
| $14.360 | 24,3% |
| $11.999 | 26,6% |
| $9.230 | 29,9% |
| $6.000 | 36,7% |
| $4.880 | **41,6%** |

Es la confirmación, con datos de ML, de lo que ya estaba anotado: **abajo de ~$4.000 el cargo fijo
se come el producto.** Y explica el 30,5% de la ficha: esa publicación está en Premium (base ~25,9%)
y a $24.000 el cargo fijo agrega ~5 puntos.

**LO QUE APARECIÓ DE PASO, Y ES PLATA: el Xiaomi Redmi Watch 4 (`MLA1871169569`, Matías, $209.720)
está en PREMIUM pagando 25,9% cuando en Clásica pagaría 12,5%.** Son **$28.102 en UNA sola venta**,
y vendió 1 en 30 días. En un producto caro los 13 puntos de diferencia son mucha plata.
**Pero no es un error que se arregle solo: Premium ofrece cuotas sin interés y por eso vende más**,
y en un producto de $209.720 las cuotas pesan. Es decisión suya, y el comando no cambia nada.
Las otras 3 Premium venden poco o nada, así que ahí la diferencia es chica.

**El resto del catálogo (142 de 146) ya está en Clásica**, que para ellos es lo más barato: pasar
esas a Premium costaría $1.458.931 más por mes. O sea que acá no había nada roto.

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

## UNA SOLA CUENTA POR PRODUCTO (09/09/2026)

Norma suya: *"quiero comenzar a dividir las publicaciones por cuentas. no quiero publicacion
compartida (…) el objetivo final es que cada cuenta venda su mercaderia unica. que NUNCA se cruce
mercaderia entre cuentas"*.

**Cómo se elige la dueña: gana la que vendió MÁS RECIENTE.** Nada más que eso. Lo corrigió dos
veces el mismo día porque las dos primeras versiones eran más elaboradas y peores:
 · medir **ventas por día con stock** (la corrección del 20/08 en la reposición) le devolvía el
   producto a la cuenta que él dejó vacía a propósito — *"si una cuenta vendio mas reciente que
   otra, es porque la otra no tiene stock y eso es porque ya no quiero vender mas en esa cuenta"*.
   Quedarse sin stock acá **no es una desventaja que compensar, es la decisión ya tomada**.
 · medir **unidades de los últimos 30 días** le daba el producto a la que vendió 20 hace un mes por
   encima de la que vendió 3 la semana pasada — *"el producto se está vendiendo en la de hace 20.
   no es que hace 20 días que no vende: no se vende más ahí"*. **El producto no dejó de venderse,
   se mudó de cuenta.**
**La lección: la misma cuenta que es correcta para saber CUÁNTO reponer es la equivocada para
saber DÓNDE vender.**

El comando es `repartir[:días]` y sólo lee. No decide cuando no puede: si nadie vendió, o si las
dos últimas ventas caen en la misma semana, va a la lista de decidir a mano.

**ESTADO AL 10/09/2026: el reparto en el PANEL está terminado.** 38 productos estaban en más de una
cuenta; los 30 con dueña clara y los 8 dudosos ya tienen su cuenta única. `repartir` devuelve la
sección "para aplicar" VACÍA, que es la forma de verificarlo.
Decisiones suyas de ese día: balanza viaje → Ayelen · Kit Luces Bici → Luciana · De la Patagonia KO
→ Adriana · Cortapelo 4 en 1 → Ayelen · Estimulador → Ayelen · **Indoor → Ayelen** (marcado con
`pasara`: Ayelen todavía NO tiene la publicación y sale en ámbar hasta que la cree).

**Las DOS excepciones, decididas por él:**
 · **Paulvic: queda compartido entre Adriana y Luciana.** Todos los aromas van a Adriana **menos la
   Persea, que va a Luciana**. **La marca es por PRODUCTO, no por aroma**, así que esto NO se puede
   marcar con `nomandar` sin sacarle a Luciana los 70 aromas. Se deja compartido a propósito.
 · **Termómetro horno: se deja como está** ("después vemos"). Ninguna cuenta lo vendió en 90 días.

**LO QUE FALTA, Y ES LO GRANDE: ~58 publicaciones repetidas siguen VIVAS en ML.** `nomandar` saca a
la cuenta del reparto y de "Contar lo que hay", **no borra ni pausa la publicación**. Hasta que se
pausen, en ML siguen siendo publicación compartida. Las más cargadas: Pizarra Mágica 7 · P47 5 ·
p47 oreja gato 4 · Balanza Cocina, F9, Batidora, Tira Led y 2 Separadores 3 cada uno.
Pausarlas TOCA ML de verdad: no se hace sin que él lo pida expreso.

**Un caso raro que quedó abierto: el P47 está marcado afuera de las TRES cuentas**, incluida Matías,
que es la que lo vende (51 u. en 90 días). Viene de cuando el 07/09 pidió pasarlos todos a Ayelen.
Si eso sigue en pie está bien, pero hoy nadie le puede mandar mercadería.

## LA IDEA GRANDE QUE QUEDÓ ANOTADA: BUSCAR QUÉ CONVIENE COMPRAR (16/09/2026)

Pedido suyo, textual: *"nosotros compramos de comprasparaguai y vendemos en ML. quiero que vos
automaticamente busques y me digas este producto da el precio, la gente compra, no pasa cierto
costo, no tenemos problemas con marcas. cosas asi. hay mucho que afinar."*

O sea: **pasar de "¿a qué precio vendo lo que ya tengo?" a "¿qué me conviene empezar a vender?"**.
Es el cambio más grande que se pidió hasta ahora, y **todavía no está hecho**.

**LO QUE HACE FALTA ANTES DE ESCRIBIR UNA LÍNEA, y es lo que él llama "afinar":**
 · **El margen.** Es lo único que ya sabemos calcular: costo en Nissei → precio en ML → comisión
   (con el escalón, preguntándole a ML) → envío → IIBB → monotributo. La cuenta ya existe entera.
 · **"la gente compra"** — hay que definirlo con un número. Ventas del catálogo de ML, visitas,
   cantidad de vendedores. **No hay dato propio**: es todo de afuera.
 · **"no pasa cierto costo"** — hay que fijar el tope, y no es sólo la plata: con US$1.000 por
   pedido, un producto caro se come el pedido entero (el Galaxy A07 son US$205 de los 1.000).
 · **"no tenemos problemas con marcas"** — el más importante y el que más caro sale si se
   equivoca. Ya hay tres publicaciones frenadas por ML pidiendo documentación (el Bare Vanilla y
   los dos Termómetros) y un reclamo de "adulterado" perdido. Perfumes y electrónica de marca son
   justo lo que ML mira. **Esto probablemente NO se pueda decidir solo: lo sabe él.**

**EL FRENO QUE YA SE APRENDIÓ HOY Y VALE ACÁ:** emparejar el catálogo de Nissei con el nuestro por
el nombre es el filtro por palabras que ya falló cuatro veces. Para un producto NUEVO es peor,
porque no hay ficha contra la cual contrastar. Lo que funcionó con los códigos fue: **el agente
trae pruebas (título exacto, código, precio, link) y NO elige; la decisión la toma él.** Cualquier
versión de esto tiene que respetar eso.

**EL TOPE TÉCNICO SE CAYÓ: EL ROBOT PUEDE LEER NISSEI Y EL CATÁLOGO DE ML SOLO (17/09/2026).**
La nota vieja decía que sin salida a internet esto no se podía hacer. **Era cierto para el CHAT y
falso para el ROBOT**: `sync.mjs` corre en las máquinas de GitHub, que tienen internet abierto.
Pregunta suya que lo destapó: *"me encantaria que vos puedas entrar en ml, no hay forma alguna que
vos extraigas esos precios?"* — manejar dos chats lo obligaba a copiar listas a mano.
Medido con **`probarweb[:<texto>]`** (solo lee, no toca ML ni la base):

| | |
|---|---|
| `nissei.com` (home y buscador) | ✅ **200 · 798 KB · los precios están en el HTML** |
| `comprasparaguay.com.ar` | ❌ **403, y NO es el User-Agent** · reintentado con las cabeceras de Chrome el 17/09: mismo 403 |
| `/products/search?site_id=MLA&q=…` | ✅ busca el CATÁLOGO por texto ("azzaro sport" → 3.547) |
| `/products/<id>/items` | ✅ vendedores con precio, **stock** y quién tiene la caja |
| `/sites/MLA/search?q=…` | ❌ **403 forbidden** · ML cerró la búsqueda libre de publicaciones |

**EL 403 DE COMPRASPARAGUAY ES EL PROBLEMA GRANDE, Y NO SE ARREGLA.** Aclaración suya del 17/09:
*"en esta pagina esta en pesos y dolar. vos el dolar tomalo como dice ahi y mas el gasto queda el
15%"* y *"el que importa para hacer el pedido es el de nissei en compra paraguay"*. O sea que
**las DOS cosas que definen la compra —el precio en DÓLARES y el código de pedido— viven ahí**, y
esa página bloquea al robot. Se reintentó con el User-Agent y las cabeceras de un Chrome de verdad:
**mismo 403**, así que no era cómo nos presentábamos. No se insiste.
**Nissei muestra guaraníes y su número INTERNO**, que no es el código de pedido: en el Cabotine 100mL
la lista da `91144` y el que él usa es `91832`.
**El puente es un solo número y lo pone él: `cyc/mlconfig/gsPorDolar`, con el comando `gsdolar`.**
Se saca mirando un producto en las dos páginas y dividiendo (Gs. 117.000 ÷ US$ 13 = 9.000). Si no
está cargado, `nissei` informa en guaraníes y **no convierte nada** — dar un costo en pesos con un
cambio adivinado se mete en todos los márgenes y no se nota. Conviene rehacerlo cada tanto.
**El desglose de los US$1.000, textual:** *"mercaderia + comprar dolar (siempre es mas por
comisiones) + traslado = mercaderia + el 15%"*. O sea que el 15% YA incluye la compra del dólar con
sus comisiones y el flete: no se le suma nada más para llegar a la oficina.

**Y ÉL PIDIÓ RENOMBRAR LAS FICHAS con el nombre resumido de comprasparaguay** (*"sino da a errores
de nombre o se confunde"*). Está bien, pero **el orden importa: primero el CÓDIGO, después el
nombre.** Con el código guardado en la ficha el emparejado deja de ser por palabras y el riesgo se
termina; renombrar primero deja el mismo filtro por palabras que ya falló cuatro veces, sólo que
con nombres nuevos. El nombre es para que lo lea ÉL, no para que lo use la máquina.

**Lo único que se pierde es buscar publicaciones que NO están en catálogo** — y eso tampoco lo
podía el chat con Chrome (lo dejó anotado con el Animale Black). Perfumes y electrónica viven casi
todos en catálogo, así que para lo que se compra no falta nada.
**El 404 "No winners found" NO es un error**: es la respuesta cuando ese catálogo no tiene ningún
vendedor activo. La primera corrida cayó justo en uno así y parecía que el endpoint no andaba.
**El error que cometí al escribir el probe, y vale como regla: el id de un CATÁLOGO también
empieza con "MLA"** (`MLA22364117`). Los separé por el prefijo, imprimió los catálogos como si
fueran publicaciones —"$0 · vendidas ?"— y no llegó a probar el endpoint que importaba. **Dos cosas
no se distinguen por cómo se llaman, se distinguen por de dónde vinieron.**
**Y por eso el probe no se conforma con un 200:** mira el TAMAÑO y si hay algún precio adentro del
HTML. Una página armada con JavaScript contesta 200 y baja un cascarón vacío — leer eso como que
anduvo es el mismo error que leer un cero como buena noticia.

## EL "PROMPT GUAY": EL CHAT QUE MIRA LOS PRECIOS DE PARAGUAY (17/09/2026)

Pedido suyo: *"pasame el prompt que le tengo que mandar al chat nuevo (…) seguramente te vuelva a
pedir el texto muchas veces, pongamosle un nombre asi siempre te pido eso y ya sabes de lo que
hablo"*. **Se llama `PROMPT GUAY`.** Cuando lo pida por ese nombre, se le pasa el texto entero.

**POR QUÉ EXISTE:** comprasparaguay bloquea al robot (403, ver arriba) y ahí están el **precio en
dólares** y el **código de pedido**. O sea que esa parte la tiene que mirar un chat con navegador.
**Él usa 4 PCs y se mueve entre ellas**, así que el prompt es **autónomo**: no necesita la carpeta
del repo, se pega y listo.

**Las direcciones que usa ese chat:**
 · panel de CYC → **https://maticaldas-del.github.io/web-cyc/** (GitHub Pages · **sin contraseña**)
 · `comprasparaguay.com.ar` · `nissei.com` · MercadoLibre Argentina

**EL REPARTO DE TAREAS, y es lo que hace que la cuenta no se pueda romper:**
 · **ESTA LÍNEA DECÍA "el chat carga el COSTO" Y ES FALSA DESDE EL 17/09/2026 A LA TARDE.**
   El chat **NO toca el `Costo US$`. Nunca.** Carga el **`Precio Nissei US$`** (crudo, en su propio
   campo) y el **`Código Nissei`**, y el panel hace todo lo demás. El botón "Usar este costo", que
   era el puente entre los dos, **se sacó**. Ver la sección "EL PRECIO DE PARAGUAY NO PISA EL COSTO".
   El motivo, suyo: *"lo que compre a un precio se vende a ese precio. si aumenta no compro"* — el
   costo es lo que PAGÓ y el precio de Paraguay es si conviene REPONER; que uno pise al otro le
   mueve los márgenes de lo ya comprado y, con la suba automática prendida, le sube precios.
 · **El chat NO calcula ningún margen**: los lee de la ficha, que muestra los dos. Así no puede
   haber dos fórmulas diciendo cosas distintas, que es el error que ya mordió seis veces acá.
 · **NO ELIGE**: trae título exacto, código, precio y link, y decide él.
 · **Lo único que puede escribir**: `Precio Nissei US$` · `Código Nissei` · el botón "no había"
   (Nissei no lo tiene) · "no lo compro por ahora" · cargar candidatos en "Para probar" · una ficha
   nueva. **El `Costo US$` NO.** Nada de tocar precios de ML, cerrar cajas, stock, ni publicar. El
   panel escribe directo en la base, sin prueba y sin deshacer.
 · **El link del catálogo de ML es obligatorio al cargar un candidato**, desde el 17/09: sin él el
   robot empareja por nombre y ya devolvió el "Watch 3" cuando se le pidió el "Watch 4".

**Los topes que él fijó:** US$250 por unidad · 40×40×40 cm · nada de marcas que ML frena (Lancôme y
ese nivel).

**SE MIRA TODO EL CATÁLOGO, NO SÓLO PERFUMES. Regla suya del 18/09/2026.** Este renglón decía
*"suma si sirve para la perfumería, porque ahí hay segunda salida (el caso Victoria's Secret)"* y
él lo sacó mirando el primer pedido armado —**17 productos y los 17 perfumes**—: *"eliminar eso.
porque al ser solo dos unidades, si no se vende no pasa nada. sacar esa regla. mira todo (eso no
significa que no pongas perfumes, significa que midas los mejores productos)"*.
**El argumento es suyo y es el que hace que la regla vieja sobre.** La segunda salida importaba
cuando probar algo costaba caro; acá se prueba con **2 unidades**, así que lo que se arriesga es
mínimo y lo único que tiene que decidir es **el margen**. Una preferencia de categoría acá no
protege de nada: sólo tapa productos mejores.
**No era una regla del panel ni del robot** —ninguno de los dos mira la categoría— sino de este
texto, o sea del chat que busca. Los perfumes siguen entrando cuando son de los mejores; lo que no
entra es preferirlos por ser perfumes.
(Ojo con el otro renglón que quedó: *"prioridad a lo ya probado"* es de la **canasta de
reposición** —lo que YA vendés— y no de "Para probar", que por definición es lo que todavía no
probaste. Ahí manda el margen.)

**Y el aviso que hay que repetirle al chat:** *misma marca ≠ mismo producto*. Ya ofreció el Cabotine
de **100 ml** cuando vendemos el de **30 ml**, y el Animale **Black** cuando vendemos el **For Men**.

### EL TEXTO DEL SIMULADOR QUE VA ADENTRO DEL `PROMPT GUAY` (18/09/2026)

El prompt que él arma decía *"Matías tiene un SIMULADOR: pedíselo"* **sin decir dónde está ni cómo
se carga**, así que el chat no lo iba a encontrar. Éste es el bloque que va en su lugar, listo para
pegar. Cuando pida el `PROMPT GUAY`, va adentro.

> **EL SIMULADOR REAL DE PRECIO — es el que decide, no el % del robot**
>
> Está en el panel: **Pedidos → 🇵🇾 Paraguay → 🆕 Productos nuevos → 🧮 Simulador real de precio**.
> Es un desplegable; se abre y se carga a mano. **No guarda nada ni toca ningún precio: sólo
> calcula.** Se puede usar todas las veces que quieras.
>
> **Qué le cargás, campo por campo:**
> 1. **precio en comprasparaguay (US$)** — el de la fila de NISSEI, **CRUDO, sin sumarle el 15%**.
>    El simulador le suma el 15% solo. Si le cargás el precio ya con el 15%, el margen sale mal.
> 2. **a cuánto lo vendés en ML** — el listado **MÁS BARATO** del producto exacto, que es el peor
>    caso y el que manda.
> 3. **en qué cuenta** — cambia el IIBB (Adriana 4,07 · Luciana 4,37 · Ayelen 5,95 · Matías 4,58).
>    Si no sabés en cuál va, poné Ayelen: es la que más paga y deja el margen más bajo.
> 4. **cuotas sin interés (%)** — **dejalo VACÍO** salvo que el vendedor más barato ofrezca cuotas
>    sin interés DE VERDAD. La promo de 2 cuotas que ML muestra en todas las publicaciones **no
>    cuesta nada** y no se carga.
> 5. **cuántas entran en una caja** — de una caja de 70×70×70 cm. Mandar una caja a Full sale
>    $17.500 y eso se reparte entre las unidades. Un perfume de 100 ml son ~100 por caja. **Si lo
>    dejás vacío, ese costo no se cuenta y el simulador te avisa en ámbar** que el margen se ve
>    mejor de lo que va a ser.
> 6. **% de reclamos** — vacío. En un producto nuevo no hay con qué medirlo.
> 7. **la comisión** — elegí de la lista un producto que ya vendemos **de la misma categoría y de
>    precio parecido**. Si tenés el % exacto del simulador de ML, ponelo en la casilla de al lado:
>    ése manda sobre el producto copiado y es el más seguro.
>
> **Qué te contesta:**
> · la línea entera de la plata: comisión de ML, envío de Full, IIBB + monotributo, la mercadería
>   puesta, lo que sale mandarlo a Full y los reclamos;
> · **cuánto te queda en pesos y el margen** — **verde si llega al 25%**, ámbar si no;
> · **a qué precio llegarías al 25%**, por si querés saber cuánto falta;
> · y un desplegable *"¿y si lo vendo más caro?"*.
>
> **Tres cosas que el simulador te avisa y hay que respetar:**
> · **La barrera de los $33.000.** Abajo de ese precio ML no cobra envío; arriba lo cobra siempre
>   (~$6.190) y el margen se cae de golpe. **Ese precio no se cruza.**
> · **La tabla de precios más altos NO ve los escalones de la comisión de ML.** Siempre te va a
>   decir que más caro deja más, y eso es falso en algunos tramos. Sirve para mirar, no para
>   decidir un precio.
> · **En un producto nuevo el precio no lo elegís vos: lo pone el competidor más barato.** Un
>   margen calculado a un precio más alto que el de él es el margen de una venta que no va a pasar.
>
> **El número del simulador gana sobre el % del robot.** Si no coinciden, el bueno es el del
> simulador: el robot no puede saber cuántas unidades entran en una caja.

**OJO CON LA DIRECCIÓN DEL PANEL: es pública y sin contraseña.** Cualquiera que la tenga entra —
se comprobó el 17/09 cuando él le pasó el link al chat local y entró de una. Los datos que se ven
ahí (costos, márgenes, ventas) salen de Firebase, y **si sus reglas están abiertas, los ve cualquiera
con esa dirección**. Queda como pendiente para mirar, no se tocó nada.

## LO QUE EL CHAT DE COMPRAS YA BARRIÓ, PARA NO HACERLO DOS VECES (18/09/2026)

El chat que mira comprasparaguay hizo el primer barrido grande y **el estado vivo lo lleva él en su
propio texto** (el `PROMPT GUAY`, que él va actualizando). Acá va sólo lo que hay que recordar para
no mandarlo a repetir trabajo caro.

**PERFUMERÍA: BARRIDA ENTERA.** Las 1.227 filas de Nissei en comprasparaguay. De ahí salieron
**491 que valía la pena mirar** en ML, **169 que existen como producto EXACTO**, **21 con ventas** y
**9 que pasaron todo**. Las demás quedaron descartadas con motivo. **No se vuelve a mirar**, con una
excepción: las de **más de US$40 y las de menos de US$10**, que el filtro dejó afuera y él todavía
no decidió si valen (arriba de US$40 el producto tiene que venderse por encima de $150.000 para dar).

**ELECTRÓNICA: la que ya se miró y no dio** — los Redmi Buds y Smart Band, los Redmi Watch y Watch
S5/5 Lite, la Redmi Pad 2, los Galaxy A06/A07 y los Buds Core, los JBL Go y Tune, el Philips
TAT2206, los controles de Xbox, el PS Portal, los SanDisk (Cruzer Blade, Ultra Shift, microSD, SSD
E30) y la power bank de Xiaomi. **Los 31 productos que YA tienen ficha con origen Paraguay no son
"nuevos"**: no se cargan como candidatos.

**LO QUE FALTA BARRER, y es la mayor parte:** cosmético (702 filas), auriculares (659), relojes
(434), varios (385), teclados (313), mouse (267), parlantes (262), cables, fundas, shampú,
cargadores, labiales, anillos inteligentes, discos, termos, tarjetas de memoria, routers,
secadores, controles y rubor. **Celulares, notebooks, tablets, TV, cámaras, monitores, impresoras y
placas no se miran**: pasan el tope de US$250 o el de 40×40×40 cm y 3 kg.

**SUS TOPES PARA EL PEDIDO DE NUEVOS (18/09/2026):** se llena hasta **US$500 de costo crudo** (sin
el 15%) y se corta · **máximo 2 unidades por producto** · sólo lo que da **más de 25% medido por el
panel o por el simulador, nunca a ojo** · en ML tiene que haber ventas de verdad (**+25 vendidos**
para arriba): un vendedor solo no molesta, uno sin ventas no sirve.

**EL AVISO QUE ÉL MISMO ANOTÓ SOBRE EL % DEL ROBOT**, y conviene mirarlo con calma antes de darlo
por cierto: sospecha que el margen de `candidatos` *"está unos puntos arriba de lo real"*. Medido
contra el simulador con el Animale Gold (US$21 a $95.000 en Adriana): el robot dio **57%** y la
cuenta completa da **54,1%**. La diferencia es chica y tiene dos motivos conocidos —el robot no
cuenta lo que sale **mandarlo a Full** (no puede: no sabe cuántas entran en una caja) y usa el IIBB
por defecto (4,8%) en vez del de la cuenta—. **No es el "descuenta 30% contra 43%" que dice su
nota**: ese 43% de una ficha incluye la mercadería adentro, así que son dos cosas distintas y
compararlas asusta al pedo. Lo que sí queda pendiente es **decidir si el robot tiene que pedir las
unidades por caja** para cerrar esa diferencia.

## LA REVISIÓN DEL CHAT DE COMPRAS, Y LOS DOS FRENOS QUE FALTABAN (18/09/2026)

Él preguntó lo correcto —*"hay que revisar cuando termine?"*— y sí: se revisó con `guay` y con
`candidatos`, y apareció lo que ningún prompt iba a arreglar.

**LA BUENA: EL COSTO NO SE PISÓ.** Las 31 fichas de Paraguay tienen el `costUSD` que pagó y el
`nisseiUSD` de hoy separados; el Victoria's Secret sigue con los US$ 13,80 que restauró `pycosto`.
El daño del 17/09 no se repitió, y no se podía repetir: el botón ya no existe.

**LO QUE APARECIÓ: cinco candidatos cargados SIN el link de ML**, o sea emparejados por nombre.
Cuatro de los cinco eran otro producto —Dark Door **Sport** → Dark Door **Intense** · Club de Nuit
**Sillage** y **Blue Iconic** → los DOS al mismo catálogo de **Woman** · **Dynasty** → **Mayar**—.
**Zafaron porque esos catálogos no tenían vendedores** y no hubo precio que medir: con vendedores
salía un margen perfectamente calculado del producto equivocado, que es el caso Watch 3 / Watch 4.
Al cargarle los links, el Blue Iconic pasó a medir **42,4% y entra**, y los otros tres dieron
−4,2%, 15,9% y 18,1%.

### PRIMER FRENO: EL LINK DE ML SE EXIGE EN LA PUERTA, NO EN EL TEXTO

Pregunta suya: *"¿le tengo que pasar un prompt nuevo o algo para que no se equivoque de nuevo?"*
**No.** El texto del chat ya decía *"obligatorio"* desde el 17/09 **y los cinco entraron igual**:
el panel los aceptaba y lo único que exigía el link era un comentario adentro del código.
Es la regla que vive en un solo lado, la misma lección que la barrera de los $33.000 que estaba en
el robot y no en la pantalla. **Agregarle palabras a una regla que ya estaba escrita y no se
cumplió es el arreglo más débil que hay.**
Ahora `candAgregar` lo frena igual que al tilde de Nissei —que es el único freno que sí funcionó— y
el aviso explica el caso real. Probado con las funciones REALES y 9 casos, incluidos los tres
frenos viejos, que siguen andando.

### SEGUNDO FRENO: LA PRIMERA MEDICIÓN TAMPOCO DESCARTA

El freno de las DOS mediciones protegía **sólo al que ya tenía una medición buena guardada**. El
que nunca se había medido se descartaba en el primer intento — **y es el momento más frágil**.
Se vio el mismo día: los tres de arriba se fueron con UNA sola lectura. Y uno de esos cinco es el
**Armaf Blue Iconic**, que es justo el caso anotado de ML contestando *"no lo vende nadie"* de un
catálogo que dos minutos antes tenía 3 vendedores: si esa respuesta le tocaba a otro, se iba para
siempre por un número que no era.
**No pasó nada porque la corrida fue en prueba y no escribe**, pero el paso automático de la noche
sí escribe. Ahora la primera lectura sólo guarda el número y avisa; **descarta la segunda**.
No hizo falta nada más: el margen ya se guarda antes del chequeo, así que en la vuelta siguiente
`antesM` existe y el descarte cae solo. Probado con el bloque REAL y 9 casos (primera abajo →
observación · segunda abajo → descarta · el Yara Moi de siempre · 25,0% justo entra · 24,9% no
descarta · y un margen guardado que es texto o `NaN` cuenta como "nunca medido").

**LA LECCIÓN, y es la de siempre del otro lado: cuando alguien no cumple una regla escrita, el
arreglo no es escribirla más fuerte — es que el sistema no lo deje.**

### LO QUE QUEDÓ ABIERTO Y NO ES DEL PANEL

 · **Dos precios de ML que no coinciden.** El robot mide el **Ophidian Mango Bliss** a $99.999
   (1 vendedor) y el chat vio **$75.271**; el **Armaf Odyssey Toffee Coffee** a $81.601 (4 vend.) y
   el chat vio **$72.251**. En los dos el robot ve MENOS vendedores. Con el precio del chat esos
   márgenes (48,5% y 45,9%) se caen mucho — el Ophidian a ~13%. **No se piden hasta saber cuál es.**
 · **El Lattafa Fahad 80ML no se puede medir**: el catálogo existe y hoy no lo vende nadie.
 · **Reponer salió más caro en 14 de 21 fichas** (Galaxy A07 +31% · A06 +24% · Cabotine +21% ·
   SSD 1TB +18% · VS +17% · Ferrari Negro +15%). El panel ya sacó 4 de Pedidos por precio. Las 7
   que bajaron son las únicas donde conviene reponer.
 · **Faltan datos a medias en 4 fichas**: Victoria's Secret y Galaxy A07 tienen precio y **no
   código**; Redmi Buds 6 y VS BLISS tienen código y **no precio**. Ninguna entra en el pedido así.
   Y **Victoria Secret STARLIT** no tiene ni uno ni otro y no está en ninguna lista de descarte.
 · **Un código para mirar de cerca: el Cruzer Blade 64gb quedó en `07112`**, el único de los 21 que
   empieza con cero.

## "PARA PROBAR": QUÉ CONVIENE EMPEZAR A VENDER (17/09/2026)

Pedido suyo: *"lo que no veo en la web de cyc es los productos que pueden ser nuevos ingresos"*.
Hasta ese día el panel sólo sabía de productos CON ficha, así que contestaba *"¿este que ya vendo
todavía conviene?"* y nunca *"¿qué me conviene EMPEZAR a vender?"*.

**LA REGLA QUE DECIDE TODO, y la puso él mirando una Nikon P950:** *"mira este producto y ve que
no está nissei. listo lo descarta"* y *"tiene que aparecer así ver, que diga nissei. entonces ahí
ya sabés el código, precio y que tienen stock"*.
comprasparaguay lista **varias tiendas por producto, cada una con SU código y SU precio**. Si
ninguna es Nissei, se descarta sin mirar nada más. Y si hay una de Nissei, **esa fila da las tres
cosas juntas** —código de pedido, precio en dólares y que hay stock—, que es justo lo que Nissei en
su propia página informa peor (*"nissei tiene peor informacion de su stock que comprasparaguai"*).
**El código NO se puede tomar de otra fila**: el de Mobile Zone o el de Pro Digital es de ELLOS.
Ése es exactamente el caso del Cabotine, donde la lista daba `91144` y el de pedido era `91832`.
**Y se recorre comprasparaguay ENTERO, no Nissei** (suyo, textual: *"NO NISSEI"*).

**QUIÉN HACE QUÉ, y no es una preferencia:**
 · **BUSCAR lo hace el chat de su PC**, porque comprasparaguay le contesta **403 al robot** —
   probado dos veces, la segunda con las cabeceras de un Chrome de verdad.
 · **LA CUENTA la hace el robot** (`candidatos`, todas las noches en `ml-daily`), porque
   preguntarle a ML a cuánto se vende algo y cuánto cobra de comisión necesita el token.
 · **La pantalla no calcula nada: muestra.** Dos fórmulas midiendo lo mismo es el error que ya
   mordió cinco veces en este archivo.

**DÓNDE SE VE:** Pedidos → Paraguay, **abajo de todo**, separado del pedido de verdad — pedido
suyo: *"para poder evaluarlos aparte y ver si los metemos en el pedido o no"*. Vive en
`cyc/candidatos_py/<id>`.

**SUS CUATRO TOPES, y cuáles se pueden aplicar solos:**

| tope | ¿lo aplica la máquina? |
|---|---|
| margen **25%** o más | **sí** · lo que no llega cae en "descartados" con el número |
| **US$250** la unidad puesto | **sí** |
| **40 cm** por lado y **3 kg** | **NO**: la página los informa o no. Inventar un tamaño es peor que no filtrar, así que la tarjeta lo dice en ámbar |
| marcas que **ML frena** | **NO**: lo marca él con el botón 🚫 de la tarjeta, y queda en `cyc/mlconfig/marcasFrenadas` |

**NO ELIGE NINGÚN PRODUCTO.** La tarjeta muestra **los DOS títulos** —el de comprasparaguay y el
del catálogo de ML que encontró el robot— uno arriba del otro, para que él vea de un vistazo si son
el mismo. Emparejar por nombre es el filtro que ya falló cinco veces, y en un producto nuevo es
**peor**, porque no hay ficha contra la cual contrastar. Si el robot no pudo emparejarlo, **no
inventa un margen: lo dice**.

**EL ENVÍO NO SE INVENTA.** Abajo de los $33.000 ML no lo cobra y es CERO de verdad; arriba lo cobra
siempre, y como el producto nunca vendió se usa el **peor medido en ventas reales ($6.190)**. Errar
para el lado caro hace ver el margen MENOR, que es el lado seguro cuando el número decide una
compra. Probado con las líneas reales y cinco casos: **$32.999 da 71% y $33.000 da 21,5%** — la
barrera funcionando.

**Tres frenos que no eran opcionales:**
 · **Tope de 40 consultas a ML por vuelta.** Esto corre adentro de `ml-daily`: si una noche entran
   300 candidatos, el paso nocturno se cuelga y se lleva puesto el resumen. Las que quedan sin
   medir **se cuentan y se nombran** y salen en la corrida siguiente — un tope mudo es el descarte
   por omisión de siempre.
 · **Lo descartado no se esconde**: va en un desplegable con el motivo y el número, y se puede
   devolver. Una lista que saca renglones sin decirlo es una lista que miente.
 · **Vence a los 45 días**, si no se vuelve el cementerio de marcas viejas que ya apareció con
   `repoextra` y con la pausa por precio.

**El aviso** va al canal privado de precios, **sólo lo NUEVO** (`cyc/avisocand`), y **se anota sólo
si el mensaje salió**. Si no hay nada nuevo que dé margen, no manda nada.

**El botón "Crear ficha"** deja el producto con su costo puesto (precio × 1,15), su código y origen
Paraguay, y avisa si ya hay una ficha con nombre parecido. **No publica nada en ML ni compra nada**:
la publicación la hace él, que es la norma del 26/08.

## EL PEDIDO DE PRODUCTOS NUEVOS: LA WEB LO GUARDA, EL CHAT LO ARMA (18/09/2026)

Pedido suyo: *"voy a hacer un pedido de todos productos nuevos con una combinacion (…) que sean
altos % (o lo mas alto posible, un producto que se le gana un 25% sirve igual)"*.

**LA ACLARACIÓN ES LO QUE DEFINE TODO, Y HUBO QUE PEDIRLA DOS VECES.** La primera versión ordenaba
por margen y llenaba los US$ 500 sola. Él lo cortó: *"no que la web no lo arme. que permita que el
otro chat lo arme"* y *"el otro chat va a encontrar productos nuevos y arme la lista, el ya va a
saber cuales productos son"*. Se borró entera y se rehízo.
**ACÁ NO HAY NINGÚN ALGORITMO, a propósito.** El que elige es el chat, que es el único que vio
comprasparaguay. La web pone la casilla y hace **las cuentas**, que es lo que el chat no puede
hacer sin equivocarse: el 15%, el total y el mensaje con los códigos. Es la misma división que ya
funciona con el precio y el código — el chat trae el dato, la cuenta la hace UNA sola parte.

**Y NO HAY TOPE NI MÁXIMO POR PRODUCTO.** La segunda versión traía tope de US$ 500 y máximo 2, y
él los sacó el mismo día: *"sin tope solo una barra que marque el total del pedido, ya que el tope
se lo digo yo en el chat"*. **Un límite que la pantalla inventa es la pantalla decidiendo.** Lo
único que va es el TOTAL, grande, que es el número contra el que compara mientras arma.

**DÓNDE ESTÁ: Pedidos → 🇵🇾 Paraguay, y adentro hay DOS PESTAÑAS** (pedido suyo del mismo día:
*"que haya dos botoncitos, uno que diga productos probados y otro productos nuevos. asi no se
mezclan las cosas, despues que el chat vaya a la que necesite para armar la lista"*):
 · **✅ Productos probados** — la canasta de US$ 1.000, los pedidos de reposición y "ya no conviene
   comprarlos". Es lo que YA vendés y no se tocó nada.
 · **🆕 Productos nuevos** — "Para probar" y **🧾 Armar el pedido**.
**Son dos pedidos distintos y por eso se separan:** reponer lo que ya vendés contesta *"cuánto
falta para no cortarme"*, y probar algo nuevo contesta *"cuánto arriesgo en algo que no sé si
vende"*. Mezclados en una sola pantalla larga, armar uno obligaba a pasar por el otro.
Cada tarjeta de candidato tiene una casilla **"pedir __ u."** (`cyc/candidatos_py/<id>/pedirU`) y
el bloque de arriba suma solo: US$ crudos, con el 15%, en pesos, cuántos productos y unidades, lo
que dejaría si se vende todo, y el **mensaje código × unidades para Nissei**.

**LAS UNIDADES VIVEN CON EL CANDIDATO, no en una lista aparte**: si vivieran aparte, un candidato
descartado o vencido a los 45 días dejaría unidades colgadas apuntando a algo que ya no está — el
cementerio de marcas viejas que ya apareció con `repoextra`, con la pausa por precio y con
"Nissei no lo tiene".
Probado con las funciones reales y 4 casos: cuatro cargados (uno sin código, que no entra en el
mensaje) · sin precio (lo dice en rojo: el total queda corto) · sin margen medido · vacío.

**POR QUÉ LA CANASTA DE ARRIBA NO SERVÍA:** esa arma el pedido de REPOSICIÓN —lo que YA vendés,
con las unidades que hacen falta, ordenando por la plata que destrabás si se corta, con tope de
US$ 1.000— y **los de "Para probar" no entran**. Un producto que no vendés no destraba nada, así
que ese criterio acá no dice nada.

**Y SE SACÓ EL CARTEL DE "EN CAMINO A FULL" DE PEDIDOS** (mismo día, suyo: *"sacar eso de camino a
full. ya que no es de aca. va en mi oficina"*). Se mira en **Mi oficina → En camino**, que es donde
vive. **Lo que NO cambió: la cuenta de Pedidos sigue descontando lo que va en camino**, así que
abajo no se vuelve a pedir — se sacó el aviso, no la regla.

## A CUÁNTO SE VENDE EN ML UN PRODUCTO NUEVO — Y POR QUÉ LA CAJA NO SE PUEDE SABER (18/09/2026)

Pedido suyo mirando el pedido ya armado: *"aca quiero que aparezca toda la info, precio
compraparaguai + 15% a cuanto se vende en ml a cuanto esta para ganar la caja y cuanto % de
ganancia tiene ganar la caja y cuanto % tiene vs mejor precio ml"*.

**De las cinco cosas, TRES se pueden y DOS no.** Y las dos que no son justo las de la caja de
compra. Se midió **antes** de escribir el renglón, con el comando nuevo **`probarcaja`** (solo lee).

### LO QUE SE MIDIÓ, Y ES DEFINITIVO

| | resultado |
|---|---|
| `buy_box_winner` de la ficha del catálogo | **`null` en los TRES catálogos probados**, incluidos los DOS donde SÍ vendemos (Ferrari `MLA38580480` y Seagate `MLA27400519`) |
| `/items/<MLA>/price_to_win` sobre algo **NUESTRO** | ✅ contesta entero: estado, precio para ganar y precio del ganador |
| `/items/<MLA>/price_to_win` sobre algo **AJENO** | ❌ **403 `"Item does not belong to caller"`** |

**El `buy_box_winner` no distingue nada: viene vacío siempre.** Un *"ML no informa quién tiene la
caja"* sacado de ahí es una propiedad de la API, no del catálogo — el error de siempre, falta de
dato leída como dato. La primera versión de este renglón lo mostraba así en los 27 candidatos.
**Hay que sacarlo de donde esté**: quedó otro lugar usándolo (ver más abajo).

**Y NO SE DEDUCE DEL MÁS BARATO, que era la tentación.** Los dos números de la misma corrida:
 · **Seagate**: el ganador está a **$149.975** y a nosotros ML nos pide **$175.655** para ganarla —
   o sea **$25.680 MÁS CARO que él**.
 · **Ferrari**: el más barato de la ficha está a **$68.000** y **la caja la tenemos nosotros a
   $68.510**.
**Ser el más barato no es ni necesario ni suficiente.** Inventar ese precio sería inventar el
número con el que se decide una compra de US$1.000 que no se puede rehacer hasta que llegue.

**Consecuencia: para un producto de "Para probar" —que por definición no tiene publicación
nuestra— el precio de la caja no existe hasta publicarlo.** Se dice en la pantalla, UNA vez por
sección y no en los 17 renglones: repetirlo es ruido, y no decirlo nunca sería peor porque él pidió
ese número expreso.

### LO QUE SÍ VA EN EL RENGLÓN

 · **el costo puesto**: `US$ X + 15% = US$ Y c/u`, y en pesos
 · **el rango de la ficha**: *"se vende de $75.999 a $92.800 · 2 vendedores"* (`mlPrecio` y `mlMax`)
 · **el margen contra el MÁS BARATO**, que es el peor caso y el que manda para el piso del 25%

La cuenta vive en **una** función (`cuentaCand`) y reemplaza la que estaba suelta; la pantalla no
calcula nada (`candPreciosHTML`, que usan los DOS lugares: el renglón del pedido y la tarjeta del
candidato). Probado con las funciones REALES: la cuenta nueva da **exactamente** lo mismo que la
vieja en 4 casos (incluidos $32.999 y $33.000, la barrera) y el renglón en 7 casos.

**Y hubo que tocar el freno de "ya tiene la cuenta hecha"**: ese `if` saltea los ya medidos para no
gastar consultas, así que los 27 ya cargados nunca iban a recibir un dato nuevo. Ahora pide además
que `mlMax` exista. Cuando se agregue otro dato, lo mismo.

### Y EL RESUMEN NO CERRABA: 3 SE IBAN EN SILENCIO

La corrida del 18/09 imprimió **"16 mirados · 11 medidos · 0 ya medidos · 2 descartados"**, que no
suma. Los 3 que faltan se iban por un `continue` callado —ML no contestó la comisión, el catálogo
sin vendedores activos, el código de ML que no existe—. Es el descarte por omisión de siempre, y
acá hace un daño concreto: **un producto que da 50% desaparece de la lista sin que nadie se entere**,
y el que la mira da por hecho que no había más.
Ahora cada salida deja **su nombre y su motivo**, el resumen los cuenta aparte (*"sin dato"*) y
**chequea que los números sumen**: si no cierra imprime *"⚠️ NO CIERRA · hay N saliendo en
silencio"*. Es el mismo freno que ya se le puso a `activarPausadasFull` el 17/09.

### Y NO SE DESCARTA UN CANDIDATO POR UNA SOLA MEDICIÓN

Dos corridas con **minutos** de diferencia dieron números muy distintos del mismo producto: el
**Lattafa Fakhar 29,4% → 19,8%** y el **Yara Moi 28,3% → −2,7%**. Y en la misma tanda ML contestó
*"no lo vende nadie"* de un catálogo que **dos minutos antes tenía 3 vendedores** (el Armaf Club de
Nuit Blue Iconic, que es el primero de su pantalla).

**El margen se mide contra el MÁS BARATO de la ficha**, así que alcanza con que un competidor baje
un rato —o con que ML devuelva la lista incompleta— para hundirlo. Y descartar con eso escribe
`no:true` y **saca el producto de la lista para siempre**.

Ahora hace falta que **DOS mediciones seguidas** den abajo del piso. La primera guarda el número
—el panel lo muestra en ámbar, que es la verdad de hoy— y queda *"en observación"* en el log.
**Es la misma lección del marcado de cajas: lo que BORRA algo tiene que ser más exigente que lo que
lo muestra.**

### LO QUE QUEDA ABIERTO Y HAY QUE MIRAR

**Hay OTRO lugar en el robot leyendo `buy_box_winner`**, en el informe que dice si una publicación
gana o pierde la caja de catálogo. Si el campo viene siempre null, ese informe viene diciendo
*"catálogo, pero ML no informa ganador"* de TODO, y nadie lo notó. **El dato correcto ya lo tiene
el panel**: el robot escribe `price_to_win` en `cyc/mllinks/<MLA>/caja` una vez por hora, que es de
donde sale la columna "Caja ML". Hay que hacerlo leer de ahí.

## EL SIMULADOR REAL DE PRECIO (18/09/2026)

Pedido suyo: *"el chat local que busca precios en compraparaguai tiene problemas al saber cuanto
quedaria exactamente a un producto de ganancia. no lo que nos da ml, sino con todo incluido,
impuesto, ganancia, full. TODO."*

**Y por qué no alcanza con el simulador de ML, dicho por él:** *"ese simulador no tiene en cuenta
todo (por ejemplo impuestos, ganancias, full)"*. Es exacto: ML te dice cuánto te deposita y nada
más. No sabe de la mercadería, ni del 15% de Paraguay, ni del IIBB, ni del monotributo, ni de lo
que cobra Full, ni del % de reclamos.

**Dónde está:** Pedidos → 🇵🇾 Paraguay → 🆕 Productos nuevos → **🧮 Simulador real de precio**
(elegido por él). Es un desplegable: no empuja hacia abajo el pedido.

### DE DÓNDE SALE CADA NÚMERO

| | de dónde |
|---|---|
| mercadería | el precio de comprasparaguay en US$ **× 1,15** × el dólar de hoy |
| **comisión de ML** | **se copia de un producto que ya vendés** — decisión suya |
| envío de Full | la barrera: **cero de verdad** abajo de $33.000 · el **peor medido** ($6.190) arriba |
| IIBB + monotributo | por cuenta, los mismos % que usa todo el panel |
| cuotas | **arranca en CERO**, y no es un olvido (ver abajo) |

**LA COMISIÓN SE COPIA PORQUE LA WEB NO LE PUEDE PREGUNTAR A ML.** El endpoint existe
(`/sites/MLA/listing_prices`) pero necesita el token, y eso sólo lo tiene el robot. Él eligió
copiarla de un producto parecido, que es el único número **REAL** disponible al instante. Se puede
pisar con el % exacto de ML, y ése manda.

### LO DE LAS CUOTAS, QUE LO MARCÓ ÉL Y YA ESTABA CUBIERTO

Textual: *"ml tiene una promo de 2 cuotas, quizas el bot ve que tiene 2 cuotas y quiere agregarlas,
en verdad esa promo esta en todas aunque vos elijas 'sin cuotas'"*.
**Tenía razón en el riesgo y el panel nunca cayó en él**, porque no mira lo que la publicación
MUESTRA: el costo sale de lo que Mercado Pago **cobró de verdad** en cada venta
(`financing_add_on_fee`, que mide el comando `cuotas`). La promo de 2 cuotas suma **cero**, porque
no se cobra. Cuando hay cuotas sin interés de verdad el cargo es enorme —en un Samsung **19,2% del
precio, más que toda la ganancia de esa venta**— y por eso el campo existe, pero vacío.

### Y DE PASO SE ARREGLÓ EL SIMULADOR DE LA FICHA: LA COMISIÓN NO ES UN % PAREJO

El simulador de la ficha estiraba un **% parejo** al cambiar el precio, y él mismo lo avisaba en
pantalla: *"ML cobra además un cargo fijo por venta y ese cargo NO se puede separar del % con un
solo precio de referencia"*. **Sí se puede separar**, porque el cargo fijo está medido
(**$1.230**, `ML_CARGO_FIJO`): se le resta primero y lo que queda es el % de la categoría, que ése
sí es parejo.

**Medido contra los números de ML del 11/09** (tomando el de $14.360 como referencia):

| precio | ML cobró | modelo nuevo | % parejo (lo de antes) |
|---|---|---|---|
| $11.999 | 26,6% | 26,0% (−0,6) | 24,3% (**−2,3**) |
| $9.230 | 29,9% | 29,1% (−0,8) | 24,3% (**−5,6**) |
| $6.000 | 36,7% | 36,2% (−0,5) | 24,3% (**−12,4**) |
| $4.880 | 41,6% | 40,9% (−0,7) | 24,3% (**−17,3**) |

**Erra menos de 1 punto donde el método viejo erraba hasta 17.** Y sacando el cargo fijo de los
cinco precios medidos, la base queda entre **15,7% y 16,6%** en los cinco: el modelo cierra solo.

**Vive en UNA función (`comisionEnPrecio`) que usan los DOS simuladores**, y la línea del dinero en
otra (`simMargen`, la misma cuenta que `margenMLDe`). Con dos copias, la ficha diría un número y
Paraguay otro sobre el mismo producto — el error anotado siete veces en este archivo.

### LO QUE LE FALTABA, Y LO MARCÓ ÉL (18/09/2026)

Textual: *"que sea independiente, o sea que muestre lo que realmente le queda a cyc. teniendo en
cuenta TODO y siempre vamos a vender por full"*. **Independiente ya era** —de ML sólo toma la
comisión, que es el único número que la web no puede calcular sola—, pero *"TODO"* no era cierto:
**faltaban las dos partes del costo que el panel sí le cuenta a cualquier ficha**, y el cartelito
de arriba del simulador las prometía igual (el comentario que promete algo que no está, por
séptima vez en este archivo).

 · **Lo que sale mandarlo a Full**, que es el `Envío+embalaje` de la ficha: `costoCaja()` (hoy
   $17.500, de `cyc/mlconfig`) dividido por **cuántas entran en una caja**, que es el dato que él
   sabe. **Si no lo carga NO se inventa un número**: se pone en cero y sale un aviso en ámbar
   diciendo que ese costo no está contado y que el margen se ve mejor de lo que va a ser.
 · **El % de reclamos**, el mismo `%Dev` de la ficha. En un producto nuevo no hay con qué medirlo:
   vacío = cero, que es exactamente lo que hace el panel con una ficha recién creada.

**Y SE AGREGÓ LO QUE PIDIÓ ANTES: *"no conviene probar precios mas altos? por las dudas"*.** Sí
conviene, y ahora están las dos direcciones:

 · **"para llegar al 25% tenés que venderlo a $X"** — es `simMargen` **dada vuelta**
   (`simPrecioParaMargen`). Como el envío de Full no es un % sino un cargo que aparece de golpe
   arriba de los $33.000, la cuenta se hace DOS veces y se queda con la que cae del lado que le
   toca. Si el precio que hace falta cruza la barrera, **lo dice y no lo propone**.
 · **la tabla "¿y si lo vendo más caro?"** con +5/+10/+20/+30%, cuánta plata deja cada uno y
   cuánto más que hoy.

**LOS DOS AVISOS QUE HACEN QUE LA TABLA NO MIENTA, y sin ellos no se podía mostrar:**
 1. **No ve los escalones de la comisión.** El modelo es una línea pareja, así que **siempre** va a
    decir que más caro deja más — y eso es falso en las zonas muertas (12/09: los Paulvic de
    $14.360 a $15.790 dejaban **$312 menos**). Lo único que sí es un salto de verdad y sí se ve es
    la barrera de los $33.000. Para los escalones hay que preguntarle a ML precio por precio, que
    es lo que hace `subirpuede`.
 2. **En un producto NUEVO el precio no lo elegís vos: lo pone el más barato del catálogo.** Un
    renglón que dice *"a $123.500 te queda 92%"* es el margen de una venta que no va a pasar. Es la
    misma regla del Filtro agua: un renglón que invita a aplicarlo tiene que estar medido.

**EL DETALLE QUE PARECÍA DE ADORNO Y NO LO ERA: el precio del 25% se VERIFICA contra `simMargen`
antes de mostrarse.** La fórmula despejada es exacta, pero `simMargen` redondea la comisión y los
impuestos, así que el precio caía en **24,999%** en algunos casos. Ese número es justo el que
decide: habría salido *"para llegar al 25% vendelo a $53.930"* con el cartel *"abajo de tu piso del
25%"* pegado al lado. Ahora se prueba con la MISMA función que dibuja la pantalla y se sube de a
$10 hasta que dé.

**Probado con las funciones REALES sacadas del archivo, en tres tandas:**
 · **`simComEn` da EXACTAMENTE lo mismo que `comisionEnPrecio`** en 4.373 precios × 5 referencias:
   0 diferencias. No son dos fórmulas, son la misma partida en dos.
 · **Barrido de 48.960 combinaciones** (6 precios de referencia × 6 comisiones × 4 cuentas ×
   4 escenarios de cuotas × 5 metas × 17 costos): el precio que devuelve **siempre** llega al
   margen pedido, **nunca** se pasa de un escalón de $10, **nunca** declara un lado de la barrera
   que no es, y **nunca** sale negativo ni sin redondear.
 · **Prueba de PANTALLA contra un DOM de mentira**, 40 casos: los campos que faltan se dicen en vez
   de inventarse, la barrera sale de los dos lados, el aviso de Full sin contar aparece y
   desaparece cuando corresponde, y **12 formas de tipear mal** (texto en los números, negativos,
   $1, cuotas al 95%, reclamos al 100%) no sacan ni un `NaN`.

**CUÁNDO LA REFERENCIA NO SIRVE Y SE AVISA:** si al restar el cargo fijo la base queda fuera de
**8%–30%**, la resta no está separando nada real (pasa cuando el producto de referencia es mucho
más barato que el simulado y el cargo fijo se come casi toda su comisión). Ahí **no se elige entre
dos números malos**: se vuelve al % parejo y el renglón dice que esa referencia no sirve.
La banda sale de lo medido: 15,7%–16,6% en los cinco de ML, y 12,5% la Clásica más barata vista
(el Watch 4). Probado: una referencia con base 5,7% y otra con 40% **avisan**, y la Clásica de
electrónica al 12,5% **pasa**.

## EL PRECIO DE PARAGUAY NO PISA EL COSTO. NUNCA. (17/09/2026)

Es la regla más importante del día y la puso él en dos frases:
*"no quiero que me actualice el precio anterior con el que esta ahora. ya que yo lo pague 13.8 y le
gane un 21 no lo pague 16.1"* · *"lo que compre a un precio se vende a ese precio. si aumenta no
compro"* · *"sacar que el precio nuevo modifique el anterior (…) que ponga el precio en un lugar
nuevo que no modifique nada de lo que se vende"*.

**SON DOS NÚMEROS Y MIDEN COSAS DISTINTAS:**

| | qué es | qué decide |
|---|---|---|
| **`costUSD`** | lo que **PAGASTE** por la mercadería que tenés | todos los márgenes, el patrimonio, y **si el robot sube un precio al vender** |
| **`nisseiUSD`** | lo que te saldría **REPONERLO** hoy (precio de comprasparaguay, crudo) | **sólo** si conviene comprar |

**QUÉ PASÓ, PARA NO REPETIRLO.** El asistente de compras cargó los precios de Paraguay **encima**
del `costUSD` de 20 fichas. Con eso:
 · se movieron los márgenes de todo lo que ya estaba vendido —los dos Victoria's Secret de ese día
   pasaron de **~21% a 9%** sin que cambiara nada de esas ventas—,
 · y con la **suba automática prendida** (que él la quiere prendida), la próxima venta le habría
   subido el precio a mercadería que ya tenía comprada a otro costo.
**Reparado con `pycosto:<id>=<costoViejo>/<precioPY>[;go]`**: 20 de 20 devueltos y el precio de
Paraguay a su propio campo.

**Y SE SACÓ EL BOTÓN QUE LO PERMITÍA.** `aplicarNissei` ("Usar este costo") ya no existe. En su
lugar la ficha de un producto de Paraguay muestra **los DOS márgenes**:
 · **"lo que TENÉS"** (con el costo pagado) — no se mueve nunca
 · **"si lo REPONÉS hoy"** (precio de Paraguay + 15%) — el único que decide comprar
y cuando el de reponer no llega al 25% lo dice: *"a este precio no conviene comprarlo; el de la
izquierda no cambia"*. **No calcula nada nuevo**: llama a `margenMLDe`, la misma de Rotación de
Stock. Probado con las funciones reales: 13,80 → 22,5% · 16,10 → 10,0% · si el proveedor baja a
US$10 sube a 50,9% · si sube a US$40 da −46,7%.
**Ojo al tocarlo: `margenMLDe` devuelve el porcentaje en `margen`, NO en `pct`.** Con `pct` los dos
números salían siempre "—" y la caja parecía andar.

**LA SUBA AUTOMÁTICA QUEDA PRENDIDA**, decisión suya del mismo día (*"no desactiva suba automatica
de precios"*). Lo que la hacía peligrosa no era ella: era el costo pisado.

**Y LA CONSECUENCIA QUE HAY QUE TENER CLARA: el costo que sube NO es motivo para subir un precio.**
Él lo dijo así: *"no quiero que me digas que tengo que subir (…) la idea de esto no es que me haga
aumentar por el hecho que aumentó, sino ver si vale la pena comprar productos viejos y nuevos"*.
Si el proveedor aumenta, la respuesta es **pausar por precio**, no tocar ML.

### EL EMPAREJADO CON EL CATÁLOGO DE ML POR NOMBRE FALLÓ EN LA PRIMERA PRUEBA REAL

Buscando **"Xiaomi Redmi Watch 4"** el catálogo de ML devolvió **"Xiaomi Redmi Redmi Watch 3"**.
Zafamos porque ese catálogo no tenía vendedores; si los hubiera tenido, salía un margen
perfectamente calculado **del producto equivocado**, y con eso se decide una compra de US$1.000 que
no se puede rehacer hasta que llegue. Es el filtro por palabras que ya falló **seis** veces acá.

**Y hay un segundo daño, más silencioso: cae en catálogos VIEJOS.** El Cruzer Blade 64gb lo
emparejó BIEN por título… con `MLA6078538`, un catálogo de hace años y sin vendedores. O sea que
buscar por nombre no sólo trae otro producto: **también trae el catálogo muerto del producto
correcto**, y ahí no hay precio contra el cual medir.

**La salida es la misma que funcionó con el `codPy`: no emparejar, cargar el identificador.** El
candidato puede traer `mlId` (el link o el código del catálogo, que el chat copia del navegador).
Si está, no se busca nada. Si no está, se busca por nombre y **queda marcado** —en la tarjeta en
ámbar con este mismo ejemplo, y en el aviso de Telegram—.

## CONTAR LO QUE HAY: EL CUADRADITO PARA SUMAR (17/09/2026)

Pedido suyo con las Cartas Casino en 228: *"agregar otro cuadradito para seleccionar cuántas
unidades nuevas ingresaron, así no tengo que sumarlas (…) en TODOS los productos, no solo el que te
pasé"*. Va en el renglón de cada producto **y en cada variante**.
La casilla grande sigue siendo el **TOTAL** —la que vale para el patrimonio— y la chica es lo que
llegó hoy. Por eso la chica va **punteada y con un "+"**: escribir el total ahí sumaría 228 + 228.
El aviso dice el **antes y el después** (*"228 + 50 = 278"*), que es la única forma de darse cuenta
en el momento de que se sumó en la fila equivocada. Con la casilla vacía el botón no hace nada y el
total nunca baja de cero.

## EL COSTO NUEVO NO PUEDE REESCRIBIR LO QUE YA GANASTE (17/09/2026)

El costo de una venta vieja **no se guarda con la venta**: se calcula al abrir la pantalla
(`efectivoCostoVP`) y, si ese mes no tiene precio histórico cargado, **cae en el costo de HOY**.
O sea que cambiar un costo le reescribe la ganancia a todas las ventas viejas de ese producto.
El mecanismo para evitarlo **ya existía** (`precios_hist_prod`, Ajustes → Precios históricos) y se
llenaba a mano, así que no lo llenaba nadie.
**Ahora se llena solo** (`congelarCostoAnterior`): antes de pisar un costo, el viejo queda congelado
en cada mes que tenga ventas de ese producto y todavía no tenga precio propio. No pisa nada cargado
a mano y sólo toca meses con ventas. El congelado es **por mes**, que es la granularidad del panel.
Reparado lo que ya había pasado con **`costohist:`**: 56 meses de producto, 56 de 56.

## EL DATO DE PARAGUAY, EN LA FICHA Y EN PEDIDOS (17/09/2026)

Pedido suyo: *"quiero que en la web aparezca todo, o sea el costo y eso, no solo si da o no (…)
que toda esa info se agregue a pedidos - paraguay"* y después *"agregar todos esos datos que lo va
a tener el chat corriendo en local. se me ocurren, codigo, precio, etc"*.
Antes la tarjeta de Pedidos decía **cuánto** comprar y **por qué**, y de plata no decía nada: para
saber si un producto de Paraguay todavía convenía había que salir, buscar la ficha y volver.

**SON DOS NÚMEROS DISTINTOS Y CONFUNDIRLOS ARRUINA TODOS LOS MÁRGENES:**
 · **`nisseiUSD`** = el precio en dólares que muestra comprasparaguay, **CRUDO**.
 · **`costUSD`** = ese precio **× 1,15** (`RECARGO_PY`), o sea puesto en la oficina. **Es el que usa
   TODO el panel** para calcular márgenes y valuar el stock.
**EL BOTÓN "USAR ESTE COSTO" YA NO EXISTE (sacado el 17/09/2026, misma tarde).** La primera versión
de esta pantalla lo tenía, con confirmación y los dos números a la vista, y aun así estaba mal: el
precio de Paraguay **no puede pisar el costo por ningún camino**. Ver la sección "EL PRECIO DE
PARAGUAY NO PISA EL COSTO" más arriba — la ficha muestra ahora los dos márgenes separados.

**EL CÓDIGO VIVE EN `codPy`, NO EN `nisseiCod`.** La primera versión de este campo escribía en uno
nuevo y la canasta de Paraguay arma el pedido con OTRO: el código que él tipeaba **no era el que
salía en el pedido**. Corregido el mismo día; no hubo nada que migrar porque el campo nuevo estaba
vacío en las 31 fichas. **El código ES el que termina con el emparejado por nombre.** Es el de Nissei que se
usa para pedir, y **no** es el número interno que muestra la lista (Cabotine 100mL: la lista da
`91144`, el de pedido es `91832`). Con el código guardado, buscar por nombre deja de existir — que
es el filtro por palabras que ya falló cinco veces en este panel. Por eso **primero el código y
después el nombre**, y no al revés.

**EN PEDIDOS → PARAGUAY** cada tarjeta muestra ahora: 💵 costo en US$ y en pesos · 📈 margen ·
🏷️ precio en ML · 🔖 código · 🇵🇾 precio de Paraguay **con la fecha en que se miró**.

**Tres cosas que no son adorno:**
 · **El margen respeta el COLOR de siempre**: verde SÓLO si está medido contra ventas reales,
   ámbar si el envío salió de la tarifa de ML, y **"?" en vez de un porcentaje** arriba de los
   $33.000 con envío $0. **No calcula nada nuevo**: llama a `margenMLDe` y `margenDudosoDe`, las
   mismas que usan Rotación de Stock y la ficha. Con su propia cuenta, la tarjeta podía decir un
   margen y la ficha otro sobre el mismo producto.
 · **La FECHA del precio de Paraguay va siempre, y arriba de 30 días en ámbar.** Un precio de hace
   dos meses al lado de una decisión de compra se lee como si estuviera al día.
 · **Sin costo cargado lo dice en ROJO.** Un producto sin costo se ve como si fuera todo ganancia
   y puede aparecer arriba de todo como un éxito que no existe.
 · **Y la tarjeta dice si reponerlo hoy sale MÁS BARATO o MÁS CARO que lo que pagaste**, con los
   dos números en las mismas unidades. **Este renglón decía otra cosa hasta el 18/09/2026** —
   *"⚠️ el costo no está al día · tocá Usar este costo"*— y estaba al revés de la regla del 17/09
   y mandaba a apretar un botón que ya no existe. Ver abajo.

**Va SÓLO en Paraguay**, que es lo que pidió. Ponerlo también en Bs As es un renglón, pero un
pedido sobre una sección no es permiso para tocar las otras (la lección del 24/08 con Adriana).
Probado con las TRES funciones reales sacadas del archivo y 14 casos, incluidos los cuatro que
tienen que salir en ámbar o rojo. Y corrido el chequeo de las tres listas: no falta ninguna función,
ninguna variable ni ningún `id` — sólo se agregaron 7 nombres, ninguno repetido.

## Cosas que ya pasaron (para no repetirlas)

- **"PAGUÉ 55 Y DICE 55: ESTO ESTÁ MAL" — EL NÚMERO ESTABA BIEN Y EL RENGLÓN LO ESCONDÍA
  (18/09/2026).** Él leyó del **Mando Joystick Xbox** *"reponerlo hoy: US$ 55,20 · 🟢 13% MÁS
  BARATO"* y lo marcó: *"lo pagamos 55 igual que dice ahí. En la web dice 63.25 porque le agregué
  los costos y traslado o sea + el 15%"*.
  **La cuenta estaba bien, y su propia regla lo confirma.** Él mismo puso la condición: *"salvo que
  el joystick esté menos de 55 dólares y con el 15% de 55 final. Ahí sí"* — y es exactamente el
  caso: hoy comprasparaguay lo tiene a **US$ 48**, que con el 15% da **US$ 55,20** contra los
  **US$ 63,25** que le salió puesto. O sea que reponerlo hoy sale 13% menos.
  **Lo que estaba mal es que el renglón mostraba un lado CRUDO y el otro PUESTO.** Los US$ 55 que
  él pagó son el precio de Paraguay de aquel día; los US$ 55,20 son el de hoy YA con el 15%. Dos
  números casi iguales que miden cosas distintas, uno al lado del otro: la lección de las tres
  cajas de la ficha del 03/09, otra vez.
  **Cómo quedó, en los DOS lados:** cada uno muestra las dos formas —*"pagaste US$ 63,25 puesto
  (~US$ 55,00 en Paraguay + 15%) · reponerlo hoy US$ 55,20 puesto (US$ 48,00 + 15%)"*—. El precio
  de Paraguay de lo que pagó sale de dividir por 1,15 y va con **~** porque en las compras viejas
  el recargo no siempre fue exacto (suyo: *"si no da justo el 15% es porque en ese caso gastamos
  menos o mas. Pero a partir de ahora siempre es el 15"*).
  **Y AL MIRARLO APARECIÓ EL MISMO ERROR DEL `guay`, PERO EN LA PANTALLA.** La tarjeta de
  Pedidos → Paraguay sacaba **"⚠️ el costo no está al día"** cada vez que el costo no era el precio
  de Paraguay + 15% —o sea en casi todas, porque **eso es lo normal**— y el globito cerraba con
  *"entrá a la ficha y tocá **Usar este costo**"*. Ese botón **no existe desde el 17/09**, y se
  sacó justo porque pisar el costo le mueve los márgenes de lo ya comprado y, con la suba
  automática prendida, le sube precios. El chip mandaba a hacer lo único que está prohibido.
  Ahora dice **🟢 reponerlo sale N% más barato** o **🔴 N% más caro**, que es la decisión.
  Probado con 5 casos usando la función REAL sacada del archivo (el Joystick, el Salvador Dalí que
  da igual, el Galaxy A07 que da 31% más caro, sin costo y sin precio de Paraguay) y corrido el
  chequeo de las tres listas: **0 funciones, 0 variables y 0 `id` de diferencia**.
  **LA LECCIÓN: cuando él dice que un número está mal, la primera pregunta no es si la cuenta está
  bien — es si la pantalla deja ver contra qué se está comparando.** Acá la cuenta era correcta y
  el renglón igual lo llevó a desconfiar, que es tan caro como un número equivocado: si no confía
  en el renglón, no lo usa.

- **EL COMANDO `guay` DECÍA QUE EL COSTO "DEBERÍA SER" EL PRECIO DE PARAGUAY (18/09/2026).** Al
  revisar qué había cargado el chat de compras, el renglón de cada ficha decía *"costo en la ficha:
  US$ 13,80 · **debería ser US$ 16,10** ⚠️ NO COINCIDE"*, y el resumen cerraba con *"listas del
  todo: **0**"* y *"con el costo **desfasado**: **21**"*.
  **Todo eso está al revés de la regla del 17/09.** `costUSD` es lo que PAGÓ y `nisseiUSD` lo que
  saldría REPONERLO hoy: **que sean distintos es lo normal, no un error**. El texto invitaba a
  "arreglar" las 21 pisando el costo con el precio de Paraguay — que es **exactamente el daño que
  hubo que reparar con `pycosto` el día anterior**, y que con la suba automática prendida le habría
  subido precios de mercadería ya comprada más barata.
  **El comando se escribió ANTES de esa regla y nadie le tocó el texto.** Es el patrón de siempre:
  un renglón que invita a aplicarlo tiene que estar medido — y éste invitaba a romper la regla más
  importante del día anterior.
  **Cómo quedó:** los dos números salen con su nombre (*"pagaste US$ 27,90 · reponerlo hoy US$ 23,00
  (precio + 15%)"*) y la conclusión es la que él usa para decidir: **🟢 más barato** o **🔴 más caro**
  que lo que pagó. El resumen dice *"listas para pedir (código + precio)"* y *"más caro reponerlo
  hoy que lo que pagaste: N"*, con la aclaración de que el costo no se pisa nunca.
  Probado con los 6 casos reales de la corrida: Animale For Men −18% · Joystick Xbox −13% ·
  Watch 5 Lite −1% · Salvador Dali = igual · VS +17% · Galaxy A07 +31%.

- **ML TE PIDE MANDAR Y EL PANEL DICE QUE NO: LOS DOS ESTÁN BIEN (18/09/2026).** Él mandó las dos
  pantallas al lado: ML decía *"Enviá 4 u."* del Sábanas 105x190 Negro y del Gris Oscuro, y Armar
  caja decía *"Ninguna cuenta lo necesita. Dejalo en casa"*. Pregunta suya: *"que hago? me gustaría
  que las dos digan lo mismo"*.
  **NO van a coincidir, y no es un error de ninguno: miden cosas distintas.**
   · **El panel cuenta lo que va EN CAMINO y ML no lo descuenta en esa pantalla.** El Gris Oscuro
     tenía 2 en Full **+ 2 viajando** en la caja del 15/09. Para el panel ya están.
   · **El "Enviá 4 u." de ML es su MÍNIMO, no una medición.** Es el mismo 4 que está en
     `REPO_PISO_CERO`, tomado de ML el 23/08. Lo muestra igual tengas 0 o tengas 2.
   · **Y el objetivo es de él:** 30 días de cobertura (11/09, *"cubrir los próximos 30 días máximo,
     así hay menos riesgo de stock parado"*). A ML le conviene tu mercadería en su depósito.
  **MEDIDO con `hermanas:105 x 190:25` antes de contestar:** la ficha tiene **13 publicaciones,
  todas de Luciana**, y entre las 13 vendieron **15 u. en 30 días** — o sea **0 a 2 por color** (el
  que más vende, 7). Con 2 en Full esos dos colores ya tienen para un mes o más. Los totales cierran
  contra `revisarpedidos` (18 en Full, 15 vendidas), que es la forma de saber que la lista está
  completa.
  **Y lo que sí importaba estaba en la misma lista: 6 de las 13 están PAUSADAS por falta de stock**
  (0 en Full). Ésas no venden nada — pero esos colores no los tiene en casa.
  **QUÉ SE CAMBIÓ, y no es la regla:** el renglón decía sólo *"Dejalo en casa"*, así que contra una
  pantalla de ML que dice lo contrario no había con qué decidir. **Ahora dice la CUENTA**:
  *"Luciana: 2 en Full + 2 en camino · vende 1 por mes → le alcanza 120 días"*, y abajo aclara que
  si ML pide mandar es porque su mínimo son 4 u. y no descuenta lo que va en camino.
  **Dos pantallas que se contradicen sin decir por qué obligan a elegir a ciegas** — la misma
  lección del cero sin explicación. Un pedido viejo sin ese detalle no inventa nada: no lo muestra.
  Probado con 5 casos (con y sin camino, con stock y cero ventas —el centinela 999—, dos cuentas, y
  sin detalle) y corrido el chequeo de las tres listas: **0 funciones, 0 variables y 0 `id` de
  diferencia** con la versión anterior, que es lo que corresponde a un cambio adentro de una
  función.

- **SE ACTIVA SOLA SIEMPRE QUE ESTÉ PAUSADA, CON STOCK EN FULL Y ARRIBA DEL 25% (17/09/2026).**
  Regla suya, textual, después de tener que activar a mano los dos P47 Cat Ear de Ayelen:
  *"quiero que se active automaticamente siempre que el producto este pausado con stock en full y
  tenga mas del 25% de ganancia"*. **Son esas tres condiciones y ninguna más.**
  Hasta ese día `activarPausadasFull` tenía **dos frenos que contradecían la regla**, y los dos
  dejaban la publicación pausada PARA SIEMPRE con mercadería adentro pagando almacenamiento:
   · **`altaSinVender`** — "se dio de alta sola y todavía no vendió". El motivo era cierto (su costo
     salió del título, no de una venta) pero el remedio era peor: la marca **se cae sola cuando
     vende**, y pausada no vendía nunca. **Ya no frena.** El margen se sigue midiendo igual: si no
     llega al piso, no se activa. Queda anotado en el renglón del log.
   · **"nunca vendió: no hay con qué medir el margen"** — y **sí se podía medir**. Lo único que
     faltaba era el envío, y para eso no hacen falta ventas propias: **abajo de los $33.000 ML no le
     cobra envío al vendedor**, así que ahí el cargo es **CERO de verdad**, no una estimación (los
     dos P47 están a $9.660). Arriba de la barrera se usa el **peor envío de Full medido en ventas
     reales** (`CAND_ENVIO_ARRIBA`, el mismo número que usa `candidatos`): errar para el lado caro
     hace ver el margen MENOR, que es el lado seguro cuando el número decide escribir en ML.
     El renglón del log dice cuándo el envío es estimado — un margen medido y uno estimado no se
     muestran igual.
  **Los frenos que QUEDAN, y por qué:** la pausó ML (no se puede activar, no es una decisión
  nuestra) · marcada `nomas` (es una decisión suya, activarla la desharía) · `noAutoActivar`
  (freno que puso él a mano) · sin ficha o sin costo (ahí el *"más del 25%"* no se puede evaluar).
  Probado con el bloque REAL del archivo y 4 casos: el P47 a $9.660 sin ventas **se activa con
  43,9%** · uno caro sin ventas usa los $6.190 · uno CON ventas sigue deduciendo el envío de sus
  ventas y no estima nada · y **$33.000 justos NO es cero** (la barrera es "menor que").
  **Y hay un comando nuevo para diagnosticar esto: `pausadas[:piso]`, que SOLO LEE.** Llama a la
  MISMA función que corre el robot cada hora y dice, renglón por renglón, en qué freno se fue cada
  pausada con stock adentro. Hizo falta porque el probe `activarfull` tiene la cuenta **copiada
  adentro**: sirve para aplicar, pero no contesta por qué el robot dejó algo pausado — y dos copias
  de la misma cuenta ya se separaron seis veces en este archivo.

- **LA CAJA 76236266 DIO POR PERDIDAS 218 UNIDADES QUE ESTABAN A LA VENTA (17/09/2026).** Él mandó
  la pantalla de ML al lado de la del panel y no coincidían. **ML: *"Procesamiento finalizado ·
  511 u. procesadas: 511 están a la venta"*. El panel: *"llegó el 2026-09-16 · faltaron 218 u."***,
  con `115 Cartas Casino → entraron 0` y `150 Centímetro Blanco → entraron 47`. Esas 218 unidades
  salieron del patrimonio como rotas o faltantes **y nunca faltaron**.
  **LA CAUSA: se pedía UNA sola página de 50 movimientos.** `/stock/fulfillment/operations/search`
  devuelve TODOS los movimientos del inventario —ventas incluidas— y las entradas son una minoría:
  en la corrida del 17/09, de **291 movimientos 215 eran `sale_confirmation` y sólo 47
  `inbound_reception`**. En un producto que vende mucho **las ventas empujan a las entradas fuera de
  la página**, el renglón lee 0 y eso es indistinguible de "no llegó".
  **El sesgo del error lo delata, y es lo que lo hizo encontrable:** falló exactamente en los dos que
  más venden (Cartas Casino ~484/mes → 0 de 115 · Centímetro Blanco → 47 de 150) y acertó en las
  sábanas, que casi no venden. **Un error que se concentra donde hay más de algo no es azar: ese
  algo es la causa.**
  **Arreglado pidiendo TODAS las páginas** (`offset`, hasta 1.000 movimientos por inventario).
  Y con el freno que hacía falta: **el corte se detecta sin confiar en que ML respete `offset`** —
  se cuentan los movimientos NUEVOS de cada página, y si una página viene llena y no aporta ninguno
  nuevo, `offset` no está haciendo nada, no se puede seguir leyendo y el renglón queda marcado como
  **no leído**, así que la caja NO se marca. Sin ese freno, un `offset` ignorado haría 20 vueltas
  contando 20 veces los mismos movimientos — el error contrario y peor.
  Probado con el bloque REAL sacado del archivo (no una copia) y 7 casos: 1 página · una página
  justo llena · los 291 de la corrida real · 600 movimientos (el caso Cartas Casino) · 1.500 (corta
  y avisa) · **ML ignorando `offset`** (corta a la 2ª llamada, no infla) · sin movimientos.
  **CÓMO QUEDÓ LA CAJA:** con el arreglo, la corrida ya no borra nada — el Centímetro Gris pasó a
  leer 90 de 90 y el Rosa 107 de 107, y **la caja se deja ABIERTA** avisando *"ML rechazó alguna
  consulta (429): un 0 acá no quiere decir que falte"*, que es como tiene que verse. Se cerró a mano
  con **`cajallego:76236266:go`** usando el dato de ML (511 de 511 a la venta), porque una caja
  abierta cuya mercadería YA está en Full se cuenta dos veces en el patrimonio.
  **LO QUE QUEDA ABIERTO Y HAY QUE MIRAR** (no es lo mismo que el bug de las páginas):
   · **Los 429 de ML.** Pedir todas las páginas multiplica las consultas, así que el límite de ML
     pega más seguido. El lado seguro está cubierto —un renglón sin leer NO se marca como faltante
     y la caja se queda abierta— pero una caja puede tardar varias vueltas en cerrarse sola.
   · **El Centímetro Blanco sigue leyendo 47 de 150 SIN estar marcado como no leído.** Ahí no es el
     429: es que **una de las publicaciones del Centímetro no nombra el color en el título**
     (`MLA1841730099`, código `TRZK95506`, la quinta, de la que el panel no sabe el color — ya está
     anotado más arriba). Sus entradas no se pueden imputar a ninguna variante, así que se van a
     otra clave. Se arregla con `fijarvar:MLA1841730099=<color>:go`, **y para eso falta que él diga
     de qué color es.**

  **LA LECCIÓN, y es la tercera vez que la misma caja la enseña: el marcado de cajas borra
  mercadería del patrimonio, así que todo lo que lea mal es destructivo.** El 11/09 el problema era
  no leer nada (faltaba `date_to`), el 12/09 era leer de más (`not_available` contadas), y ahora era
  **leer SÓLO EL PRINCIPIO**. Las tres veces el síntoma fue un número bajo que parecía un dato.
  **Y la de siempre: falta de dato no es falta de mercadería.**

- **510 UNIDADES DESAPARECIERON DEL PATRIMONIO: LA CAJA SE MARCÓ ANTES DE QUE ML LA PROCESARA
  (12/09/2026).** Él lo marcó desde Armar caja: *"porque me sigue recomendando que mande modista
  blanco si hay 150 en camino?"*. Tenía razón, y el problema era mucho más grande que ese renglón.
  **La cuenta de Armar caja estaba bien** —descuenta lo que va en camino, variante por variante—.
  Lo que estaba mal es que el panel creía que esa caja YA HABÍA LLEGADO. Es la caja **76236266** de
  Luciana (`env1788575390244`, 05/09, **9 renglones · 510 unidades · $338.913**), con 150 Centímetro
  Blanco, 90 Gris y 107 Rosa — los números exactos que muestra ML. Estaba en **🟢 verde**, o sea
  marcada como llegada COMPLETA. Y ML decía, en esa misma pantalla: *"Recibido en el centro de
  almacenamiento · **Procesamiento en curso**"*, con **Procesadas "-"** y **Aptas para Full "-"**.
  **LA CAUSA, Y ES UNA CONTRADICCIÓN ENTRE DOS LÍNEAS DE DOS ARCHIVOS:**
   · para MARCAR la caja se sumaba `available_quantity` **+ `not_available_detail`** (lo que ML
     recibió pero todavía está procesando),
   · para contar el STOCK de Full se usa **sólo `available_quantity`**.
  Entre las dos se abría un agujero: **lo recibido-pero-no-vendible no lo contaba NADIE.** No está
  en la oficina (salió al cerrar la caja), no está en camino (la marca lo sacó) y no está en Full
  (ML no lo dio de alta). 510 unidades y $338.913 evaporados del Arqueo — y Armar caja pidiendo
  mandar 50 Centímetros Blancos más cuando ya había 150 ahí adentro.
  **ES EXACTAMENTE EL PELIGRO QUE QUEDÓ ANOTADO EL 11/09** al soltar "marcar aunque llegue
  incompleta": *"habría borrado 51 unidades reales del patrimonio"*. Pasó al día siguiente y con
  diez veces más unidades. La nota estaba escrita; el freno, no.
  **Arreglado así:** el marcado cuenta **sólo lo que ML ya dejó vendible**, el MISMO número con el
  que el panel cuenta el stock de Full — si los dos lados usan el mismo número no puede quedar
  mercadería en el limbo. Lo recibido y no procesado se informa aparte (`enProceso`) y **sigue
  contando como "en camino", que es la verdad**: es tuyo y todavía no se puede vender.
  Lo que NO cambió: los tres frenos siguen igual, así que una unidad que nunca llegue a estar
  disponible (rota, descartada) igual cierra la caja a los 10 días, en ámbar y diciendo cuántas
  faltaron.
  **Comando nuevo para deshacer un marcado equivocado: `abrircaja:<seguimiento|id>[:go]`**, que
  devuelve la caja a "En camino a Full". Sin `:go` sólo muestra.
  **LA LECCIÓN: cuando dos partes del sistema cuentan la misma mercadería con números distintos, la
  diferencia no se pierde — se cae en un agujero donde no la mira nadie.** Y la segunda: un cambio
  aprobado por lo que hace ("marcá la caja cuando llegue") puede romper algo por lo que ADEMÁS
  hace ("y sacá sus unidades de en camino"). Al soltarlo hay que preguntarse qué más mueve.

- **EL MARGEN SE VEÍA COMÓDO EN VERDE SIN TENER EL ENVÍO DESCONTADO (12/09/2026).** Él lo marcó
  mirando Rotación de Stock: *"arregla el hecho de que yo vea mal el % de ganancia. porque el 5 lite
  no debe ser el unico"*. Tenía razón. El Xiaomi Watch 5 Lite mostraba **+25%** con el envío en $0.
  **El aviso EXISTÍA y no servía, que es peor que no tenerlo.** Había dos marcas, `⚠` (sin envío) y
  `⚠ml` (envío sacado de la tarifa de ML), pero eran un supraíndice de 0,85em al lado del número —
  y **el número se seguía pintando VERDE**, o sea que el color decía "acá hay aire" sobre algo que el
  propio código sabía que se quedaba corto. En una tabla de 137 renglones eso no lo ve nadie.
  **Y la ficha no avisaba NADA en ese caso.** El chip ámbar "SIN ENVÍO" sale con `netoCalcSinEnvio`,
  y el 5 Lite tiene el OTRO flag (`netoCalcEnvioML`). Peor todavía: el comentario que dejé anteayer
  en `flujoPlataHTML` decía textualmente que ese caso *"ya tiene su propio aviso, el chip ámbar SIN
  ENVÍO"*. **No lo tenía.** Es la misma lección del marcado de cajas, dos días después: un comentario
  que afirma que algo está cubierto no es prueba de que lo esté.
  **Qué se hizo**, en UNA función (`margenDudosoDe`) que usan la tabla Y la ficha, con tres estados:
   · **`falso`** → precio arriba de los $33.000 y envío $0. Ahí ML cobra el envío gratis SIEMPRE, así
     que el margen no es optimista: es **falso**. Se muestra **"?"**, nunca un porcentaje.
   · **`corto`** → el envío salió de la tarifa de ML, que medida el 20/08 se quedó $246 corta. El
     número sirve, pero el real es MENOR: va en **ámbar**, con el motivo en un renglón que se lee.
   · **medido** → contra ventas reales. **Es el único que puede ir en VERDE.**
  Arriba de Rotación hay un cartel que dice cuántos son de cada tipo y **se toca para ver solo esos**
  — su pregunta no era "¿cuánto es?" sino "¿cuáles son?". Y **no se inventa un envío estimado**:
  contar el envío dos veces es el error que ya mordió cuatro veces.
  **LA LECCIÓN: un aviso que no cambia el COLOR no es un aviso.** El verde es una conclusión, y una
  conclusión sobre un dato que no está medido es una mentira aunque al lado haya una advertencia.
  **Y la segunda, para mí: la columna "Capital" no es el precio.** Leyendo esa misma pantalla di por
  roto el "rematar al 12% · $120.240" del 5 Lite porque lo comparé contra los $71.654 de al lado —
  que son la plata parada, no el precio. El número estaba bien. Antes de decir que un número está
  mal, mirar el encabezado de la columna.

- **EL SIMULADOR DE PRECIOS NO CONOCÍA LA BARRERA DE LOS $33.000 (11/09/2026).** Él lo marcó
  comparando la ficha contra el simulador de ML: *"no coincide"*. Tenía razón y era del lado
  peligroso — el panel daba **de más**.
  El producto está a $24.000 (abajo de la barrera) y él probó **$35.600**. La ficha contestó
  *"envío de Full (no cobra) −$0"*, te deposita **$24.738**, margen **23%**. El simulador de ML, al
  mismo precio, daba **$23.619** de depósito: **~$1.050 menos**. La diferencia es el envío gratis
  que ML empieza a cobrar arriba de $33.000 (en esa publicación, $6.190).
  **La causa, en una línea:** en el simulador el envío es `const gest=r.gest||0` — un número FIJO
  del producto que NO se mueve con el precio que él tipea. Vale $0 porque el precio real está abajo
  de la barrera y ML nunca le cobró envío. Al simular arriba, sigue en $0.
  **Y lo más grave no era la plata, era el consejo:** la línea *"el 23% te da hasta $35.600"* le
  estaba recomendando un precio ARRIBA de la barrera, que por su regla del 13/08/2026 no se cruza
  nunca. **`index.html` no tenía el número 33.000 escrito en ningún lado.** El robot lo tiene en
  cuatro lugares (`UMBRAL_ENVIO_GRATIS`, `TOPE_ENVIO`); la web, en cero.
  **Qué se hizo, y qué NO se hizo:** ahora la web tiene `UMBRAL_ENVIO_GRATIS=33000`, y al probar un
  precio arriba de la barrera en un producto **sin envío medido** el margen muestra **"?"** en vez
  de un porcentaje, la fila del envío dice **"−? · ML SÍ cobra acá"** y sale un cartel rojo. Y el
  *"te da hasta"* pasa a decir *"para el 25% habría que cruzar los $33.000: no se cruza"*.
  **NO se inventó un envío estimado a propósito:** contar el envío dos veces es el error que ya
  mordió cuatro veces, y sin un envío MEDIDO para ese producto la respuesta honesta es "?".
  **Y el 30,5% contra el 16% quedó explicado el mismo día, con `comisiones`: no se contradicen.**
  Ver la sección de abajo — el 16% es la comisión base y el panel muestra la comisión COMPLETA, con
  el cargo fijo adentro; y esa publicación es de las 4 que están en Premium.
  **El aviso sale SÓLO cuando está simulando.** Hay productos que viven arriba de la barrera con
  permiso suyo (el Ferrari a $59.900, los VS a $49.000) y ésos ya pagaron el envío de verdad: un
  cartel rojo permanente ahí sería ruido, y cuando todo está pintado nada resalta.
  **LA LECCIÓN: una regla que vive en un solo lado del sistema no es una regla.** La barrera estaba
  en el robot y en este archivo, pero no en la pantalla donde él decide los precios — así que la
  pantalla lo invitaba a romperla. Es el mismo patrón que los ocho comandos con `|| 30` adentro.


- **EL MARCADO AUTOMÁTICO DE CAJAS NUNCA FUNCIONÓ, Y EL SÍNTOMA ERA UN CERO (11/09/2026).** Él lo
  marcó: *"hubo cajas que llegaron, pasaron aprox 8hr y el robot no había marcado nada. para mí no
  funciona así como decís vos"*. Tenía razón, y yo le había contestado que sí funcionaba leyendo el
  comentario del código en vez de correrlo. **Nunca marcó una caja. Ni una.**
  Lo que mostraba la corrida eran dos renglones: *"Inventarios de Full mirados: 72 · Ninguna caja
  abierta quedó cubierta"*. Eso se lee como "ML todavía no recibió nada". **Eran DOS errores
  encadenados, los dos silenciosos:**
  · **Faltaba `date_to`.** `/stock/fulfillment/operations/search` exige las DOS fechas y el robot
    mandaba sólo `date_from`: las 72 consultas devolvían `400 {"message":"The field date_from and
    date_to are required"}` y el `catch {}` vacío se las tragaba enteras.
  · **La cantidad venía con otro nombre.** Una vez que ML contestó aparecieron 7 `inbound_reception`
    … y seguían contando cero. El objeto crudo viene así:
    `detail = {available_quantity, not_available_detail:[{status,quantity}]}` ← lo que entró en ESE
    movimiento · `result = {total, available_quantity, …}` ← el stock que QUEDÓ después.
    **No existe ningún `quantity` suelto**, y era justo el que se leía.
    **Ojo con la tentación de usar `result`: sería peor que no arreglarlo.** Es el stock acumulado,
    o sea que contaría el depósito entero en cada movimiento y marcaría como llegadas cajas que no
    llegaron. Las `not_available` (ej. `internal_process`) SÍ se suman: entraron al depósito, sólo
    que todavía no se pueden vender, y la pregunta que se contesta es si la caja llegó.
  **Lo que sigue siendo cierto de la nota del 20/08:** lo que va EN CAMINO no se puede leer de ML.
  `operations/search` muestra lo que YA ENTRÓ, que es otra cosa y es lo que se usa acá.
  **El agujero que esto destapó, ya cerrado el mismo día:** la ventana arranca en la fecha de la caja
  abierta más vieja y las entradas se sumaban en un total suelto, así que las de una caja anterior se
  le acreditaban a la caja abierta. Con la regla vieja sólo retrasaba un verde; con la regla nueva
  —marcar aunque falte— habría borrado 51 unidades reales del patrimonio. Ahora cada entrada se
  guarda con su fecha y sólo cuenta para las cajas despachadas antes.
  **Y la lección de eso: un cambio que parece chico cambia de gravedad según lo que haya alrededor.**
  El mismo defecto era cosmético con la regla anterior y destructivo con la nueva. Por eso la prueba
  en seco antes de soltarlo no es opcional: el número que la delató fue "marcaría la caja con 51 de
  64 faltantes", que es demasiado para ser cierto.
  **LA LECCIÓN, y es la misma que ya está anotada tres veces (el `catch {}` de Telegram, el filtro
  que descarta por omisión, el `||` que se comía el cancelar): el dato no se pierde con ruido.**
  Acá encima el síntoma era un CERO, que parece una buena noticia. Y la segunda lección es para mí:
  **un comentario que dice "esto corre solo una vez por hora" no es prueba de que funcione.** Cuando
  él dice que algo no anda, se corre y se mira — no se cita el código.
  Por eso `cajasllegaron` ahora imprime: cuántas cajas abiertas hay, cuántas entradas informó ML,
  **cuántas consultas fallaron y con qué error**, los tipos crudos de movimiento que devuelve ML al
  lado de los que acepta el filtro, las unidades anotadas con su clave, y renglón por renglón de
  cada caja lo que pide contra lo que ML dio.


- **UN FILTRO DE FECHA QUE NO FILTRABA NADA, POR UN GUIÓN BAJO (09/09/2026).** `nomandar` avisa
  cuántas unidades vendió la cuenta que estás por sacar, "en 90 días". Contaba las de SIEMPRE.
  Las claves de los días son `2026_09_09`, con guión bajo, y `new Date('2026_09_09T00:00:00-03:00')`
  **no explota: devuelve NaN**. Como `NaN < desde` es **false**, el `continue` no se cumplía nunca y
  la ventana de 90 días no descartaba ni un día.
  Consecuencia real: le dije que Ayelen había vendido **51 Adaptadores universales y 41 Batidoras
  "en 90 días"** cuando en 90 días no vendió ninguno — los 51 eran de toda la historia. Le pasé como
  motivo para dudar algo que en realidad confirmaba lo contrario.
  Y el aviso `⚠️ VENDE` saltaba en casi todos los productos, **que es lo mismo que no avisar**: un
  aviso que suena siempre entrena a ignorarlo.
  La MISMA cuenta está bien escrita 140 líneas más arriba, en `vercaja`, con el `.replace(/_/g,'-')`.
  **La lección: una fecha inválida no avisa.** Comparar contra `NaN` da `false` y el filtro se
  apaga solo, en silencio. Es el mismo patrón que el `catch {}` vacío y que el `||` que se comía el
  cancelar: el dato no se pierde con ruido.

- **UNA COMPRA CON DOS PRODUCTOS SE VEÍA COMO UNA GANANDO Y OTRA PERDIENDO (08/09/2026).** Él lo
  marcó: *"los ferraris negros lo habia bajado lo maximo y veo que le gane un monton y los rojos que
  tenian bastante % de ganancia en teoria perdi plata. no tiene sentido."* Tenía razón, y **ninguno
  de los dos números era cierto**: el Negro daba +39% y el Rojo −1%; juntos dan **+20%**, que es lo
  real.
  Es una sola compra (#2000014927347373, Adriana). Cuando el comprador se lleva dos productos, ML
  arma **una ORDEN por producto** con el mismo nº de paquete —el número que él ve— y **no reparte
  los gastos del paquete**: le cargó al Rojo los $14.580 de envío de los dos y los $8.649 de cuotas,
  y al Negro nada. Verificado con `DUMP_ORDER` contra Mercado Pago: Negro $61.870→$52.574 (ML 15%),
  Rojo $64.550→$31.622 (ML 51%), juntos 33,4% que es lo normal.
  **No es cosmético:** el renglón que aparece "perdiendo" hunde el margen del producto y puede
  disparar una suba de precio que no hace falta.
  Arreglado en los dos lados: el robot junta el neto y los cargos a nivel PAQUETE y los reparte
  entre todos los productos en proporción a lo que vale cada uno (si una orden del paquete todavía
  no está liquidada no junta nada y se corrige en la vuelta siguiente); y la lista de Ventas agrupa
  por **número de venta**, no por orden — una compra, un renglón (`vpGrupoKey`/`vpEsDelGrupo`, que
  usan también cancelar, reactivar, borrar y el conteo de ventas: borrar por `saleId` dejaba la
  mitad de la compra adentro). Releído: Negro $41.205 · Rojo $42.990, los dos al 33,4%, y el total
  no se movió.
  **La lección: cuando dos renglones de la MISMA compra dan números opuestos, el problema no está en
  ninguno de los dos — está en cómo se repartió la plata entre ellos.** Los renglones siguen siendo
  uno por producto a propósito: cada uno tiene su costo y su ficha, lo que se junta es la plata.

- **11 PUBLICACIONES CON STOCK EN FULL QUE EL PANEL NO SABÍA QUE EXISTÍAN (08/09/2026).** Él estaba
  armando una caja y no le aparecían: *"necesito armar las cajas y no aparecen los productos"*. Eran
  perfumes y body splash de Victoria's Secret, el Halloween Kiss Sexy y el Ted Lapidus Rumba, todos
  de Adriana, **pausados** y con stock adentro de Full. En Armar caja salían como
  *"sin publicar en ninguna cuenta"*, que es lo que dice el panel cuando ninguna publicación cae en
  esa variante — y sin publicación no entran en el reparto, así que no hay forma de mandarles nada.
  Las publicaciones existían: lo que faltaba era la vinculación.
  **Dos cosas que costaron encontrarlas y conviene recordar:**
  · **El "Código ML" que muestra la pantalla de enviar a Full NO es el MLA.** Es el código del
    producto adentro de Full. Con eso no se puede vincular nada; el MLA sale de `buscarpub:<texto>`.
  · **ML traduce los títulos y quedan irreconocibles.** "Electric Mango" figura como *"Salsa
    Corporal Eléctrica Con Mango De Victoria Secret"* y el Melon Pear como *"Colección Archives De
    Pear Glacé"*. Buscar por el nombre que él usa no encuentra nada: hay que buscar por una palabra
    que sobreviva a la traducción (`mango`, `kiss`, `splash`).
  Y apareció un tope real: **`fijarvar` se negaba a adivinar** porque "Love Spell", "Bare Vanilla" y
  "Pure Seduction" existen en TRES fichas de VS a la vez (Victoria's Secret · BLISS · STARLIT). Se
  negaba bien —adivinar ahí ensucia el stock de dos fichas y no se nota— pero la única salida era
  correr `vincular` una por una, o sea una corrida entera de GitHub por publicación. Ahora la
  variante puede llevar la ficha atrás de un `@`: `fijarvar:MLA123=Love Spell@STARLIT`, y cuando se
  nombra la ficha manda ella.
  **La lección: cuando un comando se niega a adivinar tiene razón, pero si la salida que ofrece es
  más cara que el problema, la que hay que arreglar es la salida.**

- **CANCELAR CERRABA LA CAJA IGUAL: UN `||` SE COMÍA LA RESPUESTA (07/09/2026).** Él lo contó así:
  *"varias veces haciendo una caja apreto sin querer 'cerrar caja' me da dos opciones aceptar o
  cancelar. cualquiera de las dos que elija me cierra la caja."* Era cierto y era grave: la caja
  salía despachada, con el stock ya descontado de la oficina y SIN número de seguimiento — o sea
  imposible de rastrear y de marcar como llegada, así que quedaba "en camino" para siempre.
  El motivo cabe en un renglón: `const track=(prompt(...)||'').replace(...)`. Cancelar devuelve
  `null`, el `||''` lo convertía en cadena vacía **antes** de mirarlo, y el `if(track===null)return`
  de la línea siguiente no se cumplía nunca. Era código muerto que parecía el freno.
  **La lección: el chequeo va ANTES del valor por defecto, nunca después.** Un `||` puesto para
  "no romper si viene vacío" borra justo la diferencia entre *vacío* y *canceló*, que es la que
  decidía todo. Es el mismo patrón que el `catch {}` vacío y el filtro que descarta por omisión:
  el dato no se pierde con ruido.
  Y de paso el **seguimiento pasó a ser obligatorio**, pedido suyo. Cancelar deja la caja intacta
  para seguir armándola; aceptar sin número avisa y vuelve a preguntar.

- **UNA CUENTA NO PODÍA RECIBIR UN PRODUCTO QUE TODAVÍA NO PUBLICABA (07/09/2026).** Pedido suyo
  con los P47: *"puede que no haya publicacion hecha en la cuenta de ayelen de todos. se puede pasar
  igual? asi la proxima enviada a ayelen ya me aparecen los p47 ahi asi no me olvido de mandarlo y
  ahi creo la publicacion correcta"*.
  No se podía, y era un huevo y una gallina: el reparto de Armar caja sólo mira las cuentas que YA
  tienen publicación (`cuentasConPublicacion`), así que sin publicación no se sugiere, sin sugerencia
  no entra en la caja, y sin caja no hay stock con qué estrenar la publicación. Mudar un producto de
  una cuenta a otra era imposible de anotar en el panel.
  Ahora está la marca contraria a `norepo`: **`cyc/repoextra/<prodId>__<cuenta>`**, que mete a esa
  cuenta en el reparto igual. El renglón sale con un cartel **ámbar** diciendo que falta crear la
  publicación —el aviso tiene que estar donde se lee, no en este archivo— y abajo de Armar caja hay
  un desplegable con todo lo marcado, que se pone **verde** solo cuando la publicación ya existe:
  sin eso la lista se volvería un cementerio de marcas viejas.
  Se marca desde el chat con `pasara:<cuenta>:<palabras>[:go]`, mismo cuidado de siempre con los
  filtros por palabra.

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

- **EL ALMACENAMIENTO DE FULL NO SALE POR LA API. Probado el 02/09/2026** con `probaralmacena` en
  las cuatro cuentas: 10 rutas candidatas fallan (404, o directamente una página web — o sea que ni
  siquiera es una ruta de la API): `/inventories/<id>/stock/fulfillment/aging`, `/storage`,
  `/detail`, `/inventories/<id>/stock`, `/users/<sid>/stock/fulfillment/storage`,
  `/stock/fulfillment/storage`, `/stock/fulfillment/storage/search`,
  `/marketplace/fulfillment/storage`, `/fulfillment/storage/summary`, y las dos de
  `/billing/.../details`.
  El único que contesta del lado del stock es el que YA usamos, y devuelve **exactamente esto y nada
  más**: `{inventory_id, total, available_quantity, not_available_quantity, not_available_detail,
  external_references}`. **Ni antigüedad, ni fecha de entrada, ni cargo.** Del lado de facturación
  contesta el de siempre (`/billing/integration/monthly/periods?group=ML&document_type=BILL`) y trae
  **solo el total del período**, sin abrir el concepto — el mismo techo que con las percepciones.
  **Conclusión: la antigüedad del stock hay que deducirla de lo nuestro** (las cajas marcadas como
  llegadas + `cyc/stockhist`), que es lo que hace la columna "En stock desde" y ahora el aviso de
  almacenamiento en Rotación. No hay dato de ML con el que cruzarlo.
  Salvedad de la corrida: en Matías una de las rutas de billing dio **429** (5 llamadas por minuto),
  o sea que ahí quedó sin probar — pero esa MISMA ruta dio 404 limpio en Ayelen y en Luciana, así
  que la conclusión no cambia. Un 429 nunca es prueba de que un endpoint no exista.

- **LOS COMANDOS MEDÍAN CONTRA UN PISO QUE YA NO EXISTE (03/09/2026).** `unapub` decía 44,4% de un
  producto que en el panel daba 12%. Dos causas, y las dos inflaban el margen — el peor lado para
  equivocarse, porque dicen "está cómodo" de algo que está al filo:
  · **OCHO comandos tenían `|| 30` escrito adentro** (`hermanas`, `bajopiso`, `unapub`, `bajarcaja`,
    `corregir`, `gestadentro` y dos más) mientras el piso real vive en `cyc/mlconfig/minPct`, que
    pasó a 25 el 02/09. O sea que el comando `meta:<piso>:<meta>`, que existe justo para cambiar ese
    número, no cambiaba nada de esto. Ahora sale de la base con `pisoConfig(db)`; pasarlo a mano
    (`bajopiso:25`) sigue ganando sobre el de la base.
  · **El envío del "peor caso" era $28** cuando en la venta real ML se quedó con ~$385. No es que sea
    barato de enviar: a esa publicación todavía no le tocó un envío caro. Es EXACTAMENTE lo que pasó
    con la Plantilla Metatarso el 14/08 y quedó anotado acá abajo — pero el comando seguía sin
    decirlo, o sea que había que acordarse de sospechar. Ahora `unapub` avisa solo cuando el peor
    caso no llega ni a la mitad de la `gestFull` de la ficha, que es un dato que él observó en una
    venta real.
  **La lección: anotar un error en este archivo no lo arregla. Si el que se puede equivocar es el
  que lee la salida, el aviso tiene que estar en la salida.**

- **LA FICHA TENÍA TRES CAJAS QUE ERAN LA MISMA CUENTA, Y JUNTAS MENTÍAN (03/09/2026).** Pedido suyo:
  *"veo cosas repetidas. no se puede dejar solo la línea del dinero? que diga todo completo."*
  Eran Costo real full, Costo vender en Full y Neto ML. El problema no era la repetición sino que
  **"Costo vender en Full $36.691" y "Neto ML $38.912" quedaban uno al lado del otro y NO se restan
  entre sí**: la gestión de Full está SUMADA en uno y ya DESCONTADA del otro. Restarlos da $2.221,
  que no es la ganancia de nada; la real es $9.058. Esa confusión volvió tres veces en tres días.
  Ahora hay UNA sola caja: la línea del dinero, de izquierda a derecha, con todo adentro (el costo
  en dólares, el costo total y el %, el neto que haría falta para la meta y cuánto falta, las
  visitas, si está pausada, el aviso de bajo piso). Sin publicación no devuelve vacío — dice qué le
  falta y muestra igual lo que sí se sabe.
  **Y se redibuja sola** (`repintarFlujo`): los campos de costo y gestión parchaban a mano el
  pedacito de su caja, con la fórmula copiada adentro. Eran tres lugares más donde podía quedar
  desincronizada.
  **La lección: dos números correctos, puestos uno al lado del otro, pueden dar una conclusión
  falsa. Si la resta que invita la pantalla no es la resta correcta, la pantalla está mal.**

- **"¿POR QUÉ ME HACE COMPRAR 7?" — LA CUENTA ESTABA BIEN, LA TARJETA NO (03/09/2026).** Él lo marcó
  con la Balanza Cocina: *"si hay 4 en camino y se vendieron 6 en 30 días, ¿por qué me hace comprar
  7?"*. Verificado con `porquepedido`: vendió 6 en los **17 días que tuvo mercadería**, no en 30 —
  los otros 13 estuvo en cero. A 0,36 por día, en 30 días vende 11; 11 − 4 en camino = 7. ✓
  Pero la tarjeta mostraba "30d: 6 vendidos" y "4 en camino" uno al lado del otro, que es una
  invitación a hacer 6 − 4 = 2. Los dos números que hacían falta —los días con stock y el objetivo—
  se calculaban y se tiraban. Ahora se guardan con el pedido (`cuentaPed`) y se muestra la cuenta
  entera al abrir la tarjeta.
  Ojo al tocarlo: el update arma el pedido ENTERO de cero, así que un campo nuevo va en las TRES
  ramas (alta, actualización y pedidos a mano) o se pierde en silencio.

- **LA PAUSA POR PRECIO VENCE A LOS 30 DÍAS (03/09/2026).** Agujero que marcó él: *"voy a marcar
  todos los productos que los precios ya no dan. perfecto. pero quizás de acá a 20 días ya sí
  conseguimos y me sigue sin aparecer porque está pausado"*.
  El margen se mueve por DOS motivos: que suba el precio en ML (el panel lo ve solo) o que el
  proveedor te lo venda más barato — y **ese número el panel no lo conoce**. O sea que el caso que a
  él le importa no se iba a avisar nunca. Ahora vence (`PAUSA_REVISAR_DIAS` = 30) y vuelve marcado
  🔔 con dos botones: 😴 sigue sin dar (la duerme otros 30) y ↩︎ volver a Pedidos. Vuelve a la LISTA,
  no a Pedidos, para no restar puntaje sin decir por qué. El aviso va también arriba de Pedidos.
  **La lección: un aviso automático sólo sirve para lo que el panel puede ver solo. Para lo que
  depende de un dato de afuera, hace falta un vencimiento.**

- **DÓNDE ESTÁ EL TECHO DEL NEGOCIO (03/09/2026, medido con `proyec` y `catmono`).** Por cada $100
  facturados quedan **$16,94** de contribución (ML deposita $67,68 · mercadería $45,95 · IIBB $4,79).
  Con las cuatro en categoría H los fijos son $3.547.812/mes (mono 4×H $819.247 + gastos $675.167 +
  retiro $1.800.000 + interés $253.398). De ahí:
  · CYC queda en CERO facturando **$698.000/día**
  · el techo antes de pasarse de H es **$840.000/día** — y NO son los $910.000 de cuatro cuentas
    parejas, porque el tope ($81.924.660/año) es **por CUIT** y Ayelen se lleva el 27,1%
  · el ritmo de agosto quedaba por ARRIBA de ese techo — se recalcula con `catmono`, no se anota
  **Emparejar el reparto entre las cuatro sube el techo de $840.000 a $910.000/día** — $2,1M/mes de
  facturación que hoy no se puede hacer sólo por el desbalance. Es gratis.
  Y la conclusión incómoda: **aun facturando el máximo que H permite, a CYC le quedan ~$700.000/mes.**
  El techo no lo pone la capacidad de vender, lo pone la categoría. Un punto de margen vale
  ~$230.000/mes; pasar el piso de 25% a 28% vale ~$700.000/mes sin vender un peso más.
  Ojo con leer el promedio como si fuera el mes: **agosto dejó $1.714.396, no cero.** Lo que hunde el
  promedio de 2 meses es julio ($18,3M contra $28,0M de agosto).

- **BAJAR PRECIOS NO ES UNA PALANCA HOY. Medido el 04/09/2026** con `bajarcaja:21:25`, cuando él
  pidió "hay productos que estén perdiendo, se pueda bajar el precio y no vendan hace un tiempo?
  necesitamos vender más". La respuesta del comando fue **"Ninguna. No hay nada que bajar que valga
  la pena hoy"**, y el detalle explica por qué:
  · **14 candidatas** (activas, con stock, sin vender hace 21+ días, con la caja perdida): bajarlas
    al precio de la caja las dejaría entre **−8% y 20%**. Ninguna llega al 25%.
  · **5 que YA ganan la caja y aun así no rotan · $757.238 parados** — Ferrari Scuderia (Adriana,
    14 u., $434.532), Philips TAT2206, Kit Tira Luces LED, Perfume Salvador Dalí, Auriculares P47.
    Ahí el precio está descartado por definición: ya son los más baratos del catálogo.
  · **Paulvic: $610 de aire** (ver arriba).
  **Conclusión: no hay plata escondida en los precios.** Las dos palancas que quedan son el STOCK
  (las ventas cayeron $405.534/día y hay ~100 publicaciones sin stock que valían ~$500.000/día —
  los números coinciden demasiado bien) y las VISITAS, que es el único dato que separa "no la ve
  nadie" de "la ven y no compran" en esos $757.238 parados.

- **LOS PAULVIC ESTABAN TODOS AL MISMO PRECIO POR UNA REGLA, Y ESA REGLA TAPABA EL PROBLEMA
  (04/09/2026).** Pedido suyo: *"los paulvic sacar la regla que estén todos al mismo precio. que sea
  personalizado. quizás hay algunos que venden bien y otros que están perdiendo"*.
  El grupo `cyc/mlconfig/gruposPrecio/paulvic` agrupa por la palabra "paulvic" en el título y nivela
  **al precio MÁS ALTO** en cada corrida. Eran **47 publicaciones**, no 12 — y con aromas distintos
  adentro (Phantom de hombre, Dream Way de mujer, Diva, Scandal Bliss). O sea que un aroma que
  vendía bien y otro que no vendía nada estaban obligados a valer lo mismo sólo por compartir marca.
  **Desactivado con `grupos:paulvic:off`. Eso NO cambia ningún precio**: sólo deja de forzarlos.
  **Lo que apareció al mirarlos uno por uno es que el stock está al revés de las ventas:**
  · `MLA3026120138` vende **25 por mes** (el que más vende de los 47) y está **PAUSADO EN CERO**
  · `MLA3026299952` vende 3 por mes y tiene **40 unidades** — 13 meses de stock
  · cuatro (`3026121450`, `3026302302`, `3026473440`, `3026476116`) no vendieron NADA en 30 días y
    entre los cuatro tienen 32 unidades
  **Y el precio queda descartado como causa por los propios números:** esos cuatro que no venden
  tienen el margen MÁS ALTO del grupo (35,8% a 39%) y los dos que más venden tienen el MÁS BAJO
  (35,2% y 32,8%), todos al mismo precio. Si el precio fuera el problema venderían todos igual.
  Es el aroma, no el número.
  **La lección: una regla que uniforma esconde justamente la diferencia que hay que ver.** Mientras
  los 47 tuvieron el mismo precio, no había forma de notar que el mejor estaba en cero.
  Para mirarlo: `hermanas:paulvic:25`, que desde hoy trae ventas de 30 y 60 días y días sin vender.

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
  **Y el agujero que salió a la luz: `volver` NO pasaba por el freno del piso.** En una publicación
  sin variantes hacía un PUT directo a ML, salteando `setPriceTo` y `_chequeoPiso`. **CERRADO el
  17/09/2026: `volver` ya no baja** (ver arriba). Tardó 23 días, y eso es la lección: una nota que
  dice "queda pendiente cerrarlo" no cierra nada — mientras tanto el agujero sigue abierto.

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
  **AMPLIADO EL 08/09/2026: la marca también saca el producto de "Contar lo que hay".** Pedido
  suyo: *"todos los productos que marco como que no van mas a esa cuenta quiero que salga de contar
  lo que hay. sino se me hace lio"*. Al filtrar por Adriana seguían apareciendo los 32.
  **"Todas" los sigue mostrando a propósito** y el cartel de arriba dice cuántos quedaron afuera:
  lo que se anota es lo que hay EN CASA, uno solo para las cuatro cuentas, así que esconder el
  renglón no mueve ninguna unidad — pero si un producto quedara marcado en las cuatro y no
  existiera esa salida, no habría dónde contarlo.
  **A dónde va esto:** norma suya del mismo día — *"el objetivo final es que cada cuenta venda su
  mercaderia unica. que NUNCA se cruce mercaderia entre cuentas (salvo excepciones como paulvic…
  eso lo resuelvo yo)"*. Y en la misma frase el freno: *"pero no hagamos ningun lio por ahora"*. O
  sea: la separación total es el rumbo, no el pedido de hoy. **No adelantarse.**

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
- **EL ORIGEN DE CADA PRODUCTO: BS AS o PARAGUAY, y son dos mundos que NO se mezclan.**
  Cada ficha tiene `origen` (`'bsas'` o `'py'`) y eso decide en qué sección de Pedidos aparece.
  · **🇦🇷 BS AS** — lo compra el padre EN PERSONA en el mayorista de Bs As. Los límites son la
    plata (~$3M), el lugar en la Kangoo —que va compartida con la perfumería— y que el mayorista
    tenga. Tarda 1 semana.
  · **🇵🇾 PARAGUAY** — se pide por la web, buscando en `comprasparaguay.com.ar` y **siempre con el
    precio y el código de NISSEI** (el mismo producto aparece en varias tiendas con precio y código
    distintos). **US$1.000 exactos por pedido, uno a la vez**, 5 días hábiles. Más el **viaje de fin
    de mes con US$4.000**, donde los celulares viajan gratis y no gastan del cupo (`celuviaje`).
  **LA NOTA VIEJA DE ACÁ DECÍA "Paraguay 2 MESES" y nombraba `PED_DIAS_ROJO_PY`, `PED_TARGET_PY` y
  `esPaisLento`: las tres cosas YA NO EXISTEN.** Paraguay pasó a 5 días (16/09/2026), así que la
  excepción se borró entera en vez de dejarla apuntando al mismo número — una excepción que no
  distingue nada es peor que no tenerla. Hoy los tres proveedores usan lo mismo:
  `PED_TARGET_DIAS` = 20 días y `PED_DIAS_ROJO` = 14.
  Ojo con no confundir dos plazos que se parecen: `REPO_DIAS_DEMORA` (8 días) es el tramo
  caja→Full y es igual para todos, porque sale de la misma oficina. El del PROVEEDOR arranca antes,
  cuando todavía hay que comprar la mercadería.
  **EL ORIGEN SE CAMBIA DESDE PEDIDOS, NO SÓLO DESDE LA FICHA (17/09/2026, pedido suyo:** *"quiero
  que en pedidos esté la opción si es bs as o paraguay el producto"*). Antes el botón vivía sólo en
  la ficha del producto: para mover algo había que salir de Pedidos, buscar el producto y volver.
  Ahora cada tarjeta de Pedidos tiene el botón 🇦🇷/🇵🇾 y **llama a `toggleProdOrigen`, la MISMA
  función que usa la ficha** — el origen vive en el producto y tiene que haber un solo lugar donde
  se escriba; dos copias dejarían la ficha diciendo una cosa y Pedidos otra.
  **EL CASO QUE HABÍA QUE CUIDAR, y es el agujero de siempre: un pedido cargado A MANO no lo mueve
  nadie.** La limpieza automática filtra `x=>x.auto` y la creación sólo escribe los `auto`, así que
  un pedido a mano se quedaba en la sección vieja para siempre mientras la ficha decía la otra — el
  MISMO agujero que dejó al Termómetro pincha congelado desde el 27/06. Por eso `togglePedidoOrigen`
  lo mueve a mano cuando `auto===false`; los automáticos los mueve `syncPedidosAuto` solo (su
  limpieza compara `r.coll!==coll`).
  **Y sin ficha no hay origen que cambiar**: ahí el botón no aparece y en su lugar dice "🏳️ sin
  ficha" con el motivo. Un botón que no hace nada es peor que no tener botón.
  Probado con las dos funciones REALES sacadas del archivo (no una copia) y seis casos: automático
  ida · a mano ida · a mano vuelta · sin `prodId` · ficha inexistente · ida y vuelta completa.
  Ninguno duplica el pedido ni lo deja fuera de las dos listas.
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

- **"POR PROVEEDOR" SE SACÓ DE PEDIDOS (18/09/2026).** Decisión suya: *"eliminar el por proveedor,
  nunca se uso. borrar lo relacionado. si tenes duda solo sacalo que no se vea y listo"*.
  Era un botón en Bs As y en Paraguay que agrupaba los pedidos por proveedor y le sumaba a cada
  grupo el descuento por volumen de ese proveedor. Nunca se apretó.
  **Se borró entero, no sólo escondido**: los dos botones, la variable, el bloque que los
  sincronizaba, la función del botón, la rama de agrupado y las tres clases de CSS que sólo usaba
  esa vista. La lista queda siempre ordenada por la plata que se pierde si no se repone, que es
  como se usa siempre.
  **LO QUE NO SE TOCÓ, y era la trampa: el campo "Proveedor" de cada pedido SIGUE VIVO.** No es lo
  mismo que el botón — ese dato lo usa **`esPedidoPaulvic`**, que es lo que manda los Paulvic a su
  propia pestaña. Borrarlo de paso habría mezclado los Paulvic con Bs As, que es justo el bug que
  se arregló el 23/08.
  Para borrarlo se marcaron los bordes a mano y se corrió el chequeo de las tres listas (más las
  clases de CSS): falta **exactamente** `togglePedidoGroupProv`, los `id` `pf-prov` y `pf-py-prov`
  y las dos clases `ped-prov-*`. Nada más.
  Quedan sin usar dos ayudantes de dos renglones (`provByNombre` y `calcDescuento`): no se tocaron
  porque viven con el resto de Proveedores y sacarlos era más riesgo que beneficio.

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

- **LOS DOS DISCOS: YA TIENEN COSTO Y ESTÁN ACTIVOS, PERO NINGUNO VENDIÓ NUNCA (15/09/2026).**
  La nota vieja de acá decía "pausadas y con la ficha en $0" y **las dos cosas ya no son ciertas** —
  otra vez lo mismo: no confiar en esta lista sin correr el comando. Medido con `unapub:<MLA>:23`:

  | | WD Green SSD 480GB | Seagate 500GB Expansion |
  |---|---|---|
  | publicación | `MLA2067443797` · Matías · **activa** | `MLA3920081802` · Matías · **activa** |
  | precio | $189.999 | $187.469 |
  | mercadería | $97.964 | $75.000 |
  | caja de compra | 🟢 **GANANDO** | 🔴 **PERDIENDO** · se gana a $180.046 |
  | margen | **23,7%** | **49,2%** |
  | ventas | 0 en 30 días · **0 en toda la historia** | idem |

  **Son dos casos OPUESTOS y el remedio es distinto en cada uno:**
   · El **WD gana la caja y aun así no vendió nunca**, así que el precio y la caja están descartados
     como causa: lo que queda es VISIBILIDAD (`visitas`). Y **no hay lugar para tocarle nada**: con
     23,7% está a 0,7 puntos del piso, el precio que lo deja exacto en 23% es $188.830.
   · El **Seagate pierde la caja teniendo 49,2%**: bajando a $180.046 todavía deja **44,2%**. Es de
     los pocos casos donde bajar tiene sentido de verdad — pero **la decisión es suya** (regla 5).

  **EL MARGEN DEL WD NO ESTÁ MEDIDO, Y A 0,7 PUNTOS DEL PISO ESO IMPORTA.** El envío ($15.500) sale
  de la **tarifa de ML**, no de ventas reales — ninguna de las dos vendió nunca —, y esa tarifa ya
  se midió **$246 corta** el 20/08. O sea que el 23,7% es el techo optimista: el real puede estar
  ABAJO del piso. No es "está justo", es "no sabemos si llega".
  El "stock 2" y "stock 1" que muestra ML puede ser el 1 del formulario, no mercadería (regla del
  20/08): antes de contarlos como capital, mirar si es Full.

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

- **LAS FACTURAS DE LOS PRODUCTOS "IMITABLES" YA LAS PRESENTÓ (08/09/2026).** Textual: *"ya
  presente todas las facturas. listo con eso."* **NO hace falta seguir sacándolo en cada chat** —
  durante semanas la nota decía que había que recordárselo y eso ya está cumplido.
  Lo que queda es de ML: el "Bare Vanilla" (`MLA3546445862`) y los dos Termómetros de heladera
  siguen en revisión hasta que ML acepte los papeles.
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
- **LAS TARJETAS DE MEMORIA: 53 DE 54 RETIRADAS. QUEDA UNA, Y SU PUBLICACIÓN SE REACTIVÓ SOLA
  (18/09/2026).** Él avisó *"ya las retire, no deberia haber stock en full. corroborar."* y se
  corroboró contra ML con `stockreal`, publicación por publicación:

  | ficha | publicación | estado | ML dice |
  |---|---|---|---|
  | SanDisk 32GB | `MLA1809285407` | **ACTIVA** ⚠️ | **1 u.** |
  | SanDisk 16GB | `MLA1843219973` | pausada | 0 ✓ |
  | SanDisk 128GB | `MLA1843206589` | pausada | 0 ✓ |
  | Kingston 32GB | `MLA1843207099` (+ `MLA1624998155` cerrada) | pausada | 0 ✓ |
  | Kingston MicroSD 256GB | `MLA3531510088` | pausada | 0 ✓ |
  | Kingston 64GB | `MLA3628501030` | pausada | 0 ✓ |

  El panel coincide con ML en las seis y en la que queda. Eran 54 unidades (Sandisk 32gb 28 ·
  Kingston 64gb 15 · Kingston con adaptador 7 · Sandisk 128gb 4): **salieron 53**.

  **Y LO QUE IMPORTA MÁS QUE LA UNIDAD: esa publicación está ACTIVA, y la prendió el robot.** Es
  `activarPausadasFull` haciendo exactamente lo que él pidió el 17/09 —*"que se active
  automáticamente siempre que el producto esté pausado con stock en Full y tenga más del 25% de
  ganancia"*— sobre una publicación que estaba pausada por la decisión del 15/08 (*"son para
  problemas"*). **Dos decisiones suyas que se contradicen**, y gana la nueva porque es la que está
  en el código.
  **Mientras esa unidad esté en Full, pausarla a mano no sirve: el robot la vuelve a prender a la
  hora.** Se corta con un freno que `activarPausadasFull` sí respeta (`nomas` o `noAutoActivar`), y
  eso lo decide él.
  **LA LECCIÓN: una regla automática nueva puede deshacer una decisión manual vieja, y el único
  lugar donde eso se ve es cuando alguien mira.** Al escribir un automatismo hay que preguntarse qué
  decisiones anteriores pisa — no sólo qué hace.
  Los pendrives NO se tocaron.
- **HAY UNA LISTA EN GASTOS DE LO QUE SE CARGA A MANO CADA MES** (28/08/2026, pedido suyo: *"que
  haya un lugar que me indique si se cargó los gastos del mes de las cosas que te tengo que pasar
  manual, para que al terminar el mes no falte cargar ninguno"*). Va arriba de los movimientos:
  ❌ rojo lo que falta, ✅ verde lo cargado con su monto. Se define en `GASTOS_DEL_MES`.
  Reconoce por categoría, y donde varias comparten categoría además por una palabra de la
  descripción (`pal`) o descartando una (`no`: "Servicios" excluye el Sancor). **Si un gasto se
  carga con otro nombre lo marca en rojo aunque esté**: es un falso faltante, a propósito — dar por
  cargado algo que falta sería mucho peor, y eso se dice en pantalla.
  Sólo se muestra en la vista por MES.
  **AMPLIADA EL 15/09/2026, pedido suyo: *"en gastos falta hacerme acordar de intereses, y otros
  gastos que hubo en meses anteriores"*.** Faltaban dos de los ocho, y los dos venían saliendo todos
  los meses:
   · **Intereses financieros** — son **DOS por mes**, no uno: el interés del capital de los socios
     (~$240.000) y otro más chico (~$30.000). Junio, julio y agosto tuvieron los dos.
   · **Obra social privada** (~$83.333, categoría "Otros gastos operativos") — **es APARTE del
     Sancor**, se cargan las dos. Se distinguen porque el Sancor lleva la palabra en la descripción.
  **Y apareció un estado nuevo que hacía falta: PARCIAL (⚠️ ámbar).** Con `min:2` en los intereses,
  cargar uno solo ya NO pinta verde: dice *"1 de 2 · falta 1"* y cuenta como faltante arriba. Un ✅
  con la mitad adentro cierra el mes sin que nadie vuelva a mirar, que es peor que un ❌.
  **Verificado contra los gastos REALES de agosto y julio antes de subir**: agosto da 7 de 8 (le
  falta la obra social privada, que es justo lo que está pendiente de confirmar) y julio 6 de 8.
  Las categorías se revisaron hasta febrero con `vergastos`: de marzo a mayo sólo hay el "Gasto
  mensual estimado" viejo, así que **no hay ninguna otra categoría real que agregar**.

- **Faltan gastos de agosto**: servicios ($150.000, en julio figura como "Claude"). El alquiler
  ($100.000), los honorarios ($100.000) y la obra social Sancor ($65.227) ya están.
- **SEPTIEMBRE 2026 · verificado con `vergastos:2026_09` el 16/09: $313.083 en 3 gastos.**
  Cargados: alquiler $100.000 (12/09) · autónomo + obra social de Ayelen $113.083 (VEP de
  septiembre, vence 09/10) · **honorarios del contador $100.000 (14/09)**, con su factura y su CAE
  adentro — él avisó el 16/09 que ya lo había pagado y **ya estaba**: cargarlo de nuevo dejaba el
  mes en $413.083 y la ganancia $100.000 abajo de lo real. *No confiar en esta lista sin correr el
  comando*, otra vez.
  **SERVICIOS: ESTE MES ES CERO**, dicho por él el 16/09 (*"servicios este mes sera 0"*). O sea que
  el ❌ que va a mostrar la lista de Gastos NO es un olvido. **El panel no sabe distinguir "falta
  cargarlo" de "este mes no va"** y no hay forma de marcárselo: queda pendiente decidir si se
  agrega, porque un renglón rojo permanente entrena a no mirar la lista — el mismo problema del
  cementerio de marcas viejas que ya apareció con `repoextra` y con la pausa por precio.
  **Faltan de verdad**: los **DOS intereses** (septiembre no tiene ninguno; en agosto fueron
  $250.000 y $30.000) · la **obra social Sancor de Ayelen** (el monto cambia todos los meses, va el
  de la factura) · la **obra social privada** (~$83.333), que es **APARTE del Sancor** — la nota
  vieja de acá las mezclaba en una sola y son dos · y los **cargos de Full de agosto**, cuando él
  baje el reporte de facturación de cada cuenta.
- **LOS VEPs DE MONOTRIBUTO DE 09/2026 CONFIRMAN QUE LAS CATEGORÍAS NO CAMBIARON.** Ayelen
  $204.811,64 (H) + autónomo $57.598,04 + obra social $55.485,33 = **$317.895,01** · Adriana
  $71.497,87 (G) · Luciana $57.719,64 (F) · Matías $57.719,64 (F). **Total $504.832,16**, el mismo
  número de siempre. O sea que **la recategorización de Luciana y Matías sigue sin hacerse** — es lo
  primero de la lista del contador. Ojo con la nota de `proyec` que habla de "las cuatro en H":
  ése es un escenario calculado, NO lo que están pagando hoy.
  Del VEP lo único que se carga como gasto es **autónomo + obra social de Ayelen ($113.083)**; el
  impuesto integrado ya se descuenta como % en cada venta.
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
- **PAULVIC: LA REGLA DE "NO TOCAR" SE SACÓ (14/09/2026).** Pedido suyo, textual: *"sacar regla
  que dice que los paulvic no se pueden tocar"*. **Estaba en el CÓDIGO, no sólo en esta nota**, y
  en dos comandos: `bajarcaja` los apartaba en una lista "Paulvic salteados" y `submargen` los
  salteaba en silencio con un `continue`. Los dos motivos que decía el comentario ya no valían: la
  regla del grupo de precio (*"bajar una arrastra a las 26"*) se desactivó el 04/09 con
  `grupos:paulvic:off`, así que cada aroma ya tiene precio propio. Sacado de los dos lados y
  verificado que no quedó ninguna referencia colgada.
  **Ojo: `calcSubirPuede` nunca los salteó**, así que los Paulvic YA venían saliendo en el aviso
  diario. Lo que cambia es que ahora también entran en los dos comandos que los apartaban.
  **Lo que NO se tocó:** el reparto de cuentas (Paulvic sigue compartido entre Adriana y Luciana,
  con la Persea en Luciana) es otra regla y sigue en pie.
  **Los números medidos, que siguen valiendo** (04/09/2026, `unapub:MLA3026299952`): 12 activas a
  $14.360, todas entre **30,8% y 39%** — cómodas contra el piso. El precio que las deja justo en
  25% es **$13.750**, o sea **$610 de aire**; para GANAR la caja de compra habría que bajar a
  **$10.696** y ahí el margen es **−4,1%**.
  **La lección, y es general: un margen que se ve grande en % puede ser chico en PESOS.** 30,8%
  sobre un perfume de $14.360 son $610 — no alcanza ni para que el comprador lo note ni para
  pelear la caja. Antes de decir "acá hay margen para bajar", mirar el número en pesos.
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

### LO QUE QUEDÓ ABIERTO EL 16/09/2026

**RESUELTO EL MISMO DÍA (16/09/2026):**
 · **PS Portal → PAPELERA**, decidido por él: *"papelera ps portal, lo voy a borrar de ml"*. O sea
   que de las tres opciones eligió la del panel, y **la publicación la borra él en ML** — el robot
   no pausa ni borra nada. Se manda con la ✕ del renglón en Pedidos (vuelve atrás durante 7 días).
 · **Los Redmi Buds son los "6 PLAY", y por eso el código no coincidía.** Él confirmó: *"buds 6
   play es correcto. me falto ponerle el play al nombre de la web de cyc"*. O sea que el `131119`
   que él pasó y los `133818`/`133821` del reporte son **productos distintos**, no un error de
   nadie: el reporte buscó "Redmi Buds 6" a secas. Cargado y releído: `131119`.
   **Falta que la ficha se llame "Xiaomi Redmi Buds 6 Play"** — si no, la próxima vez que alguien
   busque el código vuelve a buscar el modelo equivocado. Se corrige tocando el nombre en la ficha.
   **La lección: cuando el código que él pasa no coincide con el que encontró la búsqueda, lo
   primero a sospechar NO es el código: es que los dos nombres no sean el mismo producto.**
 · **CELULARES: son DOS y ya están marcados** — *"todo lo que es celular se tiene que traer con mi
   papa"*. Verificado con una corrida en seco antes de aplicar, buscando `celular`, `galaxy`,
   `moto`, `iphone`, `redmi note`, `xiaomi`, `samsung` y `telefono` en las 137 fichas: los únicos
   teléfonos del catálogo son **Samsung Galaxy A07 LTE 64GB** y **Samsung Galaxy A06 128GB Black**.
   Todo lo demás que suena a celular NO lo es: la Redmi Pad 2 es tablet, el Redmi Watch 4 / Watch
   S5 / Watch 5 Lite son relojes y los Redmi Buds 6 Play / Samsung Buds Core son auriculares.
   Marcados los dos Galaxy con `celuviaje:galaxy;go` · releído: 2 de 2.
   **Por eso la marca se puso a mano y no por palabra**: `samsung` sola agarraba los auriculares y
   `xiaomi` sola agarraba la tablet y los tres relojes. La palabra que sirve es `galaxy`, y eso se
   sabe DESPUÉS de mirar la lista, no antes.

**Esperando una decisión suya:**
 · **Tres códigos más**, todos por color o tamaño: Xiaomi Watch S5 · Samsung Galaxy A07 (ojo:
   Preto `SM-A075M` y Black `SM-A075F` son modelos distintos) · el Victoria's Secret que no dice
   qué línea es (65 opciones).
 · **LOS DOS PERFUMES DE ADRIANA: MEDIDOS EL 18/09, Y ML NO DEJA CAMBIARLES EL PRECIO.**
   Él pidió *"subir al 25%, salvo que esten hace mucho tiempo"* y después *"aumentar todas, ya que
   el costo del envio es lo mismo para todas"*. Se midió con `hermanas` y **la nota vieja de acá
   estaba desactualizada en las dos cosas**: el Kiss Sexy ya NO está a $79.999 —el robot se lo subió
   solo a **$82.460** después de una venta— y **YA VENDIÓ**, hace 1 día, así que su margen está
   medido de verdad: **22,0%**, y el 25% es **$84.780**.
   **PERO ML RECHAZA EL CAMBIO.** Tres intentos, tres veces el mismo error:
   `403 · {"code":"PA_UNAUTHORIZED_RESULT_FROM_POLICIES","blocked_by":"PolicyAgent"}`.
   No es un error del robot ni del número: es el motor de políticas de ML. Encaja con lo que ya está
   abierto —el "Bare Vanilla" y el reclamo de "adulterado", donde ML pide documentación de esas
   marcas—, pero **no está confirmado**: el precio del Kiss Sexy SÍ cambió después del 16/09, así
   que el bloqueo es nuevo o es por publicación.
   **Lo que falta y lo tiene que hacer él: cambiarle el precio a UNA a mano en ML.** Si lo deja, el
   bloqueo es sólo para la aplicación; si no lo deja, es la restricción de marca y no se destraba
   hasta que ML acepte los papeles.
   **Los números quedan calculados para cuando se destrabe** (piso 25%, medidos con ventas reales):

   | publicación | hoy | al 25% | sin vender |
   |---|---|---|---|
   | Kiss Sexy `MLA3928198284` | $82.460 | **$84.780** | 1 d |
   | VS `MLA3374364116` (está al **15,8%**) | $52.440 | **$57.160** | 3 d |
   | VS `MLA3928248200` | $45.000 | **$46.500** | 0 d |
   | VS `MLA1771209909` | $51.570 | **$55.350** | **53 d** |
   | VS `MLA3546661648` | $49.000 | **$49.850** | **46 d** |

   **El Love Spell (`MLA3928173150`) NO tiene margen medido: nunca vendió** y está arriba de los
   $33.000, que es justo donde el envío pesa. Su ficha hermana de costo idéntico ($21.490) mide
   **25,8% a $46.430**, que es la única referencia real que hay.
   **Y hay tres Kiss Sexy, no una** (`MLA2070620477` a $99.600 y `MLA3928173584` a $79.999, las dos
   sin vender nunca y sin margen medido). Ésas se miran por visitas, no por precio.

**RESUELTO EL 17/09/2026 · "NISSEI NO LO TIENE" ES UN ESTADO QUE SE CORRIGE SOLO.** Pedido suyo:
*"que aparezca cuando no esta en stock o no lo encuentra y que cuando si lo encuentre que vuelva a
marcar que si esta en stock"*. Antes la marca se borraba al "Empezar una canasta nueva" y los que
Nissei no vende volvían al reparto en cada vuelta. Ahora **dura hasta que vuelva a haber stock** y
**se cae sola** en cuanto alguien carga un precio de Paraguay para ese producto: si hay precio, lo
encontró; si lo encontró, lo tiene. Nadie tiene que acordarse de destildar nada — una marca que se
saca a mano es la que se queda vieja y termina escondiendo mercadería que sí se puede comprar.
**Cuatro productos que Nissei NO vende** y que hay que dejar marcados: Cabotine 30ml (sólo hay de
100ML, `91832`) · Animale Mujer EDP (sólo el "Animale Love", `103997`, que es otro perfume) ·
Azzaro Pour Homme 200ml (sólo 100ML, `97699`) · **SanDisk Ultra 128gb CON adaptador** (Nissei sólo
tiene la versión sin adaptador, a US$19 — **es otro producto y su precio no se carga acá**).

### EL EMBUDO DE PARAGUAY (17/09/2026)

Pedido suyo: *"que haga embudo en pedidos paraguay"*. Pedidos → 🇵🇾 Paraguay tiene ahora las cuatro
decisiones en una pantalla y **en el orden en que se toman**:
 1. **🛒 la canasta** — lo que estás comprando, con los US$1.000 repartidos
 2. **📋 los pedidos** — lo que falta, con costo, margen, código y precio de Paraguay
 3. **🔻 ya no conviene comprarlos** — los que YA vendés y que al precio de Paraguay de hoy quedan
    abajo del 25%. Muestra los dos márgenes al lado (*"tenés 23% · reponer −16%"*) y el único botón
    es "no lo compro por ahora". **No toca ningún precio de venta.**
 4. **🆕 para probar** — los que todavía no vendés

**El punto 3 lo hace el PANEL solo, sin el robot**, y se puede porque para un producto que ya vendés
el panel ya sabe lo que ML deposita hoy (`netoCalc`, que el robot recalcula todas las noches): lo
único que faltaba era el precio de Paraguay. Llama a `margenMLDe`, no calcula nada nuevo.
Probado con seis productos inventados: sale sólo el que subió, y quedan afuera el que sigue barato,
el que no tiene precio cargado, el que Nissei no tiene, el ya pausado y el de Bs As.

**ARREGLADO EL 16/09/2026: `activarPausadasFull` YA AVISA — PERO SÓLO DE LO QUE **NO** ACTIVÓ.**

**LO QUE SE ACTIVA NO SE AVISA, decisión suya del mismo día**, textual: *"no quiero que mande al
telegram, solo que revise si el producto que esta con stock en full (que siempre son productos que
acaban de llegar a full) tienen minimo el 25% de ganancia. si esta por abajo de eso que no las
active y ahi si avise por telegram"*. Y tiene razón: **activar algo que llega al piso es lo que el
robot TIENE que hacer, no una noticia.** Un aviso que llega cuando todo salió bien entrena a no
abrirlos — el mismo motivo por el que el aviso diario no manda nada cuando no hay nada nuevo.
Lo activado sigue yendo al LOG, renglón por renglón, que es donde se mira cuando se quiere mirar.
**La primera versión mandaba las dos cosas y estaba de más.**

Lo que sí se arregló, y eran **dos** cosas:
 · **Los mensajes no salían nunca.** Iban con `sendTelegram(a)` **sin declarar el tipo**, y
   `TG_PERMITIDO` descarta por omisión: se tiraban ANTES de intentar mandarlos, en una línea del
   log. O sea que el robot venía activando publicaciones solo y no avisó ni una vez. Es el bug del
   aviso del dólar (27/08) y el de las subas automáticas (15/09), por tercera vez. Ahora van por
   **`sendAlerta`**, al canal privado de precios.
 · **Y el mensaje se comía la mitad de los casos.** La lista filtraba por `x.precio`, así que sólo
   salían las descartadas **por margen** — y las que fallan antes de tener precio quedaban fuera de
   todo, incluida la que deja una publicación pausada PARA SIEMPRE: **"nunca vendió: no hay con qué
   medir el margen"**. Es el círculo de la Lupa 75mm: no se activa porque no vendió, y no vende
   porque está pausada. **El freno está BIEN** (sin ventas no se puede deducir el descuento de ML y
   activarla sería a ciegas); lo que estaba mal es que se callara. Ahora TODO motivo lleva stock,
   precio y por qué, y el mensaje va en **dos bloques**, porque el remedio es distinto: las de
   margen se arreglan **subiendo el precio**, las otras las tiene que mirar él de a una.
 · **Y no repite cada hora** (`cyc/avisopausadas/<MLA>`, 7 días). Esto corre una vez por hora: sin
   memoria serían 24 mensajes por día con los mismos renglones. Se vuelve a avisar antes si CAMBIA
   el motivo, y **se anota sólo si el mensaje salió**, igual que el aviso diario. Si la memoria no
   se puede leer no se filtra nada: repetir molesta, callarse deja stock pagando almacenamiento.
 · **Y EL CERO VIENE EXPLICADO.** La corrida de ese día imprimió *"0 activadas · 0 no"*, que se lee
   como buena noticia y puede ser un filtro comiéndose todo en silencio — lo que ya mordió con
   `liquidar` (0 de 137), con el marcado de cajas y con el *"PARADO: 0"* del aviso diario. Ahora el
   renglón dice de dónde sale: cuántas se miraron, cuántas quedaron afuera por no haber vendido
   nunca (`altaSinVender`), cuántas ya están activas, cuántas las pausó ML, cuántas no son de Full
   y cuántas no tienen stock adentro.
 · **EL ARREGLO DEL 16/09 QUEDÓ A MEDIAS Y ÉL LO AGARRÓ AL DÍA SIGUIENTE (17/09/2026).** Mandó la
   captura de Full con **dos P47 Cat Ear de Ayelen** (`MLA3869746828` Celeste y `MLA3869720850`
   Azul, $9.660, **2 u. aptas para vender cada uno**), pausados: *"porque no se activaron ni
   aviso?"*. La frase de arriba —*"ahora TODO motivo lleva stock, precio y por qué"*— **era falsa**:
   sólo avisaban los motivos que se resuelven DESPUÉS de mirar el precio. Los otros **cinco
   seguían saliendo callados**, y son justo los que dejan una publicación pausada PARA SIEMPRE con
   mercadería adentro pagando almacenamiento: *sin ficha* · *marcada `nomas`* · *`altaSinVender`* ·
   *frenada a mano* · *la pausó ML*. Tres de ésos ni siquiera se contaban.
   **La causa era el ORDEN**: los frenos se aplicaban en el filtro, ANTES de preguntarle a ML si la
   publicación estaba pausada y con stock. O sea que se descartaba a ciegas — no se puede saber si
   hay mercadería esperando sin preguntar. Ahora el filtro sólo separa por cuenta y **todos los
   frenos se aplican después de saber que está pausada, es de Full y tiene stock adentro**.
   **La regla queda dura y el código la chequea solo:** `activadas + avisadas === pausadas con
   stock`. Si no cierra, la corrida imprime **"⚠️ NO CIERRA · hay N saliendo en silencio"** — es el
   `continue` callado de siempre, y ahora se delata solo en vez de esperar a que él mande una foto.
   Lo único que sigue saliendo sin avisar es lo que no tiene nada adentro (activa · no es Full ·
   sin stock), que es como tiene que ser: ahí no hay nada esperando.
   Probado con la cadena REAL sacada del archivo y 8 casos, uno por freno: los 6 que tienen que
   avisar avisan, `out_of_stock` no cuenta como pausa de ML, y la sana sigue al chequeo del margen.
   **LA LECCIÓN, por segunda vez en dos días: un freno puesto ANTES de tener el dato es un descarte
   a ciegas.** Y la otra: cuando arreglás un descarte silencioso, contá cuántas salidas tiene la
   función — yo tapé cuatro de nueve y escribí que las había tapado todas.
 · **Ojo al tocarlo:** la función ahora devuelve `{ avisos, anotar }`, no un arreglo.
 **Probado con el bloque REAL sacado del archivo** (no una copia, que diría "todo bien" para
 siempre) y siete casos: primera vuelta · una hora después sin cambios (**activa y NO manda nada**)
 · motivo distinto (vuelve) · 8 días (vuelve) · memoria ilegible (manda todo) · modo prueba (avisa
 y no anota) · todo en cero (el cero explicado).

**Pendiente de arreglar, medido hoy:**
 · **El chequeo automático de "este renglón no tiene sentido"** en Pedidos. Se ofreció tres veces
   hoy y no se hizo. La idea: un producto no puede destrabar más por mes que lo que deja lo que
   vende, y algo con stock que no vende hace 55 días no puede estar en la lista de comprar. Hoy eso
   lo agarra él mirando; el panel lo puede agarrar solo.
 · **`revisarpedidos` CORRIDO el 17/09/2026, y el resultado cambia el chequeo automático.** No
   quedan casos como el Watch S5: **0 pedidos cargados a mano de 54** (el panel los arma y los borra
   solo) y **0 claves de inventario con problema de 529** — las 13 basura del 24/08 ya no están, y
   ningún producto pierde stock con el arreglo de `stockOf`.
   Lo que sí apareció son **dos cosas mal en el propio comando**, las dos arregladas el mismo día:
    · **El chequeo de stock se había apagado solo, en silencio.** Leía la nota del pedido con
      `/N en stock/` y la nota cambió el 14/09 a *"📦 N en ML"*: `stockGuardado` daba **null en los
      54**, así que de los dos chequeos sólo quedaba vivo el de la cantidad y los 41 renglones
      imprimían *"dice: null en stock"*. Ahora acepta las dos formas. Es el patrón de siempre —
      **el dato no se pierde con ruido**.
    · **Y el 🔴 "NO HAY QUE COMPRAR NADA" estaba invitando a sacar de la lista justo lo que falta
      reponer.** De los 25 que daban comprar 0, **21 tenían 0 en Full, 0 en casa y 0 ventas**: no
      vendieron porque no había qué vender. La cuenta divide por los días con stock, así que un
      producto agotado los 30 días da `vDia` = 0 y `hoyComprar` = 0 — **eso no es "no comprarlo", es
      "no se puede medir"**. Son las ~100 publicaciones sin stock que ya están anotadas al final de
      este archivo. Ahora salen aparte con **⚪ AGOTADO** y el resumen los cuenta en su propio
      renglón. Los que SÍ sobran de verdad son **4**: Paulvic (249 en Full + 134 en casa), Sábanas
      105x190, p47 oreja gato y Funda Cubre Colchón twin.
   **La lección para el chequeo automático de "este renglón no tiene sentido" que sigue pendiente:
   "la cuenta da comprar 0" NO alcanza para sacar un renglón.** Hay que mirar antes si hay stock en
   algún lado; si no lo hay, el 0 es falta de dato, no una conclusión.

### Lo grande, que no se arregla con precios

**~100 publicaciones sin stock que dejan de vender ~$500.000 por día**, y cero cajas entrando a
Full desde el 01/08. Todo lo que se puede ganar subiendo precios son ~$34.000/mes: reponer un solo
día vale más que eso. Él ya está reponiendo — no hace falta insistirle, pero sí medirlo.
