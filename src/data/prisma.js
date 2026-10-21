/**
 * PRISMA DA NOTÍCIA — Camada de dados (mock)
 * Simula o retorno do Prisma Engine (Cap. 9) e do banco inteligente (Cap. 10).
 * Quando o Supabase estiver conectado, basta trocar estas funções por queries reais.
 */

/**
 * ── Enquadramentos canônicos ───────────────────────────────────────────────
 * Fonte única de verdade para rótulo e cor de cada enquadramento. Toda a
 * interface (mapa, replay, hero, tendências) lê daqui, para que a mesma cor
 * signifique sempre o mesmo enquadramento em todas as telas.
 */
export const FRAMES = {
  politica: { label: 'Política', color: '#8B5CF6' },
  economia: { label: 'Economia', color: '#FFC24B' },
  seguranca: { label: 'Segurança', color: '#FF3B5C' },
  ambiente: { label: 'Meio Ambiente', color: '#2EE6A8' },
  saude: { label: 'Saúde', color: '#2D6BFF' },
  social: { label: 'Social', color: '#6F9BFF' },
  juridico: { label: 'Jurídico', color: '#B794FF' },
}

/** Resolve um enquadramento pela chave, com fallback seguro. */
export function frame(key) {
  return FRAMES[key] ?? { label: String(key), color: '#9AA6C9' }
}

/* ── Cap. 4 — Os seis eixos do DNA da Notícia ───────────────────────────── */
export const DNA_AXES = [
  {
    key: 'emocao',
    label: 'Emoção',
    measures: 'intensidade',
    color: '#FF3B5C',
    explanation:
      'Mede a carga emocional do texto: adjetivos intensos, dramatização e apelo afetivo. Valores altos indicam linguagem mais inflamada.',
  },
  {
    key: 'fontes',
    label: 'Fontes',
    measures: 'variedade',
    color: '#2D6BFF',
    explanation:
      'Avalia quantas vozes distintas são ouvidas e se há contraditório. Valores altos indicam reportagem com múltiplos entrevistados.',
  },
  {
    key: 'evidencias',
    label: 'Evidências',
    measures: 'sustentação',
    color: '#2EE6A8',
    explanation:
      'Verifica dados, documentos, citações verificáveis e links. Valores altos indicam afirmações bem sustentadas.',
  },
  {
    key: 'persuasao',
    label: 'Persuasão',
    measures: 'linguagem',
    color: '#FFC24B',
    explanation:
      'Detecta recursos retóricos que induzem conclusão: superlativos, ironia e generalizações. Valores altos pedem leitura crítica.',
  },
  {
    key: 'equilibrio',
    label: 'Equilíbrio',
    measures: 'pluralidade',
    color: '#8B5CF6',
    explanation:
      'Mede o espaço dado a cada lado do debate. Valores altos indicam tratamento proporcional entre versões.',
  },
  {
    key: 'narrativa',
    label: 'Narrativa',
    measures: 'enquadramento',
    color: '#6F9BFF',
    explanation:
      'Identifica o enquadramento escolhido — econômico, jurídico, social, segurança. Revela por qual ângulo o fato é contado.',
  },
]

/* ── Cap. 3 — Tendências ────────────────────────────────────────────────── */
export const TRENDS = [
  {
    id: 'stf',
    label: 'STF',
    outlets: 128,
    articles: 412,
    delta: 12.4,
    accent: '#8B5CF6',
    frames: ['Jurídico', 'Político'],
    headline: 'Julgamento sobre marco temporal entra na pauta da semana',
  },
  {
    id: 'congresso',
    label: 'Congresso',
    outlets: 143,
    articles: 507,
    delta: 8.1,
    accent: '#2D6BFF',
    frames: ['Político', 'Econômico'],
    headline: 'Relator apresenta novo texto da reforma tributária',
  },
  {
    id: 'economia',
    label: 'Economia',
    outlets: 167,
    articles: 638,
    delta: 21.7,
    accent: '#FFC24B',
    frames: ['Econômico', 'Mercado'],
    headline: 'Copom sinaliza manutenção da taxa básica de juros',
  },
  {
    id: 'seguranca',
    label: 'Segurança',
    outlets: 119,
    articles: 356,
    delta: -4.3,
    accent: '#FF3B5C',
    frames: ['Segurança', 'Social'],
    headline: 'Operação integrada muda dinâmica de facções no Sudeste',
  },
  {
    id: 'meio-ambiente',
    label: 'Meio Ambiente',
    outlets: 94,
    articles: 231,
    delta: 15.9,
    accent: '#2EE6A8',
    frames: ['Ambiental', 'Científico'],
    headline: 'Desmatamento na Amazônia recua pelo terceiro mês',
  },
]

