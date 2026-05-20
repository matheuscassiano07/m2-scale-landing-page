'use strict';

const rl = require('./rateLimit.js');

function envInt(name, fallback, min, max) {
  const n = parseInt(String(process.env[name] || ''), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function geminiEnabled() {
  if (String(process.env.JOHN_CHAT_DISABLED || '').trim() === '1') return false;
  if (String(process.env.JOHN_CHAT_ENABLED || '').trim() === '0') return false;
  const key = String(process.env.GEMINI_API_KEY || '').trim();
  return key.length >= 20;
}

function checkRequest(req, sessionId) {
  if (!geminiEnabled()) {
    return { ok: false, reason: 'disabled', tokens: false };
  }

  const burst = rl.check(req, 'john-gemini-ip-min', 3, 60 * 1000);
  if (!burst.ok) return { ok: false, reason: 'rate-ip-burst', tokens: false };

  const hourIp = rl.check(req, 'john-gemini-ip-hour', 10, 60 * 60 * 1000);
  if (!hourIp.ok) return { ok: false, reason: 'rate-ip-hour', tokens: false };

  const hourGlobal = rl.check(
    req,
    'john-gemini-global-hour',
    envInt('JOHN_CHAT_MAX_GEMINI_HOUR', 30, 1, 500),
    60 * 60 * 1000
  );
  if (!hourGlobal.ok) return { ok: false, reason: 'rate-global-hour', tokens: false };

  const dayGlobal = rl.check(
    req,
    'john-gemini-global-day',
    envInt('JOHN_CHAT_MAX_GEMINI_DAY', 120, 1, 5000),
    24 * 60 * 60 * 1000
  );
  if (!dayGlobal.ok) return { ok: false, reason: 'rate-global-day', tokens: false };

  const sid = String(sessionId || '').trim().slice(0, 64);
  if (sid.length >= 8) {
    const perSession = envInt('JOHN_CHAT_MAX_USER_TURNS', 6, 3, 12) + 2;
    const sessHour = rl.check(req, 'john-gemini-sess-' + sid, perSession, 60 * 60 * 1000);
    if (!sessHour.ok) return { ok: false, reason: 'rate-session', tokens: false };
  }

  return { ok: true };
}

module.exports = {
  geminiEnabled: geminiEnabled,
  checkRequest: checkRequest,
};
