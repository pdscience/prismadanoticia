<script setup>
/** Tendências — cobertura real por tema nos últimos 7 dias (Cap. 3). */
import { computed, onMounted, ref } from 'vue'

import PBadge from '@/components/ui/PBadge.vue'
import PCard from '@/components/ui/PCard.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { frame } from '@/data'
import { fetchTrends } from '@/lib/services'
import { useReveal } from '@/composables/useReveal'

const { root } = useReveal()
const trends = ref([])
const loading = ref(true)
const error = ref('')
const maxOutlets = computed(() => Math.max(1, ...trends.value.map((t) => t.outlets)))

onMounted(async () => {
  try {
    trends.value = await fetchTrends()
  } catch {
    error.value = 'Não foi possível atualizar as tendências agora.'
  } finally {
    loading.value = false
  }
})
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
          description="Volume de veículos e matérias por tema nos últimos 7 dias, a partir das análises já realizadas pelo Engine."
        />
        <PBadge color="#2EE6A8" dot>Consolidado nos últimos 7 dias</PBadge>
      </div>

      <div v-if="loading" class="mt-14 text-sm text-ink-muted">Carregando tendências…</div>

      <div v-else-if="error" class="mt-14">
        <PCard accent="#FF3B5C">
          <h3 class="font-display text-xl">Tendências indisponíveis</h3>
          <p class="mt-2 text-sm leading-relaxed text-ink-muted">{{ error }}</p>
        </PCard>
      </div>

      <div v-else-if="!trends.length" class="mt-14">
        <PCard accent="#2D6BFF" class="flex flex-col items-start gap-4">
          <h3 class="font-display text-xl">Nenhuma análise nos últimos 7 dias</h3>
          <p class="text-sm leading-relaxed text-ink-muted">
            As tendências só existem a partir de matérias efetivamente analisadas. Analise uma URL e
            o tema aparece aqui com a contagem real de veículos.
          </p>
          <RouterLink
            to="/analise"
            class="inline-flex items-center gap-2 text-sm font-medium text-prism-soft transition-transform hover:translate-x-1"
          >
            Analisar uma notícia
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <path d="M5 12h13M13 6l6 6-6 6" />
            </svg>
          </RouterLink>
        </PCard>
      </div>

      <div v-else class="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <PCard
          v-for="trend in trends"
          :key="trend.id"
          :accent="trend.accent"
          data-reveal
          class="flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between gap-3">
              <h3 class="font-display text-xl">{{ trend.label }}</h3>
              <span
                v-if="trend.hasBaseline"
                class="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
                :class="trend.delta >= 0 ? 'text-mint' : 'text-energy'"
                :style="{ background: trend.delta >= 0 ? '#2EE6A814' : '#FF3B5C14' }"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.4"
                  stroke-linecap="round"
                  :class="trend.delta >= 0 ? '' : 'rotate-180'"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
                {{ Math.abs(trend.delta).toFixed(1) }}%
              </span>
              <span
                v-else
                class="rounded-full px-2 py-1 text-xs font-medium text-prism-soft"
                style="background: #8b5cf614"
              >
                novo
              </span>
            </div>

            <p class="mt-3 text-sm leading-relaxed text-ink-muted">{{ trend.headline }}</p>

            <div class="mt-5 flex flex-wrap gap-2">
              <span
                v-for="frameKey in trend.frames"
                :key="frameKey"
                class="rounded-full border border-hairline px-2.5 py-0.5 text-[0.68rem] text-ink-muted"
              >
                {{ frame(frameKey).label }}
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
            O Mapa de Polarização mostra, estado por estado, quais temas dominam a cobertura e o
            quanto a cobertura diverge no enquadramento.
          </p>
          <RouterLink
            to="/mapa"
            class="inline-flex items-center gap-2 text-sm font-medium text-prism-soft transition-transform hover:translate-x-1"
          >
            Abrir o mapa nacional
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <path d="M5 12h13M13 6l6 6-6 6" />
            </svg>
          </RouterLink>
        </PCard>
      </div>
    </div>
  </section>
</template>
