# 🧠 CEREBRO · ORDENADO (aprobado por él el 20/10/2026: *"1a"*)

Primero QUIÉN MANDA cuando dos reglas chocan, después QUÉ SE CORRE en cada vuelta, después las reglas por tema, y al final el
ANEXO con el detalle de cada regla (comandos, números, casos). **Si algo del anexo choca con la parte de arriba, manda la de
arriba** (sección 0). La historia de cada regla (fecha, frase suya, el caso) queda en `CLAUDE.md`. **Cada vuelta (08:52 completa ·
10:52, 12:52, 14:52, 16:52, 18:52 y 20:52 cortas) arranca leyendo este archivo y `notas/preguntas.md`.** Regla nueva → va en su
tema acá (y su detalle en el anexo si hace falta), en `CLAUDE.md` (historia) y en `REVISION.md` (su etapa), en el mismo commit.

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
4. ⚠️ dato dudoso: no tocar precio; anotar. Si 🧭 + 🔀 + 💭 traen más de ~8 renglones, un ayudante en Alto los piensa y propone; si no, los miro yo. Aplicar siempre es mío.
5. Cada venta nueva contra su ficha (¿confirma o desmiente la prueba? ¿se aceleró ⚡? ¿la dejó en escasez?). Escasez nueva se trata en ESTA vuelta (precio + caja si hay oficina).
6. Activar pausadas con stock en Full (`activarfull:go:25`); lo que no se activa va al `pregunto:`.
7. Preguntas de compradores que sé sin duda (`contesto:`). Promos mías que vencen en 2 días.
8. Escrituras juntas en UNA ml-sync. En el chat: "🚨 N → N · 🧭 N → N · 🔀 N → N · ventas N miradas · ideas …".

**Completa (08:52), además de todo lo anterior:**
1. `historia` · `escasez:expediente` · `informe:24` · `ficha:cuenta=<c>` ×4 · `pedidostodo` · `techo95` · `techofreno` · `supervisor:medir:go` · `analizapromo` entero.
2. **Cuatro ayudantes (uno por cuenta, esfuerzo max)** juzgan cada publicación con su ficha entera y le hacen las preguntas de `notas/preguntas.md`. Cada uno recibe también los renglones de `raros` de su cuenta y propone qué hacer con cada uno. **Un quinto** busca ideas nuevas en el negocio entero.
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

- **Esfuerzo de cada parte (20/10/2026, regla suya: "3a"; no se cambia sin que él lo diga):** los 4 ayudantes de cuenta, el
  de ideas y el revisor en contra de la completa van con esfuerzo **max**; el ayudante de los raros en las cortas (cuando hay más
  de ~8 renglones) va en **Alto**; el chat que junta, decide y aplica usa el nivel que él le ponga a la sesión.

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
- **¿Tiene sentido este descuento?** Antes de cualquier `entrarpromo`: sobra de verdad (90+ días al ritmo con stock), no es
  recién llegado (30+ días desde la caja) y queda en 25%+ en el peor caso (abajo sólo con motivo en el 🧠). Si falla una, no va.
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
- **Listas** (otros proveedores): se miden contra ML TODAS, también las que compra Tito en Bs As (Dai Nippon): *"el objetivo es venderlo por ahí, si no cómo sabemos qué da"*; mínimo 100 ventas, un solo vendedor no vale como precio, nunca cargar una lista vieja, Iscos sólo lo de su web (×0,665).
- **Navidad:** en la completa del 14/11 (y esa semana) medir qué subió en Navidad 2025 (17-30/12) y pedir esos productos para 45 días.
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
- Paraguay 08/10: falta sólo el correo (monto y kilos). Paraguay 08/09: pesos de los dólares, ticket, retira, correo.
  Transferencia de $50.000 del 29/09: preguntar de qué es.
- Paulvic del 06/10 (40 u.): al llegar, `pvped:llego`, rehacer la cuenta con el flete y ofrecer `poncosto`.
- Idea propuesta: probar un Paulvic de hombre a ~$17.990 después del Día de la Madre (escalón de comisión de $15.000).
- Medir promos en el CyberMonday 02/11.
- Descuentos del 13/10 y 14/10: CONFIRMADOS puestos (vencen 26-29/10), se juzgan desde el 20/10. El Asher quedó sin descuento a propósito (De la Patagonia a precio lleno).
- Tarifa de almacenamiento (`almactarifa`) sigue sin pasarla él.
- **Dinero que rinde en MP (idea 11):** lo revisa él en la app de cada cuenta.
- **Completa del 17/10 (eligió 2a el 16/10):** revisar los 4 perfumes Cuba de Adriana (Prestige Platinum $50.000, Blue $45.000, Gold $67.174, Prestige Classic $50.000; nunca vendieron, 2 u. cada uno): costo de la ficha contra el margen aprox de 98-169%, precio contra la competencia de catálogo, terminación 90/990. Juicio en el 🧠 de cada uno.
- **9 pedidos puestos en 0 el 16/10 (eligió 1a)** por no poder reponerse (Ferrari Negro, Halloween Kiss Sexy y Kiss, Ted Lapidus Rumba, Cool Water, Sony ZX310, SSD 1TB, Buds Core, VS STARLIT Bare Vanilla): si vuelve Nissei o baja el precio, se vuelven a pedir; cuando entre stock, regla ⏳.


===========================================================================================================================
# 📚 ANEXO · EL DETALLE DE CADA REGLA (el CEREBRO de antes, entero)
Lo de acá es el cómo: comandos, números y casos. **Manda la parte de arriba** si algo choca. Las secciones numeradas viejas
("0 · Quién hace qué" … "10 · Pendientes vivos") quedan sólo como referencia: los pendientes que valen son los de la sección 13.
===========================================================================================================================

## 🧭 LO QUE NINGUNA REGLA NOMBRA (20/10/2026, eligió 1abc 2a 4ab) · MANDA SOBRE LO DE ABAJO
Él: *"el problema principal son cosas que no tenías en cuenta. ese es el problema real"*. Las reglas sólo encuentran lo que
nombran. Desde hoy, además de las reglas:
 1. **`raros` en TODAS las vueltas** (ml-consulta, solo lee, va junto con planilla/escasez/lupa). Compara cada publicación contra
    SU PROPIO AÑO (semanas con stock), sin regla por caso, y saca cuatro listas:
    · **🧭 FUERA DE LO NORMAL** (vende mucho menos o más rápido que nunca con la certeza de Poisson, visitas muy distintas a lo
      normal, la ven y no compran). Lo que yo cambié de precio en 21 días no entra acá (va a 💭). **Se vacía en esa vuelta.**
    · **🔀 NO CIERRA** (el mismo producto a otro precio en otra publicación, margen de más de 120% o negativo, la estrategia que
      dice una cosa y el stock otra, descuento que ya no hace falta). **Se vacía en esa vuelta.**
    · **⚠️ DATO DUDOSO (2a)**: stock o precio sin leer en 3 días, línea que no se escribe, margen sin medir o viejo, sin costo.
      **Sobre esas NO se toca el precio esa vuelta** (salvo que él lo pida) y se anota por qué en el 🧠.
    · **💭 SIN CERTEZA (4a/4b)**: precio cambiado en 30 días que todavía no se puede juzgar. Dice cuánto falta, la señal temprana
      de las visitas, el juicio EN FAMILIA (las del mismo producto cambiadas el mismo día, ej. los aromas del Paulvic) y las
      parecidas del rubro a precio parecido. Lo que sola no se sabe nunca (falta 30+ días) se juzga en familia, por visitas o
      por las parecidas: nunca se deja colgado. No se vuelve atrás ni se da otro escalón sin un motivo de esa lista.
    En el chat: "raros: 🧭 N → N · 🔀 N → N · ⚠️ N sin tocar · 💭 N midiendo (familias que ya se saben: …)".
    **QUIÉN PIENSA CADA RENGLÓN (20/10/2026, eligió la a):** en la COMPLETA, los renglones de `raros` de cada cuenta van al
    ayudante que ya juzga esa cuenta (no hay ayudante extra): devuelve qué haría con cada uno y por qué. En las CORTAS, hasta ~8
    renglones los miro yo directo; con más, un ayudante en esfuerzo **Alto** con esa lista. Los ayudantes SÓLO PROPONEN: juntar,
    resolver choques entre cuentas, mirar si hay otra corrida de ml-sync andando, aplicar y releer de ML lo hago yo, siempre.
 2. **EL REVISOR EN CONTRA (1b)** en la completa: con las decisiones de los 4 ayudantes ya juntas y ANTES de aplicar, un sexto
    ayudante (esfuerzo max, sólo lee) abre la ficha de cada publicación que cambia y busca en qué me equivoco: un dato que no
    cierra, una regla de mayor prioridad que pisé, una pregunta de `notas/preguntas.md` sin contestar, una decisión de menos de 7
    días que deshago, un ⚠️ dato dudoso. No propone precios: marca. Lo marcado lo miro yo; si no lo puedo resolver, ESA no se
    aplica esa vuelta. En el chat: "revisor en contra: N marcadas · R resueltas · F frenadas".
 3. **LAS PREGUNTAS (1c)**: `ml-sync/notas/preguntas.md`. Cada corrección suya se convierte ahí en una pregunta general que se le
    hace a TODAS las publicaciones (no una regla para ese caso). Los ayudantes y yo se las hacemos a cada ficha; la 20 siempre:
    *"si él mirara esta ficha ahora, ¿qué me preguntaría?"*. Corrección nueva → su pregunta en el mismo commit que `correcciones.md`.
 4. **LAS REGLAS SE ORDENAN (3a):** hecho el 20/10 (él aprobó "1a"): este archivo arranca con la tabla de QUIÉN MANDA y el detalle va en el anexo.

