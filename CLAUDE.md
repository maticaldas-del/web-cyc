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
| `ml-sync/AUDITORIA.md` | auditoría del robot (datos crudos contra el `informe`) |
| `ml-sync/notas/` | `preguntas.md` (cada corrección suya vuelta pregunta general) · `correcciones.md` (cuántas veces me corrigió) · `techo.md` · `ideas.md` · `sin_estirar.txt` · `decide_pedidos.py` · `decide_cajas.py` · `pedidos.txt` · `juicios*.txt` · `listaweb_iscos.txt` |
| `ml-sync/HISTORIA.md` | todo lo viejo, textual |
| `index.html` / `sw.js` / `ml-sync/sync.mjs` | la app (PWA en un archivo) · su caché · el robot (~todos los comandos "probe") |

## 1 · CON QUIÉN HABLÁS Y CÓMO

- **Matías**, revendedor en ML desde Argentina. **No es programador: castellano llano, sin términos técnicos** ("endpoint",
  "commit", "deploy" no). Si hace falta nombrar algo técnico, explicarlo en una frase en criollo.
- Dale **el número y la conclusión**, no el camino. Si algo está mal, decilo derecho y proponé qué hacer.
- **Decisiones: TODAS JUNTAS, en UN mensaje, numeradas, cada una corta con (a) sugerida y (b)**; él contesta "1a 2b 3a"
  (08/10, *"quiero que me pases todo lo que hay que decidir todo junto siempre"*). Ideas de revisiones también todas juntas.
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
  1) la que ya lo publica · 2) **el rubro (perfumes → Adriana)** · 3) el equilibrio (la que menos facturó entre las que llegan al
  25%; `repartopy`) · y la actividad de ARCA. **Una sola cuenta por producto** (09/09; excepción Paulvic: Adriana + Persea en
  Luciana). En la MISMA cuenta sí puede repetirse.
- **Pedidos mira el stock de las 4 cuentas juntas** (C1, 29/09: si en total se vende 10/mes y hay 10 en otra cuenta, no se compra).
  **No volver a proponer calcularlo por cuenta.**
- **Cobro del mes** (17/10): se cobra lo que dice "💸 cuánto cobrar" del mes cerrado (ganancia real de CYC ÷ 3, cada socio; ×2 =
  retiro). **Reemplaza los $1.800.000 fijos.** El 1º del mes cargo el retiro con ese número (`cobromes:<mes cerrado>`). La tarjeta
  del mes en curso proyecta a fin de mes al ritmo del mes. El interés del capital en dólares ya no se paga desde el 19/09 (ver HISTORIA).
- **La plata ya no es el límite: el proveedor sí** (24/08). Liberar caja vale menos que el almacenamiento y el descarte.
- OSDE y el colegio son PERSONALES (no cargar). **Sancor = la obra social privada de Ayelen** (un solo renglón, monto real de la factura).

## 3 · REGLAS QUE NO SE ROMPEN

1. **Antes de tocar un precio en ML, 100% seguro de que el número es correcto.** Si no, no se toca. Después de aplicarlo,
   **releerlo de ML** (también regla 6). "Aceptar no es haber hecho".
2. **Barrera $33.000:** abajo de ese precio el comprador paga el envío; arriba ML cobra el envío de Full (~$6.000) al vendedor.
   Se frena en $32.999/$32.990 **salvo que cruzar deje claramente más plata con el envío restado** (`!cruza`, ver CEREBRO §5).
3. **Techo duro $650.000** por publicación (03/10). Nunca arriba.
4. **25% de ganancia en el PEOR caso es el objetivo** (09/10: sin piso 22%; `cyc/mlconfig` minPct = targetPct = 25). Peor caso =
   ~2% de retención IIBB de otra provincia + el peor envío visto + cuotas → en el panel ~28%. Abajo del 25% **es pérdida** contra lo
   que se podía (18/10) y se acepta sólo con motivo dicho (`!piso`: sobra, stock antiguo, remate). **Nunca abajo de 0%** (sólo él lo
   abre, `!bajocero`). El % se mide **costo + impuestos + envío de Full en el divisor** (`pctGananciaVP`, un solo % en toda la app).
5. **Bajar un precio sólo con las reglas del CEREBRO** (y las salidas 🔐 sólo con su autorización, §5): sin línea de techo no se baja · escalera (≤15% por escalón) · descuento antes
   que bajar la lista · una suba no se deshace sin 95% · no abajo del 💰. Excepciones siempre las mismas cinco: precio mal puesto ·
   stock antiguo con fecha encima · ML la pausó por el precio · lo pide él · la última unidad.
6. **Releer de ML** cada cambio (precio, promo, estado, gemela) y comparar.
7. **Variantes: todas o ninguna.** Mandar la lista incompleta borra las que faltan. `setPriceTo`/`raisePriceTo` se niegan con variantes;
   se usa `raiseVariations` y se relee que estén TODAS. Cada variante es su publicación y se juzga sola (precio, stock y ventas de ESE color).
