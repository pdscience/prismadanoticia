<script setup>
import BrandLogo from '@/components/brand/BrandLogo.vue'
import PButton from '@/components/ui/PButton.vue'
</script>

<template>
  <div
    class="container-prisma flex min-h-[60vh] flex-col items-center justify-center py-20 text-center"
  >
    <BrandLogo variant="icon" :size="72" animated />

    <p class="mt-8 font-display text-6xl font-semibold text-gradient">404</p>
    <h1 class="mt-4 text-2xl sm:text-3xl">Este ângulo não existe.</h1>
    <p class="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
      A página que você procurou não foi encontrada — mas a notícia continua lá, esperando ser
      analisada por outro ângulo.
    </p>

    <div class="mt-9 flex flex-wrap justify-center gap-3">
      <PButton to="/">Voltar ao início</PButton>
      <PButton to="/analise" variant="outline">Analisar uma notícia</PButton>
    </div>
  </div>
</template>
