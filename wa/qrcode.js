'use strict';

const lib = require('../_lib/evolution.js');
const rl = require('../_lib/rateLimit.js');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method-not-allowed' });
    return;
  }
  if (!lib.sameOrigin(req)) {
    res.status(403).json({ ok: false, error: 'origin' });
    return;
  }
  if (!lib.adminAuthorized(req)) {
    res.status(401).json({ ok: false, error: 'unauthorized' });
    return;
  }

  const limit = rl.check(req, 'wa-qr', 30, 60 * 1000);
  if (!limit.ok) {
    res.status(429).json({ ok: false, error: 'rate-limited' });
    return;
  }

  const cfg = lib.getConfig();
  if (!lib.configIsReady(cfg)) {
    res.status(503).json({ ok: false, error: 'not-configured' });
    return;
  }

  try {
    const stateRes = await lib.evoFetch('/instance/connectionState/' + encodeURIComponent(cfg.instance), {});
    let state = '';
    if (stateRes.data) {
      state =
        (stateRes.data.instance && stateRes.data.instance.state) ||
        stateRes.data.state ||
        '';
    }

    if (stateRes.status === 404 || (stateRes.data && stateRes.data.status === 404)) {
      const created = await lib.evoFetch('/instance/create', {
        method: 'POST',
        body: JSON.stringify({
          instanceName: cfg.instance,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
        }),
      });
      const qr = extractQr(created.data);
      res.status(200).json({ ok: true, state: 'connecting', qrcode: qr.base64 || '', pairingCode: qr.pairingCode || '', created: true });
      return;
    }

    if (state === 'open') {
      res.status(200).json({ ok: true, state: 'open' });
      return;
    }

    const conn = await lib.evoFetch('/instance/connect/' + encodeURIComponent(cfg.instance), {});
    const qr = extractQr(conn.data);
    res.status(200).json({
      ok: true,
      state: state || 'connecting',
      qrcode: qr.base64 || '',
      pairingCode: qr.pairingCode || '',
    });
  } catch (e) {
    res.status(502).json({ ok: false, error: 'upstream-failed', message: String(e && e.message || e) });
  }
};

function extractQr(data) {
  if (!data || typeof data !== 'object') return { base64: '', pairingCode: '' };
  const base =
    data.base64 ||
    (data.qrcode && data.qrcode.base64) ||
    (data.qr && data.qr.base64) ||
    '';
  const pairing =
    data.pairingCode ||
    (data.qrcode && data.qrcode.pairingCode) ||
    '';
  return { base64: String(base || ''), pairingCode: String(pairing || '') };
}
