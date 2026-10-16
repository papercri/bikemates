<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, ref } from 'vue'
import AppPage from '@/components/layout/AppPage.vue'
import RideCard from '@/features/rides/components/RideCard.vue'
import Button from '@/components/ui/Button.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Typography from '@/components/ui/Typography.vue'
import { useRideList } from '@/features/rides/composables/useRideList'
import { RIDE_LEVELS } from '@/features/rides/constants/rideLevels'
import type { RideLevel } from '@/features/rides/types'

useHead({
  title: 'Explorar rutas | BikeMates',
  meta: [
    {
      name: 'description',
      content:
        'Explora rutas en España por nivel: iniciación, intermedio y avanzado, con distancia y desnivel de cada salida.',
    },
  ],
})

const { rides, isLoading, errorMessage, loadRides } = useRideList()
const selectedLevel = ref<'Todos' | RideLevel>('Todos')

const filteredRides = computed(() => {
  if (selectedLevel.value === 'Todos') {
    return rides.value
  }

  return rides.value.filter((ride) => ride.level === selectedLevel.value)
})
</script>

<template>
  <AppPage>
    <div>
      <Typography as="h1" variant="heading-xl">Explorar rutas</Typography>

      <Typography class="mt-3" tone="muted">
        Encuentra una ruta adaptada a tu nivel y disfruta pedaleando en compañía.
      </Typography>
    </div>

    <section class="mt-8" aria-labelledby="filter-title">
      <Typography
        id="filter-title"
        as="h2"
        variant="body-sm"
        tone="muted"
        class="mb-3 font-semibold"
      >
        Filtrar por nivel
      </Typography>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="level in ['Todos', ...RIDE_LEVELS]"
          :key="level"
          type="button"
          :aria-pressed="selectedLevel === level"
          class="rounded-full border px-4 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trail"
          :class="
            selectedLevel === level
              ? 'border-trail bg-trail font-semibold text-ink'
              : 'border-line-strong bg-canvas text-graphite hover:border-trail hover:text-ink'
          "
          @click="selectedLevel = level"
        >
          {{ level }}
        </button>
      </div>
    </section>

    <section class="mt-8" aria-label="Listado de rutas">
      <div
        v-if="isLoading"
        class="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        role="status"
        aria-live="polite"
      >
        <span class="sr-only">Cargando rutas…</span>
        <div
          v-for="n in 3"
          :key="n"
          class="h-64 rounded-card border border-line bg-canvas shadow-card motion-safe:animate-pulse"
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
        <Typography variant="body-sm" tone="muted" class="mb-4" aria-live="polite">
          {{ filteredRides.length }}
          {{ filteredRides.length === 1 ? 'ruta encontrada' : 'rutas encontradas' }}
        </Typography>

        <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <RideCard v-for="ride in filteredRides" :key="ride.id" :ride="ride" />
        </div>

        <EmptyState
          v-if="filteredRides.length === 0"
          class="mt-6"
          title="Sin rutas de este nivel"
          description="No hay rutas disponibles para este nivel. Prueba con otro o vuelve más tarde."
        />
      </template>
    </section>
  </AppPage>
</template>
