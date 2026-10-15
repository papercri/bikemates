import { effectScope } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { GeocodingResult } from '@/features/rides/services/geocodingService'
import { usePlaceSearch } from './usePlaceSearch'

const mocks = vi.hoisted(() => ({
  searchPlaces: vi.fn<
    (query: string, signal?: AbortSignal) => Promise<GeocodingResult[]>
  >(),
}))

vi.mock('@/features/rides/services/geocodingService', () => ({
  searchPlaces: mocks.searchPlaces,
}))

function place(overrides: Partial<GeocodingResult> = {}): GeocodingResult {
  return {
    id: '1',
    label: 'Monistrol de Montserrat',
    latitude: 41.61,
    longitude: 1.84,
    ...overrides,
  }
}

function setupSearch(initialValue = '') {
  const scope = effectScope()

  const searchState = scope.run(() => usePlaceSearch(initialValue))

  if (!searchState) {
    throw new Error('No se ha podido crear el buscador en el scope de prueba')
  }

  return { searchState, dispose: () => scope.stop() }
}

describe('usePlaceSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not search with fewer than three characters', async () => {
    const { searchState } = setupSearch()

    searchState.query.value = 'Mo'
    await searchState.search()

    expect(mocks.searchPlaces).not.toHaveBeenCalled()
  })

  it('stores the results of a successful search', async () => {
    const results = [place()]
    mocks.searchPlaces.mockResolvedValue(results)

    const { searchState } = setupSearch('Monistrol')
    await searchState.search()

    expect(mocks.searchPlaces).toHaveBeenCalledWith('Monistrol', expect.any(AbortSignal))
    expect(searchState.results.value).toEqual(results)
    expect(searchState.errorMessage.value).toBeNull()
    expect(searchState.isLoading.value).toBe(false)
  })

  it('explains when no places match the query', async () => {
    mocks.searchPlaces.mockResolvedValue([])

    const { searchState } = setupSearch('Monistrol')
    await searchState.search()

    expect(searchState.errorMessage.value).toBe('No se han encontrado lugares.')
  })

  it('surfaces the service error message', async () => {
    mocks.searchPlaces.mockRejectedValue(new Error('El servicio no responde.'))

    const { searchState } = setupSearch('Monistrol')
    await searchState.search()

    expect(searchState.errorMessage.value).toBe('El servicio no responde.')
    expect(searchState.isLoading.value).toBe(false)
  })

  it('ignores aborted searches', async () => {
    mocks.searchPlaces.mockImplementation(
      (_query, signal) =>
        new Promise((_resolve, reject) => {
          signal?.addEventListener('abort', () => {
            const error = new Error('aborted')
            error.name = 'AbortError'
            reject(error)
          })
        }),
    )

    const { searchState } = setupSearch('Monistrol')
    const pending = searchState.search()

    searchState.resetSelection()
    await pending

    expect(searchState.results.value).toEqual([])
    expect(searchState.errorMessage.value).toBeNull()
    expect(searchState.isLoading.value).toBe(false)
  })

  it('selects a place, updates the query and clears the results', () => {
    const selected = place()

    const { searchState } = setupSearch()
    searchState.results.value = [selected]

    searchState.selectPlace(selected)

    expect(searchState.selectedPlace.value).toEqual(selected)
    expect(searchState.query.value).toBe(selected.label)
    expect(searchState.results.value).toEqual([])
  })

  it('resets the selection state', () => {
    const { searchState } = setupSearch('Monistrol')

    searchState.selectPlace(place())
    searchState.errorMessage.value = 'No se han encontrado lugares.'
    searchState.resetSelection()

    expect(searchState.selectedPlace.value).toBeNull()
    expect(searchState.results.value).toEqual([])
    expect(searchState.errorMessage.value).toBeNull()
    expect(searchState.query.value).toBe('Monistrol de Montserrat')
  })

  it('cancels pending searches when the scope is disposed', async () => {
    let observedAbort = false

    mocks.searchPlaces.mockImplementation(
      (_query, signal) =>
        new Promise((_resolve, reject) => {
          signal?.addEventListener('abort', () => {
            observedAbort = true
            const error = new Error('aborted')
            error.name = 'AbortError'
            reject(error)
          })
        }),
    )

    const { searchState, dispose } = setupSearch('Monistrol')
    const pending = searchState.search()

    dispose()
    await pending

    expect(observedAbort).toBe(true)
  })
})
