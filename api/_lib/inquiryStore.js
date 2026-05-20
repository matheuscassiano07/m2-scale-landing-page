'use strict';

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const FILE_PATH = process.env.INQUIRIES_FILE_PATH
  ? path.resolve(process.env.INQUIRIES_FILE_PATH)
  : path.join(process.env.TMPDIR || process.env.TEMP || '/tmp', 'cantevo-john-inquiries-v1.json');
const MAX_ROWS = 20000;
let writeChain = Promise.resolve();

function hasSupabase() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function supabaseBase() {
  return String(process.env.SUPABASE_URL || '').replace(/\/+$/, '');
}

function supabaseHeaders() {
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '');
  return {
    apikey: key,
    Authorization: 'Bearer ' + key,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
}

function scrub(s) {
  return String(s == null ? '' : s).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

function cap(s, max) {
  s = scrub(s).trim();
  return s.length > max ? s.slice(0, max) : s;
}

function normalizeInquiry(row) {
  if (!row || typeof row !== 'object') return null;
  const createdAt = row.createdAt || row.created_at || new Date().toISOString();
  return {
    id: cap(row.id || '', 80),
    createdAt: cap(createdAt, 48),
    lang: cap(row.lang || 'pt', 8),
    source: cap(row.source || 'john-chat', 48),
    sessionId: cap(row.sessionId || row.session_id || '', 64),
    userMessage: cap(row.userMessage || row.user_message || '', 500),
    assistantReply: cap(row.assistantReply || row.assistant_reply || '', 600),
    kind: cap(row.kind || 'answer', 24),
    tokens: !!row.tokens,
  };
}

function toDbRow(inq) {
  return {
    id: inq.id,
    created_at: inq.createdAt,
    lang: inq.lang,
    source: inq.source,
    session_id: inq.sessionId,
    user_message: inq.userMessage,
    assistant_reply: inq.assistantReply,
    kind: inq.kind,
    tokens: inq.tokens,
  };
}

function newId() {
  return (
    'inq_' +
    Date.now().toString(36) +
    '_' +
    Math.random().toString(36).slice(2, 10)
  );
}

async function readAllFromSupabase() {
  const url =
    supabaseBase() +
    '/rest/v1/john_inquiries?select=id,created_at,lang,source,session_id,user_message,assistant_reply,kind,tokens&order=created_at.desc&limit=' +
    encodeURIComponent(String(MAX_ROWS));
  const r = await fetch(url, {
    method: 'GET',
    headers: supabaseHeaders(),
  });
  if (!r.ok) {
    const body = await r.text().catch(function () { return ''; });
    throw new Error(
      'supabase-inq-read-failed status=' + String(r.status) + ' body=' + String(body || '').slice(0, 280)
    );
  }
  const rows = await r.json().catch(function () { return []; });
  if (!Array.isArray(rows)) return [];
  const out = [];
  for (let i = 0; i < rows.length && out.length < MAX_ROWS; i++) {
    const row = normalizeInquiry(rows[i]);
    if (row && row.userMessage) out.push(row);
  }
  out.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  return out;
}

async function addToSupabase(inq) {
  const url = supabaseBase() + '/rest/v1/john_inquiries';
  const r = await fetch(url, {
    method: 'POST',
    headers: supabaseHeaders(),
    body: JSON.stringify([toDbRow(inq)]),
  });
  if (!r.ok) {
    const body = await r.text().catch(function () { return ''; });
    throw new Error(
      'supabase-inq-insert-failed status=' + String(r.status) + ' body=' + String(body || '').slice(0, 280)
    );
  }
}

async function readAllFromFile() {
  try {
    if (!fs.existsSync(FILE_PATH)) return [];
    const raw = await fsp.readFile(FILE_PATH, 'utf8');
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    const out = [];
    for (let i = 0; i < arr.length && out.length < MAX_ROWS; i++) {
      const row = normalizeInquiry(arr[i]);
      if (row && row.userMessage) out.push(row);
    }
    out.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    return out;
  } catch (e) {
    return [];
  }
}

async function writeAllFile(rows) {
  const safe = Array.isArray(rows) ? rows.slice(0, MAX_ROWS) : [];
  await fsp.writeFile(FILE_PATH, JSON.stringify(safe), 'utf8');
}

async function readAll() {
  if (hasSupabase()) {
    try {
      return await readAllFromSupabase();
    } catch (e) {
      try {
        console.warn('[inquiryStore] Supabase read failed, using file:', String(e && e.message || e));
      } catch (_) {}
    }
  }
  return readAllFromFile();
}

async function addInquiry(row) {
  return (writeChain = writeChain.then(async function () {
    const inq = normalizeInquiry(row);
    if (!inq || inq.userMessage.length < 2) return { ok: false, reason: 'validation' };
    if (!inq.id) inq.id = newId();
    if (!inq.createdAt) inq.createdAt = new Date().toISOString();

    if (hasSupabase()) {
      try {
        await addToSupabase(inq);
        return { ok: true, inquiry: inq };
      } catch (e) {
        try {
          console.warn('[inquiryStore] Supabase write failed, using file:', String(e && e.message || e));
        } catch (_) {}
      }
    }

    const all = await readAllFromFile();
    all.unshift(inq);
    if (all.length > MAX_ROWS) all.length = MAX_ROWS;
    await writeAllFile(all);
    return { ok: true, inquiry: inq };
  }));
}

module.exports = {
  addInquiry,
  readAll,
  normalizeInquiry,
};
