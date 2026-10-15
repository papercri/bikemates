import { computed, onScopeDispose, ref, toValue, type MaybeRefOrGetter } from 'vue'
import { validateRideImage } from '../validators/rideImageValidator'

/**
 * Estado y handlers de la imagen de portada de una ruta: selección del archivo,
 * vista previa (object URL) y marcado de "quitar imagen actual" en modo edición.
 */
export function useRideImagePicker(initialImageUrl: MaybeRefOrGetter<string | null | undefined>) {
  const selectedImage = ref<File | null>(null)
  const imagePreviewUrl = ref<string | null>(null)
  const imageError = ref<string | null>(null)
  const removeCurrentImage = ref(false)
  const imageInput = ref<HTMLInputElement | null>(null)

  const currentImageVisible = computed(
    () => Boolean(toValue(initialImageUrl)) && !removeCurrentImage.value,
  )

  function revokeImagePreview(): void {
    if (!imagePreviewUrl.value) return

    URL.revokeObjectURL(imagePreviewUrl.value)
    imagePreviewUrl.value = null
  }

  function clearSelectedImage(): void {
    const hadNewImage = selectedImage.value !== null

    revokeImagePreview()
    selectedImage.value = null
    imageError.value = null

    if (hadNewImage) {
      removeCurrentImage.value = false
    } else {
      removeCurrentImage.value = Boolean(toValue(initialImageUrl))
    }

    if (imageInput.value) {
      imageInput.value.value = ''
    }
  }

  function handleImageChange(event: Event): void {
    const input = event.target

    if (!(input instanceof HTMLInputElement)) return

    const file = input.files?.[0]

    if (!file) return

    const error = validateRideImage(file)

    if (error) {
      input.value = ''
      imageError.value = error
      return
    }

    revokeImagePreview()

    selectedImage.value = file
    imagePreviewUrl.value = URL.createObjectURL(file)
    imageError.value = null
    removeCurrentImage.value = false
  }

  onScopeDispose(revokeImagePreview)

  return {
    selectedImage,
    imagePreviewUrl,
    imageError,
    removeCurrentImage,
    imageInput,
    currentImageVisible,
    clearSelectedImage,
    handleImageChange,
  }
}
