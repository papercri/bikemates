import { describe, expect, it } from 'vitest'
import { RIDE_LEVELS } from './rideLevels'
import {
  RIDE_AUDIENCE_FILTER_OPTIONS,
  RIDE_FILTER_ALL,
  RIDE_LEVEL_FILTER_OPTIONS,
  RIDE_SORT_OPTIONS,
} from './rideFilters'
import { RIDE_AUDIENCES, RIDE_AUDIENCE_LABELS } from './rideOptions'

describe('rideFilters', () => {
  it('starts every filter list with the sentinel option', () => {
    expect(RIDE_LEVEL_FILTER_OPTIONS[0]).toEqual({ value: RIDE_FILTER_ALL, label: 'Cualquier nivel' })
    expect(RIDE_AUDIENCE_FILTER_OPTIONS[0]).toEqual({
      value: RIDE_FILTER_ALL,
      label: 'Cualquier público',
    })
  })

  it('offers one level option per domain level, labelled with the level itself', () => {
    expect(RIDE_LEVEL_FILTER_OPTIONS).toHaveLength(RIDE_LEVELS.length + 1)
    expect(RIDE_LEVEL_FILTER_OPTIONS.slice(1).map((option) => option.value)).toEqual([
      ...RIDE_LEVELS,
    ])
    expect(RIDE_LEVEL_FILTER_OPTIONS.slice(1).map((option) => option.label)).toEqual([...RIDE_LEVELS])
  })

  it('offers one audience option per domain audience, labelled with its visible name', () => {
    expect(RIDE_AUDIENCE_FILTER_OPTIONS).toHaveLength(RIDE_AUDIENCES.length + 1)
    expect(RIDE_AUDIENCE_FILTER_OPTIONS.slice(1).map((option) => option.label)).toEqual(
      RIDE_AUDIENCES.map((audience) => RIDE_AUDIENCE_LABELS[audience]),
    )
  })

  it('offers exactly the three sort criteria in display order', () => {
    expect(RIDE_SORT_OPTIONS).toEqual([
      { value: 'date', label: 'Por fecha' },
      { value: 'distance', label: 'Por distancia' },
      { value: 'elevation', label: 'Por desnivel' },
    ])
  })
})
