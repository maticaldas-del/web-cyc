# CYC · panel de MercadoLibre — LO VIGENTE

> **La historia completa (bugs y cómo se encontraron, mediciones, decisiones viejas con su porqué, revisiones y etapas
> cerradas) está en `ml-sync/HISTORIA.md`** — copia textual de este archivo hasta el 22/10/2026. **Buscá ahí con grep antes
> de concluir algo que no está acá** (ej. `grep -n -i "lapidus" ml-sync/HISTORIA.md`). Si algo de HISTORIA choca con este
> archivo, manda este. Las reglas de PRECIOS mandan en `ml-sync/CEREBRO.md`.
>
> **Regla para mantener este archivo chico:** acá va sólo la versión vigente de cada regla, en pocas líneas, con su fecha.
> Cuando una regla cambia, se REEMPLAZA el renglón (no se agrega abajo). El detalle largo, el caso y la medición van a
> `ml-sync/REVISION.md` (en su etapa) o a `ml-sync/HISTORIA.md`.

## 0 · DÓNDE ESTÁ CADA COSA

| archivo | qué tiene |
|---|---|
| `ml-sync/CEREBRO.md` | **las reglas del cerebro de precios** (quién manda, techo, escasez, sobra, descuentos, gemelas, pedidos, cajas). Cada vuelta arranca leyéndolo. Manda en precios. |
| `ml-sync/VENTAS.md` | **cómo se juzga una venta** (lo que lee el ayudante de ventas con la ficha, en vez de todo esto). Regla que toca ventas → también ahí |
| `ml-sync/REVISION.md` | cada cambio anotado en su etapa (qué es · dónde vive · qué chequear) + el calendario de revisiones |
| `ml-sync/PROMPT_GUAY.md` · `PROMPT_LISTAS.md` | lo que se le pega ENTERO al chat de compras (no lee direcciones remotas) |
| `ml-sync/PROMPT_RUTINA_LOCAL.md` | la rutina DIARIA del chat de Chrome (26/10, él dice "rutina"): cupo de Full de las 4 · disponible de Mercado Pago de las 4 · repaso del Pedido del momento en Nissei → deja un mensaje `RUTINA <fecha>` en el 📬 buzón y yo lo cargo |
| `ml-sync/PROMPT_IMEGA.md` | lo mismo que ONCE para un solo mayorista que conoce Tito (Imega, 29/10). **Todos los `PROMPT_*.md` se ven en la web** (Mi oficina → 🤖 Textos para el chat de Chrome, con 📋 Copiar; `prompts:go` cada noche, 29/10, él: *"yo le digo lo que quiero que haga y listo"*): uno nuevo o cambiado → `prompts:go` en el momento |
| `ml-sync/PROMPT_ONCE.md` | lo que se le pega al chat de Chrome para buscar mayoristas del Once con precios en internet y cargar sus listas (28/10) |
| `ml-sync/CHAT_LOCAL.md` | **todo lo que sabe el chat de Chrome y CUÁNDO hace cada cosa** (30/10, él: *"sin horario y sin fecha"*: cada vez que lo prenden mira la línea 🤖 "Última vez" del 📬 buzón y hace lo que toca: RUTINA si no fue hoy · CAJAS si hay MANDALA YA · GUAY/LISTAS/ONCE cada 7+ días · IMEGA 14+ · con lo que sobra revisa la Tienda página por página entera; cada tarea deja un mensaje que EMPIEZA con su nombre y yo lo leo en el buzón) (30/10, él: *"si abro un chat nuevo pueda leer todo y sepa todo lo que sabe el de hoy"*): quién es quién, reglas y la tienda; `prompts:go` lo pega con TODOS los `PROMPT_*.md` en "🧠 Todo (para un chat nuevo)" (arriba de todo en la web). Lo que hace el chat local sin PROMPT propio va acá |
| `ml-sync/PROMPT_CAJAS.md` | lo que se le pega al chat de Chrome para armar las cajas "MANDALA YA" en ML (él dice "arrancá"; lee el panel, carga Planificación de envíos, no confirma) |
| `ml-sync/AUDITORIA.md` | auditoría del robot (datos crudos contra el `informe`) |
| `ml-sync/notas/` | `para_mati.md` (dudas que esperan su respuesta) · `preguntas.md` (cada corrección suya vuelta pregunta general) · `correcciones.md` (cuántas veces me corrigió) · `techo.md` · `ideas.md` · `sin_estirar.txt` · `decide_pedidos.py` · `decide_cajas.py` · `pedidos.txt` · `juicios*.txt` · `listaweb_iscos.txt` |
| `ml-sync/HISTORIA.md` | todo lo viejo, textual |
| `index.html` / `sw.js` / `ml-sync/sync.mjs` | la app (PWA en un archivo) · su caché · el robot (~todos los comandos "probe") |

## 1 · CON QUIÉN HABLÁS Y CÓMO

- **Matías**, revendedor en ML desde Argentina. **No es programador: castellano llano, sin términos técnicos** ("endpoint",
  "commit", "deploy" no). Si hace falta nombrar algo técnico, explicarlo en una frase en criollo.
- Dale **el número y la conclusión**, no el camino. Si algo está mal, decilo derecho y proponé qué hacer.
- **Decisiones: TODAS JUNTAS, en UN mensaje, numeradas, cada una corta con (a) sugerida y (b)**; él contesta "1a 2b 3a"
  (08/10, *"quiero que me pases todo lo que hay que decidir todo junto siempre"*). Ideas de revisiones también todas juntas.
- **Toda decisión de bajar un precio va con el % de seguridad de que es el techo** (27/10, él: *"dame el % de seguridad de que es un techo. sino me faltan datos para responder"*): `techo95:<MLA>` de cada uno; si no hay %, cuántos días lleva y qué falta.
- **Dudas para él: a `ml-sync/notas/para_mati.md`, no sueltas en el chat** (23/10, *"me pierdo… guardalas y después te pido y
  resolvemos. De mientras andá haciendo"*): se anotan ahí y se sigue con lo que no lo necesita; cuando pida "resolvamos" se le pasa
  la lista entera, numerada. Lo urgente que cuesta plata sigue por `pregunto:URGENTE: …` (CYC Avisos = sólo urgente y recordatorios).
- **Horario para resolver** (24/10, él: *"12:30 entro a trabajar y puedo hacer de cyc tranquilo"*): **10:00** sólo lo que, si no lo resuelve antes de las 12:30, pierde plata o es súper importante (`trig_01XcMnTFRBwdBa5kgH1b2hko`, sale 9:48); **12:30** todo lo demás junto, con íconos y numerado, para resolver de 12:30 a 16:00 (`trig_011SxsjVECrbY9b8ZkkhdBUT`, sale 12:19). Las dos en este chat, todos los días.
- **Lo chico y reversible lo elegís vos** y se lo contás (24/09: *"elegí vos qué hacer, excepto que sea una decisión muy
  importante, grande y difícil"*). Se pregunta lo grande: precios que mueven plata fuerte, borrar datos, reglas del negocio,
  algo irreversible, y lo que no tenga respuesta clara.
- **Él no marca nada a mano** (26/09): "Ya lo pedí", "Llegó", caja recibida, oficina, disponible, vínculos, etc. me lo dice y lo
  hago yo por comando. **Las publicaciones en ML las crea él**; yo creo la ficha en CYC y la vinculo (elijo la cuenta).
- **Toda tarea completa, nunca a medias** (09/10). **Un error que marca él se busca en todo el sistema** (16/10): arreglarlo en el
  código, buscar el mismo patrón en otras pantallas y en el robot, y decirle cuántos más había (aunque sea "ninguno").
- **Objetivo: que no tenga que corregirme** (20/10). Cada corrección se cuenta en `notas/correcciones.md`, se vuelve pregunta
  general en `notas/preguntas.md`, y si es de una venta va también a la sección 7 de `ml-sync/VENTAS.md` (corto). 🧐 **¿Tiene sentido?** antes de usar un número: cruzarlo con otro tamaño, otra cuenta, el costo,
  parecidos. No se le promete "95% sin errores".
- Cuando un número mío choca con lo que él sabe del negocio, **el que está mal es mi número**. Explicación sin medir = adivinanza.
- **Los motivos de Pedidos los lee Tito (su papá)**: todo motivo de `ped:` arranca con **"Hola Tito!"**, corto y en criollo
  (cuántas y por qué). Los de `caja:` los lee Matías.
- Cada lugar del 🧠 dice lo suyo: Ventas/Productos/Rotación → nota de precio (`mlapi/claudeexp/<MLA>`); Pedidos → `ped__<id>`;
  Armar caja → `caja__<id>__<cuenta>`; día → `dia__<AAAA_MM_DD>` (sólo si fue importante). En palabras simples, sin técnica.
  Cada nota dice el último cambio con su motivo y, si hoy no se toca, **"HOY NO LO TOCO PORQUE …"**.

## 2 · EL NEGOCIO

- **Socios: Matías y su padre (Tito).** CYC es la tercera parte (se reparte de a tres: CYC, Matías, padre).
- Cuatro cuentas de ML, misma familia, cada una con su CUIT y monotributo. **Apellidos, CUIT y domicilios NO van acá (repo
  público)**: están en las constancias de ARCA, los tiene Mati. El código usa el nombre de pila (`cyc/inventory/<prod>__ayelen`).

| cuenta | categoría hoy (VEP 09/2026) | impuesto integrado | rubro / notas |
|---|---|---|---|
| Adriana | G | $71.497,87 | **perfumería** (perfumes van acá) |
| Luciana | F | $57.719,64 | |
| Ayelen | H | $204.811,64 | + autónomos $57.598,04 + obra social $55.485,33 (único aportante) |
| Matías | F | $57.719,64 | actividad "venta al por menor por internet" |

- Total a ARCA ~$504.832/mes. **Como gasto sólo va autónomo + obra social de Ayelen ($113.083)**; el impuesto integrado ya se
  descuenta como % en cada venta. **El panel descuenta categoría H en las 4** (30/09); la diferencia con lo pagado queda como
  deuda con ARCA dentro de CYC (`arcaDeudaARS`, desde `cyc/mlconfig/arcaHDesde`=2026_05; al pagar, cargar `arcaHPagadoHasta`).
- **Pendiente para el contador:** recategorizar Luciana y Matías (F facturando a nivel G/H); actividad de Luciana y Ayelen
  ("marroquinería") → "venta al por menor por internet"; facturas entre las cuatro cuentas (inflan facturación); intereses/multas de H.
- **Topes ARCA vigentes ago-2026 a ene-2027** (`MONO_CATS`): G $53.995.798,87 · H $81.924.660,37 · K $126.610.838,75 (límite compras
  = 80% de K). **Actualizarlos en febrero 2027.** Ventana de 12 meses corridos, por CUIT. **Él no quiere pasarse de H, menos RI.**
- **Tope de H en Inicio (⚖️, una sola tarjeta):** facturado oficial = el MAYOR (por cuenta, ventana entera) entre ARCA y ventas
  (`_facVentana`); ARCA de ene-sep cargado con `factarca` (4 cuentas, 01/10); desde ago-2026 las facturas del facturador de ML con CAE
  (`cyc/facturas`) + ventas sin factura (`facturas_sin`) + `cyc/fact_fuera`. El robot (`topeh`, `catmono`) todavía no lee `fact_arca`.
- **Comprar con factura** (13/08): no comprar más, comprar lo mismo con factura a nombre de: Ayelen 40% · Adriana 35% · Luciana 25% ·
  Matías 0. En monotributo las facturas de compra no bajan lo que se paga: respaldan. Facturas RECIBIDAS (`cyc/facturas_recibidas`) NO son gastos.
- Facturador automático de ML configurado en las 4 (punto de venta 2, tipo "Factura Electrónica - Monotributo - Web Services").
- **Casi todo se vende por Full. Nada fuera de Full** (18/10): lo activo en depósito con unidades lo pausa el robot cada hora; el
  "1" de depósito que pide ML no es mercadería (stock fuera de Full = 0, no cuenta en patrimonio).
- **La mercadería no se mueve entre cuentas** (22/09): un producto nuevo queda en su cuenta para siempre. Orden para elegir dueña:
  1) la que ya lo publica · 2) **el rubro (perfumes → Adriana)** · 3) el equilibrio: **entre Ayelen y Luciana** (23/10, *"van en la de ayelen o luciana. dependiendo el cupo de monotributo"*), **la que más lugar tiene contra el tope de H**
  (proyección al cierre de la ventana de ARCA, entre las que llegan al 25%; `repartopy` y la tarjeta ⚖️ eligen entre Ayelen y Luciana, las otras sólo si ninguna llega; `lugarHPorCuenta`; 7a del 22/10) · y la actividad de ARCA. **Una sola cuenta por producto** (09/09; excepción Paulvic: Adriana + Persea en
  Luciana). En la MISMA cuenta sí puede repetirse. **P47 y P47 oreja de gato: sólo Ayelen** (29/10, él: *"en Matías y Adriana no van más"*; 13 cerradas con `cerrarpub`, quedan 6 activas de Matías con ~6 u. en Full que se cierran cuando se vacíen).
- **Pedidos mira el stock de las 4 cuentas juntas** (C1, 29/09: si en total se vende 10/mes y hay 10 en otra cuenta, no se compra).
  **No volver a proponer calcularlo por cuenta.**
