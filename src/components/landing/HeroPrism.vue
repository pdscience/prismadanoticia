<script setup>
/**
 * HERO — Landing Page Premium (Brand Book Cap. 3)
 * Animação: um feixe de luz atravessa um prisma e se abre em vários ângulos.
 * Depois aparece: "Toda notícia tem um ângulo. Descubra todos."
 */
import { animate, stagger } from 'motion'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import PBadge from '@/components/ui/PBadge.vue'
import PButton from '@/components/ui/PButton.vue'
import { frame } from '@/data'
import { fetchStats } from '@/lib/services'

const router = useRouter()
const url = ref('')

const scene = ref(null)
const copy = ref(null)

// Os ângulos que saem do prisma usam as cores canônicas dos enquadramentos.
const rays = [
  { key: 'juridico', d: 'M350 215 L560 95', x2: 560, y2: 95, ly: 92 },
  { key: 'politica', d: 'M350 215 L566 155', x2: 566, y2: 155, ly: 152 },
  { key: 'economia', d: 'M350 215 L570 215', x2: 570, y2: 215, ly: 212 },
  { key: 'seguranca', d: 'M350 215 L566 275', x2: 566, y2: 275, ly: 272 },
  { key: 'ambiente', d: 'M350 215 L560 335', x2: 560, y2: 335, ly: 332 },
].map((ray) => ({ ...ray, ...frame(ray.key) }))

const outlets = ref(null)
const stats = computed(() => [
  { value: outlets.value ? String(outlets.value) : '—', label: 'veículos analisados' },
  { value: '6', label: 'eixos no DNA' },
  { value: '27', label: 'UFs no mapa' },
])

function submit() {
  router.push({ name: 'analysis', query: url.value ? { url: url.value } : {} })
}

onMounted(async () => {
  const counters = await fetchStats()
  if (counters.outlets > 0) outlets.value = counters.outlets

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const items = copy.value ? [...copy.value.querySelectorAll('[data-hero]')] : []

  if (reduced) {
    items.forEach((el) => {
      el.style.opacity = '1'
      el.style.transform = 'none'
    })
  } else {
    items.forEach((el) => {
      el.style.opacity = '0'
      el.style.transform = 'translateY(22px)'
    })
    animate(
      items,
      { opacity: [0, 1], y: [22, 0] },
      { duration: 0.85, delay: stagger(0.11, { startDelay: 0.5 }), ease: [0.16, 1, 0.3, 1] },
    )
  }

  if (!scene.value) return

  const beams = [...scene.value.querySelectorAll('[data-beam]')]
  const beamDots = [...scene.value.querySelectorAll('[data-beam-dot]')]
  const prism = scene.value.querySelector('[data-prism]')
  const rayEls = [...scene.value.querySelectorAll('[data-ray]')]
  const rayDots = [...scene.value.querySelectorAll('[data-ray-dot]')]
  const labelEls = [...scene.value.querySelectorAll('[data-ray-label]')]
  const core = scene.value.querySelector('[data-core]')

  if (reduced) {
    beams.forEach((el) => (el.style.strokeDashoffset = '0'))
    beamDots.forEach((el) => (el.style.opacity = '1'))
    rayEls.forEach((el) => {
      el.style.strokeDashoffset = '0'
      el.style.opacity = '1'
    })
    rayDots.forEach((el) => (el.style.opacity = '1'))
    labelEls.forEach((el) => {
      el.style.opacity = '1'
      el.style.transform = 'none'
    })
    for (const el of [prism, core]) {
      if (!el) continue
      el.style.opacity = '1'
      el.style.transform = 'none'
    }
    return
  }

  animate(prism, { opacity: [0, 1], scale: [0.86, 1] }, { duration: 0.9, ease: [0.16, 1, 0.3, 1] })
  animate(beams, { strokeDashoffset: [1, 0] }, { duration: 0.9, delay: 0.35, ease: 'easeOut' })
  animate(beamDots, { opacity: [0, 1] }, { duration: 0.45, delay: 1.05 })
  animate(core, { opacity: [0, 1], scale: [0, 1] }, { duration: 0.5, delay: 1.15 })
  animate(
    rayEls,
    { strokeDashoffset: [1, 0], opacity: [0, 1] },
    { duration: 1, delay: stagger(0.09, { startDelay: 1.2 }), ease: [0.16, 1, 0.3, 1] },
  )
  animate(
    rayDots,
    { opacity: [0, 1] },
    { duration: 0.45, delay: stagger(0.09, { startDelay: 1.7 }) },
  )
  animate(
    labelEls,
    { opacity: [0, 1], x: [-8, 0] },
    { duration: 0.6, delay: stagger(0.09, { startDelay: 1.8 }) },
  )
})
</script>

