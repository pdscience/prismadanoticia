<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import DistortionSignals from '@/components/bias/DistortionSignals.vue'
import OutletProfileCard from '@/components/bias/OutletProfileCard.vue'
import PoliticalCompass from '@/components/bias/PoliticalCompass.vue'
import PBadge from '@/components/ui/PBadge.vue'
import PButton from '@/components/ui/PButton.vue'
import PCard from '@/components/ui/PCard.vue'
import ScoreRing from '@/components/ui/ScoreRing.vue'
import { BIAS_LABELS, biasColor, textConfidence } from '@/lib/bias'
import { fetchBiasAnalysis, fetchBiasSample, fetchLatestBias } from '@/lib/services'

const route = useRoute()
const router = useRouter()

const steps = [
  'Carregando matéria',
  'Lendo enquadramento',
  'Estimando veículo',
  'Calculando indícios',
]

const input = ref(String(route.query.url || ''))
const bias = ref(fetchBiasSample())
const isSample = ref(true)
const loading = ref(false)
const activeStep = ref(-1)
const error = ref('')
let stepTimer = null

const label = computed(() => BIAS_LABELS[bias.value.textLabel] ?? 'Não classificada')
const labelColor = computed(() => biasColor(bias.value.textLabel))
const confidence = computed(() => textConfidence(bias.value.confidence))
const publishedLabel = computed(() => {
  if (!bias.value.publishedAt) return 'Data não informada'
  return new Date(bias.value.publishedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
})

function axisValue(value) {
  return `${value > 0 ? '+' : ''}${value}`
}

function economicLabel(value) {
  if (value <= -20) return 'Estado e regulação'
  if (value >= 20) return 'Mercado e desregulação'
  return 'Leitura híbrida'
}

function socialLabel(value) {
  if (value <= -20) return 'Progressista'
  if (value >= 20) return 'Conservador'
  return 'Leitura híbrida'
}

function evidenceAxis(axis) {
  return axis === 'social' ? 'Social / cultural' : 'Econômica'
}

function stopSteps() {
  if (stepTimer) {
    clearInterval(stepTimer)
    stepTimer = null
  }
}

function startSteps() {
  stopSteps()
  activeStep.value = 0
  stepTimer = setInterval(() => {
    activeStep.value = Math.min(activeStep.value + 1, steps.length - 1)
  }, 650)
}

async function runAnalysis(url) {
  if (!url) return
  loading.value = true
  error.value = ''
  startSteps()

  try {
    bias.value = await fetchBiasAnalysis(url)
    isSample.value = false
    activeStep.value = steps.length
  } catch (cause) {
    error.value =
      cause instanceof Error ? cause.message : 'Não foi possível analisar o enquadramento.'
  } finally {
    stopSteps()
    loading.value = false
  }
}

/** Sem URL na rota, mostra o enquadramento real mais recente já calculado. */
async function loadLatest() {
  const latest = await fetchLatestBias()
  if (!latest) return
  bias.value = latest
  isSample.value = false
}

function submit() {
  const url = input.value.trim()
  if (!url) return
  router.replace({ name: 'bias', query: { url } })
  runAnalysis(url)
}

function useSample() {
  stopSteps()
  input.value = ''
  bias.value = fetchBiasSample()
  isSample.value = true
  activeStep.value = -1
  error.value = ''
  router.replace({ name: 'bias' })
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

onMounted(() => {
  if (input.value) runAnalysis(input.value)
  else loadLatest()
})

onBeforeUnmount(stopSteps)
</script>

<template>
  <div class="pb-10">
    <div class="container-prisma">
      <header class="mx-auto max-w-3xl text-center">
        <PBadge color="#8B5CF6" dot pulse>Prisma Engine · enquadramento</PBadge>
        <h1 class="mt-6 text-4xl leading-tight sm:text-5xl">
          Radar de <span class="text-gradient">enquadramento</span>
        </h1>
        <p class="mx-auto mt-4 max-w-2xl text-base text-ink-muted">
          Leia a orientação do texto em duas escalas, veja quem publicou e identifique indícios
          retóricos de distorção. Sem veredito de verdade ou falsidade.
        </p>

        <form class="mt-8 flex flex-col gap-3 sm:flex-row" @submit.prevent="submit">
          <label class="sr-only" for="bias-url">Link da notícia</label>
          <input
            id="bias-url"
            v-model="input"
            type="text"
            inputmode="url"
            placeholder="https://portal.com.br/politica/materia"
            class="h-13 flex-1 rounded-full border border-hairline bg-surface px-5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted/70 focus:border-electric-soft"
          />
          <PButton type="submit" :class="loading ? 'pointer-events-none opacity-70' : ''">
            {{ loading ? 'Analisando...' : 'Analisar enquadramento' }}
          </PButton>
          <PButton variant="outline" @click="useSample">Ver exemplo</PButton>
        </form>

        <div
          v-if="error"
          class="mx-auto mt-6 max-w-3xl rounded-2xl border border-energy/40 bg-energy/10 px-5 py-4 text-left text-sm text-ink"
        >
          <strong class="text-energy">Não foi possível analisar.</strong>
          {{ error }}
        </div>
      </header>

      <Transition name="route-fade">
        <div v-if="activeStep >= 0" class="mx-auto mt-10 max-w-3xl">
          <ol class="grid gap-2 sm:grid-cols-4">
            <li
              v-for="(step, index) in steps"
              :key="step"
              class="rounded-xl border px-3 py-2.5 transition-all duration-500"
              :class="
                index < activeStep || !loading
                  ? 'border-mint/40 bg-mint/8'
                  : index === activeStep
                    ? 'border-electric/60 bg-electric/10'
                    : 'border-hairline opacity-50'
              "
            >
              <span class="flex items-center gap-2">
                <span
                  class="grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] font-semibold"
                  :class="
                    index < activeStep || !loading
                      ? 'bg-mint text-midnight'
                      : index === activeStep
                        ? 'bg-electric text-white'
                        : 'bg-ink/15 text-ink-muted'
                  "
                >
                  {{ index + 1 }}
                </span>
                <span class="truncate text-[0.72rem] font-medium">{{ step }}</span>
              </span>
            </li>
          </ol>
        </div>
      </Transition>

      <div class="mt-12 space-y-5">
        <PCard accent="#8B5CF6" class="p-7">
          <div class="flex flex-wrap items-start justify-between gap-6">
            <div class="max-w-2xl">
              <div class="flex flex-wrap items-center gap-2">
                <PBadge color="#8B5CF6">{{ bias.topic }}</PBadge>
                <PBadge :color="labelColor">Texto: {{ label }}</PBadge>
                <PBadge v-if="isSample" color="#FFC24B">Exemplo ilustrativo</PBadge>
                <span class="text-xs text-ink-muted"
                  >metodologia {{ bias.methodologyVersion }}</span
                >
              </div>
              <h2 class="mt-4 text-2xl leading-snug">{{ bias.title }}</h2>
              <p class="mt-3 text-sm text-ink-muted">{{ bias.outlet }} · {{ publishedLabel }}</p>
              <p class="mt-1 truncate text-xs text-ink-muted/80">{{ bias.url }}</p>
            </div>

            <div class="flex items-center gap-6">
              <div class="text-center">
                <span class="font-display text-4xl font-semibold" :style="{ color: labelColor }">
                  {{ bias.overallScore > 0 ? '+' : '' }}{{ bias.overallScore }}
                </span>
                <p class="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-ink-muted">
                  leitura geral
                </p>
              </div>
              <div class="h-14 w-px bg-hairline" />
              <div class="text-center">
                <span class="font-display text-4xl font-semibold text-ink">
                  {{ bias.signals.length }}
                </span>
                <p class="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-ink-muted">
                  indícios
                </p>
              </div>
            </div>
          </div>
        </PCard>

        <div class="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <PCard accent="#8B5CF6" class="p-7">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 class="text-lg">Orientação do texto</h3>
                <p class="mt-1 text-xs text-ink-muted">
                  Duas escalas independentes, sem forçar um único rótulo.
                </p>
              </div>
              <PBadge :color="labelColor">{{ label }}</PBadge>
            </div>

            <div class="mt-6">
              <PoliticalCompass
                :economic="bias.economicAxis"
                :social="bias.socialAxis"
                :label="label"
              />
            </div>

            <div class="mt-6 grid gap-3 sm:grid-cols-2">
              <div class="rounded-2xl border border-hairline bg-surface/45 p-4">
                <p class="text-[0.68rem] uppercase tracking-[0.18em] text-ink-muted">Econômica</p>
                <p class="mt-2 font-display text-2xl font-semibold text-ink">
                  {{ axisValue(bias.economicAxis) }}
                </p>
                <p class="mt-1 text-xs text-ink-muted">{{ economicLabel(bias.economicAxis) }}</p>
              </div>
              <div class="rounded-2xl border border-hairline bg-surface/45 p-4">
                <p class="text-[0.68rem] uppercase tracking-[0.18em] text-ink-muted">
                  Social / cultural
                </p>
                <p class="mt-2 font-display text-2xl font-semibold text-ink">
                  {{ axisValue(bias.socialAxis) }}
                </p>
                <p class="mt-1 text-xs text-ink-muted">{{ socialLabel(bias.socialAxis) }}</p>
              </div>
            </div>
          </PCard>

          <div class="space-y-5">
            <PCard accent="#2EE6A8" class="flex flex-col items-center text-center">
              <h3 class="text-lg">Confiança do texto</h3>
              <div class="my-5">
                <ScoreRing
                  :value="confidence"
                  :size="148"
                  label="confiança"
                  from="#2EE6A8"
                  to="#2D6BFF"
                />
              </div>
              <p class="text-sm text-ink-muted">
                Limitada a 85 nesta metodologia para evitar falsa precisão.
              </p>
            </PCard>

            <PCard accent="#6F9BFF">
              <h3 class="text-lg">Leitura do Engine</h3>
              <p class="mt-4 text-sm leading-relaxed text-ink-muted">{{ bias.summary }}</p>
              <div class="mt-5 flex flex-wrap gap-2">
                <PBadge color="#6F9BFF">{{ bias.evidence.length }} evidências</PBadge>
                <PBadge color="#FFC24B">{{ bias.signals.length }} sinais</PBadge>
              </div>
            </PCard>
          </div>
        </div>

        <OutletProfileCard :bias="bias" />

        <DistortionSignals :bias="bias" />

        <div class="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <PCard accent="#B794FF">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 class="text-lg">Evidências no texto</h3>
                <p class="mt-1 text-xs text-ink-muted">
                  Trechos usados para sustentar a leitura dos eixos.
                </p>
              </div>
              <PBadge color="#B794FF">citação literal</PBadge>
            </div>

            <div v-if="bias.evidence.length" class="mt-5 space-y-3">
              <article
                v-for="(item, index) in bias.evidence"
                :key="index"
                class="rounded-2xl border border-hairline bg-surface/45 p-4"
              >
                <PBadge :color="item.axis === 'social' ? '#2EE6A8' : '#FFC24B'">
                  {{ evidenceAxis(item.axis) }}
                </PBadge>
                <blockquote class="mt-3 border-l-2 border-prism/60 pl-3 text-sm italic text-ink">
                  “{{ item.quote }}”
                </blockquote>
                <p class="mt-2 text-xs leading-relaxed text-ink-muted">{{ item.explanation }}</p>
              </article>
            </div>
            <p v-else class="mt-5 text-sm text-ink-muted">
              Não há trechos de evidência suficientes nesta análise.
            </p>
          </PCard>

          <PCard accent="#9AA6C9">
            <h3 class="text-lg">Como ler este radar</h3>
            <ul class="mt-4 space-y-3 text-sm leading-relaxed text-ink-muted">
              <li class="flex gap-2">
                <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-prism-soft" />
                A orientação é uma estimativa do texto, não uma classificação definitiva do veículo.
              </li>
              <li class="flex gap-2">
                <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-insight" />
                Perfis curados de veículos ainda não foram cadastrados nesta versão.
              </li>
              <li class="flex gap-2">
                <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-mint" />
                Distorção aqui significa enquadramento retórico, não checagem factual.
              </li>
              <li class="flex gap-2">
                <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-electric-soft" />
                Textos ambíguos podem aparecer como “mista / ambígua” em vez de um lado.
              </li>
            </ul>
            <p class="mt-5 border-t border-hairline pt-4 text-xs text-ink-muted">
              Modelo: {{ bias.model }} · metodologia {{ bias.methodologyVersion }}
            </p>
          </PCard>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
          <PButton :to="`/analise?url=${encodeURIComponent(bias.url)}`" variant="outline" size="sm">
            Ver DNA completo
          </PButton>
          <PButton to="/comparacao" variant="outline" size="sm">Comparar coberturas</PButton>
        </div>
      </div>
    </div>
  </div>
</template>
