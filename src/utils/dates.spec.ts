import { describe, expect, it } from 'vitest'
import {
  formatRideDate,
  formatRideShortDate,
  getRideDateParts,
  isRidePast,
  toLocalDateTime,
} from './dates'

describe('formatRideDate', () => {
  it('formats a departure in long Spanish format', () => {
    const departure = new Date(2026, 5, 10, 9, 30)

    const formatted = formatRideDate(departure.toISOString())

    expect(formatted).toContain('10')
    expect(formatted).toContain('junio')
    expect(formatted).toContain('09:30')
  })
})

describe('formatRideShortDate', () => {
  it('formats a departure as a two-digit day and month', () => {
    const departure = new Date(2026, 5, 10, 9, 30)

    expect(formatRideShortDate(departure.toISOString())).toBe('10/06')
  })

  it('pads single-digit days and months', () => {
    const departure = new Date(2026, 0, 5, 9, 30)

    expect(formatRideShortDate(departure.toISOString())).toBe('05/01')
  })

  it('returns an empty string for unparseable dates', () => {
    expect(formatRideShortDate('no-es-una-fecha')).toBe('')
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

describe('isRidePast', () => {
  const now = new Date('2026-06-10T12:00:00Z')

  it('detects departures that already happened', () => {
    expect(isRidePast('2026-06-09T09:00:00Z', now)).toBe(true)
    expect(isRidePast('2026-06-10T12:00:00Z', now)).toBe(true)
  })

  it('keeps upcoming departures as future', () => {
    expect(isRidePast('2026-06-10T12:00:01Z', now)).toBe(false)
    expect(isRidePast('2027-05-15T09:00:00+02:00', now)).toBe(false)
  })

  it('treats unparseable dates as future so the card is never dimmed', () => {
    expect(isRidePast('no-es-fecha', now)).toBe(false)
  })
})
