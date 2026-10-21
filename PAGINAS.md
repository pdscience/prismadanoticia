# Páginas — Prisma da Notícia

Este documento descreve o que cada rota explora, de onde vêm os dados e quais limites o usuário
deve enxergar. Ele complementa [`FUNCIONALIDADES.md`](./FUNCIONALIDADES.md), que organiza o
produto por capacidade, e [`README.md`](./README.md), que cobre setup e deploy.

## Resumo

| Rota          | Pergunta que a tela responde                               | Dados                                         |
| ------------- | ---------------------------------------------------------- | --------------------------------------------- |
| `/`           | O que é o Prisma e por que ele importa?                    | Tendências e análise de exemplo no InsForge   |
| `/analise`    | Qual é o DNA desta notícia?                                | `analysis_feed` + Edge Function `analyze-url` |
| `/vies`       | Qual é o enquadramento do texto e quais indícios ele traz? | `bias_feed` + Edge Function `analyze-bias`    |
| `/comparacao` | Como veículos diferentes trataram o mesmo cluster?         | `analysis_feed` por `topic_slug`              |
| `/blindspot`  | Quem está em silêncio sobre este tema?                     | Tabelas `blindspot_*`                         |
| `/replay`     | Como a narrativa mudou ao longo do tempo?                  | `replay_events`                               |
| `/mapa`       | Quais temas dominam e polarizam cada UF?                   | `state_metrics`                               |
| `/tecnologia` | Como o produto é construído e para onde vai?               | Conteúdo conceitual                           |
| `/marca`      | Qual é a identidade visual e narrativa da marca?           | Conteúdo conceitual                           |
| `*`           | O ângulo existe?                                           | Nenhum dado externo                           |

O menu principal expõe Análise, Enquadramento, Comparação, BlindSpot, Replay, Mapa e Tecnologia. O
rodapé também aponta para o Brand Book e para âncoras internas de Tecnologia e Marca.

---

## `/` — Landing page

**Explora:** a proposta “Uma notícia. Vários ângulos.”, o funcionamento em quatro passos, o DNA em
seis eixos, tendências de cobertura, os módulos do produto, o mapa de polarização como moat, o
manifesto da marca e a estratégia de cartão viral.

**Dados e comportamento:**

- `TrendsSection` lê os temas marcados com `show_in_trends` em `topics`; em falha ou modo mock, usa
  `TRENDS`.
- `DnaShowcase` e o cartão viral usam `fetchSampleAnalysis()`, que tenta a análise de referência no
  `analysis_feed` e cai para `SAMPLE_ANALYSIS`.
- O cartograma da seção de moat usa o fixture local `STATES`; ele é ilustrativo e não consulta
  `state_metrics`.
- Os números do hero (veículos, eixos e UFs) são argumentos de produto, não uma contagem ao vivo.
- A seção de PWA e extensão antecipa recursos que ainda não estão publicados.

**Limite:** a landing combina dados reais de tendências e exemplo com conteúdo conceitual. Ela não
é uma página de status operacional.

---

## `/analise` — DNA da Notícia

**Explora:** a análise individual de uma matéria: resumo em tópicos, confiança, diversidade de
fontes, seis eixos do DNA, evidências, sinais editoriais, cluster e cartão compartilhável.

**Fluxo:**

1. A URL pode vir de `?url=...` ou do formulário.
2. URLs já analisadas são lidas de `analysis_feed`.
3. URLs novas chamam a Edge Function `analyze-url`, que extrai o texto, chama o OpenRouter, salva
   `news` + `analyses` e tenta gerar embedding e cluster.
4. **Ver exemplo** carrega a análise de referência.

**Dados e limites:**

- A análise de URL nova não é substituída por fixture quando a IA ou o backend falham; o erro é
  exibido ao usuário.
- O pipeline visual de seis etapas é uma representação de progresso, não seis chamadas separadas
  no frontend.
- O Índice Prisma é a média dos seis eixos e não um veredito de qualidade jornalística.
- O cluster pode ter tamanho `1` quando a matéria ainda não encontrou vizinhos com similaridade
  suficiente.

---

## `/vies` — Radar de Enquadramento

**Explora:** a orientação do **texto** em duas escalas independentes, a estimativa do veículo e os
indícios retóricos de distorção.

**Dados e comportamento:**

- Lê o cache de `bias_feed` por URL e versão de metodologia.
- Se a matéria ainda não foi analisada, chama `analyze-url` e depois `analyze-bias`.
- A Edge Function `analyze-bias` lê o texto já salvo, chama o OpenRouter e grava `bias_analyses`.
- O limite é de 20 análises novas por IP/hora e 100 globais/hora; cache não consome cota.
- Em modo mock, a tela mostra `BIAS_SAMPLE`.
- Em produção, uma falha real não é mascarada por uma fixture.

**Limites metodológicos:**

- A escala econômica vai de Estado/regulação a mercado/desregulação; a social/cultural vai de
  progressista a conservador.
