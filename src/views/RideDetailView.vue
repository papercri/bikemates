<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'

interface Ride {
  id: number
  title: string
  location: string
  distanceKm: number
  elevationM: number
  level: 'Iniciación' | 'Intermedio' | 'Avanzado'
  description: string
}

const route = useRoute()

const rides: Ride[] = [
  {
    id: 1,
    title: 'Vuelta por Collserola',
    location: 'Barcelona',
    distanceKm: 35,
    elevationM: 650,
    level: 'Intermedio',
    description:
      'Una salida para descubrir los caminos de Collserola y disfrutar de las vistas de Barcelona.',
  },
  {
    id: 2,
    title: 'Ruta por el paseo marítimo',
    location: 'Badalona',
    distanceKm: 20,
    elevationM: 120,
    level: 'Iniciación',
    description:
      'Un recorrido accesible junto al mar, ideal para disfrutar de una salida tranquila.',
  },
  {
    id: 3,
    title: 'Desafío del Montseny',
    location: 'Sant Celoni',
    distanceKm: 85,
    elevationM: 1800,
    level: 'Avanzado',
    description: 'Una ruta exigente con bastante desnivel para ciclistas que buscan un reto.',
  },
]

const ride = computed(() => {
  const id = Number(route.params.id)

  if (!Number.isSafeInteger(id) || id <= 0) {
    return undefined
  }

  return rides.find((item) => item.id === id)
})
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <AppHeader />

    <main class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <RouterLink
        to="/rides"
        class="text-sm text-cyan-400 hover:text-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400"
      >
        ← Volver a las rutas
      </RouterLink>

      <template v-if="ride">
        <section class="mt-8">
          <p class="text-sm font-medium text-cyan-400">
            {{ ride.location }}
          </p>

          <h1 class="mt-3 text-3xl font-bold sm:text-4xl">
            {{ ride.title }}
          </h1>

          <p class="mt-5 leading-7 text-slate-300">
            {{ ride.description }}
          </p>

          <dl class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div class="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <dt class="text-sm text-slate-400">Distancia</dt>
              <dd class="mt-2 text-xl font-semibold">{{ ride.distanceKm }} km</dd>
            </div>

            <div class="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <dt class="text-sm text-slate-400">Desnivel</dt>
              <dd class="mt-2 text-xl font-semibold">{{ ride.elevationM }} m</dd>
            </div>

            <div
              class="col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-5 sm:col-span-1"
            >
              <dt class="text-sm text-slate-400">Nivel</dt>
              <dd class="mt-2 text-xl font-semibold">{{ ride.level }}</dd>
            </div>
          </dl>
        </section>
      </template>

      <section v-else class="mt-8" aria-labelledby="not-found-title">
        <h1 id="not-found-title" class="text-2xl font-bold">Ruta no encontrada</h1>

        <p class="mt-3 text-slate-400">No existe ninguna ruta con ese identificador.</p>

        <RouterLink
          to="/rides"
          class="mt-6 inline-block rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
        >
          Ver todas las rutas
        </RouterLink>
      </section>
    </main>
  </div>
</template>