- **Cobro del mes = lo que CRECIÓ CYC** (29/10, él eligió 1a: *"cobrar lo que crece cyc dividido 3… para unificar todo"*, con el local y todo): (patrimonio del cierre − el del anterior, al dólar del cierre) + **lo que ya retiraron ese mes** (el arqueo es después de retirar) − lo viejo cargado tarde (`cyc/cobro_corr/<mes>`) ÷ 3 cada socio, **redondo de a $100.000 para abajo** (29/10, él: 1.699 → 1,6M; lo que sobra queda en CYC); ×2 = retiro del mes siguiente. Tarjeta 💸 abajo de "Cerrar el mes" en el Arqueo (`_cobroCrec`). **Sin promedio de meses** (él: desde octubre CYC cambió mucho, los meses de antes no sirven). Reemplaza el "💸 cuánto cobrar" del 17/10: se sacó de Ventas de hoy (29/10, él): el cobro vive sólo en el Arqueo. **El retiro es automático** (29/10, él: *"esto sacarlo, y siempre vamos a cobrar lo que diga ahí"*): sin casilla; el de cada mes = 2 × el cobro del cierre anterior (`_retiroAuto`, se escribe solo en `cyc/retiro_mes` para el robot). **El de un mes que ya empezó queda congelado** (30/10, 9a: `cyc/retiro_congelado`); una corrección después va al retiro del mes siguiente. `retiromes` ya no carga desde 2026_11; lo viejo cargado tarde se carga con `cobrocorr:<mes del cierre>=<pesos>|<nota>;go`. El interés del capital en dólares ya no se paga desde el 19/09 (ver HISTORIA).
- **LA ESTRATEGIA PARA GANAR MÁS (22/10/2026, eligió 1a 2a 4a 5a 6a 7a 8b; la 3 quedó para después).** **El límite es REPONER, no el tope de H** (27/10, él: *"si vendemos mucho, no llegamos a reponer ni por plata ni por lugar en la camioneta ni porque el mayorista se queda sin stock, por eso es mejor defender la mercadería lo máximo… hay muchos productos que se le pueden ganar muchísimo y todavía no compramos… una vez encontrado el techo ahí los precios se bajan para quedar en el precio que más ganancias da"*; `topeh` 27/10: $54,6M de lugar al 31/12): lo que sube la ganancia es **cuánto deja cada $100 facturados** (oct: $19, meta $22;
  meta $1.200.000 c/u = ~37,3% de margen promedio). 1a **comprar algo nuevo pide 35%** (`CAND_VARA_COMPRA`, web y robot; Paraguay y
  Listas); ~~entrada con 30%~~ y ~~reponer en 25%~~: **desde el 24/10 TODO pide 35%** (comprar, reponer, Paulvic incluido, listas y el local; él: *"no tenemos suficiente plata para todo, enfoquémonos en 35 o más"*); lo de 25-34% queda guardado y se sigue midiendo ·
  2a lo que queda abajo de 35% después de buscarle techo **no se repone** (24/10; el "25-35% se sigue reponiendo" del 22/10 quedó sin efecto) y le propongo un reemplazo; al terminarse, la publicación queda pausada · 4a tarjeta 🧮 Mezcla en
  Métricas · 5a **Watch S5 y Redmi Pad 2 no se reponen más** · 6a **Full: meta menos de $100.000/mes; un retiro de Full sólo con su
  OK** · 7a lo nuevo va a la cuenta con más lugar contra H · 8b **por ahora las 4 cuentas en H, sin 5ª cuenta ni K**. Detalle en
  `ml-sync/CEREBRO.md` (💹). La 3 (ordenar compras y pedidos por ganancia por peso facturado): **no se toca por el momento** (él, 22/10); no volver a proponerla hasta que la saque él.
- **🎯 Objetivo: bajar hasta que desaparezcan el rojo y el naranja de 🧮 La Mezcla** (27/10, él: *"un objetivo debe ser bajar/desaparecer los naranjas/rojos"*): rojo = ventas abajo de 25%, naranja = 25-35% (de lo facturado). Cada decisión de precio, pedido, caja y compra se pesa contra esto: lo que vende abajo del 35% sube, se reemplaza o no se repone (sin romper sobra/stock antiguo). Se mira por semana en Métricas.
- **🧲 Ir a los extremos** (29/10, él eligió 1a 2a 3a): lo que vende a 35%+ no se toca (la velocidad no importa); lo que vende abajo del 35% sube; **lo que no vendió nada en 30 días con stock se liquida**: un escalón (≤15%) por semana hasta que venda, piso 0%, aunque tenga menos de 90 días (F13 se abre, `liq30`); al costo sin vender → local. La caja va a productos de 35%+.
- **Vender menos por las subas es A PROPÓSITO** (29/10, él: *"claramente estamos vendiendo menos por el aumento exagerado de precios. pero esa es la idea. una vez nos acomodemos en los precios… van a mejorar un poco las ventas… no vamos a llegar a vender el tope de H. ahí es donde entra el buscar productos nuevos para llenar ese vacío"*): la caída de unidades después de subir NO es motivo para bajar (no se le avisa como problema); el lugar que queda contra el tope de H se llena con **productos nuevos** (Nissei, listas del Once, 🌟 sin competencia), no bajando precios.
- **El límite hoy es CONSEGUIR mercadería** (27/10 a la noche, él: *"últimamente hay mucho lugar en la kangoo, y pesos, pero en bs as cuesta conseguir producto, es probable que no tengan los proveedores"*; el 27/10 eran pesos, Kangoo y mayorista: *"nos quedamos sin stock, no porque no queremos comprar, sino porque no hay"*). Una unidad vendida barata no se repone; una que espera a un precio alto se vende después. Liberar caja vale menos que el almacenamiento y el descarte.
- OSDE y el colegio son PERSONALES (no cargar). **Sancor = la obra social privada de Ayelen** (un solo renglón, monto real de la factura).

## 3 · REGLAS QUE NO SE ROMPEN

1. **Antes de tocar un precio en ML, 100% seguro de que el número es correcto.** Si no, no se toca. Después de aplicarlo,
   **releerlo de ML** (también regla 6). "Aceptar no es haber hecho".
