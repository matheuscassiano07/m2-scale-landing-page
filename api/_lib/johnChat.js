'use strict';

const guard = require('./johnGuard.js');
const johnPrompt = require('./johnSystemPrompt.js');

const MAX_USER_TURNS = 2;
const MAX_MESSAGE_CHARS = 280;
const MIN_GEMINI_CHARS = 10;
const MAX_OUTPUT_TOKENS = 120;
/** Abaixo do limite típico da Vercel Hobby (~10s) para evitar 503/504 */
const GEMINI_TIMEOUT_MS = 7500;

const OFF_TOPIC_RE = [
  /\b(futebol|flamengo|palmeiras|corinthians|champions)\b/i,
  /\b(receita\s+de|como\s+cozinhar|bolo\s+de|ingredientes\s+para)\b/i,
  /\b(piada|conte\s+uma\s+hist[oó]ria|engra[cç]ado)\b/i,
  /\b(previs[aã]o\s+do\s+tempo|clima\s+em|vai\s+chover)\b/i,
  /\b(pol[ií]tica|elei[cç][aã]o|presidente\s+do)\b/i,
  /\b(bitcoin|criptomoeda|ethereum)\b/i,
  /\b(reda[cç][aã]o|dever\s+de\s+casa|exerc[ií]cio\s+de\s+matem)\b/i,
  /\b(traduza\s+este|translate\s+this\s+poem)\b/i,
  /\b(quem\s+ganhou|resultado\s+do\s+jogo)\b/i,
  /\b(c[aã]lculo\s+de\s+imc|emagrecer|dieta\s+para)\b/i,
];

const ON_TOPIC_RE = [
  /\b(cantevo|john\s*ai|zira)\b/i,
  /\b(arquitetur|engenharia|engenheiro|obra[s]?|escrit[oó]rio)\b/i,
  /\b(plataforma|software|sistema|gest[aã]o|operac[aã]o|ferramenta|produto)\b/i,
  /\b(whatsapp|atendimento|lead[s]?|cliente[s]?|projeto[s]?|prazo[s]?|equipe|tarefa)\b/i,
  /\b(pre[cç]o|valor|plano[s]?|demo|demonstra[cç][aã]o|agendar|contato|or[cç]amento)\b/i,
  /\b(funciona|como\s+[eé]|o\s+que\s+[eé]|quanto\s+custa)\b/i,
  /\b(compatibiliz|briefing|memorial|checklist|entrega|acompanhamento|prioridade)\b/i,
  /\b(organiz|informa[cç][aã]o\s+espalhada|retrabalho|inbox|cobran[cç]a|irritad)\b/i,
  /\b(condom[ií]nio|empreendimento|incorporadora|reforma|residencial|comercial)\b/i,
  /\b(painel|site)\b/i,
];

/** Perguntas sobre benefício para a empresa do visitante — sempre sobre Cantevo no site */
const PRODUCT_INTENT_RE = [
  /\bcomo\s+(isso|isto|o\s+cantevo|a\s+cantevo|vocês|o\s+sistema|a\s+plataforma)\b/i,
  /\b(me\s+ajuda|pode\s+me\s+ajudar|ajudam|ajudar|ajuda)\b/i,
  /\b(minha|meu|nossa|nosso)\s+(empresa|escrit[oó]rio|neg[oó]cio|time|equipe|firma)\b/i,
  /\b(isso|isto|essa\s+ferramenta|este\s+sistema|o\s+produto|a\s+plataforma|o\s+cantevo)\b/i,
  /\b(vale\s+a\s+pena|benef[ií]cio|vantagem|por\s+que\s+usar|serve\s+para)\b/i,
  /\b(quero\s+(saber|conhecer)|tenho\s+uma\s+d[uú]vida)\b/i,
  /\bo\s+que\s+(é|faz|oferece|resolve)\b/i,
  /\bpara\s+(quem|que\s+serve)\b/i,
  /\b(adotar|contratar|implementar|usar)\b/i,
];

