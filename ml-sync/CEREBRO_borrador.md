# 🧠 CEREBRO · ORDENADO (BORRADOR del 20/10/2026, eligió 3a · todavía NO reemplaza a CEREBRO.md)

Lo mismo que `CEREBRO.md`, sin perder ninguna regla, pero ordenado: primero QUIÉN MANDA cuando dos reglas chocan, después
QUÉ SE CORRE en cada vuelta, después las reglas por tema. La historia de cada regla (fecha, frase suya, el caso que la
originó) queda en `CLAUDE.md`. **Cada vuelta arranca leyendo este archivo y `notas/preguntas.md`.** Regla nueva → va en su
tema acá, en `CLAUDE.md` (historia) y en `REVISION.md` (su etapa), en el mismo commit.

---------------------------------------------------------------------------------------------------------------------------
## 0 · QUIÉN MANDA (cuando dos reglas dicen cosas distintas, gana la de más arriba)

| # | qué | por qué está acá |
|---|---|---|
| 1 | **Lo que pide él para ESE producto** (un precio, rematar, "no lo vendemos más", "no lo consigo") | es su decisión; se anota en el 🧠 que vino de él |
| 2 | **Dato dudoso → no se toca el precio esa vuelta** (sección ⚠️ de `raros`) | una buena decisión sobre un dato malo es una mala decisión |
| 3 | **Frenos que no se discuten:** ML la tiene frenada (no se toca) · variantes todas o ninguna · techo $650.000 · releer de ML después de cambiar | si se rompen, ML borra variantes o pausa |
| 4 | **Nunca abajo de 0%** (sólo él lo abre: `!bajocero`) | vender perdiendo por decisión propia no |
| 5 | **No llegar a pagar stock antiguo** (vender antes de que ML cobre: 120 d lo chico, 60 lo grande; apuntar a ~100) | es plata que se va sin vender nada |
| 6 | **Escasez: se sube** para que dure hasta que vuelva a haber (y "escasez" siempre = precio que sube) | lo que no se vende ahora se vende después; quedarse corto pierde |
| 7 | **Sobra: se baja en escalera, primero como descuento** | plata parada y riesgo de stock antiguo |
| 8 | **Objetivo 25% en el PEOR caso** (🛡️) | lo que el negocio necesita; abajo sólo por 4-7, dicho en el 🧠 y contado como pérdida contra el 25% |
| 9 | **Buscar el techo** en todo lo demás | subir es casi gratis, no subir es caro |
| 10 | **Formas:** bajar siempre en escalera · descuento antes que bajar lista · 90/990 · barrera $33.000 salvo que cruzar deje más · una suba no se deshace por casualidad (Poisson, 7 d en lo que se compra de a muchos) | cómo se hace, no qué se hace |

**Choques conocidos y cómo se resuelven:**
- *25% vs stock antiguo* → gana 5: se baja abajo del 25% para que salga a tiempo. El 🧠 lo dice y la pérdida contra el 25% se anota al error de origen (mandar/comprar de más), no al precio. El cerebro se juzga contra NO hacer nada.
- *Escasez vs techo conocido* → gana 6, pero no con ×3/×4: con el precio que pienso (ya se sabe que más arriba no rinde).
- *Escasez vs sobra en el mismo producto* (poco en Full, mucho en la oficina) → no es escasez: es mandar la caja (el tag dice "🚚 cubierto").
- *Buscar techo vs sobra* → con sobrestock no se busca techo: primero sale lo que sobra.
- *Descuento vigente vs suba de lista* → primero se sale del descuento (`entrarpromo:…=salir`), nunca inflar el tachado.
- *Bajar en escalera vs urgencia* → excepciones a la escalera: precio mal puesto · stock antiguo con fecha encima · ML pausó por el precio · lo pide él · la última unidad.
- *Una regla dice A y la otra B y ninguna tabla lo resuelve* → no se hace nada esa vuelta, se anota el choque y va al `pregunto:` con (a)/(b). Después se agrega la fila acá.

