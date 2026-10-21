<script setup>
/** Seção do moat — Mapa de Polarização em Tempo Real. */
import PBadge from '@/components/ui/PBadge.vue'
import PButton from '@/components/ui/PButton.vue'
import PolarizationMap from '@/components/intel/PolarizationMap.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { POLARIZATION_THEMES } from '@/data'
import { useReveal } from '@/composables/useReveal'

const { root } = useReveal()

const audiences = ['Imprensa', 'Universidades', 'Institutos de pesquisa', 'Órgãos públicos']
</script>

<template>
  <section ref="root" class="relative py-24">
    <div class="container-prisma">
      <div
        class="relative overflow-hidden rounded-[2rem] border border-hairline bg-surface-strong/40 p-8 sm:p-12"
      >
        <div
          class="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-prism/25 blur-[120px]"
        />

        <div class="relative grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <PBadge color="#FFC24B" dot pulse>O verdadeiro moat</PBadge>

            <SectionHeading
              align="left"
              class="mt-6"
              title="Mapa de Polarização"
              highlight="em Tempo Real."
              description="Um mapa do Brasil onde cada estado mostra quais temas dominam a cobertura naquele momento — e como esses temas estão sendo enquadrados por diferentes grupos de veículos."
            />

            <p data-reveal class="mt-6 max-w-xl text-sm leading-relaxed text-ink-muted">
              Isso transforma o Prisma de um analisador de notícias em uma plataforma de
              inteligência nacional sobre narrativas: um ativo difícil de copiar e extremamente
              valioso para quem estuda a opinião pública.
            </p>

            <div data-reveal class="mt-7 flex flex-wrap gap-2">
              <span
                v-for="a in audiences"
                :key="a"
                class="rounded-full border border-hairline px-3 py-1 text-xs text-ink-muted"
              >
                {{ a }}
              </span>
            </div>

            <div data-reveal class="mt-9">
              <PButton to="/mapa" variant="gold">Abrir o mapa nacional</PButton>
            </div>
          </div>

          <div data-reveal class="space-y-5">
            <PolarizationMap mode="dominante" :interactive="false" />
            <div class="flex flex-wrap justify-center gap-x-5 gap-y-2">
              <span
                v-for="theme in POLARIZATION_THEMES"
                :key="theme.key"
                class="flex items-center gap-2 text-xs text-ink-muted"
              >
                <span class="h-2 w-2 rounded-sm" :style="{ background: theme.color }" />
                {{ theme.label }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
