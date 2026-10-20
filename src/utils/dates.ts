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

const RIDE_DAY_FORMAT = new Intl.DateTimeFormat('es-ES', { day: 'numeric' })
const RIDE_MONTH_FORMAT = new Intl.DateTimeFormat('es-ES', { month: 'short' })

export interface RideDateParts {
  /** Día del mes sin prefijos, para la cifra grande del raíl. */
  day: string
  /** Mes abreviado en español, p. ej. `may`. */
  month: string
}

/**
 * Día y mes de la salida, pensados para el raíl de fecha de una ruta.
 * Devuelve cadenas vacías si la fecha no es válida.
 */
export function getRideDateParts(dateString: string): RideDateParts {
  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return { day: '', month: '' }
  }

  return {
    day: RIDE_DAY_FORMAT.format(date),
    month: RIDE_MONTH_FORMAT.format(date),
  }
}

const RIDE_SHORT_DATE_FORMAT = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: '2-digit',
})

/** Fecha corta de la salida en formato `dd/MM`, p. ej. `26/10`. */
export function formatRideShortDate(dateString: string): string {
  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return RIDE_SHORT_DATE_FORMAT.format(date)
}

/**
 * `true` cuando la fecha de salida ya ha pasado respecto a `now` (por defecto, el momento
 * actual). Las fechas inválidas se consideran futuras para no atenuar la tarjeta.
 */
export function isRidePast(dateString: string, now: Date = new Date()): boolean {
  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) return false

  return date.getTime() <= now.getTime()
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
