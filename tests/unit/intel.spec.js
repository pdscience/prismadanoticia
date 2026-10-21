import { describe, expect, it } from 'vitest'

import { polarizationColor } from '@/lib/colors'
import { dominantTheme } from '@/lib/intel'

describe('inteligência do mapa', () => {
  it('escolhe o tema com maior cobertura', () => {
    const theme = dominantTheme({
      themes: { economia: 10, seguranca: 70, ambiente: 20, saude: 0, politica: 0 },
    })
    expect(theme.key).toBe('seguranca')
    expect(theme.label).toBe('Segurança')
  })

  it('faz fallback para tema fora do mapa', () => {
    const theme = dominantTheme({ themes: { cultura: 100 } })
    expect(theme.key).toBe('cultura')
    expect(theme.label).toBe('cultura')
    expect(theme.color).toBe('#9AA6C9')
  })

  it('classifica a cor da polarização por faixa', () => {
    expect(polarizationColor(90)).toBe('#FF3B5C')
    expect(polarizationColor(66)).toBe('#FF3B5C')
    expect(polarizationColor(50)).toBe('#FFC24B')
    expect(polarizationColor(49)).toBe('#2EE6A8')
  })
})
