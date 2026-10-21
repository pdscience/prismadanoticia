<script setup>
/**
 * ESTRATÉGIA VIRAL (Cap. 14) — cada análise gera um cartão compartilhável.
 * Cartão 1080x1080 pronto para Instagram, LinkedIn e X, exportável em PNG.
 */
import { computed, ref } from 'vue'

import { DNA_AXES } from '@/data'
import { radarPoint, radarPolygon } from '@/lib/radar'

const props = defineProps({
  dna: { type: Object, required: true },
  topic: { type: String, default: 'Reforma Tributária' },
  outlet: { type: String, default: 'veiculo-exemplo.com.br' },
})

const svgEl = ref(null)
const busy = ref(false)
const copied = ref(false)

/** Eixos destacados no cartão, resolvidos com segurança a partir de DNA_AXES. */
const FEATURED_KEYS = ['emocao', 'fontes', 'evidencias']

const featured = computed(() =>
  FEATURED_KEYS.map((key) => DNA_AXES.find((a) => a.key === key))
    .filter(Boolean)
    .map((axis) => ({ ...axis, value: props.dna[axis.key] ?? 0 })),
)

/* mini radar — mesma geometria do DnaRadar, apenas em outra escala */
const CENTER = 176
const RADIUS = 132

function point(index, value) {
  return radarPoint({ index, count: DNA_AXES.length, value, center: CENTER, radius: RADIUS })
}

const radarPoints = computed(() => radarPolygon(props.dna, { center: CENTER, radius: RADIUS }))

const outlinePoints = computed(() =>
  DNA_AXES.map((_, i) =>
    point(i, 100)
      .map((n) => n.toFixed(1))
      .join(','),
  ).join(' '),
)

const midPoints = computed(() =>
  DNA_AXES.map((_, i) =>
    point(i, 50)
      .map((n) => n.toFixed(1))
      .join(','),
  ).join(' '),
)

async function download() {
  if (!svgEl.value) return
  busy.value = true

  const source = new XMLSerializer().serializeToString(svgEl.value)
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = () => reject(new Error('Falha ao renderizar o cartão'))
      img.src = url
    })

    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1080
    canvas.getContext('2d').drawImage(img, 0, 0, 1080, 1080)

    // toBlob é assíncrono: não bloqueia a thread principal no encode do PNG.
    const png = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!png) return

    const href = URL.createObjectURL(png)
    try {
      const link = document.createElement('a')
      link.download = `prisma-dna-${props.topic.toLowerCase().replace(/\s+/g, '-')}.png`
      link.href = href
      link.click()
    } finally {
      URL.revokeObjectURL(href)
    }
  } finally {
    // Sempre liberado, inclusive quando o carregamento da imagem falha.
    URL.revokeObjectURL(url)
    busy.value = false
  }
}

