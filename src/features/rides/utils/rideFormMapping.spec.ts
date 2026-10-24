import { describe, expect, it } from 'vitest'
import { toLocalDateTime } from '@/utils/dates'
import type { Ride, RideFormValues } from '../types'
import { buildRideInput, createEmptyRideFormValues, mapRideToFormValues } from './rideFormMapping'

function rideOf(overrides: Partial<Ride> = {}): Ride {
  return {
    id: 'ride-1',
    organizerId: 'organizer-1',
    title: 'Vuelta por Collserola',
    description: 'Recorrido sencillo por pista forestal.',
    startsAt: '2026-06-10T09:30:00.000Z',
    meetingPoint: 'Plaça de l’Església, Barcelona',
    latitude: 41.4,
    longitude: 2.17,
    bikeType: 'gravel',
    level: 'Intermedio',
    distanceKm: 30,
    elevationM: 300,
    durationMinutes: 120,
    imagePath: 'user-1/portada.jpg',
    wikilocUrl: 'https://www.wikiloc.com/ruta/1',
    audience: 'women',
    maxParticipants: 12,
    routeType: null,
    status: 'published',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    imageUrl: 'https://cdn.example/portada.jpg',
    ...overrides,
  }
}

function validFormValues(overrides: Partial<RideFormValues> = {}): RideFormValues {
  return {
    title: ' Vuelta por Collserola ',
    description: '  Recorrido sencillo por pista forestal.  ',
    startsAt: '2026-06-10T11:30',
    meetingPoint: '  Plaça de l’Església, Barcelona  ',
    latitude: 41.4,
    longitude: 2.17,
    bikeType: 'gravel',
    level: 'Intermedio',
    distanceKm: '30',
    elevationM: '300',
    durationMinutes: '120',
    wikilocUrl: '  https://www.wikiloc.com/ruta/1  ',
    audience: 'everyone',
    maxParticipants: '12',
    isCircular: true,
    ...overrides,
  }
}

describe('createEmptyRideFormValues', () => {
  it('returns the empty defaults shared by the create form', () => {
    expect(createEmptyRideFormValues()).toEqual({
      title: '',
      description: '',
      startsAt: '',
      meetingPoint: '',
      latitude: null,
      longitude: null,
      bikeType: 'all',
      level: 'Iniciación',
      distanceKm: '',
      elevationM: '0',
      durationMinutes: '',
      wikilocUrl: '',
      audience: 'everyone',
      maxParticipants: '',
      isCircular: false,
    })
  })

  it('applies the provided overrides on top of the defaults', () => {
    const values = createEmptyRideFormValues({ bikeType: 'mtb', level: 'Avanzado', latitude: 40.4 })

    expect(values.bikeType).toBe('mtb')
    expect(values.level).toBe('Avanzado')
    expect(values.latitude).toBe(40.4)
    expect(values.title).toBe('')
  })
})

describe('mapRideToFormValues', () => {
  it('converts a ride into editable form values', () => {
    expect(mapRideToFormValues(rideOf())).toEqual({
      title: 'Vuelta por Collserola',
      description: 'Recorrido sencillo por pista forestal.',
      startsAt: toLocalDateTime('2026-06-10T09:30:00.000Z'),
      meetingPoint: 'Plaça de l’Església, Barcelona',
      latitude: 41.4,
      longitude: 2.17,
      bikeType: 'gravel',
      level: 'Intermedio',
      distanceKm: '30',
      elevationM: '300',
      durationMinutes: '120',
      wikilocUrl: 'https://www.wikiloc.com/ruta/1',
      audience: 'women',
      maxParticipants: '12',
      isCircular: true,
    })
  })

  it('marks a non-circular ride as out-and-back', () => {
    const values = mapRideToFormValues(rideOf({ routeType: 'round_trip' }))

    expect(values.isCircular).toBe(false)
  })

  it('maps a missing wikiloc url and participant limit to empty strings', () => {
    const values = mapRideToFormValues(rideOf({ wikilocUrl: null, maxParticipants: null }))

    expect(values.wikilocUrl).toBe('')
    expect(values.maxParticipants).toBe('')
  })
})

describe('buildRideInput', () => {
  it('builds a trimmed persistence payload with the given image path', () => {
    expect(buildRideInput(validFormValues(), 'user-1/nueva.jpg')).toEqual({
      title: 'Vuelta por Collserola',
      description: 'Recorrido sencillo por pista forestal.',
      startsAt: new Date('2026-06-10T11:30').toISOString(),
      meetingPoint: 'Plaça de l’Església, Barcelona',
      latitude: 41.4,
      longitude: 2.17,
      bikeType: 'gravel',
      level: 'Intermedio',
      distanceKm: 30,
      elevationM: 300,
      durationMinutes: 120,
      imagePath: 'user-1/nueva.jpg',
      wikilocUrl: 'https://www.wikiloc.com/ruta/1',
      audience: 'everyone',
      maxParticipants: 12,
      routeType: 'circular',
    })
  })

  it('persists an unchecked circular switch as an out-and-back route', () => {
    const input = buildRideInput(validFormValues({ isCircular: false }), null)

    expect(input?.routeType).toBe('round_trip')
  })

  it('returns null when the meeting point has no coordinates', () => {
    expect(buildRideInput(validFormValues({ latitude: null }), null)).toBeNull()
    expect(buildRideInput(validFormValues({ longitude: null }), null)).toBeNull()
  })

  it('maps an empty wikiloc url and participant limit to null', () => {
    const input = buildRideInput(validFormValues({ wikilocUrl: '   ', maxParticipants: ' ' }), null)

    expect(input).not.toBeNull()
    expect(input?.wikilocUrl).toBeNull()
    expect(input?.maxParticipants).toBeNull()
  })

  it('keeps the image path null when there is no image', () => {
    const input = buildRideInput(validFormValues(), null)

    expect(input?.imagePath).toBeNull()
  })
})
