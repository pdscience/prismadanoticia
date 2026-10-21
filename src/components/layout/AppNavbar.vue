<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import BrandLogo from '@/components/brand/BrandLogo.vue'
import PButton from '@/components/ui/PButton.vue'
import { useTheme } from '@/composables/useTheme'

const route = useRoute()
const { theme, toggle } = useTheme()

const scrolled = ref(false)
const open = ref(false)

const links = [
  { to: '/analise', label: 'Análise' },
  { to: '/vies', label: 'Enquadramento' },
  { to: '/comparacao', label: 'Comparação' },
  { to: '/cobertura', label: 'Cobertura' },
  { to: '/blindspot', label: 'BlindSpot' },
  { to: '/replay', label: 'Replay' },
  { to: '/mapa', label: 'Mapa' },
  { to: '/tecnologia', label: 'Tecnologia' },
]

function onScroll() {
  scrolled.value = window.scrollY > 24
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-all duration-500"
    :class="scrolled ? 'py-2' : 'py-4'"
  >
    <div class="container-prisma">
      <nav
        class="flex items-center justify-between gap-4 rounded-full px-4 py-2.5 transition-all duration-500"
        :class="
          scrolled ? 'glass shadow-[0_20px_50px_-30px_rgba(0,0,0,0.9)]' : 'border-transparent'
        "
      >
        <RouterLink to="/" class="group shrink-0" aria-label="Prisma da Notícia — início">
          <BrandLogo variant="horizontal" :size="34" animated />
        </RouterLink>

        <ul class="hidden items-center gap-1 xl:flex">
          <li v-for="link in links" :key="link.to">
            <RouterLink
              :to="link.to"
              class="relative rounded-full px-3.5 py-2 text-sm transition-colors duration-300"
              :class="route.path === link.to ? 'text-ink' : 'text-ink-muted hover:text-ink'"
            >
              {{ link.label }}
              <span
                v-if="route.path === link.to"
                class="absolute inset-x-3 -bottom-0.5 h-px bg-linear-to-r from-transparent via-electric-soft to-transparent"
              />
            </RouterLink>
          </li>
        </ul>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="grid h-9 w-9 place-items-center rounded-full border border-hairline text-ink-muted transition-colors hover:text-ink"
            :aria-label="theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'"
            @click="toggle"
          >
            <svg
              v-if="theme === 'dark'"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <circle cx="12" cy="12" r="4.2" />
              <path
                d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"
                stroke-linecap="round"
              />
            </svg>
            <svg
              v-else
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path
                d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <PButton to="/analise" size="md" class="hidden sm:inline-flex">
            <span class="whitespace-nowrap text-xs">Analisar uma notícia</span>
          </PButton>

          <button
            type="button"
            class="grid h-9 w-9 place-items-center rounded-full border border-hairline text-ink xl:hidden"
            aria-label="Abrir menu"
            @click="open = !open"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            >
              <path v-if="!open" d="M4 7h16M4 12h16M4 17h16" />
              <path v-else d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </nav>

      <!-- menu mobile -->
      <Transition name="route-fade">
        <div v-if="open" class="mt-2 overflow-hidden rounded-3xl glass p-3 xl:hidden">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="block rounded-2xl px-4 py-3 text-sm transition-colors"
            :class="route.path === link.to ? 'bg-electric/12 text-ink' : 'text-ink-muted'"
            @click="open = false"
          >
            {{ link.label }}
          </RouterLink>
          <PButton to="/analise" block class="mt-2" @click="open = false">
            Analisar uma notícia
          </PButton>
        </div>
      </Transition>
    </div>
  </header>
</template>
