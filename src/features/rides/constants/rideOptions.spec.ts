import { describe, expect, it } from 'vitest'
import type { BikeType, RideAudience } from '../types'
import {
  RIDE_AUDIENCES,
  RIDE_AUDIENCE_LABELS,
  RIDE_BIKE_TYPES,
  RIDE_BIKE_TYPE_LABELS,
  RIDE_STATUSES,
} from './rideOptions'

describe('rideOptions', () => {
  it('offers only selectable bike types in forms', () => {
    expect(RIDE_BIKE_TYPES).toEqual(['road', 'mtb', 'gravel', 'urban'])
    // `other` no se ofrece al crear, pero sus etiquetas siguen vigentes
    // para salidas antiguas ya publicadas.
    expect(RIDE_BIKE_TYPES).not.toContain('other')
  })

  it('labels every bike type of the domain, including legacy ones', () => {
    const labelKeys = Object.keys(RIDE_BIKE_TYPE_LABELS) as BikeType[]

    expect(labelKeys.sort()).toEqual(['gravel', 'mtb', 'other', 'road', 'urban'])
  })

  it('uses the Spanish names shown across forms and cards', () => {
    expect(RIDE_BIKE_TYPE_LABELS).toEqual({
      road: 'Carretera',
      mtb: 'MTB',
      gravel: 'Gravel',
      urban: 'Urbana',
      other: 'Otra',
    })
  })

  it('labels every audience and nothing else', () => {
    const labelKeys = Object.keys(RIDE_AUDIENCE_LABELS) as RideAudience[]

    expect(labelKeys.sort()).toEqual([...RIDE_AUDIENCES].sort())
  })

  it('uses the Spanish names shown across forms and badges', () => {
    expect(RIDE_AUDIENCE_LABELS).toEqual({
      everyone: 'Todos',
      women: 'Mujeres',
      men: 'Hombres',
      lgbt: 'LGBT',
    })
  })

  it('covers the finite ride status domain', () => {
    expect(RIDE_STATUSES).toEqual(['draft', 'published', 'cancelled', 'completed'])
  })
})
