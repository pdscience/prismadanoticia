# Cobertura da História Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar a rota `/cobertura` com distribuição esquerda/centro/direita por cluster, cobertura por veículo, blindspot e rating curado como contexto.

**Architecture:** Uma view isolada orquestra `fetchCoverage()` e componentes presentacionais. `buildCoverage()` concentra dedupe, porcentagens, incertas e blindspot em lógica pura testável. Os dados vêm de `analysis_feed`, `perspective_feed` e `source_bias_profiles`; não há nova migration nem fallback fictício.

**Tech Stack:** Vue 3, Vue Router, InsForge SDK, Vitest, Vue Test Utils, Tailwind.

**Spec:** `docs/superpowers/specs/2026-10-21-cobertura-ground-design.md`

## Global Constraints

- A barra principal usa o `text_label` do texto, não o rating curado.
- Um veículo aparece uma vez, pela matéria mais recente.
- Incertas ficam fora da barra e do denominador.
- Porcentagens somam exatamente 100%.
- Blindspot só com pelo menos 3 veículos classificados e lado `<= 10%`.
- Sem rótulos reais de veículos inventados nesta entrega.
- Sem fallback fictício e sem disparar `analyze-url` ao abrir `/cobertura`.
- Não commitar nem fazer deploy sem pedido explícito.
- Rodar `npm run test:run`, `npm run lint`, `npm run format:check` e `npm run build` ao final.

---

### Task 1: Lógica pura de cobertura

**Files:**

- Create: `src/lib/coverage.js`
- Modify: `src/lib/perspectives.js` (exportar `isDemoUrl`)
- Test: `tests/unit/coverage.spec.js`

**Interfaces:**

- Consumes: `BIAS_COLORS`, `BIAS_LABELS` de `@/lib/bias`.
- Produces:
  - `buildCoverage(rows = [], story = null)`
  - Retorno: `{ story, clusterId, totalOutlets, totalClassified, totalUncertain, sides, uncertain, percentages, represented, missing, dominant, dominantShare, coverage, sampleReliable, blindspot }`
  - `sides`: `[{ key, label, color, rows, count, percent }]`
  - `blindspot`: `null | { side, percent, severity: 'possible' | 'confirmed' }`

- [ ] **Step 1: Escrever os testes que falham**

Criar `tests/unit/coverage.spec.js`:

