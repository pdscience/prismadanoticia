import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import CoverageSide from '@/components/cobertura/CoverageSide.vue'

const side = {
  key: 'centro',
  label: 'Centro',
  color: '#9AA6C9',
  count: 2,
  percent: 100,
  rows: [
    {
      news_id: '1',
      outlet: 'G1',
      title: 'Manchete do centro',
      url: 'https://g1.globo.com/materia',
      text_label: 'centro',
      confidence: 80,
      curated_label: null,
      published_at: '2026-10-21T12:00:00+00:00',
    },
    {
      news_id: '2',
      outlet: 'Folha',
      title: 'Outra manchete',
      url: 'https://folha.com/materia',
      text_label: 'centro-esquerda',
      confidence: 65,
      curated_label: 'centro',
      published_at: '2026-10-21T11:00:00+00:00',
    },
  ],
}

describe('coluna de cobertura', () => {
  it('mostra veículos, manchetes e rating curado', () => {
    const wrapper = mount(CoverageSide, {
      props: { side },
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    })

    expect(wrapper.text()).toContain('Centro')
    expect(wrapper.text()).toContain('2 veículos')
    expect(wrapper.text()).toContain('G1')
    expect(wrapper.text()).toContain('sem rating curado')
    expect(wrapper.text()).toContain('Folha')
    expect(wrapper.text()).toContain('Manchete do centro')
  })
})
