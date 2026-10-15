/**
 * Validación pura de la imagen de portada de una ruta.
 * No depende de Vue ni de Supabase para poder testearse de forma aislada.
 */

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

export const INVALID_IMAGE_TYPE_MESSAGE =
  'Selecciona una imagen JPEG, PNG, WebP o AVIF.'

const ALLOWED_IMAGE_TYPES: readonly string[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]

const FILE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

export function validateRideImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return INVALID_IMAGE_TYPE_MESSAGE
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return 'La imagen no puede superar los 5 MB.'
  }

  if (file.size === 0) {
    return 'El archivo seleccionado está vacío.'
  }

  return null
}

/** Extensión normalizada para el storage, o `null` si el tipo no está permitido. */
export function getRideImageExtension(type: string): string | null {
  return FILE_EXTENSIONS[type] ?? null
}
