'use strict';

const dns = require('dns');

/** Prioriza IPv4 (útil quando AAAA falha e o fetch devolve “fetch failed”). */
if (String(process.env.EVOLUTION_IPV4_FIRST || '').trim() === '1') {
  try {
    dns.setDefaultResultOrder('ipv4first');
  } catch (e) {}
}

const DEFAULT_TIMEOUT_MS = (function () {
  var n = Number(process.env.EVOLUTION_FETCH_TIMEOUT_MS);
  if (!Number.isFinite(n) || n < 5000) return 10000;
  return Math.min(n, 55000);
})();

const FETCH_RETRIES = (function () {
  var n = parseInt(String(process.env.EVOLUTION_FETCH_RETRIES || '2'), 10);
  if (!Number.isFinite(n) || n < 1) return 2;
  return Math.min(n, 4);
})();

let insecureDispatcher = null;
let insecureDispatcherTried = false;

function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

function env(name) {
  const v = process.env[name];
  return typeof v === 'string' ? v.trim() : '';
}

/** Garante protocolo; Evolution costuma ser HTTPS. */
function ensureHttpBase(raw) {
  var u = String(raw || '').trim().replace(/\/+$/, '');
  if (!u) return '';
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  return u;
}

function getConfig() {
  const base = ensureHttpBase(env('EVOLUTION_API_URL'));
  const apikey = env('EVOLUTION_API_KEY');
  const instance = env('EVOLUTION_INSTANCE') || 'zira-admin';
  return { base, apikey, instance };
}

function configIsReady(cfg) {
  return Boolean(cfg && cfg.base && cfg.apikey && cfg.instance);
}

function getInsecureDispatcher() {
  if (String(process.env.EVOLUTION_TLS_INSECURE || '').trim() !== '1') return null;
  if (insecureDispatcher) return insecureDispatcher;
  if (insecureDispatcherTried) return null;
  insecureDispatcherTried = true;
  try {
    const undici = require('node:undici');
    insecureDispatcher = new undici.Agent({ connect: { rejectUnauthorized: false } });
    return insecureDispatcher;
  } catch (e) {
    insecureDispatcher = null;
    return null;
  }
}

function errorCauseCode(e) {
  if (!e) return '';
  var c = e.cause;
  return String((c && c.code) || e.code || '');
}

function isTlsVerifyError(code) {
  return (
    code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
    code === 'SELF_SIGNED_CERT_IN_CHAIN' ||
    code === 'DEPTH_ZERO_SELF_SIGNED_CERT' ||
    code === 'CERT_HAS_EXPIRED' ||
    code === 'ERR_TLS_CERT_ALTNAME_INVALID'
  );
}

function isRetriableNetworkError(e) {
  if (!e) return false;
  /* Timeout: não retentar (cada tentativa já custa o limite inteiro ao servidor). */
  if (e.name === 'AbortError') return false;
  var code = errorCauseCode(e);
  if (isTlsVerifyError(code)) return false;
  if (
    code === 'ECONNRESET' ||
    code === 'ECONNREFUSED' ||
    code === 'ETIMEDOUT' ||
    code === 'ENOTFOUND' ||
    code === 'EAI_AGAIN' ||
    code === 'ENETUNREACH' ||
    code === 'EHOSTUNREACH'
  ) {
    return true;
  }
  var msg = String(e.message || '').toLowerCase();
  if (msg.indexOf('fetch failed') !== -1) return true;
  return false;
}

function wrapEvolutionFetchError(e, hostname) {
  var code = errorCauseCode(e);
  var inner = (e && e.cause && e.cause.message) || (e && e.message) || String(e || '');
  var msg = inner + (code ? ' [' + code + ']' : '');
  if (isTlsVerifyError(code) && String(process.env.EVOLUTION_TLS_INSECURE || '').trim() !== '1') {
    msg +=
      ' — Evolution com certificado não confiável: defina EVOLUTION_TLS_INSECURE=1 nas env vars (só se confiar na origem).';
  }
  if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') {
    msg += ' — Verifique EVOLUTION_API_URL (host acessível a partir do servidor, ex. Vercel).';
  }
  if (code === 'ECONNREFUSED') {
    msg += ' — Conexão recusada: Evolution a correr e URL/porta corretos?';
  }
  var err = new Error(msg);
  err.code = code || undefined;
  if (hostname) err.hostname = hostname;
  return err;
}

