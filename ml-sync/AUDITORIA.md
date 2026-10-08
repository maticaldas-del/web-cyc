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

## Cada cuánto (lo maneja Claude solo)
- Arranca **todos los días** (08/10, 09/10, 10/10).
- Si **3 auditorías seguidas** no encuentran nada nuevo → cada **3-4 días**; 2 limpias más → **1 por semana**;
  2 limpias más → **cada 2 semanas**; 2 limpias más → **1 por mes**.
- Si una encuentra algo importante → vuelve a **todos los días** y se arranca la escalera de nuevo.
- La próxima fecha se programa al terminar cada una (rutina `auditoria`, `run_once_at`) y se anota abajo.

## Historial
| fecha | qué encontré | qué arreglé | próxima |
|---|---|---|---|
| | | | 08/10 21:30 (la primera) |
