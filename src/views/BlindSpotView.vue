<script setup>
/**
 * BLINDSPOT BRASIL — Brand Book Cap. 6
 * Pergunta: quem deixou esse tema de fora?
 * Importante: a comparação sempre considera um período específico antes de
 * indicar ausência de cobertura.
 */
import { computed, ref } from 'vue'

import MeterBar from '@/components/ui/MeterBar.vue'
import PBadge from '@/components/ui/PBadge.vue'
import PButton from '@/components/ui/PButton.vue'
import PCard from '@/components/ui/PCard.vue'
import { BLINDSPOT } from '@/data'
import { useReveal } from '@/composables/useReveal'

const { root } = useReveal()

const periods = [
  { key: 7, label: '7 dias' },
  { key: 15, label: '15 dias' },
  { key: 30, label: '30 dias' },
  { key: 90, label: '90 dias' },
]

const period = ref(30)
const query = ref(BLINDSPOT.topic)

const severityColor = { alta: '#FF3B5C', média: '#FFC24B', baixa: '#6F9BFF' }

const maxArticles = computed(() => Math.max(...BLINDSPOT.covered.map((c) => c.articles)))

/** Quanto maior o período, mais confiável é afirmar ausência de cobertura. */
const reliability = computed(() => {
  const map = { 7: 42, 15: 63, 30: 84, 90: 96 }
  return map[period.value]
})

const missing = computed(() =>
  period.value >= 30 ? BLINDSPOT.missing : BLINDSPOT.missing.slice(0, period.value >= 15 ? 3 : 2),
)
</script>

<template>
  <div ref="root" class="pb-10">
    <div class="container-prisma">
      <header class="mx-auto max-w-3xl text-center">
        <PBadge color="#FF3B5C" dot pulse>Cap. 6 · BlindSpot Brasil</PBadge>
        <h1 class="mt-6 text-4xl leading-tight sm:text-5xl">
          Quem deixou esse tema <span class="text-gradient">de fora?</span>
        </h1>
        <p class="mx-auto mt-4 max-w-2xl text-base text-ink-muted">
          Silêncio também é editorial. O BlindSpot mostra quais veículos não cobriram um assunto —
          sempre dentro de um período definido, nunca por impressão.
        </p>
      </header>

      <!-- controles -->
      <div class="mt-10 flex flex-col items-center gap-4">
        <div class="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
          <input
            v-model="query"
            type="text"
            placeholder="Tema investigado"
            class="h-13 flex-1 rounded-full border border-hairline bg-surface px-5 text-sm text-ink outline-none transition-colors focus:border-energy-soft"
          />
          <PButton type="button">Investigar</PButton>
        </div>

        <div class="flex items-center gap-2 rounded-full border border-hairline p-1">
          <button
            v-for="p in periods"
            :key="p.key"
            type="button"
            class="rounded-full px-4 py-1.5 text-xs font-medium transition-colors"
            :class="period === p.key ? 'bg-energy text-white' : 'text-ink-muted hover:text-ink'"
            @click="period = p.key"
          >
            {{ p.label }}
          </button>
        </div>
      </div>

      <!-- aviso metodológico -->
      <PCard data-reveal accent="#FFC24B" class="mt-10">
        <div class="flex flex-wrap items-center gap-5">
          <span
            class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-insight/15 text-insight"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v.5M12 11.5V16" />
            </svg>
          </span>
          <p class="flex-1 text-sm leading-relaxed text-ink-muted">
            <strong class="text-ink">Regra metodológica.</strong>
            {{ BLINDSPOT.note }} Período selecionado:
            <strong class="text-ink">{{ period }} dias</strong>.
          </p>
          <div class="text-center">
            <span class="font-display text-2xl font-semibold text-insight">{{ reliability }}%</span>
            <p class="text-[0.62rem] uppercase tracking-[0.18em] text-ink-muted">confiabilidade</p>
          </div>
        </div>
      </PCard>

      <div class="mt-5 grid gap-5 lg:grid-cols-[1fr_1.05fr]">
        <!-- cobriram -->
        <PCard data-reveal accent="#2EE6A8">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg">Cobriram o tema</h2>
            <PBadge color="#2EE6A8">{{ BLINDSPOT.covered.length }} veículos</PBadge>
          </div>
          <ul class="mt-6 space-y-4">
            <li v-for="c in BLINDSPOT.covered" :key="c.outlet">
              <div class="flex items-baseline justify-between text-sm">
                <span class="font-medium">{{ c.outlet }}</span>
                <span class="font-display text-sm font-semibold text-mint">{{ c.articles }}</span>
              </div>
              <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
                <div
                  class="h-full rounded-full bg-linear-to-r from-mint/50 to-mint"
                  :style="{ width: `${(c.articles / maxArticles) * 100}%` }"
                />
              </div>
            </li>
          </ul>
        </PCard>

        <!-- não cobriram -->
        <PCard data-reveal accent="#FF3B5C">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg">Não publicaram no período</h2>
            <PBadge color="#FF3B5C">{{ missing.length }} blindspots</PBadge>
          </div>

          <ul class="mt-6 space-y-3">
            <li
              v-for="m in missing"
              :key="m.outlet"
              class="rounded-2xl border border-hairline p-4 transition-colors hover:border-hairline-strong"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="font-display text-base">{{ m.outlet }}</p>
                  <p class="mt-1 text-xs text-ink-muted">{{ m.reach }}</p>
                </div>
                <span
                  class="shrink-0 rounded-full px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wider"
                  :style="{
                    color: severityColor[m.severity],
                    background: `${severityColor[m.severity]}18`,
                  }"
                >
                  {{ m.severity }}
                </span>
              </div>
              <p class="mt-3 text-xs text-ink-muted">{{ m.lastMention }}</p>
            </li>
          </ul>

          <p class="mt-5 text-xs text-ink-muted">
            Ausência de cobertura não implica intenção editorial — indica apenas que, no período
            analisado, não houve publicação identificada sobre o tema.
          </p>
        </PCard>
      </div>

      <!-- subtemas esquecidos -->
      <PCard data-reveal accent="#8B5CF6" class="mt-5">
        <h2 class="text-lg">Ângulos pouco explorados dentro do tema</h2>
        <p class="mt-1.5 text-xs text-ink-muted">
          Percentual de veículos do cluster que abordaram cada subtema.
        </p>
        <div class="mt-6 grid gap-5 sm:grid-cols-2">
          <MeterBar
            v-for="s in BLINDSPOT.subthemes"
            :key="s.label"
            :label="s.label"
            :value="s.coverage"
            :color="s.coverage >= 60 ? '#2EE6A8' : s.coverage >= 35 ? '#FFC24B' : '#FF3B5C'"
            :hint="s.coverage < 35 ? 'Blindspot temático' : 'Cobertura parcial'"
          />
        </div>
        <div class="mt-7 flex flex-wrap gap-3">
          <PButton to="/comparacao" variant="outline" size="sm">Comparar quem cobriu</PButton>
          <PButton to="/mapa" variant="ghost" size="sm">Ver distribuição no mapa</PButton>
        </div>
      </PCard>
    </div>
  </div>
</template>
