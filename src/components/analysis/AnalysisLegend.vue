<script setup>
import { ref } from 'vue'

import { DNA_AXES } from '@/data'
import PCard from '@/components/ui/PCard.vue'

const open = ref(false)
</script>

<template>
  <PCard accent="#6F9BFF" :hover="false" :padded="false" class="mt-10">
    <button
      type="button"
      class="flex w-full items-start justify-between gap-5 p-6 text-left"
      aria-controls="analysis-legend"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span>
        <span class="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-ink-muted">
          Legenda
        </span>
        <span class="mt-2 block font-display text-xl font-medium text-ink">
          Como ler esta análise
        </span>
        <span class="mt-1.5 block max-w-2xl text-sm leading-relaxed text-ink-muted">
          Entenda o que cada número mede, como interpretar as faixas e o que as métricas não dizem.
        </span>
      </span>
      <span
        class="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-hairline text-ink-muted transition-transform"
        :class="open ? 'rotate-180' : ''"
        aria-hidden="true"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="m6 9 6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </button>

    <Transition name="legend">
      <div
        v-if="open"
        id="analysis-legend"
        class="border-t border-hairline px-6 pb-6 pt-5"
        role="region"
        aria-label="Legenda das métricas da análise"
      >
        <div class="grid gap-6 lg:grid-cols-2">
          <section>
            <h3 class="text-sm font-medium text-ink">Números do topo</h3>
            <dl class="mt-3 space-y-4">
              <div>
                <dt class="text-sm font-medium text-ink">Índice Prisma</dt>
                <dd class="mt-1 text-xs leading-relaxed text-ink-muted">
                  Média simples dos seis eixos do DNA, em uma escala de 0 a 100. Serve para comparar
                  o perfil geral da matéria; não é uma nota de qualidade. Como Emoção e Persuasão
                  também entram na média, um valor alto não significa, por si só, melhor jornalismo.
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-ink">no cluster</dt>
                <dd class="mt-1 text-xs leading-relaxed text-ink-muted">
                  Quantidade de análises agrupadas por semelhança de tema e conteúdo. O valor
                  <strong class="font-medium text-ink">1</strong> indica uma análise ainda sem grupo
                  de comparação. Não é audiência nem número de leitores.
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-ink">Perspectivas</dt>
                <dd class="mt-1 text-xs leading-relaxed text-ink-muted">
                  Mostra quantos <strong class="font-medium text-ink">lados representados</strong>
                  existem no cluster — esquerda, centro e direita — e quais faltam. O agrupamento
                  usa o enquadramento estimado de cada texto, então
                  <strong class="font-medium text-ink"
                    >não é um rating permanente do veículo</strong
                  >
                  nem prova de equilíbrio editorial.
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 class="text-sm font-medium text-ink">Confiança e fontes</h3>
            <dl class="mt-3 space-y-4">
              <div>
                <dt class="text-sm font-medium text-ink">Confiança</dt>
                <dd class="mt-1 text-xs leading-relaxed text-ink-muted">
                  Estimativa de 0 a 100 baseada em evidências verificáveis, variedade de fontes e
                  equilíbrio entre versões. De 80 a 100: alta sustentação; de 60 a 79: sustentação
                  moderada; abaixo de 60: leitura crítica recomendada.
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-ink">Diversidade de Fontes</dt>
                <dd class="mt-1 text-xs leading-relaxed text-ink-muted">
                  Escala de 0 a 100. Quanto maior, mais vozes distintas aparecem e mais explícito é
                  o contraditório no texto.
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 class="text-sm font-medium text-ink">DNA da Notícia</h3>
            <p class="mt-1 text-xs leading-relaxed text-ink-muted">
              Cada eixo vai de 0 a 100 e descreve uma característica do texto, não um julgamento
              isolado.
            </p>
            <dl class="mt-3 space-y-3">
              <div v-for="axis in DNA_AXES" :key="axis.key">
                <dt class="flex items-center gap-2 text-sm font-medium text-ink">
                  <span
                    class="h-1.5 w-1.5 shrink-0 rounded-full"
                    :style="{ background: axis.color }"
                  />
                  {{ axis.label }}
                </dt>
                <dd class="mt-0.5 pl-3.5 text-xs leading-relaxed text-ink-muted">
                  {{ axis.explanation }}
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 class="text-sm font-medium text-ink">Evidências e sinais</h3>
            <dl class="mt-3 space-y-4">
              <div>
                <dt class="text-sm font-medium text-ink">Força da evidência</dt>
                <dd class="mt-1 text-xs leading-relaxed text-ink-muted">
                  <strong class="font-medium text-mint">Forte</strong> indica documento, dado ou
                  citação verificável;
                  <strong class="font-medium text-insight">média</strong> indica declaração
                  contextualizada; <strong class="font-medium text-energy">fraca</strong> indica
                  atribuição genérica ou fonte não identificada.
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-ink">Sinais detectados</dt>
                <dd class="mt-1 text-xs leading-relaxed text-ink-muted">
                  Sinal verde aponta um ponto positivo de transparência; sinal vermelho aponta um
                  ponto de atenção. Ambos são pistas para a leitura, não conclusões automáticas.
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <p class="mt-6 border-t border-hairline pt-4 text-xs leading-relaxed text-ink-muted">
          As métricas descrevem padrões do texto e do cluster. Esta legenda não é checagem de fatos
          nem veredito de qualidade editorial.
        </p>
      </div>
    </Transition>
  </PCard>
</template>

<style scoped>
.legend-enter-active,
.legend-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.legend-enter-from,
.legend-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
