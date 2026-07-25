# Sincronización con MercadoLibre (CYC)

Robot que trae datos de MercadoLibre directo al panel CYC, sin IA y sin gastar tokens.
Corre solo como **GitHub Action** (gratis) cada 15–30 min.

## Qué va a hacer (alcance completo)

| Módulo | Qué trae | Estado |
|---|---|---|
| 🧾 Ventas + neto | Cada venta nueva de las 4 cuentas, con su neto real | ✅ código listo (`sync.mjs`) |
| 📊 Métricas | Se calculan solas en la app a partir de las ventas | ✅ automático |
| 📦 Stock ML | Unidades disponibles por producto y por cuenta | ✅ código listo (`stock.mjs`) |
| 🚚 Stock en Full + por llegar | Unidades en Full e ingresos en camino | ⏳ Fase 3 |
| ❓ Preguntas | Ver preguntas sin responder (responder: a decidir) | ⏳ Fase 4 |

> Todo escrito y sin activar. Falta conectar las cuentas (ver `PASOS.md`) y
> verificar neto + matches con la primera tanda de datos reales.

## Cómo funciona (arquitectura)

- **Host:** GitHub Action con cron. Sin servidores propios, sin costo.
- **Estado (tokens de ML que se renuevan solos):** se guardan dentro de la
  propia base de Firebase (`mlapi/…`), así el robot no necesita memoria propia.
- **Escritura en la app:** el robot inicia sesión con un usuario "bot" de
  Firebase (email/clave) y escribe en las mismas ramas que usa la app:
  `ventaprod/…`, `inventory/…`.
- **Una sola app de ML** autorizada en las 4 cuentas → 4 permisos de lectura.

### Cuentas
`Adriana` · `Luciana` · `Ayelen` · `Matias`

### El "linkeo" publicación ↔ producto (clave para el stock)
Hoy la app **no guarda el ID de publicación de ML** en cada producto: las ventas
se matchean por **nombre**. Para que el stock quede exacto, una sola vez armamos
una tabla que une cada publicación de ML (MLAxxxxxxx) con el producto interno.
El robot lista todas las publicaciones y **auto-sugiere** el match por nombre;
vos confirmás las dudosas. Después queda guardado y no se toca más.

## Lo que hay que cargar una sola vez (secrets en GitHub)

Se pegan en el repo: **Settings → Secrets and variables → Actions → New secret**.
Nunca van en el código ni en el chat.

- [ ] `ML_CLIENT_ID` — App ID de la aplicación de ML *(no es secreto)*
- [ ] `ML_CLIENT_SECRET` — Client Secret de la app
- [ ] `ML_REDIRECT_URI` — la dirección del Redirect URI de la app
- [ ] `FIREBASE_API_KEY` — ya la tenemos
- [ ] `FIREBASE_DB_URL` — ya la tenemos
- [ ] `FIREBASE_BOT_EMAIL` — usuario bot de Firebase (lo creamos)
- [ ] `FIREBASE_BOT_PASSWORD` — clave del bot

Los **refresh tokens** de las 4 cuentas se generan con la autorización inicial
y se guardan en Firebase (`mlapi/tokens/…`), no como secret.

## Pasos (te guío de a uno)

1. [ ] **Crear la app** en https://developers.mercadolibre.com.ar
       (permisos: `read`, `write`, `offline_access`). → me pasás el **App ID**.
2. [ ] **Autorizar** la app en las 4 cuentas (un clic por cuenta).
3. [ ] **Crear el usuario bot** de Firebase y cargar los secrets.
4. [ ] Encender el robot (lo prendo yo) y verificar la primera tanda de ventas
       contra tu cuenta de ML (ajuste fino del neto).
5. [ ] Sumar stock, Full y preguntas por fases.
