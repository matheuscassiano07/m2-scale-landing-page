'use strict';

const crypto = require('crypto');

const COOKIE_NAME = 'zira_session';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24h

function env(name) {
  const v = process.env[name];
  return typeof v === 'string' ? v.trim() : '';
}

function getSecret() {
  const s = env('SESSION_SECRET');
  if (!s || s.length < 32) return '';
  return s;
}

function b64url(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function b64urlDecode(str) {
  str = String(str || '').replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64');
}

function sign(payload) {
  const secret = getSecret();
  if (!secret) throw new Error('session-secret-not-configured');
  const data = b64url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', secret).update(data).digest();
  return data + '.' + b64url(sig);
}

function verify(token) {
  const secret = getSecret();
  if (!secret) return null;
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, providedSig] = parts;
  const expected = b64url(crypto.createHmac('sha256', secret).update(data).digest());
  if (providedSig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= providedSig.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) return null;
  let payload;
  try {
    payload = JSON.parse(b64urlDecode(data).toString('utf8'));
  } catch (e) {
    return null;
  }
  if (!payload || typeof payload !== 'object') return null;
  if (!payload.exp || Date.now() > payload.exp) return null;
  return payload;
}

function parseCookies(req) {
  const raw = String(req.headers.cookie || '');
  const out = {};
  if (!raw) return out;
  raw.split(';').forEach(function (part) {
    const eq = part.indexOf('=');
    if (eq < 0) return;
    const k = part.slice(0, eq).trim();
    const v = part.slice(eq + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  });
  return out;
}

function setSessionCookie(req, res, payload) {
  const token = sign(payload);
  const isHttps = isRequestSecure(req);
  const parts = [
    COOKIE_NAME + '=' + encodeURIComponent(token),
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=' + Math.floor(SESSION_TTL_MS / 1000),
  ];
  if (isHttps) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
  return token;
}

function clearSessionCookie(req, res) {
  const isHttps = isRequestSecure(req);
  const parts = [
    COOKIE_NAME + '=',
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (isHttps) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function isRequestSecure(req) {
  const proto = String(req.headers['x-forwarded-proto'] || '').toLowerCase();
  if (proto.indexOf('https') !== -1) return true;
  if (req.connection && req.connection.encrypted) return true;
  return false;
}

function requireAuth(req) {
  const cookies = parseCookies(req);
  const tok = cookies[COOKIE_NAME];
  return verify(tok);
}

function adminCredentials() {
  return {
    username: env('ADMIN_USERNAME'),
    password: env('ADMIN_PASSWORD'),
  };
}

function authConfigured() {
  const cred = adminCredentials();
  return Boolean(getSecret() && cred.username && cred.password);
}

function timingSafeEqualStr(a, b) {
  a = String(a || '');
  b = String(b || '');
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

module.exports = {
  COOKIE_NAME: COOKIE_NAME,
  SESSION_TTL_MS: SESSION_TTL_MS,
  sign: sign,
  verify: verify,
  parseCookies: parseCookies,
  setSessionCookie: setSessionCookie,
  clearSessionCookie: clearSessionCookie,
  requireAuth: requireAuth,
  adminCredentials: adminCredentials,
  authConfigured: authConfigured,
  timingSafeEqualStr: timingSafeEqualStr,
};
