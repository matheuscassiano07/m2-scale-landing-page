(function (global) {
  'use strict';

  var STEPS = [
    { sel: '[data-step="c1"]', type: 'bubble', ms: 0 },
    { sel: '[data-step="t1"]', type: 'typing', ms: 700 },
    { sel: '[data-step="j1"]', type: 'bubble', ms: 1500 },
    { sel: '[data-step="c2"]', type: 'bubble', ms: 3200 },
    { sel: '[data-step="t2"]', type: 'typing', ms: 3900 },
    { sel: '[data-step="j2"]', type: 'bubble', ms: 4700 },
    { sel: '[data-step="c3"]', type: 'bubble', ms: 6400 },
    { sel: '[data-step="t3"]', type: 'typing', ms: 7100 },
    { sel: '[data-step="j3"]', type: 'bubble', ms: 7900 },
  ];

  var LOOP_PAUSE_MS = 4500;
  var FALLBACK_START_MS = 2200;
  var running = false;
  var timers = [];
  var observer = null;
  var revealHost = null;
  var revealObserver = null;

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

  /**
   * Fração da altura do elemento visível no viewport (0–1).
   * @param {DOMRect} rect
   * @param {number} vh
   */
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
    /* Cabeçalho do telefone visível (secção problem no topo) */
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

  function scrollMessages(root) {
    var list = root.querySelector('.john-chat__messages');
    if (!list) return;
    try {
      list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
    } catch (e) {
      list.scrollTop = list.scrollHeight;
    }
  }

  function reset(root) {
    var steps = root.querySelectorAll('[data-step]');
    for (var i = 0; i < steps.length; i++) {
      steps[i].classList.remove('is-visible');
      if (steps[i].classList.contains('john-device-typing')) {
        steps[i].hidden = true;
      }
    }
    setPlaying(root, false);
    scrollMessages(root);
  }

  function showAll(root) {
    var steps = root.querySelectorAll('[data-step]');
    for (var i = 0; i < steps.length; i++) {
      steps[i].classList.add('is-visible');
      if (steps[i].classList.contains('john-device-typing')) {
        steps[i].hidden = false;
      }
    }
    setPlaying(root, false);
    scrollMessages(root);
  }

  function hasVisibleBubble(root) {
    return !!root.querySelector('[data-step].is-visible');
  }

  function playSequence(root) {
    if (running || !root) return;
    running = true;
    clearTimers();
    reset(root);
    setPlaying(root, true);

    var i;
    for (i = 0; i < STEPS.length; i++) {
      (function (def) {
        timers.push(
          global.setTimeout(function () {
            if (!root.isConnected) return;
            var el = root.querySelector(def.sel);
            if (!el) return;
            if (def.type === 'typing') {
              el.hidden = false;
            }
            el.classList.add('is-visible');
            scrollMessages(root);

            if (def.type === 'typing') {
              timers.push(
                global.setTimeout(function () {
                  el.classList.remove('is-visible');
                  el.hidden = true;
                }, 650)
              );
            }
          }, def.ms)
        );
      })(STEPS[i]);
    }

    var lastMs = STEPS[STEPS.length - 1].ms;
    timers.push(
      global.setTimeout(function () {
        running = false;
        setPlaying(root, false);
        timers.push(
          global.setTimeout(function () {
            if (!root.isConnected || !isMockInView(root)) return;
            playSequence(root);
          }, LOOP_PAUSE_MS)
        );
      }, lastMs + 600)
    );
  }

  function tryStart(root) {
    if (!root || running || prefersReducedMotion()) return;
    if (revealHost && revealHost.getAttribute('data-revealed') !== 'true') return;
    if (!isMockInView(root)) return;
    playSequence(root);
  }

  function tryStop(root) {
    if (!root) return;
    if (isMockInView(root)) return;
    running = false;
    clearTimers();
    reset(root);
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

    if (prefersReducedMotion()) {
      showAll(root);
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

  /* Testes Node (scripts/validate-device-mock.cjs) */
  var testApi = {
    visibleHeightRatio: visibleHeightRatio,
    isMockInView: function (rect, vh, mobile) {
      var ratio = visibleHeightRatio(rect, vh);
      var minRatio = mobile ? 0.05 : 0.16;
      if (ratio >= minRatio) return true;
      if (rect.top < vh * 0.92 && rect.bottom > vh * 0.08) return true;
      return false;
    },
    STEPS: STEPS,
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
