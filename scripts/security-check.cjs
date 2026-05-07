/**
 * Verificações estáticas — sem dependências (Node 18+).
 * Uso: node scripts/security-check.cjs
 */
'use strict';

var fs = require('fs');
var path = require('path');

var root = path.join(__dirname, '..');
var assetsDir = path.join(root, 'assets');

var files = fs.readdirSync(assetsDir).filter(function (f) {
  return f.endsWith('.js');
});

var banned = [
  { re: /\beval\s*\(/, msg: 'eval() encontrado' },
  { re: /new\s+Function\s*\(/, msg: 'new Function() encontrado' },
  { re: /document\s*\.\s*write\s*\(/, msg: 'document.write encontrado' },
];

var joinContent = '';
files.forEach(function (name) {
  joinContent += fs.readFileSync(path.join(assetsDir, name), 'utf8') + '\n';
});

var failed = false;
banned.forEach(function (rule) {
  var m = joinContent.match(rule.re);
  if (m) {
    failed = true;
    console.error('[FALHA]', rule.msg, '=>', JSON.stringify(String(m[0])));
  }
});

if (failed) {
  process.exit(1);
}

console.log('security-check OK —', files.length, 'ficheiros em assets/*.js');
