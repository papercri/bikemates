/**
 * Une clases condicionales sin depender de utilidades externas.
 * Los consumidores añaden sus clases con `class` (Vue las fusiona en el root).
 */
export type ClassValue = string | false | null | undefined

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ')
}
