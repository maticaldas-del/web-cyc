# Progreso del escaneo semanal (lo mantiene la sesión "CYC WEB")

## Corrida del 02/10/2026 (en curso)
- Método: listado `?loja=nissei` (13.905 productos), por categoría.
- Parte 1 (probados, 44 fichas py): **TERMINADA el 02/10**. 13 "no había": Halloween 100ml, Philips TAT2206,
  PS Portal, VS BLISS, VS STARLIT, Azzaro PH 200ml (sólo 100ml), Cabotine 30ml (sólo 100ml), Adyan Oud
  Essential, Sennheiser CX 80S (sólo CX 80U), Galaxy A06 128 (sólo 64GB), Redmi Watch 4, SanDisk Ultra 128
  c/adaptador. Galaxy A07: es el de 64GB (la publicación de ML está mal como 128GB, la corrige Matías) → 145173 US$ 117.
- Parte 2 (nuevos): arrancó el 02/10 ~17:00 por /<categoria>/?loja=nissei, perfumería al final.
  - Termos: mirados, no dan (02/10).
  - Auriculares: en curso (Sony MDR-ZX110 y QCY T13 prometen, en verificación).
- Copia local del chat: GUAY-TRASPASO.md en la PC de Matías (y guay/traspaso-local.md en esta carpeta).
- **Parte 2, detalle del chat local (02/10 tarde):**
  - Nissei bajado entero por categoría a guay-datos\ (34 categorías; auriculares 683, relojes 618, varios 391,
    teclados 300, mouse 270, parlantes 259, cables 185, cargadores 116, discos 111, termos 107, memorias 93,
    routers 97, secadores 98, controles 93, adaptadores 77, power banks 72, anillos 129, micrófonos 76, fundas 166,
    juegos 86, iluminación 85, coolers 157, RAM 104, fuentes 87, filamento 149, robots 77, cafeteras 76, flash 82,
    accesorios cámara 218, + cosmética/labial/base/shampú/perfume).
  - Auriculares: tanda 1 medida en ML (109 de 438 modelos). Pasaron el filtro grueso ~40; verificados hasta ahora:
    · Sony MDR-ZX110 (sin mic) Blanco 12746 / Rosa 12745 / Negro 12743 · US$13 · ML MLA6072235 (blanco, $54.999,
      Full, +100 ganadora) y MLA6072234 (rosa $55.526).
    · QCY T13 (BT 5.1) Negro 80230 · US$16,50 · ML MLA18651964 ($51.000, Full, +1000) · ~23% estimado, al límite.
  - Parlantes: tanda lanzada (30 modelos).
  - Pendientes de medir: auriculares 110-438, relojes, varios, teclados, mouse, cables, cargadores, etc.

## Ya mirado (no repetir antes de 4 semanas salvo que baje el precio)
- Perfumería: barrida entera el 18/09 (1.227 filas).


## ESTADO DEL BARRIDO (corregido 02/10)
54% de Nissei (7.487 de 13.905). Enteras: auriculares, relojes, mouse, parlantes, termos, perfumería. Casi: teclados,
cables. A ojo (hay que rehacerlas enteras): cargadores, discos, memorias, routers, joysticks, micrófonos, secadores,
varios, adaptadores, iluminación, juegos, PC, cosmética, flash, cámara, fundas. Sin mirar: labial, base, shampú, anillos.
**Pendiente:** lista de categorías aprobadas / descartadas (con motivo) que pasa Matías.


