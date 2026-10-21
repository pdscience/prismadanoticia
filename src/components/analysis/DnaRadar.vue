<script setup>
/**
 * O DNA DA NOTÍCIA — assinatura visual do PRISMA (Brand Book Cap. 4).
 * Radar de seis eixos: Emoção, Fontes, Evidências, Persuasão, Equilíbrio, Narrativa.
 */
import { animate } from 'motion'
import { computed, onMounted, ref, useId } from 'vue'

import { DNA_AXES } from '@/data'
import { radarPoint, radarPolygon } from '@/lib/radar'

const props = defineProps({
  values: { type: Object, required: true },
  /** Série secundária opcional (comparação entre veículos). */
  compare: { type: Object, default: null },
  compareLabel: { type: String, default: 'Comparação' },
  size: { type: Number, default: 340 },
  showLabels: { type: Boolean, default: true },
  interactive: { type: Boolean, default: true },
})

const uid = useId()
const fillId = computed(() => `dna-fill-${uid}`)
const strokeId = computed(() => `dna-stroke-${uid}`)
const glowId = computed(() => `dna-glow-${uid}`)

const shape = ref(null)
const activeAxis = ref(null)

const VIEW = 320
const CENTER = VIEW / 2
const RADIUS = 116
/** Folga entre o anel externo e os rótulos, em unidades do viewBox. */
const LABEL_GAP = 16
const RINGS = [0.25, 0.5, 0.75, 1]

/** Ponto no plano para um eixo (index) e um valor 0–100. */
function point(index, value, radius = RADIUS) {
  return radarPoint({ index, count: DNA_AXES.length, value, center: CENTER, radius })
}

function polygon(series) {
  return radarPolygon(series, { center: CENTER, radius: RADIUS })
}

const ringPolygons = computed(() =>
  RINGS.map((ratio) =>
    DNA_AXES.map((_, i) =>
      point(i, ratio * 100)
        .map((n) => n.toFixed(1))
        .join(','),
    ).join(' '),
  ),
)

const axisLines = computed(() => DNA_AXES.map((_, i) => point(i, 100)))
const mainPolygon = computed(() => polygon(props.values))
const comparePolygon = computed(() => (props.compare ? polygon(props.compare) : null))

const activeAxisInfo = computed(() =>
  activeAxis.value ? DNA_AXES.find((a) => a.key === activeAxis.value) : null,
)

const labels = computed(() =>
  DNA_AXES.map((axis, i) => {
    // Valor 100 no raio ampliado: mantém os rótulos fora da teia.
    const [x, y] = point(i, 100, RADIUS + LABEL_GAP)
    return {
      ...axis,
      x,
      y,
      value: props.values?.[axis.key] ?? 0,
      anchor: x > CENTER + 6 ? 'start' : x < CENTER - 6 ? 'end' : 'middle',
    }
  }),
)

function handleAxis(axis) {
  if (!props.interactive) return
  activeAxis.value = activeAxis.value === axis.key ? null : axis.key
}

onMounted(() => {
  if (!shape.value) return
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduced) return
  animate(
    shape.value,
    { opacity: [0, 1], scale: [0.32, 1], rotate: [-24, 0] },
    { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  )
})
</script>

<template>
  <div class="flex w-full flex-col items-center gap-4">
    <svg
      :viewBox="`0 0 ${VIEW} ${VIEW}`"
      :style="{ maxWidth: `${size}px` }"
      class="w-full overflow-visible"
      role="img"
      :aria-label="`Radar DNA da notícia com ${DNA_AXES.length} eixos`"
    >
      <defs>
        <radialGradient :id="fillId" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.55" />
          <stop offset="60%" stop-color="#2D6BFF" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#2D6BFF" stop-opacity="0.08" />
        </radialGradient>
        <linearGradient :id="strokeId" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#6F9BFF" />
          <stop offset="50%" stop-color="#B794FF" />
          <stop offset="100%" stop-color="#FFC24B" />
        </linearGradient>
        <filter :id="glowId" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- teia -->
      <g :stroke="'currentColor'" class="text-ink" stroke-opacity="0.12" fill="none">
        <polygon v-for="(ring, i) in ringPolygons" :key="i" :points="ring" />
        <line
          v-for="(p, i) in axisLines"
          :key="`ax-${i}`"
          :x1="CENTER"
          :y1="CENTER"
          :x2="p[0]"
          :y2="p[1]"
        />
      </g>

      <!-- série de comparação -->
      <polygon
        v-if="comparePolygon"
        :points="comparePolygon"
        fill="none"
        stroke="#FFC24B"
        stroke-width="1.5"
        stroke-dasharray="5 4"
        stroke-opacity="0.85"
      />

      <!-- série principal -->
      <g ref="shape" style="transform-origin: 160px 160px">
        <polygon :points="mainPolygon" :fill="`url(#${fillId})`" />
        <polygon
          :points="mainPolygon"
          fill="none"
          :stroke="`url(#${strokeId})`"
          stroke-width="2.5"
          stroke-linejoin="round"
          :filter="`url(#${glowId})`"
        />
        <g v-for="(axis, i) in DNA_AXES" :key="axis.key">
          <circle
            :cx="point(i, values[axis.key] ?? 0)[0]"
            :cy="point(i, values[axis.key] ?? 0)[1]"
            :r="activeAxis === axis.key ? 6 : 4"
            :fill="axis.color"
            stroke="#05091A"
            stroke-width="1.5"
            class="transition-all duration-300"
          />
        </g>
      </g>

      <!-- rótulos -->
      <g v-if="showLabels" class="font-display">
        <g
          v-for="label in labels"
          :key="label.key"
          :class="interactive ? 'cursor-pointer' : ''"
          @click="handleAxis(label)"
        >
          <text
            :x="label.x"
            :y="label.y - 3"
            :text-anchor="label.anchor"
            class="fill-current text-[11px] font-medium transition-opacity"
            :class="
              activeAxis && activeAxis !== label.key ? 'text-ink-muted opacity-45' : 'text-ink'
            "
          >
            {{ label.label }}
          </text>
          <text
            :x="label.x"
            :y="label.y + 11"
            :text-anchor="label.anchor"
            class="text-[12px] font-semibold"
            :fill="label.color"
          >
            {{ label.value }}
          </text>
        </g>
      </g>
    </svg>

    <!-- legenda / explicação do eixo -->
    <div class="w-full space-y-3">
      <div v-if="compare" class="flex items-center justify-center gap-5 text-xs text-ink-muted">
        <span class="flex items-center gap-2">
          <span class="h-0.5 w-6 rounded-full bg-linear-to-r from-electric-soft to-prism-soft" />
          Esta notícia
        </span>
        <span class="flex items-center gap-2">
          <span class="h-0.5 w-6 rounded-full border-t-2 border-dashed border-insight" />
          {{ compareLabel }}
        </span>
      </div>

      <Transition name="route-fade" mode="out-in">
        <p
          v-if="activeAxisInfo"
          :key="activeAxisInfo.key"
          class="rounded-xl border border-hairline bg-surface p-4 text-sm leading-relaxed text-ink-muted"
        >
          <strong class="text-ink">{{ activeAxisInfo.label }}</strong>
          <span class="text-ink-muted"> — mede {{ activeAxisInfo.measures }}. </span>
          {{ activeAxisInfo.explanation }}
        </p>
        <p v-else-if="interactive" class="text-center text-xs text-ink-muted">
          Toque em um eixo para entender o que ele mede.
        </p>
      </Transition>
    </div>
  </div>
</template>
