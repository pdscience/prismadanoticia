<script setup>
defineProps({
  eyebrow: { type: String, default: null },
  title: { type: String, required: true },
  highlight: { type: String, default: null },
  description: { type: String, default: null },
  align: { type: String, default: 'center' },
})
</script>

<template>
  <header
    class="flex flex-col gap-4"
    :class="align === 'center' ? 'items-center text-center' : 'items-start text-left'"
  >
    <p
      v-if="eyebrow"
      class="font-display text-[0.7rem] font-medium uppercase tracking-[0.34em] text-ink-muted"
      data-reveal
    >
      {{ eyebrow }}
    </p>
    <h2 class="max-w-3xl text-3xl leading-tight sm:text-4xl md:text-[2.75rem]" data-reveal>
      {{ title }}
      <span v-if="highlight" class="text-gradient">{{ highlight }}</span>
    </h2>
    <p v-if="description" class="max-w-2xl text-base leading-relaxed text-ink-muted" data-reveal>
      {{ description }}
    </p>
    <slot />
  </header>
</template>
