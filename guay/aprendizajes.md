# Aprendizajes del escaneo de comprasparaguay (lo mantiene la sesión "CYC WEB")

Leelo ENTERO al empezar cada sesión. Si algo de acá contradice al prompt, manda ESTO (es más nuevo).
Lo nuevo va arriba, con fecha.

## Nuevo 02/10/2026
- **Cargar candidatos:** `fbSet('candidatos_py/c'+Date.now(), {nombre, cod, usd, link, mlId, vendCarga,
  foto, marca, fuente:'chat', enNissei:true, ts})`. La ruta es `candidatos_py`, NO `candidatos`.
  `mlId` = id del CATÁLOGO (lo de /p/). Nada calculado (mlLink, margen): eso lo escribe el robot.
  El formulario "Agregar un candidato a mano" ya no existe en el panel (v21.32).
- **En la PC de Matías no hay git ni Python** (02/10): el chat guarda en
  `C:/Users/Usuario/Desktop/CHGU/GUAY-TRASPASO.md` y le pasa los textos a "CYC WEB", que los sube.
- **Método Parte 2 (Guay, 02/10):** un script en la PC baja todo Nissei por categoría (código, precio,
  foto, link de cada fila) y desde Chrome se leen las búsquedas de ML con fetch: cada tarjeta de catálogo
  trae product_id, precio de la que gana y vendidos. Mucho más rápido que mirar de a uno.
- **Termos: no dan.** Stanley Mate System 1.2 gana a $153.000 con Nissei US$65; Classic 940 a $139.000
  con US$55.
- Pendrive 64gb: en comprasparaguay hay dos filas, `07112` y `7112`, las dos a US$6,50.
- **Un precio del panel con fecha de HOY puede estar viejo** (Redmi Watch 4: precio del 02/10 y Nissei ya
  no lo tenía). Reconfirmar SIEMPRE en comprasparaguay, nunca saltear por la fecha.
- **Códigos:** comprasparaguay muestra 6 dígitos (128673) y la factura de Nissei 7 (7128673). Vale lo de
  comprasparaguay. El `07112` del Cruzer Blade 64gb es real.
- Parte 1 completa el 02/10: 44 revisadas en ~1 h, 13 "no había".
- SanDisk Ultra 128 CON adaptador ≠ el SDSQUNR de Nissei (sin adaptador): no cargar. Además no se repone.
- Si el nombre de la ficha no coincide con su publicación de ML (Galaxy A07: 64GB vs 128GB), apartar y
  preguntar: no elegir.
- **Listado SÓLO de Nissei:** `https://comprasparaguay.com.ar/busca/?loja=nissei` (13.905 productos el
  02/10) y por categoría `/<cat>/?loja=nissei`. Recorrer eso, no el sitio entero. (Descubierto por Guay.)
- La pestaña "Productos probados" del panel ya no muestra los campos Nissei (v21.26). Se cargan con las
  funciones del panel: `updNisseiUSD(id,precio)`, `updNisseiCod(id,codigo)`, `pyNoHabia(id,true)`,
  sobre `state.products` con `origen==='py'`.
- Halloween 100ml (EDT, Kiss, Kiss Sexy, Magic, Bliss, Blossom): ninguno tiene fila de Nissei al 02/10.
- Códigos: la factura de Nissei usa 7 dígitos (7128673) donde el panel tiene 6 (128673). Cargar SIEMPRE
  lo que muestra la fila de Nissei hoy, tal cual.
- **CUOTAS (Matías, 02/10, aclarado):** NO se cuentan. Se mide contra la publicación que gana (casi siempre
  gana una sin cuotas). Las "2 cuotas" que muestra ML las tiene todo el mundo, nosotros también aunque
  pongamos "sin cuotas": NO son un costo. El "cuotas siempre" anterior fue un malentendido.
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
