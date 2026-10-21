# PRISMA DA NOTÍCIA

> Uma notícia. Vários ângulos.
> **MediaTech · AI · News Intelligence** — [prismadanoticia.com.br](https://prismadanoticia.com.br)

Front-end em **Vue 3 puro** (Composition API + `<script setup>`), construído a partir do
Brand Book Premium V1.0.

> A notícia não muda. O que muda é o ângulo pelo qual ela é apresentada.

---

## Stack

| Camada       | Tecnologia                                |
| ------------ | ----------------------------------------- |
| Front-end    | Vue 3, Vite, Tailwind CSS v4, Motion, PWA |
| Roteamento   | Vue Router 4 (lazy loading por rota)      |
| Back-end     | InsForge, PostgreSQL, Edge Functions      |
| Inteligência | OpenRouter, pgvector, Embeddings          |

## Comandos

```bash
npm install        # instala dependências
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção (gera dist/ + service worker)
npm run preview    # pré-visualiza o build
npm run lint       # ESLint
npm run test:run   # testes unitários (Vitest)
npm run format     # Prettier
```

## Estrutura

```
src/
├─ assets/styles/main.css     # Design system: paleta, tipografia, tokens, utilitários
├─ components/
│  ├─ brand/BrandLogo.vue     # Logo nas 3 versões (horizontal, vertical, ícone)
│  ├─ ui/                     # PButton, PCard, PBadge, ScoreRing, MeterBar, SectionHeading
│  ├─ layout/                 # AppNavbar (com toggle de tema), AppFooter
│  ├─ landing/                # HeroPrism, HowItWorks, DnaShowcase, TrendsSection,
│  │                          # FeatureGrid, MoatSection, BrandManifesto
│  ├─ analysis/DnaRadar.vue   # Radar de 6 eixos — assinatura visual do Prisma
│  └─ intel/                  # PolarizationMap (cartograma), ShareCard (cartão viral)
├─ composables/               # useReveal (scroll reveal + contadores), useTheme
├─ data/                      # Frames canônicos, fixtures por domínio e barrel
├─ lib/                       # Cliente InsForge, radar, cores, análise e serviços
├─ router/index.js
└─ views/                     # Home, Analysis, Compare, BlindSpot, Replay, Map, Tech, Brand, 404
functions/analyze-url.ts      # Edge Function: extrai matéria, analisa com IA e grava no banco
migrations/                   # Schema, RLS, views, RPC e seed do InsForge
tests/unit/                   # Testes Vitest de dados e helpers
```

## Rotas × Brand Book

| Rota          | Capítulo              | Conteúdo                                                                                 |
| ------------- | --------------------- | ---------------------------------------------------------------------------------------- |
| `/`           | Cap. 1, 3, 14         | Landing premium: hero animado, como funciona, tendências, manifesto, cartão viral        |
| `/analise`    | Cap. 4                | Tela de Análise: Resumo IA, Confiança, Diversidade de Fontes, Evidências, DNA da Notícia |
| `/comparacao` | Cap. 5                | Comparação Inteligente entre veículos + radar sobreposto                                 |
| `/blindspot`  | Cap. 6                | BlindSpot Brasil, com seletor de período obrigatório                                     |
| `/replay`     | Cap. 7                | Prisma Replay: player da evolução da narrativa                                           |
| `/mapa`       | Moat                  | Mapa de Polarização em Tempo Real (cartograma das 27 UFs)                                |
| `/tecnologia` | Cap. 8, 9, 10, 11, 12 | Stack, Prisma Engine, Banco Inteligente, PWA, Extensão Chrome                            |
| `/marca`      | Cap. 1, 2, 13         | DNA da marca, arquétipos, logo, paleta, tipografia, Pitch Deck                           |

## Identidade visual

**Paleta Premium**

| Cor                 | Hex       | Uso                              |
| ------------------- | --------- | -------------------------------- |
| Midnight            | `#05091A` | Fundo padrão                     |
| Electric Blue       | `#2D6BFF` | Ação primária e dados            |
| Prism Purple        | `#8B5CF6` | Inteligência e IA                |
| Energy Red          | `#FF3B5C` | Alerta e BlindSpot               |
| Insight Gold        | `#FFC24B` | Descoberta e destaque            |
| Signal Mint (apoio) | `#2EE6A8` | Evidências sustentadas e sucesso |

**Tipografia**: Space Grotesk (logo e títulos) · Inter (interface).

As cores dos **enquadramentos** (Política, Economia, Segurança, Meio Ambiente, Saúde, Social,
Jurídico) têm fonte única em `FRAMES`, dentro de `src/data/frames.js`. Mapa, Replay e hero leem
de lá, para que a mesma cor signifique sempre o mesmo enquadramento em todas as telas.

## O DNA da Notícia

Radar de seis eixos, cada um com explicação própria:

| Indicador  | Mede          |
| ---------- | ------------- |
| Emoção     | intensidade   |
| Fontes     | variedade     |
| Evidências | sustentação   |
| Persuasão  | linguagem     |
| Equilíbrio | pluralidade   |
| Narrativa  | enquadramento |

## PWA

Manifest e service worker gerados no build (`vite-plugin-pwa`): instalável, modo escuro
como padrão da marca, ícones próprios e cache offline das análises visitadas.

## Deploy

O router usa `createWebHistory`, então **o host precisa reescrever todas as rotas para
`index.html`**. Sem isso, um acesso direto a `/analise` ou `/mapa` retorna 404 na primeira
visita (o service worker só cobre visitas seguintes).

Já incluídos no projeto:

- `public/_redirects` — Netlify e Cloudflare Pages
- `vercel.json` — Vercel

Outros hosts:

```nginx
# Nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

- **Apache**: `FallbackResource /index.html`
- **S3 / CloudFront**: definir `index.html` como documento de erro (404 → 200)
- **GitHub Pages**: copiar `dist/index.html` para `dist/404.html` após o build

## InsForge

O backend fica no projeto **Prismadanoticia** (`https://9aqdv427.us-east.insforge.app`). As
variáveis ficam em `.env` (nunca commitar):

```bash
VITE_INSFORGE_URL=https://9aqdv427.us-east.insforge.app
VITE_INSFORGE_ANON_KEY=...
VITE_USE_MOCK=false
```

`VITE_USE_MOCK=true` força as fixtures locais. A CLI lê o vínculo em `.insforge/project.json`:

```bash
npx -y @insforge/cli@latest current
npx -y @insforge/cli@latest db query "select * from sources limit 1"
```

### Edge Function `analyze-url`

A função recebe `{ "url": "https://..." }`, valida a URL contra SSRF, extrai o texto da matéria,
chama o OpenRouter e grava `news` + `analyses`. A análise fica disponível em `analysis_feed` e é
reutilizada nas próximas visitas.

```bash
# O segredo é server-side; nunca use prefixo VITE_ nem exponha no frontend.
npx -y @insforge/cli@latest secrets add OPENROUTER_API_KEY <chave>

npx -y @insforge/cli@latest functions deploy analyze-url \
  --file functions/analyze-url.ts \
  --name "Analyze URL"

npx -y @insforge/cli@latest functions invoke analyze-url \
  --data '{"url":"https://www12.senado.leg.br/noticias/materias/2023/12/20/congresso-promulga-reforma-tributaria"}'
```

Modelo padrão: `openai/gpt-4o-mini`. Para trocar, defina o segredo `OPENROUTER_MODEL`.

## Próximos passos

1. Gerar embeddings das matérias e usar `match_news` para montar clusters reais.
2. Enriquecer a análise com comparação entre veículos e séries temporais do Replay.
3. Adicionar rate limit e fila de análise para proteger o custo do OpenRouter.
4. Publicar a extensão Chrome reutilizando `DnaRadar` e `PolarizationMap`.

---

As telas de leitura usam o InsForge; se o backend estiver indisponível, os serviços caem para as
fixtures para preservar a navegação. A análise de URLs novas passa pela Edge Function e não gera
resultados fictícios em produção.
