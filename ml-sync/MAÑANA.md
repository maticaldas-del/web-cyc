# Qué hacemos mañana (paso a paso)

Todo el programa ya está escrito. Falta solo conectar tus cuentas. Son 3 pasos
cortos y te acompaño en cada uno. Nada corre solo hasta que lo prendamos juntos.

---

## PASO 1 — Crear la app de ML  ·  (5 min, lo hacés vos)

1. Entrá a https://developers.mercadolibre.com.ar (logueado con cualquiera de tus cuentas).
2. **Tus aplicaciones → Crear aplicación nueva.**
3. Completás:
   - **Nombre:** `CYC Sync`
   - **Permisos / scopes:** `read`, `write`, `offline_access`
   - **Redirect URI:** la dirección de tu web (la de Cloudflare que abrís como app)
4. Guardás y me pasás por el chat:
   - el **App ID** (número largo, no es secreto)
   - la **dirección** que pusiste en Redirect URI

---

## PASO 2 — Cargar las claves en GitHub  ·  (lo hacemos juntos)

En el repo: **Settings → Secrets and variables → Actions → New repository secret.**
Creás estos (te digo el valor de cada uno en el momento):

| Secret | Qué es |
|---|---|
| `ML_CLIENT_ID` | el App ID |
| `ML_CLIENT_SECRET` | el Client Secret de la app (este NO va al chat) |
| `ML_REDIRECT_URI` | la misma dirección del Redirect URI |
| `FIREBASE_API_KEY` | (ya la tengo, te la paso) |
| `FIREBASE_DB_URL` | `https://cyc-inventario-default-rtdb.firebaseio.com` |
| `FIREBASE_BOT_EMAIL` | usuario "bot" de Firebase (lo creás en la consola de Firebase) |
| `FIREBASE_BOT_PASSWORD` | la clave de ese usuario |

> El usuario bot es un login normal de Firebase (Authentication → Add user).
> Sirve para que el robot pueda escribir en el panel. Te guío cuando estemos.

---

## PASO 3 — Conectar las 4 cuentas  ·  (un clic por cuenta)

Por cada cuenta (Adriana, Luciana, Ayelen, Matias):

1. Entrá con ESA cuenta a este link (te lo armo con tu App ID):

   ```
   https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=TU_APP_ID&redirect_uri=TU_REDIRECT_URI
   ```

2. Aprobás. ML te redirige a tu web con algo así en la barra: `...?code=TG-xxxxxxxx`.
   Copiás ese **code**.
3. En el repo: **Actions → ml-authorize → Run workflow**, y completás:
   - **label:** el nombre de la cuenta (ej: `Adriana`)
   - **code:** el code que copiaste
4. Repetís para las 4.

---

## Y listo

Cuando estén las 4 conectadas:

- **Actions → ml-sync → Run workflow** → entran las ventas. Comparamos el neto
  con lo que ves en ML y lo ajusto fino.
- **Actions → ml-stock → Run workflow** → entra el stock. Revisamos los matches
  dudosos (quedan en `mlapi/review`).
- Cuando todo cuadra, activo los horarios (cron) y el robot queda andando solo.
