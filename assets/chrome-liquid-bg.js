/**
 * Liquid chrome background — segue cursor / dedo (mousemove + touchmove).
 * Sem ripple nem reação a clique. Opacidade do canvas sobe após o evento
 * `zira:hero-typing-done` (digitação da linha de prova no hero) ou fallback.
 * Perto do topo da página o brilho/blobs atenuam levemente (scroll).
 */
(function () {
  'use strict';

  var canvas = document.getElementById('chrome-liquid-bg');
  if (!canvas || typeof canvas.getContext !== 'function') return;

  var ctx = canvas.getContext('2d');
  var running = true;

  /** 1 = efeito cheio; perto do scroll 0 fica ~0.78 e sobe suavemente ao rolar */
  var scrollAtten = 1;
  var TOP_ATTEN_MIN = 0.78;
  var TOP_ATTEN_RANGE = 1 - TOP_ATTEN_MIN;
  var TOP_ATTEN_SCROLL = 360;

  var dpr = 1;
  var w = window.innerWidth || 960;
  var h = window.innerHeight || 600;
  var mx = 0.5;
  var my = 0.5;
  var smx = mx;
  var smy = my;

  var blobs = [];
  var nBlob = 6;
  var tick = 0;

  function rnd() {
    return Math.random();
  }

  function initBlobs() {
    blobs.length = 0;
    var i;
    for (i = 0; i < nBlob; i++) {
      blobs.push({
        x: rnd() * 0.86 + 0.07,
        y: rnd() * 0.86 + 0.07,
        r: 0.18 + rnd() * 0.32,
        hue: 200 + rnd() * 55,
        phase: rnd() * Math.PI * 2,
      });
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth || 960;
    h = window.innerHeight || 600;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function onMove(e) {
    if (!w || !h) return;
    mx = e.clientX / w;
    my = e.clientY / h;
  }

  function touchClient(e) {
    if (!e.touches || !e.touches.length) return null;
    var t = e.touches[0];
    return { clientX: t.clientX, clientY: t.clientY };
  }

  function onTouchMove(e) {
    var tc = touchClient(e);
    if (!tc || !w || !h) return;
    mx = tc.clientX / w;
    my = tc.clientY / h;
  }

  function onTouchStart(e) {
    var tc = touchClient(e);
    if (!tc || !w || !h) return;
    mx = tc.clientX / w;
    my = tc.clientY / h;
  }

  function loop() {
    if (!running) return;

    var doc = document;
    if (typeof doc.visibilityState !== 'undefined' && doc.visibilityState === 'hidden') {
      requestAnimationFrame(loop);
      return;
    }

    tick++;
    smx += (mx - smx) * 0.045;
    smy += (my - smy) * 0.045;

    var scrollY =
      (typeof window.pageYOffset === 'number' ? window.pageYOffset : 0) ||
      (doc.documentElement && doc.documentElement.scrollTop) ||
      (doc.body && doc.body.scrollTop) ||
      0;
    var targetAtten = TOP_ATTEN_MIN + TOP_ATTEN_RANGE * Math.min(1, scrollY / TOP_ATTEN_SCROLL);
    scrollAtten += (targetAtten - scrollAtten) * 0.06;

    var M = Math.min(w, h);
    var bi;
    var b;
    var phase;
    var idleX;
    var idleY;
    var tx;
    var ty;
    var bx;
    var by;
    var R;
    var grad;

    for (bi = 0; bi < blobs.length; bi++) {
      b = blobs[bi];
      phase = b.phase != null ? b.phase : bi * 1.7;
      idleX = 0.5 + Math.sin(phase + tick * 0.0009 + bi * 0.4) * 0.34;
      idleY = 0.5 + Math.cos(phase * 0.85 + tick * 0.00075 + bi * 0.35) * 0.32;
      tx = idleX * 0.48 + smx * 0.52;
      ty = idleY * 0.48 + smy * 0.52;
      b.x += (tx - b.x) * 0.018;
      b.y += (ty - b.y) * 0.018;
      b.x = Math.min(0.94, Math.max(0.06, b.x));
      b.y = Math.min(0.94, Math.max(0.06, b.y));
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#030406';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = scrollAtten;

    for (bi = 0; bi < blobs.length; bi++) {
      b = blobs[bi];
      bx = b.x * w;
      by = b.y * h;
      R = b.r * M * 0.95;
      grad = ctx.createRadialGradient(bx, by, 0, bx, by, R);
      grad.addColorStop(0, 'hsla(' + (b.hue | 0) + ',35%,78%,0.16)');
      grad.addColorStop(0.38, 'rgba(52,62,74,0.48)');
      grad.addColorStop(0.82, 'rgba(12,16,22,0.15)');
      grad.addColorStop(1, 'rgba(5,8,14,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(bx - R, by - R, R * 2, R * 2);
    }

    ctx.globalCompositeOperation = 'lighter';
    var sx = smx * w;
    var sy = smy * h;
    var sR = M * 0.22;
    grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sR);
    grad.addColorStop(0, 'rgba(240,246,255,0.22)');
    grad.addColorStop(0.35, 'rgba(120,148,178,0.08)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    var pad = sR * 1.15;
    ctx.fillRect(sx - pad, sy - pad, pad * 2, pad * 2);

    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  }

  function wireReveal() {
    var revealed = false;
    function reveal() {
      if (revealed) return;
      revealed = true;
      canvas.classList.add('chrome-liquid-bg--visible');
    }

    function onTypingDone() {
      window.setTimeout(reveal, 520);
    }

    window.addEventListener('zira:hero-typing-done', onTypingDone);
    window.setTimeout(function () {
      if (!canvas.classList.contains('chrome-liquid-bg--visible')) {
        reveal();
      }
    }, 7200);
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('touchstart', onTouchStart, { passive: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireReveal);
  } else {
    wireReveal();
  }

  resize();
  initBlobs();
  loop();
})();
