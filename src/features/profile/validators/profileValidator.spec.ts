import { describe, expect, it } from 'vitest'
import { INVALID_IMAGE_TYPE_MESSAGE } from '@/utils/imageValidation'
import { validateAvatarImage, validateDisplayName } from './profileValidator'

function imageOf(type: string, size = 1024): File {
  const file = new File(['contenido'], 'avatar', { type })
  Object.defineProperty(file, 'size', { value: size })

  return file
}

describe('validateDisplayName', () => {
  it('accepts a normal name and trims it', () => {
    expect(validateDisplayName('Ana Pedal')).toBeNull()
    expect(validateDisplayName('  Ana Pedal  ')).toBeNull()
  })

  it('accepts a two-character name', () => {
    expect(validateDisplayName('Li')).toBeNull()
  })

  it('rejects an empty or whitespace-only name', () => {
    expect(validateDisplayName('')).toBe('El nombre es obligatorio.')
    expect(validateDisplayName('   ')).toBe('El nombre es obligatorio.')
  })

  it('rejects names shorter than two characters', () => {
    expect(validateDisplayName('A')).toBe('El nombre debe tener al menos 2 caracteres.')
  })

  it('rejects names longer than 60 characters', () => {
    expect(validateDisplayName('a'.repeat(61))).toBe(
      'El nombre no puede superar los 60 caracteres.',
    )
  })

  it('accepts a name of exactly 60 characters', () => {
    expect(validateDisplayName('a'.repeat(60))).toBeNull()
  })

  it('rejects HTML tags in the name', () => {
    expect(validateDisplayName('<b>Ana</b>')).toBe('El nombre no puede contener etiquetas HTML.')
  })

  it('rejects control characters in the name', () => {
    const withControl = `Ana${String.fromCharCode(2)}Pedal`
    expect(validateDisplayName(withControl)).toBe('El nombre contiene caracteres no permitidos.')
  })
})

describe('validateAvatarImage', () => {
  it('accepts the shared allowed image types', () => {
    expect(validateAvatarImage(imageOf('image/jpeg'))).toBeNull()
    expect(validateAvatarImage(imageOf('image/webp'))).toBeNull()
  })

  it('rejects disallowed types with the shared message', () => {
    expect(validateAvatarImage(imageOf('image/gif'))).toBe(INVALID_IMAGE_TYPE_MESSAGE)
  })

  it('rejects images above the shared size limit', () => {
    expect(validateAvatarImage(imageOf('image/png', 6 * 1024 * 1024))).toBe(
      'La imagen no puede superar los 5 MB.',
    )
  })
})