/* ── Cap. 3 — Como funciona (4 cartões) ─────────────────────────────────── */
export const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Cole um link',
    description:
      'Você cola a URL de qualquer notícia. O Prisma extrai o texto limpo, autor, veículo e data de publicação.',
    accent: '#2D6BFF',
    icon: 'link',
  },
  {
    step: '02',
    title: 'A IA entende o conteúdo',
    description:
      'O Engine identifica o tema, as entidades citadas e o enquadramento usado pelo veículo.',
    accent: '#8B5CF6',
    icon: 'brain',
  },
  {
    step: '03',
    title: 'Compara outras coberturas',
    description:
      'Embeddings e pgvector agrupam matérias semelhantes de dezenas de veículos sobre o mesmo fato.',
    accent: '#FFC24B',
    icon: 'compare',
  },
  {
    step: '04',
    title: 'Mostra o DNA da notícia',
    description:
      'Você recebe o radar de seis eixos, o nível de confiança, as evidências e o que ficou de fora.',
    accent: '#FF3B5C',
    icon: 'dna',
  },
]

/* ── Cap. 4 — Análise (coração do produto) ──────────────────────────────── */
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
  dominantFrame: 'Econômico',
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

/* ── Cap. 5 — Comparação Inteligente ────────────────────────────────────── */
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

/* ── Cap. 6 — BlindSpot Brasil ──────────────────────────────────────────── */
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

/* ── Cap. 7 — Prisma Replay ─────────────────────────────────────────────── */
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

/* ── Moat — Mapa de Polarização em Tempo Real ───────────────────────────── */
/** Os cinco enquadramentos acompanhados no mapa, derivados de FRAMES. */
export const POLARIZATION_THEMES = ['economia', 'seguranca', 'ambiente', 'saude', 'politica'].map(
  (key) => ({ key, ...frame(key) }),
)

/**
 * Cartograma do Brasil: cada UF ocupa uma célula (col, row).
 * `themes` = share de cobertura por tema (%); `polarization` = divergência
 * de enquadramento entre grupos de veículos (0 a 100).
 */
