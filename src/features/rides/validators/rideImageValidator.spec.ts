import { describe, expect, it } from 'vitest'
import {
  INVALID_IMAGE_TYPE_MESSAGE,
  getRideImageExtension,
  validateRideImage,
} from './rideImageValidator'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

function imageOf(type: string, size = 1024): File {
  const file = new File(['contenido'], 'portada', { type })
  Object.defineProperty(file, 'size', { value: size })

  return file
}

describe('validateRideImage', () => {
  it('accepts the allowed image types within the size limit', () => {
    expect(validateRideImage(imageOf('image/jpeg'))).toBeNull()
    expect(validateRideImage(imageOf('image/png'))).toBeNull()
    expect(validateRideImage(imageOf('image/webp'))).toBeNull()
    expect(validateRideImage(imageOf('image/avif'))).toBeNull()
  })

  it('rejects types outside the allowed list', () => {
    expect(validateRideImage(imageOf('image/gif'))).toBe(INVALID_IMAGE_TYPE_MESSAGE)
    expect(validateRideImage(imageOf('image/jpg'))).toBe(INVALID_IMAGE_TYPE_MESSAGE)
    expect(validateRideImage(imageOf('image/svg+xml'))).toBe(INVALID_IMAGE_TYPE_MESSAGE)
    expect(validateRideImage(imageOf('application/pdf'))).toBe(INVALID_IMAGE_TYPE_MESSAGE)
  })

  it('accepts an image of exactly 5 MB', () => {
    expect(validateRideImage(imageOf('image/png', MAX_IMAGE_SIZE))).toBeNull()
  })

  it('rejects images above the 5 MB limit', () => {
    expect(validateRideImage(imageOf('image/png', MAX_IMAGE_SIZE + 1))).toBe(
      'La imagen no puede superar los 5 MB.',
    )
  })

  it('rejects empty files that carry an allowed type', () => {
    expect(validateRideImage(imageOf('image/jpeg', 0))).toBe('El archivo seleccionado está vacío.')
  })

  it('checks the type before the size so the first error wins', () => {
    expect(validateRideImage(imageOf('image/gif', 0))).toBe(INVALID_IMAGE_TYPE_MESSAGE)
  })
})

describe('getRideImageExtension', () => {
  it('normalises every allowed type to its storage extension', () => {
    expect(getRideImageExtension('image/jpeg')).toBe('jpg')
    expect(getRideImageExtension('image/png')).toBe('png')
    expect(getRideImageExtension('image/webp')).toBe('webp')
    expect(getRideImageExtension('image/avif')).toBe('avif')
  })

  it('returns null for unknown types', () => {
    expect(getRideImageExtension('image/gif')).toBeNull()
    expect(getRideImageExtension('')).toBeNull()
  })
})
