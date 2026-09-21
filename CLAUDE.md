
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
| `repetidas[:días]` | **lo que sobra VIVO en ML**: el mismo producto publicado en más de una cuenta, con los MLA, su estado y el stock de Full · marca aparte las que tienen mercadería adentro · solo lee |
| `compray[:...]` | **cada compra a Paraguay con sus costos reales** · mide el recargo de verdad y lo abre en parte que escala y parte fija · sin `\|go` sólo muestra |
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
| `pedir:<palabra>=<u>[;otra=<u>][;go]` | **carga las unidades del pedido de Paraguay** · `=0` lo saca · sin `;go` sólo muestra |
| `revisarcompra[:<palabras>]` | **la última mirada antes de gastar los dólares**: código, precio, ¿es el mismo producto?, margen de HOY y si la podés publicar · solo lee |
| `probarcaja:<MLA>[;otro]` | **¿ML dice quién tiene la caja de un catálogo?** vale el código del catálogo o el de una publicación tuya · solo lee |
| `permisos` | **por qué ML no deja escribir**: qué le deja hacer a la aplicación, traducido · solo lee |
| `probarsaldo2` | **¿se puede leer el saldo de la cuenta?** 11 endpoints que `probarsaldo` no probaba · solo lee |
| `saldo3` | **agotar el saldo**: 14 puertas · baja el reporte de liquidación y muestra sus columnas · solo lee |
| `versaldo[:cuenta]` | **cómo viene el reporte de liquidación**: filas, tipos de movimiento, si trae los retiros · **no imprime ni un peso** · solo lee |
| `armarsaldo[:días][:go]` | **prepara el reporte del saldo**: prende los retiros y lo pide · escribe en Mercado Pago, por eso pide `:go` · no mueve un peso |
| `probarrep` | **por qué Mercado Pago no deja pedir el reporte**: 7 formas en una sola corrida · solo lee |
| `saldoml[:go]` | **lo que falta cobrar de ML, por cuenta** · escribe "A liquidar en ML" del Arqueo **en dólares** · no imprime ni un peso |
| `dispo[:go]` | **el disponible de ML** a partir del número que él carga · sin `:go` sólo muestra |
| `medirsaldo` | **cómo viene cada tipo de movimiento** del reporte: fechas y signos · solo lee |
| `realml[:cuenta]` | **¿el panel mide bien lo que ML descuenta?** lo real contra lo calculado, **venta por venta** · solo lee |
| `saldocuenta` | **el reporte "saldo en cuenta"**, que trae el disponible de verdad · dice si falta crearlo · solo lee |
| `extracto` | **¿se puede pedir por robot el extracto de cuenta?** (medido: NO, 32 puertas) · solo lee |
| `columnas` | **¿quedaron las 7 columnas nuevas del reporte?** cuenta por cuenta · avisa si hay datos del comprador · solo lee |
| `mptoken` | **¿la llave propia de Mercado Pago abre algo que la de ML no?** (medido: no) · solo lee |
| `saldo4` · `saldo5` | **agotar el saldo**: 13 puertas más y las tres formas de pedir el reporte de liberaciones |
| `diario[:go]` | **dejar el reporte generándose solo todos los días** · MP lo ignora: se hace desde su panel |
| `armarcuenta[:go]` | **crear el reporte "saldo en cuenta"** · hoy no se puede por API, queda para cuando él lo cree |
| `saldobill` | **¿se abrió el saldo directo de ML?** de a una y espaciado, para que el 429 no ensucie · solo lee |
| `clavesmalas` | **nombres de variante que Firebase no puede guardar** (rompen "Cargar lo sugerido") · solo lee |
| `cupofull` | **¿la API dice cuántas unidades se pueden mandar a Full?** (medido: NO, 14 puertas × 4 cuentas) · solo lee |
| `cupo[:<cuenta>=<chicos>/<grandes>[;otra][;go]]` | **el cupo de Full que te queda, por cuenta** · lo leés vos en ML y se carga acá · sin argumentos muestra lo cargado y qué productos cuentan como "grandes" |
| `envio3[:cuenta][:cuántas]` | **¿cuál es el envío real?** lo que dice ML contra lo que Mercado Pago te descontó · solo lee |
| `entregas[:días][:go]` | **cuándo llegó cada venta y cuáles volvieron** · y cuánto tarda en llegar |
| `apidoc:<direccion>` | **las direcciones de API que aparecen en una página de documentación** · sólo las rutas, no el texto entero · solo lee |
| `verweb:<direccion>` | **leer una página de afuera y mostrar su texto** · el chat no tiene internet y el robot sí · solo lee · **lo que imprime queda en el registro PÚBLICO** |
| `verwebs:<d1>;<d2>;…` | **varias páginas en UNA corrida**: dice si la puerta abre y si hay precios adentro, sin volcar el texto entero · solo lee |
| `campos[:<MLA>]` | **qué datos manda ML adentro de las puertas que YA usamos** y el código nunca nombra · sólo nombres, ningún valor · solo lee |
| `guardadosinver` | **el espejo de `campos`: lo que YA está en la base y la pantalla no dibuja** · sólo nombres, ningún valor · solo lee |
| `pesopedido` | **cuánto pesa el pedido de Paraguay cargado** · el correo se cobra por peso · solo lee |
| `reputa` | la reputación de las 4 cuentas y el nombre de los rubros · **escribe** `cyc/reputacion` |
| `mismoprod[:cuenta]` | **¿ML dice solo cuáles publicaciones son el mismo producto?** y si da la foto · solo lee |
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

**ESTE RENGLÓN DECÍA "~58 publicaciones repetidas siguen VIVAS en ML" Y NO ERA CIERTO.** Se midió
el 21/09/2026 con `repetidas:90`: son **60** y **59 ya están pausadas o dadas de baja**. Sólo UNA
sigue activa (el Cortapelo 4 en 1 de Ayelen). El número nunca se había medido — era un cálculo a
ojo, y el trabajo ya estaba casi todo hecho sin que nadie lo anotara.
`nomandar` saca a la cuenta del reparto y de "Contar lo que hay", **no borra ni pausa la
publicación**: eso sigue siendo cierto. La lista con dueña y copias está más abajo.
Pausar TOCA ML de verdad: no se hace sin que él lo pida expreso.

**Un caso raro que quedó abierto: el P47 está marcado afuera de las TRES cuentas**, incluida Matías,
que es la que lo vende (51 u. en 90 días). Viene de cuando el 07/09 pidió pasarlos todos a Ayelen.
Si eso sigue en pie está bien, pero hoy nadie le puede mandar mercadería.

## UN PRODUCTO NO PUEDE ESTAR PUBLICADO EN MÁS DE UNA CUENTA (21/09/2026)

Norma suya: *"quiero que no haya publicaciones del mismo producto en mas de una cuenta. despues
no me molesta que se repitan en la misma cuenta."*

**Es la continuación de la norma del 09/09, no otra cosa** — y la diferencia es dónde se aplica.
`repartir` decide quién es la dueña **en el PANEL** (a qué cuenta se le manda mercadería) y eso ya
está terminado desde el 10/09: su sección "para aplicar" sale vacía. Lo que quedó sin hacer es lo
de ML: **`nomandar` saca del reparto, no pausa ni borra**, así que en ML el producto seguía siendo
publicación compartida.

El comando es **`repetidas[:<días>]`** y **SOLO LEE**: no pausa, no borra y no toca ML. La dueña la
decide **`calcDuenaCuenta`**, la MISMA función que usa `repartir` — salió del probe justamente para
esto: con dos copias los dos comandos podían nombrar dueñas distintas del mismo producto.

### LA PRIMERA CORRIDA (21/09/2026): 38 PRODUCTOS, Y CASI NO HAY NADA QUE HACER

**30 con dueña clara · 60 publicaciones de más · y 59 de esas 60 YA ESTÁN pausadas o inactivas.**
O sea que el trabajo grande ya estaba hecho sin que nadie lo anotara: lo que quedó vivo es una sola
publicación. Adriana 40 · Matías 8 · Luciana 7 · Ayelen 5.

**LA ÚNICA ACTIVA ES EL CASO QUE HAY QUE DECIDIR, Y LA REGLA SE EQUIVOCA SOLA.** El
**Cortapelo 4 en 1** de **Ayelen** (`MLA1474502515`) está **activa, con 5 u. adentro de Full y
GANANDO la caja de compra** — y la dueña por la regla es **Matías**, que vendió hace 89 días y
tiene 1 unidad. Aplicar la norma al pie de la letra sería pausar la única que puede vender, dejando
5 unidades pagando almacenamiento. **La regla dice quién vendió más reciente, no quién está en
mejores condiciones de vender hoy**, y acá las dos cosas no coinciden.

**Y LA EXCEPCIÓN PAULVIC SIGUE EN PIE, PORQUE EL COMANDO NO DECIDE CUANDO NO PUEDE.** Adriana
(51 publicaciones, 217 u. en Full) y Luciana (2, 15 u.) **vendieron las dos el MISMO día**, así que
cae en "para que decidas vos" y no propone nada — que es exactamente lo que corresponde: esa
excepción la puso él el 10/09 y una norma nueva no la borra sola.

**Los otros 7 a decidir** son Kit Luces Bici, Tira Led, Termómetro horno, balanza equipaje,
Estimulador Muscular, Indoor y De la Patagonia KO UNISEX: ninguna cuenta vendió en 90 días, o
vendieron dos la misma semana.

**LO QUE EL COMANDO MARCA APARTE Y NO ES UN DETALLE DE FORMA: las repetidas CON STOCK EN FULL.**
Pausar una de ésas deja la mercadería adentro sin vender, pagando almacenamiento y con el reloj del
descarte corriendo. Hoy es una sola (las 5 u. del Cortapelo), pero es la primera que hay que mirar
y por eso va en su propia lista al final.

### LA LISTA GUARDADA: DUEÑA Y COPIAS A BORRAR (21/09/2026)

Pedido suyo: *"guardate la lista que te la voy a pedir y pone en que cuenta es la dueña y en que
cuenta es la 'copia' a borrar"*. **Queda acá para no tener que volver a correr el comando** — y si
pasa el tiempo conviene rehacerla con `repetidas:90`, porque la dueña se mueve con las ventas.

**Casi todo ya está pausado: de las 60 copias, 59 están `paused` o `inactive` y sólo UNA está
activa** (la marcada ⚠️). O sea que el trabajo grande ya estaba hecho.

| # | producto | DUEÑA | COPIAS a borrar |
|---|---|---|---|
| 1 | Filtro agua | **Matías** | Adriana `MLA3128219416` |
| 2 | metatarso | **Ayelen** | Adriana `MLA1729580691` |
| 3 | Termómetro pincha | **Ayelen** | Adriana `MLA3127876638` |
| 4 | Batidora | **Luciana** | Adriana `MLA3127992752` `MLA3127992918` · Ayelen `MLA2031302632` |
| 5 | P47 | **Matías** | Adriana `MLA1729618067` `MLA1729628225` `MLA1729663575` `MLA3128216770` · Luciana `MLA1892750708` |
| 6 | Adaptador universal | **Matías** | Adriana `MLA3128214374` · Ayelen `MLA1471727091` |
| 7 | Joystick x3 | **Ayelen** | Adriana `MLA3127876822` |
| 8 | Pendrive Cruzer Blade 64gb | **Matías** | Adriana `MLA3132423648` |
| 9 | Infusor de té cajita | **Matías** | Adriana `MLA3128238720` |
| 10 | Cartas Casino | **Luciana** | Adriana `MLA1729501999` |
| 11 | Pack X5 Cubreasiento de inodoro | **Luciana** | Adriana `MLA1729482317` |
| 12 | Piedra Pómez X6 | **Ayelen** | Adriana `MLA1729659935` |
| 13 | Timer | **Ayelen** | Adriana `MLA1729614209` `MLA3380724592` |
| 14 | Kit Limpia | **Ayelen** | Adriana `MLA3128004284` |
| 15 | Balanza Cocina | **Ayelen** | Adriana `MLA3127991910` · Matías `MLA1708104767` `MLA2900475258` |
| 16 | p47 oreja gato | **Ayelen** | Matías `MLA1455432525` `MLA1709796225` `MLA3070709576` `MLA3572658428` · **⚠️ Matías vendió 10 contra 4 de Ayelen** |
| 17 | Termómetro Cable | **Luciana** | Adriana `MLA3127911548` |
| 18 | Luz Bicicleta la de siempre | **Ayelen** | Adriana `MLA1729519493` |
| 19 | F9 | **Matías** | Luciana `MLA2856310650` `MLA3278287038` · Adriana `MLA3132423886` · **⚠️ Luciana vendió 19 contra 7 de Matías** |
| 20 | Juguete Gato Bola | **Ayelen** | Adriana `MLA1729579287` `MLA3127994848` |
| 21 | Pezoneras | **Ayelen** | Matías `MLA1478541491` (ya dada de baja) |
| 22 | Luz Led Delantera nueva | **Ayelen** | Adriana `MLA1729509605` |
| 23 | Luz led Bicicleta 918 individual | **Ayelen** | Adriana `MLA1729521573` `MLA3127619910` |
| 24 | CortaPelo 2 En 1 | **Ayelen** | Adriana `MLA1729525145` · Matías `MLA1751077020` |
| 25 | 2 Separadores Protector de Dedos | **Ayelen** | Adriana `MLA1729573459` `MLA1729581457` `MLA3127916876` |
| 26 | Cortapelo 1 en 1 | **Ayelen** | Adriana `MLA3127623938` |
| 27 | Pizarra Mágica Multicolor 8.5 | **Luciana** | Adriana `MLA1729481979` `MLA1729481981` `MLA1729481983` `MLA1729481985` `MLA3127615928` · Ayelen `MLA2819223720` `MLA2843976154` |
| 28 | Linterna Minera barata | **Ayelen** | Luciana `MLA3426093884` |
| 29 | Xiaomi Redmi Pad 2 | **Matías** | Luciana `MLA1782601577` |
| 30 | Cortapelo 4 en 1 | **Matías** | Adriana `MLA1729511183` `MLA1729524451` · Luciana `MLA1377920253` `MLA1452471312` · **Ayelen `MLA1474502515` ⚠️ ACTIVA, 5 u. en Full, GANA la caja** |

**DOS RENGLONES DONDE LA REGLA PUEDE ESTAR EQUIVOCÁNDOSE, y por eso van marcados:**
 · **el 30 (Cortapelo 4 en 1)** — la dueña por la regla es Matías, que vendió hace 89 días y tiene
   1 unidad, y la copia de Ayelen está **activa, con 5 u. y ganando la caja**. Aplicarlo al pie de
   la letra sería apagar la única que puede vender.
 · **los 16 y 19** — la copia vendió el DOBLE o más que la dueña y se cortó. Puede ser falta de
   stock, no que el producto se haya mudado de cuenta.
**La regla dice quién vendió más reciente, no quién está en mejores condiciones de vender hoy.**

**LOS 8 QUE NO SE DECIDEN SOLOS** (o ninguna vendió en 90 días, o dos vendieron la misma semana):
**Paulvic** (Adriana 51 publicaciones / 217 u. · Luciana 2 / 15 u. — **excepción suya del 10/09,
queda compartido**) · **Kit Luces Bici 2218** (Adriana `MLA1729506823` · Ayelen `MLA1539342257`) ·
**Tira Led** (Adriana `MLA1729432599` · Luciana `MLA1977323590` `MLA3903897892` con 10 u. · Ayelen
`MLA1471679657` · Matías `MLA1956328566`) · **Termómetro horno** (Adriana `MLA1729569547` · Ayelen
`MLA2012564400`) · **balanza equipaje** (Ayelen 5 publicaciones · Adriana 3) · **Estimulador
Muscular** (Adriana `MLA3128212002` · Ayelen `MLA2209052420` `MLA2681075136`) · **Indoor** (Adriana
`MLA3128218754` · Matías `MLA899532398`) · **De la Patagonia KO UNISEX** (Adriana `MLA3082882284`
con 4 u. · Luciana `MLA3013798466`).

## EL PEDIDO YA HECHO: "EN CAMINO", Y LA COMPRA DEL 21/09 MEDIDA ENTERA (21/09/2026)

Pedido suyo: *"ya esta hecho el pedido de los productos de paraguay que en este momento estan en la
lista. podes ponerlo en otro lado? que diga en camino y que al clickearla me muestre como fue ese
pedido, los productos, costos totales, gastos. dias de compras y llegada, pesos aprox. TODO"*.

En Armar el pedido hay un botón **✅ Ya lo pedí**: congela lo cargado y lo pasa a **🚚 Pedidos en
camino**, arriba del armado. Cada uno se abre y muestra la plata, los días (incluido cuándo
llegaría, **5 días HÁBILES**, y dice "aprox" porque no sabemos los feriados), el peso, los gastos
reales y producto por producto con sus dos links.

**VIVE EN `cyc/compraspy/<id>`, QUE ES DONDE YA ESCRIBE `compray`**, a propósito: es la MISMA
compra. El panel guarda el detalle —lo único que el robot no puede reconstruir— y `compray` le
agrega los pesos. **El dólar se congela al día del pedido**: con el de hoy, un pedido de la semana
pasada cambiaría de precio solo.

**Y EL CANDIDATO QUEDA MARCADO `pedidoEn`**, que no es un detalle: sin eso el botón 🪄 Llenar hasta
el tope volvía a cargar lo que YA está viajando y se compraba dos veces. A mano se sigue pudiendo.

### EL `set` QUE PISABA EL DETALLE, Y LOS DOS INTENTOS QUE ME SALIERON MAL

**PERDÍ 4 DE LOS 12 PRODUCTOS EN LA PRIMERA CORRIDA REAL.** `compray` armaba `items` con los
candidatos que tuvieran `pedirU > 0`; al apretar "Ya lo pedí" el panel los deja en CERO, así que
cargar los pesos reales después traía sólo los pocos que él hubiera vuelto a cargar **y los escribía
encima del detalle bueno**. Guardó 8 donde había 12.

**Mi primer arreglo tapaba sólo la lista VACÍA y no alcanzó**: con 8 de 12 pasaba igual. **Una lista
más corta no es una corrección, es una pérdida.**
**Y el segundo intento era peor**: sacaba las unidades de `c.pedidoU`, un campo **que no existe** —
habría escrito los 12 renglones con 0 unidades. *Antes de leer un campo, mirar que exista.*
**Cómo quedó: si el pedido ya tiene detalle, NO se toca.** `compray` sólo le agrega los pesos. Las
unidades viven ÚNICAMENTE en ese detalle, así que volver a armarlo nunca puede mejorarlo.

### LA COMPRA DEL 21/09, MEDIDA CONTRA LA FACTURA DEL MAYORISTA

Él mandó la factura y ahí cerró todo: **12 productos · 23 unidades · US$ 469,40**.

| | |
|---|---|
| mercadería | US$ 469,40 · **$760.343** (dólar comprado a $1.620) |
| el que retira y despacha | **$74.260** |
| diferencia de la transferencia | $10.367 |
| correo | **falta** |
| **recargo real hasta acá** | **17,3%** · con los $25.000 del correo daría **20,7%** |

**EL NÚMERO QUE LE HABÍA DADO A LA MAÑANA (19,4%) ESTABA CORTO, y la causa vale como regla.** Yo
había sacado la mercadería de lo que se *transfirió* (475,80 USDt menos ~1 del cambista = 474,80) y
la factura dice **469,40**. **Lo que se mandó no es lo que se compró**: entre las dos cosas hay
US$ 6,40 que no son mercadería. Con la base más chica el recargo sube. *Cuando hay dos números para
la misma cosa, el que manda es el del comprobante, no el deducido de un pago.*

**`retira=` es un campo propio y no "otros"**, porque es el gasto FIJO más grande del pedido —
$74.260 sobre US$ 469,40 son **11,7 puntos** del recargo — y un renglón que dice "otros" no se mira.
**El correo sin cargar dice "falta", nunca $0**, y el renglón avisa que con eso el recargo está
CORTO: un cero ahí se lee como "no costó nada".

**LOS PRECIOS DEL PANEL NO SON LOS QUE SE PAGAN.** El panel guarda los de la **lista de Nissei** y
la factura trae otros: el Corsair figuraba a US$ 29,90 y salió **28,00**, el Sennheiser 45,00 →
**43,00**, el Sony ZX310 17,50 → **17,00**. Por eso `compray` acepta
**`det=<cod>*<unidades>*<precio>;…`**, que reescribe el detalle con lo que de verdad se pagó. El
nombre y los links NO se pasan: se buscan por el código.

**Y APARECIÓ ALGO PARA MIRAR: A LOS CÓDIGOS QUE GUARDA EL CHAT LES FALTA EL PRIMER DÍGITO.** La
factura dice `7128673` y el panel tiene `128673`; `8104067`→`104067`; `8152721`→`152721`;
`7151150`→`151150`; `720139`→`20139`. **Cinco de cinco.** No son dos sistemas de códigos distintos
—eso sería el caso del Cabotine, donde cambia el número entero—: es un dígito que se pierde. Si
alguna vez arma el pedido copiando del panel, esos códigos están mal. Por eso `det=` compara el
código **también por el final**. **Falta decírselo al chat de compras.**

### LA MISMA ADVERTENCIA SALÍA DOS VECES EN LA PANTALLA

Él lo planteó como *"hay mucha info en pantalla y no se entiende nada, no me doy cuenta dónde está
el error"*. **Había un error concreto**: el renglón rojo de la caja de compra (`CAND_NOTA_CAJA`,
cuatro líneas) estaba impreso en el encabezado de "Para probar" **y otra vez adentro de "Armar el
pedido"**, a 20 líneas de distancia — se lee como dos avisos distintos y no lo son. Queda UNA, y la
explicación larga de la sección pasó a un desplegable.
**Lo que sigue apretado y él todavía no decidió:** cada renglón de producto tira seis datos en una
sola línea gris del mismo tamaño, y el margen —que es lo que decide— queda en el medio.

### EL HISTORIAL POR PRODUCTO: EL RECARGO **NO ES PAREJO** (21/09/2026)

Pedido suyo: *"que se vaya haciendo un historial y cuando sale mas % en que compra y producto por
tamaño, peso unidades, costo. todo asi sabemos mejor que comprar"*. Sale con **`compray`** sin
argumentos, abajo del historial por compra.

**LA PREGUNTA QUE CONTESTA NO ES LA QUE PARECE.** La mayor parte del recargo es un gasto **FIJO del
pedido** (el que retira y despacha, y el correo). Repartido entre las unidades pesa **lo mismo** en
un auricular de US$ 5,75 que en una memoria de US$ 62 — o sea que **en porcentaje el barato paga
muchísimo más**. Medido sobre la compra del 21/09, con el correo todavía pendiente:

| recargo real | US$ c/u | puesto | producto |
|---|---|---|---|
| **47,2%** | 5,75 | $12.993 | Sony MDR-EX15LP |
| 34,8% | 8,20 | $16.962 | TP-Link TL-WN822N |
| 33,7% | 8,50 | $17.448 | Sony MDR-EX15AP |
| 23,3% | 13,50 | $25.547 | Lattafa Sutoor |
| 19,6% | 17,00 | $31.216 | Sony MDR-ZX310AP |
| 12,8% | 32,75 | $56.729 | Mercedes Club Black |
| **9,4%** | 62,00 | $104.108 | microSD Pokémon |

**EL PANEL LE SUMA 15% A TODOS POR IGUAL, y eso está mal para los dos lados: en lo BARATO el margen
que muestra está INFLADO y en lo CARO está CASTIGADO.** Con el correo cargado los baratos empeoran
más todavía ($3.679 → $4.766 de fijo por unidad). **Es lo que cambia qué conviene traer de
Paraguay: lo barato no conviene, y no porque deje poco margen sino porque el flete se lo come.**

**EL REPARTO ES POR UNIDAD Y ES UNA APROXIMACIÓN, Y SE DICE EN PANTALLA.** El correo cobra por
**PESO**, así que lo correcto sería repartir por kilo — y los candidatos casi no tienen el peso
cargado (**0 de 12** en esta compra). **No se inventa ningún peso**: se imprime cuántos hay. Para
que esto se pueda hacer bien, el chat de compras tiene que cargar el peso de cada candidato.

**DOS BUGS QUE APARECIERON ARMÁNDOLO, los dos para el lado peligroso:**
 · el historial **no sumaba `retira`**, así que daba el recargo CORTO justo por el gasto fijo más
   grande ($74.260 de $84.627). Un recargo que sale menor dice que comprar es más barato de lo que
   es.
 · había un `return` cuando no hay ninguna compra **COMPLETA**, y con eso el historial por producto
   **no iba a correr NUNCA mientras faltara el correo** — que es el estado normal de una compra
   recién hecha. Ahora avisa que el número está corto y sigue.

**Y EL ERROR QUE CASI COMETO, que es el del `MIN_GROSS` del mismo día:** iba a leer `RECARGO_PY`,
que existe **adentro de otro bloque** (el probe `guay`). Compila perfecto y muere en ejecución
llevándose la corrida entera. *Antes de usar un nombre en `sync.mjs`, mirar si está definido EN ESE
bloque.*

## CADA COMPRA A PARAGUAY, CON SUS COSTOS REALES: `compray` (21/09/2026)

Pedido suyo: *"cuando me lo envien quiero que vayas guardando todos los pedidos con costos de cada
cosa. asi sabemos mejor que % ponerle al precio que aparece en la web de compraparaguai"*.

