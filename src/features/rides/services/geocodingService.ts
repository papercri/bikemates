export interface GeocodingResult {
  id: string
  label: string
  latitude: number
  longitude: number
}

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

function isNominatimResult(value: unknown): value is NominatimResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    'place_id' in value &&
    typeof value.place_id === 'number' &&
    'display_name' in value &&
    typeof value.display_name === 'string' &&
    'lat' in value &&
    typeof value.lat === 'string' &&
    'lon' in value &&
    typeof value.lon === 'string'
  )
}

export async function searchPlaces(
  query: string,
  signal?: AbortSignal,
): Promise<GeocodingResult[]> {
  const normalizedQuery = query.trim()

  if (normalizedQuery.length < 3) {
    throw new Error('Introduce al menos 3 caracteres para buscar.')
  }

  const params = new URLSearchParams({
    q: normalizedQuery,
    format: 'jsonv2',
    limit: '5',
    countrycodes: 'es',
  })

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
    },
    signal,
  })

  if (!response.ok) {
    throw new Error('No se han podido buscar lugares. Inténtalo de nuevo.')
  }

  const results: unknown = await response.json()

  if (!Array.isArray(results)) {
    throw new Error('No se ha podido completar la búsqueda. Inténtalo de nuevo.')
  }

  return results.flatMap((item: unknown): GeocodingResult[] => {
    if (!isNominatimResult(item)) {
      return []
    }

    const latitude = Number(item.lat)
    const longitude = Number(item.lon)

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return []
    }

    return [
      {
        id: String(item.place_id),
        label: item.display_name,
        latitude,
        longitude,
      },
    ]
  })
}
