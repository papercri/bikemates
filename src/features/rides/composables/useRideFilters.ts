import { computed, ref, type Ref } from 'vue'

import {
  RIDE_FILTER_ALL,
  type RideAudienceFilter,
  type RideLevelFilter,
  type RideSortOption,
  type RideTimeframe,
} from '../constants/rideFilters'
import type { Ride } from '../types'
import { sortRides, sortRidesByDate } from '../utils/rideOrdering'
import { isRidePast } from '@/utils/dates'

/**
 * Minúsculas, sin acentos y sin espacios sobrantes, para que "collserola" encuentre
 * "Vuelta por Collsérrola" sin exigir al usuario la tilde exacta.
 */
function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

/**
 * Estado de los filtros del listado: búsqueda, nivel, público, orden y ventana
 * temporal (próximas o pasadas), con los listados ya filtrados y ordenados.
 */
export function useRideFilters(rides: Ref<Ride[]>) {
  const query = ref('')
  const selectedLevel = ref<RideLevelFilter>(RIDE_FILTER_ALL)
  const selectedAudience = ref<RideAudienceFilter>(RIDE_FILTER_ALL)
  const sortBy = ref<RideSortOption>('date')
  const timeframe = ref<RideTimeframe>('upcoming')

  const matchingRides = computed(() => {
    const needle = normalizeSearchText(query.value)

    return rides.value.filter((ride) => {
      const matchesQuery = needle === '' || normalizeSearchText(ride.title).includes(needle)
      const matchesLevel =
        selectedLevel.value === RIDE_FILTER_ALL || ride.level === selectedLevel.value
      const matchesAudience =
        selectedAudience.value === RIDE_FILTER_ALL || ride.audience === selectedAudience.value

      return matchesQuery && matchesLevel && matchesAudience
    })
  })

  const upcomingRides = computed(() => {
    const upcoming = matchingRides.value.filter((ride) => !isRidePast(ride.startsAt))

    return sortBy.value === 'date'
      ? sortRidesByDate(upcoming)
      : sortRides(upcoming, sortBy.value, 'desc')
  })

  const pastRides = computed(() => {
    const past = matchingRides.value.filter((ride) => isRidePast(ride.startsAt))

    // En el histórico lo más reciente se muestra primero, sea cual sea el criterio.
    return sortRides(past, sortBy.value, 'desc')
  })

  const visibleRides = computed(() =>
    timeframe.value === 'upcoming' ? upcomingRides.value : pastRides.value,
  )

  return {
    query,
    selectedLevel,
    selectedAudience,
    sortBy,
    timeframe,
    upcomingRides,
    pastRides,
    visibleRides,
  }
}
