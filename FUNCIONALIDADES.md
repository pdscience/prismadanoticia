# Funcionalidades — Prisma da Notícia

> Uma notícia. Vários ângulos.
>
> Plataforma de inteligência de narrativas que extrai uma matéria, analisa o enquadramento com
> IA, compara veículos e mostra o que ficou de fora da cobertura.

**Produção:** https://9aqdv427.insforge.site

A visão tela a tela, com fonte de dados e limites de cada rota, está em
[`PAGINAS.md`](./PAGINAS.md).

---

## 1. Visão geral

O Prisma da Notícia combina um frontend Vue 3/PWA com um backend PostgreSQL no InsForge. O usuário
cola o link de uma notícia e recebe:

- resumo em tópicos;
- índice de confiança;
- diversidade de fontes;
- radar de seis eixos do **DNA da Notícia**;
- evidências classificadas por força;
- sinais de alerta editorial;
- cluster semântico com matérias do mesmo fato;
- perspectivas por lado do enquadramento dentro do cluster;
- cartão compartilhável em PNG.

O sistema também oferece telas de comparação entre veículos, cobertura por distribuição de
enquadramento, mapa de polarização por estado e uma apresentação institucional da marca e da
tecnologia.

### Fluxo principal

```text
Link da notícia
      │
      ▼
Edge Function analyze-url
      │  valida URL, extrai texto e protege contra SSRF
      ▼
OpenRouter (análise + embedding)
      │
      ▼
PostgreSQL / InsForge
      │  news, analyses, clusters, analysis_feed
      ▼
Frontend Vue
      │
      ▼
DNA, confiança, evidências, cluster e cartão viral
```

---

## 2. Rotas e telas

| Rota          | Tela                   | Status                                             |
| ------------- | ---------------------- | -------------------------------------------------- |
| `/`           | Landing page           | Implementada; tendências e exemplo com dados reais |
| `/analise`    | Análise de notícia     | Implementada; IA e banco reais                     |
| `/vies`       | Radar de Enquadramento | Implementada; estimativa do texto e indícios       |
| `/comparacao` | Comparação de veículos | Implementada; dados reais com fallback             |
| `/cobertura`  | Cobertura da História  | Implementada; distribuição e alerta de ponto cego  |
| `/mapa`       | Mapa de Polarização    | Implementada; dados reais com fallback             |
| `/tecnologia` | Tecnologia e produto   | Vitrine conceitual                                 |
| `/marca`      | Brand Book             | Vitrine institucional                              |
| `*`           | 404                    | Implementada                                       |

### 2.1 Landing page (`/`)

- Hero animado com a proposta “Uma notícia. Vários ângulos.”.
- Explicação do funcionamento em etapas.
- Radar de demonstração do DNA.
- Cartões de tendências com temas, volume de veículos, matérias, variação e enquadramentos, lidos de
  `trend_feed` na janela real de 7 dias.
- Número de veículos analisados no hero, lido de `stats_feed`.
- Seções de recursos, moat, manifesto da marca e estratégia viral.
- Cartão de compartilhamento gerado a partir da análise de exemplo.
- CTAs para analisar uma notícia e conhecer a tecnologia.

### 2.2 Análise (`/analise`)

- Campo para colar a URL de uma notícia.
- Suporte a link direto com `?url=...`, permitindo compartilhar uma análise específica.
- Botão **Ver exemplo** para carregar a análise de referência.
- Pipeline visual de seis etapas durante o carregamento.
- Tratamento de erro com mensagem retornada pela Edge Function.
- Legenda expansível **Como ler esta análise**, abaixo do cabeçalho, com o significado do Índice
  Prisma, do cluster, da confiança, da diversidade de fontes, dos seis eixos, das evidências, das
  perspectivas e dos sinais.
