/**
 * Configuração do painel de leads (copie e ajuste em produção).
 * ZIRA_ADMIN_CODE: string — ex.: 'seu-pin-secreto' (vazio = abre sem gate; use só em dev)
 * ZIRA_ADMIN_API_TOKEN: string — token usado em chamadas /api/wa/* (deve bater com o env Vercel ZIRA_ADMIN_API_TOKEN)
 * ZIRA_LEADS.webhookUrl: opcional — só URLs HTTPS públicas válidas (validadas em leads.js)
 */
(function (w) {
  'use strict';
  w.ZIRA_ADMIN_CODE = '';
  w.ZIRA_ADMIN_API_TOKEN = '';
  // w.ZIRA_LEADS = { webhookUrl: 'https://hooks.zapier.com/hooks/catch/.../' };
})(typeof window !== 'undefined' ? window : this);
