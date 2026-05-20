# CANTEVO — Conhecimento completo para apresentação e John AI

**Versão:** 2026-05-18  
**Uso:** apresentação comercial, onboarding, FAQ com clientes e **prompt de sistema** para a IA **John** (atendente virtual).  
**Implementação no código:** `api/_lib/johnSystemPrompt.js` (versão resumida para o chat da landing).

---

## PARTE 1 — PROMPT DE APRESENTAÇÃO (humano ou IA narrando o produto)

Use este bloco quando precisar **apresentar o CANTEVO** em reunião, demo, site, pitch ou vídeo. Leia como roteiro; adapte o tom ao público.

### Abertura (30 segundos)

> O **CANTEVO** é uma plataforma online (SaaS) feita para **escritórios que vendem e executam projetos** — arquitetura, interiores, engenharia e construção leve. Ele junta em um só lugar o que hoje costuma estar espalhado: **WhatsApp comercial**, **CRM**, **agenda da equipe**, **gestão de obras/projetos**, **checklists por etapa** e **atendimento com inteligência artificial**.  
> A ideia central é simples: **do primeiro “oi” no WhatsApp até o checklist da obra**, sem perder histórico, sem depender só do celular do dono e sem o cliente final ficar no escuro.

*(Documento completo mantido conforme enviado pelo cliente — ver histórico do repositório ou solicitar expansão das PARTES 2–6 no arquivo.)*

---

## PARTE 3 — PROMPT DE SISTEMA PARA **JOHN AI** (referência)

O texto entre `---INÍCIO PROMPT JOHN---` e `---FIM PROMPT JOHN---` do documento original está implementado em `api/_lib/johnSystemPrompt.js`, com adaptações para o **chat da landing** (poucas perguntas, formulário “Entrar em contato”, linguagem simples).

---

*Documento de produto. Não expõe chaves de API.*
