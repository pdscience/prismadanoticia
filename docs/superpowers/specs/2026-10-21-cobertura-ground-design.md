# Cobertura da História — Design

**Data:** 2026-10-21
**Status:** aprovado para planejamento
**Inspiração:** Ground News, sem copiar marca, textos, layout exato ou base de ratings.

## 1. Objetivo

Criar uma página original no Prisma que mostre, para uma mesma história, a distribuição de
cobertura entre esquerda, centro e direita, com porcentagens, lista de veículos, estado de
blindspot e contexto de rating por veículo.

A página deve responder: “como veículos diferentes cobriram esta história e qual lado está
sub-representado?”. Ela não deve responder “este veículo é objetivamente de esquerda/direita” nem
“esta matéria é verdadeira/falsa”.

## 2. Decisões aprovadas

- Modelo híbrido: a barra principal usa o enquadramento do **texto**; o rating curado do veículo
  aparece como contexto.
- Ratings de veículos virão de **curadoria interna documentada**, não de cópia dos dados do
  Ground News.
- Primeiro formato: **página de uma história**, não feed.
- Entrada: URL já analisada e links internos por cluster.
- Escopo inicial: distribuição + cobertura + blindspot.
- Sem factuality e sem ownership nesta versão.

## 3. Fora de escopo

- Feed de histórias, busca por manchete e personalização.
- Ratings automáticos permanentes por IA.
- Factuality, ownership, paywall ou dados de audiência.
- Cópia de marca, textos, layout exato ou API interna do Ground News.
- Análise automática de URLs não analisadas ao abrir `/cobertura`.

## 4. Experiência da página

Rota: `/cobertura`.

Parâmetros:

- `?url=...`: matéria já analisada.
- `?cluster=...`: cluster escolhido por link interno.

Estrutura:

1. Cabeçalho com manchete representativa, veículo, data, tema, tamanho do cluster e atalhos para
   DNA e Enquadramento.
2. Bloco “Como os veículos cobrem esta história”:
   - barra segmentada esquerda/centro/direita;
   - porcentagens e contagens;
   - total de veículos classificados;
   - selo **Amostra pequena** quando o volume não sustenta leitura forte;
   - selo **Ponto cego** quando um lado quase não aparece.
3. Alerta de ponto cego com lado, percentual e aviso de que ausência não prova intenção editorial.
4. Três colunas de cobertura: esquerda, centro e direita. Cada item mostra veículo, rating curado
   quando existir, manchete, data, confiança e link para `/vies?url=...`.
5. Seção “Incertas / mistas”, fora da barra principal.
6. Rodapé metodológico e atalhos para Comparação e Análise.
7. Estados: carregando, URL não analisada, cluster sem cobertura e falha de consulta.

A identidade visual segue o design system do Prisma. Não haverá clone visual do Ground News.

## 5. Fontes de dados

- `analysis_feed`: manchete representativa, veículo, data, tema e `cluster_id`.
- `perspective_feed`: coberturas do cluster, `text_label`, confiança e dados do veículo.
- `source_bias_profiles`: rating curado do veículo, quando existir.

Não é necessária nova migration: as views e a tabela já existem.

## 6. Fluxo de dados

`fetchCoverage({ url, clusterId })`:

1. Se `url`:
   - consulta `analysis_feed` por URL;
   - se não encontrar, lança erro “Esta matéria ainda não foi analisada”;
   - usa o `cluster_id` da matéria.
2. Se `clusterId`:
   - consulta `analysis_feed` pelo cluster;
   - escolhe a matéria mais recente como manchete representativa;
   - se não houver matéria, mostra estado vazio.
3. Consulta `perspective_feed` pelo `cluster_id`, com limite de 100 linhas.
4. Passa as linhas e a história para `buildCoverage()`.

A URL não analisada não dispara `analyze-url`; a tela oferece CTA para `/analise`.

## 7. Regras de cálculo

### Deduplicação

- Um veículo aparece uma vez.
- Vence a matéria mais recente; datas nulas ficam por último.
- Empate de data vai para a maior `confidence`.
- Linhas de demonstração (`exemplo.com.br`) e sem `text_label` são ignoradas.

### Mapeamento de lados

- `esquerda` e `centro-esquerda` → esquerda.
- `centro` → centro.
- `centro-direita` e `direita` → direita.
- `mista` → incerta, fora da barra principal.

