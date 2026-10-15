import { describe, expect, it } from 'vitest'
import type { Ride } from '../types'
import { buildRideInput, mapRideToFormValues } from './rideFormMapping'

function rideFixture(overrides: Partial<Ride> = {}): Ride {
  return {
    id: 'ride-1',
    organizerId: 'user-1',
    title: 'Vuelta por Collserola',
    description: 'Recorrido por pista forestal.',
    startsAt: new Date(2026, 5, 10, 9, 30).toISOString(),
    meetingPoint: 'Plaça de l’Església',
    latitude: 41.4,
    longitude: 2.17,
    bikeType: 'gravel',
    level: 'Intermedio',
    distanceKm: 32.5,
    elevationM: 650,
    durationMinutes: 150,
    imagePath: 'user-1/portada.jpg',
    wikilocUrl: 'https://www.wikiloc.com/rutas/1',
    audience: 'women',
    maxParticipants: 12,
    status: 'published',
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-01T10:00:00.000Z',
    ...overrides,
  }
}

describe('mapRideToFormValues', () => {
  it('maps a ride into string-based form values', () => {
    const values = mapRideToFormValues(rideFixture())

    expect(values).toEqual({
      title: 'Vuelta por Collserola',
      description: 'Recorrido por pista forestal.',
      startsAt: '2026-06-10T09:30',
      meetingPoint: 'Plaça de l’Església',
      latitude: 41.4,
      longitude: 2.17,
      bikeType: 'gravel',
      level: 'Intermedio',
      distanceKm: '32.5',
      elevationM: '650',
      durationMinutes: '150',
      wikilocUrl: 'https://www.wikiloc.com/rutas/1',
      audience: 'women',
      maxParticipants: '12',
    })
  })

  it('maps optional values to empty form fields', () => {
    const values = mapRideToFormValues(
      rideFixture({ wikilocUrl: null, maxParticipants: null }),
    )

    expect(values.wikilocUrl).toBe('')
    expect(values.maxParticipants).toBe('')
  })
})

describe('buildRideInput', () => {
  const formValues = mapRideToFormValues(rideFixture())

  it('builds the persistence payload from form values', () => {
    const input = buildRideInput(formValues, 'user-1/nueva.jpg')

    expect(input).toEqual({
      title: 'Vuelta por Collserola',
      description: 'Recorrido por pista forestal.',
      startsAt: new Date(2026, 5, 10, 9, 30).toISOString(),
      meetingPoint: 'Plaça de l’Església',
      latitude: 41.4,
      longitude: 2.17,
      bikeType: 'gravel',
      level: 'Intermedio',
      distanceKm: 32.5,
      elevationM: 650,
      durationMinutes: 150,
      imagePath: 'user-1/nueva.jpg',
      wikilocUrl: 'https://www.wikiloc.com/rutas/1',
      audience: 'women',
      maxParticipants: 12,
    })
  })

  it('trims text fields and normalises empty optionals to null', () => {
    const input = buildRideInput(
      {
        ...formValues,
        title: '  Título con espacios  ',
        description: '  Descripción  ',
        meetingPoint: '  Punto  ',
        wikilocUrl: '   ',
        maxParticipants: '',
      },
      null,
    )

    expect(input?.title).toBe('Título con espacios')
    expect(input?.description).toBe('Descripción')
    expect(input?.meetingPoint).toBe('Punto')
    expect(input?.wikilocUrl).toBeNull()
    expect(input?.maxParticipants).toBeNull()
    expect(input?.imagePath).toBeNull()
  })

  it('returns null when the meeting point has no coordinates', () => {
    expect(buildRideInput({ ...formValues, latitude: null }, null)).toBeNull()
    expect(buildRideInput({ ...formValues, longitude: null }, null)).toBeNull()
  })
})
