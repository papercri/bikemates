// oxlint-disable-next-line no-control-regex -- La detección de caracteres de control es intencional.
const CONTROL_CHARACTERS = new RegExp('[\u0000-\u001F\u007F]')

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

/**
 * Reglas de contraseña compartidas por el registro y el cambio de contraseña
 * desde el perfil. Devuelve `null` cuando la contraseña es válida.
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return 'La contraseña es obligatoria.'
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return `La contraseña no puede superar los ${PASSWORD_MAX_LENGTH} caracteres.`
  }

  if (CONTROL_CHARACTERS.test(password)) {
    return 'La contraseña contiene caracteres de control no permitidos.'
  }

  if (!/[A-Za-zÀ-ÿ]/.test(password)) {
    return 'La contraseña debe incluir al menos una letra.'
  }

  if (!/\d/.test(password)) {
    return 'La contraseña debe incluir al menos un número.'
  }

  return null
}
