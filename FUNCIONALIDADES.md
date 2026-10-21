# Funcionalidades — Prisma da Notícia

> Uma notícia. Vários ângulos.
>
> Plataforma de inteligência de narrativas que extrai uma matéria, analisa o enquadramento com
> IA, compara veículos e mostra o que ficou de fora da cobertura.

**Produção:** https://9aqdv427.insforge.site

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
- cartão compartilhável em PNG.

O sistema também oferece telas de comparação entre veículos, detecção de blindspots, replay da
narrativa, mapa de polarização por estado e uma apresentação institucional da marca e da
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
| `/blindspot`  | BlindSpot Brasil       | Implementada; dados reais com fallback             |
| `/replay`     | Prisma Replay          | Implementada; dados reais com fallback             |
| `/mapa`       | Mapa de Polarização    | Implementada; dados reais com fallback             |
| `/tecnologia` | Tecnologia e produto   | Vitrine conceitual                                 |
| `/marca`      | Brand Book             | Vitrine institucional                              |
| `*`           | 404                    | Implementada                                       |

### 2.1 Landing page (`/`)

- Hero animado com a proposta “Uma notícia. Vários ângulos.”.
- Explicação do funcionamento em etapas.
- Radar de demonstração do DNA.
- Cartões de tendências com temas, volume de veículos, matérias, variação e enquadramentos.
- Seções de recursos, moat, manifesto da marca e estratégia viral.
- Cartão de compartilhamento gerado a partir da análise de exemplo.
- CTAs para analisar uma notícia e conhecer a tecnologia.

### 2.2 Análise (`/analise`)

- Campo para colar a URL de uma notícia.
- Suporte a link direto com `?url=...`, permitindo compartilhar uma análise específica.
- Botão **Ver exemplo** para carregar a análise de referência.
- Pipeline visual de seis etapas durante o carregamento.
- Tratamento de erro com mensagem retornada pela Edge Function.
- Resultado com:
  - título, veículo, autor, data, tempo de leitura e tema;
  - enquadramento dominante;
  - **Índice Prisma** (média dos seis eixos);
  - tamanho do cluster;
  - resumo em três pontos;
  - anel de confiança com classificação textual;
  - diversidade de fontes;
  - radar interativo do DNA;
  - barras dos seis indicadores;
  - evidências com força `forte`, `média` ou `fraca`;
  - sinais editoriais positivos e negativos;
  - atalhos para Comparação, BlindSpot e Replay;
  - cartão viral com download em PNG 1080×1080 e cópia do texto.

**Fonte dos dados:** `analysis_feed` para URLs já analisadas. URLs novas são enviadas para a Edge
Function `analyze-url`. Uma falha real não é substituída por resultado fictício.

### 2.3 Comparação Inteligente (`/comparacao`)

- Busca por tema.
- Tabela de veículos com destaque, ângulo predominante, tom e Índice Prisma.
- Seleção de um veículo para comparar seu DNA com a média do cluster.
- Radar sobreposto: veículo selecionado × média do cluster.
- Ranking dos eixos com maior divergência entre veículos.
- Leitura editorial resumida.
- Atalhos para BlindSpot e Replay.

**Fonte dos dados:** `analysis_feed` filtrado por `topic_slug`. Se o tema não tiver dados
suficientes, a tela usa a fixture local para preservar a navegação.

### 2.4 BlindSpot Brasil (`/blindspot`)

- Busca por tema.
- Filtro de período: 7, 15, 30 ou 90 dias.
- Indicador de confiabilidade crescente conforme o período aumenta.
- Lista de veículos que cobriram o tema, com volume de matérias.
- Lista de veículos que não publicaram no período, com alcance, severidade e última menção.
- Barras de subtemas pouco explorados.
- Aviso metodológico explícito: ausência de cobertura não implica intenção editorial.
- Atalhos para Comparação e Mapa.

**Fonte dos dados:** `blindspot_reports`, `blindspot_coverage`, `blindspot_gaps` e
`blindspot_subthemes`, com fallback local.

### 2.5 Prisma Replay (`/replay`)

- Player com play/pause e avanço automático entre quadros.
- Linha do tempo arrastável.
- Cinco quadros com horário, rótulo, veículos, enquadramento dominante e sentimento.
- Descrição da evolução da narrativa em cada quadro.
- Barra de mistura de enquadramentos.
- Gráfico de expansão da cobertura por número de veículos.
- Atalhos para Comparação e BlindSpot.

**Fonte dos dados:** `replay_events`, com fallback local.

### 2.6 Mapa de Polarização (`/mapa`)

- Cartograma com as 27 unidades federativas.
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

**Fonte dos dados:** `state_metrics`, com fallback local.

### 2.7 Tecnologia (`/tecnologia`)

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

### 2.8 Brand Book (`/marca`)

- DNA e arquétipos da marca.
- Logo nas versões horizontal, vertical e ícone.
- Paleta premium com códigos hexadecimais.
- Tipografia Space Grotesk + Inter.
- Estrutura do pitch deck de 20 slides.

### 2.9 404

- Página “Este ângulo não existe.” com retorno para a home e para a análise.

### 2.10 Radar de Enquadramento (`/vies`)

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
- Bloco de metodologia e limites: não é checagem de fatos e não classifica o veículo de forma
  permanente.
- Atalhos para DNA completo, Comparação e BlindSpot.
- Cache por matéria e versão da metodologia; o limite é 20 análises de viés por IP/hora e 100
  globais/hora.

---

## 3. Recursos transversais

- **Tema claro/escuro:** Midnight é o padrão; a preferência fica salva em `localStorage`.
- **Navegação responsiva:** menu desktop, menu mobile e CTA fixo no cabeçalho.
- **Animações de entrada:** reveal por scroll com Motion.
- **Respeito a movimento reduzido:** `prefers-reduced-motion` desativa as animações de entrada.
- **Rotas com lazy loading:** cada tela é carregada sob demanda.
- **Títulos de página por rota:** atualização automática de `document.title`.
- **PWA:** manifest, ícones, instalação e cache do app shell/fontes.
- **Fallback de dados:** telas de leitura usam fixtures quando o backend falha, sem quebrar a
  navegação.
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
| `state_metrics`        | Indicadores por UF para o mapa                                 |
| `replay_events`        | Quadros da evolução da narrativa                               |
| `blindspot_reports`    | Relatórios de blindspot por tema                               |
| `blindspot_coverage`   | Veículos que cobriram o tema                                   |
| `blindspot_gaps`       | Veículos ausentes e severidade                                 |
| `blindspot_subthemes`  | Subtemas e percentual de cobertura                             |
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

- Landing, análise, comparação, BlindSpot, Replay, mapa, tecnologia, marca e 404.
- Análise real por URL com IA.
- Cache de análises.
- Embeddings e clusters semânticos.
- Rate limit por IP e global.
- Radar de Enquadramento com escalas econômica/social, estimativa do veículo e indícios de
  distorção.
- Perfis curados de veículos: estrutura criada, sem rótulos reais nesta versão.
- PWA instalável.
- Cartão compartilhável em PNG.
- Tema claro/escuro.
- Deploy em produção.

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
