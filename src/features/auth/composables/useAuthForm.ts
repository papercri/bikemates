import { ref } from 'vue'

type DescribeError = string | ((error: unknown) => string)

/**
 * Estado de envío compartido por las vistas de autenticación:
 * bloqueo del botón y mensajes de error y de éxito.
 */
export function useAuthForm() {
  const isSubmitting = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  function clearMessages(): void {
    errorMessage.value = ''
    successMessage.value = ''
  }

  /**
   * Ejecuta la acción del formulario gestionando el estado de envío.
   * Si la acción falla, el mensaje puede ser una cadena fija o un mapeador
   * del error (por ejemplo, para mostrar el mensaje del servicio).
   */
  async function submit(action: () => Promise<void>, describeError: DescribeError): Promise<void> {
    clearMessages()
    isSubmitting.value = true

    try {
      await action()
    } catch (error: unknown) {
      errorMessage.value =
        typeof describeError === 'function' ? describeError(error) : describeError
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isSubmitting,
    errorMessage,
    successMessage,
    clearMessages,
    submit,
  }
}
