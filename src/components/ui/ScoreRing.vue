<script setup>
import { animate } from 'motion'
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

const props = defineProps({
  value: { type: Number, required: true },
  label: { type: String, default: null },
  size: { type: Number, default: 132 },
  stroke: { type: Number, default: 9 },
  from: { type: String, default: '#2D6BFF' },
  to: { type: String, default: '#8B5CF6' },
  suffix: { type: String, default: '' },
})

const uid = useId()
const gradId = computed(() => `ring-${uid}`)
const radius = computed(() => 50 - props.stroke / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)

const shown = ref(0)
const host = ref(null)

let observer = null
let playback = null
let revealed = false

const offset = computed(
  () => circumference.value - (Math.min(100, Math.max(0, shown.value)) / 100) * circumference.value,
)

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Anima de `from` até o valor atual da prop. */
function run(from = 0) {
  playback?.stop?.()

  if (prefersReduced()) {
    shown.value = props.value
    return
  }

  playback = animate(from, props.value, {
    duration: 1.3,
    ease: [0.16, 1, 0.3, 1],
    onUpdate: (v) => (shown.value = v),
  })
}

onMounted(() => {
  if (prefersReduced()) {
    shown.value = props.value
    revealed = true
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return
      revealed = true
      run(0)
      observer?.disconnect()
      observer = null
    },
    { threshold: 0.35 },
  )

  if (host.value) observer.observe(host.value)
})

// Reanima quando a análise muda (a tela de Análise reaproveita o mesmo anel).
watch(
  () => props.value,
  () => {
    if (revealed) run(shown.value)
  },
)

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  playback?.stop?.()
})
</script>

<template>
  <div ref="host" class="relative inline-flex items-center justify-center">
    <svg :width="size" :height="size" viewBox="0 0 100 100" class="-rotate-90">
      <defs>
        <linearGradient :id="gradId" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" :stop-color="from" />
          <stop offset="100%" :stop-color="to" />
        </linearGradient>
      </defs>
      <circle
        cx="50"
        cy="50"
        :r="radius"
        fill="none"
        stroke="currentColor"
        class="text-ink"
        stroke-opacity="0.1"
        :stroke-width="stroke"
      />
      <circle
        cx="50"
        cy="50"
        :r="radius"
        fill="none"
        :stroke="`url(#${gradId})`"
        :stroke-width="stroke"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
      />
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <span class="font-display text-2xl font-semibold leading-none">
        {{ Math.round(shown) }}<span class="text-sm text-ink-muted">{{ suffix }}</span>
      </span>
      <span v-if="label" class="mt-1 text-[0.62rem] uppercase tracking-[0.2em] text-ink-muted">
        {{ label }}
      </span>
    </div>
  </div>
</template>