## 🔭 PLAN 20X: CADA PRODUCTO Y CADA VENTA, A FONDO (20/10/2026, eligió 1a 2a 3a 4a) · MANDA SOBRE LO DE ABAJO
Él: *"tengo el plan 20x. aprovechemos. lo primero que quiero es que cuando analices las ventas y productos le des más
detenimiento"*. Antes, la completa miraba cada publicación de a un renglón y la ficha sólo cuando algo llamaba la atención.
 1. **COMPLETA (08:52): CUATRO AYUDANTES, UNO POR CUENTA, A LA VEZ.** Después de bajar `planilla`, `historia`, `escasez:expediente`
    e `informe:24` (de a uno), corro `ficha:cuenta=adriana`, `…=ayelen`, `…=luciana`, `…=matias` por ml-consulta (de a dos) y
    guardo cada log limpio en el scratchpad. Lanzo 4 agentes (`Agent`, en un solo mensaje) y a cada uno le paso: su archivo
    de fichas, los pedazos de planilla/historia/expediente/informe de su cuenta, y la ruta de `ml-sync/CEREBRO.md` y
    `ml-sync/notas/techo.md` para que los lea. Cada ayudante abre la ficha ENTERA de cada publicación de su cuenta (activas, con
    stock o agotadas que vendían): el año, cada cambio de precio y cómo le fue, cada tanda de stock y cuánto duró, fechas,
    competencia y caja, la prueba en curso. Y devuelve, por publicación, UN juicio razonado: estrategia (tag), precio que
    propone (o "igual"), pedido/caja si corresponde, y el porqué con números, más "no estoy seguro" cuando lo está. **Los
    ayudantes SÓLO LEEN: no corren nada que escriba.** Yo junto los cuatro, miro yo mismo todo lo dudoso, lo que cambia más
    de 20% el precio y lo que contradice una decisión mía de menos de 7 días, y recién ahí aplico con `decido`.
    En el chat: "ayudantes: N publicaciones juzgadas · C cambios · D dudosas que miré yo".
 2. **CADA VENTA, EN TODAS LAS VUELTAS, CONTRA SU FICHA** (no sólo las raras de `ventasraras`). Para cada compra desde la vuelta
    anterior: ¿es la 1ª o 2ª venta después de un cambio de precio? ¿confirma o desmiente la prueba de techo? ¿cambió el
    ritmo (⚡)? ¿deja el stock en escasez? ¿se vendió en promo? Si hay que tocar algo se decide en ESA vuelta (regla ⚡ del
    18/10). Si son muchas, la ficha se abre de las que tienen poco stock, prueba en curso o salieron raras; el resto se mira
    con la línea de su publicación en la planilla. En el chat: "ventas: N miradas · A acciones".
 3. **VUELTAS CORTAS CADA 2 HORAS**: 10:52, 12:52, 14:52, 16:52, 18:52 y 20:52 (rutina `trig_01FCaQqzU5MA422N6Z8nH63Z`).
 1b. **LOS AYUDANTES VAN CON ESFUERZO `max`** (decisión suya del 20/10: *"una forma de minimizar errores es poner un esfuerzo más
    alto a las tareas que tirás vos al mirar los productos y precios"*). `Agent(…, effort:'max')`. Si un día se cortan por
    límite de uso, se rehacen y se dice en el chat; nunca se aplica un juicio a medias.
 1c. **UN QUINTO AYUDANTE SÓLO PARA IDEAS NUEVAS** (pedido suyo del 20/10: *"que te fijes ideas nuevas al tirar las revisiones
    diarias, por si encontrás algún problema a mejorar o algo nuevo"*). Ya existía el paso 10 / 5b, pero en la práctica se
    cortaba cuando el día venía pesado (la última idea anotada era del 18/10). Ahora en la completa va un ayudante aparte, con
    esfuerzo `max`, en paralelo con los cuatro de las cuentas, que NO mira producto por producto sino el negocio entero: lee
    `ml-sync/notas/ideas.md` (para no repetir), `correcciones.md`, el informe, la planilla, el expediente y las fichas de las 4
    cuentas, y busca plata que se pierde o se puede ganar y nadie mira (costos pagados de más, patrones en las ventas, ventas
    que se pierden, cosas que él hace a mano, errores del panel o del robot, cruces que no cierran). Cada idea viene MEDIDA con
    los datos (cuánta plata, cuántos casos) y con (a)/(b); sólo lee. Yo hago lo chico y fácil de deshacer, lo grande va al
    `pregunto:` con números, y todo se anota en `ideas.md`. En las vueltas cortas, el 5b sigue: una mirada rápida con lo de esa
    vuelta. En el chat SIEMPRE: "ideas: N nuevas (H hechas · P propuestas)" o "ideas: ninguna nueva, miré X, Y, Z" — nunca callado.
 4. **EL PORQUÉ QUEDA EN LA FICHA.** Al terminar la completa, toda publicación juzgada lleva su nota (`decido:<MLA>=nota|…`,
    muchas con `ml-sync/notas/fichas_<fecha>.txt` y `decido:archivo=…;go`), con el razonamiento corto y QUÉ MIRAR MAÑANA. Al
    día siguiente el ayudante arranca leyendo esa nota (está en la ficha) y no de cero.

## 🧐 ¿TIENE SENTIDO? ANTES DE CREERLE A UN NÚMERO (20/10/2026, pedido suyo · vale para mí y para los ayudantes)
Él: *"miras que el de 50 ml está a 20.000 y el de 100 ml a 100.000: ahí ya tenés una idea que el precio es más cercano a 40.000
(…) no fue una regla mía, simplemente se me ocurrió, quiero que eso se te ocurra a vos"*. No es una regla más: es preguntarse
SIEMPRE, antes de decidir con un número (precio de ML, margen, ritmo, costo, stock), **¿esto tiene sentido contra lo que ya sé?**
Cruzarlo con lo que tenga cerca:
 · **el mismo producto en otro tamaño o presentación** (50 ml contra 100 ml, pack contra suelto, mini contra grande): el precio
   por ml o por unidad tiene que ser parecido; si uno da el doble, el raro está mal o es otro producto;
 · **el mismo producto en otra cuenta o en otra fecha** (lo que vendíamos, lo que pagamos, lo que pide la caja);
 · **productos parecidos de la misma marca o rubro** (un perfume árabe de US$ 10 no se vende a $150.000);
 · **el costo**: un margen de 150% o un precio abajo del costo casi siempre es un error de emparejado o de dato;
 · **cuántos lo venden y cuánto venden**: un solo vendedor caro o sin ventas no es "el precio de mercado".
Si no cierra, no se usa: se busca la razón (otro producto, otro tamaño, dato viejo, vendedor inflado) y se dice en el motivo.
Cuando él me corrija algo que podía haber visto así, va a `ml-sync/notas/correcciones.md` (abajo) con QUÉ CRUCE me faltó.

## 📉 LAS CORRECCIONES SE CUENTAN (20/10/2026, pedido suyo: *"tu objetivo en ese punto es que no tenga que corregirte en nada"*)
Cada vez que él me corrige (un precio, un pedido, una regla que no apliqué, un error de pantalla) se anota en
`ml-sync/notas/correcciones.md`: fecha · qué · por qué pasó (faltó un dato, faltó un cruce de sentido común, error de herramienta,
regla nueva suya) · qué cambié para que no vuelva. Los lunes, en la completa, cuento las de la semana contra la anterior y lo
digo en el chat. Lo que es dato de ML tarde o mal (cupos, stock que tarda) NO cuenta como corrección mía.

## 📂 PASO OBLIGATORIO DE LA COMPLETA (08:52): EL EXPEDIENTE, PRODUCTO POR PRODUCTO, PENSADO (16/10/2026, eligió la b)
Él: *"quiero que sea 'vivo' el pensamiento, que gaste tokens, no que sea mecánico, sino que sea como que te lo pregunte por
acá (…) así todos/todo. pero fijate siempre que sea coherente, si no es un exceso de gastar tokens"*. Las reglas de este
archivo son AYUDA, no la decisión: si sólo se siguen las reglas, lo que nadie previó no lo ve nadie.
 1. Correr `escasez:expediente` por ml-consulta y leer el log ENTERO (scratchpad, en pedazos). Trae, por producto × cuenta
    (y color): stock en Full / camino / oficina, días que alcanza, cuánto tarda en volver a haber y en poder comprar, ventas
    14/30 días y últimos 3, cada publicación con precio de hoy vs al que vendía, caja, margen aprox y mi promo, mi última
    decisión con su motivo, y lo decidido de pedido y caja. Entran los que se movieron (vendieron o cambió el stock en
    2 días, escasez, una decisión mía de precio en 7 días) y un tercio del resto por día: nadie pasa 3 días sin
    mirarse (`escasez:expediente:todos` = todos).
 2. Por CADA bloque, pensar como si él me preguntara por el chat: ¿lo que está hoy (precio, promo, pedido, caja) sigue
    teniendo sentido con todo esto? ¿qué cambió desde mi última decisión? ¿hay algo raro que ninguna regla nombra? Mirar la
    línea de tiempo (`lupa`, `historia`, `porquebajo`) sólo cuando el bloque no alcanza para decidir.
 3. Escribir un juicio por bloque en el 🧠 (`decido:<MLA>=nota|…` o el cambio con su motivo): QUÉ HAGO o POR QUÉ NO HAGO NADA
    HOY, con los números de ese bloque. Nada de "sin cambios" pelado. Muchas notas: `ml-sync/notas/expediente_<fecha>.txt` y
    `decido:archivo=…;go`.
 4. COHERENCIA, para no gastar de más: si un bloque no cambió nada desde el juicio anterior (mismo stock, mismo ritmo, mismo
    precio, ninguna decisión vencida), alcanza con renovar el juicio en una línea; el pensamiento largo va donde algo se movió.
 5. En el chat cerrar con: "expediente: N mirados · C cambié · S sigue igual con motivo · R raros (qué)".

## 0 · Quién hace qué
- **El robot SÓLO junta datos de ML.** No decide, no sugiere, no vincula, no le avisa a él. Todo lo demás lo hago yo.
- **Él no marca nada a mano: me lo dice y lo hago yo** por comando ("Ya lo pedí", "Llegó", cajas, oficina, ancla…).
- **Nunca tomar como dato una marca vieja del robot** (escalera, liquidando automático, expediente). Dato crudo siempre.
- Él no toca precios ni promos: **no hace falta que me avise nada de eso, lo miro yo en cada vuelta.**
- Lo grande o lo que no tiene respuesta clara lo decide él: va todo junto, numerado, con (a) sugerida y (b).
- **Stock antiguo** (14/10, reforzado 16/10 por él: *"resolver el problema de raíz… con una simple revisión te darías cuenta
  que hay que bajarlo porque está pagando stock"*): el `escasez:expediente` trae arriba de todo **💸 PAGA O VA A PAGAR STOCK
  ANTIGUO**, COLOR POR COLOR (ML cobra por código de Full), con la misma cuenta que `antiguo`, aunque venda poco. **Cada renglón
  que diga SIN DECIDIR se decide en esa vuelta** (promo/remate para que salga antes del cierre, retirar, o por qué se deja,
  con su número en el 🧠). Nunca subirle el precio a algo que paga stock antiguo sin decir por qué. Lo recién llegado sin
  ventas no se proyecta.
  **Ojo (19/10, el Joystick Xbox Velocity de Matías, que ML iba a descartar por 120 d sin vender y acá decía 24 d):** una fecha
  aproximada (`antes`, de cuando empezamos a mirar) no es "recién llegado". Esos salen como **⚠️ NO VENDIÓ Y NO SÉ DESDE
  CUÁNDO ESTÁ** y se deciden igual: retirar, remate o por qué se deja.
- **Varios comandos en UNA corrida** (14/10): en `comando` (ml-consulta) o `billing_probe` (ml-sync) van uno por renglón.
  Las lecturas de la vuelta (planilla, informe, pedidostodo, escasez, ventasraras…) van juntas en una sola ml-consulta, y
  las escrituras juntas en una sola ml-sync. El registro los separa con `##### <comando>`.
- **Gasto de Full del mes** (14/10, él eligió que lo cargue yo): en la completa del día 15 de cada mes (o la primera
  después) corro `cargosmes` por ml-consulta para mirar y `cargosmes:<AAAA_MM>:go` por ml-sync para cargarlo (el período de ML de un mes va como gasto del mes SIGUIENTE: el de septiembre en octubre) (almacenamiento
  + stock antiguo + retiro/descarte + multas, de la factura de ML de cada cuenta). Ya no hace falta que él me pase el reporte.
- **Las notas de Pedidos y Armar caja ahora se ven en la tarjeta** (sin tocar 🧠): escribirlas cortas, la primera frase
  es lo que se lee en dos renglones.

## 1 · Precios (cada decisión con su motivo en el 🧠, una por variante)
- **Objetivo 25% en el PEOR caso** (retención de otra provincia 2% + el peor envío visto + cuotas) ≈ 28% en el número
  normal. Sin piso del 22%: bajar de 25% sólo con motivo y `!piso`. **Nunca abajo de 0%.**
- **Paso 0 de TODAS las vueltas:** `planilla` → sección 🛡️ → subir DE UNA al precio del 25% en el peor caso, o dejarlo a
  propósito con `!piso` (excepción anotada). Lo nuevo que nunca estuvo en Full se pone a precio antes de activarse.
- **Cada variante (color/aroma) se juzga sola**: su precio, su stock, sus ventas. Nunca el promedio del producto.
- **Subir es casi gratis, no subir es caro (regla suya del 13/10, con la Lupa 100mm vendida a $11.990 dos horas después de subirla de $7.680):** probar más caro arriesga unos días de menos ventas, que se ven enseguida y se deshacen; no probar pierde plata en CADA venta, para siempre y sin que nadie lo vea. Ante la duda, se prueba. Una sola venta no confirma nada: se juzga con plata por día cuando hay certeza.
- **Las pruebas de techo van TODAS JUNTAS, nunca por tandas (regla suya del 13/10).** En cada vuelta se pasan todas las publicaciones y a cada una que se pueda probar se le pone su precio de prueba en ese mismo momento. Las que quedan afuera es por un motivo de esa publicación (cambio reciente en medición, sin stock, sobra, escasez, techo ya encontrado), nunca porque "van en la próxima tanda".
- **La nota del 🧠 dice SIEMPRE el porqué, se toque o no (regla suya del 13/10):** *"quiero explicación clara de por qué se subió/bajó y si no se subió/bajó por qué, en ambos casos"*. Cada nota: precio y estado · último cambio con fecha, de cuánto a cuánto y su motivo · ventas 7/30 d y stock · y **HOY NO LO TOCO PORQUE …** (cambié hace pocos días y mido · sin stock · grupo de comparación · sobra stock · vende muy poco · ML en revisión) o QUÉ HICE / POR QUÉ. **Sin la frase "se mira solo, no con el resto del producto"**: ya se sabe.
- **Barrera $33.000**: se frena en $32.999 salvo que cruzar deje claramente más (`!cruza`, explicado).
- **Techo $650.000.** Variantes: se suben todas o ninguna (ML borra las que faltan).
- **`decido` mide el piso en el PEOR caso** (el mismo número de la planilla 🛡️) y lo muestra al lado del normal. Una suba
  de más del doble de una se rechaza salvo con `!salto` (un cero de más en un archivo de 110 renglones no puede pasar).
  Algo que está en un descuento mío vigente no se sube de lista (infla el tachado): salir primero con `entrarpromo:…=salir`.
- **Terminaciones 90/990** (también en lo más barato: `decido` redondea a $10, así que el "99" no se puede escribir). Cruzar $5.000/$10.000/$20.000/$50.000/$100.000 YA NO se
  frena: medido el 13/10 con `redondos` (40 subas que cruzan, 8,3%, venden ×0,60 · 83 que no cruzan, 3,3%, ×0,60), no pesa.
- **Comisión de ML con escalones** (ej. ~$15.000): antes de subir, mirar la ganancia por unidad al precio NUEVO
  (el `decido` en prueba la muestra). Subir y ganar menos no se hace.
- **La caja de compra orienta, no decide.** Perdiendo y vendiendo bien → no se baja. Full vale ~19% de precio.
- **Toda baja va primero como promo** (descuento propio, mínimo 5%, 14 días) que deje el mismo neto; recién si no se
  puede, bajar el precio de lista. Nunca subir la lista para inflar el tachado.
- **Escasez** (todas las vueltas, `escasez`): sin caja despachada se estira sin fecha, directo al precio que pienso (ML deja hasta +100% sin problema),
  SIN techo ×2 desde el 16/10: arranca alto y baja en escalera (ver 🪜 abajo); con caja despachada, que la última salga cerca del día 8. Nunca abajo del precio normal. Al llegar la
  caja no se vuelve a ciegas.
  **Qué es escasez (15/10, regla suya): no son 15 días fijos.** Es que se corta ANTES de que vuelva a haber: caja despachada →
  lo que le falta · oficina → ~10 d · si no, comprar (`cyc/reponer`: pedido en camino, Paraguay 17 d + espera, precio que no
  da o Nissei sin stock = SIN FECHA). `escasez` lo marca 🔥 por fila (Full o "de compra"). Lo sin fecha se estira aunque tenga 20 días.
- **Lo nuevo que vuela se sube al toque**; venta abajo de 25% con poco stock → subir en la MISMA vuelta.
- **Productos nuevos arrancan directo a su precio final.** Y en la primera semana se mira la caja: si es de catálogo y la pierde
  (0 visitas), el precio no es el final: descuento al precio que gana la caja si deja 25%+ (caso del pedido del 21/09, 13/10).
- **Buscar el techo** (`notas/techo.md`): TODO lo que vende y no tiene techo conocido, todas juntas. **SIN ESCALONES
  (regla suya del 13/10): directo al precio que pienso que es el techo, a cualquier precio. ML deja subir hasta +100% del
  precio actual sin pausar nada** (lo del Espejo 8" fue por otra cosa, no por el precio). Juicio por CERTEZA en plata por día (Poisson: 3 esperadas y 0 = 5% azar · 6 y 0-1 =
  2% · 10 y ≤2 = 0,3%), nunca con un solo día, máximo 30 días. Afuera: escasez, sobra (+90 d), liquidando, mis promos,
  regalables antes de su fecha, frenadas por ML.
  Lo que cambió de precio en 7 días (subas del peor caso) espera los primeros juicios y entra desde el 15-16/10 en su
  SEGUNDO escalón, juzgado antes contra esa suba (decisión suya del 13/10).
- **🪜 SI LA PRUEBA DE TECHO SALE MAL, SE BAJA EN ESCALERA (18/10/2026, eligió la a).** Caso Hub 8 en 1: $19.990 → $27.990 →
  volvió directo a $19.990 (que nunca se había medido) → se frenó → $17.990. Ahora: (1) **cada escalón se juzga con certeza
  ANTES de dar el siguiente**, nunca un salto sobre un escalón sin medir; (2) si el precio probado no rinde, no se vuelve
  directo: se baja de a ~10-15% (ej. $27.990 → $23.990 → $21.990), cada escalón medido unos días con la misma certeza, y
  **nunca abajo del último precio que vendía**. Donde la plata por día deja de mejorar, ése es el techo (`techofreno` con ese
  precio). Si las visitas se caen a la mitad en un escalón (regla 4 de 🔬), se corta antes y se baja al siguiente.
- **⬇️ NUNCA SE BAJA UN PRECIO SI NO ES EN ESCALERA (18/10/2026, regla suya: *"nunca bajar si no es con escalera. salvo alguna
  excepción"*).** Vale para TODA baja (vuelta de techo, caja, sobra, promo): escalones de ~10-15% y cada uno medido con certeza
  antes del siguiente. La escasez sigue con su propia escalera (25/20/15%). **Excepciones, cada una dicha en el 🧠:** un precio
  mal puesto (error) · stock antiguo con fecha de cobro encima (no da tiempo a medir) · ML pausó la publicación por el precio ·
  un remate o precio que pide él · la última unidad. El 18/10 se corrigieron las que habían bajado de golpe
  (`notas/escalera_1810.txt`).
- **Venta barata ≠ remate**: remate sólo si antes estuvo parado de verdad (línea de tiempo `mlapi/linea`).
- **Juzgar los resultados de precios todos los días** (08:52: `supervisor:medir:go` + `juzgo:`). Lo que perdió no se
  vuelve atrás por regla: se piensa.
- **"No se sabe" sólo mientras falta dato (17/10/2026, eligió 1a 2a 3).** El supervisor separa ✅ firme (medido entero) de sin confirmar; a los 30 días todo cambio queda juzgado con la cuenta más justa (ritmo con stock antes vs después) y las subas por escasez restan lo que quedó sin vender al llegar la caja. Mis `juzgo` tampoco quedan en `espera` más de 30 días: decido ganó/perdió/igual.
- Siempre releer de ML después de cambiar un precio.

## 2 · Promos y descuentos
- **Las analizo yo, sin que él avise.** En la completa: `analizapromo` entero (eventos de ML, compartidas, cuánto pone ML,
  margen a ese precio, si ya vende bien sin promo, stock, fechas). Se entra si deja más plata.
- El guardián de cada hora saca las promos que nadie analizó; las mías viven en `cyc/promoclaude` y no se tocan.
- Las mías que vencen en 2 días: renovar o dejar terminar (sección 6 de `analizapromo:7`, también en las cortas).
- **Cupón de ML (lo paga ML entero):** no nos cuesta nada, a nosotros nos llega el precio lleno. En la web va en AZUL
  ("Descuento ML"). **Promo nuestra (pusimos plata):** DORADO ("Vendido en promoción"). Él sólo quiere seguir de cerca las doradas.
- **Medir si una promo activa la venta**: plata por día antes vs durante, igual que el techo. Primera oportunidad
  grande: **CyberMonday 02/11**. No suponer que la promo vende más (Halloween 9-10/10: 3 con cupón y 2 sin, al mismo precio).
- Las ventas en promo de la vuelta (cuántas, cuánto puso ML, si pusimos nosotros) se cuentan en el chat (el `resumen:` por Telegram se sacó el 16/10).
- Fechas y eventos: sección 14/14b del `informe` y `eventos`. El ×1,4 de lo regalable NO está confirmado: mirar lo que vende de verdad.

## 3 · Pausadas, publicaciones, vínculos
- **Activar lo pausado es PRIORIDAD** en todas las vueltas (`pausadas:25` + `activarfull:go:25`). Lo que no se activa
  va al `pregunto:` con motivo y propuesta. Nunca pausada en silencio.
- Publicaciones nuevas sin ficha: las vinculo yo (`vincular`). Él crea la publicación en ML; yo la ficha y el vínculo.
  **Al vincular, la ficha toma el nombre de la publicación de ML** (regla suya del 19/10; `vincular` lo hace solo, `nombreml` para las viejas).
- Frenadas por ML (`under_review`, documentación): no se puede tocar precio; si hay que arreglar algo en ML, se le avisa.

## 4 · Ventas y preguntas
- **Ventas una por una** en cada vuelta (`ventasraras`): lo de una sola vez (retención de provincia, cuotas, carrito)
  no toca el precio; si el precio de hoy ya no deja lo que creíamos, se decide.
- **Preguntas:** contesto las que sé SIN DUDA (`contesto:`), cortas, sin teléfonos/links. Las demás, a él. Nada de más de 7 días.
- Reclamos con ⏰ que esperan respuesta suya: recordarle una vez por día como mucho.

## 5 · Pedidos, cajas, Paraguay
- **Paraguay se pide de a ~US$1.000, cada 2-3 semanas** (14/10/2026, eligió la a): cada pedido paga ~US$68 fijos (el que
  retira, la transferencia, el correo), o sea ~21% arriba de la web con US$500 y ~14% con US$1.000. Lo que no es urgente
  espera al próximo pedido grande; lo que se corta antes de que llegue (rojo o naranja de Paraguay) se pide igual.
- **Pedidos COMPLETOS, todo el catálogo**, en la completa (`pedidostodo` → `decide_pedidos.py` → revisar → `decido:archivo=pedidos`).
  Objetivo 30 días. El stock de las 4 cuentas va SUMADO. Lo que se pide sin ventas recientes se mira en la línea de tiempo.
  El ritmo es por día CON stock (`dCS`, también por color). Sin costo cargado no se pide (va a la lista "venden y no tienen
  costo"). El precio para el máximo de compra es la mediana de lo cobrado en 60 días (no el subido por escasez). Si el log
  dice "NO LEÍ" o el script dice "NO CIERRA", no se carga nada: se vuelve a correr.
- **Cajas:** `decide_cajas.py` lee del mismo log de `pedidostodo` a qué cuentas se le puede mandar (`ctas [..]`: publican,
  sin `nomandar`, más `pasara`). Si puede ir a más de una, sale en "decidir a mano": lo decido yo mirando `cajasnotas`.
- **Los motivos de Pedidos los lee Tito**: arrancan con "Hola Tito!", cortos y en criollo.
- **Cajas:** marco yo las que ML dio por entradas (`cajallego`). Decido cuántas mandar (`decido:caja`): **30 días de venta + 7 de viaje = 37 días desde hoy** (regla suya del 14/10),
  cuenta en cero recibe el mínimo salvo que otra cuenta tenga stock de ese color. Costo de la caja: $17.310.
- **Almacenamiento de Full: lo chico paga a los 4 meses (120 días) parado; los Tenders (grandes) a los 60** (dicho por él el 14/10). Nada se manda para más de 37 días, así que una caja nunca llega a pagar sola.
- Caja para mandar ya → al `pregunto:`.
- **Paraguay:** el ticket real es obligatorio para cerrar un pedido (`compray:<fecha>|det=…|go`). Gastos de cada pedido:
  dólares (ticket ×1,005 del cambista + US$ 3,80 de la red), el que retira y despacha, correo (monto y kilos).
  Pedido viejo sin datos: `compray:…|sinpesos|go` y lo que falta se le pide. Con los gastos del próximo pedido se
  re-evalúa el recargo del 17% (medidos: 19,9% y 22,4%). Precios y códigos sólo de comprasparaguay (nunca nissei.com).
- Al llegar un pedido: ficha (costo pagado ×1,17), cuenta según rubro (perfumes → Adriana) y equilibrio, vínculo.
- **Lo que NO SE CONSIGUE MÁS no se pide nunca** (`ml-sync/notas/juicios.txt` con 0). Dicho por él: los **De la Patagonia**
  (las 3 fichas, 14/10). Lo que queda se vende **a precio lleno, sin descuentos**, mientras haya tiempo antes de que Full
  cobre almacenamiento (120 días desde que entró). Regla suya del 14/10: *"al no haber más, ¿por qué lo dejamos barato?
  tenemos tiempo para venderlo antes de pagar por stock"*. Recién cerca de esa fecha se piensa bajar.
- **Gasto nuevo de Paraguay (14/10):** adelantar plata de "a liquidar" de MP para comprar los dólares cuesta (el 14/10, $29.000):
  va como `adelanto=` del pedido (renglón propio, 15/10; antes iba en `otros=` y se mezclaba con el cambista). **No es un gasto
  fijo** (él, 15/10: *"fue sólo para ese pedido, puede pasar de nuevo, pero normalmente no"*): no se pide en cada pedido ni frena el
  cierre; se carga sólo cuando él avisa que pasó. Lo que pagó de más el cambista sobre el ticket va en `cambio=`.

## 6 · Plata
- **El 1º de cada mes cargo el retiro** ($1.800.000 hasta que él diga otra cosa).
- Gastos del mes que se cargan a mano: la lista de Gastos dice qué falta; recordárselo a fin de mes.
- Lo que se cobra en el mes que viene: la ganancia real del mes ÷ 3 (CYC, él y su papá).

## 7 · Telegram y resúmenes
- Regla suya del 16/10: *"que lleguen cosas más importantes. sino nada. o algo que tenga que decidir"*.
- `pregunto:` SÓLO decisiones suyas o lo IMPORTANTE que sólo puede hacer él y cuesta plata si no lo hace (reclamo que
  espera su respuesta, ML frenó algo que vende, algo que vende fuerte en 0 en Full con mercadería en la oficina, costo que
  falta en algo que se vende). NO: preguntas sin contestar, cajas "para la próxima", ideas chicas. Nunca "subí/bajé/activé".
- `resumen:` YA NO SE MANDA (se sacó el 16/10), en ninguna vuelta.
- Sin datos de compradores ni números de orden en nada que se publique (el registro es público).

## 8 · Cada vuelta busca algo nuevo
- Mirar el negocio como dueño: dónde se pierde o se gasta plata que nadie mira. Lo chico se hace; lo grande se
  propone con números y (a)/(b). Anotado en `notas/ideas.md` para no repetir. Si no aparece nada, no se inventa.

## 9 · Al cambiar algo del sistema
- Anotarlo en `ml-sync/REVISION.md` en su etapa, en el mismo commit. Subir a las dos ramas (la de la sesión y
  `claude/add-folder-78ysyb`). Web: subir `APP_VERSION`, `APP_CAMBIOS` y `CACHE` de `sw.js` (y que `sw.js` no quede vacío).
- Workflows: mirar opciones repetidas en un paso antes de subir.

## 10 · Pendientes vivos (se borran al cerrarse)
- Paraguay 08/10: falta sólo el correo (monto y kilos). Paraguay 08/09: pesos de los dólares, ticket, retira, correo.
  Transferencia de $50.000 del 29/09: preguntar de qué es.
- Paulvic del 06/10 (40 u.): al llegar, `pvped:llego`, rehacer la cuenta con el flete y ofrecer `poncosto`.
- Idea propuesta: probar un Paulvic de hombre a ~$17.990 después del Día de la Madre (escalón de comisión de $15.000).
- Medir promos en el CyberMonday 02/11.
- Descuentos del 13/10 y 14/10: CONFIRMADOS puestos (vencen 26-29/10), se juzgan desde el 20/10. El Asher quedó sin descuento a propósito (De la Patagonia a precio lleno).
- Tarifa de almacenamiento (`almactarifa`) sigue sin pasarla él.
- **Dinero que rinde en MP (idea 11):** lo revisa él en la app de cada cuenta.
- **Completa del 17/10 (eligió 2a el 16/10):** revisar los 4 perfumes Cuba de Adriana (Prestige Platinum $50.000, Blue $45.000, Gold $67.174, Prestige Classic $50.000; nunca vendieron, 2 u. cada uno): costo de la ficha contra el margen aprox de 98-169%, precio contra la competencia de catálogo, terminación 90/990. Juicio en el 🧠 de cada uno.
- **9 pedidos puestos en 0 el 16/10 (eligió 1a)** por no poder reponerse (Ferrari Negro, Halloween Kiss Sexy y Kiss, Ted Lapidus Rumba, Cool Water, Sony ZX310, SSD 1TB, Buds Core, VS STARLIT Bare Vanilla): si vuelve Nissei o baja el precio, se vuelven a pedir; cuando entre stock, regla ⏳.

## 🔍 LA LUPA: CADA PUBLICACIÓN, TODOS LOS DÍAS (13/10/2026, pedido suyo)
Él: *"todos esos pequeños detalles diarios, casi milimétricos (…) en TODOS los productos (…) necesito ese nivel de detalle"*.
En la completa de las 08:52 y en cada corta: `lupa` por ml-consulta (solo lee). Por cada publicación con stock o ventas:
últimos 7 días con stock contra los 30 anteriores (ritmo, ganancia por unidad, plata por día, días sin vender, caja, precio).
Cada 🚩 se mira con la línea de tiempo y se decide (o se anota por qué no se toca). La caja perdida sola no es motivo.
Línea de tiempo: el ▾ ámbar = ese día se cobró menos sin cambiar el precio (promo/cupón, carrito o color más barato).
- **Escasez y pedidos (13/10):** subir por escasez frena las ventas a propósito; para COMPRAR manda el ritmo de antes de la suba. En `decido` el motivo de una suba por escasez dice "escasez" (así `pedidostodo` la marca ESC).
- **Motivos de `decido` con la causa en palabras (13/10):** escasez · techo/prueba · peor caso 25% · caja · remate/liquidar · vuelvo (no funcionó). De eso sale el color de la flechita y el ritmo de compra.

## ✍️ CADA DECISIÓN DE PRECIO SE EXPLICA EN 4 PARTES (13/10/2026, regla suya)
Él: *"quiero que diga algo como 'subí el producto para probar el techo de x a y, lo que espero ver es tal cosa, y si no pasa
eso espero tantos días o haré tal cosa'"*. Todo motivo de `decido` (y toda nota del 🧠 de precio) lleva:
1. **QUÉ HICE:** de $X a $Y (+N%).
2. **POR QUÉ:** el tipo con su palabra (techo/prueba · escasez · peor caso 25% · caja · remate/liquidar · vuelvo) y el dato que lo dispara.
3. **QUÉ ESPERO VER:** en números (cuántas ventas por semana, cuánto deja por unidad, plata por día).
4. **SI NO PASA:** cuántos días espero y qué hago (volver a $Z, bajar, promo, otro escalón).
Sin `;` adentro. **Nunca repetir oraciones** (regla suya del 14/10): la nota no copia el motivo de otro cambio que ya se ve. Al revisar una decisión vieja, se escribe la nota con lo que pasó contra lo esperado.

- **Cajas a 60 días sólo en lo parejo (14/10/2026, eligió la a):** 37 días de base; 60 si vende parejo hace 2 meses y no tiene prueba de precio abierta (`notas/sin_estirar.txt`, mantenerla al abrir o cerrar pruebas). Respetar el cupo de la cuenta.

## 🇵🇾 CUÁNTAS DE CADA PRODUCTO NUEVO DE PARAGUAY (15/10/2026, eligió la a)
Ya no son 2 de todo. El botón 🪄 Llenar hasta el tope (`candMaxU` en index.html): **barato (hasta US$15 crudo) con 100+ vendidas
en ML y 5 vendedores o menos → 3 (4 si tiene 300+ vendidas) · caro (más de US$60) → 1 · el resto → 2** (la casilla). Lo que
vuela (se agota rápido) entra en el pedido SIGUIENTE con unidades según sus ventas: eso lo decido yo con `pedidostodo`.
Medido antes: del pedido del 21/09, 1 de 12 se agotó rápido (ZX310) y 10 no vendieron nada en 17 días.

## ⏳ SIN REPOSICIÓN: ESTIRAR Y SACAR LA MAYOR PLATA EN 4 MESES (16/10/2026, regla suya)
Él, sobre lo que se agota y no se puede reponer (Nissei no lo tiene, o el precio de Paraguay no deja el %): *"lo mejor seria
una combinacion entre esperar lo maximo posible y maximizar ganancia lo maximo posible en los 4 meses de stock que tenemos.
pero si o si en los 4 meses hay que vender todo. siempre esperando a que se pueda pedir en nissei"*.
 · Se aplica a todo lo que `escasez`/`reponerDe` dice "sin fecha" (Nissei no lo tiene · el precio no da · **Bs As sin nada en la oficina**, regla del 16/10).
 · Con stock fijo, la plata máxima es vender TODO al precio más alto que todavía lo vacía en ~4 meses: el ritmo objetivo es
   (Full + camino + oficina) ÷ ~100 días (colchón contra los 120 en que Full cobra almacenamiento). Si vende más rápido que
   eso, subo; si vende más lento y no llega a vaciarse en 120 días, bajo. Directo al precio que pienso (sin escalones),
   nunca abajo del precio normal de antes, frenos de siempre (barrera $33.000, techo, variantes).
 · Cada vuelta se mira si Nissei volvió a tenerlo o el precio ya da: ahí deja de ser "sin reposición" y vuelve a la regla normal.
 · Y SI APARECE MERCADERÍA NUEVA (16/10, pregunta suya: "si lo consigo por otro lado y aparece en mi oficina, ¿vuelve para
   atrás?"): en cada vuelta comparo oficina + camino contra la vuelta anterior. Si subió sin un pedido de Paraguay que lo traiga,
   (1) la cuenta de los 100 días se rehace con el stock nuevo (más stock → el precio que lo vacía es MÁS BAJO, así que baja solo,
   nunca abajo del normal) y (2) le pregunto si ese proveedor sirve para volver a comprar: si sirve, deja de ser "sin reposición"
   y vuelve a la regla normal (precio normal, o escasez si Full se corta antes de que llegue la caja).
 · Lo que tiene 1-2 unidades no se toca más (ya está arriba): no hay ritmo que medir.

## 💰 MÁXIMO DE COMPRA POR COLOR (16/10/2026, eligió la 1a)
`decido:ped:<id>#<color>=venta|<precio>|motivo` guarda el precio de venta de ESE color (`claudedecide/ped/<id>/pvVars`); el
máximo de ese color sale con el margen de su publicación (`cyc/netopub`). El precio es el que el color sostuvo 2+ semanas con
stock, nunca uno de escasez ni de la primera semana de una prueba de techo. Lo pongo en las vueltas de pedidos cuando los colores
se venden a precios distintos (si no, alcanza el del producto).

## 🔴 ESCASEZ = ROJO, Y SE TRATA COMO ESCASEZ (16/10/2026, regla suya)
*"escasez significa lo mismo siempre (…) en este caso no tenemos fecha siquiera para recuperar stock, va en rojo (…) agrandar el
% de ganancia lo máximo posible"*. Lo que se termina antes de poder reponer, o lo que NO se puede reponer, es escasez: precio
para la mayor ganancia que vacíe el stock a tiempo (sin reposición: en ~100 días, nunca más de 120). Si vuelve a poder
comprarse con 25%, deja de ser escasez solo (naranja/amarillo) y el precio se vuelve a pensar.

## 🔁 TODA DECISIÓN TIENE SU SALIDA (16/10/2026, pedido suyo)
Él: *"si eso no te lo decía yo, ¿te ibas a dar cuenta? puede haber cosas que yo no me di cuenta, no te expliqué, no hay regla
para eso y vos no lo mirás. me gustaría que esté controlado"*. Respuesta honesta: no, no me iba a dar cuenta: las decisiones
viejas sólo se revisaban si una regla las miraba.
 · **En cada vuelta**, el final de `escasez` lista **🔁 mis subas por escasez o sin reposición cuya razón cambió** (ya no se
   corta, ya se puede reponer, entró mercadería nueva, no se vacía en 4 meses, casi no vende). Cada renglón se decide de nuevo.
   Las pruebas de techo ya tienen su control (`lupa`); las bajas, promos y remates todavía no (ver REVISION.md).
 · **Regla para todo lo nuevo:** al crear una regla que cambia un precio o un pedido, escribir también QUÉ la deshace y dónde
   se mira. Si no tiene salida, no está terminada.

## 📦 LAS CAJAS SE DECIDEN EN CADA COMPLETA, NO SÓLO LOS PEDIDOS (16/10/2026)
El 16/10 corrí `decide_pedidos.py` y me salteé `decide_cajas.py`: quedó la decisión del día anterior ("no mandar" del Protector
talón Común Beige, cuando las 18 todavía se estaban armando) y Armar caja no recomendaba mandar algo en escasez de Full con 13
en la oficina. Él lo marcó. En la completa de las 08:52 van LOS DOS scripts sobre el mismo log de `pedidostodo`, y
`decido:archivo=pedidos;go` + `decido:archivo=cajas;go`. Y todo lo que el expediente marca "🔥 Full se corta antes" con
mercadería en la oficina se mira contra la caja decidida.

## 🛡️ APENAS ENTRA EN ESCASEZ, SE PROTEGE HASTA QUE LLEGUE LA CAJA (16/10/2026, regla suya)
Él, viendo que lo subido por escasez se siguió vendiendo: *"me encantó eso (...) quiero que sigas así, y cuando un producto
entre en escasez, ahí nomás lo trates como tal y protegerlo hasta que calcules cuántos días aprox va a tardar en llegar la
próxima caja a Full"*.
 · En CADA vuelta (las 4 del día), todo lo que el expediente marca 🔥 por primera vez se trata en ESA vuelta: no espera a la
   completa. "Ahí nomás" = la próxima vuelta (el robot no toca precios, así que lo más rápido son ~4 h).
 · Para cada uno se calcula cuándo llega la próxima caja a Full: caja despachada ~8 d desde el despacho · en la oficina sin
   despachar ~10 d (y se pide mandarla en Armar caja) · hay que comprar: Paraguay ~16 d · **Bs As se da por repuesto (~1 semana + caja)** salvo que Pedidos lo pida hace 10+ días sin que entre nada a la oficina: ahí "no se consigue" = sin reposición (eligió 1b el 16/10; "oficina en 0" solo hacía un bucle). La escasez se mide SIEMPRE con el ritmo normal, no con el de después de una suba (2a) · sin
   reposición: estirar para venderlo en ~100 días (regla ⏳). El precio se pone para que la última unidad salga cerca de ese día.
 · Se sigue mirando en cada vuelta: si con el precio nuevo vende más rápido de lo pensado, se sube otra vez; si se frenó del
   todo, se baja de a poco. Nunca abajo del precio normal. Al llegar la caja se juzga con la línea de tiempo (no se vuelve a
   ciegas).
 · Y en la misma vuelta se mira Armar caja: si hay mercadería en la oficina de ese producto, se decide mandarla.

## 🎯 AL LLEGAR LA CAJA: EL MEJOR PRECIO ENTRE EL DE ESCASEZ Y EL NORMAL (17/10/2026, regla suya, eligió la a)
Él: *"si el precio está entre los dos? como lo sabes? quizás lo mejor es un poquito menos del precio de escasez"*.
Cuando termina la escasez no se elige entre dos puntos (escasez o normal): se BUSCA el mejor en el medio.
 · Si al precio de escasez sigue dejando igual o más plata por día que con el normal, se queda (como siempre).
 · Si deja menos: NO se vuelve directo al normal. Se baja al punto del medio entre los dos, **arrancando por el tramo de la
   escalera que más plata por día dejó** (los tramos están en la ficha médica de cada publicación; ojo, en escasez la gente
   compra apurada, así que esos números salen algo inflados: sirven para elegir por dónde arrancar, no para decidir).
 · Cada paso se mide con la misma vara de certeza que el techo (Poisson, nunca un solo día, manda la plata por día con stock
   normal): si deja más que el normal, se queda y se prueba un paso más cerca del de escasez; si deja menos, un paso más cerca
   del normal. En 2-3 pasos queda el mejor. Cada baja, primero como promo.
 · Lo encontrado va a `notas/techo.md` como el precio de esa publicación con stock normal.

## 🪜 ESCASEZ: ARRANCAR MUY ALTO Y BAJAR EN ESCALERA (16/10/2026, regla suya, eligió 1a 2b 3a)
Él: *"probemos más del 100% de lo que se vende (...) quizás algo que vendemos por 5.000 podemos venderlo a 25.000, no lo
sabemos (...) es gratis subir precio"* y *"vas bajando en escalera, si no vende o si nos pasamos de escasez a sobrestock"*.
Por qué: en escasez lo que no se vende antes de la caja se vende después al precio normal; subir de más casi no cuesta, quedarse
corto sí. **Se saca el techo ×2** (queda sólo el de $650.000).
 · **Primer salto (1a), según cuánto vendía ESA publicación con stock:** 3+/día → ×4 · 1 a 3/día → ×3 · menos de 1/día → ×2 ·
   menos de 1 cada 2 días → ×1,5 fijo, sin escalera.
 · **Escalera:** si no vende, baja 25% a las 12 h (3+/día) · 20% a las 24 h (1-3/día) · 15% a los 2-3 días (menos de 1/día).
   Si vende más rápido de lo que hace falta para llegar a la caja, sube un escalón. Nunca abajo del precio normal.
 · **A qué productos (2b, con su aclaración):** *"no vayamos con todos, los que tiene sentido subir. los que ya sabemos que no
   funcionan más arriba no"*. Va de una para todo lo que está en escasez y tiene sentido, MENOS: lo que ya falló una suba y
   volví (techo conocido en `notas/techo.md`: Naipes Casino, Centímetro Blanco/Gris, Pendrive 8gb, Infusores, Metatarso,
   Filtros, Chispero, Rebarbador, Pizarras… y lo que se frenó después de una suba), lo que tiene variantes que no se pueden
   subir solas, liquidando y mis promos. Ésos van con el precio que pienso, sin ×3/×4.
   **La caja de compra NO frena la escalera** (corrección suya del 16/10: *"ya dijimos que perder la caja no quiere decir no
   vender"*): de catálogo con competidor con stock también sube; lo que decide son las ventas a ese precio, no la caja.
 · **Barrera $33.000:** se cruza sólo si cada unidad deja más con el envío (~$6.200) restado. Comisión de ML al precio nuevo
   mirada con el `decido` en prueba (escalones de comisión).
 · **Salida:** cuando la escasez se termina (llegó la caja) o pasa a sobrar (el stock dura más que la caja + margen, o quedaría
   con más de 90 días), se baja: primero como promo (PRICE_DISCOUNT), si no con `decido`. Al llegar la caja se juzga con la
   línea de tiempo: si a ese precio sigue vendiendo y deja más, se queda.
 · **Riesgo vigilado:** ML nunca nos pausó hasta el doble; más arriba no se probó. En cada vuelta se mira si alguna quedó frenada
   por ML (`informe`, frenadas) y si pasa, se vuelve al último precio que ML aceptó y se anota.
 · **Medir:** `escmedir` en las completas; el techo encontrado de cada una va a `notas/techo.md`.
 · **Cómo se juzga (16/10, él con el Barbarella):** una suba por escasez NO pierde plata por vender menos: lo que no se vende
   en esos días se vende después. Cuenta sólo lo cobrado de más. La única pérdida real es que llegue la caja y quede stock caro
   que al precio normal se habría vendido: por eso, cuando AL RITMO NORMAL (el de antes de la suba) el stock alcanza hasta la
   caja, vuelve al precio normal para que la última salga cerca del día que llega (lo marca el 🔁 de `escasez`).
 · **Fuera de escasez (3a):** buscar el techo con saltos de +30 a +50% y, si funciona, otro salto (la escalera alta es sólo escasez).

## 📋 LA FICHA DE CADA PUBLICACIÓN SE ABRE ANTES DE DECIDIR (16/10/2026, regla suya, eligió 1a 2a 3a)
Él: *"cada vez que hacés un análisis abrís eso y tenés todo"*. Antes de tocar el precio de una publicación miro su ficha:
la línea `📋 ficha:` del expediente y de `escasez` (lo que no rindió y hasta cuándo, el mejor precio medido, la prueba en curso)
y, si hace falta el detalle, `ficha:<MLA o palabras>` por ml-consulta (cada cambio con su resultado, cada precio que tuvo
con su ganancia por día, mis notas). **Un precio que no rindió no se repite hasta que cambie la razón** (ver 🔓 abajo; máximo 30 días), salvo que
cambie algo grande (escasez, fecha de regalo, competidor sin stock o más caro, costo nuevo) y lo digo en el motivo. Si ya
venció, se puede volver a probar. Él ve lo mismo tocando "📋 Ficha completa" en el 🧠.

## 🔬 EL ANÁLISIS A FONDO: LAS 11, "LO QUE RECOMIENDES" (16/10/2026, eligió la (a) en todas)
Él: *"podemos hacer un análisis en profundo para ver si hay algo más que podamos hacer para hacer rendir al máximo a cada
producto?"* y, con la lista, *"lo que recomiendes"* en las 11. Cada una, en cada vuelta:
1. **Bs As que se corta: 45 días.** `decide_pedidos.py` compra para 45 días lo de Bs As que se cortó 2+ veces en 60 días
   (`cortes N` de `pedidostodo`), vende 0,5+/día y deja 25%+; y lo nuevo que vuela (1+/día en su primera semana). Resto, 30.
2. **Pendrives como familia.** Se juzgan por la plata por día del GRUPO (8/16/32/64/128 de Matías), no de a uno. El de 32 GB
   (se repone) es "el conveniente": el precio más tentador de la escalera. 8 y 16 (no se reponen, ⏳) pueden quedar más
   caros que el de 32 a propósito: así la compra se va a la que se repone y las que no se reponen duran sus 4 meses.
3. **Paulvic.** Pedido fijo cada 15 días, por aroma, para 45 días de su ritmo (`pvped`). Al juzgar la prueba de $21.990
   (19-20/10): si pierde, volver a **$14.950**, no a $14.360 (abajo del escalón de comisión de $15.000 deja más). Si gana,
   la primera a extender es Persea (Luciana, la que más vende).
   **Lo que se pide y no viene, no viene más** (17/10/2026, regla suya): queda anotado en el pedido (`falto`) y el aroma se marca
   `cyc/noconsigo/<prod>/nunca/<aroma>` (lo hace `pvped:llego`): no se vuelve a pedir y cuenta como sin reposición (⏳). Se saca
   sólo si él lo vuelve a pedir o con `pvped:nunca:-<aroma>;go`. Primeros: Acqua, Indigo Mujer y Miss Mujer (pedido del 06/10).
   **El costo del Paulvic es el del ÚLTIMO pedido** (17/10/2026, regla suya): (lo pagado —o la calculadora— + flete) ÷ (lo que
   llegó + testers + regalos que sean perfume). Testers y regalos perfume se venden al costo, por eso entran en la división.
   Lo hace `pvped:llego`/`pvped:pago`/`pvped:costo:<id>;apagar=;flete=;tester=;regalo=;go`, con el costo viejo congelado en sus meses.
4. **Las visitas cortan antes una prueba de precio mala.** En el techo/lupa: si las visitas de 3 días cayeron a la mitad
   o menos de las de los 14 anteriores **y** cambió la caja, se vuelve en esa misma vuelta, sin esperar las ventas. Siempre
   con una hermana sin cambio como control (si la hermana también cayó, es la temporada).
5. **Stock antiguo.** Lo que paga o va a pagar stock antiguo (`antiguo`, ahora también con las ventas de 30 d) es excepción
   del 🛡️ 25% y no entra en buscar el techo: se le pone descuento propio (`!piso`) para vaciarlo antes del cierre. "Sobra"
   = Full + oficina + camino en todas las reglas. Antes de retirar algo de Full, comparar el retiro contra rematarlo al 0%.
6. **Una suba no se deshace por casualidad.** En lo que se compra de a muchos se cuentan COMPRADORES (no unidades) y se
   esperan 7 días como mínimo, salvo certeza fuerte (Poisson) o el corte por visitas del punto 4.
7. **Lo barato: piso en pesos.** Al reponer o tocar algo de hasta ~$5.500, cada unidad tiene que dejar ~$1.000 o más de
   ganancia (el cargo fijo de ML ~$1.230 se lleva más que nosotros). Si no, subir (de una, regla del 13/10) antes de que entre la caja.
8. **Premium que gana la caja se queda en Premium** (Ferrari Rojo, Dalí: la gemela Clásica vendió 0). Una Clásica gemela
   nunca al precio de su Premium. Cuando ganar la caja pide bajar más de ~17%, conviene probar un gemelo Premium (lo crea él).
9. **Visitas que caen sin cambio de precio** (Adaptador Universal de Ayelen 21→7/día): mirar preguntas sin responder y la
   descripción; eso lo arregla él en ML y se le pasa en el `pregunto:`.
10. **Lo que vuelve de agotado** se compara contra el ÚLTIMO tramo con stock de su línea de tiempo (no contra 30 días en
    cero): así entra en el techo y en la lupa.
11. **Lista de Tito: "SÓLO estos colores, si no hay no reemplazar"** (lo agregan `decide_pedidos.py` y el 📋 Copiar pedido).

## 🌎 VENDEDORES DEL EXTERIOR (16/10/2026, regla suya)
No se miran (los saca `esOfertaDeAfuera`), salvo que no haya ningún vendedor de acá: ahí se mide contra el de afuera con su precio +20% (`RECARGO_INTER`), porque el comprador espera ~10 días.

## 🏷️ UN DESCUENTO POR "SOBRA STOCK" SE MIDE CON DÍAS CON STOCK (16/10/2026, error mío marcado por él)
Él, con el Ferrari Rojo vendido al 14% con descuento propio: *"tenemos stock justo y bastante tiempo para los 4 meses"*.
El 13/10 le puse descuento creyendo que sobraba, pero la mercadería había entrado el 08/10: 5 días con stock no dicen nada.
Regla: antes de un descuento por sobrestock, (1) 30+ días con stock desde la última entrada y (2) días de stock (Full +
oficina ÷ ritmo con stock) arriba de ~100. Si no, no se descuenta. Ferrari Rojo: 17 u., ~7/mes = ~70 días → se sacó el
descuento ($63.890 → $70.990). Revisadas las otras del 13/10: Tendedero (13 u., 58 días en Full, ya paga almacenamiento)
queda con descuento; Centímetro y Pendrive 16 no tenían.

## 🏬 BS AS NO SE DA POR REPUESTO (16/10/2026, regla suya)
Él: *"vos ahí estás pensando que en Bs As vamos a traer. pero a veces no se consiguen por meses. entonces lo de Bs As mirá si
hay en la oficina, si en la oficina no hay tomalo como en Paraguay cuando no hay stock o no da el % de ganancia"*.
Para escasez y precio: lo de Bs As con unidades en la oficina → la reposición es mandar esa caja (~10 d). Sin nada en la
oficina → sin reposición (regla ⏳): precio para vender lo que hay en ~100 días, al más alto que lo vacía.
Aclaración suya del mismo día: *"más importante que la escasez son los 4 meses para pagar. nunca tenemos que llegar a pagar
por stock"*. O sea: aunque haya stock para 1 mes, sin nada en la oficina se trata como escasez, y el techo de todo es vender
lo que hay antes de que Full cobre almacenamiento (~120 días; se apunta a ~100).

## 🏷️ CADA PRECIO LLEVA SU ESTRATEGIA (17/10/2026, pedido suyo)
Todo `decido:<MLA>=<precio>` va con `#<estrategia>` (si falta, se deduce del motivo y puede errar): `base` · `escasez` · `sinrepo`
(no se consigue, 4 meses) · `techo` (prueba de suba) · `liquidando` · `caja` · `promo` · `fecha` · `excepcion` · `nuevo` · `correccion`.
Cambiar sólo la estrategia, sin tocar el precio: `tag:<MLA>=<estrategia>|motivo;go`. Se ve en cada venta de Ventas x Producto.
Cada suba de techo seguida se cuenta sola en la web (📈 buscando techo ×2, ×3…, pedido suyo del 17/10): toda suba de techo va con `#techo`.

## 🔓 EL FRENO DE TECHO CON FOTO DEL MERCADO (17/10/2026, pedido suyo)
Él: *"y si el que pone el techo se queda sin stock o aumentó, se podría subir y perdemos 60 días sin mirar"*. El "no probar más
caro" ya no es un calendario fijo de 60 días. Cada vez que vuelvo una prueba que perdió: `techofreno:<MLA>=<precio probado>|motivo;go`
(ml-sync), que guarda la foto del mercado ese día (más barato ajeno, cuántos ajenos abajo del probado, caja). En CADA completa
corro `techofreno` (ml-consulta, solo lee): **🔓 REABRIR** si el más barato ajeno subió 8%+, ya no hay ajenos abajo del precio
probado, no queda ningún vendedor ajeno, pasamos a ganar la caja, o pasaron 30 días. Lo reabierto se vuelve a probar ese día
(`decido`) y se saca el freno (`techofreno:-<MLA>;go`). Sin catálogo sólo se reabre a los 30 días.

**Paraguay: el piso para pedir es 25%, no 24%** (17/10/2026, regla suya: *"tienen que llegar a 25, no a 24"*). Nuevos, perfumes y probados.

- **Escasez con mercadería en la oficina: decidir la caja en la MISMA vuelta (17/10/2026, él con la Piedra Gua Sha).** Si un producto entra en escasez y hay unidades en la oficina, además del precio se decide la caja (`decido:caja`) en esa vuelta. Si venía lento (días con stock sin vender), se manda poco (lo justo para no quedar en cero y medir si el ritmo nuevo se sostiene), no todo lo de la oficina.

## 🧨 REMATAR A CUALQUIER PRECIO: `!bajocero` (18/10/2026, regla suya)
Él, con las 10 Tiras Led de Luciana que pagan stock antiguo: *"liquidá las 10 tiras led. al precio que sea"*. El "nunca abajo de 0%"
sigue siendo la regla; la única excepción es cuando ÉL pide rematar algo a cualquier precio: `entrarpromo:<MLA>=<precio>@PRICE_DISCOUNT!piso!bajocero|motivo;go`.
Nunca se usa por decisión propia.

## ⚖️ LA PLATA POR DÍA ES NETA DE TRABAJO, TOPE Y CAPITAL (18/10/2026, eligió la a)
Él: *"al vender menos se trabaja menos (…) se llena menos el monotributo (…) más plata que se invierte en otro lado (…) prefiero ganar
menos en ese producto pero nos da por otro lado"*. Toda comparación de precios (techo, escasez, volver, bajar) se hace con la plata por
día MENOS: **$100 por unidad vendida** (sólo el TIEMPO: comprar, contar, etiquetar, armar cajas; la caja y los reclamos ya están en el costo de cada ficha, contarlos de nuevo sería doble) · **3% de lo facturado** (lo que gasta del tope de H) · y,
al decidir, **2% por mes sobre el costo del stock** que queda parado. A igual plata neta gana el precio alto. La ficha médica ya mide
así (`PD_TRABAJO_U`, `PD_TOPE_PCT` en sync.mjs). Los números se pueden ajustar si él dice otra cosa.

## 📉 ABAJO DEL 25% ES PÉRDIDA, AUNQUE DEJE GANANCIA (18/10/2026, regla suya)
Él, con el Pendrive 128gb rematado al 13% por haber mandado de más: *"todo lo que es menos del 25% es pérdida en el contexto del
que estamos hablando"*. O sea: el 25% es lo que el negocio necesita; vender abajo es perder la diferencia contra lo que se podía.
Se acepta sólo cuando la alternativa es peor (stock antiguo, parado de verdad), y en el 🧠 y en los juicios se cuenta como
pérdida: "deja $X, contra el 25% pierde $Y por unidad". Ejemplo: Pendrive 128gb a $35.940 deja ~$3.600/u; al 25% serían
~$5.200/u → ~$1.600/u perdidos por haber mandado 48 de algo que vende 1 cada 4 días (≈$70.000 las 44). La causa se
arregla en la cantidad que se manda (37 días, tope 90), no en el precio.
**Corrección suya del mismo día: esa pérdida NO es del cerebro.** *"si hay algo que el cerebro bajó porque seguir como estaba iba a
ocasionar más pérdidas, entonces el cerebro ganó plata aunque esté por debajo del 25% (…) la culpa no fue del cerebro, fue mía al
mandar mucho"*. O sea, son DOS cuentas separadas: (1) la decisión del cerebro se juzga contra NO HACER NADA (stock antiguo +
plata parada 2%/mes + ventas perdidas): si deja más que seguir igual, GANÓ, aunque esté abajo del 25%. (2) Lo que falta para el
25% es el costo del error de origen (mandar o comprar de más) y se anota a ESA causa, no al precio.

**Etiqueta (18/10, pedido suyo):** lo que se baja por eso va con 📦 `sobra` (sobra stock), nunca 🎯 base: base es sólo 25%+ sin otra estrategia.

## 🛒 EL % DE UN PRODUCTO NO SE MIDE CON CARRITOS (18/10/2026, regla suya)
Él: *"no podés subir el % de un producto, por venderse con otro. se tiene que poner siempre el % de ese producto. no por venta"*. En un carrito ML cobra el cargo fijo una vez y el neto se reparte, así que cada producto se ve más rentable. Para juzgar un producto (precio, techo, pedido) se usa lo que deja vendido SOLO; el ahorro del carrito no es mérito del producto. En la web: `netoProductoVP` (línea de tiempo y ranking).

## ⚡ CADA VENTA ES UN DATO: SI SE ACELERA, MANDA EL RITMO RÁPIDO (18/10/2026, eligió la a, con el Cabotine Turquoise)
Él: *"en 10 días de stock vendió 4, no era lento (…) la primera venta te dio info de que a ese precio vende (…) tenías dos opciones,
aumentarlo para buscar el techo o mantenerlo, la mejor era aumentar (…) en la segunda venta ya confirmaste (…) y el producto entró en
escasez, ahí SÍ O SÍ hay que aumentar, por escasez y para buscar techo. No lo hiciste"*. Error mío: lo medí con el ritmo de 2 meses
(1 cada 10 días) y no con lo que estaba pasando. Desde hoy:
 · `escasez` mide con el ritmo de los últimos 7 días (con stock) si vendió 2+ u. y el doble o más que el de 30 d (⚡ en el renglón).
 · Lo que tiene pocas unidades se rejuzga con CADA venta: la 1ª dice que a ese precio vende → si lo que queda se vende en pocos días
   contra lo que tarda reponer (o contra los 4 meses si no hay reposición), se sube a buscar el techo; la 2ª que confirma el ritmo
   y deja el stock en escasez → se sube SÍ O SÍ en esa vuelta (escasez + techo). No se espera a la completa.

## 🚨 NUNCA MÁS UNA ESCASEZ SIN DECIDIR (19/10/2026, regla suya: *"quiero que nunca más vuelva a suceder eso"*)
`escasez` termina con la lista **🚨 ESCASEZ QUE VENDIÓ DESPUÉS DE MI ÚLTIMA DECISIÓN**. Cada renglón se decide EN ESA VUELTA (las 4
del día): subir con `decido` (escasez + techo, directo al precio que pienso) o, si a propósito se queda, una nota con el motivo
(`decido:<MLA>=nota|…`). La lista tiene que quedar vacía al terminar la vuelta. En el chat: "🚨 N → N decididas".

## 📦 SOBRA STOCK: SE DETECTA SOLO, COMO LA ESCASEZ (19/10/2026, regla suya con el Timer)
Él: *"este no lo habías puesto como sobra stock cuando claramente sí lo estaba. Lo pusiste porque te dije yo (…) la idea es que sea
automático y sin errores y dándose cuenta de las situaciones"*. La `planilla` termina con **📦 SOBRA STOCK Y NO LO DECIDÍ**: más de
90 días de stock en Full al ritmo de hoy (o sin ventas en 60), sin estrategia de sobra/liquidando/promo y sin nota mía en 7 días.
Cada renglón se decide EN ESA VUELTA de la completa: promo propia o de ML (escalera, mismo neto), retiro si conviene, o nota con el
motivo (ej. "1 u., no llega al cobro de stock antiguo"). Lo llegado hace menos de 30 días va aparte como lanzamiento. La lista tiene
que quedar vacía. Y al revés de lo que ya hacía: *ningún* producto espera a que él lo vea.

## 🧴 PAULVIC: PEDIDO REDONDO (19/10/2026, regla suya)
"Siempre el pedido recomendado redondearlo al número más cercano: 3, 5, 10, 20, 50". La web lo redondea sola por aroma
(`pvRedondo`); lo que él cambia a mano no se toca. Y nunca más "Sólo este color: si no hay, no lo cambies por otro" en los motivos ni en el copiar ("queda feo").

## 📤 CUANDO ÉL RETIRA UNIDADES DE FULL, SE REHACE EL PRECIO (19/10/2026, regla suya)
Con el Pendrive 128 (sacó 34 de Full para defender el precio y yo dejé el descuento de antes): *"ya sabés cuántas se venden en
promo, entonces mirá las unidades, mirá cuántos días de stock quedan en promo y cuántos días faltan para pagar stock. Ahí poné la
promo para sacarlos"*. Cada retiro (sale en la planilla como `withdrawal`) se mira en esa vuelta: unidades que quedan ÷ ritmo a
cada precio (el de promo y el normal, medidos) contra los días que faltan para el stock antiguo. La promo es la justa para
vaciarlas antes de esa fecha, no la de antes del retiro. Si a precio normal ya salen a tiempo, sin promo.
Caso: 8 u., 57 días, a $35.940 vendía 6 por día (se iban en 2 días) y a $41.990 ninguna en 6 días → descuento mínimo a $39.890.

## 🔥 "ESCASEZ" QUIERE DECIR QUE SE SUBE EL PRECIO (19/10/2026, regla suya con las Cartas Casino)
Él: *"quiero que cada vez que diga escasez el precio aumente, si no aumenta por x o por y quiero que sea otro nombre/tag/estrategia"*.
Escasez = se corta antes de que llegue lo de camino u oficina (o antes de poder comprar) → el precio SE SUBE en esa vuelta y el
tag es `escasez`. Si hay poco en Full pero la caja en camino o la oficina llegan a tiempo, NO es escasez: la línea de tiempo
dice "🚚 cubierto" y el precio no se toca. Si algo sale como escasez y decido NO subirlo, el tag no puede quedar `escasez`:
va otro (base, techo, sobra…) con el motivo en el 🧠.

## 💸 PROMO ES CUANDO ML PONE PLATA; SI PONEMOS SÓLO NOSOTROS ES DESCUENTO (19/10/2026, regla suya)
Él: *"promo que sea cuando ml tambien pone plata, si ponemos solo nosotros es descuento un tag nuevo"*. Tag 🏷️ `promo` sólo cuando
ML pone parte del descuento; el descuento propio (PRICE_DISCOUNT) o una promo de ML donde ML no pone nada es 💸 `descuento`.
`entrarpromo` lo elige solo; en cada venta manda lo que pasó en esa venta (`cyc/promoventa`).

## 🏷️ LOS PASAJES DE PRECIO TIENEN NOMBRE · Y NADA QUEDA SIN AFINAR (19/10/2026, eligió 1a 2a 3a)
Tags nuevos: 🏔️ techo encontrado · 🪜 bajando (escalera) · ↘️ volviendo al normal (llegó la caja / pasó la fecha / se consigue de
nuevo) · ↗️ volviendo de sobra · 🧨 remate total (abajo de 0%, sólo si lo pide él). "↩️ corrección" desaparece: lo que "vuelve" se
nombra según el tag anterior (`pasajeDe` en sync.mjs = `estrategiaPasaje` en index.html). Cada chip dice "· de X" cuando venía de
otra estrategia (no se muestra si venía de 🎯 base) y la escasez lleva escalón como el techo. Al poner un tag con `decido`, usar
`#techook`, `#bajando`, `#volviendo`, `#desobra`, `#remate` cuando corresponda.
**Y la lista 🔎 SIN AFINAR de `planilla`** (pregunta suya: *"¿con eso vamos a evitar que dejes pasar productos que no estén afinados
al máximo? (…) productos que nunca se buscó techo"*): toda activa que vende (2+ en 30 d), con stock para 14-90 días, en 🎯 base o
🆕 lanzamiento y sin prueba de techo (📈/🏔️/🪜) en 60 días. Se decide en la completa (probar techo o nota con motivo, vale 7 días)
y tiene que quedar vacía, igual que 🚨 escasez y 📦 sobra. Las tres listas juntas cubren: lo que se agota, lo que sobra y lo que
está quieto en su precio normal.
**Corrección suya del mismo día:** *"si el modista encontró techo que lo marque en la línea de tiempo (…) aplicarlos a todos. Si no tiene
línea de techo o alguna otra explicación como sobrestock, tiene que entrar en buscar techo"*. Todo techo encontrado se anota SIEMPRE
con `#techook` (la línea de tiempo lo pinta 🏔️) y la lista 🔎 ya no deja afuera lo de menos de 14 días: lo único que la saca es un
tag que explique el precio (escasez, sobra, promo, etc.) o una prueba de techo en 60 días.
**Y SE ELIMINÓ 🎯 BASE (19/10/2026, él: *"la forma más fácil es eliminar el tag de base, entonces obliga a tomar alguna estrategia sí o
sí"* y *"todos los productos tienen que tener tag/estrategia"*).** No existe más un precio "normal" sin nombre. Lo que no tiene
estrategia se ve ⚪ sin estrategia (para decidir) y lo que no tiene stock en Full ⏸️ sin stock (el precio espera la caja). `decido`
rechaza un precio nuevo sin estrategia (`#tag` o un motivo que la nombre; `!piso` solo = 🛡️ excepción). Las anotaciones viejas
"base" se leen como ⚪. Lo vendido estable en su mejor precio es 🏔️ techo encontrado, no "base". La lista 🔎 de `planilla` saca
TODO lo activo con stock en ⚪ (y 🆕) sin prueba de techo en 60 días, venda o no; lo que no vende y sobra va por la 📦.
**🏔️ SÓLO CON 95% DE SEGURIDAD (19/10/2026, regla suya: *"tenés que estar 95% seguro de que el techo es ese antes de marcarlo como
techo encontrado (…) los que no tienen suficiente info volver a buscar techo hasta estar 95% seguro"*).** Se mide con `techo95` (solo
lee; `;go` anota): techo = precio de hoy; arriba = días con stock a un precio 2%+ más alto. Para dejar la misma plata por día arriba
tenía que vender r0 × gan0/gan1; si vendió tan poco que eso tiene menos de 5% de chance (Poisson) → 🏔️ anotado el día que terminó la
prueba de arriba, con el porqué (la línea de tiempo lo marca con una raya 🏔️). Si no llega → 📈 buscando techo y en la vuelta pongo
la prueba con `decido`. **Nunca anotar #techook a mano sin pasar por `techo95`.** Corre en cada completa sobre todas las 🏔️.
**LAS TRES RAYAS DE CADA PRECIO (19/10/2026, pedido suyo):** la línea de tiempo marca 🔴 techo (donde ya no rinde, 95%), 🟢 piso (el
precio más alto que sí vende) y 💰 el que más plata por día dejó. Lo que no se sabe se dice ("falta probar más caro"); con sobrestock no
se busca techo (primero sale lo que sobra). **Todo producto tiene que llegar a tener las tres**: si falta el 🔴, la estrategia es buscar techo.
**PISO = EL PRECIO DE MÁS PLATA (19/10/2026, él: *"el piso es para decir no bajemos más que esto, excepto que haya un problema (…)
quizás lo mejor es unificarlas"*).** Una sola raya 💰 piso: el precio que más plata por día dejó (5+ días con stock). No se baja de ahí
salvo sobrestock, stock antiguo u otro problema dicho en el 🧠. Arriba la 🔴 techo; entre las dos es lo que falta probar.
**STOCK ANTIGUO: CONFIRMAR ANTES DE BAJAR (19/10/2026, error del Paulvic Scarf).** Antes de bajar por stock antiguo, mirar en la línea de
tiempo que el stock NO haya estado en cero después de la fecha del lote: si estuvo en cero, esas unidades ya se vendieron y lo que hay es
nuevo. El robot ya lo descarta (`lotesFifo` con `desdeCero`), pero la decisión se revisa igual.

## 📈 TECHO Y ESCASEZ QUIEREN DECIR QUE EL PRECIO SUBE (19/10/2026, él con la Batidora negro)
Él: *"dice buscando techo, pero no aumentó nada"*. Un tag 📈 techo o 🔥 escasez con el precio bajando o quieto es mentira.
`decido` que BAJA con #techo/#escasez lo guarda como 🪜 bajando (la escalera de escasez es bajando). `planilla` termina con
**📈 DICE TECHO/ESCASEZ Y NO SUBE** (último cambio fue baja, o 2 días sin subir desde el tag): se decide en la vuelta (otro
escalón para arriba, o el tag que corresponde) y la lista queda vacía. Primeros 3: Batidora negro → $19.990 a probar ·
Talonera Triples y Brisa Marina → 🪜 bajando.

## 🎄 NAVIDAD: PEDIR PARA 45 DÍAS A MEDIADOS DE NOVIEMBRE (20/10/2026)
En la completa del 14/11 (y las de esa semana): medir qué subió en Navidad 2025 (17-30/12 contra el ritmo normal) y pedir esos
productos para 45 días en vez de 30. Lo demás sigue con 30.

## 🤔 ¿TIENE SENTIDO ESTE DESCUENTO? ANTES DE PONER CUALQUIERA (20/10/2026, eligió la 2.1a)
Pasó con los Victoria's Secret: puse descuentos que dejaban 9 publicaciones abajo del 25% y a 3 recién llegadas (04/10) que ganaban la
caja. Antes de `entrarpromo` (propio o de ML) se chequean las tres, y si alguna falla no se pone:
 1. **Sobra de verdad:** más de 90 días de stock en Full al ritmo con stock (no al de 30 d con días en cero).
 2. **No es recién llegado:** menos de 30 días desde que entró la caja = no se descuenta (todavía no se sabe a qué ritmo vende).
 3. **Queda en 25% o más en el peor caso.** Abajo de 25% sólo con un motivo dicho en el 🧠 (stock antiguo con fecha encima, remate que él pidió).
Ganar la caja y vender bien sin descuento = no hay nada que descontar.
