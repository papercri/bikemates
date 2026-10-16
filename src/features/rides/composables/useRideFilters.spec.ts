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
      distanceKm: 42,
      elevationM: 700,
    },
    {
      ...template,
      id: 'r2',
      title: 'Ruta femenina del Maresme',
      level: 'Iniciación',
      audience: 'women',
      startsAt: '2026-01-10T09:00:00+01:00',
      distanceKm: 30,
      elevationM: 300,
    },
    {
      ...template,
      id: 'r3',
      title: 'Grupeta del colectivo',
      level: 'Avanzado',
      audience: 'lgbt',
      startsAt: '2027-06-01T09:00:00+02:00',
      distanceKm: 95,
      elevationM: 1500,
    },
    {
      ...template,
      id: 'r4',
      title: 'Rodaje de invierno',
      level: 'Intermedio',
      audience: 'everyone',
      startsAt: '2026-02-20T09:00:00+01:00',
      distanceKm: 60,
      elevationM: 900,
    },
  ]
}

describe('useRideFilters', () => {
  it('separates upcoming rides from past ones, showing the nearest first', () => {
    const rides = ref<Ride[]>(buildRides())
    const { upcomingRides, pastRides } = useRideFilters(rides)

    expect(upcomingRides.value.map((ride) => ride.id)).toEqual(['r1', 'r3'])
    expect(pastRides.value.map((ride) => ride.id)).toEqual(['r4', 'r2'])
  })

  it('shows only the rides of the active timeframe', () => {
    const rides = ref<Ride[]>(buildRides())
    const { timeframe, visibleRides } = useRideFilters(rides)

    expect(visibleRides.value.map((ride) => ride.id)).toEqual(['r1', 'r3'])

    timeframe.value = 'past'

    expect(visibleRides.value.map((ride) => ride.id)).toEqual(['r4', 'r2'])
  })

  it('filters by level', () => {
    const rides = ref<Ride[]>(buildRides())
    const { selectedLevel, visibleRides } = useRideFilters(rides)

    selectedLevel.value = 'Avanzado'

    expect(visibleRides.value.map((ride) => ride.id)).toEqual(['r3'])
  })

  it('filters by audience', () => {
    const rides = ref<Ride[]>(buildRides())
    const { selectedAudience, timeframe, visibleRides } = useRideFilters(rides)

    selectedAudience.value = 'women'
    timeframe.value = 'past'

    expect(visibleRides.value.map((ride) => ride.id)).toEqual(['r2'])
  })

  it('searches the title ignoring case and accents', () => {
    const rides = ref<Ride[]>(buildRides())
    const { query, visibleRides } = useRideFilters(rides)

    query.value = '  COLLSEROLA '
    expect(visibleRides.value.map((ride) => ride.id)).toEqual(['r1'])

    query.value = 'maresme'
    expect(visibleRides.value.map((ride) => ride.id)).toEqual([])
  })

  it('combines the query with the level and audience filters', () => {
    const rides = ref<Ride[]>(buildRides())
    const { query, selectedLevel, selectedAudience, timeframe, visibleRides } =
      useRideFilters(rides)

    query.value = 'rodaje'
    selectedLevel.value = 'Intermedio'
    selectedAudience.value = 'everyone'
    timeframe.value = 'past'

    expect(visibleRides.value.map((ride) => ride.id)).toEqual(['r4'])

    selectedLevel.value = 'Avanzado'

    expect(visibleRides.value).toEqual([])
  })

  it('sorts upcoming rides by distance when requested', () => {
    const rides = ref<Ride[]>(buildRides())
    const { sortBy, visibleRides } = useRideFilters(rides)

    sortBy.value = 'distance'

    expect(visibleRides.value.map((ride) => ride.id)).toEqual(['r3', 'r1'])
  })

  it('keeps the most recent past rides first whatever the sort is', () => {
    const rides = ref<Ride[]>(buildRides())
    const { sortBy, timeframe, visibleRides } = useRideFilters(rides)

    timeframe.value = 'past'
    sortBy.value = 'date'

    expect(visibleRides.value.map((ride) => ride.id)).toEqual(['r4', 'r2'])
  })
})
