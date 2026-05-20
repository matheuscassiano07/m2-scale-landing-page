'use strict';

const guard = require('../_lib/johnGuard.js');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'method-not-allowed' });
    return;
  }

  res.status(200).json({
    ok: true,
    service: 'john-chat',
    geminiConfigured: guard.geminiEnabled(),
    model: String(process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite').trim(),
    disabled: String(process.env.JOHN_CHAT_DISABLED || '').trim() === '1',
  });
};
