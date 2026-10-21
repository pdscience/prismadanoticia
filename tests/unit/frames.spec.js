import { describe, expect, it } from 'vitest'

import { DNA_AXES, FRAMES, POLARIZATION_THEMES, TRENDS, frame } from '@/data'
import { SAMPLE_ANALYSIS } from '@/data'

describe('frames canônicos', () => {
  it('resolve um enquadramento existente', () => {
    expect(frame('politica')).toEqual({ label: 'Política', color: '#8B5CF6' })
  })

  it('usa fallback seguro para chave desconhecida', () => {
    expect(frame('inexistente')).toEqual({ label: 'inexistente', color: '#9AA6C9' })
  })

  it('mantém todos os temas de polarização dentro de FRAMES', () => {
    for (const theme of POLARIZATION_THEMES) {
      expect(FRAMES[theme.key]).toBeDefined()
      expect(theme.label).toBe(FRAMES[theme.key].label)
    }
  })

  it('mantém as tendências usando chaves canônicas', () => {
    for (const trend of TRENDS) {
      for (const key of trend.frames) {
        expect(FRAMES[key]).toBeDefined()
      }
    }
  })

  it('usa um enquadramento canônico na análise de exemplo', () => {
    expect(FRAMES[SAMPLE_ANALYSIS.dominantFrame]).toBeDefined()
  })

  it('define os seis eixos do DNA', () => {
    expect(DNA_AXES).toHaveLength(6)
    expect(DNA_AXES.map((axis) => axis.key)).toEqual([
      'emocao',
      'fontes',
      'evidencias',
      'persuasao',
      'equilibrio',
      'narrativa',
    ])
  })
})
