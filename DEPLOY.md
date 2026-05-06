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
| `ZIRA_ADMIN_API_TOKEN`  | sim | um token forte (32+ chars)   | Protege os endpoints `/api/wa/qrcode` e `/api/wa/status`. |
| `WA_NOTIFY_NUMBER`      | opcional | `5511999999999`         | Número que recebe a notificação de novo lead. Se vazio, usa o próprio número conectado pelo QR. |
| `WA_DEFAULT_DDI`        | opcional | `55`                    | DDI padrão se `WA_NOTIFY_NUMBER` vier sem código de país. |

Depois de salvar, **rode um redeploy** para as funções pegarem os valores.

## 3. Token do admin no client

O token só sai do servidor para validar a chamada — o admin precisa enviá-lo
no header `x-zira-admin`. Edite `assets/admin-config.js`:

```js
window.ZIRA_ADMIN_CODE = 'um-pin-para-abrir-o-painel';
window.ZIRA_ADMIN_API_TOKEN = 'mesmo-valor-do-env-ZIRA_ADMIN_API_TOKEN';
```

> Esse arquivo vai a público — qualquer pessoa com a URL do `/admin` pode
> ler o token. Ele é uma camada de obscuridade somada ao gate. O servidor
> valida origem (same-origin) **e** token. Para algo mais forte, mova esse
> token para um cookie definido por uma rota de login server-side.

## 4. Fluxo de uso

1. Acesse `https://seu-dominio.vercel.app/admin`, digite o PIN e veja o
   painel de leads.
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
| `/api/wa/status`  | GET  | `x-zira-admin` + same-origin | Retorna `{ state, number }` da instância. |
| `/api/wa/qrcode`  | GET  | `x-zira-admin` + same-origin | Cria a instância se faltar e devolve o QR (`base64`) + `pairingCode`. |
| `/api/wa/notify`  | POST | same-origin                  | Recebe `{ name, email, phone, company, lang }` da landing e envia mensagem WhatsApp. |

Rate-limit em memória: 30 req/min para o QR, 60 req/min para status, 8
req/min/IP + 240/min global para notify. Como Vercel reusa instâncias
serverless, o limit é por instância — para algo mais firme, plugue um
provider externo (Upstash Redis ou KV).

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
