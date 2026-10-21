import { BIAS_COLORS } from '@/lib/bias'

const DEMO_HOST = 'exemplo.com.br'

const SIDE_DEFINITIONS = [
  { key: 'esquerda', label: 'Esquerda', color: BIAS_COLORS.esquerda },
  { key: 'centro', label: 'Centro', color: BIAS_COLORS.centro },
  { key: 'direita', label: 'Direita', color: BIAS_COLORS.direita },
]

const SIDE_BY_LABEL = new Map([
  ['esquerda', 'esquerda'],
  ['centro-esquerda', 'esquerda'],
  ['centro', 'centro'],
  ['centro-direita', 'direita'],
  ['direita', 'direita'],
  ['mista', 'incerta'],
])

export function isDemoUrl(value) {
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

function sortRows(rows) {
  return rows.sort((a, b) => {
    const dateA = timestamp(a.published_at)
    const dateB = timestamp(b.published_at)
    if (dateA !== dateB) {
      if (dateA === null) return 1
      if (dateB === null) return -1
      return dateB - dateA
    }
    return (b.confidence ?? 0) - (a.confidence ?? 0)
  })
}

function emptySide(definition) {
  return { ...definition, rows: [] }
}

export function buildPerspectives(rows = [], { clusterId = null } = {}) {
  const byOutlet = new Map()

  for (const row of rows) {
    if (!row || !row.outlet || !row.text_label) continue
    if (clusterId && row.cluster_id !== clusterId) continue
    if (isDemoUrl(row.url)) continue
    if (!SIDE_BY_LABEL.has(row.text_label)) continue

    const current = byOutlet.get(row.outlet)
    if (!current || isBetter(row, current)) byOutlet.set(row.outlet, row)
  }

  const sides = SIDE_DEFINITIONS.map(emptySide)
  const uncertain = emptySide({
    key: 'incerta',
    label: 'Incerta',
    color: BIAS_COLORS.mista,
  })

  for (const row of byOutlet.values()) {
    const key = SIDE_BY_LABEL.get(row.text_label)
    const target = key === 'incerta' ? uncertain : sides.find((side) => side.key === key)
    target.rows.push(row)
  }

  sides.forEach((side) => sortRows(side.rows))
  sortRows(uncertain.rows)

  const total = sides.reduce((sum, side) => sum + side.rows.length, uncertain.rows.length)
  const represented = sides.filter((side) => side.rows.length).map((side) => side.key)
  const missing = sides.filter((side) => !side.rows.length).map((side) => side.key)
  const dominantSide = sides.reduce(
    (best, side) => (!best || side.rows.length > best.rows.length ? side : best),
    null,
  )
  const dominant = dominantSide?.rows.length ? dominantSide.key : null
  const dominantShare = dominant ? dominantSide.rows.length / total : 0
  const coverage =
    total === 0
      ? 'sem-dados'
      : represented.length === 3
        ? 'tres-lados'
        : represented.length === 2
          ? 'dois-lados'
          : 'um-lado'

  return {
    clusterId,
    total,
    sides,
    uncertain,
    represented,
    missing,
    dominant,
    dominantShare,
    coverage,
    sampleReliable: total >= 3,
  }
}
