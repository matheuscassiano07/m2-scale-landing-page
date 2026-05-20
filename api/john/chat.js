'use strict';

const lib = require('../_lib/evolution.js');
const rl = require('../_lib/rateLimit.js');
const john = require('../_lib/johnChat.js');
const inquiries = require('../_lib/inquiryStore.js');

function capSource(s) {
  const v = String(s || 'john-chat').trim().slice(0, 48);
  return v || 'john-chat';
}

function capSession(s) {
  return String(s || '').trim().slice(0, 64);
}

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

  const limitBurst = rl.check(req, 'john-chat-burst', 4, 60 * 1000);
  if (!limitBurst.ok) {
    res.status(429).json({
      ok: false,
      error: 'rate-limited',
      text: john.canned('pt', 'rateLimit'),
    });
    return;
  }
  const limitHour = rl.check(req, 'john-chat-hour', 16, 60 * 60 * 1000);
  if (!limitHour.ok) {
    res.status(429).json({
      ok: false,
      error: 'rate-limited',
      text: john.canned('pt', 'rateLimit'),
    });
    return;
  }

  const body = await lib.readJsonBody(req);
  if (!body || typeof body !== 'object') {
    res.status(400).json({ ok: false, error: 'bad-payload' });
    return;
  }

  if (body.website || body.url || body._hp) {
    res.status(400).json({ ok: false, error: 'spam' });
    return;
  }

  const lang = body.lang === 'en' ? 'en' : 'pt';
  const message = String(body.message || '').trim();
  if (message.length > john.MAX_MESSAGE_CHARS) {
    res.status(400).json({ ok: false, error: 'too-long' });
    return;
  }

  try {
    const result = await john.reply({
      message: message,
      lang: lang,
      turn: body.turn,
      history: body.history,
      req: req,
      sessionId: capSession(body.sessionId),
    });

    if (message.length >= 2 && result && result.text) {
      inquiries
        .addInquiry({
          lang: lang,
          source: capSource(body.source),
          sessionId: capSession(body.sessionId),
          userMessage: message,
          assistantReply: result.text,
          kind: result.kind || 'answer',
          tokens: !!result.tokens,
        })
        .catch(function () {});
    }

    res.status(200).json({
      ok: result.ok,
      kind: result.kind || 'answer',
      text: result.text,
      tokens: !!result.tokens,
      maxTurns: john.MAX_USER_TURNS,
    });
  } catch (e) {
    res.status(500).json({
      ok: false,
      error: 'server-error',
      text: john.canned(lang, 'noApi'),
    });
  }
};
