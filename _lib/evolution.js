'use strict';

const TIMEOUT_MS = 12000;

function env(name) {
  const v = process.env[name];
  return typeof v === 'string' ? v.trim() : '';
}

function getConfig() {
  const base = env('EVOLUTION_API_URL').replace(/\/+$/, '');
  const apikey = env('EVOLUTION_API_KEY');
  const instance = env('EVOLUTION_INSTANCE') || 'zira-admin';
  return { base, apikey, instance };
}

function configIsReady(cfg) {
  return Boolean(cfg && cfg.base && cfg.apikey && cfg.instance);
}

async function evoFetch(path, init) {
  const { base, apikey } = getConfig();
  if (!base || !apikey) {
    const err = new Error('evolution-not-configured');
    err.code = 'NOT_CONFIGURED';
    throw err;
  }
  const url = base + path;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
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
    });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = { raw: text };
    }
    return { ok: res.ok, status: res.status, data };
  } finally {
    clearTimeout(t);
  }
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

function sameOrigin(req) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase();
  if (!host) return false;
  const origin = String(req.headers.origin || '').toLowerCase();
  const referer = String(req.headers.referer || '').toLowerCase();
  if (!origin && !referer) return true;
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
    if (req.body && typeof req.body === 'object') {
      resolve(req.body);
      return;
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