async function evoFetch(path, init) {
  const cfg = getConfig();
  const { base, apikey } = cfg;
  if (!base || !apikey) {
    const err = new Error('evolution-not-configured');
    err.code = 'NOT_CONFIGURED';
    throw err;
  }
  const url = base + path;
  var timeoutMs = (init && init.timeoutMs) || DEFAULT_TIMEOUT_MS;
  var maxAttempts = (init && init.retries != null) ? init.retries : FETCH_RETRIES;

  var hostname = '';
  try {
    hostname = new URL(base).hostname;
  } catch (e) {}

  var disp = getInsecureDispatcher();
  var lastErr = null;

  for (var attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = new AbortController();
    const t = setTimeout(function () {
      controller.abort();
    }, timeoutMs);
    try {
      var fetchOpts = {
        method: (init && init.method) || 'GET',
        headers: Object.assign(
          {
            'Content-Type': 'application/json',
            apikey: apikey,
          },
          (init && init.headers) || {}
        ),
        body: init && init.body ? init.body : undefined,
        signal: controller.signal,
      };
      if (disp) fetchOpts.dispatcher = disp;

      const res = await fetch(url, fetchOpts);
      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        data = { raw: text };
      }
      clearTimeout(t);
      return { ok: res.ok, status: res.status, data };
    } catch (e) {
      clearTimeout(t);
      lastErr = e;
      var again = attempt < maxAttempts - 1 && isRetriableNetworkError(e);
      if (again) {
        await sleep(400 + attempt * 450);
        continue;
      }
      throw wrapEvolutionFetchError(e, hostname);
    }
  }
  throw wrapEvolutionFetchError(lastErr, hostname);
}

function onlyDigits(s) {
  return String(s == null ? '' : s).replace(/\D+/g, '');
}

function normalizeNumber(input, defaultDDI) {
  const digits = onlyDigits(input);
  if (!digits) return '';
  if (digits.length >= 11 && digits.length <= 15) {
    if (digits.length <= 11 && defaultDDI) {
      return onlyDigits(defaultDDI) + digits;
    }
    return digits;
  }
  return '';
}

function sameOrigin(req, opts) {
  opts = opts || {};
  const requireSource = !!opts.requireSource;
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase();
  if (!host) return false;
  const origin = String(req.headers.origin || '').toLowerCase();
  const referer = String(req.headers.referer || '').toLowerCase();
  if (!origin && !referer) return !requireSource;
  try {
    if (origin) {
      const u = new URL(origin);
      if (u.host.toLowerCase() === host) return true;
    }
  } catch (e) {}
  try {
    if (referer) {
      const u = new URL(referer);
      if (u.host.toLowerCase() === host) return true;
    }
  } catch (e) {}
  return false;
}

function adminAuthorized(req) {
  const expected = env('ZIRA_ADMIN_API_TOKEN');
  if (!expected) return false;
  const got = String(req.headers['x-zira-admin'] || '').trim();
  if (!got) return false;
  if (got.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= got.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

function readJsonBody(req) {
  return new Promise(function (resolve) {
    if (req.body != null) {
      if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
        resolve(req.body);
        return;
      }
      if (typeof req.body === 'string' && req.body.trim()) {
        try {
          resolve(JSON.parse(req.body));
          return;
        } catch (e) {
          resolve(null);
          return;
        }
      }
    }
    let raw = '';
    let oversized = false;
    req.on('data', function (chunk) {
      raw += chunk;
      if (raw.length > 64 * 1024) {
        oversized = true;
        try { req.destroy(); } catch (e) {}
      }
    });
    req.on('end', function () {
      if (oversized) {
        resolve(null);
        return;
      }
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        resolve(null);
      }
    });
    req.on('error', function () { resolve(null); });
  });
}

module.exports = {
  getConfig: getConfig,
  configIsReady: configIsReady,
  evoFetch: evoFetch,
  normalizeNumber: normalizeNumber,
  sameOrigin: sameOrigin,
  adminAuthorized: adminAuthorized,
  readJsonBody: readJsonBody,
};
