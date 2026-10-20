import { onMounted, ref } from 'vue'
import { getMyParticipatingRideIds, getPublishedRides } from '../services/rideService'
import type { Ride } from '../types'

/** Carga el listado público de rutas publicadas. */
export function useRideList() {
  const rides = ref<Ride[]>([])
  const isLoading = ref(true)
  const errorMessage = ref<string | null>(null)
  /** Rutas en las que participa el usuario actual (vacío sin sesión). */
  const participatingRideIds = ref<string[]>([])

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
      return
    } finally {
      isLoading.value = false
    }

    // Las inscripciones del usuario son complementarias (insignia y filtro):
    // si fallan, el listado público sigue siendo utilizable.
    try {
      participatingRideIds.value = await getMyParticipatingRideIds()
    } catch {
      participatingRideIds.value = []
    }
  }

  onMounted(loadRides)

  return { rides, isLoading, errorMessage, participatingRideIds, loadRides }
}
