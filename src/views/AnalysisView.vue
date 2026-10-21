<script setup>
/**
 * TELA DE ANÁLISE — o coração do sistema (Brand Book Cap. 4).
 * Cartões: Resumo IA · Confiança · Diversidade de Fontes · Evidências · O DNA da Notícia.
 */
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import DnaRadar from '@/components/analysis/DnaRadar.vue'
import ShareCard from '@/components/intel/ShareCard.vue'
import MeterBar from '@/components/ui/MeterBar.vue'
import PBadge from '@/components/ui/PBadge.vue'
import PButton from '@/components/ui/PButton.vue'
import PCard from '@/components/ui/PCard.vue'
import ScoreRing from '@/components/ui/ScoreRing.vue'
import { DNA_AXES, ENGINE_PIPELINE, SAMPLE_ANALYSIS, frame } from '@/data'
import { dnaAverage } from '@/lib/radar'
import { fetchAnalysis, fetchSampleAnalysis } from '@/lib/services'

const route = useRoute()
const router = useRouter()

const input = ref(String(route.query.url || ''))
const analysis = ref(SAMPLE_ANALYSIS)
const loading = ref(false)
const activeStep = ref(-1)

const prismaIndex = computed(() => dnaAverage(analysis.value.dna))

const confidenceLabel = computed(() => {
  const c = analysis.value.confidence
  if (c >= 80) return { text: 'Alta sustentação', color: '#2EE6A8' }
  if (c >= 60) return { text: 'Sustentação moderada', color: '#FFC24B' }
  return { text: 'Leitura crítica recomendada', color: '#FF3B5C' }
})

const strengthColor = {
  forte: '#2EE6A8',
  média: '#FFC24B',
  fraca: '#FF3B5C',
}

const publishedLabel = computed(() =>
  new Date(analysis.value.publishedAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }),
)

/** Roda o pipeline simulado do Prisma Engine, passo a passo. */
async function runAnalysis(url) {
  if (!url) return
  loading.value = true
  activeStep.value = 0

  for (let i = 0; i < ENGINE_PIPELINE.length; i += 1) {
    activeStep.value = i
    await new Promise((resolve) => setTimeout(resolve, 260))
  }

  analysis.value = await fetchAnalysis(url)
  activeStep.value = ENGINE_PIPELINE.length
  loading.value = false
}

function submit() {
  const url = input.value.trim()
  if (!url) return
  router.replace({ name: 'analysis', query: { url } })
  runAnalysis(url)
}

async function useSample() {
  input.value = ''
  analysis.value = await fetchSampleAnalysis()
  activeStep.value = -1
  router.replace({ name: 'analysis' })
}

watch(
  () => route.query.url,
  (url) => {
    if (url && url !== input.value) {
      input.value = String(url)
      runAnalysis(String(url))
    }
  },
)

onMounted(async () => {
  if (input.value) {
    await runAnalysis(input.value)
  } else {
    analysis.value = await fetchSampleAnalysis()
  }
})
</script>

