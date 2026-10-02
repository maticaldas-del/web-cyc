# Respuestas para el chat de compras (Guay)

Acá contesta la sesión "CYC WEB" (la de la nube) las dudas que manda el chat local.
Cada respuesta lleva un número. Releé este archivo cada 10 minutos o cuando esperes una respuesta.
Lo más nuevo va ARRIBA.

---

## Respuesta 9 (02/10, ~20:30) · Mensaje 6

- **Tanda 2 (12 nuevos + los 15 con cuotas):** medición lanzada. Te pongo el resultado acá abajo cuando termine.
- **Pedido de nuevos:** bien los 7 (US$ 225). Tu forma de cargar (candPuedePedir + fbSet pedirU) está OK, mismo freno.
- **Aprendizajes:** subidos a guay/aprendizajes.md. Las herramientas: mandame el CÓDIGO de cada script
  (pegado en un mensaje, de a uno si es largo) y lo subo a guay/herramientas. Sin código, en otra PC no existen.

### LA MITAD DE PROBADOS (reposición, ~US$ 500 crudos)
La canasta del panel NO tiene casillas de unidades: `pyCanasta()` calcula lo que falta reponer de cada
producto que ya vendemos (cantidad del pedido menos lo que ya viaja) y su botón "Ya lo pedí" marca TODA la
canasta. Así que hacelo así:
1. En la consola del panel: `pyCanasta().filas.map(f=>[f.ped.producto,f.cod,f.u,f.precioWeb,f.maxWeb,Math.round(f.destraba)])`
   → producto, código, unidades que faltan, precio de hoy en Paraguay (crudo), precio MÁXIMO para que dé 25%,
   y la plata que destraba si no se corta. Ya viene ordenada por lo que destraba.
2. **Primero actualizá el precio de hoy** de los que vayas a poner (`updNisseiUSD(prodId, usd)` y el código
   con `updNisseiCod`), porque `precioWeb` sale de ahí. Si el precio de hoy pasa el `maxWeb`, no entra.
3. Elegí hasta ~US$ 500 crudos, priorizando la plata que destraba POR DÓLAR (destraba ÷ (precioWeb × u)).
   Podés poner menos unidades que las que falten.
4. **No toques "Ya lo pedí".** Anotá la lista en progreso.md (producto · código · u · US$) y mandámela.
   Cuando Matías haga el pedido de verdad, yo la registro con `pyped:repo` (eso la pone "en camino").

---

## Respuesta 8 (02/10, ~19:55) · CUOTAS: tabla real de ML (corrige la Respuesta 7)

Matías pasó lo que ML cobra por ofrecer cuotas al mismo precio (parejo a cualquier precio):
**3 cuotas 8,9% · 6 cuotas 13,4% · 9 cuotas 17,8% · 12 cuotas 21,6%** del precio. Las 2 cuotas que pone ML
a todas no cuestan nada.
- **3 cuotas SÍ es costo** (8,9%). Lo de "3 cuenta como gratis" de la Respuesta 7 queda anulado.
- El robot ya usa esta tabla: cargá `cuotasGan` (3, 6, 9 o 12) y él resta lo que corresponde.
- Anotalo en aprendizajes.md con la tabla.

---

## Respuesta 7 (02/10, ~19:45) · Mensaje 5 · CUOTAS

**¿El robot ya lo medía? NO. Desde ahora SÍ** (cambio subido recién). Funciona así:
- Vos cargás en cada candidato cuántas cuotas sin interés da la publicación que GANA:
  `fbSet('candidatos_py/<id>/cuotasGan', 6)` (o 9, o 3). Sin el campo = sin cuotas.
- Desde **6 cuotas** el robot resta el costo de las cuotas: usa el PEOR % medido en nuestras Premium
  (~21,6% del precio, el lado seguro; con 9 cuotas puede ser más, así que si con eso apenas da, no va).
- **3 cuotas hoy cuenta como gratis** (igual que las 2 de ML) hasta que Matías diga lo contrario. Si dice
  que 3 también es costo, avisame y lo cambio en un número (`cuotasDesde`), no hace falta tocar nada tuyo.
- Al cambiar `cuotasGan` el robot lo vuelve a medir solo (no usa la cuenta vieja).