## CATEGORÍAS DECIDIDAS (Mensaje 17, 02/10) — el que siga en otra PC arranca de acá
La tienda Nissei muestra 50 categorías grandes (10.127 productos); las otras ~3.800 filas están en categorías chicas que
no aparecen en el filtro.
**SE MIRAN SIEMPRE (enteras):** las 34 de siempre (7.487) + **lente (268)** + **funda-maletin-mochila-para-notebook (118)**.
**DESCARTADAS ENTERAS sin comparar (2.155)** — pasan el tope de US$ 250 o de 40×40×40 cm / 3 kg: celular 468 · notebook 253 ·
tablet 210 · tv 95 · monitor 132 · impresora 104 · placa-madre 147 · placa-de-video 90 · camara-digital 185 · filmadora 90 ·
camara-de-monitoreo-dvr 222 · computadora 73 · silla-gamer 85 · gabinete-kit 101.

**PENDIENTE, en este orden:**
 1. Bajar la tienda entera: `nissei-harvest.ps1 -Slugs busca,lente,funda-maletin-mochila-para-notebook` (en la PC vieja
    quedó corriendo y probablemente se cortó al cerrar: empezar de nuevo).
 2. Agrupar por categoría las ~3.800 filas chicas y decidir cada categoría (mirar entera o descartar con motivo).
 3. Pasar ENTERAS las que se miraron a ojo: cargadores, discos, memorias, routers, joysticks, micrófonos, secadores,
    adaptadores, iluminación, juegos, coolers, RAM, fuentes, cosmética, flash, cámara, fundas.
 4. Pasar las no miradas: labial, base, shampú, anillos, filamento, robots, cafeteras + lente y mochilas.

**Pedido del 02/10:** ya aprobado (Respuestas 21, 22 y 23 en `guay/respuestas.md`): Animale For Men x2 + nuevos hasta
~US$ 1.000. **Falta cargar las unidades** y que CYC WEB lo verifique. 58 candidatos cargados ese día.

**Mensaje 18 (02/10, 15:50):** **VARIOS quedó COMPLETO** (219 modelos, sin elegir a ojo). Total cargados por el Guay del
02/10: 59. En la PC vieja quedaron además `guay-datos/categorias-decision.md` y `guay-tools/funciones-chrome.js` con
`evalLoose` (si no están en el repo, pedírselos a Matías en el zip de CHGU).

**Mensaje 19 (02/10, 15:50):** terminó la descarga de la tienda entera, pero **la búsqueda corta en 500 páginas = 10.000
filas** (no 13.905) y 5.854 vienen sin categoría. Mostró 154 categorías (lista en `guay-datos/categorias-busca.txt` de la
PC vieja). **Para llegar a las 13.905 hay que bajar CATEGORÍA POR CATEGORÍA, no por la búsqueda.**
**Categorías chicas nuevas para decidir (falta que Matías apruebe):** Pendrive · GPS · Hub & Switch · Proyector ·
Planchita/alisador · Modelador · Afeitadora · Cortapelo · Cepillo eléctrico · Anteojos · Pilas · Termo · Lector de código
de barras · Domótica · Gimbal · Teléfono · Procesador · Cartucho de tinta.
**Probable descarte por peso/tamaño (confirmar con Matías):** licuadora · air fryer · plancha · batidora · tostadora ·
freidora · monopatín · silla gamer · consolas.
**Mensaje 20:** el corte en 10.000 es un límite del sitio (500 páginas × 20), no de la descarga. Regla en
`aprendizajes.md`: el barrido completo se baja SIEMPRE por categoría, nunca por `/busca/`.

## DECIDIDO POR MATÍAS (02/10): CATEGORÍAS CHICAS
**APROBADAS (se miran enteras):** Pendrive · GPS · Hub & Switch · Proyector · Planchita/alisador · Modelador ·
Afeitadora · Cortapelo · Cepillo eléctrico · Anteojos · Pilas · Termo · Lector de código de barras · Domótica · Gimbal ·
Teléfono · Procesador · Cartucho de tinta.
**DESCARTADAS ENTERAS (peso/tamaño):** licuadora · air fryer · plancha · tostadora · freidora · monopatín · silla gamer ·
consolas.
**Batidora NO se descarta entera:** CYC ya vende una (Luciana). Se mira producto por producto y sólo se deja afuera lo que
pasa los 40×40×40 cm / 3 kg.

