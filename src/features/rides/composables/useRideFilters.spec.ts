import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { RIDE_FILTER_ALL } from '../constants/rideFilters'
import type { Ride } from '../types'
import { useRideFilters } from './useRideFilters'

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
}

function rideOf(overrides: Partial<Ride> & { id: string }): Ride {
  return {
    organizerId: 'organizer-1',
    title: `Ruta ${overrides.id}`,
    description: 'Descripción de prueba para la ruta.',
    startsAt: daysFromNow(7),
    meetingPoint: 'Plaça de l’Església, Barcelona',
    meetingPointDetails: null,
    latitude: 41.4,
    longitude: 2.17,
    bikeType: 'gravel',
    level: 'Intermedio',
    distanceKm: 30,
    elevationM: 300,
    durationMinutes: 120,
    imagePath: null,
    wikilocUrl: null,
    audience: 'everyone',
    maxParticipants: null,
    routeType: null,
    status: 'published',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    imageUrl: null,
    ...overrides,
  }
}

function ids(rides: readonly Ride[]): string[] {
  return rides.map((ride) => ride.id)
}

function setup(rides: Ride[]) {
  const store = ref<Ride[]>(rides)

  return { store, filters: useRideFilters(store) }
}

describe('useRideFilters', () => {
  it('splits upcoming and past rides by the departure date', () => {
    const { filters } = setup([
      rideOf({ id: 'future', startsAt: daysFromNow(3) }),
      rideOf({ id: 'past', startsAt: daysFromNow(-3) }),
    ])

    expect(ids(filters.upcomingRides.value)).toEqual(['future'])
    expect(ids(filters.pastRides.value)).toEqual(['past'])
  })

  it('shows the upcoming window by default', () => {
    const { filters } = setup([
      rideOf({ id: 'future', startsAt: daysFromNow(3) }),
      rideOf({ id: 'past', startsAt: daysFromNow(-3) }),
    ])

    expect(ids(filters.visibleRides.value)).toEqual(['future'])

    filters.timeframe.value = 'past'
    expect(ids(filters.visibleRides.value)).toEqual(['past'])
  })

  it('matches the title query without case or accents', () => {
    const { filters } = setup([
      rideOf({ id: 'collserola', title: 'Vuelta por Collsérrola' }),
      rideOf({ id: 'montserrat', title: 'Subida a Montserrat' }),
    ])

    filters.query.value = 'COLLSÉRROLA'
    expect(ids(filters.upcomingRides.value)).toEqual(['collserola'])

    filters.query.value = '  collserrola  '
    expect(ids(filters.upcomingRides.value)).toEqual(['collserola'])

    filters.query.value = 'no-existe'
    expect(filters.upcomingRides.value).toEqual([])
  })

  it('combines query, level and audience filters with AND', () => {
    const { filters } = setup([
      rideOf({ id: 'match', level: 'Avanzado', audience: 'women' }),
      rideOf({ id: 'wrong-level', level: 'Intermedio', audience: 'women' }),
      rideOf({ id: 'wrong-audience', level: 'Avanzado', audience: 'men' }),
    ])

    filters.selectedLevel.value = 'Avanzado'
    filters.selectedAudience.value = 'women'

    expect(ids(filters.upcomingRides.value)).toEqual(['match'])
  })

  it('filters by bike type and treats the sentinel as no filter', () => {
    const { filters } = setup([
      rideOf({ id: 'gravel-ride', bikeType: 'gravel', startsAt: daysFromNow(2) }),
      rideOf({ id: 'mtb-ride', bikeType: 'mtb', startsAt: daysFromNow(5) }),
    ])

    filters.selectedBike.value = 'mtb'
    expect(ids(filters.upcomingRides.value)).toEqual(['mtb-ride'])

    filters.selectedBike.value = RIDE_FILTER_ALL
    expect(ids(filters.upcomingRides.value)).toEqual(['gravel-ride', 'mtb-ride'])
  })

  it('treats the sentinel value as no filter', () => {
    const { filters } = setup([rideOf({ id: 'a', level: 'Avanzado', audience: 'lgbt' })])

    filters.selectedLevel.value = RIDE_FILTER_ALL
    filters.selectedAudience.value = RIDE_FILTER_ALL

    expect(ids(filters.upcomingRides.value)).toEqual(['a'])
  })

  it('sorts upcoming rides by date from the nearest by default', () => {
    const { filters } = setup([
      rideOf({ id: 'later', startsAt: daysFromNow(10) }),
      rideOf({ id: 'sooner', startsAt: daysFromNow(2) }),
    ])

    expect(ids(filters.upcomingRides.value)).toEqual(['sooner', 'later'])
  })

  it('sorts upcoming rides by distance or elevation in descending order', () => {
    const { filters } = setup([
      rideOf({ id: 'short', distanceKm: 20, elevationM: 100 }),
      rideOf({ id: 'long', distanceKm: 80, elevationM: 900 }),
    ])

    filters.sortBy.value = 'distance'
    expect(ids(filters.upcomingRides.value)).toEqual(['long', 'short'])

    filters.sortBy.value = 'elevation'
    expect(ids(filters.upcomingRides.value)).toEqual(['long', 'short'])
  })

  it('sorts past rides by the selected criterion, most recent first by date', () => {
    const { filters } = setup([
      rideOf({ id: 'older', startsAt: daysFromNow(-10), distanceKm: 90 }),
      rideOf({ id: 'recent', startsAt: daysFromNow(-1), distanceKm: 10 }),
    ])

    expect(ids(filters.pastRides.value)).toEqual(['recent', 'older'])

    filters.sortBy.value = 'distance'
    expect(ids(filters.pastRides.value)).toEqual(['older', 'recent'])
  })

  it('reacts to rides being replaced in the store', async () => {
    const { store, filters } = setup([rideOf({ id: 'a' })])

    store.value = [rideOf({ id: 'b' }), rideOf({ id: 'c' })]
    await nextTick()

    expect(ids(filters.upcomingRides.value)).toEqual(['b', 'c'])
  })

  it('filters down to the rides the user participates in when enabled', async () => {
    const store = ref<Ride[]>([rideOf({ id: 'a' }), rideOf({ id: 'b' }), rideOf({ id: 'c' })])
    const participating = ref<string[]>(['b'])
    const filters = useRideFilters(store, participating)

    filters.onlyParticipating.value = true
    await nextTick()

    expect(ids(filters.visibleRides.value)).toEqual(['b'])

    filters.onlyParticipating.value = false
    await nextTick()

    expect(ids(filters.visibleRides.value).sort()).toEqual(['a', 'b', 'c'])
  })
})
