<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import PBadge from '@/components/ui/PBadge.vue'
import PButton from '@/components/ui/PButton.vue'
import PCard from '@/components/ui/PCard.vue'

const props = defineProps({
  perspectives: { type: Object, required: true },
})

const SIDE_LABELS = {
  esquerda: 'Esquerda',
  centro: 'Centro',
  direita: 'Direita',
}

const representedLabel = computed(
  () => `${props.perspectives.represented.length} de 3 lados representados`,
)

const missingLabel = computed(() =>
  props.perspectives.missing.map((key) => SIDE_LABELS[key] ?? key).join(' · '),
)

function confidenceLabel(value) {
  const number = Number(value)
  return Number.isFinite(number) ? `${Math.round(number)}% de confiança` : 'confiança não informada'
}
</script>

<template>
  <PCard accent="#6F9BFF" :hover="false" class="mt-5">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="max-w-2xl">
        <p class="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-ink-muted">
          Perspectivas
        </p>
        <h3 class="mt-2 text-lg">Perspectivas nesta história</h3>
        <p class="mt-1.5 text-xs leading-relaxed text-ink-muted">
          Coberturas do mesmo cluster, agrupadas pelo enquadramento detectado em cada texto.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <PBadge color="#6F9BFF">{{ representedLabel }}</PBadge>
        <PBadge v-if="!perspectives.sampleReliable" color="#FFC24B">Amostra pequena</PBadge>
      </div>
    </div>

    <div
      v-if="!perspectives.total"
      class="mt-6 rounded-2xl border border-dashed border-hairline p-5"
    >
      <p class="text-sm font-medium text-ink">Ainda não há outras coberturas deste fato.</p>
      <p class="mt-2 text-xs leading-relaxed text-ink-muted">
        O cluster pode ter apenas esta matéria analisada. A comparação aparecerá quando houver
        outros veículos com enquadramento salvo para o mesmo agrupamento.
      </p>
      <PButton to="/comparacao" variant="outline" size="sm" class="mt-4">
        Comparar por tema
      </PButton>
    </div>

    <template v-else>
      <p
        v-if="perspectives.missing.length"
        class="mt-5 rounded-2xl border border-hairline bg-surface/45 px-4 py-3 text-xs leading-relaxed text-ink-muted"
      >
        <strong class="text-ink">Falta: {{ missingLabel }}.</strong>
        A ausência indica que nenhuma matéria deste cluster foi classificada nesse lado. Não prova
        omissão editorial nem intenção do veículo.
      </p>

      <div class="mt-6 grid gap-4 lg:grid-cols-3">
        <section
          v-for="side in perspectives.sides"
          :key="side.key"
          class="rounded-2xl border border-hairline bg-surface/35 p-4"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="flex items-center gap-2 text-sm font-medium text-ink">
              <span class="h-2 w-2 rounded-full" :style="{ background: side.color }" />
              {{ side.label }}
            </span>
            <span class="font-display text-sm font-semibold" :style="{ color: side.color }">
              {{ side.rows.length }}
            </span>
          </div>

          <ul v-if="side.rows.length" class="mt-4 space-y-4">
            <li v-for="item in side.rows" :key="item.news_id">
              <RouterLink
                :to="{ name: 'bias', query: { url: item.url } }"
                class="text-sm font-medium leading-snug text-ink transition-colors hover:text-electric-soft"
              >
                {{ item.title }}
              </RouterLink>
              <p class="mt-1 text-[0.7rem] text-ink-muted">
                {{ item.outlet }} · {{ confidenceLabel(item.confidence) }}
              </p>
            </li>
          </ul>
          <p v-else class="mt-4 text-xs leading-relaxed text-ink-muted">
            Nenhuma matéria deste cluster foi classificada neste lado.
          </p>
        </section>
      </div>

      <div
        v-if="perspectives.uncertain.rows.length"
        class="mt-4 rounded-2xl border border-hairline px-4 py-3"
      >
        <p class="text-xs font-medium text-ink">
          Incerta ({{ perspectives.uncertain.rows.length }})
        </p>
        <ul class="mt-2 space-y-2">
          <li v-for="item in perspectives.uncertain.rows" :key="item.news_id" class="text-xs">
            <RouterLink
              :to="{ name: 'bias', query: { url: item.url } }"
              class="text-ink-muted transition-colors hover:text-ink"
            >
              {{ item.title }} · {{ item.outlet }}
            </RouterLink>
          </li>
        </ul>
      </div>

      <p class="mt-5 border-t border-hairline pt-4 text-xs leading-relaxed text-ink-muted">
        Cada veículo aparece uma vez, pela matéria mais recente com análise de enquadramento. O
        agrupamento usa o enquadramento estimado do texto, não é um rating permanente do veículo.
        Esta leitura não é checagem de fatos, ranking de qualidade nem prova de equilíbrio.
      </p>
      <PButton
        v-if="perspectives.clusterId"
        :to="{ name: 'coverage', query: { cluster: perspectives.clusterId } }"
        variant="outline"
        size="sm"
        class="mt-4"
      >
        Ver cobertura completa
      </PButton>
    </template>
  </PCard>
</template>
