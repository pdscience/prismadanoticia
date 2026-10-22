import { describe, expect, it } from 'vitest'

import {
  fetchAnalysis,
  fetchBiasAnalysis,
  fetchComparison,
  fetchCoverage,
  fetchLatestBias,
  fetchPerspectives,
  fetchSampleAnalysis,
  fetchStats,
  fetchStates,
  fetchTrends,
} from '@/lib/services'

const live = import.meta.env.VITE_USE_MOCK === 'false'

describe.skipIf(!live)('serviços InsForge ao vivo', () => {
  it('carrega tendências da janela de 7 dias', async () => {
    const trends = await fetchTrends()
    expect(Array.isArray(trends)).toBe(true)
    if (trends.length) {
      expect(trends[0]).toHaveProperty('frames')
      expect(trends[0].outlets).toBeGreaterThan(0)
      expect(trends[0].articles).toBeGreaterThanOrEqual(trends[0].outlets)
      expect(typeof trends[0].hasBaseline).toBe('boolean')
    }
  })

  it('carrega a contagem real de veículos', async () => {
    const stats = await fetchStats()
    expect(stats.outlets).toBeGreaterThan(0)
    expect(stats.analyses).toBeGreaterThanOrEqual(stats.outlets)
  })

  it('carrega o enquadramento real mais recente', async () => {
    const bias = await fetchLatestBias()
    expect(bias).not.toBeNull()
    expect(bias.url).not.toContain('exemplo.com.br')
    expect(bias.textLabel).toBeTruthy()
  })

  it('carrega a análise de exemplo', async () => {
    const analysis = await fetchSampleAnalysis()
    expect(analysis.title).toContain('reforma tributária')
    expect(Object.keys(analysis.dna)).toHaveLength(6)
    expect(analysis.clusterId).toBeTruthy()
  })

  it('carrega uma análise por URL', async () => {
    const analysis = await fetchAnalysis(
      'https://exemplo.com.br/politica/reforma-tributaria-relatorio',
    )
    expect(analysis.outlet).toBe('Veículo de Exemplo')
  })

  it('carrega uma análise ingerida pela Edge Function', async () => {
    const analysis = await fetchAnalysis(
      'https://www12.senado.leg.br/noticias/materias/2023/12/20/congresso-promulga-reforma-tributaria',
    )
    expect(analysis.outlet).toBe('Senado Federal')
    expect(analysis.dna.emocao).toBeGreaterThan(0)
  })

  it('carrega o enquadramento de exemplo', async () => {
    const bias = await fetchBiasAnalysis(
      'https://exemplo.com.br/politica/reforma-tributaria-relatorio',
    )
    expect(bias.textLabel).toBe('centro')
    expect(bias.signals.length).toBeGreaterThan(0)
    expect(bias.curated).toBeNull()
  })

  it('carrega comparação', async () => {
    const comparison = await fetchComparison()
    expect(comparison.rows.length).toBeGreaterThan(0)
    expect(comparison.rows[0]).toHaveProperty('dna')
  })

  it('carrega perspectivas do cluster de uma matéria', async () => {
    const analysis = await fetchAnalysis(
      'https://www.cnnbrasil.com.br/internacional/trump-diz-que-america-do-sul-esta-se-tornando-cada-vez-mais-conservadora/',
    )
    const perspectives = await fetchPerspectives(analysis.clusterId)

    expect(analysis.clusterId).toBeTruthy()
    expect(perspectives.sides).toHaveLength(3)
    expect(perspectives.total).toBeGreaterThan(0)
    expect(perspectives.represented.length).toBeGreaterThan(0)
  })

  it('carrega a cobertura de um cluster real', async () => {
    const coverage = await fetchCoverage({
      url: 'https://www.cnnbrasil.com.br/internacional/trump-diz-que-america-do-sul-esta-se-tornando-cada-vez-mais-conservadora/',
    })

    expect(coverage.totalClassified).toBeGreaterThan(0)
    expect(
      coverage.percentages.esquerda + coverage.percentages.centro + coverage.percentages.direita,
    ).toBe(100)
  }, 15000)

  it('carrega os estados', async () => {
    const states = await fetchStates()
    expect(states.length).toBe(27)
  })
})
