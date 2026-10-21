<script setup>
/**
 * PRISMA REPLAY — Brand Book Cap. 7
 * O usuário assiste à evolução da narrativa. É quase um "Google Maps da notícia".
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import PBadge from '@/components/ui/PBadge.vue'
import PButton from '@/components/ui/PButton.vue'
import PCard from '@/components/ui/PCard.vue'
import { REPLAY, frame } from '@/data/prisma'
import { useReveal } from '@/composables/useReveal'

const { root } = useReveal()

const frames = REPLAY.frames
const index = ref(0)
const playing = ref(false)
let timer = null

const currentFrame = computed(() => frames[index.value])
const maxOutlets = Math.max(...frames.map((f) => f.outlets))

// Enquadramentos da mistura, na ordem de exibição, lendo as cores canônicas.
const mixKeys = ['politica', 'economia', 'social', 'seguranca'].map((key) => ({
  key,
  ...frame(key),
}))

function stop() {
  playing.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function play() {
  if (playing.value) return stop()
  playing.value = true
  if (index.value >= frames.length - 1) index.value = 0
  timer = setInterval(() => {
    if (index.value >= frames.length - 1) return stop()
    index.value += 1
  }, 1800)
}

watch(index, (v) => {
  if (v >= frames.length - 1) stop()
})

onBeforeUnmount(stop)
</script>

<template>
  <div ref="root" class="pb-10">
    <div class="container-prisma">
      <header class="mx-auto max-w-3xl text-center">
        <PBadge color="#FFC24B" dot>Cap. 7 · Prisma Replay</PBadge>
        <h1 class="mt-6 text-4xl leading-tight sm:text-5xl">
          Assista à <span class="text-gradient">evolução da narrativa.</span>
        </h1>
        <p class="mx-auto mt-4 max-w-xl text-base text-ink-muted">
          Quadro a quadro, veja como um mesmo fato mudou de ângulo, ganhou veículos e trocou de
          enquadramento dominante.
        </p>
      </header>

      <!-- player -->
      <PCard data-reveal accent="#FFC24B" class="mt-12 p-8">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="grid h-12 w-12 place-items-center rounded-full bg-linear-to-br from-insight to-insight-soft text-midnight transition-transform hover:scale-105"
              :aria-label="playing ? 'Pausar' : 'Reproduzir'"
              @click="play"
            >
              <svg v-if="!playing" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
              <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
              </svg>
            </button>
            <div>
              <p class="font-display text-lg">{{ REPLAY.topic }}</p>
              <p class="text-xs text-ink-muted">
                Quadro {{ index + 1 }} de {{ frames.length }} · {{ currentFrame.time }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <PBadge color="#6F9BFF">{{ currentFrame.outlets }} veículos</PBadge>
            <PBadge color="#B794FF">{{ currentFrame.dominantFrame }}</PBadge>
            <PBadge color="#FF3B5C">{{ currentFrame.sentiment }}</PBadge>
          </div>
        </div>

        <!-- trilha -->
        <div class="mt-9">
          <input
            v-model.number="index"
            type="range"
            min="0"
            :max="frames.length - 1"
            step="1"
            class="w-full accent-insight"
            aria-label="Linha do tempo da narrativa"
            @input="stop"
          />
          <ol class="mt-4 grid gap-2" :style="`grid-template-columns: repeat(${frames.length}, minmax(0, 1fr))`">
            <li v-for="(f, i) in frames" :key="f.time">
              <button
                type="button"
                class="w-full rounded-xl border p-3 text-left transition-all duration-300"
                :class="
                  i === index
                    ? 'border-insight/60 bg-insight/10'
                    : i < index
                      ? 'border-hairline bg-surface'
                      : 'border-hairline opacity-55'
                "
                @click="((index = i), stop())"
              >
                <span class="block text-[0.62rem] uppercase tracking-[0.14em] text-ink-muted">
                  {{ f.time }}
                </span>
                <span class="mt-1 block text-xs font-medium leading-snug">{{ f.label }}</span>
              </button>
            </li>
          </ol>
        </div>
      </PCard>

      <!-- quadro atual -->
      <div class="mt-5 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <PCard data-reveal accent="#8B5CF6">
          <Transition name="route-fade" mode="out-in">
            <div :key="currentFrame.time">
              <h2 class="text-2xl">{{ currentFrame.label }}</h2>
              <p class="mt-4 text-sm leading-relaxed text-ink-muted">{{ currentFrame.description }}</p>

              <div class="mt-8">
                <p class="text-xs uppercase tracking-[0.2em] text-ink-muted">
                  Mistura de enquadramentos
                </p>
                <div class="mt-4 flex h-3 overflow-hidden rounded-full">
                  <div
                    v-for="m in mixKeys"
                    :key="m.key"
                    class="h-full transition-all duration-700"
                    :style="{ width: `${currentFrame.mix[m.key]}%`, background: m.color }"
                    :title="`${m.label}: ${currentFrame.mix[m.key]}%`"
                  />
                </div>
                <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div v-for="m in mixKeys" :key="`l-${m.key}`" class="flex items-center gap-2">
                    <span class="h-2 w-2 rounded-sm" :style="{ background: m.color }" />
                    <span class="text-xs text-ink-muted">{{ m.label }}</span>
                    <span class="font-display text-xs font-semibold">{{ currentFrame.mix[m.key] }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </PCard>

        <PCard data-reveal accent="#2D6BFF">
          <h2 class="text-lg">Expansão da cobertura</h2>
          <p class="mt-1.5 text-xs text-ink-muted">
            Veículos publicando sobre o tema em cada quadro.
          </p>

          <div class="mt-8 flex h-52 items-end gap-3">
            <div v-for="(f, i) in frames" :key="`bar-${f.time}`" class="flex flex-1 flex-col items-center gap-2">
              <span class="font-display text-xs font-semibold" :class="i === index ? 'text-ink' : 'text-ink-muted'">
                {{ f.outlets }}
              </span>
              <div
                class="w-full rounded-t-lg transition-all duration-700"
                :style="{
                  height: `${(f.outlets / maxOutlets) * 100}%`,
                  background:
                    i === index
                      ? 'linear-gradient(180deg, #6F9BFF, #2D6BFF)'
                      : 'linear-gradient(180deg, rgba(111,155,255,0.35), rgba(45,107,255,0.18))',
                }"
              />
              <span class="text-[0.6rem] text-ink-muted">{{ i + 1 }}</span>
            </div>
          </div>

          <p class="mt-6 border-t border-hairline pt-4 text-xs leading-relaxed text-ink-muted">
            A narrativa começou política, virou econômica e só depois incorporou o ângulo social — um
            padrão recorrente em pautas de tributação.
          </p>
        </PCard>
      </div>

      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <PButton to="/comparacao" variant="outline">Comparar veículos deste cluster</PButton>
        <PButton to="/blindspot" variant="ghost">Ver quem ficou de fora</PButton>
      </div>
    </div>
  </div>
</template>