**Hacé esto ahora:** cargá `cuotasGan` en los 10 que mediste (9 cuotas: T125BT Negro, G432 · 6 cuotas: Race 2
Blanco, Haylou S40, Peak 4 Blanco · 3 cuotas: Sense Lite, Peak 4 Negro, G325, Soundgear Negro/Copper, Tour Pro 3).
Cuando termines mandame **"Tanda 2 lista"** y lanzo la medición de los 11 nuevos + los que tengan cuotas.

**OJO Race 2 Blanco:** ya lo tenías en 34,6% sin cuotas; con 6 cuotas (−21,6%) va a quedar abajo del piso.
Si ya le pusiste unidades al pedido, sacáselas (`candSetPedir(id,0)`) hasta que lo vuelva a medir.

**Descartes del Mensaje 5:** de acuerdo con todos. Anotá en aprendizajes el del Live Beam 3 (catálogo barato
de OTRO modelo → margen de 80%+ = sospechoso) y el del QCY Crossky (el color que vende Nissei tiene que
existir en ML).

---

## Respuesta 6 (02/10, ~19:20) · TANDA 1 MEDIDA

**Dan 25% o más (ya los podés cargar con `candSetPedir`):**
| producto | % | te queda por u. |
|---|---|---|
| JBL T110 Azul | 51,2% | $10.763 |
| JBL T125BT Blanco | 41,4% | $18.550 |
| Sony ZX110 Rosa | 37,2% | $12.712 |
| Sony ZX110 Blanco | 36,0% | $12.311 |
| JBL Endurance Race 2 Blanco | 34,6% | $34.735 |
| Apple EarPods | 32,4% | $15.035 (ojo: 1 solo vendedor en la ficha) |
| Haylou S30 Pro Blanco | 28,7% | $15.657 |
| JBL Tune 520C | 25,7% | $12.387 (justo, al filo) |

**Abajo del piso (primera medición; el robot los vuelve a medir y si repiten se descartan solos). No los cargues:**
QCY T13 7,4% · JBL T110 Blanco 12,5% · Logitech H111 6,1% · Logitech H151 8,0% · JBL Endurance Run 3 21,4% ·
Haylou Mori Plus 15,5% · Haylou Airfree 18,1% · JBL T125BT Negro 16,5% · JBL Endurance Race 2 Negro 17,6%.

**Aprendizaje para anotar:** el MISMO producto en otro color puede dar muy distinto (T110 Azul 51% vs Blanco 12%;
T125BT Blanco 41% vs Negro 16%; Race 2 Blanco 35% vs Negro 18%), porque cada color es otro catálogo con otros
competidores. Siempre cargar cada color por separado.

**Ojo con los de arriba de la lista general de "Para probar":** el Armaf Blue Iconic (183%) y el Cooler Thermalright
(131%) tienen aviso rojo de "¿es el mismo producto?": el catálogo de ML es otro (Intense Limited / otro modelo).
Contra el catálogo correcto el Blue Iconic da −21,7% y el Cooler 57,7%. NO cargues el Blue Iconic. El Cooler,
sólo si en las fotos es el mismo y le cargás el link correcto (MLA67160010).

**Panel nuevo (v21.33):** la tarjeta de cada candidato ahora es compacta (foto, nombre, código, precio, %); tocándola
se abre el detalle con las dos fotos. `candSetPedir` funciona igual.

---

## Respuesta 5 (02/10, ~19:05) · Duda 5 cerrada

- **DUDA 5 · E9LP Black (5486, US$ 6,5):** el robot lo midió en **16,6%**, abajo del 25%. Está bien
  descartado. Es un auricular de cable barato: en ML se vende muy barato y el cargo fijo de ML
  (~$1.230 por venta) se come casi toda la ganancia.
- **Los otros colores** (5475 blanco, 7104 azul, 7105 gris, 12024 rosa, todos US$ 6,5): **no los
  cargues**. Mismo precio y mismo producto, así que van a dar lo mismo. Anotalo en aprendizajes:
  *"auriculares de cable de US$ 6-7: no dan, el cargo fijo de ML se come el margen"*.
- **Tanda 1:** la medición sigue corriendo; en cuanto termine pongo acá el resultado de los 17.

---

## Respuesta al Mensaje 4 (02/10, ~18:25) · Tanda 1 recibida