export const STATES = [
  { uf: 'RR', name: 'Roraima', col: 3, row: 0, outlets: 14, polarization: 61, themes: { economia: 18, seguranca: 34, ambiente: 26, saude: 12, politica: 10 } },
  { uf: 'AP', name: 'Amapá', col: 4, row: 0, outlets: 11, polarization: 44, themes: { economia: 20, seguranca: 22, ambiente: 34, saude: 14, politica: 10 } },
  { uf: 'AM', name: 'Amazonas', col: 2, row: 1, outlets: 38, polarization: 57, themes: { economia: 21, seguranca: 24, ambiente: 33, saude: 12, politica: 10 } },
  { uf: 'PA', name: 'Pará', col: 3, row: 1, outlets: 46, polarization: 66, themes: { economia: 24, seguranca: 22, ambiente: 32, saude: 11, politica: 11 } },
  { uf: 'MA', name: 'Maranhão', col: 5, row: 1, outlets: 29, polarization: 52, themes: { economia: 26, seguranca: 28, ambiente: 16, saude: 18, politica: 12 } },
  { uf: 'CE', name: 'Ceará', col: 6, row: 1, outlets: 52, polarization: 58, themes: { economia: 29, seguranca: 30, ambiente: 11, saude: 16, politica: 14 } },
  { uf: 'RN', name: 'Rio Grande do Norte', col: 7, row: 1, outlets: 26, polarization: 49, themes: { economia: 27, seguranca: 31, ambiente: 12, saude: 17, politica: 13 } },
  { uf: 'AC', name: 'Acre', col: 1, row: 2, outlets: 12, polarization: 47, themes: { economia: 19, seguranca: 27, ambiente: 31, saude: 13, politica: 10 } },
  { uf: 'RO', name: 'Rondônia', col: 2, row: 2, outlets: 17, polarization: 54, themes: { economia: 25, seguranca: 26, ambiente: 28, saude: 11, politica: 10 } },
  { uf: 'TO', name: 'Tocantins', col: 4, row: 2, outlets: 15, polarization: 41, themes: { economia: 30, seguranca: 22, ambiente: 24, saude: 13, politica: 11 } },
  { uf: 'PI', name: 'Piauí', col: 5, row: 2, outlets: 19, polarization: 45, themes: { economia: 28, seguranca: 25, ambiente: 15, saude: 20, politica: 12 } },
  { uf: 'PE', name: 'Pernambuco', col: 6, row: 2, outlets: 48, polarization: 63, themes: { economia: 28, seguranca: 32, ambiente: 10, saude: 16, politica: 14 } },
  { uf: 'PB', name: 'Paraíba', col: 7, row: 2, outlets: 24, polarization: 50, themes: { economia: 27, seguranca: 29, ambiente: 12, saude: 18, politica: 14 } },
  { uf: 'MT', name: 'Mato Grosso', col: 3, row: 3, outlets: 22, polarization: 59, themes: { economia: 38, seguranca: 18, ambiente: 27, saude: 9, politica: 8 } },
  { uf: 'GO', name: 'Goiás', col: 4, row: 3, outlets: 34, polarization: 55, themes: { economia: 35, seguranca: 24, ambiente: 14, saude: 15, politica: 12 } },
  { uf: 'BA', name: 'Bahia', col: 5, row: 3, outlets: 61, polarization: 64, themes: { economia: 27, seguranca: 30, ambiente: 14, saude: 15, politica: 14 } },
  { uf: 'AL', name: 'Alagoas', col: 6, row: 3, outlets: 18, polarization: 51, themes: { economia: 26, seguranca: 33, ambiente: 11, saude: 17, politica: 13 } },
  { uf: 'SE', name: 'Sergipe', col: 7, row: 3, outlets: 15, polarization: 46, themes: { economia: 27, seguranca: 30, ambiente: 12, saude: 18, politica: 13 } },
  { uf: 'MS', name: 'Mato Grosso do Sul', col: 3, row: 4, outlets: 21, polarization: 48, themes: { economia: 36, seguranca: 21, ambiente: 24, saude: 10, politica: 9 } },
  { uf: 'DF', name: 'Distrito Federal', col: 4, row: 4, outlets: 57, polarization: 78, themes: { economia: 26, seguranca: 14, ambiente: 8, saude: 10, politica: 42 } },
  { uf: 'MG', name: 'Minas Gerais', col: 5, row: 4, outlets: 72, polarization: 60, themes: { economia: 33, seguranca: 23, ambiente: 17, saude: 14, politica: 13 } },
  { uf: 'ES', name: 'Espírito Santo', col: 6, row: 4, outlets: 23, polarization: 47, themes: { economia: 32, seguranca: 26, ambiente: 18, saude: 13, politica: 11 } },
  { uf: 'PR', name: 'Paraná', col: 4, row: 5, outlets: 55, polarization: 62, themes: { economia: 37, seguranca: 22, ambiente: 15, saude: 14, politica: 12 } },
  { uf: 'SP', name: 'São Paulo', col: 5, row: 5, outlets: 143, polarization: 74, themes: { economia: 41, seguranca: 22, ambiente: 10, saude: 13, politica: 14 } },
  { uf: 'RJ', name: 'Rio de Janeiro', col: 6, row: 5, outlets: 98, polarization: 81, themes: { economia: 27, seguranca: 38, ambiente: 9, saude: 12, politica: 14 } },
  { uf: 'SC', name: 'Santa Catarina', col: 4, row: 6, outlets: 41, polarization: 53, themes: { economia: 39, seguranca: 21, ambiente: 17, saude: 12, politica: 11 } },
  { uf: 'RS', name: 'Rio Grande do Sul', col: 4, row: 7, outlets: 58, polarization: 69, themes: { economia: 34, seguranca: 23, ambiente: 20, saude: 12, politica: 11 } },
]

