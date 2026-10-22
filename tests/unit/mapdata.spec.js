import { describe, expect, it } from 'vitest'

import { BRAZIL_STATES } from '@/data/geo/brazil-states'
import { maxThemeShare, nationalMix, stateStyle, ufLabel } from '@/lib/mapdata'

const SP = {
  uf: 'SP',
  name: 'São Paulo',
  outlets: 143,
  polarization: 74,
  themes: { economia: 41, seguranca: 22, ambiente: 10, saude: 13, politica: 14 },
}

const STATES = [SP, { ...SP, uf: 'RJ', polarization: 81, themes: { ...SP.themes, economia: 27 } }]

describe('dados do mapa', () => {
  it('mantém as 27 unidades federativas com sigla', () => {
    expect(BRAZIL_STATES.features).toHaveLength(27)
    expect(BRAZIL_STATES.features.map((f) => f.properties.sigla)).toContain('DF')
  })

  it('usa o maior share do tema como escala de opacidade', () => {
    expect(maxThemeShare(STATES, 'economia')).toBe(41)
    expect(maxThemeShare(STATES, 'dominante')).toBe(100)
  })

  it('pinta a UF pelo tema dominante', () => {
    const style = stateStyle(SP, 'dominante')
    expect(style.color).toBe('#FFC24B')
    expect(style.value).toBe(41)
    expect(style.fillOpacity).toBeGreaterThan(0)
  })

  it('pinta a UF pela severidade da polarização', () => {
    const style = stateStyle(SP, 'polarizacao')
    expect(style.color).toBe('#FF3B5C')
    expect(style.value).toBe(74)
  })

  it('pinta a UF por tema específico e usa a cor do enquadramento', () => {
    const style = stateStyle(SP, 'seguranca', 41)
    expect(style.color).toBe('#FF3B5C')
    expect(style.value).toBe(22)
  })

  it('monta o rótulo permanente da UF', () => {
    const label = ufLabel(SP, 'dominante')
    expect(label).toContain('SP')
    expect(label).toContain('41%')
  })

  it('omite o percentual nas UFs pequenas para não sobrepor rótulos', () => {
    const label = ufLabel({ ...SP, uf: 'RN' }, 'dominante')
    expect(label).toContain('RN')
    expect(label).not.toContain('%')
  })

  it('calcula o mix nacional a partir dos estados monitorados', () => {
    const mix = nationalMix(STATES)
    expect(mix.economia).toBe(34)
  })

  it('devolve mix zerado sem estados', () => {
    expect(nationalMix([]).economia).toBe(0)
  })
})