function env(name, fallback) {
  const v = process.env[name];
  if (typeof v === 'string' && v.trim()) return v.trim();
  return fallback || '';
}

function clampText(s, max) {
  return String(s || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function isClearlyOffTopic(text) {
  const t = text.toLowerCase();
  for (let i = 0; i < OFF_TOPIC_RE.length; i++) {
    if (OFF_TOPIC_RE[i].test(t)) return true;
  }
  return false;
}

function isOnTopic(text) {
  const t = text.toLowerCase();
  if (isClearlyOffTopic(t)) return false;
  for (let i = 0; i < ON_TOPIC_RE.length; i++) {
    if (ON_TOPIC_RE[i].test(t)) return true;
  }
  for (let j = 0; j < PRODUCT_INTENT_RE.length; j++) {
    if (PRODUCT_INTENT_RE[j].test(t)) return true;
  }
  if (/^(oi|ol[aá]|bom\s+dia|boa\s+tarde|hey|hello)\b/i.test(t)) return true;
  /* No site Cantevo, pergunta com ? e texto razoável costuma ser sobre o produto */
  if (t.length >= 12 && /\?/.test(t)) return true;
  if (t.length <= 24 && /\?/.test(t)) return true;
  return false;
}

function canned(lang, key) {
  const pt = {
    offTopic:
      'Sou o John AI da Cantevo — posso explicar como a plataforma ajuda seu escritório (WhatsApp, clientes, obras, equipe). Para assuntos fora disso, use **Entrar em contato** abaixo.',
    handoff:
      'Para falar com alguém da equipe, preencha o formulário **Entrar em contato** — respondemos em até 8 horas.',
    greet:
      'Olá! Sou o John, da Cantevo. Qual sua dúvida sobre como a plataforma funciona ou como ajudamos seu escritório?',
    noApi:
      'No momento o chat automático está indisponível. Use o formulário **Entrar em contato** abaixo que a equipe responde em até 8 horas.',
    rateLimit: 'Muitas mensagens em pouco tempo. Aguarde um minuto ou use o formulário de contato.',
    invalid: 'Não foi possível enviar. Tente de novo ou use o formulário de contato.',
    short:
      'Descreva sua dúvida sobre a Cantevo em pelo menos uma frase curta, ou use o formulário **Entrar em contato**.',
    budget:
      'O chat automático atingiu o limite de uso por hoje. Use o formulário **Entrar em contato** — nossa equipe responde em até 8 horas.',
  };
  const en = {
    offTopic:
      'I can only help with Cantevo and John AI (platform, demo, studio operations). For anything else, use the **Get in touch** form below.',
    handoff:
      'For a specialist, leave your details in the **Get in touch** form — we reply within 8 hours.',
    greet:
      'Hi! Ask about Cantevo or John AI: how we organize intake, jobsites and deadlines for your studio.',
    noApi:
      'Auto chat is temporarily unavailable. Use the **Get in touch** form below — we reply within 8 hours.',
    rateLimit: 'Too many messages. Wait a minute or use the contact form.',
    invalid: 'Could not send. Try again or use the contact form.',
    short:
      'Please describe your Cantevo question in at least a short sentence, or use the **Get in touch** form.',
    budget:
      'Auto chat reached today’s usage limit. Use the **Get in touch** form — we reply within 8 hours.',
  };
  const dict = lang === 'en' ? en : pt;
  return dict[key] || dict.invalid;
}

async function callGemini(history, userMessage, lang, req, sessionId) {
  if (!guard.geminiEnabled()) return { ok: false, reason: 'no-key' };

  const gate = guard.checkRequest(req, sessionId);
  if (!gate.ok) return { ok: false, reason: gate.reason || 'blocked' };

  const key = env('GEMINI_API_KEY');
  const model = env('GEMINI_MODEL', 'gemini-2.5-flash-lite');
  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/' +
    encodeURIComponent(model) +
    ':generateContent';

  const contents = [];
  const hist = Array.isArray(history) ? history.slice(-4) : [];
  for (let i = 0; i < hist.length; i++) {
    const h = hist[i];
    if (!h || !h.role || !h.text) continue;
    contents.push({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: clampText(h.text, 500) }],
    });
  }
  contents.push({ role: 'user', parts: [{ text: clampText(userMessage, MAX_MESSAGE_CHARS) }] });

  const body = {
    systemInstruction: { parts: [{ text: johnPrompt.systemInstruction(lang) }] },
    contents: contents,
    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      candidateCount: 1,
    },
  };

  const controller = new AbortController();
  const timer = setTimeout(function () {
    controller.abort();
  }, GEMINI_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(timer);
    return { ok: false, reason: 'gemini-fetch-failed' };
  }
  clearTimeout(timer);

  if (!res.ok) {
    const st = res.status;
    if (st === 429 || st === 503 || st === 502 || st === 500) {
      return { ok: false, reason: 'gemini-upstream-' + st };
    }
    return { ok: false, reason: 'gemini-http-' + st };
  }

  let data;
  try {
    data = await res.json();
  } catch (e) {
    return { ok: false, reason: 'gemini-bad-json' };
  }
  const parts = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
  const text = parts && parts[0] && parts[0].text ? String(parts[0].text).trim() : '';
  if (!text) return { ok: false, reason: 'empty' };
  return { ok: true, text: clampText(text, 520) };
}

