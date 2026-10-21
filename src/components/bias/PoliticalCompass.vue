<script setup>
import { computed } from 'vue'

import { axisPosition, biasColor } from '@/lib/bias'

const props = defineProps({
  economic: { type: Number, required: true },
  social: { type: Number, required: true },
  label: { type: String, required: true },
})

const plot = { x: 36, y: 30, size: 248 }
const pointX = computed(() => plot.x + (axisPosition(props.economic) / 100) * plot.size)
const pointY = computed(() => plot.y + ((100 - axisPosition(props.social)) / 100) * plot.size)
const color = computed(() => biasColor(props.label))
const description = computed(
  () =>
    `Posição do texto: eixo econômico ${props.economic}, eixo social ${props.social}. Rótulo geral: ${props.label}.`,
)
</script>

<template>
  <div class="mx-auto w-full max-w-[440px]">
    <svg viewBox="0 0 320 320" class="w-full" role="img" :aria-label="description">
      <title>{{ description }}</title>
      <defs>
        <linearGradient id="bias-axis" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#8B5CF6" />
          <stop offset="50%" stop-color="#9AA6C9" />
          <stop offset="100%" stop-color="#FFC24B" />
        </linearGradient>
        <radialGradient id="bias-glow">
          <stop offset="0%" :stop-color="color" stop-opacity="0.45" />
          <stop offset="100%" :stop-color="color" stop-opacity="0" />
        </radialGradient>
      </defs>

      <rect
        :x="plot.x"
        :y="plot.y"
        :width="plot.size"
        :height="plot.size"
        rx="22"
        fill="currentColor"
        class="text-ink"
        fill-opacity="0.035"
        stroke="currentColor"
        stroke-opacity="0.14"
      />

      <g stroke="currentColor" class="text-ink" stroke-opacity="0.1">
        <line
          v-for="step in [0, 25, 50, 75, 100]"
          :key="`v-${step}`"
          :x1="plot.x + (step / 100) * plot.size"
          :x2="plot.x + (step / 100) * plot.size"
          :y1="plot.y"
          :y2="plot.y + plot.size"
        />
        <line
          v-for="step in [0, 25, 50, 75, 100]"
          :key="`h-${step}`"
          :x1="plot.x"
          :x2="plot.x + plot.size"
          :y1="plot.y + (step / 100) * plot.size"
          :y2="plot.y + (step / 100) * plot.size"
        />
      </g>

      <circle
        :cx="plot.x + plot.size / 2"
        :cy="plot.y + plot.size / 2"
        :r="plot.size * 0.24"
        fill="none"
        stroke="currentColor"
        class="text-ink"
        stroke-opacity="0.12"
        stroke-dasharray="3 6"
      />
      <circle
        :cx="plot.x + plot.size / 2"
        :cy="plot.y + plot.size / 2"
        :r="plot.size * 0.38"
        fill="none"
        stroke="currentColor"
        class="text-ink"
        stroke-opacity="0.08"
        stroke-dasharray="3 6"
      />

      <line
        :x1="plot.x"
        :x2="plot.x + plot.size"
        :y1="plot.y + plot.size / 2"
        :y2="plot.y + plot.size / 2"
        stroke="url(#bias-axis)"
        stroke-opacity="0.75"
        stroke-width="1.4"
      />
      <line
        :x1="plot.x + plot.size / 2"
        :x2="plot.x + plot.size / 2"
        :y1="plot.y"
        :y2="plot.y + plot.size"
        stroke="currentColor"
        class="text-ink"
        stroke-opacity="0.22"
        stroke-width="1.2"
      />

      <text
        x="160"
        y="18"
        text-anchor="middle"
        fill="currentColor"
        class="text-ink-muted"
        font-size="9"
        letter-spacing="1.4"
      >
        CONSERVADOR
      </text>
      <text
        x="160"
        y="310"
        text-anchor="middle"
        fill="currentColor"
        class="text-ink-muted"
        font-size="9"
        letter-spacing="1.4"
      >
        PROGRESSISTA
      </text>
      <text
        x="8"
        y="160"
        text-anchor="middle"
        fill="currentColor"
        class="text-ink-muted"
        font-size="9"
        letter-spacing="1.2"
        transform="rotate(-90 8 160)"
      >
        ESTADO
      </text>
      <text
        x="312"
        y="160"
        text-anchor="middle"
        fill="currentColor"
        class="text-ink-muted"
        font-size="9"
        letter-spacing="1.2"
        transform="rotate(90 312 160)"
      >
        MERCADO
      </text>

      <text
        x="160"
        y="294"
        text-anchor="middle"
        fill="currentColor"
        class="text-ink-muted"
        font-size="8"
        letter-spacing="0.8"
        opacity="0.7"
      >
        EIXO SOCIAL / CULTURAL
      </text>

      <circle :cx="pointX" :cy="pointY" r="34" fill="url(#bias-glow)" />
      <circle :cx="pointX" :cy="pointY" r="11" :fill="color" stroke="#F2F5FF" stroke-width="1.5" />
      <circle :cx="pointX" :cy="pointY" r="3" fill="#05091A" fill-opacity="0.7" />
    </svg>

    <div class="mt-2 flex items-center justify-between gap-3 text-xs text-ink-muted">
      <span>Estado</span>
      <span class="font-medium text-ink">{{ label }}</span>
      <span>Mercado</span>
    </div>
  </div>
</template>
