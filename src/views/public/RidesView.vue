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

      <Typography class="mt-3 max-w-2xl" tone="muted">
        Encuentra una ruta adaptada a tu nivel y disfruta pedaleando en compañía.
      </Typography>
    </div>

    <section class="mt-8" aria-label="Filtros">
      <div
        id="filter-title"
        class="inline-flex flex-wrap gap-1 rounded-2xl border border-line-strong bg-canvas p-1 sm:rounded-full"
        role="group"
        aria-label="Filtrar por nivel"
      >
        <button
          v-for="level in ['Todos', ...RIDE_LEVELS]"
          :key="level"
          type="button"
          :aria-pressed="selectedLevel === level"
          class="rounded-xl px-3.5 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trail sm:rounded-full"
          :class="
            selectedLevel === level
              ? 'bg-trail font-semibold text-white'
              : 'text-graphite hover:text-ink'
          "
          @click="selectedLevel = level"
        >
          {{ level }}
        </button>
      </div>
    </section>

    <section class="mt-6" aria-label="Listado de rutas">
      <div v-if="isLoading" class="border-t border-line" role="status" aria-live="polite">
        <span class="sr-only">Cargando rutas…</span>
        <div
          v-for="n in 3"
          :key="n"
          class="flex items-center gap-6 border-b border-line px-2 py-6 sm:px-4"
          aria-hidden="true"
        >
          <div class="h-10 w-10 shrink-0 bg-surface motion-safe:animate-pulse" />
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
          <RideCard v-for="ride in filteredRides" :key="ride.id" :ride="ride" />
        </div>

        <EmptyState
          v-else
          class="mt-6"
          title="Sin rutas de este nivel"
          description="No hay rutas disponibles para este nivel. Prueba con otro o vuelve más tarde."
        />
      </template>
    </section>
  </AppPage>
</template>
