/**
 * Minúsculas, sin acentos y sin espacios sobrantes, para que "collserola" encuentre
 * "Vuelta por Collsérrola" sin exigir al usuario la tilde exacta.
 */
export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}
