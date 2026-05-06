'use strict';

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const FILE_PATH = process.env.LEADS_FILE_PATH
  ? path.resolve(process.env.LEADS_FILE_PATH)
  : path.join(process.env.TMPDIR || process.env.TEMP || '/tmp', 'm2scale-leads-v1.json');
const MAX_ROWS = 10000;
let writeChain = Promise.resolve();

function hasSupabase() {
  return Boolean(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
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

function normalizeLead(row) {
  if (!row || typeof row !== 'object') return null;
  const createdAt = row.createdAt || row.created_at || new Date().toISOString();
  return {
    id: cap(row.id || '', 80),
    createdAt: cap(createdAt, 48),
    lang: cap(row.lang || '', 8),
    source: cap(row.source || 'zira-landing-schedule', 64),
    name: cap(row.name || '', 120),
    email: cap(row.email || '', 254),
    phone: cap(row.phone || '', 32),
    company: cap(row.company || '', 160),
    segment: cap(row.segment || '', 64),
    revenue: cap(row.revenue || '', 48),
  };
}

function toDbRow(lead) {
  return {
    id: lead.id,
    created_at: lead.createdAt,
    lang: lead.lang,
    source: lead.source,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    segment: lead.segment,
    revenue: lead.revenue,
  };
}

async function readAllFromSupabase() {
  const url =
    supabaseBase() +
    '/rest/v1/leads?select=id,created_at,lang,source,name,email,phone,company,segment,revenue&order=created_at.desc&limit=' +
    encodeURIComponent(String(MAX_ROWS));
  const r = await fetch(url, {
    method: 'GET',
    headers: supabaseHeaders(),
  });
  if (!r.ok) throw new Error('supabase-read-failed');
  const rows = await r.json().catch(function () { return []; });
  if (!Array.isArray(rows)) return [];
  const out = [];
  for (let i = 0; i < rows.length && out.length < MAX_ROWS; i++) {
    const row = normalizeLead(rows[i]);
    if (row && (row.name || row.email || row.phone)) out.push(row);
  }
  out.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  return out;
}

async function addLeadToSupabase(lead) {
  const url = supabaseBase() + '/rest/v1/leads';
  const r = await fetch(url, {
    method: 'POST',
    headers: supabaseHeaders(),
    body: JSON.stringify([toDbRow(lead)]),
  });
  if (!r.ok) throw new Error('supabase-insert-failed');
}

async function readAll() {
  if (hasSupabase()) {
    try {
      return await readAllFromSupabase();
    } catch (e) {
      // fallback para arquivo local em ambiente sem tabela pronta
    }
  }
  try {
    if (!fs.existsSync(FILE_PATH)) return [];
    const raw = await fsp.readFile(FILE_PATH, 'utf8');
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    const out = [];
    for (let i = 0; i < arr.length && out.length < MAX_ROWS; i++) {
      const row = normalizeLead(arr[i]);
      if (row && (row.name || row.email || row.phone)) out.push(row);
    }
    out.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    return out;
  } catch (e) {
    return [];
  }
}

async function writeAll(rows) {
  const safe = Array.isArray(rows) ? rows.slice(0, MAX_ROWS) : [];
  await fsp.writeFile(FILE_PATH, JSON.stringify(safe), 'utf8');
}

async function addLead(row) {
  return (writeChain = writeChain.then(async function () {
    const lead = normalizeLead(row);
    if (!lead || !lead.name || lead.phone.length < 3) return { ok: false, reason: 'validation' };

    if (hasSupabase()) {
      try {
        await addLeadToSupabase(lead);
        return { ok: true, lead };
      } catch (e) {
        // Se o banco remoto estiver indisponivel/mal configurado, evita bloquear
        // totalmente o cadastro e degrada para armazenamento local.
      }
    }

    const all = await readAll();
    all.unshift(lead);
    if (all.length > MAX_ROWS) all.length = MAX_ROWS;
    await writeAll(all);
    return { ok: true, lead };
  }));
}

module.exports = {
  addLead,
  readAll,
  normalizeLead,
};