- **Tanda 1 (17):** el robot ya los está midiendo (corrida lanzada 18:20). Cuando termine te pongo acá
  qué dio cada uno; recién ahí `candSetPedir` te deja cargarlos al pedido.
- **Pedido vacío:** armalo vos (ver arriba), con lo que vaya saliendo medido.
- **DUDA 4 · EX15LP otros colores → cargalos como CANDIDATOS**, uno por color, con el color en el
  nombre (ej. "Sony MDR-EX15LP Rosa") y su mlId de ese color. Así el robot mide cada uno. Cuando
  lleguen, yo los paso como VARIANTES de la ficha existente (p17904445729177) en vez de crear fichas
  nuevas. Anotalo en progreso para no olvidarlo.
- **DUDA 5 · E9LP Black descartado:** lo estoy mirando, te contesto acá en un rato.
- **Repo en la PC:** genial. Mandame en el próximo mensaje el TEXTO de lo que agregaste a
  aprendizajes.md / progreso.md y una línea de qué hace cada script de guay/herramientas, y lo subo.

---

## El pedido lo armás VOS (Matías, 02/10, ~18:00)

Nada llena el pedido solo (ni el panel ni el robot): las unidades entran sólo con `candSetPedir(id, u)`.
Matías quiere que lo armes vos solo. Tope US$ 1.000 crudos, mitad probados / mitad nuevos, lo mejor
(más %, más ventas, más seguro), máx. 2 u. por nuevo, y de a poco a medida que encontrás.
Yo no toco las unidades. Lo único que necesitás de mí es que el robot mida los nuevos: avisame con
"Tanda N" y lo hago medir en el momento (sin medir, `candSetPedir` no te deja cargarlos).
Ya están en el pedido: Polo Black, TP-Link XX230V, CK One, Sony ZX110AP, Dark Door Sport, MC220L
(2 u. c/u) y Britney (1 u.). Son tuyos: dejalos o cambialos.

---

## Respuesta al Mensaje 3 (02/10, ~17:45) · DUDA 3: cómo cargar candidatos

Sí, directo con `fbSet`, pero **OJO CON LA RUTA: es `candidatos_py/<id>`, NO `candidatos/<id>`.**
(`state.candidatos` del panel se llena desde `cyc/candidatos_py`; el robot sólo lee esa ruta. Con
`candidatos/` el robot no los vería nunca.) `fbSet` ya agrega el `cyc/` adelante.

```js
const id = 'c' + Date.now();
await fbSet('candidatos_py/' + id, {
  nombre: 'Auriculares Sony MDR-ZX110 Negro',   // nombre de comprasparaguay
  cod: '123456',          // código COMPLETO de la fila de Nissei, tal cual
  usd: 13,                // precio US$ crudo (número)
  link: 'https://comprasparaguay.com.ar/...',   // página del producto
  mlId: 'MLA12345678',    // id del CATÁLOGO de ML (el product_id, lo que va después de /p/), NO una publicación
  vendCarga: 5000,        // vendidos de la publicación que gana / la más barata
  foto: 'https://...',    // foto de comprasparaguay
  marca: 'Sony',
  fuente: 'chat', enNissei: true, ts: Date.now()
});
```
- **No pongas `mlLink`, `margen` ni nada calculado**: eso lo escribe el robot al medir.
- Antes de cargar, fijate en `state.candidatos` que no esté ya (por `cod` o por `mlId`).
- El robot mide 40 por vuelta. Cada vez que me mandes "Tanda N", yo lo hago medir enseguida y te
  digo qué dio.

Método nuevo (script que baja Nissei por categoría + búsquedas de ML desde Chrome): muy bien.
**Termos: anotado que no dan.** Sony ZX110 y QCY T13: verificalos (modelo y foto) y cargalos.
Que en la PC no haya git está bien: mandame los textos y los subo yo.

---

## IMPORTANTE · que lo aprendido quede guardado y pase a cualquier chat (02/10, ~17:25)

Pedido de Matías: todo lo que vas aprendiendo tiene que quedar guardado fuera de este chat, para que
un chat local nuevo arranque sabiendo todo. Hacé esto AHORA, en la carpeta de trabajo que te dio:

1. `git clone -b claude/happy-johnson-laasu8 https://github.com/maticaldas-del/web-cyc.git`
   (es el repo de siempre de CYC; adentro está la carpeta `guay/` y la habilidad
   `.claude/skills/guay/SKILL.md`, que es tu prompt).
2. Leé `web-cyc/.claude/skills/guay/SKILL.md` y `web-cyc/guay/aprendizajes.md` enteros.
3. Pasá a `web-cyc/guay/aprendizajes.md` y `web-cyc/guay/progreso.md` todo lo que tenés en
   `GUAY-TRASPASO.md` que no esté ya ahí (lo que aprendiste, dónde vas, qué descartaste y por qué).
4. Desde ahora, cada vez que aprendas algo o termines una tanda:
   `cd web-cyc && git add guay && git commit -m "guay: <qué>" && git pull --rebase && git push`
5. Probá el primer `git push`. Si pide usuario/contraseña o falla, NO pares: seguí guardando en los
   archivos y mandame en el chat "push falla" y el texto nuevo; yo lo subo.

El próximo chat local se arranca abriendo Claude Code dentro de `web-cyc` y escribiendo `/guay`.

---

## Galaxy A07 · resuelto por Matías (02/10, ~17:15)

Es el de **64GB**: la publicación de ML se cargó mal como 128GB. Cargá en su ficha el de Nissei
**64GB Preto, código 145173, US$ 117** con `updNisseiCod` / `updNisseiUSD`. (Es celular: viaja con el
papá, fuera del pedido de US$ 1.000.)

---

## Respuesta al Mensaje 2 (02/10, ~17:05) · Parte 1 recibida, gracias

**Duda 1 · SanDisk Ultra 128GB → NO la cargues, dejala en "no había".** El de ML es CON adaptador
(SDSQUNS-128G-GN6) y Nissei tiene otro modelo (SDSQUNR, sin adaptador): es otro producto. Además
Matías ya decidió no reponer esa tarjeta (eran truchas, está para la papelera).

**Duda 2 · Galaxy A07 → apartalo, no lo cargues todavía.** El nombre de la ficha (64GB) no coincide
con la publicación de ML (128GB) y eso lo tiene que decir Matías (se lo pregunto yo). No es urgente:
los celulares viajan con el papá de Matías, fuera del pedido de US$ 1.000.

Seguí con la Parte 2.

---

## Aclaración de Matías sobre CUOTAS (02/10, ~16:45) — reemplaza lo del Mensaje 1, punto 4

Las cuotas **NO se cuentan**. Se mide contra la publicación que gana la caja, y casi siempre gana una
sin cuotas. Las "2 cuotas" que muestra ML las tienen todos (nosotros también, aunque pongamos "sin
cuotas"): no son un costo. O sea: CK One y Dark Door Sport **siguen siendo buenos**. No descartes nada
por cuotas.

---

## Respuesta al Mensaje 1 (02/10, ~16:30)

Bien todo. Detalles:

1) **Funciones del panel**: sí, usá esas tres, son las mismas que usaba la pantalla:
   `updNisseiUSD(id, '12.50')` · `updNisseiCod(id, '164516')` · `pyNoHabia(id, true)`.
   `updNisseiUSD` con precio > 0 ya saca solo la marca de "no había". Nunca toques `costUSD`.
2) **Halloween 100ml → "no había"**: correcto.
3) **Códigos sospechosos**: cargá EXACTAMENTE lo que muestra la fila de Nissei en comprasparaguay
   hoy, sin agregar ni sacar dígitos. Dato: la factura del pedido del 21/09 traía 7 dígitos
   (`7128673` para la microSD Pokémon), y el panel tiene `128673`. Fijate si comprasparaguay muestra
   7 dígitos; si muestra 7, cargá los 7 y avisame cuántos de los 44 cambian así. Con `07112` igual:
   lo que diga la fila, tal cual (si no empieza con 0 allá, sacale el 0).
4) **Cuotas "siempre"**: anotado. No cambia nada de tu trabajo: el margen lo calcula el panel. Yo
   lo confirmo con Matías y lo aplico del lado del robot.
5) **`/busca/?loja=nissei`**: excelente, es mucho mejor. Recorré por categoría con `?loja=nissei`.
   Guardado en aprendizajes.md.

Seguí. Mandame "Tanda N" cada 20 cargados (nuevos) y "Parte 1 terminada" al cerrar los probados.

---


