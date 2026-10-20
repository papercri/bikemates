import { describe, expect, it } from 'vitest'
import { RIDE_LEVELS } from './rideLevels'
import {
  RIDE_AUDIENCE_FILTER_OPTIONS,
  RIDE_BIKE_FILTER_OPTIONS,
  RIDE_FILTER_ALL,
  RIDE_LEVEL_FILTER_OPTIONS,
  RIDE_SORT_OPTIONS,
} from './rideFilters'
import { RIDE_AUDIENCES, RIDE_AUDIENCE_LABELS, RIDE_BIKE_TYPES, RIDE_BIKE_TYPE_LABELS } from './rideOptions'

describe('rideFilters', () => {
  it('starts every filter list with the sentinel option', () => {
    expect(RIDE_LEVEL_FILTER_OPTIONS[0]).toEqual({
      value: RIDE_FILTER_ALL,
      label: 'Todos los niveles',
    })
    expect(RIDE_BIKE_FILTER_OPTIONS[0]).toEqual({
      value: RIDE_FILTER_ALL,
      label: 'Todos los tipos de bici',
    })
    expect(RIDE_AUDIENCE_FILTER_OPTIONS[0]).toEqual({
      value: RIDE_FILTER_ALL,
      label: 'Todos los públicos',
    })
  })

  it('offers one level option per domain level, labelled with the level itself', () => {
    expect(RIDE_LEVEL_FILTER_OPTIONS).toHaveLength(RIDE_LEVELS.length + 1)
    expect(RIDE_LEVEL_FILTER_OPTIONS.slice(1).map((option) => option.value)).toEqual([
      ...RIDE_LEVELS,
    ])
    expect(RIDE_LEVEL_FILTER_OPTIONS.slice(1).map((option) => option.label)).toEqual([
      ...RIDE_LEVELS,
    ])
  })

  it('offers one bike option per selectable type, labelled with its visible name', () => {
    expect(RIDE_BIKE_FILTER_OPTIONS).toHaveLength(RIDE_BIKE_TYPES.length + 1)
    expect(RIDE_BIKE_FILTER_OPTIONS.slice(1).map((option) => option.value)).toEqual([
      ...RIDE_BIKE_TYPES,
    ])
    expect(RIDE_BIKE_FILTER_OPTIONS.slice(1).map((option) => option.label)).toEqual(
      RIDE_BIKE_TYPES.map((bike) => RIDE_BIKE_TYPE_LABELS[bike]),
    )
  })

  it('offers every audience except the generic one, which the sentinel covers', () => {
    const selectableAudiences = RIDE_AUDIENCES.filter((audience) => audience !== 'everyone')

    expect(RIDE_AUDIENCE_FILTER_OPTIONS).toHaveLength(selectableAudiences.length + 1)
    expect(RIDE_AUDIENCE_FILTER_OPTIONS.slice(1).map((option) => option.value)).toEqual([
      ...selectableAudiences,
    ])
    expect(RIDE_AUDIENCE_FILTER_OPTIONS.slice(1).map((option) => option.label)).toEqual(
      selectableAudiences.map((audience) => RIDE_AUDIENCE_LABELS[audience]),
    )
    expect(RIDE_AUDIENCE_FILTER_OPTIONS.map((option) => option.value)).not.toContain('everyone')
  })

  it('offers the sort criteria in display order', () => {
    expect(RIDE_SORT_OPTIONS).toEqual([
      { value: 'date', label: 'Fecha de salida' },
      { value: 'created', label: 'Fecha de creación' },
      { value: 'distance', label: 'Distancia' },
      { value: 'elevation', label: 'Desnivel' },
    ])
  })
})
