
import { ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { getRideParticipantCount } from '../services/rideService'

export function useRideParticipantCount(
  rideId: MaybeRefOrGetter<string | null>,
) {
  const participantCount = ref<number | null>(null)
  const isLoadingCount = ref(false)
  const countError = ref<string | null>(null)

  async function loadCount(): Promise<void> {
    const id = toValue(rideId)

    if (!id) {
      participantCount.value = null
      countError.value = 'El identificador de la ruta no es válido.'
      return
    }

    isLoadingCount.value = true
    countError.value = null

    try {
      participantCount.value = await getRideParticipantCount(id)
    } catch (error: unknown) {
      countError.value =
        error instanceof Error
          ? error.message
          : 'No se pudo cargar el número de participantes.'
    } finally {
      isLoadingCount.value = false
    }
  }

  watch(() => toValue(rideId), loadCount, { immediate: true })

  return {
    participantCount,
    isLoadingCount,
    countError,
    loadCount,
  }
}
