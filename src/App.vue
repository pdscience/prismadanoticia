<script setup>
import { RouterView } from 'vue-router'

import AppFooter from '@/components/layout/AppFooter.vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import { useTheme } from '@/composables/useTheme'

useTheme()
</script>

<template>
  <div class="relative min-h-screen">
    <!-- atmosfera de fundo -->
    <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div class="absolute inset-0 prism-grid opacity-70" />
      <div
        class="absolute -top-32 left-[8%] h-[420px] w-[420px] rounded-full bg-electric/18 blur-[130px]"
      />
      <div
        class="absolute top-[18%] right-[4%] h-[380px] w-[380px] rounded-full bg-prism/18 blur-[130px]"
      />
      <div
        class="absolute bottom-[6%] left-[36%] h-[320px] w-[320px] rounded-full bg-insight/10 blur-[130px]"
      />
    </div>

    <a
      href="#conteudo"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-electric focus:px-4 focus:py-2 focus:text-sm focus:text-white"
    >
      Ir para o conteúdo
    </a>

    <AppNavbar />

    <main id="conteudo" class="pt-24">
      <RouterView v-slot="{ Component }">
        <Transition name="route-fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <AppFooter />
  </div>
</template>
