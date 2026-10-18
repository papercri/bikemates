import type { Ride } from '../types'

/** Ordenación de salidas para los listados públicos. */

export type RideSortKey = 'date' | 'distance' | 'elevation'
export type SortOrder = 'asc' | 'desc'

function isInvalidDate(iso: string): boolean {
  return Number.isNaN(new Date(iso).getTime())
}

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

/**
 * Ordena por el criterio indicado. Las fechas inválidas quedan siempre al final,
 * tanto en orden ascendente como descendente.
 */
export function sortRides(rides: readonly Ride[], key: RideSortKey, order: SortOrder): Ride[] {
  if (key === 'date') {
    const byDate = sortRidesByDate(rides)

    if (order === 'asc') return byDate

    const valid = byDate.filter((ride) => !isInvalidDate(ride.startsAt))
    const invalid = byDate.filter((ride) => isInvalidDate(ride.startsAt))

    return [...valid.reverse(), ...invalid]
  }

  const sign = order === 'asc' ? 1 : -1
  const metricOf = (ride: Ride): number => (key === 'distance' ? ride.distanceKm : ride.elevationM)

  return [...rides].sort((a, b) => (metricOf(a) - metricOf(b)) * sign)
}
