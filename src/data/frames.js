/**
 * Enquadramentos canônicos e eixos do DNA.
 * Fonte única de verdade para rótulo e cor de cada enquadramento.
 */
export const FRAMES = {
  politica: { label: 'Política', color: '#8B5CF6' },
  economia: { label: 'Economia', color: '#FFC24B' },
  seguranca: { label: 'Segurança', color: '#FF3B5C' },
  ambiente: { label: 'Meio Ambiente', color: '#2EE6A8' },
  saude: { label: 'Saúde', color: '#2D6BFF' },
  social: { label: 'Social', color: '#6F9BFF' },
  juridico: { label: 'Jurídico', color: '#B794FF' },
}

/** Resolve um enquadramento pela chave, com fallback seguro. */
export function frame(key) {
  return FRAMES[key] ?? { label: String(key), color: '#9AA6C9' }
}

export const DNA_AXES = [
  {
    key: 'emocao',
    label: 'Emoção',
    measures: 'intensidade',
    color: '#FF3B5C',
    explanation:
      'Mede a carga emocional do texto: adjetivos intensos, dramatização e apelo afetivo. Valores altos indicam linguagem mais inflamada.',
  },
  {
    key: 'fontes',
    label: 'Fontes',
    measures: 'variedade',
    color: '#2D6BFF',
    explanation:
      'Avalia quantas vozes distintas são ouvidas e se há contraditório. Valores altos indicam reportagem com múltiplos entrevistados.',
  },
  {
    key: 'evidencias',
    label: 'Evidências',
    measures: 'sustentação',
    color: '#2EE6A8',
    explanation:
      'Verifica dados, documentos, citações verificáveis e links. Valores altos indicam afirmações bem sustentadas.',
  },
  {
    key: 'persuasao',
    label: 'Persuasão',
    measures: 'linguagem',
    color: '#FFC24B',
    explanation:
      'Detecta recursos retóricos que induzem conclusão: superlativos, ironia e generalizações. Valores altos pedem leitura crítica.',
  },
  {
    key: 'equilibrio',
    label: 'Equilíbrio',
    measures: 'pluralidade',
    color: '#8B5CF6',
    explanation:
      'Mede o espaço dado a cada lado do debate. Valores altos indicam tratamento proporcional entre versões.',
  },
  {
    key: 'narrativa',
    label: 'Narrativa',
    measures: 'enquadramento',
    color: '#6F9BFF',
    explanation:
      'Identifica o enquadramento escolhido — econômico, jurídico, social, segurança. Revela por qual ângulo o fato é contado.',
  },
]

/** Os cinco enquadramentos acompanhados no mapa, derivados de FRAMES. */
export const POLARIZATION_THEMES = ['economia', 'seguranca', 'ambiente', 'saude', 'politica'].map(
  (key) => ({ key, ...frame(key) }),
)
