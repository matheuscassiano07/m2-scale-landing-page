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

var joinContent = '';
files.forEach(function (name) {
  joinContent += fs.readFileSync(path.join(assetsDir, name), 'utf8') + '\n';
});

var banned = [
  { re: /\beval\s*\(/, msg: 'eval() encontrado' },
  { re: /new\s+Function\s*\(/, msg: 'new Function() encontrado' },
  { re: /document\s*\.\s*write\s*\(/, msg: 'document.write encontrado' },
  { re: /GEMINI_API_KEY/i, msg: 'GEMINI_API_KEY no cliente (assets/)' },
  { re: /generativelanguage\.googleapis\.com/i, msg: 'URL Gemini no cliente (assets/)' },
  { re: /x-goog-api-key/i, msg: 'header de API key no cliente (assets/)' },
];

var failed = false;
banned.forEach(function (rule) {
  var m = joinContent.match(rule.re);
  if (m) {
    failed = true;
    console.error('[FALHA]', rule.msg, '=>', JSON.stringify(String(m[0])));
  }
});

var indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (/GEMINI_API_KEY|generativelanguage\.googleapis/i.test(indexHtml)) {
  failed = true;
  console.error('[FALHA] Referência Gemini em index.html');
}

if (failed) {
  process.exit(1);
}

console.log('security-check OK —', files.length, 'ficheiros em assets/*.js');
