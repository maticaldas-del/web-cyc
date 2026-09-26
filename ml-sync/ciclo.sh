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
fin=$(( $(date +%s) + 340*60 ))
vuelta=0
while [ "$(date +%s)" -lt "$fin" ]; do
  vuelta=$((vuelta+1))
  hora=$(TZ=America/Argentina/Buenos_Aires date '+%H:%M:%S')
  if [ $(( (vuelta - 1) % 30 )) -eq 0 ]; then
    echo "───── vuelta $vuelta · $hora · ventas + PRECIOS ─────"
    node ml-sync/sync.mjs || echo "⚠️ esta vuelta falló, sigo con la próxima"
  else
    echo "───── vuelta $vuelta · $hora · solo ventas ─────"
    SKIP_PRICES=1 node ml-sync/sync.mjs || echo "⚠️ esta vuelta falló, sigo con la próxima"
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
    DAILY_SUMMARY=1 node ml-sync/sync.mjs || echo "⚠️ no pude mandar el resumen, reintento en la próxima vuelta"
  fi
  [ "$(date +%s)" -lt "$fin" ] || break
  sleep 120
done
echo "Fin del ciclo: $vuelta sincronizaciones."
