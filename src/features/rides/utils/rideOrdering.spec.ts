import { describe, expect, it } from 'vitest'
import { sortRidesByDate } from './rideOrdering'

const rides = [
  { startsAt: '2027-05-17T08:00:00+02:00' },
  { startsAt: '2025-11-01T09:00:00+01:00' },
  { startsAt: '2026-05-15T09:00:00+02:00' },
]

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