- Resultado com:
  - título, veículo, autor, data, tempo de leitura e tema;
  - enquadramento dominante;
  - **Índice Prisma** (média dos seis eixos);
  - tamanho do cluster;
  - **Perspectivas nesta história**, com esquerda, centro, direita, lado ausente e amostra pequena;
  - resumo em três pontos;
  - anel de confiança com classificação textual;
  - diversidade de fontes;
  - radar interativo do DNA;
  - barras dos seis indicadores;
  - evidências com força `forte`, `média` ou `fraca` e o trecho literal que as sustenta;
  - sinais editoriais positivos e negativos;
  - atalho para Comparação;
  - cartão viral com download em PNG 1080×1080 e cópia do texto.

**Fonte dos dados:** `analysis_feed` para URLs já analisadas, `perspective_feed` para as
perspectivas do cluster e a Edge Function `analyze-url` para URLs novas. Uma falha real não é
substituída por resultado fictício; o painel de perspectivas fica vazio em vez de inventar lados.

### 2.3 Comparação Inteligente (`/comparacao`)

- Busca por tema na internet: a Edge Function `search-web` consulta o motor de busca do OpenRouter
  e devolve matérias reais sobre o tema.
- Seleção das matérias: até 4 matérias, uma por veículo, com portais de governo, enciclopédias, blogs
  e redes sociais descartados.
- Análise das matérias escolhidas com o mesmo Engine da Análise (extração, DNA, cluster) e
  comparação montada sobre as análises geradas.
- Tabela de veículos com destaque, ângulo predominante, tom e Índice Prisma.
- Seleção de um veículo para comparar seu DNA com a média do cluster.
- Radar sobreposto: veículo selecionado × média do cluster.
- Ranking dos eixos com maior divergência entre veículos.
- Leitura editorial resumida.

**Fonte dos dados:** `analysis_feed` filtrado por `topic_slug` na carga inicial; a busca web usa a
Edge Function `search-web` (com cache de 24 h em `web_searches`) e a Edge Function `analyze-url`
para as matérias novas. A tela descarta as fixtures de `exemplo.com.br`, mantém uma matéria por
veículo (a mais recente; em empate, a de maior confiança) e calcula a contagem de veículos e a
janela a partir das datas reais. Se o tema não tiver dados suficientes, usa a fixture local,
sinaliza “dados de demonstração” e informa qual tema de exemplo está sendo exibido.

### 2.4 Mapa de Polarização (`/mapa`)

- Mapa real do Brasil sobre tiles do OpenStreetMap, com as 27 unidades federativas coloridas.
- Modos de visualização:
  - tema dominante;
  - índice de polarização;
  - um modo por tema (Economia, Segurança, Meio Ambiente, Saúde, Política).
- Hover e seleção de estado.
- Painel do estado com veículos monitorados, tema dominante, distribuição temática e índice de
  polarização.
- Ranking dos estados mais polarizados.
- Mistura nacional de temas.
- Total de veículos monitorados.
- Contexto de uso para imprensa, universidades, institutos e API.

**Fonte dos dados:** `state_metrics`, com fallback local. O mapa, o painel do estado, o ranking e a
mistura nacional usam o mesmo conjunto carregado por `fetchStates()`. Os contornos das UFs vêm do
GeoJSON local em `src/data/geo/brazil-states.js` (IBGE, ODbL) e a base cartográfica do
OpenStreetMap.

**Limite:** os valores por UF são uma agregação de referência, não uma medição de opinião pública.
A tela não promete leitura por grupo de veículos nem atualização em tempo real.

### 2.5 Tecnologia (`/tecnologia`)

Vitrine conceitual da arquitetura:

- stack de frontend, backend e inteligência;
- pipeline de seis etapas;
- explicação de reaproveitamento de embeddings e clusters;
- modelo de dados;
- mockup de PWA;
- mockup da extensão Chrome;
- racional de crescimento por hábito.

> Esta tela apresenta a visão de produto. A extensão Chrome, notificações e favoritos ainda não
> estão publicados.

### 2.6 Brand Book (`/marca`)

