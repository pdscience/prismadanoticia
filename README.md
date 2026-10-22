# PRISMA DA NOTÍCIA

> Uma notícia. Vários ângulos.
> **MediaTech · AI · News Intelligence** — [prismadanoticia.com.br](https://prismadanoticia.com.br)

Front-end em **Vue 3 puro** (Composition API + `<script setup>`), construído a partir do
Brand Book Premium V1.0.

> A notícia não muda. O que muda é o ângulo pelo qual ela é apresentada.

---

## Stack

| Camada       | Tecnologia                                      |
| ------------ | ----------------------------------------------- |
| Front-end    | Vue 3, Vite, Tailwind CSS v4, Motion, PWA       |
| Roteamento   | Vue Router 4 (lazy loading por rota)            |
| Mapas        | Leaflet + OpenStreetMap (tiles) e GeoJSON local |
| Back-end     | InsForge, PostgreSQL, Edge Functions            |
| Inteligência | OpenRouter, pgvector, Embeddings                |

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
│  ├─ bias/                   # Bússola política, perfil do veículo e indícios
│  └─ intel/                  # PolarizationMap (mapa OSM), ShareCard (cartão viral)
├─ composables/               # useReveal (scroll reveal + contadores), useTheme
├─ data/                      # Frames canônicos, fixtures por domínio e barrel
├─ lib/                       # Cliente InsForge, radar, cores, análise e serviços
├─ router/index.js
└─ views/                     # Home, Analysis, Bias, Compare, Coverage, Map, Tech, Brand, 404
functions/analyze-url.ts      # Edge Function: extrai matéria, analisa com IA e grava no banco
functions/search-web.ts       # Edge Function: busca matérias na internet por tema
functions/analyze-bias.ts     # Edge Function: lê matéria salva e estima enquadramento
migrations/                   # Schema, RLS, views, RPC e seed do InsForge
tests/unit/                   # Testes Vitest de dados e helpers
```

## Rotas × Brand Book

| Rota          | Capítulo              | Conteúdo                                                                                 |
| ------------- | --------------------- | ---------------------------------------------------------------------------------------- |
| `/`           | Cap. 1, 3, 14         | Landing premium: hero animado, como funciona, tendências, manifesto, cartão viral        |
| `/analise`    | Cap. 4                | Tela de Análise: Resumo IA, Confiança, Diversidade de Fontes, Evidências, DNA da Notícia |
| `/vies`       | Cap. 4                | Radar de Enquadramento: escalas econômica/social, veículo e indícios de distorção        |
| `/comparacao` | Cap. 5                | Comparação Inteligente entre veículos + radar sobreposto                                 |
| `/mapa`       | Moat                  | Mapa de Polarização por estado (OpenStreetMap, 27 UFs)                                   |
| `/tecnologia` | Cap. 8, 9, 10, 11, 12 | Stack, Prisma Engine, Banco Inteligente, PWA, Extensão Chrome                            |
| `/marca`      | Cap. 1, 2, 13         | DNA da marca, arquétipos, logo, paleta, tipografia, Pitch Deck                           |

A descrição detalhada de cada tela, com fonte de dados, estados de demonstração e limites, está em
[`PAGINAS.md`](./PAGINAS.md).

## Identidade visual

**Paleta Premium**

| Cor                 | Hex       | Uso                              |
| ------------------- | --------- | -------------------------------- |
| Midnight            | `#05091A` | Fundo padrão                     |
| Electric Blue       | `#2D6BFF` | Ação primária e dados            |
| Prism Purple        | `#8B5CF6` | Inteligência e IA                |
| Energy Red          | `#FF3B5C` | Alerta e sinais editoriais       |
| Insight Gold        | `#FFC24B` | Descoberta e destaque            |
| Signal Mint (apoio) | `#2EE6A8` | Evidências sustentadas e sucesso |

**Tipografia**: Space Grotesk (logo e títulos) · Inter (interface).

As cores dos **enquadramentos** (Política, Economia, Segurança, Meio Ambiente, Saúde, Social,
Jurídico) têm fonte única em `FRAMES`, dentro de `src/data/frames.js`. Mapa e hero leem
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
como padrão da marca, ícones próprios e cache offline do app shell, assets e fontes. As consultas
de análise novas ao backend continuam exigindo rede; leitura offline de análises está no roadmap.

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

O frontend está publicado em **https://9aqdv427.insforge.site** e o backend fica no projeto
**Prismadanoticia** (`https://9aqdv427.us-east.insforge.app`). As variáveis ficam em `.env`
(nunca commitar):

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

Depois da análise, a função gera um embedding de 1536 dimensões com
`openai/text-embedding-3-small` (configurável em `OPENROUTER_EMBEDDING_MODEL`) e usa
`match_news` para entrar no cluster mais próximo (similaridade de cosseno `>= 0.78`) ou criar um
cluster para o tema. Se o embedding falhar, a análise ainda é salva.

### Edge Function `analyze-bias`

A função recebe `{ "url": "https://..." }` de uma matéria que já passou por `analyze-url`. Ela
lê o texto salvo, estima a orientação em duas escalas (econômica e social/cultural), separa a
leitura do veículo e lista indícios retóricos de distorção. O resultado fica em `bias_feed` e é
reutilizado nas próximas visitas.

```bash
npx -y @insforge/cli@latest functions deploy analyze-bias \
  --file functions/analyze-bias.ts \
  --name "Analyze Bias"
```

Modelo padrão: `openai/gpt-4o-mini`. Para trocar, defina `OPENROUTER_BIAS_MODEL`.

### Views de leitura (`trend_feed` e `stats_feed`)

Duas views públicas, criadas na migration `20261021160000_add-trend-stats-views.sql`, alimentam a
landing com números reais:

- `trend_feed` agrega, por tema, os veículos e as matérias publicados nos **últimos 7 dias**
  (`coalesce(published_at, created_at)`), com a variação contra a janela de 7 dias anterior.
- `stats_feed` devolve a contagem de veículos realmente analisados, de análises e de temas.

Ambas ignoram o veículo de demonstração (`veiculo-de-exemplo`). Em produção, a falha de consulta
não vira número fictício: a seção de tendências mostra estado de erro e o hero exibe `—` até haver
dado.

### Build e deploy do frontend

O `vercel.json` fixa `installCommand`, `buildCommand` e `outputDirectory`, e o `.vercelignore`
mantém as edge functions, migrations, testes e documentação fora do upload do frontend.

Atenção: a CLI do InsForge exclui do upload qualquer pasta chamada `coverage` (pensada para
relatório de cobertura de testes). Por isso os componentes da Cobertura vivem em
`src/components/cobertura/`. Renomear a pasta quebra o build no Vercel com
`UNLOADABLE_DEPENDENCY`.

### Limites e deploy do frontend

Cada IP pode disparar 10 análises novas por hora; o projeto também tem um teto global de 100 por
hora. URLs já analisadas são servidas do cache e não consomem o limite. O hash do IP usa o segredo
`RATE_LIMIT_SALT` e os registros ficam em `analysis_requests`.

O Radar de Enquadramento tem limite próprio: 20 análises de viés por IP/hora e 100 globais/hora.
Os registros ficam em `bias_requests`. Perfis curados de veículos ainda não são cadastrados nesta
versão; a página mostra a estimativa da matéria e deixa a estrutura pronta para curadoria.

```bash
npx -y @insforge/cli@latest deployments env set VITE_INSFORGE_URL https://9aqdv427.us-east.insforge.app
npx -y @insforge/cli@latest deployments env set VITE_INSFORGE_ANON_KEY <anon-key>
npx -y @insforge/cli@latest deployments env set VITE_USE_MOCK false
npx -y @insforge/cli@latest deployments deploy .
```

## Próximos passos

1. Enriquecer a comparação com séries temporais de cobertura por tema.
2. Cadastrar perfis curados de veículos com metodologia e fontes públicas.
3. Limpar periodicamente `analysis_requests` e `bias_requests` e monitorar consumo no OpenRouter.
4. Publicar a extensão Chrome reutilizando `DnaRadar` e `PolarizationMap`.

---

As telas de leitura usam o InsForge; se o backend estiver indisponível, os serviços caem para as
fixtures para preservar a navegação. A análise de URLs novas passa pela Edge Function e não gera
resultados fictícios em produção.
