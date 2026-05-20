# John AI · configurar API Gemini (tirar dúvidas no site)

Guia para ativar o chat flutuante da landing com respostas automáticas sobre a **Cantevo / John AI**.

---

## Qual modelo usar?

Para **só tirar dúvidas no site** (respostas curtas, máx. 2 perguntas por visitante, sem imagem/áudio/pesquisa):

| Prioridade | Modelo (`GEMINI_MODEL`) | Quando usar |
|------------|-------------------------|-------------|
| **Recomendado** | `gemini-2.5-flash-lite` | Melhor custo no plano gratuito; suficiente para FAQ comercial. **Padrão do projeto.** |
| Alternativa | `gemini-2.5-flash` | Respostas um pouco melhores; ainda barato (entrada ~US$ 0,30 / M tokens no pago). |
| Evitar | `gemini-2.0-flash` | Obsoleto (desativação prevista em jun/2026). |
| Não usar aqui | `gemini-2.5-pro`, `gemini-3.x-pro`, imagem, Veo, TTS, Live | Caros ou desnecessários para FAQ. |
| Não usar aqui | Modelos com **Pesquisa Google** | Cada consulta extra pode custar ~US$ 14 / 1.000 pesquisas. O John AI **não** usa grounding. |

O código **não** chama ferramentas (Maps, Search, código). Só `generateContent` com instrução fixa + até **120 tokens** de saída.

### Estimativa de uso (com os limites do site)

- Por visitante: no máximo **2** respostas com IA (depois manda para o formulário).
- Servidor: padrão **30** chamadas Gemini/hora e **120**/dia (globais), mais limites por IP e sessão.
- Ordem de grandeza: ~100–400 tokens por resposta → mesmo com tráfego moderado, o tier **sem custo** do Flash-Lite costuma bastar no início.

---

## Onde está o prompt da IA

| O quê | Arquivo |
|-------|---------|
| Prompt enviado ao Gemini (produção) | `api/_lib/johnSystemPrompt.js` |
| Mensagens fixas (sem IA) | `api/_lib/johnChat.js` → função `canned()` |
| Boas-vindas no painel do site | `assets/i18n.js` → `johnChat.welcome` |
| Documento completo de produto | `docs/CANTEVO-JOHN-PROMPT.md` |

Depois de editar o prompt, faça redeploy na Vercel.

---

## Onde criar a chave

1. Acesse [Google AI Studio](https://aistudio.google.com/apikey) (conta Google).
2. **Create API key** → projeto novo ou existente.
3. Copie a chave (formato `AIza...`). **Nunca** coloque no `index.html`, `assets/` nem no Git.

Opcional (recomendado em produção):

- Ative **billing / modo pago** no Google Cloud se passar dos limites gratuitos.
- Configure **alertas de orçamento** no console.
- No plano pago, o conteúdo **não** é usado para treinar produtos Google (diferente do tier gratuito).

---

## Variáveis na Vercel

**Project → Settings → Environment Variables**

| Variável | Obrigatório | Valor |
|----------|-------------|--------|
| `GEMINI_API_KEY` | Sim | Chave do AI Studio |
| `GEMINI_MODEL` | Não | `gemini-2.5-flash-lite` (recomendado) |
| `JOHN_CHAT_DISABLED` | Não | `1` = desliga IA (só mensagens fixas / formulário) |
| `JOHN_CHAT_MAX_GEMINI_HOUR` | Não | Padrão `30` |
| `JOHN_CHAT_MAX_GEMINI_DAY` | Não | Padrão `120` |

Marque **Production** e **Preview**. Depois: **Deployments → Redeploy** (variáveis novas só aplicam após redeploy).

### Pausar gastos na hora

- `JOHN_CHAT_DISABLED=1`, ou
- Remova `GEMINI_API_KEY`, ou
- Revogue a chave no AI Studio.

O site continua funcionando; o chat mostra mensagem para usar **Entrar em contato**.

---

## Testar localmente

A API **não** roda com `npm start` (só arquivos estáticos). Use:

```bash
cp .env.example .env
# Edite .env e cole GEMINI_API_KEY=AIza...

npm run test:gemini
npm run dev
```

Abra `http://localhost:3000`, clique no botão do John AI e envie uma dúvida sobre a Cantevo (ex.: *Como a Cantevo organiza prazos de obra?*).

`npm run test:gemini` chama o mesmo endpoint que a Vercel usa e imprime a resposta ou o erro (chave inválida, modelo errado, limite, etc.).

---

## Segurança (já implementada)

- Chave **somente** no servidor (`api/john/chat.js`).
- `scripts/security-check.cjs` bloqueia vazamento da chave no front.
- Rate limit por IP, sessão e global.
- Filtro de assunto (só Cantevo / escritório / produto).
- Máx. 2 turnos de usuário → handoff para o formulário.
- Honeypot anti-spam no POST.

---

## Checklist rápido

- [ ] Chave criada no AI Studio  
- [ ] `GEMINI_API_KEY` na Vercel (Production + Preview)  
- [ ] `GEMINI_MODEL=gemini-2.5-flash-lite` (opcional, já é o padrão no código)  
- [ ] Redeploy na Vercel  
- [ ] Teste no site publicado: 1ª mensagem fixa (sem token) + 1 pergunta on-topic (com token)  
- [ ] Painel `/admin` → aba **Dúvidas John AI** (se Supabase/arquivo de inquiries configurado)  

---

## Problemas comuns

| Sintoma | Causa provável | Solução |
|---------|----------------|---------|
| Sempre manda ao formulário | Sem chave ou `JOHN_CHAT_DISABLED=1` | Confira variáveis e redeploy |
| “Limite de uso” | `JOHN_CHAT_MAX_GEMINI_*` ou quota Google | Aumente limites com cuidado ou espere / upgrade |
| Erro 404 no modelo | Nome errado em `GEMINI_MODEL` | Use `gemini-2.5-flash-lite` ou `gemini-2.5-flash` |
| Chat não responde local | Usou `npm start` em vez de `npm run dev` | `vercel dev` |
| 403 no POST | Origem diferente do site | Teste no mesmo domínio da landing |
| **503** no POST `/api/john/chat` | Função Vercel em timeout, crash ou limite da plataforma; Gemini fora do ar | Abra `GET /api/john/health` — `geminiConfigured` deve ser `true`. Confira `GEMINI_API_KEY` na Vercel e redeploy. Logs: Vercel → Functions → `api/john/chat`. Se persistir, pode ser pico na Vercel (503) ou quota Google (resposta cai no texto de indisponível, HTTP 200). |

Referência oficial de preços: [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing).
