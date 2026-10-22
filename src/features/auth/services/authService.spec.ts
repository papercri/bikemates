import { beforeEach, describe, expect, it, vi } from 'vitest'

interface SignUpOptions {
  email: string
  password: string
  options: { emailRedirectTo: string; data: { display_name: string } }
}

interface AuthResult<Data> {
  data: Data
  error: Error | null
}

const mocks = vi.hoisted(() => ({
  signUp:
    vi.fn<
      (options: SignUpOptions) => Promise<AuthResult<{ user: { identities: unknown[] } | null }>>
    >(),
  signInWithPassword:
    vi.fn<
      (credentials: {
        email: string
        password: string
      }) => Promise<AuthResult<{ session: { user: { id: string } } | null }>>
    >(),
  resetPasswordForEmail:
    vi.fn<(email: string, options: { redirectTo: string }) => Promise<AuthResult<null>>>(),
  updateUser: vi.fn<(payload: { password: string }) => Promise<AuthResult<null>>>(),
  invoke: vi.fn<(name: string, options: { method: string }) => Promise<AuthResult<null>>>(),
  verifyOtp: vi.fn<(payload: { token_hash: string; type: string }) => Promise<AuthResult<null>>>(),
  getSession:
    vi.fn<
      () => Promise<AuthResult<{ session: { user: { email_confirmed_at: string | null } } | null }>>
    >(),
  getUser: vi.fn<() => Promise<AuthResult<{ user: { email: string | null } | null }>>>(),
}))

vi.mock('@/services/supabase', () => ({
  supabase: {
    auth: {
      signUp: mocks.signUp,
      signInWithPassword: mocks.signInWithPassword,
      resetPasswordForEmail: mocks.resetPasswordForEmail,
      updateUser: mocks.updateUser,
      verifyOtp: mocks.verifyOtp,
      getSession: mocks.getSession,
      getUser: mocks.getUser,
    },
    functions: {
      invoke: mocks.invoke,
    },
  },
}))

import {
  isEmailConfirmed,
  loginUser,
  registerUser,
  requestAccountDeletion,
  requestPasswordReset,
  updatePassword,
  verifyCurrentUserPassword,
  verifyRecoveryToken,
} from './authService'

