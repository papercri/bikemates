export type RideLevel = 'Iniciación' | 'Intermedio' | 'Avanzado'

export interface Ride {
  id: number
  title: string
  location: string
  distanceKm: number
  elevationM: number
  level: RideLevel
  description: string
}
