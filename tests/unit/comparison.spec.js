import { describe, expect, it } from 'vitest'

import { buildComparison } from '@/lib/comparison'

function row(overrides) {
  return {
    id: overrides.id ?? overrides.outlet,
    outlet: 'Veículo',
    highlight: 'Destaque',
    angle: 'Ângulo',
    tone: 'Informativo',
    dna: { emocao: 20, fontes: 70, evidencias: 80, persuasao: 30, equilibrio: 60, narrativa: 50 },
    accent: '#2D6BFF',
    url: 'https://exemplo.com/noticia',
    published_at: '2026-10-21T12:00:00+00:00',
    confidence: 70,
    ...overrides,
  }
}

describe('comparação de coberturas', () => {
  it('ignora artigos de demonstração e linhas sem destaque', () => {
    const comparison = buildComparison(
      [
        row({ id: 'demo', outlet: 'Folha', url: 'https://exemplo.com.br/folha/materia' }),
        row({ id: 'sem-destaque', outlet: 'Estadão', highlight: null }),
        row({ id: 'real', outlet: 'G1', url: 'https://g1.globo.com/politica/materia.ghtml' }),
      ],
      'Reforma Tributária',
    )

    expect(comparison.rows.map((item) => item.outlet)).toEqual(['G1'])
    expect(comparison.demo).toBe(false)
  })

  it('mantém uma linha por veículo, priorizando a matéria mais recente', () => {
    const comparison = buildComparison(
      [
        row({
          id: 'senado-antigo',
          outlet: 'Senado Federal',
          url: 'https://www12.senado.leg.br/noticias/materias/2023/12/20/materia',
          published_at: '2023-12-20T19:02:38+00:00',
        }),
        row({
          id: 'senado-novo',
          outlet: 'Senado Federal',
          url: 'https://www12.senado.leg.br/noticias/materias/2023/12/21/materia',
          published_at: '2023-12-21T23:00:56+00:00',
        }),
        row({
          id: 'camara-baixa-confianca',
          outlet: 'Portal da Câmara dos Deputados',
          url: 'https://www.camara.leg.br/noticias/1',
          published_at: '2026-10-21T11:29:05+00:00',
          confidence: 40,
        }),
        row({
          id: 'camara-alta-confianca',
          outlet: 'Portal da Câmara dos Deputados',
          url: 'https://www.camara.leg.br/noticias/2',
          published_at: '2026-10-21T11:29:05+00:00',
          confidence: 60,
        }),
      ],
      'Reforma Tributária',
    )

    expect(comparison.rows.map((item) => item.id)).toEqual(['senado-novo', 'camara-alta-confianca'])
  })

  it('informa a contagem de veículos e a janela real das publicações', () => {
    const comparison = buildComparison(
      [
        row({
          id: 'senado',
          outlet: 'Senado Federal',
          url: 'https://www12.senado.leg.br/noticias/materias/2023/12/20/materia',
          published_at: '2023-12-20T19:02:38+00:00',
        }),
        row({
          id: 'camara',
          outlet: 'Portal da Câmara dos Deputados',
          url: 'https://www.camara.leg.br/noticias/1',
          published_at: '2026-10-21T11:29:05+00:00',
        }),
      ],
      'Reforma Tributária',
    )

    expect(comparison.outletCount).toBe(2)
    expect(comparison.window).toBe('20 dez 2023 – 21 out 2026')
  })

  it('usa um rótulo neutro quando não há datas', () => {
    const comparison = buildComparison(
      [row({ id: 'sem-data', published_at: null })],
      'Reforma Tributária',
    )

    expect(comparison.window).toBe('Análises disponíveis')
  })
})
