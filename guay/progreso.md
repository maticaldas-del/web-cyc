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
