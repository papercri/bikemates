import { onMounted, ref } from 'vue'
import { getMyProfile } from '../services/profileService'
import type { Profile } from '../types'

/** Carga el perfil del usuario autenticado al montar el componente que lo use. */
export function useProfile() {
  const profile = ref<Profile | null>(null)
  const isLoading = ref(true)
  const errorMessage = ref<string | null>(null)

  async function loadProfile(): Promise<void> {
    isLoading.value = true
    errorMessage.value = null

    try {
      profile.value = await getMyProfile()
    } catch (error: unknown) {
      errorMessage.value =
        error instanceof Error ? error.message : 'No se ha podido cargar tu perfil.'
    } finally {
      isLoading.value = false
    }
  }

  onMounted(loadProfile)

  return { profile, isLoading, errorMessage, loadProfile }
}
