import { onMounted, ref } from 'vue'
import { getPublishedRides } from '../services/rideService'
import type { Ride } from '../types'

/** Carga el listado público de rutas publicadas. */
export function useRideList() {
  const rides = ref<Ride[]>([])
  const isLoading = ref(true)
  const errorMessage = ref<string | null>(null)

  async function loadRides(): Promise<void> {
    isLoading.value = true
    errorMessage.value = null

    try {
      rides.value = await getPublishedRides()
    } catch (error: unknown) {
      errorMessage.value =
        error instanceof Error
          ? error.message
          : 'No se han podido cargar las rutas. Inténtalo de nuevo.'
    } finally {
      isLoading.value = false
    }
  }

  onMounted(loadRides)

  return { rides, isLoading, errorMessage, loadRides }
}
