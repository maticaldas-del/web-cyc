#!/usr/bin/env bash
# El ciclo de 2 minutos (antes vivía adentro de ml-sync.yml). Lo usan la corrida automática y,
# desde el 26/09/2026, el job `ciclo` que arranca solo después de cada comando a mano.
# Corrida automática: no termina enseguida, se queda dando vueltas casi 6 horas (el máximo
# que deja GitHub para un job). Cuanto más larga, menos depende de que el cron sea puntual.
#
# Cada vuelta trae ventas (tarda ~25 s) y después espera 2 minutos → el panel nunca está
# más de ~2 minutos atrasado.
#
# El robot de PRECIOS no corre en todas las vueltas: solo en la 1ª y después una por hora.
# Traer ventas es leer; tocar precios es escribir en ML, y hacerlo 720 veces por día en vez
# de 14 es buscarse un problema con las publicaciones que quedan justo en el piso.
#
# Si una vuelta falla, se avisa y sigue: un error puntual no corta el resto.
#
# CANCELAR SIN DEJAR A NODE HUÉRFANO (etapa 4, 20/10/2026). Cuando GitHub cancela la corrida le manda
# SIGINT SÓLO a este bash (el proceso del paso) y a los 7,5 s SIGTERM; node, que corría como hijo, no
# se enteraba y seguía escribiendo hasta el SIGKILL de los 10 s — el freno `CORTAR` de sync.mjs nunca
# se prendía. Ahora cada node (y la espera de 2 minutos) corre en segundo plano con `corre`, que le
# pasa la señal y lo espera; node termina la tanda en curso y sale con 130, y el ciclo no arranca más.
# Se le mandan INT y TERM: un proceso en segundo plano de un bash no interactivo arranca con SIGINT
# ignorado (a `sleep` el INT no lo mata); node pone su propio manejador y atiende el primero que llega.
CANCELADO=0
HIJO=
trap 'CANCELADO=1; [ -n "$HIJO" ] && { kill -INT "$HIJO"; kill -TERM "$HIJO"; } 2>/dev/null' INT TERM
corre() {
  local rc=0
  "$@" & HIJO=$!
  while :; do wait "$HIJO"; rc=$?; kill -0 "$HIJO" 2>/dev/null || break; done
  HIJO=
  return $rc
}
cortado() { if [ "$CANCELADO" = 1 ]; then echo "✋ Cancelaron la corrida: el ciclo no arranca nada más (vuelta $vuelta)."; exit 130; fi; }
fin=$(( $(date +%s) + 340*60 ))
vuelta=0
while [ "$(date +%s)" -lt "$fin" ]; do
  cortado
  vuelta=$((vuelta+1))
  hora=$(TZ=America/Argentina/Buenos_Aires date '+%H:%M:%S')
  if [ $(( (vuelta - 1) % 30 )) -eq 0 ]; then
    echo "───── vuelta $vuelta · $hora · ventas + PRECIOS ─────"
    corre node ml-sync/sync.mjs || { cortado; echo "⚠️ esta vuelta falló, sigo con la próxima"; }
  else
    echo "───── vuelta $vuelta · $hora · solo ventas ─────"
    corre env SKIP_PRICES=1 node ml-sync/sync.mjs || { cortado; echo "⚠️ esta vuelta falló, sigo con la próxima"; }
  fi
  # RESUMEN DEL DÍA AL CELULAR. Lo manda ESTE ciclo, no el cron de ml-daily.
  # Por qué: el cron pide las 00:07 de Argentina, pero GitHub demora las corridas
  # programadas cuando está cargado — el 30 de julio lo corrió 02:51, y a esa hora el
  # resumen no lo mira nadie. Este ciclo está vivo las 24 h y da una vuelta cada 2
  # minutos, así que apenas pasa la medianoche lo manda.
  # Se intenta en TODAS las vueltas entre las 00:03 y las 00:59: el robot guarda cuál fue
  # el último día que mandó y no lo repite, así que los intentos de más no cuestan nada y
  # alcanza con que UNA vuelta salga bien.
  # El cron de ml-daily queda igual, de respaldo, por si este ciclo se cae justo esa noche.
  hh=$(TZ=America/Argentina/Buenos_Aires date '+%-H')
  mi=$(TZ=America/Argentina/Buenos_Aires date '+%-M')
  if [ "$hh" -eq 0 ] && [ "$mi" -ge 3 ]; then
    corre env DAILY_SUMMARY=1 node ml-sync/sync.mjs || { cortado; echo "⚠️ no pude mandar el resumen, reintento en la próxima vuelta"; }
  fi
  cortado
  [ "$(date +%s)" -lt "$fin" ] || break
  corre sleep 120 || true
  cortado
done
echo "Fin del ciclo: $vuelta sincronizaciones."
