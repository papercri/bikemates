import { toLocalDateTime } from '@/utils/dates'
import type { Ride, RideFormValues, UpdateRideInput } from '../types'

/** Valores por defecto del formulario, con overrides para crear o editar. */
export function createEmptyRideFormValues(overrides: Partial<RideFormValues> = {}): RideFormValues {
  return {
    title: '',
    description: '',
    startsAt: '',
    meetingPoint: '',
    latitude: null,
    longitude: null,
    bikeType: 'road',
    level: 'Iniciación',
    distanceKm: '',
    elevationM: '',
    durationMinutes: '',
    wikilocUrl: '',
    audience: 'everyone',
    maxParticipants: '',
    isCircular: true,
    ...overrides,
  }
}

/** Transforma una ruta cargada de la base de datos en valores para el formulario. */
export function mapRideToFormValues(ride: Ride): RideFormValues {
  return {
    title: ride.title,
    description: ride.description,
    startsAt: toLocalDateTime(ride.startsAt),
    meetingPoint: ride.meetingPoint,
    latitude: ride.latitude,
    longitude: ride.longitude,
    bikeType: ride.bikeType,
    level: ride.level,
    distanceKm: String(ride.distanceKm),
    elevationM: String(ride.elevationM),
    durationMinutes: String(ride.durationMinutes),
    wikilocUrl: ride.wikilocUrl ?? '',
    audience: ride.audience,
    maxParticipants: ride.maxParticipants === null ? '' : String(ride.maxParticipants),
    isCircular: ride.routeType !== 'round_trip',
  }
}

/**
 * Transforma los valores del formulario en el payload de persistencia.
 * Devuelve `null` si falta el punto de encuentro válido (defensa compartida
 * entre crear y editar; la validación completa vive en rideFormValidator).
 */
export function buildRideInput(
  values: RideFormValues,
  imagePath: string | null,
): UpdateRideInput | null {
  const { latitude, longitude } = values

  if (latitude === null || longitude === null) {
    return null
  }

  return {
    title: values.title.trim(),
    description: values.description.trim(),
    startsAt: new Date(values.startsAt).toISOString(),
    meetingPoint: values.meetingPoint.trim(),
    latitude,
    longitude,
    bikeType: values.bikeType,
    level: values.level,
    distanceKm: Number(values.distanceKm),
    elevationM: Number(values.elevationM),
    durationMinutes: Number(values.durationMinutes),
    imagePath,
    wikilocUrl: values.wikilocUrl.trim() || null,
    audience: values.audience,
    maxParticipants: values.maxParticipants.trim() ? Number(values.maxParticipants) : null,
    routeType: values.isCircular ? 'circular' : 'round_trip',
  }
}
