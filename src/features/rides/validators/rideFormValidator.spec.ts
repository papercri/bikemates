import { describe, expect, it } from 'vitest'
import type { RideFormValues } from '../types'
import {
  emptyRideFormErrors,
  firstRideFormError,
  validateRideForm,
  validateRideFormFields,
  validateRouteUrl,
} from './rideFormValidator'

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

  it('requires a description between 10 and 8000 characters', () => {
    expect(validateRideForm(validValues({ description: 'corta' }))).toBe(
      'La descripción debe tener entre 10 y 8000 caracteres.',
    )
  })

  it('rejects offensive words in the title', () => {
    expect(validateRideForm(validValues({ title: 'Ruta de mierda por la sierra' }))).toBe(
      'El título contiene palabras no permitidas.',
    )
    expect(validateRideForm(validValues({ title: 'Vuelta puta por Collserola' }))).toBe(
      'El título contiene palabras no permitidas.',
    )
  })

  it('rejects offensive and sexual words in the description', () => {
    expect(
      validateRideForm(
        validValues({ description: 'Recorrido con tramo erotico y subida fuerte.' }),
      ),
    ).toBe('La descripción contiene palabras no permitidas.')
    expect(
      validateRideForm(validValues({ description: 'Salida tranquila, sin hostias ni drama.' })),
    ).toBeNull()
  })

  it('does not flag innocent words that merely share letters with the list', () => {
    // "class", "glass" o "asist" no deben activar la criba.
    expect(validateRideForm(validValues({ title: 'Clase de ciclismo en asfalto' }))).toBeNull()
    expect(validateRideForm(validValues({ title: 'Ruta por la sierra de Guadarrama' }))).toBeNull()
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

  it('requires an HTTPS route link when it is filled in', () => {
    expect(validateRideForm(validValues({ wikilocUrl: 'http://wikiloc.com/ruta' }))).toBe(
      'Introduce una URL HTTPS válida (Wikiloc, Strava, Meetup…).',
    )
    expect(validateRideForm(validValues({ wikilocUrl: 'no-es-una-url' }))).toBe(
      'Introduce una URL HTTPS válida (Wikiloc, Strava, Meetup…).',
    )
    expect(
      validateRideForm(validValues({ wikilocUrl: 'https://www.wikiloc.com/rutas/123' })),
    ).toBeNull()
    expect(
      validateRideForm(validValues({ wikilocUrl: 'https://www.strava.com/routes/123' })),
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

describe('validateRouteUrl', () => {
  it('accepts empty values and https links to any platform', () => {
    expect(validateRouteUrl('')).toBe(true)
    expect(validateRouteUrl('   ')).toBe(true)
    expect(validateRouteUrl('https://wikiloc.com/rutas/1')).toBe(true)
    expect(validateRouteUrl('https://www.strava.com/routes/123')).toBe(true)
    expect(validateRouteUrl('https://www.meetup.com/es-ES/barcelona-cycling/')).toBe(true)
  })

  it('rejects non-https values, invalid urls and urls with credentials', () => {
    expect(validateRouteUrl('not a url')).toBe(false)
    expect(validateRouteUrl('http://wikiloc.com/ruta')).toBe(false)
    expect(validateRouteUrl('javascript:alert(1)')).toBe(false)
    expect(validateRouteUrl('https://user:pass@wikiloc.com/ruta')).toBe(false)
  })
})

describe('validateRideFormFields', () => {
  it('returns every field as valid for a coherent ride', () => {
    const errors = validateRideFormFields(validValues())

    expect(firstRideFormError(errors)).toBeNull()
  })

  it('reports the error of each invalid field independently', () => {
    const errors = validateRideFormFields(validValues({ title: 'abc', distanceKm: '0' }))

    expect(errors.title).toBe('El título debe tener entre 5 y 100 caracteres.')
    expect(errors.distanceKm).toBe('La distancia debe estar entre 0 y 1000 km.')
    expect(errors.description).toBeNull()
  })

  it('returns the first error in display order', () => {
    const errors = validateRideFormFields(validValues({ distanceKm: '0', title: 'abc' }))

    expect(firstRideFormError(errors)).toBe('El título debe tener entre 5 y 100 caracteres.')
  })

  it('starts from an all-null error object', () => {
    const errors = emptyRideFormErrors()

    expect(Object.values(errors).every((error) => error === null)).toBe(true)
    expect(firstRideFormError(errors)).toBeNull()
  })
})
