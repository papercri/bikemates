export type RideLevel = 'Iniciación' | 'Intermedio' | 'Avanzado'

export type BikeType = 'all' | 'road' | 'mtb' | 'gravel' | 'urban' | 'other'

export type RideAudience = 'everyone' | 'women' | 'men' | 'lgbt'

export type RideStatus = 'draft' | 'published' | 'cancelled' | 'completed'

export type RideRouteType = 'circular' | 'round_trip'

export interface Ride {
  id: string
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
  routeType: RideRouteType | null
  status: RideStatus
  createdAt: string
  updatedAt: string
  imageUrl: string | null
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
  routeType: RideRouteType
  status: 'draft' | 'published'
}
export interface RideFormValues {
  title: string
  description: string
  startsAt: string
  meetingPoint: string
  latitude: number | null
  longitude: number | null
  bikeType: BikeType
  level: RideLevel
  distanceKm: string
  elevationM: string
  durationMinutes: string
  wikilocUrl: string
  audience: RideAudience
  maxParticipants: string
  isCircular: boolean
}

export interface RideFormSubmission {
  values: RideFormValues
  image: File | null
  removeCurrentImage: boolean
}

export interface RideParticipant {
  id: string
  displayName: string
  avatarUrl: string | null
  isOrganizer: boolean
}

export type UpdateRideInput = Omit<CreateRideInput, 'status'>

export interface RideMessage {
  id: string
  rideId: string
  content: string
  createdAt: string
  author: {
    id: string
    displayName: string
    avatarUrl: string | null
  }
}