**EL 15% NUNCA SE MIDIÓ.** `RECARGO_PY` sale de una frase suya —*"mercaderia + comprar dolar
(siempre es mas por comisiones) + traslado = mercaderia + el 15%"*— y se mete en el costo de cada
ficha nueva, o sea en todos los márgenes y en el patrimonio. Es un número a ojo decidiendo plata.

**Y LO QUE LA PRIMERA COMPRA YA MOSTRÓ: NO ES UN % PAREJO, TIENE UNA PARTE FIJA.** Medido sobre la
compra real: **17,3% sin el correo y ~20,7% con él** (medido contra la FACTURA el 21/09; la primera
cuenta dio 19,4% porque tomé la mercadería de lo transferido y no del comprobante), que se abre en
**5,5% de comprar los dólares** (eso SÍ escala con el tamaño
del pedido) y **13,9% de flete y despacho**, que son **pesos FIJOS por pedido** y no escalan. O sea
que el mismo 15% es **demasiado en un pedido grande y demasiado poco en uno chico** — es la misma
forma que el cargo fijo de ML, que hace que el % de comisión suba cuanto más barato es el producto.
Por eso el comando guarda los pagos **SEPARADOS** y no un total: con dos o tres compras se puede
separar una cosa de la otra y decir *"mercadería × 1,055 + US$ 66 repartidos entre lo que pidas"*,
que es mucho más exacto que cualquier porcentaje único.

```
compray                                   → lo guardado y el recargo medido
compray:<AAAA-MM-DD>|usd=<crudo>|merc=<pesos>|envio=<pesos>[|cambio=][|otros=][|nota=][|go]
```

 · **`usd` son los dólares CRUDOS de comprasparaguay, SIN el 15%.** Cargarle el precio ya recargado
   da un recargo falso y chico, que es el lado peligroso.
 · **Guarda el detalle por producto solo**: toma los candidatos que tengan unidades cargadas en el
   panel, con su código y su precio. Si no hay ninguno, lo dice en vez de guardar vacío callado.
 · **Un pedido sin el envío se puede guardar con `envio=0` y queda marcado INCOMPLETO**: entra en
   la lista y **NO en el promedio**. Un recargo sin el flete sale más barato de lo real.
 · Sin `|go` no escribe. Después de escribir relee y compara (regla 6).
 · **No cambia `RECARGO_PY`.** Con una sola compra medida el número es una referencia, no un dato
   para mover todos los márgenes del panel.

## LO QUE VUELVE A DAR EL PISO VUELVE SOLO A PEDIDOS (21/09/2026)

Pedido suyo mirando "Pausados por precio" con tres en verde: *"esto que sea automatico. si el
precio da que se ponga a candidatos para el pedido o en el pedido si es que se da todo para
meterlo"*.

**ESTE ARCHIVO Y EL CÓDIGO DECÍAN LO CONTRARIO, CON SU MOTIVO ESCRITO AL LADO:** *"vuelve a la
LISTA marcado, no a Pedidos: si volviera a Pedidos empezaría a restar puntaje otra vez sin decir
por qué"*. El motivo era real pero el remedio estaba al revés: **eso se arregla DICIÉNDOLO, no
dejándolo pausado.** Ahora vuelve solo y el aviso nombra cuáles volvieron.

**SE AUTOMATIZA UNA DE LAS DOS SEÑALES, NO LAS DOS**, y la diferencia es si el panel puede
contestar solo:
 · **"volvió a dar el piso"** lo mide el panel (subió el precio en ML o bajó el de Paraguay). No
   hay nada que preguntarle a nadie → **vuelve solo**.
 · **"vencieron los 30 días"** no es una medición, es un recordatorio de ir a preguntarle el precio
   al proveedor. Ése sigue esperando que conteste él.

**Tres frenos, y los tres hicieron falta:**
 · **Sólo entra el que tiene el margen MEDIDO.** Sin neto de ML el margen es `null` y no se toca:
   de lo que no se midió no se sabe si da.
 · **No lo hace en silencio.** Devolver un renglón cambia lo que falta comprar y el puntaje del
   mes; queda en el registro de cambios y el aviso los nombra.
 · **Si la escritura falla NO se saca de la lista en memoria.** Si no, la pantalla mostraría un
   producto devuelto que en la base sigue pausado, y al recargar volvería a aparecer.

**Volver a Pedidos no gasta un peso** —sólo devuelve el renglón a la lista de lo que falta comprar,
y de ahí lo toma la canasta— así que el lado seguro acá es devolverlo: **un producto que ya da el
piso y sigue escondido es una compra que no se hace.**

Probado con la función REAL sacada del archivo y 14 casos: los 3 que dan vuelven y el de 21,3% se
queda · el pedido cargado a mano vuelve entero · sin margen medido no toca nada · si la escritura
falla no saca nada y lo dice · y dos llamadas a la vez no duplican.

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
| `/products/<id>/items` | ✅ vendedores con precio · **NO trae stock ni ventas** (medido el 18/09: contesta `?` en los dos) · tampoco dice quién tiene la caja |
| `/sites/MLA/search?q=…` | ❌ **403 forbidden** · ML cerró la búsqueda libre de publicaciones |

**VÍA CARGO TAMPOCO SE PUEDE LEER, MEDIDO EL 21/09/2026 con `verwebs`** (6 direcciones en una
sola corrida): las 4 que existen contestan **403 con *"Just a moment… Enable JavaScript and
cookies"*** —el muro de Cloudflare— y `cotizador.` y `api.` ni siquiera resuelven. **Es el MISMO
caso que comprasparaguay y se decide igual: no se insiste.** Pasar ese muro es hacerse pasar por
un navegador de una persona, que es justo lo que se decidió no hacer con Instagram.
**Y ojo con una conclusión fácil que es falsa: abrir la red del CHAT no lo arregla.** El bloqueo no
es de nuestra red —el robot tiene internet abierto y le contestan 403 igual— es del sitio contra
los automáticos. **El precio del correo lo tiene que mirar él, o el que despacha.**

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

**ESTA NOTA DECÍA "el panel es PÚBLICO Y SIN CONTRASEÑA" Y ERA FALSA (21/09/2026).** Salió de que
el 17/09 él le pasó el link al chat local y *"entró de una"* — y de ahí concluí que no había login.
**Nunca lo miré en el código.** `index.html` tiene pantalla de login desde antes
(`signInWithEmailAndPassword`, recuperar contraseña, cerrar sesión) y `onAuthStateChanged` **no
llama a `startApp()` si no hay sesión**: sin usuario no se dibuja nada. Es el error anotado una
docena de veces acá —concluir sobre el dato que decide, sin medirlo— y esta vez lo arrastré cuatro
días adentro de una lista de pendientes de seguridad.

**LO QUE SÍ HAY QUE MIRAR, Y ES OTRA COSA: las REGLAS de la base.** La contraseña de la pantalla
protege la PANTALLA; los datos los sirve Firebase, y su dirección está adentro de `index.html`, que
es público (eso es normal y no es un secreto). **Si las reglas están abiertas, cualquiera le pide
los datos a Firebase directo y nunca pasa por el login** — ahí la contraseña es decoración.
Se mide con **`reglas`** (comando nuevo, SOLO LEE), que pregunta **sin token** —que es lo que puede
hacer un desconocido— e imprime **únicamente el código de respuesta y cuántas claves trajo, ningún
dato**: si las reglas estuvieran abiertas y el comando volcara la respuesta, el comando hecho para
detectar la filtración SERÍA la filtración.
**Y cerrarlas NO apaga el robot**, que era el miedo razonable: `sync.mjs` entra con **su propio
usuario y contraseña** (`FIREBASE_BOT_EMAIL` / `FIREBASE_BOT_PASSWORD`, en los secretos de GitHub)
y trabaja con un token, no anónimo. Verificado en el código antes de proponer nada.

**MEDIDO EL 21/09/2026: LAS REGLAS YA ESTÁN CERRADAS.** Las tres puertas —la base entera, `cyc` y
`cyc/ventas`— contestan **401** sin token. O sea que **nadie puede bajarse los datos salteando el
login**, y la contraseña de la pantalla está protegiendo de verdad. **No hay nada que tocar.**
Y el pendiente de seguridad que arrastraba esta lista desde el 17/09 **no existía**: era una
conclusión mía sobre un dato que nunca había medido.

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

**Y PARA EL PEDIDO DE HOY LA VARA DE VENTAS SUBIÓ A +100 (19/09/2026), SIN BORRAR NADA.** Textual:
*"para eliminar riesgos lo máximo posible, intentar que todos los productos que metemos en el
pedido tengan más de 100 ventas en ml. **no elimines nada, solo reemplaza si hay que hacerlo**.
para asegurar que se vende y todo"*.
**Son DOS números que conviven, no uno que reemplaza al otro:** **25** sigue siendo el corte para
que un candidato valga la pena mirarse, y **100** es la vara de este pedido. Por eso `revisarcompra`
lo pinta en ámbar y **no descarta nada**: un candidato de 40 ventas sigue sirviendo el día que no
haya uno de 100 para poner en su lugar, y borrarlo hoy sería decidir por él una compra que todavía
no tocó. Los que no llegan se listan igual, con su número, justo abajo de los que sí — *"una lista
que saca renglones sin decirlo es una lista que miente"*, y acá el renglón que falta puede ser el
único reemplazo que hay.
**Y el número que informa ML es de TODA LA VIDA de la publicación, no del último mes**, así que
ordena, no borra.

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

### LOS DOS ENLACES EN EL RENGLÓN, PARA MIRARLO CON LOS OJOS (19/09/2026)

Pedido suyo: *"quiero que acá aparezcan los url del producto de ml y de compras paraguay, así
puedo mirarlo de ahí"*. Es el chequeo que **ningún número reemplaza**: si el robot se emparejó con
el producto equivocado, el margen sale perfectamente calculado y perfectamente inútil. Ya pasó
seis veces en este panel.

**EL LINK DE ML ES EL DEL CATÁLOGO QUE EL ROBOT MIDIÓ** (`mlLink`), no una búsqueda nueva. Si fuera
una búsqueda podría llevar a un producto **distinto del que dio ese margen**, que es justo lo que
se quiere verificar. Si no está, se arma con el código que dejó el chat, que es el mismo que usó el
robot. Y si no hay ninguno de los dos, **lo dice en ámbar** — eso quiere decir que el robot lo
buscó por nombre, que es cuando más hay que mirarlo.

Vive en `candPreciosHTML`, la función que dibujan **los dos lugares** (el renglón del pedido y la
tarjeta del candidato), para que no puedan mostrar links distintos del mismo producto.

**Y DE PASO SE TAPÓ UN AGUJERO: sin precio medido la función devolvía VACÍO** y el renglón entero
desaparecía — **incluidos los enlaces**. O sea que el candidato que el robot NO pudo medir, que es
**el que más necesita que lo abras con los ojos**, era justamente el único que se quedaba sin
links. Ahora dice que no está medido y muestra los dos igual, sin inventar ningún precio.

Probado con la función REAL sacada del archivo y 12 casos, incluidos los cuatro que hay que
avisar (sin link de ML, sin link de Paraguay, sin medir, y el código del chat con basura al final).
Chequeo de las tres listas: **0 funciones, 0 variables y 0 `id` de diferencia**.

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

## LAS VENTAS DEL PRODUCTO EN ML, EN "PARA PROBAR" (18/09/2026)

Pregunta suya: *"tiene en cuenta la cantidad de ventas del producto? podria mostrarlas de cada
producto?"*. **No las tenía en cuenta y no las mostraba** — y es su propia regla del 18/09:
*"en ML tiene que haber ventas de verdad (+25 vendidos para arriba): un vendedor solo no molesta,
uno sin ventas no sirve"*. Lo único que había era cuántos **VENDEDORES** tiene la ficha, que es
otra cosa: "4 vend." dice que hay competencia, no que el producto se venda.

**Él sospechó que el robot sí las miraba y que lo que faltaba era dónde cargarlas. Tenía razón a
medias, y la mitad importa:** el formulario de cargar un candidato tiene ocho casillas —nombre,
código de Nissei, precio US$, link de ML, marca, medidas, peso y link— y **ninguna de ventas**, eso
es cierto. Pero el robot tampoco las miraba: de la respuesta de ML usaba el precio, la categoría y
el tipo de publicación, y nada más.

**NO VIENEN GRATIS, y eso se midió ANTES de escribir una línea** (con `probarweb`):
`/products/<id>/items` contesta **`vendidas ?` y `stock ?`** — esos dos campos NO están ahí.
**De paso eso corrige una nota de este archivo que estaba mal**: decía que ese endpoint trae
*"vendedores con precio, **stock** y quién tiene la caja"*. El stock tampoco viene.

**Y EL ROBOT TAMPOCO PUEDE TRAERLAS: LAS CARGA EL CHAT (19/09/2026).** La primera versión pidió
las ventas con `/items?ids=…&attributes=id,sold_quantity` (20 por consulta, 3 o 4 llamadas para
toda la corrida) dando por hecho que ML las contestaría. **La corrida imprimió `ventas ?` en los
23**: ML **no da `sold_quantity` de publicaciones ajenas**. Lo destapó él preguntando
*"agregaste que pueda poner ese dato en la web de cyc?"* — la respuesta correcta era sí, y yo había
diseñado lo contrario.
**El ÚNICO que ve ese número es el chat de compras**, que lee la página del listado de ML (su propio
texto ya lo dice: `printed_result` trae `sold_quantity`). Por eso el formulario de cargar un
candidato tiene ahora el campo **"Vendidos en ML"** → `vendCarga`. Vacío es vacío: la tarjeta dice
*"faltan las ventas — las carga el chat"*, nunca un cero.
El pedido del robot **se deja igual**, como CRUCE por si ML lo abre algún día: si los dos números
existen y no coinciden, la tarjeta muestra *"(el robot ve N)"* — la misma idea que con el precio,
donde ya aparecieron diferencias reales.
**Y EL CATCH VACÍO ERA EL ERROR ANOTADO SEIS VECES.** El fallo se tragaba entero, así que "ML no
contestó" y "ML contestó sin el campo" se veían igual y no había forma de saber cuál era. Ahora se
distinguen y se imprimen. **Tardó una corrida entera en descubrirse, y sólo porque él preguntó.**

**EL MOTIVO, YA MEDIDO Y SIN ADIVINAR (19/09/2026):** apenas se destapó el error, la corrida dijo
**`ML contestó 403`** en los 26 candidatos, uno por uno. O sea que `/items?ids=…` está **prohibido
para publicaciones ajenas**, igual que `/sites/MLA/search` y que el saldo de MercadoPago. No es un
límite de consultas ni un problema de red: es un permiso que la aplicación no tiene y no puede
pedir. **No se insiste** — se deja el pedido hecho como CRUCE por si algún día lo abren, y el
número lo carga el chat.

**Y EN ESA MISMA CORRIDA EL FRENO DE LAS DOS MEDICIONES HIZO SU PRIMER DESCARTE REAL:** el
**Lattafa Opulent Dubai** (38,9% → 23,6%) y el **Ophidian Mango Bliss** (48,5% → 23,2%) se cayeron
abajo del piso **dos veces seguidas** y salieron. El Ophidian era justo uno de los dos que estaban
en duda por precio, así que ese pendiente se cerró solo. Quedan **23 que dan 25% o más**.

**Se guardan DOS números, porque contestan preguntas distintas:**
 · **`mlVendidas`** — la SUMA de la ficha: *¿este producto se vende en ML?*
 · **`mlVendidasMin`** — las del **más barato**, que es contra el que se mide el margen.

**SE MUESTRA, NO SE FILTRA**, y es a propósito por dos motivos: las ventas que informa ML son de
toda la vida de cada publicación (no de los últimos 30 días), así que un número bajo no siempre
quiere decir que no se venda; y **lo que BORRA algo tiene que ser más exigente que lo que lo
muestra** — la lección del marcado de cajas y del descarte de candidatos. Va en verde de 25 para
arriba y en ámbar abajo, que es su regla a la vista sin que la máquina decida.

**Y si ML no las contesta se DICE, no se pone cero.** Un cero ahí se leería como "no vende nada" y
sería descartar un producto por falta de dato — el error anotado de punta a punta en este archivo.

Va en `candPreciosHTML`, la MISMA función que dibuja el renglón del pedido y la tarjeta del
candidato, así que no puede decir una cosa en un lado y otra en el otro.

### LA COMISIÓN REAL YA ESTABA MEDIDA Y SE TIRABA (19/09/2026)

Pregunta suya, y tenía razón: *"no entiendo el % exacto de comision, me explicas que falta saber?
vos tenes todos los datos de lo que cobra ml"*. **No faltaba ningún dato de él.**

El robot le pregunta a ML la comisión **a ese precio exacto** (`feeAt` → `/sites/MLA/listing_prices`,
el MISMO pedido con el que el panel fija precios), la usa para calcular el margen y **la tiraba**:
no la guardaba en ningún lado, así que ni el panel ni el chat de compras la veían nunca.

**Y ése era el origen del "problema abierto" que el chat arrastraba hace días.** El simulador de la
web NO le puede preguntar a ML —no tiene el token, eso ya estaba decidido— así que **copia la
comisión de otro producto**, y las medidas van de **16% (Cabotine Turquoise) a 27% (Animale For
Men)**. Con esa horquilla el mismo Animale Gold daba **57% con el robot y 29% o 49% con el
simulador** según qué referencia eligiera. El chat concluyó que había que preguntarle a Mati el %
exacto; lo que había que hacer era **guardar el número que el robot ya tenía**.

Ahora se guarda en `cyc/candidatos_py/<id>/mlComision` (en pesos) y la tarjeta muestra
**"ML se queda N% ($X · preguntado a ML)"**, en la MISMA función que dibuja el renglón del pedido
(`candPreciosHTML`). El chat copia ese número al simulador y deja de adivinar.

**LA LECCIÓN, y es una variante nueva de la de siempre: no era falta de dato, era un dato medido
que no se guardaba.** El error conocido es leer una falta de dato como si fuera un dato; éste es el
espejo — tener el dato, usarlo para una cuenta interna y no mostrarlo, que deja a todos los demás
adivinando un número que el sistema ya sabe.

### LO QUE VA EN EL `PROMPT GUAY` (bloque listo para pegar)

> **LAS VENTAS EN ML LAS CARGÁS VOS, Y SOS EL ÚNICO QUE PUEDE**
>
> **ESTE BLOQUE DECÍA LO CONTRARIO HASTA EL 19/09 A LA NOCHE** —*"ya no las cargás vos: las trae
> el robot"*— y era falso: se escribió ANTES de medirlo. El robot pide las ventas y **ML contesta
> 403 en los 26 candidatos, uno por uno**. Pegar la versión vieja le decía al chat justo lo que NO
> hay que hacer. Es el comentario que promete algo que no está, otra vez.
>
> En el formulario de *"Agregar un candidato a mano"* hay un campo **"Vendidos en ML"**.
> **Cargalo siempre**, con los vendidos de la publicación **MÁS BARATA**, que es contra la que se
> mide el margen (si ML dice *"+1000 vendidos"*, poné 1000).
>
> El panel lo muestra como **🛒 N vendidas en ML**, en **verde de 25 para arriba** y **ámbar abajo**,
> que es el corte de Matías (*"un vendedor solo no molesta, uno sin ventas no sirve"*). Si no lo
> cargaste dice **"faltan las ventas — las carga el chat"**, nunca un cero.
>
> · **Un ámbar no descarta el producto por sí solo.** El número que informa ML es de toda la vida
>   de la publicación, no del último mes, así que un catálogo nuevo puede vender bien y mostrar
>   poco. Sirve para ordenar, no para tirar.
> · **Lo que sí es una señal fea: ámbar con muchos vendedores.** Varios vendiendo y casi nada
>   vendido quiere decir que el producto no se mueve, no que falte competencia.
> · **Los candidatos cargados antes del 19/09 no tienen el dato**, porque el campo no existía.
>   Cuando vuelvas a pasar por uno, cargáselo; no hace falta ir a buscarlos todos de una.
> · El robot sigue pidiéndolas como CRUCE por si ML lo abre algún día: si los dos números existen
>   y no coinciden, la tarjeta dice **"(el robot ve N)"**.

### NADA DE ENVÍOS INTERNACIONALES (19/09/2026)

Regla suya, avisada mientras el chat barría comprasparaguay: **"estaba tomando envíos
internacionales. esos no quiero que se fije."** Ya se lo dijo al chat esa vez; **va en el próximo
`PROMPT GUAY`** para no tener que repetirlo.

> **NO MIRES PUBLICACIONES DE ENVÍO INTERNACIONAL.** Las de vendedores de afuera (las que dicen
> *"Envío internacional"*, tardan semanas y salen del exterior) no cuentan: no es contra ésas que
> competimos. Si el más barato de un catálogo es internacional, **saltealo y tomá el más barato
> ARGENTINO** — y si no hay ninguno argentino, el producto no sirve para medir.

**Y HUBO QUE SUBIR `CAND_CALC_VER` A 5, QUE CASI SE ESCAPA.** El atajo de *"ya tiene la cuenta
hecha"* sólo vuelve a medir cuando cambia ese número, y el filtro nuevo no agrega un campo: **cambia
la CUENTA**. Como el atajo agarra a los que DAN, los cuatro catálogos que hoy miden lindo porque el
más barato es de afuera —Hamidi Addicted Silver **74%**, Armaf Blue Iconic **42,4%**, Armaf Odyssey
Toffee Coffee **38,4%** y el CK One— se quedaban con ese margen **falso para siempre**: están todos
arriba del piso, así que ninguna vuelta los volvía a mirar. **Un cambio en la fórmula cuenta igual
que un campo nuevo** — es la tercera vez en dos días que este `if` se queda corto.
Se vuelven a medir los 69, de a 40 por vuelta (`CAND_MAX_ML`), o sea en dos noches; las que quedan
salen nombradas en el log. Y el freno de las dos mediciones los protege: como el margen guardado
está arriba del piso, una primera lectura nueva abajo los deja **en observación**, no tachados.

**MEDIDO EL MISMO DÍA CON `verofertas` (comando nuevo, solo lee): SE PUEDEN DISTINGUIR, Y EN LOS
DOS CATÁLOGOS PROBADOS NO HABÍA NINGUNO.** ML devuelve **`international_delivery_mode`** en cada
oferta, más la **provincia** del vendedor. En el Azzaro Forever Wanted Elixir (15 vendedores) y en
el JBL Partylight Beam (16), **los 31 dieron `international_delivery_mode=none` y provincia
argentina** (Buenos Aires, Misiones, Córdoba, Tucumán, Santa Fe, Capital).
**O SEA QUE MI HIPÓTESIS NO SE SOSTIENE con estos datos:** los márgenes de −18% NO se explican por
vendedores internacionales, al menos no en los que se midieron. El Azzaro da 10,4% midiendo contra
un vendedor argentino. **Queda por medir en los catálogos que dieron NEGATIVO**, que son otros.
**Lo que sí quedó probado es que el filtro SE PUEDE escribir** el día que aparezca uno: el campo
existe y viene en todas las ofertas. Escribirlo ahora sería un filtro que no filtra nada.
Dos cosas más que salieron de la misma corrida:
 · **`/items/<MLA>` de una publicación ajena también da 403**, no sólo `/items?ids=`. Ya está
   probado por las dos vías: las ventas de publicaciones ajenas no se pueden leer y punto.
 · **La lista de ofertas NO viene ordenada por precio**, aunque un comentario del código lo decía:
   en el JBL el renglón 13 venía a $234.999 después de uno de $273.999. No cambia ningún resultado
   (se usa `Math.min`/`Math.max`), pero el comentario estaba mal y se corrigió.

### EL FILTRO DEL EXTERIOR AGARRÓ LOS CUATRO QUE SE SOSPECHABAN, EN SU PRIMERA CORRIDA REAL

Corrido el 19/09 después de que el chat terminara el barrido: de 38 candidatos medidos, **5 no se
pudieron medir y CUATRO son por esto** — *"en ML sólo lo venden desde el exterior"*:
**Calvin Klein CK One · Armaf Odyssey Toffee Coffee · Armaf Club de Nuit Blue Iconic · Hamidi
Addicted Silver**. Son **exactamente** los cuatro que estaban anotados arriba como sospechosos de
tener el margen falso (74%, 42,4%, 38,4%). O sea que esos márgenes **eran falsos** y el freno los
sacó antes de que entraran a una compra. El quinto es el Lattafa Fahad, que ya estaba anotado: el
catálogo existe y hoy no lo vende nadie.
**Lo que NO se puede decir todavía:** que los márgenes muy negativos (King Of Seduction −18,3%,
Khamrah −18,2%, Yum Yum −16,3%) se expliquen por lo mismo. Ésos ya estaban descartados antes de
esta corrida, así que no se volvieron a medir.

**EL RIESGO DE FONDO SIGUE EN PIE, aunque hoy no haya mordido: el ROBOT no mira de dónde es el
vendedor.** `candidatos` mide el margen **contra el MÁS BARATO de la
ficha** (`Math.min` de los precios que devuelve `/products/<id>/items`) y **no mira de dónde es ese
vendedor**. Si el más barato es internacional, el margen sale hundido contra un precio que no es el
que hay que igualar — y con el freno de las dos mediciones ese producto termina descartado.
**Es candidato a explicar los márgenes muy negativos** que aparecieron el 19/09 (Antonio Banderas
King Of Seduction −18,3%, Lattafa Khamrah −18,2%, Armaf Yum Yum −16,3%). **No está medido todavía**:
hay que ver primero si la respuesta de ML trae con qué distinguirlos (un campo de logística o de
país del vendedor). Si no lo trae, no se puede filtrar y hay que decirlo, no inventarlo.

