<script setup>
/**
 * MAPA DE POLARIZAÇÃO EM TEMPO REAL — o moat do PRISMA.
 * Cartograma do Brasil: cada UF é uma célula posicionada por geografia aproximada.
 * Mostra o tema dominante da cobertura e o nível de divergência de enquadramento.
 */
import { computed, ref } from 'vue'

import { POLARIZATION_THEMES, STATES, dominantTheme, polarizationColor } from '@/data/prisma'

const props = defineProps({
  /** 'dominante' | 'polarizacao' | chave de tema */
  mode: { type: String, default: 'dominante' },
  compact: { type: Boolean, default: false },
  interactive: { type: Boolean, default: true },
})

const emit = defineEmits(['select'])

const CELL = 54
const GAP = 7
const COLS = 8
const ROWS = 8

const width = COLS * (CELL + GAP)
const height = ROWS * (CELL + GAP)

const hovered = ref(null)

/** Estado sob o cursor, resolvido uma única vez por render. */
const hoveredState = computed(() =>
  hovered.value ? STATES.find((s) => s.uf === hovered.value) : null,
)

const maxShare = computed(() => {
  if (!POLARIZATION_THEMES.some((t) => t.key === props.mode)) return 100
  return Math.max(1, ...STATES.map((s) => s.themes[props.mode] ?? 0))
})

/**
 * Dados de desenho de cada célula, memoizados por `mode`. Evita recalcular a
 * geometria e as cores das 27 UFs a cada mudança de hover.
 */
const cells = computed(() =>
  STATES.map((state) => {
    const x = state.col * (CELL + GAP)
    const y = state.row * (CELL + GAP)

    let color
    let alpha
    let value

    if (props.mode === 'dominante') {
      const theme = dominantTheme(state)
      color = theme.color
      value = state.themes[theme.key]
      alpha = 0.16 + (state.polarization / 100) * 0.62
    } else if (props.mode === 'polarizacao') {
      color = polarizationColor(state.polarization)
      value = state.polarization
      alpha = 0.18 + (state.polarization / 100) * 0.66
    } else {
      const theme = POLARIZATION_THEMES.find((t) => t.key === props.mode)
      color = theme.color
      value = state.themes[props.mode] ?? 0
      alpha = 0.1 + (value / maxShare.value) * 0.78
    }

    return { state, x, y, color, alpha, value }
  }),
)

function handleSelect(state) {
  if (!props.interactive) return
  emit('select', state)
}
</script>

<template>
  <div class="relative w-full">
    <svg
      :viewBox="`0 0 ${width} ${height}`"
      class="w-full"
      :class="compact ? 'max-w-md' : ''"
      role="img"
      aria-label="Cartograma do Brasil com temas dominantes da cobertura por estado"
    >
      <g
        v-for="cell in cells"
        :key="cell.state.uf"
        :transform="`translate(${cell.x} ${cell.y})`"
        :class="interactive ? 'cursor-pointer' : ''"
        @mouseenter="hovered = cell.state.uf"
        @mouseleave="hovered = null"
        @click="handleSelect(cell.state)"
      >
        <rect
          :width="CELL"
          :height="CELL"
          rx="12"
          :fill="cell.color"
          :fill-opacity="cell.alpha"
          :stroke="cell.color"
          :stroke-opacity="hovered === cell.state.uf ? 0.95 : 0.35"
          stroke-width="1.4"
          class="transition-all duration-300"
          :style="hovered === cell.state.uf ? `filter: drop-shadow(0 0 14px ${cell.color})` : ''"
        />
        <text
          :x="CELL / 2"
          :y="CELL / 2 - 2"
          text-anchor="middle"
          class="pointer-events-none fill-white font-display text-[13px] font-semibold"
        >
          {{ cell.state.uf }}
        </text>
        <text
          :x="CELL / 2"
          :y="CELL / 2 + 13"
          text-anchor="middle"
          class="pointer-events-none fill-white/70 text-[9px]"
        >
          {{ cell.value }}%
        </text>
      </g>
    </svg>

    <!-- tooltip -->
    <Transition name="route-fade">
      <div
        v-if="hoveredState && !compact"
        class="pointer-events-none absolute right-0 top-0 w-56 rounded-2xl glass p-4 text-left"
      >
        <p class="font-display text-sm font-semibold">{{ hoveredState.name }}</p>
        <p class="mt-1 text-xs text-ink-muted">
          {{ hoveredState.outlets }} veículos monitorados
        </p>
        <div class="mt-3 space-y-1.5">
          <div
            v-for="theme in POLARIZATION_THEMES"
            :key="theme.key"
            class="flex items-center gap-2 text-[0.7rem]"
          >
            <span class="h-1.5 w-1.5 rounded-full" :style="{ background: theme.color }" />
            <span class="flex-1 text-ink-muted">{{ theme.label }}</span>
            <span class="font-display font-semibold">{{ hoveredState.themes[theme.key] }}%</span>
          </div>
        </div>
        <p class="mt-3 border-t border-hairline pt-2 text-[0.7rem] text-ink-muted">
          Polarização: <strong class="text-ink">{{ hoveredState.polarization }}</strong> / 100
        </p>
      </div>
    </Transition>
  </div>
</template>
