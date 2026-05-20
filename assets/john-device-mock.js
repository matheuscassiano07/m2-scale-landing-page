(function (global) {
  'use strict';

  /**
   * Cenários no mock (vitrine, não interativo).
   * Cada um: 3 perguntas do cliente + digitando + 3 respostas do John; depois troca o cenário.
   */
  function scene(id, pairs) {
    var lines = [];
    var i;
    for (i = 0; i < 3; i++) {
      var p = pairs[i];
      lines.push({ type: 'client', text: p.c });
      lines.push({ type: 'typing' });
      if (p.html) {
        lines.push({ type: 'john', html: p.html });
      } else {
        lines.push({ type: 'john', text: p.j });
      }
    }
    return { id: id, lines: lines };
  }

  var SCENARIOS = [
    scene('status', [
      {
        c: 'Qual o status da obra?',
        html:
          'Seu projeto está em <strong>compatibilização</strong>. Previsão de entrega <strong>12/06</strong>.',
      },
      {
        c: 'Tem algo pendente do meu lado?',
        html: 'Só falta aprovar o memorial até <strong>sexta</strong>. Te aviso por aqui.',
      },
      {
        c: 'Posso ver quem está com essa etapa?',
        html: 'A equipe de projetos está com <strong>Ana</strong>. Quer que eu avise ela?',
      },
    ]),
    scene('prazo', [
      {
        c: 'Estou irritado. Prometeram entrega semana passada!',
        html:
          'Entendo sua frustração. Vou marcar <strong>prioridade alta</strong> com a equipe agora.',
      },
      {
        c: 'Quero uma data real, não só em breve.',
        html: 'A equipe confirma o cronograma em até <strong>8 horas</strong>. Te aviso quando fechar.',
      },
      {
        c: 'Me avisa antes do cliente cobrar de novo?',
        html: 'Sim. Te mando mensagem assim que tiver a data <strong>confirmada</strong>.',
      },
    ]),
    scene('responsavel', [
      {
        c: 'Quem é o responsável técnico da obra?',
        html: 'O responsável é o <strong>Eng. Lucas</strong>. Ele acompanha o canteiro.',
      },
      {
        c: 'Pode pedir para ele me ligar hoje?',
        html: 'Feito. Deixei recado com <strong>urgência</strong> no painel da equipe.',
      },
      {
        c: 'Qual o melhor horário para falar com ele?',
        html: 'Sugiro após <strong>15h</strong>. Posso confirmar a disponibilidade e te retorno.',
      },
    ]),
    scene('briefing', [
      {
        c: 'Não consigo explicar direito o que quero no projeto.',
        html:
          'Sem problema. Faço perguntas curtas e monto um <strong>briefing</strong> claro para você.',
      },
      {
        c: 'Queria estilo minimalista, tons neutros.',
        html: 'Anotei <strong>minimalista</strong> e paleta neutra. Próximo passo: referências visuais.',
      },
      {
        c: 'Tem prazo para eu enviar as referências?',
        html: 'Ideal até <strong>quinta</strong>. Assim a equipe segue sem travar o cronograma.',
      },
    ]),
    scene('cobranca', [
      {
        c: 'Vocês sumiram no WhatsApp. Preciso de retorno!',
        html:
          'Desculpe a demora. Há <strong>2 pendências</strong> internas. Já acionei quem responde.',
      },
      {
        c: 'O cliente final está cobrando a gente.',
        html: 'Entendi. Priorizei seu chat. A equipe assume em instantes com o <strong>status</strong>.',
      },
      {
        c: 'Quanto tempo para ter uma posição?',
        html: 'Previsão de retorno em até <strong>2 horas</strong> com o andamento atualizado.',
      },
    ]),
    scene('obra', [
      {
        c: 'A obra parou? Ninguém apareceu no canteiro hoje.',
        html:
          'Hoje a equipe está no <strong>projeto executivo</strong> no escritório. Obra retoma <strong>quinta</strong>.',
      },
      {
        c: 'E a vistoria do hidráulica?',
        html: 'Agendada para <strong>15/06 às 9h</strong>. Posso enviar o responsável no convite.',
      },
      {
        c: 'Preciso avisar o condomínio antes.',
        html: 'Posso gerar um texto curto de aviso para você encaminhar ao síndico.',
      },
    ]),
    scene('orcamento', [
      {
        c: 'Quanto fica mais ou menos o projeto completo?',
        html:
          'Valores fechados a equipe confirma no <strong>formulário de contato</strong> do site.',
      },
      {
        c: 'Só quero uma ideia de faixa de investimento.',
        html: 'Posso explicar <strong>etapas e escopo</strong> aqui. Proposta formal é com consultor.',
      },
      {
        c: 'Quando consigo falar com alguém da equipe?',
        html: 'Use o formulário <strong>Entrar em contato</strong>. Retorno em até <strong>8 horas</strong>.',
      },
    ]),
  ];

  var TYPING_SHOW_MS = 650;
  var GAP_AFTER_CLIENT_MS = 700;
  var GAP_AFTER_JOHN_MS = 1500;
  var GAP_AFTER_TYPING_MS = 700;
  var LOOP_PAUSE_MS = 5200;
  var FALLBACK_START_MS = 2200;
  var FIRST_BUBBLE_MS = 400;

  var running = false;
  var timers = [];
  var observer = null;
  var revealHost = null;
  var revealObserver = null;
  var scenarioIndex = 0;

  function prefersReducedMotion() {
    try {
      return global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  function isCoarsePointer() {
    try {
      return global.matchMedia('(pointer: coarse)').matches;
    } catch (e) {
      return false;
    }
  }

  function isNarrowViewport() {
    try {
      return global.matchMedia('(max-width: 900px)').matches;
    } catch (e) {
      return (global.innerWidth || 1024) <= 900;
    }
  }

  function useMobileObserve() {
    return isCoarsePointer() || isNarrowViewport();
  }

  function visibleHeightRatio(rect, vh) {
    if (!vh || !rect || rect.height <= 0) return 0;
    var visibleH = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
    if (visibleH <= 0) return 0;
    return visibleH / rect.height;
  }

  function isMockInView(root) {
    if (!root || !root.isConnected) return false;
    var rect = root.getBoundingClientRect();
    var vh = global.innerHeight || global.document.documentElement.clientHeight || 0;
    if (!vh) return true;
    var ratio = visibleHeightRatio(rect, vh);
    var minRatio = useMobileObserve() ? 0.05 : 0.16;
    if (ratio >= minRatio) return true;
    if (rect.top < vh * 0.92 && rect.bottom > vh * 0.08) return true;
    return false;
  }

  function observeOptions() {
    if (useMobileObserve()) {
      return { threshold: [0, 0.02, 0.08, 0.15], rootMargin: '14% 0px -2% 0px' };
    }
    return { threshold: [0, 0.12, 0.28], rootMargin: '0px 0px -4% 0px' };
  }

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) {
      global.clearTimeout(timers[i]);
    }
    timers = [];
  }

  function setPlaying(root, on) {
    if (!root) return;
    root.classList.toggle('is-playing', !!on);
    var shell = root.closest('.device-shell--john-chat');
    if (shell) shell.classList.toggle('is-mock-playing', !!on);
  }

  function getFeed(root) {
    return root.querySelector('[data-mock-feed]');
  }

  function scrollMessages(root) {
    var list = getFeed(root) || root.querySelector('.john-chat__messages');
    if (!list) return;
    try {
      list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
    } catch (e) {
      list.scrollTop = list.scrollHeight;
    }
  }

  function buildTimeline(lines) {
    var steps = [];
    var t = FIRST_BUBBLE_MS;
    var i;
    for (i = 0; i < lines.length; i++) {
      var L = lines[i];
      if (L.type === 'typing') {
        steps.push({ kind: 'typing', ms: t, hideAfter: TYPING_SHOW_MS });
        t += GAP_AFTER_TYPING_MS;
      } else if (L.type === 'client') {
        steps.push({ kind: 'bubble', role: 'client', text: L.text, ms: t });
        t += GAP_AFTER_CLIENT_MS;
      } else if (L.type === 'john') {
        steps.push({
          kind: 'bubble',
          role: 'john',
          text: L.text || '',
          html: L.html || '',
          ms: t,
        });
        t += GAP_AFTER_JOHN_MS;
      }
    }
    return steps;
  }

  function renderScenarioDom(root, scenario) {
    var feed = getFeed(root);
    if (!feed) return [];

    feed.innerHTML = '<span class="john-chat__day">Hoje</span>';
    var nodes = [];
    var steps = buildTimeline(scenario.lines);
    var i;

    for (i = 0; i < steps.length; i++) {
      var st = steps[i];
      var el;
      if (st.kind === 'typing') {
        el = document.createElement('div');
        el.className = 'john-chat__typing john-device-typing';
        el.setAttribute('data-step', String(i));
        el.setAttribute('aria-hidden', 'true');
        el.hidden = true;
        el.innerHTML = '<span></span><span></span><span></span>';
      } else {
        el = document.createElement('p');
        el.className =
          'john-bubble ' + (st.role === 'client' ? 'john-bubble--client' : 'john-bubble--john');
        el.setAttribute('data-step', String(i));
        if (st.html) {
          el.innerHTML = st.html;
        } else {
          el.textContent = st.text;
        }
      }
      feed.appendChild(el);
      nodes.push({ el: el, def: st });
    }

    return nodes;
  }

  function showAllInFeed(root, scenario) {
    var feed = getFeed(root);
    if (!feed) return;
    renderScenarioDom(root, scenario);
    var steps = feed.querySelectorAll('[data-step]');
    for (var i = 0; i < steps.length; i++) {
      steps[i].classList.add('is-visible');
      if (steps[i].classList.contains('john-device-typing')) {
        steps[i].hidden = false;
      }
    }
    scrollMessages(root);
  }

  function playScenario(root, index) {
    if (!root || running) return;
    running = true;
    clearTimers();
    setPlaying(root, true);

    var scenario = SCENARIOS[index % SCENARIOS.length];
    var nodes = renderScenarioDom(root, scenario);
    if (!nodes.length) {
      running = false;
      setPlaying(root, false);
      return;
    }

    var lastMs = FIRST_BUBBLE_MS;
    var j;

    for (j = 0; j < nodes.length; j++) {
      (function (item) {
        timers.push(
          global.setTimeout(function () {
            if (!root.isConnected) return;
            var el = item.el;
            var def = item.def;
            if (def.kind === 'typing') {
              el.hidden = false;
            }
            el.classList.add('is-visible');
            scrollMessages(root);

            if (def.kind === 'typing' && def.hideAfter) {
              timers.push(
                global.setTimeout(function () {
                  el.classList.remove('is-visible');
                  el.hidden = true;
                }, def.hideAfter)
              );
            }
          }, def.ms)
        );
        if (def.ms > lastMs) lastMs = def.ms;
      })(nodes[j]);
    }

    timers.push(
      global.setTimeout(function () {
        running = false;
        setPlaying(root, false);
        timers.push(
          global.setTimeout(function () {
            if (!root.isConnected || !isMockInView(root)) return;
            scenarioIndex = (index + 1) % SCENARIOS.length;
            playScenario(root, scenarioIndex);
          }, LOOP_PAUSE_MS)
        );
      }, lastMs + 900)
    );
  }

  function hasVisibleBubble(root) {
    return !!root.querySelector('[data-step].is-visible');
  }

  function tryStart(root) {
    if (!root || running || prefersReducedMotion()) return;
    if (revealHost && revealHost.getAttribute('data-revealed') !== 'true') return;
    if (!isMockInView(root)) return;
    playScenario(root, scenarioIndex);
  }

  function tryStop(root) {
    if (!root) return;
    if (isMockInView(root)) return;
    running = false;
    clearTimers();
    setPlaying(root, false);
  }

  function scheduleFallbackStart(root) {
    timers.push(
      global.setTimeout(function () {
        if (running || !root || !root.isConnected) return;
        if (prefersReducedMotion()) return;
        if (hasVisibleBubble(root)) return;
        if (revealHost && revealHost.getAttribute('data-revealed') !== 'true') return;
        if (isMockInView(root)) tryStart(root);
      }, FALLBACK_START_MS)
    );
  }

  function bindRevealHost(root) {
    revealHost = root.closest('[data-reveal]');
    if (!revealHost) return;

    function onRevealChange() {
      if (revealHost.getAttribute('data-revealed') === 'true') {
        global.requestAnimationFrame(function () {
          tryStart(root);
        });
      }
    }

    onRevealChange();

    if ('MutationObserver' in global) {
      revealObserver = new MutationObserver(onRevealChange);
      revealObserver.observe(revealHost, {
        attributes: true,
        attributeFilter: ['data-revealed'],
      });
    }
  }

  function bindIntersection(root) {
    if (!('IntersectionObserver' in global)) {
      tryStart(root);
      return;
    }

    observer = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            tryStart(root);
          } else {
            tryStop(root);
          }
        }
      },
      observeOptions()
    );
    observer.observe(root);
  }

  function bindViewportSync(root) {
    var raf = 0;
    function tick() {
      raf = 0;
      if (!root.isConnected) return;
      if (prefersReducedMotion()) return;
      if (running) {
        if (!isMockInView(root)) tryStop(root);
        return;
      }
      if (isMockInView(root)) tryStart(root);
    }
    function onMove() {
      if (raf) return;
      raf = global.requestAnimationFrame(tick);
    }
    global.addEventListener('scroll', onMove, { passive: true });
    global.addEventListener('resize', onMove, { passive: true });
    global.addEventListener('orientationchange', function () {
      global.setTimeout(onMove, 160);
    });
    global.addEventListener('pageshow', onMove);
  }

  function initDeviceMock() {
    var root = document.getElementById('john-device-mock');
    if (!root || root.dataset.mockReady === '1') return;
    root.dataset.mockReady = '1';

    scenarioIndex = Math.floor(Math.random() * SCENARIOS.length);

    if (prefersReducedMotion()) {
      showAllInFeed(root, SCENARIOS[scenarioIndex]);
      return;
    }

    bindRevealHost(root);
    bindIntersection(root);
    bindViewportSync(root);
    scheduleFallbackStart(root);

    global.requestAnimationFrame(function () {
      global.requestAnimationFrame(function () {
        tryStart(root);
      });
    });
  }

  var testApi = {
    visibleHeightRatio: visibleHeightRatio,
    isMockInView: function (rect, vh, mobile) {
      var ratio = visibleHeightRatio(rect, vh);
      var minRatio = mobile ? 0.05 : 0.16;
      if (ratio >= minRatio) return true;
      if (rect.top < vh * 0.92 && rect.bottom > vh * 0.08) return true;
      return false;
    },
    SCENARIOS: SCENARIOS,
    buildTimeline: buildTimeline,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = testApi;
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initDeviceMock);
    } else {
      initDeviceMock();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
