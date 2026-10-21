import { describe, expect, it } from 'vitest'

import { DNA_AXES } from '@/data'
import { dnaAverage, radarPoint, radarPolygon } from '@/lib/radar'

describe('geometria do radar', () => {
  it('posiciona o primeiro eixo no topo', () => {
    const [x, y] = radarPoint({ index: 0, count: 6, value: 100, center: 0, radius: 10 })
    expect(x).toBeCloseTo(0)
    expect(y).toBeCloseTo(-10)
  })

  it('retorna o centro quando o valor é zero', () => {
    expect(radarPoint({ index: 2, count: 6, value: 0, center: 50, radius: 10 })).toEqual([50, 50])
  })

  it('limita valores fora de 0–100', () => {
    const [highX, highY] = radarPoint({ index: 0, count: 6, value: 150, center: 0, radius: 10 })
    const low = radarPoint({ index: 0, count: 6, value: -20, center: 0, radius: 10 })
    expect(highX).toBeCloseTo(0)
    expect(highY).toBeCloseTo(-10)
    expect(low).toEqual([0, 0])
  })

  it('gera um ponto por eixo no polígono', () => {
    const points = radarPolygon(
      { emocao: 50, fontes: 50, evidencias: 50, persuasao: 50, equilibrio: 50, narrativa: 50 },
      { center: 0, radius: 10 },
    )
    expect(points.split(' ')).toHaveLength(DNA_AXES.length)
  })

  it('calcula a média dos seis eixos', () => {
    expect(
      dnaAverage({
        emocao: 10,
        fontes: 20,
        evidencias: 30,
        persuasao: 40,
        equilibrio: 50,
        narrativa: 60,
      }),
    ).toBe(35)
  })

  it('trata eixos ausentes como zero', () => {
    expect(dnaAverage({ emocao: 60 })).toBe(10)
  })
})
