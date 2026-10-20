import { supabase } from '@/services/supabase'
import type { CreateRideInput, UpdateRideInput, Ride, RideParticipant } from '../types'
import {
  isBikeType,
  isRideAudience,
  isRideLevel,
  isRideStatus,
} from '../validators/rideValueGuards'
function getRideImageUrl(imagePath: string | null): string | null {
  if (!imagePath) {
    return null
  }

  const { data } = supabase.storage.from('ride-images').getPublicUrl(imagePath)

  return data.publicUrl
}
function mapRide(data: {
  id: string
  organizer_id: string
  title: string
  description: string
  starts_at: string
  meeting_point: string
  latitude: number
  longitude: number
  bike_type: string
  level: string
  distance_km: number
  elevation_m: number
  duration_minutes: number
  image_path: string | null
  wikiloc_url: string | null
  audience: string
  max_participants: number | null
  status: string
  created_at: string
  updated_at: string
}): Ride {
  if (
    !isBikeType(data.bike_type) ||
    !isRideLevel(data.level) ||
    !isRideAudience(data.audience) ||
    !isRideStatus(data.status)
  ) {
    throw new Error('La ruta contiene valores no válidos.')
  }

  return {
    id: data.id,
    organizerId: data.organizer_id,
    title: data.title,
    description: data.description,
    startsAt: data.starts_at,
    meetingPoint: data.meeting_point,
    latitude: data.latitude,
    longitude: data.longitude,
    bikeType: data.bike_type,
    level: data.level,
    distanceKm: data.distance_km,
    elevationM: data.elevation_m,
    durationMinutes: data.duration_minutes,
    imagePath: data.image_path,
    wikilocUrl: data.wikiloc_url,
    audience: data.audience,
    maxParticipants: data.max_participants,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    imageUrl: getRideImageUrl(data.image_path),
  }
}

export async function createRide(input: CreateRideInput): Promise<Ride> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Debes iniciar sesión para publicar una ruta.')
  }

  const { data, error } = await supabase
    .from('rides')
    .insert({
      organizer_id: user.id,
      title: input.title,
      description: input.description,
      starts_at: input.startsAt,
      meeting_point: input.meetingPoint,
      latitude: input.latitude,
      longitude: input.longitude,
      bike_type: input.bikeType,
      level: input.level,
      distance_km: input.distanceKm,
      elevation_m: input.elevationM,
      duration_minutes: input.durationMinutes,
      image_path: input.imagePath,
      wikiloc_url: input.wikilocUrl,
      audience: input.audience,
      max_participants: input.maxParticipants,
      status: input.status,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`No se pudo crear la ruta: ${error.message}`)
  }

  return mapRide(data)
}

export async function getPublishedRides(): Promise<Ride[]> {
  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .eq('status', 'published')
    .order('starts_at', { ascending: true })

  if (error) {
    throw new Error(`No se pudieron cargar las rutas: ${error.message}`)
  }

  return data.map(mapRide)
}

export async function getRideById(id: string): Promise<Ride> {
  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (error) {
    throw new Error(`No se pudo cargar la ruta: ${error.message}`)
  }

  return mapRide(data)
}
export async function getRideForEdit(id: string): Promise<Ride> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Debes iniciar sesión para editar una ruta.')
  }

  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .eq('id', id)
    .eq('organizer_id', user.id)
    .maybeSingle()

  if (error) {
    throw new Error(`No se pudo cargar la ruta: ${error.message}`)
  }

  if (!data) {
    throw new Error('La ruta no existe o no tienes permiso para editarla.')
  }

  return mapRide(data)
}
export async function getMyRides(): Promise<Ride[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Debes iniciar sesión para consultar tus rutas.')
  }

  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .eq('organizer_id', user.id)
    .in('status', ['published', 'completed', 'cancelled'])
    .order('starts_at', { ascending: true })

  if (error) {
    throw new Error(`No se pudieron cargar tus rutas: ${error.message}`)
  }

  return data.map(mapRide)
}

export async function deleteRide(id: string): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Debes iniciar sesión para eliminar una ruta.')
  }

  const { data, error } = await supabase
    .from('rides')
    .delete()
    .eq('id', id)
    .eq('organizer_id', user.id)
    .select('id')
    .maybeSingle()

  if (error) {
    throw new Error(`No se pudo eliminar la ruta: ${error.message}`)
  }

  if (!data) {
    throw new Error('La ruta no existe o no tienes permiso para eliminarla.')
  }
}

export async function updateRide(id: string, input: UpdateRideInput): Promise<Ride> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Debes iniciar sesión para editar una ruta.')
  }

  const { data, error } = await supabase
    .from('rides')
    .update({
      title: input.title,
      description: input.description,
      starts_at: input.startsAt,
      meeting_point: input.meetingPoint,
      latitude: input.latitude,
      longitude: input.longitude,
      bike_type: input.bikeType,
      level: input.level,
      distance_km: input.distanceKm,
      elevation_m: input.elevationM,
      duration_minutes: input.durationMinutes,
      image_path: input.imagePath,
      wikiloc_url: input.wikilocUrl,
      audience: input.audience,
      max_participants: input.maxParticipants,
    })
    .eq('id', id)
    .eq('organizer_id', user.id)
    .select()
    .maybeSingle()

  if (error) {
    throw new Error(`No se pudo actualizar la ruta: ${error.message}`)
  }

  if (!data) {
    throw new Error('La ruta no existe o no tienes permiso para editarla.')
  }

  return mapRide(data)
}

export async function getRideParticipants(
  rideId: string,
  organizerId: string,
): Promise<RideParticipant[]> {
  const { data, error } = await supabase
    .from('ride_participants')
    .select(
      `
      user_id,
      profiles (
        id,
        display_name,
        avatar_url
      )
    `,
    )
    .eq('ride_id', rideId)
    .order('joined_at', { ascending: true })

  if (error) {
    throw new Error(`No se pudieron cargar los participantes: ${error.message}`)
  }

  return data.map((participant) => {
    const profile = participant.profiles

    if (!profile) {
      throw new Error('No se ha podido recuperar el perfil de un participante.')
    }

    return {
      id: profile.id,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      isOrganizer: profile.id === organizerId,
    }
  })
}

/**
 * Identificadores de las rutas en las que el usuario autenticado participa.
 * Devuelve una lista vacía cuando no hay sesión: el listado público funciona
 * igualmente y solo omite las insignias y el filtro de participación.
 */
export async function getMyParticipatingRideIds(): Promise<string[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return []
  }

  const { data, error } = await supabase
    .from('ride_participants')
    .select('ride_id')
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`No se pudieron cargar tus inscripciones: ${error.message}`)
  }

  return data.map((row) => row.ride_id)
}

export async function getRideParticipantCount(rideId: string): Promise<number> {
  const { data, error } = await supabase.rpc('get_ride_participant_count', { p_ride_id: rideId })

  if (error) {
    throw new Error(`No se pudo cargar el número de participantes: ${error.message}`)
  }

  return Number(data)
}
export async function joinRide(rideId: string): Promise<void> {
  const { error } = await supabase.rpc('join_ride', {
    p_ride_id: rideId,
  })

  if (error) {
    throw error
  }
}

export async function leaveRide(rideId: string): Promise<void> {
  const { error } = await supabase.rpc('leave_ride', {
    p_ride_id: rideId,
  })

  if (error) {
    throw new Error(`No se pudo cancelar la inscripción: ${error.message}`)
  }
}
