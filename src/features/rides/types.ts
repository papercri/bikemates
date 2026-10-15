
export type RideLevel = 'Iniciación' | 'Intermedio' | 'Avanzado'

export type BikeType = 'road' | 'mtb' | 'gravel' | 'urban' | 'other'

export type RideAudience = 'everyone' | 'women' | 'men' | 'lgbt'

export type RideStatus = 'draft' | 'published' | 'cancelled' | 'completed'

export interface Ride {
  id: string | number
  organizerId: string
  title: string
  description: string
  startsAt: string
  meetingPoint: string
  latitude: number
  longitude: number
  bikeType: BikeType
  level: RideLevel
  distanceKm: number
  elevationM: number
  durationMinutes: number
  imagePath: string | null
  wikilocUrl: string | null
  audience: RideAudience
  maxParticipants: number | null
  status: RideStatus
  createdAt: string
  updatedAt: string
}


export interface CreateRideInput {
  title: string
  description: string
  startsAt: string
  meetingPoint: string
  latitude: number
  longitude: number
  bikeType: BikeType
  level: RideLevel
  distanceKm: number
  elevationM: number
  durationMinutes: number
  imagePath: string | null
  wikilocUrl: string | null
  audience: RideAudience
  maxParticipants: number | null
  status: 'draft' | 'published'
}
