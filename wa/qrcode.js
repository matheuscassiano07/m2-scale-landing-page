'use strict';

const lib = require('../_lib/evolution.js');
const evoQr = require('../api/_lib/evoQrResolve.js');
const rl = require('../_lib/rateLimit.js');

function attachQrDebugIfEnabled(body, debugPayload) {
  if (!evoQr.qrDebugEnabled() || !debugPayload) return;
  body.qrDebug = Object.assign(
    {
      reason: evoQr.qrDebugReason(),
      envHint: {
        vercelEnv: process.env.VERCEL_ENV || null,
        nodeEnv: process.env.NODE_ENV || null,
      },
    },
    debugPayload
  );
}

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
      const qrAfterCreate = await evoQr.resolveFromPayload(created.data);
      let qr = qrAfterCreate;
      let bundleAfterCreate = null;
      if (!qr.base64) {
        bundleAfterCreate = await evoQr.fetchConnectUntilQr(lib, cfg);
        qr = bundleAfterCreate.qr;
      }
      const outCreate = {
        ok: true,
        state: 'connecting',
        qrcode: qr.base64 || '',
        pairingCode: qr.pairingCode || '',
        created: true,
      };
      attachQrDebugIfEnabled(outCreate, {
        phase: 'instance-create',
        afterCreate: evoQr.qrDebugStep(qrAfterCreate.parsed, qrAfterCreate, null, null),
        afterConnect: bundleAfterCreate
          ? evoQr.qrDebugStep(
              bundleAfterCreate.parsed,
              bundleAfterCreate.qr,
              bundleAfterCreate.conn,
              bundleAfterCreate.meta
            )
          : null,
      });
      res.status(200).json(outCreate);
      return;
    }

    if (state === 'open') {
      res.status(200).json({ ok: true, state: 'open' });
      return;
    }

    const bundle = await evoQr.fetchConnectUntilQr(lib, cfg);
    const qr = bundle.qr;
    var clientState = state || 'connecting';
    if ((qr.base64 || qr.pairingCode) && clientState === 'close') {
      clientState = 'connecting';
    }
    const outConn = {
      ok: true,
      state: clientState,
      qrcode: qr.base64 || '',
      pairingCode: qr.pairingCode || '',
    };
    attachQrDebugIfEnabled(outConn, {
      phase: 'instance-connect',
      afterConnect: evoQr.qrDebugStep(bundle.parsed, bundle.qr, bundle.conn, bundle.meta),
    });
    res.status(200).json(outConn);
  } catch (e) {
    res.status(502).json({ ok: false, error: 'upstream-failed', message: String(e && e.message || e) });
  }
};