<template>
  <section class="relative overflow-hidden pt-10 pb-20 sm:pt-16 lg:pb-28">
    <div class="container-prisma">
      <div class="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
        <!-- Copy -->
        <div ref="copy" class="relative z-10">
          <div data-hero>
            <PBadge color="#8B5CF6" dot pulse>MediaTech · AI · News Intelligence</PBadge>
          </div>

          <h1 data-hero class="mt-6 text-4xl leading-[1.06] sm:text-5xl lg:text-[3.7rem]">
            Toda notícia tem um ângulo.
            <span class="text-gradient">Descubra todos.</span>
          </h1>

          <p data-hero class="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
            A notícia não muda. O que muda é o ângulo pelo qual ela é apresentada. O
            <strong class="font-medium text-ink">Prisma da Notícia</strong> usa IA para revelar o
            DNA de cada matéria, comparar coberturas e mostrar o que ficou de fora.
          </p>

          <!-- Ação principal -->
          <form data-hero class="mt-9 flex flex-col gap-3 sm:flex-row" @submit.prevent="submit">
            <label class="sr-only" for="hero-url">Link da notícia</label>
            <div class="relative flex-1">
              <svg
                class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              >
                <path d="M10 13a4 4 0 0 0 5.7 0l3-3A4 4 0 0 0 13 4.3l-1.7 1.7" />
                <path d="M14 11a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 19.7l1.7-1.7" />
              </svg>
              <input
                id="hero-url"
                v-model="url"
                type="text"
                inputmode="url"
                placeholder="Cole o link de uma notícia..."
                class="h-14 w-full rounded-full border border-hairline bg-surface pl-11 pr-5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted/70 focus:border-electric-soft"
              />
            </div>
            <PButton type="submit" size="lg" class="shrink-0">
              Analisar uma notícia
              <template #icon-right>
                <svg
                  class="transition-transform duration-300 group-hover:translate-x-1"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <path d="M5 12h13M13 6l6 6-6 6" />
                </svg>
              </template>
            </PButton>
          </form>

          <p data-hero class="mt-3 text-xs text-ink-muted">
            Sem cadastro para a primeira análise. Funciona com qualquer portal brasileiro.
          </p>

          <dl data-hero class="mt-10 flex flex-wrap gap-x-10 gap-y-4">
            <div v-for="stat in stats" :key="stat.label">
              <dt class="font-display text-2xl font-semibold text-ink">{{ stat.value }}</dt>
              <dd class="text-xs uppercase tracking-[0.16em] text-ink-muted">{{ stat.label }}</dd>
            </div>
          </dl>
        </div>

        <!-- Cena do prisma -->
        <div class="relative">
          <div
            class="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-prism/20 blur-[110px]"
          />
          <svg
            ref="scene"
            viewBox="0 0 760 430"
            class="relative w-full overflow-visible"
            role="img"
            aria-label="Um feixe de luz atravessa um prisma e se separa em vários ângulos de cobertura"
          >
            <defs>
              <linearGradient id="hero-edge" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#6F9BFF" />
                <stop offset="0.48" stop-color="#B794FF" />
                <stop offset="1" stop-color="#FFC24B" />
              </linearGradient>
              <linearGradient id="hero-edge-highlight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.9" />
                <stop offset="0.4" stop-color="#B794FF" stop-opacity="0.32" />
                <stop offset="1" stop-color="#2D6BFF" stop-opacity="0" />
              </linearGradient>
              <linearGradient id="hero-face" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#8B5CF6" stop-opacity="0.34" />
                <stop offset="0.48" stop-color="#2D6BFF" stop-opacity="0.12" />
                <stop offset="1" stop-color="#05091A" stop-opacity="0.06" />
              </linearGradient>
              <linearGradient id="hero-facet-left" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stop-color="#2D6BFF" stop-opacity="0.04" />
                <stop offset="1" stop-color="#B794FF" stop-opacity="0.22" />
              </linearGradient>
              <linearGradient id="hero-facet-right" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.08" />
                <stop offset="1" stop-color="#8B5CF6" stop-opacity="0.16" />
              </linearGradient>
              <linearGradient
                v-for="ray in rays"
                :id="`hero-ray-${ray.key}`"
                :key="`gradient-${ray.key}`"
                gradientUnits="userSpaceOnUse"
                x1="350"
                y1="215"
                :x2="ray.x2"
                :y2="ray.y2"
              >
                <stop offset="0" :stop-color="ray.color" stop-opacity="0.95" />
                <stop offset="0.55" :stop-color="ray.color" stop-opacity="0.72" />
                <stop offset="1" :stop-color="ray.color" stop-opacity="0.2" />
              </linearGradient>
              <radialGradient id="hero-ambient" cx="50%" cy="50%" r="50%">
                <stop offset="0" stop-color="#8B5CF6" stop-opacity="0.22" />
                <stop offset="0.55" stop-color="#2D6BFF" stop-opacity="0.08" />
                <stop offset="1" stop-color="#05091A" stop-opacity="0" />
              </radialGradient>
              <radialGradient id="hero-caustic" cx="50%" cy="50%" r="50%">
                <stop offset="0" stop-color="#B794FF" stop-opacity="0.5" />
                <stop offset="0.55" stop-color="#2D6BFF" stop-opacity="0.16" />
                <stop offset="1" stop-color="#2D6BFF" stop-opacity="0" />
              </radialGradient>
              <radialGradient id="hero-core" cx="50%" cy="50%" r="50%">
                <stop offset="0" stop-color="#FFFFFF" />
                <stop offset="0.28" stop-color="#FFFFFF" stop-opacity="0.95" />
                <stop offset="0.6" stop-color="#B794FF" stop-opacity="0.5" />
                <stop offset="1" stop-color="#8B5CF6" stop-opacity="0" />
              </radialGradient>
              <filter id="hero-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5.5" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="hero-soft" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="14" />
              </filter>
              <filter id="hero-shadow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="10" />
              </filter>
            </defs>

            <circle cx="350" cy="215" r="180" fill="url(#hero-ambient)" />
            <circle
              cx="350"
              cy="215"
              r="132"
              fill="none"
              stroke="url(#hero-edge)"
              stroke-width="0.7"
              stroke-opacity="0.12"
              stroke-dasharray="2 8"
            />

            <!-- feixe branco -->
            <g>
              <path
                data-beam
                d="M8 168 L250 215"
                stroke="#6F9BFF"
                stroke-opacity="0.16"
                stroke-width="18"
                stroke-linecap="round"
                pathLength="1"
                stroke-dasharray="1"
                stroke-dashoffset="1"
                filter="url(#hero-soft)"
              />
              <path
                data-beam
                d="M8 168 L250 215"
                stroke="url(#hero-edge)"
                stroke-opacity="0.9"
                stroke-width="6"
                stroke-linecap="round"
                pathLength="1"
                stroke-dasharray="1"
                stroke-dashoffset="1"
                filter="url(#hero-glow)"
              />
              <path
                data-beam
                d="M8 168 L250 215"
                stroke="#FFFFFF"
                stroke-width="2"
                stroke-linecap="round"
                pathLength="1"
                stroke-dasharray="1"
                stroke-dashoffset="1"
              />
            </g>
            <circle
              data-beam-dot
              cx="8"
              cy="168"
              r="3.2"
              fill="#FFFFFF"
              filter="url(#hero-glow)"
              style="opacity: 0"
            />
            <text
              x="14"
              y="150"
              class="fill-current text-[10px] font-display uppercase tracking-[0.18em] text-ink-muted"
            >
              O fato
            </text>
            <line
              x1="14"
              y1="158"
              x2="46"
              y2="158"
              stroke="currentColor"
              stroke-opacity="0.25"
              class="text-ink-muted"
            />

            <!-- espectro -->
            <g filter="url(#hero-glow)">
              <g v-for="ray in rays" :key="`ray-${ray.key}`">
                <path
                  data-ray
                  :d="ray.d"
                  :stroke="ray.color"
                  stroke-width="9"
                  stroke-opacity="0.18"
                  stroke-linecap="round"
                  pathLength="1"
                  stroke-dasharray="1"
                  stroke-dashoffset="1"
                  style="opacity: 0"
                />
                <path
                  data-ray
                  :d="ray.d"
                  :stroke="`url(#hero-ray-${ray.key})`"
                  stroke-width="2.6"
                  stroke-linecap="round"
                  pathLength="1"
                  stroke-dasharray="1"
                  stroke-dashoffset="1"
                  style="opacity: 0"
                />
              </g>
            </g>

            <circle
              v-for="ray in rays"
              :key="`dot-${ray.key}`"
              data-ray-dot
              :cx="ray.x2"
              :cy="ray.y2"
              r="2.4"
              :fill="ray.color"
              filter="url(#hero-glow)"
              style="opacity: 0"
            />

            <g class="font-display">
              <g v-for="ray in rays" :key="`l-${ray.key}`" data-ray-label style="opacity: 0">
                <line
                  x1="568"
                  x2="576"
                  :y1="ray.ly"
                  :y2="ray.ly"
                  :stroke="ray.color"
                  stroke-width="1.4"
                  stroke-opacity="0.55"
                />
                <text
                  x="584"
                  :y="ray.ly + 4"
                  class="text-[10px] uppercase tracking-[0.14em]"
                  :fill="ray.color"
                  fill-opacity="0.82"
                >
                  {{ ray.label }}
                </text>
              </g>
            </g>

            <!-- prisma -->
            <g data-prism style="opacity: 0; transform-origin: 300px 215px">
              <ellipse
                cx="300"
                cy="344"
                rx="78"
                ry="11"
                fill="#05091A"
                opacity="0.55"
                filter="url(#hero-shadow)"
              />
              <path d="M300 104 L404 322 L196 322 Z" fill="url(#hero-face)" />
              <path d="M300 104 L350 215 L196 322 Z" fill="url(#hero-facet-left)" />
              <path d="M300 104 L350 215 L404 322 Z" fill="url(#hero-facet-right)" />
              <ellipse
                cx="350"
                cy="215"
                rx="34"
                ry="22"
                fill="url(#hero-caustic)"
                opacity="0.8"
                filter="url(#hero-glow)"
              />
              <path
                d="M300 104 L404 322 L196 322 Z"
                fill="none"
                stroke="url(#hero-edge)"
                stroke-width="2.6"
                stroke-linejoin="round"
              />
              <path
                d="M300 104 L196 322"
                fill="none"
                stroke="url(#hero-edge-highlight)"
                stroke-width="1.2"
                stroke-linecap="round"
              />
              <path
                d="M300 104 L350 215 L404 322"
                fill="none"
                stroke="#FFFFFF"
                stroke-opacity="0.14"
                stroke-width="0.8"
              />
              <path
                d="M196 322 L350 215"
                fill="none"
                stroke="#FFFFFF"
                stroke-opacity="0.08"
                stroke-width="0.8"
              />
              <path
                d="M196 322 L404 322"
                stroke="url(#hero-edge)"
                stroke-width="0.8"
                stroke-opacity="0.25"
              />
              <circle
                cx="300"
                cy="104"
                r="2.4"
                fill="#FFFFFF"
                opacity="0.9"
                filter="url(#hero-glow)"
              />
            </g>

            <g data-core style="opacity: 0; transform-origin: 350px 215px">
              <circle cx="350" cy="215" r="18" fill="url(#hero-core)" filter="url(#hero-glow)" />
              <circle cx="350" cy="215" r="3.2" fill="#FFFFFF" />
            </g>

            <!-- anel pulsante -->
            <circle
              cx="350"
              cy="215"
              r="16"
              fill="none"
              stroke="#B794FF"
              stroke-opacity="0.5"
              class="animate-pulse-ring"
              style="transform-origin: 350px 215px"
            />
            <circle
              cx="350"
              cy="215"
              r="28"
              fill="none"
              stroke="url(#hero-edge)"
              stroke-opacity="0.24"
              class="animate-pulse-ring"
              style="transform-origin: 350px 215px; animation-delay: 1.6s"
            />
          </svg>
        </div>
      </div>
    </div>
  </section>
</template>
