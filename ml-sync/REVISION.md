# QUÉ TIENE QUE MIRAR CADA ETAPA DE LA REVISIÓN

Regla suya (08/10/2026): *"cada movimiento, cambio que hagas lo agregues a una etapa existente o una
nueva"*. **Todo cambio o cosa nueva del panel o del robot se anota acá, en su etapa, en el mismo
commit.** Así la revisión de cada etapa lo mira sin que él tenga que acordarse de pedirlo.
Si una cosa nueva no entra en ninguna etapa, se crea una (en `REV_ETAPAS` de `index.html` también).

Cada renglón: **qué es · dónde vive · qué hay que chequear**. Lo que está en "SIEMPRE" se mira en
todas las etapas.

## SIEMPRE, EN CUALQUIER ETAPA
- **Contar dos (o cuatro) veces lo mismo.** El caso de la línea del Centímetro (08/10): el stock se
  sumaba por clave de producto Y por cada clave de color → 413 en vez de ~107. Cada vez que algo
  suma stock, ventas o plata de varias claves, chequear que no haya una clave "total" y claves
  "parte" sumadas juntas.
- **Una falla leída como dato** (un 429, un catch vacío, un cero que parece buena noticia).
- **Dos fórmulas para el mismo número** (web y robot, o dos comandos): tienen que llamar a la misma
  función o dar lo mismo con los mismos datos.
- **Datos de terceros en el registro público** (nombres, documentos, números de orden enteros).

## 1 · PRECIOS
- **Cerebro de precios** (`calcCerebro`, `cyc/cerebro/<MLA>`, `avisos:go`): plata por día, escasez
  (tope ×2,5, ML pausó el espejo a $49.190), paciencia de la apuesta alta, vuelta al precio de antes
  al llegar la reposición, fechas especiales.
- **Corrección de las subas de más** (`exceso` en `calcSubirPorMargen`, `por:'correccion'`): sólo
  lo que no vendió desde la suba, nunca abajo del precio de antes ni cruzando los $33.000 para abajo.
- **Cuotas que ya vienen en la comisión** (`enComision`, probe `cuotas`): no sumarlas dos veces en
  rescate, cerebro, caja barata, escalera, comandos.
- **Rescate sin umbral** (`subeDesdeDe` = base − 1) y sin frenos con stock 0 (por color, `subStatus`).
- **Escalera con fecha aproximada** (`edadFullCb`): puede esperar de más, nunca bajar antes.
- **Supervisor** (`cuentaRemate`, regla firme del 08/10): el ritmo sin robot sale sólo de las ventas
  al precio viejo.

## 2 · PLATA
- **% del mes pasado en Métricas** (`renderMetPctAvg`): el chip del período anterior usa el promedio
  del mes ENTERO, y "a esta altura" va en chico.
- **Costo real por mes** (probe `costomes`): costo congelado del mes o el de hoy, dólar del mes.

## 3 · MERCADERÍA
- **Estado de la caja de cada producto** (probe `cajahoy`, `mllinks.caja`): winning/sharing/losing
  y también nocat/sincaja; un producto sin publicación activa no es "sin dato".
- **Stock en las líneas de tiempo**: por cuenta manda la clave del producto sobre las de color; con
  un color elegido, sólo esa clave.

## 4 · CHOQUES
- `mlapi/lineatodo` lo escriben `ritmo:go` (noche) y `lineatodo:go` (ml-consulta): los dos con la
  misma función `calcLineaTodo`.

## 5 · FALLAS MUDAS Y PRIVACIDAD
- **Visitas de la noche** (`linea:go`): el pedido en lote falló callado desde ~01/10. Ahora hay
  respaldo publicación por publicación y el log dice "visitas: N con dato". Chequear que el número
  no caiga a 0.

## 5 bis · AVISOS DE TELEGRAM QUE LEE CLAUDE (08/10/2026)
- `sendAlerta` guarda copia de cada aviso que SALIÓ en `mlapi/alertaslog/<ts>`; probe `alertas[:horas]` (solo lee,
  tapa números largos). Una rutina de Claude los lee y resuelve lo que puede. Chequear: que sólo se guarde lo que
  salió, que no quede nada de terceros en el texto impreso, y que el log no crezca sin fin (podar a 30 días).

## 8 · DATOS E HISTORIAL (nueva, 08/10/2026)
Todo lo que guarda la historia día por día y las pantallas que la dibujan.
- **Línea de tiempo por producto** (`mlapi/linea/<MLA>/<día>`, `_lineaJunta`, `lineaPintar`): stock,
  precio, caja, visitas, ventas, remate, escalera; el día de hoy armado en la web; campo ausente =
  no se sabe (nunca cero).
- **Línea de todo** (`mlapi/lineatodo`, `calcLineaTodo`, `lineaTodoPintar`): suma de todos los
  productos; precio como promedio de cambios (sólo cambios entre ×0,5 y ×2), subas/bajas, ganancia
  del día con la misma cuenta que Ventas, cambios del robot desde supervisor + autoprecio sin repetir.
- **Relleno hacia atrás** (`linea:atras`, `mlapi/lineaprog`): ventas, visitas (`:rehacer`), precio,
  stock a medias por cupo de ML.
- **Ritmo normal** (`cyc/ritmonormal`, `ritmo:go`): ventas sin remate ÷ días con stock sin remate.
- Chequear: totales de un día contra Ventas de ese día · stock contra el Arqueo · que un día sin
  lectura no se dibuje como cero · que hoy diga "incompleto".
