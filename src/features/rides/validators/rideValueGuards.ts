import type { BikeType, RideAudience, RideLevel, RideStatus } from '../types'
import {
  RIDE_AUDIENCES,
  RIDE_BIKE_TYPE_VALUES,
  RIDE_STATUSES,
} from '../constants/rideOptions'
import { RIDE_LEVELS } from '../constants/rideLevels'

/**
 * Narrowing de los valores que llegan desde la base de datos.
 * Comprueban contra las listas de constants para no duplicar el dominio.
 */
export function isBikeType(value: string): value is BikeType {
  return RIDE_BIKE_TYPE_VALUES.some((item) => item === value)
}

export function isRideLevel(value: string): value is RideLevel {
  return RIDE_LEVELS.some((item) => item === value)
}

export function isRideAudience(value: string): value is RideAudience {
  return RIDE_AUDIENCES.some((item) => item === value)
}

export function isRideStatus(value: string): value is RideStatus {
  return RIDE_STATUSES.some((item) => item === value)
}
