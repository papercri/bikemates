import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { getSavedRideIds, saveRide, unsaveRide } from '../services/savedRideService'

/**
 * Estado compartido de favoritos para una vista con tarjetas.
 * Solo carga y gestiona guardados si hay sesión iniciada.
 */
export function useSavedRides() {
  const authStore = useAuthStore()
  const savedIds = ref<Set<string>>(new Set())

  async function loadSaved(): Promise<void> {
    if (!authStore.user) {
      savedIds.value = new Set()
      return
    }

    try {
      savedIds.value = new Set(await getSavedRideIds())
    } catch {
      // Silencioso: la lista de favoritos no debe romper el listado principal.
      savedIds.value = new Set()
    }
  }

  function isSaved(rideId: string): boolean {
    return savedIds.value.has(rideId)
  }

  /** Alterna el estado local antes de la respuesta para feedback inmediato. */
  async function toggleSave(rideId: string): Promise<void> {
    if (!authStore.user) return

    const wasSaved = savedIds.value.has(rideId)
    const next = new Set(savedIds.value)

    if (wasSaved) {
      next.delete(rideId)
    } else {
      next.add(rideId)
    }
    savedIds.value = next

    try {
      if (wasSaved) {
        await unsaveRide(rideId)
      } else {
        await saveRide(rideId)
      }
    } catch {
      // Revierte el optimismo si el servidor rechaza la operación.
      savedIds.value = wasSaved ? new Set([...next, rideId]) : new Set([...next].filter((id) => id !== rideId))
    }
  }

  onMounted(loadSaved)

  return { savedIds, isSaved, toggleSave, loadSaved }
}
