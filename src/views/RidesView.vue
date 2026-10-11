<script setup lang="ts">
import { ref, computed } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'

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
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <AppHeader />

    <main class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <p class="text-sm font-semibold uppercase tracking-widest text-cyan-400">
          Descubre tu próxima salida
        </p>

        <h1 class="mt-3 text-3xl font-bold sm:text-4xl">Explorar rutas</h1>

        <p class="mt-3 text-slate-400">
          Encuentra una ruta adaptada a tu nivel y disfruta pedaleando en compañía.
        </p>
      </div>

      <section class="mt-8" aria-labelledby="filter-title">
        <h2 id="filter-title" class="mb-3 text-sm font-semibold text-slate-300">
          Filtrar por nivel
        </h2>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="level in ['Todos', 'Iniciación', 'Intermedio', 'Avanzado'] as const"
            :key="level"
            type="button"
            :aria-pressed="selectedLevel === level"
            class="rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
            :class="
              selectedLevel === level
                ? 'border-cyan-400 bg-cyan-400 text-slate-950'
                : 'border-slate-700 text-slate-300 hover:border-cyan-400'
            "
            @click="selectedLevel = level"
          >
            {{ level }}
          </button>
        </div>
      </section>

      <section class="mt-8" aria-label="Listado de rutas">
        <p class="mb-4 text-sm text-slate-400" aria-live="polite">
          {{ filteredRides.length }}
          {{ filteredRides.length === 1 ? 'ruta encontrada' : 'rutas encontradas' }}
        </p>

        <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="ride in filteredRides"
            :key="ride.id"
            class="rounded-xl border border-slate-800 bg-slate-900 p-6"
          >
            <span class="text-sm text-cyan-400">
              {{ ride.location }}
            </span>

            <h2 class="mt-3 text-xl font-semibold">
              {{ ride.title }}
            </h2>

            <dl class="mt-5 grid grid-cols-2 gap-4">
              <div>
                <dt class="text-sm text-slate-400">Distancia</dt>
                <dd class="mt-1 font-semibold">{{ ride.distanceKm }} km</dd>
              </div>

              <div>
                <dt class="text-sm text-slate-400">Desnivel</dt>
                <dd class="mt-1 font-semibold">{{ ride.elevationM }} m</dd>
              </div>
            </dl>

            <div class="mt-5 border-t border-slate-800 pt-4">
              <span class="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                {{ ride.level }}
              </span>
            </div>
            <RouterLink
              :to="{ name: 'ride-detail', params: { id: ride.id } }"
              class="mt-5 inline-block font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Ver detalles
            </RouterLink>
          </article>
        </div>

        <p v-if="filteredRides.length === 0" class="mt-6 text-slate-400">
          No hay rutas disponibles para este nivel.
        </p>
      </section>
    </main>
  </div>
</template>
