<script setup>
import { RouterLink } from 'vue-router'

import BrandLogo from '@/components/brand/BrandLogo.vue'

const groups = [
  {
    title: 'Produto',
    links: [
      { to: '/analise', label: 'Análise · DNA da Notícia' },
      { to: '/comparacao', label: 'Comparação Inteligente' },
      { to: '/blindspot', label: 'BlindSpot Brasil' },
      { to: '/replay', label: 'Prisma Replay' },
    ],
  },
  {
    title: 'Inteligência',
    links: [
      { to: '/mapa', label: 'Mapa de Polarização' },
      { to: '/tecnologia', label: 'Prisma Engine' },
      { to: '/tecnologia#banco', label: 'Banco Inteligente' },
      { to: '/tecnologia#extensao', label: 'Extensão Chrome' },
    ],
  },
  {
    title: 'Marca',
    links: [
      { to: '/marca', label: 'Brand Book' },
      { to: '/marca#paleta', label: 'Paleta Premium' },
      { to: '/marca#logo', label: 'Logo oficial' },
      { to: '/marca#pitch', label: 'Pitch Deck' },
    ],
  },
]

const year = new Date().getFullYear()
</script>

<template>
  <footer class="relative mt-32 overflow-hidden border-t border-hairline">
    <div
      class="pointer-events-none absolute -top-40 left-1/2 h-80 w-[120%] -translate-x-1/2 rounded-full bg-prism/12 blur-[120px]"
    />

    <div class="container-prisma relative py-16">
      <div class="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
        <div class="space-y-5">
          <BrandLogo variant="horizontal" :size="40" tagline />
          <p class="max-w-sm text-sm leading-relaxed text-ink-muted">
            A notícia não muda. O que muda é o ângulo pelo qual ela é apresentada.
          </p>
          <p class="text-xs uppercase tracking-[0.24em] text-ink-muted">
            MediaTech · AI · News Intelligence
          </p>
          <a
            href="https://prismadanoticia.com.br"
            class="inline-flex items-center gap-2 text-sm text-electric-soft transition-opacity hover:opacity-80"
          >
            prismadanoticia.com.br
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </a>
        </div>

        <div class="grid gap-8 sm:grid-cols-3">
          <div v-for="group in groups" :key="group.title">
            <h3 class="mb-4 text-xs font-medium uppercase tracking-[0.24em] text-ink-muted">
              {{ group.title }}
            </h3>
            <ul class="space-y-2.5">
              <li v-for="link in group.links" :key="link.to + link.label">
                <RouterLink
                  :to="link.to"
                  class="text-sm text-ink-muted transition-colors hover:text-ink"
                >
                  {{ link.label }}
                </RouterLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div
        class="mt-14 flex flex-col items-start justify-between gap-4 border-t border-hairline pt-6 text-xs text-ink-muted sm:flex-row sm:items-center"
      >
        <p>© {{ year }} Prisma da Notícia. Todos os ângulos reservados.</p>
        <p class="flex items-center gap-2">
          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" />
          Engine operando · dados de demonstração
        </p>
      </div>
    </div>
  </footer>
</template>
