
import { describe, it, expect } from 'vitest'
import { validateRegisterForm } from './registerValidator'
import type { RegisterForm } from './registerValidator'

const validForm: RegisterForm = {
  name: 'Cristiana',
  email: 'ciclista@example.com',
  password: 'bicicleta123',
  confirmPassword: 'bicicleta123',
}

describe('validateRegisterForm', () => {
  it('accepts valid registration data', () => {
    expect(validateRegisterForm(validForm)).toEqual({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    })
  })

  it('requires a name with at least 2 characters', () => {
    const errors = validateRegisterForm({ ...validForm, name: 'A' })

    expect(errors.name).toBe(
      'El nombre debe tener al menos 2 caracteres.',
    )
  })

  it('rejects a name longer than 60 characters', () => {
    const errors = validateRegisterForm({
      ...validForm,
      name: 'A'.repeat(61),
    })

    expect(errors.name).toBe(
      'El nombre no puede superar los 60 caracteres.',
    )
  })

  it('rejects HTML-like tags in the name', () => {
    const errors = validateRegisterForm({
      ...validForm,
      name: '<script>alert(1)</script>',
    })

    expect(errors.name).toBe(
      'El nombre no puede contener etiquetas HTML.',
    )
  })

  it('rejects an invalid email', () => {
    const errors = validateRegisterForm({
      ...validForm,
      email: 'correo-no-valido',
    })

    expect(errors.email).toBe(
      'Introduce un correo electrónico válido.',
    )
  })

  it('requires at least 8 password characters', () => {
    const errors = validateRegisterForm({
      ...validForm,
      password: 'abc1234',
      confirmPassword: 'abc1234',
    })

    expect(errors.password).toBe(
      'La contraseña debe tener al menos 8 caracteres.',
    )
  })

  it('requires a number in the password', () => {
    const errors = validateRegisterForm({
      ...validForm,
      password: 'bicicletasegura',
      confirmPassword: 'bicicletasegura',
    })

    expect(errors.password).toBe(
      'La contraseña debe incluir al menos un número.',
    )
  })

  it('requires a letter in the password', () => {
    const errors = validateRegisterForm({
      ...validForm,
      password: '12345678',
      confirmPassword: '12345678',
    })

    expect(errors.password).toBe(
      'La contraseña debe incluir al menos una letra.',
    )
  })

  it('checks that both passwords match', () => {
    const errors = validateRegisterForm({
      ...validForm,
      confirmPassword: 'otra1234',
    })

    expect(errors.confirmPassword).toBe(
      'Las contraseñas no coinciden.',
    )
  })

  it('accepts apostrophes and accented characters in names', () => {
    const errors = validateRegisterForm({
      ...validForm,
      name: "José O'Connor",
    })

    expect(errors.name).toBe('')
  })
})
