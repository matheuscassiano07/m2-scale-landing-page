(function () {
  'use strict';

  var SK = 'zira-adm-s8';
  var DAY = 864e5;
  var wired = false;

  function gateCode() {
    return typeof window.ZIRA_ADMIN_CODE === 'string' ? window.ZIRA_ADMIN_CODE : '';
  }
  function authed() {
    try {
      var o = JSON.parse(sessionStorage.getItem(SK));
      return !!(o && o.ok && Date.now() - o.ts < DAY);
    } catch (e) {
      return false;
    }
  }
  function setAuth(v) {
    if (!v) sessionStorage.removeItem(SK);
    else sessionStorage.setItem(SK, JSON.stringify({ ok: true, ts: Date.now() }));
  }

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
    if (!iso) return '\u2014';
    try {
      return new Date(iso).toLocaleString(loc(L), {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch (e) {
      return String(iso);
    }
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
      ? { em: 'Email', tl: 'Phone', co: 'Company' }
      : { em: 'E-mail', tl: 'Telefone', co: 'Empresa' };
  }

  function render() {
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

    var all = window.ZiraLeads.getAllLeadsSorted();
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
      nm.textContent = r.name || '\u2014';
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
          document.createTextNode('Segmento: ' + String(r.segment).trim())
        );
      }
      if (r.revenue && String(r.revenue).trim()) {
        kp.appendChild(document.createElement('br'));
        kp.appendChild(
          document.createTextNode('Faturamento: ' + String(r.revenue).trim())
        );
      }
      card.appendChild(kp);
      document.getElementById('cds').appendChild(card);
    });
  }

  function wire() {
    if (wired) return;
    wired = true;
    document.getElementById('q').addEventListener('input', render);
    window.addEventListener('storage', function (ev) {
      if (ev.key === 'zira-leads-v2') render();
    });
    window.addEventListener('focus', render);

    document.getElementById('btnRef').addEventListener('click', render);
    document.getElementById('btnOut').addEventListener('click', function () {
      setAuth(false);
      location.reload();
    });
    document.getElementById('btnCsv').addEventListener('click', function () {
      var lng = window.ZiraI18n.getLang();
      var rows = filterRows(
        window.ZiraLeads.getAllLeadsSorted(),
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
        new Blob(['\ufeff', lines.join('\n')], { type: 'text/csv;charset=utf-8' })
      );
      a.download = 'zira-leads-' + (lng === 'en' ? 'en' : 'pt') + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    });
  }

  function showDesk() {
    document.getElementById('gate').classList.add('xhide');
    document.getElementById('desk').classList.remove('xhide');
    wire();
    render();
  }

  function buildGate(box) {
    while (box.firstChild) box.removeChild(box.firstChild);
    box.setAttribute('aria-labelledby', 'adm-gtitle');

    var h = document.createElement('h2');
    h.id = 'adm-gtitle';
    h.setAttribute('data-i18n', 'adminPage.gateTitle');
    box.appendChild(h);

    var hp = document.createElement('p');
    hp.className = 'hint';
    hp.setAttribute('data-i18n', 'adminPage.gateHint');
    box.appendChild(hp);

    var frm = document.createElement('form');
    frm.id = 'adm-g';
    var lbl = document.createElement('label');
    var sp = document.createElement('span');
    sp.className = 'lbl';
    sp.setAttribute('data-i18n', 'adminPage.gateInputLabel');
    var inp = document.createElement('input');
    inp.className = 'inp';
    inp.id = 'adm-k';
    inp.type = 'password';
    inp.autocomplete = 'current-password';
    inp.setAttribute('spellcheck', 'false');
    lbl.appendChild(sp);
    lbl.appendChild(inp);
    frm.appendChild(lbl);

    var bt = document.createElement('button');
    bt.className = 'gate-go';
    bt.type = 'submit';
    bt.setAttribute('data-i18n', 'adminPage.gateSubmit');
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
      if (inp.value !== gateCode()) {
        err.textContent = window.ZiraI18n.t('adminPage.gateError');
        return;
      }
      setAuth(true);
      showDesk();
    };
  }




  document.addEventListener('DOMContentLoaded', function () {
    if (!window.ZiraI18n || !window.ZiraLeads) return;
    layout();
    wireMobileNavFab();
    window.addEventListener('resize', layout);
    window.addEventListener('zira:lang', render);
    window.ZiraI18n.init();

    var bw = document.getElementById('bwarn');
    if (!gateCode()) {
      bw.classList.add('on');
      bw.textContent = window.ZiraI18n.t('adminPage.securityWarn');
      showDesk();
      return;
    }

    if (!authed()) {
      document.getElementById('gate').classList.remove('xhide');
      document.getElementById('desk').classList.add('xhide');
      buildGate(document.getElementById('gate'));
      return;
    }

    showDesk();
  });

})();
