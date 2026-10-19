import { validateImageFile } from '@/utils/imageValidation'

// oxlint-disable-next-line no-control-regex -- La detección de caracteres de control es intencional.
const CONTROL_CHARACTERS = new RegExp('[\u0000-\u001F\u007F]')

export const DISPLAY_NAME_MIN_LENGTH = 2
export const DISPLAY_NAME_MAX_LENGTH = 60

/**
 * Valida el nombre visible del perfil. Las mismas reglas que el registro.
 * Devuelve `null` cuando el nombre es válido.
 */
export function validateDisplayName(name: string): string | null {
  const trimmed = name.trim()

  if (!trimmed) {
    return 'El nombre es obligatorio.'
  }

  if (trimmed.length < DISPLAY_NAME_MIN_LENGTH) {
    return `El nombre debe tener al menos ${DISPLAY_NAME_MIN_LENGTH} caracteres.`
  }

  if (trimmed.length > DISPLAY_NAME_MAX_LENGTH) {
    return `El nombre no puede superar los ${DISPLAY_NAME_MAX_LENGTH} caracteres.`
  }

  if (CONTROL_CHARACTERS.test(trimmed)) {
    return 'El nombre contiene caracteres no permitidos.'
  }

  if (/[<>]/.test(trimmed)) {
    return 'El nombre no puede contener etiquetas HTML.'
  }

  return null
}

/** Valida la imagen del avatar con las reglas compartidas de imágenes. */
export function validateAvatarImage(file: File): string | null {
  return validateImageFile(file)
}