```js
import { describe, expect, it } from 'vitest'

import { buildCoverage } from '@/lib/coverage'

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
    curated_label: null,
    curated_confidence: null,
    ...overrides,
  }
}

const story = {
  cluster_id: 'cluster-1',
  title: 'Manchete principal',
  outlet: 'G1',
  url: 'https://g1.globo.com/politica/materia.ghtml',
  published_at: '2026-10-21T12:00:00+00:00',
  topic: 'Política',
  cluster_size: 12,
}

describe('cobertura da história', () => {
  it('agrupa seis rótulos e calcula porcentagens', () => {
    const coverage = buildCoverage(
      [
        row({ news_id: '1', outlet: 'A', text_label: 'esquerda' }),
        row({ news_id: '2', outlet: 'B', text_label: 'centro-esquerda' }),
        row({ news_id: '3', outlet: 'C', text_label: 'centro' }),
        row({ news_id: '4', outlet: 'D', text_label: 'centro-direita' }),
        row({ news_id: '5', outlet: 'E', text_label: 'direita' }),
        row({ news_id: '6', outlet: 'F', text_label: 'mista' }),
      ],
      story,
    )

    expect(coverage.sides.map((side) => side.count)).toEqual([2, 1, 2])
    expect(coverage.percentages).toEqual({ esquerda: 40, centro: 20, direita: 40 })
    expect(coverage.totalClassified).toBe(5)
    expect(coverage.totalUncertain).toBe(1)
    expect(coverage.totalOutlets).toBe(6)
    expect(coverage.sampleReliable).toBe(true)
    expect(coverage.blindspot).toBeNull()
  })

  it('deduplica por veículo priorizando a matéria mais recente', () => {
    const coverage = buildCoverage([
      row({
        news_id: 'antiga',
        outlet: 'Folha',
        text_label: 'esquerda',
        published_at: '2026-10-20T12:00:00+00:00',
      }),
      row({
        news_id: 'recente',
        outlet: 'Folha',
        text_label: 'direita',
        published_at: '2026-10-21T12:00:00+00:00',
      }),
    ])

    expect(coverage.totalOutlets).toBe(1)
    expect(coverage.sides[0].count).toBe(0)
    expect(coverage.sides[2].rows[0].news_id).toBe('recente')
  })

  it('mantém incertas fora da barra e do denominador', () => {
    const coverage = buildCoverage([
      row({ news_id: '1', outlet: 'A', text_label: 'esquerda' }),
      row({ news_id: '2', outlet: 'B', text_label: 'centro-esquerda' }),
      row({ news_id: '3', outlet: 'C', text_label: 'mista' }),
    ])

    expect(coverage.percentages).toEqual({ esquerda: 100, centro: 0, direita: 0 })
    expect(coverage.uncertain.rows).toHaveLength(1)
    expect(coverage.totalClassified).toBe(2)
    expect(coverage.totalUncertain).toBe(1)
    expect(coverage.sampleReliable).toBe(false)
  })

  it('arredonda por maior resto para somar 100', () => {
    const coverage = buildCoverage([
      row({ news_id: '1', outlet: 'A', text_label: 'esquerda' }),
      row({ news_id: '2', outlet: 'B', text_label: 'centro' }),
      row({ news_id: '3', outlet: 'C', text_label: 'direita' }),
    ])

    expect(coverage.percentages).toEqual({ esquerda: 34, centro: 33, direita: 33 })
    expect(
      coverage.percentages.esquerda + coverage.percentages.centro + coverage.percentages.direita,
    ).toBe(100)
  })

  it('sinaliza possível ponto cego com 3 ou 4 veículos', () => {
    const coverage = buildCoverage([
      row({ news_id: '1', outlet: 'A', text_label: 'esquerda' }),
      row({ news_id: '2', outlet: 'B', text_label: 'centro-esquerda' }),
      row({ news_id: '3', outlet: 'C', text_label: 'centro' }),
    ])

    expect(coverage.blindspot).toEqual({ side: 'direita', percent: 0, severity: 'possible' })
    expect(coverage.sampleReliable).toBe(false)
  })

  it('confirma ponto cego com 5 ou mais veículos', () => {
    const coverage = buildCoverage([
      row({ news_id: '1', outlet: 'A', text_label: 'esquerda' }),
      row({ news_id: '2', outlet: 'B', text_label: 'esquerda' }),
      row({ news_id: '3', outlet: 'C', text_label: 'centro-esquerda' }),
      row({ news_id: '4', outlet: 'D', text_label: 'centro' }),
      row({ news_id: '5', outlet: 'E', text_label: 'esquerda' }),
    ])

    expect(coverage.blindspot).toEqual({ side: 'direita', percent: 0, severity: 'confirmed' })
    expect(coverage.sampleReliable).toBe(true)
  })

  it('não declara blindspot com menos de 3 veículos', () => {
    const coverage = buildCoverage([
      row({ news_id: '1', outlet: 'A', text_label: 'esquerda' }),
      row({ news_id: '2', outlet: 'B', text_label: 'centro' }),
    ])

    expect(coverage.blindspot).toBeNull()
  })

  it('ignora demonstração, sem rótulo e outro cluster', () => {
    const coverage = buildCoverage(
      [
        row({ outlet: 'Demo', url: 'https://exemplo.com.br/politica/materia' }),
        row({ outlet: 'Sem rótulo', text_label: null }),
        row({ outlet: 'Outro', cluster_id: 'cluster-2' }),
        row({ outlet: 'Real', news_id: 'real' }),
      ],
      story,
    )

    expect(coverage.totalOutlets).toBe(1)
    expect(coverage.sides[1].rows[0].news_id).toBe('real')
  })

  it('devolve estado vazio seguro', () => {
    const coverage = buildCoverage([])

    expect(coverage.totalOutlets).toBe(0)
    expect(coverage.totalClassified).toBe(0)
    expect(coverage.percentages).toEqual({ esquerda: 0, centro: 0, direita: 0 })
    expect(coverage.represented).toEqual([])
    expect(coverage.missing).toEqual(['esquerda', 'centro', 'direita'])
    expect(coverage.dominant).toBeNull()
    expect(coverage.coverage).toBe('sem-dados')
    expect(coverage.blindspot).toBeNull()
  })
})
```

- [ ] **Step 2: Rodar e confirmar a falha**

Run: `npm run test:run -- tests/unit/coverage.spec.js`

Expected: FAIL porque `@/lib/coverage` não existe.

- [ ] **Step 3: Implementar `buildCoverage`**

Criar `src/lib/coverage.js` com:

```js
import { BIAS_COLORS, BIAS_LABELS } from '@/lib/bias'
import { isDemoUrl } from '@/lib/perspectives'

const SIDE_DEFINITIONS = [
  { key: 'esquerda', label: 'Esquerda', color: BIAS_COLORS.esquerda },
  { key: 'centro', label: 'Centro', color: BIAS_COLORS.centro },
  { key: 'direita', label: 'Direita', color: BIAS_COLORS.direita },
]

const SIDE_BY_LABEL = new Map([
  ['esquerda', 'esquerda'],
  ['centro-esquerda', 'esquerda'],
  ['centro', 'centro'],
  ['centro-direita', 'direita'],
  ['direita', 'direita'],
  ['mista', 'incerta'],
])

function timestamp(value) {
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? null : parsed
}

function isBetter(candidate, current) {
  const candidateDate = timestamp(candidate.published_at)
  const currentDate = timestamp(current.published_at)
  if (candidateDate !== currentDate) {
    if (candidateDate === null) return false
    if (currentDate === null) return true
    return candidateDate > currentDate
  }
  return (candidate.confidence ?? 0) > (current.confidence ?? 0)
}

function sortRows(rows) {
  return rows.sort((a, b) => {
    const dateA = timestamp(a.published_at)
    const dateB = timestamp(b.published_at)
    if (dateA !== dateB) {
      if (dateA === null) return 1
      if (dateB === null) return -1
      return dateB - dateA
    }
    return (b.confidence ?? 0) - (a.confidence ?? 0)
  })
}

function emptySide(definition) {
  return { ...definition, rows: [], count: 0, percent: 0 }
}

function toPercentages(counts) {
  const total = counts.reduce((sum, count) => sum + count, 0)
  if (!total) return [0, 0, 0]

  const raw = counts.map((count) => (count / total) * 100)
  const rounded = raw.map(Math.floor)
  let remainder = 100 - rounded.reduce((sum, value) => sum + value, 0)

  const ranked = raw
    .map((value, index) => ({ index, fraction: value - rounded[index] }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index)

  for (let index = 0; index < remainder; index += 1) {
    rounded[ranked[index].index] += 1
  }

  return rounded
}

export function buildCoverage(rows = [], story = null) {
  const byOutlet = new Map()

  for (const row of rows) {
    if (!row || !row.outlet || !row.text_label) continue
    if (story?.cluster_id && row.cluster_id !== story.cluster_id) continue
    if (isDemoUrl(row.url)) continue
    if (!SIDE_BY_LABEL.has(row.text_label)) continue

    const current = byOutlet.get(row.outlet)
    if (!current || isBetter(row, current)) byOutlet.set(row.outlet, row)
  }

  const sides = SIDE_DEFINITIONS.map(emptySide)
  const uncertain = {
    key: 'incerta',
    label: 'Incerta',
    color: BIAS_COLORS.mista,
    rows: [],
    count: 0,
  }

  for (const row of byOutlet.values()) {
    const key = SIDE_BY_LABEL.get(row.text_label)
    const target = key === 'incerta' ? uncertain : sides.find((side) => side.key === key)
    target.rows.push(row)
  }

  sides.forEach((side) => sortRows(side.rows))
  sortRows(uncertain.rows)

  const percentages = toPercentages(sides.map((side) => side.rows.length))
  sides.forEach((side, index) => {
    side.count = side.rows.length
    side.percent = percentages[index]
  })
  uncertain.count = uncertain.rows.length

  const totalClassified = sides.reduce((sum, side) => sum + side.count, 0)
  const totalUncertain = uncertain.count
  const represented = sides.filter((side) => side.count).map((side) => side.key)
  const missing = sides.filter((side) => !side.count).map((side) => side.key)
  const dominantSide = sides.reduce(
    (best, side) => (!best || side.count > best.count ? side : best),
    null,
  )
  const dominant = dominantSide?.count ? dominantSide.key : null
  const dominantShare = dominant ? dominantSide.percent / 100 : 0
  const coverage =
    totalClassified === 0
      ? 'sem-dados'
      : represented.length === 3
        ? 'tres-lados'
        : represented.length === 2
          ? 'dois-lados'
          : 'um-lado'

  let blindspot = null
  if (totalClassified >= 3) {
    const lowest = sides.reduce(
      (best, side) => (side.percent < best.percent ? side : best),
      sides[0],
    )
    if (lowest.percent <= 10) {
      blindspot = {
        side: lowest.key,
        percent: lowest.percent,
        severity: totalClassified >= 5 ? 'confirmed' : 'possible',
      }
    }
  }

  return {
    story,
    clusterId: story?.cluster_id ?? rows[0]?.cluster_id ?? null,
    totalOutlets: totalClassified + totalUncertain,
    totalClassified,
    totalUncertain,
    sides,
    uncertain,
    percentages: {
      esquerda: percentages[0],
      centro: percentages[1],
      direita: percentages[2],
    },
    represented,
    missing,
    dominant,
    dominantShare,
    coverage,
    sampleReliable: totalClassified >= 5,
    blindspot,
  }
}

export const COVERAGE_SIDE_LABELS = BIAS_LABELS
```

Também exportar `isDemoUrl` em `src/lib/perspectives.js`:

```js
export function isDemoUrl(value) {
  // conteúdo existente
}
```

- [ ] **Step 4: Rodar os testes**

Run: `npm run test:run -- tests/unit/coverage.spec.js`

