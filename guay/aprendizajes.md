# Aprendizajes del escaneo de comprasparaguay (lo mantiene la sesión "CYC WEB")

Leelo ENTERO al empezar cada sesión. Si algo de acá contradice al prompt, manda ESTO (es más nuevo).
Lo nuevo va arriba, con fecha.

## ⚠️ ERROR GRAVE 02/10/2026 (lo encontró Matías con la calculadora): MÁRGENES INFLADOS
- CK One (92847): el panel decía 49%. Real: (US$27 × 1,17 × 1.535 = $48.490) contra lo que deja venderlo a $69.499 en ML
  (~$51.178 neto) = 5,5%. DOS causas, y las dos pueden estar en TODOS los candidatos:
  1) **Precio de Nissei viejo**: el candidato tenía US$22,75 (cargado hace 15 días); hoy Nissei está a US$27. Antes de pedir,
     reconfirmar SIEMPRE el precio de HOY en comprasparaguay. Un candidato de hace días no tiene precio válido.
  2) **El robot midió contra un precio de ML equivocado**: dijo que el más barato ($67.323) "no tiene Full" y midió contra
     $118.351 (el más barato que él cree con Full). En ML el producto se vende a $69.499. La detección de Full del robot
     (precioAIgualar / mlConFull) puede estar fallando → margen inflado. Lo que vale es el PRECIO QUE GANA el catálogo hoy
     (página /p/MLA…, el precio grande): comparar siempre contra ese.
- Regla: margen de 40%+ en un perfume/electrónica conocida = sospechar y hacer la cuenta a mano:
  costo = USD × 1,17 × dólar · neto ≈ precio × 0,74 (comisión+cargo fijo+envío) · margen = neto/costo − 1.
- **"¡Uy! Producto no disponible"**: la publicación de Nissei puede seguir existiendo en comprasparaguay pero SIN stock (no sale en
  /<cat>/?loja=nissei). Si un código no aparece en lo bajado, abrir su página y buscar ese texto. 02/10: Milestone, Secador
  Xiaomi H101, Moonlight, Cooler Thermalright, Giorgio → descartados.
- Comparación hecha el 02/10: precio que usó el robot (mlPrecio) vs precio que GANA (página /p/): 16 de 21 viejos coincidían;
  5 inflados (CK One +73%, Montblanc +50%, Dark Door Sport +45%, Milestone +42%, Partylight +18%). Los 40 nuevos coincidían.
- Pedido de Matías (02/10) para el panel: los candidatos que dan menos de 25% van juntos abajo en un desplegable (pasado a CYC WEB).
- Regla: NUNCA confiar en un candidato viejo (de otro chat): revisar foto, catálogo, precio de Nissei de hoy y precio que gana hoy.
  02/10 se encontraron 7 malos: Blue Iconic (x2, otro perfume), Montblanc Presence (catálogo de mujer), Rifaaqat (versión Adorn),
  Edifier M60 (otro color), Huawei AX2S (otro color), CK One (precio).

