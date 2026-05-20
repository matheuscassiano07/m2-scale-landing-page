# Deploy ZIRA AI · Vercel + Evolution API

Site estático (HTML/CSS/JS) com **funções serverless** em `/api/*` na Vercel
fazendo a ponte com a [Evolution API](https://doc.evolution-api.com/) para
WhatsApp.

## 1. Hospedar na Vercel

1. Crie o projeto:
   - **New Project** → importar este repositório.
   - **Framework Preset:** *Other* (sem build).
   - **Root Directory:** o próprio repositório (deixe em branco).
   - **Build Command:** *(vazio — não há build)*.
   - **Output Directory:** *(vazio — Vercel publica os arquivos estáticos da raiz)*.
2. O `vercel.json` já cuida de:
   - rewrites: `/admin` → `admin.html`, `/blog` → `blog.html`;
   - cabeçalhos de segurança (CSP, X-Frame-Options, Permissions-Policy etc.);
   - `Cache-Control: no-store` em `/api/*`.
3. As funções em `/api/wa/*.js` são detectadas automaticamente como **Node 18
   Serverless Functions** (declarado em `package.json`).

## 2. Variáveis de ambiente

No painel da Vercel: **Settings → Environment Variables**. Adicione (Production
e Preview):

| Nome | Obrigatório | Exemplo | Descrição |
|---|---|---|---|
| `EVOLUTION_API_URL`     | sim | `https://evo.seudominio.com` | URL base da Evolution API (sem barra final). |
| `EVOLUTION_API_KEY`     | sim | `xxxxxxx`                    | API key/global da instância Evolution. |
| `EVOLUTION_INSTANCE`    | sim | `zira-admin`                 | Nome da instância. Será criada se não existir. |
| `ADMIN_USERNAME`        | sim | `admin`                      | Usuário do painel `/admin`. |
| `ADMIN_PASSWORD`        | sim | senha forte                  | Senha do painel `/admin`. |
| `SESSION_SECRET`        | sim | string aleatória (32+ chars) | Chave HMAC que assina o cookie de sessão. |
| `SUPABASE_URL`          | recomendado | `https://xxx.supabase.co` | URL do projeto Supabase (Postgres persistente para leads). |
| `SUPABASE_SERVICE_ROLE_KEY` | recomendado | `eyJ...` | Chave server-side para inserir/listar leads via API REST. |
| `LEADS_FILE_PATH`       | recomendado | `/var/data/m2scale-leads-v1.json` | Caminho persistente para armazenar leads no servidor. Sem isso, o fallback (`/tmp`) é volátil. |
| `WA_NOTIFY_NUMBER`      | opcional | `5511999999999`         | Número que recebe a notificação de novo lead. Se vazio, usa o próprio número conectado pelo QR. |
| `WA_DEFAULT_DDI`        | opcional | `55`                    | DDI padrão se `WA_NOTIFY_NUMBER` vier sem código de país. |

Depois de salvar, **rode um redeploy** para as funções pegarem os valores.

## 3. Login do admin

O painel `/admin` exige usuário e senha (POST `/api/auth/login`).
O servidor compara em tempo constante com `ADMIN_USERNAME` / `ADMIN_PASSWORD`
e retorna um cookie httpOnly assinado com `SESSION_SECRET` (válido por 24h,
flags `Secure`+`SameSite=Lax` em HTTPS). Não há código PIN no client.

`SESSION_SECRET` precisa estar definido com 32+ caracteres. Sem isso, o login é recusado por segurança.

## 3.1 Tabela no Supabase (obrigatório para produção sem perda)

Rode no SQL Editor do Supabase:

```sql
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

-- Dúvidas do chat John AI (aba no /admin)
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
```

Arquivo completo: `scripts/supabase-schema.sql`.

### PostgreSQL na Vercel?

A Vercel **não hospeda** um servidor Postgres dentro do seu site. Opções:

| Opção | O que é | Este projeto |
|-------|---------|--------------|
| **Supabase** (recomendado aqui) | Postgres na nuvem + API REST | **Já integrado** (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`) |
| **Vercel Postgres** | Postgres gerido pela Vercel (Neon) | Exigiria reescrever `leadStore.js` / `inquiryStore.js` |
| Arquivo em `/tmp` | Fallback sem variáveis Supabase | **Dados somem** entre deploys/restarts — não use em produção |

Se o banco “não funciona”, quase sempre é: variáveis ausentes na Vercel, tabelas não criadas, ou projeto Supabase pausado.

### Checklist banco (Supabase)

1. Criar projeto em [supabase.com](https://supabase.com) (plano free serve para começar).
2. **SQL Editor** → colar e executar `scripts/supabase-schema.sql`.
3. **Settings → API** → copiar **Project URL** → `SUPABASE_URL` na Vercel.
4. Copiar **service_role** (secret) → `SUPABASE_SERVICE_ROLE_KEY` na Vercel (**nunca** no front-end).
5. **Redeploy** na Vercel.
6. Enviar um lead de teste na landing → `/admin` → aba Leads deve listar.
7. Se falhar: Vercel → **Deployments → Functions → Logs** e procurar `supabase-read-failed` ou `supabase-insert-failed`.

Endpoints novos: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`.

> O `assets/admin-config.js` ficou vazio. Os endpoints WhatsApp
> (`/api/wa/qrcode`, `/api/wa/status`) só respondem quando o cookie de
> sessão é válido — sem login no painel, eles devolvem 401.

## 4. Fluxo de uso

1. Acesse `https://seu-dominio.vercel.app/admin`, faça login com
   `ADMIN_USERNAME` / `ADMIN_PASSWORD` e veja o painel de leads.
2. Role até **Conexão WhatsApp**:
   - Se a instância ainda não existe, ela é criada automaticamente.
   - O QR Code aparece em até alguns segundos. Abra o WhatsApp do celular
     que vai receber as notificações: **Aparelhos conectados → Conectar
     aparelho** e escaneie.
   - O painel passa a `conectado` e mostra o número.
3. A partir daí, todo lead enviado pela landing dispara um POST para
   `/api/wa/notify`, que envia uma mensagem via Evolution API para o número
   configurado (ou o próprio número conectado).

## 5. Endpoints serverless

| Rota | Método | Auth | O que faz |
|---|---|---|---|
| `/api/auth/login`   | POST | same-origin estrito + rate-limit | Cria sessão (cookie httpOnly assinado). |
| `/api/auth/logout`  | POST | cookie + same-origin estrito      | Encerra sessão. |
| `/api/auth/me`      | GET  | cookie + same-origin estrito      | Diz se há sessão ativa. |
| `/api/leads/create` | POST | same-origin estrito + rate-limit  | Persiste lead enviado pela landing (Supabase quando configurado). |
| `/api/leads/list`   | GET  | cookie + same-origin estrito      | Lista leads para o painel `/admin` (Supabase quando configurado). |
| `/api/wa/status`    | GET  | cookie + same-origin estrito      | Retorna `{ state, number }` da instância. |
| `/api/wa/qrcode`    | GET  | cookie + same-origin estrito      | Cria instância se faltar e devolve QR base64 + pairing code. |
| `/api/wa/diag`      | GET  | cookie + same-origin estrito      | Diagnóstico JSON (presença de env, hostname, upstream, tentativa QR sem base64). |
| `/api/wa/notify`    | POST | same-origin estrito                | Recebe `{ name, email, phone, company, segment, revenue, lang }` da landing e envia WhatsApp. |

Rate-limit em memória: 30 req/min para o QR, 12 req/min para diag, 60 req/min para status, 8
req/min/IP + 240/min global para notify. Como Vercel reusa instâncias
serverless, o limit é por instância — para algo mais firme, plugue um
provider externo (Upstash Redis ou KV).

### 5.1 Troubleshooting QR (`/admin`)

Alterar variáveis em **Settings → Environment Variables** na Vercel **não aplica** sozinho às funções já implantadas: é obrigatório fazer **Redeploy** (aba *Deployments* → menu do deploy → **Redeploy**). Só guardar na UI ou “reiniciar” o projeto não atualiza o runtime das serverless functions.

| Sintoma no painel / em `upstream` | Causa provável | Correção |
|-----------------------------------|----------------|------------|
| `ENOTFOUND` / hostname não resolve | Subdomínio sem registo **A** ou **CNAME** no DNS | Criar registo apontando para o IP/hostname onde a Evolution corre; aguardar propagação (TTL). |
| `ECONNREFUSED` | Evolution parada, porta errada ou firewall a bloquear | Subir o serviço; abrir porta; testar `curl` a partir de outra máquina na internet. |
| `upstream-failed` / `fetch failed` | `EVOLUTION_API_URL` inalcançável **a partir da Vercel** (`localhost`, `127.0.0.1`, IP privado, host só na LAN) | Usar URL **HTTPS pública** da API (VPS, túnel tipo ngrok em testes, ou host gerido). |
| Erro TLS / certificado | HTTPS com certificado não confiável pelo Node | Se aceitável: `EVOLUTION_TLS_INSECURE=1` nas env vars (e redeploy). |
| HTTP 200 mas QR vazio / `renderedPng: false` | Evolution ainda sem materializar QR (count 0, só código, etc.) | **Atualizar QR** no painel; com `ZIRA_DEBUG_WA=1` a resposta de `/api/wa/qrcode` pode incluir `qrDebug`. |
| `SESSION_SECRET` falso no diagnóstico | Menos de 32 caracteres ou vazio | Definir `SESSION_SECRET` com 32+ caracteres; redeploy. |
| `evolutionUrlInfo.isPublic: false` | URL aponta para localhost / RFC1918 | Mesmo que “fetch failed”: a Vercel não alcança a tua máquina; use host público. |

Diagnóstico no painel: após login, botão **Diagnóstico** no cartão WhatsApp chama `GET /api/wa/diag`. No terminal local (com `.env`): `npm run evo-diag`.

## 6. Endpoints da Evolution API consumidos

- `GET /instance/connectionState/{instance}`
- `POST /instance/create` (`{ instanceName, qrcode: true, integration: 'WHATSAPP-BAILEYS' }`)
- `GET /instance/connect/{instance}`
- `POST /message/sendText/{instance}` (`{ number, text, delay }`)

Se sua versão da Evolution usar caminhos/payloads diferentes, ajuste em
`api/_lib/evolution.js` e nos handlers `api/wa/*.js`.

## 7. Testes locais

```bash
npm i -g vercel
vercel dev
# abre em http://localhost:3000 — funções e estáticos juntos
```

Defina as mesmas variáveis em `.env` na raiz para `vercel dev` carregar.
