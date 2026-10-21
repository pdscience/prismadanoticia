<script setup>
/** MAPA DE POLARIZAÇÃO EM TEMPO REAL — o moat do PRISMA. */
import { computed, ref } from 'vue'

import PolarizationMap from '@/components/intel/PolarizationMap.vue'
import MeterBar from '@/components/ui/MeterBar.vue'
import PBadge from '@/components/ui/PBadge.vue'
import PButton from '@/components/ui/PButton.vue'
import PCard from '@/components/ui/PCard.vue'
import { POLARIZATION_THEMES, STATES } from '@/data'
import { polarizationColor } from '@/lib/colors'
import { dominantTheme } from '@/lib/intel'
import { useReveal } from '@/composables/useReveal'

const { root } = useReveal()

const modes = [
  { key: 'dominante', label: 'Tema dominante' },
  { key: 'polarizacao', label: 'Polarização' },
  ...POLARIZATION_THEMES.map((t) => ({ key: t.key, label: t.label })),
]

const mode = ref('dominante')
const selected = ref(STATES.find((s) => s.uf === 'SP'))

const ranking = computed(() =>
  [...STATES].sort((a, b) => b.polarization - a.polarization).slice(0, 6),
)

const nationalMix = computed(() => {
  const totals = {}
  POLARIZATION_THEMES.forEach((t) => {
    totals[t.key] = Math.round(STATES.reduce((sum, s) => sum + s.themes[t.key], 0) / STATES.length)
  })
  return totals
})

const selectedThemes = computed(() =>
  POLARIZATION_THEMES.map((t) => ({ ...t, value: selected.value.themes[t.key] })).sort(
    (a, b) => b.value - a.value,
  ),
)

const totalOutlets = STATES.reduce((sum, s) => sum + s.outlets, 0)
</script>

<template>
  <div ref="root" class="pb-10">
    <div class="container-prisma">
      <header class="mx-auto max-w-3xl text-center">
        <PBadge color="#FFC24B" dot pulse>Inteligência nacional sobre narrativas</PBadge>
        <h1 class="mt-6 text-4xl leading-tight sm:text-5xl">
          Mapa de Polarização <span class="text-gradient">em Tempo Real.</span>
        </h1>
        <p class="mx-auto mt-4 max-w-2xl text-base text-ink-muted">
          Cada estado mostra quais temas dominam a cobertura naquele momento e o quanto diferentes
          grupos de veículos divergem no enquadramento.
        </p>
      </header>

      <!-- filtros -->
      <div class="mt-10 flex flex-wrap justify-center gap-2">
        <button
          v-for="m in modes"
          :key="m.key"
          type="button"
          class="rounded-full border px-4 py-2 text-xs font-medium transition-all"
          :class="
            mode === m.key
              ? 'border-transparent bg-linear-to-r from-electric to-prism text-white'
              : 'border-hairline text-ink-muted hover:text-ink'
          "
          @click="mode = m.key"
        >
          {{ m.label }}
        </button>
      </div>

      <div class="mt-10 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <!-- mapa -->
        <PCard data-reveal accent="#8B5CF6" class="p-8">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-lg">Cartograma nacional</h2>
            <span class="text-xs text-ink-muted">{{ totalOutlets }} veículos monitorados</span>
          </div>

          <div class="mt-6">
            <PolarizationMap :mode="mode" @select="selected = $event" />
          </div>

          <div
            class="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-hairline pt-5"
          >
            <span
              v-for="theme in POLARIZATION_THEMES"
              :key="theme.key"
              class="flex items-center gap-2 text-xs text-ink-muted"
            >
              <span class="h-2 w-2 rounded-sm" :style="{ background: theme.color }" />
              {{ theme.label }}
              <span class="font-display font-semibold text-ink">{{ nationalMix[theme.key] }}%</span>
            </span>
          </div>
        </PCard>

        <div class="space-y-5">
          <!-- estado selecionado -->
          <PCard data-reveal accent="#2D6BFF">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-2xl">{{ selected.name }}</h2>
                <p class="mt-1 text-xs text-ink-muted">
                  {{ selected.outlets }} veículos · tema dominante
                  <strong :style="{ color: dominantTheme(selected).color }">
                    {{ dominantTheme(selected).label }}
                  </strong>
                </p>
              </div>
              <span
                class="font-display text-4xl font-semibold"
                :style="{ color: dominantTheme(selected).color }"
              >
                {{ selected.uf }}
              </span>
            </div>

            <div class="mt-6 space-y-4">
              <MeterBar
                v-for="t in selectedThemes"
                :key="t.key"
                :label="t.label"
                :value="t.value"
                :color="t.color"
              />
            </div>

            <div class="mt-6 rounded-2xl border border-hairline p-4">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">Índice de polarização</span>
                <span
                  class="font-display text-xl font-semibold"
                  :style="{ color: polarizationColor(selected.polarization) }"
                >
                  {{ selected.polarization }}
                </span>
              </div>
              <p class="mt-2 text-xs leading-relaxed text-ink-muted">
                Mede o quanto grupos distintos de veículos divergem ao enquadrar os mesmos fatos
                naquele estado.
              </p>
            </div>
          </PCard>

          <!-- ranking -->
          <PCard data-reveal accent="#FF3B5C">
            <h2 class="text-lg">Estados mais polarizados</h2>
            <ul class="mt-5 space-y-3">
              <li
                v-for="(s, i) in ranking"
                :key="s.uf"
                class="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-surface"
                @click="selected = s"
              >
                <span class="w-5 font-display text-xs text-ink-muted">{{ i + 1 }}</span>
                <span class="w-9 font-display text-sm font-semibold">{{ s.uf }}</span>
                <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
                  <div
                    class="h-full rounded-full bg-linear-to-r from-insight to-energy"
                    :style="{ width: `${s.polarization}%` }"
                  />
                </div>
                <span class="font-display text-sm font-semibold">{{ s.polarization }}</span>
              </li>
            </ul>
          </PCard>
        </div>
      </div>

      <!-- para quem serve -->
      <PCard data-reveal accent="#FFC24B" class="mt-5">
        <div class="grid gap-8 md:grid-cols-[1fr_1.4fr] md:items-center">
          <div>
            <h2 class="text-xl">Um ativo difícil de copiar</h2>
            <p class="mt-3 text-sm leading-relaxed text-ink-muted">
              O mapa transforma o Prisma de analisador de notícias em plataforma de inteligência
              nacional sobre narrativas — com valor direto para imprensa, universidades e institutos
              de pesquisa.
            </p>
            <PButton to="/tecnologia" variant="outline" size="sm" class="mt-6">
              Ver a tecnologia por trás
            </PButton>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <div
              v-for="item in [
                { t: 'Imprensa', d: 'Pautas e ângulos ainda inexplorados por região.' },
                { t: 'Universidades', d: 'Séries históricas de enquadramento para pesquisa.' },
                { t: 'Institutos', d: 'Correlação entre narrativa e opinião pública.' },
                { t: 'API', d: 'Acesso programático aos indicadores por UF.' },
              ]"
              :key="item.t"
              class="rounded-2xl border border-hairline p-4"
            >
              <p class="font-display text-sm font-medium">{{ item.t }}</p>
              <p class="mt-1.5 text-xs leading-relaxed text-ink-muted">{{ item.d }}</p>
            </div>
          </div>
        </div>
      </PCard>
    </div>
  </div>
</template>
