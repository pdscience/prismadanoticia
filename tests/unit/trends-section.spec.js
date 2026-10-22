import { flushPromises, mount } from '@vue/test-utils'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import TrendsSection from '@/components/landing/TrendsSection.vue'

const { fetchTrends } = vi.hoisted(() => ({
  fetchTrends: vi.fn(),
}))

vi.mock('@/lib/services', () => ({
  fetchTrends,
}))

function mountView() {
  return mount(TrendsSection, {
    global: {
      stubs: {
        RouterLink: { template: '<a><slot /></a>' },
      },
    },
  })
}

const TREND = {
  id: 'reforma-tributaria',
  label: 'Reforma Tributária',
  outlets: 4,
  articles: 9,
  delta: 12.5,
  hasBaseline: true,
  accent: '#FFC24B',
  frames: ['economia'],
  headline: 'Relator apresenta novo texto',
}

describe('tendências da landing', () => {
  beforeAll(() => {
    globalThis.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  })

  beforeEach(() => {
    fetchTrends.mockReset()
  })

  it('mostra a contagem real de veículos e matérias', async () => {
    fetchTrends.mockResolvedValue([TREND])
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('Reforma Tributária')
    expect(wrapper.text()).toContain('12.5%')
    expect(wrapper.text()).toContain('9 matérias')
    expect(wrapper.text()).toContain('últimos 7 dias')
  })

  it('marca como novo o tema sem base de comparação', async () => {
    fetchTrends.mockResolvedValue([{ ...TREND, delta: 0, hasBaseline: false }])
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('novo')
    expect(wrapper.text()).not.toContain('0.0%')
  })

  it('mostra estado vazio quando não há análises na janela', async () => {
    fetchTrends.mockResolvedValue([])
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('Nenhuma análise nos últimos 7 dias')
  })

  it('não inventa números quando a consulta falha', async () => {
    fetchTrends.mockRejectedValue(new Error('falhou'))
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('Tendências indisponíveis')
    expect(wrapper.text()).not.toContain('materiais')
  })
})
