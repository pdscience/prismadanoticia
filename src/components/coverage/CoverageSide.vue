<script setup>
import { RouterLink } from 'vue-router'

import PBadge from '@/components/ui/PBadge.vue'
import { BIAS_COLORS, BIAS_LABELS } from '@/lib/bias'

defineProps({
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
