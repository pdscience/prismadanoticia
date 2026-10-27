import { BIAS_SAMPLE, COMPARISON, SAMPLE_ANALYSIS, STATES, TRENDS } from '@/data'
import { analyzeUrl } from '@/lib/analysis'
import { buildComparison } from '@/lib/comparison'
import { buildCoverage } from '@/lib/coverage'
import { insforge, useMockData } from '@/lib/insforge'
import { buildPerspectives } from '@/lib/perspectives'

const DEFAULT_TOPIC = 'reforma-tributaria'

function ensure(result) {
  if (result?.error) throw new Error(result.error.message || 'Erro ao consultar o InsForge')
  return result?.data
}

function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function withFallback(task, fallback) {
  if (useMockData || !insforge) return fallback()
  try {
    return await task()
  } catch (error) {
    if (import.meta.env.DEV) console.warn('[insforge] fallback para dados mock:', error)
    return fallback()
  }
}

function mapAnalysis(row) {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    outlet: row.outlet,
    author: row.author,
    publishedAt: row.published_at,
    topic: row.topic,
    readingTime: row.reading_time,
    confidence: row.confidence,
    sourceDiversity: row.source_diversity,
    clusterId: row.cluster_id ?? null,
    clusterSize: row.cluster_size ?? 1,
    dominantFrame: row.dominant_frame,
    summary: row.summary ?? [],
    dna: row.dna ?? {},
    evidences: row.evidences ?? [],
    signals: row.signals ?? [],
  }
}

/**
 * Tendências: cobertura real por tema nos últimos 7 dias.
 * Em mock devolve a fixture local; em produção lê `trend_feed` e não substitui
 * falha por número fictício — o erro sobe para a tela.
 */
export async function fetchTrends() {
  if (useMockData || !insforge) return TRENDS

  const rows = ensure(
    await insforge.database
      .from('trend_feed')
      .select('topic_slug,label,accent,frame_keys,headline,outlets,articles,delta,has_baseline')
      .limit(10),
  )

  return rows.map((row) => ({
    id: row.topic_slug,
    label: row.label,
    outlets: row.outlets ?? 0,
    articles: row.articles ?? 0,
    delta: Number(row.delta ?? 0),
    hasBaseline: Boolean(row.has_baseline),
    accent: row.accent,
    frames: row.frame_keys ?? [],
    headline: row.headline ?? '',
  }))
}

/** Contagem real de veículos, análises e temas monitorados pelo Engine. */
export async function fetchStats() {
  if (useMockData || !insforge) return { outlets: 0, analyses: 0, topics: 0 }

  try {
    const row = ensure(
      await insforge.database
        .from('stats_feed')
        .select('outlets,analyses,topics')
        .limit(1)
        .maybeSingle(),
    )
    return {
      outlets: row?.outlets ?? 0,
      analyses: row?.analyses ?? 0,
      topics: row?.topics ?? 0,
    }
  } catch {
    return { outlets: 0, analyses: 0, topics: 0 }
  }
}

export async function fetchAnalysis(url = SAMPLE_ANALYSIS.url, { topic = '' } = {}) {
  if (useMockData || !insforge) {
    return url === SAMPLE_ANALYSIS.url ? SAMPLE_ANALYSIS : analyzeUrl(url)
  }

  const row = ensure(
    await insforge.database
      .from('analysis_feed')
      .select(
        'id,url,title,outlet,author,published_at,topic,reading_time,confidence,source_diversity,cluster_id,cluster_size,dominant_frame,summary,evidences,signals,dna',
      )
      .eq('url', url)
      .maybeSingle(),
  )
  if (row) return mapAnalysis(row)

  const { data, error } = await insforge.functions.invoke('analyze-url', {
    body: { url, ...(topic ? { topic } : {}) },
  })
  if (error) throw new Error(error.message || 'Não foi possível analisar esta URL.')

  const analysis = data?.analysis ?? data
  if (!analysis?.title) throw new Error('A análise não retornou dados válidos.')
  return { ...analysis, clusterSize: analysis.clusterSize ?? 1 }
}

