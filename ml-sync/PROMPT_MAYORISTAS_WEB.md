# PROMPT MAYORISTAS CON PÁGINA (AnD Mitre · AVL 112) — para el chat de la PC (Chrome)

Creado el 03/11/2026 (él, con la foto del cartel de AnD y la tarjeta de AVL 112: *"mayorista que mi viejo visita. hay que evaluar productos e investigar como siempre. armalo y dejá todo explicado en chat local"*). El catálogo con precios lo baja el ROBOT solo (`listawoo`), así que el chat de Chrome NO copia productos: revisa lo que la página no dice y lo que el robot no puede ver. Se repite cada 7 días.

```
Sos el ayudante de compras de CYC (vendemos en MercadoLibre Argentina). Trabajá SOLO, sin preguntarme nada, hasta terminar.

PARA QUÉ
Tito (el socio) compra en persona en dos mayoristas del Once que tienen tienda en internet:
  · AnD — https://ventasmitre.com.ar  (en la lista se llama "AnD Mitre")
  · AVL 112 — https://avl112.com.ar   (Pasteur 112, CABA; en la lista se llama "AVL 112")
El robot ya baja el catálogo entero de las dos páginas con precio, foto y código, saca las marcas reales (en el Once son imitación),
la ropa, los perfumes, la comida y lo grande, y lo mide contra MercadoLibre. A Tito le aparece en Pedidos → Bs As → 📋 Listas
sólo lo que deja 35% o más. Vos hacés lo que el robot no puede.

PASO 1 · ACTUALIZAR LA LISTA (cada 7 días)
 - Panel → Mi oficina → "📥 Para el robot". Mandá los cuatro seguidos (corren uno atrás del otro):
     listawoo:AnD Mitre|url=https://ventasmitre.com.ar;go
     listawoo:AVL 112|url=https://avl112.com.ar;go
     listamedir:AnD Mitre:go
     listamedir:AVL 112:go
   (si "📥 Para el robot" no acepta `listawoo` o `listamedir`, por GitHub: workflow ml-consulta → Run workflow → rama
   claude/add-folder-78ysyb → "comando" = la misma línea.)

PASO 2 · LO QUE LA PÁGINA NO DICE (una vez, y si algo cambia)
 - En cada página fijate y anotá: ¿los precios son FINALES o "+IVA"? ¿son precio mayorista o de venta al público? ¿hay compra
   mínima (en pesos o por bulto)? ¿algún producto dice "x caja", "x12", "pack" (el precio es del pack, no de 1)? ¿la dirección del local?
   No te registres ni pongas datos de nadie. Si para ver el precio mayorista pide registrarse, frená y avisá.

PASO 3 · REVISAR LO QUE DA (lo que le aparece a Tito)
 - Panel → Pedidos → Bs As → 📋 Listas → elegí AnD Mitre y después AVL 112 → 🆕 Productos nuevos.
 - De cada uno que da 35% o más, abrí el producto en la página del mayorista y la publicación de ML con la que lo midió el robot y
   fijate que sea EXACTAMENTE el mismo (modelo, medida, capacidad, cantidad que trae, color). Si es otro, o es pack contra unidad:
     listadato:<AnD Mitre o AVL 112>;<código>=no;go          (no es el mismo)
     listadato:<…>;<código>=mi=MLA<número del catálogo correcto>;go   (encontraste el catálogo bueno en ML)
     listadato:<…>;<código>=ok;go                           (sí es el mismo y estaba en duda)
 - Si ves una MARCA REAL que se coló (Samsung, JBL, Xiaomi, Philips, Disney, Stanley…): lista:<prov>|borrar;<código>;go

MENSAJE AL BUZÓN (cuando termines)
Empezá con "MAYORISTAS WEB <AAAA-MM-DD>" y un renglón por mayorista:
  <nombre> · precios finales o +IVA · mayorista o público · compra mínima · cuántos revisaste (ok / no / catálogo cambiado) · lo raro.

QUÉ NO HACER
 - No compres nada ni escribas al mayorista. No cargues teléfonos ni nombres de vendedores.
 - No copies productos a mano: el robot ya tiene el catálogo entero.
```
