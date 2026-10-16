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

    it('throws the supabase error when sign up fails', async () => {
      const error = new Error('sign up failed')
      mocks.signUp.mockResolvedValue({ data: { user: null }, error })

      await expect(registerUser(credentials)).rejects.toThrow('sign up failed')
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

    it('throws the supabase error when sign in fails', async () => {
      const error = new Error('invalid credentials')
      mocks.signInWithPassword.mockResolvedValue({ data: { session: null }, error })

      await expect(
        loginUser({ email: credentials.email, password: credentials.password }),
      ).rejects.toThrow('invalid credentials')
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

    it('throws the supabase error when the request fails', async () => {
      const error = new Error('rate limited')
      mocks.resetPasswordForEmail.mockResolvedValue({ data: null, error })

      await expect(requestPasswordReset('a@b.com', '/reset')).rejects.toThrow('rate limited')
    })
  })

  describe('updatePassword', () => {
    it('updates the authenticated user password', async () => {
      mocks.updateUser.mockResolvedValue({ data: null, error: null })

      await updatePassword('nuevaClave123')

      expect(mocks.updateUser).toHaveBeenCalledWith({ password: 'nuevaClave123' })
    })

    it('throws the supabase error when the update fails', async () => {
      const error = new Error('weak password')
      mocks.updateUser.mockResolvedValue({ data: null, error })

      await expect(updatePassword('123')).rejects.toThrow('weak password')
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

    it('throws the supabase error when the session cannot be read', async () => {
      mocks.getSession.mockResolvedValue({ data: { session: null }, error: new Error('offline') })

      await expect(isEmailConfirmed()).rejects.toThrow('offline')
    })
  })

  describe('requestAccountDeletion', () => {
    it('invokes the delete-account edge function', async () => {
      mocks.invoke.mockResolvedValue({ data: null, error: null })

      await requestAccountDeletion()

      expect(mocks.invoke).toHaveBeenCalledWith('delete-account', { method: 'POST' })
    })

    it('throws the supabase error when the invocation fails', async () => {
      const error = new Error('not allowed')
      mocks.invoke.mockResolvedValue({ data: null, error })

      await expect(requestAccountDeletion()).rejects.toThrow('not allowed')
    })
  })
})
