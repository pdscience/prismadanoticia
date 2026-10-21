<script setup>
/** LANDING PAGE PREMIUM — Brand Book Cap. 3 */
import BrandManifesto from '@/components/landing/BrandManifesto.vue'
import DnaShowcase from '@/components/landing/DnaShowcase.vue'
import FeatureGrid from '@/components/landing/FeatureGrid.vue'
import HeroPrism from '@/components/landing/HeroPrism.vue'
import HowItWorks from '@/components/landing/HowItWorks.vue'
import MoatSection from '@/components/landing/MoatSection.vue'
import TrendsSection from '@/components/landing/TrendsSection.vue'
import PButton from '@/components/ui/PButton.vue'
import ShareCard from '@/components/intel/ShareCard.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { SAMPLE_ANALYSIS } from '@/data'
import { useReveal } from '@/composables/useReveal'

const { root } = useReveal()
</script>

<template>
  <div>
    <HeroPrism />
    <HowItWorks />
    <DnaShowcase />
    <TrendsSection />
    <FeatureGrid />
    <MoatSection />
    <BrandManifesto />

    <!-- Cap. 14 — Estratégia viral -->
    <section ref="root" class="relative py-24">
      <div class="container-prisma">
        <div class="grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Estratégia viral"
              title="Cada análise gera"
              highlight="um cartão."
              description="Pronto para Instagram, LinkedIn e X. O usuário compartilha o DNA da notícia e o Prisma viaja com ele."
            />
            <ul class="mt-8 space-y-3 text-sm text-ink-muted">
              <li
                v-for="item in [
                  'Exportação em 1080×1080',
                  'Identidade visual travada no brand book',
                  'Indicadores sempre com fonte e período',
                ]"
                :key="item"
                data-reveal
                class="flex items-start gap-3"
              >
                <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-insight" />
                {{ item }}
              </li>
            </ul>
            <div data-reveal class="mt-9 flex flex-wrap gap-3">
              <PButton to="/analise">Gerar meu cartão</PButton>
              <PButton to="/marca" variant="outline">Ver o brand book</PButton>
            </div>
          </div>

          <div data-reveal>
            <ShareCard
              :dna="SAMPLE_ANALYSIS.dna"
              :topic="SAMPLE_ANALYSIS.topic"
              :outlet="SAMPLE_ANALYSIS.outlet"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- CTA final -->
    <section class="relative py-16">
      <div class="container-prisma">
        <div
          class="relative overflow-hidden rounded-[2rem] border border-hairline px-8 py-16 text-center sm:px-16"
        >
          <div
            class="pointer-events-none absolute inset-0 bg-linear-to-br from-electric/12 via-prism/12 to-insight/10"
          />
          <div class="relative">
            <h2 class="mx-auto max-w-2xl text-3xl leading-tight sm:text-4xl">
              Uma notícia. <span class="text-gradient">Vários ângulos.</span>
            </h2>
            <p class="mx-auto mt-4 max-w-xl text-base text-ink-muted">
              Cole um link e veja o que você não estava vendo.
            </p>
            <div class="mt-8 flex flex-wrap justify-center gap-3">
              <PButton to="/analise" size="lg">Analisar uma notícia</PButton>
              <PButton to="/tecnologia" variant="outline" size="lg">Como o Engine funciona</PButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
