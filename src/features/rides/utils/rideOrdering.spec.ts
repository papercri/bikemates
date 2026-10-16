import { describe, expect, it } from 'vitest'
import { mockRides } from '../data/mockRides'
import type { Ride } from '../types'
import { sortRides, sortRidesByDate } from './rideOrdering'

const rides = [
  { startsAt: '2027-05-17T08:00:00+02:00' },
  { startsAt: '2025-11-01T09:00:00+01:00' },
  { startsAt: '2026-05-15T09:00:00+02:00' },
]

const template = mockRides[0]

function buildRide(id: string, overrides: Partial<Ride>): Ride {
  if (!template) {
    throw new Error('No ride fixtures available')
  }

  return { ...template, id, ...overrides }
}

describe('sortRidesByDate', () => {
  it('orders departures from nearest to furthest', () => {
    expect(sortRidesByDate(rides).map((ride) => ride.startsAt)).toEqual([
      '2025-11-01T09:00:00+01:00',
      '2026-05-15T09:00:00+02:00',
      '2027-05-17T08:00:00+02:00',
    ])
  })

  it('moves unparseable dates to the end without mutating the input', () => {
    const input = [{ startsAt: 'no-es-fecha' }, { startsAt: '2026-05-15T09:00:00+02:00' }]

    const sorted = sortRidesByDate(input)

    expect(sorted.map((ride) => ride.startsAt)).toEqual([
      '2026-05-15T09:00:00+02:00',
      'no-es-fecha',
    ])
    expect(input[0]?.startsAt).toBe('no-es-fecha')
  })
})

describe('sortRides', () => {
  const fixture = [
    buildRide('a', { startsAt: '2026-03-01T09:00:00+01:00', distanceKm: 30, elevationM: 400 }),
    buildRide('b', { startsAt: '2026-01-05T09:00:00+01:00', distanceKm: 80, elevationM: 1200 }),
    buildRide('c', { startsAt: 'no-es-fecha', distanceKm: 55, elevationM: 900 }),
  ]

  it('orders by distance from longest to shortest', () => {
    expect(sortRides(fixture, 'distance', 'desc').map((ride) => ride.id)).toEqual(['b', 'c', 'a'])
  })

  it('orders by elevation from highest to lowest', () => {
    expect(sortRides(fixture, 'elevation', 'desc').map((ride) => ride.id)).toEqual(['b', 'c', 'a'])
  })

  it('orders by date descending keeping invalid dates at the end', () => {
    expect(sortRides(fixture, 'date', 'desc').map((ride) => ride.id)).toEqual(['a', 'b', 'c'])
  })

  it('orders by date ascending like sortRidesByDate', () => {
    expect(sortRides(fixture, 'date', 'asc').map((ride) => ride.id)).toEqual(['b', 'a', 'c'])
  })
})