<template>
  <div class="pb-10">
    <div class="container-prisma">
      <!-- cabeçalho -->
      <header class="mx-auto max-w-3xl text-center">
        <PBadge color="#2D6BFF" dot pulse>Prisma Engine</PBadge>
        <h1 class="mt-6 text-4xl leading-tight sm:text-5xl">
          Analisar uma <span class="text-gradient">notícia</span>
        </h1>
        <p class="mx-auto mt-4 max-w-xl text-base text-ink-muted">
          Cole o link. O Engine extrai o texto, descobre o tema, compara coberturas e devolve o DNA
          da notícia com explicação para cada indicador.
        </p>

        <form class="mt-8 flex flex-col gap-3 sm:flex-row" @submit.prevent="submit">
          <label class="sr-only" for="analysis-url">Link da notícia</label>
          <input
            id="analysis-url"
            v-model="input"
            type="text"
            inputmode="url"
            placeholder="https://portal.com.br/politica/materia"
            class="h-13 flex-1 rounded-full border border-hairline bg-surface px-5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted/70 focus:border-electric-soft"
          />
          <PButton type="submit" :class="loading ? 'pointer-events-none opacity-70' : ''">
            {{ loading ? 'Analisando...' : 'Analisar' }}
          </PButton>
          <PButton variant="outline" @click="useSample">Ver exemplo</PButton>
        </form>
      </header>

      <!-- pipeline em execução -->
      <Transition name="route-fade">
        <div v-if="activeStep >= 0" class="mx-auto mt-10 max-w-4xl">
          <ol class="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <li
              v-for="(step, i) in ENGINE_PIPELINE"
              :key="step.step"
              class="rounded-xl border px-3 py-2.5 transition-all duration-500"
              :class="
                i < activeStep || !loading
                  ? 'border-mint/40 bg-mint/8'
                  : i === activeStep
                    ? 'border-electric/60 bg-electric/10'
                    : 'border-hairline opacity-50'
              "
            >
              <span class="flex items-center gap-2">
                <span
                  class="grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] font-semibold"
                  :class="
                    i < activeStep || !loading
                      ? 'bg-mint text-midnight'
                      : i === activeStep
                        ? 'bg-electric text-white'
                        : 'bg-ink/15 text-ink-muted'
                  "
                >
                  {{ step.step }}
                </span>
                <span class="truncate text-[0.72rem] font-medium">{{ step.title }}</span>
              </span>
            </li>
          </ol>
        </div>
      </Transition>

      <!-- resultado -->
      <div class="mt-14 space-y-5">
        <!-- matéria analisada -->
        <PCard accent="#2D6BFF" class="p-7">
          <div class="flex flex-wrap items-start justify-between gap-6">
            <div class="max-w-2xl">
              <div class="flex flex-wrap items-center gap-2">
                <PBadge color="#8B5CF6">{{ analysis.topic }}</PBadge>
                <PBadge color="#6F9BFF"
                  >Enquadramento {{ frame(analysis.dominantFrame).label }}</PBadge
                >
                <span class="text-xs text-ink-muted"
                  >{{ analysis.readingTime }} min de leitura</span
                >
              </div>
              <h2 class="mt-4 text-2xl leading-snug">{{ analysis.title }}</h2>
              <p class="mt-3 text-sm text-ink-muted">
                {{ analysis.outlet }} · {{ publishedLabel }}
              </p>
              <p class="mt-1 truncate text-xs text-ink-muted/80">{{ analysis.url }}</p>
            </div>

            <div class="flex items-center gap-6">
              <div class="text-center">
                <span class="font-display text-4xl font-semibold text-gradient">
                  {{ prismaIndex }}
                </span>
                <p class="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-ink-muted">
                  Índice Prisma
                </p>
              </div>
              <div class="h-14 w-px bg-hairline" />
              <div class="text-center">
                <span class="font-display text-4xl font-semibold text-ink">
                  {{ analysis.clusterSize }}
                </span>
                <p class="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-ink-muted">
                  no cluster
                </p>
              </div>
            </div>
          </div>
        </PCard>

        <!-- cartões principais -->
        <div class="grid gap-5 lg:grid-cols-3">
          <!-- Resumo IA -->
          <PCard accent="#8B5CF6" class="lg:col-span-2">
            <div class="flex items-center gap-2">
              <span class="grid h-8 w-8 place-items-center rounded-lg bg-prism/15 text-prism-soft">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                >
                  <path d="M5 6h14M5 11h14M5 16h9" />
                </svg>
              </span>
              <h3 class="text-lg">Resumo IA</h3>
            </div>
            <ul class="mt-5 space-y-3.5">
              <li
                v-for="(line, i) in analysis.summary"
                :key="i"
                class="flex gap-3 text-sm leading-relaxed text-ink-muted"
              >
                <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-prism-soft" />
                {{ line }}
              </li>
            </ul>
            <p class="mt-5 border-t border-hairline pt-4 text-xs text-ink-muted">
              Resumo gerado a partir do texto original, sem inferências externas.
            </p>
          </PCard>

          <!-- Confiança -->
          <PCard accent="#2EE6A8" class="flex flex-col items-center justify-center text-center">
            <h3 class="text-lg">Confiança</h3>
            <div class="my-5">
              <ScoreRing
                :value="analysis.confidence"
                :size="148"
                label="confiança"
                from="#2EE6A8"
                to="#2D6BFF"
              />
            </div>
            <p class="text-sm font-medium" :style="{ color: confidenceLabel.color }">
              {{ confidenceLabel.text }}
            </p>
            <p class="mt-2 text-xs leading-relaxed text-ink-muted">
              Combina evidências verificáveis, variedade de fontes e equilíbrio entre versões.
            </p>
          </PCard>
        </div>

        <div class="grid gap-5 lg:grid-cols-3">
          <!-- DNA da Notícia -->
          <PCard accent="#6F9BFF" class="lg:col-span-2 p-8">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <h3 class="text-lg">O DNA da Notícia</h3>
              <PBadge color="#B794FF">assinatura visual do Prisma</PBadge>
            </div>
            <div class="mt-6">
              <DnaRadar :values="analysis.dna" :size="420" />
            </div>
          </PCard>

          <div class="space-y-5">
            <!-- Diversidade de Fontes -->
            <PCard accent="#2D6BFF">
              <h3 class="text-lg">Diversidade de Fontes</h3>
              <div class="mt-5 flex items-center gap-5">
                <ScoreRing
                  :value="analysis.sourceDiversity"
                  :size="104"
                  :stroke="8"
                  from="#2D6BFF"
                  to="#6F9BFF"
                />
                <p class="flex-1 text-xs leading-relaxed text-ink-muted">
                  Considera quantas vozes distintas aparecem e se há contraditório explícito no
                  texto.
                </p>
              </div>
            </PCard>

            <!-- eixos em barras -->
            <PCard accent="#FFC24B">
              <h3 class="text-lg">Indicadores</h3>
              <div class="mt-5 space-y-4">
                <MeterBar
                  v-for="axis in DNA_AXES"
                  :key="axis.key"
                  :label="axis.label"
                  :value="analysis.dna[axis.key]"
                  :color="axis.color"
                />
              </div>
            </PCard>
          </div>
        </div>

        <!-- Evidências + sinais -->
        <div class="grid gap-5 lg:grid-cols-3">
          <PCard accent="#2EE6A8" class="lg:col-span-2">
            <h3 class="text-lg">Evidências</h3>
            <p class="mt-1.5 text-xs text-ink-muted">
              O que sustenta as afirmações da matéria, classificado por força.
            </p>
            <ul class="mt-5 divide-y divide-hairline">
              <li
                v-for="ev in analysis.evidences"
                :key="ev.label"
                class="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
              >
                <span
                  class="mt-0.5 shrink-0 rounded-md px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-wider"
                  :style="{
                    color: strengthColor[ev.strength],
                    background: `${strengthColor[ev.strength]}18`,
                  }"
                >
                  {{ ev.strength }}
                </span>
                <div>
                  <p class="text-sm font-medium text-ink">{{ ev.label }}</p>
                  <p class="mt-1 text-xs leading-relaxed text-ink-muted">
                    <span class="text-ink-muted/80">{{ ev.kind }} ·</span> {{ ev.note }}
                  </p>
                </div>
              </li>
            </ul>
          </PCard>

          <PCard accent="#FF3B5C">
            <h3 class="text-lg">Sinais detectados</h3>
            <ul class="mt-5 space-y-3">
              <li
                v-for="signal in analysis.signals"
                :key="signal.label"
                class="flex items-start gap-3 text-sm"
              >
                <span
                  class="mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full"
                  :class="signal.ok ? 'bg-mint/18 text-mint' : 'bg-energy/18 text-energy'"
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                  >
                    <path v-if="signal.ok" d="M5 13l4 4L19 7" />
                    <path v-else d="M12 7v7M12 17.5v.5" />
                  </svg>
                </span>
                <span :class="signal.ok ? 'text-ink-muted' : 'text-ink'">{{ signal.label }}</span>
              </li>
            </ul>
          </PCard>
        </div>

        <!-- próximos passos -->
        <div class="grid gap-5 lg:grid-cols-3">
          <PCard accent="#8B5CF6" class="lg:col-span-2">
            <h3 class="text-lg">Continuar investigando</h3>
            <div class="mt-5 grid gap-3 sm:grid-cols-3">
              <RouterLink
                v-for="item in [
                  { to: '/comparacao', title: 'Comparar veículos', text: 'Quem destacou o quê' },
                  { to: '/blindspot', title: 'BlindSpot', text: 'Quem deixou de fora' },
                  { to: '/replay', title: 'Replay', text: 'Como a narrativa mudou' },
                ]"
                :key="item.to"
                :to="item.to"
                class="group rounded-2xl border border-hairline p-4 transition-colors hover:border-hairline-strong"
              >
                <p class="text-sm font-medium text-ink">{{ item.title }}</p>
                <p class="mt-1 text-xs text-ink-muted">{{ item.text }}</p>
                <span
                  class="mt-3 inline-block text-xs text-electric-soft transition-transform group-hover:translate-x-1"
                >
                  Abrir →
                </span>
              </RouterLink>
            </div>
          </PCard>

          <PCard accent="#FFC24B">
            <h3 class="text-lg">Compartilhar</h3>
            <p class="mt-1.5 text-xs text-ink-muted">
              Gere o cartão do DNA desta análise para redes sociais.
            </p>
            <div class="mt-5">
              <ShareCard :dna="analysis.dna" :topic="analysis.topic" :outlet="analysis.outlet" />
            </div>
          </PCard>
        </div>
      </div>
    </div>
  </div>
</template>
