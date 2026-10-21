import { DNA_AXES } from '@/data/frames'

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
