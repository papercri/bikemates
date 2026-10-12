<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import AppPage from '@/components/layout/AppPage.vue'
import ElevationSparkline from '@/components/rides/ElevationSparkline.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Typography from '@/components/ui/Typography.vue'
import { mockRides } from '@/features/rides/data/mockRides'
import {
  RIDE_LEVEL_BADGE_COLORS,
  RIDE_LEVEL_DOT_CLASSES,
} from '@/features/rides/constants/rideLevels'

const route = useRoute()

const ride = computed(() => {
  const id = Number(route.params.id)

  if (!Number.isSafeInteger(id) || id <= 0) {
    return undefined
  }

  return mockRides.find((item) => item.id === id)
})
</script>

<template>
  <AppPage size="detail">
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
          <Typography as="span" variant="body-sm" tone="accent" class="font-medium">
            {{ ride.location }}
          </Typography>
          <Badge variant="muted" :color="RIDE_LEVEL_BADGE_COLORS[ride.level]" dot>
            {{ ride.level }}
          </Badge>
        </div>

        <Typography as="h1" variant="heading-xl" class="mt-3 tracking-tight">
          {{ ride.title }}
        </Typography>

        <Typography class="mt-5 leading-7" tone="muted">
          {{ ride.description }}
        </Typography>

        <Card class="mt-8">
          <div
            class="flex items-center justify-between border-b border-line bg-snow px-5 py-3 sm:px-6"
          >
            <Typography variant="label-xs" tone="muted">Perfil del recorrido</Typography>
            <Typography variant="caption" tone="muted">
              Desnivel acumulado
              <Typography as="span" variant="numeric-inline" class="text-ink">
                +{{ ride.elevationM }} m
              </Typography>
            </Typography>
          </div>

          <ElevationSparkline
            :distance-km="ride.distanceKm"
            :elevation-m="ride.elevationM"
            variant="banner"
            class="bg-snow"
          />

          <dl class="grid grid-cols-2 border-t border-line sm:grid-cols-3">
            <div class="border-r border-line p-5 sm:p-6">
              <Typography as="dt" variant="body-sm" tone="muted" class="flex items-center gap-1.5">
                <svg viewBox="0 0 16 16" class="h-4 w-4" aria-hidden="true" focusable="false">
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
              </Typography>
              <dd class="mt-2 flex items-baseline gap-1">
                <Typography as="span" variant="numeric-lg">
                  {{ ride.distanceKm }}
                </Typography>
                <Typography as="span" variant="body-sm" tone="muted" class="font-semibold">
                  km
                </Typography>
              </dd>
            </div>

            <div class="border-r border-line p-5 sm:p-6">
              <Typography as="dt" variant="body-sm" tone="muted" class="flex items-center gap-1.5">
                <svg viewBox="0 0 16 16" class="h-4 w-4" aria-hidden="true" focusable="false">
                  <path
                    d="M1.5 13 L5.5 5 L8 9.5 L10.5 4 L14.5 13 Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linejoin="round"
                  />
                </svg>
                Desnivel
              </Typography>
              <dd class="mt-2 flex items-baseline gap-1">
                <Typography as="span" variant="body-sm" tone="muted" class="font-semibold">
                  +
                </Typography>
                <Typography as="span" variant="numeric-lg">
                  {{ ride.elevationM }}
                </Typography>
                <Typography as="span" variant="body-sm" tone="muted" class="font-semibold">
                  m
                </Typography>
              </dd>
            </div>

            <div class="col-span-2 border-t border-line p-5 sm:col-span-1 sm:border-t-0 sm:p-6">
              <Typography as="dt" variant="body-sm" tone="muted" class="flex items-center gap-1.5">
                <svg viewBox="0 0 16 16" class="h-4 w-4" aria-hidden="true" focusable="false">
                  <rect x="1.5" y="9" width="3" height="5" rx="1" fill="currentColor" />
                  <rect x="6.5" y="6" width="3" height="8" rx="1" fill="currentColor" />
                  <rect x="11.5" y="3" width="3" height="11" rx="1" fill="currentColor" />
                </svg>
                Nivel
              </Typography>
              <dd class="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight">
                <span
                  class="h-2.5 w-2.5 rounded-full"
                  :class="RIDE_LEVEL_DOT_CLASSES[ride.level]"
                />
                {{ ride.level }}
              </dd>
            </div>
          </dl>
        </Card>
      </section>
    </template>

    <EmptyState
      v-else
      class="mt-8"
      title-as="h1"
      title="Ruta no encontrada"
      description="No existe ninguna ruta con ese identificador."
    >
      <Button to="/rides">Ver todas las rutas</Button>
    </EmptyState>
  </AppPage>
</template>
