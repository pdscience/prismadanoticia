<script setup>
/** Recursos-assinatura: Comparação, BlindSpot, Replay, Mapa, App e Extensão. */
import PBadge from '@/components/ui/PBadge.vue'
import PCard from '@/components/ui/PCard.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { useReveal } from '@/composables/useReveal'

const { root } = useReveal()

const features = [
  {
    to: '/comparacao',
    tag: 'Cap. 5',
    title: 'Comparação Inteligente',
    text: 'Pesquise um tema e veja, lado a lado, qual destaque cada veículo escolheu para o mesmo fato.',
    accent: '#2D6BFF',
    badge: null,
  },
  {
    to: '/blindspot',
    tag: 'Cap. 6',
    title: 'BlindSpot Brasil',
    text: 'Quem deixou esse tema de fora? A ausência de cobertura é medida sempre dentro de um período definido.',
    accent: '#FF3B5C',
    badge: 'Marca registrada',
  },
  {
    to: '/replay',
    tag: 'Cap. 7',
    title: 'Prisma Replay',
    text: 'Assista à evolução da narrativa quadro a quadro. É quase um Google Maps da notícia.',
    accent: '#FFC24B',
    badge: null,
  },
  {
    to: '/mapa',
    tag: 'Moat',
    title: 'Mapa de Polarização',
    text: 'Inteligência nacional sobre narrativas: temas dominantes e enquadramentos por estado, em tempo real.',
    accent: '#8B5CF6',
    badge: 'Exclusivo',
  },
  {
    to: '/tecnologia#app',
    tag: 'Cap. 11',
    title: 'Aplicativo PWA',
    text: 'Modo escuro, notificações, favoritos e leitura offline com a sensação de app nativo.',
    accent: '#2EE6A8',
    badge: null,
  },
  {
    to: '/tecnologia#extensao',
    tag: 'Cap. 12',
    title: 'Extensão Chrome',
    text: 'Abra qualquer notícia e veja o DNA, a comparação e a linha do tempo na barra lateral.',
    accent: '#6F9BFF',
    badge: null,
  },
]
</script>

<template>
  <section ref="root" class="relative py-24">
    <div class="container-prisma">
      <SectionHeading
        eyebrow="O produto"
        title="Não é só análise."
        highlight="É inteligência de narrativa."
        description="Cada módulo do Prisma responde uma pergunta diferente sobre a mesma notícia."
      />

      <div class="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <RouterLink v-for="f in features" :key="f.title" :to="f.to" data-reveal class="block">
          <PCard :accent="f.accent" class="h-full">
            <div class="flex items-center justify-between gap-2">
              <span class="font-display text-[0.68rem] uppercase tracking-[0.22em] text-ink-muted">
                {{ f.tag }}
              </span>
              <PBadge v-if="f.badge" :color="f.accent">{{ f.badge }}</PBadge>
            </div>

            <h3 class="mt-5 text-xl">{{ f.title }}</h3>
            <p class="mt-2.5 text-sm leading-relaxed text-ink-muted">{{ f.text }}</p>

            <span
              class="mt-6 inline-flex items-center gap-2 text-sm font-medium transition-transform duration-300 group-hover:translate-x-1"
              :style="{ color: f.accent }"
            >
              Explorar
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M5 12h13M13 6l6 6-6 6" />
              </svg>
            </span>
          </PCard>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
