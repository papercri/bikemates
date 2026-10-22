<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Alert from '@/components/ui/Alert.vue'
import BikeLoader from '@/components/ui/BikeLoader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Typography from '@/components/ui/Typography.vue'
import RideCard from '@/features/rides/components/RideCard.vue'
import {
  getSavedRides,
  saveRide,
  unsaveRide,
} from '@/features/rides/services/savedRideService'
import type { Ride } from '@/features/rides/types'

const rides = ref<Ride[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const actionError = ref('')
/** Estado de favorito por ruta: la estrella se apaga al instante (optimismo). */
const savedIds = ref<Set<string>>(new Set())

function isSaved(rideId: string): boolean {
  return savedIds.value.has(rideId)
}

async function loadSavedRides(): Promise<void> {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const loaded = await getSavedRides()
    rides.value = loaded
    savedIds.value = new Set(loaded.map((ride) => ride.id))
  } catch {
    errorMessage.value = 'No se han podido cargar tus rutas guardadas. Inténtalo de nuevo.'
  } finally {
    isLoading.value = false
  }
}

/**
 * Quita (o devuelve) una ruta de favoritos desde la propia tarjeta. Al quitarla,
 * la tarjeta desaparece de la lista cuando termina la confirmación efímera.
 */
async function handleToggleSave(ride: Ride): Promise<void> {
  actionError.value = ''
  const index = rides.value.findIndex((candidate) => candidate.id === ride.id)
  const wasSaved = index !== -1

  const next = new Set(savedIds.value)
  if (wasSaved) next.delete(ride.id)
  else next.add(ride.id)
  savedIds.value = next

  try {
    if (wasSaved) {
      await unsaveRide(ride.id)
      // La tarjeta se retiene un momento para que se vea la confirmación efímera.
      window.setTimeout(() => {
        rides.value = rides.value.filter((candidate) => candidate.id !== ride.id)
      }, 2000)
    } else {
      await saveRide(ride.id)
      rides.value = [ride, ...rides.value]
    }
  } catch {
    savedIds.value = new Set(savedIds.value)
    if (wasSaved) savedIds.value.add(ride.id)
    else savedIds.value.delete(ride.id)
    actionError.value = 'No se ha podido actualizar la ruta guardada. Inténtalo de nuevo.'
  }
}

onMounted(loadSavedRides)
</script>

<template>
  <div>
    <Typography as="h2" variant="heading-sm" class="mb-4 tracking-tight">
      Rutas guardadas
    </Typography>

    <BikeLoader v-if="isLoading" label="Cargando rutas guardadas…" />

    <Alert v-else-if="errorMessage">{{ errorMessage }}</Alert>

    <EmptyState
      v-else-if="rides.length === 0"
      title="Aún no has guardado ninguna ruta"
      description="Pulsa la estrella de una tarjeta para añadirla a tus favoritas."
    />

    <template v-else>
      <Alert v-if="actionError" class="mb-4">{{ actionError }}</Alert>

      <div class="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="ride in rides"
          :key="ride.id"
          class="flex h-full flex-col overflow-hidden rounded-photo border border-line bg-white transition-colors hover:border-line-strong"
        >
          <RideCard
            :ride="ride"
            bare
            :saved="isSaved(ride.id)"
            show-save-toggle
            class="flex-1"
            @toggle-save="handleToggleSave(ride)"
          />
          <RouterLink
            :to="{ name: 'ride-detail', params: { id: ride.id } }"
            class="border-t border-line bg-snow/60 py-2.5 text-center text-xs font-medium text-graphite transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink"
          >
            Ver detalles
          </RouterLink>
        </div>
      </div>
    </template>
  </div>
</template>
