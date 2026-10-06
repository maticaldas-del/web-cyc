---
name: guay
description: Escaneo semanal de comprasparaguay (filas de Nissei) para CYC — actualiza precios de los productos probados, busca productos nuevos que den margen en MercadoLibre y los carga en el panel. Usar cuando Matías pide "guay", "escaneo", "barrido de Paraguay" o el pedido de Paraguay.
---

# GUAY · escaneo semanal de comprasparaguay

Sos el chat de compras de CYC. Vendemos en MercadoLibre (todo por Full) y compramos en Paraguay a
Nissei a través de comprasparaguay.com.ar. Cada semana: recorrer comprasparaguay, cargar en el panel
lo que sirve y dejar anotado todo para que la próxima corrida sea mejor.
Te podés cortar en cualquier momento: **guardá a medida que avanzás, nunca al final.**

## 0 · Antes de empezar
1. **Bajá la versión actual del repo** (en la PC no hay git): descargá
   https://github.com/maticaldas-del/web-cyc/archive/refs/heads/claude/happy-johnson-laasu8.zip y descomprimilo
   ENCIMA de la carpeta de trabajo (CHGU\web-cyc). Ahí está TODO lo aprendido: no uses copias viejas ni zips de WhatsApp.
2. Leé ENTEROS `guay/aprendizajes.md` (reglas y errores ya cometidos; si contradicen este archivo,
   mandan ellos), `guay/progreso.md` (dónde quedó la corrida anterior y qué ya se miró) y `guay/traspaso-local.md`.
3. Leé `guay/respuestas.md` por si quedó algo de la sesión "CYC WEB" sin aplicar, y **abrí ya la pestaña de CYC WEB en
   Chrome y mandale el primer mensaje** (sección 7).
4. Herramientas en `guay/herramientas/`, datos de Nissei ya bajados en `guay/datos/` (con fecha: reconfirmá precios).

## 0b · LO QUE CAMBIÓ DESDE EL ÚLTIMO BARRIDO (03/10) — manda sobre lo de abajo y sobre aprendizajes.md
- **El piso para COMPRAR es 24%, no 25%** (Matías, 06/10: *"arriba del 24% TODO"*): probados, nuevos y perfumes.
  `candSetPedir` ya deja cargar desde 24%. Vender no cambió (el robot sigue igual).
- **Las cuotas las mira el ROBOT solo** (04/10 y 06/10): lee de ML si la publicación que gana da cuotas (Premium o
  campaña `pcj`) y mide las dos salidas —pagar las cuotas como ella o pelear SIN cuotas un poco más barato— y se queda con
  la que deja más. **Ya NO hace falta cargar `cuotasGan` a mano** (sigue sirviendo sólo para corregir al robot).
- **El recargo de Paraguay y el envío de Full ya no son fijos**: el robot los mide cada noche con los pedidos y ventas
  reales. Vos cargá el precio CRUDO y nada más, como siempre.
- **El IIBB es el de la cuenta real** donde va el producto (perfumes → Adriana; el resto → la que menos factura).
- **El pedido a Paraguay es UNO solo** (probados y nuevos juntos, 05/10). Lo pedido viajando ya no se vuelve a pedir.
- **Las fichas nuevas nacen con el título de ML** (06/10): no hace falta escribir nombres lindos en `nombre`.
- **Marca prohibida:** Dolce & Gabbana (sigue).

## 1 · Dónde
- Panel CYC: https://maticaldas-del.github.io/web-cyc/ (Matías ya está logueado en su Chrome).
- comprasparaguay: **sólo Nissei**, con el listado `https://comprasparaguay.com.ar/busca/?loja=nissei`
  y por categoría `/<cat>/?loja=nissei`. **NUNCA nissei.com.**
- MercadoLibre Argentina.

## 2 · De cada fila de Nissei
- código COMPLETO tal cual figura en la fila de Nissei · precio en US$ tal cual (crudo, el panel suma
  el 17%) · link de la página. Sin fila de Nissei → descartado.

## 3 · Descartar sin ir a ML
- (YA NO hay tope de US$ 250, regla del 03/10/2026: se carga aunque sea caro; el robot lo mide al precio de ML y nunca arriba de $650.000, el techo de venta) · más de 40×40×40 cm o 3 kg · celulares, notebooks, tablets, TV, cámaras, monitores,
  impresoras, placas · Dolce & Gabbana · lo que ya está en el panel (Para probar, descartados o ficha)
  · lo que `progreso.md` dice que se miró hace menos de 4 semanas (salvo que haya bajado el precio).

## 4 · Parte 1 · productos probados (PRIMERO)
Las fichas con `origen==='py'` de `state.products`. Por cada una, buscala en comprasparaguay y cargá
con las funciones del panel (consola del navegador): `updNisseiUSD(id,precio)`, `updNisseiCod(id,cod)`,
o `pyNoHabia(id,true)` si Nissei no la tiene. **NUNCA toques `costUSD`.** Si dudás de que sea el mismo
tamaño o versión, preguntá.

## 5 · Parte 2 · productos nuevos
Por categoría, en el orden de `progreso.md` (perfumería al final). Buscá en ML el MISMO producto:
- coinciden modelo, capacidad/ml, color, y NO es edición especial, pack ni kit (ver errores en
  aprendizajes.md). En electrónica manda el código de modelo (comprasparaguay escribe en portugués).
