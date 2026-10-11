<script setup lang="ts">
import { ref, computed } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import ElevationSparkline from '@/components/ui/ElevationSparkline.vue'

type RideLevel = 'Iniciación' | 'Intermedio' | 'Avanzado'

interface Ride {
  id: number
  title: string
  location: string
  distanceKm: number
  elevationM: number
  level: RideLevel
}

const rides = ref<Ride[]>([
  {
    id: 1,
    title: 'Vuelta por Collserola',
    location: 'Barcelona',
    distanceKm: 35,
    elevationM: 650,
    level: 'Intermedio',
  },
  {
    id: 2,
    title: 'Ruta por el paseo marítimo',
    location: 'Badalona',
    distanceKm: 20,
    elevationM: 120,
    level: 'Iniciación',
  },
  {
    id: 3,
    title: 'Desafío del Montseny',
    location: 'Sant Celoni',
    distanceKm: 85,
    elevationM: 1800,
    level: 'Avanzado',
  },
])

const selectedLevel = ref<'Todos' | RideLevel>('Todos')

const filteredRides = computed(() => {
  if (selectedLevel.value === 'Todos') {
    return rides.value
  }

  return rides.value.filter((ride) => ride.level === selectedLevel.value)
})

const levelChipStyles: Record<RideLevel, string> = {
  'Iniciación': 'bg-trail/15 text-trail-ink before:bg-trail',
  'Intermedio': 'bg-route/15 text-route-ink before:bg-route',
  'Avanzado': 'bg-ink/10 text-ink before:bg-ink',
}
</script>

<template>
  <div class="min-h-screen bg-snow text-ink">
    <AppHeader />

    <main class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <p class="text-sm font-semibold uppercase tracking-widest text-trail-ink">
          Descubre tu próxima salida
        </p>

        <h1 class="mt-3 text-3xl font-bold sm:text-4xl">Explorar rutas</h1>

        <p class="mt-3 text-graphite">
          Encuentra una ruta adaptada a tu nivel y disfruta pedaleando en compañía.
        </p>
      </div>

      <section class="mt-8" aria-labelledby="filter-title">
        <h2 id="filter-title" class="mb-3 text-sm font-semibold text-graphite">
          Filtrar por nivel
        </h2>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="level in ['Todos', 'Iniciación', 'Intermedio', 'Avanzado'] as const"
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
        <p class="mb-4 text-sm text-graphite" aria-live="polite">
          {{ filteredRides.length }}
          {{ filteredRides.length === 1 ? 'ruta encontrada' : 'rutas encontradas' }}
        </p>

        <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="ride in filteredRides"
            :key="ride.id"
            class="group overflow-hidden rounded-card border border-line bg-canvas shadow-card transition-shadow duration-300 hover:shadow-lg"
          >
            <div class="relative bg-snow">
              <ElevationSparkline
                :distance-km="ride.distanceKm"
                :elevation-m="ride.elevationM"
                class="absolute inset-x-0 bottom-0"
              />
              <div class="relative flex items-start justify-between gap-3 px-6 pt-5">
                <span class="text-sm font-medium text-trail-ink">
                  {{ ride.location }}
                </span>
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold before:h-1.5 before:w-1.5 before:rounded-full before:content-['']"
                  :class="levelChipStyles[ride.level]"
                >
                  {{ ride.level }}
                </span>
              </div>
            </div>

            <div class="p-6 pt-4">
              <h2 class="text-xl font-semibold">
                {{ ride.title }}
              </h2>

              <div class="mt-4 flex items-end gap-6">
                <div class="flex items-baseline gap-1">
                  <span class="font-mono text-4xl font-bold leading-none tracking-tight">
                    {{ ride.distanceKm }}
                  </span>
                  <span class="pb-0.5 text-sm font-semibold text-graphite">km</span>
                </div>

                <div class="flex items-baseline gap-1">
                  <span class="pb-0.5 text-sm font-semibold text-graphite">+</span>
                  <span class="font-mono text-xl font-bold leading-none tracking-tight">
                    {{ ride.elevationM }}
                  </span>
                  <span class="pb-0.5 text-sm font-semibold text-graphite">m</span>
                </div>
              </div>

              <RouterLink
                :to="{ name: 'ride-detail', params: { id: ride.id } }"
                class="mt-5 inline-flex items-center gap-1.5 font-semibold text-trail-ink transition-colors hover:text-trail-dark"
              >
                Ver detalles
                <svg
                  viewBox="0 0 16 16"
                  class="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M3 8 h9 M8.5 3.5 L13 8 L8.5 12.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </RouterLink>
            </div>
          </article>
        </div>

        <p v-if="filteredRides.length === 0" class="mt-6 text-graphite">
          No hay rutas disponibles para este nivel.
        </p>
      </section>
    </main>
  </div>
</template>
