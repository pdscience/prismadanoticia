import { describe, expect, it } from 'vitest'

import { analyzeUrl } from '@/lib/analysis'

describe('analyzeUrl', () => {
  it('é determinística para a mesma URL', () => {
    const a = analyzeUrl('https://exemplo.com/noticia')
    const b = analyzeUrl('https://exemplo.com/noticia')
    expect(a.id).toBe(b.id)
    expect(a.dna).toEqual(b.dna)
    expect(a.confidence).toBe(b.confidence)
  })

  it('extrai o host e remove www', () => {
    expect(analyzeUrl('https://www.folha.com.br/materia').outlet).toBe('folha.com.br')
    expect(analyzeUrl('g1.globo.com/politica').outlet).toBe('g1.globo.com')
  })

  it('mantém o host padrão para URL inválida', () => {
    expect(analyzeUrl('http://[invalida').outlet).toBe('veiculo-exemplo.com.br')
  })

  it('gera indicadores dentro das faixas esperadas', () => {
    const result = analyzeUrl('https://exemplo.com/noticia')
    for (const value of Object.values(result.dna)) {
      expect(value).toBeGreaterThanOrEqual(22)
      expect(value).toBeLessThanOrEqual(95)
    }
    expect(result.confidence).toBeGreaterThanOrEqual(0)
    expect(result.confidence).toBeLessThanOrEqual(100)
    expect(result.clusterSize).toBeGreaterThanOrEqual(8)
    expect(result.clusterSize).toBeLessThanOrEqual(62)
  })

  it('preserva os dados editoriais da análise de exemplo', () => {
    const result = analyzeUrl('https://exemplo.com/noticia')
    expect(result.topic).toBe('Reforma Tributária')
    expect(result.summary).toHaveLength(3)
    expect(result.evidences).toHaveLength(4)
  })
})
