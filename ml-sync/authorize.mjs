// Autorización inicial de UNA cuenta de ML (se corre una vez por cuenta).
// Recibe el "code" que devuelve ML tras autorizar, lo cambia por tokens y los
// guarda en Firebase (mlapi/tokens/<label>). Después el robot ya trabaja solo.
//
// Uso (vía GitHub Action "ml-authorize", con inputs LABEL y CODE):
//   LABEL = etiqueta de la cuenta (ej: Adriana)
//   CODE  = el código de autorización de ML
//
// Requiere secrets: ML_CLIENT_ID, ML_CLIENT_SECRET, ML_REDIRECT_URI,
//                   FIREBASE_API_KEY, FIREBASE_DB_URL, FIREBASE_BOT_EMAIL, FIREBASE_BOT_PASSWORD

import { fbSignIn, makeDB, mlExchangeCode, mlGet } from './lib.mjs';

const {
  ML_CLIENT_ID, ML_CLIENT_SECRET, ML_REDIRECT_URI,
  FIREBASE_API_KEY, FIREBASE_DB_URL, FIREBASE_BOT_EMAIL, FIREBASE_BOT_PASSWORD,
  LABEL, CODE,
} = process.env;

function need(name, v) { if (!v) throw new Error('Falta ' + name); return v; }

async function main() {
  need('LABEL', LABEL);
  need('CODE', CODE);

  const tokens = await mlExchangeCode(ML_CLIENT_ID, ML_CLIENT_SECRET, CODE, ML_REDIRECT_URI);
  // Averiguar quién es la cuenta (id de vendedor + nick) para etiquetar bien.
  const me = await mlGet('/users/me', tokens.access_token);

  const idToken = await fbSignIn(FIREBASE_API_KEY, FIREBASE_BOT_EMAIL, FIREBASE_BOT_PASSWORD);
  const db = makeDB(FIREBASE_DB_URL, idToken);

  await db.set('mlapi/tokens/' + LABEL, {
    seller_id: me.id,
    nickname: me.nickname,
    refresh_token: tokens.refresh_token,
    updated_ts: Date.now(),
  });

  console.log(`✓ Cuenta "${LABEL}" conectada: ${me.nickname} (id ${me.id})`);
}

main().catch((e) => { console.error('✗ Error:', e.message); process.exit(1); });