### Porcentagens

- Denominador: veículos classificados em esquerda + centro + direita.
- Incertas não entram no denominador.
- Arredondamento por maior resto para as três porcentagens somarem exatamente 100%.
- Empate no resto segue a ordem esquerda, centro, direita.
- Quando não há veículos classificados, não exibir porcentagens; mostrar estado vazio.

### Blindspot

- Um lado com participação `<= 10%` e pelo menos 3 veículos classificados gera alerta.
- Com 3 ou 4 veículos: “possível ponto cego / amostra limitada”.
- Com 5 ou mais: “ponto cego”.
- Com menos de 3: não declarar blindspot; mostrar apenas “Amostra pequena”.
- O texto deve afirmar que ausência de cobertura não prova intenção editorial.

### Rating do veículo

- A barra não usa o rating curado; usa o `text_label` do texto.
- O rating curado aparece como contexto ao lado da manchete.
- Sem perfil curado: “sem rating curado”.
- A estimativa de veículo feita pela IA não será apresentada como rating permanente nesta página.

## 8. Curadoria e metodologia

`source_bias_profiles` continua sem rótulos reais inventados nesta entrega.

Será criado `docs/metodologia-cobertura.md` com:

- escala de cinco posições: esquerda, centro-esquerda, centro, centro-direita, direita;
- critérios observáveis e referências públicas;
- exigência de `methodology`, `reference_url`, `reviewed_at` e `reviewer`;
- versionamento e revisão;
- limites: rating é do veículo, não da matéria; não é factuality.

A página funciona com zero perfis curados. Os rótulos aparecem quando a curadoria for cadastrada.

## 9. Arquivos previstos

- `src/lib/coverage.js`: cálculo puro.
- `src/lib/services.js`: `fetchCoverage`.
- `src/views/CoverageView.vue`: orquestração da página.
- `src/components/coverage/CoverageBar.vue`: barra e legenda.
- `src/components/coverage/CoverageSide.vue`: coluna de veículos.
- `src/components/coverage/CoverageBlindspot.vue`: alerta.
- `src/router/index.js`: rota `/cobertura`.
- `src/components/layout/AppNavbar.vue` e `AppFooter.vue`: link de navegação.
- `src/components/analysis/StoryPerspectives.vue`: CTA “Ver cobertura completa”.
- `docs/metodologia-cobertura.md`: metodologia de curadoria.
- Testes em `tests/unit/` e integração em `tests/unit/services.integration.spec.js`.

## 10. Testes

### Lógica pura

- Mapeamento dos seis rótulos.
- Dedupe por veículo e prioridade da matéria mais recente.
- Porcentagens somando 100%.
- Arredondamento de maior resto.
- Incertas fora da barra.
- Blindspot com 0%, 10%, 11%, amostra pequena e volume suficiente.
- Estado vazio.

### Componentes

- Barra acessível com rótulos e porcentagens.
- Colunas com veículos, ratings ausentes e links.
- Alerta de blindspot com texto de cautela.

### Integração

- `fetchCoverage` ao vivo em um cluster real.
- URL não analisada retorna erro claro, sem chamar análise nova.

### Verificação final

- `npm run test:run`
- `npm run lint`
- `npm run format:check`
- `npm run build`

## 11. Segurança e privacidade

- Apenas leitura pública; nenhuma escrita nova.
- Nenhum dado pessoal.
- Nenhum segredo no frontend.
- Sem chamada automática à Edge Function ao abrir a página.
- Sem scraping do Ground News.

## 12. Critérios de sucesso

- A página abre por URL analisada e por cluster.
- A barra mostra porcentagens coerentes e soma 100%.
- Incertas e veículos sem rating são tratados sem inventar dados.
- Blindspot é exibido com cautela e respeita o tamanho da amostra.
- A tela funciona em modo claro/escuro e em mobile.
- Testes, lint, formatação e build passam.

## 13. Riscos e mitigação

- **Poucos veículos analisados:** selo de amostra pequena e ausência de blindspot forte.
- **Viés do classificador de texto:** linguagem metodológica e nenhum rating permanente automático.
- **Ratings curados subjetivos:** metodologia pública, referências, revisão e versão.
- **Confusão com Ground News:** identidade original e texto explícito de que a métrica é do Prisma.
- **Cluster com várias matérias do mesmo veículo:** dedupe por veículo.