## TANDA 1 DEL BARRIDO COMPLETO (02/10 16:50, Mensaje 22)
**Pasadas enteras por ML:** cargadores (pared y portátil), discos, memorias, routers, joysticks, micrófonos, secadores,
adaptadores, iluminación, coolers, RAM, fuentes.
**Corriendo (11 pestañas):** juegos (búsqueda propia), flash, cámara, fundas, cosmética, las 18 chicas aprobadas, labial,
base, shampú, anillos, filamento, robots, cafeteras, lente, mochilas.
**Cargados 11:** Lexar SD 800x Pro 64GB · Huawei AX2S blanco · Sandisk Extreme microSD 128 · adaptador PC PS VR2 · Thermalright
Phantom Spirit 120 SE · aro Godox LR150 · Baseus Picogo AM41 · sérum Medicube azelaico · tapa lente Sony ALC-F49S · Truss
Amino protector térmico · laca Schwarzkopf Silhouette.
**Conteo de categorías (sitemap):** siempre 7.760 filas · descartadas 2.300 · chicas aprobadas 960 · **SIN DECIDIR 208
categorías, ~3.025 filas** (las grandes: ups, rubor, sombra de ojos, aspiradora, accesorios GoPro, otros electrodomésticos,
lápiz, batería, dron, corrector, polvo, resina 3D, taza térmica, gloss, webcam, micrófono, concentrador USB, depiladora,
mochilas, desodorante, estación de energía, aparador de vello, pulsera de reloj, softbox, soporte celular, ventilador…).
Herramientas nuevas en la PC nueva (`C:/cyc/CHGU/guay-tools`): q-build.ps1, nrow.ps1, hits.ps1, serve.ps1, cat-probe.ps1
— **falta subir el código** (viene en el próximo GUARDAR).

## TANDA 2 (02/10 ~19:30, Mensaje 23)
Chrome estuvo desconectado de 17 a 19:30 y volvió con el perfil limpio. **Terminadas:** juegos, flash, cámara, fundas,
cosmética y las 27 bajadas ese día (18 chicas + labial, base, shampú, anillos, filamento, robots, cafeteras, lente,
mochilas). **De las 208 sin decidir** (decisión de Matías: lo obvio afuera): 63 descartadas enteras (grandes, pesadas,
comida, bebida, ropa, calzado, vapeador…) y **145 pasándose enteras** (~2.300 filas, 1.545 modelos) con 8 pestañas.
Cargados: Lexar SSD SL300 1TB · Sandisk Extreme Go 256 · Shampoo Truss Therapy · Switch TP-Link TL-SF1009P · Mario 3D
All-Stars · Nikon AF 50mm f/1.8D. Descartados de la R26: Sandisk 128, Thermalright, Godox LR150, laca.

## TANDA 3 (02/10 noche, Mensaje 26): LAS 145 CATEGORÍAS CHICAS PASADAS ENTERAS (1.450 modelos)
**Estado del barrido completo:** pasadas ENTERAS cargadores, discos, memorias, routers, joysticks, micrófonos, secadores,
adaptadores, iluminación, juegos, coolers, RAM, fuentes, flash, cámara, fundas, cosmética, labial, base, shampú, anillos,
filamento, robots, cafeteras, lente, mochilas, las 18 chicas aprobadas y las 145 chicas (63 obvias afuera). De antes:
auriculares, relojes, mouse, parlantes, termos, varios, perfumería. **Falta para el 100%: teclados y cables.**
**Cargados (7):** softbox Godox SB-BW 70x100 · GoPro The Handler · detector AccuBanker LED430 · Hikvision DS-K1T343MWX ·
pinceles Real Techniques Eye Essentials · TP-Link RE450 · Casio FX-991MS 2nd Ed.
**Descartados:** Hikvision DS-KAS321 (ML es kit con cerradura) · 3nStar TA040 (~12%) · subwoofer Sony (tamaño) · amplificador
Sony XM-N502 · Stanley Beer Pint · DJI Neo (ML es Neo 2) · Epson ES-50 (23%) · accesorios GoPro/Insta360/fundas Switch.
**Maquillaje:** el emparejador los encuentra, pero en ML casi no venden o se venden baratos: ninguno da.
Total cargados por el Guay del 02/10 (PC nueva): 32 nuevos.


