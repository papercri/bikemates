import { ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { mockRides } from '../data/mockRides'
import type { Ride } from '../types'
import { useRideFilters } from './useRideFilters'

const template = mockRides[0]

function buildRides(): Ride[] {
  if (!template) {
    throw new Error('No ride fixtures available')
  }

  return [
    {
      ...template,
      id: 'r1',
      title: 'Vuelta por Collserola',
      level: 'Intermedio',
      audience: 'everyone',
      startsAt: '2027-05-15T09:00:00+02:00',
    },
    {
      ...template,
      id: 'r2',
      title: 'Ruta femenina del Maresme',
      level: 'Iniciación',
      audience: 'women',
      startsAt: '2026-01-10T09:00:00+01:00',
    },
    {
      ...template,
      id: 'r3',
      title: 'Grupeta del colectivo',
      level: 'Avanzado',
      audience: 'lgbt',
      startsAt: '2027-06-01T09:00:00+02:00',
    },
  ]
}

describe('useRideFilters', () => {
  it('returns every ride ordered from nearest to furthest departure', () => {
    const rides = ref<Ride[]>(buildRides())
    const { filteredRides } = useRideFilters(rides)

    expect(filteredRides.value.map((ride) => ride.id)).toEqual(['r2', 'r1', 'r3'])
  })

  it('filters by level', () => {
    const rides = ref<Ride[]>(buildRides())
    const { selectedLevel, filteredRides } = useRideFilters(rides)

    selectedLevel.value = 'Avanzado'

    expect(filteredRides.value.map((ride) => ride.id)).toEqual(['r3'])
  })

  it('filters by audience', () => {
    const rides = ref<Ride[]>(buildRides())
    const { selectedAudience, filteredRides } = useRideFilters(rides)

    selectedAudience.value = 'women'

    expect(filteredRides.value.map((ride) => ride.id)).toEqual(['r2'])
  })

  it('searches the title ignoring case and accents', () => {
    const rides = ref<Ride[]>(buildRides())
    const { query, filteredRides } = useRideFilters(rides)

    query.value = '  COLLSEROLA '
    expect(filteredRides.value.map((ride) => ride.id)).toEqual(['r1'])

    query.value = 'maresme'
    expect(filteredRides.value.map((ride) => ride.id)).toEqual(['r2'])
  })

  it('combines the query with the level and audience filters', () => {
    const rides = ref<Ride[]>(buildRides())
    const { query, selectedLevel, selectedAudience, filteredRides } = useRideFilters(rides)

    query.value = 'ruta'
    selectedLevel.value = 'Avanzado'
    selectedAudience.value = 'lgbt'

    expect(filteredRides.value).toEqual([])

    selectedLevel.value = 'Iniciación'
    selectedAudience.value = 'women'

    expect(filteredRides.value.map((ride) => ride.id)).toEqual(['r2'])
  })
})
