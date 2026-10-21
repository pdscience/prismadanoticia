# Metodologia de Cobertura e Ratings

Este documento define como o Prisma da Notícia pretende tratar ratings permanentes de veículos na
página **Cobertura da História**. Ele não autoriza rotular veículos sem curadoria, referência
pública e revisão.

## O que o rating é

- Uma estimativa da posição editorial predominante de um **veículo**, não de uma matéria.
- Um contexto para ler a distribuição de cobertura de um cluster.
- Um dado versionado, revisável e limitado por metodologia.

## O que o rating não é

- Não é factualidade, confiabilidade ou qualidade jornalística.
- Não é uma análise da matéria individual.
- Não é uma cópia dos ratings do Ground News, AllSides, Ad Fontes ou Media Bias/Fact Check.
- Não é prova de intenção editorial, coordenação ou omissão deliberada.
- Não é um rótulo permanente imutável.

## Escala

- `esquerda`
- `centro-esquerda`
- `centro`
- `centro-direita`
- `direita`

`mista` deve ser evitada em ratings permanentes. Se a evidência não permitir posicionamento, o
veículo fica **sem rating curado** em vez de receber um rótulo forçado.

## Critérios observáveis

A avaliação deve considerar um conjunto de evidências, não uma única matéria:

1. Linha editorial declarada e histórico de editoriais.
2. Padrão de seleção e destaque de histórias.
3. Escolha de fontes e enquadramentos recorrentes.
4. Endossos eleitorais e posicionamentos institucionais públicos.
5. Propriedade, financiamento e mudanças editoriais relevantes.
6. Referências públicas independentes, quando existirem.

## Evidência mínima

Cada perfil deve registrar:

- `methodology`: resumo do raciocínio e dos critérios usados.
- `reference_url`: pelo menos uma referência pública verificável.
- `reviewed_at`: data da última revisão.
- `reviewer`: responsável pela curadoria.
- `confidence`: confiança limitada pela qualidade e quantidade de evidências.
- `economic_axis` e `social_axis`: posição nas duas escalas, quando aplicável.

## Processo de curadoria

1. Selecionar um veículo com cobertura relevante no cluster.
2. Reunir evidências públicas e registrar as fontes.
3. Redigir a justificativa metodológica.
4. Fazer uma segunda revisão, quando possível.
5. Cadastrar em `source_bias_profiles`.
6. Revisar quando houver mudança de propriedade, linha editorial ou evidência relevante.

## Exibição na página

- A barra principal usa o `text_label` de cada texto, não o rating do veículo.
- O rating curado aparece ao lado da manchete como contexto.
- Sem perfil curado, a interface mostra **sem rating curado**.
- A estimativa de veículo feita pela IA não é promovida a rating permanente.
- A página não inventa rótulos para preencher a interface.

## Estado atual

`source_bias_profiles` permanece vazio nesta versão. A estrutura está pronta, mas nenhum veículo
real recebeu rating permanente. A tela funciona com zero perfis e mostra a ausência de curadoria de
forma explícita.

## Limites

- A classificação de texto é uma estimativa e pode errar.
- A distribuição depende de quais matérias foram analisadas, não de todo o universo de cobertura.
- Amostras pequenas não sustentam conclusões fortes.
- Cobertura desigual não prova intenção editorial.
- O método deve ser revisto com o tempo e com a diversidade de veículos cadastrados.
