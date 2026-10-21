import { supabase } from '@/services/supabase'
import type { RideMessage } from '../types'

const MESSAGE_SELECT = `
  id,
  ride_id,
  content,
  created_at,
  author:profiles!ride_messages_author_id_fkey (
    id,
    display_name,
    avatar_url
  )
`

interface MessageRow {
  id: string
  ride_id: string
  content: string
  created_at: string
  author: { id: string; display_name: string; avatar_url: string | null } | null
}

function mapMessage(row: MessageRow): RideMessage {
  if (!row.author) {
    throw new Error('Un comentario no tiene autor válido.')
  }

  return {
    id: row.id,
    rideId: row.ride_id,
    content: row.content,
    createdAt: row.created_at,
    author: {
      id: row.author.id,
      displayName: row.author.display_name,
      avatarUrl: row.author.avatar_url,
    },
  }
}

/** Comentarios de una ruta, en orden cronológico. */
export async function getRideMessages(rideId: string): Promise<RideMessage[]> {
  const { data, error } = await supabase
    .from('ride_messages')
    .select(MESSAGE_SELECT)
    .eq('ride_id', rideId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`No se pudieron cargar los comentarios: ${error.message}`)
  }

  return (data as MessageRow[]).map(mapMessage)
}

/** Límite de caracteres del filtro antispam, alineado con el maxlength del campo. */
export const RIDE_MESSAGE_MAX_LENGTH = 1000

/** Publica un comentario como usuario autenticado. */
export async function createRideMessage(rideId: string, content: string): Promise<RideMessage> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Debes iniciar sesión para comentar.')
  }

  // Filtro antispam: solo texto plano (sin etiquetas HTML) y longitud máxima.
  const plain = content.replace(/<[^>]*>/g, '').trim()

  if (!plain) {
    throw new Error('El comentario no puede estar vacío.')
  }

  if (plain.length > RIDE_MESSAGE_MAX_LENGTH) {
    throw new Error(`El comentario no puede superar los ${RIDE_MESSAGE_MAX_LENGTH} caracteres.`)
  }

  const { data, error } = await supabase
    .from('ride_messages')
    .insert({ ride_id: rideId, author_id: user.id, content: plain })
    .select(MESSAGE_SELECT)
    .single()

  if (error) {
    throw new Error(`No se pudo publicar el comentario: ${error.message}`)
  }

  return mapMessage(data as MessageRow)
}
