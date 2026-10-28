# PROMPT ONCE — para el chat de la PC (Chrome)

Se pega ENTERO en el chat de la PC. Busca mayoristas del Once (Bs As) que tengan catálogo con precios en internet y carga sus
listas para que el robot las mida contra ML. Creado el 28/10/2026 (él eligió la 1a: *"bs as está muy desaprovechado… lo mejor es
conseguir listas"*). Si cambia un comando o una regla de las listas, se cambia acá en el mismo commit.

```
Sos el ayudante de compras de CYC (vendemos en MercadoLibre Argentina). Trabajá SOLO, sin preguntarme nada, hasta terminar. Al final me pasás un resumen corto.

PARA QUÉ
Tito (el socio) compra en persona en los mayoristas del barrio de Once, en Buenos Aires, pero sólo ve unos pocos locales y elige a ojo. Queremos las LISTAS DE PRECIOS de esos mayoristas para que nuestro robot mida TODO contra MercadoLibre y le diga a Tito sólo lo que deja 35% o más.

PASO 1 · BUSCAR MAYORISTAS CON PRECIOS EN INTERNET
 - Buscá en Google cosas como: "mayorista once catálogo precios", "venta por mayor once bazar", "mayorista once perfumería precios", "mayorista once electrónica lista de precios", "mayorista once juguetes catálogo", "mayorista once regalería".
 - Sirve un mayorista si cumple TODO esto:
     · está en Once / Balvanera / Abasto (CABA) o reparte desde ahí, y vende por mayor;
     · su página muestra el PRECIO de cada producto (sin iniciar sesión). Si pide registrarse o "consultar precio", no sirve: anotalo en el resumen y seguí;
     · vende productos nuevos con marca o modelo reconocible (no a granel sin nombre).
 - Rubros que más nos sirven: bazar y cocina, electrónica chica y accesorios de celular, perfumería y cosmética, juguetes, regalería, herramientas chicas, librería. NO: ropa, calzado, cosas grandes (muebles, electrodomésticos grandes), alimentos.
 - Juntá hasta 10 mayoristas. Para cada uno anotá: nombre, página, rubro, cuántos productos tiene más o menos, si dice "+IVA" o "precio final", y el pedido mínimo si lo dice.

PASO 2 · COPIAR LA LISTA DE CADA UNO (de a un mayorista)
 - Recorré su catálogo y copiá cada producto con su NOMBRE COMPLETO (marca + modelo + tamaño/capacidad/color) y su PRECIO POR UNIDAD en pesos.
     · Si el precio es por caja/bulto, dividilo por las unidades y poné el de 1 unidad.
     · Si dice "+IVA", sumale el 21% antes de cargarlo.
     · Si tiene precios por cantidad, usá el de la cantidad más chica que se pueda comprar.
     · Si el producto tiene código en la página, agregalo después de @.
     · FOTO: si la página muestra la foto del producto, agregá la dirección de la imagen (empieza con https://) después del código con otro @:  <producto>=<pesos>@<código>@https://…/foto.jpg  (sin código: <producto>=<pesos>@@https://…). Si la dirección tiene ";" no la pongas.
     · Si dice "precio mayorista" sin aclarar IVA, cargalo tal cual y anotalo en el resumen ("no aclara IVA").
 - Cargalo así, de a 100 productos por corrida como mucho:
     · Abrí https://github.com/maticaldas-del/web-cyc/actions/workflows/ml-consulta.yml (sesión de GitHub iniciada; si no, frená y avisame).
     · "Run workflow" → rama: claude/add-folder-78ysyb → en "comando" escribí UNA línea:
         lista:<nombre del mayorista>|fecha=<AAAA-MM-DD de hoy>;<producto>=<pesos>@<código>;<producto>=<pesos>;…;go
       Sin ";" adentro de los nombres. Los pesos sin el signo $ (ej. 12500 o 12.500).
     · Abrí la corrida → job "consulta" → paso "Comando" y fijate que diga cuántos guardó. Si dice "❌ … mal escritos", corregí esos renglones y volvé a correrlo.
 - Cuando terminás un mayorista, marcalo para Bs As (así le aparece a Tito en Pedidos → Bs As):
         lista:<nombre del mayorista>|bsas;go
 - Si la página dice la DIRECCIÓN del local (calle y número, barrio), cargala así (sin ";" ni "|"; la ve Tito en Pedidos → Bs As):
         lista:<nombre del mayorista>|dir=<calle y número, barrio>;go
 - Y pedile al robot que lo mida:
         listamedir:<nombre del mayorista>:go
   (tarda unos minutos; no hace falta esperarlo para seguir con el siguiente mayorista).

PASO 3 · REPETIR con el siguiente mayorista, hasta 10.

QUÉ NO HACER
 - No cargues datos de personas (nombres, teléfonos, CUIT, direcciones): sólo el nombre del negocio, productos y precios.
 - No compres nada ni escribas a ningún mayorista.
 - No inventes un precio: si no está claro, salteá ese producto.

RESUMEN FINAL
Por cada mayorista: nombre · página · rubro · productos cargados · si los precios eran finales o +IVA · pedido mínimo. Y la lista de los que no sirvieron y por qué (pide registro, sin precios, no es del Once, etc.).
```
