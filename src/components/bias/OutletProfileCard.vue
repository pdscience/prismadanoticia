<script setup>
import { computed } from 'vue'

import PBadge from '@/components/ui/PBadge.vue'
import PCard from '@/components/ui/PCard.vue'
import { BIAS_LABELS, biasColor, outletConfidence } from '@/lib/bias'

const props = defineProps({
  bias: { type: Object, required: true },
})

const estimateLabel = computed(
  () => BIAS_LABELS[props.bias.outletEstimateLabel] ?? 'Não classificada',
)
const estimateColor = computed(() => biasColor(props.bias.outletEstimateLabel))
const estimateConfidence = computed(() => outletConfidence(props.bias.outletEstimateConfidence))
const curated = computed(() => props.bias.curated)
const curatedLabel = computed(() => BIAS_LABELS[curated.value?.label] ?? 'Perfil cadastrado')
const curatedColor = computed(() => biasColor(curated.value?.label))
</script>

<template>
  <PCard accent="#6F9BFF">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="text-lg">Quem publicou</h3>
        <p class="mt-1 text-xs text-ink-muted">
          A leitura do veículo é separada da leitura do texto.
        </p>
      </div>
      <PBadge color="#6F9BFF">duas camadas</PBadge>
    </div>

    <div class="mt-5 grid gap-4 lg:grid-cols-2">
      <div class="rounded-2xl border border-hairline bg-surface/50 p-5">
        <p class="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-ink-muted">
          Estimativa desta matéria
        </p>
        <div class="mt-3 flex flex-wrap items-center gap-3">
          <span class="font-display text-xl font-semibold" :style="{ color: estimateColor }">
            {{ estimateLabel }}
          </span>
          <PBadge :color="estimateColor">{{ estimateConfidence }}% de confiança</PBadge>
        </div>
        <p class="mt-4 text-sm leading-relaxed text-ink-muted">
          {{
            bias.outletEstimateRationale ||
            'A estimativa considera apenas os sinais retóricos presentes nesta matéria.'
          }}
        </p>
        <p class="mt-4 text-xs leading-relaxed text-ink-muted/80">
          Inferência limitada a este texto. Não é uma classificação permanente do veículo.
        </p>
      </div>

      <div class="rounded-2xl border border-dashed border-hairline p-5">
        <p class="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-ink-muted">
          Perfil curado
        </p>

        <template v-if="curated">
          <div class="mt-3 flex flex-wrap items-center gap-3">
            <span class="font-display text-xl font-semibold" :style="{ color: curatedColor }">
              {{ curatedLabel }}
            </span>
            <PBadge :color="curatedColor">{{ curated.confidence }}% de confiança</PBadge>
          </div>
          <p class="mt-3 text-sm text-ink-muted">
            Econômico {{ curated.economicAxis }} · Social {{ curated.socialAxis }}
          </p>
          <p class="mt-3 text-xs leading-relaxed text-ink-muted">
            {{ curated.methodology }}
          </p>
          <a
            v-if="curated.referenceUrl"
            :href="curated.referenceUrl"
            class="mt-3 inline-flex text-xs text-electric-soft hover:opacity-80"
            target="_blank"
            rel="noreferrer"
          >
            Ver referência
          </a>
        </template>

        <template v-else>
          <p class="mt-3 text-sm font-medium text-ink">Perfil ainda não cadastrado.</p>
          <p class="mt-2 text-xs leading-relaxed text-ink-muted">
            Esta versão não atribui rótulos permanentes a veículos reais. A estrutura está pronta
            para receber perfis com metodologia e fonte pública.
          </p>
        </template>
      </div>
    </div>
  </PCard>
</template>
