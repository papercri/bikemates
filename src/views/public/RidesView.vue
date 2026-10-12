<script setup lang="ts">
import { computed, ref } from 'vue'
import AppPage from '@/components/layout/AppPage.vue'
import RideCard from '@/components/rides/RideCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Typography from '@/components/ui/Typography.vue'
import { mockRides } from '@/features/rides/data/mockRides'
import { RIDE_LEVELS } from '@/features/rides/constants/rideLevels'
import type { RideLevel } from '@/features/rides/types'

const rides = ref(mockRides)

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
      <Typography variant="eyebrow" tone="accent">Descubre tu próxima salida</Typography>

      <Typography as="h1" variant="heading-xl" class="mt-3">Explorar rutas</Typography>

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
          class="rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trail"
          :class="
            selectedLevel === level
              ? 'border-trail bg-trail font-semibold text-ink'
              : 'border-line bg-canvas text-graphite hover:border-trail hover:text-ink'
          "
          @click="selectedLevel = level"
        >
          {{ level }}
        </button>
      </div>
    </section>

    <section class="mt-8" aria-label="Listado de rutas">
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
        description="No hay rutas disponibles para este nivel."
      />
    </section>
  </AppPage>
</template>
