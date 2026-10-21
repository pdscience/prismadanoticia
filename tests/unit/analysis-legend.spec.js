import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AnalysisLegend from '@/components/analysis/AnalysisLegend.vue'

describe('legenda da análise', () => {
  it('começa fechada e revela o glossário ao clicar', async () => {
    const wrapper = mount(AnalysisLegend)
    const button = wrapper.get('button[aria-controls="analysis-legend"]')

    expect(button.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('#analysis-legend').exists()).toBe(false)

    await button.trigger('click')

    expect(button.attributes('aria-expanded')).toBe('true')
    const content = wrapper.get('#analysis-legend').text()
    expect(content).toContain('Índice Prisma')
    expect(content).toContain('no cluster')
    expect(content).toContain('Confiança')
    expect(content).toContain('Diversidade de Fontes')
    expect(content).toContain('Emoção')
    expect(content).toContain('Evidências')
  })

  it('deixa claro que as métricas não são checagem de fatos', async () => {
    const wrapper = mount(AnalysisLegend)
    await wrapper.get('button').trigger('click')

    expect(wrapper.get('#analysis-legend').text()).toContain('não é checagem de fatos')
  })

  it('explica perspectivas sem transformar enquadramento em rating do veículo', async () => {
    const wrapper = mount(AnalysisLegend)
    await wrapper.get('button').trigger('click')

    const content = wrapper.get('#analysis-legend').text()
    expect(content).toContain('Perspectivas')
    expect(content).toContain('lados representados')
    expect(content).toContain('não é um rating permanente do veículo')
  })
})
