import { describe, expect, it } from 'vitest'

import {
  axisPosition,
  biasLabelFromScore,
  combineAxes,
  distortionLevel,
  normalizeFavoredSide,
  outletConfidence,
  textConfidence,
} from '@/lib/bias'

describe('rótulos de orientação', () => {
  it('mapeia os limites das faixas', () => {
    expect(biasLabelFromScore(-100)).toBe('esquerda')
    expect(biasLabelFromScore(-60)).toBe('esquerda')
    expect(biasLabelFromScore(-59)).toBe('centro-esquerda')
    expect(biasLabelFromScore(-20)).toBe('centro-esquerda')
    expect(biasLabelFromScore(-19)).toBe('centro')
    expect(biasLabelFromScore(0)).toBe('centro')
    expect(biasLabelFromScore(19)).toBe('centro')
    expect(biasLabelFromScore(20)).toBe('centro-direita')
    expect(biasLabelFromScore(59)).toBe('centro-direita')
    expect(biasLabelFromScore(60)).toBe('direita')
    expect(biasLabelFromScore(100)).toBe('direita')
  })

  it('limita pontuações fora da escala', () => {
    expect(biasLabelFromScore(-200)).toBe('esquerda')
    expect(biasLabelFromScore(200)).toBe('direita')
  })
})

describe('combineAxes', () => {
  it('calcula a média quando os eixos são próximos', () => {
    expect(combineAxes(60, 40)).toEqual({
      economic: 60,
      social: 40,
      overallScore: 50,
      label: 'centro-direita',
      ambiguous: false,
    })
  })

  it('marca como mista quando os eixos divergem mais de 50 pontos', () => {
    expect(combineAxes(70, -70)).toEqual({
      economic: 70,
      social: -70,
      overallScore: 0,
      label: 'mista',
      ambiguous: true,
    })
  })

  it('não considera ambíguo exatamente 50 pontos de diferença', () => {
    expect(combineAxes(50, 0).label).toBe('centro-direita')
    expect(combineAxes(50, 0).ambiguous).toBe(false)
  })

  it('normaliza os eixos antes de combinar', () => {
    expect(combineAxes(-180, 20)).toEqual({
      economic: -100,
      social: 20,
      overallScore: -40,
      label: 'mista',
      ambiguous: true,
    })
  })
})

describe('apresentação', () => {
  it('posiciona o eixo na escala de 0 a 100', () => {
    expect(axisPosition(-100)).toBe(0)
    expect(axisPosition(0)).toBe(50)
    expect(axisPosition(100)).toBe(100)
    expect(axisPosition(150)).toBe(100)
  })

  it('classifica o risco de distorção', () => {
    expect(distortionLevel(0).key).toBe('baixo')
    expect(distortionLevel(24).key).toBe('baixo')
    expect(distortionLevel(25).key).toBe('moderado')
    expect(distortionLevel(50).key).toBe('alto')
    expect(distortionLevel(75).key).toBe('muito-alto')
    expect(distortionLevel(120).key).toBe('muito-alto')
  })

  it('normaliza o lado beneficiado', () => {
    expect(normalizeFavoredSide('Direita')).toBe('direita')
    expect(normalizeFavoredSide(' esquerda ')).toBe('esquerda')
    expect(normalizeFavoredSide('nenhum')).toBe('nenhum')
    expect(normalizeFavoredSide('partido-x')).toBe('incerto')
    expect(normalizeFavoredSide(null)).toBe('incerto')
  })

  it('limita a confiança do texto e da estimativa do veículo', () => {
    expect(textConfidence(90)).toBe(85)
    expect(textConfidence(-10)).toBe(0)
    expect(outletConfidence(90)).toBe(55)
    expect(outletConfidence(42)).toBe(42)
  })
})
