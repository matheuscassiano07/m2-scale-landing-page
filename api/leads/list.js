'use strict';

const lib = require('../_lib/evolution.js');
const auth = require('../_lib/auth.js');
const store = require('../_lib/leadStore.js');

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

  try {
    const leads = await store.readAll();
    res.status(200).json({
      ok: true,
      leads: leads,
      storage: store.getStorageState(),
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'store-failed' });
  }
};

