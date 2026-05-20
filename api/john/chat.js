'use strict';

const lib = require('../_lib/evolution.js');
const rl = require('../_lib/rateLimit.js');
const john = require('../_lib/johnChat.js');
const inquiries = require('../_lib/inquiryStore.js');

const HANDLER_DEADLINE_MS = 9000;

function capSource(s) {
  const v = String(s || 'john-chat').trim().slice(0, 48);
  return v || 'john-chat';
}

function capSession(s) {
  return String(s || '').trim().slice(0, 64);
}

function deadlineFallback(lang) {
  return {
    ok: true,
    kind: 'timeout',
    text: john.canned(lang, 'noApi'),
    tokens: false,
    maxTurns: john.MAX_USER_TURNS,
  };
}

function withDeadline(promise, ms, lang) {
  return Promise.race([
    promise,
    new Promise(function (resolve) {
      setTimeout(function () {
        resolve(deadlineFallback(lang));
      }, ms);
    }),
  ]);
}

async function handlePost(req, res) {
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

  const work = (async function () {
    const message = String(body.message || '').trim();
    if (message.length > john.MAX_MESSAGE_CHARS) {
      return { status: 400, payload: { ok: false, error: 'too-long' } };
    }

    const result = await john.reply({
      message: message,
      lang: lang,
      validTurns: body.validTurns,
      offTopicStrikes: body.offTopicStrikes,
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

    return {
      status: 200,
      payload: {
        ok: result.ok,
        kind: result.kind || 'answer',
        text: result.text,
        tokens: !!result.tokens,
        maxTurns: result.maxTurns || john.MAX_USER_TURNS,
        maxOffTopic: result.maxOffTopic || john.MAX_OFF_TOPIC_STRIKES,
        validTurns: result.validTurns,
        offTopicStrikes: result.offTopicStrikes,
        lockChat: !!result.lockChat,
        lockReason: result.lockReason || '',
        remainingTurns:
          typeof result.remainingTurns === 'number' ? result.remainingTurns : undefined,
      },
    };
  })();

  const boxed = await withDeadline(work, HANDLER_DEADLINE_MS, lang);

  if (boxed && boxed.status === 400) {
    res.status(400).json(boxed.payload);
    return;
  }

  if (boxed && boxed.payload) {
    res.status(boxed.status || 200).json(boxed.payload);
    return;
  }

  res.status(200).json(boxed);
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method-not-allowed' });
    return;
  }

  try {
    if (!lib.sameOrigin(req, { requireSource: true })) {
      res.status(403).json({ ok: false, error: 'origin' });
      return;
    }

    await handlePost(req, res);
  } catch (e) {
    try {
      console.warn('[john/chat] unhandled:', String((e && e.message) || e));
    } catch (_) {}
    const lang =
      req.body && req.body.lang === 'en'
        ? 'en'
        : 'pt';
    if (!res.headersSent) {
      res.status(200).json(deadlineFallback(lang));
    }
  }
};
