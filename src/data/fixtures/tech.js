/** Dados de demonstração da arquitetura, banco e recursos do produto. */

export const ENGINE_PIPELINE = [
  {
    step: 1,
    title: 'Extrai o texto',
    detail: 'Limpeza de HTML, remoção de boilerplate e normalização do conteúdo.',
    tech: 'Edge Function',
  },
  {
    step: 2,
    title: 'Descobre o tema',
    detail: 'Classificação de assunto, entidades e enquadramento predominante.',
    tech: 'OpenAI',
  },
  {
    step: 3,
    title: 'Gera embeddings',
    detail: 'Vetorização semântica do texto para busca por similaridade.',
    tech: 'pgvector',
  },
  {
    step: 4,
    title: 'Agrupa notícias',
    detail: 'Clusterização de matérias sobre o mesmo fato, de veículos diferentes.',
    tech: 'PostgreSQL',
  },
  {
    step: 5,
    title: 'Calcula indicadores',
    detail: 'Os seis eixos do DNA, confiança e diversidade de fontes.',
    tech: 'Prisma Engine',
  },
  {
    step: 6,
    title: 'Explica',
    detail: 'Gera justificativa legível para cada indicador, com trechos citados.',
    tech: 'OpenAI',
  },
]

export const STACK = [
  {
    group: 'Front-end',
    items: ['Vue 3', 'Vite', 'Tailwind', 'Motion One', 'PWA'],
    accent: '#2D6BFF',
  },
  { group: 'Back-end', items: ['InsForge', 'PostgreSQL', 'Edge Functions'], accent: '#8B5CF6' },
  { group: 'Inteligência', items: ['OpenAI', 'pgvector', 'Embeddings'], accent: '#FFC24B' },
]

export const DB_TABLES = [
  {
    name: 'users',
    purpose: 'Contas, preferências, favoritos e plano.',
    fields: ['id', 'email', 'plan', 'created_at'],
  },
  {
    name: 'sources',
    purpose: 'Veículos monitorados, alcance e região.',
    fields: ['id', 'name', 'scope', 'region'],
  },
  {
    name: 'news',
    purpose: 'Matérias coletadas com texto limpo e embedding.',
    fields: ['id', 'source_id', 'url', 'embedding'],
  },
  {
    name: 'topics',
    purpose: 'Temas descobertos pelo Engine.',
    fields: ['id', 'label', 'slug', 'trend_score'],
  },
  {
    name: 'clusters',
    purpose: 'Grupos de matérias sobre o mesmo fato.',
    fields: ['id', 'topic_id', 'size', 'window'],
  },
  {
    name: 'analyses',
    purpose: 'DNA calculado, confiança e explicações.',
    fields: ['id', 'news_id', 'dna', 'confidence'],
  },
]

export const EXTENSION_PANELS = [
  { title: 'DNA da notícia', detail: 'O radar de seis eixos direto na barra lateral.' },
  { title: 'Comparação', detail: 'Como outros veículos trataram o mesmo fato.' },
  { title: 'Linha do tempo', detail: 'A evolução da narrativa desde a primeira publicação.' },
  { title: 'Notícias relacionadas', detail: 'Matérias do mesmo cluster semântico.' },
]

export const APP_FEATURES = [
  { title: 'Modo escuro', detail: 'Midnight como padrão da marca, com alternância instantânea.' },
  {
    title: 'Notificações',
    detail: 'Alertas quando a narrativa de um tema seguido muda de ângulo.',
  },
  { title: 'Favoritos', detail: 'Salve análises e acompanhe a evolução de cada cluster.' },
  {
    title: 'Leitura offline',
    detail: 'Service worker guarda suas últimas análises para ler sem rede.',
  },
]
