import { describe, expect, it } from 'vitest'

import {
  fetchAnalysis,
  fetchBlindspot,
  fetchComparison,
  fetchReplay,
  fetchSampleAnalysis,
  fetchStates,
  fetchTrends,
} from '@/lib/services'

const live = import.meta.env.VITE_USE_MOCK === 'false'

describe.skipIf(!live)('serviços InsForge ao vivo', () => {
  it('carrega tendências', async () => {
    const trends = await fetchTrends()
    expect(trends.length).toBeGreaterThan(0)
    expect(trends[0]).toHaveProperty('frames')
  })

  it('carrega a análise de exemplo', async () => {
    const analysis = await fetchSampleAnalysis()
    expect(analysis.title).toContain('reforma tributária')
    expect(Object.keys(analysis.dna)).toHaveLength(6)
  })

  it('carrega uma análise por URL', async () => {
    const analysis = await fetchAnalysis(
      'https://exemplo.com.br/politica/reforma-tributaria-relatorio',
    )
    expect(analysis.outlet).toBe('Veículo de Exemplo')
  })

  it('carrega comparação', async () => {
    const comparison = await fetchComparison()
    expect(comparison.rows.length).toBeGreaterThan(0)
    expect(comparison.rows[0]).toHaveProperty('dna')
  })

  it('carrega blindspot', async () => {
    const blindspot = await fetchBlindspot()
    expect(blindspot.covered.length).toBeGreaterThan(0)
    expect(blindspot.missing.length).toBeGreaterThan(0)
  })

  it('carrega replay', async () => {
    const replay = await fetchReplay()
    expect(replay.frames.length).toBe(5)
  })

  it('carrega os estados', async () => {
    const states = await fetchStates()
    expect(states.length).toBe(27)
  })
})
