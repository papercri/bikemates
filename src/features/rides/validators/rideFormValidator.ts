import type { RideFormValues } from '../types'
import { validateRideImage } from './rideImageValidator'

const TITLE_MIN = 5
const TITLE_MAX = 100
const DESCRIPTION_MIN = 10
const DESCRIPTION_MAX = 3000
const DISTANCE_MAX_KM = 1000
const ELEVATION_MAX_M = 20000
const DURATION_MAX_MINUTES = 24 * 60
const PARTICIPANTS_MIN = 2
const PARTICIPANTS_MAX = 500

function validateTitle(value: string): string | null {
  const length = value.trim().length

  return length < TITLE_MIN || length > TITLE_MAX
    ? 'El título debe tener entre 5 y 100 caracteres.'
    : null
}

function validateDescription(value: string): string | null {
  const length = value.trim().length

  return length < DESCRIPTION_MIN || length > DESCRIPTION_MAX
    ? 'La descripción debe tener entre 10 y 3000 caracteres.'
    : null
}

function validateMeetingPoint(values: RideFormValues): string | null {
  const { latitude, longitude } = values

  const hasPlace = values.meetingPoint.trim().length > 0
  const hasCoordinates =
    latitude !== null &&
    longitude !== null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180

  return hasPlace && hasCoordinates
    ? null
    : 'Busca y selecciona un punto de encuentro válido.'
}

function validateStartsAt(value: string): string | null {
  const date = new Date(value)
  const isFuture =
    value.length > 0 && !Number.isNaN(date.getTime()) && date.getTime() > Date.now()

  return isFuture ? null : 'Selecciona una fecha y hora futuras.'
}

function validateDistanceKm(value: string): string | null {
  if (!value.trim()) {
    return 'Introduce la distancia de la ruta.'
  }

  const distanceKm = Number(value)

  if (!Number.isFinite(distanceKm) || distanceKm <= 0 || distanceKm > DISTANCE_MAX_KM) {
    return 'La distancia debe estar entre 0 y 1000 km.'
  }

  return null
}

function validateElevationM(value: string): string | null {
  if (!value.trim()) {
    return 'Introduce el desnivel positivo.'
  }

  const elevationM = Number(value)

  if (!Number.isFinite(elevationM) || elevationM < 0 || elevationM > ELEVATION_MAX_M) {
    return 'El desnivel debe estar entre 0 y 20000 metros.'
  }

  return null
}

function validateDurationMinutes(value: string): string | null {
  if (!value.trim()) {
    return 'Introduce la duración estimada.'
  }

  const durationMinutes = Number(value)

  if (
    !Number.isInteger(durationMinutes) ||
    durationMinutes <= 0 ||
    durationMinutes > DURATION_MAX_MINUTES
  ) {
    return 'La duración debe ser un entero entre 1 y 1440 minutos.'
  }

  return null
}

function validateMaxParticipants(value: string): string | null {
  if (!value.trim()) {
    return null
  }

  const maxParticipants = Number(value)

  if (
    !Number.isInteger(maxParticipants) ||
    maxParticipants < PARTICIPANTS_MIN ||
    maxParticipants > PARTICIPANTS_MAX
  ) {
    return 'El máximo de participantes debe ser un entero entre 2 y 500.'
  }

  return null
}

/** Acepta vacío (campo opcional) o una URL HTTPS de wikiloc.com sin credenciales. */
export function validateWikilocUrl(value: string): boolean {
  const trimmedValue = value.trim()

  if (!trimmedValue) return true

  try {
    const url = new URL(trimmedValue)

    return (
      url.protocol === 'https:' &&
      (url.hostname === 'wikiloc.com' || url.hostname.endsWith('.wikiloc.com')) &&
      url.pathname.length > 1 &&
      !url.username &&
      !url.password
    )
  } catch {
    return false
  }
}

function validateWikiloc(value: string): string | null {
  return validateWikilocUrl(value) ? null : 'Introduce una URL HTTPS válida de Wikiloc.'
}

function validateImage(image: File | null): string | null {
  return image ? validateRideImage(image) : null
}

/**
 * Valida los valores del formulario de ruta en el mismo orden en que se
 * muestran los campos y devuelve el primer error encontrado, o `null` si es válido.
 */
export function validateRideForm(
  values: RideFormValues,
  image: File | null = null,
): string | null {
  return (
    validateTitle(values.title) ??
    validateDescription(values.description) ??
    validateMeetingPoint(values) ??
    validateStartsAt(values.startsAt) ??
    validateDistanceKm(values.distanceKm) ??
    validateElevationM(values.elevationM) ??
    validateDurationMinutes(values.durationMinutes) ??
    validateMaxParticipants(values.maxParticipants) ??
    validateWikiloc(values.wikilocUrl) ??
    validateImage(image)
  )
}
