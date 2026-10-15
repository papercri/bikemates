/** Utilidades puras de fechas, sin dependencias de Vue. */

/**
 * Convierte una fecha ISO al valor esperado por
 * `<input type="datetime-local">` en la zona horaria local.
 */
export function toLocalDateTime(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)

  return localDate.toISOString().slice(0, 16)
}
