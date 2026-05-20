-- Cantevo landing · Supabase (PostgreSQL)
-- Rode no SQL Editor: https://supabase.com/dashboard → seu projeto → SQL

-- Leads do formulário / agendamento
create table if not exists public.leads (
  id text primary key,
  created_at timestamptz not null default now(),
  lang text not null default '',
  source text not null default 'zira-landing-schedule',
  name text not null,
  email text not null default '',
  phone text not null,
  company text not null default '',
  segment text not null default '',
  revenue text not null default ''
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- Dúvidas do chat John AI na landing
create table if not exists public.john_inquiries (
  id text primary key,
  created_at timestamptz not null default now(),
  lang text not null default 'pt',
  source text not null default 'john-chat',
  session_id text not null default '',
  user_message text not null default '',
  assistant_reply text not null default '',
  kind text not null default 'answer',
  tokens boolean not null default false
);

create index if not exists john_inquiries_created_at_idx on public.john_inquiries (created_at desc);

-- Opcional: desabilitar RLS nestas tabelas se o painel não listar nada
-- (a API usa service_role, que ignora RLS — normalmente não precisa disso)
-- alter table public.leads disable row level security;
-- alter table public.john_inquiries disable row level security;
