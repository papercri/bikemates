/** Utilidades puras de fechas, sin dependencias de Vue. */

const RIDE_DATE_FORMAT = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
})

/** Fecha y hora de salida en formato largo en español. */
export function formatRideDate(dateString: string): string {
  return RIDE_DATE_FORMAT.format(new Date(dateString))
}

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
