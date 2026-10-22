<script setup>
/**
 * MAPA DE POLARIZAÇÃO EM TEMPO REAL — o moat do PRISMA.
 * Mapa real do Brasil (OpenStreetMap) com as 27 UFs coloridas pelo tema
 * dominante da cobertura, pelo índice de polarização ou por um tema específico.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { BRAZIL_STATES } from '@/data/geo/brazil-states'
import { POLARIZATION_THEMES, STATES } from '@/data'
import { maxThemeShare, stateStyle, ufLabel } from '@/lib/mapdata'

const props = defineProps({
  /** 'dominante' | 'polarizacao' | chave de tema */
  mode: { type: String, default: 'dominante' },
  /** Dados por UF; o padrão mantém a landing independente do backend. */
  states: { type: Array, default: () => STATES },
  compact: { type: Boolean, default: false },
  interactive: { type: Boolean, default: true },
})

const emit = defineEmits(['select'])

const container = ref(null)
const hovered = ref(null)

/**
 * Base cartográfica do OpenStreetMap. No tema escuro a camada de tiles
 * recebe um filtro no CSS (ver `main.css`), preservando os dados do OSM.
 */
const TILE_CONFIG = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}

let map = null
let tiles = null
let observer = null
/** Camada de uma UF por sigla. */
const layers = new Map()

/** Redesenha o mapa quando o container muda de tamanho. */
function handleResize() {
  map?.invalidateSize()
}

const byUf = computed(() => new Map(props.states.map((s) => [s.uf, s])))
const maxShare = computed(() => maxThemeShare(props.states, props.mode))
const hoveredState = computed(() =>
  hovered.value ? (byUf.value.get(hovered.value) ?? null) : null,
)
const hoveredThemes = computed(() => {
  if (!hoveredState.value) return []
  return POLARIZATION_THEMES.map((t) => ({
    ...t,
    value: hoveredState.value.themes?.[t.key] ?? 0,
  })).sort((a, b) => b.value - a.value)
})

/** Estilo de preenchimento da UF no modo atual. */
function styleFor(uf) {
  const state = byUf.value.get(uf)
  if (!state) {
    return { color: '#3A4468', weight: 1, fillColor: '#1B2440', fillOpacity: 0.55 }
  }
  const { color, fillOpacity } = stateStyle(state, props.mode, maxShare.value)
  return { color, weight: 1.2, fillColor: color, fillOpacity }
}

/** Reaplica cores, opacidades e rótulos quando o modo ou os dados mudam. */
function refreshLayers() {
  layers.forEach((layer, uf) => {
    layer.setStyle(styleFor(uf))
    const state = byUf.value.get(uf)
    if (state) {
      layer.setTooltipContent(ufLabel(state, props.mode, maxShare.value))
    }
  })
}

function handleSelect(state) {
  if (!props.interactive) return
  emit('select', state)
}

function buildMap() {
  if (!container.value || map) return
  // Sem dimensões reais não há mapa: evita erros em ambientes sem layout (testes).
  if (!container.value.clientWidth) return

  map = L.map(container.value, {
    center: [-13, -52],
    zoom: 4,
    minZoom: 3,
    maxZoom: 8,
    zoomControl: false,
    attributionControl: true,
    scrollWheelZoom: false,
    maxBounds: [
      [-40, -85],
      [10, -25],
    ],
    maxBoundsViscosity: 0.6,
  })

  // O painel de hover ocupa o canto superior direito; o zoom fica embaixo à esquerda.
  L.control.zoom({ position: 'bottomleft' }).addTo(map)
  setTiles()

  const geoLayer = L.geoJSON(BRAZIL_STATES, {
    style: (feature) => styleFor(feature.properties.sigla),
    onEachFeature: (feature, layer) => {
      const uf = feature.properties.sigla
      layers.set(uf, layer)

      layer.bindTooltip('', {
        permanent: true,
        direction: 'center',
        className: 'prisma-uf-label',
        interactive: false,
      })

      layer.on('mouseover', () => {
        if (!props.interactive) return
        hovered.value = uf
        layer.setStyle({
          weight: 2.4,
          fillOpacity: Math.min(0.95, styleFor(uf).fillOpacity + 0.12),
        })
      })

      layer.on('mouseout', () => {
        if (!props.interactive) return
        hovered.value = null
        layer.setStyle(styleFor(uf))
      })

      layer.on('click', () => {
        const state = byUf.value.get(uf)
        if (state) handleSelect(state)
      })
    },
  }).addTo(map)

  // Enquadra o território brasileiro no container do mapa.
  map.fitBounds(geoLayer.getBounds(), { padding: [8, 8] })

  refreshLayers()
}

function setTiles() {
  if (!map) return
  if (tiles) map.removeLayer(tiles)
  tiles = L.tileLayer(TILE_CONFIG.url, {
    attribution: TILE_CONFIG.attribution,
    maxZoom: 19,
  }).addTo(map)
  tiles.bringToBack()
}

onMounted(() => {
  buildMap()
  // Container sem largura (seção ainda oculta) espera ganhar dimensões.
  if (!map && container.value && typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(() => {
      if (!map && container.value?.clientWidth) {
        observer?.disconnect()
        observer = null
        buildMap()
      }
    })
    observer.observe(container.value)
  }
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  window.removeEventListener('resize', handleResize)
  layers.clear()
  if (map) {
    map.remove()
    map = null
  }
})

watch(() => props.mode, refreshLayers)
watch(() => props.states, refreshLayers, { deep: true })
</script>

<template>
  <div
    class="relative w-full overflow-hidden rounded-2xl border border-hairline bg-surface"
    :class="compact ? 'h-80' : 'h-[32rem] lg:h-[36rem]'"
  >
    <div
      ref="container"
      class="h-full w-full"
      role="img"
      aria-label="Mapa do Brasil com as unidades federativas coloridas conforme o tema dominante da cobertura"
    />

    <!-- painel de informações do estado sob o cursor -->
    <div
      v-if="hoveredState && !compact"
      class="pointer-events-none absolute top-0 right-0 z-[500] w-56 rounded-2xl glass p-4 text-left"
    >
      <p class="font-display text-sm font-semibold">{{ hoveredState.name }}</p>
      <p class="mt-1 text-xs text-ink-muted">{{ hoveredState.outlets }} veículos monitorados</p>
      <div class="mt-3 space-y-1.5">
        <div
          v-for="theme in hoveredThemes"
          :key="theme.key"
          class="flex items-center gap-2 text-[0.7rem]"
        >
          <span class="h-1.5 w-1.5 rounded-full" :style="{ background: theme.color }" />
          <span class="flex-1 text-ink-muted">{{ theme.label }}</span>
          <span class="font-display font-semibold">{{ theme.value }}%</span>
        </div>
      </div>
      <p class="mt-3 border-t border-hairline pt-2 text-[0.7rem] text-ink-muted">
        Polarização: <strong class="text-ink">{{ hoveredState.polarization }}</strong> / 100
      </p>
    </div>
  </div>
</template>
