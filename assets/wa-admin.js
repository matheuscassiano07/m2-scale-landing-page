(function (global) {
  'use strict';

  var POLL_OPEN_MS = 15000;
  var POLL_CONNECTING_MS = 4000;
  var POLL_ERROR_MS = 8000;
  var POLL_UNAUTHORIZED_MS = 30000;

  var els = {};
  var state = { current: 'unknown', timer: null, polling: false, qrShownAt: 0 };

  function fetchOpts(extra) {
    return Object.assign(
      {
        credentials: 'same-origin',
        referrerPolicy: 'same-origin',
      },
      extra || {}
    );
  }

  function fmtNumber(raw) {
    var d = String(raw || '').replace(/\D+/g, '');
    if (!d) return '';
    if (d.length === 13) return '+' + d.slice(0, 2) + ' (' + d.slice(2, 4) + ') ' + d.slice(4, 9) + '-' + d.slice(9);
    if (d.length === 12) return '+' + d.slice(0, 2) + ' (' + d.slice(2, 4) + ') ' + d.slice(4, 8) + '-' + d.slice(8);
    return '+' + d;
  }

  function lng() {
    try {
      return global.ZiraI18n ? global.ZiraI18n.getLang() : 'pt-BR';
    } catch (e) {
      return 'pt-BR';
    }
  }

  function tx(pt, en) {
    return lng() === 'en' ? en : pt;
  }

  function tAdmin(key, fallbackPt, fallbackEn) {
    try {
      if (global.ZiraI18n && typeof global.ZiraI18n.t === 'function') {
        var s = global.ZiraI18n.t(key);
        if (s && s !== key) return s;
      }
    } catch (e1) {}
    return lng() === 'en' ? fallbackEn : fallbackPt;
  }

  function setBadge(label, tone) {
    if (!els.badge) return;
    els.badge.textContent = label;
    els.badge.dataset.tone = tone || 'neutral';
  }

  function setPairVisible(visible, digits) {
    if (!els.pairWrap || !els.pairCode) return;
    digits = String(digits || '').replace(/\D/g, '');
    if (visible && digits.length) {
      els.pairWrap.classList.add('is-visible');
      els.pairWrap.setAttribute('aria-hidden', 'false');
      els.pairCode.textContent = digits.replace(/(.{4})/g, '$1 ').trim();
      els.copyBtn.disabled = false;
    } else {
      els.pairWrap.classList.remove('is-visible');
      els.pairWrap.setAttribute('aria-hidden', 'true');
      els.pairCode.textContent = '';
      els.copyBtn.disabled = true;
    }
  }

  function showQr(base64, pairing) {
    if (!els.qrImg || !els.qrBox) return;
    var src = base64 || '';
    if (src && src.indexOf('data:') !== 0) src = 'data:image/png;base64,' + src;
    if (src) {
      els.qrImg.src = src;
      els.qrImg.style.display = 'block';
      els.qrEmpty.style.display = 'none';
      state.qrShownAt = Date.now();
    } else {
      els.qrImg.removeAttribute('src');
      els.qrImg.style.display = 'none';
      els.qrEmpty.style.display = 'flex';
    }
    var pairDigits =
      String(pairing || '')
        .replace(/\D/g, '')
        .trim() ||
      (typeof pairing === 'string' && /^\s*\d/.test(pairing) ? String(pairing).replace(/\D/g, '') : '');
    if (els.card && !els.card.classList.contains('wa-card--connected')) {
      setPairVisible(!!pairDigits, pairDigits);
    } else {
      setPairVisible(false, '');
    }
  }

  function showUnauthorizedUi() {
    setBadge(tx('não autorizado', 'unauthorized'), 'bad');
    if (els.card) els.card.classList.remove('wa-card--connected');
    els.numText.style.display = 'none';
    showQr('', '');
    setPairVisible(false, '');
    if (els.qrEmpty) {
      els.qrEmpty.textContent = tx(
        'Faça login no painel para carregar o QR.',
        'Sign in to dashboard to load the QR.'
      );
    }
    els.hint.textContent = tx(
      'Faça login no painel para ver o status do WhatsApp.',
      'Sign in to the dashboard to see WhatsApp status.'
    );
    els.btnRefresh.disabled = true;
  }

  function applyState(data) {
    var s = (data && data.state) || 'unknown';
    state.current = s;

    if (s === 'open') {
      if (els.card) els.card.classList.add('wa-card--connected');
      setBadge(tAdmin('adminPage.waBadgeConnected', 'conectado', 'connected'), 'good');
      els.numText.textContent = data.number ? fmtNumber(String(data.number).split('@')[0]) : '';
      els.numText.style.display = data.number ? 'block' : 'none';
      els.hint.textContent = tAdmin(
        'adminPage.waHintOpen',
        'WhatsApp ligado via Evolution API. Novos leads disparam notificação para este número.',
        'WhatsApp connected via Evolution API. New leads trigger a notification to this number.'
      );
      showQr('', '');
      setPairVisible(false, '');
      els.btnRefresh.disabled = true;
    } else {
      if (els.card) els.card.classList.remove('wa-card--connected');
      if (s === 'connecting' || s === 'qr' || s === 'close') {
        setBadge(tAdmin('adminPage.waBadgeAwait', 'aguardando ligação', 'awaiting link'), 'warn');
        els.numText.style.display = 'none';
        els.hint.textContent = tAdmin(
          'adminPage.waHintQr',
          'Use o código de 8 dígitos no WhatsApp (Aparelhos conectados → Ligar com número) ou escaneie o QR.',
          'Use the 8-digit code in WhatsApp (Linked devices → Link with phone number) or scan the QR.'
        );
        if (data.qrcode) showQr(data.qrcode, data.pairingCode);
        else showQr('', data.pairingCode);
        els.btnRefresh.disabled = false;
      } else if (s === 'not-configured') {
        setBadge(tx('não configurado', 'not configured'), 'muted');
        els.numText.style.display = 'none';
        els.hint.textContent = tx(
          'Defina EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE e ZIRA_ADMIN_API_TOKEN nas variáveis de ambiente da Vercel.',
          'Set EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE and ZIRA_ADMIN_API_TOKEN as Vercel env vars.'
        );
        showQr('', '');
        setPairVisible(false, '');
        els.btnRefresh.disabled = true;
      } else if (s === 'absent') {
        setBadge(tx('instância ausente', 'instance missing'), 'warn');
        els.numText.style.display = 'none';
        els.hint.textContent = tx(
          'Clique em Atualizar QR para criar a instância e gerar o código / QR.',
          'Click Refresh QR to create the instance and generate the code / QR.'
        );
        showQr('', '');
        setPairVisible(false, '');
        els.btnRefresh.disabled = false;
      } else {
        setBadge(tx('desconhecido', 'unknown'), 'muted');
        els.numText.style.display = 'none';
        showQr('', '');
        setPairVisible(false, '');
        els.btnRefresh.disabled = false;
      }
    }
  }

  function fetchStatus() {
    return fetch('/api/wa/status', fetchOpts({ method: 'GET' }))
      .then(function (r) {
        if (r.status === 401) return { ok: false, error: 'unauthorized', state: 'auth' };
        return r.json().catch(function () {
          return { ok: false };
        });
      })
      .catch(function () {
        return { ok: false };
      });
  }

  function fetchQr() {
    setBadge(tx('gerando QR…', 'generating QR…'), 'warn');
    fetch('/api/wa/qrcode', fetchOpts({ method: 'GET' }))
      .then(function (r) {
        if (r.status === 401) return { ok: false, error: 'unauthorized' };
        return r.json().catch(function () {
          return null;
        });
      })
      .then(function (data) {
        if (!data || data.ok === false) {
          setBadge(tx('erro', 'error'), 'bad');
          var reason = data && data.error ? data.error : 'rede';
          var detail = data && data.message ? String(data.message) : '';
          els.hint.textContent = tx(
            'Falha ao buscar QR (' + reason + ')' + (detail ? ': ' + detail : '.'),
            'Failed to fetch QR (' + reason + ')' + (detail ? ': ' + detail : '.')
          );
          schedule(POLL_ERROR_MS);
          return;
        }
        applyState(data);
        schedule(data.state === 'open' ? POLL_OPEN_MS : POLL_CONNECTING_MS);
      })
      .catch(function () {
        setBadge(tx('erro', 'error'), 'bad');
        schedule(POLL_ERROR_MS);
      });
  }

  function tick() {
    fetchStatus().then(function (data) {
      if (data && data.error === 'unauthorized') {
        showUnauthorizedUi();
        schedule(POLL_UNAUTHORIZED_MS);
        return;
      }
      if (!data || data.ok === false) {
        setBadge(tx('sem resposta', 'no response'), 'bad');
        schedule(POLL_ERROR_MS);
        return;
      }
      if (data.state === 'open') {
        applyState(data);
        schedule(POLL_OPEN_MS);
        return;
      }
      fetchQr();
    });
  }

  function schedule(ms) {
    if (state.timer) clearTimeout(state.timer);
    state.timer = setTimeout(tick, ms);
  }

  function copyPairing() {
    var raw = els.pairCode ? els.pairCode.textContent.replace(/\s+/g, '') : '';
    if (!raw) return;
    function done() {
      els.copyBtn.textContent = tAdmin('adminPage.waCopied', 'Copiado', 'Copied');
      setTimeout(function () {
        els.copyBtn.textContent = tAdmin('adminPage.waCopy', 'Copiar código', 'Copy code');
      }, 2200);
    }
    if (global.navigator.clipboard && global.navigator.clipboard.writeText) {
      global.navigator.clipboard.writeText(raw).then(done).catch(fallback);
    } else {
      fallback();
    }
    function fallback() {
      try {
        var ta = global.document.createElement('textarea');
        ta.value = raw;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        global.document.body.appendChild(ta);
        ta.select();
        global.document.execCommand('copy');
        global.document.body.removeChild(ta);
        done();
      } catch (e2) {}
    }
  }

  function build(host) {
    while (host.firstChild) host.removeChild(host.firstChild);

    var card = document.createElement('section');
    card.className = 'wa-card';
    card.setAttribute('aria-labelledby', 'wa-evolution-title');

    var head = document.createElement('div');
    head.className = 'wa-head';
    var h = document.createElement('h2');
    h.className = 'wa-title';
    h.id = 'wa-evolution-title';
    h.textContent = tAdmin('adminPage.waEvoTitle', 'Evolution API · WhatsApp', 'Evolution API · WhatsApp');
    var badge = document.createElement('span');
    badge.className = 'wa-badge';
    badge.textContent = '—';
    head.appendChild(h);
    head.appendChild(badge);
    card.appendChild(head);

    var body = document.createElement('div');
    body.className = 'wa-body';

    var leftCol = document.createElement('div');
    leftCol.className = 'wa-left';

    var qrWr = document.createElement('div');
    qrWr.className = 'wa-qr-wrap';
    var qrBox = document.createElement('div');
    qrBox.className = 'wa-qr';
    var qrImg = document.createElement('img');
    qrImg.alt = tx('QR Code para conectar o WhatsApp', 'QR Code to link WhatsApp');
    qrImg.style.display = 'none';
    var qrEmpty = document.createElement('div');
    qrEmpty.className = 'wa-qr-empty';
    qrEmpty.textContent = tx('Carregando QR…', 'Loading QR…');
    qrBox.appendChild(qrImg);
    qrBox.appendChild(qrEmpty);
    var qrCap = document.createElement('p');
    qrCap.className = 'wa-qr-caption';
    qrCap.textContent = tAdmin('adminPage.waQrCaption', 'Ou escaneie o QR', 'Or scan the QR');
    qrWr.appendChild(qrBox);
    qrWr.appendChild(qrCap);
    leftCol.appendChild(qrWr);

    var info = document.createElement('div');
    info.className = 'wa-info';

    var connected = document.createElement('div');
    connected.className = 'wa-connected';
    connected.setAttribute('role', 'status');
    connected.setAttribute('aria-live', 'polite');
    connected.setAttribute('aria-atomic', 'true');
    var crow = document.createElement('div');
    crow.className = 'wa-connected__row';
    var cicon = document.createElement('div');
    cicon.className = 'wa-connected__icon';
    cicon.setAttribute('aria-hidden', 'true');
    cicon.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var ctext = document.createElement('div');
    var ctitle = document.createElement('p');
    ctitle.className = 'wa-connected__title';
    ctitle.textContent = tAdmin('adminPage.waConnectedTitle', 'WhatsApp conectado', 'WhatsApp connected');
    var csub = document.createElement('p');
    csub.className = 'wa-connected__sub';
    csub.textContent = tAdmin(
      'adminPage.waConnectedSub',
      'O código de pareamento fica oculto enquanto a sessão estiver ativa.',
      'The pairing code stays hidden while the session is active.'
    );
    ctext.appendChild(ctitle);
    ctext.appendChild(csub);
    crow.appendChild(cicon);
    crow.appendChild(ctext);
    connected.appendChild(crow);

    var numText = document.createElement('p');
    numText.className = 'wa-num';
    numText.style.display = 'none';
    connected.appendChild(numText);

    var hint = document.createElement('p');
    hint.className = 'wa-hint';
    hint.textContent = tx('Carregando estado da conexão…', 'Loading connection status…');

    var pairWrap = document.createElement('div');
    pairWrap.className = 'wa-pair-wrap';
    pairWrap.setAttribute('aria-hidden', 'true');
    var pairLabel = document.createElement('p');
    pairLabel.className = 'wa-pair-label';
    pairLabel.textContent = tAdmin('adminPage.waPairingTitle', 'Código Evolution (8 dígitos)', 'Evolution pairing code (8 digits)');
    var pairCode = document.createElement('p');
    pairCode.className = 'wa-pair-code';
    pairCode.setAttribute('lang', 'en');
    var copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'wa-copy';
    copyBtn.textContent = tAdmin('adminPage.waCopy', 'Copiar código', 'Copy code');
    copyBtn.disabled = true;
    copyBtn.addEventListener('click', copyPairing);
    pairWrap.appendChild(pairLabel);
    pairWrap.appendChild(pairCode);
    pairWrap.appendChild(copyBtn);

    var actions = document.createElement('div');
    actions.className = 'wa-actions';
    var btnRefresh = document.createElement('button');
    btnRefresh.type = 'button';
    btnRefresh.className = 'wa-btn';
    btnRefresh.textContent = tx('Atualizar QR', 'Refresh QR');
    btnRefresh.addEventListener('click', function () {
      btnRefresh.disabled = true;
      fetchQr();
    });
    actions.appendChild(btnRefresh);

    info.appendChild(connected);
    info.appendChild(hint);
    info.appendChild(pairWrap);
    info.appendChild(actions);

    body.appendChild(leftCol);
    body.appendChild(info);
    card.appendChild(body);

    host.appendChild(card);

    els.card = card;
    els.badge = badge;
    els.qrImg = qrImg;
    els.qrEmpty = qrEmpty;
    els.qrBox = qrBox;
    els.numText = numText;
    els.hint = hint;
    els.pairWrap = pairWrap;
    els.pairCode = pairCode;
    els.copyBtn = copyBtn;
    els.btnRefresh = btnRefresh;
  }

  function start() {
    var host = document.getElementById('wa-panel');
    if (!host) return;
    build(host);
    tick();
    global.document.addEventListener('visibilitychange', function () {
      if (global.document.visibilityState === 'visible') {
        if (state.timer) clearTimeout(state.timer);
        tick();
      }
    });
    global.addEventListener('zira:lang', function () {
      build(host);
      tick();
    });
  }

  global.addEventListener('zira:admin-session', function () {
    global.setTimeout(function () {
      var host = global.document.getElementById('wa-panel');
      if (!host || !host.firstChild) return;
      if (state.timer) {
        clearTimeout(state.timer);
        state.timer = null;
      }
      tick();
    }, 0);
  });

  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})(typeof window !== 'undefined' ? window : this);
