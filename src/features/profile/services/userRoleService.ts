import { supabase } from '@/services/supabase'

export type UserRole = 'user' | 'admin'

/** Rol del usuario con sesión activa, leído de su fila de perfil. */
export async function getCurrentUserRole(): Promise<UserRole> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return 'user'
  }

  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  return data?.role === 'admin' ? 'admin' : 'user'
}
