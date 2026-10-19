import type { BikeType, RideAudience, RideStatus } from '../types'

/**
 * Dominio completo de tipos de bicicleta, incluido `other`, que sigue siendo
 * válido para salidas ya publicadas. Es la lista contra la que se validan los
 * datos que llegan de la base de datos.
 */
export const RIDE_BIKE_TYPE_VALUES: readonly BikeType[] = [
  'road',
  'mtb',
  'gravel',
  'urban',
  'other',
]

/**
 * Tipos de bicicleta ofertables en formularios: `other` no se ofrece al crear
 * o editar, pero las salidas antiguas con ese valor se siguen mostrando.
 */
export const RIDE_BIKE_TYPES: readonly BikeType[] = ['road', 'mtb', 'gravel', 'urban']

export const RIDE_BIKE_TYPE_LABELS: Record<BikeType, string> = {
  road: 'Carretera',
  mtb: 'MTB',
  gravel: 'Gravel',
  urban: 'Urbana',
  other: 'Otra',
}

export const RIDE_AUDIENCES: readonly RideAudience[] = ['everyone', 'women', 'men', 'lgbt']

export const RIDE_AUDIENCE_LABELS: Record<RideAudience, string> = {
  everyone: 'Todos',
  women: 'Mujeres',
  men: 'Hombres',
  lgbt: 'Comunidad LGBT+',
}

export const RIDE_STATUSES: readonly RideStatus[] = ['draft', 'published', 'cancelled', 'completed']
