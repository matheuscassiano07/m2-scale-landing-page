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

  function setBadge(label, tone) {
    if (!els.badge) return;
    els.badge.textContent = label;
    els.badge.dataset.tone = tone || 'neutral';
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
    if (els.pair) {
      if (pairing) {
        els.pair.style.display = 'block';
        els.pair.textContent = (lng() === 'en' ? 'Pairing code: ' : 'Código de pareamento: ') + pairing;
      } else {
        els.pair.style.display = 'none';
        els.pair.textContent = '';
      }
    }
  }

  function showUnauthorizedUi() {
    setBadge(tx('não autorizado', 'unauthorized'), 'bad');
    els.numText.style.display = 'none';
    showQr('', '');
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

  function lng() {
    try { return global.ZiraI18n ? global.ZiraI18n.getLang() : 'pt-BR'; } catch (e) { return 'pt-BR'; }
  }

  function tx(pt, en) { return lng() === 'en' ? en : pt; }

  function applyState(data) {
    var s = (data && data.state) || 'unknown';
    state.current = s;
    if (s === 'open') {
      setBadge(tx('conectado', 'connected'), 'good');
      els.numText.textContent = data.number ? fmtNumber(String(data.number).split('@')[0]) : '';
      els.numText.style.display = data.number ? 'block' : 'none';
      els.hint.textContent = tx(
        'WhatsApp ligado. Cada lead novo dispara mensagem automática para este número.',
        'WhatsApp connected. Every new lead triggers an automatic message to this number.'
      );
      showQr('', '');
      els.btnRefresh.disabled = true;
    } else if (s === 'connecting' || s === 'qr') {
      setBadge(tx('aguardando QR', 'awaiting QR'), 'warn');
      els.numText.style.display = 'none';
      els.hint.textContent = tx(
        'Abra o WhatsApp · Aparelhos conectados · Conectar aparelho e escaneie o QR.',
        'Open WhatsApp · Linked devices · Link a device and scan the QR.'
      );
      if (data.qrcode) showQr(data.qrcode, data.pairingCode);
      els.btnRefresh.disabled = false;
    } else if (s === 'not-configured') {
      setBadge(tx('não configurado', 'not configured'), 'muted');
      els.numText.style.display = 'none';
      els.hint.textContent = tx(
        'Defina EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE e ZIRA_ADMIN_API_TOKEN nas variáveis de ambiente da Vercel.',
        'Set EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE and ZIRA_ADMIN_API_TOKEN as Vercel env vars.'
      );
      showQr('', '');
      els.btnRefresh.disabled = true;
    } else if (s === 'absent') {
      setBadge(tx('instância ausente', 'instance missing'), 'warn');
      els.numText.style.display = 'none';
      els.hint.textContent = tx(
        'Clique em Atualizar QR para criar a instância e gerar o QR Code.',
        'Click Refresh QR to create the instance and generate the QR.'
      );
      showQr('', '');
      els.btnRefresh.disabled = false;
    } else {
      setBadge(tx('desconhecido', 'unknown'), 'muted');
      els.numText.style.display = 'none';
      showQr('', '');
      els.btnRefresh.disabled = false;
    }
  }

  function fetchStatus() {
    return fetch('/api/wa/status', fetchOpts({ method: 'GET' }))
      .then(function (r) {
        if (r.status === 401) return { ok: false, error: 'unauthorized', state: 'auth' };
        return r.json().catch(function () { return { ok: false }; });
      })
      .catch(function () { return { ok: false }; });
  }

  function fetchQr() {
    setBadge(tx('gerando QR…', 'generating QR…'), 'warn');
    fetch('/api/wa/qrcode', fetchOpts({ method: 'GET' }))
      .then(function (r) {
        if (r.status === 401) return { ok: false, error: 'unauthorized' };
        return r.json().catch(function () { return null; });
      })
      .then(function (data) {
        if (!data || data.ok === false) {
          setBadge(tx('erro', 'error'), 'bad');
          var reason = data && data.error ? data.error : 'rede';
          var detail = data && data.message ? String(data.message) : '';
          els.hint.textContent = tx(
            'Falha ao buscar QR (' + reason + ')' + (detail ? ': ' + detail : '.') ,
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

  function build(host) {
    while (host.firstChild) host.removeChild(host.firstChild);

    var card = document.createElement('section');
    card.className = 'wa-card';

    var head = document.createElement('div');
    head.className = 'wa-head';
    var h = document.createElement('h2');
    h.className = 'wa-title';
    h.textContent = tx('Conexão WhatsApp', 'WhatsApp connection');
    var badge = document.createElement('span');
    badge.className = 'wa-badge';
    badge.textContent = '—';
    head.appendChild(h);
    head.appendChild(badge);
    card.appendChild(head);

    var body = document.createElement('div');
    body.className = 'wa-body';

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

    var info = document.createElement('div');
    info.className = 'wa-info';
    var numText = document.createElement('p');
    numText.className = 'wa-num';
    numText.style.display = 'none';
    var hint = document.createElement('p');
    hint.className = 'wa-hint';
    hint.textContent = tx('Carregando estado da conexão…', 'Loading connection status…');
    var pair = document.createElement('p');
    pair.className = 'wa-pair';
    pair.style.display = 'none';

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

    info.appendChild(numText);
    info.appendChild(hint);
    info.appendChild(pair);
    info.appendChild(actions);

    body.appendChild(qrBox);
    body.appendChild(info);
    card.appendChild(body);

    host.appendChild(card);

    els.badge = badge;
    els.qrImg = qrImg;
    els.qrEmpty = qrEmpty;
    els.qrBox = qrBox;
    els.numText = numText;
    els.hint = hint;
    els.pair = pair;
    els.btnRefresh = btnRefresh;
  }

  function start() {
    var host = document.getElementById('wa-panel');
    if (!host) return;
    build(host);
    tick();
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') {
        if (state.timer) clearTimeout(state.timer);
        tick();
      }
    });
    global.addEventListener('zira:lang', function () {
      build(host);
      tick();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})(typeof window !== 'undefined' ? window : this);