8. **Promos y descuentos** (08/10, reemplaza "sacar todas"): toda baja va primero como **descuento propio** (precio de lista tachado,
   PRICE_DISCOUNT, mín 5%, 14 días) o en una promo de ML que convenga; **nunca se sube la lista para inflar el tachado**. Cada promo
   pasa por 🤔 (sobra de verdad +90 d · no recién llegado 30+ d · 25%+ en el peor caso), aunque ML ponga plata. **El guardián de cada
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
  ficha y las vinculo con `vincular` (la ficha toma el nombre de la publicación de ML, 19/10; con variantes no). Producto sin ficha →
  `nuevoprod` (costo 0 si falta, y decirlo: se ve como todo ganancia).
- **Mis decisiones no vencen** (`SOLO_CLAUDE`): Pedidos, Armar caja y máximo de compra muestran sólo lo que decidí, con motivo; lo no
  decidido dice "sin decidir".
- **El robot de precios** escribe con `decido` (y `entrarpromo`, `tag`), que pasan por los frenos `frenosBajas` (F1-F8). **Toda regla
  nueva "nunca/siempre/sólo si" que se pueda medir va al código** como freno, y REEMPLAZA la de su tema en el CEREBRO.

### Las vueltas (tareas programadas que entran a esta sesión)
- **Completa a las 03:00** (`trig_01475PwdPVJ1qTnYswcDxRq8`, 21/10: *"a las 3am siempre, así no molesta"*): ventas de la noche, todas
  las listas de alarma, las activas con stock que NO vendieron (la mitad por noche), pedidos de todo el catálogo, cajas, juicios.
  Lecturas en una corrida, 2 ayudantes (max) y el revisor en contra (max). **Domingos:** además el catálogo entero, el ayudante de
  ideas a fondo y medir las gemelas (Premium y envío gratis; proponer sacar las que no sirven).
- **Cortas a las 11:52, 13:52, 15:52, 17:52, 19:52, 21:52, 23:52** (`trig_01FCaQqzU5MA422N6Z8nH63Z`, según cómo entran las ventas).
- **Auditoría del robot** (`trig_0138cyCgYeEHjqeayqiQPqWQ`, se reprograma sola con `run_once_at`; ver `AUDITORIA.md`).
- **Cada vuelta, en orden** (detalle en CEREBRO §1): leer `CEREBRO.md` + `notas/preguntas.md` → `ventasraras:nuevas` (sólo ventas
  posteriores a la última analizada; **cada venta se analiza UNA vez**) → **sólo las 🔬 A FONDO van a un ayudante con `effort:"max"`
  escrito en la llamada** (22/10, 2a: rara/abajo del 25%/sin costo · sin estrategia con techo · escasez · lanzamiento que vendió ·
  prueba de techo con 7+ días); las ✓ normales se cierran sin leer ficha → aplicar lo que propone el ayudante (si no le hago caso, lo
  digo en el 🧠) → `ventasvistas:<ts>|esf=<nivel real>|<MLA>=<qué pasó y qué resolví>|…;go` (deja en cada venta su análisis 🔬:
  gris si no cambió nada, color de la estrategia si cambió) → **al terminar, `bajastecho:1` y el detector `errores`, y deshacer en la
  misma vuelta toda ❌ del día** (22/10, 3a: vuelve al precio de antes con `!chico` y "EXCEPCIÓN: vuelve al precio de antes").
- Listas que tienen que quedar **vacías** al terminar la vuelta: 🚨 escasez que vendió después de mi decisión (`escasez`) · 🛡️ abajo
  del 25% en el peor caso · 📦 sobra sin decidir · 🔎 sin afinar · 📈 dice techo/escasez y no sube (todas en `planilla`).
- **Activar lo pausado es prioridad** (10/10): `pausadas:25` + `activarfull:go:25`; toda pausada con stock en Full que no se activa
  va al `pregunto:` con motivo. Lo nuevo (nunca estuvo en Full) lo activo yo con el precio ya puesto (peor caso).
- **Preguntas de compradores:** las contesto yo (`contesto:<id>=<respuesta>;…;go`), sólo las nuevas y sólo las que sé SIN DUDA.
  `responder` automático apagado (`responder:off`); la IA de preguntas necesita `ANTHROPIC_API_KEY` en GitHub (decisión suya, ver HISTORIA).
- **Cada vuelta busca algo nuevo para mejorar** (12/10, maximizar y bajar costos), sin repetir (`notas/ideas.md`); si no hay, no se inventa.
- Esfuerzo fijo (no se cambia sin que él lo diga): ayudantes de la completa, ideas y revisor en max; raros de las cortas en Alto;
  ventas en max. **El esfuerzo va escrito en cada llamada al ayudante**, nunca se hereda de la sesión.

### Telegram y avisos
- **A Telegram SÓLO `pregunto:<texto>`** (ml-sync; `//` = salto de línea, sin `;`, sin datos de compradores): (1) decisiones suyas,
  todas juntas, numeradas, (a)/(b) · (2) lo importante que sólo él puede hacer y cuesta plata (reclamo que espera su respuesta, ML frenó
  algo que vende, algo que vende fuerte en 0 en Full con mercadería en la oficina, costo faltante en algo que se vende). **Nunca**
  "subí/bajé/activé", ni resúmenes (`resumen:` no se manda), ni preguntas sin contestar, ni cajas "para la próxima". Sin nada, nada.
  `recordar:<texto>` para recordatorios que él pide. Avisos informativos del robot van con `sendAlerta(texto,{info:true})` (al log).
