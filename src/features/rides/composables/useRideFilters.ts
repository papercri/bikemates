import { computed, ref, type Ref } from 'vue'

import {
  RIDE_FILTER_ALL,
  type RideAudienceFilter,
  type RideBikeFilter,
  type RideLevelFilter,
  type RideSortOption,
  type RideTimeframe,
} from '../constants/rideFilters'
import type { Ride } from '../types'
import { sortRides, sortRidesByDate } from '../utils/rideOrdering'
import { normalizeSearchText } from '../utils/searchText'
import { isRidePast } from '@/utils/dates'

/**
 * Estado de los filtros del listado: búsqueda, nivel, tipo de bici, público,
 * orden, ventana temporal (próximas o pasadas) y participación, con los listados
 * ya filtrados y ordenados.
 */
export function useRideFilters(rides: Ref<Ride[]>, participatingRideIds: Ref<string[]> = ref([])) {
  const query = ref('')
  const selectedLevel = ref<RideLevelFilter>(RIDE_FILTER_ALL)
  const selectedBike = ref<RideBikeFilter>(RIDE_FILTER_ALL)
  const selectedAudience = ref<RideAudienceFilter>(RIDE_FILTER_ALL)
  const sortBy = ref<RideSortOption>('default')
  const timeframe = ref<RideTimeframe>('upcoming')
  /** Muestra únicamente las rutas en las que el usuario participa. */
  const onlyParticipating = ref(false)

  /** `default` ordena por la fecha de salida, igual que `date`. */
  const effectiveSortBy = computed<RideSortOption>(() =>
    sortBy.value === 'default' ? 'date' : sortBy.value,
  )

  const participatingIds = computed(() => new Set(participatingRideIds.value))

  const matchingRides = computed(() => {
    const needle = normalizeSearchText(query.value)

    return rides.value.filter((ride) => {
      const matchesQuery = needle === '' || normalizeSearchText(ride.title).includes(needle)
      const matchesLevel =
        selectedLevel.value === RIDE_FILTER_ALL || ride.level === selectedLevel.value
      const matchesBike =
        selectedBike.value === RIDE_FILTER_ALL || ride.bikeType === selectedBike.value
      const matchesAudience =
        selectedAudience.value === RIDE_FILTER_ALL || ride.audience === selectedAudience.value
      const matchesParticipation =
        !onlyParticipating.value || participatingIds.value.has(ride.id)

      return matchesQuery && matchesLevel && matchesBike && matchesAudience && matchesParticipation
    })
  })

  const upcomingRides = computed(() => {
    const upcoming = matchingRides.value.filter((ride) => !isRidePast(ride.startsAt))

    return effectiveSortBy.value === 'date'
      ? sortRidesByDate(upcoming)
      : sortRides(upcoming, effectiveSortBy.value, 'desc')
  })

  const pastRides = computed(() => {
    const past = matchingRides.value.filter((ride) => isRidePast(ride.startsAt))

    // En el histórico lo más reciente se muestra primero, sea cual sea el criterio.
    return sortRides(past, effectiveSortBy.value, 'desc')
  })

  const visibleRides = computed(() =>
    timeframe.value === 'upcoming' ? upcomingRides.value : pastRides.value,
  )

  return {
    query,
    selectedLevel,
    selectedBike,
    selectedAudience,
    sortBy,
    timeframe,
    onlyParticipating,
    upcomingRides,
    pastRides,
    visibleRides,
  }
}