- DNA e arquétipos da marca.
- Logo nas versões horizontal, vertical e ícone.
- Paleta premium com códigos hexadecimais.
- Tipografia Space Grotesk + Inter.
- Estrutura do pitch deck de 20 slides.

### 2.7 404

- Página “Este ângulo não existe.” com retorno para a home e para a análise.

### 2.8 Radar de Enquadramento (`/vies`)

- Campo para colar a URL de uma notícia já analisada.
- Leitura da orientação do texto em duas escalas independentes:
  - econômica: Estado/regulação × mercado/desregulação;
  - social/cultural: progressista × conservador.
- Bússola política com posição do texto, valores dos dois eixos e rótulo geral.
- Rótulo “mista / ambígua” quando as escalas divergem mais de 50 pontos.
- Confiança do texto limitada a 85 para evitar falsa precisão.
- Card “Quem publicou” com duas camadas:
  - estimativa baseada apenas nesta matéria;
  - perfil curado, ainda não cadastrado para veículos reais.
- Card de indícios de distorção com:
  - risco retórico de 0 a 100;
  - lado aparentemente beneficiado;
  - sinais como manchete x corpo, contexto ausente, linguagem carregada, fonte anônima,
    ausência de contraditório e conclusão unilateral;
  - trecho literal e explicação para cada sinal.
- Lista de evidências citadas do texto.
- Sem URL na rota, a tela carrega o enquadramento real mais recente já calculado; quando não há
  dado, exibe o selo “exemplo ilustrativo”.
- Bloco de metodologia e limites: não é checagem de fatos e não classifica o veículo de forma
  permanente.
- Atalhos para DNA completo e Comparação.
- Cache por matéria e versão da metodologia; o limite é 20 análises de viés por IP/hora e 100
  globais/hora.

### 2.9 Cobertura da História (`/cobertura`)

- Campo para abrir uma matéria já analisada por URL.
- Link direto por cluster vindo da Análise, da Comparação ou do card de perspectivas.
- Barra de distribuição esquerda/centro/direita com porcentagens que somam 100%.
- Contagem de veículos classificados, selo de amostra pequena e alerta de ponto cego.
- Três colunas com veículos e manchetes, uma linha por veículo.
- Rating curado do veículo como contexto, quando cadastrado; caso contrário, **sem rating curado**.
- Seção separada para enquadramentos incertos/mistos.
- Metodologia visível e limites: não é checagem de fatos, ranking de qualidade nem prova de
  intenção editorial.

**Fonte dos dados:** `analysis_feed` para a manchete e o cluster, `perspective_feed` para as
coberturas e `source_bias_profiles` para ratings curados. A página não dispara `analyze-url` e não
usa fallback fictício.

---

## 3. Recursos transversais

- **Tema claro/escuro:** Midnight é o padrão; a preferência fica salva em `localStorage`.
- **Navegação responsiva:** menu desktop, menu mobile e CTA fixo no cabeçalho.
- **Animações de entrada:** reveal por scroll com Motion.
- **Respeito a movimento reduzido:** `prefers-reduced-motion` desativa as animações de entrada.
- **Rotas com lazy loading:** cada tela é carregada sob demanda.
- **Títulos de página por rota:** atualização automática de `document.title`.
- **PWA:** manifest, ícones, instalação e cache do app shell/fontes.
- **Fallback de dados:** a comparação usa fixtures quando o backend falha e exibe o selo “dados de
  demonstração”, informando qual exemplo está sendo mostrado. A análise de URL nova, o Radar de
  Enquadramento e as tendências não fabricam resultado em produção: elas mostram estado de erro ou
  estado vazio.
- **Acessibilidade:** rótulos ARIA, `sr-only`, navegação por teclado e tabelas semânticas.
- **Cartão viral:** SVG com radar, exportação em PNG e cópia de texto para redes sociais.

> O modo offline cobre o app shell e os assets em cache. Consultas novas ao backend continuam
> exigindo rede.

---

## 4. Pipeline de IA e inteligência

### 4.1 Etapas exibidas no produto

