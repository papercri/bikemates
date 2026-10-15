import { onScopeDispose, ref } from 'vue'
import {
  searchPlaces,
  type GeocodingResult,
} from '@/features/rides/services/geocodingService'

/**
 * Búsqueda de lugares (Nominatim) para el punto de encuentro: query, resultados,
 * selección y cancelación de peticiones antiguas.
 */
export function usePlaceSearch(initialValue = '') {
  const query = ref(initialValue)
  const results = ref<GeocodingResult[]>([])
  const selectedPlace = ref<GeocodingResult | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  let controller: AbortController | null = null

  async function search(): Promise<void> {
    const searchTerm = query.value.trim()

    if (isLoading.value || searchTerm.length < 3) return

    controller?.abort()
    const searchController = new AbortController()
    controller = searchController

    isLoading.value = true
    errorMessage.value = null
    results.value = []

    try {
      const places = await searchPlaces(searchTerm, searchController.signal)

      // Ignorar resultados de búsquedas canceladas o antiguas.
      if (searchController.signal.aborted) return

      results.value = places

      if (places.length === 0) {
        errorMessage.value = 'No se han encontrado lugares.'
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      errorMessage.value =
        error instanceof Error ? error.message : 'No se ha podido buscar el lugar.'
    } finally {
      if (controller === searchController) {
        isLoading.value = false
        controller = null
      }
    }
  }

  function selectPlace(place: GeocodingResult): void {
    selectedPlace.value = place
    query.value = place.label
    results.value = []
    errorMessage.value = null
  }

  /** Cancela la búsqueda en curso y limpia resultados y selección. */
  function resetSelection(): void {
    controller?.abort()
    selectedPlace.value = null
    results.value = []
    errorMessage.value = null
  }

  onScopeDispose(() => {
    controller?.abort()
  })

  return {
    query,
    results,
    selectedPlace,
    isLoading,
    errorMessage,
    search,
    selectPlace,
    resetSelection,
  }
}