---------------------------------------------------------------------------------------------------------------------------
## 1 · CADA VUELTA, EN ESTE ORDEN

**Cortas (10:52, 12:52, 14:52, 16:52, 18:52, 20:52):**
1. Leer este archivo y `notas/preguntas.md`.
2. Lecturas juntas en UNA ml-consulta (uno por renglón): `planilla` · `escasez` · `raros` · `lupa` · `ventasraras:5` · `pausadas:25` · `analizapromo:7`.
3. **Listas que tienen que quedar VACÍAS al terminar:** 🛡️ abajo del 25% peor caso · 🚨 escasez que vendió después de mi decisión · 📈 dice techo/escasez y no sube · 🧭 fuera de lo normal · 🔀 no cierra. Cada renglón: decisión o nota con motivo.
4. ⚠️ dato dudoso: no tocar precio; anotar.
5. Cada venta nueva contra su ficha (¿confirma o desmiente la prueba? ¿se aceleró ⚡? ¿la dejó en escasez?). Escasez nueva se trata en ESTA vuelta (precio + caja si hay oficina).
6. Activar pausadas con stock en Full (`activarfull:go:25`); lo que no se activa va al `pregunto:`.
7. Preguntas de compradores que sé sin duda (`contesto:`). Promos mías que vencen en 2 días.
8. Escrituras juntas en UNA ml-sync. En el chat: "🚨 N → N · 🧭 N → N · 🔀 N → N · ventas N miradas · ideas …".

**Completa (08:52), además de todo lo anterior:**
1. `historia` · `escasez:expediente` · `informe:24` · `ficha:cuenta=<c>` ×4 · `pedidostodo` · `techo95` · `techofreno` · `supervisor:medir:go` · `analizapromo` entero.
2. **Cuatro ayudantes (uno por cuenta, esfuerzo max)** juzgan cada publicación con su ficha entera y le hacen las preguntas de `notas/preguntas.md`. **Un quinto** busca ideas nuevas en el negocio entero.
3. **Un sexto, EL REVISOR EN CONTRA (1b, 20/10):** con todas las decisiones propuestas ya juntas, ANTES de aplicar, lee la ficha de cada publicación que cambia y busca en qué me equivoco (dato que no cierra, regla de la tabla 0 que pisé, pregunta sin contestar, choque con una decisión de menos de 7 días). No propone precios: marca. Lo que marca lo miro yo; si no lo puedo resolver, no se aplica esa vuelta.
4. Listas de la completa que se vacían: 📦 sobra sin decidir · 🔎 sin afinar · 💸 stock antiguo SIN DECIDIR · ⚠️ no vendió y no sé desde cuándo · 🔁 subas cuya razón cambió.
5. Pedidos (`decide_pedidos.py`) Y cajas (`decide_cajas.py`) sobre el mismo log, revisados, `decido:archivo=pedidos;go` + `cajas`.
6. Juicios de precio (`juzgo:`), techo95 `;go`, frenos de techo a reabrir.
7. El porqué de cada publicación juzgada queda en su nota del 🧠 con QUÉ MIRAR MAÑANA.
8. Los lunes: contar `notas/correcciones.md` de la semana contra la anterior.

---------------------------------------------------------------------------------------------------------------------------
## 2 · QUIÉN HACE QUÉ
- El robot SÓLO junta datos. Yo decido todo. Él no marca nada a mano: me lo dice y lo hago por comando.
- Nunca tomar como dato una marca vieja del robot (escalera, liquidando automático, expediente). Dato crudo.
- Él no toca precios ni promos; no hace falta que avise.
- Lo grande o sin respuesta clara lo decide él: todo junto, numerado, (a) sugerida y (b).
- Varios comandos en una corrida: lecturas en una ml-consulta, escrituras en una ml-sync, uno por renglón.

