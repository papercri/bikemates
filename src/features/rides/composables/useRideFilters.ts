import { computed, ref, type Ref } from 'vue'

import {
  RIDE_FILTER_ALL,
  type RideAudienceFilter,
  type RideLevelFilter,
} from '../constants/rideFilters'
import type { Ride } from '../types'
import { sortRidesByDate } from '../utils/rideOrdering'

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

/** Estado de los filtros del listado y el resultado ya filtrado y ordenado por fecha. */
export function useRideFilters(rides: Ref<Ride[]>) {
  const query = ref('')
  const selectedLevel = ref<RideLevelFilter>(RIDE_FILTER_ALL)
  const selectedAudience = ref<RideAudienceFilter>(RIDE_FILTER_ALL)

  const filteredRides = computed(() => {
    const needle = normalizeSearchText(query.value)

    const matching = rides.value.filter((ride) => {
      const matchesQuery = needle === '' || normalizeSearchText(ride.title).includes(needle)
      const matchesLevel =
        selectedLevel.value === RIDE_FILTER_ALL || ride.level === selectedLevel.value
      const matchesAudience =
        selectedAudience.value === RIDE_FILTER_ALL || ride.audience === selectedAudience.value

      return matchesQuery && matchesLevel && matchesAudience
    })

    return sortRidesByDate(matching)
  })

  return {
    query,
    selectedLevel,
    selectedAudience,
    filteredRides,
  }
}
