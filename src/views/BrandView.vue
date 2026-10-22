<script setup>
/**
 * BRAND BOOK — Cap. 1 (DNA da marca), Cap. 2 (Identidade visual) e Cap. 13 (Pitch Deck).
 */
import BrandLogo from '@/components/brand/BrandLogo.vue'
import PBadge from '@/components/ui/PBadge.vue'
import PCard from '@/components/ui/PCard.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { ARCHETYPES, PITCH_SLIDES } from '@/data'
import { useReveal } from '@/composables/useReveal'

const { root } = useReveal()

const palette = [
  { name: 'Midnight', hex: '#05091A', use: 'Fundo padrão da marca', core: true },
  { name: 'Electric Blue', hex: '#2D6BFF', use: 'Ação primária e dados', core: true },
  { name: 'Prism Purple', hex: '#8B5CF6', use: 'Inteligência e IA', core: true },
  { name: 'Energy Red', hex: '#FF3B5C', use: 'Alerta e sinais', core: true },
  { name: 'Insight Gold', hex: '#FFC24B', use: 'Descoberta e destaque', core: true },
  {
    name: 'Signal Mint',
    hex: '#2EE6A8',
    use: 'Cor de apoio: evidências sustentadas e estados de sucesso',
    core: false,
  },
]

const typography = [
  {
    use: 'Logo',
    font: 'Space Grotesk',
    sample: 'PRISMA da Notícia',
    className: 'font-display text-2xl',
  },
  {
    use: 'Títulos',
    font: 'Space Grotesk',
    sample: 'Toda notícia tem um ângulo.',
    className: 'font-display text-xl',
  },
  {
    use: 'Interface',
    font: 'Inter',
    sample: 'Cole um link e veja o DNA da notícia.',
    className: 'font-sans text-base',
  },
]

const versions = [
  { variant: 'horizontal', label: 'Horizontal', note: 'Uso principal: navegação e assinaturas.' },
  { variant: 'vertical', label: 'Vertical', note: 'Uso em espaços centralizados e social.' },
  { variant: 'icon', label: 'Ícone', note: 'Favicon, app icon e extensão.' },
]
</script>

<template>
  <div ref="root" class="pb-10">
    <div class="container-prisma">
      <header class="mx-auto max-w-3xl text-center">
        <PBadge color="#8B5CF6" dot>Brand Book Premium · V1.0</PBadge>
        <h1 class="mt-6 text-4xl leading-tight sm:text-5xl">
          Uma notícia. <span class="text-gradient">Vários ângulos.</span>
        </h1>
        <p class="mx-auto mt-4 max-w-xl text-base text-ink-muted">
          MediaTech · AI · News Intelligence — prismadanoticia.com.br
        </p>
      </header>

      <!-- Cap. 1 -->
      <section class="mt-20">
        <SectionHeading
          eyebrow="Cap. 1 · O DNA da Marca"
          title="O símbolo representa"
          highlight="uma ideia simples."
        />

        <PCard data-reveal accent="#8B5CF6" class="mt-12 p-10 text-center">
          <p class="font-display text-2xl leading-snug sm:text-3xl">
            A notícia não muda.<br />
            <span class="text-gradient">O que muda é o ângulo pelo qual ela é apresentada.</span>
          </p>
          <p class="mt-6 text-xs uppercase tracking-[0.24em] text-ink-muted">
            Coração da comunicação
          </p>
        </PCard>

        <div class="mt-5 grid gap-4 sm:grid-cols-3">
          <PCard v-for="a in ARCHETYPES" :key="a.name" :accent="a.accent" data-reveal>
            <h3 class="font-display text-xl" :style="{ color: a.accent }">{{ a.name }}</h3>
            <p class="mt-1 text-xs uppercase tracking-[0.2em] text-ink-muted">{{ a.word }}</p>
            <p class="mt-4 text-sm leading-relaxed text-ink-muted">{{ a.detail }}</p>
          </PCard>
        </div>

        <p data-reveal class="mt-6 text-center text-sm text-ink-muted">
          Os arquétipos posicionam o Prisma como uma empresa de tecnologia confiável.
        </p>
      </section>

      <!-- Cap. 2 — Logo -->
      <section id="logo" class="mt-24 scroll-mt-28">
        <SectionHeading
          eyebrow="Cap. 2 · Identidade Visual"
          title="Logo oficial em"
          highlight="três versões."
        />

        <div class="mt-12 grid gap-5 md:grid-cols-3">
          <PCard
            v-for="v in versions"
            :key="v.variant"
            data-reveal
            accent="#6F9BFF"
            class="text-center"
          >
            <div
              class="flex h-32 items-center justify-center rounded-2xl border border-hairline bg-midnight"
            >
              <BrandLogo
                :variant="v.variant"
                :size="v.variant === 'icon' ? 64 : 44"
                class="text-white"
              />
            </div>
            <p class="mt-5 font-display text-base">{{ v.label }}</p>
            <p class="mt-1.5 text-xs text-ink-muted">{{ v.note }}</p>
          </PCard>
        </div>
      </section>

      <!-- Cap. 2 — Paleta -->
      <section id="paleta" class="mt-24 scroll-mt-28">
        <SectionHeading
          eyebrow="Paleta Premium"
          title="Cinco cores,"
          highlight="uma refração."
          description="As cinco cores oficiais do brand book, mais uma cor de apoio para estados de sucesso."
        />

        <div class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="c in palette"
            :key="c.name"
            data-reveal
            class="overflow-hidden rounded-[var(--radius-card)] border border-hairline"
          >
            <div class="h-28" :style="{ background: c.hex }" />
            <div class="p-4">
              <div class="flex items-center justify-between gap-2">
                <p class="font-display text-sm font-medium">{{ c.name }}</p>
                <span
                  v-if="!c.core"
                  class="rounded-full border border-hairline px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-ink-muted"
                >
                  apoio
                </span>
              </div>
              <code class="mt-1 block font-mono text-xs text-ink-muted">{{ c.hex }}</code>
              <p class="mt-2.5 text-xs leading-relaxed text-ink-muted">{{ c.use }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Cap. 2 — Tipografia -->
      <section class="mt-24">
        <SectionHeading eyebrow="Tipografia" title="Space Grotesk" highlight="+ Inter." />

        <div class="mt-12 space-y-4">
          <PCard v-for="t in typography" :key="t.use" data-reveal accent="#FFC24B">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p class="text-[0.62rem] uppercase tracking-[0.24em] text-ink-muted">{{ t.use }}</p>
                <p class="mt-2" :class="t.className">{{ t.sample }}</p>
              </div>
              <code
                class="rounded-full border border-hairline px-3 py-1 font-mono text-xs text-ink-muted"
              >
                {{ t.font }}
              </code>
            </div>
          </PCard>
        </div>
      </section>

      <!-- Cap. 13 — Pitch Deck -->
      <section id="pitch" class="mt-24 scroll-mt-28">
        <SectionHeading
          eyebrow="Cap. 13 · Pitch Deck"
          title="Vinte slides"
          highlight="para investidores."
          description="A estrutura narrativa oficial da apresentação do Prisma da Notícia."
        />

        <div class="mt-12 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div
            v-for="(slide, i) in PITCH_SLIDES"
            :key="slide"
            data-reveal
            class="group flex items-center gap-3 rounded-2xl border border-hairline p-4 transition-colors hover:border-hairline-strong"
          >
            <span class="font-display text-xs text-ink-muted">
              {{ String(i + 1).padStart(2, '0') }}
            </span>
            <span class="text-sm font-medium">{{ slide }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
