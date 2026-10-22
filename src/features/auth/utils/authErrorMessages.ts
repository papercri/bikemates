/**
 * Traducción de los errores de autenticación a un mensaje de usuario.
 *
 * El SDK devuelve mensajes genéricos, a menudo en inglés y con detalles
 * internos que no ayudan a quien usa la app. Aquí se sustituyen por textos
 * cortos en español que solo explican qué ha pasado y qué hacer.
 */

const RETRY_LATER = 'Demasiados intentos. Espera unos minutos y vuelve a probar.'

/** Mensaje para correos ya registrados, usado por código y por patrón. */
const EMAIL_TAKEN = 'Ya existe una cuenta con ese correo. Inicia sesión o prueba con otro.'
const WRONG_CREDENTIALS = 'El correo o la contraseña no son correctos.'

/** Códigos que el SDK expone en `error.code`. */
const CODE_MESSAGES: Readonly<Record<string, string>> = {
  user_already_exists: EMAIL_TAKEN,
  email_exists: EMAIL_TAKEN,
  invalid_credentials: WRONG_CREDENTIALS,
  session_expired: 'Tu sesión ha caducado. Inicia sesión de nuevo.',
  refresh_token_not_found: 'Tu sesión ha caducado. Inicia sesión de nuevo.',
  email_not_confirmed: 'Confirma tu correo electrónico antes de continuar.',
  user_disabled: 'Esta cuenta no está activa. Contacta con soporte.',
  over_email_send_rate_limit: RETRY_LATER,
  email_rate_limit_exceeded: RETRY_LATER,
  over_request_rate_limit: RETRY_LATER,
  rate_limit_exceeded: RETRY_LATER,
  signup_disabled: 'El registro no está disponible ahora mismo. Inténtalo más tarde.',
} as const

const GENERIC_ERROR = 'No se ha podido completar la operación. Inténtalo de nuevo.'
const NETWORK_ERROR = 'No hay conexión con el servidor. Revísala e inténtalo de nuevo.'

/** Palabras clave en el mensaje crudo, por si el código no viene informado. */
const MESSAGE_PATTERNS: ReadonlyArray<{ pattern: RegExp; message: string }> = [
  { pattern: /already (been )?registered|already exists/i, message: EMAIL_TAKEN },
  { pattern: /invalid login credentials/i, message: WRONG_CREDENTIALS },
  { pattern: /password/i, message: 'La contraseña no cumple los requisitos. Prueba con otra.' },
  { pattern: /rate limit|too many requests/i, message: RETRY_LATER },
  { pattern: /failed to fetch|networkerror|load failed/i, message: NETWORK_ERROR },
]

/** Extrae código y mensaje crudo si el objeto los trae (AuthError del SDK). */
function readAuthDetails(error: Error): { code?: string; message: string } {
  if (!('code' in error)) {
    return { message: error.message }
  }

  const code: unknown = error.code
  return {
    code: typeof code === 'string' ? code : undefined,
    message: error.message,
  }
}

/**
 * Devuelve un mensaje apto para pantalla a partir de cualquier error
 * lanzado por la capa de autenticación (o por red).
 */
export function describeAuthError(error: unknown): string {
  if (!(error instanceof Error)) {
    return GENERIC_ERROR
  }

  if (error instanceof TypeError) {
    return NETWORK_ERROR
  }

  const { code, message: raw } = readAuthDetails(error)

  if (code !== undefined) {
    const byCode = CODE_MESSAGES[code]
    if (byCode !== undefined) return byCode
  }

  for (const { pattern, message } of MESSAGE_PATTERNS) {
    if (pattern.test(raw)) return message
  }

  return GENERIC_ERROR
}
