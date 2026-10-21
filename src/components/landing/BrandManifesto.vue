<script setup>
/** Cap. 1 — O DNA da Marca: a frase que é o coração da comunicação + arquétipos. */
import { ARCHETYPES } from '@/data/prisma'
import { useReveal } from '@/composables/useReveal'

const { root } = useReveal()
</script>

<template>
  <section ref="root" class="relative overflow-hidden py-24">
    <div class="container-prisma">
      <div class="relative mx-auto max-w-4xl text-center">
        <p data-reveal class="font-display text-[0.7rem] uppercase tracking-[0.34em] text-ink-muted">
          O DNA da marca
        </p>

        <blockquote data-reveal class="mt-8 font-display text-3xl leading-tight sm:text-4xl md:text-5xl">
          <span class="text-ink">A notícia não muda.</span><br />
          <span class="text-gradient">O que muda é o ângulo</span><br />
          <span class="text-ink">pelo qual ela é apresentada.</span>
        </blockquote>

        <div
          data-reveal
          class="mx-auto mt-10 h-px w-40 bg-linear-to-r from-transparent via-prism-soft to-transparent"
        />
      </div>

      <div class="mt-16 grid gap-5 sm:grid-cols-3">
        <div
          v-for="a in ARCHETYPES"
          :key="a.name"
          data-reveal
          class="group relative overflow-hidden rounded-[var(--radius-card)] border border-hairline p-6 transition-colors duration-500"
          :style="{ background: `${a.accent}0A` }"
        >
          <span
            class="absolute inset-x-0 top-0 h-px opacity-50 transition-opacity group-hover:opacity-100"
            :style="{ background: `linear-gradient(90deg, transparent, ${a.accent}, transparent)` }"
          />
          <h3 class="font-display text-2xl" :style="{ color: a.accent }">{{ a.name }}</h3>
          <p class="mt-1 text-xs uppercase tracking-[0.22em] text-ink-muted">{{ a.word }}</p>
          <p class="mt-4 text-sm leading-relaxed text-ink-muted">{{ a.detail }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
