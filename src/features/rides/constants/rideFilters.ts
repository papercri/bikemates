import type { RideAudience, RideLevel } from '../types'
import { RIDE_LEVELS } from './rideLevels'
import { RIDE_AUDIENCES, RIDE_AUDIENCE_LABELS } from './rideOptions'

/** Valor sentinela que desactiva un filtro del listado público. */
export const RIDE_FILTER_ALL = 'Todos'

export type RideLevelFilter = typeof RIDE_FILTER_ALL | RideLevel
export type RideAudienceFilter = typeof RIDE_FILTER_ALL | RideAudience

export interface RideFilterOption<T> {
  value: T
  label: string
}

export const RIDE_LEVEL_FILTER_OPTIONS: readonly RideFilterOption<RideLevelFilter>[] = [
  { value: RIDE_FILTER_ALL, label: RIDE_FILTER_ALL },
  ...RIDE_LEVELS.map((level) => ({ value: level, label: level })),
]

export const RIDE_AUDIENCE_FILTER_OPTIONS: readonly RideFilterOption<RideAudienceFilter>[] = [
  { value: RIDE_FILTER_ALL, label: RIDE_FILTER_ALL },
  ...RIDE_AUDIENCES.map((audience) => ({
    value: audience,
    label: RIDE_AUDIENCE_LABELS[audience],
  })),
]
