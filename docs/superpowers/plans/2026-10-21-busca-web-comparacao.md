# Busca web na Comparação Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer o campo de tema da página `/comparacao` pesquisar matérias reais na internet, deixar o usuário escolher até 4 e devolver a comparação das coberturas entre os veículos.

**Architecture:** Uma edge function (`search-web`) busca candidatas e devolve URLs cruas; a normalização acontece no front, em lógica pura testável (`src/lib/websearch.js`). As URLs escolhidas passam pela função existente `analyze-url`, que agora aceita o tema pesquisado para persistir a matéria. A comparação é remontada sobre as análises geradas (`src/lib/comparison.js`), sem inventar veículo, lado ou rating.

**Tech Stack:** Vue 3, Vue Router, InsForge SDK (Postgres + Edge Functions), OpenRouter (plugin `web`), Vitest, Vue Test Utils, Tailwind.

**Spec:** `docs/superpowers/specs/2026-10-21-busca-web-comparacao-design.md`

## Global Constraints

- A busca usa o plugin `web` do OpenRouter com a chave já configurada; nenhum segredo novo em `VITE_`.
- Máximo de 6 candidatos na tela, uma matéria por veículo; o usuário marca no máximo 4.
- Portais de governo, enciclopédias, blogs e redes sociais são descartados na normalização.
- Matérias sem texto extraível ou paywalled ficam de fora, e a tela informa quantas foram descartadas.
- A busca é cacheada por 24 h em `web_searches`; repetir o tema não gasta IA.
- Limites: 10 buscas por IP/hora e 50 globais/hora na busca; 10 análises novas por IP/hora no
  `analyze-url`.
- Nenhuma tela nova: a feature vive dentro de `/comparacao`.
- A comparação continua sendo descritiva; não é ranking de qualidade.
- Não commitar nem fazer deploy sem pedido explícito.
- Rodar `npm run test:run`, `npm run lint`, `npm run format:check` e `npm run build` ao final.

---

### Task 1: Edge function de busca

**Files:**

- Create: `functions/search-web.ts`
- Create: `migrations/20261021150000_add-web-searches.sql`

**Interfaces:**

- Consumes: `OPENROUTER_API_KEY` (obrigatório), `OPENROUTER_SEARCH_MODEL` (opcional, padrão
  `openai/gpt-4o-mini`), `RATE_LIMIT_SALT` (obrigatório para o hash do IP).
- Produces: `POST { topic }` → `{ results: [{ url, title, outlet }], cached, searchedAt }`; erros
  `400` (tema vazio), `429` (limite excedido) e `502` (OpenRouter indisponível).

- [ ] **Step 1: Criar a tabela de cache**

Criar `public.web_searches` com `query` única, `results jsonb`, `ip_hash`, `created_at` e índice
por `query` e por `created_at desc`. Liberar `select` para `anon`/`authenticated`.

- [ ] **Step 2: Implementar a função**

Validar o tema, normalizar para `slug`, consultar o cache, e, quando ausente, chamar o OpenRouter
com `plugins: [{ id: 'web', max_results: 10 }]`, extrair as citações retornadas e salvar o resultado.
Aplicar o rate limit por IP/hora e o teto global.

- [ ] **Step 3: Implantar e invocar**

```bash
npx -y @insforge/cli@latest db migrations up --all
npx -y @insforge/cli@latest functions deploy search-web --file functions/search-web.ts
npx -y @insforge/cli@latest functions invoke search-web --data '{"topic":"reforma tributária"}'
```

Expected: devolve candidatas reais e `cached: false` na primeira chamada.

- [ ] **Step 4: Checkpoint**

Revisar o diff e confirmar que nenhum segredo foi para o arquivo.

---

### Task 2: Normalização dos candidatos

**Files:**

- Create: `src/lib/websearch.js`
- Test: `tests/unit/websearch.spec.js`

**Interfaces:**

- Produces:
  - `normalizeSearchResults(results, limit = MAX_CANDIDATES)`
  - `isBlockedHost(host)`
  - `outletName(url)`, `outletLabel(url, fallback)`
  - `MAX_CANDIDATES = 6`, `MAX_SELECTION = 4`

- [ ] **Step 1: Escrever os testes que falham**

Cobrir: descarte de domínio bloqueado, dedup por host, limite de candidatos, ordem com veículos
conhecidos primeiro e estado vazio.

- [ ] **Step 2: Rodar e confirmar a falha**

Run: `npx vitest run tests/unit/websearch.spec.js`

Expected: falha por módulo inexistente.

- [ ] **Step 3: Implementar a normalização**

Mapear cada resultado em `{ url, title, outlet, host }`, descartar bloqueados e duplicados de host,
e devolver no máximo `MAX_CANDIDATES` itens.

- [ ] **Step 4: Rodar os testes**

Run: `npx vitest run tests/unit/websearch.spec.js`

Expected: todos passando.

---

### Task 3: Persistência da matéria sob o tema pesquisado

**Files:**

- Modify: `functions/analyze-url.ts`

**Interfaces:**

- Consumes: body `{ url, topic? }`.
- Produces: a análise passa a ser gravada em `news.topic_id` com o tema informado, em vez do tema
  inferido pelo modelo.

- [ ] **Step 1: Aceitar `topic` opcional**

Ler `topic` do body e usá-lo para localizar ou criar o `topics` correspondente antes do
`upsert` de `news` e `analyses`.

- [ ] **Step 2: Implantar e verificar**

```bash
npx -y @insforge/cli@latest functions deploy analyze-url --file functions/analyze-url.ts
```

