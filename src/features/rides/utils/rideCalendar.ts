/** Generación de archivos iCalendar (RFC 5545) para añadir una salida al calendario. */

const ICS_EOL = '\r\n'

export interface RideCalendarEntry {
  id: string
  title: string
  description: string
  startsAt: string
  durationMinutes: number
  meetingPoint: string
  url: string
}

/** Escapa los caracteres reservados de valor de texto (RFC 5545 §3.3.11). */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/** Marca de tiempo UTC compacta, p. ej. `20261026T095500Z`. */
function formatUtc(date: Date): string {
  return `${date.toISOString().slice(0, 19).replace(/[-:]/g, '')}Z`
}

/**
 * Construye el contenido .ics de una salida.
 * Lanza un error si la fecha de salida no es válida: el llamante decide qué mostrar.
 */
export function buildRideIcs(entry: RideCalendarEntry): string {
  const start = new Date(entry.startsAt)

  if (Number.isNaN(start.getTime())) {
    throw new Error('Fecha de salida no válida para el calendario')
  }

  const end = new Date(start.getTime() + Math.max(entry.durationMinutes, 0) * 60_000)

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BikeMates//Salidas en bicicleta//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${escapeText(entry.id)}@bikemates`,
    `DTSTAMP:${formatUtc(new Date())}`,
    `DTSTART:${formatUtc(start)}`,
    `DTEND:${formatUtc(end)}`,
    `SUMMARY:${escapeText(entry.title)}`,
    `DESCRIPTION:${escapeText(entry.description)}`,
    `LOCATION:${escapeText(entry.meetingPoint)}`,
    `URL:${entry.url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  return `${lines.join(ICS_EOL)}${ICS_EOL}`
}