Expected: 9 passed.

- [ ] **Step 5: Checkpoint**

Revisar o diff. Não commitar sem pedido.

---

### Task 2: Componentes da cobertura

**Files:**

- Create: `src/components/coverage/CoverageBar.vue`
- Create: `src/components/coverage/CoverageSide.vue`
- Create: `src/components/coverage/CoverageBlindspot.vue`
- Test: `tests/unit/coverage-bar.spec.js`
- Test: `tests/unit/coverage-side.spec.js`
- Test: `tests/unit/coverage-blindspot.spec.js`

**Interfaces:**

- `CoverageBar` consome `coverage` de `buildCoverage`.
- `CoverageSide` consome uma `side` (`{ key, label, color, count, rows }`).
- `CoverageBlindspot` consome `blindspot` e `totalClassified`.

- [ ] **Step 1: Escrever testes de componentes**

`tests/unit/coverage-bar.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import CoverageBar from '@/components/coverage/CoverageBar.vue'
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
```

`tests/unit/coverage-side.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import CoverageSide from '@/components/coverage/CoverageSide.vue'

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
```

`tests/unit/coverage-blindspot.spec.js`:

```js
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import CoverageBlindspot from '@/components/coverage/CoverageBlindspot.vue'

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
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test:run -- tests/unit/coverage-bar.spec.js tests/unit/coverage-side.spec.js tests/unit/coverage-blindspot.spec.js`

Expected: FAIL porque os componentes não existem.

- [ ] **Step 3: Implementar os componentes**

`CoverageBar.vue`:

```vue
<script setup>
import { computed } from 'vue'

import PBadge from '@/components/ui/PBadge.vue'

const props = defineProps({
  coverage: { type: Object, required: true },
})

const ariaLabel = computed(
  () =>
    `Distribuição da cobertura: ${props.coverage.sides
      .map((side) => `${side.label}: ${side.percent}%`)
      .join(', ')}`,
)
</script>

<template>
  <div>
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-ink-muted">
          Distribuição
        </p>
        <h2 class="mt-2 text-xl">Como os veículos cobrem esta história</h2>
      </div>
      <PBadge color="#6F9BFF">{{ coverage.totalClassified }} veículos classificados</PBadge>
    </div>

    <div
      class="mt-5 flex h-3 overflow-hidden rounded-full bg-surface"
      role="img"
      :aria-label="ariaLabel"
    >
      <span
        v-for="side in coverage.sides"
        :key="side.key"
        :style="{ width: `${side.percent}%`, background: side.color }"
        :title="`${side.label}: ${side.percent}%`"
      />
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-3">
      <div
        v-for="side in coverage.sides"
        :key="side.key"
        class="rounded-xl bg-surface/40 px-3 py-2"
      >
        <span class="flex items-center gap-2 text-xs font-medium text-ink">
          <span class="h-2 w-2 rounded-full" :style="{ background: side.color }" />
          {{ side.label }}
        </span>
        <p class="mt-1 font-display text-2xl font-semibold" :style="{ color: side.color }">
          {{ side.percent }}%
        </p>
        <p class="text-[0.68rem] text-ink-muted">{{ side.count }} veículos</p>
      </div>
    </div>

    <p v-if="coverage.totalUncertain" class="mt-3 text-xs text-ink-muted">
      {{ coverage.totalUncertain }} incerta{{ coverage.totalUncertain > 1 ? 's' : '' }} fora do
      cálculo.
    </p>
  </div>
</template>
```

`CoverageSide.vue`:

```vue
<script setup>
import { BIAS_COLORS, BIAS_LABELS } from '@/lib/bias'
import PBadge from '@/components/ui/PBadge.vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  side: { type: Object, required: true },
})

function dateLabel(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'data não informada'
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function ratingLabel(item) {
  return item.curated_label ? BIAS_LABELS[item.curated_label] : 'sem rating curado'
}
</script>

<template>
  <section class="rounded-2xl border border-hairline bg-surface/35 p-4">
    <div class="flex items-center justify-between gap-3">
      <span class="flex items-center gap-2 text-sm font-medium text-ink">
        <span class="h-2 w-2 rounded-full" :style="{ background: side.color }" />
        {{ side.label }}
      </span>
      <span class="font-display text-sm font-semibold" :style="{ color: side.color }">
        {{ side.count }} veículos
      </span>
    </div>

    <ul v-if="side.rows.length" class="mt-4 space-y-5">
      <li v-for="item in side.rows" :key="item.news_id">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-medium text-ink">{{ item.outlet }}</span>
          <PBadge v-if="item.curated_label" :color="BIAS_COLORS[item.curated_label]">
            {{ ratingLabel(item) }}
          </PBadge>
          <span v-else class="text-[0.65rem] text-ink-muted">sem rating curado</span>
        </div>
        <RouterLink
          :to="{ name: 'bias', query: { url: item.url } }"
          class="mt-1 block text-sm font-medium leading-snug text-ink transition-colors hover:text-electric-soft"
        >
          {{ item.title }}
        </RouterLink>
        <p class="mt-1 text-[0.68rem] text-ink-muted">
          {{ dateLabel(item.published_at) }} · Texto: {{ BIAS_LABELS[item.text_label] }} · confiança
          {{ item.confidence ?? 0 }}%
        </p>
      </li>
    </ul>
    <p v-else class="mt-4 text-xs leading-relaxed text-ink-muted">
      Nenhum veículo classificado neste lado.
    </p>
  </section>
</template>
```

