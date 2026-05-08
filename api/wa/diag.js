'use strict';

const lib = require('../_lib/evolution.js');
const evoQr = require('../_lib/evoQrResolve.js');
const rl = require('../_lib/rateLimit.js');
const auth = require('../_lib/auth.js');

function envPresent(name) {
  return Boolean(String(process.env[name] || '').trim());
}

function sessionSecretMeetsMin() {
  const s = String(process.env.SESSION_SECRET || '').trim();
  return s.length >= 32;
}

function isHostnamePublic(hostname) {
  const h = String(hostname || '').toLowerCase();
  if (!h) return false;
  if (h === 'localhost' || h === '::1') return false;
  if (h.endsWith('.local')) return false;
  if (/^127\./.test(h)) return false;
  if (/^10\./.test(h)) return false;
  if (/^192\.168\./.test(h)) return false;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(h)) return false;
  return true;
}

function evolutionUrlInfoFromBase(base) {
  const b = String(base || '').trim();
  if (!b) {
    return { isHttps: false, isPublic: false, hostname: '' };
  }
  try {
    const u = new URL(b.startsWith('http') ? b : 'https://' + b);
    const hostname = u.hostname.toLowerCase();
    return {
      isHttps: u.protocol === 'https:',
      isPublic: isHostnamePublic(hostname),
      hostname: hostname,
    };
  } catch (e) {
    return { isHttps: false, isPublic: false, hostname: '' };
  }
}

function errorCauseCode(e) {
  if (!e) return null;
  const c = e.cause;
  return (c && c.code) || e.code || null;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'method-not-allowed' });
    return;
  }
  if (!lib.sameOrigin(req, { requireSource: true })) {
    res.status(403).json({ ok: false, error: 'origin' });
    return;
  }

  const sessionPayload = auth.requireAuth(req);
  if (!sessionPayload) {
    res.status(401).json({ ok: false, error: 'unauthorized' });
    return;
  }

  const limit = rl.check(req, 'wa-diag', 12, 60 * 1000);
  if (!limit.ok) {
    res.status(429).json({ ok: false, error: 'rate-limited' });
    return;
  }

  const body = {
    ok: true,
    at: new Date().toISOString(),
    sessionAuthOk: true,
    envFlags: {
      EVOLUTION_API_URL: envPresent('EVOLUTION_API_URL'),
      EVOLUTION_API_KEY: envPresent('EVOLUTION_API_KEY'),
      EVOLUTION_INSTANCE: envPresent('EVOLUTION_INSTANCE'),
      SESSION_SECRET: sessionSecretMeetsMin(),
      ADMIN_USERNAME: envPresent('ADMIN_USERNAME'),
      ADMIN_PASSWORD: envPresent('ADMIN_PASSWORD'),
      WA_NOTIFY_NUMBER: envPresent('WA_NOTIFY_NUMBER'),
      ZIRA_DEBUG_WA: envPresent('ZIRA_DEBUG_WA'),
      EVOLUTION_TLS_INSECURE: envPresent('EVOLUTION_TLS_INSECURE'),
      EVOLUTION_IPV4_FIRST: envPresent('EVOLUTION_IPV4_FIRST'),
      EVOLUTION_FETCH_TIMEOUT_MS: envPresent('EVOLUTION_FETCH_TIMEOUT_MS'),
    },
    evolutionUrlInfo: { isHttps: false, isPublic: false, hostname: '' },
    upstream: {
      httpStatus: null,
      evolutionState: null,
      hasOwner: false,
      errorCode: null,
    },
    qrAttempt: null,
  };

  try {
    const cfg = lib.getConfig();
    body.evolutionUrlInfo = evolutionUrlInfoFromBase(cfg.base);

    if (!lib.configIsReady(cfg)) {
      body.upstream = { skipped: true, reason: 'not-configured' };
      body.qrAttempt = { skipped: true, reason: 'not-configured' };
      res.status(200).json(body);
      return;
    }

    try {
      const r = await lib.evoFetch('/instance/connectionState/' + encodeURIComponent(cfg.instance), {});
      body.upstream.httpStatus = r.status;
      let state = '';
      let number = '';
      if (r.data) {
        state =
          (r.data.instance && r.data.instance.state) ||
          r.data.state ||
          '';
        number =
          (r.data.instance && (r.data.instance.owner || r.data.instance.number)) ||
          r.data.owner ||
          '';
      }
      body.upstream.evolutionState = state || null;
      body.upstream.hasOwner = Boolean(String(number || '').trim());
    } catch (e) {
      body.upstream.errorCode = errorCauseCode(e) || 'exception';
    }

    try {
      const bundle = await evoQr.fetchConnectUntilQr(lib, cfg);
      const p = bundle.parsed || {};
      const qr = bundle.qr || {};
      const meta = bundle.meta || {};
      body.qrAttempt = {
        evolutionCount: typeof p.count === 'number' ? p.count : null,
        codePresent: !!(p.code && String(p.code).length > 8),
        materialSource: qr.materialSource || 'none',
        renderedPng: !!(qr.base64 && String(qr.base64).length > 0),
        connectAttempts: meta.connectAttempts != null ? meta.connectAttempts : null,
        upstreamHttpStatus: bundle.conn ? bundle.conn.status : null,
      };
    } catch (e) {
      body.qrAttempt = {
        errorCode: errorCauseCode(e) || 'exception',
        connectAttempts: null,
        upstreamHttpStatus: null,
        evolutionCount: null,
        codePresent: false,
        materialSource: 'none',
        renderedPng: false,
      };
    }
  } catch (fatal) {
    body.diagFatal = String((fatal && fatal.message) || fatal).slice(0, 400);
  }

  res.status(200).json(body);
};
