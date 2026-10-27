<script setup>
/** COMPARAÇÃO INTELIGENTE — Brand Book Cap. 5 */
import { computed, onMounted, ref } from 'vue'

import DnaRadar from '@/components/analysis/DnaRadar.vue'
import PBadge from '@/components/ui/PBadge.vue'
import PButton from '@/components/ui/PButton.vue'
import PCard from '@/components/ui/PCard.vue'
import { COMPARISON, DNA_AXES, SAMPLE_ANALYSIS } from '@/data'
import { buildComparisonFromAnalyses } from '@/lib/comparison'
import { dnaAverage } from '@/lib/radar'
import { analyzeArticles, fetchAnalysis, fetchComparison, searchWebCoverage } from '@/lib/services'
import { MAX_SELECTION, normalizeSearchResults } from '@/lib/websearch'
import { useReveal } from '@/composables/useReveal'

const { root } = useReveal()

const comparison = ref(COMPARISON)
const query = ref(COMPARISON.topic)
const rowKey = (row) => row?.id ?? row?.outlet
const selected = ref(rowKey(COMPARISON.rows[0]))

/** Etapas da busca: idle → searching → choosing → analyzing. */
const phase = ref('idle')
const candidates = ref([])
const picked = ref([])
const progress = ref({ done: 0, total: 0 })
const feedback = ref(null)
const source = ref('cluster')

const busy = computed(() => phase.value === 'searching' || phase.value === 'analyzing')
const selectedCount = computed(() => picked.value.length)
const canCompare = computed(() => selectedCount.value > 0 && phase.value !== 'analyzing')
const searchLabel = computed(() => {
  if (phase.value === 'searching') return 'Buscando na internet…'
  if (phase.value === 'analyzing')
    return `Analisando ${progress.value.done} de ${progress.value.total}…`
  return 'Buscar na internet'
})

const rows = computed(() => comparison.value.rows)
const current = computed(() => rows.value.find((r) => rowKey(r) === selected.value))

/** Média do cluster por eixo — a "cobertura média" do fato. */
const clusterAverage = computed(() => {
  const acc = {}
  if (!rows.value.length) return acc
  DNA_AXES.forEach((axis) => {
    acc[axis.key] = Math.round(
      rows.value.reduce((sum, r) => sum + r.dna[axis.key], 0) / rows.value.length,
    )
  })
  return acc
})

/** Maior divergência entre veículos por eixo. */
const divergences = computed(() => {
  if (rows.value.length < 2) return []
  return DNA_AXES.map((axis) => {
    const values = rows.value.map((r) => ({ outlet: r.outlet, value: r.dna[axis.key] }))
    const min = values.reduce((a, b) => (b.value < a.value ? b : a))
    const max = values.reduce((a, b) => (b.value > a.value ? b : a))
    return { axis, min, max, spread: max.value - min.value }
  }).sort((a, b) => b.spread - a.spread)
})

async function search() {
  const rawInput = query.value.trim()
  if (!rawInput) return
  feedback.value = null
  phase.value = 'searching'

  let term = rawInput
  if (/^https?:\/\//i.test(rawInput)) {
    try {
      feedback.value = { type: 'info', message: 'Lendo matéria para descobrir o tema...' }
      const analysis = await fetchAnalysis(rawInput)
      if (analysis?.title) {
        term = analysis.title
        query.value = term
      } else {
        const parsed = new URL(rawInput)
        const slug = parsed.pathname.split('/').filter(Boolean).pop() || ''
        term = slug.replace(/[-_]/g, ' ') || rawInput
        query.value = term
      }
    } catch {
      try {
        const parsed = new URL(rawInput)
        const slug = parsed.pathname.split('/').filter(Boolean).pop() || ''
        term = slug.replace(/[-_]/g, ' ') || rawInput
        query.value = term
      } catch {
        term = rawInput
      }
    }
    feedback.value = null
  }

  try {
    const result = await searchWebCoverage(term)
    const list = normalizeSearchResults(result.results)
    if (!list.length) {
      candidates.value = []
      phase.value = 'idle'
      feedback.value = {
        type: 'error',
        message: 'Nenhuma matéria de imprensa foi encontrada para este tema.',
      }
      return
    }
    candidates.value = list
    picked.value = list.slice(0, MAX_SELECTION).map((item) => item.url)
    phase.value = 'choosing'
  } catch (error) {
    phase.value = 'idle'
    feedback.value = {
      type: 'error',
      message: error instanceof Error ? error.message : 'Falha ao buscar na internet.',
    }
  }
}

