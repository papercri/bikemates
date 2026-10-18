import { describe, expect, it } from 'vitest'
import {
  EMPTY_IMAGE_MESSAGE,
  IMAGE_TOO_LARGE_MESSAGE,
  INVALID_IMAGE_TYPE_MESSAGE,
  getImageFileExtension,
  validateImageFile,
} from './imageValidation'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

function imageOf(type: string, size = 1024): File {
  const file = new File(['contenido'], 'imagen', { type })
  Object.defineProperty(file, 'size', { value: size })

  return file
}

describe('validateImageFile', () => {
  it('accepts the allowed image types within the size limit', () => {
    expect(validateImageFile(imageOf('image/jpeg'))).toBeNull()
    expect(validateImageFile(imageOf('image/png'))).toBeNull()
    expect(validateImageFile(imageOf('image/webp'))).toBeNull()
    expect(validateImageFile(imageOf('image/avif'))).toBeNull()
  })

  it('rejects types outside the allowed list', () => {
    expect(validateImageFile(imageOf('image/gif'))).toBe(INVALID_IMAGE_TYPE_MESSAGE)
    expect(validateImageFile(imageOf('image/jpg'))).toBe(INVALID_IMAGE_TYPE_MESSAGE)
    expect(validateImageFile(imageOf('image/svg+xml'))).toBe(INVALID_IMAGE_TYPE_MESSAGE)
    expect(validateImageFile(imageOf('application/pdf'))).toBe(INVALID_IMAGE_TYPE_MESSAGE)
  })

  it('accepts an image of exactly 5 MB', () => {
    expect(validateImageFile(imageOf('image/png', MAX_IMAGE_SIZE))).toBeNull()
  })

  it('rejects images above the 5 MB limit', () => {
    expect(validateImageFile(imageOf('image/png', MAX_IMAGE_SIZE + 1))).toBe(IMAGE_TOO_LARGE_MESSAGE)
  })

  it('rejects empty files that carry an allowed type', () => {
    expect(validateImageFile(imageOf('image/jpeg', 0))).toBe(EMPTY_IMAGE_MESSAGE)
  })

  it('checks the type before the size so the first error wins', () => {
    expect(validateImageFile(imageOf('image/gif', 0))).toBe(INVALID_IMAGE_TYPE_MESSAGE)
  })
})

describe('getImageFileExtension', () => {
  it('normalises every allowed type to its storage extension', () => {
    expect(getImageFileExtension('image/jpeg')).toBe('jpg')
    expect(getImageFileExtension('image/png')).toBe('png')
    expect(getImageFileExtension('image/webp')).toBe('webp')
    expect(getImageFileExtension('image/avif')).toBe('avif')
  })

  it('returns null for unknown types', () => {
    expect(getImageFileExtension('image/gif')).toBeNull()
    expect(getImageFileExtension('')).toBeNull()
  })
})
