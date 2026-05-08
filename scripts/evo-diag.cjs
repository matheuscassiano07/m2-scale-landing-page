#!/usr/bin/env node
'use strict';

/**
 * Diagnóstico Evolution no terminal (lê .env na raiz).
 * Uso: npm run evo-diag
 */

const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const p = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(p)) return;
  const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.indexOf('#') === 0) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if ((v.charAt(0) === '"' && v.slice(-1) === '"') || (v.charAt(0) === "'" && v.slice(-1) === "'")) {
      v = v.slice(1, -1);
    }
    if (k && process.env[k] === undefined) process.env[k] = v;
  }
}

function ok(msg) {
  console.log('[OK]   ' + msg);
}
function fail(msg, err) {
  console.log('[FALHA] ' + msg + (err ? ' — ' + String((err && err.message) || err) : ''));
}

loadEnvFile();

const lib = require(path.join(__dirname, '..', 'api', '_lib', 'evolution.js'));

function stepHead(urlStr) {
  return new Promise(function (resolve) {
    try {
      const u = new URL(urlStr);
      const mod = u.protocol === 'https:' ? require('https') : require('http');
      const port = u.port ? Number(u.port) : u.protocol === 'https:' ? 443 : 80;
      const insecure = String(process.env.EVOLUTION_TLS_INSECURE || '').trim() === '1';
      const opts = {
        method: 'HEAD',
        hostname: u.hostname,
        port: port,
        path: (u.pathname || '/') + (u.search || ''),
        timeout: 8000,
      };
      if (u.protocol === 'https:' && insecure) opts.rejectUnauthorized = false;
      const req = mod.request(
        opts,
        function (res) {
          res.resume();
          resolve({ ok: true, status: res.statusCode });
        }
      );
      req.on('error', function (e) {
        resolve({ ok: false, err: e });
      });
      req.on('timeout', function () {
        req.destroy();
        resolve({ ok: false, err: new Error('timeout') });
      });
      req.end();
    } catch (e) {
      resolve({ ok: false, err: e });
    }
  });
}

async function stepGet(urlStr) {
  try {
    const ctrl = new AbortController();
    const id = setTimeout(function () {
      ctrl.abort();
    }, 8000);
    const r = await fetch(urlStr, { method: 'GET', redirect: 'manual', signal: ctrl.signal });
    clearTimeout(id);
    return { ok: true, status: r.status };
  } catch (e) {
    return { ok: false, err: e };
  }
}

async function main() {
  const cfg = lib.getConfig();
  if (!lib.configIsReady(cfg)) {
    fail('Variáveis Evolution incompletas no .env (URL, key, instance).');
    process.exit(1);
  }

  const base = cfg.base;
  console.log('\n— Base (hostname apenas): ' + (function () {
    try {
      return new URL(base).hostname;
    } catch (e) {
      return '(URL inválida)';
    }
  })() + '\n');

  const rootUrl = base.replace(/\/+$/, '') + '/';
  ok('HEAD ' + rootUrl);
  const headRes = await stepHead(rootUrl);
  if (headRes.ok) {
    ok('HEAD respondeu (HTTP ' + headRes.status + ')');
  } else {
    fail('HEAD', headRes.err);
  }
  ok('GET ' + rootUrl);
  const getRes = await stepGet(rootUrl);
  if (getRes.ok) {
    ok('GET respondeu (HTTP ' + getRes.status + ')');
  } else {
    fail('GET', getRes.err);
  }

  const statePath = '/instance/connectionState/' + encodeURIComponent(cfg.instance);
  ok('evoFetch: ' + statePath);
  try {
    const r = await lib.evoFetch(statePath, {});
    console.log('       HTTP ' + r.status + ' | ok=' + r.ok);
  } catch (e) {
    fail('connectionState', e);
  }

  const connectPath = '/instance/connect/' + encodeURIComponent(cfg.instance) + '?qrcode=true';
  ok('evoFetch: ' + connectPath);
  try {
    const r = await lib.evoFetch(connectPath, {});
    console.log('       HTTP ' + r.status + ' | ok=' + r.ok);
  } catch (e) {
    fail('instance/connect', e);
  }

  console.log('\nFeito.\n');
}

main().catch(function (e) {
  fail('execução', e);
  process.exit(2);
});
