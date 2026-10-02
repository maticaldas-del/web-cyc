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
1. `git pull` en esta carpeta (trae lo que aprendió la sesión anterior).
2. Leé ENTEROS `guay/aprendizajes.md` (reglas y errores ya cometidos; si contradicen este archivo,
   mandan ellos) y `guay/progreso.md` (dónde quedó la corrida anterior y qué ya se miró).
3. Leé `guay/respuestas.md` por si quedó algo de la sesión "CYC WEB" sin aplicar.

## 1 · Dónde
- Panel CYC: https://maticaldas-del.github.io/web-cyc/ (Matías ya está logueado en su Chrome).
- comprasparaguay: **sólo Nissei**, con el listado `https://comprasparaguay.com.ar/busca/?loja=nissei`
  y por categoría `/<cat>/?loja=nissei`. **NUNCA nissei.com.**
- MercadoLibre Argentina.

## 2 · De cada fila de Nissei
- código COMPLETO tal cual figura en la fila de Nissei · precio en US$ tal cual (crudo, el panel suma
  el 17%) · link de la página. Sin fila de Nissei → descartado.

## 3 · Descartar sin ir a ML
- más de US$ 250 · más de 40×40×40 cm o 3 kg · celulares, notebooks, tablets, TV, cámaras, monitores,
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
  (lo calcula el robot contra la publicación que gana; las cuotas NO se cuentan).
Cargá cada uno YA, de a uno, desde la consola del panel (el formulario ya no existe):
`fbSet('candidatos_py/c'+Date.now(), {nombre, cod, usd, link, mlId, vendCarga, foto, marca,
fuente:'chat', enNissei:true, ts:Date.now()})`. Ruta `candidatos_py` (NO `candidatos`); `mlId` = id
del CATÁLOGO de ML (lo de /p/); nada calculado (el margen lo escribe el robot). Antes, mirá en
`state.candidatos` que no esté ya (por `cod` o `mlId`).

## 6 · El pedido (lo armás VOS, decisión de Matías del 02/10)
Nada en el panel ni en el robot llena el pedido solo: las unidades entran únicamente con
`candSetPedir(id, u)` (o el botón 🪄 si Matías lo aprieta). Lo armás vos, con tope US$ 1.000 crudos,
mitad probados y mitad nuevos, poniendo lo mejor (más %, más ventas, más seguro), máx. 2 u. por nuevo.
`candSetPedir` no deja cargar lo que el robot todavía no midió o da menos de 25%: el robot mide de
noche y al mediodía (40 por vuelta); si necesitás que mida antes, pedíselo a "CYC WEB".
Cargá el pedido de a poco a medida que aparecen los buenos, así si te cortás queda uno decente.

## 7 · Hablar con la sesión "CYC WEB" (la de la nube)
No hay SendMessage entre las dos. Se le escribe en su chat (Matías lo tiene abierto en Chrome) y ella
contesta en `guay/respuestas.md` (hacé `git pull` o abrí
https://raw.githubusercontent.com/maticaldas-del/web-cyc/claude/happy-johnson-laasu8/guay/respuestas.md?v=1).
Mandale: dudas numeradas ("Duda N: …" con links, código y precio) · "Tanda N: cargados X · descartados
Y · voy por <categoría/página>" cada 20 cargados, con los descartados y su motivo · "Parte 1 terminada".
No te quedes esperando: apartá el producto dudoso y seguí.

## 8 · GUARDAR LO APRENDIDO (lo más importante)
Esta carpeta es un repo de git. Cada vez que aprendas algo (un error, un atajo, un dato del sitio):
1. agregalo arriba en `guay/aprendizajes.md` con fecha;
2. actualizá `guay/progreso.md` (categoría/página donde vas, cantidades, ya mirado);
3. `git add guay && git commit -m "guay: <qué>" && git pull --rebase && git push`.
Si el push falla, no pares: guardalo en los archivos igual y avisale a "CYC WEB" con el texto.
Al cerrar la sesión: resumen (recorrido, cantidades, errores, qué cambiarías) en los dos archivos y push.
