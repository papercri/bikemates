import { describe, expect, it } from 'vitest'
import { PASSWORD_MAX_LENGTH, validatePassword } from './passwordValidator'

describe('validatePassword', () => {
  it('accepts a valid password with letters and numbers', () => {
    expect(validatePassword('pedaleando123')).toBeNull()
  })

  it('accepts a password with accented letters', () => {
    expect(validatePassword('cyclingmálaga1')).toBeNull()
  })

  it('rejects an empty password', () => {
    expect(validatePassword('')).toBe('La contraseña es obligatoria.')
  })

  it('rejects passwords shorter than 8 characters', () => {
    expect(validatePassword('abc1234')).toBe('La contraseña debe tener al menos 8 caracteres.')
  })

  it('rejects passwords longer than 128 characters', () => {
    const long = `a1${'x'.repeat(PASSWORD_MAX_LENGTH)}`
    expect(validatePassword(long)).toBe(
      `La contraseña no puede superar los ${PASSWORD_MAX_LENGTH} caracteres.`,
    )
  })

  it('rejects passwords without a letter', () => {
    expect(validatePassword('12345678')).toBe('La contraseña debe incluir al menos una letra.')
  })

  it('rejects passwords without a number', () => {
    expect(validatePassword('abcdefghi')).toBe('La contraseña debe incluir al menos un número.')
  })

  it('rejects passwords with control characters', () => {
    const withControl = `abcdefg${String.fromCharCode(31)}1`
    expect(validatePassword(withControl)).toBe(
      'La contraseña contiene caracteres de control no permitidos.',
    )
  })
})
