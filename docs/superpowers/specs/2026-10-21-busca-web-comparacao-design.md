# Busca web na Comparação — design

**Data:** 2026-10-21
**Status:** aprovado (buscar → escolher matérias → comparar; 4 matérias; só a página `/comparacao`)

## Objetivo

O campo de tema da página `/comparacao` passa a pesquisar na internet. O Engine encontra
matérias reais do tema em veículos distintos, analisa cada uma com o mesmo pipeline já
usado na Análise (extração → DNA → cluster → persistência) e mostra a comparação de
coberturas entre os veículos.

## Fluxo

1. **Buscar** — `search-web` (edge function) recebe o tema, consulta o OpenRouter com o
   plugin `web` (mesma chave já configurada) e devolve candidatos crus `{ url, title,
outlet }` a partir das citações retornadas.
2. **Filtrar e escolher** — o front normaliza os candidatos (`src/lib/websearch.js`):
   descarta portais de governo, enciclopédias, redes sociais e blogs, mantém um artigo
   por veículo e limita a 6 candidatos. A tela lista as matérias com checkbox; o usuário
   marca até 4.
3. **Analisar e comparar** — cada URL marcada é enviada para `analyze-url` (função
   existente) em paralelo, com progresso "Analisando 2 de 4…". A comparação é montada
   com `buildComparison` (já existente) sobre as análises retornadas.
4. **Persistência** — `analyze-url` recebe o `topic` pesquisado e grava a matéria sob
   esse tema, de modo que a comparação continua disponível ao recarregar a página
   (`fetchComparison` por `topic_slug`).

## Componentes

| Peça                  | Arquivo                             | Papel                                                              |
| --------------------- | ----------------------------------- | ------------------------------------------------------------------ |
| Busca web             | `functions/search-web.ts`           | OpenRouter + plugin `web`; cache 24 h; rate limit por IP/global    |
| Persistência da busca | `migrations/…_add-web-searches.sql` | Tabela `web_searches` (query, results jsonb, ip_hash, created_at)  |
| Análise               | `functions/analyze-url.ts`          | Novo campo opcional `topic` no body; resto inalterado              |
| Normalização          | `src/lib/websearch.js`              | Filtro de domínios, dedup por veículo, limite de candidatos        |
| Orquestração          | `src/lib/services.js`               | `searchWebCoverage(topic)`, `compareAnalyses(analyses, topic)`     |
| Tela                  | `src/views/CompareView.vue`         | Etapas: buscar → escolher → analisar/comparar, com estados de erro |

## Limites e custo

- Busca web: ~US$ 0,008 por consulta (plugin `web` do OpenRouter).
- Análise: 1 por matéria; `analyze-url` mantém 10 análises novas por IP/hora. Por isso a
  comparação usa no máximo 4 matérias por rodada.
- Busca: 10 por IP/hora e 50 globais por hora, com cache de 24 h por tema.
- Repetir o mesmo tema não gasta IA: a busca vem do cache e as análises por URL já são
  cacheadas em `analyze-url`.

## Riscos

- O OpenRouter pode devolver páginas que não são matérias (portais de governo,wiched).
  Mitigação: filtro de domínios + recusa de extração com menos de 300 caracteres.
- Latência: 4 análises em paralelo, cerca de 10–20 s. A tela mostra progresso por etapa.
- Limite por IP: compartilhado entre usuários do mesmo endereço. A tela explica o limite
  quando a função responde 429.

## Testes

- `tests/unit/websearch.spec.js` — filtro de domínios, dedup por veículo, limite de
  candidatos, estado vazio.
- `tests/unit/compare-view.spec.js` — fluxo do formulário: busca, seleção, comparação e
  erro (função de busca mockada).