`CoverageBlindspot.vue`:

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  blindspot: { type: Object, required: true },
  totalClassified: { type: Number, required: true },
})

const PHRASE = { esquerda: 'à esquerda', centro: 'ao centro', direita: 'à direita' }

const phrase = computed(() => PHRASE[props.blindspot.side] ?? props.blindspot.side)
const title = computed(() =>
  props.blindspot.severity === 'confirmed'
    ? `Ponto cego ${phrase.value}`
    : `Possível ponto cego ${phrase.value}`,
)
</script>

<template>
  <div class="mt-4 rounded-2xl border border-amber-300/30 bg-amber-300/5 px-4 py-3">
    <p class="text-sm font-medium text-ink">{{ title }}</p>
    <p class="mt-1 text-xs leading-relaxed text-ink-muted">
      Apenas {{ blindspot.percent }}% dos {{ totalClassified }} veículos classificados estão neste
      lado.
      <template v-if="blindspot.severity === 'possible'">
        Com essa amostra limitada, leia como possível ponto cego.
      </template>
      Cobertura desigual não prova intenção editorial.
    </p>
  </div>
</template>
```

- [ ] **Step 4: Rodar os testes**

Run: `npm run test:run -- tests/unit/coverage-bar.spec.js tests/unit/coverage-side.spec.js tests/unit/coverage-blindspot.spec.js`

Expected: todos passam.

- [ ] **Step 5: Checkpoint**

Revisar o diff. Não commitar.

---

### Task 3: Serviço de cobertura

**Files:**

- Modify: `src/lib/services.js`
- Test: `tests/unit/services.integration.spec.js`

**Interfaces:**

- Produces: `fetchCoverage({ url, clusterId } = {})` → `Promise<ReturnType<buildCoverage>>`.
- Erros: URL não analisada lança mensagem clara; não chama `analyze-url`.

- [ ] **Step 1: Adicionar o teste de integração**

Em `tests/unit/services.integration.spec.js`, importar `fetchCoverage` e adicionar:

```js
it('carrega a cobertura de um cluster real', async () => {
  const coverage = await fetchCoverage({
    url: 'https://www.cnnbrasil.com.br/internacional/trump-diz-que-america-do-sul-esta-se-tornando-cada-vez-mais-conservadora/',
  })

  expect(coverage.totalClassified).toBeGreaterThan(0)
  expect(
    coverage.percentages.esquerda + coverage.percentages.centro + coverage.percentages.direita,
  ).toBe(100)
})
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test:run -- tests/unit/services.integration.spec.js`

Expected: FAIL porque `fetchCoverage` não existe.

- [ ] **Step 3: Implementar `fetchCoverage`**

Adicionar em `src/lib/services.js`:

```js
import { buildCoverage } from '@/lib/coverage'

export async function fetchCoverage({ url, clusterId } = {}) {
  if (useMockData || !insforge) return buildCoverage([], null)

  let story = null

  if (url) {
    const rows = ensure(
      await insforge.database
        .from('analysis_feed')
        .select('title,outlet,url,published_at,topic,topic_slug,cluster_id,cluster_size,confidence')
        .eq('url', url)
        .limit(1),
    )
    story = rows?.[0] ?? null
    if (!story) {
      throw new Error('Esta matéria ainda não foi analisada. Abra a Análise para processá-la.')
    }
  } else if (clusterId) {
    const rows = ensure(
      await insforge.database
        .from('analysis_feed')
        .select('title,outlet,url,published_at,topic,topic_slug,cluster_id,cluster_size,confidence')
        .eq('cluster_id', clusterId)
        .order('published_at', { ascending: false })
        .limit(1),
    )
    story = rows?.[0] ?? null
  }

  if (!story?.cluster_id) return buildCoverage([], null)

  const rows = ensure(
    await insforge.database
      .from('perspective_feed')
      .select(
        'news_id,cluster_id,outlet,title,url,published_at,text_label,confidence,curated_label,curated_confidence,outlet_estimate_label,outlet_estimate_confidence',
      )
      .eq('cluster_id', story.cluster_id)
      .limit(100),
  )

  return buildCoverage(rows, story)
}
```

- [ ] **Step 4: Rodar o teste**

Run: `npm run test:run -- tests/unit/services.integration.spec.js`

Expected: todos passam, incluindo o novo teste.

- [ ] **Step 5: Checkpoint**

Revisar o diff. Não commitar.

---

### Task 4: View, rota e navegação

**Files:**

- Create: `src/views/CoverageView.vue`
- Modify: `src/router/index.js`
- Modify: `src/components/layout/AppNavbar.vue`
- Modify: `src/components/layout/AppFooter.vue`
- Modify: `src/components/analysis/StoryPerspectives.vue`
- Test: `tests/unit/coverage-view.spec.js`
- Modify: `tests/unit/story-perspectives.spec.js`

**Interfaces:**

- Consumes `fetchCoverage`.
- Route name: `coverage`; path `/cobertura`.
- Query: `url` ou `cluster`.

- [ ] **Step 1: Escrever o teste da view**

Criar `tests/unit/coverage-view.spec.js`:

```js
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import CoverageView from '@/views/CoverageView.vue'
import { buildCoverage } from '@/lib/coverage'

