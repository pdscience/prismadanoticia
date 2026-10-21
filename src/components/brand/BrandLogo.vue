<script setup>
/**
 * Logo oficial — Prisma da Notícia
 * Brand Book Cap. 2: três versões (horizontal, vertical, ícone).
 * O ícone também é usado como favicon.
 */
import { computed, useId } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'horizontal',
    validator: (v) => ['horizontal', 'vertical', 'icon'].includes(v),
  },
  size: { type: [Number, String], default: 40 },
  tagline: { type: Boolean, default: false },
  animated: { type: Boolean, default: false },
})

const uid = useId()
const gradId = computed(() => `pg-${uid}`)
const glowId = computed(() => `gl-${uid}`)
const markSize = computed(() => `${props.size}px`)
</script>

<template>
  <span
    class="inline-flex select-none items-center"
    :class="{
      'flex-col gap-2 text-center': variant === 'vertical',
      'gap-3': variant === 'horizontal',
    }"
  >
    <!-- Ícone / marca do prisma -->
    <svg
      :width="markSize"
      :height="markSize"
      viewBox="0 0 512 512"
      class="shrink-0 overflow-visible"
      :class="animated ? 'group-hover:rotate-[8deg] transition-transform duration-500' : ''"
      role="img"
      aria-label="Prisma da Notícia"
    >
      <defs>
        <linearGradient :id="gradId" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#6F9BFF" />
          <stop offset="0.5" stop-color="#B794FF" />
          <stop offset="1" stop-color="#FFC24B" />
        </linearGradient>
        <filter :id="glowId" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      <!-- feixe de luz branca -->
      <path
        d="M18 196 L198 240"
        stroke="currentColor"
        stroke-width="22"
        stroke-linecap="round"
        opacity="0.9"
      />

      <!-- espectro refratado -->
      <g
        stroke-width="20"
        stroke-linecap="round"
        :filter="animated ? `url(#${glowId})` : null"
        opacity="0.55"
      >
        <path d="M314 240 L500 150" stroke="#6F9BFF" />
        <path d="M314 240 L504 224" stroke="#8B5CF6" />
        <path d="M314 240 L504 296" stroke="#FF3B5C" />
        <path d="M314 240 L482 364" stroke="#FFC24B" />
      </g>
      <g stroke-width="20" stroke-linecap="round">
        <path d="M314 240 L500 150" stroke="#6F9BFF" />
        <path d="M314 240 L504 224" stroke="#8B5CF6" />
        <path d="M314 240 L504 296" stroke="#FF3B5C" />
        <path d="M314 240 L482 364" stroke="#FFC24B" />
      </g>

      <!-- prisma -->
      <path d="M256 112 L390 358 L122 358 Z" fill="#8B5CF6" fill-opacity="0.12" />
      <path
        d="M256 112 L390 358 L122 358 Z"
        fill="none"
        :stroke="`url(#${gradId})`"
        stroke-width="26"
        stroke-linejoin="round"
      />
      <circle cx="314" cy="240" r="14" fill="currentColor" />
    </svg>

    <!-- Wordmark (Space Grotesk) -->
    <span v-if="variant !== 'icon'" class="flex flex-col leading-none">
      <span
        class="font-display font-semibold tracking-tight"
        :class="variant === 'vertical' ? 'text-2xl' : 'text-lg'"
      >
        PRISMA
        <span class="text-gradient">da Notícia</span>
      </span>
      <span
        v-if="tagline"
        class="mt-1 font-sans text-[0.6rem] uppercase tracking-[0.32em] text-ink-muted"
      >
        Uma notícia. Vários ângulos.
      </span>
    </span>
  </span>
</template>