/**
 * Busca matérias sobre um tema na internet.
 * A edge function devolve candidatos crus; o filtro de veículos acontece no front.
 */
export async function searchWebCoverage(topic) {
  if (useMockData || !insforge) {
    throw new Error('A busca na internet está indisponível no modo demonstração.')
  }

  const { data, error } = await insforge.functions.invoke('search-web', { body: { topic } })
  if (error) throw new Error(error.message || 'Não foi possível buscar na internet.')

  return {
    topic: data?.topic ?? topic,
    results: Array.isArray(data?.results) ? data.results : [],
    cached: Boolean(data?.cached),
  }
}

/**
 * Analisa uma lista de matérias (busca web) com o mesmo Engine da Análise.
 * Duas matérias por vez para não estourar o tempo da função.
 */
export async function analyzeArticles(urls, topic = '', onProgress) {
  const queue = [...urls]
  const analyses = []
  const failures = []

  const worker = async () => {
    while (queue.length) {
      const url = queue.shift()
      try {
        const analysis = await fetchAnalysis(url, { topic })
        if (analysis) analyses.push(analysis)
      } catch (error) {
        failures.push({
          url,
          message: error instanceof Error ? error.message : 'Falha ao analisar a matéria.',
        })
      }
      onProgress?.(analyses.length + failures.length, urls.length)
    }
  }

  const workers = Array.from({ length: Math.min(2, queue.length) }, worker)
  await Promise.all(workers)
  return { analyses, failures }
}

export async function fetchSampleAnalysis() {
  try {
    return await fetchAnalysis(SAMPLE_ANALYSIS.url)
  } catch {
    return SAMPLE_ANALYSIS
  }
}

export function fetchComparison(topic = COMPARISON.topic) {
  const slug = slugify(topic) || DEFAULT_TOPIC
  return withFallback(
    async () => {
      const rows = ensure(
        await insforge.database
          .from('analysis_feed')
          .select(
            'id,outlet,highlight,angle,tone,dna,accent,topic,topic_slug,url,published_at,confidence',
          )
          .eq('topic_slug', slug)
          .limit(20),
      )
      const comparison = buildComparison(rows, topic)
      if (comparison.rows.length < 2)
        throw new Error('Comparação requer ao menos 2 veículos distintos')
      return comparison
    },
    () => ({
      ...COMPARISON,
      requestedTopic: topic,
      outletCount: COMPARISON.rows.length,
      demo: true,
    }),
  )
}

export function fetchPerspectives(clusterId) {
  if (!clusterId) return buildPerspectives([], { clusterId: null })
  if (useMockData || !insforge) return buildPerspectives([], { clusterId })

  return withFallback(
    async () => {
      const rows = ensure(
        await insforge.database
          .from('perspective_feed')
          .select(
            'news_id,cluster_id,outlet,title,url,published_at,text_label,confidence,overall_score',
          )
          .eq('cluster_id', clusterId)
          .limit(40),
      )
      return buildPerspectives(rows, { clusterId })
    },
    () => buildPerspectives([], { clusterId }),
  )
}

export async function fetchCoverage({ url, clusterId } = {}) {
  if (useMockData || !insforge) return buildCoverage([], null)

  let story = null

  if (url) {
    const rows = ensure(
      await insforge.database
        .from('analysis_feed')
        .select('title,outlet,url,published_at,topic,topic_slug,cluster_id,cluster_size,confidence')
        .eq('url', url)
        .limit(1),
    )
    story = rows?.[0] ?? null
    if (!story) {
      throw new Error('Esta matéria ainda não foi analisada. Abra a Análise para processá-la.')
    }
  } else if (clusterId) {
    const rows = ensure(
      await insforge.database
        .from('analysis_feed')
        .select('title,outlet,url,published_at,topic,topic_slug,cluster_id,cluster_size,confidence')
        .eq('cluster_id', clusterId)
        .order('published_at', { ascending: false })
        .limit(1),
    )
    story = rows?.[0] ?? null
  }

  if (!story?.cluster_id) return buildCoverage([], null)

  const rows = ensure(
    await insforge.database
      .from('perspective_feed')
      .select(
        'news_id,cluster_id,outlet,title,url,published_at,text_label,confidence,curated_label,curated_confidence,outlet_estimate_label,outlet_estimate_confidence',
      )
      .eq('cluster_id', story.cluster_id)
      .limit(100),
  )

  return buildCoverage(rows, story)
}

