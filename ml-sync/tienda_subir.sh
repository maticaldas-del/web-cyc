#!/usr/bin/env bash
# LA TIENDA DIRECTO A SU REPO (08/11/2026, 1a y 3a de la revisión de la Tienda). Lo llaman ml-daily y ml-tienda después de `tienda;go`.
# Necesita el secreto TIENDA_TOKEN (un token de GitHub con permiso de escribir el repo de la Tienda; para poder borrar su traer.yml también
# "Workflows: escribir"). Sin el secreto no hace nada y queda el camino de siempre (la lista en la rama de la web y el repo de la Tienda la baja).
# Uso: tienda_subir.sh <archivo productos.json del robot> [forzar]   ·   Escribe en $GITHUB_OUTPUT: directo=ok|no · traer=si|no
set -u
ARCHIVO="$1"; FORZAR="${2:-}"; ORIG="$(dirname "$ARCHIVO")"; OUT="${GITHUB_OUTPUT:-/dev/null}"
REPO="${TIENDA_REPO:-tiendacyc/tiendacyc.github.io}"
if [ -z "${TIENDA_TOKEN:-}" ]; then echo "::warning::Sin TIENDA_TOKEN: las PÁGINAS de la Tienda y ABEL no se suben (quedan las viejas); la lista sí la baja el repo de la Tienda."; echo "directo=no" >> "$OUT"; exit 0; fi
if [ ! -s "$ARCHIVO" ]; then echo "La tienda no dejó archivo: no subo nada."; echo "directo=no" >> "$OUT"; exit 0; fi
DEST="$RUNNER_TEMP/tienda_repo"; rm -rf "$DEST"
for i in 1 2 3; do
  git clone -q --depth 1 "https://x-access-token:${TIENDA_TOKEN}@github.com/${REPO}.git" "$DEST" 2>/dev/null && break
  echo "no pude bajar el repo de la Tienda (intento $i)"; rm -rf "$DEST"; sleep 5
done
[ -d "$DEST/.git" ] || { echo "No pude bajar el repo de la Tienda."; echo "directo=no" >> "$OUT"; exit 1; }
python3 ml-sync/tienda_subir.py "$ORIG" tienda "$DEST" $FORZAR || { R=$?; echo "directo=no" >> "$OUT"; exit $R; }
cd "$DEST"
git config user.name "cyc"; git config user.email "cyc@users.noreply.github.com"
git add -A
if git diff --cached --quiet; then echo "La Tienda quedó igual: nada para subir."; else
  git commit -q -m "productos"
  if ! git push -q origin HEAD 2>/dev/null; then
    # Sin permiso para tocar el paso viejo (traer.yml) el envío entero se rechaza: se vuelve a subir sin borrarlo.
    if git show HEAD~0 --stat --format= | grep -q 'traer.yml'; then
      git reset -q --soft HEAD~1; git reset -q HEAD -- .github/workflows/traer.yml; git checkout -q HEAD -- .github/workflows/traer.yml 2>/dev/null
      git commit -q -m "productos"
      echo "⚠️ el token no tiene permiso para borrar el paso viejo (traer.yml): subo sin borrarlo"
    fi
    git pull -q --rebase origin HEAD 2>/dev/null; git push -q origin HEAD || { echo "No pude subir al repo de la Tienda."; echo "directo=no" >> "$OUT"; exit 1; }
  fi
  echo "✓ Tienda subida directo a su repo"
fi
if [ -f .github/workflows/traer.yml ]; then echo "traer=si" >> "$OUT"; else echo "traer=no" >> "$OUT"; fi
echo "directo=ok" >> "$OUT"
# Lo mismo (con las fotos propias) a la carpeta del robot: si el paso viejo sigue, la rama de la web lleva la MISMA lista.
cp productos.json "$ARCHIVO"; [ -s abel/productos.json ] && mkdir -p "$ORIG/abel" && cp abel/productos.json "$ORIG/abel/productos.json"
exit 0
