import { POLARIZATION_THEMES, frame } from '@/data/frames'

/** Retorna o tema dominante de um estado, com fallback seguro. */
export function dominantTheme(state) {
  const [key] = Object.entries(state.themes).sort((a, b) => b[1] - a[1])[0]
  return POLARIZATION_THEMES.find((t) => t.key === key) ?? { key, ...frame(key) }
}
