/** Dados de demonstração da análise, comparação, blindspot e replay. */

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
    },
    {
      kind: 'Dado',
      strength: 'forte',
      label: 'Projeção de arrecadação — 2027 a 2033',
      note: 'Fonte primária identificada, com metodologia informada.',
    },
    {
      kind: 'Declaração',
      strength: 'média',
      label: 'Entrevista com relator',
      note: 'Fala reproduzida sem contraponto direto no mesmo trecho.',
    },
    {
      kind: 'Declaração',
      strength: 'fraca',
      label: '"Fontes do governo" sem identificação',
      note: 'Atribuição genérica reduz a verificabilidade.',
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

export const BLINDSPOT = {
  topic: 'Reforma Tributária',
  window: 'Período analisado: 30 dias (01/08 a 30/08)',
  note: 'A comparação sempre considera um período específico antes de indicar ausência de cobertura.',
  covered: [
    { outlet: 'Folha', articles: 41 },
    { outlet: 'Estadão', articles: 37 },
    { outlet: 'G1', articles: 52 },
    { outlet: 'CartaCapital', articles: 18 },
    { outlet: 'Valor', articles: 44 },
    { outlet: 'Gazeta', articles: 12 },
  ],
  missing: [
    {
      outlet: 'Veículo Regional Norte',
      reach: 'Regional • Norte',
      lastMention: '19 dias sem publicar sobre o tema',
      severity: 'alta',
    },
    {
      outlet: 'Portal Setorial Agro',
      reach: 'Segmentado • Agro',
      lastMention: '12 dias sem publicar sobre o tema',
      severity: 'média',
    },
    {
      outlet: 'Rádio Metropolitana',
      reach: 'Local • Nordeste',
      lastMention: '26 dias sem publicar sobre o tema',
      severity: 'alta',
    },
    {
      outlet: 'Revista Cultura Viva',
      reach: 'Nicho • Cultura',
      lastMention: 'Sem registro no período',
      severity: 'baixa',
    },
  ],
  subthemes: [
    { label: 'Transição de alíquotas', coverage: 86 },
    { label: 'Impacto em pequenos negócios', coverage: 41 },
    { label: 'Efeito regional na arrecadação', coverage: 23 },
    { label: 'Custo de conformidade', coverage: 18 },
  ],
}

export const REPLAY = {
  topic: 'Reforma Tributária',
  frames: [
    {
      time: 'Dia 1 — 08h',
      label: 'Vazamento do relatório',
      outlets: 9,
      dominantFrame: 'Político',
      sentiment: 'Neutro',
      description:
        'As primeiras publicações tratam o fato como articulação política, sem números detalhados.',
      mix: { politica: 62, economia: 20, social: 10, seguranca: 8 },
    },
    {
      time: 'Dia 1 — 15h',
      label: 'Números começam a circular',
      outlets: 27,
      dominantFrame: 'Econômico',
      sentiment: 'Cauteloso',
      description:
        'Veículos econômicos assumem a dianteira e o enquadramento migra para arrecadação e alíquotas.',
      mix: { politica: 34, economia: 48, social: 12, seguranca: 6 },
    },
    {
      time: 'Dia 2 — 09h',
      label: 'Reação dos setores',
      outlets: 58,
      dominantFrame: 'Mercado',
      sentiment: 'Polarizado',
      description:
        'Indústria e serviços divergem publicamente. A emoção média das matérias sobe 19 pontos.',
      mix: { politica: 26, economia: 44, social: 22, seguranca: 8 },
    },
    {
      time: 'Dia 3 — 12h',
      label: 'Entra o ângulo social',
      outlets: 74,
      dominantFrame: 'Social',
      sentiment: 'Crítico',
      description:
        'Cobertura passa a discutir desigualdade e consumo popular. Novas fontes acadêmicas aparecem.',
      mix: { politica: 21, economia: 33, social: 38, seguranca: 8 },
    },
    {
      time: 'Dia 5 — 18h',
      label: 'Consolidação da narrativa',
      outlets: 96,
      dominantFrame: 'Econômico',
      sentiment: 'Estabilizado',
      description:
        'O enquadramento econômico se firma como dominante e a diversidade de fontes atinge o pico.',
      mix: { politica: 24, economia: 46, social: 24, seguranca: 6 },
    },
  ],
}