/* ── Cap. 9 — Prisma Engine ─────────────────────────────────────────────── */
export const ENGINE_PIPELINE = [
  { step: 1, title: 'Extrai o texto', detail: 'Limpeza de HTML, remoção de boilerplate e normalização do conteúdo.', tech: 'Edge Function' },
  { step: 2, title: 'Descobre o tema', detail: 'Classificação de assunto, entidades e enquadramento predominante.', tech: 'OpenAI' },
  { step: 3, title: 'Gera embeddings', detail: 'Vetorização semântica do texto para busca por similaridade.', tech: 'pgvector' },
  { step: 4, title: 'Agrupa notícias', detail: 'Clusterização de matérias sobre o mesmo fato, de veículos diferentes.', tech: 'PostgreSQL' },
  { step: 5, title: 'Calcula indicadores', detail: 'Os seis eixos do DNA, confiança e diversidade de fontes.', tech: 'Prisma Engine' },
  { step: 6, title: 'Explica', detail: 'Gera justificativa legível para cada indicador, com trechos citados.', tech: 'OpenAI' },
]

export const STACK = [
  { group: 'Front-end', items: ['Vue 3', 'Vite', 'Tailwind', 'Motion One', 'PWA'], accent: '#2D6BFF' },
  { group: 'Back-end', items: ['Supabase', 'PostgreSQL', 'Edge Functions'], accent: '#8B5CF6' },
  { group: 'Inteligência', items: ['OpenAI', 'pgvector', 'Embeddings'], accent: '#FFC24B' },
]

/* ── Cap. 10 — Banco inteligente ────────────────────────────────────────── */
export const DB_TABLES = [
  { name: 'users', purpose: 'Contas, preferências, favoritos e plano.', fields: ['id', 'email', 'plan', 'created_at'] },
  { name: 'sources', purpose: 'Veículos monitorados, alcance e região.', fields: ['id', 'name', 'scope', 'region'] },
  { name: 'news', purpose: 'Matérias coletadas com texto limpo e embedding.', fields: ['id', 'source_id', 'url', 'embedding'] },
  { name: 'topics', purpose: 'Temas descobertos pelo Engine.', fields: ['id', 'label', 'slug', 'trend_score'] },
  { name: 'clusters', purpose: 'Grupos de matérias sobre o mesmo fato.', fields: ['id', 'topic_id', 'size', 'window'] },
  { name: 'analysis', purpose: 'DNA calculado, confiança e explicações.', fields: ['id', 'news_id', 'dna', 'confidence'] },
]

/* ── Cap. 12 — Extensão Chrome ──────────────────────────────────────────── */
export const EXTENSION_PANELS = [
  { title: 'DNA da notícia', detail: 'O radar de seis eixos direto na barra lateral.' },
  { title: 'Comparação', detail: 'Como outros veículos trataram o mesmo fato.' },
  { title: 'Linha do tempo', detail: 'A evolução da narrativa desde a primeira publicação.' },
  { title: 'Notícias relacionadas', detail: 'Matérias do mesmo cluster semântico.' },
]

/* ── Cap. 11 — Recursos do app ──────────────────────────────────────────── */
export const APP_FEATURES = [
  { title: 'Modo escuro', detail: 'Midnight como padrão da marca, com alternância instantânea.' },
  { title: 'Notificações', detail: 'Alertas quando a narrativa de um tema seguido muda de ângulo.' },
  { title: 'Favoritos', detail: 'Salve análises e acompanhe a evolução de cada cluster.' },
  { title: 'Leitura offline', detail: 'Service worker guarda suas últimas análises para ler sem rede.' },
]

