<script setup lang="ts">
import { useHead } from '@unhead/vue'
import AppPage from '@/components/layout/AppPage.vue'
import RideCard from '@/features/rides/components/RideCard.vue'
import RideFilters from '@/features/rides/components/RideFilters.vue'
import Button from '@/components/ui/Button.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Typography from '@/components/ui/Typography.vue'
import { useRideFilters } from '@/features/rides/composables/useRideFilters'
import { useRideList } from '@/features/rides/composables/useRideList'
import { isRidePast } from '@/utils/dates'

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

// El estado de los filtros y el filtrado/ordenado viven en el composable, no en la vista.
const { query, selectedLevel, selectedAudience, filteredRides } = useRideFilters(rides)
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
      <RideFilters
        v-model:query="query"
        v-model:level="selectedLevel"
        v-model:audience="selectedAudience"
      />
    </section>

    <section class="mt-6" aria-label="Listado de rutas">
      <div v-if="isLoading" class="border-t border-line" role="status" aria-live="polite">
        <span class="sr-only">Cargando rutas…</span>
        <div
          v-for="n in 3"
          :key="n"
          class="flex items-center gap-6 border-b border-line px-2 py-5 sm:px-4"
          aria-hidden="true"
        >
          <div class="h-8 w-8 shrink-0 bg-surface motion-safe:animate-pulse" />
          <div class="min-w-0 flex-1 space-y-2">
            <div class="h-5 w-2/5 bg-surface motion-safe:animate-pulse" />
            <div class="h-4 w-1/4 bg-surface motion-safe:animate-pulse" />
          </div>
        </div>
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
          {{ filteredRides.length }}
          {{ filteredRides.length === 1 ? 'ruta encontrada' : 'rutas encontradas' }}
        </Typography>

        <div v-if="filteredRides.length > 0" class="mt-3 border-t border-line">
          <RideCard
            v-for="ride in filteredRides"
            :key="ride.id"
            :ride="ride"
            :past="isRidePast(ride.startsAt)"
          />
        </div>

        <EmptyState
          v-else
          class="mt-6"
          title="Sin rutas con estos filtros"
          description="No hay rutas disponibles con el nivel y el público seleccionados. Prueba con otra combinación."
        />
      </template>
    </section>
  </AppPage>
</template>