## 3 · PENSAR, NO SÓLO SEGUIR REGLAS
- **🧐 ¿Tiene sentido?** Antes de usar un número, cruzarlo: otro tamaño, otra cuenta, otra fecha, parecidos del rubro, el costo, cuántos lo venden. Si no cierra, no se usa y se dice por qué.
- **Las preguntas de `notas/preguntas.md`** a cada publicación; la 20 ("¿qué me preguntaría él?") siempre.
- **El expediente es pensado, no mecánico:** por bloque, ¿lo de hoy sigue teniendo sentido? ¿qué cambió? ¿hay algo raro que ninguna regla nombra? Si no cambió nada, una línea; el pensamiento largo va donde algo se movió.
- **Toda decisión tiene su salida:** al crear algo que cambia un precio o un pedido, escribir qué lo deshace y dónde se mira.
- **Cada vuelta busca algo nuevo** (ideas medidas con plata y casos, en `notas/ideas.md`). En el chat nunca callado.
- **Correcciones:** cada una a `notas/correcciones.md` y su pregunta a `notas/preguntas.md`.

## 4 · CÓMO SE ESCRIBE CADA DECISIÓN
- Todo precio lleva estrategia (`#tag`); no existe "base". Sin estrategia = ⚪ para decidir; sin stock = ⏸️.
- Tags: 🔥 escasez · ⏳ sinrepo · 📈 techo · 🏔️ techook (sólo vía `techo95`, 95%) · 🪜 bajando · ↘️ volviendo · ↗️ desobra · 📦 sobra · 💸 descuento (sólo nosotros) · 🏷️ promo (ML pone plata) · 🔒 liquidando · 🧨 remate (sólo él) · 🛡️ excepcion · 🆕 nuevo/lanzamiento · 🎁 fecha · caja.
- La nota en 4 partes: QUÉ HICE (de $X a $Y) · POR QUÉ (estrategia + dato) · QUÉ ESPERO VER (números) · SI NO PASA (días y qué hago). Si no se toca: HOY NO LO TOCO PORQUE … Sin `;`, sin repetir oraciones, una por variante.
- `decido` mide el peor caso, rechaza saltos de más del doble sin `!salto`, rechaza precio sin estrategia.

