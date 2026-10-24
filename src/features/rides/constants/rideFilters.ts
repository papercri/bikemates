import type { BikeType, RideAudience, RideLevel } from '../types'
import { RIDE_LEVELS, RIDE_LEVEL_LABELS } from './rideLevels'
import {
  RIDE_AUDIENCES,
  RIDE_AUDIENCE_LABELS,
  RIDE_BIKE_TYPES,
  RIDE_BIKE_TYPE_LABELS,
} from './rideOptions'

/** Valor sentinela que desactiva un filtro del listado público. */
export const RIDE_FILTER_ALL = 'Todos'

export type RideLevelFilter = typeof RIDE_FILTER_ALL | RideLevel
export type RideAudienceFilter = typeof RIDE_FILTER_ALL | RideAudience
export type RideBikeFilter = typeof RIDE_FILTER_ALL | BikeType

/** Criterio de ordenación del listado. `default` es el orden por defecto (fecha de salida). */
export type RideSortOption = 'default' | 'date' | 'distance' | 'elevation' | 'created'

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
  { value: RIDE_FILTER_ALL, label: 'Todos los niveles' },
  ...RIDE_LEVELS.map((level) => ({ value: level, label: RIDE_LEVEL_LABELS[level] })),
]

/**
 * Solo los tipos concretos de bici: `other` (legado) y `all` (salida abierta a
 * cualquier bici) quedan fuera del filtro, que se ocupa del tipo guardado.
 */
export const RIDE_BIKE_FILTER_OPTIONS: readonly RideFilterOption<RideBikeFilter>[] = [
  { value: RIDE_FILTER_ALL, label: 'Todos los tipos de bici' },
  ...RIDE_BIKE_TYPES.filter((bike) => bike !== 'all').map((bike) => ({
    value: bike,
    label: RIDE_BIKE_TYPE_LABELS[bike],
  })),
]

/** El filtro de público excluye `everyone`: ese valor es "Todos los públicos". */
export const RIDE_AUDIENCE_FILTER_OPTIONS: readonly RideFilterOption<RideAudienceFilter>[] = [
  { value: RIDE_FILTER_ALL, label: 'Todos los públicos' },
  ...RIDE_AUDIENCES.filter((audience) => audience !== 'everyone').map((audience) => ({
    value: audience,
    label: RIDE_AUDIENCE_LABELS[audience],
  })),
]

export const RIDE_SORT_OPTIONS: readonly RideFilterOption<RideSortOption>[] = [
  { value: 'default', label: 'Ordenar por' },
  { value: 'date', label: 'Fecha de salida' },
  { value: 'created', label: 'Fecha de creación' },
  { value: 'distance', label: 'Distancia' },
  { value: 'elevation', label: 'Desnivel' },
]
