<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: Number, required: true },
  color: { type: String, default: '#2D6BFF' },
  hint: { type: String, default: null },
  max: { type: Number, default: 100 },
})

const pct = computed(() => Math.min(100, Math.round((props.value / props.max) * 100)))
</script>

<template>
  <div class="space-y-1.5">
    <div class="flex items-baseline justify-between gap-3">
      <span class="text-sm font-medium text-ink">{{ label }}</span>
      <span class="font-display text-sm font-semibold" :style="{ color }">{{ value }}</span>
    </div>
    <div class="h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
      <div
        class="h-full rounded-full transition-[width] duration-1000 ease-out"
        :style="{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}66, ${color})`,
          boxShadow: `0 0 12px ${color}80`,
        }"
      />
    </div>
    <p v-if="hint" class="text-xs text-ink-muted">{{ hint }}</p>
  </div>
</template>
