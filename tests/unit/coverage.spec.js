import { describe, expect, it } from 'vitest'

import { buildCoverage } from '@/lib/coverage'

function row(overrides = {}) {
  return {
    news_id: overrides.news_id ?? overrides.outlet ?? 'news-1',
    cluster_id: 'cluster-1',
    outlet: 'Veículo',
    title: 'Título da matéria',
    url: 'https://g1.globo.com/politica/materia.ghtml',
    published_at: '2026-10-21T12:00:00+00:00',
    text_label: 'centro',
    confidence: 70,
    curated_label: null,
    curated_confidence: null,
    ...overrides,
  }
}

const story = {
  cluster_id: 'cluster-1',
  title: 'Manchete principal',
  outlet: 'G1',
  url: 'https://g1.globo.com/politica/materia.ghtml',
  published_at: '2026-10-21T12:00:00+00:00',
  topic: 'Política',
  cluster_size: 12,
}

describe('cobertura da história', () => {
  it('agrupa seis rótulos e calcula porcentagens', () => {
    const coverage = buildCoverage(
      [
        row({ news_id: '1', outlet: 'A', text_label: 'esquerda' }),
        row({ news_id: '2', outlet: 'B', text_label: 'centro-esquerda' }),
        row({ news_id: '3', outlet: 'C', text_label: 'centro' }),
        row({ news_id: '4', outlet: 'D', text_label: 'centro-direita' }),
        row({ news_id: '5', outlet: 'E', text_label: 'direita' }),
        row({ news_id: '6', outlet: 'F', text_label: 'mista' }),
      ],
      story,
    )

    expect(coverage.sides.map((side) => side.count)).toEqual([2, 1, 2])
    expect(coverage.percentages).toEqual({ esquerda: 40, centro: 20, direita: 40 })
    expect(coverage.totalClassified).toBe(5)
    expect(coverage.totalUncertain).toBe(1)
    expect(coverage.totalOutlets).toBe(6)
    expect(coverage.sampleReliable).toBe(true)
    expect(coverage.blindspot).toBeNull()
  })

  it('deduplica por veículo priorizando a matéria mais recente', () => {
    const coverage = buildCoverage([
      row({
        news_id: 'antiga',
        outlet: 'Folha',
        text_label: 'esquerda',
        published_at: '2026-10-20T12:00:00+00:00',
      }),
      row({
        news_id: 'recente',
        outlet: 'Folha',
        text_label: 'direita',
        published_at: '2026-10-21T12:00:00+00:00',
      }),
    ])

    expect(coverage.totalOutlets).toBe(1)
    expect(coverage.sides[0].count).toBe(0)
    expect(coverage.sides[2].rows[0].news_id).toBe('recente')
  })

  it('mantém incertas fora da barra e do denominador', () => {
    const coverage = buildCoverage([
      row({ news_id: '1', outlet: 'A', text_label: 'esquerda' }),
      row({ news_id: '2', outlet: 'B', text_label: 'centro-esquerda' }),
      row({ news_id: '3', outlet: 'C', text_label: 'mista' }),
    ])

    expect(coverage.percentages).toEqual({ esquerda: 100, centro: 0, direita: 0 })
    expect(coverage.uncertain.rows).toHaveLength(1)
    expect(coverage.totalClassified).toBe(2)
    expect(coverage.totalUncertain).toBe(1)
    expect(coverage.sampleReliable).toBe(false)
  })

  it('arredonda por maior resto para somar 100', () => {
    const coverage = buildCoverage([
      row({ news_id: '1', outlet: 'A', text_label: 'esquerda' }),
      row({ news_id: '2', outlet: 'B', text_label: 'centro' }),
      row({ news_id: '3', outlet: 'C', text_label: 'direita' }),
    ])

    expect(coverage.percentages).toEqual({ esquerda: 34, centro: 33, direita: 33 })
    expect(
      coverage.percentages.esquerda + coverage.percentages.centro + coverage.percentages.direita,
    ).toBe(100)
  })

  it('sinaliza possível ponto cego com 3 ou 4 veículos', () => {
    const coverage = buildCoverage([
      row({ news_id: '1', outlet: 'A', text_label: 'esquerda' }),
      row({ news_id: '2', outlet: 'B', text_label: 'centro-esquerda' }),
      row({ news_id: '3', outlet: 'C', text_label: 'centro' }),
    ])

    expect(coverage.blindspot).toEqual({ side: 'direita', percent: 0, severity: 'possible' })
    expect(coverage.sampleReliable).toBe(false)
  })

  it('confirma ponto cego com 5 ou mais veículos', () => {
    const coverage = buildCoverage([
      row({ news_id: '1', outlet: 'A', text_label: 'esquerda' }),
      row({ news_id: '2', outlet: 'B', text_label: 'esquerda' }),
      row({ news_id: '3', outlet: 'C', text_label: 'centro-esquerda' }),
      row({ news_id: '4', outlet: 'D', text_label: 'centro' }),
      row({ news_id: '5', outlet: 'E', text_label: 'esquerda' }),
    ])

    expect(coverage.blindspot).toEqual({ side: 'direita', percent: 0, severity: 'confirmed' })
    expect(coverage.sampleReliable).toBe(true)
  })

  it('não declara blindspot com menos de 3 veículos', () => {
    const coverage = buildCoverage([
      row({ news_id: '1', outlet: 'A', text_label: 'esquerda' }),
      row({ news_id: '2', outlet: 'B', text_label: 'centro' }),
    ])

    expect(coverage.blindspot).toBeNull()
  })

  it('ignora demonstração, sem rótulo e outro cluster', () => {
    const coverage = buildCoverage(
      [
        row({ outlet: 'Demo', url: 'https://exemplo.com.br/politica/materia' }),
        row({ outlet: 'Sem rótulo', text_label: null }),
        row({ outlet: 'Outro', cluster_id: 'cluster-2' }),
        row({ outlet: 'Real', news_id: 'real' }),
      ],
      story,
    )

    expect(coverage.totalOutlets).toBe(1)
    expect(coverage.sides[1].rows[0].news_id).toBe('real')
  })

  it('devolve estado vazio seguro', () => {
    const coverage = buildCoverage([])

    expect(coverage.totalOutlets).toBe(0)
    expect(coverage.totalClassified).toBe(0)
    expect(coverage.percentages).toEqual({ esquerda: 0, centro: 0, direita: 0 })
    expect(coverage.represented).toEqual([])
    expect(coverage.missing).toEqual(['esquerda', 'centro', 'direita'])
    expect(coverage.dominant).toBeNull()
    expect(coverage.coverage).toBe('sem-dados')
    expect(coverage.blindspot).toBeNull()
  })
})
