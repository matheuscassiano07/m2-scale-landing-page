#!/usr/bin/env node
'use strict';

/**
 * Gera o QR da Evolution no teu PC (usa .env na raiz do repo).
 * Grava evo-qr.png na raiz — abre a imagem e escaneia no WhatsApp.
 *
 * Não corre “no terminal da Vercel”: lá não há TTY nem forma prática de escanear.
 * Uso: npm run evo-qr   (com Evolution acessível a partir desta máquina, ex. 127.0.0.1)
 */

const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  var p = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(p)) return;
  var lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line || line.indexOf('#') === 0) continue;
    var eq = line.indexOf('=');
    if (eq === -1) continue;
    var k = line.slice(0, eq).trim();
    var v = line.slice(eq + 1).trim();
    if ((v.charAt(0) === '"' && v.slice(-1) === '"') || (v.charAt(0) === "'" && v.slice(-1) === "'")) {
      v = v.slice(1, -1);
    }
    if (k && process.env[k] === undefined) process.env[k] = v;
  }
}

loadEnvFile();

const lib = require(path.join(__dirname, '..', 'api', '_lib', 'evolution.js'));
const evoQr = require(path.join(__dirname, '..', 'api', '_lib', 'evoQrResolve.js'));

function stripDataUrlBase64(base64) {
  var s = String(base64 || '').trim().replace(/\s/g, '');
  if (!s) return '';
  var m = /^data:image\/[^;]+;base64,(.+)$/i.exec(s);
  return m ? m[1] : s;
}

async function main() {
  var cfg = lib.getConfig();
  if (!lib.configIsReady(cfg)) {
    console.error('Falta EVOLUTION_API_URL, EVOLUTION_API_KEY ou EVOLUTION_INSTANCE no .env.');
    process.exit(1);
  }
  console.error('A ligar a:', cfg.base, '| instância:', cfg.instance);

  var bundle = await evoQr.fetchConnectUntilQr(lib, cfg);
  var qr = bundle.qr;
  var b64 = stripDataUrlBase64(qr.base64);
  if (!b64) {
    console.error('A Evolution não devolveu PNG/base64. pairingCode:', qr.pairingCode || '(vazio)');
    if (bundle.conn && bundle.conn.data) {
      console.error('Última resposta (trecho):', JSON.stringify(bundle.conn.data).slice(0, 500));
    }
    process.exit(2);
  }

  var out = path.join(__dirname, '..', 'evo-qr.png');
  fs.writeFileSync(out, Buffer.from(b64, 'base64'));
  console.log('QR guardado em:', out);
  if (qr.pairingCode) {
    console.log('Código Evolution (8 dígitos):', qr.pairingCode);
  }
  console.log('Abre o PNG e escaneia no WhatsApp (Aparelhos conectados).');
}

main().catch(function (e) {
  console.error(e && e.message ? e.message : e);
  process.exit(3);
});