## 5 · PRECIOS
**Objetivo y peor caso:** 25% con retención de otra provincia 2% + el peor envío visto + cuotas (≈28% en el número normal). Paso 🛡️ de todas las vueltas: subir de una al precio del 25% peor caso, o `!piso` con motivo. Lo barato (hasta ~$5.500): cada unidad deja ~$1.000+. Nunca abajo de 0%.
**Cada variante sola:** su precio, stock, ventas y caja. Nunca el promedio. El % del producto vendido SOLO (carritos no cuentan).
**Plata por día neta:** − $100 por unidad (trabajo) − 3% de lo facturado (tope de H) − 2%/mes del costo del stock parado. A igual plata neta, gana el precio alto.
**Techo:** todo lo que vende sin techo conocido, todas juntas, directo al precio que pienso (ML deja +100%). Juicio por certeza (Poisson: 3 esperadas y 0 = 5% · 6 y 0-1 = 2% · 10 y ≤2 = 0,3%), nunca un solo día, máximo 30 días. Cada escalón se mide antes del siguiente. Si sale mal, se baja en escalera (~10-15%, nunca abajo del último que vendía). Visitas a la mitad + caja cambiada → se vuelve en esa vuelta (con hermana de control). Fuera de escasez, saltos de +30 a +50%.
**Las tres rayas:** 🔴 techo (95%) · 💰 piso = el precio que más plata por día dejó (5+ días con stock; no se baja salvo sobra, stock antiguo u otro problema dicho) · lo de en medio es lo que falta probar. Si falta el 🔴, la estrategia es buscar techo.
**Techo encontrado:** sólo con `techo95` (95%). Freno de techo con foto del mercado (`techofreno`): se reabre si el más barato ajeno sube 8%+, ya no hay ajenos abajo, ganamos la caja o pasan 30 días.
**Escasez = se corta antes de que vuelva a haber** (caja despachada ~8 d · oficina ~10 d · Paraguay ~16-17 d · Bs As ~1 semana + caja salvo que Pedidos lo pida hace 10+ días sin que entre nada · sin reposición = sin fecha). Se mide con el ritmo NORMAL (no el de después de una suba) y con el de 7 días si se aceleró (⚡). Primer salto por ritmo de ESA publicación: 3+/día ×4 · 1-3 ×3 · <1 ×2 · <1 cada 2 días ×1,5. Escalera de bajada 25%/12 h · 20%/24 h · 15%/2-3 d; si vende de más, sube un escalón. Nunca abajo del normal. La caja de compra no frena. Barrera: se cruza sólo si cada unidad deja más con el envío restado. Lo que ya falló más arriba (techo conocido) va con el precio que pienso, no ×3. Se trata en la MISMA vuelta en que aparece, y se decide la caja si hay oficina (poco si venía lento). Pocas unidades: se rejuzga con cada venta; la 2ª que confirma el ritmo → se sube sí o sí. Se juzga sólo por lo cobrado de más; la única pérdida es stock caro al llegar la caja (por eso, si al ritmo normal alcanza, vuelve al normal antes).
**Al terminar la escasez:** no volver a ciegas. Si deja igual o más plata que el normal, se queda; si no, se busca el medio arrancando por el tramo de la escalera que mejor anduvo, con la misma certeza, cada baja como descuento.
**Sin reposición (⏳):** vender TODO en ~100 días (nunca 120) al precio más alto que lo vacía: ritmo objetivo = (Full+camino+oficina) ÷ 100. Nissei no lo tiene, el precio no da, Bs As "no se consigue", "no lo consigo" marcado, Paulvic que no vino. Si aparece mercadería nueva o vuelve a poder comprarse, se rehace (y se le pregunta si ese proveedor sirve). 1-2 unidades no se tocan más.
**Sobra (📦):** más de 90 d de stock (o sin ventas en 60). Antes de un descuento por sobra: 30+ días con stock desde la última entrada y ~100+ días de stock. Lo que paga o va a pagar stock antiguo: descuento para vaciarlo antes del cierre (confirmar en la línea que no estuvo en cero después del lote; fecha aproximada ≠ recién llegado). Antes de retirar, comparar el retiro contra rematar al 0%. Cuando él retira de Full, rehacer la cuenta con lo que queda.
**Bajar:** siempre en escalera, primero como descuento propio (mínimo 5%, 14 días, mismo neto) o promo de ML si pone plata. Nunca subir la lista para inflar el tachado.
**Otros:** barrera $33.000 (se frena en $32.999 salvo `!cruza`) · techo $650.000 · terminaciones 90/990 (cruzar redondos NO se frena, medido) · comisión con escalones (mirar la ganancia al precio nuevo) · la caja de compra orienta, no decide (Full vale ~19%) · venta barata ≠ remate (remate sólo si estuvo parado de verdad) · Premium que gana la caja se queda en Premium · nuevos arrancan en su precio final y en la primera semana se mira la caja · lo nuevo que vuela se sube al toque · lo que vuelve de agotado se compara contra su último tramo con stock · los pendrives de Matías se juzgan como familia (el de 32 el conveniente) · Paulvic: prueba de $21.990, si pierde vuelve a $14.950.
**Juzgar resultados todos los días:** `supervisor:medir:go` + `juzgo:`; lo que perdió no vuelve por regla, se piensa. Nada en `espera` más de 30 días.

## 6 · PROMOS Y DESCUENTOS
- Las analizo yo en cada completa (`analizapromo` entero) y entro si deja más plata. Las mías en `cyc/promoclaude`; el guardián saca las que nadie analizó.
- 🏷️ promo = ML pone plata · 💸 descuento = sólo nosotros. Cupón de ML (lo paga ML) en azul; promo nuestra en dorado.
- Medir si la promo vende más (plata por día antes vs durante). No suponerlo. CyberMonday 02/11. El ×1,4 de regalo no está confirmado.

