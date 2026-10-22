/** Dados de demonstração da análise e da comparação. */

export const SAMPLE_ANALYSIS = {
  id: 'an_8f21c',
  url: 'https://exemplo.com.br/politica/reforma-tributaria-relatorio',
  title: 'Relator entrega texto da reforma tributária com mudanças no imposto sobre consumo',
  outlet: 'Veículo de Exemplo',
  author: 'Redação',
  publishedAt: '2026-08-30T11:20:00-03:00',
  topic: 'Reforma Tributária',
  readingTime: 6,
  confidence: 82,
  sourceDiversity: 68,
  clusterSize: 34,
  dominantFrame: 'economia',
  summary: [
    'O relatório apresentado nesta semana altera as regras de transição do imposto sobre consumo e cria uma trava de arrecadação para estados.',
    'Setores de serviços afirmam que a alíquota efetiva sobe, enquanto a indústria comemora a simplificação de tributos em cascata.',
    'O texto ainda depende de votação nas comissões e pode sofrer alterações antes de ir ao plenário.',
  ],
  dna: {
    emocao: 41,
    fontes: 68,
    evidencias: 91,
    persuasao: 37,
    equilibrio: 74,
    narrativa: 63,
  },
  evidences: [
    {
      kind: 'Documento',
      strength: 'forte',
      label: 'Texto do relatório (PDF oficial)',
      note: 'Citado com número de páginas e trechos reproduzidos.',
      quote:
        'O relatório apresenta a projeção de arrecadação para o período de 2027 a 2033, conforme consta das páginas 42 a 47.',
    },
    {
      kind: 'Dado',
      strength: 'forte',
      label: 'Projeção de arrecadação — 2027 a 2033',
      note: 'Fonte primária identificada, com metodologia informada.',
      quote:
        'A metodologia descreve o modelo de projeção e explicita as premissas de crescimento e de alíquotas.',
    },
    {
      kind: 'Declaração',
      strength: 'média',
      label: 'Entrevista com relator',
      note: 'Fala reproduzida sem contraponto direto no mesmo trecho.',
      quote: 'Segundo o relator, a proposta ainda pode sofrer ajustes durante a tramitação.',
    },
    {
      kind: 'Declaração',
      strength: 'fraca',
      label: '"Fontes do governo" sem identificação',
      note: 'Atribuição genérica reduz a verificabilidade.',
      quote: 'Segundo fontes do governo, o impacto será sentido já no próximo exercício.',
    },
  ],
  signals: [
    { label: 'Contraditório presente', ok: true },
    { label: 'Dados com fonte primária', ok: true },
    { label: 'Título compatível com o texto', ok: true },
    { label: 'Uso de fonte anônima', ok: false },
    { label: 'Trecho com adjetivação avaliativa', ok: false },
  ],
}

export const COMPARISON = {
  topic: 'Reforma Tributária',
  window: 'Últimas 48 horas',
  clusterSize: 34,
  rows: [
    {
      outlet: 'Folha',
      highlight: 'Economia',
      angle: 'Impacto na arrecadação e nas contas públicas',
      tone: 'Analítico',
      dna: { emocao: 38, fontes: 74, evidencias: 88, persuasao: 33, equilibrio: 76, narrativa: 61 },
      accent: '#2D6BFF',
    },
    {
      outlet: 'Estadão',
      highlight: 'Mercado',
      angle: 'Reação de investidores e do setor produtivo',
      tone: 'Técnico',
      dna: { emocao: 34, fontes: 69, evidencias: 84, persuasao: 41, equilibrio: 66, narrativa: 71 },
      accent: '#FFC24B',
    },
    {
      outlet: 'CartaCapital',
      highlight: 'Social',
      angle: 'Efeitos sobre desigualdade e consumo popular',
      tone: 'Crítico',
      dna: { emocao: 66, fontes: 58, evidencias: 72, persuasao: 63, equilibrio: 49, narrativa: 82 },
      accent: '#8B5CF6',
    },
    {
      outlet: 'Gazeta',
      highlight: 'Segurança',
      angle: 'Fiscalização, sonegação e combate a fraudes',
      tone: 'Factual',
      dna: { emocao: 47, fontes: 52, evidencias: 69, persuasao: 44, equilibrio: 58, narrativa: 55 },
      accent: '#FF3B5C',
    },
  ],
}
