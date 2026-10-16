import type { RideAudience, RideLevel } from '../types'
import { RIDE_LEVELS } from './rideLevels'
import { RIDE_AUDIENCES, RIDE_AUDIENCE_LABELS } from './rideOptions'

/** Valor sentinela que desactiva un filtro del listado público. */
export const RIDE_FILTER_ALL = 'Todos'

export type RideLevelFilter = typeof RIDE_FILTER_ALL | RideLevel
export type RideAudienceFilter = typeof RIDE_FILTER_ALL | RideAudience

/** Criterio de ordenación del listado. */
export type RideSortOption = 'date' | 'distance' | 'elevation'

/** Ventana temporal mostrada: salidas próximas o ya celebradas. */
export type RideTimeframe = 'upcoming' | 'past'

export interface RideFilterOption<T> {
  value: T
  label: string
}

/**
 * Las etiquetas visibles sustituyen a un label permanente: el control se ordena así de
 * compacto y el nombre accesible se conserva en el componente.
 */
export const RIDE_LEVEL_FILTER_OPTIONS: readonly RideFilterOption<RideLevelFilter>[] = [
  { value: RIDE_FILTER_ALL, label: 'Cualquier nivel' },
  ...RIDE_LEVELS.map((level) => ({ value: level, label: level })),
]

export const RIDE_AUDIENCE_FILTER_OPTIONS: readonly RideFilterOption<RideAudienceFilter>[] = [
  { value: RIDE_FILTER_ALL, label: 'Cualquier público' },
  ...RIDE_AUDIENCES.map((audience) => ({
    value: audience,
    label: RIDE_AUDIENCE_LABELS[audience],
  })),
]

export const RIDE_SORT_OPTIONS: readonly RideFilterOption<RideSortOption>[] = [
  { value: 'date', label: 'Por fecha' },
  { value: 'distance', label: 'Por distancia' },
  { value: 'elevation', label: 'Por desnivel' },
]