## 7 · PAUSADAS, PUBLICACIONES, VÍNCULOS
- Activar lo pausado con stock en Full es prioridad; lo que no se activa va al `pregunto:` con motivo. Lo que está en depósito (fuera de Full) se pausa solo.
- Publicaciones nuevas: las crea él en ML; yo la ficha y el vínculo (la ficha toma el nombre de ML).
- Frenadas por ML: no se toca precio; si hay que arreglar algo, se le avisa.
- Visitas que caen sin cambio de precio: mirar preguntas sin responder y la descripción (lo arregla él).

## 8 · VENTAS Y PREGUNTAS
- Cada venta contra su ficha en cada vuelta. Lo de una sola vez (retención, cuotas, carrito) no toca el precio.
- Preguntas: sólo las que sé sin duda, cortas, sin teléfonos ni links. Nada de más de 7 días. Reclamos que esperan su respuesta: una vez por día.

## 9 · PEDIDOS Y CAJAS
- **Pedidos completos, todo el catálogo**, en la completa: objetivo 30 días (45 en Bs As que se corta 2+ veces y vende 0,5+/día), ritmo por día con stock, stock de las 4 cuentas sumado, sin costo no se pide, precio para el máximo = mediana cobrada en 60 d (no el de escasez), máximo por color con `pvVars`. Si el log dice NO LEÍ o el script NO CIERRA, no se carga nada.
- Motivos de Pedidos para Tito ("Hola Tito!", cortos). Los de cajas, para Matías.
- **Cajas:** 37 días (30 de venta + 7 de viaje), 60 sólo en lo parejo sin prueba abierta, nada pasa 90 días, lo nuevo sale con el mínimo de 4, cuenta en cero recibe el mínimo salvo que otra tenga stock de ese color. Respetar el cupo (lo vendido no devuelve cupo). Marco yo las que ML dio por entradas (`cajallego`).
- **Paraguay:** pedidos de ~US$1.000 cada 2-3 semanas, piso 25% (no 24), mínimo 100 ventas en ML. Ticket real obligatorio para cerrar (`compray|det=`). Recargo medido (respaldo 20%). Al llegar: ficha (pagado × recargo), cuenta por rubro (perfumes → Adriana) y equilibrio, vínculo. Cuántas de cada nuevo: barato con 100+ ventas → 3-4 · caro (+US$60) → 1 · resto 2. Dos proveedores (Nissei, Elegancia) y dos pedidos en Nissei (perfumería y resto).
- **Listas** (otros proveedores): se miden sólo contra ML, mínimo 100 ventas, un solo vendedor no vale como precio, nunca cargar una lista vieja, Iscos sólo lo de su web (×0,665).
- **Paulvic:** pedido cada 15 días para 45 días por aroma, redondeado (3, 5, 10, 20, 50). Costo = el del último pedido (con testers y regalos). Lo que no vino no se pide más. Pagar en 7 días hábiles desde que llega.
- **No se consigue más** (De la Patagonia y lo marcado): no se pide; se vende a precio lleno hasta cerca del cobro de stock.

## 10 · PLATA
- El 1º de cada mes el retiro = lo que dice "💸 cuánto cobrar" del mes cerrado (`cobromes`). La deuda de H con ARCA queda en CYC.
- Gasto de Full del mes: `cargosmes` en la completa del 15 (el período va como gasto del mes siguiente).
- Gastos que se cargan a mano: la lista de Gastos dice qué falta; recordárselo a fin de mes.

## 11 · TELEGRAM
- Sólo `pregunto:` con decisiones suyas o lo importante que sólo puede hacer él y cuesta plata. Nunca "subí/bajé/activé". Sin datos de compradores. `resumen:` no se manda.

## 12 · AL CAMBIAR ALGO DEL SISTEMA
- Anotarlo en `REVISION.md` en su etapa, en el mismo commit; subir a la rama de la sesión y a `claude/add-folder-78ysyb`. Web: `APP_VERSION`, `APP_CAMBIOS`, `CACHE` de `sw.js`. Workflows: opciones repetidas en un paso.

## 13 · PENDIENTES VIVOS (se borran al cerrarse)
(se pasan tal cual desde CEREBRO.md al reemplazar)
