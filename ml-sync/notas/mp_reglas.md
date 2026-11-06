# Cómo leer el extracto de Mercado Pago (lo que me explica Matías, 06/11/2026 en adelante)

Lo uso cada día al mirar el extracto (CLAUDE §8). Sin montos de terceros ni nombres de otras personas: sólo reglas.

1. **Transferencias a Matías o a Tito (desde cualquiera de las 4 cuentas) = juntar la plata para comprar mercadería** (06/11, él: *"se compra
   mercadería, ya que transferimos a cuentas y necesitamos tenerlo todo junto"*). NO son retiro ni gasto: es plata de CYC que cambia de lugar.
   Lo que importa es que lo comprado con esa plata esté cargado como compra (Paraguay, Bs As, listas, Paulvic). El retiro es sólo el automático del mes.
2. **Correo Andreani (~$16.000-17.500 por pago) = mandar una caja a Full** (06/11, él: *"esos gastos se agregan al costo de los productos, ya que es cuando mando un producto a full… embalaje"*). Ya está dentro del costo de cada producto (Envío+embalaje de la ficha, `costoCaja` $17.500): NO es gasto aparte. Medido ago-oct: 46 pagos, ~$17.300 c/u (coincide). Si el promedio se aleja más de 20% de `costoCaja`, avisar para actualizarlo (`cajacosto`).
3. **Peajes (AUSA, AU Oeste, Corredor Vial, Rutas Sur, TelePASE) = de la perfumería: CYC le paga el peaje y la perfumería se lo devuelve** (06/11, él: *"si cyc le paga el peaje a la perfumería y la perfumería debe devolverle el dinero. o sea agregar a deuda perfumería mercadopago"*). Cada día: `debenmov:deuda perfumeria=+<peajes del día>|peajes <fecha>;go`. Desde noviembre (hasta octubre lo descontaba él a fin de mes).
4. **Nafta (YPF y otras) = personal** (3b). 5. **Tarjeta de crédito = personal** (4a). 6. **Súper, aeropuertos, colegio, compras en ML = personal** (6a).
7. **Sancor: una sola persona, uno por mes, y llevarlo corto** (06/11, él: *"uno solo tiene sancor… correspondería uno por mes"* y *"no, puede que se pague dos veces también. por eso hay que estar seguro"*): desde noviembre el gasto de Sancor = el pago real de MP de ese mes; dos pagos en un mes NO se suponen atrasados: se le pregunta (⚠️ en Gastos, `_mpPagadoHTML`). Ago: 152.716 + 90.192 (04/08, cuenta Matías) · sep: ninguno · oct: 110.814 + 163.046 (03/10, Adriana) contra cargado 65.227 / 97.819 / 110.814.
8. **Transferencias a personas = de todo** (proveedores, personal, perfumería, mercadería) (06/11, él: *"día a día me preguntás de qué fue y te explico… al principio no debemos equivocarnos ya que es plata"*): cada una nueva se le pregunta (lista de las 12:30) hasta que el nombre ya esté aprendido. Los nombres aprendidos NUNCA al repo en claro.
9. **Transferencias recibidas = ventas del local (perfumerías/Tienda) o movimientos entre nosotros** (8b): cruzarlas con las deudas cargadas antes de contarlas como plata nueva.

## Cómo se mira cada día (06/11/2026, él: *"que no me mande cosas dos veces y que no falten cosas a analizar"*)
- Sólo días COMPLETOS (hasta ayer) y sólo los posteriores a "Analizado hasta" de cada cuenta (abajo): así nada se mira dos veces ni queda afuera.
- Al terminar, se sube la fecha de cada cuenta acá en el mismo commit.
- Lo que sale: gastos sin cargar (con su ✓ de pagado en Gastos), peajes → deuda de la perfumería, ingresos que no son ventas de ML (se cruzan con las deudas), transferencias a personas que no conozco → preguntas en la lista de las 12:30 (una sola vez cada una).

### Analizado hasta
- Adriana: 2026-10-31 · Luciana: 2026-10-31 · Ayelen: 2026-10-31 · Matias: 2026-10-31
