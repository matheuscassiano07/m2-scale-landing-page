#!/usr/bin/env node
'use strict';

var api = require('../assets/john-device-mock.js');

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
}

assert(
  api.isMockInView({ top: 80, bottom: 680, height: 600, left: 0, right: 300, width: 300, x: 0, y: 80 }, 700, true),
  'mobile: topo do iPhone visível deve disparar animação'
);

assert(
  !api.isMockInView({ top: -520, bottom: 40, height: 560, left: 0, right: 300, width: 300, x: 0, y: -520 }, 700, false),
  'desktop: quase todo fora do viewport não deve disparar'
);

var r = api.visibleHeightRatio({ top: 100, bottom: 200, height: 100, left: 0, right: 0, width: 0, x: 0, y: 100 }, 400);
assert(Math.abs(r - 1) < 0.01, 'visibleHeightRatio: elemento inteiro visível');

assert(api.SCENARIOS && api.SCENARIOS.length >= 6, 'pelo menos 6 cenários de diálogo');

var tl = api.buildTimeline(api.SCENARIOS[1].lines);
assert(tl.length === 9, 'cada cenário tem 3 client + 3 typing + 3 john = 9 passos');

console.log(
  'OK: validate-device-mock (' +
    api.SCENARIOS.length +
    ' cenários, ' +
    tl.length +
    ' passos no cenário 2)'
);
