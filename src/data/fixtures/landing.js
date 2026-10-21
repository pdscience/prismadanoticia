/** Dados de demonstração das seções da landing page. */

export const TRENDS = [
  {
    id: 'stf',
    label: 'STF',
    outlets: 128,
    articles: 412,
    delta: 12.4,
    accent: '#8B5CF6',
    frames: ['juridico', 'politica'],
    headline: 'Julgamento sobre marco temporal entra na pauta da semana',
  },
  {
    id: 'congresso',
    label: 'Congresso',
    outlets: 143,
    articles: 507,
    delta: 8.1,
    accent: '#2D6BFF',
    frames: ['politica', 'economia'],
    headline: 'Relator apresenta novo texto da reforma tributária',
  },
  {
    id: 'economia',
    label: 'Economia',
    outlets: 167,
    articles: 638,
    delta: 21.7,
    accent: '#FFC24B',
    frames: ['economia'],
    headline: 'Copom sinaliza manutenção da taxa básica de juros',
  },
  {
    id: 'seguranca',
    label: 'Segurança',
    outlets: 119,
    articles: 356,
    delta: -4.3,
    accent: '#FF3B5C',
    frames: ['seguranca', 'social'],
    headline: 'Operação integrada muda dinâmica de facções no Sudeste',
  },
  {
    id: 'meio-ambiente',
    label: 'Meio Ambiente',
    outlets: 94,
    articles: 231,
    delta: 15.9,
    accent: '#2EE6A8',
    frames: ['ambiente'],
    headline: 'Desmatamento na Amazônia recua pelo terceiro mês',
  },
]

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
