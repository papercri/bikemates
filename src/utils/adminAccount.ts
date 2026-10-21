/** Cuenta única autorizada a usar el nombre «Admin». */
export const ADMIN_ACCOUNT_EMAIL = 'papercri@gmail.com'

/** El nombre reservado es exactamente «Admin», ignorando mayúsculas y espacios. */
export function isReservedAdminName(name: string): boolean {
  return name.trim().toLowerCase() === 'admin'
}

/** Solo la cuenta administradora puede usar el nombre reservado. */
export function canUseReservedAdminName(email: string | null | undefined): boolean {
  return (email ?? '').trim().toLowerCase() === ADMIN_ACCOUNT_EMAIL
}
