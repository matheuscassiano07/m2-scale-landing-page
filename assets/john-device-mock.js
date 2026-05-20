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
  var running = false;
  var timers = [];
  var observer = null;

  function prefersReducedMotion() {
    try {
      return global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) {
      global.clearTimeout(timers[i]);
    }
    timers = [];
  }

  function scrollMessages(root) {
    var list = root.querySelector('.john-chat__messages');
    if (list) list.scrollTop = list.scrollHeight;
  }

  function reset(root) {
    var steps = root.querySelectorAll('[data-step]');
    for (var i = 0; i < steps.length; i++) {
      steps[i].classList.remove('is-visible');
      if (steps[i].classList.contains('john-device-typing')) {
        steps[i].hidden = true;
      }
    }
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
    scrollMessages(root);
  }

  function playSequence(root) {
    if (running || !root) return;
    running = true;
    clearTimers();
    reset(root);

    var i;
    for (i = 0; i < STEPS.length; i++) {
      (function (def) {
        timers.push(
          global.setTimeout(function () {
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
        timers.push(
          global.setTimeout(function () {
            if (!root.isConnected) return;
            playSequence(root);
          }, LOOP_PAUSE_MS)
        );
      }, lastMs + 600)
    );
  }

  function initDeviceMock() {
    var root = document.getElementById('john-device-mock');
    if (!root || root.dataset.mockReady === '1') return;
    root.dataset.mockReady = '1';

    if (prefersReducedMotion()) {
      showAll(root);
      return;
    }

    function start() {
      if (running) return;
      playSequence(root);
    }

    if ('IntersectionObserver' in global) {
      observer = new IntersectionObserver(
        function (entries) {
          for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
              start();
            } else {
              running = false;
              clearTimers();
              reset(root);
            }
          }
        },
        { threshold: 0.35, rootMargin: '0px 0px -8% 0px' }
      );
      observer.observe(root);
    } else {
      start();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDeviceMock);
  } else {
    initDeviceMock();
  }
})(typeof window !== 'undefined' ? window : this);
