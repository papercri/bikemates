
import { supabase } from '@/services/supabase'

const BUCKET_NAME = 'ride-images'
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const

type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number]

const FILE_EXTENSIONS: Record<AllowedImageType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

export function validateRideImage(file: File): string | null {
  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type as AllowedImageType,
    )
  ) {
    return 'Selecciona una imagen JPEG, PNG, WebP o AVIF.'
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return 'La imagen no puede superar los 5 MB.'
  }

  if (file.size === 0) {
    return 'El archivo seleccionado está vacío.'
  }

  return null
}

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

  const extension = FILE_EXTENSIONS[file.type as AllowedImageType]
  const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
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
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath])

  if (error) {
    throw new Error('No se ha podido eliminar la imagen.')
  }
}

export function getRideImageUrl(filePath: string): string {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath)

  return data.publicUrl
}