Expected: a análise com `topic` aparece em `analysis_feed` com o `topic_slug` pesquisado.

- [ ] **Step 3: Checkpoint**

Revisar o diff da função.

---

### Task 4: Orquestração no serviço

**Files:**

- Modify: `src/lib/services.js`
- Modify: `src/lib/comparison.js`

**Interfaces:**

- Produces:
  - `searchWebCoverage(topic)` → candidatos normalizados
  - `analyzeArticles(urls, topic, onProgress)` → `{ rows, failed }`
  - `analysisRows(analyses)` e `buildComparisonFromAnalyses(analyses, topic)` em
    `src/lib/comparison.js`

- [ ] **Step 1: Implementar `searchWebCoverage`**

Invocar a função `search-web` e passar o resultado por `normalizeSearchResults`; erro real vira
exceção com mensagem, sem fixture.

- [ ] **Step 2: Implementar `analyzeArticles`**

Analisar no máximo 4 URLs com 2 workers em paralelo, reportando progresso e coletando as falhas
individuais em `failed`.

- [ ] **Step 3: Montar a comparação a partir das análises**

Reaproveitar `buildComparison` sobre as linhas geradas, preservando o descarte de URLs de
`exemplo.com.br` e a ordenação por matéria mais recente.

- [ ] **Step 4: Checkpoint**

Revisar o diff dos dois arquivos.

---

### Task 5: Tela da Comparação

**Files:**

- Modify: `src/views/CompareView.vue`
- Test: `tests/unit/compare-view.spec.js`

**Interfaces:**

- Consumes: `searchWebCoverage`, `analyzeArticles` e `fetchComparison` de `@/lib/services`.
- Produces: máquina de estados `idle → searching → choosing → analyzing`, com lista de candidatas,
  progresso, erros visíveis e selo de origem da comparação.

- [ ] **Step 1: Escrever o teste da view**

Cobrir: envio do tema dispara a busca, a seleção alimenta a análise e o erro da busca aparece na
tela (funções mockadas, com `IntersectionObserver` stubado).

- [ ] **Step 2: Rodar e confirmar a falha**

Run: `npx vitest run tests/unit/compare-view.spec.js`

Expected: falha por fluxo ausente.

- [ ] **Step 3: Implementar o fluxo**

Adicionar o estado da busca, a lista com checkbox, o limite de 4 seleções, o indicador de progresso
`Analisando X de N…` e a montagem final da comparação com as análises geradas.

- [ ] **Step 4: Rodar os testes**

Run: `npx vitest run tests/unit/compare-view.spec.js`

Expected: todos passando.

---

### Task 6: Verificação ao vivo

- [ ] **Step 1: Buscar um tema real**

Invocar `search-web` e confirmar que as URLs devolvidas são de veículos distintos.

- [ ] **Step 2: Analisar as candidatas escolhidas**

Rodar a comparação na interface e confirmar três pontos: a tabela mostra os veículos, a janela vem
das datas reais e o selo de origem da comparação está presente.

- [ ] **Step 3: Conferir o custo e os limites**

Confirmar que a segunda busca do mesmo tema vem do cache (`cached: true`) e que as análises
seguem consumindo cota apenas na primeira vez.

---

### Task 7: Documentação do produto

**Files:**

- Modify: `PAGINAS.md`
- Modify: `FUNCIONALIDADES.md`
- Modify: `AGENTS.md`

- [ ] **Step 1: Atualizar `PAGINAS.md`**

Descrever o fluxo buscar → escolher → comparar, a origem dos dados e os limites (teto de 4
matérias, custo por análise, paywall).

- [ ] **Step 2: Atualizar `FUNCIONALIDADES.md`**

Incluir a busca web na seção da Comparação e a função nova no inventário de edge functions.

- [ ] **Step 3: Atualizar `AGENTS.md`**

Registrar `search-web`, o campo `topic` de `analyze-url`, os limites de cota e o comando de deploy.

- [ ] **Step 4: Formatar docs**

Run: `npx prettier --write PAGINAS.md FUNCIONALIDADES.md AGENTS.md`

---

### Task 8: Verificação final

- [ ] **Step 1: Rodar a suíte completa**

Run: `npm run test:run`

Expected: todas as suítes passando.

- [ ] **Step 2: Rodar lint**

Run: `npm run lint`

Expected: sem erros.

- [ ] **Step 3: Rodar formatação**

Run: `npm run format:check`

Expected: sem divergências.

- [ ] **Step 4: Rodar build**

Run: `npm run build`

Expected: build concluído.

- [ ] **Step 5: Revisar o diff final**

Run: `git status --short && git diff --stat`

Expected: somente arquivos previstos; sem segredos, `.env` ou `dist` versionado.

- [ ] **Step 6: Encerrar sem commit/deploy**

Não commitar nem publicar sem pedido explícito. Informar o que foi implementado e os resultados
dos comandos.

---

## Self-Review

- **Cobertura da spec:** busca, filtro, escolha, análise, persistência pelo tema, limites, custo,
  testes e documentação estão nas Tasks 1–8.
- **Placeholders:** não há TBD/TODO; os testes e implementações centrais têm código.
- **Consistência de tipos:** `normalizeSearchResults` sempre devolve `{ url, title, outlet, host }`;
  `analyzeArticles` sempre devolve `{ rows, failed }`.
- **Migração:** uma tabela nova (`web_searches`) e nada que quebre o schema existente.
- **Commits:** omitidos por instrução do projeto; checkpoints apenas revisam o diff.
