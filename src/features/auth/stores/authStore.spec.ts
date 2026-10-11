
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signOut: vi.fn(),
  unsubscribe: vi.fn(),
}))

vi.mock('@/services/supabase', () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
      signOut: mocks.signOut,
    },
  },
}))

import { useAuthStore } from './authStore'

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())

    mocks.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    mocks.onAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: mocks.unsubscribe,
        },
      },
    })

    mocks.signOut.mockResolvedValue({ error: null })
  })

  it('initializes without an authenticated user', async () => {
    const store = useAuthStore()

    await store.initialize()

    expect(store.isInitialized).toBe(true)
    expect(store.session).toBeNull()
    expect(store.user).toBeNull()
    expect(mocks.getSession).toHaveBeenCalledOnce()
    expect(mocks.onAuthStateChange).toHaveBeenCalledOnce()
  })

  it('does not initialize the session twice', async () => {
    const store = useAuthStore()

    await store.initialize()
    await store.initialize()

    expect(mocks.getSession).toHaveBeenCalledOnce()
    expect(mocks.onAuthStateChange).toHaveBeenCalledOnce()
  })

  it('signs out through Supabase', async () => {
    const store = useAuthStore()

    await store.logout()

    expect(mocks.signOut).toHaveBeenCalledOnce()
  })

  it('propagates errors when signing out fails', async () => {
    const store = useAuthStore()
    const authError = new Error('Logout failed')

    mocks.signOut.mockResolvedValue({ error: authError })

    await expect(store.logout()).rejects.toThrow('Logout failed')
  })
})
