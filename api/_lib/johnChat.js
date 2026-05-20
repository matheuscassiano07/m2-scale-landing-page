'use strict';

const guard = require('./johnGuard.js');

const MAX_USER_TURNS = 2;
const MAX_MESSAGE_CHARS = 280;
const MIN_GEMINI_CHARS = 10;
const MAX_OUTPUT_TOKENS = 120;
const GEMINI_TIMEOUT_MS = 12000;

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
  /\b(plataforma|software|sistema|gest[aã]o|operac[aã]o)\b/i,
  /\b(whatsapp|atendimento|lead[s]?|cliente[s]?|projeto[s]?|prazo[s]?|equipe|tarefa)\b/i,
  /\b(pre[cç]o|valor|plano[s]?|demo|demonstra[cç][aã]o|agendar|contato)\b/i,
  /\b(funciona|como\s+[eé]|o\s+que\s+[eé]|quanto\s+custa)\b/i,
  /\b(compatibiliz|briefing|rfi|entrega|acompanhamento|prioridade)\b/i,
  /\b(organiz|informa[cç][aã]o\s+espalhada|retrabalho|inbox)\b/i,
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
  if (/^(oi|ol[aá]|bom\s+dia|boa\s+tarde|hey|hello)\b/i.test(t)) return true;
  if (t.length <= 24 && /\?/.test(t)) return true;
  return false;
}

function systemInstruction(lang) {
  const pt =
    'Você é o John AI, assistente comercial da Cantevo (plataforma para escritórios de arquitetura e engenharia). ' +
    'REGRAS OBRIGATÓRIAS: (1) Responda APENAS sobre Cantevo, John AI, demonstração, planos comerciais em alto nível, ' +
    'organização de atendimento/obra/equipe/prazos no contexto do produto. (2) Recuse educadamente qualquer outro assunto em 1 frase. ' +
    '(3) Máximo 2 frases curtas; sem listas longas; sem inventar preços, datas de obra ou nomes de pessoas. ' +
    '(4) Não simule acesso a CRM/obra real. (5) Se pedirem proposta ou contato humano, diga para preencher o formulário "Entrar em contato" na página.';
  const en =
    'You are John AI, Cantevo’s assistant (platform for architecture & engineering studios). ' +
    'RULES: (1) Only Cantevo/John AI, demo, high-level pricing, studio operations the product solves. ' +
    '(2) Politely refuse anything else in one sentence. (3) Max 2 short sentences; no long lists; never invent prices or project data. ' +
    '(4) No fake CRM access. (5) For proposals/human contact, point to the "Get in touch" form on the page.';
  return lang === 'en' ? en : pt;
}

function canned(lang, key) {
  const pt = {
    offTopic:
      'Só posso ajudar com assuntos da Cantevo e do John AI (plataforma, demonstração e operação em escritórios de arquitetura e engenharia). Para outros temas, use o formulário **Entrar em contato** mais abaixo.',
    handoff:
      'Para seguir com um especialista, deixe seus dados no formulário **Entrar em contato** — nossa equipe retorna em até 8 horas.',
    greet:
      'Olá! Conte sua dúvida sobre a Cantevo ou o John AI: como organizamos atendimento, obras e prazos no escritório.',
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
  const model = env('GEMINI_MODEL', 'gemini-2.0-flash');
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
    systemInstruction: { parts: [{ text: systemInstruction(lang) }] },
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
    return { ok: false, reason: 'gemini-http-' + res.status };
  }

  const data = await res.json();
  const parts = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
  const text = parts && parts[0] && parts[0].text ? String(parts[0].text).trim() : '';
  if (!text) return { ok: false, reason: 'empty' };
  return { ok: true, text: clampText(text, 520) };
}

async function reply(payload) {
  const lang = payload.lang === 'en' ? 'en' : 'pt';
  const message = clampText(payload.message, MAX_MESSAGE_CHARS);
  const turn = Math.max(0, Math.min(MAX_USER_TURNS, parseInt(String(payload.turn || 0), 10) || 0));
  const req = payload.req;
  const sessionId = clampText(payload.sessionId, 64);

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
    const budget =
      gemini.reason &&
      String(gemini.reason).indexOf('rate') === 0;
    return {
      ok: true,
      kind: budget ? 'budget' : 'fallback',
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
