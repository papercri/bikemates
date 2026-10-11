import { describe, it, expect } from 'vitest'
import { validateRegisterForm } from './registerValidator'

describe('validateRegisterForm', () => {
  it('should return an error when the name is too short', () => {
    const form = {
      name: 'A',
      email: 'ciclista@example.com',
      password: 'bicicleta123',
      confirmPassword: 'bicicleta123',
    }

    const errors = validateRegisterForm(form)

    expect(errors.name).toBe('El nombre debe tener al menos 2 caracteres.')
    expect(errors.email).toBe('')
    expect(errors.password).toBe('')
    expect(errors.confirmPassword).toBe('')
  })
})
