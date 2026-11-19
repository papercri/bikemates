import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { deleteRideImage, uploadRideImage } from '../services/rideImageService'
import { createRide, RideServiceError } from '../services/rideService'
import { buildRideInput } from '../utils/rideFormMapping'
import { MEETING_POINT_ERROR } from '../validators/rideFormValidator'
import type { CreateRideInput, RideFormServerError, RideFormSubmission } from '../types'

/**
 * Publica una ruta nueva: sube la imagen si la hay, crea la ruta
 * y te lleva a su página. Si algo falla a mitad, borra la imagen
 * que hubiese subido para no dejar archivos huérfanos.
 */
export function useRideCreator() {
  const router = useRouter()
  const isSubmitting = ref(false)
  const errorMessage = ref<string | null>(null)
  const fieldError = ref<RideFormServerError | null>(null)

  async function createPublishedRide(payload: RideFormSubmission): Promise<void> {
    if (isSubmitting.value) return

    errorMessage.value = null
    fieldError.value = null

    // Sin punto de encuentro no hay ruta. El resto de campos
    // ya los valida el propio RideForm antes de llegar aquí.
    const rideInput = buildRideInput(payload.values, null)

    if (!rideInput) {
      fieldError.value = { field: 'meetingPoint', message: MEETING_POINT_ERROR }
      return
    }

    const input: CreateRideInput = { ...rideInput, status: 'published' }

    isSubmitting.value = true

    let uploadedImagePath: string | null = null
    let rideCreated = false

    try {
      if (payload.image) {
        uploadedImagePath = await uploadRideImage(payload.image)
        input.imagePath = uploadedImagePath
      }

      const ride = await createRide(input)
      rideCreated = true

      await router.push({
        name: 'ride-detail',
        params: { id: ride.id },
      })
    } catch (error: unknown) {
      // Si la ruta no llegó a crearse, la imagen que subimos ya no tiene dueño.
      if (uploadedImagePath && !rideCreated) {
        try {
          await deleteRideImage(uploadedImagePath)
        } catch {
          // No podemos hacer más aquí: el usuario ya verá el error principal.
        }
      }

      if (rideCreated) {
        errorMessage.value = 'La ruta se ha publicado, pero no se ha podido abrir su página.'
      } else if (error instanceof RideServiceError && error.field) {
        fieldError.value = { field: error.field, message: error.message }
      } else {
        errorMessage.value =
          error instanceof Error ? error.message : 'No se ha podido publicar la ruta.'
      }
    } finally {
      isSubmitting.value = false
    }
  }

  return { isSubmitting, errorMessage, fieldError, createPublishedRide }
}