function toggle(url) {
  picked.value = picked.value.includes(url)
    ? picked.value.filter((item) => item !== url)
    : [...picked.value, url].slice(0, MAX_SELECTION)
}

async function compareSelection() {
  const term = query.value.trim() || COMPARISON.topic
  const chosen = candidates.value.filter((item) => picked.value.includes(item.url))
  if (!chosen.length) return

  phase.value = 'analyzing'
  progress.value = { done: 0, total: chosen.length }
  feedback.value = null

  try {
    const { analyses, failures } = await analyzeArticles(
      chosen.map((item) => item.url),
      term,
      (done, total) => {
        progress.value = { done, total }
      },
    )

    if (analyses.length < 2) {
      phase.value = 'choosing'
      feedback.value = {
        type: 'error',
        message:
          analyses.length === 1
            ? 'Apenas 1 matéria foi analisada com sucesso. A comparação requer ao menos 2 matérias.'
            : 'Não foi possível analisar as matérias selecionadas (limite de API ou timeout).',
      }
      return
    }

    comparison.value = buildComparisonFromAnalyses(analyses, term)
    selected.value = rowKey(comparison.value.rows[0]) ?? ''
    source.value = 'web'
    phase.value = 'idle'
    candidates.value = []
    picked.value = []
    if (failures.length) {
      feedback.value = {
        type: 'info',
        message: `${failures.length} matéria(s) não puderam ser lidas e ficaram de fora.`,
      }
    }
  } catch (error) {
    phase.value = 'choosing'
    feedback.value = {
      type: 'error',
      message: error instanceof Error ? error.message : 'Falha ao comparar as matérias.',
    }
  }
}

onMounted(async () => {
  comparison.value = await fetchComparison()
  selected.value = rowKey(comparison.value.rows[0]) ?? ''
})
</script>

