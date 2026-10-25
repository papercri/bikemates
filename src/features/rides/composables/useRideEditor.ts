import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { deleteRideImage, uploadRideImage } from '../services/rideImageService'
import { getRideForEdit, updateRide } from '../services/rideService'
import {
  buildRideInput,
  createEmptyRideFormValues,
  mapRideToFormValues,
} from '../utils/rideFormMapping'
import { MEETING_POINT_ERROR } from '../validators/rideFormValidator'
import type { Ride, RideFormSubmission } from '../types'

/**
 * Edita una ruta existente: la carga al montar y la guarda al enviar
 * el formulario. El orden importa: la imagen nueva se sube primero y
 * la anterior solo se borra cuando la actualización ha salido bien.
 */
export function useRideEditor(rideId: string | null) {
  const router = useRouter()

  const ride = ref<Ride | null>(null)
  const isLoading = ref(true)
  const isSubmitting = ref(false)
  const errorMessage = ref<string | null>(null)
  const initialValues = ref(createEmptyRideFormValues())

  async function loadRide(): Promise<void> {
    if (!rideId) {
      errorMessage.value = 'El identificador de la ruta no es válido.'
      isLoading.value = false
      return
    }

    try {
      const loadedRide = await getRideForEdit(rideId)

      ride.value = loadedRide
      initialValues.value = mapRideToFormValues(loadedRide)
    } catch (error: unknown) {
      console.error('Error al cargar la ruta:', error)
      errorMessage.value =
        'No se ha podido cargar la ruta. Comprueba que existe y que tienes permiso para editarla.'
    } finally {
      isLoading.value = false
    }
  }

  async function saveRide(payload: RideFormSubmission): Promise<void> {
    if (isSubmitting.value || !ride.value) return

    isSubmitting.value = true
    errorMessage.value = null

    const currentRide = ride.value

    let uploadedImagePath: string | null = null
    let updateCompleted = false

    try {
      if (payload.image) {
        uploadedImagePath = await uploadRideImage(payload.image)
      }

      let imagePath = currentRide.imagePath

      if (uploadedImagePath) {
        imagePath = uploadedImagePath
      } else if (payload.removeCurrentImage) {
        imagePath = null
      }

      const input = buildRideInput(payload.values, imagePath)

      if (!input) {
        errorMessage.value = MEETING_POINT_ERROR
        return
      }

      await updateRide(currentRide.id, input)
      updateCompleted = true

      // La ruta ya está guardada con la imagen nueva: ahora sí
      // podemos borrar la anterior sin miedo.
      if (currentRide.imagePath !== imagePath && currentRide.imagePath) {
        try {
          await deleteRideImage(currentRide.imagePath)
        } catch (error: unknown) {
          console.error('No se ha podido eliminar la imagen anterior:', error)
        }
      }

      await router.push({
        name: 'ride-detail',
        params: { id: currentRide.id },
      })
    } catch (error: unknown) {
      console.error('Error al actualizar la ruta:', error)

      // Si la actualización no llegó a guardarse, la imagen nueva sobra.
      if (!updateCompleted && uploadedImagePath) {
        try {
          await deleteRideImage(uploadedImagePath)
        } catch (cleanupError: unknown) {
          console.error('No se ha podido limpiar la nueva imagen:', cleanupError)
        }
      }

      errorMessage.value = 'No se han podido guardar los cambios. Inténtalo de nuevo.'
    } finally {
      isSubmitting.value = false
    }
  }

  onMounted(loadRide)

  return {
    ride,
    isLoading,
    isSubmitting,
    errorMessage,
    initialValues,
    saveRide,
  }
}