### EL FRENO DE LAS DOS MEDICIONES ESTABA DESACTIVADO, Y EL RESCATE DIO CERO (19/09/2026)

Salió al revisar lo que cargó el chat de compras. **De 69 candidatos, 39 estaban tachados y el
comando no lo decía en ningún renglón**: imprimía *"69 en la lista"* y abajo *"30 mirados"*. Los
que ya tienen `no` o `prodId` se salteaban con un `continue` pelado, sin contarse — **y el chequeo
de "la cuenta tiene que cerrar" medía contra `mirados`, que es un número que ya los había dejado
afuera, así que cerraba perfecto igual.** El freno puesto para detectar descartes silenciosos no
veía éste. Ahora el resumen arranca por la lista ENTERA y hay un segundo chequeo contra ella.

**Y AL VER EL DESGLOSE APARECIÓ LO GRAVE: 27 de los 39 se habían descartado con UNA sola medición.**
La regla del 18/09 pide DOS, y la causa es el atajo de *"ya tiene la cuenta hecha"*, que existe para
no gastar consultas: agarraba también a los que tenían el margen guardado ABAJO del piso y los
descartaba con ese número, **sin volver a preguntarle nada a ML**. O sea que la "segunda medición"
no era una segunda medición: **era la primera, leída dos veces.** Y el comentario de abajo afirmaba
lo contrario —*"en la vuelta siguiente `antesM` ya existe y, si sigue abajo, cae en el descarte"*—
dando por hecho que la vuelta siguiente volvía a medir. No volvía. Es el comentario que promete que
algo está cubierto sin estarlo, **por octava vez en este archivo**.
**Arreglado:** el atajo es sólo para los que DAN. El que quedó abajo del piso se vuelve a medir de
verdad y recién la segunda lectura real descarta. Verificado en la corrida siguiente: los dos que
estaban en observación siguieron en observación en vez de tacharse.

**LOS 27 SE DEVOLVIERON (autorizado por él) Y NINGUNO SE RESCATÓ. Eso también es un resultado.**
Comando nuevo **`devolvercand[:go]`**, que además de sacar la cruz **borra el margen guardado** —
sin eso no serviría de nada: la próxima medición contaría como la SEGUNDA y los tacharía al toque.
27 de 27 devueltos, releído de la base. Al volver a medirlos, **los números dieron casi idénticos**
(Pride Nebras 24,9% las dos veces, Montblanc 22,7 → 22,8, Jouri 20,9 → 21,0). O sea que **en estos
27 las lecturas eran estables y estaban bien tachados**; se van a volver a caer solos, ahora sí con
dos mediciones REALES.
**No invalida el arreglo, y conviene tenerlo claro:** que esta vez no hubiera ninguno mal tachado
no quiere decir que el freno sobre — quiere decir que hoy tuvimos suerte. El Yara Moi pasó de 28,3%
a −2,7% en dos corridas con minutos de diferencia, y eso es exactamente lo que el freno agarra.
**Lo que sí queda medido es cuánto de "inestable" tiene el precio de ML: mucho menos de lo que
parecía.** De 27 casos, cero cambiaron de lado.

### UN DESCARTE POR MARGEN YA NO ES "NUNCA MÁS" (19/09/2026)

Regla suya, textual: *"yo no pondría ningún producto en NUNCA MÁS. salvo producto que después de
varias corridas siempre estén lejos, ahí sí. lo que sí se da de baja, pero eso el chat lo sabe,
son productos con marcas que no se pueden y todo eso"*.

**ÉL CREÍA QUE YA FUNCIONABA ASÍ** — *"si sacás un producto que no da, la corrida lo vuelve a
evaluar más adelante"*— **y no era cierto**: un `no:true` se salteaba para siempre con un
`continue` y a los 45 días se borraba. Los tres mal descartados que encontró la revisión de ese
mismo día no habrían vuelto jamás. **Su modelo mental era el diseño correcto; el código era el que
estaba mal.**

**SON DOS DESCARTES DISTINTOS Y AHORA SE TRATAN DISTINTO:**
 · **BLANDO** — no llegó al piso. El margen se mide contra el MÁS BARATO de ML, que se mueve todos
   los días: **se vuelve a medir a los 7 días** (`CAND_REMEDIR_DIAS`). Si da, se le saca la cruz
   sola y vuelve a la lista; si no, se re-descarta y suma a la cuenta de abajo.
 · **DURO** — marca que ML frena, no lo ofrece Nissei, sin precio, pasa el tope de US$250, o lo
   bajó él a mano. Eso no cambia solo, así que queda.

**"SIEMPRE LEJOS" ES SU CONDICIÓN PARA EL NUNCA MÁS, Y HUBO QUE PONERLE NÚMERO:** **4 mediciones**
(`CAND_BAJAS_NUNCA`) quedando **10 puntos o más abajo del piso** (`CAND_LEJOS_PTS`), o sea 15% o
menos. **El que ronda el 23% NO entra nunca en esa cuenta** y se sigue midiendo — que es justo lo
que él quiere: ése puede cruzar cualquier día.

**Los descartes VIEJOS no tienen el tipo guardado**, así que se deduce del texto del motivo; de acá
en adelante se escribe `noTipo` y no hay que adivinar más.
**Y los que vuelven se NOMBRAN en el resumen**: un producto que reaparece sin que nadie lo diga es
el descarte silencioso al revés.

Probado con la función REAL y 17 casos: vuelve a los 8 días y no a los 3, la marca frenada y la
baja a mano no vuelven nunca, los motivos viejos se clasifican bien, el 23% repetido cuatro veces
**no** llega al nunca más y la cuarta medición muy abajo sí.

### LOS DESCARTADOS, REVISADOS: 3 MAL DE 47 (19/09/2026)

Comando **`descartados`** (solo lee, no pregunta nada a ML, no devuelve nada). Compara el nombre de
comprasparaguay contra el título de ML **contra el que se midió** — que es lo único que hay que
revisar cuando la sospecha es haber medido contra el producto equivocado.

De ~47 descartados: **34 se midieron bien**, 1 nunca llegó a medirse y **12 salieron marcados**. De
esos 12, **nueve son falsas alarmas**: ML escribe el título distinto y nada más (*"Banderas"* sin
*"Antonio"*, *"Bahamas"* junto, *"premium"* de adjetivo, el número de parte que ML no repite).

**LOS TRES QUE ESTÁN MAL DE VERDAD, y los tres se midieron contra OTRO perfume:**

| producto | ML lo midió contra | dio |
|---|---|---|
| **Armaf Delights Yum Yum** | *"Armaf Odyssey **Aoud**"* | −16,3% |
| **Armaf Odyssey Toffee Coffee** | *"Armaf Odyssey **Aoud**"* | 6,0% |
| **Lattafa Asad** | *"Asad Lattafa **Intense**"* | −1,2% |

**Los dos Armaf cayeron en el MISMO catálogo equivocado** (`MLA23592967`): el chat pegó el link del
Aoud en dos productos distintos. Sus márgenes reales no los sabe nadie — y con la regla nueva se
vuelven a medir solos.

### EL PEDIDO QUEDA CARGADO DESDE EL CHAT: `pedir` (19/09/2026)

Pedido suyo: *"podés armarme el pedido por favor?"* y *"cargalo en la web"*. Hasta ese día las
unidades se cargaban casilla por casilla en el panel, que está bien con cuatro y es un suplicio
con once.

**NO ELIGE NADA.** Escribe las unidades que se le dicen en los productos que se le dicen — quién
entra al pedido lo decide él, regla suya del 18/09 (*"no que la web lo arme"*). Sin `;go` sólo
muestra, y después de escribir **relee de la base y compara**, que es la regla 6.

**EL FRENO DE LAS PALABRAS SALVÓ LA PRIMERA CORRIDA.** Se le pasó `mercedes=2` y contestó
*"agarra 3: The Move | Club Black | B. Sign Your Power"* y **no escribió nada**. Es el filtro por
palabras que ya falló seis veces en este panel, y acá habría cargado 2 unidades del perfume
equivocado en un pedido que no se rehace hasta que llega. Se resolvió con `club black=2`.
**Y si UN solo término no se entiende, no se escribe NINGUNO**: un pedido cargado a medias deja el
total bien y le falta un renglón, que es el error que no se ve.

**EL TOTAL CONTABA DESCARTADOS, Y AVISÓ DE UN TOPE QUE NO SE PASABA.** La primera corrida con `;go`
imprimió **US$ 833,70** cuando lo cargado eran **US$ 495,70**: sumaba candidatos ya **descartados**
que tenían unidades viejas colgadas — el panel no los muestra y no van en el pedido. Un total
inflado dispara el *"pasa tu tope"* sobre un pedido que no lo pasa, **y el aviso que suena cuando no
tiene que sonar es el que después no se mira**. Ahora cuenta lo mismo que la pantalla, y los
descartados con unidades colgadas se dicen aparte.
**Quedan 9 así** (Lattafa Opulent Dubai, Animale Gold, Armaf Odyssey Toffee Coffee, Maison
Alhambra, Ard Al Zaafaran, Paris Corner Mysterium y 3 más). No hacen daño hoy, pero si alguno se
devuelve a la lista reaparece con unidades que nadie puso. **Pendiente de limpiar.**

### EL CHEQUEO MIRABA SÓLO LO QUE FALTA Y NUNCA LO QUE SOBRA — LO ENCONTRÓ ÉL (19/09/2026)

**ES EL ERROR MÁS CARO DEL Día y lo agarró él abriendo un link, no el comando.** El robot emparejó
el *"Controle Sem Fio Sony Playstation Dualsense para PS5 - Preto"* (US$ 60) con el catálogo del
**"DualSense The Last Of Us Edición Limitada"**, que en ML vale **$349.999**. Salió **57% de
margen** medido contra el precio de una edición de colección: un número perfectamente calculado y
perfectamente falso, con **US$ 120 del pedido** adentro.

**LA CAUSA, Y ES DE LAS QUE SE REPITEN: el chequeo de títulos sólo miraba las palabras que FALTAN
en ML, nunca las que SOBRAN.** Y una edición especial, un pack, un combo o un *"Pro/Lite/Max"* no
le quitan palabras al título: **se las agregan**. Todo el control estaba mirando para el único lado
por el que este error no pasa.

**Y EL ATAJO DEL MODELO LO TAPÓ ENCIMA.** *"ps5"* está en los dos títulos, así que el chequeo
imprimió **"✓ ES EL MISMO"** y se salteó todo lo demás. **"ps5" no es un modelo: es la CONSOLA**, y
la comparten el control común, el de edición limitada y cualquier accesorio. Un atajo que da por
bueno el producto ENTERO porque coincidió UNA cosa es el mismo error que el atajo de *"ya tiene la
cuenta hecha"*, que ya mordió tres veces en este archivo. Ahora lo que sobra se mira **siempre**,
antes y aparte de todo lo demás.

**Y `pack`, `set` y `kit` estaban en la lista de palabras a ignorar**, o sea que se filtraban
ANTES de que el chequeo nuevo los pudiera ver: *"Pack X2 Lattafa Sutoor"* pasaba como si fuera el
perfume suelto. Parecían relleno y son justo la señal.

**UN MARGEN MUY ALTO PASÓ A SER UNA SEÑAL, NO UNA BUENA NOTICIA.** De 80% para arriba el renglón
avisa que se chequee el catálogo: cuando el de ML no es el mismo producto, el precio contra el que
se mide es mucho más alto **y eso no se ve como un error, se ve como un negoción**. Es el cero que
parece una buena noticia, dado vuelta.

**LA LECCIÓN PARA MÍ, Y ES LA PEOR DEL DÍA:** le dije *"no los revises uno por uno, el chequeo que
encuentra productos equivocados es justo el que te marcó los 4"*. **Y en el primero que abrió
encontró esto.** Un chequeo que pasa no prueba que esté bien: prueba que **esa** forma de estar mal
no está. Decirle que no mire, apoyándome en un control cuyo punto ciego yo no conocía, es el error
de fondo — y es el mismo *"un comentario que promete que algo está cubierto no es prueba de que lo
esté"*, sólo que dicho en voz alta a la persona que decide la compra.

