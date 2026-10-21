import { describe, expect, it } from 'vitest'

import { buildPerspectives } from '@/lib/perspectives'

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
    overall_score: 0,
    ...overrides,
  }
}

describe('perspectivas do cluster', () => {
  it('agrupa os seis rótulos em esquerda, centro, direita e incerta', () => {
    const perspectives = buildPerspectives([
      row({ news_id: '1', outlet: 'A', text_label: 'esquerda' }),
      row({ news_id: '2', outlet: 'B', text_label: 'centro-esquerda' }),
      row({ news_id: '3', outlet: 'C', text_label: 'centro' }),
      row({ news_id: '4', outlet: 'D', text_label: 'centro-direita' }),
      row({ news_id: '5', outlet: 'E', text_label: 'direita' }),
      row({ news_id: '6', outlet: 'F', text_label: 'mista' }),
    ])

    expect(perspectives.sides.map((side) => side.key)).toEqual(['esquerda', 'centro', 'direita'])
    expect(perspectives.sides.map((side) => side.rows.length)).toEqual([2, 1, 2])
    expect(perspectives.uncertain.rows).toHaveLength(1)
    expect(perspectives.represented).toEqual(['esquerda', 'centro', 'direita'])
    expect(perspectives.missing).toEqual([])
    expect(perspectives.coverage).toBe('tres-lados')
  })

  it('mantém uma matéria por veículo, priorizando a mais recente', () => {
    const perspectives = buildPerspectives([
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

    expect(perspectives.total).toBe(1)
    expect(perspectives.sides.find((side) => side.key === 'esquerda').rows).toHaveLength(0)
    expect(perspectives.sides.find((side) => side.key === 'direita').rows[0].news_id).toBe(
      'recente',
    )
  })

  it('ignora demonstração, matéria sem enquadramento e outro cluster', () => {
    const perspectives = buildPerspectives(
      [
        row({
          news_id: 'demo',
          outlet: 'Demonstração',
          url: 'https://exemplo.com.br/politica/materia',
        }),
        row({ news_id: 'sem-rotulo', outlet: 'Sem rótulo', text_label: null }),
        row({ news_id: 'outro-cluster', outlet: 'Outro', cluster_id: 'cluster-2' }),
        row({ news_id: 'real', outlet: 'G1' }),
      ],
      { clusterId: 'cluster-1' },
    )

    expect(perspectives.total).toBe(1)
    expect(perspectives.sides.find((side) => side.key === 'centro').rows[0].news_id).toBe('real')
  })

  it('não declara equilíbrio quando só um lado está representado', () => {
    const perspectives = buildPerspectives([
      row({ news_id: '1', outlet: 'A', text_label: 'esquerda' }),
      row({ news_id: '2', outlet: 'B', text_label: 'centro-esquerda' }),
    ])

    expect(perspectives.represented).toEqual(['esquerda'])
    expect(perspectives.missing).toEqual(['centro', 'direita'])
    expect(perspectives.dominant).toBe('esquerda')
    expect(perspectives.dominantShare).toBe(1)
    expect(perspectives.coverage).toBe('um-lado')
    expect(perspectives.sampleReliable).toBe(false)
  })

  it('devolve um estado vazio seguro', () => {
    const perspectives = buildPerspectives([])

    expect(perspectives.total).toBe(0)
    expect(perspectives.sides.every((side) => side.rows.length === 0)).toBe(true)
    expect(perspectives.represented).toEqual([])
    expect(perspectives.missing).toEqual(['esquerda', 'centro', 'direita'])
    expect(perspectives.dominant).toBeNull()
    expect(perspectives.coverage).toBe('sem-dados')
    expect(perspectives.sampleReliable).toBe(false)
  })
})
