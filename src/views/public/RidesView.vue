<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useHead } from '@unhead/vue'
import { useWindowSize } from '@vueuse/core'
import AppPage from '@/components/layout/AppPage.vue'
import BikeLoader from '@/components/ui/BikeLoader.vue'
import RideCard from '@/features/rides/components/RideCard.vue'
import RideFilters from '@/features/rides/components/RideFilters.vue'
import RideTimeframeTabs from '@/features/rides/components/RideTimeframeTabs.vue'
import Button from '@/components/ui/Button.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Typography from '@/components/ui/Typography.vue'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useRideFilters } from '@/features/rides/composables/useRideFilters'
import { useRideList } from '@/features/rides/composables/useRideList'
import type { Ride } from '@/features/rides/types'

const RIDES_TITLE = 'Explorar rutas | BikeMates'
const RIDES_DESCRIPTION =
  'Explora rutas en España por nivel y por público: iniciación, intermedio y avanzado, con distancia y desnivel de cada salida.'

useHead(
  computed(() => {
    // URL absoluta: las redes y los rastreadores no resuelven rutas relativas.
    const url = `${window.location.origin}/rides`
    const image = `${window.location.origin}/photos/grupeta-camino.webp`

    return {
      title: RIDES_TITLE,
      meta: [
        { name: 'description', content: RIDES_DESCRIPTION },
        // Open Graph: previsualización en Facebook, WhatsApp, Telegram…
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'BikeMates' },
        { property: 'og:title', content: RIDES_TITLE },
        { property: 'og:description', content: RIDES_DESCRIPTION },
        { property: 'og:url', content: url },
        { property: 'og:image', content: image },
        // Twitter/X
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: RIDES_TITLE },
        { name: 'twitter:description', content: RIDES_DESCRIPTION },
        { name: 'twitter:image', content: image },
      ],
      link: [{ rel: 'canonical', href: url }],
    }
  }),
)

/** Tarjetas visibles por lote al hacer scroll. */
const PAGE_SIZE = 8

const { rides, isLoading, errorMessage, participatingRideIds, loadRides } = useRideList()

const {
  query,
  selectedLevel,
  selectedBike,
  selectedAudience,
  sortBy,
  timeframe,
  onlyParticipating,
  upcomingRides,
  pastRides,
  visibleRides,
} = useRideFilters(rides, participatingRideIds)

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.user !== null)

/** Conjunto de ids en los que participa el usuario, para la insignia de la tarjeta. */
const participatingIds = computed(() => new Set(participatingRideIds.value))

function isParticipating(rideId: string): boolean {
  return participatingIds.value.has(rideId)
}

const isPastTab = computed(() => timeframe.value === 'past')

// Columnas adaptativas: 1 en móvil; en pantallas mayores, tantas como tarjetas haya (máx. 4).
const { width: viewportWidth } = useWindowSize()

// El grid mantiene columnas estables por breakpoint, también con una sola
// salida: una tarjeta única no debe estirarse a todo el ancho disponible.
const columnCount = computed(() => {
  if (viewportWidth.value < 640) return 1
  if (viewportWidth.value < 1024) return 2
  if (viewportWidth.value < 1440) return 3
  return 4
})

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${columnCount.value}, minmax(0, 1fr))`,
}))

// Carga progresiva: se muestran lotes de PAGE_SIZE al acercarse al final.
const visibleCount = ref(PAGE_SIZE)
const sentinelEl = ref<HTMLElement | null>(null)

const paginatedRides = computed<Ride[]>(() => visibleRides.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < visibleRides.value.length)

// Al cambiar filtros, pestaña u orden se vuelve al primer lote.
watch(visibleRides, () => {
  visibleCount.value = PAGE_SIZE
})

let loadObserver: IntersectionObserver | null = null

onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') return

  loadObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && hasMore.value) {
        visibleCount.value += PAGE_SIZE
      }
    },
    { rootMargin: '240px 0px' },
  )

  if (sentinelEl.value) loadObserver.observe(sentinelEl.value)
})

onBeforeUnmount(() => {
  loadObserver?.disconnect()
})
</script>

<template>
  <AppPage>
    <div>
      <Typography as="h1" variant="heading-xl">Explorar rutas</Typography>

      <Typography class="mt-3 max-w-2xl" tone="muted">
      Descubre salidas que se adapten a tu nivel y encuentra ciclistas con quienes compartir el camino.
      </Typography>
    </div>

    <section class="mt-6" aria-label="Filtros de búsqueda">
      <RideTimeframeTabs
        v-model="timeframe"
        :upcoming-count="upcomingRides.length"
        :past-count="pastRides.length"
        class="mb-3"
      />

      <RideFilters
        v-model:query="query"
        v-model:level="selectedLevel"
        v-model:bike="selectedBike"
        v-model:audience="selectedAudience"
        v-model:sort="sortBy"
        v-model:participating="onlyParticipating"
        :show-participation="isAuthenticated"
      />
    </section>

    <!-- pb extra: aire entre el listado (con su centinela de scroll) y el pie. -->
    <section class="mt-6 pb-12" aria-label="Listado de rutas">
      <BikeLoader v-if="isLoading" label="Cargando rutas…" />

      <EmptyState
        v-else-if="errorMessage"
        title="No se han podido cargar las rutas"
        :description="errorMessage"
      >
        <Button @click="loadRides">Reintentar</Button>
      </EmptyState>

      <template v-else>
        <Typography variant="body-sm" tone="muted" aria-live="polite">
          <template v-if="isPastTab">
            {{ visibleRides.length }}
            {{ visibleRides.length === 1 ? 'salida celebrada' : 'salidas celebradas' }}
          </template>
          <template v-else>
            {{ visibleRides.length }}
            {{ visibleRides.length === 1 ? 'ruta encontrada' : 'rutas encontradas' }}
          </template>
        </Typography>

        <div v-if="paginatedRides.length > 0" class="mt-6 grid gap-7" :style="gridStyle">
          <RideCard
            v-for="ride in paginatedRides"
            :key="ride.id"
            :ride="ride"
            :past="isPastTab"
            :participating="isParticipating(ride.id)"
          />
        </div>

        <!-- Centinela de scroll: carga el siguiente lote al entrar en pantalla. -->
        <div ref="sentinelEl" class="h-px" aria-hidden="true" />

        <div v-if="hasMore" class="mt-4 flex justify-center py-4" role="status" aria-live="polite">
          <span class="sr-only">Cargando más rutas…</span>
          <span
            class="size-6 rounded-full border-2 border-line border-t-ink motion-safe:animate-spin"
            aria-hidden="true"
          />
        </div>

        <EmptyState
          v-if="paginatedRides.length === 0"
          class="mt-6"
          :title="
            isPastTab
              ? 'Sin salidas pasadas con estos filtros'
              : 'Sin próximas rutas con estos filtros'
          "
          :description="
            isPastTab
              ? 'Todavía no hay salidas celebradas con el nivel y el público seleccionados.'
              : 'No hay rutas disponibles con el nivel y el público seleccionados. Prueba con otra combinación.'
          "
        />
      </template>
    </section>
  </AppPage>
</template>
