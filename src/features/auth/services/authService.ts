import { supabase } from '@/services/supabase'
import { describeAuthError } from '@/features/auth/utils/authErrorMessages'
import { canUseReservedAdminName, isReservedAdminName } from '@/utils/adminAccount'

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
  const name = credentials.name.trim()
  const email = credentials.email.trim()

  if (isReservedAdminName(name) && !canUseReservedAdminName(email)) {
    throw new Error('Solo la cuenta administradora puede usar ese nombre.')
  }

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
    throw new Error(describeAuthError(error))
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
    throw new Error(describeAuthError(error))
  }

  return data
}

export async function requestPasswordReset(email: string, redirectTo: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })

  if (error) {
    throw new Error(describeAuthError(error))
  }
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    throw new Error(describeAuthError(error))
  }
}

/**
 * Verifica la contraseña actual del usuario con sesión activa, antes de
 * permitir un cambio de contraseña desde el perfil. Devuelve `false` cuando
 * la contraseña no coincide.
 */
export async function verifyCurrentUserPassword(password: string): Promise<boolean> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user?.email) {
    throw new Error('No se ha podido verificar tu identidad.')
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  })

  return !error
}

/** Verifica un token de recuperación. Devuelve `false` si el enlace ya no es válido. */
export async function verifyRecoveryToken(tokenHash: string): Promise<boolean> {
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'recovery',
  })

  return !error
}

/** Indica si la sesión actual pertenece a un email ya confirmado. */
export async function isEmailConfirmed(): Promise<boolean> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    throw new Error(describeAuthError(error))
  }

  return Boolean(session?.user.email_confirmed_at)
}
export async function requestAccountDeletion(): Promise<void> {
  const { error } = await supabase.functions.invoke('delete-account', {
    method: 'POST',
  })

  if (error) {
    throw new Error(describeAuthError(error))
  }
}
