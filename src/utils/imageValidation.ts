/**
 * Reglas compartidas de validación de imágenes subidas por el usuario.
 * Funciones puras, sin dependencias: las usan la portada de rutas y el
 * avatar del perfil, que hoy aplican los mismos criterios.
 */

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

export const INVALID_IMAGE_TYPE_MESSAGE = 'Selecciona una imagen JPEG, PNG, WebP o AVIF.'
export const IMAGE_TOO_LARGE_MESSAGE = 'La imagen no puede superar los 5 MB.'
export const EMPTY_IMAGE_MESSAGE = 'El archivo seleccionado está vacío.'

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

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return INVALID_IMAGE_TYPE_MESSAGE
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return IMAGE_TOO_LARGE_MESSAGE
  }

  if (file.size === 0) {
    return EMPTY_IMAGE_MESSAGE
  }

  return null
}

/** Extensión normalizada para el storage, o `null` si el tipo no está permitido. */
export function getImageFileExtension(type: string): string | null {
  return FILE_EXTENSIONS[type] ?? null
}
