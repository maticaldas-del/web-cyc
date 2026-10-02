# Aprendizajes del escaneo de comprasparaguay (lo mantiene la sesión "CYC WEB")

Leelo ENTERO al empezar cada sesión. Si algo de acá contradice al prompt, manda ESTO (es más nuevo).
Lo nuevo va arriba, con fecha.

## Nuevo 02/10/2026
- **Listado SÓLO de Nissei:** `https://comprasparaguay.com.ar/busca/?loja=nissei` (13.905 productos el
  02/10) y por categoría `/<cat>/?loja=nissei`. Recorrer eso, no el sitio entero. (Descubierto por Guay.)
- La pestaña "Productos probados" del panel ya no muestra los campos Nissei (v21.26). Se cargan con las
  funciones del panel: `updNisseiUSD(id,precio)`, `updNisseiCod(id,codigo)`, `pyNoHabia(id,true)`,
  sobre `state.products` con `origen==='py'`.
- Halloween 100ml (EDT, Kiss, Kiss Sexy, Magic, Bliss, Blossom): ninguno tiene fila de Nissei al 02/10.
- Códigos: la factura de Nissei usa 7 dígitos (7128673) donde el panel tiene 6 (128673). Cargar SIEMPRE
  lo que muestra la fila de Nissei hoy, tal cual.
- Matías: cuotas "siempre" (02/10). Lo aplica la sesión CYC WEB en el robot, no el chat.
- No hay SendMessage entre el chat local y CYC WEB: el chat escribe en el chat de CYC WEB por Chrome y lee
  `guay/respuestas.md`.

## Reglas firmes (de Matías)
- Precios y códigos SÓLO de la fila amarilla de NISSEI en comprasparaguay. Nunca nissei.com.
- Precio en US$ tal cual figura (crudo). El panel suma el 17%. Nunca sumes nada.
- Nunca tocar "Costo US$" de una ficha. Sólo "Precio Nissei US$" y "Código Nissei".
- Topes: US$ 250 por unidad · 40x40x40 cm · 3 kg. Marca prohibida: Dolce & Gabbana.
- Nada de celulares, notebooks, tablets, TV, cámaras, monitores, impresoras, placas.
- En ML: medir contra el más barato CON FULL o FLEX; ignorar envío internacional.
- Vara de ventas del pedido: 100+ vendidos (25+ para que valga mirarlo).
- El margen lo calcula el panel, nunca el chat.

## Errores que ya pasaron (no repetir)
- 18/09 · Dark Door Sport cargado contra el catálogo de Dark Door INTENSE. Una palabra distinta = otro producto.
- 18/09 · Club de Nuit Blue Iconic y Sillage emparejados con Club de Nuit WOMAN.
- 18/09 · Dynasty emparejado con Mayar (otro perfume).
- 19/09 · El MISMO link de ML (Armaf Odyssey Aoud) pegado en Yum Yum y en Toffee Coffee.
- 19/09 · DualSense común medido contra la edición limitada The Last of Us ($349.999): margen falso de 57%.
- 19/09 · Lattafa Asad medido contra Asad INTENSE.
- 17/09 · Cabotine de 100 ml ofrecido cuando vendemos el de 30 ml. Animale Black por Animale For Men.
- 17/09 · Watch 4 emparejado con Watch 3. El número de modelo manda.
- 21/09 · A 5 de 5 códigos les faltaba el primer dígito (7128673 quedó 128673). Copiar el código entero.
- 17/09 · Se pisó el "Costo US$" de 20 fichas con el precio de Paraguay. Prohibido.
- 01/10 · Pedido de 17 productos armado en el chat y nunca guardado en el panel: se perdió entero. Guardar de a uno.
- 02/10 · Giorgio, Milestone y Huawei AX2S negro ya no estaban en Nissei: confirmar que la fila de Nissei existe HOY.
- Margen muy alto (80%+) casi siempre es otro producto o un catálogo equivocado: revisar foto y título.

## Datos útiles
- comprasparaguay escribe en portugués; ML en castellano. En electrónica, comparar el CÓDIGO DE MODELO.
- Perfumería barrida entera el 18/09 (1.227 filas). Quedan: cosmética, auriculares, relojes, varios,
  teclados, mouse, parlantes, cables, fundas, cargadores, discos, termos, memorias, routers, secadores, controles.
- Pendiente de Matías: cuotas "siempre" o "sólo si". No lo resuelvas vos: cargá igual, el panel decide.
