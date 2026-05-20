(function (global) {
  'use strict';

  var STORAGE_KEY = 'cantevo-john-chat-v1';
  var SESSION_KEY = 'cantevo-john-session';
  var MAX_TURNS = 2;
  var controllers = [];
  var sharedState = null;

  function t(key) {
    if (typeof global.ZiraI18n !== 'undefined') return global.ZiraI18n.t(key);
    return key;
  }

  function lang() {
    if (typeof global.ZiraI18n !== 'undefined') return global.ZiraI18n.getLang();
    return 'pt';
  }

  function sessionId() {
    try {
      var id = sessionStorage.getItem(SESSION_KEY);
      if (id) return id;
      id =
        'sess_' +
        Date.now().toString(36) +
        '_' +
        Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem(SESSION_KEY, id);
      return id;
    } catch (e) {
      return '';
    }
  }

  function chatSource(root) {
    if (!root || !root.id) return 'john-chat';
    if (root.id === 'john-chat-float') return 'john-chat-float';
    if (root.id === 'john-chat') return 'john-chat-device';
    return 'john-chat';
  }

  function loadState() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function saveState() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sharedState));
    } catch (e) {}
  }

  function defaultState() {
    return {
      userTurns: 0,
      closed: false,
      messages: [
        {
          role: 'assistant',
          text: t('johnChat.welcome'),
          static: true,
        },
      ],
    };
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatText(s) {
    var safe = escapeHtml(s);
    safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return safe;
  }

  function historyForApi(messages) {
    var out = [];
    for (var i = 0; i < messages.length; i++) {
      var m = messages[i];
      if (!m || !m.text || m.static) continue;
      out.push({
        role: m.role === 'user' ? 'user' : 'assistant',
        text: m.text,
      });
    }
    return out.slice(-4);
  }

  function broadcastRender(opts) {
    for (var i = 0; i < controllers.length; i++) {
      controllers[i].render(opts);
    }
  }

  function setClosedAll(closed) {
    sharedState.closed = closed;
    for (var i = 0; i < controllers.length; i++) {
      var c = controllers[i];
      c.inputEl.disabled = closed;
      if (c.sendBtn) c.sendBtn.disabled = closed;
      if (closed) {
        c.inputEl.setAttribute('aria-disabled', 'true');
        c.root.classList.add('john-chat--closed');
      } else {
        c.inputEl.removeAttribute('aria-disabled');
        c.root.classList.remove('john-chat--closed');
      }
    }
    saveState();
  }

  function closeJohnPanel() {
    var panel = document.getElementById('john-chat-panel');
    var fab = document.getElementById('john-fab');
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    document.body.classList.remove('john-chat-panel-open');
    if (fab) fab.setAttribute('aria-expanded', 'false');
  }

  function openJohnPanel() {
    var panel = document.getElementById('john-chat-panel');
    var fab = document.getElementById('john-fab');
    if (!panel) return;
    panel.hidden = false;
    document.body.classList.add('john-chat-panel-open');
    if (fab) fab.setAttribute('aria-expanded', 'true');

    if (shouldAnimateFabWelcome()) {
      playFloatWelcome();
    } else {
      broadcastRender();
      focusFloatInput();
    }
  }

  function goToForm() {
    closeJohnPanel();
    var target = document.getElementById('cta');
    if (target && target.scrollIntoView) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    var nameInput = document.getElementById('reg-name');
    if (nameInput) {
      window.setTimeout(function () {
        try {
          nameInput.focus({ preventScroll: true });
        } catch (e) {
          nameInput.focus();
        }
      }, 450);
    }
  }

  function pushMessage(role, text, extra, renderOpts) {
    sharedState.messages.push({
      role: role,
      text: text,
      static: extra && extra.static,
    });
    saveState();
    var opts = renderOpts || null;
    if (!opts && role === 'assistant' && !prefersReducedMotion()) {
      opts = { incomingJohn: true };
    }
    broadcastRender(opts);
  }

  function prefersReducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  function controllerByRootId(id) {
    for (var i = 0; i < controllers.length; i++) {
      if (controllers[i].root && controllers[i].root.id === id) return controllers[i];
    }
    return null;
  }

  function shouldAnimateFabWelcome() {
    if (prefersReducedMotion()) return false;
    if (!sharedState || sharedState.userTurns > 0) return false;
    if (!sharedState.messages || sharedState.messages.length !== 1) return false;
    return sharedState.messages[0].role === 'assistant';
  }

  function bubbleHtml(m, opts) {
    opts = opts || {};
    var isUser = m.role === 'user';
    var cls = isUser ? 'john-bubble john-bubble--user' : 'john-bubble john-bubble--john';
    if (!isUser && opts.incoming) cls += ' john-bubble--incoming';
    return '<p class="' + cls + '">' + formatText(m.text) + '</p>';
  }

  function dayHtml() {
    return (
      '<span class="john-chat__day">' + escapeHtml(t('johnChat.today')) + '</span>'
    );
  }

  function playFloatWelcome() {
    var floatCtrl = controllerByRootId('john-chat-float');
    if (!floatCtrl) return;

    var welcome = sharedState.messages[0];
    if (!welcome) {
      floatCtrl.render();
      focusFloatInput();
      return;
    }

    floatCtrl.listEl.innerHTML = dayHtml();
    if (floatCtrl.typingEl) {
      floatCtrl.typingEl.classList.add('john-chat__typing--fab-intro');
      floatCtrl.typingEl.hidden = false;
    }
    floatCtrl.listEl.scrollTop = floatCtrl.listEl.scrollHeight;

    window.setTimeout(function () {
      if (floatCtrl.typingEl) {
        floatCtrl.typingEl.hidden = true;
        floatCtrl.typingEl.classList.remove('john-chat__typing--fab-intro');
      }
      floatCtrl.listEl.innerHTML = dayHtml() + bubbleHtml(welcome, { incoming: true });
      floatCtrl.listEl.scrollTop = floatCtrl.listEl.scrollHeight;
      focusFloatInput();
    }, prefersReducedMotion() ? 0 : 780);
  }

  function focusFloatInput() {
    var floatRoot = document.getElementById('john-chat-float');
    if (!floatRoot) return;
    var input = floatRoot.querySelector('.john-chat__input');
    if (!input || input.disabled) return;
    window.setTimeout(function () {
      try {
        input.focus({ preventScroll: true });
      } catch (e) {
        input.focus();
      }
    }, prefersReducedMotion() ? 80 : 520);
  }

  function handleSubmit() {
    if (sharedState.closed) return;

    var activeCtrl = null;
    for (var i = 0; i < controllers.length; i++) {
      if (document.activeElement === controllers[i].inputEl) {
        activeCtrl = controllers[i];
        break;
      }
    }
    if (!activeCtrl && controllers[0]) activeCtrl = controllers[0];
    if (!activeCtrl) return;
    var activeInput = activeCtrl.inputEl;

    var text = activeInput.value.replace(/\s+/g, ' ').trim();
    if (!text) return;
    if (text.length > 280) text = text.slice(0, 280);

    for (var j = 0; j < controllers.length; j++) {
      controllers[j].inputEl.value = '';
    }

    pushMessage('user', text);
    sharedState.userTurns += 1;
    saveState();

    if (sharedState.userTurns > MAX_TURNS) {
      pushMessage('assistant', t('johnChat.handoff'), { static: true });
      setClosedAll(true);
      goToForm();
      return;
    }

    for (var k = 0; k < controllers.length; k++) {
      if (controllers[k].sendBtn) controllers[k].sendBtn.disabled = true;
      controllers[k].inputEl.disabled = true;
    }

    fetch('/api/john/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'same-origin',
        body: JSON.stringify({
          message: text,
          lang: lang(),
          turn: sharedState.userTurns - 1,
          history: historyForApi(sharedState.messages),
          source: chatSource(activeCtrl.root),
          sessionId: sessionId(),
        }),
    })
      .then(function (res) {
        return res
          .text()
          .then(function (raw) {
            var data = {};
            if (raw) {
              try {
                data = JSON.parse(raw);
              } catch (e) {
                data = {};
              }
            }
            return { res: res, data: data };
          });
      })
      .then(function (pack) {
        var data = pack.data || {};
        var replyText =
          data.text ||
          (pack.res.ok ? t('johnChat.error') : t('johnChat.unavailable'));
        if (!pack.res.ok && (pack.res.status === 503 || pack.res.status === 502 || pack.res.status === 504)) {
          replyText = t('johnChat.unavailable');
        }
        pushMessage('assistant', replyText, { static: !data.tokens });

        if (data.kind === 'handoff' || sharedState.userTurns >= MAX_TURNS) {
          if (data.kind !== 'handoff') {
            pushMessage('assistant', t('johnChat.handoff'), { static: true });
          }
          setClosedAll(true);
          goToForm();
        }
      })
      .catch(function () {
        pushMessage('assistant', t('johnChat.unavailable'), { static: true });
      })
      .finally(function () {
        for (var n = 0; n < controllers.length; n++) {
          if (!sharedState.closed) {
            controllers[n].inputEl.disabled = false;
            if (controllers[n].sendBtn) controllers[n].sendBtn.disabled = false;
          }
        }
      });
  }

  function attachJohnChat(root) {
    if (!root || root.dataset.johnChatReady === '1') return;
    root.dataset.johnChatReady = '1';

    var listEl = root.querySelector('.john-chat__messages');
    var formEl = root.querySelector('.john-chat__form');
    var inputEl = root.querySelector('.john-chat__input');
    var sendBtn = root.querySelector('.john-chat__send');
    var typingEl = root.querySelector('.john-chat__typing');
    var ctaBtn = root.querySelector('.john-chat__cta');

    if (!listEl || !formEl || !inputEl) return;

    var ctrl = {
      root: root,
      listEl: listEl,
      formEl: formEl,
      inputEl: inputEl,
      sendBtn: sendBtn,
      typingEl: typingEl,
      ctaBtn: ctaBtn,
      render: function (opts) {
        opts = opts || {};
        var html = dayHtml();
        for (var i = 0; i < sharedState.messages.length; i++) {
          var incoming =
            opts.incomingJohn &&
            sharedState.messages[i].role === 'assistant' &&
            i === sharedState.messages.length - 1;
          html += bubbleHtml(sharedState.messages[i], { incoming: incoming });
        }
        listEl.innerHTML = html;
        if (typingEl) {
          typingEl.hidden = true;
          typingEl.classList.remove('john-chat__typing--fab-intro');
        }
        listEl.scrollTop = listEl.scrollHeight;
        if (ctaBtn) ctaBtn.hidden = !sharedState.closed;
      },
      showTyping: function () {
        if (typingEl) typingEl.hidden = true;
      },
    };

    if (ctaBtn) {
      ctaBtn.addEventListener('click', function (e) {
        e.preventDefault();
        goToForm();
      });
    }

    formEl.addEventListener('submit', function (e) {
      e.preventDefault();
      handleSubmit();
    });

    inputEl.placeholder = t('johnChat.placeholder');
    inputEl.setAttribute('aria-label', t('johnChat.inputAria'));

    controllers.push(ctrl);
  }

  function initJohnFab() {
    var fab = document.getElementById('john-fab');
    var panel = document.getElementById('john-chat-panel');
    if (!fab || !panel || fab.dataset.johnFabReady === '1') return;
    fab.dataset.johnFabReady = '1';

    fab.addEventListener('click', function () {
      if (panel.hidden) openJohnPanel();
      else closeJohnPanel();
    });

    panel.querySelectorAll('[data-john-chat-close]').forEach(function (el) {
      el.addEventListener('click', function () {
        closeJohnPanel();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) closeJohnPanel();
    });
  }

  function initJohnChat() {
    sharedState = loadState();
    if (!sharedState || !Array.isArray(sharedState.messages)) {
      sharedState = defaultState();
      saveState();
    }

    controllers = [];
    attachJohnChat(document.getElementById('john-chat-float'));

    if (sharedState.closed) setClosedAll(true);
    broadcastRender();
    initJohnFab();

    document.addEventListener('zira:lang', function () {
      if (sharedState.userTurns > 0 || sharedState.closed) return;
      sharedState.messages = [
        {
          role: 'assistant',
          text: t('johnChat.welcome'),
          static: true,
        },
      ];
      saveState();
      broadcastRender();
      for (var i = 0; i < controllers.length; i++) {
        controllers[i].inputEl.placeholder = t('johnChat.placeholder');
      }
    });
  }

  global.CantevoJohnChatInit = initJohnChat;
  global.CantevoJohnChatOpen = openJohnPanel;
})(typeof window !== 'undefined' ? window : this);
