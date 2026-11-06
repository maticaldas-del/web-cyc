# EXTRACTO DE MERCADO PAGO → CLAUDE (todos los días, en las 4 cuentas)

Matías quiere que Claude reciba el **extracto de cuenta completo** ("Todas las transacciones") de las 4 cuentas de Mercado Pago
(Adriana, Luciana, Ayelen y Matías) **sin que él tenga que pasarlo**. Vos lo bajás y lo pegás en el panel, donde queda cerrado con candado:
sólo el robot lo puede abrir, y guarda únicamente lo que rindió la plata y si el saldo cierra.

**Período (06/11/2026, él: "todos los días… así vamos paso a paso"):** TODOS LOS DÍAS, dentro de la rutina, **del día 1 del mes en curso
hasta hoy** (en el panel el período es `AAAA-MM`, ej. `2026-11`). Siempre el mes ENTERO hasta hoy, no sólo el día: el robot reemplaza el
del día anterior. **Los días 1 a 5 del mes, además el mes anterior entero** (del 1 al último), con su período (ej. `2026-10`), así queda cerrado.
Si Matías pide otro período, ése.

## 1 · Bajarlo (cuenta por cuenta)
1. Entrá a Mercado Pago con esa cuenta.
2. **Tu negocio → Informes y facturación → Reportes de ventas y extractos de cuenta.** Si el menú cambió de nombre, buscá el reporte
   **"Todas las transacciones"** o **"Extracto de cuenta"**: es el que trae una columna de **saldo** en cada renglón.
3. Elegí **Todas las transacciones** y el período.
4. **Crear reporte** y, cuando esté, **Descargar en CSV** (no Excel). Queda en Descargas.

## 2 · Pasárselo a Claude (cerrado)
1. Abrí el archivo en una pestaña nueva de Chrome: en la barra de direcciones escribí `file:///` + la ruta de Descargas + el nombre del
   archivo (ej. `file:///C:/Users/<usuario>/Downloads/<archivo>.csv`). Tiene que verse el texto con columnas separadas por `;` o `,`.
   - Si Chrome no te deja abrirlo (dice que no tenés permiso), avisale a Matías: tiene que activar **"Permitir el acceso a las URLs de
     archivo"** en la configuración de la extensión de Claude, una sola vez.
2. **Ctrl+A** (seleccionar todo) y **Ctrl+C** (copiar). No leas ni copies nada de su contenido en ningún otro lado.
3. Andá al panel → **Mi oficina → Contar lo que hay → abajo de todo, abrí "🤖 Chat de Chrome y Claude" → "🔒 Archivo para Claude"**.
4. Elegí la **cuenta**, escribí el **período** (ej. `2026-10` o `2026-01 a 2026-10`), pegá con **Ctrl+V** en el cuadro grande y tocá
   **🔒 Guardar cerrado para Claude**. Tiene que salir el cartel "🔒 Guardado cerrado (… KB, <cuenta>)".
5. Repetí con las otras 3 cuentas.
6. Borrá los 4 archivos de Descargas (tienen nombres de otras personas).

**UNA VEZ (06/11/2026): volver a pegar agosto, septiembre y octubre de las 4 cuentas** (período `2026-08 a 2026-10`): el robot ahora separa cada
movimiento por tipo (ventas, rendimientos, impuestos, cargos, devoluciones) para compararlo con el panel, y los que ya se pegaron no lo traían.
Si en Gastos del mes de un mes sale "🔎 hay que volver a pegar el extracto", hacelo para ese mes. Dejá el mensaje `EXTRACTO 2026-08 a 2026-10: …`.

## Reglas
- **El archivo tiene nombres de otras personas. NO copies nada de su contenido en ningún lado**: ni en el buzón, ni en el chat,
  ni en "Para el robot". Sólo en el cuadro 🔒, que lo cierra con candado.
- No toques nada más en Mercado Pago (ni transferencias, ni configuraciones).
- Si una cuenta no deja entrar, el reporte no aparece o el cartel del panel da error, seguí con las otras y avisá.

## Al terminar
- Dejá en el buzón (el mismo lugar, "📬 Mensaje para Claude") un mensaje que EMPIECE con `EXTRACTO <fecha de hoy>` y diga sólo cuántas
  cuentas guardaste (ej. "EXTRACTO 2026-10: 4 de 4 guardados en 🔒"). **Sin montos ni nombres.**
- El robot los procesa solo en la hora siguiente; en Gastos del mes el renglón 📄 del extracto se tilda solo con lo que rindió.