<template>
  <div ref="root" class="pb-10">
    <div class="container-prisma">
      <header class="mx-auto max-w-3xl text-center">
        <PBadge color="#2D6BFF" dot>Cap. 5 · Comparação Inteligente</PBadge>
        <h1 class="mt-6 text-4xl leading-tight sm:text-5xl">
          O mesmo fato, <span class="text-gradient">vários ângulos.</span>
        </h1>
        <p class="mx-auto mt-4 max-w-xl text-base text-ink-muted">
          Pesquise um tema na internet. O Engine encontra as matérias mais recentes, analisa cada
          uma e mostra qual destaque cada veículo escolheu.
        </p>

        <form class="mt-8 flex flex-col gap-3 sm:flex-row" @submit.prevent="search">
          <label class="sr-only" for="topic">Tema</label>
          <input
            id="topic"
            v-model="query"
            type="text"
            placeholder="Reforma Tributária ou cole uma URL"
            :disabled="busy"
            class="h-13 flex-1 rounded-full border border-hairline bg-surface px-5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted/70 focus:border-electric-soft disabled:opacity-60"
          />
          <PButton type="submit" :disabled="busy">{{ searchLabel }}</PButton>
        </form>

        <p
          v-if="feedback"
          class="mx-auto mt-4 max-w-2xl text-center text-xs"
          :class="feedback.type === 'error' ? 'text-energy' : 'text-ink-muted'"
        >
          {{ feedback.message }}
        </p>

        <!-- matérias encontradas na internet -->
        <PCard v-if="candidates.length" class="mt-8 text-left" accent="#2D6BFF">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-lg">Matérias encontradas</h2>
              <p class="mt-1.5 text-xs text-ink-muted">
                Marque até {{ MAX_SELECTION }} matérias para analisar e comparar.
              </p>
            </div>
            <PButton :disabled="!canCompare" @click="compareSelection">
              {{
                phase === 'analyzing'
                  ? `Analisando ${progress.done} de ${progress.total}…`
                  : `Analisar e comparar (${selectedCount})`
              }}
            </PButton>
          </div>

          <ul class="mt-5 space-y-2">
            <li v-for="item in candidates" :key="item.url">
              <label
                class="flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors"
                :class="
                  picked.includes(item.url)
                    ? 'border-electric-soft/50 bg-electric/5'
                    : 'border-hairline hover:bg-surface'
                "
              >
                <input
                  type="checkbox"
                  :checked="picked.includes(item.url)"
                  class="mt-1 h-4 w-4 accent-electric"
                  @change="toggle(item.url)"
                />
                <span class="flex-1">
                  <span class="block font-display text-sm font-medium">{{ item.outlet }}</span>
                  <span class="mt-1 block text-sm text-ink-muted">{{ item.title }}</span>
                  <a
                    :href="item.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="mt-1.5 inline-block text-[0.7rem] text-ink-muted underline decoration-dotted hover:text-ink"
                    @click.stop
                    >abrir matéria</a
                  >
                </span>
              </label>
            </li>
          </ul>
        </PCard>
      </header>

      <!-- contexto do cluster -->
      <div class="mt-12 flex flex-wrap items-center justify-center gap-3">
        <PBadge color="#8B5CF6">{{ comparison.topic }}</PBadge>
        <PBadge color="#6F9BFF">{{ comparison.window }}</PBadge>
        <PBadge color="#FFC24B"
          >{{ comparison.outletCount ?? rows.length }} veículos comparados</PBadge
        >
        <PBadge v-if="source === 'web'" color="#2D6BFF">busca na internet</PBadge>
        <PBadge v-if="comparison.demo" color="#FFC24B">dados de demonstração</PBadge>
      </div>

      <p
        v-if="
          comparison.demo &&
          comparison.requestedTopic &&
          comparison.requestedTopic.toLowerCase() !== comparison.topic.toLowerCase()
        "
        class="mx-auto mt-4 max-w-2xl text-center text-xs text-ink-muted"
      >
        Não encontramos um cluster para “{{ comparison.requestedTopic }}”. Exibindo o exemplo de “{{
          comparison.topic
        }}”.
      </p>

      <!-- tabela de comparação -->
      <PCard data-reveal accent="#2D6BFF" :padded="false" class="mt-10 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[720px] text-left">
            <thead>
              <tr
                class="border-b border-hairline text-[0.68rem] uppercase tracking-[0.18em] text-ink-muted"
              >
                <th class="px-6 py-4 font-medium">Veículo</th>
                <th class="px-6 py-4 font-medium">Destaque</th>
                <th class="px-6 py-4 font-medium">Ângulo predominante</th>
                <th class="px-6 py-4 font-medium">Tom</th>
                <th class="px-6 py-4 font-medium text-right">Índice</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in rows"
                :key="rowKey(row)"
                class="cursor-pointer border-b border-hairline/60 transition-colors last:border-0"
                :class="selected === rowKey(row) ? 'bg-electric/8' : 'hover:bg-surface'"
                @click="selected = rowKey(row)"
              >
                <td class="px-6 py-5">
                  <span class="flex items-center gap-3">
                    <span class="h-8 w-1 rounded-full" :style="{ background: row.accent }" />
                    <span class="font-display text-base font-medium">{{ row.outlet }}</span>
                  </span>
                </td>
                <td class="px-6 py-5">
                  <span
                    class="rounded-full px-3 py-1 text-xs font-medium"
                    :style="{ color: row.accent, background: `${row.accent}16` }"
                  >
                    {{ row.highlight }}
                  </span>
                </td>
                <td class="px-6 py-5 text-sm text-ink-muted">{{ row.angle }}</td>
                <td class="px-6 py-5 text-sm text-ink-muted">{{ row.tone }}</td>
                <td class="px-6 py-5 text-right font-display text-base font-semibold">
                  {{ dnaAverage(row.dna) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </PCard>

      <!-- radar comparativo + divergências -->
      <div class="mt-5 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        <PCard v-if="current" data-reveal accent="#8B5CF6" class="p-8">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-lg">{{ current.outlet }} vs. média do cluster</h2>
            <div class="flex gap-1.5">
              <button
                v-for="row in rows"
                :key="rowKey(row)"
                type="button"
                class="rounded-full border px-3 py-1 text-xs transition-colors"
                :class="
                  selected === rowKey(row)
                    ? 'border-transparent text-white'
                    : 'border-hairline text-ink-muted hover:text-ink'
                "
                :style="selected === rowKey(row) ? { background: row.accent } : {}"
                @click="selected = rowKey(row)"
              >
                {{ row.outlet }}
              </button>
            </div>
          </div>

          <div class="mt-7">
            <DnaRadar
              :key="current.outlet"
              :values="current.dna"
              :compare="clusterAverage"
              compare-label="Média do cluster"
              :size="400"
            />
          </div>
        </PCard>

        <div class="space-y-5">
          <PCard data-reveal accent="#FF3B5C">
            <h2 class="text-lg">Onde os veículos mais divergem</h2>
            <p class="mt-1.5 text-xs text-ink-muted">
              Diferença entre a maior e a menor pontuação de cada eixo.
            </p>
            <ul v-if="divergences.length" class="mt-5 space-y-4">
              <li v-for="d in divergences.slice(0, 4)" :key="d.axis.key">
                <div class="flex items-baseline justify-between text-sm">
                  <span class="font-medium">{{ d.axis.label }}</span>
                  <span class="font-display font-semibold" :style="{ color: d.axis.color }">
                    {{ d.spread }} pts
                  </span>
                </div>
                <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
                  <div
                    class="h-full rounded-full"
                    :style="{
                      width: `${d.spread}%`,
                      background: `linear-gradient(90deg, ${d.axis.color}55, ${d.axis.color})`,
                    }"
                  />
                </div>
                <p class="mt-1.5 text-[0.7rem] text-ink-muted">
                  {{ d.max.outlet }} ({{ d.max.value }}) · {{ d.min.outlet }} ({{ d.min.value }})
                </p>
              </li>
            </ul>
            <p v-else class="mt-5 text-xs text-ink-muted">
              Necessário ao menos 2 veículos distintos para calcular divergências.
            </p>
          </PCard>

          <PCard data-reveal accent="#FFC24B">
            <h2 class="text-lg">Leitura do Prisma</h2>
            <p class="mt-3 text-sm leading-relaxed text-ink-muted">
              O cluster revela como o mesmo fato ganha ênfases distintas: alguns veículos priorizam
              dados e impacto fiscal, outros ampliam o ângulo social ou crítico. A comparação é
              descritiva, não um ranking de qualidade.
            </p>
          </PCard>
        </div>
      </div>

      <p v-if="comparison.demo" class="mt-8 text-center text-xs text-ink-muted">
        Exemplo de referência: “{{ SAMPLE_ANALYSIS.title }}”
      </p>
      <p v-else class="mt-8 text-center text-xs text-ink-muted">
        {{
          source === 'web'
            ? `Busca na internet · “${comparison.topic}” · ${comparison.outletCount ?? rows.length} veículos comparados.`
            : `Cluster “${comparison.topic}” · ${comparison.outletCount ?? rows.length} veículos comparados.`
        }}
      </p>
    </div>
  </div>
</template>