async function reply(payload) {
  const lang = payload && payload.lang === 'en' ? 'en' : 'pt';
  try {
    return await replyInner(payload, lang);
  } catch (e) {
    try {
      console.warn('[johnChat] reply error:', String((e && e.message) || e));
    } catch (_) {}
    return { ok: true, kind: 'fallback', text: canned(lang, 'noApi'), tokens: false };
  }
}

async function replyInner(payload, lang) {
  const message = clampText(payload && payload.message, MAX_MESSAGE_CHARS);
  const turn = Math.max(0, Math.min(MAX_USER_TURNS, parseInt(String((payload && payload.turn) || 0), 10) || 0));
  const req = payload && payload.req;
  const sessionId = clampText(payload && payload.sessionId, 64);

  if (!message) {
    return { ok: false, error: 'empty', text: canned(lang, 'invalid') };
  }

  if (turn >= MAX_USER_TURNS) {
    return { ok: true, kind: 'handoff', text: canned(lang, 'handoff'), tokens: false };
  }

  if (/^(oi|ol[aá]|bom\s+dia|boa\s+tarde|hey|hello|hi)\s*[!?.]*$/i.test(message)) {
    return { ok: true, kind: 'greet', text: canned(lang, 'greet'), tokens: false };
  }

  if (!isOnTopic(message)) {
    return { ok: true, kind: 'off-topic', text: canned(lang, 'offTopic'), tokens: false };
  }

  if (message.length < MIN_GEMINI_CHARS) {
    return {
      ok: true,
      kind: 'answer',
      text: canned(lang, 'short'),
      tokens: false,
    };
  }

  const gemini = await callGemini(payload.history, message, lang, req, sessionId);
  if (!gemini.ok) {
    const reason = String(gemini.reason || '');
    const budget = reason.indexOf('rate') === 0;
    const upstream =
      reason.indexOf('gemini-upstream-') === 0 ||
      reason === 'gemini-fetch-failed' ||
      reason === 'gemini-bad-json';
    return {
      ok: true,
      kind: budget ? 'budget' : upstream ? 'upstream' : 'fallback',
      text: canned(lang, budget ? 'budget' : 'noApi'),
      tokens: false,
    };
  }

  return { ok: true, kind: 'answer', text: gemini.text, tokens: true };
}

module.exports = {
  MAX_USER_TURNS: MAX_USER_TURNS,
  MAX_MESSAGE_CHARS: MAX_MESSAGE_CHARS,
  canned: canned,
  reply: reply,
};