1. **Extrai o texto** — limpeza de HTML, remoção de boilerplate e normalização.
2. **Descobre o tema** — classificação de assunto, entidades e enquadramento.
3. **Gera embeddings** — vetorização semântica do conteúdo.
4. **Agrupa notícias** — clusterização de matérias sobre o mesmo fato.
5. **Calcula indicadores** — DNA, confiança e diversidade de fontes.
6. **Explica** — justificativa legível para cada indicador.

### 4.2 Implementação real

- Extração de título, veículo, autor, data, descrição e parágrafos.
- Validação SSRF: bloqueio de hosts privados e limite de redirecionamentos.
- Limite de tamanho da página e verificação de `content-type`.
- Chamada ao OpenRouter com modelo padrão `openai/gpt-4o-mini`.
- Resposta JSON estruturada com resumo, DNA, confiança, evidências e sinais.
- Embedding de 1536 dimensões com `openai/text-embedding-3-small`.
- Busca por similaridade via `match_news` no pgvector.
- Entrada no cluster mais próximo (`>= 0,78`) ou criação/reutilização de cluster do tema.
- Cache por URL em `analysis_feed`.
- Falha de embedding não impede o salvamento da análise.
- O Radar de Enquadramento lê o texto já salvo, estima dois eixos e grava `bias_analyses`.
- O resultado fica em `bias_feed` e é reutilizado por matéria + versão da metodologia.

### 4.3 DNA da Notícia

| Eixo       | O que mede    | Interpretação                                    |
| ---------- | ------------- | ------------------------------------------------ |
| Emoção     | intensidade   | Carga afetiva, dramatização e adjetivação        |
| Fontes     | variedade     | Número de vozes e presença de contraditório      |
| Evidências | sustentação   | Dados, documentos, citações e links verificáveis |
| Persuasão  | linguagem     | Recursos retóricos que induzem conclusão         |
| Equilíbrio | pluralidade   | Espaço dado a diferentes versões do debate       |
| Narrativa  | enquadramento | Ângulo pelo qual o fato é contado                |

Os enquadramentos canônicos são Política, Economia, Segurança, Meio Ambiente, Saúde, Social e
Jurídico.

---

## 5. Backend e modelo de dados

Projeto InsForge **Prismadanoticia**, PostgreSQL com pgvector.

| Tabela / objeto        | Função                                                         |
| ---------------------- | -------------------------------------------------------------- |
| `sources`              | Veículos, escopo e região                                      |
| `topics`               | Temas, slug, acento, score de tendência e visibilidade         |
| `clusters`             | Agrupamentos de matérias sobre o mesmo fato                    |
| `news`                 | Matérias, texto limpo, URL, fonte, tema, cluster e embedding   |
| `analyses`             | DNA, confiança, diversidade, resumo, evidências e sinais       |
| `analysis_feed`        | View pública que junta análise, notícia, fonte, tema e cluster |
| `perspective_feed`     | View pública de coberturas do cluster por enquadramento        |
| `state_metrics`        | Indicadores por UF para o mapa                                 |
| `trend_feed`           | View pública com a cobertura real por tema nos últimos 7 dias  |
| `stats_feed`           | View pública com a contagem real de veículos, análises e temas |
| `analysis_requests`    | Registros de rate limit por IP e URL                           |
| `bias_analyses`        | Eixos, confiança, veículo estimado e sinais de enquadramento   |
| `source_bias_profiles` | Perfis curados de veículos (estrutura pronta, sem seed real)   |
| `bias_feed`            | View pública com notícia, análise de viés e perfil curado      |
| `bias_requests`        | Registros de rate limit do Radar de Enquadramento              |
| `match_news(...)`      | RPC de busca por similaridade com pgvector                     |

### Leitura e escrita

- O frontend lê com a chave anônima e RLS de leitura pública.
- A Edge Function escreve com cliente administrativo.
- Não há cadastro/login de usuário nesta versão.
- O schema, as políticas de RLS e o seed ficam em `migrations/`.

