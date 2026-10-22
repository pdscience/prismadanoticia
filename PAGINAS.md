# Páginas — Prisma da Notícia

Este documento descreve o que cada rota explora, de onde vêm os dados e quais limites o usuário
deve enxergar. Ele complementa [`FUNCIONALIDADES.md`](./FUNCIONALIDADES.md), que organiza o
produto por capacidade, e [`README.md`](./README.md), que cobre setup e deploy.

## Resumo

| Rota          | Pergunta que a tela responde                                | Dados                                                |
| ------------- | ----------------------------------------------------------- | ---------------------------------------------------- |
| `/`           | O que é o Prisma e por que ele importa?                     | Tendências e análise de exemplo no InsForge          |
| `/analise`    | Qual é o DNA desta notícia?                                 | `analysis_feed` + `perspective_feed` + `analyze-url` |
| `/vies`       | Qual é o enquadramento do texto e quais indícios ele traz?  | `bias_feed` + Edge Function `analyze-bias`           |
| `/comparacao` | Como veículos diferentes trataram o mesmo cluster?          | `analysis_feed` por `topic_slug`                     |
| `/cobertura`  | Como os veículos cobriram esta história e qual lado faltou? | `analysis_feed` + `perspective_feed` + perfis        |
| `/mapa`       | Quais temas dominam e polarizam cada UF?                    | `state_metrics`                                      |
| `/tecnologia` | Como o produto é construído e para onde vai?                | Conteúdo conceitual                                  |
| `/marca`      | Qual é a identidade visual e narrativa da marca?            | Conteúdo conceitual                                  |
| `*`           | O ângulo existe?                                            | Nenhum dado externo                                  |

O menu principal expõe Análise, Enquadramento, Comparação, Cobertura, Mapa e Tecnologia. O rodapé
também aponta para o Brand Book e para âncoras internas de Tecnologia e Marca.

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

**Limite:** a landing combina dados reais de tendências, contagem de veículos e exemplo com
conteúdo conceitual. Ela não é uma página de status operacional.

---

## `/analise` — DNA da Notícia

**Explora:** a análise individual de uma matéria: resumo em tópicos, confiança, diversidade de
fontes, seis eixos do DNA, evidências, sinais editoriais, cluster, perspectivas do cluster e cartão
compartilhável.

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
- **Perspectivas nesta história** lê `perspective_feed` por `cluster_id` e agrupa as matérias
  analisadas em esquerda, centro, direita e incerta. Cada veículo aparece uma vez, pela matéria mais
  recente. O painel mostra quantos lados estão representados, quais faltam e uma amostra pequena
  quando há menos de três veículos.
- O agrupamento usa o `text_label` estimado de cada texto; ele não é um rating permanente do
  veículo e não transforma ausência em prova de omissão editorial.
- Cada evidência mostra o trecho literal que a sustenta, quando o modelo devolve a citação.
- A legenda expansível **Como ler esta análise** explica as faixas, os seis eixos, as evidências,
  as perspectivas e os sinais; ela deixa explícito que as métricas não são checagem de fatos.

---

## `/vies` — Radar de Enquadramento

**Explora:** a orientação do **texto** em duas escalas independentes, a estimativa do veículo e os
indícios retóricos de distorção.

**Dados e comportamento:**

- Lê o cache de `bias_feed` por URL e versão de metodologia.
- Se a matéria ainda não foi analisada, chama `analyze-url` e depois `analyze-bias`.
- A Edge Function `analyze-bias` lê o texto já salvo, chama o OpenRouter e grava `bias_analyses`.
- O limite é de 20 análises novas por IP/hora e 100 globais/hora; cache não consome cota.
- Sem URL na rota, a tela carrega o enquadramento real mais recente já calculado (`bias_feed`); se
  não houver dado, ela mostra `BIAS_SAMPLE` com o selo **exemplo ilustrativo**.
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

- A carga inicial lê `analysis_feed` por `topic_slug` do tema padrão.
- O campo de tema dispara a Edge Function `search-web`: busca real na internet, com cache de 24 h
  por tema em `web_searches` e limite por IP/hora.
- Os candidatos são filtrados no front (`src/lib/websearch.js`): sai o que não é veículo de
  imprensa (governo, enciclopédias, blogs, redes sociais) e fica uma matéria por veículo, no máximo
  6 candidatos.
