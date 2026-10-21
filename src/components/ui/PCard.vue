<script setup>
defineProps({
  accent: { type: String, default: null },
  hover: { type: Boolean, default: true },
  padded: { type: Boolean, default: true },
})
</script>

<template>
  <div
    class="group relative overflow-hidden rounded-[var(--radius-card)] surface-card transition-all duration-500"
    :class="[
      padded ? 'p-6' : '',
      hover ? 'hover:-translate-y-1 hover:border-hairline-strong' : '',
    ]"
  >
    <!-- brilho de accent -->
    <div
      v-if="accent"
      class="pointer-events-none absolute -top-24 -right-16 h-48 w-48 rounded-full opacity-15 blur-3xl transition-opacity duration-500 group-hover:opacity-35"
      :style="{ background: accent }"
    />
    <div
      v-if="accent"
      class="absolute inset-x-0 top-0 h-px opacity-40 transition-opacity duration-500 group-hover:opacity-100"
      :style="{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }"
    />
    <div class="relative"><slot /></div>
  </div>
</template>
