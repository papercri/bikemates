import type { RideFormValues } from '../types'
import { validateRideImage } from './rideImageValidator'

const TITLE_MIN = 5
const TITLE_MAX = 100
const DESCRIPTION_MIN = 10
const DESCRIPTION_MAX = 8000
const DISTANCE_MAX_KM = 1000
const ELEVATION_MAX_M = 20000
const DURATION_MAX_MINUTES = 24 * 60
const PARTICIPANTS_MIN = 2
const PARTICIPANTS_MAX = 500

/**
 * Palabras ofensivas o sexuales no admitidas en el título o la descripción.
 * Se comparan sobre el texto normalizado (minúsculas, sin acentos y separado en
 * palabras) usando el prefijo de cada palabra, de modo que también se capturan
 * variantes como "putas" o "fucking" sin incurrir en falsos positivos
 * ("class" no empieza por ninguna palabra de la lista).
 */
const BLOCKED_WORDS: readonly string[] = [
  'puta',
  'puto',
  'cabron',
  'mierda',
  'joder',
  'jodido',
  'gilipollas',
  'idiota',
  'imbecil',
  'estupido',
  'subnormal',
  'mongolo',
  'malparido',
  'malnacido',
  'follar',
  'carajo',
  'culo',
  'fuck',
  'shit',
  'bitch',
  'asshole',
  'dick',
  'pussy',
  'cunt',
  'whore',
  'bastard',
  'slut',
  'nigger',
  'faggot',
  'porno',
  'pornografia',
  'erotic',
  'desnudo',
  'desnuda',
  'orgasmo',
  'sexo',
]

/** Divide el texto en palabras normalizadas para la criba de contenido. */
function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
}

function containsBlockedContent(value: string): boolean {
  const words = tokenize(value)
  return words.some((word) => BLOCKED_WORDS.some((blocked) => word.startsWith(blocked)))
}

function validateTitle(value: string): string | null {
  if (containsBlockedContent(value)) {
    return 'El título contiene palabras no permitidas.'
  }

  const length = value.trim().length

  return length < TITLE_MIN || length > TITLE_MAX
    ? 'El título debe tener entre 5 y 100 caracteres.'
    : null
}

function validateDescription(value: string): string | null {
  if (containsBlockedContent(value)) {
    return 'La descripción contiene palabras no permitidas.'
  }

  const length = value.trim().length

  return length < DESCRIPTION_MIN || length > DESCRIPTION_MAX
    ? `La descripción debe tener entre ${DESCRIPTION_MIN} y ${DESCRIPTION_MAX} caracteres.`
    : null
}

/** Error compartido cuando falta el punto de encuentro (mapa o detalles). */
export const MEETING_POINT_ERROR =
  'Selecciona un punto de encuentro en el mapa o describe cómo llegar.'

function validateMeetingPoint(values: RideFormValues): string | null {
  const { latitude, longitude } = values

  // Basta con cualquiera de las dos formas de indicar el punto: el lugar
  // elegido en el mapa (con coordenadas) o los detalles escritos a mano.
  const hasDetails = values.meetingPointDetails.trim().length > 0
  const hasCoordinates =
    latitude !== null &&
    longitude !== null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180

  return hasCoordinates || hasDetails ? null : MEETING_POINT_ERROR
}

function validateStartsAt(value: string): string | null {
  const date = new Date(value)
  const isFuture = value.length > 0 && !Number.isNaN(date.getTime()) && date.getTime() > Date.now()

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
  // Campo opcional: en vacío se persiste como 0 m de desnivel.
  if (!value.trim()) {
    return null
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

/**
 * Acepta vacío (campo opcional) o una URL HTTPS sin credenciales. El enlace
 * puede apuntar a cualquier plataforma de recorridos o eventos (Wikiloc,
 * Strava, Meetup, etc.), no solo a un dominio concreto.
 */
export function validateRouteUrl(value: string): boolean {
  const trimmedValue = value.trim()

  if (!trimmedValue) return true

  try {
    const url = new URL(trimmedValue)

    return url.protocol === 'https:' && url.hostname.length > 0 && !url.username && !url.password
  } catch {
    return false
  }
}

function validateRouteLink(value: string): string | null {
  return validateRouteUrl(value)
    ? null
    : 'Introduce una URL HTTPS válida (Wikiloc, Strava, Meetup…).'
}

function validateImage(image: File | null): string | null {
  return image ? validateRideImage(image) : null
}

/** Campos del formulario de ruta que pueden tener un error propio. */
export type RideFormField =
  | 'title'
  | 'description'
  | 'meetingPoint'
  | 'startsAt'
  | 'distanceKm'
  | 'elevationM'
  | 'durationMinutes'
  | 'maxParticipants'
  | 'wikilocUrl'
  | 'image'

/** Error de cada campo, o `null` cuando el campo es válido. */
export type RideFormErrors = Record<RideFormField, string | null>

/** Orden de los campos tal y como se muestran en el formulario. */
const FIELD_ORDER: readonly RideFormField[] = [
  'title',
  'description',
  'meetingPoint',
  'startsAt',
  'distanceKm',
  'elevationM',
  'durationMinutes',
  'maxParticipants',
  'wikilocUrl',
  'image',
]

/** Objeto de errores sin fallos, útil como estado inicial. */
export function emptyRideFormErrors(): RideFormErrors {
  const errors = {} as Record<RideFormField, string | null>
  for (const field of FIELD_ORDER) {
    errors[field] = null
  }
  return errors
}

/**
 * Valida cada campo del formulario de ruta por separado para poder mostrar el
 * error junto a su control y, a la vez, un resumen junto al botón de envío.
 */
export function validateRideFormFields(
  values: RideFormValues,
  image: File | null = null,
): RideFormErrors {
  return {
    title: validateTitle(values.title),
    description: validateDescription(values.description),
    meetingPoint: validateMeetingPoint(values),
    startsAt: validateStartsAt(values.startsAt),
    distanceKm: validateDistanceKm(values.distanceKm),
    elevationM: validateElevationM(values.elevationM),
    durationMinutes: validateDurationMinutes(values.durationMinutes),
    maxParticipants: validateMaxParticipants(values.maxParticipants),
    wikilocUrl: validateRouteLink(values.wikilocUrl),
    image: validateImage(image),
  }
}

/** Devuelve el primer error en el orden de visualización, o `null` si no hay ninguno. */
export function firstRideFormError(errors: RideFormErrors): string | null {
  for (const field of FIELD_ORDER) {
    const error = errors[field]
    if (error !== null) return error
  }
  return null
}

/**
 * Valida los valores del formulario de ruta en el mismo orden en que se
 * muestran los campos y devuelve el primer error encontrado, o `null` si es válido.
 */
export function validateRideForm(values: RideFormValues, image: File | null = null): string | null {
  return firstRideFormError(validateRideFormFields(values, image))
}
