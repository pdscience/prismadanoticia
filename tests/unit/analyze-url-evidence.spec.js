import { describe, expect, it } from 'vitest'

import { normalizeAnalysis } from '../../functions/analyze-url.ts'

const ARTICLE = {
  title: 'Matéria de exemplo',
  outlet: 'Veículo de Exemplo',
  publishedAt: '2026-10-21T10:00:00.000Z',
  description: '',
}

describe('normalizeAnalysis', () => {
  it('preserva o trecho literal devolvido pelo modelo', () => {
    const analysis = normalizeAnalysis(
      {
        title: 'Matéria de exemplo',
        evidences: [
          {
            kind: 'Documento',
            strength: 'forte',
            label: 'Relatório oficial',
            note: 'Citado com páginas.',
            quote: 'A projeção cobre o período de 2027 a 2033.',
          },
        ],
      },
      ARTICLE,
    )

    expect(analysis.evidences[0].quote).toBe('A projeção cobre o período de 2027 a 2033.')
  })

  it('deixa a citação vazia quando o modelo não devolve trecho', () => {
    const analysis = normalizeAnalysis(
      {
        title: 'Matéria de exemplo',
        evidences: [
          { kind: 'Dado', strength: 'forte', label: 'Projeção', note: 'Fonte primária.' },
        ],
      },
      ARTICLE,
    )

    expect(analysis.evidences[0].quote).toBe('')
  })

  it('limita o tamanho da citação', () => {
    const analysis = normalizeAnalysis(
      {
        title: 'Matéria de exemplo',
        evidences: [
          { kind: 'Dado', strength: 'forte', label: 'Projeção', note: 'x', quote: 'a'.repeat(400) },
        ],
      },
      ARTICLE,
    )

    expect(analysis.evidences[0].quote.length).toBe(300)
  })
})
