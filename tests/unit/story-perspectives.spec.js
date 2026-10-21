import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import StoryPerspectives from '@/components/analysis/StoryPerspectives.vue'
import { buildPerspectives } from '@/lib/perspectives'

function row(overrides = {}) {
  return {
    news_id: overrides.news_id ?? overrides.outlet ?? 'news-1',
    cluster_id: 'cluster-1',
    outlet: 'Veículo',
    title: 'Título da matéria',
    url: 'https://g1.globo.com/politica/materia.ghtml',
    published_at: '2026-10-21T12:00:00+00:00',
    text_label: 'centro',
    confidence: 70,
    overall_score: 0,
    ...overrides,
  }
}

function mountPerspectives(rows) {
  return mount(StoryPerspectives, {
    props: { perspectives: buildPerspectives(rows) },
    global: {
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a><slot /></a>',
        },
      },
    },
  })
}

describe('card de perspectivas', () => {
  it('mostra os três lados, as manchetes e o que falta', () => {
    const wrapper = mountPerspectives([
      row({
        news_id: 'esquerda',
        outlet: 'Folha',
        title: 'Manchete da esquerda',
        text_label: 'esquerda',
      }),
      row({ news_id: 'centro', outlet: 'G1', title: 'Manchete do centro' }),
    ])

    const text = wrapper.text()
    expect(text).toContain('Perspectivas nesta história')
    expect(text).toContain('2 de 3 lados representados')
    expect(text).toContain('Esquerda')
    expect(text).toContain('Centro')
    expect(text).toContain('Direita')
    expect(text).toContain('Manchete da esquerda')
    expect(text).toContain('Manchete do centro')
    expect(text).toContain('Falta: Direita')
    expect(text).toContain('Amostra pequena')
    expect(text).toContain('não é um rating permanente do veículo')
  })

  it('não sugere equilíbrio quando só um lado está representado', () => {
    const wrapper = mountPerspectives([
      row({ news_id: '1', outlet: 'Folha', text_label: 'esquerda' }),
      row({ news_id: '2', outlet: 'CartaCapital', text_label: 'centro-esquerda' }),
    ])

    expect(wrapper.text()).toContain('1 de 3 lados representados')
    expect(wrapper.text()).toContain('Falta: Centro · Direita')
    expect(wrapper.text()).not.toContain('equilibrado')
  })

  it('mostra um estado vazio honesto quando não há cobertura comparável', () => {
    const wrapper = mountPerspectives([])

    expect(wrapper.text()).toContain('0 de 3 lados representados')
    expect(wrapper.text()).toContain('Ainda não há outras coberturas deste fato')
    expect(wrapper.text()).toContain('Comparar por tema')
  })

  it('separa enquadramentos ambíguos dos três lados', () => {
    const wrapper = mountPerspectives([
      row({ news_id: '1', outlet: 'A', text_label: 'mista', title: 'Matéria ambígua' }),
    ])

    expect(wrapper.text()).toContain('Incerta')
    expect(wrapper.text()).toContain('Matéria ambígua')
    expect(wrapper.text()).toContain('Falta: Esquerda · Centro · Direita')
  })

  it('linka a cobertura completa quando há cluster', () => {
    const wrapper = mount(StoryPerspectives, {
      props: {
        perspectives: buildPerspectives(
          [row({ news_id: '1', outlet: 'Folha', text_label: 'esquerda' })],
          { clusterId: 'cluster-1' },
        ),
      },
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a><slot /></a>',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('Ver cobertura completa')
  })
})
