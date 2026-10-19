import { supabase } from '@/services/supabase'
import {
  INVALID_IMAGE_TYPE_MESSAGE,
  getImageFileExtension,
  validateImageFile,
} from '@/utils/imageValidation'
import type { Profile } from '../types'

/**
 * Los avatares se guardan en el bucket existente \`ride-images\`, dentro de la
 * carpeta personal del usuario (la misma convención que las portadas), y la
 * URL pública resultante se persiste en \`profiles.avatar_url\`.
 */
const AVATAR_BUCKET = 'ride-images'

interface ProfileRow {
  id: string
  display_name: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

const PROFILE_COLUMNS = 'id, display_name, avatar_url, created_at, updated_at'

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    throw new Error('Debes iniciar sesión para gestionar tu perfil.')
  }

  return data.user.id
}

function getAvatarPublicUrl(filePath: string): string {
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath)

  // El path del avatar es estable, así que sin el sufijo de versión el
  // navegador podría servir la foto anterior desde su caché.
  return `${data.publicUrl}?v=${Date.now()}`
}

/**
 * Carga el perfil del usuario con sesión activa. Si la fila no existe (el
 * trigger de registro no corrió), se crea una vez a partir de los metadatos
 * de Auth para que el perfil siempre sea recuperable.
 */
export async function getMyProfile(): Promise<Profile> {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(`No se ha podido cargar el perfil: ${error.message}`)
  }

  if (data) {
    return mapProfile(data)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const metadata: unknown = user?.user_metadata
  const metadataName =
    typeof metadata === 'object' && metadata !== null && 'display_name' in metadata
      ? metadata.display_name
      : undefined

  const fallbackName =
    typeof metadataName === 'string' && metadataName.trim() !== ''
      ? metadataName.trim()
      : 'Ciclista'

  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .insert({ id: userId, display_name: fallbackName })
    .select(PROFILE_COLUMNS)
    .single()

  if (insertError || !created) {
    throw new Error('No se ha podido cargar el perfil. Inténtalo de nuevo más tarde.')
  }

  return mapProfile(created)
}

/** Actualiza el nombre visible del perfil y lo sincroniza con los metadatos de Auth. */
export async function updateMyProfile(displayName: string): Promise<Profile> {
  const userId = await requireUserId()
  const trimmed = displayName.trim()

  const { data, error } = await supabase
    .from('profiles')
    .update({ display_name: trimmed, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select(PROFILE_COLUMNS)
    .single()

  if (error || !data) {
    throw new Error('No se ha podido guardar el nombre. Inténtalo de nuevo.')
  }

  // Auth guarda el nombre en los metadatos del usuario (lo usa el registro);
  // se sincroniza para que ambas fuentes no diverjan. Un fallo aquí no debe
  // deshacer el cambio ya guardado en el perfil.
  const { error: metadataError } = await supabase.auth.updateUser({
    data: { display_name: trimmed },
  })

  if (metadataError) {
    console.error('No se ha podido sincronizar el nombre en Auth:', metadataError)
  }

  return mapProfile(data)
}

/**
 * Sube el avatar a la carpeta personal del usuario (sobrescribiendo el
 * anterior) y guarda la URL pública cache-busteada en el perfil.
 */
export async function saveAvatar(file: File): Promise<Profile> {
  const validationError = validateImageFile(file)

  if (validationError) {
    throw new Error(validationError)
  }

  const userId = await requireUserId()
  const extension = getImageFileExtension(file.type)

  if (extension === null) {
    // Defensa ante tipos no permitidos: la validación anterior ya los descarta.
    throw new Error(INVALID_IMAGE_TYPE_MESSAGE)
  }

  const filePath = `${userId}/avatar.${extension}`

  const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: true,
  })

  if (uploadError) {
    throw new Error('No se ha podido subir la imagen. Inténtalo de nuevo.')
  }

  const avatarUrl = getAvatarPublicUrl(filePath)

  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select(PROFILE_COLUMNS)
    .single()

  if (error || !data) {
    throw new Error('No se ha podido guardar el avatar. Inténtalo de nuevo.')
  }

  return mapProfile(data)
}
