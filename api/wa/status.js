'use strict';

const lib = require('../_lib/evolution.js');
const rl = require('../_lib/rateLimit.js');
const auth = require('../_lib/auth.js');

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
  if (!auth.requireAuth(req)) {
    res.status(401).json({ ok: false, error: 'unauthorized' });
    return;
  }

  const limit = rl.check(req, 'wa-status', 60, 60 * 1000);
  if (!limit.ok) {
    res.status(429).json({ ok: false, error: 'rate-limited' });
    return;
  }

  const cfg = lib.getConfig();
  if (!lib.configIsReady(cfg)) {
    res.status(200).json({ ok: true, state: 'not-configured' });
    return;
  }

  try {
    const r = await lib.evoFetch('/instance/connectionState/' + encodeURIComponent(cfg.instance), {});
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
    if (r.status === 404) {
      res.status(200).json({ ok: true, state: 'absent' });
      return;
    }
    res.status(200).json({ ok: true, state: state || 'unknown', number: String(number || '') });
  } catch (e) {
    res.status(502).json({ ok: false, error: 'upstream-failed' });
  }
};