## Nuevo 02/10/2026 (escrito por el chat local Guay, en la PC de Matías)
- **CYC WEB se abre en CHROME** (claude.ai/code → Fijados → "CYC WEB",
  https://claude.ai/code/session_011hr6XfiSaXTsqBofKs6buo) y se le escribe en esa caja. No aparece en ListAgents.
- **Usar las herramientas "Claude in Chrome"** (el Chrome de Matías está logueado en todo). El navegador integrado
  del desktop NO sirve para el panel (pide contraseña con prompt()).
- **Pestañas de fondo = capturas negras**: leer con get_page_text / javascript.
- **La extensión bloquea** salidas de javascript con "=", "?" o "&", y también el CÓDIGO que se manda si los tiene:
  armar las URLs con String.fromCharCode(63/61/38) y limpiar la salida. La salida se corta a ~1.500 caracteres.
- **Este repo se baja como ZIP** (no hay git): https://github.com/maticaldas-del/web-cyc/archive/refs/heads/claude/happy-johnson-laasu8.zip
  → descomprimir en CHGU\web-cyc. Lo que se cambia acá NO llega a GitHub: se le pasa el texto a CYC WEB.
- **Herramientas en guay/herramientas/** (PowerShell, corren en la PC):
  · `nissei-harvest.ps1 [-Slugs a,b]` baja TODO Nissei por categoría a guay-datos\nissei-<slug>.json con nombre,
    CÓDIGO COMPLETO, precio, categoría, link y foto (el listado /<cat>/?page=N&loja=nissei trae "código: <strong>…</strong>").
    comprasparaguay baja bien desde la PC; ML NO (devuelve página sin resultados).
  · `models.ps1 -Slug <slug>` junta colores en modelos y saca los códigos que ya están en el panel.
- **ML desde Chrome con fetch (pestaña en listado.mercadolibre.com.ar, mismo origen):** cada tarjeta "polycard" del
  HTML trae product_id (catálogo), price (= el de la publicación que GANA el catálogo), sold_quantity (de la familia,
  no de la ganadora) y "full_icon" si es Full. La página del catálogo (/p/MLA…, desde www.mercadolibre.com.ar) da
  el h1, el precio ganador y "+N vendidos" de la ganadora. La palabra "internacional" aparece en el MENÚ: no sirve
  para detectar envío internacional.
- **Filtro rápido de margen (sólo para descartar, no para decidir):** (P×0,86 − 7.500 si P≥33.000) ÷ (USD×1,17×1.535) − 1.
- **Termos (Stanley/Contigo): no dan.** Mate System 1.2 gana a $153.000 (Nissei US$65), Classic 940 a $139.000 (US$55),
  Quencher 1.18 a $118.800 (US$61), Flip Straw 887 a $118.400 (US$48).
- **CUOTAS EN ML (Matías, 02/10, con captura):** 'Mismo precio 2 cuotas' lo pone ML a TODAS las publicaciones a veces = cuenta como SIN cuotas. Si la publicación que GANA ofrece '6 cuotas sin interés' (o 9), hay que competir con esas cuotas y eso es un costo. Mirarlo en la página del catálogo: 'Mismo precio en N cuotas'. (3 cuotas: preguntado.)
- **Costo de cuotas (CYC WEB, 02/10):** 2 = nada · 3 = 8,9% · 6 = 13,4% · 9 = 17,8% · 12 = 21,6% del precio. Se carga
  `fbSet('candidatos_py/<id>/cuotasGan', N)` con las cuotas de la publicación que GANA.
- **Cada color es otro catálogo y da otro margen** (T110 Azul 51% vs Blanco 12%; T125BT Blanco 41% vs Negro 16%; Race 2
  Blanco 35% vs Negro 18%): cargar cada color por separado, con su mlId.
- **El color que vende Nissei tiene que existir en ML** (QCY Crossky C50: Nissei gris/blanco, ML negro → no va).
- **Margen de 80%+ = sospechoso:** el "Live Beam 3" barato era el catálogo de Live BUDS 3 (otro modelo).
- **Auriculares de cable de US$ 6-7 no dan** (E9LP 16,6%): el cargo fijo de ML se come el margen.
- **El filtro rápido exageraba en lo barato** (QCY T13: estimé 23%, el robot 7,4%). Más realista:
  (P×0,75 − 8.730)/(USD×1,17×1.535) − 1.
- **candSetPedir traba el panel** si se llama varias veces (renderPedidos + alert). Para cargar unidades:
  `const c=candList().find(x=>x.cod===COD); P=candPuedePedir(c); if(P.ok){ await fbSet('candidatos_py/'+c.id+'/pedirU', n) }` (⚠️ `c` TIENE que salir de `candList()`: los objetos de `state.candidatos` NO tienen `.id` → escribe en `candidatos_py/undefined`, pasó el 02/10). Cargar candidatos
  de a 3-4 por llamada (con más, la pestaña deja de contestar aunque se guarden).
- **Trampas vistas:** QCY T13 tiene en ML el común (BT 5.1), ANC y ANC2 (catálogos distintos) · Sony MDR-ZX110 (sin
  mic) ≠ ZX110AP (con mic, ya está en el panel) · CMF Buds 2A matcheó con un Anker: el código de modelo no alcanza
  si es corto.
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

## Corrección de CYC WEB (02/10/2026, noche)
- **El robot YA NO mide contra "el más barato con Full"**: el que gana la caja puede no tener Full (CK One: el ganador de
  $68.499 viene como `xd_drop_off` = agencia en la API). Desde el 02/10 mide contra el MÁS BARATO DE TODOS (sin los del
  exterior), que queda pegado al que gana. Se re-midieron todos (calcVer 9).
- **Nunca reescribir un candidato entero**: para cambiar uno que ya existe, SIEMPRE el subcampo
  (`fbSet('candidatos_py/<id>/foto', url)`). Un set del nodo entero se lleva pedirU, cuotasGan y usd agregados después.

## Herramientas (subidas al repo el 02/10, carpeta guay/herramientas) y datos (guay/datos)
- `nissei-harvest.ps1`, `models.ps1`, `montaje.ps1`, `funciones-chrome.js`. Los JSON de Nissei bajados el 02/10 están en
  guay/datos (precios de ESE día: reconfirmar antes de pedir).


## QUÉ QUIERE DECIR "BARRIDO COMPLETO" (regla de Matías, 02/10)

**Corrección del 02/10: el barrido NO estaba completo.** Nissei tiene **13.905 productos** en comprasparaguay y se habían
bajado 34 categorías = **7.487 (54%)**. De esas:
 · **enteras:** auriculares, relojes, mouse, parlantes, termos, perfumería (18/09);
 · **casi enteras:** teclados y cables;
 · **a ojo, sólo lo que pareció:** cargadores, discos, memorias, routers, joysticks, micrófonos, secadores, varios,
   adaptadores, iluminación, juegos, PC, cosmética, flash, cámara, fundas;
 · **sin mirar:** labial, base, shampú, anillos.

**La regla desde ahora:**
 1. Se miran TODAS las categorías de Nissei. Las obviamente prohibidas (TV, celulares, notebooks y similares: pasan el
    tope de US$ 250 o de 40×40×40 cm / 3 kg) se descartan ENTERAS sin comparar en ML, **dejando anotado cuáles y por qué**.
 2. **"Completo" = las 34 categorías de siempre + las nuevas que apruebe Matías, todas ENTERAS, sin elegir a ojo**,
    salvo las categorías descartadas. Lo mirado a ojo NO cuenta como barrido.
 3. La lista de categorías aprobadas y descartadas va en `guay/progreso.md` cuando Matías la pase.

**La prueba de por qué van ENTERAS (02/10):** al pasar VARIOS completo salió el **Xiaomi Mijia Lint Remover 2**
(sacapelusas, cód 155085, US$ 13,5, MLA68634662 a $69.999, +500 vendidos, Full, sin cuotas). En la mirada a ojo de la
misma categoría se había pasado de largo. Mirar a ojo deja afuera justo lo que no se sabe buscar.

## NUNCA USAR /busca/ PARA EL BARRIDO COMPLETO: SIEMPRE POR CATEGORÍA (02/10)
comprasparaguay muestra como máximo **500 páginas de 20 productos = 10.000** en la búsqueda general, aunque arriba diga
13.905. Comprobado: `/busca/?page=500&loja=nissei` trae productos; `page=501` y `page=600` vienen vacías. Los ~3.900
restantes existen pero la búsqueda general **nunca** los muestra: es un límite del sitio, no un corte de la descarga.
**Se baja categoría por categoría** (`/<categoria>/?page=N&loja=nissei`): ninguna categoría pasa las 500 páginas, así
que en cada una aparecen todos. Una descarga que da justo 10.000 es esta pared, no "terminé".

## LO APRENDIDO EN LA TANDA 1 DEL BARRIDO COMPLETO (02/10, Mensaje 22)
1. **La lista real de categorías sale de https://comprasparaguay.com.ar/sitemap-categorias.xml** (577 categorías), no del
   filtro de la tienda (que muestra 50). Con `?loja=nissei`: Nissei tiene filas en 277, ~14.045 filas.
2. **Servidor local:** `guay-tools/serve.ps1` sirve `guay-datos` en http://127.0.0.1:8765 con CORS. Las pestañas de
   **listado.mercadolibre.com.ar** leen las listas de ahí y guardan resultados en la PC (www.mercadolibre.com.ar NO puede:
   lo bloquea su CSP).
3. **Varias pestañas de ML en paralelo:** las funciones viven en el localStorage de listado.mercadolibre
   (`eval(localStorage.getItem('guayfn'))`). Con 11 pestañas se pasan ~4.000 modelos en ~1 h.
4. **Emparejador:** marca de una lista + código de modelo + misma capacidad (GB/TB/mAh/ml); sin código exige 75% de las
   palabras. Falla en **juegos** (la marca va al final: búsqueda propia título+plataforma) y en **accesorios de cámara**
   (se pega con cámaras): ahí mirar a mano.
5. El harvest guarda los acentos en latin-1 (`Ã³`): se arregla al leer.
6. **Joysticks, micrófonos, secadores y adaptadores:** la publicación que gana da 6-9 cuotas casi siempre y no llegan
   al 25%. No perder tiempo con los de esas categorías que ganan con cuotas altas.
7. **Aerosoles e inflamables (lacas, sprays):** ML Full tiene restricciones con mercadería peligrosa. Antes de cargar
   uno, confirmar que la publicación que gana esté en Full; si ninguna está en Full, descartarlo.

## TANDA 2 DEL BARRIDO COMPLETO (02/10, Mensaje 23)
1. **Catálogo de 1 vendedor sin Full:** antes de cargar, buscarlo fuera del catálogo. Para contar vendedores: `fetch` de
   `/p/<catalogo>/s` (desde www.mercadolibre.com.ar) y contar los `item_id` distintos.
2. **Chrome nuevo pide permiso de RED LOCAL:** listado.mercadolibre no puede leer 127.0.0.1 hasta que Matías lo permita
   (cartel de Chrome). Mientras tanto, pegar las listas a mano.
3. Las funciones de Chrome viven en `guay-tools/funciones-chrome-v2.js` y en el localStorage de listado.mercadolibre:
   si Chrome se resetea, se recargan de ahí.
4. **Mismo juego, distinta caja (PEGI europea vs americana):** es el mismo producto. Pero un pack con DLC o una edición
   distinta NO lo es.

- **Maquillaje (rubor, sombras, lápices, correctores, polvos, gloss, máscaras, iluminadores) no da** (02/10): en ML casi no
  tienen ventas o se venden baratos contra el costo de Nissei. En el próximo barrido se pasan rápido.
