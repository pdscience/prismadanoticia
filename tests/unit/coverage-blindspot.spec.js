import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import CoverageBlindspot from '@/components/cobertura/CoverageBlindspot.vue'

describe('alerta de ponto cego', () => {
  it('confirma quando há amostra suficiente', () => {
    const wrapper = mount(CoverageBlindspot, {
      props: {
        blindspot: { side: 'direita', percent: 0, severity: 'confirmed' },
        totalClassified: 8,
      },
    })

    expect(wrapper.text()).toContain('Ponto cego à direita')
    expect(wrapper.text()).toContain('0%')
    expect(wrapper.text()).toContain('não prova intenção editorial')
  })

  it('relativiza quando a amostra é limitada', () => {
    const wrapper = mount(CoverageBlindspot, {
      props: {
        blindspot: { side: 'centro', percent: 0, severity: 'possible' },
        totalClassified: 3,
      },
    })

    expect(wrapper.text()).toContain('Possível ponto cego ao centro')
    expect(wrapper.text()).toContain('amostra limitada')
  })
})
