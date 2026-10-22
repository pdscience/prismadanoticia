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
