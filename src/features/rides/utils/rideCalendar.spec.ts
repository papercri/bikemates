import { describe, expect, it } from 'vitest'
import {
  buildGoogleCalendarUrl,
  buildOutlookCalendarUrl,
  buildRideIcs,
  type RideCalendarEntry,
} from './rideCalendar'

const ENTRY: RideCalendarEntry = {
  id: 'ride-1',
  title: 'Vuelta por Collserola',
  description: 'Recorrido sencillo por pista forestal, con parada de café.',
  startsAt: '2026-10-26T10:55:00.000Z',
  durationMinutes: 150,
  meetingPoint: 'Plaça de l’Església, Barcelona',
  url: 'https://bikemates.example/rides/ride-1',
}

describe('buildRideIcs', () => {
  it('generates a valid single-event calendar with start and end times', () => {
    const ics = buildRideIcs(ENTRY)
    const lines = ics.split('\r\n')

    expect(lines[0]).toBe('BEGIN:VCALENDAR')
    expect(lines.at(-2)).toBe('END:VCALENDAR')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('DTSTART:20261026T105500Z')
    // 150 minutos de duración sobre la hora de salida.
    expect(ics).toContain('DTEND:20261026T132500Z')
    expect(ics).toContain('SUMMARY:Vuelta por Collserola')
    expect(ics).toContain('URL:https://bikemates.example/rides/ride-1')
  })

  it('escapes reserved characters in text values', () => {
    const ics = buildRideIcs({
      ...ENTRY,
      description: 'Punto kilómetro 3; café,\nsin reservar',
      meetingPoint: 'Carrer de l’Església, 12',
    })

    expect(ics).toContain('DESCRIPTION:Punto kilómetro 3\\; café\\,\\nsin reservar')
    expect(ics).toContain('LOCATION:Carrer de l’Església\\, 12')
  })

  it('clamps negative durations to a zero-length event', () => {
    const ics = buildRideIcs({ ...ENTRY, durationMinutes: -10 })

    expect(ics).toContain('DTSTART:20261026T105500Z')
    expect(ics).toContain('DTEND:20261026T105500Z')
  })

  it('throws when the start date is not a valid date', () => {
    expect(() => buildRideIcs({ ...ENTRY, startsAt: 'no-es-una-fecha' })).toThrow(
      'Fecha de salida no válida para el calendario',
    )
  })
})

describe('buildGoogleCalendarUrl', () => {
  it('builds a prefilled Google Calendar render URL with the ride window in UTC', () => {
    const url = new URL(buildGoogleCalendarUrl(ENTRY))

    expect(url.origin + url.pathname).toBe('https://calendar.google.com/calendar/render')
    expect(url.searchParams.get('action')).toBe('TEMPLATE')
    expect(url.searchParams.get('text')).toBe('Vuelta por Collserola')
    expect(url.searchParams.get('dates')).toBe('20261026T105500Z/20261026T132500Z')
    expect(url.searchParams.get('location')).toBe('Plaça de l’Església, Barcelona')
  })

  it('throws when the start date is not a valid date', () => {
    expect(() => buildGoogleCalendarUrl({ ...ENTRY, startsAt: 'no-es-una-fecha' })).toThrow(
      'Fecha de salida no válida para el calendario',
    )
  })
})

describe('buildOutlookCalendarUrl', () => {
  it('builds a prefilled Outlook compose URL with ISO timestamps', () => {
    const url = new URL(buildOutlookCalendarUrl(ENTRY))

    expect(url.origin + url.pathname).toBe(
      'https://outlook.live.com/calendar/0/deeplink/compose',
    )
    expect(url.searchParams.get('rru')).toBe('addevent')
    expect(url.searchParams.get('subject')).toBe('Vuelta por Collserola')
    expect(url.searchParams.get('startdt')).toBe('2026-10-26T10:55:00.000Z')
    expect(url.searchParams.get('enddt')).toBe('2026-10-26T13:25:00.000Z')
  })

  it('throws when the start date is not a valid date', () => {
    expect(() => buildOutlookCalendarUrl({ ...ENTRY, startsAt: 'no-es-una-fecha' })).toThrow(
      'Fecha de salida no válida para el calendario',
    )
  })
})