## ✅ BARRIDO COMPLETO 02/10/2026 (Guay, PC nueva) — ESTE ES EL ESTADO QUE VALE (reemplaza los anteriores)
Nissei en comprasparaguay: 277 categorías con filas, ~14.045 filas (contadas con sitemap-categorias.xml + /<slug>/?loja=nissei).
· **ENTERAS** (pasadas por ML sin elegir a ojo): auriculares, relojes, mouse, parlantes, termos, varios · cargadores pared y
  portátil, discos, memorias, routers, joysticks, micrófonos, secadores, adaptadores, iluminación, juegos, coolers, RAM,
  fuentes, flash, accesorios cámara, fundas celular, cosmética, labial, base, shampú, anillos, filamento, robots, cafeteras,
  lente, mochilas notebook, teclados, cables · las 18 chicas aprobadas: pendrive, gps, concentrador-y-switch, proyector,
  planchaalisador, moldeador-de-cabello, afeitadora, cortadora-de-cabello, cepillo-electrico, anteojos, pila,
  lector-de-codigo-de-barras, automatizacion-del-hogar, estabilizador-de-imagen-gimbal, telefono, procesador,
  cartucho-de-tinta, batidora-minipimer · las 145 chicas restantes (lista en guay-datos/cats-chicas-mirar.txt de la PC).
  Perfumería: entera el 18/09 (repetir desde el 16/10).
· **DESCARTADAS ENTERAS sin comparar (Mensaje 17):** celular, notebook, tablet, tv, monitor, impresora, placa-madre,
  placa-de-video, camara-digital, filmadora, camara-de-monitoreo-dvr, computadora, silla-gamer, gabinete-kit, licuadora,
  freidora-electrica, plancha, tostadora-sandwichera, monopatin, videoconsola.
· **DESCARTADAS ENTERAS (02/10, Matías: lo obvio afuera — grandes, pesadas, comida, bebida, ropa) (63):** ups, aspiradora,
  otros-electrodomesticos, olla-electrica, estacion-de-energia-portatil, aire-acondicionado, air-fryer, soporte-para-tv,
  cocina-electrica, grill-electrico, microondas, energia-eolica-y-solar, horno-electrico, home-theater-receptor,
  silla-y-mesa, procesador-de-alimentos, equipo-de-sonido-radio, bebedero-filtro-de-agua, scooter, calefactor,
  compresor-de-aire, sonar, servidor, subwoofer, escritorio-gamer, hidrolavadora, radio-reproductor-de-cd-automotriz,
  cinturon, reproductor-de-dvd-automotriz, valija, taladro-atornillador, heladera, tocadiscos, musculacion-gimnasia,
  central-multimedia, trituradora-de-papel, bicicleta-eletrica, extractor-de-jugo, media, lavarropas-secarropas, amoladora,
  remeras-y-camisetas, moto-electrica, caja-fuerte, olla, robo-cortador-de-grama, purificador-de-aire, caja-registradora,
  chocolate, pantalones-y-bermudas, gorra, vapeador-pod, ropa-de-abrigo, licor, equipos-para-motociclismo, boxeo, cerveza,
  zapatillas-y-calzado, whisky, golf, cama-mesa-bano, otras-bebidas, pochoclera.
· **Próximo barrido:** el mismo método por categoría, en ~4 semanas (o antes si baja un precio).
· Cargados por el Guay del 02/10 (PC nueva): 25; descartados después por CYC WEB 5 → 20 vivos.
