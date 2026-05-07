# ZIRA AI — Landing Page

Landing page para o ZIRA AI, plataforma de operação para escritórios de arquitetura e engenharia.

**Design system aplicado:** Linear (via [awesome-design-md](https://github.com/VoltAgent/awesome-design-md)).

## Estrutura

```
zira-ai-landing/
├── index.html              # HTML + CSS + JS (single-file)
├── DESIGN.md               # Linear design system aplicado neste projeto
├── README.md
├── design-system/          # Repo VoltAgent clonado (referência completa)
└── assets/
    ├── logo.png
    ├── hero-bg.jpg
    ├── zira-mascot.png
    ├── problem-phone.png
    ├── workflow-steps.png
    └── calendar-laptop.png
```

## Por que Linear

Match com o que você já vinha buscando: dark-mode-native, precisão tipográfica, brand
accent reservado para interação, profundidade por luminância (não por sombra). Mesma
linguagem de Vercel/Linear que apareceu nas referências do M2 ARK.

## Tokens principais aplicados

| Token | Valor | Uso |
|-------|-------|-----|
| `--surface-1` | `#08090a` | Background principal |
| `--surface-2` | `#0f1011` | Nav, cards CTA |
| `--text-primary` | `#f7f8f8` | Headlines (nunca `#ffffff`) |
| `--text-secondary` | `#d0d6e0` | Body |
| `--text-tertiary` | `#8a8f98` | Subtítulos, eyebrows |
| `--brand-indigo` | `#5e6ad2` | CTAs primárias |
| `--brand-violet` | `#7170ff` | Accent / "Zira AI" |
| `--border-standard` | `rgba(255,255,255,0.08)` | Cards, frames |

**Tipografia:** Inter Variable com `font-feature-settings: "cv01", "ss03"` (geometric
alternates — assinatura visual da Linear). Peso `510` como default de UI, `590` para
ênfase forte. Letter-spacing negativo agressivo nos display sizes
(`-1.584px` em 72px).

**JetBrains Mono** entra como fallback de Berkeley Mono (closed-source) nos eyebrows
de seção (`/ Equipe`, `/ Fluxo`, etc.).

## Mudanças visuais vs. versão anterior

- Hero ganhou eyebrow pill com status-dot, subtítulo, e CTAs em ghost + indigo
- Todas as imagens passam por "frames" — card translúcido com `border + ring shadow`
- Bullets do "O problema" viraram cards com X-icon, em vez de lista plana
- Bullets do "Saiba exatamente" viraram pills horizontais
- Adicionado footer minimalista com mono-label
- Glow ambiente indigo no topo da página (Linear-style halo)
- Toda label/eyebrow usa mono font para reforçar precisão

## Como rodar localmente

```bash
# Python
python3 -m http.server 8000
# ou Node
npx serve .
```

## Stack

- HTML5 semântico
- CSS puro (Flexbox + Grid, design tokens em `:root`)
- Vanilla JS (toggle hamburger + IntersectionObserver para reveal do nav)
- Sem frameworks, sem build step
- Inter Variable + JetBrains Mono via Google Fonts

## Responsividade

- Desktop: ≥ 1025px (nav horizontal)
- Tablet: ≤ 1024px (hamburger ativa)
- Mobile: ≤ 768px (single column, padding reduzido)

## Próximos passos sugeridos

- Trocar `<a href="#">` da nav por rotas reais quando existirem
- Adicionar `og:image` e meta tags de SEO
- Otimizar PNGs grandes para WebP
- Hospedar Inter Variable localmente para remover dependência externa
- Considerar self-hostar [Berkeley Mono](https://berkeleygraphics.com/typefaces/berkeley-mono/) (paid) para 100% fidelidade ao Linear
