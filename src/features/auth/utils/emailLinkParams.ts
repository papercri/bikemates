export const EXPIRED_LINK_MESSAGE =
  'El enlace ha caducado o ya no es válido. Solicita uno nuevo.'

export type EmailLinkParams =
  | { kind: 'error'; code: string }
  | { kind: 'recovery'; tokenHash: string | null }
  | { kind: 'registration' }

/**
 * Clasifica el enlace de confirmación/corrección de email según los parámetros
 * que devuelve Supabase en la query string o en el hash.
 */
export function parseEmailLinkParams(search: string, hash: string): EmailLinkParams {
  const params = new URLSearchParams(search)
  const hashParams = new URLSearchParams(hash.slice(1))

  const errorCode = params.get('error_code') ?? hashParams.get('error_code')

  if (errorCode) {
    return { kind: 'error', code: errorCode }
  }

  const type = params.get('type')
  const tokenHash = params.get('token_hash')

  if (type === 'recovery') {
    return { kind: 'recovery', tokenHash }
  }

  return { kind: 'registration' }
}

export function getEmailLinkErrorMessage(code: string): string {
  return code === 'otp_expired'
    ? EXPIRED_LINK_MESSAGE
    : 'No se ha podido verificar el enlace. Solicita uno nuevo.'
}