**Y SE ME FUE DE MANO PARA EL OTRO LADO EN LA PRIMERA CORRIDA.** La primera versión avisaba con
**3 o más palabras de más**, y saltó en **6 de los 11 del pedido** — todos verificados a mano como
correctos: ML simplemente describe más largo (*"auriculares, micrófono, plegables"*, *"especias,
maderas"*). **Un aviso que suena en la mitad de la lista entrena a ignorarlo**, que es la lección
del `⚠️ VENDE` de `nomandar` y del aviso diario, ya escritas acá.
**La señal no es CUÁNTAS palabras sobran: es CUÁLES.** Una edición, un pack o un *"Lite"* cambian
el producto; *"plegables"* no. Avisa sólo `RV_VARIANTE`; el resto se imprime en el log para poder
mirarlo cuando uno ya sospecha.

Probado con las funciones REALES y **los 11 títulos de la corrida de verdad**: el DualSense avisa,
**los 8 que él verificó a mano no avisan ninguno**, y siguen saltando `Lite`, `Pack`, el Blue
Iconic, el Dark Door Sport y el Cabotine de 30 contra el de 100.

### EL PEDIDO DE PRODUCTOS NUEVOS CARGADO EL 19/09/2026

**11 productos · 22 unidades · US$ 526,70 crudos · US$ 605,71 puestos.** Se eligieron por **la plata
que deja cada DÓLAR gastado**, no por la que deja cada unidad: con presupuesto fijo, ordenar por
unidad hace comprar caro. Por eso el Mercedes-Benz Club Black va primero aunque no sea el que más
deja — son US$ 32,75 que devuelven $84.027.

**Pasa el tope de US$ 500 por US$ 26,70**, y es a propósito: el Adyan Oud entraba justo afuera y él
pidió *"agregalo 2 unidades sin sacar nada"*.

**Salieron 3 de los 4 que ya tenía cargados** — Paris Corner Rifaaqat y Manaal (50 ventas) y Mirada
Verato Night (**0 ventas**) — por la vara de +100 que puso ese día. El Manaal además tenía el aviso
de que **ML no nombra "Paris Corner"** en el título del catálogo al que lo emparejó.

**Los cuatro con aviso, para mirar antes de mandar:** la **microSD Pokémon** (el renglón más caro,
US$ 124, y hay una ficha parecida — chequear que no sea una de las que tiró por truchas) · el
**Corsair Scimitar** (ML no nombra el número de parte) · y los **dos Sony EX15**, cuyo margen saltó
hoy de 26→43% y de 31→66%: alguien subió el precio en ML, así que es un precio que se mueve.

## NO SE PUEDE CARGAR EN EL PEDIDO ALGO QUE NO LLEGA AL 25% (19/09/2026)

Regla suya, textual: **"Nunca puede suceder eso que la web no permita menos de 25%."** Salió de un
caso real: el **Perfume Mirada Muse Rose Musc** entró al pedido con **2 unidades** teniendo
**−4,2%** anotado en la misma tarjeta, tres centímetros arriba de la casilla donde se cargaron.

**LA REGLA DEL 25% ESTABA ESCRITA EN TRES LUGARES Y EN NINGUNO DE LOS QUE PODÍA FRENARLO:** en el
texto del `PROMPT GUAY`, en el resumen de `revisarcompra` y en el color del número de la tarjeta.
Los tres **avisan**; ninguno **impide**. Es la misma lección del link de ML del 18/09 —*"cuando
alguien no cumple una regla escrita, el arreglo no es escribirla más fuerte, es que el sistema no
lo deje"*— y la de la barrera de los $33.000, que vivía en el robot y no en la pantalla donde él
decide.

**El freno vive en `candSetPedir`** (la ÚNICA función por la que pasa cualquier carga de unidades,
venga del cuadradito de la tarjeta o del renglón del pedido) **y en el comando `pedir`**, que es la
otra puerta. En los dos lados y no en uno: una casilla apagada se esquiva, y un freno que vive sólo
en la pantalla deja al chat cargando por atrás.

| estado | qué pasa |
|---|---|
| margen **25% o más** | casilla normal |
| margen **abajo de 25%** | 🚫 no deja, y dice el número |
| **todavía no medido** | 🚫 tampoco: de lo que no se midió no se sabe si da |
| **descartado** | 🚫 |

**SIN MEDIR TAMPOCO SE PUEDE, y es el mismo lado seguro de siempre:** cargar algo sin medir es
apostar plata que no se recupera hasta que llegue la caja. Se mide solo en la vuelta de la noche y
ahí la casilla se abre.

**LO QUE NO HACE, A PROPÓSITO: sacar solo lo que ya estaba cargado.** Bajarle las unidades sin que
él lo vea le cambia el total del pedido en silencio, que es el descarte por omisión anotado de
punta a punta en este archivo. Lo que ya estaba queda **EN ROJO**, se cuenta arriba con su aviso
(*"N ya no llegan a tu piso y están sumando en el total"*) y tiene un botón **✕ sacarlo del
pedido**. Y **BAJAR siempre se puede**, aunque el producto ya no dé: si no, lo que se cargó cuando
todavía daba quedaría trabado adentro del pedido para siempre.

**EL COSTO QUE TIENE Y HAY QUE SABERLO: el panel frena con el número GUARDADO, que puede estar
viejo.** El Mirada es justo el ejemplo — guardado −4,2%, medido hoy **26,3%**, porque el vendedor
de ML subió el precio. O sea que el freno puede tapar algo que hoy sí da. **No se afloja por eso**:
el que sobra por un día vuelve solo en la vuelta de la noche, y el que entra por un número viejo se
compra. Para el número fresco está `revisarcompra`, que vuelve a preguntar todo sin atajo y es la
última mirada antes de gastar.

Probado con la función REAL sacada del archivo y 12 casos (el Mirada de los dos lados, 25,0% justo
entra, 24,9% no, sin medir por cuatro caminos distintos, descartado con 60%, 0% y −100%) y corrido
el chequeo de las tres listas: **0 funciones y 0 `id` de diferencia, 2 nombres nuevos**.

## EL PEDIDO SE MANEJA DESDE LA PANTALLA: TOPE, UNIDADES Y LLENADO (19/09/2026)

Pedido suyo: *"quiero poder modificar el pedido. sacar productos, modificar u, tope del pedido,
vaciar pedido, llenar hasta el tope con los mejores productos, poder elegir tope de unidades por
producto"*.

**ESTO DA VUELTA SU DECISIÓN DEL 18/09, Y ES A PROPÓSITO.** Ese día sacó el tope y el máximo por
producto —*"sin tope solo una barra que marque el total del pedido, ya que el tope se lo digo yo en
el chat"*— y borró el llenado automático: *"no que la web lo arme. que permita que el otro chat lo
arme"*. **La diferencia es quién aprieta el botón.** Allá la pantalla ponía un límite que él no
había pedido y armaba la lista sola al dibujarse (*"un límite que la pantalla inventa es la
pantalla decidiendo"*); acá los tres números los tipea él y el llenado es un botón que aprieta
cuando quiere. La web sigue sin decidir nada sola.

**Los tres números viven en `cyc/mlconfig`** (`pedTopeUSD` 500 · `pedMaxU` 2 · `pedMinVent` 100) y
se tipean arriba de "Armar el pedido".

**NINGUNO DE LOS DOS TOPES FRENA, y eso importa.** La barra se pone roja y dice por cuánto te
pasás; la casilla que supera el máximo por producto se pone en ámbar. Los dos dejan seguir. **Hoy
mismo el pedido se pasó US$ 24,70 a propósito** porque él pidió *"agregalo 2 unidades sin sacar
nada"* con el Adyan Oud: un tope duro le habría comido esa decisión. **El único freno duro sigue
siendo el 25%**, que es el que evita comprar para vender perdiendo.

### EL BOTÓN 🪄 LLENAR HASTA EL TOPE

**"Los mejores" es la plata que deja cada DÓLAR gastado, no la que deja cada unidad.** Es el mismo
criterio con el que se armó a mano el pedido del 19/09, ahora escrito en el código en vez de en mi
cabeza: el Mercedes-Benz Club Black deja $83.029 por unidad y el JBL Tour One $185.032, pero cuestan
US$ 32,75 y US$ 128 — con los mismos dólares el Mercedes devuelve casi el triple. **Con presupuesto
fijo, ordenar por unidad hace comprar caro.**

 · **SÓLO SUMA, NUNCA SACA.** Lo que él cargó a mano se queda; bajarle unidades para meter otra
   cosa sería la web deshaciendo su decisión. Para empezar de cero está **🗑️ Vaciar el pedido**.
 · **No se corta en el primero que no entra:** uno barato más abajo en la lista todavía puede
   aprovechar los dólares que sobran.
 · **Pasa por el MISMO `candPuedePedir` del 25%** y además exige la vara de ventas. **Un candidato
   sin el número de ventas cargado NO entra**: no se puede decir que algo es "de los mejores" sin
   saber si se vende. Cuántos quedaron afuera por eso se dice en el aviso — un descarte mudo es el
   error anotado de punta a punta acá.
 · **La vara de ventas hacía falta para que "mejores" quiera decir algo.** Sin ella el llenado
   metía primero el Mirada Verato Night (41,3% de margen y **0 ventas**) y el Al Wataniah (29,2%,
   0 ventas).

**Y las ventas salen de UNA función (`candVentasDe`)** que usan el renglón y el llenado: con dos
copias la tarjeta podía decir 100 y el llenado descartarlo por tener 0.

**La cuenta va aparte de la pantalla (`pedLlenarPlan`)** para poder probarla con la función REAL y
no con una copia — que es la regla de este archivo. Probado con **los 21 productos REALES del pedido
de hoy** y 25 casos: de cero llena 12 productos en US$ 494,30 sin pasarse · el Mercedes sale primero
y el JBL no entra · respeta las unidades ya cargadas a mano · topes de 500/1000, máximos de 1/2/4 y
varas de 0/100/5000 · no se corta en el primero que no entra · y no entran el de 24,9%, el
descartado, el sin precio, el sin ganancia ni el sin margen medido.
**Y una prueba estaba MAL planteada, no el código:** daba por hecho que con la vara en 0 el Verato
Night tenía que entrar, y con tope 500 queda afuera **por presupuesto**. Para medir un filtro hay
que sacar del medio al otro — si no, el resultado no dice cuál de los dos actuó.

## LA ÚLTIMA REVISIÓN ANTES DE GASTAR LOS DÓLARES: `revisarcompra` (19/09/2026)

Pedido suyo: *"tengo que darle la última revisión para estar seguro del pedido, por ejemplo
código, si el costo da, si la publicación puedo publicarla, si el producto es el mismo y todo"*.

**POR QUÉ NO ALCANZABA CON `candidatos`:** ese comando decide QUIÉN entra en la lista y, para no
gastar consultas, **saltea a los que ya tienen la cuenta hecha**. O sea que el margen que muestra
puede ser de anoche — y el precio de ML se mueve: medido, el **Yara Moi pasó de 28,3% a −2,7% en
dos corridas con MINUTOS de diferencia**. Lo que sigue después de mirar esa lista es gastar plata
que no se recupera hasta que llegue la caja, así que acá se vuelve a preguntar TODO sin atajo.

**SOLO LEE.** No escribe, no descarta y no toca ML.

Chequea, producto por producto, y cada renglón termina en ✅ / ⚠️ / ❌:
 · **el código de Nissei** — sin él no se puede pedir, y avisa si empieza con cero (el caso del
   Cruzer Blade, `07112`);
 · **el precio y hace cuánto se cargó**, diciendo que eso **no es** cuándo se miró en
   comprasparaguay — esa fecha todavía no se guarda;
 · **¿es el mismo producto?** — si lo emparejó por código o adivinando por nombre, los DOS títulos
   uno abajo del otro, qué palabras no coinciden y **los números aparte**;
 · **a cuánto se vende hoy**, con los vendedores del exterior sacados y **diciendo cuántos sacó**;
 · **las ventas** contra las dos varas (25 y 100);
 · **el margen de HOY**, con la comisión preguntada a ML a ese precio, y **cuánto se movió** contra
   la medición guardada;
 · **si la podés publicar**: marca frenada y si ya tenés una ficha con nombre parecido.

**LOS NÚMEROS SE COMPARAN APARTE DE LAS PALABRAS, y hacía falta.** En perfumería la misma marca con
otro tamaño es OTRO producto, y en el conteo de palabras eso se diluye. La primera versión pegó
dos veces por lo mismo: **"100ML" es UNA sola palabra para la computadora**, así que hacía coincidir
el **Hamidi Addicted** con el **Hamidi Imensity** (los dos de 100 mL) justo arriba de la mitad, que
era el corte. Separando el número de la unidad, "100" cuenta como número y "ml" se cae por corta.
Y los números de **UN solo dígito cuentan igual**: *"Xiaomi Redmi Watch 4"* contra *"Xiaomi Redmi
Redmi Watch 3"* comparten TODAS las palabras — el único aviso posible es el número. Un número de
más pinta ámbar y nunca descarta: **un aviso de más cuesta una mirada, el producto equivocado
cuesta el pedido.**

**LA CUENTA SALIÓ DE ADENTRO DE `correrCandidatos` Y AHORA ES COMPARTIDA (`cuentaCandidato`).** La
usan el comando que decide la compra y el que la revisa. Con dos copias, **el que revisa diría
"está todo bien" midiendo con una fórmula distinta de la que decidió** — que es el verificador con
la cuenta vieja adentro, el error anotado nueve veces en este archivo.

**LO QUE NO PUEDE CHEQUEAR, y lo dice en vez de callarlo:** si el precio de comprasparaguay sigue
vigente (esa página le contesta **403** al robot, probado dos veces) y las medidas y el peso de lo
que la página no informa. **Publicar en ML lo hace él**: el freno de escritura de ML es contra la
aplicación, no contra su cuenta.

### LA PRIMERA CORRIDA REAL ROMPIÓ EL CHEQUEO DE LOS TÍTULOS, DE LOS DOS LADOS

Pintó en ámbar **DOCE productos de electrónica que estaban perfectos**, con el aviso *"los dos
títulos casi no comparten palabras"*. **La causa no era el producto: comprasparaguay escribe en
PORTUGUÉS** (*"Fone de Ouvido Sony MDR-ZX310AP - Preto"*) **y ML en castellano** (*"Auriculares
Sony MDR-ZX310AP Negro"*). Es el mismo auricular y no comparten casi ninguna palabra. Un aviso que
suena en casi todos entrena a ignorarlo — el mismo problema que el `⚠️ VENDE` de `nomandar`.
**En electrónica la identidad no son las palabras: es el MODELO.** Si `zx310ap` está en el título
de ML, es el mismo producto y no hay nada que mirar; si el candidato trae modelo y ML no lo nombra,
**eso sí** es un aviso fuerte. El código de modelo manda, y las palabras quedan para la perfumería.
De paso se apagó el chequeo de tamaño cuando el modelo coincide: en electrónica el nombre trae las
especificaciones adentro y avisaba por el **3,5 del plug** y por los **220 volts**.

**Y DEL OTRO LADO ERA DEMASIADO FLOJO, QUE ES PEOR.** El corte era *"que coincida menos de la
MITAD de las palabras"*, y con eso **se comía DOS de los seis emparejados equivocados conocidos**:
*"Club de Nuit **Blue Iconic**"* contra *"Club de Nuit **Woman**"* coincide en 4 de 5 palabras
(0,8) y *"Dark Door **Sport**"* contra *"Dark Door **Intense**"* en 2 de 3 (0,67) — **los dos
pasaban limpios, y son exactamente los dos casos reales que ya habían entrado mal en septiembre.**
Ahora avisa si falta **CUALQUIER** palabra que distinga: lo que separa a un perfume de su hermano
es UNA palabra, no la mitad del título.

**Y ESTO CORRIGE ALGO QUE ESTE ARCHIVO AFIRMABA HACE UNA HORA:** decía que la prueba había agarrado
*"los seis emparejados equivocados"*. **Agarraba cuatro.** La prueba miraba el renglón informativo
que lista las palabras que faltan, no el AVISO — o sea que verificaba que el dato estuviera
calculado, no que el comando hiciera algo con él. **Es el verificador que se prueba a sí mismo, otra
variante del mismo error: una prueba que mide la cosa de al lado dice "todo bien" igual.**

Probado con las funciones REALES sacadas del archivo y **23 casos**: los 13 de electrónica de la
corrida real (portugués contra castellano) **no avisan nada** porque el modelo coincide, los seis
emparejados equivocados **sí avisan**, los tres perfumes que sí son el mismo producto no avisan, y
la cuenta da exactamente lo mismo que la que decide la compra, con la barrera de los $33.000
funcionando de los dos lados.

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

### CADA CASILLA CON SU NOMBRE Y QUÉ VA ADENTRO (19/09/2026)

Pedido suyo, mirando la pantalla: *"armalo mejor con nombre de que hay que poner en cada cuadrado"*.

Los seis campos iban en **una sola fila**, con el nombre en letra de **0,57rem** arriba, y al
angostarse la pantalla **los nombres se corrían de su casilla**: el de *"cuántas entran en una
caja"* quedaba arriba de otra. **Un formulario donde no se sabe qué va en cada casilla se llena
mal, y acá llenarlo mal da un margen equivocado con el que se decide una compra.**

Ahora cada campo es una tarjeta con **número, nombre y la explicación A LA VISTA**. Eso último es
lo que más cambia: **toda la ayuda estaba escrita en el `title`**, o sea escondida atrás de pasar
el mouse por encima — **y en el teléfono no hay mouse**. La explicación que hay que leer para no
equivocarse no puede estar oculta.
Se agregó además, en cada una, si es **obligatoria** o si **va vacía** (las cuotas y el % de
reclamos casi siempre van vacíos, y eso no se sabía mirando la pantalla).

**No cambió ninguna cuenta**: los `id` de las ocho casillas son los mismos, así que `simPYCalc`
sigue leyendo exactamente lo de antes. Corrido el chequeo de las tres listas: **0 funciones, 0
variables y 0 `id` de diferencia**, que es lo que corresponde a un cambio que sólo toca cómo se ve.
Probado además con la función REAL sacada del archivo y 19 casos: están las ocho casillas, cada
una con su número, el costo de la caja sale del número de la base, no queda ningún `undefined` ni
ningún `${` sin reemplazar, y los dos casos que hay que avisar —sin dólar cargado y sin ningún
producto de referencia— avisan.

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

## ML FRENÓ LOS CAMBIOS DE PRECIO DE LA APLICACIÓN: 3 DE 3, Y NO ES POR MARCA (19/09/2026)

Pedido suyo con la Tablet Xiaomi Redmi Pad 2 (`MLA1782639641`, Matías): *"bajar pad 2 hasta empatar
caja"*. Se abrió el piso a mano (ver abajo), se calculó todo bien, y **ML rechazó el PUT**:

```
403 · {"code":"PA_UNAUTHORIZED_RESULT_FROM_POLICIES","blocked_by":"PolicyAgent",
       "message":"At least one policy returned UNAUTHORIZED.","status":403}
```

**El precio NO cambió** — releído de ML: sigue en $497.310, y la caja sigue pidiendo $425.741.

**ES EL MISMO ERROR DE LOS DOS PERFUMES DE ADRIANA DEL 18/09, Y ESO CAMBIA EL DIAGNÓSTICO.** Ahí
quedó anotado que *"encaja con lo que ya está abierto —el Bare Vanilla y el reclamo de adulterado,
donde ML pide documentación de esas marcas"*. **Esa explicación ya no se sostiene**: la Pad 2 es una
tablet Xiaomi en OTRA cuenta y otra categoría. Van **3 publicaciones, 2 cuentas y 2 rubros que no
tienen nada que ver**, todas con el mismo 403 de PolicyAgent. No es la marca.

**LO QUE SÍ SE SABE, medido con `tocados:96`:** el robot cambió precios **con éxito el 17/09** —tres
Victoria's Secret de Adriana a las 04:07, 10:06 y 16:58 UTC— y desde entonces no cambió ninguno.
O sea que **el freno apareció entre el 17 y el 18 de septiembre**. Que no haya tocado nada desde
entonces NO es prueba de que esté bloqueado (puede ser que no hiciera falta), pero los 3 intentos
que sí hubo fallaron los 3.

**LA PRUEBA QUE FALTA Y SÓLO LA PUEDE HACER ÉL: cambiarle el precio a UNA publicación A MANO en ML.**
Si lo deja, el bloqueo es contra la aplicación y hay que hablar con ML. Si no lo deja, es una
restricción de la cuenta o de esas publicaciones. **Mientras tanto hay que dar por hecho que el
robot no puede tocar precios**, que es justo lo que hace de noche con la suba automática.

**Y DE PASO SE ARREGLÓ POR QUÉ TARDÓ EN VERSE:** `setPriceTo` devolvía **`ML-403` a secas**, sin el
cuerpo de la respuesta, así que el log decía *"NO se bajó: ML-403"* y no había forma de distinguir
un token vencido de un freno de políticas. `raiseVariations` ya lo hacía bien desde antes — ésta era
la copia que se había quedado atrás. **Un error que no dice el motivo obliga a adivinar, y adivinar
sobre precios es lo que este archivo entero viene tratando de evitar.**

### CONFIRMADO: ML LE CERRÓ LA ESCRITURA A LA APLICACIÓN ENTERA (19/09/2026, de madrugada)

**ÉL HIZO LA PRUEBA QUE FALTABA Y ML SÍ LO DEJA CAMBIAR EL PRECIO A MANO.** O sea que el freno no
es de la cuenta ni de esas publicaciones: **es contra la aplicación**.

**Y NO ES SÓLO EL PRECIO.** Medido con **`probarput:<MLA>[;otra]`** (comando nuevo, **no cambia
nada**: le manda a ML el MISMO precio que la publicación ya tiene, y como segundo intento la MISMA
garantía, que es un campo de texto que no mueve un peso):

| publicación | cuenta | precio | otro campo |
|---|---|---|---|
| Pad 2 `MLA1782639641` | Matías | ❌ 403 | ❌ 403 |
| P47 Cat Ear `MLA3869746828` | Ayelen | ❌ 403 | ❌ 403 |
| Funda Cubre Colchón `MLA1750080409` | Luciana | ❌ 403 | ❌ 403 |
| Filtro agua `MLA1459229525` | Matías | ❌ 403 | ❌ 403 |

**4 publicaciones · 3 cuentas · los dos campos · el mismo `PA_UNAUTHORIZED_RESULT_FROM_POLICIES`.**
Leer sigue andando perfecto (ventas, stock, precios, comisiones): lo único que se cerró es ESCRIBIR.

**LO QUE ESTO ROMPE, Y ES MÁS QUE LOS PRECIOS.** Todo lo que el robot hace escribiendo en ML está
muerto mientras dure, y **ninguna de las tres cosas avisa sola**:
 1. **La suba automática al vender** (`autoSubeVenta`, que él quiere prendida).
 2. **Sacar las promociones** — regla 8, *"SACAR SIEMPRE TODAS LAS PROMOCIONES"*. Es la más cara:
    una promo aplicada le BAJA el precio y el robot ya no la puede sacar.
 3. **Activar las pausadas con stock en Full** (`activarPausadasFull`, su regla del 17/09).

**LO QUE FALTA, Y ES DE ÉL:** entrar al panel de desarrolladores de ML con la cuenta que creó la
aplicación y ver si hay algún aviso, y si hace falta volver a autorizarla. **No se sabe todavía qué
la disparó**: el freno apareció entre el 17 y el 18/09 (`tocados:96` muestra tres cambios con éxito
el 17/09 y ninguno después).

**LA LECCIÓN, y es de las caras: el robot venía fallando en silencio.** Los tres intentos rechazados
salieron porque él pidió tocar un precio a mano; si no, la suba automática seguía "corriendo" todas
las noches sin cambiar nada y nadie se enteraba. **Un automatismo que no puede hacer su trabajo
tiene que gritarlo, no seguir corriendo.**

### EL MOTIVO, ENCONTRADO Y MEDIDO: EL PERMISO DE PUBLICACIONES ESTÁ EN "SÓLO LEE" (20/09/2026)

Pregunta suya: *"hagamos los pasos para arreglar el bot"*. El primer paso era saber **por qué** ML
frena, porque "contra la aplicación" son dos problemas distintos: que la app haya **perdido** el
permiso (lo arregla él en diez minutos) o que lo **tenga** y ML la frene igual (no hay nada que
tocar de este lado). Comando nuevo **`permisos`**, que SOLO LEE.

**LOS PERMISOS DE ML SON DOS SISTEMAS A LA VEZ, Y MIRAR EL VIEJO DA LA RESPUESTA AL REVÉS.** El
viejo es una palabra suelta (`read`, `write`). El nuevo son renglones
`urn:ml:mktp:<para qué>:/read-only` o `/read-write`, uno por cada cosa que se puede hacer. **Manda
el nuevo**: `PolicyAgent` —el que aparece en el 403— mira ESE.

**Lo que devolvió ML, idéntico en las CUATRO cuentas:**

| qué | cómo está |
|---|---|
| **cambiar publicaciones** (precio, título, activar, pausar) · `publish-sync` | ❌ **SÓLO LEE** |
| sacar y poner promociones · `offers` | ✅ escribe |
| contestar preguntas y mensajes · `comunication` | ✅ escribe |
| ventas y envíos · facturación · métricas | sólo lee (y está bien: el robot sólo lee eso) |
| el `write` VIEJO | lo tienen las 4 — **y no sirve de nada** |

**`publish-sync` en sólo lectura explica EXACTAMENTE lo medido**: leer anda perfecto y escribir da
403 en 4 publicaciones de 3 cuentas. No está roto nada del robot ni de las cuentas.

**LA BUENA, Y NO ES MENOR: LAS PROMOCIONES SE PUEDEN SEGUIR SACANDO.** `sacapromos` pega en
`/seller-promotions/...`, que cae bajo `offers`, y ese permiso SÍ escribe. Era lo más caro de dar
por perdido —una promo aplicada BAJA el precio y es la regla 8—. **No está confirmado contra ML**
porque hoy no hay ninguna promo aplicada que sacar (`sacapromos` dio *"0 sacadas · 431 revisadas"*),
así que es una deducción del permiso, no una prueba.

**EL ERROR QUE COMETÍ, Y ES DEL PEOR TIPO: LA PRIMERA VERSIÓN DE `permisos` CONTESTÓ AL REVÉS.**
Miraba el `write` viejo, lo encontró en las 4 cuentas y concluyó, con todas las letras: *"la
aplicación SÍ tiene el permiso de escribir y ML la frena igual; volver a autorizarla NO lo va a
arreglar, hay que reclamárselo a ML"*. **Es falso**, y era el peor lado para equivocarse: lo mandaba
a un reclamo que no hacía falta y le escondía el arreglo, que lo puede hacer él solo.
**Un chequeo que mira el campo equivocado no se calla: contesta con seguridad una cosa que no es** —
y el mío venía con la conclusión escrita al lado, que es justo lo que la hacía creíble. Es la
variante nueva de *"un comentario que promete que algo está cubierto no es prueba de que lo esté"*.
Ahora mira los permisos nuevos y los traduce uno por uno; probado con el texto REAL que devolvió ML
y 4 casos (el de hoy, arreglado por cada uno de los dos caminos, y sin el permiso por ningún lado).

**LOS PASOS PARA ARREGLARLO, y los tiene que hacer él porque son de su cuenta de ML:**
 1. Entrar a **developers.mercadolibre.com.ar** con la cuenta que creó la aplicación → *Mis
    aplicaciones* → la de CYC → editar.
 2. En los permisos (*scopes*), poner **publicaciones / `publish-sync` en lectura Y escritura**.
    Hoy está en sólo lectura. Lo demás se puede dejar como está.
 3. **Volver a autorizar la aplicación en las CUATRO cuentas.** Sin esto no sirve: el permiso
    guardado es el de la última autorización, no el que diga el panel.
 4. Correr **`permisos`** y verificar que las 4 digan *"cambiar publicaciones ✅"*, y después
    **`probarput`** para confirmar contra ML de verdad. **Los dos, no uno**: el panel puede decir
    una cosa y ML otra, que es todo lo que viene pasando.

**OJO CON EL PASO 3: re-autorizar rota los tokens y hay que guardarlos.** ML entrega un código que
se cambia por un token nuevo, y el `refresh_token` viejo deja de servir. Eso lo tiene que hacer el
robot en el momento — si él autoriza y nadie guarda el código, las cuatro cuentas se quedan sin
token y **el robot deja de leer también**, que hoy es lo único que anda. **No arrancar el paso 3 sin
tener eso resuelto primero.**

### ARREGLADO EL 20/09/2026, Y NO HIZO FALTA RE-AUTORIZAR NADA

Él entró al panel de desarrolladores y puso **"Publicación y sincronización"** en **Lectura y
escritura**. Medido inmediatamente después:
 · **`permisos`** → `publish-sync ✅` en las cuatro cuentas.
 · **`probarput`** → **3 publicaciones de 3 cuentas, el precio y el otro campo: los 6 ✅**. ML
   acepta escribir de nuevo.

**LO QUE MÁS SORPRENDIÓ, y hay que anotarlo porque cambia el procedimiento: el permiso nuevo llegó
SOLO, sin volver a autorizar.** Los cuatro pasos escritos arriba daban por hecho que había que
rehacer la autorización en las cuatro cuentas —el paso caro y riesgoso, el que rota los tokens—.
**No hizo falta**: alcanzó con cambiarlo en el panel, y en la renovación siguiente del permiso ML
ya devolvió `publish-sync:/read-write`. **La próxima vez, probar primero y recién después planear
la re-autorización.**

**Y APARECIÓ UN DAÑO AL PASO, que no estaba pedido: él puso "Métricas del negocio" en SIN ACCESO**
(estaba en Lectura). Ahí viven **las VISITAS de cada publicación**, que el robot pide en **seis
lugares** —el chequeo de la mañana, `visitas`, `rematar`, `avisos` y las dos cuentas que deciden
qué bajar—. `permisos` lo confirmó: el permiso **desapareció entero** de las cuatro cuentas
(`metrics ⚠️ no figura`). **Hay que devolverlo a Lectura**; es sólo lectura y no tiene riesgo.
**Lo que NO está medido** es si ML ya lo está rechazando o si todavía contesta por inercia — y no
cambia la decisión, así que no se midió.

**Puso también en escritura Publicidad y Facturación**, que nadie pidió. No rompen nada hoy (no hay
código que escriba ahí) pero **agrandan el daño si algún día se filtra una llave**, que es el motivo
por el que conviene pedir lo mínimo. Queda a decisión suya volverlos atrás.

**La Pad 2 ya está a $425.700**: la bajó ÉL a mano el 19/09, cuando probó si ML lo dejaba. Le quedó
**margen 7,8%** y la caja de compra pasó a **GANANDO**. Está marcada `liquidando`, así que el robot
no se la sube — que es exactamente para lo que se dejó puesta esa marca.

### EL SALDO SÍ SE PUEDE SACAR, Y EL TÍTULO DE ESTA SECCIÓN DECÍA LO CONTRARIO (20/09/2026)

**ESTA SECCIÓN SE LLAMABA *"EL SALDO SIGUE SIN PODERSE LEER"* Y ERA FALSO.** La escribí leyendo el
FINAL de la salida de `probarsaldo2`; arriba, donde no miré, había **TRES endpoints contestando
200**. Es el error anotado cinco veces acá —leer un pedazo y concluir— y esta vez lo cometí yo
sobre el dato que él acababa de llamar *"oro puro"*. Lo destapó él pidiendo agotar las
posibilidades, no un chequeo.

**LO QUE ABRE, medido con `saldo3` (14 puertas · 3 contestan):**

| | |
|---|---|
| **Reporte de liquidación · bajar el archivo** | ✅ **200 · 80.762 caracteres de datos reales** |
| Reporte de liquidación · lista y configuración | ✅ 200 |
| Pagos recibidos (`/v1/payments/search`) | ✅ 200 · con pagos del día |
| `/billing/integration/balance` (con y sin sitio) | ❌ 403 **`PolicyAgent`** |
| las otras 10 (saldo MP, retiros, movimientos, resumen…) | ❌ 403 · 404 |

**Y EL ARCHIVO DE LIQUIDACIÓN TRAE JUSTO LO QUE HACE FALTA.** Sus columnas:
`SOURCE_ID · PAYMENT_METHOD_TYPE · TRANSACTION_TYPE · TRANSACTION_AMOUNT · TRANSACTION_DATE ·
FEE_AMOUNT · SETTLEMENT_DATE · REAL_AMOUNT · TAXES_AMOUNT · BUSINESS_UNIT · SUB_UNIT ·
MONEY_RELEASE_DATE`.
**`MONEY_RELEASE_DATE` es cuándo la plata queda disponible y `REAL_AMOUNT` es cuánto queda neto.**
O sea que el disponible **se calcula**: lo liberado hasta hoy menos los retiros. **El disponible no
sale de un endpoint de "saldo": sale de sumar el reporte.**

**LO QUE FALTA PARA QUE FUNCIONE, y NO es gratis — son decisiones suyas:**
 · el reporte hay que **generarlo** (POST) o dejarlo **programado**: la configuración tiene
   `scheduled`, `frequency` e **`include_withdraw`**. Sin los retiros adentro el número queda alto;
 · hace falta **un punto de partida**: el reporte cubre un rango, no "todo". O se pide una ventana
   larga, o él carga el disponible UNA vez y de ahí en más el robot suma y resta;
 · y **nada de esto se escribió todavía**: `saldo3` SOLO LEE, ni un POST. Generar o programar un
   reporte es escribir en la cuenta de MercadoPago y eso se decide con él.

**LOS DOS 403 SON DE `PolicyAgent`, el MISMO motor que frenaba los precios** — o sea que el
endpoint existe y lo niega un permiso, que es lo contrario de un 404. **Hipótesis NO medida:** el
permiso **"Métricas del negocio"** dice textual *"la información impositiva, **balances** y
reportes de operaciones"* y él lo puso en SIN ACCESO ese mismo día. Devolverlo y reintentar es
gratis; **hasta que se mida, es una sospecha y no un hecho.**

### LOS MÁRGENES NO ESTABAN MAL: LA ALARMA DE AYER ERA UN ARTEFACTO (21/09/2026, de madrugada)

**LA SECCIÓN DE ABAJO DICE QUE "ML SE QUEDÓ ENTRE 6 Y 9 PUNTOS MÁS DE LO QUE EL PANEL CREE" Y ESO
ESTÁ MAL.** Se midió venta por venta con las columnas nuevas y el resultado es el contrario: **el
neto que guarda el panel es el MISMO que el de MercadoPago entre el 95% y el 99,5% de las veces.**
No hay márgenes mal medidos y **no hay ningún precio que tocar por esto.**

| cuenta | órdenes cruzadas | ¿el NETO coincide? | ¿y el bruto? |
|---|---|---|---|
| Adriana | 785 | **781 · 99,5%** | 89,4% |
| Ayelen | 981 | **932 · 95,0%** | 83,5% |
| Luciana | 2.037 | **2.023 · 99,3%** | 88,9% |
| Matías | 989 | **958 · 96,9%** | 87,2% |

**QUÉ ERA LA BRECHA: EL DENOMINADOR, NO LA CUENTA.** Abajo de los $33.000 **el envío lo paga el
COMPRADOR**, así que la operación que cobra MercadoPago vale *producto + envío* y nuestra venta
guarda **sólo el producto**. Con eso el reporte tiene más bruto Y más "lo que ML se quedó", y el
porcentaje sube de mentira. Medido, y el patrón es perfecto en las cuatro cuentas:

| cuenta | bruto del reporte ÷ bruto del panel | la "brecha" abajo de $33.000 | **arriba de $33.000** |
|---|---|---|---|
| Adriana | ×1,025 · abajo ×1,046 · arriba ×1,003 | −4,4 puntos | **−0,3** |
| Ayelen | ×1,155 · abajo ×1,170 · arriba ×1,000 | −14,6 puntos | **−0,0** |
| Luciana | ×1,080 · abajo ×1,092 · arriba ×1,020 | −8,5 puntos | **−0,8** |
| Matías | ×1,038 · abajo ×1,086 · arriba ×1,001 | −7,9 puntos | **−0,0** |

**ARRIBA DE LA BARRERA LA DIFERENCIA ES CERO EN LAS CUATRO.** Arriba de $33.000 el envío es gratis
para el comprador, así que los dos lados suman lo mismo y coinciden clavado. Ése es el dato que lo
cierra: **un error que aparece sólo de un lado de la barrera no es un error de la cuenta — es que
los dos lados no están sumando lo mismo.** Y el tamaño de la brecha sigue al de la proporción del
bruto, cuenta por cuenta: Ayelen tiene la mayor de las dos cosas y Adriana la menor.

**MI HIPÓTESIS ERA OTRA Y TAMBIÉN ESTABA MAL.** Había anotado que el candidato fuerte era el **neto
ESTIMADO** de las ventas que ML todavía no liquidó. Se midió separando por `IS_RELEASED` y da **al
revés**: las **liquidadas** difieren MÁS (−2,6 · −14,0 · −7,5 · −3,9) que las **no liquidadas**
(−0,5 · −9,2 · −4,7 · −1,9). O sea que el neto estimado no explica nada: lo que explica todo es de
qué lado de la barrera está la venta.
**Las retenciones tampoco:** el reporte las abre y son **0,10% a 1,17% de lo vendido**, no nueve
puntos. Los dos candidatos que yo tenía primeros quedaron descartados con números.

**POR QUÉ LA COMPARACIÓN POR MES NO PODÍA VER ESTO, y vale como método:** mezclaba tres cosas
—ventas que un lado tiene y el otro no, el recorte de la ventana del reporte, y el envío del
comprador— y las tres tiran para el mismo lado. Recién cruzando **la misma orden en los dos lados**
se puede preguntar *"¿el neto es el mismo?"*, que es la única pregunta que decide si un margen está
bien. **La clave la dio `ORDER_ID`, una columna que estaba ahí y nadie había tildado.**

**¿LE FALTAN VENTAS AL PANEL? SÍ, ENTRE 0,5% Y 1,6%, Y ES LO ÚNICO DE TODO ESTO QUE ES PLATA.**
De las órdenes que el reporte tiene y el panel no, la mayoría se explica sola —canceladas que el
panel conoce, órdenes con devolución o disputa, y órdenes que no mueven plata—. Lo que queda:

| cuenta | el panel no tiene | **sin explicar** | sobre lo vendido |
|---|---|---|---|
| Ayelen | 182 | **77** | **1,6%** |
| Luciana | 314 | **117** | **1,0%** |
| Matías | 275 | **55** | **0,5%** |

**No es una emergencia y tampoco es cero**, y hay que mirarlas de a una con el número de orden, que
ahora existe. (Adriana quedó afuera del tramo de registro que se leyó.)

**EL DESGLOSE NO CERRABA Y LO AGARRÉ LEYÉNDOLO, NO EL CÓDIGO.** La primera versión imprimió
*"de las 182: 7 canceladas · 0 anteriores · 77 sin explicar"* — que suma **84**. Las otras 98 se
iban por un `continue` callado, adentro del chequeo escrito justo para detectar descartes
silenciosos. **Es el error anotado de punta a punta en este archivo, cometido en el verificador.**
Ahora cada salida se cuenta y la suma se compara contra el total: si no cierra, lo dice.

**LO QUE QUEDA ABIERTO, y es chico:**
 · **entre el 0,5% y el 5% de las órdenes el neto NO coincide** (Ayelen es la peor, 49 de 981). No
   se miró todavía de a una; con la clave puesta, ahora se puede.
 · **el ×0,54 de agosto en Matías** que quedó anotado abajo es de la comparación por mes, o sea de
   lo mismo que acabó siendo un artefacto. Se vuelve a mirar con la clave, no con el total.

**LA LECCIÓN, y es una variante nueva de la de siempre:** el chequeo del 20/09 ya avisaba que los
dos lados no miraban la misma plata (la proporción ×0,54, ×0,90) y **aun así yo saqué una
conclusión del porcentaje**. El freno estaba puesto, imprimía lo correcto, y lo leí igual. **Un
aviso que uno mismo escribió no protege de nada si después se lee el número de al lado.**
Y la segunda: **cuando dos sistemas miden "lo mismo" y difieren, antes de buscar el error hay que
preguntar qué mete cada uno adentro del número.** Acá uno contaba el envío del comprador y el otro
no, y eso solo explicaba toda la diferencia.

### LOS MÁRGENES CONTRA LA REALIDAD: 8 PUNTOS DE DIFERENCIA — ⚠️ DESMENTIDO, VER ARRIBA (21/09/2026)

Pedido suyo: *"fijate todo, si los márgenes dan bien (…) hacé un análisis profundo"*. El comando es
**`realml[:cuenta]`** y **SOLO LEE**. Compara lo que el panel CALCULA que ML se queda contra lo que
Mercado Pago se quedó **de verdad**, según el reporte de liquidación.

**LA COMPARACIÓN ES POR CUENTA Y POR MES, NO FILA POR FILA, y no es pereza.** Queda escrito por qué
para no volver a intentarlo:
 · **falta la clave.** La venta guarda `saleId` y `numVenta` —los de MercadoLibre— y **nunca el id
   de PAGO de MercadoPago**. Y que `SOURCE_ID` del reporte sea ese id **es una suposición que nadie
   midió**: no aparece en ningún renglón de código, sólo en una nota de este archivo.
 · **`mlfee` y `FEE_AMOUNT` no son lo mismo.** `mlfee` junta todos los cargos con el **envío de Full
   ADENTRO**; en el reporte el envío es un renglón aparte (`SETTLEMENT_SHIPPING`). Compararlos daría
   una brecha del tamaño del envío **y sólo arriba de los $33.000** — la forma EXACTA del agujero
   del 17/09. Saldría como hallazgo y sería un artefacto.
 · **en un carrito el `mlfee` guardado es una FRACCIÓN**, repartida por lo que vale cada producto y
   redondeada por renglón (el bug de los Ferrari del 08/09).
Por eso se compara **todo lo que ML se quedó** (`TRANSACTION_AMOUNT − REAL_AMOUNT` contra
`total − neto`): los dos lados llevan el envío adentro, así que esa brecha no existe.

**LA PRIMERA CORRIDA DIO UNA BOMBA FALSA Y EL CHEQUEO QUE HIZO FALTA SALIÓ DE AHÍ.** Decía
*"ML se quedó el **73,5%**"* en Matías en agosto. **Es imposible**: con eso habría vendido a pérdida
todo el mes y se habría dado cuenta. La pista estaba en la misma salida —313 filas contra 217
ventas—, así que ahora imprime **la proporción entre lo vendido que ve cada lado**. Si no da cerca
de 1, los dos no están mirando la misma plata y el porcentaje **no sirve**, y el renglón lo dice con
esas palabras en vez de dejar el número solo. **Un número que parece una bomba merece la misma
desconfianza que un cero que parece una buena noticia.**

**LO MEDIDO EN MATÍAS, y el chequeo separa lo que vale de lo que no:**

| mes | proporción | ¿sirve? | real vs panel |
|---|---|---|---|
| 2026-06 | ×0,33 | ❌ el reporte arranca el 22/06 | — |
| **2026-07** | **×0,90** | ✅ | **38,3% contra 29,3% · −8,9 puntos** |
| 2026-08 | ×0,54 | ❌ | (el 73,5% era esto) |
| **2026-09** | **×0,87** | ✅ | **39,5% contra 33,2% · −6,3 puntos** |

**EN LOS DOS MESES QUE SÍ SE PUEDEN COMPARAR, ML SE QUEDÓ ENTRE 6 Y 9 PUNTOS MÁS DE LO QUE EL PANEL
CREE.** Y va para el lado peligroso: **los márgenes se ven más cómodos de lo que son.** Sobre lo
facturado eso es mucha plata.

**NO ESTÁ CERRADO Y NO HAY QUE TOCAR NINGÚN PRECIO CON ESTO TODAVÍA.** Lo que falta medir, en orden:
 1. **Las retenciones.** `mlfee` excluye a propósito los `tax_withholding` (SIRTAC y compañía) y el
    reporte los trae adentro de `TAXES_AMOUNT`. Es el primer candidato y explica una parte, no las
    nueve.
 2. **Por qué en agosto el panel ve la mitad de lo vendido que el reporte** (×0,54). Eso puede ser
    un problema más grande que el de los márgenes: si al panel le faltan ventas, falta ganancia.
 3. **Las ventas con neto ESTIMADO.** Cuando ML no liquidó todavía, el neto sale de un respaldo —
    y **eso no queda marcado en la venta**, así que hoy no se pueden separar. Marcarlo es un campo.

**Lo que el comando NO puede ver, y lo dice en vez de callarlo:** el IIBB y el monotributo no están
ni en el neto ni en el reporte (ML los factura a fin de mes), así que **no** explican esta brecha —
esos ya se descuentan aparte en el margen.

**Se compara en PORCENTAJE y no en pesos**, por dos motivos que van juntos: el registro de GitHub es
público, y los dos lados no cubren exactamente las mismas ventas. Un porcentaje aguanta que las
bases no sean idénticas; una resta de totales, no.

### A QUÉ % HAY QUE BAJAR PARA GANAR LA CAJA, EN ROTACIÓN DE STOCK (21/09/2026)

Pedido suyo mirando el Xiaomi Watch S5: *"se puede agregar ahi? que ponga a que % hay que bajarlo
para ganar caja. a todos los productos"*.

**EL DATO YA ESTABA GUARDADO Y VIVÍA ESCONDIDO EN EL GLOBITO.** El robot escribe el precio que pide
ML en `cyc/mllinks/<MLA>/cajaPtw` una vez por hora, pero la pantalla sólo lo mostraba al pasar el
mouse por encima, renglón por renglón — **y en el teléfono no hay mouse**. Es el mismo error de la
ayuda del simulador del 19/09: el dato que decide no puede estar tapado. Es la variante del "dato
medido que no se guardaba" del 19/09, sólo que acá se guardaba y no se mostraba.

**EL % DE BAJA SOLO NO SE MUESTRA NUNCA.** Es la lección del Filtro agua del 14/09: ML dice a qué
precio se GANA la caja, no a qué precio queda ganancia — ese día el aviso decía *"se gana a $1.000"*
y la mercadería sola costaba $1.059. Por eso el renglón lleva **siempre los dos números**:

| |  |
|---|---|
| llega al piso | `bajar 16% → $372.722` · **queda en 31%** en VERDE |
| no llega | idem · **quedás en 6% ✕** en ROJO |
| sin margen medido | dice *"margen sin medir"*, nunca un número inventado |
| el precio de ML ya está abajo del tuyo | *"no es cuestión de bajar"* — el dato es de hace una hora o la caja se pierde por otra cosa |

**NO ES UNA CUENTA NUEVA:** `cajaBajarDe` usa `comisionEnPrecio` (la comisión de ML al precio nuevo,
la misma de los dos simuladores) y `simMargen` (la línea del dinero, la misma de `margenMLDe`).
**Probado con las funciones REALES sacadas del archivo:** al MISMO precio da EXACTAMENTE el mismo
margen que la ficha en los 5 casos (30,14% contra 30,14%), que es la forma de saber que no es una
copia que se va a separar. Y el cruce contra ML: `unapub:MLA3550882216:23` dio **6,5%** al precio de
la caja y la columna da lo mismo.

**LO QUE COBRA FULL NO SE TOCA**, aunque el precio nuevo cruce para abajo los $33.000 y ahí ML deje
de cobrarlo. Mantenerlo hace ver el margen MENOR que el real, que es el lado seguro cuando el número
decide si se baja un precio. Se avisa en el globito para que no sorprenda.

**Y ENTRAN LAS QUE COMPARTEN LA CAJA**, no sólo las que la pierden: compartir no es ganar —ML
reparte las ventas con otro— y ML informa igual a qué precio se gana entera. Dejarlas afuera
escondía justo el caso en que falta poquito. El producto que tiene **alguna** publicación ganando no
muestra nada: ahí no hay nada que bajar.

Probado con 21 casos de la cuenta y 16 del renglón. Chequeo de las tres listas más las clases de
CSS: **0 funciones, 0 variables, 0 `id` y 0 clases de diferencia**; sólo lo que se agregó.

**EL WATCH S5, QUE ES EL QUE LO DISPARÓ:** `MLA3550882216` (Matías) está a $445.120 con 24,3% y ML
pide **$372.722** para ganar la caja, o sea bajar 16%. **A ese precio el margen cae a 6,5%** — muy
abajo del piso. **No conviene pelearla.** Hay una segunda publicación del mismo reloj
(`MLA3535547790`, $449.530) que **nunca vendió**, así que no tiene margen medido.

### EL CUPO PARA MANDAR A FULL NO SALE POR LA API (21/09/2026)

Pregunta suya: *"la api te dice cuantas unidades puedo enviar a full? o sea el cupo que tengo para
enviar?"*. **No.**

Medido leyendo la documentación de ML con `apidoc`: la página entera de Envíos Fulfillment
documenta **TRES direcciones y nada más** —el stock que ya está adentro
(`/inventories/<id>/stock/fulfillment`), los movimientos de un inventario y la búsqueda de
movimientos (`/stock/fulfillment/operations/search`)—. **Ninguna dice cuánto se puede mandar.**
Se suma a lo ya medido el 20/08: las 7 direcciones de "envíos entrantes" fallan en las 4 cuentas.

**OJO CON UNA QUE SE LLAMA PARECIDO Y ES OTRA COSA: la "capacidad de envío" de la API es de FLEX**
—cuántos paquetes despachás VOS por día desde tu casa, con su `capacity_max`— y no tiene nada que
ver con el cupo de Full. Es exactamente el error anotado el 17/09 con los catálogos: **dos cosas no
se distinguen por cómo se llaman.** Dar ese número como si fuera el cupo de Full sería darle un
número que no es el que mira.

**Y EL BARRIDO SE CORRIÓ EL MISMO DÍA, así que esto ya NO es una deducción de la documentación:
`cupofull` probó 14 direcciones × 4 cuentas = 56 intentos.** De 56, **contestaron 4 — y las 4 son
la MISMA dirección**: `/users/<id>/shipping_preferences`, o sea la configuración de envíos, que
trae los modos de logística y **ningún número de capacidad**. Las 14 de cupo fallaron en las
cuatro cuentas: **36 con 404** y **20 que ni siquiera son rutas de la API** (devuelven una página
web, que no es lo mismo que un 404 y por eso se distinguen).
Se probaron las de capacidad por vendedor (`/users/<id>/stock/fulfillment/capacity`,
`/stock/fulfillment/inbound/capacity`, `/inbound/limits`, `/fbm/capacity`, `/marketplace/...`), las
de "cuánto conviene reponer" según ML (`restock`, `inbound/recommendations`), la del sitio
(`/sites/MLA/fulfillment/capacity`) y las dos por inventario, con un `inventory_id` REAL de Full en
cada cuenta —sin él dan 400 y el resultado no valdría nada, que es lo que pasó con
`operations/search` en el probe de inbound—.
**El cupo de Full queda CERRADO. No se vuelve a probar sin un dato nuevo.**

**Y DE PASO SE ARREGLÓ `apidoc`, QUE DEVOLVÍA CERO EN LA DOCUMENTACIÓN DE ML.** El patrón sólo
miraba `/v1/…` y `/v2/…`, que es como escribe MercadoPago; las de MercadoLibre no llevan versión
adelante (`/items/…`, `/inventories/…`). O sea que un barrido de la documentación de ML habría
devuelto **cero rutas, y un cero ahí se lee como "no existe el endpoint"** — el error anotado de
punta a punta en este archivo, en el comando hecho justamente para no cometerlo.
Las raíces se listan a propósito en vez de aceptar cualquier `/palabra/`: si no, entra cada pedazo
de URL de la página. Probado con un texto que mezcla las dos formas: salen las 5 rutas esperadas
con su verbo y el link de la página NO entra.

### LA AGENDA YA SE VE EN EL ARQUEO, Y SE ACTUALIZA SOLA (21/09/2026)

En Finanzas, abajo de las cuatro tarjetas y arriba de todo lo que se carga a mano (la regla del
26/08), está **"Se libera de ML"**: hoy · mañana · 7 días · todo lo pendiente, en dólares y con los
pesos en chiquito al lado —lo que él pidió el 20/09—, más una barra por día.

**Y EL ARREGLO QUE SALIÓ DE MAPEAR ANTES DE ESCRIBIR, que es el que más valía:** `saldoml` sólo
existía adentro de `BILLING_PROBE`, o sea que la agenda se actualizaba **únicamente cuando alguien
lo corría a mano** — y cada corrida a mano MATA el ciclo de 2 minutos. **El estado normal de ese
número iba a ser estar viejo.** Ahora corre solo en `ml-daily`, todas las noches.

**Cuatro decisiones que no son de forma:**
 · **los días que YA pasaron no se cuentan como "va a entrar" ni se esconden**: se dicen aparte,
   porque esa plata ya está en el disponible;
 · **no se muestra cuando se mira un mes CERRADO**, y **la agenda NO entra en el cierre del mes**:
   es una lista de días futuros, adentro de un cierre no quiere decir nada y sería la misma plata
   guardada en dos lugares;
 · **sin tipo de cambio no se inventa la conversión** a pesos: no se muestran;
 · **avisa en ámbar** si la agenda tiene 2 días o más.

**LA PRUEBA AGARRÓ UN AGUJERO REAL ANTES DE SUBIR:** una fecha imposible como `2026-13-99` pasaba el
patrón de "cuatro-dos-dos" y **sumaba plata en un día que no existe**. Ahora se comprueba que la
fecha vuelva igual al parsearla, y un `null` se descarta en vez de contarse como cero. Probado con
las funciones REALES sacadas del archivo y 22 casos.

### LA APLICACIÓN PROPIA DE MERCADO PAGO: CREADA, MEDIDA TRES VECES, NO APORTA NADA (21/09/2026)

Él la creó entero a mano (*"voy a intentar ingresar en mi cuenta y hacer app de mercadopago,
guiame"*). Quedó bien hecha: **Checkout API · API de Payments · cuenta de Matías**, con las
credenciales de PRODUCCIÓN, y el Access Token entra por el secreto **`MP_TOKEN_MATIAS`** de GitHub
(nunca por el chat: esa llave **no vence sola y puede mover plata**).

**LO PRIMERO QUE MIRA `mptoken` ES DE QUIÉN ES LA LLAVE**, comparándola contra el id guardado e
imprimiendo ✓ o ✗, nunca el número. Las cuatro cuentas son de la misma familia y crear la
aplicación con la equivocada deja todo lo demás sin significado. Dio ✓.

**RESULTADO, en tres mediciones: hace EXACTAMENTE lo mismo que la llave de MercadoLibre.**

| | con la llave de ML | con la de MP |
|---|---|---|
| las 4 puertas del saldo | ❌ 403 / 404 | ❌ **igual** |
| reportes y pagos recibidos | ✅ | ✅ igual |
| pedir el reporte de saldo en cuenta | ❌ 404 | ❌ **igual** |

**No se borró todavía**, decisión suya (*"no tomemos decisiones apresuradas"*) y tenía razón: yo
dije "borrala" **antes** de probarla para ESCRIBIR, que era lo único que faltaba. Se borra cuando
cierre el tema. Lo que sí queda medido es que **para esto no servía**, y la documentación de
MercadoPago lo dice: la puerta del saldo contesta *"Public access not allowed"* — está reservada y
no se le da a ninguna aplicación común. El reporte de "Dinero disponible" lo dieron de baja en
marzo de 2022.

### EL EXTRACTO DE CUENTA ES EL BUENO, Y SE BAJA A MANO (21/09/2026)

Él creó el reporte y mandó el archivo. **La deducción de la sección de abajo —"los dos que fallan
son los dos sin configuración"— quedó DESMENTIDA**, y eso es justo para lo que estaba escrita así:
`saldocuenta`, corrido después de que él lo creara, sigue contestando `config_not_found_for_user`
en las **cuatro** y la lista sigue **vacía**. O sea que el "Extracto de cuenta" del panel **NO es
el `bank_report` de la API**: mismo formato de columnas, otro lugar.
**Y no hay ninguna otra puerta:** `extracto` (comando nuevo, solo lee) probó **32** —la lista de
`bank_report` paginada, `account_statement`, `statement`, `reports/…`, `account_movements`— y
**ninguna** trajo un archivo con el saldo adentro. **El extracto lo baja ÉL del panel, a mano.**
El reconocimiento no fue por el nombre del endpoint sino por las COLUMNAS, a propósito: un 200 no
prueba nada, ya mordió con la página que devolvía un cascarón vacío.

**EL ARCHIVO ES EXACTAMENTE LO QUE HACÍA FALTA, y cierra al peso.** Trae `INITIAL_BALANCE`,
`FINAL_BALANCE` y un `PARTIAL_BALANCE` **fila por fila**: el saldo de verdad, no uno deducido.
Medido contra el de julio: **los 652 movimientos encadenan sin un solo desvío** y el último saldo
parcial coincide clavado con el final. No hace falta ningún punto de partida cargado a mano.

**Y TRAE LO QUE EL REPORTE DE LIQUIDACIÓN NO VE — ESTO CORRIGE UN NÚMERO DE ESTE ARCHIVO.** De los
652, **144 no aparecen en el de liquidación**: transferencias a proveedores, la tarjeta, los
peajes, los débitos de deuda de ML y los rendimientos. La nota de abajo dice que lo que faltaba
eran *"~$2.200.000 por mes"*; en julio, en UNA sola cuenta, son **$8,8 millones netos**. O sea que
la cuenta "ancla + liquidaciones" **no se iba desviando de a poco: se despegaba millones por mes**.
La estimación vieja salió de la factura mensual de ML y nunca contó la plata que sale por fuera de
ML, que es la mayor parte.

**OJO: ESE ARCHIVO TIENE NOMBRES Y APELLIDOS DE TERCEROS ADENTRO** (proveedores y familia, en cada
transferencia). **No va al repo ni a ningún archivo**, y ningún probe lo imprime. Es el mismo dato
que obligó a borrar `recibidas.json` el 15/09.

### LAS SIETE COLUMNAS QUE ABREN LA COMPARACIÓN VENTA POR VENTA (21/09/2026)

`realml` compara por cuenta y por MES, y la sección de abajo deja escrito por qué fila por fila era
imposible. **Dos de esos tres motivos se resuelven con columnas que el reporte SÍ tiene y nadie
había tildado.** Él las tildó en el panel de MercadoPago:

| columna | qué destraba |
|---|---|
| `ORDER_ID` · `PACK_ID` | **la clave.** La venta guarda `saleId`/`numVenta` —de ML— y el reporte no traía ninguno de los dos. Sin clave no hay cruce. |
| `SHIPPING_FEE_AMOUNT` · `MKP_FEE_AMOUNT` | separan el envío de la comisión. Sin eso la brecha daba el tamaño del envío **y sólo arriba de los $33.000** — la forma exacta del agujero del 17/09: habría salido como hallazgo siendo un artefacto. |
| `TAXES_DISAGGREGATED` · `TAX_DETAIL` | las retenciones, una por una. **Se pidieron las DOS** porque por el nombre no se puede saber cuál trae los números y cuál el texto, y tildar la de más sale cero |
| `IS_RELEASED` | si el neto de esa venta es real o todavía estimado |

**NO SE PIDIÓ NINGUNA COLUMNA CON DATOS DEL COMPRADOR** (nombre, documento, tarjeta, últimos 4
dígitos, número de autorización). El robot baja este archivo en un lugar público. `columnas` avisa
fuerte si alguna aparece.

**AGREGAR COLUMNAS NO ROMPE NADA, y se verificó ANTES de pedírselas:** todos los lugares que leen
este CSV buscan por NOMBRE (`cols.indexOf('REAL_AMOUNT')`), nunca por posición.

**SE VERIFICÓ CUENTA POR CUENTA Y HICIERON FALTA TRES VUELTAS.** `columnas` (solo lee) midió, en
cada tanda, una cuenta distinta incompleta: primero **Ayelen sin `SHIPPING_FEE_AMOUNT`**, después
**Adriana y Luciana sin `TAX_DETAIL`**, y recién en la tercera **4 de 4**. Las cuatro quedaron con
`scheduled:true`, `include_withdraw:true` y frecuencia diaria.
**Un cambio hecho a mano en cuatro pantallas iguales se equivoca en alguna, y nunca en la misma.**
La única forma de saberlo es mirar las cuatro, cada vez — dar por hecho que "ya las tildó todas"
porque tildó las anteriores habría dejado dos cuentas sin el dato de impuestos, y el hueco recién
se iba a notar al comparar los márgenes, o sea cuando el número ya decide precios.

**Y LA CONFIGURACIÓN NO ES EL ARCHIVO.** Los reportes ya generados siguen con las columnas viejas
—los que había eran del 24/07— y eso NO es una falla: la configuración es lo que va a tener el
PRÓXIMO. `columnas` mira las dos cosas por separado y lo dice, para que un archivo viejo no se lea
como que el cambio no quedó.

**EL CANDIDATO A EXPLICAR LOS 6 A 9 PUNTOS CAMBIÓ, y hay que anotarlo porque yo lo tenía al revés.**
La nota de arriba pone a las retenciones primero. Mirando `orderNet`, **las retenciones ya están
adentro del neto que guardamos** (`net_received_amount` es neto de todo), así que no explican la
brecha. Lo que sí la explica en dirección y en signo es **el neto ESTIMADO**: cuando ML todavía no
liquidó, el neto sale del respaldo (precio − comisión), que **no descuenta las retenciones** — o
sea que esas ventas se ven **mejores de lo que son**. `IS_RELEASED` es exactamente la columna que
lo separa, y la pedí por otro motivo. **Sigue siendo una hipótesis: no se toca ningún precio hasta
medirla.**

### EL SALDO NO SE LEE, PERO HAY UN REPORTE QUE LO TRAE — Y SE CREA A MANO (21/09/2026)

**EL ERROR DEL DÍA, Y ES EL ANOTADO DIEZ VECES ACÁ.** En la corrida de `mptoken`,
`/v1/account/bank_report/config` contestó **404 `config_not_found_for_user`** y yo lo conté junto a
los 404 de *"este recurso no existe"*. **No es lo mismo:** ese 404 dice que la puerta existe y que
la cuenta **todavía no tiene armada la configuración**. Lo di por cerrado sobre el dato que abría
o cerraba el tema. Lo destapó él preguntando *"¿seguro que no?"*.

**Medido con `saldocuenta` (solo lee): la puerta está ABIERTA en las CUATRO cuentas** —
`/bank_report/list` contesta 200 con el token de siempre.

**Y APARECIÓ EL PATRÓN QUE LO EXPLICA TODO:**

| reporte | ¿tiene configuración? | ¿se puede pedir por robot? |
|---|---|---|
| Liquidación (el que ya usamos) | **sí** | ✅ |
| Saldo en cuenta (`bank_report`) | no | ❌ 404 |
| Liberaciones (`release_report`) | no | ❌ 400 |

Los dos que fallan son **exactamente** los dos sin configuración. Es una deducción, no una
certeza, y se comprueba sola en cuanto él la cree.

**LO QUE TIENE QUE HACER ÉL, UNA SOLA VEZ:** Mercado Pago → **Informes y facturación** →
**Reportes de ventas y extractos de cuenta** → **Todas las transacciones** → **Crear reporte**, y
si ofrece frecuencia, **diaria**. Ese reporte trae entre sus tipos de renglón
**`initial_available_balance`**: o sea **el disponible de verdad**, no una cuenta deducida. Con eso
se termina el punto de partida cargado a mano y su recarga mensual.
**LO HIZO EL 21/09 Y NO ALCANZÓ**: el reporte se crea y se baja bien desde el panel, pero la API
sigue sin verlo. Ver la sección de arriba — el extracto se baja a mano y punto.

**`PROGRAMARLO` SÍ SE PUEDE POR API — YO ESTABA GOLPEANDO LA PUERTA EQUIVOCADA (21/09/2026).**
El barrido de la documentación con `apidoc` encontró **`POST /v1/account/settlement_report/schedule`**
y su `DELETE`, dos endpoints que **nunca probé**. La frase que estaba acá —*"programarlo tampoco se
puede por API"*— salió de mandar `scheduled:true` DENTRO de la configuración, que es otra cosa.
**No lo busqué en la documentación: lo deduje de un intento fallido.**
Hoy no cambia nada práctico (él lo programó a mano desde el panel y quedó andando en las cuatro),
pero la conclusión era falsa. **La lección: "no se puede" sólo se escribe después de leer la
documentación, no después de que falle el primer intento.**

**LO QUE SÍ QUEDÓ BIEN DE ESA CORRIDA, Y ES EL CHEQUEO DE RELEER.** `diario:go` mandó
`scheduled:true` en las cuatro, **MercadoPago aceptó sin error** y al releer seguía en `false`: lo
ignora en silencio. Sin la relectura obligatoria (regla 6) el comando habría cantado "listo" cuatro
veces sobre algo que no pasó. **Aceptar no es haber hecho.**
De paso quedó medido que **la frecuencia YA es diaria** en las cuatro
(`{"format":"CSV","hour":0,"type":"daily","value":null}`): lo único apagado es `scheduled`. La
primera versión iba a mandar `value:1` y `hour:6` inventados por mí y habría pisado una forma que
MercadoPago ya usa. **Se mide primero y se cambia UN campo.**

**UN 400 DE "TE FALTA UN PARÁMETRO" ES UNA PUERTA ABIERTA, NO UN FRACASO.** De 13 puertas probadas
en `saldo4`, doce dieron 404 o 403 y **una** dio *"Must specify begin_date parameter"*. Contarla
entre los fracasos habría cerrado el único camino que quedaba. Se probó en `saldo5` con tres
formas de mandar las fechas: las tres dieron lo mismo, y eso es lo que destapó el patrón de la
configuración faltante.

**El saldo directo queda CERRADO, ahora sí con ~30 puertas medidas** (`probarsaldo`, `probarsaldo2`,
`saldo3`, `saldobill`, `mptoken`, `saldo4`, `saldo5`). No se vuelve a probar sin un dato nuevo.

### LA AGENDA: CUÁNTA PLATA SE LIBERA CADA DÍA (21/09/2026)

Pedido suyo: *"yo te voy a preguntar cuánto hay disponible, cuánto va a haber disponible mañana"*.

Vive en **`cyc/finanzas/agenda`** (`{dias: {'AAAA-MM-DD': dólares}}`) y la arma **`saldoml`**, con
el **MISMO archivo y el MISMO recorrido** con el que calcula "A liquidar en ML". No es un comando
aparte a propósito: es la misma plata, abierta por día en vez de sumada, y con dos copias los días
sumarían distinto del total que está al lado — el error anotado nueve veces acá.

**El día se toma con el huso de acá (−03:00), no en UTC.** Si no, todo lo que se libera después de
las 21:00 se anotaría al día siguiente y la respuesta a *"¿cuánto entra mañana?"* saldría corrida
justo en las horas de más movimiento.

**Va bajo los MISMOS frenos que el total**: si falta una cuenta o la cuenta no cierra contra las
ventas, no se escribe. Una agenda incompleta es peor que ninguna — un día que dice de menos le hace
postergar una compra que sí podía hacer.

**Pendiente: mostrarla en el Arqueo**, que es donde la va a mirar.

### PARA QUÉ SIRVEN LOS MOVIMIENTOS, MÁS ALLÁ DEL SALDO

Pregunta suya. El reporte trae, venta por venta, **lo que Mercado Pago se quedó de verdad**
(`FEE_AMOUNT`, `TAXES_AMOUNT`), **los retiros**, **las devoluciones y contracargos con su costo
real** y **la fecha exacta de liberación**. De ahí salen tres cosas, en orden de lo que valen:

1. **La agenda de plata que entra** (hecha) — para decidir cuándo comprar.
2. **Chequear los márgenes contra la realidad.** Hoy el panel CALCULA lo que ML descuenta; esto
   dice lo que descontó. Si no coinciden, hay márgenes mal medidos. **No está hecho, y es el que
   más plata puede destapar.**
3. **Las devoluciones con su costo en pesos**, en vez de contarlas como cantidad.

**Y EL LÍMITE QUE NO SE VA A IR SOLO, PORQUE ÉL PREGUNTÓ JUSTO ESO** (*"eso se actualiza muchas
veces durante el día"*): **no**. MercadoPago entrega el reporte **hasta el último día CERRADO**.
Aunque el robot pregunte cada dos minutos, la respuesta sigue siendo la de ayer. Su razonamiento
sobre el mecanismo —ancla + entradas y salidas— es exactamente el que está construido; lo que no se
puede es el "muchas veces por día". **Por eso el reporte de saldo en cuenta importa: trae el número
real y corrige solo el desvío**, que hoy se tapa recargando el ancla una vez por mes.

### EL DISPONIBLE DE ML: ÉL PONE EL PUNTO DE PARTIDA, EL ROBOT LO MANTIENE (20/09/2026)

Pedido suyo: *"si te digo cuánto hay, no podés tomar eso y ya después lo seguís vos?"*, y la vara:
*"lo que más me interesa es que el saldo de MP sea correcto en la web de CYC. después los
movimientos no me interesan tanto."*

**ML NO DEJA LEER EL SALDO, Y ESO QUEDÓ CERRADO EL MISMO DÍA.** `/billing/integration/balance` da
**403 de PolicyAgent**, y la sospecha de que lo tapaba el permiso *"Métricas del negocio"* quedó
**descartada**: él lo devolvió a Lectura y `saldobill` midió **403 limpio en Adriana, Ayelen y
Luciana, en las dos variantes de la dirección**. (Matías dio 429 las dos veces, o sea que ahí no se
midió; no cambia la conclusión porque los permisos de la aplicación son idénticos en las cuatro.)

**Entonces se hace al revés:** él escribe el disponible de cada cuenta en el Arqueo, **eso queda
como punto de partida con su fecha** (`cyc/saldoancla/<cuenta>`), y el robot le suma y le resta lo
que pasa después. El comando es **`dispo[:go]`**.

### LA CUENTA SALIÓ MÁS SIMPLE DE LO QUE PARECÍA, Y LO DECIDIÓ LA MEDICIÓN

`disponible = punto de partida + la suma de REAL_AMOUNT de TODAS las filas posteriores`

**No se clasifica por tipo de movimiento, y es a propósito.** `medirsaldo` mostró que `REAL_AMOUNT`
**ya trae su propio signo**: los retiros vienen negativos, las devoluciones negativas, y las
disputas salen positivas o negativas según cómo se resolvieron. Sumar todo derecho es correcto **y
además aguanta lo que no conocemos**: en esa misma corrida apareció un tipo que el código no
conocía (**`SHIPPING`**). Con una lista de tipos ése se habría caído en silencio; sumando todo,
entra solo.

**LO QUE LA MEDICIÓN DESTAPÓ Y HABRÍA ROTO EL NÚMERO: los 93 RETIROS de las cuatro cuentas vienen
SIN `MONEY_RELEASE_DATE`.** Es lógico —un retiro no se "libera", es plata que sale— y la primera
fórmula fechaba todo por esa columna: **se los salteaba enteros y el disponible no habría bajado
NUNCA.** Los 93 sí traen fecha de movimiento y de acreditación, así que `fechaMov` cae a ésas en
orden; si no hay ninguna de las tres devuelve `null` y la fila **se cuenta aparte**, no suma cero
callada.
**Es exactamente el caso que la nota vieja daba por sabido sin haberlo mirado.**

**LOS FRENOS, y cada uno tapa algo medido:**
 · **el punto de partida tiene que estar DENTRO de la ventana del reporte.** Si es más viejo,
   faltan movimientos del medio: no se escribe y se pide el número de nuevo.
 · **las CUATRO cuentas o ninguna** — `mp_disp` es la suma y es la que entra al patrimonio.
 · **sin tipo de cambio no se escribe**: el Arqueo está en DÓLARES y el reporte en PESOS.
 · las filas ilegibles **se cuentan y se avisan**.

**EL PUNTO DE PARTIDA SE GUARDA EN PESOS, no en dólares.** La casilla está en dólares —todo el
Arqueo lo está— pero los movimientos vienen en pesos: si el ancla quedara en dólares, **cada
movimiento del tipo de cambio movería el saldo de una cuenta bancaria que no se movió**. Se
convierte UNA vez, con el cambio del día en que lo escribe.

**LO QUE NO TAPA NINGÚN FRENO Y HAY QUE TENER PRESENTE:** los cargos mensuales de ML
—almacenamiento, stock antiguo, percepciones de IIBB— **salen de la cuenta de Mercado Pago y NO
están en este reporte**. Son **~$2.200.000 por mes** entre las cuatro (ya medido en la sección de
Full). O sea que el número **se va yendo para arriba** con las semanas.
**Por eso el punto de partida se vuelve a cargar UNA VEZ POR MES**, decisión suya del 20/09. Eso
acota el error a un mes en vez de dejarlo crecer para siempre.

**ESTADO AL 20/09/2026: el código está listo y esperando.** `dispo` corrido en prueba contestó
*"sin punto de partida cargado"* en las cuatro y **no tocó nada**, que es exactamente lo que tiene
que hacer. Arranca en cuanto él escriba los cuatro números en el Arqueo.

### LOS DOS FRENOS DEL REPORTE, YA DESTRABADOS (20/09/2026)

`versaldo` (solo lee) midió el reporte que ya existía en las cuatro cuentas y encontró las DOS
cosas que lo hacían inservible tal como estaba. **Las dos quedaron arregladas con `armarsaldo:90:go`
y verificadas releyendo de Mercado Pago (regla 6).**

| | antes | ahora |
|---|---|---|
| **los RETIROS adentro** (`include_withdraw`) | ❌ apagado en las 4 | ✅ **prendido y verificado en las 4** |
| el reporte más nuevo | **JULIO**, y no programado | ✅ **pedido 22/06 → 19/09 en las 4** |

Sin los retiros el disponible da **de MÁS**: se ve plata que él ya sacó. **Un saldo inflado es peor
que no tener saldo**, que es el mismo lado seguro de siempre.

**NO SE PROGRAMÓ EL REPORTE, a propósito.** Dejarlo automático genera un archivo por día en su
cuenta para siempre; el robot lo pide cuando lo necesita y eso no le ensucia nada.

**EL DÍA DE HOY NUNCA ENTRA EN EL REPORTE, y eso hay que decirlo cuando se muestre el número.**
Mercado Pago sólo deja pedir hasta el último día CERRADO. O sea que el saldo que salga de acá es
**el de ayer al cierre**. Un saldo que dice "hoy" y es de ayer es peor que uno que avisa que le
falta el último día.

**CÓMO SE ENCONTRÓ, Y EL ERROR QUE COMETÍ EN EL MEDIO.** Mercado Pago contesta
**400 `"Error creating Statement"`** sin decir qué campo está mal. Probar de a uno era **una corrida
de GitHub por intento, o sea el ciclo del robot muerto siete veces**, así que se hizo `probarrep`:
7 formas en UNA sola corrida, en UNA cuenta, cambiando **una sola cosa** por intento.
**Y la primera conclusión fue la equivocada.** Como las 6 que anduvieron caían en hora redonda,
escribí que la causa eran *"los minutos y los segundos"*. La corrida siguiente lo desmintió: el
MISMO pedido de 90 días volvió a dar 400 en las 4. Lo que de verdad los separa es el final —
`2026-09-19T00:00:00Z` ✅ y `2026-09-20T00:00:00Z` ✅ son días CERRADOS; `2026-09-20T18:06:32Z` ❌ y
`2026-09-20T18:00:00Z` ❌ son el día de HOY.
**Y la prueba de que los segundos no eran la causa estaba en la misma pantalla**: el reporte viejo
de la propia cuenta termina en `T02:59:59Z`, con los segundos en 59.
**LA LECCIÓN: una explicación que encaja con los casos nuevos y CONTRADICE un dato viejo que ya
tenías está mal.** La primera se quedó mirando los casos nuevos nomás. Es la variante del *"leí el
final de la salida y concluí"* que ya está anotada arriba en esta misma sección, dos horas antes.
**Lo que SÍ hizo bien el método:** probar de a uno habría "arreglado" el 400 bajando la ventana a
30 días, y el largo de la ventana no tenía nada que ver.

De paso quedó medido: la zona horaria de las cuatro cuentas es **GMT-03** y el separador y las
columnas del reporte salen de `settlement_report/config`.

**LO QUE FALTA, y es la parte que decide plata:** sumar el reporte (`REAL_AMOUNT` de lo que tenga
`MONEY_RELEASE_DATE` hasta hoy, menos los retiros), guardarlo y mostrarlo en el Arqueo.
**Antes de mostrarlo hay que compararlo contra el número que él ya conoce**: un saldo automático
que no coincide con el de la pantalla de Mercado Pago no se muestra, se investiga.

### LA PRUEBA DE ESCRITURA LE FALTABA UNA CUENTA, Y LO AGARRÓ ÉL (20/09/2026)

Le dije *"3 publicaciones de 3 cuentas"* y él contestó: *"pero por qué 3? son 4 cuentas"*. **Tenía
razón: faltaba Adriana** — y no es una cuenta cualquiera, es justo donde ML tenía perfumes en
revisión por marca, o sea la única donde un freno DISTINTO podía seguir en pie. Probada:
**3 de 3 ✅**, incluido el **"Bare Vanilla"** (`MLA3546445862`), que desde agosto rechazaba todo
cambio con ML-400 por falta de documentación y **hoy acepta**. Total: **12 de 12, las 4 cuentas.**
**LA LECCIÓN: una prueba que cubre 3 de 4 no prueba el caso que falta, y el que falta suele ser el
distinto.** Elegí tres al azar y la cuarta era la única con un motivo propio para fallar.

### YA LO GRITA: EL ROBOT AVISA CUANDO ML NO LO DEJA ESCRIBIR (19/09/2026)

Es el arreglo de la lección de arriba, y lo que cambia no es el bloqueo —para eso están los pasos
de la sección de arriba— sino **que no vuelva a pasar en silencio**.

**El freno vive en UNA función (`_anotarEscrituraML`) a la que llaman las SEIS que escriben solas
en ML** —`raisePrice`, `raisePriceTo` y `raiseVariations` (suben), `setPriceTo` (baja),
`activarPausadasFull` (activa) y `sacapromos` (borra el descuento)— y no adentro de cada comando,
por el mismo motivo que el piso duro: la regla no puede depender de que el próximo que escriba algo
se acuerde.

**Mira el TEXTO de ML, no el 403.** Un 403 también sale con el token vencido, y eso se arregla solo
en la vuelta siguiente; lo que hay que avisar es `PolicyAgent` /
`PA_UNAUTHORIZED_RESULT_FROM_POLICIES`, que es el motor de políticas. Con **un solo** intento
frenado ya sale el aviso: un mensaje de más molesta un minuto, el silencio deja al robot haciendo
la mímica de trabajar dos días.

**Va al canal privado de precios** (`sendAlerta`) y **no se tocó el Telegram del resumen del día**,
regla suya del 13/09. El mensaje dice qué quedó sin hacer, en cuántas publicaciones, que **no es un
error del robot** (leer sigue andando) y qué puede hacer él.

**Memoria de UN día** en `cyc/avisobloqueo`: el ciclo son ~4 corridas diarias y el mismo bloqueo
mandaría 4 mensajes iguales. **Se anota sólo si el mensaje salió** — si falla el envío y se anotara
igual, el bloqueo quedaría callado un día por un aviso que nunca llegó. Es lo mismo que el aviso
diario.

**Y AVISA TAMBIÉN CUANDO SE DESTRABA**, que es la mitad que siempre se olvida: si había marca y
esta vuelta ML aceptó una escritura, sale el 🔓. Sin eso él se queda creyendo que el robot sigue
frenado y toca todo a mano al pedo. Ojo con el detalle: hace falta que ML haya aceptado **algo** de
verdad — una vuelta en la que no hubo nada para escribir **no canta victoria**.

**Y EL AVISO DE CADA VENTA DICE POR QUÉ NO PUDO.** Cuando el robot no logra subir, ya mandaba un
mensaje por venta con el precio que haría falta (el *"subilo vos"*), pero el motivo decía
**"(no pude subirlo solo)"** a secas — que no distingue un token vencido de ML con la escritura
cerrada. **Ése es el mensaje que llegó durante dos días sin que se entendiera qué pasaba.** Ahora,
cuando el motivo es PolicyAgent, dice *"ML no me deja cambiar el precio de esta publicación · no es
un error del robot · subilo vos a mano"*, y para cualquier otro error imprime el texto de ML.

**De paso se emparejó el error de `raisePrice` y `raisePriceTo`**, que devolvían `ML-403` a secas.
`setPriceTo` ya se había arreglado ese mismo día y `raiseVariations` lo hacía desde antes: eran las
dos copias que quedaban atrás. **Un error que no dice el motivo obliga a adivinar.**

Probado con el bloque REAL sacado del archivo (no una copia, que diría "todo bien" para siempre) y
10 casos: PolicyAgent avisa y anota · el mismo día no repite · un 403 de token vencido NO dispara
nada · si Telegram falla no anota · en prueba avisa y no anota · el destrabe avisa y borra la marca
· una vuelta sana no manda nada · marca vieja sin escrituras no canta victoria · el tope de 40 ·
y si la memoria no se puede leer, avisa igual.

**LA SEXTA ES SACAR LAS PROMOCIONES, Y CASI QUEDA AFUERA.** Ese camino borra con **DELETE**, no
con PUT, así que no pasa por ninguna función de precio — si se dejaba
afuera, el freno de ML se iba a ver en todo **menos en lo más caro**: una promo aplicada le BAJA el
precio, y si el robot no la puede sacar el descuento se queda puesto. Es la regla 8.
(Hoy no se pudo probar contra ML: `sacapromos` dio *"0 sacadas · 0 con error · 431 revisadas"*, o
sea que no hay ninguna promo aplicada en este momento y no hubo nada que intentar.)

### EL PISO SE PUEDE ABRIR A MANO, CON TRES FRENOS (19/09/2026)

Quedó anotado el 16/09 que *"esa red se abre el día que él quiera aplicar uno, no antes"*. Llegó ese
día. `_chequeoPiso` acepta ahora `autorizado`, y **los tres frenos hicieron falta**:
 · hay que pasar un **TEXTO** que diga quién y por qué. Un comando que se olvide del campo cae en el
   piso de siempre, que es el lado seguro;
 · **`PISO_AUTORIZADO` = 0**: ni con autorización se vende abajo del costo total. Para rematar de
   verdad a 0% o menos está `liquidando`, que lo decide él de a uno;
 · se **imprime en el log** cada vez que se abre, con el margen en el que queda.

Se aplica con **`unapub:<MLA>:<piso>:<días>:empatar[:go]`**, y va adentro de `unapub` a propósito:
ese comando **ya calcula** el precio de la caja y su margen con `margenA`. Un comando nuevo sería una
segunda copia de la cuenta que decide un precio — el error anotado siete veces acá.

**DOS DETALLES QUE NO SON DE FORMA:**
 · **El precio se redondea PARA ABAJO.** `setPriceTo` hace `Math.ceil` a la decena, así que pasarle
   los $425.741 dejaría **$425.750 — nueve pesos MÁS CARO que lo que ML pide**, o sea sin empatar
   nada. Bajando a la decena de abajo queda en el precio o debajo.
 · **La marca `liquidando` va ANTES de bajar, y si falla no se baja.** Al quedar abajo del piso, la
   PRIMERA venta dispara la suba automática y el robot deshace la decisión — exactamente lo del
   Pendrive del 12/09. Bajar sin la marca es lo peor de los dos mundos.
**OJO: la marca de la Pad 2 quedó puesta aunque el precio no cambió**, porque se escribe primero. No
hace daño (a $497.310 está en 23,7%, arriba del piso, así que el robot no la subiría igual) y **sirve
si él le cambia el precio a mano**. Para sacarla: `liquidando:-MLA1782639641:go`.

## EL ARQUEO DE FINANZAS ESTÁ EN DÓLARES, Y YO ESCRIBÍ PESOS (20/09/2026)

Lo marcó él: *"en finanzas para hacer el mes se hace solo en dólares. o de última poner en dólares
y en chiquito al lado en pesos. pero ahí pusiste ese número como si fuera dólares y descoordina
todo"*. **Tenía razón y el error fue mío, sobre su plata.**

`saldoml:go` escribió el total **en PESOS** en `cyc/finanzas/mp_liq` y el panel lo mostró como
dólares: *"A liquidar en ML **4.790.531**"* con un **+272.244%** al lado. Todo el patrimonio del
Arqueo quedó descoordinado hasta que se corrigió.

**Y ESO EXPLICA UNA CONCLUSIÓN MÍA QUE ERA FALSA.** El comando comparaba lo calculado contra lo
cargado a mano y daba **+242.941%**; yo escribí —y le dije— que *"el número cargado a mano está mal
por 2.400 veces"*. **No estaba mal:** estaba en dólares y era razonable. Lo que comparaba pesos
contra dólares era mi comando.
**El único chequeo que sí funcionó fue el que no dependía de ninguna unidad ajena**: lo pendiente
equivale a **11,8 días de venta**, que es lo esperable — ahí los dos lados estaban en pesos.

**LA LECCIÓN: antes de escribir un número en un campo que YA EXISTE, la pregunta no es si el número
está bien calculado sino EN QUÉ UNIDAD lo lee el que lo va a mostrar.** Es la variante nueva de
*"dos números que miden cosas distintas puestos uno al lado del otro"*, y la más cara: acá el
número no estaba al lado, estaba ADENTRO del campo equivocado.

**Cómo quedó:** el robot convierte con `cyc/finanzas/tipo_cambio`, y **sin el dólar cargado NO
ESCRIBE NADA** — convertir con un cambio adivinado se mete en el patrimonio entero y no se nota,
el mismo motivo por el que `nissei` no convierte guaraníes sin `gsPorDolar`. El detalle por cuenta
se guarda en PESOS y queda marcado con `_moneda`.
**Y la comparación tenía el MISMO error una línea más abajo**, que casi se escapa: en la corrida
siguiente iba a gritar *"NO se parecen"* sin que pasara nada, y ese aviso es justo el freno que
decide si se pisa el número del Arqueo. Ahora convierte antes de comparar, y sin tipo de cambio no
compara en vez de comparar mal.

**HECHO el 20/09**: los dieciséis campos del Arqueo muestran el equivalente en pesos en chiquito
al lado, armado en `updateArqueo` y no campo por campo — tocarlos de a uno es el borrado a ojo que
ya rompió la app dos veces.

## "A LIQUIDAR EN ML" YA SE CALCULA SOLO; EL DISPONIBLE NO (20/09/2026)

Pedido suyo: *"hay un armado de cuánto tiene cada cuenta de ML y cuánto a liquidar en arqueo
finanzas. pero vos sabés más que yo y tenés más info. armalo como creas mejor"*.

**DE LAS DOS CASILLAS SÓLO UNA SE PUEDE, Y LA DIFERENCIA NO ES DE ESFUERZO:**

| | ¿se puede? | por qué |
|---|---|---|
| **A liquidar en ML** | ✅ **sí, y ya corre** | son las filas del reporte con fecha de liberación **a futuro**. ML libera en días o pocas semanas, así que una ventana de 90 días las contiene TODAS: el número es completo por sí solo. |
| **Disponible por cuenta** | ❌ **no** | es plata acumulada desde que la cuenta existe y el reporte es una VENTANA. Sumar 90 días da el MOVIMIENTO de 90 días, no el saldo. |

**El disponible se sigue cargando a mano, y es una decisión.** Para automatizarlo haría falta que él
cargue el disponible UNA vez y de ahí sumar y restar, y **cualquier movimiento que el reporte no
traiga se acumula para siempre y en silencio**. Un saldo que se va despegando de a poco es peor que
uno cargado a mano, porque el cargado a mano al menos **se nota viejo**.

El comando es **`saldoml[:go]`**. **No imprime ni un peso**: al registro público van cantidades,
fechas y proporciones; los montos se guardan en la base, que es donde ya vive su plata.

**LOS DOS FRENOS PARA PISAR EL NÚMERO DEL ARQUEO**, y hacen falta los dos porque ese número entra en
el patrimonio: que estén las **CUATRO cuentas** (con una afuera el total está corto) y que **cierre
contra las ventas** (entre 2 y 30 días de venta). Si alguno no da, se guarda el detalle y **no se
toca lo que él tiene cargado**.

**Detalles que no son de forma:**
 · El CSV se parte **respetando las comillas**: un `split(';')` pelado corre las columnas si un
   texto trae el separador adentro, y ahí el neto de una fila se lee de otra.
 · Las filas que no se pueden leer **se cuentan y se avisan**, nunca se cuentan como cero.
 · **No se toca `finanzas/_ts/mp`**: esa fecha es la del DISPONIBLE, que él carga a mano. Pisarla
   haría ver al disponible más fresco de lo que está.
 · Después de calcular **se pide el reporte de la próxima vuelta**, que es lo que mantiene el número
   al día sin que nadie se acuerde.

## "CARGAR LO SUGERIDO" NO ANDABA EN DOS CUENTAS, POR UN PUNTO EN UN NOMBRE (20/09/2026)

Él lo reportó así: *"al clickear cargar lo sugerido en adriana, no anda. no sé si se rompió solo en
adriana o todos"*. Fallaba en **DOS de las cuatro**.

**LA CAUSA:** la caja a medio armar se guarda con una clave por renglón que es
`<id del producto>|<nombre de la variante>` (`_ck`), o sea que **el nombre de la variante va ADENTRO
de la clave** — y Firebase **no acepta** `.` `#` `$` `[` `]` `/` en una clave. Los tres aromas
Paulvic **"1.4 Sexy Men"**, **"1.4 W Mujer"** y **"1.4M Hombre"** tienen un punto.

Con uno solo de ésos en la sugerencia **el guardado falla ENTERO**, y como el que falla es un
`await`, la pantalla no se vuelve a dibujar: **el botón parece que no hace nada.** Los Paulvic se
publican en Adriana y Luciana, que es exactamente donde falló; en Ayelen y Matías andaba.

**NO SE ADIVINÓ: se midió con `clavesmalas`** (solo lee), que lista las variantes cuyo nombre rompe
la clave, con qué carácter y en qué cuentas se publican. Y si diera cero lo dice como resultado, no
como respuesta.

**SE ESCAPAN SÓLO ESOS SEIS CARACTERES, y no se usa `sid()` como en el inventario a propósito:**
`sid` además cambia los espacios, así que *"Azul Marino"* pasaría a *"Azul_Marino"* y **las cajas a
medio armar quedarían huérfanas** — había una con 246 unidades cargadas a mano. Escapando sólo lo
prohibido, toda clave que hoy funciona queda **idéntica**.

**Y EL FALLO YA NO ES MUDO:** si el guardado falla se deshace el cambio en memoria —si no, la
pantalla mostraría una caja que en la base no existe y al recargar desaparecería— y sale un aviso
con el motivo. Es el `catch {}` vacío anotado cuatro veces: **el dato no se pierde con ruido.**

**LA LECCIÓN, y es nueva: un nombre que escribe una PERSONA puede terminar adentro de una clave de
base de datos.** El inventario ya lo tenía resuelto con `sid()`; las cajas no, y nadie lo notó hasta
que él cargó un aroma con un punto. Antes de meter un texto libre en una clave, hay que limpiarlo.

## LO QUE MOSTRABA LUMELÍ Y NOSOTROS NO: MEDIDO Y AGREGADO (21/09/2026)

Él mandó nueve capturas de **Lumelí**, una app para vendedores de ML, con el pedido de siempre:
*"fijate si hay algo que sirva y no tengamos"*. Comparado contra el panel, de todo lo que muestra
sobraban **tres** cosas; el resto ya lo teníamos o no aplica.

| | decisión |
|---|---|
| **PUBLICIDAD** (inversión y ROAS) | **NO se hace**, decisión suya: *"nuestra estrategia es minimizar los gastos al extremo, para ser los mejores en precios"* |
| **margen por RUBRO** | hecho |
| **REPUTACIÓN de las 4 cuentas** | hecho |

**Lo que muestra y ya teníamos:** ganancias con su composición, margen por producto, publicaciones
activas/pausadas/en revisión, preguntas sin contestar, reclamos, stock y el aviso de "sin costo".
**Lo que muestra y no nos sirve: "envíos para despachar"** — se vende todo por Full, los despacha ML.
**Lo que ellos pueden y nosotros no hacemos: contestar las preguntas solas con IA.** Técnicamente se
puede (el permiso `comunication` escribe, medido el 20/09). **Es una decisión suya y no se tocó.**

**Y UNA COMPARACIÓN QUE ASUSTA AL PEDO: su comisión dice 12,9% y la nuestra 28,3%.** No pagan menos:
venden celulares de $200.000 y el cargo fijo de ~$1.230 se les diluye. En un perfume de $6.000 ese
mismo cargo son 20 puntos. Ya estaba medido el 11/09; no hay nada que corregir.

### LAS DOS SE MIDIERON ANTES DE ESCRIBIR UNA LÍNEA DE PANEL (`reputa`)

 · **La reputación NO está en `/users/<id>/seller_reputation`**, que es donde parecía: esa ruta
   **devuelve una página web**, no un 404. Leer eso como *"ML no da la reputación"* habría cerrado
   el tema con el error anotado de punta a punta en este archivo. Viene **adentro de `/users/<id>`**.
 · **El nombre del rubro sale de `path_from_root[0]` de `/categories/<id>`.** El id solo
   (`MLA352679`) no le dice nada a nadie; lo que sirve es la **raíz** del árbol
   (*"Belleza y Cuidado Personal"*), que es la granularidad de un margen por rubro.

**Medido en las cuatro cuentas:** las cuatro en **5_green**, con demoras y cancelaciones en **0%**
(de los envíos se encarga Full). Adriana, Luciana y Matías **platinum**; **Ayelen es la única gold**
y la que más reclamos tiene (**0,92%**, contra 0,49% de Matías, 0,36% de Luciana y 0% de Adriana).

### CÓMO QUEDÓ, Y LAS DECISIONES QUE NO SON DE FORMA

**La categoría NO cuesta una consulta más:** se pide en la MISMA llamada que la caja de compra ya
hacía cada hora, agregándola a los `attributes`. **Y se sella ANTES del filtro de activas**: abajo
se saltean las pausadas porque no pelean ninguna caja, pero **una publicación pausada sigue teniendo
rubro y su producto sigue habiendo vendido** — sellándola después, todo lo pausado quedaba "sin
rubro" para siempre y el margen por rubro tenía un agujero mudo.

**El NOMBRE se pide una vez por CATEGORÍA, no por publicación.** La categoría no depende de cuál
publicación sea: sin esa caché las ~140 preguntaban lo mismo decenas de veces, que es el problema de
velocidad de la primera versión de `avisos`. Tope de **30 por vuelta** y **no mudo**: las que quedan
se dicen en el log.

**Si ML no contesta la reputación de una cuenta NO se borra lo que había**: queda el dato anterior
con su fecha y **la pantalla avisa en ámbar si tiene 2 días o más**. Mismo criterio que la caja de
compra: un "no sé" que pisa lo que sabíamos es peor que un dato de hace una hora.

**El margen por rubro usa la MISMA cuenta que todo el panel** — la ganancia en pesos contra el costo
**sin** la gestión de Full (el neto que deposita ML ya la trae descontada) y la gestión **sólo en el
divisor** del %. Con una cuenta propia, esta tarjeta diría un margen y los KPIs de arriba otro sobre
las mismas ventas.

**Lo que todavía no tiene rubro se CUENTA Y SE DICE**, no desaparece: si esas ventas se escondieran,
el total no cerraría contra los KPIs sin que nada lo avise. Y **una venta sin costo cargado no
entra**: sin costo no hay margen que medir, y contarla daría un 100% inventado.

**El color de la reputación va por el PORCENTAJE, no por el nombre del nivel.** `5_green` es el techo
de ML y no distingue una cuenta sana de una que viene subiendo reclamos.

**Y la reputación no depende del período elegido arriba, así que el título lo aclara.** Un número que
no se mueve al cambiar el período, metido en una pantalla que sí lo hace, se lee mal.

**EL ERROR QUE COMETÍ Y AGARRÉ ANTES DE SUBIR: el probe `reputa` tenía la lectura COPIADA adentro**
en vez de llamar a `reputacionML`. Es el verificador con la cuenta propia, el error anotado una
docena de veces acá, cometido justo en la herramienta hecha para medir. Ya llama a la función
compartida — **y su encabezado decía "SOLO LEE", que dejó de ser cierto en ese mismo cambio**: ahora
escribe `cyc/reputacion`. Las dos cosas se corrigieron juntas.

Probado con las funciones REALES sacadas del archivo: **19 casos de la cuenta y 14 del dibujado**,
incluidos período vacío, TODO sin rubro, margen negativo, un dato de 5 días y lo que ML no contesta.
Chequeo de las tres listas más las clases de CSS: **0 funciones, 0 variables, 0 `id` y 0 clases de
diferencia**.

### EL "+60%" DE UNA VENTA CONTRA EL "44%" DEL PANEL: LOS DOS ESTÁN BIEN

Él lo marcó mirando el renglón del Seagate: *"no entiendo los %. porque dice que da menos y cuando se
vende da distinto."* **La fórmula es la misma en los dos lados; lo que cambia es el NETO.**

| | de dónde sale |
|---|---|
| **44,2%** (15/09) | estimación de **antes de vender**: el envío salía de la **tarifa de ML**, no de una venta |
| **56,8%** (`unapub`, 21/09) | el real, con el envío **deducido de su primera venta: $6.853** |
| **+60%** (el renglón de la venta) | el mismo real, pero **sin el cargo de Full en el divisor** |

**Y ese tercer número tiene una causa concreta, no es un error de cuenta:** `gestDeVenta` lee lo que
cobra Full **de la ficha del producto**, y la ficha del Seagate no lo tenía cargado **porque nunca
había vendido** — hasta ese día. En cuanto el robot la complete, el renglón pasa solo a ~57%.

**La lección, y es la de siempre del otro lado:** cuando dos números del panel sobre la misma venta
no coinciden, antes de buscar el error hay que preguntar **cuál de los dos es una estimación**. Acá
ninguno estaba mal y no había ningún precio que tocar.
**Y un error mío en el medio, para no repetirlo:** contesté primero que la diferencia eran "~$14.700
de envío estimado" **antes de correr nada**. El número era inventado: medido, el envío real fueron
$6.853 y lo que faltaba era el cargo de Full en el divisor. **Una explicación que suena razonable y
no está medida es una adivinanza con buena redacción.**

## ¿QUÉ DATOS MANDA ML QUE NO ESTAMOS GUARDANDO? `campos` (21/09/2026)

Pedido suyo: *"fijate si hay más info que da ML y no tenemos. por ejemplo el código para enviar
mercadería a Full (Codera - XCUU22662) que fue re útil. quizás encontrás pequeños datos así para ir
llenando la web."*

**Su ejemplo es exactamente el motivo del comando.** El `inventory_id` **ya venía** en la respuesta
que el robot pedía todas las horas para leer el stock de Full, y no se guardaba. No era un endpoint
nuevo ni un permiso que faltara: **era un campo que pasaba por al lado.**

**`apisnuevas` prueba PUERTAS; `campos` mira ADENTRO de las que ya están abiertas**, que es donde
estaba el `inventory_id`. Mira la publicación, el stock de Full, la cuenta, una venta y su envío.

**DOS DECISIONES QUE NO SON DE FORMA:**
 · **NO IMPRIME NI UN VALOR, sólo nombres de campo.** Una orden trae el **nombre, el documento y la
   dirección del comprador**, y el registro de GitHub es PÚBLICO. Un volcado crudo acá sería el
   mismo error de `recibidas.json` con otra ropa.
 · **NO decide por el nombre cuáles ya usamos: lee el CÓDIGO REAL** del robot y del panel y busca
   ahí. Marcar a ojo cuáles conocemos es justo como se cuelan los que pasan por al lado. Los
   nombres de menos de 4 letras se dan por conocidos porque dan falsos positivos.

Lista las claves hasta **dos niveles**: el campo útil suele estar adentro de un objeto
(`shipping.logistic_type`), no suelto arriba de todo.

## LOS DATOS QUE ML YA MANDABA Y NO GUARDÁBAMOS (21/09/2026)

Pedido suyo: *"fijate si hay más info que da ML y no tenemos. por ejemplo el código para enviar
mercadería a Full (Codera - XCUU22662) que fue re útil. quizás encontrás pequeños datos así para ir
llenando la web."*

**Su ejemplo es la clave: el `inventory_id` YA venía** en la respuesta que el robot pedía todas las
horas para leer el stock de Full, y no se guardaba. No era un endpoint nuevo ni un permiso que
faltara — **era un campo que pasaba por al lado**. `apisnuevas` prueba PUERTAS; `campos` mira
ADENTRO de las que ya están abiertas, que es donde estaba.

**Medido con `mismoprod` sobre 384 publicaciones:**

| campo | está en | qué se hizo |
|---|---|---|
| **foto** (`thumbnail`) | **384 de 384** | se guarda y se ve en Pedidos, Armar caja y Rotación |
| `domain_id` | 384 de 384 | se guarda (rubro fino de ML) |
| `user_product_id` | 382 de 384 | empareja las publicaciones nuevas |
| `family_id` | 380 de 384 | no se usa todavía |

### LA FOTO: EL SISTEMA YA ESTABA ENTERO, LE FALTABA LLENARSE

*"hay un sector que había puesto fotos yo pero es antiguo y no lo terminé de llenar, si esto lo
trae directo hacelo así que es mejor"*. Exacto: `verFoto`, el lightbox y el botón 📷 **ya existían**
desde antes. Lo único que faltaba era que alguien cargara cada foto a mano, y por eso quedó a
medias. Ahora la guarda el robot en `cyc/mllinks/<MLA>/foto` y todo lo demás funciona solo.

**LO QUE CARGÓ ÉL MANDABA SIEMPRE — Y EL 21/09/2026 PIDIÓ LO CONTRARIO.** Textual, mirando Armar
caja: *"saca TODAS las que puse yo. y deja las nuevas que da ml"*. Las suyas eran de cuando esto se
llenaba a mano y quedaron tapando la de ML, que ahora llega sola y actualizada. El orden en el
código **no se tocó** (link a mano → foto subida → la de ML): lo que se hizo fue **vaciar** las
cargadas a mano, así que la regla sigue en pie para la próxima que él cargue.
Se hace con **`sacarfotos[:go]`**, que borra los tres lugares donde vive una foto a mano
(`products/<id>/fotoUrl`, la marca `products/<id>/foto` y la imagen en `cyc/fotos/<id>`).

**ERAN 77 Y YO HABÍA CONTADO 1.** El comando `fotos` pregunta **primero** si hay foto de ML y, si
la hay, sigue de largo con un `continue` **sin mirar si además hay una a mano**. Para contar
faltantes da igual; para esto no, porque la de él GANA sobre la genérica de ML — o sea que un
producto con las dos **está mostrando la suya** y quedó contado como "de ML". **Casi la mitad del
catálogo entraba en ese caso.** Contar con el filtro equivocado y después BORRAR sobre ese número
es el descarte silencioso de siempre, pero destructivo: una imagen subida no está en ningún otro
lado y no se puede deshacer. Por eso el comando nuevo no reusó ese conteo.
**La lección: un comando que cuenta bien para una pregunta puede contar mal para la de al lado, y
el filtro que lo decide está escrito arriba de todo, lejos del número que uno lee.**

**Y NINGÚN PRODUCTO QUEDA SIN FOTO, decisión suya con los números a la vista.** De las 77, **76
tenían la de ML esperando** y **una —la Calculadora— iba a quedar sin ninguna**, porque no tiene
publicación viva de dónde traer otra. Eligió *"sacar 76 y dejar la Calculadora"*. Así que el que
quedaría con un hueco **no se toca por defecto** y el resumen lo dice; para sacarlo igual hay que
pedirlo expreso (`sacarfotos:go:todas`).
**Aplicado y releído de la base: quedan 1 de 1 esperadas.** La relectura compara contra las que se
dejaron A PROPÓSITO, no contra cero — si comparara contra cero, dejar una a propósito se leería
como que el comando falló.

**Y SI NO HAY NINGUNA NO SE DIBUJA NADA.** Un cuadrito roto es peor que no tener foto, y la imagen
además se esconde sola si el link falla.

**LA PRIMERA VERSIÓN GUARDÓ 0 DE 384, Y EL FRENO HIZO BIEN.** ML manda el `thumbnail` **por http**
(69 de 69) y **`secure_thumbnail` NO viene** (0 de 69). **El panel se sirve por https y el navegador
BLOQUEA una imagen http adentro de una página https**: se vería un hueco y **no habría ningún error
a la vista** — el fallo mudo de siempre.
**El arreglo NO se eligió de memoria.** Se probaron las dos salidas contra ML de verdad —desde el
chat no se puede, el proxy bloquea ese dominio; el robot sí—:
 · el **MISMO servidor por https** → **200 · `image/webp`** ✅ · no cuesta ninguna consulta extra
 · `pictures[0].secure_url` → existe, pero cuesta una consulta más por publicación
Se toma la primera.
**Y EL AGUJERO LO AGARRÓ LA PRUEBA, NO LA LECTURA:** el filtro decía `[^/]*mlstatic\.com` sin cerrar
el final, así que **`mlstatic.com.malo.net` pasaba** — alcanzaba con poner el nombre adelante para
que el panel cargara una imagen de cualquier servidor. Ahora el dominio se compara entero.

### `user_product_id`: SIRVE, PERO SÓLO ADENTRO DE UNA CUENTA

Es el identificador con el que **ML mismo** agrupa sus publicaciones del mismo producto. Importa
porque hoy una publicación nueva se empareja leyendo el **TÍTULO**, que es el filtro por palabras
que ya falló **seis** veces en este archivo.

**Las dos mitades de la medición, y la mala importa:**
 · **Cuando ML junta dos publicaciones, NUNCA contradijo nuestras fichas: 24 grupos de 24.** El dato
   es confiable.
 · **Pero agrupa sólo adentro de UNA cuenta.** La Tira Led está en las cuatro y tiene **4 ids
   distintos**. Igual que el código de Full, ya medido así. **O sea que NO reemplaza el emparejado
   por título cuando el producto está en varias cuentas**, que es donde más duele.

**Cómo quedó:** si una publicación nueva comparte el id con una hermana YA vinculada **en esa misma
cuenta**, se engancha con certeza. Si no, se sigue adivinando por el título: no hay otra.
**Si el título y ML dan fichas distintas gana ML y SE DICE en el log**, con el aviso al lado —
elegir en silencio sería el descarte mudo de siempre, y ése es justo el caso que hay que mirar. El
log dice de cada nueva **si la enganchó ML o el título**: sin eso las dos se leen igual.

**EL ERROR QUE AGARRÉ ANTES DE SUBIR, y es del tipo que compila perfecto:** la primera versión
buscaba la ficha con `index.byId`, **que no existe** —el índice es un arreglo de `{p, toks}`—, así
que caía SIEMPRE en un respaldo `{id, name}` inventado. Con eso se perdía `p.variantes`, o sea que
`varianteDeTitulo` no podía sacar el color y **el stock de Full no se le imputaba a ninguna
variante**. Y si la hermana apunta a una ficha borrada **no se usa**: se vuelve al título y se dice.

**Y UNA PRUEBA ESTABA MAL PLANTEADA, NO EL CÓDIGO:** daba por hecho que *"Xiaomi Redmi Watch 4
Negro"* emparejaba por título. Con el Watch 3 también cargado, el título **EMPATA y no elige
ninguno** — que es el lado seguro y no se tocó.

### DÓNDE SIRVE ADEMÁS, Y ESTABA PENDIENTE HACE RATO

**Encontrar las publicaciones repetidas de una misma cuenta.** Está anotado como *"LO QUE FALTA, Y
ES LO GRANDE: ~58 publicaciones repetidas siguen VIVAS en ML"*. **ML mismo dice cuáles son la
misma**: la medición ya destapó que Luciana tiene **dos Tira Led con el mismo id**.

### LO QUE QUEDA ABIERTO

 · **`family_id`** (380 de 384) no se usa todavía. Es el "producto padre" de ML.
 · **`family_id`** (380 de 384) no se usa todavía y no se le encontró una pregunta que conteste.

### LA ORDEN Y EL ENVÍO, YA MEDIDOS (21/09/2026)

La primera corrida de `campos` no encontró ninguna orden porque pedía `/orders/search` **sin
`order.status=paid`** —el robot sí lo manda— **y se tragaba el error con un `catch {}` vacío**, así
que imprimió *"no se pudo encontrar una orden reciente"*, que se lee como *"ML no tiene ventas"*.
Es el `catch` mudo anotado cuatro veces, cometido en la herramienta hecha justamente para encontrar
lo que se pasa por al lado. Corregido y corrido:

| | campos nuevos |
|---|---|
| la ORDEN | **10 de 45** |
| el ENVÍO | **84 de 125** |

**De la orden no sale casi nada:** `fulfilled`, `buying_mode`, `static_tags`, `feedback`,
`related_orders`, `order_request`. Lo único con algún valor es `feedback.buyer`.

**Del ENVÍO salían DOS cosas candidatas, y de las dos sólo UNA sirvió — las dos ya se midieron:**
 · **`cost_components`** — decía acá que era *"lo que más puede mover márgenes de todo lo que
   apareció hoy"*. **Medido el mismo día con `envio3`: NO mueve nada.** Los cuatro descuentos vienen
   en CERO en las 11 ventas, y `base_cost` resultó ser el envío ENTERO (el doble de lo que paga el
   vendedor), no nuestro costo. El número que usa el robot ya era el bueno. Ver la sección "EL ENVÍO
   QUE INFORMA ML".
 · **`status_history`** (`date_shipped`, `date_delivered`, `date_not_delivered`, `date_returned`) y
   **`return_details`** — cuándo se entregó cada venta y cuáles volvieron. **HECHO** (probe
   `entregas`, sección propia más abajo).

**OJO, Y ES LO MÁS IMPORTANTE DE ESTA SECCIÓN: el envío trae el NOMBRE, el TELÉFONO y la DIRECCIÓN
del comprador** (`receiver_address.receiver_name`, `receiver_phone`, `address_line`, la
geolocalización). Son datos de terceros y el registro de GitHub es PÚBLICO. Por eso `campos`
imprime **sólo nombres de campo y ningún valor** — un volcado crudo acá sería el mismo error de
`recibidas.json` con otra ropa. Si algún día se usan estos campos, **se guardan sólo los números**.

**Estado al 21/09 a la noche: `status_history` y `return_details` YA ESTÁN implementados; los
campos de la orden siguen sin usarse y `cost_components` quedó descartado por medición.**

## LA HORA DE CADA VENTA YA ESTABA GUARDADA Y NO SE MOSTRABA (21/09/2026)

Pedido suyo: *"se le puede agregar la hora de venta a las ventas?"*, y después el reproche, que es
lo que importa: *"la hora de venta por ejemplo era uno de los pequeños detalles que ml da. no me lo
dijiste. fijate si no hay mas como esos, son pequeños detalles, pero ya que estan tomemoslos"*.

**Tenía razón y el dato estaba desde siempre.** El robot escribe
`ts: new Date(o.date_created || o.date_closed)` — o sea **la hora REAL en que ML cerró la venta**,
no la hora en que el robot la trajo. La pantalla mostraba sólo `_dateKey`, que es el día.
Es la variante del error del 19/09 con la comisión de ML: **un dato que el sistema ya sabe, usa
para otra cosa, y deja a todos adivinando.**

**Cómo quedó:** el renglón dice `2026-09-21 · 14:35`, en 24 h. En un carrito se toma la venta **más
temprana** del grupo, que es cuando empezó la compra. Y **sin `ts` no se inventa una hora**: sale
sólo la fecha — una hora inventada al lado de un número de venta es peor que no tenerla.
Probado con el bloque REAL del archivo y 7 casos.

### LO QUE SE AGREGÓ CON ESO (21/09/2026, *"agrega todo"*)

 · **`subStatus` — el MOTIVO por el que ML tiene frenada una publicación.** Va en el chip de la
   ficha, pegado al `PAUSADA`, y en Vinculaciones. **Importa porque "pausada" son cosas distintas
   con remedios CONTRARIOS**: *sin stock* se arregla mandando mercadería y *ML pide documentación*
   no se arregla con nada del panel. Es lo que costó entender con el Bare Vanilla.
   **Lo que ML manda y no conocemos sale CRUDO** (`SUBEST` traduce los diez que se conocen):
   traducir a la fuerza un código nuevo sería adivinar, y un código feo pero verdadero es mejor.
   Un producto con todo activo **no muestra nada**: un cartel que sale siempre no lo lee nadie.
 · **Lo que se quedó ML en cada venta**, en el renglón de Ventas x Producto.
   **Se calcula como `total − neto` y NO con el `mlfee` guardado, a propósito.** `mlfee` deja
   AFUERA las retenciones y el neto las trae descontadas, así que ese número daría **menos** que la
   resta del mismo renglón: dos números correctos, uno al lado del otro, dando una conclusión falsa
   — la lección de las tres cajas del 03/09.
   **Y VA SIN PORCENTAJE (21/09/2026, pedido suyo: *"dame un solo %, el real"*).** La primera
   versión ponía *"ML $1.749 (65%)"* al lado del *"+22%"* de ganancia. **Los dos eran correctos y
   juntos invitaban a compararlos**: uno es la tajada de ML sobre el PRECIO y el otro la ganancia
   sobre el COSTO, así que restarlos o mirar uno como explicación del otro no da nada. Es la misma
   lección de las tres cajas de la ficha, con dos por cientos en vez de tres pesos.
   **El % del renglón es UNO solo y es el de ganancia**, que es el que decide.
   **Y AL RATO ÉL SACÓ EL RENGLÓN ENTERO:** *"que no se vea ml, total no me sirve para nada a mi"*.
   O sea que el dato estaba bien calculado y **no contestaba ninguna pregunta suya** — lo que mira
   es la ganancia. **Sacar el % no alcanzaba: sobraba el número.** Es la misma lección del color
   del 26/08 puesta en datos: un número de más en un renglón de una lista larga es ruido, y el
   ruido tapa lo que sí decide. Probado con las líneas REALES del archivo y 6 casos: el renglón
   queda en costo · ganancia · **un solo %**, y ML no aparece por ningún lado.
 · **En Vinculaciones**: desde cuándo el panel conoce la publicación (`altaTs`) y las marcas que le
   puso el robot (`noVendemosMas`, `altaSinVender`, `altaPorCatalogo`).
 · **`upid` se deja sin mostrar a propósito**: es el id con el que ML agrupa sus publicaciones y ya
   lo usa el emparejado de las nuevas. En pantalla no contesta ninguna pregunta.

**Y UNO QUE PARECÍA UN HALLAZGO Y NO LO ERA:** `margenMLDe` devuelve `pausada` y nadie lo usa, así
que el barrido de funciones lo marcó. **Pero la ficha SÍ muestra "PAUSADA"** — lo lee de
`p.netoCalcPausada`, el campo crudo. O sea que era código repetido, no un dato tapado. **Se
verificó antes de decirlo**, que es lo que corresponde después de la lección de la hora.

### EL BARRIDO QUE SALIÓ DE AHÍ, Y LO QUE **NO** ENCUENTRA

**`guardadosinver`** (solo lee) compara **lo que está en la base contra lo que `index.html`
dibuja**, leyendo el archivo de verdad en vez de decidir de memoria. Es **el espejo de `campos`**, y
la diferencia decide dónde buscar:
 · `campos` mira lo que **MANDA ML** contra lo que el código usa → lo que nunca llegó a guardarse
   (así apareció el `inventory_id` de las etiquetas de Full);
 · `guardadosinver` mira lo que **YA ESTÁ GUARDADO** contra lo que se muestra → lo que se guarda
   hace meses y nadie ve. **Ese dato ya está pago: sólo falta mostrarlo.**

**Lo medido el 21/09:** ventas **1 de 20** tapado (`mlfee`) · publicaciones **6 de 26** ·
productos **0 de 27**.

**El único que vale de los seis es `subStatus`**: el motivo por el que ML tiene frenada o pausada
una publicación (`under_review`, `pending_documentation`, `out_of_stock`…). Lo tienen 272 de 400 y
**la pantalla no lo nombra en ningún lado** — es exactamente lo que costó entender con el Bare
Vanilla y los dos Termómetros. Los otros cinco (`upid`, `altaTs`, `altaPorCatalogo`,
`noVendemosMas`, `altaSinVender`) son marcas internas del robot.

**Y LA LIMITACIÓN, QUE HAY QUE TENER ESCRITA PORQUE ES DEL TIPO QUE ENGAÑA: ESTE BARRIDO NO HABRÍA
ENCONTRADO LA HORA.** Busca campos que la pantalla **no nombra en ningún lado**, y `ts` sí lo
nombra: se usa para ordenar las ventas. Lo que estaba tapado no era el campo entero — era **una
PARTE** del campo: se usaba la fecha y se tiraba la hora.
**O sea que encuentra lo que está completamente escondido, no lo que está a medias usado.** Un
barrido que pasa limpio no prueba que no falte nada: prueba que **esa** forma de faltar no está.
Es la misma lección del chequeo de títulos del 19/09 —*"un chequeo que pasa no prueba que esté
bien"*— y por eso no se puede decir "ya está todo mirado" apoyándose en esto.

## EL ENVÍO QUE INFORMA ML: EL NÚMERO NUESTRO ESTÁ BIEN (21/09/2026)

Pedido suyo: *"¿pido el envío real de ML? si. fijate si está bien el número que tomamos nosotros"*.
El comando es **`envio3[:cuenta][:cuántas]`** y **SOLO LEE**.

**LA RESPUESTA: SÍ, EL NÚMERO QUE USA EL ROBOT ES EL BUENO.** Lo que ML descuenta de verdad —el
cargo `shp_fulfillment` del pago, con el que se arma el `gestFull` de cada ficha— es lo que
efectivamente paga CYC. **No hay ningún margen mal medido por esto.**

**Y LA PRIMERA HIPÓTESIS ERA FALSA, PARA EL LADO PELIGROSO.** Yo esperaba que `base_cost` menos los
descuentos diera lo que cobró MP. Dio **0 de 13**, con un patrón que se lee solo:

| base que dice ML | lo que descontó Mercado Pago |
|---|---|
| $11.240 | **$5.620** |
| $21.520 | **$10.760** |
| $12.290 | $8.819 |

**La MITAD clavada en 10 de 11.** O sea que **`base_cost` NO es lo que pagás vos: es el envío
ENTERO**, y ML lo reparte. Tomarlo como nuestro costo habría **duplicado el envío en todos los
márgenes** — y encima habría salido como "hallazgo" (*"nos están cobrando el doble"*) cuando no
pasa nada. **El error más caro que podía tener este pedido era creerle al primer número.**

**LOS DESCUENTOS QUE ÉL QUERÍA VER ESTÁN TODOS EN CERO.** `loyal_discount`, `special_discount`,
`gap_discount` y `compensation` dieron **0 en las 11 ventas**. O sea que **no hay nada que guardar**:
la idea era abrir el envío en sus partes y las partes vienen vacías. Se deja el comando para poder
volver a medirlo, y no se guarda nada — guardar ceros es peor que no guardar.

**`ratio` NO ES UNA FRACCIÓN Y NO SÉ QUÉ ES.** Viene como 38110, 15050, 17878.52, 13020… números
del tamaño de un precio, distintos entre ventas que dan el MISMO resultado. Multiplicar por eso da
cientos de millones. **Queda anotado como desconocido en vez de inventarle un significado**, que es
lo que hizo fallar la primera versión de este comando.

**AYELEN NO SE PUDO MEDIR, Y HAY QUE DECIRLO.** En 30 días tuvo **2 ventas** arriba de los $33.000
y las dos sin liquidar. Las 11 medidas son de Adriana, Luciana y Matías. Es la lección del 20/09
otra vez —*"una prueba que cubre 3 de 4 no prueba el caso que falta"*— y acá Ayelen es justo la
distinta: es la única **gold**, las otras tres son platinum. Si el reparto del envío depende de la
reputación, es en ella donde cambiaría.

**EL ERROR QUE CORTÓ LA PRIMERA CORRIDA, y no lo agarra `node --check`:** el probe usaba
`MIN_GROSS`, que **existe en el archivo pero 16.000 líneas más abajo, adentro de otro bloque**.
Compila perfecto y muere en ejecución con *"MIN_GROSS is not defined"*, llevándose la corrida
entera. Es el mismo caso que `invUpd` el 12/09 por la otra puerta: aquella vez el nombre ya estaba
usado, ésta vez el nombre existe pero **no en ese alcance**. **Antes de usar un nombre en
`sync.mjs`, mirar si está definido ACÁ y no en otro lado.**

## EL CUPO DE FULL: ML NO LO DA, LO CARGA ÉL, Y VENCE (21/09/2026)

Pedido suyo. Mandó las cuatro pantallas de Full y **son DOS cupos, no uno**:

| cuenta | chicos y medianos | grandes |
|---|---|---|
| Luciana | 484 | 86 |
| Matías | 163 | 100 |
| Adriana | 97 | 100 |
| **Ayelen** | **42** ⚠️ (la barra le sale NARANJA) | 100 |

**El que aprieta es el de chicos**, que es casi todo lo que vende: entre las cuatro quedan **786
unidades chicas**, y Ayelen sola se lleva el problema. El de grandes no lo toca nadie.

**QUÉ ES "GRANDE": regla suya, textual —** *"el único producto que es 'grande' son los tenders.
nada más"*. Por eso **NO se adivina con las medidas de la ficha**: la lista de palabras vive en
`cyc/mlconfig/cupoGrandes` y cada ficha la puede pisar con `grandeFull`. Corrido el 21/09, la lista
agarra **exactamente un producto: "Tendedero 3 Pisos"**, y los otros 147 van al cupo de chicos.
`cupo` sin argumentos imprime esa lista — mirar la lista antes, como siempre.

**EL NÚMERO ENVEJECE Y ESO SE DICE.** *"Podés enviar hasta N"* es lo que le quedaba libre **en ese
momento**, no el cupo total: baja al despachar y sube al vender. El panel descuenta lo despachado y
suma lo vendido desde la lectura, **muestra los tres términos** (si la resta que invita la pantalla
no es la que hace el sistema, la pantalla está mal) y **a los 7 días pide mirarlo de nuevo**.

**AVISA, NO FRENA.** Al cerrar la caja, si se pasa, pregunta y deja seguir. El cupo se carga a mano
y puede estar viejo: trabar un despacho con un número que quizá ya no es el de hoy sería peor.
Mismo criterio que el tope del pedido de Paraguay. **El único freno duro de este panel sigue siendo
el piso del margen.**

**El ⓘ de ML no dice dónde corta el tamaño** — explica la barra (azul oscuro lo guardado más lo que
está entrando, clarito lo que está en un plan de envío). Así que el corte entre chico y grande
sigue sin saberse, y hoy no importa porque el cupo de grandes no lo toca nadie.

## CARGAR LO QUE ENTRA EN EL CUPO, SIN METER TODO EN UN PRODUCTO (21/09/2026)

Pedido suyo mirando una caja de Ayelen con **287 u. cargadas y 52 de cupo**: *"quiero que haya otro
botón que diga cargar lo sugerido, pero que tenga en cuenta las unidades que podemos mandar y que no
se pase. Y obviamente tiene que ser inteligente, porque si puedo mandar 50 unidades no conviene
mandar las 50 en un mismo producto, sino tapar el agujero lo mejor posible para poder sacar más
dinero, o sea mandar 10 unidades de 5 productos sin stock."*

**Son DOS botones y la diferencia importa:** *"Cargar lo sugerido"* carga TODO aunque se pase
(decisión suya del 30/08: *"cargame todo, yo después saco lo que no entra"*), y **🎯 "Cargar lo que
entra en el cupo"** llena hasta donde ML te deja mandar hoy. El segundo **sólo aparece si esa cuenta
tiene el cupo cargado**: un botón que no puede hacer nada es peor que no tener botón.

**LA CUENTA: se maximiza la PLATA que se destraba, no las unidades.** Una unidad sólo produce
ganancia si esa cuenta la alcanza a vender, así que vale *"lo que deja ese producto por unidad"*
hasta tapar el hueco y **cero después**. Eso ya reparte solo entre productos —el hueco de cada uno
es finito—, que es exactamente lo que él pide.

**VAN DOS RONDAS: una unidad a cada uno, y después llenar por plata.**

### LA PRIMERA VERSIÓN REPARTÍA DEMASIADO Y ÉL LO CUESTIONÓ BIEN

Yo había puesto una ronda 1 generosa —a cada producto, lo que vende en los 8 días del viaje, con
tope de parte pareja del cupo— y con su ejemplo repartía **18/8/8/8/8**. Él preguntó:
*"¿tuviste en cuenta que quizás mandar 50 a uno es mejor que dividirlo? porque ese de 50 se venden
todas en un día y se le gana el doble de % por ejemplo"*.

**MEDIDO CON LA FUNCIÓN CORRIENDO, y tenía razón:** cupo 50, cinco productos en cero, el mejor deja
$5.000 por unidad y el peor $1.000.

| | deja |
|---|---|
| el reparto 18/8/8/8/8 | **$170.000** |
| ir derecho por plata (30 al primero, 20 al segundo) | **$230.000** |
| **1 unidad a cada uno y el resto por plata** (30/17/1/1/1) | **$224.000** |

**Mi reparto tiraba el 26%.** Con una unidad a cada uno se pierde **2,6%** y **ninguna publicación
queda vacía**, que es su regla del 19/08 (*"en cero no vende — eso no es reponer, es la diferencia
entre vender y no"*). Quedó así.

### DE SUS DOS ARGUMENTOS, UNO VALE Y EL OTRO NO — Y ESTO ES LO QUE NO HAY QUE VOLVER A TOCAR

 · *"se le gana el doble de %"* → **ya estaba cubierto**: el orden es por la plata que deja cada
   unidad, así que el de más margen va primero y se lleva más. Medido: cuando el que vuela deja el
   doble se lleva 19 de 20; cuando deja menos, se lo lleva el otro.
 · *"vende 50 en un día"* → **la velocidad NO cambia nada, y esto es lo que sorprende.** Un producto
   que vende más rápido necesita proporcionalmente más stock para sostener ese ritmo, así que **por
   unidad de lugar en Full deja lo mismo**: se cancela. Lo que decide es cuánto deja cada unidad, no
   qué tan rápido sale. La velocidad quedó sólo como desempate, para el que se queda sin stock antes.

**LA LECCIÓN, y es para mí:** la ronda 1 la puse para cumplir su pedido de *"no meter las 50 en uno
solo"*, y la puse **sin medir cuánto costaba**. Costaba un cuarto de la plata. Un freno que se pone
"por las dudas" también tiene precio, y ese precio se mide igual que todo lo demás.

**Lo que no entró se DICE**, abajo de las barras y no en un aviso que se va solo: son unidades que el
panel dice que hay que mandar y que quedaron para la caja siguiente.

**El que no se pudo medir va último pero NO se descarta**: si sobra cupo lo recibe igual, y la ronda
1 le garantiza algo. Es un producto que el panel dice que hay que mandar, no uno descartado.

## LAS FOTOS ESTABAN MAL: ERAN DEL PRODUCTO Y NO DE LA VARIANTE (21/09/2026)

Lo marcó él mirando Armar caja: *"las fotos están mal"*. Los **nueve aromas del Paulvic mostraban la
MISMA foto**. Y era cierto: la foto se buscaba por **PRODUCTO**, y el Paulvic es UNA ficha con muchos
aromas, cada uno con su publicación aparte. Se mostraba la del primero que apareciera, para todos.

**Es el mismo caso que el código de etiqueta de Full, que ya estaba resuelto hace semanas**: cuando
el renglón nombra una variante, el dato es de la PUBLICACIÓN de esa variante, no de la ficha. Por eso
las dos cosas pasan ahora por **`pubDeVariante`**, una sola función — con dos copias el código
podría ser de un aroma y la foto de otro, **que es peor que no tener ninguno de los dos**: él usa
las dos cosas justamente para chequear que está mandando lo correcto.

**NO SE ADIVINA**, igual que con el código: si el título no nombra ninguna variante de la ficha, se
cae a la foto genérica en vez de mostrar la de otro aroma.

**Cuándo gana la de la variante sobre la que él cargó a mano:** sólo cuando el renglón pide una
variante **y** se pudo identificar su publicación. La de la ficha es genérica (vale para los 70
aromas) y la de la publicación es de ÉSE, así que para ese renglón es la correcta. En un renglón sin
variante manda lo de siempre: lo que él cargó.

## CUÁNDO LLEGÓ CADA VENTA Y CUÁLES VOLVIERON (21/09/2026)

`campos` había medido el 21/09 que el envío trae `status_history` (`date_shipped`,
`date_delivered`, `date_not_delivered`, `date_returned`) y `return_details`, y **nada de eso se
guardaba**: el panel sabía cuándo se VENDIÓ y nunca cuándo llegó.

El comando es **`entregas[:días][:go]`** y corre solo en `ml-daily`. En pantalla va un chip en cada
venta de Ventas x Producto: **📬 llegó + cuántos días tardó**, **↩ volvió**, o **⚠ no se entregó**.

**LO QUE SALIÓ DE LA PRIMERA MEDICIÓN, y es un número que no teníamos: de 250 ventas, 235
entregadas y 0 devueltas. Tarda en llegar 1,6 días en promedio, la mitad en 1,2 o menos, y la más
lenta 6 días.**

**⚠️ OJO CON DE QUIÉN ES EL DATO.** La MISMA respuesta del envío trae el **nombre, el teléfono y la
dirección del comprador**, y el registro de GitHub es PÚBLICO. `leerEntrega` lee **sólo fechas y
estados**, y del `return_details` guarda que hubo devolución y su fecha, **no el motivo**, que lo
escribe el comprador. Es la regla del 15/09 aplicada antes de que muerda.

**VIVE EN `cyc/entregas`, APARTE DE LA VENTA, y no es un detalle de forma:** el ciclo de 2 minutos
reescribe la venta ENTERA con `set` sobre una ventana de 2 días, así que una entrega guardada
adentro **se borraría sola y en silencio**. Es el bug de `cyc/mllinks` del 05/08.

**`wasDelivered` ya no lee el envío por su cuenta**: llama a `leerEntrega`. Dos lugares parseando la
misma respuesta se separan. Y se respetó **al pie** su condición vieja (`status` O `substatus` ===
delivered): de eso depende que una cancelada cuente como RECLAMO, y el % de reclamos encarece el
costo y con eso mueve precios.

**Lo que NO hace: inventar un estado.** Una venta sin registro no muestra nada — *"todavía no se
midió"* y *"no llegó"* son cosas distintas. Un `null` de ML se cuenta aparte y no se guarda.

## PEDIDOS AVISA CUANDO UN RENGLÓN NO CIERRA (21/09/2026)

Es el pendiente anotado desde el 16/09: *"un producto no puede destrabar más por mes que lo que deja
lo que vende, y algo con stock que no vende hace 55 días no puede estar en la lista de comprar. Hoy
eso lo agarra él mirando; el panel lo puede agarrar solo."*

**LOS DOS EJEMPLOS QUE ÉL DIO YA ESTÁN TAPADOS EN EL ORIGEN**, y conviene decirlo en vez de escribir
un filtro que nunca va a saltar: desde el 16/09 `riesgoComprar` sale de los días que la compra TAPA
de verdad (así que por construcción no puede pasar de `gan30d`) y el ritmo viejo sólo se usa con el
producto en CERO. Los dos quedan igual, pero **como GUARDA**: si alguien toca esas cuentas y se
rompen, el renglón lo dice en vez de esperar a que él lo note.

**Lo que SÍ puede pasar hoy, que es lo que agrega valor:** un pedido cargado **a mano** (a ésos no
les recalcula la cantidad nadie), una ficha **sin costo** —ahí la plata en riesgo sale inventada,
porque el producto se ve como si fuera todo ganancia—, un ritmo sacado de **una sola venta**, un
renglón **sin ficha**, y la resta que no cierra (pide comprar teniendo ya el objetivo).

**AVISA, NO BORRA**, y cada motivo está elegido para ser RARO: un aviso que suena en la mitad de la
lista entrena a ignorarlo. Si no hay ninguno **no se dibuja nada** — un cartel que dice "hoy está
todo bien" es ruido.

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

- **LA PANTALLA DE CARGA: "CYC" CON EL PUNTITO VERDE (19/09/2026).** Pedido suyo: *"al cargar la
  web puede ser que en vez de mostrar cargando y un circulo girando, muestre CYC y el puntito verde
  recorriendo las letras"*. Reemplaza al circulito que giraba: mientras arranca, lo que se ve es la
  marca y no un cargador genérico. El texto de abajo (`load-msg`) **no se tocó**: es el que dice
  *"Error: …"* cuando la conexión falla, así que sacarlo dejaba el fallo mudo.
  **LAS DEMORAS NO SE PUSIERON A OJO, Y HACÍA FALTA MEDIRLAS.** La primera versión las estimó en
  16% / 47% / 78% del ancho y quedaron **~0,07s tarde**: el punto pasaba por abajo de una letra que
  todavía estaba apagada, o sea que "recorrer las letras" no se veía. Se midió en el navegador
  dónde cae el centro de cada letra —**17,1% · 50,0% · 82,9%**— y de ahí salen las tres demoras.
  Y la cola de encendido pasó de 26% a 22% de la vuelta: con 26% terminaba en 1,65s sobre una vuelta
  de 1,6s, o sea que la tercera C volvía a prenderse al arrancar la vuelta siguiente.
  **SE VERIFICÓ MIRÁNDOLO, no leyendo el código**: se sacaron el CSS y el HTML REALES del archivo,
  se congeló la animación en cuatro puntos de la vuelta y se sacó una foto con el navegador. En las
  tres primeras el punto queda **abajo de la letra encendida**, y en la cuarta sale apagándose.
  Probado en los **dos temas**: en claro las letras apagadas quedan grises y el punto verde se ve.
  **Ojo al sacar una foto con el navegador sin cabeza: la primera dio "no hay punto" y el punto
  estaba — lo cortaba la ventana**, que era 9px más baja que el punto. Un elemento que no aparece en
  una captura no es un elemento que no existe: antes de salir a buscar el bug, agrandar la ventana.
  Y `index.html` entero **no se puede fotografiar**: se cuelga intentando conectarse a Firebase. Por
  eso la prueba es del pedazo, con el código real.
  Si el teléfono tiene pedido *"menos movimiento"*, no parpadea nada: queda CYC en verde.

- **"NUEVO PEDIDO" A MANO SE SACÓ DE PEDIDOS (19/09/2026).** Decisión suya: *"sacar eso de agregar
  manual. ya que va a ser todo por el bot o vos"*.
  Era el formulario de arriba de Pedidos —producto, cantidad, Urgente/Poco stock/Suficiente, nota,
  proveedor y **+ Agregar**—. **Estaba DOS veces, en Bs As y en Paraguay**, idéntico; él mandó la
  captura de una sola y se sacaron las dos, porque el motivo que dio ("todo por el bot o vos") no es
  de una sección. Se sacó el formulario, `addPedido` y `pedAutoFill`, y las cuatro clases de CSS que
  sólo usaba él (`inp-prod`, `inp-qty`, `inp-nota`, `inp-prov`).
  **LO QUE NO SE TOCÓ, y son las tres trampas que había adentro:**
   · **La lista de productos** (`<datalist id="vp-prod-list">`) la sigue usando **el renglón de
     editar una venta**. Es la MISMA trampa del 18/09 con "Registrar venta", una pantalla más allá.
   · **La clase `.pedidos-add`** la usan otras **tres** pantallas (líneas 765, 1076 y 1650): se
     borraron sólo las clases de los campos, no el contenedor.
   · **`pedVentasNorm` y `PED_MAX_DAYS`** los usan ~25 lugares. `pedAutoFill` era uno más.
  **Y NO SE TOCÓ NADA DE LOS PEDIDOS `auto:false`** (`togglePedidoOrigen`, el refresco de la nota,
  `esPedidoPaulvic` con el campo Proveedor). Hoy hay **0 pedidos a mano** de 54 —medido con
  `revisarpedidos` el 17/09— pero ese código es lo que los mueve de Bs As a Paraguay y lo que hace
  que un pedido viejo no quede congelado; sacarlo es más riesgo que beneficio.
  **Los pedidos los sigue armando el panel solo** (`syncPedidosAuto`), que es lo que ya venía
  pasando: la pantalla no pierde ninguna forma de crear un renglón que se usara.
  Marcados los bordes a mano (los dos bloques de HTML y el cierre exacto de las dos funciones) y
  corrido el chequeo de las tres listas **más las clases de CSS**: falta **exactamente** lo que se
  quiso sacar —2 funciones, 14 `id`, 4 clases— y **0 nombres nuevos**.

- **"REGISTRAR VENTA" SE SACÓ DE VENTAS x PRODUCTO (18/09/2026).** Decisión suya: *"sacar el
  registrar manual, ya que nunca se va a usar. ya se hace automatico (ojo, que siga funcionando
  como viene lo de cargar ventas, simplemente eso no lo uso nunca yo)"*.
  Era el formulario de arriba de todo —cuenta, N° de venta, producto, cantidad, total, neto, el
  carrito y el botón de guardar—. **Las ventas las trae el robot solo cada 2 minutos y eso no se
  tocó**, ni tampoco **editar una venta ya cargada**, que sigue igual abajo en la lista.
  Se borró entero: el formulario y las seis funciones que sólo lo servían (`vpCostHint`,
  `vpAddToCart`, `vpRemoveCartItem`, `vpClearCart`, `renderVpCart`, `saveVenta`), la variable
  `vpCart` y la clase de CSS `ii-monto`, que no la usaba nadie más.
  **LA TRAMPA, Y ES LA DEL 21/08 OTRA VEZ: adentro del bloque a borrar vivía la lista de productos**
  (`<datalist id="vp-prod-list">`), que **la usan otras tres pantallas** — Pedidos Bs As, Pedidos
  Paraguay y el renglón de editar una venta. Borrarla de paso dejaba esos tres campos sin sugerencias
  y no lo habría agarrado ningún chequeo de sintaxis. Se sacó del formulario y quedó suelta, con el
  motivo escrito al lado.
  Marcados los bordes a mano (HTML 1409-1445 y tres bloques de código) y corrido el chequeo de las
  tres listas: falta **exactamente** lo que se quiso sacar y **0 nombres nuevos**.

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
  **POR QUÉ LAS RETIRÓ, ACLARADO POR ÉL EL 19/09/2026: *"las microsd las tire porque eran truchas,
  estas son originales"*.** La nota decía *"son para problemas"* y eso se lee como *"las tarjetas de
  memoria son un rubro problemático"* — y con eso yo descarté de los candidatos nuevos una **microSD
  SanDisk Pokémon 256GB original de Nissei que da 63% y tiene 100 vendidas**. El motivo NO era el
  rubro: era que ESAS eran falsificadas. **Una tarjeta de memoria original entra como cualquier otro
  producto.**
  **LA LECCIÓN: una decisión suya anotada sin el MOTIVO se convierte en una regla que él nunca
  puso.** "Son para problemas" no dice si el problema era el producto, la marca, el proveedor o el
  precio — y cada una lleva a una conclusión distinta. Al anotar una decisión hay que escribir por
  qué, no sólo qué.
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
