import { supabase } from '@/services/supabase'

interface RegisterCredentials {
  name: string
  email: string
  password: string
}

export async function registerUser(credentials: RegisterCredentials) {
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email.trim(),
    password: credentials.password,
    options: {
      data: {
        display_name: credentials.name.trim(),
      },
    },
  })

  if (error) {
    throw error
  }

  return data
}

interface LoginCredentials {
  email: string
  password: string
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

export async function requestPasswordReset(email: string, redirectTo: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })

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
