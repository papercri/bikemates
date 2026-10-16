import { describe, expect, it } from 'vitest'
import { formatRideDate, getRideDateParts, toLocalDateTime } from './dates'

describe('formatRideDate', () => {
  it('formats a departure in long Spanish format', () => {
    const departure = new Date(2026, 5, 10, 9, 30)

    const formatted = formatRideDate(departure.toISOString())

    expect(formatted).toContain('10')
    expect(formatted).toContain('junio')
    expect(formatted).toContain('09:30')
  })
})

describe('getRideDateParts', () => {
  it('splits a departure into a day figure and a short month', () => {
    const departure = new Date(2026, 5, 10, 9, 30)

    expect(getRideDateParts(departure.toISOString())).toEqual({
      day: '10',
      month: 'jun',
    })
  })

  it('returns empty parts for an unparseable date', () => {
    expect(getRideDateParts('no-es-fecha')).toEqual({ day: '', month: '' })
  })
})

describe('toLocalDateTime', () => {
  it('converts an ISO instant to the local datetime-local value', () => {
    const localMoment = new Date(2026, 5, 10, 9, 30)

    expect(toLocalDateTime(localMoment.toISOString())).toBe('2026-06-10T09:30')
  })

  it('returns an empty string for invalid dates', () => {
    expect(toLocalDateTime('no-es-fecha')).toBe('')
    expect(toLocalDateTime('')).toBe('')
  })
})
