import { describe, expect, it } from 'vitest'
import { RIDE_LEVELS, RIDE_LEVEL_BADGE_COLORS, RIDE_LEVEL_LABELS } from './rideLevels'
import type { RideLevel } from '../types'

describe('rideLevels', () => {
  it('exposes the three ride levels', () => {
    expect([...RIDE_LEVELS]).toEqual(['Iniciación', 'Intermedio', 'Avanzado'])
  })

  it('maps every level to the label shown in the interface', () => {
    expect(RIDE_LEVEL_LABELS).toEqual({
      Iniciación: 'Fácil',
      Intermedio: 'Moderado',
      Avanzado: 'Difícil',
    })
  })

  it('shows every level under its visible label', () => {
    expect(RIDE_LEVEL_LABELS).toEqual({
      Iniciación: 'Fácil',
      Intermedio: 'Moderado',
      Avanzado: 'Difícil',
    })
  })

  it('maps every level to a badge color', () => {
    expect(RIDE_LEVEL_BADGE_COLORS).toEqual({
      Iniciación: 'green',
      Intermedio: 'orange',
      Avanzado: 'red',
    })
  })

  it('covers exactly the ride level domain', () => {
    const levels: RideLevel[] = ['Iniciación', 'Intermedio', 'Avanzado']

    expect(Object.keys(RIDE_LEVEL_BADGE_COLORS)).toEqual(levels)
    expect(RIDE_LEVELS).toEqual(levels)
  })
})
