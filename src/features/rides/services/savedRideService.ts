import { supabase } from '@/services/supabase'
import { mapRide } from './rideService'
import type { Ride } from '../types'

/** Identificadores de las rutas guardadas del usuario actual. RLS limita a las propias. */
export async function getSavedRideIds(): Promise<string[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return []
  }

  const { data, error } = await supabase.from('saved_rides').select('ride_id').eq('user_id', user.id)

  if (error) {
    console.error('Error al cargar rutas guardadas:', error.message)
    throw new Error('No se han podido cargar tus rutas guardadas.')
  }

  return data.map((row) => row.ride_id)
}

/** Guarda una ruta en favoritos. Idempotente: duplicados los evita el índice único. */
export async function saveRide(rideId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Debes iniciar sesión para guardar rutas.')
  }

  const { error } = await supabase.from('saved_rides').insert({ ride_id: rideId, user_id: user.id })

  if (error) {
    // 23505 = violación de índice único: ya estaba guardada; se trata como éxito.
    if (error.code === '23505') return

    console.error('Error al guardar ruta:', error.message)
    throw new Error('No se ha podido guardar la ruta.')
  }
}

/** Quita una ruta de favoritos. */
export async function unsaveRide(rideId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Debes iniciar sesión para gestionar tus rutas guardadas.')
  }

  const { error } = await supabase
    .from('saved_rides')
    .delete()
    .eq('ride_id', rideId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error al quitar ruta guardada:', error.message)
    throw new Error('No se ha podido quitar la ruta de guardadas.')
  }
}

/** Rutas guardadas del usuario actual, más recientes primero. */
export async function getSavedRides(): Promise<Ride[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Debes iniciar sesión para consultar tus rutas guardadas.')
  }

  const { data, error } = await supabase
    .from('saved_rides')
    .select('created_at, rides(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error al cargar rutas guardadas:', error.message)
    throw new Error('No se han podido cargar tus rutas guardadas.')
  }

  const rides: Ride[] = []

  for (const row of data) {
    const ride = row.rides
    if (!ride || Array.isArray(ride)) continue
    rides.push(mapRide(ride))
  }

  return rides
}
