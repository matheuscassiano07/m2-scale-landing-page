'use strict';

const lib = require('../_lib/evolution.js');
const rl = require('../_lib/rateLimit.js');

const FIELD_LIMIT = { name: 120, email: 254, phone: 32, company: 160, segment: 64, revenue: 48, lang: 8 };

const SEGMENT_LABEL = {
  'engenharia': 'Engenharia',
  'arquitetura': 'Arquitetura',
  'design': 'Design',
  'engenharia-arquitetura': 'Engenharia / Arquitetura',
};
const REVENUE_LABEL = {
  'ate-50k': 'Até R$ 50 mil/mês',
  '50k-100k': 'R$ 50 mil – R$ 100 mil/mês',
  '100k-250k': 'R$ 100 mil – R$ 250 mil/mês',
  '250k-500k': 'R$ 250 mil – R$ 500 mil/mês',
  '500k-1m': 'R$ 500 mil – R$ 1 milhão/mês',
  '1m-3m': 'R$ 1 milhão – R$ 3 milhões/mês',
  'acima-3m': 'Acima de R$ 3 milhões/mês',
  'prefiro-nao-informar': 'Prefiro não informar',
};
function labelSegment(v) { return SEGMENT_LABEL[v] || (v ? v : ''); }
function labelRevenue(v) { return REVENUE_LABEL[v] || (v ? v : ''); }

function scrub(s) {
  return String(s == null ? '' : s).replace(
    /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g,
    ''
  );
}
function cap(s, max) {
  s = scrub(s).trim();
  return s.length > max ? s.slice(0, max) : s;
}

function buildMessage(lead) {
  const lang = lead.lang === 'en' ? 'en' : 'pt';
  if (lang === 'en') {
    return [
      '*ZIRA AI - New lead*',
      '',
      'Name: ' + (lead.name || '-'),
      'Phone: ' + (lead.phone || '-'),
      'Email: ' + (lead.email || '-'),
      lead.company ? 'Company: ' + lead.company : null,
      lead.segment ? 'Segment: ' + labelSegment(lead.segment) : null,
      lead.revenue ? 'Revenue: ' + labelRevenue(lead.revenue) : null,
      '',
      'Source: zira-landing',
      'Received: ' + new Date().toISOString(),
    ].filter(Boolean).join('\n');
  }
  return [
    '*ZIRA AI - Novo lead*',
    '',
    'Nome: ' + (lead.name || '-'),
    'Telefone: ' + (lead.phone || '-'),
    'E-mail: ' + (lead.email || '-'),
    lead.company ? 'Empresa: ' + lead.company : null,
    lead.segment ? 'Segmento: ' + labelSegment(lead.segment) : null,
    lead.revenue ? 'Faturamento: ' + labelRevenue(lead.revenue) : null,
    '',
    'Origem: landing zira-ai',
    'Recebido em: ' + new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
  ].filter(Boolean).join('\n');
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method-not-allowed' });
    return;
  }
  if (!lib.sameOrigin(req)) {
    res.status(403).json({ ok: false, error: 'origin' });
    return;
  }

  const limitIp = rl.check(req, 'wa-notify-ip', 8, 60 * 1000);
  if (!limitIp.ok) {
    res.status(429).json({ ok: false, error: 'rate-limited' });
    return;
  }
  const limitGlobal = rl.check({ headers: { 'x-forwarded-for': 'global' } }, 'wa-notify-all', 240, 60 * 1000);
  if (!limitGlobal.ok) {
    res.status(429).json({ ok: false, error: 'rate-limited-global' });
    return;
  }

  const body = await lib.readJsonBody(req);
  if (!body || typeof body !== 'object') {
    res.status(400).json({ ok: false, error: 'bad-payload' });
    return;
  }

  const lead = {
    name: cap(body.name || '', FIELD_LIMIT.name),
    email: cap(body.email || '', FIELD_LIMIT.email),
    phone: cap(body.phone || '', FIELD_LIMIT.phone),
    company: cap(body.company || '', FIELD_LIMIT.company),
    segment: cap(body.segment || '', FIELD_LIMIT.segment),
    revenue: cap(body.revenue || '', FIELD_LIMIT.revenue),
    lang: cap(body.lang || '', FIELD_LIMIT.lang),
  };
  if (!lead.name || lead.phone.length < 3) {
    res.status(400).json({ ok: false, error: 'validation' });
    return;
  }

  const cfg = lib.getConfig();
  if (!lib.configIsReady(cfg)) {
    res.status(200).json({ ok: true, dispatched: false, reason: 'not-configured' });
    return;
  }

  let target = lib.normalizeNumber(process.env.WA_NOTIFY_NUMBER, process.env.WA_DEFAULT_DDI || '55');
  if (!target) {
    try {
      const r = await lib.evoFetch('/instance/connectionState/' + encodeURIComponent(cfg.instance), {});
      const owner =
        r.data &&
        ((r.data.instance && (r.data.instance.owner || r.data.instance.number)) ||
          r.data.owner ||
          '');
      target = lib.normalizeNumber(String(owner || '').split('@')[0], process.env.WA_DEFAULT_DDI || '55');
    } catch (e) {}
  }
  if (!target) {
    res.status(200).json({ ok: true, dispatched: false, reason: 'no-target' });
    return;
  }

  try {
    const text = buildMessage(lead);
    const send = await lib.evoFetch('/message/sendText/' + encodeURIComponent(cfg.instance), {
      method: 'POST',
      body: JSON.stringify({
        number: target,
        text: text,
        delay: 600,
      }),
    });
    if (!send.ok) {
      res.status(200).json({ ok: true, dispatched: false, reason: 'send-failed', status: send.status });
      return;
    }
    res.status(200).json({ ok: true, dispatched: true });
  } catch (e) {
    res.status(200).json({ ok: true, dispatched: false, reason: 'exception' });
  }
};
