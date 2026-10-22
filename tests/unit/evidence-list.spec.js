import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import EvidenceList from '@/components/analysis/EvidenceList.vue'

describe('lista de evidências', () => {
  it('mostra o trecho literal quando a evidência tem citação', () => {
    const wrapper = mount(EvidenceList, {
      props: {
        evidences: [
          {
            kind: 'Documento',
            strength: 'forte',
            label: 'Relatório oficial',
            note: 'Citado com páginas.',
            quote: 'A projeção cobre o período de 2027 a 2033.',
          },
        ],
      },
    })

    expect(wrapper.text()).toContain('Relatório oficial')
    expect(wrapper.text()).toContain('A projeção cobre o período de 2027 a 2033.')
    expect(wrapper.find('blockquote').exists()).toBe(true)
  })

  it('omite a citação quando o modelo não devolveu trecho', () => {
    const wrapper = mount(EvidenceList, {
      props: {
        evidences: [
          {
            kind: 'Declaração',
            strength: 'fraca',
            label: 'Fonte anônima',
            note: 'Atribuição genérica.',
            quote: '',
          },
        ],
      },
    })

    expect(wrapper.text()).toContain('Fonte anônima')
    expect(wrapper.find('blockquote').exists()).toBe(false)
  })
})
