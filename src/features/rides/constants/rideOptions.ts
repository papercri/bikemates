import type { BikeType, RideAudience, RideStatus } from '../types'

/** Lista y etiquetas de los tipos de bicicleta, compartidas por formularios y vistas. */
export const RIDE_BIKE_TYPES: readonly BikeType[] = ['road', 'mtb', 'gravel', 'urban', 'other']

export const RIDE_BIKE_TYPE_LABELS: Record<BikeType, string> = {
  road: 'Carretera',
  mtb: 'MTB',
  gravel: 'Gravel',
  urban: 'Urbana',
  other: 'Otra',
}

export const RIDE_AUDIENCES: readonly RideAudience[] = ['everyone', 'women', 'men', 'lgbt']

export const RIDE_AUDIENCE_LABELS: Record<RideAudience, string> = {
  everyone: 'Todo el mundo',
  women: 'Mujeres',
  men: 'Hombres',
  lgbt: 'Comunidad LGBT+',
}

export const RIDE_STATUSES: readonly RideStatus[] = ['draft', 'published', 'cancelled', 'completed']
