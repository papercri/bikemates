<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import ElevationSparkline from '@/components/ui/ElevationSparkline.vue'

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

const levelDotStyles: Record<Ride['level'], string> = {
  'Iniciación': 'bg-trail',
  'Intermedio': 'bg-route',
  'Avanzado': 'bg-ink',
}
</script>

<template>
  <div class="min-h-screen bg-snow text-ink">
    <AppHeader />

    <main class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <RouterLink
        to="/rides"
        class="inline-flex items-center gap-1.5 text-sm text-trail-ink hover:text-trail-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-trail"
      >
        <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" aria-hidden="true" focusable="false">
          <path
            d="M13 8 H4 M7.5 3.5 L3 8 L7.5 12.5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Volver a las rutas
      </RouterLink>

      <template v-if="ride">
        <section class="mt-8">
          <div class="flex flex-wrap items-center gap-3">
            <span class="text-sm font-medium text-trail-ink">
              {{ ride.location }}
            </span>
            <span
              class="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-graphite"
            >
              <span class="h-1.5 w-1.5 rounded-full" :class="levelDotStyles[ride.level]" />
              {{ ride.level }}
            </span>
          </div>

          <h1 class="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {{ ride.title }}
          </h1>

          <p class="mt-5 leading-7 text-graphite">
            {{ ride.description }}
          </p>

          <div class="mt-8 overflow-hidden rounded-card border border-line bg-canvas shadow-card">
            <div
              class="flex items-center justify-between border-b border-line bg-snow px-5 py-3 sm:px-6"
            >
              <h2 class="text-xs font-semibold uppercase tracking-widest text-graphite">
                Perfil del recorrido
              </h2>
              <p class="text-xs text-graphite">
                Desnivel acumulado
                <span class="font-mono font-bold text-ink">+{{ ride.elevationM }} m</span>
              </p>
            </div>

            <ElevationSparkline
              :distance-km="ride.distanceKm"
              :elevation-m="ride.elevationM"
              variant="banner"
              class="bg-snow"
            />

            <dl class="grid grid-cols-2 border-t border-line sm:grid-cols-3">
              <div class="border-r border-line p-5 sm:p-6">
                <dt class="flex items-center gap-1.5 text-sm text-graphite">
                  <svg
                    viewBox="0 0 16 16"
                    class="h-4 w-4"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      d="M2 8 H12 M9 5 L12.5 8 L9 11"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-dasharray="2.5 2.5"
                    />
                  </svg>
                  Distancia
                </dt>
                <dd class="mt-2 flex items-baseline gap-1">
                  <span class="font-mono text-2xl font-bold tracking-tight sm:text-3xl">
                    {{ ride.distanceKm }}
                  </span>
                  <span class="text-sm font-semibold text-graphite">km</span>
                </dd>
              </div>

              <div class="border-r border-line p-5 sm:p-6">
                <dt class="flex items-center gap-1.5 text-sm text-graphite">
                  <svg
                    viewBox="0 0 16 16"
                    class="h-4 w-4"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      d="M1.5 13 L5.5 5 L8 9.5 L10.5 4 L14.5 13 Z"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linejoin="round"
                    />
                  </svg>
                  Desnivel
                </dt>
                <dd class="mt-2 flex items-baseline gap-1">
                  <span class="text-sm font-semibold text-graphite">+</span>
                  <span class="font-mono text-2xl font-bold tracking-tight sm:text-3xl">
                    {{ ride.elevationM }}
                  </span>
                  <span class="text-sm font-semibold text-graphite">m</span>
                </dd>
              </div>

              <div class="col-span-2 border-t border-line p-5 sm:col-span-1 sm:border-t-0 sm:p-6">
                <dt class="flex items-center gap-1.5 text-sm text-graphite">
                  <svg viewBox="0 0 16 16" class="h-4 w-4" aria-hidden="true" focusable="false">
                    <rect x="1.5" y="9" width="3" height="5" rx="1" fill="currentColor" />
                    <rect x="6.5" y="6" width="3" height="8" rx="1" fill="currentColor" />
                    <rect x="11.5" y="3" width="3" height="11" rx="1" fill="currentColor" />
                  </svg>
                  Nivel
                </dt>
                <dd class="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight">
                  <span class="h-2.5 w-2.5 rounded-full" :class="levelDotStyles[ride.level]" />
                  {{ ride.level }}
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </template>

      <section v-else class="mt-8" aria-labelledby="not-found-title">
        <h1 id="not-found-title" class="text-2xl font-bold">Ruta no encontrada</h1>

        <p class="mt-3 text-graphite">No existe ninguna ruta con ese identificador.</p>

        <RouterLink
          to="/rides"
          class="mt-6 inline-block rounded-btn bg-trail px-5 py-3 font-semibold text-ink transition-colors hover:bg-trail-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          Ver todas las rutas
        </RouterLink>
      </section>
    </main>
  </div>
</template>
