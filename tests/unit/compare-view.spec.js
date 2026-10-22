import { flushPromises, mount } from '@vue/test-utils'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import CompareView from '@/views/CompareView.vue'

const { fetchComparison, searchWebCoverage, analyzeArticles } = vi.hoisted(() => ({
  fetchComparison: vi.fn(),
  searchWebCoverage: vi.fn(),
  analyzeArticles: vi.fn(),
}))

vi.mock('@/lib/services', () => ({
  fetchComparison,
  searchWebCoverage,
  analyzeArticles,
}))

function mountView() {
  return mount(CompareView, {
    global: {
      stubs: {
        RouterLink: { template: '<a><slot /></a>' },
        PButton: { template: '<button><slot /></button>' },
        DnaRadar: { template: '<div />' },
      },
    },
  })
}

const SEARCH_RESULTS = [
  {
    url: 'https://g1.globo.com/politica/reforma/noticia.ghtml',
    title: 'Reforma avança no Congresso',
  },
  {
    url: 'https://folha.uol.com.br/mercado/reforma-tributaria.shtml',
    title: 'Mercado reage à reforma',
  },
  {
    url: 'https://www.receita.fazenda.gov.br/reforma/entenda',
    title: 'Página oficial do fisco',
  },
]

const ANALYSES = [
  {
    id: 'a1',
    url: 'https://g1.globo.com/politica/reforma/noticia.ghtml',
    title: 'Reforma avança no Congresso',
    outlet: 'G1',
    highlight: 'Congresso',
    angle: 'Votação e base de apoio',
    tone: 'Informativo',
    dna: { emocao: 20, fontes: 60, evidencias: 70, persuasao: 30, equilibrio: 55, narrativa: 60 },
    dominantFrame: 'politica',
    confidence: 80,
    publishedAt: '2026-10-20T12:00:00+00:00',
    topic: 'Reforma Tributária',
  },
  {
    id: 'a2',
    url: 'https://folha.uol.com.br/mercado/reforma-tributaria.shtml',
    title: 'Mercado reage à reforma',
    outlet: 'Folha',
    highlight: 'Economia',
    angle: 'Impacto fiscal nas empresas',
    tone: 'Analítico',
    dna: { emocao: 15, fontes: 70, evidencias: 80, persuasao: 40, equilibrio: 50, narrativa: 55 },
    dominantFrame: 'economia',
    confidence: 76,
    publishedAt: '2026-10-21T09:00:00+00:00',
    topic: 'Reforma Tributária',
  },
]

describe('página de comparação', () => {
  beforeAll(() => {
    global.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  })

  beforeEach(() => {
    fetchComparison.mockReset()
    searchWebCoverage.mockReset()
    analyzeArticles.mockReset()
    fetchComparison.mockResolvedValue({
      topic: 'Reforma Tributária',
      requestedTopic: 'Reforma Tributária',
      window: '20 out 2026',
      outletCount: 2,
      demo: false,
      rows: [],
    })
  })

  it('busca matérias na internet e lista as candidatas', async () => {
    searchWebCoverage.mockResolvedValue({
      topic: 'Reforma',
      results: SEARCH_RESULTS,
      cached: false,
    })

    const wrapper = mountView()
    await flushPromises()

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(searchWebCoverage).toHaveBeenCalledWith('Reforma Tributária')
    expect(wrapper.text()).toContain('Matérias encontradas')
    expect(wrapper.text()).toContain('Reforma avança no Congresso')
    expect(wrapper.text()).toContain('Mercado reage à reforma')
    // Página do governo é descartada pelo filtro de veículos.
    expect(wrapper.text()).not.toContain('Página oficial do fisco')
  })

  it('analisa as matérias marcadas e monta a comparação', async () => {
    searchWebCoverage.mockResolvedValue({
      topic: 'Reforma',
      results: SEARCH_RESULTS,
      cached: false,
    })
    analyzeArticles.mockResolvedValue({ analyses: ANALYSES, failures: [] })

    const wrapper = mountView()
    await flushPromises()

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    const buttons = wrapper.findAll('button')
    const compareButton = buttons.find((button) => button.text().includes('Analisar e comparar'))
    await compareButton.trigger('click')
    await flushPromises()

    expect(analyzeArticles).toHaveBeenCalledTimes(1)
    const [urls, topic] = analyzeArticles.mock.calls[0]
    expect(urls).toEqual([
      'https://g1.globo.com/politica/reforma/noticia.ghtml',
      'https://folha.uol.com.br/mercado/reforma-tributaria.shtml',
    ])
    expect(topic).toBe('Reforma Tributária')

    expect(wrapper.text()).toContain('busca na internet')
    expect(wrapper.text()).toContain('Impacto fiscal nas empresas')
  })

  it('mostra o erro quando a busca falha', async () => {
    searchWebCoverage.mockRejectedValue(new Error('Limite de buscas por hora atingido.'))

    const wrapper = mountView()
    await flushPromises()

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Limite de buscas por hora atingido.')
  })
})
