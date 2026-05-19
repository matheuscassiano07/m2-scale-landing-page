/**
 * Cantevo / John AI · armazenamento local de leads (landing) + webhook opcional
 * window.ZIRA_LEADS = { webhookUrl: 'https://...' } em admin-config.js
 *
 * Mitigações: sanitização leve, webhook só HTTPS válido, fetch sem credenciais,
 * payload limitado, localStorage revalidado na leitura.
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'zira-leads-v2';
  var MAX_FIELD = { name: 120, email: 254, phone: 32, company: 160, segment: 64, revenue: 48 };
  var MAX_ROWS = 8000;

  function scrub(s) {
    return String(s == null ? '' : s).replace(
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
      ''
    );
  }

  function cap(s, max) {
    s = scrub(s).trim();
    return s.length > max ? s.slice(0, max) : s;
  }

  function normalizeLang(lang) {
    var l = String(lang || '').trim();
    if (l === 'en' || l === 'pt-BR') return l;
    return '';
  }

  function isAllowedWebhookUrl(urlStr, baseHref) {
    if (!urlStr || typeof urlStr !== 'string') return false;
    var s = urlStr.trim();
    if (s.length > 4096 || /\s/.test(s)) return false;
    try {
      var base =
        typeof baseHref === 'string' && /^https:\/\/.+/i.test(baseHref)
          ? baseHref
          : 'https://invalid.local/';
      var u = new URL(s, base);
      if (u.protocol !== 'https:') return false;
      var h = (u.hostname || '').toLowerCase();
      if (
        !h ||
        h === 'localhost' ||
        h === '[::1]' ||
        h.endsWith('.local') ||
        h.endsWith('.invalid')
      ) {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  function sanitizeLead(row) {
    if (!row || typeof row !== 'object') return null;
    return {
      id: cap(row.id || '', 64),
      createdAt:
        typeof row.createdAt === 'string'
          ? cap(row.createdAt, 48)
          : new Date().toISOString(),
      lang: normalizeLang(row.lang),
      source: cap(row.source || 'zira-landing-schedule', 64),
      name: cap(row.name || '', MAX_FIELD.name),
      email: cap(row.email || '', MAX_FIELD.email),
      phone: cap(row.phone || '', MAX_FIELD.phone),
      company: cap(row.company || '', MAX_FIELD.company),
      segment: cap(row.segment || '', MAX_FIELD.segment),
      revenue: cap(row.revenue || '', MAX_FIELD.revenue),
    };
  }

  function uuid() {
    if (global.crypto && typeof global.crypto.randomUUID === 'function') {
      return global.crypto.randomUUID();
    }
    return (
      'id-' + String(Date.now()) + '-' + String(Math.random()).slice(2, 10)
    );
  }

  function readAll() {
    try {
      var raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      if (raw.length > 25 * 1024 * 1024) {
        global.localStorage.removeItem(STORAGE_KEY);
        return [];
      }

      var arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];

      var out = [];
      var i;

      for (i = 0; i < arr.length && i < MAX_ROWS * 4; i++) {
        var sanitized = sanitizeLead(arr[i]);
        if (sanitized && (sanitized.name || sanitized.email)) {
          out.push(sanitized);
        }
      }

      if (out.length > MAX_ROWS) {
        out.length = MAX_ROWS;
      }

      return out;
    } catch (e) {
      try {
        global.localStorage.removeItem(STORAGE_KEY);
      } catch (e2) {}
      return [];
    }
  }

  function writeAll(arr) {
    global.localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  function sendWebhook(payload) {
    var cfg = global.ZIRA_LEADS || {};
    if (!cfg.webhookUrl || typeof cfg.webhookUrl !== 'string') {
      return Promise.resolve(true);
    }

    var loc =
      typeof global.location !== 'undefined' && global.location.href
        ? global.location.href
        : '';

    if (!isAllowedWebhookUrl(cfg.webhookUrl, loc || 'https://invalid.local/')) {
      return Promise.resolve(false);
    }

    return global
      .fetch(cfg.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'cors',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        keepalive: true,
      })
      .then(function () {
        return true;
      })
      .catch(function () {
        return false;
      });
  }

  function sendGlobalLead(payload) {
    if (!global.fetch) return Promise.resolve(false);
    return global
      .fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'omit',
        referrerPolicy: 'same-origin',
        keepalive: true,
      })
      .then(function (r) {
        if (!r || !r.ok) return false;
        return r
          .json()
          .then(function (data) { return !!(data && data.ok); })
          .catch(function () { return false; });
      })
      .catch(function () {
        return false;
      });
  }

  global.ZiraLeads = {
    getAllLeadsSorted: function () {
      var list = readAll();
      list.sort(function (a, b) {
        return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
      });
      return list;
    },

    submitLead: function (fields, lang) {
      var payload = sanitizeLead({
        id: uuid(),
        createdAt: new Date().toISOString(),
        lang: normalizeLang(lang),
        source: 'zira-landing-schedule',
        name: fields && fields.name,
        email: fields && fields.email,
        phone: fields && fields.phone,
        company: fields && fields.company,
        segment: fields && fields.segment,
        revenue: fields && fields.revenue,
      });

      if (!payload || payload.name.length < 1 || payload.phone.length < 3) {
        return Promise.resolve({ ok: false, code: 'VALIDATION' });
      }

      var body = JSON.stringify(payload);
      if (body.length > 64 * 1024) {
        return Promise.resolve({ ok: false, code: 'PAYLOAD_TOO_LARGE' });
      }

      try {
        var rows = readAll();
        rows.unshift(payload);
        if (rows.length > MAX_ROWS) {
          rows.length = MAX_ROWS;
        }
        writeAll(rows);
      } catch (e) {
        return Promise.resolve({ ok: false, code: 'STORAGE' });
      }

      try {
        global.dispatchEvent && global.dispatchEvent(
          new (global.CustomEvent || function () {})('zira:lead-created', { detail: payload })
        );
      } catch (e) {}

      var tasks = [sendGlobalLead(payload), sendWebhook(payload), sendWaNotify(payload)];
      return Promise.all(tasks).then(function (results) {
        if (!results[0]) {
          return { ok: false, code: 'SERVER_STORE' };
        }
        return { ok: true, lead: payload };
      });
    },
  };

  function sendWaNotify(payload) {
    if (!global.fetch) return Promise.resolve(false);
    var body = {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      company: payload.company,
      segment: payload.segment,
      revenue: payload.revenue,
      lang: payload.lang,
    };
    return global
      .fetch('/api/wa/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'omit',
        referrerPolicy: 'same-origin',
        keepalive: true,
      })
      .then(function () { return true; })
      .catch(function () { return false; });
  }

})(typeof window !== 'undefined' ? window : this);
