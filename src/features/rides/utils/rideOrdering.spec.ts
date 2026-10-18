import { describe, expect, it } from 'vitest'
import type { Ride } from '../types'
import { sortRides, sortRidesByDate } from './rideOrdering'

function rideOf(overrides: Partial<Ride> & { id: string }): Ride {
  return {
    organizerId: 'organizer-1',
    title: `Ruta ${overrides.id}`,
    description: 'Descripción de prueba para la ruta.',
    startsAt: '2026-06-10T09:30:00.000Z',
    meetingPoint: 'Plaça de l’Església, Barcelona',
    latitude: 41.4,
    longitude: 2.17,
    bikeType: 'gravel',
    level: 'Intermedio',
    distanceKm: 30,
    elevationM: 300,
    durationMinutes: 120,
    imagePath: null,
    wikilocUrl: null,
    audience: 'everyone',
    maxParticipants: null,
    status: 'published',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    imageUrl: null,
    ...overrides,
  }
}

function ids(rides: readonly { id: string }[]): string[] {
  return rides.map((ride) => ride.id)
}

describe('sortRidesByDate', () => {
  it('sorts departures from the nearest to the farthest', () => {
    const rides = [
      rideOf({ id: 'c', startsAt: '2026-08-01T09:00:00.000Z' }),
      rideOf({ id: 'a', startsAt: '2026-06-10T09:30:00.000Z' }),
      rideOf({ id: 'b', startsAt: '2026-07-15T08:00:00.000Z' }),
    ]

    expect(ids(sortRidesByDate(rides))).toEqual(['a', 'b', 'c'])
  })

  it('places rides with invalid dates at the end', () => {
    const rides = [
      rideOf({ id: 'invalid', startsAt: 'no-es-fecha' }),
      rideOf({ id: 'future', startsAt: '2026-08-01T09:00:00.000Z' }),
      rideOf({ id: 'past', startsAt: '2026-06-10T09:30:00.000Z' }),
    ]

    expect(ids(sortRidesByDate(rides))).toEqual(['past', 'future', 'invalid'])
  })

  it('does not mutate the input array', () => {
    const rides = [
      rideOf({ id: 'b', startsAt: '2026-07-15T08:00:00.000Z' }),
      rideOf({ id: 'a', startsAt: '2026-06-10T09:30:00.000Z' }),
    ]

    sortRidesByDate(rides)

    expect(ids(rides)).toEqual(['b', 'a'])
  })
})

describe('sortRides', () => {
  it('sorts ascending by date through the date key', () => {
    const rides = [
      rideOf({ id: 'b', startsAt: '2026-07-15T08:00:00.000Z' }),
      rideOf({ id: 'a', startsAt: '2026-06-10T09:30:00.000Z' }),
    ]

    expect(ids(sortRides(rides, 'date', 'asc'))).toEqual(['a', 'b'])
  })

  it('sorts descending by date keeping invalid dates at the end', () => {
    const rides = [
      rideOf({ id: 'invalid', startsAt: 'garbage' }),
      rideOf({ id: 'old', startsAt: '2026-06-10T09:30:00.000Z' }),
      rideOf({ id: 'new', startsAt: '2026-08-01T09:00:00.000Z' }),
    ]

    expect(ids(sortRides(rides, 'date', 'desc'))).toEqual(['new', 'old', 'invalid'])
  })

  it('sorts by distance in both directions', () => {
    const rides = [
      rideOf({ id: 'long', distanceKm: 80 }),
      rideOf({ id: 'short', distanceKm: 20 }),
      rideOf({ id: 'mid', distanceKm: 45 }),
    ]

    expect(ids(sortRides(rides, 'distance', 'asc'))).toEqual(['short', 'mid', 'long'])
    expect(ids(sortRides(rides, 'distance', 'desc'))).toEqual(['long', 'mid', 'short'])
  })

  it('sorts by elevation in both directions', () => {
    const rides = [
      rideOf({ id: 'flat', elevationM: 100 }),
      rideOf({ id: 'steep', elevationM: 1500 }),
      rideOf({ id: 'mid', elevationM: 600 }),
    ]

    expect(ids(sortRides(rides, 'elevation', 'asc'))).toEqual(['flat', 'mid', 'steep'])
    expect(ids(sortRides(rides, 'elevation', 'desc'))).toEqual(['steep', 'mid', 'flat'])
  })

  it('does not mutate the input array', () => {
    const rides = [rideOf({ id: 'b', distanceKm: 80 }), rideOf({ id: 'a', distanceKm: 20 })]

    sortRides(rides, 'distance', 'asc')

    expect(ids(rides)).toEqual(['b', 'a'])
  })
})