/* ── Cap. 13 — Pitch Deck (20 slides) ───────────────────────────────────── */
export const PITCH_SLIDES = [
  'Capa', 'Problema', 'Mercado', 'Solução', 'Produto', 'Demo', 'Tecnologia', 'IA',
  'Diferenciais', 'Monetização', 'TAM', 'Concorrência', 'Roadmap', 'Go-to-Market',
  'Time', 'Crescimento', 'API', 'Investimento', 'Visão', 'Contato',
]

/* ── Cap. 1 — Arquétipos ────────────────────────────────────────────────── */
export const ARCHETYPES = [
  { name: 'Sábio', word: 'conhecimento', detail: 'Explicamos com método e transparência, nunca com opinião.', accent: '#2D6BFF' },
  { name: 'Explorador', word: 'descoberta', detail: 'Mostramos ângulos que ninguém tinha olhado ainda.', accent: '#8B5CF6' },
  { name: 'Criador', word: 'inovação', detail: 'Construímos tecnologia proprietária para ler o noticiário.', accent: '#FFC24B' },
]

/* ── Helpers ────────────────────────────────────────────────────────────── */

/** Retorna o tema dominante de um estado, com fallback seguro. */
export function dominantTheme(state) {
  const [key] = Object.entries(state.themes).sort((a, b) => b[1] - a[1])[0]
  return POLARIZATION_THEMES.find((t) => t.key === key) ?? { key, ...frame(key) }
}

/**
 * Cor do índice de polarização (0–100). Fonte única para o cartograma e para
 * os painéis, evitando que a mesma UF apareça com severidades divergentes.
 */
export function polarizationColor(value) {
  if (value >= 66) return FRAMES.seguranca.color
  if (value >= 50) return FRAMES.economia.color
  return FRAMES.ambiente.color
}

/**
 * Geometria do radar do DNA — fonte única usada pelo radar da interface e
 * pelo cartão compartilhável, para que os dois desenhem exatamente a mesma
 * forma. `value` é sempre 0–100; `radius` define a escala do desenho.
 */
export function radarPoint({ index, count = DNA_AXES.length, value, center, radius }) {
  const angle = (Math.PI * 2 * index) / count - Math.PI / 2
  const r = (Math.max(0, Math.min(100, value)) / 100) * radius
  return [center + Math.cos(angle) * r, center + Math.sin(angle) * r]
}

/** Converte uma série do DNA em `points` de <polygon>. */
export function radarPolygon(series, { center, radius, axes = DNA_AXES }) {
  return axes
    .map((axis, index) =>
      radarPoint({ index, count: axes.length, value: series?.[axis.key] ?? 0, center, radius })
        .map((n) => n.toFixed(1))
        .join(','),
    )
    .join(' ')
}

/** Média dos seis eixos (usada como "índice Prisma"). */
export function dnaAverage(dna) {
  const values = DNA_AXES.map((a) => dna[a.key] ?? 0)
  return Math.round(values.reduce((s, v) => s + v, 0) / values.length)
}

/**
 * Simula a análise de uma URL. Gera um DNA determinístico a partir da string,
 * para que o mesmo link sempre devolva o mesmo resultado.
 */
export function analyzeUrl(url) {
  const seed = Array.from(String(url)).reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 100000, 7)
  const pick = (offset, min, max) => min + ((seed >> offset) % (max - min + 1))

  let host = 'veiculo-exemplo.com.br'
  try {
    host = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.replace(/^www\./, '')
  } catch {
    /* mantém o host padrão */
  }

  const dna = {
    emocao: pick(1, 28, 78),
    fontes: pick(2, 35, 88),
    evidencias: pick(3, 40, 95),
    persuasao: pick(4, 22, 72),
    equilibrio: pick(5, 38, 90),
    narrativa: pick(6, 30, 85),
  }

  return {
    ...SAMPLE_ANALYSIS,
    id: `an_${seed.toString(36)}`,
    url,
    outlet: host,
    dna,
    confidence: Math.round((dna.evidencias * 0.45 + dna.fontes * 0.3 + dna.equilibrio * 0.25) * 0.98),
    sourceDiversity: dna.fontes,
    clusterSize: pick(7, 8, 62),
  }
}
