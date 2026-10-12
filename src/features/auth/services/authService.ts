import { supabase } from '@/services/supabase'

interface RegisterCredentials {
  name: string
  email: string
  password: string
}
interface LoginCredentials {
  email: string
  password: string
}

export async function registerUser(credentials: RegisterCredentials) {
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email.trim(),
    password: credentials.password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/confirm`,
      data: {
        display_name: credentials.name.trim(),
      },
    },
  })

  if (error) {
    throw error
  }

  if (data.user && data.user.identities?.length === 0) {
    throw new Error(
      'Email ya registrado. Por favor, inicia sesión o utiliza otro correo electrónico.',
    )
  }

  return data
}


export async function loginUser(credentials: LoginCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email.trim(),
    password: credentials.password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function requestPasswordReset(
  email: string,
  redirectTo: string,
): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim(),
    { redirectTo },
  )

  if (error) {
    throw error
  }
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    throw error
  }
}
export async function requestAccountDeletion(): Promise<void> {
  const { error } = await supabase.functions.invoke('delete-account', {
    method: 'POST',
  })

  if (error) {
    throw error
  }
}