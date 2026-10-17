<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '@unhead/vue'
import AppPage from '@/components/layout/AppPage.vue'
import RideCard from '@/features/rides/components/RideCard.vue'
import RideFilters from '@/features/rides/components/RideFilters.vue'
import RideTimeframeTabs from '@/features/rides/components/RideTimeframeTabs.vue'
import Button from '@/components/ui/Button.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Typography from '@/components/ui/Typography.vue'
import { useRideFilters } from '@/features/rides/composables/useRideFilters'
import { useRideList } from '@/features/rides/composables/useRideList'

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

const { rides, isLoading, errorMessage, loadRides } = useRideList()

// El estado de los filtros, el orden, las ventanas temporales y el filtrado viven en el composable.
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
        class="mt-4 grid gap-4 sm:grid-cols-2"
        role="status"
        aria-live="polite"
      >
        <span class="sr-only">Cargando rutas…</span>
        <div
          v-for="n in 4"
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

        <div v-if="visibleRides.length > 0" class="mt-4 grid gap-4 sm:grid-cols-2">
          <RideCard v-for="ride in visibleRides" :key="ride.id" :ride="ride" :past="isPastTab" />
        </div>

        <EmptyState
          v-else
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