- O usuário marca até 4 matérias; cada uma passa pela Edge Function `analyze-url`, que extrai o
  texto, calcula o DNA e grava a matéria sob o tema pesquisado.
- A comparação final é montada sobre as análises geradas, com destaque, ângulo, tom e Índice
  Prisma de cada veículo; o radar e as divergências são recalculados.
- Só entram linhas com `highlight` preenchido; URLs de `exemplo.com.br` são descartadas.
- Mantém uma linha por veículo, priorizando a matéria mais recente e, em empate, a de maior
  confiança.
- A contagem exibida é de veículos comparados; a janela é calculada a partir das datas reais das
  publicações.
- Se não houver cluster suficiente, usa `COMPARISON` e exibe o selo **dados de demonstração**.
- Quando o termo buscado não corresponde ao exemplo, a tela avisa qual tema está sendo mostrado.
- A leitura editorial é descritiva; não é um ranking de qualidade.

**Limite:** a busca web é real e as matérias encontradas são analisadas de fato. O custo é limitado
pelo teto de 4 matérias por rodada e pelo limite de análises por IP/hora; matérias paywalled ou sem
texto extraível ficam de fora, e a tela avisa quantas foram descartadas.

---

## `/cobertura` — Cobertura da História

**Explora:** como veículos diferentes cobriram o mesmo cluster, com distribuição percentual entre
esquerda, centro e direita, lista de manchetes, lados ausentes e alerta de ponto cego.

**Entrada:**

- `?url=...` de uma matéria já analisada;
- `?cluster=...` vindo do card de perspectivas ou de links internos;
- formulário para colar a URL de uma matéria já analisada.

**Dados e cálculo:**

- Lê `analysis_feed` para a manchete representativa e o `cluster_id`.
- Lê `perspective_feed` para as coberturas do cluster.
- Lê `source_bias_profiles` para o rating curado do veículo, quando existir.
- Um veículo aparece uma vez, pela matéria mais recente; empate vai para a maior confiança.
- A barra usa o enquadramento do **texto**. Incertas ficam fora do denominador e são listadas à
  parte. As porcentagens somam 100%.
- Um lado com até 10% e pelo menos 3 veículos classificados gera alerta de ponto cego. Com menos de
  5 veículos, o texto relativiza a amostra.
- O rating curado aparece como contexto ao lado da manchete. Sem perfil, a tela mostra **sem rating
  curado**; a estimativa de IA não é promovida a rating permanente.

**Limites:** a página não analisa URLs novas automaticamente, não usa fallback fictício e não
inventa ratings. A metodologia de curadoria está em
[`docs/metodologia-cobertura.md`](./docs/metodologia-cobertura.md).

---

## `/mapa` — Mapa de Polarização

**Explora:** o mapa das 27 UFs, o tema dominante, o índice de polarização, a distribuição temática, o
ranking dos estados mais polarizados e a mistura nacional.

**Dados e comportamento:**

- `fetchStates()` lê `state_metrics`; em falha, usa `STATES`.
- O mesmo conjunto alimenta o cartograma, o painel do estado, o ranking e a mistura nacional.
- Os modos são: tema dominante, polarização e um modo por tema (Economia, Segurança, Meio
  Ambiente, Saúde e Política).
- Hover mostra o tooltip; clique seleciona a UF.
- A seção “para quem serve” é posicionamento de produto, não uma funcionalidade interativa.

**Limite:** os dados por UF são uma agregação do seed/backend, não uma medição estatística de
opinião pública. A tela não promete leitura por grupo de veículos nem atualização em tempo real.

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
  preservar a navegação. Comparação sinaliza isso; a análise de URL nova, o Radar de Enquadramento e
  as tendências não fabricam resultado em produção.
- **Perspectivas:** em modo mock ou falha de consulta, o painel fica vazio e explica que ainda não
  há coberturas comparáveis; nenhum lado é inventado.
- **Cobertura:** a página não dispara análise nova e não usa fixture. URL não analisada leva para
  `/analise`; cluster sem cobertura mostra estado vazio.
- **Demonstração x produção:** o rodapé indica o modo configurado (“dados de demonstração” ou
  “dados do InsForge”). Um fallback pontual pode ocorrer mesmo com o InsForge configurado.
- **Cores de enquadramento:** vêm de `src/data/frames.js`; mapa e hero compartilham a mesma fonte.