- Rótulos “mista / ambígua” aparecem quando as escalas divergem mais de 50 pontos.
- A confiança do texto é limitada a 85 e a estimativa do veículo a 55.
- Perfis curados de veículos reais ainda não estão cadastrados. A tela mostra a estimativa desta
  matéria e deixa a estrutura de curadoria pronta.
- Distorção aqui significa enquadramento retórico; não é checagem de fatos nem veredito de
  verdade/falsidade.

---

## `/comparacao` — Comparação Inteligente

**Explora:** como veículos distintos cobriram o mesmo cluster: destaque escolhido, ângulo, tom,
Índice Prisma, radar contra a média e eixos com maior divergência.

**Dados e comportamento:**

- Busca por tema, normaliza para `slug` e lê `analysis_feed` por `topic_slug`.
- Só entram linhas com `highlight` preenchido.
- Se não houver cluster suficiente, usa `COMPARISON` e exibe o selo **dados de demonstração**.
- Quando o termo buscado não corresponde ao exemplo, a tela avisa qual tema está sendo mostrado.
- A leitura editorial é descritiva; não é um ranking de qualidade.

**Limite:** a busca recupera clusters já gravados. Ela não dispara uma nova coleta de veículos no
momento da consulta.

---

## `/blindspot` — BlindSpot Brasil

**Explora:** quem cobriu um tema, quem está em silêncio e quais subtemas foram pouco explorados.

**Dados e comportamento:**

- Lê `blindspot_reports`, `blindspot_coverage`, `blindspot_gaps` e `blindspot_subthemes`.
- Em falha ou modo mock, usa `BLINDSPOT` e exibe **dados de demonstração**.
- O relatório de referência do seed cobre 30 dias. Os volumes de cobertura e os subtemas vêm desse
  relatório.
- O seletor de 7, 15, 30 ou 90 dias define o **tempo mínimo de silêncio** para um veículo aparecer
  na lista de blindspots. Ele não refaz a coleta por período.
- O indicador de confiabilidade cresce com o período e deve ser lido como heurística de leitura.
- Silêncio não é tratado como intenção editorial.

---

## `/replay` — Prisma Replay

**Explora:** a evolução da narrativa quadro a quadro, com número de veículos, enquadramento
dominante, sentimento, mistura de enquadramentos e expansão da cobertura.

**Dados e comportamento:**

- Lê `replay_events` do tema padrão.
- Em falha ou modo mock, usa `REPLAY` e exibe **dados de demonstração**.
- O player avança automaticamente, permite pausar e arrastar a linha do tempo.
- A barra de mistura usa as chaves canônicas de `FRAMES` para manter as cores consistentes.

**Limite:** a tela atual não oferece busca de tema nem link direto para outro replay; o serviço
`fetchReplay(topic)` já aceita um tema, mas a interface usa o tema de referência.

---

## `/mapa` — Mapa de Polarização

**Explora:** o cartograma das 27 UFs, o tema dominante, o índice de polarização, a distribuição
temática, o ranking dos estados mais polarizados e a mistura nacional.

**Dados e comportamento:**

- `fetchStates()` lê `state_metrics`; em falha, usa `STATES`.
- O mesmo conjunto alimenta o cartograma, o painel do estado, o ranking e a mistura nacional.
- Os modos são: tema dominante, polarização e um modo por tema (Economia, Segurança, Meio
  Ambiente, Saúde e Política).
- Hover mostra o tooltip; clique seleciona a UF.
- A seção “para quem serve” é posicionamento de produto, não uma funcionalidade interativa.

**Limite:** os dados por UF são uma agregação do seed/backend, não uma medição estatística de
opinião pública.

---

## `/tecnologia` — Tecnologia e produto

**Explora:** stack, pipeline de seis etapas, banco inteligente, PWA e extensão Chrome.

**Status:** vitrine conceitual. O pipeline, o modelo de dados e os mockups explicam a arquitetura,
mas a extensão Chrome, as notificações, os favoritos e a leitura offline de análises ainda não
estão publicados. O PWA é instalável e guarda o app shell/assets; consultas novas exigem rede.

---

## `/marca` — Brand Book

**Explora:** DNA e arquétipos da marca, logo em três versões, paleta, tipografia e estrutura do
pitch deck.

**Status:** vitrine institucional. Não consome dados do backend e não é uma tela operacional.

---

## `*` — 404

**Explora:** o conceito “Este ângulo não existe.” e oferece retorno à home ou à análise.

**Status:** rota de fallback do Vue Router, sem dependência de dados.

---

## Convenções de dados

- **Modo mock:** `VITE_USE_MOCK=true` força as fixtures locais e não consulta o InsForge.
- **Fallback:** quando o backend está configurado mas falha, as telas de leitura usam fixtures para
  preservar a navegação. Comparação, BlindSpot e Replay sinalizam isso; a análise de URL nova e o
  Radar de Enquadramento não fabricam resultado em produção.
- **Demonstração x produção:** o rodapé indica o modo configurado (“dados de demonstração” ou
  “dados do InsForge”). Um fallback pontual pode ocorrer mesmo com o InsForge configurado.
- **Cores de enquadramento:** vêm de `src/data/frames.js`; mapa, replay e hero compartilham a mesma
  fonte.
