<script setup>
/** Seção "Como Funciona" — quatro cartões animados (Brand Book Cap. 3). */
import PCard from '@/components/ui/PCard.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { HOW_IT_WORKS } from '@/data/prisma'
import { useReveal } from '@/composables/useReveal'

const { root } = useReveal()

const icons = {
  link: 'M10 13a4 4 0 0 0 5.7 0l3-3A4 4 0 0 0 13 4.3l-1.7 1.7M14 11a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 19.7l1.7-1.7',
  brain:
    'M9.5 4.5A3 3 0 0 0 6.6 8 3 3 0 0 0 5 13.4 3 3 0 0 0 8 18a3 3 0 0 0 4 1.6V4.9a3 3 0 0 0-2.5-.4ZM14.5 4.5A3 3 0 0 1 17.4 8 3 3 0 0 1 19 13.4 3 3 0 0 1 16 18a3 3 0 0 1-4 1.6',
  compare: 'M4 7h7M4 12h5M4 17h7M20 7h-4M20 12h-5M20 17h-4M12 3v18',
  dna: 'M7 3c0 6 10 6 10 12M17 3c0 6-10 6-10 12M8 7h8M7.5 11h9M8 15h8M9 19h6',
}
</script>

<template>
  <section id="como-funciona" ref="root" class="relative py-24">
    <div class="container-prisma">
      <SectionHeading
        eyebrow="Como funciona"
        title="Quatro passos entre um link"
        highlight="e o DNA da notícia."
        description="O Prisma Engine processa cada matéria em segundos e devolve indicadores explicáveis — nunca uma nota final sem justificativa."
      />

      <div class="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <PCard
          v-for="(item, i) in HOW_IT_WORKS"
          :key="item.step"
          :accent="item.accent"
          data-reveal
          class="flex flex-col"
        >
          <div class="flex items-start justify-between">
            <span
              class="grid h-12 w-12 place-items-center rounded-2xl border"
              :style="{ borderColor: `${item.accent}44`, background: `${item.accent}14`, color: item.accent }"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                <path :d="icons[item.icon]" />
              </svg>
            </span>
            <span class="font-display text-3xl font-semibold text-ink/12">{{ item.step }}</span>
          </div>

          <h3 class="mt-6 text-lg">{{ item.title }}</h3>
          <p class="mt-2.5 text-sm leading-relaxed text-ink-muted">{{ item.description }}</p>

          <!-- conector -->
          <div
            v-if="i < HOW_IT_WORKS.length - 1"
            class="pointer-events-none absolute -right-3 top-1/2 hidden h-px w-6 lg:block"
            :style="{ background: `linear-gradient(90deg, ${item.accent}80, transparent)` }"
          />
        </PCard>
      </div>
    </div>
  </section>
</template>
