# Correcciones suyas (pedido del 20/10/2026: que no tenga que corregirme en nada)
Cada corrección: fecha · qué · por qué pasó · qué cambié. Los lunes se cuentan las de la semana.

| fecha | qué me corrigió | por qué pasó | qué cambié |
|---|---|---|---|
| 19/10 | Iscos: medí perfumes contra un solo vendedor inflado ($96.000) cuando el precio real era ~$20.000 | faltó el cruce de sentido común (el 50 ml estaba mucho más barato) | regla 🧐 ¿tiene sentido? en CEREBRO.md · 1 vendedor = para revisar |
| 19/10 | Ventas en el celu aplastadas | error mío de pantalla (v25.00, probé con 3 tarjetas) | v25.05 · probar con muchas |
| 20/10 | Tendedero: "¿por qué no lo bajamos?" | — (no fue error, pidió revisar) | no cuenta |
| 20/10 | Ferrari Rojo: dije que la Premium no sumaba ventas; las Clásicas llevan 88 d sin vender y la Premium vendió 2 en 30 | comparé las publicaciones entre sí y no contra qué pasaba SIN la Premium | pregunta 21 en preguntas.md · busco más productos para gemela Premium |
| 20/10 | Cuba Platinum (y en la misma vuelta Cuba Classic, Halloween Man y Adyan): bajé lo recién llegado sin techo medido, con toda la info a mano | no fue falta de dato: dos reglas chocaron ("ganar la caja" contra "lo nuevo no baja sin 🏔️ al 95%") y ganó la equivocada; los ayudantes y el revisor leen el mismo texto, así que tienen el mismo punto ciego | freno en el código (`decido` no baja lo nuevo sin `techook`) · `bajasnuevas` encontró las 5 · los dos Cuba volvieron a $50.000 · pregunta 22 |
| 21/10 | Adaptador 8 en 1: (1) el 13/10 subí $19.990 → $27.990 sin medir el escalón · (2) el 16/10 volví $27.990 → $19.990 de golpe · (3) el 18/10 bajé a $17.990, abajo del 💰 piso $18.220 · (4) la raya "a $27.990 ya no vende" salía como segura con 1-2 días y 0 de ~2,7 esperadas | (1) y (2) son de antes de la regla de la escalera (18/10, nació de este caso); (3) el redondeo a 990 lo empujó abajo del piso y nadie lo frenó; (4) la raya de `techofreno` no se medía | (3) vuelto a $18.290 · (4) v25.55: la raya dice "N% seguro" o "sin certeza" · frenos de piso y escalera en la reconstrucción del cerebro · pregunta 23 |

- 20/10/2026 · Ventas vivas apagadas un día: al agregar atributos a la tarjeta de venta (v24.86) se rompió `vivaEnvolver` en silencio. Pregunta general: ¿qué otra cosa depende del texto exacto de una etiqueta HTML?
- (22/10) Bajé 3 Protectores de talón sin línea de techo usando la familia como certeza (!sinlinea). Él: "si no encontró techo, ¿por qué bajó?". Cada variante sola; !sinlinea sólo para error de precio. Deshecho el mismo día.