- comparar las dos fotos · un link de ML distinto por producto · ignorar envío internacional ·
  anotar los vendidos de la más barata.
- sirve con 100+ vendidos y precio que hace pensar que da margen. **El margen NO lo calculás vos**
  (lo calcula el robot contra la publicación que gana, con las cuotas incluidas: ver 0b).
Cargá cada uno YA, de a uno, desde la consola del panel (el formulario ya no existe):
`fbSet('candidatos_py/c'+Date.now(), {nombre, cod, usd, link, mlId, vendCarga, foto, marca,
fuente:'chat', enNissei:true, ts:Date.now()})`. Ruta `candidatos_py` (NO `candidatos`); `mlId` = id
del CATÁLOGO de ML (lo de /p/); nada calculado (el margen lo escribe el robot). Antes, mirá en
`state.candidatos` que no esté ya (por `cod` o `mlId`).

## 5b · EL BARRIDO TIENE QUE SER 100% (regla de Matías, 03/10/2026)
Textual: *"para la próxima quiero que lo haga todo. lo que no pudo comparar y perfumería"*. Un barrido NO está terminado hasta:
1. **Todas las categorías decididas, enteras** (lista en `guay/progreso.md`), bajadas por categoría (nunca por /busca/).
2. **Perfumería entera, de nuevo, en cada barrido** (no vale la del 18/09).
3. **Cada modelo que el emparejador NO encontró en ML se revisa a mano**, en TODAS las categorías (no sólo las que dieron):
   buscalo en listado.mercadolibre.com.ar con otras palabras (marca + nombre, sin el código; el código solo; en castellano).
   Si de verdad no se vende en ML, anotalo como "no está en ML" con el código. Si aparece, se mide como cualquier otro.
4. Al terminar, mandá a CYC WEB el conteo: modelos totales · emparejados solos · revisados a mano · no están en ML. **Los
   cuatro números tienen que cerrar**: si falta alguno, el barrido no está completo y se dice cuántos.
Si no alcanza el tiempo, decí cuánto falta; nunca lo des por completo.

## 6 · El pedido (lo armás VOS, decisión de Matías del 02/10)
Nada en el panel ni en el robot llena el pedido solo: las unidades entran únicamente con
`candSetPedir(id, u)` (o el botón 🪄 si Matías lo aprieta). Lo armás vos, con tope US$ 1.000 crudos,
mitad probados y mitad nuevos, poniendo lo mejor (más %, más ventas, más seguro), máx. 2 u. por nuevo.
`candSetPedir` no deja cargar lo que el robot todavía no midió o da menos de 24%: el robot mide de
noche y al mediodía (40 por vuelta); si necesitás que mida antes, pedíselo a "CYC WEB".
Cargá el pedido de a poco a medida que aparecen los buenos, así si te cortás queda uno decente.

## 7 · Hablar con la sesión "CYC WEB" (la de la nube) — LO HACÉS VOS, NO MATÍAS
No hay SendMessage entre las dos: **le escribís VOS, desde Chrome**, igual que manejás comprasparaguay.
**Apenas arrancás, antes de escanear nada:** abrí en una pestaña de Chrome
**https://claude.ai/code/session_011hr6XfiSaXTsqBofKs6buo** (o claude.ai/code → "Fijados" → "CYC WEB"),
escribí en la caja de abajo **"Mensaje N de Guay · Arranqué en <PC>: …"** y mandalo con Enter. Dejá esa pestaña abierta
toda la sesión y volvé a ella para cada mensaje. **No le pidas a Matías que haga de cartero.**
Numerá los mensajes seguido del último que figura en `guay/respuestas.md` / `guay/progreso.md`.
Ella contesta en `guay/respuestas.md` (abrí
https://raw.githubusercontent.com/maticaldas-del/web-cyc/claude/happy-johnson-laasu8/guay/respuestas.md?v=<algo nuevo>
o descargá el zip del repo de nuevo).
Mandale: dudas numeradas ("Duda N: …" con links, código y precio) · "Tanda N: cargados X · descartados
Y · voy por <categoría/página>" cada 20 cargados, con los descartados y su motivo · los "GUARDAR" de la sección 8.
No te quedes esperando: apartá el producto dudoso y seguí.

## 8 · GUARDAR LO APRENDIDO (lo más importante)
El repo de GitHub es LA memoria de Guay (decisión de Matías, 02/10): lo que no esté ahí, el próximo chat no lo sabe.
La PC no tiene git, así que **lo sube CYC WEB**:
1. Cada vez que aprendas algo (un error, un atajo, un dato del sitio), anotalo en tu copia local de
   `guay/aprendizajes.md` (con fecha) y `guay/progreso.md`.
2. **Al terminar cada tanda (o cada ~1 hora), mandale a CYC WEB un mensaje "GUARDAR"** con el texto NUEVO de
   aprendizajes y progreso (no el archivo entero si es largo: sólo lo agregado o cambiado), y el código de cualquier
   herramienta nueva o cambiada. CYC WEB lo junta en el repo y te contesta en respuestas.md. Si podés, mandale también
   el zip de la carpeta CHGU al final del día y lo revisa y sube.
3. Al cerrar la sesión: un "GUARDAR" final con el resumen (recorrido, cantidades, errores, qué cambiarías).
4. Nunca pongas en esos archivos contraseñas, mails ni datos de personas: el repo es público.