export function fetchStates() {
  return withFallback(
    async () => {
      const rows = ensure(
        await insforge.database
          .from('state_metrics')
          .select('uf,name,grid_col,grid_row,outlets,polarization,themes')
          .order('grid_row')
          .order('grid_col')
          .limit(30),
      )
      return rows.map(({ grid_col, grid_row, ...rest }) => ({
        ...rest,
        col: grid_col,
        row: grid_row,
      }))
    },
    () => STATES,
  )
}

function mapBiasSignal(signal) {
  return {
    type: signal.type,
    strength: signal.strength,
    quote: signal.quote,
    explanation: signal.explanation,
    favoredSide: signal.favoredSide ?? signal.favored_side ?? 'incerto',
  }
}

function mapBiasRow(row) {
  return {
    id: row.id,
    newsId: row.news_id,
    url: row.url,
    title: row.title,
    outlet: row.outlet,
    sourceSlug: row.source_slug,
    author: row.author,
    publishedAt: row.published_at,
    topic: row.topic,
    topicSlug: row.topic_slug,
    textLabel: row.text_label,
    economicAxis: row.economic_axis,
    socialAxis: row.social_axis,
    overallScore: row.overall_score,
    confidence: row.confidence,
    outletEstimateLabel: row.outlet_estimate_label,
    outletEstimateConfidence: row.outlet_estimate_confidence,
    outletEstimateRationale: row.outlet_estimate_rationale,
    distortionRisk: row.distortion_risk,
    distortionSummary: row.distortion_summary,
    favoredSide: row.favored_side,
    summary: row.summary,
    signals: (row.signals ?? []).map(mapBiasSignal),
    evidence: row.evidence ?? [],
    curated: row.curated_label
      ? {
          label: row.curated_label,
          economicAxis: row.curated_economic_axis,
          socialAxis: row.curated_social_axis,
          confidence: row.curated_confidence,
          methodology: row.curated_methodology,
          referenceUrl: row.curated_reference_url,
          reviewedAt: row.curated_reviewed_at,
        }
      : null,
    methodologyVersion: row.methodology_version,
    model: row.model,
    createdAt: row.created_at,
  }
}

export function fetchBiasSample() {
  return BIAS_SAMPLE
}

/**
 * Enquadramento mais recente já calculado no backend.
 * Serve de exemplo real na tela de Radar; devolve null quando não há dado
 * (ou quando a consulta falha), para a tela sinalizar o exemplo ilustrativo.
 */
export async function fetchLatestBias() {
  if (useMockData || !insforge) return null

  try {
    const rows = ensure(
      await insforge.database
        .from('bias_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5),
    )
    const row = (rows ?? []).find((item) => !String(item.url ?? '').includes('exemplo.com.br'))
    return row ? mapBiasRow(row) : null
  } catch {
    return null
  }
}

export async function fetchBiasAnalysis(url = BIAS_SAMPLE.url) {
  if (useMockData || !insforge) return BIAS_SAMPLE

  const cached = ensure(
    await insforge.database
      .from('bias_feed')
      .select('*')
      .eq('url', url)
      .eq('methodology_version', 'v1')
      .maybeSingle(),
  )
  if (cached) return mapBiasRow(cached)

  await fetchAnalysis(url)

  const { data, error } = await insforge.functions.invoke('analyze-bias', { body: { url } })
  if (error) throw new Error(error.message || 'Não foi possível analisar o enquadramento.')

  const analysis = data?.analysis ?? data
  if (!analysis?.textLabel)
    throw new Error('A análise de enquadramento não retornou dados válidos.')
  return analysis
}
