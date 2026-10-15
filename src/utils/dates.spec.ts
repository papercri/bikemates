import { describe, expect, it } from 'vitest'
import { toLocalDateTime } from './dates'

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
