// uso: node cerrarticket.mjs <llave pública de ticketllave.pem> <foto.jpg (menos de ~700 KB)> ml-sync/cifrado/<pedido>/ticketN.enc
// La foto del ticket que me pasa por el chat, cerrada en el formato que abre `ticketsube` ({k, iv, tag, d} con un data URL adentro).
// OJO: tools/cifrar.mjs es para comprobantes (mlapi/comprobkey) y usa otro formato: ticketsube no lo abre (28/10/2026).
import c from 'node:crypto'; import fs from 'node:fs';
const [pub, img, out] = process.argv.slice(2);
const url = 'data:image/jpeg;base64,' + fs.readFileSync(img).toString('base64');
const k = c.randomBytes(32), iv = c.randomBytes(12); const ci = c.createCipheriv('aes-256-gcm', k, iv);
const d = Buffer.concat([ci.update(Buffer.from(url, 'utf8')), ci.final()]); const tag = ci.getAuthTag();
const wk = c.publicEncrypt({ key: fs.readFileSync(pub, 'utf8'), padding: c.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, k);
fs.writeFileSync(out, JSON.stringify({ v: 1, k: wk.toString('base64'), iv: iv.toString('base64'), tag: tag.toString('base64'), d: d.toString('base64') }));
console.log(out, Math.round(url.length / 1024), 'KB');
