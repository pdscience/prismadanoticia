<script setup>
/** Vitrine do DNA da Notícia na landing (Cap. 4 — assinatura visual). */
import DnaRadar from '@/components/analysis/DnaRadar.vue'
import MeterBar from '@/components/ui/MeterBar.vue'
import PButton from '@/components/ui/PButton.vue'
import PCard from '@/components/ui/PCard.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { DNA_AXES, SAMPLE_ANALYSIS } from '@/data/prisma'
import { useReveal } from '@/composables/useReveal'

const { root } = useReveal()
</script>

<template>
  <section id="dna" ref="root" class="relative py-24">
    <div class="container-prisma">
      <SectionHeading
        eyebrow="O DNA da Notícia"
        title="Seis eixos que revelam"
        highlight="o ângulo escolhido."
        description="Cada eixo tem explicação própria e cita os trechos que justificaram a pontuação. Nada de caixa-preta."
      />

      <div class="mt-16 grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
        <PCard accent="#8B5CF6" data-reveal class="p-8">
          <DnaRadar :values="SAMPLE_ANALYSIS.dna" :size="380" />
        </PCard>

        <div class="space-y-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <div
              v-for="axis in DNA_AXES"
              :key="axis.key"
              data-reveal
              class="rounded-2xl border border-hairline bg-surface p-4"
            >
              <MeterBar
                :label="axis.label"
                :value="SAMPLE_ANALYSIS.dna[axis.key]"
                :color="axis.color"
                :hint="`Mede ${axis.measures}`"
              />
            </div>
          </div>

          <div data-reveal class="flex flex-wrap items-center gap-3 pt-2">
            <PButton to="/analise">Ver uma análise completa</PButton>
            <PButton to="/comparacao" variant="outline">Comparar veículos</PButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