- **Cada venta nueva llega al TELÉFONO (push de la web), no a Telegram** (`AVISO_VENTA_TELEGRAM=false`): sólo compras que dejan
  **$10.000+** de ganancia (la compra ENTERA, sumando el carrito), no suena 00:30-10:00 (sale junto a las 10:00). Cada teléfono toca
  una vez "🔔 Activar aviso de cada venta". Llave privada VAPID en `mlapi/vapid` (nunca al repo).
- Chats nuevos del bot quedan `pendiente` hasta `tgaprobar:<últimos números>:go`.
- **Ventas vivas** (temblor y fuego en la tarjeta) se permiten desde **$10.000** de ganancia (`VIVA_GAN_TIEMBLA`, 15/10). Cada venta dice
  Clásica o Premium y en cuántas cuotas (`tipoPub`, `cuotas`, `cuotasSI`) y "envío gratis" si salió por una gemela de envío.

## 5 · PRECIOS (resumen; manda `ml-sync/CEREBRO.md`)

- **Quién manda** (CEREBRO §0): lo que pide él para ese producto → dato dudoso no se toca → frenos duros → nunca abajo de 0% →
  **sin línea de techo no se baja** → arriba del 💰 no se baja sin 95% → lo nuevo no se baja sin 🏔️ → no pagar stock antiguo → escasez
  sube → sobra baja en escalera → 25% peor caso → buscar techo en todo lo demás.
- **Sin línea de techo no se baja** (21/10; 22/10 decisión 1a): línea = 🔴 de las rayas o 🏔️ de `techo95`. Sin línea → 📈 buscar
  techo (subir). Lo que vendieron otras variantes o la familia NO alcanza. Pasados 15 días de la última suba sin certeza, decide la
  plata por día (F4).
- **🔐 Un aviso alcanza** (22/10, eligió las tres; CEREBRO §0c): **todos los caminos pasan por las mismas reglas** — `frenosBajas`
  (F0-F9) juzga `decido`, `entrarpromo` y la puerta de `setPriceTo` (toda otra baja); las subas pasan por `frenosSuba`; F9: en escasez
  nunca abajo del precio de antes de la escasez. **Las salidas que ya fallaron son SÓLO SUYAS:** `!sinlinea` `!sincerteza` `!sintecho`
  `!bajocero` y 🧨 `#remate` → sin su autorización no se hace: queda en `cyc/autoriza/<código>` y le llega UN mensaje numerado a su canal
  privado; él responde "autorizo K7M3" / "autorizo todo" / "no K7M3" (vale 48 h para ese renglón; `autoriza` lista lo autorizado).
  **Única salida mía sin él:** corregir el precio de lo que NUNCA estuvo activo ni vendió, al activarlo (`!activar` + "EXCEPCIÓN: …").
  **Detector `errores[:horas][:go]`** al final de cada vuelta (consulta): todo cambio y descuento de 26 h contra los errores que él ya
  marcó; la cuenta tiene que cerrar; con `:go` (ml-sync) deshace lo ❌ y le manda UN aviso. **Cada corrección nueva suya agrega su
  chequeo al detector (y su freno si se mide), en el mismo commit; una salida de excepción mal usada pasa a ser 🔐 suya.**
- **Techo con 95%** (`techo95`, nunca `#techook` a mano): las tres rayas de la línea de tiempo 🔴 techo (95%) · 💰 piso = el precio que
  más plata por día dejó (no se baja de ahí salvo sobra/stock antiguo/problema) · lo de en medio falta probar. Una sola cuenta en web
  (`_rayas`) y robot (`rayasPrecioLinea`). Sin piso medible, 💰 provisorio desde la primera venta. **Todo producto tiene que llegar a
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
- **Sin reposición (⏳)** — Nissei no lo tiene / no da / "no lo consigo": estirar el stock al precio más alto que lo vacíe en ~100 días,
  nunca pasar 120. Bs As pasa a "no se consigue" cuando Pedidos lo pide hace 10+ días sin entrar nada a la oficina, o con el botón
  🚫 "No lo consigo" (`cyc/noconsigo/<prod>[/v/<color>]`); se cae solo al entrar mercadería.
- **Sobra** (+90 d de stock al ritmo con stock o sin ventas en 60 d) → escalera/descuento; con sobra no se busca techo. Stock antiguo: 120 d
  lo chico, 60 lo grande (Tenders); apuntar a vender antes de ~100. Bajar porque seguir igual perdía más = el cerebro ganó; lo que falta
  para el 25% es error de origen (mandar/comprar de más).
