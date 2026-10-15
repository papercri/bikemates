import { onMounted, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { getRideById } from '../services/rideService'
import type { Ride } from '../types'

/**
 * Carga el detalle de una ruta publicada y la mantiene sincronizada
 * con el identificador recibido (por ejemplo, de la ruta actual).
 */
export function useRideDetail(rideId: MaybeRefOrGetter<string | null>) {
  const ride = ref<Ride | null>(null)
  const isLoading = ref(true)
  const errorMessage = ref<string | null>(null)

  async function loadRide(): Promise<void> {
    const id = toValue(rideId)

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
        error instanceof Error ? error.message : 'No se ha podido cargar la ruta.'
    } finally {
      isLoading.value = false
    }
  }

  onMounted(loadRide)

  watch(() => toValue(rideId), loadRide)

  return { ride, isLoading, errorMessage, loadRide }
}
