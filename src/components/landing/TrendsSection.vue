<script setup>
/** Tendências — cada cartão mostra quantos veículos publicaram sobre o tema (Cap. 3). */
import PBadge from '@/components/ui/PBadge.vue'
import PCard from '@/components/ui/PCard.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { TRENDS } from '@/data/prisma'
import { useReveal } from '@/composables/useReveal'

const { root } = useReveal()
const maxOutlets = Math.max(...TRENDS.map((t) => t.outlets))
</script>

<template>
  <section id="tendencias" ref="root" class="relative py-24">
    <div class="container-prisma">
      <div class="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          align="left"
          eyebrow="Tendências"
          title="O que o Brasil está cobrindo"
          highlight="agora."
          description="Volume de veículos e matérias por tema nas últimas 24 horas, direto do cluster semântico do Engine."
        />
        <PBadge color="#2EE6A8" dot pulse>Atualizado em tempo real</PBadge>
      </div>

      <div class="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <PCard
          v-for="trend in TRENDS"
          :key="trend.id"
          :accent="trend.accent"
          data-reveal
          class="flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between gap-3">
              <h3 class="font-display text-xl">{{ trend.label }}</h3>
              <span
                class="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
                :class="trend.delta >= 0 ? 'text-mint' : 'text-energy'"
                :style="{ background: trend.delta >= 0 ? '#2EE6A814' : '#FF3B5C14' }"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" :class="trend.delta >= 0 ? '' : 'rotate-180'">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
                {{ Math.abs(trend.delta).toFixed(1) }}%
              </span>
            </div>

            <p class="mt-3 text-sm leading-relaxed text-ink-muted">{{ trend.headline }}</p>

            <div class="mt-5 flex flex-wrap gap-2">
              <span
                v-for="frame in trend.frames"
                :key="frame"
                class="rounded-full border border-hairline px-2.5 py-0.5 text-[0.68rem] text-ink-muted"
              >
                {{ frame }}
              </span>
            </div>
          </div>

          <div class="mt-7">
            <div class="flex items-end justify-between">
              <div>
                <span class="font-display text-3xl font-semibold" :style="{ color: trend.accent }">
                  {{ trend.outlets }}
                </span>
                <span class="ml-1.5 text-xs uppercase tracking-[0.14em] text-ink-muted">
                  veículos
                </span>
              </div>
              <span class="text-xs text-ink-muted">{{ trend.articles }} matérias</span>
            </div>
            <div class="mt-3 h-1 w-full overflow-hidden rounded-full bg-ink/10">
              <div
                class="h-full rounded-full"
                :style="{
                  width: `${(trend.outlets / maxOutlets) * 100}%`,
                  background: `linear-gradient(90deg, ${trend.accent}55, ${trend.accent})`,
                  boxShadow: `0 0 14px ${trend.accent}70`,
                }"
              />
            </div>
          </div>
        </PCard>

        <!-- cartão CTA -->
        <PCard data-reveal accent="#8B5CF6" class="flex flex-col justify-center gap-4">
          <h3 class="font-display text-xl">Quer ver o mapa completo?</h3>
          <p class="text-sm leading-relaxed text-ink-muted">
            O Mapa de Polarização mostra, estado por estado, quais temas dominam a cobertura e como
            cada grupo de veículos enquadra o assunto.
          </p>
          <RouterLink
            to="/mapa"
            class="inline-flex items-center gap-2 text-sm font-medium text-prism-soft transition-transform hover:translate-x-1"
          >
            Abrir o mapa nacional
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M5 12h13M13 6l6 6-6 6" />
            </svg>
          </RouterLink>
        </PCard>
      </div>
    </div>
  </section>
</template>