- **Estrategias (tags)** — todo precio tiene una (19/10, **no existe 🎯 base**; `decido` rechaza un precio sin estrategia): 📈 `techo`
  buscando · 🏔️ `techook` encontrado (sólo vía techo95) · 🪜 `bajando` · ↘️ `volviendo` al normal · ↗️ `desobra` · 🔥 `escasez` ·
  ⏳ `sinrepo` · 📦 `sobra` · 🏷️ `promo` (ML pone) · 💸 `descuento` (sólo nosotros) · 🆕 `lanzamiento` · 💰 `punto` · 💳 `gemela` · 🧨 `remate`
  (sólo si lo pide él) · `liquidando` · 🛡️ excepción (`!piso`, `cyc/claudepiso`). ⚪ sin estrategia (decidir) · ⏸️ sin stock. "Volviendo"
  dura 7 días, después entra a 🔎. Cada chip dice "· de X". Cada venta muestra la estrategia que tenía (`cyc/estrategia/<MLA>/<ts>`).
- **Lanzamiento (🆕)** (20/10): lo nuevo arranca ~20% arriba del precio correcto; baja recién con 🏔️ al 95% (visitas × conversión) y
  cada escalón como descuento propio con el de lanzamiento tachado. **Nunca bajar algo que vende sólo para medir** (la prueba del tachado
  3b se canceló).
- **Precio para el peor caso** al poner o activar (12/10). Lo que vende rápido abajo del 25% con poco stock se sube en la misma vuelta.
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
- **💳 Gemelas** (CEREBRO §11): toda Clásica activa con stock en Full lleva su Premium en la MISMA publicación de ML al precio de igual
  plata neta (`precioGemelaIgual`; `gemela`, `gemelacrea:<MLA>=<precio>:go`). **📦 Gemela Clásica con envío gratis** (22/10) para lo
  de abajo de $33.000 (`gemelaenvio`, `gemelaenviocrea`; `gemelaTipo:'envio'`; no se crea si queda abajo del 25%). Las dos se alinean
  solas cada hora a su Clásica (`gemelaSigue=off` apaga). Caja perdida por cuotas = candidata a gemela, no a bajar.
- **Terminaciones 90/990** (99 en lo muy barato). La regla de no cruzar números redondos se SACÓ (medido 13/10).
- 🪜 Arriba de $15.000 hay ~15% de zona muerta de comisión: suba que cae ahí se frena salvo `!escalon`. La comisión de ML tiene cargo
  fijo ~$1.230 por venta: abajo de ~$4.000 se come el producto. Packs NO (*"al estar en pack las saco de competencia"*).
- **Fechas:** calendario y eventos de ML en el `informe` (secciones 14/14b), `fechas`, `eventos`. El ×1,4 de regalables NO está
  confirmado. **Navidad: a mediados de noviembre se pide para 45 días** (recordatorio 14/11).
- **El precio sugerido de ML** (`sugP`) es referencia, nunca motivo para bajar algo que vende.
- **Liquidando** (`liquidando:<MLA>[:go]`, `cyc/nosubir`) frena sólo subas; se cae sola en stock 0; marcar uno no contagia a otros
  colores salvo hermana de precio (`esHermanaPrecio`). Bajar a un precio exacto que pide él: `unapub:<MLA>:<piso>:<días>:bajar=<precio>[:go]`.
- **🩺 La ficha médica** (`mlapi/ficha/<MLA>`, comando `ficha:<MLA>`): línea de tiempo + mis cambios con resultado + tramos + notas
  (`mlapi/fichanotas`) + cómo reacciona (gana/pierde caja, visitas, al subir/bajar, fechas, tachado vs liso) + más datos. **Se abre
  antes de decidir.** "📋 Ficha completa" en el 🧠 de la web. Línea de tiempo diaria: `mlapi/linea/<MLA>/<AAAA_MM_DD>` (fuera de `cyc/`).
- **Juicio de resultados** (10/10): `supervisor:medir:go` en la completa + `juzgo:<id>=<gano|perdio|igual|espera|nocuenta>|<texto>`
  (sin reglas a ciegas: pensar). En Métricas sólo lo confirmado (7+ días) va verde/rojo. No suma la inflación como mérito (25/09).

## 6 · PEDIDOS Y CAJAS

- **Pedidos completos, todo el catálogo** (09/10): `pedidostodo` (ml-consulta) → `python3 ml-sync/notas/decide_pedidos.py <log> <salida>`
  (objetivo **30 días**: ritmo de 30 d, de 60 d o de 180 d si está agotado; menos Full + oficina + camino + viajando; sin ganancia = 0;
  ritmo normal si hubo remate o prueba) → revisar a mano → `notas/pedidos.txt` → `decido:archivo=pedidos;go`. En la completa.
  Lo de la oficina o viajando a Full cubre lo decidido.
- Por color: un color agotado hace 30+ d pide con su ritmo viejo ("ritmo viejo"). Pedido a mano ya no existe (lo arma el panel/yo).
- **Bs As:** el padre compra en persona (~1 semana, plata ~$3M, lugar en la Kangoo). Solapas 🏬 De siempre / 📋 Dai Nippon
  (`pedCambiarGrupo`). Rojo de Pedidos = 14 días o menos (se corta sí o sí).
- **"Pausar por precio" se sacó entero** (01/10): no volver a proponerlo; si no da, no se compra. `pedremate` decidido (b): se deja; él
  manda a la papelera lo que no quiere. **No volver a proponer cortar el ritmo viejo.**
