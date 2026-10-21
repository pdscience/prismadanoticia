export const BIAS_SAMPLE = {
  id: 'bias_demo_001',
  newsId: 'an_8f21c',
  url: 'https://exemplo.com.br/politica/reforma-tributaria-relatorio',
  title: 'Relator entrega texto da reforma tributária com mudanças no imposto sobre consumo',
  outlet: 'Veículo de Exemplo',
  sourceSlug: 'veiculo-de-exemplo',
  author: 'Redação',
  publishedAt: '2026-08-30T11:20:00-03:00',
  topic: 'Reforma Tributária',
  topicSlug: 'reforma-tributaria',
  textLabel: 'centro',
  economicAxis: -8,
  socialAxis: 4,
  overallScore: -2,
  confidence: 58,
  outletEstimateLabel: 'centro',
  outletEstimateConfidence: 38,
  outletEstimateRationale:
    'A matéria descreve o relatório e ouve setores com posições distintas, sem assumir uma direção editorial clara.',
  distortionRisk: 24,
  distortionSummary:
    'Há poucos sinais retóricos relevantes. A manchete simplifica a disputa que aparece no corpo do texto.',
  favoredSide: 'nenhum',
  summary:
    'O texto descreve o relatório com dados e declarações de setores distintos. Há poucos sinais de enquadramento valorativo, embora a manchete destaque a entrega do texto sem explicitar os pontos ainda em disputa.',
  signals: [
    {
      type: 'headline_body_gap',
      strength: 'fraca',
      quote: 'Relator entrega texto da reforma tributária com mudanças no imposto sobre consumo',
      explanation:
        'A manchete enfatiza a entrega do relatório, enquanto o corpo detalha divergências que ainda podem alterar o texto.',
      favoredSide: 'incerto',
    },
    {
      type: 'missing_context',
      strength: 'fraca',
      quote: 'O texto ainda depende de votação nas comissões',
      explanation:
        'O trecho informa a tramitação, mas não dimensiona quem são os principais opositores e quais pontos seguem abertos.',
      favoredSide: 'nenhum',
    },
  ],
  evidence: [
    {
      axis: 'economic',
      quote:
        'Setores de serviços afirmam que a alíquota efetiva sobe, enquanto a indústria comemora a simplificação de tributos em cascata.',
      explanation: 'O texto contrapõe dois setores econômicos sem adotar a posição de um deles.',
    },
    {
      axis: 'social',
      quote:
        'O relatório apresentado nesta semana altera as regras de transição do imposto sobre consumo',
      explanation:
        'A descrição prioriza o desenho tributário e não apresenta uma leitura social explícita.',
    },
    {
      axis: 'economic',
      quote: 'cria uma trava de arrecadação para estados',
      explanation: 'A expressão descreve um mecanismo fiscal sem juízo de valor.',
    },
  ],
  curated: null,
  methodologyVersion: 'v1',
  model: 'fixture',
  createdAt: '2026-10-21T12:00:00.000Z',
}
