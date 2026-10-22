import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

/**
 * Clave pública del proyecto. Se prefiere la clave publicable (`sb_publishable_…`) y se
 * acepta la clásica `anon` como alternativa; jamás una clave secreta.
 */
const supabasePublicKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * Detecta claves que no deben salir del servidor: el prefijo `sb_secret_` de las claves
 * nuevas y el `role: service_role` de los JWT heredados. Viajar al navegador con la clave
 * secreta anularía RLS para cualquier visitante.
 */
function isServiceRoleKey(key: string): boolean {
  if (key.startsWith('sb_secret_')) return true

  const payload = key.split('.')[1]
  if (!payload) return false

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const claims: unknown = JSON.parse(atob(base64))

    return isRecord(claims) && claims['role'] === 'service_role'
  } catch {
    return false
  }
}

if (!supabaseUrl || !supabasePublicKey) {
  throw new Error('La aplicación no está configurada correctamente.')
}

if (isServiceRoleKey(supabasePublicKey)) {
  throw new Error(
    'La clave de Supabase del entorno es la secreta (service_role). Usa la clave publicable o anon en el cliente.',
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabasePublicKey)
