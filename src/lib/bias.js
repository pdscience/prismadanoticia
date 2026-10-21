export const BIAS_LABELS = {
  esquerda: 'Esquerda',
  'centro-esquerda': 'Centro-esquerda',
  centro: 'Centro',
  'centro-direita': 'Centro-direita',
  direita: 'Direita',
  mista: 'Mista / ambígua',
}

export const BIAS_COLORS = {
  esquerda: '#8B5CF6',
  'centro-esquerda': '#6F9BFF',
  centro: '#9AA6C9',
  'centro-direita': '#FFC24B',
  direita: '#FF8A4C',
  mista: '#2EE6A8',
}

export const SIDE_LABELS = {
  esquerda: 'Esquerda',
  direita: 'Direita',
  centro: 'Centro',
  nenhum: 'Nenhum lado',
  incerto: 'Incerto',
}

export const SIGNAL_LABELS = {
  headline_body_gap: 'Manchete x corpo',
  missing_context: 'Contexto ausente',
  loaded_language: 'Linguagem carregada',
  decontextualized_data: 'Dado descontextualizado',
  anonymous_source: 'Fonte anônima',
  missing_counterpoint: 'Sem contraditório',
  one_sided_conclusion: 'Conclusão unilateral',
  false_equivalence: 'Falsa equivalência',
  generalization: 'Generalização',
  other: 'Outro indício',
}

export const STRENGTH_COLORS = {
  forte: '#FF3B5C',
  média: '#FFC24B',
  fraca: '#2EE6A8',
}

const FAVORED_SIDES = new Set(['esquerda', 'direita', 'centro', 'nenhum', 'incerto'])

export function clampScore(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.min(100, Math.max(-100, Math.round(number)))
}

export function clampConfidence(value, max = 100) {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.min(max, Math.max(0, Math.round(number)))
}

export function biasLabelFromScore(value) {
  const score = clampScore(value)
  if (score <= -60) return 'esquerda'
  if (score <= -20) return 'centro-esquerda'
  if (score < 20) return 'centro'
  if (score < 60) return 'centro-direita'
  return 'direita'
}

export function combineAxes(economic, social) {
  const economicScore = clampScore(economic)
  const socialScore = clampScore(social)
  const overallScore = Math.round((economicScore + socialScore) / 2)
  const ambiguous = Math.abs(economicScore - socialScore) > 50

  return {
    economic: economicScore,
    social: socialScore,
    overallScore,
    label: ambiguous ? 'mista' : biasLabelFromScore(overallScore),
    ambiguous,
  }
}

export function biasColor(label) {
  return BIAS_COLORS[label] ?? BIAS_COLORS.centro
}

export function axisPosition(value) {
  return (clampScore(value) + 100) / 2
}

export function distortionLevel(value) {
  const risk = clampConfidence(value)
  if (risk < 25) return { key: 'baixo', label: 'Baixo' }
  if (risk < 50) return { key: 'moderado', label: 'Moderado' }
  if (risk < 75) return { key: 'alto', label: 'Alto' }
  return { key: 'muito-alto', label: 'Muito alto' }
}

export function normalizeFavoredSide(value) {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase()
  return FAVORED_SIDES.has(normalized) ? normalized : 'incerto'
}

export function textConfidence(value) {
  return clampConfidence(value, 85)
}

export function outletConfidence(value) {
  return clampConfidence(value, 55)
}
