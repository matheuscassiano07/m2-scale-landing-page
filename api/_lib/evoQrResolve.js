'use strict';

/**
 * Normaliza respostas da Evolution API (/instance/connect, /instance/create):
 * - qrcode.count === 0 e base64 vazio: QR ainda não materializado → retentar.
 * - base64 ausente mas code (string ref do Baileys) presente → gera PNG localmente.
 */

function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

function pickStr(v) {
  if (v == null) return '';
  var s = String(v).trim();
  return s || '';
}

function parseEvoQrData(data) {
  if (!data || typeof data !== 'object') {
    return { base64: '', pairingCode: '', code: '', count: 0 };
  }
  var inner = data.qrcode != null && typeof data.qrcode === 'object' ? data.qrcode : null;
  var src = inner || data;
  var base64 =
    pickStr(data.base64) ||
    pickStr(src.base64) ||
    (data.qr && typeof data.qr === 'object' ? pickStr(data.qr.base64) : '');
  var pairingCode = pickStr(data.pairingCode) || pickStr(src.pairingCode) || '';
  var code = pickStr(data.code) || pickStr(src.code) || '';
  var count = 0;
  if (typeof src.count === 'number' && !Number.isNaN(src.count)) count = src.count;
  else if (typeof data.count === 'number' && !Number.isNaN(data.count)) count = data.count;
  return { base64: base64, pairingCode: pairingCode, code: code, count: count };
}

function stripDataUrlBase64(base64) {
  var s = pickStr(base64);
  if (!s) return '';
  var m = /^data:image\/[^;]+;base64,(.+)$/i.exec(s);
  return m ? m[1].replace(/\s/g, '') : s.replace(/\s/g, '');
}

async function materializeWaQr(parsed) {
  var b = stripDataUrlBase64(parsed.base64);
  if (b) {
    return { base64: b, pairingCode: parsed.pairingCode, materialSource: 'upstream' };
  }
  var raw = parsed.code;
  if (raw && raw.length > 8) {
    try {
      var QRCode = require('qrcode');
      var dataUrl = await QRCode.toDataURL(raw, {
        margin: 2,
        width: 280,
        errorCorrectionLevel: 'H',
        color: { dark: '#0a0a0c', light: '#ffffff' },
      });
      b = stripDataUrlBase64(dataUrl);
      if (b) return { base64: b, pairingCode: parsed.pairingCode, materialSource: 'code' };
    } catch (e) {
      /* ignore */
    }
  }
  return { base64: '', pairingCode: parsed.pairingCode, materialSource: 'none' };
}

/**
 * GET /instance/connect/{instance} com variantes de query (qrcode=1 pedido pelo painel / forks).
 */
async function fetchConnectUntilQr(lib, cfg) {
  var name = encodeURIComponent(cfg.instance);
  var paths = [
    '/instance/connect/' + name + '?qrcode=true&qr=1',
    '/instance/connect/' + name + '?qrcode=1',
    '/instance/connect/' + name + '?qrcode=true',
    '/instance/connect/' + name,
  ];
  var lastConn = null;
  var lastPath = '';
  var attempt;
  for (attempt = 0; attempt < 6; attempt++) {
    var path = paths[Math.min(attempt, paths.length - 1)];
    lastPath = path;
    lastConn = await lib.evoFetch(path, {});
    var parsed = parseEvoQrData(lastConn.data);
    var qr = await materializeWaQr(parsed);
    if (qr.base64) {
      return {
        conn: lastConn,
        qr: qr,
        parsed: parsed,
        meta: { connectAttempts: attempt + 1, lastPath: path },
      };
    }
    await sleep(450 + attempt * 120);
  }
  var finalParsed = parseEvoQrData(lastConn && lastConn.data);
  var finalQr = await materializeWaQr(finalParsed);
  return {
    conn: lastConn,
    qr: finalQr,
    parsed: finalParsed,
    meta: { connectAttempts: 6, lastPath: lastPath },
  };
}

async function resolveFromPayload(data) {
  var parsed = parseEvoQrData(data);
  var qr = await materializeWaQr(parsed);
  return {
    base64: qr.base64,
    pairingCode: qr.pairingCode,
    materialSource: qr.materialSource,
    parsed: parsed,
  };
}

function qrDebugEnabled() {
  if (String(process.env.ZIRA_DEBUG_WA || '').trim() === '1') return true;
  if (String(process.env.VERCEL_ENV || '').trim() === 'development') return true;
  if (String(process.env.NODE_ENV || '').trim() === 'development') return true;
  return false;
}

/** Razão pela qual o debug está ativo (para o cliente não confundir com produção). */
function qrDebugReason() {
  if (String(process.env.ZIRA_DEBUG_WA || '').trim() === '1') return 'ZIRA_DEBUG_WA=1';
  if (String(process.env.VERCEL_ENV || '').trim() === 'development') return 'VERCEL_ENV=development';
  if (String(process.env.NODE_ENV || '').trim() === 'development') return 'NODE_ENV=development';
  return '';
}

/**
 * Um passo da pipeline (resposta create ou último connect).
 * evolutionCount = qrcode.count da Evolution (0 → 1+ quando o QR começa a atualizar).
 */
function qrDebugStep(parsed, qrRow, conn, meta) {
  var p = parsed || {};
  var row = qrRow || {};
  var out = {
    evolutionCount: typeof p.count === 'number' ? p.count : null,
    codePresent: !!(p.code && String(p.code).length > 8),
    pairingCodePresent: !!(p.pairingCode && String(p.pairingCode).trim()),
    materialSource: row.materialSource || 'none',
    renderedPng: !!(row.base64 && String(row.base64).length > 0),
  };
  if (meta) {
    out.connectAttempts = meta.connectAttempts;
    out.lastConnectPath = meta.lastPath;
  }
  if (conn) {
    out.upstreamHttpStatus = conn.status;
    out.upstreamOk = conn.ok;
  }
  return out;
}

module.exports = {
  parseEvoQrData: parseEvoQrData,
  materializeWaQr: materializeWaQr,
  fetchConnectUntilQr: fetchConnectUntilQr,
  resolveFromPayload: resolveFromPayload,
  qrDebugEnabled: qrDebugEnabled,
  qrDebugReason: qrDebugReason,
  qrDebugStep: qrDebugStep,
};
