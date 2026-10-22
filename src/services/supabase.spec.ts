import { afterEach, describe, expect, it, vi } from 'vitest'

async function importClient(): Promise<typeof import('./supabase')> {
  vi.resetModules()

  return import('./supabase')
}

/** JWT de tres partes con las claims indicadas, para simular claves heredadas. */
function legacyJwt(claims: Record<string, unknown>): string {
  const encode = (value: Record<string, unknown>): string =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(claims)}.firma`
}

describe('supabase client', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('fails fast at startup when the environment is incomplete', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')

    await expect(importClient()).rejects.toThrow('La aplicación no está configurada correctamente.')
  })

  it('fails fast when only the public key is missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test-project.supabase.co')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')

    await expect(importClient()).rejects.toThrow('La aplicación no está configurada correctamente.')
  })

  it('creates a scoped client with the database and auth APIs when configured', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test-project.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key')

    const { supabase } = await importClient()

    expect(typeof supabase.from).toBe('function')
    expect(typeof supabase.auth.signInWithPassword).toBe('function')
    expect(typeof supabase.rpc).toBe('function')
  })

  it('creates a client when only the publishable key is set', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test-project.supabase.co')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')

    const { supabase } = await importClient()

    expect(typeof supabase.from).toBe('function')
  })

  it('accepts the legacy anon JWT as a public key', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test-project.supabase.co')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', legacyJwt({ role: 'anon' }))

    const { supabase } = await importClient()

    expect(typeof supabase.from).toBe('function')
  })

  it('refuses to start when the environment holds the secret service-role key', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test-project.supabase.co')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', legacyJwt({ role: 'service_role' }))

    await expect(importClient()).rejects.toThrow('es la secreta (service_role)')
  })

  it('refuses to start with the new-style secret key', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test-project.supabase.co')
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_secret_test_123')

    await expect(importClient()).rejects.toThrow('es la secreta (service_role)')
  })
})