const credentials = {
  name: '  Cristiana  ',
  email: '  ciclista@example.com  ',
  password: 'bicicleta123',
}

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('registerUser', () => {
    it('sends trimmed credentials and the display name as metadata', async () => {
      mocks.signUp.mockResolvedValue({ data: { user: { identities: [{}] } }, error: null })

      await registerUser(credentials)

      expect(mocks.signUp).toHaveBeenCalledWith({
        email: 'ciclista@example.com',
        password: 'bicicleta123',
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: { display_name: 'Cristiana' },
        },
      })
    })

    it('returns the supabase payload on success', async () => {
      const data = { user: { identities: [{}] } }
      mocks.signUp.mockResolvedValue({ data, error: null })

      await expect(registerUser(credentials)).resolves.toBe(data)
    })

    it('translates the sign up error into a user-facing message', async () => {
      const error = new Error('User already registered')
      mocks.signUp.mockResolvedValue({ data: { user: null }, error })

      await expect(registerUser(credentials)).rejects.toThrow(
        'Ya existe una cuenta con ese correo. Inicia sesión o prueba con otro.',
      )
    })

    it('rejects when the email is already registered', async () => {
      mocks.signUp.mockResolvedValue({ data: { user: { identities: [] } }, error: null })

      await expect(registerUser(credentials)).rejects.toThrow(
        'Email ya registrado. Por favor, inicia sesión o utiliza otro correo electrónico.',
      )
    })
  })

  describe('loginUser', () => {
    it('signs in with trimmed credentials', async () => {
      const data = { session: { user: { id: '1' } } }
      mocks.signInWithPassword.mockResolvedValue({ data, error: null })

      await expect(
        loginUser({ email: credentials.email, password: credentials.password }),
      ).resolves.toBe(data)

      expect(mocks.signInWithPassword).toHaveBeenCalledWith({
        email: 'ciclista@example.com',
        password: 'bicicleta123',
      })
    })

    it('translates the sign in error into a user-facing message', async () => {
      const error = new Error('Invalid login credentials')
      mocks.signInWithPassword.mockResolvedValue({ data: { session: null }, error })

      await expect(
        loginUser({ email: credentials.email, password: credentials.password }),
      ).rejects.toThrow('El correo o la contraseña no son correctos.')
    })
  })

  describe('requestPasswordReset', () => {
    it('requests the reset with a trimmed email and the redirect target', async () => {
      mocks.resetPasswordForEmail.mockResolvedValue({ data: null, error: null })

      await requestPasswordReset('  ciclista@example.com  ', 'https://example.com/reset')

      expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith('ciclista@example.com', {
        redirectTo: 'https://example.com/reset',
      })
    })

    it('translates the reset request error into a user-facing message', async () => {
      const error = new Error('rate limited')
      mocks.resetPasswordForEmail.mockResolvedValue({ data: null, error })

      await expect(requestPasswordReset('a@b.com', '/reset')).rejects.toThrow(
        'Demasiados intentos. Espera unos minutos y vuelve a probar.',
      )
    })
  })

  describe('updatePassword', () => {
    it('updates the authenticated user password', async () => {
      mocks.updateUser.mockResolvedValue({ data: null, error: null })

      await updatePassword('nuevaClave123')

      expect(mocks.updateUser).toHaveBeenCalledWith({ password: 'nuevaClave123' })
    })

    it('translates the password update error into a user-facing message', async () => {
      const error = new Error('weak password')
      mocks.updateUser.mockResolvedValue({ data: null, error })

      await expect(updatePassword('123')).rejects.toThrow(
        'La contraseña no cumple los requisitos. Prueba con otra.',
      )
    })
  })

  describe('verifyRecoveryToken', () => {
    it('verifies the recovery token hash', async () => {
      mocks.verifyOtp.mockResolvedValue({ data: null, error: null })

      await expect(verifyRecoveryToken('abc123')).resolves.toBe(true)

      expect(mocks.verifyOtp).toHaveBeenCalledWith({
        token_hash: 'abc123',
        type: 'recovery',
      })
    })

    it('returns false when the link is no longer valid', async () => {
      mocks.verifyOtp.mockResolvedValue({ data: null, error: new Error('expired') })

      await expect(verifyRecoveryToken('abc123')).resolves.toBe(false)
    })
  })

  describe('isEmailConfirmed', () => {
    it('returns true when the session belongs to a confirmed email', async () => {
      mocks.getSession.mockResolvedValue({
        data: { session: { user: { email_confirmed_at: '2026-01-01' } } },
        error: null,
      })

      await expect(isEmailConfirmed()).resolves.toBe(true)
    })

    it('returns false when the email is still unconfirmed', async () => {
      mocks.getSession.mockResolvedValue({
        data: { session: { user: { email_confirmed_at: null } } },
        error: null,
      })

      await expect(isEmailConfirmed()).resolves.toBe(false)
    })

    it('translates the session error into a user-facing message', async () => {
      mocks.getSession.mockResolvedValue({ data: { session: null }, error: new Error('offline') })

      await expect(isEmailConfirmed()).rejects.toThrow(
        'No se ha podido completar la operación. Inténtalo de nuevo.',
      )
    })
  })

  describe('verifyCurrentUserPassword', () => {
    it('returns true when the current password is correct', async () => {
      mocks.getUser.mockResolvedValue({
        data: { user: { email: 'ana@example.com' } },
        error: null,
      })
      mocks.signInWithPassword.mockResolvedValue({
        data: { session: { user: { id: 'u1' } } },
        error: null,
      })

      await expect(verifyCurrentUserPassword('pedaleando123')).resolves.toBe(true)

      expect(mocks.signInWithPassword).toHaveBeenCalledWith({
        email: 'ana@example.com',
        password: 'pedaleando123',
      })
    })

    it('returns false when the current password does not match', async () => {
      mocks.getUser.mockResolvedValue({
        data: { user: { email: 'ana@example.com' } },
        error: null,
      })
      mocks.signInWithPassword.mockResolvedValue({
        data: { session: null },
        error: new Error('bad'),
      })

      await expect(verifyCurrentUserPassword('otracosa1')).resolves.toBe(false)
    })

    it('throws when the current user has no email', async () => {
      mocks.getUser.mockResolvedValue({ data: { user: { email: null } }, error: null })

      await expect(verifyCurrentUserPassword('pedaleando123')).rejects.toThrow(
        'No se ha podido verificar tu identidad.',
      )
      expect(mocks.signInWithPassword).not.toHaveBeenCalled()
    })
  })

  describe('requestAccountDeletion', () => {
    it('invokes the delete-account edge function', async () => {
      mocks.invoke.mockResolvedValue({ data: null, error: null })

      await requestAccountDeletion()

      expect(mocks.invoke).toHaveBeenCalledWith('delete-account', { method: 'POST' })
    })

    it('translates the function error into a user-facing message', async () => {
      const error = new Error('not allowed')
      mocks.invoke.mockResolvedValue({ data: null, error })

      await expect(requestAccountDeletion()).rejects.toThrow(
        'No se ha podido completar la operación. Inténtalo de nuevo.',
      )
    })
  })
})
