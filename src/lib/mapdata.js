/**
 * Regras de visualização do mapa de polarização.
 *
 * Funções puras: recebem os dados de uma UF e devolvem cor, opacidade e
 * valor. O componente `PolarizationMap` só desenha — assim a lógica é
 * testável sem navegador e o mesmo estilo serve ao mapa e ao cartograma.
 */
import { POLARIZATION_THEMES } from '@/data/frames'
import { polarizationColor } from '@/lib/colors'
import { dominantTheme } from '@/lib/intel'

/** Maior share de um tema entre os estados — base da escala de opacidade. */
export function maxThemeShare(states, mode) {
  if (!POLARIZATION_THEMES.some((t) => t.key === mode)) return 100
  return Math.max(1, ...states.map((s) => s.themes?.[mode] ?? 0))
}

/**
 * Estilo de uma UF no modo atual.
 * `dominante` usa o tema mais coberto; `polarizacao` usa a severidade;
 * qualquer outro modo é um tema específico.
 */
export function stateStyle(state, mode, maxShare = 100) {
  if (mode === 'polarizacao') {
    return {
      color: polarizationColor(state.polarization),
      fillOpacity: 0.18 + (state.polarization / 100) * 0.66,
      value: state.polarization,
      label: 'Polarização',
    }
  }

  if (mode === 'dominante') {
    const theme = dominantTheme(state)
    return {
      color: theme.color,
      fillOpacity: 0.16 + (state.polarization / 100) * 0.62,
      value: state.themes?.[theme.key] ?? 0,
      label: theme.label,
    }
  }

  const theme = POLARIZATION_THEMES.find((t) => t.key === mode)
  const value = state.themes?.[mode] ?? 0
  return {
    color: theme?.color ?? '#9AA6C9',
    fillOpacity: 0.1 + (value / maxShare) * 0.78,
    value,
    label: theme?.label ?? mode,
  }
}

/** Mix nacional: participação média de cada tema entre os estados monitorados. */
export function nationalMix(states) {
  const totals = {}
  POLARIZATION_THEMES.forEach((theme) => {
    totals[theme.key] = states.length
      ? Math.round(states.reduce((sum, s) => sum + (s.themes?.[theme.key] ?? 0), 0) / states.length)
      : 0
  })
  return totals
}

/**
 * UFs pequenas: o rótulo no mapa mostra apenas a sigla, para que os
 * estados do Nordeste não se sobreponham no zoom inicial.
 */
export const COMPACT_LABEL_STATES = new Set([
  'AC',
  'AL',
  'AP',
  'CE',
  'DF',
  'ES',
  'PB',
  'PE',
  'PI',
  'RN',
  'RO',
  'RR',
  'SC',
  'SE',
  'TO',
])

/** Rótulo permanente desenhado sobre a UF no mapa. */
export function ufLabel(state, mode, maxShare = 100) {
  if (COMPACT_LABEL_STATES.has(state.uf)) {
    return `<span class="prisma-uf-label__code prisma-uf-label__code--compact">${state.uf}</span>`
  }
  const { value } = stateStyle(state, mode, maxShare)
  return `<span class="prisma-uf-label__code">${state.uf}</span><span class="prisma-uf-label__value">${value}%</span>`
}
