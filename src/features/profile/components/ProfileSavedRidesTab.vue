<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Alert from '@/components/ui/Alert.vue'
import BikeLoader from '@/components/ui/BikeLoader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Typography from '@/components/ui/Typography.vue'
import RideCard from '@/features/rides/components/RideCard.vue'
import { getSavedRides } from '@/features/rides/services/savedRideService'
import type { Ride } from '@/features/rides/types'

const rides = ref<Ride[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

async function loadSavedRides(): Promise<void> {
  isLoading.value = true
  errorMessage.value = ''

  try {
    rides.value = await getSavedRides()
  } catch {
    errorMessage.value = 'No se han podido cargar tus rutas guardadas. Inténtalo de nuevo.'
  } finally {
    isLoading.value = false
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

    <div v-else class="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="ride in rides"
        :key="ride.id"
        class="flex h-full flex-col overflow-hidden rounded-photo border border-line bg-white transition-colors hover:border-line-strong"
      >
        <RideCard :ride="ride" bare class="flex-1" />
        <RouterLink
          :to="{ name: 'ride-detail', params: { id: ride.id } }"
          class="border-t border-line bg-snow/60 py-2.5 text-center text-xs font-medium text-graphite transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink"
        >
          Ver detalles
        </RouterLink>
      </div>
    </div>
  </div>
</template>