const fetchCoverage = vi.fn()
const replace = vi.fn()

vi.mock('@/lib/services', () => ({
  fetchCoverage: (...args) => fetchCoverage(...args),
}))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRoute: () => ({ query: { url: 'https://g1.globo.com/materia' } }),
    useRouter: () => ({ replace }),
  }
})

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

    const wrapper = mount(CoverageView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          PButton: { template: '<button><slot /></button>' },
        },
      },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Manchete principal')
    expect(wrapper.text()).toContain('Como os veículos cobrem esta história')
    expect(wrapper.text()).toContain('3 veículos classificados')
  })

  it('mostra erro e CTA quando a URL não foi analisada', async () => {
    fetchCoverage.mockRejectedValue(
      new Error('Esta matéria ainda não foi analisada. Abra a Análise para processá-la.'),
    )

    const wrapper = mount(CoverageView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          PButton: { template: '<button><slot /></button>' },
        },
      },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('ainda não foi analisada')
    expect(wrapper.text()).toContain('Analisar matéria')
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test:run -- tests/unit/coverage-view.spec.js`

Expected: FAIL porque a view não existe.

- [ ] **Step 3: Implementar a view**

Criar `src/views/CoverageView.vue` com:

```vue
<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CoverageBar from '@/components/coverage/CoverageBar.vue'
import CoverageBlindspot from '@/components/coverage/CoverageBlindspot.vue'
import CoverageSide from '@/components/coverage/CoverageSide.vue'
import PBadge from '@/components/ui/PBadge.vue'
import PButton from '@/components/ui/PButton.vue'
import PCard from '@/components/ui/PCard.vue'
import { fetchCoverage } from '@/lib/services'

const route = useRoute()
const router = useRouter()

const input = ref(String(route.query.url || ''))
const coverage = ref(null)
const loading = ref(false)
const error = ref('')

const hasQuery = computed(() => Boolean(route.query.url || route.query.cluster))
const analyzeLink = computed(() => ({
  name: 'analysis',
  query: route.query.url ? { url: String(route.query.url) } : {},
}))

const storyDate = computed(() => {
  const value = coverage.value?.story?.published_at
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
})

async function load() {
  if (!hasQuery.value) {
    coverage.value = null
    error.value = ''
    return
  }

  loading.value = true
  error.value = ''
  try {
    coverage.value = await fetchCoverage({
      url: route.query.url ? String(route.query.url) : undefined,
      clusterId: route.query.cluster ? String(route.query.cluster) : undefined,
    })
  } catch (cause) {
    coverage.value = null
    error.value = cause instanceof Error ? cause.message : 'Não foi possível carregar a cobertura.'
  } finally {
    loading.value = false
  }
}

function submit() {
  const url = input.value.trim()
  if (!url) return
  if (String(route.query.url || '') === url) {
    load()
    return
  }
  router.replace({ name: 'coverage', query: { url } })
}

watch(() => `${route.query.url ?? ''}|${route.query.cluster ?? ''}`, load)
onMounted(load)
</script>

<template>
  <div class="pb-10">
    <div class="container-prisma">
      <header class="mx-auto max-w-3xl text-center">
        <PBadge color="#6F9BFF" dot pulse>Prisma Cobertura</PBadge>
        <h1 class="mt-6 text-4xl leading-tight sm:text-5xl">Cobertura da História</h1>
        <p class="mt-4 text-sm leading-relaxed text-ink-muted">
          Veja como veículos diferentes cobriram o mesmo fato e qual lado ficou de fora.
        </p>
        <form class="mx-auto mt-6 flex max-w-xl gap-2" @submit.prevent="submit">
          <input
            v-model="input"
            type="url"
            placeholder="URL de uma matéria já analisada"
            class="w-full rounded-full border border-hairline bg-surface/60 px-4 py-2.5 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-electric-soft"
          />
          <PButton type="submit" size="sm">Ver cobertura</PButton>
        </form>
      </header>

      <PCard v-if="loading" class="mt-8" :hover="false">
        <p class="text-sm text-ink-muted">Carregando cobertura...</p>
      </PCard>

      <PCard v-else-if="error" class="mt-8" :hover="false">
        <p class="text-sm font-medium text-ink">{{ error }}</p>
        <PButton :to="analyzeLink" variant="outline" size="sm" class="mt-4">
          Analisar matéria
        </PButton>
      </PCard>

      <PCard v-else-if="!hasQuery" class="mt-8" :hover="false">
        <p class="text-sm font-medium text-ink">Abra uma matéria já analisada.</p>
        <p class="mt-2 text-xs leading-relaxed text-ink-muted">
          Cole a URL acima ou chegue aqui pelo card de perspectivas de uma análise.
        </p>
      </PCard>

      <template v-else-if="coverage && coverage.totalOutlets">
        <PCard class="mt-8" :hover="false">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="max-w-3xl">
              <p class="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-ink-muted">
                {{ coverage.story?.topic || 'História' }}
              </p>
              <h2 class="mt-2 text-2xl leading-tight">{{ coverage.story?.title }}</h2>
              <p class="mt-2 text-xs text-ink-muted">
                {{ coverage.story?.outlet }} · {{ storyDate }}
                <template v-if="coverage.story?.cluster_size">
                  · cluster com {{ coverage.story.cluster_size }} matérias
                </template>
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <PButton :to="analyzeLink" variant="outline" size="sm">DNA</PButton>
              <PButton
                v-if="coverage.story?.url"
                :to="{ name: 'bias', query: { url: coverage.story.url } }"
                variant="outline"
                size="sm"
              >
                Enquadramento
              </PButton>
            </div>
          </div>

          <CoverageBar :coverage="coverage" class="mt-6" />

          <div class="mt-4 flex flex-wrap gap-2">
            <PBadge v-if="!coverage.sampleReliable" color="#FFC24B">Amostra pequena</PBadge>
            <PBadge v-if="coverage.totalUncertain" color="#2EE6A8">
              {{ coverage.totalUncertain }} incerta{{ coverage.totalUncertain > 1 ? 's' : '' }}
            </PBadge>
          </div>

          <CoverageBlindspot
            v-if="coverage.blindspot"
            :blindspot="coverage.blindspot"
            :total-classified="coverage.totalClassified"
          />
        </PCard>

        <div class="mt-5 grid gap-4 lg:grid-cols-3">
          <CoverageSide v-for="side in coverage.sides" :key="side.key" :side="side" />
        </div>

        <PCard v-if="coverage.totalUncertain" class="mt-5" :hover="false">
          <p class="text-sm font-medium text-ink">Incertas / mistas</p>
          <p class="mt-1 text-xs text-ink-muted">
            Fora da barra principal para não forçar um lado.
          </p>
          <ul class="mt-3 space-y-2">
            <li v-for="item in coverage.uncertain.rows" :key="item.news_id" class="text-xs">
              <RouterLink
                :to="{ name: 'bias', query: { url: item.url } }"
                class="text-ink-muted hover:text-ink"
              >
                {{ item.title }} · {{ item.outlet }}
              </RouterLink>
            </li>
          </ul>
        </PCard>

        <p class="mt-6 border-t border-hairline pt-4 text-xs leading-relaxed text-ink-muted">
          A barra usa o enquadramento estimado de cada texto, com um veículo por vez. O rating
          curado do veículo é contexto e pode estar ausente. Esta leitura não é checagem de fatos,
          ranking de qualidade nem prova de equilíbrio editorial.
        </p>
      </template>

      <PCard v-else-if="coverage" class="mt-8" :hover="false">
        <p class="text-sm font-medium text-ink">Ainda não há cobertura comparável.</p>
        <p class="mt-2 text-xs leading-relaxed text-ink-muted">
          O cluster pode ter apenas esta matéria analisada. A distribuição aparecerá quando houver
          outros veículos com análise de enquadramento.
        </p>
        <PButton :to="{ name: 'compare' }" variant="outline" size="sm" class="mt-4">
          Comparar por tema
        </PButton>
      </PCard>
    </div>
  </div>
</template>
```

- [ ] **Step 4: Adicionar rota e links**

Em `src/router/index.js`, adicionar após `/comparacao`:

```js
{
  path: '/cobertura',
  name: 'coverage',
  component: () => import('@/views/CoverageView.vue'),
  meta: { title: 'Cobertura da História | Prisma' },
},
```

Em `AppNavbar.vue`, adicionar `{ to: '/cobertura', label: 'Cobertura' }` após Comparação.

Em `AppFooter.vue`, adicionar `{ to: '/cobertura', label: 'Cobertura da História' }`.

Em `StoryPerspectives.vue`, dentro do estado com dados, após o rodapé metodológico:

```vue
<PButton
  v-if="perspectives.clusterId"
  :to="{ name: 'coverage', query: { cluster: perspectives.clusterId } }"
  variant="outline"
  size="sm"
  class="mt-4"
>
  Ver cobertura completa
</PButton>
```

Atualizar `tests/unit/story-perspectives.spec.js` para cobrir o CTA:

```js
it('linka a cobertura completa quando há cluster', () => {
  const wrapper = mount(StoryPerspectives, {
    props: {
      perspectives: buildPerspectives(
        [row({ news_id: '1', outlet: 'Folha', text_label: 'esquerda' })],
        { clusterId: 'cluster-1' },
      ),
    },
    global: {
      stubs: { RouterLink: { template: '<a><slot /></a>' } },
    },
  })

  expect(wrapper.text()).toContain('Ver cobertura completa')
})
```

- [ ] **Step 5: Rodar os testes**

Run: `npm run test:run -- tests/unit/coverage-view.spec.js tests/unit/story-perspectives.spec.js`

Expected: todos passam.

- [ ] **Step 6: Checkpoint**

Revisar o diff. Não commitar.

---

### Task 5: Metodologia e documentação do produto

**Files:**

- Create: `docs/metodologia-cobertura.md`
- Modify: `PAGINAS.md`
- Modify: `FUNCIONALIDADES.md`
- Modify: `AGENTS.md`

- [ ] **Step 1: Criar a metodologia**

Criar `docs/metodologia-cobertura.md` com:

- escopo do rating (veículo, não matéria);
- escala de cinco posições;
- critérios observáveis;
- referências públicas obrigatórias;
- versionamento e revisão;
- limites e linguagem proibida;
- regra de que `source_bias_profiles` fica vazio até curadoria real.

- [ ] **Step 2: Atualizar `PAGINAS.md`**

Adicionar a rota `/cobertura` ao resumo e uma seção “Cobertura da História” com:

- entrada por URL analisada ou cluster;
- barra por enquadramento do texto;
- dedupe por veículo;
- incertas fora da barra;
- blindspot e amostra pequena;
- rating curado como contexto, sem rótulos inventados;
- ausência de fallback fictício.

- [ ] **Step 3: Atualizar `FUNCIONALIDADES.md`**

Adicionar:

- `/cobertura` na tabela de rotas;
- seção da tela;
- `perspective_feed` e `source_bias_profiles` na fonte de dados;
- item em “Já implementado”.

- [ ] **Step 4: Atualizar `AGENTS.md`**

Adicionar uma nota curta: `/cobertura` lê `analysis_feed`, `perspective_feed` e
`source_bias_profiles`; não inventa ratings e não dispara `analyze-url`.

- [ ] **Step 5: Formatar docs**

Run: `npx prettier --write docs/metodologia-cobertura.md PAGINAS.md FUNCIONALIDADES.md AGENTS.md`

---

### Task 6: Verificação final

- [ ] **Step 1: Rodar a suíte completa**

Run: `npm run test:run`

Expected: todos os testes passam.

- [ ] **Step 2: Rodar lint**

Run: `npm run lint`

Expected: sem erros.

- [ ] **Step 3: Rodar formatação**

Run: `npm run format:check`

Expected: sem avisos.

- [ ] **Step 4: Rodar build**

Run: `npm run build`

Expected: build concluído.

- [ ] **Step 5: Revisar o diff final**

Run: `git status --short && git diff --stat`

Expected: somente arquivos previstos; sem segredos, `.env` ou `dist` versionado.

- [ ] **Step 6: Encerrar sem commit/deploy**

Não commitar nem publicar sem pedido explícito. Informar o que foi implementado e os resultados
dos comandos.

---

## Self-Review

- **Cobertura da spec:** página, URL/cluster, barra, colunas, incertas, blindspot, ratings ausentes,
  metodologia, estados de erro, navegação e testes estão nas Tasks 1–6.
- **Placeholders:** não há TBD/TODO; os testes e implementações centrais têm código.
- **Consistência de tipos:** `buildCoverage` sempre expõe `sides`, `uncertain`, `percentages`,
  `totalClassified`, `sampleReliable` e `blindspot`; `CoverageBar`, `CoverageSide` e
  `CoverageBlindspot` consomem esses nomes.
- **Sem migration:** as views e a tabela existentes bastam.
- **Commits:** omitidos por instrução do projeto; checkpoints apenas revisam o diff.
