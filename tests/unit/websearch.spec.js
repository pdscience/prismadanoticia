import { describe, expect, it } from 'vitest'

import {
  MAX_CANDIDATES,
  isBlockedHost,
  normalizeSearchResults,
  outletLabel,
  outletName,
} from '@/lib/websearch'

const RESULTS = [
  { url: 'https://g1.globo.com/politica/reforma/noticia.ghtml', title: 'Reforma avança' },
  { url: 'https://g1.globo.com/politica/outra-noticia.ghtml', title: 'Outro do mesmo veículo' },
  { url: 'https://www.receita.fazenda.gov.br/reforma/entenda', title: 'Página do governo' },
  { url: 'https://pt.wikipedia.org/wiki/Reforma_Tribut%C3%A1ria', title: 'Enciclopédia' },
  { url: 'https://www.facebook.com/g1/posts/123', title: 'Rede social' },
  { url: 'https://folha.uol.com.br/mercado/reforma-tributaria.shtml', title: 'Cobertura da Folha' },
  { url: 'https://www.poder360.com.br/politica/reforma/', title: 'Cobertura do Poder360' },
  { url: 'https://www.estadao.com.br/politica/reforma-tributaria/', title: 'Cobertura do Estadão' },
  { url: 'https://www.cnnbrasil.com.br/brasil/reforma-tributaria/', title: 'Cobertura da CNN' },
  { url: 'https://www.metropoles.com/politica/reforma/', title: 'Cobertura do Metrópoles' },
  { url: 'https://www.exame.com/politica/reforma/', title: 'Cobertura do Exame' },
]

describe('busca web', () => {
  it('descarta portais do governo, enciclopédias e redes sociais', () => {
    const hosts = normalizeSearchResults(RESULTS).map((item) => item.host)
    expect(hosts).not.toContain('receita.fazenda.gov.br')
    expect(hosts).not.toContain('pt.wikipedia.org')
    expect(hosts).not.toContain('www.facebook.com')
  })

  it('mantém apenas uma matéria por veículo', () => {
    const hosts = normalizeSearchResults(RESULTS).map((item) => item.host)
    expect(hosts.filter((host) => host === 'g1.globo.com')).toHaveLength(1)
  })

  it('limita a quantidade de candidatos', () => {
    expect(normalizeSearchResults(RESULTS)).toHaveLength(MAX_CANDIDATES)
  })

  it('coloca veículos conhecidos antes dos demais', () => {
    const list = normalizeSearchResults([
      { url: 'https://site-aleatorio.com.br/noticia', title: 'Site desconhecido' },
      { url: 'https://g1.globo.com/economia/noticia.ghtml', title: 'Matéria do G1' },
    ])
    expect(list[0].outlet).toBe('G1')
    expect(list).toHaveLength(2)
  })

  it('preenche o veículo pelo host quando o modelo não informa', () => {
    const [first] = normalizeSearchResults(RESULTS)
    expect(first.outlet).toBe('G1')
    expect(first.title).toBe('Reforma avança')
  })

  it('usa o nome conhecido do veículo', () => {
    expect(outletName('https://folha.uol.com.br/x.shtml')).toBe('Folha')
    expect(outletName('https://www.estadao.com.br/x/')).toBe('Estadão')
  })

  it('prefere a marca conhecida ao nome vindo do modelo', () => {
    expect(outletLabel('https://g1.globo.com/x.ghtml', 'g1.globo.com')).toBe('G1')
    expect(outletLabel('https://veiculo.com.br/x/', 'Veículo')).toBe('Veículo')
  })

  it('identifica domínios bloqueados', () => {
    expect(isBlockedHost('www.gov.br')).toBe(true)
    expect(isBlockedHost('g1.globo.com')).toBe(false)
  })

  it('devolve lista vazia sem resultados utilizáveis', () => {
    expect(normalizeSearchResults([])).toEqual([])
    expect(normalizeSearchResults(null)).toEqual([])
  })
})
