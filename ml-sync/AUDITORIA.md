# AUDITORÍA DEL ROBOT · lo que el informe no me dice

Pedido suyo (08/10/2026): *"el robot automático le faltan detalles porque claramente no piensa (…) capaz que
pasa algo importante y el robot no te lo dice porque no está programado para eso (…) revisá todo cada un par de
días, compará lo que te dice el robot con lo que ves vos, y si hay alguna diferencia corregí el robot para que las
próximas las haga correctas"*.

**Qué es:** la revisión de cada 12 h (`informe:12`) mira lo que el robot me arma. Esto es lo contrario: miro los datos
CRUDOS de ML y de la base por mi cuenta, sin el informe, y después comparo. Todo lo que encuentre que el informe no
traía (o traía mal) es un faltante del robot: se arregla en `sync.mjs` (en `informe` o en la cuenta que corresponda),
se anota en `REVISION.md` en su etapa y abajo en el historial.

## Qué mirar (sin el informe, de primera mano)
1. **Ventas y plata:** `chequeo:3` (las 4 cuentas), `salud` (ventas por día de ML, no del panel: ¿cayó alguna
   cuenta?), ventas canceladas/reclamos nuevos, ventas sin ficha o sin costo, netos estimados que no se corrigieron.
2. **Publicaciones:** estados raros (en revisión de ML, pausadas por ML, `waiting_for_patch`, cerradas que venden),
   promociones que quedaron puestas (`sacapromos` sin go), caja de compra perdida en lo que más vende
   (`cajacompra`), precios que cambiaron sin que nadie lo decida (`tocados:24`).
3. **Stock y cajas:** quiebres de lo que vende (`revisarpedidos`), cajas abiertas viejas o con faltantes
   (`cajasllegaron`, `faltaron:7`), pausadas con stock, stock en Full que no coincide con ML (`stockreal`).
4. **Clientes:** preguntas sin responder (`preguntas`, sin volcar texto de nadie al registro público),
   reputación (`reputa`), mensajes de posventa sólo si él lo pide.
5. **El propio robot:** corridas de la noche que fallaron (`avisonoche`, log de `ml-daily`), tokens que no
   renuevan, avisos que se tragó el filtro de Telegram (`mlapi/cerebroavisos`), dólar y tipo de cambio al día.
6. **Comparar:** ¿cada cosa importante de 1-5 estaba en el `informe`? Si no → faltante del robot.

**Ojo al auditar: las consultas van de a 2, no de a 6.** La primera auditoría largó 6 a la vez y ML contestó 429 en
las cajas (casi todos los renglones "sin leer") y en 57 de 406 promociones: eso es ruido mío, no un faltante del robot.

## Cada cuánto (lo maneja Claude solo)
- Arranca **todos los días** (08/10, 09/10, 10/10).
- Si **3 auditorías seguidas** no encuentran nada nuevo → cada **3-4 días**; 2 limpias más → **1 por semana**;
  2 limpias más → **cada 2 semanas**; 2 limpias más → **1 por mes**.
- Si una encuentra algo importante → vuelve a **todos los días** y se arranca la escalera de nuevo.
- La próxima fecha se programa al terminar cada una (rutina `auditoria`, `run_once_at`) y se anota abajo.

