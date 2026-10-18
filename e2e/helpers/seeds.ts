import type { DbParticipant, DbRide, E2eSeedUser, PlaceResult } from './supabase-mock'

export const ORGANIZER: E2eSeedUser = {
  id: 'user-1',
  email: 'ana@example.com',
  displayName: 'Ana Pedal',
  password: 'pedaleando123',
}

export const MEMBER: E2eSeedUser = {
  id: 'user-2',
  email: 'bruno@example.com',
  displayName: 'Bruno Ruta',
  password: 'pedaleando123',
}

export const STRANGER: E2eSeedUser = {
  id: 'user-3',
  email: 'clara@example.com',
  displayName: 'Clara Monte',
  password: 'pedaleando123',
}

/** Fecha futura fija: evita que los tests caduquen con el tiempo. */
function futureDate(daysFromNow: number): string {
  const date = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000)
  return date.toISOString()
}

export function makeRide(overrides: Partial<DbRide> = {}): DbRide {
  return {
    id: 'ride-1',
    organizer_id: ORGANIZER.id,
    title: 'Vuelta por Collserola',
    description:
      'Recorrido sencillo por pista forestal con parada de café. Trae agua y cámara antipinchazos.',
    starts_at: futureDate(7),
    meeting_point: 'Plaça de l’Església, Barcelona',
    latitude: 41.4036,
    longitude: 2.1744,
    bike_type: 'gravel',
    level: 'Intermedio',
    distance_km: 32,
    elevation_m: 650,
    duration_minutes: 150,
    image_path: null,
    wikiloc_url: null,
    audience: 'everyone',
    max_participants: 30,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

export function makeParticipant(
  rideId: string,
  user: E2eSeedUser,
  overrides: Partial<DbParticipant> = {},
): DbParticipant {
  return {
    ride_id: rideId,
    user_id: user.id,
    joined_at: new Date().toISOString(),
    profile: {
      id: user.id,
      display_name: user.displayName,
      avatar_url: null,
    },
    ...overrides,
  }
}

export function makePlace(overrides: Partial<PlaceResult> = {}): PlaceResult {
  return {
    place_id: 1001,
    display_name: 'Monistrol de Montserrat, Cataluña, España',
    lat: '41.7633',
    lon: '1.8428',
    ...overrides,
  }
}
