import { BIAS_SAMPLE, BLINDSPOT, COMPARISON, REPLAY, SAMPLE_ANALYSIS, STATES, TRENDS } from '@/data'
import { analyzeUrl } from '@/lib/analysis'
import { insforge, useMockData } from '@/lib/insforge'

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

export function fetchTrends() {
  return withFallback(
    async () => {
      const rows = ensure(
        await insforge.database
          .from('topics')
          .select('slug,label,outlets_count,articles_count,delta,accent,headline,frame_keys')
          .eq('show_in_trends', true)
          .order('trend_score', { ascending: false })
          .limit(10),
      )
      return rows.map((row) => ({
        id: row.slug,
        label: row.label,
        outlets: row.outlets_count,
        articles: row.articles_count,
        delta: Number(row.delta),
        accent: row.accent,
        frames: row.frame_keys,
        headline: row.headline,
      }))
    },
    () => TRENDS,
  )
}

export async function fetchAnalysis(url = SAMPLE_ANALYSIS.url) {
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

  const { data, error } = await insforge.functions.invoke('analyze-url', { body: { url } })
  if (error) throw new Error(error.message || 'Não foi possível analisar esta URL.')

  const analysis = data?.analysis ?? data
  if (!analysis?.title) throw new Error('A análise não retornou dados válidos.')
  return { ...analysis, clusterSize: analysis.clusterSize ?? 1 }
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
          .select('outlet,highlight,angle,tone,dna,accent,topic,topic_slug,cluster_size')
          .eq('topic_slug', slug)
          .limit(20),
      )
      const compared = rows.filter((row) => row.highlight)
      if (!compared.length) throw new Error('Sem comparação para este tema')
      return {
        topic: rows[0].topic,
        requestedTopic: topic,
        window: COMPARISON.window,
        clusterSize: rows[0].cluster_size ?? rows.length,
        demo: false,
        rows: compared.map((row) => ({
          outlet: row.outlet,
          highlight: row.highlight,
          angle: row.angle,
          tone: row.tone,
          dna: row.dna,
          accent: row.accent,
        })),
      }
    },
    () => ({ ...COMPARISON, requestedTopic: topic, demo: true }),
  )
}

export function fetchBlindspot(topic = BLINDSPOT.topic) {
  const slug = slugify(topic) || DEFAULT_TOPIC
  return withFallback(
    async () => {
      const topicRow = ensure(
        await insforge.database
          .from('topics')
          .select('id,label,slug')
          .eq('slug', slug)
          .maybeSingle(),
      )
      if (!topicRow) throw new Error('Tema não encontrado')

      const [report, coverage, gaps, subthemes] = await Promise.all([
        insforge.database
          .from('blindspot_reports')
          .select('window_label,note')
          .eq('topic_id', topicRow.id)
          .maybeSingle(),
        insforge.database
          .from('blindspot_coverage')
          .select('outlet,articles')
          .eq('topic_id', topicRow.id)
          .order('sort_order')
          .limit(20),
        insforge.database
          .from('blindspot_gaps')
          .select('outlet,reach,last_mention,severity')
          .eq('topic_id', topicRow.id)
          .order('sort_order')
          .limit(20),
        insforge.database
          .from('blindspot_subthemes')
          .select('label,coverage')
          .eq('topic_id', topicRow.id)
          .order('sort_order')
          .limit(20),
      ])

      const reportRow = ensure(report)
      return {
        topic: topicRow.label,
        requestedTopic: topic,
        window: reportRow?.window_label ?? BLINDSPOT.window,
        note: reportRow?.note ?? BLINDSPOT.note,
        demo: false,
        covered: ensure(coverage).map((row) => ({ outlet: row.outlet, articles: row.articles })),
        missing: ensure(gaps).map((row) => ({
          outlet: row.outlet,
          reach: row.reach,
          lastMention: row.last_mention,
          severity: row.severity,
        })),
        subthemes: ensure(subthemes).map((row) => ({
          label: row.label,
          coverage: row.coverage,
        })),
      }
    },
    () => ({ ...BLINDSPOT, requestedTopic: topic, demo: true }),
  )
}

export function fetchReplay(topic = REPLAY.topic) {
  const slug = slugify(topic) || DEFAULT_TOPIC
  return withFallback(
    async () => {
      const topicRow = ensure(
        await insforge.database
          .from('topics')
          .select('id,label,slug')
          .eq('slug', slug)
          .maybeSingle(),
      )
      if (!topicRow) throw new Error('Tema não encontrado')

      const rows = ensure(
        await insforge.database
          .from('replay_events')
          .select('time_label,label,outlets,dominant_frame,sentiment,description,mix')
          .eq('topic_id', topicRow.id)
          .order('sort_order')
          .limit(30),
      )

      return {
        topic: topicRow.label,
        requestedTopic: topic,
        demo: false,
        frames: rows.map((row) => ({
          time: row.time_label,
          label: row.label,
          outlets: row.outlets,
          dominantFrame: row.dominant_frame,
          sentiment: row.sentiment,
          description: row.description,
          mix: row.mix,
        })),
      }
    },
    () => ({ ...REPLAY, requestedTopic: topic, demo: true }),
  )
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
