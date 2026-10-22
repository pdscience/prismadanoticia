<script setup>
/** Evidências da análise: o que sustenta a matéria e o trecho literal que comprova. */
defineProps({
  evidences: { type: Array, default: () => [] },
})

const STRENGTH_COLORS = {
  forte: '#2EE6A8',
  média: '#FFC24B',
  fraca: '#FF3B5C',
}
</script>

<template>
  <ul class="mt-5 divide-y divide-hairline">
    <li
      v-for="ev in evidences"
      :key="ev.label"
      class="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
    >
      <span
        class="mt-0.5 shrink-0 rounded-md px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-wider"
        :style="{
          color: STRENGTH_COLORS[ev.strength] ?? STRENGTH_COLORS['média'],
          background: `${STRENGTH_COLORS[ev.strength] ?? STRENGTH_COLORS['média']}18`,
        }"
      >
        {{ ev.strength }}
      </span>
      <div>
        <p class="text-sm font-medium text-ink">{{ ev.label }}</p>
        <p class="mt-1 text-xs leading-relaxed text-ink-muted">
          <span class="text-ink-muted/80">{{ ev.kind }} ·</span> {{ ev.note }}
        </p>
        <blockquote
          v-if="ev.quote"
          class="mt-2 border-l-2 border-mint/40 pl-3 text-xs italic leading-relaxed text-ink-muted"
        >
          “{{ ev.quote }}”
        </blockquote>
      </div>
    </li>
  </ul>
</template>
