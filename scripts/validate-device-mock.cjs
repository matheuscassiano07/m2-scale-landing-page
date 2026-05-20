#!/usr/bin/env node
'use strict';

/**
 * Valida lógica de visibilidade do mock John (mobile vs desktop).
 * Não substitui teste visual no browser — garante que telas altas disparam com pouca área visível.
 */

var api = require('../assets/john-device-mock.js');

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
}

/* Mock alto no mobile: só ~12% visível no topo — deve iniciar */
assert(
  api.isMockInView({ top: 80, bottom: 680, height: 600, left: 0, right: 300, width: 300, x: 0, y: 80 }, 700, true),
  'mobile: topo do iPhone visível deve disparar animação'
);

/* Desktop: pedaço pequeno não basta */
assert(
  !api.isMockInView({ top: -520, bottom: 40, height: 560, left: 0, right: 300, width: 300, x: 0, y: -520 }, 700, false),
  'desktop: quase todo fora do viewport não deve disparar'
);

/* Ratio explícito */
var r = api.visibleHeightRatio({ top: 100, bottom: 200, height: 100, left: 0, right: 0, width: 0, x: 0, y: 100 }, 400);
assert(Math.abs(r - 1) < 0.01, 'visibleHeightRatio: elemento inteiro visível');

assert(api.STEPS && api.STEPS.length === 9, 'sequência com 9 passos');

console.log('OK: validate-device-mock (' + api.STEPS.length + ' steps, mobile visibility)');
