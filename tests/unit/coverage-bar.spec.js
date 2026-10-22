import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import CoverageBar from '@/components/cobertura/CoverageBar.vue'
import { buildCoverage } from '@/lib/coverage'

function coverage() {
  return buildCoverage([
    { outlet: 'A', text_label: 'esquerda', cluster_id: 'c1', news_id: '1' },
    { outlet: 'B', text_label: 'centro', cluster_id: 'c1', news_id: '2' },
    { outlet: 'C', text_label: 'direita', cluster_id: 'c1', news_id: '3' },
  ])
}

describe('barra de cobertura', () => {
  it('mostra as três porcentagens e a contagem', () => {
    const wrapper = mount(CoverageBar, { props: { coverage: coverage() } })

    expect(wrapper.text()).toContain('Esquerda')
    expect(wrapper.text()).toContain('34%')
    expect(wrapper.text()).toContain('33%')
    expect(wrapper.text()).toContain('3 veículos classificados')
    expect(wrapper.get('[role="img"]').attributes('aria-label')).toContain('Esquerda: 34%')
  })

  it('mostra incertas fora do cálculo', () => {
    const data = buildCoverage([
      { outlet: 'A', text_label: 'esquerda', cluster_id: 'c1', news_id: '1' },
      { outlet: 'B', text_label: 'mista', cluster_id: 'c1', news_id: '2' },
    ])
    const wrapper = mount(CoverageBar, { props: { coverage: data } })

    expect(wrapper.text()).toContain('1 incerta')
    expect(wrapper.text()).toContain('fora do cálculo')
  })
})
