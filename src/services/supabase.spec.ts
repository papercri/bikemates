import { afterEach, describe, expect, it, vi } from 'vitest'

async function importClient(): Promise<typeof import('./supabase')> {
  vi.resetModules()

  return import('./supabase')
}

describe('supabase client', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('fails fast at startup when the environment is incomplete', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')

    await expect(importClient()).rejects.toThrow('Falta la configuración de Supabase.')
  })

  it('fails fast when only the public key is missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test-project.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')

    await expect(importClient()).rejects.toThrow('Falta la configuración de Supabase.')
  })

  it('creates a scoped client with the database and auth APIs when configured', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test-project.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key')

    const { supabase } = await importClient()

    expect(typeof supabase.from).toBe('function')
    expect(typeof supabase.auth.signInWithPassword).toBe('function')
    expect(typeof supabase.rpc).toBe('function')
  })
})
