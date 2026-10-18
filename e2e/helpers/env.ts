import process from 'node:process'

let loaded = false

/**
 * Carga `.env.local` una sola vez y deriva el project ref de Supabase a partir
 * de `VITE_SUPABASE_URL`. El ref define la clave de almacenamiento de sesión
 * (`sb-<ref>-auth-token`) que la app usa en `localStorage`.
 */
export function loadAppEnv(): { supabaseUrl: string; projectRef: string } {
  if (!loaded) {
    try {
      process.loadEnvFile('.env.local')
    } catch {
      // .env.local puede no existir (CI); las variables ya inyectadas bastan.
    }
    loaded = true
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL ?? ''

  if (!supabaseUrl) {
    throw new Error(
      'Falta VITE_SUPABASE_URL. Define la variable en .env.local antes de ejecutar los E2E.',
    )
  }

  const projectRef = new URL(supabaseUrl).hostname.split('.')[0]

  if (!projectRef) {
    throw new Error(`No se ha podido derivar el project ref de ${supabaseUrl}.`)
  }

  return { supabaseUrl, projectRef }
}

export function authStorageKey(): string {
  return `sb-${loadAppEnv().projectRef}-auth-token`
}