- **Cajas a Full:** cubren **37 días** (30 + 7 de viaje); **60 si vende parejo** y no tiene prueba de precio abierta
  (`notas/sin_estirar.txt`); **tope 90 días**; nuevo sin ventas recibe 4 (`PISO_CERO`). `decide_cajas.py` → `decido:caja:<id>@<cuenta>[#color]=u|N|motivo`.
  Una cuenta sin publicación no recibe el mínimo si otra tiene stock de ese color en Full. Caja 70×70×70, 30 kg; costo de mandar una
  caja `cyc/mlconfig/costoCaja` ($17.500, `cajacosto`).
- **Cupo de Full por cuenta** (ML no lo da por API): lo carga él con `cupo:<cuenta>=<chicos>/<grandes>`; "grande" = sólo los Tenders
  (`cupoGrandes`). Lo vendido NO devuelve cupo (18/10). Avisa, no frena. **Cupo lleno → vender lo lento** (descuento/escalera), retirar
  sólo si él lo pide (21/10).
- **Código de etiqueta de Full** (`inventory_id`, `cyc/mllinks/<MLA>/inv`): se muestra en Armar caja por cuenta y color; **nunca se
  adivina** (sin color en el título → `fijarvar:<MLA>=<color>:go`). No es el MLA.
- **Cajas llegadas:** el robot anota lo entrado (`cyc/cajasentrado`) y lista las que ML da por entradas; **las marco yo** con
  `cajallego:<seg>[;…][!<palabras>=<u>]:go` (faltante real confirmado) o `abrircaja`. Lo de la oficina no es reposición hasta despachar.
- **Mercadería en tres lugares:** oficina (`ofi`), en camino a Full (`cyc/envios_full/<id>/cajasDet`), en ML. Lo en camino cuenta como
  stock y patrimonio. Despachar es neutro. Cerrar caja exige seguimiento.
