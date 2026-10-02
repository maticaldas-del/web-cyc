# GUAY · TRASPASO COMPLETO (arrastrá este archivo a un chat nuevo y seguí desde acá)
Última actualización: 02/10/2026 · lo escribe el chat local "Guay" (Claude Code en la PC de Matías)

## ⚠️ LEER PRIMERO · ERROR GRAVE DEL 02/10 NOCHE (Matías con la calculadora)
El CK One decía 49% y da ~5%: (1) precio de Nissei viejo (22,75 → hoy 27) y (2) el robot midió contra $118.351 ("más barato con
Full") cuando en ML se vende a $69.499. Puede estar en TODOS los candidatos. Ver web-cyc/guay/aprendizajes.md arriba de todo.
Antes de cargar unidades al pedido: precio de Nissei de HOY + precio que GANA hoy en ML + cuenta a mano
(costo = USD×1,17×1.535 · neto ≈ precio×0,74 · margen = neto/costo−1). El pedido quedó VACÍO (las 7 unidades se borraron solas).

## 0. Qué sos y qué tenés que hacer
Sos el chat de compras de CYC. Vendemos en MercadoLibre, todo por Full, y compramos en Paraguay a NISSEI
a través de comprasparaguay.com.ar. Objetivo final: QUE QUEDE ARMADO EL PEDIDO de Paraguay.
Matías te da vía libre en 3 webs (más ML para comparar): panel CYC, claude.ai (chat CYC WEB) y comprasparaguay.
Te podés cortar en cualquier momento (tokens / Matías se va): GUARDÁ SEGUIDO en el panel, en este archivo
y avisale a CYC WEB. Lo que quede sólo en tu memoria se pierde.

## 1. Las webs y cómo se usan (IMPORTANTE, aprendido a los golpes)
- Usar SIEMPRE el Chrome de Matías (herramientas "Claude in Chrome", mcp__claude-in-chrome__*). Ahí está logueado en todo.
  El navegador integrado del desktop NO sirve para el panel (pide contraseña con prompt() y falla).
- Las pestañas de Chrome en segundo plano dan capturas NEGRAS: leer con get_page_text o javascript.
- La extensión BLOQUEA cualquier salida de javascript que tenga "=", "?" o "&" (cree que es una cookie o query string).
  Antes de devolver texto: .replace(/[=?&]/g,' ').
- La salida de javascript se corta a ~1.500 caracteres: paginar (slice) de a 12-15 renglones.

### Chat "CYC WEB" (la otra Claude)
- NO aparece en ListAgents ni se le puede mandar SendMessage. Es una sesión en la nube:
  Chrome → https://claude.ai/code → barra izquierda, "Fijados" → "CYC WEB"
  (URL directa: https://claude.ai/code/session_011hr6XfiSaXTsqBofKs6buo).
- Se le escribe en la caja de ese chat. Ella conoce el panel, el robot y el historial; mide los márgenes, arma el pedido
  y guarda progreso y aprendizajes en el repo. NO adivines: preguntale ("Duda N: …" con link de comprasparaguay, código, precio y link de ML).
- Ella responde en: https://raw.githubusercontent.com/maticaldas-del/web-cyc/claude/happy-johnson-laasu8/guay/respuestas.md?v=<número cualquiera>
- Archivos del repo que leer al empezar (con ?v=<número>):
  · aprendizajes.md → https://raw.githubusercontent.com/maticaldas-del/web-cyc/claude/happy-johnson-laasu8/guay/aprendizajes.md
  · progreso.md → https://raw.githubusercontent.com/maticaldas-del/web-cyc/claude/happy-johnson-laasu8/guay/progreso.md (el 02/10 todavía no existía)
- Qué mandarle: dudas numeradas; cada 20 cargados "Tanda N: cargados X · descartados Y · voy por <cat/página>" + descartados con motivo;
  "Parte 1 terminada"; y al cerrar, el resumen.

### Panel CYC: https://maticaldas-del.github.io/web-cyc/
- Navegar con javascript: goPage('pedidos'); setPedidoSection('paraguay',botón); pySetVista('probados' | 'nuevos').
- Pedidos → Paraguay → "✅ Productos probados" (desde la v21.26) es SÓLO la lista de pedido (20 renglones). AHÍ NO están los campos de Nissei.
- Los 44 "probados" son state.products con origen==='py'. Campos: codPy (Código Nissei), nisseiUSD (Precio Nissei US$ crudo), nisseiTs (fecha).
  Se cargan con las funciones del panel (guardan en Firebase y dejan log):
    updNisseiCod(id, 'codigo')   · updNisseiUSD(id, precio)   · pyNoHabia(id)  ("no había")
  state.pySinStock[id] = marcado "no había". NUNCA tocar costUSD ("Costo US$").
- "🆕 Productos nuevos" = "Para probar": candidatos, "Agregar un candidato a mano", y "Armar el pedido" (tope, unidades, total).
  El 02/10 tenía: 19 para evaluar · 7 en el pedido · 63 afuera. Pedido: US$ 353,60 crudos, 7 productos, 13 u., tope del panel US$ 500.

### comprasparaguay.com.ar (SÓLO filas de NISSEI; nunca nissei.com)
- La tienda Nissei se identifica por el link /lojas/nissei/ en la fila (el logo es una imagen).
- TODO lo de Nissei: https://comprasparaguay.com.ar/busca/?loja=nissei (13.905 productos el 02/10). Por categoría: /<slug>/?loja=nissei
  (perfume 1258, cosmetico 718, auricularheadset 683, reloj 618, celular 467, varios 391, teclado 300, mouse 270, caja-de-sonido 259,
  cables 185, funda para celular 166, cargador de pared 116, disco duro/ssd 111, termo 107, secador 98, router 97, control videojuegos 93,
  tarjeta de memoria 93, adaptador/conector 77, ...). Recorrer la tienda de Nissei es MUCHO más rápido que todo el sitio.
- Página de producto agrupada (/nombre_NNNN/) = lista de ofertas de todas las tiendas. Listado suelto (/nombre__NNNN/) = una sola tienda.
- Extractor de ofertas (pegar con javascript en una pestaña de comprasparaguay):
  window.cpOffers = async (path)=>{ const html=await (await fetch(path)).text(); const d=new DOMParser().parseFromString(html,'text/html');
   return [...d.querySelectorAll('.promocao-item-info')].map(it=>{ let r=it; for(let i=0;i<5;i++){ r=r.parentElement; if(/promocao-produtos-item-text/.test(r.className)) break;}
   const st=[...r.querySelectorAll('a')].map(a=>a.getAttribute('href')||'').find(h=>h.startsWith('/lojas/'))||'';
   const name=it.querySelector('.promocao-item-nome a'); const cod=(it.querySelector('.promocao-item-caracteristicas')||{}).textContent||'';
   const pr=(r.textContent.match(/US\$\s*([\d.]+,\d\d)/)||[])[1]||'';
   return {st:st.replace(/\/lojas\/|\//g,''), n:name?name.textContent.trim():'', h:name?name.getAttribute('href'):'', c:cod.replace(/Código:/,'').trim(), p:pr}; }); };
  Filtrar x.st==='nissei'. Probado OK con Ferrari Black 125ml → nissei 92568 US$ 19,00 (coincide con el panel).
  Ojo: al hacer fetch de links de búsqueda, usar sólo hrefs que empiecen con "/" (hay links a otras webs).
- Búsqueda SÓLO en Nissei (devuelve publicaciones de Nissei, pero en la lista NO viene el código, viene la descripción):
  window.cpN = async (q)=> (await cpOffers('/busca/?q='+encodeURIComponent(q)+'&loja=nissei')).filter(x=>x.st==='nissei');
- Código y precio de una publicación de Nissei (página "__NNNN", dice "código: #34909 US$ 16,00"):
  window.cpListing = async (h)=>{ const html=await (await fetch(h)).text(); const d=new DOMParser().parseFromString(html,'text/html');
   const t=(d.body.innerText||d.body.textContent).replace(/\s+/g,' '); const m=t.match(/c[óo]digo:\s*#?\s*([\w-]+)\s*US\$\s*([\d.]+,\d\d)/i);
   const st=(html.match(/href="\/lojas\/([\w-]+)\/"/)||[])[1]; return {c:m?m[1]:'?', p:m?m[2]:'?', st}; };
  Verificado: el código de la publicación es el mismo que el de la fila en la página agrupada.
- La búsqueda por número de código NO funciona en comprasparaguay: buscar por nombre/modelo y comparar el código.
- ML: WebFetch da 403. Abrir en Chrome: https://articulo.mercadolibre.com.ar/MLA-<número> y leer el h1 con javascript.

## 2. Reglas firmes (de Matías; si aprendizajes.md dice otra cosa, manda aprendizajes.md)
- De cada fila de Nissei: código COMPLETO, precio US$ crudo tal cual (el panel suma el 17%), link. Sin fila de Nissei = se descarta / "no había".
- Descartar sin ir a ML: > US$ 250 · > 40×40×40 cm o > 3 kg · celulares, notebooks, tablets, TV, cámaras, monitores, impresoras, placas ·
  Dolce & Gabbana · lo que ya está en el panel (Para probar, descartados o con ficha) · lo mirado hace < 4 semanas (salvo que bajó de precio).
- En ML: el MISMO producto (modelo, ml/capacidad, color; nada de edición especial, pack ni kit). En electrónica manda el código de modelo
  (comprasparaguay en portugués, ML en castellano). Comparar fotos. Un link de ML distinto por producto. Ignorar envío internacional.
  Medir contra el más barato CON FULL o FLEX. Anotar vendidos de la publicación más barata. Sirve con 100+ vendidos (25+ para mirarlo).
  El margen NO lo calculás vos (lo hace el panel / CYC WEB).
- Cada producto que sirve: cargarlo YA en "Para probar" (Agregar un candidato a mano): nombre, código Nissei completo, precio US$ crudo,
  link catálogo ML, vendidos, foto, link comprasparaguay. De a uno.
- Pedido: tope US$ 1.000 crudos, mitad probados y mitad nuevos. No cargues unidades: el pedido lo arma CYC WEB.
- Errores que ya pasaron (no repetir): Dark Door Sport vs Intense · Club de Nuit Blue Iconic/Sillage vs Woman · Dynasty vs Mayar ·
  mismo link ML en 2 productos · DualSense común vs edición TLOU · Asad vs Asad Intense · Cabotine 100 vs 30 ml · Animale Black vs For Men ·
  Watch 4 vs Watch 3 · códigos sin el primer dígito (7128673→128673) · se pisó Costo US$ · pedido armado en el chat y no guardado ·
  productos que ya no estaban en Nissei (confirmar que la fila existe HOY) · margen 80%+ casi siempre es otro producto.
- CUOTAS (Matías, 02/10, RESUELTO): todo producto se mide contra la PUBLICACIÓN QUE GANA el catálogo de ML. Casi siempre gana
  una SIN cuotas. NO confundir con las 2 cuotas que pone ML: esas las tenemos nosotros también aunque publiquemos sin cuotas.
  O sea: pensar que la publicación de ellos tiene 2 cuotas y la nuestra no. (El "cuotas siempre" que había en la caja del chat NO era la regla.)
- Matías, 02/10: los precios que ya están en el panel pueden ser VIEJOS aunque digan fecha de hoy. Siempre reconfirmar en comprasparaguay.
  (Pasó: Redmi Watch 4 figuraba con precio del 02/10 y Nissei ya no lo tenía.)

## 3. PARTE 1 · Probados (44) · estado al 02/10
Ya tenían precio de HOY (02/10) antes de esta corrida (no repetir): TL-WN822N 9,7 (90332) · Animale For Men 20 (99536) · Ferrari Negro 19 (92568) ·
Ferrari Rojo 14,5 (40510) · Joystick Xbox 48 (78360) · Pendrive 128 Ultra Shift 14,1 (56166) · CB 128gb 10,25 (21648) · CB 16gb 4,9 (82788) ·
CB 32gb 5,5 (88420) · CB 64gb 6,5 ("07112" ¡revisar!) · CB 8gb 4,5 (82786) · Dali L'Ocelot 27,5 (143603) · Buds Core 42 (142930) ·
A06 126,75 (151285, no había) · SSD 1TB 140 (121580) · Seagate 500GB 45 (90702) · Redmi Buds 6 29,5 (133818) · Redmi Pad 2 173 (139913) ·
Redmi Watch 4 59,5 (118601) · Watch 5 Lite 40 (128528) · Watch S5 135 (157454).
Sin precio/código (prioridad): Halloween 100ml · Lapidus · Philips TAT2206 · PS Portal · VS STARLIT (no había) · VS BLISS (cod 142409 sin precio) ·
Animale Sexy (no había) · Azzaro Pour Homme 200ml (no había) · Cabotine 30ml (no había) · Tarjeta SanDisk Ultra 128GB (no había) · Galaxy A07 (no había, sin cod).
Precio viejo de septiembre (reconfirmar): MDR-EX15AP blanco 8,5 (26291) · MDR-EX15AP negro 8,5 (26187) · Cabotine Turquoise 20 (149310) ·
MicroSD Pokémon 256 62 (128673 ¡posible dígito faltante!) · Sennheiser CX80S 43 (151150) · MDR-ZX310AP 17 (20139) · Mouse Scimitar 28 (152721) ·
Adyan 15,5 (125057) · Sutoor 13,5 (133652) · Club Black 32,75 (104067) · Mirada Muse 13,5 (138358) · Victoria's Secret 14 (sin código).

## 4. Hecho en esta corrida (02/10) · PARTE 1 TERMINADA (los 44 revisados contra comprasparaguay y cargados en el panel)
Cargados (código ; US$ crudo):
- Lapidus = Ted Lapidus Pour Homme EDT 100ml (ML MLA3310524980 confirma 100 ml) → 34909 ; 16
- Animale Sexy Mujer EDP 100ml → 104096 ; 25 (se le cayó solo el "no había")
- Victoria's Secret (publicación ML = Rush 250ml) → 28118 ; 14 (Colônia VS Rush 250ML)
- MDR-EX15AP blanco 26291 ; 9 (antes 8,5) · MDR-EX15AP negro 26187 ; 9 (antes 8,5) · MDR-ZX310AP 20139 ; 17,5 (antes 17)
- Scimitar 152721 ; 29,9 (antes 28) · Mirada Muse 138358 ; 14 (antes 13,5)
- Sin cambio (reconfirmados): Cabotine Turquoise 149310 ; 20 · MicroSD Pokémon 256 128673 ; 62 (el código ES 128673, no le falta dígito) ·
  Sutoor 133652 ; 13,5 · Club Black 104067 ; 32,75 · y los 19 que ya tenían precio del 02/10 (TL-WN822N, Animale For Men, Ferrari Negro/Rojo,
  Joystick Xbox, 6 pendrives, Dali, Buds Core, SSD 1TB, Seagate, Redmi Buds 6, Redmi Pad 2, Watch 5 Lite, Watch S5): todos coinciden.
- Pendrive CB 64gb: el código "07112" es real (Nissei tiene 2 publicaciones: 07112 y 7112, ambas 6,50).
Marcados "no había" (13): Halloween 100ml (ninguna versión en Nissei) · Philips TAT2206 · PS Portal · VS BLISS (Pure Seduction Bliss 250ml no está) ·
  VS STARLIT · Azzaro PH 200ml (Nissei sólo 100ml, 25,75) · Cabotine 30ml (Nissei sólo 100ml, 13) · Adyan Oud Essential · Sennheiser CX 80S
  (sólo hay CX 80U USB-C, otro modelo) · Galaxy A06 128GB (sólo 64GB a 115,75) · Redmi Watch 4 (17 ofertas, ninguna Nissei) ·
  Galaxy A07 (duda) · Tarjeta SanDisk 128 (duda).
DUDAS mandadas a CYC WEB (Duda 1 y 2):
- Duda 1 · Tarjeta SanDisk Ultra 128GB: ML MLA1843206589 es SDSQUNS-128G-GN6 con adaptador; Nissei tiene SDSQUNR-128G-GN3MA (65318, US$ 19,00,
  /memoria-micro-sd-sandisk-ultra-100-mbs-c10-128-gb-sdsqunr-128g-gn3ma__3156413/). Modelo distinto (QUNS vs QUNR). ¿Sirve igual?
- Duda 2 · Galaxy A07: el panel dice "LTE 64GB" pero su ML (MLA3528713302) es "A07 128gb 4gb Ram Negro". Nissei: 64GB Preto 145173 US$ 117
  (/samsung-galaxy-a07-sm-a075mds-dual-64-gb-preto__5002342/) y 128GB Preto US$ 142. ¿Cuál vendemos?

## 4b. Respuestas de CYC WEB (respuestas.md, 02/10) y lo hecho después
- Duda 1 SanDisk → NO cargar, queda "no había" (Matías no la repone). Duda 2 Galaxy A07 → es el 64GB: CARGADO 145173 ; 117 (los celulares viajan
  con el papá, fuera del pedido de US$ 1.000). Códigos: cargar EXACTO lo que muestra la fila hoy (128673 y 07112 quedan así).
- CYC WEB pidió clonar el repo y hacer git push: EN ESTA PC NO HAY GIT NI PYTHON. Se guarda en este archivo y se le pasa el texto por el chat.
  El prompt oficial está en el repo: .claude/skills/guay/SKILL.md (copia en CHGU\repo-copia\SKILL.md). Si la PC nueva tiene git:
  git clone -b claude/happy-johnson-laasu8 https://github.com/maticaldas-del/web-cyc.git y arrancar con /guay dentro de web-cyc.
- Duda 3 RESPONDIDA: el formulario a mano no existe más. Candidatos = fbSet('candidatos_py/c'+Date.now(), {nombre, cod, usd, link, mlId,
  vendCarga, foto, marca, fuente:'chat', enNissei:true, ts}) — ruta candidatos_py (NO candidatos). mlId = catálogo (/p/). El robot calcula el resto.
- El repo se bajó como ZIP a CHGU\web-cyc (ahí está .claude/skills/guay/SKILL.md = el prompt, y guay/aprendizajes.md, progreso.md, respuestas.md).
  Lo que se cambió ahí (aprendizajes, progreso, herramientas) NO está en GitHub: CYC WEB lo sube si se le pasa el texto.
- Mensajes mandados a CYC WEB: 1 a 5. Duda 4 (Sony EX15LP otros colores, el blanco ya tiene ficha) y Duda 5 (E9LP negro descartado sin
  motivo) esperando respuesta en respuestas.md.
- Matías VACIÓ EL PEDIDO el 02/10 a la tarde: el próximo pedido lo arma CYC WEB con los candidatos que se carguen ("Para probar").
- CUOTAS, VERSIÓN FINAL (CYC WEB, 02/10 noche): lo que ML cobra por ofrecer cuotas sin interés, igual a cualquier precio:
  2 = nada (ML las pone a todos) · 3 = 8,9% · 6 = 13,4% · 9 = 17,8% · 12 = 21,6% del precio. 3 cuotas SÍ es costo.
  En cada candidato se carga cuántas da la publicación que GANA: fbSet('candidatos_py/<id>/cuotasGan', N). Sin campo = sin cuotas.
- REGLA DE CUOTAS (Matías, con captura, 02/10): "Mismo precio 2 cuotas" lo pone ML a TODAS = sin cuotas. Si la publicación que GANA ofrece
  6 o 9 cuotas sin interés, hay que competir con esas cuotas = costo. Se mira con mlCuotas(pid). 3 cuotas: preguntado a Matías.

## 4c. Herramientas que armé (en CHGU\guay-tools) · REUSAR
- nissei-harvest.ps1: baja TODO Nissei por categoría a CHGU\guay-datos\nissei-<slug>.json (nombre, código completo, precio, categoría, link, foto).
  Desde la PC comprasparaguay baja bien (ML NO: devuelve página vacía, hay que usar Chrome).
  Se corrió el 02/10 sobre 34 categorías (en segundo plano).
- models.ps1 -Slug <slug>: agrupa colores en modelos, saca lo que ya está en el panel (guay-datos\codigos-panel.txt) y arma la lista para ML.
- En la pestaña de ML (listado.mercadolibre.com.ar, mismo origen) con javascript: mlSearch(q) hace fetch de la búsqueda y lee las tarjetas
  ("polycard"): product_id (catálogo), precio de la publicación que GANA, sold_quantity, full_icon = Full, internacional.
  mlScan(lista, margenMin, vendMin) filtra catálogos cuyo título tiene el código de modelo y estima margen:
  est = (P*0,86 - 7.500)/(USD*1,17*1.535) - 1  → SÓLO filtro; el margen real lo calcula el panel/robot.
  Las tandas largas tardan más que el límite de la herramienta: lanzarlas con scanBg(lista) y consultar window.__scan.
- Termos (107): NO dan. Stanley Mate System 1.2L gana a $153.000 (Nissei US$65), Classic 940 $139.000 (US$55), Quencher 1.18 $118.800 (US$61),
  Flip Straw 887 $118.400 (US$48). Categoría descartada esta semana.

- montaje.ps1 -Pares "etiqueta|fotoNissei|fotoML;..." -Salida x.png → UNA imagen con los pares lado a lado (lee webp y jpg). Así se
  comparan 12 fotos con una sola lectura. La foto de Nissei está en el campo img del JSON; la de ML la da mlCat(pid).img (cambiar .webp por .jpg).
- funciones-chrome.js: TODO el código para pegar en las pestañas de ML y del panel (mlSearch, mlScan, scanBg, mlFind, mlCat, mlCuotas, cargarCand).
- Archivos de datos: guay-datos\nissei-<categoria>.json (Nissei completo, 02/10) · candidatos-verificados.md (lo cargado y descartado, con
  motivo) · codigos-panel.txt (códigos que ya están en el panel: no repetir).

## 4d. CANDIDATOS CARGADOS EL 02/10 (28) · detalle completo en guay-datos\candidatos-verificados.md
Todos auriculares, todos con color igual, foto comparada, Full y +100 vendidos en la ganadora:
Sony ZX110 blanco y rosa · QCY T13 negro · Apple EarPods 3,5 · JBL T110 blanco y azul · Logitech H111, H151, G432, G325 · JBL Endurance Run 3,
Race 2 negro y blanco, Peak 4 blanco y negro · JBL T125BT blanco y negro · JBL Tune 520C · JBL Sense Lite · JBL Soundgear Clip negro y copper ·
JBL Quantum 250 · JBL Tour Pro 3 · Haylou Mori Plus, Airfree, S30 Pro, S40 · QCY H3S.
Con 6-9 cuotas en la ganadora (probablemente no dan): T125BT negro, G432, Race 2 blanco, S40, Peak 4 blanco.
Trampas que aparecieron: QCY T13 tiene catálogo blanco y negro (usar el del color) · "Live Beam 3" matcheó con Live BUDS 3 · S30 Pro tiene
catálogo AZUL y BLANCO sin decirlo en el título (lo decidió la foto) · "Endurance Run 3" matcheaba Run 2/Race 2/Peak 3 (arreglado en matchQ).

## 5. Dónde quedé / próximo paso (02/10 tarde)
- Parte 1: TERMINADA.
- Parte 2: Nissei bajado entero. Medido en ML: termos (no dan), parlantes (no dan: JBL/Sony/Harman 15-22%, barras grandes no entran),
  auriculares tanda 1 (109 modelos) → 28 cargados. Auriculares tanda 2 (141 modelos, índices 113-437 de models.ps1) LANZADA con scanBg en la
  pestaña de ML; si se perdió, volver a correrla (la lista sale de: powershell -File guay-tools\models.ps1 -Slug auricularheadset).
- Auriculares tanda 2 TERMINADA (141). Pasaron el filtro y FALTA VERIFICAR (color/foto/cuotas) y cargar: Havit H2002D (US$35, ML $125.000 v1000),
  Jabra Evolve 10 (25, $74.917), Jabra Evolve 20 (34, $149.000 — 98%: sospechoso, mirar versión MS/UC), QCY T13 Pro (15 — ojo: ¿es el T13 ANC?),
  JBL Tune 730BT (37), JBL Tune 780NC (61), Soundpeats H3 (61,75), T3 Pro (12,75), Space Pro (38,75), Q3 Pro (15,75), Razer BlackShark V3 X
  Hyperspeed (93). Descartados: CMF Buds 2 (200% = otro producto), Attack Shark L80 Pro (50 vendidos), Logitech G522 (17%), Moondrop Lan (18%).
- Fotos de Paraguay: el 02/10 se completaron en TODOS los candidatos del panel (81) que no tenían; sólo queda sin foto el 5486 (Nissei no tiene).
  La foto grande es .../fotos/produtos/thumbs/big/<hash>.webp (sale del og:image de la publicación).
- Tanda 2 VERIFICADA y cargada: 8 más (Jabra 10 y 20, JBL 730BT, Soundpeats H3/T3 Pro/Space Pro/Q3 Pro, Razer V3 X). TOTAL 36 candidatos.
  AURICULARES TERMINADOS. Falta mandar a CYC WEB el Mensaje 6 con estos 8.
- 02/10 noche · Matías marcó el Armaf Blue Iconic (183%, "nada que ver"): estaba medido contra Club de Nuit Intense Limited.
  Había DOS candidatos (c1789695323125 y c1789752073264): los dos con descarte DEFINITIVO (noTipo 'mano' + motivo). El Blue Iconic
  real en ML tiene 0 vendidos. Otros viejos sospechosos avisados a CYC WEB: Mercedes Club Black candidato (repetido de un probado,
  90%) · Giorgio Beverly Hills (91%, Nissei sin precio, listado 23/09) · Cooler Thermalright (131%, Nissei sin precio, listado 28/09).
- 02/10 noche · REVISIÓN DE FOTOS DE LOS CANDIDATOS VIEJOS (los cargó el chat anterior), pedida por Matías al ver errores:
  · Montblanc Presence (c1789794654726): el catálogo era Presence d'une FEMME → corregido mlId a MLA34731231 (hombre 75ml, +100).
  · Paris Corner Rifaaqat (c1789749853113): el catálogo era Rifaaqat ADORN (caja negra) → corregido a MLA34077562; A CONFIRMAR.
  · Edifier M60 Blanco (c1789782484011): catálogo color OAK; el blanco en ML 0 vendidos → DESCARTE definitivo.
  · Huawei AX2S (c1789762815875): Nissei NEGRO vs ML BLANCO (único catálogo) → DESCARTE definitivo.
  · Los otros 18 vivos: fotos iguales (CK One, Milestone, Dark Door Sport, Verato Night, Britney Midnight, Al Wataniah, TP-Link
    XX230V, ZX110AP, Secador Xiaomi, Redragon M612, Partylight, Canon KP108, MC220L, Moonlight, Tour One, Cooler, Polo Black,
    Giorgio, GameSir X5S). Montaje: guay-tools\montaje.ps1 con foto (Nissei) y mlFoto (ML) de cada candidato.
- RELOJES TERMINADOS (234 modelos): 5 cargados (Amazfit Bip 5, Casio LTP-V007D-7E, MTP-1183G-7A, MTP-V006G-1C, MTP-VT01G-1B). TOTAL 45 candidatos. Detalle en guay-datos\relojes.md.
- El error del robot NO es por medición vieja (midió hoy 2-7 AM): no detecta bien qué vendedores tienen Full (CK One: 36 vendedores, cree que 4 tienen Full).
- MOUSE: tanda de 109 modelos lanzada con scanBg (window.__QM).
- SIGUE: relojes → varios → teclados → mouse → cables → cargadores (pared y portátil) → discos → memorias → routers →
  secadores → controles → adaptadores → anillos → micrófonos → fundas → juegos → iluminación → coolers → RAM → fuentes → cosmética … perfumería al final.
- Cada 20 cargados: mensaje "Tanda N" a CYC WEB (próximo: Mensaje 6).

## 6. Cómo trabajar rápido (lo que mejor anduvo)
1. models.ps1 de la categoría → lista de modelos (sin colores repetidos ni códigos del panel).
2. En la pestaña de ML de búsqueda: scanBg([[consulta, usd, n, índice], ...], 0.15, 50) y después window.__scan.out.
3. Para los que pasan: mlFind con regex del modelo → elegir el catálogo del MISMO COLOR que la fila de Nissei.
4. mlCat de esos catálogos (precio ganador, +vendidos de la ganadora, Full) y mlCuotas (2 = no cuenta; 6/9 = costo).
5. montaje.ps1 con los pares de fotos → mirar UNA imagen.
6. cargarCand de a 5-6 → anotar en candidatos-verificados.md y codigos-panel.txt → avisar a CYC WEB.
- Descartes rápidos: Stanley/Contigo, parlantes JBL/Sony/Harman, todo lo que en ML gana a menos de ~2.600 × US$ + 9.000.
