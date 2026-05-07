'use strict';

const lib = require('../_lib/evolution.js');
const rl = require('../_lib/rateLimit.js');
const store = require('../_lib/leadStore.js');

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
  const limitIp = rl.check(req, 'leads-create-ip', 24, 60 * 1000);
  if (!limitIp.ok) {
    res.status(429).json({ ok: false, error: 'rate-limited' });
    return;
  }

  const body = await lib.readJsonBody(req);
  if (!body || typeof body !== 'object') {
    res.status(400).json({ ok: false, error: 'bad-payload' });
    return;
  }

  try {
    const result = await store.addLead(body);
    if (!result.ok) {
      res.status(400).json({ ok: false, error: result.reason || 'validation' });
      return;
    }
    res.status(200).json({ ok: true, lead: result.lead });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'store-failed' });
  }
};

