/**
 * Text split animations (words/chars), compatible with i18n.textContent writes.
 */
(function (global) {
  'use strict';

  function reducedMotion() {
    return false;
  }

  /**
   * @param {string} text
   * @returns {string[]}
   */
  function tokenizeWords(text) {
    var parts = [];
    var rx = /(\s+)|(\S+)/g;
    var m;
    while ((m = rx.exec(text)) !== null) {
      parts.push(m[0]);
    }
    return parts.length ? parts : [text];
  }

  /**
   * @param {HTMLElement} host
   * @param {'words'|'chars'} mode
   */
  function splitOne(host, mode) {
    var plain = host.textContent || '';
    plain = plain.replace(/\u00a0/g, ' ');
    if (!plain.trim()) return;

    var frag = global.document.createDocumentFragment();
    var wordIndex = 0;
    var i;

    if (mode === 'words') {
      var tokens = tokenizeWords(plain);
      for (i = 0; i < tokens.length; i++) {
        var tk = tokens[i];
        if (/^\s+$/.test(tk)) {
          frag.appendChild(global.document.createTextNode(tk));
        } else {
          var w = global.document.createElement('span');
          w.className = 'motion-split__unit motion-split__unit--word';
          w.style.setProperty('--u', String(wordIndex));
          wordIndex++;
          w.textContent = tk;
          frag.appendChild(w);
        }
      }
    } else {
      var chars = Array.from(plain);
      var uc = 0;
      for (i = 0; i < chars.length; i++) {
        var ch = chars[i];
        if (ch === ' ') {
          frag.appendChild(global.document.createTextNode(' '));
          continue;
        }
        var c = global.document.createElement('span');
        c.className = 'motion-split__unit motion-split__unit--char';
        c.style.setProperty('--u', String(uc));
        uc++;
        c.textContent = ch;
        frag.appendChild(c);
      }
    }

    while (host.firstChild) {
      host.removeChild(host.firstChild);
    }
    host.appendChild(frag);
    host.classList.add('motion-split--ready');
  }

  function enhance(root) {
    if (typeof global.document === 'undefined') return;
    var docRoot = root && root.querySelectorAll ? root : global.document.body;
    var reduce = reducedMotion();

    var hero = global.document.getElementById('hero');
    var heroTitle = global.document.getElementById('hero-title');

    if (!reduce && heroTitle && heroTitle.hasAttribute('data-motion-split')) {
      var hm = heroTitle.getAttribute('data-motion-split') || 'words';
      if (hm !== 'chars' && hm !== 'words') hm = 'words';
      if (hero) {
        hero.classList.remove('hero--motion-ready');
        // força re-leitura para repetir a entrada após troca de idioma
        hero.classList.add('hero--motion');
        if (typeof hero.offsetHeight === 'number') {
          void hero.offsetHeight;
        }
      }
      splitOne(heroTitle, hm);
      if (hero) {
        global.requestAnimationFrame(function () {
          global.requestAnimationFrame(function () {
            if (hero) hero.classList.add('hero--motion-ready');
          });
        });
      }
    } else if (hero) {
      hero.classList.remove('hero--motion', 'hero--motion-ready');
    }

    if (reduce) return;

    var list = docRoot.querySelectorAll('[data-motion-split]');
    var j;
    for (j = 0; j < list.length; j++) {
      var el = list[j];
      if (!(el instanceof global.HTMLElement)) continue;
      if (el.id === 'hero-title') continue;
      var mode = el.getAttribute('data-motion-split') || 'words';
      if (mode !== 'words' && mode !== 'chars') mode = 'words';
      splitOne(el, mode);
    }
  }

  global.ZiraMotion = {
    enhance: enhance,
    reducedMotion: reducedMotion,
  };

  global.addEventListener(
    'zira:lang',
    function () {
      enhance(global.document.body);
    },
    false
  );
})(typeof window !== 'undefined' ? window : this);