---

## 6. Segurança, limites e resiliência

- **RLS:** leitura pública somente nas tabelas expostas; escrita via service role.
- **Segredos server-side:** `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`,
  `OPENROUTER_EMBEDDING_MODEL`, `OPENROUTER_BIAS_MODEL` e `RATE_LIMIT_SALT` nunca usam prefixo
  `VITE_`.
- **Rate limit:** 10 análises novas por IP/hora e 100 por hora no projeto; 20 análises de
  enquadramento por IP/hora e 100 globais/hora.
- **Cache:** URLs já analisadas não consomem cota e não chamam a IA novamente.
- **IP:** armazenado apenas como hash SHA-256 com salt.
- **Resposta 429:** inclui `Retry-After: 3600`.
- **Fallback:** falha do backend não derruba as telas de leitura.
- **Erros reais:** análise de URL nova não inventa resultado quando a IA falha.

---

## 7. Qualidade e operação

- Testes unitários e de integração com Vitest.
- ESLint e Prettier.
- Build de produção com Vite e geração do service worker.
- Deploy do frontend via InsForge Deployments/Vercel.
- Deploy da Edge Function via InsForge CLI.
- Migrations versionadas em `migrations/`.
- CI configurada em `.github/workflows/ci.yml`.

Comandos principais:

```bash
npm run dev
npm run lint
npm run format:check
npm run test:run
npm run build
```

---

## 8. Escopo atual e roadmap

### Já implementado

- Landing, análise, enquadramento, comparação, cobertura, mapa, tecnologia, marca e 404.
- Análise real por URL com IA.
- Cache de análises.
- Embeddings e clusters semânticos.
- Perspectivas por lado do enquadramento dentro do cluster, com lados ausentes e aviso de amostra
  pequena.
- Cobertura da História com distribuição percentual, alerta de ponto cego e rating curado como
  contexto.
- Rate limit por IP e global.
- Radar de Enquadramento com escalas econômica/social, estimativa do veículo e indícios de
  distorção.
- Perfis curados de veículos: estrutura criada, sem rótulos reais nesta versão.
- PWA instalável.
- Cartão compartilhável em PNG.
- Tema claro/escuro.
- Deploy em produção.

### Aposentado

- BlindSpot Brasil e Prisma Replay saíram do produto. As telas foram removidas e as rotas antigas
  caem no 404. As tabelas `blindspot_*` e `replay_events` permanecem no banco, sem uso pelo front.

### Roadmap / ainda não publicado

- Extensão Chrome funcional (a tela de tecnologia é conceitual).
- Notificações de mudança de narrativa.
- Favoritos e conta de usuário.
- Leitura offline das análises já visitadas.
- Backfill de embeddings para todas as matérias antigas.
- Cadastro de perfis curados de veículos com metodologia e referência pública.
- Limpeza agendada de `analysis_requests` e `bias_requests`.
- Monitoramento de custo do OpenRouter.
- Domínio customizado.
- API pública por UF.
- Séries temporais de cobertura por tema (extensão natural do Replay aposentado).

---

## 9. Stack

| Camada       | Tecnologia                                |
| ------------ | ----------------------------------------- |
| Frontend     | Vue 3, Vite, Tailwind CSS v4, Motion, PWA |
| Roteamento   | Vue Router 4 com lazy loading             |
| Backend      | InsForge, PostgreSQL, Edge Functions      |
| Inteligência | OpenRouter, pgvector, embeddings          |
| Testes       | Vitest, Vue Test Utils, jsdom             |
| Deploy       | InsForge Deployments (Vercel)             |

---

## 10. Documentação relacionada

- `README.md` — instalação, comandos, deploy e configuração.
- `AGENTS.md` — notas operacionais e padrões do projeto.
- `migrations/` — schema, RLS, views, RPC e seed.
- `functions/analyze-url.ts` — pipeline de extração, IA, cache, rate limit e clusters.