async function copyText() {
  const text = [
    'DNA da Notícia — Prisma da Notícia',
    `Tema: ${props.topic}`,
    ...DNA_AXES.map((a) => `${a.label}: ${props.dna[a.key]}`),
    'prismadanoticia.com.br',
  ].join('\n')

  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="overflow-hidden rounded-[var(--radius-card)] border border-hairline">
      <svg
        ref="svgEl"
        viewBox="0 0 1080 1080"
        xmlns="http://www.w3.org/2000/svg"
        class="block w-full"
      >
        <defs>
          <linearGradient id="sc-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#0B1236" />
            <stop offset="0.55" stop-color="#070C22" />
            <stop offset="1" stop-color="#05091A" />
          </linearGradient>
          <linearGradient id="sc-accent" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#6F9BFF" />
            <stop offset="0.5" stop-color="#B794FF" />
            <stop offset="1" stop-color="#FFC24B" />
          </linearGradient>
          <radialGradient id="sc-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0" stop-color="#8B5CF6" stop-opacity="0.6" />
            <stop offset="1" stop-color="#2D6BFF" stop-opacity="0.12" />
          </radialGradient>
          <pattern id="sc-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M60 0H0v60"
              fill="none"
              stroke="#FFFFFF"
              stroke-opacity="0.05"
              stroke-width="1"
            />
          </pattern>
        </defs>

        <rect width="1080" height="1080" fill="url(#sc-bg)" />
        <rect width="1080" height="1080" fill="url(#sc-grid)" />
        <circle cx="900" cy="180" r="260" fill="#8B5CF6" fill-opacity="0.16" />
        <circle cx="170" cy="920" r="240" fill="#2D6BFF" fill-opacity="0.14" />

        <!-- marca: mesma refração de 4 raios do logo oficial -->
        <g transform="translate(80 84)">
          <path d="M0 44 L44 54" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" />
          <path d="M74 54 L118 30" stroke="#6F9BFF" stroke-width="6" stroke-linecap="round" />
          <path d="M74 54 L120 48" stroke="#8B5CF6" stroke-width="6" stroke-linecap="round" />
          <path d="M74 54 L120 62" stroke="#FF3B5C" stroke-width="6" stroke-linecap="round" />
          <path d="M74 54 L116 80" stroke="#FFC24B" stroke-width="6" stroke-linecap="round" />
          <path d="M58 18 L86 82 L30 82 Z" fill="#8B5CF6" fill-opacity="0.1" />
          <path
            d="M58 18 L86 82 L30 82 Z"
            fill="none"
            stroke="url(#sc-accent)"
            stroke-width="6"
            stroke-linejoin="round"
          />
          <text
            x="146"
            y="48"
            fill="#F2F5FF"
            font-family="Space Grotesk, sans-serif"
            font-size="34"
            font-weight="600"
          >
            PRISMA DA NOTÍCIA
          </text>
          <text
            x="146"
            y="82"
            fill="#9AA6C9"
            font-family="Inter, sans-serif"
            font-size="22"
            letter-spacing="4"
          >
            UMA NOTÍCIA. VÁRIOS ÂNGULOS.
          </text>
        </g>

        <line x1="80" y1="212" x2="1000" y2="212" stroke="#FFFFFF" stroke-opacity="0.12" />

        <text
          x="80"
          y="308"
          fill="#F2F5FF"
          font-family="Space Grotesk, sans-serif"
          font-size="78"
          font-weight="700"
        >
          DNA da Notícia
        </text>
        <text x="80" y="358" fill="#9AA6C9" font-family="Inter, sans-serif" font-size="26">
          {{ topic }} · {{ outlet }}
        </text>

        <!-- métricas destacadas -->
        <g font-family="Space Grotesk, sans-serif">
          <g
            v-for="(item, i) in featured"
            :key="item.key"
            :transform="`translate(80 ${450 + i * 152})`"
          >
            <text
              x="0"
              y="0"
              fill="#9AA6C9"
              font-family="Inter, sans-serif"
              font-size="26"
              letter-spacing="3"
            >
              {{ item.label.toUpperCase() }}
            </text>
            <text x="0" y="76" :fill="item.color" font-size="86" font-weight="700">
              {{ item.value }}
            </text>
            <rect x="230" y="46" width="280" height="12" rx="6" fill="#FFFFFF" fill-opacity="0.1" />
            <rect
              x="230"
              y="46"
              :width="(item.value / 100) * 280"
              height="12"
              rx="6"
              :fill="item.color"
            />
          </g>
        </g>

        <!-- mini radar -->
        <g transform="translate(628 448)">
          <polygon :points="outlinePoints" fill="none" stroke="#FFFFFF" stroke-opacity="0.14" />
          <polygon :points="midPoints" fill="none" stroke="#FFFFFF" stroke-opacity="0.09" />
          <polygon
            :points="radarPoints"
            fill="url(#sc-fill)"
            stroke="url(#sc-accent)"
            stroke-width="4"
            stroke-linejoin="round"
          />
          <circle
            v-for="(axis, i) in DNA_AXES"
            :key="axis.key"
            :cx="point(i, dna[axis.key] ?? 0)[0]"
            :cy="point(i, dna[axis.key] ?? 0)[1]"
            r="7"
            :fill="axis.color"
          />
        </g>

        <line x1="80" y1="948" x2="1000" y2="948" stroke="#FFFFFF" stroke-opacity="0.12" />
        <text x="80" y="1006" fill="#9AA6C9" font-family="Inter, sans-serif" font-size="26">
          prismadanoticia.com.br
        </text>
        <text
          x="1000"
          y="1006"
          text-anchor="end"
          fill="#FFC24B"
          font-family="Inter, sans-serif"
          font-size="26"
        >
          Análise gerada pelo Prisma Engine
        </text>
      </svg>
    </div>

    <div class="flex flex-wrap gap-3">
      <button
        type="button"
        class="inline-flex h-10 items-center gap-2 rounded-full bg-linear-to-r from-electric to-prism px-5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        :disabled="busy"
        @click="download"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        >
          <path d="M12 3v12M7 11l5 5 5-5M5 20h14" />
        </svg>
        {{ busy ? 'Gerando...' : 'Baixar PNG 1080×1080' }}
      </button>

      <button
        type="button"
        class="inline-flex h-10 items-center gap-2 rounded-full border border-hairline px-5 text-sm text-ink-muted transition-colors hover:text-ink"
        @click="copyText"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
        >
          <rect x="9" y="9" width="11" height="11" rx="2.5" />
          <path d="M15 5H6.5A1.5 1.5 0 0 0 5 6.5V15" />
        </svg>
        {{ copied ? 'Copiado!' : 'Copiar indicadores' }}
      </button>
    </div>
  </div>
</template>
