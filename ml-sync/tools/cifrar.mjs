// uso: node cifrar.mjs <llave_publica.pem> <imagen> <salida.enc>
import c from 'node:crypto'; import fs from 'node:fs';
const [pubF, imgF, outF] = process.argv.slice(2);
const data = fs.readFileSync(imgF);
const mime = data.subarray(0,8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])) ? 'image/png' : (data[0]===0xff&&data[1]===0xd8) ? 'image/jpeg' : data.subarray(8,12).toString()==='WEBP' ? 'image/webp' : null;
if (!mime) throw new Error('no es png/jpg/webp');
const k = c.randomBytes(32), iv = c.randomBytes(12);
const ci = c.createCipheriv('aes-256-gcm', k, iv);
const ct = Buffer.concat([ci.update(data), ci.final(), ci.getAuthTag()]);
const wk = c.publicEncrypt({ key: fs.readFileSync(pubF, 'utf8'), padding: c.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, k);
fs.writeFileSync(outF, JSON.stringify({ v: 1, mime, k: wk.toString('base64'), iv: iv.toString('base64'), ct: ct.toString('base64') }));
console.log(outF, Math.round(data.length / 1024), 'KB', mime);
