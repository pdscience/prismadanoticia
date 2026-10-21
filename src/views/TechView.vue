<script setup>
/**
 * TECNOLOGIA — Brand Book Cap. 8 (Arquitetura), Cap. 9 (Prisma Engine),
 * Cap. 10 (Banco Inteligente), Cap. 11 (Aplicativo) e Cap. 12 (Extensão Chrome).
 */
import PBadge from '@/components/ui/PBadge.vue'
import PButton from '@/components/ui/PButton.vue'
import PCard from '@/components/ui/PCard.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import {
  APP_FEATURES,
  DB_TABLES,
  ENGINE_PIPELINE,
  EXTENSION_PANELS,
  STACK,
} from '@/data/prisma'
import { useReveal } from '@/composables/useReveal'

const { root } = useReveal()
</script>

<template>
  <div ref="root" class="pb-10">
    <div class="container-prisma">
      <header class="mx-auto max-w-3xl text-center">
        <PBadge color="#2D6BFF" dot>Arquitetura Premium</PBadge>
        <h1 class="mt-6 text-4xl leading-tight sm:text-5xl">
          A tecnologia que lê <span class="text-gradient">o noticiário.</span>
        </h1>
        <p class="mx-auto mt-4 max-w-xl text-base text-ink-muted">
          Um pipeline proprietário que reduz custos de IA ao separar o trabalho determinístico do
          trabalho generativo.
        </p>
      </header>

      <!-- Stack -->
      <section class="mt-16">
        <div class="grid gap-5 md:grid-cols-3">
          <PCard v-for="group in STACK" :key="group.group" :accent="group.accent" data-reveal>
            <h2 class="font-display text-sm uppercase tracking-[0.22em]" :style="{ color: group.accent }">
              {{ group.group }}
            </h2>
            <ul class="mt-5 space-y-2.5">
              <li v-for="item in group.items" :key="item" class="flex items-center gap-3 text-sm">
                <span class="h-1.5 w-1.5 rounded-full" :style="{ background: group.accent }" />
                {{ item }}
              </li>
            </ul>
          </PCard>
        </div>
      </section>

      <!-- Prisma Engine -->
      <section id="engine" class="mt-24">
        <SectionHeading
          eyebrow="Cap. 9 · Prisma Engine"
          title="O pipeline em"
          highlight="seis etapas."
          description="Cada etapa entrega um artefato reutilizável. Isso evita reprocessar a mesma notícia e reduz o custo de IA por análise."
        />

        <div class="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PCard
            v-for="step in ENGINE_PIPELINE"
            :key="step.step"
            accent="#8B5CF6"
            data-reveal
            class="flex flex-col"
          >
            <div class="flex items-center justify-between">
              <span
                class="grid h-9 w-9 place-items-center rounded-xl bg-prism/15 font-display text-sm font-semibold text-prism-soft"
              >
                {{ step.step }}
              </span>
              <span class="rounded-full border border-hairline px-2.5 py-0.5 text-[0.62rem] text-ink-muted">
                {{ step.tech }}
              </span>
            </div>
            <h3 class="mt-5 text-lg">{{ step.title }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-ink-muted">{{ step.detail }}</p>
          </PCard>
        </div>

        <PCard data-reveal accent="#2EE6A8" class="mt-5">
          <div class="flex flex-wrap items-center gap-6">
            <span class="grid h-11 w-11 place-items-center rounded-xl bg-mint/15 text-mint">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" />
              </svg>
            </span>
            <p class="flex-1 text-sm leading-relaxed text-ink-muted">
              <strong class="text-ink">Por que isso importa.</strong>
              Embeddings e clusters são calculados uma única vez por notícia. As análises seguintes
              reaproveitam o cluster — o custo cai a cada veículo novo que entra no mesmo fato.
            </p>
          </div>
        </PCard>
      </section>

      <!-- Banco inteligente -->
      <section id="banco" class="mt-24 scroll-mt-28">
        <SectionHeading
          eyebrow="Cap. 10 · Banco Inteligente"
          title="Seis tabelas"
          highlight="principais."
          description="Modelo enxuto no PostgreSQL, com pgvector nas notícias e agregações materializadas para o mapa."
        />

        <div class="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PCard v-for="table in DB_TABLES" :key="table.name" accent="#6F9BFF" data-reveal>
            <div class="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6F9BFF" stroke-width="1.7">
                <ellipse cx="12" cy="6" rx="7.5" ry="3" />
                <path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
              </svg>
              <code class="font-display text-base font-medium text-electric-soft">{{ table.name }}</code>
            </div>
            <p class="mt-4 text-sm leading-relaxed text-ink-muted">{{ table.purpose }}</p>
            <div class="mt-4 flex flex-wrap gap-1.5">
              <span
                v-for="field in table.fields"
                :key="field"
                class="rounded-md bg-ink/6 px-2 py-0.5 font-mono text-[0.65rem] text-ink-muted"
              >
                {{ field }}
              </span>
            </div>
          </PCard>
        </div>
      </section>

      <!-- Aplicativo -->
      <section id="app" class="mt-24 scroll-mt-28">
        <div class="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Cap. 11 · Aplicativo"
              title="Um PWA que parece"
              highlight="nativo."
              description="Instalável, rápido e funcional mesmo sem rede. O service worker guarda suas últimas análises."
            />
            <div class="mt-8 grid gap-4 sm:grid-cols-2">
              <div
                v-for="f in APP_FEATURES"
                :key="f.title"
                data-reveal
                class="rounded-2xl border border-hairline p-4"
              >
                <p class="font-display text-sm font-medium">{{ f.title }}</p>
                <p class="mt-1.5 text-xs leading-relaxed text-ink-muted">{{ f.detail }}</p>
              </div>
            </div>
          </div>

          <!-- mockup de telefone -->
          <div data-reveal class="flex justify-center">
            <div
              class="relative w-[280px] rounded-[2.5rem] border border-hairline-strong bg-midnight p-3 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)]"
            >
              <div class="mx-auto mb-2 h-1.5 w-16 rounded-full bg-white/15" />
              <div class="space-y-3 rounded-[2rem] bg-midnight-800 p-4">
                <div class="flex items-center justify-between">
                  <span class="font-display text-xs text-white">PRISMA</span>
                  <span class="h-1.5 w-1.5 rounded-full bg-mint" />
                </div>
                <div class="rounded-2xl border border-white/10 bg-white/4 p-3">
                  <p class="text-[0.6rem] uppercase tracking-widest text-white/45">Confiança</p>
                  <p class="mt-1 font-display text-2xl text-white">82</p>
                  <div class="mt-2 h-1 rounded-full bg-white/10">
                    <div class="h-full w-[82%] rounded-full bg-linear-to-r from-mint to-electric" />
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-2">
                  <div
                    v-for="m in [
                      { l: 'Emoção', v: 41, c: '#FF3B5C' },
                      { l: 'Fontes', v: 68, c: '#2D6BFF' },
                      { l: 'Evid.', v: 91, c: '#2EE6A8' },
                    ]"
                    :key="m.l"
                    class="rounded-xl border border-white/10 bg-white/4 p-2 text-center"
                  >
                    <p class="font-display text-sm" :style="{ color: m.c }">{{ m.v }}</p>
                    <p class="text-[0.55rem] text-white/45">{{ m.l }}</p>
                  </div>
                </div>
                <div class="rounded-2xl border border-white/10 bg-white/4 p-3">
                  <p class="text-[0.6rem] uppercase tracking-widest text-white/45">Notificação</p>
                  <p class="mt-1 text-[0.68rem] leading-snug text-white/80">
                    A narrativa sobre “Reforma Tributária” mudou de ângulo nas últimas 6h.
                  </p>
                </div>
                <div class="flex justify-between rounded-2xl border border-white/10 bg-white/4 px-4 py-2.5">
                  <span v-for="i in 4" :key="i" class="h-1.5 w-1.5 rounded-full" :class="i === 1 ? 'bg-electric' : 'bg-white/20'" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Extensão -->
      <section id="extensao" class="mt-24 scroll-mt-28">
        <SectionHeading
          eyebrow="Cap. 12 · Extensão Chrome"
          title="Nosso maior canal"
          highlight="de crescimento."
          description="O usuário abre qualquer notícia e a barra lateral do Prisma aparece com a análise pronta."
        />

        <div class="mt-14 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <!-- mockup do navegador -->
          <PCard data-reveal accent="#6F9BFF" :padded="false">
            <div class="flex items-center gap-2 border-b border-hairline px-5 py-3">
              <span class="h-2.5 w-2.5 rounded-full bg-energy/70" />
              <span class="h-2.5 w-2.5 rounded-full bg-insight/70" />
              <span class="h-2.5 w-2.5 rounded-full bg-mint/70" />
              <div class="ml-4 flex-1 truncate rounded-full bg-ink/8 px-4 py-1.5 text-xs text-ink-muted">
                portal.com.br/politica/reforma-tributaria
              </div>
            </div>
            <div class="grid gap-4 p-5 sm:grid-cols-[1.4fr_1fr]">
              <div class="space-y-2.5">
                <div class="h-3 w-4/5 rounded-full bg-ink/10" />
                <div class="h-3 w-full rounded-full bg-ink/6" />
                <div class="h-3 w-11/12 rounded-full bg-ink/6" />
                <div class="h-3 w-3/4 rounded-full bg-ink/6" />
                <div class="mt-5 h-28 rounded-xl bg-ink/6" />
                <div class="h-3 w-full rounded-full bg-ink/6" />
                <div class="h-3 w-5/6 rounded-full bg-ink/6" />
              </div>
              <div class="rounded-2xl border border-prism/30 bg-prism/8 p-4">
                <p class="font-display text-xs uppercase tracking-[0.2em] text-prism-soft">Prisma</p>
                <ul class="mt-4 space-y-3">
                  <li v-for="panel in EXTENSION_PANELS" :key="panel.title" class="border-b border-hairline pb-3 last:border-0 last:pb-0">
                    <p class="text-xs font-medium text-ink">{{ panel.title }}</p>
                    <p class="mt-1 text-[0.65rem] leading-snug text-ink-muted">{{ panel.detail }}</p>
                  </li>
                </ul>
              </div>
            </div>
          </PCard>

          <PCard data-reveal accent="#8B5CF6" class="flex flex-col justify-center">
            <h3 class="text-xl">Crescimento por hábito</h3>
            <p class="mt-3 text-sm leading-relaxed text-ink-muted">
              A extensão coloca o Prisma no fluxo natural de leitura. Cada análise feita na barra
              lateral alimenta os clusters e melhora o mapa nacional.
            </p>
            <ul class="mt-6 space-y-3 text-sm text-ink-muted">
              <li v-for="item in ['Zero atrito: não exige sair do site', 'Onboarding dentro da própria notícia', 'Dados agregados fortalecem o moat']" :key="item" class="flex items-start gap-3">
                <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-prism-soft" />
                {{ item }}
              </li>
            </ul>
            <PButton to="/analise" class="mt-8" size="sm">Testar no site</PButton>
          </PCard>
        </div>
      </section>
    </div>
  </div>
</template>
