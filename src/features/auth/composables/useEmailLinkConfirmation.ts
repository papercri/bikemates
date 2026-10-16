import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { isEmailConfirmed, verifyRecoveryToken } from '../services/authService'
import { useAuthStore } from '../stores/authStore'
import {
  EXPIRED_LINK_MESSAGE,
  getEmailLinkErrorMessage,
  parseEmailLinkParams,
} from '../utils/emailLinkParams'

/**
 * Procesa el enlace de confirmación de correo o de recuperación de
 * contraseña que llega en la URL. Si es un enlace de recuperación válido,
 * se marca la sesión de recuperación y se salta a la página de nueva contraseña.
 */
export function useEmailLinkConfirmation(search: string, hash: string) {
  const router = useRouter()
  const authStore = useAuthStore()

  const isProcessing = ref(true)
  const isConfirmed = ref(false)
  const errorMessage = ref('')

  async function processLink(): Promise<void> {
    try {
      const link = parseEmailLinkParams(search, hash)

      if (link.kind === 'error') {
        errorMessage.value = getEmailLinkErrorMessage(link.code)
        return
      }

      if (link.kind === 'recovery') {
        if (!link.tokenHash) {
          errorMessage.value = 'El enlace de recuperación no contiene un token válido.'
          return
        }

        const verified = await verifyRecoveryToken(link.tokenHash)

        if (!verified) {
          errorMessage.value = EXPIRED_LINK_MESSAGE
          return
        }

        authStore.markRecoverySession()

        await router.replace({ name: 'reset-password' })
        return
      }

      // La confirmación de registro la procesa el cliente de Supabase
      // con el hash de la URL; aquí solo comprobamos si ya salió bien.
      const confirmed = await isEmailConfirmed()

      if (confirmed) {
        isConfirmed.value = true
      } else {
        errorMessage.value = 'No se ha podido confirmar el email. Comprueba el enlace recibido.'
      }
    } catch {
      errorMessage.value = 'Se ha producido un error al verificar el enlace. Inténtalo de nuevo.'
    } finally {
      isProcessing.value = false
    }
  }

  onMounted(processLink)

  return {
    isProcessing,
    isConfirmed,
    errorMessage,
  }
}
