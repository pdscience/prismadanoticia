import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { buildCoverage } from '@/lib/coverage'
import CoverageView from '@/views/CoverageView.vue'

const { fetchCoverage, replace } = vi.hoisted(() => ({
  fetchCoverage: vi.fn(),
  replace: vi.fn(),
}))

vi.mock('@/lib/services', () => ({
  fetchCoverage,
}))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRoute: () => ({ query: { url: 'https://g1.globo.com/materia' } }),
    useRouter: () => ({ replace }),
  }
})

function mountView() {
  return mount(CoverageView, {
    global: {
      stubs: {
        RouterLink: { template: '<a><slot /></a>' },
        PButton: { template: '<button><slot /></button>' },
      },
    },
  })
}

describe('página de cobertura', () => {
  beforeEach(() => {
    fetchCoverage.mockReset()
    replace.mockReset()
  })

  it('mostra a distribuição carregada', async () => {
    fetchCoverage.mockResolvedValue(
      buildCoverage(
        [
          { outlet: 'A', text_label: 'esquerda', cluster_id: 'c1', news_id: '1' },
          { outlet: 'B', text_label: 'centro', cluster_id: 'c1', news_id: '2' },
          { outlet: 'C', text_label: 'direita', cluster_id: 'c1', news_id: '3' },
        ],
        {
          cluster_id: 'c1',
          title: 'Manchete principal',
          outlet: 'G1',
          url: 'https://g1.globo.com/materia',
          published_at: '2026-10-21T12:00:00+00:00',
          topic: 'Política',
          cluster_size: 12,
        },
      ),
    )

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('Manchete principal')
    expect(wrapper.text()).toContain('Como os veículos cobrem esta história')
    expect(wrapper.text()).toContain('3 veículos classificados')
  })

  it('mostra erro e CTA quando a URL não foi analisada', async () => {
    fetchCoverage.mockRejectedValue(
      new Error('Esta matéria ainda não foi analisada. Abra a Análise para processá-la.'),
    )

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('ainda não foi analisada')
    expect(wrapper.text()).toContain('Analisar matéria')
  })
})
