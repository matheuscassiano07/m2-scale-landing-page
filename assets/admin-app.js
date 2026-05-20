(function () {
  'use strict';

  var DAY = 864e5;
  var wired = false;
  var currentUser = '';
  var serverLeads = [];
  var serverInquiries = [];
  var admTab = 'leads';

  function setNavDrawerOpen(open) {
    document.body.classList.toggle('adm-nav-open', !!open);
    document.body.style.overflow = open ? 'hidden' : '';
    var fab = document.getElementById('adm-menu-fab');
    var bd = document.getElementById('adm-menu-backdrop');
    if (fab) fab.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (bd) bd.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  function layout() {
    var w = window.matchMedia('(min-width:900px)').matches;
    document.body.classList.toggle('desktop', w);
    document.body.classList.toggle('mobile', !w);
    if (w) {
      document.body.classList.remove('adm-nav-open');
      document.body.style.overflow = '';
      var fab = document.getElementById('adm-menu-fab');
      var bd = document.getElementById('adm-menu-backdrop');
      if (fab) fab.setAttribute('aria-expanded', 'false');
      if (bd) bd.setAttribute('aria-hidden', 'true');
    }
  }

  var navFabWired = false;
  function wireMobileNavFab() {
    if (navFabWired) return;
    var fab = document.getElementById('adm-menu-fab');
    var bd = document.getElementById('adm-menu-backdrop');
    var top = document.getElementById('adm-top');
    if (!fab || !bd) return;
    navFabWired = true;

    fab.addEventListener('click', function () {
      if (document.body.classList.contains('desktop')) return;
      setNavDrawerOpen(!document.body.classList.contains('adm-nav-open'));
    });
    bd.addEventListener('click', function () {
      setNavDrawerOpen(false);
    });
    window.addEventListener(
      'keydown',
      function (e) {
        if (e.key === 'Escape' && document.body.classList.contains('adm-nav-open'))
          setNavDrawerOpen(false);
      },
      true
    );

    if (top) {
      top.addEventListener('click', function (e) {
        if (
          document.body.classList.contains('desktop') ||
          !document.body.classList.contains('adm-nav-open')
        ) {
          return;
        }

        var t = e.target.closest('[data-lang-btn], .adm-link-index');
        if (t) setNavDrawerOpen(false);
      });
    }
  }

  function loc(L) {
    return L === 'en' ? 'en-US' : 'pt-BR';
  }
  function fmt(iso, L) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString(loc(L), {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch (e) {
      return String(iso);
    }
  }

  function filterInqRows(all, needle) {
    needle = needle.trim().toLowerCase();
    if (!needle.length) return all.slice();
    return all.filter(function (r) {
      return (
        [r.userMessage, r.assistantReply, r.kind, r.source, r.lang, r.sessionId, r.createdAt]
          .map(function (k) {
            return String(k || '');
          })
          .join(' ')
          .toLowerCase()
          .indexOf(needle) !== -1
      );
    });
  }

  function filterRows(all, needle) {
    needle = needle.trim().toLowerCase();
    if (!needle.length) return all.slice();
    return all.filter(function (r) {
      return (
        [r.name, r.email, r.phone, r.company, r.segment, r.revenue, r.lang, r.createdAt]
          .map(function (k) {
            return String(k || '');
          })
          .join(' ')
          .toLowerCase()
          .indexOf(needle) !== -1
      );
    });
  }

  function escCSV(v) {
    var s = String(v == null ? '' : v);
    if (/[,"\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';

    return s;
  }

  function lab(L) {
    return L === 'en'
      ? { em: 'Email', tl: 'Phone', co: 'Company', sg: 'Segment', rv: 'Revenue' }
      : { em: 'E-mail', tl: 'Telefone', co: 'Empresa', sg: 'Segmento', rv: 'Faturamento' };
  }

  function mergeLeads(local, remote) {
    var out = [];
    var seen = Object.create(null);
    var all = []
      .concat(Array.isArray(remote) ? remote : [])
      .concat(Array.isArray(local) ? local : []);

    all.forEach(function (r) {
      if (!r || typeof r !== 'object') return;
      var key = String(r.id || '') + '|' + String(r.createdAt || '') + '|' + String(r.email || '') + '|' + String(r.phone || '');
      if (seen[key]) return;
      seen[key] = 1;
      out.push(r);
    });

    out.sort(function (a, b) {
      return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    });
    return out;
  }

  function fetchServerInquiries() {
    return fetch('/api/inquiries/list', {
      method: 'GET',
      credentials: 'same-origin',
      referrerPolicy: 'same-origin',
    })
      .then(function (r) {
        if (r.status === 401) return { ok: false, inquiries: [] };
        return r.json().catch(function () { return { ok: false, inquiries: [] }; });
      })
      .then(function (data) {
        if (data && data.ok && Array.isArray(data.inquiries)) {
          serverInquiries = data.inquiries.slice();
        }
      })
      .catch(function () {});
  }

  function fetchServerLeads() {
    return fetch('/api/leads/list', {
      method: 'GET',
      credentials: 'same-origin',
      referrerPolicy: 'same-origin',
    })
      .then(function (r) {
        if (r.status === 401) return { ok: false, leads: [] };
        return r.json().catch(function () { return { ok: false, leads: [] }; });
      })
      .then(function (data) {
        if (data && data.ok && Array.isArray(data.leads)) {
          serverLeads = data.leads.slice();
        }
      })
      .catch(function () {});
  }

  function renderWeekChart(all, lang) {
    var el = document.getElementById('adm-chart');
    if (!el) return;
    var localeStr = loc(lang);
    var dayStarts = [];
    var i;
    for (i = 6; i >= 0; i--) {
      var d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      dayStarts.push(d.getTime());
    }
    var endMs = dayStarts[6] + DAY;
    var buckets = [0, 0, 0, 0, 0, 0, 0];
    all.forEach(function (r) {
      var t = Date.parse(r.createdAt);
      if (isNaN(t) || t < dayStarts[0] || t >= endMs) return;
      for (var j = 0; j < 7; j++) {
        if (t >= dayStarts[j] && t < dayStarts[j] + DAY) {
          buckets[j]++;
          break;
        }
      }
    });
    var max = Math.max(1, Math.max.apply(null, buckets));
    var W = 720;
    var H = 168;
    var padL = 8;
    var padR = 8;
    var padT = 18;
    var padB = 34;
    var gap = 6;
    var n = 7;
    var innerW = W - padL - padR - gap * (n - 1);
    var bw = innerW / n;
    var sh = H - padT - padB;
    var rects = [];
    for (i = 0; i < n; i++) {
      var c = buckets[i];
      var bh = Math.round((c / max) * sh);
      if (bh < 3 && c > 0) bh = 3;
      var x = padL + i * (bw + gap);
      var y = padT + (sh - bh);
      rects.push(
        '<rect x="' +
          x +
          '" y="' +
          y +
          '" width="' +
          bw +
          '" height="' +
          bh +
          '" rx="6" fill="var(--adm-chart-bar)" stroke="var(--adm-chart-bar-stroke)" stroke-width="1"/>'
      );
      if (c > 0) {
        rects.push(
          '<text x="' +
            (x + bw / 2) +
            '" y="' +
            (y - 6) +
            '" text-anchor="middle" font-size="11" font-weight="650" fill="var(--adm-chart-value)">' +
            c +
            '</text>'
        );
      }
    }
    var labels = [];
    for (i = 0; i < 7; i++) {
      var lab = new Date(dayStarts[i]).toLocaleDateString(localeStr, { day: '2-digit', month: '2-digit' });
      var lx = padL + i * (bw + gap) + bw / 2;
      labels.push(
        '<text x="' +
          lx +
          '" y="' +
          (H - 10) +
          '" text-anchor="middle" font-size="11" font-weight="600" fill="var(--adm-chart-label)">' +
          lab +
          '</text>'
      );
    }
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
      W +
      ' ' +
      H +
      '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
      '<rect x="0" y="0" width="' +
      W +
      '" height="' +
      H +
      '" rx="12" fill="var(--adm-chart-surface)" stroke="var(--adm-chart-surface-stroke)"/>' +
      rects.join('') +
      labels.join('') +
      '</svg>';
    el.innerHTML = svg;
    if (typeof window.ZiraI18n !== 'undefined') {
      el.setAttribute('aria-label', window.ZiraI18n.t('adminPage.chartAria'));
    }
  }

  function kindLabel(kind, lng) {
    var map = {
      answer: 'adminPage.inqKindAnswer',
      'off-topic': 'adminPage.inqKindOffTopic',
      handoff: 'adminPage.inqKindHandoff',
      greet: 'adminPage.inqKindGreet',
      fallback: 'adminPage.inqKindFallback',
    };
    var key = map[kind] || map.answer;
    return window.ZiraI18n.t(key);
  }

  function sourceLabel(source, lng) {
    if (source === 'john-chat-device') return window.ZiraI18n.t('adminPage.inqSourceDevice');
    if (source === 'john-chat-float') return window.ZiraI18n.t('adminPage.inqSourceFloat');
    return window.ZiraI18n.t('adminPage.inqSourceOther');
  }

  function switchAdmTab(tab) {
    admTab = tab === 'inquiries' ? 'inquiries' : 'leads';
    var panelLeads = document.getElementById('panel-leads');
    var panelInq = document.getElementById('panel-inquiries');
    var tabLeads = document.getElementById('tab-leads');
    var tabInq = document.getElementById('tab-inquiries');
    var sub = document.getElementById('adm-page-sub');
    if (panelLeads) panelLeads.hidden = admTab !== 'leads';
    if (panelInq) panelInq.hidden = admTab !== 'inquiries';
    if (tabLeads) tabLeads.setAttribute('aria-selected', admTab === 'leads' ? 'true' : 'false');
    if (tabInq) tabInq.setAttribute('aria-selected', admTab === 'inquiries' ? 'true' : 'false');
    if (sub && typeof window.ZiraI18n !== 'undefined') {
      sub.textContent =
        admTab === 'inquiries'
          ? window.ZiraI18n.t('adminPage.inqPageSubtitle')
          : window.ZiraI18n.t('adminPage.pageSubtitle');
    }
    if (admTab === 'inquiries') renderInquiries();
    else renderLeads();
  }

  function renderLeads() {
    if (typeof window.ZiraI18n === 'undefined') return;
    layout();
    var lng = window.ZiraI18n.getLang();

    var qEl = document.getElementById('q');
    if (!qEl) return;
    var ph = window.ZiraI18n.t('adminPage.searchPlaceholder');
    qEl.setAttribute('placeholder', ph);
    qEl.setAttribute('aria-label', ph);

    if (typeof window.ZiraLeads === 'undefined') {
      document.getElementById('tb').innerHTML = '';
      document.getElementById('cds').textContent = '';
      document.getElementById('she').classList.remove('on');
      document.getElementById('cds').classList.remove('on');
      document.getElementById('vacant').classList.add('on');
      return;
    }

    var localLeads = window.ZiraLeads.getAllLeadsSorted();
    var all = mergeLeads(localLeads, serverLeads);
    var sod = new Date();
    sod.setHours(0, 0, 0, 0);
    var t0 = sod.getTime();
    var t7 = Date.now() - 7 * DAY;
    var cD = 0;
    var cW = 0;
    all.forEach(function (r) {
      var t = Date.parse(r.createdAt);
      if (!isNaN(t)) {
        if (t >= t0) cD++;
        if (t >= t7) cW++;
      }
    });
    document.getElementById('n1').textContent = String(all.length);
    document.getElementById('n2').textContent = String(cD);
    document.getElementById('n3').textContent = String(cW);

    renderWeekChart(all, lng);

    var sub = filterRows(all, qEl.value);
    document.getElementById('vacant').classList.toggle('on', sub.length === 0);
    document.getElementById('she').classList.toggle('on', sub.length > 0);
    document.getElementById('cds').classList.toggle('on', sub.length > 0);

    document.getElementById('tb').innerHTML = '';
    document.getElementById('cds').textContent = '';

    var L = lab(lng);
    sub.forEach(function (r) {
      var lg =
        r.lang === 'en' ? 'EN' : r.lang === 'pt-BR' ? 'PT-BR' : String(r.lang || '');
      var tr = document.createElement('tr');
      [fmt(r.createdAt, lng), r.name || '', r.email || '', r.phone || '', r.company || '', r.segment || '', r.revenue || '', lg].forEach(
        function (txt) {
          var td = document.createElement('td');
          td.textContent = txt;
          tr.appendChild(td);
        }
      );
      document.getElementById('tb').appendChild(tr);

      var card = document.createElement('article');
      card.className = 'card';
      var row = document.createElement('div');
      row.className = 'row';
      var nm = document.createElement('div');
      nm.className = 'nm';
      nm.textContent = r.name || '—';
      var tm = document.createElement('time');
      tm.className = 'tim';
      tm.textContent = fmt(r.createdAt, lng);
      row.appendChild(nm);
      row.appendChild(tm);
      card.appendChild(row);
      var kp = document.createElement('div');
      kp.className = 'kp';
      var chipEl = document.createElement('span');
      chipEl.className = 'chip';
      chipEl.textContent = lg;
      kp.appendChild(chipEl);
      kp.appendChild(document.createElement('br'));
      kp.appendChild(document.createTextNode(L.em + ': ' + (r.email || '')));
      kp.appendChild(document.createElement('br'));
      kp.appendChild(document.createTextNode(L.tl + ': ' + (r.phone || '')));
      if (r.company && String(r.company).trim()) {
        kp.appendChild(document.createElement('br'));
        kp.appendChild(
          document.createTextNode(L.co + ': ' + String(r.company).trim())
        );
      }
      if (r.segment && String(r.segment).trim()) {
        kp.appendChild(document.createElement('br'));
        kp.appendChild(
          document.createTextNode(L.sg + ': ' + String(r.segment).trim())
        );
      }
      if (r.revenue && String(r.revenue).trim()) {
        kp.appendChild(document.createElement('br'));
        kp.appendChild(
          document.createTextNode(L.rv + ': ' + String(r.revenue).trim())
        );
      }
      card.appendChild(kp);
      document.getElementById('cds').appendChild(card);
    });
  }

  function renderInquiries() {
    if (typeof window.ZiraI18n === 'undefined') return;
    layout();
    var lng = window.ZiraI18n.getLang();

    var qEl = document.getElementById('qi');
    if (!qEl) return;
    var ph = window.ZiraI18n.t('adminPage.inqSearchPlaceholder');
    qEl.setAttribute('placeholder', ph);
    qEl.setAttribute('aria-label', ph);

    var all = serverInquiries.slice();
    var sod = new Date();
    sod.setHours(0, 0, 0, 0);
    var t0 = sod.getTime();
    var t7 = Date.now() - 7 * DAY;
    var cD = 0;
    var cW = 0;
    var cApi = 0;
    all.forEach(function (r) {
      var t = Date.parse(r.createdAt);
      if (!isNaN(t)) {
        if (t >= t0) cD++;
        if (t >= t7) cW++;
      }
      if (r.tokens) cApi++;
    });

    var ni1 = document.getElementById('ni1');
    var ni2 = document.getElementById('ni2');
    var ni3 = document.getElementById('ni3');
    var ni4 = document.getElementById('ni4');
    if (ni1) ni1.textContent = String(all.length);
    if (ni2) ni2.textContent = String(cD);
    if (ni3) ni3.textContent = String(cW);
    if (ni4) ni4.textContent = String(cApi);

    var badge = document.getElementById('inq-tab-badge');
    if (badge) {
      if (all.length > 0) {
        badge.textContent = String(all.length);
        badge.hidden = false;
      } else {
        badge.hidden = true;
      }
    }

    var sub = filterInqRows(all, qEl.value);
    var vacant = document.getElementById('inq-vacant');
    var she = document.getElementById('inq-she');
    var cards = document.getElementById('inq-cards');
    var tb = document.getElementById('inq-tb');

    if (vacant) vacant.classList.toggle('on', sub.length === 0);
    if (she) she.classList.toggle('on', sub.length > 0);
    if (cards) cards.classList.toggle('on', sub.length > 0);
    if (tb) tb.innerHTML = '';
    if (cards) cards.innerHTML = '';

    sub.forEach(function (r) {
      var lg =
        r.lang === 'en' ? 'EN' : r.lang === 'pt-BR' ? 'PT-BR' : String(r.lang || '');
      var kind = String(r.kind || 'answer');
      var kindTxt = kindLabel(kind, lng);

      if (tb) {
        var tr = document.createElement('tr');
        var cells = [
          fmt(r.createdAt, lng),
          kindTxt,
          r.userMessage || '',
          r.assistantReply || '',
          sourceLabel(r.source, lng),
          lg,
        ];
        cells.forEach(function (txt, idx) {
          var td = document.createElement('td');
          if (idx === 1) {
            var sp = document.createElement('span');
            sp.className = 'adm-inq-kind';
            sp.setAttribute('data-kind', kind);
            sp.textContent = kindTxt;
            td.appendChild(sp);
          } else if (idx === 2) {
            td.className = 'adm-inq-msg';
            td.textContent = txt;
          } else if (idx === 3) {
            td.className = 'adm-inq-reply';
            td.textContent = txt;
          } else {
            td.textContent = txt;
          }
          tr.appendChild(td);
        });
        tb.appendChild(tr);
      }

      if (cards) {
        var card = document.createElement('article');
        card.className = 'card';
        var row = document.createElement('div');
        row.className = 'row';
        var nm = document.createElement('div');
        nm.className = 'nm';
        nm.textContent = (r.userMessage || '—').slice(0, 72) + ((r.userMessage || '').length > 72 ? '…' : '');
        var tm = document.createElement('time');
        tm.className = 'tim';
        tm.textContent = fmt(r.createdAt, lng);
        row.appendChild(nm);
        row.appendChild(tm);
        card.appendChild(row);

        var meta = document.createElement('div');
        meta.className = 'inq-meta';
        var kindEl = document.createElement('span');
        kindEl.className = 'adm-inq-kind';
        kindEl.setAttribute('data-kind', kind);
        kindEl.textContent = kindTxt;
        meta.appendChild(kindEl);
        var srcEl = document.createElement('span');
        srcEl.className = 'inq-src';
        srcEl.textContent = sourceLabel(r.source, lng);
        meta.appendChild(srcEl);
        if (r.tokens) {
          var tok = document.createElement('span');
          tok.className = 'inq-tokens';
          tok.textContent = window.ZiraI18n.t('adminPage.inqTokensYes');
          meta.appendChild(tok);
        }
        var chipEl = document.createElement('span');
        chipEl.className = 'chip';
        chipEl.textContent = lg;
        meta.appendChild(chipEl);
        card.appendChild(meta);

        var qP = document.createElement('p');
        qP.className = 'inq-q';
        qP.textContent = r.userMessage || '';
        card.appendChild(qP);

        var aP = document.createElement('p');
        aP.className = 'inq-a';
        aP.textContent = r.assistantReply || '';
        card.appendChild(aP);

        cards.appendChild(card);
      }
    });
  }

  function render() {
    if (admTab === 'inquiries') renderInquiries();
    else renderLeads();
  }

  function wire() {
    if (wired) return;
    wired = true;
    document.getElementById('q').addEventListener('input', function () {
      if (admTab === 'leads') renderLeads();
    });
    var qi = document.getElementById('qi');
    if (qi) {
      qi.addEventListener('input', function () {
        if (admTab === 'inquiries') renderInquiries();
      });
    }

    document.querySelectorAll('[data-adm-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchAdmTab(btn.getAttribute('data-adm-tab'));
      });
    });
    window.addEventListener('storage', function (ev) {
      if (ev.key === 'zira-leads-v2') render();
    });
    window.addEventListener('focus', render);

    document.getElementById('btnRef').addEventListener('click', function () {
      Promise.all([fetchServerLeads(), fetchServerInquiries()]).then(render);
    });
    document.getElementById('btnOut').addEventListener('click', function () {
      logout();
    });
    document.getElementById('btnCsv').addEventListener('click', function () {
      var lng = window.ZiraI18n.getLang();
      var rows = filterRows(
        mergeLeads(window.ZiraLeads.getAllLeadsSorted(), serverLeads),
        document.getElementById('q').value
      );
      var head = ['createdAt', 'lang', 'name', 'email', 'phone', 'company', 'segment', 'revenue'];
      var lines = [head.join(',')];
      rows.forEach(function (r) {
        lines.push(
          head
            .map(function (k) {
              return escCSV(r[k]);
            })
            .join(',')
        );
      });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(
        new Blob(['﻿', lines.join('\n')], { type: 'text/csv;charset=utf-8' })
      );
      a.download = 'zira-leads-' + (lng === 'en' ? 'en' : 'pt') + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    });

    var btnCsvInq = document.getElementById('btnCsvInq');
    if (btnCsvInq) {
      btnCsvInq.addEventListener('click', function () {
        var lng = window.ZiraI18n.getLang();
        var qiEl = document.getElementById('qi');
        var rows = filterInqRows(serverInquiries, qiEl ? qiEl.value : '');
        var head = [
          'createdAt',
          'kind',
          'userMessage',
          'assistantReply',
          'source',
          'lang',
          'tokens',
          'sessionId',
        ];
        var lines = [head.join(',')];
        rows.forEach(function (r) {
          lines.push(
            head
              .map(function (k) {
                return escCSV(r[k]);
              })
              .join(',')
          );
        });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(
          new Blob(['﻿', lines.join('\n')], { type: 'text/csv;charset=utf-8' })
        );
        a.download = 'cantevo-john-inquiries-' + (lng === 'en' ? 'en' : 'pt') + '.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      });
    }
  }

  function showDesk() {
    document.getElementById('gate').classList.add('xhide');
    document.getElementById('desk').classList.remove('xhide');
    var who = document.getElementById('adm-user-tag');
    if (who && currentUser) who.textContent = currentUser;
    wire();
    Promise.all([fetchServerLeads(), fetchServerInquiries()]).then(function () {
      switchAdmTab('leads');
    });
    window.dispatchEvent(new CustomEvent('zira:admin-session'));
  }

  function showGate() {
    document.getElementById('gate').classList.remove('xhide');
    document.getElementById('desk').classList.add('xhide');
    buildGate(document.getElementById('gate'));
  }

  function buildGate(box) {
    while (box.firstChild) box.removeChild(box.firstChild);
    box.setAttribute('aria-labelledby', 'adm-gtitle');

    var h = document.createElement('h2');
    h.id = 'adm-gtitle';
    h.setAttribute('data-i18n', 'adminPage.loginTitle');
    box.appendChild(h);

    var hp = document.createElement('p');
    hp.className = 'hint';
    hp.setAttribute('data-i18n', 'adminPage.loginHint');
    box.appendChild(hp);

    var frm = document.createElement('form');
    frm.id = 'adm-g';
    frm.autocomplete = 'on';

    var lblU = document.createElement('label');
    var spU = document.createElement('span');
    spU.className = 'lbl';
    spU.setAttribute('data-i18n', 'adminPage.loginUser');
    var inpU = document.createElement('input');
    inpU.className = 'inp';
    inpU.id = 'adm-u';
    inpU.type = 'text';
    inpU.autocomplete = 'username';
    inpU.required = true;
    inpU.setAttribute('spellcheck', 'false');
    inpU.setAttribute('autocapitalize', 'none');
    lblU.appendChild(spU);
    lblU.appendChild(inpU);
    frm.appendChild(lblU);

    var lblP = document.createElement('label');
    lblP.style.marginTop = '14px';
    var spP = document.createElement('span');
    spP.className = 'lbl';
    spP.setAttribute('data-i18n', 'adminPage.loginPass');
    var inpP = document.createElement('input');
    inpP.className = 'inp';
    inpP.id = 'adm-p';
    inpP.type = 'password';
    inpP.autocomplete = 'current-password';
    inpP.required = true;
    inpP.setAttribute('spellcheck', 'false');
    lblP.appendChild(spP);
    lblP.appendChild(inpP);
    frm.appendChild(lblP);

    var bt = document.createElement('button');
    bt.className = 'gate-go';
    bt.type = 'submit';
    bt.setAttribute('data-i18n', 'adminPage.loginSubmit');
    frm.appendChild(bt);

    var err = document.createElement('p');
    err.id = 'adm-e';
    err.className = 'er';
    err.setAttribute('aria-live', 'assertive');
    frm.appendChild(err);

    box.appendChild(frm);

    window.ZiraI18n.apply(window.ZiraI18n.getLang());
    frm.onsubmit = function (e) {
      e.preventDefault();
      err.textContent = '';
      var u = inpU.value.trim();
      var p = inpP.value;
      if (!u || !p) {
        err.textContent = window.ZiraI18n.t('adminPage.loginRequired');
        return;
      }
      bt.disabled = true;
      bt.setAttribute('aria-busy', 'true');
      var prev = bt.textContent;
      bt.textContent = window.ZiraI18n.t('adminPage.loginSubmitting');
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p }),
        credentials: 'same-origin',
        referrerPolicy: 'same-origin',
      })
        .then(function (r) { return r.json().catch(function () { return null; }).then(function (d) { return { status: r.status, data: d }; }); })
        .then(function (resp) {
          if (resp.status === 200 && resp.data && resp.data.ok) {
            currentUser = (resp.data && resp.data.user) || u;
            showDesk();
            return;
          }
          if (resp.status === 401) {
            err.textContent = window.ZiraI18n.t('adminPage.loginInvalid');
          } else if (resp.status === 503) {
            var missing = resp && resp.data && Array.isArray(resp.data.missing)
              ? resp.data.missing
              : [];
            if (missing.indexOf('SESSION_SECRET') !== -1) {
              err.textContent = window.ZiraI18n.t('adminPage.securityWarn');
            } else {
              err.textContent = window.ZiraI18n.t('adminPage.loginNotConfigured');
            }
          } else if (resp.status === 429) {
            err.textContent = window.ZiraI18n.t('adminPage.loginRate');
          } else {
            err.textContent = window.ZiraI18n.t('adminPage.loginNet');
          }
        })
        .catch(function () {
          err.textContent = window.ZiraI18n.t('adminPage.loginNet');
        })
        .finally(function () {
          bt.disabled = false;
          bt.removeAttribute('aria-busy');
          bt.textContent = prev;
        });
    };
  }

  function logout() {
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
      referrerPolicy: 'same-origin',
    }).finally(function () {
      currentUser = '';
      location.reload();
    });
  }

  function bootstrap() {
    fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'same-origin',
      referrerPolicy: 'same-origin',
    })
      .then(function (r) { return r.json().catch(function () { return null; }); })
      .then(function (data) {
        if (data && data.ok && data.authenticated) {
          currentUser = data.user || '';
          showDesk();
        } else {
          showGate();
        }
      })
      .catch(function () {
        // Sem rede ou /api inacessível — fallback abre o gate
        showGate();
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!window.ZiraI18n || !window.ZiraLeads) return;
    layout();
    wireMobileNavFab();
    window.addEventListener('resize', layout);
    window.addEventListener('zira:lang', render);
    window.ZiraI18n.init();

    bootstrap();
  });

})();
