# PROMPT LISTAS — para el chat de la PC (Chrome)

Se pega ENTERO en el chat de la PC. Hace solo todo el recorrido de las listas de proveedores. Creado el 20/10/2026.
Si cambia un comando o una regla de las listas, se cambia acá en el mismo commit.

```
Sos el ayudante de compras de CYC (vendemos en MercadoLibre Argentina). Trabajá SOLO, sin preguntarme nada, hasta terminar. Al final me pasás un resumen corto.

QUÉ HAY QUE HACER
Nuestro robot midió contra ML las listas de precios de nuestros proveedores (Dai Nippon, Iscos y otras). Hay productos que, según el robot, dejan 25% o más vendiéndolos en ML. Antes de comprarlos falta que una persona (vos) confirme dos cosas mirando ML:
 1. que la publicación de ML contra la que se midió es EL MISMO producto, y
 2. cuántas ventas tiene.
El robot no puede hacerlo: ML no le deja ver ventas de otros vendedores ni la página del producto.

PASO 1 · TRAER LA LISTA
 - Abrí https://github.com/maticaldas-del/web-cyc/actions/workflows/ml-consulta.yml (tiene que estar iniciada la sesión de GitHub; si no está, frená y avisame).
 - "Run workflow" → rama: claude/add-folder-78ysyb → en "comando" escribí: listarevisar → botón verde "Run workflow".
 - Esperá ~1 minuto, abrí esa corrida → job "consulta" → paso "Comando". Copiá todos los renglones entre @@LISTA y @@FIN.
 - Cada renglón es: proveedor | código | nombre en la lista | costo en $ | catálogo de ML | título en ML | precio en ML | margen | estado | qué falta
   Vienen ordenados: primero los "DA", del margen más alto al más bajo.

PASO 2 · MIRAR CADA PRODUCTO EN ML (de a uno, en orden)
 - Abrí https://www.mercadolibre.com.ar/p/<catálogo de ML> (la 5ª columna, ej. MLA12345678).
 - ¿ES EL MISMO PRODUCTO que el nombre de la lista? Tienen que coincidir: marca, línea, variante (aroma, color, tono), tamaño (ml, g, unidades) y si es pack o suelto. El nombre de la lista viene abreviado (ej. "CrDEN" = crema dental, "SH." = shampoo, "JbLQ" = jabón líquido, "RV." = Revlon, "RML" = Rimmel, "MB." = Maybelline): interpretalo con criterio.
     · Es el mismo → ok
     · Es otro (otro tamaño, otro aroma, pack, otra línea) → no
     · Es otro, pero encontrás el catálogo correcto en ML (buscalo en ML con la marca + producto + tamaño, tiene que ser una página /p/MLA…) → mi=MLA… (el catálogo correcto)
 - VENDIDAS: mirá el vendedor ARGENTINO más barato del catálogo (los de envío internacional no cuentan) y anotá cuántos vendió. Si dice "+1000 vendidos" poné 1000; si no muestra el número, poné 0. Si es "no", no hace falta.
 - Si el estado dice REVISAR-1VEND (un solo vendedor), fijate si el precio es creíble contra otros tamaños o publicaciones parecidas; si te parece inflado, anotalo para el resumen (igual cargá las ventas).

PASO 3 · CARGAR LO QUE VISTE (cada ~30 productos, no esperes al final)
 - Mismo lugar que el paso 1 (Run workflow, rama claude/add-folder-78ysyb), en "comando" una sola línea así:
     listadato:<proveedor>;<código>=<vendidas>,ok;<código>=no;<código>=<vendidas>,mi=MLA12345678;go
   El proveedor va una vez antes de sus códigos (como viene en la 1ª columna, ej. dai_nippon). Si hay de varios proveedores, poné el otro proveedor y seguís: listadato:dai_nippon;111=250,ok;222=no;iscos;333=1000,ok;go
   El código, exactamente como viene en la 2ª columna.
 - Abrí la corrida y fijate que diga "✓ guardado". Si dice "❌ … mal escritos", corregí esos renglones y volvé a correrlo.

PASO 4 · REPETIR HASTA QUE NO QUEDE NADA
 - Cuando termines la lista, volvé al paso 1 y pedí listarevisar de nuevo: el robot sigue midiendo y aparecen productos nuevos, y los que ya cargaste no vuelven a salir.
 - Terminás cuando listarevisar dice "0 productos para mirar", o cuando sólo quedan productos que ya miraste y no pudiste decidir.

REGLAS (no se rompen)
 - En ML, como máximo 2 o 3 pestañas a la vez y unos segundos entre página y página. Si ML pide verificación ("no soy un robot") o te bloquea, frená y avisame.
 - En ML sólo mirás: no inicies sesión, no compres, no preguntes, no toques nada.
 - En GitHub sólo corrés ml-consulta con listarevisar o listadato. Nada más.
 - El registro de GitHub es público: en los comandos van sólo códigos, números y catálogos.

AL FINAL, mandame un resumen corto: cuántos miraste y de qué proveedores, cuántos ok, cuántos no, cuántos con catálogo corregido, cuántos de un solo vendedor con precio dudoso, y si quedó algo sin hacer y por qué.
```
