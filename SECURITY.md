# Segurança · ZIRA AI landing (estática)

Este repositório é uma **landing page estática** (HTML/CSS/JS). Não há servidor de aplicação nem base de dados no bundle: o modelo de ameaças é diferente de uma API tradicional.

## O que foi revisto (auditoria orientada a “red team”)

| Área | Risco típico | Mitigação aplicada |
|------|----------------|-------------------|
| XSS (DOM) | `innerHTML` com dados de utilizador ou JSON em `localStorage` | Cartões no painel `admin-app.js` montados com **`textContent`/DOM**; formulário PIN sem `innerHTML` dinâmico com entrada do utilizador. |
| SSRF indirecto via `fetch(webhook)` | URL maliciosamente configurada (`file:`, IPs internos) | **`leads.js`**: webhook só **`https:`** válido via `URL()`, hostname público obrigatório; **sem credenciais** em `fetch`; `referrerPolicy: no-referrer`. |
| Dados corruptos em `localStorage` | JSON enorme/truncado/execução através de parsing | **`readAll`**: limite de tamanho do raw, **apaga armazenamento** se corrupto demais; objectos normalizados com `sanitizeLead`. |
| Abuso / spam de leads | Spam no browser do visitante | Limite de linhas e tamanho de payload na serialização; validação mínima de campos. **Não é rate-limit de rede** (isso exige backend ou WAF). |
| Clickjacking | Site embutido em `<iframe>` | **`frame-ancestors 'none'`** (CSP) + **`X-Frame-Options: DENY`** (`_headers`). |
| MIME confusion | Executar JS disfarçado de outro tipo | **`X-Content-Type-Options: nosniff`**. |
| Exfiltração de referrer | Leak de rotas para terceiros | **`Referrer-Policy`** + **`no-referrer`** no `fetch` do webhook. |
| Permissões do browser não usadas | APIs sensíveis expostas sem necessidade | **`Permissions-Policy`** mínima (câmera, micro, etc. desativados). |

## Limitações importantes (“blue team” / arquitetura)

1. **`ZIRA_ADMIN_CODE` no cliente** em `assets/admin-config.js` **não é segredo forte**: qualquer pessoa com acesso ao JS ou que consiga adivinhar o PIN pode ver o painel `admin.html`. Em produção, trate como **gate de conveniência**; para dados reais use **autenticação no servidor**, IP allowlist ou retirar o painel do host público.
2. **`localStorage` de leads** é **apenas no browser** onde o formulário foi enviado — não há confidencialidade multi-dispositivo sem backend ou base de dados partilhada.
3. **CSP com `'unsafe-inline'`** nas `script-src` / `style-src` é necessária por causa dos **blocos inline** em `index.html`. Isto reduz a proteção contra XSS injectado por terceiros; manter JS em ficheiros externos e CSP mais estrita é o passo seguinte se quiser endurecer.
4. **Hardening HTTP** (`_headers`) só aplica-se em hosting que respeita o ficheiro (ex.: Netlify). **GitHub Pages** não usa `_headers`; configure cabeçalhos no CDN (Cloudflare, Fastly) ou migre o host.

## Verificação local

```bash
node scripts/security-check.cjs
```

Procura padrões perigosos (`eval`, `new Function`, `document.write`) em `assets/*.js`.

## Publicação

- Ative **HTTPS** obrigatório no host.
- Revise periodicamente dependências se no futuro adicionar build tools.
- Rotacione webhooks (Zapier/Make) se expostos em repositório ou tickets.

Data desta revisão: alinhada ao estado atual do repositório após hardening do código e cabeçalhos.
