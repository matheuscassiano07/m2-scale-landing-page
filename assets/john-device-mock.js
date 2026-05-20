(function (global) {
  'use strict';

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
        html: 'Sugiro após <strong>15h</strong>. Confirmo a disponibilidade e te retorno.',
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
        c: 'E a vistoria da parte hidráulica?',
        html: 'Agendada para <strong>15/06 às 9h</strong>. Posso enviar o responsável no convite.',
      },
      {
        c: 'Preciso avisar o condomínio antes.',
        html: 'Posso gerar um texto curto de aviso para você encaminhar ao síndico.',
      },
    ]),
    scene('orcamento', [
      {
        c: 'Quanto fica o projeto completo?',
        html:
          'Vou <strong>confirmar com a equipe</strong>. Assim que fecharem, te retorno o valor certo.',
      },
      {
        c: 'Preciso de uma estimativa ainda esta semana.',
        html:
          'Entendi. Já encaminhei para a equipe. Te aviso aqui quando tiverem o valor <strong>confirmado</strong>.',
      },
      {
        c: 'Posso aguardar até sexta?',
        html:
          'Perfeito. Até <strong>sexta</strong> você recebe a resposta com o valor fechado pela equipe.',
      },
    ]),
  ];

  var TYPING_VISIBLE_MS = 720;
  var PAUSE_AFTER_CLIENT_MS = 520;
  var PAUSE_AFTER_JOHN_MS = 680;
  var PAUSE_AFTER_LAST_JOHN_MS = 6000;
  var PAUSE_AFTER_TYPING_MS = 280;
  var LOOP_PAUSE_MS = 400;
  var FALLBACK_START_MS = 1600;
  var STOP_DEBOUNCE_MS = 500;

  var running = false;
  var timers = [];
  var observer = null;
  var revealObserver = null;
  var revealHost = null;
  var observeTarget = null;
  var scenarioIndex = 0;
  var stopDebounceId = 0;

  function prefersReducedMotion() {
    try {
      return global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  function visibleHeightRatio(rect, vh) {
    if (!vh || !rect || rect.height <= 0) return 0;
    var visibleH = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
    if (visibleH <= 0) return 0;
    return visibleH / rect.height;
  }

  function isMockInViewRect(rect, vh) {
    if (!vh || !rect || rect.height <= 0) return false;
    if (visibleHeightRatio(rect, vh) >= 0.12) return true;
    if (rect.top < vh * 0.92 && rect.bottom > vh * 0.08) return true;
    return false;
  }

  function isInViewport(el) {
    if (!el || !el.isConnected) return false;
    var rect = el.getBoundingClientRect();
    var vh = global.innerHeight || global.document.documentElement.clientHeight || 0;
    if (!vh || rect.height < 8) return false;
    return isMockInViewRect(rect, vh);
  }

  function isRevealDone() {
    if (!revealHost) return true;
    return revealHost.getAttribute('data-revealed') === 'true';
  }

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) {
      global.clearTimeout(timers[i]);
    }
    timers = [];
  }

  function later(fn, ms) {
    var id = global.setTimeout(fn, ms);
    timers.push(id);
    return id;
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

  function useInstantScroll() {
    try {
      return global.matchMedia('(max-width: 1024px), (pointer: coarse)').matches;
    } catch (e) {
      return (global.innerWidth || 1200) <= 1024;
    }
  }

  /** Safari/mobile: opacity-only hide falha; hidden + display:none no CSS mobile */
  function useMobileStepHide() {
    try {
      return global.matchMedia('(max-width: 768px)').matches;
    } catch (e) {
      return (global.innerWidth || 1200) <= 768;
    }
  }

  function scrollMessages(root) {
    var list = getFeed(root) || root.querySelector('.john-chat__messages');
    if (!list) return;
    var top = list.scrollHeight;
    var behavior = useInstantScroll() ? 'auto' : 'smooth';
    try {
      if (typeof list.scrollTo === 'function') {
        list.scrollTo({ top: top, behavior: behavior });
      } else {
        list.scrollTop = top;
      }
    } catch (e) {
      list.scrollTop = top;
    }
  }

  function buildTimeline(lines) {
    var steps = [];
    var i;
    for (i = 0; i < lines.length; i++) {
      var L = lines[i];
      if (L.type === 'typing') {
        steps.push({ kind: 'typing' });
      } else if (L.type === 'client') {
        steps.push({ kind: 'bubble', role: 'client', text: L.text });
      } else if (L.type === 'john') {
        steps.push({
          kind: 'bubble',
          role: 'john',
          text: L.text || '',
          html: L.html || '',
        });
      }
    }
    return steps;
  }

  function renderScenarioDom(root, scenario) {
    var feed = getFeed(root);
    if (!feed) return [];

    feed.innerHTML = '<span class="john-chat__day">Hoje</span>';
    var steps = buildTimeline(scenario.lines);
    var nodes = [];
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
        if (useMobileStepHide()) {
          el.hidden = true;
        }
        if (st.html) {
          el.innerHTML = st.html;
        } else {
          el.textContent = st.text;
        }
      }
      feed.appendChild(el);
      nodes.push({ el: el, def: st });
    }

    root.classList.add('is-anim-ready');
    return nodes;
  }

  function showTyping(el, root) {
    el.hidden = false;
    el.classList.add('is-visible');
    scrollMessages(root);
  }

  function hideTyping(el) {
    el.classList.remove('is-visible');
    el.hidden = true;
  }

  function showBubble(el, root) {
    if (useMobileStepHide()) {
      el.hidden = false;
    }
    el.classList.add('is-visible');
    scrollMessages(root);
  }

  function isLastJohnInScenario(nodes, index) {
    var i;
    if (!nodes[index] || nodes[index].def.role !== 'john') return false;
    for (i = index + 1; i < nodes.length; i++) {
      if (nodes[i].def.kind === 'bubble' && nodes[i].def.role === 'client') return false;
    }
    return true;
  }

  function playStepChain(root, nodes, index, onComplete) {
    if (!root.isConnected) {
      onComplete();
      return;
    }
    if (index >= nodes.length) {
      onComplete();
      return;
    }

    var item = nodes[index];
    var el = item.el;
    var def = item.def;

    if (def.kind === 'typing') {
      showTyping(el, root);
      later(function () {
        hideTyping(el);
        later(function () {
          playStepChain(root, nodes, index + 1, onComplete);
        }, PAUSE_AFTER_TYPING_MS);
      }, TYPING_VISIBLE_MS);
      return;
    }

    showBubble(el, root);
    var pause = PAUSE_AFTER_CLIENT_MS;
    if (def.role === 'john') {
      pause = isLastJohnInScenario(nodes, index) ? PAUSE_AFTER_LAST_JOHN_MS : PAUSE_AFTER_JOHN_MS;
    }
    later(function () {
      playStepChain(root, nodes, index + 1, onComplete);
    }, pause);
  }

  function showAllInFeed(root, scenario) {
    var feed = getFeed(root);
    if (!feed) return;
    var nodes = renderScenarioDom(root, scenario);
    var i;
    for (i = 0; i < nodes.length; i++) {
      nodes[i].el.hidden = false;
      nodes[i].el.classList.add('is-visible');
    }
    scrollMessages(root);
  }

  function playScenario(root, index) {
    if (!root || running) return;
    if (!isRevealDone()) return;
    if (!isInViewport(observeTarget || root)) return;

    running = true;
    clearTimers();
    if (stopDebounceId) {
      global.clearTimeout(stopDebounceId);
      stopDebounceId = 0;
    }
    setPlaying(root, true);

    var scenario = SCENARIOS[index % SCENARIOS.length];
    var nodes = renderScenarioDom(root, scenario);
    if (!nodes.length) {
      running = false;
      setPlaying(root, false);
      return;
    }

    playStepChain(root, nodes, 0, function () {
      running = false;
      setPlaying(root, false);
      if (!root.isConnected || !isInViewport(observeTarget || root)) return;
      later(function () {
        if (running) return;
        scenarioIndex = (index + 1) % SCENARIOS.length;
        playScenario(root, scenarioIndex);
      }, LOOP_PAUSE_MS);
    });
  }

  function tryStart(root) {
    if (!root || running || prefersReducedMotion()) return;
    if (!isRevealDone()) return;
    if (!isInViewport(observeTarget || root)) return;
    playScenario(root, scenarioIndex);
  }

  function tryStop(root) {
    if (!root || running) return;
    if (isInViewport(observeTarget || root)) return;
    if (stopDebounceId) global.clearTimeout(stopDebounceId);
    stopDebounceId = global.setTimeout(function () {
      stopDebounceId = 0;
      if (isInViewport(observeTarget || root)) return;
      running = false;
      clearTimers();
      setPlaying(root, false);
    }, STOP_DEBOUNCE_MS);
  }

  function scheduleFallbackStart(root) {
    later(function () {
      if (running || !root || !root.isConnected) return;
      if (prefersReducedMotion()) return;
      if (root.querySelector('[data-step].is-visible')) return;
      if (!isRevealDone()) return;
      tryStart(root);
    }, FALLBACK_START_MS);
  }

  function bindRevealHost(root) {
    revealHost = root.closest('[data-reveal]');
    if (!revealHost) return;

    function onRevealChange() {
      if (isRevealDone()) {
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
    observeTarget =
      root.closest('.problem__visual') ||
      root.closest('.device-shell--john-chat') ||
      root;

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
      { threshold: 0, rootMargin: '0px 0px 18% 0px' }
    );
    observer.observe(observeTarget);
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
    scheduleFallbackStart(root);

    global.addEventListener('pageshow', function () {
      tryStart(root);
    });

    global.requestAnimationFrame(function () {
      global.requestAnimationFrame(function () {
        tryStart(root);
      });
    });
  }

  var testApi = {
    visibleHeightRatio: visibleHeightRatio,
    isMockInView: isMockInViewRect,
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
