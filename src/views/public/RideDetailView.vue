
<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppPage from '@/components/layout/AppPage.vue'
import ElevationSparkline from '@/components/rides/ElevationSparkline.vue'
import IconArrow from '@/components/svg/IconArrow.vue'
import IconDistance from '@/components/svg/IconDistance.vue'
import IconElevation from '@/components/svg/IconElevation.vue'
import IconLevel from '@/components/svg/IconLevel.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Typography from '@/components/ui/Typography.vue'
import { getRideById } from '@/features/rides/services/rideService'
import {
  RIDE_LEVEL_BADGE_COLORS,
  RIDE_LEVEL_DOT_CLASSES,
} from '@/features/rides/constants/rideLevels'
import type { Ride } from '@/features/rides/types'
import RideMap from '@/components/rides/RideMap.vue'
import type { BikeType } from '@/features/rides/types'

const route = useRoute()
const BIKE_TYPE_LABELS: Record<BikeType, string> = {
  road: 'Carretera',
  mtb: 'MTB',
  gravel: 'Gravel',
  urban: 'Urbana',
  other: 'Otra',
}
const ride = ref<Ride | null>(null)
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

const rideId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? id : null
})

async function loadRide(): Promise<void> {
  const id = rideId.value

  ride.value = null
  errorMessage.value = null

  if (!id) {
    errorMessage.value = 'El identificador de la ruta no es válido.'
    isLoading.value = false
    return
  }

  isLoading.value = true

  try {
    ride.value = await getRideById(id)
  } catch (error: unknown) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No se ha podido cargar la ruta.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadRide)

watch(rideId, loadRide)

useHead({
  title: computed(() =>
    ride.value
      ? `${ride.value.title} | BikeMates`
      : 'Detalle de ruta | BikeMates',
  ),
})
</script>


```vue
<template>
  <AppPage size="detail">
    <RouterLink
      to="/rides"
      class="inline-flex items-center gap-1.5 text-sm text-trail-ink hover:text-trail-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-trail"
    >
      <IconArrow direction="left" />
      Volver a las rutas
    </RouterLink>

    <div v-if="isLoading" class="mt-12 py-16 text-center" role="status" aria-live="polite">
      <Typography tone="muted">Cargando los detalles de la ruta...</Typography>
    </div>

    <EmptyState
      v-else-if="errorMessage"
      class="mt-8"
      title-as="h1"
      title="No se ha podido cargar la ruta"
      :description="errorMessage"
    >
      <Button to="/rides">Ver todas las rutas</Button>
    </EmptyState>

    <template v-else-if="ride">
      <section class="mt-8">
        <div class="flex flex-wrap items-center gap-3">
          <Typography as="span" variant="body-sm" tone="accent" class="font-medium">
            {{ ride.meetingPoint }}
          </Typography>

          <Badge variant="muted" :color="RIDE_LEVEL_BADGE_COLORS[ride.level]" dot>
            {{ ride.level }}
          </Badge>

          <Badge variant="muted">
            {{ BIKE_TYPE_LABELS[ride.bikeType] }}
          </Badge>
        </div>

        <Typography as="h1" variant="heading-xl" class="mt-3 tracking-tight">
          {{ ride.title }}
        </Typography>

        <Typography class="mt-5 leading-7" tone="muted">
          {{ ride.description }}
        </Typography>

        <Card class="mt-8 overflow-hidden">
          <div class="flex items-center justify-between border-b border-line bg-snow px-5 py-3 sm:px-6">
            <Typography as="h2" variant="label-xs" tone="muted">
              Perfil del recorrido
            </Typography>
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
                <IconDistance />
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
                <IconElevation />
                Desnivel
              </Typography>
              <dd class="mt-2 flex items-baseline gap-1">
                <Typography as="span" variant="numeric-lg">
                  +{{ ride.elevationM }}
                </Typography>
                <Typography as="span" variant="body-sm" tone="muted" class="font-semibold">
                  m
                </Typography>
              </dd>
            </div>

            <div class="col-span-2 border-t border-line p-5 sm:col-span-1 sm:border-t-0 sm:p-6">
              <Typography as="dt" variant="body-sm" tone="muted">
                Duración estimada
              </Typography>
              <dd class="mt-2 font-semibold tabular-nums text-ink">
                {{ Math.floor(ride.durationMinutes / 60) }} h<span
                  v-if="ride.durationMinutes % 60 > 0"
                >
                  {{ ride.durationMinutes % 60 }} min
                </span>
              </dd>
            </div>
          </dl>
        </Card>
      </section>

      <section class="mt-10" aria-labelledby="meeting-point-title">
        <Typography as="h2" variant="heading-lg" class="mb-4">
          Punto de encuentro
        </Typography>

        <Card class="overflow-hidden">
          <RideMap
            :latitude="ride.latitude"
            :longitude="ride.longitude"
            :meeting-point="ride.meetingPoint"
          />

          <div class="p-5 sm:p-6">
            <Typography as="h3" variant="body-sm" class="font-semibold">
              {{ ride.meetingPoint }}
            </Typography>
            <Typography class="mt-1" variant="body-sm" tone="muted">
              Lugar de salida de la grupeta
            </Typography>

            <a
              :href="`https://www.openstreetmap.org/?mlat=${ride.latitude}&mlon=${ride.longitude}#map=15/${ride.latitude}/${ride.longitude}`"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-4 inline-flex rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-trail focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trail"
            >
              Abrir en OpenStreetMap
              <span class="sr-only">(se abre en una pestaña nueva)</span>
            </a>
          </div>
        </Card>
      </section>

      <div class="mt-8">
        <Button to="/rides">Explorar más rutas</Button>
      </div>
    </template>

    <EmptyState
      v-else
      class="mt-8"
      title-as="h1"
      title="Ruta no encontrada"
      description="No existe ninguna ruta publicada con ese identificador."
    >
      <Button to="/rides">Ver todas las rutas</Button>
    </EmptyState>
  </AppPage>
</template>
```
