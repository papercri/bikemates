import { describe, it, expect } from 'vitest'
import { validateRegisterForm } from './registerValidator'
import type { RegisterForm } from './registerValidator'

const validForm: RegisterForm = {
  name: 'Cristiana',
  email: 'ciclista@example.com',
  password: 'bicicleta123',
  confirmPassword: 'bicicleta123',
  acceptedRules: true,
}

describe('validateRegisterForm', () => {
  it('accepts valid registration data', () => {
    expect(validateRegisterForm(validForm)).toEqual({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptedRules: '',
    })
  })

  it('requires accepting the community rules and the privacy policy', () => {
    const errors = validateRegisterForm({ ...validForm, acceptedRules: false })

    expect(errors.acceptedRules).toBe(
      'Debes aceptar las normas de la comunidad y la política de privacidad.',
    )
  })

  it('requires a name with at least 2 characters', () => {
    const errors = validateRegisterForm({ ...validForm, name: 'A' })

    expect(errors.name).toBe('El nombre debe tener al menos 2 caracteres.')
  })

  it('rejects a name longer than 60 characters', () => {
    const errors = validateRegisterForm({
      ...validForm,
      name: 'A'.repeat(61),
    })

    expect(errors.name).toBe('El nombre no puede superar los 60 caracteres.')
  })

  it('rejects HTML-like tags in the name', () => {
    const errors = validateRegisterForm({
      ...validForm,
      name: '<script>alert(1)</script>',
    })

    expect(errors.name).toBe('El nombre no puede contener etiquetas HTML.')
  })

  it('rejects an invalid email', () => {
    const errors = validateRegisterForm({
      ...validForm,
      email: 'correo-no-valido',
    })

    expect(errors.email).toBe('Introduce un correo electrónico válido.')
  })

  it('requires at least 8 password characters', () => {
    const errors = validateRegisterForm({
      ...validForm,
      password: 'abc1234',
      confirmPassword: 'abc1234',
    })

    expect(errors.password).toBe('La contraseña debe tener al menos 8 caracteres.')
  })

  it('requires a number in the password', () => {
    const errors = validateRegisterForm({
      ...validForm,
      password: 'bicicletasegura',
      confirmPassword: 'bicicletasegura',
    })

    expect(errors.password).toBe('La contraseña debe incluir al menos un número.')
  })

  it('requires a letter in the password', () => {
    const errors = validateRegisterForm({
      ...validForm,
      password: '12345678',
      confirmPassword: '12345678',
    })

    expect(errors.password).toBe('La contraseña debe incluir al menos una letra.')
  })

  it('checks that both passwords match', () => {
    const errors = validateRegisterForm({
      ...validForm,
      confirmPassword: 'otra1234',
    })

    expect(errors.confirmPassword).toBe('Las contraseñas no coinciden.')
  })

  it('accepts apostrophes and accented characters in names', () => {
    const errors = validateRegisterForm({
      ...validForm,
      name: "José O'Connor",
    })

    expect(errors.name).toBe('')
  })
})

describe('validateRegisterForm edge cases', () => {
  const NUL = String.fromCharCode(0)
  const TAB = String.fromCharCode(9)

  it('requires a name when it is empty or only whitespace', () => {
    expect(validateRegisterForm({ ...validForm, name: '   ' }).name).toBe(
      'El nombre es obligatorio.',
    )
  })

  it('rejects control characters in the name', () => {
    const errors = validateRegisterForm({ ...validForm, name: `Cris${NUL}tiana` })

    expect(errors.name).toBe('El nombre contiene caracteres no permitidos.')
  })

  it('requires an email when it is empty', () => {
    expect(validateRegisterForm({ ...validForm, email: '   ' }).email).toBe(
      'El correo electrónico es obligatorio.',
    )
  })

  it('rejects control characters in the email', () => {
    const errors = validateRegisterForm({ ...validForm, email: `ciclista@${TAB}example.com` })

    expect(errors.email).toBe('El correo contiene caracteres no permitidos.')
  })

  it('rejects emails longer than 254 characters', () => {
    const longEmail = `${'a'.repeat(250)}@example.com`
    const errors = validateRegisterForm({ ...validForm, email: longEmail })

    expect(longEmail.length).toBeGreaterThan(254)
    expect(errors.email).toBe('Introduce un correo electrónico válido.')
  })

  it('requires a password when it is empty', () => {
    const errors = validateRegisterForm({ ...validForm, password: '', confirmPassword: '' })

    expect(errors.password).toBe('La contraseña es obligatoria.')
    expect(errors.confirmPassword).toBe('Confirma tu contraseña.')
  })

  it('rejects passwords longer than 128 characters', () => {
    const longPassword = `a1${'x'.repeat(127)}`
    const errors = validateRegisterForm({
      ...validForm,
      password: longPassword,
      confirmPassword: longPassword,
    })

    expect(longPassword.length).toBeGreaterThan(128)
    expect(errors.password).toBe('La contraseña no puede superar los 128 caracteres.')
  })

  it('rejects control characters in the password', () => {
    const password = `bicicleta${NUL}123`
    const errors = validateRegisterForm({ ...validForm, password, confirmPassword: password })

    expect(errors.password).toBe('La contraseña contiene caracteres de control no permitidos.')
  })

  it('reports every invalid field at the same time', () => {
    const errors = validateRegisterForm({
      name: '',
      email: 'no-es-un-correo',
      password: 'corta',
      confirmPassword: 'distinta',
      acceptedRules: true,
    })

    expect(errors).toEqual({
      name: 'El nombre es obligatorio.',
      email: 'Introduce un correo electrónico válido.',
      password: 'La contraseña debe tener al menos 8 caracteres.',
      confirmPassword: 'Las contraseñas no coinciden.',
      acceptedRules: '',
    })
  })

  it('trims the name before validating its length', () => {
    const errors = validateRegisterForm({ ...validForm, name: '  A  ' })

    expect(errors.name).toBe('El nombre debe tener al menos 2 caracteres.')
  })
})
