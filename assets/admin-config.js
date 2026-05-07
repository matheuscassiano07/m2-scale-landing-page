/**
 * Configuração do painel · só client-side. Toda autenticação é feita pelo
 * backend (`/api/auth/login`) usando ADMIN_USERNAME, ADMIN_PASSWORD e
 * SESSION_SECRET configurados no Vercel.
 *
 * ZIRA_LEADS.webhookUrl: opcional — só URLs HTTPS públicas válidas
 * (validadas em leads.js).
 */
(function (w) {
  'use strict';
  // w.ZIRA_LEADS = { webhookUrl: 'https://hooks.zapier.com/hooks/catch/.../' };
})(typeof window !== 'undefined' ? window : this);
