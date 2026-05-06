'use strict';

const auth = require('../_lib/auth.js');
const lib = require('../_lib/evolution.js');
const rl = require('../_lib/rateLimit.js');

function missingAuthEnv() {
  const missing = [];
  const username = String(process.env.ADMIN_USERNAME || '').trim();
  const password = String(process.env.ADMIN_PASSWORD || '');
  const secret = String(process.env.SESSION_SECRET || '').trim();
  if (!username) missing.push('ADMIN_USERNAME');
  if (!password) missing.push('ADMIN_PASSWORD');
  if (!secret || secret.length < 32) missing.push('SESSION_SECRET');
  return missing;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method-not-allowed' });
    return;
  }
  if (!lib.sameOrigin(req, { requireSource: true })) {
    res.status(403).json({ ok: false, error: 'origin' });
    return;
  }
  const limit = rl.check(req, 'auth-login', 8, 60 * 1000);
  if (!limit.ok) {
    res.status(429).json({ ok: false, error: 'rate-limited' });
    return;
  }

  const body = await lib.readJsonBody(req);
  if (!body || typeof body !== 'object') {
    res.status(400).json({ ok: false, error: 'bad-payload' });
    return;
  }
  const username = String(body.username || '').trim().slice(0, 120);
  const password = String(body.password || '').slice(0, 200);

  if (!auth.authConfigured()) {
    res.status(503).json({
      ok: false,
      error: 'admin-not-configured',
      missing: missingAuthEnv(),
    });
    return;
  }
  const cred = auth.adminCredentials();

  // Pequeno atraso para nivelar tempo de resposta entre falhas
  await new Promise(function (r) { setTimeout(r, 220); });

  const userOk = auth.timingSafeEqualStr(username, cred.username);
  const passOk = auth.timingSafeEqualStr(password, cred.password);
  if (!userOk || !passOk) {
    res.status(401).json({ ok: false, error: 'invalid-credentials' });
    return;
  }

  const exp = Date.now() + auth.SESSION_TTL_MS;
  auth.setSessionCookie(req, res, {
    u: username,
    role: 'admin',
    iat: Date.now(),
    exp: exp,
  });
  res.status(200).json({ ok: true, exp: exp, user: username });
};
