import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { searchPlaces } from './geocodingService'

function nominatimPlace(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    place_id: 123,
    display_name: 'Plaça de l’Església, Barcelona',
    lat: '41.4036',
    lon: '2.1744',
    ...overrides,
  }
}

function jsonResponse(body: unknown, init: { ok?: boolean } = {}): Response {
  return {
    ok: init.ok ?? true,
    json: () => Promise.resolve(body),
  } as Response
}

describe('searchPlaces', () => {
  const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('rejects queries shorter than three characters before calling the network', async () => {
    await expect(searchPlaces(' ab ')).rejects.toThrow(
      'Introduce al menos 3 caracteres para buscar.',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('queries Nominatim with the trimmed text and Spanish country filter', async () => {
    fetchMock.mockResolvedValue(jsonResponse([]))

    await searchPlaces('  Monistrol  ')

    expect(fetchMock).toHaveBeenCalledWith(
      'https://nominatim.openstreetmap.org/search?q=Monistrol&format=jsonv2&limit=5&countrycodes=es',
      {
        headers: { Accept: 'application/json' },
        signal: undefined,
      },
    )
  })

  it('passes the abort signal through to the request', async () => {
    const controller = new AbortController()
    fetchMock.mockResolvedValue(jsonResponse([]))

    await searchPlaces('Barcelona', controller.signal)

    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ signal: controller.signal })
  })

  it('maps valid places into typed results with a string id', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse([
        nominatimPlace(),
        nominatimPlace({ place_id: 456, display_name: 'Montserrat, Monistrol de Montserrat' }),
      ]),
    )

    await expect(searchPlaces('Montserrat')).resolves.toEqual([
      {
        id: '123',
        label: 'Plaça de l’Església, Barcelona',
        latitude: 41.4036,
        longitude: 2.1744,
      },
      {
        id: '456',
        label: 'Montserrat, Monistrol de Montserrat',
        latitude: 41.4036,
        longitude: 2.1744,
      },
    ])
  })

  it('drops places whose shape or coordinates are not trustworthy', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse([
        { place_id: 'no-numerico', display_name: 'Sin id válido', lat: '1', lon: '1' },
        nominatimPlace({ lat: '999', lon: '2.17' }),
        nominatimPlace({ lon: 'no-numero' }),
        nominatimPlace({ lat: '-91', lon: '2.17' }),
        nominatimPlace({ lon: '181', lat: '41.4' }),
        nominatimPlace({ place_id: 789, display_name: 'Válido', lat: '40.4', lon: '-3.7' }),
      ]),
    )

    await expect(searchPlaces('España')).resolves.toEqual([
      {
        id: '789',
        label: 'Válido',
        latitude: 40.4,
        longitude: -3.7,
      },
    ])
  })

  it('throws a specific message when the service responds with an error status', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, { ok: false }))

    await expect(searchPlaces('Barcelona')).rejects.toThrow(
      'No se han podido buscar lugares. Inténtalo de nuevo.',
    )
  })

  it('throws when the response body is not an array', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'rate limited' }))

    await expect(searchPlaces('Barcelona')).rejects.toThrow(
      'No se ha podido completar la búsqueda. Inténtalo de nuevo.',
    )
  })

  it('returns an empty list when every place is discarded', async () => {
    fetchMock.mockResolvedValue(jsonResponse([{ foo: 'bar' }]))

    await expect(searchPlaces('Barcelona')).resolves.toEqual([])
  })
})
