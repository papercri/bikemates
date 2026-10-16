/** Ordenación de salidas para los listados públicos. */

/**
 * Ordena por fecha de salida, de la más próxima a la más lejana.
 * Las fechas inválidas se colocan al final para no intercalar rutas con datos corruptos.
 */
export function sortRidesByDate<T extends { startsAt: string }>(rides: readonly T[]): T[] {
  const toTime = (ride: T): number => {
    const time = new Date(ride.startsAt).getTime()
    return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time
  }

  return [...rides].sort((a, b) => toTime(a) - toTime(b))
}
