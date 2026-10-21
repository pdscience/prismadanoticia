import { FRAMES } from '@/data/frames'

/** Paleta central da marca. Use estes tokens em vez de hex repetidos nas views. */
export const BRAND_COLORS = {
  midnight: '#05091A',
  electric: '#2D6BFF',
  prism: '#8B5CF6',
  energy: '#FF3B5C',
  insight: '#FFC24B',
  mint: '#2EE6A8',
  text: '#F2F5FF',
  muted: '#9AA6C9',
}

/**
 * Cor do índice de polarização (0–100). Fonte única para o cartograma e para
 * os painéis, evitando que a mesma UF apareça com severidades divergentes.
 */
export function polarizationColor(value) {
  if (value >= 66) return FRAMES.seguranca.color
  if (value >= 50) return FRAMES.economia.color
  return FRAMES.ambiente.color
}
