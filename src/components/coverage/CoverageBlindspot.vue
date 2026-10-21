<script setup>
import { computed } from 'vue'

const props = defineProps({
  blindspot: { type: Object, required: true },
  totalClassified: { type: Number, required: true },
})

const PHRASE = { esquerda: 'à esquerda', centro: 'ao centro', direita: 'à direita' }

const phrase = computed(() => PHRASE[props.blindspot.side] ?? props.blindspot.side)
const title = computed(() =>
  props.blindspot.severity === 'confirmed'
    ? `Ponto cego ${phrase.value}`
    : `Possível ponto cego ${phrase.value}`,
)
</script>

<template>
  <div class="mt-4 rounded-2xl border border-amber-300/30 bg-amber-300/5 px-4 py-3">
    <p class="text-sm font-medium text-ink">{{ title }}</p>
    <p class="mt-1 text-xs leading-relaxed text-ink-muted">
      Apenas {{ blindspot.percent }}% dos {{ totalClassified }} veículos classificados estão neste
      lado.
      <template v-if="blindspot.severity === 'possible'">
        Com essa amostra limitada, leia como possível ponto cego.
      </template>
      Cobertura desigual não prova intenção editorial.
    </p>
  </div>
</template>
