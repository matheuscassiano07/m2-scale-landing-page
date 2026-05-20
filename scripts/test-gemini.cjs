'use strict';

/**
 * Testa GEMINI_API_KEY e GEMINI_MODEL (lê .env na raiz do projeto).
 * Uso: npm run test:gemini
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env');

function loadDotEnv() {
  if (!fs.existsSync(ENV_PATH)) {
    console.warn('Arquivo .env não encontrado. Copie .env.example → .env e cole GEMINI_API_KEY.');
    return;
  }
  const lines = fs.readFileSync(ENV_PATH, 'utf8').split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

async function main() {
  loadDotEnv();

  const key = String(process.env.GEMINI_API_KEY || '').trim();
  const model = String(process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite').trim();
  const disabled = String(process.env.JOHN_CHAT_DISABLED || '').trim() === '1';

  if (disabled) {
    console.error('JOHN_CHAT_DISABLED=1 — IA desligada. Remova ou use 0 para testar.');
    process.exit(1);
  }

  if (key.length < 20) {
    console.error('GEMINI_API_KEY ausente ou inválida no .env');
    console.error('Crie em https://aistudio.google.com/apikey');
    process.exit(1);
  }

  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/' +
    encodeURIComponent(model) +
    ':generateContent';

  const body = {
    systemInstruction: {
      parts: [
        {
          text:
            'Você é o John AI da Cantevo. Responda em 1 frase sobre a plataforma para escritórios de arquitetura.',
        },
      ],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: 'O que é a Cantevo?' }],
      },
    ],
    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: 80,
      candidateCount: 1,
    },
  };

  console.log('Modelo:', model);
  console.log('A testar generateContent…');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': key,
    },
    body: JSON.stringify(body),
  });

  const raw = await res.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error('HTTP', res.status, raw.slice(0, 400));
    process.exit(1);
  }

  if (!res.ok) {
    console.error('Falha HTTP', res.status);
    console.error(JSON.stringify(data, null, 2));
    process.exit(1);
  }

  const parts =
    data.candidates &&
    data.candidates[0] &&
    data.candidates[0].content &&
    data.candidates[0].content.parts;
  const text = parts && parts[0] && parts[0].text ? String(parts[0].text).trim() : '';

  if (!text) {
    console.error('Resposta vazia:', JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log('\nOK — Gemini respondeu:\n');
  console.log(text);
  console.log('\nPróximo passo: defina GEMINI_API_KEY na Vercel e rode npm run dev para testar o chat.');
}

main().catch(function (err) {
  console.error(err.message || err);
  process.exit(1);
});
