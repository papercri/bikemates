<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useHead } from '@unhead/vue'
import { useWindowSize } from '@vueuse/core'
import AppPage from '@/components/layout/AppPage.vue'
import RideCard from '@/features/rides/components/RideCard.vue'
import RideFilters from '@/features/rides/components/RideFilters.vue'
import RideTimeframeTabs from '@/features/rides/components/RideTimeframeTabs.vue'
import Button from '@/components/ui/Button.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Typography from '@/components/ui/Typography.vue'
import { useRideFilters } from '@/features/rides/composables/useRideFilters'
import { useRideList } from '@/features/rides/composables/useRideList'
import type { Ride } from '@/features/rides/types'

useHead({
  title: 'Explorar rutas | BikeMates',
  meta: [
    {
      name: 'description',
      content:
        'Explora rutas en España por nivel y por público: iniciación, intermedio y avanzado, con distancia y desnivel de cada salida.',
    },
  ],
})

/** Tarjetas visibles por lote al hacer scroll. */
const PAGE_SIZE = 8

const { rides, isLoading, errorMessage, loadRides } = useRideList()

const {
  query,
  selectedLevel,
  selectedAudience,
  sortBy,
  timeframe,
  upcomingRides,
  pastRides,
  visibleRides,
} = useRideFilters(rides)

const isPastTab = computed(() => timeframe.value === 'past')

// Columnas adaptativas: 1 en móvil; en pantallas mayores, tantas como tarjetas haya (máx. 4).
const { width: viewportWidth } = useWindowSize()

const columnCount = computed(() => {
  const count = visibleRides.value.length
  if (count === 0) return 1
  if (viewportWidth.value < 640) return 1
  if (viewportWidth.value < 1024) return Math.min(count, 2)
  return Math.min(count, 4)
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
        Encuentra una ruta adaptada a tu nivel y disfruta pedaleando en compañía.
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
        v-model:audience="selectedAudience"
        v-model:sort="sortBy"
      />
    </section>

    <section class="mt-6" aria-label="Listado de rutas">
      <div
        v-if="isLoading"
        class="mt-4 grid gap-4"
        :style="gridStyle"
        role="status"
        aria-live="polite"
      >
        <span class="sr-only">Cargando rutas…</span>
        <div
          v-for="n in Math.max(columnCount, 2)"
          :key="n"
          class="h-56 rounded-photo bg-surface motion-safe:animate-pulse"
          aria-hidden="true"
        />
      </div>

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

        <div v-if="paginatedRides.length > 0" class="mt-4 grid items-start gap-4" :style="gridStyle">
          <RideCard
            v-for="(ride, index) in paginatedRides"
            :key="ride.id"
            :ride="ride"
            :past="isPastTab"
            :height="index % 3 === 1 ? 'lg' : 'md'"
          />
        </div>

        <!-- Centinela de scroll: carga el siguiente lote al entrar en pantalla. -->
        <div ref="sentinelEl" class="h-px" aria-hidden="true" />

        <div
          v-if="hasMore"
          class="mt-4 flex justify-center py-4"
          role="status"
          aria-live="polite"
        >
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
