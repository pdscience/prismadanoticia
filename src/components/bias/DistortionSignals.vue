<script setup>
import { computed } from 'vue'

import PBadge from '@/components/ui/PBadge.vue'
import PCard from '@/components/ui/PCard.vue'
import ScoreRing from '@/components/ui/ScoreRing.vue'
import { SIDE_LABELS, SIGNAL_LABELS, STRENGTH_COLORS, biasColor, distortionLevel } from '@/lib/bias'

const props = defineProps({
  bias: { type: Object, required: true },
})

const level = computed(() => distortionLevel(props.bias.distortionRisk))
const levelColor = computed(
  () =>
    ({
      baixo: '#2EE6A8',
      moderado: '#FFC24B',
      alto: '#FF8A4C',
      'muito-alto': '#FF3B5C',
    })[level.value.key] ?? '#FFC24B',
)
const favoredLabel = computed(() => SIDE_LABELS[props.bias.favoredSide] ?? 'Incerto')
const favoredColor = computed(() => biasColor(props.bias.favoredSide))
</script>

<template>
  <PCard accent="#FFC24B">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="text-lg">Indícios de distorção</h3>
        <p class="mt-1 text-xs text-ink-muted">
          Sinais retóricos de enquadramento. Não é um veredito de verdade ou falsidade.
        </p>
      </div>
      <PBadge color="#FFC24B">leitura retórica</PBadge>
    </div>

    <div class="mt-6 grid gap-7 lg:grid-cols-[180px_1fr]">
      <div class="flex flex-col items-center text-center">
        <ScoreRing
          :value="bias.distortionRisk"
          :size="152"
          label="risco"
          :from="levelColor"
          :to="levelColor"
        />
        <PBadge :color="levelColor" class="mt-3">{{ level.label }}</PBadge>
        <p class="mt-3 max-w-[170px] text-xs leading-relaxed text-ink-muted">
          O risco mede a presença de recursos de enquadramento, não a veracidade dos fatos.
        </p>
      </div>

      <div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm text-ink-muted">Lado aparentemente beneficiado</span>
          <span class="font-display text-lg font-semibold" :style="{ color: favoredColor }">
            {{ favoredLabel }}
          </span>
        </div>
        <p class="mt-3 text-sm leading-relaxed text-ink-muted">
          {{
            bias.distortionSummary ||
            'Não há indícios retóricos suficientes para apontar um enquadramento claro.'
          }}
        </p>

        <div v-if="bias.signals.length" class="mt-6 space-y-3">
          <article
            v-for="(signal, index) in bias.signals"
            :key="`${signal.type}-${index}`"
            class="rounded-2xl border border-hairline bg-surface/45 p-4"
          >
            <div class="flex flex-wrap items-center gap-2">
              <PBadge color="#FFC24B">{{ SIGNAL_LABELS[signal.type] ?? 'Outro indício' }}</PBadge>
              <span
                class="text-[0.68rem] font-medium uppercase tracking-[0.14em]"
                :style="{ color: STRENGTH_COLORS[signal.strength] ?? '#9AA6C9' }"
              >
                força {{ signal.strength }}
              </span>
              <span class="text-[0.68rem] text-ink-muted">
                · {{ SIDE_LABELS[signal.favoredSide] ?? 'Incerto' }}
              </span>
            </div>
            <blockquote class="mt-3 border-l-2 border-insight/60 pl-3 text-sm italic text-ink">
              “{{ signal.quote }}”
            </blockquote>
            <p class="mt-2 text-xs leading-relaxed text-ink-muted">{{ signal.explanation }}</p>
          </article>
        </div>

        <p v-else class="mt-6 rounded-2xl border border-hairline p-4 text-sm text-ink-muted">
          Nenhum indício retórico relevante foi identificado neste texto.
        </p>
      </div>
    </div>
  </PCard>
</template>
