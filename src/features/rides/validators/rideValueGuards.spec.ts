import { describe, expect, it } from 'vitest'
import { isBikeType, isRideAudience, isRideLevel, isRideStatus } from './rideValueGuards'

describe('rideValueGuards', () => {
  it('accepts every value of the ride domain', () => {
    expect(isBikeType('gravel')).toBe(true)
    expect(isRideLevel('Intermedio')).toBe(true)
    expect(isRideAudience('lgbt')).toBe(true)
    expect(isRideStatus('published')).toBe(true)
  })

  it('rejects values outside the domain', () => {
    expect(isBikeType('bmx')).toBe(false)
    expect(isRideLevel('Elite')).toBe(false)
    expect(isRideAudience('other')).toBe(false)
    expect(isRideStatus('archived')).toBe(false)
  })
})
