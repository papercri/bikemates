import type { Ride } from '../types'

export const mockRides: Ride[] = [
  {
    id: 1,
    title: 'Vuelta por Collserola',
    location: 'Barcelona',
    distanceKm: 35,
    elevationM: 650,
    level: 'Intermedio',
    description:
      'Una salida para descubrir los caminos de Collserola y disfrutar de las vistas de Barcelona.',
  },
  {
    id: 2,
    title: 'Ruta por el paseo marítimo',
    location: 'Badalona',
    distanceKm: 20,
    elevationM: 120,
    level: 'Iniciación',
    description:
      'Un recorrido accesible junto al mar, ideal para disfrutar de una salida tranquila.',
  },
  {
    id: 3,
    title: 'Desafío del Montseny',
    location: 'Sant Celoni',
    distanceKm: 85,
    elevationM: 1800,
    level: 'Avanzado',
    description: 'Una ruta exigente con bastante desnivel para ciclistas que buscan un reto.',
  },
]
