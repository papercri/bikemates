import { supabase } from '@/services/supabase'
import {
  INVALID_IMAGE_TYPE_MESSAGE,
  getRideImageExtension,
  validateRideImage,
} from '../validators/rideImageValidator'

const BUCKET_NAME = 'ride-images'

export async function uploadRideImage(file: File): Promise<string> {
  const validationError = validateRideImage(file)

  if (validationError) {
    throw new Error(validationError)
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Debes iniciar sesión para subir una imagen.')
  }

  const extension = getRideImageExtension(file.type)

  if (extension === null) {
    // Defensa ante tipos no permitidos: la validación anterior ya los descarta.
    throw new Error(INVALID_IMAGE_TYPE_MESSAGE)
  }

  const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  })

  if (error) {
    throw new Error('No se ha podido subir la imagen.')
  }

  return filePath
}

export async function deleteRideImage(filePath: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])

  if (error) {
    throw new Error('No se ha podido eliminar la imagen.')
  }
}

export function getRideImageUrl(filePath: string): string {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

  return data.publicUrl
}
