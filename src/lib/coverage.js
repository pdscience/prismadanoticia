import { BIAS_COLORS } from '@/lib/bias'
import { isDemoUrl } from '@/lib/perspectives'

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
  return { ...definition, rows: [], count: 0, percent: 0 }
}

function toPercentages(counts) {
  const total = counts.reduce((sum, count) => sum + count, 0)
  if (!total) return [0, 0, 0]

  const raw = counts.map((count) => (count / total) * 100)
  const rounded = raw.map(Math.floor)
  const remainder = 100 - rounded.reduce((sum, value) => sum + value, 0)

  const ranked = raw
    .map((value, index) => ({ index, fraction: value - rounded[index] }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index)

  for (let index = 0; index < remainder; index += 1) {
    rounded[ranked[index].index] += 1
  }

  return rounded
}

export function buildCoverage(rows = [], story = null) {
  const byOutlet = new Map()

  for (const row of rows) {
    if (!row || !row.outlet || !row.text_label) continue
    if (story?.cluster_id && row.cluster_id !== story.cluster_id) continue
    if (isDemoUrl(row.url)) continue
    if (!SIDE_BY_LABEL.has(row.text_label)) continue

    const current = byOutlet.get(row.outlet)
    if (!current || isBetter(row, current)) byOutlet.set(row.outlet, row)
  }

  const sides = SIDE_DEFINITIONS.map(emptySide)
  const uncertain = {
    key: 'incerta',
    label: 'Incerta',
    color: BIAS_COLORS.mista,
    rows: [],
    count: 0,
  }

  for (const row of byOutlet.values()) {
    const key = SIDE_BY_LABEL.get(row.text_label)
    const target = key === 'incerta' ? uncertain : sides.find((side) => side.key === key)
    target.rows.push(row)
  }

  sides.forEach((side) => sortRows(side.rows))
  sortRows(uncertain.rows)

  const percentages = toPercentages(sides.map((side) => side.rows.length))
  sides.forEach((side, index) => {
    side.count = side.rows.length
    side.percent = percentages[index]
  })
  uncertain.count = uncertain.rows.length

  const totalClassified = sides.reduce((sum, side) => sum + side.count, 0)
  const totalUncertain = uncertain.count
  const represented = sides.filter((side) => side.count).map((side) => side.key)
  const missing = sides.filter((side) => !side.count).map((side) => side.key)
  const dominantSide = sides.reduce(
    (best, side) => (!best || side.count > best.count ? side : best),
    null,
  )
  const dominant = dominantSide?.count ? dominantSide.key : null
  const dominantShare = dominant ? dominantSide.percent / 100 : 0
  const coverage =
    totalClassified === 0
      ? 'sem-dados'
      : represented.length === 3
        ? 'tres-lados'
        : represented.length === 2
          ? 'dois-lados'
          : 'um-lado'

  let blindspot = null
  if (totalClassified >= 3) {
    const lowest = sides.reduce(
      (best, side) => (side.percent < best.percent ? side : best),
      sides[0],
    )
    if (lowest.percent <= 10) {
      blindspot = {
        side: lowest.key,
        percent: lowest.percent,
        severity: totalClassified >= 5 ? 'confirmed' : 'possible',
      }
    }
  }

  return {
    story,
    clusterId: story?.cluster_id ?? rows[0]?.cluster_id ?? null,
    totalOutlets: totalClassified + totalUncertain,
    totalClassified,
    totalUncertain,
    sides,
    uncertain,
    percentages: {
      esquerda: percentages[0],
      centro: percentages[1],
      direita: percentages[2],
    },
    represented,
    missing,
    dominant,
    dominantShare,
    coverage,
    sampleReliable: totalClassified >= 5,
    blindspot,
  }
}
