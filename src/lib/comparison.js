const DEMO_HOST = 'exemplo.com.br'
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function isDemoUrl(value) {
  try {
    const host = new URL(value).hostname.toLowerCase()
    return host === DEMO_HOST || host.endsWith(`.${DEMO_HOST}`)
  } catch {
    return false
  }
}

function timestamp(value) {
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? null : parsed
}

function isBetter(candidate, current) {
  const candidateDate = timestamp(candidate.published_at)
  const currentDate = timestamp(current.published_at)
  if (candidateDate !== currentDate) {
    if (candidateDate === null) return false
    if (currentDate === null) return true
    return candidateDate > currentDate
  }
  return (candidate.confidence ?? 0) > (current.confidence ?? 0)
}

function formatDate(value) {
  const parsed = timestamp(value)
  if (parsed === null) return null
  const date = new Date(parsed)
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${day} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

function formatWindow(rows) {
  const dates = [
    ...new Set(rows.map((row) => timestamp(row.published_at)).filter((value) => value !== null)),
  ].sort((a, b) => a - b)
  if (!dates.length) return 'Análises disponíveis'
  const labels = dates.map((value) => formatDate(new Date(value).toISOString()))
  if (labels.length === 1) return labels[0]
  return `${labels[0]} – ${labels[labels.length - 1]}`
}

export function buildComparison(rows, requestedTopic) {
  const byOutlet = new Map()

  for (const row of rows) {
    if (!row.highlight || isDemoUrl(row.url)) continue
    const current = byOutlet.get(row.outlet)
    if (!current || isBetter(row, current)) byOutlet.set(row.outlet, row)
  }

  const selected = [...byOutlet.values()]

  return {
    topic: selected[0]?.topic ?? requestedTopic,
    requestedTopic,
    window: formatWindow(selected),
    outletCount: selected.length,
    demo: false,
    rows: selected.map((row) => ({
      id: row.id,
      outlet: row.outlet,
      highlight: row.highlight,
      angle: row.angle,
      tone: row.tone,
      dna: row.dna,
      accent: row.accent,
      url: row.url,
      publishedAt: row.published_at,
      confidence: row.confidence,
    })),
  }
}
