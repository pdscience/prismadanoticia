import { SAMPLE_ANALYSIS } from '@/data/fixtures/analysis'

/**
 * Simula a análise de uma URL. Gera um DNA determinístico a partir da string,
 * para que o mesmo link sempre devolva o mesmo resultado.
 */
export function analyzeUrl(url) {
  const seed = Array.from(String(url)).reduce(
    (acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 100000,
    7,
  )
  const pick = (offset, min, max) => min + ((seed >> offset) % (max - min + 1))

  let host = 'veiculo-exemplo.com.br'
  try {
    host = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.replace(
      /^www\./,
      '',
    )
  } catch {
    /* mantém o host padrão */
  }

  const dna = {
    emocao: pick(1, 28, 78),
    fontes: pick(2, 35, 88),
    evidencias: pick(3, 40, 95),
    persuasao: pick(4, 22, 72),
    equilibrio: pick(5, 38, 90),
    narrativa: pick(6, 30, 85),
  }

  return {
    ...SAMPLE_ANALYSIS,
    id: `an_${seed.toString(36)}`,
    url,
    outlet: host,
    dna,
    confidence: Math.round(
      (dna.evidencias * 0.45 + dna.fontes * 0.3 + dna.equilibrio * 0.25) * 0.98,
    ),
    sourceDiversity: dna.fontes,
    clusterSize: pick(7, 8, 62),
  }
}
