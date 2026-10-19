import {
  INVALID_IMAGE_TYPE_MESSAGE,
  getImageFileExtension,
  validateImageFile,
} from '@/utils/imageValidation'

export { INVALID_IMAGE_TYPE_MESSAGE }

/** Validación de la imagen de portada de una ruta. */
export function validateRideImage(file: File): string | null {
  return validateImageFile(file)
}

/** Extensión normalizada para el storage, o `null` si el tipo no está permitido. */
export function getRideImageExtension(type: string): string | null {
  return getImageFileExtension(type)
}