## Historial
| fecha | qué encontré | qué arreglé | próxima |
|---|---|---|---|
| 08/10 18:10 (adelantada, la pidió él) | **Faltaban 5 cosas en el informe:** (1) los avisos que el filtro no manda a Telegram (`info`: pasos de la noche que fallaron, promos no leídas…) — el informe leía `alertaslog`, que sólo guarda lo que salió · (2) las preguntas sin responder: 81, la más vieja de 213 días · (3) las publicaciones frenadas por ML: el Espejo 8" está en revisión (`waiting_for_patch`) desde la suba a $49.190 · (4) los que pierden la caja y vendían (20) · (5) los que vendían y están sin stock (37, 447 u. en 30 d; el Centímetro Rosa y Gris vendieron 203 u.) · además reputación, promos sin leer y dólar | informe con secciones 1 (todos los avisos) y 10-13 · comando `contesto` para que Claude conteste preguntas | 09/10 21:30 (diaria: encontró cosas) |
| 10/10 00:30Z (21:30 del 09/10) | **El informe no traía los reclamos abiertos que esperan respuesta ni los mensajes de compradores sin leer** (el chequeo sí: 3 reclamos, 1 de Matías de 2 días con reembolso/mensaje/disputa disponibles; 3 mensajes). Lo demás coincidió: ventas por día normales (`salud`), cajas sin faltantes (`faltaron:7`), el robot no tocó precios en 48 h, pausadas con 1 u. de depósito son el mínimo de ML (no stock). La auditoría del 09/10 no quedó anotada. | informe sección 7b (reclamos abiertos + mensajes sin leer) | 10/10 21:30 (diaria: encontró algo) |
| 11/10 00:30Z (21:30 del 10/10) | **Matías no vendió NADA el 10/10** (venía de 6 a 20 por día, promedio 11,2): `salud` (ventas leídas de ML) da "—" y `frenazo:matias` muestra el Filtro (61 u. en 12 d → 0 en 48 h), Hub 8 en 1 (17 → 0), Infusor acero (15 → 0) y Pendrive 8gb con 101 u. ganando la caja (19 → 0). Reputación bien (5_green platinum). **El informe no lo decía**: la sección 2 lista lo que se vendió, nunca lo que dejó de venderse. Además el chequeo dice "8 publicaciones sin ficha" y el informe "0 vivas sin ficha" (cuentan cosas distintas: pendiente mirar). Cajas sin faltantes (`faltaron:7`: 4 marcadas, 487 u., 0 borradas). | informe sección 2b (ventas por cuenta, 24 h contra el promedio de 14 días, ⚠️ si cae a menos de un tercio) · aviso a Matías para que mire la cuenta en ML | 11/10 21:30 (diaria: encontró algo) |
| 12/10 00:30Z (21:30 del 11/10) | Ventas normales en las 4 (`salud`; Matías volvió: 8 el 11/10). El robot no tocó precios en 48 h. Cajas: 3 abiertas sin leer por cupo de ML (429), sin faltantes. **Faltaba en el informe la mercadería con stock en Full y sin vender en 30 días** (el chequeo: 40 publicaciones, $3,2M; ej. Ferrari Scuderia rojo de Adriana, 11 u., 80 días sin vender, a 19-20%). **Y lo pendiente del 11/10 quedó explicado:** el chequeo contaba como "sin ficha" 6 publicaciones marcadas `nomas`. | informe sección 12c (stock parado) · el chequeo ya no cuenta las `nomas`/ocultas como sin ficha | 12/10 21:30 (diaria: encontró algo) |
| 13/10 00:30Z (21:30 del 12/10) | Ventas normales en las 4 (`salud`). Reclamos y mensajes coinciden con el informe (7b). **Faltaba en el informe lo que ML tiene perdido o no acepta adentro de Full** (el chequeo: 6 u., `lost`/`notSupported`: protector de taco, luz bici, espejo giratorio de Ayelen, Buds Core y Pendrive 8gb de Matías). Y el chequeo contaba como "sin ficha" 3 publicaciones CERRADAS de Matías (bolsa de agua caliente, M10) que el informe ya no cuenta. | informe sección 12d (unidades con problema en Full, sólo en la revisión de 12 h+) · el chequeo ya no cuenta las cerradas como sin ficha | 13/10 21:30 (diaria: encontró algo) |
| 14/10 00:30Z (21:30 del 13/10) | Ventas normales (`salud`; el 0 de Matías del 10/10 lo confirman ML y la base, ya anotado el 11/10). El robot no tocó precios en 48 h. Cajas: `faltaron:7` limpio (4 marcadas, 0 borradas). **Las 5 cajas abiertas no se pueden marcar solas y el informe no decía por qué:** 89 consultas de movimientos con 429 `over_quota`, y en la de Adriana del 07/10 hay 5 perfumes nuevos sin publicación de Full con código en esa cuenta (Cuba ×4, Halloween Man, VS INTENSE: publicaciones pausadas sin stock en Full todavía) y 5 colores de VS que ninguna publicación de Full nombra (fijarvar). Eso sólo salía en el log de la hora. | el robot guarda en `mlapi/cajasciegas` por qué cada caja abierta queda sin leer y la sección 9 del informe lo muestra (cualquier edad, con el motivo y qué hacer) · también: correo de Vía Cargo cargado en el pedido del 10/10 (`compray`, 21,6% de recargo real) | 14/10 21:30 (diaria: encontró algo) |
