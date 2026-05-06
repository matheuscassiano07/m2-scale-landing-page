'use strict';

const auth = require('../_lib/auth.js');
const lib = require('../_lib/evolution.js');

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
  auth.clearSessionCookie(req, res);
  res.status(200).json({ ok: true });
};
