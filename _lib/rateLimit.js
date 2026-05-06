'use strict';

const buckets = new Map();

function getKey(req, scope) {
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ip =
    fwd ||
    String(req.headers['x-real-ip'] || '').trim() ||
    (req.socket && req.socket.remoteAddress) ||
    'unknown';
  return scope + ':' + ip;
}

function check(req, scope, limit, windowMs) {
  const key = getKey(req, scope);
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || now - bucket.start > windowMs) {
    bucket = { start: now, count: 0 };
  }
  bucket.count += 1;
  buckets.set(key, bucket);
  if (buckets.size > 5000) {
    const cutoff = now - windowMs * 4;
    for (const [k, v] of buckets) {
      if (v.start < cutoff) buckets.delete(k);
    }
  }
  return {
    ok: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    resetMs: Math.max(0, windowMs - (now - bucket.start)),
  };
}

module.exports = { check: check };
