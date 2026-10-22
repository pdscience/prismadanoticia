<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import CoverageBar from '@/components/cobertura/CoverageBar.vue'
import CoverageBlindspot from '@/components/cobertura/CoverageBlindspot.vue'
import CoverageSide from '@/components/cobertura/CoverageSide.vue'
import PBadge from '@/components/ui/PBadge.vue'
import PButton from '@/components/ui/PButton.vue'
import PCard from '@/components/ui/PCard.vue'
import { fetchCoverage } from '@/lib/services'

const route = useRoute()
const router = useRouter()

const input = ref(String(route.query.url || ''))
const coverage = ref(null)
const loading = ref(false)
const error = ref('')

const hasQuery = computed(() => Boolean(route.query.url || route.query.cluster))
const analyzeLink = computed(() => {
  const url = route.query.url ? String(route.query.url) : coverage.value?.story?.url
  return { name: 'analysis', query: url ? { url } : {} }
})

const storyDate = computed(() => {
  const value = coverage.value?.story?.published_at
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
})

async function load() {
  if (!hasQuery.value) {
    coverage.value = null
    error.value = ''
    return
  }

  loading.value = true
  error.value = ''
  try {
    coverage.value = await fetchCoverage({
      url: route.query.url ? String(route.query.url) : undefined,
      clusterId: route.query.cluster ? String(route.query.cluster) : undefined,
    })
  } catch (cause) {
    coverage.value = null
    error.value = cause instanceof Error ? cause.message : 'Não foi possível carregar a cobertura.'
  } finally {
    loading.value = false
  }
}

function submit() {
  const url = input.value.trim()
  if (!url) return
  if (String(route.query.url || '') === url) {
    load()
    return
  }
  router.replace({ name: 'coverage', query: { url } })
}

watch(() => `${route.query.url ?? ''}|${route.query.cluster ?? ''}`, load)
onMounted(load)
</script>

<template>
  <div class="pb-10">
    <div class="container-prisma">
      <header class="mx-auto max-w-3xl text-center">
        <PBadge color="#6F9BFF" dot pulse>Prisma Cobertura</PBadge>
        <h1 class="mt-6 text-4xl leading-tight sm:text-5xl">Cobertura da História</h1>
        <p class="mt-4 text-sm leading-relaxed text-ink-muted">
          Veja como veículos diferentes cobriram o mesmo fato e qual lado ficou de fora.
        </p>
        <form class="mx-auto mt-6 flex max-w-xl gap-2" @submit.prevent="submit">
          <input
            v-model="input"
            type="url"
            placeholder="URL de uma matéria já analisada"
            class="h-10 w-full rounded-full border border-hairline bg-surface/60 px-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-electric-soft"
          />
          <PButton type="submit" size="md">Ver cobertura</PButton>
        </form>
      </header>

      <PCard v-if="loading" class="mt-8" :hover="false">
        <p class="text-sm text-ink-muted">Carregando cobertura...</p>
      </PCard>

      <PCard v-else-if="error" class="mt-8" :hover="false">
        <p class="text-sm font-medium text-ink">{{ error }}</p>
        <PButton :to="analyzeLink" variant="outline" size="sm" class="mt-4">
          Analisar matéria
        </PButton>
      </PCard>

      <PCard v-else-if="!hasQuery" class="mt-8" :hover="false">
        <p class="text-sm font-medium text-ink">Abra uma matéria já analisada.</p>
        <p class="mt-2 text-xs leading-relaxed text-ink-muted">
          Cole a URL acima ou chegue aqui pelo card de perspectivas de uma análise.
        </p>
      </PCard>

      <template v-else-if="coverage && coverage.totalOutlets">
        <PCard class="mt-8" :hover="false">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="max-w-3xl">
              <p class="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-ink-muted">
                {{ coverage.story?.topic || 'História' }}
              </p>
              <h2 class="mt-2 text-2xl leading-tight">{{ coverage.story?.title }}</h2>
              <p class="mt-2 text-xs text-ink-muted">
                {{ coverage.story?.outlet }} · {{ storyDate }}
                <template v-if="coverage.story?.cluster_size">
                  · cluster com {{ coverage.story.cluster_size }} matérias
                </template>
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <PButton :to="analyzeLink" variant="outline" size="sm">DNA</PButton>
              <PButton
                v-if="coverage.story?.url"
                :to="{ name: 'bias', query: { url: coverage.story.url } }"
                variant="outline"
                size="sm"
              >
                Enquadramento
              </PButton>
            </div>
          </div>

          <CoverageBar :coverage="coverage" class="mt-6" />

          <div class="mt-4 flex flex-wrap gap-2">
            <PBadge v-if="!coverage.sampleReliable" color="#FFC24B">Amostra pequena</PBadge>
            <PBadge v-if="coverage.totalUncertain" color="#2EE6A8">
              {{ coverage.totalUncertain }} incerta{{ coverage.totalUncertain > 1 ? 's' : '' }}
            </PBadge>
          </div>

          <CoverageBlindspot
            v-if="coverage.blindspot"
            :blindspot="coverage.blindspot"
            :total-classified="coverage.totalClassified"
          />
        </PCard>

        <div class="mt-5 grid gap-4 lg:grid-cols-3">
          <CoverageSide v-for="side in coverage.sides" :key="side.key" :side="side" />
        </div>

        <PCard v-if="coverage.totalUncertain" class="mt-5" :hover="false">
          <p class="text-sm font-medium text-ink">Incertas / mistas</p>
          <p class="mt-1 text-xs text-ink-muted">
            Fora da barra principal para não forçar um lado.
          </p>
          <ul class="mt-3 space-y-2">
            <li v-for="item in coverage.uncertain.rows" :key="item.news_id" class="text-xs">
              <RouterLink
                :to="{ name: 'bias', query: { url: item.url } }"
                class="text-ink-muted hover:text-ink"
              >
                {{ item.title }} · {{ item.outlet }}
              </RouterLink>
            </li>
          </ul>
        </PCard>

        <p class="mt-6 border-t border-hairline pt-4 text-xs leading-relaxed text-ink-muted">
          A barra usa o enquadramento estimado de cada texto, com um veículo por vez. O rating
          curado do veículo é contexto e pode estar ausente. Esta leitura não é checagem de fatos,
          ranking de qualidade nem prova de equilíbrio editorial.
        </p>
      </template>

      <PCard v-else-if="coverage" class="mt-8" :hover="false">
        <p class="text-sm font-medium text-ink">Ainda não há cobertura comparável.</p>
        <p class="mt-2 text-xs leading-relaxed text-ink-muted">
          O cluster pode ter apenas esta matéria analisada. A distribuição aparecerá quando houver
          outros veículos com análise de enquadramento.
        </p>
        <PButton :to="{ name: 'compare' }" variant="outline" size="sm" class="mt-4">
          Comparar por tema
        </PButton>
      </PCard>
    </div>
  </div>
</template>
