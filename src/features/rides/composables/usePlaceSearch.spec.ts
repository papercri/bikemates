import { beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import type { GeocodingResult } from '../services/geocodingService'
import { usePlaceSearch } from './usePlaceSearch'

const mocks = vi.hoisted(() => ({
  searchPlaces: vi.fn<(query: string, signal?: AbortSignal) => Promise<GeocodingResult[]>>(),
}))

vi.mock('../services/geocodingService', () => ({
  searchPlaces: mocks.searchPlaces,
}))

const place: GeocodingResult = {
  id: '123',
  label: 'Plaça de l’Església, Barcelona',
  latitude: 41.4,
  longitude: 2.17,
}

/** Monta el composable en un scope propio para poder desmontarlo limpiamente. */
function setupPlaceSearch(initialValue = '') {
  const scope = effectScope()
  const picker = scope.run(() => usePlaceSearch(initialValue))

  if (!picker) {
    throw new Error('No se ha podido crear la búsqueda de lugares.')
  }

  return { ...picker, scope }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

describe('usePlaceSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts with the given initial value and empty state', () => {
    const { query, results, selectedPlace, isLoading, errorMessage } = setupPlaceSearch('Barcelona')

    expect(query.value).toBe('Barcelona')
    expect(results.value).toEqual([])
    expect(selectedPlace.value).toBeNull()
    expect(isLoading.value).toBe(false)
    expect(errorMessage.value).toBeNull()
  })

  it('ignores queries shorter than three characters', async () => {
    const { query, search, isLoading } = setupPlaceSearch()
    mocks.searchPlaces.mockResolvedValue([place])

    query.value = ' ab '
    await search()

    expect(isLoading.value).toBe(false)
    expect(mocks.searchPlaces).not.toHaveBeenCalled()
  })

  it('stores the results of a successful search', async () => {
    mocks.searchPlaces.mockResolvedValue([place])

    const { query, search, results, isLoading, errorMessage } = setupPlaceSearch()
    query.value = '  Monistrol  '
    await search()

    expect(mocks.searchPlaces).toHaveBeenCalledWith('Monistrol', expect.any(AbortSignal))
    expect(results.value).toEqual([place])
    expect(isLoading.value).toBe(false)
    expect(errorMessage.value).toBeNull()
  })

  it('explains when no place matches the query', async () => {
    mocks.searchPlaces.mockResolvedValue([])

    const { query, search, errorMessage } = setupPlaceSearch()
    query.value = 'Zzzzzzz'
    await search()

    expect(errorMessage.value).toBe('No se han encontrado lugares.')
  })

  it('does not start a second search while one is running', async () => {
    const pending = deferred<GeocodingResult[]>()
    mocks.searchPlaces.mockReturnValue(pending.promise)

    const { query, search, isLoading } = setupPlaceSearch()
    query.value = 'Montserrat'

    const first = search()
    await search()

    expect(mocks.searchPlaces).toHaveBeenCalledTimes(1)
    expect(isLoading.value).toBe(true)

    pending.resolve([])
    await first
  })

  it('ignores results that arrive after the search was cancelled', async () => {
    const pending = deferred<GeocodingResult[]>()
    mocks.searchPlaces.mockReturnValue(pending.promise)

    const { query, search, results, resetSelection } = setupPlaceSearch()
    query.value = 'Montserrat'

    const ongoing = search()
    resetSelection()
    pending.resolve([place])
    await ongoing

    expect(results.value).toEqual([])
  })

  it('swallows abort errors without reporting them', async () => {
    const abortError = new Error('aborted')
    abortError.name = 'AbortError'
    mocks.searchPlaces.mockRejectedValue(abortError)

    const { query, search, errorMessage } = setupPlaceSearch()
    query.value = 'Montserrat'
    await search()

    expect(errorMessage.value).toBeNull()
  })

  it('explains other failures and generic ones too', async () => {
    mocks.searchPlaces.mockRejectedValueOnce(new Error('rate limited'))

    const failing = setupPlaceSearch()
    failing.query.value = 'Montserrat'
    await failing.search()
    expect(failing.errorMessage.value).toBe('rate limited')

    mocks.searchPlaces.mockRejectedValueOnce('boom')

    const generic = setupPlaceSearch()
    generic.query.value = 'Montserrat'
    await generic.search()
    expect(generic.errorMessage.value).toBe('No se ha podido buscar el lugar.')
  })

  it('selects a place, fills the query and clears the result list', () => {
    const { query, results, selectedPlace, selectPlace, errorMessage } = setupPlaceSearch()
    results.value = [place]
    errorMessage.value = 'previo'

    selectPlace(place)

    expect(selectedPlace.value).toEqual(place)
    expect(query.value).toBe(place.label)
    expect(results.value).toEqual([])
    expect(errorMessage.value).toBeNull()
  })

  it('cancels the ongoing search and clears the selection on reset', async () => {
    const pending = deferred<GeocodingResult[]>()
    mocks.searchPlaces.mockReturnValue(pending.promise)

    const { query, search, selectedPlace, resetSelection } = setupPlaceSearch()
    selectedPlace.value = place
    query.value = 'Montserrat'

    const ongoing = search()
    const signal = mocks.searchPlaces.mock.calls[0]?.[1]
    resetSelection()

    expect(signal?.aborted).toBe(true)
    expect(selectedPlace.value).toBeNull()

    pending.resolve([])
    await ongoing
  })
})
