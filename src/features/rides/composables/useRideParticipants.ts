
import { ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import {
  getRideParticipants,
  joinRide,
  leaveRide,
} from '../services/rideService'
import type { RideParticipant } from '../types'

export function useRideParticipants(
  rideId: MaybeRefOrGetter<string | null>,
  organizerId: MaybeRefOrGetter<string | null>,
  isAuthenticated: MaybeRefOrGetter<boolean>,
) {
  const participants = ref<RideParticipant[]>([])
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const errorMessage = ref<string | null>(null)

 
async function loadParticipants(): Promise<void> {
    const id = toValue(rideId)
    const ownerId = toValue(organizerId)

    errorMessage.value = null

    if (!toValue(isAuthenticated) || !id || !ownerId) {
        participants.value = []
        isLoading.value = false
        return
    }

  isLoading.value = true

  try {
    participants.value = await getRideParticipants(id, ownerId)
  } catch (error: unknown) {
    console.error('Error al cargar participantes:', error)

    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No se pudieron cargar los participantes.'
  } finally {
    isLoading.value = false
  }
}


  
async function join(): Promise<void> {
  const id = toValue(rideId)

  if (!id || !toValue(isAuthenticated) || isSubmitting.value) {
    return
  }

  isSubmitting.value = true
  errorMessage.value = null

  try {
    await joinRide(id)
    await loadParticipants()
  } catch (error: unknown) {
    console.error('Error al inscribirse en la ruta:', error)

    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No se pudo completar la inscripción.'
  } finally {
    isSubmitting.value = false
  }
}


  async function leave(): Promise<void> {
    const id = toValue(rideId)

    if (!id || !toValue(isAuthenticated) || isSubmitting.value) {
      return
    }

    isSubmitting.value = true
    errorMessage.value = null

    try {
      await leaveRide(id)
      await loadParticipants()
    } catch (error: unknown) {
      errorMessage.value =
        error instanceof Error
          ? error.message
          : 'No se pudo cancelar la inscripción.'
    } finally {
      isSubmitting.value = false
    }
  }

  watch(
    () => [
      toValue(rideId),
      toValue(organizerId),
      toValue(isAuthenticated),
    ],
    loadParticipants,
    { immediate: true },
  )

  return {
    participants,
    isLoading,
    isSubmitting,
    errorMessage,
    loadParticipants,
    join,
    leave,
  }
}
