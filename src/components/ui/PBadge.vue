<script setup>
defineProps({
  color: { type: String, default: '#8B5CF6' },
  dot: { type: Boolean, default: false },
  pulse: { type: Boolean, default: false },
})
</script>

<template>
  <span
    class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.18em]"
    :style="{
      borderColor: `${color}55`,
      color: color,
      background: `${color}14`,
    }"
  >
    <span v-if="dot" class="relative flex h-1.5 w-1.5">
      <span
        v-if="pulse"
        class="absolute inset-0 animate-pulse-ring rounded-full"
        :style="{ background: color }"
      />
      <span class="relative h-1.5 w-1.5 rounded-full" :style="{ background: color }" />
    </span>
    <slot />
  </span>
</template>