- **Métricas → de dónde viene la mercadería:** Bs As · Paraguay · Paulvic · 📋 Listas, ordenado por ⚡ score promedio por color (20/10).
- **Pedidos hechos tienen número de 4 cifras** (#1001…, `num`) en Paraguay, Paulvic y Listas: "el pedido 1003" → buscar por `num` en
  `cyc/compraspy`, `cyc/pedidospv`, `cyc/compraslista`.
- 📋 Copiar pedido en tarjetas con variantes (para WhatsApp).

## 7 · PARAGUAY · LISTAS · PAULVIC

### Paraguay (detalle en `PROMPT_GUAY.md`, CEREBRO §16)
- **Nissei por comprasparaguay.com.ar, NUNCA nissei.com** (02/10): precio (US$) y código salen de la fila de Nissei. comprasparaguay
  bloquea al robot (Cloudflare): lo copia el chat de compras, que hay que pegarle `PROMPT_GUAY.md` ENTERO.
- **Catálogo entero en `mlapi/pycat`** (15/10): el chat copia (`pycat:#<pág>@<orden>;…;go`, ml-consulta) y el robot (`ml-pycat`, cada 3 h)
  mide contra ML. Se guarda TODO (no se borra lo de menos de 15%). Para probar: **25%+ y catálogo de ML con 2+ vendedores** (20/10,
  reemplaza las 100 ventas; sin catálogo exacto afuera; las vendidas del catálogo no se buscan más) **y confirmado que es el mismo
  producto** (✅ o `revcand` ok de ESE catálogo; sin las DOS fotos no va). Sin catálogo se rebusca a los 60 d, sin vendedores a los 30.
- **Dos proveedores:** 🟢 Nissei (dos pedidos del momento: 🌸 Perfumería `pyb<fecha>` y 📦 Resto `py<fecha>`; en `compray` `|perf`/`|resto`)
  y 🟣 **Elegancia** (catálogo "Atacado", `pyel<fecha>`, `candalta:prov=elegancia;…`). Mismos costos.
- **Recargo** = el MEDIDO de los pedidos (`paramcompra`; 22,7% al 17/10), respaldo 20%. El panel lo suma; el chat carga el precio CRUDO.
  Pedido tiene un costo fijo (retira ~$74.000 + transferencia + correo por kilo): conviene llenarlo. **Adelanto de plata** es ocasional
  (`compray:<fecha>|adelanto=<pesos>|go`, renglón aparte del cambista).
- **El precio de Paraguay NO pisa el costo. Nunca** (17/09): `costUSD` = lo que PAGÓ; `nisseiUSD` = lo que saldría reponer. Al cambiar
  un costo, el viejo se congela por mes (`precios_hist_prod`).
- **Ticket real obligatorio para cerrar el pedido** (10/10): `compray:<fecha>|det=<código>*<u>*<pagado>;…|go` (ml-sync). Datos del
  mayorista: no al repo. Con dos tipos el mismo día pide `|repo`/`|nuevos`.
- **Cuántas de cada nuevo** (`candMaxU`, 21/10): barato ≤US$15 → 3 · caro >US$60 → 1 · resto 2.
- **Al chat local se le pasa SÓLO lo que interesa** (22/10, *"siempre pasame el promt con la mercaderia que si interesa"*): el texto
  listo para pegar y la lista YA FILTRADA a lo que puede entrar a un pedido (25%+ y en catálogo), no la lista entera; el resto se dice
  con números (cuántos y por qué no) y se ofrece aparte. Los archivos van por SendUserFile desde el scratchpad, nunca al repo. Primer
  caso: `faltaventas:todas` → 183 de 7.392 (PROMPT_VENTAS_LISTAS).
- Pasos por comando: `pyped:repo:<palabra>=<u>;…|nuevos|llego:<id>;go` · `pedir:<palabra>=<u>;…;go` · `compray` · `pyprecio` · `candprecio` ·
  `candalta` · `pyvisto` · `pyconocidos` · `marcano:<marca>` (prohibida: **Dolce & Gabbana**). Celulares viajan con el padre (`celuviaje`).
  Nada de envío internacional. Tarjetas de memoria: ya no hay truchas (20/10), se tratan como cualquier producto.
- **Reglas de categorías del chat de compras** (aprobadas 03/10; vivían sólo en una PC, van en el `PROMPT GUAY`): antes de mirar ML,
  afuera precio crudo > US$215, lo que ya está en el panel y Dolce & Gabbana. **No se miran:** celular, notebook, tablet, cámaras
  (monitoreo/DVR, digital, filmadora, auto, infantil, marcha atrás), placa madre, placa de video, monitor, impresora, TV, computadora,
  servidor; lo grande (gabinete, silla y escritorio gamer, UPS, robot de limpieza, aire, heladera, lavarropas, microondas, horno y cocina
  eléctrica, hidrolavadora, monopatín, scooter, bici y moto eléctrica, sillas y mesas, valijas, musculación, cortadora robot, caja fuerte);
  termos y térmicos (hasta que él decida). **Sí:** aspiradoras, drones (≤US$215), consumibles. **Maquillaje todo adentro con tono EXACTO**
  (marca + línea + tono + versión + tamaño; sin el tono en ML → afuera), pero sólo entra al pedido si da 25%. Resto: mismo modelo, color,
  capacidad y voltaje (110V afuera), nada de packs distintos. Misma marca ≠ mismo producto (Cabotine 30 vs 100, Animale For Men vs Black).
- Al llegar: `pyped:llego` crea las fichas (costo pagado × recargo) y recuerda contar la oficina (`ofi`); elegir cuenta según rubro.

### Listas de otros proveedores (📋 Listas = otro Paraguay, sólo para ML; `PROMPT_LISTAS.md`, CEREBRO §17)
- `lista:<prov>[|fecha=AAAA-MM-DD];<producto>=<pesos>[@<cód>];…;go`. **Nunca cargar una lista vieja** (18/10; el comando frena si la fecha
  es anterior a `cyc/mlconfig/listasProv/<prov>/fecha`). **Preguntar si el precio es el que se paga o lista con descuento** y cargar el
  NETO (Iscos: "P. Lista" con −30%/−33,5%, `listadto`).
- **Iscos: sólo lo que está en su web** y el precio de la web × **0,665** (19/10, `listaweb:iscos;go`, `noWeb`).
- **Dai Nippon** (Bs As, lo trae Tito): **desde el 21/10 tiene casilla, 🧾 Pedido con mensaje de WhatsApp, Ya lo pedí y Llegó** como las otras.
- Mismas reglas que Paraguay: 25% + catálogo 2+ vendedores + **confirmado por mí** (`listarevisar` → `listadato:<prov>;<cód>=ok|no|mi=MLA…;go`,
  con duda no se toca). El robot mide lista por lista y anota la vuelta completa (`cyc/mlconfig/vueltas`). Todo se mide contra ML (también lo de Bs As).
- Fechas al 19/10: Dai Nippon L1309 19/10 · Unilever 08/10 · Iscos 01/10 · Cadam 26/09 · Qsoft 23/09 · Godrej 01/08 (Wels también).

### Paulvic (perfumes, proveedor de Bs As; CEREBRO §18)
- **Costo = el del último pedido** (17/10): (pagado + flete) ÷ (llegadas + testers + regalos perfume); testers y regalos se venden al costo
  (`pvped:costo:<id>;apagar=;flete=;tester=;regalo=;go`; también `llego` y `pago`). Tarjeta por pedido (`pvPedidoTarjeta`).
- **7 días hábiles para pagar desde que llega, si no +10%** (20/10): avisarle al llegar los días que le quedan.
- **Lo que se pide y no viene no se pide más** (`cyc/noconsigo/<prod>/nunca/<aroma>`, `pvped:nunca:-<aroma>;go` lo saca).
- Cada aroma es su publicación y se juzga solo (grupo de precio desactivado 04/09). Compartido Adriana + Persea en Luciana.

## 8 · PLATA, GASTOS Y ARQUEO

- **El Arqueo está en DÓLARES** (en chico los pesos al lado). Antes de escribir en un campo que existe, preguntar en qué unidad lo lee.
- **El saldo de MP no se lee por API** (~30 puertas medidas). El disponible: él lo dice y lo cargo con `ancla:<cuenta>=<pesos>;go`; `dispo`
  suma/resta desde ahí (una vez por mes recargarlo; `dispo` NO avisa por Telegram, decisión 30/09). "A liquidar en ML" y la agenda de
  liberaciones salen solos de `saldoml` (reporte de liquidación, ml-daily). El extracto de cuenta se baja a mano y **trae nombres de
  terceros: nunca al repo ni a un log**.
- **Gastos:** la lista de Gastos del mes dice qué falta (`GASTOS_DEL_MES`, ❌/⚠️/✅, "este mes no va" por mes). Cargar con
  `cargargasto:<fecha>|<monto>|<cat>|<desc>[|…][|go]`. Cargos de Full del mes: `cargosmes[:<AAAA_MM>][:go]` (en la completa del 15; el
  período de ML va al mes siguiente) — sólo almacenamiento/stock antiguo/retiro/multas (~$130.000/mes), las percepciones ya están en
  `ML_EXTRA_PCT`. Recordárselo a fin de mes. Retiro y gastos se cargan enteros cuando se pagan (no se reparten por día).
- Percepciones IIBB medidas por cuenta en `ML_EXTRA_PCT` (Adriana 3,80 · Luciana 4,01 · Ayelen 5,99 · Matías 3,40).
- Los reclamos que "cubre" ML SÍ nos cuestan (0 de 70 dejaron la plata, 15/10): no volver a proponerlo.

## 9 · REVISIONES POR ETAPAS Y EL CARTEL

- **Todo cambio o cosa nueva se anota en `ml-sync/REVISION.md` en su etapa, EN EL MISMO COMMIT** (qué es · dónde vive · qué chequear).
  Si no entra en ninguna, etapa nueva ahí y en `REV_ETAPAS` (`index.html`).
- **8 etapas:** 1 Precios · 2 Plata · 3 Mercadería · 4 Choques y fallas mudas · 5 Datos, historial y cerebro · 6 Ideas nuevas · 7 Diseño ·
  8 Reglas del cerebro (cada 7 días, adelante cuando le toca). Cada madrugada a las **04:00** toca la que hace más que no se revisa
  (`REV_HIST`/`REV_HECHAS`; nunca una de los últimos 6 días). 4 revisores con esfuerzo **máximo**. Tarea `trig_01TT94wnEKk299d85Sj6ePWw`:
  **PAUSADA el 21/10**; la prende el aviso `trig_01Qaa6pmF3sjmNfyHG5LMLgg` el vie 23/10 22:00 de acá (primera revisión sáb 24/10 04:00).
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
  raíz (tokens, Telegram, línea de tiempo, fichas, pycat: cosas grandes FUERA de `cyc/` porque la web lee `cyc` entero). Reglas de la base:
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
| `techo95[;go]` · `bajastecho[:días]` · `escasez` · `planilla` · `raros` | techo al 95% · bajas sin techo (❌) · escasez 🚨 · listas 🛡️📦🔎📈 · raros contra su año |
| `pausadas:25` · `activarfull:go:25` | pausadas con stock en Full y por qué · activar las que dan |
| `contesto:<id>=<respuesta>;…;go` | contestar preguntas seguras |
| `pregunto:<texto>` · `recordar:<texto>` | Telegram al canal privado |
| `pedidostodo` · `cajasnotas`/`pedidosnotas` · `porquepedido:<palabra>` · `porquebajo:<palabras>` | pedidos de todo el catálogo · números · por qué |
| `pyped:…;go` · `pedir:<palabra>=<u>;…;go` · `compray:<fecha>\|…\|go` · `ofi:<palabra>[@var]=<+N\|-N\|N>;…;go` | Paraguay, unidades, pesos del pedido, oficina |
| `cajallego:<seg>[;…][!<palabras>=<u>]:go` · `abrircaja:<seg>:go` · `cajasllegaron` · `faltaron[:días]` | cajas a Full |
| `lista:<prov>;…;go` · `listarevisar` · `listadato:…;go` · `listaweb:<prov>;go` | listas de proveedores |
| `pvped:<acción>:<id>;…;go` | Paulvic (llego, pago, costo, nunca) |
| `vincular:<MLA>=<ficha>:go` · `nuevoprod:<nombre>\|costo=\|mla=\|go` · `fijarvar:<MLA>=<var>[@ficha]\|go` · `buscarpub:<texto>` · `huerfanos` | fichas y vínculos |
| `unapub:<MLA o palabra>` · `hermanas:<palabra>` · `bajopiso` · `submargen` | todo sobre una publicación · hermanas · márgenes |
| `poncosto:<id>\|<pesos>\|go` · `ponenvio` · `cajacosto` · `costohist` | costos |
| `supervisor:medir:go` · `juzgo:<id>=…` / `juzgo:archivo=juicios_precio;go` | juicio de resultados |
| `gemela` · `gemelacrea:<MLA>=<precio>:go` · `gemelaenvio` · `gemelaenviocrea` · `gemelaalinear` | gemelas Premium y envío gratis |
| `cupo` · `codigos[:palabra]` · `pasara`/`nomandar:<cuenta>:<palabras>[:go]` | cupo de Full, códigos de etiqueta, reparto por cuenta |
| `ancla:<cuenta>=<pesos>;go` · `dispo` · `saldoml` · `cargargasto` · `vergastos[:mes]` · `cargosmes` · `cobromes` · `factarca` · `catmono` · `facarca` · `topeh` | plata y ARCA |
| `cerebro`/`analizapromo:<días>:<palabras>` · `eventos` · `fechas` · `vistas` · `ventashora` | promos, fechas, mediciones |
| `chequeo[:días]` · `alertas[:horas]` · `reglas` · `permisos` · `probarput:<MLA>` | chequeo, avisos, base, permisos de ML |
| `tgaprobar:<núm>:go` · `tgchats` · `webpush` | Telegram y push |
| `liquidando[:<MLA>][:go]` · `nomas:<MLA>:go` · `pausar:<busca>[!saca][:go]` | marcas sobre publicaciones |

Si dudás si un comando existe, buscá en `sync.mjs` (`grep -n "'<nombre>'" ml-sync/sync.mjs`) antes de escribir uno nuevo.

## 13 · PENDIENTES ABIERTOS (al 22/10/2026; borrar al cerrarse)

- **Revisiones por etapas:** vuelven solas el sáb 24/10 04:00 (ver §9). Cuando el cartel quede sin pendientes, recordarle la revisión
  completa al final si la pide.
- **Los 22 ❌ de antes del detector** (corrida del 22/10, 72 h) siguen puestos y NO se deshacen solos: los decide la vuelta de a uno,
  con nota si se quedan (algunos a propósito: WD, microSD, Adyan). Entre ellos el Pendrive 8gb a $23.990.
- **Mediciones agendadas (CEREBRO §22):** 27/10 `techo95` de los 5 lanzamientos (Halloween Man, Ferrari Rojo, Adyan Oud, microSD Pokémon,
  WD 480) · 28/10 `vistas` sobre las 12 que pasaron de descuento a liso (tachado vs liso, 3a) · 02/11 promos en el CyberMonday ·
  **14/11 pedido de Navidad para 45 días**.
- **Medir 6.A1** (21/10): `publicar` sin go en la próxima llegada (avisarle antes de crear) · `ficha:<MLA>` sin go (línea RAYAS) ·
  `altanuevas`/`pausadas`. `cargosmes:auto` corre solo el 01/11. (ver HISTORIA, "62 DECISIONES")
- **Paulvic:** juzgar la prueba de $21.990 (si perdió, volver a $14.950; si ganó, extender primero Persea) y la idea de un Paulvic de
  hombre a ~$17.990. Pedido del 06/10 llegó y se pagó (ver HISTORIA). Blush sin publicación en ML.
- **Iscos del 19/10:** se publica en ML (lo hace él); al llegar fichas con costo web × 0,665 y el precio lo decido yo (peor caso). Los dos
  Nina 50 ml pueden no venir. Se esperan ~5-10%: si no deja ni el costo, avisarle.
- **Paraguay:** cuentas de correo (monto y kilos) del pedido del 08/10 y datos del 08/09; transferencia de $50.000 del 29/09 (preguntar).
  Evaluar el 17% de recargo con los gastos del próximo pedido (ya se usa el medido). Cargar los ~13.467 códigos de `pycat` si quedó a medias
  (el chat de compras no tenía GitHub). Pasada del mes de Guay: no se le manda nada hasta que él pida "hagamos la de guay".
- **Dos Linternas COB** de Ayelen (`MLA3998033920`, `MLA2128209177`) sin ficha: falta el costo real. **EX15LP blanco y Sennheiser** → Ayelen
  sin publicación todavía. **Piedra Gua Sha** (ficha sola) y Kit Jade vinculados.
- **Contador:** recategorización, actividad, facturas entre cuentas, intereses de H. Bajar de ARCA los Emitidos 01/01→04/08 si falta alguno.
- **Sancor:** esperar respuesta (plan F800/40% $111.988,7: qué es el 40%, si es el final con cuota social e IIBB, qué cubre menos); pagar antes
  del 21; dar de baja "Vida Plus" ($2.901/mes). Hijo de Ayelen tiene OSECAC (plan de 1 persona está bien).
- **Almacenamiento:** falta que él pase `almactarifa:<chico>/<grande>:go` para medir lo que ahorra el remate.
- **Puntaje del mes rehecho (26/09):** falta que diga si el objetivo le cierra.
- **IA de preguntas:** falta la clave `ANTHROPIC_API_KEY` (decisión suya).
- **Filtro de envíos internacionales** en candidatos: el campo existe (`international_delivery_mode`); escribirlo cuando aparezca uno.
- **`anotarNetoWeb` no se llama desde ningún lado** (el margen sólo se recalcula de noche): o se enchufa o se borra. (ver HISTORIA)
- **`enProceso`** (lo recibido-procesando en Full) no lo cuenta nadie al marcar una caja: hoy vale ~0, se mira si aparece una caja grande
  en revisión (`internal_process` en el stock actual).
- **Una foto de precios tomada dos veces por mañana** marcó "1 cambio a mano" (sin nombre): mirar.
