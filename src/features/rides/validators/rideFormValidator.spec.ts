import { describe, expect, it } from 'vitest'
import type { RideFormValues } from '../types'
import { validateRideForm, validateWikilocUrl } from './rideFormValidator'

function futureDate(daysFromNow = 7): string {
  const date = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000)
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)

  return localDate.toISOString().slice(0, 16)
}

function validValues(overrides: Partial<RideFormValues> = {}): RideFormValues {
  return {
    title: 'Vuelta por Collserola',
    description: 'Recorrido sencillo por pista forestal con parada de café.',
    startsAt: futureDate(),
    meetingPoint: 'Plaça de l’Església, Barcelona',
    latitude: 41.4,
    longitude: 2.17,
    bikeType: 'gravel',
    level: 'Intermedio',
    distanceKm: '30',
    elevationM: '300',
    durationMinutes: '120',
    wikilocUrl: '',
    audience: 'everyone',
    maxParticipants: '',
    ...overrides,
  }
}

function imageOf(type: string): File {
  return new File(['contenido'], 'portada', { type })
}

describe('validateRideForm', () => {
  it('accepts a complete and coherent ride', () => {
    expect(validateRideForm(validValues())).toBeNull()
  })

  it('accepts an image that passes the validation', () => {
    expect(validateRideForm(validValues(), imageOf('image/png'))).toBeNull()
  })

  it('requires a title between 5 and 100 characters', () => {
    expect(validateRideForm(validValues({ title: 'ruta' }))).toBe(
      'El título debe tener entre 5 y 100 caracteres.',
    )
    expect(validateRideForm(validValues({ title: 'a'.repeat(101) }))).toBe(
      'El título debe tener entre 5 y 100 caracteres.',
    )
  })

  it('requires a description between 10 and 3000 characters', () => {
    expect(validateRideForm(validValues({ description: 'corta' }))).toBe(
      'La descripción debe tener entre 10 y 3000 caracteres.',
    )
  })

  it('requires a meeting point with coordinates inside the valid ranges', () => {
    expect(validateRideForm(validValues({ meetingPoint: '   ' }))).toBe(
      'Busca y selecciona un punto de encuentro válido.',
    )
    expect(validateRideForm(validValues({ latitude: null }))).toBe(
      'Busca y selecciona un punto de encuentro válido.',
    )
    expect(validateRideForm(validValues({ longitude: 200 }))).toBe(
      'Busca y selecciona un punto de encuentro válido.',
    )
    expect(validateRideForm(validValues({ latitude: -91 }))).toBe(
      'Busca y selecciona un punto de encuentro válido.',
    )
  })

  it('requires a future start date', () => {
    expect(validateRideForm(validValues({ startsAt: '' }))).toBe(
      'Selecciona una fecha y hora futuras.',
    )
    expect(validateRideForm(validValues({ startsAt: 'no-es-fecha' }))).toBe(
      'Selecciona una fecha y hora futuras.',
    )
    expect(validateRideForm(validValues({ startsAt: '2000-01-01T10:00' }))).toBe(
      'Selecciona una fecha y hora futuras.',
    )
  })

  it('requires a distance between 0 and 1000 km', () => {
    expect(validateRideForm(validValues({ distanceKm: '' }))).toBe(
      'Introduce la distancia de la ruta.',
    )
    expect(validateRideForm(validValues({ distanceKm: '0' }))).toBe(
      'La distancia debe estar entre 0 y 1000 km.',
    )
    expect(validateRideForm(validValues({ distanceKm: '1001' }))).toBe(
      'La distancia debe estar entre 0 y 1000 km.',
    )
  })

  it('requires an elevation between 0 and 20000 m', () => {
    expect(validateRideForm(validValues({ elevationM: '' }))).toBe(
      'Introduce el desnivel positivo.',
    )
    expect(validateRideForm(validValues({ elevationM: '-5' }))).toBe(
      'El desnivel debe estar entre 0 y 20000 metros.',
    )
    expect(validateRideForm(validValues({ elevationM: '20001' }))).toBe(
      'El desnivel debe estar entre 0 y 20000 metros.',
    )
  })

  it('requires an integer duration between 1 and 1440 minutes', () => {
    expect(validateRideForm(validValues({ durationMinutes: '' }))).toBe(
      'Introduce la duración estimada.',
    )
    expect(validateRideForm(validValues({ durationMinutes: '90.5' }))).toBe(
      'La duración debe ser un entero entre 1 y 1440 minutos.',
    )
    expect(validateRideForm(validValues({ durationMinutes: '1441' }))).toBe(
      'La duración debe ser un entero entre 1 y 1440 minutos.',
    )
  })

  it('validates the maximum of participants only when it is filled in', () => {
    expect(validateRideForm(validValues({ maxParticipants: '' }))).toBeNull()
    expect(validateRideForm(validValues({ maxParticipants: '1' }))).toBe(
      'El máximo de participantes debe ser un entero entre 2 y 500.',
    )
    expect(validateRideForm(validValues({ maxParticipants: '501' }))).toBe(
      'El máximo de participantes debe ser un entero entre 2 y 500.',
    )
    expect(validateRideForm(validValues({ maxParticipants: '20' }))).toBeNull()
  })

  it('requires an HTTPS wikiloc link when it is filled in', () => {
    expect(validateRideForm(validValues({ wikilocUrl: 'http://wikiloc.com/ruta' }))).toBe(
      'Introduce una URL HTTPS válida de Wikiloc.',
    )
    expect(validateRideForm(validValues({ wikilocUrl: 'https://evil.com/ruta' }))).toBe(
      'Introduce una URL HTTPS válida de Wikiloc.',
    )
    expect(
      validateRideForm(validValues({ wikilocUrl: 'https://www.wikiloc.com/rutas/123' })),
    ).toBeNull()
  })

  it('rejects an image that does not pass the validation', () => {
    expect(validateRideForm(validValues(), imageOf('image/gif'))).toBe(
      'Selecciona una imagen JPEG, PNG, WebP o AVIF.',
    )
  })

  it('returns the first error in field order', () => {
    const errors = validateRideForm(validValues({ title: 'x', distanceKm: '' }))

    expect(errors).toBe('El título debe tener entre 5 y 100 caracteres.')
  })
})

describe('validateWikilocUrl', () => {
  it('accepts empty values and https wikiloc urls', () => {
    expect(validateWikilocUrl('')).toBe(true)
    expect(validateWikilocUrl('   ')).toBe(true)
    expect(validateWikilocUrl('https://wikiloc.com/rutas/1')).toBe(true)
    expect(validateWikilocUrl('https://sub.wikiloc.com/ruta')).toBe(true)
  })

  it('rejects other hosts, protocols and urls without a path', () => {
    expect(validateWikilocUrl('not a url')).toBe(false)
    expect(validateWikilocUrl('http://wikiloc.com/ruta')).toBe(false)
    expect(validateWikilocUrl('https://wikiloc.com.evil.com/ruta')).toBe(false)
    expect(validateWikilocUrl('https://wikiloc.com')).toBe(false)
    expect(validateWikilocUrl('https://user:pass@wikiloc.com/ruta')).toBe(false)
  })
})