2. **Barrera $33.000:** abajo de ese precio el comprador paga el envío; arriba ML cobra el envío de Full (~$6.000) al vendedor.
   Se frena en $32.999/$32.990 **salvo que cruzar deje claramente más plata con el envío restado** (`!cruza`, ver CEREBRO §5).
   **Si en $32.990 queda abajo del 35% en el peor caso, cruza al precio del 35%** (24/10, él: *"que vayan a ser buen producto o que se descarte, no
   que queden en el medio vendiendo al 30%"*); **sin excepción por días** (28/10, él: *"nunca, si está debajo del 35% aumentar ya. salvo que esté en liquidando"*).
3. **Techo duro $650.000** por publicación (03/10). Nunca arriba.
4. **35% de ganancia en el PEOR caso es el objetivo** (24/10, él: *"quiero que todo quede en 35% o más, me refiero a ventas y pedidos, ya
   que no tenemos suficiente plata para todo… no quiero que nada se venda a menos de 35% excepto si ya está quedando en sobrestock, ahí sí
   liquidar siempre con margen para nunca pagar stock"*; antes 25%; `cyc/mlconfig` minPct = targetPct = 35). Peor caso = ~2% de retención
   IIBB de otra provincia + el peor envío visto + cuotas. Abajo del 35% sólo con `!piso` y motivo de sobra/stock antiguo (liquidar con margen,
   antes de pagar stock antiguo) o lo que pide él, **y sólo con la unidad más vieja en Full de 90+ días: ahí se abre hasta el 0%** (27/10, él: *"nunca abajo del 35% si lleva menos de 90 dias si pasa los 90 dias de stock si se habilita bajar hasta 0%"*; freno F13; los 15 días antes del stock antiguo también abren). **Nunca abajo de 0%** (sólo él lo abre, `!bajocero`). El % se mide **costo + impuestos +
   envío de Full en el divisor** (`pctGananciaVP`, un solo % en toda la app). Reponer, comprar, listas y perfumería del local: también 35%.
5. **Bajar un precio sólo con las reglas del CEREBRO** (y las salidas 🔐 sólo con su autorización, §5): sin línea de techo no se baja · escalera (≤15% por escalón) · descuento antes
   que bajar la lista · una suba no se deshace sin 95% · no abajo del 💰 · **lo que vendió a su precio no se baja** (F14, 27/10, salvo sobra/stock antiguo o que venda muchísimo menos: menos de la mitad de la plata por día que el 💰, 95% y 7+ días, 1a del 28/10). Excepciones siempre las mismas cinco: precio mal puesto ·
   stock antiguo con fecha encima · ML la pausó por el precio · lo pide él · el envío (barrera $33.000). **La última unidad NO es
   excepción** (24/10, él con el Cuba Gold: en escalera y con techo, no de una).
6. **Releer de ML** cada cambio (precio, promo, estado, gemela) y comparar.
7. **Variantes: todas o ninguna.** Mandar la lista incompleta borra las que faltan. `setPriceTo`/`raisePriceTo` se niegan con variantes;
   se usa `raiseVariations` y se relee que estén TODAS. Cada variante es su publicación y se juzga sola (precio, stock y ventas de ESE color).
8. **Promos y descuentos** (08/10, reemplaza "sacar todas"): toda baja va primero como **descuento propio** (precio de lista tachado,
   PRICE_DISCOUNT, mín 5%, 14 días) o en una promo de ML que convenga; **nunca se sube la lista para inflar el tachado**. Cada promo
   pasa por 🤔 (sobra de verdad +90 d · no recién llegado 30+ d · 35%+ en el peor caso), aunque ML ponga plata. **El guardián de cada
   hora saca las promos que nadie analizó** (no toca las de `cyc/promoclaude`). Tag 🏷️ `promo` sólo si ML pone plata; si ponemos sólo
   nosotros es 💸 `descuento` (19/10). Cada venta en promo se avisa en el resumen de la vuelta (`cyc/promoventa`).

## 4 · CÓMO TRABAJO: EL ROBOT JUNTA DATOS, YO DECIDO

- **El robot sólo junta datos** (09/10, `SOLO_DATOS`): ventas, stock, visitas, caja, línea de tiempo, ficha médica, dólar, lo que entró
  de las cajas (`cyc/cajasentrado`). **No hay rescate, escalera, remate, cerebro, supervisor ni avisos automáticos.** Todo lo decido
  yo en las vueltas. `autoPrecios: off`. **Nunca tomar como dato una marca vieja del robot** (escalera, liquidando automático,
  `ventaEnRemate`, expediente viejo): dato crudo (`porquebajo`, ventas de 180 d, línea de tiempo).
- **Lo mecánico que sí hace solo:** sacar promos no analizadas · pausar lo activo fuera de Full · alinear cada gemela a su Clásica cada
  hora (`alinearGemelas`, `alinearGemelasEnvio`) · aviso de venta al teléfono · foto de precios · ficha y línea cada noche.
- **Vínculos los hago yo** (09/10): el robot no engancha publicaciones nuevas ni ventas; la sección 6 del `informe` lista las vivas sin
  ficha y las vinculo con `vincular` (la ficha toma el nombre de la publicación de ML, 19/10; con variantes no). **Nombre de ML en toda ficha nueva** (29/10, él: *"de todos en los últimos 30 días… cada vez que ingresa uno nuevo sí o sí nombre de ML… cuando lo publicás en ML actualizar el nombre"*): `publicar` renombra la ficha al crear y `nombreml:go` corre cada noche sobre las fichas de los últimos 30 días; las viejas no se tocan (él ya se acostumbró). Producto sin ficha →
  `nuevoprod` (costo 0 si falta, y decirlo: se ve como todo ganancia).
- **Mis decisiones no vencen** (`SOLO_CLAUDE`): Pedidos, Armar caja y máximo de compra muestran sólo lo que decidí, con motivo; lo no
  decidido dice "sin decidir".
- **El robot de precios** escribe con `decido` (y `entrarpromo`, `tag`), que pasan por los frenos `frenosBajas` (F0-F14). **Toda regla
  nueva "nunca/siempre/sólo si" que se pueda medir va al código** como freno, y REEMPLAZA la de su tema en el CEREBRO.

### Las vueltas (tareas programadas que entran a esta sesión)
- **Completa a las 03:00** (`trig_01475PwdPVJ1qTnYswcDxRq8`, 21/10: *"a las 3am siempre, así no molesta"*): ventas de la noche, todas
  las listas de alarma, las activas con stock que NO vendieron (la mitad por noche), pedidos de todo el catálogo, cajas, juicios.
  Lecturas en una corrida, 2 ayudantes (max) y el revisor en contra (max). **Domingos:** además el catálogo entero, el ayudante de
  ideas a fondo y medir las gemelas (Premium y envío gratis; proponer sacar las que no sirven).
- **Cortas a las 9:52, 11:52, 13:52, 15:52, 17:52, 19:37, 21:22, 22:52** (23/10, eligió 1a: repartidas por las ventas por hora de 90 días, ~5 ventas por vuelta; `trig_01FCaQqzU5MA422N6Z8nH63Z` hace las de :52, `trig_01PqmfnY6zLFfGBne72duRC3` la de 19:37 y `trig_01CKS5hpywhunMUppZvSNvFy` la de 21:22).
- **🔔 Control de ventas cada hora** (`trig_01PxNuKFnJfdAtPem61eaUnA`, a los :07 de 8 a 1, en la sesión de las vueltas; 26/10, él eligió 1a: *"no quiero esperar… un producto que se venda a mal precio puede que se vendan muchas unidades a precio en rojo"*): corre `timbre`; si hay 6+ compras sin revisar, una abajo del 35%, **una de algo sin techo medido (📈/🆕/🔥/⏳, 1a del 28/10)** o **una de algo que está bajando de precio** (🪜 `bajando`, también por su gemela; 26/10, él: *"agregar un trigger nuevo, que el producto esté bajando de precio"*), hace la parte de ventas de la vuelta corta; si no, termina en un renglón. Reemplaza al timbre por API (abría un chat sin el robot; `trig_012a3LNycnpvUm55TK7y2mji` apagado).
- **Auditoría del robot** (`trig_0138cyCgYeEHjqeayqiQPqWQ`, a las 20:30 desde el 23/10, se reprograma sola con `run_once_at`; ver `AUDITORIA.md`).
- **Cada vuelta, en orden** (detalle en CEREBRO §1): leer `CEREBRO.md` + `notas/preguntas.md` → `ventasraras:nuevas` (sólo ventas
  posteriores a la última analizada; **cada venta se analiza UNA vez**) → **sólo las 🔬 A FONDO van a un ayudante con `effort:"max"`
  escrito en la llamada** (22/10, 2a: rara/abajo del 35%/sin costo · sin estrategia con techo · escasez · lanzamiento que vendió ·
  prueba de techo con 7+ días); las ✓ normales se cierran sin leer ficha → aplicar lo que propone el ayudante (si no le hago caso, lo
  digo en el 🧠) → `ventasvistas:<ts>|esf=<nivel real>|<MLA>=<qué pasó y qué resolví>|…;go` (deja en cada venta su análisis 🔬:
  gris si no cambió nada, color de la estrategia si cambió) → **al terminar, el detector `errores` (reemplaza a `bajastecho:1`), y deshacer en la
  misma vuelta toda ❌ del día** (22/10, 3a: vuelve al precio de antes con `!chico` y "EXCEPCIÓN: vuelve al precio de antes").
- Listas que tienen que quedar **vacías** al terminar la vuelta: 🚨 escasez que vendió después de mi decisión (`escasez`) · 🛡️ abajo
  del 35% en el peor caso · 📦 sobra sin decidir · 🔎 sin afinar · 📈 dice techo/escasez y no sube · 📈 prueba con respuesta (3 ventas esperadas, 23/10) · 👯 mismo producto y color con distinto precio o estrategia (26/10) (todas en `planilla`) · 📈🆕 prueba de techo o lanzamiento que vendió (también por su gemela) y no subió (en `errores`, 23/10; todo 📈 desde el 27/10) · 🔎 vendió ayer u hoy sin techo medido ni estrategia que explique no subir (en `errores`, 27/10) · 🔙 abajo del precio más caro que vendió en 60 días (`vendiocaro`, sólo la completa, 27/10 a la noche) · 🧐 revisión a fondo atrasada (`revfondo`, sólo la completa: todo producto con stock en Full y publicación activa con mi nota del 🧠 de menos de 2 días si está quieto o de 7 si vendió; 24/10, eligió la 3a).
- **Activar lo pausado es prioridad** (10/10): `pausadas:25` + `activarfull:go:25`; toda pausada con stock en Full que no se activa
  va a `notas/para_mati.md` con motivo (al `pregunto:URGENTE` sólo si vende fuerte). Lo nuevo (nunca estuvo en Full) lo activo yo con el precio ya puesto (peor caso).
- **Preguntas de compradores:** las contesto yo (`contesto:<id>=<respuesta>;…;go`), sólo las nuevas y sólo las que sé SIN DUDA. **La que no sé se le pasa en el chat EN EL MOMENTO** (26/10, 1a: *"si no respondo guardá para responder después"*): si no contesta, va a `notas/para_mati.md` y sale en el aviso de las 12:30 hasta que la resuelva. **Las viejas (abril-agosto) se dejan** (26/10, 2a).
  `responder` automático apagado (`responder:off`); la IA de preguntas **queda apagada** (24/10, eligió la a: sin `ANTHROPIC_API_KEY`; no volver a proponerla).
- **Cada vuelta busca algo nuevo para mejorar** (12/10, maximizar y bajar costos), sin repetir (`notas/ideas.md`); si no hay, no se inventa.
- Esfuerzo fijo (no se cambia sin que él lo diga): ayudantes de la completa, ideas y revisor en max; raros de las cortas en Alto;
  ventas en max. **El esfuerzo va escrito en cada llamada al ayudante**, nunca se hereda de la sesión.

### Telegram y avisos
- **Dos chats** (29/10, él: *"en el CYC Avisos que mandás los resúmenes diarios, a partir de ahora SOLO mandar resúmenes diarios. El resto importante al otro"*): al grupo de los resúmenes (`TG_CHATS`, él y Tito) va **sólo el resumen** (`sendTelegram(...,'resumen')`); todo lo demás (bajas/altas de ML, dólar, urgentes, recordatorios, códigos de devolución) va al canal privado de Mati (`sendAlerta`, `TG_ALERTAS`).
- **CYC Avisos (Telegram) = SÓLO lo urgente y los recordatorios** (23/10, *"si me llega un mensaje de CYC Avisos sé que es algo
  que tengo que resolver ya"*): `pregunto:URGENTE: …` (el robot lo niega sin "URGENTE") sólo para lo que cuesta plata si espera
  (reclamo que espera su respuesta, ML frenó algo que vende, algo que vende fuerte en 0 en Full con mercadería en la oficina, un pago
  que vence) · `recordar:<texto>` · el chat nuevo del bot · **🚫 ML dio de baja/frenó una publicación y ✅ cuando la vuelve a habilitar** (26/10, él: *"es importante a resolver, casi siempre es por pedir facturas en la cuenta de Adriana"*; cerrada, en revisión, inactiva o falta de papeles, una vez por cambio). · **🥊 cuando una publicación con `ganarcaja` (con stock) deja de ganar la caja, y ✅ cuando la recupera** (27/10, él con la waflera: *"avisar cuando la waflera deje de ganar. cuando llegue stock"*; `mantenerCaja`, una vez por cambio) · **📦 el código para recibir una devolución que viene a la oficina** (26/10, él: *"mandarme el código a Telegram… revisar cada 2 h… de las cuatro cuentas"*; `avisoDevCodigo`, de 7 a 24, una vez por envío; el código nunca al registro, sólo Telegram y `mlapi/devcodigo`). Las 🔐 autorizaciones ya NO van por Telegram (24/10): se le pasan en el chat. **Las decisiones (a)/(b)
  NO van: a `notas/para_mati.md`** y se resuelven en el chat cuando dice "resolvamos". Nunca "subí/bajé/activé", ni resúmenes, ni lo que
  deshizo el detector (va al log). `//` = salto de línea, sin `;`, sin datos de compradores. Informativos: `sendAlerta(texto,{info:true})`.
- **Cada venta nueva llega al TELÉFONO (push de la web), no a Telegram** (`AVISO_VENTA_TELEGRAM=false`): sólo compras que dejan
  **$10.000+** de ganancia (la compra ENTERA, sumando el carrito), no suena 00:30-10:00 (sale junto a las 10:00). Cada teléfono toca
  una vez "🔔 Activar aviso de cada venta". Llave privada VAPID en `mlapi/vapid` (nunca al repo). **Sale apenas el robot lee las ventas** (27/10, no al final de la vuelta): llega 2-5 min después de la venta; él: *"lo del aviso de 2 a 5 mins está bien"* → no se arma el aviso al instante (Cloudflare + notificaciones de ML), no volver a proponerlo.
- Chats nuevos del bot quedan `pendiente` hasta `tgaprobar:<últimos números>:go`.
- **Ventas vivas:** el temblor se permite desde **$10.000** de ganancia (`VIVA_GAN_TIEMBLA`, 15/10) y el fuego desde **$20.000** (`VIVA_GAN_FUEGO`, 26/10). Cada venta dice
  Clásica o Premium y en cuántas cuotas (`tipoPub`, `cuotas`, `cuotasSI`) y "envío gratis" si salió por una gemela de envío.

## 5 · PRECIOS (resumen; manda `ml-sync/CEREBRO.md`)

- **Quién manda** (CEREBRO §0): lo que pide él para ese producto → dato dudoso no se toca → frenos duros → nunca abajo de 0% →
  **sin línea de techo no se baja** → arriba del 💰 no se baja sin 95% → lo que vendió a su precio no se baja (F14) → lo nuevo no se
  baja sin 🏔️ → no pagar stock antiguo (15 días antes: ganar la caja hasta 0%) → escasez sube (🔥/⏳ nunca bajan sin techo, F11) → sobra
  baja en escalera → perfumes no abajo del 10% (F12) → 35% peor caso (abajo sólo con 90+ días, F13) → menos de 1/semana no sube · 1+/semana
  no queda en 💰 sin 🔴 → buscar techo en todo lo demás.
- **Datos suyos que no se vuelven a preguntar** (27/10 a la noche): ML **no castiga** en las búsquedas una publicación que pasa muchos días sin vender · la competencia **no copia** nuestras subas (cada uno va por su cuenta). **Dos franjas buenas de precio** (`franjas`, 27/10): de 86 con 3+ precios medidos, 3 (el azar daría ~4): raro, pero existe (Cartas Poker Azul: $3.520 deja $1.268/día, $3.870 $467, $6.490 $2.162).
- **Lo que vende menos de 1 por semana no sube** (4a del 23/10; 37a del 24/10: toda suba, no sólo 📈; freno en `decido`): queda 💰 #punto;
  afuera subir al 35% del peor caso, 🔥/⏳ con stock para menos de 100 días, o volver a un precio de los últimos 90 días. Las pruebas se juzgan a las 3 ventas esperadas.
  Bajar la lista de algo que ya buscó techo va como descuento con cualquier etiqueta (37a). Renovar el mismo descuento no es una baja (46a).
- **El orden de todo precio** (27/10 a la noche, él; reemplaza el "buscar el de más ganancia" del 25/10: *"primero buscar techo, segundo buscar
  1 venta y quedarse ahí, tercero… evaluar el stock para no pagar, ver si estamos vendiendo muchísimo menos que antes entonces vale la pena
  bajar. pero normalmente siempre conviene mantener el precio más caro posible… la idea se va en tener 100 productos con pocas unidades que
  venden poco y ganan muchísimo"*): 1º 📈 techo (+50% con cada venta hasta que no vende) → 2º 🪜 escalera desde el 🔴 y **en el primer
  escalón que vende se queda** (🔒 F14; `techo95` le anota 🏔️; en la web 💰 "el más alto que vende") → 3º sólo baja si sobra (90+ días
  al ritmo de ESE precio, o de 60 días, o la unidad más vieja con 90+), se acerca el stock antiguo, pasa 30 días sin vender o **vende muchísimo menos** (1a del 28/10: menos de la MITAD de la
  plata por día que el 💰, 95% y 7+ días con stock → un escalón hacia el 💰; le toca a lo que vende mucho, lo de 1 por semana se queda).
  No se baja para buscar un poco más de plata por día. Piso 35%, niveles y Mezcla quedan como están (2a 3b 4b del 28/10). Lo que bajó de más antes vuelve al precio más caro que vendió (🔙 `vendiocaro`, en la completa).
  **💰 sin 🔴 no** (27/10, eligió 2a): lo que vende 1+ por semana no queda en 💰 sin techo medido (`puntoSinTecho`, freno en `decido` y `tag`).
- **Si vende, no es techo** (27/10, él: *"si se vende una vez a un precio que está buscando techo, ahí nomás tiene que volver a subir… el techo es saber que no se vende a ese precio"*; eligió la a): toda prueba 📈/🆕 **y todo 🔥 escasez / ⏳ sin reposición sin techo medido** (1a del 28/10, él con el Espejo 4": *"¿por qué no lo subió? no tiene techo conocido aún"*) que vendió al precio de hoy sube **+50%** en la misma vuelta (27/10 a la noche, él: *"aumentar más % el precio… en vez de hacer 3 subidas, ya nos pasamos de todas las franjas"*; antes +30%; `!vendio`, lista de `errores` que queda vacía); frena en 🔴 no vende (30 días) o 🟠 deja de convenir (techo95), y en el 🟠, como vende, se queda. **Aunque le sobre stock, sube igual** (28/10, 2b). En la web son dos rayas. **Vende cualquier forma de venta = vale para todas** (30/10, él con el Aer Jasmín: *"no importa quién venda, si no tiene techo tiene que seguir buscando y todas las formas de pago tienen que seguir el % de ganancia"*): si vendió la gemela de envío gratis arriba de $33.000, el +50% va sobre ESE precio y la Clásica cruza la barrera (`!vendio!cruza`; `decido` mide igual que cruzar deje más); las gemelas siguen a la Clásica con la misma plata = el mismo %. **La suba queda en +50% del PRECIO** (30/10, él: *"me gusta la subida que tenemos ahora… sólo dije lo del % por el tema de las premium y clásicas"*): lo del % es que todas las formas de venta queden con el mismo % (ya lo hacen las gemelas). No volver a proponer subir por %. **Las formas de venta siguen al % más alto en las subas** (30/10, él eligió 3a: *"que se acomode a la que más % da, no a una específica"*): la que vendió sube +50% de SU precio y las otras quedan con ese mismo %; en las bajas a propósito (sobra, escalera, descuento, stock antiguo) bajan todas juntas siguiendo a la que bajó (si no, ninguna baja se podría hacer).
- **Bajar pide 95%, subir pide 50%** (26/10, él: *"siempre para bajar tenés que estar 95% seguro, siempre para subir 50% o más. entonces no hay chances de perder por vender barato"*): freno 50% en `decido` — si `techo95` ya da 50%+ de que el precio en prueba es el techo (`cyc/techo95pct`), no se sube más; no frena 🔥/⏳ ni volver a un precio de 90 días.
- **Sin línea de techo no se baja** (21/10; 22/10 decisión 1a): línea = 🔴 de las rayas o 🏔️ de `techo95`. Sin línea → 📈 buscar
  techo (subir). Lo que vendieron otras variantes o la familia NO alcanza. Pasados 15 días de la última suba sin certeza, decide la
  plata por día (F4).
- **🔐 Un aviso alcanza** (22/10, eligió las tres; CEREBRO §0c): **todos los caminos pasan por las mismas reglas** — `frenosBajas`
  (F0-F14) juzga `decido`, `entrarpromo` y la puerta de `setPriceTo` (toda otra baja); las subas pasan por `frenosSuba`; F9: en escasez
  nunca abajo del precio de antes de la escasez. **Las salidas que ya fallaron son SÓLO SUYAS:** `!sinlinea` `!sincerteza` `!sintecho`
  `!bajocero` y 🧨 `#remate` → sin su autorización no se hace: queda GUARDADO en `cyc/autoriza/<código>` (**no sale por Telegram ni vence**,
  24/10, él: *"que lo guarde y me lo mande por acá, en el aviso de las 12:30, y si no que lo siga guardando hasta que lo resolvemos"*); se
  lo paso en el chat (aviso de las 12:30, `autoriza` los lista) y su respuesta la anoto con `autorizo:<su texto>;go` (ml-sync; "autorizo
  K7M3 64TN no 3NCW", vale 48 h desde que la anoto).
  **Única salida mía sin él:** corregir el precio de lo que NUNCA estuvo activo ni vendió, al activarlo (`!activar` + "EXCEPCIÓN: …").
  **Detector `errores[:horas][:go]`** al final de cada vuelta (consulta): todo cambio y descuento de 26 h contra los errores que él ya
  marcó; la cuenta tiene que cerrar; con `:go` (ml-sync) deshace lo ❌ y le manda UN aviso. **Cada corrección nueva suya agrega su
  chequeo al detector (y su freno si se mide), en el mismo commit; una salida de excepción mal usada pasa a ser 🔐 suya.**
- **Techo con 95%, que baja con los días** (24/10, él: *"no tener 1 mes buscando techo"*; 28/10, él: *"alargar de 7 días a 30 y después sí bajar a 70%"*: 95% hasta el día 30 con stock a ese precio, después baja hasta 70% el día 44, `umbralTecho`; la línea dice cuánto lleva y con cuánto se decidió; **30 días sin vender a ese precio o más caro = 🔴 techo sí o sí** y arranca la escalera, `TECHO_DIAS_SIN_VENTA`) (30/10, él eligió 4a: queda en 30; lo que vende seguido llega antes al 95%: 1/día ~3 días, 1/semana ~21; no volver a proponer bajarlo) (`techo95`, nunca `#techook` a mano): las tres rayas de la línea de tiempo 🔴 techo (95%) · 💰 más plata (antes "piso") = el precio que
  más plata por día dejó de los que se probaron (no se baja de ahí salvo sobra/stock antiguo/problema, **o si nunca se midió uno más bajo**: 1a del 24/10) · lo de en medio falta probar. Una sola cuenta en web
  (`_rayas`) y robot (`rayasPrecioLinea`), **con los últimos 60 días y sin los días de fechas especiales** (24/10, el 🔴 falso del Infusor). Sin piso medible, 💰 provisorio desde la primera venta. **Todo producto tiene que llegar a
  tener las tres.** Juicio por certeza (Poisson), no por calendario; manda la **plata por día neta** (−$100/u de trabajo, −3% de lo
  facturado por el tope de H, −2%/mes de la plata parada). Subas **directo al precio que pienso** (sin escalones de +10%; ML deja +100%).
  Prueba que sale mal → baja en escalera midiendo cada escalón. **Toda baja en escalera** salvo las cinco excepciones.
  `techofreno` reabre si el más barato ajeno sube 8%+, se va, ganamos la caja o pasan 30 días.
- **Escasez = el precio SUBE** (se corta antes de que llegue lo de camino/oficina o antes de poder reponer). Se trata **en la misma
  vuelta** en que aparece; precio para que dure hasta la reposición (despachada ~8 d · en la oficina ~10 d · Bs As ~1 semana + caja ·
  Paraguay ~16 d · sin reposición ~100 d). Primer salto por ritmo (3+/día ×4 · 1-3 ×3 · <1 ×2 · <1 cada 2 días ×1,5), salvo techo
  conocido; nunca abajo del normal; techo $650.000. Si llega a tiempo la caja/oficina NO es escasez ("🚚 cubierto"). Se mide con el
  **ritmo normal** (no el frenado por la suba) y **⚡ si se acelera** (7 d con 2+ u. y el doble del de 30 d) manda el ritmo rápido;
  lo de pocas unidades se rejuzga con CADA venta. Al llegar la caja no se vuelve a ciegas: se busca el medio (🎯, Poisson).
- **🔥 Escasez y ⏳ sin reposición NUNCA bajan sin techo al 95%** (24/10, él; freno F11): en todo caso suben. Única excepción: la unidad
  más vieja a 20 días o menos de pagar stock antiguo en Full (4 meses lo chico). El tag #sinrepo ya no abre ningún freno.
- **Sin reposición (⏳)** — Nissei no lo tiene / no da / "no lo consigo": estirar el stock al precio más alto que lo vacíe en ~100 días,
  nunca pasar 120. Bs As pasa a "no se consigue" cuando Pedidos lo pide hace 10+ días sin entrar nada a la oficina, o con el botón
  🚫 "No lo consigo" (`cyc/noconsigo/<prod>[/v/<color>]`); se cae solo al entrar mercadería.
- **Lo que no vende al 35%** (24/10, eligió la a): no se repone y, al terminarse, la publicación queda pausada (no se borra).
- **🌸 Perfumes: nunca abajo del 10%** (26/10, él: *"todo lo que es perfume se puede poner en la perfumería. antes de liquidar a 0% conviene pedirlo. intentemos venderlo mínimo al 10%. si está por pagar stock avisame y retiro"*; con los VS: *"menos del 10% nunca, antes retirarlos"*). Freno F12 (`esPerfumeNom`: perfume, body mist/splash, Victoria's Secret, Paulvic/Persea). **Salvo los 15 días antes de pagar stock antiguo: ahí sí hasta el 0%** (27/10, `antiguo15`). Si a 3 días de pagar stock antiguo no se vendió → se le pide en el chat (12:30) que lo retire al local.
- **15 días antes de pagar stock antiguo: ganar la caja hasta el 0% (al costo) y, si no se vende, se retira 3 días antes de pagar** (27/10, él: *"15 días antes de pagar stock siempre ganar caja hasta llegar al 0% de ganancia"* y *"vende al costo antes de retirar. 3 días antes de pagar por stock retiramos"*): con la unidad más vieja a 15 días o menos de pagar stock antiguo, el precio baja al que gana la caja (sin catálogo: escalera) sin bajar del 0%; si a 3 días de pagar sigue sin venderse, se le pide el retiro (en el chat, 12:30). **Perfumes también hasta el 0%** (F12 se abre en esos 15 días).
- **Sobra** (+90 d de stock al ritmo con stock o sin ventas en 60 d) → escalera/descuento; con sobra no se busca techo. **Lo caro que no vende: a los 60 días sin vender, la escalera apunta al precio que GANA la caja de compra** (27/10, 1a: con la unidad más vieja de menos de 90 días en Full, sólo hasta el 35%; F13 manda) (26/10, él con los VS, Redmi Watch y Dalí: *"si llegan a 60 días de stock sí bajar los precios hasta estar en ganando"*; nunca abajo de 0%, perfumes 10% salvo los 15 días, F12; antes de eso no se baja sin techo y las 16 autorizaciones viejas del 23/10 quedaron en "no"). Stock antiguo: 120 d
  lo chico, 60 lo grande (Tenders); apuntar a vender antes de ~100. Bajar porque seguir igual perdía más = el cerebro ganó; lo que falta
  para el 35% es error de origen (mandar/comprar de más).
- **Estrategias (tags)** — todo precio tiene una (19/10, **no existe 🎯 base**; `decido` rechaza un precio sin estrategia): 📈 `techo`
  buscando · 🏔️ `techook` encontrado (sólo vía techo95) · 🪜 `bajando` · ↘️ `volviendo` al normal · ↗️ `desobra` · 🔥 `escasez` ·
  ⏳ `sinrepo` · 📦 `sobra` · 🏷️ `promo` (ML pone) · 💸 `descuento` (sólo nosotros) · 🆕 `nuevo` (lanzamiento) · 💰 `punto` · 🧨 `remate`
  (sólo si lo pide él) · `liquidando` · 🛡️ excepción (`!piso`, `cyc/claudepiso`). **⏰ pagando stock** y **📉 liquidando** se VEN según el motivo (30/10, él: *"si paga por stock viejo quiero que no diga sobra stock sino 'pagando stock'"*): el motivo de toda baja por stock antiguo dice "stock antiguo" y el de la liquidación de 30 días "30 días sin vender" (se etiqueta `#liquidando`). ⚪ sin estrategia (decidir) · ⏸️ sin stock. "Volviendo"
  dura 7 días, después entra a 🔎. Cada chip dice "· de X". Cada venta muestra la estrategia que tenía (`cyc/estrategia/<MLA>/<ts>`).
- **Lanzamiento (🆕)** (20/10; 23/10 él: *"buscá el precio más alto que podamos, que tenga sentido, quizás al de los competidores"*):
  lo nuevo arranca en lo MÁS ALTO que tenga sentido contra su catálogo — si nadie tiene Full, cerca del más caro (Full vale ~19% más);
  si hay otros con Full, ~20% arriba del Full más barato sin pasar el más caro; baja recién con 🏔️ al 95% (visitas × conversión) y
  cada escalón como descuento propio con el de lanzamiento tachado. **Nunca bajar algo que vende sólo para medir** (la prueba del tachado
  3b se canceló).
- **🥊 Mantener la caja hasta que se venda** (26/10, él con la waflera: *"mantenerla en ganando siempre hasta que se venda? sin bajar muchísimo"*): `ganarcaja:<MLA>=<piso>|motivo;go` (ml-sync, SÓLO con su pedido **y su "autorizo"**: 5a del 28/10, sin eso queda guardado en `cyc/autoriza` como las otras 🔐) → cada hora `mantenerCaja` baja al precio que pide ML para ganarla si la perdemos, ≤15% por hora, nunca abajo del piso ni del 35%; pasa por encima de 🔒/🧊 para esa publicación. `=-` lo saca.
- **🔒 No bajar** (23/10, él con la waflera: *"le ganamos bien, que sea una excepción si el robot decide bajarlo, quizás lo mejor sería no tocarlo"*):
  `nobajar:<palabra|MLA>=<motivo>;go` marca todas sus publicaciones (`cyc/nobajar`); F10 frena toda baja y descuento salvo su autorización 🔐 `!nobajar` (y SACAR la marca también pide su "autorizo", 38a del 24/10), pero ANTES evalúa las otras reglas y dice "HUBIERA HECHO: bajarla de X a Y" (queda en `cyc/nobajar/<MLA>/hubiera`, se ve en `nobajar`). Las subas siguen, salvo `!congelar` (🧊, él: *"queda una sola unidad, quiero que el precio se quede ahí"*): tampoco sube hasta que el stock en Full pase el que tenía al marcarlo (`stockAl`; `_chequeoNoSubir`); ahí se descongela solo y se busca techo/piso.
- **Nada se publica abajo de 35% en el peor caso** (23/10, él: *"siempre publicar todo arriba del 35% o en 35%. después cuando estemos cerca de pagar stock lo bajaremos"*; *"quizás en un mes cuando el otro vendedor se quede sin stock se venden mucho más caro"*): `PUBLICAR_MIN_PCT`, freno en `publicar` (dice el precio mínimo). Lo comprado que hoy no llega igual se publica a ese precio y espera; se baja recién cerca del stock antiguo.
- **Al crear una publicación: 100% seguro de que el catálogo es ESE producto, y le mando las fotos que tiene ML** (26/10, él: *"tenés que estar 100% seguro que ese es el producto y mandame foto de los productos, las fotos que da ML"*): `fotocat:<MLA catálogo>;…` (nombre + fotos), comparo contra la foto de la caja/ticket (modelo, color, capacidad) y le paso una lámina con las fotos (SendUserFile). Con duda no se publica.
- **Nunca se crea una publicación (Clásica o gemela) más cara que $550.000** (23/10, él; `TOPE_CREAR`, freno en `publicar` y `gemelacrea`). Una Premium
  que para dejar la misma plata tiene que pasar los $550.000 no se crea y se avisa (40a del 24/10, `gemela` y `gemelacrea` lo dicen).
- **Precio para el peor caso** al poner o activar (12/10). Lo que vende rápido abajo del 35% con poco stock se sube en la misma vuelta.
- **Venta barata ≠ remate** (09/10): remate sólo si antes estuvo parado (30+ d con stock, <1/semana); si llegó y voló es demanda (precio
  barato: subir). Mirar la línea de tiempo antes de decidir. `pedidostodo` marca `REMATE n` (no cuenta) / `BARATA n` (cuenta).
- **El % de un producto no se mide con carritos** (18/10): se usa lo que deja vendido solo (`netoProductoVP`).
- **Venta rara** (`ventasraras`): casi todas tienen retención IIBB 0,5-2% (no es motivo salvo que explique la diferencia); rara de una
  vez no se toca; precio que deja poco se decide. `cargosventa:<MLA>:<días>` para el detalle.
- **La caja de compra orienta, no decide** (12/10). Perdiendo y vendiendo bien no se baja. **Full vale ~19% de precio** contra un
  vendedor sin Full (rango 3-26,6%, medido 18 de 18); Flex compite como Full; contra otro con Full el premio es 0.
- **Un solo vendedor en ML no vale como precio** (19/10). **Lo que sólo venden desde afuera** se mide contra ellos +20% (16/10).
- **Cuotas Premium:** en algunas categorías `listing_prices` ya trae las cuotas (`enComision`); no contarlas dos veces. Premium sin
  cuotas medidas no se baja ni activa. **Dalí (`MLA1869295911`) queda Premium** (17/10, no volver a proponer).
  **En revisión de ML para siempre, no se miran más** (24/10, él: *"nunca se van a liberar"*): Dalí La Belle `MLA1869295385`, Galaxy A06 `MLA3528837100`,
  Scandal Bliss `MLA1695210793` (`ML_REVISION_NO_MIRAR`: fuera de `planilla` y del `informe`; su stock sigue contando).
- **💳 Gemelas** (CEREBRO §11): toda Clásica activa con stock en Full lleva su Premium en la MISMA publicación de ML al precio de igual
  plata neta (`precioGemelaIgual`; `gemela`, `gemelacrea:<MLA>=<precio>:go`). **📦 Gemela Clásica con envío gratis** (22/10) para lo
  de abajo de $33.000 (**pausada sola mientras su Clásica esté en $33.000 o más** y activada de nuevo al bajar: 6a del 28/10, `cyc/gemelabarrera`) (`gemelaenvio`, `gemelaenviocrea`; `gemelaTipo:'envio'`; no se crea si queda abajo del 35%). **Ninguna gemela queda abajo del 35% del peor caso si su Clásica está en 35%+** (24/10, él; `precioGemelaAlPiso`: el más alto entre misma plata y 35%). **Si la Clásica está abajo del 35% a propósito (sobra, promo, `!piso`), la gemela la acompaña con la misma plata y SÍ baja abajo del 35%** (él: *"todas las formas de venta deberían contribuir"*); una baja de más de 15% va de a −15% por hora (`escalonGemela`). Las dos se alinean
  solas cada hora a su Clásica (`gemelaSigue=off` apaga); **la de envío no BAJA sola abajo del 35% del peor caso** (39a, 24/10) salvo que su Clásica ya esté abajo del 35% a propósito: si no, se queda y sale en `planilla` (📦🛡️) para decidir. Caja perdida por cuotas = candidata a gemela, no a bajar.
- **👯 Mismo producto y color en dos publicaciones = mismo precio y misma estrategia, AL PRECIO MÁS CARO de las dos** (27/10, él con el Centímetro Blanco: *"poner al precio más caro de ambas y que a partir de ahí se cuenten como mismo producto, y sigan mismos precios y estrategias"*; 26/10, también con las Cartas Poker: misma $9.790, una 📈 y otra 💰; él con el Centímetro Blanco: *"siendo exactamente el mismo producto y color deberían tener exactamente el mismo precio (o mejor aún borrar y dejar una)… quiero que tengan el mismo precio si ves que son exactamente el mismo producto"*): lista 👯 de `planilla` (mismo stock, activas, sin gemelas) que tiene que quedar vacía; si no es el mismo producto (variante mal vinculada) → `fijarvar`/`vincular`. Borrar una de las dos lo decide él.
- **Terminaciones 90/990** (99 en lo muy barato). La regla de no cruzar números redondos se SACÓ (medido 13/10).
- 🪜 Arriba de $15.000 hay ~15% de zona muerta de comisión: suba que cae ahí se frena salvo `!escalon`. La comisión de ML tiene cargo
  fijo ~$1.230 por venta: abajo de ~$4.000 se come el producto. Packs: **sí si el pack tiene su propio catálogo en ML** (23/10, *"si el pack está en catálogo sí se arman"*); armar un pack de algo que hoy compite suelto en su catálogo, no (27/09, *"al estar en pack las saco de competencia"*).
- **Fechas:** calendario y eventos de ML en el `informe` (secciones 14/14b), `fechas`, `eventos`. El ×1,4 de regalables NO está
  confirmado. **Navidad: a mediados de noviembre se pide para 45 días** (recordatorio 14/11).
- **📅 El calendario de ventas entra en TODA decisión** (24/10, él: *"toda esa es información que quiero que mires y que sea una info más que
  tenga al hacer cualquier movimiento, precios, pedidos, ideas"*): (1) **franjas del mes** medidas en nuestras ventas sin fechas especiales
  (`cyc/mlconfig/franjasMes`, la noche y `ventasdiames`): **del 11 al 15 ~+17% compras / +22% plata; del 1 al 5 −25% plata** (5 meses, 24/10);
  (2) **temporadas y fechas especiales del año** (`fechas`, `fechasEspeciales`: Día de la Madre/Padre/Niño, Navidad, Reyes, San Valentín,
  Amigo, Hot Sale, CyberMonday, Black Friday) y lo de afuera (sueldo en los primeros 4 días hábiles; 65% agota la plata antes del 20).
  **No es una regla de "nunca", es un dato más para pensar** (él: *"que vos te des cuenta: se viene fecha/franja buena, quizás lo mejor sea
  esperar 2 o 3 días (…) pero manejalo: si está por pagar stock y se viene una fecha, quizás lo mejor es bajar para no pagar, o viceversa"*):
  se pesa contra todo lo demás (stock antiguo, escasez, sobra, plata parada). Ej.: una prueba de techo vista sólo en días flojos vale menos
  (las rayas ya pesan cada día); bajar 2 días antes de la franja fuerte puede no convenir… salvo que el stock antiguo cueste más que esperar.
  Pedidos y cajas: que el stock llegue antes de lo fuerte. Ideas y compras: qué se vende en la próxima fecha. Se ve en Plata por día
  (verde/rojo/ámbar).
- **El precio sugerido de ML** (`sugP`) es referencia, nunca motivo para bajar algo que vende.
- **ML pausa algo por el precio → se le avisa en el chat y lo arregla él** (28/10, 3b: *"avisarme y lo arreglo"*).
- **Liquidando** (`liquidando:<MLA>[:go]`, `cyc/nosubir`) frena sólo subas; se cae sola en stock 0; marcar uno no contagia a otros
  colores salvo hermana de precio (`esHermanaPrecio`). Bajar a un precio exacto que pide él: `unapub:<MLA>:<piso>:<días>:bajar=<precio>[:go]`.
- **🩺 La ficha médica** (`mlapi/ficha/<MLA>`, comando `ficha:<MLA>`): línea de tiempo + mis cambios con resultado + tramos + notas
  (`mlapi/fichanotas`) + cómo reacciona (gana/pierde caja, visitas, al subir/bajar, fechas, tachado vs liso) + más datos. **Se abre
  antes de decidir.** "📋 Ficha completa" en el 🧠 de la web. Línea de tiempo diaria: `mlapi/linea/<MLA>/<AAAA_MM_DD>` (fuera de `cyc/`).
- **Juicio de resultados** (10/10): `supervisor:medir:go` en la completa + `juzgo:<id>=<gano|perdio|igual|espera|nocuenta>|<texto>`
  (sin reglas a ciegas: pensar). En Métricas sólo lo confirmado (7+ días) va verde/rojo. No suma la inflación como mérito (25/09).

## 6 · PEDIDOS Y CAJAS

- **Pedidos completos, todo el catálogo** (09/10): `pedidostodo` (ml-consulta) → `python3 ml-sync/notas/decide_pedidos.py <log> <salida>`
  (objetivo **30 días**: con 7+ días con stock desde el último cambio de precio, **el ritmo AL PRECIO DE HOY** (`HOY u/d`, 27/10 a la noche: con la estrategia nueva el precio alto se queda; la suba de prueba de techo ya no pone de piso el ritmo de antes, la de escasez sí); si no, **ritmo a precio normal** (27/10, él eligió 1a: sin los días ni las ventas de 🔥 escasez, ⏳ sin reposición, 📦 sobra, liquidando y remate; 60 d, con menos de 14 días normales 180 y si no 365, `NOR` de pedidostodo); sin `NOR`, ritmo de 30 d, de 60 d o de 180 d si está agotado; menos Full + oficina + camino + viajando; sin ganancia = 0;
  ritmo normal si hubo remate o prueba; **precio para el máximo de compra = el de la última venta**, aunque sea 1, sin pasar el de hoy ni
  contar escasez, sin reposición, sobra, liquidando ni remate (1a del 27/10); nunca vendió → el de hoy, 23/10; **por color** (27/10, él con las Sábanas Rojo: *"ese color se vendió a ese precio, no todos"*): cada color con venta propia usa la suya, topeada por el precio de hoy de SU publicación, y el del producto es el más bajo de los colores que vendieron) → revisar a mano → `notas/pedidos.txt` → `decido:archivo=pedidos;go`. En la completa.
  Lo de la oficina o viajando a Full cubre lo decidido.
  **¿Se repone? (29/10, él: *"se compara contra el competidor de ml y si no da el 35% se mira con la venta más alta del producto de los últimos 365 días. y se pide unidades según el ritmo de venta del producto a ese precio"*):** cada producto y **cada color/aroma por sí mismo** (él: *"cada aroma variante… tiene su propio camino"*): 35% al precio de la competencia (`techofull`) → si no, a la venta más cara de 365 días → si ninguno, no se repone; unidades con el ritmo a ESE precio (7+ días con stock; si no, el de siempre) y ese precio para el máximo de compra (`M35`).
  **🧪 Descartar SÓLO probado** (29/10, él: *"descartar sólo con el producto probado. nunca teniendo en cuenta el competidor, porque ya sabemos que aunque esté perdiendo puede vender igual. sí o sí hay que probar con productos en stock en Full"*): lo que nunca vendió a 35% no se descarta por la competencia; se descarta recién con 30+ días con stock al precio que deja 35% (`p35` de `M35 no:…`) sin vender. Si se vendía y nunca se probó así → **compra de prueba** (sólo donde la competencia NO está medida; donde vende más barato queda en 0 con su motivo, 29a del 30/10): una semana de lo que vendía (mínimo 2) menos lo que hay, a venderse al precio del 35% ("Hola Tito! Te pido N de prueba…").
  **Después de una suba de precio, en los primeros 7 días se sigue trayendo para 30 días con el ritmo de antes** (28/10, eligió 2b: se le propuso bajar a 15 y dijo que no; no volver a proponerlo).
- **🛍️ Lo que pide la perfumería (sólo Bs As)** (29/10, él: *"hay productos que me piden de la perfumería que en ML tenemos suficiente stock o no llegan al 35%… si pide para perfumería que diga en chiquito en el nombre y que sume lo pedido para ML y para perf"*): él me dice qué y cuánto → `pedperf:<producto>[@color]=<u>[|local=…];go` (ml-consulta; `=0` lo saca) + `decido:ped` con la suma en el momento. Pedidos lo suma aunque no llegue al 35% o sobre en ML; la web dice "🛍️ N perfumería"; lo que ya está en la oficina queda apartado (no va a Full, no cuenta como stock de ML, no se vuelve a comprar) y baja solo al dejárselo (`debenmov …|prod=|u=`). Cuánto vende la perfumería por mes todavía no se sabe: se va a ir viendo con lo que se le deja.
- **Pedidos se ordena por lo que SALVA cada $1** (27/10, él eligió 1a y *"que quede sólo esa"*): 💸 en riesgo (`riesgoComprar`) ÷ lo que cuesta la compra (`_pedDevuelve`); lo que todavía tiene stock queda abajo aunque deje mucho, lo que está en 0 sube. La ganancia que usa es **la del precio de hoy** cuando lleva 7+ días con stock desde el último cambio de precio (1a del 27/10); si no, la de 30 días. Medido en `sim.py`/`sim2.py`: gana ~$170-480 mil/mes contra ordenar por la plata total cuando faltan pesos.
- Por color: un color agotado hace 30+ d pide con su ritmo viejo ("ritmo viejo"). Pedido a mano ya no existe (lo arma el panel/yo).
- **Bs As:** el padre compra en persona (~1 semana, plata ~$3M, lugar en la Kangoo). Solapas 🏬 De siempre / 📋 Dai Nippon
  (`pedCambiarGrupo`). Rojo de Pedidos = 14 días o menos (se corta sí o sí).
- **"Pausar por precio" se sacó entero** (01/10): no volver a proponerlo; si no da, no se compra. `pedremate` decidido (b): se deja; él
  manda a la papelera lo que no quiere. **No volver a proponer cortar el ritmo viejo.**
- **Cajas a Full:** cubren **37 días** (30 + 7 de viaje) al ritmo de 30 días o, con 7+ días con stock desde el último cambio de precio, al de ESE precio (`HOY`, 27/10 a la noche); **60 si vende parejo** y no tiene prueba de precio abierta
  (`notas/sin_estirar.txt`); **tope 90 días**; nuevo sin ventas recibe 4 (`PISO_CERO`). `decide_cajas.py` → `decido:caja:<id>@<cuenta>[#color]=u|N|motivo`. **Lo que él decide de una caja va a `FIJO` en `decide_cajas.py`** (25/10: si no, la completa se lo pisa); **lo FIJO va antes que lo que pide la perfumería** (30/10, 12b: el Persea). **"Armá la caja" = eso + `cajaarmar;go`** (carga la caja como el botón 🎯 Cargar lo que entra en el cupo; 25/10, si no queda incompleta).
  **Con cupo chico se llena para la MÁXIMA plata** (27/10, él: *"maximizar la máxima ganancia de $ posible siempre"*): lo que está en 0 o se corta antes de la próxima caja recibe lo que vende hasta que llegue (14 días, contando desde que entra ésta a los 7; mínimo 1), en orden de lo que más deja por unidad; lo que sobra va a lo que más deja por unidad (lo nuevo con lo que deja su publicación); web y `decide_cajas.py` iguales.
  Una cuenta sin publicación no recibe el mínimo si otra tiene stock de ese color en Full. **Tenders (grandes) en su propia caja** cuando juntan una llena o se cortan en 14 días (24a del 30/10). **Envío pausado cuenta como en camino y ocupa cupo** (25a). Caja 70×70×70, 30 kg; costo de mandar una
  caja `cyc/mlconfig/costoCaja` ($17.500, `cajacosto`).
- **Cupo de Full por cuenta** (ML no lo da por API): desde el 26/10 lo lee cada día el chat de Chrome (`PROMPT_RUTINA_LOCAL.md`, 2a) y yo lo cargo del buzón con `cupo:<cuenta>=<chicos>/<grandes>@<AAAA-MM-DD HH:MM>` (la hora en que lo leyó, como `ancla`; 29/10: si no, lo que se mandó en el medio no se resta); "grande" = sólo los Tenders
  (`cupoGrandes`). Lo vendido NO devuelve cupo (18/10). Avisa, no frena. **Cupo lleno → vender lo lento** (descuento/escalera), retirar
  sólo si él lo pide (21/10).
- **Código de etiqueta de Full** (`inventory_id`, `cyc/mllinks/<MLA>/inv`): se muestra en Armar caja por cuenta y color; **nunca se
  adivina** (sin color en el título → `fijarvar:<MLA>=<color>:go`). No es el MLA.
- **Cajas llegadas:** el robot anota lo entrado (`cyc/cajasentrado`); **las que entraron COMPLETAS las marca solo cada hora** (24/10, él con
  la 79567049: *"¿no tenés datos suficientes para darte cuenta?"*); **las que tienen faltantes las marco yo** con
  `cajallego:<seg>[;…][!<palabras>=<u>]:go` (faltante real confirmado) o `abrircaja`. Lo de la oficina no es reposición hasta despachar.
- **Mercadería en tres lugares:** oficina (`ofi`), en camino a Full (`cyc/envios_full/<id>/cajasDet`), en ML. Lo en camino cuenta como
  stock y patrimonio. Despachar es neutro. Cerrar caja exige seguimiento.
- **Métricas → de dónde viene la mercadería:** Bs As · Paraguay · Paulvic · 📋 Listas, ordenado por ⚡ score promedio por color (20/10).
- **Pedidos hechos tienen número de 4 cifras** (#1001…, `num`) en Paraguay, Paulvic y Listas: "el pedido 1003" → buscar por `num` en
  `cyc/compraspy`, `cyc/pedidospv`, `cyc/compraslista`.
- 📋 Copiar pedido en tarjetas con variantes (para WhatsApp).
- **🏷️ Sin terminar / sin etiqueta** (25/10, él: *"al cargar unidades a mi oficina, que siempre salgan como a etiquetar"*): TODO lo que
  sube la oficina (web u `ofi:`) se suma a `cyc/sinetiq` salvo deshacer una caja (`ofi:…!ok` = ya viene etiquetado); Armar caja lo sigue
  contando igual y cada renglón dice "🏷️ N sin etiqueta"; tarjeta arriba de Contar lo que hay con botón ✅ Etiquetadas por renglón (lo usa
  el chat de Chrome al imprimir). **Nada pasa a "con etiqueta" sin que él lo diga** (26/10, él: *"siempre todo a sin etiqueta"*): los "llegó" del robot también suman (Paraguay, listas, Paulvic); bajar con `sinetiq:<palabra>=0;dijo=<lo que dijo>;go` y `ofi:…!ok;dijo=…;go` — sin `dijo=` el robot no lo hace. El botón ✅ Etiquetadas de la web lo usa él (o el chat de Chrome cuando imprime). **Por cuenta** (23a del 30/10: `cyc/sinetiq/<prod>/c/<cuenta>`; lo viejo queda "sin cuenta asignada" hasta `sinetiq:asignar;go`).
- **📬 Buzón** (25/10, eligió 15a): el chat de Chrome de las cajas (o él) deja en Mi oficina → "Mensaje para Claude" lo que no puede arreglar
  desde el panel (`cyc/buzon`); cada vuelta corre `buzon` y marca `buzon:leido=<ts>;go` (ml-consulta).
- **Las cajas salen de lunes a viernes a las 12** (25/10, él): armada después del viernes a las 12 sale el lunes. Los días de viaje se
  cuentan desde que sale (`envSalidaTs`, web y robot). **⏸️ Pausar envío** (26/10, botón en la cabecera del envío): no sale ni cuenta días hasta que lo reanuda; al reanudar sale desde ese día (`pausado`, `fechaArmada`).

## 7 · PARAGUAY · LISTAS · PAULVIC

### Paraguay (detalle en `PROMPT_GUAY.md`, CEREBRO §16)
- **Nissei por comprasparaguay.com.ar, NUNCA nissei.com** (02/10): precio (US$) y código salen de la fila de Nissei. comprasparaguay
  bloquea al robot (Cloudflare): lo copia el chat de compras, que hay que pegarle `PROMPT_GUAY.md` ENTERO.
- **Catálogo entero en `mlapi/pycat`** (15/10): el chat copia (`pycat:#<pág>@<orden>;…;go`, ml-consulta) y el robot (`ml-pycat`, cada 3 h)
  mide contra ML. Se guarda TODO (no se borra lo de menos de 15%). Para probar: **25%+ y catálogo de ML con 2+ vendedores** (20/10,
  reemplaza las 100 ventas; sin catálogo exacto afuera) — **o con 1 solo vendedor si vendió 100+** (24/10 1a, lo carga el chat con `faltaventas`)
  **o 🌟 sin competencia**: catálogo sin vendedores medido contra el precio que el chat VE en ML (`faltaprecio` → `svprecio`, 24/10 2a, él: *"es mejor,
  porque no hay competencia"*; sin precio a la vista no entra; se compran 1-2 y se lanza al precio más alto con sentido). Si el catálogo es
  un PADRE de colores sin vendedores, el robot mide los hijos (24/10). Las dos con la vara de 35%. **Sin ningún precio a la vista** (24/10 3a): carpeta
  🌟 Sin competencia con el precio para dejar 35% y botón ➕ Lo quiero (los elige ÉL; no entran solos al pedido); pasan a Para probar `sinComp` y yo confirmo fotos **y confirmado que es el mismo
  producto** (✅ o `revcand` ok de ESE catálogo; sin las DOS fotos no va). **Nada pasa 14 días sin volver a mirarse** (23/10, él): 15%+ cada 7 d, todo lo demás (abajo de 15%, sin catálogo, sin vendedores; también Listas) cada 14; la web lo muestra en ✅ Revisados / ⏳ Falta revisar (`rev`/`pend` en `cyc/pycatres`).
  **Nombre traducido** (23/10, 1a): también se busca con el nombre en castellano (`traducirPyNombre`); lo que tampoco aparece traducido queda
  **✔️ revisado** (`qp`, `pycatres.scr`, en 📏 Medidos) y no cuenta como sin medir. `pycatdia` = desglose y lo buscado por día.
- **Proveedor:** 🟢 Nissei (dos pedidos del momento: 🌸 Perfumería `pyb<fecha>` y 📦 Resto `py<fecha>`; en `compray` `|perf`/`|resto`)
  y ~~🟣 Elegancia~~ **apagada el 26/10** (él: *"eliminá elegancia. nunca se usa y genera problemas"*): sin solapa en la web y el robot no
  mide su catálogo (`PY_PROVS_VER`, `PY_ELEGANCIA_OFF`); sus datos (`EL_<cód>`, `pyel<fecha>`) quedan guardados. No volver a proponerla.
- **Recargo** = el MEDIDO de los pedidos (`paramcompra`; 22,7% al 17/10), respaldo 20%. **Se mide contra lo PAGADO del ticket, no contra la web** (1a del 30/10, él: los descuentos de Nissei achicaban el %): el descuento sale aparte (🎁 en los gastos del pedido). El panel lo suma; el chat carga el precio CRUDO.
  **El que retira cobra ~10% de lo comprado (no es fijo); lo único fijo es el correo (~$20.000-28.000)** (27/10, él): llenar el pedido ahorra poco (~1-2 puntos). **Adelanto de plata** es ocasional
  (`compray:<fecha>|adelanto=<pesos>|go`, renglón aparte del cambista).
- **El precio de Paraguay NO pisa el costo. Nunca** (17/09): `costUSD` = lo que PAGÓ; `nisseiUSD` = lo que saldría reponer. Al cambiar
  un costo, el viejo se congela por mes (`precios_hist_prod`).
- **Ticket real obligatorio para cerrar el pedido** (10/10; 25/10 con FOTO, él con el Sony: *"no sabemos si no lo mandaron o si no lo
  cobraron"*): renglones con `compray:<fecha>|det=<código>*<u>*<pagado>;…|go` (ml-sync) + la foto, que la sube él desde el detalle del
  pedido (📷, `mlapi/pyticketfoto/<id>`, `cyc/compraspy/<id>/ticketFoto` = cuántas). **Si me la pasa por el chat la subo yo y se tiene que VER en el detalle** (26/10, él: *"siempre subí vos eso"* y *"siempre quiero ver"*): la cierro con la llave del robot (`mlapi/ticketllave`; script en REVISION etapa 3) en `ml-sync/cifrado/<id>/*.enc` y `ticketsube:<id>;go` (ml-sync) la sube; nunca en claro al repo ni al registro. Sin las dos no se cierra (web y `pyped:llego`);
  arriba de Pedidos Paraguay sale en rojo lo que falta (todo lo en camino y lo pedido desde el 25/10). Datos del mayorista: no al repo.
  Con dos tipos el mismo día pide `|repo`/`|nuevos`.
- **⛔ Mirado en Paraguay hace 7+ días = en ROJO dentro del pedido** (26/10, él: *"que pueda estar dentro del pedido aunque esté en rojo.
  yo al verlo hago correr el robot para que los mire"*): se carga igual (casilla, botones de llenar, `pedir`); lo que frena es copiar el
  mensaje para Nissei y "Ya lo pedí" hasta que se vuelva a mirar (rutina del chat → `visto:` del buzón → `pyprecio`/`candprecio`). Lo ya
  pagado (`pyped:repo`/`nuevos`) sí se registra.
  **🪄 Llenar con probados y nuevos**: 1º probados que pide Pedidos con 35%+ hoy, 2º nuevos por ⭐ hasta el tope.
- **🔄 Vuelta completa de Nissei** (26/10, él: *"vuelta completa equivale a por lo menos el 90% de los productos de la web"*): el chat cierra
  la última página con `;fin=<productos que dice la web>` (PROMPT_GUAY); cuenta si se copió el 90%+ desde la página 1 → `cyc/mlconfig/nisseiVuelta`;
  Pedidos → Paraguay muestra hace cuántos días al lado de "Falta reponer" (verde <5 · ámbar 5-6 · rojo 7+).
- **Cuántas de cada nuevo** (`candMaxU`, 26/10, él): **hasta llegar a US$ 20 con el precio de la web, máximo 4** (US$ 21 → 1 · 19 → 2 ·
  9 → 3 · 5 o menos → 4); robot igual (`candMaxUBot`). En el pedido del momento hay **un solo 🗑️ Vaciar** que saca todo (probados, nuevos, uso personal).
- **Al chat local se le pasa SÓLO lo que interesa** (22/10, *"siempre pasame el promt con la mercaderia que si interesa"*): el texto
  listo para pegar y la lista YA FILTRADA a lo que puede entrar a un pedido (25%+ y en catálogo), no la lista entera; el resto se dice
  con números (cuántos y por qué no) y se ofrece aparte. Los archivos van por SendUserFile desde el scratchpad, nunca al repo. Primer
  caso: `faltaventas:todas` → 183 de 7.392 (PROMPT_VENTAS_LISTAS).
- **Me pasa que pagó un pedido = queda pedido EN EL ACTO** (26/10, él: *"cuando te paso que pagué el pedido, automáticamente cargalo como pedido. siempre"*): "Ya lo pedí" de ESE pedido del momento (`pyped:nuevos:<resto|perf|elegancia>;go` + `pyped:repo:…;go`), la plata con `compray` y lo que no cierra se le pregunta después.
- Pasos por comando: `pyped:repo:<palabra>=<u>;…|nuevos|llego:<id>;go` · `pedir:<palabra>=<u>;…;go` · `compray` · `pyprecio` · `candprecio` ·
  `candalta` · `pyvisto` · `pyconocidos` · `marcano:<marca>` (prohibida: **Dolce & Gabbana**) · `marcanoml:<marca>:go` = prohibida **sólo para ML** (no se publica, sí se compra para la perfumería): **Calvin Klein** (23/10, *"por la marca nos denuncian al toque"*). Celulares viajan con el padre (`celuviaje`).
  Nada de envío internacional. **Perfume que en ML no llega pero en el local deja 35%+ entra al pedido** (44a + 35% del 24/10; `revisarcompra` lo acepta). **Testers de Nissei** (sin caja): afuera para ML, se miran sólo para la perfumería del local (24/10, 6a). Tarjetas de memoria: ya no hay truchas (20/10), se tratan como cualquier producto.
- **Reglas de categorías del chat de compras** (aprobadas 03/10; vivían sólo en una PC, van en el `PROMPT GUAY`): antes de mirar ML,
  afuera precio crudo > US$215, lo que ya está en el panel y Dolce & Gabbana. **No se miran:** celular, notebook, tablet, cámaras
  (monitoreo/DVR, digital, filmadora, auto, infantil, marcha atrás), placa madre, placa de video, monitor, impresora, TV, computadora,
  servidor; lo grande (gabinete, silla y escritorio gamer, UPS, robot de limpieza, aire, heladera, lavarropas, microondas, horno y cocina
  eléctrica, hidrolavadora, monopatín, scooter, bici y moto eléctrica, sillas y mesas, valijas, musculación, cortadora robot, caja fuerte);
  termos y térmicos (hasta que él decida). El robot las aplica al pasar a Para probar y a `faltaventas` (`pyCatNoSeMira`; 23/10, 1a: 3 cámaras
  se habían colado); `candfuera[;go]` saca las vivas. **Sí:** aspiradoras, drones (≤US$215), consumibles. **Maquillaje todo adentro con tono EXACTO**
  (marca + línea + tono + versión + tamaño; sin el tono en ML → afuera), pero sólo entra al pedido si da 25%. Resto: mismo modelo, color,
  capacidad y voltaje (110V afuera), nada de packs distintos. Misma marca ≠ mismo producto (Cabotine 30 vs 100, Animale For Men vs Black).
- **Shopping China = el próximo proveedor de Paraguay, pero RECIÉN cuando Nissei se agote** (24/10, él: *"no es tan fácil como Nissei, por eso es mil veces más preferible agotar todo lo que haya en Nissei y cuando no haya más nada, ni siquiera para reponer, ahí abrimos Shopping China"*). No proponerlo antes; la señal para abrirlo: la pasada semanal ya no trae nada nuevo de 35%+ ni reposiciones que den.
- **Pasada semanal de Nissei: sábados 9:00** (24/10, eligió 1a 2a: probados primero + catálogo entero + ventas al final, todo cada semana). La tarea `trig_01Hf4WdWcKKkL5L6q3viaVf9` arma el texto fresco (`pyprobadoslista` + PROMPT_GUAY), se lo manda por acá y `recordar` a CYC Avisos; él lo pega en Claude en Chrome. Los `pyprecio` del chat van por **ml-consulta** (por ml-sync se cancelan entre sí).
- **Costos de Paraguay sólo con el ticket** (26a del 30/10: sin ticket no se toca la ficha) y **la recompra más barata BAJA el costo** (27a; el viejo queda en los meses vendidos). **Lo que no había: tachado en rojo; lo pagado que no llegó: reclamo en rojo** (`pyped:reclamo`, informe 8c) hasta resolverlo.
- Al llegar: `pyped:llego` crea las fichas (costo pagado × recargo) y recuerda contar la oficina (`ofi`); elegir cuenta según rubro.
- **Todo lo que entra con ticket se carga con su precio final, aunque no sea para ML** (23/10, *"por más que no sea para ml puede que necesite en algún momento el costo"*): ficha con costo (`nuevoprod`/`poncosto`) sin preguntar; **sólo se le pregunta lo que no sé qué es** (ej. un código sin nombre, como el 7114209 = Joystick PS5), y va a `notas/para_mati.md`.

### Listas de otros proveedores (📋 Listas = otro Paraguay, sólo para ML; `PROMPT_LISTAS.md`, CEREBRO §17)
- `lista:<prov>[|fecha=AAAA-MM-DD];<producto>=<pesos>[@<cód>];…;go`. **Nunca cargar una lista vieja** (18/10; el comando frena si la fecha
  es anterior a `cyc/mlconfig/listasProv/<prov>/fecha`). **Preguntar si el precio es el que se paga o lista con descuento** y cargar el
  NETO (Iscos: "P. Lista" con −30%/−33,5%, `listadto`).
- **Iscos: sólo lo que está en su web** y el precio de la web × **0,665** (19/10, `listaweb:iscos|fecha=<AAAA-MM-DD del archivo>;go`, `noWeb`; 29/10: sin fecha o más viejo que la lista cargada se niega, y una fila que no vino en la última lista queda "📅 de una lista anterior" y no cuenta).
- **🏙️ Listas del Once** (28/10, él: *"bs as está muy desaprovechado… lo mejor es conseguir listas"*; eligió 1a): Tito pide la lista a cada mayorista donde compra (foto, PDF o WhatsApp; precio final o +IVA, y si da factura) y el chat de Chrome busca mayoristas del Once con catálogo con precios en internet y los carga (`ml-sync/PROMPT_ONCE.md`: `lista:` con fecha → `|bsas` → `listamedir`). Todo va a Pedidos → Bs As con la vara de 35%.
- **En el Once las marcas reales son imitación: no se venden en ML** (29/10, él por el chat de Chrome): de las listas de Bs As se sacan los productos de marca real conocida (Samsung, JBL, Apple, Sony, Xiaomi, Lattafa, L'Oréal…); quedan los genéricos o con marca inventada. `lista:<prov>|borrar;<código o nombre exacto>;…;go` los borra y los anota en `listasProv/<prov>/fuera` (al recargar la lista no vuelven). PROMPT_ONCE e IMEGA ya lo dicen.
- **Dai Nippon** (Bs As, lo trae Tito): **desde el 21/10 tiene casilla, 🧾 Pedido con mensaje de WhatsApp, Ya lo pedí y Llegó** como las otras.
- **Pedido a una lista y la plata** (20/10 2b + 24/10 12a): pagado al pedir (💵 Ya lo pagué mientras viaja, `pagado:true`) → mercadería en camino en el Arqueo (`listaEnCaminoUSD`); sin pagar → al llegar es deuda hasta que se paga (`listaDeudaUSD`).
- Mismas reglas que Paraguay: 25% + catálogo 2+ vendedores (o 🌟 sin competencia, 43a del 24/10) + **confirmado por mí** (`listarevisar` → `listadato:<prov>;<cód>=ok|no|mi=MLA…;go`,
  con duda no se toca). El robot mide lista por lista y anota la vuelta completa (`cyc/mlconfig/vueltas`). Todo se mide contra ML (también lo de Bs As).
- Fechas al 19/10: Dai Nippon L1309 19/10 · Unilever 08/10 · Iscos 01/10 · Cadam 26/09 · Qsoft 23/09 · Godrej 01/08 (Wels también).
- **Softys** (papel higiénico, rollos, servilletas, pañuelos, toallitas femeninas, pañales Babysec y Cotidian): lista del 17/10 cargada el 24/10 (141 productos, "Precios Finales" por unidad de venta; en el nombre se sacó el "<UxB>X" del bulto). Se compra por pedido (24/10, él).

### Paulvic (perfumes, proveedor de Bs As; CEREBRO §18)
- **Costo = el del último pedido** (17/10): (pagado + flete) ÷ (llegadas + regalos perfume). **Los testers NO cuentan** (22/10: son probadores
  que se le dan a la perfumería, no se venden ni se cobran; se anotan con `tester=` y no entran a la oficina) (`pvped:costo:<id>;apagar=;flete=;tester=;regalo=;go`; también `llego` y `pago`). Tarjeta por pedido (`pvPedidoTarjeta`).
- **7 días hábiles para pagar desde que llega, si no +10%** (20/10): avisarle al llegar los días que le quedan.
- **Lo que se pide y no viene no se pide más** (`cyc/noconsigo/<prod>/nunca/<aroma>`, `pvped:nunca:-<aroma>;go` lo saca).
- Cada aroma es su publicación y se juzga solo (grupo de precio desactivado 04/09). Compartido Adriana + Persea en Luciana.
- **Invictus y Phantom: dados de baja en ML para siempre** (24/10, él; ML los frenó por la marca del nombre). No se piden ni se mandan a Full; lo de la oficina va al local. 26/10 (él: *"irrecuperables, eliminá todo"*): las 10 publicaciones ocultas en el panel (`nomas`), oficina en 0 (6 Invictus al local), sin etiqueta en 0, "no vienen más" desde el 22/10.

## 8 · PLATA, GASTOS Y ARQUEO

- **El Arqueo está en DÓLARES** (en chico los pesos al lado). Antes de escribir en un campo que existe, preguntar en qué unidad lo lee.
- **El saldo de MP no se lee por API** (~30 puertas medidas). El disponible: desde el 26/10 lo lee cada día el chat de Chrome (3a, renglón `mp:` del buzón) y lo cargo con **`ancla:buzon=<ts>;go`** (29/10, 1a: el robot toma los saldos del renglón `mp:` del buzón; **los saldos de MP no se imprimen nunca**: `buzon` los tapa y ancla/dispo/saldoml muestran `$•••`, `_MASCARA_PLATA`; a mano sigue `ancla:<cuenta>=<pesos>@<AAAA-MM-DD HH:MM>;go`, la hora en que lo leyó); `dispo`
  suma/resta desde ahí (una vez por mes recargarlo; `dispo` NO avisa por Telegram, decisión 30/09). "A liquidar en ML" y la agenda de
  liberaciones salen solos de `saldoml` (reporte de liquidación, ml-daily). El extracto de cuenta se baja a mano y **trae nombres de
  terceros: nunca al repo ni a un log**.
- **Gastos:** la lista de Gastos del mes dice qué falta (`GASTOS_DEL_MES`, ❌/⚠️/✅, "este mes no va" por mes). Cargar con
  `cargargasto:<fecha>|<monto>|<cat>|<desc>[|…][|go]`. Cargos de Full del mes: `cargosmes[:<AAAA_MM>][:go]` (en la completa del 15; el
  período de ML va al mes siguiente) — sólo almacenamiento/stock antiguo/retiro/multas (~$130.000/mes), las percepciones ya están en
  `ML_EXTRA_PCT`. Recordárselo a fin de mes. Retiro y gastos se cargan enteros cuando se pagan (no se reparten por día).
- **Cada venta usa el dólar de SU día** (27/10, él eligió la 1a después de decir "dejalo así"; caso: el 15/10 pasó de dorado a violeta porque el mes en curso se recalculaba con el dólar de hoy): `tcDeVenta` (`v.tcSale`, lo guarda el robot) en `_efectivoCostoVP`; un día pasado sólo cambia por una cancelación/devolución o un cambio del costo en dólares. Meses con dólar a mano o cierres viejos (sin `tcPorVenta`) siguen con el del mes; los cierres nuevos guardan `tcPorVenta`. El robot ya usaba `v.tcSale`. Para explicar un día que cambió: `porquedia:<AAAA_MM_DD>`.
- **Lo comprado en pesos tiene el costo FIJO en pesos** (27/10, él eligió la 2a): Bs As, Paulvic y listas con `costoPesos:true` → costo = los pesos pagados (`cost`), el dólar no lo mueve; Paraguay sigue en dólares. Se marca solo al cargar en pesos; las viejas con `costopesos[;go]`.
- **📥 Lo que nos deben = lista de deudas** (`cyc/debencuotas`, Arqueo → Ver deudas, 28/10): cada una con cuotas o sin, frecuencia, vencimiento (rojo si se atrasa), costo/ganancia o "sin ganancia", y **movimientos** (`movs`: + nos deben más, − devolvió; historia de a 6 por página). Cuando él dice *"agregar $70.000 deuda perfumería a CYC …"* → `debenmov:deuda perfumeria=+70000|<nota>;go` (hoy hay también "Mercaderia Perfumeria": con "perfumeria" solo agarra 2 y no escribe); *"cobré $70.000 de deuda de perfumería"* → `debenmov:deuda perfumeria=-70000|cobró;go` (ml-consulta; `@AAAA-MM-DD` si no es de hoy; `debenmov` solo lista). **"Deuda de CYC A la perfumería" es lo contrario** (lo que debemos): no va acá, preguntar dónde va.
- **🛍️ "Mercaderia Perfumeria" = mercadería dejada en las 3 perfumerías del pueblo (Soares, Sarmiento, Ceballos)** (28/10, él): *"dejé el xiaomi watch 5 lite en soares… te digo cuánto nos paga la perf"* → `debenmov:mercaderia perfumeria=+<lo que paga c/u>|prod=<ficha>|local=soares|u=<n>;go` (guarda el costo de la ficha y la ganancia, en verde); cuando pagan → `=-<pesos>|pagó Soares;go`. **Esa ganancia va APARTE: en Ver deudas, Métricas → 🏪 Local / 🔀 ML + Local y ¿Cierra el mes?; **nunca en ventas, métricas de 📦 ML ni la ganancia de ML** (29/10).** **Lo que paga la perfumería = costo + 25%** (29/10, él: *"todo lo que se le manda a la perfumería se le gana un 25%. salvo que yo te indique otra cosa"*): `debenmov:mercaderia perfumeria=+25%|prod=<ficha>|local=<…>|u=<n>;go` (el robot hace costo × 1,25 × unidades). **"La perfumería pagó X" sin decir de qué** (30/10, él: *"evitamos que te diga de qué cobramos, sólo te digo la perfumería pagó x pesos"*): `debenmov:perfumeria=-X|<nota>;go` → primero a MercadoPago (Deuda Perfumería) hasta dejarla en 0 y lo que sobra a Mercadería; el saldo de MercadoPago se mira en CADA cobro (si volvió a deber, vuelve a ir primero ahí). **Se cobra por PLATA, no por producto** (30/10, él: *"cobramos de la perfumería 200.000 de deuda o de mercadería y vos restás"*): `=-<pesos>|<nota>;go` y lo pagado tacha los productos del más viejo al más nuevo; el que queda a medias se llena hasta su %, lo que sobra cubre lo que se deje después (`deudaFifo` web / `deudaFifoBot` robot, cuenta derivada). **Lo que devuelven sin vender** (30/10, 11a): `=devuelve|prod=<ficha>|local=<…>|u=<n>|a=<local|ml>;go` (achica lo dejado, saca esa ganancia y lo vuelve a la oficina; `=desde` en Mercadería no se usa). **Venta en cuotas** (7a): cuenta el día que se vendió (`debenmov:nueva=…|fecha=AAAA-MM-DD`). **Oficina** (28/10, eligió 1a): lo dejado que salió de la oficina se resta de la oficina, pero **sólo cuando él lo dice o se le pregunta** (a veces deja mercadería que nunca estuvo en la oficina: ahí no se resta nada). **Nada se borra** (sin 🗑️): lo pagado queda en verde en ✅ Pagadas; Mercadería y Deuda Perfumería son 📌 fijas (`fija`), siempre arriba. **En la web** (29/10, él): "🛍️ PERFUMERÍA · Mercadería" (= Mercaderia Perfumeria) en 🛒 Ventas a cobrar y "🛍️ PERFUMERÍA · MercadoPago" (= Deuda Perfumeria) en 💵 Préstamos; con costo o ganancia, una deuda es venta siempre. Para el robot siguen siendo las dos de siempre.
- **Las dos webs (30/10, él eligió a): "PANEL" = la nuestra (https://maticaldas-del.github.io/web-cyc/, index.html) · "TIENDA" = la pública por encargo para sus conocidos (se edita en `tienda/index.html` y se COPIA al repo `tiendacyc/tiendacyc.github.io`, su propia dirección desde el 30/10; ese repo trae `productos.json` de acá cada hora; a la gente sólo le dice "CYC"; la dirección no va en los textos).** Siempre así en el chat y en los textos.
- **Nombres (29/10, él): "OFICINA ML" = su oficina (antes Mi oficina / Oficina Mati; en el código sigue `Oficina_Mati` / `of_mia`) · "OFICINA LOCAL" = la de CYC para el local (antes Oficina CYC; `of_viejo` / `cyc/oficyc`) · perfumerías: CEBALLOS, SOARES, SARMIENTO.** Todo lo que sale de la Oficina Local me lo pasa él y lo cargo yo, producto por producto (antes era un solo número). En `debenmov` sirve `de=local` / `de=ml`.
- **📊 Métricas: 📦 ML · 🛍️ Perfumería · 🏬 Tienda · 🔀 Todo** (30/10 a la noche, él: *"local ya no existe más. hay perfumería y tienda. separados todos"*; antes 🏪 Local y 🔀 ML + Local). **Perfumería** = Mercadería Perfumería + Deuda Perfumería (MercadoPago): sus "cuentas" son Soares, Sarmiento, Ceballos (y "sin perfumería" si hay), con barras, mes a mes, productos y sus deudas. **Tienda** = toda otra venta que hacemos por afuera (personas, la Tienda pública), con sus deudas; en Ver deudas dicen 🏬 TIENDA. **Todo** = las tres (KPIs, tres capas en la Tendencia, tabla por día con tres columnas). Armadas igual que ML (KPIs, Tendencia, % de Ganancia, Participación); Rubros, Reputación, Horas, Origen, Mezcla y Cambios de precio sólo en ML (`metSrc` ml/perf/tienda/todo, `metAccts`, `_metLocalDia`, `PERF_ACCTS`, `loc_perf`/`loc_tienda`). La venta cuenta el día que se deja/vende. **Inicio → Ventas de hoy/mes/año y el puntaje quedan SÓLO de ML** (30/10, él eligió 2a: *"todo o nada"* → nada): el total de CYC se ve en 🔀 Todo y en el cobro. No volver a proponerlo.
- **🏪 El local (las perfumerías) es OTRO negocio** (29/10, él: *"el local es un negocio aparte, nosotros le vendemos mercadería cuando necesitan… se anota como deuda y listo"*): sus ventas, cobros y gastos no son de CYC; CYC le vende al costo + 25% como deuda. **La Oficina CYC se cuenta por unidades** (él: *"voy una por una pasándote lo que hay"*): `oficyc:<producto>[@color]=<N|+N|-N>;go` (ml-consulta, `cyc/oficyc`; no es de ML: no va a Pedidos ni a Full); mientras se carga el Arqueo usa el valor a mano y la web dice cuánto va contado; `oficyc:listo;go` = el valor pasa a ser lo contado. Lo que pide la perfumería sale primero de la Oficina CYC; al dejárselo `debenmov …|prod=|u=|de=cyc` resta de ahí (`de=mati` → `ofi:` aparte).
- Percepciones IIBB medidas por cuenta en `ML_EXTRA_PCT` (Adriana 3,80 · Luciana 4,01 · Ayelen 5,99 · Matías 3,40).
- Los reclamos que "cubre" ML SÍ nos cuestan (0 de 70 dejaron la plata, 15/10): no volver a proponerlo.

## 9 · REVISIONES POR ETAPAS Y EL CARTEL

- **Todo cambio o cosa nueva se anota en `ml-sync/REVISION.md` en su etapa, EN EL MISMO COMMIT** (qué es · dónde vive · qué chequear).
  Si no entra en ninguna, etapa nueva ahí y en `REV_ETAPAS` (`index.html`).
- **9 etapas:** 1 Precios · 2 Plata · 3 Mercadería · 4 Choques y fallas mudas · 5 Datos, historial y cerebro · 6 Ideas nuevas · 7 Diseño ·
  8 Reglas del cerebro (cada 7 días, adelante cuando le toca) · **9 Local** (cada 7 días, 29/10, él: *"vamos a ir haciendo cambios grandes todo el mes sobre local"*: todo cambio del local se anota en esa etapa). Cada madrugada a las **04:00** toca la que hace más que no se revisa
  (`REV_HIST`/`REV_HECHAS`; nunca una de los últimos 6 días). 4 revisores con esfuerzo **máximo**. Tarea `trig_01TT94wnEKk299d85Sj6ePWw`:
  **PRENDIDA otra vez el 24/10/2026 01:02 UTC** (vie 23/10 22:02 de acá, como pidió él; estuvo pausada desde el 21/10). Primera revisión sáb 24/10 04:00.
- **El cartel de Inicio lo manejo yo** (`REV_PENDIENTE` / `REV_HECHAS`, sin botón): algo resuelto ENTERO sale de pendiente con su fecha.
- Etapas 6 y 7 traen siempre cosas que den gusto (efectos con sentido, comodidad, duplicados, faltantes) con maqueta. La 7 **dibuja**
  cada pantalla con el CSS real (Playwright 360/390/1200 px) y mide que nada se corte y que **ningún botón se corra al cambiar un texto**.
- Lo que se mira en TODAS: contar dos veces lo mismo · fallas leídas como dato · dos fórmulas para un número · datos de terceros en el log.
- **La revisión completa final** se pidió y está hecha (30/09) — ver HISTORIA para todas las etapas cerradas.

## 10 · CÓMO ESTÁN HECHAS LAS COSAS

- `index.html`: al tocarla, subir `APP_VERSION`, agregar renglón en `APP_CAMBIOS` (`{n,t}` con n 1 leve/2 mediano/3 importante; versión
  con `f` fecha y `h` hora DE ACÁ) y subir `CACHE` en `sw.js`. La app se actualiza sola y no deja usar una vieja (depende de `CACHE`).
- **Cada cambio se sube también a `claude/add-folder-78ysyb`** (07/10, siempre y sin preguntar): la web y el robot salen de esa rama.
- Firebase Realtime Database: **todo lo del panel vive abajo de `cyc/`** (sin prefijo va a una rama que la web no lee). `mlapi/` va en la
  raíz (tokens, Telegram, línea de tiempo, fichas, pycat: cosas grandes FUERA de `cyc/`). **La web escucha `cyc/<parte>` una por una
  (`CYC_KEYS` en `startApp`, 26/10): una parte NUEVA que tenga que leer la web se agrega ahí o llega vacía**; `CYC_LAZY` = lo que se baja
  al entrar a su pantalla (`candidatos_py` → Pedidos). Reglas de la base:
  sólo el UID de la cuenta (él, su padre y el robot usan la misma); si se suma otra cuenta, agregar su UID. **Cada comando es un login a
  Firebase y muchos logins o muchas fichas en una corrida dan QUOTA_EXCEEDED: `ficha:` de a 10 como mucho por corrida.**
- `cyc/mllinks/<MLA>` se reescribe ENTERO al vender: guardar datos propios en nodos aparte (`cyc/netopub`, `cyc/entregas`, `cyc/rescateventa`)
  o hacer patch sólo de lo que cambió. Un nombre que escribe una persona dentro de una clave: escapar `. # $ [ ] /`.
- **Comandos ("probes"):** se disparan con `BILLING_PROBE` (campo `billing_probe` del workflow). **`ml-consulta` = sólo lectura** (corre sin
  el candado del ciclo); sólo escriben ahí los de `CONSULTA_ESCRIBE` (ventasvistas, pycat, lista/listadato/listamedir…, candprecio, revcand,
  vincular, nombreml, pasara, nomandar, fijarvar, cupo, poncosto…); los de `CONSULTA_NIEGA` con `go` se niegan. **`decido`, `entrarpromo`,
  `contesto`, `activarfull`, `ofi`, `ancla`, `pyped`, `pvped`, `cajallego`, `compray`, `pedir`, `pregunto`, `tgaprobar` y lo grande van por
  `ml-sync`** (mirar el `Set` en `sync.mjs` si dudás). El ciclo de 2 min se
  vuelve a prender solo después de cada comando. Comando desconocido sale con error (el volcado de facturación es `billingdump`).
  `ml-sync` ya tiene las 25 opciones de GitHub: lo nuevo va adentro de `billing_probe`. **Workflows: sin opciones repetidas en un paso**
  (`yaml.safe_load` no alcanza) y `!cancelled()`, nunca `always()` en un job. ml-daily corre ~06:10-07:10 de acá (GitHub atrasa).
- **Leer resultados sin gastar tokens:** `list_workflow_runs` sólo con `perPage:1`; después `list_workflow_jobs` + `get_job_logs` con
  `tail_lines` chico (o guardar en archivo y grep). El chequeo de la mañana queda en `chequeo/ultimo.txt`. El repo se llama `web-cyc`
  (las herramientas aceptan `maticaldas-del/a`). `curl` a la API de GitHub da 403.
- **Antes de borrar en `index.html`:** marcar inicio Y fin a mano y comparar contra `git show HEAD:index.html` las tres listas (funciones,
  `const`/`let` de nivel superior, `id=`) + clases de CSS: sólo puede faltar lo que se quiso sacar. **En `sync.mjs`:** antes de crear o usar
  un nombre, mirar si ya existe o si está definido EN ESE bloque (`invUpd`, `MIN_GROSS`). `node --check` no agarra ninguna de las dos.
- **Verificar antes de decir que anda:** correr en prueba y mirar la salida ENTERA (no el último renglón); si escribe, releer de la fuente;
  los verificadores llaman a la MISMA función que el código real; verificar contra lo que él VE en pantalla. Un cero que parece buena
  noticia merece la misma desconfianza que un número absurdo. Fechas `2026_09_09` dan NaN si no se reemplaza `_`; `catch {}` vacío y `||`
  antes del chequeo esconden fallas. Un filtro por palabras del título: **mirar la lista antes de aplicar** (sin `:go` sólo muestra).
- **La web no le puede preguntar nada a ML** (no tiene token): todo lo de ML lo escribe el robot y se actualiza a su ritmo (caja y stock
  cada hora, margen de noche, ventas cada 2 min).

## 11 · PRIVACIDAD (repo y registros de GitHub PÚBLICOS)

- **Todo lo que entra al repo y todo lo que imprime un comando lo lee cualquiera, para siempre.** Antes de commitear o imprimir: *¿de
  quién es este dato?* Si aparece alguien que no es Mati, no va. Nada de apellidos, CUIT, domicilios, nombres/teléfonos/direcciones de
  compradores, mensajes de compradores, números de orden enteros, CUIT de proveedores, tickets del mayorista, extracto de MP.
- Los probes imprimen nombres de campo, no valores (`campos`, `vergastos` muestra claves). No correr `posventa` salvo que él lo pida.
- **La web publica el repo con Cloudflare (`assets.directory = "."`)**: sólo `index.html`, `sw.js`, `manifest.webmanifest`, `icon.svg` deben
  publicarse; lo demás va en `.assetsignore` (ya están `CLAUDE.md` y `ml-sync`). Archivo nuevo → ¿tiene que estar en la web? Si no, al `.assetsignore`.
- El repo sigue público a propósito (privado se come los minutos de GitHub y apaga el robot). Nunca se subió ninguna clave.

## 12 · COMANDOS MÁS USADOS (`billing_probe`; casi todos sólo leen; los que escriben piden `:go`/`;go`)

| comando | para qué |
|---|---|
| `informe:12` | el log único de la vuelta: avisos, ventas, decisiones y resultado, pausadas, nuevas, pedidos, cajas, preguntas, frenadas, caja perdida, fechas |
| `ventasraras:nuevas` / `ventasraras[:horas]` | ventas nuevas con su %, 🔬 A FONDO y ✓ normales, 🏷️ en promo |
| `ventasvistas:<ts>\|esf=<nivel>\|<MLA>=<texto>\|…;go` | cierra las ventas analizadas y deja el 🔬 en cada una (ml-consulta) |
| `ficha:<MLA>` (varias: UNA POR RENGLÓN, con coma no anda) / `ficha:cuenta=<cuenta>` | la ficha médica completa (sólo lee) |
| `decido:<MLA>=<precio>[!piso][!cruza][!sinlinea!activar]#<tag>\|<motivo>;…;go` | poner un precio con estrategia y motivo (sin `;` en el motivo) · `=nota\|…` sólo nota · `decido:ped:<id>[#color]=u\|N\|motivo` · `=venta\|<precio>` · `decido:caja:<id>@<cuenta>[#color]=u\|N\|motivo` · `decido:archivo=<nombre>;go` · `decido:dia:<fecha>=nota\|…` |
| `entrarpromo:<MLA>=<precio>@<id\|PRICE_DISCOUNT>\|motivo;go` / `=salir` | entrar o salir de una promo/descuento |
| `tag:<MLA>=<tag>\|motivo;go` / `tag` | poner o listar estrategias |
| `errores[:horas][:go]` · `autoriza` | detector de errores ya marcados · autorizaciones 🔐 suyas |
| `revfondo` | productos con stock y publicación activa sin revisión a fondo a tiempo (quietos 2 d, los que venden 7 d): tiene que quedar vacío en la completa |
| `techo95[;go]` · `bajastecho[:días]` · `escasez` · `planilla` · `raros` · `vendiocaro` | techo al 95% · bajas sin techo (❌) · escasez 🚨 · listas 🛡️📦🔎📈 · raros contra su año · 🔙 lo que quedó abajo del precio más caro que vendió (con el `decido` listo) |
| `pausadas:25` · `activarfull:go:25` | pausadas con stock en Full y por qué · activar las que dan |
| `contesto:<id>=<respuesta>;…;go` | contestar preguntas seguras |
| `pregunto:<texto>` · `recordar:<texto>` | Telegram al canal privado |
| `pedidostodo` · `cajasnotas`/`pedidosnotas` · `porquepedido:<palabra>` · `porquebajo:<palabras>` | pedidos de todo el catálogo · números · por qué |
| `pyped:…;go` · `pedir:<palabra>=<u>;…;go` · `compray:<fecha>\|…\|go` · `ofi:<palabra>[@var]=<+N\|-N\|N>;…;go` | Paraguay, unidades, pesos del pedido, oficina |
| `ofi:<palabra>=+N;go` (queda sin etiqueta; `!ok` si ya viene etiquetado) · `sinetiq[:<palabra>[@var]=<+N\|-N\|N>;…][;go]` | oficina · etiquetado (0) · lista |
| `cajallego:<seg>[;…][!<palabras>=<u>]:go` · `abrircaja:<seg>:go` · `cajasllegaron` · `faltaron[:días]` | cajas a Full |
| `lista:<prov>;…;go` · `listarevisar` · `listadato:…;go` · `listaweb:<prov>;go` | listas de proveedores |
| `pvped:<acción>:<id>;…;go` | Paulvic (llego, pago, costo, nunca) |
| `sololocal:<id o palabra>[=-]:go` · `ofisinpub` | ficha que se vende sólo en el local (no se publica) · lo de la oficina sin publicación |
| `vincular:<MLA>=<ficha>:go` · `nuevoprod:<nombre>\|costo=\|mla=\|go` · `fijarvar:<MLA>=<var>[@ficha]\|go` · `buscarpub:<texto>` · `huerfanos` | fichas y vínculos |
| `unapub:<MLA o palabra>` · `hermanas:<palabra>` · `bajopiso` · `submargen` | todo sobre una publicación · hermanas · márgenes |
| `poncosto:<id>\|<pesos>\|go` · `ponenvio` · `cajacosto` · `costohist` | costos |
| `supervisor:medir:go` · `juzgo:<id>=…` / `juzgo:archivo=juicios_precio;go` | juicio de resultados |
| `gemela` · `gemelacrea:<MLA>=<precio>:go` · `gemelaenvio` · `gemelaenviocrea` · `gemelaalinear` | gemelas Premium y envío gratis |
| `cupo` · `codigos[:palabra]` · `pasara`/`nomandar:<cuenta>:<palabras>[:go]` | cupo de Full, códigos de etiqueta, reparto por cuenta |
| `ancla:<cuenta>=<pesos>;go` · `dispo` · `saldoml` · `cargargasto` · `vergastos[:mes]` · `cargosmes` · `cobromes` · `factarca` · `catmono` · `facarca` · `topeh` | plata y ARCA |
| `cerebro`/`analizapromo:<días>:<palabras>` · `eventos` · `fechas` · `vistas` · `ventashora` · `efectotecho[:días]` · `techodias` · `franjas[:días][:MLA]` | promos, fechas, mediciones (¿las subas 📈 bajan ventas/ganancia? ¿cuánto tarda cada prueba? ¿hay dos franjas buenas?) |
| `chequeo[:días]` · `alertas[:horas]` · `reglas` · `permisos` · `probarput:<MLA>` | chequeo, avisos, base, permisos de ML |
| `tgaprobar:<núm>:go` · `tgchats` · `webpush` | Telegram y push |
| `liquidando[:<MLA>][:go]` · `nomas:<MLA>:go` · `pausar:<busca>[!saca][:go]` | marcas sobre publicaciones |

Si dudás si un comando existe, buscá en `sync.mjs` (`grep -n "'<nombre>'" ml-sync/sync.mjs`) antes de escribir uno nuevo.

## 13 · PENDIENTES ABIERTOS (al 22/10/2026; borrar al cerrarse)

- **El arqueo de noviembre es el primero con todo cargado** (29/10, él: *"el que importa es el próx arqueo, ya que vamos a tener todo al detalle cargado"*; local por unidades y perfumerías incluidas): al cerrar noviembre correr `cierrevs` y explicarle la diferencia renglón por renglón. Octubre dio +$603.578 que sobran (US$ 387, con el local ya sumado); sospechosos: efectivo +US$ 2.903 y lo vendido sin reporte.
- **Revisiones por etapas:** vuelven solas el sáb 24/10 04:00 (ver §9). Cuando el cartel quede sin pendientes, recordarle la revisión
  completa al final si la pide.
- **Los 22 ❌ de antes del detector** (corrida del 22/10, 72 h) siguen puestos y NO se deshacen solos: los decide la vuelta de a uno,
  con nota si se quedan (algunos a propósito: WD, microSD, Adyan). Entre ellos el Pendrive 8gb a $23.990.
- **Mediciones agendadas (CEREBRO §22):** 27/10 `techo95` de los 5 lanzamientos (Halloween Man, Ferrari Rojo, Adyan Oud, microSD Pokémon,
  WD 480) · 28/10 `vistas` sobre las 12 que pasaron de descuento a liso (tachado vs liso, 3a) · 02/11 promos en el CyberMonday ·
  **14/11 pedido de Navidad para 45 días**.
- **Medir 6.A1** (21/10): `publicar` sin go en la próxima llegada (avisarle antes de crear) · `ficha:<MLA>` sin go (línea RAYAS) ·
  `altanuevas`/`pausadas`. `cargosmes:auto` corre solo el 01/11. (ver HISTORIA, "62 DECISIONES")
- **Paulvic:** juzgar la prueba de $21.990 (si perdió, volver a $14.950; si ganó, extender primero Persea; `efectotecho` 22/10: 5 aromas
  que vendían 1-2 cada 14 d no vendieron más, Good igual plata con 1/3 de unidades, L'extase mejor; Paulvic −~$1.300/día, pocas ventas: sin certeza) y la idea de un Paulvic de
  hombre a ~$17.990. Pedido del 06/10 llegó y se pagó (ver HISTORIA). Blush sin publicación en ML.
  **Pedido `pv20261019` llegó el 22/10 COMPLETO** (114 u. + 3 testers de Witch Night/Good/Blue para la perfumería, no cuentan;
  flete $18.000, el del remito redondeado, cargado). Facturas A 45796/97: total $798.758,16 (con IVA); se paga con 5% menos si es en 7 días hábiles (la calculadora del 06/10 fue factura × 0,95 exacto) → a pagar **$758.820,25**, cargado;
  **PAGADO el 24/10** ($528.900 + $230.000 = $758.900, dos transferencias; comprobantes cifrados en `ml-sync/comprob/pv20261019/` y cargado con `pvped:pago`).
- **Iscos del 19/10:** se publica en ML (lo hace él); al llegar fichas con costo web × 0,665 y el precio lo decido yo (peor caso). Los dos
  Nina 50 ml pueden no venir. Se esperan ~5-10%: si no deja ni el costo, avisarle.
- **Paraguay:** cuentas de correo (monto y kilos) del pedido del 08/10 y datos del 08/09; transferencia de $50.000 del 29/09 (preguntar).
  Evaluar el 17% de recargo con los gastos del próximo pedido (ya se usa el medido). Cargar los ~13.467 códigos de `pycat` si quedó a medias
  (el chat de compras no tenía GitHub). Pasada del mes de Guay: no se le manda nada hasta que él pida "hagamos la de guay".
- **Pedido Paraguay `py20261026` LLEGÓ el 30/10 completo** (16 u., recargo real 20,8%): 9 fichas nuevas; 7 marcadas para Ayelen (`pasara`, falta publicarlas: las crea él); Dior J'adore 100 ml y Pendrive SanDisk Z430 128GB = `sololocal`; EX15LP azul (2) y Waflera Atma Disney (4) son reposición. Todo a la oficina sin etiqueta.
- **Pedido Paraguay `py20261028` (resto, en camino, pagado US$ 638,31 / $1.082.452):** al llegar, **Bad Boy Le Parfum 150 ml y 212 NYC Men 100 ml van con `sololocal`** (perfumería del local, él 28/10), no a ML; **el local se los devuelve a CYC: deuda cargada $247.588** (US$ 146 a $1.675,84 + su parte de comisiones; sin correo ni el que retira). Falta: lo que cobró el que retira y el correo. Waflera Atma Disney y Pendrive Cruzer Blade 64gb: Nissei no tiene (28/10, marcados `py_sinstock`).
- EX15LP blanco publicado pausado en Ayelen (23/10, `MLA2230467989`, 2 u. sin etiqueta); Joystick PS5 7114209 = sólo local. **Piedra Gua Sha** (ficha sola) y Kit Jade vinculados. (Linternas COB, contador y Sancor: él 27/10 *"no nombrar más"*.)
- **P47 en Matías (29/10):** 6 publicaciones activas con ~6 u. en Full (3 azul, 3 rojo): cuando Full llegue a 0, `cerrarpub:MLA1459816555,MLA1701523603,MLA1955025360,MLA2218538901,MLA2218602297,MLA4105733142:go`. MLA1447211187 (Luciana, inactiva) ML no deja cerrarla.
- **Almacenamiento** (24/10): ML no da la tarifa por unidad; sale de la factura de septiembre: almacenamiento común $47.735 en las 4 ÷ ~2.640 u. en Full ÷ 30 d ≈ **$0,60 por unidad por día** (cargado con `almactarifa`, chico = grande). El stock antiguo va aparte ($64.155 en sep). Rehacerlo con la factura de octubre (`cargosmes:2026_10`).
- **Filtro de envíos internacionales** en candidatos: el campo existe (`international_delivery_mode`); escribirlo cuando aparezca uno.
- **`anotarNetoWeb` no se llama desde ningún lado** (el margen sólo se recalcula de noche): o se enchufa o se borra. (ver HISTORIA)
- **`enProceso`** (lo recibido-procesando en Full) no lo cuenta nadie al marcar una caja: hoy vale ~0, se mira si aparece una caja grande
  en revisión (`internal_process` en el stock actual).
- **Nissei traducido (23/10):** ~3.970 "sin catálogo" volviéndose a buscar con el nombre traducido (~700 por vuelta). Mirar con `pycatdia`
  cuántos aparecieron y que "Sin medir" de la web baje a ~100.
- **Una foto de precios tomada dos veces por mañana** marcó "1 cambio a mano" (sin nombre): mirar.
